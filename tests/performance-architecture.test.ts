import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  clearClientForecastSessionForTests,
  flushPendingClientCacheWritesSync,
  readCachedWeatherBundleSync,
  writeCachedWeatherBundle
} from "../lib/client-forecast-cache";
import {
  classifyWindBucketIndex,
  computeAdaptiveDpr,
  computeSkyScrollRig,
  computeVirtualHourWindow,
  stepAndBatchWindParticles,
  WIND_SPEED_BUCKET_COLORS,
  type WindParticleState
} from "../lib/perf-budgets";
import { DEFAULT_LOCATION } from "../lib/weather-client";
import type { WeatherBundle, WindGridBundle } from "../lib/weather-types";

function buildMiniWeatherBundle(): WeatherBundle {
  return {
    location: DEFAULT_LOCATION,
    source: "hybrid-nwp-verified",
    fetchedAt: "2026-11-26T20:00:00.000Z",
    timezone: "Europe/Istanbul",
    utcOffsetSeconds: 10800,
    current: {
      time: "2026-11-26T23:00",
      temperature: 11.4,
      apparentTemperature: 10.6,
      humidity: 72,
      dewPoint: 6.5,
      pressure: 1017,
      pressureDelta3h: 0.2,
      pressureTrend: "sabit",
      pressureTrendDetail: "Sabit barometre",
      windSpeed: 10,
      windGusts: 16,
      windDirection: 45,
      beaufort: { scale: 2, label: "Hafif esinti" },
      cloudCover: 30,
      visibilityKm: 16,
      uvIndex: 0,
      uvLabel: "Düşük",
      precipitation: 0,
      precipProbability: 5,
      precipConsensus: {
        agreeingModels: 0,
        totalModels: 8,
        minMm: 0,
        medianMm: 0,
        maxMm: 0
      },
      precipType: "none",
      weatherCode: 1,
      condition: "Az Bulutlu",
      isDay: false,
      isStorm: false,
      solarElevationDeg: -32,
      daylight: 0,
      sunrise: "2026-11-26T08:02",
      sunset: "2026-11-26T17:41",
      temp850hPa: 4
    },
    airQuality: {
      europeanAqi: 22,
      categoryIndex: 2,
      label: "Makul",
      dominantPollutant: "PM2.5",
      dominantValueText: "8 µg/m³",
      pm25: 8,
      pm10: 15,
      ozone: 38,
      no2: 11,
      so2: 2,
      dust: 3
    },
    hourly: [
      {
        time: "2026-11-26T23:00",
        hourLabel: "23:00",
        dayLabel: "Bugün",
        temperature: 11.4,
        apparentTemperature: 10.6,
        humidity: 72,
        dewPoint: 6.5,
        pressure: 1017,
        windSpeed: 10,
        windGusts: 16,
        windDirection: 45,
        cloudCover: 30,
        visibilityKm: 16,
        uvIndex: 0,
        precipitation: 0,
        precipProbability: 5,
        precipConsensus: {
          agreeingModels: 0,
          totalModels: 8,
          minMm: 0,
          medianMm: 0,
          maxMm: 0
        },
        precipType: "none",
        rainAccum: 0,
        snowAccum: 0,
        weatherCode: 1,
        condition: "Az Bulutlu",
        isStorm: false,
        solarElevationDeg: -32,
        daylight: 0,
        cape: 20,
        cin: -5,
        liftedIndex: 3,
        freezingLevelM: 2200,
        temp850hPa: 4
      }
    ],
    daily: [
      {
        date: "2026-11-26",
        dayName: "Bugün",
        tempMax: 16,
        tempMin: 9,
        weatherCode: 1,
        condition: "Az Bulutlu",
        precipSum: 0,
        precipProbabilityMax: 5,
        windSpeedMax: 16,
        uvIndexMax: 3,
        sunrise: "2026-11-26T08:02",
        sunset: "2026-11-26T17:41"
      }
    ],
    sounding: [],
    hourlySoundings: [],
    nativeConvective: {
      cape: 20,
      cin: -5,
      liftedIndex: 3,
      freezingLevelM: 2200
    },
    hybrid: {
      activeModels: ["ECMWF IFS 9km", "ECMWF AIFS v1"],
      confidencePct: 94,
      tempSpreadC: 0.6,
      pressureSpreadHpa: 0.4,
      currentBreakdown: {
        temperature: {
          ecmwfIfs: 11.4,
          ecmwfAifs: 11.5,
          icon: 11.3,
          ukmo: 11.4,
          gfs: 11.2
        },
        pressure: {
          ecmwfIfs: 1017,
          ecmwfAifs: 1017,
          icon: 1017,
          ukmo: 1017,
          gfs: 1017
        },
        windSpeed: {
          ecmwfIfs: 10,
          ecmwfAifs: 10,
          icon: 10,
          ukmo: 10,
          gfs: 10
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
      attributions: [],
      verification: {
        mode: "live-mgm-mesh",
        matchedHours: 48,
        station: null,
        stations: [],
        rows: [],
        winners: {
          temperature: "ecmwfAifs",
          pressure: "ecmwfIfs",
          wind: "icon",
          precipitation: "ecmwfIfs"
        }
      }
    }
  };
}

describe("Kategori 5 — Performans Mimarisi, Pencereleme, Toplu Çizim ve GPU/CSS Disiplini", () => {
  it("1. computeVirtualHourWindow 168 ve 240 saatlik meteogramda DOM sütun sayısını ~%85 azaltır ve sınırları doğru kenetler", () => {
    // Başlangıç (scrollLeft = 0, ekran = 1020px = 15 sütun, overscan = 6)
    const startWin = computeVirtualHourWindow({
      scrollLeft: 0,
      viewportWidth: 1020,
      totalCount: 168,
      colWidth: 68,
      overscan: 6
    });
    expect(startWin.startIdx).toBe(0);
    expect(startWin.offsetLeftPx).toBe(0);
    expect(startWin.visibleCount).toBeLessThanOrEqual(24);
    expect(startWin.visibleCount).toBeLessThan(168 * 0.2); // >80% DOM node reduction!

    // Orta bölge (scrollLeft = 4080px -> sütun 60..75, overscan = 6 -> 54..81)
    const midWin = computeVirtualHourWindow({
      scrollLeft: 4080,
      viewportWidth: 1020,
      totalCount: 240,
      colWidth: 68,
      overscan: 6
    });
    expect(midWin.startIdx).toBe(54);
    expect(midWin.endIdx).toBe(81);
    expect(midWin.offsetLeftPx).toBe(54 * 68);
    expect(midWin.visibleCount).toBe(28);

    // Son sınır (240. saatin sonu)
    const endWin = computeVirtualHourWindow({
      scrollLeft: 240 * 68,
      viewportWidth: 1020,
      totalCount: 240,
      colWidth: 68,
      overscan: 6
    });
    expect(endWin.endIdx).toBe(239);
    expect(endWin.startIdx).toBeGreaterThanOrEqual(220);
  });

  it("2. stepAndBatchWindParticles 900+ rüzgar parçacığını en fazla 5 hız kovasında toplar (%99.4 daha az ctx.stroke çağrısı)", () => {
    expect(WIND_SPEED_BUCKET_COLORS).toHaveLength(5);
    expect(classifyWindBucketIndex(6)).toBe(0);
    expect(classifyWindBucketIndex(18)).toBe(1);
    expect(classifyWindBucketIndex(30)).toBe(2);
    expect(classifyWindBucketIndex(44)).toBe(3);
    expect(classifyWindBucketIndex(65)).toBe(4);

    // 3x3 hızlanan rüzgar ızgarası (güneybatı hafif -> kuzeydoğu fırtına)
    const grid: WindGridBundle = {
      rows: 3,
      cols: 3,
      south: 39,
      north: 41,
      west: 27,
      east: 31,
      u: [6, 14, 22, 18, 28, 40, 32, 48, 62],
      v: [3, 6, 10, 8, 12, 18, 14, 22, 28],
      speedKmh: [6.7, 15.2, 24.1, 19.7, 30.5, 43.9, 34.9, 52.8, 68.0],
      maxSpeedKmh: 68.0,
      fetchedAt: "2026-11-26T20:00:00.000Z"
    };

    const particles: WindParticleState[] = Array.from({ length: 600 }, (_, i) => ({
      x: ((i * 37) % 760) + 0.5,
      y: ((i * 29) % 520) + 0.5,
      age: i % 40,
      maxAge: 80
    }));

    const buckets = stepAndBatchWindParticles({
      particles,
      grid,
      width: 760,
      height: 520,
      bounds: {
        northLat: 41,
        southLat: 39,
        westLon: 27,
        eastLon: 31
      }
    });

    expect(buckets).toHaveLength(5);
    const totalSegments = buckets.reduce((acc, b) => acc + b.length / 4, 0);
    expect(totalSegments).toBe(600);
    const nonEmptyBuckets = buckets.filter((b) => b.length > 0).length;
    expect(nonEmptyBuckets).toBeGreaterThanOrEqual(3);
    expect(nonEmptyBuckets).toBeLessThanOrEqual(5);
  });

  it("3. computeSkyScrollRig (0-KB GSAP ikamesi) ve computeAdaptiveDpr histerezisi kararlı çalışır", () => {
    const top = computeSkyScrollRig(0, 900, 2700);
    const mid = computeSkyScrollRig(900, 900, 2700);
    const bot = computeSkyScrollRig(5000, 900, 2700); // Clamped at progress = 1

    expect(top.progress).toBe(0);
    expect(top.x).toBeCloseTo(-0.35, 3);
    expect(top.y).toBeCloseTo(0.65, 3);
    expect(top.z).toBeCloseTo(3.1, 3);

    expect(mid.progress).toBeCloseTo(0.5, 3);
    expect(mid.x).toBeCloseTo(0, 3);

    expect(bot.progress).toBe(1);
    expect(bot.x).toBeCloseTo(0.35, 3);
    expect(bot.y).toBeCloseTo(0.29, 3);
    expect(bot.z).toBeCloseTo(3.52, 3);

    // DPR drops to 1.0 under heavy GPU frame time (>22.5ms), holds steady in hysteresis deadband (16ms), recovers when <13.5ms
    expect(
      computeAdaptiveDpr({ avgFrameMs: 28.0, currentDpr: 1.35, devicePixelRatio: 2 })
    ).toBe(1.0);
    expect(
      computeAdaptiveDpr({ avgFrameMs: 16.5, currentDpr: 1.0, devicePixelRatio: 2 })
    ).toBe(1.0);
    expect(
      computeAdaptiveDpr({ avgFrameMs: 11.2, currentDpr: 1.0, devicePixelRatio: 2 })
    ).toBe(1.35);
  });

  it("4. Asenkron kuyruklu writeCachedWeatherBundle anında (0-ms) bellekten okunur ve flush ile kalıcılaşır", () => {
    clearClientForecastSessionForTests();
    const nowMs = Date.parse("2026-11-26T20:02:00.000Z");
    const sample = buildMiniWeatherBundle();

    // Browser runtime mode (`storage === undefined`): schedules idle write without blocking, while `sessionWeatherMap` is immediately populated
    writeCachedWeatherBundle(sample, nowMs);
    const instantHit = readCachedWeatherBundleSync(DEFAULT_LOCATION, nowMs);
    expect(instantHit).not.toBeNull();
    expect(instantHit?.current.temperature).toBe(11.4);

    flushPendingClientCacheWritesSync();
    clearClientForecastSessionForTests();
  });

  it("5. Mimari regresyon kalkanı: 0 GSAP (StormScene), 0 shadowBlur (cumulus-renderer), 0 feTurbulence/mix-blend-overlay ve izole Context", () => {
    const repoRoot = path.resolve(__dirname, "..");

    const stormSceneSrc = fs.readFileSync(
      path.join(repoRoot, "components/StormScene.tsx"),
      "utf-8"
    );
    expect(stormSceneSrc).not.toContain("gsap");
    expect(stormSceneSrc).not.toContain("ScrollTrigger");
    expect(stormSceneSrc).not.toContain("--atmos-lightning");
    expect(stormSceneSrc).toContain("uNoiseTex");

    const cumulusRendererSrc = fs.readFileSync(
      path.join(repoRoot, "lib/cumulus-renderer.ts"),
      "utf-8"
    );
    expect(cumulusRendererSrc).not.toContain("shadowBlur");

    const globalsCssSrc = fs.readFileSync(
      path.join(repoRoot, "app/globals.css"),
      "utf-8"
    );
    expect(globalsCssSrc).not.toContain("feTurbulence");
    expect(globalsCssSrc).not.toContain("mix-blend-overlay");
    expect(globalsCssSrc).toContain("content-visibility: auto");

    const appShellSrc = fs.readFileSync(
      path.join(repoRoot, "components/AppShell.tsx"),
      "utf-8"
    );
    // AppShell uses narrow `useWeatherData` + child `useWeatherScrub` (never monolithic `useWeather`)
    expect(appShellSrc).not.toContain("useWeather()");
    expect(appShellSrc).toContain("useWeatherData");
  });
});
