import { ATMOS_HTTP_USER_AGENT, parseMetarTenthDegreeGroup } from "./bursa-mesh";
import {
  BoundedSingleflightCache,
  cloneIsolatedValue
} from "./provinces/isolation/namespaced-cache";
import {
  isTrProvinceCode,
  type ProvinceCode,
  type TrProvinceCode
} from "./provinces/types";
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

export interface MetarQueryOptions {
  provinceCode?: ProvinceCode;
  nowMs?: number;
}

const LT_ICAO_REGEX = /^LT[A-Z]{2}$/;

function freezeIcaoList(list: readonly string[]): readonly string[] {
  return Object.freeze([...list]);
}

/**
 * Authoritative 81-Province Physical Runway METAR Whitelist (`^LT[A-Z]{2}$` ONLY).
 *
 * Rules:
 *  1. Every airport is assigned strictly to the `TrProvinceCode` where its physical runway sits.
 *  2. Provinces without an active METAR aerodrome map to `[]` — they NEVER borrow neighbor-province
 *     airports (`LTFJ`, `LTBR`, `LTCG`, `LTCE`, etc.) or foreign border aerodromes (`LG*`, `UG*`, `UD*`, `OS*`).
 */
export const TURKEY_ICAO_WHITELIST_BY_PROVINCE: Readonly<
  Record<TrProvinceCode, readonly string[]>
> = Object.freeze({
  "TR-01": freezeIcaoList(["LTAF", "LTAG"]), // Adana
  "TR-02": freezeIcaoList(["LTCP"]), // Adıyaman
  "TR-03": freezeIcaoList(["LTAH"]), // Afyonkarahisar
  "TR-04": freezeIcaoList(["LTCO"]), // Ağrı
  "TR-05": freezeIcaoList(["LTAP"]), // Amasya (Merzifon)
  "TR-06": freezeIcaoList(["LTAC", "LTAB", "LTAD"]), // Ankara (Esenboğa, Güvercinlik, Etimesgut)
  "TR-07": freezeIcaoList(["LTAI", "LTFG"]), // Antalya (Antalya, Gazipaşa)
  "TR-08": freezeIcaoList([]), // Artvin (strictly blocks Batum UGSB & Rize LTFO)
  "TR-09": freezeIcaoList(["LTBD"]), // Aydın (Çıldır)
  "TR-10": freezeIcaoList(["LTBF", "LTBG", "LTFD"]), // Balıkesir (Merkez, Bandırma, Edremit)
  "TR-11": freezeIcaoList([]), // Bilecik
  "TR-12": freezeIcaoList(["LTCU"]), // Bingöl
  "TR-13": freezeIcaoList([]), // Bitlis
  "TR-14": freezeIcaoList([]), // Bolu
  "TR-15": freezeIcaoList([]), // Burdur
  "TR-16": freezeIcaoList(["LTBR"]), // Bursa (Yenişehir ONLY — blocks LTFJ & LTBG)
  "TR-17": freezeIcaoList(["LTBH", "LTFK"]), // Çanakkale (Merkez, Gökçeada)
  "TR-18": freezeIcaoList([]), // Çankırı
  "TR-19": freezeIcaoList([]), // Çorum
  "TR-20": freezeIcaoList(["LTAY"]), // Denizli (Çardak)
  "TR-21": freezeIcaoList(["LTCC"]), // Diyarbakır
  "TR-22": freezeIcaoList([]), // Edirne (strictly blocks Alexandroupoli LGAL & Çorlu LTBU)
  "TR-23": freezeIcaoList(["LTCA"]), // Elazığ
  "TR-24": freezeIcaoList(["LTCD"]), // Erzincan
  "TR-25": freezeIcaoList(["LTCE"]), // Erzurum
  "TR-26": freezeIcaoList(["LTBY", "LTBI"]), // Eskişehir
  "TR-27": freezeIcaoList(["LTAJ"]), // Gaziantep
  "TR-28": freezeIcaoList([]), // Giresun (LTCB runway sits in Gülyalı/Ordu TR-52)
  "TR-29": freezeIcaoList([]), // Gümüşhane
  "TR-30": freezeIcaoList(["LTCW"]), // Hakkari (Yüksekova)
  "TR-31": freezeIcaoList(["LTDA"]), // Hatay (blocks Syrian OSLK/OSAP)
  "TR-32": freezeIcaoList(["LTFC"]), // Isparta (Süleyman Demirel)
  "TR-33": freezeIcaoList(["LTDB"]), // Mersin (Çukurova Uluslararası — Tarsus)
  "TR-34": freezeIcaoList(["LTFM", "LTFJ", "LTBA"]), // İstanbul
  "TR-35": freezeIcaoList(["LTBJ", "LTBL"]), // İzmir (Adnan Menderes, Çiğli — blocks Greek islands LGSM/LGHI/LGMT)
  "TR-36": freezeIcaoList(["LTCF"]), // Kars (blocks Armenian UDYZ/UDSG)
  "TR-37": freezeIcaoList(["LTAL"]), // Kastamonu
  "TR-38": freezeIcaoList(["LTAU"]), // Kayseri
  "TR-39": freezeIcaoList([]), // Kırklareli
  "TR-40": freezeIcaoList([]), // Kırşehir
  "TR-41": freezeIcaoList(["LTBQ"]), // Kocaeli (Cengiz Topel — blocks LTFJ)
  "TR-42": freezeIcaoList(["LTAN"]), // Konya
  "TR-43": freezeIcaoList(["LTBZ", "LTBN"]), // Kütahya (Zafer, Kütahya)
  "TR-44": freezeIcaoList(["LTAT"]), // Malatya (Erhaç)
  "TR-45": freezeIcaoList(["LTBT"]), // Manisa (Akhisar)
  "TR-46": freezeIcaoList(["LTCN"]), // Kahramanmaraş
  "TR-47": freezeIcaoList(["LTCR"]), // Mardin (blocks Syrian OSKL)
  "TR-48": freezeIcaoList(["LTBS", "LTFE"]), // Muğla (Dalaman, Milas-Bodrum — blocks LGRP/LGKO)
  "TR-49": freezeIcaoList(["LTCK"]), // Muş
  "TR-50": freezeIcaoList(["LTAZ"]), // Nevşehir (Kapadokya)
  "TR-51": freezeIcaoList([]), // Niğde
  "TR-52": freezeIcaoList(["LTCB"]), // Ordu (Ordu-Giresun — Gülyalı)
  "TR-53": freezeIcaoList(["LTFO"]), // Rize (Rize-Artvin — Pazar)
  "TR-54": freezeIcaoList([]), // Sakarya
  "TR-55": freezeIcaoList(["LTFH"]), // Samsun (Çarşamba)
  "TR-56": freezeIcaoList(["LTCL"]), // Siirt
  "TR-57": freezeIcaoList(["LTCM"]), // Sinop
  "TR-58": freezeIcaoList(["LTAR"]), // Sivas
  "TR-59": freezeIcaoList(["LTBU"]), // Tekirdağ (Çorlu)
  "TR-60": freezeIcaoList(["LTAW"]), // Tokat
  "TR-61": freezeIcaoList(["LTCG"]), // Trabzon
  "TR-62": freezeIcaoList([]), // Tunceli
  "TR-63": freezeIcaoList(["LTCS"]), // Şanlıurfa (GAP)
  "TR-64": freezeIcaoList(["LTBO"]), // Uşak
  "TR-65": freezeIcaoList(["LTCI"]), // Van (Ferit Melen)
  "TR-66": freezeIcaoList([]), // Yozgat
  "TR-67": freezeIcaoList(["LTAS"]), // Zonguldak (Çaycuma)
  "TR-68": freezeIcaoList([]), // Aksaray
  "TR-69": freezeIcaoList([]), // Bayburt
  "TR-70": freezeIcaoList([]), // Karaman
  "TR-71": freezeIcaoList([]), // Kırıkkale
  "TR-72": freezeIcaoList(["LTCJ"]), // Batman
  "TR-73": freezeIcaoList(["LTCV"]), // Şırnak
  "TR-74": freezeIcaoList([]), // Bartın
  "TR-75": freezeIcaoList([]), // Ardahan
  "TR-76": freezeIcaoList(["LTCT"]), // Iğdır
  "TR-77": freezeIcaoList([]), // Yalova (strictly blocks LTFJ & LTBR)
  "TR-78": freezeIcaoList([]), // Karabük
  "TR-79": freezeIcaoList([]), // Kilis
  "TR-80": freezeIcaoList([]), // Osmaniye
  "TR-81": freezeIcaoList([]) // Düzce
});

export function getAllowedTurkeyIcaosForProvince(
  provinceCode: TrProvinceCode
): readonly string[] {
  return TURKEY_ICAO_WHITELIST_BY_PROVINCE[provinceCode] ?? [];
}

export function isIcaoAllowedForProvince(
  icaoId: string,
  provinceCode: ProvinceCode
): boolean {
  const norm = (icaoId ?? "").trim().toUpperCase();
  if (!norm) return false;
  if (isTrProvinceCode(provinceCode)) {
    if (!LT_ICAO_REGEX.test(norm)) return false;
    return TURKEY_ICAO_WHITELIST_BY_PROVINCE[provinceCode].includes(norm);
  }
  // International ("GLOBAL") mode: forbid Turkish LT** cross-bleed into foreign cities if needed?
  // International queries may sit anywhere globally; allow standard 4-letter ICAO codes.
  return /^[A-Z0-9]{4}$/.test(norm);
}

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

const METAR_TTL_MS = 5 * 60 * 1000;

/**
 * Stores ONLY target-independent grouped `RawMetarRecord[]` histories per province/tile,
 * NEVER baking `distanceKm` or `ageMinutes` into cached objects!
 */
const metarRawHistoryCache = new BoundedSingleflightCache<Record<string, RawMetarRecord[]>>({
  maxEntriesPerProvince: 32,
  bursaMaxEntries: 32,
  maxTotalNonPinnedEntries: 256,
  defaultTtlMs: METAR_TTL_MS,
  defaultStaleMs: 30 * 60 * 1000
});

export function resetMetarCacheForTests(): void {
  metarRawHistoryCache.clearAll();
}

function buildObservation(
  latest: RawMetarRecord,
  distKm: number,
  nowMs: number
): MetarObservation {
  const obsDate = new Date(latest.obsTime * 1000);
  const ageMinutes = Math.max(0, Math.round((nowMs - obsDate.getTime()) / 60000));
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

function normalizeAndGroupMetarRecords(
  records: RawMetarRecord[],
  allowedIcaos: ReadonlySet<string> | null,
  requireTurkishLtPrefix: boolean
): Record<string, RawMetarRecord[]> {
  const grouped: Record<string, RawMetarRecord[]> = {};

  for (const raw of records) {
    if (!raw || !raw.icaoId || typeof raw.lat !== "number" || typeof raw.lon !== "number") {
      continue;
    }
    const icao = String(raw.icaoId).trim().toUpperCase();
    if (!icao) continue;
    if (requireTurkishLtPrefix && !LT_ICAO_REGEX.test(icao)) {
      continue;
    }
    if (allowedIcaos && !allowedIcaos.has(icao)) {
      continue;
    }

    const precise = parseMetarTenthDegreeGroup(raw.rawOb);
    const cleanRecord: RawMetarRecord = {
      ...raw,
      icaoId: icao,
      ...(precise
        ? {
            temp: precise.tempC,
            ...(precise.dewPointC !== null ? { dewp: precise.dewPointC } : {})
          }
        : {})
    };

    if (!grouped[icao]) {
      grouped[icao] = [];
    }
    grouped[icao].push(cleanRecord);
  }

  for (const icao of Object.keys(grouped)) {
    grouped[icao] = [...grouped[icao]].sort((a, b) => b.obsTime - a.obsTime);
  }

  return grouped;
}

function materializeStationsForTarget(
  grouped: Record<string, RawMetarRecord[]>,
  lat: number,
  lon: number,
  maxStations: number,
  maxRadiusKm: number,
  nowMs: number
): MetarNetworkStation[] {
  const ranked: Array<{ icao: string; dist: number; list: RawMetarRecord[] }> = [];

  for (const [icao, list] of Object.entries(grouped)) {
    if (!list || list.length < 3) continue;
    const sample = list[0];
    const dist = haversineKm(lat, lon, sample.lat, sample.lon);
    if (dist <= maxRadiusKm) {
      ranked.push({
        icao,
        dist,
        list: cloneIsolatedValue(list)
      });
    }
  }

  ranked.sort((a, b) => a.dist - b.dist);
  return ranked.slice(0, Math.max(1, maxStations)).map((entry) => ({
    station: buildObservation(entry.list[0], entry.dist, nowMs),
    history: entry.list
  }));
}

/**
 * 48 Saatlik Çoklu-İstasyon Fiziksel METAR Ağı:
 *  - `opts.provinceCode` bir Türkiye ili (`TR-01..TR-81`) olduğunda `bbox` sorgusu KESİNLİKLE YASAKTIR!
 *    Yalnızca o ilin `TURKEY_ICAO_WHITELIST_BY_PROVINCE[pc]` listesindeki `^LT[A-Z]{2}$` meydanları
 *    sorgulanır; liste boşsa (`[]`, ~25 il) dış ağa hiç çıkılmadan `[]` döner.
 *  - `distanceKm` ve `ageMinutes` önbellekte dondurulmaz; her çağrıda hedef `(lat, lon)` ve `nowMs`
 *    üzerinden taze hesaplanıp klonlanmış nesne olarak döndürülür.
 */
export async function fetchMetarNetworkHistory(
  lat: number,
  lon: number,
  maxStations = 4,
  maxRadiusKm = 85,
  opts?: MetarQueryOptions
): Promise<MetarNetworkStation[]> {
  const nowMs = opts?.nowMs ?? Date.now();
  const pc = opts?.provinceCode;

  // STRICT TURKISH PROVINCE FIREWALL (`TR-01`..`TR-81`)
  if (isTrProvinceCode(pc)) {
    const allowedList = TURKEY_ICAO_WHITELIST_BY_PROVINCE[pc];
    if (!allowedList || allowedList.length === 0) {
      return [];
    }

    const allowedSet = new Set<string>(allowedList);
    const cacheKey = `${pc}:metar:${allowedList.join(",")}`;

    try {
      const grouped = await metarRawHistoryCache.getOrFetch(
        pc,
        cacheKey,
        async () => {
          const idsParam = encodeURIComponent(allowedList.join(","));
          const url = `https://aviationweather.gov/api/data/metar?ids=${idsParam}&hours=48&format=json`;
          const res = await fetch(url, {
            cache: "no-store",
            signal: AbortSignal.timeout(7000),
            headers: {
              Accept: "application/json",
              "User-Agent": ATMOS_HTTP_USER_AGENT
            }
          });
          if (!res.ok) return {};
          const data = await res.json();
          const rawArr = Array.isArray(data) ? (data as RawMetarRecord[]) : [];
          return normalizeAndGroupMetarRecords(rawArr, allowedSet, true);
        },
        { ttlMs: METAR_TTL_MS, nowMs }
      );

      return materializeStationsForTarget(
        grouped,
        lat,
        lon,
        maxStations,
        maxRadiusKm,
        nowMs
      );
    } catch {
      return [];
    }
  }

  // INTERNATIONAL ("GLOBAL") OR LEGACY UNSCOPED BBOX FALLBACK
  const partition: ProvinceCode = "GLOBAL";
  const bboxKey = `GLOBAL:bbox:${lat.toFixed(2)},${lon.toFixed(2)}`;

  const queryBox = async (deltaDeg: number): Promise<RawMetarRecord[]> => {
    const minLat = Math.max(-85, lat - deltaDeg).toFixed(3);
    const maxLat = Math.min(85, lat + deltaDeg).toFixed(3);
    const minLon = Math.max(-180, lon - deltaDeg * 1.3).toFixed(3);
    const maxLon = Math.min(180, lon + deltaDeg * 1.3).toFixed(3);
    const url = `https://aviationweather.gov/api/data/metar?bbox=${minLat},${minLon},${maxLat},${maxLon}&hours=48&format=json`;
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(7000),
      headers: {
        Accept: "application/json",
        "User-Agent": ATMOS_HTTP_USER_AGENT
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as RawMetarRecord[]) : [];
  };

  try {
    const grouped = await metarRawHistoryCache.getOrFetch(
      partition,
      bboxKey,
      async () => {
        let records = await queryBox(0.85);
        if (records.length === 0) {
          records = await queryBox(1.35);
        }
        if (records.length === 0) return {};
        return normalizeAndGroupMetarRecords(records, null, false);
      },
      { ttlMs: METAR_TTL_MS, nowMs }
    );

    return materializeStationsForTarget(
      grouped,
      lat,
      lon,
      maxStations,
      maxRadiusKm,
      nowMs
    );
  } catch {
    return [];
  }
}

/**
 * Returns the single closest verified METAR observation for `(lat, lon)`, strictly honoring
 * `opts.provinceCode` (`TR-XX` whitelist firewall + zero `bbox` queries for Turkish provinces).
 */
export async function fetchNearestMetar(
  lat: number,
  lon: number,
  maxRadiusKm = 85,
  opts?: MetarQueryOptions
): Promise<MetarObservation | null> {
  const stations = await fetchMetarNetworkHistory(lat, lon, 1, maxRadiusKm, opts);
  return stations[0]?.station ?? null;
}
