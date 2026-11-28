import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_59 = TR81_CLIMATOLOGY_1991_2020["TR-59"];
const HYPSO_TR_59 = TR81_HYPSOMETRIC_PROFILES["TR-59"];

/**
 * ATMOS v5.0 — Wave 3A (REG-01) Bespoke Microclimate Spec: TR-59 Tekirdağ
 *
 * Key Physical Mechanisms:
 *  1. Ganos (Işıklar) Mountain Coastal Barrier & Wind Refraction (`maxPhysicalPeakM: 945 m`):
 *     Rises abruptly from the Sea of Marmara behind Şarköy–Mürefte–Kumbağ, refracting NE Poyraz
 *     gales into a coastal corner jet along Şarköy while shielding coastal orchards from shallow
 *     continental Thracian frosts.
 *  2. Sharp Coastal (`4–10 m` Süleymanpaşa / Marmaraereğlisi) vs. Inland Industrial Plateau
 *     (`145–207 m` Çorlu `LTBU` / Çerkezköy / Kapaklı / Malkara) Freeze & Snow Boundary:
 *     Prevents inland `LTBU` (-2°C blizzard/freezing fog) from biasing mild coastal `17056` (+3°C rain)
 *     via low cross-basin coupling (`0.28`) and `excludeFromCenterHeadline: true` on `LTBU`.
 */
const SPEC_TR_59: ProvinceSpec = {
  provinceCode: "TR-59",
  plateCode: 59,
  slug: "tekirdag",
  nameTr: "Tekirdağ",
  region: "THRACE",
  climateRegion: "MARMARA",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "MARMARA_COASTAL_TRANSITION",
  icaoWhitelist: ["LTBU"],
  domainBounds: {
    minLat: 40.5382,
    maxLat: 41.6097,
    minLon: 26.6932,
    maxLon: 28.1442
  },
  primaryCenter: {
    mgmMerkezId: 95901,
    mgmIstNo: 17056,
    mgmSaatlikIstNo: 17056,
    mgmGunlukIstNo: 95901,
    wmoId: "17056",
    lat: 40.9585,
    lon: 27.4965,
    demVerifiedElevationM: 4,
    subBasinId: "suleymanpasa_marmara_coast",
    urbanFraction: 0.66,
    monthlyTmaxNormalsC: CLIM_TR_59.tmaxC,
    monthlyTminNormalsC: CLIM_TR_59.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-59-suleymanpasa-sahil",
      name: "Süleymanpaşa / Tekirdağ Sahil (WMO 17056)",
      role: "coast",
      lat: 40.9585,
      lon: 27.4965,
      elevationM: 4
    },
    {
      id: "tr-59-sarkoy-murefte",
      name: "Şarköy – Mürefte Marmara Kıyısı",
      role: "coast",
      lat: 40.6069,
      lon: 27.075,
      elevationM: 10
    },
    {
      id: "tr-59-corlu-cerkezkoy-plato",
      name: "Çorlu – Çerkezköy İç Sanayi Platosu (LTBU)",
      role: "foothill",
      lat: 41.1388,
      lon: 27.9193,
      elevationM: 160
    },
    {
      id: "tr-59-malkara-plato",
      name: "Malkara – Hayrabolu Batı Eşiği",
      role: "plain",
      lat: 40.8873,
      lon: 26.908,
      elevationM: 207
    },
    {
      id: "tr-59-ganos-zirve",
      name: "Ganos (Işıklar) Dağı Zirve Sırtı",
      role: "summit",
      lat: 40.7686,
      lon: 27.3194,
      elevationM: 820
    }
  ],
  subBasins: [
    {
      id: "suleymanpasa_marmara_coast",
      labelTr: "Süleymanpaşa – Marmaraereğlisi Kuzey Marmara Kıyı Şeridi",
      polygonOrBbox: { minLat: 40.88, maxLat: 41.06, minLon: 27.32, maxLon: 28.05 },
      elevationRangeM: [0, 95],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.58
    },
    {
      id: "sarkoy_murefte_coast",
      labelTr: "Şarköy – Mürefte – Hoşköy Ganos Güney Kıyı Şeridi",
      polygonOrBbox: { minLat: 40.5382, maxLat: 40.76, minLon: 26.95, maxLon: 27.42 },
      elevationRangeM: [0, 140],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.3
    },
    {
      id: "corlu_cerkezkoy_plateau",
      labelTr: "Çorlu – Çerkezköy – Kapaklı – Saray İç Sanayi Platosu",
      polygonOrBbox: { minLat: 41.06, maxLat: 41.6097, minLon: 27.45, maxLon: 28.1442 },
      elevationRangeM: [90, 260],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.62
    },
    {
      id: "malkara_hayrabolu_basin",
      labelTr: "Malkara – Hayrabolu – Muratlı İç Trakya Havzası",
      polygonOrBbox: { minLat: 40.8, maxLat: 41.36, minLon: 26.6932, maxLon: 27.52 },
      elevationRangeM: [55, 320],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.32
    },
    {
      id: "ganos_mountain_ridge",
      labelTr: "Ganos (Işıklar) Dağı Kütlesi (Uçmakdere – Yeniköy Sırtı)",
      polygonOrBbox: { minLat: 40.68, maxLat: 40.88, minLon: 27.1, maxLon: 27.46 },
      elevationRangeM: [260, 945],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.06
    }
  ],
  barrierCouplingMatrix: {
    suleymanpasa_marmara_coast: {
      suleymanpasa_marmara_coast: 1.0,
      sarkoy_murefte_coast: 0.74,
      corlu_cerkezkoy_plateau: 0.28,
      malkara_hayrabolu_basin: 0.32,
      ganos_mountain_ridge: 0.36
    },
    sarkoy_murefte_coast: {
      suleymanpasa_marmara_coast: 0.74,
      sarkoy_murefte_coast: 1.0,
      corlu_cerkezkoy_plateau: 0.18,
      malkara_hayrabolu_basin: 0.24,
      ganos_mountain_ridge: 0.42
    },
    corlu_cerkezkoy_plateau: {
      suleymanpasa_marmara_coast: 0.28,
      sarkoy_murefte_coast: 0.18,
      corlu_cerkezkoy_plateau: 1.0,
      malkara_hayrabolu_basin: 0.74,
      ganos_mountain_ridge: 0.3
    },
    malkara_hayrabolu_basin: {
      suleymanpasa_marmara_coast: 0.32,
      sarkoy_murefte_coast: 0.24,
      corlu_cerkezkoy_plateau: 0.74,
      malkara_hayrabolu_basin: 1.0,
      ganos_mountain_ridge: 0.38
    },
    ganos_mountain_ridge: {
      suleymanpasa_marmara_coast: 0.36,
      sarkoy_murefte_coast: 0.42,
      corlu_cerkezkoy_plateau: 0.3,
      malkara_hayrabolu_basin: 0.38,
      ganos_mountain_ridge: 1.0
    }
  },
  stationOverrides: {
    "17056": {
      stationId: 17056,
      nameTr: "Tekirdağ Merkez / Süleymanpaşa (WMO 17056)",
      lat: 40.9585,
      lon: 27.4965,
      demElevationM: 4,
      subBasinId: "suleymanpasa_marmara_coast",
      urbanFraction: 0.66,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "coastal_or_gap"
    },
    "19343": {
      stationId: 19343,
      nameTr: "Marmaraereğlisi",
      lat: 40.9717,
      lon: 27.9603,
      demElevationM: 10,
      subBasinId: "suleymanpasa_marmara_coast",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.16,
      verticalStratumRole: "coastal_or_gap"
    },
    "18107": {
      stationId: 18107,
      nameTr: "Şarköy",
      lat: 40.6069,
      lon: 27.075,
      demElevationM: 10,
      subBasinId: "sarkoy_murefte_coast",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    LTBU: {
      stationId: "LTBU",
      nameTr: "Çorlu Atatürk Havalimanı (LTBU)",
      lat: 41.1383,
      lon: 27.9191,
      demElevationM: 174,
      subBasinId: "corlu_cerkezkoy_plateau",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17054": {
      stationId: 17054,
      nameTr: "Çorlu",
      lat: 41.1388,
      lon: 27.9193,
      demElevationM: 160,
      subBasinId: "corlu_cerkezkoy_plateau",
      urbanFraction: 0.68,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17640": {
      stationId: 17640,
      nameTr: "Çerkezköy",
      lat: 41.2607,
      lon: 27.9196,
      demElevationM: 160,
      subBasinId: "corlu_cerkezkoy_plateau",
      urbanFraction: 0.66,
      coldPoolSusceptibility: 0.64,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "19122": {
      stationId: 19122,
      nameTr: "Kapaklı",
      lat: 41.2607,
      lon: 27.9196,
      demElevationM: 207,
      subBasinId: "corlu_cerkezkoy_plateau",
      urbanFraction: 0.58,
      coldPoolSusceptibility: 0.6,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18423": {
      stationId: 18423,
      nameTr: "Saray (Istranca Güney Eşiği)",
      lat: 41.4469,
      lon: 27.9342,
      demElevationM: 160,
      subBasinId: "corlu_cerkezkoy_plateau",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.66,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "19121": {
      stationId: 19121,
      nameTr: "Ergene",
      lat: 41.1798,
      lon: 27.816,
      demElevationM: 145,
      subBasinId: "corlu_cerkezkoy_plateau",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17634": {
      stationId: 17634,
      nameTr: "Malkara",
      lat: 40.8873,
      lon: 26.908,
      demElevationM: 207,
      subBasinId: "malkara_hayrabolu_basin",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18108": {
      stationId: 18108,
      nameTr: "Hayrabolu",
      lat: 41.2172,
      lon: 27.0853,
      demElevationM: 108,
      subBasinId: "malkara_hayrabolu_basin",
      urbanFraction: 0.32,
      coldPoolSusceptibility: 0.8,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18422": {
      stationId: 18422,
      nameTr: "Muratlı",
      lat: 41.1767,
      lon: 27.5064,
      demElevationM: 95,
      subBasinId: "malkara_hayrabolu_basin",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [10, 145, 380, 945],
    maxPhysicalPeakM: HYPSO_TR_59.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_59.bands
  },
  waterBodies: [
    {
      id: "northwest_marmara_tekirdag_basin",
      labelTr: "Kuzeybatı Marmara Denizi (Tekirdağ – Marmaraereğlisi – Şarköy Çukuru)",
      kind: "inland_sea",
      mgmMarineStationIds: [17056, 19343, 18107],
      sampleCoord: { lat: 40.86, lon: 27.62 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.3,
      monthlyWaterTempNormalsC: [
        8.9, 8.3, 9.4, 12.6, 17.1, 21.8, 24.2, 24.5, 21.4, 17.3, 13.2, 10.4
      ],
      subBasinInfluenceWeights: {
        suleymanpasa_marmara_coast: 0.94,
        sarkoy_murefte_coast: 0.92,
        ganos_mountain_ridge: 0.44,
        corlu_cerkezkoy_plateau: 0.2,
        malkara_hayrabolu_basin: 0.14
      },
      onshoreWindSectorDeg: { fromDeg: 95, toDeg: 225 },
      effectiveFetchKm: 115,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 12.5,
      dekHeavyDeltaTC: 15.5,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 135, toDeg: 215 },
        maxInlandPenetrationKm: 22,
        maxCoolingAmplitudeC: 3.0
      }
    }
  ],
  directionalBarriers: [
    {
      id: "ganos_coastal_south_escarpment",
      labelTr: "Ganos (Işıklar) Dağı (945m) Şarköy–Uçmakdere Güney Kıyı Dikliği",
      effectiveBarrierHeightM: 945,
      crestPressureHpa: 850,
      applicableSubBasins: [
        "sarkoy_murefte_coast",
        "ganos_mountain_ridge",
        "suleymanpasa_marmara_coast"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 330, toDeg: 30 },
        minCrossCrestSpeedMs: 9.5,
        minFroudeNumber: 0.9,
        sourcePlateauElevationM: 180,
        maxTargetElevationM: 120,
        maxWarmingCapC: 2.4,
        subCloudVirgaFactor: 0.78,
        wetCutoffMmHr: 1.4
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 125, toDeg: 225 },
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 1.18,
        maxPrecipMultiplierCap: 1.62
      }
    },
    {
      id: "ganos_inland_malkara_lee",
      labelTr: "Ganos Kuzeybatı Gölgesi (Malkara – Hayrabolu) & Trakya Kuzey Kar Cephesi",
      effectiveBarrierHeightM: 945,
      crestPressureHpa: 850,
      applicableSubBasins: ["malkara_hayrabolu_basin", "corlu_cerkezkoy_plateau"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 150, toDeg: 220 },
        minCrossCrestSpeedMs: 8.5,
        minFroudeNumber: 0.88,
        sourcePlateauElevationM: 10,
        maxTargetElevationM: 260,
        maxWarmingCapC: 3.6,
        subCloudVirgaFactor: 0.75,
        wetCutoffMmHr: 1.6
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 10, toDeg: 60 },
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 1.1,
        maxPrecipMultiplierCap: 1.32
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 150, toDeg: 215 },
        precipAttenuationFactor: 0.78
      }
    }
  ],
  venturiCorridors: [
    {
      id: "sarkoy_ganos_headland_refraction",
      labelTr: "Şarköy – Mürefte – Hoşköy Ganos Kıyı Rüzgar Kırılması & Poyraz İvmesi",
      centerCoord: { lat: 40.65, lon: 27.18 },
      influenceRadiusKm: 28,
      channelAxisFromDeg: 45,
      bidirectional: true,
      sectorHalfWidthDeg: 20,
      speedMultiplier: 1.28,
      gustMultiplier: 1.38,
      suppressesNocturnalInversion: true
    },
    {
      id: "corlu_cerkezkoy_ridge_sweep",
      labelTr: "Çorlu – Çerkezköy Açık Trakya Sırtı Karayel/Poyraz Tipi Koridoru",
      centerCoord: { lat: 41.18, lon: 27.88 },
      influenceRadiusKm: 26,
      channelAxisFromDeg: 25,
      bidirectional: false,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.18,
      gustMultiplier: 1.26,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 95,
    coldPoolMaxDepthM: 210,
    topographicEnclosureIndex: 0.52,
    deltaPressureTopHpa: 980,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 2.0,
      maxExtraRadiativeCoolingC: 3.8
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.66
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 315, toDeg: 55 },
      minWindShearVs850Deg: 45
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.48,
    invertedVDryMicroburstSusceptibility: 0.36,
    coastalWaterspoutSusceptibility: 0.5
  },
  stencil9Points: [
    {
      key: "tekirdag_center_17056",
      labelTr: "Tekirdağ Merkez / Süleymanpaşa Sahil (WMO 17056)",
      lat: 40.9585,
      lon: 27.4965,
      elevationM: 4,
      role: "target"
    },
    {
      key: "marmara_upwind_buoy",
      labelTr: "Marmaraereğlisi Açıkları Denizel Giriş",
      lat: 40.91,
      lon: 27.82,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "sarkoy_coastal_jet",
      labelTr: "Şarköy – Mürefte Boğaz Giriş Kıyısı",
      lat: 40.6069,
      lon: 27.075,
      elevationM: 10,
      role: "corridor"
    },
    {
      key: "ganos_ucmakdere_crest",
      labelTr: "Ganos (Işıklar) Dağı Zirve Sırtı",
      lat: 40.7686,
      lon: 27.3194,
      elevationM: 820,
      role: "orographic_wall"
    },
    {
      key: "corlu_ltbu_plateau",
      labelTr: "Çorlu Platosu (LTBU · 160m)",
      lat: 41.1388,
      lon: 27.9193,
      elevationM: 160,
      role: "corridor"
    },
    {
      key: "cerkezkoy_kapakli_ridge",
      labelTr: "Çerkezköy – Kapaklı Doğu Eşiği",
      lat: 41.2607,
      lon: 27.9196,
      elevationM: 207,
      role: "orographic_wall"
    },
    {
      key: "saray_north_inflow",
      labelTr: "Saray Kuzey Istranca Eteği",
      lat: 41.4469,
      lon: 27.9342,
      elevationM: 160,
      role: "corridor"
    },
    {
      key: "muratli_hayrabolu_hollow",
      labelTr: "Muratlı – Hayrabolu Ergene Gölgesi",
      lat: 41.1767,
      lon: 27.5064,
      elevationM: 95,
      role: "lee_shadow"
    },
    {
      key: "malkara_west_divide",
      labelTr: "Malkara Batı Plato Eşiği",
      lat: 40.8873,
      lon: 26.908,
      elevationM: 207,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -20,
    maxPlausibleTempC: 42,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1045,
    kalmanTempBiasCapC: 3.4
  }
};

export const PROVINCE_SPEC_TR_59: ProvinceSpec = Object.freeze(SPEC_TR_59);
export default PROVINCE_SPEC_TR_59;
