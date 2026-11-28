/**
 * ATMOS v5.0 — Intrinsic System-Power Forecast Accuracy Index (`Doğruluk Endeksi`)
 * File: lib/accuracy-index.ts
 *
 * Measures forecast reliability strictly from ATMOS's own active physical, statistical,
 * and observational capabilities — without comparing against any external third-party forecast:
 *  1. Observation & Statistical Post-Processing Skill (0..24 pts):
 *     Live 19-district MGM Cressman mesh / ICAO METAR verification tier, Kalman innovation gain,
 *     empirical local UBRMSE skill, 17,472h trained Bursa L1-EMOS/GBDT, and 5-min Doppler radar nowcast.
 *  2. Active Multi-Model & Multi-Center Ensemble Capacity + Freshness (0..22 pts):
 *     Active deterministic NWP count (penalizing single-model collapse), active EPS member coverage,
 *     and degraded-stream / stale-cache age decay.
 *  3. Calibrated Weighted Distribution Consensus & Multi-Hazard Uncertainty (0..26 pts):
 *     Kalman-bias-corrected weighted temperature & pressure spread (immune to a single coarse-grid outlier),
 *     precipitation wet/dry split entropy, bimodal frontal cluster separation, and orographic/coastal
 *     microclimate boundary-layer uncertainty.
 *  4. Multi-Family Weighted dProg/dt Run Consistency (0..13 pts):
 *     Reliability-weighted family lock across lagged synoptic cycles (R0..R-3).
 *  5. Continuous Lyapunov Predictability Envelope (0h..720h / Days 1..30):
 *     Smooth Lorenz predictability decay with zero step-cliffs at 168h (Day 8) or 360h (Day 16).
 */

import { CORE_MODEL_KEYS } from "./model-registry";
import type {
  CoreModelKey,
  FreshnessStatus,
  HybridModelSnapshot,
  LiveVerificationMode
} from "./weather-types";

export interface IntrinsicAccuracyInput {
  leadHours: number;
  /** Number of deterministic NWP/AI models with finite data at this step (0..8) */
  activeModelCount: number;
  /** Number of ensemble members active at this step (0..212 for 0-15d, 0..52 for 16-30d) */
  ensembleMemberCount: number;
  /** Verification tier from Kalman MOS */
  verificationMode?: LiveVerificationMode;
  /** Number of verified stations feeding Cressman / METAR network */
  verifiedStationCount?: number;
  /** Number of matched historical verification hours (0..72) */
  matchedVerificationHours?: number;
  /** Active Kalman temperature gain at t=0 (0..0.76) */
  nowcastKalmanGain?: number;
  /** Best verified model unbiased RMSE (°C) at target basin */
  bestTempUbRmseC?: number | null;
  /** Whether 17,472-hour Bursa WMO-17116 L1-EMOS + GBDT post-processing is active */
  isBursaEmosActive?: boolean;
  /** Whether live 5-minute Doppler radar nowcast is online */
  radarAvailable?: boolean;
  /** Kalman-corrected weighted temperature spread (°C, ~2.15 * weighted_std or P90-P10 * 0.62) */
  calibratedTempSpreadC: number;
  /** Weighted sea-level pressure spread (hPa) */
  calibratedPressureSpreadHpa?: number;
  /** Fraction of models predicting wet hour (0..1), or null when all dry */
  wetModelFraction?: number | null;
  /** Calibrated precipitation probability (0..100) */
  precipProbPct?: number;
  /** Ensemble P90 - P10 precipitation spread (mm/h) */
  precipSpreadMmHr?: number;
  /** Bimodal ensemble cluster separation (°C) when ensemble splits into two synoptic regimes */
  bimodalSeparationC?: number;
  /** Additional topographic/coastal microclimate boundary-layer uncertainty (°C) */
  microclimateUncertaintyC?: number;
  /** Reliability-weighted consecutive run lock count (1..4) */
  runLockCount?: number;
  /** Hourly dProg/dt stability grade */
  stabilityGrade?: "LOCKED" | "CONVERGING" | "WATCH";
  /** Whether noisy revision hysteresis damping fired on this step */
  hysteresisDamped?: boolean;
  /** Freshness state ("live" | "degraded" | "stale") */
  freshnessStatus?: FreshnessStatus;
  /** Age of cached bundle in hours when serving stale/cached data */
  staleAgeHours?: number;
  /** Number of degraded upstream streams (e.g. failed 8-model or failed ensemble) */
  degradedStreamCount?: number;
}

export interface IntrinsicAccuracyBreakdown {
  totalPct: number;
  sensorCalibrationPts: number;
  modelEnsemblePts: number;
  consensusSpreadPts: number;
  runStabilityPts: number;
  horizonCeilingPct: number;
  calibratedSpreadC: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Computes Kalman-bias-corrected, model-weight-aware effective spread (`~2.15 * sigma_w`),
 * preventing a single coarse-resolution outlier model (e.g. 20 km global grid over mountains)
 * from distorting consensus when high-skill weighted models agree tightly.
 */
export function computeCalibratedWeightedSpread(params: {
  snapshot: HybridModelSnapshot;
  weights?: Partial<Record<CoreModelKey, number>>;
  biases?: Partial<Record<CoreModelKey, number>>;
  ensembleIqr?: number | null;
}): number {
  const { snapshot, weights, biases, ensembleIqr } = params;
  const items: Array<{ val: number; w: number }> = [];

  for (const k of CORE_MODEL_KEYS) {
    const raw = snapshot[k];
    if (raw === null || raw === undefined || !Number.isFinite(raw)) continue;
    const bias = biases?.[k] ?? 0;
    const w = Math.max(0.02, weights?.[k] ?? 0.125);
    items.push({ val: raw - bias, w });
  }

  let detSpread = 0;
  if (items.length >= 2) {
    const wSum = items.reduce((a, x) => a + x.w, 0);
    const mean = items.reduce((a, x) => a + x.val * x.w, 0) / wSum;
    const variance =
      items.reduce((a, x) => {
        const d = x.val - mean;
        return a + x.w * d * d;
      }, 0) / wSum;
    // For a uniform/normal 8-model ensemble, 2.25 * sigma_w matches effective inter-model spread
    detSpread = 2.25 * Math.sqrt(Math.max(0, variance));
  }

  if (ensembleIqr !== null && ensembleIqr !== undefined && Number.isFinite(ensembleIqr) && ensembleIqr > 0) {
    // Normal IQR = 1.349 * sigma -> effective spread ~ 1.65 * IQR
    const epsEquivSpread = ensembleIqr * 1.55;
    if (items.length < 2) return Number(epsEquivSpread.toFixed(2));
    return Number((0.58 * detSpread + 0.42 * epsEquivSpread).toFixed(2));
  }

  return Number(detSpread.toFixed(2));
}

/**
 * Continuous Lorenz/Lyapunov predictability skill factor `S(h) in (0, 1]` across `0..720` hours (Days 1..30).
 * Eliminates artificial piecewise jumps at 168h (Day 8) and 360h (Day 16).
 */
export function computeLyapunovHorizonSkill(leadHours: number): number {
  const h = Math.max(0, leadHours);
  return 1 / (1 + Math.pow(h / 205, 1.56));
}

/**
 * Computes ATMOS's intrinsic forecast accuracy index (`24..99%`) and its 5-pillar diagnostic breakdown.
 */
export function computeIntrinsicAccuracyIndex(
  input: IntrinsicAccuracyInput
): IntrinsicAccuracyBreakdown {
  const h = Math.max(0, input.leadHours);
  const lyapunov = computeLyapunovHorizonSkill(h);

  // -------------------------------------------------------------------------
  // 1. OBSERVATION, KALMAN MOS & TRAINED EMOS SKILL (0..24 pts)
  // -------------------------------------------------------------------------
  const mode = input.verificationMode ?? "wmo-prior";
  const stCount = Math.max(0, input.verifiedStationCount ?? 0);
  const matchedHrs = Math.max(0, input.matchedVerificationHours ?? 0);
  const verifCredibility =
    mode === "wmo-prior" ? 0 : clamp(matchedHrs / 24, 0.35, 1.0);

  let verifBase = 4.5; // Unverified static WMO prior baseline
  if (mode === "live-mgm-mesh") {
    verifBase = 11.5 + 2.5 * clamp(stCount / 6, 0.3, 1.0) * verifCredibility;
  } else if (mode === "live-station-48h") {
    verifBase = 9.5 + 2.5 * verifCredibility;
  } else if (mode === "live-station-24h") {
    verifBase = 8.0 + 2.0 * verifCredibility;
  }

  // Local bias skill decays over synoptic turnover (~96h), while persistent orographic MOS holds longer
  const verifPts =
    4.5 + (verifBase - 4.5) * (0.35 + 0.65 * Math.exp(-h / 96));

  const kalmanGain = clamp(input.nowcastKalmanGain ?? 0, 0, 0.85);
  const nowcastAnchorPts = 4.0 * clamp(kalmanGain / 0.7, 0, 1) * Math.exp(-h / 4.5);

  let rmseSkillPts = 0;
  if (
    input.bestTempUbRmseC !== null &&
    input.bestTempUbRmseC !== undefined &&
    Number.isFinite(input.bestTempUbRmseC)
  ) {
    rmseSkillPts =
      clamp((1.75 - input.bestTempUbRmseC) * 2.1, -1.5, 2.8) *
      verifCredibility *
      Math.exp(-h / 72);
  }

  const emosPts = input.isBursaEmosActive ? 3.0 * Math.exp(-h / 150) : 0;
  const radarPts = input.radarAvailable ? 2.0 * Math.exp(-h / 2.5) : 0;

  const sensorCalibrationPts = clamp(
    verifPts + nowcastAnchorPts + rmseSkillPts + emosPts + radarPts,
    2.5,
    24.0
  );

  // -------------------------------------------------------------------------
  // 2. ACTIVE MULTI-MODEL & ENSEMBLE CAPACITY + FRESHNESS (0..22 pts)
  // -------------------------------------------------------------------------
  const expectedDetCeiling =
    h <= 114 ? 8 : h <= 168 ? 7 : h <= 192 ? 6 : h <= 252 ? 5 : h <= 360 ? 4 : 2;
  const activeDet = Math.max(0, input.activeModelCount);

  let detPts: number;
  if (h >= 360) {
    // Subseasonal horizon relies primarily on 52-member coupled ensemble rather than deterministic HRES
    detPts = activeDet >= 1 ? 6.5 : 4.5;
  } else if (activeDet <= 1) {
    // Single-model blindness penalty: NEVER reward 7/8 model failure with a high static fallback!
    detPts = activeDet === 1 ? 2.2 : 0.5;
  } else {
    const absCoverage = clamp(activeDet / 8, 0, 1);
    const relCoverage = clamp(activeDet / expectedDetCeiling, 0, 1);
    detPts = 11.0 * (0.55 * Math.pow(absCoverage, 0.65) + 0.45 * relCoverage);
  }

  const ensCount = Math.max(0, input.ensembleMemberCount);
  const ensTarget = h >= 360 ? 48 : 160;
  const ensPts =
    ensCount <= 0
      ? 0
      : (h >= 360 ? 11.5 : 11.0) * Math.pow(clamp(ensCount / ensTarget, 0, 1), 0.55);

  let freshnessPenalty = 0;
  const status = input.freshnessStatus ?? "live";
  const degradedCount = Math.max(0, input.degradedStreamCount ?? 0);
  const staleHours = Math.max(0, input.staleAgeHours ?? 0);

  if (status === "degraded" || degradedCount > 0) {
    freshnessPenalty += clamp(3.0 + degradedCount * 2.2, 3.0, 8.5);
  }
  if (status === "stale" || staleHours >= 0.5) {
    freshnessPenalty += clamp(
      (status === "stale" ? 3.5 : 0) + staleHours * 1.55,
      0,
      20.0
    );
  }

  const modelEnsemblePts = clamp(detPts + ensPts - freshnessPenalty, 0, 22.0);

  // -------------------------------------------------------------------------
  // 3. CALIBRATED WEIGHTED CONSENSUS, PRECIP ENTROPY & BIMODAL SPLIT (0..26 pts)
  // -------------------------------------------------------------------------
  const microUncC = Math.max(0, input.microclimateUncertaintyC ?? 0);
  const effTempSpreadC = Math.hypot(
    Math.max(0, input.calibratedTempSpreadC),
    microUncC
  );
  const effPressSpreadHpa = Math.max(0, input.calibratedPressureSpreadHpa ?? 0.6);

  const tempSpreadPenalty = Math.max(0, effTempSpreadC - 0.55) * 3.15;
  const pressSpreadPenalty = Math.max(0, effPressSpreadHpa - 0.7) * 1.95;

  // Precipitation split entropy penalty: peaks when models/members split ~50/50 on significant rain/snow
  let precipSplitPenalty = 0;
  const pop = clamp(input.precipProbPct ?? 0, 0, 100);
  const qpfSpread = Math.max(0, input.precipSpreadMmHr ?? 0);
  if (input.wetModelFraction !== null && input.wetModelFraction !== undefined) {
    const wf = clamp(input.wetModelFraction, 0, 1);
    const binaryEntropy = 4 * wf * (1 - wf); // 0 at unanimous dry/wet, 1.0 at 50/50 split
    precipSplitPenalty += binaryEntropy * clamp(0.8 + qpfSpread * 0.55, 0.8, 4.2);
  } else if (pop >= 28 && pop <= 72 && qpfSpread >= 1.2) {
    const popEntropy = 1 - Math.abs(pop - 50) / 25;
    precipSplitPenalty += clamp(popEntropy * qpfSpread * 0.45, 0, 3.5);
  }

  // Bimodal synoptic bifurcation penalty (e.g. cold polar trough vs warm Lodos ridge)
  const bimodalSep = Math.max(0, input.bimodalSeparationC ?? 0);
  const bimodalPenalty =
    bimodalSep >= 2.5 ? clamp(2.2 + (bimodalSep - 2.5) * 0.9, 2.2, 9.0) : 0;

  const consensusSpreadPts = clamp(
    26.0 - tempSpreadPenalty - pressSpreadPenalty - precipSplitPenalty - bimodalPenalty,
    2.0,
    26.0
  );

  // -------------------------------------------------------------------------
  // 4. MULTI-FAMILY WEIGHTED dProg/dt RUN CONSISTENCY (0..13 pts)
  // -------------------------------------------------------------------------
  let runStabilityPts = 8.5; // Neutral baseline when beyond lagged-run window (>168h)
  if (input.runLockCount !== undefined || input.stabilityGrade !== undefined) {
    const lockCnt = clamp(input.runLockCount ?? 2, 1, 4);
    const grade = input.stabilityGrade ?? "CONVERGING";
    const gradeBonus = grade === "LOCKED" ? 3.2 : grade === "CONVERGING" ? 1.6 : -1.2;
    const dampPenalty = input.hysteresisDamped ? 1.8 : 0;
    runStabilityPts = clamp(3.6 + (lockCnt - 1) * 2.1 + gradeBonus - dampPenalty, 1.5, 13.0);
  }

  // -------------------------------------------------------------------------
  // 5. CONTINUOUS LYAPUNOV PREDICTABILITY SYNTHESIS (0..720h)
  // -------------------------------------------------------------------------
  // Raw intrinsic capability sum spans [6..85]; normalize to [0..1] quality ratio
  const rawQuality = clamp(
    (sensorCalibrationPts + modelEnsemblePts + consensusSpreadPts + runStabilityPts) / 81.5,
    0.08,
    1.0
  );

  // Predictability ceiling smoothly transitions from 99% at t=0h -> ~72% at 168h -> ~51% at 359h -> ~33% at 720h
  const horizonCeilingPct = 24 + 75 * lyapunov;
  const horizonFloorPct = 18 + 26 * lyapunov;

  let totalPct = Math.round(
    horizonFloorPct + (horizonCeilingPct - horizonFloorPct) * Math.pow(rawQuality, 0.86)
  );

  // Direct synoptic bifurcation penalty when ensemble splits into two opposing frontal clusters
  if (bimodalSep >= 2.5) {
    totalPct -= Math.round(clamp((bimodalSep - 2.0) * 0.65, 1, 6));
  }

  // Extra direct penalty when serving aged stale cache or single-model fallback at near-real-time hours
  if (status === "stale" && staleHours >= 1) {
    totalPct -= Math.round(clamp(staleHours * 1.35, 2, 18));
  }
  if (h < 168 && activeDet <= 1 && ensCount === 0) {
    totalPct = Math.min(totalPct, 58);
  }

  totalPct = Math.round(clamp(totalPct, 24, 99));

  return {
    totalPct,
    sensorCalibrationPts: Number(sensorCalibrationPts.toFixed(1)),
    modelEnsemblePts: Number(modelEnsemblePts.toFixed(1)),
    consensusSpreadPts: Number(consensusSpreadPts.toFixed(1)),
    runStabilityPts: Number(runStabilityPts.toFixed(1)),
    horizonCeilingPct: Number(horizonCeilingPct.toFixed(1)),
    calibratedSpreadC: Number(effTempSpreadC.toFixed(2))
  };
}

/**
 * Decays an existing bundle/daily confidence score when serving stale or degraded cached data.
 */
export function decayConfidenceForStaleOrDegraded(
  baseConfidencePct: number,
  params: {
    status: FreshnessStatus;
    ageHours: number;
    degradedStreamCount?: number;
  }
): number {
  let out = baseConfidencePct;
  const degraded = Math.max(0, params.degradedStreamCount ?? 0);
  if (params.status === "degraded" || degraded > 0) {
    out -= clamp(3 + degraded * 3, 3, 10);
  }
  if (params.status === "stale" || params.ageHours >= 0.75) {
    out -= clamp((params.status === "stale" ? 3 : 0) + params.ageHours * 1.6, 0, 22);
  }
  return Math.round(clamp(out, 24, 99));
}
