import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

export const TR_70_BESPOKE_LIMITS = Object.freeze({
  rainShadowMultiplier: 0.58,
  kalmanTempBiasCapC: 6.5,
  centerElevationM: 1033,
  sertavulYellibelCrestM: 1910,
  calibrationStrategy: "TIER_B_DONOR_ALARO" as const,
  donorProvinces: Object.freeze(["TR-42", "TR-51", "TR-06"] as const),
  alaroBlendWeight0To36h: 0.34,
  allowedMetarIcaos: Object.freeze([] as const)
});

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function isWindInSector(
  windFromDeg: number,
  sector: { fromDeg: number; toDeg: number }
): boolean {
  const d = ((windFromDeg % 360) + 360) % 360;
  const from = ((sector.fromDeg % 360) + 360) % 360;
  const to = ((sector.toDeg % 360) + 360) % 360;
  return from <= to ? d >= from && d <= to : d >= from || d <= to;
}

function angularDiffDeg(a: number, b: number): number {
  return Math.abs((((a - b) % 360) + 540) % 360 - 180);
}

const specTr70: ProvinceSpec = {
  provinceCode: "TR-70",
  plateCode: 70,
  slug: "karaman",
  nameTr: "Karaman",
  region: "CENTRAL_ANATOLIA",
  climateRegion: "IC_ANADOLU",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "CENTRAL_ANATOLIA_BASIN",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 36.452,
    maxLat: 37.5617,
    minLon: 32.4697,
    maxLon: 34.2593
  },
  primaryCenter: {
    mgmMerkezId: 97001,
    mgmIstNo: 17246,
    mgmSaatlikIstNo: 17246,
    mgmGunlukIstNo: 97001,
    wmoId: "17246",
    lat: 37.1932,
    lon: 33.2202,
    demVerifiedElevationM: 1033,
    subBasinId: "karaman_closed_plain",
    urbanFraction: 0.56,
    monthlyTmaxNormalsC: TR81_CLIMATOLOGY_1991_2020["TR-70"].tmaxC,
    monthlyTminNormalsC: TR81_CLIMATOLOGY_1991_2020["TR-70"].tminC
  },
  curatedSubLocations: [
    {
      id: "tr-70-ermenek-vadi",
      name: "Ermenek – Göksu Alt Vadisi",
      role: "coast",
      lat: 36.585,
      lon: 32.895,
      elevationM: 420
    },
    {
      id: "tr-70-merkez",
      name: "Karaman Merkez (Ova · 1033m)",
      role: "plain",
      lat: 37.1932,
      lon: 33.2202,
      elevationM: 1033
    },
    {
      id: "tr-70-kazimkarabekir",
      name: "Kazımkarabekir Ovası",
      role: "plain",
      lat: 37.2186,
      lon: 32.9564,
      elevationM: 1070
    },
    {
      id: "tr-70-ayranci",
      name: "Ayrancı (Bolkar Kuzey Etek)",
      role: "foothill",
      lat: 37.3372,
      lon: 33.7211,
      elevationM: 1186
    },
    {
      id: "tr-70-ermenek",
      name: "Ermenek (Taşeli Yamacı)",
      role: "foothill",
      lat: 36.6336,
      lon: 32.9075,
      elevationM: 1415
    },
    {
      id: "tr-70-basyayla",
      name: "Başyayla",
      role: "foothill",
      lat: 36.7589,
      lon: 32.6789,
      elevationM: 1480
    },
    {
      id: "tr-70-sariveliler",
      name: "Sarıveliler (Taşeli Yüksek Plato)",
      role: "summit",
      lat: 36.7075,
      lon: 32.6223,
      elevationM: 1743
    },
    {
      id: "tr-70-sertavul-yellibel",
      name: "Yellibel & Sertavul Geçit Kuşağı (1900m+)",
      role: "summit",
      lat: 36.935,
      lon: 33.255,
      elevationM: 1910
    },
    {
      id: "tr-70-karadag-zirve",
      name: "Karadağ (Mahalaç Zirvesi)",
      role: "summit",
      lat: 37.396,
      lon: 33.149,
      elevationM: 2288
    }
  ],
  subBasins: [
    {
      id: "karaman_closed_plain",
      labelTr: "Karaman – Kazımkarabekir – Ayrancı Güney Konya Kapalı Havza Tabanı (1033m)",
      polygonOrBbox: {
        minLat: 36.98,
        maxLat: 37.56,
        minLon: 32.78,
        maxLon: 34.26
      },
      elevationRangeM: [980, 1320],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.42
    },
    {
      id: "ermenek_goksu_canyon",
      labelTr: "Ermenek – Başyayla Yukarı Göksu Kanyonu & İç Toros Vadisi",
      polygonOrBbox: {
        minLat: 36.45,
        maxLat: 36.86,
        minLon: 32.55,
        maxLon: 33.25
      },
      elevationRangeM: [400, 1550],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.18
    },
    {
      id: "sertavul_yellibel_taurus_ridge",
      labelTr: "Sarıveliler – Yellibel – Sertavul (1650–2877m) Orta Toros Sırtı & Karadağ",
      polygonOrBbox: {
        minLat: 36.62,
        maxLat: 37.45,
        minLon: 32.47,
        maxLon: 33.95
      },
      elevationRangeM: [1550, 2877],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.04
    }
  ],
  barrierCouplingMatrix: {
    karaman_closed_plain: {
      karaman_closed_plain: 1.0,
      ermenek_goksu_canyon: 0.16,
      sertavul_yellibel_taurus_ridge: 0.34
    },
    ermenek_goksu_canyon: {
      karaman_closed_plain: 0.16,
      ermenek_goksu_canyon: 1.0,
      sertavul_yellibel_taurus_ridge: 0.42
    },
    sertavul_yellibel_taurus_ridge: {
      karaman_closed_plain: 0.34,
      ermenek_goksu_canyon: 0.42,
      sertavul_yellibel_taurus_ridge: 1.0
    }
  },
  stationOverrides: {
    "17246": {
      stationId: 17246,
      nameTr: "Karaman Merkez (1033m Ova)",
      lat: 37.1932,
      lon: 33.2202,
      demElevationM: 1033,
      subBasinId: "karaman_closed_plain",
      urbanFraction: 0.58,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor"
    },
    "18484": {
      stationId: 18484,
      nameTr: "Kazımkarabekir",
      lat: 37.2186,
      lon: 32.9564,
      demElevationM: 1070,
      subBasinId: "karaman_closed_plain",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor"
    },
    "18211": {
      stationId: 18211,
      nameTr: "Ayrancı",
      lat: 37.3372,
      lon: 33.7211,
      demElevationM: 1186,
      subBasinId: "karaman_closed_plain",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "mid_slope"
    },
    "18210": {
      stationId: 18210,
      nameTr: "Ermenek",
      lat: 36.6336,
      lon: 32.9075,
      demElevationM: 1415,
      subBasinId: "ermenek_goksu_canyon",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.32,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18890": {
      stationId: 18890,
      nameTr: "Başyayla",
      lat: 36.7589,
      lon: 32.6789,
      demElevationM: 1480,
      subBasinId: "ermenek_goksu_canyon",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.38,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18485": {
      stationId: 18485,
      nameTr: "Sarıveliler",
      lat: 36.7075,
      lon: 32.6223,
      demElevationM: 1743,
      subBasinId: "sertavul_yellibel_taurus_ridge",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18892": {
      stationId: 18892,
      nameTr: "Sertavul / Yellibel Kar İstasyonu",
      lat: 36.924,
      lon: 33.262,
      demElevationM: 1769,
      subBasinId: "sertavul_yellibel_taurus_ridge",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.25,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [420, 1035, 1620, 2280],
    maxPhysicalPeakM: 2877,
    snowElevationBands: TR81_HYPSOMETRIC_PROFILES["TR-70"].bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "central_taurus_lee_rain_shadow",
      labelTr: "Orta Toros (Sertavul – Yellibel – Geyik/Bolkar) Rüzgaraltı Yağış Gölgesi Duvarı",
      effectiveBarrierHeightM: 2350,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "karaman_closed_plain",
        "sertavul_yellibel_taurus_ridge"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 150, toDeg: 230 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.85,
        sourcePlateauElevationM: 0,
        maxTargetElevationM: 1350,
        maxWarmingCapC: 3.8,
        subCloudVirgaFactor: 0.42,
        wetCutoffMmHr: 0.2
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 330, toDeg: 45 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 0.0,
        maxPrecipMultiplierCap: 1.34
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 150, toDeg: 230 },
        precipAttenuationFactor: 0.58
      }
    }
  ],
  venturiCorridors: [
    {
      id: "sertavul_yellibel_blizzard_gate",
      labelTr: "Sertavul & Yellibel Geçidi (1650–1910m+) Tipi ve Fön Kanalı",
      centerCoord: { lat: 36.93, lon: 33.26 },
      influenceRadiusKm: 28,
      channelAxisFromDeg: 335,
      bidirectional: true,
      sectorHalfWidthDeg: 35,
      speedMultiplier: 1.44,
      gustMultiplier: 1.6,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1033,
    coldPoolMaxDepthM: 340,
    topographicEnclosureIndex: 0.84,
    deltaPressureTopHpa: 40,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 2,
      maxExtraRadiativeCoolingC: 5.2
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.42
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 340, toDeg: 65 },
      minWindShearVs850Deg: 65
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.58,
    invertedVDryMicroburstSusceptibility: 0.74,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TARGET",
      labelTr: "Karaman Merkez (1033m Ova)",
      lat: 37.1932,
      lon: 33.2202,
      elevationM: 1033,
      role: "target"
    },
    {
      key: "KONYA_NORTH_INFLOW",
      labelTr: "Güney Konya Havzası Kuzey Soğuk Girişi",
      lat: 37.52,
      lon: 33.12,
      elevationM: 1012,
      role: "foehn_windward"
    },
    {
      key: "KARADAG_MASSIF",
      labelTr: "Karadağ Volkanik Kütlesi (2288m)",
      lat: 37.396,
      lon: 33.149,
      elevationM: 2288,
      role: "orographic_wall"
    },
    {
      key: "SERTAVUL_PASS_CREST",
      labelTr: "Sertavul Geçidi (1650m) Güney Eşik",
      lat: 36.9153,
      lon: 33.2694,
      elevationM: 1650,
      role: "corridor"
    },
    {
      key: "YELLIBEL_CREST",
      labelTr: "Yellibel Geçidi (1910m+) Toros Sırtı",
      lat: 36.82,
      lon: 32.92,
      elevationM: 1925,
      role: "orographic_wall"
    },
    {
      key: "SARIVELILER_TASELI",
      labelTr: "Sarıveliler – Geyik Dağları Doğu Sırtı",
      lat: 36.7075,
      lon: 32.6223,
      elevationM: 1743,
      role: "orographic_wall"
    },
    {
      key: "AYRANCI_BOLKAR_FOOT",
      labelTr: "Ayrancı – Bolkar Kuzey Eteği",
      lat: 37.3372,
      lon: 33.7211,
      elevationM: 1186,
      role: "lee_shadow"
    },
    {
      key: "KAZIMKARABEKIR_WEST",
      labelTr: "Kazımkarabekir Batı Ovası",
      lat: 37.2186,
      lon: 32.9564,
      elevationM: 1070,
      role: "lee_shadow"
    },
    {
      key: "ERMENEK_CANYON",
      labelTr: "Ermenek – Yukarı Göksu Vadisi",
      lat: 36.6336,
      lon: 32.9075,
      elevationM: 1415,
      role: "corridor"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -30,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 984,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 6.5
  }
};

export const PROVINCE_SPEC_TR_70: ProvinceSpec = Object.freeze(specTr70);

export interface Tr70KaramanColumnInput {
  subBasinId?: string;
  targetElevationM: number;
  windFromDirDeg: number;
  windSpeed850Ms: number;
  baseWind10mKmh: number;
  baseGust10mKmh: number;
  froudeNumber?: number;
  rawPrecipMmHr: number;
  baseTemp2mC: number;
  baseRh2mPct: number;
  clearCalmNight?: boolean;
  snowDepthCm?: number;
  nearSertavulYellibelPass?: boolean;
}

export interface Tr70KaramanColumnResult {
  regime:
    | "SOUTHERLY_TAURUS_RAIN_SHADOW_FOEHN"
    | "NORTHERLY_SERTAVUL_BLIZZARD"
    | "NORTHERLY_TAURUS_UPSLOPE_SNOW"
    | "KARAMAN_BASIN_CONTINENTAL_FROST"
    | "CENTRAL_ANATOLIA_STANDARD";
  precipMultiplier: number;
  adjustedPrecipMmHr: number;
  foehnWarmingC: number;
  radiativeFrostCoolingC: number;
  adjustedTemp2mC: number;
  adjustedRh2mPct: number;
  adjustedWind10mKmh: number;
  adjustedGust10mKmh: number;
  sertavulBlizzardActive: boolean;
}

/**
 * Evaluates Karaman (`TR-70`) lee-of-Taurus rain shadow (`rainShadowMultiplier: 0.58`),
 * southerly dry foehn over the `1033m` Karaman basin, northerly Sertavul/Yellibel (`1900m+`)
 * blizzard corridor, and enclosed-basin snow-albedo continental frost (`kalmanTempBiasCapC: 6.5`).
 */
export function evaluateTr70KaramanColumnPhysics(
  input: Tr70KaramanColumnInput
): Tr70KaramanColumnResult {
  const subBasinId = input.subBasinId ?? PROVINCE_SPEC_TR_70.primaryCenter.subBasinId;
  const barrier = PROVINCE_SPEC_TR_70.directionalBarriers[0];
  const passCorridor = PROVINCE_SPEC_TR_70.venturiCorridors[0];

  const fwdDiff = angularDiffDeg(input.windFromDirDeg, passCorridor.channelAxisFromDeg);
  const revDiff = angularDiffDeg(
    input.windFromDirDeg,
    (passCorridor.channelAxisFromDeg + 180) % 360
  );
  const passAligned =
    fwdDiff <= passCorridor.sectorHalfWidthDeg ||
    (passCorridor.bidirectional && revDiff <= passCorridor.sectorHalfWidthDeg);

  const inPassZone =
    Boolean(input.nearSertavulYellibelPass) ||
    subBasinId === "sertavul_yellibel_taurus_ridge" ||
    input.targetElevationM >= 1600;

  const passVenturiActive = inPassZone && passAligned && input.windSpeed850Ms >= 6.0;
  const adjustedWind10mKmh = passVenturiActive
    ? input.baseWind10mKmh * passCorridor.speedMultiplier
    : input.baseWind10mKmh;
  const adjustedGust10mKmh = passVenturiActive
    ? Math.max(
        adjustedWind10mKmh * 1.15,
        input.baseGust10mKmh * passCorridor.gustMultiplier
      )
    : input.baseGust10mKmh;

  // 1. Southerly Mediterranean frontal flow -> sharp Taurus lee rain shadow (0.58x) & dry foehn
  const inSoutherlyShadow =
    barrier.rainShadowSpec !== undefined &&
    isWindInSector(
      input.windFromDirDeg,
      barrier.rainShadowSpec.shadowedWindFromSectorDeg
    );

  if (inSoutherlyShadow && subBasinId !== "ermenek_goksu_canyon") {
    const shadowMult = barrier.rainShadowSpec!.precipAttenuationFactor; // 0.58
    const froude = input.froudeNumber ?? 1.05;
    const foehnActive =
      barrier.foehnSpec.enabled &&
      input.windSpeed850Ms >= barrier.foehnSpec.minCrossCrestSpeedMs &&
      froude >= barrier.foehnSpec.minFroudeNumber &&
      input.targetElevationM <= barrier.foehnSpec.maxTargetElevationM;

    const windFactor = foehnActive
      ? clamp((input.windSpeed850Ms - barrier.foehnSpec.minCrossCrestSpeedMs) / 9.0, 0.45, 1.0)
      : 0;
    const foehnWarmingC = foehnActive
      ? clamp(barrier.foehnSpec.maxWarmingCapC * windFactor, 0, barrier.foehnSpec.maxWarmingCapC)
      : 0;

    // Rain shadow (0.58x); if light precip under active dry foehn, sub-cloud virga evaporates it
    const shadowedPrecip = input.rawPrecipMmHr * shadowMult;
    const adjustedPrecipMmHr =
      foehnActive && shadowedPrecip * (1 - barrier.foehnSpec.subCloudVirgaFactor) <= barrier.foehnSpec.wetCutoffMmHr
        ? 0
        : shadowedPrecip;

    const adjustedRh2mPct = foehnActive
      ? clamp(input.baseRh2mPct - foehnWarmingC * 6.5, 22, 65)
      : clamp(input.baseRh2mPct, 22, 100);

    return {
      regime: "SOUTHERLY_TAURUS_RAIN_SHADOW_FOEHN",
      precipMultiplier: shadowMult,
      adjustedPrecipMmHr: Number(adjustedPrecipMmHr.toFixed(2)),
      foehnWarmingC: Number(foehnWarmingC.toFixed(2)),
      radiativeFrostCoolingC: 0,
      adjustedTemp2mC: Number((input.baseTemp2mC + foehnWarmingC).toFixed(2)),
      adjustedRh2mPct: Number(adjustedRh2mPct.toFixed(1)),
      adjustedWind10mKmh: Number(adjustedWind10mKmh.toFixed(1)),
      adjustedGust10mKmh: Number(adjustedGust10mKmh.toFixed(1)),
      sertavulBlizzardActive: false
    };
  }

  // 2. Northerly Inner Anatolian system -> upslope snow against northern Taurus wall & Sertavul blizzard
  const inNortherlyUpslope =
    barrier.upslopeSpec.enabled &&
    isWindInSector(input.windFromDirDeg, barrier.upslopeSpec.windFromSectorDeg) &&
    input.windSpeed850Ms >= barrier.upslopeSpec.minOnshoreOrUpslopeSpeedMs;

  if (inNortherlyUpslope) {
    const speedRamp = clamp(
      (input.windSpeed850Ms - barrier.upslopeSpec.minOnshoreOrUpslopeSpeedMs) / 10.0,
      0.35,
      1.0
    );
    const elevFactor = clamp((input.targetElevationM - 950) / 950, 0.25, 1.0);
    const precipMultiplier = clamp(
      1.0 + (barrier.upslopeSpec.maxPrecipMultiplierCap - 1.0) * speedRamp * elevFactor,
      1.0,
      barrier.upslopeSpec.maxPrecipMultiplierCap
    );
    const adjustedPrecipMmHr = input.rawPrecipMmHr * precipMultiplier;
    const sertavulBlizzardActive =
      inPassZone &&
      adjustedPrecipMmHr >= 0.35 &&
      input.baseTemp2mC <= 0.5 &&
      adjustedWind10mKmh >= 38;

    return {
      regime: sertavulBlizzardActive
        ? "NORTHERLY_SERTAVUL_BLIZZARD"
        : "NORTHERLY_TAURUS_UPSLOPE_SNOW",
      precipMultiplier: Number(precipMultiplier.toFixed(3)),
      adjustedPrecipMmHr: Number(adjustedPrecipMmHr.toFixed(2)),
      foehnWarmingC: 0,
      radiativeFrostCoolingC: 0,
      adjustedTemp2mC: Number(input.baseTemp2mC.toFixed(2)),
      adjustedRh2mPct: Number(clamp(Math.max(input.baseRh2mPct, 76), 40, 100).toFixed(1)),
      adjustedWind10mKmh: Number(adjustedWind10mKmh.toFixed(1)),
      adjustedGust10mKmh: Number(adjustedGust10mKmh.toFixed(1)),
      sertavulBlizzardActive
    };
  }

  // 3. Enclosed Southern Konya / Karaman plain (1033m) nocturnal radiative frost (ayaz)
  if (
    input.clearCalmNight &&
    subBasinId === "karaman_closed_plain" &&
    input.windSpeed850Ms <= 4.5 &&
    !passVenturiActive
  ) {
    const inv = PROVINCE_SPEC_TR_70.inversionAndWedgeSpec;
    let coolingC = 3.1 * inv.topographicEnclosureIndex;
    if ((input.snowDepthCm ?? 0) >= inv.snowAlbedoFeedback.snowDepthTriggerCm) {
      coolingC += inv.snowAlbedoFeedback.maxExtraRadiativeCoolingC;
    }
    coolingC = clamp(coolingC, 0, PROVINCE_SPEC_TR_70.qcAndMosBounds.kalmanTempBiasCapC + 1.5);

    return {
      regime: "KARAMAN_BASIN_CONTINENTAL_FROST",
      precipMultiplier: 1.0,
      adjustedPrecipMmHr: 0,
      foehnWarmingC: 0,
      radiativeFrostCoolingC: Number(coolingC.toFixed(2)),
      adjustedTemp2mC: Number((input.baseTemp2mC - coolingC).toFixed(2)),
      adjustedRh2mPct: Number(clamp(input.baseRh2mPct + 14, 45, 100).toFixed(1)),
      adjustedWind10mKmh: Number(adjustedWind10mKmh.toFixed(1)),
      adjustedGust10mKmh: Number(adjustedGust10mKmh.toFixed(1)),
      sertavulBlizzardActive: false
    };
  }

  return {
    regime: "CENTRAL_ANATOLIA_STANDARD",
    precipMultiplier: 1.0,
    adjustedPrecipMmHr: Number(input.rawPrecipMmHr.toFixed(2)),
    foehnWarmingC: 0,
    radiativeFrostCoolingC: 0,
    adjustedTemp2mC: Number(input.baseTemp2mC.toFixed(2)),
    adjustedRh2mPct: Number(clamp(input.baseRh2mPct, 20, 100).toFixed(1)),
    adjustedWind10mKmh: Number(adjustedWind10mKmh.toFixed(1)),
    adjustedGust10mKmh: Number(adjustedGust10mKmh.toFixed(1)),
    sertavulBlizzardActive: false
  };
}

export default PROVINCE_SPEC_TR_70;
