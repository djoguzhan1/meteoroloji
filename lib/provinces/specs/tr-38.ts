import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const KAYSERI_CLIM = TR81_CLIMATOLOGY_1991_2020["TR-38"];
const KAYSERI_HYPSO = TR81_HYPSOMETRIC_PROFILES["TR-38"];

/**
 * Bespoke vertical & radiative cold-pool contract for `TR-38` Kayseri.
 * Captures the ~2,864 m contrast between the Karasazlığı / Erkilet closed-basin
 * freezing-fog floor (~1,053–1,094 m) and Erciyes Stratovolcano (3,917 m; Tekir Kapı 2,215 m),
 * alongside the Pınarbaşı–Sarız Uzunyayla (~1,550 m) Siberian cold-advection corridor.
 */
export const TR_38_KARASAZLIGI_ERCIYES_CONTRACT = Object.freeze({
  karasazligiFloorElevationM: 1053,
  melikgaziCenterElevationM: 1094,
  hacilarHisarcikSlopeElevationM: 1450,
  tekirKapiPassElevationM: 2215,
  erciyesSummitElevationM: 3917,
  uzunyaylaCorridorElevationM: 1550,
  verticalReliefM: 2864,
  freezingFogStratusLockEnabled: true,
  allowedMetarIcaos: Object.freeze(["LTAU"] as const),
  blockedNeighborMetarIcaos: Object.freeze(["LTAR", "LTAZ", "LTAF", "LTAC"] as const)
});

const specTr38: ProvinceSpec = {
  provinceCode: "TR-38",
  plateCode: 38,
  slug: "kayseri",
  nameTr: "Kayseri",
  region: "CENTRAL_ANATOLIA",
  climateRegion: "IC_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "CENTRAL_ANATOLIA_BASIN",
  icaoWhitelist: ["LTAU"],
  domainBounds: {
    minLat: 37.6915,
    maxLat: 39.3222,
    minLon: 34.847,
    maxLon: 36.9597
  },
  primaryCenter: {
    mgmMerkezId: 93802,
    mgmIstNo: 17196,
    mgmSaatlikIstNo: 17196,
    mgmGunlukIstNo: 93801,
    wmoId: "17195",
    lat: 38.7205,
    lon: 35.4894,
    demVerifiedElevationM: 1054,
    subBasinId: "karasazligi_kayseri_cold_basin",
    urbanFraction: 0.78,
    monthlyTmaxNormalsC: KAYSERI_CLIM.tmaxC,
    monthlyTminNormalsC: KAYSERI_CLIM.tminC
  },
  curatedSubLocations: [
    {
      id: "kayseri-karasazligi-erkilet-tr",
      name: "Karasazlığı / Erkilet Ovası (Kocasinan)",
      role: "plain",
      lat: 38.773,
      lon: 35.4908,
      elevationM: 1053
    },
    {
      id: "kayseri-melikgazi-merkez-tr",
      name: "Kayseri Merkez (Melikgazi / Talas)",
      role: "plain",
      lat: 38.687,
      lon: 35.5,
      elevationM: 1094
    },
    {
      id: "kayseri-hacilar-hisarcik-tr",
      name: "Hacılar / Hisarcık (Erciyes Kuzey Yamacı)",
      role: "foothill",
      lat: 38.636,
      lon: 35.478,
      elevationM: 1450
    },
    {
      id: "kayseri-pinarbasi-uzunyayla-tr",
      name: "Pınarbaşı / Sarız Uzunyayla Koridoru",
      role: "foothill",
      lat: 38.7251,
      lon: 36.3904,
      elevationM: 1550
    },
    {
      id: "kayseri-erciyes-tekir-kapi-tr",
      name: "Erciyes Tekir Kapı / Kayak Merkezi",
      role: "summit",
      lat: 38.5428,
      lon: 35.5244,
      elevationM: 2215
    }
  ],
  subBasins: [
    {
      id: "karasazligi_kayseri_cold_basin",
      labelTr: "Karasazlığı – Kocasinan – Melikgazi – İncesu Radyasyonel Çanak Ovası",
      polygonOrBbox: {
        minLat: 38.58,
        maxLat: 38.94,
        minLon: 35.08,
        maxLon: 35.72
      },
      elevationRangeM: [985, 1180],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.64
    },
    {
      id: "develi_sultansazligi_closed_bowl",
      labelTr: "Sultan Sazlığı – Develi – Yeşilhisar – Yahyalı Güney Kapalı Havzası",
      polygonOrBbox: {
        minLat: 37.6915,
        maxLat: 38.48,
        minLon: 34.847,
        maxLon: 35.66
      },
      elevationRangeM: [1070, 1320],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.22
    },
    {
      id: "uzunyayla_pinarbasi_sariz_corridor",
      labelTr: "Uzunyayla – Pınarbaşı – Sarız – Tomarza Sibirya Soğuk Platosu",
      polygonOrBbox: {
        minLat: 38.32,
        maxLat: 39.3222,
        minLon: 35.68,
        maxLon: 36.9597
      },
      elevationRangeM: [1320, 2180],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.16
    },
    {
      id: "erciyes_hacilar_tekir_volcanic_cone",
      labelTr: "Erciyes Stratovolkanı (3917m) – Tekir Kapı (2215m) – Hacılar/Hisarcık Yamacı",
      polygonOrBbox: {
        minLat: 38.44,
        maxLat: 38.67,
        minLon: 35.34,
        maxLon: 35.64
      },
      elevationRangeM: [1280, 3917],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.14
    }
  ],
  barrierCouplingMatrix: {
    karasazligi_kayseri_cold_basin: {
      karasazligi_kayseri_cold_basin: 1.0,
      develi_sultansazligi_closed_bowl: 0.24,
      uzunyayla_pinarbasi_sariz_corridor: 0.32,
      erciyes_hacilar_tekir_volcanic_cone: 0.12
    },
    develi_sultansazligi_closed_bowl: {
      karasazligi_kayseri_cold_basin: 0.22,
      develi_sultansazligi_closed_bowl: 1.0,
      uzunyayla_pinarbasi_sariz_corridor: 0.26,
      erciyes_hacilar_tekir_volcanic_cone: 0.14
    },
    uzunyayla_pinarbasi_sariz_corridor: {
      karasazligi_kayseri_cold_basin: 0.34,
      develi_sultansazligi_closed_bowl: 0.24,
      uzunyayla_pinarbasi_sariz_corridor: 1.0,
      erciyes_hacilar_tekir_volcanic_cone: 0.28
    },
    erciyes_hacilar_tekir_volcanic_cone: {
      karasazligi_kayseri_cold_basin: 0.08,
      develi_sultansazligi_closed_bowl: 0.1,
      uzunyayla_pinarbasi_sariz_corridor: 0.25,
      erciyes_hacilar_tekir_volcanic_cone: 1.0
    }
  },
  stationOverrides: {
    "17195": {
      stationId: 17195,
      nameTr: "Kayseri Erkilet Havalimanı (WMO 17195 / LTAU)",
      lat: 38.773,
      lon: 35.4908,
      demElevationM: 1053,
      subBasinId: "karasazligi_kayseri_cold_basin",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor"
    },
    LTAU: {
      stationId: "LTAU",
      nameTr: "Kayseri Erkilet Havalimanı METAR (LTAU)",
      lat: 38.773,
      lon: 35.4908,
      demElevationM: 1053,
      subBasinId: "karasazligi_kayseri_cold_basin",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor"
    },
    "17196": {
      stationId: 17196,
      nameTr: "Kayseri Bölge / Melikgazi Merkez",
      lat: 38.687,
      lon: 35.5,
      demElevationM: 1094,
      subBasinId: "karasazligi_kayseri_cold_basin",
      urbanFraction: 0.82,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "basin_floor"
    },
    "19188": {
      stationId: 19188,
      nameTr: "Kayseri Talas",
      lat: 38.687,
      lon: 35.5,
      demElevationM: 1092,
      subBasinId: "karasazligi_kayseri_cold_basin",
      urbanFraction: 0.74,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "basin_floor"
    },
    "18457": {
      stationId: 18457,
      nameTr: "Kayseri İncesu (Karasazlığı Batı Çıkışı)",
      lat: 38.6253,
      lon: 35.1753,
      demElevationM: 1130,
      subBasinId: "karasazligi_kayseri_cold_basin",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "basin_floor"
    },
    "19185": {
      stationId: 19185,
      nameTr: "Kayseri Hacılar / Hisarcık Yamacı",
      lat: 38.636,
      lon: 35.478,
      demElevationM: 1450,
      subBasinId: "erciyes_hacilar_tekir_volcanic_cone",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18149": {
      stationId: 18149,
      nameTr: "Erciyes Kayak Merkezi / Tekir Kapı",
      lat: 38.5428,
      lon: 35.5244,
      demElevationM: 2210,
      subBasinId: "erciyes_hacilar_tekir_volcanic_cone",
      urbanFraction: 0.06,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "17802": {
      stationId: 17802,
      nameTr: "Kayseri Pınarbaşı (Uzunyayla Batı Eşiği)",
      lat: 38.7251,
      lon: 36.3904,
      demElevationM: 1542,
      subBasinId: "uzunyayla_pinarbasi_sariz_corridor",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.85,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17840": {
      stationId: 17840,
      nameTr: "Kayseri Sarız (Doğu Uzunyayla / Binboğa Soğuk Koridoru)",
      lat: 38.4781,
      lon: 36.5035,
      demElevationM: 1599,
      subBasinId: "uzunyayla_pinarbasi_sariz_corridor",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "17837": {
      stationId: 17837,
      nameTr: "Kayseri Tomarza (Yüksek Ayaz Ovası)",
      lat: 38.4522,
      lon: 35.7912,
      demElevationM: 1402,
      subBasinId: "uzunyayla_pinarbasi_sariz_corridor",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.9,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17836": {
      stationId: 17836,
      nameTr: "Kayseri Develi (Erciyes Güney / Sultan Sazlığı Çanağı)",
      lat: 38.3744,
      lon: 35.4797,
      demElevationM: 1204,
      subBasinId: "develi_sultansazligi_closed_bowl",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.8,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18207": {
      stationId: 18207,
      nameTr: "Kayseri Yeşilhisar (Sultan Sazlığı Tabanı)",
      lat: 38.3408,
      lon: 35.0875,
      demElevationM: 1141,
      subBasinId: "develi_sultansazligi_closed_bowl",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.91,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [1053, 1450, 2215, 3917],
    maxPhysicalPeakM: 3917,
    snowElevationBands: KAYSERI_HYPSO.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "erciyes_stratovolcano_edifice_barrier",
      labelTr: "Erciyes Stratovolkanı (3917m) — Kuzey Kar Yamaç Kapanı ve Güneyli Lodos Fön Duvarı",
      effectiveBarrierHeightM: 3350,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "karasazligi_kayseri_cold_basin",
        "erciyes_hacilar_tekir_volcanic_cone",
        "develi_sultansazligi_closed_bowl"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 225 },
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.78,
        sourcePlateauElevationM: 2215,
        maxTargetElevationM: 1250,
        maxWarmingCapC: 5.4,
        subCloudVirgaFactor: 0.65,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 325, toDeg: 45 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.12,
        maxPrecipMultiplierCap: 1.48
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 175, toDeg: 215 },
        precipAttenuationFactor: 0.56
      }
    }
  ],
  venturiCorridors: [
    {
      id: "uzunyayla_pinarbasi_siberian_chute",
      labelTr: "Pınarbaşı – Sarız Uzunyayla (1550m) Sibirya Soğuk Adveksiyon Koridoru",
      centerCoord: { lat: 38.7251, lon: 36.3904 },
      influenceRadiusKm: 42,
      channelAxisFromDeg: 68,
      bidirectional: true,
      sectorHalfWidthDeg: 35,
      speedMultiplier: 1.34,
      gustMultiplier: 1.48,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1053,
    coldPoolMaxDepthM: 420,
    topographicEnclosureIndex: 0.89,
    deltaPressureTopHpa: 850,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 7.4
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.56
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 40, toDeg: 100 },
      minWindShearVs850Deg: 65
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.52,
    invertedVDryMicroburstSusceptibility: 0.64,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TGT_KAYSERI_KARASAZLIGI",
      labelTr: "Kayseri Karasazlığı / Erkilet Tabanı (1054m)",
      lat: 38.7205,
      lon: 35.4894,
      elevationM: 1054,
      role: "target"
    },
    {
      key: "ORO_ERCIYES_SUMMIT",
      labelTr: "Erciyes Zirve Konisi (3917m)",
      lat: 38.5318,
      lon: 35.4468,
      elevationM: 3917,
      role: "orographic_wall"
    },
    {
      key: "ORO_TEKIR_KAPI",
      labelTr: "Erciyes Tekir Kapı Geçidi (2215m)",
      lat: 38.5428,
      lon: 35.5244,
      elevationM: 2215,
      role: "orographic_wall"
    },
    {
      key: "ORO_HACILAR_HISARCIK",
      labelTr: "Hacılar – Hisarcık Kuzey Yamacı (1450m)",
      lat: 38.636,
      lon: 35.478,
      elevationM: 1450,
      role: "orographic_wall"
    },
    {
      key: "COR_UZUNYAYLA_PINARBASI",
      labelTr: "Pınarbaşı Uzunyayla Sibirya Koridoru (1542m)",
      lat: 38.7251,
      lon: 36.3904,
      elevationM: 1542,
      role: "corridor"
    },
    {
      key: "COR_SARIZ_HIGHLAND",
      labelTr: "Sarız Yüksek Geçit Oluğu (1599m)",
      lat: 38.4781,
      lon: 36.5035,
      elevationM: 1599,
      role: "corridor"
    },
    {
      key: "FOE_DEVELI_SOUTH",
      labelTr: "Develi Güney Yamacı (1204m)",
      lat: 38.3744,
      lon: 35.4797,
      elevationM: 1204,
      role: "foehn_windward"
    },
    {
      key: "LEE_SULTANSAZLIGI_BOWL",
      labelTr: "Sultan Sazlığı – Yeşilhisar Kapalı Havzası (1141m)",
      lat: 38.3408,
      lon: 35.0875,
      elevationM: 1141,
      role: "lee_shadow"
    },
    {
      key: "COR_INCESU_WEST_GAP",
      labelTr: "İncesu – Kızılırmak Batı Boğazı (1130m)",
      lat: 38.6253,
      lon: 35.1753,
      elevationM: 1130,
      role: "corridor"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -34,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1052,
    kalmanTempBiasCapC: 7.5
  }
};

export const PROVINCE_SPEC_TR_38: ProvinceSpec = Object.freeze(specTr38);
export default PROVINCE_SPEC_TR_38;
