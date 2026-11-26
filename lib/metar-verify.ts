import { ATMOS_HTTP_USER_AGENT, parseMetarTenthDegreeGroup } from "./bursa-mesh";
import type {
  LiveVerificationReport,
  MetarObservation,
  MetarWxFlags,
  ModelVerificationRow,
  SevenModelKey
} from "./weather-types";

export const SEVEN_MODEL_META: Record<
  SevenModelKey,
  { apiModel: string; label: string; shortLabel: string; resolution: string; color: string }
> = {
  ecmwfIfs: {
    apiModel: "ecmwf_ifs",
    label: "ECMWF IFS 9km",
    shortLabel: "ECMWF IFS",
    resolution: "9 km HRES",
    color: "#38bdf8"
  },
  ecmwfAifs: {
    apiModel: "ecmwf_aifs025_single",
    label: "ECMWF AIFS v1",
    shortLabel: "AIFS AI",
    resolution: "0.25° AI",
    color: "#a78bfa"
  },
  icon: {
    apiModel: "icon_seamless",
    label: "DWD ICON-EU/D2",
    shortLabel: "ICON-EU",
    resolution: "2–7 km",
    color: "#10b981"
  },
  ukmo: {
    apiModel: "ukmo_seamless",
    label: "UKMO Unified",
    shortLabel: "UKMO 10km",
    resolution: "2–10 km",
    color: "#f472b6"
  },
  meteofrance: {
    apiModel: "meteofrance_seamless",
    label: "Météo-France AROME",
    shortLabel: "AROME/ARP",
    resolution: "1.3–10 km",
    color: "#22d3ee"
  },
  gfs: {
    apiModel: "gfs_seamless",
    label: "NOAA GFS",
    shortLabel: "NOAA GFS",
    resolution: "3–13 km",
    color: "#f59e0b"
  },
  gem: {
    apiModel: "gem_seamless",
    label: "ECCC GEM",
    shortLabel: "GEM Global",
    resolution: "15 km",
    color: "#fb7185"
  }
};

export const SEVEN_MODEL_KEYS: SevenModelKey[] = [
  "ecmwfIfs",
  "ecmwfAifs",
  "icon",
  "ukmo",
  "meteofrance",
  "gfs",
  "gem"
];

/** Geriye dönük uyumluluk için eski isimlendirmeler korunur */
export const FIVE_MODEL_META = SEVEN_MODEL_META;
export const FIVE_MODEL_KEYS = SEVEN_MODEL_KEYS;

/**
 * WMO LC-DNV & ECMWF 2025/2026 Operasyonel Skor Kartlarına dayalı 7-Model ön ağırlıkları (priors).
 * Yakında fiziksel METAR ağı varsa canlı 48s UBRMSE² + Yağış Brier kanıtıyla güncellenir.
 */
export const WMO_PRIOR_WEIGHTS: Record<
  "temperature" | "pressure" | "wind" | "precipitation",
  Record<SevenModelKey, number>
> = {
  temperature: {
    ecmwfIfs: 0.22,
    ecmwfAifs: 0.24,
    icon: 0.17,
    ukmo: 0.13,
    meteofrance: 0.11,
    gfs: 0.07,
    gem: 0.06
  },
  pressure: {
    ecmwfIfs: 0.25,
    ecmwfAifs: 0.2,
    ukmo: 0.18,
    icon: 0.12,
    meteofrance: 0.1,
    gfs: 0.08,
    gem: 0.07
  },
  wind: {
    icon: 0.23,
    ecmwfIfs: 0.2,
    meteofrance: 0.16,
    ukmo: 0.15,
    gfs: 0.11,
    ecmwfAifs: 0.09,
    gem: 0.06
  },
  precipitation: {
    icon: 0.24,
    ecmwfIfs: 0.22,
    meteofrance: 0.19,
    ukmo: 0.14,
    ecmwfAifs: 0.08,
    gfs: 0.07,
    gem: 0.06
  }
};

/**
 * Orta vade (3–7 gün) sinoptik ağırlıklar: ECMWF IFS + AIFS AI liderliği artar.
 */
export const MEDIUM_RANGE_PRIOR_WEIGHTS: Record<
  "temperature" | "pressure" | "wind" | "precipitation",
  Record<SevenModelKey, number>
> = {
  temperature: {
    ecmwfIfs: 0.28,
    ecmwfAifs: 0.3,
    ukmo: 0.13,
    icon: 0.11,
    gfs: 0.07,
    meteofrance: 0.06,
    gem: 0.05
  },
  pressure: {
    ecmwfIfs: 0.3,
    ecmwfAifs: 0.25,
    ukmo: 0.17,
    icon: 0.1,
    gfs: 0.07,
    meteofrance: 0.06,
    gem: 0.05
  },
  wind: {
    ecmwfIfs: 0.26,
    icon: 0.2,
    ukmo: 0.16,
    ecmwfAifs: 0.14,
    meteofrance: 0.1,
    gfs: 0.08,
    gem: 0.06
  },
  precipitation: {
    ecmwfIfs: 0.28,
    icon: 0.2,
    meteofrance: 0.15,
    ukmo: 0.14,
    ecmwfAifs: 0.1,
    gfs: 0.07,
    gem: 0.06
  }
};

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
    // VC (vicinity) istasyon üstünde değil yakında anlamına gelir -> sadece gök gürültüsünde not düşülür
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

/**
 * Düzenlileştirilmiş Ters-Hata² (Inverse-Variance / Inverse-RMSE²) Ağırlıklandırma:
 * w_i = [pi_i / (err_i^2 + sigma0^2)] / sum(...)
 */
export function computeInverseRmseWeights(
  rmses: Partial<Record<SevenModelKey, number | null>>,
  priors: Record<SevenModelKey, number>,
  sigma0: number
): Record<SevenModelKey, number> {
  const raw = {} as Record<SevenModelKey, number>;
  let sum = 0;

  for (const key of SEVEN_MODEL_KEYS) {
    const rmse = rmses[key];
    const prior = priors[key] ?? 0.05;
    const score =
      typeof rmse === "number" && Number.isFinite(rmse) && rmse >= 0
        ? prior / (rmse * rmse + sigma0 * sigma0)
        : prior / (sigma0 * sigma0 * 4);
    raw[key] = score;
    sum += score;
  }

  if (sum <= 0) return { ...priors };

  const out = {} as Record<SevenModelKey, number>;
  for (const key of SEVEN_MODEL_KEYS) {
    out[key] = raw[key] / sum;
  }
  return out;
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

export function clearMetarCache(): void {
  metarCache.clear();
}

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

/**
 * Geriye dönük uyumlu tek-istasyon sarmalayıcısı.
 */
export async function fetchNearestMetarHistory(
  lat: number,
  lon: number
): Promise<{ station: MetarObservation | null; history: RawMetarRecord[] }> {
  const network = await fetchMetarNetworkHistory(lat, lon, 4, 85);
  if (network.length === 0) return { station: null, history: [] };
  return {
    station: network[0].station,
    history: network[0].history
  };
}

export type DynamicHybridWeights = {
  temperature: Record<SevenModelKey, number>;
  pressure: Record<SevenModelKey, number>;
  wind: Record<SevenModelKey, number>;
  precipitation: Record<SevenModelKey, number>;
};

/**
 * Geriye dönük uyumlu v2 doğrulama fonksiyonu (eski testler ve doğrudan tek istasyon çağrıları için).
 * Yeni ATMOS-Core v4.5 boru hattı çoklu-istasyonlu Kalman/MOS için `lib/kalman-mos.ts` kullanır.
 */
export function evaluateModelsAgainstMetar({
  station,
  metarHistory,
  cityElevationM,
  modelHourlyUtc,
  utcTimeIndex
}: {
  station: MetarObservation | null;
  metarHistory: RawMetarRecord[];
  cityElevationM: number;
  modelHourlyUtc: Record<string, Array<number | null> | undefined> | null;
  utcTimeIndex: Map<string, number>;
}): { report: LiveVerificationReport; weights: DynamicHybridWeights } {
  const elevDiffM = station ? station.elevationM - cityElevationM : 0;
  const stationTempToCityDeltaC = elevDiffM * 0.0065;

  const acc = {} as Record<
    SevenModelKey,
    {
      tSq: number;
      tAbs: number;
      tSum: number;
      tN: number;
      tdSq: number;
      tdN: number;
      pSq: number;
      pN: number;
      wSq: number;
      wN: number;
    }
  >;
  for (const k of SEVEN_MODEL_KEYS) {
    acc[k] = { tSq: 0, tAbs: 0, tSum: 0, tN: 0, tdSq: 0, tdN: 0, pSq: 0, pN: 0, wSq: 0, wN: 0 };
  }

  const matchedHourSet = new Set<string>();

  if (station && modelHourlyUtc && metarHistory.length > 0) {
    for (const ob of metarHistory) {
      const obsMs = ob.obsTime * 1000;
      const roundedUtc = new Date(Math.round(obsMs / 3600000) * 3600000);
      const isoUtc = roundedUtc.toISOString().slice(0, 16);
      if (matchedHourSet.has(isoUtc)) continue;

      const idx = utcTimeIndex.get(isoUtc);
      if (idx === undefined) continue;
      matchedHourSet.add(isoUtc);

      const obsTempAdj =
        typeof ob.temp === "number" && Number.isFinite(ob.temp)
          ? ob.temp + stationTempToCityDeltaC
          : null;
      const obsDewAdj =
        typeof ob.dewp === "number" && Number.isFinite(ob.dewp)
          ? ob.dewp + stationTempToCityDeltaC
          : null;
      const obsPress =
        typeof ob.slp === "number" && Number.isFinite(ob.slp)
          ? ob.slp
          : typeof ob.altim === "number" && Number.isFinite(ob.altim)
            ? ob.altim
            : null;
      const obsWindKmh =
        typeof ob.wspd === "number" && Number.isFinite(ob.wspd)
          ? ob.wspd * 1.852
          : null;

      for (const mKey of SEVEN_MODEL_KEYS) {
        const apiId = SEVEN_MODEL_META[mKey].apiModel;
        const mTemp = modelHourlyUtc[`temperature_2m_${apiId}`]?.[idx];
        const mDew = modelHourlyUtc[`dew_point_2m_${apiId}`]?.[idx];
        const mPress = modelHourlyUtc[`pressure_msl_${apiId}`]?.[idx];
        const mWind = modelHourlyUtc[`wind_speed_10m_${apiId}`]?.[idx];

        if (obsTempAdj !== null && typeof mTemp === "number" && Number.isFinite(mTemp)) {
          const err = mTemp - obsTempAdj;
          acc[mKey].tSq += err * err;
          acc[mKey].tAbs += Math.abs(err);
          acc[mKey].tSum += err;
          acc[mKey].tN++;
        }
        if (obsDewAdj !== null && typeof mDew === "number" && Number.isFinite(mDew)) {
          const err = mDew - obsDewAdj;
          acc[mKey].tdSq += err * err;
          acc[mKey].tdN++;
        }
        if (obsPress !== null && typeof mPress === "number" && Number.isFinite(mPress)) {
          const err = mPress - obsPress;
          acc[mKey].pSq += err * err;
          acc[mKey].pN++;
        }
        if (obsWindKmh !== null && typeof mWind === "number" && Number.isFinite(mWind)) {
          const err = mWind - obsWindKmh;
          acc[mKey].wSq += err * err;
          acc[mKey].wN++;
        }
      }
    }
  }

  const matchedHours = matchedHourSet.size;
  const hasLiveVerification = Boolean(station && matchedHours >= 8);

  const tempRmses: Partial<Record<SevenModelKey, number | null>> = {};
  const tempUbRmses: Partial<Record<SevenModelKey, number | null>> = {};
  const tempBiases: Partial<Record<SevenModelKey, number | null>> = {};
  const pressRmses: Partial<Record<SevenModelKey, number | null>> = {};
  const windRmses: Partial<Record<SevenModelKey, number | null>> = {};
  const dewRmses: Partial<Record<SevenModelKey, number | null>> = {};
  const tempMaes: Partial<Record<SevenModelKey, number | null>> = {};

  for (const k of SEVEN_MODEL_KEYS) {
    const a = acc[k];
    if (a.tN >= 6) {
      const meanErr = a.tSum / a.tN;
      const mse = a.tSq / a.tN;
      const varErr = Math.max(0, mse - meanErr * meanErr);
      tempRmses[k] = Number(Math.sqrt(mse).toFixed(2));
      tempUbRmses[k] = Number(Math.sqrt(varErr).toFixed(2));
      tempBiases[k] = Number(meanErr.toFixed(2));
      tempMaes[k] = Number((a.tAbs / a.tN).toFixed(2));
    } else {
      tempRmses[k] = null;
      tempUbRmses[k] = null;
      tempBiases[k] = null;
      tempMaes[k] = null;
    }
    dewRmses[k] = a.tdN >= 6 ? Number(Math.sqrt(a.tdSq / a.tdN).toFixed(2)) : null;
    pressRmses[k] = a.pN >= 6 ? Number(Math.sqrt(a.pSq / a.pN).toFixed(2)) : null;
    windRmses[k] = a.wN >= 6 ? Number(Math.sqrt(a.wSq / a.wN).toFixed(2)) : null;
  }

  const weights: DynamicHybridWeights = hasLiveVerification
    ? {
        temperature: computeInverseRmseWeights(
          tempRmses,
          WMO_PRIOR_WEIGHTS.temperature,
          0.55
        ),
        pressure: computeInverseRmseWeights(
          pressRmses,
          WMO_PRIOR_WEIGHTS.pressure,
          0.4
        ),
        wind: computeInverseRmseWeights(windRmses, WMO_PRIOR_WEIGHTS.wind, 3.5),
        precipitation: { ...WMO_PRIOR_WEIGHTS.precipitation }
      }
    : {
        temperature: { ...WMO_PRIOR_WEIGHTS.temperature },
        pressure: { ...WMO_PRIOR_WEIGHTS.pressure },
        wind: { ...WMO_PRIOR_WEIGHTS.wind },
        precipitation: { ...WMO_PRIOR_WEIGHTS.precipitation }
      };

  const findWinner = (
    map: Partial<Record<SevenModelKey, number | null>>
  ): SevenModelKey | null => {
    let bestKey: SevenModelKey | null = null;
    let bestVal = Infinity;
    for (const k of SEVEN_MODEL_KEYS) {
      const v = map[k];
      if (typeof v === "number" && v < bestVal) {
        bestVal = v;
        bestKey = k;
      }
    }
    return bestKey;
  };

  const rows: ModelVerificationRow[] = SEVEN_MODEL_KEYS.map((k) => ({
    modelKey: k,
    label: SEVEN_MODEL_META[k].label,
    resolution: SEVEN_MODEL_META[k].resolution,
    tempRmseC: tempRmses[k] ?? null,
    tempUbRmseC: tempUbRmses[k] ?? null,
    tempBiasC: tempBiases[k] ?? null,
    tempMaeC: tempMaes[k] ?? null,
    pressureRmseHpa: pressRmses[k] ?? null,
    windRmseKmh: windRmses[k] ?? null,
    dewPointRmseC: dewRmses[k] ?? null,
    matchedHours: acc[k].tN,
    weightsPct: {
      temperature: Math.round(weights.temperature[k] * 100),
      pressure: Math.round(weights.pressure[k] * 100),
      wind: Math.round(weights.wind[k] * 100),
      precipitation: Math.round(weights.precipitation[k] * 100)
    }
  }));

  return {
    weights,
    report: {
      mode: hasLiveVerification ? "live-metar-24h" : "wmo-prior",
      station,
      stations: station ? [station] : [],
      matchedHours,
      winners: {
        temperature: hasLiveVerification ? findWinner(tempRmses) : null,
        pressure: hasLiveVerification ? findWinner(pressRmses) : null,
        wind: hasLiveVerification ? findWinner(windRmses) : null
      },
      rows
    }
  };
}
