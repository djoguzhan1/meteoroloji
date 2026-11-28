import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_19 = TR81_CLIMATOLOGY_1991_2020["TR-19"];
const HYPSO_TR_19 = TR81_HYPSOMETRIC_PROFILES["TR-19"];

/**
 * Transition plateau & valley contrast metadata for `TR-19` Çorum (`TIER_A_WMO`, WMO `17084`):
 * Contrasts the warm Osmancık–Kargı Kızılırmak rice trench (`~410–446 m`) against the cold
 * Çorum Merkez–Alaca–Sungurlu steppe frost basin (`771–998 m`, `persistentStratusLock`) and
 * Köse Dağı / Kargı Yaylası (`2,097 m`) highlands.
 */
export const TR_19_TRANSITION_BASIN_META = Object.freeze({
  provinceCode: "TR-19",
  wmoStationId: "17084",
  kizilirmakRiceValleyFloorM: 419,
  steppeFrostBasinElevM: 776,
  kosedagiPeakM: 2097
});

const SPEC_TR_19_ENGINE = Object.freeze({
  provinceCode: "TR-19",
  plateCode: 19,
  slug: "corum",
  nameTr: "Çorum",
  region: "BLACK_SEA_WEST_CENTRAL",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "CENTRAL_ANATOLIA_BASIN",
  icaoWhitelist: Object.freeze([]),
  domainBounds: Object.freeze({
    minLat: 39.88,
    maxLat: 41.28,
    minLon: 34.04,
    maxLon: 35.56
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 91901,
    mgmIstNo: 17084,
    mgmSaatlikIstNo: 17084,
    mgmGunlukIstNo: 91901,
    wmoId: "17084",
    lat: 40.5461,
    lon: 34.9362,
    demVerifiedElevationM: 776,
    subBasinId: "corum_alaca_sungurlu_frost_steppe",
    urbanFraction: 0.58,
    monthlyTmaxNormalsC: CLIM_TR_19.tmaxC,
    monthlyTminNormalsC: CLIM_TR_19.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-19-osmancik-kargi-kizilirmak",
      name: "Osmancık – Kargı Kızılırmak Pirinç Vadisi (~419m)",
      role: "coast",
      lat: 40.9792,
      lon: 34.8008,
      elevationM: 419
    }),
    Object.freeze({
      id: "tr-19-corum-alaca-sungurlu-canak",
      name: "Çorum Merkez – Alaca – Sungurlu Bozkır Çanağı",
      role: "plain",
      lat: 40.5461,
      lon: 34.9362,
      elevationM: 776
    }),
    Object.freeze({
      id: "tr-19-iskilip-kargi-yayla-yamac",
      name: "İskilip – Kargı Orman & Plato Yamacı",
      role: "foothill",
      lat: 40.7238,
      lon: 34.4806,
      elevationM: 1280
    }),
    Object.freeze({
      id: "tr-19-kosedagi-akkaya-zirve",
      name: "Köse Dağı (2097m) & Kargı Akkaya Yaylası",
      role: "summit",
      lat: 41.1974,
      lon: 34.6391,
      elevationM: 1880
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "corum_alaca_sungurlu_frost_steppe",
      labelTr: "Çorum Merkez – Alaca – Sungurlu – Boğazkale Bozkır Ayaz Çanağı",
      polygonOrBbox: Object.freeze({
        minLat: 39.9,
        maxLat: 40.66,
        minLon: 34.18,
        maxLon: 35.52
      }),
      elevationRangeM: Object.freeze([650, 1080] as const),
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.42
    }),
    Object.freeze({
      id: "osmancik_kargi_kizilirmak_trench",
      labelTr: "Osmancık – Kargı – Oğuzlar Kızılırmak Ilıman Pirinç Oluğu (~410m)",
      polygonOrBbox: Object.freeze({
        minLat: 40.72,
        maxLat: 41.18,
        minLon: 34.4,
        maxLon: 35.06
      }),
      elevationRangeM: Object.freeze([380, 720] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.34
    }),
    Object.freeze({
      id: "iskilip_bayat_foothill",
      labelTr: "İskilip – Bayat – Laçin Geçiş Yamaçları",
      polygonOrBbox: Object.freeze({
        minLat: 40.58,
        maxLat: 40.92,
        minLon: 34.06,
        maxLon: 34.88
      }),
      elevationRangeM: Object.freeze([680, 1180] as const),
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.24
    }),
    Object.freeze({
      id: "kosedagi_kargi_alpine",
      labelTr: "Köse Dağı (2097m) – Kargı Akkaya Yaylası Yüksek Kar Kuşağı",
      polygonOrBbox: Object.freeze({
        minLat: 40.82,
        maxLat: 41.27,
        minLon: 34.32,
        maxLon: 35.14
      }),
      elevationRangeM: Object.freeze([1180, 2097] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.03
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    corum_alaca_sungurlu_frost_steppe: Object.freeze({
      corum_alaca_sungurlu_frost_steppe: 1.0,
      osmancik_kargi_kizilirmak_trench: 0.26,
      iskilip_bayat_foothill: 0.56,
      kosedagi_kargi_alpine: 0.22
    }),
    osmancik_kargi_kizilirmak_trench: Object.freeze({
      corum_alaca_sungurlu_frost_steppe: 0.26,
      osmancik_kargi_kizilirmak_trench: 1.0,
      iskilip_bayat_foothill: 0.52,
      kosedagi_kargi_alpine: 0.42
    }),
    iskilip_bayat_foothill: Object.freeze({
      corum_alaca_sungurlu_frost_steppe: 0.56,
      osmancik_kargi_kizilirmak_trench: 0.52,
      iskilip_bayat_foothill: 1.0,
      kosedagi_kargi_alpine: 0.48
    }),
    kosedagi_kargi_alpine: Object.freeze({
      corum_alaca_sungurlu_frost_steppe: 0.22,
      osmancik_kargi_kizilirmak_trench: 0.42,
      iskilip_bayat_foothill: 0.48,
      kosedagi_kargi_alpine: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17084": Object.freeze({
      stationId: 17084,
      nameTr: "Çorum Merkez (WMO 17084)",
      lat: 40.546,
      lon: 34.9363,
      demElevationM: 776,
      subBasinId: "corum_alaca_sungurlu_frost_steppe",
      urbanFraction: 0.58,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "basin_floor"
    }),
    "18124": Object.freeze({
      stationId: 18124,
      nameTr: "Alaca Bozkır Ayaz Çanağı",
      lat: 40.1614,
      lon: 34.8394,
      demElevationM: 941,
      subBasinId: "corum_alaca_sungurlu_frost_steppe",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18127": Object.freeze({
      stationId: 18127,
      nameTr: "Sungurlu Budaközü Çanağı",
      lat: 40.1723,
      lon: 34.4015,
      demElevationM: 771,
      subBasinId: "corum_alaca_sungurlu_frost_steppe",
      urbanFraction: 0.4,
      coldPoolSusceptibility: 0.8,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18508": Object.freeze({
      stationId: 18508,
      nameTr: "Boğazkale (Hattuşa Yüksek Bozkır)",
      lat: 40.0242,
      lon: 34.6065,
      demElevationM: 998,
      subBasinId: "corum_alaca_sungurlu_frost_steppe",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "17652": Object.freeze({
      stationId: 17652,
      nameTr: "Osmancık (Kızılırmak Pirinç Vadisi 419m)",
      lat: 40.9792,
      lon: 34.8008,
      demElevationM: 419,
      subBasinId: "osmancik_kargi_kizilirmak_trench",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "18510": Object.freeze({
      stationId: 18510,
      nameTr: "Kargı (Kızılırmak Ilıman Oluk 446m)",
      lat: 41.1386,
      lon: 34.4783,
      demElevationM: 446,
      subBasinId: "osmancik_kargi_kizilirmak_trench",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "18128": Object.freeze({
      stationId: 18128,
      nameTr: "İskilip",
      lat: 40.7238,
      lon: 34.4806,
      demElevationM: 725,
      subBasinId: "iskilip_bayat_foothill",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18703": Object.freeze({
      stationId: 18703,
      nameTr: "Alaca / Karnıkara Yüksek Plato",
      lat: 40.0303,
      lon: 35.0389,
      demElevationM: 1220,
      subBasinId: "kosedagi_kargi_alpine",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.32,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18700": Object.freeze({
      stationId: 18700,
      nameTr: "Kargı / Akkaya Yaylası (1530m)",
      lat: 41.1974,
      lon: 34.6391,
      demElevationM: 1530,
      subBasinId: "kosedagi_kargi_alpine",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([420, 776, 1280, 1880] as const),
    maxPhysicalPeakM: HYPSO_TR_19.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_19.bands
  }),
  waterBodies: Object.freeze([]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "kosedagi_ilgaz_alpine_upslope",
      labelTr: "Ilgaz – Köse Dağı (2097m) & Kargı Yaylası Kuzeyli Kar Duvarı",
      effectiveBarrierHeightM: 2097,
      crestPressureHpa: 800,
      applicableSubBasins: Object.freeze([
        "kosedagi_kargi_alpine",
        "iskilip_bayat_foothill"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 175, toDeg: 225 }),
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.4,
        sourcePlateauElevationM: 1020,
        maxTargetElevationM: 900,
        maxWarmingCapC: 3.2,
        subCloudVirgaFactor: 0.76,
        wetCutoffMmHr: 1.6
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 320, toDeg: 35 }),
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.12,
        maxPrecipMultiplierCap: 1.62
      })
    }),
    Object.freeze({
      id: "ilgaz_kure_lee_kizilirmak_steppe_shadow",
      labelTr: "Ilgaz & Küre Güney Gölgesi — Osmancık Kızılırmak Oluk Fönü & Çorum Bozkır Yağış Gölgesi",
      effectiveBarrierHeightM: 2097,
      crestPressureHpa: 800,
      applicableSubBasins: Object.freeze([
        "osmancik_kargi_kizilirmak_trench",
        "corum_alaca_sungurlu_frost_steppe"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 330, toDeg: 35 }),
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.38,
        sourcePlateauElevationM: 1150,
        maxTargetElevationM: 600,
        maxWarmingCapC: 3.8,
        subCloudVirgaFactor: 0.68,
        wetCutoffMmHr: 1.5
      }),
      upslopeSpec: Object.freeze({
        enabled: false,
        windFromSectorDeg: Object.freeze({ fromDeg: 175, toDeg: 225 }),
        minOnshoreOrUpslopeSpeedMs: 8.0,
        coastalFrictionalConvergenceBoost: 1.0,
        maxPrecipMultiplierCap: 1.18
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 330, toDeg: 40 }),
        precipAttenuationFactor: 0.58
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "kirkdilim_kizilirmak_gorge_corridor",
      labelTr: "Kırkdilim – Laçin – Osmancık Kızılırmak Boğaz Kanalı",
      centerCoord: Object.freeze({ lat: 40.86, lon: 34.84 }),
      influenceRadiusKm: 18,
      channelAxisFromDeg: 15,
      bidirectional: true,
      sectorHalfWidthDeg: 20,
      speedMultiplier: 1.24,
      gustMultiplier: 1.36,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 771,
    coldPoolMaxDepthM: 360,
    topographicEnclosureIndex: 0.82,
    deltaPressureTopHpa: 44,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 4.6
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.62
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 340, toDeg: 55 }),
      minWindShearVs850Deg: 50
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.46,
    invertedVDryMicroburstSusceptibility: 0.52,
    coastalWaterspoutSusceptibility: 0.0
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "target_corum_basin",
      labelTr: "Çorum Merkez Bozkır Çanağı (WMO 17084)",
      lat: 40.5461,
      lon: 34.9362,
      elevationM: 776,
      role: "target"
    }),
    Object.freeze({
      key: "osmancik_kizilirmak_trench",
      labelTr: "Osmancık Kızılırmak Ilıman Vadisi (419m)",
      lat: 40.9792,
      lon: 34.8008,
      elevationM: 419,
      role: "corridor"
    }),
    Object.freeze({
      key: "kargi_valley_floor",
      labelTr: "Kargı Çeltik Oluğu (446m)",
      lat: 41.1386,
      lon: 34.4783,
      elevationM: 446,
      role: "lee_shadow"
    }),
    Object.freeze({
      key: "kargi_akkaya_crest",
      labelTr: "Kargı Akkaya / Köse Dağı Kuzey Sırtı (1530m)",
      lat: 41.1974,
      lon: 34.6391,
      elevationM: 1530,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "iskilip_west_slope",
      labelTr: "İskilip Batı Dağ Eteği",
      lat: 40.7238,
      lon: 34.4806,
      elevationM: 725,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "lacin_kirkdilim_pass",
      labelTr: "Laçin – Kırkdilim Geçidi",
      lat: 40.7747,
      lon: 34.8738,
      elevationM: 750,
      role: "corridor"
    }),
    Object.freeze({
      key: "alaca_frost_hollow",
      labelTr: "Alaca Güney Bozkır Ayaz Çanağı (941m)",
      lat: 40.1614,
      lon: 34.8394,
      elevationM: 941,
      role: "lee_shadow"
    }),
    Object.freeze({
      key: "sungurlu_sw_steppe",
      labelTr: "Sungurlu Güneybatı İç Anadolu Girişi",
      lat: 40.1723,
      lon: 34.4015,
      elevationM: 771,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "bogazkale_south_plateau",
      labelTr: "Boğazkale Güney Yüksek Platosu (998m)",
      lat: 40.0242,
      lon: 34.6065,
      elevationM: 998,
      role: "foehn_windward"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -28,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 974,
    maxPlausibleMslpHpa: 1054,
    kalmanTempBiasCapC: 5.8
  }),
  inversion: Object.freeze({
    valleyFloorM: 771,
    coldPoolDepthM: 360,
    clearNightInversionLapseCPerKm: 8.4,
    snowpackBoostFactor: 1.45,
    enclosureIndex: 0.82
  })
} satisfies ProvinceEngineSpec);

export const PROVINCE_SPEC_TR_19: ProvinceSpec = SPEC_TR_19_ENGINE;
export default PROVINCE_SPEC_TR_19;
