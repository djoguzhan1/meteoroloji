import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_57 = TR81_CLIMATOLOGY_1991_2020["TR-57"];
const HYPSO_TR_57 = TR81_HYPSOMETRIC_PROFILES["TR-57"];

/**
 * Exposed Black Sea peninsula vs Gökırmak rain-shadow metadata for `TR-57` Sinop (`TIER_A_WMO`, WMO `17026`):
 * Contrasts the high-thermal-inertia İnceburun/Boztepe cape (`peninsula_exposed`, long-fetch DEK &
 * Karayel/Yıldız Venturi) against the dry, continental Boyabat–Durağan Gökırmak lee valley south of Küre/Dranaz.
 */
export const TR_57_PENINSULA_SHADOW_META = Object.freeze({
  provinceCode: "TR-57",
  wmoStationId: "17026",
  sinopAerodromeIcao: "LTCM",
  blackSeaOpenFetchKm: 520,
  gokirmakRainShadowFactor: 0.54
});

const SPEC_TR_57_ENGINE = Object.freeze({
  provinceCode: "TR-57",
  plateCode: 57,
  slug: "sinop",
  nameTr: "Sinop",
  region: "BLACK_SEA_WEST_CENTRAL",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "WEST_MID_BLACK_SEA_DEK",
  icaoWhitelist: Object.freeze(["LTCM"]),
  domainBounds: Object.freeze({
    minLat: 41.26,
    maxLat: 42.11,
    minLon: 34.22,
    maxLon: 35.46
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 95701,
    mgmIstNo: 17026,
    mgmSaatlikIstNo: 17026,
    mgmGunlukIstNo: 95701,
    wmoId: "17026",
    lat: 42.0299,
    lon: 35.1545,
    demVerifiedElevationM: 32,
    subBasinId: "inceburun_boztepe_peninsula",
    urbanFraction: 0.56,
    monthlyTmaxNormalsC: CLIM_TR_57.tmaxC,
    monthlyTminNormalsC: CLIM_TR_57.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-57-inceburun-boztepe-uc",
      name: "İnceburun – Boztepe Açık Deniz Yarımadası",
      role: "coast",
      lat: 42.097,
      lon: 34.9451,
      elevationM: 10
    }),
    Object.freeze({
      id: "tr-57-sinop-merkez-ltcm",
      name: "Sinop Merkez & Havalimanı (WMO 17026 / LTCM)",
      role: "plain",
      lat: 42.0299,
      lon: 35.1545,
      elevationM: 32
    }),
    Object.freeze({
      id: "tr-57-boyabat-duragan-gokirmak",
      name: "Boyabat – Durağan Gökırmak Yağış Gölgesi Vadisi",
      role: "foothill",
      lat: 41.463,
      lon: 34.7853,
      elevationM: 350
    }),
    Object.freeze({
      id: "tr-57-cangal-dranaz-kure-sirti",
      name: "Küre Dağları – Dranaz & Çangal Zirve Sırtı",
      role: "summit",
      lat: 41.7206,
      lon: 34.6522,
      elevationM: 1620
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "inceburun_boztepe_peninsula",
      labelTr: "İnceburun – Boztepe Yarımadası & Gerze Açık Deniz Kuşağı",
      polygonOrBbox: Object.freeze({
        minLat: 41.74,
        maxLat: 42.11,
        minLon: 34.86,
        maxLon: 35.34
      }),
      elevationRangeM: Object.freeze([0, 220] as const),
      defaultZone: "peninsula_exposed",
      defaultUrbanFraction: 0.48
    }),
    Object.freeze({
      id: "ayancik_turkeli_windward_coast",
      labelTr: "Ayancık – Türkeli – Erfelek Küre Kuzey Denizel Yamaç Kıyısı",
      polygonOrBbox: Object.freeze({
        minLat: 41.8,
        maxLat: 42.04,
        minLon: 34.24,
        maxLon: 34.92
      }),
      elevationRangeM: Object.freeze([0, 480] as const),
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.28
    }),
    Object.freeze({
      id: "kure_dranaz_cangal_crest",
      labelTr: "Küre Dağları – Dranaz Geçidi – Çangal Yüksek Orman Sırtı",
      polygonOrBbox: Object.freeze({
        minLat: 41.54,
        maxLat: 41.82,
        minLon: 34.34,
        maxLon: 35.3
      }),
      elevationRangeM: Object.freeze([580, 1812] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.04
    }),
    Object.freeze({
      id: "boyabat_duragan_gokirmak_shadow",
      labelTr: "Boyabat – Durağan – Saraydüzü Gökırmak İç Yağış Gölgesi Vadisi",
      polygonOrBbox: Object.freeze({
        minLat: 41.27,
        maxLat: 41.55,
        minLon: 34.52,
        maxLon: 35.34
      }),
      elevationRangeM: Object.freeze([240, 580] as const),
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.32
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    inceburun_boztepe_peninsula: Object.freeze({
      inceburun_boztepe_peninsula: 1.0,
      ayancik_turkeli_windward_coast: 0.82,
      kure_dranaz_cangal_crest: 0.42,
      boyabat_duragan_gokirmak_shadow: 0.16
    }),
    ayancik_turkeli_windward_coast: Object.freeze({
      inceburun_boztepe_peninsula: 0.82,
      ayancik_turkeli_windward_coast: 1.0,
      kure_dranaz_cangal_crest: 0.54,
      boyabat_duragan_gokirmak_shadow: 0.18
    }),
    kure_dranaz_cangal_crest: Object.freeze({
      inceburun_boztepe_peninsula: 0.42,
      ayancik_turkeli_windward_coast: 0.54,
      kure_dranaz_cangal_crest: 1.0,
      boyabat_duragan_gokirmak_shadow: 0.36
    }),
    boyabat_duragan_gokirmak_shadow: Object.freeze({
      inceburun_boztepe_peninsula: 0.16,
      ayancik_turkeli_windward_coast: 0.18,
      kure_dranaz_cangal_crest: 0.36,
      boyabat_duragan_gokirmak_shadow: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17026": Object.freeze({
      stationId: 17026,
      nameTr: "Sinop Merkez Boztepe Yarımadası (WMO 17026)",
      lat: 42.0298,
      lon: 35.1543,
      demElevationM: 32,
      subBasinId: "inceburun_boztepe_peninsula",
      urbanFraction: 0.56,
      coldPoolSusceptibility: 0.06,
      verticalStratumRole: "coastal_or_gap"
    }),
    "17028": Object.freeze({
      stationId: 17028,
      nameTr: "Sinop Havalimanı (LTCM Yarımada Kıstağı)",
      lat: 42.0209,
      lon: 35.079,
      demElevationM: 7,
      subBasinId: "inceburun_boztepe_peninsula",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "coastal_or_gap"
    }),
    LTCM: Object.freeze({
      stationId: "LTCM",
      nameTr: "Sinop Havalimanı METAR (LTCM)",
      lat: 42.0209,
      lon: 35.079,
      demElevationM: 7,
      subBasinId: "inceburun_boztepe_peninsula",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "coastal_or_gap"
    }),
    "17456": Object.freeze({
      stationId: 17456,
      nameTr: "Sinop İnceburun Feneri (Türkiye Kuzey Ucu)",
      lat: 42.097,
      lon: 34.9451,
      demElevationM: 10,
      subBasinId: "inceburun_boztepe_peninsula",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.04,
      verticalStratumRole: "coastal_or_gap"
    }),
    "18549": Object.freeze({
      stationId: 18549,
      nameTr: "Gerze Kıyı",
      lat: 41.7822,
      lon: 35.1951,
      demElevationM: 84,
      subBasinId: "inceburun_boztepe_peninsula",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "coastal_or_gap"
    }),
    "19039": Object.freeze({
      stationId: 19039,
      nameTr: "Ayancık Karadeniz Kıyı",
      lat: 41.9243,
      lon: 34.5807,
      demElevationM: 40,
      subBasinId: "ayancik_turkeli_windward_coast",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.16,
      verticalStratumRole: "coastal_or_gap"
    }),
    "18551": Object.freeze({
      stationId: 18551,
      nameTr: "Türkeli Batı Kıyı",
      lat: 41.9411,
      lon: 34.3344,
      demElevationM: 127,
      subBasinId: "ayancik_turkeli_windward_coast",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "coastal_or_gap"
    }),
    "18711": Object.freeze({
      stationId: 18711,
      nameTr: "Boyabat Dranaz Tüneli / Küre Sırtı (1110m)",
      lat: 41.6203,
      lon: 34.8852,
      demElevationM: 1110,
      subBasinId: "kure_dranaz_cangal_crest",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }),
    "19040": Object.freeze({
      stationId: 19040,
      nameTr: "Ayancık / Çangal Orman Sırtı (1056m)",
      lat: 41.7206,
      lon: 34.6522,
      demElevationM: 1056,
      subBasinId: "kure_dranaz_cangal_crest",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.2,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }),
    "17620": Object.freeze({
      stationId: 17620,
      nameTr: "Boyabat (Gökırmak İç Yağış Gölgesi Vadisi 350m)",
      lat: 41.463,
      lon: 34.7853,
      demElevationM: 350,
      subBasinId: "boyabat_duragan_gokirmak_shadow",
      urbanFraction: 0.46,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18548": Object.freeze({
      stationId: 18548,
      nameTr: "Durağan (Gökırmak–Kızılırmak Kavşağı 287m)",
      lat: 41.4347,
      lon: 35.0506,
      demElevationM: 287,
      subBasinId: "boyabat_duragan_gokirmak_shadow",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.7,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18550": Object.freeze({
      stationId: 18550,
      nameTr: "Saraydüzü İç Vadi",
      lat: 41.3285,
      lon: 34.8497,
      demElevationM: 417,
      subBasinId: "boyabat_duragan_gokirmak_shadow",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.74,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([10, 32, 820, 1620] as const),
    maxPhysicalPeakM: HYPSO_TR_57.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_57.bands
  }),
  waterBodies: Object.freeze([
    Object.freeze({
      id: "central_black_sea_sinop_cape",
      labelTr: "Orta Karadeniz Açık Deniz — İnceburun & Boztepe Uzun-Fetch DEK Havzası",
      kind: "open_sea",
      mgmMarineStationIds: Object.freeze([17026, 17496]),
      sampleCoord: Object.freeze({ lat: 42.16, lon: 35.06 }),
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.0,
      monthlyWaterTempNormalsC: Object.freeze([
        8.6, 7.8, 8.3, 11.0, 15.8, 21.1, 24.4, 25.2, 22.4, 18.2, 13.9, 10.6
      ] as const),
      subBasinInfluenceWeights: Object.freeze({
        inceburun_boztepe_peninsula: 0.98,
        ayancik_turkeli_windward_coast: 0.94,
        kure_dranaz_cangal_crest: 0.56,
        boyabat_duragan_gokirmak_shadow: 0.08
      }),
      onshoreWindSectorDeg: Object.freeze({ fromDeg: 285, toDeg: 75 }),
      effectiveFetchKm: 520,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 11.0,
      dekHeavyDeltaTC: 13.5,
      seaBreezeSpec: Object.freeze({
        activeMonths: Object.freeze([5, 9] as const),
        sectorDeg: Object.freeze({ fromDeg: 330, toDeg: 65 }),
        maxInlandPenetrationKm: 20,
        maxCoolingAmplitudeC: 2.8
      })
    })
  ]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "kure_dranaz_north_windward_wall",
      labelTr: "Küre – Çangal – Dranaz (1812m) Kuzey Denizel Yükselim & Lodos Kıyı Fön Duvarı",
      effectiveBarrierHeightM: 1812,
      crestPressureHpa: 800,
      applicableSubBasins: Object.freeze([
        "ayancik_turkeli_windward_coast",
        "inceburun_boztepe_peninsula",
        "kure_dranaz_cangal_crest"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 165, toDeg: 230 }),
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.4,
        sourcePlateauElevationM: 950,
        maxTargetElevationM: 220,
        maxWarmingCapC: 4.7,
        subCloudVirgaFactor: 0.7,
        wetCutoffMmHr: 1.8
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 295, toDeg: 55 }),
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.26,
        maxPrecipMultiplierCap: 1.78
      })
    }),
    Object.freeze({
      id: "kure_south_lee_gokirmak_rain_shadow",
      labelTr: "Küre Dağları Güney Gölgesi — Boyabat & Durağan Gökırmak Yağış Gölgesi",
      effectiveBarrierHeightM: 1812,
      crestPressureHpa: 800,
      applicableSubBasins: Object.freeze(["boyabat_duragan_gokirmak_shadow"]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 330, toDeg: 40 }),
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.4,
        sourcePlateauElevationM: 1050,
        maxTargetElevationM: 520,
        maxWarmingCapC: 3.6,
        subCloudVirgaFactor: 0.65,
        wetCutoffMmHr: 1.4
      }),
      upslopeSpec: Object.freeze({
        enabled: false,
        windFromSectorDeg: Object.freeze({ fromDeg: 90, toDeg: 140 }),
        minOnshoreOrUpslopeSpeedMs: 8.0,
        coastalFrictionalConvergenceBoost: 1.0,
        maxPrecipMultiplierCap: 1.15
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 310, toDeg: 45 }),
        precipAttenuationFactor: 0.54
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "inceburun_boztepe_karayel_yildiz_venturi",
      labelTr: "İnceburun – Boztepe Yarımadası Karayel/Yıldız Burun Hızlanma Koridoru",
      centerCoord: Object.freeze({ lat: 42.055, lon: 35.06 }),
      influenceRadiusKm: 24,
      channelAxisFromDeg: 325,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.32,
      gustMultiplier: 1.46,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 310,
    coldPoolMaxDepthM: 280,
    topographicEnclosureIndex: 0.56,
    deltaPressureTopHpa: 32,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 3.2
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.76
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 295, toDeg: 40 }),
      minWindShearVs850Deg: 45
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.28,
    invertedVDryMicroburstSusceptibility: 0.22,
    coastalWaterspoutSusceptibility: 0.68
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "target_sinop_boztepe",
      labelTr: "Sinop Merkez Boztepe Yarımadası (WMO 17026)",
      lat: 42.0299,
      lon: 35.1545,
      elevationM: 32,
      role: "target"
    }),
    Object.freeze({
      key: "inceburun_open_sea_nw",
      labelTr: "İnceburun Kuzeybatı Karayel/Yıldız DEK Kaynağı",
      lat: 42.18,
      lon: 34.88,
      elevationM: 0,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "black_sea_open_ne",
      labelTr: "Orta Karadeniz Kuzeydoğu Uzun Fetch Kaynağı",
      lat: 42.16,
      lon: 35.34,
      elevationM: 0,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "sinop_ltcm_isthmus",
      labelTr: "Sinop Havalimanı (LTCM) Kıstak Venturi Kanalı",
      lat: 42.0209,
      lon: 35.079,
      elevationM: 7,
      role: "corridor"
    }),
    Object.freeze({
      key: "ayancik_windward_coast",
      labelTr: "Ayancık Denizel Rüzgârüstü Kıyı",
      lat: 41.9243,
      lon: 34.5807,
      elevationM: 40,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "cangal_kure_wall",
      labelTr: "Ayancık Çangal / Küre Orografik Duvarı (1056m)",
      lat: 41.7206,
      lon: 34.6522,
      elevationM: 1056,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "dranaz_pass_crest",
      labelTr: "Boyabat Dranaz Tüneli / Küre Sırtı (1110m)",
      lat: 41.6203,
      lon: 34.8852,
      elevationM: 1110,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "boyabat_gokirmak_shadow",
      labelTr: "Boyabat Gökırmak Yağış Gölgesi Vadisi (350m)",
      lat: 41.463,
      lon: 34.7853,
      elevationM: 350,
      role: "lee_shadow"
    }),
    Object.freeze({
      key: "duragan_south_lee",
      labelTr: "Durağan İç Gölge Havzası (287m)",
      lat: 41.4347,
      lon: 35.0506,
      elevationM: 287,
      role: "lee_shadow"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -16,
    maxPlausibleTempC: 42,
    minPlausibleMslpHpa: 974,
    maxPlausibleMslpHpa: 1050,
    kalmanTempBiasCapC: 5.2
  })
} satisfies ProvinceEngineSpec);

export const PROVINCE_SPEC_TR_57: ProvinceSpec = SPEC_TR_57_ENGINE;
export default PROVINCE_SPEC_TR_57;
