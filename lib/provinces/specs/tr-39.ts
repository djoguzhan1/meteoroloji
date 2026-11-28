import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_39 = TR81_CLIMATOLOGY_1991_2020["TR-39"];
const HYPSO_TR_39 = TR81_HYPSOMETRIC_PROFILES["TR-39"];

/**
 * ATMOS v5.0 — Wave 3A (REG-01) Bespoke Microclimate Spec: TR-39 Kırklareli
 *
 * Key Physical Mechanisms:
 *  1. Yıldız (Istranca) Mountains Shield (`maxPhysicalPeakM: 1031 m` Mahya Dağı):
 *     Blocks Black Sea moisture along a NW–SE forested ridge; NE (`20°–65°`) onshore flow triggers
 *     heavy orographic rain/snow and Sea-Effect Snow (DEK) over İğneada–Demirköy–Kofçaz while leaving
 *     inner Ergene in partial precipitation shadow.
 *  2. Sharp Marine vs. Continental Split:
 *     Western Black Sea (`west_black_sea_igneada`, 420 km fetch) moderates İğneada/Kıyıköy, whereas
 *     Lüleburgaz–Babaeski–Pehlivanköy (`46–85 m`) forms a deep continental Ergene frost basin.
 *  3. Calibration Tier-B (`TIER_B_DONOR_KALMAN`, `icaoWhitelist: []`) anchored by MGM 17052 + ALARO.
 */
const SPEC_TR_39: ProvinceSpec = {
  provinceCode: "TR-39",
  plateCode: 39,
  slug: "kirklareli",
  nameTr: "Kırklareli",
  region: "THRACE",
  climateRegion: "MARMARA",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "THRACE_CONTINENTAL_GATE",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 41.217,
    maxLat: 42.1047,
    minLon: 26.8845,
    maxLon: 28.1442
  },
  primaryCenter: {
    mgmMerkezId: 93901,
    mgmIstNo: 17052,
    mgmSaatlikIstNo: 17052,
    mgmGunlukIstNo: 93901,
    wmoId: "17052",
    lat: 41.7382,
    lon: 27.2178,
    demVerifiedElevationM: 232,
    subBasinId: "kirklareli_piedmont",
    urbanFraction: 0.52,
    monthlyTmaxNormalsC: CLIM_TR_39.tmaxC,
    monthlyTminNormalsC: CLIM_TR_39.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-39-igneada-kiyikoy",
      name: "İğneada – Kıyıköy Batı Karadeniz Sahili",
      role: "coast",
      lat: 41.8758,
      lon: 27.9856,
      elevationM: 12
    },
    {
      id: "tr-39-luleburgaz-ergene",
      name: "Lüleburgaz – Babaeski Ergene Çanağı",
      role: "plain",
      lat: 41.3513,
      lon: 27.3108,
      elevationM: 46
    },
    {
      id: "tr-39-kirklareli-merkez",
      name: "Kırklareli Merkez (MGM 17052)",
      role: "plain",
      lat: 41.7382,
      lon: 27.2178,
      elevationM: 232
    },
    {
      id: "tr-39-demirkoy-istranca",
      name: "Demirköy – Istranca Orman Yamacı",
      role: "foothill",
      lat: 41.8228,
      lon: 27.7589,
      elevationM: 540
    },
    {
      id: "tr-39-mahyadagi-zirve",
      name: "Mahya Dağı (Yıldız Dağları Zirve)",
      role: "summit",
      lat: 41.7819,
      lon: 27.6186,
      elevationM: 960
    }
  ],
  subBasins: [
    {
      id: "igneada_kiyikoy_coast",
      labelTr: "İğneada – Limanköy – Kıyıköy Batı Karadeniz Kıyısı",
      polygonOrBbox: { minLat: 41.58, maxLat: 41.99, minLon: 27.84, maxLon: 28.1442 },
      elevationRangeM: [0, 180],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.16
    },
    {
      id: "demirkoy_istranca_forest",
      labelTr: "Demirköy – Kofçaz – Mahya Dağı (Yıldız/Istranca Kütlesi)",
      polygonOrBbox: { minLat: 41.68, maxLat: 42.1047, minLon: 27.05, maxLon: 27.92 },
      elevationRangeM: [300, 1031],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.12
    },
    {
      id: "kirklareli_piedmont",
      labelTr: "Kırklareli Merkez – Pınarhisar – Vize Güney Etek Kuşağı",
      polygonOrBbox: { minLat: 41.54, maxLat: 41.8, minLon: 27.0, maxLon: 27.85 },
      elevationRangeM: [150, 360],
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.42
    },
    {
      id: "luleburgaz_ergene_trough",
      labelTr: "Lüleburgaz – Babaeski – Pehlivanköy Ergene Karasal Ayaz Çanağı",
      polygonOrBbox: { minLat: 41.217, maxLat: 41.55, minLon: 26.8845, maxLon: 27.62 },
      elevationRangeM: [38, 150],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.44
    }
  ],
  barrierCouplingMatrix: {
    igneada_kiyikoy_coast: {
      igneada_kiyikoy_coast: 1.0,
      demirkoy_istranca_forest: 0.62,
      kirklareli_piedmont: 0.18,
      luleburgaz_ergene_trough: 0.1
    },
    demirkoy_istranca_forest: {
      igneada_kiyikoy_coast: 0.62,
      demirkoy_istranca_forest: 1.0,
      kirklareli_piedmont: 0.48,
      luleburgaz_ergene_trough: 0.24
    },
    kirklareli_piedmont: {
      igneada_kiyikoy_coast: 0.18,
      demirkoy_istranca_forest: 0.48,
      kirklareli_piedmont: 1.0,
      luleburgaz_ergene_trough: 0.72
    },
    luleburgaz_ergene_trough: {
      igneada_kiyikoy_coast: 0.1,
      demirkoy_istranca_forest: 0.24,
      kirklareli_piedmont: 0.72,
      luleburgaz_ergene_trough: 1.0
    }
  },
  stationOverrides: {
    "17052": {
      stationId: 17052,
      nameTr: "Kırklareli Merkez (MGM 17052)",
      lat: 41.7382,
      lon: 27.2178,
      demElevationM: 232,
      subBasinId: "kirklareli_piedmont",
      urbanFraction: 0.52,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "mid_slope"
    },
    "18398": {
      stationId: 18398,
      nameTr: "Pınarhisar",
      lat: 41.6311,
      lon: 27.5236,
      demElevationM: 272,
      subBasinId: "kirklareli_piedmont",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "mid_slope"
    },
    "19320": {
      stationId: 19320,
      nameTr: "Vize / Kıyıköy Eşiği",
      lat: 41.6378,
      lon: 28.0661,
      demElevationM: 18,
      subBasinId: "igneada_kiyikoy_coast",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.2,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18102": {
      stationId: 18102,
      nameTr: "Demirköy (Istranca Doğu Yamaç)",
      lat: 41.8228,
      lon: 27.7589,
      demElevationM: 330,
      subBasinId: "demirkoy_istranca_forest",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18406": {
      stationId: 18406,
      nameTr: "Kofçaz (Yukarı Istranca)",
      lat: 41.9411,
      lon: 27.1539,
      demElevationM: 425,
      subBasinId: "demirkoy_istranca_forest",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "17631": {
      stationId: 17631,
      nameTr: "Lüleburgaz (Ergene Ayaz Çanağı)",
      lat: 41.3513,
      lon: 27.3108,
      demElevationM: 46,
      subBasinId: "luleburgaz_ergene_trough",
      urbanFraction: 0.56,
      coldPoolSusceptibility: 0.9,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18405": {
      stationId: 18405,
      nameTr: "Babaeski",
      lat: 41.4433,
      lon: 27.0622,
      demElevationM: 85,
      subBasinId: "luleburgaz_ergene_trough",
      urbanFraction: 0.4,
      coldPoolSusceptibility: 0.85,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18407": {
      stationId: 18407,
      nameTr: "Pehlivanköy",
      lat: 41.3556,
      lon: 26.9394,
      demElevationM: 50,
      subBasinId: "luleburgaz_ergene_trough",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [12, 205, 540, 1031],
    maxPhysicalPeakM: HYPSO_TR_39.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_39.bands
  },
  waterBodies: [
    {
      id: "west_black_sea_igneada",
      labelTr: "Batı Karadeniz (İğneada – Kıyıköy Açıkları)",
      kind: "open_sea",
      mgmMarineStationIds: [19320, 17459],
      sampleCoord: { lat: 41.88, lon: 28.12 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.0,
      monthlyWaterTempNormalsC: [
        7.8, 6.9, 7.6, 10.6, 15.6, 20.8, 23.8, 24.3, 21.2, 16.9, 12.8, 9.6
      ],
      subBasinInfluenceWeights: {
        igneada_kiyikoy_coast: 0.95,
        demirkoy_istranca_forest: 0.56,
        kirklareli_piedmont: 0.12,
        luleburgaz_ergene_trough: 0.0
      },
      onshoreWindSectorDeg: { fromDeg: 15, toDeg: 85 },
      effectiveFetchKm: 420,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 13.0,
      dekHeavyDeltaTC: 16.0,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 35, toDeg: 95 },
        maxInlandPenetrationKm: 20,
        maxCoolingAmplitudeC: 3.2
      }
    }
  ],
  directionalBarriers: [
    {
      id: "istranca_black_sea_windward",
      labelTr: "Yıldız (Istranca) Dağları – Mahya Dağı (1031m) Karadeniz Kuzeydoğu Kalkanı",
      effectiveBarrierHeightM: 1031,
      crestPressureHpa: 850,
      applicableSubBasins: ["igneada_kiyikoy_coast", "demirkoy_istranca_forest"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 200, toDeg: 245 },
        minCrossCrestSpeedMs: 9.5,
        minFroudeNumber: 0.9,
        sourcePlateauElevationM: 220,
        maxTargetElevationM: 220,
        maxWarmingCapC: 3.8,
        subCloudVirgaFactor: 0.74,
        wetCutoffMmHr: 1.5
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 20, toDeg: 65 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.24,
        maxPrecipMultiplierCap: 1.85
      }
    },
    {
      id: "istranca_ergene_lee_shadow",
      labelTr: "Istranca Güneybatı Yağış Gölgesi (Kırklareli Etek – Lüleburgaz Ergene)",
      effectiveBarrierHeightM: 1031,
      crestPressureHpa: 850,
      applicableSubBasins: ["kirklareli_piedmont", "luleburgaz_ergene_trough"],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 25, toDeg: 65 },
        minCrossCrestSpeedMs: 14.0,
        minFroudeNumber: 1.1,
        sourcePlateauElevationM: 10,
        maxTargetElevationM: 260,
        maxWarmingCapC: 1.8,
        subCloudVirgaFactor: 0.85,
        wetCutoffMmHr: 1.0
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 175, toDeg: 225 },
        minOnshoreOrUpslopeSpeedMs: 7.0,
        coastalFrictionalConvergenceBoost: 1.08,
        maxPrecipMultiplierCap: 1.28
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 20, toDeg: 65 },
        precipAttenuationFactor: 0.68
      }
    }
  ],
  venturiCorridors: [
    {
      id: "derekoey_balkan_ridge_gap",
      labelTr: "Dereköy – Kofçaz Kuzey Geçidi Karayel/Poyraz Kanalı",
      centerCoord: { lat: 41.93, lon: 27.32 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 15,
      bidirectional: true,
      sectorHalfWidthDeg: 22,
      speedMultiplier: 1.22,
      gustMultiplier: 1.32,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 46,
    coldPoolMaxDepthM: 260,
    topographicEnclosureIndex: 0.72,
    deltaPressureTopHpa: 982,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 2.0,
      maxExtraRadiativeCoolingC: 5.2
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.6
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 310, toDeg: 45 },
      minWindShearVs850Deg: 48
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.38,
    invertedVDryMicroburstSusceptibility: 0.44,
    coastalWaterspoutSusceptibility: 0.46
  },
  stencil9Points: [
    {
      key: "kirklareli_center_17052",
      labelTr: "Kırklareli Merkez (MGM 17052)",
      lat: 41.7382,
      lon: 27.2178,
      elevationM: 232,
      role: "target"
    },
    {
      key: "igneada_black_sea_upwind",
      labelTr: "İğneada Batı Karadeniz Denizel Giriş",
      lat: 41.8758,
      lon: 27.9856,
      elevationM: 12,
      role: "marine_upwind"
    },
    {
      key: "kiyikoy_coastal_inflow",
      labelTr: "Kıyıköy Karadeniz Sahili",
      lat: 41.635,
      lon: 28.092,
      elevationM: 18,
      role: "marine_upwind"
    },
    {
      key: "demirkoy_windward_forest",
      labelTr: "Demirköy Istranca Kuzeydoğu Yamaç",
      lat: 41.8228,
      lon: 27.7589,
      elevationM: 330,
      role: "orographic_wall"
    },
    {
      key: "mahya_dagi_summit",
      labelTr: "Mahya Dağı Zirve Sırtı (1031m)",
      lat: 41.7819,
      lon: 27.6186,
      elevationM: 960,
      role: "orographic_wall"
    },
    {
      key: "kofcaz_north_pass",
      labelTr: "Kofçaz Balkan Kuzey Sırtı",
      lat: 41.9411,
      lon: 27.1539,
      elevationM: 425,
      role: "corridor"
    },
    {
      key: "pinarhisar_piedmont_lee",
      labelTr: "Pınarhisar Güney Etek Gölgesi",
      lat: 41.6311,
      lon: 27.5236,
      elevationM: 272,
      role: "lee_shadow"
    },
    {
      key: "luleburgaz_ergene_floor",
      labelTr: "Lüleburgaz Ergene Ayaz Tabanı",
      lat: 41.3513,
      lon: 27.3108,
      elevationM: 46,
      role: "foehn_windward"
    },
    {
      key: "babaeski_west_corridor",
      labelTr: "Babaeski – Pehlivanköy Batı Ergene Ovası",
      lat: 41.4433,
      lon: 27.0622,
      elevationM: 85,
      role: "corridor"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -24,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 3.5
  }
};

export const PROVINCE_SPEC_TR_39: ProvinceSpec = Object.freeze(SPEC_TR_39);
export default PROVINCE_SPEC_TR_39;
