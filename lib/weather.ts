import {
  computeCalibratedWeightedSpread,
  computeIntrinsicAccuracyIndex
} from "./accuracy-index";
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
  type ProvinceScopedLedgerStationPoint,
  type TargetSynopticContext,
  trainKalmanMos
} from "./kalman-mos";
import {
  fetchMetarNetworkHistory,
  haversineKm as metarHaversineKm,
  resetMetarCacheForTests
} from "./metar-verify";
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
import { sanitizeBursaMeshToStrictTr16 } from "./provinces/bursa-vault-guard";
import {
  applyDirectionalBarrierRules,
  applyVenturiCorridorRules,
  computeProvinceMicroclimateOffsetC,
  resolveProvinceTargetMetadata,
  solveProvinceTopographicSurface
} from "./provinces/engine/province-cressman";
import { evaluateProvinceCalibratedHour } from "./provinces/engine/province-mos-engine";
import {
  adaptNationalQcObservationToLiveObs,
  computeProvinceLiveVerticalProfile,
  integrateProvinceVerticalDeltaC,
  type ProvinceEngineSpec,
  type ProvinceLiveStationObs
} from "./provinces/engine/province-vertical-profile";
import {
  resolveProvinceCode,
  TR_PROVINCE_NAMES_BY_CODE
} from "./provinces/geo-adm1-resolver";
import {
  cloneIsolatedValue,
  makeStrictProvinceCacheKey
} from "./provinces/isolation/namespaced-cache";
import {
  MGM_DEM_ELEVATION_REPAIR_BY_ISTNO,
  MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID
} from "./provinces/mgm-dem-repair";
import {
  fetchProvinceMgmForecasts,
  fetchProvinceMgmMesh,
  type NationalProvinceMeshSnapshot,
  type NationalQcObservation,
  resetMgmNationalCachesForTests
} from "./provinces/mgm-national-live";
import {
  buildProvinceClientSummary,
  loadProvinceCalibration,
  loadProvinceSpec
} from "./provinces/registry";
import {
  isTrProvinceCode,
  type ProvinceClientSummary,
  type ProvinceCode,
  type TrProvinceCode
} from "./provinces/types";
import {
  blendNowcastWithHourlyNwp,
  fetchRadarNowcast,
  type RadarMinuteStep
} from "./radar-nowcast";
import {
  evaluateHourlyRunConsistency,
  fetchOpenMeteoLaggedRuns,
  type HourlyConsistencyOutput,
  summarizeForecastStability
} from "./run-consistency";
import {
  getModelsSnapshotFromDisk,
  getWeatherSnapshotFromDisk,
  saveModelsSnapshotToDisk,
  saveWeatherSnapshotToDisk
} from "./snapshot-store";
import {
  type AntecedentThermalHour,
  buildLightningProximityRadar,
  estimateShortwaveRadiationWm2,
  evaluateHourLightningPhysics,
  type LightningHourPhysicsResult,
  maxBlowingSnowRisk,
  maxDekStatus,
  maxIcingRisk,
  reconcileNowLightningWithRadar,
  type ReconcileNowLightningResult,
  type SimulatedSnowHourOutput,
  simulateCoupledSnowTimeline,
  type SnowSimulationHourInput
} from "./snow-and-lightning-engine";
import {
  computeSynopticCycleId,
  getPriorCalibratedRunsFromLedger,
  getProvinceStationHistoryFromLedger,
  getSameHour24hResidualFromLedger,
  getStationHistoryFromLedger,
  getTodayObservedExtremesFromLedger,
  type LedgerForecastHourLock,
  type LedgerStationPoint,
  makeLedgerLocationKey,
  recordProvinceStationObservationsToLedger,
  recordTargetResidualToLedger,
  saveCalibratedRunToLedger
} from "./state-ledger";
import {
  buildStormAssessment,
  evaluateHourlyStormRisk,
  type HourlyStormEvalResult
} from "./storm-engine";
import {
  analyzeConvectiveProfile,
  type CapeAnalysisResult,
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
  fetchBursa9PointStencil,
  fetchMarmaraLiveSst,
  type PressureLevelSlice,
  solveVerticalColumnPhysics
} from "./vertical-physics";
import {
  blendHybridParameter,
  blendWindDirectionDeg,
  BURSA_CURATED_LOCATIONS,
  BURSA_WMO_17116_LAT,
  BURSA_WMO_17116_LON,
  classifyPressureTrend,
  classifyUvIndex,
  computePrecipConsensus,
  computeSolarElevationDeg,
  createFastZonedTimeResolver,
  DEFAULT_LOCATION,
  describePressureTrendDetail,
  detectDominantPollutant,
  formatRelativeDayLabelTr,
  isSnowLinePhysicallyRelevant,
  isWetActiveSample,
  mapEuropeanAqi,
  mapWmoCodeToLabel,
  normalizeCanonicalBursaLocation,
  solarElevationToDaylight,
  windDirectionToCompass,
  windKmhToBeaufort
} from "./weather-client";
import type {
  AirQualityDetail,
  AtmosCalibrationTierLabel,
  BlowingSnowRisk,
  CoreModelKey,
  CurrentWeather,
  DailyPoint,
  DekSnowStatus,
  ElevationSnowBand,
  EnsembleBand,
  GeoLocation,
  HourlyPoint,
  HybridMeta,
  HybridModelSnapshot,
  HybridSourceAttribution,
  LightningProximityRadar,
  MetarObservation,
  MetarWxFlags,
  Minutely15Point,
  ModelSeriesPoint,
  MultiModelBundle,
  PrecipitationConsensus,
  PrecipPhase,
  PrecipType,
  RadarFrame,
  RadarMetadata,
  RoadIcingRisk,
  SnowAndLightningObservatorySummary,
  SnowQualityLabelTr,
  SoundingLevel,
  WeatherBundle,
  WindGridBundle
} from "./weather-types";

type ExtendedHourlyPoint = HourlyPoint & {
  potentialPrecipPhase?: PrecipPhase;
  subHourOffsetFrac?: number;
};

interface RawHourStormContext {
  rawWmoCode: number;
  wmoStormAgreeCount: number;
  wmoTotalModels: number;
  capeFused: number;
  sounding: CapeAnalysisResult | null;
  ensCapeProb500: number;
  ensGustP50: number | null;
  ensGustP90: number | null;
  ensGustProb55: number;
  ensGustProb75: number;
  pressureDelta3h: number;
  pressureDelta6h: number;
  precip3hAccumMm: number;
  lightningPotential: number | null;
  liveMetarWx: MetarWxFlags | null;
}

export interface CanonicalNowPointInput {
  nominalHour0: HourlyPoint | undefined;
  sim0: SimulatedSnowHourOutput | undefined;
  curTimeIso: string;
  subHourFrac: number;
  temperature: number;
  apparentTemperature: number;
  dewPoint: number;
  humidity: number;
  tempBand?: EnsembleBand;
  pressure: number;
  pressureDelta3h: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  cloudCover: number;
  visibilityKm: number;
  uvIndex: number;
  precipitation: number;
  precipConsensus: PrecipitationConsensus;
  rawCurWeatherCode: number;
  rawCurIsDay?: number;
  curSolarElev: number;
  reconciledNowLt: ReconcileNowLightningResult;
  lightningRadar: LightningProximityRadar;
  hour0StormCtx: RawHourStormContext | undefined;
}

export interface CanonicalNowPointOutput {
  current: CurrentWeather;
  hour0: ExtendedHourlyPoint | undefined;
  nowStormEval: HourlyStormEvalResult;
}

/**
 * Single Source of Truth (`SSOT`) constructor for `"Şimdi"` (`frameIndex === 0`):
 * Guarantees 100% field-by-field physical & numerical identity between `bundle.current`
 * and `bundle.hourly[0]` after keeping `nominalHour0` isolated for `daily[0]` 24h integrals.
 */
export function buildCanonicalNowPoint(
  input: CanonicalNowPointInput
): CanonicalNowPointOutput {
  const {
    nominalHour0,
    sim0,
    curTimeIso,
    subHourFrac,
    temperature,
    apparentTemperature,
    dewPoint,
    humidity,
    tempBand,
    pressure,
    pressureDelta3h,
    windSpeed,
    windGusts,
    windDirection,
    cloudCover,
    visibilityKm,
    uvIndex,
    precipitation,
    precipConsensus,
    rawCurWeatherCode,
    rawCurIsDay,
    curSolarElev,
    reconciledNowLt,
    lightningRadar,
    hour0StormCtx
  } = input;

  const wetBulbC = Number(wetBulbStullC(temperature, humidity).toFixed(1));
  const cleanPrecip = Number(Math.max(0, precipitation).toFixed(2));
  const cleanGusts = Number(Math.max(windSpeed, windGusts).toFixed(1));
  const cleanWindDir = Math.round(((windDirection % 360) + 360) % 360);
  const precipProbability =
    cleanPrecip >= 0.12
      ? Math.max(80, nominalHour0?.precipProbability ?? 80)
      : (nominalHour0?.precipProbability ?? 0);

  const potentialPrecipPhase: PrecipPhase =
    sim0?.potentialPhase === "freezing_rain" && temperature <= 0.5
      ? "freezing_rain"
      : sim0?.potentialPhase === "hail"
        ? "hail"
        : wetBulbC <= 0.2
          ? "snow"
          : wetBulbC <= 1.6
            ? sim0?.potentialPhase === "snow" && wetBulbC <= 0.5
              ? "snow"
              : "sleet"
            : "rain";

  const isWetNow = isWetActiveSample(cleanPrecip);

  let precipPhase: PrecipPhase = "none";
  let precipType: PrecipType = "none";
  let airSnowCm = 0;
  let groundSnowCm = 0;
  let roadSnowCm = 0;

  const soilTempC =
    nominalHour0?.soilTempC ?? Number((temperature * 0.85 + 0.8).toFixed(1));
  const roadTempC =
    nominalHour0?.roadTempC ?? Number((temperature * 0.9 + 1.4).toFixed(1));

  if (isWetNow) {
    if (nominalHour0?.precipPhase === "freezing_rain" && temperature <= 0.5) {
      precipPhase = "freezing_rain";
    } else if (nominalHour0?.precipPhase === "hail") {
      precipPhase = "hail";
    } else if (wetBulbC <= 0.35) {
      precipPhase = "snow";
    } else if (wetBulbC <= 1.6) {
      precipPhase =
        nominalHour0?.precipPhase === "snow" && wetBulbC <= 0.55
          ? "snow"
          : "sleet";
    } else {
      precipPhase = "rain";
    }

    if (precipPhase === "snow" || precipPhase === "sleet") {
      let rawAir = 0;
      let rawGnd = 0;
      let rawRd = 0;
      if (
        nominalHour0 &&
        nominalHour0.precipitation >= 0.05 &&
        (sim0?.rawAirSnowCm ?? nominalHour0.airSnowCm ?? 0) > 0
      ) {
        const scale = cleanPrecip / nominalHour0.precipitation;
        rawAir = (sim0?.rawAirSnowCm ?? nominalHour0.airSnowCm ?? 0) * scale;
        rawGnd =
          (sim0?.rawGroundSnowCm ?? nominalHour0.groundSnowCm ?? 0) * scale;
        rawRd = (sim0?.rawRoadSnowCm ?? nominalHour0.roadSnowCm ?? 0) * scale;
      } else {
        const effSlr =
          nominalHour0?.snowSlr && nominalHour0.snowSlr > 0
            ? nominalHour0.snowSlr
            : wetBulbC <= -2
              ? 13
              : wetBulbC <= 0.3
                ? 10
                : 6.5;
        const snowFrac = precipPhase === "snow" ? 1 : 0.45;
        rawAir = cleanPrecip * snowFrac * (effSlr / 10);
        rawGnd = rawAir * (soilTempC <= 0.2 ? 0.9 : soilTempC <= 1.5 ? 0.45 : 0);
        rawRd = rawAir * (roadTempC <= 0.1 ? 0.85 : roadTempC <= 1.0 ? 0.3 : 0);
      }
      airSnowCm = rawAir < 0.04 ? 0 : Number(rawAir.toFixed(1));
      groundSnowCm = rawGnd < 0.04 ? 0 : Number(rawGnd.toFixed(1));
      roadSnowCm = rawRd < 0.04 ? 0 : Number(rawRd.toFixed(1));
    }

    precipType =
      precipPhase === "snow" ||
      (precipPhase === "sleet" && (airSnowCm >= 0.15 || wetBulbC <= 0.4))
        ? "snow"
        : "rain";
  }

  const lightningProbPct = reconciledNowLt.nowProbPct;
  const lightningFlashesPerMin = reconciledNowLt.nowFlashesPerMin;
  const isThundersnow = Boolean(
    (precipPhase === "snow" || precipPhase === "sleet" || wetBulbC <= 1.2) &&
      lightningProbPct >= 24 &&
      (isWetNow || lightningRadar.metarConfirmedTs)
  );

  const baseWmo = nominalHour0?.weatherCode ?? rawCurWeatherCode;
  let weatherCode = baseWmo;
  let condition: string;

  if (!isWetNow) {
    if (lightningProbPct >= 55 && baseWmo >= 95) {
      weatherCode = 95;
    } else if (baseWmo === 45 || baseWmo === 48) {
      weatherCode = baseWmo;
    } else if (baseWmo >= 51) {
      weatherCode =
        cloudCover >= 78 ? 3 : cloudCover >= 38 ? 2 : cloudCover >= 15 ? 1 : 0;
    }
    const drySkyLabel = mapWmoCodeToLabel(weatherCode);
    if (precipProbability >= 22) {
      const wetHint =
        wetBulbC <= 0.2
          ? "Kar İhtimali"
          : wetBulbC <= 1.6
            ? "Sulu Kar İhtimali"
            : "Yağış İhtimali";
      condition = `${drySkyLabel} (${wetHint})`;
    } else {
      condition = drySkyLabel;
    }
  } else if (isThundersnow) {
    weatherCode = Math.max(baseWmo, 95);
    condition = "Gökgürültülü Kar (Thundersnow)";
  } else if (lightningProbPct >= 58 && cleanPrecip >= 0.4) {
    weatherCode = Math.max(baseWmo, 95);
    condition =
      precipPhase === "hail"
        ? "Dolu Riskli Sağanak"
        : mapWmoCodeToLabel(weatherCode);
  } else if (precipPhase === "hail") {
    weatherCode = 96;
    condition = "Dolu Riskli Sağanak";
  } else if (precipPhase === "freezing_rain") {
    weatherCode = cleanPrecip >= 1.5 ? 67 : 66;
    condition = "Donan Yağmur";
  } else if (precipPhase === "sleet") {
    weatherCode =
      baseWmo >= 51 && baseWmo <= 67
        ? baseWmo
        : cleanPrecip >= 1.5
          ? 61
          : 51;
    condition = "Karla Karışık Yağmur";
  } else if (precipPhase === "snow") {
    weatherCode =
      (baseWmo >= 71 && baseWmo <= 77) || baseWmo === 85 || baseWmo === 86
        ? baseWmo
        : cleanPrecip >= 2.2
          ? 75
          : cleanPrecip >= 0.5
            ? 73
            : 71;
    condition = mapWmoCodeToLabel(weatherCode);
  } else {
    weatherCode =
      baseWmo < 51 ||
      (baseWmo >= 71 && baseWmo <= 77) ||
      baseWmo === 85 ||
      baseWmo === 86
        ? cleanPrecip >= 3.5
          ? 65
          : cleanPrecip >= 1.0
            ? 61
            : 51
        : baseWmo;
    condition = mapWmoCodeToLabel(weatherCode);
  }

  const nowStormEval = evaluateHourlyStormRisk({
    time: nominalHour0?.time ?? curTimeIso,
    hourLabel: nominalHour0?.hourLabel ?? curTimeIso.slice(11, 16),
    dayLabel: nominalHour0?.dayLabel ?? "Bugün",
    capeFused: hour0StormCtx?.capeFused ?? (nominalHour0?.cape ?? 0),
    sounding: hour0StormCtx?.sounding ?? null,
    ensCapeProb500: hour0StormCtx?.ensCapeProb500 ?? 0,
    ensGustP50: hour0StormCtx?.ensGustP50 ?? null,
    ensGustP90: hour0StormCtx?.ensGustP90 ?? null,
    ensGustProb55: hour0StormCtx?.ensGustProb55 ?? 0,
    ensGustProb75: hour0StormCtx?.ensGustProb75 ?? 0,
    windSpeedKmh: windSpeed,
    windGustsKmh: cleanGusts,
    precipitationMm: cleanPrecip,
    precipP90Mm: Math.max(
      cleanPrecip,
      precipConsensus.p90Mm ?? nominalHour0?.precipitation ?? cleanPrecip
    ),
    precip3hAccumMm: Math.max(
      cleanPrecip,
      hour0StormCtx?.precip3hAccumMm ?? cleanPrecip
    ),
    wmoStormAgreeCount: hour0StormCtx?.wmoStormAgreeCount ?? 0,
    wmoTotalModels: hour0StormCtx?.wmoTotalModels ?? 0,
    weatherCode,
    pressureDelta3h,
    pressureDelta6h: hour0StormCtx?.pressureDelta6h ?? pressureDelta3h,
    lightningPotential: hour0StormCtx?.lightningPotential ?? null,
    liveMetarWx: hour0StormCtx?.liveMetarWx ?? null,
    canonicalLightningProbPct: lightningProbPct,
    isThundersnow
  });

  const snowLineElevationM = nominalHour0?.snowLineElevationM ?? null;
  const snowpackDepthCm = nominalHour0?.snowpackDepthCm ?? 0;
  const snowSlr =
    isWetNow && (precipPhase === "snow" || precipPhase === "sleet")
      ? (nominalHour0?.snowSlr ?? 10)
      : (nominalHour0?.snowSlr ?? 0);
  const snowQualityTr = nominalHour0?.snowQualityTr ?? "Yok";
  const icingRisk = nominalHour0?.icingRisk ?? "none";
  const blowingSnowRisk = nominalHour0?.blowingSnowRisk ?? "none";
  const dekStatus = nominalHour0?.dekStatus ?? "none";
  const daylight = solarElevationToDaylight(curSolarElev);
  const isDay =
    rawCurIsDay !== undefined ? Number(rawCurIsDay) === 1 : curSolarElev > 0;

  const canonicalTempBand: EnsembleBand | undefined = tempBand
    ? {
        ...tempBand,
        p50: temperature
      }
    : undefined;

  const current: CurrentWeather = {
    time: curTimeIso,
    temperature,
    apparentTemperature,
    wetBulbC,
    tempBand: canonicalTempBand,
    humidity,
    dewPoint,
    pressure,
    pressureDelta3h,
    pressureTrend: classifyPressureTrend(pressureDelta3h),
    pressureTrendDetail: describePressureTrendDetail(pressureDelta3h),
    windSpeed,
    windGusts: cleanGusts,
    windDirection: cleanWindDir,
    beaufort: windKmhToBeaufort(windSpeed),
    cloudCover,
    visibilityKm,
    uvIndex,
    uvLabel: classifyUvIndex(uvIndex),
    precipitation: cleanPrecip,
    precipProbability,
    precipConsensus,
    precipType,
    precipPhase,
    potentialPrecipPhase,
    subHourOffsetFrac: subHourFrac,
    snowLineElevationM,
    airSnowCmHr: airSnowCm,
    groundSnowCmHr: groundSnowCm,
    roadSnowCmHr: roadSnowCm,
    snowpackDepthCm,
    snowSlr,
    snowQualityTr,
    soilTempC,
    roadTempC,
    icingRisk,
    blowingSnowRisk,
    dekStatus,
    lightningProbPct,
    lightningFlashesPerMin,
    isThundersnow,
    weatherCode,
    condition,
    isStorm: nowStormEval.isStorm,
    stormScore: nowStormEval.score,
    isDay,
    solarElevationDeg: curSolarElev,
    daylight,
    sunrise: "",
    sunset: "",
    temp850hPa: nominalHour0?.temp850hPa ?? null
  };

  const hour0: ExtendedHourlyPoint | undefined = nominalHour0
    ? {
        ...nominalHour0,
        temperature,
        tempP10: canonicalTempBand?.p10 ?? nominalHour0.tempP10,
        tempP90: canonicalTempBand?.p90 ?? nominalHour0.tempP90,
        apparentTemperature,
        wetBulbC,
        humidity,
        dewPoint,
        pressure,
        windSpeed,
        windGusts: cleanGusts,
        windDirection: cleanWindDir,
        cloudCover,
        visibilityKm,
        uvIndex,
        precipitation: cleanPrecip,
        precipProbability,
        precipConsensus,
        precipType,
        precipPhase,
        potentialPrecipPhase,
        subHourOffsetFrac: subHourFrac,
        snowLineElevationM,
        airSnowCm,
        groundSnowCm,
        roadSnowCm,
        snowpackDepthCm,
        snowSlr,
        snowQualityTr,
        soilTempC,
        roadTempC,
        icingRisk,
        blowingSnowRisk,
        dekStatus,
        weatherCode,
        condition,
        isStorm: nowStormEval.isStorm,
        stormScore: nowStormEval.score,
        lightningProbPct,
        lightningFlashesPerMin,
        isThundersnow,
        solarElevationDeg: curSolarElev,
        daylight
      }
    : undefined;

  return { current, hour0, nowStormEval };
}

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  staleUntil: number;
  cachedAtMs: number;
  provinceCode: ProvinceCode;
};

/**
 * Province-partitioned in-memory caches (`TR-16` Bursa permanently pinned and immune
 * to non-Bursa eviction pressure; deep `cloneIsolatedValue` on every read/write).
 */
const weatherCacheByProvince = new Map<ProvinceCode, Map<string, CacheEntry<WeatherBundle>>>();
const modelCacheByProvince = new Map<ProvinceCode, Map<string, CacheEntry<MultiModelBundle>>>();
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
const MAX_CACHE_PER_PROVINCE = 64;
const MAX_BURSA_PINNED_CACHE = 128;

function getFreshPartitionEntry<T>(
  store: Map<ProvinceCode, Map<string, CacheEntry<T>>>,
  provinceCode: ProvinceCode,
  key: string,
  nowMs: number
): CacheEntry<T> | null {
  const sub = store.get(provinceCode);
  if (!sub) return null;
  const entry = sub.get(key);
  if (!entry) return null;
  if (entry.staleUntil <= nowMs) {
    sub.delete(key);
    return null;
  }
  if (entry.expiresAt <= nowMs) {
    return null;
  }
  return {
    ...entry,
    value: cloneIsolatedValue(entry.value)
  };
}

function setPartitionEntry<T>(
  store: Map<ProvinceCode, Map<string, CacheEntry<T>>>,
  provinceCode: ProvinceCode,
  key: string,
  entry: CacheEntry<T>
): void {
  let sub = store.get(provinceCode);
  if (!sub) {
    sub = new Map<string, CacheEntry<T>>();
    store.set(provinceCode, sub);
  }
  if (sub.has(key)) {
    sub.delete(key);
  }
  const cap = provinceCode === "TR-16" ? MAX_BURSA_PINNED_CACHE : MAX_CACHE_PER_PROVINCE;
  while (sub.size >= cap) {
    const oldestKey = sub.keys().next().value;
    if (oldestKey === undefined) break;
    sub.delete(oldestKey);
  }
  sub.set(key, {
    ...entry,
    value: cloneIsolatedValue(entry.value)
  });
}

function mergeLocationIdentity(base: GeoLocation, req: GeoLocation): GeoLocation {
  return {
    ...base,
    id: req.id || base.id,
    name: req.name || base.name,
    admin1: req.admin1 ?? base.admin1,
    country: req.country || base.country,
    provinceCode: req.provinceCode ?? base.provinceCode
  };
}

function findMemoryWeatherEntry(
  provinceCode: ProvinceCode,
  location: GeoLocation,
  exactKey: string,
  nowMs: number
): CacheEntry<WeatherBundle> | null {
  const sub = weatherCacheByProvince.get(provinceCode);
  if (!sub) return null;

  const direct = sub.get(exactKey);
  if (direct && direct.staleUntil > nowMs) {
    return { ...direct, value: cloneIsolatedValue(direct.value) };
  }

  let best: CacheEntry<WeatherBundle> | null = null;
  for (const entry of sub.values()) {
    if (entry.staleUntil <= nowMs) continue;
    if (entry.provinceCode !== provinceCode) continue;
    if (areLocationsEquivalent(entry.value.location, location)) {
      if (!best || entry.cachedAtMs > best.cachedAtMs) {
        best = entry;
      }
    }
  }
  return best ? { ...best, value: cloneIsolatedValue(best.value) } : null;
}

function resolveStaleWeatherFallback(
  provinceCode: ProvinceCode,
  location: GeoLocation,
  exactKey: string,
  reason: string,
  nowMs = Date.now()
): WeatherBundle | null {
  const memEntry = findMemoryWeatherEntry(provinceCode, location, exactKey, nowMs);
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

  const diskHit = getWeatherSnapshotFromDisk(location.lat, location.lon, nowMs, {
    provinceCode
  });
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
  weatherCacheByProvince.clear();
  modelCacheByProvince.clear();
  windGridCache.clear();
  radarCache = null;
  resetSubseasonalCacheForTests();
  resetMgmNationalCachesForTests();
  resetMetarCacheForTests();
}

export function expireWeatherRuntimeCachesForTests(): void {
  for (const sub of weatherCacheByProvince.values()) {
    for (const [k, v] of sub.entries()) {
      sub.set(k, { ...v, expiresAt: 0 });
    }
  }
  for (const sub of modelCacheByProvince.values()) {
    for (const [k, v] of sub.entries()) {
      sub.set(k, { ...v, expiresAt: 0 });
    }
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
  precipColWeights: number[];
  gustCols: Array<Array<number | null>>;
  gustColWeights: number[];
  capeCols: Array<Array<number | null>>;
  capeColWeights: number[];
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
  const precipColWeights: number[] = [];
  const gustCols: Array<Array<number | null>> = [];
  const gustColWeights: number[] = [];
  const capeCols: Array<Array<number | null>> = [];
  const capeColWeights: number[] = [];

  const hourly = eJson?.hourly as Record<string, unknown> | undefined;
  const times = Array.isArray(hourly?.time) ? (hourly.time as string[]) : [];
  if (!hourly || times.length === 0) {
    return {
      utcIndex,
      tempCols,
      tempColWeights,
      precipCols,
      precipColWeights,
      gustCols,
      gustColWeights,
      capeCols,
      capeColWeights,
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
      precipColWeights.push(ensembleWeightForColumnKey(key));
    } else if (key.startsWith("wind_gusts_10m_")) {
      gustCols.push(val as Array<number | null>);
      gustColWeights.push(ensembleWeightForColumnKey(key));
    } else if (key.startsWith("cape_")) {
      capeCols.push(val as Array<number | null>);
      capeColWeights.push(ensembleWeightForColumnKey(key));
    }
  }

  return {
    utcIndex,
    tempCols,
    tempColWeights,
    precipCols,
    precipColWeights,
    gustCols,
    gustColWeights,
    capeCols,
    capeColWeights,
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

function resolveDstSafeStartHourIndex(params: {
  times: string[];
  timesUtcMs: number[];
  curTimeRaw: string;
  utcOffsetSeconds: number;
  tzResolver: ReturnType<typeof createFastZonedTimeResolver>;
  nowEpochMs: number;
}): number {
  const {
    times,
    timesUtcMs,
    curTimeRaw,
    utcOffsetSeconds,
    tzResolver,
    nowEpochMs
  } = params;
  if (times.length === 0 || timesUtcMs.length === 0) return 0;

  let targetUtcMs: number;
  if (curTimeRaw.length > 0) {
    const curPrefix = curTimeRaw.slice(0, 13);
    const foldMatches: number[] = [];
    for (let idx = 0; idx < times.length; idx++) {
      if (times[idx].slice(0, 13) === curPrefix) {
        foldMatches.push(idx);
      }
    }
    if (foldMatches.length === 1) {
      return foldMatches[0];
    }
    if (foldMatches.length >= 2) {
      const firstMs = timesUtcMs[foldMatches[0]];
      const lastMs = timesUtcMs[foldMatches[foldMatches.length - 1]];
      if (
        nowEpochMs >= firstMs - 3600_000 &&
        nowEpochMs <= lastMs + 2 * 3600_000
      ) {
        let picked = foldMatches[0];
        for (const mIdx of foldMatches) {
          if (nowEpochMs >= timesUtcMs[mIdx]) picked = mIdx;
        }
        return picked;
      }
      const wallHourUtcMs = Date.parse(`${curPrefix}:00:00Z`);
      const approxHourUtcMs = Number.isFinite(wallHourUtcMs)
        ? wallHourUtcMs - utcOffsetSeconds * 1000
        : firstMs;
      let picked = foldMatches[0];
      let bestDiff = Math.abs(timesUtcMs[picked] - approxHourUtcMs);
      for (const mIdx of foldMatches) {
        const diff = Math.abs(timesUtcMs[mIdx] - approxHourUtcMs);
        if (diff < bestDiff) {
          bestDiff = diff;
          picked = mIdx;
        }
      }
      return picked;
    }
    targetUtcMs = tzResolver
      .localIsoToUtcDate(curTimeRaw, nowEpochMs - 3600_000)
      .getTime();
  } else {
    targetUtcMs = nowEpochMs;
  }

  let idx = timesUtcMs.findIndex(
    (tMs) => tMs <= targetUtcMs && targetUtcMs < tMs + 3600_000
  );
  if (idx < 0) {
    const floorHourMs = Math.floor(targetUtcMs / 3600_000) * 3600_000;
    idx = timesUtcMs.findIndex((tMs) => tMs >= floorHourMs);
  }
  return idx >= 0 ? idx : 0;
}

function buildBursaProvinceSummary(
  stationCount: number,
  liveMarmaraSstC: number | null
): ProvinceClientSummary {
  return {
    provinceCode: "TR-16",
    plateNumber: 16,
    provinceName: "Bursa",
    climateRegion: "MARMARA",
    calibrationTier: "TIER_0_BURSA",
    canonicalCenter: {
      id: "bursa-tr",
      name: "Bursa",
      stationLabel: "Osmangazi · Merkez (WMO 17116)",
      lat: BURSA_WMO_17116_LAT,
      lon: BURSA_WMO_17116_LON,
      elevationM: 100
    },
    mgmMeshStationCount: Math.max(1, stationCount),
    activeWaterBodies: [
      {
        id: "MARMARA_BURSA_COAST",
        labelTr: "Marmara Denizi (Mudanya – Gemlik Körfezi)",
        kind: "inland_sea",
        liveTempC: liveMarmaraSstC,
        upperHpa: 850
      }
    ],
    cumulusStageId: "marmara",
    curatedSubLocations: BURSA_CURATED_LOCATIONS.map((loc) => {
      const elev = loc.elevation ?? 100;
      const role: "coast" | "plain" | "foothill" | "summit" =
        elev >= 1200
          ? "summit"
          : elev <= 35
            ? "coast"
            : elev >= 180
              ? "foothill"
              : "plain";
      return {
        id: loc.id,
        name: loc.name,
        role,
        lat: loc.lat,
        lon: loc.lon,
        elevationM: elev
      };
    })
  };
}

function normalizeNationalMeshPrimaryCenterQc(
  mesh: NationalProvinceMeshSnapshot | null
): NationalProvinceMeshSnapshot | null {
  if (!mesh) return null;
  const nonFrostCount = mesh.stations.filter(
    (s) => s.tempC !== null && s.station.coldPoolSusceptibility < 0.72
  ).length;
  if (nonFrostCount > 2) return mesh;

  let changed = false;
  const repaired: NationalQcObservation[] = mesh.stations.map((obs) => {
    if (
      obs.qcWeight <= 0 &&
      obs.station.isPrimaryCenter &&
      obs.tier === 1 &&
      obs.tempC !== null &&
      Number.isFinite(obs.tempC) &&
      obs.freshnessWeight > 0 &&
      obs.qcFlags.length === 1 &&
      obs.qcFlags[0] === "SPATIAL_BUDDY_OUTLIER"
    ) {
      changed = true;
      return {
        ...obs,
        qcWeight: Math.max(0.88, Number(obs.freshnessWeight.toFixed(3))),
        qcFlags: ["OK"]
      };
    }
    return obs;
  });

  if (!changed) return mesh;
  const acceptedCount = repaired.filter((s) => s.qcWeight > 0).length;
  return {
    ...mesh,
    stations: repaired,
    acceptedCount,
    rejectedCount: repaired.length - acceptedCount
  };
}

function mapNationalMeshToMetarObservations(
  mesh: NationalProvinceMeshSnapshot,
  targetLat: number,
  targetLon: number
): MetarObservation[] {
  return mesh.stations
    .filter((s) => s.qcWeight > 0 && s.station.provinceCode === mesh.provinceCode)
    .map((obs) => {
      const distKm = Number(
        metarHaversineKm(targetLat, targetLon, obs.station.lat, obs.station.lon).toFixed(1)
      );
      const stCode =
        obs.station.sondurumIstNo > 0
          ? `MGM_${obs.station.sondurumIstNo}`
          : `MGM_${obs.station.merkezId}`;
      const windKmh =
        obs.windSpeedKt !== null && Number.isFinite(obs.windSpeedKt)
          ? Number((obs.windSpeedKt * 1.852).toFixed(1))
          : null;
      const wxRaw = obs.wxCodeRaw ?? null;
      const isStormWx = wxRaw === "GSY" || wxRaw === "KGY" || wxRaw === "DY" || wxRaw === "D";
      const isSnowWx =
        wxRaw === "HKY" ||
        wxRaw === "K" ||
        wxRaw === "KKY" ||
        wxRaw === "YKY" ||
        (obs.isPrecipitating && (obs.tempC ?? 5) <= 1.2);
      return {
        icaoId: stCode,
        stationName: `${obs.station.il} / ${obs.station.ilce}`,
        distanceKm: distKm,
        elevationM: Math.round(obs.station.elevationM),
        obsTimeIso: obs.observedAtIso,
        ageMinutes: Math.max(0, Math.round(obs.ageMinutes)),
        rawOb: `${stCode} ${obs.tempC !== null ? `${obs.tempC.toFixed(1)}C` : ""}`.trim(),
        tempC: obs.tempC,
        dewPointC: obs.dewPointC,
        windSpeedKmh: windKmh,
        windGustKmh: null,
        windDirectionDeg: obs.windDirDeg,
        qnhHpa: obs.pressureMslHpa,
        visibilityKm:
          obs.visibilityM !== null && Number.isFinite(obs.visibilityM)
            ? Number((obs.visibilityM / 1000).toFixed(1))
            : null,
        wxString: wxRaw,
        wxFlags: {
          hasPrecip: obs.isPrecipitating,
          heavyPrecip: (obs.precip1HrMm ?? 0) >= 6.0 || (obs.precip10MinMm ?? 0) >= 2.0,
          isThunderstorm: isStormWx,
          hasHail: wxRaw === "DY" || wxRaw === "D",
          hasSnow: isSnowWx,
          hasSquall: (windKmh ?? 0) >= 58,
          hasFog:
            obs.visibilityM !== null && Number.isFinite(obs.visibilityM)
              ? obs.visibilityM <= 1000
              : false
        }
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

function resolveLiveWaterTempsForProvince(
  spec: ProvinceEngineSpec,
  mesh: NationalProvinceMeshSnapshot | null
): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  const marineRows = mesh?.marineStations ?? [];
  for (const wb of spec.waterBodies) {
    let matchedTemp: number | null = null;
    if (wb.mgmMarineStationIds.length > 0 && marineRows.length > 0) {
      const idSet = new Set(wb.mgmMarineStationIds);
      const exactBuoys = marineRows.filter(
        (m) => idSet.has(m.istNo) && Number.isFinite(m.waterTempC)
      );
      if (exactBuoys.length > 0) {
        matchedTemp = Number(
          (
            exactBuoys.reduce((acc, m) => acc + m.waterTempC, 0) / exactBuoys.length
          ).toFixed(1)
        );
      }
    }
    if (matchedTemp === null && marineRows.length > 0) {
      let bestDist = Infinity;
      for (const m of marineRows) {
        if (!Number.isFinite(m.waterTempC)) continue;
        const dKm = metarHaversineKm(wb.sampleCoord.lat, wb.sampleCoord.lon, m.lat, m.lon);
        if (dKm <= 120 && dKm < bestDist) {
          bestDist = dKm;
          matchedTemp = Number(m.waterTempC.toFixed(1));
        }
      }
    }
    if (matchedTemp === null && spec.waterBodies.length === 1 && mesh?.nearestWaterTempC != null) {
      matchedTemp = mesh.nearestWaterTempC;
    }
    out[wb.id] = matchedTemp;
  }
  return out;
}

export async function fetchWeatherBundle(
  rawLocation: GeoLocation = DEFAULT_LOCATION
): Promise<WeatherBundle> {
  // 0. Authoritative 81-Province ADM1 Topological Point-in-Polygon Resolution (Zero Cross-Border Bleed)
  const adm1Resolution = resolveProvinceCode({
    lat: rawLocation.lat,
    lon: rawLocation.lon,
    admin1: rawLocation.admin1 ?? null,
    countryCode: rawLocation.countryCode ?? null,
    explicitProvinceCode: rawLocation.provinceCode ?? null
  });
  const resolvedProvinceCode: ProvinceCode = adm1Resolution.provinceCode;

  const baseNormalizedLocation =
    resolvedProvinceCode === "TR-16"
      ? normalizeCanonicalBursaLocation(rawLocation)
      : { ...rawLocation };

  const location: GeoLocation = {
    ...baseNormalizedLocation,
    provinceCode: resolvedProvinceCode === "GLOBAL" ? undefined : resolvedProvinceCode
  };

  const key = makeStrictProvinceCacheKey({
    provinceCode: resolvedProvinceCode,
    locationId: location.id,
    lat: location.lat,
    lon: location.lon,
    elevationM: location.elevation
  });

  const entryNowMs = Date.now();
  const cached = getFreshPartitionEntry(weatherCacheByProvince, resolvedProvinceCode, key, entryNowMs);
  if (cached) {
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

  // Strict 3-Way Sovereignty Gate:
  //  - `isBursaDomain`: ONLY `TR-16` Bursa (Yalova TR-77, Kocaeli/Gebze TR-41, Bilecik TR-11,
  //    Sakarya TR-54, Balıkesir/Bandırma TR-10 can NEVER enter Bursa WMO-17116 or Marmara SST!)
  //  - `isNationalTrProvince`: All other 80 Turkish provinces (`TR-01..TR-81 != TR-16`)
  //  - `GLOBAL`: Outside Türkiye
  const isBursaDomain =
    resolvedProvinceCode === "TR-16" && isWithinBursaDomain(location.lat, location.lon);
  const isNationalTrProvince =
    isTrProvinceCode(resolvedProvinceCode) && resolvedProvinceCode !== "TR-16";
  const nationalProvinceCode: TrProvinceCode | null = isNationalTrProvince
    ? resolvedProvinceCode
    : null;

  const distFromBursa17116Km = Math.hypot(
    (location.lat - 40.2308) * 111.32,
    (location.lon - 29.0133) * 85.0
  );
  const isBursaEmosActive =
    isBursaDomain &&
    distFromBursa17116Km <= 34 &&
    (location.elevation === undefined || location.elevation <= 750);

  const [loadedProvinceSpec, provinceCalibration] = nationalProvinceCode
    ? await Promise.all([
        loadProvinceSpec(nationalProvinceCode),
        loadProvinceCalibration(nationalProvinceCode)
      ])
    : [null, null];
  const provinceSpec = loadedProvinceSpec as ProvinceEngineSpec | null;

  const pointInProvinceHook = (
    lat: number,
    lon: number,
    expectedCode: TrProvinceCode
  ): boolean => resolveProvinceCode({ lat, lon }).provinceCode === expectedCode;

  const demElevationHook = (
    istNo: number,
    merkezId: number,
    rawElevM: number
  ): number => {
    if (rawElevM > 2 && Number.isFinite(rawElevM)) return Math.round(rawElevM);
    const byIst = MGM_DEM_ELEVATION_REPAIR_BY_ISTNO[istNo];
    if (byIst !== undefined) return byIst;
    const byMerkez = MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID[merkezId];
    if (byMerkez !== undefined) return byMerkez;
    return -1;
  };

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

  // 2. 10 Operasyonel NWP + AI Modeli (son 72s + gelecek 16 gün)
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

  // Stage 1: Paralel canlı veri akışı (Bursa TR-16 vs 80-İl MGM/ALARO vs GLOBAL izole)
  const [
    forecastRes,
    hybridRes,
    ensRes,
    aqiRes,
    metarNetwork,
    rawBursaMesh,
    mgmForecasts,
    marmaraSstBundle,
    bursaStencilMap,
    rawNationalMgmMesh,
    nationalMgmForecasts,
    laggedRunsMap,
    rawSubseasonal
  ] = await Promise.all([
    fetchWithRetry(forecastUrl.toString(), 11000, 1).catch(() => null),
    fetchWithRetry(hybridUrl.toString(), 10000, 1).catch(() => null),
    fetchWithRetry(ensembleUrl.toString(), 9500, 1).catch(() => null),
    fetchWithRetry(aqiUrl.toString(), 8000, 1).catch(() => null),
    fetchMetarNetworkHistory(location.lat, location.lon, 4, 85, {
      provinceCode: resolvedProvinceCode
    }).catch(() => []),
    isBursaDomain
      ? fetchBursaObservationMesh(location.lat, location.lon, {
          referenceElevationM: location.elevation ?? 100
        }).catch(() => null)
      : Promise.resolve(null),
    isBursaDomain
      ? fetchMgmBursaForecasts(location.lat, location.lon, location.elevation ?? 100).catch(
          () => null
        )
      : Promise.resolve(null),
    isBursaDomain ? fetchMarmaraLiveSst().catch(() => null) : Promise.resolve(null),
    isBursaDomain ? fetchBursa9PointStencil().catch(() => new Map()) : Promise.resolve(new Map()),
    nationalProvinceCode
      ? fetchProvinceMgmMesh(nationalProvinceCode, {
          targetLat: location.lat,
          targetLon: location.lon,
          targetElevationM:
            location.elevation ?? provinceSpec?.primaryCenter.demVerifiedElevationM,
          pointInProvinceFn: pointInProvinceHook,
          demElevationResolver: demElevationHook,
          stationOverrides: provinceSpec?.stationOverrides,
          qcBounds: provinceSpec?.qcAndMosBounds,
          isNight: computeSolarElevationDeg(location.lat, location.lon, new Date(entryNowMs)) < -3
        }).catch(() => null)
      : Promise.resolve(null),
    nationalProvinceCode
      ? fetchProvinceMgmForecasts(nationalProvinceCode, {
          targetLat: location.lat,
          targetLon: location.lon,
          targetElevationM:
            location.elevation ?? provinceSpec?.primaryCenter.demVerifiedElevationM,
          pointInProvinceFn: pointInProvinceHook,
          demElevationResolver: demElevationHook,
          stationOverrides: provinceSpec?.stationOverrides
        }).catch(() => null)
      : Promise.resolve(null),
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

  // Strict TR-16 perimeter guard: strip LTFJ, LTBG & cross-border Yalova/Kocaeli PWS from Bursa mesh
  const bursaMesh =
    isBursaDomain && rawBursaMesh
      ? sanitizeBursaMeshToStrictTr16(
          rawBursaMesh,
          (lat, lon) => resolveProvinceCode({ lat, lon }).provinceCode
        )
      : null;
  const nationalMgmMesh = normalizeNationalMeshPrimaryCenterQc(rawNationalMgmMesh);

  if (!forecastRes || !forecastRes.ok) {
    const failReason = forecastRes
      ? `Ana model servisi HTTP ${forecastRes.status} yanıtı verdi`
      : "Ana model servisine bağlantı kurulamadı";
    const staleBundle = resolveStaleWeatherFallback(
      resolvedProvinceCode,
      location,
      key,
      failReason,
      Date.now()
    );
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
      resolvedProvinceCode,
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
  const resolvedTimezone = String(fJson.timezone ?? location.timezone ?? "UTC");
  const effectiveForecastTz =
    resolvedTimezone === "UTC" && utcOffsetSeconds !== 0 ? undefined : resolvedTimezone;
  const tzResolver = createFastZonedTimeResolver(effectiveForecastTz, utcOffsetSeconds);
  const cityElevationM = Math.round(Number(fJson.elevation ?? location.elevation ?? 0));

  // Pre-resolve every local hourly timestamp to exact DST-aware UTC Date
  const timesUtcDates: Date[] = [];
  for (let idx = 0; idx < times.length; idx++) {
    const prevMs = idx > 0 ? timesUtcDates[idx - 1].getTime() : undefined;
    timesUtcDates.push(tzResolver.localIsoToUtcDate(times[idx], prevMs));
  }

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

  const curTimeRaw = typeof cur.time === "string" ? cur.time.trim() : "";
  const nowRefForStartMs = Date.now();
  const curTimeStr =
    curTimeRaw.length > 0
      ? curTimeRaw
      : tzResolver.epochMsToLocalParts(nowRefForStartMs).isoMinute;
  const startIdx = resolveDstSafeStartHourIndex({
    times,
    timesUtcMs: timesUtcDates.map((d) => d.getTime()),
    curTimeRaw,
    utcOffsetSeconds,
    tzResolver,
    nowEpochMs: nowRefForStartMs
  });

  const originTodayYmd = String(times[startIdx] ?? curTimeStr).slice(0, 10);

  // Sub-hourly exact timestamp fraction [0..1]
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

  const startHourUtcMs = timesUtcDates[startIdx]
    ? timesUtcDates[startIdx].getTime()
    : Date.now();
  const exactNowUtcMs = startHourUtcMs + subHourFrac * 3600_000;

  const startLocalHour = Number(times[startIdx]?.slice(11, 13) ?? 12);
  const startSolarElevationDeg = computeSolarElevationDeg(
    location.lat,
    location.lon,
    new Date(exactNowUtcMs)
  );
  const startIsNight = startSolarElevationDeg < -3;
  const startCloudPct = Number(hourlyRaw.cloud_cover?.[startIdx] ?? cur.cloud_cover ?? 35);
  const startWindDir = Number(hourlyRaw.wind_direction_10m?.[startIdx] ?? cur.wind_direction_10m ?? 0);
  const startWindKmh = Number(hourlyRaw.wind_speed_10m?.[startIdx] ?? cur.wind_speed_10m ?? 8);

  const snd700 = initialSounding.find((l) => l.pressure === 700);
  const snd850 = initialSounding.find((l) => l.pressure === 850);

  // Record fresh QC-passed 80-province MGM observations into isolated `.data/provinces/TR-XX/ledger.json`
  if (nationalProvinceCode && nationalMgmMesh && nationalMgmMesh.acceptedCount > 0) {
    const ledgerPts: LedgerStationPoint[] = [];
    for (const obs of nationalMgmMesh.stations) {
      if (obs.qcWeight <= 0 || obs.tempC === null || !Number.isFinite(obs.tempC)) continue;
      if (obs.station.provinceCode !== nationalProvinceCode) continue;
      const obsMs = Date.parse(obs.observedAtIso);
      const safeMs = Number.isFinite(obsMs) ? obsMs : exactNowUtcMs;
      const hourUtcKey = new Date(Math.floor(safeMs / 3600_000) * 3600_000)
        .toISOString()
        .slice(0, 13) + ":00";
      const stId =
        obs.station.sondurumIstNo > 0
          ? `MGM_${obs.station.sondurumIstNo}`
          : `MGM_${obs.station.merkezId}`;
      const rhVal =
        obs.relHumidityPct !== null && Number.isFinite(obs.relHumidityPct)
          ? obs.relHumidityPct
          : 65;
      const dewVal =
        obs.dewPointC !== null && Number.isFinite(obs.dewPointC)
          ? obs.dewPointC
          : dewPointMagnus(obs.tempC, rhVal);
      const pHr =
        obs.precip1HrMm ?? (obs.precip10MinMm !== null ? obs.precip10MinMm * 6 : 0);
      ledgerPts.push({
        stationId: stId,
        utcHourKey: hourUtcKey,
        observedAtMs: safeMs,
        lat: obs.station.lat,
        lon: obs.station.lon,
        elevationM: obs.station.elevationM,
        tempC: obs.tempC,
        dewPointC: Number.isFinite(dewVal) ? Number(dewVal.toFixed(1)) : null,
        pressureMslHpa: obs.pressureMslHpa,
        windSpeedKmh:
          obs.windSpeedKt !== null && Number.isFinite(obs.windSpeedKt)
            ? Number((obs.windSpeedKt * 1.852).toFixed(1))
            : null,
        windDirDeg: obs.windDirDeg,
        precipMmHr: Math.max(0, Number((pHr ?? 0).toFixed(2))),
        hasPrecip: obs.isPrecipitating || (pHr ?? 0) >= 0.1
      });
    }
    if (ledgerPts.length > 0) {
      recordProvinceStationObservationsToLedger(nationalProvinceCode, ledgerPts);
    }
  }

  // Build live 80-province station observations + live water body temperatures + live snowpack
  const liveWaterTempsByBodyId: Record<string, number | null> =
    isNationalTrProvince && provinceSpec
      ? resolveLiveWaterTempsForProvince(provinceSpec, nationalMgmMesh)
      : {};
  const primaryWaterBody =
    isNationalTrProvince && provinceSpec && provinceSpec.waterBodies.length > 0
      ? provinceSpec.waterBodies[0]
      : null;
  const cleanLiveWaterTempsByIdC: Record<string, number> = {};
  for (const [wbId, wVal] of Object.entries(liveWaterTempsByBodyId)) {
    if (wVal !== null && Number.isFinite(wVal)) {
      cleanLiveWaterTempsByIdC[wbId] = wVal;
    }
  }
  const primaryLiveWaterTempC: number | null = primaryWaterBody
    ? (liveWaterTempsByBodyId[primaryWaterBody.id] ?? nationalMgmMesh?.nearestWaterTempC ?? null)
    : null;

  const liveNationalStationObs: ProvinceLiveStationObs[] = (() => {
    if (!nationalProvinceCode || !provinceSpec) return [];
    const out: ProvinceLiveStationObs[] = [];
    const seenIds = new Set<string>();
    if (nationalMgmMesh) {
      for (const qObs of nationalMgmMesh.stations) {
        if (qObs.qcWeight <= 0 || qObs.station.provinceCode !== nationalProvinceCode) continue;
        const adapted = adaptNationalQcObservationToLiveObs(qObs);
        seenIds.add(String(adapted.stationId));
        out.push(adapted);
      }
    }
    for (const net of metarNetwork) {
      const latest = net.history[net.history.length - 1];
      if (!latest || latest.temp === null || latest.temp === undefined) continue;
      const icao = net.station.icaoId.toUpperCase();
      if (!provinceSpec.icaoWhitelist.includes(icao)) continue;
      if (seenIds.has(icao)) continue;
      const ov = provinceSpec.stationOverrides[icao];
      const mLat = ov?.lat ?? (typeof latest.lat === "number" ? latest.lat : provinceSpec.primaryCenter.lat);
      const mLon = ov?.lon ?? (typeof latest.lon === "number" ? latest.lon : provinceSpec.primaryCenter.lon);
      out.push({
        stationId: icao,
        icaoId: icao,
        provinceCode: nationalProvinceCode,
        name: net.station.stationName,
        lat: mLat,
        lon: mLon,
        elevationM: ov?.demElevationM ?? net.station.elevationM,
        tempC: latest.temp,
        dewPointC: latest.dewp ?? null,
        relHumidityPct:
          latest.dewp !== null && latest.dewp !== undefined
            ? relativeHumidityFromDewPoint(latest.temp, latest.dewp)
            : null,
        pressureMslHpa: latest.altim ?? null,
        windSpeedKmh:
          latest.wspd !== null && latest.wspd !== undefined
            ? Number((latest.wspd * 1.852).toFixed(1))
            : null,
        windGustKmh:
          latest.wgst !== null && latest.wgst !== undefined
            ? Number((latest.wgst * 1.852).toFixed(1))
            : null,
        windDirDeg: typeof latest.wdir === "number" && Number.isFinite(latest.wdir) ? latest.wdir : null,
        precip1hMm: null,
        isPrecipitating: Boolean(
          net.station.wxFlags?.hasPrecip || net.station.wxFlags?.hasSnow
        ),
        ageMinutes: net.station.ageMinutes,
        qcWeight: 1.0,
        tier: 1,
        subBasinId: ov?.subBasinId,
        urbanFraction: ov?.urbanFraction,
        coldPoolSusceptibility: ov?.coldPoolSusceptibility
      });
    }
    return out;
  })();

  const mgmLiveSnowpackCm: number | null = (() => {
    if (!isNationalTrProvince || liveNationalStationObs.length === 0) return null;
    let bestSnow: number | null = null;
    let bestScore = Infinity;
    for (const s of liveNationalStationObs) {
      if (s.snowDepthCm === null || s.snowDepthCm === undefined || !Number.isFinite(s.snowDepthCm)) {
        continue;
      }
      const dKm = metarHaversineKm(location.lat, location.lon, s.lat, s.lon);
      const dElev = Math.abs(cityElevationM - s.elevationM);
      if (dKm <= 38 && dElev <= 420) {
        const score = dKm + dElev * 0.06;
        if (score < bestScore) {
          bestScore = score;
          bestSnow = Math.max(0, Number(s.snowDepthCm.toFixed(1)));
        }
      }
    }
    return bestSnow;
  })();

  const uses700UpperRef = Boolean(
    provinceSpec && provinceSpec.inversionAndWedgeSpec.deltaPressureTopHpa <= 750
  );
  const upperBarometricLevel = uses700UpperRef ? snd700 ?? snd850 : snd850 ?? snd700;

  const nationalVerticalProfile =
    isNationalTrProvince && provinceSpec
      ? computeProvinceLiveVerticalProfile({
          spec: provinceSpec,
          stations: liveNationalStationObs,
          wind850DirDeg: upperBarometricLevel?.windDirection ?? startWindDir,
          wind850SpeedKmh: (upperBarometricLevel?.windSpeedKt ?? 12) * 1.852,
          wind10mDirDeg: startWindDir,
          wind10mSpeedKmh: startWindKmh,
          cloudCoverPct: startCloudPct,
          isNight: startIsNight,
          hasSnowpack: (mgmLiveSnowpackCm ?? 0) >=
            provinceSpec.inversionAndWedgeSpec.snowAlbedoFeedback.snowDepthTriggerCm
        })
      : null;

  const effectiveLapseCPerM =
    bursaMesh && bursaMesh.verticalProfile.isDirectlyMeasured
      ? bursaMesh.verticalProfile.lapseRateCPerKm / 1000
      : nationalVerticalProfile && nationalVerticalProfile.isDirectlyMeasured
        ? nationalVerticalProfile.lapseRateCPerKm / 1000
        : envLapseRateCPerM;

  // Strictly province-sharded ledger key & 72h station history
  const ledgerLocKey = makeLedgerLocationKey(location.lat, location.lon, {
    provinceCode: resolvedProvinceCode,
    elevationM: cityElevationM
  });

  const ledgerStationHistory: ProvinceScopedLedgerStationPoint[] | undefined = isBursaDomain
    ? getStationHistoryFromLedger(undefined, 72, exactNowUtcMs).map((pt) => ({
        ...pt,
        stationProvinceCode: "TR-16"
      }))
    : nationalProvinceCode
      ? getProvinceStationHistoryFromLedger(nationalProvinceCode, 72, exactNowUtcMs).map(
          (pt) => ({
            ...pt,
            stationProvinceCode: nationalProvinceCode
          })
        )
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
    timezone: effectiveForecastTz,
    ensembleMembers: ensIndex.memberCount,
    ledgerStationHistory,
    provinceCode: resolvedProvinceCode,
    coldBasinAirportIcaos: provinceSpec?.urbanHeatIsland?.coldBasinAirportIcaos
  });

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

  // Respect `excludeFromCenterHeadline` when target is the provincial center and non-excluded center stations are live
  const surfaceStationsForTarget: ProvinceLiveStationObs[] = (() => {
    if (!isNationalTrProvince || !provinceSpec || liveNationalStationObs.length === 0) {
      return liveNationalStationObs;
    }
    const distToPrimaryKm = metarHaversineKm(
      location.lat,
      location.lon,
      provinceSpec.primaryCenter.lat,
      provinceSpec.primaryCenter.lon
    );
    const elevDiffPrimaryM = Math.abs(
      cityElevationM - provinceSpec.primaryCenter.demVerifiedElevationM
    );
    if (distToPrimaryKm <= 9.0 && elevDiffPrimaryM <= 180) {
      const nonExcluded = liveNationalStationObs.filter((s) => {
        const ov =
          provinceSpec.stationOverrides[String(s.stationId)] ??
          (s.icaoId ? provinceSpec.stationOverrides[s.icaoId] : undefined);
        return !ov?.excludeFromCenterHeadline;
      });
      if (nonExcluded.length > 0) {
        return nonExcluded;
      }
      if (!startIsNight) {
        return liveNationalStationObs.filter((s) => {
          const ov =
            provinceSpec.stationOverrides[String(s.stationId)] ??
            (s.icaoId ? provinceSpec.stationOverrides[s.icaoId] : undefined);
          return !(ov?.excludeFromCenterHeadline && (ov.coldPoolSusceptibility ?? 0) >= 0.72);
        });
      }
    }
    return liveNationalStationObs;
  })();

  const startMonth1To12 = new Date(exactNowUtcMs).getUTCMonth() + 1;
  const liveNationalSurface =
    isNationalTrProvince && provinceSpec && surfaceStationsForTarget.length > 0
      ? solveProvinceTopographicSurface({
          spec: provinceSpec,
          target: {
            lat: location.lat,
            lon: location.lon,
            elevationM: cityElevationM
          },
          stations: surfaceStationsForTarget,
          drivers: {
            localHour: startLocalHour,
            month: startMonth1To12,
            isNight: startIsNight,
            cloudCoverPct: startCloudPct,
            wind10mDirDeg: startWindDir,
            wind10mSpeedKmh: startWindKmh,
            wind850DirDeg: upperBarometricLevel?.windDirection ?? startWindDir,
            wind850SpeedKmh: (upperBarometricLevel?.windSpeedKt ?? 12) * 1.852,
            hasSnowpack:
              (mgmLiveSnowpackCm ?? 0) >=
              provinceSpec.inversionAndWedgeSpec.snowAlbedoFeedback.snowDepthTriggerCm,
            liveWaterTempsByIdC: cleanLiveWaterTempsByIdC
          },
          verticalProfile: nationalVerticalProfile ?? undefined
        })
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
  } else if (isNationalTrProvince && nationalMgmMesh && liveNationalSurface) {
    const mappedNationalStations = mapNationalMeshToMetarObservations(
      nationalMgmMesh,
      location.lat,
      location.lon
    );
    const existingWhitelistedMetars = (mos.report.stations ?? []).filter(
      (st) => provinceSpec?.icaoWhitelist.includes(st.icaoId.toUpperCase()) ?? false
    );
    const combinedProvinceStations = [
      ...mappedNationalStations,
      ...existingWhitelistedMetars
    ].sort((a, b) => a.distanceKm - b.distanceKm);

    if (combinedProvinceStations.length > 0) {
      const tier1NationalCount = nationalMgmMesh.stations.filter(
        (s) => s.qcWeight > 0 && s.tier === 1
      ).length;
      mos.anchor = {
        active: true,
        tempObsCityC: liveNationalSurface.tempC,
        dewObsCityC: liveNationalSurface.dewPointC ?? mos.anchor.dewObsCityC,
        pressObsHpa: liveNationalSurface.pressureMslHpa ?? mos.anchor.pressObsHpa,
        windObsKmh: liveNationalSurface.windSpeedKmh ?? mos.anchor.windObsKmh,
        tempKalmanGain: tier1NationalCount > 0 ? 0.92 : 0.78,
        pressKalmanGain: 0.86,
        windKalmanGain: 0.62,
        wxFlags: combinedProvinceStations[0].wxFlags ?? mos.anchor.wxFlags,
        primaryStationAgeMin: combinedProvinceStations[0].ageMinutes,
        primaryStationDistKm: combinedProvinceStations[0].distanceKm
      };
      mos.report.mode = "live-mgm-mesh";
      mos.report.station = combinedProvinceStations[0];
      mos.report.stations = combinedProvinceStations;
      mos.summary.active = true;
      mos.summary.stationCount = combinedProvinceStations.length;
      mos.summary.stationIds = combinedProvinceStations.slice(0, 4).map((s) => s.icaoId);
      mos.summary.envLapseRateCPerKm = Number((effectiveLapseCPerM * 1000).toFixed(2));
      mos.summary.nowcastKalmanGain = mos.anchor.tempKalmanGain;
    }
  }

  // Stage 2: REAL-PHYSICS RADAR NOWCAST
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
    liveBursaSurface?.tempC ??
    liveNationalSurface?.tempC ??
    mos.anchor.tempObsCityC ??
    Number(cur.temperature_2m ?? 14);
  const liveSurfTd =
    liveBursaSurface?.dewPointC ??
    liveNationalSurface?.dewPointC ??
    mos.anchor.dewObsCityC ??
    Number(cur.dew_point_2m ?? 8);
  const isNortherlyUpslopeNow = isBursaDomain
    ? ((snd850?.windDirection ?? startWindDir) >= 300 ||
        (snd850?.windDirection ?? startWindDir) <= 65) &&
      (snd850?.windSpeedKt ?? 0) >= 9 &&
      liveSurfT - liveSurfTd <= 7.5
    : Boolean(
        liveNationalSurface &&
          liveNationalSurface.barrierEffect.activeRegime === "UPSLOPE_OROGRAPHIC" &&
          liveSurfT - liveSurfTd <= 8.0
      );
  const activeGaugeCount = isBursaDomain
    ? (bursaMesh?.stations.filter(
        (s) => s.qcWeight > 0 && (s.precip10MinMm !== null || s.precip1HrMm !== null)
      ).length ?? 0)
    : (nationalMgmMesh?.stations.filter(
        (s) => s.qcWeight > 0 && (s.precip10MinMm !== null || s.precip1HrMm !== null)
      ).length ?? 0);

  const radarNowcast = await fetchRadarNowcast(location.lat, location.lon, {
    steeringWindFromDeg: steerFromDeg,
    steeringWindSpeedKt: steerSpeedKt,
    surfaceTempC: liveSurfT,
    surfaceDewPointC: liveSurfTd,
    orographicUpslopeActive: isNortherlyUpslopeNow,
    liveGaugeRainMmHr:
      liveBursaSurface?.precipRateMmHr ??
      (liveNationalSurface?.isPrecipitatingNow ? liveNationalSurface.precip1hMm : null),
    liveGaugeCount: activeGaugeCount
  });

  const laggedSeriesList = [...laggedRunsMap.values()];
  const consistencyTrack: HourlyConsistencyOutput[] = [];
  let firstHourVertPhys: ReturnType<typeof solveVerticalColumnPhysics> | null = null;
  let firstHourNationalRegime = "STANDARD_PROFILE";
  let firstHourNationalFroude = 0;
  const activeMicroclimateTagSet = new Set<string>();
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

  // Precompute 8-model median temperature & precipitation arrays for fast spatio-temporal window features
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

  // Sub-hourly interpolated EMOS baseline at exact t_now
  const effectiveLapsePerKm = Number((effectiveLapseCPerM * 1000).toFixed(2));
  const resolvedNationalTargetMeta =
    isNationalTrProvince && provinceSpec
      ? resolveProvinceTargetMetadata(provinceSpec, {
          lat: location.lat,
          lon: location.lon,
          elevationM: cityElevationM
        })
      : null;

  const evalBaseBursaTempNoResidual = (localIdx: number, leadH: number): number | null => {
    if (!isBursaEmosActive || !times[localIdx]) return null;
    const tStr = times[localIdx];
    const locH = Number(tStr.slice(11, 13)) || 0;
    const uDate = timesUtcDates[localIdx] ?? tzResolver.localIsoToUtcDate(tStr);
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
    const solElev = computeSolarElevationDeg(location.lat, location.lon, uDate);
    const microOffset = computeBursaDistrictMicroclimateOffsetC({
      targetLat: location.lat,
      targetLon: location.lon,
      targetElevationM: cityElevationM,
      base17116TempC: baseElevTemp,
      localHour: locH,
      isNight: solElev < -3,
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

  // Compute T+0 baseline residual for 80-province MOS when live national surface is available
  const nationalLiveOriginResidualC: number | null = (() => {
    if (
      !isNationalTrProvince ||
      !provinceSpec ||
      !liveNationalSurface ||
      !times[startIdx]
    ) {
      return null;
    }
    const uDate0 = timesUtcDates[startIdx] ?? tzResolver.localIsoToUtcDate(times[startIdx]);
    const uKey0 = uDate0.toISOString().slice(0, 16);
    const snap0 = readExtendedModelSnapshot("temperature_2m", uKey0);
    const hasDet0 = CORE_MODEL_KEYS.some((k) => snap0[k] !== null && snap0[k] !== undefined);
    if (!hasDet0) return null;
    const baseEval0 = evaluateProvinceCalibratedHour({
      leadHours: 0,
      localHour: startLocalHour,
      month: uDate0.getUTCMonth() + 1,
      spec: provinceSpec,
      bundle: provinceCalibration ?? undefined,
      tempSnapshot: snap0,
      targetElevationM: cityElevationM,
      referenceElevationM: cityElevationM
    });
    return Number((liveNationalSurface.tempC - baseEval0.temperatureC).toFixed(2));
  })();

  const initialRegimeNow = isBursaDomain
    ? classifyBursaSynopticRegime({
        windDir10mDeg: liveBursaSurface?.windDirDeg ?? startWindDir,
        windSpeed10mKt: liveBursaSurface?.windSpeedKt ?? startWindKmh * 0.539957,
        pressureMslHpa:
          liveBursaSurface?.pressureMslHpa ?? Number(hourlyRaw.pressure_msl?.[startIdx] ?? 1015),
        cloudCoverPct: startCloudPct,
        localHour: startLocalHour,
        month: new Date(exactNowUtcMs).getUTCMonth() + 1
      })
    : liveNationalSurface?.barrierEffect.activeRegime !== "NEUTRAL" &&
        liveNationalSurface?.barrierEffect.activeRegime
      ? liveNationalSurface.barrierEffect.activeRegime
      : liveNationalSurface?.verticalState ?? "SYNOPTIC_FLOW";

  const originUtcKey = new Date(startHourUtcMs).toISOString().slice(0, 16);
  const todayDateYmd = originTodayYmd;

  // Persist current target truth & residual into province-isolated 96h state ledger
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
  } else if (liveNationalSurface !== null) {
    recordTargetResidualToLedger({
      locKey: ledgerLocKey,
      utcHourKey: originUtcKey,
      localDateYmd: todayDateYmd,
      localHour: startLocalHour,
      observedAtMs: exactNowUtcMs,
      observedTempC: liveNationalSurface.tempC,
      emosBaseTempC:
        nationalLiveOriginResidualC !== null
          ? Number((liveNationalSurface.tempC - nationalLiveOriginResidualC).toFixed(2))
          : null,
      residualC: nationalLiveOriginResidualC,
      regime: initialRegimeNow,
      precipMmHr: liveNationalSurface.isPrecipitatingNow ? liveNationalSurface.precip1hMm : 0
    });
  }

  // Retrieve prior calibrated synoptic runs (R-1, R-2) from isolated state ledger
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

  const liveMetarHasPrecip =
    (mos.anchor.active &&
      Boolean(mos.anchor.wxFlags?.hasPrecip || mos.anchor.wxFlags?.hasSnow)) ||
    Boolean(liveBursaSurface?.isPrecipitatingNow) ||
    Boolean(liveNationalSurface?.isPrecipitatingNow);

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
  const rawStormContexts: RawHourStormContext[] = [];
  const currentCycleHourLocks: Record<string, LedgerForecastHourLock> = {};

  let firstHourTempShiftC = 0;
  let firstHourTempBand: EnsembleBand | undefined;

  const hybridStreamFailed =
    !hJson || !Array.isArray(hJson?.hourly?.time) || hJson.hourly.time.length === 0;
  const ensembleStreamFailed = ensIndex.memberCount === 0;
  const liveDegradedCount = (hybridStreamFailed ? 1 : 0) + (ensembleStreamFailed ? 1 : 0);

  const bestVerifiedTempUbRmseC = CORE_MODEL_KEYS.reduce<number | null>((best, k) => {
    const r = mos.biases[k].tempUbRmseC;
    if (r === null || !Number.isFinite(r)) return best;
    return best === null ? r : Math.min(best, r);
  }, null);

  const bursaElevOffsetM = Math.abs(cityElevationM - 100);
  const bursaCoastDistKm = Math.min(
    Math.hypot((location.lat - 40.375) * 111.3, (location.lon - 28.885) * 85.0),
    Math.hypot((location.lat - 40.431) * 111.3, (location.lon - 29.154) * 85.0)
  );
  const bursaMicroclimateUncC = isBursaEmosActive
    ? Number(
        (
          Math.min(1.25, (bursaElevOffsetM / 380) * 0.9) +
          (bursaCoastDistKm <= 9 ? 0.35 : 0)
        ).toFixed(2)
      )
    : isNationalTrProvince && provinceSpec
      ? Number(
          Math.min(
            1.35,
            (Math.abs(cityElevationM - provinceSpec.primaryCenter.demVerifiedElevationM) / 600) *
              0.75 +
              (provinceSpec.calibrationTier === "TIER_B_DONOR_KALMAN" ? 0.25 : 0)
          ).toFixed(2)
        )
      : 0;

  // FULL 168-HOUR (7-DAY) UNIFIED CALIBRATION & PHYSICS PIPELINE!
  const maxHourlyIdx = Math.min(startIdx + 168, times.length);
  for (let i = startIdx; i < maxHourlyIdx; i++) {
    const leadHour = i - startIdx;
    const timeStr = times[i];
    const dateYmd = timeStr.slice(0, 10);
    const localHour = Number(timeStr.slice(11, 13)) || 0;
    const utcDate = timesUtcDates[i] ?? tzResolver.localIsoToUtcDate(timeStr);
    const utcKey = utcDate.toISOString().slice(0, 16);
    const hourDayLabel = formatRelativeDayLabelTr(dateYmd, originTodayYmd, "weekday");
    const stepMonth = utcDate.getUTCMonth() + 1;

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
    const rawCloud = Number(hourlyRaw.cloud_cover?.[i] ?? 35);
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
    const ensPrecipWeighted = readEnsembleRowWithWeights(
      ensIndex.precipCols,
      ensIndex.precipColWeights,
      eIdx
    );
    const ensGustWeighted = readEnsembleRowWithWeights(
      ensIndex.gustCols,
      ensIndex.gustColWeights,
      eIdx
    );
    const ensCapeWeighted = readEnsembleRowWithWeights(
      ensIndex.capeCols,
      ensIndex.capeColWeights,
      eIdx
    );
    const ensPrecipArr = ensPrecipWeighted?.values ?? null;
    const ensGustArr = ensGustWeighted?.values ?? null;

    const ensTempStats = ensTempWeighted
      ? computeEnsembleDistStats(ensTempWeighted.values, ensTempWeighted.weights)
      : null;
    const ensGustStats = ensGustWeighted
      ? computeEnsembleDistStats(ensGustWeighted.values, ensGustWeighted.weights)
      : null;

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
      cloudCoverPct: stepDrivers?.cloudCoverPct ?? rawCloud,
      localHour,
      month: stepMonth
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
            cloudCoverPct: stepDrivers?.cloudCoverPct ?? rawCloud,
            windSpeedKmh: stepDrivers?.windSpeedKmh ?? rawWind,
            windDirDeg: stepDrivers?.windDirDeg ?? rawWindDir,
            marmaraSstC: sstHourC ?? null,
            mgmDistrictDay: mgmDay
          }) * (1 - 0.855 ** Math.min(24, leadHour) * (liveBursaSurface !== null && leadHour <= 24 ? 1 : 0))
        : 0;

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
          cloudCoverLowPct: rawCloud,
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

    // 1B. 80-PROVINCE BESPOKE PHYSICS + WMO/DONOR EMOS + MGM ALARO 4.5km + REGIME-GATED KALMAN
    let nationalCalHour: ReturnType<typeof evaluateProvinceCalibratedHour> | null = null;
    let nationalBarrierPrecipMult = 1.0;
    let nationalVenturiSpeedMult = 1.0;
    let nationalVenturiGustMult = 1.0;

    if (
      isNationalTrProvince &&
      provinceSpec &&
      resolvedNationalTargetMeta &&
      !hybridStreamFailed
    ) {
      const colUpper = uses700UpperRef ? columnLevels[3] : columnLevels[2];
      const upperDirDeg = colUpper?.windDirDeg ?? rawWindDir;
      const upperSpeedKmh = (colUpper?.windSpeedKt ?? 14) * 1.852;
      const isStepNight = solarElevationDeg <= 0;
      const hasStepSnowpack =
        (mgmLiveSnowpackCm ?? 0) >=
        provinceSpec.inversionAndWedgeSpec.snowAlbedoFeedback.snowDepthTriggerCm;

      const stepAmbientDrivers = {
        localHour,
        month: stepMonth,
        isNight: isStepNight,
        cloudCoverPct: rawCloud,
        wind10mDirDeg: rawWindDir,
        wind10mSpeedKmh: rawWind,
        wind850DirDeg: upperDirDeg,
        wind850SpeedKmh: upperSpeedKmh,
        landTempEstimateC: rawTemp,
        hasSnowpack: hasStepSnowpack,
        liveWaterTempsByIdC: cleanLiveWaterTempsByIdC,
        liveWaterTempC: primaryLiveWaterTempC
      };

      const stepBarrier = applyDirectionalBarrierRules({
        spec: provinceSpec,
        target: resolvedNationalTargetMeta,
        drivers: stepAmbientDrivers
      });
      const stepVenturi = applyVenturiCorridorRules({
        corridors: provinceSpec.venturiCorridors,
        targetLat: location.lat,
        targetLon: location.lon,
        windDirDeg: rawWindDir,
        windSpeedKmh: rawWind
      });
      const stepMicro = computeProvinceMicroclimateOffsetC({
        spec: provinceSpec,
        target: resolvedNationalTargetMeta,
        drivers: stepAmbientDrivers
      });

      nationalBarrierPrecipMult = stepBarrier.precipMultiplier;
      nationalVenturiSpeedMult = Math.min(1.48, stepVenturi.speedMultiplier);
      nationalVenturiGustMult = Math.min(1.58, stepVenturi.gustMultiplier);

      if (leadHour < 48) {
        if (stepBarrier.activeRegime === "FOEHN_LEE") activeMicroclimateTagSet.add("FOEHN_LEE");
        if (stepBarrier.activeRegime === "UPSLOPE_OROGRAPHIC")
          activeMicroclimateTagSet.add("UPSLOPE_OROGRAPHIC");
        if (stepBarrier.activeRegime === "RAIN_SHADOW")
          activeMicroclimateTagSet.add("RAIN_SHADOW");
        if (stepBarrier.foehnBlockedByColdWedge) activeMicroclimateTagSet.add("COLD_WEDGE_GUARD");
        if (stepVenturi.activeCorridorIds.length > 0)
          activeMicroclimateTagSet.add("VENTURI_CORRIDOR");
        if (Math.abs(stepMicro.seaBreezeOffsetC) >= 0.45)
          activeMicroclimateTagSet.add("SEA_LAKE_BREEZE");
        if (hasStepSnowpack && isStepNight) activeMicroclimateTagSet.add("SNOW_ALBEDO_INVERSION");
      }
      if (leadHour === 0) {
        firstHourNationalRegime =
          stepBarrier.activeRegime !== "NEUTRAL"
            ? stepBarrier.activeRegime
            : stepVenturi.activeCorridorIds.length > 0
              ? "VENTURI_CHANNEL"
              : nationalVerticalProfile?.boundaryLayerState ?? "STANDARD_PROFILE";
        firstHourNationalFroude = stepBarrier.froudeNumber;
      }

      const clearFrac = Math.max(0, 1 - (rawCloud / 100) ** 2);
      const calmFrac = 1 / (1 + (rawWind / 14) ** 2);
      const radNightSignal =
        isStepNight && !stepVenturi.suppressesNocturnalInversion
          ? clearFrac * calmFrac * (hasStepSnowpack ? 1.25 : 1.0)
          : 0;
      const swEst = estimateShortwaveRadiationWm2(
        typeof hourlyRaw.shortwave_radiation?.[i] === "number"
          ? Number(hourlyRaw.shortwave_radiation[i])
          : null,
        solarElevationDeg,
        rawCloud
      );
      const stratusLockActive =
        provinceSpec.inversionAndWedgeSpec.persistentStratusLock.enabled &&
        !isStepNight &&
        rawCloud >= 85 &&
        rawWind <= 11 &&
        (stepMonth <= 2 || stepMonth >= 11);
      const stratusSolarPenalty = stratusLockActive
        ? -(1 - provinceSpec.inversionAndWedgeSpec.persistentStratusLock.daytimeSolarDampingFactor) *
          1.4
        : 0;

      const effWaterForHourC =
        primaryWaterBody !== null
          ? (primaryLiveWaterTempC ??
            primaryWaterBody.monthlyWaterTempNormalsC[Math.max(0, Math.min(11, stepMonth - 1))])
          : null;
      const subWaterW =
        primaryWaterBody !== null
          ? (primaryWaterBody.subBasinInfluenceWeights[resolvedNationalTargetMeta.subBasinId] ??
            0.25)
          : 0;
      const onshoreSstDelta =
        effWaterForHourC !== null && subWaterW > 0.05
          ? ((effWaterForHourC - rawTemp) * subWaterW) / 6.0
          : 0;

      const rawAlaroStep = nationalMgmForecasts?.hourlyAlaro.get(utcKey) ?? null;
      const alaroElevAdjustedTempC =
        rawAlaroStep !== null
          ? rawAlaroStep.tempC +
            (nationalVerticalProfile
              ? integrateProvinceVerticalDeltaC(
                  provinceSpec.primaryCenter.demVerifiedElevationM,
                  cityElevationM,
                  nationalVerticalProfile
                )
              : effectiveLapsePerKm *
                ((cityElevationM - provinceSpec.primaryCenter.demVerifiedElevationM) / 1000))
          : null;

      const targetSynopticCtx: TargetSynopticContext = {
        temp850C: columnLevels[2]?.tempC ?? (typeof rawT850 === "number" ? rawT850 : null),
        wind850DirDeg: upperDirDeg,
        wind850SpeedKmh: upperSpeedKmh,
        wetBulbC: wetBulbStullC(rawTemp, relativeHumidityFromDewPoint(rawTemp, rawDew)),
        popPct: rawPop
      };

      nationalCalHour = evaluateProvinceCalibratedHour({
        leadHours: leadHour,
        localHour,
        month: stepMonth,
        spec: provinceSpec,
        bundle: provinceCalibration ?? undefined,
        tempSnapshot: tempSnap,
        dewSnapshot: dewSnap,
        precipSnapshot: precipSnap,
        windSnapshot: windSnap,
        pressureSnapshot: pressSnap,
        drivers: {
          radiativeClearNight: radNightSignal,
          solarHeating: Math.min(1.2, swEst / 750),
          foehnProjection: stepBarrier.foehnTempDeltaC / 4.0,
          onshoreSstDeltaC: onshoreSstDelta
        },
        mgmAlaroHourly:
          rawAlaroStep !== null
            ? {
                tempC: alaroElevAdjustedTempC,
                rhPct: rawAlaroStep.rhPct,
                windSpeedKmh: rawAlaroStep.windSpeedKmh,
                isWet: rawAlaroStep.isWet
              }
            : null,
        targetElevationM: cityElevationM,
        referenceElevationM: cityElevationM,
        microclimateOffsetC:
          0.55 * stepBarrier.foehnTempDeltaC +
          stepMicro.seaBreezeOffsetC +
          stratusSolarPenalty,
        orographicPrecipMultiplier: stepBarrier.precipMultiplier,
        liveKalmanMos: mos,
        liveOriginResidualC: nationalLiveOriginResidualC,
        targetSynopticContext: targetSynopticCtx,
        ensembleTempMembersC: ensTempWeighted?.values ?? null,
        ensembleTempWeights: ensTempWeighted?.weights ?? null
      });

      if (nationalCalHour.bimodal?.isBimodal) {
        bimodalHoursResolved++;
        hourBimodalByTime.set(timeStr, nationalCalHour.bimodal);
      }
    }

    let physAdjustedTemp =
      nationalCalHour !== null
        ? nationalCalHour.temperatureC
        : vertPhys
          ? bursaEmosElevTemp !== null
            ? vertPhys.activeMechanism === "LODOS_DRY_FOEHN"
              ? baseKalmanTemp + 0.18 * vertPhys.tempDeltaC
              : baseKalmanTemp
            : baseKalmanTemp + 0.45 * vertPhys.tempDeltaC
          : baseKalmanTemp;

    if (!isNationalTrProvince && leadHour >= 54 && ensTempWeighted && ensTempStats) {
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
        const detVals = CORE_MODEL_KEYS.map((k) => tempSnap[k]).filter(
          (v): v is number => v !== null && v !== undefined && Number.isFinite(v)
        );
        if (detVals.length >= 3) {
          const detMean = detVals.reduce((a, b) => a + b, 0) / detVals.length;
          const ensAnomalyC = Math.max(-2.6, Math.min(2.6, ensTempStats.p50 - detMean));
          const ensStabilizeW = Math.min(0.22, ((leadHour - 54) / 114) * 0.22);
          physAdjustedTemp += ensStabilizeW * ensAnomalyC;
        }
      }
    }

    const dewPointPrelim = Math.min(
      physAdjustedTemp,
      nationalCalHour?.dewPointC ??
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
      (
        nationalCalHour?.pressureMslHpa ??
        blendKalmanCorrectedScalar({
          snapshot: pressSnap,
          mos,
          param: "pressure",
          leadHour,
          localHour,
          fallback: rawPress
        })
      ).toFixed(1)
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

    const baseWindSpeed =
      nationalCalHour?.windSpeedKmh ??
      blendKalmanCorrectedScalar({
        snapshot: windSnap,
        mos,
        param: "wind",
        leadHour,
        localHour,
        fallback: rawWind
      });
    const windSpeed = Number((baseWindSpeed * nationalVenturiSpeedMult).toFixed(1));
    const windGusts = Number(
      Math.max(
        windSpeed,
        blendHybridParameter(gustSnap, leadGustW, rawGust) * nationalVenturiGustMult
      ).toFixed(1)
    );
    const gustP90 = ensGustStats
      ? Number(Math.max(windGusts, ensGustStats.p90 * nationalVenturiGustMult).toFixed(1))
      : undefined;
    const windDirection = blendWindDirectionDeg(dirSnap, leadWindW, rawWindDir);

    // 2. PRECIPITATION FUSION
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
      ensembleMemberWeights: ensPrecipWeighted?.weights ?? null,
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
      cloudCoverPct: rawCloud,
      localHour,
      month: stepMonth
    });

    const precipWin = getBursaPrecipWindow(utcKey);
    const nationalAlaroStep = nationalMgmForecasts?.hourlyAlaro.get(utcKey) ?? null;
    const nationalMgmDay = nationalMgmForecasts?.dailyDistrict.get(dateYmd) ?? null;
    const mgmWetFlag = isBursaDomain
      ? mgmStep
        ? mgmStep.isWet
        : mgmDay
          ? mgmDay.isWet
          : null
      : nationalAlaroStep
        ? nationalAlaroStep.isWet
        : nationalMgmDay
          ? nationalMgmDay.isWet
          : null;

    const effOroPrecipMult = isNationalTrProvince
      ? nationalBarrierPrecipMult
      : (vertPhys?.precipMultiplier ?? 1);

    const pmqmCheck = fusePrecipitationPmqm({
      leadHours: leadHour,
      regime: stepRegime,
      modelPrecipMm: CORE_MODEL_KEYS.map((mk) => ({
        modelKey: mk,
        precipMmHr: Math.max(0, precipSnap[mk] ?? 0) * effOroPrecipMult,
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
      !virgaVetoed &&
      (bursaTrainedPrecip
        ? bursaTrainedPrecip.isWet
        : nationalCalHour !== null
          ? pmqmCheck.isWetHour || nationalCalHour.precipitationMm >= 0.14
          : pmqmCheck.isWetHour);

    const calibratedNwpPrecipMm = prelimWetHour
      ? bursaTrainedPrecip
        ? Number(
            (
              0.58 * bursaTrainedPrecip.qpfMmHr +
              0.42 * Math.max(baseFusedPrecip.precipitationMm, pmqmCheck.qpfMmHr)
            ).toFixed(2)
          )
        : nationalCalHour !== null
          ? Number(
              (
                0.50 * nationalCalHour.precipitationMm +
                0.50 * (0.5 * baseFusedPrecip.precipitationMm * effOroPrecipMult + 0.5 * pmqmCheck.qpfMmHr)
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
          : nationalCalHour !== null
            ? Math.round(0.5 * pmqmCheck.calibratedPopPct + 0.5 * nationalCalHour.precipProbabilityPct)
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
        liveObsTempC:
          liveBursaSurface?.tempC ?? liveNationalSurface?.tempC ?? mos.anchor.tempObsCityC,
        liveRadarRainMmHr: radarNowcast.radarAvailable ? radarNowcast.currentRainRateMmHr : null,
        liveGaugePrecipMmHr:
          liveBursaSurface?.precipRateMmHr ??
          (liveNationalSurface?.isPrecipitatingNow ? liveNationalSurface.precip1hMm : null),
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
    } else if (nationalCalHour) {
      const shift = temperature - nationalCalHour.temperatureC;
      tempP10 = Number((nationalCalHour.tempP10C + shift).toFixed(1));
      tempP90 = Number((nationalCalHour.tempP90C + shift).toFixed(1));
    }

    const dewPoint = Number(Math.min(temperature, dewPointPrelim).toFixed(1));
    const humidity = Math.round(relativeHumidityFromDewPoint(temperature, dewPoint));
    const wetBulbC = Number(wetBulbStullC(temperature, humidity).toFixed(1));

    const fusedPrecip = {
      ...baseFusedPrecip,
      precipitationMm: stepConsistency.finalIsWet ? stepConsistency.finalPrecipMmHr : 0,
      precipProbabilityPct: stepConsistency.finalPopPct
    };

    const leadTempW = nationalCalHour
      ? nationalCalHour.activeWeights
      : getLeadTimeWeights(
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
    if (leadHour < 168) {
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

    const hasLivePrecipVerify = leadHour <= 1 && liveMetarHasPrecip;
    const rawSnowfallFused = Number(
      Math.max(
        0,
        blendHybridParameter(snowSnap, leadPrecipW, Number(hourlyRaw.snowfall?.[i] ?? 0))
      ).toFixed(2)
    );
    const snowfallCm =
      isWetActiveSample(fusedPrecip.precipitationMm) || hasLivePrecipVerify
        ? rawSnowfallFused
        : 0;

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
      freezingLevelM,
      elevationM: cityElevationM,
      mucape: mucapeEff,
      liveMetarWx: hasLivePrecipVerify ? mos.anchor.wxFlags : null
    });

    if (phaseResult.precipType === "rain") {
      rainAccum += fusedPrecip.precipitationMm;
    } else if (phaseResult.precipType === "snow") {
      snowAccum += Math.max(snowfallCm, fusedPrecip.precipitationMm * 0.8);
    }

    let wmoStormAgreeCount = 0;
    let wmoTotalModels = 0;
    for (const k of CORE_MODEL_KEYS) {
      const code = wmoSnap[k];
      if (code !== null && code !== undefined && Number.isFinite(code)) {
        wmoTotalModels++;
        if (code >= 95) wmoStormAgreeCount++;
      }
    }

    const ensCapeArr = ensCapeWeighted?.values ?? null;
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
    const pressureDelta3hStep = Number((pressure - p3Prev).toFixed(1));
    const pressureDelta6hStep = Number((pressure - p6Prev).toFixed(1));

    hourlyPrecipTrack.push(fusedPrecip.precipitationMm);
    const precip3hAccum =
      fusedPrecip.precipitationMm +
      (hourlyPrecipTrack[leadHour - 1] ?? 0) +
      (hourlyPrecipTrack[leadHour - 2] ?? 0);

    const lpiHour = nowcastHourlyLpi.get(timeStr.slice(0, 13)) ?? null;

    rawStormContexts.push({
      rawWmoCode: wmo,
      wmoStormAgreeCount,
      wmoTotalModels,
      capeFused: mucapeEff,
      sounding: soundingAnalysis,
      ensCapeProb500,
      ensGustP50: ensGustStats?.p50 ?? null,
      ensGustP90: ensGustStats?.p90 ?? null,
      ensGustProb55,
      ensGustProb75,
      pressureDelta3h: pressureDelta3hStep,
      pressureDelta6h: pressureDelta6hStep,
      precip3hAccumMm: precip3hAccum,
      lightningPotential: lpiHour,
      liveMetarWx: leadHour <= 1 && mos.anchor.active ? mos.anchor.wxFlags : null
    });

    // Reconcile WMO weatherCode with calibrated precipitation & hydrometeor phase
    let effectiveWmo = wmo;
    if (phaseResult.precipPhase === "hail") {
      effectiveWmo = 96;
    } else if (phaseResult.precipPhase === "freezing_rain") {
      effectiveWmo = fusedPrecip.precipitationMm >= 1.5 ? 67 : 66;
    } else if (phaseResult.precipPhase === "snow" && effectiveWmo < 71) {
      effectiveWmo =
        fusedPrecip.precipitationMm >= 2.5
          ? 75
          : fusedPrecip.precipitationMm >= 0.6
            ? 73
            : 71;
    } else if (
      phaseResult.precipPhase === "rain" &&
      (effectiveWmo < 51 ||
        (effectiveWmo >= 71 && effectiveWmo <= 77) ||
        effectiveWmo === 85 ||
        effectiveWmo === 86)
    ) {
      effectiveWmo =
        fusedPrecip.precipitationMm >= 4.0
          ? 65
          : fusedPrecip.precipitationMm >= 1.0
            ? 61
            : 51;
    } else if (phaseResult.precipPhase === "none" && effectiveWmo >= 51 && effectiveWmo < 95) {
      const cc = Number(hourlyRaw.cloud_cover?.[i] ?? 40);
      effectiveWmo = cc >= 78 ? 3 : cc >= 38 ? 2 : cc >= 15 ? 1 : 0;
    }

    const rawVisM =
      typeof hourlyRaw.visibility?.[i] === "number" ? Number(hourlyRaw.visibility[i]) : 15000;
    const physVisM = vertPhys
      ? vertPhys.diagnosedVisibilityM
      : Math.max(250, Math.min(30000, rawVisM));
    const visibilityKm = Number((physVisM / 1000).toFixed(1));

    const rawApparent = Number(hourlyRaw.apparent_temperature?.[i] ?? rawTemp);
    const apparentTemperature = Number(
      (rawApparent + (temperature - rawTemp)).toFixed(1)
    );

    const cloudCover = Math.round(
      Math.max(0, Math.min(100, rawCloud))
    );
    const shortwaveRadiationWm2 = estimateShortwaveRadiationWm2(
      typeof hourlyRaw.shortwave_radiation?.[i] === "number"
        ? Number(hourlyRaw.shortwave_radiation[i])
        : null,
      solarElevationDeg,
      cloudCover
    );

    let conditionLabel = mapWmoCodeToLabel(effectiveWmo);
    if (phaseResult.precipPhase === "freezing_rain") {
      conditionLabel = "Donan Yağmur";
    } else if (phaseResult.precipPhase === "sleet") {
      conditionLabel = "Karla Karışık Yağmur";
    } else if (phaseResult.precipPhase === "hail") {
      conditionLabel = "Dolu Riskli Sağanak";
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
      cloudCover,
      shortwaveRadiationWm2,
      visibilityKm,
      uvIndex: Number(Number(hourlyRaw.uv_index?.[i] ?? 0).toFixed(1)),
      precipitation: fusedPrecip.precipitationMm,
      precipProbability: fusedPrecip.precipProbabilityPct,
      precipConsensus: fusedPrecip.consensus,
      precipType: phaseResult.precipType,
      precipPhase: phaseResult.precipPhase,
      snowLineElevationM: phaseResult.snowLineElevationM,
      rainAccum: Number(rainAccum.toFixed(1)),
      snowAccum: Number(snowAccum.toFixed(1)),
      weatherCode: effectiveWmo,
      condition: conditionLabel,
      isStorm: false,
      stormScore: 0,
      solarElevationDeg,
      daylight,
      cape:
        mucapeEff > 0
          ? mucapeEff
          : typeof rawCape === "number" && Number.isFinite(rawCape)
            ? Math.round(rawCape)
            : null,
      cin: typeof rawCin === "number" && Number.isFinite(rawCin) ? Math.round(rawCin) : null,
      liftedIndex:
        typeof rawLi === "number" && Number.isFinite(rawLi) ? Number(rawLi.toFixed(1)) : null,
      freezingLevelM,
      temp850hPa,
      stabilityGrade: stepConsistency.stabilityGrade
    });

    // Per-hour Intrinsic Accuracy Index (0..100%)
    const stepDetCount = CORE_MODEL_KEYS.filter(
      (k) => tempSnap[k] !== null && tempSnap[k] !== undefined && Number.isFinite(tempSnap[k])
    ).length;
    const stepDiurnalBin = Math.min(3, Math.max(0, Math.floor(localHour / 6)));
    const stepDecayPersist = Math.exp(-Math.max(0, leadHour) / 60);
    const stepDecayTrans = Math.exp(-Math.max(0, leadHour) / 10);
    const stepDecayDiur = Math.exp(-Math.max(0, leadHour) / 72);
    const stepCalibratedSpreadC = computeCalibratedWeightedSpread({
      snapshot: tempSnap,
      weights: leadTempW,
      biases: Object.fromEntries(
        CORE_MODEL_KEYS.map((k) => [
          k,
          mos.biases[k].tempPersistentBiasC * stepDecayPersist +
            mos.biases[k].tempTransientBiasC * stepDecayTrans +
            0.72 * mos.biases[k].tempDiurnalBiasC[stepDiurnalBin] * stepDecayDiur
        ])
      ),
      ensembleIqr: ensTempStats ? ensTempStats.p75 - ensTempStats.p25 : null
    });
    const stepCalibratedPressSpread = computeCalibratedWeightedSpread({
      snapshot: pressSnap,
      weights: getLeadTimeWeights(
        mos.shortRangeWeights.pressure,
        mos.mediumRangeWeights.pressure,
        leadHour
      ),
      biases: Object.fromEntries(
        CORE_MODEL_KEYS.map((k) => [
          k,
          mos.biases[k].pressKalmanBiasHpa * Math.exp(-Math.max(0, leadHour) / 15)
        ])
      )
    });
    const stepBimodal = hourBimodalByTime.get(timeStr) ?? null;
    const stepPrecipTotalModels = fusedPrecip.consensus.totalModels;
    const stepWetFrac =
      stepPrecipTotalModels > 0
        ? fusedPrecip.consensus.agreeingModels / stepPrecipTotalModels
        : null;
    const stepPrecipSpreadMm =
      fusedPrecip.consensus.p90Mm !== undefined && fusedPrecip.consensus.p10Mm !== undefined
        ? Math.max(0, fusedPrecip.consensus.p90Mm - fusedPrecip.consensus.p10Mm)
        : Math.max(0, fusedPrecip.consensus.maxMm - fusedPrecip.consensus.minMm);

    const stepAccuracy = computeIntrinsicAccuracyIndex({
      leadHours: leadHour,
      activeModelCount: hybridStreamFailed ? 1 : Math.max(1, stepDetCount),
      ensembleMemberCount: ensTempArr?.length ?? 0,
      verificationMode: mos.report.mode,
      verifiedStationCount: mos.summary.stationCount,
      matchedVerificationHours: mos.report.matchedHours,
      nowcastKalmanGain: mos.anchor.tempKalmanGain,
      bestTempUbRmseC: bestVerifiedTempUbRmseC,
      isBursaEmosActive:
        isBursaEmosActive ||
        Boolean(isNationalTrProvince && provinceSpec?.calibrationTier === "TIER_A_WMO"),
      radarAvailable: radarNowcast.radarAvailable,
      calibratedTempSpreadC: stepCalibratedSpreadC,
      calibratedPressureSpreadHpa: stepCalibratedPressSpread,
      wetModelFraction: stepWetFrac,
      precipProbPct: fusedPrecip.precipProbabilityPct,
      precipSpreadMmHr: stepPrecipSpreadMm,
      bimodalSeparationC: stepBimodal?.isBimodal ? stepBimodal.separationC : 0,
      microclimateUncertaintyC: bursaMicroclimateUncC,
      runLockCount: stepConsistency.consecutiveRunLockCount,
      stabilityGrade: stepConsistency.stabilityGrade,
      hysteresisDamped: stepConsistency.hysteresisDamped,
      freshnessStatus: liveDegradedCount > 0 ? "degraded" : "live",
      degradedStreamCount: liveDegradedCount
    });

    hourMetaByTime.set(timeStr, {
      activeModels: Math.max(1, stepDetCount),
      ensMembers: ensTempArr?.length ?? 0,
      confidencePct: stepAccuracy.totalPct
    });
  }

  // STAGE 3B: EXTENDED SYNOPTIC CALIBRATION LOOP (LEAD HOURS 168..359 -> DAYS 8..15!)
  const maxExtendedIdx = Math.min(startIdx + 360, times.length);
  if (maxExtendedIdx > maxHourlyIdx) {
    const ensWetProbByIndex = new Map<number, number>();
    if (ensIndex.precipCols.length >= 8) {
      for (const idxVal of ensIndex.utcIndex.values()) {
        const pRowW = readEnsembleRowWithWeights(
          ensIndex.precipCols,
          ensIndex.precipColWeights,
          idxVal
        );
        if (pRowW && pRowW.values.length > 0) {
          let wWet = 0;
          let wTot = 0;
          for (let cIdx = 0; cIdx < pRowW.values.length; cIdx++) {
            const w = pRowW.weights[cIdx] ?? 1;
            wTot += w;
            if (pRowW.values[cIdx] >= 0.15) wWet += w;
          }
          ensWetProbByIndex.set(idxVal, wTot > 0 ? (wWet / wTot) * 100 : 0);
        }
      }
    }

    for (let i = maxHourlyIdx; i < maxExtendedIdx; i++) {
      const leadHour = i - startIdx;
      const timeStr = times[i];
      const dateYmd = timeStr.slice(0, 10);
      const localHour = Number(timeStr.slice(11, 13)) || 0;
      const utcDate = timesUtcDates[i] ?? tzResolver.localIsoToUtcDate(timeStr);
      const utcKey = utcDate.toISOString().slice(0, 16);
      const hourDayLabel = formatRelativeDayLabelTr(dateYmd, originTodayYmd, "weekday");

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
      const wmoSnap = readExtendedModelSnapshot("weather_code", utcKey);
      const windSnap = readExtendedModelSnapshot("wind_speed_10m", utcKey);
      const gustSnap = readExtendedModelSnapshot("wind_gusts_10m", utcKey);
      const dirSnap = readExtendedModelSnapshot("wind_direction_10m", utcKey);
      const t850Snap = readExtendedModelSnapshot("temperature_850hPa", utcKey, true);
      const capeSnap = readExtendedModelSnapshot("cape", utcKey);

      const eIdx = ensIndex.utcIndex.get(utcKey);
      const ensTempWeighted = readEnsembleRowWithWeights(
        ensIndex.tempCols,
        ensIndex.tempColWeights,
        eIdx
      );
      const ensPrecipWeighted = readEnsembleRowWithWeights(
        ensIndex.precipCols,
        ensIndex.precipColWeights,
        eIdx
      );
      const ensGustWeighted = readEnsembleRowWithWeights(
        ensIndex.gustCols,
        ensIndex.gustColWeights,
        eIdx
      );
      const ensCapeWeighted = readEnsembleRowWithWeights(
        ensIndex.capeCols,
        ensIndex.capeColWeights,
        eIdx
      );
      const ensPrecipArr = ensPrecipWeighted?.values ?? null;
      const ensGustArr = ensGustWeighted?.values ?? null;
      const ensCapeArr = ensCapeWeighted?.values ?? null;
      const ensGustStats = ensGustWeighted
        ? computeEnsembleDistStats(ensGustWeighted.values, ensGustWeighted.weights)
        : null;

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
        : isNationalTrProvince && provinceSpec && !hybridStreamFailed
          ? evaluateProvinceCalibratedHour({
              leadHours: leadHour,
              localHour,
              month: utcDate.getUTCMonth() + 1,
              spec: provinceSpec,
              bundle: provinceCalibration ?? undefined,
              tempSnapshot: tempSnap,
              targetElevationM: cityElevationM,
              referenceElevationM: cityElevationM,
              liveKalmanMos: mos
            }).temperatureC
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
        provinceCode: resolvedProvinceCode,
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
      const extSnowRaw = Number(
        Math.max(
          0,
          blendHybridParameter(
            snowSnap,
            mos.mediumRangeWeights.precipitation,
            Number(hourlyRaw.snowfall?.[i] ?? 0)
          )
        ).toFixed(2)
      );
      const extSnowCm = isWetActiveSample(extConsistency.finalPrecipMmHr) ? extSnowRaw : 0;
      const rawWmo = Number(hourlyRaw.weather_code?.[i] ?? 1);

      const extCapeFused = Math.round(
        Math.max(
          0,
          blendHybridParameter(
            capeSnap,
            mos.mediumRangeWeights.precipitation,
            typeof rawCape === "number" && Number.isFinite(rawCape) ? rawCape : 0
          )
        )
      );

      let extWmoStormAgreeCount = 0;
      let extWmoTotalModels = 0;
      for (const k of CORE_MODEL_KEYS) {
        const code = wmoSnap[k];
        if (code !== null && code !== undefined && Number.isFinite(code)) {
          extWmoTotalModels++;
          if (code >= 95) extWmoStormAgreeCount++;
        }
      }

      const extEnsCapeProb500 =
        ensCapeArr && ensCapeArr.length > 0
          ? (ensCapeArr.filter((v) => v >= 500).length / ensCapeArr.length) * 100
          : 0;
      const extEnsGustProb55 =
        ensGustArr && ensGustArr.length > 0
          ? (ensGustArr.filter((v) => v >= 55).length / ensGustArr.length) * 100
          : 0;
      const extEnsGustProb75 =
        ensGustArr && ensGustArr.length > 0
          ? (ensGustArr.filter((v) => v >= 75).length / ensGustArr.length) * 100
          : 0;

      const prev3Pt =
        leadHour - 3 < hourly.length
          ? hourly[leadHour - 3]
          : extendedSynopticHours[leadHour - 3 - hourly.length];
      const prev6Pt =
        leadHour - 6 < hourly.length
          ? hourly[leadHour - 6]
          : extendedSynopticHours[leadHour - 6 - hourly.length];
      const extP3Prev = prev3Pt?.pressure ?? extCal.pressureHpa;
      const extP6Prev = prev6Pt?.pressure ?? extCal.pressureHpa;

      hourlyPrecipTrack.push(extConsistency.finalPrecipMmHr);
      const extPrecip3hAccum =
        extConsistency.finalPrecipMmHr +
        (hourlyPrecipTrack[leadHour - 1] ?? 0) +
        (hourlyPrecipTrack[leadHour - 2] ?? 0);

      rawStormContexts.push({
        rawWmoCode: rawWmo,
        wmoStormAgreeCount: extWmoStormAgreeCount,
        wmoTotalModels: extWmoTotalModels,
        capeFused: extCapeFused,
        sounding: null,
        ensCapeProb500: extEnsCapeProb500,
        ensGustP50: ensGustStats?.p50 ?? null,
        ensGustP90: ensGustStats?.p90 ?? null,
        ensGustProb55: extEnsGustProb55,
        ensGustProb75: extEnsGustProb75,
        pressureDelta3h: Number((extCal.pressureHpa - extP3Prev).toFixed(1)),
        pressureDelta6h: Number((extCal.pressureHpa - extP6Prev).toFixed(1)),
        precip3hAccumMm: extPrecip3hAccum,
        lightningPotential: null,
        liveMetarWx: null
      });

      const extPhase = classifyPrecipPhase({
        temperatureC: extTemp,
        humidityPct: extRh,
        precipitationMm: extConsistency.finalPrecipMmHr,
        snowfallCm: extSnowCm,
        weatherCode: rawWmo,
        temp850hPa: extT850,
        freezingLevelM: extFrz,
        elevationM: cityElevationM,
        mucape: extCapeFused
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
        shortwaveRadiationWm2: estimateShortwaveRadiationWm2(
          typeof hourlyRaw.shortwave_radiation?.[i] === "number"
            ? Number(hourlyRaw.shortwave_radiation[i])
            : null,
          solarElevationDeg,
          Number(hourlyRaw.cloud_cover?.[i] ?? 40)
        ),
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
        isStorm: false,
        stormScore: 0,
        solarElevationDeg,
        daylight,
        cape:
          extCapeFused > 0
            ? extCapeFused
            : typeof rawCape === "number" && Number.isFinite(rawCape)
              ? Math.round(rawCape)
              : null,
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

  // STAGE 3C: COUPLED 360-HOUR SNOW MICROPHYSICS (WITH 24H ANTECEDENT SNOWPACK MEMORY & PROVINCE WATER BODIES)
  const antecedentThermalHours: AntecedentThermalHour[] = [];
  for (let backH = 24; backH >= 1; backH--) {
    const pastUtc = new Date(startHourUtcMs - backH * 3600000);
    const pastUtcKey = pastUtc.toISOString().slice(0, 16);
    const pastHIdx = utcTimeIndex.get(pastUtcKey);
    const pastLocalIdx = startIdx - backH;
    if (pastLocalIdx >= 0 && pastLocalIdx < times.length) {
      const pTemp = Number(
        hourlyRaw.temperature_2m?.[pastLocalIdx] ?? hourly[0]?.temperature ?? 10
      );
      const pCloud = Number(hourlyRaw.cloud_cover?.[pastLocalIdx] ?? 40);
      const pElev = computeSolarElevationDeg(location.lat, location.lon, pastUtc);
      const pPrecip = Math.max(0, Number(hourlyRaw.precipitation?.[pastLocalIdx] ?? 0));
      const pSnow =
        pPrecip >= 0.05
          ? Math.max(0, Number(hourlyRaw.snowfall?.[pastLocalIdx] ?? 0))
          : 0;
      const pRhRaw = hourlyRaw.relative_humidity_2m?.[pastLocalIdx];
      const pDewRaw = hourlyRaw.dew_point_2m?.[pastLocalIdx];
      const pRh =
        typeof pRhRaw === "number" && Number.isFinite(pRhRaw)
          ? pRhRaw
          : typeof pDewRaw === "number" && Number.isFinite(pDewRaw)
            ? relativeHumidityFromDewPoint(pTemp, pDewRaw)
            : pPrecip >= 0.1
              ? 88
              : 72;
      const pWetBulb = Number(wetBulbStullC(pTemp, pRh).toFixed(1));

      antecedentThermalHours.push({
        temp2mC: pTemp,
        shortwaveWm2: estimateShortwaveRadiationWm2(
          typeof hourlyRaw.shortwave_radiation?.[pastLocalIdx] === "number"
            ? Number(hourlyRaw.shortwave_radiation[pastLocalIdx])
            : null,
          pElev,
          pCloud
        ),
        cloudCoverPct: pCloud,
        precipMmHr: pPrecip,
        snowfallCm: pSnow,
        wetBulbC: pWetBulb
      });
    } else if (pastHIdx !== undefined && hybridHourly) {
      const pTempSnap = readExtendedModelSnapshot("temperature_2m", pastUtcKey);
      const pDewSnap = readExtendedModelSnapshot("dew_point_2m", pastUtcKey);
      const pCloudSnap = readExtendedModelSnapshot("cloud_cover", pastUtcKey);
      const pSwSnap = readExtendedModelSnapshot("shortwave_radiation", pastUtcKey);
      const pPrecSnap = readExtendedModelSnapshot("precipitation", pastUtcKey);
      const pSnowSnap = readExtendedModelSnapshot("snowfall", pastUtcKey);
      const pElev = computeSolarElevationDeg(location.lat, location.lon, pastUtc);
      const pCloud = blendHybridParameter(pCloudSnap, WMO_PRIOR_WEIGHTS.temperature, 40);
      const pTemp = blendHybridParameter(
        pTempSnap,
        mos.shortRangeWeights.temperature,
        hourly[0]?.temperature ?? 10
      );
      const pDew = Math.min(
        pTemp,
        blendHybridParameter(
          pDewSnap,
          mos.shortRangeWeights.temperature,
          pTemp - 3
        )
      );
      const pRh = relativeHumidityFromDewPoint(pTemp, pDew);
      const pWetBulb = Number(wetBulbStullC(pTemp, pRh).toFixed(1));
      const pPrecip = Math.max(
        0,
        blendHybridParameter(pPrecSnap, mos.shortRangeWeights.precipitation, 0)
      );
      const pSnow =
        pPrecip >= 0.05
          ? Math.max(
              0,
              blendHybridParameter(pSnowSnap, mos.shortRangeWeights.precipitation, 0)
            )
          : 0;

      antecedentThermalHours.push({
        temp2mC: pTemp,
        shortwaveWm2: estimateShortwaveRadiationWm2(
          blendHybridParameter(pSwSnap, WMO_PRIOR_WEIGHTS.temperature, -1),
          pElev,
          pCloud
        ),
        cloudCoverPct: pCloud,
        precipMmHr: pPrecip,
        snowfallCm: pSnow,
        wetBulbC: pWetBulb
      });
    }
  }

  const all360Hours: HourlyPoint[] = [...hourly, ...extendedSynopticHours];
  const snowSimInputs: SnowSimulationHourInput[] = all360Hours.map((pt, idxAll) => {
    const srcIdx = startIdx + idxAll;
    const utcD =
      srcIdx < timesUtcDates.length
        ? timesUtcDates[srcIdx]
        : tzResolver.localIsoToUtcDate(pt.time);
    const uK = utcD.toISOString().slice(0, 16);
    const eRowIdx = ensIndex.utcIndex.get(uK);
    const ensTMembers = readEnsembleRow(ensIndex.tempCols, eRowIdx);
    const hasLiveMetarPrecipAtHour = idxAll <= 1 && liveMetarHasPrecip;
    const isHourWet =
      isWetActiveSample(pt.precipitation) || hasLiveMetarPrecipAtHour;
    const rawModSnow =
      isHourWet && srcIdx < times.length
        ? Math.max(0, Number(hourlyRaw.snowfall?.[srcIdx] ?? 0))
        : 0;
    const sstAtHour = isBursaDomain
      ? (marmaraSstBundle?.hourlySstByUtc.get(uK) ?? marmaraSstBundle?.currentSstC ?? null)
      : isNationalTrProvince
        ? primaryLiveWaterTempC
        : null;
    const sLevels =
      idxAll < hourlySoundings.length
        ? hourlySoundings[idxAll]
        : idxAll < 168 && srcIdx < times.length
          ? buildSoundingAtIndex(srcIdx)
          : undefined;
    const rawT700AtHour =
      srcIdx < times.length && typeof hourlyRaw["temperature_700hPa"]?.[srcIdx] === "number"
        ? Number(hourlyRaw["temperature_700hPa"][srcIdx])
        : (sLevels?.find((l) => l.pressure === 700)?.temperature ?? null);

    return {
      timeIso: pt.time,
      dateYmd: pt.time.slice(0, 10),
      leadHour: idxAll,
      elevationM: cityElevationM,
      lat: location.lat,
      lon: location.lon,
      temp2mC: pt.temperature,
      tempP10C: pt.tempP10,
      tempP90C: pt.tempP90,
      rh2mPct: pt.humidity,
      wetBulbC: pt.wetBulbC ?? wetBulbStullC(pt.temperature, pt.humidity),
      windSpeedKmh: pt.windSpeed,
      windGustsKmh: pt.windGusts,
      windDirDeg: pt.windDirection,
      cloudCoverPct: pt.cloudCover,
      solarElevationDeg: pt.solarElevationDeg,
      shortwaveWm2:
        pt.shortwaveRadiationWm2 ??
        estimateShortwaveRadiationWm2(null, pt.solarElevationDeg, pt.cloudCover),
      precipMmHr: pt.precipitation,
      precipP90MmHr: pt.precipConsensus.p90Mm ?? pt.precipitation,
      precipProbPct: pt.precipProbability,
      rawModelSnowfallCm: rawModSnow,
      precipPhase: isHourWet ? (pt.precipPhase ?? "none") : "none",
      freezingLevelM: pt.freezingLevelM,
      temp850hPa: pt.temp850hPa,
      temp700hPa: rawT700AtHour,
      capeJkg: pt.cape ?? 0,
      seaSurfaceTempC: sstAtHour,
      provinceCode: resolvedProvinceCode,
      waterBodies: isNationalTrProvince && provinceSpec ? provinceSpec.waterBodies : undefined,
      liveWaterTempC: sstAtHour,
      soundingLevels: sLevels,
      lapseRateCPerKm: effectiveLapsePerKm,
      ensembleTempMembersC: ensTMembers
    };
  });

  const snowSimOutputs = simulateCoupledSnowTimeline({
    hours: snowSimInputs,
    antecedentHours: antecedentThermalHours,
    initialSnowpackCm: isNationalTrProvince ? (mgmLiveSnowpackCm ?? undefined) : undefined,
    provinceCode: resolvedProvinceCode,
    locationName: location.name,
    waterBodies: isNationalTrProvince && provinceSpec ? provinceSpec.waterBodies : undefined,
    liveWaterTempC: isNationalTrProvince
      ? primaryLiveWaterTempC
      : (marmaraSstBundle?.currentSstC ?? null)
  });

  const simByTimeMap = new Map<string, SimulatedSnowHourOutput>();
  const lightningByTimeMap = new Map<string, LightningHourPhysicsResult>();
  const liveMetarHasTs =
    (mos.anchor.active && Boolean(mos.anchor.wxFlags?.isThunderstorm)) ||
    (mos.report.stations ?? (mos.report.station ? [mos.report.station] : [])).some(
      (st) => st.ageMinutes <= 75 && st.distanceKm <= 45 && Boolean(st.wxFlags?.isThunderstorm)
    );

  let runningLiquidRainMm = 0;
  for (let idxAll = 0; idxAll < all360Hours.length; idxAll++) {
    const pt = all360Hours[idxAll] as ExtendedHourlyPoint;
    const sim = snowSimOutputs[idxAll];
    const simIn = snowSimInputs[idxAll];
    const stormCtx = rawStormContexts[idxAll];
    if (!sim) continue;
    simByTimeMap.set(pt.time, sim);

    if (idxAll < 48 && sim.dekStatus !== "none") {
      activeMicroclimateTagSet.add("DEK_LAKE_EFFECT");
    }

    const hasLivePrecipAtHour = idxAll <= 1 && liveMetarHasPrecip;
    const isHourWet =
      isWetActiveSample(pt.precipitation, sim.airSnowCm) || hasLivePrecipAtHour;
    const activePhase: PrecipPhase = isHourWet ? sim.refinedPhase : "none";
    const activeType: PrecipType = !isHourWet
      ? "none"
      : activePhase === "snow" || (activePhase === "sleet" && sim.airSnowCm >= 0.15)
        ? "snow"
        : activePhase === "none"
          ? "none"
          : "rain";

    const wmoAgreeRatio =
      stormCtx && stormCtx.wmoTotalModels > 0
        ? stormCtx.wmoStormAgreeCount / stormCtx.wmoTotalModels
        : 0;
    const priorConvectivePct =
      pt.precipitation >= 0.1 || pt.precipProbability >= 25
        ? Math.round(
            Math.max(
              wmoAgreeRatio * 85,
              (stormCtx?.ensCapeProb500 ?? 0) * (pt.precipitation >= 0.25 ? 0.65 : 0.35)
            )
          )
        : Math.round(wmoAgreeRatio * 45);

    const rawWmoCode = stormCtx?.rawWmoCode ?? pt.weatherCode;
    const lpiRaw = nowcastHourlyLpi.get(pt.time.slice(0, 13)) ?? null;
    const ltEval = evaluateHourLightningPhysics({
      temp2mC: pt.temperature,
      wetBulbC: pt.wetBulbC ?? simIn.wetBulbC,
      precipMmHr: pt.precipitation,
      precipProbPct: pt.precipProbability,
      precipPhase: activePhase,
      capeJkg: pt.cape ?? 0,
      liftedIndex: pt.liftedIndex,
      lpiJkg: lpiRaw,
      stormLightningProbPct: priorConvectivePct,
      wmoCode: rawWmoCode,
      wmoStormAgreeCount: stormCtx?.wmoStormAgreeCount,
      rawWmoCode,
      temp850hPa: pt.temp850hPa,
      dekStatus: sim.dekStatus,
      dekDeltaTC: sim.dekDeltaTSst850C,
      windGustsKmh: pt.windGusts,
      soundingLevels: simIn.soundingLevels,
      liveMetarTs: idxAll <= 1 && liveMetarHasTs
    });
    lightningByTimeMap.set(pt.time, ltEval);

    const snowSwePart = sim.slr > 0 ? (sim.airSnowCm * 10) / sim.slr : 0;
    const liqPart = Math.max(0, pt.precipitation - snowSwePart);
    if (idxAll < 240) {
      runningLiquidRainMm += liqPart;
    }

    pt.snowLineElevationM = sim.snowLineElevationM;
    pt.wetBulbZeroM = sim.wetBulbZeroM;
    pt.meltingEnergyJkg = sim.meltingEnergyJkg;
    pt.precipPhase = activePhase;
    pt.potentialPrecipPhase = sim.potentialPhase;
    pt.precipType = activeType;
    pt.rainAccum = Number(runningLiquidRainMm.toFixed(1));
    pt.snowAccum = sim.cumulativeAirSnowCm;
    pt.airSnowCm = isHourWet ? sim.airSnowCm : 0;
    pt.airSnowProbPct = sim.airSnowProbPct;
    pt.groundSnowCm = isHourWet ? sim.groundSnowCm : 0;
    pt.roadSnowCm = isHourWet ? sim.roadSnowCm : 0;
    pt.snowpackDepthCm = sim.snowpackDepthCm;
    pt.roadSnowDepthCm = sim.roadSnowDepthCm;
    pt.groundAccumSnowCm = sim.cumulativeGroundSnowCm;
    pt.soilTempC = sim.soilTempC;
    pt.roadTempC = sim.roadTempC;
    pt.snowSlr = sim.slr;
    pt.snowQualityTr = sim.snowQualityTr;
    pt.icingRisk = sim.icingRisk;
    pt.blowingSnowRisk = sim.blowingSnowRisk;
    pt.dekStatus = sim.dekStatus;
    pt.elevationSnowBands = sim.elevationBands;

    pt.lightningProbPct = ltEval.lightningProbPct;
    pt.lpiJkg = ltEval.lpiEffectiveJkg;
    pt.lightningFlashesPerMin = ltEval.flashesPerMin;
    pt.cgFractionPct = ltEval.cgFractionPct;
    pt.isThundersnow = ltEval.isThundersnow;

    if (!isHourWet) {
      if (
        pt.weatherCode >= 51 &&
        !(ltEval.lightningProbPct >= 55 && pt.weatherCode >= 95)
      ) {
        pt.weatherCode =
          pt.cloudCover >= 78 ? 3 : pt.cloudCover >= 38 ? 2 : pt.cloudCover >= 15 ? 1 : 0;
      }
      const drySkyLabel = mapWmoCodeToLabel(pt.weatherCode);
      if (pt.precipProbability >= 22) {
        const wetHint =
          (pt.wetBulbC ?? pt.temperature) <= 0.2
            ? "Kar İhtimali"
            : (pt.wetBulbC ?? pt.temperature) <= 1.6
              ? "Sulu Kar İhtimali"
              : "Yağış İhtimali";
        pt.condition = `${drySkyLabel} (${wetHint})`;
      } else {
        pt.condition = drySkyLabel;
      }
    } else if (ltEval.isThundersnow && pt.precipitation >= 0.2) {
      pt.weatherCode = Math.max(pt.weatherCode, 95);
      pt.condition = "Gökgürültülü Kar (Thundersnow)";
    } else if (ltEval.lightningProbPct >= 58 && pt.precipitation >= 0.4) {
      pt.weatherCode = Math.max(pt.weatherCode, 95);
      pt.condition =
        activePhase === "hail"
          ? "Dolu Riskli Sağanak"
          : mapWmoCodeToLabel(pt.weatherCode);
    } else if (activePhase === "hail") {
      pt.weatherCode = 96;
      pt.condition = "Dolu Riskli Sağanak";
    } else if (activePhase === "freezing_rain") {
      pt.weatherCode = 66;
      pt.condition = "Donan Yağmur";
    } else if (activePhase === "sleet") {
      if (pt.weatherCode < 51) {
        pt.weatherCode = pt.precipitation >= 1.5 ? 61 : 51;
      }
      pt.condition = "Karla Karışık Yağmur";
    } else if (
      activePhase === "rain" &&
      ((pt.weatherCode >= 71 && pt.weatherCode <= 77) ||
        pt.weatherCode === 85 ||
        pt.weatherCode === 86 ||
        pt.weatherCode < 51)
    ) {
      pt.weatherCode = pt.precipitation >= 1.5 ? 61 : 51;
      pt.condition = mapWmoCodeToLabel(pt.weatherCode);
    } else if (activePhase === "snow" && pt.weatherCode < 71) {
      pt.weatherCode = pt.precipitation >= 2.2 ? 75 : 73;
      pt.condition = mapWmoCodeToLabel(pt.weatherCode);
    }
  }

  // Persist calibrated 168-hour trajectory lock for active synoptic cycle (province-isolated shard!)
  if (Object.keys(currentCycleHourLocks).length > 0) {
    saveCalibratedRunToLedger(ledgerLocKey, {
      cycleId: activeCycleId,
      createdAtMs: exactNowUtcMs,
      regime: initialRegimeNow,
      hours: currentCycleHourLocks
    });
  }

  // Compute sub-hourly & sensor-fused `current` scalars BEFORE radar reconciliation & canonical point
  const curUtcKey = timesUtcDates[startIdx]
    ? tzResolver.localIsoToUtcHourKey(times[startIdx])
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
  const curDiurnalBin = Math.min(
    3,
    Math.max(0, Math.floor((((startLocalHour % 24) + 24) % 24) / 6))
  );
  const curEnsIdx = ensIndex.utcIndex.get(curUtcKey);
  const curEnsTempWeighted = readEnsembleRowWithWeights(
    ensIndex.tempCols,
    ensIndex.tempColWeights,
    curEnsIdx
  );
  const curEnsTempStats = curEnsTempWeighted
    ? computeEnsembleDistStats(curEnsTempWeighted.values, curEnsTempWeighted.weights)
    : null;
  const curCalibratedSpreadC = computeCalibratedWeightedSpread({
    snapshot: curTempSnap,
    weights: mos.shortRangeWeights.temperature,
    biases: Object.fromEntries(
      CORE_MODEL_KEYS.map((k) => [
        k,
        mos.biases[k].tempPersistentBiasC +
          mos.biases[k].tempTransientBiasC +
          0.72 * mos.biases[k].tempDiurnalBiasC[curDiurnalBin]
      ])
    ),
    ensembleIqr: curEnsTempStats ? curEnsTempStats.p75 - curEnsTempStats.p25 : null
  });
  const curCalibratedPressSpread = computeCalibratedWeightedSpread({
    snapshot: curPressSnap,
    weights: mos.shortRangeWeights.pressure,
    biases: Object.fromEntries(
      CORE_MODEL_KEYS.map((k) => [k, mos.biases[k].pressKalmanBiasHpa])
    )
  });
  const curPrecipConsensusPrelim = computePrecipConsensus(curPrecipSnap);
  const curStepConsistency = consistencyTrack[0];
  const curAccuracyBreakdown = computeIntrinsicAccuracyIndex({
    leadHours: 0,
    activeModelCount: hybridStreamFailed ? 1 : activeModels.length,
    ensembleMemberCount: curEnsTempWeighted?.values.length ?? ensIndex.memberCount,
    verificationMode: mos.report.mode,
    verifiedStationCount: mos.summary.stationCount,
    matchedVerificationHours: mos.report.matchedHours,
    nowcastKalmanGain: mos.anchor.tempKalmanGain,
    bestTempUbRmseC: bestVerifiedTempUbRmseC,
    isBursaEmosActive:
      isBursaEmosActive ||
      Boolean(isNationalTrProvince && provinceSpec?.calibrationTier === "TIER_A_WMO"),
    radarAvailable: radarNowcast.radarAvailable,
    calibratedTempSpreadC: curCalibratedSpreadC,
    calibratedPressureSpreadHpa: curCalibratedPressSpread,
    wetModelFraction:
      curPrecipConsensusPrelim.totalModels > 0
        ? curPrecipConsensusPrelim.agreeingModels / curPrecipConsensusPrelim.totalModels
        : null,
    precipProbPct: hourly[0]?.precipProbability ?? 0,
    precipSpreadMmHr: Math.max(
      0,
      curPrecipConsensusPrelim.maxMm - curPrecipConsensusPrelim.minMm
    ),
    microclimateUncertaintyC: bursaMicroclimateUncC,
    runLockCount: curStepConsistency?.consecutiveRunLockCount,
    stabilityGrade: curStepConsistency?.stabilityGrade,
    hysteresisDamped: curStepConsistency?.hysteresisDamped,
    freshnessStatus: liveDegradedCount > 0 ? "degraded" : "live",
    degradedStreamCount: liveDegradedCount
  });
  const confidencePct = curAccuracyBreakdown.totalPct;

  const firstHourRaw = hourly[0];
  const secondHourRaw = hourly[1] ?? firstHourRaw;
  const rawUncorrectedTemp = blendHybridParameter(
    curTempSnap,
    mos.shortRangeWeights.temperature,
    Number(cur.temperature_2m ?? firstHourRaw?.temperature ?? 0)
  );

  const subHourlyModelTemp = firstHourRaw
    ? (1 - subHourFrac) * firstHourRaw.temperature +
      subHourFrac * (secondHourRaw?.temperature ?? firstHourRaw.temperature)
    : rawUncorrectedTemp;
  const hybridCurTemp = Number(
    (liveBursaSurface !== null
      ? 0.94 * liveBursaSurface.tempC + 0.06 * subHourlyModelTemp
      : liveNationalSurface !== null
        ? 0.92 * liveNationalSurface.tempC + 0.08 * subHourlyModelTemp
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
      liveBursaSurface?.dewPointC ??
        liveNationalSurface?.dewPointC ??
        firstHourRaw?.dewPoint ??
        Number(cur.dew_point_2m ?? 0)
    ).toFixed(1)
  );
  const hybridCurRh = Math.round(relativeHumidityFromDewPoint(hybridCurTemp, hybridCurDew));
  const rawCurApparent = Number(
    cur.apparent_temperature ?? firstHourRaw?.apparentTemperature ?? hybridCurTemp
  );
  const hybridCurApparent = Number(
    (rawCurApparent + (hybridCurTemp - Number(cur.temperature_2m ?? hybridCurTemp))).toFixed(1)
  );
  const pNow = Number(
    (
      liveBursaSurface?.pressureMslHpa ??
      liveNationalSurface?.pressureMslHpa ??
      firstHourRaw?.pressure ??
      Number(cur.pressure_msl ?? 1013)
    ).toFixed(1)
  );
  const hybridCurWind = Number(
    (liveBursaSurface?.windSpeedKt !== null && liveBursaSurface?.windSpeedKt !== undefined
      ? 0.7 * (liveBursaSurface.windSpeedKt * 1.852) + 0.3 * (firstHourRaw?.windSpeed ?? 0)
      : liveNationalSurface?.windSpeedKmh !== null && liveNationalSurface?.windSpeedKmh !== undefined
        ? 0.7 * liveNationalSurface.windSpeedKmh + 0.3 * (firstHourRaw?.windSpeed ?? 0)
        : firstHourRaw?.windSpeed ?? Number(cur.wind_speed_10m ?? 0)
    ).toFixed(1)
  );
  const hybridCurGust = Math.max(
    hybridCurWind,
    liveNationalSurface?.windGustKmh ?? 0,
    firstHourRaw?.windGusts ?? Number(cur.wind_gusts_10m ?? hybridCurWind)
  );
  const hybridCurDir =
    liveBursaSurface?.windDirDeg ??
    liveNationalSurface?.windDirDeg ??
    firstHourRaw?.windDirection ??
    Number(cur.wind_direction_10m ?? 0);

  const liveSurfacePrecipMmHr =
    liveBursaSurface?.precipRateMmHr ??
    (liveNationalSurface?.isPrecipitatingNow ? liveNationalSurface.precip1hMm : null);
  const hybridCurPrecip =
    radarNowcast.radarAvailable && radarNowcast.currentRainRateMmHr > 0
      ? Number(
          (
            0.70 * radarNowcast.currentRainRateMmHr +
            0.30 * (liveSurfacePrecipMmHr ?? firstHourRaw?.precipitation ?? 0)
          ).toFixed(2)
        )
      : liveBursaSurface?.isPrecipitatingNow
        ? liveBursaSurface.precipRateMmHr
        : liveNationalSurface?.isPrecipitatingNow
          ? liveNationalSurface.precip1hMm
          : firstHourRaw?.precipitation ?? 0;

  const curPrecipConsensus =
    firstHourRaw?.precipConsensus ?? computePrecipConsensus(curPrecipSnap);

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

  const curSolarElev = Number(
    computeSolarElevationDeg(location.lat, location.lon, new Date(exactNowUtcMs)).toFixed(1)
  );
  const curUv = firstHourRaw?.uvIndex ?? 0;

  // 3-RING DOPPLER + METAR PROXIMITY RADAR & RECONCILIATION
  const hour0LtBase =
    (firstHourRaw ? lightningByTimeMap.get(firstHourRaw.time) : undefined) ?? {
      lightningProbPct: firstHourRaw?.lightningProbPct ?? 0,
      lpiEffectiveJkg: firstHourRaw?.lpiJkg ?? 0,
      flashesPerMin: firstHourRaw?.lightningFlashesPerMin ?? 0,
      cgFractionPct: firstHourRaw?.cgFractionPct ?? 25,
      isThundersnow: Boolean(firstHourRaw?.isThundersnow)
    };
  const hour1LtBase = secondHourRaw
    ? (lightningByTimeMap.get(secondHourRaw.time) ?? null)
    : null;

  const lightningRadar = buildLightningProximityRadar({
    updatedAtIso: radarNowcast.generatedAtIso || new Date(exactNowUtcMs).toISOString(),
    radarAvailable: radarNowcast.radarAvailable,
    currentRadarDbz: radarNowcast.currentDbzOverTarget,
    radarCells: radarNowcast.convectiveCells ?? [],
    metarStations:
      mos.report.stations ?? (mos.report.station ? [mos.report.station] : []),
    hour0Lightning: hour0LtBase,
    hour1Lightning: hour1LtBase,
    surfaceTempC: hybridCurTemp,
    dekStatus: firstHourRaw?.dekStatus ?? "none"
  });

  const reconciledNowLt = reconcileNowLightningWithRadar({
    modelHour0ProbPct: hour0LtBase.lightningProbPct,
    modelHour0FlashesPerMin: hour0LtBase.flashesPerMin,
    lightningRadar,
    radarAvailable: radarNowcast.radarAvailable,
    currentRadarDbz: radarNowcast.currentDbzOverTarget
  });

  if (firstHourRaw) {
    firstHourRaw.lightningProbPct = reconciledNowLt.hour0ProbPct;
    firstHourRaw.lightningFlashesPerMin = reconciledNowLt.hour0FlashesPerMin;
    const updatedH0Lt: LightningHourPhysicsResult = {
      ...hour0LtBase,
      lightningProbPct: reconciledNowLt.hour0ProbPct,
      flashesPerMin: reconciledNowLt.hour0FlashesPerMin
    };
    lightningByTimeMap.set(firstHourRaw.time, updatedH0Lt);
  }

  for (let idxAll = 0; idxAll < all360Hours.length; idxAll++) {
    const pt = all360Hours[idxAll];
    const ctx = rawStormContexts[idxAll];
    const sEval = evaluateHourlyStormRisk({
      time: pt.time,
      hourLabel: pt.hourLabel,
      dayLabel: pt.dayLabel,
      capeFused: ctx?.capeFused ?? (pt.cape ?? 0),
      sounding: ctx?.sounding ?? null,
      ensCapeProb500: ctx?.ensCapeProb500 ?? 0,
      ensGustP50: ctx?.ensGustP50 ?? null,
      ensGustP90: ctx?.ensGustP90 ?? null,
      ensGustProb55: ctx?.ensGustProb55 ?? 0,
      ensGustProb75: ctx?.ensGustProb75 ?? 0,
      windSpeedKmh: pt.windSpeed,
      windGustsKmh: pt.windGusts,
      precipitationMm: pt.precipitation,
      precipP90Mm: pt.precipConsensus.p90Mm ?? pt.precipitation,
      precip3hAccumMm: ctx?.precip3hAccumMm ?? pt.precipitation,
      wmoStormAgreeCount: ctx?.wmoStormAgreeCount ?? 0,
      wmoTotalModels: ctx?.wmoTotalModels ?? 0,
      weatherCode: pt.weatherCode,
      pressureDelta3h: ctx?.pressureDelta3h ?? 0,
      pressureDelta6h: ctx?.pressureDelta6h ?? 0,
      lightningPotential: ctx?.lightningPotential ?? null,
      liveMetarWx: ctx?.liveMetarWx ?? null,
      canonicalLightningProbPct: pt.lightningProbPct ?? 0,
      isThundersnow: Boolean(pt.isThundersnow)
    });
    pt.stormScore = sEval.score;
    pt.isStorm = sEval.isStorm;
    if (idxAll < 168) {
      hourlyStormEvals.push(sEval);
    }
  }

  const nominalHour0: HourlyPoint | undefined = hourly[0]
    ? { ...hourly[0] }
    : undefined;
  const sim0 = nominalHour0 ? simByTimeMap.get(nominalHour0.time) : undefined;

  const canonicalNow = buildCanonicalNowPoint({
    nominalHour0,
    sim0,
    curTimeIso: curTimeStr,
    subHourFrac,
    temperature: hybridCurTemp,
    apparentTemperature: hybridCurApparent,
    dewPoint: hybridCurDew,
    humidity: hybridCurRh,
    tempBand: firstHourTempBand,
    pressure: pNow,
    pressureDelta3h,
    windSpeed: hybridCurWind,
    windGusts: hybridCurGust,
    windDirection: hybridCurDir,
    cloudCover: Math.round(Number(cur.cloud_cover ?? nominalHour0?.cloudCover ?? 0)),
    visibilityKm: nominalHour0?.visibilityKm ?? 15,
    uvIndex: curUv,
    precipitation: hybridCurPrecip,
    precipConsensus: curPrecipConsensus,
    rawCurWeatherCode: Number(cur.weather_code ?? 0),
    rawCurIsDay: typeof cur.is_day === "number" ? cur.is_day : undefined,
    curSolarElev,
    reconciledNowLt,
    lightningRadar,
    hour0StormCtx: rawStormContexts[0]
  });

  if (canonicalNow.hour0 && hourly.length > 0) {
    hourly[0] = canonicalNow.hour0;
    hourlyStormEvals[0] = canonicalNow.nowStormEval;
    hourlyPrecipTrack[0] = canonicalNow.current.precipitation;
  }

  // 15-Minute High-Resolution Nowcast Series (+6h)
  const minutely15: Minutely15Point[] = [];
  if (min15Raw && Array.isArray(min15Raw.time)) {
    const mTimes: string[] = min15Raw.time;
    const baseHour0 = nominalHour0 ?? hourly[0];
    for (let j = 0; j < Math.min(24, mTimes.length); j++) {
      const tStr = String(mTimes[j]);
      const mTemp = Number(
        (
          Number(min15Raw.temperature_2m?.[j] ?? baseHour0?.temperature ?? 0) +
          firstHourTempShiftC * Math.exp(-j / 16)
        ).toFixed(1)
      );
      const raw15Mm = Math.max(0, Number(min15Raw.precipitation?.[j] ?? 0));
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
      const is15Wet = isWetActiveSample(mPrecip * 4);
      const mSnow = is15Wet
        ? Number(Math.max(0, Number(min15Raw.snowfall?.[j] ?? 0)).toFixed(2))
        : 0;
      const mRain = mSnow > 0 ? 0 : mPrecip;
      const mGust = Number(Math.max(0, Number(min15Raw.wind_gusts_10m?.[j] ?? 0)).toFixed(1));
      const mCode = Number(min15Raw.weather_code?.[j] ?? 0);
      const mCapeRaw = min15Raw.cape?.[j];
      const mLpiRaw = min15Raw.lightning_potential?.[j];

      const pPhase = classifyPrecipPhase({
        temperatureC: mTemp,
        humidityPct: baseHour0?.humidity ?? 65,
        precipitationMm: is15Wet ? mPrecip * 4 : 0,
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
        precipPhase: is15Wet ? pPhase.precipPhase : "none"
      });
    }
  }

  const stormAssessment = buildStormAssessment(
    hourlyStormEvals.slice(0, 48),
    hourlyPrecipTrack.slice(0, 48)
  );

  // 6. CALIBRATED 15-DAY FORECAST (`daily[0..14]`)
  const hourlyPrecisionMap = new Map<string, HourlyPoint>();
  const hourlyByTimeMap = new Map<string, HourlyPoint>();
  for (let idxH = 0; idxH < hourly.length; idxH++) {
    const pt = idxH === 0 && nominalHour0 ? nominalHour0 : hourly[idxH];
    if (idxH < 168) {
      hourlyPrecisionMap.set(pt.time, pt);
    }
    hourlyByTimeMap.set(pt.time, pt);
  }
  for (const pt of extendedSynopticHours) {
    hourlyByTimeMap.set(pt.time, pt);
  }
  const todayLedgerExtremes = getTodayObservedExtremesFromLedger(ledgerLocKey, todayDateYmd);
  const bursaGaugeTodayMm =
    bursaMesh?.stations
      .filter(
        (s) =>
          s.qcWeight > 0.3 &&
          s.precipToday00Mm !== null &&
          s.precipToday00Mm !== undefined
      )
      .sort((a, b) => b.qcWeight - a.qcWeight)[0]?.precipToday00Mm ?? null;
  const nationalGaugeTodayMm =
    nationalMgmMesh?.stations
      .filter((s) => s.qcWeight > 0.3 && s.precip24HrMm !== null && s.precip24HrMm !== undefined)
      .sort((a, b) => b.qcWeight - a.qcWeight)[0]?.precip24HrMm ?? null;
  const hasLiveTodayRain = isBursaDomain
    ? bursaGaugeTodayMm !== null ||
      (todayLedgerExtremes.observedHours > 0 && todayLedgerExtremes.precipSumMm > 0)
    : isNationalTrProvince
      ? nationalGaugeTodayMm !== null ||
        (todayLedgerExtremes.observedHours > 0 && todayLedgerExtremes.precipSumMm > 0)
      : false;

  const rawTimeToIndex = new Map<string, number>();
  times.forEach((t, idx) => {
    if (!rawTimeToIndex.has(t)) rawTimeToIndex.set(t, idx);
  });

  const activeMgmTodayMaxC = isBursaDomain
    ? mgmForecasts?.todayObservedMaxC
    : nationalMgmForecasts?.todayObservedMaxC;
  const activeMgmTodayMinC = isBursaDomain
    ? mgmForecasts?.todayObservedMinC
    : nationalMgmForecasts?.todayObservedMinC;

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
    let prevDayHourUtcMs: number | undefined;

    for (let hh = 0; hh < 24; hh++) {
      const localIso = `${dateStr}T${String(hh).padStart(2, "0")}:00`;
      const existingH = dIdx < 7 ? hourlyPrecisionMap.get(localIso) : hourlyByTimeMap.get(localIso);
      if (existingH) {
        prevDayHourUtcMs = tzResolver.localIsoToUtcDate(localIso, prevDayHourUtcMs).getTime();
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

      const utcDate = tzResolver.localIsoToUtcDate(localIso, prevDayHourUtcMs);
      prevDayHourUtcMs = utcDate.getTime();
      const uKey = utcDate.toISOString().slice(0, 16);
      const hIdx = utcTimeIndex.get(uKey);
      const rawPastIdx = rawTimeToIndex.get(localIso);

      if (hIdx === undefined) {
        if (dIdx === 0 && hh < startLocalHour && rawPastIdx !== undefined) {
          const rT = Number(hourlyRaw.temperature_2m?.[rawPastIdx] ?? NaN);
          if (Number.isFinite(rT)) {
            matchedDayHours++;
            if (rT < minT) minT = rT;
            if (rT > maxT) maxT = rT;
          }
          const rP = Math.max(0, Number(hourlyRaw.precipitation?.[rawPastIdx] ?? 0));
          if (!hasLiveTodayRain) {
            precipSum += rP;
            precipP90Sum += rP;
          }
          maxPop = Math.max(
            maxPop,
            Number(hourlyRaw.precipitation_probability?.[rawPastIdx] ?? 0)
          );
          maxWind = Math.max(
            maxWind,
            Number(hourlyRaw.wind_speed_10m?.[rawPastIdx] ?? 0)
          );
        }
        continue;
      }

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
      const pastHourSolarElev = computeSolarElevationDeg(
        location.lat,
        location.lon,
        utcDate
      );
      const tCal =
        tBursa !== null
          ? tBursa +
            computeBursaDistrictMicroclimateOffsetC({
              targetLat: location.lat,
              targetLon: location.lon,
              targetElevationM: cityElevationM,
              base17116TempC: tBursa,
              localHour: hh,
              isNight: pastHourSolarElev < -3,
              cloudCoverPct: 35,
              windSpeedKmh: 10,
              windDirDeg: 0,
              marmaraSstC: marmaraSstBundle?.currentSstC ?? null,
              mgmDistrictDay: mgmForecasts?.dailyDistrict.get(dateStr) ?? null
            })
          : isNationalTrProvince && provinceSpec && !hybridStreamFailed
            ? evaluateProvinceCalibratedHour({
                leadHours: leadH,
                localHour: hh,
                month: utcDate.getUTCMonth() + 1,
                spec: provinceSpec,
                bundle: provinceCalibration ?? undefined,
                tempSnapshot: tSnap,
                targetElevationM: cityElevationM,
                referenceElevationM: cityElevationM,
                liveKalmanMos: mos
              }).temperatureC
            : tKalman;

      matchedDayHours++;
      if (tCal < minT) minT = tCal;
      if (tCal > maxT) maxT = tCal;

      const wLead = getLeadTimeWeights(
        mos.shortRangeWeights.precipitation,
        mos.mediumRangeWeights.precipitation,
        leadH
      );
      const rawFallbackPastMm =
        rawPastIdx !== undefined
          ? Math.max(0, Number(hourlyRaw.precipitation?.[rawPastIdx] ?? 0))
          : 0;
      const fpBase = fusePrecipitationHour({
        detSnapshot: pSnap,
        detWeights: wLead,
        ensembleMembersMm: eP,
        rawPrecipFallbackMm: rawFallbackPastMm,
        rawPopFallbackPct: Number(dailyRaw.precipitation_probability_max?.[dIdx] ?? 0),
        leadHour: leadH
      });
      if (dIdx === 0 && hh < startLocalHour) {
        if (!hasLiveTodayRain) {
          precipSum += fpBase.precipitationMm;
          precipP90Sum += fpBase.consensus.p90Mm ?? fpBase.precipitationMm;
        }
      } else {
        precipSum += fpBase.precipitationMm;
        precipP90Sum += fpBase.consensus.p90Mm ?? fpBase.precipitationMm;
      }
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

    if (dIdx === 0) {
      finalMax = Math.max(finalMax, canonicalNow.current.temperature);
      finalMin = Math.min(finalMin, canonicalNow.current.temperature);
      maxStormScore = Math.max(maxStormScore, canonicalNow.current.stormScore ?? 0);
      if (todayLedgerExtremes.maxTempC !== null) {
        finalMax = Math.max(finalMax, todayLedgerExtremes.maxTempC);
      }
      if (todayLedgerExtremes.minTempC !== null) {
        finalMin = Math.min(finalMin, todayLedgerExtremes.minTempC);
      }
      if (
        activeMgmTodayMaxC !== null &&
        activeMgmTodayMaxC !== undefined &&
        Math.abs(activeMgmTodayMaxC - finalMax) <= 3.5
      ) {
        finalMax = Math.max(finalMax, 0.5 * finalMax + 0.5 * activeMgmTodayMaxC);
      }
      if (
        activeMgmTodayMinC !== null &&
        activeMgmTodayMinC !== undefined &&
        Math.abs(activeMgmTodayMinC - finalMin) <= 3.5
      ) {
        finalMin = Math.min(finalMin, 0.5 * finalMin + 0.5 * activeMgmTodayMinC);
      }
      if (hasLiveTodayRain) {
        const obsTodayRain = isBursaDomain
          ? (bursaGaugeTodayMm ?? todayLedgerExtremes.precipSumMm)
          : (nationalGaugeTodayMm ?? todayLedgerExtremes.precipSumMm);
        precipSum += Math.max(0, obsTodayRain ?? 0);
        precipP90Sum += Math.max(0, obsTodayRain ?? 0);
      }
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
      dateYmd: dateStr,
      provinceCode: resolvedProvinceCode
    });
    const finalMaxRounded = Number(finalMax.toFixed(1));
    const finalMinRounded = Number(finalMin.toFixed(1));
    const tempAnomalyC = Number(
      (0.5 * (finalMaxRounded + finalMinRounded) - dayClim.normalMeanC).toFixed(1)
    );

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

    let daySnowProbMaxPct = 0;
    let dayAirSnowSumCm = 0;
    let dayAirSnowP90SumCm = 0;
    let dayGroundSnowSumCm = 0;
    let dayGroundSnowP90SumCm = 0;
    let dayRoadSnowSumCm = 0;
    let dayMaxSnowpackCm = 0;
    let daySlrWeightedSum = 0;
    let daySlrWeight = 0;
    let dayPeakHourSnowCm = -1;
    let dayDominantSnowQuality: SnowQualityLabelTr = "Yok";
    let dayWetMinSnowLineM: number | null = null;
    let dayAnyMinSnowLineM: number | null = null;
    let dayMinSoilTempC = Infinity;
    let dayMinRoadTempC = Infinity;
    let dayIcingMax: RoadIcingRisk = "none";
    let dayBlowingMax: BlowingSnowRisk = "none";
    let dayDekMax: DekSnowStatus = "none";
    let dayLightningProbMax = 0;
    let dayLightningPeakFlashes = 0;
    let dayLpiMax = 0;
    let dayHasThundersnow = false;
    const bandAccumMap = new Map<
      string,
      {
        id: string;
        labelTr: string;
        elevationM: number;
        tempSum: number;
        twSum: number;
        count: number;
        snowProbMax: number;
        airSnowSum: number;
        groundSnowSum: number;
        roadSnowSum: number;
        maxPack: number;
        slrWeighted: number;
        slrW: number;
        peakQuality: SnowQualityLabelTr;
        peakHourAir: number;
        domPhase: PrecipPhase;
      }
    >();

    for (let hh = 0; hh < 24; hh++) {
      const lIso = `${dateStr}T${String(hh).padStart(2, "0")}:00`;
      const hPt = hourlyByTimeMap.get(lIso);
      const simPt = simByTimeMap.get(lIso);
      const ltPt = lightningByTimeMap.get(lIso);
      if (hPt) {
        daySnowProbMaxPct = Math.max(daySnowProbMaxPct, hPt.airSnowProbPct ?? 0);
        const hAirRaw = simPt ? simPt.rawAirSnowCm : (hPt.airSnowCm ?? 0);
        const hAirP90Raw = simPt ? simPt.rawAirSnowP90Cm : hAirRaw;
        const hGndRaw = simPt ? simPt.rawGroundSnowCm : (hPt.groundSnowCm ?? 0);
        const hGndP90Raw = simPt ? simPt.rawGroundSnowP90Cm : hGndRaw;
        const hRdRaw = simPt ? simPt.rawRoadSnowCm : (hPt.roadSnowCm ?? 0);
        dayAirSnowSumCm += hAirRaw;
        dayAirSnowP90SumCm += hAirP90Raw;
        dayGroundSnowSumCm += hGndRaw;
        dayGroundSnowP90SumCm += hGndP90Raw;
        dayRoadSnowSumCm += hRdRaw;
        dayMaxSnowpackCm = Math.max(dayMaxSnowpackCm, hPt.snowpackDepthCm ?? 0);
        if (hAirRaw > 0 && (hPt.snowSlr ?? 0) > 0) {
          daySlrWeightedSum += (hPt.snowSlr ?? 10) * hAirRaw;
          daySlrWeight += hAirRaw;
        }
        if (
          hAirRaw > dayPeakHourSnowCm &&
          hPt.snowQualityTr &&
          hPt.snowQualityTr !== "Yok"
        ) {
          dayPeakHourSnowCm = hAirRaw;
          dayDominantSnowQuality = hPt.snowQualityTr;
        }
        if (hPt.snowLineElevationM !== null && hPt.snowLineElevationM !== undefined) {
          dayAnyMinSnowLineM =
            dayAnyMinSnowLineM === null
              ? hPt.snowLineElevationM
              : Math.min(dayAnyMinSnowLineM, hPt.snowLineElevationM);
          const isHourMoistureRelevant =
            isWetActiveSample(hPt.precipitation, hPt.airSnowCm) ||
            hPt.precipProbability >= 20 ||
            (hPt.airSnowProbPct ?? 0) >= 12;
          if (isHourMoistureRelevant) {
            dayWetMinSnowLineM =
              dayWetMinSnowLineM === null
                ? hPt.snowLineElevationM
                : Math.min(dayWetMinSnowLineM, hPt.snowLineElevationM);
          }
        }
        if (hPt.soilTempC !== undefined && hPt.soilTempC < dayMinSoilTempC) {
          dayMinSoilTempC = hPt.soilTempC;
        }
        if (hPt.roadTempC !== undefined && hPt.roadTempC < dayMinRoadTempC) {
          dayMinRoadTempC = hPt.roadTempC;
        }
        if (hPt.icingRisk) dayIcingMax = maxIcingRisk(dayIcingMax, hPt.icingRisk);
        if (hPt.blowingSnowRisk)
          dayBlowingMax = maxBlowingSnowRisk(dayBlowingMax, hPt.blowingSnowRisk);
        if (hPt.dekStatus) dayDekMax = maxDekStatus(dayDekMax, hPt.dekStatus);

        if (hPt.elevationSnowBands) {
          for (const b of hPt.elevationSnowBands) {
            let acc = bandAccumMap.get(b.id);
            if (!acc) {
              acc = {
                id: b.id,
                labelTr: b.labelTr,
                elevationM: b.elevationM,
                tempSum: 0,
                twSum: 0,
                count: 0,
                snowProbMax: 0,
                airSnowSum: 0,
                groundSnowSum: 0,
                roadSnowSum: 0,
                maxPack: 0,
                slrWeighted: 0,
                slrW: 0,
                peakQuality: "Yok",
                peakHourAir: -1,
                domPhase: "none"
              };
              bandAccumMap.set(b.id, acc);
            }
            acc.tempSum += b.tempMeanC;
            acc.twSum += b.wetBulbMeanC;
            acc.count += 1;
            acc.snowProbMax = Math.max(acc.snowProbMax, b.snowProbPct);
            acc.airSnowSum += b.airSnowCm;
            acc.groundSnowSum += b.groundSnowCm;
            acc.roadSnowSum += b.roadSnowCm;
            acc.maxPack = Math.max(acc.maxPack, b.maxSnowpackCm);
            if (b.airSnowCm > 0 && b.slr > 0) {
              acc.slrWeighted += b.slr * b.airSnowCm;
              acc.slrW += b.airSnowCm;
            }
            if (b.airSnowCm > acc.peakHourAir && b.snowQualityTr !== "Yok") {
              acc.peakHourAir = b.airSnowCm;
              acc.peakQuality = b.snowQualityTr;
            }
            if (b.precipPhase === "snow") acc.domPhase = "snow";
            else if (b.precipPhase === "freezing_rain" && acc.domPhase !== "snow")
              acc.domPhase = "freezing_rain";
            else if (b.precipPhase === "sleet" && acc.domPhase === "none")
              acc.domPhase = "sleet";
            else if (b.precipPhase === "rain" && acc.domPhase === "none")
              acc.domPhase = "rain";
          }
        }
      }
      if (ltPt) {
        dayLightningProbMax = Math.max(dayLightningProbMax, ltPt.lightningProbPct);
        dayLightningPeakFlashes = Math.max(dayLightningPeakFlashes, ltPt.flashesPerMin);
        dayLpiMax = Math.max(dayLpiMax, ltPt.lpiEffectiveJkg);
        if (ltPt.isThundersnow) dayHasThundersnow = true;
      } else if (hPt?.lightningProbPct !== undefined) {
        dayLightningProbMax = Math.max(dayLightningProbMax, hPt.lightningProbPct);
      }
    }

    if (dIdx === 0) {
      dayLightningProbMax = Math.max(
        dayLightningProbMax,
        reconciledNowLt.hour0ProbPct,
        canonicalNow.current.lightningProbPct ?? 0
      );
      dayLightningPeakFlashes = Math.max(
        dayLightningPeakFlashes,
        reconciledNowLt.hour0FlashesPerMin,
        canonicalNow.current.lightningFlashesPerMin ?? 0
      );
      if (canonicalNow.current.isThundersnow) {
        dayHasThundersnow = true;
      }
    }

    const dayElevationBands: ElevationSnowBand[] = Array.from(bandAccumMap.values()).map((acc) => ({
      id: acc.id,
      labelTr: acc.labelTr,
      elevationM: acc.elevationM,
      tempMeanC: Number((acc.tempSum / Math.max(1, acc.count)).toFixed(1)),
      wetBulbMeanC: Number((acc.twSum / Math.max(1, acc.count)).toFixed(1)),
      precipPhase: acc.domPhase,
      snowProbPct: acc.snowProbMax,
      airSnowCm: Number(acc.airSnowSum.toFixed(1)),
      groundSnowCm: Number(acc.groundSnowSum.toFixed(1)),
      roadSnowCm: Number(acc.roadSnowSum.toFixed(1)),
      maxSnowpackCm: Number(acc.maxPack.toFixed(1)),
      slr: acc.slrW > 0 ? Number((acc.slrWeighted / acc.slrW).toFixed(1)) : 0,
      snowQualityTr: acc.peakQuality
    }));

    const avgWindDeg =
      Math.abs(sinDirSum) > 1e-4 || Math.abs(cosDirSum) > 1e-4
        ? (((Math.atan2(sinDirSum, cosDirSum) * 180) / Math.PI) + 360) % 360
        : 0;
    const dayConfidencePct =
      dayConfs.length > 0
        ? Math.round(dayConfs.reduce((a, b) => a + b, 0) / dayConfs.length)
        : Math.max(42, 92 - dIdx * 3.5);

    const roundedDayAirSnow = Number(dayAirSnowSumCm.toFixed(1));
    const roundedDayGroundSnow = Number(dayGroundSnowSumCm.toFixed(1));
    const roundedDayRoadSnow = Number(dayRoadSnowSumCm.toFixed(1));

    return {
      date: dateStr,
      dayName: formatRelativeDayLabelTr(dateStr, originTodayYmd, "weekday"),
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
      snowProbMaxPct: daySnowProbMaxPct,
      airSnowSumCm: roundedDayAirSnow,
      airSnowP90Cm: Number(
        Math.max(roundedDayAirSnow, dayAirSnowP90SumCm).toFixed(1)
      ),
      groundSnowSumCm: roundedDayGroundSnow,
      groundSnowP90Cm: Number(
        Math.max(roundedDayGroundSnow, dayGroundSnowP90SumCm).toFixed(1)
      ),
      roadSnowSumCm: roundedDayRoadSnow,
      maxSnowpackDepthCm: Number(dayMaxSnowpackCm.toFixed(1)),
      snowSlrMean:
        daySlrWeight > 0 ? Number((daySlrWeightedSum / daySlrWeight).toFixed(1)) : undefined,
      snowQualityTr: dayDominantSnowQuality,
      minSnowLineM: dayWetMinSnowLineM ?? dayAnyMinSnowLineM,
      minSoilTempC: Number.isFinite(dayMinSoilTempC) ? dayMinSoilTempC : undefined,
      minRoadTempC: Number.isFinite(dayMinRoadTempC) ? dayMinRoadTempC : undefined,
      icingRiskMax: dayIcingMax,
      blowingSnowMax: dayBlowingMax,
      dekStatus: dayDekMax,
      elevationSnowBands: dayElevationBands.length > 0 ? dayElevationBands : undefined,
      windSpeedMax: finalWind,
      windGustMax: matchedDayHours >= 8 ? Math.round(maxGust) : undefined,
      dominantWindCompass: windDirectionToCompass(avgWindDeg),
      stormScoreMax: maxStormScore > 0 ? maxStormScore : undefined,
      lightningProbMaxPct: dayLightningProbMax,
      lightningPeakFlashesPerMin: Number(dayLightningPeakFlashes.toFixed(1)),
      lpiMaxJkg: Number(dayLpiMax.toFixed(2)),
      hasThundersnow: dayHasThundersnow,
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

  canonicalNow.current.sunrise = daily[0]?.sunrise ?? "";
  canonicalNow.current.sunset = daily[0]?.sunset ?? "";

  // 6B. CALIBRATED SUBSEASONAL OUTLOOK (`Days 16..30`, Province Climatology-Locked!)
  const subseasonal = buildCalibratedSubseasonalOutlook({
    raw: rawSubseasonal,
    calibratedDaily: daily,
    lat: location.lat,
    lon: location.lon,
    elevationM: cityElevationM,
    provinceCode: resolvedProvinceCode
  });

  // 6C. SNOW & LIGHTNING OBSERVATORY SUMMARY
  const total15dAirSnowCm = Number(
    daily.reduce((s, d) => s + (d.airSnowSumCm ?? 0), 0).toFixed(1)
  );
  const total15dGroundSnowCm = Number(
    daily.reduce((s, d) => s + (d.groundSnowSumCm ?? 0), 0).toFixed(1)
  );
  const total15dRoadSnowCm = Number(
    daily.reduce((s, d) => s + (d.roadSnowSumCm ?? 0), 0).toFixed(1)
  );
  const peak15dSnowpackCm = Number(
    daily.reduce((m, d) => Math.max(m, d.maxSnowpackDepthCm ?? 0), 0).toFixed(1)
  );
  const lowest15dSnowLineM = daily.reduce<number | null>((best, d) => {
    if (d.minSnowLineM === null || d.minSnowLineM === undefined) return best;
    const isRelevantDay = isSnowLinePhysicallyRelevant({
      snowLineElevationM: d.minSnowLineM,
      baseElevationM: cityElevationM,
      temperatureC: d.tempMin,
      precipMmHr: d.precipSum / 6,
      precipProbabilityPct: d.precipProbabilityMax,
      airSnowProbPct: d.snowProbMaxPct,
      snowpackDepthCm: d.maxSnowpackDepthCm
    });
    if (!isRelevantDay) return best;
    return best === null ? d.minSnowLineM : Math.min(best, d.minSnowLineM);
  }, null);
  const dekStatus15d = daily.reduce<DekSnowStatus>(
    (acc, d) => maxDekStatus(acc, d.dekStatus ?? "none"),
    "none"
  );
  const maxDekDeltaT = snowSimOutputs.reduce<number | null>((best, s) => {
    if (s.dekDeltaTSst850C === null) return best;
    return best === null ? s.dekDeltaTSst850C : Math.max(best, s.dekDeltaTSst850C);
  }, null);

  const first48Hours = hourly.slice(0, 48);
  const first168Hours = hourly.slice(0, 168);
  const maxIcingRisk48h = first48Hours.reduce<RoadIcingRisk>(
    (acc, h) => maxIcingRisk(acc, h.icingRisk ?? "none"),
    "none"
  );
  const maxBlowingSnow48h = first48Hours.reduce<BlowingSnowRisk>(
    (acc, h) => maxBlowingSnowRisk(acc, h.blowingSnowRisk ?? "none"),
    "none"
  );

  const nextSnowHour = all360Hours.find(
    (h) => (h.airSnowCm ?? 0) >= 0.1 || (h.airSnowProbPct ?? 0) >= 35
  );
  const nextSnowDay = daily.find(
    (d) =>
      (d.airSnowSumCm ?? 0) >= 0.1 ||
      (d.snowProbMaxPct ?? 0) >= 30 ||
      (d.elevationSnowBands?.some((b) => b.airSnowCm >= 0.5) ?? false)
  );
  const hasSubseasonalSnow = Boolean(
    subseasonal?.days.some((sd) => (sd.snowProbPct ?? 0) >= 25 || (sd.airSnowP90Cm ?? 0) >= 0.5)
  );
  const hasAnySnow15d = Boolean(nextSnowDay) || total15dAirSnowCm >= 0.1;

  const peak48hLightningProbPct = first48Hours.reduce(
    (m, h) => Math.max(m, h.lightningProbPct ?? 0),
    Math.max(canonicalNow.current.lightningProbPct ?? 0, reconciledNowLt.hour0ProbPct)
  );
  const peak168hLightningProbPct = first168Hours.reduce(
    (m, h) => Math.max(m, h.lightningProbPct ?? 0),
    peak48hLightningProbPct
  );
  const peak168hFlashesPerMin = Number(
    first168Hours
      .reduce(
        (m, h) => Math.max(m, h.lightningFlashesPerMin ?? 0),
        Math.max(
          canonicalNow.current.lightningFlashesPerMin ?? 0,
          reconciledNowLt.hour0FlashesPerMin
        )
      )
      .toFixed(1)
  );
  const hasThundersnow168h = first168Hours.some((h) => Boolean(h.isThundersnow));
  const nextLightningHour = first168Hours.find((h) => (h.lightningProbPct ?? 0) >= 28);

  const snowAndLightningSummary: SnowAndLightningObservatorySummary = {
    referenceElevationM: cityElevationM,
    soilTempNowC:
      canonicalNow.current.soilTempC ??
      Number((hybridCurTemp * 0.85 + 0.8).toFixed(1)),
    roadTempNowC:
      canonicalNow.current.roadTempC ??
      Number((hybridCurTemp * 0.9 + 1.4).toFixed(1)),
    hasAnySnow15d,
    hasAnySnow30d: hasAnySnow15d || hasSubseasonalSnow,
    nextSnowHourIso: nextSnowHour?.time ?? null,
    nextSnowDateYmd: nextSnowDay?.date ?? null,
    total15dAirSnowCm,
    total15dGroundSnowCm,
    total15dRoadSnowCm,
    peak15dSnowpackCm,
    lowest15dSnowLineM,
    dekStatus15d,
    dekDeltaTSst850C: maxDekDeltaT,
    maxIcingRisk48h,
    maxBlowingSnow48h,
    lightningRadar,
    peak48hLightningProbPct,
    peak168hLightningProbPct,
    peak168hFlashesPerMin,
    hasThundersnow168h,
    nextLightningHourIso: nextLightningHour?.time ?? null
  };

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

  const isLiveVerified =
    mos.report.mode === "live-mgm-mesh" ||
    mos.report.mode === "live-station-48h" ||
    mos.report.mode === "live-station-24h";
  const stIdsText =
    mos.summary.stationIds.length > 0 ? mos.summary.stationIds.join(" + ") : "WMO";
  const ensLabel =
    ensIndex.memberCount > 0 ? `${ensIndex.memberCount}-Üye AI+EPS` : "10-Model NWP";

  // Build zero-leakage dynamic attributions for TR-16 vs 80-Province Bespoke vs GLOBAL
  const activeProvinceWeights =
    isNationalTrProvince && provinceCalibration
      ? provinceCalibration.temperature[
          startMonth1To12 === 12 || startMonth1To12 <= 2
            ? "DJF"
            : startMonth1To12 <= 5
              ? "MAM"
              : startMonth1To12 <= 8
                ? "JJA"
                : "SON"
        ].d0_1.weights
      : mos.shortRangeWeights.temperature;

  const attributions: HybridSourceAttribution[] = isBursaDomain
    ? [
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
          weightsLabel: "8 Model × 4 Koşu · 2/3 Kanıt Kapısı · Kalıcı Defter",
          standardRef: "ECMWF/WMO dProg/dt + Ashman D Bimodal Kümeleme",
          reason:
            "Kalibre tahminler önceki sinoptik döngülerle elma-elma karşılaştırılır; fiziksel kanıtı olmayan tekil 06Z/18Z model savrulmaları %72 oranında bastırılır."
        },
        {
          parameter: "Şiddetli Fırtına & Oraj Motoru",
          primaryEngine: "ATMOS-Core v5 SPC/ESTOFEX",
          weightsLabel: "MUCAPE · Bunkers SRH · SCP · DCAPE",
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
      ]
    : isNationalTrProvince && provinceSpec
      ? (() => {
          const knots = provinceSpec.verticalProfileSpec.piecewiseKnotsM;
          const isTierA = provinceSpec.calibrationTier === "TIER_A_WMO";
          const wmoCode =
            provinceCalibration?.wmoStationId ?? provinceSpec.primaryCenter.wmoId ?? null;
          const waterMeta = primaryWaterBody
            ? `${primaryWaterBody.labelTr}${
                primaryLiveWaterTempC !== null ? ` (${primaryLiveWaterTempC}°C)` : ""
              }`
            : `${provinceSpec.nameTr} Karasal Sınır Katmanı`;
          return [
            {
              parameter: `2m Sıcaklık & ${provinceSpec.nameTr} Mikrokliması`,
              primaryEngine: isTierA
                ? `ATMOS v5.0 ${provinceSpec.nameTr} WMO L1-EMOS`
                : `ATMOS v5.0 ${provinceSpec.nameTr} Donör Simpleks + ALARO`,
              weightsLabel: formatWeightsLabel(activeProvinceWeights),
              standardRef: isTierA
                ? `WMO ${wmoCode ?? provinceSpec.primaryCenter.mgmIstNo} (2-Yıl Ampirik EMOS) + MGM ALARO 4.5km + ${ensLabel}`
                : `Sıfır-Ofset Donör Simpleks + MGM ALARO 4.5km (#${provinceSpec.primaryCenter.mgmSaatlikIstNo}) + ${ensLabel}`,
              reason: isTierA
                ? `${provinceSpec.nameTr} (${provinceSpec.provinceCode}) WMO ${wmoCode ?? provinceSpec.primaryCenter.mgmIstNo} 2-yıllık CV-kalibreli ölçek-değişmez simpleks ağırlıkları, alt-havza bariyer matrisi ve rejim kapılı Kalman düzeltmesiyle yerel mikroklima çözülür.`
                : `${provinceSpec.nameTr} (${provinceSpec.provinceCode}) sıfır sabit-kesişimli donör simpleks omurgası, 0–72s resmi MGM ALARO 4.5 km mezoklima kancası ve canlı MGM istasyon Kalman asimilasyonu ile kalibre edilir.`
            },
            {
              parameter: "Yağış, Orografik Bariyer & Radar Nowcast",
              primaryEngine: "Yönlü Bariyer PM-QM + G/R Radar Nowcast",
              weightsLabel: `${ensLabel} PM-QM · MGM ALARO · Bourgouin Faz`,
              standardRef: "Fulton-Brandes G/R + Ebert (2001) PM-QM + Bourgouin (2000)",
              reason: `${provinceSpec.nameTr} yönlü orografik bariyer, rüzgaraltı yağış gölgesi/fön virga süzgeci ve canlı MGM plüvyometreleri ile birleştirilmiş olasılık-eşleştirmeli yağış füzyonu.`
            },
            {
              parameter: "Koşu Tutarlılığı & C¹ Bimodal Küme",
              primaryEngine: "Kalibre dProg/dt Histerezis + Rejim Kapısı",
              weightsLabel: "8 Model × 4 Koşu · G_regime(h) · [0.45, 0.55] C¹",
              standardRef: `ECMWF/WMO dProg/dt + ${provinceSpec.provinceCode} İzole Defter`,
              reason: `${provinceSpec.nameTr} için izole defterde tutulan önceki sinoptik döngülerle karşılaştırma yapılır; cephe dönüşlerinde sıcak/soğuk geçmiş bias sızıntısı G_regime(h) ile bastırılır.`
            },
            {
              parameter: "Şiddetli Fırtına & Konvektif Oraj Motoru",
              primaryEngine: "ATMOS-Core v5 SPC/ESTOFEX",
              weightsLabel: "MUCAPE · Bunkers SRH · SCP · DCAPE",
              standardRef: `Çoklu Model CAPE + ${ensLabel} Hamle/CAPE + Yıldırım Radarı`,
              reason:
                "MUCAPE, 0–3 km SRH/SCP ve aşağı-akım DCAPE göstergeleri birleşik 0–100 fırtına ve yıldırım risk skoruna dönüştürülür."
            },
            {
              parameter: "Basınç, Venturi Kanalı & Rüzgar",
              primaryEngine: topModelLabel(
                provinceCalibration?.pressureWeights ?? mos.shortRangeWeights.pressure
              ),
              weightsLabel: formatWeightsLabel(
                provinceCalibration?.pressureWeights ?? mos.shortRangeWeights.pressure
              ),
              standardRef: `${provinceSpec.nameTr} MGM QNH Kalman + Venturi Geçit Çarpanı`,
              reason: `${provinceSpec.nameTr} bölgesel QC sınırları (${provinceSpec.qcAndMosBounds.minPlausibleMslpHpa}–${provinceSpec.qcAndMosBounds.maxPlausibleMslpHpa} hPa) ve yerel geçit/vadi Venturi kanalizasyonu ile kalibre edilmiş rüzgar ve hamle.`
            },
            {
              parameter: `Z_base Dikey Profil & ${
                primaryWaterBody ? primaryWaterBody.labelTr : "Yüzey Enversiyonu"
              }`,
              primaryEngine: "Z_base-Bağıl 3-Katman Hidrostatik Çözücü",
              weightsLabel: `Γ ${mos.summary.envLapseRateCPerKm}°C/km · P_üst ${provinceSpec.inversionAndWedgeSpec.deltaPressureTopHpa} hPa`,
              standardRef: `Düğümler [${knots[0]}–${knots[1]}–${knots[2]}–${knots[3]} m] · ${waterMeta}`,
              reason: `${provinceSpec.nameTr} taban irtifasına (${provinceSpec.inversionAndWedgeSpec.basinFloorElevationM} m) göre kurulan soğuk havuz, kar-albedo radyasyonel soğuma ve su kütlesi akısı birlikte çözülür.`
            }
          ];
        })()
      : [
          {
            parameter: "2m Sıcaklık & Çoklu Model Kalibrasyonu",
            primaryEngine: topModelLabel(mos.shortRangeWeights.temperature),
            weightsLabel: formatWeightsLabel(mos.shortRangeWeights.temperature),
            standardRef: isLiveVerified
              ? `48s Çoklu İstasyon (${stIdsText}) Kalman/Diurnal MOS + ${ensLabel}`
              : `10-Model + ${ensLabel} + Bolton (1980)`,
            reason:
              "Çoklu küresel ve bölgesel NWP modelleri gündüz/gece fazlı Kalman sapma düzeltmesinden ve 212-üye ensemble uzlaşısından geçirilir."
          },
          {
            parameter: "Yağış, Radar Nowcast & Faz",
            primaryEngine: "G/R Radar + PM-QM Ensemble Füzyonu",
            weightsLabel: `${ensLabel} PM-QM · Bourgouin (2000) Faz`,
            standardRef: "Fulton-Brandes G/R + Ebert (2001) PM-QM + Stull (2011) Tw",
            reason:
              "Canlı radar ekoları ve 212-üye olasılık-eşleştirmeli kantil yağış füzyonu ile çiseleme gürültüsü elenir."
          },
          {
            parameter: "Koşu Tutarlılığı (Anti-Flip-Flop)",
            primaryEngine: "Kalibre dProg/dt Histerezis Kilidi",
            weightsLabel: "8 Model × 4 Koşu · 2/3 Kanıt Kapısı",
            standardRef: "ECMWF/WMO dProg/dt + Bimodal Kümeleme",
            reason:
              "Ardışık model koşuları arasındaki tekil gürültü zıplamaları histerezis kapısı ile dengelenir."
          },
          {
            parameter: "Şiddetli Fırtına & Oraj Motoru",
            primaryEngine: "ATMOS-Core v5 SPC/ESTOFEX",
            weightsLabel: "MUCAPE · Bunkers SRH · SCP · DCAPE",
            standardRef: `Çoklu Model CAPE + ${ensLabel} Hamle/CAPE`,
            reason:
              "MUCAPE, 0–3 km SRH/SCP ve DCAPE indeksleri birleşik 0–100 konvektif fırtına skoruna çevrilir."
          },
          {
            parameter: "Deniz Seviyesi Basıncı & Rüzgar",
            primaryEngine: topModelLabel(mos.shortRangeWeights.pressure),
            weightsLabel: formatWeightsLabel(mos.shortRangeWeights.pressure),
            standardRef: "METAR QNH Kalman + Vektörel Rüzgar + P90 Hamle",
            reason:
              "Kalman sapma giderimli deniz seviyesi basıncı, 3s barometrik eğilim ve P90 rüzgar hamlesi."
          },
          {
            parameter: "Troposferik Dikey Sondaj Profili",
            primaryEngine: "Çok-Seviyeli Hidrostatik & Termodinamik Çözücü",
            weightsLabel: `Γ ${mos.summary.envLapseRateCPerKm}°C/km · 1000–300 hPa`,
            standardRef: "Standart Troposferik Sondaj & Adyabatik Profil",
            reason:
              "1000–300 hPa izobarik katmanlardan donma seviyesi, yaş-termometre sıfır irtifası ve dikey sıcaklık gradyanı hesaplanır."
          }
        ];

  const activeBursaRegime = isBursaDomain
    ? classifyBursaSynopticRegime({
        windDir10mDeg: hybridCurDir,
        windSpeed10mKt: hybridCurWind * 0.539957,
        pressureMslHpa: pNow,
        cloudCoverPct: Number(cur.cloud_cover ?? nominalHour0?.cloudCover ?? 35),
        capeJkg: nominalHour0?.cape ?? 0,
        localHour: startLocalHour,
        month: startMonth1To12
      })
    : firstHourNationalRegime;

  const regimeTrMap: Record<string, string> = {
    LODOS_FOEHN: "Uludağ Lodos Fönü",
    POYRAZ_KARAYEL_ADV: "Poyraz / Karayel Marmara Akışı",
    OVA_INVERSION_CALM: "Bursa Ovası Enversiyon / Ayaz",
    MARMARA_SEA_BREEZE: "Marmara Deniz Meltemi",
    CONVECTIVE_UNSTABLE: "Konvektif Kararsızlık",
    SYNOPTIC_TRANSITION: "Sinoptik Cephe Geçişi"
  };
  const nationalRegimeLabelMap: Record<string, string> = {
    FOEHN_LEE: `${provinceSpec?.nameTr ?? ""} Fön / Rüzgaraltı Isınması`.trim(),
    UPSLOPE_OROGRAPHIC: `${provinceSpec?.nameTr ?? ""} Orografik Yamaç Yükselimi`.trim(),
    RAIN_SHADOW: `${provinceSpec?.nameTr ?? ""} Orografik Yağış Gölgesi`.trim(),
    VENTURI_CHANNEL: `${provinceSpec?.nameTr ?? ""} Geçit / Boğaz Venturi Akışı`.trim(),
    RADIATIVE_INVERSION: `${provinceSpec?.nameTr ?? ""} Radyasyonel Soğuk Havuz / Enversiyon`.trim(),
    SNOW_ALBEDO_INVERSION: `${provinceSpec?.nameTr ?? ""} Kar-Albedo Derin Enversiyonu`.trim(),
    SHALLOW_COLD_WEDGE: `${provinceSpec?.nameTr ?? ""} Sığ Soğuk Hava Kaması`.trim(),
    FOEHN_MIXED: `${provinceSpec?.nameTr ?? ""} Fön Karışımlı Sınır Katmanı`.trim()
  };

  const activeRegimeLabel = isBursaDomain
    ? (regimeTrMap[activeBursaRegime] ?? "Sinoptik Akış")
    : isNationalTrProvince && provinceSpec
      ? (nationalRegimeLabelMap[firstHourNationalRegime] ??
        `${provinceSpec.nameTr} Sinoptik Akış Rejimi`)
      : "Çoklu Model Sinoptik Rejim";

  const stabilitySummary = summarizeForecastStability(consistencyTrack, activeRegimeLabel);

  if (isBursaDomain) {
    if (firstHourVertPhys?.activeMechanism && firstHourVertPhys.activeMechanism !== "STANDARD_PROFILE") {
      activeMicroclimateTagSet.add(firstHourVertPhys.activeMechanism);
    }
    if (marmaraSstBundle?.currentSstC !== null && marmaraSstBundle?.currentSstC !== undefined) {
      activeMicroclimateTagSet.add("MARMARA_SST_COUPLED");
    }
  }

  const engineCalibrationTier: AtmosCalibrationTierLabel = isBursaDomain
    ? "BURSA_FROZEN_V5"
    : isNationalTrProvince && provinceSpec
      ? provinceSpec.calibrationTier === "TIER_A_WMO"
        ? "TIER_A_EMPIRICAL_WMO"
        : "TIER_B_DONOR_ALARO"
      : "GLOBAL";

  const nationalTier1OnlineCount =
    isNationalTrProvince && nationalMgmMesh
      ? nationalMgmMesh.stations.filter((s) => s.qcWeight > 0 && s.tier === 1).length
      : 0;

  const resolvedProvinceName = isBursaDomain
    ? "Bursa"
    : isNationalTrProvince && provinceSpec
      ? provinceSpec.nameTr
      : isTrProvinceCode(resolvedProvinceCode)
        ? TR_PROVINCE_NAMES_BY_CODE[resolvedProvinceCode]
        : location.country || "Global";

  const hybrid: HybridMeta = {
    engineVersion: isBursaDomain
      ? "ATMOS-Core v5.0 (Bursa Zero-Drift · 17472s EMOS · 212-Üye)"
      : isNationalTrProvince && provinceSpec
        ? provinceSpec.calibrationTier === "TIER_A_WMO"
          ? `ATMOS-Core v5.0 (${provinceSpec.nameTr} WMO EMOS · MGM ALARO · 212-Üye)`
          : `ATMOS-Core v5.0 (${provinceSpec.nameTr} Donör+ALARO · 212-Üye)`
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
      verticalMechanism: isBursaDomain
        ? (firstHourVertPhys?.activeMechanism ?? "STANDARD_PROFILE")
        : firstHourNationalRegime,
      froudeNumber: isBursaDomain
        ? (firstHourVertPhys?.froudeNumber ?? 0)
        : firstHourNationalFroude,
      stabilityPct: stabilitySummary.overallStabilityPct,
      stabilityGrade: stabilitySummary.overallGrade,
      meanRunLockCount: stabilitySummary.meanRunLockCount,
      blockedFlipFlops: stabilitySummary.blockedNoisyRevisionsCount,
      spinUpVetoes: stabilitySummary.spinUpVetoesCount,
      stabilityBadgeLabel: stabilitySummary.badgeLabelTr,
      radarSummaryCode: radarNowcast.summaryCode,
      nextRainOnsetMin: radarNowcast.nextRainOnsetMinutes,
      rainCessationMin: radarNowcast.rainCessationMinutes,
      radarAvailable: radarNowcast.radarAvailable,
      currentRadarDbz: radarNowcast.currentDbzOverTarget,
      currentRadarRainMmHr: radarNowcast.currentRainRateMmHr,
      radarAdvectionSpeedKmh: radarNowcast.advectionSpeedKmH,
      radarAdvectionFromDeg: radarNowcast.advectionFromDeg,
      nowcastSteps5Min: Array.isArray(radarNowcast?.steps5Min)
        ? radarNowcast.steps5Min
            .map((s) => {
              const stepAny = s as RadarMinuteStep & {
                offsetMin?: number;
                dbz?: number;
                rainMmHr?: number;
                virga?: boolean;
              };
              const offsetMin = stepAny.offsetMinutes ?? stepAny.offsetMin ?? 0;
              const dbzVal = stepAny.estimatedDbz ?? stepAny.dbz ?? 0;
              const rainVal = stepAny.rainRateMmHr ?? stepAny.rainMmHr ?? 0;
              const virgaVal = stepAny.virgaSuppressed ?? stepAny.virga ?? false;
              return {
                offsetMin,
                dbz: Math.round(dbzVal * 10) / 10,
                rainMmHr: Math.round(rainVal * 100) / 100,
                virga: Boolean(virgaVal)
              };
            })
            .filter((s) => s.offsetMin <= 30)
            .slice(0, 7)
        : undefined,
      bursaTier1Online: isBursaDomain ? (bursaMesh?.tier1OnlineCount ?? 0) : 0,
      ltbrIsolated: Boolean(isBursaDomain && (bursaMesh?.tier1OnlineCount ?? 0) > 0),
      marmaraSstC: isBursaDomain ? (marmaraSstBundle?.currentSstC ?? null) : null,
      provinceCode: resolvedProvinceCode,
      provinceName: resolvedProvinceName,
      calibrationTier: engineCalibrationTier,
      tier1OnlineCount: isBursaDomain
        ? (bursaMesh?.tier1OnlineCount ?? 0)
        : nationalTier1OnlineCount,
      seaOrLakeTempC: isBursaDomain
        ? (marmaraSstBundle?.currentSstC ?? null)
        : primaryLiveWaterTempC,
      waterBodyLabelTr: isBursaDomain
        ? "Marmara Denizi (Mudanya – Gemlik Körfezi)"
        : (primaryWaterBody?.labelTr ?? null),
      activeMicroclimateTags: Array.from(activeMicroclimateTagSet),
      bimodalHoursResolved,
      mgmDistrictMatched: isBursaDomain
        ? (mgmForecasts?.targetDistrict ?? null)
        : (nationalMgmForecasts?.targetDistrict ?? null),
      accuracyBreakdown: curAccuracyBreakdown
    }
  };

  const savedNowMs = Date.now();
  const fetchedAtIso = new Date(savedNowMs).toISOString();
  const hybridFailed =
    !hJson || !Array.isArray(hJson?.hourly?.time) || hJson.hourly.time.length === 0;
  const ensembleFailed = ensIndex.memberCount === 0;
  const degradedStreams: string[] = [];
  if (hybridFailed) degradedStreams.push("8-Model NWP Havuzu");
  if (ensembleFailed) degradedStreams.push("212-Üye Ensemble");

  // Anti-Downgrade Guard (strictly province-scoped!)
  if (hybridFailed && ensembleFailed) {
    const memPrior = findMemoryWeatherEntry(resolvedProvinceCode, location, key, savedNowMs);
    const diskPrior = !memPrior
      ? getWeatherSnapshotFromDisk(location.lat, location.lon, savedNowMs, {
          provinceCode: resolvedProvinceCode
        })
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
      if (liveBursaSurface !== null || liveNationalSurface !== null || mos.anchor.active) {
        const updatedWetBulbC = Number(
          wetBulbStullC(hybridCurTemp, hybridCurRh).toFixed(1)
        );
        const cleanWindDir = Math.round(((hybridCurDir % 360) + 360) % 360);
        protectedBundle.current = {
          ...protectedBundle.current,
          temperature: hybridCurTemp,
          apparentTemperature: hybridCurApparent,
          wetBulbC: updatedWetBulbC,
          humidity: hybridCurRh,
          dewPoint: hybridCurDew,
          pressure: pNow,
          windSpeed: hybridCurWind,
          windGusts: hybridCurGust,
          windDirection: cleanWindDir,
          beaufort: windKmhToBeaufort(hybridCurWind)
        };
        if (protectedBundle.hourly.length > 0) {
          const syncedH0: ExtendedHourlyPoint = {
            ...(protectedBundle.hourly[0] as ExtendedHourlyPoint),
            temperature: hybridCurTemp,
            apparentTemperature: hybridCurApparent,
            wetBulbC: updatedWetBulbC,
            humidity: hybridCurRh,
            dewPoint: hybridCurDew,
            pressure: pNow,
            windSpeed: hybridCurWind,
            windGusts: hybridCurGust,
            windDirection: cleanWindDir,
            subHourOffsetFrac: subHourFrac
          };
          protectedBundle.hourly = [
            syncedH0,
            ...protectedBundle.hourly.slice(1)
          ];
        }
        if (protectedBundle.daily.length > 0) {
          const d0 = protectedBundle.daily[0];
          protectedBundle.daily = [
            {
              ...d0,
              tempMax: Math.max(d0.tempMax, hybridCurTemp),
              tempMin: Math.min(d0.tempMin, hybridCurTemp),
              windSpeedMax: Math.max(d0.windSpeedMax, Math.round(hybridCurWind)),
              windGustMax:
                d0.windGustMax !== undefined
                  ? Math.max(d0.windGustMax, Math.round(hybridCurGust))
                  : d0.windGustMax
            },
            ...protectedBundle.daily.slice(1)
          ];
        }
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

  const provinceSummary: ProvinceClientSummary | null = isBursaDomain
    ? buildBursaProvinceSummary(
        bursaMesh?.acceptedCount ?? 19,
        marmaraSstBundle?.currentSstC ?? null
      )
    : isNationalTrProvince && provinceSpec
      ? buildProvinceClientSummary(provinceSpec, {
          mgmMeshStationCount:
            nationalMgmMesh && nationalMgmMesh.acceptedCount > 0
              ? nationalMgmMesh.acceptedCount
              : undefined,
          liveWaterTempsByBodyId
        })
      : null;

  const bundle: WeatherBundle = {
    location: {
      ...location,
      elevation: cityElevationM,
      timezone: resolvedTimezone
    },
    provinceSummary,
    source: isLiveVerified
      ? "hybrid-nwp-verified"
      : activeModels.length >= 2
        ? "hybrid-nwp"
        : "open-meteo",
    fetchedAt: fetchedAtIso,
    timezone: resolvedTimezone,
    utcOffsetSeconds,
    freshness: bundleFreshness,
    current: canonicalNow.current,
    airQuality,
    hourly,
    minutely15,
    daily,
    subseasonal,
    sounding: hourlySoundings[0] ?? initialSounding,
    hourlySoundings,
    nativeConvective: {
      cape: nominalHour0?.cape ?? null,
      cin: nominalHour0?.cin ?? null,
      liftedIndex: nominalHour0?.liftedIndex ?? null,
      freezingLevelM: nominalHour0?.freezingLevelM ?? null,
      lightningPotential: minutely15[0]?.lightningPotential ?? null
    },
    storm: stormAssessment,
    snowAndLightning: snowAndLightningSummary,
    hybrid
  };

  const effectiveTtl =
    bundleStatus === "live" ? WEATHER_TTL_MS : WEATHER_DEGRADED_TTL_MS;
  setPartitionEntry(weatherCacheByProvince, resolvedProvinceCode, key, {
    value: bundle,
    expiresAt: savedNowMs + effectiveTtl,
    staleUntil: savedNowMs + WEATHER_STALE_MS,
    cachedAtMs: savedNowMs,
    provinceCode: resolvedProvinceCode
  });

  if (
    bundleStatus === "live" ||
    !getWeatherSnapshotFromDisk(location.lat, location.lon, savedNowMs, {
      provinceCode: resolvedProvinceCode
    })
  ) {
    saveWeatherSnapshotToDisk(bundle, savedNowMs, false, {
      provinceCode: resolvedProvinceCode
    });
  }

  return cloneIsolatedValue(bundle);
}

/** Alias exported for callers/tests referencing `getWeatherBundle` */
export const getWeatherBundle = fetchWeatherBundle;

export interface MultiModelFetchOptions {
  id?: string;
  name?: string;
  admin1?: string;
  country?: string;
  elevation?: number;
  timezone?: string;
  provinceCode?: string;
}

export async function fetchMultiModelBundle(
  latOrLocation: number | GeoLocation,
  maybeLon?: number,
  options?: MultiModelFetchOptions
): Promise<MultiModelBundle> {
  let rawInputLat: number;
  let rawInputLon: number;
  let candidateBaseLoc: GeoLocation;

  if (typeof latOrLocation === "object" && latOrLocation !== null) {
    rawInputLat = latOrLocation.lat;
    rawInputLon = latOrLocation.lon;
    candidateBaseLoc = {
      ...latOrLocation,
      ...(options?.id !== undefined ? { id: options.id } : {}),
      ...(options?.name !== undefined ? { name: options.name } : {}),
      ...(options?.admin1 !== undefined ? { admin1: options.admin1 } : {}),
      ...(options?.country !== undefined ? { country: options.country } : {}),
      ...(options?.elevation !== undefined ? { elevation: options.elevation } : {}),
      ...(options?.timezone !== undefined ? { timezone: options.timezone } : {}),
      ...(options?.provinceCode !== undefined ? { provinceCode: options.provinceCode } : {})
    };
  } else {
    rawInputLat = latOrLocation;
    rawInputLon =
      typeof maybeLon === "number" && Number.isFinite(maybeLon)
        ? maybeLon
        : DEFAULT_LOCATION.lon;

    const prelimRes = resolveProvinceCode({
      lat: rawInputLat,
      lon: rawInputLon,
      admin1: options?.admin1 ?? null,
      explicitProvinceCode: options?.provinceCode ?? null
    });

    const isBareBursaCenter =
      prelimRes.provinceCode === "TR-16" &&
      options !== undefined &&
      !options.name &&
      !options.id &&
      (options.elevation === undefined ||
        options.elevation === 100 ||
        options.elevation === 155) &&
      ((Math.abs(rawInputLat - BURSA_WMO_17116_LAT) <= 0.008 &&
        Math.abs(rawInputLon - BURSA_WMO_17116_LON) <= 0.008) ||
        (Math.abs(rawInputLat - 40.1885) <= 0.008 &&
          Math.abs(rawInputLon - 29.061) <= 0.008) ||
        (Math.abs(rawInputLat - 40.1956) <= 0.008 &&
          Math.abs(rawInputLon - 29.0601) <= 0.008));

    candidateBaseLoc = {
      id: options?.id ?? (isBareBursaCenter ? "bursa-tr" : ""),
      name: options?.name ?? (isBareBursaCenter ? "Bursa" : ""),
      admin1: options?.admin1,
      country: options?.country ?? "",
      lat: rawInputLat,
      lon: rawInputLon,
      elevation: options?.elevation,
      timezone: options?.timezone,
      provinceCode: options?.provinceCode
    };
  }

  const adm1ModelRes = resolveProvinceCode({
    lat: candidateBaseLoc.lat,
    lon: candidateBaseLoc.lon,
    admin1: candidateBaseLoc.admin1 ?? null,
    countryCode: candidateBaseLoc.countryCode ?? null,
    explicitProvinceCode: candidateBaseLoc.provinceCode ?? null
  });
  const resolvedProvinceCode: ProvinceCode = adm1ModelRes.provinceCode;

  const canonicalLoc: GeoLocation =
    resolvedProvinceCode === "TR-16" &&
    (typeof latOrLocation === "object" || options !== undefined)
      ? normalizeCanonicalBursaLocation(candidateBaseLoc)
      : candidateBaseLoc;

  const lat = canonicalLoc.lat;
  const lon = canonicalLoc.lon;
  const hasExplicitElev =
    typeof canonicalLoc.elevation === "number" &&
    Number.isFinite(canonicalLoc.elevation);
  const elevRounded = hasExplicitElev
    ? Math.round(canonicalLoc.elevation as number)
    : undefined;

  const key = makeStrictProvinceCacheKey({
    provinceCode: resolvedProvinceCode,
    locationId: canonicalLoc.id,
    lat,
    lon,
    elevationM: elevRounded
  });

  const attachIdentityMeta = (base: MultiModelBundle): MultiModelBundle => ({
    ...base,
    ...(resolvedProvinceCode !== "GLOBAL" ? { provinceCode: resolvedProvinceCode } : {}),
    ...(elevRounded !== undefined
      ? { elevation: elevRounded }
      : base.elevation !== undefined
        ? { elevation: base.elevation }
        : {}),
    ...(canonicalLoc.name
      ? { name: canonicalLoc.name }
      : base.name
        ? { name: base.name }
        : {}),
    ...(canonicalLoc.admin1 !== undefined
      ? { admin1: canonicalLoc.admin1 }
      : base.admin1 !== undefined
        ? { admin1: base.admin1 }
        : {}),
    ...(canonicalLoc.country
      ? { country: canonicalLoc.country }
      : base.country
        ? { country: base.country }
        : {})
  });

  const nowMs = Date.now();
  const cached = getFreshPartitionEntry(modelCacheByProvince, resolvedProvinceCode, key, nowMs);
  if (cached) {
    return reanchorMultiModelBundleToNow(attachIdentityMeta(cached.value), nowMs, {
      status: cached.value.freshness?.status ?? "live",
      sourceTier: cached.value.freshness?.sourceTier ?? "live",
      cachedAtMs: cached.cachedAtMs,
      modelsRespondedCount: cached.value.freshness?.modelsRespondedCount
    });
  }

  const resolveStaleModels = (reason: string): MultiModelBundle | null => {
    const fallbackNow = Date.now();
    const sub = modelCacheByProvince.get(resolvedProvinceCode);
    const staleEntry = sub?.get(key);
    if (staleEntry && staleEntry.staleUntil > fallbackNow) {
      return reanchorMultiModelBundleToNow(
        attachIdentityMeta(cloneIsolatedValue(staleEntry.value)),
        fallbackNow,
        {
          status: "stale",
          sourceTier: "memory-stale",
          cachedAtMs: staleEntry.cachedAtMs,
          staleReason: reason,
          modelsRespondedCount: staleEntry.value.freshness?.modelsRespondedCount
        }
      );
    }
    const diskHit =
      getModelsSnapshotFromDisk(lat, lon, fallbackNow, {
        provinceCode: resolvedProvinceCode
      }) ??
      (rawInputLat !== lat || rawInputLon !== lon
        ? getModelsSnapshotFromDisk(rawInputLat, rawInputLon, fallbackNow, {
            provinceCode: resolvedProvinceCode
          })
        : null);
    if (
      diskHit &&
      (elevRounded === undefined ||
        diskHit.models.elevation === undefined ||
        Math.abs(diskHit.models.elevation - elevRounded) <= 150)
    ) {
      return reanchorMultiModelBundleToNow(
        attachIdentityMeta(diskHit.models),
        fallbackNow,
        {
          status: "stale",
          sourceTier: "disk-stale",
          cachedAtMs: diskHit.savedAtMs,
          staleReason: reason,
          modelsRespondedCount: diskHit.models.freshness?.modelsRespondedCount
        }
      );
    }
    return null;
  };

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat.toFixed(4));
  url.searchParams.set("longitude", lon.toFixed(4));
  if (elevRounded !== undefined) {
    url.searchParams.set("elevation", String(elevRounded));
  }
  url.searchParams.set("current", "temperature_2m");
  url.searchParams.set(
    "hourly",
    "temperature_2m,precipitation,wind_speed_10m,temperature_850hPa"
  );
  url.searchParams.set(
    "models",
    "ecmwf_ifs,ecmwf_aifs025_single,icon_seamless,ukmo_seamless,meteofrance_seamless,gfs_seamless,gem_seamless,jma_seamless,ecmwf_ifs025,icon_global"
  );
  url.searchParams.set("forecast_days", "16");
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
  const cur = json?.current ?? {};
  const h = json?.hourly ?? {};
  const times: string[] = Array.isArray(h.time) ? h.time : [];
  if (times.length === 0) {
    const stale = resolveStaleModels("Çoklu model serisi boş döndü");
    if (stale) return stale;
    throw new Error("Open-Meteo multi-model payload empty");
  }

  const resolvedTimezone = String(json.timezone ?? canonicalLoc.timezone ?? "UTC");
  const utcOffsetSeconds = Number(json.utc_offset_seconds ?? 0);
  const effectiveModelTz =
    resolvedTimezone === "UTC" && utcOffsetSeconds !== 0
      ? undefined
      : resolvedTimezone;
  const modelTzResolver = createFastZonedTimeResolver(
    effectiveModelTz,
    utcOffsetSeconds
  );

  const timesUtcMs: number[] = new Array(times.length);
  for (let idx = 0; idx < times.length; idx++) {
    const prevUtcMs = idx > 0 ? timesUtcMs[idx - 1] : undefined;
    timesUtcMs[idx] = modelTzResolver
      .localIsoToUtcDate(times[idx], prevUtcMs)
      .getTime();
  }

  const curTimeRaw = typeof cur.time === "string" ? cur.time.trim() : "";
  const startIdx = resolveDstSafeStartHourIndex({
    times,
    timesUtcMs,
    curTimeRaw,
    utcOffsetSeconds,
    tzResolver: modelTzResolver,
    nowEpochMs: Date.now()
  });

  const originTodayYmd = times[startIdx].slice(0, 10);
  const endIdx = Math.min(startIdx + 360, times.length);

  const buildSeries = (
    prefix: string,
    useIfs025ForIfs = false
  ): ModelSeriesPoint[] => {
    const out: ModelSeriesPoint[] = [];
    for (let i = startIdx; i < endIdx; i++) {
      const t = times[i];
      const ifsVal = useIfs025ForIfs
        ? (toFiniteNum(h[`${prefix}_ecmwf_ifs025`]?.[i]) ??
          toFiniteNum(h[`${prefix}_ecmwf_ifs`]?.[i]))
        : (toFiniteNum(h[`${prefix}_ecmwf_ifs`]?.[i]) ??
          toFiniteNum(h[`${prefix}_ecmwf_ifs025`]?.[i]));
      const iconVal =
        toFiniteNum(h[`${prefix}_icon_seamless`]?.[i]) ??
        toFiniteNum(h[`${prefix}_icon_global`]?.[i]);
      out.push({
        time: t,
        hourLabel: t.slice(11, 16),
        dayLabel: formatRelativeDayLabelTr(t.slice(0, 10), originTodayYmd, "plusDay"),
        ecmwfIfs: ifsVal,
        ecmwfAifs: toFiniteNum(h[`${prefix}_ecmwf_aifs025_single`]?.[i]),
        icon: iconVal,
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
  const resolvedElevation =
    elevRounded !== undefined
      ? elevRounded
      : typeof json?.elevation === "number" && Number.isFinite(json.elevation)
        ? Math.round(json.elevation)
        : undefined;

  const bundle: MultiModelBundle = {
    fetchedAt: fetchedIso,
    lat,
    lon,
    ...(resolvedProvinceCode !== "GLOBAL" ? { provinceCode: resolvedProvinceCode } : {}),
    ...(resolvedElevation !== undefined ? { elevation: resolvedElevation } : {}),
    ...(canonicalLoc.name ? { name: canonicalLoc.name } : {}),
    ...(canonicalLoc.admin1 !== undefined ? { admin1: canonicalLoc.admin1 } : {}),
    ...(canonicalLoc.country ? { country: canonicalLoc.country } : {}),
    timezone: resolvedTimezone,
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

  setPartitionEntry(modelCacheByProvince, resolvedProvinceCode, key, {
    value: bundle,
    expiresAt: savedMs + MODEL_TTL_MS,
    staleUntil: savedMs + MODEL_STALE_MS,
    cachedAtMs: savedMs,
    provinceCode: resolvedProvinceCode
  });
  if (
    modelsRespondedCount >= 4 ||
    !getModelsSnapshotFromDisk(lat, lon, savedMs, {
      provinceCode: resolvedProvinceCode
    })
  ) {
    saveModelsSnapshotToDisk(bundle, savedMs, false, {
      provinceCode: resolvedProvinceCode
    });
  }
  return cloneIsolatedValue(bundle);
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
  const pastFrames: RadarFrame[] = past.map((f: { time: number; path: string }) => ({
    time: Number(f.time),
    path: String(f.path),
    isForecast: false
  }));
  const nowcastFrames: RadarFrame[] = nowcast.map((f: { time: number; path: string }) => ({
    time: Number(f.time),
    path: String(f.path),
    isForecast: true
  }));
  const frames: RadarFrame[] = [...pastFrames, ...nowcastFrames];
  const lastPastIndex =
    pastFrames.length > 0 ? pastFrames.length - 1 : Math.max(0, frames.length - 1);

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
    lastPastIndex,
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
    cachedAtMs: savedMs,
    provinceCode: "GLOBAL"
  };
  return meta;
}

export function snapWindGridBounds(bounds: {
  south: number;
  west: number;
  north: number;
  east: number;
}): { south: number; west: number; north: number; east: number; cacheKey: string } {
  const rawSouth = Math.max(-80, Math.min(80, bounds.south));
  const rawNorth = Math.max(-80, Math.min(80, bounds.north));

  const step = 0.25;
  const south = Math.max(-80, Math.floor(Math.min(rawSouth, rawNorth) / step) * step);
  let north = Math.min(80, Math.ceil(Math.max(rawSouth, rawNorth) / step) * step);
  if (north - south < step) {
    north = Math.min(80, south + step);
  }

  if (bounds.east > bounds.west && bounds.east <= 180 && bounds.west >= -180) {
    const rawWest = Math.max(-180, Math.min(180, bounds.west));
    const rawEast = Math.max(-180, Math.min(180, bounds.east));
    const west = Math.max(-180, Math.floor(Math.min(rawWest, rawEast) / step) * step);
    let east = Math.min(180, Math.ceil(Math.max(rawWest, rawEast) / step) * step);
    if (east - west < step) {
      east = Math.min(180, west + step);
    }

    const cacheKey = `${south.toFixed(2)},${west.toFixed(2)},${north.toFixed(2)},${east.toFixed(2)}`;
    return { south, west, north, east, cacheKey };
  }

  const rawWest = Math.max(-180, Math.min(180, bounds.west));
  const unwrappedEast =
    bounds.east > 180
      ? Math.min(540, bounds.east)
      : Math.max(-180, Math.min(180, bounds.east)) + 360;
  const west = Math.max(-180, Math.floor(rawWest / step) * step);
  let east = Math.min(540, Math.ceil(unwrappedEast / step) * step);
  if (east - west < step) {
    east = Math.min(540, west + step);
  }

  const cacheKey = `${south.toFixed(2)},${west.toFixed(2)},${north.toFixed(2)},${east.toFixed(2)}`;
  return { south, west, north, east, cacheKey };
}

export async function fetchWindGrid(bounds: {
  south: number;
  west: number;
  north: number;
  east: number;
}): Promise<WindGridBundle> {
  const rows = 5;
  const cols = 5;
  const { south, west, north, east, cacheKey } = snapWindGridBounds(bounds);
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
      const wrappedLon =
        lon >= -180 && lon <= 180
          ? lon
          : ((((lon + 180) % 360) + 360) % 360) - 180;
      lats.push(lat.toFixed(3));
      lons.push(wrappedLon.toFixed(3));
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
    cachedAtMs: savedMs,
    provinceCode: "GLOBAL"
  });
  return grid;
}
