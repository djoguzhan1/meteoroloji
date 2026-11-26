import { CORE_MODEL_KEYS } from "./model-registry";
import type {
  BeaufortInfo,
  CoreModelKey,
  GeoLocation,
  HybridModelSnapshot,
  PrecipitationConsensus,
  PrecipType,
  PressureTrend,
  SynopticSignal,
  UnitSystem
} from "./weather-types";

const envCity =
  typeof process !== "undefined" && process.env?.DEFAULT_CITY
    ? process.env.DEFAULT_CITY
    : "Bursa";
const envLat =
  typeof process !== "undefined" && process.env?.DEFAULT_LAT
    ? Number(process.env.DEFAULT_LAT)
    : 40.1885;
const envLon =
  typeof process !== "undefined" && process.env?.DEFAULT_LON
    ? Number(process.env.DEFAULT_LON)
    : 29.061;

export const DEFAULT_LOCATION: GeoLocation = {
  id: "bursa-tr",
  name: envCity,
  admin1: "Bursa",
  country: "Türkiye",
  countryCode: "TR",
  lat: Number.isFinite(envLat) ? envLat : 40.1885,
  lon: Number.isFinite(envLon) ? envLon : 29.061,
  elevation: 155,
  timezone: "Europe/Istanbul"
};

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

export function computeHybridConfidence(
  tempSpreadC: number,
  pressureSpreadHpa: number
): number {
  const tempPenalty = Math.max(0, tempSpreadC - 0.6) * 5.8;
  const pressPenalty = Math.max(0, pressureSpreadHpa - 0.6) * 4.2;
  return Math.round(Math.max(45, Math.min(99, 99 - tempPenalty - pressPenalty)));
}

export function formatTemperature(celsius: number, unit: UnitSystem): string {
  if (unit === "imperial") {
    return `${Math.round((celsius * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(celsius)}°`;
}

export function formatWindSpeed(kmh: number, unit: UnitSystem): string {
  if (unit === "imperial") {
    return `${Math.round(kmh * 0.621371)} mph`;
  }
  return `${Math.round(kmh)} km/s`;
}

export function formatLatLon(lat: number, lon: number, decimals = 2): string {
  const latHem = lat >= 0 ? "K" : "G";
  const lonHem = lon >= 0 ? "D" : "B";
  return `${Math.abs(lat).toFixed(decimals)}°${latHem} · ${Math.abs(lon).toFixed(decimals)}°${lonHem}`;
}

export function computeSynopticSignals(params: {
  pressureDelta3h: number;
  temp850hPa: number | null;
  thickness5001000Dam?: number | null;
  windGustsKmh: number;
  cape: number | null;
  isStorm: boolean;
  europeanAqi: number;
  dominantPollutant: string;
  uvIndex: number;
  freezingLevelM: number | null;
  temperatureC: number;
  stormScore?: number;
  scp?: number;
}): SynopticSignal[] {
  const signals: SynopticSignal[] = [];

  if (Math.abs(params.pressureDelta3h) >= 3.0) {
    const dropping = params.pressureDelta3h < 0;
    signals.push({
      id: "pressure-tendency",
      severity: dropping ? "warning" : "info",
      title: dropping ? "Hızlı Basınç Düşüşü" : "Hızlı Basınç Yükselişi",
      detail: `${params.pressureDelta3h > 0 ? "+" : ""}${params.pressureDelta3h} hPa/3s · ${
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
      detail: `Hamle ${Math.round(params.windGustsKmh)} km/s · Bft ${bft.scale}`
    });
  }

  if (
    (params.temp850hPa !== null && params.temp850hPa <= 0) ||
    (params.thickness5001000Dam !== undefined &&
      params.thickness5001000Dam !== null &&
      params.thickness5001000Dam <= 542)
  ) {
    const parts: string[] = [];
    if (params.temp850hPa !== null) parts.push(`850 hPa ${params.temp850hPa}°C`);
    if (
      params.thickness5001000Dam !== undefined &&
      params.thickness5001000Dam !== null
    ) {
      parts.push(`Kalınlık ${params.thickness5001000Dam} dam`);
    }
    if (params.freezingLevelM !== null) parts.push(`0°C: ${params.freezingLevelM} m`);
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
      detail: `Yüzey ${params.temperatureC.toFixed(1)}°C`
    });
  }

  if (params.europeanAqi >= 61) {
    signals.push({
      id: "air-quality",
      severity: params.europeanAqi >= 81 ? "warning" : "caution",
      title: "Hava Kalitesi Kötü",
      detail: `EAQI ${params.europeanAqi} · Baskın ${params.dominantPollutant}`
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
  cumulusCareer: "atmos:v5:cumulus-career",
  bundleCache: "atmos:v5:bundle-cache",
  modelsCache: "atmos:v5:models-cache"
} as const;

const LEGACY_STORAGE_MAP: Record<keyof typeof ATMOS_STORAGE_KEYS, readonly string[]> = {
  location: ["atmos:location:" + "v3"],
  favorites: ["atmos:stations:" + "v3"],
  alerts: ["atmos:alerts:" + "v3"],
  unit: ["atmos:unit:" + "v3"],
  cumulusCareer: ["atmos:cumulus:career:" + "v1"],
  bundleCache: [],
  modelsCache: []
};

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
