import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_47 = TR81_CLIMATOLOGY_1991_2020["TR-47"];
const HYPSO_TR_47 = TR81_HYPSOMETRIC_PROFILES["TR-47"];

/**
 * ATMOS v5.0 — Wave 3C (`REG-22`) Bespoke Microclimate Contract: `TR-47` Mardin
 *
 * Critical Two-World Topographic Dichotomy:
 *  1. Mardin Castle / Historic Artuklu Limestone Escarpment Ridge (`1,040–1,080 m`)
 *     vs. Kızıltepe–Nusaybin Mesopotamian Plain (`LTCR`, `480–525 m`):
 *     Across < 12 km horizontal span, elevation plunges ~550 m onto the flat Syrian-border steppe.
 *     During calm winter nights, radiative cooling & katabatic drainage form an inversion / fog pool
 *     (`basinFloorElevationM: 480`, `coldPoolMaxDepthM: 320` -> `Z_i = 800 m`) engulfing `LTCR` (`523 m`),
 *     Kızıltepe (`480 m`), and Nusaybin (`488 m`), while 1,040 m Mardin Merkez stays +240 m ABOVE
 *     the inversion top in a milder free-tropospheric thermal belt (`excludeFromCenterHeadline: true` on `LTCR`).
 *  2. First-Contact Syrian Desert Dust Wall (`dustTransportSusceptibility: 0.96`) & Mazıdağı Plateau:
 *     Direct southerly/southwesterly (`155°–235°`) Syrian Desert / Al-Jazira khamsin and haboob plumes
 *     strike the Mardin–Bagok limestone threshold head-on, while winter Mediterranean-Syrian troughs
 *     undergo abrupt first-contact upslope lift (`1.62x`) producing plateau snow on Mazıdağı–Ömerli (`1,032–1,180 m`).
 *  3. Strict Border & Tier-B Calibration Isolation:
 *     `calibrationTier: "TIER_B_DONOR_KALMAN"`, `icaoWhitelist: ["LTCR"]` (strictly blocking Qamishli `OSKL`).
 */
export const TR_47_ESCARPMENT_PLAIN_DICHOTOMY_CONTRACT = Object.freeze({
  mardinCastleRidgeElevationM: 1050,
  artukluCenterElevationM: 1040,
  ltcrPlainAirportElevationM: 523,
  kiziltepePlainElevationM: 480,
  mesopotamianColdPoolTopM: 800,
  mazidagiHighPlateauElevationM: 1032,
  bagokIzlaSummitM: 1385,
  dustTransportSusceptibility: 0.96,
  calibrationMode: "TIER_B_DONOR_ALARO" as const,
  allowedMetarIcaos: Object.freeze(["LTCR"] as const),
  blockedForeignAndNeighborIcaos: Object.freeze([
    "OSKL",
    "LTCC",
    "LTCS",
    "LTCJ",
    "LTCV"
  ] as const)
});

const specTr47: ProvinceSpec = {
  provinceCode: "TR-47",
  plateCode: 47,
  slug: "mardin",
  nameTr: "Mardin",
  region: "SOUTHEASTERN_ANATOLIA",
  climateRegion: "GUNEYDOGU",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "SOUTHEAST_THRESHOLD_ARID",
  icaoWhitelist: ["LTCR"],
  domainBounds: {
    minLat: 36.9115,
    maxLat: 37.7362,
    minLon: 39.886,
    maxLon: 41.8972
  },
  primaryCenter: {
    mgmMerkezId: 94711,
    mgmIstNo: 17275,
    mgmSaatlikIstNo: 17275,
    mgmGunlukIstNo: 94701,
    lat: 37.3103,
    lon: 40.7284,
    demVerifiedElevationM: 1040,
    subBasinId: "mardin_artuklu_escarpment_ridge",
    urbanFraction: 0.72,
    monthlyTmaxNormalsC: CLIM_TR_47.tmaxC,
    monthlyTminNormalsC: CLIM_TR_47.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-47-kiziltepe-ltcr-ova",
      name: "Kızıltepe – Mezopotamya Ovası (LTCR)",
      role: "plain",
      lat: 37.2058,
      lon: 40.5725,
      elevationM: 480
    },
    {
      id: "tr-47-nusaybin-sinir-ova",
      name: "Nusaybin Alt Mezopotamya Düzlüğü",
      role: "plain",
      lat: 37.0833,
      lon: 41.2343,
      elevationM: 488
    },
    {
      id: "tr-47-mardin-kalesi-artuklu",
      name: "Mardin Merkez (Eski Mardin / Artuklu Kalker Sırtı)",
      role: "foothill",
      lat: 37.3103,
      lon: 40.7284,
      elevationM: 1040
    },
    {
      id: "tr-47-mazidagi-omerli-plato",
      name: "Mazıdağı – Ömerli Yüksek Kalker Platosu",
      role: "foothill",
      lat: 37.4761,
      lon: 40.4914,
      elevationM: 1032
    },
    {
      id: "tr-47-midyat-bagok-turabdin",
      name: "Midyat – Bagok (İzla) Dağı Sırtı",
      role: "summit",
      lat: 37.205,
      lon: 41.485,
      elevationM: 1320
    }
  ],
  subBasins: [
    {
      id: "mardin_artuklu_escarpment_ridge",
      labelTr: "Eski Mardin Kalesi – Artuklu – Yeşilli – Derik Güney Kalker Eşiğinin Enverziyon-Üstü Sırtı",
      polygonOrBbox: {
        minLat: 37.26,
        maxLat: 37.42,
        minLon: 40.18,
        maxLon: 40.92
      },
      elevationRangeM: [700, 1120],
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.68
    },
    {
      id: "kiziltepe_nusaybin_mesopotamian_plain",
      labelTr: "Kızıltepe – Nusaybin – Mardin Havalimanı (LTCR) Mezopotamya Düzlüğü & Kış Sis/Enverziyon Tabanı",
      polygonOrBbox: {
        minLat: 36.9115,
        maxLat: 37.26,
        minLon: 39.95,
        maxLon: 41.55
      },
      elevationRangeM: [440, 650],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.44
    },
    {
      id: "mazidagi_omerli_savur_high_plateau",
      labelTr: "Mazıdağı – Ömerli – Savur Yüksek Kalker Platosu (940–1260 m)",
      polygonOrBbox: {
        minLat: 37.38,
        maxLat: 37.7362,
        minLon: 39.886,
        maxLon: 41.08
      },
      elevationRangeM: [880, 1260],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.24
    },
    {
      id: "midyat_bagok_dargecit_turabdin",
      labelTr: "Midyat – Dargeçit – Bagok (İzla 1385m) Tur Abdin Kalker Kütlesi",
      polygonOrBbox: {
        minLat: 37.16,
        maxLat: 37.66,
        minLon: 41.08,
        maxLon: 41.8972
      },
      elevationRangeM: [820, 1385],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.26
    }
  ],
  barrierCouplingMatrix: {
    mardin_artuklu_escarpment_ridge: {
      mardin_artuklu_escarpment_ridge: 1.0,
      kiziltepe_nusaybin_mesopotamian_plain: 0.16,
      mazidagi_omerli_savur_high_plateau: 0.72,
      midyat_bagok_dargecit_turabdin: 0.62
    },
    kiziltepe_nusaybin_mesopotamian_plain: {
      mardin_artuklu_escarpment_ridge: 0.16,
      kiziltepe_nusaybin_mesopotamian_plain: 1.0,
      mazidagi_omerli_savur_high_plateau: 0.12,
      midyat_bagok_dargecit_turabdin: 0.18
    },
    mazidagi_omerli_savur_high_plateau: {
      mardin_artuklu_escarpment_ridge: 0.72,
      kiziltepe_nusaybin_mesopotamian_plain: 0.12,
      mazidagi_omerli_savur_high_plateau: 1.0,
      midyat_bagok_dargecit_turabdin: 0.66
    },
    midyat_bagok_dargecit_turabdin: {
      mardin_artuklu_escarpment_ridge: 0.62,
      kiziltepe_nusaybin_mesopotamian_plain: 0.18,
      mazidagi_omerli_savur_high_plateau: 0.66,
      midyat_bagok_dargecit_turabdin: 1.0
    }
  },
  stationOverrides: {
    "17275": {
      stationId: 17275,
      nameTr: "Mardin Merkez / Artuklu (Tarihi Kalker Sırtı 1040m — Enverziyon Üstü)",
      lat: 37.3103,
      lon: 40.7284,
      demElevationM: 1040,
      subBasinId: "mardin_artuklu_escarpment_ridge",
      urbanFraction: 0.72,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "mid_slope"
    },
    LTCR: {
      stationId: "LTCR",
      nameTr: "Mardin Prof. Dr. Aziz Sancar Havalimanı (LTCR · Kızıltepe Ovası 523m)",
      lat: 37.2233,
      lon: 40.6317,
      demElevationM: 523,
      subBasinId: "kiziltepe_nusaybin_mesopotamian_plain",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17276": {
      stationId: 17276,
      nameTr: "Mardin Havalimanı MGM (17276 / LTCR · 523m)",
      lat: 37.2233,
      lon: 40.6317,
      demElevationM: 523,
      subBasinId: "kiziltepe_nusaybin_mesopotamian_plain",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18332": {
      stationId: 18332,
      nameTr: "Mardin Kızıltepe (Mezopotamya Ovası 480m)",
      lat: 37.2058,
      lon: 40.5725,
      demElevationM: 480,
      subBasinId: "kiziltepe_nusaybin_mesopotamian_plain",
      urbanFraction: 0.56,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17948": {
      stationId: 17948,
      nameTr: "Mardin Nusaybin (Mezopotamya Sınır Düzlüğü 488m)",
      lat: 37.0833,
      lon: 41.2343,
      demElevationM: 488,
      subBasinId: "kiziltepe_nusaybin_mesopotamian_plain",
      urbanFraction: 0.5,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18331": {
      stationId: 18331,
      nameTr: "Mardin Derik (Batı Kalker Eşik Yamacı)",
      lat: 37.3464,
      lon: 40.2573,
      demElevationM: 700,
      subBasinId: "mardin_artuklu_escarpment_ridge",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.32,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18335": {
      stationId: 18335,
      nameTr: "Mardin Yeşilli (Vadi Boğaz Yamacı)",
      lat: 37.3363,
      lon: 40.8139,
      demElevationM: 769,
      subBasinId: "mardin_artuklu_escarpment_ridge",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18167": {
      stationId: 18167,
      nameTr: "Mardin Mazıdağı (Yüksek Kalker Platosu 1032m)",
      lat: 37.4761,
      lon: 40.4914,
      demElevationM: 1032,
      subBasinId: "mazidagi_omerli_savur_high_plateau",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18333": {
      stationId: 18333,
      nameTr: "Mardin Ömerli (Eşik Üstü Yüksek Plato 1134m)",
      lat: 37.3961,
      lon: 40.9347,
      demElevationM: 1134,
      subBasinId: "mazidagi_omerli_savur_high_plateau",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18334": {
      stationId: 18334,
      nameTr: "Mardin Savur",
      lat: 37.5347,
      lon: 40.8889,
      demElevationM: 940,
      subBasinId: "mazidagi_omerli_savur_high_plateau",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.5,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18168": {
      stationId: 18168,
      nameTr: "Mardin Midyat (Tur Abdin Kalker Platosu)",
      lat: 37.4364,
      lon: 41.3272,
      demElevationM: 946,
      subBasinId: "midyat_bagok_dargecit_turabdin",
      urbanFraction: 0.46,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18330": {
      stationId: 18330,
      nameTr: "Mardin Dargeçit (Ilısu / Dicle Kanyon Üstü)",
      lat: 37.5533,
      lon: 41.7033,
      demElevationM: 940,
      subBasinId: "midyat_bagok_dargecit_turabdin",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.38,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [480, 800, 1120, 1385],
    maxPhysicalPeakM: HYPSO_TR_47.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_47.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "mardin_bagok_limestone_escarpment_wall",
      labelTr: "Mardin Eşiği & Bagok (İzla 1385m) Güney Kalker Duvarı — İlk-Temas Yamaç Yağışı & Kuzeyli Ova Fönü",
      effectiveBarrierHeightM: 1280,
      crestPressureHpa: 850,
      applicableSubBasins: [
        "mardin_artuklu_escarpment_ridge",
        "mazidagi_omerli_savur_high_plateau",
        "midyat_bagok_dargecit_turabdin",
        "kiziltepe_nusaybin_mesopotamian_plain"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 340, toDeg: 45 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.68,
        sourcePlateauElevationM: 1080,
        maxTargetElevationM: 620,
        maxWarmingCapC: 4.4,
        subCloudVirgaFactor: 0.76,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 155, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.2,
        maxPrecipMultiplierCap: 1.62
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 345, toDeg: 40 },
        precipAttenuationFactor: 0.56
      }
    }
  ],
  venturiCorridors: [
    {
      id: "yesilli_deyrulzafaran_escarpment_chute",
      labelTr: "Yeşilli – Mardin Boğazı Kalker Yamaç Katabatik / Güneyli Toz İvmelenme Oluğu",
      centerCoord: { lat: 37.318, lon: 40.785 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 195,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.28,
      gustMultiplier: 1.42,
      suppressesNocturnalInversion: true
    },
    {
      id: "nusaybin_cagcac_border_gap",
      labelTr: "Nusaybin – Çağçağ Vadisi Mezopotamya / Tur Abdin Boğaz Çıkışı",
      centerCoord: { lat: 37.135, lon: 41.245 },
      influenceRadiusKm: 22,
      channelAxisFromDeg: 185,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.24,
      gustMultiplier: 1.36,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 480,
    coldPoolMaxDepthM: 320,
    topographicEnclosureIndex: 0.78,
    deltaPressureTopHpa: 924,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 2.5,
      maxExtraRadiativeCoolingC: 4.6
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.7
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.96,
    invertedVDryMicroburstSusceptibility: 0.82,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TGT_MARDIN_RIDGE",
      labelTr: "Mardin Merkez / Artuklu Tarihi Kalker Sırtı (1040m)",
      lat: 37.3103,
      lon: 40.7284,
      elevationM: 1040,
      role: "target"
    },
    {
      key: "LEE_KIZILTEPE_PLAIN",
      labelTr: "Kızıltepe Mezopotamya Ovası & Enverziyon Tabanı (480m)",
      lat: 37.2058,
      lon: 40.5725,
      elevationM: 480,
      role: "lee_shadow"
    },
    {
      key: "LEE_NUSAYBIN_PLAIN",
      labelTr: "Nusaybin Suriye Sınırı Mezopotamya Düzlüğü (488m)",
      lat: 37.0833,
      lon: 41.2343,
      elevationM: 488,
      role: "lee_shadow"
    },
    {
      key: "COR_YESILLI_GORGE",
      labelTr: "Yeşilli – Mardin Eşik Boğazı (769m)",
      lat: 37.3363,
      lon: 40.8139,
      elevationM: 769,
      role: "corridor"
    },
    {
      key: "ORO_DERIK_WEST_SCARP",
      labelTr: "Derik Batı Mardin Eşiği Yamacı (700m)",
      lat: 37.3464,
      lon: 40.2573,
      elevationM: 700,
      role: "orographic_wall"
    },
    {
      key: "FOE_MAZIDAGI_PLATEAU",
      labelTr: "Mazıdağı Yüksek Kalker Platosu (1032m)",
      lat: 37.4761,
      lon: 40.4914,
      elevationM: 1032,
      role: "foehn_windward"
    },
    {
      key: "FOE_OMERLI_CREST",
      labelTr: "Ömerli Yüksek Eşik Sırtı (1134m)",
      lat: 37.3961,
      lon: 40.9347,
      elevationM: 1134,
      role: "foehn_windward"
    },
    {
      key: "ORO_BAGOK_IZLA_CREST",
      labelTr: "Bagok (İzla) Dağı Güney Kalker Duvarı (1320m)",
      lat: 37.205,
      lon: 41.485,
      elevationM: 1320,
      role: "orographic_wall"
    },
    {
      key: "FOE_MIDYAT_TURABDIN",
      labelTr: "Midyat Tur Abdin Kalker Platosu (946m)",
      lat: 37.4364,
      lon: 41.3272,
      elevationM: 946,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -20,
    maxPlausibleTempC: 49,
    minPlausibleMslpHpa: 985,
    maxPlausibleMslpHpa: 1045,
    kalmanTempBiasCapC: 5.2
  }
};

export const PROVINCE_SPEC_TR_47: ProvinceSpec = Object.freeze(specTr47);
export default PROVINCE_SPEC_TR_47;
