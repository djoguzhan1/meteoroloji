import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_41 = TR81_CLIMATOLOGY_1991_2020["TR-41"];
const HYPSO_TR_41 = TR81_HYPSOMETRIC_PROFILES["TR-41"];

/**
 * Historical Tier-A WMO / Meteostat calibration anchor metadata for TR-41 Kocaeli (`LTBQ0` / WMO `17066`).
 * Strictly isolates Kocaeli from neighbor `LTFJ` (Istanbul) and `TR-16` Bursa İznik/Orhangazi stations.
 */
export const TR_41_CALIBRATION_ANCHOR_META = Object.freeze({
  meteostatStationId: "LTBQ0",
  wmoStationId: "17066",
  blockedNeighborIcaos: ["LTFJ", "LTBR", "LTBA", "LTFM"] as const
});

export const PROVINCE_SPEC_TR_41: ProvinceSpec = Object.freeze<ProvinceSpec>({
  provinceCode: "TR-41",
  plateCode: 41,
  slug: "kocaeli",
  nameTr: "Kocaeli",
  region: "MARMARA",
  climateRegion: "MARMARA",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "MARMARA_COASTAL_TRANSITION",
  icaoWhitelist: ["LTBQ"],
  domainBounds: {
    minLat: 40.53,
    maxLat: 41.22,
    minLon: 29.35,
    maxLon: 30.36
  },
  primaryCenter: {
    mgmMerkezId: 94101,
    mgmIstNo: 17066,
    mgmSaatlikIstNo: 17066,
    mgmGunlukIstNo: 94101,
    wmoId: "17066",
    lat: 40.7663,
    lon: 29.9173,
    demVerifiedElevationM: 74,
    subBasinId: "izmit_sapanca_trench",
    urbanFraction: 0.82,
    monthlyTmaxNormalsC: CLIM_TR_41.tmaxC,
    monthlyTminNormalsC: CLIM_TR_41.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-41-kandira-kefken-kiyi",
      name: "Kandıra / Kefken Karadeniz DEK Kıyısı",
      role: "coast",
      lat: 41.168,
      lon: 30.222,
      elevationM: 12
    },
    {
      id: "tr-41-izmit-korfez-olugu",
      name: "İzmit Körfezi – Gölcük Tektonik Oluğu",
      role: "plain",
      lat: 40.7663,
      lon: 29.9173,
      elevationM: 74
    },
    {
      id: "tr-41-masukiye-yuvacik-yamac",
      name: "Maşukiye / Kuzuyayla Samanlı Kuzey Yamacı",
      role: "foothill",
      lat: 40.6885,
      lon: 30.118,
      elevationM: 650
    },
    {
      id: "tr-41-kartepe-zirve-1602",
      name: "Kartepe Kayak Merkezi & Zirve (1602m)",
      role: "summit",
      lat: 40.6557,
      lon: 30.0954,
      elevationM: 1602
    }
  ],
  subBasins: [
    {
      id: "izmit_sapanca_trench",
      labelTr: "İzmit Körfezi – Cengiz Topel – Sapanca Tektonik Oluğu",
      polygonOrBbox: {
        minLat: 40.67,
        maxLat: 40.82,
        minLon: 29.52,
        maxLon: 30.26
      },
      elevationRangeM: [0, 150],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.78
    },
    {
      id: "kandira_black_sea_shelf",
      labelTr: "Kandıra – Kefken Açık Karadeniz DEK Kıyısı",
      polygonOrBbox: {
        minLat: 40.96,
        maxLat: 41.22,
        minLon: 29.88,
        maxLon: 30.35
      },
      elevationRangeM: [0, 260],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.18
    },
    {
      id: "gebze_dilovasi_plateau",
      labelTr: "Gebze – Çayırova – Darıca – Dilovası Batı Platosu",
      polygonOrBbox: {
        minLat: 40.74,
        maxLat: 40.96,
        minLon: 29.36,
        maxLon: 29.68
      },
      elevationRangeM: [10, 320],
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.84
    },
    {
      id: "samanli_kartepe_alpine",
      labelTr: "Samanlı Dağları – Yuvacık – Kartepe (1602m) Dikey Kar Duvarı",
      polygonOrBbox: {
        minLat: 40.54,
        maxLat: 40.7,
        minLon: 29.58,
        maxLon: 30.24
      },
      elevationRangeM: [350, 1699],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.06
    }
  ],
  barrierCouplingMatrix: {
    izmit_sapanca_trench: {
      izmit_sapanca_trench: 1.0,
      kandira_black_sea_shelf: 0.58,
      gebze_dilovasi_plateau: 0.74,
      samanli_kartepe_alpine: 0.22
    },
    kandira_black_sea_shelf: {
      izmit_sapanca_trench: 0.58,
      kandira_black_sea_shelf: 1.0,
      gebze_dilovasi_plateau: 0.54,
      samanli_kartepe_alpine: 0.38
    },
    gebze_dilovasi_plateau: {
      izmit_sapanca_trench: 0.74,
      kandira_black_sea_shelf: 0.54,
      gebze_dilovasi_plateau: 1.0,
      samanli_kartepe_alpine: 0.28
    },
    samanli_kartepe_alpine: {
      izmit_sapanca_trench: 0.22,
      kandira_black_sea_shelf: 0.38,
      gebze_dilovasi_plateau: 0.28,
      samanli_kartepe_alpine: 1.0
    }
  },
  stationOverrides: {
    "17066": {
      stationId: 17066,
      nameTr: "Kocaeli / İzmit Merkez (WMO 17066)",
      lat: 40.7663,
      lon: 29.9173,
      demElevationM: 74,
      subBasinId: "izmit_sapanca_trench",
      urbanFraction: 0.84,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "basin_floor"
    },
    "17068": {
      stationId: 17068,
      nameTr: "Cengiz Topel Havalimanı (LTBQ)",
      lat: 40.7332,
      lon: 30.0948,
      demElevationM: 70,
      subBasinId: "izmit_sapanca_trench",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "basin_floor"
    },
    "17067": {
      stationId: 17067,
      nameTr: "Gölcük Körfez Güney Kıyı",
      lat: 40.7266,
      lon: 29.8063,
      demElevationM: 18,
      subBasinId: "izmit_sapanca_trench",
      urbanFraction: 0.76,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "coastal_or_gap"
    },
    "18413": {
      stationId: 18413,
      nameTr: "Kartepe İlçe Merkezi (Ova Tabanı)",
      lat: 40.7106,
      lon: 30.025,
      demElevationM: 80,
      subBasinId: "izmit_sapanca_trench",
      urbanFraction: 0.55,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "basin_floor"
    },
    "17639": {
      stationId: 17639,
      nameTr: "Gebze Batı Plato",
      lat: 40.8227,
      lon: 29.4345,
      demElevationM: 176,
      subBasinId: "gebze_dilovasi_plateau",
      urbanFraction: 0.85,
      coldPoolSusceptibility: 0.2,
      verticalStratumRole: "mid_slope"
    },
    "19115": {
      stationId: 19115,
      nameTr: "Çayırova (TR-41 Batı Sınırı)",
      lat: 40.8485,
      lon: 29.3988,
      demElevationM: 152,
      subBasinId: "gebze_dilovasi_plateau",
      urbanFraction: 0.86,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "mid_slope"
    },
    "18104": {
      stationId: 18104,
      nameTr: "Kandıra Karadeniz Eşiği",
      lat: 41.0617,
      lon: 30.1317,
      demElevationM: 40,
      subBasinId: "kandira_black_sea_shelf",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "coastal_or_gap"
    },
    "18801": {
      stationId: 18801,
      nameTr: "Başiskele / Yuvacık Orman Sahası",
      lat: 40.5967,
      lon: 29.9508,
      demElevationM: 1045,
      subBasinId: "samanli_kartepe_alpine",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.2,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17630": {
      stationId: 17630,
      nameTr: "Kartepe Kayak Merkezi (1320m–1602m Zirve)",
      lat: 40.6557,
      lon: 30.0954,
      demElevationM: 1320,
      subBasinId: "samanli_kartepe_alpine",
      urbanFraction: 0.05,
      coldPoolSusceptibility: 0.16,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [12, 75, 650, 1602],
    maxPhysicalPeakM: 1699,
    snowElevationBands: HYPSO_TR_41.bands
  },
  waterBodies: [
    {
      id: "black_sea_kandira_kefken",
      labelTr: "Batı Karadeniz (Kandıra – Kefken Açık DEK Havzası)",
      kind: "open_sea",
      mgmMarineStationIds: [17449],
      sampleCoord: { lat: 41.28, lon: 30.24 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.0,
      monthlyWaterTempNormalsC: [
        8.7, 7.9, 8.5, 11.4, 16.2, 21.3, 24.4, 25.1, 22.3, 18.2, 13.9, 10.5
      ],
      subBasinInfluenceWeights: {
        kandira_black_sea_shelf: 0.96,
        samanli_kartepe_alpine: 0.82,
        izmit_sapanca_trench: 0.56,
        gebze_dilovasi_plateau: 0.52
      },
      onshoreWindSectorDeg: { fromDeg: 335, toDeg: 60 },
      effectiveFetchKm: 440,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 11.0,
      dekHeavyDeltaTC: 13.5,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 5, toDeg: 50 },
        maxInlandPenetrationKm: 24,
        maxCoolingAmplitudeC: 2.5
      }
    },
    {
      id: "izmit_gulf_marmara",
      labelTr: "İzmit Körfezi (Doğu Marmara İç Deniz Oluğu)",
      kind: "inland_sea",
      mgmMarineStationIds: [],
      sampleCoord: { lat: 40.742, lon: 29.785 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.2,
      monthlyWaterTempNormalsC: [
        9.6, 9.0, 9.9, 12.8, 17.4, 22.0, 24.5, 24.9, 22.2, 18.2, 14.3, 11.2
      ],
      subBasinInfluenceWeights: {
        izmit_sapanca_trench: 0.88,
        gebze_dilovasi_plateau: 0.72,
        samanli_kartepe_alpine: 0.48,
        kandira_black_sea_shelf: 0.1
      },
      onshoreWindSectorDeg: { fromDeg: 250, toDeg: 315 },
      effectiveFetchKm: 65,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 12.5,
      dekHeavyDeltaTC: 15.0,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 255, toDeg: 295 },
        maxInlandPenetrationKm: 18,
        maxCoolingAmplitudeC: 2.0
      }
    }
  ],
  directionalBarriers: [
    {
      id: "samanli_kartepe_orographic_wall",
      labelTr: "Samanlı Dağları / Kartepe (1602m) Kuzey DEK Kar Duvarı & Lodos Fön Bariyeri",
      effectiveBarrierHeightM: 1602,
      crestPressureHpa: 850,
      applicableSubBasins: [
        "samanli_kartepe_alpine",
        "izmit_sapanca_trench",
        "gebze_dilovasi_plateau"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 175, toDeg: 235 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.42,
        sourcePlateauElevationM: 960,
        maxTargetElevationM: 220,
        maxWarmingCapC: 4.8,
        subCloudVirgaFactor: 0.74,
        wetCutoffMmHr: 2.0
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 330, toDeg: 55 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.24,
        maxPrecipMultiplierCap: 1.88
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 180, toDeg: 230 },
        precipAttenuationFactor: 0.68
      }
    }
  ],
  venturiCorridors: [
    {
      id: "izmit_sapanca_tectonic_channel",
      labelTr: "İzmit Körfezi – Sapanca Doğu-Batı Tektonik Kanalı",
      centerCoord: { lat: 40.745, lon: 29.96 },
      influenceRadiusKm: 16,
      channelAxisFromDeg: 85,
      bidirectional: true,
      sectorHalfWidthDeg: 22,
      speedMultiplier: 1.24,
      gustMultiplier: 1.36,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 35,
    coldPoolMaxDepthM: 380,
    topographicEnclosureIndex: 0.72,
    deltaPressureTopHpa: 42,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 3.4
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.72
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 45, toDeg: 115 },
      minWindShearVs850Deg: 50
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.34,
    invertedVDryMicroburstSusceptibility: 0.28,
    coastalWaterspoutSusceptibility: 0.56
  },
  stencil9Points: [
    {
      key: "target_izmit",
      labelTr: "İzmit Merkez (WMO 17066)",
      lat: 40.7663,
      lon: 29.9173,
      elevationM: 74,
      role: "target"
    },
    {
      key: "kandira_black_sea_dek",
      labelTr: "Kefken / Kandıra Açık Karadeniz DEK Kaynağı",
      lat: 41.28,
      lon: 30.24,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "izmit_gulf_west_corridor",
      labelTr: "İzmit Körfezi Batı Girişi (Darıca–Dilovası)",
      lat: 40.76,
      lon: 29.52,
      elevationM: 0,
      role: "corridor"
    },
    {
      key: "kartepe_summit_1602",
      labelTr: "Kartepe Zirve (1602m) Orografik Kar Duvarı",
      lat: 40.6557,
      lon: 30.0954,
      elevationM: 1602,
      role: "orographic_wall"
    },
    {
      key: "yuvacik_samanli_crest",
      labelTr: "Yuvacık / Samanlı Dağ Sırtı (1045m)",
      lat: 40.5967,
      lon: 29.9508,
      elevationM: 1045,
      role: "orographic_wall"
    },
    {
      key: "samanli_south_foehn_upwind",
      labelTr: "Samanlı Güney Yamaç Lodos Rüzgârüstü",
      lat: 40.57,
      lon: 29.85,
      elevationM: 720,
      role: "foehn_windward"
    },
    {
      key: "cengiz_topel_sapanca_gap",
      labelTr: "Cengiz Topel (LTBQ) – Sapanca Oluk Eşiği",
      lat: 40.7332,
      lon: 30.0948,
      elevationM: 70,
      role: "corridor"
    },
    {
      key: "kandira_inland_shelf",
      labelTr: "Kandıra İç Plato Geçişi",
      lat: 41.0617,
      lon: 30.1317,
      elevationM: 40,
      role: "marine_upwind"
    },
    {
      key: "golcuk_lee_floor",
      labelTr: "Gölcük – Başiskele Fön İniş Tabanı",
      lat: 40.7266,
      lon: 29.8063,
      elevationM: 18,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -20,
    maxPlausibleTempC: 45,
    minPlausibleMslpHpa: 972,
    maxPlausibleMslpHpa: 1052,
    kalmanTempBiasCapC: 4.8
  }
});

export default PROVINCE_SPEC_TR_41;
