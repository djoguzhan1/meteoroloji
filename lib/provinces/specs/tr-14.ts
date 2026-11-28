import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";
import type { ProvinceSpec } from "../types";

const CLIM_TR_14 = TR81_CLIMATOLOGY_1991_2020["TR-14"];
const HYPSO_TR_14 = TR81_HYPSOMETRIC_PROFILES["TR-14"];

export const TR_14_SNOW_BASIN_META = Object.freeze({
  provinceCode: "TR-14",
  wmoStationId: "17070",
  meteostatStationId: "17070",
  valleyFloorM: 742,
  geredeHighwayPassM: 1300,
  kartalkayaSummitM: 2400,
  snowpackBoostFactor: 1.5,
  kalmanTempBiasCapC: 7.5
});

/**
 * Wave 3A (REG-08) — `TR-14` Bolu Bespoke Physical & Microclimatic Specification:
 *  - High Snow-Trapping Mountain Bowl (`742–743 m` Bolu Merkez `WMO 17070`) & Köroğlu / Kartalkaya
 *    (`2052–2400 m` alpine snowpack): Residual Black Sea moisture spills across Bolu Dağı & Yedigöller,
 *    depositing deep snow cover that triggers severe snow-albedo nocturnal radiative frost (`-24..-30°C`,
 *    `snowpackBoostFactor: 1.5`, `kalmanTempBiasCapC: 7.5`).
 *  - Gerede – Yeniçağa – Dörtdivan (`1083–1300 m`) Highway Frost & Blizzard Gorge: One of Türkiye's coldest
 *    wind-swept mountain passes (Cankurtaran / Arkut Dağı `1605 m`) contrasted against milder sheltered
 *    southwestern/northern valleys (Mudurnu `785 m`, Göynük `735 m`, Seben `757 m`, Mengen `636 m`).
 *  - Strict Inland Isolation: `waterBodies: []`, `icaoWhitelist: []`, `calibrationTier: "TIER_A_WMO"`.
 */
const SPEC_TR_14_ENGINE = Object.freeze({
  provinceCode: "TR-14",
  plateCode: 14,
  slug: "bolu",
  nameTr: "Bolu",
  region: "BLACK_SEA_WEST_CENTRAL",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "INLAND_PASS_PLATEAU",
  icaoWhitelist: Object.freeze([]),
  domainBounds: Object.freeze({
    minLat: 40.09,
    maxLat: 41.05,
    minLon: 30.56,
    maxLon: 32.6
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 91401,
    mgmIstNo: 17070,
    mgmSaatlikIstNo: 17070,
    mgmGunlukIstNo: 91401,
    wmoId: "17070",
    lat: 40.7329,
    lon: 31.6022,
    demVerifiedElevationM: 743,
    subBasinId: "TR14_BOLU_OVA_SNOW_BOWL",
    urbanFraction: 0.62,
    monthlyTmaxNormalsC: CLIM_TR_14.tmaxC,
    monthlyTminNormalsC: CLIM_TR_14.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-14-mengen",
      name: "Mengen / Göynük Ilıman Alt Vadi",
      role: "plain",
      lat: 40.9461,
      lon: 32.0736,
      elevationM: 636
    }),
    Object.freeze({
      id: "tr-14-merkez",
      name: "Bolu Merkez (Kar Çanağı Ova · 742 m)",
      role: "plain",
      lat: 40.7329,
      lon: 31.6022,
      elevationM: 743
    }),
    Object.freeze({
      id: "tr-14-gerede",
      name: "Gerede / Yeniçağa Soğuk Otoyol Boğazı (1300 m)",
      role: "foothill",
      lat: 40.8046,
      lon: 32.2176,
      elevationM: 1270
    }),
    Object.freeze({
      id: "tr-14-kartalkaya",
      name: "Kartalkaya Kayak Merkezi / Köroğlu Zirve",
      role: "summit",
      lat: 40.5922,
      lon: 31.8039,
      elevationM: 2052
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR14_BOLU_OVA_SNOW_BOWL",
      labelTr: "Bolu Merkez – Karacasu Yüksek Kar ve Ayaz Çanağı (742 m)",
      polygonOrBbox: Object.freeze({
        minLat: 40.66,
        maxLat: 40.82,
        minLon: 31.44,
        maxLon: 31.82
      }),
      elevationRangeM: Object.freeze([690, 960] as const),
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.56
    }),
    Object.freeze({
      id: "TR14_GEREDE_YENICAGA_FROST_CORRIDOR",
      labelTr: "Gerede (1300 m) – Yeniçağa – Dörtdivan – Arkut Dağı Ayaz ve Tipi Koridoru",
      polygonOrBbox: Object.freeze({
        minLat: 40.58,
        maxLat: 40.9,
        minLon: 31.92,
        maxLon: 32.58
      }),
      elevationRangeM: Object.freeze([980, 1680] as const),
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.24
    }),
    Object.freeze({
      id: "TR14_ABANT_YEDIGOLLER_PINE_BELT",
      labelTr: "Abant – Bolu Dağı – Gölcük – Yedigöller Karadeniz Nem Eşiği",
      polygonOrBbox: Object.freeze({
        minLat: 40.56,
        maxLat: 40.98,
        minLon: 31.22,
        maxLon: 31.9
      }),
      elevationRangeM: Object.freeze([880, 1650] as const),
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.08
    }),
    Object.freeze({
      id: "TR14_MUDURNU_GOYNUK_MENGEN_VALLEYS",
      labelTr: "Mudurnu – Göynük – Seben – Mengen Korunaklı Ilıman Vadiler",
      polygonOrBbox: Object.freeze({
        minLat: 40.12,
        maxLat: 41.02,
        minLon: 30.58,
        maxLon: 32.16
      }),
      elevationRangeM: Object.freeze([420, 880] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.26
    }),
    Object.freeze({
      id: "TR14_KARTALKAYA_KOROGLU_ALPINE",
      labelTr: "Kartalkaya – Köroğlu Dağları – Kıbrıscık Alpin Kar Kuşağı (2000–2400 m)",
      polygonOrBbox: Object.freeze({
        minLat: 40.34,
        maxLat: 40.66,
        minLon: 31.68,
        maxLon: 32.12
      }),
      elevationRangeM: Object.freeze([1450, 2400] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.03
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR14_BOLU_OVA_SNOW_BOWL: Object.freeze({
      TR14_BOLU_OVA_SNOW_BOWL: 1.0,
      TR14_GEREDE_YENICAGA_FROST_CORRIDOR: 0.44,
      TR14_ABANT_YEDIGOLLER_PINE_BELT: 0.48,
      TR14_MUDURNU_GOYNUK_MENGEN_VALLEYS: 0.34,
      TR14_KARTALKAYA_KOROGLU_ALPINE: 0.24
    }),
    TR14_GEREDE_YENICAGA_FROST_CORRIDOR: Object.freeze({
      TR14_BOLU_OVA_SNOW_BOWL: 0.44,
      TR14_GEREDE_YENICAGA_FROST_CORRIDOR: 1.0,
      TR14_ABANT_YEDIGOLLER_PINE_BELT: 0.38,
      TR14_MUDURNU_GOYNUK_MENGEN_VALLEYS: 0.26,
      TR14_KARTALKAYA_KOROGLU_ALPINE: 0.42
    }),
    TR14_ABANT_YEDIGOLLER_PINE_BELT: Object.freeze({
      TR14_BOLU_OVA_SNOW_BOWL: 0.48,
      TR14_GEREDE_YENICAGA_FROST_CORRIDOR: 0.38,
      TR14_ABANT_YEDIGOLLER_PINE_BELT: 1.0,
      TR14_MUDURNU_GOYNUK_MENGEN_VALLEYS: 0.36,
      TR14_KARTALKAYA_KOROGLU_ALPINE: 0.52
    }),
    TR14_MUDURNU_GOYNUK_MENGEN_VALLEYS: Object.freeze({
      TR14_BOLU_OVA_SNOW_BOWL: 0.34,
      TR14_GEREDE_YENICAGA_FROST_CORRIDOR: 0.26,
      TR14_ABANT_YEDIGOLLER_PINE_BELT: 0.36,
      TR14_MUDURNU_GOYNUK_MENGEN_VALLEYS: 1.0,
      TR14_KARTALKAYA_KOROGLU_ALPINE: 0.2
    }),
    TR14_KARTALKAYA_KOROGLU_ALPINE: Object.freeze({
      TR14_BOLU_OVA_SNOW_BOWL: 0.24,
      TR14_GEREDE_YENICAGA_FROST_CORRIDOR: 0.42,
      TR14_ABANT_YEDIGOLLER_PINE_BELT: 0.52,
      TR14_MUDURNU_GOYNUK_MENGEN_VALLEYS: 0.2,
      TR14_KARTALKAYA_KOROGLU_ALPINE: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17070": Object.freeze({
      stationId: 17070,
      nameTr: "Bolu Merkez (WMO 17070 · 743 m)",
      lat: 40.7329,
      lon: 31.6022,
      demElevationM: 743,
      subBasinId: "TR14_BOLU_OVA_SNOW_BOWL",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor"
    }),
    "17642": Object.freeze({
      stationId: 17642,
      nameTr: "Gerede / Arkut Dağı Soğuk Geçit",
      lat: 40.8046,
      lon: 32.2176,
      demElevationM: 1298,
      subBasinId: "TR14_GEREDE_YENICAGA_FROST_CORRIDOR",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18248": Object.freeze({
      stationId: 18248,
      nameTr: "Yeniçağa Gölü Ayaz Çanağı",
      lat: 40.7692,
      lon: 32.0492,
      demElevationM: 1083,
      subBasinId: "TR14_GEREDE_YENICAGA_FROST_CORRIDOR",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "19208": Object.freeze({
      stationId: 19208,
      nameTr: "Dörtdivan Yüksek Ova",
      lat: 40.6522,
      lon: 31.9883,
      demElevationM: 1265,
      subBasinId: "TR14_GEREDE_YENICAGA_FROST_CORRIDOR",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.92,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "17637": Object.freeze({
      stationId: 17637,
      nameTr: "Bolu Dağı Sırtı",
      lat: 40.752,
      lon: 31.428,
      demElevationM: 950,
      subBasinId: "TR14_ABANT_YEDIGOLLER_PINE_BELT",
      urbanFraction: 0.1,
      coldPoolSusceptibility: 0.24,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18693": Object.freeze({
      stationId: 18693,
      nameTr: "Abant Gölü Milli Parkı",
      lat: 40.606,
      lon: 31.278,
      demElevationM: 1350,
      subBasinId: "TR14_ABANT_YEDIGOLLER_PINE_BELT",
      urbanFraction: 0.05,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18174": Object.freeze({
      stationId: 18174,
      nameTr: "Kartalkaya Kayak Merkezi (2052 m)",
      lat: 40.5922,
      lon: 31.8039,
      demElevationM: 2052,
      subBasinId: "TR14_KARTALKAYA_KOROGLU_ALPINE",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }),
    "17694": Object.freeze({
      stationId: 17694,
      nameTr: "Kıbrıscık Köroğlu Güney Plato",
      lat: 40.4167,
      lon: 31.85,
      demElevationM: 1191,
      subBasinId: "TR14_KARTALKAYA_KOROGLU_ALPINE",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18247": Object.freeze({
      stationId: 18247,
      nameTr: "Mengen Alt Vadi",
      lat: 40.9461,
      lon: 32.0736,
      demElevationM: 636,
      subBasinId: "TR14_MUDURNU_GOYNUK_MENGEN_VALLEYS",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "18158": Object.freeze({
      stationId: 18158,
      nameTr: "Mudurnu Korunaklı Vadi",
      lat: 40.4978,
      lon: 31.2044,
      demElevationM: 785,
      subBasinId: "TR14_MUDURNU_GOYNUK_MENGEN_VALLEYS",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "18246": Object.freeze({
      stationId: 18246,
      nameTr: "Göynük Güneybatı Vadi",
      lat: 40.3933,
      lon: 30.7786,
      demElevationM: 735,
      subBasinId: "TR14_MUDURNU_GOYNUK_MENGEN_VALLEYS",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "17693": Object.freeze({
      stationId: 17693,
      nameTr: "Seben Vadi Havzası",
      lat: 40.4088,
      lon: 31.573,
      demElevationM: 757,
      subBasinId: "TR14_MUDURNU_GOYNUK_MENGEN_VALLEYS",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.6,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([742, 1122, 1650, 2320] as const),
    maxPhysicalPeakM: HYPSO_TR_14.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_14.bands
  }),
  waterBodies: Object.freeze([]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR14_BOLUDAGI_YEDIGOLLER_SNOW_SPILLOVER",
      labelTr: "Bolu Dağı – Yedigöller – Abant Karadeniz Nem Taşma ve Kar Duvarı",
      effectiveBarrierHeightM: 1750,
      crestPressureHpa: 800,
      applicableSubBasins: Object.freeze([
        "TR14_BOLU_OVA_SNOW_BOWL",
        "TR14_ABANT_YEDIGOLLER_PINE_BELT",
        "TR14_GEREDE_YENICAGA_FROST_CORRIDOR",
        "TR14_KARTALKAYA_KOROGLU_ALPINE"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 175, toDeg: 235 }),
        minCrossCrestSpeedMs: 8.0,
        minFroudeNumber: 0.44,
        sourcePlateauElevationM: 1350,
        maxTargetElevationM: 920,
        maxWarmingCapC: 3.6,
        subCloudVirgaFactor: 0.45,
        wetCutoffMmHr: 1.6
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 300, toDeg: 40 }),
        minOnshoreOrUpslopeSpeedMs: 4.5,
        coastalFrictionalConvergenceBoost: 1.26,
        maxPrecipMultiplierCap: 1.56
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 165, toDeg: 225 }),
        precipAttenuationFactor: 0.68
      })
    }),
    Object.freeze({
      id: "TR14_KOROGLU_SOUTH_LEE_SHADOW",
      labelTr: "Köroğlu Masifi (2400 m) Seben – Göynük Yağış Gölgesi",
      effectiveBarrierHeightM: 2150,
      crestPressureHpa: 750,
      applicableSubBasins: Object.freeze(["TR14_MUDURNU_GOYNUK_MENGEN_VALLEYS"]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 340, toDeg: 45 }),
        minCrossCrestSpeedMs: 8.5,
        minFroudeNumber: 0.45,
        sourcePlateauElevationM: 1280,
        maxTargetElevationM: 820,
        maxWarmingCapC: 2.8,
        subCloudVirgaFactor: 0.4,
        wetCutoffMmHr: 1.8
      }),
      upslopeSpec: Object.freeze({
        enabled: false,
        windFromSectorDeg: Object.freeze({ fromDeg: 220, toDeg: 280 }),
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 1.0,
        maxPrecipMultiplierCap: 1.15
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 330, toDeg: 45 }),
        precipAttenuationFactor: 0.64
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR14_GEREDE_CANKURTARAN_HIGHWAY_GAP",
      labelTr: "Gerede – Yeniçağa – Cankurtaran (1300 m) Tipi ve Rüzgâr Boğazı",
      centerCoord: Object.freeze({ lat: 40.8046, lon: 32.2176 }),
      influenceRadiusKm: 14,
      channelAxisFromDeg: 280,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.32,
      gustMultiplier: 1.44,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 742,
    coldPoolMaxDepthM: 380,
    topographicEnclosureIndex: 0.9,
    deltaPressureTopHpa: 44,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 5.2
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.52
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 320, toDeg: 65 }),
      minWindShearVs850Deg: 68
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.24,
    invertedVDryMicroburstSusceptibility: 0.22,
    coastalWaterspoutSusceptibility: 0.0
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "bolu_center_17070",
      labelTr: "Bolu Merkez Kar Çanağı (743 m)",
      lat: 40.7329,
      lon: 31.6022,
      elevationM: 743,
      role: "target"
    }),
    Object.freeze({
      key: "yedigoller_north_spillover",
      labelTr: "Yedigöller Kuzey Nem Girişi",
      lat: 40.942,
      lon: 31.745,
      elevationM: 1180,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "boludagi_west_saddle",
      labelTr: "Bolu Dağı Batı Eşiği",
      lat: 40.752,
      lon: 31.428,
      elevationM: 950,
      role: "corridor"
    }),
    Object.freeze({
      key: "abant_pine_plateau",
      labelTr: "Abant Çam ve Kar Kuşağı",
      lat: 40.606,
      lon: 31.278,
      elevationM: 1350,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "kartalkaya_koroglu_summit",
      labelTr: "Kartalkaya / Köroğlu Zirve (2052 m)",
      lat: 40.5922,
      lon: 31.8039,
      elevationM: 2052,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "gerede_cankurtaran_pass",
      labelTr: "Gerede – Cankurtaran Geçidi (1300 m)",
      lat: 40.8046,
      lon: 32.2176,
      elevationM: 1298,
      role: "corridor"
    }),
    Object.freeze({
      key: "yenicaga_dortdivan_frost_hollow",
      labelTr: "Yeniçağa – Dörtdivan Ayaz Çukuru",
      lat: 40.715,
      lon: 32.025,
      elevationM: 1140,
      role: "lee_shadow"
    }),
    Object.freeze({
      key: "mengen_lower_valley",
      labelTr: "Mengen Ilıman Alt Vadi",
      lat: 40.9461,
      lon: 32.0736,
      elevationM: 636,
      role: "corridor"
    }),
    Object.freeze({
      key: "mudurnu_goynuk_sw_windward",
      labelTr: "Mudurnu – Göynük Güneybatı Vadi",
      lat: 40.4978,
      lon: 31.2044,
      elevationM: 785,
      role: "foehn_windward"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -34,
    maxPlausibleTempC: 41,
    minPlausibleMslpHpa: 976,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 7.5
  }),
  inversion: Object.freeze({
    valleyFloorM: 742,
    coldPoolDepthM: 380,
    clearNightInversionLapseCPerKm: 4.6,
    snowpackBoostFactor: 1.5,
    enclosureIndex: 0.9
  })
} satisfies ProvinceEngineSpec);

export const PROVINCE_SPEC_TR_14: ProvinceSpec = SPEC_TR_14_ENGINE;
export default PROVINCE_SPEC_TR_14;
