import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearClientForecastSessionForTests,
  readCachedModelsBundleSync,
  readCachedWeatherBundleSync,
  writeCachedModelsBundle,
  writeCachedWeatherBundle
} from "../lib/client-forecast-cache";
import {
  areLocationsEquivalent,
  describeFreshnessBannerTr,
  formatFreshnessAgeTr,
  reanchorMultiModelBundleToNow,
  reanchorWeatherBundleToNow
} from "../lib/forecast-resilience";
import { CORE_MODEL_KEYS } from "../lib/model-registry";
import {
  evictSnapshotMemoryForTests,
  getModelsSnapshotFromDisk,
  getWeatherSnapshotFromDisk,
  resetSnapshotStoreForTests,
  saveModelsSnapshotToDisk,
  saveWeatherSnapshotToDisk
} from "../lib/snapshot-store";
import { resetStateLedgerForTests } from "../lib/state-ledger";
import {
  DEFAULT_LOCATION,
  PRESET_CITIES,
  type StorageLike
} from "../lib/weather-client";
import type {
  GeoLocation,
  HourlyPoint,
  MultiModelBundle,
  SoundingLevel,
  WeatherBundle
} from "../lib/weather-types";
import {
  expireWeatherRuntimeCachesForTests,
  fetchMultiModelBundle,
  fetchWeatherBundle,
  resetWeatherRuntimeCachesForTests
} from "../lib/weather";

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
    removeItem: (k) => {
      map.delete(k);
    }
  };
}

function buildSyntheticSounding(baseTempC: number): SoundingLevel[] {
  return [
    {
      pressure: 1000,
      altitudeM: 110,
      temperature: baseTempC,
      dewPoint: baseTempC - 4,
      humidity: 72,
      windSpeedKt: 8,
      windDirection: 45
    },
    {
      pressure: 850,
      altitudeM: 1500,
      temperature: baseTempC - 8,
      dewPoint: baseTempC - 11,
      humidity: 68,
      windSpeedKt: 16,
      windDirection: 60
    },
    {
      pressure: 500,
      altitudeM: 5600,
      temperature: baseTempC - 28,
      dewPoint: baseTempC - 35,
      humidity: 45,
      windSpeedKt: 34,
      windDirection: 240
    }
  ];
}

function buildFixtureWeatherBundle(
  loc: GeoLocation = DEFAULT_LOCATION,
  fetchedAtIso = "2026-11-26T19:00:00.000Z"
): WeatherBundle {
  // 2026-11-26T19:00Z == 2026-11-26T22:00 TRT (UTC+3 = 10800s)
  const startLocalMs = Date.parse("2026-11-26T22:00:00Z");
  const hourly: HourlyPoint[] = Array.from({ length: 48 }, (_, i) => {
    const tIso = new Date(startLocalMs + i * 3600_000).toISOString().slice(0, 16);
    const temp = Number((12 + i * 0.25).toFixed(1));
    return {
      time: tIso,
      hourLabel: tIso.slice(11, 16),
      dayLabel: i < 2 ? "Bugün" : i < 26 ? "Yarın" : "Cum",
      temperature: temp,
      tempP10: temp - 1.2,
      tempP90: temp + 1.2,
      apparentTemperature: temp - 0.8,
      wetBulbC: temp - 2.1,
      humidity: 70,
      dewPoint: temp - 4,
      pressure: 1016,
      windSpeed: 12,
      windGusts: 20,
      windDirection: 45,
      cloudCover: 40,
      visibilityKm: 15,
      uvIndex: 0,
      precipitation: i === 4 ? 1.6 : 0,
      precipProbability: i === 4 ? 75 : 10,
      precipConsensus: {
        agreeingModels: i === 4 ? 7 : 0,
        totalModels: 8,
        minMm: 0,
        medianMm: i === 4 ? 1.6 : 0,
        maxMm: i === 4 ? 2.4 : 0
      },
      precipType: i === 4 ? "rain" : "none",
      precipPhase: i === 4 ? "rain" : "none",
      snowLineElevationM: 1850,
      rainAccum: i >= 4 ? 1.6 : 0,
      snowAccum: 0,
      weatherCode: i === 4 ? 61 : 1,
      condition: i === 4 ? "Yağmurlu" : "Az Bulutlu",
      isStorm: false,
      stormScore: 5,
      solarElevationDeg: -15,
      daylight: 0,
      cape: 80,
      cin: -10,
      liftedIndex: 2,
      freezingLevelM: 2100,
      temp850hPa: 4,
      stabilityGrade: "LOCKED"
    };
  });

  const minutely15 = Array.from({ length: 24 }, (_, j) => {
    const mIso = new Date(startLocalMs + j * 900_000).toISOString().slice(0, 16);
    return {
      time: mIso,
      label: mIso.slice(11, 16),
      temperature: 12,
      precipitation: j === 16 ? 0.4 : 0,
      rain: j === 16 ? 0.4 : 0,
      snowfall: 0,
      windGusts: 18,
      cape: 60,
      lightningPotential: 0,
      weatherCode: 1,
      precipPhase: "none" as const
    };
  });

  return {
    location: loc,
    source: "hybrid-nwp-verified",
    fetchedAt: fetchedAtIso,
    timezone: "Europe/Istanbul",
    utcOffsetSeconds: 10800,
    current: {
      time: "2026-11-26T22:00",
      temperature: 12.0,
      apparentTemperature: 11.2,
      wetBulbC: 9.9,
      humidity: 70,
      dewPoint: 8.0,
      pressure: 1016,
      pressureDelta3h: 0.4,
      pressureTrend: "sabit",
      pressureTrendDetail: "Sabit barometre",
      windSpeed: 12,
      windGusts: 20,
      windDirection: 45,
      beaufort: { scale: 3, label: "Hafif rüzgar" },
      cloudCover: 40,
      visibilityKm: 15,
      uvIndex: 0,
      uvLabel: "Düşük",
      precipitation: 0,
      precipProbability: 10,
      precipConsensus: {
        agreeingModels: 0,
        totalModels: 8,
        minMm: 0,
        medianMm: 0,
        maxMm: 0
      },
      precipType: "none",
      precipPhase: "none",
      snowLineElevationM: 1850,
      weatherCode: 1,
      condition: "Az Bulutlu",
      isDay: false,
      isStorm: false,
      stormScore: 5,
      solarElevationDeg: -25,
      daylight: 0,
      sunrise: "08:02",
      sunset: "17:41",
      temp850hPa: 4
    },
    airQuality: {
      europeanAqi: 24,
      categoryIndex: 2,
      label: "Makul",
      dominantPollutant: "PM2.5",
      dominantValueText: "9 µg/m³",
      pm25: 9,
      pm10: 16,
      ozone: 42,
      no2: 14,
      so2: 3,
      dust: 4
    },
    hourly,
    minutely15,
    daily: [
      {
        date: "2026-11-26",
        dayName: "Bugün",
        tempMax: 16,
        tempMin: 9,
        weatherCode: 1,
        condition: "Az Bulutlu",
        precipSum: 0,
        precipProbabilityMax: 10,
        windSpeedMax: 18,
        uvIndexMax: 3,
        sunrise: "08:02",
        sunset: "17:41"
      },
      {
        date: "2026-11-27",
        dayName: "Yarın",
        tempMax: 17,
        tempMin: 10,
        weatherCode: 61,
        condition: "Yağmurlu",
        precipSum: 4.2,
        precipProbabilityMax: 80,
        windSpeedMax: 22,
        uvIndexMax: 3,
        sunrise: "08:03",
        sunset: "17:40"
      },
      {
        date: "2026-11-28",
        dayName: "Cmt",
        tempMax: 15,
        tempMin: 8,
        weatherCode: 2,
        condition: "Parçalı Bulutlu",
        precipSum: 0,
        precipProbabilityMax: 15,
        windSpeedMax: 14,
        uvIndexMax: 3,
        sunrise: "08:04",
        sunset: "17:40"
      }
    ],
    sounding: buildSyntheticSounding(12),
    hourlySoundings: Array.from({ length: 48 }, (_, i) =>
      buildSyntheticSounding(12 + i * 0.25)
    ),
    nativeConvective: {
      cape: 80,
      cin: -10,
      liftedIndex: 2,
      freezingLevelM: 2100,
      lightningPotential: 0
    },
    hybrid: {
      engineVersion: "ATMOS-Core v5.0",
      activeModels: [
        "ECMWF IFS",
        "ECMWF AIFS",
        "DWD ICON",
        "UKMO",
        "Météo-France",
        "NOAA GFS",
        "CMC GEM",
        "JMA"
      ],
      ensembleMembers: 212,
      confidencePct: 94,
      tempSpreadC: 0.9,
      pressureSpreadHpa: 0.6,
      currentBreakdown: {
        temperature: {
          ecmwfIfs: 12.1,
          ecmwfAifs: 11.9,
          icon: 12.0,
          ukmo: 12.2,
          meteofrance: 11.8,
          gfs: 12.4,
          gem: 12.0,
          jma: 11.9
        },
        pressure: {
          ecmwfIfs: 1016,
          ecmwfAifs: 1016,
          icon: 1016,
          ukmo: 1016,
          gfs: 1016
        },
        windSpeed: {
          ecmwfIfs: 12,
          ecmwfAifs: 12,
          icon: 12,
          ukmo: 12,
          gfs: 12
        },
        temp850hPa: {
          ecmwfIfs: 4,
          ecmwfAifs: 4,
          icon: 4,
          ukmo: 4,
          gfs: 4
        },
        precipitation: {
          ecmwfIfs: 0,
          ecmwfAifs: 0,
          icon: 0,
          ukmo: 0,
          gfs: 0
        }
      },
      verification: {
        mode: "live-mgm-mesh",
        station: null,
        matchedHours: 48,
        winners: {
          temperature: "ecmwfAifs",
          pressure: "ecmwfIfs",
          wind: "icon",
          precipitation: "ecmwfAifs"
        },
        rows: []
      },
      attributions: []
    }
  };
}

function buildFixtureModelsBundle(
  lat = DEFAULT_LOCATION.lat,
  lon = DEFAULT_LOCATION.lon,
  fetchedAtIso = "2026-11-26T19:00:00.000Z"
): MultiModelBundle {
  const startLocalMs = Date.parse("2026-11-26T22:00:00Z");
  const makePts = (base: number) =>
    Array.from({ length: 48 }, (_, i) => {
      const tIso = new Date(startLocalMs + i * 3600_000).toISOString().slice(0, 16);
      const val = Number((base + i * 0.2).toFixed(1));
      return {
        time: tIso,
        hourLabel: tIso.slice(11, 16),
        dayLabel: i < 2 ? "Bugün" : i < 26 ? "Yarın" : "+2g",
        ecmwfIfs: val,
        ecmwfAifs: val + 0.2,
        icon: val - 0.1,
        ukmo: val,
        meteofrance: val + 0.1,
        gfs: val + 0.4,
        gem: val,
        jma: val - 0.2
      };
    });

  const zeroRecord = Object.fromEntries(
    CORE_MODEL_KEYS.map((k) => [k, 2.0])
  ) as Record<(typeof CORE_MODEL_KEYS)[number], number>;

  return {
    fetchedAt: fetchedAtIso,
    lat,
    lon,
    utcOffsetSeconds: 10800,
    temp2m: makePts(12),
    temp850: makePts(4),
    precip: makePts(0).map((p, idx) =>
      idx === 1
        ? { ...p, ecmwfIfs: 3.0, ecmwfAifs: 3.0, icon: 3.0, ukmo: 3.0, meteofrance: 3.0, gfs: 3.0, gem: 3.0, jma: 3.0 }
        : { ...p, ecmwfIfs: 0, ecmwfAifs: 0, icon: 0, ukmo: 0, meteofrance: 0, gfs: 0, gem: 0, jma: 0 }
    ),
    wind10m: makePts(10),
    summary: {
      precip72h: zeroRecord,
      precip168h: zeroRecord,
      maxSpreadTemp2m: 0.6,
      min850hPa: zeroRecord
    }
  };
}

function buildMockUpstreamFetch(options: {
  failForecast?: boolean;
  failHybridAndEnsemble?: boolean;
  singleModelTempC?: number;
  hybridModelTempC?: number;
  nowUtcMs: number;
}) {
  const utcOffsetSec = 10800;
  const localStartMs =
    Math.floor((options.nowUtcMs + utcOffsetSec * 1000) / 3600_000) * 3600_000;
  const utcStartMs = Math.floor(options.nowUtcMs / 3600_000) * 3600_000;

  const localTimes = Array.from({ length: 192 }, (_, i) =>
    new Date(localStartMs + i * 3600_000).toISOString().slice(0, 16)
  );
  const utcTimes = Array.from({ length: 240 }, (_, i) =>
    new Date(utcStartMs + (i - 72) * 3600_000).toISOString().slice(0, 16)
  );
  const ensUtcTimes = Array.from({ length: 192 }, (_, i) =>
    new Date(utcStartMs + i * 3600_000).toISOString().slice(0, 16)
  );
  const min15Times = Array.from({ length: 24 }, (_, i) =>
    new Date(localStartMs + i * 900_000).toISOString().slice(0, 16)
  );
  const dailyDates = Array.from({ length: 8 }, (_, d) =>
    new Date(localStartMs + d * 86_400_000).toISOString().slice(0, 10)
  );

  const singleT = options.singleModelTempC ?? 14.0;
  const hybridT = options.hybridModelTempC ?? 14.0;

  return vi.fn(async (input: string | URL | Request) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

    // 1. Multi-model (`models=` query on `/v1/forecast`)
    if (url.includes("api.open-meteo.com/v1/forecast") && url.includes("models=")) {
      if (options.failHybridAndEnsemble || options.failForecast) {
        return new Response("Gateway Timeout", { status: 504 });
      }
      const isGmt = url.includes("timezone=GMT");
      const tArr = isGmt ? utcTimes : localTimes;
      const modelIds = [
        "ecmwf_ifs",
        "ecmwf_aifs025_single",
        "icon_seamless",
        "ukmo_seamless",
        "meteofrance_seamless",
        "gfs_seamless",
        "gem_seamless",
        "jma_seamless",
        "ecmwf_ifs025",
        "icon_global"
      ];
      const hourlyObj: Record<string, unknown> = { time: tArr };
      for (const m of modelIds) {
        hourlyObj[`temperature_2m_${m}`] = tArr.map(() => hybridT);
        hourlyObj[`dew_point_2m_${m}`] = tArr.map(() => hybridT - 4);
        hourlyObj[`precipitation_${m}`] = tArr.map(() => 0);
        hourlyObj[`snowfall_${m}`] = tArr.map(() => 0);
        hourlyObj[`weather_code_${m}`] = tArr.map(() => 1);
        hourlyObj[`wind_speed_10m_${m}`] = tArr.map(() => 11);
        hourlyObj[`wind_gusts_10m_${m}`] = tArr.map(() => 18);
        hourlyObj[`wind_direction_10m_${m}`] = tArr.map(() => 45);
        hourlyObj[`pressure_msl_${m}`] = tArr.map(() => 1017);
        hourlyObj[`cloud_cover_${m}`] = tArr.map(() => 30);
        hourlyObj[`shortwave_radiation_${m}`] = tArr.map(() => 120);
        hourlyObj[`temperature_850hPa_${m}`] = tArr.map(() => 5);
        hourlyObj[`cape_${m}`] = tArr.map(() => 40);
        hourlyObj[`lifted_index_${m}`] = tArr.map(() => 3);
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
      if (options.failForecast) {
        return new Response("Service Unavailable", { status: 503 });
      }
      const hourlyObj: Record<string, unknown> = {
        time: localTimes,
        temperature_2m: localTimes.map(() => singleT),
        apparent_temperature: localTimes.map(() => singleT - 0.6),
        relative_humidity_2m: localTimes.map(() => 66),
        dew_point_2m: localTimes.map(() => singleT - 4),
        pressure_msl: localTimes.map(() => 1017),
        cloud_cover: localTimes.map(() => 30),
        shortwave_radiation: localTimes.map(() => 120),
        visibility: localTimes.map(() => 18000),
        uv_index: localTimes.map(() => 2),
        wind_speed_10m: localTimes.map(() => 11),
        wind_gusts_10m: localTimes.map(() => 18),
        wind_direction_10m: localTimes.map(() => 45),
        precipitation: localTimes.map(() => 0),
        precipitation_probability: localTimes.map(() => 5),
        rain: localTimes.map(() => 0),
        snowfall: localTimes.map(() => 0),
        weather_code: localTimes.map(() => 1),
        cape: localTimes.map(() => 40),
        lifted_index: localTimes.map(() => 3),
        convective_inhibition: localTimes.map(() => -5),
        freezing_level_height: localTimes.map(() => 2300)
      };
      for (const hpa of [1000, 925, 850, 700, 500, 400, 300]) {
        hourlyObj[`temperature_${hpa}hPa`] = localTimes.map(() => singleT - (1000 - hpa) * 0.04);
        hourlyObj[`relative_humidity_${hpa}hPa`] = localTimes.map(() => 60);
        hourlyObj[`wind_speed_${hpa}hPa`] = localTimes.map(() => 20);
        hourlyObj[`wind_direction_${hpa}hPa`] = localTimes.map(() => 50);
        hourlyObj[`geopotential_height_${hpa}hPa`] = localTimes.map(() => (1000 - hpa) * 11 + 110);
      }

      return new Response(
        JSON.stringify({
          elevation: 155,
          timezone: "Europe/Istanbul",
          utc_offset_seconds: utcOffsetSec,
          current: {
            time: localTimes[0],
            temperature_2m: singleT,
            apparent_temperature: singleT - 0.6,
            relative_humidity_2m: 66,
            dew_point_2m: singleT - 4,
            pressure_msl: 1017,
            cloud_cover: 30,
            wind_speed_10m: 11,
            wind_gusts_10m: 18,
            wind_direction_10m: 45,
            precipitation: 0,
            rain: 0,
            snowfall: 0,
            weather_code: 1,
            is_day: 1
          },
          minutely_15: {
            time: min15Times,
            temperature_2m: min15Times.map(() => singleT),
            precipitation: min15Times.map(() => 0),
            rain: min15Times.map(() => 0),
            snowfall: min15Times.map(() => 0),
            weather_code: min15Times.map(() => 1),
            wind_gusts_10m: min15Times.map(() => 16),
            lightning_potential: min15Times.map(() => 0),
            cape: min15Times.map(() => 30)
          },
          hourly: hourlyObj,
          daily: {
            time: dailyDates,
            weather_code: dailyDates.map(() => 1),
            temperature_2m_max: dailyDates.map(() => singleT + 4),
            temperature_2m_min: dailyDates.map(() => singleT - 4),
            precipitation_sum: dailyDates.map(() => 0),
            precipitation_probability_max: dailyDates.map(() => 5),
            wind_speed_10m_max: dailyDates.map(() => 18),
            uv_index_max: dailyDates.map(() => 3),
            sunrise: dailyDates.map((d) => `${d}T08:02`),
            sunset: dailyDates.map((d) => `${d}T17:41`)
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Ensemble API
    if (url.includes("ensemble-api.open-meteo.com")) {
      if (options.failHybridAndEnsemble || options.failForecast) {
        return new Response("Gateway Timeout", { status: 504 });
      }
      const ensHourly: Record<string, unknown> = { time: ensUtcTimes };
      for (let m = 0; m < 8; m++) {
        const suffix = `ecmwf_aifs025_member0${m + 1}`;
        ensHourly[`temperature_2m_${suffix}`] = ensUtcTimes.map(() => hybridT + (m - 4) * 0.2);
        ensHourly[`precipitation_${suffix}`] = ensUtcTimes.map(() => 0);
        ensHourly[`wind_gusts_10m_${suffix}`] = ensUtcTimes.map(() => 18);
        ensHourly[`cape_${suffix}`] = ensUtcTimes.map(() => 40);
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

    // All auxiliary external endpoints gracefully empty in isolated unit test
    return new Response("{}", { status: 404 });
  });
}

describe("Kategori 3 — Kesintisiz Tahmin Şelalesi, Şehir İzolasyonu ve Otomatik Kurtarma", () => {
  const tmpSnapshotPath = path.join(
    os.tmpdir(),
    `atmos-v5-snapshots-test-${process.pid}.json`
  );
  const tmpLedgerPath = path.join(
    os.tmpdir(),
    `atmos-v5-ledger-resilience-${process.pid}.json`
  );

  beforeEach(() => {
    process.env.ATMOS_SNAPSHOT_PATH = tmpSnapshotPath;
    process.env.ATMOS_LEDGER_PATH = tmpLedgerPath;
    resetSnapshotStoreForTests();
    resetStateLedgerForTests();
    resetWeatherRuntimeCachesForTests();
    clearClientForecastSessionForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetSnapshotStoreForTests();
    resetStateLedgerForTests();
    resetWeatherRuntimeCachesForTests();
    clearClientForecastSessionForTests();
    delete process.env.ATMOS_SNAPSHOT_PATH;
    delete process.env.ATMOS_LEDGER_PATH;
  });

  it("reanchorWeatherBundleToNow gece yarısını geçen 3.5 saatlik eski paketi güncel saate ileri sarar ve gerçek fetchedAt damgasını korur", () => {
    const baseBundle = buildFixtureWeatherBundle(
      DEFAULT_LOCATION,
      "2026-11-26T19:00:00.000Z" // 22:00 TRT
    );

    // Read 3 hours 30 minutes later: 2026-11-26T22:30Z == 2026-11-27T01:30 TRT!
    const nowMs = Date.parse("2026-11-26T22:30:00.000Z");
    const reanchored = reanchorWeatherBundleToNow(baseBundle, nowMs, {
      status: "stale",
      sourceTier: "disk-stale",
      staleReason: "Üst model zaman aşımı"
    });

    // 1. Authentic model fetch timestamp is strictly preserved (never faked as `now`)
    expect(reanchored.fetchedAt).toBe("2026-11-26T19:00:00.000Z");
    expect(reanchored.freshness?.status).toBe("stale");
    expect(reanchored.freshness?.sourceTier).toBe("disk-stale");
    expect(reanchored.freshness?.ageSeconds).toBe(3.5 * 3600);

    // 2. Past 3 hours (22:00, 23:00, 00:00) are trimmed; hourly[0] is now 2026-11-27T01:00 ("Bugün")
    expect(reanchored.hourly[0].time).toBe("2026-11-27T01:00");
    expect(reanchored.hourly[0].dayLabel).toBe("Bugün");
    expect(reanchored.hourly).toHaveLength(45);
    expect(reanchored.hourlySoundings).toHaveLength(45);

    // 3. Yesterday (2026-11-26) is trimmed from `daily`; 2026-11-27 becomes "Bugün"
    expect(reanchored.daily[0].date).toBe("2026-11-27");
    expect(reanchored.daily[0].dayName).toBe("Bugün");
    expect(reanchored.daily[1].date).toBe("2026-11-28");
    expect(reanchored.daily[1].dayName).toBe("Yarın");

    // 4. Expired 15-min radar slots (< 01:30) are pruned
    expect(reanchored.minutely15?.[0]?.time).toBe("2026-11-27T01:30");

    // 5. Current temperature smoothly interpolates between 01:00 (12.8°C) and 02:00 (13.0°C) at :30 -> 12.9°C
    expect(reanchored.current.temperature).toBeCloseTo(12.9, 1);
  });

  it("reanchorMultiModelBundleToNow geçmiş saatteki yağışı düşürüp 72s/168s model toplamlarını yeniden hesaplar", () => {
    const models = buildFixtureModelsBundle(
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lon,
      "2026-11-26T19:00:00.000Z" // idx 0 = 22:00, idx 1 = 23:00 (3.0 mm rain), idx 2+ = 0 mm
    );

    // Advance past 23:00 TRT -> 2026-11-27T01:00 TRT (22:00Z)
    const reanchored = reanchorMultiModelBundleToNow(
      models,
      Date.parse("2026-11-26T22:00:00.000Z"),
      { status: "stale", sourceTier: "client-cache" }
    );

    expect(reanchored.temp2m[0].time).toBe("2026-11-27T01:00");
    expect(reanchored.temp2m[0].dayLabel).toBe("Bugün");
    // Elapsed 23:00 rain (3.0 mm) is no longer counted in remaining future accumulation
    expect(reanchored.summary.precip72h.ecmwfIfs).toBe(0);
    expect(reanchored.freshness?.status).toBe("stale");
  });

  it("snapshot-store tam tahmin ve 8-model paketlerini diske atomik yazar ve soğuk süreç yeniden başlatmasında okur", () => {
    const nowMs = Date.parse("2026-11-26T19:05:00.000Z");
    const bursaBundle = buildFixtureWeatherBundle(DEFAULT_LOCATION);
    const bursaModels = buildFixtureModelsBundle();

    saveWeatherSnapshotToDisk(bursaBundle, nowMs, true);
    saveModelsSnapshotToDisk(bursaModels, nowMs, true);

    // Simulate cold Node.js restart (RAM cleared, only `.json` file on disk remains)
    evictSnapshotMemoryForTests();

    const diskWeather = getWeatherSnapshotFromDisk(
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lon,
      nowMs + 1800_000
    );
    expect(diskWeather).not.toBeNull();
    expect(diskWeather?.bundle.location.name).toBe("Bursa");
    expect(diskWeather?.bundle.hourly).toHaveLength(48);

    const diskModels = getModelsSnapshotFromDisk(
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lon,
      nowMs + 1800_000
    );
    expect(diskModels).not.toBeNull();
    expect(diskModels?.models.temp2m).toHaveLength(48);
  });

  it("fetchWeatherBundle tam kesintide L2 Bellek -> L3 Disk şelalesinden eski tahmini döner ve modeller açıldığı an otomatik live olur", async () => {
    const nowUtcMs = Date.now();

    // Step 1: Healthy live upstream run -> populates L2 RAM + L3 Disk
    vi.stubGlobal(
      "fetch",
      buildMockUpstreamFetch({ nowUtcMs, singleModelTempC: 14.2, hybridModelTempC: 14.2 })
    );
    const liveRun = await fetchWeatherBundle(DEFAULT_LOCATION);
    expect(liveRun.freshness?.status).toBe("live");
    expect(liveRun.freshness?.sourceTier).toBe("live");

    // Step 2: Expire 5-min TTL and simulate total upstream 503 outage -> serves L2 Memory Stale
    expireWeatherRuntimeCachesForTests();
    vi.stubGlobal("fetch", buildMockUpstreamFetch({ nowUtcMs, failForecast: true }));

    const memStaleRun = await fetchWeatherBundle(DEFAULT_LOCATION);
    expect(memStaleRun.freshness?.status).toBe("stale");
    expect(memStaleRun.freshness?.sourceTier).toBe("memory-stale");
    expect(memStaleRun.hourly.length).toBeGreaterThan(100);

    // Step 3: Simulate cold server restart during ongoing 503 outage -> serves L3 Disk Snapshot!
    resetWeatherRuntimeCachesForTests();
    evictSnapshotMemoryForTests();

    const diskStaleRun = await fetchWeatherBundle(DEFAULT_LOCATION);
    expect(diskStaleRun.freshness?.status).toBe("stale");
    expect(diskStaleRun.freshness?.sourceTier).toBe("disk-stale");
    expect(diskStaleRun.location.name).toBe("Bursa");

    // Step 4: Upstream recovers -> next call immediately upgrades back to `live`!
    vi.stubGlobal(
      "fetch",
      buildMockUpstreamFetch({ nowUtcMs, singleModelTempC: 15.6, hybridModelTempC: 15.6 })
    );
    const recoveredRun = await fetchWeatherBundle(DEFAULT_LOCATION);
    expect(recoveredRun.freshness?.status).toBe("live");
    expect(recoveredRun.freshness?.sourceTier).toBe("live");

    // Multi-model endpoint follows the exact same L1 -> L2 -> L3 -> L1 lifecycle
    const liveModels = await fetchMultiModelBundle(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
    expect(liveModels.freshness?.status).toBe("live");
    resetWeatherRuntimeCachesForTests();
    evictSnapshotMemoryForTests();
    vi.stubGlobal("fetch", buildMockUpstreamFetch({ nowUtcMs, failForecast: true }));
    const diskModels = await fetchMultiModelBundle(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon);
    expect(diskModels.freshness?.status).toBe("stale");
    expect(diskModels.freshness?.sourceTier).toBe("disk-stale");
  });

  it("Anti-Downgrade Guard: 8-model ve ensemble çöktüğünde kalibrasyonsuz tekil modelin sağlam 8-model önbelleğini ezmesini engeller", async () => {
    const nowUtcMs = Date.now();
    const ankara = PRESET_CITIES.find((c) => c.id === "ankara-tr")!;

    // 1. Healthy 8-model + ensemble run for Ankara at 11.0°C
    vi.stubGlobal(
      "fetch",
      buildMockUpstreamFetch({ nowUtcMs, singleModelTempC: 11.0, hybridModelTempC: 11.0 })
    );
    const calibrated = await fetchWeatherBundle(ankara);
    expect(calibrated.freshness?.status).toBe("live");
    expect(calibrated.hybrid.activeModels.length).toBeGreaterThanOrEqual(8);

    // 2. TTL expires; single-model responds with +6°C uncalibrated drift (17.0°C) while 8-model & ensemble return 504!
    expireWeatherRuntimeCachesForTests();
    vi.stubGlobal(
      "fetch",
      buildMockUpstreamFetch({
        nowUtcMs,
        failHybridAndEnsemble: true,
        singleModelTempC: 17.0
      })
    );

    const protectedRun = await fetchWeatherBundle(ankara);
    expect(protectedRun.freshness?.status).toBe("degraded");
    expect(protectedRun.freshness?.degradedStreams).toContain("8-Model NWP Havuzu");
    expect(protectedRun.freshness?.degradedStreams).toContain("212-Üye Ensemble");
    // Trajectory remains anchored to the calibrated 11.0°C multi-model run instead of jumping +6°C!
    expect(Math.abs(protectedRun.hourly[2].temperature - calibrated.hourly[2].temperature)).toBeLessThan(0.5);
  });

  it("client-forecast-cache şehirler arası veri sızıntısını (Bursa -> Ankara) %100 engeller ve Türkçe tazelik etiketleri üretir", () => {
    const storage = createMemoryStorage();
    const nowMs = Date.parse("2026-11-26T19:25:00.000Z"); // 25 min after 19:00Z fetch
    const bursaBundle = buildFixtureWeatherBundle(
      DEFAULT_LOCATION,
      "2026-11-26T19:00:00.000Z"
    );
    const ankara = PRESET_CITIES.find((c) => c.id === "ankara-tr")!;

    expect(areLocationsEquivalent(DEFAULT_LOCATION, ankara)).toBe(false);

    writeCachedWeatherBundle(bursaBundle, nowMs - 20 * 60 * 1000, storage);
    writeCachedModelsBundle(buildFixtureModelsBundle(), nowMs - 20 * 60 * 1000, storage);

    // Querying Ankara MUST return null — Bursa's forecast never bleeds into Ankara!
    const ankaraRead = readCachedWeatherBundleSync(ankara, nowMs, {
      forceStale: true,
      storage
    });
    expect(ankaraRead).toBeNull();

    const ankaraModelsRead = readCachedModelsBundleSync(ankara.lat, ankara.lon, nowMs, {
      forceStale: true,
      storage
    });
    expect(ankaraModelsRead).toBeNull();

    // Querying Bursa returns Bursa's forecast marked `client-cache` & `stale`
    const bursaRead = readCachedWeatherBundleSync(DEFAULT_LOCATION, nowMs, {
      forceStale: true,
      storage
    });
    expect(bursaRead).not.toBeNull();
    expect(bursaRead?.location.name).toBe("Bursa");
    expect(bursaRead?.freshness?.status).toBe("stale");
    expect(bursaRead?.freshness?.sourceTier).toBe("client-cache");

    expect(formatFreshnessAgeTr("2026-11-26T19:00:00.000Z", nowMs)).toBe("25 dk önce");
    const banner = describeFreshnessBannerTr({
      freshness: bursaRead?.freshness,
      isOffline: true,
      timezone: "Europe/Istanbul",
      nowMs
    });
    expect(banner.headline).toContain("Son doğrulanmış tahmin gösteriliyor");
    expect(banner.detail).toContain("25 dk önce");
    expect(banner.detail).toContain("Tarayıcı Kasası");
  });
});
