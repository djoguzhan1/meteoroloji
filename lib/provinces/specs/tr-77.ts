import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_77 = TR81_CLIMATOLOGY_1991_2020["TR-77"];
const HYPSO_TR_77 = TR81_HYPSOMETRIC_PROFILES["TR-77"];

/**
 * Historical Tier-A calibration archive reference for TR-77 Yalova:
 * Military/WMO archive `LTBP0` / `WMO 17119` is used strictly for offline historical EMOS calibration;
 * live civil METAR ingestion (`icaoWhitelist`) is locked to `[]` so neighbor Bursa `LTBR` and
 * Istanbul `LTFJ` METARs never contaminate Yalova coastal microclimates.
 */
export const TR_77_CALIBRATION_ANCHOR_META = Object.freeze({
  historicalWmoArchiveId: "LTBP0",
  wmoStationId: "17119",
  liveCivilMetarAllowed: false,
  blockedNeighborIcaos: ["LTBR", "LTFJ", "LTBQ", "LTBA"] as const
});

export const PROVINCE_SPEC_TR_77: ProvinceSpec = Object.freeze<ProvinceSpec>({
  provinceCode: "TR-77",
  plateCode: 77,
  slug: "yalova",
  nameTr: "Yalova",
  region: "MARMARA",
  climateRegion: "MARMARA",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "MARMARA_COASTAL_TRANSITION",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 40.45,
    maxLat: 40.73,
    minLon: 28.75,
    maxLon: 29.58
  },
  primaryCenter: {
    mgmMerkezId: 97701,
    mgmIstNo: 17119,
    mgmSaatlikIstNo: 17119,
    mgmGunlukIstNo: 97701,
    wmoId: "17119",
    lat: 40.6604,
    lon: 29.2867,
    demVerifiedElevationM: 4,
    subBasinId: "yalova_cinarcik_north_coast",
    urbanFraction: 0.64,
    monthlyTmaxNormalsC: CLIM_TR_77.tmaxC,
    monthlyTminNormalsC: CLIM_TR_77.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-77-armutlu-cinarcik-kiyi",
      name: "Çınarcık – Armutlu Marmara Kıyısı",
      role: "coast",
      lat: 40.6421,
      lon: 29.106,
      elevationM: 16
    },
    {
      id: "tr-77-yalova-altinova-duzlugu",
      name: "Yalova Merkez – Altınova Kıyı Ovası",
      role: "plain",
      lat: 40.6604,
      lon: 29.2867,
      elevationM: 12
    },
    {
      id: "tr-77-termal-erikli-yamac",
      name: "Termal / Erikli Yaylası Kuzey Yamacı",
      role: "foothill",
      lat: 40.6044,
      lon: 29.1969,
      elevationM: 390
    },
    {
      id: "tr-77-bespinar-delmece-zirve",
      name: "Samanlı Dağları – Beşpınar / Delmece Sırtı (926m)",
      role: "summit",
      lat: 40.5656,
      lon: 29.3717,
      elevationM: 876
    }
  ],
  subBasins: [
    {
      id: "yalova_cinarcik_north_coast",
      labelTr: "Yalova – Çınarcık – Çiftlikköy – Altınova Denizel Mikroklima Kıyısı",
      polygonOrBbox: {
        minLat: 40.62,
        maxLat: 40.73,
        minLon: 29.04,
        maxLon: 29.56
      },
      elevationRangeM: [0, 95],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.6
    },
    {
      id: "armutlu_headland",
      labelTr: "Armutlu Yarımadası & Gemlik Körfezi Kuzey Kıyısı",
      polygonOrBbox: {
        minLat: 40.46,
        maxLat: 40.64,
        minLon: 28.76,
        maxLon: 29.06
      },
      elevationRangeM: [0, 340],
      defaultZone: "peninsula_exposed",
      defaultUrbanFraction: 0.22
    },
    {
      id: "termal_samanli_bespinar_ridge",
      labelTr: "Samanlı Dağları Kuzey Yamacı – Termal / Beşpınar (926m) Sırtı",
      polygonOrBbox: {
        minLat: 40.51,
        maxLat: 40.62,
        minLon: 29.02,
        maxLon: 29.52
      },
      elevationRangeM: [95, 926],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.12
    }
  ],
  barrierCouplingMatrix: {
    yalova_cinarcik_north_coast: {
      yalova_cinarcik_north_coast: 1.0,
      armutlu_headland: 0.72,
      termal_samanli_bespinar_ridge: 0.44
    },
    armutlu_headland: {
      yalova_cinarcik_north_coast: 0.72,
      armutlu_headland: 1.0,
      termal_samanli_bespinar_ridge: 0.52
    },
    termal_samanli_bespinar_ridge: {
      yalova_cinarcik_north_coast: 0.44,
      armutlu_headland: 0.52,
      termal_samanli_bespinar_ridge: 1.0
    }
  },
  stationOverrides: {
    "17119": {
      stationId: 17119,
      nameTr: "Yalova Merkez (WMO 17119)",
      lat: 40.6604,
      lon: 29.2867,
      demElevationM: 4,
      subBasinId: "yalova_cinarcik_north_coast",
      urbanFraction: 0.66,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "coastal_or_gap"
    },
    "17658": {
      stationId: 17658,
      nameTr: "Çınarcık Kıyı",
      lat: 40.6421,
      lon: 29.106,
      demElevationM: 16,
      subBasinId: "yalova_cinarcik_north_coast",
      urbanFraction: 0.52,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "coastal_or_gap"
    },
    "18109": {
      stationId: 18109,
      nameTr: "Altınova (Hersek Lagünü Kıyısı)",
      lat: 40.7142,
      lon: 29.5092,
      demElevationM: 4,
      subBasinId: "yalova_cinarcik_north_coast",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.24,
      verticalStratumRole: "coastal_or_gap"
    },
    "18110": {
      stationId: 18110,
      nameTr: "Armutlu (Gemlik Körfezi Kuzey Kıyısı)",
      lat: 40.5478,
      lon: 28.8408,
      demElevationM: 101,
      subBasinId: "armutlu_headland",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "coastal_or_gap"
    },
    "18424": {
      stationId: 18424,
      nameTr: "Termal Vadi / Kuzey Etek",
      lat: 40.6044,
      lon: 29.1969,
      demElevationM: 102,
      subBasinId: "termal_samanli_bespinar_ridge",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "mid_slope"
    },
    "19123": {
      stationId: 19123,
      nameTr: "Altınova / Aktoprak Köyü Yamaç",
      lat: 40.5771,
      lon: 29.4758,
      demElevationM: 238,
      subBasinId: "termal_samanli_bespinar_ridge",
      urbanFraction: 0.08,
      coldPoolSusceptibility: 0.24,
      verticalStratumRole: "mid_slope"
    },
    "18807": {
      stationId: 18807,
      nameTr: "Çiftlikköy / Sugören Radar (Samanlı Sırtı 876m)",
      lat: 40.5656,
      lon: 29.3717,
      demElevationM: 876,
      subBasinId: "termal_samanli_bespinar_ridge",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.16,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [8, 30, 390, 926],
    maxPhysicalPeakM: 926,
    snowElevationBands: HYPSO_TR_77.bands
  },
  waterBodies: [
    {
      id: "eastern_marmara_yalova_coast",
      labelTr: "Doğu Marmara & Gemlik Körfezi Kuzey Kıyısı (Yalova – Çınarcık – Armutlu)",
      kind: "inland_sea",
      mgmMarineStationIds: [17452],
      sampleCoord: { lat: 40.695, lon: 29.22 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.2,
      monthlyWaterTempNormalsC: [
        9.6, 9.0, 9.8, 12.6, 17.1, 21.7, 24.2, 24.7, 22.0, 18.1, 14.2, 11.1
      ],
      subBasinInfluenceWeights: {
        yalova_cinarcik_north_coast: 0.94,
        armutlu_headland: 0.92,
        termal_samanli_bespinar_ridge: 0.62
      },
      onshoreWindSectorDeg: { fromDeg: 335, toDeg: 65 },
      effectiveFetchKm: 58,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 11.8,
      dekHeavyDeltaTC: 14.2,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 345, toDeg: 45 },
        maxInlandPenetrationKm: 16,
        maxCoolingAmplitudeC: 2.4
      }
    }
  ],
  directionalBarriers: [
    {
      id: "samanli_bespinar_926m_barrier",
      labelTr: "Samanlı Dağları (Beşpınar 926m) Kuzey Yamacı Denizel Yükselim & Lodos Fön Bariyeri",
      effectiveBarrierHeightM: 926,
      crestPressureHpa: 850,
      applicableSubBasins: [
        "termal_samanli_bespinar_ridge",
        "yalova_cinarcik_north_coast",
        "armutlu_headland"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 175, toDeg: 235 },
        minCrossCrestSpeedMs: 6.5,
        minFroudeNumber: 0.48,
        sourcePlateauElevationM: 680,
        maxTargetElevationM: 120,
        maxWarmingCapC: 4.1,
        subCloudVirgaFactor: 0.78,
        wetCutoffMmHr: 2.0
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 345, toDeg: 55 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.22,
        maxPrecipMultiplierCap: 1.65
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 180, toDeg: 225 },
        precipAttenuationFactor: 0.74
      }
    }
  ],
  venturiCorridors: [
    {
      id: "armutlu_cinarcik_poyraz_refraction",
      labelTr: "Armutlu – Bozburun – Çınarcık Kıyı Poyraz Kırılma Koridoru",
      centerCoord: { lat: 40.615, lon: 28.965 },
      influenceRadiusKm: 15,
      channelAxisFromDeg: 40,
      bidirectional: false,
      sectorHalfWidthDeg: 22,
      speedMultiplier: 1.26,
      gustMultiplier: 1.38,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 12,
    coldPoolMaxDepthM: 180,
    topographicEnclosureIndex: 0.34,
    deltaPressureTopHpa: 22,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 2.2
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.8
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 15, toDeg: 65 },
      minWindShearVs850Deg: 45
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.35,
    invertedVDryMicroburstSusceptibility: 0.22,
    coastalWaterspoutSusceptibility: 0.52
  },
  stencil9Points: [
    {
      key: "target_yalova",
      labelTr: "Yalova Merkez (WMO 17119)",
      lat: 40.6604,
      lon: 29.2867,
      elevationM: 4,
      role: "target"
    },
    {
      key: "marmara_poyraz_upwind",
      labelTr: "Doğu Marmara Açık Deniz Poyraz Kaynağı",
      lat: 40.76,
      lon: 29.18,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "armutlu_bozburun_corridor",
      labelTr: "Armutlu Bozburun Kıyı Poyraz Kırılma Noktası",
      lat: 40.5478,
      lon: 28.8408,
      elevationM: 101,
      role: "corridor"
    },
    {
      key: "cinarcik_coast",
      labelTr: "Çınarcık Kuzey Kıyı Hattı",
      lat: 40.6421,
      lon: 29.106,
      elevationM: 16,
      role: "marine_upwind"
    },
    {
      key: "termal_foothill",
      labelTr: "Termal / Erikli Kuzey Yamaç Mikro-Havzası",
      lat: 40.6044,
      lon: 29.1969,
      elevationM: 102,
      role: "orographic_wall"
    },
    {
      key: "sugoren_bespinar_crest",
      labelTr: "Sugören Radar / Beşpınar Samanlı Sırtı (876m–926m)",
      lat: 40.5656,
      lon: 29.3717,
      elevationM: 876,
      role: "orographic_wall"
    },
    {
      key: "delmece_south_ridge",
      labelTr: "Delmece Yaylası Lodos Rüzgârüstü Sırtı",
      lat: 40.552,
      lon: 29.065,
      elevationM: 760,
      role: "foehn_windward"
    },
    {
      key: "altinova_hersek_gap",
      labelTr: "Altınova – Hersek Körfez Girişi",
      lat: 40.7142,
      lon: 29.5092,
      elevationM: 4,
      role: "corridor"
    },
    {
      key: "ciftlikkoy_lee_plain",
      labelTr: "Çiftlikköy Lodos Fön İniş Düzlüğü",
      lat: 40.6859,
      lon: 29.3709,
      elevationM: 13,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -15,
    maxPlausibleTempC: 44,
    minPlausibleMslpHpa: 974,
    maxPlausibleMslpHpa: 1050,
    kalmanTempBiasCapC: 4.2
  }
});

export default PROVINCE_SPEC_TR_77;
