import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  computeLiveBursaVerticalProfile,
  integratePiecewiseVerticalDeltaC,
  type RawStationObservation
} from "../lib/bursa-mesh";
import {
  predictBursaTrainedPrecip,
  predictBursaTrainedTempC,
  resolveBimodalEnsembleCluster
} from "../lib/bursa-trained-emos";
import { ATMOS_V4_MODEL_REGISTRY, fusePrecipitationPmqm } from "../lib/emos-precip-fusion";
import { trainKalmanMos } from "../lib/kalman-mos";
import {
  decodePngBufferToRgba,
  runSemiLagrangianRadarNowcast,
  tileToDbzGrid
} from "../lib/radar-nowcast";
import { evaluateHourlyRunConsistency } from "../lib/run-consistency";
import {
  computeSynopticCycleId,
  getPriorCalibratedRunsFromLedger,
  getSameHour24hResidualFromLedger,
  getStationHistoryFromLedger,
  getTodayObservedExtremesFromLedger,
  makeLedgerLocationKey,
  recordStationObservationsToLedger,
  recordTargetResidualToLedger,
  resetStateLedgerForTests,
  saveCalibratedRunToLedger
} from "../lib/state-ledger";
import { computeBursaDistrictMicroclimateOffsetC } from "../lib/topographic-cressman";

function encodeTestRgbaPng(width: number, height: number, rgba: Uint8Array): Uint8Array {
  const stride = width * 4;
  const rawScanlines = new Uint8Array(height * (1 + stride));
  for (let y = 0; y < height; y++) {
    rawScanlines[y * (1 + stride)] = 0;
    rawScanlines.set(rgba.subarray(y * stride, (y + 1) * stride), y * (1 + stride) + 1);
  }
  const compressed = zlib.deflateSync(rawScanlines);
  const chunks: Uint8Array[] = [];
  const pushChunk = (type: string, data: Uint8Array) => {
    const buf = new Uint8Array(12 + data.length);
    const dv = new DataView(buf.buffer);
    dv.setUint32(0, data.length, false);
    for (let i = 0; i < 4; i++) buf[4 + i] = type.charCodeAt(i);
    buf.set(data, 8);
    dv.setUint32(8 + data.length, 0, false);
    chunks.push(buf);
  };
  const ihdr = new Uint8Array(13);
  const idv = new DataView(ihdr.buffer);
  idv.setUint32(0, width, false);
  idv.setUint32(4, height, false);
  ihdr[8] = 8;
  ihdr[9] = 6;
  pushChunk("IHDR", ihdr);
  pushChunk("IDAT", new Uint8Array(compressed));
  pushChunk("IEND", new Uint8Array(0));

  const sig = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const total = sig.length + chunks.reduce((a, c) => a + c.length, 0);
  const out = new Uint8Array(total);
  out.set(sig, 0);
  let pos = sig.length;
  for (const c of chunks) {
    out.set(c, pos);
    pos += c.length;
  }
  return out;
}

describe("ATMOS v5.0 — Bursa Zero-Drift 12-Point Root-Cause Verification Suite", () => {
  const tmpLedgerPath = path.join(os.tmpdir(), `atmos-v5-test-${process.pid}.json`);

  beforeEach(() => {
    process.env.ATMOS_LEDGER_PATH = tmpLedgerPath;
    resetStateLedgerForTests();
  });

  afterEach(() => {
    resetStateLedgerForTests();
    delete process.env.ATMOS_LEDGER_PATH;
  });

  it("Fix #1: Calibrated-vs-Calibrated dProg/dt preserves 100% of EMOS UHI calibration on cold start while blocking real noisy jumps", () => {
    // Raw models have ZERO run-to-run shift (R0 = 10.0°C, R-1 = 10.0°C, R-2 = 10.1°C),
    // while Bursa EMOS calibrates 10.0°C -> 11.8°C (+1.8°C evening UHI correction).
    // Old v4.5 bug damped 11.8°C down to 10.5°C! v5.0 MUST preserve 11.8°C untouched!
    const preserved = evaluateHourlyRunConsistency({
      leadHours: 18,
      validTimeIso: "2026-11-27T18:00",
      candidateTempC: 11.8,
      candidateIsWet: false,
      candidatePrecipMmHr: 0,
      candidatePopPct: 10,
      hourIndex: 0,
      laggedModels: [
        {
          modelKey: "ecmwfIfs",
          family: "ECMWF",
          run0TempC: [10.0],
          runMinus1TempC: [10.0],
          runMinus2TempC: [10.1],
          runMinus3TempC: [9.9],
          initCycleUtcHour: 12
        },
        {
          modelKey: "icon",
          family: "DWD",
          run0TempC: [10.1],
          runMinus1TempC: [10.1],
          runMinus2TempC: [10.0],
          runMinus3TempC: [10.1],
          initCycleUtcHour: 12
        }
      ]
    });

    expect(preserved.hysteresisDamped).toBe(false);
    expect(preserved.finalTempC).toBeCloseTo(11.8, 2);
    expect(preserved.stabilityGrade).toBe("LOCKED");
    expect(preserved.consecutiveRunLockCount).toBe(4);

    // Conversely, when 1 noisy model jumps R0 by +5°C (pushing raw consensus +1.5°C & candidate from 11.8 -> 13.3°C)
    // while ECMWF & UKMO stay locked at 10.0°C, v5.0 damps back toward yesterday's calibrated 11.8°C (NOT raw 10.0°C)!
    const damped = evaluateHourlyRunConsistency({
      leadHours: 48,
      validTimeIso: "2026-11-28T18:00",
      candidateTempC: 13.3,
      candidateIsWet: false,
      candidatePrecipMmHr: 0,
      candidatePopPct: 10,
      ensembleTempIqrC: 3.0,
      hourIndex: 0,
      laggedModels: [
        {
          modelKey: "ecmwfIfs",
          family: "ECMWF",
          run0TempC: [10.0],
          runMinus1TempC: [10.0],
          runMinus2TempC: [10.0],
          initCycleUtcHour: 12
        },
        {
          modelKey: "ukmo",
          family: "UKMO",
          run0TempC: [10.0],
          runMinus1TempC: [10.0],
          runMinus2TempC: [10.0],
          initCycleUtcHour: 12
        },
        {
          modelKey: "gfs",
          family: "NOAA",
          run0TempC: [15.4],
          runMinus1TempC: [10.0],
          runMinus2TempC: [10.0],
          initCycleUtcHour: 6
        }
      ]
    });

    expect(damped.hysteresisDamped).toBe(true);
    expect(damped.finalTempC).toBeGreaterThan(11.9);
    expect(damped.finalTempC).toBeLessThan(12.6);
  });

  it("Fix #2 & #3: Persistent State Ledger stores 96h station history, diurnal 24h residuals, intraday extremes & synoptic run locks", () => {
    const locKey = makeLedgerLocationKey(40.1885, 29.061);
    const nowMs = Date.parse("2026-11-26T18:00:00Z");

    // Record yesterday's residual (-24h) and today's dawn min (+2.1°C) + afternoon max (+15.4°C)
    recordTargetResidualToLedger({
      locKey,
      utcHourKey: "2026-11-25T18:00",
      localDateYmd: "2026-11-25",
      localHour: 21,
      observedAtMs: nowMs - 24 * 3600_000,
      observedTempC: 9.8,
      emosBaseTempC: 8.6,
      residualC: 1.2,
      regime: "OVA_INVERSION_CALM",
      precipMmHr: 0
    });
    recordTargetResidualToLedger({
      locKey,
      utcHourKey: "2026-11-26T03:00",
      localDateYmd: "2026-11-26",
      localHour: 6,
      observedAtMs: nowMs - 15 * 3600_000,
      observedTempC: 2.1,
      emosBaseTempC: 2.5,
      residualC: -0.4,
      regime: "OVA_INVERSION_CALM",
      precipMmHr: 0.4
    });
    recordTargetResidualToLedger(
      {
        locKey,
        utcHourKey: "2026-11-26T12:00",
        localDateYmd: "2026-11-26",
        localHour: 15,
        observedAtMs: nowMs - 6 * 3600_000,
        observedTempC: 15.4,
        emosBaseTempC: 14.9,
        residualC: 0.5,
        regime: "OVA_INVERSION_CALM",
        precipMmHr: 0.8
      },
      true
    );

    const r24 = getSameHour24hResidualFromLedger({
      locKey,
      targetUtcMs: nowMs,
      currentRegime: "OVA_INVERSION_CALM"
    });
    expect(r24).toBeCloseTo(1.2, 2);

    // Incompatible frontal shift (OVA_INVERSION_CALM -> LODOS_FOEHN) refuses stale 24h residual!
    const rIncompatible = getSameHour24hResidualFromLedger({
      locKey,
      targetUtcMs: nowMs,
      currentRegime: "LODOS_FOEHN"
    });
    expect(rIncompatible).toBeNull();

    const todayExt = getTodayObservedExtremesFromLedger(locKey, "2026-11-26");
    expect(todayExt.minTempC).toBeCloseTo(2.1, 2);
    expect(todayExt.maxTempC).toBeCloseTo(15.4, 2);
    expect(todayExt.precipSumMm).toBeCloseTo(1.2, 2);

    const cycPrev = computeSynopticCycleId(nowMs - 6 * 3600_000);
    const cycCur = computeSynopticCycleId(nowMs);
    saveCalibratedRunToLedger(locKey, {
      cycleId: cycPrev,
      createdAtMs: nowMs - 6 * 3600_000,
      regime: "OVA_INVERSION_CALM",
      hours: {
        "2026-11-28T12:00": { tempC: 14.2, isWet: true, precipMmHr: 2.1, popPct: 74 }
      }
    });
    const priors = getPriorCalibratedRunsFromLedger(locKey, cycCur);
    expect(priors).toHaveLength(1);
    expect(priors[0].hours["2026-11-28T12:00"].tempC).toBeCloseTo(14.2, 2);
  });

  it("Fix #4 & #11: Kalman MOS assimilates persistent Tier-1 Bursa MGM ledger observations over 47 km LTBR frost-basin", () => {
    const baseMs = Date.parse("2026-11-26T12:00:00Z");
    const utcTimeIndex = new Map<string, number>();
    const times: string[] = [];
    const ifsTemps: number[] = [];
    const iconTemps: number[] = [];

    for (let h = 0; h < 12; h++) {
      const ms = baseMs - (11 - h) * 3600_000;
      const uKey = new Date(ms).toISOString().slice(0, 16);
      times.push(uKey);
      utcTimeIndex.set(uKey, h);
      ifsTemps.push(10.0); // Exact match to Osmangazi 10.0°C!
      iconTemps.push(7.2); // Cold-biased by -2.8°C
      recordStationObservationsToLedger([
        {
          stationId: "WMO_17116",
          utcHourKey: uKey,
          observedAtMs: ms,
          lat: 40.2308,
          lon: 29.0133,
          elevationM: 100,
          tempC: 10.0,
          dewPointC: 5.0,
          pressureMslHpa: 1018,
          windSpeedKmh: 8,
          windDirDeg: 40,
          precipMmHr: 0,
          hasPrecip: false
        }
      ]);
    }

    const ledgerPts = getStationHistoryFromLedger(undefined, 48, baseMs);
    expect(ledgerPts.length).toBe(12);

    const mos = trainKalmanMos({
      network: [],
      cityElevationM: 100,
      cityLat: 40.2308,
      cityLon: 29.0133,
      envLapseRateCPerM: -0.006,
      modelHourlyUtc: {
        temperature_2m_ecmwf_ifs: ifsTemps,
        temperature_2m_icon_seamless: iconTemps
      },
      utcTimeIndex,
      nowUtcMs: baseMs,
      utcOffsetSeconds: 10800,
      ensembleMembers: 212,
      ledgerStationHistory: ledgerPts
    });

    expect(mos.active).toBe(true);
    expect(mos.report.matchedHours).toBe(12);
    expect(mos.report.winners.temperature).toBe("ecmwfIfs");
    expect(mos.biases.icon.tempKalmanBiasC).toBeLessThan(-1.8);
  });

  it("Fix #5: 3-Layer Piecewise Hydrostatic Profile & 19-District Microclimate differentiate Nilüfer, Kestel, Mudanya & Uludağ", () => {
    const mkObs = (id: string, elev: number, tempC: number, group: "BURSA_OVA" | "ULUDAG_MASSIF"): RawStationObservation => ({
      station: {
        id,
        name: id,
        lat: 40.18,
        lon: 29.08,
        elevationM: elev,
        zone: group === "BURSA_OVA" ? "urban_plain" : "mountain_slope",
        barrierGroup: group,
        tier: 1,
        urbanFraction: 0.7,
        coldPoolSusceptibility: 0.2
      },
      observedAtIso: "2026-11-26T21:00:00Z",
      tempC,
      dewPointC: 2,
      relHumidityPct: 70,
      pressureMslHpa: 1020,
      pressureStationHpa: null,
      windSpeedKt: 3,
      windGustKt: null,
      windDirDeg: 90,
      precip10MinMm: 0,
      precip1HrMm: 0,
      precip24HrMm: 0,
      visibilityM: 15000,
      snowDepthCm: null,
      isPrecipitating: false,
      hasTenthDegreePrecision: true,
      source: "MGM_10MIN"
    });

    // Shallow Ova radiation inversion (100m = 5.0°C, 600m mid-slope = 8.5°C, 1877m alpine = 2.0°C)
    const prof = computeLiveBursaVerticalProfile([
      mkObs("OSM_100", 100, 5.0, "BURSA_OVA"),
      mkObs("ORH_600", 600, 8.5, "ULUDAG_MASSIF"),
      mkObs("ULU_1877", 1877, 2.0, "ULUDAG_MASSIF")
    ]);

    expect(prof.lowerLapseCPerKm!).toBeGreaterThan(5.0); // Strong inversion in lower 0..550m!
    expect(prof.midLapseCPerKm!).toBeLessThan(-3.0); // Standard cooling above 550m!

    // Transporting from 100m to 450m warms (+), while transporting 600m -> 1800m cools (-)!
    expect(integratePiecewiseVerticalDeltaC(100, 450, prof)).toBeGreaterThan(1.5);
    expect(integratePiecewiseVerticalDeltaC(600, 1800, prof)).toBeLessThan(-4.0);

    // Clear calm night microclimate offsets relative to Osmangazi 17116 (10.0°C):
    const niluferOff = computeBursaDistrictMicroclimateOffsetC({
      targetLat: 40.2139,
      targetLon: 28.8628,
      targetElevationM: 105,
      base17116TempC: 10.0,
      localHour: 23,
      isNight: true,
      cloudCoverPct: 10,
      windSpeedKmh: 3,
      windDirDeg: 90
    });
    const kestelOff = computeBursaDistrictMicroclimateOffsetC({
      targetLat: 40.1945,
      targetLon: 29.2225,
      targetElevationM: 230,
      base17116TempC: 10.0,
      localHour: 23,
      isNight: true,
      cloudCoverPct: 10,
      windSpeedKmh: 3,
      windDirDeg: 90
    });
    const mudanyaWinterOff = computeBursaDistrictMicroclimateOffsetC({
      targetLat: 40.3752,
      targetLon: 28.8842,
      targetElevationM: 12,
      base17116TempC: 6.0,
      localHour: 2,
      isNight: true,
      cloudCoverPct: 20,
      windSpeedKmh: 12,
      windDirDeg: 20,
      marmaraSstC: 14.0
    });

    expect(niluferOff).toBeLessThan(-0.7);
    expect(kestelOff).toBeLessThan(-1.0);
    expect(mudanyaWinterOff).toBeGreaterThan(1.5); // Warmed by 14°C Marmara SST onshore flow!
  });

  it("Fix #6: Radar Nowcast calibrates G/R Fulton-Brandes bias with live MGM gauges, advects Poyraz NE->SW, and rescues shallow warm drizzle", () => {
    const w = 64;
    const h = 64;
    const prevRgba = new Uint8Array(w * h * 4);
    const currRgba = new Uint8Array(w * h * 4);

    // Stratiform 27 dBZ green echo directly over target (32, 32): RGBA(40, 185, 120, 255) -> ~1.7 mm/h Z-R
    for (let y = 26; y <= 38; y++) {
      for (let x = 26; x <= 38; x++) {
        const idx = (y * w + x) * 4;
        prevRgba[idx] = 40;
        prevRgba[idx + 1] = 185;
        prevRgba[idx + 2] = 120;
        prevRgba[idx + 3] = 255;
        currRgba[idx] = 40;
        currRgba[idx + 1] = 185;
        currRgba[idx + 2] = 120;
        currRgba[idx + 3] = 255;
      }
    }

    const gPrev = tileToDbzGrid(decodePngBufferToRgba(encodeTestRgbaPng(w, h, prevRgba))!);
    const gCurr = tileToDbzGrid(decodePngBufferToRgba(encodeTestRgbaPng(w, h, currRgba))!);

    // Live MGM gauges report heavier 4.5 mm/h Uludağ upslope rain -> G/R multiplier > 1.5x!
    const grCalibrated = runSemiLagrangianRadarNowcast({
      prevGrid: gPrev,
      currGrid: gCurr,
      width: w,
      height: h,
      targetPx: 32,
      targetPy: 32,
      metersPerPixel: 466,
      frameIntervalMin: 10,
      baseTimeMs: Date.parse("2026-11-26T18:00:00Z"),
      steering: {
        steeringWindFromDeg: 40, // Poyraz NE wind!
        steeringWindSpeedKt: 22,
        surfaceTempC: 9.0,
        surfaceDewPointC: 8.2,
        orographicUpslopeActive: true,
        liveGaugeRainMmHr: 4.5,
        liveGaugeCount: 5
      }
    });

    expect(grCalibrated.gaugeRadarMultiplier!).toBeGreaterThan(1.35);
    expect(grCalibrated.currentRainRateMmHr).toBeGreaterThan(1.2);

    // Shallow drizzle below radar beam: empty radar grid (0 dBZ), but MGM gauges measure 0.85 mm/h!
    const emptyGrid = new Float32Array(w * h);
    const rescued = runSemiLagrangianRadarNowcast({
      prevGrid: emptyGrid,
      currGrid: emptyGrid,
      width: w,
      height: h,
      targetPx: 32,
      targetPy: 32,
      metersPerPixel: 466,
      frameIntervalMin: 10,
      baseTimeMs: Date.parse("2026-11-26T18:00:00Z"),
      steering: {
        steeringWindFromDeg: 35,
        steeringWindSpeedKt: 15,
        surfaceTempC: 8.0,
        surfaceDewPointC: 7.6,
        orographicUpslopeActive: true,
        liveGaugeRainMmHr: 0.85,
        liveGaugeCount: 4
      }
    });
    expect(rescued.currentRainRateMmHr).toBeCloseTo(0.85, 1);
    expect(rescued.summaryCode).toBe("RAIN_ACTIVE");
  });

  it("Fix #7, #8, #9: 17,472h 8-Horizon (d0..d7) Bursa EMOS+GBDT, AIFS model ID fix, Day-6 ICON/UKMO trees & 212-Member Bimodal Cluster Solver", () => {
    // Verify AIFS deterministic Open-Meteo ID fix & JMA registry entry
    expect(ATMOS_V4_MODEL_REGISTRY.ecmwfAifs.openMeteoModelId).toBe("ecmwf_aifs025_single");
    expect(ATMOS_V4_MODEL_REGISTRY.jmaGlobal.openMeteoModelId).toBe("jma_seamless");

    // Verify Day 6 (156h = 7th forecast day) uses ICON + UKMO + JMA + physical predictors!
    const day6Temp = predictBursaTrainedTempC({
      leadHours: 156,
      utcDate: new Date("2026-12-03T12:00:00Z"),
      localHourTrt: 15,
      tempSnapshot: {
        ecmwfIfs: 12.2,
        ecmwfAifs: 11.8,
        icon: 12.5,
        ukmo: 12.0,
        meteofrance: null,
        gfs: 13.0,
        gem: 12.4,
        jma: 12.1
      },
      precipSnapshot: {
        ecmwfIfs: 0,
        ecmwfAifs: 0,
        icon: 0,
        ukmo: 0,
        meteofrance: null,
        gfs: 0,
        gem: 0,
        jma: 0
      },
      neighborMedians: {
        minus3h: 10.2,
        minus2h: 11.0,
        minus1h: 11.7,
        plus1h: 11.9,
        plus2h: 11.2,
        plus3h: 10.4,
        min24h: 6.8,
        max24h: 12.6
      },
      physicalDrivers: {
        dewPointC: 5.5,
        cloudCoverPct: 30,
        windSpeedKmh: 12,
        windDirDeg: 40,
        pressureMslHpa: 1020,
        pressureDelta3hHpa: 0.4,
        shortwaveRadiationWm2: 410
      },
      targetElevationM: 100
    });
    expect(day6Temp).not.toBeNull();
    expect(day6Temp!).toBeGreaterThan(11.4);
    expect(day6Temp!).toBeLessThan(13.8);

    // Verify Day 6 +/-2h window rescues frontal rain shifted by 2 hours!
    const shiftedFrontRain = predictBursaTrainedPrecip({
      leadHours: 150,
      precipSnapshot: {
        ecmwfIfs: 0.25,
        ecmwfAifs: 0.35,
        icon: 0.40,
        ukmo: 0.20,
        meteofrance: null,
        gfs: 0.15,
        gem: 0.30,
        jma: 0.25
      },
      windowPrecipMediansMm: [0.3, 1.8, 2.4, 0.9, 0.3],
      windowMaxWetFrac: 0.86,
      ensemblePopPct: 68,
      physicalDrivers: {
        dewPointC: 8.5,
        cloudCoverPct: 95,
        windSpeedKmh: 22,
        windDirDeg: 35,
        pressureDelta3hHpa: -2.4
      },
      temp2mC: 9.2
    });
    expect(shiftedFrontRain.isWet).toBe(true);
    expect(shiftedFrontRain.qpfMmHr).toBeGreaterThan(1.2);

    // Verify 212-Member Bimodal Frontal Bifurcation Solver (140 cold Karayel members @ +6°C vs 72 warm Lodos members @ +16°C)
    const members: number[] = [];
    const weights: number[] = [];
    for (let i = 0; i < 140; i++) {
      members.push(6.0 + ((i % 7) - 3) * 0.25);
      weights.push(1.4); // Dominant AIFS + IFS cold-front cluster!
    }
    for (let i = 0; i < 72; i++) {
      members.push(16.0 + ((i % 5) - 2) * 0.3);
      weights.push(0.75); // Lagging minority warm cluster
    }

    // Naive mean/EMOS sits in unphysical middle (~9.8°C); bimodal solver locks onto the dominant cold cluster (~6..8°C)!
    const bimodal = resolveBimodalEnsembleCluster({
      leadHours: 120,
      emosTempC: 9.8,
      ensembleMembersC: members,
      ensembleWeights: weights,
      dProgDtTrendC: -1.1
    });
    expect(bimodal.isBimodal).toBe(true);
    expect(bimodal.separationC).toBeGreaterThan(8.5);
    expect(bimodal.adjustedTempC).toBeLessThan(8.5);

    // Verify PM-QM temporal window + MGM official wet nudge on Day 5
    const pmqmDay5 = fusePrecipitationPmqm({
      leadHours: 120,
      regime: "POYRAZ_KARAYEL_ADV",
      modelPrecipMm: [
        { modelKey: "ecmwfIfs", precipMmHr: 0.45, weight: 0.35 },
        { modelKey: "ecmwfAifs", precipMmHr: 0.55, weight: 0.35 },
        { modelKey: "dwdIconEu", precipMmHr: 0.15, weight: 0.15 },
        { modelKey: "noaaGfs", precipMmHr: 0.0, weight: 0.15 }
      ],
      temporalWindowPopPct: 78,
      mgmOfficialWet: true,
      ensemblePopPct: 58,
      temp2mC: 8.5,
      relHumidityPct: 88,
      targetElevationM: 155
    });
    expect(pmqmDay5.isWetHour).toBe(true);
    expect(pmqmDay5.calibratedPopPct).toBeGreaterThanOrEqual(55);
  });
});
