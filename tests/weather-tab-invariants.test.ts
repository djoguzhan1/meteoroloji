import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ExtendedDailyForecastPanel from "../components/ExtendedDailyForecastPanel";
import HeroSceneView, { localizeMetricProse } from "../components/HeroSceneView";
import HourlyForecastStrip from "../components/HourlyForecastStrip";
import RadarNowcastRibbon from "../components/RadarNowcastRibbon";
import SnowAndLightningObservatory from "../components/SnowAndLightningObservatory";
import { WeatherProvider } from "../context/WeatherContext";
import { buildHourlyDayGroups, detectSynopticEvents } from "../lib/hourly-meteogram";
import {
  diagnoseFallingSnowAtPoint,
  reconcileNowLightningWithRadar,
  simulateCoupledSnowTimeline,
  solveBourgouinSnowLine
} from "../lib/snow-and-lightning-engine";
import {
  buildPhysicalSceneAtmosphere,
  computeTemporalPressureDelta3h,
  extractStormSceneDrive,
  resolveActiveTemporalView
} from "../lib/temporal-view";
import {
  computeSynopticSignals,
  DEFAULT_LOCATION,
  formatDistance,
  formatElevation,
  formatLapseRate,
  formatPrecip,
  formatPressure,
  formatPressureDelta,
  formatSnowDepth,
  formatTempDelta,
  formatTemperature,
  isSnowLinePhysicallyRelevant,
  isWetActiveSample,
  PRECIP_WETNESS_CONTRACT
} from "../lib/weather-client";
import type {
  DailyPoint,
  HourlyPoint,
  LightningProximityRadar,
  Minutely15Point,
  SceneAtmosphereInput,
  SoundingLevel,
  WeatherBundle
} from "../lib/weather-types";

function makeSounding(surfaceTempC: number, capeBoostC = 0): SoundingLevel[] {
  return [
    {
      pressure: 1000,
      altitudeM: 110,
      temperature: surfaceTempC,
      dewPoint: surfaceTempC - 2.5,
      humidity: 82,
      windSpeedKt: 12,
      windDirection: 210
    },
    {
      pressure: 850,
      altitudeM: 1480,
      temperature: surfaceTempC - 7.5,
      dewPoint: surfaceTempC - 9.0,
      humidity: 85,
      windSpeedKt: 24,
      windDirection: 225
    },
    {
      pressure: 700,
      altitudeM: 3040,
      temperature: surfaceTempC - 16.5 - capeBoostC * 0.4,
      dewPoint: surfaceTempC - 19.0,
      humidity: 76,
      windSpeedKt: 34,
      windDirection: 240
    },
    {
      pressure: 500,
      altitudeM: 5620,
      temperature: surfaceTempC - 33.0 - capeBoostC,
      dewPoint: surfaceTempC - 40.0,
      humidity: 52,
      windSpeedKt: 48,
      windDirection: 255
    }
  ];
}

function makeLightningRadar(overrides: Partial<LightningProximityRadar> = {}): LightningProximityRadar {
  return {
    updatedAtIso: "2026-11-26T00:00",
    radarBacked: true,
    metarConfirmedTs: false,
    safetyLevel: "safe",
    safetyTitleTr: "Açık Alan Güvenli (Aktif Deşarj Yok)",
    safetyDetailTr: "0–40 km çevrede aktif yıldırım/şimşek hücresi saptanmadı.",
    nearestCellKm: null,
    nearestBearingTr: null,
    approachingEtaMin: null,
    currentFlashesPerMin: 0,
    currentLpiJkg: 0,
    currentCgFractionPct: 28,
    isThundersnowNow: false,
    rings: [
      {
        ringKm: 15,
        labelTr: "0–15 km · Acil Yakın Çember",
        activeCellCount: 0,
        maxDbz: 0,
        estFlashesPerMin: 0,
        probabilityPct: 8,
        status: "clear"
      },
      {
        ringKm: 40,
        labelTr: "15–40 km · Yaklaşma Çemberi",
        activeCellCount: 0,
        maxDbz: 0,
        estFlashesPerMin: 0,
        probabilityPct: 10,
        status: "clear"
      },
      {
        ringKm: 100,
        labelTr: "40–100 km · Erken Uyarı Ufku",
        activeCellCount: 0,
        maxDbz: 0,
        estFlashesPerMin: 0,
        probabilityPct: 12,
        status: "clear"
      }
    ],
    cells: [],
    ...overrides
  };
}

function makeTestWeatherBundle(): WeatherBundle {
  const startUtcMs = Date.parse("2026-11-26T00:00:00Z");
  const dayNames = ["Bugün", "Yarın", "Cmt", "Paz", "Pzt"];

  const daily: DailyPoint[] = Array.from({ length: 5 }, (_, dIdx) => {
    const date = `2026-11-${String(26 + dIdx).padStart(2, "0")}`;
    // Her takvim gününe birbirinden tamamen ayrık Min / Maks değerleri verelim
    const tempMin = Number((4.0 + dIdx * 2.5).toFixed(1));
    const tempMax = Number((13.0 + dIdx * 3.0).toFixed(1));
    return {
      date,
      dayName: dayNames[dIdx],
      tempMin,
      tempMax,
      weatherCode: dIdx === 0 ? 95 : 1,
      condition: dIdx === 0 ? "Gök Gürültülü Sağanak" : "Az Bulutlu",
      precipSum: dIdx === 0 ? 14.2 : 0,
      precipProbabilityMax: dIdx === 0 ? 90 : 8,
      precipPhase: dIdx === 0 ? "rain" : "none",
      snowProbMaxPct: 0,
      airSnowSumCm: 0,
      groundSnowSumCm: 0,
      roadSnowSumCm: 0,
      maxSnowpackDepthCm: 0,
      minSnowLineM: 2100,
      windSpeedMax: dIdx === 0 ? 68 : 14,
      windGustMax: dIdx === 0 ? 86 : 22,
      stormScoreMax: dIdx === 0 ? 78 : 6,
      lightningProbMaxPct: dIdx === 0 ? 82 : 0,
      uvIndexMax: 3 + dIdx,
      sunrise: `${date}T08:04`,
      sunset: `${date}T17:42`
    };
  });

  const hourly: HourlyPoint[] = Array.from({ length: 96 }, (_, i) => {
    const tIso = new Date(startUtcMs + i * 3600_000).toISOString().slice(0, 16);
    const dIdx = Math.floor(i / 24);
    const hourOfDay = i % 24;
    const dayRec = daily[dIdx];
    const midTemp = Number(((dayRec.tempMin + dayRec.tempMax) * 0.5).toFixed(1));
    const isInitialStormWindow = i <= 6;

    // İlk 4 saatte tam -1.2 hPa/sa doğrusal basınç düşüşü (-3.6 hPa / 3s)
    const pressure =
      i <= 6
        ? Number((1016.0 - i * 1.2).toFixed(1))
        : Number((1020.0 + Math.sin(i / 6) * 1.5).toFixed(1));

    return {
      time: tIso,
      hourLabel: tIso.slice(11, 16),
      dayLabel: dayRec.dayName,
      temperature: i === 0 ? 11.4 : i === 75 ? 16.2 : midTemp,
      tempP10: midTemp - 1.4,
      tempP90: midTemp + 1.5,
      apparentTemperature: i === 0 ? 9.8 : i === 75 ? 15.8 : midTemp - 0.6,
      wetBulbC: i === 0 ? 9.9 : i === 75 ? 11.4 : midTemp - 2.2,
      humidity: isInitialStormWindow ? 88 : 56,
      dewPoint: isInitialStormWindow ? 9.4 : 7.2,
      pressure,
      windSpeed: isInitialStormWindow ? 46 : 10,
      windGusts: isInitialStormWindow ? 78 : 16,
      windDirection: isInitialStormWindow ? 215 : 45,
      cloudCover: isInitialStormWindow ? 96 : 18,
      visibilityKm: isInitialStormWindow ? 6 : 18,
      uvIndex: hourOfDay >= 10 && hourOfDay <= 15 ? dayRec.uvIndexMax : 0,
      precipitation: isInitialStormWindow ? 4.8 : 0,
      precipProbability: isInitialStormWindow ? 90 : 5,
      precipConsensus: {
        agreeingModels: isInitialStormWindow ? 8 : 0,
        totalModels: 8,
        minMm: isInitialStormWindow ? 3.1 : 0,
        medianMm: isInitialStormWindow ? 4.8 : 0,
        maxMm: isInitialStormWindow ? 7.2 : 0
      },
      precipType: isInitialStormWindow ? "rain" : "none",
      precipPhase: isInitialStormWindow ? "rain" : "none",
      snowLineElevationM: 2250,
      rainAccum: Math.min(i + 1, 7) * 4.8,
      snowAccum: 0,
      airSnowCm: 0,
      airSnowProbPct: 0,
      groundSnowCm: 0,
      roadSnowCm: 0,
      snowpackDepthCm: 0,
      roadSnowDepthCm: 0,
      weatherCode: isInitialStormWindow ? 95 : 1,
      condition: isInitialStormWindow ? "Gök Gürültülü Sağanak" : "Az Bulutlu",
      isStorm: isInitialStormWindow,
      stormScore: i === 0 ? 78 : i === 75 ? 4 : isInitialStormWindow ? 72 : 5,
      lightningProbPct: isInitialStormWindow ? 82 : 0,
      lpiJkg: isInitialStormWindow ? 8.4 : 0,
      lightningFlashesPerMin: isInitialStormWindow ? 5.2 : 0,
      cgFractionPct: 28,
      isThundersnow: false,
      solarElevationDeg: hourOfDay >= 8 && hourOfDay <= 17 ? 26 : -18,
      daylight: hourOfDay >= 8 && hourOfDay <= 17 ? 0.8 : 0,
      cape: isInitialStormWindow ? 1450 : 20,
      cin: isInitialStormWindow ? -18 : 0,
      liftedIndex: isInitialStormWindow ? -4.2 : 3.5,
      freezingLevelM: 2500,
      temp850hPa: 7.5,
      elevationSnowBands: [
        {
          id: "coast",
          labelTr: "Mudanya / Kıyı",
          elevationM: 15,
          tempMeanC: 12.1,
          wetBulbMeanC: 10.4,
          precipPhase: isInitialStormWindow ? "rain" : "none",
          snowProbPct: 0,
          airSnowCm: 0,
          groundSnowCm: 0,
          roadSnowCm: 0,
          maxSnowpackCm: 0,
          slr: 0,
          snowQualityTr: "Yok"
        },
        {
          id: "center",
          labelTr: "Bursa Merkez (17116 · Ova)",
          elevationM: 100,
          tempMeanC: 11.4,
          wetBulbMeanC: 9.9,
          precipPhase: isInitialStormWindow ? "rain" : "none",
          snowProbPct: 0,
          airSnowCm: 0,
          groundSnowCm: 0,
          roadSnowCm: 0,
          maxSnowpackCm: 0,
          slr: 0,
          snowQualityTr: "Yok"
        },
        {
          id: "foothill",
          labelTr: "Çekirge – İnkaya Yamaç",
          elevationM: 550,
          tempMeanC: 8.6,
          wetBulbMeanC: 7.3,
          precipPhase: isInitialStormWindow ? "rain" : "none",
          snowProbPct: 0,
          airSnowCm: 0,
          groundSnowCm: 0,
          roadSnowCm: 0,
          maxSnowpackCm: 0,
          slr: 0,
          snowQualityTr: "Yok"
        },
        {
          id: "summit",
          labelTr: "Uludağ Oteller / Zirve",
          elevationM: 1850,
          tempMeanC: 0.4,
          wetBulbMeanC: -0.2,
          precipPhase: isInitialStormWindow ? "snow" : "none",
          snowProbPct: isInitialStormWindow ? 85 : 0,
          airSnowCm: isInitialStormWindow ? 4.2 : 0,
          groundSnowCm: isInitialStormWindow ? 3.6 : 0,
          roadSnowCm: isInitialStormWindow ? 2.8 : 0,
          maxSnowpackCm: isInitialStormWindow ? 12.0 : 8.5,
          slr: isInitialStormWindow ? 12 : 0,
          snowQualityTr: isInitialStormWindow ? "Kuru Kar" : "Yok"
        }
      ],
      stabilityGrade: "LOCKED"
    };
  });

  const t0Sounding = makeSounding(22.0, 9.0);
  // Yalnızca ilk 48 saat için saatlik sondaj dizisi verelim -> frameIndex = 75'te T+0 sondajı sızmamalı!
  const hourlySoundings = Array.from({ length: 48 }, () => t0Sounding);

  const liveRadar = makeLightningRadar({
    updatedAtIso: "2026-11-26T00:00",
    radarBacked: true,
    safetyLevel: "shelter_now",
    nearestCellKm: 6.4,
    nearestBearingTr: "GB",
    currentFlashesPerMin: 5.2,
    currentLpiJkg: 8.4,
    rings: [
      {
        ringKm: 15,
        labelTr: "0–15 km · Acil Yakın Çember",
        activeCellCount: 1,
        maxDbz: 51,
        estFlashesPerMin: 5.2,
        probabilityPct: 82,
        status: "severe"
      },
      {
        ringKm: 40,
        labelTr: "15–40 km · Yaklaşma Çemberi",
        activeCellCount: 1,
        maxDbz: 46,
        estFlashesPerMin: 3.1,
        probabilityPct: 68,
        status: "active"
      },
      {
        ringKm: 100,
        labelTr: "40–100 km · Erken Uyarı Ufku",
        activeCellCount: 0,
        maxDbz: 28,
        estFlashesPerMin: 0,
        probabilityPct: 35,
        status: "watch"
      }
    ],
    cells: [
      {
        id: "live-cell-1",
        bearingDeg: 225,
        compassTr: "GB",
        distanceKm: 6.4,
        peakDbz: 51,
        estFlashesPerMin: 5.2,
        cgFractionPct: 32,
        approaching: true,
        etaMinutes: 0,
        kind: "convective_storm"
      }
    ]
  });

  const minutely15: Minutely15Point[] = Array.from({ length: 12 }, (_, j) => ({
    time: `2026-11-26T0${Math.floor(j / 4)}:${String((j % 4) * 15).padStart(2, "0")}`,
    label: `0${Math.floor(j / 4)}:${String((j % 4) * 15).padStart(2, "0")}`,
    temperature: 11.4,
    precipitation: 1.2,
    rain: 1.2,
    snowfall: 0,
    windGusts: 76,
    cape: 1450,
    lightningPotential: 82,
    weatherCode: 95,
    precipPhase: "rain"
  }));

  return {
    location: DEFAULT_LOCATION,
    source: "hybrid-nwp-verified",
    fetchedAt: "2026-11-26T00:00:00.000Z",
    timezone: "Europe/Istanbul",
    utcOffsetSeconds: 10800,
    current: {
      time: "2026-11-26T00:00",
      temperature: 11.4,
      apparentTemperature: 9.8,
      wetBulbC: 9.9,
      humidity: 88,
      dewPoint: 9.4,
      pressure: 1016.0,
      pressureDelta3h: -3.6,
      pressureTrend: "hızlı düşüyor",
      pressureTrendDetail: "Hızlı düşüş (cephe)",
      windSpeed: 46,
      windGusts: 78,
      windDirection: 215,
      beaufort: { scale: 6, label: "Kuvvetli rüzgar" },
      cloudCover: 96,
      visibilityKm: 6,
      uvIndex: 0,
      uvLabel: "Düşük",
      precipitation: 4.8,
      precipProbability: 90,
      precipConsensus: {
        agreeingModels: 8,
        totalModels: 8,
        minMm: 3.1,
        medianMm: 4.8,
        maxMm: 7.2
      },
      precipType: "rain",
      precipPhase: "rain",
      snowLineElevationM: 2250,
      airSnowCmHr: 0,
      groundSnowCmHr: 0,
      roadSnowCmHr: 0,
      snowpackDepthCm: 0,
      lightningProbPct: 82,
      lightningFlashesPerMin: 5.2,
      isThundersnow: false,
      weatherCode: 95,
      condition: "Gök Gürültülü Sağanak",
      isStorm: true,
      stormScore: 78,
      isDay: false,
      solarElevationDeg: -18,
      daylight: 0,
      sunrise: "2026-11-26T08:04",
      sunset: "2026-11-26T17:42",
      temp850hPa: 7.5
    },
    airQuality: {
      europeanAqi: 88,
      categoryIndex: 5,
      label: "Çok Kötü",
      dominantPollutant: "PM2.5",
      dominantValueText: "64 µg/m³",
      pm25: 64,
      pm10: 92,
      ozone: 38,
      no2: 31,
      so2: 8,
      dust: 22
    },
    hourly,
    minutely15,
    daily,
    sounding: t0Sounding,
    hourlySoundings,
    nativeConvective: {
      cape: 1450,
      cin: -18,
      liftedIndex: -4.2,
      freezingLevelM: 2500,
      lightningPotential: 82
    },
    storm: {
      score: 78,
      level: "severe",
      label: "Şiddetli Fırtına",
      color: "#ef4444",
      lightningProbPct: 82,
      hailRisk: "Orta",
      flashFloodRisk: "Yüksek",
      expectedPeakGustP50: 78,
      expectedPeakGustP90: 92,
      components: {
        convective: 84,
        wind: 76,
        rainfall: 72,
        synoptic: 68
      },
      nextWindow: null,
      drivers: ["Kuvvetli cephe önü konveksiyon"]
    },
    snowAndLightning: {
      referenceElevationM: 100,
      soilTempNowC: 10.2,
      roadTempNowC: 10.8,
      hasAnySnow15d: false,
      hasAnySnow30d: false,
      nextSnowHourIso: null,
      nextSnowDateYmd: null,
      total15dAirSnowCm: 0,
      total15dGroundSnowCm: 0,
      total15dRoadSnowCm: 0,
      peak15dSnowpackCm: 0,
      lowest15dSnowLineM: 2100,
      dekStatus15d: "none",
      dekDeltaTSst850C: 4.5,
      maxIcingRisk48h: "none",
      maxBlowingSnow48h: "none",
      lightningRadar: liveRadar,
      peak48hLightningProbPct: 82,
      peak168hLightningProbPct: 82,
      peak168hFlashesPerMin: 5.2,
      hasThundersnow168h: false,
      nextLightningHourIso: "2026-11-26T00:00"
    },
    hybrid: {
      engineVersion: "5.0",
      activeModels: ["ecmwfIfs", "ecmwfAifs", "icon", "ukmo", "gfs", "meteofrance", "gem", "jma"],
      ensembleMembers: 212,
      confidencePct: 92,
      tempSpreadC: 0.9,
      pressureSpreadHpa: 0.7,
      currentBreakdown: {
        temperature: { ecmwfIfs: 11.4, ecmwfAifs: 11.5, icon: 11.3, ukmo: 11.4, gfs: 11.2 },
        pressure: { ecmwfIfs: 1016, ecmwfAifs: 1016, icon: 1016, ukmo: 1016, gfs: 1016 },
        windSpeed: { ecmwfIfs: 46, ecmwfAifs: 45, icon: 47, ukmo: 46, gfs: 45 },
        temp850hPa: { ecmwfIfs: 7.5, ecmwfAifs: 7.5, icon: 7.4, ukmo: 7.6, gfs: 7.5 },
        precipitation: { ecmwfIfs: 4.8, ecmwfAifs: 4.6, icon: 5.0, ukmo: 4.7, gfs: 4.9 }
      },
      verification: {
        mode: "live-mgm-mesh",
        station: null,
        matchedHours: 24,
        winners: {
          temperature: "ecmwfIfs",
          pressure: "ecmwfIfs",
          wind: "icon",
          precipitation: "ecmwfIfs"
        },
        rows: []
      },
      attributions: []
    }
  };
}

describe("ATMOS v5.0 — Hava Sekmesi 10/10 Değişmezlik & Hibrit Ekran Kalkanı Testleri", () => {
  describe("I-1: frameIndex = 0..N Tekil Gerçeklik & Hibrit Ekran Kalkanı", () => {
    it("resolveActiveTemporalView(bundle, 0) vs (bundle, 75): T+0 verilerini +75. saate sızdırmaz ve 3s basınç türevi i=1,2 sınırında süreklidir", () => {
      const bundle = makeTestWeatherBundle();

      const view0 = resolveActiveTemporalView(bundle, 0);
      const view75 = resolveActiveTemporalView(bundle, 75);

      // 1) frameIndex = 0 -> LIVE_NOW kanonik tekil gerçeklik
      expect(view0.mode).toBe("LIVE_NOW");
      expect(view0.frameIndex).toBe(0);
      expect(view0.cockpitTitleTr).toBe("Anlık Gözlem Telemetrisi");
      expect(view0.telemetry.temperature).toBe(bundle.current.temperature);
      expect(view0.telemetry.temperature).toBe(bundle.hourly[0].temperature);
      expect(view0.dayContext.date).toBe("2026-11-26");
      expect(view0.dayContext.dayName).toBe("Bugün");
      expect(view0.dayContext.tempMin).toBe(bundle.daily[0].tempMin);
      expect(view0.dayContext.tempMax).toBe(bundle.daily[0].tempMax);
      expect(view0.airQualityContext.availableForHour).toBe(true);
      expect(view0.soundingSummary).not.toBeNull();
      expect(view0.lightningRadar.sourceMode).toBe("LIVE_DOPPLER_METAR");
      expect(view0.stormChip.score).toBe(78);
      expect(view0.stormChip.level).toBe("severe");

      // 2) frameIndex = 75 -> FORECAST_LOCKED (2026-11-29, +3. gün = daily[3])
      expect(view75.mode).toBe("FORECAST_LOCKED");
      expect(view75.frameIndex).toBe(75);
      expect(view75.cockpitTitleTr).toBe("Seçili Saat Telemetrisi (+75s)");
      expect(view75.dayContext.date).toBe(bundle.daily[3].date);
      expect(view75.dayContext.tempMin).toBe(bundle.daily[3].tempMin);
      expect(view75.dayContext.tempMax).toBe(bundle.daily[3].tempMax);
      expect(view75.dayContext.tempMin).not.toBe(bundle.daily[0].tempMin);
      expect(view75.dayContext.tempMax).not.toBe(bundle.daily[0].tempMax);

      // Fırtına çipi skoru 4/100 iken Sakin Atmosfer olur; bundle.storm zirvesinden "Şiddetli Fırtına" / kırmızı sızdırmaz!
      expect(view75.stormChip.score).toBe(4);
      expect(view75.stormChip.level).toBe("calm");
      expect(view75.stormChip.label).toBe("Sakin Atmosfer");
      expect(view75.stormChip.color).toBe("#10b981");
      expect(view75.stormChip.label).not.toContain("Şiddetli Fırtına");

      // EAQI ve T+0 sondajı +75. saate sızmaz; şimşek radarı NWP advektif projeksiyona geçer
      expect(view75.airQualityContext.availableForHour).toBe(false);
      expect(view75.atmosphere.airQualityIndex).toBe(1);
      expect(view75.soundingSummary).toBeNull();
      expect(view75.lightningRadar.sourceMode).toBe("NWP_ADVECTIVE_PROJECTION");
      expect(view75.lightningRadar.leadHours).toBe(75);

      // 3) 3 saatlik basınç türevi (dP/3s) i = 0, 1, 2, 3 geçiş sınırında süreklidir (yapay sıçrama yapmaz)
      const dp0 = computeTemporalPressureDelta3h(bundle, 0);
      const dp1 = computeTemporalPressureDelta3h(bundle, 1);
      const dp2 = computeTemporalPressureDelta3h(bundle, 2);
      const dp3 = computeTemporalPressureDelta3h(bundle, 3);
      expect(dp0).toBeCloseTo(-3.6, 5);
      expect(dp1).toBeCloseTo(-3.6, 5);
      expect(dp2).toBeCloseTo(-3.6, 5);
      expect(dp3).toBeCloseTo(-3.6, 5);
    });

    it("isWetActiveSample, isSnowLinePhysicallyRelevant ve diagnoseFallingSnowAtPoint: sıcak/kuru günde kar sınırını gizler, 0.00 mm yağışta hayalet karı engeller", () => {
      expect(PRECIP_WETNESS_CONTRACT.WET_ACTIVE_MIN_MM).toBe(0.05);
      expect(isWetActiveSample(0, 0.4)).toBe(false);
      expect(isWetActiveSample(0.04, 0)).toBe(false);
      expect(isWetActiveSample(0.05, 0)).toBe(true);
      expect(isWetActiveSample(0.02, 0.08)).toBe(true);

      // +28°C güneşli/kuru yaz gününde snowLineElevationM = 3950 iken fiziksel olarak alakasızdır (false)
      expect(
        isSnowLinePhysicallyRelevant({
          snowLineElevationM: 3950,
          baseElevationM: 100,
          temperatureC: 28,
          temp850hPa: 16.5,
          precipMmHr: 0,
          precipProbabilityPct: 5,
          airSnowProbPct: 0,
          snowpackDepthCm: 0
        })
      ).toBe(false);

      // Aktif kış cephesinde kar sınırı fiziksel olarak anlamlıdır (true)
      expect(
        isSnowLinePhysicallyRelevant({
          snowLineElevationM: 420,
          baseElevationM: 100,
          temperatureC: 3.2,
          temp850hPa: -3.4,
          precipMmHr: 2.4,
          precipProbabilityPct: 88,
          airSnowProbPct: 64,
          snowpackDepthCm: 0
        })
      ).toBe(true);

      // 0.00 mm yağışta ham model rawModelSnowfallCm = 0.2 cm verse bile hayalet kar üretilmez!
      const coldBourgouin = solveBourgouinSnowLine({
        elevationM: 150,
        surfaceTempC: -2.0,
        surfaceRhPct: 86,
        precipMmHr: 0.0,
        freezingLevelM: 0,
        temp850hPa: -8.5
      });

      const drySnowDiag = diagnoseFallingSnowAtPoint({
        tempC: -2.0,
        rhPct: 86,
        wetBulbC: -2.5,
        precipMmHr: 0.0,
        precipProbPct: 55,
        rawModelSnowfallCm: 0.2,
        bourgouin: coldBourgouin,
        basePhase: "snow",
        slr: 14
      });

      expect(drySnowDiag.refinedPhase).toBe("none");
      expect(drySnowDiag.airSnowCm).toBe(0);
      expect(drySnowDiag.airSnowSweMm).toBe(0);
    });

    it("reconcileNowLightningWithRadar: 0-15 km radar açık ve yaklaşan hücre yokken model %48 verse bile tavanı <= %14'e indirir; aktif hücrede %76'ya taşır", () => {
      const clearRadar = makeLightningRadar({
        radarBacked: true,
        metarConfirmedTs: false,
        approachingEtaMin: null,
        cells: [],
        rings: [
          {
            ringKm: 15,
            labelTr: "0–15 km · Acil Yakın Çember",
            activeCellCount: 0,
            maxDbz: 0,
            estFlashesPerMin: 0,
            probabilityPct: 10,
            status: "clear"
          },
          {
            ringKm: 40,
            labelTr: "15–40 km · Yaklaşma Çemberi",
            activeCellCount: 0,
            maxDbz: 0,
            estFlashesPerMin: 0,
            probabilityPct: 12,
            status: "clear"
          },
          {
            ringKm: 100,
            labelTr: "40–100 km · Erken Uyarı Ufku",
            activeCellCount: 0,
            maxDbz: 0,
            estFlashesPerMin: 0,
            probabilityPct: 15,
            status: "clear"
          }
        ]
      });

      const suppressed = reconcileNowLightningWithRadar({
        modelHour0ProbPct: 48,
        modelHour0FlashesPerMin: 1.8,
        lightningRadar: clearRadar,
        radarAvailable: true,
        currentRadarDbz: 0
      });

      expect(suppressed.regime).toBe("clear_radar_suppressed");
      expect(suppressed.nowProbPct).toBeLessThanOrEqual(14);
      expect(suppressed.nowProbPct).toBe(10);
      expect(suppressed.nowFlashesPerMin).toBe(0);

      const activeInnerRadar = makeLightningRadar({
        radarBacked: true,
        rings: [
          {
            ringKm: 15,
            labelTr: "0–15 km · Acil Yakın Çember",
            activeCellCount: 2,
            maxDbz: 49,
            estFlashesPerMin: 4.6,
            probabilityPct: 76,
            status: "severe"
          },
          clearRadar.rings[1],
          clearRadar.rings[2]
        ]
      });

      const elevated = reconcileNowLightningWithRadar({
        modelHour0ProbPct: 22,
        modelHour0FlashesPerMin: 0.4,
        lightningRadar: activeInnerRadar,
        radarAvailable: true,
        currentRadarDbz: 49
      });

      expect(elevated.regime).toBe("active_inner");
      expect(elevated.nowProbPct).toBe(76);
      expect(elevated.hour0ProbPct).toBe(76);
      expect(elevated.nowFlashesPerMin).toBe(4.6);
    });

    it("buildHourlyDayGroups: sabah yağmurlu (daily[0].precipSum = 8.4 mm, weatherCode = 63) kalan saatleri 0.0 mm olan günde 8.4 mm toplamı korur", () => {
      const bundle = makeTestWeatherBundle();
      // Öğleden sonra 14:00..23:00 saatleri tamamen kuru (0.0 mm, weatherCode = 1)
      const afternoonDryHours: HourlyPoint[] = Array.from({ length: 10 }, (_, idx) => ({
        ...bundle.hourly[24],
        time: `2026-11-26T${String(14 + idx).padStart(2, "0")}:00`,
        hourLabel: `${String(14 + idx).padStart(2, "0")}:00`,
        dayLabel: "Bugün",
        precipitation: 0.0,
        precipProbability: 10,
        precipType: "none",
        precipPhase: "none",
        weatherCode: 1,
        condition: "Az Bulutlu",
        isStorm: false,
        stormScore: 4,
        lightningProbPct: 0
      }));

      const morningWetDaily: DailyPoint[] = [
        {
          ...bundle.daily[0],
          date: "2026-11-26",
          dayName: "Bugün",
          precipSum: 8.4,
          precipProbabilityMax: 86,
          weatherCode: 63,
          condition: "Yağmurlu",
          precipPhase: "rain"
        }
      ];

      const dayGroups = buildHourlyDayGroups(afternoonDryHours, morningWetDaily);
      expect(dayGroups).toHaveLength(1);
      expect(dayGroups[0].precipSumMm).toBe(8.4);
      expect(dayGroups[0].dominantCode).toBe(63);
      expect(dayGroups[0].maxPopPct).toBe(86);
    });
  });

  describe("I-2: UnitSystem Mutlak T vs ΔT = 1.8x ve SSR Sızıntı Taraması", () => {
    it("mutlak sıcaklık (1.8*T + 32) ile sıcaklık farkını (1.8*ΔT, +32 yok!) ve tüm birim biçimlendiricileri sızıntısız hesaplar", () => {
      // Mutlak T
      expect(formatTemperature(0, "imperial")).toBe("32°F");
      expect(formatTemperature(20, "metric")).toBe("20°");
      expect(formatTemperature(-40, "imperial")).toBe("-40°F");

      // Sıcaklık farkı ΔT = 1.8x (ASLA +32 eklenmez!)
      expect(
        formatTempDelta(1.5, "imperial", { decimals: 1, signed: true, showUnit: true })
      ).toBe("+2.7°F");
      expect(
        formatTempDelta(1.5, "imperial", { decimals: 1, signed: true, showUnit: true })
      ).not.toBe("34.7°F");
      expect(formatTempDelta(0, "imperial", { decimals: 1, showUnit: true })).toBe("0.0°F");
      expect(
        formatTempDelta(-2.5, "imperial", { decimals: 1, signed: true, showUnit: true })
      ).toBe("-4.5°F");

      // Yağış, kar derinliği, rakım, mesafe, basınç, basınç değişimi ve lapse rate
      expect(formatPrecip(25.4, "imperial")).toBe("1.00 in");
      expect(formatPrecip(25.4, "imperial", { per: "hour" })).toBe("1.00 in/sa");
      expect(formatPrecip(0, "imperial")).toBe("0.00 in");
      expect(formatPrecip(5.2, "metric")).toBe("5.2 mm");

      expect(formatSnowDepth(2.54, "imperial")).toBe("1.0 in");
      expect(formatSnowDepth(25.4, "imperial")).toBe("10 in");
      expect(formatSnowDepth(4.5, "metric")).toBe("4.5 cm");

      expect(formatElevation(1000, "imperial")).toBe("3281 ft");
      expect(formatElevation(1000, "metric")).toBe("1000 m");

      expect(formatDistance(10, "imperial")).toBe("6.2 mi");
      expect(formatDistance(100, "imperial")).toBe("62 mi");
      expect(formatDistance(15, "metric")).toBe("15 km");

      expect(formatPressure(1013.25, "imperial")).toBe("29.92 inHg");
      expect(formatPressure(1013.25, "metric")).toBe("1013 hPa");

      expect(formatPressureDelta(-3.4, "imperial", true)).toBe("-0.10 inHg/3s");
      expect(formatPressureDelta(2.5, "metric", true)).toBe("+2.5 hPa/3s");

      expect(formatLapseRate(6.5, "imperial")).toBe("3.6°F/kft");
      expect(formatLapseRate(6.5, "metric")).toBe("6.5°C/km");

      // computeSynopticSignals (Imperial)
      const signalsImp = computeSynopticSignals({
        pressureDelta3h: -4.2,
        temp850hPa: -5.0,
        windGustsKmh: 64,
        cape: 150,
        isStorm: false,
        europeanAqi: 22,
        uvIndex: 2,
        freezingLevelM: 1000,
        temperatureC: 1.0,
        unit: "imperial"
      });
      const serializedSignals = JSON.stringify(signalsImp);
      expect(serializedSignals).toContain("inHg/3s");
      expect(serializedSignals).toContain("mph");
      expect(serializedSignals).toContain("23.0°F");
      expect(serializedSignals).toContain("32°F: 3281 ft");
      expect(serializedSignals).not.toContain("°C");
      expect(serializedSignals).not.toContain("km/s");

      // detectSynopticEvents (Imperial -> "32°F Don" ve 1.8x cephe farkı)
      const baseBundle = makeTestWeatherBundle();
      const freezeHours: HourlyPoint[] = Array.from({ length: 12 }, (_, idx) => ({
        ...baseBundle.hourly[30 + idx],
        precipitation: 0,
        precipType: "none",
        precipPhase: "none",
        windGusts: 18,
        windDirection: 30,
        lightningProbPct: 0,
        icingRisk: "none",
        temperature: idx < 5 ? 2.4 - idx * 0.4 : -0.4 - (idx - 5) * 0.3
      }));
      const eventsImp = detectSynopticEvents(freezeHours, "imperial");
      const freezeEv = eventsImp.find((e) => e.kind === "freeze_cross");
      expect(freezeEv).toBeDefined();
      expect(freezeEv?.labelTr).toBe("32°F Don");
    });

    it("SSR Sızıntı Taraması: Hava sekmesi bileşenleri unit='imperial' modunda render edildiğinde sıfır metrik birim (°C, km/s, mm, cm) sızdırır", () => {
      const bundle = makeTestWeatherBundle();
      const view0 = resolveActiveTemporalView(bundle, 0);

      const htmlChunks = [
        renderToStaticMarkup(
          React.createElement(RadarNowcastRibbon, {
            minutely15: bundle.minutely15,
            engineMeta: bundle.hybrid.engineMeta,
            frameIndex: 0,
            unit: "imperial"
          })
        ),
        renderToStaticMarkup(
          React.createElement(HourlyForecastStrip, {
            hourly: bundle.hourly.slice(0, 48),
            daily: bundle.daily,
            minutely15: bundle.minutely15,
            unit: "imperial",
            selectedIndex: 0,
            baseElevationM: 100
          })
        ),
        renderToStaticMarkup(
          React.createElement(ExtendedDailyForecastPanel, {
            daily: bundle.daily,
            hourly: bundle.hourly.slice(0, 48),
            unit: "imperial",
            selectedHourIndex: 0,
            baseElevationM: 100
          })
        ),
        renderToStaticMarkup(
          React.createElement(SnowAndLightningObservatory, {
            cityName: "Bursa",
            daily: bundle.daily,
            hourly: bundle.hourly.slice(0, 48),
            summary: bundle.snowAndLightning,
            storm: bundle.storm,
            temporalLightningRadar: view0.lightningRadar,
            selectedHourIndex: 0,
            unit: "imperial",
            defaultExpanded: true
          })
        )
      ];

      const fullImperialHtml = htmlChunks.join("\n");
      expect(fullImperialHtml).toContain("°F");
      expect(fullImperialHtml).toContain("mph");
      expect(fullImperialHtml).toContain("in");
      expect(fullImperialHtml).toContain("9mi");

      // Metrik sıcaklık, hız, yağış, kar ve halka mesafesi sızıntısı olmamalı!
      expect(fullImperialHtml).not.toContain("°C");
      expect(fullImperialHtml).not.toContain("km/s");
      expect(fullImperialHtml).not.toMatch(/\d+(?:\.\d+)?\s*mm\b/);
      expect(fullImperialHtml).not.toMatch(/\d+(?:\.\d+)?\s*cm\b/);
      expect(fullImperialHtml).not.toMatch(/\b(?:15|40|100)km\b/);
    });
  });

  describe("I-5: StormScene & extractStormSceneDrive Fizik Kalkanı", () => {
    it("0.0 mm yağışta (weatherCode = 61, precipProbability = 55) sıfır yağış yoğunluğu ve 0 parçacık üretir", () => {
      const bundle = makeTestWeatherBundle();
      bundle.hourly[12] = {
        ...bundle.hourly[12],
        precipitation: 0.0,
        precipProbability: 55,
        precipType: "rain",
        precipPhase: "rain",
        airSnowCm: 0,
        weatherCode: 61,
        condition: "Yağmurlu"
      };

      const atmo = buildPhysicalSceneAtmosphere(bundle, 12);
      expect(atmo.precipType).toBe("none");
      expect(atmo.precipIntensity).toBe(0);
      expect(atmo.precipitationMmHr).toBe(0);

      const drive = extractStormSceneDrive(atmo);
      expect(drive.isWet).toBe(false);
      expect(drive.effectivePrecipType).toBe("none");
      expect(drive.effectivePrecipIntensity).toBe(0);
      expect(drive.precipParticleCount).toBe(0);
    });

    it("%0 şimşekte kuru 60 km/s Lodos veya bastırılmış yüksek CAPE (1800 J/kg) asla şimşek çaktırmaz", () => {
      const dryLodosAtmo: SceneAtmosphereInput = {
        windSpeed: 60,
        windDirection: 215,
        cloudCover: 72,
        visibilityKm: 14,
        airQualityIndex: 1,
        isStorm: true,
        precipType: "none",
        precipIntensity: 0,
        rainAccum: 0,
        snowAccum: 0,
        solarElevationDeg: 18,
        daylight: 0.65,
        cape: 120,
        lightningFlashRatePerMin: 0,
        lightningProbPct: 0,
        precipitationMmHr: 0,
        solarArcProgress: 0.5
      };

      const lodosDrive = extractStormSceneDrive(dryLodosAtmo);
      expect(lodosDrive.canFlashLightning).toBe(false);
      expect(lodosDrive.flashFrequencyHz).toBe(0);
      expect(lodosDrive.hasGaleWindStreaks).toBe(true);
      expect(lodosDrive.windStreakCount).toBeGreaterThan(0);

      const cappedCapeDrive = extractStormSceneDrive({
        ...dryLodosAtmo,
        windSpeed: 16,
        isStorm: false,
        cape: 1800,
        lightningProbPct: 0,
        lightningFlashRatePerMin: 0
      });
      expect(cappedCapeDrive.canFlashLightning).toBe(false);
      expect(cappedCapeDrive.flashFrequencyHz).toBe(0);
    });

    it("doğu rüzgarında (90°) batıya negatif akış (-1) ve güneş için doğudan batıya (-0.38 -> 0 -> +0.38) yay üretir", () => {
      const baseAtmo: SceneAtmosphereInput = {
        windSpeed: 24,
        windDirection: 90,
        cloudCover: 15,
        visibilityKm: 20,
        airQualityIndex: 1,
        isStorm: false,
        precipType: "none",
        precipIntensity: 0,
        rainAccum: 0,
        snowAccum: 0,
        solarElevationDeg: 25,
        daylight: 0.85,
        cape: 0,
        lightningProbPct: 0,
        precipitationMmHr: 0,
        solarArcProgress: 0
      };

      const dawnDrive = extractStormSceneDrive({ ...baseAtmo, solarArcProgress: 0 });
      const noonDrive = extractStormSceneDrive({ ...baseAtmo, solarArcProgress: 0.5 });
      const duskDrive = extractStormSceneDrive({ ...baseAtmo, solarArcProgress: 1 });

      // 90° doğu rüzgarı -> batıya (-X) akış
      expect(dawnDrive.windFlowX).toBeCloseTo(-1, 6);
      expect(dawnDrive.windFlowY).toBeCloseTo(0, 6);

      // Doğudan (-0.38) öğleye (0) ve batıya (+0.38) güneş azimut yayı
      expect(dawnDrive.sunNormX).toBeCloseTo(-0.38, 4);
      expect(noonDrive.sunNormX).toBeCloseTo(0, 4);
      expect(duskDrive.sunNormX).toBeCloseTo(0.38, 4);
    });
  });

  describe("I-6: Red-Team Son Pürüz Kalkanı (10/10 Kusursuzluk Doğrulaması)", () => {
    it("localizeMetricProse & HourlyForecastStrip: imperial modda model çözünürlüğü, metodoloji metni ve 2m etiketini tam yerelleştirir", () => {
      expect(localizeMetricProse("ECMWF IFS 9km", "imperial")).toBe("ECMWF IFS 5.6 mi");
      expect(localizeMetricProse("9 km HRES", "imperial")).toBe("5.6 mi HRES");
      expect(localizeMetricProse("1.3–10 km", "imperial")).toBe("0.8–6.2 mi");
      expect(localizeMetricProse("2m Sıcaklık & İlçe Mikrokliması", "imperial")).toBe(
        "6.5 ft Sıcaklık & İlçe Mikrokliması"
      );
      expect(
        localizeMetricProse(
          "Ova tabanı (0–550m), orta yamaç (550–1300m) ve Uludağ zirve (1300–2000m)",
          "imperial"
        )
      ).toBe(
        "Ova tabanı (0–1804 ft), orta yamaç (1804–4265 ft) ve Uludağ zirve (4265–6562 ft)"
      );
      expect(localizeMetricProse("Γ_ova 6.5°C/km · SST 14°C", "imperial")).toBe(
        "Γ_ova 3.6°F/kft · SST 57°F"
      );
      expect(localizeMetricProse("ECMWF IFS 9km", "metric")).toBe("ECMWF IFS 9km");

      const bundle = makeTestWeatherBundle();
      const stripImpHtml = renderToStaticMarkup(
        React.createElement(HourlyForecastStrip, {
          hourly: bundle.hourly.slice(0, 24),
          daily: bundle.daily,
          unit: "imperial",
          selectedIndex: 0
        })
      );
      expect(stripImpHtml).toContain("Yüzey (6.5ft) Sıcaklık");
      expect(stripImpHtml).not.toContain("2m Sıcaklık");
      expect(stripImpHtml).toContain("pl-4");
    });

    it("SnowAndLightningObservatory: imperial 9 mi yuvarlama tutarlılığı, roving tabIndex ve aria-expanded özniteliklerini korur", () => {
      const bundle = makeTestWeatherBundle();
      const alertRadar = {
        ...resolveActiveTemporalView(bundle, 0).lightningRadar,
        safetyLevel: "shelter_now" as const,
        safetyTitleTr: "30-30 KURALI AKTİF: 15 km İçinde Yıldırım Tehlikesi",
        safetyDetailTr: "0–15 km merkez halkada yüksek deşarj riski öngörülüyor."
      };

      const obsImpHtml = renderToStaticMarkup(
        React.createElement(SnowAndLightningObservatory, {
          cityName: "Bursa",
          daily: bundle.daily,
          hourly: bundle.hourly.slice(0, 48),
          summary: {
            ...bundle.snowAndLightning!,
            lightningRadar: alertRadar
          },
          temporalLightningRadar: alertRadar,
          selectedHourIndex: 0,
          unit: "imperial",
          defaultExpanded: true
        })
      );

      expect(obsImpHtml).toContain("9 mi İçinde Yıldırım Tehlikesi");
      expect(obsImpHtml).toContain("0–9 mi · Acil Yakın Çember");
      expect(obsImpHtml).not.toContain("9.3 mi İçinde");
      expect(obsImpHtml).toContain('tabindex="0"');
      expect(obsImpHtml).toContain('tabindex="-1"');
      expect(obsImpHtml).toContain('aria-expanded="true"');
    });

    it("RadarNowcastRibbon: 1 <= frameIndex <= 6 iken ISO saat önekiyle çeyrek dilim bulur; eşleşme yoksa yanıltıcı +6s etiketi basmaz", () => {
      const bundle = makeTestWeatherBundle();
      // 14:45'te başlayan alt-saatlik 15dk dilimleri: 15:00 tam 1. indekstedir (frameIndex * 4 = 4 değil!)
      const subHourSlots: Minutely15Point[] = [
        { ...bundle.minutely15![0], time: "2026-11-26T14:45", label: "14:45" },
        { ...bundle.minutely15![0], time: "2026-11-26T15:00", label: "15:00" },
        { ...bundle.minutely15![0], time: "2026-11-26T15:15", label: "15:15" },
        { ...bundle.minutely15![0], time: "2026-11-26T15:30", label: "15:30" },
        { ...bundle.minutely15![0], time: "2026-11-26T15:45", label: "15:45" }
      ];
      const subHourHourly: HourlyPoint[] = [
        { ...bundle.hourly[0], time: "2026-11-26T14:00", hourLabel: "14:00" },
        { ...bundle.hourly[1], time: "2026-11-26T15:00", hourLabel: "15:00" }
      ];

      const matchedHtml = renderToStaticMarkup(
        React.createElement(RadarNowcastRibbon, {
          minutely15: subHourSlots,
          hourly: subHourHourly,
          frameIndex: 1,
          unit: "metric"
        })
      );
      expect(matchedHtml).toContain("Seçili saat hizası: +1s (15:00)");
      expect(matchedHtml).not.toContain("(15:45)");

      // Yalnızca 12 çeyrek dilim (00:00..02:45) varken frameIndex = 6 (06:00) için eşleşen dilim yoktur
      const unmatchedHtml = renderToStaticMarkup(
        React.createElement(RadarNowcastRibbon, {
          minutely15: bundle.minutely15,
          hourly: bundle.hourly,
          frameIndex: 6,
          unit: "metric"
        })
      );
      expect(unmatchedHtml).not.toContain("Seçili saat hizası: +6s");
    });

    it("HeroSceneView + WeatherContext + 360px mobil ve etkileşim sözleşmeleri eksiksiz bağlıdır", () => {
      const bundle = makeTestWeatherBundle();
      bundle.current.airSnowCmHr = 1.6;
      bundle.current.groundSnowCmHr = 1.1;
      bundle.current.precipPhase = "snow";
      bundle.hourly[0].airSnowCm = 1.6;
      bundle.hourly[0].groundSnowCm = 1.1;
      bundle.hourly[0].precipPhase = "snow";

      const heroHtml = renderToStaticMarkup(
        React.createElement(
          WeatherProvider,
          { initialBundle: bundle } as React.ComponentProps<typeof WeatherProvider>,
          React.createElement(HeroSceneView)
        )
      );
      expect(heroHtml).toContain("Hava 1.6 cm/sa");
      expect(heroHtml).toContain("Zemin 1.1 cm/sa");
      expect(heroHtml).toContain('aria-expanded="false"');

      const repoRoot = path.resolve(__dirname, "..");
      const ctxSrc = fs.readFileSync(path.join(repoRoot, "context/WeatherContext.tsx"), "utf-8");
      const heroSrc = fs.readFileSync(path.join(repoRoot, "components/HeroSceneView.tsx"), "utf-8");
      const obsSrc = fs.readFileSync(
        path.join(repoRoot, "components/SnowAndLightningObservatory.tsx"),
        "utf-8"
      );
      const stripSrc = fs.readFileSync(
        path.join(repoRoot, "components/HourlyForecastStrip.tsx"),
        "utf-8"
      );
      const dailySrc = fs.readFileSync(
        path.join(repoRoot, "components/ExtendedDailyForecastPanel.tsx"),
        "utf-8"
      );
      const scrubberSrc = fs.readFileSync(
        path.join(repoRoot, "components/TimeScrubber.tsx"),
        "utf-8"
      );
      const ribbonSrc = fs.readFileSync(
        path.join(repoRoot, "components/RadarNowcastRibbon.tsx"),
        "utf-8"
      );

      // 1) WeatherContext: Şimdi (idx === 0) focusedDate sıfırlaması ve 48->168 / 168->240 vade genişlemesi
      expect(ctxSrc).toContain("if (idx === 0)");
      expect(ctxSrc).toContain("else if (idx >= 48)");
      expect(ctxSrc).toContain("prev < 168 ? 168 : prev");

      // 2) HeroSceneView: her iki rasathaneye prop bağlantısı, ExtendedDailyForecastPanel activeDateYmd ve 360px min-w-0
      expect(
        (heroSrc.match(/temporalLightningRadar=\{temporalView\.lightningRadar\}/g) ?? []).length
      ).toBe(2);
      expect((heroSrc.match(/onSelectDate=\{setFocusedDate\}/g) ?? []).length).toBe(2);
      expect(heroSrc).toContain(
        "activeDateYmd={frameIndex > 0 ? dayContext.date : (focusedDate ?? dayContext.date)}"
      );
      expect(heroSrc).toContain('{temporalView.frameIndex > 0 ? " (Şimdi)" : ""}');

      // 3) SnowAndLightningObservatory & HourlyForecastStrip: Oraj merceği olayı, dokunmatik eşik ve tarih seçimi izolasyonu
      expect(obsSrc).toContain('"atmos:open-convective-lens"');
      expect(obsSrc).toContain("Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6");
      expect(stripSrc).not.toContain("notifySelectHour(targetIdx);\n  }, [\n    controlledExtended,\n    focusedDate");

      // 4) 360px dar ekran balon ve ızgara kenetlemeleri
      expect(scrubberSrc).toContain("max-w-[calc(100%-1rem)]");
      expect(scrubberSrc).toContain("whitespace-normal sm:whitespace-nowrap");
      expect(ribbonSrc).toContain("max-w-[calc(100%-1rem)]");
      expect(ribbonSrc).toContain("whitespace-normal sm:whitespace-nowrap");
      expect(dailySrc).toContain("minmax(44px,1fr)");
      expect(dailySrc).toContain("sm:grid-cols-[88px_28px_44px_minmax(68px,1fr)_auto]");
      expect(dailySrc).toContain("min-w-[44px] sm:min-w-[68px]");
    });
  });

  describe("I-7: Kar Sınırı ↔ Hava Gerçeği, Kar ↔ Derece/Tw ve Merkez (100m) ↔ Zirve (1850m) Çelişkisizlik Kalkanı", () => {
    it("1) Kar sınırı ↔ hava gerçeği: kupkuru soğuk/güneşli saatte kar sınırı gizlenir; yağmur fazında kar sınırı asla istasyon rakımının altına inmez", () => {
      // Kupkuru -2°C veya +6.5°C açık gökyüzü (0 mm, %5 PoP, zemin örtüsü 0 cm) -> hayalet kar sınırı basılmaz!
      expect(
        isSnowLinePhysicallyRelevant({
          snowLineElevationM: 0,
          baseElevationM: 100,
          temperatureC: -2.0,
          temp850hPa: -8.0,
          precipMmHr: 0,
          precipProbabilityPct: 5,
          airSnowProbPct: 0,
          snowpackDepthCm: 0
        })
      ).toBe(false);

      expect(
        isSnowLinePhysicallyRelevant({
          snowLineElevationM: 1350,
          baseElevationM: 100,
          temperatureC: 6.5,
          temp850hPa: -1.0,
          precipMmHr: 0,
          precipProbabilityPct: 8,
          airSnowProbPct: 0,
          snowpackDepthCm: 0
        })
      ).toBe(false);

      // Zeminde kar örtüsü varsa (3.5 cm) kuru soğukta da kar sınırı anlamlı kalır
      expect(
        isSnowLinePhysicallyRelevant({
          snowLineElevationM: 0,
          baseElevationM: 100,
          temperatureC: -2.0,
          temp850hPa: -8.0,
          precipMmHr: 0,
          precipProbabilityPct: 5,
          airSnowProbPct: 0,
          snowpackDepthCm: 3.5
        })
      ).toBe(true);

      // Sığ ılık sınır tabakası: Bursa Merkez (100 m), T = +3.2°C, RH = %85 (Tw ~ +2.1°C), 0°C sınırı 340 m
      // İstasyon rakımında saf yağmur (rain) yağarken kar sınırı ASLA 100 m'nin altına düşemez!
      const shallowWarmRain = solveBourgouinSnowLine({
        elevationM: 100,
        surfaceTempC: 3.2,
        surfaceRhPct: 85,
        precipMmHr: 2.0,
        freezingLevelM: 340,
        temp850hPa: -4.5
      });
      expect(shallowWarmRain.columnPhase).toBe("rain");
      expect(shallowWarmRain.snowLineElevationM).toBeGreaterThan(100);
    });

    it("2) Kar ↔ Derece (T vs Tw & kuru soğuk): +2.6°C kuru havada (Tw < 0°C) kar yağar, +3.2°C nemli havada yağmur yağar; -3°C kuru soğuk asla 'Sıcak Profil' olarak etiketlenmez", () => {
      // +2.6°C kuru hava (RH %42 -> Tw ~ -0.4°C): termometre +2.6°C olsa bile ıslak hazne <= 0°C olduğundan saf kar iner
      const dryColdAirBourgouin = solveBourgouinSnowLine({
        elevationM: 100,
        surfaceTempC: 2.6,
        surfaceRhPct: 42,
        precipMmHr: 1.8,
        freezingLevelM: 480,
        temp850hPa: -6.0
      });
      expect(dryColdAirBourgouin.columnPhase).toBe("snow");
      expect(dryColdAirBourgouin.snowLineElevationM).toBeLessThanOrEqual(100);

      const dryColdSnowDiag = diagnoseFallingSnowAtPoint({
        tempC: 2.6,
        rhPct: 42,
        wetBulbC: -0.4,
        precipMmHr: 1.8,
        precipProbPct: 85,
        rawModelSnowfallCm: 1.5,
        bourgouin: dryColdAirBourgouin,
        basePhase: "snow",
        slr: 11
      });
      expect(dryColdSnowDiag.refinedPhase).toBe("snow");
      expect(dryColdSnowDiag.airSnowCm).toBeGreaterThan(1.0);

      // +3.2°C nemli hava (RH %92 -> Tw ~ +2.7°C): 0.0 cm kar, %100 yağmur
      const humidWarmDiag = diagnoseFallingSnowAtPoint({
        tempC: 3.2,
        rhPct: 92,
        wetBulbC: 2.7,
        precipMmHr: 2.5,
        precipProbPct: 90,
        rawModelSnowfallCm: 0,
        bourgouin: solveBourgouinSnowLine({
          elevationM: 100,
          surfaceTempC: 3.2,
          surfaceRhPct: 92,
          precipMmHr: 2.5,
          freezingLevelM: 620,
          temp850hPa: -2.0
        }),
        basePhase: "rain",
        slr: 10
      });
      expect(humidWarmDiag.refinedPhase).toBe("rain");
      expect(humidWarmDiag.airSnowCm).toBe(0);

      // -3°C kupkuru kış gününde SnowAndLightningObservatory asla "Sıcak Profil" demez!
      const dryFreezeBundle = makeTestWeatherBundle();
      dryFreezeBundle.daily = dryFreezeBundle.daily.map((d) => ({
        ...d,
        tempMin: -3.5,
        tempMax: 2.0,
        precipSum: 0,
        precipProbabilityMax: 5,
        snowProbMaxPct: 0,
        airSnowSumCm: 0,
        groundSnowSumCm: 0,
        roadSnowSumCm: 0,
        maxSnowpackDepthCm: 0,
        minSnowLineM: 0
      }));
      dryFreezeBundle.hourly[0] = {
        ...dryFreezeBundle.hourly[0],
        temperature: -3.0,
        wetBulbC: -4.2,
        precipitation: 0,
        precipProbability: 5,
        airSnowCm: 0,
        airSnowProbPct: 0,
        snowpackDepthCm: 0,
        snowLineElevationM: 0
      };

      const dryColdHtml = renderToStaticMarkup(
        React.createElement(SnowAndLightningObservatory, {
          cityName: "Bursa",
          daily: dryFreezeBundle.daily,
          hourly: dryFreezeBundle.hourly.slice(0, 48),
          summary: {
            ...dryFreezeBundle.snowAndLightning!,
            referenceElevationM: 100,
            total15dAirSnowCm: 0,
            total15dGroundSnowCm: 0,
            total15dRoadSnowCm: 0,
            lowest15dSnowLineM: null
          },
          selectedHourIndex: 0,
          unit: "metric",
          defaultExpanded: true
        })
      );
      expect(dryColdHtml).toContain("Yağışsız Kuru Soğuk Profil");
      expect(dryColdHtml).not.toContain("Sıcak Profil");
    });

    it("3) Merkez (100 m) ↔ Zirve (1850 m): Bursa Merkez'de zirve-only kar şeridi ve Uludağ seçildiğinde 'Seçili Zirve (1850 m)' + ovada yağmur ayrımı kusursuz çalışır", () => {
      const centerBundle = makeTestWeatherBundle();
      // Bursa Merkez (100 m): merkezde 0 cm kar, Uludağ Zirve (1850 m) bandında 14.5 cm kar
      centerBundle.daily[0] = {
        ...centerBundle.daily[0],
        airSnowSumCm: 0,
        groundSnowSumCm: 0,
        snowProbMaxPct: 5,
        elevationSnowBands: [
          {
            id: "coast",
            labelTr: "Mudanya / Kıyı",
            elevationM: 15,
            tempMeanC: 7.4,
            wetBulbMeanC: 5.9,
            precipPhase: "rain",
            snowProbPct: 0,
            airSnowCm: 0,
            groundSnowCm: 0,
            roadSnowCm: 0,
            maxSnowpackCm: 0,
            slr: 0,
            snowQualityTr: "Yok"
          },
          {
            id: "center",
            labelTr: "Bursa Merkez (17116 · Ova)",
            elevationM: 100,
            tempMeanC: 6.8,
            wetBulbMeanC: 5.3,
            precipPhase: "rain",
            snowProbPct: 2,
            airSnowCm: 0,
            groundSnowCm: 0,
            roadSnowCm: 0,
            maxSnowpackCm: 0,
            slr: 0,
            snowQualityTr: "Yok"
          },
          {
            id: "foothill",
            labelTr: "Çekirge – İnkaya Yamaç",
            elevationM: 550,
            tempMeanC: 3.9,
            wetBulbMeanC: 2.8,
            precipPhase: "rain",
            snowProbPct: 12,
            airSnowCm: 0,
            groundSnowCm: 0,
            roadSnowCm: 0,
            maxSnowpackCm: 0,
            slr: 0,
            snowQualityTr: "Yok"
          },
          {
            id: "summit",
            labelTr: "Uludağ Oteller / Zirve",
            elevationM: 1850,
            tempMeanC: -3.8,
            wetBulbMeanC: -4.2,
            precipPhase: "snow",
            snowProbPct: 94,
            airSnowCm: 14.5,
            groundSnowCm: 12.2,
            roadSnowCm: 9.8,
            maxSnowpackCm: 12.2,
            slr: 14.2,
            snowQualityTr: "Kristal Toz Kar"
          }
        ]
      };

      const centerHtml = renderToStaticMarkup(
        React.createElement(SnowAndLightningObservatory, {
          cityName: "Bursa",
          daily: centerBundle.daily,
          hourly: centerBundle.hourly.slice(0, 48),
          summary: {
            ...centerBundle.snowAndLightning!,
            referenceElevationM: 100,
            hasAnySnow15d: true,
            total15dAirSnowCm: 0,
            total15dGroundSnowCm: 0,
            total15dRoadSnowCm: 0
          },
          focusedDate: centerBundle.daily[0].date,
          selectedHourIndex: 0,
          unit: "metric",
          defaultExpanded: true
        })
      );
      expect(centerHtml).toContain("15 Gün Seçili Merkez (100 m) Havada:");
      expect(centerHtml).toContain("Zirve (1850 m):");
      expect(centerHtml).toContain("Seçili Merkez (100 m) için kar beklenmiyor");
      expect(centerHtml).toContain("Uludağ Oteller / Zirve · 1850 m");

      // Uludağ (1850 m) seçildiğinde: asla "Merkez Havada" yazmaz; "Seçili Zirve (1850 m)" yazar
      // ve simülasyonda aşağıya projekte edilen 100 m Bursa Merkez bandı (+6.8°C) 0 cm kar (rain) alır!
      const uludagSim = simulateCoupledSnowTimeline({
        hours: [
          {
            timeIso: "2026-12-22T12:00",
            dateYmd: "2026-12-22",
            leadHour: 0,
            elevationM: 1850,
            lat: 40.107,
            lon: 29.129,
            temp2mC: -3.8,
            rh2mPct: 94,
            wetBulbC: -4.1,
            windSpeedKmh: 34,
            windGustsKmh: 52,
            windDirDeg: 25,
            cloudCoverPct: 98,
            solarElevationDeg: 22,
            shortwaveWm2: 85,
            precipMmHr: 3.6,
            precipP90MmHr: 4.9,
            precipProbPct: 95,
            rawModelSnowfallCm: 4.5,
            precipPhase: "snow",
            freezingLevelM: 0, // Model arazisi altında 0 m dönse bile ovada (+7°C) kar üretmemeli!
            temp850hPa: -1.2,
            lapseRateCPerKm: 6.2,
            capeJkg: 30,
            seaSurfaceTempC: 11.2
          }
        ]
      });

      const uludagHour = uludagSim[0];
      expect(uludagHour.airSnowCm).toBeGreaterThan(3.5);
      const summitBand = uludagHour.elevationBands.find((b) => b.id === "summit");
      const valleyCenterBand = uludagHour.elevationBands.find((b) => b.id === "center");
      expect(summitBand?.elevationM).toBe(1850);
      expect(summitBand?.airSnowCm).toBe(uludagHour.airSnowCm);
      expect(valleyCenterBand?.elevationM).toBe(100);
      expect(valleyCenterBand?.tempMeanC).toBeGreaterThan(5.0);
      expect(valleyCenterBand?.precipPhase).toBe("rain");
      expect(valleyCenterBand?.airSnowCm).toBe(0);

      const summitHtml = renderToStaticMarkup(
        React.createElement(SnowAndLightningObservatory, {
          cityName: "Uludağ",
          daily: [
            {
              ...centerBundle.daily[0],
              airSnowSumCm: 14.5,
              groundSnowSumCm: 12.2,
              roadSnowSumCm: 9.8,
              snowProbMaxPct: 94
            }
          ],
          hourly: centerBundle.hourly.slice(0, 24),
          summary: {
            ...centerBundle.snowAndLightning!,
            referenceElevationM: 1850,
            hasAnySnow15d: true,
            total15dAirSnowCm: 14.5,
            total15dGroundSnowCm: 12.2,
            total15dRoadSnowCm: 9.8
          },
          focusedDate: centerBundle.daily[0].date,
          selectedHourIndex: 0,
          unit: "metric",
          defaultExpanded: true
        })
      );
      expect(summitHtml).toContain("15 Gün Seçili Zirve (1850 m) Havada:");
      expect(summitHtml).not.toContain("15 Gün Merkez Havada:");
    });
  });
});
