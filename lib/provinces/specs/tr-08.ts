import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_08 = TR81_CLIMATOLOGY_1991_2020["TR-08"];
const HYPSO_TR_08 = TR81_HYPSOMETRIC_PROFILES["TR-08"];

/**
 * ATMOS v5.0 — Wave 3B (REG-12) Bespoke Microclimate Spec: TR-08 Artvin
 *
 * Fiziksel ve Sinoptik Kilitler:
 *  1. Türkiye'nin En Sert Topografik Üçlüsü:
 *     - Kıyı Aşırı Yağış Kuşağı (Kemalpaşa – Hopa – Arhavi + Borçka alt boğazı): >2.200 mm/yıl,
 *       Doğu Karadeniz sıcak döngüsü (Batumi Gyre) DEK kararsızlığı ve dik Cankurtaran/Lazistan upslope.
 *     - Orta/İç Çoruh Yamacı ve Kanyon Gölgesi: Artvin Merkez (WMO 17045, ~613–628 m dik yamaç) ve
 *       Yusufeli (~600–788 m derin kanyon tabanı, zeytin/nar yetişen mikro-Akdeniz yağış gölgesi!).
 *     - Şavşat – Mersivan (Atabarı Kayak 1.646 m) – Karçal (3.428 m) & Kaçkar Doğu (3.932 m) Alpin Kar Kuşağı.
 *  2. Keskin Kıyı–İç Havza Bariyer Duvarı: Kıyı (`hopa_arhavi_kemalpasa_coast`) ile iç Çoruh / Alpin
 *     alt-havzaları arasındaki tüm `barrierCouplingMatrix` katsayıları `<= 0.15` ile mühürlenmiştir.
 *  3. METAR Güvenlik Duvarı: `icaoWhitelist: []` — Gürcistan Batum (`UGSB`) ve komşu Rize-Artvin
 *     (`LTFO`, pisti Pazar/Rize `TR-53` sınırlarında) istasyonları %100 blokelidir.
 */
export const TR_08_BESPOKE_META = Object.freeze({
  wmoStationId: "17045",
  centerSlopeElevationRangeM: Object.freeze([613, 628] as const),
  yusufeliCanyonFloorM: 600,
  karcalAlpinePeakM: 3428,
  maxCoastToCoruhCoupling: 0.15,
  allowedMetarIcaos: Object.freeze([] as const),
  forbiddenForeignAndNeighborIcaos: Object.freeze(["UGSB", "UGKO", "LTFO", "LTCG", "LTCF"] as const)
});

const RAW_PROVINCE_SPEC_TR_08: ProvinceSpec = {
  provinceCode: "TR-08",
  plateCode: 8,
  slug: "artvin",
  nameTr: "Artvin",
  region: "BLACK_SEA_EAST",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "EAST_BLACK_SEA_STEEP_OROG",
  icaoWhitelist: TR_08_BESPOKE_META.allowedMetarIcaos,
  domainBounds: {
    minLat: 40.5572,
    maxLat: 41.5245,
    minLon: 41.1292,
    maxLon: 42.591
  },
  primaryCenter: {
    mgmMerkezId: 90801,
    mgmIstNo: 17045,
    mgmSaatlikIstNo: 17045,
    mgmGunlukIstNo: 90801,
    wmoId: "17045",
    lat: 41.1752,
    lon: 41.8187,
    demVerifiedElevationM: 613,
    subBasinId: "artvin_merkez_coruh_slope",
    urbanFraction: 0.44,
    monthlyTmaxNormalsC: CLIM_TR_08.tmaxC,
    monthlyTminNormalsC: CLIM_TR_08.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-08-hopa",
      name: "Hopa (Karadeniz Kıyı)",
      role: "coast",
      lat: 41.4065,
      lon: 41.433,
      elevationM: 33
    },
    {
      id: "tr-08-arhavi-inland",
      name: "Arhavi Kıyı Yamacı",
      role: "coast",
      lat: 41.342,
      lon: 41.312,
      elevationM: 28
    },
    {
      id: "tr-08-borcka",
      name: "Borçka (Alt Çoruh Boğazı)",
      role: "plain",
      lat: 41.375,
      lon: 41.6281,
      elevationM: 190
    },
    {
      id: "tr-08-yusufeli",
      name: "Yusufeli (Mikro-Akdeniz Çoruh Kanyonu)",
      role: "plain",
      lat: 40.7994,
      lon: 41.5193,
      elevationM: 605
    },
    {
      id: "tr-08-savsat",
      name: "Şavşat Yayla Havzası",
      role: "foothill",
      lat: 41.2433,
      lon: 42.3206,
      elevationM: 1125
    },
    {
      id: "tr-08-karcal-zirve",
      name: "Karçal Dağları / Atabarı Alpin Kuşağı",
      role: "summit",
      lat: 41.365,
      lon: 41.965,
      elevationM: 3420
    }
  ],
  subBasins: [
    {
      id: "hopa_arhavi_kemalpasa_coast",
      labelTr: "Kemalpaşa – Hopa – Arhavi Aşırı Yağışlı Karadeniz Kıyı Duvarı (>2.200 mm/yıl)",
      polygonOrBbox: { minLat: 41.26, maxLat: 41.5245, minLon: 41.18, maxLon: 41.56 },
      elevationRangeM: [0, 450],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.42
    },
    {
      id: "borcka_murgul_lower_coruh_gate",
      labelTr: "Borçka – Cankurtaran Doğu Eteği – Murgul Alt Çoruh Boğazı",
      polygonOrBbox: { minLat: 41.20, maxLat: 41.48, minLon: 41.48, maxLon: 41.78 },
      elevationRangeM: [150, 850],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.28
    },
    {
      id: "artvin_merkez_coruh_slope",
      labelTr: "Artvin Merkez (613m Çoruh Yamacı) – Ardanuç Orta Çoruh Kanyonu",
      polygonOrBbox: { minLat: 41.02, maxLat: 41.28, minLon: 41.70, maxLon: 42.18 },
      elevationRangeM: [340, 1150],
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.40
    },
    {
      id: "yusufeli_inner_coruh_micro_med",
      labelTr: "Yusufeli (~600m) Derin Çoruh/Barhal Kanyonu Mikro-Akdeniz Yağış Gölgesi",
      polygonOrBbox: { minLat: 40.56, maxLat: 41.02, minLon: 41.22, maxLon: 41.88 },
      elevationRangeM: [540, 1200],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.22
    },
    {
      id: "savsat_karcal_mersivan_alpine",
      labelTr: "Şavşat – Kafkasör/Mersivan – Karçal (3.428m) & Kaçkar Doğu (3.932m) Alpin Kar Kuşağı",
      polygonOrBbox: { minLat: 41.05, maxLat: 41.50, minLon: 41.72, maxLon: 42.591 },
      elevationRangeM: [1100, 3932],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.08
    }
  ],
  barrierCouplingMatrix: {
    hopa_arhavi_kemalpasa_coast: {
      hopa_arhavi_kemalpasa_coast: 1.0,
      borcka_murgul_lower_coruh_gate: 0.36,
      artvin_merkez_coruh_slope: 0.12,
      yusufeli_inner_coruh_micro_med: 0.05,
      savsat_karcal_mersivan_alpine: 0.14
    },
    borcka_murgul_lower_coruh_gate: {
      hopa_arhavi_kemalpasa_coast: 0.36,
      borcka_murgul_lower_coruh_gate: 1.0,
      artvin_merkez_coruh_slope: 0.54,
      yusufeli_inner_coruh_micro_med: 0.22,
      savsat_karcal_mersivan_alpine: 0.32
    },
    artvin_merkez_coruh_slope: {
      hopa_arhavi_kemalpasa_coast: 0.12,
      borcka_murgul_lower_coruh_gate: 0.54,
      artvin_merkez_coruh_slope: 1.0,
      yusufeli_inner_coruh_micro_med: 0.62,
      savsat_karcal_mersivan_alpine: 0.48
    },
    yusufeli_inner_coruh_micro_med: {
      hopa_arhavi_kemalpasa_coast: 0.05,
      borcka_murgul_lower_coruh_gate: 0.22,
      artvin_merkez_coruh_slope: 0.62,
      yusufeli_inner_coruh_micro_med: 1.0,
      savsat_karcal_mersivan_alpine: 0.34
    },
    savsat_karcal_mersivan_alpine: {
      hopa_arhavi_kemalpasa_coast: 0.14,
      borcka_murgul_lower_coruh_gate: 0.32,
      artvin_merkez_coruh_slope: 0.48,
      yusufeli_inner_coruh_micro_med: 0.34,
      savsat_karcal_mersivan_alpine: 1.0
    }
  },
  stationOverrides: {
    "17045": {
      stationId: 17045,
      nameTr: "Artvin Merkez WMO (Çoruh Yamacı 613–628m)",
      lat: 41.1752,
      lon: 41.8187,
      demElevationM: 613,
      subBasinId: "artvin_merkez_coruh_slope",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "mid_slope"
    },
    "17042": {
      stationId: 17042,
      nameTr: "Hopa Kıyı WMO",
      lat: 41.4065,
      lon: 41.433,
      demElevationM: 18,
      subBasinId: "hopa_arhavi_kemalpasa_coast",
      urbanFraction: 0.48,
      coldPoolSusceptibility: 0.06,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18554": {
      stationId: 18554,
      nameTr: "Arhavi Kıyı Yamacı",
      lat: 41.342,
      lon: 41.312,
      demElevationM: 284,
      subBasinId: "hopa_arhavi_kemalpasa_coast",
      urbanFraction: 0.32,
      coldPoolSusceptibility: 0.10,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18555": {
      stationId: 18555,
      nameTr: "Borçka Alt Çoruh",
      lat: 41.375,
      lon: 41.6281,
      demElevationM: 190,
      subBasinId: "borcka_murgul_lower_coruh_gate",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.38,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18216": {
      stationId: 18216,
      nameTr: "Yusufeli Mikro-Akdeniz Kanyonu",
      lat: 40.7994,
      lon: 41.5193,
      demElevationM: 605,
      subBasinId: "yusufeli_inner_coruh_micro_med",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18217": {
      stationId: 18217,
      nameTr: "Şavşat",
      lat: 41.2433,
      lon: 42.3206,
      demElevationM: 1125,
      subBasinId: "savsat_karcal_mersivan_alpine",
      urbanFraction: 0.20,
      coldPoolSusceptibility: 0.64,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18964": {
      stationId: 18964,
      nameTr: "Atabarı (Mersivan) Kayak Merkezi",
      lat: 41.1514,
      lon: 41.767,
      demElevationM: 1648,
      subBasinId: "savsat_karcal_mersivan_alpine",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [
      HYPSO_TR_08.bands[0].elevationM,
      HYPSO_TR_08.bands[1].elevationM,
      HYPSO_TR_08.bands[2].elevationM,
      HYPSO_TR_08.bands[3].elevationM
    ],
    maxPhysicalPeakM: HYPSO_TR_08.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_08.bands
  },
  waterBodies: [
    {
      id: "east_black_sea_hopa_batumi_gyre",
      labelTr: "Doğu Karadeniz (Hopa – Kemalpaşa – Arhavi Sıcak Döngü Havzası)",
      kind: "open_sea",
      mgmMarineStationIds: [17042, 17467, 17495],
      sampleCoord: { lat: 41.48, lon: 41.32 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.0,
      monthlyWaterTempNormalsC: [
        10.4, 9.4, 9.8, 12.1, 16.4, 21.6,
        25.2, 26.4, 24.1, 20.2, 15.8, 12.4
      ],
      subBasinInfluenceWeights: {
        hopa_arhavi_kemalpasa_coast: 0.98,
        borcka_murgul_lower_coruh_gate: 0.44,
        artvin_merkez_coruh_slope: 0.10,
        yusufeli_inner_coruh_micro_med: 0.02,
        savsat_karcal_mersivan_alpine: 0.12
      },
      onshoreWindSectorDeg: { fromDeg: 285, toDeg: 25 },
      effectiveFetchKm: 650,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 11.2,
      dekHeavyDeltaTC: 14.0,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 295, toDeg: 350 },
        maxInlandPenetrationKm: 14,
        maxCoolingAmplitudeC: 3.2
      }
    }
  ],
  directionalBarriers: [
    {
      id: "cankurtaran_sultan_selim_coastal_wall",
      labelTr: "Cankurtaran – Sultan Selim Dağı Kıyı Orografik Duvarı (Hopa/Arhavi >2200 mm & Güneyli Fön)",
      effectiveBarrierHeightM: 2250,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "hopa_arhavi_kemalpasa_coast",
        "borcka_murgul_lower_coruh_gate"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 145, toDeg: 215 },
        minCrossCrestSpeedMs: 6.5,
        minFroudeNumber: 0.78,
        sourcePlateauElevationM: 1650,
        maxTargetElevationM: 300,
        maxWarmingCapC: 8.2,
        subCloudVirgaFactor: 0.58,
        wetCutoffMmHr: 0.3
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 285, toDeg: 25 },
        minOnshoreOrUpslopeSpeedMs: 4.5,
        coastalFrictionalConvergenceBoost: 0.32,
        maxPrecipMultiplierCap: 1.75
      }
    },
    {
      id: "kackar_karcal_coruh_rain_shadow_wall",
      labelTr: "Kaçkar Doğu – Altıparmak – Karçal (3.428–3.932m) İç Çoruh & Yusufeli Kanyon Gölgesi",
      effectiveBarrierHeightM: 3450,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "artvin_merkez_coruh_slope",
        "yusufeli_inner_coruh_micro_med",
        "savsat_karcal_mersivan_alpine"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 295, toDeg: 20 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.72,
        sourcePlateauElevationM: 1850,
        maxTargetElevationM: 900,
        maxWarmingCapC: 5.8,
        subCloudVirgaFactor: 0.62,
        wetCutoffMmHr: 0.4
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 35, toDeg: 115 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 0.10,
        maxPrecipMultiplierCap: 1.48
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 290, toDeg: 30 },
        precipAttenuationFactor: 0.34
      }
    }
  ],
  venturiCorridors: [
    {
      id: "cankurtaran_hopa_downslope_chute",
      labelTr: "Cankurtaran Geçidi – Hopa Fön ve Vadi Kanalı",
      centerCoord: { lat: 41.385, lon: 41.535 },
      influenceRadiusKm: 15,
      channelAxisFromDeg: 165,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.34,
      gustMultiplier: 1.48,
      suppressesNocturnalInversion: true
    },
    {
      id: "coruh_yusufeli_borcka_gorge_jet",
      labelTr: "Çoruh Vadisi (Yusufeli – Deriner – Artvin – Borçka) Kanyon Akışı",
      centerCoord: { lat: 41.08, lon: 41.72 },
      influenceRadiusKm: 22,
      channelAxisFromDeg: 215,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.26,
      gustMultiplier: 1.38,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 550,
    coldPoolMaxDepthM: 340,
    topographicEnclosureIndex: 0.84,
    deltaPressureTopHpa: 38,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 4.5
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.32
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.28,
    invertedVDryMicroburstSusceptibility: 0.36,
    coastalWaterspoutSusceptibility: 0.78
  },
  stencil9Points: [
    {
      key: "target_artvin_merkez_slope",
      labelTr: "Artvin Merkez (Çoruh Yamacı 613m WMO 17045)",
      lat: 41.1752,
      lon: 41.8187,
      elevationM: 613,
      role: "target"
    },
    {
      key: "marine_hopa_nw_black_sea",
      labelTr: "Hopa Kuzeybatı Karadeniz Açığı (DEK/Upslope Kaynağı)",
      lat: 41.52,
      lon: 41.22,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "corridor_hopa_coast",
      labelTr: "Hopa Kıyı Şeridi (WMO 17042)",
      lat: 41.4065,
      lon: 41.433,
      elevationM: 33,
      role: "corridor"
    },
    {
      key: "corridor_borcka_lower_coruh",
      labelTr: "Borçka Alt Çoruh Boğazı (190m)",
      lat: 41.375,
      lon: 41.6281,
      elevationM: 190,
      role: "corridor"
    },
    {
      key: "lee_yusufeli_canyon",
      labelTr: "Yusufeli Derin Çoruh Kanyonu Yağış Gölgesi (605m)",
      lat: 40.7994,
      lon: 41.5193,
      elevationM: 605,
      role: "lee_shadow"
    },
    {
      key: "lee_ardanuc_canyon",
      labelTr: "Ardanuç Kanyon Havzası (577m)",
      lat: 41.1267,
      lon: 42.0653,
      elevationM: 577,
      role: "lee_shadow"
    },
    {
      key: "orographic_cankurtaran_wall",
      labelTr: "Cankurtaran – Sultan Selim Sırtı",
      lat: 41.385,
      lon: 41.535,
      elevationM: 1150,
      role: "orographic_wall"
    },
    {
      key: "orographic_karcal_summit",
      labelTr: "Karçal Dağları Zirve Kuşağı (3.428m)",
      lat: 41.365,
      lon: 41.965,
      elevationM: 3420,
      role: "orographic_wall"
    },
    {
      key: "foehn_savsat_ardahan_highland",
      labelTr: "Şavşat – Sahara Yüksek Yayla Eşiği (1.125m+)",
      lat: 41.2433,
      lon: 42.3206,
      elevationM: 1125,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -26.0,
    maxPlausibleTempC: 43.0,
    minPlausibleMslpHpa: 980,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 6.5
  }
};

export const PROVINCE_SPEC_TR_08: ProvinceSpec = Object.freeze(RAW_PROVINCE_SPEC_TR_08);

/**
 * Artvin'de Karayel/Yıldız (`320°`) denizel sisteminde Hopa–Arhavi kıyı duvarı (`1.75x` upslope) ile
 * Cankurtaran/Kaçkar ardındaki Yusufeli (`~600m`) derin Çoruh kanyonu yağış gölgesi (`0.34x`) arasındaki
 * dramatik yağış uçurumunu `PROVINCE_SPEC_TR_08` üzerinden hesaplar.
 */
export function evaluateArtvinCoastToCoruhContrast(params: {
  synopticPrecipMmHr: number;
  windFromDirDeg: number;
  windSpeedMs: number;
}): {
  hopaCoastPrecipMmHr: number;
  artvinMerkezSlopePrecipMmHr: number;
  yusufeliCanyonPrecipMmHr: number;
  coastToYusufeliRatio: number;
} {
  const coastWall = PROVINCE_SPEC_TR_08.directionalBarriers[0];
  const shadowWall = PROVINCE_SPEC_TR_08.directionalBarriers[1];
  const d = ((params.windFromDirDeg % 360) + 360) % 360;
  const isOnshoreNW = d >= 285 || d <= 25;

  const hopaMult =
    isOnshoreNW && params.windSpeedMs >= coastWall.upslopeSpec.minOnshoreOrUpslopeSpeedMs
      ? coastWall.upslopeSpec.maxPrecipMultiplierCap
      : 1.0;

  const yusufeliAtten =
    isOnshoreNW && shadowWall.rainShadowSpec
      ? shadowWall.rainShadowSpec.precipAttenuationFactor
      : 1.0;

  // Artvin Merkez (613m) Borçka boğazından kısmi nem alırken kıyı duvarının gerisinde yarı-gölgede kalır
  const artvinMerkezMult = isOnshoreNW ? 0.62 : 1.0;

  const hopaCoastPrecipMmHr = params.synopticPrecipMmHr * hopaMult;
  const artvinMerkezSlopePrecipMmHr = params.synopticPrecipMmHr * artvinMerkezMult;
  const yusufeliCanyonPrecipMmHr = params.synopticPrecipMmHr * yusufeliAtten;

  return {
    hopaCoastPrecipMmHr,
    artvinMerkezSlopePrecipMmHr,
    yusufeliCanyonPrecipMmHr,
    coastToYusufeliRatio:
      yusufeliCanyonPrecipMmHr > 1e-6
        ? hopaCoastPrecipMmHr / yusufeliCanyonPrecipMmHr
        : 1.0
  };
}

export default PROVINCE_SPEC_TR_08;
