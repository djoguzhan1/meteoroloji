import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_50 = TR81_CLIMATOLOGY_1991_2020["TR-50"];
const HYPSO_TR_50 = TR81_HYPSOMETRIC_PROFILES["TR-50"];

export const TR_50_CAPPADOCIA_VALLEY_PLATEAU_DELTA = Object.freeze({
  nevsehirPlateauCenterElevationM: 1260,
  gulsehirLtazValleyElevationM: 945,
  centerToLtazElevationDiffM: 315,
  uchisarRidgeElevationM: 1350,
  goremeValleyFloorM: 1075,
  allowedMetarIcaos: Object.freeze(["LTAZ"] as const)
});

/**
 * ATMOS v5.0 — Wave 3B (REG-14) Bespoke Microclimate Spec: TR-50 Nevşehir
 *
 * Key Physical Mechanisms:
 *  1. 315 m Plateau–River Trough Decoupling (`1,260 m` Nevşehir Merkez vs `945 m` Gülşehir `LTAZ`):
 *     Kapadokya Airport (`LTAZ`) sits in the incised Kızılırmak river trough at `~945 m`
 *     (`Gülşehir 905 m`, `Avanos 951 m`), `315 m` lower than Nevşehir Merkez (`1,260 m`).
 *     `LTAZ` is quarantined with `excludeFromCenterHeadline: true` and `coldPoolSusceptibility: 0.92`
 *     so nocturnal valley frost/fog at `945 m` never contaminates the `1,260 m` volcanic tuff plateau.
 *  2. Göreme–Ürgüp–Uçhisar Incised Ignimbrite Tuff Canyon/Ridge Drainage:
 *     Radiative katabatic drainage off Uçhisar (`1,350 m`) and Akdağ ridges pools cold air in
 *     Göreme (`1,075 m`) and Ürgüp (`1,068 m`) valleys while keeping plateau rims in the thermal belt.
 *  3. Derinkuyu (`1,320 m`) Enclosed High Volcanic Frost Hollow:
 *     Snow-covered clear nights trigger extreme radiative cooling across the southern Derinkuyu depression.
 */
const SPEC_TR_50: ProvinceSpec = {
  provinceCode: "TR-50",
  plateCode: 50,
  slug: "nevsehir",
  nameTr: "Nevşehir",
  region: "CENTRAL_ANATOLIA",
  climateRegion: "IC_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "CENTRAL_ANATOLIA_BASIN",
  icaoWhitelist: ["LTAZ"],
  domainBounds: {
    minLat: 38.2813,
    maxLat: 39.3837,
    minLon: 34.2403,
    maxLon: 35.1665
  },
  primaryCenter: {
    mgmMerkezId: 95001,
    mgmIstNo: 17193,
    mgmSaatlikIstNo: 17193,
    mgmGunlukIstNo: 95001,
    wmoId: "17193",
    lat: 38.6163,
    lon: 34.7025,
    demVerifiedElevationM: 1260,
    subBasinId: "cappadocia_tuff_plateau",
    urbanFraction: 0.62,
    monthlyTmaxNormalsC: CLIM_TR_50.tmaxC,
    monthlyTminNormalsC: CLIM_TR_50.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-50-gulsehir-kizilirmak",
      name: "Gülşehir – Kızılırmak Vadisi (LTAZ Çanağı)",
      role: "coast",
      lat: 38.7497,
      lon: 34.6247,
      elevationM: 905
    },
    {
      id: "tr-50-avanos",
      name: "Avanos – Kızılırmak Havzası",
      role: "coast",
      lat: 38.72,
      lon: 34.8538,
      elevationM: 951
    },
    {
      id: "tr-50-urgup",
      name: "Ürgüp (Tüf Vadisi)",
      role: "plain",
      lat: 38.6218,
      lon: 34.9144,
      elevationM: 1068
    },
    {
      id: "tr-50-goreme",
      name: "Göreme Milli Parkı (Vadi Tabanı)",
      role: "plain",
      lat: 38.6431,
      lon: 34.8289,
      elevationM: 1075
    },
    {
      id: "tr-50-merkez",
      name: "Nevşehir Merkez (Tüf Platosu · WMO 17193)",
      role: "foothill",
      lat: 38.6163,
      lon: 34.7025,
      elevationM: 1260
    },
    {
      id: "tr-50-uchisar-sirti",
      name: "Uçhisar Kale Sırtı (Termal Kuşak)",
      role: "foothill",
      lat: 38.6308,
      lon: 34.8064,
      elevationM: 1350
    },
    {
      id: "tr-50-derinkuyu",
      name: "Derinkuyu Yüksek Ayaz Çanağı",
      role: "foothill",
      lat: 38.3397,
      lon: 34.7145,
      elevationM: 1320
    },
    {
      id: "tr-50-erdas-zirve",
      name: "Erdaş / Hodul Dağı Zirve Kuşağı",
      role: "summit",
      lat: 38.528,
      lon: 34.962,
      elevationM: 1880
    }
  ],
  subBasins: [
    {
      id: "kizilirmak_gulsehir_avanos_trough",
      labelTr: "Gülşehir (LTAZ 945m) – Avanos Kızılırmak Derin Vadi Oluk Tabanı",
      polygonOrBbox: {
        minLat: 38.68,
        maxLat: 38.88,
        minLon: 34.35,
        maxLon: 35.02
      },
      elevationRangeM: [885, 1025],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.22
    },
    {
      id: "goreme_urgup_fairy_valleys",
      labelTr: "Göreme – Ürgüp – Zelve – Çavuşin Tüf Kanyon ve Vadi Terselme Kuşağı",
      polygonOrBbox: {
        minLat: 38.55,
        maxLat: 38.7,
        minLon: 34.78,
        maxLon: 35.08
      },
      elevationRangeM: [1025, 1190],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.28
    },
    {
      id: "cappadocia_tuff_plateau",
      labelTr: "Nevşehir Merkez (1260m) – Uçhisar – Acıgöl – Hacıbektaş – Kozaklı Tüf Platosu",
      polygonOrBbox: {
        minLat: 38.48,
        maxLat: 39.3837,
        minLon: 34.2403,
        maxLon: 35.12
      },
      elevationRangeM: [1100, 1450],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.48
    },
    {
      id: "derinkuyu_erdas_high_basin",
      labelTr: "Derinkuyu – Kaymaklı Yüksek Ayaz Çanağı & Erdaş (1988m) Sırtı",
      polygonOrBbox: {
        minLat: 38.2813,
        maxLat: 38.55,
        minLon: 34.48,
        maxLon: 35.1665
      },
      elevationRangeM: [1290, 1988],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.18
    }
  ],
  barrierCouplingMatrix: {
    kizilirmak_gulsehir_avanos_trough: {
      kizilirmak_gulsehir_avanos_trough: 1.0,
      goreme_urgup_fairy_valleys: 0.56,
      cappadocia_tuff_plateau: 0.2,
      derinkuyu_erdas_high_basin: 0.12
    },
    goreme_urgup_fairy_valleys: {
      kizilirmak_gulsehir_avanos_trough: 0.56,
      goreme_urgup_fairy_valleys: 1.0,
      cappadocia_tuff_plateau: 0.36,
      derinkuyu_erdas_high_basin: 0.24
    },
    cappadocia_tuff_plateau: {
      kizilirmak_gulsehir_avanos_trough: 0.2,
      goreme_urgup_fairy_valleys: 0.36,
      cappadocia_tuff_plateau: 1.0,
      derinkuyu_erdas_high_basin: 0.48
    },
    derinkuyu_erdas_high_basin: {
      kizilirmak_gulsehir_avanos_trough: 0.12,
      goreme_urgup_fairy_valleys: 0.24,
      cappadocia_tuff_plateau: 0.48,
      derinkuyu_erdas_high_basin: 1.0
    }
  },
  stationOverrides: {
    "17193": {
      stationId: 17193,
      nameTr: "Nevşehir Merkez (1260m Tüf Platosu · WMO 17193)",
      lat: 38.6163,
      lon: 34.7025,
      demElevationM: 1260,
      subBasinId: "cappadocia_tuff_plateau",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.26,
      verticalStratumRole: "mid_slope"
    },
    LTAZ: {
      stationId: "LTAZ",
      nameTr: "Kapadokya Havalimanı (Gülşehir – 945m Kızılırmak Vadi Tabanı)",
      lat: 38.7719,
      lon: 34.5345,
      demElevationM: 945,
      subBasinId: "kizilirmak_gulsehir_avanos_trough",
      urbanFraction: 0.08,
      coldPoolSusceptibility: 0.92,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18464": {
      stationId: 18464,
      nameTr: "Gülşehir (Kızılırmak Vadisi)",
      lat: 38.7497,
      lon: 34.6247,
      demElevationM: 905,
      subBasinId: "kizilirmak_gulsehir_avanos_trough",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.9,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17833": {
      stationId: 17833,
      nameTr: "Avanos (Kızılırmak Vadisi)",
      lat: 38.72,
      lon: 34.8538,
      demElevationM: 951,
      subBasinId: "kizilirmak_gulsehir_avanos_trough",
      urbanFraction: 0.32,
      coldPoolSusceptibility: 0.85,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17835": {
      stationId: 17835,
      nameTr: "Ürgüp (Tüf Kanyon Çanağı)",
      lat: 38.6218,
      lon: 34.9144,
      demElevationM: 1068,
      subBasinId: "goreme_urgup_fairy_valleys",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18463": {
      stationId: 18463,
      nameTr: "Acıgöl",
      lat: 38.5481,
      lon: 34.5142,
      demElevationM: 1250,
      subBasinId: "cappadocia_tuff_plateau",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18122": {
      stationId: 18122,
      nameTr: "Hacıbektaş",
      lat: 38.9436,
      lon: 34.5583,
      demElevationM: 1275,
      subBasinId: "cappadocia_tuff_plateau",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18123": {
      stationId: 18123,
      nameTr: "Kozaklı",
      lat: 39.21,
      lon: 34.8511,
      demElevationM: 1103,
      subBasinId: "cappadocia_tuff_plateau",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18121": {
      stationId: 18121,
      nameTr: "Derinkuyu (Yüksek Karasal Ayaz Çanağı)",
      lat: 38.3397,
      lon: 34.7145,
      demElevationM: 1320,
      subBasinId: "derinkuyu_erdas_high_basin",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [920, 1225, 1520, 1880],
    maxPhysicalPeakM: HYPSO_TR_50.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_50.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "cappadocia_plateau_escarpment_and_erdas_ridge",
      labelTr: "Kapadokya Volkanik Tüf Platosu & Erdaş–Hodul (1988m) Sırt Bariyeri",
      effectiveBarrierHeightM: 1880,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "cappadocia_tuff_plateau",
        "goreme_urgup_fairy_valleys",
        "derinkuyu_erdas_high_basin"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 230 },
        minCrossCrestSpeedMs: 8.0,
        minFroudeNumber: 0.46,
        sourcePlateauElevationM: 1200,
        maxTargetElevationM: 1300,
        maxWarmingCapC: 3.1,
        subCloudVirgaFactor: 0.62,
        wetCutoffMmHr: 0.3
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 315, toDeg: 35 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.0,
        maxPrecipMultiplierCap: 1.32
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 155, toDeg: 215 },
        precipAttenuationFactor: 0.72
      }
    },
    {
      id: "kizilirmak_trough_subsidence_shield",
      labelTr: "Kızılırmak (Gülşehir – Avanos) Çukur Vadi Gölge ve Çökme Hattı",
      effectiveBarrierHeightM: 1550,
      crestPressureHpa: 850,
      applicableSubBasins: ["kizilirmak_gulsehir_avanos_trough"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 170, toDeg: 235 },
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.45,
        sourcePlateauElevationM: 1260,
        maxTargetElevationM: 1020,
        maxWarmingCapC: 3.4,
        subCloudVirgaFactor: 0.68,
        wetCutoffMmHr: 0.3
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 290, toDeg: 350 },
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 1.0,
        maxPrecipMultiplierCap: 1.18
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 165, toDeg: 230 },
        precipAttenuationFactor: 0.66
      }
    }
  ],
  venturiCorridors: [
    {
      id: "kizilirmak_avanos_gulsehir_corridor",
      labelTr: "Kızılırmak Koridoru (Avanos – Gülşehir Doğu–Batı Vadi Kanalı)",
      centerCoord: { lat: 38.735, lon: 34.72 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 100,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.24,
      gustMultiplier: 1.35,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 920,
    coldPoolMaxDepthM: 280,
    topographicEnclosureIndex: 0.8,
    deltaPressureTopHpa: 34,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 2.0,
      maxExtraRadiativeCoolingC: 4.8
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.44
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 345, toDeg: 70 },
      minWindShearVs850Deg: 55
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.58,
    invertedVDryMicroburstSusceptibility: 0.64,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TARGET_NEVSEHIR_17193",
      labelTr: "Nevşehir Merkez (1260m Tüf Platosu · WMO 17193)",
      lat: 38.6163,
      lon: 34.7025,
      elevationM: 1260,
      role: "target"
    },
    {
      key: "GULSEHIR_LTAZ_TROUGH",
      labelTr: "Gülşehir – LTAZ (945m Kızılırmak Vadi Tabanı)",
      lat: 38.7719,
      lon: 34.5345,
      elevationM: 945,
      role: "lee_shadow"
    },
    {
      key: "AVANOS_RIVER_EAST",
      labelTr: "Avanos – Kızılırmak Doğu Kanalı",
      lat: 38.72,
      lon: 34.8538,
      elevationM: 951,
      role: "corridor"
    },
    {
      key: "GOREME_VALLEY_FLOOR",
      labelTr: "Göreme Vadi Tabanı (Peribacaları)",
      lat: 38.6431,
      lon: 34.8289,
      elevationM: 1075,
      role: "lee_shadow"
    },
    {
      key: "URGUP_TUFF_CANYON",
      labelTr: "Ürgüp Tüf Kanyonu",
      lat: 38.6218,
      lon: 34.9144,
      elevationM: 1068,
      role: "lee_shadow"
    },
    {
      key: "UCHISAR_THERMAL_RIDGE",
      labelTr: "Uçhisar Kale Sırtı (1350m Termal Kuşak)",
      lat: 38.6308,
      lon: 34.8064,
      elevationM: 1350,
      role: "orographic_wall"
    },
    {
      key: "ERDAS_HODUL_CREST",
      labelTr: "Erdaş / Hodul Dağı (1880m Volkanik Sırt)",
      lat: 38.528,
      lon: 34.962,
      elevationM: 1880,
      role: "orographic_wall"
    },
    {
      key: "DERINKUYU_FROST_HOLLOW",
      labelTr: "Derinkuyu Yüksek Ayaz Çanağı (1320m)",
      lat: 38.3397,
      lon: 34.7145,
      elevationM: 1320,
      role: "foehn_windward"
    },
    {
      key: "HACIBEKTAS_NW_PLATEAU",
      labelTr: "Hacıbektaş Kuzeybatı Platosu",
      lat: 38.9436,
      lon: 34.5583,
      elevationM: 1275,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -29,
    maxPlausibleTempC: 41,
    minPlausibleMslpHpa: 984,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 5.2
  }
};

export const PROVINCE_SPEC_TR_50: ProvinceSpec = Object.freeze(SPEC_TR_50);
export default PROVINCE_SPEC_TR_50;
