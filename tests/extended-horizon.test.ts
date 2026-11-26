import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildCalibratedSubseasonalOutlook,
  calibrateExtendedSynopticHour,
  computeDailyClimatologyNormals,
  fetchRawSubseasonalEnsemble,
  resetSubseasonalCacheForTests,
  summarizeDailyBimodalSplits
} from "../lib/extended-horizon";
import {
  reanchorMultiModelBundleToNow,
  reanchorWeatherBundleToNow
} from "../lib/forecast-resilience";
import { trainKalmanMos } from "../lib/kalman-mos";
import { CORE_MODEL_KEYS, CORE_MODEL_META } from "../lib/model-registry";
import { resetSnapshotStoreForTests } from "../lib/snapshot-store";
import { resetStateLedgerForTests } from "../lib/state-ledger";
import { DEFAULT_LOCATION } from "../lib/weather-client";
import type {
  DailyPoint,
  HybridModelSnapshot,
  MultiModelBundle,
  WeatherBundle
} from "../lib/weather-types";
import {
  fetchMultiModelBundle,
  fetchWeatherBundle,
  resetWeatherRuntimeCachesForTests
} from "../lib/weather";

function makeSnapshot(
  partial: Partial<Record<(typeof CORE_MODEL_KEYS)[number], number | null>>
): HybridModelSnapshot {
  return {
    ecmwfIfs: partial.ecmwfIfs ?? null,
    ecmwfAifs: partial.ecmwfAifs ?? null,
    icon: partial.icon ?? null,
    ukmo: partial.ukmo ?? null,
    gfs: partial.gfs ?? null,
    meteofrance: partial.meteofrance ?? null,
    gem: partial.gem ?? null,
    jma: partial.jma ?? null
  };
}

function createNeutralMos() {
  return trainKalmanMos({
    network: [],
    cityElevationM: 155,
    cityLat: 40.1885,
    cityLon: 29.061,
    envLapseRateCPerM: -0.006,
    modelHourlyUtc: null,
    utcTimeIndex: new Map(),
    nowUtcMs: Date.parse("2026-11-26T09:00:00Z"),
    utcOffsetSeconds: 10800
  });
}

function createExtendedHorizonMockFetch(options: {
  tailShockAfter168hC?: number;
  subseasonalWarmAnomalyC?: number;
}) {
  const baseNowMs = Date.parse("2026-11-26T09:00:00.000Z"); // 12:00 TRT
  const utcOffsetSec = 10800;
  const localStartMs = baseNowMs + utcOffsetSec * 1000;
  const utcStartMs = baseNowMs;

  const localTimes = Array.from({ length: 384 }, (_, i) =>
    new Date(localStartMs + i * 3600_000).toISOString().slice(0, 16)
  );
  // Hybrid GMT query has past_days=3 (72h) + forecast_days=16 (384h) = 456 slots
  const utcTimes = Array.from({ length: 456 }, (_, i) =>
    new Date(utcStartMs + (i - 72) * 3600_000).toISOString().slice(0, 16)
  );
  const ensUtcTimes = Array.from({ length: 384 }, (_, i) =>
    new Date(utcStartMs + i * 3600_000).toISOString().slice(0, 16)
  );
  const min15Times = Array.from({ length: 24 }, (_, i) =>
    new Date(localStartMs + i * 900_000).toISOString().slice(0, 16)
  );
  const dailyDates = Array.from({ length: 16 }, (_, d) =>
    new Date(localStartMs + d * 86_400_000).toISOString().slice(0, 10)
  );
  const subseasonalDates = Array.from({ length: 31 }, (_, d) =>
    new Date(localStartMs + d * 86_400_000).toISOString().slice(0, 10)
  );

  const tailShock = options.tailShockAfter168hC ?? 0;
  const subWarm = options.subseasonalWarmAnomalyC ?? 2.4;

  const modelNativeLimitHours: Record<string, number> = {
    meteofrance_seamless: 114,
    ukmo_seamless: 168,
    icon_seamless: 192,
    icon_global: 180,
    gem_seamless: 252,
    jma_seamless: 270,
    ecmwf_ifs: 360,
    ecmwf_ifs025: 360,
    ecmwf_aifs025_single: 377,
    gfs_seamless: 384
  };

  return vi.fn(async (input: string | URL | Request) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    // 1. Multi-model (`models=` query on `/v1/forecast`)
    if (url.includes("api.open-meteo.com/v1/forecast") && url.includes("models=")) {
      const isGmt = url.includes("timezone=GMT");
      const tArr = isGmt ? utcTimes : localTimes;
      const pastPad = isGmt ? 72 : 0;

      const modelIds = Object.keys(modelNativeLimitHours);
      const hourlyObj: Record<string, unknown> = { time: tArr };
      for (const m of modelIds) {
        const limitH = modelNativeLimitHours[m] ?? 360;
        hourlyObj[`temperature_2m_${m}`] = tArr.map((_, idx) => {
          const lead = idx - pastPad;
          if (lead > limitH) return null;
          const diurnal = 3.5 * Math.sin(((lead - 6) / 24) * 2 * Math.PI);
          const shock = lead >= 180 ? tailShock : 0;
          return Number((13.5 + diurnal + shock).toFixed(2));
        });
        hourlyObj[`dew_point_2m_${m}`] = tArr.map((_, idx) => {
          const lead = idx - pastPad;
          return lead > limitH ? null : 8.5;
        });
        hourlyObj[`precipitation_${m}`] = tArr.map((_, idx) => {
          const lead = idx - pastPad;
          if (lead > limitH) return null;
          return lead >= 200 && lead <= 205 ? 1.4 : 0;
        });
        hourlyObj[`snowfall_${m}`] = tArr.map((_, idx) =>
          idx - pastPad > limitH ? null : 0
        );
        hourlyObj[`weather_code_${m}`] = tArr.map((_, idx) => {
          const lead = idx - pastPad;
          if (lead > limitH) return null;
          return lead >= 200 && lead <= 205 ? 61 : 1;
        });
        hourlyObj[`wind_speed_10m_${m}`] = tArr.map((_, idx) =>
          idx - pastPad > limitH ? null : 12
        );
        hourlyObj[`wind_gusts_10m_${m}`] = tArr.map((_, idx) =>
          idx - pastPad > limitH ? null : 20
        );
        hourlyObj[`wind_direction_10m_${m}`] = tArr.map((_, idx) =>
          idx - pastPad > limitH ? null : 45
        );
        hourlyObj[`pressure_msl_${m}`] = tArr.map((_, idx) =>
          idx - pastPad > limitH ? null : 1016
        );
        hourlyObj[`cloud_cover_${m}`] = tArr.map((_, idx) =>
          idx - pastPad > limitH ? null : 35
        );
        hourlyObj[`shortwave_radiation_${m}`] = tArr.map((_, idx) =>
          idx - pastPad > limitH ? null : 140
        );
        hourlyObj[`temperature_850hPa_${m}`] = tArr.map((_, idx) =>
          idx - pastPad > limitH ? null : 5
        );
        hourlyObj[`cape_${m}`] = tArr.map((_, idx) =>
          idx - pastPad > limitH ? null : 45
        );
        hourlyObj[`lifted_index_${m}`] = tArr.map((_, idx) =>
          idx - pastPad > limitH ? null : 2.5
        );
      }
      return new Response(
        JSON.stringify({
          utc_offset_seconds: isGmt ? 0 : utcOffsetSec,
          hourly: hourlyObj
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Primary single-model forecast (`/v1/forecast` without `models=`)
    if (url.includes("api.open-meteo.com/v1/forecast")) {
      const tempSeries = localTimes.map((_, lead) => {
        const diurnal = 3.5 * Math.sin(((lead - 6) / 24) * 2 * Math.PI);
        const shock = lead >= 180 ? tailShock : 0;
        return Number((13.5 + diurnal + shock).toFixed(2));
      });
      const hourlyObj: Record<string, unknown> = {
        time: localTimes,
        temperature_2m: tempSeries,
        apparent_temperature: tempSeries.map((t) => Number((t - 0.7).toFixed(2))),
        relative_humidity_2m: localTimes.map(() => 65),
        dew_point_2m: localTimes.map(() => 8.5),
        pressure_msl: localTimes.map(() => 1016),
        cloud_cover: localTimes.map(() => 35),
        shortwave_radiation: localTimes.map(() => 140),
        visibility: localTimes.map(() => 18000),
        uv_index: localTimes.map(() => 2),
        wind_speed_10m: localTimes.map(() => 12),
        wind_gusts_10m: localTimes.map(() => 20),
        wind_direction_10m: localTimes.map(() => 45),
        precipitation: localTimes.map((_, lead) =>
          lead >= 200 && lead <= 205 ? 1.4 : 0
        ),
        precipitation_probability: localTimes.map((_, lead) =>
          lead >= 200 && lead <= 205 ? 70 : 10
        ),
        rain: localTimes.map((_, lead) => (lead >= 200 && lead <= 205 ? 1.4 : 0)),
        snowfall: localTimes.map(() => 0),
        weather_code: localTimes.map((_, lead) =>
          lead >= 200 && lead <= 205 ? 61 : 1
        ),
        cape: localTimes.map(() => 45),
        lifted_index: localTimes.map(() => 2.5),
        convective_inhibition: localTimes.map(() => -5),
        freezing_level_height: localTimes.map(() => 2350)
      };
      for (const hpa of [1000, 925, 850, 700, 500, 400, 300]) {
        hourlyObj[`temperature_${hpa}hPa`] = localTimes.map(
          () => 13.5 - (1000 - hpa) * 0.04
        );
        hourlyObj[`relative_humidity_${hpa}hPa`] = localTimes.map(() => 60);
        hourlyObj[`wind_speed_${hpa}hPa`] = localTimes.map(() => 22);
        hourlyObj[`wind_direction_${hpa}hPa`] = localTimes.map(() => 50);
        hourlyObj[`geopotential_height_${hpa}hPa`] = localTimes.map(
          () => (1000 - hpa) * 11 + 110
        );
      }

      return new Response(
        JSON.stringify({
          elevation: 155,
          timezone: "Europe/Istanbul",
          utc_offset_seconds: utcOffsetSec,
          current: {
            time: localTimes[0],
            temperature_2m: tempSeries[0],
            apparent_temperature: tempSeries[0] - 0.7,
            relative_humidity_2m: 65,
            dew_point_2m: 8.5,
            pressure_msl: 1016,
            cloud_cover: 35,
            wind_speed_10m: 12,
            wind_gusts_10m: 20,
            wind_direction_10m: 45,
            precipitation: 0,
            rain: 0,
            snowfall: 0,
            weather_code: 1,
            is_day: 1
          },
          minutely_15: {
            time: min15Times,
            temperature_2m: min15Times.map(() => tempSeries[0]),
            precipitation: min15Times.map(() => 0),
            rain: min15Times.map(() => 0),
            snowfall: min15Times.map(() => 0),
            weather_code: min15Times.map(() => 1),
            wind_gusts_10m: min15Times.map(() => 18),
            lightning_potential: min15Times.map(() => 0),
            cape: min15Times.map(() => 40)
          },
          hourly: hourlyObj,
          daily: {
            time: dailyDates,
            weather_code: dailyDates.map((_, d) => (d === 8 ? 61 : 1)),
            temperature_2m_max: dailyDates.map((_, d) =>
              17.0 + (d >= 8 ? tailShock : 0)
            ),
            temperature_2m_min: dailyDates.map((_, d) =>
              10.0 + (d >= 8 ? tailShock : 0)
            ),
            precipitation_sum: dailyDates.map((_, d) => (d === 8 ? 8.4 : 0)),
            precipitation_probability_max: dailyDates.map((_, d) =>
              d === 8 ? 72 : 10
            ),
            wind_speed_10m_max: dailyDates.map(() => 19),
            uv_index_max: dailyDates.map(() => 3),
            sunrise: dailyDates.map((d) => `${d}T08:02`),
            sunset: dailyDates.map((d) => `${d}T17:41`)
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3a. Subseasonal Daily Ensemble (`daily=` on `ensemble-api.open-meteo.com`)
    if (url.includes("ensemble-api.open-meteo.com") && url.includes("daily=")) {
      const dailyEns: Record<string, unknown> = { time: subseasonalDates };
      for (let m = 0; m < 16; m++) {
        const fam = m < 8 ? `gfs_seamless_member0${m + 1}` : `gem_global_member0${m - 7}`;
        const spreadOffset = (m - 7.5) * 0.35;
        dailyEns[`temperature_2m_max_${fam}`] = subseasonalDates.map((_, d) =>
          Number((15.2 + (d >= 15 ? subWarm : 0) + spreadOffset).toFixed(2))
        );
        dailyEns[`temperature_2m_min_${fam}`] = subseasonalDates.map((_, d) =>
          Number((8.2 + (d >= 15 ? subWarm : 0) + spreadOffset * 0.8).toFixed(2))
        );
        dailyEns[`precipitation_sum_${fam}`] = subseasonalDates.map((_, d) =>
          d % 5 === 2 && m >= 7 ? 3.2 : 0.2
        );
      }
      return new Response(JSON.stringify({ daily: dailyEns }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3b. Hourly Multi-Model Ensemble (`hourly=` on `ensemble-api.open-meteo.com`)
    if (url.includes("ensemble-api.open-meteo.com")) {
      const ensHourly: Record<string, unknown> = { time: ensUtcTimes };
      for (let m = 0; m < 16; m++) {
        const suffix =
          m < 8
            ? `ecmwf_aifs025_member0${m + 1}`
            : `ecmwf_ifs025_member0${m - 7}`;
        const memberSpread = (m - 7.5) * 0.28;
        ensHourly[`temperature_2m_${suffix}`] = ensUtcTimes.map((_, lead) => {
          const diurnal = 3.5 * Math.sin(((lead - 6) / 24) * 2 * Math.PI);
          const shock = lead >= 180 ? tailShock : 0;
          return Number((13.5 + diurnal + shock + memberSpread).toFixed(2));
        });
        ensHourly[`precipitation_${suffix}`] = ensUtcTimes.map((_, lead) =>
          lead >= 200 && lead <= 205 && m >= 5 ? 1.5 : 0
        );
        ensHourly[`wind_gusts_10m_${suffix}`] = ensUtcTimes.map(() => 20);
        ensHourly[`cape_${suffix}`] = ensUtcTimes.map(() => 45);
      }
      return new Response(JSON.stringify({ hourly: ensHourly }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 4. Air quality API
    if (url.includes("air-quality-api.open-meteo.com")) {
      return new Response(
        JSON.stringify({
          current: {
            european_aqi: 22,
            pm2_5: 8,
            pm10: 15,
            ozone: 40,
            nitrogen_dioxide: 10,
            sulphur_dioxide: 2,
            dust: 3
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response("{}", { status: 404 });
  });
}

describe("Kategori 4 — 7 / 15 / 30 Gün Kademeli Tahmin Ufku ve %0 Regresyon Doğrulaması", () => {
  const tmpSnapshotPath = path.join(
    os.tmpdir(),
    `atmos-v5-kat4-snapshots-${process.pid}.json`
  );
  const tmpLedgerPath = path.join(
    os.tmpdir(),
    `atmos-v5-kat4-ledger-${process.pid}.json`
  );

  beforeEach(() => {
    process.env.ATMOS_SNAPSHOT_PATH = tmpSnapshotPath;
    process.env.ATMOS_LEDGER_PATH = tmpLedgerPath;
    resetSnapshotStoreForTests();
    resetStateLedgerForTests();
    resetWeatherRuntimeCachesForTests();
    resetSubseasonalCacheForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    resetSnapshotStoreForTests();
    resetStateLedgerForTests();
    resetWeatherRuntimeCachesForTests();
    resetSubseasonalCacheForTests();
    delete process.env.ATMOS_SNAPSHOT_PATH;
    delete process.env.ATMOS_LEDGER_PATH;
  });

  it("1. Bursa WMO 17116 mevsim normalleri (Ocak vs Temmuz, Uludağ rakım farkı) ve küresel yarımküre fazını doğru hesaplar", () => {
    const bursaJan = computeDailyClimatologyNormals({
      lat: 40.1885,
      lon: 29.061,
      elevationM: 100,
      dateYmd: "2026-01-15"
    });
    const bursaJul = computeDailyClimatologyNormals({
      lat: 40.1885,
      lon: 29.061,
      elevationM: 100,
      dateYmd: "2026-07-15"
    });
    const uludagJan = computeDailyClimatologyNormals({
      lat: 40.107,
      lon: 29.129,
      elevationM: 1877,
      dateYmd: "2026-01-15"
    });

    expect(bursaJan.normalMaxC).toBeCloseTo(9.6, 1);
    expect(bursaJan.normalMinC).toBeCloseTo(1.9, 1);
    expect(bursaJul.normalMaxC).toBeGreaterThan(31.0);
    expect(bursaJul.normalMinC).toBeGreaterThan(18.5);
    // Uludağ (~1877m) should be ~10.6°C colder than Osmangazi (100m) in Tmax
    expect(bursaJan.normalMaxC - uludagJan.normalMaxC).toBeGreaterThan(9.5);
    expect(uludagJan.normalMaxC).toBeLessThan(0);

    // Southern Hemisphere check (Sydney: January is warm summer, July is cool winter)
    const sydneyJan = computeDailyClimatologyNormals({
      lat: -33.8688,
      lon: 151.2093,
      elevationM: 40,
      dateYmd: "2026-01-20"
    });
    const sydneyJul = computeDailyClimatologyNormals({
      lat: -33.8688,
      lon: 151.2093,
      elevationM: 40,
      dateYmd: "2026-07-20"
    });
    expect(sydneyJan.normalMaxC).toBeGreaterThan(sydneyJul.normalMaxC + 8);

    // Model registry horizon contract sanity
    expect(CORE_MODEL_META.meteofrance.maxHorizonHours).toBe(114);
    expect(CORE_MODEL_META.ecmwfAifs.maxHorizonHours).toBeGreaterThanOrEqual(360);
    expect(CORE_MODEL_META.gfs.maxHorizonHours).toBe(384);
  });

  it("2. calibrateExtendedSynopticHour model kopmalarında dinamik normalizasyon, +168s->+360s ensemble ağırlık artışı ve bimodal cephe ayrışmasını yakalar", () => {
    const mos = createNeutralMos();

    // Only ECMWF IFS, AIFS, and GFS remain active at +312h (Day 13); regional/medium models are null
    const snap312 = makeSnapshot({
      ecmwfIfs: 18.0,
      ecmwfAifs: 18.4,
      gfs: 17.6,
      icon: null,
      ukmo: null,
      meteofrance: null,
      gem: null,
      jma: null
    });
    const zeroSnap = makeSnapshot({
      ecmwfIfs: 0,
      ecmwfAifs: 0,
      gfs: 0
    });
    const pressSnap = makeSnapshot({
      ecmwfIfs: 1018,
      ecmwfAifs: 1018,
      gfs: 1017
    });
    const windSnap = makeSnapshot({
      ecmwfIfs: 14,
      ecmwfAifs: 13,
      gfs: 15
    });

    // Ensemble centered lower (12.0°C) vs deterministic (~18.0°C) to verify ensemble weight ramps from +168h -> +360h
    const unimodalEnsValues = Array.from(
      { length: 40 },
      (_, i) => 11.2 + (i / 39) * 1.6
    );
    const unimodalEnsWeights = unimodalEnsValues.map(() => 1.0);

    const out174 = calibrateExtendedSynopticHour({
      leadHour: 174,
      localHour: 14,
      dateYmd: "2026-12-03",
      lat: 40.1885,
      lon: 29.061,
      elevationM: 155,
      tempSnapshot: snap312,
      dewSnapshot: makeSnapshot({ ecmwfIfs: 9, ecmwfAifs: 9, gfs: 9 }),
      pressSnapshot: pressSnap,
      windSnapshot: windSnap,
      precipSnapshot: zeroSnap,
      mos,
      bursaEmosCandidateC: null,
      ensembleTempRow: { values: unimodalEnsValues, weights: unimodalEnsWeights },
      ensemblePrecipValues: Array.from({ length: 40 }, () => 0),
      windowEnsembleWetProbsPct: [5, 5, 10],
      dProgDtTrendC: 0,
      rawFallback: {
        tempC: 18,
        dewC: 9,
        pressHpa: 1018,
        windKmh: 14,
        precipMm: 0,
        popPct: 5
      }
    });

    const out354 = calibrateExtendedSynopticHour({
      leadHour: 354,
      localHour: 14,
      dateYmd: "2026-12-10",
      lat: 40.1885,
      lon: 29.061,
      elevationM: 155,
      tempSnapshot: snap312,
      dewSnapshot: makeSnapshot({ ecmwfIfs: 9, ecmwfAifs: 9, gfs: 9 }),
      pressSnapshot: pressSnap,
      windSnapshot: windSnap,
      precipSnapshot: zeroSnap,
      mos,
      bursaEmosCandidateC: null,
      ensembleTempRow: { values: unimodalEnsValues, weights: unimodalEnsWeights },
      ensemblePrecipValues: Array.from({ length: 40 }, () => 0),
      windowEnsembleWetProbsPct: [5, 5, 10],
      dProgDtTrendC: 0,
      rawFallback: {
        tempC: 18,
        dewC: 9,
        pressHpa: 1018,
        windKmh: 14,
        precipMm: 0,
        popPct: 5
      }
    });

    expect(out174.activeModelCount).toBe(3);
    // At +354h ensemble dominance (78%) + 12% winter climatology pulls temperature closer to ~12°C than at +174h
    expect(out354.temperatureC).toBeLessThan(out174.temperatureC - 1.4);
    expect(out354.confidencePct).toBeLessThan(out174.confidencePct);

    // Bimodal split test: 32 cold Balkan trough members (~4°C) vs 18 warm ridge members (~15°C)
    const bimodalMembers = [
      ...Array.from({ length: 32 }, (_, i) => 3.4 + (i % 5) * 0.3),
      ...Array.from({ length: 18 }, (_, i) => 14.4 + (i % 5) * 0.3)
    ];
    const bimodalWeights = bimodalMembers.map(() => 1.0);
    const bimodalOut = calibrateExtendedSynopticHour({
      leadHour: 240,
      localHour: 15,
      dateYmd: "2026-12-06",
      lat: 40.1885,
      lon: 29.061,
      elevationM: 155,
      tempSnapshot: makeSnapshot({ ecmwfIfs: 8.5, ecmwfAifs: 7.5, gfs: 9.0 }),
      dewSnapshot: makeSnapshot({ ecmwfIfs: 3, ecmwfAifs: 3, gfs: 3 }),
      pressSnapshot: pressSnap,
      windSnapshot: windSnap,
      precipSnapshot: makeSnapshot({ ecmwfIfs: 2.2, ecmwfAifs: 1.8, gfs: 2.5 }),
      mos,
      bursaEmosCandidateC: null,
      ensembleTempRow: { values: bimodalMembers, weights: bimodalWeights },
      ensemblePrecipValues: Array.from({ length: 50 }, (_, i) => (i < 35 ? 2.1 : 0)),
      windowEnsembleWetProbsPct: [65, 70, 72, 68],
      dProgDtTrendC: -1.1,
      rawFallback: {
        tempC: 8.5,
        dewC: 3,
        pressHpa: 1012,
        windKmh: 18,
        precipMm: 2.0,
        popPct: 70
      }
    });

    expect(bimodalOut.bimodal).not.toBeNull();
    expect(bimodalOut.bimodal?.separationC).toBeGreaterThan(8);
    expect(bimodalOut.precipProbabilityPct).toBeGreaterThanOrEqual(60);
    expect(bimodalOut.precipitationMm).toBeGreaterThan(0.5);

    const dailySummary = summarizeDailyBimodalSplits([
      bimodalOut.bimodal,
      bimodalOut.bimodal,
      bimodalOut.bimodal,
      null
    ]);
    expect(dailySummary).not.toBeNull();
    expect(dailySummary?.winningMode).toBe("cold");
    expect(dailySummary?.winningWeightPct).toBeGreaterThanOrEqual(60);
  });

  it("3. buildCalibratedSubseasonalOutlook Gün 1-7 referansına dikişsiz yanlılık kenetlemesi (Seamless Bias Stitching) ve 3./4. Hafta rejim özetleri üretir", () => {
    const startMs = Date.parse("2026-11-26T12:00:00Z");
    const calibratedDaily: DailyPoint[] = Array.from({ length: 15 }, (_, d) => {
      const date = new Date(startMs + d * 86_400_000).toISOString().slice(0, 10);
      return {
        date,
        dayName: d === 0 ? "Bugün" : `Gün ${d + 1}`,
        horizonTier: d < 7 ? "exact" : "synoptic",
        tempMax: 17.5, // +2.5°C warmer than coarse GEFS/GEPS raw median (15.0°C) on Days 0..6
        tempMin: 9.5, // +2.0°C warmer than coarse GEFS/GEPS raw median (7.5°C) on Days 0..6
        weatherCode: 1,
        condition: "Az Bulutlu",
        precipSum: 0,
        precipProbabilityMax: 15,
        windSpeedMax: 16,
        uvIndexMax: 3,
        sunrise: "08:02",
        sunset: "17:41"
      };
    });

    const rawDates = Array.from({ length: 30 }, (_, d) =>
      new Date(startMs + d * 86_400_000).toISOString().slice(0, 10)
    );
    const maxCols = Array.from({ length: 20 }, (_, m) => ({
      weight: m < 10 ? 0.96 : 1.06,
      values: rawDates.map((_, d) =>
        Number((15.0 + (m - 9.5) * 0.25 + (d >= 15 ? 1.5 : 0)).toFixed(2))
      )
    }));
    const minCols = Array.from({ length: 20 }, (_, m) => ({
      weight: m < 10 ? 0.96 : 1.06,
      values: rawDates.map((_, d) =>
        Number((7.5 + (m - 9.5) * 0.2 + (d >= 15 ? 1.2 : 0)).toFixed(2))
      )
    }));
    const precipCols = Array.from({ length: 20 }, (_, m) =>
      rawDates.map((_, d) => (d >= 22 && m >= 8 ? 3.5 : 0.1))
    );

    const sub = buildCalibratedSubseasonalOutlook({
      raw: {
        fetchedAt: "2026-11-26T12:00:00.000Z",
        dates: rawDates,
        maxCols,
        minCols,
        precipCols
      },
      calibratedDaily,
      lat: 40.1885,
      lon: 29.061,
      elevationM: 155
    });

    expect(sub).not.toBeNull();
    expect(sub!.biasShiftMaxC).toBeGreaterThan(2.3);
    expect(sub!.biasShiftMaxC).toBeLessThan(2.6);
    expect(sub!.biasShiftMinC).toBeGreaterThan(1.85);
    expect(sub!.biasShiftMinC).toBeLessThan(2.15);
    expect(sub!.days).toHaveLength(15); // Days 16..30
    expect(sub!.days[0].date > calibratedDaily[14].date).toBe(true);
    expect(sub!.weeks).toHaveLength(2);
    expect(sub!.weeks[0].weekIndex).toBe(3);
    expect(sub!.weeks[1].weekIndex).toBe(4);
    expect(sub!.weeks[0].meanAnomalyC).toBeGreaterThan(1.8);
    expect(sub!.weeks[0].dominantRegimeTr).toContain("Sıcak");
    // Week 4 has wet signal (12/20 = 60% members >= 1mm)
    expect(sub!.weeks[1].meanWetProbPct).toBeGreaterThanOrEqual(55);
  });

  it("4. fetchWeatherBundle 15 günlük daily, 240 saatlik hourly ve Gün 16-30 subseasonal üretir; ilk 7 günde (0-167s) %0.00°C sıfır regresyonu korur", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-26T09:00:00.000Z"));

    // Run A: baseline tail (0°C shock after +168h)
    const mockFetchA = createExtendedHorizonMockFetch({ tailShockAfter168hC: 0 });
    vi.stubGlobal("fetch", mockFetchA);
    const bundleA: WeatherBundle = await fetchWeatherBundle(DEFAULT_LOCATION);

    expect(bundleA.hourly).toHaveLength(240); // 10 days (240h) hourly synoptic coverage
    expect(bundleA.daily).toHaveLength(15); // 15 days calibrated daily coverage
    expect(bundleA.daily.slice(0, 7).every((d) => d.horizonTier === "exact")).toBe(
      true
    );
    expect(bundleA.daily.slice(7).every((d) => d.horizonTier === "synoptic")).toBe(
      true
    );
    expect(bundleA.daily[8].precipSum).toBeGreaterThan(1.0);
    expect(bundleA.daily[8].tempNormalMax).toBeDefined();
    expect(bundleA.daily[8].confidencePct).toBeDefined();

    // Subseasonal Days 16..30
    expect(bundleA.subseasonal).not.toBeNull();
    expect(bundleA.subseasonal?.days.length).toBe(15);
    expect(bundleA.subseasonal?.weeks.length).toBe(2);

    // 8-model comparison bundle extended to 360h (15 days) with native horizon dropout preserved as null
    const modelsBundle: MultiModelBundle = await fetchMultiModelBundle(
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lon
    );
    expect(modelsBundle.temp2m.length).toBe(360);
    expect(modelsBundle.summary.precip360h?.ecmwfAifs).toBeGreaterThan(
      modelsBundle.summary.precip168h.ecmwfAifs
    );
    expect(modelsBundle.temp2m[200].meteofrance).toBeNull(); // AROME naturally stops at +114h (no fake extrapolation!)
    expect(modelsBundle.temp2m[340].ecmwfAifs).not.toBeNull(); // AIFS runs seamlessly through Day 15

    // Run B: inject a massive +9.5°C synthetic shock strictly at lead >= 168h (Days 8..16)
    // Verify 0.00°C ZERO REGRESSION on Current, Hourly[0..167], and Daily[0..6]!
    resetWeatherRuntimeCachesForTests();
    resetSubseasonalCacheForTests();
    resetSnapshotStoreForTests();
    resetStateLedgerForTests();

    const mockFetchB = createExtendedHorizonMockFetch({ tailShockAfter168hC: 9.5 });
    vi.stubGlobal("fetch", mockFetchB);
    const bundleB: WeatherBundle = await fetchWeatherBundle(DEFAULT_LOCATION);

    expect(bundleB.current.temperature).toBe(bundleA.current.temperature);
    for (let h = 0; h < 168; h++) {
      expect(bundleB.hourly[h].temperature).toBe(bundleA.hourly[h].temperature);
      expect(bundleB.hourly[h].precipitation).toBe(bundleA.hourly[h].precipitation);
    }
    for (let d = 0; d < 7; d++) {
      expect(bundleB.daily[d].tempMax).toBe(bundleA.daily[d].tempMax);
      expect(bundleB.daily[d].tempMin).toBe(bundleA.daily[d].tempMin);
    }
    // Meanwhile Days 8..15 legitimately reflect the warmer extended synoptic regime
    expect(bundleB.daily[10].tempMax).toBeGreaterThan(bundleA.daily[10].tempMax + 4);
  });

  it("5. reanchorWeatherBundleToNow ve reanchorMultiModelBundleToNow 15-30 günlük ufuk verilerini zamana göre kaydırır", async () => {
    vi.useFakeTimers();
    const t0 = Date.parse("2026-11-26T09:00:00.000Z");
    vi.setSystemTime(new Date(t0));

    const mockFetch = createExtendedHorizonMockFetch({ tailShockAfter168hC: 0 });
    vi.stubGlobal("fetch", mockFetch);

    const liveBundle = await fetchWeatherBundle(DEFAULT_LOCATION);
    const liveModels = await fetchMultiModelBundle(
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lon
    );

    // Advance clock by +26 hours (crosses into next day)
    const tPlus26h = t0 + 26 * 3600_000;
    const reanchoredWeather = reanchorWeatherBundleToNow(liveBundle, tPlus26h);
    expect(reanchoredWeather.hourly.length).toBe(240 - 26);
    expect(reanchoredWeather.daily.length).toBe(14);
    expect(reanchoredWeather.daily[0].dayName).toBe("Bugün");
    const lastSynopticYmd =
      reanchoredWeather.daily[reanchoredWeather.daily.length - 1].date;
    expect(
      reanchoredWeather.subseasonal?.days.every((d) => d.date > lastSynopticYmd)
    ).toBe(true);

    const reanchoredModels = reanchorMultiModelBundleToNow(liveModels, tPlus26h);
    expect(reanchoredModels.temp2m.length).toBe(360 - 26);
    expect(reanchoredModels.summary.precip360h?.ecmwfAifs).toBeGreaterThanOrEqual(
      reanchoredModels.summary.precip168h.ecmwfAifs
    );

    // Also verify fetchRawSubseasonalEnsemble cache hit within 60-minute TTL
    resetSubseasonalCacheForTests();
    const raw1 = await fetchRawSubseasonalEnsemble({
      lat: DEFAULT_LOCATION.lat,
      lon: DEFAULT_LOCATION.lon,
      elevationM: 155
    });
    const callsAfterFirst = mockFetch.mock.calls.length;
    const raw2 = await fetchRawSubseasonalEnsemble({
      lat: DEFAULT_LOCATION.lat,
      lon: DEFAULT_LOCATION.lon,
      elevationM: 155
    });
    expect(raw1).not.toBeNull();
    expect(raw2?.fetchedAt).toBe(raw1?.fetchedAt);
    expect(mockFetch.mock.calls.length).toBe(callsAfterFirst);
  });
});
