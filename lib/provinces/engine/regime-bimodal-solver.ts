/**
 * ARC-04 — Regime-Guarded Physical Gate G_regime(h) & Skewness-Free C^1-Continuous
 * [0.45, 0.55] Bimodal Ensemble Cluster Solver
 *
 * Eliminates:
 *  1. Cross-airmass Kalman warm-bias carryover (e.g., +16°C Lodos foehn bias leaking into
 *     -8°C 850 hPa polar Poyraz snow outbreaks).
 *  2. Skewness contamination from `localBiasShift = emosTempC - ensMean` (which dragged cold
 *     snow clusters up by +3..+4.5°C when deterministic/EMOS lagged warm).
 *  3. Knife-edge 10°C jumps across 51/49 -> 49/51 ensemble splits via a globally C^1-continuous
 *     Hermite dominance curve alpha_dom(p) and a [0.45, 0.55] dProg/dt margin deadband.
 */

export interface TrainingRegimeSummary {
  meanTemp2mC: number | null;
  meanTemp850C: number | null;
  meanWind850U: number | null;
  meanWind850V: number | null;
}

export interface TargetSynopticContext {
  temp850C?: number | null;
  wind850DirDeg?: number | null;
  wind850SpeedKmh?: number | null;
  wetBulbC?: number | null;
  popPct?: number | null;
}

export interface ComputeRegimeGateParams {
  trainingRegimeSummary?: TrainingRegimeSummary | null;
  targetSynopticContext?: TargetSynopticContext | null;
  /**
   * Proposed additive forecast temperature shift (`corr - raw = -biasRemove`).
   * Positive (`> 0`) means a warming correction (`biasRemove < 0`).
   */
  kalmanShiftC?: number;
  /**
   * Alternative raw bias removal sign (`raw - corr`).
   * Negative (`< 0`) means a warming correction (`corr = raw - biasRemove > raw`).
   */
  biasRemoveC?: number;
}

export interface RegimeGateComponents {
  gate: number;
  airmassGate: number;
  windGate: number;
  phaseGate: number;
}

export interface RegimeGatedBimodalInput {
  leadHours?: number;
  baseTempC?: number;
  emosTempC?: number;
  ensembleMembersC: readonly number[];
  ensembleWeights?: readonly number[];
  dProgDtTrendC?: number;
  /**
   * Explicit regime-safe local topographic + gated Kalman offset (clamped to [-2.2, 2.2] °C).
   * When omitted, computed as `clamp(topoOffsetC + regimeGate * kalmanShiftC, -2.2, 2.2)`.
   */
  regimeSafeLocalOffsetC?: number;
  topoOffsetC?: number;
  kalmanShiftC?: number;
  regimeGate?: number;
  trainingRegimeSummary?: TrainingRegimeSummary | null;
  targetSynopticContext?: TargetSynopticContext | null;
}

export interface RegimeGatedBimodalResult {
  adjustedTempC: number;
  isBimodal: boolean;
  separationC: number;
  ashmanD: number;
  winningClusterWeight: number;
  coldClusterFraction: number;
  warmClusterFraction: number;
  effectiveWarmFraction: number;
  warmAlphaWeight: number;
  coldAlphaWeight: number;
  coldModeC: number;
  warmModeC: number;
  appliedLocalOffsetC: number;
  regimeGate: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * Converts meteorological wind (from-direction in degrees, speed in km/h)
 * into standard zonal/meridional (U, V) components in km/h.
 */
export function windDirSpeedToUVKmh(
  windFromDirDeg: number,
  windSpeedKmh: number
): { u: number; v: number } {
  const rad = (windFromDirDeg * Math.PI) / 180;
  const spd = Math.max(0, windSpeedKmh);
  return {
    u: -spd * Math.sin(rad),
    v: -spd * Math.cos(rad)
  };
}

/**
 * Evaluates all 3 physical components of the synoptic regime gate G_regime(h) in [0, 1]:
 *  - G_airmass: exp(-(DeltaT850 / 5.0)^2)
 *  - G_wind: speed-gated (>= 12 km/h) cosine damping vanishing at >= 120° vector rotation
 *  - G_phase: wet-bulb snow/melting shield clamp((Tw - 0.2) / 2.0, 0, 1) when training was
 *    mild (meanTemp2mC > 6°C), correction is warming, and target enters Tw <= 1.8°C & PoP >= 30%.
 */
export function evaluateRegimeGateComponents(
  params: ComputeRegimeGateParams
): RegimeGateComponents {
  const { trainingRegimeSummary, targetSynopticContext, kalmanShiftC, biasRemoveC } = params;

  if (!targetSynopticContext || !trainingRegimeSummary) {
    return {
      gate: 1.0,
      airmassGate: 1.0,
      windGate: 1.0,
      phaseGate: 1.0
    };
  }

  // 1. Airmass thermal gate G_airmass = exp(-(|T850(h) - T850_train| / 5.0)^2)
  let airmassGate = 1.0;
  if (
    isFiniteNumber(targetSynopticContext.temp850C) &&
    isFiniteNumber(trainingRegimeSummary.meanTemp850C)
  ) {
    const deltaT850 = Math.abs(
      targetSynopticContext.temp850C - trainingRegimeSummary.meanTemp850C
    );
    airmassGate = Math.exp(-((deltaT850 / 5.0) ** 2));
  }

  // 2. Speed-gated 850 hPa wind vector cosine gate G_wind (damps >= 120° reversals at >= 12 km/h)
  let windGate = 1.0;
  if (
    isFiniteNumber(targetSynopticContext.wind850DirDeg) &&
    isFiniteNumber(targetSynopticContext.wind850SpeedKmh) &&
    isFiniteNumber(trainingRegimeSummary.meanWind850U) &&
    isFiniteNumber(trainingRegimeSummary.meanWind850V)
  ) {
    const trainU = trainingRegimeSummary.meanWind850U;
    const trainV = trainingRegimeSummary.meanWind850V;
    const trainSpd = Math.hypot(trainU, trainV);
    const targetSpd = Math.max(0, targetSynopticContext.wind850SpeedKmh);

    if (trainSpd >= 1e-3 && targetSpd >= 1e-3) {
      const targetVec = windDirSpeedToUVKmh(
        targetSynopticContext.wind850DirDeg,
        targetSpd
      );
      const cosDelta = clamp(
        (trainU * targetVec.u + trainV * targetVec.v) / (trainSpd * targetSpd),
        -1,
        1
      );
      // Speed gate reaches 1.0 at >= 12 km/h and vanishes for light/calm winds
      const targetSpeedGate = clamp((targetSpd - 8.0) / 4.0, 0, 1);
      const trainSpeedGate = clamp((trainSpd - 6.0) / 6.0, 0, 1);
      const speedGate = targetSpeedGate * trainSpeedGate;
      // Cosine gate is 1.0 for <= ~45° sector wobble and hits 0.0 at >= 120° (cos <= -0.5)
      const cosFactor = clamp((cosDelta + 0.5) / 1.2, 0, 1);
      windGate = 1 - speedGate * (1 - cosFactor);
    }
  }

  // 3. Snow / melting phase boundary shield G_phase
  let phaseGate = 1.0;
  const hasExplicitCorrectionSign =
    isFiniteNumber(kalmanShiftC) || isFiniteNumber(biasRemoveC);
  const effectiveWarmShiftC = isFiniteNumber(kalmanShiftC)
    ? kalmanShiftC
    : isFiniteNumber(biasRemoveC)
      ? -biasRemoveC
      : 1;
  const isWarmingCorrection = !hasExplicitCorrectionSign || effectiveWarmShiftC > 0;

  if (
    isWarmingCorrection &&
    isFiniteNumber(trainingRegimeSummary.meanTemp2mC) &&
    trainingRegimeSummary.meanTemp2mC > 6.0 &&
    isFiniteNumber(targetSynopticContext.wetBulbC) &&
    targetSynopticContext.wetBulbC <= 1.8 &&
    isFiniteNumber(targetSynopticContext.popPct) &&
    targetSynopticContext.popPct >= 30
  ) {
    phaseGate = clamp((targetSynopticContext.wetBulbC - 0.2) / 2.0, 0, 1);
  }

  const gate = clamp(airmassGate * windGate * phaseGate, 0, 1);
  return {
    gate,
    airmassGate,
    windGate,
    phaseGate
  };
}

/**
 * Returns the composite physical regime gate G_regime(h) in [0, 1].
 */
export function computeRegimeGateFactor(params: ComputeRegimeGateParams): number {
  return evaluateRegimeGateComponents(params).gate;
}

/**
 * Evaluates the C^1-continuous warm-cluster dominance weight alpha_dom(p) on [0, 1]:
 *  - Inside the [0.45, 0.55] indecision band: alpha_dom(p) = p (unit slope 1.0, so a
 *    0.51 -> 0.49 split across a 10°C front shifts output by only 0.20°C instead of 10°C).
 *  - On [0.15, 0.45] and [0.55, 0.85]: exact C^1-matched cubic Hermite ramps matching
 *    value & derivative (= 1.0) at 0.45/0.55 and value (0 / 1) & derivative (= 0.0) at 0.15/0.85.
 *  - At strong cold consensus p = 0.20 (80% cold cluster): cold lock 1 - alpha_dom(0.20) = 97.36% (>= 95%).
 */
export function computeDominantClusterWeightC1(warmFractionP: number): number {
  const p = clamp(warmFractionP, 0, 1);
  const delta = p - 0.5;
  const absDelta = Math.abs(delta);

  const deadbandHalfWidth = 0.05; // [0.45, 0.55]
  const lockHalfWidth = 0.35; // full lock at <= 0.15 and >= 0.85

  if (absDelta <= deadbandHalfWidth + 1e-12) {
    return p;
  }
  if (absDelta >= lockHalfWidth - 1e-12) {
    return delta >= 0 ? 1 : 0;
  }

  const span = lockHalfWidth - deadbandHalfWidth; // 0.30
  const u = clamp((absDelta - deadbandHalfWidth) / span, 0, 1);
  // Cubic Hermite H(u): H(0)=0.05, H'(0)=span*1.0=0.30, H(1)=0.50, H'(1)=0
  const h10 = u * (1 - u) * (1 - u);
  const h01 = u * u * (3 - 2 * u);
  const psi = deadbandHalfWidth + span * h10 + (0.5 - deadbandHalfWidth) * h01;

  return delta >= 0 ? 0.5 + psi : 0.5 - psi;
}

/**
 * Smooth C^1 deadband gate g_margin(p) in [0, 1] for dProg/dt momentum nudges:
 *  - Identically 0 inside [0.45, 0.55] so single-run dProg/dt noise never flips a near-50/50 split.
 *  - Smoothly ramps (zero derivative at knots) to 1.0 for |p - 0.5| >= 0.15, tapering to 0 at boundaries.
 */
export function computeDeadbandMarginGate(warmFractionP: number): number {
  const p = clamp(warmFractionP, 0, 1);
  const absDelta = Math.abs(p - 0.5);
  if (absDelta <= 0.05 + 1e-12) return 0;

  const u = clamp((absDelta - 0.05) / 0.10, 0, 1);
  const rampIn = u * u * (3 - 2 * u);

  // Taper smoothly near 0 and 1 so p_eff stays strictly smooth inside [0, 1]
  const edgeDist = Math.min(p, 1 - p);
  const v = clamp(edgeDist / 0.12, 0, 1);
  const edgeTaper = v * v * (3 - 2 * v);

  return rampIn * edgeTaper;
}

/**
 * Skewness-free, regime-gated, C^1-continuous bimodal ensemble cluster solver.
 */
export function resolveRegimeGatedBimodalCluster(
  params: RegimeGatedBimodalInput
): RegimeGatedBimodalResult {
  const {
    leadHours = 120,
    ensembleMembersC,
    ensembleWeights,
    dProgDtTrendC = 0,
    topoOffsetC = 0,
    kalmanShiftC = 0,
    trainingRegimeSummary,
    targetSynopticContext
  } = params;

  const effectiveRegimeGate = isFiniteNumber(params.regimeGate)
    ? clamp(params.regimeGate, 0, 1)
    : computeRegimeGateFactor({
        trainingRegimeSummary,
        targetSynopticContext,
        kalmanShiftC
      });

  const appliedLocalOffsetC = isFiniteNumber(params.regimeSafeLocalOffsetC)
    ? clamp(params.regimeSafeLocalOffsetC, -2.2, 2.2)
    : clamp(topoOffsetC + effectiveRegimeGate * kalmanShiftC, -2.2, 2.2);

  const pairs = ensembleMembersC
    .map((v, i) => ({ v, w: ensembleWeights?.[i] ?? 1 }))
    .filter((p) => Number.isFinite(p.v) && Number.isFinite(p.w) && p.w > 0)
    .sort((a, b) => a.v - b.v);

  const totalW = pairs.reduce((acc, p) => acc + p.w, 0);
  const rawEnsMean =
    totalW > 0
      ? pairs.reduce((acc, p) => acc + p.w * p.v, 0) / totalW
      : 0;

  const fallbackRefTempC = isFiniteNumber(params.baseTempC)
    ? params.baseTempC
    : isFiniteNumber(params.emosTempC)
      ? params.emosTempC
      : rawEnsMean + appliedLocalOffsetC;

  if (pairs.length < 16 || leadHours < 54 || totalW <= 0) {
    const cleanRef = Number(fallbackRefTempC.toFixed(3));
    return {
      adjustedTempC: cleanRef,
      isBimodal: false,
      separationC: 0,
      ashmanD: 0,
      winningClusterWeight: 1,
      coldClusterFraction: 0.5,
      warmClusterFraction: 0.5,
      effectiveWarmFraction: 0.5,
      warmAlphaWeight: 0.5,
      coldAlphaWeight: 0.5,
      coldModeC: cleanRef,
      warmModeC: cleanRef,
      appliedLocalOffsetC: Number(appliedLocalOffsetC.toFixed(3)),
      regimeGate: Number(effectiveRegimeGate.toFixed(4))
    };
  }

  // Apply ONLY regime-safe local topographic/Kalman offset (NEVER `emosTempC - ensMean`!)
  const shifted = pairs.map((p) => ({
    v: p.v + appliedLocalOffsetC,
    w: p.w
  }));

  let cum = 0;
  let shiftedP25 = shifted[0].v;
  let shiftedP75 = shifted[shifted.length - 1].v;
  let foundP25 = false;
  for (const p of shifted) {
    cum += p.w;
    if (!foundP25 && cum >= 0.25 * totalW) {
      shiftedP25 = p.v;
      foundP25 = true;
    }
    if (cum >= 0.75 * totalW) {
      shiftedP75 = p.v;
      break;
    }
  }

  // Globally optimal 1D Fisher/Otsu weighted 2-means split (mu0 < mu1)
  const totalSumWV = shifted.reduce((acc, p) => acc + p.w * p.v, 0);
  let bestObj = -1;
  let c0 = shiftedP25;
  let c1 = shiftedP75;
  let runW0 = 0;
  let runWV0 = 0;

  for (let i = 0; i < shifted.length - 1; i++) {
    runW0 += shifted[i].w;
    runWV0 += shifted[i].w * shifted[i].v;
    if (shifted[i].v === shifted[i + 1].v) continue;
    const runW1 = totalW - runW0;
    if (runW0 < 0.14 * totalW || runW1 < 0.14 * totalW) continue;
    const mu0 = runWV0 / runW0;
    const mu1 = (totalSumWV - runWV0) / runW1;
    const obj = runW0 * runW1 * (mu1 - mu0) ** 2;
    if (obj > bestObj) {
      bestObj = obj;
      c0 = mu0;
      c1 = mu1;
    }
  }

  if (c0 > c1) {
    const tmp = c0;
    c0 = c1;
    c1 = tmp;
  }

  const mid = 0.5 * (c0 + c1);
  let w0 = 0;
  let sumWV0 = 0;
  let w1 = 0;
  let sumWV1 = 0;
  for (const p of shifted) {
    if (p.v <= mid) {
      w0 += p.w;
      sumWV0 += p.w * p.v;
    } else {
      w1 += p.w;
      sumWV1 += p.w * p.v;
    }
  }

  if (w0 > 0 && w1 > 0) {
    c0 = sumWV0 / w0;
    c1 = sumWV1 / w1;
  }

  let var0 = 0;
  let var1 = 0;
  for (const p of shifted) {
    if (p.v <= mid) {
      var0 += p.w * (p.v - c0) ** 2;
    } else {
      var1 += p.w * (p.v - c1) ** 2;
    }
  }

  const frac0 = w0 / Math.max(1e-6, totalW);
  const frac1 = w1 / Math.max(1e-6, totalW);
  const sd0 = Math.max(0.35, Math.sqrt(var0 / Math.max(1e-6, w0)));
  const sd1 = Math.max(0.35, Math.sqrt(var0 >= 0 ? var1 / Math.max(1e-6, w1) : 0));
  const separationC = Math.max(0, c1 - c0);
  const ashmanD = (Math.SQRT2 * separationC) / Math.sqrt(sd0 * sd0 + sd1 * sd1);

  const isBimodal =
    separationC >= 2.6 && ashmanD >= 2.0 && Math.min(frac0, frac1) >= 0.15;

  if (!isBimodal) {
    const cleanRef = Number(fallbackRefTempC.toFixed(3));
    return {
      adjustedTempC: cleanRef,
      isBimodal: false,
      separationC: Number(separationC.toFixed(3)),
      ashmanD: Number(ashmanD.toFixed(3)),
      winningClusterWeight: Number(Math.max(frac0, frac1).toFixed(3)),
      coldClusterFraction: Number(frac0.toFixed(4)),
      warmClusterFraction: Number(frac1.toFixed(4)),
      effectiveWarmFraction: Number(frac1.toFixed(4)),
      warmAlphaWeight: Number(frac1.toFixed(4)),
      coldAlphaWeight: Number(frac0.toFixed(4)),
      coldModeC: Number(c0.toFixed(3)),
      warmModeC: Number(c1.toFixed(3)),
      appliedLocalOffsetC: Number(appliedLocalOffsetC.toFixed(3)),
      regimeGate: Number(effectiveRegimeGate.toFixed(4))
    };
  }

  // Deadband-guarded effective warm cluster fraction p_eff in [0, 1]
  const gMargin = computeDeadbandMarginGate(frac1);
  const momentumNudge = clamp(dProgDtTrendC * 0.035, -0.06, 0.06);
  const effectiveWarmFraction = clamp(frac1 + gMargin * momentumNudge, 0, 1);

  // C^1-continuous cluster dominance weight across all of [0, 1]
  const warmAlphaWeight = computeDominantClusterWeightC1(effectiveWarmFraction);
  const coldAlphaWeight = 1 - warmAlphaWeight;
  const adjustedTempC = coldAlphaWeight * c0 + warmAlphaWeight * c1;
  const winningClusterWeight = warmAlphaWeight >= 0.5 ? frac1 : frac0;

  return {
    adjustedTempC: Number(adjustedTempC.toFixed(3)),
    isBimodal: true,
    separationC: Number(separationC.toFixed(3)),
    ashmanD: Number(ashmanD.toFixed(3)),
    winningClusterWeight: Number(winningClusterWeight.toFixed(3)),
    coldClusterFraction: Number(frac0.toFixed(4)),
    warmClusterFraction: Number(frac1.toFixed(4)),
    effectiveWarmFraction: Number(effectiveWarmFraction.toFixed(4)),
    warmAlphaWeight: Number(warmAlphaWeight.toFixed(4)),
    coldAlphaWeight: Number(coldAlphaWeight.toFixed(4)),
    coldModeC: Number(c0.toFixed(3)),
    warmModeC: Number(c1.toFixed(3)),
    appliedLocalOffsetC: Number(appliedLocalOffsetC.toFixed(3)),
    regimeGate: Number(effectiveRegimeGate.toFixed(4))
  };
}
