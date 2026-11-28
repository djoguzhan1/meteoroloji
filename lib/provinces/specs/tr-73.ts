import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const SIRNAK_CLIM = TR81_CLIMATOLOGY_1991_2020["TR-73"];
const SIRNAK_HYPSO = TR81_HYPSOMETRIC_PROFILES["TR-73"];

/**
 * Bespoke >1000 m vertical escarpment & hyper-arid Tigris plain decoupling contract for `TR-73` Şırnak:
 * 1) Cizre–Silopi (`LTCV`, `~375–498 m` Tigris Mesopotamian Plain — historic official Cizre heat benchmark
 *    `+49.1°C`, `maxPlausibleTempC: 51`, near-zero winter snow) strictly isolated from center headline (`excludeFromCenterHeadline: true`),
 * 2) Şırnak Merkez (`1350–1400 m` Cudi / Namaz Dağı northern ridge),
 * 3) Uludere–Beytüşşebap (`1450–3356 m` Tanintanin / Kato / Altındağlar heavy winter snow belt),
 * 4) Strict topographic decoupling (`barrierCouplingMatrix <= 0.14`) between the Cizre–Silopi Tigris plain
 *    and both Şırnak Merkez (`0.11`) and Uludere–Beytüşşebap (`0.04`).
 */
export const TR_73_VERTICAL_ESCARPMENT_CONTRACT = Object.freeze({
  cizreTigrisPlainElevationRangeM: Object.freeze([375, 498] as const),
  cizreOfficialHeatBenchmarkC: 49.1,
  maxPlausibleTempC: 51,
  sirnakCenterRidgeElevationM: 1350,
  intraProvinceEscarpmentDropM: 975,
  beytussebapAlpineSnowPeakM: 3356,
  maxPlainToHighlandCoupling: 0.14,
  allowedMetarIcaos: Object.freeze(["LTCV"] as const),
  blockedForeignAndNeighborIcaos: Object.freeze([
    "ORER",
    "OSKL",
    "LTCL",
    "LTCK",
    "LTCW"
  ] as const)
});

const specTr73: ProvinceSpec = {
  provinceCode: "TR-73",
  plateCode: 73,
  slug: "sirnak",
  nameTr: "Şırnak",
  region: "SOUTHEASTERN_ANATOLIA",
  climateRegion: "GUNEYDOGU",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "SOUTHEAST_THRESHOLD_ARID",
  icaoWhitelist: ["LTCV"],
  domainBounds: {
    minLat: 37.1052,
    maxLat: 37.767,
    minLon: 41.5455,
    maxLon: 43.4993
  },
  primaryCenter: {
    mgmMerkezId: 97301,
    mgmIstNo: 17287,
    mgmSaatlikIstNo: 17287,
    mgmGunlukIstNo: 97301,
    lat: 37.5209,
    lon: 42.4523,
    demVerifiedElevationM: 1350,
    subBasinId: "sirnak_cudi_namaz_ridge",
    urbanFraction: 0.62,
    monthlyTmaxNormalsC: SIRNAK_CLIM.tmaxC,
    monthlyTminNormalsC: SIRNAK_CLIM.tminC
  },
  curatedSubLocations: [
    {
      id: "cizre-silopi-dicle-ova-tr",
      name: "Cizre – Silopi Dicle Mezopotamya Ovası (LTCV · 400m)",
      role: "coast",
      lat: 37.3326,
      lon: 42.2027,
      elevationM: 400
    },
    {
      id: "idil-guclukonak-esik-tr",
      name: "İdil – Güçlükonak Bazalt Platosu (790m)",
      role: "plain",
      lat: 37.3389,
      lon: 41.8897,
      elevationM: 790
    },
    {
      id: "sirnak-merkez-tr",
      name: "Şırnak Merkez (Cudi / Namaz Dağı Kuzey Sırtı · 1350m)",
      role: "foothill",
      lat: 37.5209,
      lon: 42.4523,
      elevationM: 1350
    },
    {
      id: "beytussebap-uludere-kar-tr",
      name: "Beytüşşebap – Uludere (Tanintanin / Kato Kar Kuşağı · 1450m)",
      role: "summit",
      lat: 37.5756,
      lon: 43.1608,
      elevationM: 1450
    },
    {
      id: "kato-altindaglar-zirve-tr",
      name: "Kato & Altındağlar Alpin Zirve Kuşağı (2750–3356m)",
      role: "summit",
      lat: 37.55,
      lon: 43.24,
      elevationM: 2750
    }
  ],
  subBasins: [
    {
      id: "cizre_silopi_tigris_plain",
      labelTr: "Cizre – Silopi – Habur (LTCV · 375–498m) Dicle Mezopotamya Hiper-Sıcak Ovası",
      polygonOrBbox: {
        minLat: 37.1052,
        maxLat: 37.41,
        minLon: 42.0,
        maxLon: 42.66
      },
      elevationRangeM: [350, 560],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.56
    },
    {
      id: "idil_guclukonak_basalt_step",
      labelTr: "İdil – Güçlükonak – Kasrik Boğazı (560–950m) Bazalt Eşik Kuşağı",
      polygonOrBbox: {
        minLat: 37.22,
        maxLat: 37.56,
        minLon: 41.5455,
        maxLon: 42.22
      },
      elevationRangeM: [560, 960],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.34
    },
    {
      id: "sirnak_cudi_namaz_ridge",
      labelTr: "Şırnak Merkez – Cudi Dağı (2114m) & Namaz Dağı Kuzey Sırtı (1150–2114m)",
      polygonOrBbox: {
        minLat: 37.36,
        maxLat: 37.66,
        minLon: 42.24,
        maxLon: 42.74
      },
      elevationRangeM: [1150, 2114],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.52
    },
    {
      id: "uludere_beytussebap_alpine_snow",
      labelTr: "Uludere – Beytüşşebap – Tanintanin / Kato / Altındağlar (1190–3356m) Yoğun Kar Kuşağı",
      polygonOrBbox: {
        minLat: 37.34,
        maxLat: 37.767,
        minLon: 42.74,
        maxLon: 43.4993
      },
      elevationRangeM: [1180, 3356],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.14
    }
  ],
  barrierCouplingMatrix: {
    cizre_silopi_tigris_plain: {
      cizre_silopi_tigris_plain: 1.0,
      idil_guclukonak_basalt_step: 0.42,
      sirnak_cudi_namaz_ridge: 0.11,
      uludere_beytussebap_alpine_snow: 0.04
    },
    idil_guclukonak_basalt_step: {
      cizre_silopi_tigris_plain: 0.42,
      idil_guclukonak_basalt_step: 1.0,
      sirnak_cudi_namaz_ridge: 0.28,
      uludere_beytussebap_alpine_snow: 0.1
    },
    sirnak_cudi_namaz_ridge: {
      cizre_silopi_tigris_plain: 0.11,
      idil_guclukonak_basalt_step: 0.28,
      sirnak_cudi_namaz_ridge: 1.0,
      uludere_beytussebap_alpine_snow: 0.46
    },
    uludere_beytussebap_alpine_snow: {
      cizre_silopi_tigris_plain: 0.04,
      idil_guclukonak_basalt_step: 0.1,
      sirnak_cudi_namaz_ridge: 0.46,
      uludere_beytussebap_alpine_snow: 1.0
    }
  },
  stationOverrides: {
    "17287": {
      stationId: 17287,
      nameTr: "Şırnak Merkez (Cudi/Namaz Kuzey Sırtı · 1350m)",
      lat: 37.5209,
      lon: 42.4523,
      demElevationM: 1350,
      subBasinId: "sirnak_cudi_namaz_ridge",
      urbanFraction: 0.64,
      coldPoolSusceptibility: 0.26,
      verticalStratumRole: "mid_slope"
    },
    "17950": {
      stationId: 17950,
      nameTr: "Şırnak Cizre (Dicle Mezopotamya Ovası · +49.1°C Rekor Havzası)",
      lat: 37.3326,
      lon: 42.2027,
      demElevationM: 400,
      subBasinId: "cizre_silopi_tigris_plain",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17949": {
      stationId: 17949,
      nameTr: "Şırnak Şerafettin Elçi Havalimanı OMGİ (LTCV · Cizre Ovası 621m)",
      lat: 37.3639,
      lon: 42.0597,
      demElevationM: 621,
      subBasinId: "cizre_silopi_tigris_plain",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    LTCV: {
      stationId: "LTCV",
      nameTr: "Şırnak Şerafettin Elçi Havalimanı METAR (LTCV · Cizre Düzlüğü, Merkezden ~730m Alçak!)",
      lat: 37.3639,
      lon: 42.0597,
      demElevationM: 621,
      subBasinId: "cizre_silopi_tigris_plain",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18344": {
      stationId: 18344,
      nameTr: "Şırnak Silopi (Habur – Cudi Güney Etek Ovası · 498m)",
      lat: 37.2308,
      lon: 42.4864,
      demElevationM: 498,
      subBasinId: "cizre_silopi_tigris_plain",
      urbanFraction: 0.52,
      coldPoolSusceptibility: 0.38,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18343": {
      stationId: 18343,
      nameTr: "Şırnak İdil (Bazalt Platosu · 790m)",
      lat: 37.3389,
      lon: 41.8897,
      demElevationM: 790,
      subBasinId: "idil_guclukonak_basalt_step",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18336": {
      stationId: 18336,
      nameTr: "Şırnak Güçlükonak (Dicle Boğaz Sırtı · 811m)",
      lat: 37.4689,
      lon: 41.9203,
      demElevationM: 811,
      subBasinId: "idil_guclukonak_basalt_step",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.32,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18175": {
      stationId: 18175,
      nameTr: "Şırnak Uludere (Tanintanin Batı Yamacı · 1190m)",
      lat: 37.4475,
      lon: 42.8453,
      demElevationM: 1190,
      subBasinId: "uludere_beytussebap_alpine_snow",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18342": {
      stationId: 18342,
      nameTr: "Şırnak Beytüşşebap (Habur Çayı / Kato – Altındağlar Kar Havzası · 1450m)",
      lat: 37.5756,
      lon: 43.1608,
      demElevationM: 1450,
      subBasinId: "uludere_beytussebap_alpine_snow",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [380, 1360, 1920, 2750],
    maxPhysicalPeakM: 3356,
    snowElevationBands: SIRNAK_HYPSO.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "cudi_tanintanin_kato_escarpment_wall",
      labelTr: "Cudi (2114m) – Tanintanin – Kato / Altındağlar (3356m) >1000m Dikey Basamak Duvarı",
      effectiveBarrierHeightM: 3200,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "sirnak_cudi_namaz_ridge",
        "uludere_beytussebap_alpine_snow"
      ],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 10, toDeg: 65 },
        minCrossCrestSpeedMs: 12.0,
        minFroudeNumber: 1.1,
        sourcePlateauElevationM: 2100,
        maxTargetElevationM: 1450,
        maxWarmingCapC: 2.0,
        subCloudVirgaFactor: 0.78,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 170, toDeg: 250 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.26,
        maxPrecipMultiplierCap: 1.82
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 5, toDeg: 65 },
        precipAttenuationFactor: 0.54
      }
    },
    {
      id: "cudi_south_face_cizre_downslope_foehn",
      labelTr: "Cudi – Gabar Güney Eteği — Kuzeydoğulu Kuru İniş Fönü & Cizre–Silopi Sıcak Kalkanı",
      effectiveBarrierHeightM: 2114,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "cizre_silopi_tigris_plain",
        "idil_guclukonak_basalt_step"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 350, toDeg: 65 },
        minCrossCrestSpeedMs: 6.5,
        minFroudeNumber: 0.75,
        sourcePlateauElevationM: 1450,
        maxTargetElevationM: 650,
        maxWarmingCapC: 5.4,
        subCloudVirgaFactor: 0.48,
        wetCutoffMmHr: 0.2
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 175, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.14,
        maxPrecipMultiplierCap: 1.36
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 355, toDeg: 60 },
        precipAttenuationFactor: 0.46
      }
    }
  ],
  venturiCorridors: [
    {
      id: "kasrik_bogazi_tigris_gap",
      labelTr: "Kasrik Boğazı (Cizre – Şırnak/Gabar Arası Dicle Kanyon Geçidi)",
      centerCoord: { lat: 37.395, lon: 42.17 },
      influenceRadiusKm: 18,
      channelAxisFromDeg: 15,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.36,
      gustMultiplier: 1.5,
      suppressesNocturnalInversion: true
    },
    {
      id: "cizre_silopi_habur_desert_jet",
      labelTr: "Cizre – Silopi – Habur Mezopotamya Sıcak/Toz Koridoru",
      centerCoord: { lat: 37.27, lon: 42.34 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 195,
      bidirectional: true,
      sectorHalfWidthDeg: 34,
      speedMultiplier: 1.26,
      gustMultiplier: 1.4,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1450,
    coldPoolMaxDepthM: 420,
    topographicEnclosureIndex: 0.84,
    deltaPressureTopHpa: 750,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 8.2
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.65
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 55, toDeg: 140 },
      minWindShearVs850Deg: 65
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.94,
    invertedVDryMicroburstSusceptibility: 0.84,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TGT_SIRNAK_CENTER",
      labelTr: "Şırnak Merkez (Cudi/Namaz Kuzey Sırtı · 1350m)",
      lat: 37.5209,
      lon: 42.4523,
      elevationM: 1350,
      role: "target"
    },
    {
      key: "COR_CIZRE_TIGRIS",
      labelTr: "Cizre Dicle Mezopotamya Ovası (+49.1°C Rekor · 400m)",
      lat: 37.3326,
      lon: 42.2027,
      elevationM: 400,
      role: "corridor"
    },
    {
      key: "COR_SILOPI_HABUR",
      labelTr: "Silopi – Habur Güney Sınır Düzlüğü (498m)",
      lat: 37.2308,
      lon: 42.4864,
      elevationM: 498,
      role: "corridor"
    },
    {
      key: "COR_IDIL_STEPPE",
      labelTr: "İdil Bazalt Eşiği (790m)",
      lat: 37.3389,
      lon: 41.8897,
      elevationM: 790,
      role: "corridor"
    },
    {
      key: "COR_GUCLUKONAK_GORGE",
      labelTr: "Güçlükonak Dicle Boğaz Sırtı (811m)",
      lat: 37.4689,
      lon: 41.9203,
      elevationM: 811,
      role: "corridor"
    },
    {
      key: "ORO_CUDI_SUMMIT",
      labelTr: "Cudi Dağı Güney Duvarı (2114m)",
      lat: 37.39,
      lon: 42.47,
      elevationM: 2114,
      role: "orographic_wall"
    },
    {
      key: "ORO_ULUDERE_PASS",
      labelTr: "Uludere – Tanintanin Geçit Kuşağı (1920m)",
      lat: 37.48,
      lon: 43.02,
      elevationM: 1920,
      role: "orographic_wall"
    },
    {
      key: "FOE_BEYTUSSEBAP_SNOW",
      labelTr: "Beytüşşebap Kar Havzası (1450m)",
      lat: 37.5756,
      lon: 43.1608,
      elevationM: 1450,
      role: "foehn_windward"
    },
    {
      key: "ORO_KATO_ALTINDAGLAR",
      labelTr: "Kato – Altındağlar Alpin Zirve Duvarı (3356m)",
      lat: 37.55,
      lon: 43.24,
      elevationM: 3356,
      role: "orographic_wall"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -28,
    maxPlausibleTempC: 51,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1050,
    kalmanTempBiasCapC: 8.0
  }
};

export const PROVINCE_SPEC_TR_73: ProvinceSpec = Object.freeze(specTr73);
export default PROVINCE_SPEC_TR_73;
