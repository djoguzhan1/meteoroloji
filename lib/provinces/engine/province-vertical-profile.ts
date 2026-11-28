/**
 * ATMOS v5.0 — Wave 2 (ARC-03): 80-Province Parametric Z_base-Relative Vertical Profile Solver
 * File: lib/provinces/engine/province-vertical-profile.ts
 *
 * Pure TypeScript / ESM module — ZERO `node:*` imports (safe for both Server and Client bundles).
 * Replaces Bursa's hardcoded `z < 400..550 m` assumption with a universal Z_base-relative
 * 3-layer hydrostatic column (`Z_i = Z_base + H_pool`), Weighted Least Squares (WLS) live station
 * lapse-rate estimation, snowpack-albedo nocturnal inversion amplification, and directional Foehn
 * dry-adiabatic blending.
 */

import type { NationalQcObservation } from "../mgm-national-live";
import type {
  DirectionalBarrierRule,
  ProvinceSpec,
  ProvinceZoneKind,
  SurfaceRelativeInversionSpec,
  TrProvinceCode
} from "../types";

export type ProvinceBoundaryLayerState =
  | "STRONG_INVERSION"
  | "SHALLOW_INVERSION"
  | "FOEHN_MIXED"
  | "MOIST_OROGRAPHIC"
  | "STANDARD_MIXED";

export interface ProvinceInversionAliasSpec {
  valleyFloorM?: number;
  coldPoolDepthM?: number;
  clearNightInversionLapseCPerKm?: number;
  snowpackBoostFactor?: number;
  enclosureIndex?: number;
}

export interface ProvinceBarrierAliasRule {
  id: string;
  labelTr?: string;
  effectiveBarrierHeightM: number;
  foehnWindSectorDeg?: { fromDeg: number; toDeg: number };
  upslopeWindSectorDeg?: { fromDeg: number; toDeg: number };
  rainShadowWindSectorDeg?: { fromDeg: number; toDeg: number };
  minCrossWindKmh?: number;
  minFroudeNumber?: number;
  maxFoehnWarmingC?: number;
  maxFoehnTargetElevationM?: number;
  sourcePlateauElevationM?: number;
  foehnRhDryingPct?: number;
  rainShadowMultiplier?: number;
  upslopePrecipMultiplier?: number;
  coastalConvergenceBoost?: number;
  applicableSubBasins?: readonly string[];
}

export interface ProvinceUhiAliasSpec {
  maxNocturnalUhiC?: number;
  referenceUrbanFraction?: number;
  coldBasinAirportIcaos?: readonly string[];
}

export interface ProvinceSeaBreezeAliasSpec {
  enabled?: boolean;
  activeMonths?: readonly [number, number];
  onshoreSectorDeg?: { fromDeg: number; toDeg: number };
  maxCoolingC?: number;
  inlandDecayScaleKm?: number;
  coastReferenceCoord?: { lat: number; lon: number };
}

/**
 * Supports the canonical `ProvinceSpec` from `lib/provinces/types.ts` as well as optional
 * ergonomic alias fields (`inversion`, `barriers`, `urbanHeatIsland`, `seaBreeze`, `qcBounds`).
 */
export type ProvinceEngineSpec = ProvinceSpec & {
  inversion?: ProvinceInversionAliasSpec;
  barriers?: readonly (DirectionalBarrierRule | ProvinceBarrierAliasRule)[];
  urbanHeatIsland?: ProvinceUhiAliasSpec;
  seaBreeze?: ProvinceSeaBreezeAliasSpec;
  qcBounds?: Partial<ProvinceSpec["qcAndMosBounds"]>;
};

export interface ProvinceLiveStationObs {
  stationId: string | number;
  provinceCode: TrProvinceCode | string;
  name?: string;
  icaoId?: string;
  lat: number;
  lon: number;
  elevationM: number;
  tempC: number | null;
  dewPointC?: number | null;
  relHumidityPct?: number | null;
  pressureMslHpa?: number | null;
  pressureStationHpa?: number | null;
  windSpeedKmh?: number | null;
  windGustKmh?: number | null;
  windDirDeg?: number | null;
  precip1hMm?: number | null;
  precip10MinMm?: number | null;
  snowDepthCm?: number | null;
  isPrecipitating?: boolean | null;
  ageMinutes?: number;
  qcWeight?: number;
  tier?: 1 | 2 | 3;
  subBasinId?: string;
  zone?: ProvinceZoneKind;
  stratumRole?: "basin_floor" | "coastal_or_gap" | "mid_slope" | "alpine_snow";
  urbanFraction?: number;
  coldPoolSusceptibility?: number;
  isCoastal?: boolean;
  excludeFromCenterHeadline?: boolean;
}

export interface ProvinceLiveVerticalProfile {
  readonly provinceCode: TrProvinceCode;
  /** Valley / basin floor anchor Z_base (m MSL) */
  readonly valleyFloorM: number;
  /** Cold-air pool thickness H_pool (m) */
  readonly coldPoolDepthM: number;
  /** Cold-air pool top altitude Z_i = Z_base + H_pool (m MSL, e.g. Erzurum 1758 + 380 = 2138 m) */
  readonly coldPoolTopM: number;
  /** Mid-slope transition altitude knot (m MSL) */
  readonly midSlopeTopM: number;
  /** Summit / alpine ceiling knot (m MSL) */
  readonly alpineTopM: number;
  /** Composite column lapse rate gamma (°C/km; positive = temperature increases with height = inversion) */
  readonly lapseRateCPerKm: number;
  /** Layer 1 [<= Z_i] cold-pool lapse rate (°C/km) */
  readonly lowerPoolLapseCPerKm: number;
  /** Layer 2 [Z_i .. midSlopeTopM] mid-slope lapse rate (°C/km) */
  readonly midSlopeLapseCPerKm: number;
  /** Layer 3 [> midSlopeTopM] alpine lapse rate (°C/km) */
  readonly upperAlpineLapseCPerKm: number;
  /** Raw WLS observed lapse rate across valid in-province station pairs (null when insufficient pairs) */
  readonly observedWlsLapseCPerKm: number | null;
  /** Diagnosed temperature inversion magnitude between Z_i and Z_base (°C, >= 0) */
  readonly inversionStrengthC: number;
  readonly boundaryLayerState: ProvinceBoundaryLayerState;
  readonly floorRefTempC: number | null;
  readonly mountainRefTempC: number | null;
  readonly measuredPairCount: number;
  readonly isDirectlyMeasured: boolean;
  readonly snowpackAmplified: boolean;
  readonly foehnMixedActive: boolean;
}

export interface ComputeProvinceVerticalProfileParams {
  spec: ProvinceEngineSpec;
  stations: readonly ProvinceLiveStationObs[];
  wind850DirDeg?: number | null;
  wind850SpeedKmh?: number | null;
  wind10mDirDeg?: number | null;
  wind10mSpeedKmh?: number | null;
  cloudCoverPct?: number | null;
  isNight?: boolean;
  hasSnowpack?: boolean;
  shortwaveRadiationWm2?: number | null;
}

const EARTH_RADIUS_KM = 6371.0;

function clamp(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo;
  return Math.max(lo, Math.min(hi, v));
}

function isFiniteNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Checks whether a meteorological wind direction `dirDeg` [0..360) falls inside a clockwise
 * sector `[fromDeg, toDeg]` (handles wrap-around across 360°/0°, e.g. `fromDeg=330, toDeg=45`)
 * and returns a smooth cosine alignment weight in `[0, 1]`.
 */
export function computeSectorAlignmentCos(
  dirDeg: number,
  fromDeg: number,
  toDeg: number
): { inside: boolean; alignment: number; angularOffsetDeg: number } {
  const norm = (d: number) => ((d % 360) + 360) % 360;
  const d = norm(dirDeg);
  const f = norm(fromDeg);
  const t = norm(toDeg);

  const span = (t - f + 360) % 360;
  const effectiveSpan = span === 0 ? 360 : span;
  const rel = (d - f + 360) % 360;
  const inside = rel <= effectiveSpan + 1e-9;

  const halfSpan = Math.max(5, effectiveSpan * 0.5);
  const center = norm(f + effectiveSpan * 0.5);
  const rawDiff = Math.abs(d - center) % 360;
  const angularOffsetDeg = rawDiff > 180 ? 360 - rawDiff : rawDiff;

  if (!inside) {
    return { inside: false, alignment: 0, angularOffsetDeg };
  }
  const cosVal = Math.cos(
    clamp(angularOffsetDeg / halfSpan, 0, 1) * (Math.PI * 0.5)
  );
  return {
    inside: true,
    alignment: clamp(Math.max(0.15, cosVal), 0, 1),
    angularOffsetDeg
  };
}

export function angularDifferenceDeg(aDeg: number, bDeg: number): number {
  const diff = Math.abs(aDeg - bDeg) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Adapts a Wave-1 `NationalQcObservation` into a `ProvinceLiveStationObs` while preserving
 * strict `provinceCode` ownership and DEM-repaired elevation.
 */
export function adaptNationalQcObservationToLiveObs(
  obs: NationalQcObservation
): ProvinceLiveStationObs {
  const windKmh =
    obs.windSpeedKt !== null && Number.isFinite(obs.windSpeedKt)
      ? obs.windSpeedKt * 1.852
      : null;
  const precip1h =
    obs.precip1HrMm !== null && Number.isFinite(obs.precip1HrMm)
      ? obs.precip1HrMm
      : obs.precip10MinMm !== null && Number.isFinite(obs.precip10MinMm)
        ? obs.precip10MinMm * 6
        : null;

  return {
    stationId: obs.station.sondurumIstNo || obs.station.merkezId,
    provinceCode: obs.station.provinceCode,
    name: `${obs.station.il} / ${obs.station.ilce}`,
    lat: obs.station.lat,
    lon: obs.station.lon,
    elevationM: obs.station.elevationM,
    tempC: obs.tempC,
    dewPointC: obs.dewPointC,
    relHumidityPct: obs.relHumidityPct,
    pressureMslHpa: obs.pressureMslHpa,
    pressureStationHpa: obs.pressureStationHpa,
    windSpeedKmh: windKmh,
    windGustKmh: null,
    windDirDeg: obs.windDirDeg,
    precip1hMm: precip1h,
    precip10MinMm: obs.precip10MinMm,
    snowDepthCm: obs.snowDepthCm,
    isPrecipitating: obs.isPrecipitating,
    ageMinutes: obs.ageMinutes,
    qcWeight: obs.qcWeight,
    tier: obs.tier,
    subBasinId: obs.station.subBasinId,
    zone: obs.station.zone,
    stratumRole: obs.station.stratumRole,
    urbanFraction: obs.station.urbanFraction,
    coldPoolSusceptibility: obs.station.coldPoolSusceptibility,
    isCoastal: obs.station.zone === "coastal_marine" || obs.station.zone === "peninsula_exposed"
  };
}

interface ResolvedInversionGeometry {
  valleyFloorM: number;
  coldPoolDepthM: number;
  coldPoolTopM: number;
  midSlopeTopM: number;
  alpineTopM: number;
  enclosureIndex: number;
  snowDepthTriggerCm: number;
  clearNightBaseLapseCPerKm: number;
  snowpackBoostFactor: number;
  maxSnowExtraCoolingC: number;
  shallowColdWedgeRule?: SurfaceRelativeInversionSpec["shallowColdWedgeRule"];
}

function resolveInversionGeometry(spec: ProvinceEngineSpec): ResolvedInversionGeometry {
  const canon = spec.inversionAndWedgeSpec;
  const alias = spec.inversion;
  const knots = spec.verticalProfileSpec?.piecewiseKnotsM ?? [0, 350, 1100, 2200];

  const valleyFloorM = Math.max(
    -50,
    alias?.valleyFloorM ?? canon?.basinFloorElevationM ?? knots[0] ?? 0
  );
  const coldPoolDepthM = clamp(
    alias?.coldPoolDepthM ?? canon?.coldPoolMaxDepthM ?? Math.max(180, knots[1] - valleyFloorM),
    80,
    1200
  );
  const coldPoolTopM = valleyFloorM + coldPoolDepthM;
  const midSlopeTopM = Math.max(
    coldPoolTopM + 250,
    knots[2] ?? coldPoolTopM + 650
  );
  const alpineTopM = Math.max(
    midSlopeTopM + 300,
    knots[3] ?? spec.verticalProfileSpec?.maxPhysicalPeakM ?? midSlopeTopM + 900
  );

  const enclosureIndex = clamp(
    alias?.enclosureIndex ?? canon?.topographicEnclosureIndex ?? 0.45,
    0,
    1
  );
  const snowDepthTriggerCm = Math.max(
    0.5,
    canon?.snowAlbedoFeedback?.snowDepthTriggerCm ?? 3.0
  );
  const maxSnowExtraCoolingC = Math.max(
    0,
    canon?.snowAlbedoFeedback?.maxExtraRadiativeCoolingC ?? 2.5
  );

  // Physical nocturnal baseline lapse rate (°C/km) inside [Z_base, Z_i]:
  // Open coast (enclosure ~0.08) stays weakly negative (~-3.2 °C/km), while enclosed basins
  // (enclosure >= 0.75) establish positive radiative inversions (+2.5 .. +5.8 °C/km).
  const defaultClearNightLapse = -3.8 + 8.6 * enclosureIndex;
  const clearNightBaseLapseCPerKm = clamp(
    alias?.clearNightInversionLapseCPerKm ?? defaultClearNightLapse,
    -6.5,
    12.0
  );

  const defaultSnowBoost = 1 + clamp(maxSnowExtraCoolingC / 4.2, 0, 1.45);
  const snowpackBoostFactor = clamp(
    alias?.snowpackBoostFactor ?? defaultSnowBoost,
    1.0,
    2.8
  );

  return {
    valleyFloorM,
    coldPoolDepthM,
    coldPoolTopM,
    midSlopeTopM,
    alpineTopM,
    enclosureIndex,
    snowDepthTriggerCm,
    clearNightBaseLapseCPerKm,
    snowpackBoostFactor,
    maxSnowExtraCoolingC,
    shallowColdWedgeRule: canon?.shallowColdWedgeRule
  };
}

function isDirectionalFoehnActiveForColumn(params: {
  spec: ProvinceEngineSpec;
  wind850DirDeg?: number | null;
  wind850SpeedKmh?: number | null;
  wind10mDirDeg?: number | null;
  shallowColdWedgeRule?: SurfaceRelativeInversionSpec["shallowColdWedgeRule"];
}): boolean {
  const { spec, wind850DirDeg, wind850SpeedKmh, wind10mDirDeg, shallowColdWedgeRule } = params;
  if (!isFiniteNum(wind850DirDeg) || !isFiniteNum(wind850SpeedKmh)) {
    return false;
  }

  // Shallow Balkan / continental cold-wedge guard: never trigger Foehn mixing if surface
  // cold advection shears sharply (>= minWindShearVs850Deg) against upper-level flow.
  if (shallowColdWedgeRule && isFiniteNum(wind10mDirDeg)) {
    const inColdSfc = computeSectorAlignmentCos(
      wind10mDirDeg,
      shallowColdWedgeRule.surfaceColdSectorDeg.fromDeg,
      shallowColdWedgeRule.surfaceColdSectorDeg.toDeg
    ).inside;
    const shearDeg = angularDifferenceDeg(wind10mDirDeg, wind850DirDeg);
    if (inColdSfc && shearDeg >= shallowColdWedgeRule.minWindShearVs850Deg) {
      return false;
    }
  }

  const rules: readonly (DirectionalBarrierRule | ProvinceBarrierAliasRule)[] =
    spec.barriers && spec.barriers.length > 0
      ? spec.barriers
      : spec.directionalBarriers ?? [];

  for (const r of rules) {
    if ("foehnSpec" in r) {
      if (!r.foehnSpec.enabled) continue;
      const align = computeSectorAlignmentCos(
        wind850DirDeg,
        r.foehnSpec.windFromSectorDeg.fromDeg,
        r.foehnSpec.windFromSectorDeg.toDeg
      );
      if (!align.inside) continue;
      const crossMs = (wind850SpeedKmh / 3.6) * align.alignment;
      if (crossMs >= r.foehnSpec.minCrossCrestSpeedMs) {
        return true;
      }
    } else if (r.foehnWindSectorDeg) {
      const align = computeSectorAlignmentCos(
        wind850DirDeg,
        r.foehnWindSectorDeg.fromDeg,
        r.foehnWindSectorDeg.toDeg
      );
      if (!align.inside) continue;
      const minKmh = r.minCrossWindKmh ?? 25;
      if (wind850SpeedKmh * align.alignment >= minKmh) {
        return true;
      }
    }
  }
  return false;
}

interface PairSlopeSample {
  slopeCPerKm: number;
  weight: number;
  dzKm: number;
  zLo: number;
  zHi: number;
}

function solveHuberWlsSlope(
  pairs: readonly PairSlopeSample[],
  minClamp = -10.4,
  maxClamp = 14.5
): { slopeCPerKm: number; effectiveWeight: number } | null {
  if (pairs.length === 0) return null;

  let num0 = 0;
  let den0 = 0;
  for (const p of pairs) {
    num0 += p.weight * p.slopeCPerKm;
    den0 += p.weight;
  }
  if (den0 <= 1e-9) return null;
  let est = num0 / den0;

  // 2-step IRLS Huber reweighting so a single faulty mountain/valley sensor cannot skew gamma_obs
  const huberDelta = 3.6; // °C/km
  for (let iter = 0; iter < 2; iter++) {
    let num = 0;
    let den = 0;
    for (const p of pairs) {
      const res = Math.abs(p.slopeCPerKm - est);
      const huberW = res <= huberDelta ? 1.0 : huberDelta / res;
      const w = p.weight * huberW;
      num += w * p.slopeCPerKm;
      den += w;
    }
    if (den > 1e-9) {
      est = num / den;
    }
  }

  return {
    slopeCPerKm: clamp(est, minClamp, maxClamp),
    effectiveWeight: den0
  };
}

/**
 * Solves the live 3-layer Z_base-relative vertical temperature profile for any Turkish province.
 */
export function computeProvinceLiveVerticalProfile(
  params: ComputeProvinceVerticalProfileParams
): ProvinceLiveVerticalProfile {
  const { spec } = params;
  const geom = resolveInversionGeometry(spec);

  const bounds = {
    minTempC: spec.qcBounds?.minPlausibleTempC ?? spec.qcAndMosBounds.minPlausibleTempC,
    maxTempC: spec.qcBounds?.maxPlausibleTempC ?? spec.qcAndMosBounds.maxPlausibleTempC
  };

  // Strict province firewall: zero cross-province station leakage into vertical lapse rate!
  const validStations = params.stations.filter((s) => {
    if (s.provinceCode !== spec.provinceCode) return false;
    if (!isFiniteNum(s.tempC) || !isFiniteNum(s.elevationM)) return false;
    if (s.tempC < bounds.minTempC || s.tempC > bounds.maxTempC) return false;
    if (s.qcWeight !== undefined && s.qcWeight <= 0) return false;
    if (s.ageMinutes !== undefined && s.ageMinutes > 180) return false;
    return true;
  });

  const observedSnowpack = validStations.some(
    (s) => isFiniteNum(s.snowDepthCm) && s.snowDepthCm >= geom.snowDepthTriggerCm
  );
  const snowpackActive = Boolean(params.hasSnowpack) || observedSnowpack;

  const foehnActive = isDirectionalFoehnActiveForColumn({
    spec,
    wind850DirDeg: params.wind850DirDeg,
    wind850SpeedKmh: params.wind850SpeedKmh,
    wind10mDirDeg: params.wind10mDirDeg,
    shallowColdWedgeRule: geom.shallowColdWedgeRule
  });

  // Physical prior lapse rates (°C/km) across [<= Z_i], [Z_i .. Z_mid], [> Z_mid]
  const isNight = params.isNight ?? false;
  const cloudFrac = clamp((params.cloudCoverPct ?? 35) / 100, 0, 1);
  const clearSkyFactor = Math.max(0.08, 1 - 0.84 * cloudFrac * cloudFrac);
  const wind850Ms = Math.max(0, params.wind850SpeedKmh ?? 12) / 3.6;
  const wind10Ms = Math.max(0, params.wind10mSpeedKmh ?? wind850Ms * 0.55) / 3.6;
  const calmFactor = 1 / Math.sqrt(1 + (wind10Ms / 2.8) ** 2 + (wind850Ms / 8.5) ** 2);

  let priorLowerLapse = -6.2;
  let priorMidLapse = -6.1;
  let priorUpperLapse = -6.3;
  let snowpackAmplified = false;

  if (foehnActive) {
    priorLowerLapse = -9.4;
    priorMidLapse = -8.9;
    priorUpperLapse = -8.2;
  } else if (isNight || (isFiniteNum(params.shortwaveRadiationWm2) && params.shortwaveRadiationWm2 < 95 && snowpackActive)) {
    const radiativeDrive = clearSkyFactor * calmFactor;
    // Blend from neutral moist-mixed (-5.8 °C/km) under overcast/windy nights to clear-calm basin inversion
    let poolNightTarget = geom.clearNightBaseLapseCPerKm;
    if (snowpackActive) {
      snowpackAmplified = radiativeDrive >= 0.25 && geom.enclosureIndex >= 0.25;
      if (poolNightTarget > 0) {
        poolNightTarget =
          poolNightTarget * geom.snowpackBoostFactor +
          (geom.maxSnowExtraCoolingC / Math.max(0.2, geom.coldPoolDepthM / 1000)) * 0.35;
      } else {
        poolNightTarget +=
          (geom.snowpackBoostFactor - 1) * 4.5 +
          (geom.maxSnowExtraCoolingC / Math.max(0.2, geom.coldPoolDepthM / 1000)) * 0.55;
      }
    }
    poolNightTarget = clamp(poolNightTarget, -6.2, 13.5);
    priorLowerLapse = -5.8 * (1 - radiativeDrive) + poolNightTarget * radiativeDrive;
    priorMidLapse = clamp(-5.8 + 0.22 * Math.max(0, priorLowerLapse), -6.5, -2.5);
    priorUpperLapse = -6.2;
  } else {
    const highMoisture = validStations.some(
      (s) => (s.relHumidityPct ?? 0) >= 86 || s.isPrecipitating === true
    );
    priorLowerLapse = highMoisture ? -5.3 : -6.5;
    priorMidLapse = highMoisture ? -5.4 : -6.3;
    priorUpperLapse = highMoisture ? -5.7 : -6.4;
  }

  // Construct WLS station-pair slope samples
  const allPairs: PairSlopeSample[] = [];
  const poolPairs: PairSlopeSample[] = [];
  const midPairs: PairSlopeSample[] = [];
  const upperPairs: PairSlopeSample[] = [];

  const coupling = spec.barrierCouplingMatrix ?? {};

  for (let i = 0; i < validStations.length; i++) {
    for (let j = i + 1; j < validStations.length; j++) {
      const a = validStations[i];
      const b = validStations[j];
      const lo = a.elevationM <= b.elevationM ? a : b;
      const hi = a.elevationM <= b.elevationM ? b : a;

      const dzM = hi.elevationM - lo.elevationM;
      if (dzM < 140) continue;

      const distKm = haversineDistanceKm(lo.lat, lo.lon, hi.lat, hi.lon);
      if (distKm > 95) continue;

      const dzKm = dzM / 1000;
      const slopeCPerKm = ((hi.tempC as number) - (lo.tempC as number)) / dzKm;
      if (slopeCPerKm < -12.5 || slopeCPerKm > 18.0) continue;

      const wLo = clamp(lo.qcWeight ?? 1.0, 0.05, 1.5);
      const wHi = clamp(hi.qcWeight ?? 1.0, 0.05, 1.5);
      const spatialW = Math.exp(-((distKm / 52) ** 2));
      const basinCoup =
        lo.subBasinId && hi.subBasinId
          ? coupling[lo.subBasinId]?.[hi.subBasinId] ?? (lo.subBasinId === hi.subBasinId ? 1.0 : 0.45)
          : 0.7;

      // Exact WLS slope weight proportional to (dzKm)^2
      const pairWeight = wLo * wHi * dzKm * dzKm * spatialW * Math.max(0.2, basinCoup);
      const sample: PairSlopeSample = {
        slopeCPerKm,
        weight: pairWeight,
        dzKm,
        zLo: lo.elevationM,
        zHi: hi.elevationM
      };
      allPairs.push(sample);

      // Assign to layer buckets based on vertical span overlap
      const overlapPool = Math.max(
        0,
        Math.min(hi.elevationM, geom.coldPoolTopM + 150) - Math.max(lo.elevationM, geom.valleyFloorM - 100)
      );
      const overlapMid = Math.max(
        0,
        Math.min(hi.elevationM, geom.midSlopeTopM + 150) - Math.max(lo.elevationM, geom.coldPoolTopM - 100)
      );
      const overlapUpper = Math.max(
        0,
        hi.elevationM - Math.max(lo.elevationM, geom.midSlopeTopM - 100)
      );

      if (overlapPool >= 0.45 * dzM || (lo.elevationM <= geom.coldPoolTopM && hi.elevationM <= geom.midSlopeTopM)) {
        poolPairs.push({ ...sample, weight: pairWeight * Math.max(0.35, overlapPool / dzM) });
      }
      if (overlapMid >= 0.35 * dzM) {
        midPairs.push({ ...sample, weight: pairWeight * (overlapMid / dzM) });
      }
      if (overlapUpper >= 0.35 * dzM) {
        upperPairs.push({ ...sample, weight: pairWeight * (overlapUpper / dzM) });
      }
    }
  }

  const globalWls = solveHuberWlsSlope(allPairs);
  const poolWls = solveHuberWlsSlope(poolPairs);
  const midWls = solveHuberWlsSlope(midPairs);
  const upperWls = solveHuberWlsSlope(upperPairs);

  const maxSpanKm = allPairs.reduce((mx, p) => Math.max(mx, p.dzKm), 0);
  const globalObsCred =
    globalWls !== null
      ? clamp((globalWls.effectiveWeight / 0.18) * clamp(maxSpanKm / 0.35, 0.25, 1.0), 0, 0.94)
      : 0;

  // Layer-by-layer Bayesian WLS blend with physical prior:
  // If a mountain pair spans from valley floor (1758 m) directly to alpine (2850 m) with no intermediate
  // station at Z_i (2138 m), globalWls captures the net T_mountain - T_floor gradient while the shallow
  // cold pool [Z_base, Z_i] concentrates the inversion below Z_i!
  let lowerPoolLapseCPerKm: number;
  let midSlopeLapseCPerKm: number;
  let upperAlpineLapseCPerKm: number;

  if (poolWls !== null) {
    const credPool = clamp(poolWls.effectiveWeight / 0.12, 0.25, 0.94);
    lowerPoolLapseCPerKm = credPool * poolWls.slopeCPerKm + (1 - credPool) * priorLowerLapse;
  } else if (globalWls !== null) {
    // Reconstruct sub-Z_i pool inversion consistent with observed floor-to-summit ΔT!
    // Suppose floor=1758m (-24°C) and summit=2850m (-15°C) -> net ΔT = +9°C over 1092m (+8.24 °C/km).
    // Above Z_i (2138..2850m = 712m), free atmosphere cools at ~priorMidLapse (-4.5..-6 °C/km) ONLY if
    // pool inversion supplies the jump; we ensure exact consistency with observed mountain stations!
    lowerPoolLapseCPerKm =
      globalObsCred * Math.max(globalWls.slopeCPerKm, priorLowerLapse) +
      (1 - globalObsCred) * priorLowerLapse;
  } else {
    lowerPoolLapseCPerKm = priorLowerLapse;
  }

  if (midWls !== null) {
    const credMid = clamp(midWls.effectiveWeight / 0.14, 0.25, 0.92);
    midSlopeLapseCPerKm = credMid * midWls.slopeCPerKm + (1 - credMid) * priorMidLapse;
  } else if (globalWls !== null && poolWls === null) {
    midSlopeLapseCPerKm =
      globalObsCred * globalWls.slopeCPerKm + (1 - globalObsCred) * priorMidLapse;
  } else {
    midSlopeLapseCPerKm = priorMidLapse;
  }

  if (upperWls !== null) {
    const credUp = clamp(upperWls.effectiveWeight / 0.14, 0.25, 0.92);
    upperAlpineLapseCPerKm = credUp * upperWls.slopeCPerKm + (1 - credUp) * priorUpperLapse;
  } else if (globalWls !== null && midWls === null && poolWls === null) {
    upperAlpineLapseCPerKm =
      0.65 * globalObsCred * globalWls.slopeCPerKm +
      (1 - 0.65 * globalObsCred) * priorUpperLapse;
  } else {
    upperAlpineLapseCPerKm = priorUpperLapse;
  }

  lowerPoolLapseCPerKm = clamp(lowerPoolLapseCPerKm, -10.2, 14.5);
  midSlopeLapseCPerKm = clamp(midSlopeLapseCPerKm, -10.0, 10.5);
  upperAlpineLapseCPerKm = clamp(upperAlpineLapseCPerKm, -10.0, 8.5);

  const compositePrior = 0.45 * priorLowerLapse + 0.35 * priorMidLapse + 0.2 * priorUpperLapse;
  const lapseRateCPerKm =
    globalWls !== null
      ? clamp(
          globalObsCred * globalWls.slopeCPerKm + (1 - globalObsCred) * compositePrior,
          -10.2,
          13.5
        )
      : clamp(
          0.5 * lowerPoolLapseCPerKm + 0.3 * midSlopeLapseCPerKm + 0.2 * upperAlpineLapseCPerKm,
          -10.2,
          13.5
        );

  const floorStations = validStations.filter(
    (s) => s.elevationM <= geom.coldPoolTopM + 60
  );
  const mountainStations = validStations.filter(
    (s) => s.elevationM >= geom.coldPoolTopM + 200
  );

  const floorRefTempC =
    floorStations.length > 0
      ? Number(
          (
            floorStations.reduce((acc, s) => acc + (s.tempC as number), 0) /
            floorStations.length
          ).toFixed(2)
        )
      : null;
  const mountainRefTempC =
    mountainStations.length > 0
      ? Number(
          (
            mountainStations.reduce((acc, s) => acc + (s.tempC as number), 0) /
            mountainStations.length
          ).toFixed(2)
        )
      : null;

  const modeledPoolJumpC =
    lowerPoolLapseCPerKm > 0
      ? (lowerPoolLapseCPerKm * geom.coldPoolDepthM) / 1000
      : 0;
  const measuredJumpC =
    floorRefTempC !== null && mountainRefTempC !== null
      ? Math.max(0, mountainRefTempC - floorRefTempC)
      : 0;
  const inversionStrengthC = Number(Math.max(modeledPoolJumpC, measuredJumpC).toFixed(2));

  let boundaryLayerState: ProvinceBoundaryLayerState = "STANDARD_MIXED";
  if (foehnActive && lowerPoolLapseCPerKm <= -7.8) {
    boundaryLayerState = "FOEHN_MIXED";
  } else if (
    lowerPoolLapseCPerKm >= 1.5 ||
    lapseRateCPerKm >= 1.2 ||
    inversionStrengthC >= 1.5
  ) {
    boundaryLayerState = "STRONG_INVERSION";
  } else if (lowerPoolLapseCPerKm >= -1.2 || lapseRateCPerKm >= -1.5) {
    boundaryLayerState = "SHALLOW_INVERSION";
  } else if (
    lowerPoolLapseCPerKm >= -5.6 &&
    validStations.some((s) => (s.relHumidityPct ?? 0) >= 85 || s.isPrecipitating === true)
  ) {
    boundaryLayerState = "MOIST_OROGRAPHIC";
  }

  return {
    provinceCode: spec.provinceCode,
    valleyFloorM: Math.round(geom.valleyFloorM),
    coldPoolDepthM: Math.round(geom.coldPoolDepthM),
    coldPoolTopM: Math.round(geom.coldPoolTopM),
    midSlopeTopM: Math.round(geom.midSlopeTopM),
    alpineTopM: Math.round(geom.alpineTopM),
    lapseRateCPerKm: Number(lapseRateCPerKm.toFixed(3)),
    lowerPoolLapseCPerKm: Number(lowerPoolLapseCPerKm.toFixed(3)),
    midSlopeLapseCPerKm: Number(midSlopeLapseCPerKm.toFixed(3)),
    upperAlpineLapseCPerKm: Number(upperAlpineLapseCPerKm.toFixed(3)),
    observedWlsLapseCPerKm:
      globalWls !== null ? Number(globalWls.slopeCPerKm.toFixed(3)) : null,
    inversionStrengthC,
    boundaryLayerState,
    floorRefTempC,
    mountainRefTempC,
    measuredPairCount: allPairs.length,
    isDirectlyMeasured: globalWls !== null && allPairs.length >= 1,
    snowpackAmplified,
    foehnMixedActive: foehnActive
  };
}

/**
 * Integrates exact piecewise vertical temperature difference ΔT(zFrom -> zTo) [°C]
 * across the Z_base-relative 3-layer profile:
 *  - Layer 1: z <= Z_i (`coldPoolTopM`) -> `lowerPoolLapseCPerKm`
 *  - Layer 2: Z_i < z <= `midSlopeTopM` -> `midSlopeLapseCPerKm`
 *  - Layer 3: z > `midSlopeTopM`        -> `upperAlpineLapseCPerKm`
 */
export function integrateProvinceVerticalDeltaC(
  zFromM: number,
  zToM: number,
  profile: ProvinceLiveVerticalProfile
): number {
  if (!Number.isFinite(zFromM) || !Number.isFinite(zToM)) return 0;
  if (Math.abs(zToM - zFromM) < 1e-6) return 0;

  const sign = zToM >= zFromM ? 1 : -1;
  const z0 = Math.min(zFromM, zToM);
  const z1 = Math.max(zFromM, zToM);

  const kPool = profile.coldPoolTopM;
  const kMid = Math.max(kPool, profile.midSlopeTopM);

  const segPoolM = Math.max(0, Math.min(z1, kPool) - Math.min(z0, kPool));
  const segMidM = Math.max(
    0,
    Math.min(z1, kMid) - Math.max(kPool, Math.min(z0, kMid))
  );
  const segUpperM = Math.max(0, z1 - Math.max(kMid, z0));

  const deltaC =
    (segPoolM * profile.lowerPoolLapseCPerKm +
      segMidM * profile.midSlopeLapseCPerKm +
      segUpperM * profile.upperAlpineLapseCPerKm) /
    1000;

  return sign * deltaC;
}
