/**
 * ATMOS v5.0 — Wave 2 (ARC-03): 80-Province Unified Scale-Equivariant Simplex MOS,
 * MGM ALARO 4.5 km 0–72h Mesoscale Hook & Regime-Gated C^1 Bimodal Calibration Engine
 * File: lib/provinces/engine/province-mos-engine.ts
 *
 * Pure TypeScript / ESM module — ZERO `node:*` imports.
 * Executes both:
 *  - `TIER_A_EMPIRICAL_WMO` / `TIER_A_WMO`: 2-year WMO-trained non-negative simplex weights
 *    (sum(w_m) === 1, w_m >= 0) + physical surface driver residuals (`betaDrivers` / `driverBetasC`)
 *    strictly bounded by `maxResidualShiftC`.
 *  - `TIER_B_DONOR_ALARO` / `TIER_B_DONOR_KALMAN`: strictly zero constant intercept (`intercept === 0`),
 *    scale-equivariant donor simplex weights (sum(w_m) === 1) + MGM ALARO 4.5 km 0–72h mesoscale hook.
 * Integrates seamlessly with `resolveRegimeGatedBimodalCluster` ([0.45, 0.55] C^1 deadband) and
 * regional `qcAndMosBounds`.
 */

import type { KalmanMosModel } from "../../kalman-mos";
import type { CoreModelKey, HybridModelSnapshot } from "../../weather-types";
import {
  normalizeSimplexWeights,
  type CalibrationTier,
  type HorizonBucket,
  type ProvinceCalibrationBundle,
  type ProvincePrecipEmosCell,
  type ProvinceTempEmosCell,
  type RegionalQcAndMosBounds,
  type SeasonBucket,
  type SimplexModelWeightMap
} from "../types";
import {
  integrateProvinceVerticalDeltaC,
  type ProvinceEngineSpec,
  type ProvinceLiveVerticalProfile
} from "./province-vertical-profile";
import {
  computeRegimeGateFactor,
  resolveRegimeGatedBimodalCluster,
  type RegimeGatedBimodalResult,
  type TargetSynopticContext,
  type TrainingRegimeSummary
} from "./regime-bimodal-solver";

export type ProvinceMosTier =
  | CalibrationTier
  | "TIER_A_EMPIRICAL_WMO"
  | "TIER_B_DONOR_ALARO";

export type PartialModelSnapshot = Partial<HybridModelSnapshot>;

export interface ProvincePhysicalDriverValues {
  /** Clear-night radiative cooling index in [0, 1] */
  radiativeClearNight?: number;
  /** Daytime shortwave solar heating index in [0, 1] */
  solarHeating?: number;
  /** Cross-barrier Foehn wind projection (m/s or normalized driver) */
  foehnProjection?: number;
  /** Onshore water-air temperature differential (T_water - T_air, °C) */
  onshoreSstDeltaC?: number;
}

export interface DirectProvinceMosPackage {
  tier: ProvinceMosTier;
  weights: Partial<SimplexModelWeightMap>;
  interceptC?: number;
  diurnalHarmonicsC?: readonly [number, number, number, number];
  /** Physical driver betas `[radiativeClearNight, solarHeating, foehnProjection, onshoreSstDelta]` */
  betaDrivers?:
    | readonly [number, number, number, number]
    | Partial<Record<keyof ProvincePhysicalDriverValues, number>>;
  driverBetasC?: readonly [number, number, number, number];
  maxResidualShiftC?: number;
  alaroBlendMaxWeight?: number;
  stationElevationM?: number;
  spreadBaseC2?: number;
  spreadScale?: number;
  precipCell?: Partial<ProvincePrecipEmosCell>;
  windWeights?: Partial<SimplexModelWeightMap>;
  pressureWeights?: Partial<SimplexModelWeightMap>;
}

export interface EvaluateProvinceCalibratedHourInput {
  leadHours: number;
  localHour: number;
  month?: number; // 1..12 (for SeasonBucket resolution when `bundle` is provided)
  spec?: ProvinceEngineSpec;
  qcAndMos?: RegionalQcAndMosBounds;
  /** Either a full `ProvinceCalibrationBundle` or a direct `DirectProvinceMosPackage` */
  bundle?: ProvinceCalibrationBundle;
  mosPackage?: DirectProvinceMosPackage;
  tempSnapshot: PartialModelSnapshot;
  dewSnapshot?: PartialModelSnapshot;
  precipSnapshot?: PartialModelSnapshot;
  windSnapshot?: PartialModelSnapshot;
  pressureSnapshot?: PartialModelSnapshot;
  /** Physical drivers feeding Tier-A `betaDrivers` */
  drivers?: ProvincePhysicalDriverValues;
  /** Official MGM ALARO 4.5 km mesoscale hourly forecast hook (active on 0..72h) */
  mgmAlaroHourly?: {
    tempC?: number | null;
    rhPct?: number | null;
    windSpeedKmh?: number | null;
    isWet?: boolean | null;
  } | null;
  /** Target elevation transport from calibration reference station elevation */
  targetElevationM?: number;
  referenceElevationM?: number;
  verticalProfile?: ProvinceLiveVerticalProfile | null;
  lapseRateCPerKm?: number;
  /** Additional local microclimate offset (e.g. UHI, sea-breeze, directional Foehn) */
  microclimateOffsetC?: number;
  orographicPrecipMultiplier?: number;
  /** Live rolling Kalman-MOS model or explicit Kalman shift + synoptic regime gate inputs */
  liveKalmanMos?: KalmanMosModel | null;
  explicitKalmanShiftC?: number;
  trainingRegimeSummary?: TrainingRegimeSummary | null;
  targetSynopticContext?: TargetSynopticContext | null;
  /** Multi-center ensemble members for [0.45, 0.55] C^1 bimodal solver & spread calibration */
  ensembleTempMembersC?: readonly number[] | null;
  ensembleTempWeights?: readonly number[] | null;
  ensemblePopPct?: number | null;
  dProgDtTrendC?: number;
  /** Intraday live station origin residual for short-range AR(1) sensor anchoring (0..18h) */
  liveOriginResidualC?: number | null;
}

export interface ProvinceCalibratedHourResult {
  tier: "TIER_A_EMPIRICAL_WMO" | "TIER_B_DONOR_ALARO";
  temperatureC: number;
  simplexBackboneTempC: number;
  activeWeights: SimplexModelWeightMap;
  weightSum: number;
  activeModelCount: number;
  appliedInterceptC: number;
  appliedDriverShiftC: number;
  appliedAlaroBlendWeight: number;
  appliedKalmanShiftC: number;
  regimeGate: number;
  tempSigmaC: number;
  tempP10C: number;
  tempP90C: number;
  dewPointC: number | null;
  windSpeedKmh: number | null;
  pressureMslHpa: number | null;
  precipitationMm: number;
  precipProbabilityPct: number;
  bimodal: RegimeGatedBimodalResult | null;
}

const ALL_CORE_MODEL_KEYS: readonly CoreModelKey[] = [
  "ecmwfIfs",
  "ecmwfAifs",
  "icon",
  "ukmo",
  "meteofrance",
  "gfs",
  "gem",
  "jma"
];

function clamp(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo;
  return Math.max(lo, Math.min(hi, v));
}

function isFiniteNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function resolveSeasonBucket(month1To12: number): SeasonBucket {
  const m = clamp(Math.round(month1To12), 1, 12);
  if (m === 12 || m === 1 || m === 2) return "DJF";
  if (m >= 3 && m <= 5) return "MAM";
  if (m >= 6 && m <= 8) return "JJA";
  return "SON";
}

export function resolveHorizonBucket(leadHours: number): HorizonBucket {
  if (leadHours <= 42) return "d0_1";
  if (leadHours <= 108) return "d2_4";
  return "d5_7";
}

function canonicalizeTier(
  rawTier: ProvinceMosTier | undefined
): "TIER_A_EMPIRICAL_WMO" | "TIER_B_DONOR_ALARO" {
  if (rawTier === "TIER_A_EMPIRICAL_WMO" || rawTier === "TIER_A_WMO") {
    return "TIER_A_EMPIRICAL_WMO";
  }
  return "TIER_B_DONOR_ALARO";
}

/**
 * Computes strictly non-negative simplex weights over the currently available finite models
 * in `snapshot`, guaranteeing exact convex combination (`w_m >= 0` and `sum(w_m) === 1.0`)
 * for scale-equivariance across all extreme temperatures (`-45°C` to `+52°C`).
 */
export function evaluateSimplexCombination(
  snapshot: PartialModelSnapshot,
  rawWeights: Partial<SimplexModelWeightMap>
): {
  value: number | null;
  weights: SimplexModelWeightMap;
  weightSum: number;
  activeCount: number;
  weightedStd: number;
} {
  const availableKeys = ALL_CORE_MODEL_KEYS.filter((k) => isFiniteNum(snapshot[k]));
  if (availableKeys.length === 0) {
    const fallbackW = normalizeSimplexWeights(rawWeights);
    return {
      value: null,
      weights: fallbackW,
      weightSum: 1,
      activeCount: 0,
      weightedStd: 0
    };
  }

  const weights = normalizeSimplexWeights(rawWeights, availableKeys);
  let mean = 0;
  let weightSum = 0;
  for (const k of availableKeys) {
    const w = weights[k];
    mean += w * (snapshot[k] as number);
    weightSum += w;
  }

  let variance = 0;
  for (const k of availableKeys) {
    const diff = (snapshot[k] as number) - mean;
    variance += weights[k] * diff * diff;
  }

  return {
    value: mean,
    weights,
    weightSum,
    activeCount: availableKeys.length,
    weightedStd: Math.sqrt(Math.max(0, variance))
  };
}

function computeDriverLinearTermC(
  drivers: ProvincePhysicalDriverValues | undefined,
  betaTuple: readonly [number, number, number, number] | undefined,
  betaNamed:
    | readonly [number, number, number, number]
    | Partial<Record<keyof ProvincePhysicalDriverValues, number>>
    | undefined
): number {
  if (!drivers) return 0;
  const x0 = clamp(drivers.radiativeClearNight ?? 0, -1, 2);
  const x1 = clamp(drivers.solarHeating ?? 0, -1, 2);
  const x2 = clamp(drivers.foehnProjection ?? 0, -15, 25);
  const x3 = clamp(drivers.onshoreSstDeltaC ?? 0, -25, 25);

  if (Array.isArray(betaNamed)) {
    return (
      betaNamed[0] * x0 +
      betaNamed[1] * x1 +
      betaNamed[2] * x2 +
      betaNamed[3] * x3
    );
  }
  if (betaNamed && typeof betaNamed === "object") {
    const map = betaNamed as Partial<Record<keyof ProvincePhysicalDriverValues, number>>;
    return (
      (map.radiativeClearNight ?? 0) * x0 +
      (map.solarHeating ?? 0) * x1 +
      (map.foehnProjection ?? 0) * x2 +
      (map.onshoreSstDeltaC ?? 0) * x3
    );
  }
  if (betaTuple) {
    return (
      betaTuple[0] * x0 +
      betaTuple[1] * x1 +
      betaTuple[2] * x2 +
      betaTuple[3] * x3
    );
  }
  return 0;
}

/**
 * Evaluates a single calibrated forecast hour across any of the 80 non-Bursa provinces.
 */
export function evaluateProvinceCalibratedHour(
  input: EvaluateProvinceCalibratedHourInput
): ProvinceCalibratedHourResult {
  const leadHours = Math.max(0, input.leadHours);
  const localH = ((input.localHour % 24) + 24) % 24;
  const season = resolveSeasonBucket(input.month ?? 11);
  const horizon = resolveHorizonBucket(leadHours);

  const bounds: RegionalQcAndMosBounds = input.qcAndMos ??
    input.spec?.qcAndMosBounds ?? {
      minPlausibleTempC: -48,
      maxPlausibleTempC: 52,
      minPlausibleMslpHpa: 955,
      maxPlausibleMslpHpa: 1068,
      kalmanTempBiasCapC: 6.5
    };

  let resolvedTier: "TIER_A_EMPIRICAL_WMO" | "TIER_B_DONOR_ALARO" = "TIER_B_DONOR_ALARO";
  let rawTempWeights: Partial<SimplexModelWeightMap> = {
    ecmwfIfs: 0.26,
    ecmwfAifs: 0.2,
    icon: 0.22,
    ukmo: 0.1,
    meteofrance: 0.1,
    gfs: 0.04,
    gem: 0.04,
    jma: 0.04
  };
  let rawInterceptC = 0;
  let diurnalHarmonics: readonly [number, number, number, number] = [0, 0, 0, 0];
  let tupleBetas: readonly [number, number, number, number] | undefined;
  let namedBetas: DirectProvinceMosPackage["betaDrivers"] | undefined;
  let maxResidualShiftC = 2.8;
  let alaroMaxWeight = 0.24;
  let refStationElevM =
    input.referenceElevationM ?? input.spec?.primaryCenter.demVerifiedElevationM ?? 100;
  let spreadBaseC2 = 0.55;
  let spreadScale = 1.08;
  let precipCell: ProvincePrecipEmosCell | undefined;
  let windWeights: Partial<SimplexModelWeightMap> | undefined;
  let pressureWeights: Partial<SimplexModelWeightMap> | undefined;

  if (input.mosPackage) {
    const pkg = input.mosPackage;
    resolvedTier = canonicalizeTier(pkg.tier);
    rawTempWeights = pkg.weights;
    rawInterceptC = pkg.interceptC ?? 0;
    diurnalHarmonics = pkg.diurnalHarmonicsC ?? [0, 0, 0, 0];
    tupleBetas = pkg.driverBetasC;
    namedBetas = pkg.betaDrivers;
    maxResidualShiftC = Math.max(
      0,
      pkg.maxResidualShiftC ?? (resolvedTier === "TIER_A_EMPIRICAL_WMO" ? 3.2 : 1.8)
    );
    alaroMaxWeight = clamp(
      pkg.alaroBlendMaxWeight ?? (resolvedTier === "TIER_B_DONOR_ALARO" ? 0.24 : 0.12),
      0,
      0.5
    );
    if (isFiniteNum(pkg.stationElevationM)) refStationElevM = pkg.stationElevationM;
    if (isFiniteNum(pkg.spreadBaseC2)) spreadBaseC2 = Math.max(0.05, pkg.spreadBaseC2);
    if (isFiniteNum(pkg.spreadScale)) spreadScale = Math.max(0.1, pkg.spreadScale);
    if (pkg.precipCell) {
      precipCell = {
        weights: normalizeSimplexWeights(pkg.precipCell.weights ?? rawTempWeights),
        wetThresholdMmHr: pkg.precipCell.wetThresholdMmHr ?? 0.18,
        orographicAlpha: pkg.precipCell.orographicAlpha ?? 1.0,
        powerEta: pkg.precipCell.powerEta ?? 1.0,
        alaroBlendWeight0To36h: pkg.precipCell.alaroBlendWeight0To36h ?? 0.18
      };
    }
    windWeights = pkg.windWeights;
    pressureWeights = pkg.pressureWeights;
  } else if (input.bundle) {
    const b = input.bundle;
    resolvedTier = canonicalizeTier(b.calibrationTier);
    const tempCell: ProvinceTempEmosCell = b.temperature[season][horizon];
    rawTempWeights = tempCell.weights;
    rawInterceptC = tempCell.interceptC;
    diurnalHarmonics = tempCell.diurnalHarmonicsC;
    tupleBetas = tempCell.driverBetasC;
    maxResidualShiftC = resolvedTier === "TIER_A_EMPIRICAL_WMO" ? 3.2 : 1.8;
    alaroMaxWeight = resolvedTier === "TIER_B_DONOR_ALARO" ? 0.24 : 0.12;
    refStationElevM = input.referenceElevationM ?? b.stationElevationM;
    spreadBaseC2 = Math.max(0.05, tempCell.spreadBaseC2);
    spreadScale = Math.max(0.1, tempCell.spreadScale);
    precipCell = b.precipitation[season];
    windWeights = b.windWeights;
    pressureWeights = b.pressureWeights;
  } else if (input.spec) {
    resolvedTier = canonicalizeTier(input.spec.calibrationTier);
    alaroMaxWeight = resolvedTier === "TIER_B_DONOR_ALARO" ? 0.24 : 0.12;
  }

  // 1. Scale-Equivariant Non-Negative Simplex Combination (sum(w_m) === 1.000000)
  const tempSimplex = evaluateSimplexCombination(input.tempSnapshot, rawTempWeights);
  const simplexBackboneTempC = tempSimplex.value ?? 15.0;

  // 2. Tier-Specific Residual Model:
  //    - TIER_B_DONOR_ALARO strictly enforces `intercept === 0` and `diurnalHarmonics === 0`
  //      so donor provinces NEVER inherit a foreign station's additive elevation/UHI offset!
  //    - TIER_A_EMPIRICAL_WMO applies CV-fitted intercept + diurnal harmonics + physical drivers,
  //      strictly clamped to `[-maxResidualShiftC, +maxResidualShiftC]`.
  const appliedInterceptC =
    resolvedTier === "TIER_B_DONOR_ALARO"
      ? 0
      : clamp(rawInterceptC, -maxResidualShiftC, maxResidualShiftC);

  const rad1 = (2 * Math.PI * localH) / 24;
  const rad2 = (4 * Math.PI * localH) / 24;
  const diurnalTermC =
    resolvedTier === "TIER_B_DONOR_ALARO"
      ? 0
      : diurnalHarmonics[0] * Math.sin(rad1) +
        diurnalHarmonics[1] * Math.cos(rad1) +
        diurnalHarmonics[2] * Math.sin(rad2) +
        diurnalHarmonics[3] * Math.cos(rad2);

  const rawDriverTermC = computeDriverLinearTermC(input.drivers, tupleBetas, namedBetas);
  const totalEmosResidualC = clamp(
    appliedInterceptC + diurnalTermC + rawDriverTermC,
    -maxResidualShiftC,
    maxResidualShiftC
  );
  const appliedDriverShiftC = totalEmosResidualC - appliedInterceptC;

  let stationLevelTempC = simplexBackboneTempC + totalEmosResidualC;

  // 3. Official MGM ALARO 4.5 km Mesoscale Hook (0..72h)
  let appliedAlaroBlendWeight = 0;
  const alaroTempC = input.mgmAlaroHourly?.tempC;
  if (
    isFiniteNum(alaroTempC) &&
    leadHours <= 72 &&
    alaroMaxWeight > 0 &&
    alaroTempC >= bounds.minPlausibleTempC &&
    alaroTempC <= bounds.maxPlausibleTempC
  ) {
    const horizonRamp =
      leadHours <= 36
        ? 1.0
        : 0.5 * (1 + Math.cos(((leadHours - 36) / 36) * Math.PI));
    const diffAlaro = alaroTempC - stationLevelTempC;
    const softGain = Math.abs(diffAlaro) <= 3.8 ? 1.0 : 3.8 / Math.abs(diffAlaro);
    appliedAlaroBlendWeight = alaroMaxWeight * horizonRamp * softGain;
    stationLevelTempC += appliedAlaroBlendWeight * diffAlaro;
  }

  // 4. Vertical Transport from Station Reference Elevation to Target Point + Microclimate Offset
  const targetElevM = input.targetElevationM ?? refStationElevM;
  let elevationTransportDeltaC = 0;
  if (Math.abs(targetElevM - refStationElevM) >= 1) {
    if (input.verticalProfile) {
      elevationTransportDeltaC = integrateProvinceVerticalDeltaC(
        refStationElevM,
        targetElevM,
        input.verticalProfile
      );
    } else {
      const lapsePerKm = input.lapseRateCPerKm ?? -6.2;
      elevationTransportDeltaC = lapsePerKm * ((targetElevM - refStationElevM) / 1000);
    }
  }
  const microOffsetC = clamp(input.microclimateOffsetC ?? 0, -5.5, 5.5);
  const topoTotalOffsetC = elevationTransportDeltaC + microOffsetC;

  let deterministicCalibratedC = stationLevelTempC + topoTotalOffsetC;

  // 5. Regime-Guarded Rolling Kalman-MOS Shift (`kalmanTempBiasCapC` + `G_regime(h)`)
  let rawKalmanShiftC = 0;
  const effectiveTrainingSummary =
    input.trainingRegimeSummary ?? input.liveKalmanMos?.trainingRegimeSummary ?? null;

  if (isFiniteNum(input.explicitKalmanShiftC)) {
    rawKalmanShiftC = clamp(
      input.explicitKalmanShiftC,
      -bounds.kalmanTempBiasCapC,
      bounds.kalmanTempBiasCapC
    );
  } else if (input.liveKalmanMos && input.liveKalmanMos.active) {
    const bin = clamp(Math.floor(localH / 6), 0, 3);
    const persistDecay = Math.exp(-leadHours / 60);
    const transDecay = Math.exp(-leadHours / 10);
    const diurDecay = Math.exp(-leadHours / 72);
    let weightedBiasRemove = 0;
    for (const k of ALL_CORE_MODEL_KEYS) {
      const w = tempSimplex.weights[k];
      if (w <= 0) continue;
      const b = input.liveKalmanMos.biases[k];
      const biasRemove =
        b.tempPersistentBiasC * persistDecay +
        b.tempTransientBiasC * transDecay +
        0.72 * b.tempDiurnalBiasC[bin] * diurDecay;
      weightedBiasRemove += w * biasRemove;
    }
    rawKalmanShiftC = clamp(
      -weightedBiasRemove,
      -bounds.kalmanTempBiasCapC,
      bounds.kalmanTempBiasCapC
    );
  }

  const regimeGate = computeRegimeGateFactor({
    trainingRegimeSummary: effectiveTrainingSummary,
    targetSynopticContext: input.targetSynopticContext,
    kalmanShiftC: rawKalmanShiftC
  });
  const appliedKalmanShiftC = rawKalmanShiftC * regimeGate;
  deterministicCalibratedC += appliedKalmanShiftC;

  // Short-range intraday sensor origin residual decay (0..18h)
  if (leadHours <= 18 && isFiniteNum(input.liveOriginResidualC)) {
    const clampedOrigin = clamp(
      input.liveOriginResidualC,
      -bounds.kalmanTempBiasCapC,
      bounds.kalmanTempBiasCapC
    );
    deterministicCalibratedC += Math.pow(0.84, leadHours) * clampedOrigin * regimeGate;
  }

  // 6. Regime-Guarded C^1-Continuous [0.45, 0.55] Bimodal Cluster Solver (54h+)
  let bimodal: RegimeGatedBimodalResult | null = null;
  let finalTempC = deterministicCalibratedC;
  const members = input.ensembleTempMembersC ?? null;

  if (members && members.length >= 16 && leadHours >= 54) {
    const cluster = resolveRegimeGatedBimodalCluster({
      leadHours,
      baseTempC: deterministicCalibratedC,
      ensembleMembersC: members,
      ensembleWeights: input.ensembleTempWeights ?? undefined,
      dProgDtTrendC: input.dProgDtTrendC ?? 0,
      topoOffsetC: topoTotalOffsetC + totalEmosResidualC,
      kalmanShiftC: rawKalmanShiftC,
      regimeGate,
      trainingRegimeSummary: effectiveTrainingSummary,
      targetSynopticContext: input.targetSynopticContext
    });
    bimodal = cluster;
    if (cluster.isBimodal) {
      finalTempC = cluster.adjustedTempC;
    }
  }

  finalTempC = clamp(finalTempC, bounds.minPlausibleTempC, bounds.maxPlausibleTempC);

  // 7. Calibrated Predictive Spread & P10 / P90 Bounds
  let ensStdC = tempSimplex.weightedStd;
  if (members && members.length >= 8) {
    const cleanM = members.filter((v) => Number.isFinite(v));
    if (cleanM.length >= 8) {
      const mu = cleanM.reduce((a, b) => a + b, 0) / cleanM.length;
      const v = cleanM.reduce((a, b) => a + (b - mu) ** 2, 0) / cleanM.length;
      ensStdC = 0.5 * ensStdC + 0.5 * Math.sqrt(Math.max(0, v));
    }
  }
  const tempSigmaC = Math.sqrt(spreadBaseC2 + spreadScale * ensStdC * ensStdC);
  const tempP10C = clamp(
    finalTempC - 1.2816 * tempSigmaC,
    bounds.minPlausibleTempC,
    finalTempC
  );
  const tempP90C = clamp(
    finalTempC + 1.2816 * tempSigmaC,
    finalTempC,
    bounds.maxPlausibleTempC
  );

  // 8. Companion Dew Point, Wind, Pressure & Precipitation Calibration
  let dewPointC: number | null = null;
  if (input.dewSnapshot) {
    const dewSimplex = evaluateSimplexCombination(input.dewSnapshot, tempSimplex.weights);
    if (dewSimplex.value !== null) {
      const dzKm = (targetElevM - refStationElevM) / 1000;
      dewPointC = Number(Math.min(finalTempC, dewSimplex.value - 2.0 * dzKm).toFixed(2));
    }
  }

  let windSpeedKmh: number | null = null;
  if (input.windSnapshot) {
    const wSimplex = evaluateSimplexCombination(
      input.windSnapshot,
      windWeights ?? rawTempWeights
    );
    if (wSimplex.value !== null) {
      let wVal = Math.max(0, wSimplex.value);
      if (leadHours <= 48 && isFiniteNum(input.mgmAlaroHourly?.windSpeedKmh)) {
        const wAlaro = Math.max(0, input.mgmAlaroHourly!.windSpeedKmh!);
        const blend = 0.18 * Math.max(0, 1 - leadHours / 48);
        wVal = (1 - blend) * wVal + blend * wAlaro;
      }
      windSpeedKmh = Number(wVal.toFixed(1));
    }
  }

  let pressureMslHpa: number | null = null;
  if (input.pressureSnapshot) {
    const pSimplex = evaluateSimplexCombination(
      input.pressureSnapshot,
      pressureWeights ?? rawTempWeights
    );
    if (pSimplex.value !== null) {
      pressureMslHpa = Number(
        clamp(pSimplex.value, bounds.minPlausibleMslpHpa, bounds.maxPlausibleMslpHpa).toFixed(1)
      );
    }
  }

  let precipitationMm = 0;
  let precipProbabilityPct = 0;
  if (input.precipSnapshot) {
    const pWeights = precipCell?.weights ?? rawTempWeights;
    const pSimplex = evaluateSimplexCombination(input.precipSnapshot, pWeights);
    const wetThr = precipCell?.wetThresholdMmHr ?? 0.18;
    const oroMult =
      (input.orographicPrecipMultiplier ?? 1.0) * (precipCell?.orographicAlpha ?? 1.0);

    let wetVoteWeight = 0;
    for (const k of ALL_CORE_MODEL_KEYS) {
      const v = input.precipSnapshot[k];
      const w = pSimplex.weights[k];
      if (isFiniteNum(v) && w > 0 && v * oroMult >= wetThr) {
        wetVoteWeight += w;
      }
    }

    let rawPop = wetVoteWeight * 100;
    if (isFiniteNum(input.ensemblePopPct)) {
      const ensW = clamp(0.28 + (leadHours / 168) * 0.4, 0.28, 0.68);
      rawPop = (1 - ensW) * rawPop + ensW * clamp(input.ensemblePopPct, 0, 100);
    }
    if (
      leadHours <= 36 &&
      input.mgmAlaroHourly?.isWet !== null &&
      input.mgmAlaroHourly?.isWet !== undefined
    ) {
      const alaroNudge = (precipCell?.alaroBlendWeight0To36h ?? 0.16) * 50;
      rawPop = input.mgmAlaroHourly.isWet
        ? Math.min(98, rawPop + alaroNudge)
        : Math.max(0, rawPop - alaroNudge * 0.65);
    }

    precipProbabilityPct = Math.round(clamp(rawPop, 0, 99));
    if (precipProbabilityPct >= 38 && pSimplex.value !== null) {
      const powerEta = clamp(precipCell?.powerEta ?? 1.0, 0.7, 1.35);
      const scaledMm =
        Math.pow(Math.max(0, pSimplex.value), powerEta) * Math.max(0.15, oroMult);
      precipitationMm = scaledMm >= 0.06 ? Number(scaledMm.toFixed(2)) : 0;
    }
  }

  return {
    tier: resolvedTier,
    temperatureC: Number(finalTempC.toFixed(2)),
    simplexBackboneTempC: Number(simplexBackboneTempC.toFixed(3)),
    activeWeights: tempSimplex.weights,
    weightSum: Number(tempSimplex.weightSum.toFixed(6)),
    activeModelCount: tempSimplex.activeCount,
    appliedInterceptC: Number(appliedInterceptC.toFixed(3)),
    appliedDriverShiftC: Number(appliedDriverShiftC.toFixed(3)),
    appliedAlaroBlendWeight: Number(appliedAlaroBlendWeight.toFixed(3)),
    appliedKalmanShiftC: Number(appliedKalmanShiftC.toFixed(3)),
    regimeGate: Number(regimeGate.toFixed(4)),
    tempSigmaC: Number(tempSigmaC.toFixed(2)),
    tempP10C: Number(tempP10C.toFixed(1)),
    tempP90C: Number(tempP90C.toFixed(1)),
    dewPointC,
    windSpeedKmh,
    pressureMslHpa,
    precipitationMm,
    precipProbabilityPct,
    bimodal
  };
}
