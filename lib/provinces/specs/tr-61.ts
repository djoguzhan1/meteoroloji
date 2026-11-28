import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_61 = TR81_CLIMATOLOGY_1991_2020["TR-61"];
const HYPSO_TR_61 = TR81_HYPSOMETRIC_PROFILES["TR-61"];

/**
 * ATMOS v5.0 — Wave 3B (REG-12) Bespoke Microclimate Spec: TR-61 Trabzon
 *
 * Fiziksel ve Sinoptik Kilitler:
 *  1. Yoroz Burnu (`41.095N, 39.421E`) Mikro-Rüzgar ve Yağış Gölgesi:
 *     Batılı / Karayel (`270°–315°`) sistemlerde Yoroz Burnu ve Hıdırnebi çıkıntısının doğusunda
 *     kalan Akçaabat – Ortahisar – Trabzon Merkez (`LTCG`, yıllık ~838 mm) kısmi gölgede (`0.66x`)
 *     kalırken; Yoroz batısındaki Beşikdüzü–Vakfıkebir ve doğudaki Sürmene–Of hattı doğrudan yağış alır.
 *     Buna karşılık Kuzey / Kuzeydoğu (`340°–45°` Yıldız/Poyraz) sistemlerde Trabzon Körfezi gölgesiz,
 *     doğrudan denizel/DEK ve orografik etki (`1.48x`) altındadır.
 *  2. Değirmendere / Maçka Vadi Oluğu Güneyli Trabzon Fönü:
 *     Zigana Geçidi'ni (`2.032 m`) aşan güneyli (`160°–215°`) akış Maçka–Değirmendere boğazında
 *     kanalize olarak Trabzon Merkez ve `LTCG` pistine şiddetli hamleli (`1.52x`) ve kuru/sıcak (`+9.2°C` tavan)
 *     fön fırtınası olarak iner.
 *  3. Uzungöl (`1.090 m`) – Çaykara & Zigana/Çakırgöl (`2.050–3.376 m`) Yüksek Yamaç/Alpin Kar Kuşağı.
 *  4. METAR ve MGM Sınır Kilidi: `icaoWhitelist: ["LTCG"]`; ayrıca Şalpazarı (`merkezId: 96107`) için
 *     Giresun/Eynesil (`18559`, `TR-28`) vekil istasyon sızıntısı yasaktır.
 */
export const TR_61_BESPOKE_META = Object.freeze({
  wmoStationId: "17038",
  yorozCapeCoord: Object.freeze({ lat: 41.095, lon: 39.4208 }),
  yorozKarayelShadowSectorDeg: Object.freeze({ fromDeg: 270, toDeg: 315 }),
  directNorthExposureSectorDeg: Object.freeze({ fromDeg: 340, toDeg: 45 }),
  uzungolElevationM: 1090,
  allowedMetarIcaos: Object.freeze(["LTCG"] as const),
  blockedCrossProvinceMgmIstNos: Object.freeze([18559] as const)
});

const RAW_PROVINCE_SPEC_TR_61: ProvinceSpec = {
  provinceCode: "TR-61",
  plateCode: 61,
  slug: "trabzon",
  nameTr: "Trabzon",
  region: "BLACK_SEA_EAST",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "EAST_BLACK_SEA_STEEP_OROG",
  icaoWhitelist: TR_61_BESPOKE_META.allowedMetarIcaos,
  domainBounds: {
    minLat: 40.5135,
    maxLat: 41.1077,
    minLon: 39.1232,
    maxLon: 40.5075
  },
  primaryCenter: {
    mgmMerkezId: 96101,
    mgmIstNo: 17037,
    mgmSaatlikIstNo: 17038,
    mgmGunlukIstNo: 96101,
    wmoId: "17038",
    lat: 40.9985,
    lon: 39.7649,
    demVerifiedElevationM: 39,
    subBasinId: "yoroz_lee_akcaabat_ortahisar_bay",
    urbanFraction: 0.72,
    monthlyTmaxNormalsC: CLIM_TR_61.tmaxC,
    monthlyTminNormalsC: CLIM_TR_61.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-61-besikduzu",
      name: "Beşikdüzü – Vakfıkebir (Yoroz Batısı Açık Kıyı)",
      role: "coast",
      lat: 41.045,
      lon: 39.2328,
      elevationM: 12
    },
    {
      id: "tr-61-akcaabat-inland",
      name: "Akçaabat (Yoroz Doğusu Körfez)",
      role: "coast",
      lat: 41.018,
      lon: 39.568,
      elevationM: 25
    },
    {
      id: "tr-61-of",
      name: "Of – Sürmene Doğu Kıyı",
      role: "coast",
      lat: 40.9835,
      lon: 40.3319,
      elevationM: 6
    },
    {
      id: "tr-61-macka",
      name: "Maçka (Değirmendere Fön Vadisi)",
      role: "plain",
      lat: 40.8137,
      lon: 39.612,
      elevationM: 363
    },
    {
      id: "tr-61-uzungol",
      name: "Uzungöl – Çaykara (Haldizen Vadisi)",
      role: "foothill",
      lat: 40.6195,
      lon: 40.2925,
      elevationM: 1090
    },
    {
      id: "tr-61-cakirgol-zigana-kuzey",
      name: "Zigana Kuzey / Çakırgöl Dağ Kuşağı",
      role: "summit",
      lat: 40.685,
      lon: 39.685,
      elevationM: 2050
    }
  ],
  subBasins: [
    {
      id: "besikduzu_vakfikebir_west_yoroz",
      labelTr: "Beşikdüzü – Vakfıkebir – Çarşıbaşı (Yoroz Burnu Batısı Karayel Açık Kıyısı)",
      polygonOrBbox: { minLat: 40.95, maxLat: 41.1077, minLon: 39.1232, maxLon: 39.43 },
      elevationRangeM: [0, 380],
      defaultZone: "peninsula_exposed",
      defaultUrbanFraction: 0.44
    },
    {
      id: "yoroz_lee_akcaabat_ortahisar_bay",
      labelTr: "Akçaabat – Ortahisar (Trabzon Merkez / LTCG) – Yomra – Arsin (Yoroz Mikro-Gölge Körfezi)",
      polygonOrBbox: { minLat: 40.90, maxLat: 41.08, minLon: 39.43, maxLon: 40.02 },
      elevationRangeM: [0, 260],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.72
    },
    {
      id: "surmene_of_hayrat_east_coast",
      labelTr: "Araklı – Sürmene – Of – Hayrat Doğu Açık Yağış Kıyısı (Rize Geçişi)",
      polygonOrBbox: { minLat: 40.84, maxLat: 41.02, minLon: 40.02, maxLon: 40.48 },
      elevationRangeM: [0, 340],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.48
    },
    {
      id: "macka_duzkoy_tonya_mid_valleys",
      labelTr: "Maçka (Değirmendere Fön Oluğu) – Düzköy – Tonya Orta Yamaç ve Vadiler",
      polygonOrBbox: { minLat: 40.72, maxLat: 40.95, minLon: 39.20, maxLon: 40.18 },
      elevationRangeM: [300, 1250],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.24
    },
    {
      id: "uzungol_zigana_haldizen_alpine",
      labelTr: "Uzungöl (1.090m) – Çaykara – Zigana Kuzey – Çakırgöl/Demirkapı (3.376m) Yüksek Kar Kuşağı",
      polygonOrBbox: { minLat: 40.5135, maxLat: 40.76, minLon: 39.32, maxLon: 40.5075 },
      elevationRangeM: [1000, 3376],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.06
    }
  ],
  barrierCouplingMatrix: {
    besikduzu_vakfikebir_west_yoroz: {
      besikduzu_vakfikebir_west_yoroz: 1.0,
      yoroz_lee_akcaabat_ortahisar_bay: 0.58,
      surmene_of_hayrat_east_coast: 0.46,
      macka_duzkoy_tonya_mid_valleys: 0.52,
      uzungol_zigana_haldizen_alpine: 0.24
    },
    yoroz_lee_akcaabat_ortahisar_bay: {
      besikduzu_vakfikebir_west_yoroz: 0.58,
      yoroz_lee_akcaabat_ortahisar_bay: 1.0,
      surmene_of_hayrat_east_coast: 0.66,
      macka_duzkoy_tonya_mid_valleys: 0.64,
      uzungol_zigana_haldizen_alpine: 0.28
    },
    surmene_of_hayrat_east_coast: {
      besikduzu_vakfikebir_west_yoroz: 0.46,
      yoroz_lee_akcaabat_ortahisar_bay: 0.66,
      surmene_of_hayrat_east_coast: 1.0,
      macka_duzkoy_tonya_mid_valleys: 0.54,
      uzungol_zigana_haldizen_alpine: 0.42
    },
    macka_duzkoy_tonya_mid_valleys: {
      besikduzu_vakfikebir_west_yoroz: 0.52,
      yoroz_lee_akcaabat_ortahisar_bay: 0.64,
      surmene_of_hayrat_east_coast: 0.54,
      macka_duzkoy_tonya_mid_valleys: 1.0,
      uzungol_zigana_haldizen_alpine: 0.62
    },
    uzungol_zigana_haldizen_alpine: {
      besikduzu_vakfikebir_west_yoroz: 0.24,
      yoroz_lee_akcaabat_ortahisar_bay: 0.28,
      surmene_of_hayrat_east_coast: 0.42,
      macka_duzkoy_tonya_mid_valleys: 0.62,
      uzungol_zigana_haldizen_alpine: 1.0
    }
  },
  stationOverrides: {
    "17038": {
      stationId: 17038,
      nameTr: "Trabzon Bölge WMO (Ortahisar)",
      lat: 40.9985,
      lon: 39.7649,
      demElevationM: 39,
      subBasinId: "yoroz_lee_akcaabat_ortahisar_bay",
      urbanFraction: 0.72,
      coldPoolSusceptibility: 0.10,
      verticalStratumRole: "coastal_or_gap"
    },
    "17037": {
      stationId: 17037,
      nameTr: "Trabzon Havalimanı MGM (LTCG)",
      lat: 40.9951,
      lon: 39.7897,
      demElevationM: 32,
      subBasinId: "yoroz_lee_akcaabat_ortahisar_bay",
      urbanFraction: 0.64,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "coastal_or_gap"
    },
    LTCG: {
      stationId: "LTCG",
      nameTr: "Trabzon Havalimanı METAR (LTCG)",
      lat: 40.9951,
      lon: 39.7897,
      demElevationM: 32,
      subBasinId: "yoroz_lee_akcaabat_ortahisar_bay",
      urbanFraction: 0.64,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "coastal_or_gap"
    },
    ICAO_LTCG: {
      stationId: "ICAO_LTCG",
      nameTr: "Trabzon Havalimanı METAR (ICAO_LTCG)",
      lat: 40.9951,
      lon: 39.7897,
      demElevationM: 32,
      subBasinId: "yoroz_lee_akcaabat_ortahisar_bay",
      urbanFraction: 0.64,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "coastal_or_gap"
    },
    "17626": {
      stationId: 17626,
      nameTr: "Akçaabat",
      lat: 41.018,
      lon: 39.568,
      demElevationM: 12,
      subBasinId: "yoroz_lee_akcaabat_ortahisar_bay",
      urbanFraction: 0.60,
      coldPoolSusceptibility: 0.10,
      verticalStratumRole: "coastal_or_gap"
    },
    "17463": {
      stationId: 17463,
      nameTr: "Çarşıbaşı / Yoroz Burnu",
      lat: 41.095,
      lon: 39.4208,
      demElevationM: 45,
      subBasinId: "besikduzu_vakfikebir_west_yoroz",
      urbanFraction: 0.30,
      coldPoolSusceptibility: 0.05,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17775": {
      stationId: 17775,
      nameTr: "Of Kıyı (TR-61 Öz İstasyonu)",
      lat: 40.9835,
      lon: 40.3319,
      demElevationM: 6,
      subBasinId: "surmene_of_hayrat_east_coast",
      urbanFraction: 0.46,
      coldPoolSusceptibility: 0.10,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18223": {
      stationId: 18223,
      nameTr: "Arsin (TR-61 Öz İstasyonu)",
      lat: 40.9486,
      lon: 39.9497,
      demElevationM: 142,
      subBasinId: "yoroz_lee_akcaabat_ortahisar_bay",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.16,
      verticalStratumRole: "coastal_or_gap"
    },
    "18572": {
      stationId: 18572,
      nameTr: "Maçka Değirmendere Vadisi",
      lat: 40.8137,
      lon: 39.612,
      demElevationM: 363,
      subBasinId: "macka_duzkoy_tonya_mid_valleys",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "19246": {
      stationId: 19246,
      nameTr: "Çaykara – Uzungöl Alt Vadisi",
      lat: 40.7514,
      lon: 40.2432,
      demElevationM: 475,
      subBasinId: "macka_duzkoy_tonya_mid_valleys",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.42,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [
      HYPSO_TR_61.bands[0].elevationM,
      HYPSO_TR_61.bands[1].elevationM,
      HYPSO_TR_61.bands[2].elevationM,
      HYPSO_TR_61.bands[3].elevationM
    ],
    maxPhysicalPeakM: HYPSO_TR_61.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_61.bands
  },
  waterBodies: [
    {
      id: "east_black_sea_trabzon_shelf",
      labelTr: "Doğu Karadeniz (Yoroz Burnu – Trabzon Körfezi – Sürmene/Of Kıta Sahanlığı)",
      kind: "open_sea",
      mgmMarineStationIds: [17038, 17463, 17464, 17465, 17626],
      sampleCoord: { lat: 41.16, lon: 39.78 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.0,
      monthlyWaterTempNormalsC: [
        10.0, 9.0, 9.4, 11.8, 16.1, 21.3,
        24.9, 26.1, 23.8, 19.8, 15.4, 12.0
      ],
      subBasinInfluenceWeights: {
        besikduzu_vakfikebir_west_yoroz: 0.96,
        yoroz_lee_akcaabat_ortahisar_bay: 0.90,
        surmene_of_hayrat_east_coast: 0.97,
        macka_duzkoy_tonya_mid_valleys: 0.50,
        uzungol_zigana_haldizen_alpine: 0.34
      },
      onshoreWindSectorDeg: { fromDeg: 335, toDeg: 50 },
      effectiveFetchKm: 560,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 11.5,
      dekHeavyDeltaTC: 14.2,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 340, toDeg: 45 },
        maxInlandPenetrationKm: 20,
        maxCoolingAmplitudeC: 3.6
      }
    }
  ],
  directionalBarriers: [
    {
      id: "yoroz_cape_shadow_and_degirmendere_foehn_barrier",
      labelTr: "Yoroz Burnu Karayel Mikro-Gölgesi & Zigana–Değirmendere Güneyli Trabzon Fönü",
      effectiveBarrierHeightM: 2250,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "yoroz_lee_akcaabat_ortahisar_bay",
        "macka_duzkoy_tonya_mid_valleys"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 160, toDeg: 215 },
        minCrossCrestSpeedMs: 6.5,
        minFroudeNumber: 0.76,
        sourcePlateauElevationM: 1850,
        maxTargetElevationM: 450,
        maxWarmingCapC: 9.2,
        subCloudVirgaFactor: 0.64,
        wetCutoffMmHr: 0.3
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 340, toDeg: 45 },
        minOnshoreOrUpslopeSpeedMs: 4.5,
        coastalFrictionalConvergenceBoost: 0.24,
        maxPrecipMultiplierCap: 1.48
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 270, toDeg: 315 },
        precipAttenuationFactor: 0.66
      }
    },
    {
      id: "west_yoroz_and_east_of_exposed_orographic_wall",
      labelTr: "Beşikdüzü–Sis Dağı (Batı) & Sürmene–Of–Uzungöl–Soğanlı (Doğu) Açık Karayel/Yıldız Duvarı",
      effectiveBarrierHeightM: 3100,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "besikduzu_vakfikebir_west_yoroz",
        "surmene_of_hayrat_east_coast",
        "uzungol_zigana_haldizen_alpine"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 160, toDeg: 215 },
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.80,
        sourcePlateauElevationM: 1900,
        maxTargetElevationM: 400,
        maxWarmingCapC: 8.4,
        subCloudVirgaFactor: 0.56,
        wetCutoffMmHr: 0.35
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 285, toDeg: 40 },
        minOnshoreOrUpslopeSpeedMs: 4.5,
        coastalFrictionalConvergenceBoost: 0.28,
        maxPrecipMultiplierCap: 1.66
      }
    }
  ],
  venturiCorridors: [
    {
      id: "degirmendere_macka_foehn_chute",
      labelTr: "Zigana – Maçka – Değirmendere – Trabzon (LTCG) Güneyli Fön Oluk Jeti",
      centerCoord: { lat: 40.89, lon: 39.68 },
      influenceRadiusKm: 18,
      channelAxisFromDeg: 185,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.36,
      gustMultiplier: 1.52,
      suppressesNocturnalInversion: true
    },
    {
      id: "yoroz_cape_coastal_deflection_jet",
      labelTr: "Yoroz Burnu Kıyı Sapma ve Hamle Jeti",
      centerCoord: { lat: 41.095, lon: 39.4208 },
      influenceRadiusKm: 16,
      channelAxisFromDeg: 295,
      bidirectional: false,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.30,
      gustMultiplier: 1.42,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 25,
    coldPoolMaxDepthM: 140,
    topographicEnclosureIndex: 0.40,
    deltaPressureTopHpa: 20,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 3.0
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.34
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.28,
    invertedVDryMicroburstSusceptibility: 0.26,
    coastalWaterspoutSusceptibility: 0.82
  },
  stencil9Points: [
    {
      key: "target_trabzon_ortahisar_center",
      labelTr: "Trabzon Merkez (Ortahisar / Boztepe Eteği 39m — WMO 17038)",
      lat: 40.9985,
      lon: 39.7649,
      elevationM: 39,
      role: "target"
    },
    {
      key: "marine_north_trabzon_direct_fetch",
      labelTr: "Trabzon Kuzey Karadeniz Açığı (Yıldız/Poyraz Doğrudan Deniz Etkisi)",
      lat: 41.24,
      lon: 39.78,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "marine_nw_yoroz_upwind",
      labelTr: "Yoroz Batısı Kuzeybatı Karadeniz Açığı (Karayel Girişi)",
      lat: 41.22,
      lon: 39.20,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "orographic_yoroz_cape_shield",
      labelTr: "Yoroz Burnu / Çarşıbaşı Siperi (41.095N, 39.421E)",
      lat: 41.078,
      lon: 39.418,
      elevationM: 185,
      role: "orographic_wall"
    },
    {
      key: "corridor_besikduzu_west_exposed",
      labelTr: "Beşikdüzü Karayel Açık Kıyı (12m)",
      lat: 41.045,
      lon: 39.2328,
      elevationM: 12,
      role: "corridor"
    },
    {
      key: "corridor_of_east_exposed",
      labelTr: "Of – Sürmene Doğu Yağış Koridoru (6m)",
      lat: 40.968,
      lon: 40.325,
      elevationM: 18,
      role: "corridor"
    },
    {
      key: "foehn_macka_degirmendere",
      labelTr: "Maçka – Değirmendere Güneyli Fön Oluğu (363m)",
      lat: 40.8137,
      lon: 39.612,
      elevationM: 363,
      role: "foehn_windward"
    },
    {
      key: "orographic_uzungol_haldizen",
      labelTr: "Uzungöl / Haldizen Yüksek Vadisi (1.090m)",
      lat: 40.6195,
      lon: 40.2925,
      elevationM: 1090,
      role: "orographic_wall"
    },
    {
      key: "orographic_cakirgol_zigana_crest",
      labelTr: "Zigana Kuzey / Çakırgöl Zirve Kuşağı (2.050m)",
      lat: 40.685,
      lon: 39.685,
      elevationM: 2050,
      role: "orographic_wall"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -21.0,
    maxPlausibleTempC: 41.5,
    minPlausibleMslpHpa: 980,
    maxPlausibleMslpHpa: 1044,
    kalmanTempBiasCapC: 6.5
  }
};

export const PROVINCE_SPEC_TR_61: ProvinceSpec = Object.freeze(RAW_PROVINCE_SPEC_TR_61);

function isSectorMatch(deg: number, sector: { fromDeg: number; toDeg: number }): boolean {
  const d = ((deg % 360) + 360) % 360;
  if (sector.fromDeg <= sector.toDeg) {
    return d >= sector.fromDeg && d <= sector.toDeg;
  }
  return d >= sector.fromDeg || d <= sector.toDeg;
}

/**
 * Trabzon'un üç karakteristik sinoptik rejimini `PROVINCE_SPEC_TR_61` ile hesaplar:
 *  1. Batılı/Karayel (`270°–315°`): Yoroz Burnu doğusundaki Trabzon Merkez (`LTCG`) kısmi gölgede (`0.66x`)
 *     kalırken Beşikdüzü ve Of açık kıyı çarpanı (`>1.4x`) alır.
 *  2. Kuzey/Kuzeydoğu (`340°–45°` Yıldız/Poyraz): Trabzon Merkez gölgeden çıkarak doğrudan denizel upslope (`1.48x`) alır.
 *  3. Güneyli (`160°–215°`): Değirmendere/Maçka vadi oluğundan Trabzon Merkez'e `+7..+9.2°C` kuru fön patlaması iner.
 */
export function evaluateTrabzonYorozAndFoehnResponse(params: {
  windFromDirDeg: number;
  windSpeedMs: number;
  basePrecipMmHr: number;
  baseTempC: number;
}): {
  trabzonMerkezPrecipMmHr: number;
  besikduzuPrecipMmHr: number;
  ofEastPrecipMmHr: number;
  trabzonFoehnWarmingC: number;
  trabzonAdjustedTempC: number;
  isYorozShadowActive: boolean;
} {
  const bayBarrier = PROVINCE_SPEC_TR_61.directionalBarriers[0];
  const exposedBarrier = PROVINCE_SPEC_TR_61.directionalBarriers[1];

  let trabzonMult = 1.0;
  let exposedMult = 1.0;
  let trabzonFoehnWarmingC = 0;
  let isYorozShadowActive = false;

  if (
    bayBarrier.rainShadowSpec &&
    isSectorMatch(
      params.windFromDirDeg,
      bayBarrier.rainShadowSpec.shadowedWindFromSectorDeg
    )
  ) {
    isYorozShadowActive = true;
    trabzonMult = bayBarrier.rainShadowSpec.precipAttenuationFactor;
  } else if (
    bayBarrier.upslopeSpec.enabled &&
    isSectorMatch(params.windFromDirDeg, bayBarrier.upslopeSpec.windFromSectorDeg) &&
    params.windSpeedMs >= bayBarrier.upslopeSpec.minOnshoreOrUpslopeSpeedMs
  ) {
    trabzonMult = bayBarrier.upslopeSpec.maxPrecipMultiplierCap;
  } else if (
    bayBarrier.foehnSpec.enabled &&
    isSectorMatch(params.windFromDirDeg, bayBarrier.foehnSpec.windFromSectorDeg) &&
    params.windSpeedMs >= bayBarrier.foehnSpec.minCrossCrestSpeedMs
  ) {
    const ramp = Math.min(
      1,
      0.75 + (params.windSpeedMs - bayBarrier.foehnSpec.minCrossCrestSpeedMs) / 16.0
    );
    trabzonFoehnWarmingC = bayBarrier.foehnSpec.maxWarmingCapC * ramp;
    trabzonMult = 0.25;
  }

  if (
    exposedBarrier.upslopeSpec.enabled &&
    isSectorMatch(params.windFromDirDeg, exposedBarrier.upslopeSpec.windFromSectorDeg) &&
    params.windSpeedMs >= exposedBarrier.upslopeSpec.minOnshoreOrUpslopeSpeedMs
  ) {
    exposedMult = exposedBarrier.upslopeSpec.maxPrecipMultiplierCap;
  } else if (trabzonFoehnWarmingC > 0) {
    exposedMult = 0.30;
  }

  return {
    trabzonMerkezPrecipMmHr: params.basePrecipMmHr * trabzonMult,
    besikduzuPrecipMmHr: params.basePrecipMmHr * exposedMult,
    ofEastPrecipMmHr: params.basePrecipMmHr * exposedMult,
    trabzonFoehnWarmingC,
    trabzonAdjustedTempC: params.baseTempC + trabzonFoehnWarmingC,
    isYorozShadowActive
  };
}

export default PROVINCE_SPEC_TR_61;
