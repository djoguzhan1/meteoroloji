import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";
import type { ProvinceSpec } from "../types";

const CLIM_TR_74 = TR81_CLIMATOLOGY_1991_2020["TR-74"];
const HYPSO_TR_74 = TR81_HYPSOMETRIC_PROFILES["TR-74"];

export const TR_74_CALIBRATION_ANCHOR_META = Object.freeze({
  provinceCode: "TR-74",
  mgmStationId: 17020,
  mosTier: "TIER_B_DONOR_ALARO" as const,
  donorProvinces: Object.freeze(["TR-67", "TR-37"] as const),
  allowedMetarIcaos: Object.freeze([] as const)
});

/**
 * Wave 3A (REG-08) — `TR-74` Bartın Bespoke Physical & Microclimatic Specification:
 *  - Amasra – Kurucaşile – İnkumu Steep Black Sea Cliff (`effectiveFetchKm: 490`): Exposed maritime headland
 *    with strong NW–NE DEK squalls (`300°–55°`) and mild winter nights (`17602` Amasra, `18245` Kurucaşile).
 *  - Bartın Çayı Inland Alluvial Bowl (`30–33 m` Merkez `17020`): Sheltered ~12 km inland behind `300–550 m`
 *    coastal hills (`barrierCoupling: 0.42` vs Amasra), producing strong nocturnal radiation fog, frost, and
 *    markedly higher diurnal amplitude than Amasra headland.
 *  - Ulus – Kumluca – Arıt Küre Mountains Karst Wall (`620–1685 m`): Intense orographic snow accumulation on
 *    northerly flows and sharp southerly Küre Foehn warming descending toward Bartın & Amasra.
 *  - Strict Zero-Leakage METAR Policy: `icaoWhitelist: []` (`LTAS` stays strictly inside `TR-67` Zonguldak);
 *    calibrated via honest `TIER_B_DONOR_KALMAN` (`TIER_B_DONOR_ALARO` mesoscale + donor simplex).
 */
const SPEC_TR_74_ENGINE = Object.freeze({
  provinceCode: "TR-74",
  plateCode: 74,
  slug: "bartin",
  nameTr: "Bartın",
  region: "BLACK_SEA_WEST_CENTRAL",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "WEST_MID_BLACK_SEA_DEK",
  icaoWhitelist: Object.freeze([]),
  domainBounds: Object.freeze({
    minLat: 41.3,
    maxLat: 41.86,
    minLon: 32.09,
    maxLon: 32.94
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 97401,
    mgmIstNo: 17020,
    mgmSaatlikIstNo: 17020,
    mgmGunlukIstNo: 97401,
    wmoId: "17020",
    lat: 41.6248,
    lon: 32.3569,
    demVerifiedElevationM: 33,
    subBasinId: "TR74_BARTIN_RIVER_BOWL",
    urbanFraction: 0.56,
    monthlyTmaxNormalsC: CLIM_TR_74.tmaxC,
    monthlyTminNormalsC: CLIM_TR_74.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-74-amasra",
      name: "Amasra / Kurucaşile Karadeniz Kıyısı",
      role: "coast",
      lat: 41.7465,
      lon: 32.3865,
      elevationM: 25
    }),
    Object.freeze({
      id: "tr-74-merkez",
      name: "Bartın Merkez (Bartın Çayı Çanağı)",
      role: "plain",
      lat: 41.6248,
      lon: 32.3569,
      elevationM: 33
    }),
    Object.freeze({
      id: "tr-74-ulus",
      name: "Ulus / Küre Milli Park Eteği",
      role: "foothill",
      lat: 41.5819,
      lon: 32.637,
      elevationM: 162
    }),
    Object.freeze({
      id: "tr-74-arit-kure-zirve",
      name: "Arıt / Küre Dağları Karst Sırtı",
      role: "summit",
      lat: 41.665,
      lon: 32.72,
      elevationM: 1480
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR74_AMASRA_KURUCASILE_CLIFF_COAST",
      labelTr: "Amasra – İnkumu – Çakraz – Kurucaşile Dik DEK Kıyısı",
      polygonOrBbox: Object.freeze({
        minLat: 41.68,
        maxLat: 41.86,
        minLon: 32.16,
        maxLon: 32.84
      }),
      elevationRangeM: Object.freeze([0, 320] as const),
      defaultZone: "peninsula_exposed",
      defaultUrbanFraction: 0.42
    }),
    Object.freeze({
      id: "TR74_BARTIN_RIVER_BOWL",
      labelTr: "Bartın Merkez – Kozcağız Kıyı Gerisi Sisli Çay Çanağı (30 m)",
      polygonOrBbox: Object.freeze({
        minLat: 41.44,
        maxLat: 41.68,
        minLon: 32.14,
        maxLon: 32.52
      }),
      elevationRangeM: Object.freeze([10, 260] as const),
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.52
    }),
    Object.freeze({
      id: "TR74_ULUS_KUMLUCA_FOOTHILLS",
      labelTr: "Ulus – Kumluca – Hasankadı Küre Dağ Eteği Vadileri",
      polygonOrBbox: Object.freeze({
        minLat: 41.32,
        maxLat: 41.64,
        minLon: 32.42,
        maxLon: 32.88
      }),
      elevationRangeM: Object.freeze([140, 780] as const),
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.24
    }),
    Object.freeze({
      id: "TR74_KURE_ARIT_OROG_SUMMIT",
      labelTr: "Arıt – Küre Dağları Milli Parkı Yüksek Kar Duvarı",
      polygonOrBbox: Object.freeze({
        minLat: 41.52,
        maxLat: 41.8,
        minLon: 32.56,
        maxLon: 32.94
      }),
      elevationRangeM: Object.freeze([780, 1685] as const),
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.05
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR74_AMASRA_KURUCASILE_CLIFF_COAST: Object.freeze({
      TR74_AMASRA_KURUCASILE_CLIFF_COAST: 1.0,
      TR74_BARTIN_RIVER_BOWL: 0.42,
      TR74_ULUS_KUMLUCA_FOOTHILLS: 0.3,
      TR74_KURE_ARIT_OROG_SUMMIT: 0.24
    }),
    TR74_BARTIN_RIVER_BOWL: Object.freeze({
      TR74_AMASRA_KURUCASILE_CLIFF_COAST: 0.42,
      TR74_BARTIN_RIVER_BOWL: 1.0,
      TR74_ULUS_KUMLUCA_FOOTHILLS: 0.54,
      TR74_KURE_ARIT_OROG_SUMMIT: 0.22
    }),
    TR74_ULUS_KUMLUCA_FOOTHILLS: Object.freeze({
      TR74_AMASRA_KURUCASILE_CLIFF_COAST: 0.3,
      TR74_BARTIN_RIVER_BOWL: 0.54,
      TR74_ULUS_KUMLUCA_FOOTHILLS: 1.0,
      TR74_KURE_ARIT_OROG_SUMMIT: 0.46
    }),
    TR74_KURE_ARIT_OROG_SUMMIT: Object.freeze({
      TR74_AMASRA_KURUCASILE_CLIFF_COAST: 0.24,
      TR74_BARTIN_RIVER_BOWL: 0.22,
      TR74_ULUS_KUMLUCA_FOOTHILLS: 0.46,
      TR74_KURE_ARIT_OROG_SUMMIT: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17020": Object.freeze({
      stationId: 17020,
      nameTr: "Bartın Merkez (Çay Çanağı · 33 m)",
      lat: 41.6248,
      lon: 32.3569,
      demElevationM: 33,
      subBasinId: "TR74_BARTIN_RIVER_BOWL",
      urbanFraction: 0.56,
      coldPoolSusceptibility: 0.74,
      verticalStratumRole: "basin_floor"
    }),
    "17602": Object.freeze({
      stationId: 17602,
      nameTr: "Amasra Yarımada Kıyı",
      lat: 41.7526,
      lon: 32.3827,
      demElevationM: 73,
      subBasinId: "TR74_AMASRA_KURUCASILE_CLIFF_COAST",
      urbanFraction: 0.46,
      coldPoolSusceptibility: 0.06,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "18245": Object.freeze({
      stationId: 18245,
      nameTr: "Kurucaşile Karadeniz Kıyı",
      lat: 41.8447,
      lon: 32.7236,
      demElevationM: 5,
      subBasinId: "TR74_AMASRA_KURUCASILE_CLIFF_COAST",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "17615": Object.freeze({
      stationId: 17615,
      nameTr: "Ulus Küre Eteği",
      lat: 41.5819,
      lon: 32.637,
      demElevationM: 162,
      subBasinId: "TR74_ULUS_KUMLUCA_FOOTHILLS",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18692": Object.freeze({
      stationId: 18692,
      nameTr: "Kumluca Orman Yamaç",
      lat: 41.448,
      lon: 32.456,
      demElevationM: 385,
      subBasinId: "TR74_ULUS_KUMLUCA_FOOTHILLS",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "19207": Object.freeze({
      stationId: 19207,
      nameTr: "Hasankadı Güney Vadi",
      lat: 41.398,
      lon: 32.495,
      demElevationM: 310,
      subBasinId: "TR74_ULUS_KUMLUCA_FOOTHILLS",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "19007": Object.freeze({
      stationId: 19007,
      nameTr: "Arıt / Küre Dağları Yüksek Kar Sırtı",
      lat: 41.665,
      lon: 32.72,
      demElevationM: 1380,
      subBasinId: "TR74_KURE_ARIT_OROG_SUMMIT",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([30, 265, 820, 1560] as const),
    maxPhysicalPeakM: HYPSO_TR_74.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_74.bands
  }),
  waterBodies: Object.freeze([
    Object.freeze({
      id: "TR74_WEST_BLACK_SEA_AMASRA",
      labelTr: "Batı Karadeniz (Amasra – Kurucaşile 490 km DEK Kuşağı)",
      kind: "open_sea",
      mgmMarineStationIds: Object.freeze([17395, 17426]),
      sampleCoord: Object.freeze({ lat: 41.84, lon: 32.38 }),
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.0,
      monthlyWaterTempNormalsC: Object.freeze([
        8.4, 7.5, 8.1, 10.8, 15.5, 20.5, 24.0, 24.9, 22.1, 17.9, 13.8, 10.3
      ] as const),
      subBasinInfluenceWeights: Object.freeze({
        TR74_AMASRA_KURUCASILE_CLIFF_COAST: 1.0,
        TR74_BARTIN_RIVER_BOWL: 0.52,
        TR74_ULUS_KUMLUCA_FOOTHILLS: 0.44,
        TR74_KURE_ARIT_OROG_SUMMIT: 0.72
      }),
      onshoreWindSectorDeg: Object.freeze({ fromDeg: 295, toDeg: 55 }),
      effectiveFetchKm: 490,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 11.5,
      dekHeavyDeltaTC: 14.5,
      seaBreezeSpec: Object.freeze({
        activeMonths: Object.freeze([5, 9] as const),
        sectorDeg: Object.freeze({ fromDeg: 310, toDeg: 50 }),
        maxInlandPenetrationKm: 20,
        maxCoolingAmplitudeC: 2.8
      })
    })
  ]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR74_KURE_AMASRA_DEK_AND_FOEHN_BARRIER",
      labelTr: "Küre Dağları – Amasra Dik DEK Duvarı ve Güneyli Fön Bariyeri",
      effectiveBarrierHeightM: 1560,
      crestPressureHpa: 850,
      applicableSubBasins: Object.freeze([
        "TR74_AMASRA_KURUCASILE_CLIFF_COAST",
        "TR74_BARTIN_RIVER_BOWL",
        "TR74_ULUS_KUMLUCA_FOOTHILLS",
        "TR74_KURE_ARIT_OROG_SUMMIT"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 155, toDeg: 230 }),
        minCrossCrestSpeedMs: 6.8,
        minFroudeNumber: 0.38,
        sourcePlateauElevationM: 980,
        maxTargetElevationM: 320,
        maxWarmingCapC: 4.5,
        subCloudVirgaFactor: 0.55,
        wetCutoffMmHr: 1.5
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 295, toDeg: 55 }),
        minOnshoreOrUpslopeSpeedMs: 4.2,
        coastalFrictionalConvergenceBoost: 1.32,
        maxPrecipMultiplierCap: 1.5
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 160, toDeg: 225 }),
        precipAttenuationFactor: 0.6
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR74_AMASRA_HEADLAND_JET",
      labelTr: "Amasra – Çakraz Burun Poyraz/Yıldız Hızlanma Kuşağı",
      centerCoord: Object.freeze({ lat: 41.7526, lon: 32.3827 }),
      influenceRadiusKm: 11,
      channelAxisFromDeg: 40,
      bidirectional: true,
      sectorHalfWidthDeg: 35,
      speedMultiplier: 1.26,
      gustMultiplier: 1.35,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 30,
    coldPoolMaxDepthM: 235,
    topographicEnclosureIndex: 0.78,
    deltaPressureTopHpa: 30,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 3.1
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.58
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 315, toDeg: 60 }),
      minWindShearVs850Deg: 72
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.2,
    invertedVDryMicroburstSusceptibility: 0.14,
    coastalWaterspoutSusceptibility: 0.7
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "bartin_center_17020",
      labelTr: "Bartın Merkez Çay Çanağı (33 m)",
      lat: 41.6248,
      lon: 32.3569,
      elevationM: 33,
      role: "target"
    }),
    Object.freeze({
      key: "amasra_coastal_headland",
      labelTr: "Amasra Karadeniz Burnu",
      lat: 41.7465,
      lon: 32.3865,
      elevationM: 25,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "kurucasile_east_coast",
      labelTr: "Kurucaşile Doğu DEK Kıyısı",
      lat: 41.84,
      lon: 32.718,
      elevationM: 12,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "inkumu_bozkoy_gap",
      labelTr: "İnkumu – Boğaz Kıyı Boğazı",
      lat: 41.682,
      lon: 32.255,
      elevationM: 15,
      role: "corridor"
    }),
    Object.freeze({
      key: "amasra_coastal_ridge",
      labelTr: "Amasra Kuşkayası Kıyı Gerisi Sırtı",
      lat: 41.708,
      lon: 32.425,
      elevationM: 430,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "arit_kure_karst_wall",
      labelTr: "Arıt – Küre Milli Park Yüksek Duvarı",
      lat: 41.665,
      lon: 32.72,
      elevationM: 1480,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "ulus_foothill_valley",
      labelTr: "Ulus Dağ Eteği",
      lat: 41.5819,
      lon: 32.637,
      elevationM: 162,
      role: "corridor"
    }),
    Object.freeze({
      key: "kumluca_south_windward",
      labelTr: "Kumluca Güney Rüzgâr-Üstü Sırt",
      lat: 41.425,
      lon: 32.48,
      elevationM: 640,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "kozcagiz_inner_basin",
      labelTr: "Kozcağız Sisli Güneybatı Çanak",
      lat: 41.505,
      lon: 32.338,
      elevationM: 48,
      role: "lee_shadow"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -20,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 976,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 5.8
  }),
  inversion: Object.freeze({
    valleyFloorM: 30,
    coldPoolDepthM: 235,
    clearNightInversionLapseCPerKm: 3.4,
    snowpackBoostFactor: 1.35,
    enclosureIndex: 0.78
  })
} satisfies ProvinceEngineSpec);

export const PROVINCE_SPEC_TR_74: ProvinceSpec = SPEC_TR_74_ENGINE;
export default PROVINCE_SPEC_TR_74;
