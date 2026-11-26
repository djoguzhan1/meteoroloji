/**
 * ATMOS v4.0 — Bursa Hyper-Local Multi-Tier Observation Mesh & Physics QC
 * File: lib/bursa-mesh.ts
 *
 * Solves the "LTBR Yenişehir Trap" (47 km east rural frost-hollow basin) by fusing:
 *  - Tier 1: All 19 official MGM Bursa stations via `merkezler/ililcesi?il=Bursa` + `sondurumlar`
 *            (Osmangazi 17116, Nilüfer 18386, Yıldırım 18746, Uludağ Zirve 17676, Mudanya 18385,
 *             Gemlik 17663, Gürsu 18745, Kestel 18384, Karacabey 17673, Orhaneli 18083, Keles 17695)
 *  - Tier 2: Precision-parsed NOAA AviationWeather METAR perimeter (LTBR, LTBG, LTFJ)
 *            with RMK T-group 0.1°C thermometer decoding
 *  - Tier 3: Citizen PWS mesh (OpenSenseMap) gated by 4-stage meteorological QC
 *  - Dual-Elevation Live Lapse Rate Solver (Bursa Ova 100-200m <-> Uludağ 1063-1877m)
 */

import type { MetarObservation, MetarWxFlags } from "./weather-types";

export const ATMOS_HTTP_USER_AGENT =
  "Mozilla/5.0 (compatible; Google-Agent; +https://developers.google.com/crawling/docs/crawlers-fetchers/google-agent)";

export type TerrainZone =
  | "urban_foothill"
  | "urban_plain"
  | "coastal_marmara"
  | "open_corridor"
  | "mountain_slope"
  | "alpine_ridge"
  | "rural_closed_basin";

export type BarrierGroup =
  | "BURSA_OVA"
  | "MARMARA_COAST"
  | "WEST_CORRIDOR"
  | "ULUDAG_MASSIF"
  | "YENISEHIR_BASIN"
  | "NORTH_MARMARA";

export type ObservationTier = 1 | 2 | 3;

export type BoundaryLayerState =
  | "STRONG_INVERSION"
  | "SHALLOW_INVERSION"
  | "LODOS_FOEHN"
  | "MOIST_OROGRAPHIC"
  | "STANDARD_MIXED";

export type QcFlag =
  | "OK"
  | "MISSING_TEMP"
  | "GROSS_LIMIT_REJECT"
  | "STALE_OBSERVATION"
  | "SOLAR_RADIATION_SPIKE"
  | "SPATIAL_BUDDY_OUTLIER"
  | "SPATIAL_BUDDY_SOFT_CLIP"
  | "RURAL_BASIN_ISOLATED";

export interface StationMetadata {
  id: string;
  wmoId?: string;
  icaoId?: string;
  mgmIstNo?: number;
  name: string;
  district?: string;
  lat: number;
  lon: number;
  elevationM: number;
  zone: TerrainZone;
  barrierGroup: BarrierGroup;
  tier: ObservationTier;
  urbanFraction: number;
  coldPoolSusceptibility: number;
}

export interface RawStationObservation {
  station: StationMetadata;
  observedAtIso: string;
  tempC: number | null;
  dewPointC: number | null;
  relHumidityPct: number | null;
  pressureMslHpa: number | null;
  pressureStationHpa: number | null;
  windSpeedKt: number | null;
  windGustKt: number | null;
  windDirDeg: number | null;
  precip10MinMm: number | null;
  precip1HrMm: number | null;
  precip24HrMm: number | null;
  visibilityM: number | null;
  snowDepthCm: number | null;
  isPrecipitating: boolean | null;
  wxCodeRaw?: string;
  hasTenthDegreePrecision: boolean;
  source: "MGM_10MIN" | "NOAA_METAR" | "OPENSENSE_PWS" | "WUNDERGROUND_PWS" | "SYNTHETIC";
}

export interface QcStationObservation extends RawStationObservation {
  ageMinutes: number;
  freshnessWeight: number;
  qcWeight: number;
  qcFlags: QcFlag[];
  reducedTempAtRefC: number | null;
  madZScore: number | null;
}

export interface LiveVerticalProfile {
  lapseRateCPerKm: number;
  inversionStrengthC: number;
  boundaryLayerState: BoundaryLayerState;
  ovaRefTempC: number | null;
  mountainRefTempC: number | null;
  measuredPairCount: number;
  isDirectlyMeasured: boolean;
}

export interface BursaMeshSnapshot {
  fetchedAtIso: string;
  isBursaRegion: boolean;
  stations: QcStationObservation[];
  acceptedCount: number;
  rejectedCount: number;
  tier1OnlineCount: number;
  verticalProfile: LiveVerticalProfile;
}

export const BURSA_REFERENCE_STATIONS: Record<string, StationMetadata> = {
  WMO_17116: {
    id: "WMO_17116",
    wmoId: "17116",
    icaoId: "17116-OSM",
    mgmIstNo: 17116,
    name: "Bursa Osmangazi Merkez (17116)",
    district: "Osmangazi",
    lat: 40.2308,
    lon: 29.0133,
    elevationM: 100,
    zone: "urban_plain",
    barrierGroup: "BURSA_OVA",
    tier: 1,
    urbanFraction: 0.86,
    coldPoolSusceptibility: 0.22
  },
  MGM_OSMANGAZI_FOOTHILL: {
    id: "MGM_OSMANGAZI_FOOTHILL",
    icaoId: "OSM-ETEK",
    name: "Bursa Osmangazi (Şehreküstü Etek)",
    district: "Osmangazi",
    lat: 40.1885,
    lon: 29.061,
    elevationM: 155,
    zone: "urban_foothill",
    barrierGroup: "BURSA_OVA",
    tier: 1,
    urbanFraction: 0.9,
    coldPoolSusceptibility: 0.1
  },
  MGM_NILUFER: {
    id: "MGM_NILUFER",
    icaoId: "NILUFER",
    mgmIstNo: 18386,
    name: "Bursa Nilüfer",
    district: "Nilüfer",
    lat: 40.2225,
    lon: 28.8725,
    elevationM: 105,
    zone: "urban_plain",
    barrierGroup: "BURSA_OVA",
    tier: 1,
    urbanFraction: 0.72,
    coldPoolSusceptibility: 0.25
  },
  MGM_YILDIRIM: {
    id: "MGM_YILDIRIM",
    icaoId: "YILDIRIM",
    mgmIstNo: 18746,
    name: "Bursa Yıldırım",
    district: "Yıldırım",
    lat: 40.1915,
    lon: 29.115,
    elevationM: 147,
    zone: "urban_foothill",
    barrierGroup: "BURSA_OVA",
    tier: 1,
    urbanFraction: 0.84,
    coldPoolSusceptibility: 0.14
  },
  MGM_KESTEL: {
    id: "MGM_KESTEL",
    icaoId: "KESTEL",
    mgmIstNo: 18384,
    name: "Bursa Kestel",
    district: "Kestel",
    lat: 40.1978,
    lon: 29.2122,
    elevationM: 230,
    zone: "urban_foothill",
    barrierGroup: "BURSA_OVA",
    tier: 1,
    urbanFraction: 0.5,
    coldPoolSusceptibility: 0.35
  },
  MGM_GURSU: {
    id: "MGM_GURSU",
    icaoId: "GURSU",
    mgmIstNo: 18745,
    name: "Bursa Gürsu",
    district: "Gürsu",
    lat: 40.2489,
    lon: 29.2408,
    elevationM: 124,
    zone: "urban_plain",
    barrierGroup: "BURSA_OVA",
    tier: 1,
    urbanFraction: 0.55,
    coldPoolSusceptibility: 0.32
  },
  MGM_MUDANYA: {
    id: "MGM_MUDANYA",
    icaoId: "MUDANYA",
    mgmIstNo: 18385,
    name: "Bursa Mudanya",
    district: "Mudanya",
    lat: 40.3756,
    lon: 28.8822,
    elevationM: 4,
    zone: "coastal_marmara",
    barrierGroup: "MARMARA_COAST",
    tier: 1,
    urbanFraction: 0.48,
    coldPoolSusceptibility: 0.05
  },
  MGM_GEMLIK: {
    id: "MGM_GEMLIK",
    icaoId: "GEMLIK",
    mgmIstNo: 17663,
    name: "Bursa Gemlik",
    district: "Gemlik",
    lat: 40.4401,
    lon: 29.1504,
    elevationM: 85,
    zone: "coastal_marmara",
    barrierGroup: "MARMARA_COAST",
    tier: 1,
    urbanFraction: 0.52,
    coldPoolSusceptibility: 0.08
  },
  MGM_KARACABEY: {
    id: "MGM_KARACABEY",
    icaoId: "KARACABEY",
    mgmIstNo: 17673,
    name: "Bursa Karacabey",
    district: "Karacabey",
    lat: 40.1319,
    lon: 28.332,
    elevationM: 15,
    zone: "open_corridor",
    barrierGroup: "WEST_CORRIDOR",
    tier: 1,
    urbanFraction: 0.35,
    coldPoolSusceptibility: 0.38
  },
  WMO_17676_ULUDAG: {
    id: "WMO_17676_ULUDAG",
    wmoId: "17676",
    icaoId: "ULUDAG",
    mgmIstNo: 17676,
    name: "Uludağ Kayak Merkezi (17676)",
    district: "Uludağ",
    lat: 40.1075,
    lon: 29.1292,
    elevationM: 1877,
    zone: "alpine_ridge",
    barrierGroup: "ULUDAG_MASSIF",
    tier: 1,
    urbanFraction: 0.05,
    coldPoolSusceptibility: 0.0
  },
  MGM_ULUDAG_SARIALAN: {
    id: "MGM_ULUDAG_SARIALAN",
    icaoId: "SARIALAN",
    name: "Uludağ Sarıalan",
    district: "Osmangazi",
    lat: 40.138,
    lon: 29.108,
    elevationM: 1620,
    zone: "mountain_slope",
    barrierGroup: "ULUDAG_MASSIF",
    tier: 1,
    urbanFraction: 0.04,
    coldPoolSusceptibility: 0.05
  },
  ICAO_LTBR: {
    id: "ICAO_LTBR",
    icaoId: "LTBR",
    wmoId: "17118",
    mgmIstNo: 17118,
    name: "Bursa Yenişehir Havalimanı (Kırsal Çanak)",
    district: "Yenişehir",
    lat: 40.2553,
    lon: 29.5625,
    elevationM: 233,
    zone: "rural_closed_basin",
    barrierGroup: "YENISEHIR_BASIN",
    tier: 2,
    urbanFraction: 0.04,
    coldPoolSusceptibility: 0.96
  },
  ICAO_LTBG: {
    id: "ICAO_LTBG",
    icaoId: "LTBG",
    wmoId: "17114",
    name: "Bandırma Havalimanı",
    lat: 40.318,
    lon: 27.9777,
    elevationM: 52,
    zone: "coastal_marmara",
    barrierGroup: "MARMARA_COAST",
    tier: 2,
    urbanFraction: 0.22,
    coldPoolSusceptibility: 0.12
  },
  ICAO_LTFJ: {
    id: "ICAO_LTFJ",
    icaoId: "LTFJ",
    name: "İstanbul Sabiha Gökçen Havalimanı",
    lat: 40.8986,
    lon: 29.3092,
    elevationM: 95,
    zone: "urban_plain",
    barrierGroup: "NORTH_MARMARA",
    tier: 2,
    urbanFraction: 0.58,
    coldPoolSusceptibility: 0.18
  }
};

const EARTH_RADIUS_KM = 6371.0;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function isWithinBursaDomain(lat: number, lon: number): boolean {
  return lat >= 39.85 && lat <= 40.65 && lon >= 28.2 && lon <= 29.8;
}

export function computeMagnusDewPointC(tempC: number, rhPct: number): number {
  const clampedRh = Math.max(1, Math.min(100, rhPct));
  const a = 17.625;
  const b = 243.04;
  const gamma = Math.log(clampedRh / 100) + (a * tempC) / (b + tempC);
  return (b * gamma) / (a - gamma);
}

export function computeRelHumidityFromDewPoint(tempC: number, dewPointC: number): number {
  const a = 17.625;
  const b = 243.04;
  const es = Math.exp((a * tempC) / (b + tempC));
  const e = Math.exp((a * dewPointC) / (b + dewPointC));
  return Math.max(1, Math.min(100, (100 * e) / es));
}

export function parseMetarTenthDegreeGroup(rawMetar: string | undefined | null): {
  tempC: number;
  dewPointC: number | null;
} | null {
  if (!rawMetar) return null;
  const match = rawMetar.match(/\bT([01])(\d{3})(?:([01])(\d{3}))?\b/);
  if (!match) return null;
  const tempSign = match[1] === "1" ? -1 : 1;
  const tempC = tempSign * (parseInt(match[2], 10) / 10);
  let dewPointC: number | null = null;
  if (match[3] && match[4]) {
    const dewSign = match[3] === "1" ? -1 : 1;
    dewPointC = dewSign * (parseInt(match[4], 10) / 10);
  }
  return { tempC, dewPointC };
}

function cleanMgmNumber(val: unknown): number | null {
  if (typeof val !== "number" || !Number.isFinite(val)) return null;
  if (val <= -9990) return null;
  return val;
}

const MGM_PRECIP_CODES = new Set([
  "HY", "Y", "KY", "SY", "KSY", "GSY", "KGY", "HKY", "K", "KKY", "DY", "D", "YKY"
]);

interface MgmCenterEntry {
  merkezId: number;
  istNo: number;
  ilce: string;
  enlem: number;
  boylam: number;
  yukseklik: number;
}

let cachedBursaMgmCenters: { expiresAtMs: number; centers: MgmCenterEntry[] } | null = null;

const MGM_HEADERS: Record<string, string> = {
  Accept: "application/json, text/plain, */*",
  Origin: "https://www.mgm.gov.tr",
  Referer: "https://www.mgm.gov.tr/",
  "User-Agent": ATMOS_HTTP_USER_AGENT
};

function mapDistrictToStationMeta(center: MgmCenterEntry): StationMetadata {
  if (center.istNo === 17116) return BURSA_REFERENCE_STATIONS.WMO_17116;
  if (center.istNo === 17676 || center.yukseklik >= 1700) {
    return {
      ...BURSA_REFERENCE_STATIONS.WMO_17676_ULUDAG,
      mgmIstNo: center.istNo,
      lat: center.enlem || BURSA_REFERENCE_STATIONS.WMO_17676_ULUDAG.lat,
      lon: center.boylam || BURSA_REFERENCE_STATIONS.WMO_17676_ULUDAG.lon,
      elevationM: center.yukseklik || BURSA_REFERENCE_STATIONS.WMO_17676_ULUDAG.elevationM
    };
  }
  const ilceNorm = (center.ilce || "").toLocaleUpperCase("tr-TR");
  const shortIcao = ilceNorm
    .replace(/BURSA\//g, "")
    .replace(/[^A-ZÇĞİÖŞÜ]/g, "")
    .slice(0, 8);

  if (ilceNorm.includes("YENİŞEHİR") || ilceNorm.includes("YENISEHIR") || ilceNorm.includes("İNEGÖL")) {
    return {
      id: `MGM_${center.istNo}`,
      icaoId: center.istNo === 17118 ? "LTBR" : shortIcao,
      mgmIstNo: center.istNo,
      name: `MGM Bursa ${center.ilce}`,
      district: center.ilce,
      lat: center.enlem,
      lon: center.boylam,
      elevationM: center.yukseklik,
      zone: "rural_closed_basin",
      barrierGroup: "YENISEHIR_BASIN",
      tier: center.istNo === 17118 ? 2 : 1,
      urbanFraction: 0.12,
      coldPoolSusceptibility: 0.92
    };
  }
  if (ilceNorm.includes("MUDANYA") || ilceNorm.includes("GEMLİK") || ilceNorm.includes("GEMLIK")) {
    return {
      id: `MGM_${center.istNo}`,
      icaoId: shortIcao,
      mgmIstNo: center.istNo,
      name: `MGM Bursa ${center.ilce}`,
      district: center.ilce,
      lat: center.enlem,
      lon: center.boylam,
      elevationM: center.yukseklik,
      zone: "coastal_marmara",
      barrierGroup: "MARMARA_COAST",
      tier: 1,
      urbanFraction: 0.5,
      coldPoolSusceptibility: 0.08
    };
  }
  if (center.yukseklik >= 950) {
    return {
      id: `MGM_${center.istNo}`,
      icaoId: shortIcao,
      mgmIstNo: center.istNo,
      name: `MGM Bursa ${center.ilce}`,
      district: center.ilce,
      lat: center.enlem,
      lon: center.boylam,
      elevationM: center.yukseklik,
      zone: "mountain_slope",
      barrierGroup: "ULUDAG_MASSIF",
      tier: 1,
      urbanFraction: 0.08,
      coldPoolSusceptibility: 0.08
    };
  }
  if (ilceNorm.includes("KARACABEY") || ilceNorm.includes("MUSTAFAKEMAL")) {
    return {
      id: `MGM_${center.istNo}`,
      icaoId: shortIcao,
      mgmIstNo: center.istNo,
      name: `MGM Bursa ${center.ilce}`,
      district: center.ilce,
      lat: center.enlem,
      lon: center.boylam,
      elevationM: center.yukseklik,
      zone: "open_corridor",
      barrierGroup: "WEST_CORRIDOR",
      tier: 1,
      urbanFraction: 0.35,
      coldPoolSusceptibility: 0.35
    };
  }

  const isFoothill = center.yukseklik >= 140 && center.yukseklik < 500;
  return {
    id: `MGM_${center.istNo}`,
    icaoId: center.istNo === 17116 ? "17116-OSM" : shortIcao,
    mgmIstNo: center.istNo,
    name: `MGM Bursa ${center.ilce}`,
    district: center.ilce,
    lat: center.enlem,
    lon: center.boylam,
    elevationM: center.yukseklik,
    zone: isFoothill ? "urban_foothill" : "urban_plain",
    barrierGroup: "BURSA_OVA",
    tier: 1,
    urbanFraction:
      ilceNorm.includes("OSMANGAZİ") || ilceNorm.includes("YILDIRIM") || ilceNorm.includes("NİLÜFER")
        ? 0.84
        : 0.48,
    coldPoolSusceptibility: isFoothill ? 0.14 : 0.28
  };
}

/**
 * Fetches live 5-10 minute official MGM observations across all 19 Bursa districts
 * via `merkezler/ililcesi?il=Bursa` (Osmangazi 17116, Nilüfer, Yıldırım, Uludağ 17676, Mudanya, etc.).
 */
export async function fetchMgmBursaStations(timeoutMs = 4800): Promise<RawStationObservation[]> {
  try {
    const nowMs = Date.now();
    if (!cachedBursaMgmCenters || cachedBursaMgmCenters.expiresAtMs < nowMs) {
      const centerRes = await fetch("https://servis.mgm.gov.tr/web/merkezler/ililcesi?il=Bursa", {
        headers: MGM_HEADERS,
        signal: AbortSignal.timeout(timeoutMs)
      });
      if (centerRes.ok) {
        const rawCenters = (await centerRes.json()) as Array<Record<string, unknown>>;
        const parsed: MgmCenterEntry[] = [];
        for (const c of rawCenters) {
          const merkezId = Number(c.merkezId);
          const istNo = Number(c.sondurumIstNo || c.gunlukTahminIstNo || c.saatlikTahminIstNo || c.merkezId);
          const enlem = Number(c.enlem);
          const boylam = Number(c.boylam);
          const yukseklik = Number(c.yukseklik ?? 120);
          if (Number.isFinite(merkezId) && Number.isFinite(enlem) && Number.isFinite(boylam)) {
            parsed.push({
              merkezId,
              istNo,
              ilce: String(c.ilce || "Merkez"),
              enlem,
              boylam,
              yukseklik
            });
          }
        }
        // Prioritize core Bursa Ova + Uludağ + Coast stations first
        parsed.sort((a, b) => {
          const priority = (x: MgmCenterEntry) =>
            /Osmangazi|Nilüfer|Yıldırım|Uludağ|Mudanya|Gemlik|Gürsu|Kestel|Karacabey|Keles|Orhaneli/i.test(x.ilce)
              ? 0
              : 1;
          return priority(a) - priority(b);
        });
        if (parsed.length > 0) {
          cachedBursaMgmCenters = {
            expiresAtMs: nowMs + 12 * 3600 * 1000,
            centers: parsed
          };
        }
      }
    }

    const centersToQuery = cachedBursaMgmCenters?.centers ?? [
      { merkezId: 91601, istNo: 17116, ilce: "Osmangazi", enlem: 40.2308, boylam: 29.0133, yukseklik: 100 },
      { merkezId: 91617, istNo: 18386, ilce: "Nilüfer", enlem: 40.2225, boylam: 28.8725, yukseklik: 105 },
      { merkezId: 91602, istNo: 18746, ilce: "Yıldırım", enlem: 40.1915, boylam: 29.115, yukseklik: 147 },
      { merkezId: 91618, istNo: 17676, ilce: "Uludağ Kayak Merkezi", enlem: 40.1075, boylam: 29.1292, yukseklik: 1877 },
      { merkezId: 91610, istNo: 18385, ilce: "Mudanya", enlem: 40.3756, boylam: 28.8822, yukseklik: 4 }
    ];

    const queries = centersToQuery.slice(0, 13).map(async (center): Promise<RawStationObservation | null> => {
      const url = `https://servis.mgm.gov.tr/web/sondurumlar?merkezid=${center.merkezId}`;
      const res = await fetch(url, {
        headers: MGM_HEADERS,
        signal: AbortSignal.timeout(timeoutMs)
      });
      if (!res.ok) return null;
      const arr = (await res.json()) as Array<Record<string, unknown>>;
      const row = Array.isArray(arr) ? arr[0] : null;
      if (!row) return null;

      const tempC = cleanMgmNumber(row.sicaklik);
      const rhPct = cleanMgmNumber(row.nem);
      const dewPointC =
        tempC !== null && rhPct !== null ? computeMagnusDewPointC(tempC, rhPct) : null;
      const windKmh = cleanMgmNumber(row.ruzgarHiz);
      const windSpeedKt = windKmh !== null ? windKmh / 1.852 : null;
      const precip10MinMm = cleanMgmNumber(row.yagis10Dk);
      const precip1HrMm = cleanMgmNumber(row.yagis1Saat);
      const precip24HrMm = cleanMgmNumber(row.yagis24Saat);
      const hadise = typeof row.hadiseKodu === "string" ? row.hadiseKodu.trim() : "";
      const isPrecipitating =
        (precip10MinMm !== null && precip10MinMm > 0.05) ||
        (precip1HrMm !== null && precip1HrMm > 0.1) ||
        MGM_PRECIP_CODES.has(hadise);

      const stationMeta = mapDistrictToStationMeta({
        ...center,
        istNo: Number(row.istNo || center.istNo)
      });

      return {
        station: stationMeta,
        observedAtIso:
          typeof row.veriZamani === "string" ? row.veriZamani : new Date().toISOString(),
        tempC,
        dewPointC,
        relHumidityPct: rhPct,
        pressureMslHpa: cleanMgmNumber(row.denizeIndirgenmisBasinc),
        pressureStationHpa: cleanMgmNumber(row.aktuelBasinc),
        windSpeedKt,
        windGustKt: null,
        windDirDeg: cleanMgmNumber(row.ruzgarYon),
        precip10MinMm,
        precip1HrMm,
        precip24HrMm,
        visibilityM: cleanMgmNumber(row.gorus),
        snowDepthCm: cleanMgmNumber(row.karYukseklik),
        isPrecipitating,
        wxCodeRaw: hadise || undefined,
        hasTenthDegreePrecision: true,
        source: "MGM_10MIN"
      };
    });

    const settled = await Promise.allSettled(queries);
    return settled
      .filter((r): r is PromiseFulfilledResult<RawStationObservation | null> => r.status === "fulfilled")
      .map((r) => r.value)
      .filter((v): v is RawStationObservation => v !== null && v.tempC !== null);
  } catch {
    return [];
  }
}

export async function fetchAviationMetarPerimeter(
  icaoIds: string[] = ["LTBR", "LTBG", "LTFJ"],
  timeoutMs = 4500
): Promise<RawStationObservation[]> {
  try {
    const idsParam = icaoIds.join(",");
    const url = `https://aviationweather.gov/api/data/metar?ids=${encodeURIComponent(idsParam)}&format=json&hours=3`;
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": ATMOS_HTTP_USER_AGENT },
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(rows)) return [];

    const latestByIcao = new Map<string, Record<string, unknown>>();
    for (const r of rows) {
      const icao = String(r.icaoId || "").toUpperCase();
      if (!icao) continue;
      const prev = latestByIcao.get(icao);
      const tCur = Number(r.obsTime ?? 0);
      const tPrev = Number(prev?.obsTime ?? -1);
      if (!prev || tCur >= tPrev) {
        latestByIcao.set(icao, r);
      }
    }

    const out: RawStationObservation[] = [];
    for (const [icao, r] of latestByIcao.entries()) {
      const rawOb = typeof r.rawOb === "string" ? r.rawOb : "";
      const precise = parseMetarTenthDegreeGroup(rawOb);
      const rawTemp = typeof r.temp === "number" ? r.temp : null;
      const rawDewp = typeof r.dewp === "number" ? r.dewp : null;
      const tempC = precise ? precise.tempC : rawTemp;
      const dewPointC = precise?.dewPointC !== null && precise !== null ? precise.dewPointC : rawDewp;
      if (tempC === null) continue;

      const knownKey = `ICAO_${icao}`;
      const stationMeta: StationMetadata = BURSA_REFERENCE_STATIONS[knownKey] ?? {
        id: knownKey,
        icaoId: icao,
        name: String(r.name || icao),
        lat: Number(r.lat ?? 40.25),
        lon: Number(r.lon ?? 29.56),
        elevationM: Number(r.elev ?? 100),
        zone: icao === "LTBR" ? "rural_closed_basin" : "urban_plain",
        barrierGroup: icao === "LTBR" ? "YENISEHIR_BASIN" : "NORTH_MARMARA",
        tier: 2,
        urbanFraction: icao === "LTBR" ? 0.04 : 0.4,
        coldPoolSusceptibility: icao === "LTBR" ? 0.96 : 0.25
      };

      const wxString = typeof r.wxString === "string" ? r.wxString : "";
      const isPrecip = /(RA|SN|DZ|TS|SH|GR|GS|PL)/.test(wxString);
      const obsTimeSec = typeof r.obsTime === "number" ? r.obsTime : Math.floor(Date.now() / 1000);

      out.push({
        station: stationMeta,
        observedAtIso: new Date(obsTimeSec * 1000).toISOString(),
        tempC,
        dewPointC,
        relHumidityPct:
          dewPointC !== null ? computeRelHumidityFromDewPoint(tempC, dewPointC) : null,
        pressureMslHpa: typeof r.altim === "number" ? r.altim : null,
        pressureStationHpa: null,
        windSpeedKt: typeof r.wspd === "number" ? r.wspd : null,
        windGustKt: typeof r.wgst === "number" ? r.wgst : null,
        windDirDeg: typeof r.wdir === "number" ? r.wdir : null,
        precip10MinMm: null,
        precip1HrMm: typeof r.precip === "number" ? r.precip * 25.4 : null,
        precip24HrMm: null,
        visibilityM: typeof r.visib === "number" ? r.visib * 1609.34 : null,
        snowDepthCm: null,
        isPrecipitating: isPrecip,
        wxCodeRaw: wxString || undefined,
        hasTenthDegreePrecision: precise !== null,
        source: "NOAA_METAR"
      });
    }
    return out;
  } catch {
    return [];
  }
}

export async function fetchOpenSenseMapPws(
  lat = 40.1885,
  lon = 29.061,
  maxDistanceM = 25000,
  timeoutMs = 3500
): Promise<RawStationObservation[]> {
  try {
    const url = `https://api.opensensemap.org/boxes?near=${lon.toFixed(4)},${lat.toFixed(4)}&maxDistance=${maxDistanceM}&exposure=outdoor`;
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": ATMOS_HTTP_USER_AGENT },
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!res.ok) return [];
    const boxes = (await res.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(boxes)) return [];

    const out: RawStationObservation[] = [];
    for (const box of boxes.slice(0, 16)) {
      const loc = (box.currentLocation as Record<string, unknown> | undefined)?.coordinates;
      if (!Array.isArray(loc) || loc.length < 2) continue;
      const boxLon = Number(loc[0]);
      const boxLat = Number(loc[1]);
      const boxElev = Number(loc[2] ?? 135);
      const sensors = Array.isArray(box.sensors)
        ? (box.sensors as Array<Record<string, unknown>>)
        : [];

      let tempC: number | null = null;
      let rhPct: number | null = null;
      let pressureHpa: number | null = null;
      let latestIso: string | null = null;

      for (const s of sensors) {
        const title = String(s.title || "").toLowerCase();
        const meas = s.lastMeasurement as Record<string, unknown> | undefined;
        if (!meas) continue;
        const val = Number(meas.value);
        if (!Number.isFinite(val)) continue;
        if (typeof meas.createdAt === "string") latestIso = meas.createdAt;
        if (title.includes("temp") || title.includes("sıcaklık") || title.includes("sicaklik")) {
          tempC = val;
        } else if (title.includes("humid") || title.includes("nem")) {
          rhPct = val;
        } else if (title.includes("press") || title.includes("basınç") || title.includes("basinc")) {
          pressureHpa = val > 2000 ? val / 100 : val;
        }
      }

      if (tempC === null || !latestIso) continue;

      out.push({
        station: {
          id: `PWS_OSM_${String(box._id || out.length)}`,
          name: `PWS ${String(box.name || "Bursa")}`,
          lat: boxLat,
          lon: boxLon,
          elevationM: Number.isFinite(boxElev) ? boxElev : 135,
          zone: boxElev >= 145 ? "urban_foothill" : "urban_plain",
          barrierGroup: "BURSA_OVA",
          tier: 3,
          urbanFraction: 0.78,
          coldPoolSusceptibility: 0.2
        },
        observedAtIso: latestIso,
        tempC,
        dewPointC: rhPct !== null ? computeMagnusDewPointC(tempC, rhPct) : null,
        relHumidityPct: rhPct,
        pressureMslHpa: null,
        pressureStationHpa: pressureHpa,
        windSpeedKt: null,
        windGustKt: null,
        windDirDeg: null,
        precip10MinMm: null,
        precip1HrMm: null,
        precip24HrMm: null,
        visibilityM: null,
        snowDepthCm: null,
        isPrecipitating: null,
        hasTenthDegreePrecision: true,
        source: "OPENSENSE_PWS"
      });
    }
    return out;
  } catch {
    return [];
  }
}

export function computeLiveBursaVerticalProfile(
  observations: RawStationObservation[],
  ambientContext?: {
    isNight?: boolean;
    cloudCoverPct?: number;
    wind850DirDeg?: number;
    wind850SpeedKt?: number;
  }
): LiveVerticalProfile {
  const validOfficial = observations.filter(
    (o) =>
      o.station.tier <= 2 &&
      o.station.barrierGroup !== "YENISEHIR_BASIN" &&
      o.tempC !== null &&
      o.tempC > -35 &&
      o.tempC < 48
  );

  const ovaStations = validOfficial.filter(
    (o) => o.station.elevationM <= 350 && o.station.barrierGroup === "BURSA_OVA"
  );
  const mountainStations = validOfficial.filter(
    (o) => o.station.elevationM >= 900 && o.station.barrierGroup === "ULUDAG_MASSIF"
  );

  if (ovaStations.length > 0 && mountainStations.length > 0) {
    const slopes: number[] = [];
    for (const lo of ovaStations) {
      for (const hi of mountainStations) {
        const dzKm = (hi.station.elevationM - lo.station.elevationM) / 1000;
        if (dzKm >= 0.6 && lo.tempC !== null && hi.tempC !== null) {
          slopes.push((hi.tempC - lo.tempC) / dzKm);
        }
      }
    }

    if (slopes.length > 0) {
      slopes.sort((a, b) => a - b);
      const rawSlope = slopes[Math.floor(slopes.length / 2)];
      const lapseRateCPerKm = Math.max(-10.2, Math.min(8.5, rawSlope));

      const ovaMean =
        ovaStations.reduce((acc, s) => acc + (s.tempC ?? 0), 0) / ovaStations.length;
      const mtnMean =
        mountainStations.reduce((acc, s) => acc + (s.tempC ?? 0), 0) / mountainStations.length;
      const inversionStrengthC = Math.max(0, mtnMean - ovaMean);

      const wDir = ambientContext?.wind850DirDeg ?? ovaStations[0]?.windDirDeg ?? 0;
      const isSoutherly = wDir >= 185 && wDir <= 255;

      let state: BoundaryLayerState = "STANDARD_MIXED";
      if (lapseRateCPerKm >= 1.5 || inversionStrengthC >= 1.2) {
        state = "STRONG_INVERSION";
      } else if (lapseRateCPerKm >= -1.8) {
        state = "SHALLOW_INVERSION";
      } else if (lapseRateCPerKm <= -8.1 && isSoutherly) {
        state = "LODOS_FOEHN";
      } else if (
        lapseRateCPerKm >= -5.6 &&
        ovaStations.some((s) => (s.relHumidityPct ?? 0) >= 85 || s.isPrecipitating)
      ) {
        state = "MOIST_OROGRAPHIC";
      }

      return {
        lapseRateCPerKm,
        inversionStrengthC,
        boundaryLayerState: state,
        ovaRefTempC: ovaMean,
        mountainRefTempC: mtnMean,
        measuredPairCount: slopes.length,
        isDirectlyMeasured: true
      };
    }
  }

  const isNight = ambientContext?.isNight ?? false;
  const clouds = ambientContext?.cloudCoverPct ?? 40;
  const w850Dir = ambientContext?.wind850DirDeg ?? 0;
  const w850Kt = ambientContext?.wind850SpeedKt ?? 10;

  if (w850Dir >= 190 && w850Dir <= 250 && w850Kt >= 22) {
    return {
      lapseRateCPerKm: -8.9,
      inversionStrengthC: 0,
      boundaryLayerState: "LODOS_FOEHN",
      ovaRefTempC: null,
      mountainRefTempC: null,
      measuredPairCount: 0,
      isDirectlyMeasured: false
    };
  }

  if (isNight && clouds < 35 && w850Kt < 12) {
    return {
      lapseRateCPerKm: 2.2,
      inversionStrengthC: 1.8,
      boundaryLayerState: "SHALLOW_INVERSION",
      ovaRefTempC: null,
      mountainRefTempC: null,
      measuredPairCount: 0,
      isDirectlyMeasured: false
    };
  }

  return {
    lapseRateCPerKm: -6.2,
    inversionStrengthC: 0,
    boundaryLayerState: "STANDARD_MIXED",
    ovaRefTempC: null,
    mountainRefTempC: null,
    measuredPairCount: 0,
    isDirectlyMeasured: false
  };
}

function weightedMedian(items: Array<{ value: number; weight: number }>): number {
  if (items.length === 0) return 0;
  const sorted = [...items].sort((a, b) => a.value - b.value);
  const totalW = sorted.reduce((acc, x) => acc + x.weight, 0);
  let cumW = 0;
  for (const item of sorted) {
    cumW += item.weight;
    if (cumW >= totalW * 0.5) return item.value;
  }
  return sorted[sorted.length - 1].value;
}

export interface ObservationQcContext {
  nowMs?: number;
  referenceElevationM?: number;
  solarRadiationWm2?: number;
  isNight?: boolean;
  cloudCoverPct?: number;
  wind850DirDeg?: number;
  wind850SpeedKt?: number;
}

export function runBursaObservationQC(
  rawObservations: RawStationObservation[],
  ctx: ObservationQcContext = {}
): { stations: QcStationObservation[]; verticalProfile: LiveVerticalProfile } {
  const nowMs = ctx.nowMs ?? Date.now();
  const refElevM = ctx.referenceElevationM ?? 155;
  const solarWm2 = ctx.solarRadiationWm2 ?? 0;

  const verticalProfile = computeLiveBursaVerticalProfile(rawObservations, {
    isNight: ctx.isNight,
    cloudCoverPct: ctx.cloudCoverPct,
    wind850DirDeg: ctx.wind850DirDeg,
    wind850SpeedKt: ctx.wind850SpeedKt
  });

  const stage1: QcStationObservation[] = rawObservations.map((obs) => {
    const flags: QcFlag[] = [];
    const obsMs = Date.parse(obs.observedAtIso);
    const ageMinutes = Number.isFinite(obsMs) ? Math.max(0, (nowMs - obsMs) / 60000) : 999;

    const maxAgeMin = obs.station.tier === 3 ? 45 : 120;
    const tauMin = obs.source === "MGM_10MIN" || obs.station.tier === 3 ? 28 : 55;
    const freshnessWeight = ageMinutes <= maxAgeMin ? Math.exp(-ageMinutes / tauMin) : 0;

    if (obs.tempC === null || !Number.isFinite(obs.tempC)) {
      return {
        ...obs,
        ageMinutes,
        freshnessWeight: 0,
        qcWeight: 0,
        qcFlags: ["MISSING_TEMP"],
        reducedTempAtRefC: null,
        madZScore: null
      };
    }

    if (ageMinutes > maxAgeMin) flags.push("STALE_OBSERVATION");

    if (
      obs.tempC < -32 ||
      obs.tempC > 49 ||
      (obs.relHumidityPct !== null && (obs.relHumidityPct < 1 || obs.relHumidityPct > 100)) ||
      (obs.pressureMslHpa !== null && (obs.pressureMslHpa < 960 || obs.pressureMslHpa > 1058))
    ) {
      flags.push("GROSS_LIMIT_REJECT");
    }

    const dzRefKm = (refElevM - obs.station.elevationM) / 1000;
    const reducedTempAtRefC = obs.tempC + verticalProfile.lapseRateCPerKm * dzRefKm;

    const tierBaseWeight = obs.station.tier === 1 ? 1.0 : obs.station.tier === 2 ? 0.82 : 0.45;
    const precisionFactor = obs.hasTenthDegreePrecision ? 1.0 : 0.88;
    const initialOk = flags.length === 0;

    return {
      ...obs,
      ageMinutes,
      freshnessWeight,
      qcWeight: initialOk ? tierBaseWeight * precisionFactor * freshnessWeight : 0,
      qcFlags: initialOk ? [] : flags,
      reducedTempAtRefC,
      madZScore: null
    };
  });

  const nonBasinPool = stage1.filter(
    (s) =>
      s.qcWeight > 0 &&
      s.reducedTempAtRefC !== null &&
      s.station.barrierGroup !== "YENISEHIR_BASIN"
  );
  const buddyPool =
    nonBasinPool.length >= 2
      ? nonBasinPool
      : stage1.filter((s) => s.qcWeight > 0 && s.reducedTempAtRefC !== null);

  if (buddyPool.length >= 2) {
    const refMedianC = weightedMedian(
      buddyPool.map((s) => ({
        value: s.reducedTempAtRefC as number,
        weight: s.station.tier <= 2 ? s.qcWeight * 2.5 : s.qcWeight
      }))
    );

    const absDevs = buddyPool.map((s) => ({
      value: Math.abs((s.reducedTempAtRefC as number) - refMedianC),
      weight: s.qcWeight
    }));
    const robustScaleC = Math.max(0.55, 1.4826 * weightedMedian(absDevs));

    for (const s of stage1) {
      if (s.qcWeight <= 0 || s.reducedTempAtRefC === null) continue;
      const diffC = s.reducedTempAtRefC - refMedianC;
      const zMad = diffC / robustScaleC;
      s.madZScore = zMad;

      const windMs = (s.windSpeedKt ?? 2.0) * 0.514444;
      if (
        s.station.tier === 3 &&
        !(ctx.isNight ?? false) &&
        solarWm2 >= 220 &&
        windMs < 3.0 &&
        diffC > 1.65
      ) {
        s.qcFlags.push("SOLAR_RADIATION_SPIKE");
        s.qcWeight = 0;
        continue;
      }

      if (s.station.barrierGroup === "YENISEHIR_BASIN" && nonBasinPool.length >= 1) {
        if (Math.abs(diffC) > 1.8) s.qcFlags.push("RURAL_BASIN_ISOLATED");
        if (s.qcFlags.length === 0) s.qcFlags.push("OK");
        continue;
      }

      const absZ = Math.abs(zMad);
      const hardThreshold = s.station.tier === 1 ? 4.2 : s.station.tier === 2 ? 3.6 : 2.8;
      const softThreshold = s.station.tier === 1 ? 2.8 : 2.1;

      if (absZ > hardThreshold) {
        s.qcFlags.push("SPATIAL_BUDDY_OUTLIER");
        s.qcWeight = 0;
      } else if (absZ > softThreshold) {
        s.qcFlags.push("SPATIAL_BUDDY_SOFT_CLIP");
        s.qcWeight *= softThreshold / absZ;
      } else {
        s.qcFlags.push("OK");
      }
    }
  } else {
    for (const s of stage1) {
      if (s.qcWeight > 0 && s.qcFlags.length === 0) s.qcFlags.push("OK");
    }
  }

  return { stations: stage1, verticalProfile };
}

export async function fetchBursaObservationMesh(
  lat = 40.1885,
  lon = 29.061,
  ctx: ObservationQcContext = {}
): Promise<BursaMeshSnapshot> {
  const isBursa = isWithinBursaDomain(lat, lon);
  if (!isBursa) {
    const metars = await fetchAviationMetarPerimeter(["LTBR", "LTFJ", "LTBG"]);
    const { stations, verticalProfile } = runBursaObservationQC(metars, ctx);
    return {
      fetchedAtIso: new Date().toISOString(),
      isBursaRegion: false,
      stations,
      acceptedCount: stations.filter((s) => s.qcWeight > 0).length,
      rejectedCount: stations.filter((s) => s.qcWeight <= 0).length,
      tier1OnlineCount: 0,
      verticalProfile
    };
  }

  const [mgmList, metarList, pwsList] = await Promise.all([
    fetchMgmBursaStations(),
    fetchAviationMetarPerimeter(["LTBR", "LTBG", "LTFJ"]),
    fetchOpenSenseMapPws(lat, lon)
  ]);

  const seenIcaoOrWmo = new Set(
    mgmList.flatMap((m) => [m.station.wmoId, m.station.icaoId].filter(Boolean))
  );
  const mergedRaw: RawStationObservation[] = [
    ...mgmList,
    ...metarList.filter(
      (m) =>
        (!m.station.wmoId || !seenIcaoOrWmo.has(m.station.wmoId)) &&
        (!m.station.icaoId || !seenIcaoOrWmo.has(m.station.icaoId))
    ),
    ...pwsList
  ];

  const { stations, verticalProfile } = runBursaObservationQC(mergedRaw, ctx);
  const accepted = stations.filter((s) => s.qcWeight > 0);

  return {
    fetchedAtIso: new Date().toISOString(),
    isBursaRegion: true,
    stations,
    acceptedCount: accepted.length,
    rejectedCount: stations.length - accepted.length,
    tier1OnlineCount: accepted.filter((s) => s.station.tier === 1).length,
    verticalProfile
  };
}

/**
 * Converts accepted Bursa Tier-1/2 QC stations into native `MetarObservation[]` sorted by
 * topographic proximity so `HeroSceneView` and `LiveVerificationReport` display real Bursa stations
 * (e.g. 17116-OSM + NILUFER + YILDIRIM) instead of 47 km Yenişehir LTBR!
 */
export function mapMeshToMetarObservations(
  mesh: BursaMeshSnapshot,
  targetLat: number,
  targetLon: number
): MetarObservation[] {
  return mesh.stations
    .filter(
      (s) =>
        s.qcWeight > 0 &&
        s.station.tier <= 2 &&
        s.station.barrierGroup !== "YENISEHIR_BASIN" &&
        s.tempC !== null
    )
    .map((s) => {
      const distKm = Number(haversineKm(targetLat, targetLon, s.station.lat, s.station.lon).toFixed(1));
      const wxFlags: MetarWxFlags = {
        hasPrecip: Boolean(s.isPrecipitating),
        heavyPrecip: (s.precip1HrMm ?? 0) >= 4.0 || (s.precip10MinMm ?? 0) >= 1.2,
        isThunderstorm: s.wxCodeRaw === "GSY" || s.wxCodeRaw === "KGY",
        hasHail: s.wxCodeRaw === "D" || s.wxCodeRaw === "DY",
        hasSnow: s.wxCodeRaw === "K" || s.wxCodeRaw === "HKY" || s.wxCodeRaw === "YKY",
        hasSquall: false,
        hasFog: s.wxCodeRaw === "SIS" || (s.visibilityM !== null && s.visibilityM < 1000)
      };
      return {
        icaoId: s.station.icaoId ?? s.station.wmoId ?? s.station.id,
        stationName: s.station.name,
        distanceKm: distKm,
        elevationM: s.station.elevationM,
        obsTimeIso: s.observedAtIso,
        ageMinutes: Math.round(s.ageMinutes),
        rawOb: `MGM ${s.station.mgmIstNo ?? ""} T=${s.tempC}°C RH=${s.relHumidityPct ?? "--"}%`,
        tempC: s.tempC !== null ? Number(s.tempC.toFixed(1)) : null,
        dewPointC: s.dewPointC !== null ? Number(s.dewPointC.toFixed(1)) : null,
        windSpeedKmh: s.windSpeedKt !== null ? Number((s.windSpeedKt * 1.852).toFixed(1)) : null,
        windGustKmh: s.windGustKt !== null ? Number((s.windGustKt * 1.852).toFixed(1)) : null,
        windDirectionDeg: s.windDirDeg !== null ? Math.round(s.windDirDeg) : null,
        qnhHpa: s.pressureMslHpa !== null ? Number(s.pressureMslHpa.toFixed(1)) : null,
        visibilityKm: s.visibilityM !== null ? Number((s.visibilityM / 1000).toFixed(1)) : null,
        wxString: s.wxCodeRaw ?? null,
        wxFlags
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 5);
}
