import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_54 = TR81_CLIMATOLOGY_1991_2020["TR-54"];
const HYPSO_TR_54 = TR81_HYPSOMETRIC_PROFILES["TR-54"];

/**
 * Wave 3A (REG-03) — `TR-54` Sakarya Bespoke Physical & Microclimatic Specification:
 *  - North (Karasu / Kocaali): 380 km open Black Sea fetch generating intense winter DEK snow/rain bands.
 *  - Center (Adapazarı / Erenler / Akyazı / Hendek): 31 m alluvial plain with persistent nocturnal
 *    radiation fog, stratus trapping, and sharp Samanlı/Keremali Lodos Foehn warming.
 *  - South-West (Sapanca / Arifiye): Freshwater lake thermal moderation buffering frost extremes.
 *  - South (Geyve / Pamukova / Taraklı): Narrow Geyve Strait Venturi channel & rain-shadowed transition
 *    toward Bilecik / Central Anatolia.
 *  - Strict Zero-Leakage METAR Policy: `icaoWhitelist: []` (blocks Kocaeli `LTBQ` from leaking in).
 */
export const PROVINCE_SPEC_TR_54: ProvinceSpec = Object.freeze({
  provinceCode: "TR-54",
  plateCode: 54,
  slug: "sakarya",
  nameTr: "Sakarya",
  region: "MARMARA",
  climateRegion: "MARMARA",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "MARMARA_COASTAL_TRANSITION",
  icaoWhitelist: Object.freeze([]),
  domainBounds: Object.freeze({
    minLat: 40.28,
    maxLat: 41.22,
    minLon: 29.95,
    maxLon: 30.96
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 95401,
    mgmIstNo: 17069,
    mgmSaatlikIstNo: 17069,
    mgmGunlukIstNo: 95401,
    wmoId: "17069",
    lat: 40.7676,
    lon: 30.3934,
    demVerifiedElevationM: 31,
    subBasinId: "TR54_ADAPAZARI_ALLUVIAL_PLAIN",
    urbanFraction: 0.76,
    monthlyTmaxNormalsC: CLIM_TR_54.tmaxC,
    monthlyTminNormalsC: CLIM_TR_54.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "sakarya-karasu-sahil",
      name: "Karasu / Kocaali Karadeniz Kıyısı",
      role: "coast",
      lat: 41.1113,
      lon: 30.6901,
      elevationM: 8
    }),
    Object.freeze({
      id: "sakarya-adapazari-merkez",
      name: "Adapazarı Merkez (Ova)",
      role: "plain",
      lat: 40.7676,
      lon: 30.3934,
      elevationM: 31
    }),
    Object.freeze({
      id: "sakarya-sapanca-yamac",
      name: "Sapanca / Serdivan Yamaç",
      role: "foothill",
      lat: 40.6885,
      lon: 30.2625,
      elevationM: 220
    }),
    Object.freeze({
      id: "sakarya-dikmen-keremali",
      name: "Hendek Dikmen / Keremali Zirve",
      role: "summit",
      lat: 40.642,
      lon: 30.785,
      elevationM: 1580
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR54_KARASU_BLACKSEA_COAST",
      labelTr: "Karasu – Kocaali – Kaynarca Karadeniz DEK Kuşağı",
      polygonOrBbox: Object.freeze({
        minLat: 40.98,
        maxLat: 41.22,
        minLon: 30.2,
        maxLon: 30.96
      }),
      elevationRangeM: Object.freeze([0, 120] as const),
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.42
    }),
    Object.freeze({
      id: "TR54_ADAPAZARI_ALLUVIAL_PLAIN",
      labelTr: "Adapazarı – Akyazı – Hendek Alüvyal Ova Çanağı",
      polygonOrBbox: Object.freeze({
        minLat: 40.62,
        maxLat: 40.98,
        minLon: 30.28,
        maxLon: 30.82
      }),
      elevationRangeM: Object.freeze([20, 240] as const),
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.68
    }),
    Object.freeze({
      id: "TR54_SAPANCA_LACUSTRINE_CORRIDOR",
      labelTr: "Sapanca Gölü – Arifiye Ilıman Göl Koridoru",
      polygonOrBbox: Object.freeze({
        minLat: 40.66,
        maxLat: 40.76,
        minLon: 30.12,
        maxLon: 30.34
      }),
      elevationRangeM: Object.freeze([30, 280] as const),
      defaultZone: "strait_corridor",
      defaultUrbanFraction: 0.52
    }),
    Object.freeze({
      id: "TR54_GEYVE_PAMUKOVA_GORGE",
      labelTr: "Geyve Boğazı – Pamukova – Taraklı Güney Geçiş Vadisi",
      polygonOrBbox: Object.freeze({
        minLat: 40.28,
        maxLat: 40.62,
        minLon: 29.96,
        maxLon: 30.62
      }),
      elevationRangeM: Object.freeze([75, 620] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.34
    }),
    Object.freeze({
      id: "TR54_DIKMEN_CAMDAGI_HIGHLANDS",
      labelTr: "Çamdağı – Keremali – Dikmen Tepesi Orografik Sırtı",
      polygonOrBbox: Object.freeze({
        minLat: 40.52,
        maxLat: 40.96,
        minLon: 30.48,
        maxLon: 30.95
      }),
      elevationRangeM: Object.freeze([420, 1725] as const),
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.08
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR54_KARASU_BLACKSEA_COAST: Object.freeze({
      TR54_KARASU_BLACKSEA_COAST: 1.0,
      TR54_ADAPAZARI_ALLUVIAL_PLAIN: 0.48,
      TR54_SAPANCA_LACUSTRINE_CORRIDOR: 0.34,
      TR54_GEYVE_PAMUKOVA_GORGE: 0.12,
      TR54_DIKMEN_CAMDAGI_HIGHLANDS: 0.22
    }),
    TR54_ADAPAZARI_ALLUVIAL_PLAIN: Object.freeze({
      TR54_KARASU_BLACKSEA_COAST: 0.48,
      TR54_ADAPAZARI_ALLUVIAL_PLAIN: 1.0,
      TR54_SAPANCA_LACUSTRINE_CORRIDOR: 0.68,
      TR54_GEYVE_PAMUKOVA_GORGE: 0.24,
      TR54_DIKMEN_CAMDAGI_HIGHLANDS: 0.26
    }),
    TR54_SAPANCA_LACUSTRINE_CORRIDOR: Object.freeze({
      TR54_KARASU_BLACKSEA_COAST: 0.34,
      TR54_ADAPAZARI_ALLUVIAL_PLAIN: 0.68,
      TR54_SAPANCA_LACUSTRINE_CORRIDOR: 1.0,
      TR54_GEYVE_PAMUKOVA_GORGE: 0.28,
      TR54_DIKMEN_CAMDAGI_HIGHLANDS: 0.24
    }),
    TR54_GEYVE_PAMUKOVA_GORGE: Object.freeze({
      TR54_KARASU_BLACKSEA_COAST: 0.12,
      TR54_ADAPAZARI_ALLUVIAL_PLAIN: 0.24,
      TR54_SAPANCA_LACUSTRINE_CORRIDOR: 0.28,
      TR54_GEYVE_PAMUKOVA_GORGE: 1.0,
      TR54_DIKMEN_CAMDAGI_HIGHLANDS: 0.2
    }),
    TR54_DIKMEN_CAMDAGI_HIGHLANDS: Object.freeze({
      TR54_KARASU_BLACKSEA_COAST: 0.22,
      TR54_ADAPAZARI_ALLUVIAL_PLAIN: 0.26,
      TR54_SAPANCA_LACUSTRINE_CORRIDOR: 0.24,
      TR54_GEYVE_PAMUKOVA_GORGE: 0.2,
      TR54_DIKMEN_CAMDAGI_HIGHLANDS: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17069": Object.freeze({
      stationId: 17069,
      nameTr: "Sakarya Merkez (Adapazarı)",
      lat: 40.7676,
      lon: 30.3934,
      demElevationM: 31,
      subBasinId: "TR54_ADAPAZARI_ALLUVIAL_PLAIN",
      urbanFraction: 0.78,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "basin_floor"
    }),
    "17644": Object.freeze({
      stationId: 17644,
      nameTr: "Karasu Karadeniz Kıyı",
      lat: 41.1113,
      lon: 30.6901,
      demElevationM: 6,
      subBasinId: "TR54_KARASU_BLACKSEA_COAST",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "coastal_or_gap"
    }),
    "18419": Object.freeze({
      stationId: 18419,
      nameTr: "Kocaali Sahil",
      lat: 41.0681,
      lon: 30.8469,
      demElevationM: 12,
      subBasinId: "TR54_KARASU_BLACKSEA_COAST",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.1,
      verticalStratumRole: "coastal_or_gap"
    }),
    "18106": Object.freeze({
      stationId: 18106,
      nameTr: "Sapanca Göl Havzası",
      lat: 40.7053,
      lon: 30.1994,
      demElevationM: 71,
      subBasinId: "TR54_SAPANCA_LACUSTRINE_CORRIDOR",
      urbanFraction: 0.48,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "coastal_or_gap"
    }),
    "17662": Object.freeze({
      stationId: 17662,
      nameTr: "Geyve Boğazı / Ova",
      lat: 40.5214,
      lon: 30.296,
      demElevationM: 100,
      subBasinId: "TR54_GEYVE_PAMUKOVA_GORGE",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "19118": Object.freeze({
      stationId: 19118,
      nameTr: "Pamukova Havzası",
      lat: 40.52,
      lon: 30.165,
      demElevationM: 96,
      subBasinId: "TR54_GEYVE_PAMUKOVA_GORGE",
      urbanFraction: 0.32,
      coldPoolSusceptibility: 0.7,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18420": Object.freeze({
      stationId: 18420,
      nameTr: "Taraklı Yamaç",
      lat: 40.3969,
      lon: 30.5208,
      demElevationM: 460,
      subBasinId: "TR54_GEYVE_PAMUKOVA_GORGE",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.42,
      verticalStratumRole: "mid_slope"
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([31, 430, 1080, 1650] as const),
    maxPhysicalPeakM: HYPSO_TR_54.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_54.bands
  }),
  waterBodies: Object.freeze([
    Object.freeze({
      id: "TR54_WESTERN_BLACK_SEA",
      labelTr: "Batı Karadeniz (Karasu – Kocaali DEK Kuşağı)",
      kind: "open_sea",
      mgmMarineStationIds: Object.freeze([17449, 17015]),
      sampleCoord: Object.freeze({ lat: 41.18, lon: 30.72 }),
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.0,
      monthlyWaterTempNormalsC: Object.freeze([
        8.6, 7.8, 8.4, 11.2, 15.8, 20.6, 24.1, 24.8, 22.1, 18.0, 13.8, 10.4
      ] as const),
      subBasinInfluenceWeights: Object.freeze({
        TR54_KARASU_BLACKSEA_COAST: 1.0,
        TR54_ADAPAZARI_ALLUVIAL_PLAIN: 0.62,
        TR54_SAPANCA_LACUSTRINE_CORRIDOR: 0.36,
        TR54_DIKMEN_CAMDAGI_HIGHLANDS: 0.55,
        TR54_GEYVE_PAMUKOVA_GORGE: 0.08
      }),
      onshoreWindSectorDeg: Object.freeze({ fromDeg: 315, toDeg: 45 }),
      effectiveFetchKm: 380,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 11.5,
      dekHeavyDeltaTC: 14.5,
      seaBreezeSpec: Object.freeze({
        activeMonths: Object.freeze([5, 9] as const),
        sectorDeg: Object.freeze({ fromDeg: 330, toDeg: 40 }),
        maxInlandPenetrationKm: 24,
        maxCoolingAmplitudeC: 2.6
      })
    }),
    Object.freeze({
      id: "TR54_SAPANCA_LAKE",
      labelTr: "Sapanca Gölü",
      kind: "fresh_lake",
      mgmMarineStationIds: Object.freeze([]),
      sampleCoord: Object.freeze({ lat: 40.715, lon: 30.255 }),
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 32,
      freezingPointC: 0.0,
      monthlyWaterTempNormalsC: Object.freeze([
        6.8, 6.5, 8.2, 12.0, 16.8, 21.4, 24.6, 25.0, 21.8, 17.2, 12.4, 8.6
      ] as const),
      subBasinInfluenceWeights: Object.freeze({
        TR54_SAPANCA_LACUSTRINE_CORRIDOR: 0.85,
        TR54_ADAPAZARI_ALLUVIAL_PLAIN: 0.28,
        TR54_KARASU_BLACKSEA_COAST: 0.0,
        TR54_GEYVE_PAMUKOVA_GORGE: 0.05,
        TR54_DIKMEN_CAMDAGI_HIGHLANDS: 0.1
      }),
      onshoreWindSectorDeg: Object.freeze({ fromDeg: 250, toDeg: 310 }),
      effectiveFetchKm: 16,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 14.0,
      dekHeavyDeltaTC: 17.5,
      seaBreezeSpec: Object.freeze({
        activeMonths: Object.freeze([6, 9] as const),
        sectorDeg: Object.freeze({ fromDeg: 255, toDeg: 305 }),
        maxInlandPenetrationKm: 6,
        maxCoolingAmplitudeC: 1.1
      })
    })
  ]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR54_SAMANLI_CAMDAGI_BARRIER",
      labelTr: "Samanlı – Keremali – Hendek Çamdağı Orografik ve Fön Bariyeri",
      effectiveBarrierHeightM: 1450,
      crestPressureHpa: 850,
      applicableSubBasins: Object.freeze([
        "TR54_ADAPAZARI_ALLUVIAL_PLAIN",
        "TR54_SAPANCA_LACUSTRINE_CORRIDOR",
        "TR54_KARASU_BLACKSEA_COAST",
        "TR54_DIKMEN_CAMDAGI_HIGHLANDS"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 185, toDeg: 245 }),
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.42,
        sourcePlateauElevationM: 650,
        maxTargetElevationM: 280,
        maxWarmingCapC: 3.3,
        subCloudVirgaFactor: 0.42,
        wetCutoffMmHr: 1.8
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 315, toDeg: 45 }),
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.26,
        maxPrecipMultiplierCap: 1.72
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 180, toDeg: 240 }),
        precipAttenuationFactor: 0.76
      })
    }),
    Object.freeze({
      id: "TR54_GEYVE_SOUTH_SHADOW",
      labelTr: "Geyve – Pamukova Karadeniz Yağış Gölgesi",
      effectiveBarrierHeightM: 1150,
      crestPressureHpa: 850,
      applicableSubBasins: Object.freeze(["TR54_GEYVE_PAMUKOVA_GORGE"]),
      foehnSpec: Object.freeze({
        enabled: false,
        windFromSectorDeg: Object.freeze({ fromDeg: 180, toDeg: 230 }),
        minCrossCrestSpeedMs: 9.0,
        minFroudeNumber: 0.5,
        sourcePlateauElevationM: 700,
        maxTargetElevationM: 220,
        maxWarmingCapC: 1.5,
        subCloudVirgaFactor: 0.25,
        wetCutoffMmHr: 2.0
      }),
      upslopeSpec: Object.freeze({
        enabled: false,
        windFromSectorDeg: Object.freeze({ fromDeg: 330, toDeg: 30 }),
        minOnshoreOrUpslopeSpeedMs: 7.0,
        coastalFrictionalConvergenceBoost: 1.0,
        maxPrecipMultiplierCap: 1.05
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 325, toDeg: 45 }),
        precipAttenuationFactor: 0.62
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR54_GEYVE_STRAIT_VENTURI",
      labelTr: "Geyve – Doğançay Sakarya Boğazı Kanalı",
      centerCoord: Object.freeze({ lat: 40.595, lon: 30.318 }),
      influenceRadiusKm: 13,
      channelAxisFromDeg: 195,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.28,
      gustMultiplier: 1.36,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 31,
    coldPoolMaxDepthM: 210,
    topographicEnclosureIndex: 0.72,
    deltaPressureTopHpa: 975,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 2.6
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.58
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 330, toDeg: 55 }),
      minWindShearVs850Deg: 75
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.24,
    invertedVDryMicroburstSusceptibility: 0.18,
    coastalWaterspoutSusceptibility: 0.56
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "adapazari_center",
      labelTr: "Adapazarı Merkez Ova",
      lat: 40.7676,
      lon: 30.3934,
      elevationM: 31,
      role: "target"
    }),
    Object.freeze({
      key: "karasu_blacksea_upwind",
      labelTr: "Karasu Karadeniz Kıyı",
      lat: 41.1113,
      lon: 30.6901,
      elevationM: 6,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "kocaali_east_coast",
      labelTr: "Kocaali Doğu Sahil",
      lat: 41.0681,
      lon: 30.8469,
      elevationM: 12,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "sapanca_lake_west",
      labelTr: "Sapanca Göl Koridoru",
      lat: 40.7053,
      lon: 30.225,
      elevationM: 45,
      role: "corridor"
    }),
    Object.freeze({
      key: "hendek_camdagi_slope",
      labelTr: "Hendek Çamdağı Kuzey Yamaç",
      lat: 40.855,
      lon: 30.745,
      elevationM: 680,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "dikmen_keremali_summit",
      labelTr: "Hendek Dikmen / Keremali Zirve",
      lat: 40.642,
      lon: 30.785,
      elevationM: 1580,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "akyazi_plain_east",
      labelTr: "Akyazı Doğu Ova",
      lat: 40.685,
      lon: 30.625,
      elevationM: 58,
      role: "corridor"
    }),
    Object.freeze({
      key: "geyve_strait_south",
      labelTr: "Geyve Boğazı Güney Rüzgâr-Üstü",
      lat: 40.5214,
      lon: 30.296,
      elevationM: 100,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "pamukova_lee_basin",
      labelTr: "Pamukova Güney Gölge Havza",
      lat: 40.515,
      lon: 30.168,
      elevationM: 96,
      role: "lee_shadow"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -20,
    maxPlausibleTempC: 45,
    minPlausibleMslpHpa: 975,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 5.2
  })
});

export default PROVINCE_SPEC_TR_54;
