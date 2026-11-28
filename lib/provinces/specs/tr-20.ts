import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const DENIZLI_NORMALS = TR81_CLIMATOLOGY_1991_2020["TR-20"];
const DENIZLI_HYPSO = TR81_HYPSOMETRIC_PROFILES["TR-20"];

/**
 * TR-20 Denizli — Çürüksu–Menderes Çanağı (350–430m), Honaz Dağı (2571m) & Nikfer Bozdağ (2420m)
 * Alpin Duvarı, Kazıkbeli Geçidi ve Çardak/Acıpayam (850–950m) Yüksek Plato Ayaz Kilidi
 *
 * Fiziksel Kilitler:
 * - Şehir merkezi (`350–430m`, Merkezefendi/Pamukkale `425m`) hemen güneyinde yükselen Honaz Dağı
 *   (`2571m`) ve Nikfer Bozdağ (`2420m`, Kayak Merkezi `1918m`) ile `>2100m` anlık rölyef farkına sahiptir.
 * - Doğudaki Çardak Havalimanı (`LTAY`, `851m`, `WMO 17257`) Denizli Merkez'den `+426m` yüksekte,
 *   Acıgöl oluğunda kırsal radyatif ayaz çanağındadır; `coldBasinAirportIcaos: ["LTAY"]` ve
 *   `excludeFromCenterHeadline: true` ile kırsal plato ayazının kentsel Denizli Merkez tahminini
 *   aşağı çekmesi engellenir.
 * - Kalibrasyon `WMO 17237` (Tier-A) ve `icaoWhitelist: ["LTAY"]` ile mühürlüdür.
 */
export const TR_20_BESPOKE_META = Object.freeze({
  allowedMetarIcaos: Object.freeze(["LTAY"] as const),
  coldBasinAirportIcaos: Object.freeze(["LTAY"] as const),
  wmoStationId: "17237",
  curuksuBasinElevationRangeM: Object.freeze([350, 430] as const),
  cardakAcipayamPlateauRangeM: Object.freeze([850, 950] as const),
  honazPeakM: 2571,
  nikferBozdagPeakM: 2420,
  cardakAirportElevationM: 851
});

const RAW_PROVINCE_SPEC_TR_20: ProvinceSpec = {
  provinceCode: "TR-20",
  plateCode: 20,
  slug: "denizli",
  nameTr: "Denizli",
  region: "AEGEAN",
  climateRegion: "EGE",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "AEGEAN_COASTAL_GRABEN",
  icaoWhitelist: TR_20_BESPOKE_META.allowedMetarIcaos,
  domainBounds: {
    minLat: 36.88,
    maxLat: 38.48,
    minLon: 28.56,
    maxLon: 30.10
  },
  primaryCenter: {
    mgmMerkezId: 92001,
    mgmIstNo: 17237,
    mgmSaatlikIstNo: 17237,
    mgmGunlukIstNo: 92001,
    wmoId: "17237",
    lat: 37.762,
    lon: 29.0921,
    demVerifiedElevationM: 425,
    subBasinId: "curuksu_pamukkale_basin",
    urbanFraction: 0.74,
    monthlyTmaxNormalsC: DENIZLI_NORMALS.tmaxC,
    monthlyTminNormalsC: DENIZLI_NORMALS.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-20-saraykoy",
      name: "Sarayköy",
      role: "plain",
      lat: 37.9111,
      lon: 28.9081,
      elevationM: 194
    },
    {
      id: "tr-20-pamukkale",
      name: "Pamukkale",
      role: "plain",
      lat: 37.762,
      lon: 29.0921,
      elevationM: 425
    },
    {
      id: "tr-20-cardak",
      name: "Çardak (Havalimanı Platosu)",
      role: "foothill",
      lat: 37.785,
      lon: 29.7011,
      elevationM: 848
    },
    {
      id: "tr-20-acipayam",
      name: "Acıpayam",
      role: "foothill",
      lat: 37.4337,
      lon: 29.3498,
      elevationM: 941
    },
    {
      id: "tr-20-cameli",
      name: "Çameli",
      role: "foothill",
      lat: 37.0621,
      lon: 29.3685,
      elevationM: 1262
    },
    {
      id: "tr-20-nikfer-bozdag",
      name: "Nikfer Bozdağ Kayak Merkezi",
      role: "summit",
      lat: 37.3171,
      lon: 29.1891,
      elevationM: 1918
    }
  ],
  subBasins: [
    {
      id: "saraykoy_lower_menderes",
      labelTr: "Sarayköy – Buharkent Eşiği Alt Büyük Menderes Tabanı (170–260m)",
      polygonOrBbox: { minLat: 37.84, maxLat: 38.06, minLon: 28.72, maxLon: 29.04 },
      elevationRangeM: [165, 280],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.36
    },
    {
      id: "curuksu_pamukkale_basin",
      labelTr: "Denizli Merkez (Merkezefendi – Pamukkale – Honaz Eteği 350–490m) Çürüksu Çanağı",
      polygonOrBbox: { minLat: 37.70, maxLat: 37.90, minLon: 28.98, maxLon: 29.34 },
      elevationRangeM: [340, 520],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.74
    },
    {
      id: "cal_civril_bekilli_north_plateau",
      labelTr: "Buldan – Güney – Çal – Bekilli – Çivril Kuzey İç Ege Platosu (800–1050m)",
      polygonOrBbox: { minLat: 37.98, maxLat: 38.47, minLon: 28.78, maxLon: 30.02 },
      elevationRangeM: [560, 1100],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.28
    },
    {
      id: "cardak_acipayam_tavas_plateau",
      labelTr: "Çardak (LTAY 851m) – Bozkurt – Tavas – Serinhisar – Acıpayam Yüksek Platosu (850–1030m)",
      polygonOrBbox: { minLat: 37.30, maxLat: 37.98, minLon: 29.00, maxLon: 30.08 },
      elevationRangeM: [830, 1080],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.20
    },
    {
      id: "kale_cameli_south_highlands",
      labelTr: "Kale – Beyağaç – Çameli Güney Dağlık Eşik (1150–1450m)",
      polygonOrBbox: { minLat: 36.88, maxLat: 37.48, minLon: 28.75, maxLon: 29.55 },
      elevationRangeM: [650, 1550],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.14
    },
    {
      id: "honaz_nikfer_bozdag_alpine",
      labelTr: "Honaz Dağı (2571m) – Karcı – Babadağ – Nikfer Bozdağ (2420m) Alpin Kuşağı",
      polygonOrBbox: { minLat: 37.24, maxLat: 37.82, minLon: 28.80, maxLon: 29.36 },
      elevationRangeM: [1450, 2571],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.02
    }
  ],
  barrierCouplingMatrix: {
    saraykoy_lower_menderes: {
      saraykoy_lower_menderes: 1.0,
      curuksu_pamukkale_basin: 0.84,
      cal_civril_bekilli_north_plateau: 0.46,
      cardak_acipayam_tavas_plateau: 0.28,
      kale_cameli_south_highlands: 0.18,
      honaz_nikfer_bozdag_alpine: 0.20
    },
    curuksu_pamukkale_basin: {
      saraykoy_lower_menderes: 0.84,
      curuksu_pamukkale_basin: 1.0,
      cal_civril_bekilli_north_plateau: 0.52,
      cardak_acipayam_tavas_plateau: 0.40,
      kale_cameli_south_highlands: 0.24,
      honaz_nikfer_bozdag_alpine: 0.34
    },
    cal_civril_bekilli_north_plateau: {
      saraykoy_lower_menderes: 0.46,
      curuksu_pamukkale_basin: 0.52,
      cal_civril_bekilli_north_plateau: 1.0,
      cardak_acipayam_tavas_plateau: 0.68,
      kale_cameli_south_highlands: 0.20,
      honaz_nikfer_bozdag_alpine: 0.24
    },
    cardak_acipayam_tavas_plateau: {
      saraykoy_lower_menderes: 0.28,
      curuksu_pamukkale_basin: 0.40,
      cal_civril_bekilli_north_plateau: 0.68,
      cardak_acipayam_tavas_plateau: 1.0,
      kale_cameli_south_highlands: 0.58,
      honaz_nikfer_bozdag_alpine: 0.42
    },
    kale_cameli_south_highlands: {
      saraykoy_lower_menderes: 0.18,
      curuksu_pamukkale_basin: 0.24,
      cal_civril_bekilli_north_plateau: 0.20,
      cardak_acipayam_tavas_plateau: 0.58,
      kale_cameli_south_highlands: 1.0,
      honaz_nikfer_bozdag_alpine: 0.62
    },
    honaz_nikfer_bozdag_alpine: {
      saraykoy_lower_menderes: 0.20,
      curuksu_pamukkale_basin: 0.34,
      cal_civril_bekilli_north_plateau: 0.24,
      cardak_acipayam_tavas_plateau: 0.42,
      kale_cameli_south_highlands: 0.62,
      honaz_nikfer_bozdag_alpine: 1.0
    }
  },
  stationOverrides: {
    "17237": {
      stationId: 17237,
      nameTr: "Denizli Merkez WMO (Pamukkale/Merkezefendi)",
      lat: 37.762,
      lon: 29.0921,
      demElevationM: 425,
      subBasinId: "curuksu_pamukkale_basin",
      urbanFraction: 0.74,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "basin_floor"
    },
    "19359": {
      stationId: 19359,
      nameTr: "Merkezefendi Kent Merkezi",
      lat: 37.762,
      lon: 29.0921,
      demElevationM: 429,
      subBasinId: "curuksu_pamukkale_basin",
      urbanFraction: 0.78,
      coldPoolSusceptibility: 0.30,
      verticalStratumRole: "basin_floor"
    },
    "18068": {
      stationId: 18068,
      nameTr: "Sarayköy Alt Graben",
      lat: 37.9111,
      lon: 28.9081,
      demElevationM: 194,
      subBasinId: "saraykoy_lower_menderes",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17257": {
      stationId: 17257,
      nameTr: "Çardak Havalimanı (WMO 17257 / LTAY 851m Kırsal Plato Ayazı)",
      lat: 37.785,
      lon: 29.7011,
      demElevationM: 851,
      subBasinId: "cardak_acipayam_tavas_plateau",
      urbanFraction: 0.06,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    ICAO_LTAY: {
      stationId: "ICAO_LTAY",
      nameTr: "Denizli Çardak Havalimanı METAR (LTAY 851m)",
      lat: 37.785,
      lon: 29.7011,
      demElevationM: 851,
      subBasinId: "cardak_acipayam_tavas_plateau",
      urbanFraction: 0.06,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    LTAY: {
      stationId: "LTAY",
      nameTr: "Denizli Çardak METAR (LTAY)",
      lat: 37.785,
      lon: 29.7011,
      demElevationM: 851,
      subBasinId: "cardak_acipayam_tavas_plateau",
      urbanFraction: 0.06,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17890": {
      stationId: 17890,
      nameTr: "Acıpayam Ovası (941m)",
      lat: 37.4337,
      lon: 29.3498,
      demElevationM: 941,
      subBasinId: "cardak_acipayam_tavas_plateau",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.80,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18303": {
      stationId: 18303,
      nameTr: "Nikfer Bozdağ Kayak Merkezi (1918m)",
      lat: 37.3171,
      lon: 29.1891,
      demElevationM: 1918,
      subBasinId: "honaz_nikfer_bozdag_alpine",
      urbanFraction: 0.01,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [
      DENIZLI_HYPSO.bands[0].elevationM,
      DENIZLI_HYPSO.bands[1].elevationM,
      DENIZLI_HYPSO.bands[2].elevationM,
      DENIZLI_HYPSO.bands[3].elevationM
    ],
    maxPhysicalPeakM: DENIZLI_HYPSO.maxPhysicalPeakM,
    snowElevationBands: DENIZLI_HYPSO.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "honaz_karci_kazikbeli_south_wall",
      labelTr: "Honaz Dağı (2571m) – Karcı – Kazıkbeli Güney Bariyeri (Çürüksu Lodos Fönü & Güney Yamaç Karı)",
      effectiveBarrierHeightM: 2571,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "curuksu_pamukkale_basin",
        "saraykoy_lower_menderes",
        "honaz_nikfer_bozdag_alpine",
        "kale_cameli_south_highlands"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 220 },
        minCrossCrestSpeedMs: 6.5,
        minFroudeNumber: 0.80,
        sourcePlateauElevationM: 1050,
        maxTargetElevationM: 520,
        maxWarmingCapC: 4.5,
        subCloudVirgaFactor: 0.34,
        wetCutoffMmHr: 0.5
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 275, toDeg: 335 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 0.12,
        maxPrecipMultiplierCap: 1.38
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 175, toDeg: 210 },
        precipAttenuationFactor: 0.74
      }
    },
    {
      id: "nikfer_bozdag_cameli_orographic_ridge",
      labelTr: "Nikfer Bozdağ (2420m) – Çameli Güneyli Akdeniz Nem Tırmanma Sırtı",
      effectiveBarrierHeightM: 2420,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "kale_cameli_south_highlands",
        "honaz_nikfer_bozdag_alpine",
        "cardak_acipayam_tavas_plateau"
      ],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 170, toDeg: 230 },
        minCrossCrestSpeedMs: 99,
        minFroudeNumber: 99,
        sourcePlateauElevationM: 0,
        maxTargetElevationM: 0,
        maxWarmingCapC: 0,
        subCloudVirgaFactor: 0,
        wetCutoffMmHr: 0
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 170, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 0.16,
        maxPrecipMultiplierCap: 1.44
      }
    }
  ],
  venturiCorridors: [
    {
      id: "kazikbeli_pass_jet",
      labelTr: "Kazıkbeli Geçidi (1250m — Honaz ile Tavas/Acıpayam Arası Dar Boğaz)",
      centerCoord: { lat: 37.655, lon: 29.215 },
      influenceRadiusKm: 18,
      channelAxisFromDeg: 185,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.34,
      gustMultiplier: 1.46,
      suppressesNocturnalInversion: true
    },
    {
      id: "cardak_bozkurt_trough_corridor",
      labelTr: "Honaz – Kaklık – Bozkurt – Çardak Doğu Oluğu",
      centerCoord: { lat: 37.795, lon: 29.605 },
      influenceRadiusKm: 22,
      channelAxisFromDeg: 255,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.24,
      gustMultiplier: 1.34,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 390,
    coldPoolMaxDepthM: 260,
    topographicEnclosureIndex: 0.72,
    deltaPressureTopHpa: 34,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 4.8
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.30
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 35, toDeg: 110 },
      minWindShearVs850Deg: 70
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.58,
    invertedVDryMicroburstSusceptibility: 0.66,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "target_denizli_merkez",
      labelTr: "Denizli Merkez (Pamukkale/Merkezefendi 425m)",
      lat: 37.762,
      lon: 29.0921,
      elevationM: 425,
      role: "target"
    },
    {
      key: "corridor_saraykoy_west_gate",
      labelTr: "Sarayköy Büyük Menderes Batı Girişi (194m)",
      lat: 37.9111,
      lon: 28.9081,
      elevationM: 194,
      role: "corridor"
    },
    {
      key: "corridor_cardak_ltay_east",
      labelTr: "Çardak Havalimanı (LTAY 851m) Doğu Platosu",
      lat: 37.785,
      lon: 29.7011,
      elevationM: 851,
      role: "lee_shadow"
    },
    {
      key: "foehn_kazikbeli_pass",
      labelTr: "Kazıkbeli Geçidi (1250m)",
      lat: 37.655,
      lon: 29.215,
      elevationM: 1250,
      role: "foehn_windward"
    },
    {
      key: "foehn_acipayam_plateau",
      labelTr: "Acıpayam Yüksek Platosu (941m)",
      lat: 37.4337,
      lon: 29.3498,
      elevationM: 941,
      role: "foehn_windward"
    },
    {
      key: "orographic_honaz_summit",
      labelTr: "Honaz Dağı Zirve (2571m — Ege'nin En Yüksek Noktası)",
      lat: 37.6775,
      lon: 29.2845,
      elevationM: 2571,
      role: "orographic_wall"
    },
    {
      key: "orographic_nikfer_bozdag",
      labelTr: "Nikfer Bozdağ Kayak Kuşağı (1918–2420m)",
      lat: 37.3171,
      lon: 29.1891,
      elevationM: 1918,
      role: "orographic_wall"
    },
    {
      key: "orographic_babadag_west_wall",
      labelTr: "Denizli Babadağ Sırtı (903–2308m)",
      lat: 37.8022,
      lon: 28.8525,
      elevationM: 903,
      role: "orographic_wall"
    },
    {
      key: "lee_civril_north_plain",
      labelTr: "Çivril Kuzey İç Ege Düzlüğü (824m)",
      lat: 38.2603,
      lon: 29.712,
      elevationM: 824,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -24.0,
    maxPlausibleTempC: 46.5,
    minPlausibleMslpHpa: 980,
    maxPlausibleMslpHpa: 1044,
    kalmanTempBiasCapC: 6.5
  }
};

export const PROVINCE_SPEC_TR_20: ProvinceSpec = Object.freeze(RAW_PROVINCE_SPEC_TR_20);

export function evaluateDenizliVerticalTransect(params: {
  denizliMerkezTempC: number;
  windSpeedMs: number;
  clearSkyFraction0To1: number;
}): {
  saraykoy194mTempC: number;
  denizliMerkez425mTempC: number;
  cardakLtay851mTempC: number;
  acipayam941mTempC: number;
  nikferBozdag1918mTempC: number;
  honazSummit2571mTempC: number;
  ltayVsCenterColdOffsetC: number;
} {
  const centerSpec = PROVINCE_SPEC_TR_20.stationOverrides["17237"];
  const ltaySpec = PROVINCE_SPEC_TR_20.stationOverrides.ICAO_LTAY;
  const acipayamSpec = PROVINCE_SPEC_TR_20.stationOverrides["17890"];
  const freeAtmLapseCPerM = 0.0062;

  const calmRadiativeFactor =
    Math.max(0, Math.min(1, params.clearSkyFraction0To1)) *
    Math.max(0, 1 - params.windSpeedMs / 6.0);

  const urbanRuralContrastC =
    (centerSpec.urbanFraction - ltaySpec.urbanFraction) * 3.8 * calmRadiativeFactor;
  const extraColdPoolDrainageC =
    (ltaySpec.coldPoolSusceptibility - centerSpec.coldPoolSusceptibility) *
    5.2 *
    calmRadiativeFactor;
  const elevDiffLtayM = ltaySpec.demElevationM - centerSpec.demElevationM;

  const cardakLtay851mTempC =
    params.denizliMerkezTempC -
    elevDiffLtayM * freeAtmLapseCPerM -
    urbanRuralContrastC -
    extraColdPoolDrainageC;

  const acipayam941mTempC =
    params.denizliMerkezTempC -
    (acipayamSpec.demElevationM - centerSpec.demElevationM) * freeAtmLapseCPerM -
    (centerSpec.urbanFraction - acipayamSpec.urbanFraction) * 3.2 * calmRadiativeFactor -
    (acipayamSpec.coldPoolSusceptibility - centerSpec.coldPoolSusceptibility) *
      4.4 *
      calmRadiativeFactor;

  const saraykoy194mTempC =
    params.denizliMerkezTempC +
    (centerSpec.demElevationM - 194) * 0.0055 -
    1.1 * calmRadiativeFactor;

  const nikferBozdag1918mTempC =
    params.denizliMerkezTempC - (1918 - centerSpec.demElevationM) * freeAtmLapseCPerM;

  const honazSummit2571mTempC =
    params.denizliMerkezTempC -
    (PROVINCE_SPEC_TR_20.verticalProfileSpec.maxPhysicalPeakM - centerSpec.demElevationM) *
      freeAtmLapseCPerM;

  return {
    saraykoy194mTempC,
    denizliMerkez425mTempC: params.denizliMerkezTempC,
    cardakLtay851mTempC,
    acipayam941mTempC,
    nikferBozdag1918mTempC,
    honazSummit2571mTempC,
    ltayVsCenterColdOffsetC: cardakLtay851mTempC - params.denizliMerkezTempC
  };
}

export default PROVINCE_SPEC_TR_20;
