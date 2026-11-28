import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_53 = TR81_CLIMATOLOGY_1991_2020["TR-53"];
const HYPSO_TR_53 = TR81_HYPSOMETRIC_PROFILES["TR-53"];

/**
 * ATMOS v5.0 — Wave 3B (REG-12) Bespoke Microclimate Spec: TR-53 Rize
 *
 * Fiziksel ve Sinoptik Kilitler:
 *  1. Kaçkar Dağları (3.937 m) — Türkiye'nin Mutlak Maksimum Orografik Yakınsama Duvarı:
 *     Kıyıdan kuş uçuşu <40 km içinde 0 m'den 3.937 m'ye dik yükselen duvar, Karayel/Yıldız/Poyraz
 *     (`310°–30°`) denizel akışında ve Doğu Karadeniz sıcak deniz (Batumi Gyre) DEK kararsızlığında
 *     yıllık >2.300 mm yağış üretir (`maxPrecipMultiplierCap: 1.85` — yüksek ama fiziksel tavanlı!).
 *  2. Şiddetli Güneyli Kaçkar Fön Patlaması (`+8..+11°C`):
 *     Erzurum–İspir yüksek platosundan (`~1.950 m`) Ovit/Kaçkar sırtını aşarak `0–40 m` Rize kıyısına
 *     çöken güneyli (`150°–220°`) akışta adyabatik ısınmayla kış ortasında dahi sıcaklık aniden
 *     `+8..+11°C` sıçrar (`maxWarmingCapC = 10.5°C`), bağıl nem %20 altına düşer ve virga kurutması oluşur.
 *  3. Ayder Yaylası (`1.350 m`) & Ovit Geçidi (`2.640–2.693 m`) Çığ ve Derin Kar Kuşakları.
 *  4. METAR ve Vekil İstasyon Kilidi: Yalnızca Pazar/Yeşilköy'deki Rize-Artvin Havalimanı (`["LTFO"]`)
 *     kabul edilir; Trabzon (`LTCG`), Batum (`UGSB`) ve İyidere'nin ödünç aldığı Trabzon/Of (`17775`) reddedilir.
 */
export const TR_53_BESPOKE_META = Object.freeze({
  wmoStationId: "17040",
  kackarPeakM: 3937,
  ayderElevationM: 1350,
  ovitPassElevationM: 2640,
  upslopeSectorDeg: Object.freeze({ fromDeg: 310, toDeg: 30 }),
  maxPrecipMultiplierCap: 1.85,
  kackarFoehnWarmingRangeC: Object.freeze([8.0, 11.0] as const),
  allowedMetarIcaos: Object.freeze(["LTFO"] as const),
  blockedCrossProvinceMgmIstNos: Object.freeze([17775] as const)
});

const RAW_PROVINCE_SPEC_TR_53: ProvinceSpec = {
  provinceCode: "TR-53",
  plateCode: 53,
  slug: "rize",
  nameTr: "Rize",
  region: "BLACK_SEA_EAST",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "EAST_BLACK_SEA_STEEP_OROG",
  icaoWhitelist: TR_53_BESPOKE_META.allowedMetarIcaos,
  domainBounds: {
    minLat: 40.5185,
    maxLat: 41.3235,
    minLon: 40.3298,
    maxLon: 41.3757
  },
  primaryCenter: {
    mgmMerkezId: 95301,
    mgmIstNo: 17040,
    mgmSaatlikIstNo: 17040,
    mgmGunlukIstNo: 95301,
    wmoId: "17040",
    lat: 41.04,
    lon: 40.5013,
    demVerifiedElevationM: 3,
    subBasinId: "rize_cayeli_pazar_ardesen_coast",
    urbanFraction: 0.62,
    monthlyTmaxNormalsC: CLIM_TR_53.tmaxC,
    monthlyTminNormalsC: CLIM_TR_53.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-53-cayeli",
      name: "Çayeli Kıyı",
      role: "coast",
      lat: 41.0603,
      lon: 40.7417,
      elevationM: 54
    },
    {
      id: "tr-53-ardesen",
      name: "Ardeşen – Pazar (LTFO Kıyı Hattı)",
      role: "coast",
      lat: 41.1921,
      lon: 40.9912,
      elevationM: 7
    },
    {
      id: "tr-53-camlihemsin",
      name: "Çamlıhemşin (Fırtına Vadisi)",
      role: "plain",
      lat: 41.0125,
      lon: 40.9942,
      elevationM: 390
    },
    {
      id: "tr-53-ikizdere",
      name: "İkizdere Kanyon Vadisi",
      role: "foothill",
      lat: 40.7788,
      lon: 40.5591,
      elevationM: 522
    },
    {
      id: "tr-53-ayder",
      name: "Ayder Yaylası (1.350m)",
      role: "foothill",
      lat: 40.9518,
      lon: 41.1103,
      elevationM: 1354
    },
    {
      id: "tr-53-ovit-zirve",
      name: "Ovit Geçidi / Kaçkar Çığ-Kar Kuşağı",
      role: "summit",
      lat: 40.6244,
      lon: 40.7812,
      elevationM: 2640
    }
  ],
  subBasins: [
    {
      id: "rize_cayeli_pazar_ardesen_coast",
      labelTr: "Rize Merkez – Çayeli – Pazar (LTFO) – Ardeşen – Fındıklı Aşırı Yağış Kıyısı",
      polygonOrBbox: { minLat: 40.96, maxLat: 41.3235, minLon: 40.33, maxLon: 41.35 },
      elevationRangeM: [0, 220],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.56
    },
    {
      id: "guneysu_kalkandere_hemsin_foothill",
      labelTr: "Güneysu – Kalkandere – Hemşin Dik Çay Bahçesi Yamaç Kuşağı (150–800m)",
      polygonOrBbox: { minLat: 40.86, maxLat: 41.14, minLon: 40.38, maxLon: 41.12 },
      elevationRangeM: [120, 850],
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.28
    },
    {
      id: "ikizdere_firtina_ayder_valleys",
      labelTr: "İkizdere & Fırtına Vadileri – Ayder Yaylası (1.350m) Orografik Oluk Kuşağı",
      polygonOrBbox: { minLat: 40.72, maxLat: 41.04, minLon: 40.48, maxLon: 41.25 },
      elevationRangeM: [380, 1750],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.10
    },
    {
      id: "ovit_kackar_avalanche_alpine",
      labelTr: "Ovit Geçidi (2.640m) – Verçenik – Kaçkar Zirve (3.937m) Alpin Kar & Çığ Duvarı",
      polygonOrBbox: { minLat: 40.52, maxLat: 40.94, minLon: 40.52, maxLon: 41.37 },
      elevationRangeM: [1750, 3937],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.01
    }
  ],
  barrierCouplingMatrix: {
    rize_cayeli_pazar_ardesen_coast: {
      rize_cayeli_pazar_ardesen_coast: 1.0,
      guneysu_kalkandere_hemsin_foothill: 0.84,
      ikizdere_firtina_ayder_valleys: 0.52,
      ovit_kackar_avalanche_alpine: 0.24
    },
    guneysu_kalkandere_hemsin_foothill: {
      rize_cayeli_pazar_ardesen_coast: 0.84,
      guneysu_kalkandere_hemsin_foothill: 1.0,
      ikizdere_firtina_ayder_valleys: 0.72,
      ovit_kackar_avalanche_alpine: 0.38
    },
    ikizdere_firtina_ayder_valleys: {
      rize_cayeli_pazar_ardesen_coast: 0.52,
      guneysu_kalkandere_hemsin_foothill: 0.72,
      ikizdere_firtina_ayder_valleys: 1.0,
      ovit_kackar_avalanche_alpine: 0.68
    },
    ovit_kackar_avalanche_alpine: {
      rize_cayeli_pazar_ardesen_coast: 0.24,
      guneysu_kalkandere_hemsin_foothill: 0.38,
      ikizdere_firtina_ayder_valleys: 0.68,
      ovit_kackar_avalanche_alpine: 1.0
    }
  },
  stationOverrides: {
    "17040": {
      stationId: 17040,
      nameTr: "Rize Merkez WMO (Sahil)",
      lat: 41.04,
      lon: 40.5013,
      demElevationM: 4,
      subBasinId: "rize_cayeli_pazar_ardesen_coast",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "coastal_or_gap"
    },
    LTFO: {
      stationId: "LTFO",
      nameTr: "Rize-Artvin Havalimanı METAR (Pazar LTFO)",
      lat: 41.168,
      lon: 40.892,
      demElevationM: 5,
      subBasinId: "rize_cayeli_pazar_ardesen_coast",
      urbanFraction: 0.25,
      coldPoolSusceptibility: 0.06,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    ICAO_LTFO: {
      stationId: "ICAO_LTFO",
      nameTr: "Rize-Artvin Havalimanı METAR (LTFO)",
      lat: 41.168,
      lon: 40.892,
      demElevationM: 5,
      subBasinId: "rize_cayeli_pazar_ardesen_coast",
      urbanFraction: 0.25,
      coldPoolSusceptibility: 0.06,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17628": {
      stationId: 17628,
      nameTr: "Pazar",
      lat: 41.168,
      lon: 40.892,
      demElevationM: 78,
      subBasinId: "rize_cayeli_pazar_ardesen_coast",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.10,
      verticalStratumRole: "coastal_or_gap"
    },
    "17781": {
      stationId: 17781,
      nameTr: "Çayeli",
      lat: 41.0603,
      lon: 40.7417,
      demElevationM: 54,
      subBasinId: "rize_cayeli_pazar_ardesen_coast",
      urbanFraction: 0.50,
      coldPoolSusceptibility: 0.10,
      verticalStratumRole: "coastal_or_gap"
    },
    "17800": {
      stationId: 17800,
      nameTr: "Güneysu Yamaç",
      lat: 40.9898,
      lon: 40.6083,
      demElevationM: 122,
      subBasinId: "guneysu_kalkandere_hemsin_foothill",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "mid_slope"
    },
    "19334": {
      stationId: 19334,
      nameTr: "İkizdere Vadisi",
      lat: 40.7788,
      lon: 40.5591,
      demElevationM: 514,
      subBasinId: "ikizdere_firtina_ayder_valleys",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17713": {
      stationId: 17713,
      nameTr: "Ayder Yaylası (1.350m)",
      lat: 40.9518,
      lon: 41.1103,
      demElevationM: 1359,
      subBasinId: "ikizdere_firtina_ayder_valleys",
      urbanFraction: 0.06,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18963": {
      stationId: 18963,
      nameTr: "Ovit Dağı Geçidi / Zirve (2.640–2.687m)",
      lat: 40.6244,
      lon: 40.7812,
      demElevationM: 2687,
      subBasinId: "ovit_kackar_avalanche_alpine",
      urbanFraction: 0.0,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [
      HYPSO_TR_53.bands[0].elevationM,
      HYPSO_TR_53.bands[1].elevationM,
      HYPSO_TR_53.bands[2].elevationM,
      HYPSO_TR_53.bands[3].elevationM
    ],
    maxPhysicalPeakM: HYPSO_TR_53.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_53.bands
  },
  waterBodies: [
    {
      id: "east_black_sea_rize_warm_pool",
      labelTr: "Doğu Karadeniz (Rize – Pazar – Fındıklı Sıcak Havuz & DEK Kaynağı)",
      kind: "open_sea",
      mgmMarineStationIds: [17040, 17466, 17628],
      sampleCoord: { lat: 41.22, lon: 40.58 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.0,
      monthlyWaterTempNormalsC: [
        10.3, 9.3, 9.7, 12.0, 16.3, 21.5,
        25.1, 26.3, 24.0, 20.1, 15.7, 12.3
      ],
      subBasinInfluenceWeights: {
        rize_cayeli_pazar_ardesen_coast: 0.99,
        guneysu_kalkandere_hemsin_foothill: 0.86,
        ikizdere_firtina_ayder_valleys: 0.62,
        ovit_kackar_avalanche_alpine: 0.45
      },
      onshoreWindSectorDeg: { fromDeg: 310, toDeg: 30 },
      effectiveFetchKm: 620,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 11.0,
      dekHeavyDeltaTC: 13.8,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 315, toDeg: 20 },
        maxInlandPenetrationKm: 18,
        maxCoolingAmplitudeC: 3.4
      }
    }
  ],
  directionalBarriers: [
    {
      id: "kackar_north_wall_max_orographic_convergence",
      labelTr: "Kaçkar Dağları (3.937m) Kuzey Dik Duvarı — Maksimum Orografik Yağış/DEK & Güneyli +8..+11°C Fön",
      effectiveBarrierHeightM: 3937,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "rize_cayeli_pazar_ardesen_coast",
        "guneysu_kalkandere_hemsin_foothill",
        "ikizdere_firtina_ayder_valleys"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 150, toDeg: 220 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.78,
        sourcePlateauElevationM: 1950,
        maxTargetElevationM: 420,
        maxWarmingCapC: 10.5,
        subCloudVirgaFactor: 0.68,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 310, toDeg: 30 },
        minOnshoreOrUpslopeSpeedMs: 4.0,
        coastalFrictionalConvergenceBoost: 0.34,
        maxPrecipMultiplierCap: 1.85
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 155, toDeg: 215 },
        precipAttenuationFactor: 0.28
      }
    },
    {
      id: "ovit_ayder_kackar_avalanche_crest",
      labelTr: "Ayder (1.350m) – Ovit (2.640m) – Kaçkar (3.937m) Çığ ve Tipi Zirve Duvarı",
      effectiveBarrierHeightM: 3400,
      crestPressureHpa: 700,
      applicableSubBasins: ["ovit_kackar_avalanche_alpine"],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 150, toDeg: 220 },
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
        windFromSectorDeg: { fromDeg: 305, toDeg: 35 },
        minOnshoreOrUpslopeSpeedMs: 4.5,
        coastalFrictionalConvergenceBoost: 0.24,
        maxPrecipMultiplierCap: 1.78
      }
    }
  ],
  venturiCorridors: [
    {
      id: "ikizdere_ovit_foehn_chute",
      labelTr: "Ovit Geçidi – İkizdere – Rize Merkez Fön İniş Oluğu",
      centerCoord: { lat: 40.82, lon: 40.58 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 175,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.38,
      gustMultiplier: 1.54,
      suppressesNocturnalInversion: true
    },
    {
      id: "firtina_valley_ayder_chute",
      labelTr: "Fırtına Vadisi (Ardeşen – Çamlıhemşin – Ayder) Orografik/Fön Kanalı",
      centerCoord: { lat: 41.05, lon: 41.02 },
      influenceRadiusKm: 18,
      channelAxisFromDeg: 165,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.32,
      gustMultiplier: 1.48,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 10,
    coldPoolMaxDepthM: 120,
    topographicEnclosureIndex: 0.36,
    deltaPressureTopHpa: 18,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 2.8
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.36
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.24,
    invertedVDryMicroburstSusceptibility: 0.22,
    coastalWaterspoutSusceptibility: 0.90
  },
  stencil9Points: [
    {
      key: "target_rize_merkez_inland",
      labelTr: "Rize Merkez (Kıyı/Dağdibi 35m — WMO 17040)",
      lat: 41.0255,
      lon: 40.5177,
      elevationM: 35,
      role: "target"
    },
    {
      key: "marine_rize_nw_fetch",
      labelTr: "Rize Kuzeybatı Karadeniz Açığı (620 km Karayel/DEK Fetch)",
      lat: 41.32,
      lon: 40.35,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "marine_pazar_north_fetch",
      labelTr: "Pazar – Ardeşen Kuzey Açık Deniz (Yıldız/DEK Kaynağı)",
      lat: 41.38,
      lon: 40.92,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "corridor_pazar_ltfo",
      labelTr: "Pazar / Rize-Artvin Havalimanı Kıyı Hattı (LTFO)",
      lat: 41.168,
      lon: 40.892,
      elevationM: 18,
      role: "corridor"
    },
    {
      key: "corridor_ikizdere_chute",
      labelTr: "İkizdere Kanyon Oluğu (522m)",
      lat: 40.7788,
      lon: 40.5591,
      elevationM: 522,
      role: "corridor"
    },
    {
      key: "orographic_ayder_plateau",
      labelTr: "Ayder Yaylası Kar Kuşağı (1.354m)",
      lat: 40.9518,
      lon: 41.1103,
      elevationM: 1354,
      role: "orographic_wall"
    },
    {
      key: "orographic_kackar_kavrun_wall",
      labelTr: "Kaçkar Dağları Kuzey Sırtı / Kavrun (3.400–3.937m)",
      lat: 40.858,
      lon: 41.125,
      elevationM: 3450,
      role: "orographic_wall"
    },
    {
      key: "foehn_ovit_pass_crest",
      labelTr: "Ovit Geçidi Zirve Eşiği (2.640m — Güneyli Fön Aşım Kapısı)",
      lat: 40.6244,
      lon: 40.7812,
      elevationM: 2640,
      role: "foehn_windward"
    },
    {
      key: "lee_findikli_east_coast",
      labelTr: "Fındıklı Doğu Kıyı Geçişi (190m)",
      lat: 41.2703,
      lon: 41.1556,
      elevationM: 190,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -22.0,
    maxPlausibleTempC: 41.5,
    minPlausibleMslpHpa: 980,
    maxPlausibleMslpHpa: 1044,
    kalmanTempBiasCapC: 6.5
  }
};

export const PROVINCE_SPEC_TR_53: ProvinceSpec = Object.freeze(RAW_PROVINCE_SPEC_TR_53);

function isSectorMatch(deg: number, sector: { fromDeg: number; toDeg: number }): boolean {
  const d = ((deg % 360) + 360) % 360;
  if (sector.fromDeg <= sector.toDeg) {
    return d >= sector.fromDeg && d <= sector.toDeg;
  }
  return d >= sector.fromDeg || d <= sector.toDeg;
}

/**
 * Rize Kaçkar duvarının (`3.937 m`) iki uç sinoptik rejimini `PROVINCE_SPEC_TR_53` üzerinden hesaplar:
 *  - Karayel/Yıldız (`310°–30°`) + sıcak deniz DEK (`SST - T700 >= 22°C` veya `SST - T850 >= 13.8°C`):
 *    Fiziksel tavanlı (`<= 1.85x`) şiddetli orografik sağanak + Ayder (`1.350m`) / Ovit (`2.640m`) yoğun kar.
 *  - Güneyli (`150°–220°`) kuvvetli üst seviye akışı: Ovit–İkizdere oluğundan inen `+8..+10.5°C` Kaçkar fön patlaması!
 */
export function evaluateRizeKackarExtremeRegime(params: {
  windFromDirDeg: number;
  windSpeedMs: number;
  basePrecipMmHr: number;
  coastalBaseTempC: number;
  temp850C: number;
  sstC: number;
}): {
  coastalPrecipMultiplier: number;
  coastalAdjustedPrecipMmHr: number;
  foehnWarmingC: number;
  coastalAdjustedTempC: number;
  dekHeavyActive: boolean;
  ayder1350mSnowPhase: boolean;
  ovit2640mSnowPhase: boolean;
} {
  const wall = PROVINCE_SPEC_TR_53.directionalBarriers[0];
  const sea = PROVINCE_SPEC_TR_53.waterBodies[0];

  let coastalPrecipMultiplier = 1.0;
  let foehnWarmingC = 0;

  const isUpslope =
    wall.upslopeSpec.enabled &&
    isSectorMatch(params.windFromDirDeg, wall.upslopeSpec.windFromSectorDeg) &&
    params.windSpeedMs >= wall.upslopeSpec.minOnshoreOrUpslopeSpeedMs;

  const deltaSst850C = params.sstC - params.temp850C;
  const dekHeavyActive = isUpslope && deltaSst850C >= sea.dekHeavyDeltaTC;

  if (isUpslope) {
    const speedRamp = Math.min(
      1,
      (params.windSpeedMs - wall.upslopeSpec.minOnshoreOrUpslopeSpeedMs) / 10.0 +
        wall.upslopeSpec.coastalFrictionalConvergenceBoost +
        (dekHeavyActive ? 0.25 : 0)
    );
    const cap = wall.upslopeSpec.maxPrecipMultiplierCap;
    coastalPrecipMultiplier = Math.min(cap, 1 + (cap - 1) * speedRamp);
  } else if (
    wall.foehnSpec.enabled &&
    isSectorMatch(params.windFromDirDeg, wall.foehnSpec.windFromSectorDeg) &&
    params.windSpeedMs >= wall.foehnSpec.minCrossCrestSpeedMs
  ) {
    const foehnRamp = Math.min(
      1,
      0.76 + (params.windSpeedMs - wall.foehnSpec.minCrossCrestSpeedMs) / 18.0
    );
    foehnWarmingC = wall.foehnSpec.maxWarmingCapC * foehnRamp;
    coastalPrecipMultiplier = wall.rainShadowSpec
      ? wall.rainShadowSpec.precipAttenuationFactor
      : 0.3;
  }

  const ayderTempC = params.temp850C + ((1500 - 1350) / 1000) * 5.8;
  const ovitTempC = params.temp850C - ((2640 - 1500) / 1000) * 5.8;

  return {
    coastalPrecipMultiplier,
    coastalAdjustedPrecipMmHr: params.basePrecipMmHr * coastalPrecipMultiplier,
    foehnWarmingC,
    coastalAdjustedTempC: params.coastalBaseTempC + foehnWarmingC,
    dekHeavyActive,
    ayder1350mSnowPhase: ayderTempC <= 1.0 && params.basePrecipMmHr > 0,
    ovit2640mSnowPhase: ovitTempC <= 1.0 && params.basePrecipMmHr > 0
  };
}

export default PROVINCE_SPEC_TR_53;
