import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

export const TR_33_BESPOKE_LIMITS = Object.freeze({
  upslopePrecipMultiplier: 1.54,
  maxHourlyPrecipMm: 125,
  maxFoehnWarmingC: 4.2,
  mutDepressionElevationM: 290,
  sertavulPassElevationM: 1650,
  allowedMetarIcaos: Object.freeze(["LTDB"] as const),
  forbiddenNeighborIcaos: Object.freeze(["LTAF", "LTAG"] as const)
});

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function isWindInSector(
  windFromDeg: number,
  sector: { fromDeg: number; toDeg: number }
): boolean {
  const d = ((windFromDeg % 360) + 360) % 360;
  const from = ((sector.fromDeg % 360) + 360) % 360;
  const to = ((sector.toDeg % 360) + 360) % 360;
  return from <= to ? d >= from && d <= to : d >= from || d <= to;
}

function angularDiffDeg(a: number, b: number): number {
  const diff = Math.abs((((a - b) % 360) + 540) % 360 - 180);
  return diff;
}

const specTr33: ProvinceSpec = {
  provinceCode: "TR-33",
  plateCode: 33,
  slug: "mersin",
  nameTr: "Mersin",
  region: "MEDITERRANEAN",
  climateRegion: "AKDENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "MEDITERRANEAN_COASTAL_OROG",
  icaoWhitelist: ["LTDB"],
  domainBounds: {
    minLat: 36.0168,
    maxLat: 37.4322,
    minLon: 32.511,
    maxLon: 35.1517
  },
  primaryCenter: {
    mgmMerkezId: 93301,
    mgmIstNo: 17340,
    mgmSaatlikIstNo: 17340,
    mgmGunlukIstNo: 93301,
    wmoId: "17340",
    lat: 36.812,
    lon: 34.6411,
    demVerifiedElevationM: 11,
    subBasinId: "mersin_tarsus_coastal_plain",
    urbanFraction: 0.85,
    monthlyTmaxNormalsC: TR81_CLIMATOLOGY_1991_2020["TR-33"].tmaxC,
    monthlyTminNormalsC: TR81_CLIMATOLOGY_1991_2020["TR-33"].tminC
  },
  curatedSubLocations: [
    {
      id: "tr-33-anamur",
      name: "Anamur (Subtropikal Kıyı)",
      role: "coast",
      lat: 36.0686,
      lon: 32.8649,
      elevationM: 6
    },
    {
      id: "tr-33-silifke",
      name: "Silifke (Göksu Deltası)",
      role: "coast",
      lat: 36.3824,
      lon: 33.9373,
      elevationM: 10
    },
    {
      id: "tr-33-erdemli",
      name: "Erdemli Sahil",
      role: "coast",
      lat: 36.6268,
      lon: 34.338,
      elevationM: 7
    },
    {
      id: "tr-33-mezitli",
      name: "Mezitli Kıyı",
      role: "coast",
      lat: 36.7454,
      lon: 34.5226,
      elevationM: 15
    },
    {
      id: "tr-33-akdeniz",
      name: "Mersin Merkez (Akdeniz · WMO 17340)",
      role: "plain",
      lat: 36.812,
      lon: 34.6411,
      elevationM: 11
    },
    {
      id: "tr-33-tarsus",
      name: "Tarsus (Çukurova Batı Eşiği)",
      role: "plain",
      lat: 36.8942,
      lon: 34.9597,
      elevationM: 12
    },
    {
      id: "tr-33-mut",
      name: "Mut (Göksu Çöküntü Vadisi)",
      role: "plain",
      lat: 36.6514,
      lon: 33.4339,
      elevationM: 290
    },
    {
      id: "tr-33-gulnar",
      name: "Gülnar (Taşeli Platosu)",
      role: "foothill",
      lat: 36.3495,
      lon: 33.3797,
      elevationM: 1013
    },
    {
      id: "tr-33-camliyayla",
      name: "Çamlıyayla (Bolkar Güney Yamaç)",
      role: "foothill",
      lat: 37.1756,
      lon: 34.605,
      elevationM: 1115
    },
    {
      id: "tr-33-sertavul-gecidi",
      name: "Sertavul Geçidi (Venturi Oluğu)",
      role: "summit",
      lat: 36.895,
      lon: 33.2694,
      elevationM: 1650
    },
    {
      id: "tr-33-karbogazi-bolkar",
      name: "Karboğazı / Bolkar Dağları Zirve Kuşağı",
      role: "summit",
      lat: 37.308,
      lon: 34.685,
      elevationM: 2350
    }
  ],
  subBasins: [
    {
      id: "anamur_silifke_subtropical_coast",
      labelTr: "Anamur – Bozyazı – Aydıncık – Silifke Don-Görmez Subtropikal Kıyı Kuşağı",
      polygonOrBbox: {
        minLat: 36.01,
        maxLat: 36.52,
        minLon: 32.51,
        maxLon: 34.16
      },
      elevationRangeM: [0, 250],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.36
    },
    {
      id: "mersin_tarsus_coastal_plain",
      labelTr: "Erdemli – Mezitli – Mersin – Tarsus Kıyı ve Batı Çukurova Ovası",
      polygonOrBbox: {
        minLat: 36.52,
        maxLat: 37.04,
        minLon: 34.16,
        maxLon: 35.15
      },
      elevationRangeM: [0, 220],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.72
    },
    {
      id: "mut_goksu_depression",
      labelTr: "Mut – Göksu İç Çöküntü Vadisi (290m Mikro-Havza & Sertavul Çıkışı)",
      polygonOrBbox: {
        minLat: 36.42,
        maxLat: 36.88,
        minLon: 33.15,
        maxLon: 33.78
      },
      elevationRangeM: [180, 560],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.24
    },
    {
      id: "bolkar_central_taurus_slope",
      labelTr: "Gözne – Toroslar – Çamlıyayla – Gülnar Orta Toros Güney Yamacı",
      polygonOrBbox: {
        minLat: 36.25,
        maxLat: 37.26,
        minLon: 32.85,
        maxLon: 34.92
      },
      elevationRangeM: [560, 1600],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.16
    },
    {
      id: "sertavul_bolkar_crest",
      labelTr: "Sertavul Geçidi (1650m) & Bolkar Dağları (3524m Medetsiz) Alp Zirve Kuşağı",
      polygonOrBbox: {
        minLat: 36.86,
        maxLat: 37.43,
        minLon: 33.18,
        maxLon: 34.88
      },
      elevationRangeM: [1600, 3524],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.02
    }
  ],
  barrierCouplingMatrix: {
    anamur_silifke_subtropical_coast: {
      anamur_silifke_subtropical_coast: 1.0,
      mersin_tarsus_coastal_plain: 0.82,
      mut_goksu_depression: 0.26,
      bolkar_central_taurus_slope: 0.38,
      sertavul_bolkar_crest: 0.12
    },
    mersin_tarsus_coastal_plain: {
      anamur_silifke_subtropical_coast: 0.82,
      mersin_tarsus_coastal_plain: 1.0,
      mut_goksu_depression: 0.2,
      bolkar_central_taurus_slope: 0.44,
      sertavul_bolkar_crest: 0.14
    },
    mut_goksu_depression: {
      anamur_silifke_subtropical_coast: 0.26,
      mersin_tarsus_coastal_plain: 0.2,
      mut_goksu_depression: 1.0,
      bolkar_central_taurus_slope: 0.34,
      sertavul_bolkar_crest: 0.28
    },
    bolkar_central_taurus_slope: {
      anamur_silifke_subtropical_coast: 0.38,
      mersin_tarsus_coastal_plain: 0.44,
      mut_goksu_depression: 0.34,
      bolkar_central_taurus_slope: 1.0,
      sertavul_bolkar_crest: 0.58
    },
    sertavul_bolkar_crest: {
      anamur_silifke_subtropical_coast: 0.12,
      mersin_tarsus_coastal_plain: 0.14,
      mut_goksu_depression: 0.28,
      bolkar_central_taurus_slope: 0.58,
      sertavul_bolkar_crest: 1.0
    }
  },
  stationOverrides: {
    "17340": {
      stationId: 17340,
      nameTr: "Mersin Merkez (WMO 17340)",
      lat: 36.7808,
      lon: 34.6031,
      demElevationM: 11,
      subBasinId: "mersin_tarsus_coastal_plain",
      urbanFraction: 0.86,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "basin_floor"
    },
    "17320": {
      stationId: 17320,
      nameTr: "Anamur",
      lat: 36.0686,
      lon: 32.8649,
      demElevationM: 6,
      subBasinId: "anamur_silifke_subtropical_coast",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.04,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17330": {
      stationId: 17330,
      nameTr: "Silifke",
      lat: 36.3824,
      lon: 33.9373,
      demElevationM: 10,
      subBasinId: "anamur_silifke_subtropical_coast",
      urbanFraction: 0.48,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17958": {
      stationId: 17958,
      nameTr: "Erdemli",
      lat: 36.6268,
      lon: 34.338,
      demElevationM: 7,
      subBasinId: "mersin_tarsus_coastal_plain",
      urbanFraction: 0.56,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "coastal_or_gap"
    },
    "19180": {
      stationId: 19180,
      nameTr: "Mezitli",
      lat: 36.7454,
      lon: 34.5226,
      demElevationM: 213,
      subBasinId: "mersin_tarsus_coastal_plain",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.1,
      verticalStratumRole: "coastal_or_gap"
    },
    "17978": {
      stationId: 17978,
      nameTr: "Tarsus",
      lat: 36.8942,
      lon: 34.9597,
      demElevationM: 12,
      subBasinId: "mersin_tarsus_coastal_plain",
      urbanFraction: 0.64,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "basin_floor"
    },
    "17956": {
      stationId: 17956,
      nameTr: "Mut (Göksu Çöküntüsü)",
      lat: 36.6514,
      lon: 33.4339,
      demElevationM: 341,
      subBasinId: "mut_goksu_depression",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18059": {
      stationId: 18059,
      nameTr: "Gülnar",
      lat: 36.3495,
      lon: 33.3797,
      demElevationM: 1013,
      subBasinId: "bolkar_central_taurus_slope",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18060": {
      stationId: 18060,
      nameTr: "Çamlıyayla",
      lat: 37.1756,
      lon: 34.605,
      demElevationM: 1115,
      subBasinId: "bolkar_central_taurus_slope",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.38,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [10, 35, 1080, 2350],
    maxPhysicalPeakM: 3524,
    snowElevationBands: TR81_HYPSOMETRIC_PROFILES["TR-33"].bands
  },
  waterBodies: [
    {
      id: "eastern_mediterranean_mersin",
      labelTr: "Doğu Akdeniz (Anamur – Silifke – Erdemli – Mersin)",
      kind: "open_sea",
      mgmMarineStationIds: [17385, 17394, 17478, 17479, 17490],
      sampleCoord: { lat: 36.62, lon: 34.48 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -2.1,
      monthlyWaterTempNormalsC: [
        18.6, 17.9, 18.2, 19.8, 23.0, 26.5,
        29.0, 29.8, 28.6, 25.8, 22.4, 19.8
      ],
      subBasinInfluenceWeights: {
        anamur_silifke_subtropical_coast: 0.97,
        mersin_tarsus_coastal_plain: 0.95,
        bolkar_central_taurus_slope: 0.48,
        mut_goksu_depression: 0.18,
        sertavul_bolkar_crest: 0.14
      },
      onshoreWindSectorDeg: { fromDeg: 145, toDeg: 235 },
      effectiveFetchKm: 380,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 13.5,
      dekHeavyDeltaTC: 17.0,
      seaBreezeSpec: {
        activeMonths: [4, 10],
        sectorDeg: { fromDeg: 170, toDeg: 230 },
        maxInlandPenetrationKm: 35,
        maxCoolingAmplitudeC: 3.2
      }
    }
  ],
  directionalBarriers: [
    {
      id: "bolkar_central_taurus_wall",
      labelTr: "Bolkar Dağları (3524m) & Orta Toros Kıyı Duvarı",
      effectiveBarrierHeightM: 2850,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "anamur_silifke_subtropical_coast",
        "mersin_tarsus_coastal_plain",
        "bolkar_central_taurus_slope",
        "sertavul_bolkar_crest"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 325, toDeg: 35 },
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.85,
        sourcePlateauElevationM: 1050,
        maxTargetElevationM: 350,
        maxWarmingCapC: 4.2,
        subCloudVirgaFactor: 0.36,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 145, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 0.24,
        maxPrecipMultiplierCap: 1.54
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 325, toDeg: 35 },
        precipAttenuationFactor: 0.54
      }
    },
    {
      id: "mut_goksu_subsidence_foehn",
      labelTr: "Göksu Vadisi – Mut (290m) Çöküntü Adyabatik Fönü",
      effectiveBarrierHeightM: 1650,
      crestPressureHpa: 800,
      applicableSubBasins: ["mut_goksu_depression"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 300, toDeg: 20 },
        minCrossCrestSpeedMs: 6.5,
        minFroudeNumber: 0.8,
        sourcePlateauElevationM: 1035,
        maxTargetElevationM: 520,
        maxWarmingCapC: 4.4,
        subCloudVirgaFactor: 0.4,
        wetCutoffMmHr: 0.2
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 130, toDeg: 185 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 0.1,
        maxPrecipMultiplierCap: 1.22
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 200, toDeg: 270 },
        precipAttenuationFactor: 0.65
      }
    }
  ],
  venturiCorridors: [
    {
      id: "sertavul_goksu_venturi",
      labelTr: "Sertavul Geçidi (1650m) – Göksu Vadisi KB–GD Venturi Fırtına Oluğu",
      centerCoord: { lat: 36.82, lon: 33.34 },
      influenceRadiusKm: 34,
      channelAxisFromDeg: 325,
      bidirectional: true,
      sectorHalfWidthDeg: 35,
      speedMultiplier: 1.46,
      gustMultiplier: 1.62,
      suppressesNocturnalInversion: true
    },
    {
      id: "gulek_tarsus_north_channel",
      labelTr: "Gülek Boğazı – Çamlıyayla / Tarsus Kuzey Kanalı",
      centerCoord: { lat: 37.16, lon: 34.78 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 10,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.32,
      gustMultiplier: 1.45,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 290,
    coldPoolMaxDepthM: 220,
    topographicEnclosureIndex: 0.56,
    deltaPressureTopHpa: 28,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 2.4
    },
    persistentStratusLock: {
      enabled: false,
      daytimeSolarDampingFactor: 0.14
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.72,
    invertedVDryMicroburstSusceptibility: 0.44,
    coastalWaterspoutSusceptibility: 0.84
  },
  stencil9Points: [
    {
      key: "TARGET",
      labelTr: "Mersin Merkez (Akdeniz · WMO 17340)",
      lat: 36.812,
      lon: 34.6411,
      elevationM: 11,
      role: "target"
    },
    {
      key: "MERSIN_BAY_MARINE",
      labelTr: "Doğu Akdeniz – Mersin Körfezi Açığı",
      lat: 36.52,
      lon: 34.58,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "TASUCU_ANAMUR_MARINE",
      labelTr: "Taşucu – Anamur Güney Deniz Girişi",
      lat: 36.08,
      lon: 33.65,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "BOLKAR_SOUTH_WALL",
      labelTr: "Bolkar Dağları (Karboğazı / Çamlıyayla) Güney Duvarı",
      lat: 37.24,
      lon: 34.62,
      elevationM: 2150,
      role: "orographic_wall"
    },
    {
      key: "TASELI_GULNAR_WALL",
      labelTr: "Gülnar – Taşeli Platosu Güney Yamacı",
      lat: 36.3495,
      lon: 33.3797,
      elevationM: 1013,
      role: "orographic_wall"
    },
    {
      key: "KARAMAN_FOEHN_SOURCE",
      labelTr: "Karaman – İç Anadolu Kuzey Fön Kaynağı",
      lat: 37.18,
      lon: 33.24,
      elevationM: 1033,
      role: "foehn_windward"
    },
    {
      key: "SERTAVUL_VENTURI",
      labelTr: "Sertavul Geçidi (1650m) Venturi Boğazı",
      lat: 36.9153,
      lon: 33.2694,
      elevationM: 1650,
      role: "corridor"
    },
    {
      key: "GULEK_CORRIDOR",
      labelTr: "Gülek – Tarsus Kuzey Kanalı",
      lat: 37.16,
      lon: 34.78,
      elevationM: 1050,
      role: "corridor"
    },
    {
      key: "MUT_DEPRESSION",
      labelTr: "Mut – Göksu Çöküntü Havzası (290m)",
      lat: 36.6514,
      lon: 33.4339,
      elevationM: 290,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -20,
    maxPlausibleTempC: 48,
    minPlausibleMslpHpa: 982,
    maxPlausibleMslpHpa: 1040,
    kalmanTempBiasCapC: 4.8
  }
};

export const PROVINCE_SPEC_TR_33: ProvinceSpec = Object.freeze(specTr33);

export interface Tr33MersinColumnInput {
  subBasinId?: string;
  targetElevationM: number;
  windFromDirDeg: number;
  windSpeed850Ms: number;
  baseWind10mKmh: number;
  baseGust10mKmh: number;
  froudeNumber?: number;
  rawPrecipMmHr: number;
  baseTemp2mC: number;
  temp850C: number;
  month: number;
  nearSertavulGoksuCorridor?: boolean;
}

export interface Tr33MersinColumnResult {
  regime:
    | "SOUTHERLY_TAURUS_UPSLOPE_RAIN"
    | "NORTHERLY_COASTAL_FOEHN"
    | "MUT_GOKSU_SUBSIDENCE_HEAT"
    | "SERTAVUL_VENTURI_GALE"
    | "SUBTROPICAL_COASTAL_FROST_FREE";
  precipMultiplier: number;
  adjustedPrecipMmHr: number;
  foehnWarmingC: number;
  adjustedTemp2mC: number;
  adjustedWind10mKmh: number;
  adjustedGust10mKmh: number;
  venturiActive: boolean;
}

/**
 * Evaluates Mersin (`TR-33`) windward Bolkar/Central Taurus, Mut Göksu depression (`290m`),
 * and Sertavul (`1650m`) NW–SE Venturi storm chute physics.
 */
export function evaluateTr33MersinColumnPhysics(
  input: Tr33MersinColumnInput
): Tr33MersinColumnResult {
  const subBasinId = input.subBasinId ?? PROVINCE_SPEC_TR_33.primaryCenter.subBasinId;
  const monthIdx = clamp(Math.round(input.month) - 1, 0, 11);
  const sstC = PROVINCE_SPEC_TR_33.waterBodies[0].monthlyWaterTempNormalsC[monthIdx];

  const sertavulVenturi = PROVINCE_SPEC_TR_33.venturiCorridors[0];
  const axisFwdDiff = angularDiffDeg(
    input.windFromDirDeg,
    sertavulVenturi.channelAxisFromDeg
  );
  const axisRevDiff = angularDiffDeg(
    input.windFromDirDeg,
    (sertavulVenturi.channelAxisFromDeg + 180) % 360
  );
  const alignedWithSertavul =
    axisFwdDiff <= sertavulVenturi.sectorHalfWidthDeg ||
    (sertavulVenturi.bidirectional && axisRevDiff <= sertavulVenturi.sectorHalfWidthDeg);

  const venturiActive =
    Boolean(
      input.nearSertavulGoksuCorridor ||
        subBasinId === "mut_goksu_depression" ||
        subBasinId === "sertavul_bolkar_crest"
    ) &&
    alignedWithSertavul &&
    input.windSpeed850Ms >= 6.0;

  const adjustedWind10mKmh = venturiActive
    ? input.baseWind10mKmh * sertavulVenturi.speedMultiplier
    : input.baseWind10mKmh;
  const adjustedGust10mKmh = venturiActive
    ? Math.max(
        adjustedWind10mKmh * 1.15,
        input.baseGust10mKmh * sertavulVenturi.gustMultiplier
      )
    : input.baseGust10mKmh;

  if (subBasinId === "mut_goksu_depression") {
    const mutBarrier = PROVINCE_SPEC_TR_33.directionalBarriers[1];
    const inSubsidenceFoehn =
      mutBarrier.foehnSpec.enabled &&
      isWindInSector(input.windFromDirDeg, mutBarrier.foehnSpec.windFromSectorDeg) &&
      input.windSpeed850Ms >= mutBarrier.foehnSpec.minCrossCrestSpeedMs;

    const isSummer = input.month >= 6 && input.month <= 9;
    const subsidenceWarmingC = inSubsidenceFoehn
      ? clamp(
          mutBarrier.foehnSpec.maxWarmingCapC *
            clamp((input.windSpeed850Ms - 5.0) / 8.0, 0.55, 1.0),
          0,
          mutBarrier.foehnSpec.maxWarmingCapC
        )
      : isSummer
        ? 2.2
        : 0;

    return {
      regime:
        inSubsidenceFoehn || isSummer
          ? "MUT_GOKSU_SUBSIDENCE_HEAT"
          : venturiActive
            ? "SERTAVUL_VENTURI_GALE"
            : "SUBTROPICAL_COASTAL_FROST_FREE",
      precipMultiplier: inSubsidenceFoehn ? 0.55 : 1.0,
      adjustedPrecipMmHr: Number(
        (inSubsidenceFoehn ? input.rawPrecipMmHr * 0.55 : input.rawPrecipMmHr).toFixed(2)
      ),
      foehnWarmingC: Number(subsidenceWarmingC.toFixed(2)),
      adjustedTemp2mC: Number((input.baseTemp2mC + subsidenceWarmingC).toFixed(2)),
      adjustedWind10mKmh: Number(adjustedWind10mKmh.toFixed(1)),
      adjustedGust10mKmh: Number(adjustedGust10mKmh.toFixed(1)),
      venturiActive
    };
  }

  const bolkar = PROVINCE_SPEC_TR_33.directionalBarriers[0];
  const isSoutherlyUpslope =
    bolkar.upslopeSpec.enabled &&
    isWindInSector(input.windFromDirDeg, bolkar.upslopeSpec.windFromSectorDeg) &&
    input.windSpeed850Ms >= bolkar.upslopeSpec.minOnshoreOrUpslopeSpeedMs;

  if (isSoutherlyUpslope) {
    const speedRamp = clamp(
      (input.windSpeed850Ms - bolkar.upslopeSpec.minOnshoreOrUpslopeSpeedMs) / 11.0,
      0.3,
      1.0
    );
    const sstInstability = clamp(Math.max(0, sstC - input.temp850C) / 15.0, 0.35, 1.0);
    const precipMultiplier = clamp(
      1.0 +
        bolkar.upslopeSpec.coastalFrictionalConvergenceBoost * speedRamp +
        0.3 * speedRamp * sstInstability,
      1.0,
      bolkar.upslopeSpec.maxPrecipMultiplierCap
    );
    const adjustedPrecipMmHr = clamp(
      input.rawPrecipMmHr * precipMultiplier,
      0,
      TR_33_BESPOKE_LIMITS.maxHourlyPrecipMm
    );

    return {
      regime: "SOUTHERLY_TAURUS_UPSLOPE_RAIN",
      precipMultiplier: Number(precipMultiplier.toFixed(3)),
      adjustedPrecipMmHr: Number(adjustedPrecipMmHr.toFixed(2)),
      foehnWarmingC: 0,
      adjustedTemp2mC: Number(input.baseTemp2mC.toFixed(2)),
      adjustedWind10mKmh: Number(adjustedWind10mKmh.toFixed(1)),
      adjustedGust10mKmh: Number(adjustedGust10mKmh.toFixed(1)),
      venturiActive
    };
  }

  const froude = input.froudeNumber ?? 1.1;
  const isNortherlyFoehn =
    bolkar.foehnSpec.enabled &&
    isWindInSector(input.windFromDirDeg, bolkar.foehnSpec.windFromSectorDeg) &&
    input.windSpeed850Ms >= bolkar.foehnSpec.minCrossCrestSpeedMs &&
    froude >= bolkar.foehnSpec.minFroudeNumber &&
    input.targetElevationM <= bolkar.foehnSpec.maxTargetElevationM;

  if (isNortherlyFoehn) {
    const descentFrac = clamp(
      (bolkar.foehnSpec.sourcePlateauElevationM - input.targetElevationM) /
        bolkar.foehnSpec.sourcePlateauElevationM,
      0,
      1
    );
    const windStrength = clamp(
      (input.windSpeed850Ms - bolkar.foehnSpec.minCrossCrestSpeedMs) / 9.5,
      0.45,
      1.0
    );
    const foehnWarmingC = clamp(
      bolkar.foehnSpec.maxWarmingCapC * descentFrac * windStrength,
      0,
      bolkar.foehnSpec.maxWarmingCapC
    );
    const shadowFactor = bolkar.rainShadowSpec?.precipAttenuationFactor ?? 0.54;
    const virgaAdjusted =
      input.rawPrecipMmHr * shadowFactor * (1 - bolkar.foehnSpec.subCloudVirgaFactor);

    return {
      regime: "NORTHERLY_COASTAL_FOEHN",
      precipMultiplier: Number((shadowFactor * (1 - bolkar.foehnSpec.subCloudVirgaFactor)).toFixed(3)),
      adjustedPrecipMmHr: Number(
        (virgaAdjusted <= bolkar.foehnSpec.wetCutoffMmHr ? 0 : virgaAdjusted).toFixed(2)
      ),
      foehnWarmingC: Number(foehnWarmingC.toFixed(2)),
      adjustedTemp2mC: Number((input.baseTemp2mC + foehnWarmingC).toFixed(2)),
      adjustedWind10mKmh: Number(adjustedWind10mKmh.toFixed(1)),
      adjustedGust10mKmh: Number(adjustedGust10mKmh.toFixed(1)),
      venturiActive
    };
  }

  // Subtropical frost-free marine moderation along Anamur–Silifke–Erdemli–Mersin littoral
  const isSubtropicalCoast =
    (subBasinId === "anamur_silifke_subtropical_coast" ||
      subBasinId === "mersin_tarsus_coastal_plain") &&
    input.targetElevationM <= 60;
  const moderatedTempC =
    isSubtropicalCoast && input.baseTemp2mC < 1.5
      ? Math.max(input.baseTemp2mC, 1.5 + (sstC - 16.0) * 0.25)
      : input.baseTemp2mC;

  return {
    regime: venturiActive ? "SERTAVUL_VENTURI_GALE" : "SUBTROPICAL_COASTAL_FROST_FREE",
    precipMultiplier: 1.0,
    adjustedPrecipMmHr: Number(
      clamp(input.rawPrecipMmHr, 0, TR_33_BESPOKE_LIMITS.maxHourlyPrecipMm).toFixed(2)
    ),
    foehnWarmingC: 0,
    adjustedTemp2mC: Number(moderatedTempC.toFixed(2)),
    adjustedWind10mKmh: Number(adjustedWind10mKmh.toFixed(1)),
    adjustedGust10mKmh: Number(adjustedGust10mKmh.toFixed(1)),
    venturiActive
  };
}

export default PROVINCE_SPEC_TR_33;
