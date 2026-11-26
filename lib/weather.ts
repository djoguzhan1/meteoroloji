import {
  analyzeConvectiveProfile,
  computeEnvironmentalLapseRateCPerM,
  dewPointMagnus,
  relativeHumidityFromDewPoint,
  wetBulbStullC
} from "./thermo-cape";
import {
  clearMetarCache,
  fetchMetarNetworkHistory,
  SEVEN_MODEL_KEYS,
  SEVEN_MODEL_META,
  WMO_PRIOR_WEIGHTS
} from "./metar-verify";
import {
  blendKalmanCorrectedScalar,
  getLeadTimeWeights,
  trainKalmanMos
} from "./kalman-mos";
import {
  classifyPrecipPhase,
  computeEnsembleDistStats,
  fusePrecipitationHour
} from "./precip-engine";
import {
  buildStormAssessment,
  evaluateHourlyStormRisk,
  type HourlyStormEvalResult
} from "./storm-engine";
import type {
  AirQualityDetail,
  BeaufortInfo,
  DailyPoint,
  EnsembleBand,
  GeoLocation,
  HourlyPoint,
  HybridMeta,
  HybridModelSnapshot,
  HybridSourceAttribution,
  Minutely15Point,
  ModelSeriesPoint,
  MultiModelBundle,
  PrecipitationConsensus,
  PrecipPhase,
  PrecipType,
  PressureTrend,
  RadarMetadata,
  SevenModelKey,
  SoundingLevel,
  SynopticSignal,
  UnitSystem,
  WeatherBundle,
  WindGridBundle
} from "./weather-types";

export const DEFAULT_LOCATION: GeoLocation = {
  id: "bursa-tr",
  name: process.env.DEFAULT_CITY ?? "Bursa",
  admin1: "Bursa",
  country: "Türkiye",
  countryCode: "TR",
  lat: Number(process.env.DEFAULT_LAT ?? "40.1885"),
  lon: Number(process.env.DEFAULT_LON ?? "29.0610"),
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
  if (code >= 51 && code <= 57) return "Çiseleyen Yağmur";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "Yağmurlu";
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
  weights: Partial<Record<SevenModelKey, number>>,
  fallbackDeg: number
): number {
  let sumSin = 0;
  let sumCos = 0;
  let wSum = 0;

  for (const key of SEVEN_MODEL_KEYS) {
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

const DAY_NAMES_TR = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function formatDayName(dateIso: string, index: number): string {
  if (index === 0) return "Bugün";
  if (index === 1) return "Yarın";
  const d = new Date(`${dateIso}T12:00:00`);
  return DAY_NAMES_TR[d.getDay()] ?? dateIso.slice(5);
}

type CacheEntry<T> = { value: T; expiresAt: number };
const weatherCache = new Map<string, CacheEntry<WeatherBundle>>();
const modelCache = new Map<string, CacheEntry<MultiModelBundle>>();
const windGridCache = new Map<string, CacheEntry<WindGridBundle>>();
let radarCache: CacheEntry<RadarMetadata> | null = null;

const WEATHER_TTL_MS = 5 * 60 * 1000;
const MODEL_TTL_MS = 10 * 60 * 1000;
const WIND_GRID_TTL_MS = 5 * 60 * 1000;
const RADAR_TTL_MS = 2 * 60 * 1000;

export function clearWeatherCache(): void {
  weatherCache.clear();
  modelCache.clear();
  windGridCache.clear();
  radarCache = null;
  clearMetarCache();
}

const PRESSURE_LEVEL_META: Array<{ hpa: number; stdAltM: number }> = [
  { hpa: 1000, stdAltM: 110 },
  { hpa: 925, stdAltM: 760 },
  { hpa: 850, stdAltM: 1500 },
  { hpa: 700, stdAltM: 3050 },
  { hpa: 500, stdAltM: 5600 },
  { hpa: 400, stdAltM: 7300 },
  { hpa: 300, stdAltM: 9200 }
];

function localIsoToUtcDate(localIso: string, utcOffsetSeconds: number): Date {
  const msAsUtc = Date.parse(`${localIso}:00Z`);
  if (!Number.isFinite(msAsUtc)) return new Date();
  return new Date(msAsUtc - utcOffsetSeconds * 1000);
}

function localIsoToUtcHourKey(localIso: string, utcOffsetSeconds: number): string {
  return localIsoToUtcDate(localIso, utcOffsetSeconds).toISOString().slice(0, 16);
}

export function blendHybridParameter(
  snapshot: HybridModelSnapshot,
  weights: Partial<Record<SevenModelKey, number>>,
  fallback: number
): number {
  let num = 0;
  let den = 0;
  for (const key of SEVEN_MODEL_KEYS) {
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
  const vals = SEVEN_MODEL_KEYS.map((k) => snapshot[k])
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

async function fetchWithRetry(
  url: string,
  timeoutMs = 11000,
  retries = 1
): Promise<Response> {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs)
      });
      if (res.ok || res.status < 500 || attempt === retries) {
        return res;
      }
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (err) {
      lastErr = err;
      if (attempt === retries) throw err;
    }
    await new Promise((r) => setTimeout(r, 380 * (attempt + 1)));
  }
  throw lastErr instanceof Error ? lastErr : new Error("Upstream fetch failed");
}

function toFiniteNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? Number(v.toFixed(1)) : null;
}

function spreadOf(snap: HybridModelSnapshot): number {
  const vals = SEVEN_MODEL_KEYS.map((k) => snap[k]).filter(
    (v): v is number => v !== null && v !== undefined && Number.isFinite(v)
  );
  if (vals.length < 2) return 0;
  return Number((Math.max(...vals) - Math.min(...vals)).toFixed(1));
}

function formatWeightsLabel(weights: Record<SevenModelKey, number>): string {
  return SEVEN_MODEL_KEYS.map((k) => ({
    name: SEVEN_MODEL_META[k].shortLabel,
    pct: Math.round(weights[k] * 100)
  }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)
    .map((x) => `%${x.pct} ${x.name}`)
    .join(" · ");
}

function topModelLabel(weights: Record<SevenModelKey, number>): string {
  let best: SevenModelKey = "ecmwfIfs";
  for (const k of SEVEN_MODEL_KEYS) {
    if (weights[k] > weights[best]) best = k;
  }
  return SEVEN_MODEL_META[best].label;
}

type EnsembleIndex = {
  utcIndex: Map<string, number>;
  tempCols: Array<Array<number | null>>;
  precipCols: Array<Array<number | null>>;
  gustCols: Array<Array<number | null>>;
  capeCols: Array<Array<number | null>>;
  memberCount: number;
};

function buildEnsembleIndex(eJson: Record<string, unknown> | null): EnsembleIndex {
  const utcIndex = new Map<string, number>();
  const tempCols: Array<Array<number | null>> = [];
  const precipCols: Array<Array<number | null>> = [];
  const gustCols: Array<Array<number | null>> = [];
  const capeCols: Array<Array<number | null>> = [];

  const hourly = eJson?.hourly as Record<string, unknown> | undefined;
  const times = Array.isArray(hourly?.time) ? (hourly.time as string[]) : [];
  if (!hourly || times.length === 0) {
    return { utcIndex, tempCols, precipCols, gustCols, capeCols, memberCount: 0 };
  }

  times.forEach((t, i) => utcIndex.set(t, i));
  for (const [key, val] of Object.entries(hourly)) {
    if (!Array.isArray(val)) continue;
    if (key.startsWith("temperature_2m_")) tempCols.push(val as Array<number | null>);
    else if (key.startsWith("precipitation_")) precipCols.push(val as Array<number | null>);
    else if (key.startsWith("wind_gusts_10m_")) gustCols.push(val as Array<number | null>);
    else if (key.startsWith("cape_")) capeCols.push(val as Array<number | null>);
  }

  return {
    utcIndex,
    tempCols,
    precipCols,
    gustCols,
    capeCols,
    memberCount: Math.max(tempCols.length, precipCols.length)
  };
}

function readEnsembleRow(cols: Array<Array<number | null>>, idx: number | undefined): number[] | null {
  if (idx === undefined || cols.length === 0) return null;
  const out: number[] = [];
  for (let c = 0; c < cols.length; c++) {
    const v = cols[c][idx];
    if (typeof v === "number" && Number.isFinite(v)) out.push(v);
  }
  return out.length > 0 ? out : null;
}

export async function fetchWeatherBundle(
  location: GeoLocation = DEFAULT_LOCATION
): Promise<WeatherBundle> {
  const key = `${location.lat.toFixed(2)},${location.lon.toFixed(2)}`;
  const cached = weatherCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return {
      ...cached.value,
      location: {
        ...cached.value.location,
        id: location.id,
        name: location.name || cached.value.location.name,
        country: location.country || cached.value.location.country
      }
    };
  }

  // 1. Ana sondaj + 15dk nowcast + günlük güneş döngüsü
  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", location.lat.toFixed(4));
  forecastUrl.searchParams.set("longitude", location.lon.toFixed(4));
  forecastUrl.searchParams.set("timezone", "auto");
  forecastUrl.searchParams.set("forecast_days", "7");
  forecastUrl.searchParams.set("forecast_minutely_15", "24");
  forecastUrl.searchParams.set(
    "current",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "dew_point_2m",
      "pressure_msl",
      "cloud_cover",
      "wind_speed_10m",
      "wind_gusts_10m",
      "wind_direction_10m",
      "precipitation",
      "rain",
      "snowfall",
      "weather_code",
      "is_day"
    ].join(",")
  );
  forecastUrl.searchParams.set(
    "minutely_15",
    "temperature_2m,precipitation,rain,snowfall,weather_code,wind_gusts_10m,lightning_potential,cape"
  );

  const pressureVars = PRESSURE_LEVEL_META.flatMap(({ hpa }) => [
    `temperature_${hpa}hPa`,
    `relative_humidity_${hpa}hPa`,
    `wind_speed_${hpa}hPa`,
    `wind_direction_${hpa}hPa`,
    `geopotential_height_${hpa}hPa`
  ]);

  forecastUrl.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "dew_point_2m",
      "pressure_msl",
      "cloud_cover",
      "visibility",
      "uv_index",
      "wind_speed_10m",
      "wind_gusts_10m",
      "wind_direction_10m",
      "precipitation",
      "precipitation_probability",
      "rain",
      "snowfall",
      "weather_code",
      "cape",
      "lifted_index",
      "convective_inhibition",
      "freezing_level_height",
      ...pressureVars
    ].join(",")
  );

  forecastUrl.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "uv_index_max",
      "sunrise",
      "sunset"
    ].join(",")
  );

  // 2. 7 Tier-1 Operasyonel NWP + AI Modeli (son 72s + gelecek 7 gün = 240 saat!)
  const hybridUrl = new URL("https://api.open-meteo.com/v1/forecast");
  hybridUrl.searchParams.set("latitude", location.lat.toFixed(4));
  hybridUrl.searchParams.set("longitude", location.lon.toFixed(4));
  hybridUrl.searchParams.set("timezone", "GMT");
  hybridUrl.searchParams.set("past_days", "3");
  hybridUrl.searchParams.set("forecast_days", "7");
  hybridUrl.searchParams.set(
    "models",
    "ecmwf_ifs,ecmwf_aifs025_single,icon_seamless,ukmo_seamless,meteofrance_seamless,gfs_seamless,gem_seamless,ecmwf_ifs025"
  );
  hybridUrl.searchParams.set(
    "hourly",
    "temperature_2m,dew_point_2m,precipitation,snowfall,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,pressure_msl,temperature_850hPa,cape,lifted_index"
  );

  // 3. 122 Üyeli Gerçek Olasılıksal Ensemble (51 ECMWF ENS + 40 ICON-EPS + 31 NOAA GEFS)
  const ensembleUrl = new URL("https://ensemble-api.open-meteo.com/v1/ensemble");
  ensembleUrl.searchParams.set("latitude", location.lat.toFixed(4));
  ensembleUrl.searchParams.set("longitude", location.lon.toFixed(4));
  ensembleUrl.searchParams.set("timezone", "GMT");
  ensembleUrl.searchParams.set("forecast_days", "7");
  ensembleUrl.searchParams.set("models", "ecmwf_ifs025,icon_seamless,gfs_seamless");
  ensembleUrl.searchParams.set("hourly", "temperature_2m,precipitation,wind_gusts_10m,cape");

  // 4. Copernicus CAMS Hava Kalitesi
  const aqiUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  aqiUrl.searchParams.set("latitude", location.lat.toFixed(4));
  aqiUrl.searchParams.set("longitude", location.lon.toFixed(4));
  aqiUrl.searchParams.set(
    "current",
    "european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,dust"
  );
  aqiUrl.searchParams.set("timezone", "auto");

  // 5'li paralel canlı veri akışı
  const [forecastRes, hybridRes, ensRes, aqiRes, metarNetwork] = await Promise.all([
    fetchWithRetry(forecastUrl.toString(), 11000, 1),
    fetchWithRetry(hybridUrl.toString(), 10000, 1).catch(() => null),
    fetchWithRetry(ensembleUrl.toString(), 9000, 1).catch(() => null),
    fetchWithRetry(aqiUrl.toString(), 8000, 1).catch(() => null),
    fetchMetarNetworkHistory(location.lat, location.lon, 4, 85).catch(() => [])
  ]);

  if (!forecastRes.ok) {
    throw new Error(`Open-Meteo forecast HTTP ${forecastRes.status}`);
  }

  const fJson = await forecastRes.json();
  const hJson = hybridRes && hybridRes.ok ? await hybridRes.json() : null;
  const eJson = ensRes && ensRes.ok ? await ensRes.json() : null;
  const aJson = aqiRes && aqiRes.ok ? await aqiRes.json() : null;

  const cur = fJson.current ?? {};
  const hourlyRaw = fJson.hourly ?? {};
  const dailyRaw = fJson.daily ?? {};
  const min15Raw = fJson.minutely_15 ?? null;
  const times: string[] = hourlyRaw.time ?? [];
  const utcOffsetSeconds = Number(fJson.utc_offset_seconds ?? 0);
  const cityElevationM = Math.round(Number(fJson.elevation ?? location.elevation ?? 0));

  const hybridHourly = (hJson?.hourly ?? null) as Record<
    string,
    Array<number | null> | undefined
  > | null;
  const utcTimeIndex = new Map<string, number>();
  if (hybridHourly && Array.isArray(hJson?.hourly?.time)) {
    (hJson.hourly.time as string[]).forEach((t, idx) => {
      utcTimeIndex.set(t, idx);
    });
  }

  const ensIndex = buildEnsembleIndex(eJson);

  const currentIsoPrefix = String(cur.time ?? "").slice(0, 13);
  let startIdx = times.findIndex((t) => t.startsWith(currentIsoPrefix));
  if (startIdx < 0) startIdx = 0;

  const buildSoundingAtIndex = (idx: number): SoundingLevel[] => {
    const sfcTemp = Number(hourlyRaw.temperature_2m?.[idx] ?? cur.temperature_2m ?? 15);
    const sfcRh = Number(hourlyRaw.relative_humidity_2m?.[idx] ?? cur.relative_humidity_2m ?? 60);
    return PRESSURE_LEVEL_META.map(({ hpa, stdAltM }) => {
      const rawT = hourlyRaw[`temperature_${hpa}hPa`]?.[idx];
      const rawRh = hourlyRaw[`relative_humidity_${hpa}hPa`]?.[idx];
      const rawWs = hourlyRaw[`wind_speed_${hpa}hPa`]?.[idx];
      const rawWd = hourlyRaw[`wind_direction_${hpa}hPa`]?.[idx];
      const rawGph = hourlyRaw[`geopotential_height_${hpa}hPa`]?.[idx];

      const altitudeM =
        typeof rawGph === "number" && Number.isFinite(rawGph)
          ? Math.round(rawGph)
          : stdAltM;

      const fallbackT = sfcTemp - (altitudeM / 1000) * 6.5;
      const temp = typeof rawT === "number" && Number.isFinite(rawT) ? rawT : fallbackT;
      const rh =
        typeof rawRh === "number" && Number.isFinite(rawRh)
          ? Math.max(1, Math.min(100, rawRh))
          : Math.max(15, sfcRh - altitudeM / 220);
      const dp = dewPointMagnus(temp, rh);

      return {
        pressure: hpa,
        altitudeM,
        temperature: Number(temp.toFixed(1)),
        dewPoint: Number(dp.toFixed(1)),
        humidity: Math.round(rh),
        windSpeedKt:
          typeof rawWs === "number" && Number.isFinite(rawWs)
            ? Math.round(rawWs * 0.539957)
            : 0,
        windDirection:
          typeof rawWd === "number" && Number.isFinite(rawWd) ? Math.round(rawWd) : 0
      };
    });
  };

  // Canlı 1000->850 hPa sondajından gerçek çevresel sıcaklık gradyanı (inversiyon koruması!)
  const initialSounding = buildSoundingAtIndex(startIdx);
  const envLapseRateCPerM = computeEnvironmentalLapseRateCPerM(initialSounding);

  const nowUtcMs = times[startIdx]
    ? localIsoToUtcDate(times[startIdx], utcOffsetSeconds).getTime()
    : Date.now();

  // ATMOS-CORE v3.0: 48s Çoklu-İstasyon Cressman METAR + Kalman/Diurnal-Phase MOS Eğitimi
  const mos = trainKalmanMos({
    network: metarNetwork,
    cityElevationM,
    envLapseRateCPerM,
    modelHourlyUtc: hybridHourly,
    utcTimeIndex,
    nowUtcMs,
    utcOffsetSeconds,
    ensembleMembers: ensIndex.memberCount
  });

  const readSevenModelSnapshot = (
    prefix: string,
    utcHourKey: string,
    useIfs025ForIfs = false
  ): HybridModelSnapshot => {
    const hIdx = utcTimeIndex.get(utcHourKey);
    if (hIdx === undefined || !hybridHourly) {
      return {
        ecmwfIfs: null,
        ecmwfAifs: null,
        icon: null,
        ukmo: null,
        meteofrance: null,
        gfs: null,
        gem: null
      };
    }
    const ifsApiId = useIfs025ForIfs ? "ecmwf_ifs025" : SEVEN_MODEL_META.ecmwfIfs.apiModel;
    return {
      ecmwfIfs: toFiniteNum(hybridHourly[`${prefix}_${ifsApiId}`]?.[hIdx]),
      ecmwfAifs: toFiniteNum(
        hybridHourly[`${prefix}_${SEVEN_MODEL_META.ecmwfAifs.apiModel}`]?.[hIdx]
      ),
      icon: toFiniteNum(hybridHourly[`${prefix}_${SEVEN_MODEL_META.icon.apiModel}`]?.[hIdx]),
      ukmo: toFiniteNum(hybridHourly[`${prefix}_${SEVEN_MODEL_META.ukmo.apiModel}`]?.[hIdx]),
      meteofrance: toFiniteNum(
        hybridHourly[`${prefix}_${SEVEN_MODEL_META.meteofrance.apiModel}`]?.[hIdx]
      ),
      gfs: toFiniteNum(hybridHourly[`${prefix}_${SEVEN_MODEL_META.gfs.apiModel}`]?.[hIdx]),
      gem: toFiniteNum(hybridHourly[`${prefix}_${SEVEN_MODEL_META.gem.apiModel}`]?.[hIdx])
    };
  };

  // 15 dakikalık nowcast yağış toplamlarını saat başına grupla (0..5s)
  const nowcastHourlyPrecipMm = new Map<string, number>();
  const nowcastHourlyLpi = new Map<string, number>();
  if (min15Raw && Array.isArray(min15Raw.time)) {
    const mTimes: string[] = min15Raw.time;
    for (let j = 0; j < mTimes.length; j++) {
      const hourPrefix = String(mTimes[j]).slice(0, 13);
      const pVal = Number(min15Raw.precipitation?.[j] ?? 0);
      if (Number.isFinite(pVal)) {
        nowcastHourlyPrecipMm.set(
          hourPrefix,
          (nowcastHourlyPrecipMm.get(hourPrefix) ?? 0) + Math.max(0, pVal)
        );
      }
      const lpiVal = min15Raw.lightning_potential?.[j];
      if (typeof lpiVal === "number" && Number.isFinite(lpiVal)) {
        nowcastHourlyLpi.set(
          hourPrefix,
          Math.max(nowcastHourlyLpi.get(hourPrefix) ?? 0, lpiVal)
        );
      }
    }
  }

  let rainAccum = 0;
  let snowAccum = 0;
  const hourly: HourlyPoint[] = [];
  const hourlySoundings: SoundingLevel[][] = [];
  const hourlyStormEvals: HourlyStormEvalResult[] = [];
  const hourlyPrecipTrack: number[] = [];

  // İlk saatteki raw->kalman sıcaklık farkı (15dk nowcast kalibrasyonu için)
  let firstHourTempShiftC = 0;
  let firstHourTempBand: EnsembleBand | undefined;

  for (let i = startIdx; i < Math.min(startIdx + 48, times.length); i++) {
    const leadHour = i - startIdx;
    const timeStr = times[i];
    const localHour = Number(timeStr.slice(11, 13)) || 0;
    const utcDate = localIsoToUtcDate(timeStr, utcOffsetSeconds);
    const utcKey = utcDate.toISOString().slice(0, 16);

    const solarElevationDeg = Number(
      computeSolarElevationDeg(location.lat, location.lon, utcDate).toFixed(1)
    );
    const daylight = solarElevationToDaylight(solarElevationDeg);

    const rawTemp = Number(hourlyRaw.temperature_2m?.[i] ?? cur.temperature_2m ?? 0);
    const rawDew = Number(hourlyRaw.dew_point_2m?.[i] ?? cur.dew_point_2m ?? 0);
    const rawPress = Number(hourlyRaw.pressure_msl?.[i] ?? 1013);
    const rawPrecip = Number(hourlyRaw.precipitation?.[i] ?? 0);
    const rawPop = Number(hourlyRaw.precipitation_probability?.[i] ?? 0);
    const rawWind = Number(hourlyRaw.wind_speed_10m?.[i] ?? 0);
    const rawGust = Number(hourlyRaw.wind_gusts_10m?.[i] ?? rawWind);
    const rawWindDir = Number(hourlyRaw.wind_direction_10m?.[i] ?? 0);
    const rawT850 = hourlyRaw["temperature_850hPa"]?.[i];
    const rawCape = hourlyRaw.cape?.[i];
    const rawCin = hourlyRaw.convective_inhibition?.[i];
    const rawLi = hourlyRaw.lifted_index?.[i];
    const rawFrz = hourlyRaw.freezing_level_height?.[i];

    const tempSnap = readSevenModelSnapshot("temperature_2m", utcKey);
    const dewSnap = readSevenModelSnapshot("dew_point_2m", utcKey);
    const pressSnap = readSevenModelSnapshot("pressure_msl", utcKey);
    const precipSnap = readSevenModelSnapshot("precipitation", utcKey);
    const snowSnap = readSevenModelSnapshot("snowfall", utcKey);
    const wmoSnap = readSevenModelSnapshot("weather_code", utcKey);
    const windSnap = readSevenModelSnapshot("wind_speed_10m", utcKey);
    const gustSnap = readSevenModelSnapshot("wind_gusts_10m", utcKey);
    const dirSnap = readSevenModelSnapshot("wind_direction_10m", utcKey);
    const t850Snap = readSevenModelSnapshot("temperature_850hPa", utcKey, true);
    const capeSnap = readSevenModelSnapshot("cape", utcKey);

    // 122-Üye Ensemble Dilimleri
    const eIdx = ensIndex.utcIndex.get(utcKey);
    const ensTempArr = readEnsembleRow(ensIndex.tempCols, eIdx);
    const ensPrecipArr = readEnsembleRow(ensIndex.precipCols, eIdx);
    const ensGustArr = readEnsembleRow(ensIndex.gustCols, eIdx);
    const ensCapeArr = readEnsembleRow(ensIndex.capeCols, eIdx);

    const ensTempStats = ensTempArr ? computeEnsembleDistStats(ensTempArr) : null;
    const ensGustStats = ensGustArr ? computeEnsembleDistStats(ensGustArr) : null;

    // 1. KALMAN + DIURNAL MOS SICAKLIK, ÇİY, BASINÇ, RÜZGAR
    const temperature = Number(
      blendKalmanCorrectedScalar({
        snapshot: tempSnap,
        mos,
        param: "temperature",
        leadHour,
        localHour,
        fallback: rawTemp,
        ensembleP50: ensTempStats?.p50 ?? null
      }).toFixed(1)
    );

    if (leadHour === 0) {
      firstHourTempShiftC = Number((temperature - rawTemp).toFixed(2));
    }

    // 122-üye sıcaklık P10–P90 güven bandı (Kalman merkezine göre hizalanmış)
    let tempP10: number | undefined;
    let tempP90: number | undefined;
    if (ensTempStats) {
      const shift = temperature - ensTempStats.p50;
      tempP10 = Number((ensTempStats.p10 + shift).toFixed(1));
      tempP90 = Number((ensTempStats.p90 + shift).toFixed(1));
      if (leadHour === 0) {
        firstHourTempBand = {
          p10: tempP10,
          p50: temperature,
          p90: tempP90,
          members: ensTempStats.count
        };
      }
    }

    const dewPointRaw = Number(
      blendKalmanCorrectedScalar({
        snapshot: dewSnap,
        mos,
        param: "dewPoint",
        leadHour,
        localHour,
        fallback: rawDew
      }).toFixed(1)
    );
    const dewPoint = Math.min(temperature, dewPointRaw);
    const humidity = Math.round(relativeHumidityFromDewPoint(temperature, dewPoint));
    const wetBulbC = Number(wetBulbStullC(temperature, humidity).toFixed(1));

    const pressure = Number(
      blendKalmanCorrectedScalar({
        snapshot: pressSnap,
        mos,
        param: "pressure",
        leadHour,
        localHour,
        fallback: rawPress
      }).toFixed(1)
    );

    const leadWindW = getLeadTimeWeights(
      mos.shortRangeWeights.wind,
      mos.mediumRangeWeights.wind,
      leadHour
    );
    const leadGustW: Record<SevenModelKey, number> = {
      ...leadWindW,
      ecmwfAifs: 0 // AIFS v1 rüzgar hamlesi üretmez
    };

    const windSpeed = Number(
      blendKalmanCorrectedScalar({
        snapshot: windSnap,
        mos,
        param: "wind",
        leadHour,
        localHour,
        fallback: rawWind
      }).toFixed(1)
    );
    const windGusts = Number(
      Math.max(
        windSpeed,
        blendHybridParameter(gustSnap, leadGustW, rawGust)
      ).toFixed(1)
    );
    const gustP90 = ensGustStats
      ? Number(Math.max(windGusts, ensGustStats.p90).toFixed(1))
      : undefined;
    const windDirection = blendWindDirectionDeg(dirSnap, leadWindW, rawWindDir);

    const leadTempW = getLeadTimeWeights(
      mos.shortRangeWeights.temperature,
      mos.mediumRangeWeights.temperature,
      leadHour
    );
    const hasT850 =
      SEVEN_MODEL_KEYS.some((k) => t850Snap[k] !== null && t850Snap[k] !== undefined) ||
      (typeof rawT850 === "number" && Number.isFinite(rawT850));
    const temp850hPa = hasT850
      ? Number(
          blendHybridParameter(
            t850Snap,
            leadTempW,
            typeof rawT850 === "number" ? rawT850 : 0
          ).toFixed(1)
        )
      : null;

    // 2. DİKEY SONDAJ & GELİŞMİŞ KONVEKTİF PROFİL (MUCAPE, MLCAPE, SRH, SCP, DCAPE)
    const soundingLevels = buildSoundingAtIndex(i);
    hourlySoundings.push(soundingLevels);
    const soundingAnalysis =
      soundingLevels.length >= 2
        ? analyzeConvectiveProfile({
            surfaceTempC: temperature,
            surfaceHumidity: humidity,
            surfacePressureHpa: pressure,
            levels: soundingLevels
          })
        : null;

    // 3. 122-ÜYE + 7-MODEL PMM YAĞIŞ & STULL Tw FAZ SINIFLANDIRMASI
    const leadPrecipW = getLeadTimeWeights(
      mos.shortRangeWeights.precipitation,
      mos.mediumRangeWeights.precipitation,
      leadHour
    );
    const ncHourMm = nowcastHourlyPrecipMm.get(timeStr.slice(0, 13)) ?? null;
    const fusedPrecip = fusePrecipitationHour({
      detSnapshot: precipSnap,
      detWeights: leadPrecipW,
      ensembleMembersMm: ensPrecipArr,
      rawPrecipFallbackMm: rawPrecip,
      rawPopFallbackPct: rawPop,
      leadHour,
      nowcast15Mm: ncHourMm,
      liveMetarWx: leadHour <= 1 && mos.anchor.active ? mos.anchor.wxFlags : null
    });

    const snowfallCm = Number(
      Math.max(
        0,
        blendHybridParameter(snowSnap, leadPrecipW, Number(hourlyRaw.snowfall?.[i] ?? 0))
      ).toFixed(2)
    );
    const wmo = Number(hourlyRaw.weather_code?.[i] ?? 0);
    const freezingLevelM =
      typeof rawFrz === "number" && Number.isFinite(rawFrz) ? Math.round(rawFrz) : null;

    // 7-Model Fused CAPE + Multi-Model Oraj (WMO >= 95) Uzlaşısı
    const capeFused = Math.round(
      Math.max(
        0,
        blendHybridParameter(
          capeSnap,
          leadPrecipW,
          typeof rawCape === "number" && Number.isFinite(rawCape) ? rawCape : 0
        )
      )
    );
    const mucapeEff = Math.max(capeFused, soundingAnalysis?.mucape ?? 0);

    const phaseResult = classifyPrecipPhase({
      temperatureC: temperature,
      humidityPct: humidity,
      precipitationMm: fusedPrecip.precipitationMm,
      snowfallCm,
      weatherCode: wmo,
      temp850hPa,
      thickness5001000Dam: soundingAnalysis?.thickness5001000Dam ?? null,
      freezingLevelM,
      elevationM: cityElevationM,
      mucape: mucapeEff,
      bulkShear06Kt: soundingAnalysis?.bulkShear06Kt ?? 0,
      liveMetarWx: leadHour <= 1 && mos.anchor.active ? mos.anchor.wxFlags : null
    });

    if (phaseResult.precipType === "rain") {
      rainAccum += fusedPrecip.precipitationMm;
    } else if (phaseResult.precipType === "snow") {
      snowAccum += Math.max(snowfallCm, fusedPrecip.precipitationMm * 0.8);
    }
    hourlyPrecipTrack.push(fusedPrecip.precipitationMm);

    // 4. 0–100 ŞİDDETLİ FIRTINA & ORAJ DEĞERLENDİRMESİ
    let wmoStormAgreeCount = 0;
    let wmoTotalModels = 0;
    for (const k of SEVEN_MODEL_KEYS) {
      const code = wmoSnap[k];
      if (code !== null && code !== undefined && Number.isFinite(code)) {
        wmoTotalModels++;
        if (code >= 95) wmoStormAgreeCount++;
      }
    }

    const ensCapeProb500 =
      ensCapeArr && ensCapeArr.length > 0
        ? (ensCapeArr.filter((v) => v >= 500).length / ensCapeArr.length) * 100
        : 0;
    const ensGustProb55 =
      ensGustArr && ensGustArr.length > 0
        ? (ensGustArr.filter((v) => v >= 55).length / ensGustArr.length) * 100
        : 0;
    const ensGustProb75 =
      ensGustArr && ensGustArr.length > 0
        ? (ensGustArr.filter((v) => v >= 75).length / ensGustArr.length) * 100
        : 0;

    const p3Prev =
      leadHour >= 3
        ? hourly[leadHour - 3]?.pressure ?? pressure
        : Number(hourlyRaw.pressure_msl?.[Math.max(0, i - 3)] ?? pressure);
    const p6Prev =
      leadHour >= 6
        ? hourly[leadHour - 6]?.pressure ?? pressure
        : Number(hourlyRaw.pressure_msl?.[Math.max(0, i - 6)] ?? pressure);
    const precip3hAccum =
      fusedPrecip.precipitationMm +
      (hourlyPrecipTrack[leadHour - 1] ?? 0) +
      (hourlyPrecipTrack[leadHour - 2] ?? 0);

    const lpiHour = nowcastHourlyLpi.get(timeStr.slice(0, 13)) ?? null;
    const stormEval = evaluateHourlyStormRisk({
      time: timeStr,
      hourLabel: timeStr.slice(11, 16),
      dayLabel: leadHour < 24 ? "Bugün" : "Yarın",
      capeFused,
      sounding: soundingAnalysis,
      ensCapeProb500,
      ensGustP50: ensGustStats?.p50 ?? null,
      ensGustP90: ensGustStats?.p90 ?? null,
      ensGustProb55,
      ensGustProb75,
      windSpeedKmh: windSpeed,
      windGustsKmh: windGusts,
      precipitationMm: fusedPrecip.precipitationMm,
      precipP90Mm: fusedPrecip.consensus.p90Mm ?? fusedPrecip.precipitationMm,
      precip3hAccumMm: precip3hAccum,
      wmoStormAgreeCount,
      wmoTotalModels,
      weatherCode: wmo,
      pressureDelta3h: Number((pressure - p3Prev).toFixed(1)),
      pressureDelta6h: Number((pressure - p6Prev).toFixed(1)),
      lightningPotential: lpiHour,
      liveMetarWx: leadHour <= 1 && mos.anchor.active ? mos.anchor.wxFlags : null
    });
    hourlyStormEvals.push(stormEval);

    const rawApparent = Number(
      hourlyRaw.apparent_temperature?.[i] ?? cur.apparent_temperature ?? rawTemp
    );
    const apparentTemperature = Number((rawApparent + (temperature - rawTemp)).toFixed(1));

    // WMO etiketini kalibre faz & orajla tutarlı kıl
    let effectiveWmo = wmo;
    if (stormEval.lightningProbPct >= 58 && fusedPrecip.precipitationMm >= 0.4) {
      effectiveWmo = Math.max(effectiveWmo, 95);
    } else if (phaseResult.precipPhase === "snow" && effectiveWmo < 71) {
      effectiveWmo = 73;
    } else if (phaseResult.precipPhase === "none" && effectiveWmo >= 51) {
      effectiveWmo = Number(hourlyRaw.cloud_cover?.[i] ?? 50) >= 75 ? 3 : 2;
    }

    hourly.push({
      time: timeStr,
      hourLabel: timeStr.slice(11, 16),
      dayLabel: leadHour < 24 ? "Bugün" : "Yarın",
      temperature,
      tempP10,
      tempP90,
      apparentTemperature,
      wetBulbC,
      humidity,
      dewPoint,
      pressure,
      windSpeed,
      windGusts,
      gustP90,
      windDirection,
      cloudCover: Math.round(Number(hourlyRaw.cloud_cover?.[i] ?? 0)),
      visibilityKm: Number((Number(hourlyRaw.visibility?.[i] ?? 15000) / 1000).toFixed(1)),
      uvIndex: Number(hourlyRaw.uv_index?.[i] ?? 0),
      precipitation: fusedPrecip.precipitationMm,
      precipProbability: fusedPrecip.precipProbabilityPct,
      precipConsensus: fusedPrecip.consensus,
      precipType: phaseResult.precipType,
      precipPhase: phaseResult.precipPhase,
      rainAccum: Number(rainAccum.toFixed(1)),
      snowAccum: Number(snowAccum.toFixed(1)),
      weatherCode: effectiveWmo,
      condition:
        phaseResult.precipPhase === "sleet"
          ? "Karla Karışık Yağmur"
          : phaseResult.precipPhase === "hail"
            ? "Dolu Riskli Sağanak"
            : mapWmoCodeToLabel(effectiveWmo),
      isStorm: stormEval.isStorm,
      stormScore: stormEval.score,
      lightningProbPct: stormEval.lightningProbPct,
      solarElevationDeg,
      daylight,
      cape:
        mucapeEff > 0
          ? mucapeEff
          : typeof rawCape === "number" && Number.isFinite(rawCape)
            ? Math.round(rawCape)
            : null,
      cin:
        typeof rawCin === "number" && Number.isFinite(rawCin)
          ? Math.round(rawCin)
          : soundingAnalysis?.cin ?? null,
      liftedIndex:
        typeof rawLi === "number" && Number.isFinite(rawLi)
          ? Number(rawLi.toFixed(1))
          : soundingAnalysis?.liftedIndex ?? null,
      freezingLevelM,
      temp850hPa
    });
  }

  // 15 Dakikalık Yüksek Çözünürlüklü Nowcast Serisi (+6 saat)
  const minutely15: Minutely15Point[] = [];
  if (min15Raw && Array.isArray(min15Raw.time)) {
    const mTimes: string[] = min15Raw.time;
    const baseHour0 = hourly[0];
    for (let j = 0; j < Math.min(24, mTimes.length); j++) {
      const tStr = String(mTimes[j]);
      const mTemp = Number(
        (Number(min15Raw.temperature_2m?.[j] ?? baseHour0?.temperature ?? 0) +
          firstHourTempShiftC * Math.exp(-j / 16)).toFixed(1)
      );
      const mPrecip = Number(Math.max(0, Number(min15Raw.precipitation?.[j] ?? 0)).toFixed(2));
      const mRain = Number(Math.max(0, Number(min15Raw.rain?.[j] ?? 0)).toFixed(2));
      const mSnow = Number(Math.max(0, Number(min15Raw.snowfall?.[j] ?? 0)).toFixed(2));
      const mGust = Number(Math.max(0, Number(min15Raw.wind_gusts_10m?.[j] ?? 0)).toFixed(1));
      const mCode = Number(min15Raw.weather_code?.[j] ?? 0);
      const mCapeRaw = min15Raw.cape?.[j];
      const mLpiRaw = min15Raw.lightning_potential?.[j];

      const pPhase = classifyPrecipPhase({
        temperatureC: mTemp,
        humidityPct: baseHour0?.humidity ?? 65,
        precipitationMm: mPrecip * 4, // 15dk -> saatlik eşdeğer yoğunluk
        snowfallCm: mSnow,
        weatherCode: mCode,
        temp850hPa: baseHour0?.temp850hPa ?? null,
        freezingLevelM: baseHour0?.freezingLevelM ?? null,
        elevationM: cityElevationM,
        mucape: typeof mCapeRaw === "number" ? mCapeRaw : baseHour0?.cape ?? 0
      });

      minutely15.push({
        time: tStr,
        label: tStr.slice(11, 16),
        temperature: mTemp,
        precipitation: mPrecip,
        rain: mRain,
        snowfall: mSnow,
        windGusts: mGust,
        cape: typeof mCapeRaw === "number" && Number.isFinite(mCapeRaw) ? Math.round(mCapeRaw) : null,
        lightningPotential:
          typeof mLpiRaw === "number" && Number.isFinite(mLpiRaw)
            ? Number(mLpiRaw.toFixed(1))
            : null,
        weatherCode: mCode,
        precipPhase: pPhase.precipPhase
      });
    }
  }

  // Birleşik 48s Fırtına Tehdit Özeti
  const stormAssessment = buildStormAssessment(hourlyStormEvals, hourlyPrecipTrack);

  // Anlık 7-Model Dökümü
  const curUtcKey = times[startIdx]
    ? localIsoToUtcHourKey(times[startIdx], utcOffsetSeconds)
    : new Date().toISOString().slice(0, 13) + ":00";

  const curTempSnap = readSevenModelSnapshot("temperature_2m", curUtcKey);
  const curPressSnap = readSevenModelSnapshot("pressure_msl", curUtcKey);
  const curWindSnap = readSevenModelSnapshot("wind_speed_10m", curUtcKey);
  const curT850Snap = readSevenModelSnapshot("temperature_850hPa", curUtcKey, true);
  const curPrecipSnap = readSevenModelSnapshot("precipitation", curUtcKey);
  const curCapeSnap = readSevenModelSnapshot("cape", curUtcKey);

  const activeModels = SEVEN_MODEL_KEYS.filter(
    (k) => curTempSnap[k] !== null && curTempSnap[k] !== undefined
  ).map((k) => SEVEN_MODEL_META[k].label);

  const tempSpreadC = spreadOf(curTempSnap);
  const pressureSpreadHpa = spreadOf(curPressSnap);
  const confidencePct =
    activeModels.length >= 2
      ? computeHybridConfidence(tempSpreadC, pressureSpreadHpa)
      : 82;

  const firstHour = hourly[0];
  const rawUncorrectedTemp = blendHybridParameter(
    curTempSnap,
    mos.shortRangeWeights.temperature,
    Number(cur.temperature_2m ?? firstHour?.temperature ?? 0)
  );
  const hybridCurTemp = firstHour ? firstHour.temperature : Number(rawUncorrectedTemp.toFixed(1));
  const nowcastTempDeltaC = Number((hybridCurTemp - rawUncorrectedTemp).toFixed(2));
  mos.summary.nowcastTempDeltaC = nowcastTempDeltaC;
  if (mos.report.calibration) {
    mos.report.calibration.nowcastTempDeltaC = nowcastTempDeltaC;
  }

  const hybridCurDew = firstHour?.dewPoint ?? Number(cur.dew_point_2m ?? 0);
  const hybridCurRh = firstHour?.humidity ?? Math.round(relativeHumidityFromDewPoint(hybridCurTemp, hybridCurDew));
  const hybridCurApparent = firstHour?.apparentTemperature ?? hybridCurTemp;
  const pNow = firstHour?.pressure ?? Number(cur.pressure_msl ?? 1013);
  const hybridCurWind = firstHour?.windSpeed ?? Number(cur.wind_speed_10m ?? 0);
  const hybridCurGust = firstHour?.windGusts ?? Number(cur.wind_gusts_10m ?? hybridCurWind);
  const hybridCurDir = firstHour?.windDirection ?? Number(cur.wind_direction_10m ?? 0);
  const hybridCurPrecip = firstHour?.precipitation ?? Number(cur.precipitation ?? 0);
  const curPrecipConsensus = firstHour?.precipConsensus ?? computePrecipConsensus(curPrecipSnap);

  // 3 saatlik gerçek barometrik eğilim
  const pPrevUtcDate = new Date(
    localIsoToUtcDate(times[startIdx] ?? "", utcOffsetSeconds).getTime() - 3 * 3600000
  );
  const prevUtcKey = pPrevUtcDate.toISOString().slice(0, 16);
  const prevPressSnap = readSevenModelSnapshot("pressure_msl", prevUtcKey);
  const pPrevIdx = Math.max(0, startIdx - 3);
  const pPrev = blendKalmanCorrectedScalar({
    snapshot: prevPressSnap,
    mos,
    param: "pressure",
    leadHour: 0,
    localHour: Number(times[pPrevIdx]?.slice(11, 13) ?? 0),
    fallback: Number(hourlyRaw.pressure_msl?.[pPrevIdx] ?? pNow)
  });
  const pressureDelta3h = Number((pNow - pPrev).toFixed(1));

  // 5. KALİBRE 7 GÜNLÜK TAHMİN (daily[0..6] — 7-Model + Kalman + 122-Üye Ensemble Tutarlılığı!)
  const dailyDates: string[] = dailyRaw.time ?? [];
  const daily: DailyPoint[] = dailyDates.slice(0, 7).map((dateStr, dIdx) => {
    let minT = Infinity;
    let maxT = -Infinity;
    let minP10 = Infinity;
    let minP90 = Infinity;
    let maxP10 = -Infinity;
    let maxP90 = -Infinity;
    let precipSum = 0;
    let precipP90Sum = 0;
    let maxPop = 0;
    let maxWind = 0;
    let maxGust = 0;
    let maxStormScore = 0;
    let dominantPhase: PrecipPhase = "none";
    let matchedDayHours = 0;

    for (let hh = 0; hh < 24; hh++) {
      const localIso = `${dateStr}T${String(hh).padStart(2, "0")}:00`;
      const utcDate = localIsoToUtcDate(localIso, utcOffsetSeconds);
      const uKey = utcDate.toISOString().slice(0, 16);
      const leadH = Math.max(0, Math.round((utcDate.getTime() - nowUtcMs) / 3600000));

      // İlk 48 saatte zaten tam hesaplanmış hourly dizisinden birebir al -> %100 tutarlılık!
      const existingH = hourly.find((pt) => pt.time === localIso);
      if (existingH) {
        matchedDayHours++;
        if (existingH.temperature < minT) minT = existingH.temperature;
        if (existingH.temperature > maxT) maxT = existingH.temperature;
        if (existingH.tempP10 !== undefined && existingH.tempP10 < minP10) minP10 = existingH.tempP10;
        if (existingH.tempP90 !== undefined && existingH.tempP90 < minP90) minP90 = existingH.tempP90;
        if (existingH.tempP10 !== undefined && existingH.tempP10 > maxP10) maxP10 = existingH.tempP10;
        if (existingH.tempP90 !== undefined && existingH.tempP90 > maxP90) maxP90 = existingH.tempP90;
        precipSum += existingH.precipitation;
        precipP90Sum += existingH.precipConsensus.p90Mm ?? existingH.precipitation;
        maxPop = Math.max(maxPop, existingH.precipProbability);
        maxWind = Math.max(maxWind, existingH.windSpeed);
        maxGust = Math.max(maxGust, existingH.windGusts);
        maxStormScore = Math.max(maxStormScore, existingH.stormScore ?? 0);
        if (existingH.precipPhase === "hail") dominantPhase = "hail";
        else if (existingH.precipPhase === "snow" && dominantPhase !== "hail") dominantPhase = "snow";
        else if (existingH.precipPhase === "sleet" && dominantPhase !== "hail" && dominantPhase !== "snow")
          dominantPhase = "sleet";
        else if (existingH.precipPhase === "rain" && dominantPhase === "none") dominantPhase = "rain";
        continue;
      }

      // 48–168 saat: 7-model + Kalman decay + 122-üye ensemble ile kalibre et!
      const hIdx = utcTimeIndex.get(uKey);
      if (hIdx === undefined) continue;
      matchedDayHours++;

      const tSnap = readSevenModelSnapshot("temperature_2m", uKey);
      const pSnap = readSevenModelSnapshot("precipitation", uKey);
      const wSnap = readSevenModelSnapshot("wind_speed_10m", uKey);
      const gSnap = readSevenModelSnapshot("wind_gusts_10m", uKey);

      const eIdx = ensIndex.utcIndex.get(uKey);
      const eT = readEnsembleRow(ensIndex.tempCols, eIdx);
      const eP = readEnsembleRow(ensIndex.precipCols, eIdx);
      const eG = readEnsembleRow(ensIndex.gustCols, eIdx);
      const eTStats = eT ? computeEnsembleDistStats(eT) : null;
      const eGStats = eG ? computeEnsembleDistStats(eG) : null;

      const tCal = blendKalmanCorrectedScalar({
        snapshot: tSnap,
        mos,
        param: "temperature",
        leadHour: leadH,
        localHour: hh,
        fallback: Number(dailyRaw.temperature_2m_max?.[dIdx] ?? 15),
        ensembleP50: eTStats?.p50 ?? null
      });
      if (tCal < minT) minT = tCal;
      if (tCal > maxT) maxT = tCal;
      if (eTStats) {
        const sh = tCal - eTStats.p50;
        if (eTStats.p10 + sh < minP10) minP10 = eTStats.p10 + sh;
        if (eTStats.p90 + sh < minP90) minP90 = eTStats.p90 + sh;
        if (eTStats.p10 + sh > maxP10) maxP10 = eTStats.p10 + sh;
        if (eTStats.p90 + sh > maxP90) maxP90 = eTStats.p90 + sh;
      }

      const wLead = getLeadTimeWeights(
        mos.shortRangeWeights.precipitation,
        mos.mediumRangeWeights.precipitation,
        leadH
      );
      const fp = fusePrecipitationHour({
        detSnapshot: pSnap,
        detWeights: wLead,
        ensembleMembersMm: eP,
        rawPrecipFallbackMm: 0,
        rawPopFallbackPct: Number(dailyRaw.precipitation_probability_max?.[dIdx] ?? 0),
        leadHour: leadH
      });
      precipSum += fp.precipitationMm;
      precipP90Sum += fp.consensus.p90Mm ?? fp.precipitationMm;
      maxPop = Math.max(maxPop, fp.precipProbabilityPct);
      if (fp.precipitationMm >= 0.2) {
        if (tCal <= 0.5) dominantPhase = "snow";
        else if (dominantPhase === "none") dominantPhase = "rain";
      }

      const wCal = blendKalmanCorrectedScalar({
        snapshot: wSnap,
        mos,
        param: "wind",
        leadHour: leadH,
        localHour: hh,
        fallback: 0
      });
      const wGLead = getLeadTimeWeights(mos.shortRangeWeights.wind, mos.mediumRangeWeights.wind, leadH);
      const gCal = Math.max(
        wCal,
        blendHybridParameter(gSnap, { ...wGLead, ecmwfAifs: 0 }, wCal),
        eGStats?.p50 ?? 0
      );
      maxWind = Math.max(maxWind, wCal);
      maxGust = Math.max(maxGust, gCal);
    }

    const rawMax = Number(dailyRaw.temperature_2m_max?.[dIdx] ?? 0);
    const rawMin = Number(dailyRaw.temperature_2m_min?.[dIdx] ?? 0);
    const rawPrecipSum = Number(dailyRaw.precipitation_sum?.[dIdx] ?? 0);
    const rawPopMax = Number(dailyRaw.precipitation_probability_max?.[dIdx] ?? 0);
    const rawWindMax = Number(dailyRaw.wind_speed_10m_max?.[dIdx] ?? 0);

    // Bugün (dIdx === 0) geçmiş saatler de dahil olduğundan rawMax/rawMin ile anlık kalibre T'yi güvenle hizala
    let finalMax = matchedDayHours >= 10 && Number.isFinite(maxT) ? maxT : rawMax;
    let finalMin = matchedDayHours >= 10 && Number.isFinite(minT) ? minT : rawMin;
    if (dIdx === 0) {
      finalMax = Math.max(finalMax, hybridCurTemp);
      finalMin = Math.min(finalMin, hybridCurTemp);
    }
    if (finalMin > finalMax) {
      const mid = (finalMin + finalMax) * 0.5;
      finalMin = mid;
      finalMax = mid;
    }

    const code = Number(dailyRaw.weather_code?.[dIdx] ?? 0);
    const finalPrecip =
      matchedDayHours >= 12 ? Number(precipSum.toFixed(1)) : Number(rawPrecipSum.toFixed(1));
    const finalPop =
      matchedDayHours >= 12 ? Math.round(maxPop) : Math.round(rawPopMax);
    const finalWind =
      matchedDayHours >= 12 ? Math.round(maxWind) : Math.round(rawWindMax);

    return {
      date: dateStr,
      dayName: formatDayName(dateStr, dIdx),
      tempMax: Math.round(finalMax),
      tempMin: Math.round(finalMin),
      tempMaxP10: Number.isFinite(maxP10) && maxP10 > -90 ? Math.round(maxP10) : undefined,
      tempMaxP90: Number.isFinite(maxP90) && maxP90 > -90 ? Math.round(maxP90) : undefined,
      tempMinP10: Number.isFinite(minP10) && minP10 < 90 ? Math.round(minP10) : undefined,
      tempMinP90: Number.isFinite(minP90) && minP90 < 90 ? Math.round(minP90) : undefined,
      weatherCode: code,
      condition: mapWmoCodeToLabel(code),
      precipSum: finalPrecip,
      precipP90: matchedDayHours >= 12 ? Number(precipP90Sum.toFixed(1)) : undefined,
      precipProbabilityMax: finalPop,
      precipPhase: dominantPhase,
      windSpeedMax: finalWind,
      windGustMax: matchedDayHours >= 12 ? Math.round(maxGust) : undefined,
      stormScoreMax: maxStormScore > 0 ? maxStormScore : undefined,
      uvIndexMax: Number(Number(dailyRaw.uv_index_max?.[dIdx] ?? 0).toFixed(1)),
      sunrise: String(dailyRaw.sunrise?.[dIdx] ?? ""),
      sunset: String(dailyRaw.sunset?.[dIdx] ?? "")
    };
  });

  const aqiCur = aJson?.current ?? {};
  const euAqi = Math.round(Number(aqiCur.european_aqi ?? 20));
  const aqiMeta = mapEuropeanAqi(euAqi);
  const aqValues = {
    pm25: Number(Number(aqiCur.pm2_5 ?? 0).toFixed(1)),
    pm10: Number(Number(aqiCur.pm10 ?? 0).toFixed(1)),
    ozone: Math.round(Number(aqiCur.ozone ?? 0)),
    no2: Number(Number(aqiCur.nitrogen_dioxide ?? 0).toFixed(1)),
    so2: Number(Number(aqiCur.sulphur_dioxide ?? 0).toFixed(1))
  };
  const dom = detectDominantPollutant(aqValues);

  const airQuality: AirQualityDetail = {
    europeanAqi: euAqi,
    categoryIndex: aqiMeta.categoryIndex,
    label: aqiMeta.label,
    dominantPollutant: dom.dominantPollutant,
    dominantValueText: dom.dominantValueText,
    ...aqValues,
    dust: Math.round(Number(aqiCur.dust ?? 0))
  };

  const curSolarElev = Number(
    computeSolarElevationDeg(location.lat, location.lon, new Date()).toFixed(1)
  );
  const curUv = firstHour?.uvIndex ?? 0;

  const isLiveVerified =
    mos.report.mode === "live-metar-48h" || mos.report.mode === "live-metar-24h";
  const stIdsText =
    mos.summary.stationIds.length > 0 ? mos.summary.stationIds.join(" + ") : "WMO";
  const ensLabel =
    ensIndex.memberCount > 0 ? `${ensIndex.memberCount}-Üye EPS` : "7-Model NWP";

  const attributions: HybridSourceAttribution[] = [
    {
      parameter: "2m Sıcaklık & Çiy Noktası",
      primaryEngine: topModelLabel(mos.shortRangeWeights.temperature),
      weightsLabel: formatWeightsLabel(mos.shortRangeWeights.temperature),
      standardRef: isLiveVerified
        ? `48s Çoklu METAR (${stIdsText}) Kalman/Diurnal MOS + UBRMSE²`
        : `7-Model + ${ensLabel} + Bolton (1980)`,
      reason:
        "7 Tier-1 model gündüz/gece fazlı Kalman sapma düzeltmesinden geçirilir; 0–6s aralığında canlı METAR sensörü asimile edilir."
    },
    {
      parameter: "Yağış, PoP & Faz (Kar/Dolu)",
      primaryEngine: topModelLabel(mos.shortRangeWeights.precipitation),
      weightsLabel: `${ensLabel} PMM · ${formatWeightsLabel(mos.shortRangeWeights.precipitation)}`,
      standardRef: "Ebert (2001) PMM + METAR wxString Brier + Stull (2011) Tw",
      reason:
        "122-üyeli ensemble ile hayalet çiseleme bastırılır, sağanak zirvesi korunur; ıslak termometre (Tw) ile kar/sulu kar/dolu ayrılır."
    },
    {
      parameter: "Şiddetli Fırtına & Oraj Motoru",
      primaryEngine: "ATMOS-Core v3 SPC/ESTOFEX",
      weightsLabel: `MUCAPE · Bunkers SRH · SCP · DCAPE`,
      standardRef: `7-Model CAPE + ${ensLabel} Hamle/CAPE + 15dk Nowcast`,
      reason:
        "Gece/cephe orajları için MUCAPE, dönen fırtınalar için 0–3 km SRH/SCP ve ani hamle için DCAPE birleşik 0–100 tehdit skoruna çevrilir."
    },
    {
      parameter: "Deniz Seviyesi Basıncı (MSLP)",
      primaryEngine: topModelLabel(mos.shortRangeWeights.pressure),
      weightsLabel: formatWeightsLabel(mos.shortRangeWeights.pressure),
      standardRef: isLiveVerified
        ? `Çoklu METAR QNH Kalman + WMO FM-12 Eğilim`
        : "WMO LC-DNV MSLP + WMO FM-12 Barometrik Eğilim",
      reason:
        "Kalman sapma giderimli deniz seviyesi basıncı ve 3s/6s sinoptik cephe/siklon düşüş analizi."
    },
    {
      parameter: "10m Rüzgar, Hamle & Yön",
      primaryEngine: topModelLabel(mos.shortRangeWeights.wind),
      weightsLabel: formatWeightsLabel(mos.shortRangeWeights.wind),
      standardRef: "Vektörel Yön Ortalaması + 6 Fiziksel Hamle Modeli + P90",
      reason:
        "Yön vektörel ortalamayla birleştirilir; hamle P90 üst sınırı 122 ensemble üyesinden üretilir."
    },
    {
      parameter: "Dikey Sondaj (1000–300 hPa)",
      primaryEngine: "Dinamik GPH + Canlı Lapse Rate",
      weightsLabel: `Γ_env ${mos.summary.envLapseRateCPerKm}°C/km · Bolton (1980)`,
      standardRef: "MUCAPE · MLCAPE · Stull Tw · NOAA EoT (<0.01°)",
      reason:
        "Gerçek 1000→850 hPa sıcaklık gradyanıyla inversiyonlarda bile doğru rakım düzeltmesi ve tam termodinamik sondaj."
    }
  ];

  const hybrid: HybridMeta = {
    engineVersion: "ATMOS-Core v3.0",
    activeModels: activeModels.length > 0 ? activeModels : ["Open-Meteo NWP"],
    ensembleMembers: ensIndex.memberCount,
    confidencePct,
    tempSpreadC,
    pressureSpreadHpa,
    currentBreakdown: {
      temperature: curTempSnap,
      pressure: curPressSnap,
      windSpeed: curWindSnap,
      temp850hPa: curT850Snap,
      precipitation: curPrecipSnap,
      cape: curCapeSnap
    },
    verification: mos.report,
    attributions
  };

  const curWmo = firstHour?.weatherCode ?? Number(cur.weather_code ?? 0);
  const bundle: WeatherBundle = {
    location: {
      ...location,
      elevation: cityElevationM,
      timezone: String(fJson.timezone ?? location.timezone ?? "UTC")
    },
    source: isLiveVerified
      ? "hybrid-nwp-verified"
      : activeModels.length >= 2
        ? "hybrid-nwp"
        : "open-meteo",
    fetchedAt: new Date().toISOString(),
    timezone: String(fJson.timezone ?? "UTC"),
    utcOffsetSeconds,
    current: {
      time: String(cur.time ?? new Date().toISOString()),
      temperature: hybridCurTemp,
      apparentTemperature: hybridCurApparent,
      wetBulbC: firstHour?.wetBulbC ?? Number(wetBulbStullC(hybridCurTemp, hybridCurRh).toFixed(1)),
      tempBand: firstHourTempBand,
      humidity: hybridCurRh,
      dewPoint: hybridCurDew,
      pressure: pNow,
      pressureDelta3h,
      pressureTrend: classifyPressureTrend(pressureDelta3h),
      pressureTrendDetail: describePressureTrendDetail(pressureDelta3h),
      windSpeed: hybridCurWind,
      windGusts: hybridCurGust,
      windDirection: hybridCurDir,
      beaufort: windKmhToBeaufort(hybridCurWind),
      cloudCover: Math.round(Number(cur.cloud_cover ?? firstHour?.cloudCover ?? 0)),
      visibilityKm: firstHour?.visibilityKm ?? 15,
      uvIndex: curUv,
      uvLabel: classifyUvIndex(curUv),
      precipitation: hybridCurPrecip,
      precipProbability: firstHour?.precipProbability ?? 0,
      precipConsensus: curPrecipConsensus,
      precipType: firstHour?.precipType ?? mapWmoToPrecipType(curWmo, hybridCurPrecip, 0),
      precipPhase: firstHour?.precipPhase ?? "none",
      weatherCode: curWmo,
      condition: firstHour?.condition ?? mapWmoCodeToLabel(curWmo),
      isStorm: firstHour?.isStorm ?? (hybridCurWind >= 50 || curWmo >= 95),
      stormScore: stormAssessment.score,
      isDay: Number(cur.is_day ?? (curSolarElev > 0 ? 1 : 0)) === 1,
      solarElevationDeg: curSolarElev,
      daylight: solarElevationToDaylight(curSolarElev),
      sunrise: daily[0]?.sunrise ?? "",
      sunset: daily[0]?.sunset ?? "",
      temp850hPa: firstHour?.temp850hPa ?? null
    },
    airQuality,
    hourly,
    minutely15,
    daily,
    sounding: hourlySoundings[0] ?? initialSounding,
    hourlySoundings,
    nativeConvective: {
      cape: firstHour?.cape ?? null,
      cin: firstHour?.cin ?? null,
      liftedIndex: firstHour?.liftedIndex ?? null,
      freezingLevelM: firstHour?.freezingLevelM ?? null,
      lightningPotential: minutely15[0]?.lightningPotential ?? null
    },
    storm: stormAssessment,
    hybrid
  };

  weatherCache.set(key, { value: bundle, expiresAt: Date.now() + WEATHER_TTL_MS });
  return bundle;
}

/**
 * Gerçek 7-Model Çoklu Sayısal Tahmin (NWP + AI) Karşılaştırması (72 saat):
 * ECMWF IFS 9km · ECMWF AIFS v1 · DWD ICON-EU/D2 · UKMO · Météo-France AROME · NOAA GFS · ECCC GEM
 */
export async function fetchMultiModelBundle(
  lat: number,
  lon: number
): Promise<MultiModelBundle> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const cached = modelCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat.toFixed(4));
  url.searchParams.set("longitude", lon.toFixed(4));
  url.searchParams.set(
    "hourly",
    "temperature_2m,precipitation,wind_speed_10m,temperature_850hPa"
  );
  url.searchParams.set(
    "models",
    "ecmwf_ifs,ecmwf_aifs025_single,icon_seamless,ukmo_seamless,meteofrance_seamless,gfs_seamless,gem_seamless,ecmwf_ifs025"
  );
  url.searchParams.set("forecast_days", "4");
  url.searchParams.set("timezone", "auto");

  const res = await fetchWithRetry(url.toString(), 11000, 1);
  if (!res.ok) {
    throw new Error(`Open-Meteo multi-model HTTP ${res.status}`);
  }

  const json = await res.json();
  const h = json.hourly ?? {};
  const times: string[] = h.time ?? [];

  const nowIso = new Date(
    Date.now() + Number(json.utc_offset_seconds ?? 0) * 1000
  )
    .toISOString()
    .slice(0, 13);
  let startIdx = times.findIndex((t) => t >= nowIso);
  if (startIdx < 0) startIdx = 0;

  const endIdx = Math.min(startIdx + 72, times.length);

  const buildSeries = (
    prefix: string,
    useIfs025ForIfs = false
  ): ModelSeriesPoint[] => {
    const out: ModelSeriesPoint[] = [];
    const ifsApiId = useIfs025ForIfs ? "ecmwf_ifs025" : "ecmwf_ifs";
    for (let i = startIdx; i < endIdx; i++) {
      const t = times[i];
      const dayIdx = Math.floor((i - startIdx) / 24);
      out.push({
        time: t,
        hourLabel: t.slice(11, 16),
        dayLabel: dayIdx === 0 ? "Bugün" : dayIdx === 1 ? "Yarın" : `+${dayIdx}g`,
        ecmwfIfs: toFiniteNum(h[`${prefix}_${ifsApiId}`]?.[i]),
        ecmwfAifs: toFiniteNum(h[`${prefix}_ecmwf_aifs025_single`]?.[i]),
        icon: toFiniteNum(h[`${prefix}_icon_seamless`]?.[i]),
        ukmo: toFiniteNum(h[`${prefix}_ukmo_seamless`]?.[i]),
        meteofrance: toFiniteNum(h[`${prefix}_meteofrance_seamless`]?.[i]),
        gfs: toFiniteNum(h[`${prefix}_gfs_seamless`]?.[i]),
        gem: toFiniteNum(h[`${prefix}_gem_seamless`]?.[i])
      });
    }
    return out;
  };

  const temp2m = buildSeries("temperature_2m");
  const temp850 = buildSeries("temperature_850hPa", true);
  const precip = buildSeries("precipitation");
  const wind10m = buildSeries("wind_speed_10m");

  const sumOf = (arr: ModelSeriesPoint[], field: SevenModelKey) =>
    Number(arr.reduce((acc, p) => acc + (p[field] ?? 0), 0).toFixed(1));

  const minOf = (arr: ModelSeriesPoint[], field: SevenModelKey) => {
    const vals = arr
      .map((p) => p[field])
      .filter((v): v is number => v !== null && v !== undefined);
    return vals.length > 0 ? Math.min(...vals) : null;
  };

  let maxSpreadTemp2m = 0;
  for (const pt of temp2m) {
    const vals = SEVEN_MODEL_KEYS.map((k) => pt[k]).filter(
      (v): v is number => v !== null && v !== undefined
    );
    if (vals.length >= 2) {
      maxSpreadTemp2m = Math.max(
        maxSpreadTemp2m,
        Number((Math.max(...vals) - Math.min(...vals)).toFixed(1))
      );
    }
  }

  const bundle: MultiModelBundle = {
    fetchedAt: new Date().toISOString(),
    lat,
    lon,
    temp2m,
    temp850,
    precip,
    wind10m,
    summary: {
      precip72h: {
        ecmwfIfs: sumOf(precip, "ecmwfIfs"),
        ecmwfAifs: sumOf(precip, "ecmwfAifs"),
        icon: sumOf(precip, "icon"),
        ukmo: sumOf(precip, "ukmo"),
        meteofrance: sumOf(precip, "meteofrance"),
        gfs: sumOf(precip, "gfs"),
        gem: sumOf(precip, "gem")
      },
      maxSpreadTemp2m,
      min850hPa: {
        ecmwfIfs: minOf(temp850, "ecmwfIfs"),
        ecmwfAifs: minOf(temp850, "ecmwfAifs"),
        icon: minOf(temp850, "icon"),
        ukmo: minOf(temp850, "ukmo"),
        meteofrance: minOf(temp850, "meteofrance"),
        gfs: minOf(temp850, "gfs"),
        gem: minOf(temp850, "gem")
      }
    }
  };

  modelCache.set(key, { value: bundle, expiresAt: Date.now() + MODEL_TTL_MS });
  return bundle;
}

export async function fetchRadarMetadata(): Promise<RadarMetadata> {
  if (radarCache && radarCache.expiresAt > Date.now()) {
    return radarCache.value;
  }

  const res = await fetchWithRetry(
    "https://api.rainviewer.com/public/weather-maps.json",
    8000,
    1
  );

  if (!res.ok) {
    throw new Error(`RainViewer HTTP ${res.status}`);
  }

  const json = await res.json();
  const past = Array.isArray(json?.radar?.past) ? json.radar.past : [];
  const nowcast = Array.isArray(json?.radar?.nowcast) ? json.radar.nowcast : [];
  const frames = [...past, ...nowcast].map((f: { time: number; path: string }) => ({
    time: Number(f.time),
    path: String(f.path)
  }));

  const meta: RadarMetadata = {
    host: String(json.host ?? "https://tilecache.rainviewer.com"),
    generated: Number(json.generated ?? Math.floor(Date.now() / 1000)),
    frames
  };

  radarCache = { value: meta, expiresAt: Date.now() + RADAR_TTL_MS };
  return meta;
}

export async function fetchWindGrid(bounds: {
  south: number;
  west: number;
  north: number;
  east: number;
}): Promise<WindGridBundle> {
  const rows = 5;
  const cols = 5;
  const south = Math.max(-80, Math.min(80, bounds.south));
  const north = Math.max(-80, Math.min(80, bounds.north));
  const west = Math.max(-180, Math.min(180, bounds.west));
  const east = Math.max(-180, Math.min(180, bounds.east));

  const snap = (n: number) => (Math.round(n * 2) / 2).toFixed(1);
  const cacheKey = `${snap(south)},${snap(west)},${snap(north)},${snap(east)}`;
  const cached = windGridCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const lats: string[] = [];
  const lons: string[] = [];
  for (let r = 0; r < rows; r++) {
    const lat = south + ((north - south) * r) / (rows - 1);
    for (let c = 0; c < cols; c++) {
      const lon = west + ((east - west) * c) / (cols - 1);
      lats.push(lat.toFixed(3));
      lons.push(lon.toFixed(3));
    }
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lats.join(",")}&longitude=${lons.join(",")}&current=wind_speed_10m,wind_direction_10m`;
  const res = await fetchWithRetry(url, 9000, 1);
  if (!res.ok) {
    throw new Error(`Open-Meteo wind-grid HTTP ${res.status}`);
  }

  const raw = await res.json();
  const list: Array<{ current?: { wind_speed_10m?: number; wind_direction_10m?: number } }> =
    Array.isArray(raw) ? raw : [raw];

  const u: number[] = [];
  const v: number[] = [];
  const speedKmh: number[] = [];
  let maxSpeedKmh = 0;

  for (let i = 0; i < rows * cols; i++) {
    const item = list[i]?.current;
    const spd =
      typeof item?.wind_speed_10m === "number" && Number.isFinite(item.wind_speed_10m)
        ? Number(item.wind_speed_10m.toFixed(1))
        : 0;
    const dirDeg =
      typeof item?.wind_direction_10m === "number" &&
      Number.isFinite(item.wind_direction_10m)
        ? item.wind_direction_10m
        : 0;
    const rad = (dirDeg * Math.PI) / 180;
    u.push(Number((-spd * Math.sin(rad)).toFixed(2)));
    v.push(Number((-spd * Math.cos(rad)).toFixed(2)));
    speedKmh.push(spd);
    if (spd > maxSpeedKmh) maxSpeedKmh = spd;
  }

  const grid: WindGridBundle = {
    rows,
    cols,
    south,
    west,
    north,
    east,
    u,
    v,
    speedKmh,
    maxSpeedKmh,
    fetchedAt: new Date().toISOString()
  };

  windGridCache.set(cacheKey, { value: grid, expiresAt: Date.now() + WIND_GRID_TTL_MS });
  return grid;
}

export { WMO_PRIOR_WEIGHTS };
