import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_17 = TR81_CLIMATOLOGY_1991_2020["TR-17"];
const HYPSO_TR_17 = TR81_HYPSOMETRIC_PROFILES["TR-17"];

/**
 * ATMOS v5.0 — Wave 3A (REG-01) Bespoke Microclimate Spec: TR-17 Çanakkale
 *
 * Key Physical Mechanisms:
 *  1. Dardanelles (Çanakkale Boğazı) NE–SW Bidirectional Venturi Jet:
 *     Channel axis ~42.5° (covering 35°–55° Poyraz & 205°–235° Lodos) with `speedMultiplier: 1.34`,
 *     `gustMultiplier: 1.42`, and turbulent suppression of nocturnal surface inversions along the strait.
 *  2. Kaz Dağları (Ida Massif, 1,774 m) Dual Orographic / Foehn Barrier:
 *     Southerly Aegean moisture convergence & upslope enhancement on Ayvacık / southern slopes,
 *     paired with adiabatic Foehn warming & sub-cloud virga in the northern Bayramiç–Ezine–Çan lee basin.
 *  3. Pure Open-Marine North Aegean Island Regime (Gökçeada 17110 & Bozcaada 17111):
 *     High maritime thermal inertia decoupled from sheltered Biga–Yenice inland frost hollows.
 */
const SPEC_TR_17: ProvinceSpec = {
  provinceCode: "TR-17",
  plateCode: 17,
  slug: "canakkale",
  nameTr: "Çanakkale",
  region: "MARMARA",
  climateRegion: "MARMARA",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "MARMARA_COASTAL_TRANSITION",
  icaoWhitelist: ["LTBH"],
  domainBounds: {
    minLat: 39.4532,
    maxLat: 40.762,
    minLon: 25.6655,
    maxLon: 27.5487
  },
  primaryCenter: {
    mgmMerkezId: 91701,
    mgmIstNo: 17112,
    mgmSaatlikIstNo: 17112,
    mgmGunlukIstNo: 91701,
    wmoId: "17112",
    lat: 40.141,
    lon: 26.3993,
    demVerifiedElevationM: 6,
    subBasinId: "dardanelles_strait",
    urbanFraction: 0.68,
    monthlyTmaxNormalsC: CLIM_TR_17.tmaxC,
    monthlyTminNormalsC: CLIM_TR_17.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-17-canakkale-kordon",
      name: "Çanakkale Boğaz / Kordon (WMO 17112)",
      role: "coast",
      lat: 40.141,
      lon: 26.3993,
      elevationM: 6
    },
    {
      id: "tr-17-gokceada",
      name: "Gökçeada (Kuzey Ege Açık Deniz)",
      role: "coast",
      lat: 40.2,
      lon: 25.88,
      elevationM: 79
    },
    {
      id: "tr-17-bozcaada",
      name: "Bozcaada",
      role: "coast",
      lat: 39.8326,
      lon: 26.0728,
      elevationM: 30
    },
    {
      id: "tr-17-biga-yenice-havza",
      name: "Yenice – Çan İç Havza",
      role: "plain",
      lat: 39.9344,
      lon: 27.2661,
      elevationM: 252
    },
    {
      id: "tr-17-ayvacik-yamac",
      name: "Ayvacık – Assos Plato Yamacı",
      role: "foothill",
      lat: 39.6081,
      lon: 26.3958,
      elevationM: 341
    },
    {
      id: "tr-17-kazdaglari-zirve",
      name: "Kazdağları Kuzey Sırtı (Bayramiç)",
      role: "summit",
      lat: 39.7633,
      lon: 26.8164,
      elevationM: 1450
    }
  ],
  subBasins: [
    {
      id: "dardanelles_strait",
      labelTr: "Çanakkale Boğazı Kanalı (Merkez – Eceabat – Gelibolu – Lapseki)",
      polygonOrBbox: { minLat: 40.0, maxLat: 40.5, minLon: 26.18, maxLon: 26.82 },
      elevationRangeM: [0, 140],
      defaultZone: "strait_corridor",
      defaultUrbanFraction: 0.56
    },
    {
      id: "north_aegean_islands",
      labelTr: "Gökçeada – Bozcaada & Troya Açık Ege Kıyısı",
      polygonOrBbox: { minLat: 39.68, maxLat: 40.26, minLon: 25.66, maxLon: 26.32 },
      elevationRangeM: [0, 390],
      defaultZone: "peninsula_exposed",
      defaultUrbanFraction: 0.22
    },
    {
      id: "saros_gelibolu",
      labelTr: "Gelibolu Kuzey Sırtı & Saros Körfezi Kıyısı",
      polygonOrBbox: { minLat: 40.42, maxLat: 40.762, minLon: 26.25, maxLon: 26.95 },
      elevationRangeM: [0, 360],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.25
    },
    {
      id: "biga_can_interior",
      labelTr: "Biga – Çan – Yenice – Bayramiç İç Havza",
      polygonOrBbox: { minLat: 39.78, maxLat: 40.46, minLon: 26.52, maxLon: 27.5487 },
      elevationRangeM: [25, 560],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.31
    },
    {
      id: "kazdaglari_massif",
      labelTr: "Kazdağları Kütlesi & Ayvacık Güneybatı Yamaç",
      polygonOrBbox: { minLat: 39.4532, maxLat: 39.84, minLon: 26.05, maxLon: 27.18 },
      elevationRangeM: [240, 1774],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.09
    }
  ],
  barrierCouplingMatrix: {
    dardanelles_strait: {
      dardanelles_strait: 1.0,
      north_aegean_islands: 0.72,
      saros_gelibolu: 0.76,
      biga_can_interior: 0.38,
      kazdaglari_massif: 0.18
    },
    north_aegean_islands: {
      dardanelles_strait: 0.72,
      north_aegean_islands: 1.0,
      saros_gelibolu: 0.68,
      biga_can_interior: 0.22,
      kazdaglari_massif: 0.26
    },
    saros_gelibolu: {
      dardanelles_strait: 0.76,
      north_aegean_islands: 0.68,
      saros_gelibolu: 1.0,
      biga_can_interior: 0.34,
      kazdaglari_massif: 0.14
    },
    biga_can_interior: {
      dardanelles_strait: 0.38,
      north_aegean_islands: 0.22,
      saros_gelibolu: 0.34,
      biga_can_interior: 1.0,
      kazdaglari_massif: 0.44
    },
    kazdaglari_massif: {
      dardanelles_strait: 0.18,
      north_aegean_islands: 0.26,
      saros_gelibolu: 0.14,
      biga_can_interior: 0.44,
      kazdaglari_massif: 1.0
    }
  },
  stationOverrides: {
    "17112": {
      stationId: 17112,
      nameTr: "Çanakkale Merkez (WMO 17112)",
      lat: 40.141,
      lon: 26.3993,
      demElevationM: 6,
      subBasinId: "dardanelles_strait",
      urbanFraction: 0.68,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "coastal_or_gap"
    },
    LTBH: {
      stationId: "LTBH",
      nameTr: "Çanakkale Havalimanı (LTBH)",
      lat: 40.1377,
      lon: 26.4268,
      demElevationM: 7,
      subBasinId: "dardanelles_strait",
      urbanFraction: 0.52,
      coldPoolSusceptibility: 0.2,
      verticalStratumRole: "coastal_or_gap"
    },
    "17110": {
      stationId: 17110,
      nameTr: "Gökçeada",
      lat: 40.2,
      lon: 25.88,
      demElevationM: 79,
      subBasinId: "north_aegean_islands",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17111": {
      stationId: 17111,
      nameTr: "Bozcaada",
      lat: 39.8326,
      lon: 26.0728,
      demElevationM: 30,
      subBasinId: "north_aegean_islands",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.05,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17773": {
      stationId: 17773,
      nameTr: "Gelibolu",
      lat: 40.4081,
      lon: 26.6417,
      demElevationM: 51,
      subBasinId: "dardanelles_strait",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.15,
      verticalStratumRole: "coastal_or_gap"
    },
    "18580": {
      stationId: 18580,
      nameTr: "Eceabat",
      lat: 40.2019,
      lon: 26.2669,
      demElevationM: 9,
      subBasinId: "dardanelles_strait",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "coastal_or_gap"
    },
    "18438": {
      stationId: 18438,
      nameTr: "Lapseki",
      lat: 40.34,
      lon: 26.6964,
      demElevationM: 40,
      subBasinId: "dardanelles_strait",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "coastal_or_gap"
    },
    "18435": {
      stationId: 18435,
      nameTr: "Ayvacık",
      lat: 39.6081,
      lon: 26.3958,
      demElevationM: 341,
      subBasinId: "kazdaglari_massif",
      urbanFraction: 0.25,
      coldPoolSusceptibility: 0.32,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18436": {
      stationId: 18436,
      nameTr: "Bayramiç",
      lat: 39.8147,
      lon: 26.5906,
      demElevationM: 92,
      subBasinId: "biga_can_interior",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18085": {
      stationId: 18085,
      nameTr: "Yenice",
      lat: 39.9344,
      lon: 27.2661,
      demElevationM: 252,
      subBasinId: "biga_can_interior",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18437": {
      stationId: 18437,
      nameTr: "Çan",
      lat: 40.0161,
      lon: 27.0564,
      demElevationM: 139,
      subBasinId: "biga_can_interior",
      urbanFraction: 0.4,
      coldPoolSusceptibility: 0.74,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18084": {
      stationId: 18084,
      nameTr: "Biga",
      lat: 40.2331,
      lon: 27.2636,
      demElevationM: 34,
      subBasinId: "biga_can_interior",
      urbanFraction: 0.46,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [8, 180, 720, 1774],
    maxPhysicalPeakM: HYPSO_TR_17.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_17.bands
  },
  waterBodies: [
    {
      id: "north_aegean_open",
      labelTr: "Kuzey Ege Denizi (Gökçeada – Bozcaada Açıkları)",
      kind: "open_sea",
      mgmMarineStationIds: [17110, 17111, 17440],
      sampleCoord: { lat: 39.98, lon: 25.92 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.9,
      monthlyWaterTempNormalsC: [
        13.4, 12.9, 13.3, 15.1, 18.4, 22.3, 24.6, 25.0, 22.8, 19.6, 16.5, 14.4
      ],
      subBasinInfluenceWeights: {
        north_aegean_islands: 0.96,
        saros_gelibolu: 0.78,
        dardanelles_strait: 0.52,
        kazdaglari_massif: 0.48,
        biga_can_interior: 0.08
      },
      onshoreWindSectorDeg: { fromDeg: 195, toDeg: 335 },
      effectiveFetchKm: 240,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 13.0,
      dekHeavyDeltaTC: 16.0,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 245, toDeg: 315 },
        maxInlandPenetrationKm: 28,
        maxCoolingAmplitudeC: 3.4
      }
    },
    {
      id: "dardanelles_strait_water",
      labelTr: "Çanakkale Boğazı (Nara – Kilitbahir Kanalı)",
      kind: "inland_sea",
      mgmMarineStationIds: [17112, 17773],
      sampleCoord: { lat: 40.15, lon: 26.38 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.4,
      monthlyWaterTempNormalsC: [
        10.4, 9.8, 10.6, 13.4, 17.5, 21.8, 24.1, 24.4, 21.6, 17.8, 14.1, 11.6
      ],
      subBasinInfluenceWeights: {
        dardanelles_strait: 0.92,
        north_aegean_islands: 0.35,
        saros_gelibolu: 0.42,
        biga_can_interior: 0.12,
        kazdaglari_massif: 0.05
      },
      onshoreWindSectorDeg: { fromDeg: 25, toDeg: 65 },
      effectiveFetchKm: 68,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 13.0,
      dekHeavyDeltaTC: 16.0,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 215, toDeg: 260 },
        maxInlandPenetrationKm: 18,
        maxCoolingAmplitudeC: 2.6
      }
    },
    {
      id: "southwest_marmara_gate",
      labelTr: "Güneybatı Marmara Denizi (Lapseki – Karabiga Çıkışı)",
      kind: "inland_sea",
      mgmMarineStationIds: [18438, 18084],
      sampleCoord: { lat: 40.48, lon: 27.12 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.3,
      monthlyWaterTempNormalsC: [
        9.2, 8.6, 9.6, 12.8, 17.2, 21.9, 24.3, 24.6, 21.5, 17.4, 13.4, 10.6
      ],
      subBasinInfluenceWeights: {
        dardanelles_strait: 0.44,
        biga_can_interior: 0.38,
        saros_gelibolu: 0.3,
        north_aegean_islands: 0.05,
        kazdaglari_massif: 0.06
      },
      onshoreWindSectorDeg: { fromDeg: 15, toDeg: 75 },
      effectiveFetchKm: 135,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 12.5,
      dekHeavyDeltaTC: 15.5,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 15, toDeg: 65 },
        maxInlandPenetrationKm: 24,
        maxCoolingAmplitudeC: 2.8
      }
    }
  ],
  directionalBarriers: [
    {
      id: "kazdaglari_south_windward_ayvacik",
      labelTr: "Kaz Dağları (1774m) Ayvacık Güney Cephe Orografik Yağış Kalkanı",
      effectiveBarrierHeightM: 1774,
      crestPressureHpa: 800,
      applicableSubBasins: ["kazdaglari_massif", "north_aegean_islands"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 15, toDeg: 65 },
        minCrossCrestSpeedMs: 10.5,
        minFroudeNumber: 0.9,
        sourcePlateauElevationM: 220,
        maxTargetElevationM: 400,
        maxWarmingCapC: 3.2,
        subCloudVirgaFactor: 0.76,
        wetCutoffMmHr: 1.4
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 160, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 7.0,
        coastalFrictionalConvergenceBoost: 1.22,
        maxPrecipMultiplierCap: 1.84
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 15, toDeg: 60 },
        precipAttenuationFactor: 0.76
      }
    },
    {
      id: "kazdaglari_north_lee_bayramic_can",
      labelTr: "Kaz Dağları Kuzey Fön Gölgesi (Bayramiç – Ezine – Çan) & Poyraz Kar Duvarı",
      effectiveBarrierHeightM: 1774,
      crestPressureHpa: 800,
      applicableSubBasins: ["biga_can_interior", "dardanelles_strait"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 225 },
        minCrossCrestSpeedMs: 9.0,
        minFroudeNumber: 0.85,
        sourcePlateauElevationM: 20,
        maxTargetElevationM: 420,
        maxWarmingCapC: 4.8,
        subCloudVirgaFactor: 0.68,
        wetCutoffMmHr: 1.8
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 15, toDeg: 65 },
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 1.16,
        maxPrecipMultiplierCap: 1.58
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 165, toDeg: 215 },
        precipAttenuationFactor: 0.72
      }
    }
  ],
  venturiCorridors: [
    {
      id: "dardanelles_ne_sw_venturi",
      labelTr: "Çanakkale Boğazı NE Poyraz (35°–55°) & SW Lodos (205°–235°) Venturi Kanalı",
      centerCoord: { lat: 40.165, lon: 26.405 },
      influenceRadiusKm: 36,
      channelAxisFromDeg: 42.5,
      bidirectional: true,
      sectorHalfWidthDeg: 18,
      speedMultiplier: 1.34,
      gustMultiplier: 1.42,
      suppressesNocturnalInversion: true
    },
    {
      id: "bozcaada_strait_exit_jet",
      labelTr: "Seddülbahir – Bozcaada Boğaz Çıkış Jet Uzantısı",
      centerCoord: { lat: 39.95, lon: 26.14 },
      influenceRadiusKm: 26,
      channelAxisFromDeg: 44,
      bidirectional: true,
      sectorHalfWidthDeg: 20,
      speedMultiplier: 1.24,
      gustMultiplier: 1.32,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 92,
    coldPoolMaxDepthM: 240,
    topographicEnclosureIndex: 0.44,
    deltaPressureTopHpa: 975,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 2.5,
      maxExtraRadiativeCoolingC: 3.2
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.76
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 15, toDeg: 65 },
      minWindShearVs850Deg: 45
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.62,
    invertedVDryMicroburstSusceptibility: 0.28,
    coastalWaterspoutSusceptibility: 0.58
  },
  stencil9Points: [
    {
      key: "center_dardanelles_17112",
      labelTr: "Çanakkale Merkez Boğaz (WMO 17112)",
      lat: 40.141,
      lon: 26.3993,
      elevationM: 6,
      role: "target"
    },
    {
      key: "gelibolu_ne_inflow",
      labelTr: "Gelibolu Boğaz Kuzey Girişi",
      lat: 40.4081,
      lon: 26.6417,
      elevationM: 51,
      role: "corridor"
    },
    {
      key: "eceabat_nara_narrows",
      labelTr: "Eceabat – Kilitbahir Boğaz Daralması",
      lat: 40.2019,
      lon: 26.2669,
      elevationM: 9,
      role: "corridor"
    },
    {
      key: "gokceada_open_aegean",
      labelTr: "Gökçeada Kuzey Ege Denizel Giriş",
      lat: 40.2,
      lon: 25.88,
      elevationM: 79,
      role: "marine_upwind"
    },
    {
      key: "bozcaada_sw_inflow",
      labelTr: "Bozcaada Lodos Denizel Giriş",
      lat: 39.8326,
      lon: 26.0728,
      elevationM: 30,
      role: "marine_upwind"
    },
    {
      key: "ayvacik_south_windward",
      labelTr: "Ayvacık – Küçükkuyu Güney Rüzgar-Üstü",
      lat: 39.6081,
      lon: 26.3958,
      elevationM: 341,
      role: "foehn_windward"
    },
    {
      key: "kazdaglari_crest",
      labelTr: "Kazdağları Zirve Sırtı",
      lat: 39.7083,
      lon: 26.8364,
      elevationM: 1450,
      role: "orographic_wall"
    },
    {
      key: "bayramic_lee_basin",
      labelTr: "Bayramiç Kuzey Fön Gölgesi",
      lat: 39.8147,
      lon: 26.5906,
      elevationM: 92,
      role: "lee_shadow"
    },
    {
      key: "yenice_inland_hollow",
      labelTr: "Yenice – Çan İç Ayaz Çanağı",
      lat: 39.9344,
      lon: 27.2661,
      elevationM: 252,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -18,
    maxPlausibleTempC: 44,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1044,
    kalmanTempBiasCapC: 3.2
  }
};

export const PROVINCE_SPEC_TR_17: ProvinceSpec = Object.freeze(SPEC_TR_17);
export default PROVINCE_SPEC_TR_17;
