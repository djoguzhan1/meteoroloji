import { dewPointMagnus, STANDARD_PRESSURE_LEVELS } from "./thermo-cape";
import type {
  AirQualityDetail,
  DailyPoint,
  GeoLocation,
  HourlyPoint,
  PrecipType,
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
    id: "tokyo-jp",
    name: "Tokyo",
    admin1: "Tokyo",
    country: "Japonya",
    countryCode: "JP",
    lat: 35.6762,
    lon: 139.6503,
    elevation: 44,
    timezone: "Asia/Tokyo"
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
    id: "cairo-eg",
    name: "Kahire",
    country: "Mısır",
    countryCode: "EG",
    lat: 30.0444,
    lon: 31.2357,
    timezone: "Africa/Cairo"
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

export function mapWmoCodeToLabel(code: number): string {
  if (code === 0) return "Açık / Güneşli";
  if (code === 1) return "Az Bulutlu";
  if (code === 2) return "Parçalı Bulutlu";
  if (code === 3) return "Çok Bulutlu";
  if (code === 45 || code === 48) return "Sisli / Puslu";
  if (code >= 51 && code <= 57) return "Çiseleyen Yağmur";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return "Yağmurlu";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "Karlı";
  if (code >= 95) return "Gök Gürültülü Fırtına";
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

export function computeDaylightFactor(hourLocal: number): number {
  if (hourLocal <= 6 || hourLocal >= 18) return 0;
  const t = (hourLocal - 6) / 12;
  return Math.sin(t * Math.PI);
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

// 5 dakikalık sunucu bellek önbelleği
type CacheEntry<T> = { value: T; expiresAt: number };
const weatherCache = new Map<string, CacheEntry<WeatherBundle>>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export function clearWeatherCache(): void {
  weatherCache.clear();
}

export function buildDemoBundle(location: GeoLocation = DEFAULT_LOCATION): WeatherBundle {
  const now = new Date();
  const hourly: HourlyPoint[] = [];
  let rainAccum = 0;
  let snowAccum = 0;

  for (let i = 0; i < 48; i++) {
    const d = new Date(now.getTime() + i * 3600 * 1000);
    const h = d.getHours();
    const daylight = computeDaylightFactor(h);
    const stormPhase = i >= 6 && i <= 12;
    const temp = Number((11 + daylight * 9 - (stormPhase ? 3 : 0)).toFixed(1));
    const rh = stormPhase ? 84 : 58;
    const windSpeed = stormPhase ? 52 + (i % 4) * 4 : 16 + (i % 5) * 2;
    const precip = stormPhase ? 2.1 : 0;
    if (precip > 0) rainAccum += precip;
    const pad = (n: number) => n.toString().padStart(2, "0");

    hourly.push({
      time: d.toISOString(),
      hourLabel: `${pad(h)}:00`,
      dayLabel: i < 24 ? "Bugün" : "Yarın",
      temperature: temp,
      apparentTemperature: Number((temp - 1.2).toFixed(1)),
      humidity: rh,
      dewPoint: Number(dewPointMagnus(temp, rh).toFixed(1)),
      pressure: stormPhase ? 1006 : 1015,
      windSpeed,
      windGusts: windSpeed + 14,
      windDirection: (210 + i * 5) % 360,
      cloudCover: stormPhase ? 92 : 42,
      visibilityKm: stormPhase ? 6.5 : 16,
      uvIndex: Number((daylight * 6.5).toFixed(1)),
      precipitation: precip,
      precipProbability: stormPhase ? 85 : 15,
      precipType: stormPhase ? "rain" : "none",
      rainAccum: Number(rainAccum.toFixed(1)),
      snowAccum: Number(snowAccum.toFixed(1)),
      weatherCode: stormPhase ? 95 : 2,
      condition: stormPhase ? "Gök Gürültülü Fırtına" : "Parçalı Bulutlu",
      isStorm: stormPhase,
      daylight
    });
  }

  const daily: DailyPoint[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() + i * 86400 * 1000);
    const iso = d.toISOString().slice(0, 10);
    return {
      date: iso,
      dayName: formatDayName(iso, i),
      tempMax: 21 - (i % 3) * 2,
      tempMin: 10 - (i % 2),
      weatherCode: i === 1 ? 61 : i === 3 ? 95 : 2,
      condition: i === 1 ? "Yağmurlu" : i === 3 ? "Gök Gürültülü Fırtına" : "Parçalı Bulutlu",
      precipSum: i === 1 ? 6.4 : i === 3 ? 12.2 : 0.4,
      precipProbabilityMax: i === 1 ? 75 : i === 3 ? 90 : 20,
      windSpeedMax: i === 3 ? 54 : 24,
      uvIndexMax: 6.2,
      sunrise: `${iso}T06:52`,
      sunset: `${iso}T17:48`
    };
  });

  const first = hourly[0];
  return {
    location,
    source: "demo",
    fetchedAt: now.toISOString(),
    timezone: location.timezone ?? "Europe/Istanbul",
    utcOffsetSeconds: 10800,
    current: {
      time: first.time,
      temperature: first.temperature,
      apparentTemperature: first.apparentTemperature,
      humidity: first.humidity,
      dewPoint: first.dewPoint,
      pressure: first.pressure,
      windSpeed: first.windSpeed,
      windGusts: first.windGusts,
      windDirection: first.windDirection,
      cloudCover: first.cloudCover,
      visibilityKm: first.visibilityKm,
      uvIndex: first.uvIndex,
      precipitation: first.precipitation,
      precipProbability: first.precipProbability,
      precipType: first.precipType,
      weatherCode: first.weatherCode,
      condition: first.condition,
      isStorm: first.isStorm,
      isDay: first.daylight > 0.15,
      daylight: first.daylight,
      sunrise: daily[0].sunrise,
      sunset: daily[0].sunset
    },
    airQuality: {
      europeanAqi: 28,
      categoryIndex: 2,
      label: "Makul",
      pm25: 9.4,
      pm10: 16.2,
      ozone: 58,
      no2: 14.5,
      dust: 6
    },
    hourly,
    daily,
    sounding: STANDARD_PRESSURE_LEVELS,
    nativeConvective: {
      cape: 620,
      cin: -24,
      liftedIndex: -2.1,
      freezingLevelM: 2850
    }
  };
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

export async function fetchWeatherBundle(
  location: GeoLocation = DEFAULT_LOCATION
): Promise<WeatherBundle> {
  const key = `${location.lat.toFixed(2)},${location.lon.toFixed(2)}`;
  const cached = weatherCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return {
      ...cached.value,
      location: { ...cached.value.location, name: location.name || cached.value.location.name }
    };
  }

  try {
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
        "surface_pressure",
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
        "surface_pressure",
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

    const aqiUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
    aqiUrl.searchParams.set("latitude", location.lat.toFixed(4));
    aqiUrl.searchParams.set("longitude", location.lon.toFixed(4));
    aqiUrl.searchParams.set(
      "current",
      "european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,dust"
    );
    aqiUrl.searchParams.set("timezone", "auto");

    const [forecastRes, aqiRes] = await Promise.all([
      fetch(forecastUrl.toString(), { cache: "no-store", signal: AbortSignal.timeout(9000) }),
      fetch(aqiUrl.toString(), { cache: "no-store", signal: AbortSignal.timeout(7000) }).catch(
        () => null
      )
    ]);

    if (!forecastRes.ok) {
      return buildDemoBundle(location);
    }

    const fJson = await forecastRes.json();
    const aJson = aqiRes && aqiRes.ok ? await aqiRes.json() : null;

    const cur = fJson.current ?? {};
    const hourlyRaw = fJson.hourly ?? {};
    const dailyRaw = fJson.daily ?? {};
    const times: string[] = hourlyRaw.time ?? [];

    // Güncel saatin indeksini bul (Open-Meteo yerel saat string'i döndürür: YYYY-MM-DDTHH:MM)
    const currentIsoPrefix = String(cur.time ?? "").slice(0, 13);
    let startIdx = times.findIndex((t) => t.startsWith(currentIsoPrefix));
    if (startIdx < 0) startIdx = 0;

    let rainAccum = 0;
    let snowAccum = 0;
    const hourly: HourlyPoint[] = [];

    for (let i = startIdx; i < Math.min(startIdx + 48, times.length); i++) {
      const timeStr = times[i];
      const hourNum = Number(timeStr.slice(11, 13)) || 0;
      const daylight = computeDaylightFactor(hourNum);
      const rain = Number(hourlyRaw.rain?.[i] ?? 0);
      const snow = Number(hourlyRaw.snowfall?.[i] ?? 0);
      const wmo = Number(hourlyRaw.weather_code?.[i] ?? 0);
      const windSpeed = Number(hourlyRaw.wind_speed_10m?.[i] ?? 0);
      const precipType = mapWmoToPrecipType(wmo, rain, snow);

      if (precipType === "rain") rainAccum += Math.max(rain, Number(hourlyRaw.precipitation?.[i] ?? 0));
      if (precipType === "snow") snowAccum += snow;

      hourly.push({
        time: timeStr,
        hourLabel: timeStr.slice(11, 16),
        dayLabel: i - startIdx < 24 ? "Bugün" : "Yarın",
        temperature: Number(hourlyRaw.temperature_2m?.[i] ?? cur.temperature_2m ?? 18),
        apparentTemperature: Number(
          hourlyRaw.apparent_temperature?.[i] ?? cur.apparent_temperature ?? 18
        ),
        humidity: Math.round(Number(hourlyRaw.relative_humidity_2m?.[i] ?? 55)),
        dewPoint: Number(hourlyRaw.dew_point_2m?.[i] ?? 10),
        pressure: Math.round(Number(hourlyRaw.surface_pressure?.[i] ?? 1013)),
        windSpeed,
        windGusts: Number(hourlyRaw.wind_gusts_10m?.[i] ?? windSpeed),
        windDirection: Math.round(Number(hourlyRaw.wind_direction_10m?.[i] ?? 0)),
        cloudCover: Math.round(Number(hourlyRaw.cloud_cover?.[i] ?? 40)),
        visibilityKm: Number((Number(hourlyRaw.visibility?.[i] ?? 15000) / 1000).toFixed(1)),
        uvIndex: Number(hourlyRaw.uv_index?.[i] ?? 0),
        precipitation: Number(hourlyRaw.precipitation?.[i] ?? 0),
        precipProbability: Math.round(Number(hourlyRaw.precipitation_probability?.[i] ?? 0)),
        precipType,
        rainAccum: Number(rainAccum.toFixed(1)),
        snowAccum: Number(snowAccum.toFixed(1)),
        weatherCode: wmo,
        condition: mapWmoCodeToLabel(wmo),
        isStorm: windSpeed >= 50 || wmo >= 95 || wmo === 65 || wmo === 82,
        daylight
      });
    }

    const dailyDates: string[] = dailyRaw.time ?? [];
    const daily: DailyPoint[] = dailyDates.slice(0, 7).map((dateStr, idx) => {
      const code = Number(dailyRaw.weather_code?.[idx] ?? 0);
      return {
        date: dateStr,
        dayName: formatDayName(dateStr, idx),
        tempMax: Math.round(Number(dailyRaw.temperature_2m_max?.[idx] ?? 20)),
        tempMin: Math.round(Number(dailyRaw.temperature_2m_min?.[idx] ?? 10)),
        weatherCode: code,
        condition: mapWmoCodeToLabel(code),
        precipSum: Number(Number(dailyRaw.precipitation_sum?.[idx] ?? 0).toFixed(1)),
        precipProbabilityMax: Math.round(
          Number(dailyRaw.precipitation_probability_max?.[idx] ?? 0)
        ),
        windSpeedMax: Math.round(Number(dailyRaw.wind_speed_10m_max?.[idx] ?? 15)),
        uvIndexMax: Number(Number(dailyRaw.uv_index_max?.[idx] ?? 0).toFixed(1)),
        sunrise: String(dailyRaw.sunrise?.[idx] ?? `${dateStr}T06:45`),
        sunset: String(dailyRaw.sunset?.[idx] ?? `${dateStr}T18:00`)
      };
    });

    // 7 Basınç seviyesi sounding profilini oluştur
    const sounding: SoundingLevel[] = PRESSURE_LEVEL_META.map(({ hpa, altM }, idx) => {
      const fallback = STANDARD_PRESSURE_LEVELS[idx];
      const temp = Number(hourlyRaw[`temperature_${hpa}hPa`]?.[startIdx]);
      const rh = Number(hourlyRaw[`relative_humidity_${hpa}hPa`]?.[startIdx]);
      const wsKmh = Number(hourlyRaw[`wind_speed_${hpa}hPa`]?.[startIdx]);
      const wd = Number(hourlyRaw[`wind_direction_${hpa}hPa`]?.[startIdx]);

      const validTemp = Number.isFinite(temp) ? temp : fallback.temperature;
      const validRh = Number.isFinite(rh) ? Math.max(1, Math.min(100, rh)) : fallback.humidity;
      const dp = dewPointMagnus(validTemp, validRh);

      return {
        pressure: hpa,
        altitudeM: altM,
        temperature: Number(validTemp.toFixed(1)),
        dewPoint: Number(dp.toFixed(1)),
        humidity: Math.round(validRh),
        windSpeedKt: Number.isFinite(wsKmh) ? Math.round(wsKmh * 0.539957) : fallback.windSpeedKt,
        windDirection: Number.isFinite(wd) ? Math.round(wd) : fallback.windDirection
      };
    });

    const aqiCur = aJson?.current ?? {};
    const euAqi = Math.round(Number(aqiCur.european_aqi ?? 22));
    const aqiMeta = mapEuropeanAqi(euAqi);
    const airQuality: AirQualityDetail = {
      europeanAqi: euAqi,
      categoryIndex: aqiMeta.categoryIndex,
      label: aqiMeta.label,
      pm25: Number(Number(aqiCur.pm2_5 ?? 8.2).toFixed(1)),
      pm10: Number(Number(aqiCur.pm10 ?? 14.5).toFixed(1)),
      ozone: Math.round(Number(aqiCur.ozone ?? 55)),
      no2: Number(Number(aqiCur.nitrogen_dioxide ?? 12).toFixed(1)),
      dust: Math.round(Number(aqiCur.dust ?? 4))
    };

    const curHour = Number(String(cur.time ?? "12:00").slice(11, 13)) || 12;
    const curWmo = Number(cur.weather_code ?? 0);
    const curWind = Number(cur.wind_speed_10m ?? 0);
    const curRain = Number(cur.rain ?? 0);
    const curSnow = Number(cur.snowfall ?? 0);
    const firstHour = hourly[0];

    const bundle: WeatherBundle = {
      location: {
        ...location,
        elevation: Number(fJson.elevation ?? location.elevation ?? 0),
        timezone: String(fJson.timezone ?? location.timezone ?? "Europe/Istanbul")
      },
      source: "open-meteo",
      fetchedAt: new Date().toISOString(),
      timezone: String(fJson.timezone ?? "Europe/Istanbul"),
      utcOffsetSeconds: Number(fJson.utc_offset_seconds ?? 10800),
      current: {
        time: String(cur.time ?? new Date().toISOString()),
        temperature: Number(cur.temperature_2m ?? firstHour?.temperature ?? 18),
        apparentTemperature: Number(
          cur.apparent_temperature ?? firstHour?.apparentTemperature ?? 18
        ),
        humidity: Math.round(Number(cur.relative_humidity_2m ?? firstHour?.humidity ?? 55)),
        dewPoint: Number(cur.dew_point_2m ?? firstHour?.dewPoint ?? 10),
        pressure: Math.round(Number(cur.surface_pressure ?? firstHour?.pressure ?? 1013)),
        windSpeed: curWind,
        windGusts: Number(cur.wind_gusts_10m ?? curWind),
        windDirection: Math.round(Number(cur.wind_direction_10m ?? 0)),
        cloudCover: Math.round(Number(cur.cloud_cover ?? 40)),
        visibilityKm: firstHour?.visibilityKm ?? 15,
        uvIndex: firstHour?.uvIndex ?? 0,
        precipitation: Number(cur.precipitation ?? 0),
        precipProbability: firstHour?.precipProbability ?? 0,
        precipType: mapWmoToPrecipType(curWmo, curRain, curSnow),
        weatherCode: curWmo,
        condition: mapWmoCodeToLabel(curWmo),
        isStorm: curWind >= 50 || curWmo >= 95 || curWmo === 65 || curWmo === 82,
        isDay: Number(cur.is_day ?? 1) === 1,
        daylight: computeDaylightFactor(curHour),
        sunrise: daily[0]?.sunrise ?? "",
        sunset: daily[0]?.sunset ?? ""
      },
      airQuality,
      hourly,
      daily,
      sounding,
      nativeConvective: {
        cape: Number.isFinite(Number(hourlyRaw.cape?.[startIdx]))
          ? Math.round(Number(hourlyRaw.cape[startIdx]))
          : null,
        cin: Number.isFinite(Number(hourlyRaw.convective_inhibition?.[startIdx]))
          ? Math.round(Number(hourlyRaw.convective_inhibition[startIdx]))
          : null,
        liftedIndex: Number.isFinite(Number(hourlyRaw.lifted_index?.[startIdx]))
          ? Number(Number(hourlyRaw.lifted_index[startIdx]).toFixed(1))
          : null,
        freezingLevelM: Number.isFinite(Number(hourlyRaw.freezing_level_height?.[startIdx]))
          ? Math.round(Number(hourlyRaw.freezing_level_height[startIdx]))
          : null
      }
    };

    weatherCache.set(key, { value: bundle, expiresAt: Date.now() + CACHE_TTL_MS });
    return bundle;
  } catch {
    return buildDemoBundle(location);
  }
}
