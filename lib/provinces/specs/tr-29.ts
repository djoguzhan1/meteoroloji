import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_29 = TR81_CLIMATOLOGY_1991_2020["TR-29"];
const HYPSO_TR_29 = TR81_HYPSOMETRIC_PROFILES["TR-29"];

/**
 * ATMOS v5.0 — Wave 3B (REG-12) Bespoke Microclimate Spec: TR-29 Gümüşhane
 *
 * Fiziksel ve Sinoptik Kilitler:
 *  1. Zigana (2.032 m geçit / 2.550 m sırt) & Soğanlı Dağları Güney Yağış Gölgesi:
 *     Karadeniz'den gelen kuzeyli nem kütlesi Zigana kuzey yamacında yoğun yağış/kar bırakırken,
 *     güneydeki derin Harşit Vadisi'nde (`~1.216 m` Gümüşhane Merkez, elma/ceviz bahçeleri korunaklı
 *     mikrokliması) alçalarak kurur (`precipAttenuationFactor = 0.44`; yıllık yağış ~462 mm).
 *  2. Kelkit – Şiran – Köse Yüksek Kuru İç Ova (`1.480–1.635 m`):
 *     Kostan ve Tersun geçitlerinin güneyinde Doğu Anadolu step/soğuk çanak rejimine geçiş.
 *  3. Zigana Kayak Merkezi (`2.050 m`, istasyon 17696) & Süleymaniye (`2.227 m`) – Abdal Musa (`3.331 m`) Kar Kuşağı.
 *  4. Tam Karasal İzolasyon: `waterBodies: []` ve `icaoWhitelist: []` (Trabzon `LTCG` denizel
 *     METAR verisinin Zigana duvarını aşıp Gümüşhane'yi ılımanlaştırması %100 yasaktır).
 */
export const TR_29_BESPOKE_META = Object.freeze({
  wmoStationId: "17088",
  harsitValleyCenterElevationM: 1216,
  ziganaPassElevationM: 2032,
  ziganaSkiElevationM: 2050,
  abdalMusaPeakM: 3331,
  allowedMetarIcaos: Object.freeze([] as const),
  forbiddenCoastalAndNeighborIcaos: Object.freeze(["LTCG", "LTCD", "LTCE", "LTCB"] as const)
});

const RAW_PROVINCE_SPEC_TR_29: ProvinceSpec = {
  provinceCode: "TR-29",
  plateCode: 29,
  slug: "gumushane",
  nameTr: "Gümüşhane",
  region: "BLACK_SEA_EAST",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "INLAND_PASS_PLATEAU",
  icaoWhitelist: TR_29_BESPOKE_META.allowedMetarIcaos,
  domainBounds: {
    minLat: 39.8362,
    maxLat: 40.8372,
    minLon: 38.7505,
    maxLon: 40.1033
  },
  primaryCenter: {
    mgmMerkezId: 92901,
    mgmIstNo: 17088,
    mgmSaatlikIstNo: 17088,
    mgmGunlukIstNo: 92901,
    wmoId: "17088",
    lat: 40.4598,
    lon: 39.4653,
    demVerifiedElevationM: 1216,
    subBasinId: "gumushane_harsit_orchard_valley",
    urbanFraction: 0.42,
    monthlyTmaxNormalsC: CLIM_TR_29.tmaxC,
    monthlyTminNormalsC: CLIM_TR_29.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-29-kurtun",
      name: "Kürtün (Alt Harşit Vadisi)",
      role: "plain",
      lat: 40.6825,
      lon: 39.1456,
      elevationM: 739
    },
    {
      id: "tr-29-torul",
      name: "Torul (Zigana Güney Eteği)",
      role: "plain",
      lat: 40.5686,
      lon: 39.2989,
      elevationM: 1009
    },
    {
      id: "tr-29-kelkit",
      name: "Kelkit Yüksek Kuru Ova",
      role: "foothill",
      lat: 40.1506,
      lon: 39.4361,
      elevationM: 1483
    },
    {
      id: "tr-29-siran",
      name: "Şiran Yüksek Havza",
      role: "foothill",
      lat: 40.1856,
      lon: 39.1289,
      elevationM: 1490
    },
    {
      id: "tr-29-zigana",
      name: "Zigana Kayak Merkezi",
      role: "summit",
      lat: 40.6413,
      lon: 39.4037,
      elevationM: 2050
    },
    {
      id: "tr-29-suleymaniye-kayak",
      name: "Süleymaniye Kayak Kuşağı",
      role: "summit",
      lat: 40.4273,
      lon: 39.4406,
      elevationM: 2227
    }
  ],
  subBasins: [
    {
      id: "kurtun_torul_lower_harsit",
      labelTr: "Kürtün – Özkürtün – Torul Alt Harşit Derin Vadi Geçişi (730–1.050m)",
      polygonOrBbox: { minLat: 40.52, maxLat: 40.82, minLon: 38.82, maxLon: 39.36 },
      elevationRangeM: [680, 1120],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.24
    },
    {
      id: "gumushane_harsit_orchard_valley",
      labelTr: "Gümüşhane Merkez (~1.216m) Korunaklı Harşit Vadisi & Bahçe Mikrokliması",
      polygonOrBbox: { minLat: 40.36, maxLat: 40.56, minLon: 39.32, maxLon: 39.72 },
      elevationRangeM: [1120, 1420],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.42
    },
    {
      id: "kelkit_siran_kose_dry_plateau",
      labelTr: "Kelkit – Şiran – Köse Güney Karasal Yüksek Kuru Ova (1.450–1.720m)",
      polygonOrBbox: { minLat: 39.84, maxLat: 40.34, minLon: 38.85, maxLon: 39.95 },
      elevationRangeM: [1380, 1780],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.28
    },
    {
      id: "zigana_soganli_abdalmusa_alpine",
      labelTr: "Zigana Geçidi/Kayak (2.032–2.050m) – Soğanlı – Abdal Musa (3.331m) Alpin Kar Sırtı",
      polygonOrBbox: { minLat: 40.38, maxLat: 40.8372, minLon: 38.95, maxLon: 40.10 },
      elevationRangeM: [1800, 3331],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.02
    }
  ],
  barrierCouplingMatrix: {
    kurtun_torul_lower_harsit: {
      kurtun_torul_lower_harsit: 1.0,
      gumushane_harsit_orchard_valley: 0.72,
      kelkit_siran_kose_dry_plateau: 0.24,
      zigana_soganli_abdalmusa_alpine: 0.42
    },
    gumushane_harsit_orchard_valley: {
      kurtun_torul_lower_harsit: 0.72,
      gumushane_harsit_orchard_valley: 1.0,
      kelkit_siran_kose_dry_plateau: 0.38,
      zigana_soganli_abdalmusa_alpine: 0.40
    },
    kelkit_siran_kose_dry_plateau: {
      kurtun_torul_lower_harsit: 0.24,
      gumushane_harsit_orchard_valley: 0.38,
      kelkit_siran_kose_dry_plateau: 1.0,
      zigana_soganli_abdalmusa_alpine: 0.32
    },
    zigana_soganli_abdalmusa_alpine: {
      kurtun_torul_lower_harsit: 0.42,
      gumushane_harsit_orchard_valley: 0.40,
      kelkit_siran_kose_dry_plateau: 0.32,
      zigana_soganli_abdalmusa_alpine: 1.0
    }
  },
  stationOverrides: {
    "17088": {
      stationId: 17088,
      nameTr: "Gümüşhane Merkez WMO (Harşit Vadisi 1.216m)",
      lat: 40.4598,
      lon: 39.4653,
      demElevationM: 1216,
      subBasinId: "gumushane_harsit_orchard_valley",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "basin_floor"
    },
    "18226": {
      stationId: 18226,
      nameTr: "Kürtün Alt Harşit",
      lat: 40.6825,
      lon: 39.1456,
      demElevationM: 739,
      subBasinId: "kurtun_torul_lower_harsit",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18227": {
      stationId: 18227,
      nameTr: "Torul",
      lat: 40.5686,
      lon: 39.2989,
      demElevationM: 1009,
      subBasinId: "kurtun_torul_lower_harsit",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.50,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18228": {
      stationId: 18228,
      nameTr: "Kelkit Kuru Yüksek Ova",
      lat: 40.1506,
      lon: 39.4361,
      demElevationM: 1474,
      subBasinId: "kelkit_siran_kose_dry_plateau",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18564": {
      stationId: 18564,
      nameTr: "Köse Yüksek Çanak",
      lat: 40.2217,
      lon: 39.6578,
      demElevationM: 1635,
      subBasinId: "kelkit_siran_kose_dry_plateau",
      urbanFraction: 0.20,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18565": {
      stationId: 18565,
      nameTr: "Şiran",
      lat: 40.1856,
      lon: 39.1289,
      demElevationM: 1464,
      subBasinId: "kelkit_siran_kose_dry_plateau",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17696": {
      stationId: 17696,
      nameTr: "Zigana Kayak Merkezi (2.044–2.050m)",
      lat: 40.6413,
      lon: 39.4037,
      demElevationM: 2044,
      subBasinId: "zigana_soganli_abdalmusa_alpine",
      urbanFraction: 0.01,
      coldPoolSusceptibility: 0.16,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18920": {
      stationId: 18920,
      nameTr: "Süleymaniye Kayak Merkezi (2.227m)",
      lat: 40.4273,
      lon: 39.4406,
      demElevationM: 2227,
      subBasinId: "zigana_soganli_abdalmusa_alpine",
      urbanFraction: 0.01,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [
      HYPSO_TR_29.bands[0].elevationM,
      HYPSO_TR_29.bands[1].elevationM,
      HYPSO_TR_29.bands[2].elevationM,
      HYPSO_TR_29.bands[3].elevationM
    ],
    maxPhysicalPeakM: HYPSO_TR_29.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_29.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "zigana_soganli_north_rain_shadow_wall",
      labelTr: "Zigana (2.032m) & Soğanlı Dağları Kuzey Bariyeri — Harşit ve Kelkit Yağış Gölgesi",
      effectiveBarrierHeightM: 2550,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "gumushane_harsit_orchard_valley",
        "kelkit_siran_kose_dry_plateau",
        "kurtun_torul_lower_harsit"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 325, toDeg: 35 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.76,
        sourcePlateauElevationM: 1850,
        maxTargetElevationM: 1320,
        maxWarmingCapC: 4.4,
        subCloudVirgaFactor: 0.52,
        wetCutoffMmHr: 0.4
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 175, toDeg: 245 },
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 0.06,
        maxPrecipMultiplierCap: 1.24
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 315, toDeg: 40 },
        precipAttenuationFactor: 0.44
      }
    },
    {
      id: "zigana_ski_crest_snow_convergence",
      labelTr: "Zigana Kayak (2.050m) – Abdal Musa (3.331m) Sırt Üstü Kar Yakınsaması",
      effectiveBarrierHeightM: 2850,
      crestPressureHpa: 700,
      applicableSubBasins: ["zigana_soganli_abdalmusa_alpine"],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 160, toDeg: 220 },
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
        windFromSectorDeg: { fromDeg: 315, toDeg: 40 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 0.12,
        maxPrecipMultiplierCap: 1.50
      }
    }
  ],
  venturiCorridors: [
    {
      id: "zigana_torul_pass_jet",
      labelTr: "Zigana Geçidi (2.032m) – Torul Kuzey-Güney Boğaz Akışı",
      centerCoord: { lat: 40.615, lon: 39.365 },
      influenceRadiusKm: 16,
      channelAxisFromDeg: 175,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.32,
      gustMultiplier: 1.46,
      suppressesNocturnalInversion: true
    },
    {
      id: "harsit_gorge_drainage_flow",
      labelTr: "Harşit Derin Vadi Oluk Akışı (Gümüşhane – Torul – Kürtün)",
      centerCoord: { lat: 40.54, lon: 39.34 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 125,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.22,
      gustMultiplier: 1.32,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1216,
    coldPoolMaxDepthM: 360,
    topographicEnclosureIndex: 0.82,
    deltaPressureTopHpa: 36,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 5.8
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.30
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.34,
    invertedVDryMicroburstSusceptibility: 0.54,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "target_gumushane_harsit_center",
      labelTr: "Gümüşhane Merkez (Harşit Vadisi 1.216m WMO 17088)",
      lat: 40.4598,
      lon: 39.4653,
      elevationM: 1216,
      role: "target"
    },
    {
      key: "orographic_zigana_ski_crest",
      labelTr: "Zigana Kayak Merkezi / Geçit Sırtı (2.050m)",
      lat: 40.6413,
      lon: 39.4037,
      elevationM: 2050,
      role: "orographic_wall"
    },
    {
      key: "orographic_abdal_musa_west",
      labelTr: "Abdal Musa / Giresun Dağları Sırtı (2.650m+)",
      lat: 40.555,
      lon: 39.045,
      elevationM: 2650,
      role: "orographic_wall"
    },
    {
      key: "orographic_suleymaniye_summit",
      labelTr: "Süleymaniye Kayak Sırtı (2.227m)",
      lat: 40.4273,
      lon: 39.4406,
      elevationM: 2227,
      role: "orographic_wall"
    },
    {
      key: "corridor_kurtun_lower_harsit",
      labelTr: "Kürtün Alt Harşit Vadisi (739m)",
      lat: 40.6825,
      lon: 39.1456,
      elevationM: 739,
      role: "corridor"
    },
    {
      key: "corridor_torul_gate",
      labelTr: "Torul Vadi Kavşağı (1.009m)",
      lat: 40.5686,
      lon: 39.2989,
      elevationM: 1009,
      role: "corridor"
    },
    {
      key: "foehn_kostan_pass",
      labelTr: "Kostan Geçidi (1.850m)",
      lat: 40.355,
      lon: 39.525,
      elevationM: 1850,
      role: "foehn_windward"
    },
    {
      key: "lee_kelkit_dry_plain",
      labelTr: "Kelkit Yüksek Kuru Ova (1.483m)",
      lat: 40.1506,
      lon: 39.4361,
      elevationM: 1483,
      role: "lee_shadow"
    },
    {
      key: "lee_kose_steppe_basin",
      labelTr: "Köse Yüksek Karasal Çanak (1.635m)",
      lat: 40.2217,
      lon: 39.6578,
      elevationM: 1635,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -32.0,
    maxPlausibleTempC: 40.5,
    minPlausibleMslpHpa: 982,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 7.5
  }
};

export const PROVINCE_SPEC_TR_29: ProvinceSpec = Object.freeze(RAW_PROVINCE_SPEC_TR_29);

/**
 * Kuzeyli Karadeniz sisteminde (`345°`) Zigana Kayak Merkezi (`2.050m`) yoğun kar alırken,
 * güney gölgedeki Harşit Vadisi (`1.216m` Gümüşhane Merkez) ve Kelkit kuru ovasındaki (`1.483m`)
 * yağış zayıflamasını ve sıcaklık farkını `PROVINCE_SPEC_TR_29` üzerinden hesaplar.
 */
export function evaluateGumushaneZiganaShadowTransect(params: {
  upstreamPrecipMmHr: number;
  temp850C: number;
  windFromDirDeg: number;
  windSpeedMs: number;
}): {
  ziganaSki2050mPrecipMmHr: number;
  ziganaSki2050mTempC: number;
  harsitValley1216mPrecipMmHr: number;
  harsitValley1216mTempC: number;
  kelkitPlain1483mPrecipMmHr: number;
  ziganaSnowPhase: boolean;
} {
  const leeBarrier = PROVINCE_SPEC_TR_29.directionalBarriers[0];
  const crestBarrier = PROVINCE_SPEC_TR_29.directionalBarriers[1];
  const d = ((params.windFromDirDeg % 360) + 360) % 360;
  const isNortherly = d >= 315 || d <= 40;

  const ziganaMult =
    isNortherly && params.windSpeedMs >= crestBarrier.upslopeSpec.minOnshoreOrUpslopeSpeedMs
      ? crestBarrier.upslopeSpec.maxPrecipMultiplierCap
      : 1.0;

  const shadowFactor =
    isNortherly && leeBarrier.rainShadowSpec
      ? leeBarrier.rainShadowSpec.precipAttenuationFactor
      : 1.0;

  const ziganaSki2050mTempC = params.temp850C - ((2050 - 1500) / 1000) * 5.8;
  const downslopeWarmC =
    isNortherly && params.windSpeedMs >= leeBarrier.foehnSpec.minCrossCrestSpeedMs
      ? 1.8
      : 0;
  const harsitValley1216mTempC =
    params.temp850C + ((1500 - 1216) / 1000) * 6.5 + downslopeWarmC;

  return {
    ziganaSki2050mPrecipMmHr: params.upstreamPrecipMmHr * ziganaMult,
    ziganaSki2050mTempC,
    harsitValley1216mPrecipMmHr: params.upstreamPrecipMmHr * shadowFactor,
    harsitValley1216mTempC,
    kelkitPlain1483mPrecipMmHr: params.upstreamPrecipMmHr * (shadowFactor * 0.85),
    ziganaSnowPhase: ziganaSki2050mTempC <= 0.8 && params.upstreamPrecipMmHr > 0
  };
}

export default PROVINCE_SPEC_TR_29;
