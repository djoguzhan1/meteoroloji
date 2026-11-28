import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_22 = TR81_CLIMATOLOGY_1991_2020["TR-22"];
const HYPSO_TR_22 = TR81_HYPSOMETRIC_PROFILES["TR-22"];

/**
 * ATMOS v5.0 — Wave 3A (REG-01) Bespoke Microclimate Spec: TR-22 Edirne
 *
 * Key Physical Mechanisms:
 *  1. Thracian Balkan Cold Gate (Trakya Balkan Soğuk Kapısı):
 *     Sub-850 hPa shallow Karayel/Yıldız continental cold-air wedge pouring through the
 *     Bulgarian Maritsa (Meriç) corridor — capable of driving 2m temperatures to 0..-4°C
 *     (freezing rain / surprise lowland snow) even while 850 hPa remains near 0..+2°C.
 *  2. Meriç–Tunca–Ergene Alluvial Floodplain Radiation Fog & Shallow Inversion:
 *     `basinFloorElevationM: 41`, `coldPoolMaxDepthM: 220`, strong winter stratus solar damping
 *     and snow-albedo nocturnal radiative cooling.
 *  3. Strict Low-Relief Ceiling (`maxPhysicalPeakM: 678 m`, Koru Dağı / Istranca foothills)
 *     and Zero Foreign/Cross-Border METAR Contamination (`icaoWhitelist: []` — Greek `LGAL` strictly blocked).
 */
const SPEC_TR_22: ProvinceSpec = {
  provinceCode: "TR-22",
  plateCode: 22,
  slug: "edirne",
  nameTr: "Edirne",
  region: "THRACE",
  climateRegion: "MARMARA",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "THRACE_CONTINENTAL_GATE",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 40.5913,
    maxLat: 41.9965,
    minLon: 26.0362,
    maxLon: 27.0263
  },
  primaryCenter: {
    mgmMerkezId: 92201,
    mgmIstNo: 17050,
    mgmSaatlikIstNo: 17050,
    mgmGunlukIstNo: 92201,
    wmoId: "17050",
    lat: 41.6767,
    lon: 26.5508,
    demVerifiedElevationM: 51,
    subBasinId: "meric_tunca_confluence",
    urbanFraction: 0.62,
    monthlyTmaxNormalsC: CLIM_TR_22.tmaxC,
    monthlyTminNormalsC: CLIM_TR_22.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-22-ipsala-meric-alt",
      name: "Meriç – İpsala Alt Taşkın Ovası",
      role: "coast",
      lat: 40.89,
      lon: 26.39,
      elevationM: 18
    },
    {
      id: "tr-22-edirne-merkez",
      name: "Edirne Merkez (WMO 17050 · Tunca-Meriç)",
      role: "plain",
      lat: 41.6767,
      lon: 26.5508,
      elevationM: 51
    },
    {
      id: "tr-22-lalapasa-plato",
      name: "Lalapaşa – Süloğlu Balkan Eşiği",
      role: "foothill",
      lat: 41.8306,
      lon: 26.7367,
      elevationM: 240
    },
    {
      id: "tr-22-korudagi-sirti",
      name: "Keşan Koru Dağı / Istranca Sırtı",
      role: "summit",
      lat: 40.725,
      lon: 26.745,
      elevationM: 610
    }
  ],
  subBasins: [
    {
      id: "meric_tunca_confluence",
      labelTr: "Edirne Merkez – Uzunköprü – Havsa Meriç/Ergene Taşkın Ovası",
      polygonOrBbox: { minLat: 41.12, maxLat: 41.76, minLon: 26.28, maxLon: 26.92 },
      elevationRangeM: [22, 145],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.48
    },
    {
      id: "lalapasa_suloglu_gate",
      labelTr: "Lalapaşa – Süloğlu Kuzey Balkan Giriş Platosu",
      polygonOrBbox: { minLat: 41.74, maxLat: 41.9965, minLon: 26.45, maxLon: 27.0263 },
      elevationRangeM: [140, 540],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.16
    },
    {
      id: "ipsala_enez_delta",
      labelTr: "İpsala – Enez Alt Meriç Deltası & Saros Kıyısı",
      polygonOrBbox: { minLat: 40.5913, maxLat: 41.12, minLon: 26.0362, maxLon: 26.52 },
      elevationRangeM: [0, 95],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.22
    },
    {
      id: "kesan_koru_ridge",
      labelTr: "Keşan Havzası & Koru Dağı Sırtı",
      polygonOrBbox: { minLat: 40.64, maxLat: 41.06, minLon: 26.5, maxLon: 26.94 },
      elevationRangeM: [75, 678],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.34
    }
  ],
  barrierCouplingMatrix: {
    meric_tunca_confluence: {
      meric_tunca_confluence: 1.0,
      lalapasa_suloglu_gate: 0.72,
      ipsala_enez_delta: 0.48,
      kesan_koru_ridge: 0.44
    },
    lalapasa_suloglu_gate: {
      meric_tunca_confluence: 0.72,
      lalapasa_suloglu_gate: 1.0,
      ipsala_enez_delta: 0.25,
      kesan_koru_ridge: 0.28
    },
    ipsala_enez_delta: {
      meric_tunca_confluence: 0.48,
      lalapasa_suloglu_gate: 0.25,
      ipsala_enez_delta: 1.0,
      kesan_koru_ridge: 0.62
    },
    kesan_koru_ridge: {
      meric_tunca_confluence: 0.44,
      lalapasa_suloglu_gate: 0.28,
      ipsala_enez_delta: 0.62,
      kesan_koru_ridge: 1.0
    }
  },
  stationOverrides: {
    "17050": {
      stationId: 17050,
      nameTr: "Edirne Merkez (WMO 17050)",
      lat: 41.6767,
      lon: 26.5508,
      demElevationM: 51,
      subBasinId: "meric_tunca_confluence",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor"
    },
    "17608": {
      stationId: 17608,
      nameTr: "Uzunköprü",
      lat: 41.2726,
      lon: 26.7056,
      demElevationM: 45,
      subBasinId: "meric_tunca_confluence",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor"
    },
    "18394": {
      stationId: 18394,
      nameTr: "Meriç",
      lat: 41.1975,
      lon: 26.4244,
      demElevationM: 50,
      subBasinId: "meric_tunca_confluence",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "basin_floor"
    },
    "18098": {
      stationId: 18098,
      nameTr: "Havsa",
      lat: 41.5361,
      lon: 26.8547,
      demElevationM: 123,
      subBasinId: "meric_tunca_confluence",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "basin_floor"
    },
    "18096": {
      stationId: 18096,
      nameTr: "Lalapaşa",
      lat: 41.8306,
      lon: 26.7367,
      demElevationM: 180,
      subBasinId: "lalapasa_suloglu_gate",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.64,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18395": {
      stationId: 18395,
      nameTr: "Süloğlu",
      lat: 41.7742,
      lon: 26.9164,
      demElevationM: 190,
      subBasinId: "lalapasa_suloglu_gate",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18097": {
      stationId: 18097,
      nameTr: "Enez",
      lat: 40.6483,
      lon: 26.2333,
      demElevationM: 64,
      subBasinId: "ipsala_enez_delta",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.26,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17632": {
      stationId: 17632,
      nameTr: "İpsala",
      lat: 40.89,
      lon: 26.39,
      demElevationM: 81,
      subBasinId: "ipsala_enez_delta",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18393": {
      stationId: 18393,
      nameTr: "Keşan",
      lat: 40.8378,
      lon: 26.6278,
      demElevationM: 90,
      subBasinId: "kesan_koru_ridge",
      urbanFraction: 0.48,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [18, 95, 280, 678],
    maxPhysicalPeakM: HYPSO_TR_22.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_22.bands
  },
  waterBodies: [
    {
      id: "saros_gulf_enez",
      labelTr: "Saros Körfezi – Enez Kuzey Ege Kıyısı",
      kind: "open_sea",
      mgmMarineStationIds: [18097],
      sampleCoord: { lat: 40.58, lon: 26.18 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.9,
      monthlyWaterTempNormalsC: [
        12.4, 11.9, 12.6, 14.8, 18.4, 22.4, 24.7, 25.1, 22.5, 18.9, 15.6, 13.4
      ],
      subBasinInfluenceWeights: {
        ipsala_enez_delta: 0.82,
        kesan_koru_ridge: 0.34,
        meric_tunca_confluence: 0.0,
        lalapasa_suloglu_gate: 0.0
      },
      onshoreWindSectorDeg: { fromDeg: 185, toDeg: 265 },
      effectiveFetchKm: 165,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 13.5,
      dekHeavyDeltaTC: 16.5,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 205, toDeg: 255 },
        maxInlandPenetrationKm: 26,
        maxCoolingAmplitudeC: 3.1
      }
    }
  ],
  directionalBarriers: [
    {
      id: "koru_dagi_north_ergene_lee",
      labelTr: "Koru Dağı (678m) Kuzey Ergene/Meriç Gölgesi & Balkan Kış Yükselimi",
      effectiveBarrierHeightM: 678,
      crestPressureHpa: 850,
      applicableSubBasins: ["meric_tunca_confluence", "lalapasa_suloglu_gate"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 175, toDeg: 225 },
        minCrossCrestSpeedMs: 8.5,
        minFroudeNumber: 0.9,
        sourcePlateauElevationM: 15,
        maxTargetElevationM: 180,
        maxWarmingCapC: 2.6,
        subCloudVirgaFactor: 0.8,
        wetCutoffMmHr: 1.5
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 330, toDeg: 55 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.1,
        maxPrecipMultiplierCap: 1.36
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 180, toDeg: 220 },
        precipAttenuationFactor: 0.84
      }
    },
    {
      id: "koru_dagi_south_saros_windward",
      labelTr: "Koru Dağı Saros – Keşan Güney Rüzgar-Üstü Cephesi",
      effectiveBarrierHeightM: 678,
      crestPressureHpa: 850,
      applicableSubBasins: ["kesan_koru_ridge", "ipsala_enez_delta"],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 5, toDeg: 50 },
        minCrossCrestSpeedMs: 12.0,
        minFroudeNumber: 1.0,
        sourcePlateauElevationM: 120,
        maxTargetElevationM: 90,
        maxWarmingCapC: 1.5,
        subCloudVirgaFactor: 0.85,
        wetCutoffMmHr: 1.2
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 175, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 1.14,
        maxPrecipMultiplierCap: 1.44
      }
    }
  ],
  venturiCorridors: [
    {
      id: "maritsa_balkan_cold_gate",
      labelTr: "Svilengrad – Kapıkule – Meriç Vadisi Balkan Karayel/Yıldız Soğuk Kanalı",
      centerCoord: { lat: 41.71, lon: 26.44 },
      influenceRadiusKm: 34,
      channelAxisFromDeg: 325,
      bidirectional: true,
      sectorHalfWidthDeg: 26,
      speedMultiplier: 1.24,
      gustMultiplier: 1.32,
      suppressesNocturnalInversion: false
    },
    {
      id: "lower_meric_ipsala_corridor",
      labelTr: "Aşağı Meriç – İpsala – Enez Kış Rüzgar Oluğu",
      centerCoord: { lat: 40.92, lon: 26.36 },
      influenceRadiusKm: 28,
      channelAxisFromDeg: 15,
      bidirectional: true,
      sectorHalfWidthDeg: 22,
      speedMultiplier: 1.2,
      gustMultiplier: 1.28,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 41,
    coldPoolMaxDepthM: 220,
    topographicEnclosureIndex: 0.68,
    deltaPressureTopHpa: 985,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 2.0,
      maxExtraRadiativeCoolingC: 4.6
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.58
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 295, toDeg: 30 },
      minWindShearVs850Deg: 50
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.42,
    invertedVDryMicroburstSusceptibility: 0.48,
    coastalWaterspoutSusceptibility: 0.22
  },
  stencil9Points: [
    {
      key: "edirne_center_17050",
      labelTr: "Edirne Merkez (WMO 17050 · Meriç-Tunca)",
      lat: 41.6767,
      lon: 26.5508,
      elevationM: 51,
      role: "target"
    },
    {
      key: "kapikule_maritsa_inflow",
      labelTr: "Kapıkule – Meriç Balkan Soğuk Girişi",
      lat: 41.718,
      lon: 26.355,
      elevationM: 42,
      role: "corridor"
    },
    {
      key: "lalapasa_balkan_piedmont",
      labelTr: "Lalapaşa Kuzey Eşik",
      lat: 41.8306,
      lon: 26.7367,
      elevationM: 180,
      role: "orographic_wall"
    },
    {
      key: "suloglu_northeast_plateau",
      labelTr: "Süloğlu Istranca Batı Platosu",
      lat: 41.7742,
      lon: 26.9164,
      elevationM: 190,
      role: "orographic_wall"
    },
    {
      key: "havsa_ergene_plain",
      labelTr: "Havsa Ergene Batı Ovası",
      lat: 41.5361,
      lon: 26.8547,
      elevationM: 123,
      role: "corridor"
    },
    {
      key: "uzunkopru_frost_basin",
      labelTr: "Uzunköprü Ergene Sis/Ayaz Çanağı",
      lat: 41.2726,
      lon: 26.7056,
      elevationM: 45,
      role: "lee_shadow"
    },
    {
      key: "ipsala_lower_meric",
      labelTr: "İpsala Alt Meriç Ovası",
      lat: 40.89,
      lon: 26.39,
      elevationM: 81,
      role: "corridor"
    },
    {
      key: "enez_saros_marine",
      labelTr: "Enez Saros Körfezi Denizel Giriş",
      lat: 40.6483,
      lon: 26.2333,
      elevationM: 64,
      role: "marine_upwind"
    },
    {
      key: "kesan_koru_windward",
      labelTr: "Keşan – Koru Dağı Güney Sırtı",
      lat: 40.76,
      lon: 26.68,
      elevationM: 380,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -24,
    maxPlausibleTempC: 44,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 3.6
  }
};

export const PROVINCE_SPEC_TR_22: ProvinceSpec = Object.freeze(SPEC_TR_22);
export default PROVINCE_SPEC_TR_22;
