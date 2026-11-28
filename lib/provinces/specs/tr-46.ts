import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const MARAS_CLIM = TR81_CLIMATOLOGY_1991_2020["TR-46"];
const MARAS_HYPSO = TR81_HYPSOMETRIC_PROFILES["TR-46"];

/**
 * Bespoke dual-world mountain divide contract for `TR-46` Kahramanmaraş:
 * Southern Mediterranean foothill (`568m` Maraş Merkez -> `2300m` Ahır Dağı / Yedikuyular)
 * vs. Northern Binboğa/Engizek/Berit (`3014m`) walled Göksun & Elbistan–Afşin (`1137–1350m`)
 * extreme snowpack radiative frost basin (`-25..-30°C`, `snowpackBoostFactor: 1.5`, `kalmanTempBiasCapC: 8.0`).
 */
export const TR_46_DUAL_CLIMATE_BASIN_CONTRACT = Object.freeze({
  centerDemRepairedElevationM: 568,
  ahirDagiYedikuyularSummitM: 2300,
  beritDagiDivideM: 3014,
  northernFrostBasinElevationRangeM: Object.freeze([1137, 1368] as const),
  extremeWinterMinFloorC: -30.0,
  kalmanTempBiasCapC: 8.0,
  snowpackBoostFactor: 1.5,
  allowedMetarIcaos: Object.freeze(["LTCN"] as const)
});

const specTr46: ProvinceSpec = {
  provinceCode: "TR-46",
  plateCode: 46,
  slug: "kahramanmaras",
  nameTr: "Kahramanmaraş",
  region: "MEDITERRANEAN",
  climateRegion: "AKDENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "MEDITERRANEAN_COASTAL_OROG",
  icaoWhitelist: ["LTCN"],
  domainBounds: {
    minLat: 37.181,
    maxLat: 38.586,
    minLon: 36.2013,
    maxLon: 37.752
  },
  primaryCenter: {
    mgmMerkezId: 94601,
    mgmIstNo: 17255,
    mgmSaatlikIstNo: 17255,
    mgmGunlukIstNo: 94601,
    wmoId: "17255",
    lat: 37.576,
    lon: 36.915,
    demVerifiedElevationM: 568,
    subBasinId: "maras_aksu_southern_foothill",
    urbanFraction: 0.8,
    monthlyTmaxNormalsC: MARAS_CLIM.tmaxC,
    monthlyTminNormalsC: MARAS_CLIM.tminC
  },
  curatedSubLocations: [
    {
      id: "maras-turkoglu-ova-tr",
      name: "Türkoğlu – Aksu Alt Ovası",
      role: "coast",
      lat: 37.3835,
      lon: 36.8427,
      elevationM: 460
    },
    {
      id: "kahramanmaras-merkez-tr",
      name: "Kahramanmaraş Merkez (Onikişubat / Dulkadiroğlu)",
      role: "plain",
      lat: 37.576,
      lon: 36.915,
      elevationM: 568
    },
    {
      id: "maras-elbistan-goksun-tr",
      name: "Göksun / Elbistan Kuzey Kar Havzası",
      role: "foothill",
      lat: 38.2038,
      lon: 37.1982,
      elevationM: 1137
    },
    {
      id: "maras-yedikuyular-kayak-tr",
      name: "Yedikuyular Kayak Merkezi / Ahır – Berit Zirve",
      role: "summit",
      lat: 37.6406,
      lon: 37.0291,
      elevationM: 1871
    }
  ],
  subBasins: [
    {
      id: "maras_aksu_southern_foothill",
      labelTr: "Kahramanmaraş Merkez – Türkoğlu – Pazarcık Güney Akdeniz Geçiş Havzası",
      polygonOrBbox: {
        minLat: 37.181,
        maxLat: 37.63,
        minLon: 36.6,
        maxLon: 37.45
      },
      elevationRangeM: [430, 920],
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.68
    },
    {
      id: "andirin_caglayancerit_transition",
      labelTr: "Andırın – Başkonuş – Çağlayancerit Orografik Yamaç Kuşağı",
      polygonOrBbox: {
        minLat: 37.48,
        maxLat: 37.88,
        minLon: 36.2013,
        maxLon: 37.48
      },
      elevationRangeM: [750, 1650],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.22
    },
    {
      id: "ahir_engizek_berit_alpine_wall",
      labelTr: "Ahır Dağı (2300m) – Engizek – Berit (3014m) – Binboğa Alpin Bariyer Duvarı",
      polygonOrBbox: {
        minLat: 37.62,
        maxLat: 38.08,
        minLon: 36.45,
        maxLon: 37.55
      },
      elevationRangeM: [1650, 3054],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.06
    },
    {
      id: "elbistan_afsin_goksun_frost_basin",
      labelTr: "Göksun – Elbistan – Afşin – Ekinözü – Nurhak Kar/Ayaz Kapalı Havzası",
      polygonOrBbox: {
        minLat: 37.9,
        maxLat: 38.586,
        minLon: 36.32,
        maxLon: 37.752
      },
      elevationRangeM: [1100, 1650],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.28
    }
  ],
  barrierCouplingMatrix: {
    maras_aksu_southern_foothill: {
      maras_aksu_southern_foothill: 1.0,
      andirin_caglayancerit_transition: 0.42,
      ahir_engizek_berit_alpine_wall: 0.18,
      elbistan_afsin_goksun_frost_basin: 0.06
    },
    andirin_caglayancerit_transition: {
      maras_aksu_southern_foothill: 0.4,
      andirin_caglayancerit_transition: 1.0,
      ahir_engizek_berit_alpine_wall: 0.48,
      elbistan_afsin_goksun_frost_basin: 0.16
    },
    ahir_engizek_berit_alpine_wall: {
      maras_aksu_southern_foothill: 0.16,
      andirin_caglayancerit_transition: 0.45,
      ahir_engizek_berit_alpine_wall: 1.0,
      elbistan_afsin_goksun_frost_basin: 0.38
    },
    elbistan_afsin_goksun_frost_basin: {
      maras_aksu_southern_foothill: 0.05,
      andirin_caglayancerit_transition: 0.15,
      ahir_engizek_berit_alpine_wall: 0.36,
      elbistan_afsin_goksun_frost_basin: 1.0
    }
  },
  stationOverrides: {
    "17255": {
      stationId: 17255,
      nameTr: "Kahramanmaraş Merkez (WMO 17255 · DEM Onarımlı)",
      lat: 37.576,
      lon: 36.915,
      demElevationM: 568,
      subBasinId: "maras_aksu_southern_foothill",
      urbanFraction: 0.82,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "basin_floor"
    },
    "17256": {
      stationId: 17256,
      nameTr: "Kahramanmaraş Dulkadiroğlu / Havalimanı (LTCN)",
      lat: 37.5402,
      lon: 36.9685,
      demElevationM: 525,
      subBasinId: "maras_aksu_southern_foothill",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "basin_floor"
    },
    "18282": {
      stationId: 18282,
      nameTr: "Kahramanmaraş Türkoğlu (Aksu Koridoru)",
      lat: 37.3835,
      lon: 36.8427,
      demElevationM: 535,
      subBasinId: "maras_aksu_southern_foothill",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "coastal_or_gap"
    },
    "18156": {
      stationId: 18156,
      nameTr: "Kahramanmaraş Andırın (Orografik Yağış Yamacı)",
      lat: 37.5908,
      lon: 36.3642,
      demElevationM: 1108,
      subBasinId: "andirin_caglayancerit_transition",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.35,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18279": {
      stationId: 18279,
      nameTr: "Kahramanmaraş Çağlayancerit (Sensör DEM 985m · İlçe 1117m)",
      lat: 37.7503,
      lon: 37.2909,
      demElevationM: 985,
      subBasinId: "andirin_caglayancerit_transition",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "19908": {
      stationId: 19908,
      nameTr: "Kahramanmaraş Yedikuyular Kayak Merkezi (Ahır Dağı)",
      lat: 37.6406,
      lon: 37.0291,
      demElevationM: 1871,
      subBasinId: "ahir_engizek_berit_alpine_wall",
      urbanFraction: 0.05,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "17866": {
      stationId: 17866,
      nameTr: "Kahramanmaraş Göksun (Kuzey Ayaz Çanağı)",
      lat: 38.024,
      lon: 36.4823,
      demElevationM: 1344,
      subBasinId: "elbistan_afsin_goksun_frost_basin",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.96,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "17870": {
      stationId: 17870,
      nameTr: "Kahramanmaraş Elbistan (Kapalı Kar Havzası)",
      lat: 38.2038,
      lon: 37.1982,
      demElevationM: 1137,
      subBasinId: "elbistan_afsin_goksun_frost_basin",
      urbanFraction: 0.45,
      coldPoolSusceptibility: 0.95,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "17868": {
      stationId: 17868,
      nameTr: "Kahramanmaraş Afşin",
      lat: 38.2405,
      lon: 36.919,
      demElevationM: 1230,
      subBasinId: "elbistan_afsin_goksun_frost_basin",
      urbanFraction: 0.35,
      coldPoolSusceptibility: 0.92,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18281": {
      stationId: 18281,
      nameTr: "Kahramanmaraş Nurhak",
      lat: 37.9564,
      lon: 37.4472,
      demElevationM: 1368,
      subBasinId: "elbistan_afsin_goksun_frost_basin",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [460, 950, 1550, 2800],
    maxPhysicalPeakM: 3054,
    snowElevationBands: MARAS_HYPSO.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "ahir_engizek_berit_3014m_divide",
      labelTr: "Ahır Dağı (2300m) & Engizek–Berit (3014m) İki İklim Dünyası Duvarı",
      effectiveBarrierHeightM: 3014,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "maras_aksu_southern_foothill",
        "andirin_caglayancerit_transition"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 345, toDeg: 45 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.76,
        sourcePlateauElevationM: 1250,
        maxTargetElevationM: 750,
        maxWarmingCapC: 4.8,
        subCloudVirgaFactor: 0.6,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 175, toDeg: 245 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.2,
        maxPrecipMultiplierCap: 1.5
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 350, toDeg: 40 },
        precipAttenuationFactor: 0.48
      }
    },
    {
      id: "elbistan_goksun_lee_shield_wall",
      labelTr: "Berit–Binboğa Kuzey Yamacı — Elbistan/Göksun Kıta Kar Tutulumu ve Güneyli Yağış Gölgesi",
      effectiveBarrierHeightM: 3014,
      crestPressureHpa: 700,
      applicableSubBasins: ["elbistan_afsin_goksun_frost_basin"],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 170, toDeg: 220 },
        minCrossCrestSpeedMs: 12.0,
        minFroudeNumber: 1.15,
        sourcePlateauElevationM: 568,
        maxTargetElevationM: 1200,
        maxWarmingCapC: 1.5,
        subCloudVirgaFactor: 0.85,
        wetCutoffMmHr: 0.2
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 315, toDeg: 45 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.12,
        maxPrecipMultiplierCap: 1.38
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 175, toDeg: 235 },
        precipAttenuationFactor: 0.56
      }
    }
  ],
  venturiCorridors: [
    {
      id: "turkoglu_islahiye_rift_corridor",
      labelTr: "Türkoğlu – Nurdağı Aksu Graben Koridoru",
      centerCoord: { lat: 37.3835, lon: 36.8427 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 205,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.28,
      gustMultiplier: 1.4,
      suppressesNocturnalInversion: true
    },
    {
      id: "tekkiraz_goksun_pass_chute",
      labelTr: "Tekir – Göksun Tünel Geçidi Kuzey Oluk Akışı",
      centerCoord: { lat: 37.86, lon: 36.62 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 15,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.32,
      gustMultiplier: 1.45,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1137,
    coldPoolMaxDepthM: 480,
    topographicEnclosureIndex: 0.92,
    deltaPressureTopHpa: 850,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 7.5
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.62
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 350, toDeg: 75 },
      minWindShearVs850Deg: 70
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.62,
    invertedVDryMicroburstSusceptibility: 0.52,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TGT_MARAS_CENTER",
      labelTr: "Kahramanmaraş Merkez (DEM 568m)",
      lat: 37.576,
      lon: 36.915,
      elevationM: 568,
      role: "target"
    },
    {
      key: "COR_TURKOGLU_RIFT",
      labelTr: "Türkoğlu Aksu Güney Girişi (535m)",
      lat: 37.3835,
      lon: 36.8427,
      elevationM: 535,
      role: "corridor"
    },
    {
      key: "ORO_AHIR_YEDIKUYULAR",
      labelTr: "Ahır Dağı / Yedikuyular Kayak Sırtı (2300m)",
      lat: 37.6406,
      lon: 37.0291,
      elevationM: 2300,
      role: "orographic_wall"
    },
    {
      key: "ORO_ANDIRIN_WEST",
      labelTr: "Andırın – Başkonuş Batı Nem Duvarı (1108m)",
      lat: 37.5908,
      lon: 36.3642,
      elevationM: 1108,
      role: "orographic_wall"
    },
    {
      key: "ORO_BERIT_DIVIDE",
      labelTr: "Berit Dağı Ana İklim Bölücü Sırt (3014m)",
      lat: 38.01,
      lon: 36.88,
      elevationM: 3014,
      role: "orographic_wall"
    },
    {
      key: "FOE_GOKSUN_BASIN",
      labelTr: "Göksun Yüksek Ayaz Havzası (1344m)",
      lat: 38.024,
      lon: 36.4823,
      elevationM: 1344,
      role: "foehn_windward"
    },
    {
      key: "FOE_ELBISTAN_PLAIN",
      labelTr: "Elbistan – Afşin Kapalı Kar Çanağı (1137m)",
      lat: 38.2038,
      lon: 37.1982,
      elevationM: 1137,
      role: "foehn_windward"
    },
    {
      key: "LEE_PAZARCIK_EAST",
      labelTr: "Pazarcık – Kartalkaya Doğu Eşik (787m)",
      lat: 37.4736,
      lon: 37.2386,
      elevationM: 787,
      role: "lee_shadow"
    },
    {
      key: "FOE_NURHAK_HIGH",
      labelTr: "Nurhak Doğu Toros Platosu (1368m)",
      lat: 37.9564,
      lon: 37.4472,
      elevationM: 1368,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -34,
    maxPlausibleTempC: 45,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1052,
    kalmanTempBiasCapC: 8.0
  }
};

export const PROVINCE_SPEC_TR_46: ProvinceSpec = Object.freeze(specTr46);
export default PROVINCE_SPEC_TR_46;
