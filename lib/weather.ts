import { dewPointMagnus } from "./thermo-cape";
import type {
  AirQualityDetail,
  DailyPoint,
  GeoLocation,
  HourlyPoint,
  HybridMeta,
  HybridModelSnapshot,
  ModelSeriesPoint,
  MultiModelBundle,
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
 * Gerçek astronomik güneş yükselme açısı (derece, -90..+90)
 * Enlem, boylam ve UTC tarihinden NOAA yaklaşık deklinasyon & saat açısı ile hesaplanır.
 */
export function computeSolarElevationDeg(
  lat: number,
  lon: number,
  dateUtc: Date
): number {
  const startOfYear = Date.UTC(dateUtc.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((dateUtc.getTime() - startOfYear) / 86400000);
  const utcHours =
    dateUtc.getUTCHours() +
    dateUtc.getUTCMinutes() / 60 +
    dateUtc.getUTCSeconds() / 3600;

  // Güneş deklinasyonu (radyan)
  const declDeg =
    23.44 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));
  const declRad = (declDeg * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;

  // Yerel güneş saati
  const solarTimeHours = (utcHours + lon / 15 + 24) % 24;
  const hourAngleDeg = (solarTimeHours - 12) * 15;
  const hourAngleRad = (hourAngleDeg * Math.PI) / 180;

  const sinElev =
    Math.sin(latRad) * Math.sin(declRad) +
    Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourAngleRad);

  return (Math.asin(Math.max(-1, Math.min(1, sinElev))) * 180) / Math.PI;
}

export function solarElevationToDaylight(elevDeg: number): number {
  // -6° (sivil alacakaranlık) -> 0, +35°+ (tam gün ışığı) -> 1
  if (elevDeg <= -8) return 0;
  if (elevDeg >= 35) return 1;
  return Number(((elevDeg + 8) / 43).toFixed(3));
}

export function computeSubsolarPoint(dateUtc: Date): { lat: number; lon: number } {
  const startOfYear = Date.UTC(dateUtc.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((dateUtc.getTime() - startOfYear) / 86400000);
  const utcHours =
    dateUtc.getUTCHours() + dateUtc.getUTCMinutes() / 60;
  const lat = 23.44 * Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81));
  let lon = (12 - utcHours) * 15;
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
  return { categoryIndex: 6, label: "Tehlikeli" };
}

export function classifyPressureTrend(delta3h: number): PressureTrend {
  if (delta3h >= 1.2) return "yükseliyor";
  if (delta3h <= -1.2) return "düşüyor";
  return "sabit";
}

export function windDirectionToCompass(deg: number): string {
  const dirs = ["K", "KD", "D", "GD", "G", "GB", "B", "KB"];
  const normalized = ((deg % 360) + 360) % 360;
  return dirs[Math.round(normalized / 45) % 8];
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
}

const PRESSURE_LEVEL_META: Array<{ hpa: number; altM: number }> = [
  { hpa: 1000, altM: 110 },
  { hpa: 925, altM: 760 },
  { hpa: 850, altM: 1500 },
  { hpa: 700, altM: 3050 },
  { hpa: 500, altM: 5600 },
  { hpa: 400, altM: 7300 },
  { hpa: 300, altM: 9200 }
];

function localIsoToUtcDate(localIso: string, utcOffsetSeconds: number): Date {
  // Open-Meteo local time string "YYYY-MM-DDTHH:MM" -> UTC ms
  const msAsUtc = Date.parse(`${localIso}:00Z`);
  if (!Number.isFinite(msAsUtc)) return new Date();
  return new Date(msAsUtc - utcOffsetSeconds * 1000);
}

/**
 * Parametre bazlı ağırlıklı çoklu-model hibrit birleştirme.
 * Herhangi bir model o saat için null dönerse kalan gerçek modeller arasında ağırlıklar otomatik normalize edilir.
 */
export function blendHybridParameter(
  snapshot: HybridModelSnapshot,
  weights: { ecmwf: number; icon: number; gfs: number },
  fallback: number
): number {
  let num = 0;
  let den = 0;
  if (snapshot.ecmwf !== null && Number.isFinite(snapshot.ecmwf)) {
    num += snapshot.ecmwf * weights.ecmwf;
    den += weights.ecmwf;
  }
  if (snapshot.icon !== null && Number.isFinite(snapshot.icon)) {
    num += snapshot.icon * weights.icon;
    den += weights.icon;
  }
  if (snapshot.gfs !== null && Number.isFinite(snapshot.gfs)) {
    num += snapshot.gfs * weights.gfs;
    den += weights.gfs;
  }
  if (den <= 0) return fallback;
  return num / den;
}

export function computeHybridConfidence(
  tempSpreadC: number,
  pressureSpreadHpa: number
): number {
  // 0.5°C altı sapma ve 0.6 hPa altı basınç farkı => ~98-100% yüksek model uzlaşısı
  const tempPenalty = Math.max(0, tempSpreadC - 0.5) * 6.5;
  const pressPenalty = Math.max(0, pressureSpreadHpa - 0.6) * 4.5;
  return Math.round(Math.max(45, Math.min(99, 99 - tempPenalty - pressPenalty)));
}

const HYBRID_WEIGHTS = {
  temperature: { ecmwf: 0.5, icon: 0.3, gfs: 0.2 },
  pressure: { ecmwf: 0.55, icon: 0.25, gfs: 0.2 },
  precipitation: { ecmwf: 0.4, icon: 0.45, gfs: 0.15 },
  wind: { ecmwf: 0.35, icon: 0.45, gfs: 0.2 }
} as const;

const HYBRID_ATTRIBUTIONS = [
  {
    parameter: "Sıcaklık & 850 hPa",
    primaryEngine: "ECMWF IFS 0.25°",
    weightsLabel: "%50 ECMWF · %30 ICON · %20 GFS",
    reason: "WMO küresel doğrulama lideri ECMWF ana omurga, ICON-EU ve GFS ile dengelenir."
  },
  {
    parameter: "Deniz Seviyesi Basıncı",
    primaryEngine: "ECMWF IFS 0.25°",
    weightsLabel: "%55 ECMWF · %25 ICON · %20 GFS",
    reason: "Sinoptik basınç alanları ve cephe geçişlerinde ECMWF en düşük hata payını verir."
  },
  {
    parameter: "Yağış & Sağanak",
    primaryEngine: "DWD ICON-EU (7 km)",
    weightsLabel: "%45 ICON-EU · %40 ECMWF · %15 GFS",
    reason: "7 km yüksek çözünürlüklü ICON-EU dağ/kıyı orografik yağışlarını çok daha keskin yakalar."
  },
  {
    parameter: "10m Rüzgar & Hamle",
    primaryEngine: "DWD ICON-EU (7 km)",
    weightsLabel: "%45 ICON-EU · %35 ECMWF · %20 GFS",
    reason: "Bölgesel lodos, poyraz ve boğaz rüzgar koridorları yüksek çözünürlüklü grid ile çözülür."
  },
  {
    parameter: "Hava Kalitesi (EAQI)",
    primaryEngine: "Copernicus CAMS (10 km)",
    weightsLabel: "%100 CAMS Avrupa",
    reason: "Avrupa referans atmosfer kimyası modeli: PM2.5, PM10, O₃, NO₂, SO₂ ve çöl tozu."
  },
  {
    parameter: "Dikey Sondaj (1000–300 hPa)",
    primaryEngine: "Open-Meteo Pressure Levels",
    weightsLabel: "7 Basınç Katmanı + CAPE Çözücü",
    reason: "Anlık 48 saatlik radyosonda, Skew-T Log-P, 0–6 km rüzgar kırılması ve 0°C donma seviyesi."
  }
];

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
  const vals = [snap.ecmwf, snap.icon, snap.gfs].filter(
    (v): v is number => v !== null && Number.isFinite(v)
  );
  if (vals.length < 2) return 0;
  return Number((Math.max(...vals) - Math.min(...vals)).toFixed(1));
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

  const pressureVars = PRESSURE_LEVEL_META.flatMap(({ hpa }) => [
    `temperature_${hpa}hPa`,
    `relative_humidity_${hpa}hPa`,
    `wind_speed_${hpa}hPa`,
    `wind_direction_${hpa}hPa`
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

  const hybridUrl = new URL("https://api.open-meteo.com/v1/forecast");
  hybridUrl.searchParams.set("latitude", location.lat.toFixed(4));
  hybridUrl.searchParams.set("longitude", location.lon.toFixed(4));
  hybridUrl.searchParams.set("timezone", "auto");
  hybridUrl.searchParams.set("forecast_days", "3");
  hybridUrl.searchParams.set("models", "ecmwf_ifs025,icon_seamless,gfs_seamless");
  hybridUrl.searchParams.set(
    "hourly",
    "temperature_2m,precipitation,wind_speed_10m,wind_gusts_10m,pressure_msl,temperature_850hPa"
  );

  const aqiUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  aqiUrl.searchParams.set("latitude", location.lat.toFixed(4));
  aqiUrl.searchParams.set("longitude", location.lon.toFixed(4));
  aqiUrl.searchParams.set(
    "current",
    "european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,dust"
  );
  aqiUrl.searchParams.set("timezone", "auto");

  const [forecastRes, hybridRes, aqiRes] = await Promise.all([
    fetchWithRetry(forecastUrl.toString(), 11000, 1),
    fetchWithRetry(hybridUrl.toString(), 9000, 1).catch(() => null),
    fetchWithRetry(aqiUrl.toString(), 8000, 1).catch(() => null)
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

  // Çoklu model saat dizinini zaman damgasına göre eşleştir
  const hybridHourly = hJson?.hourly ?? null;
  const hybridTimeIndex = new Map<string, number>();
  if (hybridHourly && Array.isArray(hybridHourly.time)) {
    (hybridHourly.time as string[]).forEach((t, idx) => {
      hybridTimeIndex.set(t, idx);
    });
  }

  const readHybridSnapshot = (
    prefix: string,
    timeStr: string
  ): HybridModelSnapshot => {
    const hIdx = hybridTimeIndex.get(timeStr);
    if (hIdx === undefined || !hybridHourly) {
      return { ecmwf: null, icon: null, gfs: null };
    }
    return {
      ecmwf: toFiniteNum(hybridHourly[`${prefix}_ecmwf_ifs025`]?.[hIdx]),
      icon: toFiniteNum(hybridHourly[`${prefix}_icon_seamless`]?.[hIdx]),
      gfs: toFiniteNum(hybridHourly[`${prefix}_gfs_seamless`]?.[hIdx])
    };
  };

  const currentIsoPrefix = String(cur.time ?? "").slice(0, 13);
  let startIdx = times.findIndex((t) => t.startsWith(currentIsoPrefix));
  if (startIdx < 0) startIdx = 0;

  const buildSoundingAtIndex = (idx: number): SoundingLevel[] => {
    const sfcTemp = Number(hourlyRaw.temperature_2m?.[idx] ?? cur.temperature_2m ?? 15);
    const sfcRh = Number(hourlyRaw.relative_humidity_2m?.[idx] ?? cur.relative_humidity_2m ?? 60);
    return PRESSURE_LEVEL_META.map(({ hpa, altM }) => {
      const rawT = hourlyRaw[`temperature_${hpa}hPa`]?.[idx];
      const rawRh = hourlyRaw[`relative_humidity_${hpa}hPa`]?.[idx];
      const rawWs = hourlyRaw[`wind_speed_${hpa}hPa`]?.[idx];
      const rawWd = hourlyRaw[`wind_direction_${hpa}hPa`]?.[idx];

      const fallbackT = sfcTemp - (altM / 1000) * 6.5;
      const temp = typeof rawT === "number" && Number.isFinite(rawT) ? rawT : fallbackT;
      const rh =
        typeof rawRh === "number" && Number.isFinite(rawRh)
          ? Math.max(1, Math.min(100, rawRh))
          : Math.max(15, sfcRh - altM / 220);
      const dp = dewPointMagnus(temp, rh);

      return {
        pressure: hpa,
        altitudeM: altM,
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
    const solarElevationDeg = Number(
      computeSolarElevationDeg(location.lat, location.lon, utcDate).toFixed(1)
    );
    const daylight = solarElevationToDaylight(solarElevationDeg);

    // Çoklu model hibrit sentez (her değişken en yüksek doğruluklu model ağırlıklarıyla)
    const rawTemp = Number(hourlyRaw.temperature_2m?.[i] ?? cur.temperature_2m ?? 0);
    const rawPress = Number(hourlyRaw.pressure_msl?.[i] ?? 1013);
    const rawPrecip = Number(hourlyRaw.precipitation?.[i] ?? 0);
    const rawWind = Number(hourlyRaw.wind_speed_10m?.[i] ?? 0);
    const rawGust = Number(hourlyRaw.wind_gusts_10m?.[i] ?? rawWind);
    const rawT850 = hourlyRaw["temperature_850hPa"]?.[i];

    const tempSnap = readHybridSnapshot("temperature_2m", timeStr);
    const pressSnap = readHybridSnapshot("pressure_msl", timeStr);
    const precipSnap = readHybridSnapshot("precipitation", timeStr);
    const windSnap = readHybridSnapshot("wind_speed_10m", timeStr);
    const gustSnap = readHybridSnapshot("wind_gusts_10m", timeStr);
    const t850Snap = readHybridSnapshot("temperature_850hPa", timeStr);

    const temperature = Number(
      blendHybridParameter(tempSnap, HYBRID_WEIGHTS.temperature, rawTemp).toFixed(1)
    );
    const pressure = Number(
      blendHybridParameter(pressSnap, HYBRID_WEIGHTS.pressure, rawPress).toFixed(1)
    );
    const precipitation = Number(
      Math.max(
        0,
        blendHybridParameter(precipSnap, HYBRID_WEIGHTS.precipitation, rawPrecip)
      ).toFixed(2)
    );
    const windSpeed = Number(
      Math.max(0, blendHybridParameter(windSnap, HYBRID_WEIGHTS.wind, rawWind)).toFixed(1)
    );
    const windGusts = Number(
      Math.max(
        windSpeed,
        blendHybridParameter(gustSnap, HYBRID_WEIGHTS.wind, rawGust)
      ).toFixed(1)
    );

    const hasT850 =
      t850Snap.ecmwf !== null ||
      t850Snap.icon !== null ||
      t850Snap.gfs !== null ||
      (typeof rawT850 === "number" && Number.isFinite(rawT850));
    const temp850hPa = hasT850
      ? Number(
          blendHybridParameter(
            t850Snap,
            HYBRID_WEIGHTS.temperature,
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

    // Hissedilen sıcaklığı hibrit sıcaklık deltasını koruyarak ayarla
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
      humidity: Math.round(Number(hourlyRaw.relative_humidity_2m?.[i] ?? 0)),
      dewPoint: Number(hourlyRaw.dew_point_2m?.[i] ?? 0),
      pressure,
      windSpeed,
      windGusts,
      windDirection: Math.round(Number(hourlyRaw.wind_direction_10m?.[i] ?? 0)),
      cloudCover: Math.round(Number(hourlyRaw.cloud_cover?.[i] ?? 0)),
      visibilityKm: Number((Number(hourlyRaw.visibility?.[i] ?? 15000) / 1000).toFixed(1)),
      uvIndex: Number(hourlyRaw.uv_index?.[i] ?? 0),
      precipitation,
      precipProbability: Math.round(Number(hourlyRaw.precipitation_probability?.[i] ?? 0)),
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

  // Güncel saat için çoklu-model özet & gerçek uzlaşı skoru
  const curTimeSlot = times[startIdx] ?? "";
  const curTempSnap = readHybridSnapshot("temperature_2m", curTimeSlot);
  const curPressSnap = readHybridSnapshot("pressure_msl", curTimeSlot);
  const curWindSnap = readHybridSnapshot("wind_speed_10m", curTimeSlot);
  const curGustSnap = readHybridSnapshot("wind_gusts_10m", curTimeSlot);
  const curT850Snap = readHybridSnapshot("temperature_850hPa", curTimeSlot);
  const curPrecipSnap = readHybridSnapshot("precipitation", curTimeSlot);

  const activeModels: string[] = [];
  if (curTempSnap.ecmwf !== null) activeModels.push("ECMWF IFS 0.25°");
  if (curTempSnap.icon !== null) activeModels.push("DWD ICON-EU 7km");
  if (curTempSnap.gfs !== null) activeModels.push("NOAA GFS");

  const tempSpreadC = spreadOf(curTempSnap);
  const pressureSpreadHpa = spreadOf(curPressSnap);
  const confidencePct =
    activeModels.length >= 2
      ? computeHybridConfidence(tempSpreadC, pressureSpreadHpa)
      : 82;

  // Anlık değerleri en doğru model ağırlıklarıyla sentezle
  const rawCurTemp = Number(cur.temperature_2m ?? hourly[0]?.temperature ?? 0);
  const hybridCurTemp = Number(
    blendHybridParameter(curTempSnap, HYBRID_WEIGHTS.temperature, rawCurTemp).toFixed(1)
  );
  const rawCurApparent = Number(cur.apparent_temperature ?? rawCurTemp);
  const hybridCurApparent = Number(
    (rawCurApparent + (hybridCurTemp - rawCurTemp)).toFixed(1)
  );

  const rawCurPress = Number(cur.pressure_msl ?? hourly[0]?.pressure ?? 1013);
  const pNow = Number(
    blendHybridParameter(curPressSnap, HYBRID_WEIGHTS.pressure, rawCurPress).toFixed(1)
  );

  const rawCurWind = Number(cur.wind_speed_10m ?? hourly[0]?.windSpeed ?? 0);
  const hybridCurWind = Number(
    Math.max(0, blendHybridParameter(curWindSnap, HYBRID_WEIGHTS.wind, rawCurWind)).toFixed(1)
  );
  const rawCurGust = Number(cur.wind_gusts_10m ?? hybridCurWind);
  const hybridCurGust = Number(
    Math.max(
      hybridCurWind,
      blendHybridParameter(curGustSnap, HYBRID_WEIGHTS.wind, rawCurGust)
    ).toFixed(1)
  );
  const rawCurPrecip = Number(cur.precipitation ?? 0);
  const hybridCurPrecip = Number(
    Math.max(
      0,
      blendHybridParameter(curPrecipSnap, HYBRID_WEIGHTS.precipitation, rawCurPrecip)
    ).toFixed(2)
  );

  // 3 saatlik gerçek barometrik eğilim (MSL basıncı üzerinden)
  const pPrevIdx = Math.max(0, startIdx - 3);
  const prevTimeSlot = times[pPrevIdx] ?? "";
  const prevPressSnap = readHybridSnapshot("pressure_msl", prevTimeSlot);
  const pPrev =
    startIdx >= 3
      ? blendHybridParameter(
          prevPressSnap,
          HYBRID_WEIGHTS.pressure,
          Number(hourlyRaw.pressure_msl?.[pPrevIdx] ?? pNow)
        )
      : pNow;
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
  const airQuality: AirQualityDetail = {
    europeanAqi: euAqi,
    categoryIndex: aqiMeta.categoryIndex,
    label: aqiMeta.label,
    pm25: Number(Number(aqiCur.pm2_5 ?? 0).toFixed(1)),
    pm10: Number(Number(aqiCur.pm10 ?? 0).toFixed(1)),
    ozone: Math.round(Number(aqiCur.ozone ?? 0)),
    no2: Number(Number(aqiCur.nitrogen_dioxide ?? 0).toFixed(1)),
    so2: Number(Number(aqiCur.sulphur_dioxide ?? 0).toFixed(1)),
    dust: Math.round(Number(aqiCur.dust ?? 0))
  };

  const curWmo = Number(cur.weather_code ?? 0);
  const curRain = Number(cur.rain ?? 0);
  const curSnow = Number(cur.snowfall ?? 0);
  const firstHour = hourly[0];
  const curSolarElev = Number(
    computeSolarElevationDeg(location.lat, location.lon, new Date()).toFixed(1)
  );

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
    attributions: HYBRID_ATTRIBUTIONS
  };

  const bundle: WeatherBundle = {
    location: {
      ...location,
      elevation: Math.round(Number(fJson.elevation ?? location.elevation ?? 0)),
      timezone: String(fJson.timezone ?? location.timezone ?? "UTC")
    },
    source: activeModels.length >= 2 ? "hybrid-nwp" : "open-meteo",
    fetchedAt: new Date().toISOString(),
    timezone: String(fJson.timezone ?? "UTC"),
    utcOffsetSeconds,
    current: {
      time: String(cur.time ?? new Date().toISOString()),
      temperature: hybridCurTemp,
      apparentTemperature: hybridCurApparent,
      humidity: Math.round(Number(cur.relative_humidity_2m ?? firstHour?.humidity ?? 0)),
      dewPoint: Number(cur.dew_point_2m ?? firstHour?.dewPoint ?? 0),
      pressure: pNow,
      pressureDelta3h,
      pressureTrend: classifyPressureTrend(pressureDelta3h),
      windSpeed: hybridCurWind,
      windGusts: hybridCurGust,
      windDirection: Math.round(Number(cur.wind_direction_10m ?? 0)),
      cloudCover: Math.round(Number(cur.cloud_cover ?? 0)),
      visibilityKm: firstHour?.visibilityKm ?? 15,
      uvIndex: firstHour?.uvIndex ?? 0,
      precipitation: hybridCurPrecip,
      precipProbability: firstHour?.precipProbability ?? 0,
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
 * Gerçek çoklu sayısal hava tahmini (NWP) model karşılaştırması:
 * ECMWF IFS 0.25° · NOAA GFS · DWD ICON
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
  url.searchParams.set("models", "ecmwf_ifs025,gfs_seamless,icon_seamless");
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
  const toNum = (v: unknown): number | null =>
    typeof v === "number" && Number.isFinite(v) ? Number(v.toFixed(1)) : null;

  const buildSeries = (prefix: string): ModelSeriesPoint[] => {
    const out: ModelSeriesPoint[] = [];
    for (let i = startIdx; i < endIdx; i++) {
      const t = times[i];
      const dayIdx = Math.floor((i - startIdx) / 24);
      out.push({
        time: t,
        hourLabel: t.slice(11, 16),
        dayLabel: dayIdx === 0 ? "Bugün" : dayIdx === 1 ? "Yarın" : `+${dayIdx}g`,
        ecmwf: toNum(h[`${prefix}_ecmwf_ifs025`]?.[i]),
        gfs: toNum(h[`${prefix}_gfs_seamless`]?.[i]),
        icon: toNum(h[`${prefix}_icon_seamless`]?.[i])
      });
    }
    return out;
  };

  const temp2m = buildSeries("temperature_2m");
  const temp850 = buildSeries("temperature_850hPa");
  const precip = buildSeries("precipitation");
  const wind10m = buildSeries("wind_speed_10m");

  const sumOf = (arr: ModelSeriesPoint[], field: "ecmwf" | "gfs" | "icon") =>
    Number(
      arr.reduce((acc, p) => acc + (p[field] ?? 0), 0).toFixed(1)
    );

  const minOf = (arr: ModelSeriesPoint[], field: "ecmwf" | "gfs" | "icon") => {
    const vals = arr
      .map((p) => p[field])
      .filter((v): v is number => v !== null);
    return vals.length > 0 ? Math.min(...vals) : null;
  };

  let maxSpreadTemp2m = 0;
  for (const pt of temp2m) {
    const vals = [pt.ecmwf, pt.gfs, pt.icon].filter((v): v is number => v !== null);
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
        ecmwf: sumOf(precip, "ecmwf"),
        gfs: sumOf(precip, "gfs"),
        icon: sumOf(precip, "icon")
      },
      maxSpreadTemp2m,
      min850hPa: {
        ecmwf: minOf(temp850, "ecmwf"),
        gfs: minOf(temp850, "gfs"),
        icon: minOf(temp850, "icon")
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

  const res = await fetch("https://api.rainviewer.com/public/weather-maps.json", {
    cache: "no-store",
    signal: AbortSignal.timeout(8000)
  });

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
