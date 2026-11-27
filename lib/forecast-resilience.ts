/**
 * ATMOS v5.0 — Forecast Resilience, Time-Reanchoring & Freshness Engine
 * File: lib/forecast-resilience.ts
 *
 * Pure shared client/server module (zero `node:*` imports):
 *  1. Canonical coordinate-keying & strict city equivalence checks (prevents cross-city data bleed).
 *  2. `reanchorWeatherBundleToNow`: Advances cached `hourly`, `hourlySoundings`, `minutely15`,
 *     `daily`, and `current` to the exact present wall-clock hour when serving stale fallback data,
 *     while strictly preserving the authentic `fetchedAt` model assimilation timestamp.
 *  3. `reanchorMultiModelBundleToNow`: Advances 8-model series and recomputes `72h`/`168h` summaries.
 *  4. Human-readable Turkish freshness age & telemetry formatters.
 */

import { CORE_MODEL_KEYS } from "./model-registry";
import {
  classifyUvIndex,
  computeSolarElevationDeg,
  solarElevationToDaylight,
  windKmhToBeaufort
} from "./weather-client";
import type {
  CoreModelKey,
  CurrentWeather,
  DailyPoint,
  DataFreshnessMeta,
  FreshnessSourceTier,
  FreshnessStatus,
  GeoLocation,
  HourlyPoint,
  ModelSeriesPoint,
  MultiModelBundle,
  WeatherBundle
} from "./weather-types";

const DAY_NAMES_TR = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"] as const;

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
  a: Pick<GeoLocation, "lat" | "lon"> | null | undefined,
  b: Pick<GeoLocation, "lat" | "lon"> | null | undefined,
  toleranceDeg = 0.05
): boolean {
  if (!a || !b) return false;
  return (
    Math.abs(a.lat - b.lat) <= toleranceDeg &&
    Math.abs(a.lon - b.lon) <= toleranceDeg
  );
}

function computeDayDiffYmd(targetYmd: string, baseYmd: string): number {
  const tMs = Date.parse(`${targetYmd}T12:00:00Z`);
  const bMs = Date.parse(`${baseYmd}T12:00:00Z`);
  if (!Number.isFinite(tMs) || !Number.isFinite(bMs)) return 0;
  return Math.round((tMs - bMs) / 86_400_000);
}

function formatRelativeDayLabelTr(dateYmd: string, todayYmd: string): string {
  const diff = computeDayDiffYmd(dateYmd, todayYmd);
  if (diff === 0) return "Bugün";
  if (diff === 1) return "Yarın";
  const d = new Date(`${dateYmd}T12:00:00Z`);
  return DAY_NAMES_TR[d.getUTCDay()] ?? dateYmd.slice(5);
}

function lerpScalar(a: number, b: number, t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return a + (b - a) * clamped;
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

/**
 * Re-anchors a cached `WeatherBundle` to `nowMs` so past hours/15-min slots/days
 * are never displayed as the present, while strictly preserving `fetchedAt` truth.
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

  const utcOffsetSec = Number.isFinite(bundle.utcOffsetSeconds)
    ? bundle.utcOffsetSeconds
    : 0;
  const localNowDate = new Date(nowMs + utcOffsetSec * 1000);
  const localNowIsoMin = localNowDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
  const localNowHourIso = `${localNowIsoMin.slice(0, 13)}:00`; // "YYYY-MM-DDTHH:00"
  const localTodayYmd = localNowIsoMin.slice(0, 10);
  const subHourFrac = Math.max(0, Math.min(1, localNowDate.getUTCMinutes() / 60));

  // 1. Advance `hourly` & `hourlySoundings` to current local hour
  let hourOffset = bundle.hourly.findIndex((h) => h.time >= localNowHourIso);
  if (hourOffset < 0) {
    hourOffset = Math.max(0, bundle.hourly.length - 1);
  }

  let runningRain = 0;
  let runningSnow = 0;
  let runningGroundSnow = 0;
  const nextHourly: HourlyPoint[] =
    hourOffset === 0 && ageMs < 20 * 60 * 1000
      ? bundle.hourly
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
            dayLabel: formatRelativeDayLabelTr(dateYmd, localTodayYmd),
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
  const floorMin = Math.floor(localNowDate.getUTCMinutes() / 15) * 15;
  const localNowQuarterIso = `${localNowIsoMin.slice(0, 14)}${String(floorMin).padStart(2, "0")}`;
  const nextMinutely15 = bundle.minutely15
    ? bundle.minutely15.filter((pt) => pt.time >= localNowQuarterIso)
    : undefined;

  // 3. Advance `daily` array so bygone days are trimmed cleanly
  const filteredDaily = bundle.daily.filter((d) => d.date >= localTodayYmd);
  const baseDaily =
    filteredDaily.length > 0
      ? filteredDaily
      : bundle.daily.slice(-1);
  const nextDaily: DailyPoint[] = baseDaily.map((d) => ({
    ...d,
    dayName: formatRelativeDayLabelTr(d.date, localTodayYmd)
  }));

  // 4. Synchronize `current` summary when serving an aged bundle (> 45 min or crossed hour boundary)
  const curSolarElev = Number(
    computeSolarElevationDeg(
      bundle.location.lat,
      bundle.location.lon,
      new Date(nowMs)
    ).toFixed(1)
  );
  const curDaylight = solarElevationToDaylight(curSolarElev);

  let nextCurrent: CurrentWeather = bundle.current;
  if ((hourOffset > 0 || ageMs >= 45 * 60 * 1000) && nextHourly.length > 0) {
    const h0 = nextHourly[0];
    const h1 = nextHourly[1] ?? h0;
    const interpTemp = Number(lerpScalar(h0.temperature, h1.temperature, subHourFrac).toFixed(1));
    const interpApparent = Number(
      lerpScalar(h0.apparentTemperature, h1.apparentTemperature, subHourFrac).toFixed(1)
    );
    const interpDew = Number(lerpScalar(h0.dewPoint, h1.dewPoint, subHourFrac).toFixed(1));
    const interpHumidity = Math.round(lerpScalar(h0.humidity, h1.humidity, subHourFrac));
    const interpPressure = Number(lerpScalar(h0.pressure, h1.pressure, subHourFrac).toFixed(1));
    const interpWind = Number(lerpScalar(h0.windSpeed, h1.windSpeed, subHourFrac).toFixed(1));
    const interpGusts = Number(lerpScalar(h0.windGusts, h1.windGusts, subHourFrac).toFixed(1));
    const interpUv = Number(lerpScalar(h0.uvIndex, h1.uvIndex, subHourFrac).toFixed(1));

    nextCurrent = {
      ...bundle.current,
      time: localNowIsoMin,
      temperature: interpTemp,
      apparentTemperature: interpApparent,
      wetBulbC: h0.wetBulbC ?? bundle.current.wetBulbC,
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
      precipType: h0.precipType,
      precipPhase: h0.precipPhase ?? "none",
      snowLineElevationM: h0.snowLineElevationM ?? null,
      airSnowCmHr: h0.airSnowCm,
      groundSnowCmHr: h0.groundSnowCm,
      roadSnowCmHr: h0.roadSnowCm,
      snowpackDepthCm: h0.snowpackDepthCm,
      snowSlr: h0.snowSlr,
      snowQualityTr: h0.snowQualityTr,
      soilTempC: h0.soilTempC,
      roadTempC: h0.roadTempC,
      icingRisk: h0.icingRisk,
      blowingSnowRisk: h0.blowingSnowRisk,
      dekStatus: h0.dekStatus,
      lightningProbPct: h0.lightningProbPct,
      lightningFlashesPerMin: h0.lightningFlashesPerMin,
      isThundersnow: h0.isThundersnow,
      weatherCode: h0.weatherCode,
      condition: h0.condition,
      isStorm: h0.isStorm,
      stormScore: h0.stormScore ?? bundle.current.stormScore,
      isDay: curSolarElev > 0,
      solarElevationDeg: curSolarElev,
      daylight: curDaylight,
      sunrise: nextDaily[0]?.sunrise ?? bundle.current.sunrise,
      sunset: nextDaily[0]?.sunset ?? bundle.current.sunset,
      temp850hPa: h0.temp850hPa
    };
  } else if (ageMs >= 10 * 60 * 1000) {
    nextCurrent = {
      ...bundle.current,
      isDay: curSolarElev > 0,
      solarElevationDeg: curSolarElev,
      daylight: curDaylight
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

  return {
    ...bundle,
    fetchedAt: authenticFetchedAt,
    freshness,
    current: nextCurrent,
    hourly: nextHourly,
    minutely15: nextMinutely15,
    daily: nextDaily,
    subseasonal: nextSubseasonal,
    sounding: nextSounding,
    hourlySoundings: nextHourlySoundings,
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
 * Re-anchors an 8-model `MultiModelBundle` to `nowMs` and recomputes 72h / 168h summaries.
 */
export function reanchorMultiModelBundleToNow(
  models: MultiModelBundle,
  nowMs = Date.now(),
  override?: FreshnessOverrideInput
): MultiModelBundle {
  const authenticFetchedAt = models.freshness?.fetchedAt || models.fetchedAt;
  const parsedFetchMs = Date.parse(authenticFetchedAt);
  const effectiveFetchMs = Number.isFinite(parsedFetchMs) ? parsedFetchMs : nowMs;

  let offsetMs =
    typeof models.utcOffsetSeconds === "number" && Number.isFinite(models.utcOffsetSeconds)
      ? models.utcOffsetSeconds * 1000
      : 0;

  if (models.utcOffsetSeconds === undefined && models.temp2m.length > 0) {
    const firstAsUtcMs = Date.parse(`${models.temp2m[0].time}:00Z`);
    if (Number.isFinite(firstAsUtcMs)) {
      offsetMs =
        Math.round((firstAsUtcMs - effectiveFetchMs) / (15 * 60 * 1000)) *
        (15 * 60 * 1000);
    }
  }

  const localNowDate = new Date(nowMs + offsetMs);
  const localNowHourIso = `${localNowDate.toISOString().slice(0, 13)}:00`;
  const localTodayYmd = localNowHourIso.slice(0, 10);

  const alignSeries = (series: ModelSeriesPoint[]): ModelSeriesPoint[] => {
    if (series.length === 0) return series;
    let idx = series.findIndex((p) => p.time >= localNowHourIso);
    if (idx < 0) idx = Math.max(0, series.length - 1);
    if (idx === 0) return series;
    return series.slice(idx).map((pt) => {
      const diff = computeDayDiffYmd(pt.time.slice(0, 10), localTodayYmd);
      return {
        ...pt,
        dayLabel: diff <= 0 ? "Bugün" : diff === 1 ? "Yarın" : `+${diff}g`
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
      .filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v));
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
  const days = Math.floor(hours / 24);
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
