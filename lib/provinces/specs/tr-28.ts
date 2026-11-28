import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_28 = TR81_CLIMATOLOGY_1991_2020["TR-28"];
const HYPSO_TR_28 = TR81_HYPSOMETRIC_PROFILES["TR-28"];

/**
 * ATMOS v5.0 — Wave 3B (REG-11) Bespoke Microclimate Spec: `TR-28` Giresun
 *
 * Key Physical & Synoptic Mechanisms:
 *  1. Giresun Mountains (Abdal Musa / Karagöl 3,095–3,331 m, Kümbet & Bektaş Yaylası) Steep Coastal Wall:
 *     Generates intense NW/N Black Sea frictional convergence, extreme orographic rain/flooding, and
 *     winter DEK snow above 400–800 m (`maxPrecipMultiplierCap: 1.88`).
 *  2. Severe Southerly Black Sea Foehn ("Kıble / Lodos Fönü"):
 *     Air from the 1,350–1,500 m Kelkit plateau crossing the 2,200 m Eğribel crest plunges down the
 *     Aksu & Harşit valleys to sea level with dry-adiabatic compression (`maxWarmingCapC: 4.6°C`).
 *  3. Sharp Eğribel Pass (2,200 m) Continental Decoupling:
 *     Şebinkarahisar (1,364 m), Alucra (1,477 m), and Çamoluk (1,037 m) sit in the rain-shadowed
 *     Kelkit trough (`0.06` barrier coupling vs Giresun coast; `0.48` NW precipitation shadow).
 *  4. Strict METAR Whitelist: `icaoWhitelist: []` (aligned with `lib/metar-verify.ts` — Ordu-Giresun
 *     `LTCB` runway physically sits in Gülyalı/Ordu `TR-52`, and `LTCG` sits in Trabzon `TR-61`).
 */
export const PROVINCE_SPEC_TR_28: ProvinceSpec = Object.freeze({
  provinceCode: "TR-28",
  plateCode: 28,
  slug: "giresun",
  nameTr: "Giresun",
  region: "BLACK_SEA_EAST",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "EAST_BLACK_SEA_STEEP_OROG",
  icaoWhitelist: Object.freeze([]),
  domainBounds: Object.freeze({
    minLat: 40.04,
    maxLat: 41.12,
    minLon: 38.08,
    maxLon: 39.22
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 92801,
    mgmIstNo: 17034,
    mgmSaatlikIstNo: 17034,
    mgmGunlukIstNo: 92801,
    wmoId: "17034",
    lat: 40.9227,
    lon: 38.3878,
    demVerifiedElevationM: 38,
    subBasinId: "TR28_GIRESUN_COASTAL_STRIP",
    urbanFraction: 0.68,
    monthlyTmaxNormalsC: CLIM_TR_28.tmaxC,
    monthlyTminNormalsC: CLIM_TR_28.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-28-giresun-sahil",
      name: "Giresun Sahil / Tirebolu Kıyısı",
      role: "coast",
      lat: 40.9227,
      lon: 38.3878,
      elevationM: 12
    }),
    Object.freeze({
      id: "tr-28-sebinkarahisar-kelkit",
      name: "Şebinkarahisar – Alucra Kelkit Havzası",
      role: "plain",
      lat: 40.2872,
      lon: 38.4193,
      elevationM: 1364
    }),
    Object.freeze({
      id: "tr-28-dereli-kulakkaya",
      name: "Dereli – Kulakkaya Kuzey Yamaç",
      role: "foothill",
      lat: 40.695,
      lon: 38.395,
      elevationM: 1250
    }),
    Object.freeze({
      id: "tr-28-kumbet-egribel-zirve",
      name: "Kümbet / Eğribel – Karagöl Zirve Kuşağı",
      role: "summit",
      lat: 40.558,
      lon: 38.435,
      elevationM: 2250
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR28_GIRESUN_COASTAL_STRIP",
      labelTr: "Piraziz – Giresun Merkez – Tirebolu – Görele Dar Karadeniz Kıyısı",
      polygonOrBbox: Object.freeze({
        minLat: 40.89,
        maxLat: 41.12,
        minLon: 38.08,
        maxLon: 39.18
      }),
      elevationRangeM: Object.freeze([0, 180] as const),
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.56
    }),
    Object.freeze({
      id: "TR28_AKSU_HARSIT_WINDWARD_SLOPE",
      labelTr: "Dereli – Yağlıdere – Doğankent Kuzey Orografik Yamaç Vadileri",
      polygonOrBbox: Object.freeze({
        minLat: 40.64,
        maxLat: 40.96,
        minLon: 38.18,
        maxLon: 39.18
      }),
      elevationRangeM: Object.freeze([180, 1350] as const),
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.2
    }),
    Object.freeze({
      id: "TR28_KUMBET_EGRIBEL_ALPINE_WALL",
      labelTr: "Giresun Dağları (Kümbet – Bektaş – Eğribel 2200 m – Abdal Musa 3095 m)",
      polygonOrBbox: Object.freeze({
        minLat: 40.44,
        maxLat: 40.72,
        minLon: 38.15,
        maxLon: 39.12
      }),
      elevationRangeM: Object.freeze([1350, 3331] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.04
    }),
    Object.freeze({
      id: "TR28_KELKIT_SEBINKARAHISAR_INTERIOR",
      labelTr: "Şebinkarahisar – Alucra – Çamoluk İç Karasal Kelkit Havzası",
      polygonOrBbox: Object.freeze({
        minLat: 40.04,
        maxLat: 40.48,
        minLon: 38.22,
        maxLon: 39.02
      }),
      elevationRangeM: Object.freeze([950, 1750] as const),
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.24
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR28_GIRESUN_COASTAL_STRIP: Object.freeze({
      TR28_GIRESUN_COASTAL_STRIP: 1.0,
      TR28_AKSU_HARSIT_WINDWARD_SLOPE: 0.56,
      TR28_KUMBET_EGRIBEL_ALPINE_WALL: 0.18,
      TR28_KELKIT_SEBINKARAHISAR_INTERIOR: 0.06
    }),
    TR28_AKSU_HARSIT_WINDWARD_SLOPE: Object.freeze({
      TR28_GIRESUN_COASTAL_STRIP: 0.56,
      TR28_AKSU_HARSIT_WINDWARD_SLOPE: 1.0,
      TR28_KUMBET_EGRIBEL_ALPINE_WALL: 0.44,
      TR28_KELKIT_SEBINKARAHISAR_INTERIOR: 0.1
    }),
    TR28_KUMBET_EGRIBEL_ALPINE_WALL: Object.freeze({
      TR28_GIRESUN_COASTAL_STRIP: 0.18,
      TR28_AKSU_HARSIT_WINDWARD_SLOPE: 0.44,
      TR28_KUMBET_EGRIBEL_ALPINE_WALL: 1.0,
      TR28_KELKIT_SEBINKARAHISAR_INTERIOR: 0.28
    }),
    TR28_KELKIT_SEBINKARAHISAR_INTERIOR: Object.freeze({
      TR28_GIRESUN_COASTAL_STRIP: 0.06,
      TR28_AKSU_HARSIT_WINDWARD_SLOPE: 0.1,
      TR28_KUMBET_EGRIBEL_ALPINE_WALL: 0.28,
      TR28_KELKIT_SEBINKARAHISAR_INTERIOR: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17034": Object.freeze({
      stationId: 17034,
      nameTr: "Giresun Merkez (WMO 17034)",
      lat: 40.9227,
      lon: 38.3878,
      demElevationM: 38,
      subBasinId: "TR28_GIRESUN_COASTAL_STRIP",
      urbanFraction: 0.68,
      coldPoolSusceptibility: 0.06,
      verticalStratumRole: "basin_floor"
    }),
    "17462": Object.freeze({
      stationId: 17462,
      nameTr: "Piraziz Kıyı",
      lat: 40.9539,
      lon: 38.15,
      demElevationM: 6,
      subBasinId: "TR28_GIRESUN_COASTAL_STRIP",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.05,
      verticalStratumRole: "coastal_or_gap"
    }),
    "18225": Object.freeze({
      stationId: 18225,
      nameTr: "Tirebolu Sahil",
      lat: 40.9775,
      lon: 38.7658,
      demElevationM: 5,
      subBasinId: "TR28_GIRESUN_COASTAL_STRIP",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.05,
      verticalStratumRole: "coastal_or_gap"
    }),
    "19377": Object.freeze({
      stationId: 19377,
      nameTr: "Dereli (Aksu Vadisi)",
      lat: 40.7378,
      lon: 38.4495,
      demElevationM: 407,
      subBasinId: "TR28_AKSU_HARSIT_WINDWARD_SLOPE",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.24,
      verticalStratumRole: "mid_slope"
    }),
    "18559": Object.freeze({
      stationId: 18559,
      nameTr: "Eynesil (Ören Yamaç)",
      lat: 41.0637,
      lon: 39.1408,
      demElevationM: 776,
      subBasinId: "TR28_AKSU_HARSIT_WINDWARD_SLOPE",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18720": Object.freeze({
      stationId: 18720,
      nameTr: "Kümbet Yaylası",
      lat: 40.562,
      lon: 38.438,
      demElevationM: 1942,
      subBasinId: "TR28_KUMBET_EGRIBEL_ALPINE_WALL",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }),
    "18722": Object.freeze({
      stationId: 18722,
      nameTr: "Bektaş Yaylası",
      lat: 40.625,
      lon: 38.225,
      demElevationM: 2094,
      subBasinId: "TR28_KUMBET_EGRIBEL_ALPINE_WALL",
      urbanFraction: 0.03,
      coldPoolSusceptibility: 0.1,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }),
    "17682": Object.freeze({
      stationId: 17682,
      nameTr: "Şebinkarahisar (Kelkit İç Havza)",
      lat: 40.2872,
      lon: 38.4193,
      demElevationM: 1364,
      subBasinId: "TR28_KELKIT_SEBINKARAHISAR_INTERIOR",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }),
    "18224": Object.freeze({
      stationId: 18224,
      nameTr: "Alucra Yüksek Çanak",
      lat: 40.3275,
      lon: 38.7522,
      demElevationM: 1477,
      subBasinId: "TR28_KELKIT_SEBINKARAHISAR_INTERIOR",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }),
    "18220": Object.freeze({
      stationId: 18220,
      nameTr: "Çamoluk (Kelkit Vadisi)",
      lat: 40.1339,
      lon: 38.7247,
      demElevationM: 1037,
      subBasinId: "TR28_KELKIT_SEBINKARAHISAR_INTERIOR",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.76,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([38, 480, 1380, 2250] as const),
    maxPhysicalPeakM: HYPSO_TR_28.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_28.bands
  }),
  waterBodies: Object.freeze([
    Object.freeze({
      id: "TR28_EASTERN_BLACK_SEA",
      labelTr: "Doğu Karadeniz (Giresun – Tirebolu Açıkları)",
      kind: "open_sea",
      mgmMarineStationIds: Object.freeze([17034, 17387, 17462]),
      sampleCoord: Object.freeze({ lat: 40.98, lon: 38.39 }),
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.0,
      monthlyWaterTempNormalsC: Object.freeze([
        9.4, 8.6, 8.9, 11.4, 15.9, 20.8, 24.6, 25.6, 23.1, 19.2, 14.9, 11.4
      ] as const),
      subBasinInfluenceWeights: Object.freeze({
        TR28_GIRESUN_COASTAL_STRIP: 1.0,
        TR28_AKSU_HARSIT_WINDWARD_SLOPE: 0.64,
        TR28_KUMBET_EGRIBEL_ALPINE_WALL: 0.25,
        TR28_KELKIT_SEBINKARAHISAR_INTERIOR: 0.02
      }),
      onshoreWindSectorDeg: Object.freeze({ fromDeg: 295, toDeg: 35 }),
      effectiveFetchKm: 420,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 11.5,
      dekHeavyDeltaTC: 14.5,
      seaBreezeSpec: Object.freeze({
        activeMonths: Object.freeze([5, 9] as const),
        sectorDeg: Object.freeze({ fromDeg: 315, toDeg: 25 }),
        maxInlandPenetrationKm: 16,
        maxCoolingAmplitudeC: 2.2
      })
    })
  ]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR28_GIRESUN_MOUNTAINS_COASTAL_WALL",
      labelTr: "Giresun Dağları (3095 m) Kıyı Orografik Duvarı & Şiddetli Kıble Fönü",
      effectiveBarrierHeightM: 2450,
      crestPressureHpa: 750,
      applicableSubBasins: Object.freeze([
        "TR28_GIRESUN_COASTAL_STRIP",
        "TR28_AKSU_HARSIT_WINDWARD_SLOPE",
        "TR28_KUMBET_EGRIBEL_ALPINE_WALL"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 155, toDeg: 225 }),
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.36,
        sourcePlateauElevationM: 1420,
        maxTargetElevationM: 380,
        maxWarmingCapC: 4.6,
        subCloudVirgaFactor: 0.52,
        wetCutoffMmHr: 1.4
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 295, toDeg: 35 }),
        minOnshoreOrUpslopeSpeedMs: 4.5,
        coastalFrictionalConvergenceBoost: 1.34,
        maxPrecipMultiplierCap: 1.88
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 160, toDeg: 220 }),
        precipAttenuationFactor: 0.58
      })
    }),
    Object.freeze({
      id: "TR28_EGRIBEL_KELKIT_RAIN_SHADOW",
      labelTr: "Eğribel Geçidi (2200 m) Güneyi Şebinkarahisar – Alucra Karadeniz Yağış Gölgesi",
      effectiveBarrierHeightM: 2200,
      crestPressureHpa: 750,
      applicableSubBasins: Object.freeze(["TR28_KELKIT_SEBINKARAHISAR_INTERIOR"]),
      foehnSpec: Object.freeze({
        enabled: false,
        windFromSectorDeg: Object.freeze({ fromDeg: 330, toDeg: 20 }),
        minCrossCrestSpeedMs: 10.0,
        minFroudeNumber: 0.5,
        sourcePlateauElevationM: 1500,
        maxTargetElevationM: 1200,
        maxWarmingCapC: 1.4,
        subCloudVirgaFactor: 0.25,
        wetCutoffMmHr: 1.5
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 175, toDeg: 235 }),
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 1.0,
        maxPrecipMultiplierCap: 1.24
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 295, toDeg: 40 }),
        precipAttenuationFactor: 0.48
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR28_AKSU_DERELI_FOEHN_CHUTE",
      labelTr: "Aksu Vadisi (Eğribel – Dereli – Giresun) Fön Oluk Kanalı",
      centerCoord: Object.freeze({ lat: 40.78, lon: 38.43 }),
      influenceRadiusKm: 14,
      channelAxisFromDeg: 185,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.3,
      gustMultiplier: 1.42,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 38,
    coldPoolMaxDepthM: 240,
    topographicEnclosureIndex: 0.68,
    deltaPressureTopHpa: 925,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 6,
      maxExtraRadiativeCoolingC: 3.4
    }),
    persistentStratusLock: Object.freeze({
      enabled: false,
      daytimeSolarDampingFactor: 0.78
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.22,
    invertedVDryMicroburstSusceptibility: 0.2,
    coastalWaterspoutSusceptibility: 0.62
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "giresun_center_coast",
      labelTr: "Giresun Merkez Kıyı (WMO 17034)",
      lat: 40.9227,
      lon: 38.3878,
      elevationM: 38,
      role: "target"
    }),
    Object.freeze({
      key: "giresun_blacksea_buoy",
      labelTr: "Giresun Karadeniz Deniz Rüzgâr-Üstü",
      lat: 41.02,
      lon: 38.39,
      elevationM: 0,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "piraziz_west_coast",
      labelTr: "Piraziz – Bulancak Batı Kıyı",
      lat: 40.9539,
      lon: 38.15,
      elevationM: 6,
      role: "corridor"
    }),
    Object.freeze({
      key: "tirebolu_gorele_east_coast",
      labelTr: "Tirebolu – Görele Doğu Kıyı",
      lat: 40.9775,
      lon: 38.7658,
      elevationM: 12,
      role: "corridor"
    }),
    Object.freeze({
      key: "dereli_aksu_mid_slope",
      labelTr: "Dereli – Aksu Kuzey Yamaç",
      lat: 40.7378,
      lon: 38.4495,
      elevationM: 407,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "kumbet_bektas_yayla",
      labelTr: "Kümbet – Kulakkaya Yayla Kuşağı",
      lat: 40.562,
      lon: 38.438,
      elevationM: 1942,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "egribel_abdalmusa_crest",
      labelTr: "Eğribel Geçidi (2200 m) / Karagöl Sırtı",
      lat: 40.475,
      lon: 38.42,
      elevationM: 2220,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "sebinkarahisar_kelkit_south",
      labelTr: "Şebinkarahisar (Kelkit Fön Kaynağı)",
      lat: 40.2872,
      lon: 38.4193,
      elevationM: 1364,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "alucra_continental_shadow",
      labelTr: "Alucra İç Karasal Gölge Çanağı",
      lat: 40.3275,
      lon: 38.7522,
      elevationM: 1477,
      role: "lee_shadow"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -32,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 974,
    maxPlausibleMslpHpa: 1054,
    kalmanTempBiasCapC: 5.8
  })
});

export default PROVINCE_SPEC_TR_28;
