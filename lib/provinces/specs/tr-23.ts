import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";
import type { ProvinceSpec } from "../types";

const CLIM_TR_23 = TR81_CLIMATOLOGY_1991_2020["TR-23"];
const HYPSO_TR_23 = TR81_HYPSOMETRIC_PROFILES["TR-23"];

export const TR_23_CALIBRATION_ANCHOR_META = Object.freeze({
  provinceCode: "TR-23",
  wmoStationId: "17202",
  mgmRegionalCenterIstNo: 17201,
  allowedMetarIcaos: Object.freeze(["LTCA"] as const),
  freshwaterBodiesOnly: true,
  openSeaDekAllowed: false
});

/**
 * Wave 3C (REG-16) — `TR-23` Elazığ Bespoke Physical & Microclimatic Specification:
 *  - Uluova / Elazığ Tectonic Depression Plain (`~881–1,067 m`, WMO `17202` / `LTCA` & MGM `17201`):
 *    Ringed by Harput plateau (`1,450 m`) to the north and Hazarbaba/Güneydoğu Toroslar (`2,347 m`) to the south,
 *    forming strong winter nocturnal radiation inversions and valley fog.
 *  - Keban Dam Reservoir (`845 m`, `fresh_lake`, `effectiveFetchKm: 20 < 25`) & Lake Hazar (`1,248 m`, `fresh_lake`,
 *    `effectiveFetchKm: 18 < 25`): Provide real winter thermal moderation (+1.4..+2.2°C frost buffering) and
 *    reservoir steam-fog around Keban, Ağın, Uluova, and Sivrice while STRICTLY NEVER triggering open-sea DEK!
 *  - Hazarbaba Ski Center (`2,347 m`, `18589`) & Maden–Ergani Southeastern Moisture Corridor (`17846` Maden):
 *    Channels warm, moist Mesopotamian/Tigris inflow (`135°–205°`) into intense upslope rain/snow on Hazarbaba.
 */
const SPEC_TR_23_ENGINE = Object.freeze({
  provinceCode: "TR-23",
  plateCode: 23,
  slug: "elazig",
  nameTr: "Elazığ",
  region: "EASTERN_ANATOLIA",
  climateRegion: "DOGU_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "EAST_MICRO_DEPRESSION",
  icaoWhitelist: Object.freeze(["LTCA"]),
  domainBounds: Object.freeze({
    minLat: 38.24,
    maxLat: 39.2,
    minLon: 38.36,
    maxLon: 40.34
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 92301,
    mgmIstNo: 17201,
    mgmSaatlikIstNo: 17201,
    mgmGunlukIstNo: 92301,
    wmoId: "17202",
    lat: 38.6443,
    lon: 39.2561,
    demVerifiedElevationM: 989,
    subBasinId: "TR23_ULUOVA_ELAZIG_DEPRESSION",
    urbanFraction: 0.7,
    monthlyTmaxNormalsC: CLIM_TR_23.tmaxC,
    monthlyTminNormalsC: CLIM_TR_23.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-23-keban",
      name: "Keban Baraj Gölü / Fırat Vadi Tabanı",
      role: "plain",
      lat: 38.7933,
      lon: 38.7492,
      elevationM: 823
    }),
    Object.freeze({
      id: "tr-23-merkez",
      name: "Elazığ Merkez / Uluova (WMO 17202)",
      role: "plain",
      lat: 38.6443,
      lon: 39.2561,
      elevationM: 989
    }),
    Object.freeze({
      id: "tr-23-sivrice",
      name: "Sivrice / Hazar Gölü Kuşağı & Harput",
      role: "foothill",
      lat: 38.4507,
      lon: 39.3101,
      elevationM: 1248
    }),
    Object.freeze({
      id: "tr-23-hazarbaba-kayak",
      name: "Hazarbaba Kayak Merkezi / Zirve (2347 m)",
      role: "summit",
      lat: 38.4107,
      lon: 39.3205,
      elevationM: 2150
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR23_ULUOVA_ELAZIG_DEPRESSION",
      labelTr: "Elazığ Merkez – Uluova (LTCA) – Kovancılar Çöküntü Ovası (880–1067 m)",
      polygonOrBbox: Object.freeze({
        minLat: 38.54,
        maxLat: 38.82,
        minLon: 39.02,
        maxLon: 39.95
      }),
      elevationRangeM: Object.freeze([860, 1120] as const),
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.58
    }),
    Object.freeze({
      id: "TR23_KEBAN_FIRAT_RESERVOIR_BASIN",
      labelTr: "Keban – Ağın – Baskil Etek – Palu Fırat/Murat Baraj Ilıman Kuşağı",
      polygonOrBbox: Object.freeze({
        minLat: 38.52,
        maxLat: 39.18,
        minLon: 38.38,
        maxLon: 40.02
      }),
      elevationRangeM: Object.freeze([760, 1150] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.28
    }),
    Object.freeze({
      id: "TR23_HAZAR_LAKE_HARPUT_PLATEAU",
      labelTr: "Hazar Gölü (Sivrice) – Harput – Karakoçan Yüksek Plato Kuşağı",
      polygonOrBbox: Object.freeze({
        minLat: 38.42,
        maxLat: 39.08,
        minLon: 38.78,
        maxLon: 40.25
      }),
      elevationRangeM: Object.freeze([1150, 1650] as const),
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.22
    }),
    Object.freeze({
      id: "TR23_MADEN_ERGANI_SE_CORRIDOR",
      labelTr: "Maden – Alacakaya – Arıcak Güneydoğu Dicle Nem Koridoru",
      polygonOrBbox: Object.freeze({
        minLat: 38.25,
        maxLat: 38.6,
        minLon: 39.52,
        maxLon: 40.32
      }),
      elevationRangeM: Object.freeze([880, 1480] as const),
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.2
    }),
    Object.freeze({
      id: "TR23_HAZARBABA_TAURUS_SUMMIT",
      labelTr: "Hazarbaba Kayak Merkezi – Güneydoğu Toroslar Zirve Kuşağı (2347 m)",
      polygonOrBbox: Object.freeze({
        minLat: 38.32,
        maxLat: 38.48,
        minLon: 39.18,
        maxLon: 39.55
      }),
      elevationRangeM: Object.freeze([1650, 2347] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.03
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR23_ULUOVA_ELAZIG_DEPRESSION: Object.freeze({
      TR23_ULUOVA_ELAZIG_DEPRESSION: 1.0,
      TR23_KEBAN_FIRAT_RESERVOIR_BASIN: 0.68,
      TR23_HAZAR_LAKE_HARPUT_PLATEAU: 0.48,
      TR23_MADEN_ERGANI_SE_CORRIDOR: 0.34,
      TR23_HAZARBABA_TAURUS_SUMMIT: 0.22
    }),
    TR23_KEBAN_FIRAT_RESERVOIR_BASIN: Object.freeze({
      TR23_ULUOVA_ELAZIG_DEPRESSION: 0.68,
      TR23_KEBAN_FIRAT_RESERVOIR_BASIN: 1.0,
      TR23_HAZAR_LAKE_HARPUT_PLATEAU: 0.42,
      TR23_MADEN_ERGANI_SE_CORRIDOR: 0.26,
      TR23_HAZARBABA_TAURUS_SUMMIT: 0.18
    }),
    TR23_HAZAR_LAKE_HARPUT_PLATEAU: Object.freeze({
      TR23_ULUOVA_ELAZIG_DEPRESSION: 0.48,
      TR23_KEBAN_FIRAT_RESERVOIR_BASIN: 0.42,
      TR23_HAZAR_LAKE_HARPUT_PLATEAU: 1.0,
      TR23_MADEN_ERGANI_SE_CORRIDOR: 0.44,
      TR23_HAZARBABA_TAURUS_SUMMIT: 0.54
    }),
    TR23_MADEN_ERGANI_SE_CORRIDOR: Object.freeze({
      TR23_ULUOVA_ELAZIG_DEPRESSION: 0.34,
      TR23_KEBAN_FIRAT_RESERVOIR_BASIN: 0.26,
      TR23_HAZAR_LAKE_HARPUT_PLATEAU: 0.44,
      TR23_MADEN_ERGANI_SE_CORRIDOR: 1.0,
      TR23_HAZARBABA_TAURUS_SUMMIT: 0.46
    }),
    TR23_HAZARBABA_TAURUS_SUMMIT: Object.freeze({
      TR23_ULUOVA_ELAZIG_DEPRESSION: 0.22,
      TR23_KEBAN_FIRAT_RESERVOIR_BASIN: 0.18,
      TR23_HAZAR_LAKE_HARPUT_PLATEAU: 0.54,
      TR23_MADEN_ERGANI_SE_CORRIDOR: 0.46,
      TR23_HAZARBABA_TAURUS_SUMMIT: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17201": Object.freeze({
      stationId: 17201,
      nameTr: "Elazığ Bölge / Merkez (989 m)",
      lat: 38.6443,
      lon: 39.2561,
      demElevationM: 989,
      subBasinId: "TR23_ULUOVA_ELAZIG_DEPRESSION",
      urbanFraction: 0.72,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "basin_floor"
    }),
    "17202": Object.freeze({
      stationId: 17202,
      nameTr: "Elazığ Havalimanı Uluova (WMO 17202 · LTCA)",
      lat: 38.6058,
      lon: 39.2973,
      demElevationM: 892,
      subBasinId: "TR23_ULUOVA_ELAZIG_DEPRESSION",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    LTCA: Object.freeze({
      stationId: "LTCA",
      nameTr: "Elazığ Meydan METAR (Uluova Sis/Ayaz Tabanı)",
      lat: 38.6058,
      lon: 39.2973,
      demElevationM: 892,
      subBasinId: "TR23_ULUOVA_ELAZIG_DEPRESSION",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "17804": Object.freeze({
      stationId: 17804,
      nameTr: "Keban Baraj Gölü Havzası",
      lat: 38.7933,
      lon: 38.7492,
      demElevationM: 823,
      subBasinId: "TR23_KEBAN_FIRAT_RESERVOIR_BASIN",
      urbanFraction: 0.32,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "17766": Object.freeze({
      stationId: 17766,
      nameTr: "Ağın Keban Yarımada Kıyısı",
      lat: 38.9413,
      lon: 38.7182,
      demElevationM: 900,
      subBasinId: "TR23_KEBAN_FIRAT_RESERVOIR_BASIN",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "17806": Object.freeze({
      stationId: 17806,
      nameTr: "Palu Murat Vadisi",
      lat: 38.6907,
      lon: 39.926,
      demElevationM: 869,
      subBasinId: "TR23_KEBAN_FIRAT_RESERVOIR_BASIN",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18178": Object.freeze({
      stationId: 18178,
      nameTr: "Kovancılar Doğu Ova",
      lat: 38.7017,
      lon: 39.8492,
      demElevationM: 1028,
      subBasinId: "TR23_ULUOVA_ELAZIG_DEPRESSION",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "17843": Object.freeze({
      stationId: 17843,
      nameTr: "Baskil Kayısı Platosu",
      lat: 38.5725,
      lon: 38.8352,
      demElevationM: 1300,
      subBasinId: "TR23_HAZAR_LAKE_HARPUT_PLATEAU",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.42,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "17774": Object.freeze({
      stationId: 17774,
      nameTr: "Karakoçan Kuzeydoğu Plato",
      lat: 38.9425,
      lon: 40.0428,
      demElevationM: 1090,
      subBasinId: "TR23_HAZAR_LAKE_HARPUT_PLATEAU",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.64,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "17844": Object.freeze({
      stationId: 17844,
      nameTr: "Sivrice – Hazar Gölü Kıyısı",
      lat: 38.4507,
      lon: 39.3101,
      demElevationM: 1248,
      subBasinId: "TR23_HAZAR_LAKE_HARPUT_PLATEAU",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "17846": Object.freeze({
      stationId: 17846,
      nameTr: "Maden Güneydoğu Boğazı",
      lat: 38.3924,
      lon: 39.6757,
      demElevationM: 1047,
      subBasinId: "TR23_MADEN_ERGANI_SE_CORRIDOR",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "18589": Object.freeze({
      stationId: 18589,
      nameTr: "Hazarbaba Kayak Merkezi (2075–2347 m)",
      lat: 38.4107,
      lon: 39.3205,
      demElevationM: 2075,
      subBasinId: "TR23_HAZARBABA_TAURUS_SUMMIT",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([890, 1210, 1680, 2280] as const),
    maxPhysicalPeakM: HYPSO_TR_23.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_23.bands
  }),
  waterBodies: Object.freeze([
    Object.freeze({
      id: "TR23_KEBAN_DAM_RESERVOIR",
      labelTr: "Keban Baraj Gölü (Kış Sis ve Termal Ilımanlaştırma Havzası)",
      kind: "fresh_lake",
      mgmMarineStationIds: Object.freeze([]),
      sampleCoord: Object.freeze({ lat: 38.76, lon: 39.18 }),
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 845,
      freezingPointC: 0.0,
      monthlyWaterTempNormalsC: Object.freeze([
        5.8, 5.4, 7.2, 11.4, 16.4, 21.2, 24.8, 25.4, 22.2, 17.4, 12.2, 7.9
      ] as const),
      subBasinInfluenceWeights: Object.freeze({
        TR23_KEBAN_FIRAT_RESERVOIR_BASIN: 0.86,
        TR23_ULUOVA_ELAZIG_DEPRESSION: 0.54,
        TR23_HAZAR_LAKE_HARPUT_PLATEAU: 0.22,
        TR23_MADEN_ERGANI_SE_CORRIDOR: 0.08,
        TR23_HAZARBABA_TAURUS_SUMMIT: 0.1
      }),
      onshoreWindSectorDeg: Object.freeze({ fromDeg: 300, toDeg: 65 }),
      // Strictly < 25 km so Keban moderates frost/fog in Cressman without ever triggering open-sea DEK!
      effectiveFetchKm: 20,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 22.0,
      dekHeavyDeltaTC: 26.0,
      seaBreezeSpec: Object.freeze({
        activeMonths: Object.freeze([6, 9] as const),
        sectorDeg: Object.freeze({ fromDeg: 315, toDeg: 55 }),
        maxInlandPenetrationKm: 12,
        maxCoolingAmplitudeC: 1.5
      })
    }),
    Object.freeze({
      id: "TR23_HAZAR_TECTONIC_LAKE",
      labelTr: "Hazar Gölü (Sivrice Tektonik Göl Havzası · 1248 m)",
      kind: "fresh_lake",
      mgmMarineStationIds: Object.freeze([]),
      sampleCoord: Object.freeze({ lat: 38.485, lon: 39.4 }),
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 1248,
      freezingPointC: 0.0,
      monthlyWaterTempNormalsC: Object.freeze([
        4.6, 4.2, 6.0, 10.2, 15.0, 19.8, 23.2, 23.8, 20.6, 15.8, 10.8, 6.8
      ] as const),
      subBasinInfluenceWeights: Object.freeze({
        TR23_HAZAR_LAKE_HARPUT_PLATEAU: 0.82,
        TR23_HAZARBABA_TAURUS_SUMMIT: 0.45,
        TR23_MADEN_ERGANI_SE_CORRIDOR: 0.25,
        TR23_ULUOVA_ELAZIG_DEPRESSION: 0.18,
        TR23_KEBAN_FIRAT_RESERVOIR_BASIN: 0.05
      }),
      onshoreWindSectorDeg: Object.freeze({ fromDeg: 20, toDeg: 85 }),
      effectiveFetchKm: 18,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 22.0,
      dekHeavyDeltaTC: 26.0,
      seaBreezeSpec: Object.freeze({
        activeMonths: Object.freeze([6, 9] as const),
        sectorDeg: Object.freeze({ fromDeg: 30, toDeg: 80 }),
        maxInlandPenetrationKm: 8,
        maxCoolingAmplitudeC: 1.3
      })
    })
  ]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR23_HAZARBABA_MADEN_SE_UPSLOPE_AND_LEE",
      labelTr: "Güneydoğu Toroslar / Hazarbaba (2347 m) Maden–Ergani Nem Yükselmesi ve Uluova Gölgesi",
      effectiveBarrierHeightM: 1380,
      crestPressureHpa: 750,
      applicableSubBasins: Object.freeze([
        "TR23_MADEN_ERGANI_SE_CORRIDOR",
        "TR23_HAZARBABA_TAURUS_SUMMIT",
        "TR23_HAZAR_LAKE_HARPUT_PLATEAU",
        "TR23_ULUOVA_ELAZIG_DEPRESSION"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 150, toDeg: 215 }),
        minCrossCrestSpeedMs: 8.0,
        minFroudeNumber: 0.42,
        sourcePlateauElevationM: 1350,
        maxTargetElevationM: 1050,
        maxWarmingCapC: 3.2,
        subCloudVirgaFactor: 0.42,
        wetCutoffMmHr: 1.6
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 130, toDeg: 205 }),
        minOnshoreOrUpslopeSpeedMs: 4.5,
        coastalFrictionalConvergenceBoost: 1.28,
        maxPrecipMultiplierCap: 1.58
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 335, toDeg: 35 }),
        precipAttenuationFactor: 0.68
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR23_MADEN_ERGANI_SE_MOISTURE_GAP",
      labelTr: "Maden – Ergani Dicle Boğazı Güneydoğu Rüzgâr ve Nem Koridoru",
      centerCoord: Object.freeze({ lat: 38.3924, lon: 39.6757 }),
      influenceRadiusKm: 15,
      channelAxisFromDeg: 155,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.26,
      gustMultiplier: 1.35,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 892,
    coldPoolMaxDepthM: 310,
    topographicEnclosureIndex: 0.82,
    deltaPressureTopHpa: 36,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 4.2
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.54
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 340, toDeg: 65 }),
      minWindShearVs850Deg: 70
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.62,
    invertedVDryMicroburstSusceptibility: 0.48,
    coastalWaterspoutSusceptibility: 0.0
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "elazig_center_17201",
      labelTr: "Elazığ Merkez / Uluova (989 m)",
      lat: 38.6443,
      lon: 39.2561,
      elevationM: 989,
      role: "target"
    }),
    Object.freeze({
      key: "uluova_ltca_floor",
      labelTr: "Uluova Havalimanı Sis Tabanı (LTCA)",
      lat: 38.6058,
      lon: 39.2973,
      elevationM: 892,
      role: "lee_shadow"
    }),
    Object.freeze({
      key: "keban_reservoir_west",
      labelTr: "Keban Baraj Gölü Batı Ilıman Havza",
      lat: 38.7933,
      lon: 38.7492,
      elevationM: 823,
      role: "corridor"
    }),
    Object.freeze({
      key: "harput_north_escarpment",
      labelTr: "Harput Kuzey Plato Yamacı",
      lat: 38.704,
      lon: 39.257,
      elevationM: 1420,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "sivrice_hazar_lake",
      labelTr: "Sivrice – Hazar Gölü Kıyısı (1248 m)",
      lat: 38.4507,
      lon: 39.3101,
      elevationM: 1248,
      role: "corridor"
    }),
    Object.freeze({
      key: "hazarbaba_ski_summit",
      labelTr: "Hazarbaba Kayak Merkezi Zirve",
      lat: 38.4107,
      lon: 39.3205,
      elevationM: 2075,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "maden_ergani_se_corridor",
      labelTr: "Maden – Ergani Güneydoğu Nem Girişi",
      lat: 38.3924,
      lon: 39.6757,
      elevationM: 1047,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "kovancilar_palu_east",
      labelTr: "Kovancılar – Palu Murat Ovası",
      lat: 38.7017,
      lon: 39.8492,
      elevationM: 1028,
      role: "corridor"
    }),
    Object.freeze({
      key: "baskil_west_plateau",
      labelTr: "Baskil Batı Eşik Platosu",
      lat: 38.5725,
      lon: 38.8352,
      elevationM: 1300,
      role: "lee_shadow"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -28,
    maxPlausibleTempC: 45,
    minPlausibleMslpHpa: 976,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 6.2
  }),
  inversion: Object.freeze({
    valleyFloorM: 892,
    coldPoolDepthM: 310,
    clearNightInversionLapseCPerKm: 4.2,
    snowpackBoostFactor: 1.4,
    enclosureIndex: 0.82
  }),
  urbanHeatIsland: Object.freeze({
    maxNocturnalUhiC: 2.5,
    referenceUrbanFraction: 0.7,
    coldBasinAirportIcaos: Object.freeze(["LTCA"])
  })
} satisfies ProvinceEngineSpec);

export const PROVINCE_SPEC_TR_23: ProvinceSpec = SPEC_TR_23_ENGINE;
export default PROVINCE_SPEC_TR_23;
