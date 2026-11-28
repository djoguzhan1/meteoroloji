import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_10 = TR81_CLIMATOLOGY_1991_2020["TR-10"];
const HYPSO_TR_10 = TR81_HYPSOMETRIC_PROFILES["TR-10"];

/**
 * Dual-Sea & Border Isolation Metadata for TR-10 Balıkesir (`WMO 17150` Tier-A).
 * Enforces strict separation from Bursa `TR-16` Karacabey/Mustafakemalpaşa (`LTBR` blocked).
 */
export const TR_10_CALIBRATION_ANCHOR_META = Object.freeze({
  wmoStationId: "17150",
  dualSeaIds: ["south_marmara_bandirma_sea", "north_aegean_edremit_gulf"] as const,
  blockedNeighborIcaos: ["LTBR", "LTBH", "LTBJ"] as const
});

export const PROVINCE_SPEC_TR_10: ProvinceSpec = Object.freeze<ProvinceSpec>({
  provinceCode: "TR-10",
  plateCode: 10,
  slug: "balikesir",
  nameTr: "Balıkesir",
  region: "MARMARA",
  climateRegion: "MARMARA",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "MARMARA_COASTAL_TRANSITION",
  icaoWhitelist: ["LTBG", "LTFD", "LTBF"],
  domainBounds: {
    minLat: 39.08,
    maxLat: 40.68,
    minLon: 26.52,
    maxLon: 28.94
  },
  primaryCenter: {
    mgmMerkezId: 91001,
    mgmIstNo: 18433,
    mgmSaatlikIstNo: 17150,
    mgmGunlukIstNo: 91001,
    wmoId: "17150",
    lat: 39.6504,
    lon: 27.886,
    demVerifiedElevationM: 110,
    subBasinId: "balikesir_susurluk_basin",
    urbanFraction: 0.62,
    monthlyTmaxNormalsC: CLIM_TR_10.tmaxC,
    monthlyTminNormalsC: CLIM_TR_10.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-10-edremit-bandirma-cift-kiyi",
      name: "Edremit Körfezi (Ege) & Bandırma (Marmara) Kıyı",
      role: "coast",
      lat: 39.5895,
      lon: 27.0194,
      elevationM: 18
    },
    {
      id: "tr-10-balikesir-susurluk-canagi",
      name: "Balıkesir Merkez – Susurluk İç Çanağı",
      role: "plain",
      lat: 39.6504,
      lon: 27.886,
      elevationM: 110
    },
    {
      id: "tr-10-dursunbey-yayla-yamac",
      name: "Dursunbey / Alaçam Dağları Yamaç Kuşağı",
      role: "foothill",
      lat: 39.5772,
      lon: 28.6347,
      elevationM: 651
    },
    {
      id: "tr-10-kazdaglari-karatas-zirve",
      name: "Kaz Dağları – Karataş Tepesi Sırtı (1774m)",
      role: "summit",
      lat: 39.6763,
      lon: 26.9201,
      elevationM: 1620
    }
  ],
  subBasins: [
    {
      id: "bandirma_erdek_marmara_coast",
      labelTr: "Bandırma – Erdek – Marmara Adası Poyraz Kıyısı",
      polygonOrBbox: {
        minLat: 40.08,
        maxLat: 40.67,
        minLon: 27.45,
        maxLon: 28.22
      },
      elevationRangeM: [0, 180],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.42
    },
    {
      id: "edremit_ayvalik_aegean_bay",
      labelTr: "Kuzey Ege / Edremit Körfezi (Ayvalık – Burhaniye – Edremit İmbat Kıyısı)",
      polygonOrBbox: {
        minLat: 39.18,
        maxLat: 39.62,
        minLon: 26.55,
        maxLon: 27.18
      },
      elevationRangeM: [0, 160],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.44
    },
    {
      id: "kazdaglari_south_wall",
      labelTr: "Kaz Dağları (1774m) Güney Orografik Duvarı & Kuzey Fön Sırtı",
      polygonOrBbox: {
        minLat: 39.6,
        maxLat: 39.8,
        minLon: 26.68,
        maxLon: 27.22
      },
      elevationRangeM: [350, 1774],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.04
    },
    {
      id: "balikesir_susurluk_basin",
      labelTr: "Balıkesir Merkez – Susurluk – Manyas İç Çanak Ayaz Havzası",
      polygonOrBbox: {
        minLat: 39.22,
        maxLat: 40.08,
        minLon: 27.42,
        maxLon: 28.36
      },
      elevationRangeM: [35, 420],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.46
    },
    {
      id: "dursunbey_east_highlands",
      labelTr: "Dursunbey – Kepsut Dalköy – Gediktepe Doğu Dağlık Yaylası",
      polygonOrBbox: {
        minLat: 39.32,
        maxLat: 39.82,
        minLon: 28.36,
        maxLon: 28.92
      },
      elevationRangeM: [450, 1650],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.14
    }
  ],
  barrierCouplingMatrix: {
    bandirma_erdek_marmara_coast: {
      bandirma_erdek_marmara_coast: 1.0,
      edremit_ayvalik_aegean_bay: 0.18,
      kazdaglari_south_wall: 0.24,
      balikesir_susurluk_basin: 0.64,
      dursunbey_east_highlands: 0.36
    },
    edremit_ayvalik_aegean_bay: {
      bandirma_erdek_marmara_coast: 0.18,
      edremit_ayvalik_aegean_bay: 1.0,
      kazdaglari_south_wall: 0.56,
      balikesir_susurluk_basin: 0.34,
      dursunbey_east_highlands: 0.16
    },
    kazdaglari_south_wall: {
      bandirma_erdek_marmara_coast: 0.24,
      edremit_ayvalik_aegean_bay: 0.56,
      kazdaglari_south_wall: 1.0,
      balikesir_susurluk_basin: 0.3,
      dursunbey_east_highlands: 0.26
    },
    balikesir_susurluk_basin: {
      bandirma_erdek_marmara_coast: 0.64,
      edremit_ayvalik_aegean_bay: 0.34,
      kazdaglari_south_wall: 0.3,
      balikesir_susurluk_basin: 1.0,
      dursunbey_east_highlands: 0.58
    },
    dursunbey_east_highlands: {
      bandirma_erdek_marmara_coast: 0.36,
      edremit_ayvalik_aegean_bay: 0.16,
      kazdaglari_south_wall: 0.26,
      balikesir_susurluk_basin: 0.58,
      dursunbey_east_highlands: 1.0
    }
  },
  stationOverrides: {
    "18433": {
      stationId: 18433,
      nameTr: "Balıkesir Merkez / Altıeylül",
      lat: 39.6551,
      lon: 27.9207,
      demElevationM: 110,
      subBasinId: "balikesir_susurluk_basin",
      urbanFraction: 0.65,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "basin_floor"
    },
    "17150": {
      stationId: 17150,
      nameTr: "Balıkesir Havalimanı (WMO 17150 / LTBF)",
      lat: 39.6083,
      lon: 27.9216,
      demElevationM: 102,
      subBasinId: "balikesir_susurluk_basin",
      urbanFraction: 0.25,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor"
    },
    "17705": {
      stationId: 17705,
      nameTr: "Susurluk Çanak Tabanı (TR-10 Doğu Sınırı)",
      lat: 39.9173,
      lon: 28.1647,
      demElevationM: 47,
      subBasinId: "balikesir_susurluk_basin",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "basin_floor"
    },
    "17114": {
      stationId: 17114,
      nameTr: "Bandırma Marmara Kıyı",
      lat: 40.3322,
      lon: 27.9966,
      demElevationM: 63,
      subBasinId: "bandirma_erdek_marmara_coast",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "coastal_or_gap"
    },
    "17115": {
      stationId: 17115,
      nameTr: "Bandırma Havalimanı (LTBG)",
      lat: 40.3066,
      lon: 27.9738,
      demElevationM: 42,
      subBasinId: "bandirma_erdek_marmara_coast",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "coastal_or_gap"
    },
    "17635": {
      stationId: 17635,
      nameTr: "Erdek Kapıdağ Yarımadası",
      lat: 40.397,
      lon: 27.788,
      demElevationM: 5,
      subBasinId: "bandirma_erdek_marmara_coast",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.1,
      verticalStratumRole: "coastal_or_gap"
    },
    "17145": {
      stationId: 17145,
      nameTr: "Edremit Körfez Ovası",
      lat: 39.5895,
      lon: 27.0194,
      demElevationM: 21,
      subBasinId: "edremit_ayvalik_aegean_bay",
      urbanFraction: 0.56,
      coldPoolSusceptibility: 0.2,
      verticalStratumRole: "coastal_or_gap"
    },
    "17143": {
      stationId: 17143,
      nameTr: "Balıkesir Koca Seyit Havalimanı (LTFD)",
      lat: 39.5457,
      lon: 27.0016,
      demElevationM: 19,
      subBasinId: "edremit_ayvalik_aegean_bay",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.24,
      verticalStratumRole: "coastal_or_gap"
    },
    "17175": {
      stationId: 17175,
      nameTr: "Ayvalık Kuzey Ege Kıyı",
      lat: 39.3113,
      lon: 26.6864,
      demElevationM: 4,
      subBasinId: "edremit_ayvalik_aegean_bay",
      urbanFraction: 0.5,
      coldPoolSusceptibility: 0.1,
      verticalStratumRole: "coastal_or_gap"
    },
    "17700": {
      stationId: 17700,
      nameTr: "Dursunbey İç Yayla",
      lat: 39.5772,
      lon: 28.6347,
      demElevationM: 651,
      subBasinId: "dursunbey_east_highlands",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.64,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18598": {
      stationId: 18598,
      nameTr: "Dursunbey / Reşadiye Yüksek Kuşak",
      lat: 39.3994,
      lon: 28.878,
      demElevationM: 1360,
      subBasinId: "dursunbey_east_highlands",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.35,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18813": {
      stationId: 18813,
      nameTr: "Edremit / Kaz Dağı Milli Parkı",
      lat: 39.6763,
      lon: 26.9201,
      demElevationM: 1244,
      subBasinId: "kazdaglari_south_wall",
      urbanFraction: 0.03,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [12, 145, 680, 1620],
    maxPhysicalPeakM: 1774,
    snowElevationBands: HYPSO_TR_10.bands
  },
  waterBodies: [
    {
      id: "south_marmara_bandirma_sea",
      labelTr: "Güney Marmara Denizi (Bandırma Körfezi – Erdek – Marmara Adası)",
      kind: "inland_sea",
      mgmMarineStationIds: [17422, 17423, 17424],
      sampleCoord: { lat: 40.52, lon: 27.84 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.2,
      monthlyWaterTempNormalsC: [
        9.5, 8.9, 9.7, 12.6, 17.0, 21.6, 24.0, 24.5, 21.8, 17.8, 14.0, 11.0
      ],
      subBasinInfluenceWeights: {
        bandirma_erdek_marmara_coast: 0.94,
        balikesir_susurluk_basin: 0.42,
        dursunbey_east_highlands: 0.16,
        kazdaglari_south_wall: 0.12,
        edremit_ayvalik_aegean_bay: 0.04
      },
      onshoreWindSectorDeg: { fromDeg: 350, toDeg: 65 },
      effectiveFetchKm: 95,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 11.5,
      dekHeavyDeltaTC: 14.0,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 10, toDeg: 55 },
        maxInlandPenetrationKm: 26,
        maxCoolingAmplitudeC: 2.5
      }
    },
    {
      id: "north_aegean_edremit_gulf",
      labelTr: "Kuzey Ege Denizi (Edremit Körfezi – Ayvalık – Burhaniye İmbat Havzası)",
      kind: "open_sea",
      mgmMarineStationIds: [17175, 17421],
      sampleCoord: { lat: 39.46, lon: 26.74 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.9,
      monthlyWaterTempNormalsC: [
        13.2, 12.8, 13.4, 15.2, 18.6, 22.4, 24.6, 25.0, 22.9, 19.8, 16.6, 14.4
      ],
      subBasinInfluenceWeights: {
        edremit_ayvalik_aegean_bay: 0.96,
        kazdaglari_south_wall: 0.78,
        balikesir_susurluk_basin: 0.22,
        bandirma_erdek_marmara_coast: 0.05,
        dursunbey_east_highlands: 0.06
      },
      onshoreWindSectorDeg: { fromDeg: 200, toDeg: 285 },
      effectiveFetchKm: 180,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 13.0,
      dekHeavyDeltaTC: 16.0,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 225, toDeg: 285 },
        maxInlandPenetrationKm: 28,
        maxCoolingAmplitudeC: 3.4
      }
    }
  ],
  directionalBarriers: [
    {
      id: "kazdaglari_1774m_aegean_orog_north_foehn",
      labelTr: "Kaz Dağları (1774m) Güney Yamacı Ege Cephe Yağışı & Kuzey Poyraz Fön Bariyeri",
      effectiveBarrierHeightM: 1774,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "kazdaglari_south_wall",
        "edremit_ayvalik_aegean_bay"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 350, toDeg: 55 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.4,
        sourcePlateauElevationM: 920,
        maxTargetElevationM: 160,
        maxWarmingCapC: 4.4,
        subCloudVirgaFactor: 0.72,
        wetCutoffMmHr: 1.8
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 170, toDeg: 245 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.26,
        maxPrecipMultiplierCap: 1.92
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 0, toDeg: 50 },
        precipAttenuationFactor: 0.62
      }
    },
    {
      id: "susurluk_madra_basin_rim",
      labelTr: "Susurluk – Çataldağ – Madra İç Çanak Eşiği",
      effectiveBarrierHeightM: 1340,
      crestPressureHpa: 850,
      applicableSubBasins: [
        "balikesir_susurluk_basin",
        "dursunbey_east_highlands"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 185, toDeg: 240 },
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.44,
        sourcePlateauElevationM: 680,
        maxTargetElevationM: 220,
        maxWarmingCapC: 3.4,
        subCloudVirgaFactor: 0.82,
        wetCutoffMmHr: 2.0
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 5, toDeg: 55 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.16,
        maxPrecipMultiplierCap: 1.48
      }
    }
  ],
  venturiCorridors: [
    {
      id: "bandirma_susurluk_poyraz_corridor",
      labelTr: "Bandırma – Manyas – Susurluk Poyraz Oluk Koridoru",
      centerCoord: { lat: 40.12, lon: 28.04 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 35,
      bidirectional: true,
      sectorHalfWidthDeg: 22,
      speedMultiplier: 1.28,
      gustMultiplier: 1.42,
      suppressesNocturnalInversion: true
    },
    {
      id: "edremit_gulf_imbat_funnel",
      labelTr: "Edremit Körfezi İmbat / Lodos Huni Kanalı",
      centerCoord: { lat: 39.52, lon: 26.86 },
      influenceRadiusKm: 18,
      channelAxisFromDeg: 245,
      bidirectional: true,
      sectorHalfWidthDeg: 20,
      speedMultiplier: 1.22,
      gustMultiplier: 1.34,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 95,
    coldPoolMaxDepthM: 420,
    topographicEnclosureIndex: 0.76,
    deltaPressureTopHpa: 45,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 3.8
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.68
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 10, toDeg: 65 },
      minWindShearVs850Deg: 50
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.44,
    invertedVDryMicroburstSusceptibility: 0.36,
    coastalWaterspoutSusceptibility: 0.48
  },
  stencil9Points: [
    {
      key: "target_balikesir",
      labelTr: "Balıkesir Merkez Çanak Tabanı (WMO 17150)",
      lat: 39.6504,
      lon: 27.886,
      elevationM: 110,
      role: "target"
    },
    {
      key: "bandirma_marmara_upwind",
      labelTr: "Bandırma Körfezi Marmara Poyraz Kaynağı",
      lat: 40.42,
      lon: 27.95,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "edremit_aegean_upwind",
      labelTr: "Edremit Körfezi Kuzey Ege İmbat / Lodos Kaynağı",
      lat: 39.46,
      lon: 26.74,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "kazdaglari_south_crest",
      labelTr: "Kaz Dağları (1774m) Orografik Sırtı",
      lat: 39.6763,
      lon: 26.9201,
      elevationM: 1620,
      role: "orographic_wall"
    },
    {
      key: "dursunbey_alacam_wall",
      labelTr: "Dursunbey / Reşadiye Doğu Yayla Duvarı (1360m)",
      lat: 39.3994,
      lon: 28.878,
      elevationM: 1360,
      role: "orographic_wall"
    },
    {
      key: "susurluk_north_corridor",
      labelTr: "Susurluk – Manyas Poyraz Giriş Koridoru",
      lat: 39.9173,
      lon: 28.1647,
      elevationM: 47,
      role: "corridor"
    },
    {
      key: "kazdagi_north_foehn_windward",
      labelTr: "Kaz Dağı Kuzey Etek Poyraz Rüzgârüstü",
      lat: 39.75,
      lon: 27.05,
      elevationM: 680,
      role: "foehn_windward"
    },
    {
      key: "edremit_foehn_lee",
      labelTr: "Edremit – Altınoluk Kuzey Fön İniş Kıyısı",
      lat: 39.5895,
      lon: 27.0194,
      elevationM: 21,
      role: "lee_shadow"
    },
    {
      key: "sindirgi_south_pass",
      labelTr: "Sındırgı – Simav Güney Eşik Geçidi",
      lat: 39.2267,
      lon: 28.1327,
      elevationM: 237,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -20,
    maxPlausibleTempC: 46,
    minPlausibleMslpHpa: 974,
    maxPlausibleMslpHpa: 1052,
    kalmanTempBiasCapC: 4.8
  }
});

export default PROVINCE_SPEC_TR_10;
