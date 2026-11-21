import {
  dewPointMagnus,
  relativeHumidityFromDewPoint
} from "./thermo-cape";
import {
  clearMetarCache,
  evaluateModelsAgainstMetar,
  fetchNearestMetarHistory,
  FIVE_MODEL_KEYS,
  FIVE_MODEL_META,
  WMO_PRIOR_WEIGHTS
} from "./metar-verify";
import type {
  AirQualityDetail,
  BeaufortInfo,
  DailyPoint,
  FiveModelKey,
  GeoLocation,
  HourlyPoint,
  HybridMeta,
  HybridModelSnapshot,
  HybridSourceAttribution,
  ModelSeriesPoint,
  MultiModelBundle,
  PrecipitationConsensus,
  PrecipType,
  PressureTrend,
  RadarMetadata,
  SoundingLevel,
  UnitSystem,
  WeatherBundle
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

/**
 * NOAA Global Monitoring Laboratory (Spencer / Meeus Fourier Serisi)
 * Kesirli yıl açısı gamma (radyan)
 */
function fractionalYearRad(dateUtc: Date): number {
  const year = dateUtc.getUTCFullYear();
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInYear = isLeap ? 366 : 365;
  const startOfYear = Date.UTC(year, 0, 1);
  const dayOfYear = Math.floor((dateUtc.getTime() - startOfYear) / 86400000); // 0-indexed (Jan 1 = 0)
  const utcHours =
    dateUtc.getUTCHours() +
    dateUtc.getUTCMinutes() / 60 +
    dateUtc.getUTCSeconds() / 3600;
  return ((2 * Math.PI) / daysInYear) * (dayOfYear + (utcHours - 12) / 24);
}

/**
 * NOAA Zaman Denklemi (Equation of Time, dakika cinsinden; -14.2 .. +16.4 dk aralığında).
 */
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

/**
 * NOAA Güneş Deklinasyonu (radyan).
 */
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

/**
 * Resmi NOAA Global Monitoring Laboratory Güneş Yükselme Açısı (derece, -90..+90)
 * Zaman Denklemi (EoT) + Tam Fourier Deklinasyon + Saemundsson atmosferik kırılma düzeltmesi.
 */
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

  // Ufuk yakınında atmosferik kırılma düzeltmesi (NOAA / Saemundsson)
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

/**
 * NOAA EoT düzeltmeli tam astronomik Güneş Altı Noktası (3D Küre Gece-Gündüz Terminatörü için).
 */
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

/**
 * Resmi EEA (European Environment Agency) 6 Bantlı EAQI Sınıflandırması.
 */
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

/**
 * Resmi EEA saatlik eşik tablosuna göre EAQI'yi belirleyen baskın kirletici tespiti.
 */
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
    {
      name: "PM2.5",
      score: scoreBands(aq.pm25, [5, 15, 50, 90, 140]),
      text: `${aq.pm25} µg/m³`
    },
    {
      name: "PM10",
      score: scoreBands(aq.pm10, [15, 45, 90, 180, 270]),
      text: `${aq.pm10} µg/m³`
    },
    {
      name: "O₃",
      score: scoreBands(aq.ozone, [50, 100, 130, 240, 380]),
      text: `${aq.ozone} µg/m³`
    },
    {
      name: "NO₂",
      score: scoreBands(aq.no2, [10, 40, 90, 120, 230]),
      text: `${aq.no2} µg/m³`
    },
    {
      name: "SO₂",
      score: scoreBands(aq.so2, [50, 100, 200, 350, 500]),
      text: `${aq.so2} µg/m³`
    }
  ];

  candidates.sort((a, b) => b.score - a.score);
  return {
    dominantPollutant: candidates[0].name,
    dominantValueText: candidates[0].text
  };
}

/**
 * Resmi WMO / UK Met Office Barometrik Eğilim Sınıflaması (3 saatlik ΔP).
 */
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

/**
 * Resmi WMO Beaufort Rüzgar Skalası (km/s -> Bft 0..12)
 */
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

/**
 * Resmi WHO Global Solar UV Index Sınıflandırması.
 */
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

/**
 * Vektörel Rüzgar Yönü Ortalaması — 350° ile 10° ortalaması 0° (Kuzey) çıkar, 180° değil!
 */
export function blendWindDirectionDeg(
  dirs: HybridModelSnapshot,
  weights: Record<FiveModelKey, number>,
  fallbackDeg: number
): number {
  let sumSin = 0;
  let sumCos = 0;
  let wSum = 0;

  for (const key of FIVE_MODEL_KEYS) {
    const d = dirs[key];
    const w = weights[key];
    if (d !== null && Number.isFinite(d) && w > 0) {
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

const DAY_NAMES_TR = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function formatDayName(dateIso: string, index: number): string {
  if (index === 0) return "Bugün";
  if (index === 1) return "Yarın";
  const d = new Date(`${dateIso}T12:00:00`);
  return DAY_NAMES_TR[d.getDay()] ?? dateIso.slice(5);
}

// Sunucu içi bellek önbellekleri
type CacheEntry<T> = { value: T; expiresAt: number };
const weatherCache = new Map<string, CacheEntry<WeatherBundle>>();
const modelCache = new Map<string, CacheEntry<MultiModelBundle>>();
let radarCache: CacheEntry<RadarMetadata> | null = null;

const WEATHER_TTL_MS = 5 * 60 * 1000;
const MODEL_TTL_MS = 10 * 60 * 1000;
const RADAR_TTL_MS = 2 * 60 * 1000;

export function clearWeatherCache(): void {
  weatherCache.clear();
  modelCache.clear();
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

/**
 * 5-Model parametre bazlı ağırlıklı hibrit birleştirme.
 * Herhangi bir model o saat/değişken için null dönerse kalan gerçek modeller arasında normalize edilir.
 */
export function blendHybridParameter(
  snapshot: HybridModelSnapshot,
  weights: Record<FiveModelKey, number>,
  fallback: number
): number {
  let num = 0;
  let den = 0;
  for (const key of FIVE_MODEL_KEYS) {
    const val = snapshot[key];
    const w = weights[key];
    if (val !== null && Number.isFinite(val) && w > 0) {
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
  const vals = FIVE_MODEL_KEYS.map((k) => snapshot[k])
    .filter((v): v is number => v !== null && Number.isFinite(v))
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
    await new Promise((r) => setTimeout(r, 420 * (attempt + 1)));
  }
  throw lastErr instanceof Error ? lastErr : new Error("Upstream fetch failed");
}

function toFiniteNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? Number(v.toFixed(1)) : null;
}

function spreadOf(snap: HybridModelSnapshot): number {
  const vals = FIVE_MODEL_KEYS.map((k) => snap[k]).filter(
    (v): v is number => v !== null && Number.isFinite(v)
  );
  if (vals.length < 2) return 0;
  return Number((Math.max(...vals) - Math.min(...vals)).toFixed(1));
}

function formatWeightsLabel(weights: Record<FiveModelKey, number>): string {
  return FIVE_MODEL_KEYS.map((k) => ({
    name: FIVE_MODEL_META[k].shortLabel,
    pct: Math.round(weights[k] * 100)
  }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)
    .map((x) => `%${x.pct} ${x.name}`)
    .join(" · ");
}

function topModelLabel(weights: Record<FiveModelKey, number>): string {
  let best: FiveModelKey = "ecmwfIfs";
  for (const k of FIVE_MODEL_KEYS) {
    if (weights[k] > weights[best]) best = k;
  }
  return FIVE_MODEL_META[best].label;
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

  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", location.lat.toFixed(4));
  forecastUrl.searchParams.set("longitude", location.lon.toFixed(4));
  forecastUrl.searchParams.set("timezone", "auto");
  forecastUrl.searchParams.set("forecast_days", "7");
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

  // Gerçek 1000–300 hPa dikey sondaj + GERÇEK DİNAMİK JEOPOTANSİYEL YÜKSEKLİK
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

  // 5 Tier-1 Operasyonel Model (+ ecmwf_ifs025 850 hPa için) — UTC ekseninde son 48s + gelecek 72s
  const hybridUrl = new URL("https://api.open-meteo.com/v1/forecast");
  hybridUrl.searchParams.set("latitude", location.lat.toFixed(4));
  hybridUrl.searchParams.set("longitude", location.lon.toFixed(4));
  hybridUrl.searchParams.set("timezone", "GMT");
  hybridUrl.searchParams.set("past_days", "2");
  hybridUrl.searchParams.set("forecast_days", "3");
  hybridUrl.searchParams.set(
    "models",
    "ecmwf_ifs,ecmwf_aifs025_single,icon_seamless,ukmo_seamless,gfs_seamless,ecmwf_ifs025"
  );
  hybridUrl.searchParams.set(
    "hourly",
    "temperature_2m,dew_point_2m,precipitation,wind_speed_10m,wind_gusts_10m,wind_direction_10m,pressure_msl,temperature_850hPa"
  );

  const aqiUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  aqiUrl.searchParams.set("latitude", location.lat.toFixed(4));
  aqiUrl.searchParams.set("longitude", location.lon.toFixed(4));
  aqiUrl.searchParams.set(
    "current",
    "european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,dust"
  );
  aqiUrl.searchParams.set("timezone", "auto");

  const [forecastRes, hybridRes, aqiRes, metarData] = await Promise.all([
    fetchWithRetry(forecastUrl.toString(), 11000, 1),
    fetchWithRetry(hybridUrl.toString(), 9500, 1).catch(() => null),
    fetchWithRetry(aqiUrl.toString(), 8000, 1).catch(() => null),
    fetchNearestMetarHistory(location.lat, location.lon).catch(() => ({
      station: null,
      history: []
    }))
  ]);

  if (!forecastRes.ok) {
    throw new Error(`Open-Meteo forecast HTTP ${forecastRes.status}`);
  }

  const fJson = await forecastRes.json();
  const hJson = hybridRes && hybridRes.ok ? await hybridRes.json() : null;
  const aJson = aqiRes && aqiRes.ok ? await aqiRes.json() : null;

  const cur = fJson.current ?? {};
  const hourlyRaw = fJson.hourly ?? {};
  const dailyRaw = fJson.daily ?? {};
  const times: string[] = hourlyRaw.time ?? [];
  const utcOffsetSeconds = Number(fJson.utc_offset_seconds ?? 0);
  const cityElevationM = Math.round(Number(fJson.elevation ?? location.elevation ?? 0));

  // 5-model UTC saat dizini
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

  // CANLI 24 SAATLİK FİZİKSEL METAR DOĞRULAMA MOTORU -> Dinamik Ters-RMSE² Ağırlıkları
  const { report: verification, weights } = evaluateModelsAgainstMetar({
    station: metarData.station,
    metarHistory: metarData.history,
    cityElevationM,
    modelHourlyUtc: hybridHourly,
    utcTimeIndex
  });

  // Hamle (gust) için 4 fiziksel model ağırlığı (ecmwf_aifs025_single hamle üretmediği için 0)
  const gustWeights: Record<FiveModelKey, number> = {
    ...weights.wind,
    ecmwfAifs: 0
  };

  const readFiveModelSnapshot = (
    prefix: string,
    utcHourKey: string,
    useIfs025ForIfs = false
  ): HybridModelSnapshot => {
    const hIdx = utcTimeIndex.get(utcHourKey);
    if (hIdx === undefined || !hybridHourly) {
      return { ecmwfIfs: null, ecmwfAifs: null, icon: null, ukmo: null, gfs: null };
    }
    const ifsApiId = useIfs025ForIfs ? "ecmwf_ifs025" : FIVE_MODEL_META.ecmwfIfs.apiModel;
    return {
      ecmwfIfs: toFiniteNum(hybridHourly[`${prefix}_${ifsApiId}`]?.[hIdx]),
      ecmwfAifs: toFiniteNum(
        hybridHourly[`${prefix}_${FIVE_MODEL_META.ecmwfAifs.apiModel}`]?.[hIdx]
      ),
      icon: toFiniteNum(hybridHourly[`${prefix}_${FIVE_MODEL_META.icon.apiModel}`]?.[hIdx]),
      ukmo: toFiniteNum(hybridHourly[`${prefix}_${FIVE_MODEL_META.ukmo.apiModel}`]?.[hIdx]),
      gfs: toFiniteNum(hybridHourly[`${prefix}_${FIVE_MODEL_META.gfs.apiModel}`]?.[hIdx])
    };
  };

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

  let rainAccum = 0;
  let snowAccum = 0;
  const hourly: HourlyPoint[] = [];
  const hourlySoundings: SoundingLevel[][] = [];

  for (let i = startIdx; i < Math.min(startIdx + 48, times.length); i++) {
    const timeStr = times[i];
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
    const rawWind = Number(hourlyRaw.wind_speed_10m?.[i] ?? 0);
    const rawGust = Number(hourlyRaw.wind_gusts_10m?.[i] ?? rawWind);
    const rawWindDir = Number(hourlyRaw.wind_direction_10m?.[i] ?? 0);
    const rawT850 = hourlyRaw["temperature_850hPa"]?.[i];

    const tempSnap = readFiveModelSnapshot("temperature_2m", utcKey);
    const dewSnap = readFiveModelSnapshot("dew_point_2m", utcKey);
    const pressSnap = readFiveModelSnapshot("pressure_msl", utcKey);
    const precipSnap = readFiveModelSnapshot("precipitation", utcKey);
    const windSnap = readFiveModelSnapshot("wind_speed_10m", utcKey);
    const gustSnap = readFiveModelSnapshot("wind_gusts_10m", utcKey);
    const dirSnap = readFiveModelSnapshot("wind_direction_10m", utcKey);
    const t850Snap = readFiveModelSnapshot("temperature_850hPa", utcKey, true);

    const temperature = Number(
      blendHybridParameter(tempSnap, weights.temperature, rawTemp).toFixed(1)
    );
    const dewPointRaw = Number(
      blendHybridParameter(dewSnap, weights.temperature, rawDew).toFixed(1)
    );
    const dewPoint = Math.min(temperature, dewPointRaw);
    // Bolton (1980) Eq. 10 fiziksel tutarlılık
    const humidity = Math.round(relativeHumidityFromDewPoint(temperature, dewPoint));

    const pressure = Number(
      blendHybridParameter(pressSnap, weights.pressure, rawPress).toFixed(1)
    );
    const precipitation = Number(
      Math.max(
        0,
        blendHybridParameter(precipSnap, weights.precipitation, rawPrecip)
      ).toFixed(2)
    );
    const precipConsensus = computePrecipConsensus(precipSnap);
    const windSpeed = Number(
      Math.max(0, blendHybridParameter(windSnap, weights.wind, rawWind)).toFixed(1)
    );
    const windGusts = Number(
      Math.max(
        windSpeed,
        blendHybridParameter(gustSnap, gustWeights, rawGust)
      ).toFixed(1)
    );
    const windDirection = blendWindDirectionDeg(dirSnap, weights.wind, rawWindDir);

    const hasT850 =
      FIVE_MODEL_KEYS.some((k) => t850Snap[k] !== null) ||
      (typeof rawT850 === "number" && Number.isFinite(rawT850));
    const temp850hPa = hasT850
      ? Number(
          blendHybridParameter(
            t850Snap,
            weights.temperature,
            typeof rawT850 === "number" ? rawT850 : 0
          ).toFixed(1)
        )
      : null;

    const rain = Number(hourlyRaw.rain?.[i] ?? 0);
    const snow = Number(hourlyRaw.snowfall?.[i] ?? 0);
    const wmo = Number(hourlyRaw.weather_code?.[i] ?? 0);
    const precipType = mapWmoToPrecipType(wmo, Math.max(rain, precipitation), snow);

    if (precipType === "rain") {
      rainAccum += Math.max(rain, precipitation);
    }
    if (precipType === "snow") {
      snowAccum += snow;
    }

    const rawCape = hourlyRaw.cape?.[i];
    const rawCin = hourlyRaw.convective_inhibition?.[i];
    const rawLi = hourlyRaw.lifted_index?.[i];
    const rawFrz = hourlyRaw.freezing_level_height?.[i];

    const rawApparent = Number(
      hourlyRaw.apparent_temperature?.[i] ?? cur.apparent_temperature ?? rawTemp
    );
    const apparentTemperature = Number((rawApparent + (temperature - rawTemp)).toFixed(1));

    hourly.push({
      time: timeStr,
      hourLabel: timeStr.slice(11, 16),
      dayLabel: i - startIdx < 24 ? "Bugün" : "Yarın",
      temperature,
      apparentTemperature,
      humidity,
      dewPoint,
      pressure,
      windSpeed,
      windGusts,
      windDirection,
      cloudCover: Math.round(Number(hourlyRaw.cloud_cover?.[i] ?? 0)),
      visibilityKm: Number((Number(hourlyRaw.visibility?.[i] ?? 15000) / 1000).toFixed(1)),
      uvIndex: Number(hourlyRaw.uv_index?.[i] ?? 0),
      precipitation,
      precipProbability: Math.round(Number(hourlyRaw.precipitation_probability?.[i] ?? 0)),
      precipConsensus,
      precipType,
      rainAccum: Number(rainAccum.toFixed(1)),
      snowAccum: Number(snowAccum.toFixed(1)),
      weatherCode: wmo,
      condition: mapWmoCodeToLabel(wmo),
      isStorm: windSpeed >= 50 || wmo >= 95 || wmo === 65 || wmo === 82,
      solarElevationDeg,
      daylight,
      cape: typeof rawCape === "number" && Number.isFinite(rawCape) ? Math.round(rawCape) : null,
      cin: typeof rawCin === "number" && Number.isFinite(rawCin) ? Math.round(rawCin) : null,
      liftedIndex:
        typeof rawLi === "number" && Number.isFinite(rawLi)
          ? Number(rawLi.toFixed(1))
          : null,
      freezingLevelM:
        typeof rawFrz === "number" && Number.isFinite(rawFrz)
          ? Math.round(rawFrz)
          : null,
      temp850hPa
    });

    hourlySoundings.push(buildSoundingAtIndex(i));
  }

  // Güncel UTC saati için 5-model anlık döküm
  const curUtcKey = times[startIdx]
    ? localIsoToUtcHourKey(times[startIdx], utcOffsetSeconds)
    : new Date().toISOString().slice(0, 13) + ":00";

  const curTempSnap = readFiveModelSnapshot("temperature_2m", curUtcKey);
  const curDewSnap = readFiveModelSnapshot("dew_point_2m", curUtcKey);
  const curPressSnap = readFiveModelSnapshot("pressure_msl", curUtcKey);
  const curWindSnap = readFiveModelSnapshot("wind_speed_10m", curUtcKey);
  const curGustSnap = readFiveModelSnapshot("wind_gusts_10m", curUtcKey);
  const curDirSnap = readFiveModelSnapshot("wind_direction_10m", curUtcKey);
  const curT850Snap = readFiveModelSnapshot("temperature_850hPa", curUtcKey, true);
  const curPrecipSnap = readFiveModelSnapshot("precipitation", curUtcKey);

  const activeModels = FIVE_MODEL_KEYS.filter((k) => curTempSnap[k] !== null).map(
    (k) => FIVE_MODEL_META[k].label
  );

  const tempSpreadC = spreadOf(curTempSnap);
  const pressureSpreadHpa = spreadOf(curPressSnap);
  const confidencePct =
    activeModels.length >= 2
      ? computeHybridConfidence(tempSpreadC, pressureSpreadHpa)
      : 82;

  const rawCurTemp = Number(cur.temperature_2m ?? hourly[0]?.temperature ?? 0);
  const hybridCurTemp = Number(
    blendHybridParameter(curTempSnap, weights.temperature, rawCurTemp).toFixed(1)
  );
  const rawCurDew = Number(cur.dew_point_2m ?? hourly[0]?.dewPoint ?? 0);
  const hybridCurDew = Math.min(
    hybridCurTemp,
    Number(blendHybridParameter(curDewSnap, weights.temperature, rawCurDew).toFixed(1))
  );
  const hybridCurRh = Math.round(
    relativeHumidityFromDewPoint(hybridCurTemp, hybridCurDew)
  );
  const rawCurApparent = Number(cur.apparent_temperature ?? rawCurTemp);
  const hybridCurApparent = Number(
    (rawCurApparent + (hybridCurTemp - rawCurTemp)).toFixed(1)
  );

  const rawCurPress = Number(cur.pressure_msl ?? hourly[0]?.pressure ?? 1013);
  const pNow = Number(
    blendHybridParameter(curPressSnap, weights.pressure, rawCurPress).toFixed(1)
  );

  const rawCurWind = Number(cur.wind_speed_10m ?? hourly[0]?.windSpeed ?? 0);
  const hybridCurWind = Number(
    Math.max(0, blendHybridParameter(curWindSnap, weights.wind, rawCurWind)).toFixed(1)
  );
  const rawCurGust = Number(cur.wind_gusts_10m ?? hybridCurWind);
  const hybridCurGust = Number(
    Math.max(
      hybridCurWind,
      blendHybridParameter(curGustSnap, gustWeights, rawCurGust)
    ).toFixed(1)
  );
  const hybridCurDir = blendWindDirectionDeg(
    curDirSnap,
    weights.wind,
    Number(cur.wind_direction_10m ?? 0)
  );
  const rawCurPrecip = Number(cur.precipitation ?? 0);
  const hybridCurPrecip = Number(
    Math.max(
      0,
      blendHybridParameter(curPrecipSnap, weights.precipitation, rawCurPrecip)
    ).toFixed(2)
  );
  const curPrecipConsensus = computePrecipConsensus(curPrecipSnap);

  // 3 saatlik gerçek barometrik eğilim (UTC geçmiş saatlerden MSLP üzerinden)
  const pPrevUtcDate = new Date(
    localIsoToUtcDate(times[startIdx] ?? "", utcOffsetSeconds).getTime() - 3 * 3600000
  );
  const prevUtcKey = pPrevUtcDate.toISOString().slice(0, 16);
  const prevPressSnap = readFiveModelSnapshot("pressure_msl", prevUtcKey);
  const pPrevIdx = Math.max(0, startIdx - 3);
  const pPrev = blendHybridParameter(
    prevPressSnap,
    weights.pressure,
    Number(hourlyRaw.pressure_msl?.[pPrevIdx] ?? pNow)
  );
  const pressureDelta3h = Number((pNow - pPrev).toFixed(1));

  const dailyDates: string[] = dailyRaw.time ?? [];
  const daily: DailyPoint[] = dailyDates.slice(0, 7).map((dateStr, idx) => {
    const code = Number(dailyRaw.weather_code?.[idx] ?? 0);
    return {
      date: dateStr,
      dayName: formatDayName(dateStr, idx),
      tempMax: Math.round(Number(dailyRaw.temperature_2m_max?.[idx] ?? 0)),
      tempMin: Math.round(Number(dailyRaw.temperature_2m_min?.[idx] ?? 0)),
      weatherCode: code,
      condition: mapWmoCodeToLabel(code),
      precipSum: Number(Number(dailyRaw.precipitation_sum?.[idx] ?? 0).toFixed(1)),
      precipProbabilityMax: Math.round(
        Number(dailyRaw.precipitation_probability_max?.[idx] ?? 0)
      ),
      windSpeedMax: Math.round(Number(dailyRaw.wind_speed_10m_max?.[idx] ?? 0)),
      uvIndexMax: Number(Number(dailyRaw.uv_index_max?.[idx] ?? 0).toFixed(1)),
      sunrise: String(dailyRaw.sunrise?.[idx] ?? ""),
      sunset: String(dailyRaw.sunset?.[idx] ?? "")
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

  const curWmo = Number(cur.weather_code ?? 0);
  const curRain = Number(cur.rain ?? 0);
  const curSnow = Number(cur.snowfall ?? 0);
  const firstHour = hourly[0];
  const curSolarElev = Number(
    computeSolarElevationDeg(location.lat, location.lon, new Date()).toFixed(1)
  );
  const curUv = firstHour?.uvIndex ?? 0;

  const isLiveVerified = verification.mode === "live-metar-24h";
  const attributions: HybridSourceAttribution[] = [
    {
      parameter: "2m Sıcaklık & Çiy Noktası",
      primaryEngine: topModelLabel(weights.temperature),
      weightsLabel: formatWeightsLabel(weights.temperature),
      standardRef: isLiveVerified
        ? `Canlı 24s METAR (${verification.station?.icaoId}) Ters-RMSE² + Bolton (1980)`
        : "WMO LC-DNV + ECMWF AIFS/IFS Skor Kartı + Bolton (1980)",
      reason:
        "5 Tier-1 model canlı istasyon hatasına göre ağırlıklandırılır; bağıl nem Bolton Eq.10 ile fiziksel tutarlılığa çekilir."
    },
    {
      parameter: "Deniz Seviyesi Basıncı (MSLP)",
      primaryEngine: topModelLabel(weights.pressure),
      weightsLabel: formatWeightsLabel(weights.pressure),
      standardRef: isLiveVerified
        ? `Canlı 24s METAR QNH Doğrulaması + WMO FM-12 Eğilim`
        : "WMO LC-DNV MSLP + WMO FM-12 Barometrik Eğilim",
      reason:
        "Rakım düzeltmeli deniz seviyesi basıncı ve resmi WMO 3 saatlik cephe/siklon eğilim eşikleri."
    },
    {
      parameter: "Yağış & Sağanak Uzlaşısı",
      primaryEngine: topModelLabel(weights.precipitation),
      weightsLabel: formatWeightsLabel(weights.precipitation),
      standardRef: "DWD ICON-EU 7km + ECMWF 9km HRES + 5-Model Uzlaşısı",
      reason:
        "Yüksek çözünürlüklü 7–10 km modeller orografik yağışı çözer; tek sayı yerine 5 modelin uzlaşı oranı (X/5) verilir."
    },
    {
      parameter: "10m Rüzgar, Hamle & Yön",
      primaryEngine: topModelLabel(weights.wind),
      weightsLabel: formatWeightsLabel(weights.wind),
      standardRef: "Vektörel Yön Ortalaması + 4 Fiziksel Hamle Modeli + WMO Beaufort",
      reason:
        "Yön skaler değil vektör ortalamasıyla birleştirilir; hamle üretmeyen AIFS hamle hesabından hariç tutulur."
    },
    {
      parameter: "Hava Kalitesi (EAQI)",
      primaryEngine: "Copernicus CAMS (10 km)",
      weightsLabel: "%100 CAMS Avrupa + EEA Baskın Kirletici",
      standardRef: "Resmi EEA 6 Bantlı EAQI Saatlik Eşik Tablosu",
      reason:
        "PM2.5, PM10, O₃, NO₂ ve SO₂ saatlik eşiklerinden indeksi tetikleyen baskın kirletici doğrudan hesaplanır."
    },
    {
      parameter: "Dikey Sondaj (1000–300 hPa)",
      primaryEngine: "Open-Meteo Pressure Levels + GPH",
      weightsLabel: "Dinamik Jeopotansiyel İrtifa + Bolton (1980) Eq.39",
      standardRef: "Bolton (1980) θe (<0.2K) · NOAA EoT Güneş (<0.01°)",
      reason:
        "Sabit irtifa yerine gerçek jeopotansiyel yükseklikle 700–500 lapse rate ve 500–1000 hPa kalınlık (dam) hesaplanır."
    }
  ];

  const hybrid: HybridMeta = {
    activeModels: activeModels.length > 0 ? activeModels : ["Open-Meteo NWP"],
    confidencePct,
    tempSpreadC,
    pressureSpreadHpa,
    currentBreakdown: {
      temperature: curTempSnap,
      pressure: curPressSnap,
      windSpeed: curWindSnap,
      temp850hPa: curT850Snap,
      precipitation: curPrecipSnap
    },
    verification,
    attributions
  };

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
      cloudCover: Math.round(Number(cur.cloud_cover ?? 0)),
      visibilityKm: firstHour?.visibilityKm ?? 15,
      uvIndex: curUv,
      uvLabel: classifyUvIndex(curUv),
      precipitation: hybridCurPrecip,
      precipProbability: firstHour?.precipProbability ?? 0,
      precipConsensus: curPrecipConsensus,
      precipType: mapWmoToPrecipType(curWmo, Math.max(curRain, hybridCurPrecip), curSnow),
      weatherCode: curWmo,
      condition: mapWmoCodeToLabel(curWmo),
      isStorm: hybridCurWind >= 50 || curWmo >= 95 || curWmo === 65 || curWmo === 82,
      isDay: Number(cur.is_day ?? (curSolarElev > 0 ? 1 : 0)) === 1,
      solarElevationDeg: curSolarElev,
      daylight: solarElevationToDaylight(curSolarElev),
      sunrise: daily[0]?.sunrise ?? "",
      sunset: daily[0]?.sunset ?? "",
      temp850hPa: firstHour?.temp850hPa ?? null
    },
    airQuality,
    hourly,
    daily,
    sounding: hourlySoundings[0] ?? [],
    hourlySoundings,
    nativeConvective: {
      cape: firstHour?.cape ?? null,
      cin: firstHour?.cin ?? null,
      liftedIndex: firstHour?.liftedIndex ?? null,
      freezingLevelM: firstHour?.freezingLevelM ?? null
    },
    hybrid
  };

  weatherCache.set(key, { value: bundle, expiresAt: Date.now() + WEATHER_TTL_MS });
  return bundle;
}

/**
 * Gerçek 5-Model Çoklu Sayısal Tahmin (NWP) Karşılaştırması (72 saat):
 * ECMWF IFS 9km · ECMWF AIFS v1 · DWD ICON-EU · UKMO 10km · NOAA GFS
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
    "ecmwf_ifs,ecmwf_aifs025_single,icon_seamless,ukmo_seamless,gfs_seamless,ecmwf_ifs025"
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
        gfs: toFiniteNum(h[`${prefix}_gfs_seamless`]?.[i])
      });
    }
    return out;
  };

  const temp2m = buildSeries("temperature_2m");
  const temp850 = buildSeries("temperature_850hPa", true);
  const precip = buildSeries("precipitation");
  const wind10m = buildSeries("wind_speed_10m");

  const sumOf = (arr: ModelSeriesPoint[], field: FiveModelKey) =>
    Number(arr.reduce((acc, p) => acc + (p[field] ?? 0), 0).toFixed(1));

  const minOf = (arr: ModelSeriesPoint[], field: FiveModelKey) => {
    const vals = arr
      .map((p) => p[field])
      .filter((v): v is number => v !== null);
    return vals.length > 0 ? Math.min(...vals) : null;
  };

  let maxSpreadTemp2m = 0;
  for (const pt of temp2m) {
    const vals = FIVE_MODEL_KEYS.map((k) => pt[k]).filter(
      (v): v is number => v !== null
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
        gfs: sumOf(precip, "gfs")
      },
      maxSpreadTemp2m,
      min850hPa: {
        ecmwfIfs: minOf(temp850, "ecmwfIfs"),
        ecmwfAifs: minOf(temp850, "ecmwfAifs"),
        icon: minOf(temp850, "icon"),
        ukmo: minOf(temp850, "ukmo"),
        gfs: minOf(temp850, "gfs")
      }
    }
  };

  modelCache.set(key, { value: bundle, expiresAt: Date.now() + MODEL_TTL_MS });
  return bundle;
}

/**
 * Gerçek RainViewer küresel canlı yağış radarı katman bilgisi
 */
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

export { WMO_PRIOR_WEIGHTS };
