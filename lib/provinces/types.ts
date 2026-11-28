import type { CoreModelKey } from "../weather-types";

export const TR_PLATE_NUMBERS = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
  "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
  "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
  "41", "42", "43", "44", "45", "46", "47", "48", "49", "50",
  "51", "52", "53", "54", "55", "56", "57", "58", "59", "60",
  "61", "62", "63", "64", "65", "66", "67", "68", "69", "70",
  "71", "72", "73", "74", "75", "76", "77", "78", "79", "80",
  "81"
] as const;

export type TrPlateNumber = (typeof TR_PLATE_NUMBERS)[number];
export type TrProvinceCode = `TR-${TrPlateNumber}`;
export type ProvinceCode = TrProvinceCode | "GLOBAL";

export type SynopticRegionCode =
  | "MARMARA"
  | "THRACE"
  | "AEGEAN"
  | "MEDITERRANEAN"
  | "BLACK_SEA_WEST_CENTRAL"
  | "BLACK_SEA_EAST"
  | "CENTRAL_ANATOLIA"
  | "EASTERN_ANATOLIA"
  | "SOUTHEASTERN_ANATOLIA";

export type ClimateRegionKey =
  | "MARMARA"
  | "EGE"
  | "AKDENIZ"
  | "IC_ANADOLU"
  | "KARADENIZ"
  | "DOGU_ANADOLU"
  | "GUNEYDOGU";

export type CalibrationTier =
  | "TIER_0_BURSA"
  | "TIER_A_WMO"
  | "TIER_B_DONOR_KALMAN";

export type DonorClusterId =
  | "MARMARA_COASTAL_TRANSITION"
  | "THRACE_CONTINENTAL_GATE"
  | "AEGEAN_COASTAL_GRABEN"
  | "INNER_AEGEAN_STEPPE"
  | "MEDITERRANEAN_COASTAL_OROG"
  | "CENTRAL_ANATOLIA_BASIN"
  | "WEST_MID_BLACK_SEA_DEK"
  | "EAST_BLACK_SEA_STEEP_OROG"
  | "INLAND_PASS_PLATEAU"
  | "HIGH_EAST_SNOW_BASIN"
  | "EAST_MICRO_DEPRESSION"
  | "VAN_LAKE_BASIN"
  | "SOUTHEAST_THRESHOLD_ARID";

export type LocationKind =
  | "province_center"
  | "district"
  | "summit_ski"
  | "coastal_marine"
  | "station"
  | "global_city"
  | "custom_coord";

export interface CatalogLocationEntry {
  id: string;
  name: string;
  slug: string;
  provinceCode: TrProvinceCode;
  provinceName: string;
  plateNumber: number;
  lat: number;
  lon: number;
  elevationM: number;
  kind: "province_center" | "district" | "summit_ski" | "coastal_marine";
  mgmMerkezId?: number;
  mgmSondurumIstNo?: number;
  mgmSaatlikIstNo?: number;
  mgmGunlukIstNo?: number;
  wmoId?: string;
  aliases?: readonly string[];
}

export interface ProvinceResolution {
  provinceCode: ProvinceCode;
  provinceName?: string;
  plateNumber?: number;
  method:
    | "exact_polygon"
    | "border_admin1_tiebreak"
    | "coastal_snap"
    | "global_outside";
  borderDistanceKm?: number;
}

export interface WaterBodySpec {
  id: string;
  labelTr: string;
  kind: "open_sea" | "inland_sea" | "alkaline_lake" | "fresh_lake";
  mgmMarineStationIds: readonly number[];
  sampleCoord: { lat: number; lon: number };
  useOpenMeteoMarineApi: boolean;
  surfaceElevationM: number;
  freezingPointC: number;
  monthlyWaterTempNormalsC: readonly [
    number, number, number, number, number, number,
    number, number, number, number, number, number
  ];
  subBasinInfluenceWeights: Readonly<Record<string, number>>;
  onshoreWindSectorDeg: { fromDeg: number; toDeg: number };
  effectiveFetchKm: number;
  convectiveInstabilityUpperHpa: 850 | 700;
  dekWatchDeltaTC: number;
  dekHeavyDeltaTC: number;
  seaBreezeSpec: {
    activeMonths: readonly [number, number];
    sectorDeg: { fromDeg: number; toDeg: number };
    maxInlandPenetrationKm: number;
    maxCoolingAmplitudeC: number;
  };
}

export interface DirectionalBarrierRule {
  id: string;
  labelTr: string;
  effectiveBarrierHeightM: number;
  crestPressureHpa: 850 | 800 | 750 | 700;
  applicableSubBasins: readonly string[];
  foehnSpec: {
    enabled: boolean;
    windFromSectorDeg: { fromDeg: number; toDeg: number };
    minCrossCrestSpeedMs: number;
    minFroudeNumber: number;
    sourcePlateauElevationM: number;
    maxTargetElevationM: number;
    maxWarmingCapC: number;
    subCloudVirgaFactor: number;
    wetCutoffMmHr: number;
  };
  upslopeSpec: {
    enabled: boolean;
    windFromSectorDeg: { fromDeg: number; toDeg: number };
    minOnshoreOrUpslopeSpeedMs: number;
    coastalFrictionalConvergenceBoost: number;
    maxPrecipMultiplierCap: number;
  };
  rainShadowSpec?: {
    shadowedWindFromSectorDeg: { fromDeg: number; toDeg: number };
    precipAttenuationFactor: number;
  };
}

export interface VenturiCorridorRule {
  id: string;
  labelTr?: string;
  centerCoord: { lat: number; lon: number };
  influenceRadiusKm: number;
  channelAxisFromDeg: number;
  bidirectional: boolean;
  sectorHalfWidthDeg: number;
  speedMultiplier: number;
  gustMultiplier: number;
  suppressesNocturnalInversion: boolean;
}

export interface SurfaceRelativeInversionSpec {
  basinFloorElevationM: number;
  coldPoolMaxDepthM: number;
  topographicEnclosureIndex: number;
  deltaPressureTopHpa: number;
  snowAlbedoFeedback: {
    snowDepthTriggerCm: number;
    maxExtraRadiativeCoolingC: number;
  };
  persistentStratusLock: {
    enabled: boolean;
    daytimeSolarDampingFactor: number;
  };
  shallowColdWedgeRule?: {
    surfaceColdSectorDeg: { fromDeg: number; toDeg: number };
    minWindShearVs850Deg: number;
  };
}

export interface RegionalQcAndMosBounds {
  minPlausibleTempC: number;
  maxPlausibleTempC: number;
  minPlausibleMslpHpa: number;
  maxPlausibleMslpHpa: number;
  kalmanTempBiasCapC: number;
}

export type ProvinceZoneKind =
  | "coastal_marine"
  | "peninsula_exposed"
  | "strait_corridor"
  | "graben_valley"
  | "urban_plain"
  | "urban_foothill"
  | "rural_closed_basin"
  | "high_plateau"
  | "mountain_slope"
  | "alpine_summit"
  | "arid_steppe";

export interface SubBasinDefinition {
  id: string;
  labelTr: string;
  polygonOrBbox: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  elevationRangeM: readonly [number, number];
  defaultZone: ProvinceZoneKind;
  defaultUrbanFraction: number;
}

export interface ProvinceStationOverride {
  stationId: string | number;
  nameTr?: string;
  lat?: number;
  lon?: number;
  demElevationM: number;
  subBasinId: string;
  urbanFraction: number;
  coldPoolSusceptibility: number;
  verticalStratumRole:
    | "basin_floor"
    | "coastal_or_gap"
    | "mid_slope"
    | "alpine_snow";
  excludeFromCenterHeadline?: boolean;
}

export interface ProvinceElevationBandAnchor {
  id: "low" | "center" | "foothill" | "summit";
  labelTr: string;
  elevationM: number;
  baseOroWeight: number;
}

export interface ProvinceHypsometricProfile {
  provinceCode: TrProvinceCode;
  provinceName: string;
  maxPhysicalPeakM: number;
  bands: readonly [
    ProvinceElevationBandAnchor,
    ProvinceElevationBandAnchor,
    ProvinceElevationBandAnchor,
    ProvinceElevationBandAnchor
  ];
}

export interface ProvinceMonthlyNormals1991_2020 {
  provinceCode: TrProvinceCode;
  provinceName: string;
  stationWmoOrMgmId: string;
  lat: number;
  lon: number;
  referenceElevationM: number;
  isCoastal: boolean;
  tmaxC: readonly [
    number, number, number, number, number, number,
    number, number, number, number, number, number
  ];
  tminC: readonly [
    number, number, number, number, number, number,
    number, number, number, number, number, number
  ];
  precipMm: readonly [
    number, number, number, number, number, number,
    number, number, number, number, number, number
  ];
  wetDays: readonly [
    number, number, number, number, number, number,
    number, number, number, number, number, number
  ];
}

export interface ProvinceSpec {
  provinceCode: TrProvinceCode;
  plateCode: number;
  slug: string;
  nameTr: string;
  region: SynopticRegionCode;
  climateRegion: ClimateRegionKey;
  calibrationTier: CalibrationTier;
  donorCluster: DonorClusterId;
  icaoWhitelist: readonly string[];
  domainBounds: {
    minLat: number;
    maxLat: number;
    minLon: number;
    maxLon: number;
  };
  primaryCenter: {
    mgmMerkezId: number;
    mgmIstNo: number;
    mgmSaatlikIstNo: number;
    mgmGunlukIstNo: number;
    wmoId?: string;
    lat: number;
    lon: number;
    demVerifiedElevationM: number;
    subBasinId: string;
    urbanFraction: number;
    monthlyTmaxNormalsC: readonly [
      number, number, number, number, number, number,
      number, number, number, number, number, number
    ];
    monthlyTminNormalsC: readonly [
      number, number, number, number, number, number,
      number, number, number, number, number, number
    ];
  };
  curatedSubLocations: ReadonlyArray<{
    id: string;
    name: string;
    role: "coast" | "plain" | "foothill" | "summit";
    lat: number;
    lon: number;
    elevationM: number;
  }>;
  subBasins: readonly SubBasinDefinition[];
  barrierCouplingMatrix: Readonly<Record<string, Readonly<Record<string, number>>>>;
  stationOverrides: Readonly<Record<string, ProvinceStationOverride>>;
  verticalProfileSpec: {
    piecewiseKnotsM: readonly [number, number, number, number];
    maxPhysicalPeakM: number;
    snowElevationBands: readonly [
      ProvinceElevationBandAnchor,
      ProvinceElevationBandAnchor,
      ProvinceElevationBandAnchor,
      ProvinceElevationBandAnchor
    ];
  };
  waterBodies: readonly WaterBodySpec[];
  directionalBarriers: readonly DirectionalBarrierRule[];
  venturiCorridors: readonly VenturiCorridorRule[];
  inversionAndWedgeSpec: SurfaceRelativeInversionSpec;
  aridAndSevereDrivers: {
    dustTransportSusceptibility: number;
    invertedVDryMicroburstSusceptibility: number;
    coastalWaterspoutSusceptibility: number;
  };
  stencil9Points: ReadonlyArray<{
    key: string;
    labelTr: string;
    lat: number;
    lon: number;
    elevationM: number;
    role:
      | "target"
      | "marine_upwind"
      | "orographic_wall"
      | "foehn_windward"
      | "corridor"
      | "lee_shadow";
  }>;
  qcAndMosBounds: RegionalQcAndMosBounds;
}

export type SeasonBucket = "DJF" | "MAM" | "JJA" | "SON";
export type HorizonBucket = "d0_1" | "d2_4" | "d5_7";

export interface SimplexModelWeightMap {
  ecmwfIfs: number;
  ecmwfAifs: number;
  icon: number;
  ukmo: number;
  meteofrance: number;
  gfs: number;
  gem: number;
  jma: number;
}

export interface ProvinceTempEmosCell {
  /** Strictly non-negative simplex weights summing to 1.000000 */
  weights: SimplexModelWeightMap;
  /** Zero (0.0) for TIER_B_DONOR_KALMAN; empirically CV-fitted residual intercept for TIER_A_WMO */
  interceptC: number;
  /** Diurnal harmonic residual coefficients [sin2pi, cos2pi, sin4pi, cos4pi] (0 for TIER_B) */
  diurnalHarmonicsC: readonly [number, number, number, number];
  /** Physical residual betas [radiativeClearNight, solarHeating, foehnProj, onshoreSstDelta] */
  driverBetasC: readonly [number, number, number, number];
  /** Spread calibration sigma^2 = spreadBaseC2 + spreadScale * S^2 */
  spreadBaseC2: number;
  spreadScale: number;
  /** Out-of-sample verification MAE/RMSE from WMO CV (null for TIER_B prior) */
  cvMaeC: number | null;
  cvRmseC: number | null;
  sampleHours: number;
}

export interface ProvincePrecipEmosCell {
  weights: SimplexModelWeightMap;
  wetThresholdMmHr: number;
  orographicAlpha: number;
  powerEta: number;
  alaroBlendWeight0To36h: number;
}

export interface ProvinceCalibrationBundle {
  provinceCode: TrProvinceCode;
  calibrationTier: CalibrationTier;
  wmoStationId: string | null;
  stationElevationM: number;
  trainedAtIso: string;
  donorProvinces?: readonly TrProvinceCode[];
  temperature: Readonly<Record<SeasonBucket, Readonly<Record<HorizonBucket, ProvinceTempEmosCell>>>>;
  precipitation: Readonly<Record<SeasonBucket, ProvincePrecipEmosCell>>;
  windWeights: SimplexModelWeightMap;
  pressureWeights: SimplexModelWeightMap;
}

export interface ProvinceClientSummary {
  provinceCode: TrProvinceCode;
  plateNumber: number;
  provinceName: string;
  climateRegion: ClimateRegionKey;
  calibrationTier: CalibrationTier;
  canonicalCenter: {
    id: string;
    name: string;
    stationLabel: string;
    lat: number;
    lon: number;
    elevationM: number;
  };
  mgmMeshStationCount: number;
  activeWaterBodies: ReadonlyArray<{
    id: string;
    labelTr: string;
    kind: "open_sea" | "inland_sea" | "alkaline_lake" | "fresh_lake";
    liveTempC?: number | null;
    upperHpa: 850 | 700;
  }>;
  cumulusStageId: "marmara" | "bogaz" | "ege" | "anadolu" | "akdeniz";
  curatedSubLocations: ReadonlyArray<{
    id: string;
    name: string;
    role: "coast" | "plain" | "foothill" | "summit";
    lat: number;
    lon: number;
    elevationM: number;
  }>;
}

export function isTrProvinceCode(val: unknown): val is TrProvinceCode {
  return (
    typeof val === "string" &&
    /^TR-(?:0[1-9]|[1-7][0-9]|8[01])$/.test(val)
  );
}

export function isValidProvinceCode(val: unknown): val is ProvinceCode {
  return val === "GLOBAL" || isTrProvinceCode(val);
}

export function normalizeSimplexWeights(
  raw: Partial<Record<CoreModelKey, number>>,
  availableKeys?: readonly CoreModelKey[]
): SimplexModelWeightMap {
  const allKeys: readonly CoreModelKey[] = [
    "ecmwfIfs",
    "ecmwfAifs",
    "icon",
    "ukmo",
    "meteofrance",
    "gfs",
    "gem",
    "jma"
  ];
  const activeSet = availableKeys ? new Set(availableKeys) : null;
  let sum = 0;
  const cleaned: Record<CoreModelKey, number> = {
    ecmwfIfs: 0,
    ecmwfAifs: 0,
    icon: 0,
    ukmo: 0,
    meteofrance: 0,
    gfs: 0,
    gem: 0,
    jma: 0
  };
  for (const k of allKeys) {
    if (activeSet && !activeSet.has(k)) continue;
    const v = Number(raw[k] ?? 0);
    if (Number.isFinite(v) && v > 0) {
      cleaned[k] = v;
      sum += v;
    }
  }
  if (sum <= 1e-9) {
    const target = activeSet && activeSet.size > 0 ? Array.from(activeSet) : allKeys;
    const eq = 1 / target.length;
    for (const k of target) cleaned[k] = eq;
    return cleaned;
  }
  for (const k of allKeys) {
    cleaned[k] = cleaned[k] / sum;
  }
  return cleaned;
}
