import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const SIVAS_CLIM = TR81_CLIMATOLOGY_1991_2020["TR-58"];
const SIVAS_HYPSO = TR81_HYPSOMETRIC_PROFILES["TR-58"];

/**
 * Bespoke continental frost-basin & valley-decoupling contract for `TR-58` Sivas.
 * Captures:
 * 1) Upper Kızılırmak Sivas basin (~1,285 m) vs Nuri Demirağ `LTAR` windy ridge (1,596 m, +311 m offset, excluded from center headline),
 * 2) İmranlı–Kangal–Altınyayla extreme inner-steppe frost sector (-38 °C plausible floor),
 * 3) Yıldız Dağı ski massif (2,552 m) & Kızıldağ/Köse divide (3,015 m),
 * 4) Suşehri–Koyulhisar–Akıncılar Kelkit low valley trough (~860–950 m) sheltered north of Köse Mountains.
 */
export const TR_58_CONTINENTAL_FROST_AND_KELKIT_CONTRACT = Object.freeze({
  sivasCenterElevationM: 1285,
  ltarRidgeElevationM: 1596,
  ltarVsCenterElevationDeltaM: 311,
  ltarExcludedFromCenterHeadline: true,
  kangalImranliExtremeFrostFloorC: -38,
  yildizDagiSummitElevationM: 2552,
  kelkitValleyFloorElevationM: 950,
  allowedMetarIcaos: Object.freeze(["LTAR"] as const),
  blockedNeighborMetarIcaos: Object.freeze(["LTAU", "LTAT", "LTCD", "LTAW", "LTCW"] as const)
});

const specTr58: ProvinceSpec = {
  provinceCode: "TR-58",
  plateCode: 58,
  slug: "sivas",
  nameTr: "Sivas",
  region: "CENTRAL_ANATOLIA",
  climateRegion: "IC_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "INLAND_PASS_PLATEAU",
  icaoWhitelist: ["LTAR"],
  domainBounds: {
    minLat: 38.537,
    maxLat: 40.5525,
    minLon: 35.8537,
    maxLon: 38.7722
  },
  primaryCenter: {
    mgmMerkezId: 95801,
    mgmIstNo: 17090,
    mgmSaatlikIstNo: 17090,
    mgmGunlukIstNo: 95801,
    wmoId: "17090",
    lat: 39.7437,
    lon: 37.002,
    demVerifiedElevationM: 1285,
    subBasinId: "yukari_kizilirmak_sivas_basin",
    urbanFraction: 0.72,
    monthlyTmaxNormalsC: SIVAS_CLIM.tmaxC,
    monthlyTminNormalsC: SIVAS_CLIM.tminC
  },
  curatedSubLocations: [
    {
      id: "sivas-kelkit-koyulhisar-susehri-tr",
      name: "Suşehri / Koyulhisar (Kelkit Alçak Vadisi)",
      role: "plain",
      lat: 40.3008,
      lon: 37.8239,
      elevationM: 950
    },
    {
      id: "sivas-merkez-kizilirmak-tr",
      name: "Sivas Merkez (Yukarı Kızılırmak Çanağı)",
      role: "plain",
      lat: 39.7437,
      lon: 37.002,
      elevationM: 1285
    },
    {
      id: "sivas-kangal-imranli-ayaz-tr",
      name: "İmranlı / Kangal / Altınyayla Ayaz Bozkırı",
      role: "foothill",
      lat: 39.2428,
      lon: 37.389,
      elevationM: 1521
    },
    {
      id: "sivas-ltar-nuri-demirag-sirt-tr",
      name: "Nuri Demirağ Havalimanı Sırtı (LTAR)",
      role: "foothill",
      lat: 39.8138,
      lon: 36.9035,
      elevationM: 1596
    },
    {
      id: "sivas-yildiz-dagi-kayak-tr",
      name: "Yıldız Dağı Kayak Merkezi Zirve Kuşağı",
      role: "summit",
      lat: 40.1349,
      lon: 36.9388,
      elevationM: 2552
    }
  ],
  subBasins: [
    {
      id: "yukari_kizilirmak_sivas_basin",
      labelTr: "Yukarı Kızılırmak Çanağı (Sivas Merkez – Hafik – Zara – Şarkışla – Gemerek)",
      polygonOrBbox: {
        minLat: 39.15,
        maxLat: 39.96,
        minLon: 35.8537,
        maxLon: 37.88
      },
      elevationRangeM: [1150, 1420],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.48
    },
    {
      id: "imranli_kangal_altinyayla_frost_steppe",
      labelTr: "İmranlı – Kangal – Altınyayla – Ulaş – Gürün Yüksek Kontinental Ayaz Bozkırı",
      polygonOrBbox: {
        minLat: 38.537,
        maxLat: 39.95,
        minLon: 36.55,
        maxLon: 38.45
      },
      elevationRangeM: [1380, 1980],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.12
    },
    {
      id: "yildiz_kose_kizildag_alpine_ridge",
      labelTr: "Yıldız Dağı (2552m) – Nuri Demirağ Sırtı (1596m) – Köse & Kızıldağ Zirve Kuşağı",
      polygonOrBbox: {
        minLat: 39.78,
        maxLat: 40.32,
        minLon: 36.45,
        maxLon: 38.7722
      },
      elevationRangeM: [1550, 3015],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.06
    },
    {
      id: "kelkit_susehri_koyulhisar_trough",
      labelTr: "Suşehri – Koyulhisar – Akıncılar Kelkit Alçak ve Ilıman Vadi Oluğu",
      polygonOrBbox: {
        minLat: 40.02,
        maxLat: 40.5525,
        minLon: 37.55,
        maxLon: 38.68
      },
      elevationRangeM: [820, 1220],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.24
    }
  ],
  barrierCouplingMatrix: {
    yukari_kizilirmak_sivas_basin: {
      yukari_kizilirmak_sivas_basin: 1.0,
      imranli_kangal_altinyayla_frost_steppe: 0.54,
      yildiz_kose_kizildag_alpine_ridge: 0.22,
      kelkit_susehri_koyulhisar_trough: 0.06
    },
    imranli_kangal_altinyayla_frost_steppe: {
      yukari_kizilirmak_sivas_basin: 0.52,
      imranli_kangal_altinyayla_frost_steppe: 1.0,
      yildiz_kose_kizildag_alpine_ridge: 0.36,
      kelkit_susehri_koyulhisar_trough: 0.05
    },
    yildiz_kose_kizildag_alpine_ridge: {
      yukari_kizilirmak_sivas_basin: 0.2,
      imranli_kangal_altinyayla_frost_steppe: 0.34,
      yildiz_kose_kizildag_alpine_ridge: 1.0,
      kelkit_susehri_koyulhisar_trough: 0.14
    },
    kelkit_susehri_koyulhisar_trough: {
      yukari_kizilirmak_sivas_basin: 0.06,
      imranli_kangal_altinyayla_frost_steppe: 0.04,
      yildiz_kose_kizildag_alpine_ridge: 0.14,
      kelkit_susehri_koyulhisar_trough: 1.0
    }
  },
  stationOverrides: {
    "17090": {
      stationId: 17090,
      nameTr: "Sivas Bölge Merkez (WMO 17090)",
      lat: 39.7437,
      lon: 37.002,
      demElevationM: 1285,
      subBasinId: "yukari_kizilirmak_sivas_basin",
      urbanFraction: 0.74,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "basin_floor"
    },
    "17091": {
      stationId: 17091,
      nameTr: "Sivas Nuri Demirağ Havalimanı (MGM 17091 / LTAR — Rüzgarlı Sırt)",
      lat: 39.8138,
      lon: 36.9035,
      demElevationM: 1596,
      subBasinId: "yildiz_kose_kizildag_alpine_ridge",
      urbanFraction: 0.12,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    LTAR: {
      stationId: "LTAR",
      nameTr: "Sivas Nuri Demirağ Havalimanı METAR (LTAR — Merkezden +311m Yüksek Sırt)",
      lat: 39.8138,
      lon: 36.9035,
      demElevationM: 1596,
      subBasinId: "yildiz_kose_kizildag_alpine_ridge",
      urbanFraction: 0.12,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18470": {
      stationId: 18470,
      nameTr: "Sivas İmranlı (Kızıldağ Eteği Yüksek Ayaz Havzası)",
      lat: 39.8758,
      lon: 38.0983,
      demElevationM: 1595,
      subBasinId: "imranli_kangal_altinyayla_frost_steppe",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "17762": {
      stationId: 17762,
      nameTr: "Sivas Kangal (İç Bozkır Ekstrem Ayaz Çanağı)",
      lat: 39.2428,
      lon: 37.389,
      demElevationM: 1521,
      subBasinId: "imranli_kangal_altinyayla_frost_steppe",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.96,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18466": {
      stationId: 18466,
      nameTr: "Sivas Altınyayla (Tonus Yüksek Bozkırı)",
      lat: 39.2762,
      lon: 36.7182,
      demElevationM: 1443,
      subBasinId: "imranli_kangal_altinyayla_frost_steppe",
      urbanFraction: 0.15,
      coldPoolSusceptibility: 0.92,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17710": {
      stationId: 17710,
      nameTr: "Sivas Ulaş (Tecer Ayaz Çanağı)",
      lat: 39.4414,
      lon: 37.0276,
      demElevationM: 1392,
      subBasinId: "imranli_kangal_altinyayla_frost_steppe",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.9,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18672": {
      stationId: 18672,
      nameTr: "Yıldız Dağı Kayak Merkezi AWS",
      lat: 40.1349,
      lon: 36.9388,
      demElevationM: 1752,
      subBasinId: "yildiz_kose_kizildag_alpine_ridge",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18674": {
      stationId: 18674,
      nameTr: "Sivas Yüksek Sırt Kar Gözlem İstasyonu",
      lat: 39.96,
      lon: 37.72,
      demElevationM: 1968,
      subBasinId: "yildiz_kose_kizildag_alpine_ridge",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.25,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "17684": {
      stationId: 17684,
      nameTr: "Sivas Suşehri (Kelkit Havzası)",
      lat: 40.1623,
      lon: 38.0752,
      demElevationM: 1164,
      subBasinId: "kelkit_susehri_koyulhisar_trough",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.42,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18471": {
      stationId: 18471,
      nameTr: "Sivas Koyulhisar (Aşağı Kelkit Ilıman Vadi Tabanı)",
      lat: 40.3008,
      lon: 37.8239,
      demElevationM: 860,
      subBasinId: "kelkit_susehri_koyulhisar_trough",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18465": {
      stationId: 18465,
      nameTr: "Sivas Akıncılar (Kelkit Vadi Oluğu)",
      lat: 40.1108,
      lon: 38.3411,
      demElevationM: 885,
      subBasinId: "kelkit_susehri_koyulhisar_trough",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.38,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [860, 1285, 1752, 2552],
    maxPhysicalPeakM: 3015,
    snowElevationBands: SIVAS_HYPSO.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "kose_yildiz_kelkit_divide_barrier",
      labelTr: "Köse Dağları & Yıldız Dağı (2552m) — Kelkit Fön İnişi ve Karadeniz Kalkanı",
      effectiveBarrierHeightM: 2350,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "kelkit_susehri_koyulhisar_trough",
        "yukari_kizilirmak_sivas_basin",
        "yildiz_kose_kizildag_alpine_ridge"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 230 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.76,
        sourcePlateauElevationM: 1650,
        maxTargetElevationM: 1180,
        maxWarmingCapC: 5.6,
        subCloudVirgaFactor: 0.64,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 325, toDeg: 40 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.14,
        maxPrecipMultiplierCap: 1.46
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 340, toDeg: 30 },
        precipAttenuationFactor: 0.54
      }
    }
  ],
  venturiCorridors: [
    {
      id: "kizildag_imranli_siberian_frost_chute",
      labelTr: "Kızıldağ (2190m) – İmranlı – Zara Doğu Kontinental Ayaz Oluğu",
      centerCoord: { lat: 39.884, lon: 37.92 },
      influenceRadiusKm: 44,
      channelAxisFromDeg: 78,
      bidirectional: true,
      sectorHalfWidthDeg: 34,
      speedMultiplier: 1.36,
      gustMultiplier: 1.5,
      suppressesNocturnalInversion: true
    },
    {
      id: "camlibel_ltar_ridge_jet",
      labelTr: "Çamlıbel – Nuri Demirağ (LTAR 1596m) Kuzeybatı Sırt İvmelenmesi",
      centerCoord: { lat: 39.8138, lon: 36.9035 },
      influenceRadiusKm: 26,
      channelAxisFromDeg: 325,
      bidirectional: true,
      sectorHalfWidthDeg: 36,
      speedMultiplier: 1.32,
      gustMultiplier: 1.46,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1285,
    coldPoolMaxDepthM: 360,
    topographicEnclosureIndex: 0.88,
    deltaPressureTopHpa: 820,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 8.6
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.6
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 45, toDeg: 105 },
      minWindShearVs850Deg: 65
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.44,
    invertedVDryMicroburstSusceptibility: 0.58,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TGT_SIVAS_MERKEZ",
      labelTr: "Sivas Merkez Yukarı Kızılırmak Tabanı (1285m)",
      lat: 39.7437,
      lon: 37.002,
      elevationM: 1285,
      role: "target"
    },
    {
      key: "ORO_YILDIZ_DAGI",
      labelTr: "Yıldız Dağı Zirve Kütlesi (2552m)",
      lat: 40.1349,
      lon: 36.9388,
      elevationM: 2552,
      role: "orographic_wall"
    },
    {
      key: "COR_LTAR_DEMIRAG",
      labelTr: "Nuri Demirağ Havalimanı Rüzgarlı Sırtı (1596m)",
      lat: 39.8138,
      lon: 36.9035,
      elevationM: 1596,
      role: "corridor"
    },
    {
      key: "COR_IMRANLI_KIZILDAG",
      labelTr: "İmranlı – Kızıldağ Doğu Ayaz Kapısı (1595m)",
      lat: 39.8758,
      lon: 38.0983,
      elevationM: 1595,
      role: "corridor"
    },
    {
      key: "FOE_KANGAL_STEPPE",
      labelTr: "Kangal Yüksek Ayaz Bozkırı (1521m)",
      lat: 39.2428,
      lon: 37.389,
      elevationM: 1521,
      role: "foehn_windward"
    },
    {
      key: "FOE_ALTINYAYLA_ULAS",
      labelTr: "Altınyayla – Ulaş Güney Platosu (1443m)",
      lat: 39.2762,
      lon: 36.7182,
      elevationM: 1443,
      role: "foehn_windward"
    },
    {
      key: "ORO_KOSE_DAGLARI",
      labelTr: "Köse Dağları – Kelkit Su Bölümü Sırtı (2450m)",
      lat: 40.06,
      lon: 37.82,
      elevationM: 2450,
      role: "orographic_wall"
    },
    {
      key: "LEE_KELKIT_KOYULHISAR",
      labelTr: "Koyulhisar – Suşehri Kelkit Alçak Vadisi (860m)",
      lat: 40.3008,
      lon: 37.8239,
      elevationM: 860,
      role: "lee_shadow"
    },
    {
      key: "COR_SARKISLA_GEMEREK",
      labelTr: "Şarkışla – Gemerek Batı Kızılırmak Koridoru (1253m)",
      lat: 39.3331,
      lon: 36.4408,
      elevationM: 1253,
      role: "corridor"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -38,
    maxPlausibleTempC: 42,
    minPlausibleMslpHpa: 976,
    maxPlausibleMslpHpa: 1055,
    kalmanTempBiasCapC: 8.5
  }
};

export const PROVINCE_SPEC_TR_58: ProvinceSpec = Object.freeze(specTr58);
export default PROVINCE_SPEC_TR_58;
