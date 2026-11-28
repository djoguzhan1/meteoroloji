/**
 * ATMOS v5.0 — Extended Synoptic (Days 8–15) & Subseasonal (Days 16–30) Calibration Engine
 * File: lib/extended-horizon.ts
 *
 * Extends forecast predictability beyond 7 days WITHOUT sacrificing Days 1–7 (<1°C) accuracy
 * and WITHOUT presenting fake deterministic hour-by-hour precision in the chaotic tail:
 *  1. WMO 1991–2020 Bursa `17116` (100 m) + Global Latitude/Elevation Harmonic Climatology Normals.
 *  2. Days 8–15 (`+168h .. +360h`) Chaos-Damped Synoptic Calibrator:
 *     - Dynamic Active-Model Renormalization as regional/medium-range models reach their native cutoffs
 *       (AROME +114h, UKMO +168h, ICON +192h, GEM +252h, JMA +270h -> ECMWF AIFS + IFS lead).
 *     - Lead-Dependent Ensemble Dominance Ramp (`w_ens`: 0.42 at +168h -> 0.78 at +360h) over 154–172
 *       live AI+Physics ensemble members (`51 AIFS-ENS + 51 IFS-ENS + 31 GEFS + 21 GEPS + 18 MOGREPS-G`).
 *     - Ashman-D Bimodal Frontal Split Detection + Climatological Variance Shrinkage (`0% -> 12%`).
 *     - `±6h` Windowed Synoptic Precipitation Probability & PM-QM Quantile Mapping.
 *  3. Days 16–30 (`52`-Member `NOAA GEFSv12 + ECCC GEPS`) Subseasonal Probabilistic Regime Engine:
 *     - Seamless Bias Stitching against calibrated Days 1–7 (`daily[0..6]`) to eliminate coarse-grid
 *       orographic step-jumps at Day 15 -> Day 16.
 *     - Produces P10/P25/P50/P75/P90 corridors, climate anomalies (`ΔNorm`), and Week 3 & Week 4 summaries.
 */

import {
  computeCalibratedWeightedSpread,
  computeIntrinsicAccuracyIndex
} from "./accuracy-index";
import { ATMOS_HTTP_USER_AGENT, isWithinBursaDomain } from "./bursa-mesh";
import {
  type BimodalEnsembleClusterResult,
  resolveBimodalEnsembleCluster
} from "./bursa-trained-emos";
import type { KalmanMosModel } from "./kalman-mos";
import {
  CORE_MODEL_KEYS,
  EXTENDED_SYNOPTIC_PRIOR_WEIGHTS
} from "./model-registry";
import { quantileSorted } from "./precip-engine";
import { formatTempDelta } from "./weather-client";
import type {
  DailyBimodalSplit,
  DailyPoint,
  HybridModelSnapshot,
  PrecipitationConsensus,
  SubseasonalDayPoint,
  SubseasonalOutlookBundle,
  SubseasonalWeekSummary,
  UnitSystem
} from "./weather-types";

const MONTH_NAMES_SHORT_TR = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara"
] as const;

const DAY_NAMES_TR = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"] as const;

// Official WMO 17116 (Bursa Osmangazi, 100 m, 1991–2020) monthly normals (Jan..Dec)
const BURSA_17116_TMAX_NORMALS_C = [
  9.6, 11.4, 14.7, 19.6, 24.6, 29.2, 31.8, 31.8, 27.6, 21.8, 15.9, 11.2
] as const;
const BURSA_17116_TMIN_NORMALS_C = [
  1.9, 2.7, 4.7, 8.4, 12.7, 16.8, 19.3, 19.4, 15.6, 11.4, 6.5, 3.4
] as const;
const MID_MONTH_DOY = [15, 45, 74, 105, 135, 166, 196, 227, 258, 288, 319, 349] as const;

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function dayOfYearFromYmd(dateYmd: string): number {
  const ms = Date.parse(`${dateYmd}T12:00:00Z`);
  if (!Number.isFinite(ms)) return 180;
  const d = new Date(ms);
  const startMs = Date.UTC(d.getUTCFullYear(), 0, 1, 12, 0, 0);
  return clamp(Math.round((ms - startMs) / 86_400_000) + 1, 1, 366);
}

function interpolateCyclicMonthly(monthly: readonly number[], doy: number): number {
  const wrappedDoy = (((doy - 1) % 365) + 365) % 365 + 1;
  let hiIdx = 0;
  while (hiIdx < 12 && MID_MONTH_DOY[hiIdx] < wrappedDoy) {
    hiIdx++;
  }
  const idxB = hiIdx % 12;
  const idxA = (idxB + 11) % 12;

  const doyA = MID_MONTH_DOY[idxA];
  let doyB = MID_MONTH_DOY[idxB];
  let probe = wrappedDoy;
  if (doyB <= doyA) {
    doyB += 365;
    if (probe < doyA) probe += 365;
  }

  const linFrac = clamp((probe - doyA) / Math.max(1, doyB - doyA), 0, 1);
  // Smooth cosine C1 interpolation across months
  const cosFrac = 0.5 * (1 - Math.cos(Math.PI * linFrac));
  return monthly[idxA] * (1 - cosFrac) + monthly[idxB] * cosFrac;
}

export interface DailyClimatologyNormal {
  normalMaxC: number;
  normalMinC: number;
  normalMeanC: number;
}

/**
 * Computes daily climatological normal (`normalMaxC`, `normalMinC`, `normalMeanC`) for any date:
 *  - Within Bursa domain: exact WMO 17116 (100 m) 1991–2020 normals + orographic lapse-rate transport.
 *  - Global locations: latitude, hemisphere phase, and elevation-adjusted harmonic seasonal curve.
 */
export function computeDailyClimatologyNormals(params: {
  lat: number;
  lon: number;
  elevationM?: number;
  dateYmd: string;
}): DailyClimatologyNormal {
  const doy = dayOfYearFromYmd(params.dateYmd);
  const elevM = Number.isFinite(params.elevationM) ? (params.elevationM as number) : 100;

  if (isWithinBursaDomain(params.lat, params.lon)) {
    const baseMax100 = interpolateCyclicMonthly(BURSA_17116_TMAX_NORMALS_C, doy);
    const baseMin100 = interpolateCyclicMonthly(BURSA_17116_TMIN_NORMALS_C, doy);
    const dzKm = (elevM - 100) / 1000;
    const normalMaxC = Number((baseMax100 - 6.0 * dzKm).toFixed(1));
    const normalMinC = Number((baseMin100 - 5.1 * dzKm).toFixed(1));
    return {
      normalMaxC,
      normalMinC,
      normalMeanC: Number(((normalMaxC + normalMinC) * 0.5).toFixed(1))
    };
  }

  const absLat = Math.abs(params.lat);
  const peakSummerDoy = params.lat >= 0 ? 202 : 20; // ~July 21 NH, ~Jan 20 SH
  const seasonalPhase = Math.cos(((2 * Math.PI) / 365.25) * (doy - peakSummerDoy));

  // Sea-level annual mean & seasonal amplitude by latitude
  const seaLevelAnnualMean = 28.5 - 0.52 * absLat;
  const seasonalAmp = clamp(1.8 + 0.24 * absLat, 2.0, 15.5);
  const diurnalHalfSpan = clamp(5.2 - 0.03 * absLat, 3.2, 6.2);
  const lapseShift = -6.0 * (elevM / 1000);

  const meanC = seaLevelAnnualMean + seasonalAmp * seasonalPhase + lapseShift;
  const normalMaxC = Number((meanC + diurnalHalfSpan).toFixed(1));
  const normalMinC = Number((meanC - diurnalHalfSpan).toFixed(1));
  return {
    normalMaxC,
    normalMinC,
    normalMeanC: Number(meanC.toFixed(1))
  };
}

function diurnalClimatologyAtHour(
  normal: DailyClimatologyNormal,
  localHour: number
): number {
  // Minimum near 05:00 local, maximum near 15:00 local
  const h = ((localHour % 24) + 24) % 24;
  const wave = 0.5 * (1 - Math.cos(((h - 5) / 24) * 2 * Math.PI));
  return normal.normalMinC + (normal.normalMaxC - normal.normalMinC) * wave;
}

function weightedQuantilePairs(
  sorted: Array<{ v: number; w: number }>,
  q: number
): number {
  if (sorted.length === 0) return 0;
  const totalW = sorted.reduce((acc, p) => acc + p.w, 0);
  if (totalW <= 0) return sorted[Math.floor(sorted.length * q)]?.v ?? 0;
  const target = clamp(q, 0, 1) * totalW;
  let cum = 0;
  for (const item of sorted) {
    cum += item.w;
    if (cum >= target) return item.v;
  }
  return sorted[sorted.length - 1].v;
}

export interface ExtendedSynopticHourInput {
  leadHour: number;
  localHour: number;
  dateYmd: string;
  lat: number;
  lon: number;
  elevationM: number;
  tempSnapshot: HybridModelSnapshot;
  dewSnapshot: HybridModelSnapshot;
  pressSnapshot: HybridModelSnapshot;
  windSnapshot: HybridModelSnapshot;
  precipSnapshot: HybridModelSnapshot;
  mos: KalmanMosModel;
  bursaEmosCandidateC: number | null;
  ensembleTempRow: { values: number[]; weights: number[] } | null;
  ensemblePrecipValues: number[] | null;
  windowEnsembleWetProbsPct: number[];
  dProgDtTrendC: number;
  rawFallback: {
    tempC: number;
    dewC: number;
    pressHpa: number;
    windKmh: number;
    precipMm: number;
    popPct: number;
  };
}

export interface ExtendedSynopticHourOutput {
  temperatureC: number;
  tempP10C?: number;
  tempP90C?: number;
  dewPointC: number;
  pressureHpa: number;
  windSpeedKmh: number;
  precipitationMm: number;
  precipProbabilityPct: number;
  precipConsensus: PrecipitationConsensus;
  activeModelCount: number;
  ensembleMemberCount: number;
  confidencePct: number;
  bimodal: BimodalEnsembleClusterResult | null;
}

/**
 * Calibrates a single forecast hour in the Extended Synoptic Horizon (`+168h .. +360h`, Days 8–15):
 *  - Dynamically renormalizes weights across ONLY models that still emit non-null values at `leadHour`
 *  - Ramps AI+Physics Ensemble weight from `42%` (`+168h`) up to `78%` (`+360h`)
 *  - Preserves local Bursa/Kalman station-orographic bias without amplifying chaotic single-run drift
 *  - Applies gentle climatological shrinkage (`0% -> 12%`) and `±6h` windowed precipitation mapping.
 */
export function calibrateExtendedSynopticHour(
  input: ExtendedSynopticHourInput
): ExtendedSynopticHourOutput {
  const { leadHour, localHour } = input;
  const bin = clamp(Math.floor((((localHour % 24) + 24) % 24) / 6), 0, 3);
  const persistDecay = Math.exp(-Math.max(0, leadHour) / 96);
  const diurnalDecay = Math.exp(-Math.max(0, leadHour) / 120);

  const fuseDynamicScalar = (
    snap: HybridModelSnapshot,
    domain: "temperature" | "pressure" | "wind",
    fallback: number,
    isDew = false
  ): { corrected: number; rawMean: number; count: number } => {
    const priors = EXTENDED_SYNOPTIC_PRIOR_WEIGHTS[domain];
    let corrNum = 0;
    let rawNum = 0;
    let wDen = 0;
    let count = 0;

    for (const k of CORE_MODEL_KEYS) {
      const val = snap[k];
      if (val === null || val === undefined || !Number.isFinite(val)) continue;
      // Even if a regional model happens to still emit near its boundary, give at least small positive weight
      const baseW = Math.max(0.03, priors[k] ?? 0.05);
      const biasProfile = input.mos.biases[k];
      let corr = val;
      if (isDew) {
        corr = val - biasProfile.dewKalmanBiasC * Math.exp(-leadHour / 48);
      } else if (domain === "temperature") {
        corr =
          val -
          (biasProfile.tempPersistentBiasC * persistDecay +
            0.55 * biasProfile.tempDiurnalBiasC[bin] * diurnalDecay);
      } else if (domain === "pressure") {
        corr = val - biasProfile.pressKalmanBiasHpa * Math.exp(-leadHour / 36);
      } else if (domain === "wind") {
        corr = Math.max(0, val - biasProfile.windKalmanBiasKmh * Math.exp(-leadHour / 24));
      }

      corrNum += corr * baseW;
      rawNum += val * baseW;
      wDen += baseW;
      count++;
    }

    if (wDen <= 0 || count === 0) {
      return { corrected: fallback, rawMean: fallback, count: 0 };
    }
    return {
      corrected: corrNum / wDen,
      rawMean: rawNum / wDen,
      count
    };
  };

  const detTemp = fuseDynamicScalar(
    input.tempSnapshot,
    "temperature",
    input.rawFallback.tempC
  );
  const detDew = fuseDynamicScalar(
    input.dewSnapshot,
    "temperature",
    input.rawFallback.dewC,
    true
  );
  const detPress = fuseDynamicScalar(
    input.pressSnapshot,
    "pressure",
    input.rawFallback.pressHpa
  );
  const detWind = fuseDynamicScalar(
    input.windSnapshot,
    "wind",
    input.rawFallback.windKmh
  );

  // Blend Bursa EMOS topographic/diurnal backbone with dynamically renormalized active-model consensus
  // (As GEM/JMA drop out past +252h, dynamic renormalization prevents stale median-imputation weight!)
  const bursaBackboneBlend =
    input.bursaEmosCandidateC !== null && Number.isFinite(input.bursaEmosCandidateC)
      ? leadHour <= 240
        ? 0.65 * input.bursaEmosCandidateC + 0.35 * detTemp.corrected
        : 0.45 * input.bursaEmosCandidateC + 0.55 * detTemp.corrected
      : detTemp.corrected;

  const localBiasShiftC = clamp(bursaBackboneBlend - detTemp.rawMean, -3.8, 3.8);

  let tempP10C: number | undefined;
  let tempP90C: number | undefined;
  let bimodalResult: BimodalEnsembleClusterResult | null = null;
  let ensMemberCount = 0;

  let candidateTempC = bursaBackboneBlend;

  if (input.ensembleTempRow && input.ensembleTempRow.values.length >= 12) {
    const { values, weights } = input.ensembleTempRow;
    ensMemberCount = values.length;
    const rawSorted = values
      .map((v, i) => ({ v, w: weights[i] ?? 1 }))
      .filter((p) => Number.isFinite(p.v) && p.w > 0)
      .sort((a, b) => a.v - b.v);

    if (rawSorted.length >= 12) {
      const ensRawP50 = weightedQuantilePairs(rawSorted, 0.5);
      const ensAlignedP50 = ensRawP50 + localBiasShiftC;

      // Lorenz chaos-aware ramp: 42% at +168h (Day 7) -> 78% at +360h (Day 15)
      const ensDominanceW = clamp(
        0.42 + ((leadHour - 168) / 192) * 0.36,
        0.42,
        0.78
      );
      const baseEnsembleBlended =
        (1 - ensDominanceW) * bursaBackboneBlend + ensDominanceW * ensAlignedP50;

      // Detect frontal airmass bifurcations across the 154–172 active members
      const cluster = resolveBimodalEnsembleCluster({
        leadHours: leadHour,
        emosTempC: baseEnsembleBlended,
        ensembleMembersC: values,
        ensembleWeights: weights,
        dProgDtTrendC: input.dProgDtTrendC
      });
      bimodalResult = cluster.isBimodal ? cluster : null;
      candidateTempC = cluster.adjustedTempC;

      const shiftFromRawEns = candidateTempC - ensRawP50;
      const rawP10 = weightedQuantilePairs(rawSorted, 0.1);
      const rawP90 = weightedQuantilePairs(rawSorted, 0.9);
      tempP10C = Number(Math.min(candidateTempC - 0.8, rawP10 + shiftFromRawEns).toFixed(1));
      tempP90C = Number(Math.max(candidateTempC + 0.8, rawP90 + shiftFromRawEns).toFixed(1));
    }
  }

  // Gentle climatological variance regularization (0% at +168h -> 12% at +360h)
  const normal = computeDailyClimatologyNormals({
    lat: input.lat,
    lon: input.lon,
    elevationM: input.elevationM,
    dateYmd: input.dateYmd
  });
  const climHourTempC = diurnalClimatologyAtHour(normal, localHour);
  const climShrinkW = clamp(((leadHour - 168) / 192) * 0.12, 0, 0.12);
  const finalTempC = Number(
    ((1 - climShrinkW) * candidateTempC + climShrinkW * climHourTempC).toFixed(2)
  );

  // Windowed Synoptic Precipitation Calibration (±6h window PoP + PM-QM)
  const detPrecipVals = CORE_MODEL_KEYS.map((k) => input.precipSnapshot[k])
    .filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v))
    .map((v) => Math.max(0, v))
    .sort((a, b) => a - b);

  const detAgreeing = detPrecipVals.filter((v) => v >= 0.15).length;
  const detTotal = detPrecipVals.length;
  const detWetPct = detTotal > 0 ? (detAgreeing / detTotal) * 100 : input.rawFallback.popPct;
  const detMedMm = detTotal > 0 ? quantileSorted(detPrecipVals, 0.5) : input.rawFallback.precipMm;

  const cleanEnsP = (input.ensemblePrecipValues ?? [])
    .filter((v) => Number.isFinite(v))
    .map((v) => Math.max(0, v))
    .sort((a, b) => a - b);

  const instantEnsPop =
    cleanEnsP.length >= 10
      ? (cleanEnsP.filter((v) => v >= 0.15).length / cleanEnsP.length) * 100
      : detWetPct;

  const winProbs =
    input.windowEnsembleWetProbsPct.length > 0
      ? input.windowEnsembleWetProbsPct
      : [instantEnsPop];
  const winMeanPop = winProbs.reduce((a, b) => a + b, 0) / winProbs.length;
  const winMaxPop = Math.max(...winProbs);

  // Blend instant + ±6h synoptic envelope so 6h frontal timing jitter doesn't erase real rain fronts
  const synopticPop = clamp(
    Math.round(0.46 * instantEnsPop + 0.34 * winMeanPop + 0.12 * winMaxPop + 0.08 * detWetPct),
    0,
    95
  );

  let finalPrecipMm = 0;
  if (synopticPop >= 26) {
    if (cleanEnsP.length >= 10) {
      const qTarget = clamp(0.54 + (synopticPop - 26) * 0.0045, 0.54, 0.84);
      const epsQpf = quantileSorted(cleanEnsP, qTarget);
      const scale = clamp((synopticPop - 18) / 48, 0.25, 1.0);
      finalPrecipMm = Number(Math.max(0, scale * (0.72 * epsQpf + 0.28 * detMedMm)).toFixed(2));
    } else {
      finalPrecipMm = Number(Math.max(0, detMedMm).toFixed(2));
    }
    if (finalPrecipMm < 0.12 && synopticPop < 45) {
      finalPrecipMm = 0;
    }
  }

  const p10Mm = cleanEnsP.length >= 10 ? Number(quantileSorted(cleanEnsP, 0.1).toFixed(1)) : 0;
  const p50Mm = cleanEnsP.length >= 10 ? Number(quantileSorted(cleanEnsP, 0.5).toFixed(1)) : Number(detMedMm.toFixed(1));
  const p90Mm =
    cleanEnsP.length >= 10
      ? Number(quantileSorted(cleanEnsP, 0.9).toFixed(1))
      : detPrecipVals.length > 0
        ? Number(detPrecipVals[detPrecipVals.length - 1].toFixed(1))
        : 0;

  const epsIqrC =
    tempP10C !== undefined && tempP90C !== undefined
      ? Math.max(0, (tempP90C - tempP10C) * 0.52)
      : null;
  const calibratedTempSpreadC = computeCalibratedWeightedSpread({
    snapshot: input.tempSnapshot,
    weights: EXTENDED_SYNOPTIC_PRIOR_WEIGHTS.temperature,
    biases: Object.fromEntries(
      CORE_MODEL_KEYS.map((k) => [
        k,
        input.mos.biases[k].tempPersistentBiasC * persistDecay +
          0.6 * input.mos.biases[k].tempDiurnalBiasC[bin] * diurnalDecay
      ])
    ),
    ensembleIqr: epsIqrC
  });
  const calibratedPressSpreadHpa = computeCalibratedWeightedSpread({
    snapshot: input.pressSnapshot,
    weights: EXTENDED_SYNOPTIC_PRIOR_WEIGHTS.pressure
  });
  const bestUbRmse = CORE_MODEL_KEYS.reduce<number | null>((best, k) => {
    const r = input.mos.biases[k].tempUbRmseC;
    if (r === null || !Number.isFinite(r)) return best;
    return best === null ? r : Math.min(best, r);
  }, null);

  const confidencePct = computeIntrinsicAccuracyIndex({
    leadHours: leadHour,
    activeModelCount: Math.max(1, detTemp.count),
    ensembleMemberCount: ensMemberCount,
    verificationMode: input.mos.report.mode,
    verifiedStationCount: input.mos.summary.stationCount,
    matchedVerificationHours: input.mos.report.matchedHours,
    nowcastKalmanGain: input.mos.summary.nowcastKalmanGain,
    bestTempUbRmseC: bestUbRmse,
    isBursaEmosActive: input.bursaEmosCandidateC !== null,
    calibratedTempSpreadC,
    calibratedPressureSpreadHpa: calibratedPressSpreadHpa,
    wetModelFraction: detTotal > 0 ? detAgreeing / detTotal : null,
    precipProbPct: synopticPop,
    precipSpreadMmHr: Math.max(0, p90Mm - p10Mm),
    bimodalSeparationC: bimodalResult?.isBimodal ? bimodalResult.separationC : 0
  }).totalPct;

  return {
    temperatureC: finalTempC,
    tempP10C,
    tempP90C,
    dewPointC: Number(Math.min(finalTempC, detDew.corrected).toFixed(1)),
    pressureHpa: Number(detPress.corrected.toFixed(1)),
    windSpeedKmh: Number(Math.max(0, detWind.corrected).toFixed(1)),
    precipitationMm: finalPrecipMm,
    precipProbabilityPct: synopticPop,
    precipConsensus: {
      agreeingModels: detAgreeing,
      totalModels: detTotal,
      minMm: detPrecipVals.length > 0 ? Number(detPrecipVals[0].toFixed(1)) : 0,
      medianMm: Number(detMedMm.toFixed(1)),
      maxMm:
        detPrecipVals.length > 0
          ? Number(detPrecipVals[detPrecipVals.length - 1].toFixed(1))
          : 0,
      p10Mm,
      p50Mm,
      p90Mm,
      heavyProbPct:
        cleanEnsP.length >= 10
          ? Math.round((cleanEnsP.filter((v) => v >= 5).length / cleanEnsP.length) * 100)
          : 0,
      extremeProbPct:
        cleanEnsP.length >= 10
          ? Math.round((cleanEnsP.filter((v) => v >= 15).length / cleanEnsP.length) * 100)
          : 0,
      ensembleMembers: cleanEnsP.length
    },
    activeModelCount: Math.max(1, detTemp.count),
    ensembleMemberCount: ensMemberCount,
    confidencePct,
    bimodal: bimodalResult
  };
}

export function summarizeDailyBimodalSplits(
  splits: Array<BimodalEnsembleClusterResult | null | undefined>
): DailyBimodalSplit | null {
  const valid = splits.filter(
    (s): s is BimodalEnsembleClusterResult => Boolean(s && s.isBimodal)
  );
  if (valid.length < 3) return null;

  let peak = valid[0];
  for (const item of valid) {
    if (item.separationC > peak.separationC) peak = item;
  }
  const distToWarm = Math.abs(peak.adjustedTempC - peak.warmModeC);
  const distToCold = Math.abs(peak.adjustedTempC - peak.coldModeC);
  return {
    coldModeC: Math.round(peak.coldModeC * 10) / 10,
    warmModeC: Math.round(peak.warmModeC * 10) / 10,
    winningMode: distToWarm <= distToCold ? "warm" : "cold",
    winningWeightPct: Math.round(peak.winningClusterWeight * 100),
    separationC: Math.round(peak.separationC * 10) / 10
  };
}

// ============================================================================
// SUBSEASONAL (DAYS 16–30) 52-MEMBER GEFSv12 + ECCC GEPS PROBABILISTIC ENGINE
// ============================================================================

export interface RawSubseasonalDailyPayload {
  fetchedAt: string;
  dates: string[];
  maxCols: Array<{ values: Array<number | null>; weight: number }>;
  minCols: Array<{ values: Array<number | null>; weight: number }>;
  precipCols: Array<Array<number | null>>;
}

type SubseasonalCacheItem = {
  payload: RawSubseasonalDailyPayload;
  expiresAtMs: number;
  staleUntilMs: number;
};

const subseasonalCache = new Map<string, SubseasonalCacheItem>();
const SUBSEASONAL_TTL_MS = 60 * 60 * 1000; // 60 minutes (subseasonal runs update 1–4x/day)
const SUBSEASONAL_STALE_MS = 48 * 60 * 60 * 1000; // 48 hours stale fallback

export function resetSubseasonalCacheForTests(): void {
  subseasonalCache.clear();
}

export async function fetchRawSubseasonalEnsemble(params: {
  lat: number;
  lon: number;
  elevationM?: number;
  timeoutMs?: number;
}): Promise<RawSubseasonalDailyPayload | null> {
  const key = `${params.lat.toFixed(2)},${params.lon.toFixed(2)}`;
  const nowMs = Date.now();
  const cached = subseasonalCache.get(key);
  if (cached && cached.expiresAtMs > nowMs) {
    return cached.payload;
  }

  try {
    const url = new URL("https://ensemble-api.open-meteo.com/v1/ensemble");
    url.searchParams.set("latitude", params.lat.toFixed(4));
    url.searchParams.set("longitude", params.lon.toFixed(4));
    if (params.elevationM !== undefined && Number.isFinite(params.elevationM)) {
      url.searchParams.set("elevation", String(Math.round(params.elevationM)));
    }
    url.searchParams.set("forecast_days", "31");
    url.searchParams.set("timezone", "auto");
    url.searchParams.set("models", "gfs_seamless,gem_global");
    url.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,precipitation_sum"
    );

    const res = await fetch(url.toString(), {
      cache: "no-store",
      headers: { Accept: "application/json", "User-Agent": ATMOS_HTTP_USER_AGENT },
      signal: AbortSignal.timeout(params.timeoutMs ?? 8500)
    });

    if (!res.ok) {
      if (cached && cached.staleUntilMs > nowMs) return cached.payload;
      return null;
    }

    const json = (await res.json()) as {
      daily?: Record<string, unknown>;
    };
    const daily = json?.daily;
    const dates = Array.isArray(daily?.time) ? (daily.time as string[]) : [];
    if (!daily || dates.length < 18) {
      if (cached && cached.staleUntilMs > nowMs) return cached.payload;
      return null;
    }

    const maxCols: Array<{ values: Array<number | null>; weight: number }> = [];
    const minCols: Array<{ values: Array<number | null>; weight: number }> = [];
    const precipCols: Array<Array<number | null>> = [];

    for (const [colKey, colVal] of Object.entries(daily)) {
      if (!Array.isArray(colVal)) continue;
      const w = colKey.includes("gem_global") ? 1.06 : 0.96;
      if (colKey.startsWith("temperature_2m_max_")) {
        maxCols.push({ values: colVal as Array<number | null>, weight: w });
      } else if (colKey.startsWith("temperature_2m_min_")) {
        minCols.push({ values: colVal as Array<number | null>, weight: w });
      } else if (colKey.startsWith("precipitation_sum_")) {
        precipCols.push(colVal as Array<number | null>);
      }
    }

    if (maxCols.length < 8 || minCols.length < 8) {
      if (cached && cached.staleUntilMs > nowMs) return cached.payload;
      return null;
    }

    const payload: RawSubseasonalDailyPayload = {
      fetchedAt: new Date(nowMs).toISOString(),
      dates,
      maxCols,
      minCols,
      precipCols
    };

    subseasonalCache.set(key, {
      payload,
      expiresAtMs: nowMs + SUBSEASONAL_TTL_MS,
      staleUntilMs: nowMs + SUBSEASONAL_STALE_MS
    });
    return payload;
  } catch {
    if (cached && cached.staleUntilMs > nowMs) {
      return cached.payload;
    }
    return null;
  }
}

function formatDayMonthTr(dateYmd: string): string {
  const monthIdx = Number(dateYmd.slice(5, 7)) - 1;
  const dayNum = Number(dateYmd.slice(8, 10));
  const mLabel = MONTH_NAMES_SHORT_TR[monthIdx] ?? dateYmd.slice(5, 7);
  const d = new Date(`${dateYmd}T12:00:00Z`);
  const dow = Number.isFinite(d.getTime()) ? DAY_NAMES_TR[d.getUTCDay()] : "";
  return `${dayNum} ${mLabel}${dow ? ` ${dow}` : ""}`;
}

function formatShortRangeTr(startYmd: string, endYmd: string): string {
  const sDay = Number(startYmd.slice(8, 10));
  const sMonth = MONTH_NAMES_SHORT_TR[Number(startYmd.slice(5, 7)) - 1] ?? "";
  const eDay = Number(endYmd.slice(8, 10));
  const eMonth = MONTH_NAMES_SHORT_TR[Number(endYmd.slice(5, 7)) - 1] ?? "";
  return sMonth === eMonth ? `${sDay}–${eDay} ${sMonth}` : `${sDay} ${sMonth} – ${eDay} ${eMonth}`;
}

/**
 * Alt-mevsimsel hafta özet metnini seçili birim sistemine (`metric` / `imperial`) göre biçimlendirir;
 * `wk.summaryNoteTr` alanını değiştirmeden anomali farkını `formatTempDelta` (`1.8 * ΔT`, `+32` yok!) ile üretir.
 */
export function formatSubseasonalWeekNoteTr(
  wk: SubseasonalWeekSummary,
  unit: UnitSystem = "metric"
): string {
  if (unit === "metric" && wk.summaryNoteTr) {
    return wk.summaryNoteTr;
  }

  if (wk.summaryNoteTr && wk.summaryNoteTr.includes("°C")) {
    return wk.summaryNoteTr.replace(
      /([+-]?\d+(?:\.\d+)?)\s*°C/g,
      (_full, rawNumStr: string) => {
        const parsed = Number(rawNumStr);
        const deltaC =
          Math.abs(parsed - wk.meanAnomalyC) < 0.05 ? wk.meanAnomalyC : parsed;
        return formatTempDelta(deltaC, unit, {
          decimals: 1,
          signed: true,
          showUnit: true
        });
      }
    );
  }

  const anomLabel = formatTempDelta(wk.meanAnomalyC, unit, {
    decimals: 1,
    signed: true,
    showUnit: true
  });
  if (wk.meanAnomalyC >= 1.8) {
    return `Mevsim normallerinin ortalama ${anomLabel} üzerinde ılık hava kütlesi olasılığı önde; ~${wk.wetDaysExpected} yağışlı gün sinyali.`;
  }
  if (wk.meanAnomalyC <= -1.8) {
    return `Mevsim normallerinin ${anomLabel} altında serin/soğuk salınım sinyali; ~${wk.wetDaysExpected} yağışlı gün olasılığı.`;
  }
  return `Sıcaklıklar mevsim normalleri bandında (${anomLabel} sapma); dönemde ~${wk.wetDaysExpected} gün yağış geçişi bekleniyor.`;
}

/**
 * Calibrates Days 16–30 (`SubseasonalOutlookBundle`) by stitching the 52-member
 * `GEFSv12 + GEPS` ensemble onto our calibrated `daily[0..6]` baseline (removing local
 * coarse-grid bias) and computing anomalies relative to local seasonal normals.
 */
export function buildCalibratedSubseasonalOutlook(params: {
  raw: RawSubseasonalDailyPayload | null;
  calibratedDaily: DailyPoint[];
  lat: number;
  lon: number;
  elevationM: number;
}): SubseasonalOutlookBundle | null {
  const { raw, calibratedDaily } = params;
  if (!raw || raw.dates.length < 18 || calibratedDaily.length < 7) {
    return null;
  }

  const dateToIdx = new Map<string, number>();
  raw.dates.forEach((d, idx) => dateToIdx.set(d, idx));

  const readWeightedRow = (
    cols: Array<{ values: Array<number | null>; weight: number }>,
    idx: number
  ): Array<{ v: number; w: number }> => {
    const out: Array<{ v: number; w: number }> = [];
    for (const c of cols) {
      const val = c.values[idx];
      if (typeof val === "number" && Number.isFinite(val)) {
        out.push({ v: val, w: c.weight });
      }
    }
    return out.sort((a, b) => a.v - b.v);
  };

  // 1. Measure local coarse-grid bias over Days 1..7 (`calibratedDaily[0..6]`) for seamless stitching!
  const maxDeltas: number[] = [];
  const minDeltas: number[] = [];
  for (let i = 0; i < Math.min(7, calibratedDaily.length); i++) {
    const refDay = calibratedDaily[i];
    const rIdx = dateToIdx.get(refDay.date);
    if (rIdx === undefined) continue;
    const maxRow = readWeightedRow(raw.maxCols, rIdx);
    const minRow = readWeightedRow(raw.minCols, rIdx);
    if (maxRow.length >= 8) {
      maxDeltas.push(refDay.tempMax - weightedQuantilePairs(maxRow, 0.5));
    }
    if (minRow.length >= 8) {
      minDeltas.push(refDay.tempMin - weightedQuantilePairs(minRow, 0.5));
    }
  }

  const meanTrimmed = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    if (sorted.length >= 5) {
      const inner = sorted.slice(1, -1);
      return inner.reduce((a, b) => a + b, 0) / inner.length;
    }
    return sorted.reduce((a, b) => a + b, 0) / sorted.length;
  };

  const biasShiftMaxC = Number(clamp(meanTrimmed(maxDeltas), -5.5, 5.5).toFixed(2));
  const biasShiftMinC = Number(clamp(meanTrimmed(minDeltas), -5.5, 5.5).toFixed(2));

  // 2. Build calibrated SubseasonalDayPoint entries strictly AFTER `calibratedDaily` ends (Days 16..30)
  const lastSynopticDate = calibratedDaily[calibratedDaily.length - 1]?.date ?? "";
  const days: SubseasonalDayPoint[] = [];
  let maxMembersObserved = 0;

  for (let idx = 0; idx < raw.dates.length; idx++) {
    const dateStr = raw.dates[idx];
    if (dateStr <= lastSynopticDate) continue;
    if (days.length >= 15) break; // Cap cleanly at Day 30 (15 synoptic + 15 subseasonal = 30 total days)

    const maxRow = readWeightedRow(raw.maxCols, idx);
    const minRow = readWeightedRow(raw.minCols, idx);
    if (maxRow.length < 8 || minRow.length < 8) continue;

    maxMembersObserved = Math.max(maxMembersObserved, maxRow.length);
    const normal = computeDailyClimatologyNormals({
      lat: params.lat,
      lon: params.lon,
      elevationM: params.elevationM,
      dateYmd: dateStr
    });

    const subDayOffset = days.length; // 0..14 -> Day 16..30
    const weekIndex: 3 | 4 = subDayOffset < 7 ? 3 : 4;
    // Progressive climatological shrinkage in Week 3–4 (15% at Day 16 -> 32% at Day 30)
    const climW = clamp(0.15 + (subDayOffset / 14) * 0.17, 0.15, 0.32);

    const stitchMax = (q: number) => {
      const rawQ = weightedQuantilePairs(maxRow, q) + biasShiftMaxC;
      return rawQ * (1 - climW) + (normal.normalMaxC + (q - 0.5) * 4.2) * climW;
    };
    const stitchMin = (q: number) => {
      const rawQ = weightedQuantilePairs(minRow, q) + biasShiftMinC;
      return rawQ * (1 - climW) + (normal.normalMinC + (q - 0.5) * 3.6) * climW;
    };

    const tempMaxP10 = Math.round(stitchMax(0.1) * 10) / 10;
    const tempMaxP25 = Math.round(stitchMax(0.25) * 10) / 10;
    const tempMaxP50 = Math.round(stitchMax(0.5) * 10) / 10;
    const tempMaxP75 = Math.round(stitchMax(0.75) * 10) / 10;
    const tempMaxP90 = Math.round(stitchMax(0.9) * 10) / 10;

    let tempMinP25 = Math.round(stitchMin(0.25) * 10) / 10;
    let tempMinP50 = Math.round(stitchMin(0.5) * 10) / 10;
    let tempMinP75 = Math.round(stitchMin(0.75) * 10) / 10;
    if (tempMinP50 > tempMaxP50 - 1.5) {
      tempMinP50 = Number((tempMaxP50 - 2.5).toFixed(1));
      tempMinP25 = Math.min(tempMinP25, Number((tempMinP50 - 1.2).toFixed(1)));
      tempMinP75 = Math.min(tempMaxP50 - 0.8, Number((tempMinP50 + 1.2).toFixed(1)));
    }

    const dayMeanP50 = 0.5 * (tempMaxP50 + tempMinP50);
    const anomalyC = Number((dayMeanP50 - normal.normalMeanC).toFixed(1));

    const precipVals = raw.precipCols
      .map((col) => col[idx])
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v))
      .map((v) => Math.max(0, v))
      .sort((a, b) => a - b);

    const wetMembers = precipVals.filter((v) => v >= 1.0).length;
    const wetProbPct =
      precipVals.length > 0
        ? clamp(Math.round((wetMembers / precipVals.length) * 100), 5, 90)
        : 25;
    const precipP50Mm =
      precipVals.length > 0 ? Number(quantileSorted(precipVals, 0.5).toFixed(1)) : 0;
    const precipP90Mm =
      precipVals.length > 0 ? Number(quantileSorted(precipVals, 0.9).toFixed(1)) : 0;

    let weatherCode = 2;
    if (wetProbPct >= 55) {
      weatherCode = tempMaxP50 <= 2.0 ? 71 : 61;
    } else if (wetProbPct >= 38) {
      weatherCode = 3;
    } else if (wetProbPct <= 20) {
      weatherCode = 1;
    }

    const regimeTagTr =
      anomalyC >= 2.0
        ? wetProbPct >= 45
          ? "Ilık & Cepheli"
          : "Normallerin Üzerinde Ilık"
        : anomalyC <= -2.0
          ? wetProbPct >= 45
            ? tempMaxP50 <= 3
              ? "Soğuk & Kar İhtimali"
              : "Soğuk & Yağışlı"
            : "Normallerin Altında Serin"
          : wetProbPct >= 48
            ? "Yağışlı Sinoptik Eğilim"
            : "Mevsim Normalleri Civarı";

    const iqrMax = Math.max(0, tempMaxP75 - tempMaxP25);
    const subLeadHours = (15 + subDayOffset) * 24;
    const confidencePct = computeIntrinsicAccuracyIndex({
      leadHours: subLeadHours,
      activeModelCount: 2,
      ensembleMemberCount: maxRow.length,
      verificationMode: "wmo-prior",
      calibratedTempSpreadC: iqrMax * 1.35,
      precipProbPct: wetProbPct,
      precipSpreadMmHr: Math.max(0, precipP90Mm - precipP50Mm) / 6
    }).totalPct;

    // Subseasonal probabilistic snow diagnostics (52-member thermal cold-tail x precipitation corridor)
    const memberColdCount = minRow.filter((m, mIdx) => {
      const mx = maxRow[Math.min(mIdx, maxRow.length - 1)]?.v ?? tempMaxP50;
      const stitchedMean = 0.5 * (mx + biasShiftMaxC + m.v + biasShiftMinC);
      return stitchedMean <= 2.4 || m.v + biasShiftMinC <= 0.4;
    }).length;
    const coldMemberFrac = minRow.length > 0 ? memberColdCount / minRow.length : 0;
    const snowProbPct = Math.round(
      clamp((wetProbPct / 100) * coldMemberFrac * 100, 0, 88)
    );

    const p50SnowSlr = dayMeanP50 <= -1.5 ? 13.0 : dayMeanP50 <= 1.2 ? 9.5 : dayMeanP50 <= 2.6 ? 5.5 : 0;
    const p10MeanCold = 0.5 * (tempMaxP10 + (tempMinP25 - 1.1));
    const p90SnowSlr = p10MeanCold <= -2.0 ? 14.2 : p10MeanCold <= 1.2 ? 10.2 : p10MeanCold <= 2.8 ? 6.0 : 0;

    const airSnowP50Cm =
      snowProbPct >= 10 && p50SnowSlr > 0
        ? Number((precipP50Mm * clamp((2.8 - dayMeanP50) / 3.2, 0.12, 1) * (p50SnowSlr / 10)).toFixed(1))
        : 0;
    const airSnowP90Cm =
      snowProbPct >= 8 && p90SnowSlr > 0
        ? Number(
            Math.max(
              airSnowP50Cm,
              precipP90Mm * clamp((3.0 - p10MeanCold) / 3.4, 0.15, 1) * (p90SnowSlr / 10) * Math.min(1, coldMemberFrac * 1.45)
            ).toFixed(1)
          )
        : 0;

    const subGroundStickP50 = dayMeanP50 <= 0.2 ? 0.76 : dayMeanP50 <= 1.6 ? 0.42 : 0.12;
    const subGroundStickP90 = p10MeanCold <= 0.0 ? 0.82 : p10MeanCold <= 1.6 ? 0.48 : 0.18;
    const groundSnowP50Cm = Number((airSnowP50Cm * subGroundStickP50).toFixed(1));
    const groundSnowP90Cm = Number(Math.max(groundSnowP50Cm, airSnowP90Cm * subGroundStickP90).toFixed(1));
    const estSnowLineM = Math.max(
      0,
      Math.round((params.elevationM ?? 100) + (dayMeanP50 - 0.8) / 0.006)
    );

    days.push({
      date: dateStr,
      dayLabel: formatDayMonthTr(dateStr),
      weekIndex,
      tempMaxP10,
      tempMaxP25,
      tempMaxP50,
      tempMaxP75,
      tempMaxP90,
      tempMinP25,
      tempMinP50,
      tempMinP75,
      tempNormalMax: normal.normalMaxC,
      tempNormalMin: normal.normalMinC,
      anomalyC,
      wetProbPct,
      precipP50Mm,
      precipP90Mm,
      snowProbPct,
      airSnowP50Cm,
      airSnowP90Cm,
      groundSnowP50Cm,
      groundSnowP90Cm,
      estSnowLineM,
      confidencePct,
      ensembleMembers: maxRow.length,
      weatherCode: snowProbPct >= 42 && weatherCode === 61 ? 71 : weatherCode,
      regimeTagTr
    });
  }

  if (days.length === 0) return null;

  const buildWeekCard = (wIdx: 3 | 4): SubseasonalWeekSummary | null => {
    const slice = days.filter((d) => d.weekIndex === wIdx);
    if (slice.length === 0) return null;

    const meanAnomalyC = Number(
      (slice.reduce((a, d) => a + d.anomalyC, 0) / slice.length).toFixed(1)
    );
    const minMaxP25 = Math.round(Math.min(...slice.map((d) => d.tempMaxP25)));
    const maxMaxP75 = Math.round(Math.max(...slice.map((d) => d.tempMaxP75)));
    const minMinP25 = Math.round(Math.min(...slice.map((d) => d.tempMinP25)));
    const maxMinP75 = Math.round(Math.max(...slice.map((d) => d.tempMinP75)));
    const meanWetProbPct = Math.round(
      slice.reduce((a, d) => a + d.wetProbPct, 0) / slice.length
    );
    const wetDaysExpected = Math.max(
      0,
      Math.min(slice.length, Math.round((meanWetProbPct / 100) * slice.length))
    );
    const confidencePct = Math.round(
      slice.reduce((a, d) => a + d.confidencePct, 0) / slice.length
    );

    const dominantRegimeTr =
      meanAnomalyC >= 1.8
        ? "Sıcak / Sırt Baskın Rejim"
        : meanAnomalyC <= -1.8
          ? "Soğuk Oluk / Kuzeyli Akış"
          : meanWetProbPct >= 46
            ? "Aktif Cephe Geçişleri"
            : "Dengeli Mevsimsel Akış";

    const anomSign = meanAnomalyC > 0 ? `+${meanAnomalyC}` : `${meanAnomalyC}`;
    const summaryNoteTr =
      meanAnomalyC >= 1.8
        ? `Mevsim normallerinin ortalama ${anomSign}°C üzerinde ılık hava kütlesi olasılığı önde; ~${wetDaysExpected} yağışlı gün sinyali.`
        : meanAnomalyC <= -1.8
          ? `Mevsim normallerinin ${anomSign}°C altında serin/soğuk salınım sinyali; ~${wetDaysExpected} yağışlı gün olasılığı.`
          : `Sıcaklıklar mevsim normalleri bandında (${anomSign}°C sapma); dönemde ~${wetDaysExpected} gün yağış geçişi bekleniyor.`;

    return {
      weekIndex: wIdx,
      titleTr: wIdx === 3 ? "3. Hafta Sinoptik Eğilim" : "4. Hafta Alt-Mevsimsel Eğilim",
      dateRangeTr: formatShortRangeTr(slice[0].date, slice[slice.length - 1].date),
      meanAnomalyC,
      tempMaxRangeC: [minMaxP25, maxMaxP75],
      tempMinRangeC: [minMinP25, maxMinP75],
      wetDaysExpected,
      meanWetProbPct,
      confidencePct,
      dominantRegimeTr,
      summaryNoteTr
    };
  };

  const weeks = ([buildWeekCard(3), buildWeekCard(4)] as const).filter(
    (w): w is SubseasonalWeekSummary => w !== null
  );

  return {
    fetchedAt: raw.fetchedAt,
    ensembleMembers: maxMembersObserved,
    modelsLabel: "NOAA GEFSv12 (31) + ECCC GEPS (21)",
    biasShiftMaxC,
    biasShiftMinC,
    weeks,
    days
  };
}
