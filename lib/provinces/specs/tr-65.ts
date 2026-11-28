import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_65 = TR81_CLIMATOLOGY_1991_2020["TR-65"];
const HYPSO_TR_65 = TR81_HYPSOMETRIC_PROFILES["TR-65"];

/**
 * ATMOS v5.0 — Wave 3C (REG-19) Bespoke Microclimate Spec: TR-65 Van
 *
 * Key Physical Mechanisms:
 *  1. Non-Freezing Saline-Alkaline Lake Van (`3,755 km²`, `1,648 m`, `freezingPointC: -1.8°C`):
 *     Provides strong maritime-like winter thermal moderation and high insolation along the
 *     Van Merkez – Edremit – Gevaş eastern/southeastern shoreline (`LTCI` & `WMO 17170/17172`),
 *     plus intense W/NW (`250°–320°`) 700 hPa Lake-Effect Snow (`LST - T700 >= 12°C`) over a
 *     `118 km` open-water fetch lifted up Mount Erek (`3,204 m`) and Mount Artos (`3,550 m`).
 *  2. Sharp Cross-Ridge Decoupling (`barrierCouplingMatrix <= 0.15`) Against Extreme Outer Basins:
 *     - Çaldıran (`2,050 m` closed volcanic frost hollow, site of Türkiye's official all-time cold
 *       record `-46.4°C`, protected via `minPlausibleTempC: -47` and `0.08` coupling to Van shore),
 *     - Başkale (`2,286–2,400 m` beyond `2,730 m` Güzeldere Pass, `0.12` coupling),
 *     - Bahçesaray (`Karabet Pass 3,000 m` alpine enclave, `0.10` coupling).
 */
const SPEC_TR_65: ProvinceSpec = {
  provinceCode: "TR-65",
  plateCode: 65,
  slug: "van",
  nameTr: "Van",
  region: "EASTERN_ANATOLIA",
  climateRegion: "DOGU_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "VAN_LAKE_BASIN",
  icaoWhitelist: ["LTCI"],
  domainBounds: {
    minLat: 37.7203,
    maxLat: 39.371,
    minLon: 42.6623,
    maxLon: 44.5125
  },
  primaryCenter: {
    mgmMerkezId: 96501,
    mgmIstNo: 17172,
    mgmSaatlikIstNo: 17170,
    mgmGunlukIstNo: 96501,
    wmoId: "17170",
    lat: 38.4693,
    lon: 43.346,
    demVerifiedElevationM: 1675,
    subBasinId: "van_lake_east_shore",
    urbanFraction: 0.64,
    monthlyTmaxNormalsC: CLIM_TR_65.tmaxC,
    monthlyTminNormalsC: CLIM_TR_65.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-65-van-edremit-sahil",
      name: "Van Merkez – Edremit Göl Kıyısı (WMO 17170 / LTCI)",
      role: "coast",
      lat: 38.4693,
      lon: 43.346,
      elevationM: 1675
    },
    {
      id: "tr-65-gevas-akdamar-sahil",
      name: "Gevaş – Akdamar Güneydoğu Göl Kıyısı",
      role: "coast",
      lat: 38.2963,
      lon: 43.1197,
      elevationM: 1694
    },
    {
      id: "tr-65-ercis-kuzey-sahil",
      name: "Erciş – Muradiye Kuzey Göl Kıyısı",
      role: "coast",
      lat: 39.0197,
      lon: 43.3382,
      elevationM: 1678
    },
    {
      id: "tr-65-caldiran-ayaz-canagi",
      name: "Çaldıran (2.050 m · -46.4°C Soğuk Rekoru Çanağı)",
      role: "plain",
      lat: 39.1377,
      lon: 43.9244,
      elevationM: 2050
    },
    {
      id: "tr-65-baskale-yuksek-plato",
      name: "Başkale (2.286–2.400 m Güzeldere Ötesi Plato)",
      role: "foothill",
      lat: 38.0435,
      lon: 44.0173,
      elevationM: 2286
    },
    {
      id: "tr-65-bahcesaray-karabet-abali",
      name: "Gevaş Abalı Kayak Merkezi & Artos / Karabet Zirve Kuşağı",
      role: "summit",
      lat: 38.2725,
      lon: 43.2106,
      elevationM: 1897
    }
  ],
  subBasins: [
    {
      id: "van_lake_east_shore",
      labelTr: "Van Merkez (İpekyolu – Tuşba) – Edremit – Gevaş Doğu/Güneydoğu Göl Kıyısı",
      polygonOrBbox: { minLat: 38.24, maxLat: 38.75, minLon: 42.98, maxLon: 43.52 },
      elevationRangeM: [1648, 1780],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.58
    },
    {
      id: "ercis_muradiye_north_shore",
      labelTr: "Erciş – Muradiye Kuzey Van Gölü Kıyısı",
      polygonOrBbox: { minLat: 38.85, maxLat: 39.12, minLon: 43.12, maxLon: 43.82 },
      elevationRangeM: [1648, 1820],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.38
    },
    {
      id: "caldiran_ozalp_saray_frost_basin",
      labelTr: "Çaldıran (-46.4°C) – Özalp – Saray İran Sınırı Kapalı Ayaz Çanağı",
      polygonOrBbox: { minLat: 38.52, maxLat: 39.371, minLon: 43.76, maxLon: 44.5125 },
      elevationRangeM: [1950, 2650],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.16
    },
    {
      id: "baskale_gurpinar_high_plateau",
      labelTr: "Başkale (2400m) – Güzeldere Geçidi – Gürpınar Yüksek Platosu",
      polygonOrBbox: { minLat: 37.82, maxLat: 38.52, minLon: 43.38, maxLon: 44.48 },
      elevationRangeM: [1740, 3684],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.18
    },
    {
      id: "bahcesaray_catak_karabet_enclave",
      labelTr: "Bahçesaray (Karabet Geçidi 3000m) & Çatak Güney Dağ Kuşağı",
      polygonOrBbox: { minLat: 37.7203, maxLat: 38.24, minLon: 42.6623, maxLon: 43.32 },
      elevationRangeM: [1420, 3550],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.14
    }
  ],
  barrierCouplingMatrix: {
    van_lake_east_shore: {
      van_lake_east_shore: 1.0,
      ercis_muradiye_north_shore: 0.72,
      caldiran_ozalp_saray_frost_basin: 0.08,
      baskale_gurpinar_high_plateau: 0.12,
      bahcesaray_catak_karabet_enclave: 0.1
    },
    ercis_muradiye_north_shore: {
      van_lake_east_shore: 0.72,
      ercis_muradiye_north_shore: 1.0,
      caldiran_ozalp_saray_frost_basin: 0.14,
      baskale_gurpinar_high_plateau: 0.1,
      bahcesaray_catak_karabet_enclave: 0.08
    },
    caldiran_ozalp_saray_frost_basin: {
      van_lake_east_shore: 0.08,
      ercis_muradiye_north_shore: 0.14,
      caldiran_ozalp_saray_frost_basin: 1.0,
      baskale_gurpinar_high_plateau: 0.34,
      bahcesaray_catak_karabet_enclave: 0.06
    },
    baskale_gurpinar_high_plateau: {
      van_lake_east_shore: 0.12,
      ercis_muradiye_north_shore: 0.1,
      caldiran_ozalp_saray_frost_basin: 0.34,
      baskale_gurpinar_high_plateau: 1.0,
      bahcesaray_catak_karabet_enclave: 0.24
    },
    bahcesaray_catak_karabet_enclave: {
      van_lake_east_shore: 0.1,
      ercis_muradiye_north_shore: 0.08,
      caldiran_ozalp_saray_frost_basin: 0.06,
      baskale_gurpinar_high_plateau: 0.24,
      bahcesaray_catak_karabet_enclave: 1.0
    }
  },
  stationOverrides: {
    "17170": {
      stationId: 17170,
      nameTr: "Van Bölge / Ferit Melen (WMO 17170)",
      lat: 38.4693,
      lon: 43.346,
      demElevationM: 1675,
      subBasinId: "van_lake_east_shore",
      urbanFraction: 0.64,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "coastal_or_gap"
    },
    "17172": {
      stationId: 17172,
      nameTr: "Van Merkez / Edremit Kıyı (MGM 17172)",
      lat: 38.4693,
      lon: 43.346,
      demElevationM: 1675,
      subBasinId: "van_lake_east_shore",
      urbanFraction: 0.64,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "coastal_or_gap"
    },
    LTCI: {
      stationId: "LTCI",
      nameTr: "Van Ferit Melen Havalimanı (LTCI)",
      lat: 38.4682,
      lon: 43.3323,
      demElevationM: 1670,
      subBasinId: "van_lake_east_shore",
      urbanFraction: 0.54,
      coldPoolSusceptibility: 0.24,
      verticalStratumRole: "coastal_or_gap"
    },
    "17482": {
      stationId: 17482,
      nameTr: "Van Liman / İskele (Van Gölü Şamandıra)",
      lat: 38.498,
      lon: 43.336,
      demElevationM: 1648,
      subBasinId: "van_lake_east_shore",
      urbanFraction: 0.35,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "coastal_or_gap"
    },
    "17852": {
      stationId: 17852,
      nameTr: "Gevaş",
      lat: 38.2963,
      lon: 43.1197,
      demElevationM: 1694,
      subBasinId: "van_lake_east_shore",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17784": {
      stationId: 17784,
      nameTr: "Erciş",
      lat: 39.0197,
      lon: 43.3382,
      demElevationM: 1678,
      subBasinId: "ercis_muradiye_north_shore",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17786": {
      stationId: 17786,
      nameTr: "Muradiye",
      lat: 38.9898,
      lon: 43.763,
      demElevationM: 1706,
      subBasinId: "ercis_muradiye_north_shore",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18238": {
      stationId: 18238,
      nameTr: "Çaldıran (-46.4°C Türkiye Soğuk Rekoru Havzası)",
      lat: 39.1377,
      lon: 43.9244,
      demElevationM: 2050,
      subBasinId: "caldiran_ozalp_saray_frost_basin",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.98,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17812": {
      stationId: 17812,
      nameTr: "Özalp",
      lat: 38.6573,
      lon: 43.9767,
      demElevationM: 1989,
      subBasinId: "caldiran_ozalp_saray_frost_basin",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18585": {
      stationId: 18585,
      nameTr: "Saray",
      lat: 38.6442,
      lon: 44.1772,
      demElevationM: 2117,
      subBasinId: "caldiran_ozalp_saray_frost_basin",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17880": {
      stationId: 17880,
      nameTr: "Başkale",
      lat: 38.0435,
      lon: 44.0173,
      demElevationM: 2286,
      subBasinId: "baskale_gurpinar_high_plateau",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18237": {
      stationId: 18237,
      nameTr: "Gürpınar",
      lat: 38.3227,
      lon: 43.4077,
      demElevationM: 1748,
      subBasinId: "baskale_gurpinar_high_plateau",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.66,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18235": {
      stationId: 18235,
      nameTr: "Bahçesaray (Karabet Geçidi 3000m Ötesi)",
      lat: 38.1192,
      lon: 42.8081,
      demElevationM: 1648,
      subBasinId: "bahcesaray_catak_karabet_enclave",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18583": {
      stationId: 18583,
      nameTr: "Çatak",
      lat: 37.9956,
      lon: 43.0522,
      demElevationM: 1495,
      subBasinId: "bahcesaray_catak_karabet_enclave",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "19096": {
      stationId: 19096,
      nameTr: "Gevaş Abalı Kayak Merkezi (Artos Dağı)",
      lat: 38.2725,
      lon: 43.2106,
      demElevationM: 1897,
      subBasinId: "bahcesaray_catak_karabet_enclave",
      urbanFraction: 0.05,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [1650, 2080, 2580, 3684],
    maxPhysicalPeakM: HYPSO_TR_65.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_65.bands
  },
  waterBodies: [
    {
      id: "lake_van_east_main",
      labelTr: "Van Gölü (3.755 km² · 1.648 m Tuzlu-Sodalı Donmayan Göl)",
      kind: "alkaline_lake",
      mgmMarineStationIds: [17482, 17491],
      sampleCoord: { lat: 38.52, lon: 43.12 },
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 1648,
      freezingPointC: -1.8,
      monthlyWaterTempNormalsC: [
        3.8, 3.4, 4.6, 7.8, 12.6, 17.5, 21.4, 22.3, 19.2, 14.8, 9.9, 5.8
      ],
      subBasinInfluenceWeights: {
        van_lake_east_shore: 0.96,
        ercis_muradiye_north_shore: 0.84,
        baskale_gurpinar_high_plateau: 0.04,
        bahcesaray_catak_karabet_enclave: 0.03,
        caldiran_ozalp_saray_frost_basin: 0.0
      },
      onshoreWindSectorDeg: { fromDeg: 245, toDeg: 330 },
      effectiveFetchKm: 118,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 12,
      dekHeavyDeltaTC: 15,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 245, toDeg: 315 },
        maxInlandPenetrationKm: 22,
        maxCoolingAmplitudeC: 2.9
      }
    }
  ],
  directionalBarriers: [
    {
      id: "erek_artos_lake_effect_orographic_wall",
      labelTr: "Erek Dağı (3204m) & Artos Dağı (3550m) Batı/Kuzeybatı Van Gölü LES Kıyı Duvarı",
      effectiveBarrierHeightM: 3204,
      crestPressureHpa: 700,
      applicableSubBasins: ["van_lake_east_shore", "ercis_muradiye_north_shore"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 85, toDeg: 145 },
        minCrossCrestSpeedMs: 10.5,
        minFroudeNumber: 0.72,
        sourcePlateauElevationM: 2200,
        maxTargetElevationM: 1760,
        maxWarmingCapC: 3.5,
        subCloudVirgaFactor: 0.66,
        wetCutoffMmHr: 1.4
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 250, toDeg: 325 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.24,
        maxPrecipMultiplierCap: 1.84
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 95, toDeg: 140 },
        precipAttenuationFactor: 0.72
      }
    },
    {
      id: "karabet_kavussahap_south_snow_barrier",
      labelTr: "Karabet Geçidi (3000m) & Kavuşşahap Dağları Bahçesaray–Çatak Kar Duvarı",
      effectiveBarrierHeightM: 3350,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "bahcesaray_catak_karabet_enclave",
        "baskale_gurpinar_high_plateau"
      ],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 0, toDeg: 10 },
        minCrossCrestSpeedMs: 25,
        minFroudeNumber: 1.5,
        sourcePlateauElevationM: 2000,
        maxTargetElevationM: 1500,
        maxWarmingCapC: 1.0,
        subCloudVirgaFactor: 0.4,
        wetCutoffMmHr: 2.0
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 160, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.18,
        maxPrecipMultiplierCap: 1.92
      }
    }
  ],
  venturiCorridors: [
    {
      id: "guzeldere_kurubas_pass_jet",
      labelTr: "Güzeldere (2730m) – Kurubaş Geçidi Doğu-Güney Oluk Rüzgarı",
      centerCoord: { lat: 38.18, lon: 43.78 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 155,
      bidirectional: true,
      sectorHalfWidthDeg: 22,
      speedMultiplier: 1.3,
      gustMultiplier: 1.42,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1650,
    coldPoolMaxDepthM: 480,
    topographicEnclosureIndex: 0.88,
    deltaPressureTopHpa: 700,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 7.8
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.68
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 25, toDeg: 105 },
      minWindShearVs850Deg: 45
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.56,
    invertedVDryMicroburstSusceptibility: 0.34,
    coastalWaterspoutSusceptibility: 0.22
  },
  stencil9Points: [
    {
      key: "center_van_17170",
      labelTr: "Van Merkez – Edremit Kıyı (WMO 17170 / LTCI)",
      lat: 38.4693,
      lon: 43.346,
      elevationM: 1675,
      role: "target"
    },
    {
      key: "lake_van_open_upwind",
      labelTr: "Van Gölü Doğu Açıkları (1648m Sodalı Su)",
      lat: 38.52,
      lon: 43.12,
      elevationM: 1648,
      role: "marine_upwind"
    },
    {
      key: "gevas_akdamar_south_shore",
      labelTr: "Gevaş – Akdamar Güneydoğu Kıyı",
      lat: 38.2963,
      lon: 43.1197,
      elevationM: 1694,
      role: "marine_upwind"
    },
    {
      key: "ercis_north_lake_shore",
      labelTr: "Erciş Kuzey Göl Kıyısı",
      lat: 39.0197,
      lon: 43.3382,
      elevationM: 1678,
      role: "marine_upwind"
    },
    {
      key: "erek_dagi_east_wall",
      labelTr: "Erek Dağı (3204m) Doğu Zirve Duvarı",
      lat: 38.465,
      lon: 43.54,
      elevationM: 2950,
      role: "orographic_wall"
    },
    {
      key: "artos_abali_south_wall",
      labelTr: "Artos Dağı & Abalı Kayak Merkezi",
      lat: 38.2725,
      lon: 43.2106,
      elevationM: 1897,
      role: "orographic_wall"
    },
    {
      key: "caldiran_extreme_frost_hollow",
      labelTr: "Çaldıran (-46.4°C) Kapalı Volkanik Çanak",
      lat: 39.1377,
      lon: 43.9244,
      elevationM: 2050,
      role: "lee_shadow"
    },
    {
      key: "baskale_guzeldere_plateau",
      labelTr: "Başkale Yüksek Sınır Platosu",
      lat: 38.0435,
      lon: 44.0173,
      elevationM: 2286,
      role: "corridor"
    },
    {
      key: "bahcesaray_karabet_windward",
      labelTr: "Bahçesaray – Karabet Güney Geçidi",
      lat: 38.1192,
      lon: 42.8081,
      elevationM: 1648,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -47,
    maxPlausibleTempC: 40,
    minPlausibleMslpHpa: 970,
    maxPlausibleMslpHpa: 1066,
    kalmanTempBiasCapC: 4.8
  }
};

export const PROVINCE_SPEC_TR_65: ProvinceSpec = Object.freeze(SPEC_TR_65);
export default PROVINCE_SPEC_TR_65;
