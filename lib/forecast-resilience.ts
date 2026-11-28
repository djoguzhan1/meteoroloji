/**
 * ATMOS v5.0 — Forecast Resilience, Time-Reanchoring & Freshness Engine
 * File: lib/forecast-resilience.ts
 *
 * Pure shared client/server module (zero `node:*` imports):
 *  1. Canonical coordinate-keying & strict city equivalence checks (prevents cross-city data bleed).
 *  2. `reanchorWeatherBundleToNow`: Advances cached `hourly`, `hourlySoundings`, `minutely15`,
 *     `daily`, `snowAndLightning`, and `current` to the exact present IANA local wall-clock hour
 *     (DST-safe via `createFastZonedTimeResolver`) while strictly preserving `fetchedAt` truth
 *     and canonical equality between `nextCurrent` and `nextHourly[0]`.
 *  3. `reanchorMultiModelBundleToNow`: Advances 8-model series and recomputes `72h`/`168h`/`360h` summaries.
 *  4. Human-readable Turkish freshness age & telemetry formatters.
 */

import { CORE_MODEL_KEYS } from "./model-registry";
import {
  buildLightningProximityRadar,
  type LightningHourPhysicsResult,
  maxBlowingSnowRisk,
  maxDekStatus,
  maxIcingRisk
} from "./snow-and-lightning-engine";
import { decayConfidenceForStaleOrDegraded } from "./accuracy-index";
import { wetBulbStullC } from "./thermo-cape";
import {
  classifyUvIndex,
  computeSolarElevationDeg,
  createFastZonedTimeResolver,
  formatRelativeDayLabelTr,
  isWetActiveSample,
  mapWmoCodeToLabel,
  solarElevationToDaylight,
  windKmhToBeaufort
} from "./weather-client";
import type {
  BlowingSnowRisk,
  CoreModelKey,
  CurrentWeather,
  DailyPoint,
  DataFreshnessMeta,
  DekSnowStatus,
  FreshnessSourceTier,
  FreshnessStatus,
  GeoLocation,
  HourlyPoint,
  ModelSeriesPoint,
  MultiModelBundle,
  PrecipPhase,
  PrecipType,
  RoadIcingRisk,
  SnowAndLightningObservatorySummary,
  SubseasonalOutlookBundle,
  WeatherBundle
} from "./weather-types";

type ExtendedHourlyPoint = HourlyPoint & {
  potentialPrecipPhase?: PrecipPhase;
  subHourOffsetFrac?: number;
};

export const LIVE_FRESHNESS_MAX_AGE_MS = 5 * 60 * 1000;
export const STALE_RETENTION_MAX_MS = 72 * 3600 * 1000; // 72 hours

export function makeLocationCacheKey(
  locOrLat: Pick<GeoLocation, "lat" | "lon"> | number,
  maybeLon?: number
): string {
  const lat = typeof locOrLat === "number" ? locOrLat : locOrLat.lat;
  const lon = typeof locOrLat === "number" ? (maybeLon ?? 0) : locOrLat.lon;
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

export function areLocationsEquivalent(
  a: (Pick<GeoLocation, "lat" | "lon"> & { id?: string; elevation?: number }) | null | undefined,
  b: (Pick<GeoLocation, "lat" | "lon"> & { id?: string; elevation?: number }) | null | undefined,
  toleranceDeg = 0.018
): boolean {
  if (!a || !b) return false;
  if (
    a.id &&
    b.id &&
    a.id.startsWith("bursa-") &&
    b.id.startsWith("bursa-") &&
    a.id !== b.id
  ) {
    return false;
  }
  if (
    typeof a.elevation === "number" &&
    typeof b.elevation === "number" &&
    Number.isFinite(a.elevation) &&
    Number.isFinite(b.elevation) &&
    Math.abs(a.elevation - b.elevation) >= 65
  ) {
    return false;
  }
  return (
    Math.abs(a.lat - b.lat) <= toleranceDeg &&
    Math.abs(a.lon - b.lon) <= toleranceDeg
  );
}

function lerpScalar(a: number, b: number, t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return a + (b - a) * clamped;
}

function resolveCanonicalSkyCondition(params: {
  isWet: boolean;
  weatherCode: number;
  precipPhase: PrecipPhase;
  precipProbability: number;
  cloudCover: number;
  wetBulbC: number;
  lightningProbPct: number;
  isThundersnow: boolean;
  fallbackCondition?: string;
}): { weatherCode: number; condition: string } {
  const {
    isWet,
    precipPhase,
    precipProbability,
    cloudCover,
    wetBulbC,
    lightningProbPct,
    isThundersnow,
    fallbackCondition
  } = params;
  let code = params.weatherCode;

  if (!isWet) {
    if (lightningProbPct >= 55 && code >= 95) {
      code = 95;
    } else if (code !== 45 && code !== 48 && code >= 51) {
      code = cloudCover >= 78 ? 3 : cloudCover >= 38 ? 2 : cloudCover >= 15 ? 1 : 0;
    }
    const drySkyLabel = mapWmoCodeToLabel(code);
    if (precipProbability >= 22) {
      const wetHint =
        wetBulbC <= 0.2
          ? "Kar İhtimali"
          : wetBulbC <= 1.6
            ? "Sulu Kar İhtimali"
            : "Yağış İhtimali";
      return { weatherCode: code, condition: `${drySkyLabel} (${wetHint})` };
    }
    return { weatherCode: code, condition: drySkyLabel };
  }

  if (isThundersnow) {
    return {
      weatherCode: Math.max(code, 95),
      condition: "Gökgürültülü Kar (Thundersnow)"
    };
  }
  if (precipPhase === "hail") {
    return { weatherCode: Math.max(code, 96), condition: "Dolu Riskli Sağanak" };
  }
  if (precipPhase === "freezing_rain") {
    return { weatherCode: code >= 66 && code <= 67 ? code : 66, condition: "Donan Yağmur" };
  }
  if (precipPhase === "sleet") {
    return {
      weatherCode: code >= 51 ? code : 61,
      condition: "Karla Karışık Yağmur"
    };
  }
  if (precipPhase === "snow" && code < 71) {
    code = 73;
  } else if (
    precipPhase === "rain" &&
    (code < 51 || (code >= 71 && code <= 77) || code === 85 || code === 86)
  ) {
    code = 61;
  }
  return {
    weatherCode: code,
    condition: fallbackCondition && !fallbackCondition.includes("İhtimali")
      ? precipPhase === "snow" && !fallbackCondition.includes("Kar")
        ? mapWmoCodeToLabel(code)
        : precipPhase === "rain" && fallbackCondition.includes("Kar")
          ? mapWmoCodeToLabel(code)
          : mapWmoCodeToLabel(code)
      : mapWmoCodeToLabel(code)
  };
}

export interface FreshnessOverrideInput {
  status: FreshnessStatus;
  sourceTier: FreshnessSourceTier;
  cachedAtMs?: number;
  staleReason?: string;
  degradedStreams?: string[];
  modelsRespondedCount?: number;
}

export function buildFreshnessMeta(
  fetchedAtIso: string,
  nowMs: number,
  input: FreshnessOverrideInput
): DataFreshnessMeta {
  const parsedFetchMs = Date.parse(fetchedAtIso);
  const effectiveFetchMs = Number.isFinite(parsedFetchMs) ? parsedFetchMs : nowMs;
  const ageSeconds = Math.max(0, Math.round((nowMs - effectiveFetchMs) / 1000));
  return {
    status: input.status,
    sourceTier: input.sourceTier,
    fetchedAt: fetchedAtIso,
    cachedAtMs: input.cachedAtMs ?? effectiveFetchMs,
    ageSeconds,
    staleReason: input.staleReason,
    degradedStreams:
      input.degradedStreams && input.degradedStreams.length > 0
        ? input.degradedStreams
        : undefined,
    modelsRespondedCount: input.modelsRespondedCount
  };
}

export interface ReanchorSnowAndLightningContext {
  nextCurrent: CurrentWeather;
  nextHourly: HourlyPoint[];
  nextDaily: DailyPoint[];
  nextSubseasonal?: SubseasonalOutlookBundle | null;
  ageMs: number;
  hourOffset: number;
  nowMs: number;
}

export interface ReanchorSnowAndLightningParams extends ReanchorSnowAndLightningContext {
  previous?: SnowAndLightningObservatorySummary;
}

/**
 * Recomputes `SnowAndLightningObservatorySummary` when re-anchoring a cached bundle:
 *  - Updates `soilTempNowC` & `roadTempNowC` to `nextHourly[0]` / `nextCurrent`.
 *  - Re-aggregates 15–30d snow totals, snowpack peak, lowest snow line, and DEK status.
 *  - Recomputes 48h icing/blowing-snow and 48h/168h lightning risk windows.
 *  - Ages out live 3-ring Doppler/METAR radar cells into NWP convective projection when `ageMs >= 30m || hourOffset > 0`.
 */
export function reanchorSnowAndLightningSummary(
  params: ReanchorSnowAndLightningParams
): SnowAndLightningObservatorySummary | undefined;
export function reanchorSnowAndLightningSummary(
  previous: SnowAndLightningObservatorySummary | undefined,
  context: ReanchorSnowAndLightningContext
): SnowAndLightningObservatorySummary | undefined;
export function reanchorSnowAndLightningSummary(
  arg1: ReanchorSnowAndLightningParams | SnowAndLightningObservatorySummary | undefined,
  arg2?: ReanchorSnowAndLightningContext
): SnowAndLightningObservatorySummary | undefined {
  let prev: SnowAndLightningObservatorySummary | undefined;
  let ctx: ReanchorSnowAndLightningContext;

  if (arg2 !== undefined) {
    prev = arg1 as SnowAndLightningObservatorySummary | undefined;
    ctx = arg2;
  } else if (arg1 && "nextCurrent" in arg1) {
    prev = arg1.previous;
    ctx = arg1;
  } else {
    return undefined;
  }

  if (!prev) return undefined;

  const {
    nextCurrent,
    nextHourly,
    nextDaily,
    nextSubseasonal,
    ageMs,
    hourOffset,
    nowMs
  } = ctx;

  const h0 = nextHourly[0];
  const h1 = nextHourly[1];

  const soilTempNowC =
    nextCurrent.soilTempC ??
    h0?.soilTempC ??
    Number((nextCurrent.temperature * 0.85 + 0.8).toFixed(1));
  const roadTempNowC =
    nextCurrent.roadTempC ??
    h0?.roadTempC ??
    Number((nextCurrent.temperature * 0.9 + 1.4).toFixed(1));

  const total15dAirSnowCm = Number(
    nextDaily.reduce((s, d) => s + (d.airSnowSumCm ?? 0), 0).toFixed(1)
  );
  const total15dGroundSnowCm = Number(
    nextDaily.reduce((s, d) => s + (d.groundSnowSumCm ?? 0), 0).toFixed(1)
  );
  const total15dRoadSnowCm = Number(
    nextDaily.reduce((s, d) => s + (d.roadSnowSumCm ?? 0), 0).toFixed(1)
  );
  const peak15dSnowpackCm = Number(
    nextDaily.reduce((m, d) => Math.max(m, d.maxSnowpackDepthCm ?? 0), 0).toFixed(1)
  );
  const lowest15dSnowLineM = nextDaily.reduce<number | null>((best, d) => {
    if (d.minSnowLineM === null || d.minSnowLineM === undefined) return best;
    return best === null ? d.minSnowLineM : Math.min(best, d.minSnowLineM);
  }, null);
  const dekStatus15d = nextDaily.reduce<DekSnowStatus>(
    (acc, d) => maxDekStatus(acc, d.dekStatus ?? "none"),
    "none"
  );
  const dekDeltaTSst850C =
    dekStatus15d === "none" && prev.dekStatus15d !== "none"
      ? null
      : prev.dekDeltaTSst850C;

  const first48Hours = nextHourly.slice(0, 48);
  const first168Hours = nextHourly.slice(0, 168);

  const maxIcingRisk48h = first48Hours.reduce<RoadIcingRisk>(
    (acc, h) => maxIcingRisk(acc, h.icingRisk ?? "none"),
    "none"
  );
  const maxBlowingSnow48h = first48Hours.reduce<BlowingSnowRisk>(
    (acc, h) => maxBlowingSnowRisk(acc, h.blowingSnowRisk ?? "none"),
    "none"
  );

  const nextSnowHour = nextHourly.find(
    (h) => (h.airSnowCm ?? 0) >= 0.1 || (h.airSnowProbPct ?? 0) >= 35
  );
  const nextSnowDay = nextDaily.find(
    (d) =>
      (d.airSnowSumCm ?? 0) >= 0.1 ||
      (d.snowProbMaxPct ?? 0) >= 30 ||
      (d.elevationSnowBands?.some((b) => b.airSnowCm >= 0.5) ?? false)
  );
  const preservedLateSnowHourIso =
    !nextSnowHour &&
    nextSnowDay &&
    prev.nextSnowHourIso &&
    (!h0 || prev.nextSnowHourIso >= h0.time)
      ? prev.nextSnowHourIso
      : null;

  const hasSubseasonalSnow = Boolean(
    nextSubseasonal?.days.some(
      (sd) => (sd.snowProbPct ?? 0) >= 25 || (sd.airSnowP90Cm ?? 0) >= 0.5
    )
  );
  const hasAnySnow15d =
    Boolean(nextSnowDay) || Boolean(nextSnowHour) || total15dAirSnowCm >= 0.1;

  let lightningRadar = prev.lightningRadar;
  if ((ageMs >= 30 * 60 * 1000 || hourOffset > 0) && h0) {
    const h0Lt: LightningHourPhysicsResult = {
      lightningProbPct: nextCurrent.lightningProbPct ?? h0.lightningProbPct ?? 0,
      lpiEffectiveJkg: h0.lpiJkg ?? 0,
      flashesPerMin: nextCurrent.lightningFlashesPerMin ?? h0.lightningFlashesPerMin ?? 0,
      cgFractionPct: h0.cgFractionPct ?? 28,
      isThundersnow: Boolean(nextCurrent.isThundersnow ?? h0.isThundersnow)
    };
    const h1Lt: LightningHourPhysicsResult | null = h1
      ? {
          lightningProbPct: h1.lightningProbPct ?? 0,
          lpiEffectiveJkg: h1.lpiJkg ?? 0,
          flashesPerMin: h1.lightningFlashesPerMin ?? 0,
          cgFractionPct: h1.cgFractionPct ?? 28,
          isThundersnow: Boolean(h1.isThundersnow)
        }
      : null;

    lightningRadar = buildLightningProximityRadar({
      updatedAtIso: prev.lightningRadar.updatedAtIso || new Date(nowMs).toISOString(),
      radarAvailable: false,
      currentRadarDbz: 0,
      radarCells: [],
      metarStations: [],
      hour0Lightning: h0Lt,
      hour1Lightning: h1Lt,
      surfaceTempC: nextCurrent.temperature,
      dekStatus: nextCurrent.dekStatus ?? h0.dekStatus ?? "none"
    });
  }

  const peak48hLightningProbPct = first48Hours.reduce(
    (m, h) => Math.max(m, h.lightningProbPct ?? 0),
    nextCurrent.lightningProbPct ?? lightningRadar.rings[0].probabilityPct
  );
  const peak168hLightningProbPct = first168Hours.reduce(
    (m, h) => Math.max(m, h.lightningProbPct ?? 0),
    peak48hLightningProbPct
  );
  const peak168hFlashesPerMin = Number(
    first168Hours
      .reduce(
        (m, h) => Math.max(m, h.lightningFlashesPerMin ?? 0),
        lightningRadar.currentFlashesPerMin
      )
      .toFixed(1)
  );
  const hasThundersnow168h = first168Hours.some((h) => Boolean(h.isThundersnow));
  const nextLightningHour = first168Hours.find((h) => (h.lightningProbPct ?? 0) >= 28);

  return {
    referenceElevationM: prev.referenceElevationM,
    soilTempNowC,
    roadTempNowC,
    hasAnySnow15d,
    hasAnySnow30d: hasAnySnow15d || hasSubseasonalSnow,
    nextSnowHourIso: nextSnowHour?.time ?? preservedLateSnowHourIso,
    nextSnowDateYmd: nextSnowDay?.date ?? null,
    total15dAirSnowCm,
    total15dGroundSnowCm,
    total15dRoadSnowCm,
    peak15dSnowpackCm,
    lowest15dSnowLineM,
    dekStatus15d,
    dekDeltaTSst850C,
    maxIcingRisk48h,
    maxBlowingSnow48h,
    lightningRadar,
    peak48hLightningProbPct,
    peak168hLightningProbPct,
    peak168hFlashesPerMin,
    hasThundersnow168h,
    nextLightningHourIso: nextLightningHour?.time ?? null
  };
}

/**
 * Re-anchors a cached `WeatherBundle` to `nowMs` so past hours/15-min slots/days
 * are never displayed as the present, while strictly preserving `fetchedAt` truth
 * and maintaining 100% canonical equality between `current` and `hourly[0]`.
 */
export function reanchorWeatherBundleToNow(
  bundle: WeatherBundle,
  nowMs = Date.now(),
  override?: FreshnessOverrideInput
): WeatherBundle {
  const authenticFetchedAt = bundle.freshness?.fetchedAt || bundle.fetchedAt;
  const parsedFetchMs = Date.parse(authenticFetchedAt);
  const effectiveFetchMs = Number.isFinite(parsedFetchMs) ? parsedFetchMs : nowMs;
  const ageMs = Math.max(0, nowMs - effectiveFetchMs);

  const fallbackOffsetSec = Number.isFinite(bundle.utcOffsetSeconds)
    ? bundle.utcOffsetSeconds
    : 0;
  const effectiveBundleTz =
    bundle.timezone === "UTC" && fallbackOffsetSec !== 0
      ? undefined
      : bundle.timezone;
  const tzResolver = createFastZonedTimeResolver(effectiveBundleTz, fallbackOffsetSec);
  const localNowParts = tzResolver.epochMsToLocalParts(nowMs);
  const localNowIsoMin = localNowParts.isoMinute; // "YYYY-MM-DDTHH:MM"
  const localNowHourIso = localNowParts.isoHour; // "YYYY-MM-DDTHH:00"
  const localTodayYmd = localNowParts.ymd; // "YYYY-MM-DD"
  const subHourFrac = Math.max(0, Math.min(1, localNowParts.minute / 60));

  // 1. Advance `hourly` & `hourlySoundings` to current IANA local hour (including fall-back fold check)
  let hourOffset = bundle.hourly.findIndex((h) => h.time >= localNowHourIso);
  if (hourOffset < 0) {
    hourOffset = Math.max(0, bundle.hourly.length - 1);
  } else if (
    bundle.hourly[hourOffset]?.time === localNowHourIso &&
    bundle.hourly[hourOffset + 1]?.time === localNowHourIso
  ) {
    const firstFoldUtcMs = tzResolver.localIsoToUtcDate(localNowHourIso).getTime();
    const secondFoldUtcMs = tzResolver
      .localIsoToUtcDate(localNowHourIso, firstFoldUtcMs)
      .getTime();
    if (nowMs >= secondFoldUtcMs) {
      hourOffset += 1;
    }
  }

  let runningRain = 0;
  let runningSnow = 0;
  let runningGroundSnow = 0;
  const nextHourly: HourlyPoint[] =
    hourOffset === 0 && ageMs < 20 * 60 * 1000
      ? bundle.hourly.map((pt, idx) => (idx === 0 ? { ...pt } : pt))
      : bundle.hourly.slice(hourOffset).map((pt) => {
          const dateYmd = pt.time.slice(0, 10);
          if (pt.airSnowCm !== undefined) {
            runningSnow = Number((runningSnow + pt.airSnowCm).toFixed(2));
            runningGroundSnow = Number(
              (runningGroundSnow + (pt.groundSnowCm ?? 0)).toFixed(2)
            );
            const liqPart = Math.max(0, pt.precipitation - pt.airSnowCm * 0.1);
            if (liqPart > 0) {
              runningRain = Number((runningRain + liqPart).toFixed(2));
            }
          } else if (pt.precipType === "snow") {
            runningSnow = Number((runningSnow + pt.precipitation * 0.85).toFixed(2));
          } else if (pt.precipitation > 0) {
            runningRain = Number((runningRain + pt.precipitation).toFixed(2));
          }
          return {
            ...pt,
            dayLabel: formatRelativeDayLabelTr(dateYmd, localTodayYmd, "weekday"),
            rainAccum: hourOffset > 0 ? runningRain : pt.rainAccum,
            snowAccum: hourOffset > 0 ? runningSnow : pt.snowAccum,
            groundAccumSnowCm:
              hourOffset > 0 && pt.groundAccumSnowCm !== undefined
                ? runningGroundSnow
                : pt.groundAccumSnowCm
          };
        });

  const nextHourlySoundings =
    hourOffset > 0 && bundle.hourlySoundings.length > hourOffset
      ? bundle.hourlySoundings.slice(hourOffset)
      : bundle.hourlySoundings;

  const nextSounding = nextHourlySoundings[0] ?? bundle.sounding;

  // 2. Prune expired 15-minute radar/nowcast slots (allow current 15-min window)
  const floorMin = Math.floor(localNowParts.minute / 15) * 15;
  const localNowQuarterIso = `${localNowIsoMin.slice(0, 14)}${String(floorMin).padStart(2, "0")}`;
  const nextMinutely15 = bundle.minutely15
    ? bundle.minutely15.filter((pt) => pt.time >= localNowQuarterIso)
    : undefined;

  // 3. Advance `daily` array so bygone days are trimmed cleanly
  const filteredDaily = bundle.daily.filter((d) => d.date >= localTodayYmd);
  const baseDaily =
    filteredDaily.length > 0 ? filteredDaily : bundle.daily.slice(-1);
  const nextDaily: DailyPoint[] = baseDaily.map((d) => ({
    ...d,
    dayName: formatRelativeDayLabelTr(d.date, localTodayYmd, "weekday")
  }));

  // 4. Synchronize `current` & `nextHourly[0]` canonically
  const curSolarElev = Number(
    computeSolarElevationDeg(
      bundle.location.lat,
      bundle.location.lon,
      new Date(nowMs)
    ).toFixed(1)
  );
  const curDaylight = solarElevationToDaylight(curSolarElev);

  let nextCurrent: CurrentWeather = { ...bundle.current };
  if ((hourOffset > 0 || ageMs >= 45 * 60 * 1000) && nextHourly.length > 0) {
    const h0 = nextHourly[0] as ExtendedHourlyPoint;
    const h1 = nextHourly[1] ?? h0;
    const interpTemp = Number(
      lerpScalar(h0.temperature, h1.temperature, subHourFrac).toFixed(1)
    );
    const interpApparent = Number(
      lerpScalar(
        h0.apparentTemperature,
        h1.apparentTemperature,
        subHourFrac
      ).toFixed(1)
    );
    const interpDew = Number(
      Math.min(
        interpTemp,
        lerpScalar(h0.dewPoint, h1.dewPoint, subHourFrac)
      ).toFixed(1)
    );
    const interpHumidity = Math.round(
      lerpScalar(h0.humidity, h1.humidity, subHourFrac)
    );
    const interpWetBulb = Number(
      wetBulbStullC(interpTemp, interpHumidity).toFixed(1)
    );
    const interpPressure = Number(
      lerpScalar(h0.pressure, h1.pressure, subHourFrac).toFixed(1)
    );
    const interpWind = Number(
      lerpScalar(h0.windSpeed, h1.windSpeed, subHourFrac).toFixed(1)
    );
    const interpGusts = Number(
      Math.max(
        interpWind,
        lerpScalar(h0.windGusts, h1.windGusts, subHourFrac)
      ).toFixed(1)
    );
    const interpUv = Number(
      lerpScalar(h0.uvIndex, h1.uvIndex, subHourFrac).toFixed(1)
    );

    const isWet = isWetActiveSample(h0.precipitation, h0.airSnowCm);
    const potentialPhase: PrecipPhase =
      h0.potentialPrecipPhase ??
      (h0.precipPhase && h0.precipPhase !== "none"
        ? h0.precipPhase
        : interpWetBulb <= 0.2
          ? "snow"
          : interpWetBulb <= 1.6
            ? "sleet"
            : "rain");
    const canonPhase: PrecipPhase = !isWet
      ? "none"
      : h0.precipPhase && h0.precipPhase !== "none"
        ? h0.precipPhase
        : potentialPhase;
    const canonAirSnow = !isWet ? 0 : (h0.airSnowCm ?? 0);
    const canonGroundSnow = !isWet ? 0 : (h0.groundSnowCm ?? 0);
    const canonRoadSnow = !isWet ? 0 : (h0.roadSnowCm ?? 0);
    const canonType: PrecipType = !isWet
      ? "none"
      : canonPhase === "snow" ||
          (canonPhase === "sleet" &&
            (canonAirSnow >= 0.15 || interpWetBulb <= 0.4))
        ? "snow"
        : "rain";
    const canonLtProb = h0.lightningProbPct ?? 0;
    const canonThundersnow = Boolean(h0.isThundersnow);
    const sky = resolveCanonicalSkyCondition({
      isWet,
      weatherCode: h0.weatherCode,
      precipPhase: canonPhase,
      precipProbability: h0.precipProbability,
      cloudCover: h0.cloudCover,
      wetBulbC: interpWetBulb,
      lightningProbPct: canonLtProb,
      isThundersnow: canonThundersnow,
      fallbackCondition: h0.condition
    });
    const canonStormScore = h0.stormScore ?? bundle.current.stormScore;

    nextCurrent = {
      ...bundle.current,
      time: localNowIsoMin,
      temperature: interpTemp,
      apparentTemperature: interpApparent,
      wetBulbC: interpWetBulb,
      tempBand:
        h0.tempP10 !== undefined && h0.tempP90 !== undefined
          ? {
              p10: h0.tempP10,
              p50: interpTemp,
              p90: h0.tempP90,
              members: bundle.hybrid.ensembleMembers ?? 0
            }
          : bundle.current.tempBand,
      humidity: interpHumidity,
      dewPoint: interpDew,
      pressure: interpPressure,
      windSpeed: interpWind,
      windGusts: interpGusts,
      windDirection: h0.windDirection,
      beaufort: windKmhToBeaufort(interpWind),
      cloudCover: h0.cloudCover,
      visibilityKm: h0.visibilityKm,
      uvIndex: interpUv,
      uvLabel: classifyUvIndex(interpUv),
      precipitation: h0.precipitation,
      precipProbability: h0.precipProbability,
      precipConsensus: h0.precipConsensus,
      precipType: canonType,
      precipPhase: canonPhase,
      potentialPrecipPhase: potentialPhase,
      subHourOffsetFrac: subHourFrac,
      snowLineElevationM: h0.snowLineElevationM ?? null,
      airSnowCmHr: canonAirSnow,
      groundSnowCmHr: canonGroundSnow,
      roadSnowCmHr: canonRoadSnow,
      snowpackDepthCm: h0.snowpackDepthCm ?? 0,
      snowSlr: h0.snowSlr,
      snowQualityTr: h0.snowQualityTr,
      soilTempC: h0.soilTempC,
      roadTempC: h0.roadTempC,
      icingRisk: h0.icingRisk,
      blowingSnowRisk: h0.blowingSnowRisk,
      dekStatus: h0.dekStatus,
      lightningProbPct: canonLtProb,
      lightningFlashesPerMin: h0.lightningFlashesPerMin ?? 0,
      isThundersnow: canonThundersnow,
      weatherCode: sky.weatherCode,
      condition: sky.condition,
      isStorm: h0.isStorm,
      stormScore: canonStormScore,
      isDay: curSolarElev > 0,
      solarElevationDeg: curSolarElev,
      daylight: curDaylight,
      sunrise: nextDaily[0]?.sunrise ?? bundle.current.sunrise,
      sunset: nextDaily[0]?.sunset ?? bundle.current.sunset,
      temp850hPa: h0.temp850hPa
    };
  } else {
    const baseCur = bundle.current;
    const h0 = nextHourly[0] as ExtendedHourlyPoint | undefined;
    const curWetBulb =
      baseCur.wetBulbC ??
      Number(wetBulbStullC(baseCur.temperature, baseCur.humidity).toFixed(1));
    const rawAirSnow = baseCur.airSnowCmHr ?? h0?.airSnowCm ?? 0;
    const isWet = isWetActiveSample(baseCur.precipitation, rawAirSnow);
    const potentialPhase: PrecipPhase =
      baseCur.potentialPrecipPhase ??
      h0?.potentialPrecipPhase ??
      (baseCur.precipPhase && baseCur.precipPhase !== "none"
        ? baseCur.precipPhase
        : curWetBulb <= 0.2
          ? "snow"
          : curWetBulb <= 1.6
            ? "sleet"
            : "rain");
    const canonPhase: PrecipPhase = !isWet
      ? "none"
      : baseCur.precipPhase && baseCur.precipPhase !== "none"
        ? baseCur.precipPhase
        : potentialPhase;
    const canonAirSnow = !isWet ? 0 : rawAirSnow;
    const canonGroundSnow = !isWet
      ? 0
      : (baseCur.groundSnowCmHr ?? h0?.groundSnowCm ?? 0);
    const canonRoadSnow = !isWet
      ? 0
      : (baseCur.roadSnowCmHr ?? h0?.roadSnowCm ?? 0);
    const canonType: PrecipType = !isWet
      ? "none"
      : canonPhase === "snow" ||
          (canonPhase === "sleet" && (canonAirSnow >= 0.15 || curWetBulb <= 0.4))
        ? "snow"
        : "rain";
    const effSolarElev =
      ageMs >= 10 * 60 * 1000 ? curSolarElev : baseCur.solarElevationDeg;
    const effDaylight =
      ageMs >= 10 * 60 * 1000 ? curDaylight : baseCur.daylight;
    const effSubHourFrac =
      ageMs >= 2 * 60 * 1000
        ? subHourFrac
        : (baseCur.subHourOffsetFrac ?? subHourFrac);

    nextCurrent = {
      ...baseCur,
      wetBulbC: curWetBulb,
      precipType: canonType,
      precipPhase: canonPhase,
      potentialPrecipPhase: potentialPhase,
      subHourOffsetFrac: effSubHourFrac,
      airSnowCmHr: canonAirSnow,
      groundSnowCmHr: canonGroundSnow,
      roadSnowCmHr: canonRoadSnow,
      snowpackDepthCm: baseCur.snowpackDepthCm ?? h0?.snowpackDepthCm ?? 0,
      snowLineElevationM:
        baseCur.snowLineElevationM !== undefined
          ? baseCur.snowLineElevationM
          : (h0?.snowLineElevationM ?? null),
      lightningProbPct: baseCur.lightningProbPct ?? h0?.lightningProbPct ?? 0,
      stormScore: baseCur.stormScore ?? h0?.stormScore,
      isDay: ageMs >= 10 * 60 * 1000 ? curSolarElev > 0 : baseCur.isDay,
      solarElevationDeg: effSolarElev,
      daylight: effDaylight
    };
  }

  // Enforce 100% canonical identity between `nextCurrent` and `nextHourly[0]` ("Şimdi" column)
  if (nextHourly.length > 0) {
    const h0 = nextHourly[0] as ExtendedHourlyPoint;
    const syncedH0: ExtendedHourlyPoint = {
      ...h0,
      dayLabel: formatRelativeDayLabelTr(
        h0.time.slice(0, 10),
        localTodayYmd,
        "weekday"
      ),
      temperature: nextCurrent.temperature,
      apparentTemperature: nextCurrent.apparentTemperature,
      wetBulbC: nextCurrent.wetBulbC,
      humidity: nextCurrent.humidity,
      dewPoint: nextCurrent.dewPoint,
      pressure: nextCurrent.pressure,
      windSpeed: nextCurrent.windSpeed,
      windGusts: nextCurrent.windGusts,
      windDirection: nextCurrent.windDirection,
      cloudCover: nextCurrent.cloudCover,
      visibilityKm: nextCurrent.visibilityKm,
      uvIndex: nextCurrent.uvIndex,
      precipitation: nextCurrent.precipitation,
      precipProbability: nextCurrent.precipProbability,
      precipConsensus: nextCurrent.precipConsensus,
      precipType: nextCurrent.precipType,
      precipPhase: nextCurrent.precipPhase ?? "none",
      potentialPrecipPhase: nextCurrent.potentialPrecipPhase,
      subHourOffsetFrac: nextCurrent.subHourOffsetFrac ?? subHourFrac,
      snowLineElevationM: nextCurrent.snowLineElevationM ?? null,
      airSnowCm: nextCurrent.airSnowCmHr ?? 0,
      groundSnowCm: nextCurrent.groundSnowCmHr ?? 0,
      roadSnowCm: nextCurrent.roadSnowCmHr ?? 0,
      snowpackDepthCm: nextCurrent.snowpackDepthCm ?? h0.snowpackDepthCm ?? 0,
      soilTempC: nextCurrent.soilTempC ?? h0.soilTempC,
      roadTempC: nextCurrent.roadTempC ?? h0.roadTempC,
      weatherCode: nextCurrent.weatherCode,
      condition: nextCurrent.condition,
      isStorm: nextCurrent.isStorm,
      stormScore: nextCurrent.stormScore ?? h0.stormScore,
      lightningProbPct: nextCurrent.lightningProbPct ?? 0,
      lightningFlashesPerMin:
        nextCurrent.lightningFlashesPerMin ?? h0.lightningFlashesPerMin,
      isThundersnow: nextCurrent.isThundersnow ?? h0.isThundersnow,
      solarElevationDeg: nextCurrent.solarElevationDeg,
      daylight: nextCurrent.daylight
    };
    nextHourly[0] = syncedH0;
  }

  if (nextDaily.length > 0) {
    const d0 = nextDaily[0];
    nextDaily[0] = {
      ...d0,
      tempMax: Math.max(d0.tempMax, nextCurrent.temperature),
      tempMin: Math.min(d0.tempMin, nextCurrent.temperature),
      lightningProbMaxPct:
        d0.lightningProbMaxPct !== undefined ||
        nextCurrent.lightningProbPct !== undefined
          ? Math.max(d0.lightningProbMaxPct ?? 0, nextCurrent.lightningProbPct ?? 0)
          : undefined
    };
  }

  const resolvedMeta: FreshnessOverrideInput = override ?? {
    status: bundle.freshness?.status ?? "live",
    sourceTier: bundle.freshness?.sourceTier ?? "live",
    cachedAtMs: bundle.freshness?.cachedAtMs ?? effectiveFetchMs,
    staleReason: bundle.freshness?.staleReason,
    degradedStreams: bundle.freshness?.degradedStreams,
    modelsRespondedCount: bundle.freshness?.modelsRespondedCount
  };

  const freshness = buildFreshnessMeta(authenticFetchedAt, nowMs, resolvedMeta);

  const lastDailyYmd = nextDaily[nextDaily.length - 1]?.date ?? localTodayYmd;
  const nextSubseasonal = bundle.subseasonal
    ? {
        ...bundle.subseasonal,
        days: bundle.subseasonal.days.filter((d) => d.date > lastDailyYmd)
      }
    : bundle.subseasonal;

  const nextSnowAndLightning = reanchorSnowAndLightningSummary({
    previous: bundle.snowAndLightning,
    nextCurrent,
    nextHourly,
    nextDaily,
    nextSubseasonal,
    ageMs,
    hourOffset,
    nowMs
  });

  if (nextSnowAndLightning) {
    nextCurrent = {
      ...nextCurrent,
      soilTempC: nextSnowAndLightning.soilTempNowC,
      roadTempC: nextSnowAndLightning.roadTempNowC
    };
    if (nextHourly.length > 0) {
      nextHourly[0] = {
        ...nextHourly[0],
        soilTempC: nextSnowAndLightning.soilTempNowC,
        roadTempC: nextSnowAndLightning.roadTempNowC
      };
    }
  }

  const ageHours = Math.max(0, ageMs / 3600_000);
  const shouldDecayConfidence =
    freshness.status !== "live" ||
    (freshness.degradedStreams?.length ?? 0) > 0 ||
    ageHours >= 0.75;
  const decayedHybridConfidence = shouldDecayConfidence
    ? decayConfidenceForStaleOrDegraded(bundle.hybrid.confidencePct, {
        status: freshness.status,
        ageHours,
        degradedStreamCount: freshness.degradedStreams?.length ?? 0
      })
    : bundle.hybrid.confidencePct;
  const decayedDaily = shouldDecayConfidence
    ? nextDaily.map((d) =>
        d.confidencePct !== undefined
          ? {
              ...d,
              confidencePct: decayConfidenceForStaleOrDegraded(d.confidencePct, {
                status: freshness.status,
                ageHours,
                degradedStreamCount: freshness.degradedStreams?.length ?? 0
              })
            }
          : d
      )
    : nextDaily;
  const nextHybrid = shouldDecayConfidence
    ? {
        ...bundle.hybrid,
        confidencePct: decayedHybridConfidence,
        engineMeta: bundle.hybrid.engineMeta
          ? {
              ...bundle.hybrid.engineMeta,
              accuracyBreakdown: bundle.hybrid.engineMeta.accuracyBreakdown
                ? {
                    ...bundle.hybrid.engineMeta.accuracyBreakdown,
                    totalPct: decayedHybridConfidence
                  }
                : undefined
            }
          : undefined
      }
    : bundle.hybrid;

  return {
    ...bundle,
    fetchedAt: authenticFetchedAt,
    utcOffsetSeconds: localNowParts.offsetSeconds,
    freshness,
    hybrid: nextHybrid,
    current: nextCurrent,
    hourly: nextHourly,
    minutely15: nextMinutely15,
    daily: decayedDaily,
    subseasonal: nextSubseasonal,
    sounding: nextSounding,
    hourlySoundings: nextHourlySoundings,
    snowAndLightning: nextSnowAndLightning,
    nativeConvective:
      hourOffset > 0 && nextHourly[0]
        ? {
            cape: nextHourly[0].cape,
            cin: nextHourly[0].cin,
            liftedIndex: nextHourly[0].liftedIndex,
            freezingLevelM: nextHourly[0].freezingLevelM,
            lightningPotential: nextMinutely15?.[0]?.lightningPotential ?? null
          }
        : bundle.nativeConvective
  };
}

/**
 * Re-anchors an 8-model `MultiModelBundle` to `nowMs` and recomputes 72h / 168h / 360h summaries.
 */
export function reanchorMultiModelBundleToNow(
  models: MultiModelBundle,
  nowMs = Date.now(),
  override?: FreshnessOverrideInput
): MultiModelBundle {
  const authenticFetchedAt = models.freshness?.fetchedAt || models.fetchedAt;
  const parsedFetchMs = Date.parse(authenticFetchedAt);
  const effectiveFetchMs = Number.isFinite(parsedFetchMs) ? parsedFetchMs : nowMs;

  let fallbackOffsetSec =
    typeof models.utcOffsetSeconds === "number" &&
    Number.isFinite(models.utcOffsetSeconds)
      ? models.utcOffsetSeconds
      : 0;

  if (
    models.utcOffsetSeconds === undefined &&
    !models.timezone &&
    models.temp2m.length > 0
  ) {
    const firstAsUtcMs = Date.parse(`${models.temp2m[0].time}:00Z`);
    if (Number.isFinite(firstAsUtcMs)) {
      const estOffsetMs =
        Math.round((firstAsUtcMs - effectiveFetchMs) / (15 * 60 * 1000)) *
        (15 * 60 * 1000);
      fallbackOffsetSec = Math.round(estOffsetMs / 1000);
    }
  }

  const effectiveModelsTz =
    models.timezone === "UTC" && fallbackOffsetSec !== 0
      ? undefined
      : models.timezone;
  const tzResolver = createFastZonedTimeResolver(
    effectiveModelsTz,
    fallbackOffsetSec
  );
  const localNowParts = tzResolver.epochMsToLocalParts(nowMs);
  const localNowHourIso = localNowParts.isoHour;
  const localTodayYmd = localNowParts.ymd;

  const alignSeries = (series: ModelSeriesPoint[]): ModelSeriesPoint[] => {
    if (series.length === 0) return series;
    let idx = series.findIndex((p) => p.time >= localNowHourIso);
    if (idx < 0) idx = Math.max(0, series.length - 1);
    if (
      series[idx]?.time === localNowHourIso &&
      series[idx + 1]?.time === localNowHourIso
    ) {
      const firstFoldMs = tzResolver.localIsoToUtcDate(localNowHourIso).getTime();
      const secondFoldMs = tzResolver
        .localIsoToUtcDate(localNowHourIso, firstFoldMs)
        .getTime();
      if (nowMs >= secondFoldMs) idx += 1;
    }
    return series.slice(idx).map((pt) => {
      const targetYmd = pt.time.slice(0, 10);
      const relLabel = formatRelativeDayLabelTr(
        targetYmd < localTodayYmd ? localTodayYmd : targetYmd,
        localTodayYmd,
        "plusDay"
      );
      return {
        ...pt,
        dayLabel: relLabel
      };
    });
  };

  const temp2m = alignSeries(models.temp2m);
  const temp850 = alignSeries(models.temp850);
  const precip = alignSeries(models.precip);
  const wind10m = alignSeries(models.wind10m);

  const sumSlice = (arr: ModelSeriesPoint[], field: CoreModelKey) =>
    Number(arr.reduce((acc, p) => acc + (p[field] ?? 0), 0).toFixed(1));

  const minSlice = (arr: ModelSeriesPoint[], field: CoreModelKey) => {
    const vals = arr
      .map((p) => p[field])
      .filter(
        (v): v is number => v !== null && v !== undefined && Number.isFinite(v)
      );
    return vals.length > 0 ? Math.min(...vals) : null;
  };

  let maxSpreadTemp2m = 0;
  for (const pt of temp2m) {
    const vals = CORE_MODEL_KEYS.map((k) => pt[k]).filter(
      (v): v is number => v !== null && v !== undefined && Number.isFinite(v)
    );
    if (vals.length >= 2) {
      maxSpreadTemp2m = Math.max(
        maxSpreadTemp2m,
        Number((Math.max(...vals) - Math.min(...vals)).toFixed(1))
      );
    }
  }

  const precip72h = Object.fromEntries(
    CORE_MODEL_KEYS.map((k) => [k, sumSlice(precip.slice(0, 72), k)])
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

  const resolvedMeta: FreshnessOverrideInput = override ?? {
    status: models.freshness?.status ?? "live",
    sourceTier: models.freshness?.sourceTier ?? "live",
    cachedAtMs: models.freshness?.cachedAtMs ?? effectiveFetchMs,
    staleReason: models.freshness?.staleReason,
    degradedStreams: models.freshness?.degradedStreams,
    modelsRespondedCount: models.freshness?.modelsRespondedCount
  };

  return {
    ...models,
    fetchedAt: authenticFetchedAt,
    utcOffsetSeconds:
      models.utcOffsetSeconds !== undefined || models.timezone !== undefined
        ? localNowParts.offsetSeconds
        : models.utcOffsetSeconds,
    freshness: buildFreshnessMeta(authenticFetchedAt, nowMs, resolvedMeta),
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
}

/**
 * Formats an age in seconds or ISO timestamp into crisp Turkish telemetry text.
 */
export function formatFreshnessAgeTr(fetchedAtIso: string, nowMs = Date.now()): string {
  const parsed = Date.parse(fetchedAtIso);
  if (!Number.isFinite(parsed)) return "Az önce";
  const sec = Math.max(0, Math.round((nowMs - parsed) / 1000));
  if (sec < 60) return "Az önce";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} dk önce`;
  const hours = Math.floor(min / 60);
  const remMin = min % 60;
  if (hours < 24) {
    return remMin > 0 ? `${hours} sa ${remMin} dk önce` : `${hours} saat önce`;
  }
  const days = Math.floor(hours / 60 >= 0 ? hours / 24 : 0);
  const remHours = hours % 24;
  return remHours > 0 ? `${days} gün ${remHours} sa önce` : `${days} gün önce`;
}

export function formatClockTr(isoOrUtc: string, timezone?: string): string {
  const ms = Date.parse(isoOrUtc);
  if (!Number.isFinite(ms)) return "--:--";
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      timeZone: timezone || undefined,
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toISOString().slice(11, 16);
  }
}

export function formatSourceTierTr(tier: FreshnessSourceTier): string {
  if (tier === "live") return "Canlı Model Havuzu";
  if (tier === "memory-stale") return "Sunucu Önbelleği";
  if (tier === "disk-stale") return "Sunucu Disk Kasası";
  return "Tarayıcı Kasası";
}

export function describeFreshnessBannerTr(params: {
  freshness: DataFreshnessMeta | null | undefined;
  isOffline: boolean;
  timezone?: string;
  nowMs?: number;
}): {
  headline: string;
  detail: string;
} {
  const nowMs = params.nowMs ?? Date.now();
  const f = params.freshness;
  if (!f) {
    return {
      headline: params.isOffline
        ? "Çevrimdışı bağlantı · Kayıtlı tahmin korunuyor"
        : "Model servisine anlık erişilemiyor · Son tahmin korunuyor",
      detail: "Canlı akış yeniden sağlandığı an otomatik güncellenecek."
    };
  }

  const ageLabel = formatFreshnessAgeTr(f.fetchedAt, nowMs);
  const clockLabel = formatClockTr(f.fetchedAt, params.timezone);
  const tierLabel = formatSourceTierTr(f.sourceTier);

  if (f.status === "degraded") {
    const streamNote =
      f.degradedStreams && f.degradedStreams.length > 0
        ? ` (${f.degradedStreams.join(", ")})`
        : "";
    return {
      headline: `Kısmi model akışı${streamNote} · Kalibreli tahmin korunuyor`,
      detail: `Son tam model çekimi: ${ageLabel} (${clockLabel}) · Tam havuz geldiğinde otomatik güncellenir.`
    };
  }

  return {
    headline: params.isOffline
      ? "İnternet bağlantısı yok · Son doğrulanmış tahmin gösteriliyor"
      : "Modellere anlık erişilemiyor · Son doğrulanmış tahmin gösteriliyor",
    detail: `Son kayıt: ${ageLabel} (${clockLabel} · ${tierLabel}) · Güncel veri geldiği an otomatik yenilenir.`
  };
}
