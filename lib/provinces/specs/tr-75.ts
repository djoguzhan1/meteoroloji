import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";

const CLIM_TR_75 = TR81_CLIMATOLOGY_1991_2020["TR-75"];
const HYPSO_TR_75 = TR81_HYPSOMETRIC_PROFILES["TR-75"];

/**
 * ATMOS v5.0 — Wave 3C (REG-17) Bespoke Microclimate Spec: TR-75 Ardahan
 *
 * Key Synoptic & Microclimate Mechanisms (Extreme Northeast Siberian Plateau — 700 hPa Reference):
 *  1. Kura High Plateau (`~1,829 m` Ardahan Center) & Göle Siberian Frost Hollow (`~2,010 m`):
 *     Göle Plain is a saucer-shaped high-altitude radiative sink (`coldPoolSusceptibility: 0.98`)
 *     regularly plunging into the `-40°C` class (`minPlausibleTempC: -44°C`, `maxPlausibleMslpHpa: 1068 hPa`)
 *     under snow-covered Siberian anticyclones (`deltaPressureTopHpa: 700`, `maxExtraRadiativeCoolingC: 8.2°C`).
 *  2. Lake Çıldır (`1,959 m`, `fresh_lake`, `freezingPointC: 0.0°C`):
 *     Completely freezes over in winter (`0.0°C` ice lid Dec–Mar), shutting off winter open-water
 *     fluxes and acting as a high-albedo snow/ice plain, while moderating shoreline diurnal swings in JJA/SON.
 *  3. Posof Micro-Valley (`~1,350–1,374 m`, North of Ilgar Mountain `2,550–2,918 m`) vs. Yalnızçam (`~2,700 m`):
 *     Posof drains toward the Kura/Caucasus trough north of the Ilgar barrier (`barrierCouplingMatrix <= 0.16`
 *     against Ardahan/Göle), receiving humid Black Sea/Caucasian upslope moisture and remaining `6–11°C`
 *     milder than the Göle/Ardahan frost basins on winter nights.
 */
const SPEC_TR_75: ProvinceEngineSpec = {
  provinceCode: "TR-75",
  plateCode: 75,
  slug: "ardahan",
  nameTr: "Ardahan",
  region: "EASTERN_ANATOLIA",
  climateRegion: "DOGU_ANADOLU",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "HIGH_EAST_SNOW_BASIN",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 40.6292,
    maxLat: 41.6003,
    minLon: 42.316,
    maxLon: 43.4742
  },
  primaryCenter: {
    mgmMerkezId: 97501,
    mgmIstNo: 17046,
    mgmSaatlikIstNo: 17046,
    mgmGunlukIstNo: 97501,
    lat: 41.1061,
    lon: 42.7055,
    demVerifiedElevationM: 1829,
    subBasinId: "KURA_ARDAHAN_PLATEAU",
    urbanFraction: 0.44,
    monthlyTmaxNormalsC: CLIM_TR_75.tmaxC,
    monthlyTminNormalsC: CLIM_TR_75.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-75-ardahan-kura-merkez",
      name: "Ardahan Merkez / Kura Platosu (MGM 17046)",
      role: "plain",
      lat: 41.1061,
      lon: 42.7055,
      elevationM: 1829
    },
    {
      id: "tr-75-gole-ayaz-cukuru",
      name: "Göle Ovası Sibirya Ayaz Çukuru (MGM 18378)",
      role: "foothill",
      lat: 40.8014,
      lon: 42.5992,
      elevationM: 2010
    },
    {
      id: "tr-75-cildir-golu-havza",
      name: "Çıldır Gölü Kıyısı & Donan Göl Havzası (1959 m)",
      role: "foothill",
      lat: 41.05,
      lon: 43.22,
      elevationM: 1962
    },
    {
      id: "tr-75-posof-ilgar-kuzey",
      name: "Posof Vadisi (Ilgar Kuzeyi Nemli Kafkas Mikro-Vadisi)",
      role: "plain",
      lat: 41.4969,
      lon: 42.7344,
      elevationM: 1350
    },
    {
      id: "tr-75-yalnizcam-kayak-zirve",
      name: "Yalnızçam Kayak Merkezi & Uğurludağ Zirvesi (~2700 m)",
      role: "summit",
      lat: 41.045,
      lon: 42.465,
      elevationM: 2700
    }
  ],
  subBasins: [
    {
      id: "KURA_ARDAHAN_PLATEAU",
      labelTr: "Ardahan Merkez – Hanak – Damal Kura Yüksek Platosu (1780–2120 m)",
      polygonOrBbox: {
        minLat: 41.02,
        maxLat: 41.39,
        minLon: 42.58,
        maxLon: 43.02
      },
      elevationRangeM: [1780, 2120],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.36
    },
    {
      id: "GOLE_FROST_HOLLOW",
      labelTr: "Göle Ovası (~2010 m) Sibirya Radyasyonel Ayaz Çanağı (-40°C Sınıfı)",
      polygonOrBbox: {
        minLat: 40.6292,
        maxLat: 40.98,
        minLon: 42.38,
        maxLon: 42.88
      },
      elevationRangeM: [1960, 2220],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.16
    },
    {
      id: "CILDIR_FROZEN_LAKE_BASIN",
      labelTr: "Çıldır Gölü (1959 m Donan Göl) & Çıldır Doğu Platosu",
      polygonOrBbox: {
        minLat: 40.96,
        maxLat: 41.28,
        minLon: 43.02,
        maxLon: 43.4742
      },
      elevationRangeM: [1915, 2250],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.14
    },
    {
      id: "POSOF_ILGAR_MICRO_VALLEY",
      labelTr: "Posof Çayı Vadisi (~1350 m, Ilgar Dağı Kuzeyi Nemli Kafkas/Karadeniz Mikro-Vadisi)",
      polygonOrBbox: {
        minLat: 41.41,
        maxLat: 41.6003,
        minLon: 42.56,
        maxLon: 43.05
      },
      elevationRangeM: [1150, 1680],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.22
    },
    {
      id: "YALNIZCAM_ILGAR_KISIR_ALPINE",
      labelTr: "Yalnızçam Kayak (~2700 m) – Ilgar (2918 m) – Kısır Dağı (3197 m) Alpin Kuşağı",
      polygonOrBbox: {
        minLat: 40.94,
        maxLat: 41.44,
        minLon: 42.316,
        maxLon: 43.32
      },
      elevationRangeM: [2200, 3197],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.03
    }
  ],
  barrierCouplingMatrix: {
    KURA_ARDAHAN_PLATEAU: {
      KURA_ARDAHAN_PLATEAU: 1.0,
      GOLE_FROST_HOLLOW: 0.62,
      CILDIR_FROZEN_LAKE_BASIN: 0.66,
      POSOF_ILGAR_MICRO_VALLEY: 0.14,
      YALNIZCAM_ILGAR_KISIR_ALPINE: 0.36
    },
    GOLE_FROST_HOLLOW: {
      KURA_ARDAHAN_PLATEAU: 0.62,
      GOLE_FROST_HOLLOW: 1.0,
      CILDIR_FROZEN_LAKE_BASIN: 0.48,
      POSOF_ILGAR_MICRO_VALLEY: 0.08,
      YALNIZCAM_ILGAR_KISIR_ALPINE: 0.34
    },
    CILDIR_FROZEN_LAKE_BASIN: {
      KURA_ARDAHAN_PLATEAU: 0.66,
      GOLE_FROST_HOLLOW: 0.48,
      CILDIR_FROZEN_LAKE_BASIN: 1.0,
      POSOF_ILGAR_MICRO_VALLEY: 0.12,
      YALNIZCAM_ILGAR_KISIR_ALPINE: 0.38
    },
    POSOF_ILGAR_MICRO_VALLEY: {
      KURA_ARDAHAN_PLATEAU: 0.14,
      GOLE_FROST_HOLLOW: 0.08,
      CILDIR_FROZEN_LAKE_BASIN: 0.12,
      POSOF_ILGAR_MICRO_VALLEY: 1.0,
      YALNIZCAM_ILGAR_KISIR_ALPINE: 0.24
    },
    YALNIZCAM_ILGAR_KISIR_ALPINE: {
      KURA_ARDAHAN_PLATEAU: 0.36,
      GOLE_FROST_HOLLOW: 0.34,
      CILDIR_FROZEN_LAKE_BASIN: 0.38,
      POSOF_ILGAR_MICRO_VALLEY: 0.24,
      YALNIZCAM_ILGAR_KISIR_ALPINE: 1.0
    }
  },
  stationOverrides: {
    "17046": {
      stationId: 17046,
      nameTr: "Ardahan Merkez (Kura Platosu)",
      lat: 41.1061,
      lon: 42.7055,
      demElevationM: 1814,
      subBasinId: "KURA_ARDAHAN_PLATEAU",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "basin_floor"
    },
    "18378": {
      stationId: 18378,
      nameTr: "Göle (Sibirya Ayaz Ovası)",
      lat: 40.8014,
      lon: 42.5992,
      demElevationM: 2006,
      subBasinId: "GOLE_FROST_HOLLOW",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.98,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18376": {
      stationId: 18376,
      nameTr: "Çıldır",
      lat: 41.1097,
      lon: 43.1383,
      demElevationM: 1925,
      subBasinId: "CILDIR_FROZEN_LAKE_BASIN",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18236": {
      stationId: 18236,
      nameTr: "Posof (Ilgar Kuzeyi Kafkas Mikro-Vadisi)",
      lat: 41.4969,
      lon: 42.7344,
      demElevationM: 1374,
      subBasinId: "POSOF_ILGAR_MICRO_VALLEY",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18379": {
      stationId: 18379,
      nameTr: "Hanak",
      lat: 41.2292,
      lon: 42.8389,
      demElevationM: 1825,
      subBasinId: "KURA_ARDAHAN_PLATEAU",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.8,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18377": {
      stationId: 18377,
      nameTr: "Damal (Ilgar Güney Yamacı)",
      lat: 41.3394,
      lon: 42.8558,
      demElevationM: 2090,
      subBasinId: "KURA_ARDAHAN_PLATEAU",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "19251": {
      stationId: 19251,
      nameTr: "Yalnızçam Kayak Merkezi",
      lat: 41.05,
      lon: 42.5255,
      demElevationM: 1930,
      subBasinId: "YALNIZCAM_ILGAR_KISIR_ALPINE",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "19069": {
      stationId: 19069,
      nameTr: "Yalnızçam / Uğurludağ Yüksek Sırt",
      lat: 41.045,
      lon: 42.465,
      demElevationM: 2236,
      subBasinId: "YALNIZCAM_ILGAR_KISIR_ALPINE",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "19068": {
      stationId: 19068,
      nameTr: "Göle Güneydoğu Yayla Eteği",
      lat: 40.815,
      lon: 42.635,
      demElevationM: 2050,
      subBasinId: "GOLE_FROST_HOLLOW",
      urbanFraction: 0.05,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [1374, 2190, 2550, 2950],
    maxPhysicalPeakM: HYPSO_TR_75.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_75.bands
  },
  waterBodies: [
    {
      id: "CILDIR_FROZEN_HIGH_LAKE",
      labelTr: "Çıldır Gölü (1959 m — Kışın Tamamen Donan Yüksek İrtifa Tatlı Su Gölü)",
      kind: "fresh_lake",
      mgmMarineStationIds: [],
      sampleCoord: { lat: 41.05, lon: 43.22 },
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 1959,
      freezingPointC: 0.0,
      monthlyWaterTempNormalsC: [
        0.0, 0.0, 0.0, 2.2, 7.6, 13.4,
        17.8, 18.4, 14.5, 8.8, 3.2, 0.0
      ],
      subBasinInfluenceWeights: {
        CILDIR_FROZEN_LAKE_BASIN: 0.58,
        KURA_ARDAHAN_PLATEAU: 0.08,
        GOLE_FROST_HOLLOW: 0.02,
        POSOF_ILGAR_MICRO_VALLEY: 0.0,
        YALNIZCAM_ILGAR_KISIR_ALPINE: 0.06
      },
      onshoreWindSectorDeg: { fromDeg: 110, toDeg: 210 },
      effectiveFetchKm: 18,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 19.0,
      dekHeavyDeltaTC: 24.0,
      seaBreezeSpec: {
        activeMonths: [6, 9],
        sectorDeg: { fromDeg: 115, toDeg: 195 },
        maxInlandPenetrationKm: 8,
        maxCoolingAmplitudeC: 1.2
      }
    }
  ],
  directionalBarriers: [
    {
      id: "YALNIZCAM_ILGAR_PLATEAU_RAINSHADOW",
      labelTr: "Yalnızçam – Arsiyan – Ilgar Dağları (2700–3165 m) Ardahan/Göle Karadeniz Yağış Gölgesi",
      effectiveBarrierHeightM: 2950,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "KURA_ARDAHAN_PLATEAU",
        "GOLE_FROST_HOLLOW",
        "CILDIR_FROZEN_LAKE_BASIN"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 255, toDeg: 330 },
        minCrossCrestSpeedMs: 11.5,
        minFroudeNumber: 0.88,
        sourcePlateauElevationM: 800,
        maxTargetElevationM: 1950,
        maxWarmingCapC: 3.4,
        subCloudVirgaFactor: 0.65,
        wetCutoffMmHr: 1.3
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 85, toDeg: 145 },
        minOnshoreOrUpslopeSpeedMs: 8.0,
        coastalFrictionalConvergenceBoost: 1.08,
        maxPrecipMultiplierCap: 1.36
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 260, toDeg: 350 },
        precipAttenuationFactor: 0.52
      }
    },
    {
      id: "ILGAR_POSOF_CAUCASUS_UPSLOPE",
      labelTr: "Ilgar – Yalnızçam Kuzeybatı Yamacı Posof Nemli Kafkas/Karadeniz Orografik Yağış & Güney Fönü",
      effectiveBarrierHeightM: 2850,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "POSOF_ILGAR_MICRO_VALLEY",
        "YALNIZCAM_ILGAR_KISIR_ALPINE"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 225 },
        minCrossCrestSpeedMs: 10.5,
        minFroudeNumber: 0.85,
        sourcePlateauElevationM: 1900,
        maxTargetElevationM: 1550,
        maxWarmingCapC: 4.8,
        subCloudVirgaFactor: 0.68,
        wetCutoffMmHr: 1.5
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 285, toDeg: 355 },
        minOnshoreOrUpslopeSpeedMs: 7.0,
        coastalFrictionalConvergenceBoost: 1.18,
        maxPrecipMultiplierCap: 1.68
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 170, toDeg: 220 },
        precipAttenuationFactor: 0.68
      }
    }
  ],
  venturiCorridors: [
    {
      id: "ILGAR_PASS_BLIZZARD_VENTURI",
      labelTr: "Ilgar Dağı Geçidi (2550 m) Damal – Posof Tipi Venturi Kanalı",
      centerCoord: { lat: 41.425, lon: 42.745 },
      influenceRadiusKm: 18,
      channelAxisFromDeg: 345,
      bidirectional: true,
      sectorHalfWidthDeg: 24,
      speedMultiplier: 1.36,
      gustMultiplier: 1.48,
      suppressesNocturnalInversion: true
    },
    {
      id: "CAMGECIDI_SAHARA_YALNIZCAM_GAP",
      labelTr: "Çamgeçidi (Sahara – Yalnızçam 2540 m) Batı Kar/Tipi Geçidi",
      centerCoord: { lat: 41.05, lon: 42.5255 },
      influenceRadiusKm: 18,
      channelAxisFromDeg: 275,
      bidirectional: true,
      sectorHalfWidthDeg: 22,
      speedMultiplier: 1.32,
      gustMultiplier: 1.44,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1814,
    coldPoolMaxDepthM: 410,
    topographicEnclosureIndex: 0.94,
    deltaPressureTopHpa: 700,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 8.2
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.56
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 35, toDeg: 115 },
      minWindShearVs850Deg: 50
    }
  },
  inversion: {
    valleyFloorM: 1814,
    coldPoolDepthM: 410,
    clearNightInversionLapseCPerKm: 9.0,
    snowpackBoostFactor: 1.84,
    enclosureIndex: 0.94
  },
  urbanHeatIsland: {
    maxNocturnalUhiC: 2.3,
    referenceUrbanFraction: 0.44,
    coldBasinAirportIcaos: []
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.16,
    invertedVDryMicroburstSusceptibility: 0.24,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "center_ardahan_17046",
      labelTr: "Ardahan Merkez Kura Platosu (1829 m)",
      lat: 41.1061,
      lon: 42.7055,
      elevationM: 1829,
      role: "target"
    },
    {
      key: "gole_siberian_frost_hollow",
      labelTr: "Göle Ovası Sibirya Ayaz Çanağı (2010 m)",
      lat: 40.8014,
      lon: 42.5992,
      elevationM: 2010,
      role: "lee_shadow"
    },
    {
      key: "cildir_frozen_lake_upwind",
      labelTr: "Çıldır Gölü Donan Su/Buz Yüzeyi (1959 m)",
      lat: 41.05,
      lon: 43.22,
      elevationM: 1959,
      role: "marine_upwind"
    },
    {
      key: "posof_caucasus_valley",
      labelTr: "Posof Nemli Kafkas Mikro-Vadisi (1374 m)",
      lat: 41.4969,
      lon: 42.7344,
      elevationM: 1374,
      role: "lee_shadow"
    },
    {
      key: "yalnizcam_alpine_wall",
      labelTr: "Yalnızçam – Uğurludağ Zirve Sırtı (2700 m)",
      lat: 41.045,
      lon: 42.465,
      elevationM: 2700,
      role: "orographic_wall"
    },
    {
      key: "ilgar_pass_corridor",
      labelTr: "Ilgar Dağı Geçidi Tipi Kanalı (2550 m)",
      lat: 41.425,
      lon: 42.745,
      elevationM: 2550,
      role: "corridor"
    },
    {
      key: "kisir_mountain_wall",
      labelTr: "Kısır Dağı Kuzey Sırtı (2980 m)",
      lat: 41.015,
      lon: 43.085,
      elevationM: 2980,
      role: "orographic_wall"
    },
    {
      key: "hanak_kura_corridor",
      labelTr: "Hanak – Damal Kura Kuzey Koridoru (1825 m)",
      lat: 41.2292,
      lon: 42.8389,
      elevationM: 1825,
      role: "corridor"
    },
    {
      key: "akbaba_east_border_ridge",
      labelTr: "Akbaba – Çıldır Doğu Sınır Sırtı (2680 m)",
      lat: 41.085,
      lon: 43.285,
      elevationM: 2680,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -44,
    maxPlausibleTempC: 37,
    minPlausibleMslpHpa: 975,
    maxPlausibleMslpHpa: 1068,
    kalmanTempBiasCapC: 4.5
  }
};

export const PROVINCE_SPEC_TR_75: ProvinceEngineSpec = Object.freeze(SPEC_TR_75);
export default PROVINCE_SPEC_TR_75;
