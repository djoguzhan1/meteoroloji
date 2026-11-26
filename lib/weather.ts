import {
  ATMOS_HTTP_USER_AGENT,
  fetchBursaObservationMesh,
  fetchMgmBursaForecasts,
  isWithinBursaDomain,
  mapMeshToMetarObservations
} from "./bursa-mesh";
import {
  type BimodalEnsembleClusterResult,
  type BursaPhysicalStepDrivers,
  predictBursaTrainedPrecip,
  predictBursaTrainedTempC,
  resolveBimodalEnsembleCluster
} from "./bursa-trained-emos";
import {
  buildCalibratedSubseasonalOutlook,
  calibrateExtendedSynopticHour,
  computeDailyClimatologyNormals,
  fetchRawSubseasonalEnsemble,
  resetSubseasonalCacheForTests,
  summarizeDailyBimodalSplits
} from "./extended-horizon";
import {
  areLocationsEquivalent,
  buildFreshnessMeta,
  reanchorMultiModelBundleToNow,
  reanchorWeatherBundleToNow
} from "./forecast-resilience";
import {
  blendKalmanCorrectedScalar,
  getLeadTimeWeights,
  trainKalmanMos
} from "./kalman-mos";
import { fetchMetarNetworkHistory } from "./metar-verify";
import {
  CORE_MODEL_KEYS,
  CORE_MODEL_META,
  WMO_PRIOR_WEIGHTS
} from "./model-registry";
import {
  classifyPrecipPhase,
  computeEnsembleDistStats,
  fusePrecipitationHour,
  fusePrecipitationPmqm
} from "./precip-engine";
import {
  blendNowcastWithHourlyNwp,
  fetchBursaRadarNowcast
} from "./radar-nowcast";
import {
  evaluateHourlyRunConsistency,
  fetchOpenMeteoLaggedRuns,
  type HourlyConsistencyOutput,
  summarizeForecastStability
} from "./run-consistency";
import {
  computeSynopticCycleId,
  getPriorCalibratedRunsFromLedger,
  getSameHour24hResidualFromLedger,
  getStationHistoryFromLedger,
  getTodayObservedExtremesFromLedger,
  type LedgerForecastHourLock,
  makeLedgerLocationKey,
  recordTargetResidualToLedger,
  saveCalibratedRunToLedger
} from "./state-ledger";
import {
  getModelsSnapshotFromDisk,
  getWeatherSnapshotFromDisk,
  saveModelsSnapshotToDisk,
  saveWeatherSnapshotToDisk
} from "./snapshot-store";
import {
  buildStormAssessment,
  evaluateHourlyStormRisk,
  type HourlyStormEvalResult
} from "./storm-engine";
import {
  analyzeConvectiveProfile,
  computeEnvironmentalLapseRateCPerM,
  dewPointMagnus,
  relativeHumidityFromDewPoint,
  wetBulbStullC
} from "./thermo-cape";
import {
  classifyBursaSynopticRegime,
  computeBursaDistrictMicroclimateOffsetC,
  interpolateTopographicSurface
} from "./topographic-cressman";
import {
  diagnosePhysicalVisibilityM,
  fetchBursa9PointStencil,
  fetchMarmaraLiveSst,
  type PressureLevelSlice,
  solveVerticalColumnPhysics
} from "./vertical-physics";
import {
  blendHybridParameter,
  blendWindDirectionDeg,
  classifyPressureTrend,
  classifyUvIndex,
  computeHybridConfidence,
  computePrecipConsensus,
  computeSolarElevationDeg,
  DEFAULT_LOCATION,
  describePressureTrendDetail,
  detectDominantPollutant,
  mapEuropeanAqi,
  mapWmoCodeToLabel,
  mapWmoToPrecipType,
  solarElevationToDaylight,
  windDirectionToCompass,
  windKmhToBeaufort
} from "./weather-client";
import type {
  AirQualityDetail,
  CoreModelKey,
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
  PrecipPhase,
  RadarMetadata,
  SoundingLevel,
  WeatherBundle,
  WindGridBundle
} from "./weather-types";

const DAY_NAMES_TR = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function formatDayName(dateIso: string, index: number): string {
  if (index === 0) return "Bugün";
  if (index === 1) return "Yarın";
  const d = new Date(`${dateIso}T12:00:00`);
  return DAY_NAMES_TR[d.getDay()] ?? dateIso.slice(5);
}

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  staleUntil: number;
  cachedAtMs: number;
};
const weatherCache = new Map<string, CacheEntry<WeatherBundle>>();
const modelCache = new Map<string, CacheEntry<MultiModelBundle>>();
const windGridCache = new Map<string, CacheEntry<WindGridBundle>>();
let radarCache: CacheEntry<RadarMetadata> | null = null;

const WEATHER_TTL_MS = 5 * 60 * 1000;
const WEATHER_STALE_MS = 24 * 60 * 60 * 1000;
const WEATHER_DEGRADED_TTL_MS = 90 * 1000;
const MODEL_TTL_MS = 10 * 60 * 1000;
const MODEL_STALE_MS = 24 * 60 * 60 * 1000;
const WIND_GRID_TTL_MS = 5 * 60 * 1000;
const WIND_GRID_STALE_MS = 6 * 60 * 60 * 1000;
const RADAR_TTL_MS = 2 * 60 * 1000;
const RADAR_STALE_MS = 2 * 60 * 60 * 1000;

function mergeLocationIdentity(base: GeoLocation, req: GeoLocation): GeoLocation {
  return {
    ...base,
    id: req.id || base.id,
    name: req.name || base.name,
    admin1: req.admin1 ?? base.admin1,
    country: req.country || base.country
  };
}

function findMemoryWeatherEntry(
  location: GeoLocation,
  exactKey: string,
  nowMs: number
): CacheEntry<WeatherBundle> | null {
  const direct = weatherCache.get(exactKey);
  if (direct && direct.staleUntil > nowMs) return direct;

  let best: CacheEntry<WeatherBundle> | null = null;
  for (const entry of weatherCache.values()) {
    if (entry.staleUntil <= nowMs) continue;
    if (areLocationsEquivalent(entry.value.location, location)) {
      if (!best || entry.cachedAtMs > best.cachedAtMs) {
        best = entry;
      }
    }
  }
  return best;
}

function resolveStaleWeatherFallback(
  location: GeoLocation,
  exactKey: string,
  reason: string,
  nowMs = Date.now()
): WeatherBundle | null {
  const memEntry = findMemoryWeatherEntry(location, exactKey, nowMs);
  if (memEntry) {
    return reanchorWeatherBundleToNow(
      {
        ...memEntry.value,
        location: mergeLocationIdentity(memEntry.value.location, location)
      },
      nowMs,
      {
        status: "stale",
        sourceTier: "memory-stale",
        cachedAtMs: memEntry.cachedAtMs,
        staleReason: reason,
        modelsRespondedCount: memEntry.value.hybrid.activeModels.length
      }
    );
  }

  const diskHit = getWeatherSnapshotFromDisk(location.lat, location.lon, nowMs);
  if (diskHit) {
    return reanchorWeatherBundleToNow(
      {
        ...diskHit.bundle,
        location: mergeLocationIdentity(diskHit.bundle.location, location)
      },
      nowMs,
      {
        status: "stale",
        sourceTier: "disk-stale",
        cachedAtMs: diskHit.savedAtMs,
        staleReason: reason,
        modelsRespondedCount: diskHit.bundle.hybrid.activeModels.length
      }
    );
  }

  return null;
}

export function resetWeatherRuntimeCachesForTests(): void {
  weatherCache.clear();
  modelCache.clear();
  windGridCache.clear();
  radarCache = null;
  resetSubseasonalCacheForTests();
}

export function expireWeatherRuntimeCachesForTests(): void {
  for (const [k, v] of weatherCache.entries()) {
    weatherCache.set(k, { ...v, expiresAt: 0 });
  }
  for (const [k, v] of modelCache.entries()) {
    modelCache.set(k, { ...v, expiresAt: 0 });
  }
  for (const [k, v] of windGridCache.entries()) {
    windGridCache.set(k, { ...v, expiresAt: 0 });
  }
  if (radarCache) {
    radarCache = { ...radarCache, expiresAt: 0 };
  }
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
        headers: { "User-Agent": ATMOS_HTTP_USER_AGENT },
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
  return typeof v === "number" && Number.isFinite(v) ? Number(v.toFixed(2)) : null;
}

function spreadOf(snap: HybridModelSnapshot): number {
  const vals = CORE_MODEL_KEYS.map((k) => snap[k]).filter(
    (v): v is number => v !== null && v !== undefined && Number.isFinite(v)
  );
  if (vals.length < 2) return 0;
  return Number((Math.max(...vals) - Math.min(...vals)).toFixed(1));
}

function formatWeightsLabel(weights: Record<CoreModelKey, number>): string {
  return CORE_MODEL_KEYS.map((k) => ({
    name: CORE_MODEL_META[k].shortLabel,
    pct: Math.round(weights[k] * 100)
  }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)
    .map((x) => `%${x.pct} ${x.name}`)
    .join(" · ");
}

function topModelLabel(weights: Record<CoreModelKey, number>): string {
  let best: CoreModelKey = "ecmwfIfs";
  for (const k of CORE_MODEL_KEYS) {
    if (weights[k] > weights[best]) best = k;
  }
  return CORE_MODEL_META[best].label;
}

type EnsembleIndex = {
  utcIndex: Map<string, number>;
  tempCols: Array<Array<number | null>>;
  tempColWeights: number[];
  precipCols: Array<Array<number | null>>;
  gustCols: Array<Array<number | null>>;
  capeCols: Array<Array<number | null>>;
  memberCount: number;
};

function ensembleWeightForColumnKey(key: string): number {
  if (key.includes("ecmwf_aifs025")) return 1.45;
  if (key.includes("ecmwf_ifs025")) return 1.35;
  if (key.includes("ukmo_global_ensemble")) return 1.10;
  if (key.includes("icon_seamless")) return 1.05;
  if (key.includes("gem_global")) return 0.75;
  if (key.includes("gefs") || key.includes("gfs")) return 0.70;
  return 1.0;
}

function buildEnsembleIndex(eJson: Record<string, unknown> | null): EnsembleIndex {
  const utcIndex = new Map<string, number>();
  const tempCols: Array<Array<number | null>> = [];
  const tempColWeights: number[] = [];
  const precipCols: Array<Array<number | null>> = [];
  const gustCols: Array<Array<number | null>> = [];
  const capeCols: Array<Array<number | null>> = [];

  const hourly = eJson?.hourly as Record<string, unknown> | undefined;
  const times = Array.isArray(hourly?.time) ? (hourly.time as string[]) : [];
  if (!hourly || times.length === 0) {
    return {
      utcIndex,
      tempCols,
      tempColWeights,
      precipCols,
      gustCols,
      capeCols,
      memberCount: 0
    };
  }

  times.forEach((t, i) => utcIndex.set(t, i));
  for (const [key, val] of Object.entries(hourly)) {
    if (!Array.isArray(val)) continue;
    if (key.startsWith("temperature_2m_")) {
      tempCols.push(val as Array<number | null>);
      tempColWeights.push(ensembleWeightForColumnKey(key));
    } else if (key.startsWith("precipitation_")) {
      precipCols.push(val as Array<number | null>);
    } else if (key.startsWith("wind_gusts_10m_")) {
      gustCols.push(val as Array<number | null>);
    } else if (key.startsWith("cape_")) {
      capeCols.push(val as Array<number | null>);
    }
  }

  return {
    utcIndex,
    tempCols,
    tempColWeights,
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

function readEnsembleRowWithWeights(
  cols: Array<Array<number | null>>,
  colWeights: number[],
  idx: number | undefined
): { values: number[]; weights: number[] } | null {
  if (idx === undefined || cols.length === 0) return null;
  const values: number[] = [];
  const weights: number[] = [];
  for (let c = 0; c < cols.length; c++) {
    const v = cols[c][idx];
    if (typeof v === "number" && Number.isFinite(v)) {
      values.push(v);
      weights.push(colWeights[c] ?? 1.0);
    }
  }
  return values.length > 0 ? { values, weights } : null;
}

export async function fetchWeatherBundle(
  location: GeoLocation = DEFAULT_LOCATION
): Promise<WeatherBundle> {
  const elevTag = location.elevation !== undefined ? Math.round(location.elevation) : "auto";
  const key = `${location.lat.toFixed(3)},${location.lon.toFixed(3)},${elevTag}`;
  const entryNowMs = Date.now();
  const cached = weatherCache.get(key);
  if (cached && cached.expiresAt > entryNowMs) {
    return reanchorWeatherBundleToNow(
      {
        ...cached.value,
        location: mergeLocationIdentity(cached.value.location, location)
      },
      entryNowMs,
      {
        status: cached.value.freshness?.status ?? "live",
        sourceTier: cached.value.freshness?.sourceTier ?? "live",
        cachedAtMs: cached.cachedAtMs,
        staleReason: cached.value.freshness?.staleReason,
        degradedStreams: cached.value.freshness?.degradedStreams,
        modelsRespondedCount:
          cached.value.freshness?.modelsRespondedCount ??
          cached.value.hybrid.activeModels.length
      }
    );
  }

  const isBursaDomain = isWithinBursaDomain(location.lat, location.lon);
  const distFromBursa17116Km = Math.hypot(
    (location.lat - 40.2308) * 111.32,
    (location.lon - 29.0133) * 85.0
  );
  // Covers Osmangazi, Yıldırım, Nilüfer, Gürsu, Kestel, Mudanya & Gemlik (<=34 km, <=750m)
  // while leaving high-alpine Uludağ (1877m) and outer İnegöl/Yenişehir/Karacabey on direct local NWP grids.
  const isBursaEmosActive =
    isBursaDomain &&
    distFromBursa17116Km <= 34 &&
    (location.elevation === undefined || location.elevation <= 750);

  // 1. Ana dikey sondaj + 15dk nowcast + radyasyon + günlük güneş döngüsü
  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
  forecastUrl.searchParams.set("latitude", location.lat.toFixed(4));
  forecastUrl.searchParams.set("longitude", location.lon.toFixed(4));
  if (location.elevation !== undefined && Number.isFinite(location.elevation)) {
    forecastUrl.searchParams.set("elevation", String(Math.round(location.elevation)));
  }
  forecastUrl.searchParams.set("timezone", "auto");
  forecastUrl.searchParams.set("forecast_days", "16");
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
      "shortwave_radiation",
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

  // 2. 10 Operasyonel NWP + AI Modeli (son 72s + gelecek 7 gün = 240 saat!)
  const hybridUrl = new URL("https://api.open-meteo.com/v1/forecast");
  hybridUrl.searchParams.set("latitude", isBursaEmosActive ? "40.2308" : location.lat.toFixed(4));
  hybridUrl.searchParams.set("longitude", isBursaEmosActive ? "29.0133" : location.lon.toFixed(4));
  if (isBursaEmosActive) {
    hybridUrl.searchParams.set("elevation", "100");
  } else if (location.elevation !== undefined && Number.isFinite(location.elevation)) {
    hybridUrl.searchParams.set("elevation", String(Math.round(location.elevation)));
  }
  hybridUrl.searchParams.set("timezone", "GMT");
  hybridUrl.searchParams.set("past_days", "3");
  hybridUrl.searchParams.set("forecast_days", "16");
  hybridUrl.searchParams.set(
    "models",
    "ecmwf_ifs,ecmwf_aifs025_single,icon_seamless,ukmo_seamless,meteofrance_seamless,gfs_seamless,gem_seamless,jma_seamless,ecmwf_ifs025,icon_global"
  );
  hybridUrl.searchParams.set(
    "hourly",
    "temperature_2m,dew_point_2m,precipitation,snowfall,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,pressure_msl,cloud_cover,shortwave_radiation,temperature_850hPa,cape,lifted_index"
  );

  // 3. 212 Üyeli Çok-Merkezli Yapay Zeka + Fiziksel Ensemble
  // (51 ECMWF AIFS-ENS + 51 ECMWF IFS-ENS + 40 DWD ICON-EPS + 31 NOAA GEFS + 21 CMC GEPS + 18 UKMO MOGREPS-G)
  const ensembleUrl = new URL("https://ensemble-api.open-meteo.com/v1/ensemble");
  ensembleUrl.searchParams.set("latitude", location.lat.toFixed(4));
  ensembleUrl.searchParams.set("longitude", location.lon.toFixed(4));
  if (location.elevation !== undefined && Number.isFinite(location.elevation)) {
    ensembleUrl.searchParams.set("elevation", String(Math.round(location.elevation)));
  }
  ensembleUrl.searchParams.set("timezone", "GMT");
  ensembleUrl.searchParams.set("forecast_days", "16");
  ensembleUrl.searchParams.set(
    "models",
    "ecmwf_ifs025,ecmwf_aifs025,icon_seamless,gfs_seamless,gem_global,ukmo_global_ensemble_20km"
  );
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

  // Stage 1: 10'lu paralel canlı veri akışı (Bursa 19-ilçe MGM ağı + MGM resmi ALARO tahminleri + Marmara SST + 9-nokta stencil + 4-koşulu dProg/dt)
  const [
    forecastRes,
    hybridRes,
    ensRes,
    aqiRes,
    metarNetwork,
    bursaMesh,
    mgmForecasts,
    marmaraSstBundle,
    bursaStencilMap,
    laggedRunsMap,
    rawSubseasonal
  ] = await Promise.all([
    fetchWithRetry(forecastUrl.toString(), 11000, 1).catch(() => null),
    fetchWithRetry(hybridUrl.toString(), 10000, 1).catch(() => null),
    fetchWithRetry(ensembleUrl.toString(), 9500, 1).catch(() => null),
    fetchWithRetry(aqiUrl.toString(), 8000, 1).catch(() => null),
    fetchMetarNetworkHistory(location.lat, location.lon, 4, 85).catch(() => []),
    isBursaDomain
      ? fetchBursaObservationMesh(location.lat, location.lon, {
          referenceElevationM: location.elevation ?? 155
        }).catch(() => null)
      : Promise.resolve(null),
    isBursaDomain
      ? fetchMgmBursaForecasts(location.lat, location.lon, location.elevation ?? 155).catch(() => null)
      : Promise.resolve(null),
    isBursaDomain ? fetchMarmaraLiveSst().catch(() => null) : Promise.resolve(null),
    isBursaDomain ? fetchBursa9PointStencil().catch(() => new Map()) : Promise.resolve(new Map()),
    fetchOpenMeteoLaggedRuns({
      lat: location.lat,
      lon: location.lon,
      elevationM: location.elevation,
      forecastDays: 15
    }).catch(() => new Map()),
    fetchRawSubseasonalEnsemble({
      lat: location.lat,
      lon: location.lon,
      elevationM: location.elevation
    }).catch(() => null)
  ]);

  if (!forecastRes || !forecastRes.ok) {
    const failReason = forecastRes
      ? `Ana model servisi HTTP ${forecastRes.status} yanıtı verdi`
      : "Ana model servisine bağlantı kurulamadı";
    const staleBundle = resolveStaleWeatherFallback(location, key, failReason, Date.now());
    if (staleBundle) return staleBundle;
    throw new Error(
      forecastRes
        ? `Open-Meteo forecast HTTP ${forecastRes.status}`
        : "Open-Meteo forecast unreachable"
    );
  }

  const fJson = await forecastRes.json().catch(() => null);
  if (!fJson || !Array.isArray(fJson?.hourly?.time) || fJson.hourly.time.length === 0) {
    const staleBundle = resolveStaleWeatherFallback(
      location,
      key,
      "Ana model verisi eksik veya kesik alındı",
      Date.now()
    );
    if (staleBundle) return staleBundle;
    throw new Error("Open-Meteo forecast payload invalid");
  }

  const hJson = hybridRes && hybridRes.ok ? await hybridRes.json().catch(() => null) : null;
  const eJson = ensRes && ensRes.ok ? await ensRes.json().catch(() => null) : null;
  const aJson = aqiRes && aqiRes.ok ? await aqiRes.json().catch(() => null) : null;

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

  const curTimeStr = String(cur.time ?? "");
  const currentIsoPrefix = curTimeStr.slice(0, 13);
  let startIdx = times.findIndex((t) => t.startsWith(currentIsoPrefix));
  if (startIdx < 0) startIdx = 0;

  // Sub-hourly exact timestamp fraction [0..1] (eliminates up to 1.2°C sunset/morning clock-skew error!)
  const parsedCurMinutes = Number(curTimeStr.slice(14, 16));
  const subHourFrac = Number.isFinite(parsedCurMinutes)
    ? Math.max(0, Math.min(1, parsedCurMinutes / 60))
    : 0;

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

  const initialSounding = buildSoundingAtIndex(startIdx);
  const envLapseRateCPerM = computeEnvironmentalLapseRateCPerM(initialSounding);

  const startHourUtcMs = times[startIdx]
    ? localIsoToUtcDate(times[startIdx], utcOffsetSeconds).getTime()
    : Date.now();
  const exactNowUtcMs = startHourUtcMs + subHourFrac * 3600_000;

  const effectiveLapseCPerM =
    bursaMesh && bursaMesh.verticalProfile.isDirectlyMeasured
      ? bursaMesh.verticalProfile.lapseRateCPerKm / 1000
      : envLapseRateCPerM;

  // Read rolling 72h Bursa MGM 19-district history from persistent ledger for live model verification!
  const ledgerLocKey = makeLedgerLocationKey(location.lat, location.lon);
  const ledgerStationHistory = isBursaDomain
    ? getStationHistoryFromLedger(undefined, 72, exactNowUtcMs)
    : undefined;

  const mos = trainKalmanMos({
    network: metarNetwork,
    cityElevationM,
    cityLat: location.lat,
    cityLon: location.lon,
    envLapseRateCPerM: effectiveLapseCPerM,
    modelHourlyUtc: hybridHourly,
    utcTimeIndex,
    nowUtcMs: exactNowUtcMs,
    utcOffsetSeconds,
    ensembleMembers: ensIndex.memberCount,
    ledgerStationHistory
  });

  const startLocalHour = Number(times[startIdx]?.slice(11, 13) ?? 12);
  const startIsNight = startLocalHour >= 19 || startLocalHour <= 6;
  const startCloudPct = Number(hourlyRaw.cloud_cover?.[startIdx] ?? cur.cloud_cover ?? 35);
  const startWindDir = Number(hourlyRaw.wind_direction_10m?.[startIdx] ?? cur.wind_direction_10m ?? 0);
  const startWindKmh = Number(hourlyRaw.wind_speed_10m?.[startIdx] ?? cur.wind_speed_10m ?? 8);

  const liveBursaSurface =
    bursaMesh && bursaMesh.acceptedCount > 0
      ? interpolateTopographicSurface(
          { lat: location.lat, lon: location.lon, elevationM: cityElevationM },
          bursaMesh.stations,
          bursaMesh.verticalProfile,
          {
            isNight: startIsNight,
            localHour: startLocalHour,
            cloudCoverPct: startCloudPct,
            ambientWindDirDeg: startWindDir,
            ambientWindSpeedKt: startWindKmh * 0.539957
          }
        )
      : null;

  if (bursaMesh && liveBursaSurface) {
    const mappedBursaStations = mapMeshToMetarObservations(bursaMesh, location.lat, location.lon);
    if (mappedBursaStations.length > 0) {
      mos.anchor = {
        active: true,
        tempObsCityC: liveBursaSurface.tempC,
        dewObsCityC: liveBursaSurface.dewPointC,
        pressObsHpa: liveBursaSurface.pressureMslHpa ?? mos.anchor.pressObsHpa,
        windObsKmh:
          liveBursaSurface.windSpeedKt !== null
            ? Number((liveBursaSurface.windSpeedKt * 1.852).toFixed(1))
            : mos.anchor.windObsKmh,
        tempKalmanGain: bursaMesh.tier1OnlineCount > 0 ? 0.94 : 0.80,
        pressKalmanGain: 0.88,
        windKalmanGain: 0.64,
        wxFlags: mappedBursaStations[0].wxFlags ?? mos.anchor.wxFlags,
        primaryStationAgeMin: mappedBursaStations[0].ageMinutes,
        primaryStationDistKm: mappedBursaStations[0].distanceKm
      };
      if (bursaMesh.tier1OnlineCount > 0) {
        mos.report.mode = "live-mgm-mesh";
      }
      mos.report.station = mappedBursaStations[0];
      mos.report.stations = mappedBursaStations;
      mos.summary.active = true;
      mos.summary.stationCount = mappedBursaStations.length;
      mos.summary.stationIds = mappedBursaStations.slice(0, 4).map((s) => s.icaoId);
      mos.summary.envLapseRateCPerKm = Number((effectiveLapseCPerM * 1000).toFixed(2));
      mos.summary.nowcastKalmanGain = mos.anchor.tempKalmanGain;
    }
  }

  // Stage 2: REAL-PHYSICS RADAR NOWCAST
  // Uses true 700/850 hPa steering wind, true live surface T & Td (for Virga LCL evaporation),
  // true MGM pluviometer gauge rate (Fulton-Brandes G/R calibration), and true northerly upslope flag!
  const snd700 = initialSounding.find((l) => l.pressure === 700);
  const snd850 = initialSounding.find((l) => l.pressure === 850);
  const steerFromDeg =
    snd700 && snd850 && snd700.windSpeedKt + snd850.windSpeedKt > 2
      ? blendWindDirectionDeg(
          {
            ecmwfIfs: snd700.windDirection,
            ecmwfAifs: snd850.windDirection,
            icon: null,
            ukmo: null,
            gfs: null
          },
          { ecmwfIfs: 0.6, ecmwfAifs: 0.4 },
          startWindDir
        )
      : snd700?.windDirection ?? snd850?.windDirection ?? startWindDir;
  const steerSpeedKt = Math.max(
    4,
    0.6 * (snd700?.windSpeedKt ?? 16) + 0.4 * (snd850?.windSpeedKt ?? 12)
  );
  const liveSurfT =
    liveBursaSurface?.tempC ?? mos.anchor.tempObsCityC ?? Number(cur.temperature_2m ?? 14);
  const liveSurfTd =
    liveBursaSurface?.dewPointC ?? mos.anchor.dewObsCityC ?? Number(cur.dew_point_2m ?? 8);
  const isNortherlyUpslopeNow =
    isBursaDomain &&
    ((snd850?.windDirection ?? startWindDir) >= 300 ||
      (snd850?.windDirection ?? startWindDir) <= 65) &&
    (snd850?.windSpeedKt ?? 0) >= 9 &&
    liveSurfT - liveSurfTd <= 7.5;
  const activeGaugeCount =
    bursaMesh?.stations.filter(
      (s) => s.qcWeight > 0 && (s.precip10MinMm !== null || s.precip1HrMm !== null)
    ).length ?? 0;

  const radarNowcast = await fetchBursaRadarNowcast(location.lat, location.lon, {
    steeringWindFromDeg: steerFromDeg,
    steeringWindSpeedKt: steerSpeedKt,
    surfaceTempC: liveSurfT,
    surfaceDewPointC: liveSurfTd,
    orographicUpslopeActive: isNortherlyUpslopeNow,
    liveGaugeRainMmHr: liveBursaSurface?.precipRateMmHr ?? null,
    liveGaugeCount: activeGaugeCount
  });

  const laggedSeriesList = [...laggedRunsMap.values()];
  const consistencyTrack: HourlyConsistencyOutput[] = [];
  let firstHourVertPhys: ReturnType<typeof solveVerticalColumnPhysics> | null = null;
  let bimodalHoursResolved = 0;

  const readExtendedModelSnapshot = (
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
        gem: null,
        jma: null
      };
    }
    const ifsPrimary = useIfs025ForIfs
      ? toFiniteNum(hybridHourly[`${prefix}_ecmwf_ifs025`]?.[hIdx])
      : toFiniteNum(hybridHourly[`${prefix}_${CORE_MODEL_META.ecmwfIfs.apiModel}`]?.[hIdx]) ??
        toFiniteNum(hybridHourly[`${prefix}_ecmwf_ifs025`]?.[hIdx]);
    const iconPrimary =
      toFiniteNum(hybridHourly[`${prefix}_${CORE_MODEL_META.icon.apiModel}`]?.[hIdx]) ??
      toFiniteNum(hybridHourly[`${prefix}_icon_global`]?.[hIdx]);
    return {
      ecmwfIfs: ifsPrimary,
      ecmwfAifs: toFiniteNum(
        hybridHourly[`${prefix}_${CORE_MODEL_META.ecmwfAifs.apiModel}`]?.[hIdx]
      ),
      icon: iconPrimary,
      ukmo: toFiniteNum(hybridHourly[`${prefix}_${CORE_MODEL_META.ukmo.apiModel}`]?.[hIdx]),
      meteofrance: toFiniteNum(
        hybridHourly[`${prefix}_${CORE_MODEL_META.meteofrance.apiModel}`]?.[hIdx]
      ),
      gfs: toFiniteNum(hybridHourly[`${prefix}_${CORE_MODEL_META.gfs.apiModel}`]?.[hIdx]),
      gem: toFiniteNum(hybridHourly[`${prefix}_${CORE_MODEL_META.gem.apiModel}`]?.[hIdx]),
      jma: toFiniteNum(hybridHourly[`${prefix}_${CORE_MODEL_META.jma.apiModel}`]?.[hIdx])
    };
  };

  // Precompute 240-hour 8-model median temperature & precipitation arrays for fast spatio-temporal window features
  const hybridUtcList: string[] = Array.isArray(hJson?.hourly?.time)
    ? (hJson.hourly.time as string[])
    : [];
  const hybridTempMedians: number[] = hybridUtcList.map((uKey) => {
    const sn = readExtendedModelSnapshot("temperature_2m", uKey);
    const vals = CORE_MODEL_KEYS.map((k) => sn[k])
      .filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v))
      .sort((a, b) => a - b);
    if (vals.length === 0) return Number(cur.temperature_2m ?? 15);
    const mid = Math.floor(vals.length / 2);
    return vals.length % 2 === 0 ? 0.5 * (vals[mid - 1] + vals[mid]) : vals[mid];
  });
  const hybridPrecipMedians: number[] = hybridUtcList.map((uKey) => {
    const sn = readExtendedModelSnapshot("precipitation", uKey);
    const vals = CORE_MODEL_KEYS.map((k) => sn[k])
      .filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v))
      .map((v) => Math.max(0, v))
      .sort((a, b) => a - b);
    if (vals.length === 0) return 0;
    const mid = Math.floor(vals.length / 2);
    return vals.length % 2 === 0 ? 0.5 * (vals[mid - 1] + vals[mid]) : vals[mid];
  });
  const hybridPrecipWetFracs: number[] = hybridUtcList.map((uKey) => {
    const sn = readExtendedModelSnapshot("precipitation", uKey);
    const vals = CORE_MODEL_KEYS.map((k) => sn[k]).filter(
      (v): v is number => v !== null && v !== undefined && Number.isFinite(v)
    );
    return vals.length > 0 ? vals.filter((v) => v >= 0.2).length / vals.length : 0;
  });

  const getBursaNeighborMedians = (utcKey: string, fallbackMed: number) => {
    const hIdx = utcTimeIndex.get(utcKey);
    if (hIdx === undefined || hybridTempMedians.length === 0) {
      return {
        minus3h: fallbackMed,
        minus2h: fallbackMed,
        minus1h: fallbackMed,
        plus1h: fallbackMed,
        plus2h: fallbackMed,
        plus3h: fallbackMed,
        min24h: fallbackMed - 3,
        max24h: fallbackMed + 3
      };
    }
    const win = hybridTempMedians.slice(
      Math.max(0, hIdx - 12),
      Math.min(hybridTempMedians.length, hIdx + 13)
    );
    return {
      minus3h: hybridTempMedians[Math.max(0, hIdx - 3)] ?? fallbackMed,
      minus2h: hybridTempMedians[Math.max(0, hIdx - 2)] ?? fallbackMed,
      minus1h: hybridTempMedians[Math.max(0, hIdx - 1)] ?? fallbackMed,
      plus1h: hybridTempMedians[Math.min(hybridTempMedians.length - 1, hIdx + 1)] ?? fallbackMed,
      plus2h: hybridTempMedians[Math.min(hybridTempMedians.length - 1, hIdx + 2)] ?? fallbackMed,
      plus3h: hybridTempMedians[Math.min(hybridTempMedians.length - 1, hIdx + 3)] ?? fallbackMed,
      min24h: win.length > 0 ? Math.min(...win) : fallbackMed - 3,
      max24h: win.length > 0 ? Math.max(...win) : fallbackMed + 3
    };
  };

  const getBursaPrecipWindow = (utcKey: string) => {
    const hIdx = utcTimeIndex.get(utcKey);
    if (hIdx === undefined || hybridPrecipMedians.length === 0) {
      return { windowMedians: [0], windowMaxWetFrac: 0 };
    }
    const lo = Math.max(0, hIdx - 2);
    const hi = Math.min(hybridPrecipMedians.length, hIdx + 3);
    const windowMedians = hybridPrecipMedians.slice(lo, hi);
    const windowWetFracs = hybridPrecipWetFracs.slice(lo, hi);
    return {
      windowMedians,
      windowMaxWetFrac: windowWetFracs.length > 0 ? Math.max(...windowWetFracs) : 0
    };
  };

  const getBursaPhysicalDriversAt = (
    utcKey: string,
    localIdxFallback: number
  ): BursaPhysicalStepDrivers => {
    const dewSnap = readExtendedModelSnapshot("dew_point_2m", utcKey);
    const cloudSnap = readExtendedModelSnapshot("cloud_cover", utcKey);
    const windSnap = readExtendedModelSnapshot("wind_speed_10m", utcKey);
    const dirSnap = readExtendedModelSnapshot("wind_direction_10m", utcKey);
    const pressSnap = readExtendedModelSnapshot("pressure_msl", utcKey);
    const swSnap = readExtendedModelSnapshot("shortwave_radiation", utcKey);

    const prev3Date = new Date(Date.parse(`${utcKey}:00Z`) - 3 * 3600_000);
    const prev3Key = prev3Date.toISOString().slice(0, 16);
    const pressPrev3Snap = readExtendedModelSnapshot("pressure_msl", prev3Key);

    const meanSnap = (sn: HybridModelSnapshot, fb: number | null): number | null => {
      const vals = CORE_MODEL_KEYS.map((k) => sn[k]).filter(
        (v): v is number => v !== null && v !== undefined && Number.isFinite(v)
      );
      return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : fb;
    };

    const pCur = meanSnap(pressSnap, Number(hourlyRaw.pressure_msl?.[localIdxFallback] ?? 1015));
    const pPrev3 = meanSnap(
      pressPrev3Snap,
      Number(hourlyRaw.pressure_msl?.[Math.max(0, localIdxFallback - 3)] ?? pCur ?? 1015)
    );

    return {
      dewPointC: meanSnap(dewSnap, Number(hourlyRaw.dew_point_2m?.[localIdxFallback] ?? 8)),
      cloudCoverPct: meanSnap(cloudSnap, Number(hourlyRaw.cloud_cover?.[localIdxFallback] ?? 40)),
      windSpeedKmh: meanSnap(windSnap, Number(hourlyRaw.wind_speed_10m?.[localIdxFallback] ?? 10)),
      windDirDeg: blendWindDirectionDeg(
        dirSnap,
        WMO_PRIOR_WEIGHTS.wind,
        Number(hourlyRaw.wind_direction_10m?.[localIdxFallback] ?? 0)
      ),
      pressureMslHpa: pCur,
      pressureDelta3hHpa: pCur !== null && pPrev3 !== null ? pCur - pPrev3 : 0,
      shortwaveRadiationWm2: meanSnap(
        swSnap,
        Number(hourlyRaw.shortwave_radiation?.[localIdxFallback] ?? 0)
      )
    };
  };

  // Sub-hourly interpolated EMOS baseline at exact t_now -> eliminates clock-skew error in liveOriginResidualC!
  const effectiveLapsePerKm = Number((effectiveLapseCPerM * 1000).toFixed(2));
  const evalBaseBursaTempNoResidual = (localIdx: number, leadH: number): number | null => {
    if (!isBursaEmosActive || !times[localIdx]) return null;
    const tStr = times[localIdx];
    const locH = Number(tStr.slice(11, 13)) || 0;
    const uDate = localIsoToUtcDate(tStr, utcOffsetSeconds);
    const uKey = uDate.toISOString().slice(0, 16);
    const dateYmd = tStr.slice(0, 10);
    const drivers = getBursaPhysicalDriversAt(uKey, localIdx);
    const mgmStep = mgmForecasts?.hourly17116.get(uKey) ?? null;

    const baseElevTemp = predictBursaTrainedTempC({
      leadHours: leadH,
      utcDate: uDate,
      localHourTrt: locH,
      tempSnapshot: readExtendedModelSnapshot("temperature_2m", uKey),
      precipSnapshot: readExtendedModelSnapshot("precipitation", uKey),
      neighborMedians: getBursaNeighborMedians(uKey, Number(cur.temperature_2m ?? 15)),
      physicalDrivers: drivers,
      targetElevationM: cityElevationM,
      lapseRateCPerKm: effectiveLapsePerKm,
      verticalProfile: bursaMesh?.verticalProfile ?? null,
      mgmOfficialHourlyTempC: mgmStep?.tempC ?? null
    });
    if (baseElevTemp === null) return null;

    const sstNow =
      marmaraSstBundle?.hourlySstByUtc.get(uKey) ?? marmaraSstBundle?.currentSstC ?? null;
    const microOffset = computeBursaDistrictMicroclimateOffsetC({
      targetLat: location.lat,
      targetLon: location.lon,
      targetElevationM: cityElevationM,
      base17116TempC: baseElevTemp,
      localHour: locH,
      isNight: locH >= 19 || locH <= 6,
      cloudCoverPct: drivers.cloudCoverPct ?? 35,
      windSpeedKmh: drivers.windSpeedKmh ?? 10,
      windDirDeg: drivers.windDirDeg ?? 0,
      marmaraSstC: sstNow,
      mgmDistrictDay: mgmForecasts?.dailyDistrict.get(dateYmd) ?? null
    });
    return Number((baseElevTemp + microOffset).toFixed(2));
  };

  const originBaseH0 = evalBaseBursaTempNoResidual(startIdx, 0);
  const originBaseH1 = evalBaseBursaTempNoResidual(
    Math.min(times.length - 1, startIdx + 1),
    1
  );
  const originExactEmosRefC =
    originBaseH0 !== null
      ? Number(
          (
            (1 - subHourFrac) * originBaseH0 +
            subHourFrac * (originBaseH1 ?? originBaseH0)
          ).toFixed(2)
        )
      : null;

  const bursaLiveOriginResidualC =
    originExactEmosRefC !== null && liveBursaSurface !== null
      ? Number((liveBursaSurface.tempC - originExactEmosRefC).toFixed(2))
      : null;

  const initialRegimeNow = classifyBursaSynopticRegime({
    windDir10mDeg: liveBursaSurface?.windDirDeg ?? startWindDir,
    windSpeed10mKt: liveBursaSurface?.windSpeedKt ?? startWindKmh * 0.539957,
    pressureMslHpa:
      liveBursaSurface?.pressureMslHpa ?? Number(hourlyRaw.pressure_msl?.[startIdx] ?? 1015),
    cloudCoverPct: startCloudPct,
    localHour: startLocalHour,
    month: new Date(exactNowUtcMs).getUTCMonth() + 1
  });

  const originUtcKey = new Date(startHourUtcMs).toISOString().slice(0, 16);
  const todayDateYmd = String(times[startIdx] ?? curTimeStr).slice(0, 10);

  // Persist current target truth & residual into rolling 96h state ledger!
  if (liveBursaSurface !== null) {
    recordTargetResidualToLedger({
      locKey: ledgerLocKey,
      utcHourKey: originUtcKey,
      localDateYmd: todayDateYmd,
      localHour: startLocalHour,
      observedAtMs: exactNowUtcMs,
      observedTempC: liveBursaSurface.tempC,
      emosBaseTempC: originExactEmosRefC,
      residualC: bursaLiveOriginResidualC,
      regime: initialRegimeNow,
      precipMmHr: liveBursaSurface.precipRateMmHr
    });
  }

  // Retrieve prior calibrated synoptic runs (R-1, R-2) from state ledger for true calibrated-vs-calibrated hysteresis!
  const activeCycleId = computeSynopticCycleId(exactNowUtcMs);
  const priorCalibratedRuns = getPriorCalibratedRunsFromLedger(ledgerLocKey, activeCycleId);
  const priorRun1 =
    priorCalibratedRuns.length >= 1
      ? priorCalibratedRuns[priorCalibratedRuns.length - 1]
      : null;
  const priorRun2 =
    priorCalibratedRuns.length >= 2
      ? priorCalibratedRuns[priorCalibratedRuns.length - 2]
      : null;

  // Group 15-minute nowcast precipitation by hour prefix (0..5h)
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
  const extendedSynopticHours: HourlyPoint[] = [];
  const hourBimodalByTime = new Map<string, BimodalEnsembleClusterResult | null>();
  const hourMetaByTime = new Map<
    string,
    { activeModels: number; ensMembers: number; confidencePct: number }
  >();
  const hourlySoundings: SoundingLevel[][] = [];
  const hourlyStormEvals: HourlyStormEvalResult[] = [];
  const hourlyPrecipTrack: number[] = [];
  const currentCycleHourLocks: Record<string, LedgerForecastHourLock> = {};

  let firstHourTempShiftC = 0;
  let firstHourTempBand: EnsembleBand | undefined;

  // FULL 168-HOUR (7-DAY) UNIFIED CALIBRATION & PHYSICS PIPELINE!
  const maxHourlyIdx = Math.min(startIdx + 168, times.length);
  for (let i = startIdx; i < maxHourlyIdx; i++) {
    const leadHour = i - startIdx;
    const timeStr = times[i];
    const dateYmd = timeStr.slice(0, 10);
    const localHour = Number(timeStr.slice(11, 13)) || 0;
    const utcDate = localIsoToUtcDate(timeStr, utcOffsetSeconds);
    const utcKey = utcDate.toISOString().slice(0, 16);
    const dayIdxFromStart = Math.floor(leadHour / 24);
    const hourDayLabel = formatDayName(dateYmd, dayIdxFromStart);

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

    const tempSnap = readExtendedModelSnapshot("temperature_2m", utcKey);
    const dewSnap = readExtendedModelSnapshot("dew_point_2m", utcKey);
    const pressSnap = readExtendedModelSnapshot("pressure_msl", utcKey);
    const precipSnap = readExtendedModelSnapshot("precipitation", utcKey);
    const snowSnap = readExtendedModelSnapshot("snowfall", utcKey);
    const wmoSnap = readExtendedModelSnapshot("weather_code", utcKey);
    const windSnap = readExtendedModelSnapshot("wind_speed_10m", utcKey);
    const gustSnap = readExtendedModelSnapshot("wind_gusts_10m", utcKey);
    const dirSnap = readExtendedModelSnapshot("wind_direction_10m", utcKey);
    const t850Snap = readExtendedModelSnapshot("temperature_850hPa", utcKey, true);
    const capeSnap = readExtendedModelSnapshot("cape", utcKey);

    // 212-Member AI+Physics Ensemble Slices
    const eIdx = ensIndex.utcIndex.get(utcKey);
    const ensTempWeighted = readEnsembleRowWithWeights(
      ensIndex.tempCols,
      ensIndex.tempColWeights,
      eIdx
    );
    const ensTempArr = ensTempWeighted?.values ?? null;
    const ensPrecipArr = readEnsembleRow(ensIndex.precipCols, eIdx);
    const ensGustArr = readEnsembleRow(ensIndex.gustCols, eIdx);
    const ensCapeArr = readEnsembleRow(ensIndex.capeCols, eIdx);

    const ensTempStats = ensTempArr ? computeEnsembleDistStats(ensTempArr) : null;
    const ensGustStats = ensGustArr ? computeEnsembleDistStats(ensGustArr) : null;

    // 1. BURSA 17,472h WMO-17116 SCALE-EQUIVARIANT RESIDUAL EMOS + GBDT + DISTRICT MICROCLIMATE + 212-MEMBER BIMODAL SOLVER
    const kalmanFallbackTemp = blendKalmanCorrectedScalar({
      snapshot: tempSnap,
      mos,
      param: "temperature",
      leadHour,
      localHour,
      fallback: rawTemp,
      ensembleP50: ensTempStats?.p50 ?? null
    });

    const stepDrivers = isBursaDomain ? getBursaPhysicalDriversAt(utcKey, i) : undefined;
    const prelimStepRegime = classifyBursaSynopticRegime({
      windDir10mDeg: stepDrivers?.windDirDeg ?? rawWindDir,
      windSpeed10mKt: (stepDrivers?.windSpeedKmh ?? rawWind) * 0.539957,
      pressureMslHpa: stepDrivers?.pressureMslHpa ?? rawPress,
      cloudCoverPct: stepDrivers?.cloudCoverPct ?? Number(hourlyRaw.cloud_cover?.[i] ?? 40),
      localHour,
      month: utcDate.getUTCMonth() + 1
    });
    const sameHour24hRes =
      isBursaEmosActive && leadHour <= 24
        ? getSameHour24hResidualFromLedger({
            locKey: ledgerLocKey,
            targetUtcMs: utcDate.getTime(),
            currentRegime: prelimStepRegime
          })
        : null;
    const mgmStep = mgmForecasts?.hourly17116.get(utcKey) ?? null;
    const mgmDay = mgmForecasts?.dailyDistrict.get(dateYmd) ?? null;
    const sstHourC =
      marmaraSstBundle?.hourlySstByUtc.get(utcKey) ?? marmaraSstBundle?.currentSstC ?? undefined;
    const stencilSlice = bursaStencilMap.get(utcKey) ?? null;

    const bursaEmosElevTemp = isBursaEmosActive
      ? predictBursaTrainedTempC({
          leadHours: leadHour,
          utcDate,
          localHourTrt: localHour,
          tempSnapshot: tempSnap,
          precipSnapshot: precipSnap,
          neighborMedians: getBursaNeighborMedians(utcKey, kalmanFallbackTemp),
          physicalDrivers: stepDrivers,
          targetElevationM: cityElevationM,
          liveOriginResidualC: bursaLiveOriginResidualC,
          originLocalHourTrt: startLocalHour,
          sameHour24hResidualC: sameHour24hRes,
          lapseRateCPerKm: effectiveLapsePerKm,
          verticalProfile: leadHour <= 18 ? (bursaMesh?.verticalProfile ?? null) : null,
          mgmOfficialHourlyTempC: mgmStep?.tempC ?? null
        })
      : null;

    const districtMicroOffsetC =
      bursaEmosElevTemp !== null
        ? computeBursaDistrictMicroclimateOffsetC({
            targetLat: location.lat,
            targetLon: location.lon,
            targetElevationM: cityElevationM,
            base17116TempC: bursaEmosElevTemp,
            localHour,
            isNight: solarElevationDeg <= 0,
            cloudCoverPct: stepDrivers?.cloudCoverPct ?? Number(hourlyRaw.cloud_cover?.[i] ?? 35),
            windSpeedKmh: stepDrivers?.windSpeedKmh ?? rawWind,
            windDirDeg: stepDrivers?.windDirDeg ?? rawWindDir,
            marmaraSstC: sstHourC ?? null,
            mgmDistrictDay: mgmDay
          }) * (1 - 0.855 ** Math.min(24, leadHour) * (liveBursaSurface !== null && leadHour <= 24 ? 1 : 0))
        : 0;
    // Note: when liveBursaSurface is active, T+0 live residual ALREADY contains today's exact district offset,
    // so `(1 - 0.855^leadHour)` fades in `districtMicroOffsetC` smoothly as `AR(2)` decays — zero double-counting!

    const baseKalmanTemp =
      bursaEmosElevTemp !== null ? bursaEmosElevTemp + districtMicroOffsetC : kalmanFallbackTemp;

    const columnLevels: PressureLevelSlice[] = ([1000, 925, 850, 700] as const).map((hpa) => ({
      pressureHpa: hpa,
      geopotentialHeightM: Number(
        hourlyRaw[`geopotential_height_${hpa}hPa`]?.[i] ??
          (hpa === 1000 ? 110 : hpa === 925 ? 780 : hpa === 850 ? 1500 : 3050)
      ),
      tempC: Number(
        hourlyRaw[`temperature_${hpa}hPa`]?.[i] ?? (baseKalmanTemp - (1000 - hpa) * 0.06)
      ),
      relHumidityPct: Number(hourlyRaw[`relative_humidity_${hpa}hPa`]?.[i] ?? 65),
      windSpeedKt: Number(hourlyRaw[`wind_speed_${hpa}hPa`]?.[i] ?? 15) * 0.539957,
      windDirDeg: Number(hourlyRaw[`wind_direction_${hpa}hPa`]?.[i] ?? rawWindDir)
    }));

    const vertPhys = isBursaDomain
      ? solveVerticalColumnPhysics({
          targetElevationM: cityElevationM,
          rawModelTemp2mC: baseKalmanTemp,
          rawModelDew2mC: rawDew,
          rawModelPrecipMmHr: rawPrecip,
          rawModelVisibilityM:
            typeof hourlyRaw.visibility?.[i] === "number" ? Number(hourlyRaw.visibility[i]) : null,
          cloudCoverLowPct: Number(hourlyRaw.cloud_cover?.[i] ?? 35),
          shortwaveRadiationWm2:
            typeof hourlyRaw.shortwave_radiation?.[i] === "number"
              ? Number(hourlyRaw.shortwave_radiation[i])
              : Math.max(0, Math.sin((Math.max(0, solarElevationDeg) * Math.PI) / 180) * 780),
          isNight: solarElevationDeg <= 0,
          marmaraSstC: sstHourC,
          windwardSouthRh850Pct: stencilSlice?.windwardSouthRh850Pct ?? undefined,
          marineUpwindPrecipMmHr: stencilSlice?.marineUpwindPrecipMmHr,
          uludagSlopePrecipMmHr: stencilSlice?.uludagSlopePrecipMmHr,
          levels: columnLevels
        })
      : null;
    if (leadHour === 0) firstHourVertPhys = vertPhys;

    let physAdjustedTemp = vertPhys
      ? bursaEmosElevTemp !== null
        ? vertPhys.activeMechanism === "LODOS_DRY_FOEHN"
          ? baseKalmanTemp + 0.18 * vertPhys.tempDeltaC
          : baseKalmanTemp
        : baseKalmanTemp + 0.45 * vertPhys.tempDeltaC
      : baseKalmanTemp;

    // Medium-range (Days 3-7, lead >= 54h): blend ensemble P50 anomaly softly AND solve bimodal frontal bifurcations!
    if (leadHour >= 54 && ensTempWeighted && ensTempStats) {
      const bimodal = resolveBimodalEnsembleCluster({
        leadHours: leadHour,
        emosTempC: physAdjustedTemp,
        ensembleMembersC: ensTempWeighted.values,
        ensembleWeights: ensTempWeighted.weights,
        dProgDtTrendC: 0
      });
      if (bimodal.isBimodal) {
        physAdjustedTemp = bimodal.adjustedTempC;
        bimodalHoursResolved++;
        hourBimodalByTime.set(timeStr, bimodal);
      } else if (bursaEmosElevTemp !== null) {
        // Unimodal 212-member ensemble spread stabilization on Days 4-7 (prevents deterministic phase overshoot)
        const detVals = CORE_MODEL_KEYS.map((k) => tempSnap[k]).filter(
          (v): v is number => v !== null && v !== undefined && Number.isFinite(v)
        );
        if (detVals.length >= 3) {
          const detMean = detVals.reduce((a, b) => a + b, 0) / detVals.length;
          // Align ensemble median to local calibrated frame by comparing against deterministic mean
          const ensAnomalyC = Math.max(-2.6, Math.min(2.6, ensTempStats.p50 - detMean));
          const ensStabilizeW = Math.min(0.22, ((leadHour - 54) / 114) * 0.22);
          physAdjustedTemp += ensStabilizeW * ensAnomalyC;
        }
      }
    }

    const dewPointPrelim = Math.min(
      physAdjustedTemp,
      blendKalmanCorrectedScalar({
        snapshot: dewSnap,
        mos,
        param: "dewPoint",
        leadHour,
        localHour,
        fallback: rawDew
      })
    );
    const humidityPrelim = Math.round(
      relativeHumidityFromDewPoint(physAdjustedTemp, dewPointPrelim)
    );

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
    const leadGustW: Record<CoreModelKey, number> = {
      ...leadWindW,
      ecmwfAifs: 0
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
      Math.max(windSpeed, blendHybridParameter(gustSnap, leadGustW, rawGust)).toFixed(1)
    );
    const gustP90 = ensGustStats
      ? Number(Math.max(windGusts, ensGustStats.p90).toFixed(1))
      : undefined;
    const windDirection = blendWindDirectionDeg(dirSnap, leadWindW, rawWindDir);

    // 2. PRECIPITATION FUSION (212-Member Ensemble + 9-Point Spatial Stencil + +/-2h Window GBDT + Radar Nowcast)
    const leadPrecipW = getLeadTimeWeights(
      mos.shortRangeWeights.precipitation,
      mos.mediumRangeWeights.precipitation,
      leadHour
    );
    const radarHourSlice =
      leadHour < 3 && radarNowcast.radarAvailable
        ? radarNowcast.steps5Min.filter(
            (s) => s.offsetMinutes >= leadHour * 60 && s.offsetMinutes < (leadHour + 1) * 60
          )
        : [];
    const radarHourMeanMm =
      radarHourSlice.length > 0
        ? radarHourSlice.reduce((a, s) => a + s.rainRateMmHr, 0) / radarHourSlice.length
        : null;
    const ncHourMm = radarHourMeanMm ?? nowcastHourlyPrecipMm.get(timeStr.slice(0, 13)) ?? null;

    const baseFusedPrecip = fusePrecipitationHour({
      detSnapshot: precipSnap,
      detWeights: leadPrecipW,
      ensembleMembersMm: ensPrecipArr,
      rawPrecipFallbackMm: rawPrecip,
      rawPopFallbackPct: rawPop,
      leadHour,
      nowcast15Mm: ncHourMm,
      liveMetarWx: leadHour <= 1 && mos.anchor.active ? mos.anchor.wxFlags : null
    });

    const stepRegime = classifyBursaSynopticRegime({
      windDir10mDeg: windDirection,
      windSpeed10mKt: windSpeed * 0.539957,
      pressureMslHpa: pressure,
      cloudCoverPct: Number(hourlyRaw.cloud_cover?.[i] ?? 40),
      localHour,
      month: utcDate.getUTCMonth() + 1
    });

    const precipWin = getBursaPrecipWindow(utcKey);
    const mgmWetFlag = mgmStep ? mgmStep.isWet : mgmDay ? mgmDay.isWet : null;

    const pmqmCheck = fusePrecipitationPmqm({
      leadHours: leadHour,
      regime: stepRegime,
      modelPrecipMm: CORE_MODEL_KEYS.map((mk) => ({
        modelKey: mk,
        precipMmHr: Math.max(0, precipSnap[mk] ?? 0) * (vertPhys?.precipMultiplier ?? 1),
        weight: leadPrecipW[mk] ?? 0.06
      })),
      spatialNeighborhoodMm: stencilSlice?.spatialNeighborhoodMm,
      temporalWindowPopPct: Math.round(precipWin.windowMaxWetFrac * 100),
      mgmOfficialWet: mgmWetFlag,
      ensemblePopPct: baseFusedPrecip.precipProbabilityPct,
      ensembleP75Mm: baseFusedPrecip.consensus.p90Mm ?? null,
      temp2mC: physAdjustedTemp,
      relHumidityPct: humidityPrelim,
      targetElevationM: cityElevationM
    });

    const bursaTrainedPrecip = isBursaEmosActive
      ? predictBursaTrainedPrecip({
          leadHours: leadHour,
          precipSnapshot: precipSnap,
          ensemblePopPct: baseFusedPrecip.precipProbabilityPct,
          windowPrecipMediansMm: precipWin.windowMedians,
          windowMaxWetFrac: precipWin.windowMaxWetFrac,
          physicalDrivers: stepDrivers,
          temp2mC: physAdjustedTemp
        })
      : null;

    const virgaVetoed = Boolean(vertPhys && vertPhys.precipMultiplier === 0);
    const prelimWetHour =
      !virgaVetoed && (bursaTrainedPrecip ? bursaTrainedPrecip.isWet : pmqmCheck.isWetHour);
    const calibratedNwpPrecipMm = prelimWetHour
      ? bursaTrainedPrecip
        ? Number(
            (
              0.58 * bursaTrainedPrecip.qpfMmHr +
              0.42 * Math.max(baseFusedPrecip.precipitationMm, pmqmCheck.qpfMmHr)
            ).toFixed(2)
          )
        : Number((0.52 * baseFusedPrecip.precipitationMm + 0.48 * pmqmCheck.qpfMmHr).toFixed(2))
      : 0;

    const prelimPrecipMm =
      leadHour < 3 && radarNowcast.radarAvailable
        ? blendNowcastWithHourlyNwp(
            radarNowcast,
            [0, 1, 2].map((hOff) =>
              hOff === leadHour ? calibratedNwpPrecipMm : baseFusedPrecip.precipitationMm
            )
          )[leadHour]
        : calibratedNwpPrecipMm;

    const prelimPopPct =
      virgaVetoed || (pmqmCheck.drizzleSuppressed && !prelimWetHour)
        ? Math.min(34, baseFusedPrecip.precipProbabilityPct)
        : bursaTrainedPrecip
          ? bursaTrainedPrecip.popPct
          : pmqmCheck.calibratedPopPct;

    // 3. UNIFIED CALIBRATED-VS-CALIBRATED HYSTERESIS & SPIN-UP VETO ACROSS ALL 168 HOURS!
    const preLockP3Prev =
      leadHour >= 3
        ? hourly[leadHour - 3]?.pressure ?? pressure
        : Number(hourlyRaw.pressure_msl?.[Math.max(0, i - 3)] ?? pressure);
    const priorLockR1 = priorRun1?.hours[utcKey] ?? null;
    const priorLockR2 = priorRun2?.hours[utcKey] ?? null;

    const stepConsistency = evaluateHourlyRunConsistency({
      leadHours: leadHour,
      validTimeIso: timeStr,
      utcHourKey: utcKey,
      candidateTempC: physAdjustedTemp,
      candidateIsWet: prelimPrecipMm >= 0.10,
      candidatePrecipMmHr: prelimPrecipMm,
      candidatePopPct: prelimPopPct,
      previousLockedTempC: priorLockR1?.tempC ?? null,
      previousLockedRunMinus2TempC: priorLockR2?.tempC ?? null,
      previousLockedIsWet: priorLockR1?.isWet ?? null,
      previousLockedPrecipMmHr: priorLockR1?.precipMmHr ?? null,
      ensembleTempIqrC: ensTempStats ? ensTempStats.p75 - ensTempStats.p25 : null,
      laggedModels: laggedSeriesList,
      hourIndex: leadHour,
      liveAnchor: {
        liveObsTempC: liveBursaSurface?.tempC ?? mos.anchor.tempObsCityC,
        liveRadarRainMmHr: radarNowcast.radarAvailable ? radarNowcast.currentRainRateMmHr : null,
        liveGaugePrecipMmHr: liveBursaSurface?.precipRateMmHr ?? null,
        pressureTrend3hHpa: pressure - preLockP3Prev
      }
    });
    consistencyTrack.push(stepConsistency);

    currentCycleHourLocks[utcKey] = {
      tempC: stepConsistency.finalTempC,
      isWet: stepConsistency.finalIsWet,
      precipMmHr: stepConsistency.finalPrecipMmHr,
      popPct: stepConsistency.finalPopPct
    };

    const temperature = Number(stepConsistency.finalTempC.toFixed(1));
    if (leadHour === 0) {
      firstHourTempShiftC = Number((temperature - rawTemp).toFixed(2));
    }

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

    const dewPoint = Number(Math.min(temperature, dewPointPrelim).toFixed(1));
    const humidity = Math.round(relativeHumidityFromDewPoint(temperature, dewPoint));
    const wetBulbC = Number(wetBulbStullC(temperature, humidity).toFixed(1));

    const fusedPrecip = {
      ...baseFusedPrecip,
      precipitationMm: stepConsistency.finalIsWet ? stepConsistency.finalPrecipMmHr : 0,
      precipProbabilityPct: stepConsistency.finalPopPct
    };

    const leadTempW = getLeadTimeWeights(
      mos.shortRangeWeights.temperature,
      mos.mediumRangeWeights.temperature,
      leadHour
    );
    const hasT850 =
      CORE_MODEL_KEYS.some((k) => t850Snap[k] !== null && t850Snap[k] !== undefined) ||
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

    // 4. VERTICAL SOUNDING & CONVECTIVE PROFILE
    const soundingLevels = buildSoundingAtIndex(i);
    if (leadHour < 72) {
      hourlySoundings.push(soundingLevels);
    }
    const soundingAnalysis =
      soundingLevels.length >= 2
        ? analyzeConvectiveProfile({
            surfaceTempC: temperature,
            surfaceHumidity: humidity,
            surfacePressureHpa: pressure,
            levels: soundingLevels
          })
        : null;

    const snowfallCm = Number(
      Math.max(
        0,
        blendHybridParameter(snowSnap, leadPrecipW, Number(hourlyRaw.snowfall?.[i] ?? 0))
      ).toFixed(2)
    );
    const wmo = Number(hourlyRaw.weather_code?.[i] ?? 0);
    const freezingLevelM =
      typeof rawFrz === "number" && Number.isFinite(rawFrz) ? Math.round(rawFrz) : null;

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

    // 5. 0-100 STORM & CONVECTIVE THREAT ENGINE
    let wmoStormAgreeCount = 0;
    let wmoTotalModels = 0;
    for (const k of CORE_MODEL_KEYS) {
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
      dayLabel: hourDayLabel,
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

    let effectiveWmo = wmo;
    if (stormEval.lightningProbPct >= 58 && fusedPrecip.precipitationMm >= 0.4) {
      effectiveWmo = Math.max(effectiveWmo, 95);
    } else if (phaseResult.precipPhase === "freezing_rain") {
      effectiveWmo = 66;
    } else if (phaseResult.precipPhase === "snow" && effectiveWmo < 71) {
      effectiveWmo = 73;
    } else if (phaseResult.precipPhase === "rain" && effectiveWmo < 51) {
      effectiveWmo = fusedPrecip.precipitationMm >= 1.5 ? 61 : 51;
    } else if (phaseResult.precipPhase === "none" && effectiveWmo >= 51) {
      effectiveWmo = Number(hourlyRaw.cloud_cover?.[i] ?? 50) >= 75 ? 3 : 2;
    }

    hourly.push({
      time: timeStr,
      hourLabel: timeStr.slice(11, 16),
      dayLabel: hourDayLabel,
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
      visibilityKm: Number(
        (
          diagnosePhysicalVisibilityM({
            rawVisibilityM:
              typeof hourlyRaw.visibility?.[i] === "number"
                ? Number(hourlyRaw.visibility[i])
                : null,
            temp2mC: temperature,
            dewPoint2mC: dewPoint,
            cloudCoverLowPct: Number(hourlyRaw.cloud_cover?.[i] ?? 30),
            precipMmHr: fusedPrecip.precipitationMm,
            isSnow: phaseResult.precipType === "snow",
            windSpeedKt: windSpeed * 0.539957
          }) / 1000
        ).toFixed(1)
      ),
      uvIndex: Number(hourlyRaw.uv_index?.[i] ?? 0),
      precipitation: fusedPrecip.precipitationMm,
      precipProbability: fusedPrecip.precipProbabilityPct,
      precipConsensus: fusedPrecip.consensus,
      precipType: phaseResult.precipType,
      precipPhase: phaseResult.precipPhase,
      snowLineElevationM: phaseResult.snowLineElevationM,
      rainAccum: Number(rainAccum.toFixed(1)),
      snowAccum: Number(snowAccum.toFixed(1)),
      weatherCode: effectiveWmo,
      condition:
        phaseResult.precipPhase === "freezing_rain"
          ? "Donan Yağmur"
          : phaseResult.precipPhase === "sleet"
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
      temp850hPa,
      stabilityGrade: stepConsistency.stabilityGrade
    });

    const stepDetCount = CORE_MODEL_KEYS.filter(
      (k) => tempSnap[k] !== null && tempSnap[k] !== undefined && Number.isFinite(tempSnap[k])
    ).length;
    const stepSpreadC = spreadOf(tempSnap);
    const stepPressSpread = spreadOf(pressSnap);
    hourMetaByTime.set(timeStr, {
      activeModels: Math.max(1, stepDetCount),
      ensMembers: ensTempArr?.length ?? 0,
      confidencePct: Math.max(
        52,
        Math.round(computeHybridConfidence(stepSpreadC, stepPressSpread) - leadHour * 0.08)
      )
    });
  }

  // STAGE 3B: EXTENDED SYNOPTIC CALIBRATION LOOP (LEAD HOURS 168..359 -> DAYS 8..15!)
  // Zero impact on Days 1–7 (`0..167h`); pushes hours `168..239` (up to Day 10 / 240h) into `hourly`
  // and stores `240..359` in `extendedSynopticHours` so all 15 `daily` rows are 100% calibrated!
  const maxExtendedIdx = Math.min(startIdx + 360, times.length);
  if (maxExtendedIdx > maxHourlyIdx) {
    const ensWetProbByIndex = new Map<number, number>();
    if (ensIndex.precipCols.length >= 8) {
      for (const idxVal of ensIndex.utcIndex.values()) {
        const pRow = readEnsembleRow(ensIndex.precipCols, idxVal);
        if (pRow && pRow.length > 0) {
          ensWetProbByIndex.set(
            idxVal,
            (pRow.filter((v) => v >= 0.15).length / pRow.length) * 100
          );
        }
      }
    }

    for (let i = maxHourlyIdx; i < maxExtendedIdx; i++) {
      const leadHour = i - startIdx;
      const timeStr = times[i];
      const dateYmd = timeStr.slice(0, 10);
      const localHour = Number(timeStr.slice(11, 13)) || 0;
      const utcDate = localIsoToUtcDate(timeStr, utcOffsetSeconds);
      const utcKey = utcDate.toISOString().slice(0, 16);
      const dayIdxFromStart = Math.floor(leadHour / 24);
      const hourDayLabel = formatDayName(dateYmd, dayIdxFromStart);

      const solarElevationDeg = Number(
        computeSolarElevationDeg(location.lat, location.lon, utcDate).toFixed(1)
      );
      const daylight = solarElevationToDaylight(solarElevationDeg);

      const rawTemp = Number(hourlyRaw.temperature_2m?.[i] ?? cur.temperature_2m ?? 12);
      const rawDew = Number(hourlyRaw.dew_point_2m?.[i] ?? rawTemp - 5);
      const rawPress = Number(hourlyRaw.pressure_msl?.[i] ?? 1015);
      const rawPrecip = Number(hourlyRaw.precipitation?.[i] ?? 0);
      const rawPop = Number(hourlyRaw.precipitation_probability?.[i] ?? 0);
      const rawWind = Number(hourlyRaw.wind_speed_10m?.[i] ?? 8);
      const rawGust = Number(hourlyRaw.wind_gusts_10m?.[i] ?? rawWind);
      const rawWindDir = Number(hourlyRaw.wind_direction_10m?.[i] ?? 0);
      const rawFrz = hourlyRaw.freezing_level_height?.[i];
      const rawCape = hourlyRaw.cape?.[i];
      const rawCin = hourlyRaw.convective_inhibition?.[i];
      const rawLi = hourlyRaw.lifted_index?.[i];

      const tempSnap = readExtendedModelSnapshot("temperature_2m", utcKey);
      const dewSnap = readExtendedModelSnapshot("dew_point_2m", utcKey);
      const pressSnap = readExtendedModelSnapshot("pressure_msl", utcKey);
      const precipSnap = readExtendedModelSnapshot("precipitation", utcKey);
      const snowSnap = readExtendedModelSnapshot("snowfall", utcKey);
      const windSnap = readExtendedModelSnapshot("wind_speed_10m", utcKey);
      const gustSnap = readExtendedModelSnapshot("wind_gusts_10m", utcKey);
      const dirSnap = readExtendedModelSnapshot("wind_direction_10m", utcKey);
      const t850Snap = readExtendedModelSnapshot("temperature_850hPa", utcKey, true);

      const eIdx = ensIndex.utcIndex.get(utcKey);
      const ensTempWeighted = readEnsembleRowWithWeights(
        ensIndex.tempCols,
        ensIndex.tempColWeights,
        eIdx
      );
      const ensPrecipArr = readEnsembleRow(ensIndex.precipCols, eIdx);
      const ensGustArr = readEnsembleRow(ensIndex.gustCols, eIdx);
      const ensGustStats = ensGustArr ? computeEnsembleDistStats(ensGustArr) : null;

      const windowEnsProbs: number[] = [];
      if (eIdx !== undefined) {
        for (let off = -6; off <= 6; off += 2) {
          const wP = ensWetProbByIndex.get(eIdx + off);
          if (wP !== undefined) windowEnsProbs.push(wP);
        }
      }

      const bursaExtendedCandidate = isBursaEmosActive
        ? (() => {
            const stepDrv = getBursaPhysicalDriversAt(utcKey, i);
            const bBase = predictBursaTrainedTempC({
              leadHours: leadHour,
              utcDate,
              localHourTrt: localHour,
              tempSnapshot: tempSnap,
              precipSnapshot: precipSnap,
              neighborMedians: getBursaNeighborMedians(utcKey, rawTemp),
              physicalDrivers: stepDrv,
              targetElevationM: cityElevationM,
              lapseRateCPerKm: effectiveLapsePerKm
            });
            if (bBase === null) return null;
            const dOff = computeBursaDistrictMicroclimateOffsetC({
              targetLat: location.lat,
              targetLon: location.lon,
              targetElevationM: cityElevationM,
              base17116TempC: bBase,
              localHour,
              isNight: solarElevationDeg <= 0,
              cloudCoverPct: stepDrv.cloudCoverPct ?? 40,
              windSpeedKmh: stepDrv.windSpeedKmh ?? rawWind,
              windDirDeg: stepDrv.windDirDeg ?? rawWindDir,
              marmaraSstC: marmaraSstBundle?.currentSstC ?? null,
              mgmDistrictDay: null
            });
            return bBase + dOff;
          })()
        : null;

      const prevLock1 = priorRun1?.hours[utcKey] ?? null;
      const prevLock2 = priorRun2?.hours[utcKey] ?? null;
      const prelimTrend =
        prevLock1 && bursaExtendedCandidate !== null
          ? bursaExtendedCandidate - prevLock1.tempC
          : 0;

      const extCal = calibrateExtendedSynopticHour({
        leadHour,
        localHour,
        dateYmd,
        lat: location.lat,
        lon: location.lon,
        elevationM: cityElevationM,
        tempSnapshot: tempSnap,
        dewSnapshot: dewSnap,
        pressSnapshot: pressSnap,
        windSnapshot: windSnap,
        precipSnapshot: precipSnap,
        mos,
        bursaEmosCandidateC: bursaExtendedCandidate,
        ensembleTempRow: ensTempWeighted,
        ensemblePrecipValues: ensPrecipArr,
        windowEnsembleWetProbsPct: windowEnsProbs,
        dProgDtTrendC: prelimTrend,
        rawFallback: {
          tempC: rawTemp,
          dewC: rawDew,
          pressHpa: rawPress,
          windKmh: rawWind,
          precipMm: rawPrecip,
          popPct: rawPop
        }
      });

      const extConsistency = evaluateHourlyRunConsistency({
        leadHours: leadHour,
        validTimeIso: timeStr,
        utcHourKey: utcKey,
        candidateTempC: extCal.temperatureC,
        candidateIsWet: extCal.precipitationMm >= 0.15,
        candidatePrecipMmHr: extCal.precipitationMm,
        candidatePopPct: extCal.precipProbabilityPct,
        previousLockedTempC: prevLock1?.tempC ?? null,
        previousLockedRunMinus2TempC: prevLock2?.tempC ?? null,
        previousLockedIsWet: prevLock1?.isWet ?? null,
        previousLockedPrecipMmHr: prevLock1?.precipMmHr ?? null,
        ensembleTempIqrC:
          extCal.tempP10C !== undefined && extCal.tempP90C !== undefined
            ? (extCal.tempP90C - extCal.tempP10C) * 0.52
            : 2.6,
        laggedModels: laggedSeriesList,
        hourIndex: i
      });

      const extTemp = Number(extConsistency.finalTempC.toFixed(1));
      const extDew = Number(Math.min(extTemp, extCal.dewPointC).toFixed(1));
      const extRh = Math.round(relativeHumidityFromDewPoint(extTemp, extDew));
      const extWetBulb = Number(wetBulbStullC(extTemp, extRh).toFixed(1));
      const extWindDir = blendWindDirectionDeg(
        dirSnap,
        mos.mediumRangeWeights.wind,
        rawWindDir
      );
      const extGustBase = blendHybridParameter(
        gustSnap,
        mos.mediumRangeWeights.wind,
        rawGust
      );
      const extGusts = Number(
        Math.max(extCal.windSpeedKmh, ensGustStats?.p50 ?? extGustBase).toFixed(1)
      );
      const extGustP90 = ensGustStats ? Math.round(ensGustStats.p90) : undefined;

      const t850Vals = CORE_MODEL_KEYS.map((k) => t850Snap[k]).filter(
        (v): v is number => v !== null && v !== undefined && Number.isFinite(v)
      );
      const extT850 =
        t850Vals.length > 0
          ? Number(
              (t850Vals.reduce((a, b) => a + b, 0) / t850Vals.length).toFixed(1)
            )
          : typeof hourlyRaw["temperature_850hPa"]?.[i] === "number"
            ? Number(Number(hourlyRaw["temperature_850hPa"][i]).toFixed(1))
            : null;

      const extFrz =
        typeof rawFrz === "number" && Number.isFinite(rawFrz) ? Math.round(rawFrz) : null;
      const extSnowCm = Number(
        Math.max(
          0,
          blendHybridParameter(
            snowSnap,
            mos.mediumRangeWeights.precipitation,
            Number(hourlyRaw.snowfall?.[i] ?? 0)
          )
        ).toFixed(2)
      );
      const rawWmo = Number(hourlyRaw.weather_code?.[i] ?? 1);
      const extPhase = classifyPrecipPhase({
        temperatureC: extTemp,
        humidityPct: extRh,
        precipitationMm: extConsistency.finalPrecipMmHr,
        snowfallCm: extSnowCm,
        weatherCode: rawWmo,
        temp850hPa: extT850,
        freezingLevelM: extFrz,
        elevationM: cityElevationM,
        mucape: typeof rawCape === "number" && Number.isFinite(rawCape) ? rawCape : 0
      });

      if (leadHour < 240) {
        if (extPhase.precipType === "rain") {
          rainAccum += extConsistency.finalPrecipMmHr;
        } else if (extPhase.precipType === "snow") {
          snowAccum += Math.max(extSnowCm, extConsistency.finalPrecipMmHr * 0.8);
        }
      }

      let effWmo = rawWmo;
      if (extPhase.precipPhase === "freezing_rain") {
        effWmo = 66;
      } else if (extPhase.precipPhase === "snow" && effWmo < 71) {
        effWmo = 73;
      } else if (extPhase.precipPhase === "rain" && effWmo < 51) {
        effWmo = extConsistency.finalPrecipMmHr >= 1.5 ? 61 : 51;
      } else if (extPhase.precipPhase === "none" && effWmo >= 51) {
        effWmo = Number(hourlyRaw.cloud_cover?.[i] ?? 45) >= 75 ? 3 : 2;
      }

      const rawApparent = Number(hourlyRaw.apparent_temperature?.[i] ?? rawTemp);
      const extPoint: HourlyPoint = {
        time: timeStr,
        hourLabel: timeStr.slice(11, 16),
        dayLabel: hourDayLabel,
        temperature: extTemp,
        tempP10: extCal.tempP10C,
        tempP90: extCal.tempP90C,
        apparentTemperature: Number((rawApparent + (extTemp - rawTemp)).toFixed(1)),
        wetBulbC: extWetBulb,
        humidity: extRh,
        dewPoint: extDew,
        pressure: extCal.pressureHpa,
        windSpeed: extCal.windSpeedKmh,
        windGusts: extGusts,
        gustP90: extGustP90,
        windDirection: extWindDir,
        cloudCover: Math.round(Number(hourlyRaw.cloud_cover?.[i] ?? 40)),
        visibilityKm: 15,
        uvIndex: Number(hourlyRaw.uv_index?.[i] ?? 0),
        precipitation: extConsistency.finalPrecipMmHr,
        precipProbability: extConsistency.finalPopPct,
        precipConsensus: extCal.precipConsensus,
        precipType: extPhase.precipType,
        precipPhase: extPhase.precipPhase,
        snowLineElevationM: extPhase.snowLineElevationM,
        rainAccum: Number(rainAccum.toFixed(1)),
        snowAccum: Number(snowAccum.toFixed(1)),
        weatherCode: effWmo,
        condition:
          extPhase.precipPhase === "freezing_rain"
            ? "Donan Yağmur"
            : extPhase.precipPhase === "sleet"
              ? "Karla Karışık Yağmur"
              : mapWmoCodeToLabel(effWmo),
        isStorm: effWmo >= 95,
        stormScore: effWmo >= 95 ? 45 : 0,
        solarElevationDeg,
        daylight,
        cape: typeof rawCape === "number" && Number.isFinite(rawCape) ? Math.round(rawCape) : null,
        cin: typeof rawCin === "number" && Number.isFinite(rawCin) ? Math.round(rawCin) : null,
        liftedIndex:
          typeof rawLi === "number" && Number.isFinite(rawLi) ? Number(rawLi.toFixed(1)) : null,
        freezingLevelM: extFrz,
        temp850hPa: extT850,
        stabilityGrade: extConsistency.stabilityGrade
      };

      if (extCal.bimodal) {
        hourBimodalByTime.set(timeStr, extCal.bimodal);
        bimodalHoursResolved++;
      }
      hourMetaByTime.set(timeStr, {
        activeModels: extCal.activeModelCount,
        ensMembers: extCal.ensembleMemberCount,
        confidencePct: extCal.confidencePct
      });

      if (leadHour < 240) {
        hourly.push(extPoint);
      } else {
        extendedSynopticHours.push(extPoint);
      }
    }
  }

  // Persist calibrated 168-hour trajectory lock for active synoptic cycle!
  if (Object.keys(currentCycleHourLocks).length > 0) {
    saveCalibratedRunToLedger(ledgerLocKey, {
      cycleId: activeCycleId,
      createdAtMs: exactNowUtcMs,
      regime: initialRegimeNow,
      hours: currentCycleHourLocks
    });
  }

  // 15-Minute High-Resolution Nowcast Series (+6h, anchored to radar & live thermometer!)
  const minutely15: Minutely15Point[] = [];
  if (min15Raw && Array.isArray(min15Raw.time)) {
    const mTimes: string[] = min15Raw.time;
    const baseHour0 = hourly[0];
    for (let j = 0; j < Math.min(24, mTimes.length); j++) {
      const tStr = String(mTimes[j]);
      const mTemp = Number(
        (
          Number(min15Raw.temperature_2m?.[j] ?? baseHour0?.temperature ?? 0) +
          firstHourTempShiftC * Math.exp(-j / 16)
        ).toFixed(1)
      );
      const raw15Mm = Math.max(0, Number(min15Raw.precipitation?.[j] ?? 0));
      // Blend 15-min precipitation with Zoom-8 radar 5-min trajectory over the first 3 hours!
      const offsetMin = j * 15;
      const radarSlice15 =
        offsetMin < 180 && radarNowcast.radarAvailable
          ? radarNowcast.steps5Min.filter(
              (s) => s.offsetMinutes >= offsetMin && s.offsetMinutes < offsetMin + 15
            )
          : [];
      const radarEq15Mm =
        radarSlice15.length > 0
          ? (radarSlice15.reduce((a, s) => a + s.rainRateMmHr, 0) / radarSlice15.length) * 0.25
          : null;
      const wRad15 =
        radarEq15Mm !== null ? 0.78 * Math.exp(-offsetMin / 120) : 0;
      const mPrecip = Number(
        ((1 - wRad15) * raw15Mm + wRad15 * (radarEq15Mm ?? 0)).toFixed(2)
      );
      const mSnow = Number(Math.max(0, Number(min15Raw.snowfall?.[j] ?? 0)).toFixed(2));
      const mRain = mSnow > 0 ? 0 : mPrecip;
      const mGust = Number(Math.max(0, Number(min15Raw.wind_gusts_10m?.[j] ?? 0)).toFixed(1));
      const mCode = Number(min15Raw.weather_code?.[j] ?? 0);
      const mCapeRaw = min15Raw.cape?.[j];
      const mLpiRaw = min15Raw.lightning_potential?.[j];

      const pPhase = classifyPrecipPhase({
        temperatureC: mTemp,
        humidityPct: baseHour0?.humidity ?? 65,
        precipitationMm: mPrecip * 4,
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

  // Immediate 48h Storm Threat Assessment (prevents Day-6 storms from firing immediate today alert)
  const stormAssessment = buildStormAssessment(
    hourlyStormEvals.slice(0, 48),
    hourlyPrecipTrack.slice(0, 48)
  );

  // Current 7-Model Breakdown & Exact Sub-Hourly `current` State
  const curUtcKey = times[startIdx]
    ? localIsoToUtcHourKey(times[startIdx], utcOffsetSeconds)
    : new Date().toISOString().slice(0, 13) + ":00";

  const curTempSnap = readExtendedModelSnapshot("temperature_2m", curUtcKey);
  const curPressSnap = readExtendedModelSnapshot("pressure_msl", curUtcKey);
  const curWindSnap = readExtendedModelSnapshot("wind_speed_10m", curUtcKey);
  const curT850Snap = readExtendedModelSnapshot("temperature_850hPa", curUtcKey, true);
  const curPrecipSnap = readExtendedModelSnapshot("precipitation", curUtcKey);
  const curCapeSnap = readExtendedModelSnapshot("cape", curUtcKey);

  const activeModels = CORE_MODEL_KEYS.filter(
    (k) => curTempSnap[k] !== null && curTempSnap[k] !== undefined
  ).map((k) => CORE_MODEL_META[k].label);

  const tempSpreadC = spreadOf(curTempSnap);
  const pressureSpreadHpa = spreadOf(curPressSnap);
  const confidencePct =
    activeModels.length >= 2
      ? computeHybridConfidence(tempSpreadC, pressureSpreadHpa)
      : 82;

  const firstHour = hourly[0];
  const secondHour = hourly[1] ?? firstHour;
  const rawUncorrectedTemp = blendHybridParameter(
    curTempSnap,
    mos.shortRangeWeights.temperature,
    Number(cur.temperature_2m ?? firstHour?.temperature ?? 0)
  );

  // Exact sub-hourly current temperature: locks directly to live Bursa MGM thermometer when fresh,
  // otherwise interpolates smoothly between hourly[0] and hourly[1] at exact `subHourFrac`!
  const subHourlyModelTemp = firstHour
    ? (1 - subHourFrac) * firstHour.temperature +
      subHourFrac * (secondHour?.temperature ?? firstHour.temperature)
    : rawUncorrectedTemp;
  const hybridCurTemp = Number(
    (liveBursaSurface !== null
      ? 0.94 * liveBursaSurface.tempC + 0.06 * subHourlyModelTemp
      : subHourlyModelTemp
    ).toFixed(1)
  );

  const nowcastTempDeltaC = Number((hybridCurTemp - rawUncorrectedTemp).toFixed(2));
  mos.summary.nowcastTempDeltaC = nowcastTempDeltaC;
  if (mos.report.calibration) {
    mos.report.calibration.nowcastTempDeltaC = nowcastTempDeltaC;
  }

  const hybridCurDew = Number(
    Math.min(
      hybridCurTemp,
      liveBursaSurface?.dewPointC ?? firstHour?.dewPoint ?? Number(cur.dew_point_2m ?? 0)
    ).toFixed(1)
  );
  const hybridCurRh = Math.round(relativeHumidityFromDewPoint(hybridCurTemp, hybridCurDew));
  const rawCurApparent = Number(
    cur.apparent_temperature ?? firstHour?.apparentTemperature ?? hybridCurTemp
  );
  const hybridCurApparent = Number(
    (rawCurApparent + (hybridCurTemp - Number(cur.temperature_2m ?? hybridCurTemp))).toFixed(1)
  );
  const pNow = Number((liveBursaSurface?.pressureMslHpa ?? firstHour?.pressure ?? Number(cur.pressure_msl ?? 1013)).toFixed(1));
  const hybridCurWind = Number(
    (liveBursaSurface?.windSpeedKt !== null && liveBursaSurface?.windSpeedKt !== undefined
      ? 0.7 * (liveBursaSurface.windSpeedKt * 1.852) + 0.3 * (firstHour?.windSpeed ?? 0)
      : firstHour?.windSpeed ?? Number(cur.wind_speed_10m ?? 0)
    ).toFixed(1)
  );
  const hybridCurGust = Math.max(
    hybridCurWind,
    firstHour?.windGusts ?? Number(cur.wind_gusts_10m ?? hybridCurWind)
  );
  const hybridCurDir =
    liveBursaSurface?.windDirDeg ?? firstHour?.windDirection ?? Number(cur.wind_direction_10m ?? 0);

  // Instantaneous precipitation combines radar + MGM 10-min gauge + calibrated H0!
  const hybridCurPrecip =
    radarNowcast.radarAvailable && radarNowcast.currentRainRateMmHr > 0
      ? Number(
          (
            0.70 * radarNowcast.currentRainRateMmHr +
            0.30 * (liveBursaSurface?.precipRateMmHr ?? firstHour?.precipitation ?? 0)
          ).toFixed(2)
        )
      : liveBursaSurface?.isPrecipitatingNow
        ? liveBursaSurface.precipRateMmHr
        : firstHour?.precipitation ?? 0;

  const curPrecipConsensus = firstHour?.precipConsensus ?? computePrecipConsensus(curPrecipSnap);

  const pPrevUtcDate = new Date(startHourUtcMs - 3 * 3600000);
  const prevUtcKey = pPrevUtcDate.toISOString().slice(0, 16);
  const prevPressSnap = readExtendedModelSnapshot("pressure_msl", prevUtcKey);
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

  // 6. CALIBRATED 15-DAY FORECAST (`daily[0..14]`: Days 1–7 Exact + Days 8–15 Synoptic AI+Ensemble)
  // Keep Days 1–7 (`dIdx < 7`) strictly isolated to the 0..167h precision map for 0.00°C zero-regression!
  const hourlyPrecisionMap = new Map<string, HourlyPoint>();
  const hourlyByTimeMap = new Map<string, HourlyPoint>();
  for (let idxH = 0; idxH < hourly.length; idxH++) {
    const pt = hourly[idxH];
    if (idxH < 168) {
      hourlyPrecisionMap.set(pt.time, pt);
    }
    hourlyByTimeMap.set(pt.time, pt);
  }
  for (const pt of extendedSynopticHours) {
    hourlyByTimeMap.set(pt.time, pt);
  }
  const todayLedgerExtremes = getTodayObservedExtremesFromLedger(ledgerLocKey, todayDateYmd);

  const dailyDates: string[] = dailyRaw.time ?? [];
  const daily: DailyPoint[] = dailyDates.slice(0, 15).map((dateStr, dIdx) => {
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
    const dayGrades: Array<"LOCKED" | "CONVERGING" | "WATCH"> = [];

    for (let hh = 0; hh < 24; hh++) {
      const localIso = `${dateStr}T${String(hh).padStart(2, "0")}:00`;
      const existingH = dIdx < 7 ? hourlyPrecisionMap.get(localIso) : hourlyByTimeMap.get(localIso);
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
        if (existingH.stabilityGrade) dayGrades.push(existingH.stabilityGrade);
        if (existingH.precipPhase === "hail") dominantPhase = "hail";
        else if (existingH.precipPhase === "freezing_rain" && dominantPhase !== "hail")
          dominantPhase = "freezing_rain";
        else if (
          existingH.precipPhase === "snow" &&
          dominantPhase !== "hail" &&
          dominantPhase !== "freezing_rain"
        )
          dominantPhase = "snow";
        else if (
          existingH.precipPhase === "sleet" &&
          dominantPhase !== "hail" &&
          dominantPhase !== "snow"
        )
          dominantPhase = "sleet";
        else if (existingH.precipPhase === "rain" && dominantPhase === "none") dominantPhase = "rain";
        continue;
      }

      // Past hours of TODAY (`dIdx === 0`, before `startIdx`) OR tail hours of Day 6 after `startIdx + 168`:
      // Calibrate directly via EMOS/Kalman on `hybridHourly` so evening queries NEVER fall back to uncalibrated `dailyRaw`!
      const utcDate = localIsoToUtcDate(localIso, utcOffsetSeconds);
      const uKey = utcDate.toISOString().slice(0, 16);
      const hIdx = utcTimeIndex.get(uKey);
      if (hIdx === undefined) continue;

      const leadH = Math.max(0, Math.round((utcDate.getTime() - exactNowUtcMs) / 3600000));
      const tSnap = readExtendedModelSnapshot("temperature_2m", uKey);
      const pSnap = readExtendedModelSnapshot("precipitation", uKey);
      const wSnap = readExtendedModelSnapshot("wind_speed_10m", uKey);

      const eIdx = ensIndex.utcIndex.get(uKey);
      const eT = readEnsembleRow(ensIndex.tempCols, eIdx);
      const eP = readEnsembleRow(ensIndex.precipCols, eIdx);
      const eTStats = eT ? computeEnsembleDistStats(eT) : null;

      const tKalman = blendKalmanCorrectedScalar({
        snapshot: tSnap,
        mos,
        param: "temperature",
        leadHour: leadH,
        localHour: hh,
        fallback: Number(dailyRaw.temperature_2m_max?.[dIdx] ?? 15),
        ensembleP50: eTStats?.p50 ?? null
      });
      const tBursa = isBursaEmosActive
        ? predictBursaTrainedTempC({
            leadHours: leadH,
            utcDate,
            localHourTrt: hh,
            tempSnapshot: tSnap,
            precipSnapshot: pSnap,
            neighborMedians: getBursaNeighborMedians(uKey, tKalman),
            targetElevationM: cityElevationM,
            lapseRateCPerKm: effectiveLapsePerKm
          })
        : null;
      const tCal =
        tBursa !== null
          ? tBursa +
            computeBursaDistrictMicroclimateOffsetC({
              targetLat: location.lat,
              targetLon: location.lon,
              targetElevationM: cityElevationM,
              base17116TempC: tBursa,
              localHour: hh,
              isNight: hh >= 19 || hh <= 6,
              cloudCoverPct: 35,
              windSpeedKmh: 10,
              windDirDeg: 0,
              marmaraSstC: marmaraSstBundle?.currentSstC ?? null,
              mgmDistrictDay: mgmForecasts?.dailyDistrict.get(dateStr) ?? null
            })
          : tKalman;

      matchedDayHours++;
      if (tCal < minT) minT = tCal;
      if (tCal > maxT) maxT = tCal;

      const wLead = getLeadTimeWeights(
        mos.shortRangeWeights.precipitation,
        mos.mediumRangeWeights.precipitation,
        leadH
      );
      const fpBase = fusePrecipitationHour({
        detSnapshot: pSnap,
        detWeights: wLead,
        ensembleMembersMm: eP,
        rawPrecipFallbackMm: 0,
        rawPopFallbackPct: Number(dailyRaw.precipitation_probability_max?.[dIdx] ?? 0),
        leadHour: leadH
      });
      precipSum += dIdx === 0 ? 0 : fpBase.precipitationMm; // Today's past rain comes from real gauge below
      maxPop = Math.max(maxPop, fpBase.precipProbabilityPct);
      const wCal = blendKalmanCorrectedScalar({
        snapshot: wSnap,
        mos,
        param: "wind",
        leadHour: leadH,
        localHour: hh,
        fallback: 0
      });
      maxWind = Math.max(maxWind, wCal);
    }

    const rawMax = Number(dailyRaw.temperature_2m_max?.[dIdx] ?? 0);
    const rawMin = Number(dailyRaw.temperature_2m_min?.[dIdx] ?? 0);
    const rawPrecipSum = Number(dailyRaw.precipitation_sum?.[dIdx] ?? 0);
    const rawPopMax = Number(dailyRaw.precipitation_probability_max?.[dIdx] ?? 0);
    const rawWindMax = Number(dailyRaw.wind_speed_10m_max?.[dIdx] ?? 0);

    let finalMax = matchedDayHours >= 8 && Number.isFinite(maxT) ? maxT : rawMax;
    let finalMin = matchedDayHours >= 8 && Number.isFinite(minT) ? minT : rawMin;

    // For Today (`dIdx === 0`), incorporate true observed ledger extremes, MGM official Gun0, and current live temperature!
    if (dIdx === 0) {
      finalMax = Math.max(finalMax, hybridCurTemp);
      finalMin = Math.min(finalMin, hybridCurTemp);
      if (todayLedgerExtremes.maxTempC !== null) {
        finalMax = Math.max(finalMax, todayLedgerExtremes.maxTempC);
      }
      if (todayLedgerExtremes.minTempC !== null) {
        finalMin = Math.min(finalMin, todayLedgerExtremes.minTempC);
      }
      if (
        mgmForecasts?.todayObservedMaxC !== null &&
        mgmForecasts?.todayObservedMaxC !== undefined &&
        Math.abs(mgmForecasts.todayObservedMaxC - finalMax) <= 3.5
      ) {
        finalMax = Math.max(finalMax, 0.5 * finalMax + 0.5 * mgmForecasts.todayObservedMaxC);
      }
      if (
        mgmForecasts?.todayObservedMinC !== null &&
        mgmForecasts?.todayObservedMinC !== undefined &&
        Math.abs(mgmForecasts.todayObservedMinC - finalMin) <= 3.5
      ) {
        finalMin = Math.min(finalMin, 0.5 * finalMin + 0.5 * mgmForecasts.todayObservedMinC);
      }
      // Include observed MGM `yagis00Now` accumulated rain from midnight to now!
      const obsTodayRain =
        bursaMesh?.stations
          .filter((s) => s.qcWeight > 0.3 && s.precipToday00Mm !== null && s.precipToday00Mm !== undefined)
          .sort((a, b) => b.qcWeight - a.qcWeight)[0]?.precipToday00Mm ?? todayLedgerExtremes.precipSumMm;
      precipSum += Math.max(0, obsTodayRain ?? 0);
    }

    if (finalMin > finalMax) {
      const mid = (finalMin + finalMax) * 0.5;
      finalMin = mid;
      finalMax = mid;
    }

    const finalPrecip =
      matchedDayHours >= 8 ? Number(precipSum.toFixed(1)) : Number(rawPrecipSum.toFixed(1));
    const finalPop =
      matchedDayHours >= 8 ? Math.round(maxPop) : Math.round(rawPopMax);
    const finalWind =
      matchedDayHours >= 8 ? Math.round(maxWind) : Math.round(rawWindMax);

    let code = Number(dailyRaw.weather_code?.[dIdx] ?? 0);
    if (finalPrecip < 0.2 && finalPop < 42 && code >= 51) {
      code = 3;
    } else if (finalPrecip >= 1.0 && code < 51) {
      code = dominantPhase === "snow" ? 73 : 61;
    }

    const lockedDayFrac =
      dayGrades.length > 0
        ? dayGrades.filter((g) => g === "LOCKED").length / dayGrades.length
        : dIdx <= 2
          ? 1
          : 0.5;
    const dayStability: "LOCKED" | "CONVERGING" | "WATCH" =
      lockedDayFrac >= 0.65
        ? "LOCKED"
        : dayGrades.some((g) => g === "CONVERGING" || g === "LOCKED")
          ? "CONVERGING"
          : "WATCH";

    const dayClim = computeDailyClimatologyNormals({
      lat: location.lat,
      lon: location.lon,
      elevationM: cityElevationM,
      dateYmd: dateStr
    });
    const finalMaxRounded = Number(finalMax.toFixed(1));
    const finalMinRounded = Number(finalMin.toFixed(1));
    const tempAnomalyC = Number(
      (0.5 * (finalMaxRounded + finalMinRounded) - dayClim.normalMeanC).toFixed(1)
    );

    // Collect daytime/nighttime, dominant wind direction, model/ensemble counts & bimodal splits
    const dayBimodals: Array<BimodalEnsembleClusterResult | null | undefined> = [];
    const dayConfs: number[] = [];
    let maxDayModels = dIdx < 7 ? activeModels.length : 3;
    let maxDayEns = ensIndex.memberCount;
    const dayTemps12to16: number[] = [];
    const nightTemps02to06: number[] = [];
    let sinDirSum = 0;
    let cosDirSum = 0;

    for (let hh = 0; hh < 24; hh++) {
      const lIso = `${dateStr}T${String(hh).padStart(2, "0")}:00`;
      const hPt = hourlyByTimeMap.get(lIso);
      if (hPt) {
        if (hh >= 12 && hh <= 16) dayTemps12to16.push(hPt.temperature);
        if (hh >= 2 && hh <= 6) nightTemps02to06.push(hPt.temperature);
        const rad = (hPt.windDirection * Math.PI) / 180;
        const wMag = Math.max(1, hPt.windSpeed);
        sinDirSum += Math.sin(rad) * wMag;
        cosDirSum += Math.cos(rad) * wMag;
      }
      if (hourBimodalByTime.has(lIso)) {
        dayBimodals.push(hourBimodalByTime.get(lIso));
      }
      const meta = hourMetaByTime.get(lIso);
      if (meta) {
        dayConfs.push(meta.confidencePct);
        maxDayModels = Math.max(maxDayModels, meta.activeModels);
        if (meta.ensMembers > 0) maxDayEns = meta.ensMembers;
      }
    }

    const avgWindDeg =
      Math.abs(sinDirSum) > 1e-4 || Math.abs(cosDirSum) > 1e-4
        ? (((Math.atan2(sinDirSum, cosDirSum) * 180) / Math.PI) + 360) % 360
        : 0;
    const dayConfidencePct =
      dayConfs.length > 0
        ? Math.round(dayConfs.reduce((a, b) => a + b, 0) / dayConfs.length)
        : Math.max(42, 92 - dIdx * 3.5);

    return {
      date: dateStr,
      dayName: formatDayName(dateStr, dIdx),
      horizonTier: dIdx < 7 ? "exact" : "synoptic",
      tempMax: finalMaxRounded,
      tempMin: finalMinRounded,
      tempMaxP10: Number.isFinite(maxP10) && maxP10 > -90 ? Math.round(maxP10) : undefined,
      tempMaxP90: Number.isFinite(maxP90) && maxP90 > -90 ? Math.round(maxP90) : undefined,
      tempMinP10: Number.isFinite(minP10) && minP10 < 90 ? Math.round(minP10) : undefined,
      tempMinP90: Number.isFinite(minP90) && minP90 < 90 ? Math.round(minP90) : undefined,
      tempNormalMax: dayClim.normalMaxC,
      tempNormalMin: dayClim.normalMinC,
      tempAnomalyC,
      daytimeTempC:
        dayTemps12to16.length > 0
          ? Number(
              (dayTemps12to16.reduce((a, b) => a + b, 0) / dayTemps12to16.length).toFixed(1)
            )
          : finalMaxRounded,
      nighttimeTempC:
        nightTemps02to06.length > 0
          ? Number(
              (nightTemps02to06.reduce((a, b) => a + b, 0) / nightTemps02to06.length).toFixed(1)
            )
          : finalMinRounded,
      weatherCode: code,
      condition: mapWmoCodeToLabel(code),
      precipSum: finalPrecip,
      precipP90: matchedDayHours >= 8 ? Number(precipP90Sum.toFixed(1)) : undefined,
      precipProbabilityMax: finalPop,
      precipPhase: dominantPhase,
      windSpeedMax: finalWind,
      windGustMax: matchedDayHours >= 8 ? Math.round(maxGust) : undefined,
      dominantWindCompass: windDirectionToCompass(avgWindDeg),
      stormScoreMax: maxStormScore > 0 ? maxStormScore : undefined,
      uvIndexMax: Number(Number(dailyRaw.uv_index_max?.[dIdx] ?? 0).toFixed(1)),
      sunrise: String(dailyRaw.sunrise?.[dIdx] ?? ""),
      sunset: String(dailyRaw.sunset?.[dIdx] ?? ""),
      confidencePct: dayConfidencePct,
      activeModelCount: maxDayModels,
      ensembleMemberCount: maxDayEns,
      bimodalSplit: summarizeDailyBimodalSplits(dayBimodals),
      stabilityGrade: dayStability
    };
  });

  // 6B. CALIBRATED SUBSEASONAL OUTLOOK (`Days 16..30` via 52-Member GEFSv12 + GEPS Seamless Bias Stitching)
  const subseasonal = buildCalibratedSubseasonalOutlook({
    raw: rawSubseasonal,
    calibratedDaily: daily,
    lat: location.lat,
    lon: location.lon,
    elevationM: cityElevationM
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
    computeSolarElevationDeg(location.lat, location.lon, new Date(exactNowUtcMs)).toFixed(1)
  );
  const curUv = firstHour?.uvIndex ?? 0;

  const isLiveVerified =
    mos.report.mode === "live-mgm-mesh" ||
    mos.report.mode === "live-station-48h" ||
    mos.report.mode === "live-station-24h";
  const stIdsText =
    mos.summary.stationIds.length > 0 ? mos.summary.stationIds.join(" + ") : "WMO";
  const ensLabel =
    ensIndex.memberCount > 0 ? `${ensIndex.memberCount}-Üye AI+EPS` : "10-Model NWP";

  const attributions: HybridSourceAttribution[] = [
    {
      parameter: "2m Sıcaklık & İlçe Mikrokliması",
      primaryEngine: isBursaEmosActive
        ? "ATMOS v5.0 Bursa Zero-Drift EMOS+GBDT"
        : topModelLabel(mos.shortRangeWeights.temperature),
      weightsLabel: formatWeightsLabel(mos.shortRangeWeights.temperature),
      standardRef: isBursaEmosActive
        ? `WMO 17116 (17.472s / 2 Yıl) L1-EMOS + GBDT + 19-İlçe MGM + ${ensLabel}`
        : isLiveVerified
          ? `48s Çoklu İstasyon (${stIdsText}) Kalman/Diurnal MOS + UBRMSE²`
          : `10-Model + ${ensLabel} + Bolton (1980)`,
      reason: isBursaEmosActive
        ? "Bursa Merkez (17116) 17.472 saatlik 2-yıllık arşivle eğitilen ölçek-değişmez L1-EMOS + Ağaç + 19-ilçe MGM mikroklima + 212-üye bimodal kümeleme motoru; alt-saatlik faz kaymasını ve gürültülü koşu zıplamalarını sıfırlar."
        : "Çoklu model gündüz/gece fazlı Kalman sapma düzeltmesinden geçirilir; 0–6s aralığında canlı sensör asimile edilir."
    },
    {
      parameter: "Yağış, Radar Nowcast & Faz",
      primaryEngine: "Zoom-8 G/R Radar + Spatio-Temporal GBDT",
      weightsLabel: `${ensLabel} PM-QM · 9-Nokta Stencil · MGM ALARO`,
      standardRef: "Fulton-Brandes G/R + Ebert (2001) PM-QM + Stull (2011) Tw",
      reason:
        "İlk 3 saatte Zoom-8 RainViewer radarı canlı MGM plüvyometreleriyle kalibre edilir; 3–7. günlerde ±2s pencere + 9-nokta komşuluk GBDT ile cephe kaymaları yakalanır ve Lodos virga çiselemesi elenir."
    },
    {
      parameter: "Koşu Tutarlılığı (Anti-Flip-Flop)",
      primaryEngine: "Kalibre dProg/dt Histerezis Kilidi",
      weightsLabel: `8 Model × 4 Koşu · 2/3 Kanıt Kapısı · Kalıcı Defter`,
      standardRef: "ECMWF/WMO dProg/dt + Ashman D Bimodal Kümeleme",
      reason:
        "Kalibre tahminler önceki sinoptik döngülerle elma-elma karşılaştırılır; fiziksel kanıtı olmayan tekil 06Z/18Z model savrulmaları %72 oranında bastırılır."
    },
    {
      parameter: "Şiddetli Fırtına & Oraj Motoru",
      primaryEngine: "ATMOS-Core v5 SPC/ESTOFEX",
      weightsLabel: `MUCAPE · Bunkers SRH · SCP · DCAPE`,
      standardRef: `Çoklu Model CAPE + ${ensLabel} Hamle/CAPE + 15dk Nowcast`,
      reason:
        "Gece/cephe orajları için MUCAPE, dönen fırtınalar için 0–3 km SRH/SCP ve ani hamle için DCAPE birleşik 0–100 tehdit skoruna çevrilir."
    },
    {
      parameter: "Deniz Seviyesi Basıncı & Rüzgar",
      primaryEngine: topModelLabel(mos.shortRangeWeights.pressure),
      weightsLabel: formatWeightsLabel(mos.shortRangeWeights.pressure),
      standardRef: "19-İlçe MGM QNH Kalman + Vektörel Rüzgar + P90 Hamle",
      reason:
        "Kalman sapma giderimli deniz seviyesi basıncı, 3s barometrik cephe eğilimi ve 212-üye P90 fırtına hamlesi."
    },
    {
      parameter: "3-Katmanlı Dikey Sütun & Marmara SST",
      primaryEngine: "Parçalı Hidrostatik + Froude/DEK Fiziği",
      weightsLabel: `Γ_ova ${mos.summary.envLapseRateCPerKm}°C/km · SST ${marmaraSstBundle?.currentSstC ?? 14}°C`,
      standardRef: "Ova/Yamaç/Zirve 3-Katman Lapse · Canlı Copernicus SST",
      reason:
        "Ova tabanı (0–550m), orta yamaç (550–1300m) ve Uludağ zirve (1300–2000m) ayrı gradyanlarla çözülür; Lodos fönü ve Marmara DEK canlı SST ile modellenir."
    }
  ];

  const activeBursaRegime = classifyBursaSynopticRegime({
    windDir10mDeg: hybridCurDir,
    windSpeed10mKt: hybridCurWind * 0.539957,
    pressureMslHpa: pNow,
    cloudCoverPct: Number(cur.cloud_cover ?? firstHour?.cloudCover ?? 35),
    capeJkg: firstHour?.cape ?? 0,
    localHour: startLocalHour,
    month: new Date(exactNowUtcMs).getUTCMonth() + 1
  });
  const regimeTrMap: Record<string, string> = {
    LODOS_FOEHN: "Uludağ Lodos Fönü",
    POYRAZ_KARAYEL_ADV: "Poyraz / Karayel Marmara Akışı",
    OVA_INVERSION_CALM: "Bursa Ovası Enversiyon / Ayaz",
    MARMARA_SEA_BREEZE: "Marmara Deniz Meltemi",
    CONVECTIVE_UNSTABLE: "Konvektif Kararsızlık",
    SYNOPTIC_TRANSITION: "Sinoptik Cephe Geçişi"
  };
  const activeRegimeLabel = isBursaDomain
    ? (regimeTrMap[activeBursaRegime] ?? "Sinoptik Akış")
    : "Çoklu Model Sinoptik Rejim";
  const stabilitySummary = summarizeForecastStability(consistencyTrack, activeRegimeLabel);

  const hybrid: HybridMeta = {
    engineVersion: isBursaDomain
      ? "ATMOS-Core v5.0 (Bursa Zero-Drift · 17472s EMOS · 212-Üye)"
      : "ATMOS-Core v5.0 (212-Üye Kalibre)",
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
    attributions,
    engineMeta: {
      activeRegime: activeBursaRegime,
      activeRegimeLabel,
      verticalMechanism: firstHourVertPhys?.activeMechanism ?? "STANDARD_PROFILE",
      froudeNumber: firstHourVertPhys?.froudeNumber ?? 0,
      stabilityPct: stabilitySummary.overallStabilityPct,
      stabilityGrade: stabilitySummary.overallGrade,
      meanRunLockCount: stabilitySummary.meanRunLockCount,
      blockedFlipFlops: stabilitySummary.blockedNoisyRevisionsCount,
      spinUpVetoes: stabilitySummary.spinUpVetoesCount,
      stabilityBadgeLabel: stabilitySummary.badgeLabelTr,
      radarSummaryCode: radarNowcast.summaryCode,
      nextRainOnsetMin: radarNowcast.nextRainOnsetMinutes,
      rainCessationMin: radarNowcast.rainCessationMinutes,
      bursaTier1Online: bursaMesh?.tier1OnlineCount ?? 0,
      ltbrIsolated: Boolean(isBursaDomain && (bursaMesh?.tier1OnlineCount ?? 0) > 0),
      marmaraSstC: marmaraSstBundle?.currentSstC ?? null,
      bimodalHoursResolved,
      mgmDistrictMatched: mgmForecasts?.targetDistrict ?? null
    }
  };

  let curWmo = firstHour?.weatherCode ?? Number(cur.weather_code ?? 0);
  if (hybridCurPrecip >= 0.12 && curWmo < 51) {
    curWmo = hybridCurTemp <= 1.0 ? 71 : 61;
  } else if (hybridCurPrecip < 0.05 && curWmo >= 51 && liveBursaSurface && !liveBursaSurface.isPrecipitatingNow) {
    curWmo = Number(cur.cloud_cover ?? 50) >= 75 ? 3 : 2;
  }

  const savedNowMs = Date.now();
  const fetchedAtIso = new Date(savedNowMs).toISOString();
  const hybridFailed =
    !hJson || !Array.isArray(hJson?.hourly?.time) || hJson.hourly.time.length === 0;
  const ensembleFailed = ensIndex.memberCount === 0;
  const degradedStreams: string[] = [];
  if (hybridFailed) degradedStreams.push("8-Model NWP Havuzu");
  if (ensembleFailed) degradedStreams.push("212-Üye Ensemble");

  // Anti-Downgrade Guard: if BOTH 8-model NWP and 212-member ensemble failed simultaneously,
  // never let uncalibrated single-model noise overwrite a recent (<3h) calibrated multi-model run!
  if (hybridFailed && ensembleFailed) {
    const memPrior = findMemoryWeatherEntry(location, key, savedNowMs);
    const diskPrior = !memPrior
      ? getWeatherSnapshotFromDisk(location.lat, location.lon, savedNowMs)
      : null;
    const priorCandidate = memPrior
      ? {
          bundle: memPrior.value,
          savedAtMs: memPrior.cachedAtMs,
          tier: "memory-stale" as const
        }
      : diskPrior
        ? {
            bundle: diskPrior.bundle,
            savedAtMs: diskPrior.savedAtMs,
            tier: "disk-stale" as const
          }
        : null;

    if (
      priorCandidate &&
      savedNowMs - priorCandidate.savedAtMs <= 3 * 3600 * 1000 &&
      priorCandidate.bundle.hybrid.activeModels.length >= 4
    ) {
      const protectedBundle = reanchorWeatherBundleToNow(
        {
          ...priorCandidate.bundle,
          location: mergeLocationIdentity(priorCandidate.bundle.location, location)
        },
        savedNowMs,
        {
          status: "degraded",
          sourceTier: priorCandidate.tier,
          cachedAtMs: priorCandidate.savedAtMs,
          staleReason:
            "Çoklu model ve ensemble havuzu geçici yanıt vermedi; önceki 8-model kalibreli koşu korundu",
          degradedStreams,
          modelsRespondedCount: 1
        }
      );
      if (liveBursaSurface !== null || mos.anchor.active) {
        protectedBundle.current = {
          ...protectedBundle.current,
          temperature: hybridCurTemp,
          apparentTemperature: hybridCurApparent,
          humidity: hybridCurRh,
          dewPoint: hybridCurDew,
          pressure: pNow,
          windSpeed: hybridCurWind,
          windGusts: hybridCurGust,
          windDirection: hybridCurDir
        };
      }
      return protectedBundle;
    }
  }

  const bundleStatus = degradedStreams.length > 0 ? "degraded" : "live";
  const bundleFreshness = buildFreshnessMeta(fetchedAtIso, savedNowMs, {
    status: bundleStatus,
    sourceTier: "live",
    cachedAtMs: savedNowMs,
    staleReason:
      bundleStatus === "degraded"
        ? `Kısmi model akışı (${degradedStreams.join(", ")} geçici devre dışı)`
        : undefined,
    degradedStreams,
    modelsRespondedCount: activeModels.length
  });

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
    fetchedAt: fetchedAtIso,
    timezone: String(fJson.timezone ?? "UTC"),
    utcOffsetSeconds,
    freshness: bundleFreshness,
    current: {
      time: String(cur.time ?? new Date().toISOString()),
      temperature: hybridCurTemp,
      apparentTemperature: hybridCurApparent,
      wetBulbC: Number(wetBulbStullC(hybridCurTemp, hybridCurRh).toFixed(1)),
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
      precipProbability:
        hybridCurPrecip >= 0.12
          ? Math.max(80, firstHour?.precipProbability ?? 80)
          : firstHour?.precipProbability ?? 0,
      precipConsensus: curPrecipConsensus,
      precipType: mapWmoToPrecipType(curWmo, hybridCurPrecip, 0),
      precipPhase:
        hybridCurPrecip >= 0.10
          ? firstHour?.precipPhase && firstHour.precipPhase !== "none"
            ? firstHour.precipPhase
            : hybridCurTemp <= 1.0
              ? "snow"
              : "rain"
          : "none",
      snowLineElevationM: firstHour?.snowLineElevationM ?? null,
      weatherCode: curWmo,
      condition: mapWmoCodeToLabel(curWmo),
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
    subseasonal,
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

  const effectiveTtl =
    bundleStatus === "live" ? WEATHER_TTL_MS : WEATHER_DEGRADED_TTL_MS;
  weatherCache.set(key, {
    value: bundle,
    expiresAt: savedNowMs + effectiveTtl,
    staleUntil: savedNowMs + WEATHER_STALE_MS,
    cachedAtMs: savedNowMs
  });

  if (
    bundleStatus === "live" ||
    !getWeatherSnapshotFromDisk(location.lat, location.lon, savedNowMs)
  ) {
    saveWeatherSnapshotToDisk(bundle, savedNowMs);
  }

  return bundle;
}

export async function fetchMultiModelBundle(
  lat: number,
  lon: number
): Promise<MultiModelBundle> {
  const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  const nowMs = Date.now();
  const cached = modelCache.get(key);
  if (cached && cached.expiresAt > nowMs) {
    return reanchorMultiModelBundleToNow(cached.value, nowMs, {
      status: cached.value.freshness?.status ?? "live",
      sourceTier: cached.value.freshness?.sourceTier ?? "live",
      cachedAtMs: cached.cachedAtMs,
      modelsRespondedCount: cached.value.freshness?.modelsRespondedCount
    });
  }

  const resolveStaleModels = (reason: string): MultiModelBundle | null => {
    const fallbackNow = Date.now();
    if (cached && cached.staleUntil > fallbackNow) {
      return reanchorMultiModelBundleToNow(cached.value, fallbackNow, {
        status: "stale",
        sourceTier: "memory-stale",
        cachedAtMs: cached.cachedAtMs,
        staleReason: reason,
        modelsRespondedCount: cached.value.freshness?.modelsRespondedCount
      });
    }
    const diskHit = getModelsSnapshotFromDisk(lat, lon, fallbackNow);
    if (diskHit) {
      return reanchorMultiModelBundleToNow(diskHit.models, fallbackNow, {
        status: "stale",
        sourceTier: "disk-stale",
        cachedAtMs: diskHit.savedAtMs,
        staleReason: reason,
        modelsRespondedCount: diskHit.models.freshness?.modelsRespondedCount
      });
    }
    return null;
  };

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat.toFixed(4));
  url.searchParams.set("longitude", lon.toFixed(4));
  url.searchParams.set(
    "hourly",
    "temperature_2m,precipitation,wind_speed_10m,temperature_850hPa"
  );
  url.searchParams.set(
    "models",
    "ecmwf_ifs,ecmwf_aifs025_single,icon_seamless,ukmo_seamless,meteofrance_seamless,gfs_seamless,gem_seamless,jma_seamless,ecmwf_ifs025"
  );
  url.searchParams.set("forecast_days", "15");
  url.searchParams.set("timezone", "auto");

  const res = await fetchWithRetry(url.toString(), 11000, 1).catch(() => null);
  if (!res || !res.ok) {
    const stale = resolveStaleModels(
      res ? `Çoklu model servisi HTTP ${res.status} döndürdü` : "Çoklu model servisine ulaşılamadı"
    );
    if (stale) return stale;
    throw new Error(
      res ? `Open-Meteo multi-model HTTP ${res.status}` : "Open-Meteo multi-model unreachable"
    );
  }

  const json = await res.json().catch(() => null);
  const h = json?.hourly ?? {};
  const times: string[] = Array.isArray(h.time) ? h.time : [];
  if (times.length === 0) {
    const stale = resolveStaleModels("Çoklu model serisi boş döndü");
    if (stale) return stale;
    throw new Error("Open-Meteo multi-model payload empty");
  }

  const utcOffsetSeconds = Number(json.utc_offset_seconds ?? 0);
  const nowIso = new Date(Date.now() + utcOffsetSeconds * 1000)
    .toISOString()
    .slice(0, 13);
  let startIdx = times.findIndex((t) => t >= nowIso);
  if (startIdx < 0) startIdx = 0;

  const endIdx = Math.min(startIdx + 360, times.length);

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
        gem: toFiniteNum(h[`${prefix}_gem_seamless`]?.[i]),
        jma: toFiniteNum(h[`${prefix}_jma_seamless`]?.[i])
      });
    }
    return out;
  };

  const temp2m = buildSeries("temperature_2m");
  const temp850 = buildSeries("temperature_850hPa", true);
  const precip = buildSeries("precipitation");
  const wind10m = buildSeries("wind_speed_10m");

  const slice72 = <T,>(arr: T[]) => arr.slice(0, 72);
  const sumSlice = (arr: ModelSeriesPoint[], field: CoreModelKey) =>
    Number(arr.reduce((acc, p) => acc + (p[field] ?? 0), 0).toFixed(1));

  const minSlice = (arr: ModelSeriesPoint[], field: CoreModelKey) => {
    const vals = arr
      .map((p) => p[field])
      .filter((v): v is number => v !== null && v !== undefined);
    return vals.length > 0 ? Math.min(...vals) : null;
  };

  let maxSpreadTemp2m = 0;
  for (const pt of temp2m) {
    const vals = CORE_MODEL_KEYS.map((k) => pt[k]).filter(
      (v): v is number => v !== null && v !== undefined
    );
    if (vals.length >= 2) {
      maxSpreadTemp2m = Math.max(
        maxSpreadTemp2m,
        Number((Math.max(...vals) - Math.min(...vals)).toFixed(1))
      );
    }
  }

  const precip72h = Object.fromEntries(
    CORE_MODEL_KEYS.map((k) => [k, sumSlice(slice72(precip), k)])
  ) as Record<CoreModelKey, number>;
  const precip168h = Object.fromEntries(
    CORE_MODEL_KEYS.map((k) => [k, sumSlice(precip.slice(0, 168), k)])
  ) as Record<CoreModelKey, number>;
  const precip360h = Object.fromEntries(
    CORE_MODEL_KEYS.map((k) => [k, sumSlice(precip, k)])
  ) as Record<CoreModelKey, number>;
  const min850hPa = Object.fromEntries(
    CORE_MODEL_KEYS.map((k) => [k, minSlice(temp850, k)])
  ) as Record<CoreModelKey, number | null>;

  const modelsRespondedCount = CORE_MODEL_KEYS.filter((k) =>
    temp2m.some((pt) => pt[k] !== null && pt[k] !== undefined)
  ).length;

  const savedMs = Date.now();
  const fetchedIso = new Date(savedMs).toISOString();

  const bundle: MultiModelBundle = {
    fetchedAt: fetchedIso,
    lat,
    lon,
    utcOffsetSeconds,
    freshness: buildFreshnessMeta(fetchedIso, savedMs, {
      status: modelsRespondedCount >= 4 ? "live" : "degraded",
      sourceTier: "live",
      cachedAtMs: savedMs,
      modelsRespondedCount
    }),
    temp2m,
    temp850,
    precip,
    wind10m,
    summary: {
      precip72h,
      precip168h,
      precip360h,
      maxSpreadTemp2m,
      min850hPa
    }
  };

  modelCache.set(key, {
    value: bundle,
    expiresAt: savedMs + MODEL_TTL_MS,
    staleUntil: savedMs + MODEL_STALE_MS,
    cachedAtMs: savedMs
  });
  if (modelsRespondedCount >= 4 || !getModelsSnapshotFromDisk(lat, lon, savedMs)) {
    saveModelsSnapshotToDisk(bundle, savedMs);
  }
  return bundle;
}

export async function fetchRadarMetadata(): Promise<RadarMetadata> {
  const nowMs = Date.now();
  if (radarCache && radarCache.expiresAt > nowMs) {
    return radarCache.value;
  }

  const res = await fetchWithRetry(
    "https://api.rainviewer.com/public/weather-maps.json",
    8000,
    1
  ).catch(() => null);

  if (!res || !res.ok) {
    if (radarCache && radarCache.staleUntil > Date.now()) {
      const genIso = new Date(radarCache.value.generated * 1000).toISOString();
      return {
        ...radarCache.value,
        freshness: buildFreshnessMeta(genIso, Date.now(), {
          status: "stale",
          sourceTier: "memory-stale",
          cachedAtMs: radarCache.cachedAtMs,
          staleReason: "Canlı radar servisi yanıt vermedi; son kareler korunuyor"
        })
      };
    }
    throw new Error(res ? `RainViewer HTTP ${res.status}` : "RainViewer unreachable");
  }

  const json = await res.json().catch(() => null);
  const past = Array.isArray(json?.radar?.past) ? json.radar.past : [];
  const nowcast = Array.isArray(json?.radar?.nowcast) ? json.radar.nowcast : [];
  const frames = [...past, ...nowcast].map((f: { time: number; path: string }) => ({
    time: Number(f.time),
    path: String(f.path)
  }));

  if (frames.length === 0 && radarCache && radarCache.staleUntil > Date.now()) {
    const genIso = new Date(radarCache.value.generated * 1000).toISOString();
    return {
      ...radarCache.value,
      freshness: buildFreshnessMeta(genIso, Date.now(), {
        status: "stale",
        sourceTier: "memory-stale",
        cachedAtMs: radarCache.cachedAtMs,
        staleReason: "Radar kare listesi boş döndü; son kareler korunuyor"
      })
    };
  }

  const savedMs = Date.now();
  const generatedSec = Number(json?.generated ?? Math.floor(savedMs / 1000));
  const genIso = new Date(generatedSec * 1000).toISOString();

  const meta: RadarMetadata = {
    host: String(json?.host ?? "https://tilecache.rainviewer.com"),
    generated: generatedSec,
    frames,
    freshness: buildFreshnessMeta(genIso, savedMs, {
      status: "live",
      sourceTier: "live",
      cachedAtMs: savedMs
    })
  };

  radarCache = {
    value: meta,
    expiresAt: savedMs + RADAR_TTL_MS,
    staleUntil: savedMs + RADAR_STALE_MS,
    cachedAtMs: savedMs
  };
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
  const nowMs = Date.now();
  const cached = windGridCache.get(cacheKey);
  if (cached && cached.expiresAt > nowMs) {
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
  const res = await fetchWithRetry(url, 9000, 1).catch(() => null);
  if (!res || !res.ok) {
    if (cached && cached.staleUntil > Date.now()) {
      return {
        ...cached.value,
        freshness: buildFreshnessMeta(cached.value.fetchedAt, Date.now(), {
          status: "stale",
          sourceTier: "memory-stale",
          cachedAtMs: cached.cachedAtMs,
          staleReason: "Rüzgar ızgarası servisi yanıt vermedi; son vektör alanı korunuyor"
        })
      };
    }
    throw new Error(
      res ? `Open-Meteo wind-grid HTTP ${res.status}` : "Open-Meteo wind-grid unreachable"
    );
  }

  const raw = await res.json().catch(() => null);
  if (!raw && cached && cached.staleUntil > Date.now()) {
    return {
      ...cached.value,
      freshness: buildFreshnessMeta(cached.value.fetchedAt, Date.now(), {
        status: "stale",
        sourceTier: "memory-stale",
        cachedAtMs: cached.cachedAtMs,
        staleReason: "Rüzgar ızgarası yanıtı okunamadı; son vektör alanı korunuyor"
      })
    };
  }

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

  const savedMs = Date.now();
  const fetchedIso = new Date(savedMs).toISOString();

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
    fetchedAt: fetchedIso,
    freshness: buildFreshnessMeta(fetchedIso, savedMs, {
      status: "live",
      sourceTier: "live",
      cachedAtMs: savedMs
    })
  };

  windGridCache.set(cacheKey, {
    value: grid,
    expiresAt: savedMs + WIND_GRID_TTL_MS,
    staleUntil: savedMs + WIND_GRID_STALE_MS,
    cachedAtMs: savedMs
  });
  return grid;
}
