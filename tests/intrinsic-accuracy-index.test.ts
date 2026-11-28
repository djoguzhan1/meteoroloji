import { describe, expect, it } from "vitest";
import {
  computeCalibratedWeightedSpread,
  computeIntrinsicAccuracyIndex,
  computeLyapunovHorizonSkill
} from "../lib/accuracy-index";
import { reanchorWeatherBundleToNow } from "../lib/forecast-resilience";
import { trainKalmanMos } from "../lib/kalman-mos";
import type { RawMetarRecord } from "../lib/metar-verify";
import {
  computeInverseRmseWeights,
  WMO_PRIOR_WEIGHTS
} from "../lib/model-registry";
import {
  computeEnsembleDistStats,
  fusePrecipitationHour
} from "../lib/precip-engine";
import { evaluateHourlyRunConsistency } from "../lib/run-consistency";
import { DEFAULT_LOCATION } from "../lib/weather-client";
import type {
  HybridModelSnapshot,
  MetarObservation,
  WeatherBundle
} from "../lib/weather-types";

function makeSnap(overrides: Partial<HybridModelSnapshot> = {}): HybridModelSnapshot {
  return {
    ecmwfIfs: null,
    ecmwfAifs: null,
    icon: null,
    ukmo: null,
    meteofrance: null,
    gfs: null,
    gem: null,
    jma: null,
    ...overrides
  };
}

describe("ATMOS v5.0 — Sistem Gücüne Dayalı İçsel Doğruluk Endeksi & 8 Arka Uç Kusur Kalkanı", () => {
  it("1) Kusur 1 Kalkanı: Kalman-düzeltmeli ağırlıklı yayılım tekil kaba model sapmasına bağışıktır; tek modele düşüşte asla sahte %82 ödülü verilmez", () => {
    // 7 model ~14.0°C derken 20km kaba ızgaralı JMA modeli -4.4°C sistematik rakım sapmasıyla 9.6°C veriyor
    const rawSnap = makeSnap({
      ecmwfIfs: 14.1,
      ecmwfAifs: 14.0,
      icon: 13.9,
      ukmo: 14.2,
      meteofrance: 13.8,
      gfs: 14.1,
      gem: 13.9,
      jma: 9.6
    });
    const biases = {
      ecmwfIfs: 0.05,
      ecmwfAifs: 0.0,
      icon: -0.05,
      ukmo: 0.1,
      meteofrance: -0.1,
      gfs: 0.05,
      gem: -0.05,
      jma: -4.35
    };

    const rawMaxMin = 14.2 - 9.6; // 4.6°C!
    const calWeightedSpread = computeCalibratedWeightedSpread({
      snapshot: rawSnap,
      weights: WMO_PRIOR_WEIGHTS.temperature,
      biases
    });

    expect(rawMaxMin).toBeCloseTo(4.6, 1);
    expect(calWeightedSpread).toBeLessThan(0.45);

    const fullPower = computeIntrinsicAccuracyIndex({
      leadHours: 0,
      activeModelCount: 8,
      ensembleMemberCount: 172,
      verificationMode: "live-mgm-mesh",
      verifiedStationCount: 14,
      matchedVerificationHours: 48,
      nowcastKalmanGain: 0.72,
      bestTempUbRmseC: 0.62,
      isBursaEmosActive: true,
      radarAvailable: true,
      calibratedTempSpreadC: calWeightedSpread,
      calibratedPressureSpreadHpa: 0.4,
      runLockCount: 4,
      stabilityGrade: "LOCKED"
    });
    expect(fullPower.totalPct).toBeGreaterThanOrEqual(95);

    // 7 model + ensemble çökmüş, elde yalnızca 1 ham model kalmış -> ASLA %82 olamaz (<= %58)!
    const singleModelBlind = computeIntrinsicAccuracyIndex({
      leadHours: 0,
      activeModelCount: 1,
      ensembleMemberCount: 0,
      verificationMode: "wmo-prior",
      calibratedTempSpreadC: 0,
      freshnessStatus: "degraded",
      degradedStreamCount: 2
    });
    expect(singleModelBlind.totalPct).toBeLessThanOrEqual(58);
    expect(fullPower.totalPct - singleModelBlind.totalPct).toBeGreaterThanOrEqual(37);
  });

  it("2) Kusur 2 Kalkanı: Aktif MGM istasyon ağı, Kalman kazancı, Bursa 17.472s EMOS ve canlı Doppler radar sistem gücünü doğrudan yükseltir", () => {
    const commonBase = {
      leadHours: 2,
      calibratedTempSpreadC: 1.1,
      calibratedPressureSpreadHpa: 0.8
    };

    const sensorRichBursa = computeIntrinsicAccuracyIndex({
      ...commonBase,
      activeModelCount: 8,
      ensembleMemberCount: 172,
      verificationMode: "live-mgm-mesh",
      verifiedStationCount: 16,
      matchedVerificationHours: 48,
      nowcastKalmanGain: 0.70,
      bestTempUbRmseC: 0.68,
      isBursaEmosActive: true,
      radarAvailable: true,
      runLockCount: 4,
      stabilityGrade: "LOCKED"
    });

    const unverifiedOcean = computeIntrinsicAccuracyIndex({
      ...commonBase,
      activeModelCount: 6,
      ensembleMemberCount: 0,
      verificationMode: "wmo-prior",
      verifiedStationCount: 0,
      matchedVerificationHours: 0,
      nowcastKalmanGain: 0,
      bestTempUbRmseC: null,
      isBursaEmosActive: false,
      radarAvailable: false,
      runLockCount: 2,
      stabilityGrade: "CONVERGING"
    });

    expect(sensorRichBursa.sensorCalibrationPts).toBeGreaterThan(
      unverifiedOcean.sensorCalibrationPts + 14
    );
    expect(sensorRichBursa.totalPct - unverifiedOcean.totalPct).toBeGreaterThanOrEqual(18);
  });

  it("3) Kusur 3 Kalkanı: Yağış %50/%50 bölünmesi ve çift modlu cephe (Bimodal) endeksi düşürür; 0-720s Lyapunov vade eğrisi 168s ve 360s geçişlerinde pürüzsüzdür", () => {
    const calmConsensus = computeIntrinsicAccuracyIndex({
      leadHours: 84,
      activeModelCount: 8,
      ensembleMemberCount: 172,
      verificationMode: "live-station-48h",
      matchedVerificationHours: 36,
      calibratedTempSpreadC: 1.2,
      calibratedPressureSpreadHpa: 0.9,
      wetModelFraction: 0,
      precipProbPct: 5,
      precipSpreadMmHr: 0,
      bimodalSeparationC: 0
    });

    const splitBimodalFront = computeIntrinsicAccuracyIndex({
      leadHours: 84,
      activeModelCount: 8,
      ensembleMemberCount: 172,
      verificationMode: "live-station-48h",
      matchedVerificationHours: 36,
      calibratedTempSpreadC: 1.2,
      calibratedPressureSpreadHpa: 0.9,
      wetModelFraction: 0.5,
      precipProbPct: 52,
      precipSpreadMmHr: 7.5,
      bimodalSeparationC: 9.2
    });

    expect(calmConsensus.totalPct - splitBimodalFront.totalPct).toBeGreaterThanOrEqual(8);

    // Sürekli Lyapunov vade sönümü: 0h > 72h > 167h >= 168h > 359h >= 360h > 720h ve sınır saatlerde uçurum yok!
    const evalAt = (h: number) =>
      computeIntrinsicAccuracyIndex({
        leadHours: h,
        activeModelCount: h <= 114 ? 8 : h <= 168 ? 7 : h < 360 ? 5 : 2,
        ensembleMemberCount: h < 360 ? 164 : 52,
        verificationMode: "live-mgm-mesh",
        verifiedStationCount: 12,
        matchedVerificationHours: 48,
        isBursaEmosActive: h < 360,
        calibratedTempSpreadC: 1.4 + h * 0.004
      }).totalPct;

    const c0 = evalAt(0);
    const c72 = evalAt(72);
    const c167 = evalAt(167);
    const c168 = evalAt(168);
    const c359 = evalAt(359);
    const c360 = evalAt(360);
    const c720 = evalAt(720);

    expect(c0).toBeGreaterThan(c72);
    expect(c72).toBeGreaterThan(c167);
    expect(Math.abs(c167 - c168)).toBeLessThanOrEqual(2);
    expect(c168).toBeGreaterThan(c359);
    expect(Math.abs(c359 - c360)).toBeLessThanOrEqual(4);
    expect(c360).toBeGreaterThan(c720);
    expect(computeLyapunovHorizonSkill(0)).toBe(1);
    expect(computeLyapunovHorizonSkill(720)).toBeLessThan(0.15);
  });

  it("4) Kusur 4 Kalkanı: dProg/dt koşu kilidi 8 modelden 7'si savrulduğunda tek model yüzünden asla 4-koşu LOCKED üretmez", () => {
    const sevenShiftedOneStubborn = evaluateHourlyRunConsistency({
      leadHours: 36,
      validTimeIso: "2026-11-30T12:00",
      candidateTempC: 6.5,
      candidateIsWet: true,
      candidatePrecipMmHr: 3.2,
      candidatePopPct: 80,
      hourIndex: 0,
      laggedModels: [
        { modelKey: "ecmwfIfs", family: "ECMWF", run0TempC: [6.2], runMinus1TempC: [10.4], runMinus2TempC: [11.0], runMinus3TempC: [11.2], initCycleUtcHour: 12 },
        { modelKey: "ecmwfAifs", family: "ECMWF_AI", run0TempC: [6.4], runMinus1TempC: [10.6], runMinus2TempC: [11.1], runMinus3TempC: [11.3], initCycleUtcHour: 12 },
        { modelKey: "icon", family: "DWD", run0TempC: [6.0], runMinus1TempC: [10.1], runMinus2TempC: [10.8], runMinus3TempC: [11.0], initCycleUtcHour: 12 },
        { modelKey: "ukmo", family: "UKMO", run0TempC: [6.5], runMinus1TempC: [10.5], runMinus2TempC: [10.9], runMinus3TempC: [11.1], initCycleUtcHour: 12 },
        { modelKey: "meteofrance", family: "METEOFRANCE", run0TempC: [6.3], runMinus1TempC: [10.2], runMinus2TempC: [10.7], runMinus3TempC: [10.9], initCycleUtcHour: 12 },
        { modelKey: "gfs", family: "NOAA", run0TempC: [6.8], runMinus1TempC: [10.9], runMinus2TempC: [11.4], runMinus3TempC: [11.5], initCycleUtcHour: 12 },
        { modelKey: "gem", family: "CMC", run0TempC: [6.7], runMinus1TempC: [10.7], runMinus2TempC: [11.2], runMinus3TempC: [11.4], initCycleUtcHour: 12 },
        // Yalnızca JMA kendi içinde 4 koşudur sabit:
        { modelKey: "jma", family: "JMA", run0TempC: [9.0], runMinus1TempC: [9.0], runMinus2TempC: [9.1], runMinus3TempC: [8.9], initCycleUtcHour: 6 }
      ]
    });

    expect(sevenShiftedOneStubborn.consecutiveRunLockCount).toBeLessThanOrEqual(2);
    expect(sevenShiftedOneStubborn.stabilityGrade).not.toBe("LOCKED");
  });

  it("5) Kusur 5 Kalkanı: Ters-UBRMSE² ağırlıklandırmada doğrulanmamış (null) model asla 1.1°C doğrulanmış modelden yüksek çarpan almaz ve kısa örneklem WMO öncülüne büzülür", () => {
    const weights = computeInverseRmseWeights(
      {
        ecmwfIfs: 1.1,
        ecmwfAifs: 0.75,
        icon: 0.95,
        ukmo: 1.15,
        meteofrance: 1.05,
        gfs: 1.35,
        gem: 1.4,
        jma: null // Geçmiş verisi eksik / doğrulanmamış model!
      },
      WMO_PRIOR_WEIGHTS.temperature,
      0.45
    );

    const ifsMultiplier = weights.ecmwfIfs / WMO_PRIOR_WEIGHTS.temperature.ecmwfIfs;
    const jmaMultiplier = weights.jma / WMO_PRIOR_WEIGHTS.temperature.jma;
    expect(jmaMultiplier).toBeLessThan(ifsMultiplier);

    // 8 saatlik kısa örneklemde aşırı savrulma Bayesçi büzülmeyle dengelenir ve mediumRange %22 yerel beceri taşır
    const baseMs = Date.parse("2026-11-25T00:00:00Z");
    const baseSec = Math.floor(baseMs / 1000);
    const utcTimeIndex = new Map<string, number>();
    for (let h = 0; h < 10; h++) {
      utcTimeIndex.set(new Date(baseMs + h * 3600_000).toISOString().slice(0, 16), h);
    }
    const station: MetarObservation = {
      icaoId: "LTBJ",
      stationName: "Izmir",
      distanceKm: 12,
      elevationM: 100,
      obsTimeIso: "2026-11-25T07:00:00Z",
      ageMinutes: 15,
      rawOb: "METAR LTBJ",
      tempC: 14,
      dewPointC: 9,
      windSpeedKmh: 12,
      windGustKmh: null,
      windDirectionDeg: 30,
      qnhHpa: 1016,
      visibilityKm: 10,
      wxString: null
    };
    const history: RawMetarRecord[] = Array.from({ length: 8 }, (_, h) => ({
      icaoId: "LTBJ",
      lat: 38.29,
      lon: 27.15,
      elev: 100,
      obsTime: baseSec + h * 3600,
      temp: 14 + (h % 2 === 0 ? 0.1 : -0.1),
      dewp: 9,
      wspd: 6,
      wdir: 30,
      altim: 1016
    }));
    const makeSeries = (base: number, jitter: number) =>
      Array.from({ length: 10 }, (_, h) => base + (h % 2 === 0 ? jitter : -jitter));

    const mos = trainKalmanMos({
      network: [{ station, history }],
      modelHourlyUtc: {
        temperature_2m_ecmwf_ifs: makeSeries(15.4, 0.9),
        temperature_2m_ecmwf_aifs025_single: makeSeries(15.3, 0.85),
        temperature_2m_icon_seamless: makeSeries(15.2, 0.8),
        temperature_2m_ukmo_seamless: makeSeries(15.3, 0.85),
        temperature_2m_meteofrance_seamless: makeSeries(15.2, 0.8),
        temperature_2m_gfs_seamless: makeSeries(15.5, 1.0),
        temperature_2m_gem_seamless: makeSeries(14.05, 0.12), // 8 saatlik tesadüfi çok düşük hata
        temperature_2m_jma_seamless: makeSeries(15.6, 1.1)
      },
      utcTimeIndex,
      cityElevationM: 100,
      envLapseRateCPerM: -0.006,
      nowUtcMs: baseMs + 7 * 3600_000,
      utcOffsetSeconds: 10800,
      ensembleMembers: 172
    });

    expect(mos.report.matchedHours).toBe(8);
    // Kısa örneklemde (8 saat) GEM tüm ağırlığı tek başına yutmaz (< %35) ve orta vadede yerel iz taşınır (> 0.05)
    expect(mos.shortRangeWeights.temperature.gem).toBeLessThan(0.35);
    expect(mos.mediumRangeWeights.temperature.gem).toBeGreaterThan(0.052);
  });

  it("6 & 7) Kusur 6 ve 7 Kalkanları: Bayat (stale) önbellek yaşlandıkça doğruluk endeksi düşer; yamaç/kıyı mikroklima belirsizliği hesaba katılır", () => {
    const plainAcc = computeIntrinsicAccuracyIndex({
      leadHours: 6,
      activeModelCount: 8,
      ensembleMemberCount: 172,
      verificationMode: "live-mgm-mesh",
      verifiedStationCount: 14,
      matchedVerificationHours: 48,
      isBursaEmosActive: true,
      calibratedTempSpreadC: 0.9,
      microclimateUncertaintyC: 0
    });
    const slopeCoastAcc = computeIntrinsicAccuracyIndex({
      leadHours: 6,
      activeModelCount: 8,
      ensembleMemberCount: 172,
      verificationMode: "live-mgm-mesh",
      verifiedStationCount: 14,
      matchedVerificationHours: 48,
      isBursaEmosActive: true,
      calibratedTempSpreadC: 0.9,
      microclimateUncertaintyC: 1.2
    });
    expect(slopeCoastAcc.calibratedSpreadC).toBeGreaterThan(plainAcc.calibratedSpreadC);
    expect(plainAcc.totalPct).toBeGreaterThan(slopeCoastAcc.totalPct);

    // Stale 8-hour reanchor confidence decay
    const fetchedMs = Date.parse("2026-11-28T02:00:00Z");
    const staleNowMs = fetchedMs + 8 * 3600_000;
    const minBundle: WeatherBundle = {
      location: DEFAULT_LOCATION,
      source: "hybrid-nwp-verified",
      fetchedAt: new Date(fetchedMs).toISOString(),
      timezone: "Europe/Istanbul",
      utcOffsetSeconds: 10800,
      current: {
        time: "2026-11-28T05:00",
        temperature: 10,
        apparentTemperature: 9,
        wetBulbC: 8,
        humidity: 75,
        dewPoint: 6,
        pressure: 1016,
        pressureDelta3h: 0,
        pressureTrend: "sabit",
        pressureTrendDetail: "Dengeli",
        windSpeed: 10,
        windGusts: 16,
        windDirection: 40,
        beaufort: { scale: 2, label: "Hafif" },
        cloudCover: 30,
        visibilityKm: 15,
        uvIndex: 0,
        uvLabel: "Düşük",
        precipitation: 0,
        precipProbability: 10,
        precipConsensus: { agreeingModels: 0, totalModels: 8, minMm: 0, medianMm: 0, maxMm: 0 },
        precipType: "none",
        precipPhase: "none",
        weatherCode: 1,
        condition: "Az Bulutlu",
        isStorm: false,
        stormScore: 4,
        isDay: false,
        solarElevationDeg: -15,
        daylight: 0,
        sunrise: "2026-11-28T08:05",
        sunset: "2026-11-28T17:40",
        temp850hPa: 4
      },
      airQuality: {
        europeanAqi: 20,
        categoryIndex: 1,
        label: "İyi",
        pm25: 5,
        pm10: 10,
        ozone: 40,
        no2: 8,
        so2: 2,
        dust: 3,
        dominantPollutant: "PM10",
        dominantValueText: "10 µg/m³"
      },
      hourly: Array.from({ length: 24 }, (_, idx) => ({
        time: new Date(fetchedMs + 3 * 3600_000 + idx * 3600_000).toISOString().slice(0, 16),
        hourLabel: `${String((5 + idx) % 24).padStart(2, "0")}:00`,
        dayLabel: "Bugün",
        temperature: 10 + idx * 0.2,
        apparentTemperature: 9 + idx * 0.2,
        wetBulbC: 8,
        humidity: 70,
        dewPoint: 5,
        pressure: 1016,
        windSpeed: 10,
        windGusts: 16,
        windDirection: 40,
        cloudCover: 25,
        visibilityKm: 15,
        uvIndex: 1,
        precipitation: 0,
        precipProbability: 5,
        precipConsensus: { agreeingModels: 0, totalModels: 8, minMm: 0, medianMm: 0, maxMm: 0 },
        precipType: "none",
        precipPhase: "none",
        rainAccum: 0,
        snowAccum: 0,
        weatherCode: 1,
        condition: "Az Bulutlu",
        isStorm: false,
        stormScore: 2,
        solarElevationDeg: 10,
        daylight: 0.5,
        cape: 0,
        cin: 0,
        liftedIndex: 2,
        freezingLevelM: 2200,
        temp850hPa: 4
      })),
      daily: [
        {
          date: "2026-11-28",
          dayName: "Bugün",
          tempMin: 8,
          tempMax: 15,
          weatherCode: 1,
          condition: "Az Bulutlu",
          precipSum: 0,
          precipProbabilityMax: 10,
          windSpeedMax: 16,
          uvIndexMax: 3,
          sunrise: "2026-11-28T08:05",
          sunset: "2026-11-28T17:40",
          confidencePct: 95
        }
      ],
      sounding: [],
      hourlySoundings: [],
      nativeConvective: { cape: 0, cin: 0, liftedIndex: 2, freezingLevelM: 2200, lightningPotential: null },
      hybrid: {
        activeModels: ["ECMWF IFS 9km", "ECMWF AIFS v1"],
        confidencePct: 95,
        tempSpreadC: 0.6,
        pressureSpreadHpa: 0.5,
        currentBreakdown: {
          temperature: makeSnap(),
          pressure: makeSnap(),
          windSpeed: makeSnap(),
          temp850hPa: makeSnap(),
          precipitation: makeSnap()
        },
        verification: {
          mode: "live-mgm-mesh",
          station: null,
          stations: [],
          matchedHours: 48,
          winners: { temperature: "ecmwfAifs", pressure: "ecmwfIfs", wind: "icon" },
          rows: []
        },
        attributions: []
      }
    };

    const staleOut = reanchorWeatherBundleToNow(minBundle, staleNowMs, {
      status: "stale",
      sourceTier: "disk-stale",
      cachedAtMs: fetchedMs,
      staleReason: "Test kesintisi"
    });
    expect(staleOut.hybrid.confidencePct).toBeLessThanOrEqual(80);
    expect(staleOut.daily[0].confidencePct!).toBeLessThanOrEqual(80);
  });

  it("8) Kusur 8 Kalkanı: 212-üye ensemble yağış ve hamle istatistikleri model kalite ağırlıklarını (AIFS 1.45 vs GEFS 0.70) gerçekten uygular", () => {
    // 10 üye AIFS (w = 1.45) 4.0..8.5 mm sağanak verirken, 14 üye GEFS (w = 0.70) 0.0..0.4 mm zayıf yağış veriyor
    const aifsMembers = [4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5];
    const gefsMembers = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.3, 0.4, 0.5];
    const members = [...aifsMembers, ...gefsMembers];
    const weights = [...Array(10).fill(1.45), ...Array(14).fill(0.70)];

    const unweighted = computeEnsembleDistStats(members)!;
    const weighted = computeEnsembleDistStats(members, weights)!;

    expect(weighted.probGe01).toBeGreaterThan(unweighted.probGe01 + 6);
    expect(weighted.p50).toBeGreaterThan(unweighted.p50 + 2.0);

    const snap = makeSnap({ ecmwfIfs: 4.5, ecmwfAifs: 5.0, icon: 3.8, gfs: 0.2 });
    const fusedUnweighted = fusePrecipitationHour({
      detSnapshot: snap,
      detWeights: WMO_PRIOR_WEIGHTS.precipitation,
      ensembleMembersMm: members,
      rawPrecipFallbackMm: 2.0,
      rawPopFallbackPct: 55,
      leadHour: 24
    });
    const fusedWeighted = fusePrecipitationHour({
      detSnapshot: snap,
      detWeights: WMO_PRIOR_WEIGHTS.precipitation,
      ensembleMembersMm: members,
      ensembleMemberWeights: weights,
      rawPrecipFallbackMm: 2.0,
      rawPopFallbackPct: 55,
      leadHour: 24
    });

    expect(fusedWeighted.precipProbabilityPct).toBeGreaterThan(
      fusedUnweighted.precipProbabilityPct
    );
    expect(fusedWeighted.precipitationMm).toBeGreaterThan(fusedUnweighted.precipitationMm);
  });
});
