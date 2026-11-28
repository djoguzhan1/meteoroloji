import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";
import type { ProvinceSpec } from "../types";

const CLIM_TR_62 = TR81_CLIMATOLOGY_1991_2020["TR-62"];
const HYPSO_TR_62 = TR81_HYPSOMETRIC_PROFILES["TR-62"];

export const TR_62_MUNZUR_OVACIK_META = Object.freeze({
  provinceCode: "TR-62",
  mgmCenterIstNo: 17165,
  mosTier: "TIER_B_DONOR_ALARO" as const,
  donorProvinces: Object.freeze(["TR-12", "TR-24", "TR-23"] as const),
  munzurPeakElevationM: 3462,
  ovacikSnowBowlElevationM: 1280,
  valleyConfluenceFloorM: 915,
  allowedMetarIcaos: Object.freeze([] as const)
});

/**
 * Wave 3C (REG-16) — `TR-62` Tunceli Bespoke Physical & Microclimatic Specification:
 *  - Deep Munzur & Pülümür Canyon Confluence (`~915–981 m` Merkez `17165`) vs. Sheer Northern
 *    **Munzur / Mercan Wall (`3,462 m`) & Ovacık High Snow Bowl (`~1,250–1,500 m`, `18179` at `1,280 m`)**:
 *    Southwesterly/southerly moist Mediterranean–Upper Euphrates airflow (`165°–245°`) ascends a `2,500 m`
 *    vertical barrier in less than `35 km`, driving extreme `upslopeSpec` precipitation enhancement (`1.82x` cap)
 *    that makes Ovacık & Munzur one of Türkiye's deepest inland snowpack basins (`> 1,200 mm/yr` liquid equiv).
 *  - Ovacık Snow-Bowl Nocturnal Inversion (`snowpackBoostFactor: 1.6`): Surrounded by 3,000 m+ limestone walls,
 *    fresh snow cover produces severe `-25..-32°C` clear-night radiative cooling.
 *  - Pertek (`18769`) & Çemişgezek (`17768`) Southern Keban Reservoir Shore (`fresh_lake`, `effectiveFetchKm: 16 < 25`
 *    — strictly zero open-sea DEK) and strict `icaoWhitelist: []` (`TIER_B_DONOR_KALMAN`).
 */
const SPEC_TR_62_ENGINE = Object.freeze({
  provinceCode: "TR-62",
  plateCode: 62,
  slug: "tunceli",
  nameTr: "Tunceli",
  region: "EASTERN_ANATOLIA",
  climateRegion: "DOGU_ANADOLU",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "HIGH_EAST_SNOW_BASIN",
  icaoWhitelist: Object.freeze([]),
  domainBounds: Object.freeze({
    minLat: 38.76,
    maxLat: 39.62,
    minLon: 38.73,
    maxLon: 40.41
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 96201,
    mgmIstNo: 17165,
    mgmSaatlikIstNo: 17165,
    mgmGunlukIstNo: 96201,
    wmoId: "17165",
    lat: 39.1058,
    lon: 39.5408,
    demVerifiedElevationM: 981,
    subBasinId: "TR62_MUNZUR_PULUMUR_DEEP_GORGE",
    urbanFraction: 0.48,
    monthlyTmaxNormalsC: CLIM_TR_62.tmaxC,
    monthlyTminNormalsC: CLIM_TR_62.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-62-pertek",
      name: "Pertek – Çemişgezek Keban Kuzey Kıyısı",
      role: "plain",
      lat: 38.9342,
      lon: 39.1672,
      elevationM: 1056
    }),
    Object.freeze({
      id: "tr-62-merkez",
      name: "Tunceli Merkez (Munzur–Pülümür Vadisi · ~915 m Taban)",
      role: "plain",
      lat: 39.1058,
      lon: 39.5408,
      elevationM: 940
    }),
    Object.freeze({
      id: "tr-62-ovacik",
      name: "Ovacık Yüksek Kar Çanağı & Pülümür Vadisi",
      role: "foothill",
      lat: 39.3681,
      lon: 39.2419,
      elevationM: 1280
    }),
    Object.freeze({
      id: "tr-62-munzur-zirve",
      name: "Munzur / Mercan Dağları Alpin Zirve Kuşağı (3462 m)",
      role: "summit",
      lat: 39.425,
      lon: 39.185,
      elevationM: 2750
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR62_MUNZUR_PULUMUR_DEEP_GORGE",
      labelTr: "Tunceli Merkez – Derin Munzur ve Alt Pülümür Vadi Tabanı (~915–1100 m)",
      polygonOrBbox: Object.freeze({
        minLat: 39.02,
        maxLat: 39.28,
        minLon: 39.36,
        maxLon: 39.72
      }),
      elevationRangeM: Object.freeze([890, 1220] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.44
    }),
    Object.freeze({
      id: "TR62_PERTEK_CEMISGEZEK_KEBAN_TERRACE",
      labelTr: "Pertek – Çemişgezek – Mazgirt Alt Etek Keban Ilıman Havzası",
      polygonOrBbox: Object.freeze({
        minLat: 38.77,
        maxLat: 39.08,
        minLon: 38.75,
        maxLon: 39.78
      }),
      elevationRangeM: Object.freeze([845, 1380] as const),
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.24
    }),
    Object.freeze({
      id: "TR62_OVACIK_HIGH_SNOW_BOWL",
      labelTr: "Ovacık Yüksek Kar Çanağı (1250–1500 m) ve Hozat – Nazımiye – Pülümür Etekleri",
      polygonOrBbox: Object.freeze({
        minLat: 39.08,
        maxLat: 39.52,
        minLon: 38.82,
        maxLon: 40.25
      }),
      elevationRangeM: Object.freeze([1220, 1850] as const),
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.16
    }),
    Object.freeze({
      id: "TR62_MUNZUR_MERCAN_3462M_WALL",
      labelTr: "Munzur / Mercan Dağları (3462 m) – Bağırpaşa Alpin Kar Duvarı",
      polygonOrBbox: Object.freeze({
        minLat: 39.34,
        maxLat: 39.61,
        minLon: 38.85,
        maxLon: 40.38
      }),
      elevationRangeM: Object.freeze([1850, 3462] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.02
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR62_MUNZUR_PULUMUR_DEEP_GORGE: Object.freeze({
      TR62_MUNZUR_PULUMUR_DEEP_GORGE: 1.0,
      TR62_PERTEK_CEMISGEZEK_KEBAN_TERRACE: 0.58,
      TR62_OVACIK_HIGH_SNOW_BOWL: 0.34,
      TR62_MUNZUR_MERCAN_3462M_WALL: 0.2
    }),
    TR62_PERTEK_CEMISGEZEK_KEBAN_TERRACE: Object.freeze({
      TR62_MUNZUR_PULUMUR_DEEP_GORGE: 0.58,
      TR62_PERTEK_CEMISGEZEK_KEBAN_TERRACE: 1.0,
      TR62_OVACIK_HIGH_SNOW_BOWL: 0.26,
      TR62_MUNZUR_MERCAN_3462M_WALL: 0.14
    }),
    TR62_OVACIK_HIGH_SNOW_BOWL: Object.freeze({
      TR62_MUNZUR_PULUMUR_DEEP_GORGE: 0.34,
      TR62_PERTEK_CEMISGEZEK_KEBAN_TERRACE: 0.26,
      TR62_OVACIK_HIGH_SNOW_BOWL: 1.0,
      TR62_MUNZUR_MERCAN_3462M_WALL: 0.52
    }),
    TR62_MUNZUR_MERCAN_3462M_WALL: Object.freeze({
      TR62_MUNZUR_PULUMUR_DEEP_GORGE: 0.2,
      TR62_PERTEK_CEMISGEZEK_KEBAN_TERRACE: 0.14,
      TR62_OVACIK_HIGH_SNOW_BOWL: 0.52,
      TR62_MUNZUR_MERCAN_3462M_WALL: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17165": Object.freeze({
      stationId: 17165,
      nameTr: "Tunceli Merkez (Munzur Vadisi · 981 m)",
      lat: 39.1058,
      lon: 39.5408,
      demElevationM: 981,
      subBasinId: "TR62_MUNZUR_PULUMUR_DEEP_GORGE",
      urbanFraction: 0.48,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "basin_floor"
    }),
    "18179": Object.freeze({
      stationId: 18179,
      nameTr: "Ovacık Yüksek Kar Çanağı (1280 m)",
      lat: 39.3681,
      lon: 39.2419,
      demElevationM: 1280,
      subBasinId: "TR62_OVACIK_HIGH_SNOW_BOWL",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18586": Object.freeze({
      stationId: 18586,
      nameTr: "Pülümür Yüksek Boğaz Vadisi (1565 m)",
      lat: 39.4844,
      lon: 39.8914,
      demElevationM: 1565,
      subBasinId: "TR62_OVACIK_HIGH_SNOW_BOWL",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18355": Object.freeze({
      stationId: 18355,
      nameTr: "Nazımiye Doğu Dağ Yamacı (1602 m)",
      lat: 39.1787,
      lon: 39.8179,
      demElevationM: 1602,
      subBasinId: "TR62_OVACIK_HIGH_SNOW_BOWL",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18354": Object.freeze({
      stationId: 18354,
      nameTr: "Hozat Batı Yayla Eteği (1485 m)",
      lat: 39.1003,
      lon: 39.2314,
      demElevationM: 1485,
      subBasinId: "TR62_OVACIK_HIGH_SNOW_BOWL",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "17736": Object.freeze({
      stationId: 17736,
      nameTr: "Mazgirt Güney Sırtı (1400 m)",
      lat: 39.018,
      lon: 39.6015,
      demElevationM: 1400,
      subBasinId: "TR62_PERTEK_CEMISGEZEK_KEBAN_TERRACE",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18769": Object.freeze({
      stationId: 18769,
      nameTr: "Pertek Keban Kuzey Yamacı",
      lat: 38.9342,
      lon: 39.1672,
      demElevationM: 1056,
      subBasinId: "TR62_PERTEK_CEMISGEZEK_KEBAN_TERRACE",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.32,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "17768": Object.freeze({
      stationId: 17768,
      nameTr: "Çemişgezek Keban Havzası (898 m)",
      lat: 39.0401,
      lon: 38.9177,
      demElevationM: 898,
      subBasinId: "TR62_PERTEK_CEMISGEZEK_KEBAN_TERRACE",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "19090": Object.freeze({
      stationId: 19090,
      nameTr: "Munzur / Ovacık Yüksek Kar Sırtı",
      lat: 39.425,
      lon: 39.185,
      demElevationM: 2240,
      subBasinId: "TR62_MUNZUR_MERCAN_3462M_WALL",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([915, 1340, 2050, 3150] as const),
    maxPhysicalPeakM: HYPSO_TR_62.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_62.bands
  }),
  waterBodies: Object.freeze([
    Object.freeze({
      id: "TR62_KEBAN_NORTH_PERTEK_ARM",
      labelTr: "Keban Baraj Gölü Kuzey Kolu (Pertek – Çemişgezek Kış Ilımanlığı)",
      kind: "fresh_lake",
      mgmMarineStationIds: Object.freeze([]),
      sampleCoord: Object.freeze({ lat: 38.865, lon: 39.185 }),
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 845,
      freezingPointC: 0.0,
      monthlyWaterTempNormalsC: Object.freeze([
        5.6, 5.2, 7.0, 11.2, 16.2, 21.0, 24.6, 25.2, 22.0, 17.2, 12.0, 7.7
      ] as const),
      subBasinInfluenceWeights: Object.freeze({
        TR62_PERTEK_CEMISGEZEK_KEBAN_TERRACE: 0.78,
        TR62_MUNZUR_PULUMUR_DEEP_GORGE: 0.26,
        TR62_OVACIK_HIGH_SNOW_BOWL: 0.06,
        TR62_MUNZUR_MERCAN_3462M_WALL: 0.04
      }),
      onshoreWindSectorDeg: Object.freeze({ fromDeg: 165, toDeg: 240 }),
      // Strictly < 25 km: freshwater reservoir moderation only, NEVER open-sea DEK!
      effectiveFetchKm: 16,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 22.0,
      dekHeavyDeltaTC: 26.0,
      seaBreezeSpec: Object.freeze({
        activeMonths: Object.freeze([6, 9] as const),
        sectorDeg: Object.freeze({ fromDeg: 175, toDeg: 235 }),
        maxInlandPenetrationKm: 10,
        maxCoolingAmplitudeC: 1.2
      })
    })
  ]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR62_MUNZUR_3462M_SW_OROG_SNOW_WALL",
      labelTr: "Munzur / Mercan Dağları (3462 m) Güneybatı Orografik Kar Duvarı ve Kuzey Fön Kalkanı",
      effectiveBarrierHeightM: 2480,
      crestPressureHpa: 700,
      applicableSubBasins: Object.freeze([
        "TR62_MUNZUR_PULUMUR_DEEP_GORGE",
        "TR62_OVACIK_HIGH_SNOW_BOWL",
        "TR62_MUNZUR_MERCAN_3462M_WALL",
        "TR62_PERTEK_CEMISGEZEK_KEBAN_TERRACE"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 335, toDeg: 40 }),
        minCrossCrestSpeedMs: 8.5,
        minFroudeNumber: 0.38,
        sourcePlateauElevationM: 1850,
        maxTargetElevationM: 1180,
        maxWarmingCapC: 3.8,
        subCloudVirgaFactor: 0.48,
        wetCutoffMmHr: 1.5
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 165, toDeg: 245 }),
        minOnshoreOrUpslopeSpeedMs: 4.0,
        coastalFrictionalConvergenceBoost: 1.35,
        maxPrecipMultiplierCap: 1.82
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 340, toDeg: 35 }),
        precipAttenuationFactor: 0.55
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR62_MUNZUR_PULUMUR_CANYON_DRAINAGE",
      labelTr: "Pülümür – Munzur Derin Vadi Katabatik ve Kanal Akışı",
      centerCoord: Object.freeze({ lat: 39.215, lon: 39.655 }),
      influenceRadiusKm: 13,
      channelAxisFromDeg: 25,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.28,
      gustMultiplier: 1.38,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 915,
    coldPoolMaxDepthM: 425,
    topographicEnclosureIndex: 0.91,
    deltaPressureTopHpa: 48,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 5.6
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.54
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 350, toDeg: 75 }),
      minWindShearVs850Deg: 68
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.46,
    invertedVDryMicroburstSusceptibility: 0.36,
    coastalWaterspoutSusceptibility: 0.0
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "tunceli_center_17165",
      labelTr: "Tunceli Merkez Munzur Vadisi (981 m)",
      lat: 39.1058,
      lon: 39.5408,
      elevationM: 981,
      role: "target"
    }),
    Object.freeze({
      key: "ovacik_snow_bowl_18179",
      labelTr: "Ovacık Yüksek Kar Çanağı (1280 m)",
      lat: 39.3681,
      lon: 39.2419,
      elevationM: 1280,
      role: "lee_shadow"
    }),
    Object.freeze({
      key: "munzur_mercan_crest",
      labelTr: "Munzur / Mercan Alpin Kar Duvarı (3462 m Kuşağı)",
      lat: 39.425,
      lon: 39.185,
      elevationM: 2750,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "pulumur_north_pass",
      labelTr: "Pülümür Kuzeydoğu Geçit Vadisi (1565 m)",
      lat: 39.4844,
      lon: 39.8914,
      elevationM: 1565,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "nazimiye_east_ridge",
      labelTr: "Nazımiye Doğu Sırtı (1602 m)",
      lat: 39.1787,
      lon: 39.8179,
      elevationM: 1602,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "hozat_west_plateau",
      labelTr: "Hozat Batı Yaylası (1485 m)",
      lat: 39.1003,
      lon: 39.2314,
      elevationM: 1485,
      role: "corridor"
    }),
    Object.freeze({
      key: "pertek_sw_moisture_entry",
      labelTr: "Pertek Güneybatı Nem Girişi",
      lat: 38.9342,
      lon: 39.1672,
      elevationM: 1056,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "cemisgezek_west_terrace",
      labelTr: "Çemişgezek Batı Keban Kıyısı (898 m)",
      lat: 39.0401,
      lon: 38.9177,
      elevationM: 898,
      role: "corridor"
    }),
    Object.freeze({
      key: "mazgirt_se_slope",
      labelTr: "Mazgirt Güneydoğu Etek (1400 m)",
      lat: 39.018,
      lon: 39.6015,
      elevationM: 1400,
      role: "corridor"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -33,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 975,
    maxPlausibleMslpHpa: 1050,
    kalmanTempBiasCapC: 7.0
  }),
  inversion: Object.freeze({
    valleyFloorM: 915,
    coldPoolDepthM: 425,
    clearNightInversionLapseCPerKm: 4.9,
    snowpackBoostFactor: 1.6,
    enclosureIndex: 0.91
  })
} satisfies ProvinceEngineSpec);

export const PROVINCE_SPEC_TR_62: ProvinceSpec = SPEC_TR_62_ENGINE;
export default PROVINCE_SPEC_TR_62;
