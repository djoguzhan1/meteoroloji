import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_34 = TR81_CLIMATOLOGY_1991_2020["TR-34"];
const HYPSO_TR_34 = TR81_HYPSOMETRIC_PROFILES["TR-34"];

/**
 * Metropolitan Istanbul Urban Canopy Layer (UCL) Heat Island specification.
 * Models nocturnal canopy thermal retention across high-imperviousness Marmara/Bosphorus cores
 * relative to rural Çatalca–Silivri–Şile forest baselines (`maxCanopyWarmingC = 3.1°C`).
 */
export const TR_34_UHI_CANOPY_SPEC = Object.freeze({
  maxCanopyWarmingC: 3.1,
  coreUrbanSubBasinIds: ["marmara_urban_core", "bosphorus_strait"] as const,
  ruralReferenceSubBasinIds: ["catalca_silivri_rural", "black_sea_north_belt"] as const
});

export const PROVINCE_SPEC_TR_34: ProvinceSpec = Object.freeze<ProvinceSpec>({
  provinceCode: "TR-34",
  plateCode: 34,
  slug: "istanbul",
  nameTr: "İstanbul",
  region: "MARMARA",
  climateRegion: "MARMARA",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "MARMARA_COASTAL_TRANSITION",
  icaoWhitelist: ["LTFM", "LTBA", "LTFJ"],
  domainBounds: {
    minLat: 40.8,
    maxLat: 41.58,
    minLon: 27.97,
    maxLon: 29.96
  },
  primaryCenter: {
    mgmMerkezId: 93401,
    mgmIstNo: 17060,
    mgmSaatlikIstNo: 17060,
    mgmGunlukIstNo: 93401,
    wmoId: "17060",
    lat: 40.9669,
    lon: 28.8156,
    demVerifiedElevationM: 33,
    subBasinId: "marmara_urban_core",
    urbanFraction: 0.94,
    monthlyTmaxNormalsC: CLIM_TR_34.tmaxC,
    monthlyTminNormalsC: CLIM_TR_34.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-34-kadikoy-boğaz-sahil",
      name: "Kadıköy / Boğaz Sahil Hattı",
      role: "coast",
      lat: 40.9883,
      lon: 29.019,
      elevationM: 8
    },
    {
      id: "tr-34-sisli-metropol-merkez",
      name: "Şişli – Fatih Metropol Çekirdeği (UHI)",
      role: "plain",
      lat: 41.0547,
      lon: 28.9683,
      elevationM: 60
    },
    {
      id: "tr-34-basaksehir-camlica-sirti",
      name: "Çamlıca / Başakşehir Kuzey Sırtı",
      role: "foothill",
      lat: 41.0275,
      lon: 29.0685,
      elevationM: 235
    },
    {
      id: "tr-34-aydos-catalca-zirve",
      name: "Aydos Tepesi (537m) & Çatalca Radar Sırtı",
      role: "summit",
      lat: 40.9321,
      lon: 29.2286,
      elevationM: 537
    }
  ],
  subBasins: [
    {
      id: "black_sea_north_belt",
      labelTr: "Karadeniz Kuzey Kıyı & Belgrad–Şile DEK Kuşağı",
      polygonOrBbox: {
        minLat: 41.12,
        maxLat: 41.52,
        minLon: 28.52,
        maxLon: 29.92
      },
      elevationRangeM: [0, 260],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.24
    },
    {
      id: "bosphorus_strait",
      labelTr: "İstanbul Boğazı Venturi Kanalı (Sarıyer–Beşiktaş–Üsküdar–Beykoz)",
      polygonOrBbox: {
        minLat: 41.0,
        maxLat: 41.24,
        minLon: 28.96,
        maxLon: 29.16
      },
      elevationRangeM: [0, 190],
      defaultZone: "strait_corridor",
      defaultUrbanFraction: 0.86
    },
    {
      id: "marmara_urban_core",
      labelTr: "Marmara Metropol Çekirdeği & Yoğun UHI Kuşağı",
      polygonOrBbox: {
        minLat: 40.81,
        maxLat: 41.08,
        minLon: 28.56,
        maxLon: 29.32
      },
      elevationRangeM: [0, 130],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.95
    },
    {
      id: "aydos_camlica_highlands",
      labelTr: "Aydos (537m) – Çamlıca – Başakşehir İç Yüksek Sırtları",
      polygonOrBbox: {
        minLat: 40.91,
        maxLat: 41.16,
        minLon: 28.72,
        maxLon: 29.38
      },
      elevationRangeM: [130, 537],
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.62
    },
    {
      id: "catalca_silivri_rural",
      labelTr: "Çatalca – Binkılıç – Silivri Trakya Soğuk Giriş Platosu",
      polygonOrBbox: {
        minLat: 41.02,
        maxLat: 41.46,
        minLon: 27.98,
        maxLon: 28.56
      },
      elevationRangeM: [20, 410],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.14
    }
  ],
  barrierCouplingMatrix: {
    black_sea_north_belt: {
      black_sea_north_belt: 1.0,
      bosphorus_strait: 0.82,
      marmara_urban_core: 0.48,
      aydos_camlica_highlands: 0.68,
      catalca_silivri_rural: 0.72
    },
    bosphorus_strait: {
      black_sea_north_belt: 0.82,
      bosphorus_strait: 1.0,
      marmara_urban_core: 0.79,
      aydos_camlica_highlands: 0.74,
      catalca_silivri_rural: 0.44
    },
    marmara_urban_core: {
      black_sea_north_belt: 0.48,
      bosphorus_strait: 0.79,
      marmara_urban_core: 1.0,
      aydos_camlica_highlands: 0.66,
      catalca_silivri_rural: 0.52
    },
    aydos_camlica_highlands: {
      black_sea_north_belt: 0.68,
      bosphorus_strait: 0.74,
      marmara_urban_core: 0.66,
      aydos_camlica_highlands: 1.0,
      catalca_silivri_rural: 0.56
    },
    catalca_silivri_rural: {
      black_sea_north_belt: 0.72,
      bosphorus_strait: 0.44,
      marmara_urban_core: 0.52,
      aydos_camlica_highlands: 0.56,
      catalca_silivri_rural: 1.0
    }
  },
  stationOverrides: {
    "17060": {
      stationId: 17060,
      nameTr: "Bakırköy / Atatürk Havalimanı (WMO 17060)",
      lat: 40.9669,
      lon: 28.8156,
      demElevationM: 33,
      subBasinId: "marmara_urban_core",
      urbanFraction: 0.94,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "coastal_or_gap"
    },
    "17058": {
      stationId: 17058,
      nameTr: "İstanbul Havalimanı (LTFM Kuzey Kuşak)",
      lat: 41.2647,
      lon: 28.7288,
      demElevationM: 99,
      subBasinId: "black_sea_north_belt",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "coastal_or_gap"
    },
    "17063": {
      stationId: 17063,
      nameTr: "Pendik / Sabiha Gökçen Havalimanı (LTFJ)",
      lat: 40.8928,
      lon: 29.2972,
      demElevationM: 99,
      subBasinId: "marmara_urban_core",
      urbanFraction: 0.72,
      coldPoolSusceptibility: 0.25,
      verticalStratumRole: "basin_floor"
    },
    "18401": {
      stationId: 18401,
      nameTr: "Şişli (Yoğun Metropol UHI)",
      lat: 41.0547,
      lon: 28.9683,
      demElevationM: 63,
      subBasinId: "marmara_urban_core",
      urbanFraction: 0.97,
      coldPoolSusceptibility: 0.06,
      verticalStratumRole: "basin_floor"
    },
    "17061": {
      stationId: 17061,
      nameTr: "Sarıyer (Boğaz Kuzey Girişi)",
      lat: 41.1465,
      lon: 29.0502,
      demElevationM: 59,
      subBasinId: "bosphorus_strait",
      urbanFraction: 0.68,
      coldPoolSusceptibility: 0.1,
      verticalStratumRole: "coastal_or_gap"
    },
    "17059": {
      stationId: 17059,
      nameTr: "Sarıyer / Kumköy–Kilyos Karadeniz Kıyı",
      lat: 41.2505,
      lon: 29.0384,
      demElevationM: 38,
      subBasinId: "black_sea_north_belt",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "coastal_or_gap"
    },
    "17610": {
      stationId: 17610,
      nameTr: "Şile Karadeniz Kıyı",
      lat: 41.1689,
      lon: 29.6005,
      demElevationM: 83,
      subBasinId: "black_sea_north_belt",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "coastal_or_gap"
    },
    "18403": {
      stationId: 18403,
      nameTr: "Ümraniye / Çamlıca Doğu Sırtı",
      lat: 41.0294,
      lon: 29.1382,
      demElevationM: 191,
      subBasinId: "aydos_camlica_highlands",
      urbanFraction: 0.82,
      coldPoolSusceptibility: 0.15,
      verticalStratumRole: "mid_slope"
    },
    "18402": {
      stationId: 18402,
      nameTr: "Arnavutköy / Başakşehir Kuzey Sırtı",
      lat: 41.2211,
      lon: 28.7079,
      demElevationM: 140,
      subBasinId: "aydos_camlica_highlands",
      urbanFraction: 0.45,
      coldPoolSusceptibility: 0.26,
      verticalStratumRole: "mid_slope"
    },
    "19112": {
      stationId: 19112,
      nameTr: "Kartal / Aydos Dağı",
      lat: 40.9321,
      lon: 29.2286,
      demElevationM: 321,
      subBasinId: "aydos_camlica_highlands",
      urbanFraction: 0.15,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "17047": {
      stationId: 17047,
      nameTr: "Çatalca Radar Sahası",
      lat: 41.3409,
      lon: 28.3568,
      demElevationM: 381,
      subBasinId: "catalca_silivri_rural",
      urbanFraction: 0.08,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18400": {
      stationId: 18400,
      nameTr: "Silivri Kırsal Plato",
      lat: 41.1853,
      lon: 28.1574,
      demElevationM: 195,
      subBasinId: "catalca_silivri_rural",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18100": {
      stationId: 18100,
      nameTr: "Tuzla Marmara Kıyı (TR-34 Doğu Sınırı)",
      lat: 40.8276,
      lon: 29.2928,
      demElevationM: 5,
      subBasinId: "marmara_urban_core",
      urbanFraction: 0.78,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "coastal_or_gap"
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [12, 55, 195, 537],
    maxPhysicalPeakM: 537,
    snowElevationBands: HYPSO_TR_34.bands
  },
  waterBodies: [
    {
      id: "sw_black_sea_istanbul",
      labelTr: "Güneybatı Karadeniz (Kilyos – Rumeli Feneri – Şile DEK Havzası)",
      kind: "open_sea",
      mgmMarineStationIds: [17059, 17455],
      sampleCoord: { lat: 41.36, lon: 29.08 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.0,
      monthlyWaterTempNormalsC: [
        8.6, 7.8, 8.4, 11.2, 16.0, 21.1, 24.2, 24.9, 22.1, 18.0, 13.8, 10.4
      ],
      subBasinInfluenceWeights: {
        black_sea_north_belt: 0.96,
        bosphorus_strait: 0.84,
        aydos_camlica_highlands: 0.72,
        catalca_silivri_rural: 0.64,
        marmara_urban_core: 0.46
      },
      onshoreWindSectorDeg: { fromDeg: 340, toDeg: 65 },
      effectiveFetchKm: 420,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 11.0,
      dekHeavyDeltaTC: 13.5,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 10, toDeg: 55 },
        maxInlandPenetrationKm: 22,
        maxCoolingAmplitudeC: 2.6
      }
    },
    {
      id: "sea_of_marmara_istanbul",
      labelTr: "Marmara Denizi Kuzey Havzası (Bakırköy – Adalar – Tuzla)",
      kind: "inland_sea",
      mgmMarineStationIds: [17454, 17437, 17448, 17388],
      sampleCoord: { lat: 40.91, lon: 28.92 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.2,
      monthlyWaterTempNormalsC: [
        9.4, 8.8, 9.6, 12.4, 16.8, 21.4, 23.9, 24.4, 21.8, 17.9, 14.1, 11.0
      ],
      subBasinInfluenceWeights: {
        marmara_urban_core: 0.92,
        bosphorus_strait: 0.76,
        aydos_camlica_highlands: 0.42,
        catalca_silivri_rural: 0.34,
        black_sea_north_belt: 0.14
      },
      onshoreWindSectorDeg: { fromDeg: 150, toDeg: 245 },
      effectiveFetchKm: 78,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 12.5,
      dekHeavyDeltaTC: 15.0,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 185, toDeg: 235 },
        maxInlandPenetrationKm: 16,
        maxCoolingAmplitudeC: 2.1
      }
    }
  ],
  directionalBarriers: [
    {
      id: "aydos_north_ridge_dek_barrier",
      labelTr: "Aydos (537m) – Çamlıca – Istranca Kuzey Sırtları Karadeniz DEK & Kıyı Sürtünme Bariyeri",
      effectiveBarrierHeightM: 537,
      crestPressureHpa: 850,
      applicableSubBasins: [
        "black_sea_north_belt",
        "aydos_camlica_highlands",
        "bosphorus_strait",
        "catalca_silivri_rural"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 185, toDeg: 235 },
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.52,
        sourcePlateauElevationM: 320,
        maxTargetElevationM: 90,
        maxWarmingCapC: 2.4,
        subCloudVirgaFactor: 0.88,
        wetCutoffMmHr: 2.2
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 345, toDeg: 60 },
        minOnshoreOrUpslopeSpeedMs: 4.4,
        coastalFrictionalConvergenceBoost: 1.28,
        maxPrecipMultiplierCap: 1.62
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 185, toDeg: 235 },
        precipAttenuationFactor: 0.86
      }
    }
  ],
  venturiCorridors: [
    {
      id: "istanbul_bosphorus_venturi",
      labelTr: "İstanbul Boğazı Poyraz (15°–45°) & Lodos (195°–225°) Venturi Kanalı",
      centerCoord: { lat: 41.118, lon: 29.062 },
      influenceRadiusKm: 18,
      channelAxisFromDeg: 30,
      bidirectional: true,
      sectorHalfWidthDeg: 15,
      speedMultiplier: 1.34,
      gustMultiplier: 1.48,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 35,
    coldPoolMaxDepthM: 220,
    topographicEnclosureIndex: 0.32,
    deltaPressureTopHpa: 28,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 2.6
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.78
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 305, toDeg: 35 },
      minWindShearVs850Deg: 45
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.36,
    invertedVDryMicroburstSusceptibility: 0.24,
    coastalWaterspoutSusceptibility: 0.62
  },
  stencil9Points: [
    {
      key: "target_center",
      labelTr: "İstanbul Metropol Merkez (WMO 17060)",
      lat: 40.9669,
      lon: 28.8156,
      elevationM: 33,
      role: "target"
    },
    {
      key: "black_sea_dek_upwind_n",
      labelTr: "Karadeniz Açık DEK Kaynağı (Kuzey)",
      lat: 41.48,
      lon: 29.05,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "black_sea_dek_upwind_ne",
      labelTr: "Batı Karadeniz Poyraz DEK Koridoru (KD)",
      lat: 41.42,
      lon: 29.55,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "bosphorus_strait_jet",
      labelTr: "İstanbul Boğazı Venturi Ekseni",
      lat: 41.118,
      lon: 29.062,
      elevationM: 15,
      role: "corridor"
    },
    {
      key: "aydos_summit_wall",
      labelTr: "Aydos Tepesi (537m) Orografik Sırtı",
      lat: 40.9321,
      lon: 29.2286,
      elevationM: 537,
      role: "orographic_wall"
    },
    {
      key: "catalca_radar_ridge",
      labelTr: "Çatalca Radar / Binkılıç Trakya Sırtı (381m)",
      lat: 41.3409,
      lon: 28.3568,
      elevationM: 381,
      role: "orographic_wall"
    },
    {
      key: "marmara_lodos_upwind",
      labelTr: "Marmara Denizi Lodos & Nem Kaynağı",
      lat: 40.84,
      lon: 28.72,
      elevationM: 0,
      role: "foehn_windward"
    },
    {
      key: "camlica_basaksehir_mid",
      labelTr: "Çamlıca / Ümraniye Yüksek Kentsel Kuşak",
      lat: 41.0294,
      lon: 29.1382,
      elevationM: 191,
      role: "corridor"
    },
    {
      key: "tuzla_south_lee",
      labelTr: "Tuzla – Maltepe Güney Marmara Gölge Hattı",
      lat: 40.8276,
      lon: 29.2928,
      elevationM: 5,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -18,
    maxPlausibleTempC: 44,
    minPlausibleMslpHpa: 972,
    maxPlausibleMslpHpa: 1052,
    kalmanTempBiasCapC: 4.5
  }
});

export default PROVINCE_SPEC_TR_34;
