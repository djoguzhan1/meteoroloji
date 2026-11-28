import type {
  CalibrationTier,
  HorizonBucket,
  ProvinceCalibrationBundle as BaseProvinceCalibrationBundle,
  ProvincePrecipEmosCell,
  ProvinceTempEmosCell,
  SeasonBucket,
  SimplexModelWeightMap,
  TrProvinceCode
} from "../types";

export type Wave4CalibrationTier = "TIER_A_EMPIRICAL_WMO" | "TIER_B_DONOR_ALARO";
export type EmosHorizonSliceKey = "short_0_72h" | "medium_73_240h";

/**
 * 6-element physical residual driver vector:
 * [diurnalSin, diurnalCos, clearNightRadIndex, upslopeOrFoehnProj, windSpeedNorm, rhNorm]
 */
export type EmosDriverBetaTuple = readonly [
  number,
  number,
  number,
  number,
  number,
  number
];

export interface DonorStationRef {
  readonly provinceCode: TrProvinceCode;
  readonly provinceName: string;
  readonly wmoStationId: string;
  readonly weight: number;
}

export interface SlicePrecipCalibration {
  readonly weights: SimplexModelWeightMap;
  readonly wetThresholdMmHr: number;
  readonly logisticIntercept: number;
  readonly logisticSlope: number;
  readonly wetFractionWeight: number;
  readonly powerEta: number;
  readonly rawBrier: number | null;
  readonly calibratedBrier: number | null;
}

export interface SliceVerificationMetrics {
  readonly sampleHours: number;
  readonly rawIfsMaeC: number | null;
  readonly rawIfsRmseC: number | null;
  readonly rawEqualMaeC: number | null;
  readonly rawEqualRmseC: number | null;
  readonly cvSimplexMaeC: number | null;
  readonly cvCalibratedMaeC: number | null;
  readonly cvCalibratedRmseC: number | null;
}

export interface SeasonalHorizonEmosSlice {
  readonly weights: SimplexModelWeightMap;
  readonly intercept: number;
  readonly betaDrivers: EmosDriverBetaTuple;
  readonly maxResidualShiftC: number;
  readonly spreadBaseC2: number;
  readonly spreadScale: number;
  readonly precip: SlicePrecipCalibration;
  readonly verification: SliceVerificationMetrics;
}

export interface ProvinceCalibrationBundle extends BaseProvinceCalibrationBundle {
  readonly provinceCode: TrProvinceCode;
  readonly provinceName: string;
  readonly plateNumber: number;
  readonly tier: Wave4CalibrationTier;
  readonly calibrationTier: CalibrationTier;
  readonly wmoStationId: string | null;
  readonly stationLat: number;
  readonly stationLon: number;
  readonly stationElevationM: number;
  readonly matchedHours2024_2025: number;
  readonly alaroAnchorWeight0to72h: number;
  readonly donorProvinces?: readonly TrProvinceCode[];
  readonly donorStations?: readonly DonorStationRef[];
  readonly slices: Readonly<
    Record<SeasonBucket, Readonly<Record<EmosHorizonSliceKey, SeasonalHorizonEmosSlice>>>
  >;
  readonly temperature: Readonly<
    Record<SeasonBucket, Readonly<Record<HorizonBucket, ProvinceTempEmosCell>>>
  >;
  readonly precipitation: Readonly<Record<SeasonBucket, ProvincePrecipEmosCell>>;
  readonly windWeights: SimplexModelWeightMap;
  readonly pressureWeights: SimplexModelWeightMap;
}

type BundleLoader = () => Promise<{ default: ProvinceCalibrationBundle }>;

const LAZY_BUNDLE_LOADERS: Partial<Record<TrProvinceCode, BundleLoader>> = {
  "TR-01": () => import("./tr-01"),
  "TR-02": () => import("./tr-02"),
  "TR-03": () => import("./tr-03"),
  "TR-04": () => import("./tr-04"),
  "TR-05": () => import("./tr-05"),
  "TR-06": () => import("./tr-06"),
  "TR-07": () => import("./tr-07"),
  "TR-08": () => import("./tr-08"),
  "TR-09": () => import("./tr-09"),
  "TR-10": () => import("./tr-10"),
  "TR-11": () => import("./tr-11"),
  "TR-12": () => import("./tr-12"),
  "TR-13": () => import("./tr-13"),
  "TR-14": () => import("./tr-14"),
  "TR-15": () => import("./tr-15"),
  // TR-16 (Bursa) is sealed Tier-0 (`lib/bursa-trained-emos.ts`) and intentionally excluded here.
  "TR-17": () => import("./tr-17"),
  "TR-18": () => import("./tr-18"),
  "TR-19": () => import("./tr-19"),
  "TR-20": () => import("./tr-20"),
  "TR-21": () => import("./tr-21"),
  "TR-22": () => import("./tr-22"),
  "TR-23": () => import("./tr-23"),
  "TR-24": () => import("./tr-24"),
  "TR-25": () => import("./tr-25"),
  "TR-26": () => import("./tr-26"),
  "TR-27": () => import("./tr-27"),
  "TR-28": () => import("./tr-28"),
  "TR-29": () => import("./tr-29"),
  "TR-30": () => import("./tr-30"),
  "TR-31": () => import("./tr-31"),
  "TR-32": () => import("./tr-32"),
  "TR-33": () => import("./tr-33"),
  "TR-34": () => import("./tr-34"),
  "TR-35": () => import("./tr-35"),
  "TR-36": () => import("./tr-36"),
  "TR-37": () => import("./tr-37"),
  "TR-38": () => import("./tr-38"),
  "TR-39": () => import("./tr-39"),
  "TR-40": () => import("./tr-40"),
  "TR-41": () => import("./tr-41"),
  "TR-42": () => import("./tr-42"),
  "TR-43": () => import("./tr-43"),
  "TR-44": () => import("./tr-44"),
  "TR-45": () => import("./tr-45"),
  "TR-46": () => import("./tr-46"),
  "TR-47": () => import("./tr-47"),
  "TR-48": () => import("./tr-48"),
  "TR-49": () => import("./tr-49"),
  "TR-50": () => import("./tr-50"),
  "TR-51": () => import("./tr-51"),
  "TR-52": () => import("./tr-52"),
  "TR-53": () => import("./tr-53"),
  "TR-54": () => import("./tr-54"),
  "TR-55": () => import("./tr-55"),
  "TR-56": () => import("./tr-56"),
  "TR-57": () => import("./tr-57"),
  "TR-58": () => import("./tr-58"),
  "TR-59": () => import("./tr-59"),
  "TR-60": () => import("./tr-60"),
  "TR-61": () => import("./tr-61"),
  "TR-62": () => import("./tr-62"),
  "TR-63": () => import("./tr-63"),
  "TR-64": () => import("./tr-64"),
  "TR-65": () => import("./tr-65"),
  "TR-66": () => import("./tr-66"),
  "TR-67": () => import("./tr-67"),
  "TR-68": () => import("./tr-68"),
  "TR-69": () => import("./tr-69"),
  "TR-70": () => import("./tr-70"),
  "TR-71": () => import("./tr-71"),
  "TR-72": () => import("./tr-72"),
  "TR-73": () => import("./tr-73"),
  "TR-74": () => import("./tr-74"),
  "TR-75": () => import("./tr-75"),
  "TR-76": () => import("./tr-76"),
  "TR-77": () => import("./tr-77"),
  "TR-78": () => import("./tr-78"),
  "TR-79": () => import("./tr-79"),
  "TR-80": () => import("./tr-80"),
  "TR-81": () => import("./tr-81")
};

const resolvedBundleCache = new Map<TrProvinceCode, ProvinceCalibrationBundle>();

export function getSeasonBucketForMonth(month1To12: number): SeasonBucket {
  if (month1To12 === 12 || month1To12 === 1 || month1To12 === 2) return "DJF";
  if (month1To12 >= 3 && month1To12 <= 5) return "MAM";
  if (month1To12 >= 6 && month1To12 <= 8) return "JJA";
  return "SON";
}

/**
 * Lazily loads the calibrated EMOS bundle for any national province `TR-01..TR-81` (except `TR-16` Bursa, which returns `null`).
 */
export async function loadProvinceCalibrationBundle(
  provinceCode: TrProvinceCode
): Promise<ProvinceCalibrationBundle | null> {
  if (provinceCode === "TR-16") return null;
  const cached = resolvedBundleCache.get(provinceCode);
  if (cached) return cached;

  const loader = LAZY_BUNDLE_LOADERS[provinceCode];
  if (!loader) return null;

  const mod = await loader();
  const bundle = mod.default;
  resolvedBundleCache.set(provinceCode, bundle);
  return bundle;
}
