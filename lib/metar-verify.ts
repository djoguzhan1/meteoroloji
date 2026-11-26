import { ATMOS_HTTP_USER_AGENT, parseMetarTenthDegreeGroup } from "./bursa-mesh";
import type { MetarObservation, MetarWxFlags } from "./weather-types";

export type RawMetarRecord = {
  icaoId: string;
  name?: string;
  lat: number;
  lon: number;
  elev?: number;
  obsTime: number; // unix seconds
  reportTime?: string;
  rawOb?: string;
  temp?: number | null;
  dewp?: number | null;
  wdir?: number | string | null;
  wspd?: number | null; // knots
  wgst?: number | null; // knots
  altim?: number | null; // hPa (QNH)
  slp?: number | null; // hPa (sea level pressure)
  visib?: number | string | null; // statute miles
  wxString?: string | null;
};

export type MetarNetworkStation = {
  station: MetarObservation;
  history: RawMetarRecord[];
};

/**
 * WMO / ICAO METAR hava hadisesi kodunu (wxString: RA, +RA, TSRA, SHRA, DZ, SN, GR, SQ, FG...)
 * fiziksel doğrulama bayraklarına ayrıştırır.
 */
export function parseMetarWxTokens(wxString: string | null | undefined): MetarWxFlags {
  const raw = (wxString ?? "").toUpperCase();
  if (!raw.trim()) {
    return {
      hasPrecip: false,
      heavyPrecip: false,
      isThunderstorm: false,
      hasHail: false,
      hasSnow: false,
      hasSquall: false,
      hasFog: false
    };
  }
  const tokens = raw.split(/\s+/).filter(Boolean);
  let hasPrecip = false;
  let heavyPrecip = false;
  let isThunderstorm = false;
  let hasHail = false;
  let hasSnow = false;
  let hasSquall = false;
  let hasFog = false;

  for (const tok of tokens) {
    const isVicinity = tok.startsWith("VC");
    if (tok.includes("TS")) isThunderstorm = true;
    if (tok.includes("GR") || tok.includes("GS")) {
      hasHail = true;
      if (!isVicinity) hasPrecip = true;
    }
    if (tok.includes("SN") || tok.includes("SG") || tok.includes("PL")) {
      hasSnow = true;
      if (!isVicinity) hasPrecip = true;
    }
    if (tok.includes("SQ") || tok.includes("FC")) hasSquall = true;
    if (tok.includes("FG")) hasFog = true;
    if (
      !isVicinity &&
      (tok.includes("RA") || tok.includes("DZ") || tok.includes("SH"))
    ) {
      hasPrecip = true;
      if (tok.startsWith("+")) heavyPrecip = true;
    }
  }

  return {
    hasPrecip,
    heavyPrecip,
    isThunderstorm,
    hasHail,
    hasSnow,
    hasSquall,
    hasFog
  };
}

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseVisibilityKm(visib: number | string | null | undefined): number | null {
  if (typeof visib === "number" && Number.isFinite(visib)) {
    return Number((visib * 1.60934).toFixed(1));
  }
  if (typeof visib === "string") {
    const num = parseFloat(visib.replace("+", ""));
    if (Number.isFinite(num)) return Number((num * 1.60934).toFixed(1));
  }
  return null;
}

type MetarNetworkCacheEntry = {
  expiresAt: number;
  stations: MetarNetworkStation[];
};

const metarCache = new Map<string, MetarNetworkCacheEntry>();
const METAR_TTL_MS = 5 * 60 * 1000;

function buildObservation(
  latest: RawMetarRecord,
  distKm: number
): MetarObservation {
  const obsDate = new Date(latest.obsTime * 1000);
  const ageMinutes = Math.max(0, Math.round((Date.now() - obsDate.getTime()) / 60000));
  const wxString = latest.wxString ? String(latest.wxString) : null;

  return {
    icaoId: latest.icaoId,
    stationName: latest.name || latest.icaoId,
    distanceKm: Number(distKm.toFixed(1)),
    elevationM: Math.round(Number(latest.elev ?? 0)),
    obsTimeIso: obsDate.toISOString(),
    ageMinutes,
    rawOb: String(latest.rawOb ?? ""),
    tempC:
      typeof latest.temp === "number" && Number.isFinite(latest.temp)
        ? Number(latest.temp.toFixed(1))
        : null,
    dewPointC:
      typeof latest.dewp === "number" && Number.isFinite(latest.dewp)
        ? Number(latest.dewp.toFixed(1))
        : null,
    windSpeedKmh:
      typeof latest.wspd === "number" && Number.isFinite(latest.wspd)
        ? Number((latest.wspd * 1.852).toFixed(1))
        : null,
    windGustKmh:
      typeof latest.wgst === "number" && Number.isFinite(latest.wgst)
        ? Number((latest.wgst * 1.852).toFixed(1))
        : null,
    windDirectionDeg:
      typeof latest.wdir === "number" && Number.isFinite(latest.wdir)
        ? Math.round(latest.wdir)
        : null,
    qnhHpa:
      typeof latest.slp === "number" && Number.isFinite(latest.slp)
        ? Number(latest.slp.toFixed(1))
        : typeof latest.altim === "number" && Number.isFinite(latest.altim)
          ? Number(latest.altim.toFixed(1))
          : null,
    visibilityKm: parseVisibilityKm(latest.visib),
    wxString,
    wxFlags: parseMetarWxTokens(wxString)
  };
}

/**
 * 48 Saatlik Çoklu-İstasyon Fiziksel METAR Ağı (<= 85 km içindeki en yakın 4 ICAO istasyonu).
 * Tek bir havalimanının lokal mikro-klima sapmasını Cressman/IDW ağıyla elimine eder.
 */
export async function fetchMetarNetworkHistory(
  lat: number,
  lon: number,
  maxStations = 4,
  maxRadiusKm = 85
): Promise<MetarNetworkStation[]> {
  const cacheKey = `${(Math.round(lat * 5) / 5).toFixed(1)},${(Math.round(lon * 5) / 5).toFixed(1)}`;
  const cached = metarCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.stations;
  }

  const queryBox = async (deltaDeg: number): Promise<RawMetarRecord[]> => {
    const minLat = Math.max(-85, lat - deltaDeg).toFixed(3);
    const maxLat = Math.min(85, lat + deltaDeg).toFixed(3);
    const minLon = Math.max(-180, lon - deltaDeg * 1.3).toFixed(3);
    const maxLon = Math.min(180, lon + deltaDeg * 1.3).toFixed(3);
    const url = `https://aviationweather.gov/api/data/metar?bbox=${minLat},${minLon},${maxLat},${maxLon}&hours=48&format=json`;
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
      headers: { "User-Agent": ATMOS_HTTP_USER_AGENT }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as RawMetarRecord[]) : [];
  };

  try {
    let records = await queryBox(0.85);
    if (records.length === 0) {
      records = await queryBox(1.35);
    }

    if (records.length === 0) {
      metarCache.set(cacheKey, {
        expiresAt: Date.now() + METAR_TTL_MS,
        stations: []
      });
      return [];
    }

    const grouped = new Map<string, RawMetarRecord[]>();
    for (const r of records) {
      if (!r.icaoId || typeof r.lat !== "number" || typeof r.lon !== "number") continue;
      const precise = parseMetarTenthDegreeGroup(r.rawOb);
      if (precise) {
        r.temp = precise.tempC;
        if (precise.dewPointC !== null) r.dewp = precise.dewPointC;
      }
      const list = grouped.get(r.icaoId) ?? [];
      list.push(r);
      grouped.set(r.icaoId, list);
    }

    const ranked: Array<{ icao: string; dist: number; list: RawMetarRecord[] }> = [];
    for (const [icao, list] of grouped.entries()) {
      const sample = list[0];
      const dist = haversineKm(lat, lon, sample.lat, sample.lon);
      if (dist <= maxRadiusKm && list.length >= 3) {
        ranked.push({
          icao,
          dist,
          list: list.sort((a, b) => b.obsTime - a.obsTime)
        });
      }
    }

    ranked.sort((a, b) => a.dist - b.dist);
    const stations: MetarNetworkStation[] = ranked
      .slice(0, maxStations)
      .map((entry) => ({
        station: buildObservation(entry.list[0], entry.dist),
        history: entry.list
      }));

    metarCache.set(cacheKey, {
      expiresAt: Date.now() + METAR_TTL_MS,
      stations
    });

    return stations;
  } catch {
    return [];
  }
}
