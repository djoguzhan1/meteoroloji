import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

export const TR_07_BESPOKE_PRECIP_AND_FOEHN_LIMITS = Object.freeze({
  upslopePrecipMultiplier: 1.62,
  maxHourlyPrecipMm: 140,
  maxFoehnWarmingC: 4.5,
  northerlyFoehnRhBandPct: Object.freeze([15, 25] as const),
  alpineWetSnowBandM: Object.freeze([1850, 2500] as const),
  elmaliKorkuteliBasinBandM: Object.freeze([1020, 1150] as const),
  allowedMetarIcaos: Object.freeze(["LTAI", "LTFG"] as const),
  forbiddenForeignIcaos: Object.freeze(["LGKJ", "LGRP"] as const)
});

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

export function isWindInCircularSector(
  windFromDeg: number,
  sector: { fromDeg: number; toDeg: number }
): boolean {
  const d = ((windFromDeg % 360) + 360) % 360;
  const from = ((sector.fromDeg % 360) + 360) % 360;
  const to = ((sector.toDeg % 360) + 360) % 360;
  return from <= to ? d >= from && d <= to : d >= from || d <= to;
}

const specTr07: ProvinceSpec = {
  provinceCode: "TR-07",
  plateCode: 7,
  slug: "antalya",
  nameTr: "Antalya",
  region: "MEDITERRANEAN",
  climateRegion: "AKDENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "MEDITERRANEAN_COASTAL_OROG",
  icaoWhitelist: ["LTAI", "LTFG"],
  domainBounds: {
    minLat: 36.1007,
    maxLat: 37.426,
    minLon: 29.262,
    maxLon: 32.6235
  },
  primaryCenter: {
    mgmMerkezId: 90701,
    mgmIstNo: 17302,
    mgmSaatlikIstNo: 17302,
    mgmGunlukIstNo: 90701,
    wmoId: "17300",
    lat: 36.8851,
    lon: 30.6828,
    demVerifiedElevationM: 47,
    subBasinId: "antalya_gulf_travertine",
    urbanFraction: 0.84,
    monthlyTmaxNormalsC: TR81_CLIMATOLOGY_1991_2020["TR-07"].tmaxC,
    monthlyTminNormalsC: TR81_CLIMATOLOGY_1991_2020["TR-07"].tminC
  },
  curatedSubLocations: [
    {
      id: "tr-07-konyaalti",
      name: "Konyaaltı Sahil",
      role: "coast",
      lat: 36.84,
      lon: 30.61,
      elevationM: 4
    },
    {
      id: "tr-07-kemer",
      name: "Kemer Kıyı",
      role: "coast",
      lat: 36.5942,
      lon: 30.5672,
      elevationM: 6
    },
    {
      id: "tr-07-alanya",
      name: "Alanya Kıyı",
      role: "coast",
      lat: 36.5507,
      lon: 31.9803,
      elevationM: 6
    },
    {
      id: "tr-07-kas",
      name: "Kaş (Teke Kıyısı)",
      role: "coast",
      lat: 36.2002,
      lon: 29.6502,
      elevationM: 153
    },
    {
      id: "tr-07-muratpasa",
      name: "Antalya Merkez (Falez Platosu)",
      role: "plain",
      lat: 36.8851,
      lon: 30.6828,
      elevationM: 47
    },
    {
      id: "tr-07-dosemealti",
      name: "Döşemealtı Üst Teras",
      role: "foothill",
      lat: 36.9501,
      lon: 30.6025,
      elevationM: 266
    },
    {
      id: "tr-07-korkuteli",
      name: "Korkuteli Yayla Çanağı",
      role: "foothill",
      lat: 37.0565,
      lon: 30.191,
      elevationM: 1017
    },
    {
      id: "tr-07-elmali",
      name: "Elmalı Karasal Çanağı",
      role: "foothill",
      lat: 36.7372,
      lon: 29.9121,
      elevationM: 1095
    },
    {
      id: "tr-07-akseki",
      name: "Akseki (Geyik Dağları Yamaç)",
      role: "foothill",
      lat: 37.0468,
      lon: 31.7971,
      elevationM: 1063
    },
    {
      id: "tr-07-saklikent-zirve",
      name: "Saklıkent Kayak Merkezi (Bakırlıtepe)",
      role: "summit",
      lat: 36.8405,
      lon: 30.3315,
      elevationM: 1920
    },
    {
      id: "tr-07-tahtali-zirve",
      name: "Tahtalı Dağı Zirve (Olympos)",
      role: "summit",
      lat: 36.5378,
      lon: 30.4422,
      elevationM: 2365
    }
  ],
  subBasins: [
    {
      id: "antalya_gulf_travertine",
      labelTr: "Antalya Körfezi & Traverten Falez Platosu (Kemer–Konyaaltı–Muratpaşa–Serik)",
      polygonOrBbox: {
        minLat: 36.48,
        maxLat: 37.06,
        minLon: 30.48,
        maxLon: 31.26
      },
      elevationRangeM: [0, 380],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.72
    },
    {
      id: "pamphylia_alanya_coast",
      labelTr: "Doğu Pamfilya & Alanya–Gazipaşa Subtropikal Kıyı Şeridi",
      polygonOrBbox: {
        minLat: 36.12,
        maxLat: 36.9,
        minLon: 31.26,
        maxLon: 32.62
      },
      elevationRangeM: [0, 420],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.48
    },
    {
      id: "lycian_west_coast",
      labelTr: "Likya Batı Kıyısı & Teke Yamaçları (Kumluca–Finike–Demre–Kaş)",
      polygonOrBbox: {
        minLat: 36.1,
        maxLat: 36.52,
        minLon: 29.26,
        maxLon: 30.48
      },
      elevationRangeM: [0, 520],
      defaultZone: "peninsula_exposed",
      defaultUrbanFraction: 0.34
    },
    {
      id: "beydaglari_geyik_windward",
      labelTr: "Beydağları & Geyik Dağları Güney Rüzgarüstü Duvarı (İbradı–Akseki–Gündoğmuş)",
      polygonOrBbox: {
        minLat: 36.68,
        maxLat: 37.34,
        minLon: 30.35,
        maxLon: 32.28
      },
      elevationRangeM: [420, 1800],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.12
    },
    {
      id: "elmali_korkuteli_basin",
      labelTr: "Elmalı – Korkuteli Toros Ardı Karasal Yayla Çanağı (1020–1150m)",
      polygonOrBbox: {
        minLat: 36.56,
        maxLat: 37.38,
        minLon: 29.55,
        maxLon: 30.36
      },
      elevationRangeM: [960, 1550],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.18
    },
    {
      id: "taurus_alpine_crest",
      labelTr: "Kızlarsevrisi (3070m) – Saklıkent – Tahtalı – Geyik (2877m) Zirve Kuşağı",
      polygonOrBbox: {
        minLat: 36.45,
        maxLat: 37.42,
        minLon: 29.8,
        maxLon: 32.35
      },
      elevationRangeM: [1800, 3070],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.02
    }
  ],
  barrierCouplingMatrix: {
    antalya_gulf_travertine: {
      antalya_gulf_travertine: 1.0,
      pamphylia_alanya_coast: 0.84,
      lycian_west_coast: 0.76,
      beydaglari_geyik_windward: 0.42,
      elmali_korkuteli_basin: 0.1,
      taurus_alpine_crest: 0.14
    },
    pamphylia_alanya_coast: {
      antalya_gulf_travertine: 0.84,
      pamphylia_alanya_coast: 1.0,
      lycian_west_coast: 0.68,
      beydaglari_geyik_windward: 0.44,
      elmali_korkuteli_basin: 0.08,
      taurus_alpine_crest: 0.14
    },
    lycian_west_coast: {
      antalya_gulf_travertine: 0.76,
      pamphylia_alanya_coast: 0.68,
      lycian_west_coast: 1.0,
      beydaglari_geyik_windward: 0.36,
      elmali_korkuteli_basin: 0.12,
      taurus_alpine_crest: 0.16
    },
    beydaglari_geyik_windward: {
      antalya_gulf_travertine: 0.42,
      pamphylia_alanya_coast: 0.44,
      lycian_west_coast: 0.36,
      beydaglari_geyik_windward: 1.0,
      elmali_korkuteli_basin: 0.24,
      taurus_alpine_crest: 0.56
    },
    elmali_korkuteli_basin: {
      antalya_gulf_travertine: 0.1,
      pamphylia_alanya_coast: 0.08,
      lycian_west_coast: 0.12,
      beydaglari_geyik_windward: 0.24,
      elmali_korkuteli_basin: 1.0,
      taurus_alpine_crest: 0.34
    },
    taurus_alpine_crest: {
      antalya_gulf_travertine: 0.14,
      pamphylia_alanya_coast: 0.14,
      lycian_west_coast: 0.16,
      beydaglari_geyik_windward: 0.56,
      elmali_korkuteli_basin: 0.34,
      taurus_alpine_crest: 1.0
    }
  },
  stationOverrides: {
    "17300": {
      stationId: 17300,
      nameTr: "Antalya Havalimanı (WMO 17300)",
      lat: 36.9063,
      lon: 30.799,
      demElevationM: 54,
      subBasinId: "antalya_gulf_travertine",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "coastal_or_gap"
    },
    "17302": {
      stationId: 17302,
      nameTr: "Antalya Bölge / Muratpaşa",
      lat: 36.8851,
      lon: 30.6828,
      demElevationM: 47,
      subBasinId: "antalya_gulf_travertine",
      urbanFraction: 0.86,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "basin_floor"
    },
    "17304": {
      stationId: 17304,
      nameTr: "Konyaaltı Sahil",
      lat: 36.84,
      lon: 30.61,
      demElevationM: 4,
      subBasinId: "antalya_gulf_travertine",
      urbanFraction: 0.74,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "coastal_or_gap"
    },
    "17310": {
      stationId: 17310,
      nameTr: "Alanya",
      lat: 36.5507,
      lon: 31.9803,
      demElevationM: 7,
      subBasinId: "pamphylia_alanya_coast",
      urbanFraction: 0.68,
      coldPoolSusceptibility: 0.06,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17375": {
      stationId: 17375,
      nameTr: "Finike",
      lat: 36.3024,
      lon: 30.1458,
      demElevationM: 3,
      subBasinId: "lycian_west_coast",
      urbanFraction: 0.45,
      coldPoolSusceptibility: 0.1,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17380": {
      stationId: 17380,
      nameTr: "Kaş",
      lat: 36.2002,
      lon: 29.6502,
      demElevationM: 166,
      subBasinId: "lycian_west_coast",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17926": {
      stationId: 17926,
      nameTr: "Korkuteli",
      lat: 37.0565,
      lon: 30.191,
      demElevationM: 1017,
      subBasinId: "elmali_korkuteli_basin",
      urbanFraction: 0.25,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17952": {
      stationId: 17952,
      nameTr: "Elmalı",
      lat: 36.7372,
      lon: 29.9121,
      demElevationM: 1095,
      subBasinId: "elmali_korkuteli_basin",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18047": {
      stationId: 18047,
      nameTr: "Akseki",
      lat: 37.0468,
      lon: 31.7971,
      demElevationM: 1063,
      subBasinId: "beydaglari_geyik_windward",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.42,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17927": {
      stationId: 17927,
      nameTr: "İbradı",
      lat: 37.0968,
      lon: 31.5952,
      demElevationM: 1036,
      subBasinId: "beydaglari_geyik_windward",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.4,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18840": {
      stationId: 18840,
      nameTr: "Saklıkent Kayak Merkezi (Bakırlıtepe)",
      lat: 36.8405,
      lon: 30.3315,
      demElevationM: 1920,
      subBasinId: "taurus_alpine_crest",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [10, 45, 950, 2050],
    maxPhysicalPeakM: 3070,
    snowElevationBands: TR81_HYPSOMETRIC_PROFILES["TR-07"].bands
  },
  waterBodies: [
    {
      id: "mediterranean_antalya_gulf",
      labelTr: "Batı Akdeniz (Antalya Körfezi)",
      kind: "open_sea",
      mgmMarineStationIds: [17393, 17473, 17474, 17475, 17476, 17477],
      sampleCoord: { lat: 36.72, lon: 30.72 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -2.0,
      monthlyWaterTempNormalsC: [
        19.8, 19.2, 19.0, 19.9, 22.4, 25.8,
        28.4, 29.0, 27.8, 25.2, 22.5, 20.6
      ],
      subBasinInfluenceWeights: {
        antalya_gulf_travertine: 0.96,
        pamphylia_alanya_coast: 0.95,
        lycian_west_coast: 0.92,
        beydaglari_geyik_windward: 0.56,
        taurus_alpine_crest: 0.25,
        elmali_korkuteli_basin: 0.04
      },
      onshoreWindSectorDeg: { fromDeg: 150, toDeg: 230 },
      effectiveFetchKm: 420,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 13.0,
      dekHeavyDeltaTC: 16.5,
      seaBreezeSpec: {
        activeMonths: [4, 10],
        sectorDeg: { fromDeg: 165, toDeg: 225 },
        maxInlandPenetrationKm: 28,
        maxCoolingAmplitudeC: 3.4
      }
    }
  ],
  directionalBarriers: [
    {
      id: "beydaglari_geyik_amphitheater",
      labelTr: "Beydağları (3070m Kızlarsevrisi) & Geyik Dağları (2877m) Amfiteatr Duvarı",
      effectiveBarrierHeightM: 2550,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "antalya_gulf_travertine",
        "pamphylia_alanya_coast",
        "lycian_west_coast",
        "beydaglari_geyik_windward",
        "taurus_alpine_crest"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 330, toDeg: 40 },
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.85,
        sourcePlateauElevationM: 1050,
        maxTargetElevationM: 400,
        maxWarmingCapC: 4.5,
        subCloudVirgaFactor: 0.32,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 150, toDeg: 230 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 0.28,
        maxPrecipMultiplierCap: 1.62
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 330, toDeg: 40 },
        precipAttenuationFactor: 0.52
      }
    },
    {
      id: "beydaglari_lee_elmali_korkuteli",
      labelTr: "Beydağları Ardı Elmalı–Korkuteli Karasal Gölge Eşiği",
      effectiveBarrierHeightM: 2450,
      crestPressureHpa: 750,
      applicableSubBasins: ["elmali_korkuteli_basin"],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 150, toDeg: 220 },
        minCrossCrestSpeedMs: 9.0,
        minFroudeNumber: 0.95,
        sourcePlateauElevationM: 0,
        maxTargetElevationM: 1200,
        maxWarmingCapC: 2.0,
        subCloudVirgaFactor: 0.55,
        wetCutoffMmHr: 0.2
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 320, toDeg: 30 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 0.0,
        maxPrecipMultiplierCap: 1.24
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 150, toDeg: 225 },
        precipAttenuationFactor: 0.64
      }
    }
  ],
  venturiCorridors: [
    {
      id: "cubuk_bogazi_poyraz_chute",
      labelTr: "Çubuk Boğazı – Döşemealtı Kuzey Fön Oluğu",
      centerCoord: { lat: 37.12, lon: 30.56 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 355,
      bidirectional: false,
      sectorHalfWidthDeg: 35,
      speedMultiplier: 1.32,
      gustMultiplier: 1.44,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1020,
    coldPoolMaxDepthM: 280,
    topographicEnclosureIndex: 0.78,
    deltaPressureTopHpa: 35,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 3.8
    },
    persistentStratusLock: {
      enabled: false,
      daytimeSolarDampingFactor: 0.15
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.62,
    invertedVDryMicroburstSusceptibility: 0.35,
    coastalWaterspoutSusceptibility: 0.92
  },
  stencil9Points: [
    {
      key: "TARGET",
      labelTr: "Antalya Merkez (Falez Platosu)",
      lat: 36.8851,
      lon: 30.6828,
      elevationM: 47,
      role: "target"
    },
    {
      key: "GULF_SOUTH",
      labelTr: "Antalya Körfezi Açık Deniz Yakınsaması",
      lat: 36.58,
      lon: 30.76,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "KEMER_MARINE_SW",
      labelTr: "Kemer – Likya Güneybatı Deniz Girişi",
      lat: 36.42,
      lon: 30.58,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "TAHTALI_WALL",
      labelTr: "Tahtalı Dağı (Olympos) Güney Duvarı",
      lat: 36.5378,
      lon: 30.4422,
      elevationM: 2365,
      role: "orographic_wall"
    },
    {
      key: "SAKLIKENT_CREST",
      labelTr: "Saklıkent / Bakırlıtepe Batı Duvarı",
      lat: 36.8405,
      lon: 30.3315,
      elevationM: 1920,
      role: "orographic_wall"
    },
    {
      key: "AKSEKI_GEYIK_WALL",
      labelTr: "Akseki – Geyik Dağları Doğu Amfiteatrı",
      lat: 37.0468,
      lon: 31.7971,
      elevationM: 1063,
      role: "orographic_wall"
    },
    {
      key: "KORKUTELI_PLATEAU",
      labelTr: "Korkuteli – Kuzey Fön Kaynak Platosu",
      lat: 37.0565,
      lon: 30.191,
      elevationM: 1017,
      role: "foehn_windward"
    },
    {
      key: "CUBUK_PASS",
      labelTr: "Çubuk Boğazı – Döşemealtı Koridoru",
      lat: 37.08,
      lon: 30.58,
      elevationM: 620,
      role: "corridor"
    },
    {
      key: "ELMALI_BASIN",
      labelTr: "Elmalı Karasal Çanağı (Beydağları Ardı)",
      lat: 36.7372,
      lon: 29.9121,
      elevationM: 1095,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -22,
    maxPlausibleTempC: 48,
    minPlausibleMslpHpa: 982,
    maxPlausibleMslpHpa: 1040,
    kalmanTempBiasCapC: 5.0
  }
};

export const PROVINCE_SPEC_TR_07: ProvinceSpec = Object.freeze(specTr07);

export interface Tr07AntalyaColumnInput {
  subBasinId?: string;
  targetElevationM: number;
  windFromDirDeg: number;
  windSpeed850Ms: number;
  froudeNumber?: number;
  rawPrecipMmHr: number;
  baseTemp2mC: number;
  baseRh2mPct: number;
  temp850C: number;
  month: number;
  clearCalmNight?: boolean;
  snowDepthCm?: number;
}

export interface Tr07AntalyaColumnResult {
  regime:
    | "SOUTHERLY_OROG_CONVECTIVE_DELUGE"
    | "NORTHERLY_POYRAZ_DRY_FOEHN"
    | "ELMALI_CONTINENTAL_BASIN"
    | "MEDITERRANEAN_STANDARD";
  precipMultiplier: number;
  adjustedPrecipMmHr: number;
  foehnWarmingC: number;
  adjustedTemp2mC: number;
  adjustedRh2mPct: number;
  activeMountainWetSnow1850To2500m: boolean;
  estimatedAlpineSnowSlr: number | null;
}

/**
 * Evaluates Antalya (`TR-07`) bespoke amphitheater barrier physics:
 *  - Southerly (`150°–230°`) Kıble/Lodos inflow -> Antalya Gulf convergence + Beydağları/Geyik
 *    vertical wall produces extreme convective rainfall (`upslopePrecipMultiplier` up to `1.62`,
 *    `maxHourlyPrecipMm: 140` — opposite of Bursa's southerly Lodos virga drying!) while
 *    simultaneously depositing heavy wet mountain snow across `1850–2500m` (`Saklıkent`/`Tahtalı`).
 *  - Northerly (`330°–40°`) Poyraz/Yıldız cross-Taurus flow -> adiabatic compression from the
 *    `1050m` Pisidia/Korkuteli plateau down to the coast produces up to `+4.5°C` dry foehn warming
 *    and collapses coastal relative humidity into the `15%–25%` corridor.
 *  - Elmalı/Korkuteli (`1020–1150m`) remains decoupled behind Beydağları as a continental cold-pool basin.
 */
export function evaluateTr07AntalyaColumnPhysics(
  input: Tr07AntalyaColumnInput
): Tr07AntalyaColumnResult {
  const subBasinId = input.subBasinId ?? PROVINCE_SPEC_TR_07.primaryCenter.subBasinId;
  const monthIdx = clamp(Math.round(input.month) - 1, 0, 11);
  const sstC = PROVINCE_SPEC_TR_07.waterBodies[0].monthlyWaterTempNormalsC[monthIdx];

  if (subBasinId === "elmali_korkuteli_basin") {
    const leeBarrier = PROVINCE_SPEC_TR_07.directionalBarriers[1];
    const inSouthLee =
      leeBarrier.rainShadowSpec !== undefined &&
      isWindInCircularSector(
        input.windFromDirDeg,
        leeBarrier.rainShadowSpec.shadowedWindFromSectorDeg
      );
    const inNorthUpslope =
      leeBarrier.upslopeSpec.enabled &&
      isWindInCircularSector(
        input.windFromDirDeg,
        leeBarrier.upslopeSpec.windFromSectorDeg
      ) &&
      input.windSpeed850Ms >= leeBarrier.upslopeSpec.minOnshoreOrUpslopeSpeedMs;

    const precipMult = inSouthLee
      ? leeBarrier.rainShadowSpec!.precipAttenuationFactor
      : inNorthUpslope
        ? leeBarrier.upslopeSpec.maxPrecipMultiplierCap
        : 1.0;

    let radiativeCoolingC = 0;
    if (input.clearCalmNight && input.windSpeed850Ms <= 4.5) {
      radiativeCoolingC = 2.6 * PROVINCE_SPEC_TR_07.inversionAndWedgeSpec.topographicEnclosureIndex;
      if (
        (input.snowDepthCm ?? 0) >=
        PROVINCE_SPEC_TR_07.inversionAndWedgeSpec.snowAlbedoFeedback.snowDepthTriggerCm
      ) {
        radiativeCoolingC +=
          PROVINCE_SPEC_TR_07.inversionAndWedgeSpec.snowAlbedoFeedback.maxExtraRadiativeCoolingC;
      }
    }

    return {
      regime: "ELMALI_CONTINENTAL_BASIN",
      precipMultiplier: Number(precipMult.toFixed(3)),
      adjustedPrecipMmHr: Number(
        clamp(input.rawPrecipMmHr * precipMult, 0, TR_07_BESPOKE_PRECIP_AND_FOEHN_LIMITS.maxHourlyPrecipMm).toFixed(2)
      ),
      foehnWarmingC: 0,
      adjustedTemp2mC: Number((input.baseTemp2mC - radiativeCoolingC).toFixed(2)),
      adjustedRh2mPct: Number(clamp(input.baseRh2mPct, 20, 100).toFixed(1)),
      activeMountainWetSnow1850To2500m: false,
      estimatedAlpineSnowSlr: null
    };
  }

  const amphitheater = PROVINCE_SPEC_TR_07.directionalBarriers[0];
  const isSoutherlyOnshore =
    amphitheater.upslopeSpec.enabled &&
    isWindInCircularSector(
      input.windFromDirDeg,
      amphitheater.upslopeSpec.windFromSectorDeg
    ) &&
    input.windSpeed850Ms >= amphitheater.upslopeSpec.minOnshoreOrUpslopeSpeedMs;

  if (isSoutherlyOnshore) {
    const speedRamp = clamp(
      (input.windSpeed850Ms - amphitheater.upslopeSpec.minOnshoreOrUpslopeSpeedMs) / 11.5,
      0.25,
      1.0
    );
    const marineDeltaT = Math.max(0, sstC - input.temp850C);
    const convectiveMarineFactor = clamp(marineDeltaT / 15.0, 0.35, 1.0);
    const rawBoost =
      1.0 +
      amphitheater.upslopeSpec.coastalFrictionalConvergenceBoost * speedRamp +
      0.34 * speedRamp * convectiveMarineFactor;
    const precipMultiplier = clamp(
      rawBoost,
      1.0,
      amphitheater.upslopeSpec.maxPrecipMultiplierCap
    );
    const adjustedPrecipMmHr = clamp(
      input.rawPrecipMmHr * precipMultiplier,
      0,
      TR_07_BESPOKE_PRECIP_AND_FOEHN_LIMITS.maxHourlyPrecipMm
    );

    // Evaluate simultaneous 1850–2500m (Saklıkent 1920m / Tahtalı 2365m) wet mountain snow:
    // Moist-adiabatic lapse ~5.6 °C/km above 850 hPa (~1500 m)
    const tempAt2100mC = input.temp850C - ((2100 - 1500) / 1000) * 5.6;
    const activeMountainWetSnow1850To2500m =
      adjustedPrecipMmHr >= 1.0 && tempAt2100mC <= 1.6;
    const estimatedAlpineSnowSlr = activeMountainWetSnow1850To2500m
      ? Number(clamp(7.5 + Math.max(0, -tempAt2100mC) * 0.85, 6.5, 11.5).toFixed(2))
      : null;

    return {
      regime: "SOUTHERLY_OROG_CONVECTIVE_DELUGE",
      precipMultiplier: Number(precipMultiplier.toFixed(3)),
      adjustedPrecipMmHr: Number(adjustedPrecipMmHr.toFixed(2)),
      foehnWarmingC: 0,
      adjustedTemp2mC: Number(input.baseTemp2mC.toFixed(2)),
      adjustedRh2mPct: Number(clamp(Math.max(input.baseRh2mPct, 78), 55, 100).toFixed(1)),
      activeMountainWetSnow1850To2500m,
      estimatedAlpineSnowSlr
    };
  }

  const froude = input.froudeNumber ?? 1.15;
  const isNortherlyFoehn =
    amphitheater.foehnSpec.enabled &&
    isWindInCircularSector(
      input.windFromDirDeg,
      amphitheater.foehnSpec.windFromSectorDeg
    ) &&
    input.windSpeed850Ms >= amphitheater.foehnSpec.minCrossCrestSpeedMs &&
    froude >= amphitheater.foehnSpec.minFroudeNumber &&
    input.targetElevationM <= amphitheater.foehnSpec.maxTargetElevationM;

  if (isNortherlyFoehn) {
    const descentFrac = clamp(
      (amphitheater.foehnSpec.sourcePlateauElevationM - input.targetElevationM) /
        amphitheater.foehnSpec.sourcePlateauElevationM,
      0,
      1
    );
    const windStrength = clamp(
      (input.windSpeed850Ms - amphitheater.foehnSpec.minCrossCrestSpeedMs) / 9.5,
      0.45,
      1.0
    );
    const foehnWarmingC = clamp(
      amphitheater.foehnSpec.maxWarmingCapC * descentFrac * windStrength,
      0,
      amphitheater.foehnSpec.maxWarmingCapC
    );
    const shadowFactor = amphitheater.rainShadowSpec?.precipAttenuationFactor ?? 0.52;
    const virgaAdjusted =
      input.rawPrecipMmHr * shadowFactor * (1 - amphitheater.foehnSpec.subCloudVirgaFactor);
    const adjustedPrecipMmHr =
      virgaAdjusted <= amphitheater.foehnSpec.wetCutoffMmHr ? 0 : virgaAdjusted;

    // Katabatic descent from 1050m continental plateau collapses coastal RH into 15%–25%
    const collapsedRh = clamp(
      25 - windStrength * 8.5 + (1 - descentFrac) * 4.0,
      TR_07_BESPOKE_PRECIP_AND_FOEHN_LIMITS.northerlyFoehnRhBandPct[0],
      TR_07_BESPOKE_PRECIP_AND_FOEHN_LIMITS.northerlyFoehnRhBandPct[1]
    );

    return {
      regime: "NORTHERLY_POYRAZ_DRY_FOEHN",
      precipMultiplier: Number((shadowFactor * (1 - amphitheater.foehnSpec.subCloudVirgaFactor)).toFixed(3)),
      adjustedPrecipMmHr: Number(adjustedPrecipMmHr.toFixed(2)),
      foehnWarmingC: Number(foehnWarmingC.toFixed(2)),
      adjustedTemp2mC: Number((input.baseTemp2mC + foehnWarmingC).toFixed(2)),
      adjustedRh2mPct: Number(collapsedRh.toFixed(1)),
      activeMountainWetSnow1850To2500m: false,
      estimatedAlpineSnowSlr: null
    };
  }

  return {
    regime: "MEDITERRANEAN_STANDARD",
    precipMultiplier: 1.0,
    adjustedPrecipMmHr: Number(
      clamp(input.rawPrecipMmHr, 0, TR_07_BESPOKE_PRECIP_AND_FOEHN_LIMITS.maxHourlyPrecipMm).toFixed(2)
    ),
    foehnWarmingC: 0,
    adjustedTemp2mC: Number(input.baseTemp2mC.toFixed(2)),
    adjustedRh2mPct: Number(clamp(input.baseRh2mPct, 15, 100).toFixed(1)),
    activeMountainWetSnow1850To2500m: false,
    estimatedAlpineSnowSlr: null
  };
}

export default PROVINCE_SPEC_TR_07;
