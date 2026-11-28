import { CORE_MODEL_KEYS } from "./model-registry";
import {
  isSnowLinePhysicallyRelevant,
  isWetActiveSample,
  PRECIP_WETNESS_CONTRACT,
  type BeaufortInfo,
  type CoreModelKey,
  type GeoLocation,
  type HourlyHorizonHours,
  type HybridModelSnapshot,
  type PrecipitationConsensus,
  type PrecipType,
  type PressureTrend,
  type SynopticSignal,
  type UnitSystem
} from "./weather-types";

export * from "./weather-types";
export {
  PRECIP_WETNESS_CONTRACT,
  isWetActiveSample,
  isSnowLinePhysicallyRelevant,
  type HourlyHorizonHours
};

/**
 * Resmi Bursa Hava Merkezi Referansı:
 * MGM Bursa Bölge / Osmangazi Merkez Rasathanesi (WMO 17116 — 40.2308°K, 29.0133°D, 100 m).
 * Eski 40.1885, 29.0610 (155 m) idari iğnesi Gökdere/Setbaşı sınırında kaldığı için MGM Yıldırım (18746)
 * istasyonuna (4.06 km) WMO 17116 Bursa Merkez'den (6.21 km) daha yakın düşüyordu.
 */
export const BURSA_WMO_17116_LAT = 40.2308;
export const BURSA_WMO_17116_LON = 29.0133;
export const BURSA_WMO_17116_ELEVATION_M = 100;

const envCity =
  typeof process !== "undefined" && process.env?.DEFAULT_CITY
    ? process.env.DEFAULT_CITY
    : "Bursa";
const envLat =
  typeof process !== "undefined" && process.env?.DEFAULT_LAT
    ? Number(process.env.DEFAULT_LAT)
    : BURSA_WMO_17116_LAT;
const envLon =
  typeof process !== "undefined" && process.env?.DEFAULT_LON
    ? Number(process.env.DEFAULT_LON)
    : BURSA_WMO_17116_LON;

export const DEFAULT_LOCATION: GeoLocation = {
  id: "bursa-tr",
  name: envCity,
  admin1: "Osmangazi · Merkez (WMO 17116)",
  country: "Türkiye",
  countryCode: "TR",
  lat: Number.isFinite(envLat) ? envLat : BURSA_WMO_17116_LAT,
  lon: Number.isFinite(envLon) ? envLon : BURSA_WMO_17116_LON,
  elevation: BURSA_WMO_17116_ELEVATION_M,
  timezone: "Europe/Istanbul"
};

export const BURSA_CURATED_LOCATIONS: GeoLocation[] = [
  DEFAULT_LOCATION,
  {
    id: "bursa-nilufer-tr",
    name: "Nilüfer",
    admin1: "Bursa · Batı Ova (MGM 18386)",
    country: "Türkiye",
    countryCode: "TR",
    lat: 40.2286,
    lon: 28.8585,
    elevation: 105,
    timezone: "Europe/Istanbul"
  },
  {
    id: "bursa-osmangazi-etek-tr",
    name: "Osmangazi (Heykel / Çekirge)",
    admin1: "Bursa · Tarihi Etek",
    country: "Türkiye",
    countryCode: "TR",
    lat: 40.1965,
    lon: 29.0385,
    elevation: 205,
    timezone: "Europe/Istanbul"
  },
  {
    id: "bursa-yildirim-tr",
    name: "Yıldırım",
    admin1: "Bursa · Doğu Etek (MGM 18746)",
    country: "Türkiye",
    countryCode: "TR",
    lat: 40.1919,
    lon: 29.1086,
    elevation: 147,
    timezone: "Europe/Istanbul"
  },
  {
    id: "bursa-mudanya-tr",
    name: "Mudanya",
    admin1: "Bursa · Marmara Kıyısı (MGM 18385)",
    country: "Türkiye",
    countryCode: "TR",
    lat: 40.3753,
    lon: 28.8822,
    elevation: 15,
    timezone: "Europe/Istanbul"
  },
  {
    id: "bursa-uludag-tr",
    name: "Uludağ (Oteller / Zirve)",
    admin1: "Bursa · Zirve Kuşağı (MGM 17676)",
    country: "Türkiye",
    countryCode: "TR",
    lat: 40.1069,
    lon: 29.1292,
    elevation: 1850,
    timezone: "Europe/Istanbul"
  },
  {
    id: "bursa-gemlik-tr",
    name: "Gemlik",
    admin1: "Bursa · Körfez",
    country: "Türkiye",
    countryCode: "TR",
    lat: 40.4325,
    lon: 29.1564,
    elevation: 15,
    timezone: "Europe/Istanbul"
  },
  {
    id: "bursa-gursu-tr",
    name: "Gürsu",
    admin1: "Bursa · Doğu Ova",
    country: "Türkiye",
    countryCode: "TR",
    lat: 40.2153,
    lon: 29.1886,
    elevation: 105,
    timezone: "Europe/Istanbul"
  },
  {
    id: "bursa-kestel-tr",
    name: "Kestel",
    admin1: "Bursa · Doğu Havza (MGM 18384)",
    country: "Türkiye",
    countryCode: "TR",
    lat: 40.1861,
    lon: 29.2106,
    elevation: 230,
    timezone: "Europe/Istanbul"
  },
  {
    id: "bursa-inegol-tr",
    name: "İnegöl",
    admin1: "Bursa · İç Havza",
    country: "Türkiye",
    countryCode: "TR",
    lat: 40.0781,
    lon: 29.5133,
    elevation: 295,
    timezone: "Europe/Istanbul"
  }
];

function normalizeTrAscii(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

const EXPLICIT_BURSA_SUBLOCATIONS = [
  "yildirim",
  "nilufer",
  "mudanya",
  "uludag",
  "kestel",
  "gursu",
  "gemlik",
  "inegol",
  "karacabey",
  "yenisehir",
  "mustafakemalpasa",
  "orhangazi",
  "iznik",
  "keles",
  "orhaneli",
  "buyukorhan",
  "harmancik",
  "cekirge",
  "heykel",
  "gorukle"
];

/**
 * Genel "Bursa" / "Bursa Merkez" aramalarını (Open-Meteo GeoNames 40.1956, 29.0601 155m pini
 * veya eski önbellekteki 40.1885, 29.0610 155m pini dahil) resmi Bursa Hava Merkezi olan
 * WMO 17116 (Osmangazi Merkez, 40.2308°K, 29.0133°D, 100 m) noktasına kenetler.
 * Kullanıcının açıkça seçtiği ilçelere (Yıldırım, Nilüfer, Uludağ, Mudanya vb.) asla dokunmaz!
 */
export function normalizeCanonicalBursaLocation(loc: GeoLocation): GeoLocation {
  const nameKey = normalizeTrAscii(loc.name || "");
  const idKey = normalizeTrAscii(loc.id || "");
  const hasExplicitSubloc = EXPLICIT_BURSA_SUBLOCATIONS.some(
    (sub) => nameKey.includes(sub) || idKey.includes(sub)
  );
  if (hasExplicitSubloc) {
    return loc;
  }

  const isGenericBursaName =
    nameKey === "bursa" ||
    nameKey === "bursa merkez" ||
    nameKey === "merkez, bursa" ||
    idKey === "bursa-tr";

  const inCentralBursaBox =
    loc.lat >= 40.15 &&
    loc.lat <= 40.28 &&
    loc.lon >= 28.95 &&
    loc.lon <= 29.11 &&
    (loc.elevation === undefined || loc.elevation <= 350);

  if (isGenericBursaName && inCentralBursaBox) {
    return {
      ...loc,
      id: loc.id === "bursa-tr" ? "bursa-tr" : loc.id || "bursa-tr",
      name: loc.name?.trim() ? loc.name.trim() : "Bursa",
      admin1: "Osmangazi · Merkez (WMO 17116)",
      country: loc.country || "Türkiye",
      countryCode: loc.countryCode || "TR",
      lat: BURSA_WMO_17116_LAT,
      lon: BURSA_WMO_17116_LON,
      elevation: BURSA_WMO_17116_ELEVATION_M,
      timezone: loc.timezone || "Europe/Istanbul"
    };
  }

  return loc;
}

export const PRESET_CITIES: GeoLocation[] = [
  DEFAULT_LOCATION,
  {
    id: "istanbul-tr",
    name: "İstanbul",
    admin1: "İstanbul",
    country: "Türkiye",
    countryCode: "TR",
    lat: 41.0082,
    lon: 28.9784,
    elevation: 40,
    timezone: "Europe/Istanbul"
  },
  {
    id: "ankara-tr",
    name: "Ankara",
    admin1: "Ankara",
    country: "Türkiye",
    countryCode: "TR",
    lat: 39.9334,
    lon: 32.8597,
    elevation: 890,
    timezone: "Europe/Istanbul"
  },
  {
    id: "izmir-tr",
    name: "İzmir",
    admin1: "İzmir",
    country: "Türkiye",
    countryCode: "TR",
    lat: 38.4237,
    lon: 27.1428,
    elevation: 25,
    timezone: "Europe/Istanbul"
  },
  {
    id: "trabzon-tr",
    name: "Trabzon",
    admin1: "Trabzon",
    country: "Türkiye",
    countryCode: "TR",
    lat: 41.0027,
    lon: 39.7168,
    elevation: 39,
    timezone: "Europe/Istanbul"
  }
];

export const GLOBE_CITIES: GeoLocation[] = [
  ...PRESET_CITIES,
  {
    id: "london-gb",
    name: "Londra",
    country: "Birleşik Krallık",
    countryCode: "GB",
    lat: 51.5072,
    lon: -0.1276,
    timezone: "Europe/London"
  },
  {
    id: "tokyo-jp",
    name: "Tokyo",
    country: "Japonya",
    countryCode: "JP",
    lat: 35.6762,
    lon: 139.6503,
    timezone: "Asia/Tokyo"
  },
  {
    id: "newyork-us",
    name: "New York",
    country: "ABD",
    countryCode: "US",
    lat: 40.7128,
    lon: -74.006,
    timezone: "America/New_York"
  },
  {
    id: "reykjavik-is",
    name: "Reykjavik",
    country: "İzlanda",
    countryCode: "IS",
    lat: 64.1466,
    lon: -21.9426,
    timezone: "Atlantic/Reykjavik"
  },
  {
    id: "sydney-au",
    name: "Sidney",
    country: "Avustralya",
    countryCode: "AU",
    lat: -33.8688,
    lon: 151.2093,
    timezone: "Australia/Sydney"
  }
];

const CANONICAL_STATION_CATALOG: GeoLocation[] = (() => {
  const seen = new Set<string>();
  const out: GeoLocation[] = [];
  for (const item of [...BURSA_CURATED_LOCATIONS, ...GLOBE_CITIES]) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
})();

function isInBursaLowPlainCorridor(loc: Pick<GeoLocation, "lat" | "lon" | "elevation">): boolean {
  return (
    loc.lat >= 40.205 &&
    loc.lat <= 40.265 &&
    loc.lon >= 28.97 &&
    loc.lon <= 29.06 &&
    (loc.elevation === undefined ||
      !Number.isFinite(loc.elevation) ||
      loc.elevation <= 165)
  );
}

/**
 * İstasyon kimliğini kanonikleştirir:
 * - Önce `normalizeCanonicalBursaLocation` uygular.
 * - Bursa alçak ova koridorundaki (<= 165m) "Osmangazi" / "Bursa" / "Bursa Merkez" noktalarını
 *   (205m Heykel/Çekirge ve `bursa-osmangazi-etek-tr` hariç) `DEFAULT_LOCATION` ile birleştirir.
 * - `BURSA_CURATED_LOCATIONS` ve `GLOBE_CITIES` içinde hem yatay (<= 0.018°) hem dikey (< 65m)
 *   eşleşen istasyonların kanonik `id`, `elevation`, `admin1`, `timezone`, `countryCode` alanlarını korur.
 */
export function canonicalizeStationIdentity(raw: GeoLocation): GeoLocation {
  const norm = normalizeCanonicalBursaLocation(raw);

  const rawIdKey = normalizeTrAscii(raw.id || "");
  const normIdKey = normalizeTrAscii(norm.id || "");
  const rawNameKey = normalizeTrAscii(raw.name || "");
  const normNameKey = normalizeTrAscii(norm.name || "");

  const isHeykelOrEtek =
    rawIdKey === "bursa-osmangazi-etek-tr" ||
    normIdKey === "bursa-osmangazi-etek-tr" ||
    rawNameKey.includes("heykel") ||
    rawNameKey.includes("cekirge") ||
    normNameKey.includes("heykel") ||
    normNameKey.includes("cekirge");

  const isBursaPlainName =
    normNameKey === "osmangazi" ||
    normNameKey === "bursa" ||
    normNameKey === "bursa merkez" ||
    normNameKey === "merkez, bursa" ||
    rawNameKey === "osmangazi" ||
    rawNameKey === "bursa" ||
    rawNameKey === "bursa merkez" ||
    normIdKey === "bursa-tr";

  if (
    !isHeykelOrEtek &&
    isBursaPlainName &&
    (isInBursaLowPlainCorridor(raw) || isInBursaLowPlainCorridor(norm))
  ) {
    return {
      ...DEFAULT_LOCATION,
      id: "bursa-tr",
      name: "Bursa",
      lat: BURSA_WMO_17116_LAT,
      lon: BURSA_WMO_17116_LON,
      elevation: BURSA_WMO_17116_ELEVATION_M
    };
  }

  let bestMatch: GeoLocation | null = null;
  let bestDist = Infinity;

  for (const cand of CANONICAL_STATION_CATALOG) {
    if (
      norm.id &&
      norm.id.startsWith("bursa-") &&
      cand.id.startsWith("bursa-") &&
      norm.id !== cand.id
    ) {
      continue;
    }

    const dLat = Math.abs(cand.lat - norm.lat);
    const dLon = Math.abs(cand.lon - norm.lon);
    if (dLat > 0.018 || dLon > 0.018) continue;

    if (
      typeof cand.elevation === "number" &&
      Number.isFinite(cand.elevation) &&
      typeof norm.elevation === "number" &&
      Number.isFinite(norm.elevation) &&
      Math.abs(cand.elevation - norm.elevation) >= 65
    ) {
      continue;
    }

    const dist = Math.hypot(dLat, dLon);
    if (dist < bestDist) {
      bestDist = dist;
      bestMatch = cand;
    }
  }

  if (bestMatch) {
    const hasCustomName =
      Boolean(norm.name?.trim()) && !norm.name.includes("°");
    return {
      ...norm,
      id: bestMatch.id,
      name: hasCustomName ? norm.name.trim() : bestMatch.name,
      admin1: bestMatch.admin1 ?? norm.admin1,
      country: norm.country?.trim() ? norm.country.trim() : bestMatch.country,
      countryCode: bestMatch.countryCode ?? norm.countryCode,
      elevation:
        bestMatch.elevation !== undefined ? bestMatch.elevation : norm.elevation,
      timezone: bestMatch.timezone ?? norm.timezone
    };
  }

  return norm;
}

/**
 * Hero/WeatherContext, WorldView ve DashboardView için birebir aynı `/api/weather` URL'sini
 * ve sunucu L1 önbellek anahtarını üreten paylaşımlı yardımcı.
 */
export function buildWeatherApiUrl(loc: GeoLocation): string {
  const c = canonicalizeStationIdentity(normalizeCanonicalBursaLocation(loc));
  const qs = new URLSearchParams({
    lat: String(c.lat),
    lon: String(c.lon),
    name: c.name,
    country: c.country ?? ""
  });
  if (c.admin1) {
    qs.set("admin1", c.admin1);
  }
  if (c.elevation !== undefined && Number.isFinite(c.elevation)) {
    qs.set("elevation", String(Math.round(c.elevation)));
  }
  return `/api/weather?${qs.toString()}`;
}

function fractionalYearRad(dateUtc: Date): number {
  const year = dateUtc.getUTCFullYear();
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInYear = isLeap ? 366 : 365;
  const startOfYear = Date.UTC(year, 0, 1);
  const dayOfYear = Math.floor((dateUtc.getTime() - startOfYear) / 86400000);
  const utcHours =
    dateUtc.getUTCHours() +
    dateUtc.getUTCMinutes() / 60 +
    dateUtc.getUTCSeconds() / 3600;
  return ((2 * Math.PI) / daysInYear) * (dayOfYear + (utcHours - 12) / 24);
}

export function computeEquationOfTimeMin(dateUtc: Date): number {
  const g = fractionalYearRad(dateUtc);
  return (
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(g) -
      0.032077 * Math.sin(g) -
      0.014615 * Math.cos(2 * g) -
      0.040849 * Math.sin(2 * g))
  );
}

export function computeSolarDeclinationRad(dateUtc: Date): number {
  const g = fractionalYearRad(dateUtc);
  return (
    0.006918 -
    0.399912 * Math.cos(g) +
    0.070257 * Math.sin(g) -
    0.006758 * Math.cos(2 * g) +
    0.000907 * Math.sin(2 * g) -
    0.002697 * Math.cos(3 * g) +
    0.00148 * Math.sin(3 * g)
  );
}

export function computeSolarElevationDeg(
  lat: number,
  lon: number,
  dateUtc: Date
): number {
  const eqtime = computeEquationOfTimeMin(dateUtc);
  const decl = computeSolarDeclinationRad(dateUtc);
  const latRad = (lat * Math.PI) / 180;

  const utcMinutes =
    dateUtc.getUTCHours() * 60 +
    dateUtc.getUTCMinutes() +
    dateUtc.getUTCSeconds() / 60;
  const trueSolarTimeMin = (utcMinutes + eqtime + 4 * lon + 1440) % 1440;
  const hourAngleDeg = trueSolarTimeMin / 4 - 180;
  const hourAngleRad = (hourAngleDeg * Math.PI) / 180;

  const sinElev =
    Math.sin(latRad) * Math.sin(decl) +
    Math.cos(latRad) * Math.cos(decl) * Math.cos(hourAngleRad);
  const trueElevDeg =
    (Math.asin(Math.max(-1, Math.min(1, sinElev))) * 180) / Math.PI;

  let refractionDeg = 0;
  if (trueElevDeg > -0.575 && trueElevDeg < 85) {
    const tanVal = Math.tan(((trueElevDeg + 10.3 / (trueElevDeg + 5.11)) * Math.PI) / 180);
    refractionDeg = 1.02 / (60 * tanVal);
  }
  return trueElevDeg + refractionDeg;
}

export function solarElevationToDaylight(elevDeg: number): number {
  if (elevDeg <= -8) return 0;
  if (elevDeg >= 35) return 1;
  return Number(((elevDeg + 8) / 43).toFixed(3));
}

export function computeSubsolarPoint(dateUtc: Date): { lat: number; lon: number } {
  const declRad = computeSolarDeclinationRad(dateUtc);
  const eqtimeMin = computeEquationOfTimeMin(dateUtc);
  const utcMinutes =
    dateUtc.getUTCHours() * 60 +
    dateUtc.getUTCMinutes() +
    dateUtc.getUTCSeconds() / 60;
  const lat = (declRad * 180) / Math.PI;
  let lon = (720 - utcMinutes - eqtimeMin) / 4;
  while (lon > 180) lon -= 360;
  while (lon < -180) lon += 360;
  return { lat, lon };
}

export function mapWmoCodeToLabel(code: number): string {
  if (code === 0) return "Açık";
  if (code === 1) return "Az Bulutlu";
  if (code === 2) return "Parçalı Bulutlu";
  if (code === 3) return "Çok Bulutlu";
  if (code === 45 || code === 48) return "Sisli";
  if (code === 56 || code === 57 || code === 66 || code === 67) return "Donan Yağmur";
  if (code >= 51 && code <= 55) return "Çiseleyen Yağmur";
  if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) return "Yağmurlu";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "Kar Yağışlı";
  if (code >= 95) return "Gök Gürültülü Sağanak";
  return "Değişken";
}

export function mapWmoToPrecipType(
  code: number,
  rainMm = 0,
  snowCm = 0
): PrecipType {
  if (snowCm > 0 || (code >= 71 && code <= 77) || code === 85 || code === 86) {
    return "snow";
  }
  if (
    rainMm > 0 ||
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    code >= 95
  ) {
    return "rain";
  }
  return "none";
}

export function mapEuropeanAqi(aqi: number): {
  categoryIndex: 1 | 2 | 3 | 4 | 5 | 6;
  label: string;
} {
  if (aqi <= 20) return { categoryIndex: 1, label: "İyi" };
  if (aqi <= 40) return { categoryIndex: 2, label: "Makul" };
  if (aqi <= 60) return { categoryIndex: 3, label: "Orta" };
  if (aqi <= 80) return { categoryIndex: 4, label: "Kötü" };
  if (aqi <= 100) return { categoryIndex: 5, label: "Çok Kötü" };
  return { categoryIndex: 6, label: "Aşırı Kötü" };
}

export function detectDominantPollutant(aq: {
  pm25: number;
  pm10: number;
  ozone: number;
  no2: number;
  so2: number;
}): { dominantPollutant: string; dominantValueText: string } {
  const scoreBands = (val: number, bands: [number, number, number, number, number]): number => {
    if (val <= bands[0]) return (val / bands[0]) * 20;
    if (val <= bands[1]) return 20 + ((val - bands[0]) / (bands[1] - bands[0])) * 20;
    if (val <= bands[2]) return 40 + ((val - bands[1]) / (bands[2] - bands[1])) * 20;
    if (val <= bands[3]) return 60 + ((val - bands[2]) / (bands[3] - bands[2])) * 20;
    if (val <= bands[4]) return 80 + ((val - bands[3]) / (bands[4] - bands[3])) * 20;
    return 100 + ((val - bands[4]) / bands[4]) * 20;
  };

  const candidates = [
    { name: "PM2.5", score: scoreBands(aq.pm25, [5, 15, 50, 90, 140]), text: `${aq.pm25} µg/m³` },
    { name: "PM10", score: scoreBands(aq.pm10, [15, 45, 90, 180, 270]), text: `${aq.pm10} µg/m³` },
    { name: "O₃", score: scoreBands(aq.ozone, [50, 100, 130, 240, 380]), text: `${aq.ozone} µg/m³` },
    { name: "NO₂", score: scoreBands(aq.no2, [10, 40, 90, 120, 230]), text: `${aq.no2} µg/m³` },
    { name: "SO₂", score: scoreBands(aq.so2, [50, 100, 200, 350, 500]), text: `${aq.so2} µg/m³` }
  ];

  candidates.sort((a, b) => b.score - a.score);
  return {
    dominantPollutant: candidates[0].name,
    dominantValueText: candidates[0].text
  };
}

export function classifyPressureTrend(delta3h: number): PressureTrend {
  if (delta3h >= 3.6) return "hızlı yükseliyor";
  if (delta3h >= 0.5) return "yükseliyor";
  if (delta3h <= -3.6) return "hızlı düşüyor";
  if (delta3h <= -0.5) return "düşüyor";
  return "sabit";
}

export function describePressureTrendDetail(delta3h: number): string {
  const abs = Math.abs(delta3h);
  if (abs < 0.5) return "Sabit barometre";
  if (abs < 1.6) return delta3h > 0 ? "Yavaş yükseliyor" : "Yavaş düşüyor";
  if (abs < 3.6) return delta3h > 0 ? "Belirgin yükseliş" : "Belirgin düşüş";
  if (abs < 6.0) return delta3h > 0 ? "Hızlı yükseliş" : "Hızlı düşüş (cephe)";
  return delta3h > 0 ? "Çok hızlı yükseliş" : "Şiddetli düşüş (siklon)";
}

export function windKmhToBeaufort(kmh: number): BeaufortInfo {
  if (kmh < 1) return { scale: 0, label: "Sakin" };
  if (kmh < 6) return { scale: 1, label: "Çok hafif" };
  if (kmh < 12) return { scale: 2, label: "Hafif esinti" };
  if (kmh < 20) return { scale: 3, label: "Hafif rüzgar" };
  if (kmh < 29) return { scale: 4, label: "Orta rüzgar" };
  if (kmh < 39) return { scale: 5, label: "Sertçe rüzgar" };
  if (kmh < 50) return { scale: 6, label: "Kuvvetli rüzgar" };
  if (kmh < 62) return { scale: 7, label: "Fırtınamsı" };
  if (kmh < 75) return { scale: 8, label: "Fırtına" };
  if (kmh < 89) return { scale: 9, label: "Kuvvetli fırtına" };
  if (kmh < 103) return { scale: 10, label: "Tam fırtına" };
  if (kmh < 118) return { scale: 11, label: "Şiddetli fırtına" };
  return { scale: 12, label: "Kasırga" };
}

export function classifyUvIndex(uv: number): string {
  if (uv < 3) return "Düşük";
  if (uv < 6) return "Orta";
  if (uv < 8) return "Yüksek";
  if (uv < 11) return "Çok Yüksek";
  return "Aşırı";
}

export function windDirectionToCompass(deg: number): string {
  const dirs = ["K", "KD", "D", "GD", "G", "GB", "B", "KB"];
  const normalized = ((deg % 360) + 360) % 360;
  return dirs[Math.round(normalized / 45) % 8];
}

export function blendWindDirectionDeg(
  dirs: HybridModelSnapshot,
  weights: Partial<Record<CoreModelKey, number>>,
  fallbackDeg: number
): number {
  let sumSin = 0;
  let sumCos = 0;
  let wSum = 0;

  for (const key of CORE_MODEL_KEYS) {
    const d = dirs[key];
    const w = weights[key] ?? 0;
    if (d !== null && d !== undefined && Number.isFinite(d) && w > 0) {
      const rad = (d * Math.PI) / 180;
      sumSin += Math.sin(rad) * w;
      sumCos += Math.cos(rad) * w;
      wSum += w;
    }
  }

  if (wSum <= 0 || (Math.abs(sumSin) < 1e-6 && Math.abs(sumCos) < 1e-6)) {
    return ((Math.round(fallbackDeg) % 360) + 360) % 360;
  }

  const avgDeg = (Math.atan2(sumSin, sumCos) * 180) / Math.PI;
  return Math.round(((avgDeg % 360) + 360) % 360);
}

export function blendHybridParameter(
  snapshot: HybridModelSnapshot,
  weights: Partial<Record<CoreModelKey, number>>,
  fallback: number
): number {
  let num = 0;
  let den = 0;
  for (const key of CORE_MODEL_KEYS) {
    const val = snapshot[key];
    const w = weights[key] ?? 0;
    if (val !== null && val !== undefined && Number.isFinite(val) && w > 0) {
      num += val * w;
      den += w;
    }
  }
  if (den <= 0) return fallback;
  return num / den;
}

export function computePrecipConsensus(
  snapshot: HybridModelSnapshot
): PrecipitationConsensus {
  const vals = CORE_MODEL_KEYS.map((k) => snapshot[k])
    .filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v))
    .sort((a, b) => a - b);

  if (vals.length === 0) {
    return { agreeingModels: 0, totalModels: 0, minMm: 0, medianMm: 0, maxMm: 0 };
  }

  const mid = Math.floor(vals.length / 2);
  const median =
    vals.length % 2 === 0 ? (vals[mid - 1] + vals[mid]) / 2 : vals[mid];
  const agreeing = vals.filter((v) => v >= 0.1).length;

  return {
    agreeingModels: agreeing,
    totalModels: vals.length,
    minMm: Number(vals[0].toFixed(1)),
    medianMm: Number(median.toFixed(1)),
    maxMm: Number(vals[vals.length - 1].toFixed(1))
  };
}

export {
  computeCalibratedWeightedSpread,
  computeIntrinsicAccuracyIndex,
  computeLyapunovHorizonSkill,
  decayConfidenceForStaleOrDegraded,
  type IntrinsicAccuracyBreakdown,
  type IntrinsicAccuracyInput
} from "./accuracy-index";

export function computeHybridConfidence(
  tempSpreadC: number,
  pressureSpreadHpa: number
): number {
  const tempPenalty = Math.max(0, tempSpreadC - 0.6) * 5.8;
  const pressPenalty = Math.max(0, pressureSpreadHpa - 0.6) * 4.2;
  return Math.round(Math.max(45, Math.min(99, 99 - tempPenalty - pressPenalty)));
}

// ============================================================================
// SIZINTISIZ BİRİM YARDIMCILARI (METRIC / IMPERIAL SSOT)
// ============================================================================

export function convertTempValue(celsius: number, unit: UnitSystem): number {
  return unit === "imperial" ? celsius * 1.8 + 32 : celsius;
}

/**
 * Sıcaklık farkı, anomali, RMSE, MAE ve yayılım dönüşümü (KESİNLİKLE +32 eklenmez!).
 */
export function convertTempDelta(deltaC: number, unit: UnitSystem): number {
  const val = unit === "imperial" ? deltaC * 1.8 : deltaC;
  return val === 0 ? 0 : val;
}

export function formatTemperature(
  celsius: number,
  unit: UnitSystem,
  opts?: { decimals?: number; showUnit?: boolean; signed?: boolean }
): string {
  if (!opts) {
    if (unit === "imperial") {
      return `${Math.round((celsius * 9) / 5 + 32)}°F`;
    }
    return `${Math.round(celsius)}°`;
  }

  const val = convertTempValue(celsius, unit);
  const decimals = Math.max(0, opts.decimals ?? 0);
  const factor = 10 ** decimals;
  const rounded = Math.round(val * factor) / factor;
  const clean = Math.abs(rounded) < 1e-9 ? 0 : rounded;
  const numStr = decimals > 0 ? clean.toFixed(decimals) : String(Math.round(clean));
  const prefix = opts.signed && clean > 0 ? "+" : "";

  const unitSuffix =
    opts.showUnit === true
      ? unit === "imperial"
        ? "°F"
        : "°C"
      : opts.showUnit === false
        ? "°"
        : unit === "imperial"
          ? "°F"
          : "°";

  return `${prefix}${numStr}${unitSuffix}`;
}

export function formatTempDelta(
  deltaC: number,
  unit: UnitSystem,
  opts?: { decimals?: number; signed?: boolean; showUnit?: boolean }
): string {
  const val = convertTempDelta(deltaC, unit);
  const decimals = Math.max(0, opts?.decimals ?? 1);
  const signed = opts?.signed ?? true;
  const showUnit = opts?.showUnit ?? true;

  const factor = 10 ** decimals;
  const rounded = Math.round(val * factor) / factor;
  const clean = Math.abs(rounded) < 1e-9 ? 0 : rounded;
  const numStr = decimals > 0 ? clean.toFixed(decimals) : String(Math.round(clean));
  const prefix = signed && clean > 0 ? "+" : "";
  const suffix = showUnit ? (unit === "imperial" ? "°F" : "°C") : "°";
  return `${prefix}${numStr}${suffix}`;
}

export function formatLapseRate(cPerKm: number, unit: UnitSystem): string {
  if (unit === "imperial") {
    const imp = cPerKm * 0.54864;
    const clean = Math.abs(imp) < 1e-9 ? 0 : imp;
    return `${clean.toFixed(1)}°F/kft`;
  }
  const clean = Math.abs(cPerKm) < 1e-9 ? 0 : cPerKm;
  return `${clean.toFixed(1)}°C/km`;
}

export function convertWindSpeed(kmh: number, unit: UnitSystem): number {
  return unit === "imperial" ? kmh * 0.621371 : kmh;
}

export function formatWindSpeed(
  kmh: number,
  unit: UnitSystem,
  opts?: { decimals?: number; showUnit?: boolean; signed?: boolean }
): string {
  if (!opts) {
    if (unit === "imperial") {
      return `${Math.round(kmh * 0.621371)} mph`;
    }
    return `${Math.round(kmh)} km/s`;
  }

  const val = convertWindSpeed(kmh, unit);
  const decimals = Math.max(0, opts.decimals ?? 0);
  const showUnit = opts.showUnit ?? true;
  const factor = 10 ** decimals;
  const rounded = Math.round(val * factor) / factor;
  const clean = Math.abs(rounded) < 1e-9 ? 0 : rounded;
  const numStr = decimals > 0 ? clean.toFixed(decimals) : String(Math.round(clean));
  const prefix = opts.signed && clean > 0 ? "+" : "";
  if (!showUnit) return `${prefix}${numStr}`;
  return `${prefix}${numStr} ${unit === "imperial" ? "mph" : "km/s"}`;
}

export function convertPrecipMm(mm: number, unit: UnitSystem): number {
  return unit === "imperial" ? mm / 25.4 : mm;
}

export function formatPrecip(
  mm: number,
  unit: UnitSystem,
  opts?: { per?: "hour" | "15m"; showUnit?: boolean }
): string {
  const showUnit = opts?.showUnit ?? true;
  const perSuffix =
    opts?.per === "hour" ? "/sa" : opts?.per === "15m" ? "/15dk" : "";
  const unitLabel = unit === "imperial" ? `in${perSuffix}` : `mm${perSuffix}`;
  const suffix = showUnit ? ` ${unitLabel}` : "";

  const safeMm = Number.isFinite(mm) && mm > 0 ? mm : 0;
  if (safeMm <= 0) {
    return unit === "imperial" ? `0.00${suffix}` : `0.0${suffix}`;
  }

  if (unit === "imperial") {
    const inVal = safeMm / 25.4;
    if (inVal < 0.01) {
      return `<0.01${suffix}`;
    }
    return `${inVal.toFixed(2)}${suffix}`;
  }

  if (opts?.per === "15m" && safeMm < 0.1) {
    return `${safeMm.toFixed(2)}${suffix}`;
  }
  if (safeMm < 0.05) {
    return `<0.1${suffix}`;
  }
  return `${safeMm.toFixed(1)}${suffix}`;
}

export function convertSnowCm(cm: number, unit: UnitSystem): number {
  return unit === "imperial" ? cm / 2.54 : cm;
}

export function formatSnowDepth(
  cm: number | null | undefined,
  unit: UnitSystem,
  opts?: { showUnit?: boolean; per?: "hour" | "day" }
): string {
  const showUnit = opts?.showUnit ?? true;
  const perSuffix =
    opts?.per === "hour" ? "/sa" : opts?.per === "day" ? "/gün" : "";
  const unitLabel = unit === "imperial" ? `in${perSuffix}` : `cm${perSuffix}`;
  const suffix = showUnit ? ` ${unitLabel}` : "";

  const safeCm =
    cm !== null && cm !== undefined && Number.isFinite(cm) && cm > 0 ? cm : 0;
  if (safeCm <= 0) {
    return `0${suffix}`;
  }

  if (unit === "imperial") {
    const inVal = safeCm / 2.54;
    if (inVal < 0.1) return `<0.1${suffix}`;
    if (inVal < 10) return `${inVal.toFixed(1)}${suffix}`;
    return `${Math.round(inVal)}${suffix}`;
  }

  if (safeCm < 0.05) return `<0.1${suffix}`;
  if (safeCm < 10) return `${safeCm.toFixed(1)}${suffix}`;
  return `${Math.round(safeCm)}${suffix}`;
}

export function convertElevationM(meters: number, unit: UnitSystem): number {
  return unit === "imperial" ? Math.round(meters * 3.28084) : Math.round(meters);
}

export function formatElevation(
  meters: number | null | undefined,
  unit: UnitSystem
): string {
  if (meters === null || meters === undefined || !Number.isFinite(meters)) {
    return "—";
  }
  return unit === "imperial"
    ? `${Math.round(meters * 3.28084)} ft`
    : `${Math.round(meters)} m`;
}

export function convertDistanceKm(km: number, unit: UnitSystem): number {
  return unit === "imperial" ? km * 0.621371 : km;
}

export function formatDistance(
  km: number,
  unit: UnitSystem,
  opts?: { decimals?: number }
): string {
  const safeKm = Number.isFinite(km) ? Math.max(0, km) : 0;
  const val = convertDistanceKm(safeKm, unit);
  const unitLabel = unit === "imperial" ? "mi" : "km";

  if (opts?.decimals !== undefined) {
    const dec = Math.max(0, opts.decimals);
    return `${dec > 0 ? val.toFixed(dec) : Math.round(val)} ${unitLabel}`;
  }

  if (unit === "imperial") {
    if (val === 0) return "0 mi";
    if (val < 20) return `${val.toFixed(1).replace(/\.0$/, "")} mi`;
    return `${Math.round(val)} mi`;
  }

  if (val >= 10 || Number.isInteger(val)) {
    return `${Math.round(val)} km`;
  }
  return `${val.toFixed(1)} km`;
}

export function convertPressureHpa(hpa: number, unit: UnitSystem): number {
  return unit === "imperial" ? hpa * 0.029529983 : hpa;
}

export function formatPressure(
  hpa: number,
  unit: UnitSystem,
  opts?: { showUnit?: boolean }
): string {
  const showUnit = opts?.showUnit ?? true;
  if (unit === "imperial") {
    const inHg = hpa * 0.029529983;
    return showUnit ? `${inHg.toFixed(2)} inHg` : inHg.toFixed(2);
  }
  const rounded = Math.round(hpa);
  return showUnit ? `${rounded} hPa` : String(rounded);
}

export function formatPressureDelta(
  deltaHpa: number,
  unit: UnitSystem,
  per3h = true
): string {
  const rateSuffix = per3h ? "/3s" : "";
  if (unit === "imperial") {
    const rawInHg = deltaHpa * 0.029529983;
    const rounded = Math.round(rawInHg * 100) / 100;
    const clean = Math.abs(rounded) < 1e-9 ? 0 : rounded;
    const sign = clean > 0 ? "+" : "";
    return `${sign}${clean.toFixed(2)} inHg${rateSuffix}`;
  }
  const rounded = Math.round(deltaHpa * 10) / 10;
  const clean = Math.abs(rounded) < 1e-9 ? 0 : rounded;
  const sign = clean > 0 ? "+" : "";
  return `${sign}${clean.toFixed(1)} hPa${rateSuffix}`;
}

export function formatLatLon(lat: number, lon: number, decimals = 2): string {
  const latHem = lat >= 0 ? "K" : "G";
  const lonHem = lon >= 0 ? "D" : "B";
  return `${Math.abs(lat).toFixed(decimals)}°${latHem} · ${Math.abs(lon).toFixed(decimals)}°${lonHem}`;
}

// ============================================================================
// KÜRESEL IANA SAAT DİLİMİ (DST), TAKVİM FARKI VE MODÜLER GÜNEŞ YAYI
// ============================================================================

const DAY_NAMES_SHORT_TR = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"] as const;

/**
 * UTC 12:00 öğle demirlemeli saf takvim günü farkı (DST ve sunucu yerel saatinden %100 bağımsız).
 */
export function computeCalendarDayDiff(
  targetYmd: string,
  originTodayYmd: string
): number {
  const tYmd = targetYmd.slice(0, 10);
  const oYmd = originTodayYmd.slice(0, 10);
  const tMs = Date.parse(`${tYmd}T12:00:00Z`);
  const oMs = Date.parse(`${oYmd}T12:00:00Z`);
  if (!Number.isFinite(tMs) || !Number.isFinite(oMs)) return 0;
  return Math.round((tMs - oMs) / 86_400_000);
}

export function formatRelativeDayLabelTr(
  targetYmd: string,
  originTodayYmd: string,
  style: "weekday" | "plusDay" = "weekday"
): string {
  const diff = computeCalendarDayDiff(targetYmd, originTodayYmd);
  if (diff === 0) return "Bugün";
  if (diff === 1) return "Yarın";
  if (diff < 0) return "Dün";
  if (style === "plusDay") return `+${diff}g`;

  const tYmd = targetYmd.slice(0, 10);
  const d = new Date(`${tYmd}T12:00:00Z`);
  return DAY_NAMES_SHORT_TR[d.getUTCDay()] ?? tYmd.slice(5);
}

export interface ZonedLocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  ymd: string;
  hm: string;
  isoMinute: string;
  isoHour: string;
  localMinutesOfDay: number;
  offsetSeconds: number;
}

export interface FastZonedTimeResolver {
  localIsoToUtcDate: (localIso: string, prevUtcMs?: number) => Date;
  localIsoToUtcHourKey: (localIso: string, prevUtcMs?: number) => string;
  epochMsToLocalParts: (epochMs: number) => ZonedLocalParts;
}

const SIX_HOURS_MS = 6 * 3600_000;
const zonedDtfCache = new Map<string, Intl.DateTimeFormat | null>();
const zonedGridOffsetCache = new Map<string, Map<number, number>>();

function getCachedZonedFormatter(timeZone?: string): Intl.DateTimeFormat | null {
  if (!timeZone || typeof timeZone !== "string") return null;
  const key = timeZone.trim();
  if (!key) return null;
  if (zonedDtfCache.has(key)) return zonedDtfCache.get(key) ?? null;
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: key,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    });
    zonedDtfCache.set(key, fmt);
    return fmt;
  } catch {
    zonedDtfCache.set(key, null);
    return null;
  }
}

function extractZonedPartsRaw(
  fmt: Intl.DateTimeFormat,
  utcMs: number
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  offsetSeconds: number;
} {
  const parts = fmt.formatToParts(new Date(utcMs));
  let year = 1970;
  let month = 1;
  let day = 1;
  let hour = 0;
  let minute = 0;
  let second = 0;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (p.type === "year") year = Number(p.value);
    else if (p.type === "month") month = Number(p.value);
    else if (p.type === "day") day = Number(p.value);
    else if (p.type === "hour") {
      const hv = Number(p.value);
      hour = hv === 24 ? 0 : hv;
    } else if (p.type === "minute") minute = Number(p.value);
    else if (p.type === "second") second = Number(p.value);
  }
  const wallUtcMs = Date.UTC(year, month - 1, day, hour, minute, second);
  const secAlignedUtcMs = Math.floor(utcMs / 1000) * 1000;
  const offsetSeconds = Math.round((wallUtcMs - secAlignedUtcMs) / 1000);
  return { year, month, day, hour, minute, second, offsetSeconds };
}

function buildLocalPartsFromShiftedUtc(
  shiftedMs: number,
  offsetSeconds: number
): ZonedLocalParts {
  const d = new Date(shiftedMs);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const hour = d.getUTCHours();
  const minute = d.getUTCMinutes();
  const second = d.getUTCSeconds();
  const mStr = String(month).padStart(2, "0");
  const dStr = String(day).padStart(2, "0");
  const hStr = String(hour).padStart(2, "0");
  const minStr = String(minute).padStart(2, "0");
  const ymd = `${year}-${mStr}-${dStr}`;
  const hm = `${hStr}:${minStr}`;
  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
    ymd,
    hm,
    isoMinute: `${ymd}T${hm}`,
    isoHour: `${ymd}T${hStr}:00`,
    localMinutesOfDay: hour * 60 + minute,
    offsetSeconds
  };
}

function parseLocalWallAsUtcMs(localIso: string): number | null {
  if (!localIso || typeof localIso !== "string") return null;
  const s = localIso.trim();
  if (s.length < 10) return null;
  const year = Number(s.slice(0, 4));
  const month = Number(s.slice(5, 7));
  const day = Number(s.slice(8, 10));
  const hour = s.length >= 13 ? Number(s.slice(11, 13)) : 0;
  const minute = s.length >= 16 ? Number(s.slice(14, 16)) : 0;
  const second = s.length >= 19 ? Number(s.slice(17, 19)) : 0;
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute) ||
    !Number.isFinite(second) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }
  return Date.UTC(year, month - 1, day, hour, minute, second);
}

/**
 * Modül önbellekli Intl.DateTimeFormat + 6 saatlik blok-atlamalı sabit nokta DST çözücüsü:
 * - Mart ileri sarma (spring-forward gap) ve Kasım geri sarma (fall-back fold) geçişlerinde sıfır kayma sağlar.
 * - Geçersiz veya boş IANA saat diliminde çökmeden `fallbackOffsetSeconds` ile çalışır.
 */
export function createFastZonedTimeResolver(
  timeZone: string | undefined,
  fallbackOffsetSeconds = 0
): FastZonedTimeResolver {
  const safeFallbackSec = Number.isFinite(fallbackOffsetSeconds)
    ? Math.round(fallbackOffsetSeconds)
    : 0;
  const fmt = getCachedZonedFormatter(timeZone);
  const tzKey = fmt && timeZone ? timeZone.trim() : "";

  let gridMap = tzKey ? zonedGridOffsetCache.get(tzKey) : undefined;
  if (tzKey && !gridMap) {
    gridMap = new Map<number, number>();
    zonedGridOffsetCache.set(tzKey, gridMap);
  }

  const getExactOffsetSec = (utcMs: number): number => {
    if (!fmt) return safeFallbackSec;
    return extractZonedPartsRaw(fmt, utcMs).offsetSeconds;
  };

  const getGridOffsetSec = (gridIdx: number): number => {
    if (!fmt || !gridMap) return safeFallbackSec;
    const hit = gridMap.get(gridIdx);
    if (hit !== undefined) return hit;
    if (gridMap.size > 4096) gridMap.clear();
    const off = extractZonedPartsRaw(fmt, gridIdx * SIX_HOURS_MS).offsetSeconds;
    gridMap.set(gridIdx, off);
    return off;
  };

  let seedOffsetSec = safeFallbackSec;

  const resolveWallMsToUtcMs = (wallAsUtcMs: number, prevUtcMs?: number): number => {
    if (!fmt) {
      return wallAsUtcMs - safeFallbackSec * 1000;
    }

    let bIdx = Math.floor((wallAsUtcMs - seedOffsetSec * 1000) / SIX_HOURS_MS);
    let offCur = getGridOffsetSec(bIdx);
    const reanchoredMs = wallAsUtcMs - offCur * 1000;
    const bIdxReanchored = Math.floor(reanchoredMs / SIX_HOURS_MS);
    if (bIdxReanchored !== bIdx) {
      bIdx = bIdxReanchored;
      offCur = getGridOffsetSec(bIdx);
    }

    const offPrev = getGridOffsetSec(bIdx - 1);
    const offNext = getGridOffsetSec(bIdx + 1);

    // Hızlı yol (%99.9): komşu 6 saatlik bloklarda DST geçişi yoksa O(1) aritmetik çözüm
    if (offPrev === offCur && offCur === offNext) {
      seedOffsetSec = offCur;
      return wallAsUtcMs - offCur * 1000;
    }

    // Geçiş bloğu yolu: geri sarma (fold) ve ileri sarma (gap) için kesin aday çözücü
    const offPreProbe = getExactOffsetSec(wallAsUtcMs - offPrev * 1000 - 2 * 3600_000);
    const offPostProbe = getExactOffsetSec(wallAsUtcMs - offNext * 1000 + 2 * 3600_000);
    const uniqueOffsets = Array.from(
      new Set([offPreProbe, offPrev, offCur, offNext, offPostProbe])
    );

    const candidateUtcList = uniqueOffsets
      .map((off) => wallAsUtcMs - off * 1000)
      .sort((a, b) => a - b);

    const exactMatches: number[] = [];
    for (let i = 0; i < candidateUtcList.length; i++) {
      const cand = candidateUtcList[i];
      const actualOff = getExactOffsetSec(cand);
      if (cand + actualOff * 1000 === wallAsUtcMs) {
        if (exactMatches.length === 0 || exactMatches[exactMatches.length - 1] !== cand) {
          exactMatches.push(cand);
        }
      }
    }

    if (exactMatches.length === 1) {
      const chosen = exactMatches[0];
      seedOffsetSec = Math.round((wallAsUtcMs - chosen) / 1000);
      return chosen;
    }

    if (exactMatches.length >= 2) {
      // Kasım geri sarma (01:00 tekrarı): prevUtcMs verilmişse bir önceki saatten kesin ileri olan adayı seç
      let chosen = exactMatches[0];
      if (prevUtcMs !== undefined && Number.isFinite(prevUtcMs)) {
        const strictlyAfter = exactMatches.find((m) => m > prevUtcMs);
        chosen =
          strictlyAfter !== undefined
            ? strictlyAfter
            : exactMatches[exactMatches.length - 1];
      }
      seedOffsetSec = Math.round((wallAsUtcMs - chosen) / 1000);
      return chosen;
    }

    // Mart ileri sarma kayıp saat boşluğu (ör. 02:30 -> geçiş öncesi ofsetle ileri taşı)
    const gapResolved = wallAsUtcMs - offPreProbe * 1000;
    seedOffsetSec = getExactOffsetSec(gapResolved);
    return gapResolved;
  };

  const localIsoToUtcDate = (localIso: string, prevUtcMs?: number): Date => {
    if (localIso && /(?:Z|[+-]\d{2}:\d{2})$/i.test(localIso.trim())) {
      const explicitMs = Date.parse(localIso.trim());
      if (Number.isFinite(explicitMs)) return new Date(explicitMs);
    }
    const wallMs = parseLocalWallAsUtcMs(localIso);
    if (wallMs === null) {
      return new Date(
        prevUtcMs !== undefined && Number.isFinite(prevUtcMs) ? prevUtcMs : Date.now()
      );
    }
    return new Date(resolveWallMsToUtcMs(wallMs, prevUtcMs));
  };

  const localIsoToUtcHourKey = (localIso: string, prevUtcMs?: number): string => {
    const utcDate = localIsoToUtcDate(localIso, prevUtcMs);
    const nearestHourMs = Math.round(utcDate.getTime() / 3600_000) * 3600_000;
    return new Date(nearestHourMs).toISOString().slice(0, 16);
  };

  const epochMsToLocalParts = (epochMs: number): ZonedLocalParts => {
    const safeMs = Number.isFinite(epochMs) ? epochMs : Date.now();
    if (!fmt) {
      return buildLocalPartsFromShiftedUtc(safeMs + safeFallbackSec * 1000, safeFallbackSec);
    }

    const bIdx = Math.floor(safeMs / SIX_HOURS_MS);
    const offCur = getGridOffsetSec(bIdx);
    const offNext = getGridOffsetSec(bIdx + 1);
    if (offCur === offNext) {
      return buildLocalPartsFromShiftedUtc(safeMs + offCur * 1000, offCur);
    }

    const raw = extractZonedPartsRaw(fmt, safeMs);
    const mStr = String(raw.month).padStart(2, "0");
    const dStr = String(raw.day).padStart(2, "0");
    const hStr = String(raw.hour).padStart(2, "0");
    const minStr = String(raw.minute).padStart(2, "0");
    const ymd = `${raw.year}-${mStr}-${dStr}`;
    const hm = `${hStr}:${minStr}`;
    return {
      year: raw.year,
      month: raw.month,
      day: raw.day,
      hour: raw.hour,
      minute: raw.minute,
      second: raw.second,
      ymd,
      hm,
      isoMinute: `${ymd}T${hm}`,
      isoHour: `${ymd}T${hStr}:00`,
      localMinutesOfDay: raw.hour * 60 + raw.minute,
      offsetSeconds: raw.offsetSeconds
    };
  };

  return {
    localIsoToUtcDate,
    localIsoToUtcHourKey,
    epochMsToLocalParts
  };
}

const radarClockDtfCache = new Map<string, Intl.DateTimeFormat | null>();

function getCachedRadarClockFormatter(timeZone?: string): Intl.DateTimeFormat | null {
  if (!timeZone || typeof timeZone !== "string") return null;
  const key = timeZone.trim();
  if (!key) return null;
  if (radarClockDtfCache.has(key)) {
    return radarClockDtfCache.get(key) ?? null;
  }
  try {
    const fmt = new Intl.DateTimeFormat("tr-TR", {
      timeZone: key,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    radarClockDtfCache.set(key, fmt);
    return fmt;
  } catch {
    radarClockDtfCache.set(key, null);
    return null;
  }
}

function formatUtcOffsetLabel(offsetSeconds: number): string {
  const totalMinutes = Math.round(offsetSeconds / 60);
  if (totalMinutes === 0) return "UTC+0";
  const sign = totalMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(totalMinutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  return mins > 0
    ? `UTC${sign}${hours}:${String(mins).padStart(2, "0")}`
    : `UTC${sign}${hours}`;
}

function resolveRadarZoneLabel(tzKey: string, offsetSeconds: number): string {
  switch (tzKey) {
    case "Europe/Istanbul":
      return "TRT";
    case "Asia/Tokyo":
      return "JST";
    case "Europe/London":
      return offsetSeconds > 0 ? "BST" : "GMT";
    case "Atlantic/Reykjavik":
    case "GMT":
    case "Etc/GMT":
      return "GMT";
    case "UTC":
    case "Etc/UTC":
      return "UTC";
    case "America/New_York":
      return offsetSeconds > -18000 ? "EDT" : "EST";
    case "America/Los_Angeles":
      return offsetSeconds > -28800 ? "PDT" : "PST";
    case "Australia/Sydney":
      return offsetSeconds > 36000 ? "AEDT" : "AEST";
    case "Europe/Berlin":
    case "Europe/Paris":
      return offsetSeconds > 3600 ? "CEST" : "CET";
    case "Asia/Dubai":
      return "GST";
    default:
      return formatUtcOffsetLabel(offsetSeconds);
  }
}

export function formatRadarClock(
  unixSec: number,
  timeZone?: string,
  utcOffsetSeconds?: number,
  includeZoneLabel = true
): string {
  const safeUnixSec = Number.isFinite(unixSec)
    ? unixSec
    : Math.floor(Date.now() / 1000);
  const utcMs = safeUnixSec * 1000;
  const safeFallbackOffsetSec =
    typeof utcOffsetSeconds === "number" && Number.isFinite(utcOffsetSeconds)
      ? Math.round(utcOffsetSeconds)
      : 0;

  const trimmedTz = typeof timeZone === "string" ? timeZone.trim() : "";
  const effectiveTz =
    trimmedTz === "UTC" && safeFallbackOffsetSec !== 0 ? "" : trimmedTz;

  const radarFmt = effectiveTz ? getCachedRadarClockFormatter(effectiveTz) : null;
  if (radarFmt) {
    const parts = radarFmt.formatToParts(new Date(utcMs));
    let hh = "00";
    let mm = "00";
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (p.type === "hour") {
        const hv = Number(p.value);
        hh = String(Number.isFinite(hv) ? hv % 24 : 0).padStart(2, "0");
      } else if (p.type === "minute") {
        const mv = Number(p.value);
        mm = String(Number.isFinite(mv) ? mv : 0).padStart(2, "0");
      }
    }
    const hm = `${hh}:${mm}`;
    if (!includeZoneLabel) return hm;

    const zonedFmt = getCachedZonedFormatter(effectiveTz);
    const actualOffsetSec = zonedFmt
      ? extractZonedPartsRaw(zonedFmt, utcMs).offsetSeconds
      : safeFallbackOffsetSec;
    const zoneLabel = resolveRadarZoneLabel(effectiveTz, actualOffsetSec);
    return `${hm} ${zoneLabel}`;
  }

  const shifted = new Date(utcMs + safeFallbackOffsetSec * 1000);
  const hh = String(shifted.getUTCHours()).padStart(2, "0");
  const mm = String(shifted.getUTCMinutes()).padStart(2, "0");
  const hm = `${hh}:${mm}`;
  if (!includeZoneLabel) return hm;

  const fallbackLabel =
    trimmedTz === "UTC" && safeFallbackOffsetSec === 0
      ? "UTC"
      : formatUtcOffsetLabel(safeFallbackOffsetSec);
  return `${hm} ${fallbackLabel}`;
}

export interface ModularSolarArcInput {
  sunriseIso: string;
  sunsetIso: string;
  nowLocalMinutes: number;
  solarElevationDeg: number;
}

export interface ModularSolarArcResult {
  sunriseHm: string;
  sunsetHm: string;
  sunriseMinutes: number | null;
  sunsetMinutes: number | null;
  daylightMinutes: number;
  durationHours: number;
  durationMinutes: number;
  durationLabelTr: string;
  progress: number;
  isUp: boolean;
  isPolarDay: boolean;
  isPolarNight: boolean;
  wrapsMidnight: boolean;
}

function parseIsoClockMinutes(iso: string): { hm: string; minutes: number } | null {
  if (!iso || typeof iso !== "string") return null;
  const trimmed = iso.trim();
  const hmCandidate =
    trimmed.length >= 16 && trimmed.includes("T")
      ? trimmed.slice(11, 16)
      : trimmed.slice(0, 5);
  const m = /^(\d{1,2}):(\d{2})$/.exec(hmCandidate);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm) || hh < 0 || hh > 24 || mm < 0 || mm > 59) {
    return null;
  }
  const normH = hh % 24;
  return {
    hm: `${String(normH).padStart(2, "0")}:${String(mm).padStart(2, "0")}`,
    minutes: normH * 60 + mm
  };
}

/**
 * Modüler 24-saat güneş yayı çözücüsü:
 * - Reykjavik / yüksek enlem yaz gecelerinde `sunset < sunrise` (ör. 02:55 -> 00:04 = 21s 9dk) gece yarısı aşımını çözer.
 * - Kutup gündüzü (24s 0dk) ve kutup gecesini (0s 0dk) destekler.
 */
export function computeModularSolarArc(
  params: ModularSolarArcInput
): ModularSolarArcResult {
  const sr = parseIsoClockMinutes(params.sunriseIso);
  const ss = parseIsoClockMinutes(params.sunsetIso);
  const normNow = ((params.nowLocalMinutes % 1440) + 1440) % 1440;
  const isUp = params.solarElevationDeg > 0;

  if (!sr || !ss || sr.minutes === ss.minutes) {
    if (params.solarElevationDeg > -0.833) {
      return {
        sunriseHm: "--:--",
        sunsetHm: "--:--",
        sunriseMinutes: null,
        sunsetMinutes: null,
        daylightMinutes: 1440,
        durationHours: 24,
        durationMinutes: 0,
        durationLabelTr: "24s 0dk",
        progress: Math.max(0, Math.min(1, normNow / 1440)),
        isUp: true,
        isPolarDay: true,
        isPolarNight: false,
        wrapsMidnight: false
      };
    }
    return {
      sunriseHm: "--:--",
      sunsetHm: "--:--",
      sunriseMinutes: null,
      sunsetMinutes: null,
      daylightMinutes: 0,
      durationHours: 0,
      durationMinutes: 0,
      durationLabelTr: "0s 0dk",
      progress: 0,
      isUp: false,
      isPolarDay: false,
      isPolarNight: true,
      wrapsMidnight: false
    };
  }

  const daylightMinutes = (ss.minutes - sr.minutes + 1440) % 1440;
  const durationHours = Math.floor(daylightMinutes / 60);
  const durationMinutes = daylightMinutes % 60;
  const durationLabelTr = `${durationHours}s ${durationMinutes}dk`;
  const wrapsMidnight = ss.minutes < sr.minutes;

  const modElapsed = (normNow - sr.minutes + 1440) % 1440;
  let progress: number;
  if (modElapsed <= daylightMinutes) {
    progress = daylightMinutes > 0 ? modElapsed / daylightMinutes : 0;
  } else {
    const nightElapsed = modElapsed - daylightMinutes;
    const nightSpan = 1440 - daylightMinutes;
    progress = nightElapsed <= nightSpan * 0.5 ? 1 : 0;
  }

  return {
    sunriseHm: sr.hm,
    sunsetHm: ss.hm,
    sunriseMinutes: sr.minutes,
    sunsetMinutes: ss.minutes,
    daylightMinutes,
    durationHours,
    durationMinutes,
    durationLabelTr,
    progress: Math.max(0, Math.min(1, progress)),
    isUp,
    isPolarDay: false,
    isPolarNight: false,
    wrapsMidnight
  };
}

export function computeSynopticSignals(params: {
  pressureDelta3h: number;
  temp850hPa: number | null;
  thickness5001000Dam?: number | null;
  windGustsKmh: number;
  cape: number | null;
  isStorm: boolean;
  europeanAqi: number | null;
  dominantPollutant?: string;
  uvIndex: number;
  freezingLevelM: number | null;
  temperatureC: number;
  stormScore?: number;
  scp?: number;
  unit?: UnitSystem;
}): SynopticSignal[] {
  const unit: UnitSystem = params.unit ?? "metric";
  const signals: SynopticSignal[] = [];

  if (Math.abs(params.pressureDelta3h) >= 3.0) {
    const dropping = params.pressureDelta3h < 0;
    signals.push({
      id: "pressure-tendency",
      severity: dropping ? "warning" : "info",
      title: dropping ? "Hızlı Basınç Düşüşü" : "Hızlı Basınç Yükselişi",
      detail: `${formatPressureDelta(params.pressureDelta3h, unit, true)} · ${
        dropping ? "Aktif cephe geçişi" : "Cephe arkası yüksek basınç"
      }`
    });
  }

  if (
    params.isStorm ||
    (params.stormScore !== undefined && params.stormScore >= 40) ||
    (params.cape !== null && params.cape >= 1000)
  ) {
    const scpText =
      params.scp !== undefined && params.scp >= 1.0 ? ` · SCP ${params.scp.toFixed(1)}` : "";
    signals.push({
      id: "convective",
      severity: "warning",
      title: params.isStorm ? "Aktif Oraj / Sağanak" : "Konvektif Kararsızlık",
      detail:
        params.cape !== null && params.cape > 0
          ? `MUCAPE ${params.cape} J/kg${scpText}`
          : "Şimşek & gök gürültülü sağanak"
    });
  }

  if (params.windGustsKmh >= 50) {
    const bft = windKmhToBeaufort(params.windGustsKmh);
    signals.push({
      id: "wind-gusts",
      severity: params.windGustsKmh >= 70 ? "warning" : "caution",
      title: "Kuvvetli Rüzgar Hamlesi",
      detail: `Hamle ${formatWindSpeed(params.windGustsKmh, unit)} · Bft ${bft.scale}`
    });
  }

  if (
    (params.temp850hPa !== null && params.temp850hPa <= 0) ||
    (params.thickness5001000Dam !== undefined &&
      params.thickness5001000Dam !== null &&
      params.thickness5001000Dam <= 542)
  ) {
    const parts: string[] = [];
    if (params.temp850hPa !== null) {
      parts.push(
        `850 hPa ${formatTemperature(params.temp850hPa, unit, { decimals: 1, showUnit: true })}`
      );
    }
    if (
      params.thickness5001000Dam !== undefined &&
      params.thickness5001000Dam !== null
    ) {
      parts.push(`Kalınlık ${params.thickness5001000Dam} dam`);
    }
    if (params.freezingLevelM !== null) {
      parts.push(
        unit === "imperial"
          ? `32°F: ${formatElevation(params.freezingLevelM, unit)}`
          : `0°C: ${formatElevation(params.freezingLevelM, unit)}`
      );
    }
    signals.push({
      id: "cold-snow-threshold",
      severity: "info",
      title: "Soğuk Hava / Kar Eşiği",
      detail: parts.join(" · ")
    });
  } else if (params.temperatureC <= 1.5) {
    signals.push({
      id: "frost",
      severity: "caution",
      title: "Don & Buzlanma Eşiği",
      detail: `Yüzey ${formatTemperature(params.temperatureC, unit, { decimals: 1, showUnit: true })}`
    });
  }

  if (
    params.europeanAqi !== null &&
    Number.isFinite(params.europeanAqi) &&
    params.europeanAqi >= 75
  ) {
    const domText = params.dominantPollutant ? ` · Baskın ${params.dominantPollutant}` : "";
    signals.push({
      id: "air-quality",
      severity: params.europeanAqi >= 81 ? "warning" : "caution",
      title: "Hava Kalitesi Kötü",
      detail: `EAQI ${Math.round(params.europeanAqi)}${domText}`
    });
  }

  if (params.uvIndex >= 6) {
    signals.push({
      id: "uv-high",
      severity: params.uvIndex >= 8 ? "warning" : "caution",
      title: `UV ${params.uvIndex.toFixed(1)} (${classifyUvIndex(params.uvIndex)})`,
      detail: "WHO güneş korunma eşiği"
    });
  }

  return signals.slice(0, 4);
}

export const ATMOS_STORAGE_KEYS = {
  location: "atmos:v5:location",
  favorites: "atmos:v5:stations",
  alerts: "atmos:v5:alerts",
  unit: "atmos:v5:unit",
  audio: "atmos:v5:audio",
  cumulusCareer: "atmos:v5:cumulus-career",
  bundleCache: "atmos:v5:bundle-cache",
  modelsCache: "atmos:v5:models-cache"
} as const;

const LEGACY_STORAGE_MAP: Record<keyof typeof ATMOS_STORAGE_KEYS, readonly string[]> = {
  location: ["atmos:location:" + "v3"],
  favorites: ["atmos:stations:" + "v3"],
  alerts: ["atmos:alerts:" + "v3"],
  unit: ["atmos:unit:" + "v3"],
  audio: [],
  cumulusCareer: ["atmos:cumulus:career:" + "v1"],
  bundleCache: [],
  modelsCache: []
};

export const ATMOS_REFRESH_ALL_EVENT = "atmos:refresh-all" as const;

export interface AtmosRefreshAllDetail {
  reason: "manual" | "online" | "recovery";
  timestampMs: number;
  location: GeoLocation;
}

export function dispatchAtmosRefreshAll(detail: AtmosRefreshAllDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(ATMOS_REFRESH_ALL_EVENT, { detail }));
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Reads a v5 localStorage key, or transparently migrates & deletes any legacy key on first access.
 */
export function readMigratedStorageItem(
  slot: keyof typeof ATMOS_STORAGE_KEYS,
  storage?: StorageLike | null
): string | null {
  const targetStorage =
    storage ?? (typeof window !== "undefined" ? window.localStorage : null);
  if (!targetStorage) return null;

  const targetKey = ATMOS_STORAGE_KEYS[slot];
  const current = targetStorage.getItem(targetKey);
  if (current !== null) {
    for (const oldKey of LEGACY_STORAGE_MAP[slot]) {
      if (targetStorage.getItem(oldKey) !== null) {
        targetStorage.removeItem(oldKey);
      }
    }
    return current;
  }

  for (const oldKey of LEGACY_STORAGE_MAP[slot]) {
    const legacyVal = targetStorage.getItem(oldKey);
    if (legacyVal !== null) {
      targetStorage.setItem(targetKey, legacyVal);
      targetStorage.removeItem(oldKey);
      return legacyVal;
    }
  }
  return null;
}
