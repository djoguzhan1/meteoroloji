/**
 * ATMOS v4.5 — 9-Point Bursa Micro-Stencil, 3D Uludağ Physics & DWD ICON Native Grid Adapter
 * File: lib/vertical-physics.ts
 *
 * Solves NWP grid-orography blurring over Bursa (100-200m plain adjacent to 2,543m Uludağ):
 *  1. 9-Point Bursa Spatial Stencil (Merkez, Nilüfer, Mudanya Marine, Uludağ Slope/Peak,
 *     Yıldırım/Kestel, Karacabey West Corridor, Gemlik Bay, Orhaneli Windward South Slope)
 *  2. 1000-700 hPa 3D Vertical Column Physics:
 *     - Mountain Froude Number Fr = U_perp / (N * H_uludag)
 *     - Lodos SW Foehn dry-adiabatic lee warming (+9.76°C/km) & sub-cloud virga evaporation
 *     - Blocked Ova radiative cold-pool / temperature inversion profile interpolation
 *     - Poyraz/Karayel Marmara Sea-Effect (DEK) + Uludağ upslope orographic precip multiplier
 *  3. 30 November 2026 DWD ICON Native Grid migration & missing `visibility` physical diagnosis
 */

export interface StencilNode {
  key:
    | 'center_osmangazi'
    | 'nilufer_west'
    | 'mudanya_sea'
    | 'uludag_north_slope'
    | 'uludag_summit'
    | 'kestel_east'
    | 'karacabey_inflow'
    | 'gemlik_bay'
    | 'orhaneli_windward_south';
  label: string;
  lat: number;
  lon: number;
  elevationM: number;
  role: 'target' | 'marine_upwind' | 'orographic_wall' | 'foehn_windward' | 'corridor';
}

export const BURSA_9POINT_STENCIL: readonly StencilNode[] = [
  {
    key: 'center_osmangazi',
    label: 'Bursa Osmangazi Merkez',
    lat: 40.1885,
    lon: 29.0610,
    elevationM: 155,
    role: 'target',
  },
  {
    key: 'nilufer_west',
    label: 'Nilüfer / Görükle Ova',
    lat: 40.2225,
    lon: 28.8725,
    elevationM: 112,
    role: 'corridor',
  },
  {
    key: 'mudanya_sea',
    label: 'Mudanya Marmara Kıyısı',
    lat: 40.3756,
    lon: 28.8822,
    elevationM: 12,
    role: 'marine_upwind',
  },
  {
    key: 'uludag_north_slope',
    label: 'Uludağ Kuzey Yamaç',
    lat: 40.1380,
    lon: 29.1080,
    elevationM: 1120,
    role: 'orographic_wall',
  },
  {
    key: 'uludag_summit',
    label: 'Uludağ Zirve Sırtı',
    lat: 40.1075,
    lon: 29.1292,
    elevationM: 1877,
    role: 'orographic_wall',
  },
  {
    key: 'kestel_east',
    label: 'Yıldırım / Kestel Etek',
    lat: 40.1978,
    lon: 29.2122,
    elevationM: 210,
    role: 'corridor',
  },
  {
    key: 'karacabey_inflow',
    label: 'Karacabey Batı Boğazı',
    lat: 40.2185,
    lon: 28.3614,
    elevationM: 25,
    role: 'corridor',
  },
  {
    key: 'gemlik_bay',
    label: 'Gemlik Körfezi',
    lat: 40.4312,
    lon: 29.1536,
    elevationM: 10,
    role: 'marine_upwind',
  },
  {
    key: 'orhaneli_windward_south',
    label: 'Orhaneli (Uludağ Güney Rüzgar-Üstü)',
    lat: 39.9035,
    lon: 28.9905,
    elevationM: 520,
    role: 'foehn_windward',
  },
] as const;

export interface PressureLevelSlice {
  pressureHpa: 1000 | 975 | 950 | 925 | 850 | 700;
  geopotentialHeightM: number;
  tempC: number;
  relHumidityPct: number;
  windSpeedKt: number;
  windDirDeg: number;
}

export interface VerticalColumnInput {
  targetElevationM: number;
  rawModelTemp2mC: number;
  rawModelDew2mC: number;
  rawModelPrecipMmHr: number;
  rawModelVisibilityM?: number | null;
  cloudCoverLowPct: number;
  shortwaveRadiationWm2: number;
  isNight: boolean;
  marmaraSstC?: number;
  /** Optional moisture/rain readings from southern windward Orhaneli & northern Mudanya stencil points */
  windwardSouthRh850Pct?: number;
  marineUpwindPrecipMmHr?: number;
  uludagSlopePrecipMmHr?: number;
  levels: PressureLevelSlice[];
}

export interface VerticalPhysicsAdjustment {
  correctedTemp2mC: number;
  tempDeltaC: number;
  correctedPrecipMmHr: number;
  precipMultiplier: number;
  virgaEvaporatedMmHr: number;
  diagnosedVisibilityM: number;
  froudeNumber: number;
  bruntVaisalaFreqS1: number;
  liftingCondensationLevelM: number;
  activeMechanism:
    | 'LODOS_DRY_FOEHN'
    | 'RADIATIVE_COLD_POOL_INVERSION'
    | 'POYRAZ_UPSLOPE_ENHANCEMENT'
    | 'MARMARA_SEA_EFFECT_DEK'
    | 'STANDARD_PROFILE';
}

const G0 = 9.80665;
const R_CP = 0.2857; // Rd / cp for dry air
const ULUDAG_BARRIER_HEIGHT_M = 2200;
// Uludağ ridge axis runs roughly WNW-ESE; perpendicular cross-barrier southerly flow is from ~210°
const ULUDAG_SOUTH_NORMAL_DEG = 210;
const ULUDAG_NORTH_NORMAL_DEG = 30;

/** Potential temperature theta (K) from T (°C) and P (hPa) */
export function computePotentialTempK(tempC: number, pressureHpa: number): number {
  const tempK = tempC + 273.15;
  return tempK * (1000 / Math.max(100, pressureHpa)) ** R_CP;
}

/** Builds Open-Meteo comma-separated multi-coordinate query parameters for the 9-point Bursa stencil */
export function buildBursaStencilQueryCoords(): {
  latitude: string;
  longitude: string;
  elevation: string;
} {
  return {
    latitude: BURSA_9POINT_STENCIL.map((n) => n.lat.toFixed(4)).join(','),
    longitude: BURSA_9POINT_STENCIL.map((n) => n.lon.toFixed(4)).join(','),
    elevation: BURSA_9POINT_STENCIL.map((n) => Math.round(n.elevationM)).join(','),
  };
}

/**
 * Diagnoses horizontal visibility (meters) physically when NWP `visibility` is null/removed
 * (mandatory compatibility for DWD ICON native grid feed migration on 30 November 2026).
 * Based on Gultepe et al. (2006) boundary-layer extinction & Marshall-Palmer hydrometeor attenuation.
 */
export function diagnosePhysicalVisibilityM(params: {
  rawVisibilityM?: number | null;
  temp2mC: number;
  dewPoint2mC: number;
  cloudCoverLowPct: number;
  precipMmHr: number;
  isSnow?: boolean;
  windSpeedKt?: number;
}): number {
  if (
    typeof params.rawVisibilityM === 'number' &&
    Number.isFinite(params.rawVisibilityM) &&
    params.rawVisibilityM > 0
  ) {
    return Math.round(Math.max(50, Math.min(50000, params.rawVisibilityM)));
  }

  const dewDepressionC = Math.max(0, params.temp2mC - params.dewPoint2mC);
  const windKt = params.windSpeedKt ?? 5;
  let visKm = 28.0;

  // 1. Radiation / advection fog extinction when dew-point spread approaches zero
  if (dewDepressionC <= 0.4 && windKt <= 6) {
    visKm = 0.35 + 1.1 * dewDepressionC;
  } else if (dewDepressionC <= 1.2 && windKt <= 8) {
    visKm = 1.8 + 3.2 * (dewDepressionC - 0.4);
  } else if (dewDepressionC <= 2.5 && params.cloudCoverLowPct >= 75) {
    visKm = 5.5 + 3.0 * (dewDepressionC - 1.2);
  } else {
    visKm = Math.min(35, 10 + 4.5 * dewDepressionC);
  }

  // 2. Precipitation hydrometeor optical extinction (snow attenuates ~3.5x stronger than rain per mm/h)
  if (params.precipMmHr > 0.05) {
    const precipVisKm = params.isSnow
      ? 3.2 * params.precipMmHr ** -0.68
      : 14.5 * params.precipMmHr ** -0.52;
    visKm = Math.min(visKm, Math.max(0.15, precipVisKm));
  }

  return Math.round(Math.max(100, Math.min(40000, visKm * 1000)));
}

function projectWindAlongAzimuthMs(windSpeedKt: number, windDirDeg: number, targetFromDeg: number): number {
  const windMs = windSpeedKt * 0.514444;
  const diffRad = (((windDirDeg - targetFromDeg) * Math.PI) / 180);
  return windMs * Math.cos(diffRad);
}

/**
 * Solves 3D column thermodynamics, Uludağ Froude regime, Lodos Foehn warming + virga evaporation,
 * nocturnal Ova inversion trapping, and Poyraz sea-effect/upslope precipitation enhancement.
 */
export function solveVerticalColumnPhysics(input: VerticalColumnInput): VerticalPhysicsAdjustment {
  const sortedLevels = [...input.levels].sort((a, b) => b.pressureHpa - a.pressureHpa);
  const lvl1000 = sortedLevels.find((l) => l.pressureHpa === 1000) ?? sortedLevels[0];
  const lvl925 = sortedLevels.find((l) => l.pressureHpa === 925) ?? sortedLevels[Math.min(2, sortedLevels.length - 1)];
  const lvl850 = sortedLevels.find((l) => l.pressureHpa === 850) ?? sortedLevels[Math.max(0, sortedLevels.length - 2)];
  const lvl700 = sortedLevels.find((l) => l.pressureHpa === 700) ?? sortedLevels[sortedLevels.length - 1];

  // Lifting Condensation Level height above ground: Espy-Bolton approximation z_LCL ≈ 125 * (T - Td)
  const surfaceSpreadC = Math.max(0, input.rawModelTemp2mC - input.rawModelDew2mC);
  const lclHeightAglM = 125 * surfaceSpreadC;

  // Compute Brunt-Väisälä static stability N between 925 hPa and 700 hPa (or available endpoints)
  let bruntVaisala = 0.011;
  if (lvl1000 && lvl850 && lvl850.geopotentialHeightM > lvl1000.geopotentialHeightM + 200) {
    const thetaLow = computePotentialTempK(lvl1000.tempC, lvl1000.pressureHpa);
    const thetaHigh = computePotentialTempK(lvl850.tempC, lvl850.pressureHpa);
    const dz = lvl850.geopotentialHeightM - lvl1000.geopotentialHeightM;
    const dThetaDz = Math.max(1e-4, (thetaHigh - thetaLow) / dz);
    const meanTheta = 0.5 * (thetaLow + thetaHigh);
    bruntVaisala = Math.sqrt((G0 / meanTheta) * dThetaDz);
  }

  // Cross-barrier wind components at 850 hPa (~1,500 m, Uludağ mid-barrier crest flow)
  const uSouthCrossMs = lvl850
    ? projectWindAlongAzimuthMs(lvl850.windSpeedKt, lvl850.windDirDeg, ULUDAG_SOUTH_NORMAL_DEG)
    : 0;
  const uNorthCrossMs = lvl925
    ? projectWindAlongAzimuthMs(lvl925.windSpeedKt, lvl925.windDirDeg, ULUDAG_NORTH_NORMAL_DEG)
    : 0;

  const crossSpeedMs = Math.max(0, uSouthCrossMs, uNorthCrossMs);
  const froudeNumber = crossSpeedMs / Math.max(1.5, bruntVaisala * ULUDAG_BARRIER_HEIGHT_M);

  let tempDeltaC = 0;
  let precipMultiplier = 1.0;
  let virgaEvaporatedMmHr = 0;
  let activeMechanism: VerticalPhysicsAdjustment['activeMechanism'] = 'STANDARD_PROFILE';

  // MECHANISM 1: Lodos SW Cross-Barrier Foehn over Uludağ
  // Requires strong SSW-WSW cross-barrier component at 850/700 hPa & Froude number >= 0.42 (flow surmounts crest)
  if (uSouthCrossMs >= 7.5 && froudeNumber >= 0.42 && input.targetElevationM <= 550) {
    activeMechanism = 'LODOS_DRY_FOEHN';
    const windwardRh = input.windwardSouthRh850Pct ?? Math.min(95, (lvl850?.relHumidityPct ?? 65) + 18);
    const leeRh = lvl925?.relHumidityPct ?? 50;
    const crossCrestDrying = Math.max(0, (windwardRh - leeRh) / 100);

    // Thermodynamic Foehn gain scales with cross-barrier momentum & windward latent heat release
    const momentumFactor = Math.min(1.0, (uSouthCrossMs - 6.0) / 12.0);
    const foehnGainC = (0.85 + 2.35 * crossCrestDrying) * momentumFactor * Math.min(1.2, froudeNumber / 0.65);
    tempDeltaC = Math.min(3.4, Math.max(0.3, foehnGainC));

    // Sub-cloud Virga Evaporation (Foehn clearance):
    // Descending dry lee air creates high LCL (> 950 m); light NWP stratiform rain evaporates aloft!
    if (input.rawModelPrecipMmHr > 0 && lclHeightAglM >= 850) {
      const subCloudDryness = Math.max(0, (lclHeightAglM - 750) / 1400);
      // Schlesinger sub-cloud evaporation capacity (mm/h)
      const evapCapacityMmHr = 0.55 * subCloudDryness * (1 + 0.4 * momentumFactor);
      virgaEvaporatedMmHr = Math.min(input.rawModelPrecipMmHr, evapCapacityMmHr);
      // Heavy convective cores (> 2.5 mm/h) punch through; weak < 0.6 mm/h signals evaporate completely
      const surviving = Math.max(0, input.rawModelPrecipMmHr - virgaEvaporatedMmHr);
      precipMultiplier = input.rawModelPrecipMmHr > 0 ? surviving / input.rawModelPrecipMmHr : 0;
    }
  }
  // MECHANISM 2: Radiative Cold-Pool / Ova Inversion Trapping (Blocked Low-Froude Night/Winter)
  else if (
    lvl1000 &&
    lvl925 &&
    lvl925.tempC > lvl1000.tempC + 0.4 &&
    crossSpeedMs < 5.0 &&
    input.targetElevationM <= 320 &&
    (input.isNight || input.shortwaveRadiationWm2 < 140)
  ) {
    activeMechanism = 'RADIATIVE_COLD_POOL_INVERSION';
    const invJumpC = lvl925.tempC - lvl1000.tempC;
    // Interpolate exact cold-pool profile instead of NWP coarse-grid slope-contaminated 2m value
    const elevAboveFloorM = Math.max(0, input.targetElevationM - 95);
    const coldPoolDepthM = 240;
    const poolFactor = Math.max(0, 1 - elevAboveFloorM / coldPoolDepthM);
    tempDeltaC = -Math.min(2.2, (0.45 + 0.35 * invJumpC) * poolFactor);
  }
  // MECHANISM 3: Poyraz / Karayel Marmara Sea-Effect (DEK) + Uludağ Upslope Orographic Lift
  else if (uNorthCrossMs >= 4.5) {
    const sstC = input.marmaraSstC ?? 13.0;
    const deltaSst850C = lvl850 ? sstC - lvl850.tempC : 8;
    const lowRh = lvl925?.relHumidityPct ?? 75;

    // Lake/Sea-Effect Snow/Rain (DEK) triggers when SST - T_850 >= 11.5°C over Marmara fetch
    if (deltaSst850C >= 11.5 && lowRh >= 72) {
      activeMechanism = 'MARMARA_SEA_EFFECT_DEK';
      const dekInstabilityBoost = 1.0 + Math.min(0.65, 0.08 * (deltaSst850C - 11.0));
      const slopeRatio =
        input.uludagSlopePrecipMmHr !== undefined && input.rawModelPrecipMmHr > 0.05
          ? Math.min(1.45, Math.max(1.0, (0.7 * input.rawModelPrecipMmHr + 0.3 * input.uludagSlopePrecipMmHr) / input.rawModelPrecipMmHr))
          : 1.18;
      precipMultiplier = Math.min(1.85, dekInstabilityBoost * slopeRatio);
      tempDeltaC = -0.35; // Evaporative & wet-bulb cooling in DEK bands
    } else if (lowRh >= 78 && (lvl700?.relHumidityPct ?? 60) >= 65) {
      activeMechanism = 'POYRAZ_UPSLOPE_ENHANCEMENT';
      // Upslope vertical velocity w_oro proportional to normal northerly wind speed hitting Uludağ foothills
      const upslopeBoost = 1.0 + Math.min(0.45, 0.032 * (uNorthCrossMs - 3.5));
      precipMultiplier = upslopeBoost;
      tempDeltaC = -0.20;
    }
  }

  const correctedTemp2mC = input.rawModelTemp2mC + tempDeltaC;
  const correctedPrecipMmHr = Math.max(
    0,
    input.rawModelPrecipMmHr * precipMultiplier - (activeMechanism === 'LODOS_DRY_FOEHN' ? 0 : virgaEvaporatedMmHr),
  );

  // Zero out sub-0.06 mm/h numerical trace noise
  const finalPrecipMmHr = correctedPrecipMmHr < 0.06 ? 0 : correctedPrecipMmHr;

  const diagnosedVisibilityM = diagnosePhysicalVisibilityM({
    rawVisibilityM: input.rawModelVisibilityM,
    temp2mC: correctedTemp2mC,
    dewPoint2mC: Math.min(correctedTemp2mC, input.rawModelDew2mC),
    cloudCoverLowPct: input.cloudCoverLowPct,
    precipMmHr: finalPrecipMmHr,
    isSnow: correctedTemp2mC <= 1.2,
    windSpeedKt: lvl1000?.windSpeedKt ?? 5,
  });

  return {
    correctedTemp2mC: Number(correctedTemp2mC.toFixed(2)),
    tempDeltaC: Number(tempDeltaC.toFixed(2)),
    correctedPrecipMmHr: Number(finalPrecipMmHr.toFixed(2)),
    precipMultiplier: Number(precipMultiplier.toFixed(3)),
    virgaEvaporatedMmHr: Number(virgaEvaporatedMmHr.toFixed(2)),
    diagnosedVisibilityM,
    froudeNumber: Number(froudeNumber.toFixed(3)),
    bruntVaisalaFreqS1: Number(bruntVaisala.toFixed(4)),
    liftingCondensationLevelM: Math.round(lclHeightAglM),
    activeMechanism,
  };
}
