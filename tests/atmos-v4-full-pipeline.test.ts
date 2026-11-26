import zlib from 'node:zlib';
import { describe, expect, it } from 'vitest';
import {
  predictBursaTrainedPrecip,
  predictBursaTrainedTempC,
} from '../lib/bursa-trained-emos';
import {
  classifyHydrometeorPhaseV4,
  fusePrecipitationPmqm,
} from '../lib/emos-precip-fusion';
import {
  blendNowcastWithHourlyNwp,
  decodePngBufferToRgba,
  runSemiLagrangianRadarNowcast,
  tileToDbzGrid,
} from '../lib/radar-nowcast';
import {
  evaluateHourlyRunConsistency,
  summarizeForecastStability,
} from '../lib/run-consistency';
import {
  diagnosePhysicalVisibilityM,
  solveVerticalColumnPhysics,
} from '../lib/vertical-physics';

/** Helper: encodes an uncompressed/zlib RGBA buffer into a valid 8-bit RGBA PNG for testing */
function encodeTestRgbaPng(width: number, height: number, rgba: Uint8Array): Uint8Array {
  const stride = width * 4;
  const rawScanlines = new Uint8Array(height * (1 + stride));
  for (let y = 0; y < height; y++) {
    rawScanlines[y * (1 + stride)] = 0; // Filter type 0 (None)
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
    dv.setUint32(8 + data.length, 0, false); // CRC ignored by decoder
    chunks.push(buf);
  };

  const ihdr = new Uint8Array(13);
  const idv = new DataView(ihdr.buffer);
  idv.setUint32(0, width, false);
  idv.setUint32(4, height, false);
  ihdr[8] = 8; // 8-bit
  ihdr[9] = 6; // RGBA
  pushChunk('IHDR', ihdr);
  pushChunk('IDAT', new Uint8Array(compressed));
  pushChunk('IEND', new Uint8Array(0));

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

describe('ATMOS v4.5 — Full Pipeline Verification (Steps 3, 4, 5, 6, 7, 8)', () => {
  it('Step 3: models Lodos dry-adiabatic Foehn warming & evaporates phantom sub-cloud virga', () => {
    const res = solveVerticalColumnPhysics({
      targetElevationM: 155,
      rawModelTemp2mC: 17.5,
      rawModelDew2mC: 5.0, // 12.5°C spread -> LCL ~ 1,562 m (dry sub-cloud layer!)
      rawModelPrecipMmHr: 0.35, // Weak stratiform NWP echo that evaporates as virga
      rawModelVisibilityM: null, // Simulates post-30 Nov 2026 DWD ICON missing visibility
      cloudCoverLowPct: 20,
      shortwaveRadiationWm2: 320,
      isNight: false,
      windwardSouthRh850Pct: 92,
      levels: [
        { pressureHpa: 1000, geopotentialHeightM: 110, tempC: 18.0, relHumidityPct: 42, windSpeedKt: 16, windDirDeg: 210 },
        { pressureHpa: 925, geopotentialHeightM: 790, tempC: 13.5, relHumidityPct: 45, windSpeedKt: 26, windDirDeg: 215 },
        { pressureHpa: 850, geopotentialHeightM: 1490, tempC: 8.5, relHumidityPct: 58, windSpeedKt: 34, windDirDeg: 212 },
        { pressureHpa: 700, geopotentialHeightM: 3060, tempC: -1.0, relHumidityPct: 70, windSpeedKt: 42, windDirDeg: 220 },
      ],
    });

    expect(res.activeMechanism).toBe('LODOS_DRY_FOEHN');
    expect(res.tempDeltaC).toBeGreaterThan(0.8);
    expect(res.correctedPrecipMmHr).toBe(0); // Phantom 0.35 mm/h evaporated as virga!
    expect(res.diagnosedVisibilityM).toBeGreaterThan(15000);
  });

  it('Step 3b: diagnoses physical radiation fog visibility when DWD ICON visibility is null', () => {
    const fogVis = diagnosePhysicalVisibilityM({
      rawVisibilityM: null,
      temp2mC: 3.2,
      dewPoint2mC: 3.0,
      cloudCoverLowPct: 95,
      precipMmHr: 0,
      windSpeedKt: 2,
    });
    expect(fogVis).toBeLessThan(1000);
  });

  it('Step 4: decodes PNG radar tiles, tracks optical flow, and predicts exact rain onset minute', () => {
    const w = 64;
    const h = 64;
    const prevRgba = new Uint8Array(w * h * 4);
    const currRgba = new Uint8Array(w * h * 4);

    // Paint a heavy convective rain band (Red RGBA: 220, 40, 30, 255 => ~51 dBZ)
    // At t=-10 min, centered at x=18..24; at t=0, moved East (+4 px) to x=22..28 toward target x=36!
    const paintBand = (buf: Uint8Array, xStart: number, xEnd: number) => {
      for (let y = 24; y <= 40; y++) {
        for (let x = xStart; x <= xEnd; x++) {
          const idx = (y * w + x) * 4;
          buf[idx] = 220;
          buf[idx + 1] = 40;
          buf[idx + 2] = 30;
          buf[idx + 3] = 255;
        }
      }
    };
    paintBand(prevRgba, 18, 24);
    paintBand(currRgba, 22, 28);

    const pngPrev = encodeTestRgbaPng(w, h, prevRgba);
    const pngCurr = encodeTestRgbaPng(w, h, currRgba);
    const decPrev = decodePngBufferToRgba(pngPrev);
    const decCurr = decodePngBufferToRgba(pngCurr);

    expect(decPrev).not.toBeNull();
    expect(decCurr).not.toBeNull();

    const nowcast = runSemiLagrangianRadarNowcast({
      prevGrid: tileToDbzGrid(decPrev!),
      currGrid: tileToDbzGrid(decCurr!),
      width: w,
      height: h,
      targetPx: 36,
      targetPy: 32,
      metersPerPixel: 1200,
      frameIntervalMin: 10,
      baseTimeMs: Date.parse('2026-11-26T14:00:00Z'),
      steering: {
        steeringWindFromDeg: 270, // From West -> moving East (+x)
        steeringWindSpeedKt: 28,
        surfaceTempC: 12,
        surfaceDewPointC: 9,
      },
    });

    expect(nowcast.summaryCode).toBe('RAIN_APPROACHING');
    expect(nowcast.nextRainOnsetMinutes).not.toBeNull();
    expect(nowcast.nextRainOnsetMinutes!).toBeGreaterThanOrEqual(15);
    expect(nowcast.nextRainOnsetMinutes!).toBeLessThanOrEqual(35);

    const blended = blendNowcastWithHourlyNwp(nowcast, [0, 0.2, 0.5, 1.2]);
    expect(blended[0]).toBeGreaterThan(1.0); // Radar captures incoming squall that NWP missed at H0!
  });

  it('Step 6: suppresses multi-model drizzle bias while preserving convective downpour peaks via PM-QM', () => {
    const drizzleCase = fusePrecipitationPmqm({
      leadHours: 18,
      regime: 'LODOS_FOEHN',
      modelPrecipMm: [
        { modelKey: 'ecmwfIfs', precipMmHr: 0.0, weight: 0.30 },
        { modelKey: 'dwdIconEu', precipMmHr: 0.0, weight: 0.30 },
        { modelKey: 'noaaGfs', precipMmHr: 0.25, weight: 0.20 },
        { modelKey: 'cmcGem', precipMmHr: 0.20, weight: 0.20 },
      ],
      ensemblePopPct: 22,
      temp2mC: 19,
      relHumidityPct: 48,
      targetElevationM: 155,
    });
    expect(drizzleCase.isWetHour).toBe(false);
    expect(drizzleCase.qpfMmHr).toBe(0);
    expect(drizzleCase.drizzleSuppressed).toBe(true);

    const squallCase = fusePrecipitationPmqm({
      leadHours: 12,
      regime: 'POYRAZ_KARAYEL_ADV',
      modelPrecipMm: [
        { modelKey: 'dwdIconEu', precipMmHr: 14.2, weight: 0.30 },
        { modelKey: 'ecmwfIfs', precipMmHr: 11.8, weight: 0.30 },
        { modelKey: 'meteofranceArpege', precipMmHr: 13.0, weight: 0.20 },
        { modelKey: 'noaaGfs', precipMmHr: 4.5, weight: 0.20 },
      ],
      spatialNeighborhoodMm: [9.5, 12.4, 15.8, 13.2, 11.0],
      ensemblePopPct: 88,
      temp2mC: 9.5,
      relHumidityPct: 91,
      targetElevationM: 155,
    });
    expect(squallCase.isWetHour).toBe(true);
    expect(squallCase.qpfMmHr).toBeGreaterThan(11.5); // Preserves convective core instead of GFS dilution!

    const freezingRainCheck = classifyHydrometeorPhaseV4({
      isWetHour: true,
      qpfMmHr: 2.4,
      temp2mC: -0.8,
      relHumidityPct: 92,
      targetElevationM: 155,
      temp850C: 2.5, // Warm melting layer aloft over sub-freezing Bursa Ova!
    });
    expect(freezingRainCheck.phase).toBe('freezing_rain');
  });

  it('Step 7: vetoes T+0 spin-up shocks and blocks unconfirmed single-run 06Z flip-flops', () => {
    // A. Spin-up veto at T+0h: NWP says 11.0°C & raining, but Bursa 17116 thermometer is 14.2°C & radar is dry!
    const spinUp = evaluateHourlyRunConsistency({
      leadHours: 0,
      validTimeIso: '2026-11-26T15:00',
      candidateTempC: 11.0,
      candidateIsWet: true,
      candidatePrecipMmHr: 1.8,
      candidatePopPct: 70,
      hourIndex: 0,
      laggedModels: [],
      liveAnchor: {
        liveObsTempC: 14.2,
        liveRadarRainMmHr: 0,
      },
    });
    expect(spinUp.spinUpVetoApplied).toBe(true);
    expect(spinUp.finalTempC).toBeGreaterThan(13.8);
    expect(spinUp.finalIsWet).toBe(false);
    expect(spinUp.finalPrecipMmHr).toBe(0);

    // B. Noisy 06Z outlier jump at T+30h: locked forecast was 13.0°C across 3 prior runs,
    // single model jumps candidate to 15.2°C while ECMWF & DWD stay at ~13.1°C!
    const flipFlopBlocked = evaluateHourlyRunConsistency({
      leadHours: 30,
      validTimeIso: '2026-11-27T21:00',
      candidateTempC: 15.2,
      candidateIsWet: false,
      candidatePrecipMmHr: 0,
      candidatePopPct: 15,
      previousLockedTempC: 13.0,
      ensembleTempIqrC: 3.1,
      hourIndex: 0,
      laggedModels: [
        {
          modelKey: 'ecmwfIfs',
          family: 'ECMWF',
          run0TempC: [13.2],
          runMinus1TempC: [13.0],
          runMinus2TempC: [13.1],
          runMinus3TempC: [12.9],
          initCycleUtcHour: 12,
        },
        {
          modelKey: 'dwdIconEu',
          family: 'DWD',
          run0TempC: [13.1],
          runMinus1TempC: [13.0],
          runMinus2TempC: [13.0],
          runMinus3TempC: [13.1],
          initCycleUtcHour: 12,
        },
      ],
    });

    expect(flipFlopBlocked.hysteresisDamped).toBe(true);
    // Damped from 15.2°C back down to ~13.6°C!
    expect(flipFlopBlocked.finalTempC).toBeLessThan(13.8);

    const badge = summarizeForecastStability([flipFlopBlocked], 'Uludağ Lodos Fönü');
    expect(badge.blockedNoisyRevisionsCount).toBe(1);
    expect(badge.badgeLabelTr).toContain('Uludağ Lodos Fönü');
  });

  it('Step 8: 8,712h WMO-17116 Bursa Trained EMOS corrects AIFS sawtooth, evening UHI dip & AR(2) live lock', () => {
    const drySnap = {
      ecmwfIfs: 0,
      ecmwfAifs: 0,
      icon: 0,
      ukmo: 0,
      meteofrance: 0,
      gfs: 0,
      gem: 0,
    };

    // Sunset / early evening in Bursa (18:00 TRT = 15:00 UTC): AIFS & IFS dip cold (-1.7°C / -1.0°C)
    // due to Uludağ coarse-grid radiation, whereas Osmangazi UHI retains warmth (~12.4°C).
    const tempSnapEvening = {
      ecmwfIfs: 10.6,
      ecmwfAifs: 9.8,
      icon: 11.2,
      ukmo: 11.8,
      meteofrance: 11.7,
      gfs: 12.1,
      gem: 11.6,
    };

    const baseEmos = predictBursaTrainedTempC({
      leadHours: 0,
      utcDate: new Date('2026-11-26T15:00:00Z'),
      localHourTrt: 18,
      tempSnapshot: tempSnapEvening,
      precipSnapshot: drySnap,
      neighborMedians: {
        minus3h: 13.8,
        minus1h: 12.1,
        plus1h: 10.9,
        plus3h: 9.8,
        min24h: 7.5,
        max24h: 14.6,
      },
      targetElevationM: 100,
    });

    expect(baseEmos).not.toBeNull();
    // Trained EMOS refuses AIFS 9.8°C cold sawtooth and lifts evening prediction toward UHI truth!
    expect(baseEmos!).toBeGreaterThan(11.1);

    // Live AR(2) lock at +0h and +2h when live Osmangazi MGM thermometer reads +1.4°C warmer:
    const lockedT0 = predictBursaTrainedTempC({
      leadHours: 0,
      utcDate: new Date('2026-11-26T15:00:00Z'),
      localHourTrt: 18,
      tempSnapshot: tempSnapEvening,
      precipSnapshot: drySnap,
      neighborMedians: {
        minus3h: 13.8,
        minus1h: 12.1,
        plus1h: 10.9,
        plus3h: 9.8,
        min24h: 7.5,
        max24h: 14.6,
      },
      targetElevationM: 100,
      liveOriginResidualC: 1.4,
    });
    expect(lockedT0!).toBeCloseTo(baseEmos! + 1.4, 1);

    // Day 7 fallback (only 4 global models active, meteofrance=null) extrapolates smoothly via Huber-Ridge:
    const day7Pred = predictBursaTrainedTempC({
      leadHours: 156,
      utcDate: new Date('2026-12-03T09:00:00Z'),
      localHourTrt: 12,
      tempSnapshot: {
        ecmwfIfs: 14.0,
        ecmwfAifs: 12.8,
        icon: null,
        ukmo: null,
        meteofrance: null,
        gfs: 15.2,
        gem: 14.5,
      },
      precipSnapshot: drySnap,
      neighborMedians: {
        minus3h: 11.2,
        minus1h: 13.4,
        plus1h: 14.8,
        plus3h: 14.2,
        min24h: 8.0,
        max24h: 15.2,
      },
      targetElevationM: 155,
      lapseRateCPerKm: -6.0,
    });
    expect(day7Pred).not.toBeNull();
    expect(day7Pred!).toBeGreaterThan(13.2);
    expect(day7Pred!).toBeLessThan(16.2);

    // Bursa 17116 trained precipitation classifier:
    const falseDrizzle = predictBursaTrainedPrecip({
      leadHours: 12,
      precipSnapshot: {
        ecmwfIfs: 0,
        ecmwfAifs: 0,
        icon: 0,
        ukmo: 0.1,
        meteofrance: 0,
        gfs: 0.2,
        gem: 0.1,
      },
      ensemblePopPct: 18,
    });
    expect(falseDrizzle.isWet).toBe(false);
    expect(falseDrizzle.qpfMmHr).toBe(0);

    const realFrontalRain = predictBursaTrainedPrecip({
      leadHours: 18,
      precipSnapshot: {
        ecmwfIfs: 3.4,
        ecmwfAifs: 2.8,
        icon: 4.6,
        ukmo: 3.1,
        meteofrance: 4.9,
        gfs: 2.2,
        gem: 3.0,
      },
      ensemblePopPct: 84,
    });
    expect(realFrontalRain.isWet).toBe(true);
    expect(realFrontalRain.qpfMmHr).toBeGreaterThan(3.0);
  });
});