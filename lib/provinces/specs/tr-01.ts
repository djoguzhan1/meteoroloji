import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const ADANA_CLIM = TR81_CLIMATOLOGY_1991_2020["TR-01"];
const ADANA_HYPSO = TR81_HYPSOMETRIC_PROFILES["TR-01"];

/**
 * Bespoke summer sultry mugginess & Gülek Poyraz katabatic metadata for `TR-01` Adana.
 * Captures the extreme 3,733 m vertical relief from Çukurova Delta (23 m) to Aladağlar/Demirkazık (3,756 m).
 */
export const TR_01_CUKUROVA_THERMAL_REGIME = Object.freeze({
  gulekPassElevationM: 1050,
  demirkazikPeakM: 3756,
  summerPeakSstC: 29.4,
  sultryDewPointThresholdC: 24.0,
  allowedMetarIcaos: Object.freeze(["LTAF", "LTAG"] as const),
  blockedNeighborMetarIcaos: Object.freeze(["LTDB", "LTDA", "LTCN"] as const)
});

const specTr01: ProvinceSpec = {
  provinceCode: "TR-01",
  plateCode: 1,
  slug: "adana",
  nameTr: "Adana",
  region: "MEDITERRANEAN",
  climateRegion: "AKDENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "MEDITERRANEAN_COASTAL_OROG",
  icaoWhitelist: ["LTAF", "LTAG"],
  domainBounds: {
    minLat: 36.5388,
    maxLat: 38.4045,
    minLon: 34.7747,
    maxLon: 36.4095
  },
  primaryCenter: {
    mgmMerkezId: 90101,
    mgmIstNo: 19272,
    mgmSaatlikIstNo: 17352,
    mgmGunlukIstNo: 90101,
    wmoId: "17352",
    lat: 36.9838,
    lon: 35.298,
    demVerifiedElevationM: 23,
    subBasinId: "cukurova_delta_plain",
    urbanFraction: 0.86,
    monthlyTmaxNormalsC: ADANA_CLIM.tmaxC,
    monthlyTminNormalsC: ADANA_CLIM.tminC
  },
  curatedSubLocations: [
    {
      id: "adana-karatas-coast-tr",
      name: "Karataş / Yumurtalık Kıyı",
      role: "coast",
      lat: 36.5683,
      lon: 35.3894,
      elevationM: 12
    },
    {
      id: "adana-seyhan-merkez-tr",
      name: "Adana Merkez (Seyhan / Yüreğir)",
      role: "plain",
      lat: 36.9838,
      lon: 35.298,
      elevationM: 23
    },
    {
      id: "adana-pozanti-gulek-tr",
      name: "Pozantı / Gülek Boğazı",
      role: "foothill",
      lat: 37.4758,
      lon: 34.9022,
      elevationM: 1080
    },
    {
      id: "adana-tufanbeyli-aladaglar-tr",
      name: "Tufanbeyli / Aladağlar Yüksek Kuşak",
      role: "summit",
      lat: 38.26,
      lon: 36.2195,
      elevationM: 1415
    }
  ],
  subBasins: [
    {
      id: "karatas_yumurtalik_coast",
      labelTr: "Karataş – Yumurtalık Lagün ve Kıyı Kuşağı",
      polygonOrBbox: {
        minLat: 36.5388,
        maxLat: 36.86,
        minLon: 35.08,
        maxLon: 35.98
      },
      elevationRangeM: [0, 50],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.28
    },
    {
      id: "cukurova_delta_plain",
      labelTr: "Çukurova Alüvyal Deltası (Seyhan – Yüreğir – Ceyhan – Kozan)",
      polygonOrBbox: {
        minLat: 36.86,
        maxLat: 37.46,
        minLon: 35.05,
        maxLon: 36.02
      },
      elevationRangeM: [15, 240],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.78
    },
    {
      id: "gulek_pozanti_corridor",
      labelTr: "Gülek Boğazı – Akçatekir – Pozantı Katabatik Oluk Kuşağı",
      polygonOrBbox: {
        minLat: 37.18,
        maxLat: 37.66,
        minLon: 34.7747,
        maxLon: 35.26
      },
      elevationRangeM: [240, 1450],
      defaultZone: "strait_corridor",
      defaultUrbanFraction: 0.24
    },
    {
      id: "aladaglar_tufanbeyli_highlands",
      labelTr: "Aladağlar (Demirkazık) – Saimbeyli – Tufanbeyli İç Toros Platosu",
      polygonOrBbox: {
        minLat: 37.46,
        maxLat: 38.4045,
        minLon: 35.24,
        maxLon: 36.4095
      },
      elevationRangeM: [550, 3756],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.14
    }
  ],
  barrierCouplingMatrix: {
    karatas_yumurtalik_coast: {
      karatas_yumurtalik_coast: 1.0,
      cukurova_delta_plain: 0.84,
      gulek_pozanti_corridor: 0.22,
      aladaglar_tufanbeyli_highlands: 0.06
    },
    cukurova_delta_plain: {
      karatas_yumurtalik_coast: 0.82,
      cukurova_delta_plain: 1.0,
      gulek_pozanti_corridor: 0.34,
      aladaglar_tufanbeyli_highlands: 0.08
    },
    gulek_pozanti_corridor: {
      karatas_yumurtalik_coast: 0.18,
      cukurova_delta_plain: 0.32,
      gulek_pozanti_corridor: 1.0,
      aladaglar_tufanbeyli_highlands: 0.56
    },
    aladaglar_tufanbeyli_highlands: {
      karatas_yumurtalik_coast: 0.04,
      cukurova_delta_plain: 0.07,
      gulek_pozanti_corridor: 0.52,
      aladaglar_tufanbeyli_highlands: 1.0
    }
  },
  stationOverrides: {
    "19272": {
      stationId: 19272,
      nameTr: "Adana Seyhan Merkez",
      lat: 36.9838,
      lon: 35.298,
      demElevationM: 20,
      subBasinId: "cukurova_delta_plain",
      urbanFraction: 0.88,
      coldPoolSusceptibility: 0.26,
      verticalStratumRole: "basin_floor"
    },
    "17351": {
      stationId: 17351,
      nameTr: "Adana Bölge / Yüreğir (WMO 17351)",
      lat: 37.0041,
      lon: 35.3443,
      demElevationM: 23,
      subBasinId: "cukurova_delta_plain",
      urbanFraction: 0.84,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "basin_floor"
    },
    "17352": {
      stationId: 17352,
      nameTr: "Adana Şakirpaşa Havalimanı (WMO 17352 / LTAF)",
      lat: 36.9822,
      lon: 35.2804,
      demElevationM: 20,
      subBasinId: "cukurova_delta_plain",
      urbanFraction: 0.76,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "basin_floor"
    },
    "17981": {
      stationId: 17981,
      nameTr: "Adana Karataş Sahil",
      lat: 36.5683,
      lon: 35.3894,
      demElevationM: 22,
      subBasinId: "karatas_yumurtalik_coast",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "coastal_or_gap"
    },
    "17979": {
      stationId: 17979,
      nameTr: "Adana Yumurtalık Kıyı",
      lat: 36.7687,
      lon: 35.7903,
      demElevationM: 34,
      subBasinId: "karatas_yumurtalik_coast",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "coastal_or_gap"
    },
    "17934": {
      stationId: 17934,
      nameTr: "Adana Pozantı (Gülek Boğazı Kuzey Ağzı)",
      lat: 37.4758,
      lon: 34.9022,
      demElevationM: 1080,
      subBasinId: "gulek_pozanti_corridor",
      urbanFraction: 0.25,
      coldPoolSusceptibility: 0.45,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18258": {
      stationId: 18258,
      nameTr: "Adana Aladağ",
      lat: 37.5461,
      lon: 35.3929,
      demElevationM: 840,
      subBasinId: "aladaglar_tufanbeyli_highlands",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18053": {
      stationId: 18053,
      nameTr: "Adana Tufanbeyli (İç Toros Yüksek Havza)",
      lat: 38.26,
      lon: 36.2195,
      demElevationM: 1415,
      subBasinId: "aladaglar_tufanbeyli_highlands",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [20, 450, 1400, 3200],
    maxPhysicalPeakM: 3756,
    snowElevationBands: ADANA_HYPSO.bands
  },
  waterBodies: [
    {
      id: "east_med_karatas_basin",
      labelTr: "Doğu Akdeniz (Karataş – Yumurtalık Kıyı Havzası)",
      kind: "open_sea",
      mgmMarineStationIds: [17480],
      sampleCoord: { lat: 36.48, lon: 35.42 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -2.0,
      monthlyWaterTempNormalsC: [
        17.4, 16.9, 17.6, 19.4, 22.8, 26.2,
        28.6, 29.4, 28.2, 25.4, 21.6, 18.8
      ],
      subBasinInfluenceWeights: {
        karatas_yumurtalik_coast: 1.0,
        cukurova_delta_plain: 0.82,
        gulek_pozanti_corridor: 0.15,
        aladaglar_tufanbeyli_highlands: 0.0
      },
      onshoreWindSectorDeg: { fromDeg: 155, toDeg: 245 },
      effectiveFetchKm: 280,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 13.0,
      dekHeavyDeltaTC: 17.0,
      seaBreezeSpec: {
        activeMonths: [4, 10],
        sectorDeg: { fromDeg: 175, toDeg: 235 },
        maxInlandPenetrationKm: 65,
        maxCoolingAmplitudeC: 3.4
      }
    }
  ],
  directionalBarriers: [
    {
      id: "orta_toros_aladaglar_gulek_wall",
      labelTr: "Orta Toroslar & Aladağlar (Demirkazık 3756m) — Gülek Poyraz Fönü ve Akdeniz Yamaç Yağışı",
      effectiveBarrierHeightM: 2950,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "cukurova_delta_plain",
        "karatas_yumurtalik_coast",
        "gulek_pozanti_corridor"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 345, toDeg: 55 },
        minCrossCrestSpeedMs: 6.5,
        minFroudeNumber: 0.74,
        sourcePlateauElevationM: 1120,
        maxTargetElevationM: 350,
        maxWarmingCapC: 5.8,
        subCloudVirgaFactor: 0.62,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 155, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.18,
        maxPrecipMultiplierCap: 1.52
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 350, toDeg: 50 },
        precipAttenuationFactor: 0.42
      }
    }
  ],
  venturiCorridors: [
    {
      id: "gulek_bogazi_poyraz_chute",
      labelTr: "Gülek Boğazı (1050m) – Çukurova Katabatik/Venturi Poyraz Oluğu",
      centerCoord: { lat: 37.275, lon: 34.925 },
      influenceRadiusKm: 36,
      channelAxisFromDeg: 22,
      bidirectional: true,
      sectorHalfWidthDeg: 38,
      speedMultiplier: 1.38,
      gustMultiplier: 1.52,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 20,
    coldPoolMaxDepthM: 180,
    topographicEnclosureIndex: 0.44,
    deltaPressureTopHpa: 990,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 4.2
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.78
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.68,
    invertedVDryMicroburstSusceptibility: 0.45,
    coastalWaterspoutSusceptibility: 0.74
  },
  stencil9Points: [
    {
      key: "TGT_SEYHAN",
      labelTr: "Adana Merkez (Seyhan / Yüreğir 23m)",
      lat: 36.9838,
      lon: 35.298,
      elevationM: 23,
      role: "target"
    },
    {
      key: "MAR_KARATAS",
      labelTr: "Doğu Akdeniz Karataş Açıkları",
      lat: 36.48,
      lon: 35.42,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "MAR_YUMURTALIK",
      labelTr: "Yumurtalık – İskenderun Körfez Girişi",
      lat: 36.68,
      lon: 35.78,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "COR_GULEK",
      labelTr: "Gülek Boğazı / Akçatekir (1050m)",
      lat: 37.315,
      lon: 34.885,
      elevationM: 1050,
      role: "corridor"
    },
    {
      key: "FOE_POZANTI_ULUKISLA",
      labelTr: "Pozantı – İç Anadolu Eşiği (1120m)",
      lat: 37.4758,
      lon: 34.9022,
      elevationM: 1080,
      role: "foehn_windward"
    },
    {
      key: "ORO_ALADAGLAR",
      labelTr: "Aladağlar / Demirkazık Güney Duvarı",
      lat: 37.72,
      lon: 35.22,
      elevationM: 2850,
      role: "orographic_wall"
    },
    {
      key: "ORO_KOZAN_FEKE",
      labelTr: "Kozan – Feke Güney Toros Yamacı",
      lat: 37.62,
      lon: 35.86,
      elevationM: 920,
      role: "orographic_wall"
    },
    {
      key: "LEE_CEYHAN_PLAIN",
      labelTr: "Ceyhan Doğu Çukurova Ovası",
      lat: 37.0153,
      lon: 35.7955,
      elevationM: 30,
      role: "lee_shadow"
    },
    {
      key: "FOE_TUFANBEYLI",
      labelTr: "Tufanbeyli İç Toros Platosu (1415m)",
      lat: 38.26,
      lon: 36.2195,
      elevationM: 1415,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -28,
    maxPlausibleTempC: 48,
    minPlausibleMslpHpa: 982,
    maxPlausibleMslpHpa: 1044,
    kalmanTempBiasCapC: 5.5
  }
};

export const PROVINCE_SPEC_TR_01: ProvinceSpec = Object.freeze(specTr01);
export default PROVINCE_SPEC_TR_01;
