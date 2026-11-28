import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";
import type { ProvinceSpec } from "../types";

const CLIM_TR_81 = TR81_CLIMATOLOGY_1991_2020["TR-81"];
const HYPSO_TR_81 = TR81_HYPSOMETRIC_PROFILES["TR-81"];

export const TR_81_BOWL_INVERSION_META = Object.freeze({
  provinceCode: "TR-81",
  mgmStationId: 17072,
  mosTier: "TIER_B_DONOR_ALARO" as const,
  donorProvinces: Object.freeze(["TR-54", "TR-14", "TR-67"] as const),
  valleyFloorM: 146,
  coldPoolDepthM: 320,
  clearNightInversionLapseCPerKm: 5.4,
  boluDagiPassElevationM: 900,
  karduzPeakElevationM: 1830
});

/**
 * Wave 3A (REG-08) — `TR-81` Düzce Bespoke Physical & Microclimatic Specification:
 *  - Enclosed Düzce Alluvial Bowl (`valleyFloorM: 146`, `coldPoolDepthM: 320`, `clearNightInversionLapseCPerKm: +5.4`):
 *    Ringed on all four sides by Akçakoca/Kaplandede ridges (north), Bolu Dağı (`900–1650 m`, east),
 *    Elmacık/Kardüz (`1830 m`, south), and Çamdağı/Hendek hills (west), creating one of Türkiye's deepest
 *    winter radiation fog, stratus-lock, and PM2.5 cold-air pools.
 *  - North (Akçakoca `17015` + buoy `17435`): Exposed Western Black Sea DEK coastline sharply decoupled
 *    across Kaplandede pass (`barrierCoupling: 0.24` vs Düzce Bowl).
 *  - East (Kaynaşlı – Bolu Dağı Geçidi `900 m`): Persistent upslope advection fog, rime/glaze icing, and snow.
 *  - South (Gölyaka – Kardüz Yaylası `1830 m`): Heavy alpine snow wall (`maxPhysicalPeakM: 1830`).
 *  - Strict Zero-Leakage METAR Policy: `icaoWhitelist: []`; honest `TIER_B_DONOR_KALMAN` (`TIER_B_DONOR_ALARO`).
 */
const SPEC_TR_81_ENGINE = Object.freeze({
  provinceCode: "TR-81",
  plateCode: 81,
  slug: "duzce",
  nameTr: "Düzce",
  region: "BLACK_SEA_WEST_CENTRAL",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "INLAND_PASS_PLATEAU",
  icaoWhitelist: Object.freeze([]),
  domainBounds: Object.freeze({
    minLat: 40.62,
    maxLat: 41.12,
    minLon: 30.82,
    maxLon: 31.86
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 98101,
    mgmIstNo: 17072,
    mgmSaatlikIstNo: 17072,
    mgmGunlukIstNo: 98101,
    wmoId: "17072",
    lat: 40.8437,
    lon: 31.1488,
    demVerifiedElevationM: 146,
    subBasinId: "TR81_DUZCE_ENCLOSED_BOWL",
    urbanFraction: 0.64,
    monthlyTmaxNormalsC: CLIM_TR_81.tmaxC,
    monthlyTminNormalsC: CLIM_TR_81.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-81-akcakoca",
      name: "Akçakoca Karadeniz DEK Kıyısı",
      role: "coast",
      lat: 41.0865,
      lon: 31.1374,
      elevationM: 12
    }),
    Object.freeze({
      id: "tr-81-merkez",
      name: "Düzce Merkez (Çanak Ova · 146 m)",
      role: "plain",
      lat: 40.8437,
      lon: 31.1488,
      elevationM: 146
    }),
    Object.freeze({
      id: "tr-81-bolu-dagi-gecidi",
      name: "Kaynaşlı / Bolu Dağı Geçidi (900 m)",
      role: "foothill",
      lat: 40.764,
      lon: 31.365,
      elevationM: 900
    }),
    Object.freeze({
      id: "tr-81-karduz-yaylasi",
      name: "Gölyaka Kardüz Yaylası / Elmacık Sırtı",
      role: "summit",
      lat: 40.692,
      lon: 31.058,
      elevationM: 1650
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR81_AKCAKOCA_BLACKSEA_COAST",
      labelTr: "Akçakoca Karadeniz DEK Kıyısı",
      polygonOrBbox: Object.freeze({
        minLat: 41.0,
        maxLat: 41.12,
        minLon: 30.95,
        maxLon: 31.38
      }),
      elevationRangeM: Object.freeze([0, 260] as const),
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.44
    }),
    Object.freeze({
      id: "TR81_DUZCE_ENCLOSED_BOWL",
      labelTr: "Düzce Merkez – Gölyaka – Çilimli – Cumayeri – Gümüşova Çanak Ovası (146 m)",
      polygonOrBbox: Object.freeze({
        minLat: 40.74,
        maxLat: 40.94,
        minLon: 30.88,
        maxLon: 31.28
      }),
      elevationRangeM: Object.freeze([110, 320] as const),
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.56
    }),
    Object.freeze({
      id: "TR81_BOLU_DAGI_YIGILCA_PASS",
      labelTr: "Kaynaşlı – Bolu Dağı Geçidi (900 m) ve Yığılca Sis/Buzlanma Eteği",
      polygonOrBbox: Object.freeze({
        minLat: 40.72,
        maxLat: 41.04,
        minLon: 31.28,
        maxLon: 31.85
      }),
      elevationRangeM: Object.freeze([280, 1150] as const),
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.18
    }),
    Object.freeze({
      id: "TR81_KARDUZ_ELMACIK_SNOW_WALL",
      labelTr: "Kardüz Yaylası – Elmacık Dağları (1830 m) Güney Kar Duvarı",
      polygonOrBbox: Object.freeze({
        minLat: 40.62,
        maxLat: 40.75,
        minLon: 30.9,
        maxLon: 31.42
      }),
      elevationRangeM: Object.freeze([900, 1830] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.04
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR81_AKCAKOCA_BLACKSEA_COAST: Object.freeze({
      TR81_AKCAKOCA_BLACKSEA_COAST: 1.0,
      TR81_DUZCE_ENCLOSED_BOWL: 0.24,
      TR81_BOLU_DAGI_YIGILCA_PASS: 0.28,
      TR81_KARDUZ_ELMACIK_SNOW_WALL: 0.12
    }),
    TR81_DUZCE_ENCLOSED_BOWL: Object.freeze({
      TR81_AKCAKOCA_BLACKSEA_COAST: 0.24,
      TR81_DUZCE_ENCLOSED_BOWL: 1.0,
      TR81_BOLU_DAGI_YIGILCA_PASS: 0.42,
      TR81_KARDUZ_ELMACIK_SNOW_WALL: 0.22
    }),
    TR81_BOLU_DAGI_YIGILCA_PASS: Object.freeze({
      TR81_AKCAKOCA_BLACKSEA_COAST: 0.28,
      TR81_DUZCE_ENCLOSED_BOWL: 0.42,
      TR81_BOLU_DAGI_YIGILCA_PASS: 1.0,
      TR81_KARDUZ_ELMACIK_SNOW_WALL: 0.48
    }),
    TR81_KARDUZ_ELMACIK_SNOW_WALL: Object.freeze({
      TR81_AKCAKOCA_BLACKSEA_COAST: 0.12,
      TR81_DUZCE_ENCLOSED_BOWL: 0.22,
      TR81_BOLU_DAGI_YIGILCA_PASS: 0.48,
      TR81_KARDUZ_ELMACIK_SNOW_WALL: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17072": Object.freeze({
      stationId: 17072,
      nameTr: "Düzce Merkez (Çanak Ova · 146 m)",
      lat: 40.8437,
      lon: 31.1488,
      demElevationM: 146,
      subBasinId: "TR81_DUZCE_ENCLOSED_BOWL",
      urbanFraction: 0.64,
      coldPoolSusceptibility: 0.92,
      verticalStratumRole: "basin_floor"
    }),
    "18259": Object.freeze({
      stationId: 18259,
      nameTr: "Gölyaka Efteni Gölü Çanağı",
      lat: 40.7817,
      lon: 31.0186,
      demElevationM: 118,
      subBasinId: "TR81_DUZCE_ENCLOSED_BOWL",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.95,
      verticalStratumRole: "basin_floor"
    }),
    "19212": Object.freeze({
      stationId: 19212,
      nameTr: "Cumayeri Ova",
      lat: 40.8735,
      lon: 30.9507,
      demElevationM: 131,
      subBasinId: "TR81_DUZCE_ENCLOSED_BOWL",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "basin_floor"
    }),
    "19376": Object.freeze({
      stationId: 19376,
      nameTr: "Gümüşova Batı Çanak",
      lat: 40.8466,
      lon: 30.9375,
      demElevationM: 174,
      subBasinId: "TR81_DUZCE_ENCLOSED_BOWL",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "basin_floor"
    }),
    "19213": Object.freeze({
      stationId: 19213,
      nameTr: "Çilimli Kuzey Etek",
      lat: 40.8918,
      lon: 31.046,
      demElevationM: 185,
      subBasinId: "TR81_DUZCE_ENCLOSED_BOWL",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor"
    }),
    "17015": Object.freeze({
      stationId: 17015,
      nameTr: "Akçakoca Karadeniz Kıyı",
      lat: 41.0895,
      lon: 31.1374,
      demElevationM: 10,
      subBasinId: "TR81_AKCAKOCA_BLACKSEA_COAST",
      urbanFraction: 0.46,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "19214": Object.freeze({
      stationId: 19214,
      nameTr: "Kaynaşlı Bolu Dağı Girişi",
      lat: 40.7731,
      lon: 31.3194,
      demElevationM: 310,
      subBasinId: "TR81_BOLU_DAGI_YIGILCA_PASS",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18260": Object.freeze({
      stationId: 18260,
      nameTr: "Yığılca Dağ Vadisi",
      lat: 40.9725,
      lon: 31.44,
      demElevationM: 501,
      subBasinId: "TR81_BOLU_DAGI_YIGILCA_PASS",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "19017": Object.freeze({
      stationId: 19017,
      nameTr: "Bolu Dağı Geçidi (Bakacak / Karanlıkdere · 900 m)",
      lat: 40.764,
      lon: 31.365,
      demElevationM: 900,
      subBasinId: "TR81_BOLU_DAGI_YIGILCA_PASS",
      urbanFraction: 0.08,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18669": Object.freeze({
      stationId: 18669,
      nameTr: "Gölyaka Kardüz Yaylası / Elmacık Sırtı",
      lat: 40.692,
      lon: 31.058,
      demElevationM: 1650,
      subBasinId: "TR81_KARDUZ_ELMACIK_SNOW_WALL",
      urbanFraction: 0.03,
      coldPoolSusceptibility: 0.16,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([146, 466, 980, 1750] as const),
    maxPhysicalPeakM: HYPSO_TR_81.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_81.bands
  }),
  waterBodies: Object.freeze([
    Object.freeze({
      id: "TR81_AKCAKOCA_WEST_BLACK_SEA",
      labelTr: "Batı Karadeniz (Akçakoca DEK Kuşağı)",
      kind: "open_sea",
      mgmMarineStationIds: Object.freeze([17435]),
      sampleCoord: Object.freeze({ lat: 41.15, lon: 31.13 }),
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.0,
      monthlyWaterTempNormalsC: Object.freeze([
        8.5, 7.7, 8.3, 11.0, 15.7, 20.6, 24.1, 24.9, 22.1, 18.0, 13.9, 10.4
      ] as const),
      subBasinInfluenceWeights: Object.freeze({
        TR81_AKCAKOCA_BLACKSEA_COAST: 1.0,
        TR81_DUZCE_ENCLOSED_BOWL: 0.26,
        TR81_BOLU_DAGI_YIGILCA_PASS: 0.42,
        TR81_KARDUZ_ELMACIK_SNOW_WALL: 0.48
      }),
      onshoreWindSectorDeg: Object.freeze({ fromDeg: 305, toDeg: 45 }),
      effectiveFetchKm: 450,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 11.5,
      dekHeavyDeltaTC: 14.5,
      seaBreezeSpec: Object.freeze({
        activeMonths: Object.freeze([5, 9] as const),
        sectorDeg: Object.freeze({ fromDeg: 320, toDeg: 40 }),
        maxInlandPenetrationKm: 16,
        maxCoolingAmplitudeC: 2.5
      })
    })
  ]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR81_KARDUZ_ELMACIK_AND_KAPLANDEDE_BARRIER",
      labelTr: "Elmacık/Kardüz (1830 m) Lodos Fön ve Akçakoca DEK Bariyeri",
      effectiveBarrierHeightM: 1680,
      crestPressureHpa: 850,
      applicableSubBasins: Object.freeze([
        "TR81_AKCAKOCA_BLACKSEA_COAST",
        "TR81_DUZCE_ENCLOSED_BOWL",
        "TR81_BOLU_DAGI_YIGILCA_PASS",
        "TR81_KARDUZ_ELMACIK_SNOW_WALL"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 170, toDeg: 235 }),
        minCrossCrestSpeedMs: 7.2,
        minFroudeNumber: 0.42,
        sourcePlateauElevationM: 920,
        maxTargetElevationM: 360,
        maxWarmingCapC: 4.1,
        subCloudVirgaFactor: 0.5,
        wetCutoffMmHr: 1.6
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 305, toDeg: 45 }),
        minOnshoreOrUpslopeSpeedMs: 4.5,
        coastalFrictionalConvergenceBoost: 1.3,
        maxPrecipMultiplierCap: 1.48
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 175, toDeg: 230 }),
        precipAttenuationFactor: 0.66
      })
    }),
    Object.freeze({
      id: "TR81_BOLU_DAGI_PASS_ICING_WALL",
      labelTr: "Bolu Dağı Geçidi (900 m) Karayel/Poyraz Sis ve Buzlanma Yamacı",
      effectiveBarrierHeightM: 1150,
      crestPressureHpa: 850,
      applicableSubBasins: Object.freeze(["TR81_BOLU_DAGI_YIGILCA_PASS"]),
      foehnSpec: Object.freeze({
        enabled: false,
        windFromSectorDeg: Object.freeze({ fromDeg: 180, toDeg: 225 }),
        minCrossCrestSpeedMs: 10.0,
        minFroudeNumber: 0.55,
        sourcePlateauElevationM: 1000,
        maxTargetElevationM: 300,
        maxWarmingCapC: 1.5,
        subCloudVirgaFactor: 0.25,
        wetCutoffMmHr: 2.0
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 280, toDeg: 355 }),
        minOnshoreOrUpslopeSpeedMs: 4.0,
        coastalFrictionalConvergenceBoost: 1.24,
        maxPrecipMultiplierCap: 1.46
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR81_BOLU_DAGI_SADDLE_GAP",
      labelTr: "Kaynaşlı – Bakacak Bolu Dağı Boğaz Rüzgârı",
      centerCoord: Object.freeze({ lat: 40.764, lon: 31.365 }),
      influenceRadiusKm: 9,
      channelAxisFromDeg: 275,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.25,
      gustMultiplier: 1.34,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 146,
    coldPoolMaxDepthM: 320,
    topographicEnclosureIndex: 0.94,
    deltaPressureTopHpa: 38,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 2.5,
      maxExtraRadiativeCoolingC: 3.8
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.48
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 320, toDeg: 65 }),
      minWindShearVs850Deg: 65
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.22,
    invertedVDryMicroburstSusceptibility: 0.16,
    coastalWaterspoutSusceptibility: 0.58
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "duzce_center_17072",
      labelTr: "Düzce Merkez Çanak Ova (146 m)",
      lat: 40.8437,
      lon: 31.1488,
      elevationM: 146,
      role: "target"
    }),
    Object.freeze({
      key: "akcakoca_coast_17015",
      labelTr: "Akçakoca Karadeniz Kıyısı",
      lat: 41.0865,
      lon: 31.1374,
      elevationM: 12,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "kaplandede_tepepe_pass",
      labelTr: "Kaplandede / Tepeköy Kuzey Sırtı",
      lat: 40.985,
      lon: 31.155,
      elevationM: 640,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "efteni_golyaka_floor",
      labelTr: "Gölyaka – Efteni En Derin Sis Tabanı",
      lat: 40.7817,
      lon: 31.0186,
      elevationM: 118,
      role: "lee_shadow"
    }),
    Object.freeze({
      key: "gumusova_west_corridor",
      labelTr: "Gümüşova – Cumayeri Batı Girişi",
      lat: 40.858,
      lon: 30.945,
      elevationM: 155,
      role: "corridor"
    }),
    Object.freeze({
      key: "kaynasli_bolu_dagi_pass",
      labelTr: "Bolu Dağı Geçidi (900 m Sis/Buzlanma)",
      lat: 40.764,
      lon: 31.365,
      elevationM: 900,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "yigilca_ne_valley",
      labelTr: "Yığılca Kuzeydoğu Dağ Vadisi",
      lat: 40.9725,
      lon: 31.44,
      elevationM: 501,
      role: "corridor"
    }),
    Object.freeze({
      key: "karduz_elmacik_summit",
      labelTr: "Kardüz Yaylası / Elmacık Kar Sırtı",
      lat: 40.692,
      lon: 31.058,
      elevationM: 1650,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "topuk_yaylasi_se_ridge",
      labelTr: "Topuk Yaylası Güneydoğu Sırtı",
      lat: 40.715,
      lon: 31.295,
      elevationM: 1280,
      role: "orographic_wall"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -22,
    maxPlausibleTempC: 44,
    minPlausibleMslpHpa: 976,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 6.2
  }),
  inversion: Object.freeze({
    valleyFloorM: 146,
    coldPoolDepthM: 320,
    clearNightInversionLapseCPerKm: 5.4,
    snowpackBoostFactor: 1.45,
    enclosureIndex: 0.94
  })
} satisfies ProvinceEngineSpec);

export const PROVINCE_SPEC_TR_81: ProvinceSpec = SPEC_TR_81_ENGINE;
export default PROVINCE_SPEC_TR_81;
