import { wetBulbStullC } from "./thermo-cape";
import type {
  BlowingSnowRisk,
  DekSnowStatus,
  ElevationSnowBand,
  LightningCellVector,
  LightningProximityRadar,
  LightningRangeRingSummary,
  LightningSafetyLevel,
  MetarObservation,
  PrecipPhase,
  RoadIcingRisk,
  SnowQualityLabelTr,
  SoundingLevel
} from "./weather-types";

/**
 * ATMOS v5.0 — HIGH-PRECISION SNOW MICROPHYSICS, COUPLED SURFACE ACCUMULATION & LIGHTNING ENGINE
 *
 * Physical standards implemented:
 *  1. Bourgouin (2000) / Ramer (1993) Positive Wet-Bulb Melting Energy Integral (`ME` in J/kg)
 *     + Kain et al. (2000) heavy-rate latent melting cooling + sub-cloud sublimative cooling snow line.
 *  2. Dynamic Kuchera + Cobb-Waldstreicher (-12..-18°C Dendritic Growth Zone) Snow-to-Liquid Ratio (SLR)
 *     with surface wet-bulb riming, graupel habit detection, and mechanical wind fragmentation.
 *  3. Coupled 2-Surface Energy-Balance Snow Budget (In-Air Snowfall vs. Grass/Soil vs. Asphalt/Road):
 *     Tracks 24-48h antecedent ground/pavement thermal memory (`T_soil`, `T_road`), shortwave solar
 *     albedo contrast (bare asphalt 0.12 vs. fresh snow 0.74), latent fusion heat extraction
 *     (`L_f = 3.34e5 J/kg`) chilling warm pavement during heavy bursts, snowpack compaction, and melt.
 *  4. 4-Tier Topographic Snow Cross-Section (`Kıyı / Merkez / Yamaç / Zirve`) per hour & per date.
 *  5. DEK (Sea-Effect Snow: `SST - T850 >= 13°C` + onshore fetch), Black Ice (`T_road <= 0°C` + wet film),
 *     and Li-Pomeroy (1997) Blowing Snow / Blizzard diagnostics.
 *  6. Takahashi-Saunders Mixed-Phase (-10..-20°C) Graupel Ice-Flux Lightning Threat Index + DWD ICON LPI,
 *     cold-top glaciation gate (`T_EL <= -8°C`), cold-season Thundersnow detection, and 3-Ring
 *     (`0-15 km` / `15-40 km` / `40-100 km`) Doppler + METAR proximity scanner with 30-30 safety guidance.
 *
 * Pure TypeScript module — zero `node:*` imports so both Server and Client bundles stay clean.
 */

const G0 = 9.80665; // m/s^2
const LATENT_HEAT_FUSION_J_KG = 3.34e5; // J/kg (1 mm SWE = 1 kg/m^2 -> 3.34e5 J/m^2 = 92.78 W·h/m^2)
const MELT_ENERGY_PER_MM_WH = LATENT_HEAT_FUSION_J_KG / 3600; // ~92.78 W·h / (m^2 · mm SWE)

function clamp(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo;
  return Math.max(lo, Math.min(hi, v));
}

const COMPASS_8_TR = ["K", "KD", "D", "GD", "G", "GB", "B", "KB"] as const;

export function bearingToCompassTr(deg: number): string {
  const norm = (((deg % 360) + 360) % 360);
  const idx = Math.round(norm / 45) % 8;
  return COMPASS_8_TR[idx];
}

/**
 * Estimates surface downward shortwave solar irradiance (`W/m^2`) when NWP `shortwave_radiation`
 * is missing or in the extended synoptic window, using solar elevation + Kasten-Czeplak cloud transmittance.
 */
export function estimateShortwaveRadiationWm2(
  rawShortwaveWm2: number | null | undefined,
  solarElevationDeg: number,
  cloudCoverPct: number
): number {
  if (
    typeof rawShortwaveWm2 === "number" &&
    Number.isFinite(rawShortwaveWm2) &&
    rawShortwaveWm2 >= 0
  ) {
    return Math.round(clamp(rawShortwaveWm2, 0, 1180));
  }
  if (solarElevationDeg <= 0) return 0;
  const sinElev = Math.sin((solarElevationDeg * Math.PI) / 180);
  const clearSkyWm2 = 995 * Math.pow(sinElev, 1.12);
  const cloudFrac = clamp(cloudCoverPct / 100, 0, 1);
  const transmittance = 1 - 0.72 * Math.pow(cloudFrac, 1.45);
  return Math.round(clamp(clearSkyWm2 * transmittance, 0, 1150));
}

// ============================================================================
// 1. BOURGOUIN (2000) POSITIVE WET-BULB MELTING ENERGY & DIABATIC SNOW LINE
// ============================================================================

export interface BourgouinSnowLineInput {
  elevationM: number;
  surfaceTempC: number;
  surfaceRhPct: number;
  precipMmHr: number;
  freezingLevelM: number | null;
  temp850hPa: number | null;
  levels?: SoundingLevel[];
  lapseRateCPerKm?: number;
}

export interface BourgouinSnowLineResult {
  /** Altitude (m MSL) where >=50% ice hydrometeor mass survives (`ME <= 7.5 J/kg`) */
  snowLineElevationM: number;
  /** Wet-bulb 0°C altitude (`Tw = 0°C`, m MSL) */
  wetBulbZeroM: number;
  /** Positive melting energy integrated down to `elevationM` (`J/kg`) */
  meltingEnergyJkg: number;
  /** Negative sub-freezing cold-wedge refreezing energy (`J/kg`, <= 0) */
  refreezeEnergyJkg: number;
  /** Ice crystal survival fraction at `elevationM` (`0..1`) */
  iceSurvivalFraction: number;
  /** Bourgouin hydrometeor phase implied purely by thermal column */
  columnPhase: "snow" | "sleet" | "freezing_rain" | "rain";
}

type ColumnNode = {
  zM: number;
  tempC: number;
  rhPct: number;
  twC: number;
};

export function solveBourgouinSnowLine(
  input: BourgouinSnowLineInput
): BourgouinSnowLineResult {
  const elevM = Math.max(0, input.elevationM);
  const rhSfc = clamp(input.surfaceRhPct, 5, 100);
  const twSfc = wetBulbStullC(input.surfaceTempC, rhSfc);
  const lapsePerM = clamp((input.lapseRateCPerKm ?? 6.2) / 1000, 0.0038, 0.0092);

  // Heavy precipitation latent melting cools isothermal 0°C layers (Kain et al. 2000; Lackmann 2002)
  const heavyDiabaticDropM =
    input.precipMmHr > 0.6
      ? Math.min(340, 58 * Math.pow(input.precipMmHr - 0.6, 0.75))
      : 0;

  // Build ordered vertical column from surface up through pressure levels
  const nodes: ColumnNode[] = [
    {
      zM: elevM,
      tempC: input.surfaceTempC,
      rhPct: rhSfc,
      twC: twSfc
    }
  ];

  if (input.levels && input.levels.length >= 2) {
    const sorted = [...input.levels]
      .filter(
        (lv) =>
          Number.isFinite(lv.altitudeM) &&
          Number.isFinite(lv.temperature) &&
          lv.altitudeM > elevM + 25
      )
      .sort((a, b) => a.altitudeM - b.altitudeM);

    for (const lv of sorted) {
      const rh = clamp(lv.humidity, 5, 100);
      nodes.push({
        zM: lv.altitudeM,
        tempC: lv.temperature,
        rhPct: rh,
        twC: wetBulbStullC(lv.temperature, rh)
      });
    }
  }

  // Fallback synthetic moist-hydrostatic column when pressure-level soundings aren't available (e.g. >168h)
  if (nodes.length < 3) {
    let zFrz: number;
    if (input.freezingLevelM !== null && Number.isFinite(input.freezingLevelM)) {
      zFrz = input.freezingLevelM;
    } else if (input.temp850hPa !== null && Number.isFinite(input.temp850hPa)) {
      zFrz = 1460 + input.temp850hPa / lapsePerM;
    } else {
      zFrz = elevM + input.surfaceTempC / lapsePerM;
    }

    // Dry sub-cloud evaporative depression lowers Tw=0 relative to T=0
    const dryTwDepressionM = Math.max(0, (input.surfaceTempC - twSfc) / lapsePerM);
    const wetBulbZeroRaw = Math.max(0, zFrz - dryTwDepressionM - heavyDiabaticDropM * 0.45);

    // Integrate positive Tw triangle from `wetBulbZeroRaw` down to `elevM` if `twSfc > 0`
    let meJkg = 0;
    if (wetBulbZeroRaw > elevM && twSfc > 0) {
      const dzWarm = wetBulbZeroRaw - elevM;
      // Mean Tw across linear profile is `0.5 * twSfc`
      meJkg = (G0 * (0.5 * twSfc) * dzWarm) / 273.15;
    }
    // Apply heavy-rate diabatic reduction to melting energy
    const diabaticMeCredit = heavyDiabaticDropM * 0.032;
    meJkg = Math.max(0, meJkg - diabaticMeCredit);

    // Solve altitude `z_snow` below `wetBulbZeroRaw` where `ME(z_snow) = 7.5 J/kg`:
    // `(G0 * 0.5 * lapseTw * dz^2) / 273.15 = 7.5` -> `dz = sqrt((7.5 * 273.15 * 2) / (G0 * lapseTw))`
    const lapseTw = clamp(lapsePerM * 0.86, 0.0042, 0.0078);
    const survivalDropM = Math.sqrt((7.5 * 273.15 * 2) / (G0 * lapseTw)) + heavyDiabaticDropM * 0.55;
    const snowLineM = Math.max(0, Math.round(wetBulbZeroRaw - survivalDropM));

    const iceFrac =
      twSfc <= -0.15
        ? 1
        : clamp(1 - (meJkg - 4.2) / 11.2, 0, 1);

    const columnPhase: BourgouinSnowLineResult["columnPhase"] =
      iceFrac >= 0.68 ? "snow" : iceFrac >= 0.14 ? "sleet" : "rain";

    return {
      snowLineElevationM: snowLineM,
      wetBulbZeroM: Math.round(wetBulbZeroRaw),
      meltingEnergyJkg: Number(meJkg.toFixed(1)),
      refreezeEnergyJkg: 0,
      iceSurvivalFraction: Number(iceFrac.toFixed(3)),
      columnPhase
    };
  }

  // Full multi-layer sounding integration from top of troposphere (`~5500 m`) down to surface!
  // Step on a fine 25 m vertical grid so elevated warm noses (+Tw aloft over -Tw surface) are resolved exactly.
  const topZ = Math.min(6000, nodes[nodes.length - 1].zM);
  const stepM = 25;
  const gridAsc: Array<{ zM: number; twC: number }> = [];

  let segIdx = 0;
  for (let z = elevM; z <= topZ; z += stepM) {
    while (segIdx < nodes.length - 2 && nodes[segIdx + 1].zM < z) {
      segIdx++;
    }
    const n0 = nodes[segIdx];
    const n1 = nodes[Math.min(nodes.length - 1, segIdx + 1)];
    const span = Math.max(1, n1.zM - n0.zM);
    const frac = clamp((z - n0.zM) / span, 0, 1);
    const twInterp = n0.twC + (n1.twC - n0.twC) * frac;
    gridAsc.push({ zM: z, twC: twInterp });
  }

  // Integrate downward from top to surface
  let positiveMeJkg = 0;
  let negativeRefreezeJkg = 0;
  let wetBulbZeroM = gridAsc[gridAsc.length - 1].twC <= 0 ? 0 : topZ;
  let foundWb0 = false;
  let snowLineM = 0;
  let foundSnowLine = false;

  // Heavy precipitation diabatic cooling credit in J/kg
  const diabaticCreditJkg = heavyDiabaticDropM * 0.034;

  for (let k = gridAsc.length - 1; k >= 1; k--) {
    const hi = gridAsc[k];
    const lo = gridAsc[k - 1];
    const dz = hi.zM - lo.zM;
    const meanTw = 0.5 * (hi.twC + lo.twC);

    if (!foundWb0 && hi.twC <= 0 && lo.twC > 0) {
      const frac0 = (0 - lo.twC) / (hi.twC - lo.twC);
      wetBulbZeroM = lo.zM + frac0 * dz;
      foundWb0 = true;
    }

    if (meanTw > 0) {
      positiveMeJkg += (G0 * meanTw * dz) / 273.15;
    } else if (positiveMeJkg > 2.0 && meanTw < 0) {
      // Sub-freezing cold wedge underneath an elevated warm nose!
      negativeRefreezeJkg += (G0 * meanTw * dz) / 273.15;
    }

    const effMeAtLo = Math.max(0, positiveMeJkg - diabaticCreditJkg);
    if (!foundSnowLine && effMeAtLo >= 7.5) {
      snowLineM = lo.zM;
      foundSnowLine = true;
    }
  }

  if (!foundWb0) {
    wetBulbZeroM = gridAsc[0].twC <= 0 ? Math.max(0, elevM - Math.abs(gridAsc[0].twC) / 0.0055) : topZ;
  }
  const finalMeJkg = Math.max(0, positiveMeJkg - diabaticCreditJkg);
  if (!foundSnowLine) {
    // Even at `elevM`, `ME < 7.5 J/kg` -> extrapolate snow line below `elevM` if `twSfc > -1.0`
    if (twSfc <= 0) {
      // Sub-freezing at surface: snow line is at sea level (0m) or below surface along moist lapse
      const extraMarginM = Math.max(0, ((7.5 - finalMeJkg) * 273.15) / (G0 * 1.1) + Math.abs(twSfc) * 145);
      snowLineM = Math.max(0, elevM - extraMarginM);
    } else {
      const remJ = Math.max(0, 7.5 - finalMeJkg);
      const dropBelowSurfaceM = Math.sqrt((remJ * 273.15 * 2) / (G0 * 0.0055));
      snowLineM = Math.max(0, elevM - dropBelowSurfaceM);
    }
  }

  let columnPhase: BourgouinSnowLineResult["columnPhase"] = "snow";
  let iceSurvival = 1;

  if (finalMeJkg > 13.2 && negativeRefreezeJkg <= -14 && twSfc <= 0.1) {
    // Classic freezing rain (`FZRA`) warm nose aloft + shallow cold wedge at ground
    columnPhase = "freezing_rain";
    iceSurvival = 0;
  } else if (finalMeJkg > 13.2 && negativeRefreezeJkg <= -45) {
    // Deep cold wedge refreezes raindrops into ice pellets (`PL / sleet`)
    columnPhase = "sleet";
    iceSurvival = 0.35;
  } else if (finalMeJkg <= 5.6 && twSfc <= 1.25) {
    columnPhase = "snow";
    iceSurvival = clamp(1 - finalMeJkg / 18, 0.76, 1);
  } else if (finalMeJkg <= 13.8 && twSfc <= 1.75) {
    columnPhase = "sleet";
    iceSurvival = clamp(1 - (finalMeJkg - 4.2) / 10.5, 0.12, 0.75);
  } else {
    columnPhase = "rain";
    iceSurvival = 0;
  }

  return {
    snowLineElevationM: Math.max(0, Math.round(snowLineM)),
    wetBulbZeroM: Math.max(0, Math.round(wetBulbZeroM)),
    meltingEnergyJkg: Number(finalMeJkg.toFixed(1)),
    refreezeEnergyJkg: Number(negativeRefreezeJkg.toFixed(1)),
    iceSurvivalFraction: Number(iceSurvival.toFixed(3)),
    columnPhase
  };
}

// ============================================================================
// 2. DYNAMIC KUCHERA + DGZ (-12..-18°C) SNOW-TO-LIQUID RATIO & CRYSTAL QUALITY
// ============================================================================

export interface DynamicSlrInput {
  surfaceTempC: number;
  surfaceWetBulbC: number;
  surfaceWindKmh: number;
  temp850hPa: number | null;
  capeJkg: number;
  isDekActive: boolean;
  precipPhase: PrecipPhase;
  levels?: SoundingLevel[];
}

export interface DynamicSlrResult {
  slr: number; // e.g. 13.8 -> 13.8:1
  dgzBoostActive: boolean;
  snowQualityTr: SnowQualityLabelTr;
}

/** Saturation vapor pressure ratio (water / ice) for `-45°C <= T <= 0°C` to compute RH_ice */
function iceSupersaturationRatio(tempC: number, rhWaterPct: number): number {
  if (tempC >= 0) return rhWaterPct;
  const esWater = 6.112 * Math.exp((17.67 * tempC) / (tempC + 243.5));
  const esIce = 6.1115 * Math.exp((22.452 * tempC) / (tempC + 272.55));
  return rhWaterPct * (esWater / Math.max(0.05, esIce));
}

export function computeDynamicSnowLiquidRatio(
  input: DynamicSlrInput
): DynamicSlrResult {
  if (
    input.precipPhase !== "snow" &&
    input.precipPhase !== "sleet" &&
    input.surfaceWetBulbC > 2.0
  ) {
    return {
      slr: 0,
      dgzBoostActive: false,
      snowQualityTr: "Yok"
    };
  }

  // 1. Maximum lower-tropospheric column temperature below ~500 hPa (`z <= 5600 m`) for Kuchera baseline
  let tMaxColC = input.surfaceTempC;
  let dgzRhIceMax = 0;
  let hasSoundingDgz = false;

  if (input.levels && input.levels.length >= 2) {
    for (const lv of input.levels) {
      if (lv.pressure >= 500 && Number.isFinite(lv.temperature)) {
        tMaxColC = Math.max(tMaxColC, lv.temperature);
      }
      if (lv.temperature <= -10.5 && lv.temperature >= -19.5) {
        hasSoundingDgz = true;
        dgzRhIceMax = Math.max(
          dgzRhIceMax,
          iceSupersaturationRatio(lv.temperature, clamp(lv.humidity, 0, 100))
        );
      }
    }
  } else if (input.temp850hPa !== null && Number.isFinite(input.temp850hPa)) {
    tMaxColC = Math.max(input.surfaceTempC, input.temp850hPa);
    // Proxy DGZ saturation at ~700-650 hPa when 850 hPa is between -6°C and -14°C
    const estT700 = input.temp850hPa - 8.5;
    if (estT700 <= -10.5 && estT700 >= -19.5) {
      dgzRhIceMax = 104;
    }
  }

  // Kuchera formula in Kelvin relative to `271.16 K` (`-1.99°C`)
  const tMaxK = tMaxColC + 273.15;
  let slr =
    tMaxK > 271.16
      ? 12 + 2 * (271.16 - tMaxK)
      : 12 + 1.05 * (271.16 - tMaxK);

  slr = clamp(slr, 4.2, 20.5);

  // 2. Cobb-Waldstreicher (-12..-18°C) Dendritic Growth Zone (DGZ) ice-supersaturation boost
  const dgzBoostActive = dgzRhIceMax >= 96 || (!hasSoundingDgz && (input.temp850hPa ?? 5) <= -7.5 && input.surfaceTempC <= -0.5);
  if (dgzBoostActive && input.surfaceWetBulbC <= 0.2) {
    const dgzMult = dgzRhIceMax >= 108 ? 1.26 : 1.15;
    slr *= dgzMult;
  }

  // 3. Convective / DEK Graupel riming habit adjustment
  const isGraupelRegime =
    (input.capeJkg >= 110 || (input.isDekActive && input.capeJkg >= 45)) &&
    input.surfaceWetBulbC <= 0.8;
  if (isGraupelRegime) {
    // Rimed graupel / snow pellets pack slightly denser than pure stellar dendrites (`9.5..14.5:1`)
    slr = 0.65 * slr + 0.35 * 11.5;
  }

  // 4. Warm boundary-layer riming & wet-snow partial melt (`Tw > -0.5°C`)
  if (input.precipPhase === "sleet") {
    const wetFactor = clamp(1 - (input.surfaceWetBulbC + 0.3) * 0.42, 0.35, 0.78);
    slr = Math.min(slr, 8.2) * wetFactor;
  } else if (input.surfaceWetBulbC > -0.5) {
    const warmDamp = clamp(1 - (input.surfaceWetBulbC + 0.5) * 0.32, 0.48, 1);
    slr *= warmDamp;
  }

  // 5. Mechanical wind crystal fragmentation during saltation (`>= 26 km/h`)
  if (input.surfaceWindKmh > 26) {
    const fragFactor = clamp(1 - (input.surfaceWindKmh - 26) * 0.0055, 0.78, 1);
    slr *= fragFactor;
  }

  const finalSlr = Number(clamp(slr, 3.5, 22.0).toFixed(1));

  let snowQualityTr: SnowQualityLabelTr;
  if (input.precipPhase === "sleet") {
    snowQualityTr = "Sulu Kar / Sepken";
  } else if (isGraupelRegime) {
    snowQualityTr = "Graupel / Bulgur Kar";
  } else if (finalSlr >= 15.0 && input.surfaceTempC <= -1.2) {
    snowQualityTr = "Kristal Toz Kar";
  } else if (finalSlr >= 11.8 && input.surfaceWetBulbC <= -0.4) {
    snowQualityTr = "Kuru Kar";
  } else if (finalSlr >= 8.2) {
    snowQualityTr = "Nemli Örtü Karı";
  } else {
    snowQualityTr = "Ağır Islak Kar";
  }

  return {
    slr: finalSlr,
    dgzBoostActive,
    snowQualityTr
  };
}

// ============================================================================
// 3. SEA-EFFECT SNOW (DEK), BLACK ICE & BLOWING SNOW DIAGNOSTICS
// ============================================================================

export function evaluateSeaEffectSnow(params: {
  lat: number;
  lon: number;
  seaSurfaceTempC: number | null;
  temp850hPa: number | null;
  surfaceTempC: number;
  windSpeedKmh: number;
  windDirDeg: number;
  precipMmHr: number;
}): { status: DekSnowStatus; deltaTSst850C: number | null } {
  const { lat, lon, seaSurfaceTempC, temp850hPa, surfaceTempC, windSpeedKmh, windDirDeg } = params;
  if (temp850hPa === null || !Number.isFinite(temp850hPa)) {
    return { status: "none", deltaTSst850C: null };
  }

  // Marmara / Black Sea / Aegean-Northern Anatolian coastal corridor check
  const isMarmaraBlackSeaBelt = lat >= 39.6 && lat <= 42.6 && lon >= 26.2 && lon <= 41.8;
  const effSst =
    seaSurfaceTempC !== null && Number.isFinite(seaSurfaceTempC)
      ? seaSurfaceTempC
      : isMarmaraBlackSeaBelt
        ? 10.5
        : null;

  if (effSst === null) {
    return { status: "none", deltaTSst850C: null };
  }

  const deltaT = Number((effSst - temp850hPa).toFixed(1));
  // Onshore northerly sector (`305°..70°`: Karayel, Yıldız, Poyraz)
  const normDir = (((windDirDeg % 360) + 360) % 360);
  const isNortherlyFetch = normDir >= 305 || normDir <= 70;

  if (!isNortherlyFetch || surfaceTempC > 4.5 || windSpeedKmh < 9 || deltaT < 11.5) {
    return { status: "none", deltaTSst850C: deltaT };
  }

  if (deltaT >= 16.0 && surfaceTempC <= 2.5 && (params.precipMmHr >= 0.25 || windSpeedKmh >= 18)) {
    return { status: "heavy_dek", deltaTSst850C: deltaT };
  }
  if (deltaT >= 13.0 && surfaceTempC <= 3.5) {
    return { status: "moderate_dek", deltaTSst850C: deltaT };
  }
  return { status: "watch", deltaTSst850C: deltaT };
}

const ICING_SEVERITY_RANK: Record<RoadIcingRisk, number> = {
  none: 0,
  low: 1,
  high: 2,
  black_ice: 3
};

const BLOWING_SEVERITY_RANK: Record<BlowingSnowRisk, number> = {
  none: 0,
  drifting: 1,
  blizzard: 2
};

const DEK_SEVERITY_RANK: Record<DekSnowStatus, number> = {
  none: 0,
  watch: 1,
  moderate_dek: 2,
  heavy_dek: 3
};

export function maxIcingRisk(a: RoadIcingRisk, b: RoadIcingRisk): RoadIcingRisk {
  return ICING_SEVERITY_RANK[b] > ICING_SEVERITY_RANK[a] ? b : a;
}

export function maxBlowingSnowRisk(
  a: BlowingSnowRisk,
  b: BlowingSnowRisk
): BlowingSnowRisk {
  return BLOWING_SEVERITY_RANK[b] > BLOWING_SEVERITY_RANK[a] ? b : a;
}

export function maxDekStatus(a: DekSnowStatus, b: DekSnowStatus): DekSnowStatus {
  return DEK_SEVERITY_RANK[b] > DEK_SEVERITY_RANK[a] ? b : a;
}

// ============================================================================
// 4. COUPLED 2-SURFACE (GRASS/SOIL vs. ASPHALT/ROAD) SNOW TIMELINE SIMULATOR
// ============================================================================

export interface AntecedentThermalHour {
  temp2mC: number;
  shortwaveWm2: number;
  cloudCoverPct: number;
  precipMmHr: number;
}

export interface SnowSimulationHourInput {
  timeIso: string;
  dateYmd: string;
  leadHour: number;
  elevationM: number;
  lat: number;
  lon: number;
  temp2mC: number;
  tempP10C?: number;
  tempP90C?: number;
  rh2mPct: number;
  wetBulbC: number;
  windSpeedKmh: number;
  windGustsKmh: number;
  windDirDeg: number;
  cloudCoverPct: number;
  solarElevationDeg: number;
  shortwaveWm2: number;
  precipMmHr: number;
  precipP90MmHr: number;
  precipProbPct: number;
  rawModelSnowfallCm: number;
  precipPhase: PrecipPhase;
  freezingLevelM: number | null;
  temp850hPa: number | null;
  capeJkg: number;
  seaSurfaceTempC: number | null;
  soundingLevels?: SoundingLevel[];
  lapseRateCPerKm?: number;
  /** Optional ensemble temperature members at this hour for exact snow probability */
  ensembleTempMembersC?: number[] | null;
}

export interface SimulatedSnowHourOutput {
  snowLineElevationM: number;
  wetBulbZeroM: number;
  meltingEnergyJkg: number;
  /** Refined hydrometeor phase (fixes warm sleet misclassified as pure snow) */
  refinedPhase: PrecipPhase;
  /** Probability (%) of observing snowflakes in the air during this hour */
  airSnowProbPct: number;
  /** In-air snowfall during this hour (cm) */
  airSnowCm: number;
  /** P90 upper-bound in-air snowfall (cm) */
  airSnowP90Cm: number;
  /** New snow sticking on grass / natural soil this hour (cm) */
  groundSnowCm: number;
  /** P90 upper-bound ground snow sticking (cm) */
  groundSnowP90Cm: number;
  /** New snow sticking on untreated asphalt / road this hour (cm) */
  roadSnowCm: number;
  /** Surviving snowpack depth on grass/soil at end of hour after melt & compaction (cm) */
  snowpackDepthCm: number;
  /** Surviving snow depth on asphalt/road at end of hour (cm) */
  roadSnowDepthCm: number;
  /** Running cumulative in-air snowfall from T0 (cm) */
  cumulativeAirSnowCm: number;
  /** Running cumulative ground-sticking snow from T0 (cm) */
  cumulativeGroundSnowCm: number;
  soilTempC: number;
  roadTempC: number;
  slr: number;
  snowQualityTr: SnowQualityLabelTr;
  icingRisk: RoadIcingRisk;
  blowingSnowRisk: BlowingSnowRisk;
  dekStatus: DekSnowStatus;
  dekDeltaTSst850C: number | null;
  elevationBands: ElevationSnowBand[];
}

interface SurfaceThermalState {
  soilTempC: number;
  roadTempC: number;
  soilSweMm: number;
  soilDepthCm: number;
  roadSweMm: number;
  roadDepthCm: number;
  roadWetFilmMm: number;
}

function stepSurfaceSnowEnergyBalance(
  state: SurfaceThermalState,
  params: {
    temp2mC: number;
    wetBulbC: number;
    windSpeedKmh: number;
    cloudCoverPct: number;
    shortwaveWm2: number;
    liquidRainMm: number;
    fallingSnowSweMm: number;
    slr: number;
    isFreezingRain: boolean;
  }
): {
  groundSnowNewCm: number;
  roadSnowNewCm: number;
  icingRisk: RoadIcingRisk;
} {
  const {
    temp2mC,
    wetBulbC,
    windSpeedKmh,
    cloudCoverPct,
    shortwaveWm2,
    liquidRainMm,
    fallingSnowSweMm,
    slr,
    isFreezingRain
  } = params;

  const windMs = Math.max(0.5, windSpeedKmh / 3.6);
  const cloudFrac = clamp(cloudCoverPct / 100, 0, 1);

  // Net longwave radiative cooling (`W/m^2`): clear skies radiate strongly to space (~68 W/m^2), overcast ~10 W/m^2
  const netLongwaveLossWm2 = 68 * (1 - 0.84 * Math.pow(cloudFrac, 1.25));

  // Albedo switches sharply once snow covers the surface!
  const soilAlbedo = state.soilDepthCm >= 1.2 ? 0.74 : state.soilDepthCm > 0.15 ? 0.52 : 0.24;
  const roadAlbedo = state.roadDepthCm >= 1.0 ? 0.66 : state.roadDepthCm > 0.15 ? 0.42 : 0.12;

  const swSoilWm2 = shortwaveWm2 * (1 - soilAlbedo);
  const swRoadWm2 = shortwaveWm2 * (1 - roadAlbedo);

  // Sensible convective exchange (`W / (m^2 · K)`)
  const hConvSoil = 5.5 + 2.4 * Math.pow(windMs, 0.8);
  const hConvRoad = 6.5 + 2.8 * Math.pow(windMs, 0.8);

  // Rain-on-snow advective heat (`c_w = 4186 J/(kg·K)` -> `1.16 W·h/(m^2·K)` per mm of rain)
  const rainHeatWh = liquidRainMm > 0 && temp2mC > 0 ? liquidRainMm * temp2mC * 1.16 : 0;

  // --- 1. EVOLVE UNCOVERED / SUB-SNOW SKIN TEMPERATURES BEFORE PRECIPITATION ---
  if (state.soilDepthCm < 0.25) {
    const netForcingSoil = swSoilWm2 - netLongwaveLossWm2 + hConvSoil * (temp2mC - state.soilTempC);
    // Effective thermal heat capacity of top 4 cm grass/soil skin (~1.45e5 J/(m^2·K) -> ~40.3 W·h/(m^2·K))
    state.soilTempC = clamp(state.soilTempC + netForcingSoil / 40.3, -24, 48);
  } else {
    // Under insulating snowpack, soil skin relaxes gently toward `0.0°C` from below
    state.soilTempC = clamp(state.soilTempC + (0.15 - state.soilTempC) * 0.08, -8, 2.5);
  }

  if (state.roadDepthCm < 0.25) {
    // Urban / traffic + subsurface conductive heat keeps bare asphalt slightly warmer than grass (~5 W/m^2 baseline)
    const netForcingRoad = 4.5 + swRoadWm2 - netLongwaveLossWm2 + hConvRoad * (temp2mC - state.roadTempC);
    // Top 5 cm dense asphalt skin (~1.95e5 J/(m^2·K) -> ~54.2 W·h/(m^2·K))
    state.roadTempC = clamp(state.roadTempC + netForcingRoad / 54.2, -22, 56);
  } else {
    state.roadTempC = clamp(state.roadTempC + (0.25 - state.roadTempC) * 0.09, -8, 3.0);
  }

  // Track wet film on road from rain or recent melt (evaporates gradually)
  const evapRoadMm = clamp(0.06 + windMs * 0.02 + swRoadWm2 * 0.0006, 0.04, 0.45);
  state.roadWetFilmMm = clamp(state.roadWetFilmMm + liquidRainMm - evapRoadMm, 0, 3.5);

  // --- 2. INCOMING SNOWFALL STICKING vs. CONTACT MELTING ---
  let groundSnowNewCm = 0;
  let roadSnowNewCm = 0;
  const effSlr = slr > 0 ? slr : 10;

  if (fallingSnowSweMm > 0.005) {
    // Available melt energy on grass/soil (`W·h/m^2`)
    const soilCondHeatWh = state.soilTempC > 0 ? state.soilTempC * 26.5 : 0;
    const soilAirHeatWh = wetBulbC > 0 ? wetBulbC * hConvSoil * 0.75 : 0;
    const soilSolarMeltWh = swSoilWm2 * 0.55;
    const totalSoilMeltWh = Math.max(
      0,
      soilCondHeatWh + soilAirHeatWh + soilSolarMeltWh + rainHeatWh - (state.soilTempC <= 0 ? netLongwaveLossWm2 * 0.35 : 0)
    );
    const soilMeltCapSweMm = totalSoilMeltWh / MELT_ENERGY_PER_MM_WH;
    const meltedOnSoilMm = Math.min(fallingSnowSweMm, soilMeltCapSweMm);
    const survivingSoilSweMm = Math.max(0, fallingSnowSweMm - meltedOnSoilMm);

    // CRITICAL LATENT HEAT EXTRACTION: melting snow chills the warm soil skin directly!
    if (meltedOnSoilMm > 0) {
      const latentChillingC = (meltedOnSoilMm * MELT_ENERGY_PER_MM_WH) / 40.3;
      state.soilTempC = Math.max(-0.2, state.soilTempC - latentChillingC);
    }

    groundSnowNewCm = survivingSoilSweMm * (effSlr / 10);
    state.soilSweMm += survivingSoilSweMm;
    state.soilDepthCm += groundSnowNewCm;

    // Available melt energy on asphalt/road (`W·h/m^2` — higher thermal inertia + lower albedo!)
    const roadCondHeatWh = state.roadTempC > 0 ? state.roadTempC * 38.0 : 0;
    const roadAirHeatWh = wetBulbC > 0 ? wetBulbC * hConvRoad * 0.85 : 0;
    const roadSolarMeltWh = swRoadWm2 * 0.72;
    const totalRoadMeltWh = Math.max(
      0,
      roadCondHeatWh + roadAirHeatWh + roadSolarMeltWh + rainHeatWh + 3.5 - (state.roadTempC <= 0 ? netLongwaveLossWm2 * 0.3 : 0)
    );
    const roadMeltCapSweMm = totalRoadMeltWh / MELT_ENERGY_PER_MM_WH;
    const meltedOnRoadMm = Math.min(fallingSnowSweMm, roadMeltCapSweMm);
    const survivingRoadSweMm = Math.max(0, fallingSnowSweMm - meltedOnRoadMm);

    if (meltedOnRoadMm > 0) {
      const latentRoadChillC = (meltedOnRoadMm * MELT_ENERGY_PER_MM_WH) / 54.2;
      state.roadTempC = Math.max(-0.2, state.roadTempC - latentRoadChillC);
      state.roadWetFilmMm = clamp(state.roadWetFilmMm + meltedOnRoadMm, 0, 3.5);
    }

    roadSnowNewCm = survivingRoadSweMm * (effSlr / 10);
    state.roadSweMm += survivingRoadSweMm;
    state.roadDepthCm += roadSnowNewCm;
  }

  // --- 3. SNOWPACK SETTLING (COMPACTION) & EXISTING PACK ABLATION ---
  if (state.soilSweMm > 0.01) {
    // Metamorphic + overburden settling approaches max density (~3.5:1 equivalent depth-to-SWE)
    const minCompactedDepthCm = state.soilSweMm * 0.36;
    const settleRate = temp2mC >= 0 ? 0.032 : 0.014;
    state.soilDepthCm = Math.max(
      minCompactedDepthCm,
      state.soilDepthCm - (state.soilDepthCm - minCompactedDepthCm) * settleRate
    );

    // Ablation when air/solar/rain energy is positive and snow isn't actively accumulating faster
    const packMeltWh =
      (temp2mC > 0.2 ? (temp2mC - 0.2) * hConvSoil * 0.52 : 0) +
      Math.max(0, swSoilWm2 - netLongwaveLossWm2 * 0.6) * 0.42 +
      rainHeatWh;
    if (packMeltWh > 4) {
      const packMeltMm = Math.min(state.soilSweMm, packMeltWh / MELT_ENERGY_PER_MM_WH);
      const fracLost = packMeltMm / Math.max(0.01, state.soilSweMm);
      state.soilSweMm = Math.max(0, state.soilSweMm - packMeltMm);
      state.soilDepthCm = Math.max(0, state.soilDepthCm * (1 - fracLost));
    }
    if (state.soilSweMm < 0.02) {
      state.soilSweMm = 0;
      state.soilDepthCm = 0;
    }
  }

  if (state.roadSweMm > 0.01) {
    const minRoadCompactedCm = state.roadSweMm * 0.32;
    state.roadDepthCm = Math.max(
      minRoadCompactedCm,
      state.roadDepthCm - (state.roadDepthCm - minRoadCompactedCm) * 0.045
    );
    const roadPackMeltWh =
      (temp2mC > 0.0 ? temp2mC * hConvRoad * 0.62 : 0) +
      Math.max(0, swRoadWm2 - netLongwaveLossWm2 * 0.5) * 0.58 +
      rainHeatWh +
      4.0;
    if (roadPackMeltWh > 4) {
      const meltMm = Math.min(state.roadSweMm, roadPackMeltWh / MELT_ENERGY_PER_MM_WH);
      const fracLost = meltMm / Math.max(0.01, state.roadSweMm);
      state.roadSweMm = Math.max(0, state.roadSweMm - meltMm);
      state.roadDepthCm = Math.max(0, state.roadDepthCm * (1 - fracLost));
      state.roadWetFilmMm = clamp(state.roadWetFilmMm + meltMm, 0, 3.5);
    }
    if (state.roadSweMm < 0.02) {
      state.roadSweMm = 0;
      state.roadDepthCm = 0;
    }
  }

  // --- 4. BLACK ICE & PAVEMENT GLAZE DIAGNOSTICS ---
  let icingRisk: RoadIcingRisk = "none";
  if (isFreezingRain && liquidRainMm >= 0.08) {
    icingRisk = "black_ice";
  } else if (state.roadTempC <= -0.2 && state.roadWetFilmMm >= 0.12 && state.roadDepthCm < 0.8) {
    // Classic invisible Black Ice: wet road film refreezing with little/no visible white snow cover!
    icingRisk = "black_ice";
  } else if (state.roadTempC <= 0.1 && (state.roadDepthCm >= 0.4 || state.roadWetFilmMm >= 0.08)) {
    icingRisk = state.roadTempC <= -1.2 ? "high" : "low";
  } else if (temp2mC <= 1.0 && state.roadTempC <= 0.6 && state.roadWetFilmMm >= 0.15) {
    icingRisk = "low";
  }

  return {
    groundSnowNewCm: Number(groundSnowNewCm.toFixed(2)),
    roadSnowNewCm: Number(roadSnowNewCm.toFixed(2)),
    icingRisk
  };
}

// ============================================================================
// 5. 4-TIER TOPOGRAPHIC SNOW CROSS-SECTION (`Kıyı / Merkez / Yamaç / Zirve`)
// ============================================================================

export function buildElevationBandSpecs(
  lat: number,
  lon: number,
  cityElevationM: number
): Array<{ id: string; labelTr: string; elevationM: number; orographicBoost: number }> {
  const isBursaDomain = lat >= 39.85 && lat <= 40.55 && lon >= 28.35 && lon <= 29.75;
  if (isBursaDomain) {
    return [
      { id: "coast", labelTr: "Mudanya / Kıyı", elevationM: 15, orographicBoost: 0.92 },
      {
        id: "center",
        labelTr:
          Math.abs((cityElevationM || 100) - 100) <= 25
            ? "Bursa Merkez (17116 · Ova)"
            : "Seçili Bursa Noktası",
        elevationM: clamp(Math.round(cityElevationM || 100), 65, 320),
        orographicBoost: 1.0
      },
      { id: "foothill", labelTr: "Çekirge – İnkaya Yamaç", elevationM: 550, orographicBoost: 1.18 },
      { id: "summit", labelTr: "Uludağ Oteller / Zirve", elevationM: 1850, orographicBoost: 1.52 }
    ];
  }

  const baseElev = Math.max(0, Math.round(cityElevationM));
  const lowElev = baseElev >= 140 ? Math.max(0, Math.round((baseElev - 140) / 10) * 10) : 0;
  return [
    {
      id: "low",
      labelTr: lowElev === 0 ? "Kıyı / Deniz Seviyesi" : "Alt Havza",
      elevationM: lowElev,
      orographicBoost: 0.95
    },
    { id: "center", labelTr: "Şehir Merkezi", elevationM: baseElev, orographicBoost: 1.0 },
    {
      id: "foothill",
      labelTr: "Yüksek Semt / Yamaç",
      elevationM: baseElev + 350,
      orographicBoost: 1.15
    },
    {
      id: "summit",
      labelTr: "Dağ / Zirve Kuşağı",
      elevationM: baseElev + 1200,
      orographicBoost: 1.42
    }
  ];
}

/**
 * Computes falling snow liquid-water equivalent (`SWE_mm`), snow probability (`%`), and refined phase
 * at any elevation given thermal & Bourgouin parameters.
 */
function diagnoseFallingSnowAtPoint(params: {
  tempC: number;
  rhPct: number;
  wetBulbC: number;
  precipMmHr: number;
  precipProbPct: number;
  rawModelSnowfallCm: number;
  bourgouin: BourgouinSnowLineResult;
  basePhase: PrecipPhase;
  ensembleTempMembersC?: number[] | null;
  tempP10C?: number;
  tempP90C?: number;
}): {
  refinedPhase: PrecipPhase;
  airSnowSweMm: number;
  liquidRainMm: number;
  airSnowProbPct: number;
} {
  const {
    tempC,
    wetBulbC,
    precipMmHr,
    precipProbPct,
    rawModelSnowfallCm,
    bourgouin,
    basePhase,
    ensembleTempMembersC,
    tempP10C,
    tempP90C
  } = params;

  // Compute thermal probability `P(snow phase | wet)` from 212-member ensemble or P10-P90 spread
  let thermalSnowProb = 0;
  if (ensembleTempMembersC && ensembleTempMembersC.length >= 6) {
    const dewSpread = Math.max(0, tempC - wetBulbC);
    const coldMembers = ensembleTempMembersC.filter((tM) => tM - dewSpread * 0.75 <= 1.25).length;
    thermalSnowProb = coldMembers / ensembleTempMembersC.length;
  } else {
    const sigmaT =
      tempP10C !== undefined && tempP90C !== undefined
        ? Math.max(0.65, (tempP90C - tempP10C) / 2.56)
        : 1.1;
    // Logistic approximation to Gaussian CDF around `Tw = 0.85°C`
    const z = (0.85 - wetBulbC) / sigmaT;
    thermalSnowProb = 1 / (1 + Math.exp(-1.7 * z));
  }

  // Modulate by Bourgouin ice survival if warm nose aloft exists
  if (bourgouin.columnPhase === "freezing_rain") {
    thermalSnowProb *= 0.15;
  } else if (bourgouin.meltingEnergyJkg > 15) {
    thermalSnowProb *= 0.08;
  }

  const airSnowProbPct = Math.round(
    clamp((precipProbPct / 100) * thermalSnowProb * 100, 0, 99)
  );

  if (precipMmHr < 0.04 && rawModelSnowfallCm < 0.04) {
    return {
      refinedPhase: "none",
      airSnowSweMm: 0,
      liquidRainMm: 0,
      airSnowProbPct
    };
  }

  if (basePhase === "hail") {
    return {
      refinedPhase: "hail",
      airSnowSweMm: 0,
      liquidRainMm: precipMmHr,
      airSnowProbPct: Math.min(12, airSnowProbPct)
    };
  }

  if (basePhase === "freezing_rain" || bourgouin.columnPhase === "freezing_rain") {
    return {
      refinedPhase: "freezing_rain",
      airSnowSweMm: 0,
      liquidRainMm: precipMmHr,
      airSnowProbPct
    };
  }

  // Determine exact frozen snow crystal fraction (`0..1`) vs liquid rain fraction!
  // Eliminates the legacy bug where `+1.5°C` wet sleet added `precip * 0.8` directly to snow!
  let snowFraction = 0;
  let refinedPhase: PrecipPhase = basePhase;

  if (wetBulbC <= 0.15 && bourgouin.meltingEnergyJkg <= 6.8) {
    snowFraction = clamp(bourgouin.iceSurvivalFraction, 0.85, 1.0);
    refinedPhase = "snow";
  } else if (wetBulbC <= 0.85 && bourgouin.meltingEnergyJkg <= 10.5) {
    // Wet snow / snow-dominant mix
    const twFrac = clamp(1 - (wetBulbC - 0.05) * 0.62, 0.42, 0.92);
    snowFraction = Math.min(twFrac, Math.max(0.35, bourgouin.iceSurvivalFraction));
    refinedPhase = snowFraction >= 0.65 ? "snow" : "sleet";
  } else if (wetBulbC <= 1.65 && bourgouin.meltingEnergyJkg <= 14.2) {
    // Rain-dominant sleet (`karla karışık yağmur`): visible flakes in air (`12%..40%`), mostly liquid!
    snowFraction = clamp(0.42 - (wetBulbC - 0.85) * 0.38, 0.08, 0.42);
    refinedPhase = "sleet";
  } else {
    snowFraction = 0;
    refinedPhase = "rain";
  }

  // Cross-check with NWP `rawModelSnowfallCm` ONLY when column thermally permits snow (`Tw <= 1.65°C` and `ME <= 14.5`)
  let airSnowSweMm = precipMmHr * snowFraction;
  if (snowFraction > 0.25 && rawModelSnowfallCm > 0.05 && wetBulbC <= 1.1) {
    const impliedModelSwe = rawModelSnowfallCm * 0.95; // Open-Meteo `snowfall` uses 7:1..10:1 cm convention
    airSnowSweMm = Math.max(airSnowSweMm, Math.min(precipMmHr * 1.05, impliedModelSwe * snowFraction));
  }

  const liquidRainMm = Math.max(0, precipMmHr - airSnowSweMm);

  return {
    refinedPhase,
    airSnowSweMm,
    liquidRainMm,
    airSnowProbPct: Math.max(
      airSnowProbPct,
      airSnowSweMm >= 0.08 ? Math.min(96, Math.round(precipProbPct * Math.max(0.55, snowFraction))) : 0
    )
  };
}

/**
 * Runs the complete coupled multi-day hourly snow simulation across all forecast hours (`0..359h`).
 */
export function simulateCoupledSnowTimeline(params: {
  hours: SnowSimulationHourInput[];
  antecedentHours?: AntecedentThermalHour[];
}): SimulatedSnowHourOutput[] {
  const { hours, antecedentHours = [] } = params;
  if (hours.length === 0) return [];

  const first = hours[0];
  const bandSpecs = buildElevationBandSpecs(first.lat, first.lon, first.elevationM);

  // Initialize antecedent thermal memory from past 24-48h observations/models!
  let initSoilT = clamp(first.temp2mC * 0.85 + 1.0, -6, 28);
  let initRoadT = clamp(first.temp2mC * 0.9 + 1.6, -5, 32);

  if (antecedentHours.length >= 4) {
    const meanPastT =
      antecedentHours.reduce((acc, h) => acc + h.temp2mC, 0) / antecedentHours.length;
    initSoilT = clamp(meanPastT * 0.78 + first.temp2mC * 0.22 + 0.5, -8, 30);
    initRoadT = clamp(meanPastT * 0.72 + first.temp2mC * 0.28 + 1.1, -7, 34);
  }

  const mainState: SurfaceThermalState = {
    soilTempC: initSoilT,
    roadTempC: initRoadT,
    soilSweMm: 0,
    soilDepthCm: 0,
    roadSweMm: 0,
    roadDepthCm: 0,
    roadWetFilmMm: antecedentHours.slice(-6).some((h) => h.precipMmHr >= 0.15) ? 0.45 : 0
  };

  // Independent coupled surface states for each of the 4 topographic elevation bands!
  const lapseInitPerM = clamp((first.lapseRateCPerKm ?? 6.2) / 1000, 0.0045, 0.0082);
  const bandStates: SurfaceThermalState[] = bandSpecs.map((b) => {
    const dz = b.elevationM - first.elevationM;
    const dTemp = -dz * lapseInitPerM;
    return {
      soilTempC: clamp(initSoilT + dTemp * 0.9, -14, 30),
      roadTempC: clamp(initRoadT + dTemp * 0.9, -13, 34),
      soilSweMm: 0,
      soilDepthCm: 0,
      roadSweMm: 0,
      roadDepthCm: 0,
      roadWetFilmMm: mainState.roadWetFilmMm
    };
  });

  // Warm up `mainState` over the last 24 antecedent hours if provided so daytime solar pavement heat is exact!
  const warmupSlice = antecedentHours.slice(-24);
  for (const ah of warmupSlice) {
    const wb = wetBulbStullC(ah.temp2mC, 72);
    stepSurfaceSnowEnergyBalance(mainState, {
      temp2mC: ah.temp2mC,
      wetBulbC: wb,
      windSpeedKmh: 10,
      cloudCoverPct: ah.cloudCoverPct,
      shortwaveWm2: ah.shortwaveWm2,
      liquidRainMm: ah.temp2mC > 1 ? ah.precipMmHr : 0,
      fallingSnowSweMm: 0,
      slr: 10,
      isFreezingRain: false
    });
  }

  let cumulativeAirSnowCm = 0;
  let cumulativeGroundSnowCm = 0;
  const outputs: SimulatedSnowHourOutput[] = [];

  for (let idx = 0; idx < hours.length; idx++) {
    const h = hours[idx];
    const lapsePerM = clamp((h.lapseRateCPerKm ?? 6.2) / 1000, 0.0042, 0.0085);

    const bourgouin = solveBourgouinSnowLine({
      elevationM: h.elevationM,
      surfaceTempC: h.temp2mC,
      surfaceRhPct: h.rh2mPct,
      precipMmHr: h.precipMmHr,
      freezingLevelM: h.freezingLevelM,
      temp850hPa: h.temp850hPa,
      levels: h.soundingLevels,
      lapseRateCPerKm: h.lapseRateCPerKm
    });

    const dekEval = evaluateSeaEffectSnow({
      lat: h.lat,
      lon: h.lon,
      seaSurfaceTempC: h.seaSurfaceTempC,
      temp850hPa: h.temp850hPa,
      surfaceTempC: h.temp2mC,
      windSpeedKmh: h.windSpeedKmh,
      windDirDeg: h.windDirDeg,
      precipMmHr: h.precipMmHr
    });

    const snowDiag = diagnoseFallingSnowAtPoint({
      tempC: h.temp2mC,
      rhPct: h.rh2mPct,
      wetBulbC: h.wetBulbC,
      precipMmHr: h.precipMmHr,
      precipProbPct: h.precipProbPct,
      rawModelSnowfallCm: h.rawModelSnowfallCm,
      bourgouin,
      basePhase: h.precipPhase,
      ensembleTempMembersC: h.ensembleTempMembersC,
      tempP10C: h.tempP10C,
      tempP90C: h.tempP90C
    });

    const slrEval = computeDynamicSnowLiquidRatio({
      surfaceTempC: h.temp2mC,
      surfaceWetBulbC: h.wetBulbC,
      surfaceWindKmh: h.windSpeedKmh,
      temp850hPa: h.temp850hPa,
      capeJkg: h.capeJkg,
      isDekActive: dekEval.status === "moderate_dek" || dekEval.status === "heavy_dek",
      precipPhase: snowDiag.refinedPhase,
      levels: h.soundingLevels
    });

    const effSlr = slrEval.slr > 0 ? slrEval.slr : 10;
    const airSnowCm = Number((snowDiag.airSnowSweMm * (effSlr / 10)).toFixed(2));

    // P90 upper-bound snow (accounts for cold-tail ensemble member + P90 precip intensity)
    const p90WetBulb =
      h.tempP10C !== undefined
        ? wetBulbStullC(h.tempP10C, Math.min(98, h.rh2mPct + 8))
        : h.wetBulbC - 1.2;
    const p90SnowFrac =
      p90WetBulb <= 0.3 ? 1.0 : p90WetBulb <= 1.5 ? clamp(1 - (p90WetBulb - 0.3) * 0.7, 0.15, 0.95) : 0;
    const p90Slr = Math.min(20, Math.max(effSlr, p90WetBulb <= -2 ? 14 : 10.5));
    const airSnowP90Cm = Number(
      Math.max(airSnowCm, h.precipP90MmHr * p90SnowFrac * (p90Slr / 10)).toFixed(2)
    );

    const stepRes = stepSurfaceSnowEnergyBalance(mainState, {
      temp2mC: h.temp2mC,
      wetBulbC: h.wetBulbC,
      windSpeedKmh: h.windSpeedKmh,
      cloudCoverPct: h.cloudCoverPct,
      shortwaveWm2: h.shortwaveWm2,
      liquidRainMm: snowDiag.liquidRainMm,
      fallingSnowSweMm: snowDiag.airSnowSweMm,
      slr: effSlr,
      isFreezingRain: snowDiag.refinedPhase === "freezing_rain"
    });

    const stickRatioP90 =
      airSnowCm > 0.05
        ? clamp(stepRes.groundSnowNewCm / airSnowCm, p90WetBulb <= 0.1 ? 0.65 : 0.25, 1)
        : p90WetBulb <= 0.0 && mainState.soilTempC <= 1.2
          ? 0.78
          : p90WetBulb <= 0.8
            ? 0.42
            : 0;
    const groundSnowP90Cm = Number(
      Math.max(stepRes.groundSnowNewCm, airSnowP90Cm * stickRatioP90).toFixed(2)
    );

    // Step all 4 elevation bands in lockstep!
    const hourElevationBands: ElevationSnowBand[] = bandSpecs.map((spec, bIdx) => {
      const dz = spec.elevationM - h.elevationM;
      const bTemp = Number((h.temp2mC - dz * lapsePerM).toFixed(1));
      const bRh = clamp(Math.round(h.rh2mPct + (dz > 0 ? Math.min(18, dz * 0.012) : dz * 0.008)), 20, 100);
      const bTw = Number(wetBulbStullC(bTemp, bRh).toFixed(1));
      const bPrecip = Number((h.precipMmHr * (dz > 0 ? spec.orographicBoost : spec.orographicBoost)).toFixed(2));

      const bBourgouin = solveBourgouinSnowLine({
        elevationM: spec.elevationM,
        surfaceTempC: bTemp,
        surfaceRhPct: bRh,
        precipMmHr: bPrecip,
        freezingLevelM: h.freezingLevelM,
        temp850hPa: h.temp850hPa,
        levels: h.soundingLevels,
        lapseRateCPerKm: h.lapseRateCPerKm
      });

      const bBasePhase: PrecipPhase =
        bPrecip < 0.04
          ? "none"
          : bBourgouin.columnPhase === "freezing_rain"
            ? "freezing_rain"
            : bTw <= 0.4
              ? "snow"
              : bTw <= 1.6
                ? "sleet"
                : "rain";

      const bDiag = diagnoseFallingSnowAtPoint({
        tempC: bTemp,
        rhPct: bRh,
        wetBulbC: bTw,
        precipMmHr: bPrecip,
        precipProbPct: clamp(Math.round(h.precipProbPct * (dz > 250 ? 1.12 : 1)), 0, 99),
        rawModelSnowfallCm: 0,
        bourgouin: bBourgouin,
        basePhase: bBasePhase,
        tempP10C: h.tempP10C !== undefined ? h.tempP10C - dz * lapsePerM : undefined,
        tempP90C: h.tempP90C !== undefined ? h.tempP90C - dz * lapsePerM : undefined
      });

      const bSlrEval = computeDynamicSnowLiquidRatio({
        surfaceTempC: bTemp,
        surfaceWetBulbC: bTw,
        surfaceWindKmh: h.windSpeedKmh * (dz > 500 ? 1.25 : 1),
        temp850hPa: h.temp850hPa,
        capeJkg: h.capeJkg,
        isDekActive: dekEval.status === "moderate_dek" || dekEval.status === "heavy_dek",
        precipPhase: bDiag.refinedPhase,
        levels: h.soundingLevels
      });

      const bEffSlr = bSlrEval.slr > 0 ? bSlrEval.slr : 10;
      const bAirSnowCm = Number((bDiag.airSnowSweMm * (bEffSlr / 10)).toFixed(2));
      const bStep = stepSurfaceSnowEnergyBalance(bandStates[bIdx], {
        temp2mC: bTemp,
        wetBulbC: bTw,
        windSpeedKmh: h.windSpeedKmh * (dz > 500 ? 1.22 : 1),
        cloudCoverPct: h.cloudCoverPct,
        shortwaveWm2: h.shortwaveWm2,
        liquidRainMm: bDiag.liquidRainMm,
        fallingSnowSweMm: bDiag.airSnowSweMm,
        slr: bEffSlr,
        isFreezingRain: bDiag.refinedPhase === "freezing_rain"
      });

      return {
        id: spec.id,
        labelTr: spec.labelTr,
        elevationM: spec.elevationM,
        tempMeanC: bTemp,
        wetBulbMeanC: bTw,
        precipPhase: bDiag.refinedPhase,
        snowProbPct: bDiag.airSnowProbPct,
        airSnowCm: bAirSnowCm,
        groundSnowCm: Number(bStep.groundSnowNewCm.toFixed(1)),
        roadSnowCm: Number(bStep.roadSnowNewCm.toFixed(1)),
        maxSnowpackCm: Number(bandStates[bIdx].soilDepthCm.toFixed(1)),
        slr: bSlrEval.slr,
        snowQualityTr: bSlrEval.snowQualityTr
      };
    });

    // Li & Pomeroy (1997) Blowing Snow / Blizzard threshold
    let blowingSnowRisk: BlowingSnowRisk = "none";
    const hasLooseSnow =
      airSnowCm >= 0.25 || (mainState.soilDepthCm >= 1.5 && h.temp2mC <= 0.4);
    if (hasLooseSnow) {
      if (h.windGustsKmh >= 52 && (airSnowCm >= 0.8 || h.windSpeedKmh >= 34)) {
        blowingSnowRisk = "blizzard";
      } else if (h.windGustsKmh >= 36 || h.windSpeedKmh >= 26) {
        blowingSnowRisk = "drifting";
      }
    }

    cumulativeAirSnowCm += airSnowCm;
    cumulativeGroundSnowCm += stepRes.groundSnowNewCm;

    outputs.push({
      snowLineElevationM: bourgouin.snowLineElevationM,
      wetBulbZeroM: bourgouin.wetBulbZeroM,
      meltingEnergyJkg: bourgouin.meltingEnergyJkg,
      refinedPhase: snowDiag.refinedPhase,
      airSnowProbPct: snowDiag.airSnowProbPct,
      airSnowCm: Number(airSnowCm.toFixed(1)),
      airSnowP90Cm: Number(airSnowP90Cm.toFixed(1)),
      groundSnowCm: Number(stepRes.groundSnowNewCm.toFixed(1)),
      groundSnowP90Cm: Number(groundSnowP90Cm.toFixed(1)),
      roadSnowCm: Number(stepRes.roadSnowNewCm.toFixed(1)),
      snowpackDepthCm: Number(mainState.soilDepthCm.toFixed(1)),
      roadSnowDepthCm: Number(mainState.roadDepthCm.toFixed(1)),
      cumulativeAirSnowCm: Number(cumulativeAirSnowCm.toFixed(1)),
      cumulativeGroundSnowCm: Number(cumulativeGroundSnowCm.toFixed(1)),
      soilTempC: Number(mainState.soilTempC.toFixed(1)),
      roadTempC: Number(mainState.roadTempC.toFixed(1)),
      slr: slrEval.slr,
      snowQualityTr: slrEval.snowQualityTr,
      icingRisk: stepRes.icingRisk,
      blowingSnowRisk,
      dekStatus: dekEval.status,
      dekDeltaTSst850C: dekEval.deltaTSst850C,
      elevationBands: hourElevationBands
    });
  }

  return outputs;
}

// ============================================================================
// 6. MIXED-PHASE (-10..-20°C) GRAUPEL ICE-FLUX LIGHTNING + THUNDERSNOW ENGINE
// ============================================================================

export interface LightningHourPhysicsInput {
  temp2mC: number;
  wetBulbC: number;
  precipMmHr: number;
  precipProbPct: number;
  precipPhase: PrecipPhase;
  capeJkg: number;
  liftedIndex: number | null;
  lpiJkg: number | null;
  stormLightningProbPct: number;
  wmoCode: number;
  temp850hPa: number | null;
  dekStatus: DekSnowStatus;
  dekDeltaTC: number | null;
  windGustsKmh: number;
  soundingLevels?: SoundingLevel[];
  liveMetarTs?: boolean;
}

export interface LightningHourPhysicsResult {
  lightningProbPct: number;
  lpiEffectiveJkg: number;
  flashesPerMin: number;
  cgFractionPct: number;
  isThundersnow: boolean;
}

export function evaluateHourLightningPhysics(
  input: LightningHourPhysicsInput
): LightningHourPhysicsResult {
  // 1. Diagnose cloud-top glaciation & `-10..-20°C` mixed-phase charging depth
  let coldestCloudTempC = -22;
  let mixedPhaseMoisture = 0.65;
  let midLevelLapseCPerKm = 6.3;

  if (input.soundingLevels && input.soundingLevels.length >= 3) {
    const moistCloudLevels = input.soundingLevels.filter((lv) => lv.humidity >= 68);
    if (moistCloudLevels.length > 0) {
      coldestCloudTempC = Math.min(...moistCloudLevels.map((lv) => lv.temperature));
    } else {
      coldestCloudTempC = Math.min(...input.soundingLevels.map((lv) => lv.temperature));
    }

    const chargingLevels = input.soundingLevels.filter(
      (lv) => lv.temperature <= -8 && lv.temperature >= -24
    );
    if (chargingLevels.length > 0) {
      mixedPhaseMoisture =
        chargingLevels.reduce((s, lv) => s + clamp(lv.humidity / 100, 0, 1), 0) /
        chargingLevels.length;
    }

    const lv850 = input.soundingLevels.find((lv) => lv.pressure === 850);
    const lv500 = input.soundingLevels.find((lv) => lv.pressure === 500);
    if (lv850 && lv500 && lv500.altitudeM > lv850.altitudeM + 500) {
      midLevelLapseCPerKm =
        ((lv850.temperature - lv500.temperature) / (lv500.altitudeM - lv850.altitudeM)) * 1000;
    }
  } else if (input.temp850hPa !== null && Number.isFinite(input.temp850hPa)) {
    // Estimate cloud top temperature from CAPE/precip depth when full sounding is absent
    const depthKm = input.capeJkg >= 800 ? 8.5 : input.capeJkg >= 250 ? 6.5 : input.precipMmHr >= 2.0 ? 5.2 : 3.2;
    coldestCloudTempC = input.temp850hPa - (depthKm - 1.5) * 6.4;
  }

  const rawLpi = input.lpiJkg !== null && Number.isFinite(input.lpiJkg) ? Math.max(0, input.lpiJkg) : 0;

  // 2. Cold-top glaciation gate: warm-rain clouds (`coldestCloudTempC > -8°C`) lack ice/graupel collisions!
  const isGlaciated =
    coldestCloudTempC <= -8.5 || rawLpi >= 0.4 || Boolean(input.liveMetarTs) || input.wmoCode >= 95;

  if (!isGlaciated) {
    return {
      lightningProbPct: Math.min(6, Math.round(input.stormLightningProbPct * 0.2)),
      lpiEffectiveJkg: Number((rawLpi * 0.25).toFixed(2)),
      flashesPerMin: 0,
      cgFractionPct: 22,
      isThundersnow: false
    };
  }

  // 3. Detect Cold-Season Thundersnow (`Gökgürültülü Kar / DEK Orajı`)
  const isColdSnowEnv =
    input.precipPhase === "snow" ||
    input.precipPhase === "sleet" ||
    input.wetBulbC <= 1.2;

  const dekConvectiveSignal =
    (input.dekStatus === "heavy_dek" && (input.dekDeltaTC ?? 0) >= 15.5 && input.precipMmHr >= 0.8) ||
    (input.dekStatus === "moderate_dek" && (input.dekDeltaTC ?? 0) >= 14.5 && input.capeJkg >= 70);
  const steepColdLapseSignal =
    isColdSnowEnv &&
    input.precipMmHr >= 1.4 &&
    (midLevelLapseCPerKm >= 7.0 || input.capeJkg >= 90 || (input.liftedIndex ?? 4) <= -0.5);

  const thundersnowBoost =
    isColdSnowEnv && (dekConvectiveSignal || steepColdLapseSignal || rawLpi >= 0.8 || input.liveMetarTs)
      ? clamp(
          18 +
            (dekConvectiveSignal ? 22 : 0) +
            Math.max(0, midLevelLapseCPerKm - 6.6) * 14 +
            Math.min(25, input.capeJkg * 0.14),
          15,
          68
        )
      : 0;

  // 4. Takahashi-Saunders Graupel Ice-Flux LTI (`0..100`)
  const capeCharging =
    input.capeJkg > 40
      ? clamp(Math.pow(input.capeJkg / 1650, 0.62) * 78 * (0.55 + 0.45 * mixedPhaseMoisture), 0, 92)
      : 0;
  const lpiSignal = rawLpi > 0.05 ? clamp(Math.sqrt(rawLpi) * 26, 0, 96) : 0;
  const precipCoreFactor =
    input.precipMmHr >= 0.25
      ? clamp(0.65 + Math.min(0.45, input.precipMmHr * 0.08), 0.65, 1.1)
      : input.precipProbPct >= 35
        ? 0.55
        : 0.28;

  let prob = Math.max(
    input.stormLightningProbPct * (mixedPhaseMoisture >= 0.45 ? 1.0 : 0.78),
    capeCharging * precipCoreFactor,
    lpiSignal,
    thundersnowBoost
  );

  if (input.liveMetarTs) {
    prob = Math.max(prob, 92);
  } else if (input.wmoCode >= 95 && prob < 48) {
    prob = Math.max(prob, 54);
  }

  const lightningProbPct = Math.round(clamp(prob, 0, 99));
  const isThundersnow = isColdSnowEnv && lightningProbPct >= 24 && (input.precipMmHr >= 0.2 || Boolean(input.liveMetarTs));

  // Effective LPI (`J/kg`) synthesized when model LPI is absent
  const synthLpi =
    lightningProbPct >= 15
      ? Number(((Math.pow(lightningProbPct / 100, 2.1) * 14) + (input.capeJkg / 650) * (input.precipMmHr / 4)).toFixed(2))
      : 0;
  const lpiEffectiveJkg = Number(Math.max(rawLpi, synthLpi).toFixed(2));

  // Expected local flash rate (`flashes/min` within 25 km radius, calibrated to McCaul 2009 / Price-Rind)
  let flashesPerMin = 0;
  if (lightningProbPct >= 18) {
    const rawRate =
      0.18 * lpiEffectiveJkg +
      (input.capeJkg >= 150 ? Math.pow(input.capeJkg / 900, 1.25) * (0.4 + input.precipMmHr * 0.16) : 0) +
      (isThundersnow ? 0.35 : 0);
    // Thundersnow produces fewer, high-amplitude +CG bolts (typically 0.2 .. 2.5 flashes/min), whereas summer supercells hit 8..35/min
    const capRate = isThundersnow ? 3.8 : 42;
    flashesPerMin = Number(clamp(rawRate * (lightningProbPct / 85), 0.1, capRate).toFixed(1));
  }

  // Cloud-to-Ground (`CG%`) fraction: lower freezing levels / cold charging zones yield higher CG% (35-55%)
  const cgFractionPct = Math.round(
    isThundersnow
      ? clamp(48 - input.wetBulbC * 3, 36, 58)
      : clamp(34 - Math.max(0, input.temp2mC - 12) * 0.55 - Math.min(8, flashesPerMin * 0.35), 16, 44)
  );

  return {
    lightningProbPct,
    lpiEffectiveJkg,
    flashesPerMin,
    cgFractionPct,
    isThundersnow
  };
}

// ============================================================================
// 7. 3-RING CONCENTRIC LIGHTNING & CONVECTIVE PROXIMITY RADAR (`15 / 40 / 100 km`)
// ============================================================================

export interface RadarConvectiveCellSample {
  bearingDeg: number;
  distanceKm: number;
  peakDbz: number;
  approaching: boolean;
  etaMinutes: number | null;
}

export function buildLightningProximityRadar(params: {
  updatedAtIso: string;
  radarAvailable: boolean;
  currentRadarDbz: number;
  radarCells?: RadarConvectiveCellSample[];
  metarStations?: MetarObservation[];
  hour0Lightning: LightningHourPhysicsResult;
  hour1Lightning?: LightningHourPhysicsResult | null;
  surfaceTempC: number;
  dekStatus: DekSnowStatus;
}): LightningProximityRadar {
  const {
    updatedAtIso,
    radarAvailable,
    currentRadarDbz,
    radarCells = [],
    metarStations = [],
    hour0Lightning,
    hour1Lightning,
    surfaceTempC,
    dekStatus
  } = params;

  const isColdSnow =
    hour0Lightning.isThundersnow ||
    dekStatus === "moderate_dek" ||
    dekStatus === "heavy_dek" ||
    surfaceTempC <= 2.5;

  // Cold-season / DEK convective cells electrify at lower radar reflectivity (`>= 29 dBZ`) than warm summer storms (`>= 37 dBZ`)
  const minConvectiveDbz = isColdSnow ? 29 : 36;
  const chargingScale = clamp(
    Math.max(
      hour0Lightning.lightningProbPct / 100,
      (hour1Lightning?.lightningProbPct ?? 0) / 115,
      currentRadarDbz >= 46 ? 0.72 : currentRadarDbz >= 40 ? 0.42 : 0.08
    ),
    0,
    1
  );

  const cells: LightningCellVector[] = [];

  // 1. Live METAR station thunderstorm reports (`TS`, `+TSRA`, `TSSN`, `VCTS`)
  let metarConfirmedTs = false;
  for (const st of metarStations) {
    if (st.wxFlags?.isThunderstorm && st.distanceKm <= 100 && st.ageMinutes <= 90) {
      metarConfirmedTs = true;
      // Place station on deterministic bearing if not already covered
      const pseudoBearing =
        st.icaoId.split("").reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7) % 360;
      cells.push({
        id: `metar-${st.icaoId}`,
        bearingDeg: pseudoBearing,
        compassTr: bearingToCompassTr(pseudoBearing),
        distanceKm: Number(clamp(st.distanceKm, 2, 99).toFixed(1)),
        peakDbz: Math.max(44, currentRadarDbz),
        estFlashesPerMin: Math.max(1.2, hour0Lightning.flashesPerMin),
        cgFractionPct: hour0Lightning.cgFractionPct,
        approaching: st.distanceKm <= 35,
        etaMinutes: st.distanceKm <= 15 ? 0 : Math.round(st.distanceKm * 1.3),
        kind: isColdSnow ? "thundersnow_dek" : "metar_ts"
      });
    }
  }

  // 2. Live RainViewer Zoom-7 512px polar convective reflectivity cells (`0..100 km`)
  for (let i = 0; i < radarCells.length; i++) {
    const rc = radarCells[i];
    if (rc.distanceKm > 100 || rc.peakDbz < minConvectiveDbz) continue;

    // Require either atmospheric charging support OR genuinely intense radar graupel core (`>= 45 dBZ`)
    if (chargingScale < 0.16 && rc.peakDbz < 45 && !metarConfirmedTs) continue;

    const dbzExcess = Math.max(0, rc.peakDbz - minConvectiveDbz);
    const cellFlashRate = Number(
      clamp(
        (0.15 + Math.pow(dbzExcess / 11, 1.65) * 2.4) * Math.max(0.35, chargingScale),
        0.1,
        36
      ).toFixed(1)
    );

    cells.push({
      id: `radar-cell-${i}-${Math.round(rc.bearingDeg)}`,
      bearingDeg: Math.round(rc.bearingDeg),
      compassTr: bearingToCompassTr(rc.bearingDeg),
      distanceKm: Number(rc.distanceKm.toFixed(1)),
      peakDbz: Number(rc.peakDbz.toFixed(1)),
      estFlashesPerMin: cellFlashRate,
      cgFractionPct: hour0Lightning.cgFractionPct,
      approaching: rc.approaching,
      etaMinutes: rc.etaMinutes,
      kind: isColdSnow
        ? "thundersnow_dek"
        : rc.peakDbz >= 46
          ? "convective_storm"
          : "graupel_cell"
    });
  }

  // Sort cells nearest-first and cap at 8 cleanest cells
  cells.sort((a, b) => a.distanceKm - b.distanceKm || b.peakDbz - a.peakDbz);
  const topCells = cells.slice(0, 8);

  const summarizeRing = (
    minKm: number,
    maxKm: 15 | 40 | 100,
    labelTr: string
  ): LightningRangeRingSummary => {
    const inRing = topCells.filter((c) => c.distanceKm >= minKm && c.distanceKm <= maxKm);
    const maxDbz = inRing.reduce((m, c) => Math.max(m, c.peakDbz), maxKm === 15 ? currentRadarDbz : 0);
    const estFlashes = Number(
      inRing.reduce((s, c) => s + c.estFlashesPerMin, 0).toFixed(1)
    );

    let prob =
      inRing.length > 0
        ? clamp(
            Math.round(
              Math.max(
                hour0Lightning.lightningProbPct,
                32 + (maxDbz - minConvectiveDbz) * 3.4 + (metarConfirmedTs && maxKm <= 40 ? 35 : 0)
              )
            ),
            15,
            99
          )
        : maxKm === 15
          ? hour0Lightning.lightningProbPct
          : Math.round(
              Math.max(
                hour0Lightning.lightningProbPct * (maxKm === 40 ? 0.9 : 0.78),
                (hour1Lightning?.lightningProbPct ?? 0) * (maxKm === 100 ? 0.95 : 0.75)
              )
            );

    if (inRing.length === 0 && radarAvailable && currentRadarDbz < 20 && !metarConfirmedTs) {
      // Live radar confirms clear sky right now inside the inner 15 km ring!
      if (maxKm === 15) prob = Math.min(prob, 14);
      if (maxKm === 40) prob = Math.min(prob, 28);
    }

    const finalFlashes =
      estFlashes > 0
        ? estFlashes
        : maxKm === 15 && prob >= 35
          ? hour0Lightning.flashesPerMin
          : 0;

    const status: LightningRangeRingSummary["status"] =
      prob >= 68 || finalFlashes >= 2.5
        ? "severe"
        : prob >= 38 || inRing.length > 0
          ? "active"
          : prob >= 18
            ? "watch"
            : "clear";

    return {
      ringKm: maxKm,
      labelTr,
      activeCellCount: inRing.length,
      maxDbz: Number(maxDbz.toFixed(1)),
      estFlashesPerMin: finalFlashes,
      probabilityPct: clamp(prob, 0, 99),
      status
    };
  };

  const ring15 = summarizeRing(0, 15, "0–15 km · Acil Yakın Çember");
  const ring40 = summarizeRing(15.01, 40, "15–40 km · Yaklaşma Çemberi");
  const ring100 = summarizeRing(40.01, 100, "40–100 km · Erken Uyarı Ufku");

  const nearest = topCells[0] ?? null;
  const approachingCell = topCells.find((c) => c.approaching && c.etaMinutes !== null) ?? null;

  // WMO / NFPA 30-30 Lightning Safety Protocol (~10-15 km acoustic/strike danger zone)
  let safetyLevel: LightningSafetyLevel = "safe";
  let safetyTitleTr = "Açık Alan Güvenli (Aktif Deşarj Yok)";
  let safetyDetailTr =
    "0–40 km çevrede aktif yıldırım/şimşek hücresi saptanmadı; standart dış mekan faaliyetleri için elektriksel risk düşük.";

  if (
    ring15.status === "severe" ||
    ring15.status === "active" ||
    (nearest && nearest.distanceKm <= 15)
  ) {
    safetyLevel = "shelter_now";
    safetyTitleTr = hour0Lightning.isThundersnow
      ? "ACİL: Gökgürültülü Kar (Thundersnow) — Kapalı Alana Geçin"
      : "30-30 KURALI AKTİF: 15 km İçinde Yıldırım Tehlikesi";
    safetyDetailTr =
      "Şimşek-gök gürültüsü aralığı <30 sn menzilinde. Açık arazi, zirve, su yüzeyi ve tekil ağaçlardan uzaklaşıp son gök gürültüsünden 30 dk sonrasına dek kapalı alanda kalın.";
  } else if (
    ring40.status === "severe" ||
    ring40.status === "active" ||
    (nearest && nearest.distanceKm <= 40)
  ) {
    safetyLevel = "caution_30_30";
    safetyTitleTr = "Yakın Çevrede Aktif Oraj (15–40 km)";
    safetyDetailTr = approachingCell?.etaMinutes
      ? `${approachingCell.compassTr} yönünden yaklaşan konvektif hücre (~${approachingCell.distanceKm} km, tahmini varış ~${approachingCell.etaMinutes} dk). Açık alan planlarını sığınak mesafesinde tutun.`
      : `${nearest?.compassTr ?? "Çevre"} sektöründe ${nearest?.distanceKm ?? 28} km mesafede elektrik yüklü hücre izleniyor; rüzgar hamlesi ve ani yıldırım sıçramasına karşı hazırlıklı olun.`;
  } else if (ring100.status !== "clear" || ring15.probabilityPct >= 20 || ring40.probabilityPct >= 22) {
    safetyLevel = "awareness";
    safetyTitleTr = "Uzak Ufuk / Konvektif Kararsızlık İzlemesi";
    safetyDetailTr =
      "40–100 km ufkunda veya atmosferik buz-graupel kuşağında orta düzey şarj potansiyeli mevcut; radar gelişimini takip edin.";
  }

  return {
    updatedAtIso,
    radarBacked: radarAvailable,
    metarConfirmedTs,
    safetyLevel,
    safetyTitleTr,
    safetyDetailTr,
    nearestCellKm: nearest ? nearest.distanceKm : null,
    nearestBearingTr: nearest ? nearest.compassTr : null,
    approachingEtaMin: approachingCell?.etaMinutes ?? null,
    currentFlashesPerMin: Math.max(ring15.estFlashesPerMin, hour0Lightning.flashesPerMin),
    currentLpiJkg: hour0Lightning.lpiEffectiveJkg,
    currentCgFractionPct: hour0Lightning.cgFractionPct,
    isThundersnowNow: hour0Lightning.isThundersnow,
    rings: [ring15, ring40, ring100],
    cells: topCells
  };
}
