import { wetBulbStullC } from "./thermo-cape";
import {
  type BlowingSnowRisk,
  type DekSnowStatus,
  type ElevationSnowBand,
  type LightningCellVector,
  type LightningProximityRadar,
  type LightningRangeRingSummary,
  type LightningSafetyLevel,
  type MetarObservation,
  PRECIP_WETNESS_CONTRACT,
  type PrecipPhase,
  type RoadIcingRisk,
  type SnowQualityLabelTr,
  type SoundingLevel
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
 *     Tracks 24-48h antecedent ground/pavement thermal & snowpack memory (`T_soil`, `T_road`, `SWE`),
 *     shortwave solar albedo contrast (bare asphalt 0.12 vs. fresh snow 0.74), latent fusion heat
 *     extraction (`L_f = 3.34e5 J/kg`) chilling warm pavement during heavy bursts, compaction, and melt.
 *  4. Reference-Relative Orographic Profile `W_oro(z)` & Unclamped Strictly-Monotonic 4-Tier
 *     Topographic Snow Cross-Section (`Kıyı / Merkez / Yamaç / Zirve`) with `0.0 cm / 0%` identity
 *     for the selected reference elevation band (`isReferenceBand === true`).
 *  5. DEK (Sea-Effect Snow: `SST - T850 >= 13°C` + onshore fetch), Black Ice (`T_road <= 0°C` + wet film),
 *     and Li-Pomeroy (1997) Blowing Snow / Blizzard diagnostics.
 *  6. Takahashi-Saunders Mixed-Phase (-10..-20°C) Graupel Ice-Flux Lightning Threat Index + DWD ICON LPI,
 *     non-circular cold-top glaciation gate (`T_EL <= -8.5°C`), cold-season Thundersnow detection,
 *     3-Ring (`0-15 km` / `15-40 km` / `40-100 km`) Doppler + METAR proximity scanner, and
 *     `reconcileNowLightningWithRadar` live radar reconciliation.
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
  const norm = ((deg % 360) + 360) % 360;
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
      if (input.surfaceTempC > 0.15 && zFrz <= elevM) {
        zFrz = elevM + input.surfaceTempC / lapsePerM;
      }
    } else if (input.temp850hPa !== null && Number.isFinite(input.temp850hPa)) {
      zFrz = 1460 + input.temp850hPa / lapsePerM;
      if (input.surfaceTempC > 0.15 && zFrz <= elevM) {
        zFrz = elevM + input.surfaceTempC / lapsePerM;
      }
    } else {
      zFrz = elevM + input.surfaceTempC / lapsePerM;
    }

    const dryTwDepressionM = Math.max(0, (input.surfaceTempC - twSfc) / lapsePerM);
    const wetBulbZeroRaw = Math.max(0, zFrz - dryTwDepressionM - heavyDiabaticDropM * 0.45);

    let meJkg = 0;
    if (wetBulbZeroRaw > elevM && twSfc > 0) {
      const dzWarm = wetBulbZeroRaw - elevM;
      meJkg = (G0 * (0.5 * twSfc) * dzWarm) / 273.15;
    }
    const diabaticMeCredit = heavyDiabaticDropM * 0.032;
    meJkg = Math.max(0, meJkg - diabaticMeCredit);

    const lapseTw = clamp(lapsePerM * 0.86, 0.0042, 0.0078);
    const survivalDropM =
      Math.sqrt((7.5 * 273.15 * 2) / (G0 * lapseTw)) + heavyDiabaticDropM * 0.55;
    let snowLineM = Math.max(0, Math.round(wetBulbZeroRaw - survivalDropM));

    let columnPhase: BourgouinSnowLineResult["columnPhase"];
    let iceFrac: number;
    if (meJkg <= 5.6 && twSfc <= 1.25) {
      columnPhase = "snow";
      iceFrac = twSfc <= -0.15 ? 1 : clamp(1 - meJkg / 18, 0.76, 1);
    } else if (meJkg <= 13.8 && twSfc <= 1.75) {
      columnPhase = "sleet";
      iceFrac = clamp(1 - (meJkg - 4.2) / 10.5, 0.14, 0.75);
    } else {
      columnPhase = "rain";
      iceFrac = 0;
    }

    // Faz <-> Kar Sınırı Rakımı Fiziksel Kilit Sözleşmesi
    if (columnPhase === "rain") {
      const rainFloorM = Math.max(
        elevM + 60,
        Math.min(
          Math.max(elevM + 60, Math.round(wetBulbZeroRaw)),
          elevM + Math.max(60, Math.round(Math.max(0, twSfc - 1.35) * 140))
        )
      );
      snowLineM = Math.max(snowLineM, rainFloorM);
    } else if (columnPhase === "sleet") {
      snowLineM = Math.max(snowLineM, Math.round(elevM));
    } else if (columnPhase === "snow") {
      snowLineM = Math.min(snowLineM, Math.round(elevM));
    }

    return {
      snowLineElevationM: Math.max(0, Math.round(snowLineM)),
      wetBulbZeroM: Math.max(0, Math.round(wetBulbZeroRaw)),
      meltingEnergyJkg: Number(meJkg.toFixed(1)),
      refreezeEnergyJkg: 0,
      iceSurvivalFraction: Number(iceFrac.toFixed(3)),
      columnPhase
    };
  }

  // Full multi-layer sounding integration from top of troposphere (`~5500 m`) down to surface!
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

  let positiveMeJkg = 0;
  let negativeRefreezeJkg = 0;
  let wetBulbZeroM = gridAsc[gridAsc.length - 1].twC <= 0 ? 0 : topZ;
  let foundWb0 = false;
  let snowLineM = 0;
  let foundSnowLine = false;

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
      negativeRefreezeJkg += (G0 * meanTw * dz) / 273.15;
    }

    const effMeAtLo = Math.max(0, positiveMeJkg - diabaticCreditJkg);
    if (!foundSnowLine && effMeAtLo >= 7.5) {
      snowLineM = lo.zM;
      foundSnowLine = true;
    }
  }

  if (!foundWb0) {
    wetBulbZeroM =
      gridAsc[0].twC <= 0
        ? Math.max(0, elevM - Math.abs(gridAsc[0].twC) / 0.0055)
        : topZ;
  }
  const finalMeJkg = Math.max(0, positiveMeJkg - diabaticCreditJkg);
  if (!foundSnowLine) {
    if (twSfc <= 0) {
      const extraMarginM = Math.max(
        0,
        ((7.5 - finalMeJkg) * 273.15) / (G0 * 1.1) + Math.abs(twSfc) * 145
      );
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
    columnPhase = "freezing_rain";
    iceSurvival = 0;
  } else if (finalMeJkg > 13.2 && negativeRefreezeJkg <= -45) {
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

  // Faz <-> Kar Sınırı Rakımı Fiziksel Kilit Sözleşmesi:
  // İstasyon rakımında (elevM) saf yağmur varken saf kar sınırı istasyonun altında olamaz;
  // istasyon rakımında saf kar varken kar sınırı istasyonun üstünde olamaz.
  if (columnPhase === "rain") {
    const rainFloorM = Math.max(
      elevM + 60,
      Math.min(
        Math.max(elevM + 60, Math.round(wetBulbZeroM)),
        elevM + Math.max(60, Math.round(Math.max(0, twSfc - 1.35) * 140))
      )
    );
    snowLineM = Math.max(snowLineM, rainFloorM);
  } else if (columnPhase === "sleet") {
    snowLineM = Math.max(snowLineM, elevM);
  } else if (columnPhase === "snow") {
    snowLineM = Math.min(snowLineM, elevM);
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
    const estT700 = input.temp850hPa - 8.5;
    if (estT700 <= -10.5 && estT700 >= -19.5) {
      dgzRhIceMax = 104;
    }
  }

  const tMaxK = tMaxColC + 273.15;
  let slr =
    tMaxK > 271.16
      ? 12 + 2 * (271.16 - tMaxK)
      : 12 + 1.05 * (271.16 - tMaxK);

  slr = clamp(slr, 4.2, 20.5);

  const dgzBoostActive =
    dgzRhIceMax >= 96 ||
    (!hasSoundingDgz &&
      (input.temp850hPa ?? 5) <= -7.5 &&
      input.surfaceTempC <= -0.5);
  if (dgzBoostActive && input.surfaceWetBulbC <= 0.2) {
    const dgzMult = dgzRhIceMax >= 108 ? 1.26 : 1.15;
    slr *= dgzMult;
  }

  const isGraupelRegime =
    (input.capeJkg >= 110 || (input.isDekActive && input.capeJkg >= 45)) &&
    input.surfaceWetBulbC <= 0.8;
  if (isGraupelRegime) {
    slr = 0.65 * slr + 0.35 * 11.5;
  }

  if (input.precipPhase === "sleet") {
    const wetFactor = clamp(1 - (input.surfaceWetBulbC + 0.3) * 0.42, 0.35, 0.78);
    slr = Math.min(slr, 8.2) * wetFactor;
  } else if (input.surfaceWetBulbC > -0.5) {
    const warmDamp = clamp(1 - (input.surfaceWetBulbC + 0.5) * 0.32, 0.48, 1);
    slr *= warmDamp;
  }

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
  const {
    lat,
    lon,
    seaSurfaceTempC,
    temp850hPa,
    surfaceTempC,
    windSpeedKmh,
    windDirDeg
  } = params;
  if (temp850hPa === null || !Number.isFinite(temp850hPa)) {
    return { status: "none", deltaTSst850C: null };
  }

  const isMarmaraBlackSeaBelt =
    lat >= 39.6 && lat <= 42.6 && lon >= 26.2 && lon <= 41.8;
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
  const normDir = ((windDirDeg % 360) + 360) % 360;
  const isNortherlyFetch = normDir >= 305 || normDir <= 70;

  if (!isNortherlyFetch || surfaceTempC > 4.5 || windSpeedKmh < 9 || deltaT < 11.5) {
    return { status: "none", deltaTSst850C: deltaT };
  }

  if (
    deltaT >= 16.0 &&
    surfaceTempC <= 2.5 &&
    (params.precipMmHr >= 0.25 || windSpeedKmh >= 18)
  ) {
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
  precipMmHr?: number;
  snowfallCm?: number;
  wetBulbC?: number;
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

export interface SimulateSnowTimelineInput {
  hours: SnowSimulationHourInput[];
  antecedentHours?: AntecedentThermalHour[];
  initialSnowpackCm?: number;
}

export interface SimulatedSnowHourOutput {
  snowLineElevationM: number;
  wetBulbZeroM: number;
  meltingEnergyJkg: number;
  /** Refined active hydrometeor phase (`"none"` whenever `precipMmHr < 0.05`) */
  refinedPhase: PrecipPhase;
  /** Thermodynamic potential phase if precipitation were active in this column */
  potentialPhase: PrecipPhase;
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
  /** Unrounded raw hourly snow metrics to eliminate premature `toFixed(1)` daily/cumulative drift */
  rawAirSnowCm: number;
  rawAirSnowP90Cm: number;
  rawGroundSnowCm: number;
  rawGroundSnowP90Cm: number;
  rawRoadSnowCm: number;
  airSnowCmRaw: number;
  airSnowP90CmRaw: number;
  groundSnowCmRaw: number;
  groundSnowP90CmRaw: number;
  roadSnowCmRaw: number;
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

  const netLongwaveLossWm2 = 68 * (1 - 0.84 * Math.pow(cloudFrac, 1.25));

  const soilAlbedo =
    state.soilDepthCm >= 1.2 ? 0.74 : state.soilDepthCm > 0.15 ? 0.52 : 0.24;
  const roadAlbedo =
    state.roadDepthCm >= 1.0 ? 0.66 : state.roadDepthCm > 0.15 ? 0.42 : 0.12;

  const swSoilWm2 = shortwaveWm2 * (1 - soilAlbedo);
  const swRoadWm2 = shortwaveWm2 * (1 - roadAlbedo);

  const hConvSoil = 5.5 + 2.4 * Math.pow(windMs, 0.8);
  const hConvRoad = 6.5 + 2.8 * Math.pow(windMs, 0.8);

  const rainHeatWh =
    liquidRainMm > 0 && temp2mC > 0 ? liquidRainMm * temp2mC * 1.16 : 0;

  // --- 1. EVOLVE UNCOVERED / SUB-SNOW SKIN TEMPERATURES BEFORE PRECIPITATION ---
  if (state.soilDepthCm < 0.25) {
    const netForcingSoil =
      swSoilWm2 - netLongwaveLossWm2 + hConvSoil * (temp2mC - state.soilTempC);
    state.soilTempC = clamp(state.soilTempC + netForcingSoil / 40.3, -24, 48);
  } else {
    state.soilTempC = clamp(
      state.soilTempC + (0.15 - state.soilTempC) * 0.08,
      -8,
      2.5
    );
  }

  if (state.roadDepthCm < 0.25) {
    const netForcingRoad =
      4.5 + swRoadWm2 - netLongwaveLossWm2 + hConvRoad * (temp2mC - state.roadTempC);
    state.roadTempC = clamp(state.roadTempC + netForcingRoad / 54.2, -22, 56);
  } else {
    state.roadTempC = clamp(
      state.roadTempC + (0.25 - state.roadTempC) * 0.09,
      -8,
      3.0
    );
  }

  const evapRoadMm = clamp(
    0.06 + windMs * 0.02 + swRoadWm2 * 0.0006,
    0.04,
    0.45
  );
  state.roadWetFilmMm = clamp(
    state.roadWetFilmMm + liquidRainMm - evapRoadMm,
    0,
    3.5
  );

  // --- 2. INCOMING SNOWFALL STICKING vs. CONTACT MELTING ---
  let groundSnowNewCm = 0;
  let roadSnowNewCm = 0;
  const effSlr = slr > 0 ? slr : 10;

  if (fallingSnowSweMm > 0.005) {
    const soilCondHeatWh = state.soilTempC > 0 ? state.soilTempC * 26.5 : 0;
    const soilAirHeatWh = wetBulbC > 0 ? wetBulbC * hConvSoil * 0.75 : 0;
    const soilSolarMeltWh = swSoilWm2 * 0.55;
    const totalSoilMeltWh = Math.max(
      0,
      soilCondHeatWh +
        soilAirHeatWh +
        soilSolarMeltWh +
        rainHeatWh -
        (state.soilTempC <= 0 ? netLongwaveLossWm2 * 0.35 : 0)
    );
    const soilMeltCapSweMm = totalSoilMeltWh / MELT_ENERGY_PER_MM_WH;
    const meltedOnSoilMm = Math.min(fallingSnowSweMm, soilMeltCapSweMm);
    const survivingSoilSweMm = Math.max(0, fallingSnowSweMm - meltedOnSoilMm);

    if (meltedOnSoilMm > 0) {
      const latentChillingC = (meltedOnSoilMm * MELT_ENERGY_PER_MM_WH) / 40.3;
      state.soilTempC = Math.max(-0.2, state.soilTempC - latentChillingC);
    }

    groundSnowNewCm = survivingSoilSweMm * (effSlr / 10);
    state.soilSweMm += survivingSoilSweMm;
    state.soilDepthCm += groundSnowNewCm;

    const roadCondHeatWh = state.roadTempC > 0 ? state.roadTempC * 38.0 : 0;
    const roadAirHeatWh = wetBulbC > 0 ? wetBulbC * hConvRoad * 0.85 : 0;
    const roadSolarMeltWh = swRoadWm2 * 0.72;
    const totalRoadMeltWh = Math.max(
      0,
      roadCondHeatWh +
        roadAirHeatWh +
        roadSolarMeltWh +
        rainHeatWh +
        3.5 -
        (state.roadTempC <= 0 ? netLongwaveLossWm2 * 0.3 : 0)
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
    const minCompactedDepthCm = state.soilSweMm * 0.36;
    const settleRate = temp2mC >= 0 ? 0.032 : 0.014;
    state.soilDepthCm = Math.max(
      minCompactedDepthCm,
      state.soilDepthCm - (state.soilDepthCm - minCompactedDepthCm) * settleRate
    );

    const packMeltWh =
      (temp2mC > 0.2 ? (temp2mC - 0.2) * hConvSoil * 0.52 : 0) +
      Math.max(0, swSoilWm2 - netLongwaveLossWm2 * 0.6) * 0.42 +
      rainHeatWh;
    if (packMeltWh > 4) {
      const packMeltMm = Math.min(
        state.soilSweMm,
        packMeltWh / MELT_ENERGY_PER_MM_WH
      );
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
      const meltMm = Math.min(
        state.roadSweMm,
        roadPackMeltWh / MELT_ENERGY_PER_MM_WH
      );
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
  } else if (
    state.roadTempC <= -0.2 &&
    state.roadWetFilmMm >= 0.12 &&
    state.roadDepthCm < 0.8
  ) {
    icingRisk = "black_ice";
  } else if (
    state.roadTempC <= 0.1 &&
    (state.roadDepthCm >= 0.4 || state.roadWetFilmMm >= 0.08)
  ) {
    icingRisk = state.roadTempC <= -1.2 ? "high" : "low";
  } else if (
    temp2mC <= 1.0 &&
    state.roadTempC <= 0.6 &&
    state.roadWetFilmMm >= 0.15
  ) {
    icingRisk = "low";
  }

  return {
    groundSnowNewCm: groundSnowNewCm < 0.004 ? 0 : groundSnowNewCm,
    roadSnowNewCm: roadSnowNewCm < 0.004 ? 0 : roadSnowNewCm,
    icingRisk
  };
}

// ============================================================================
// 5. REFERENCE-RELATIVE OROGRAPHIC PROFILE `W_oro(z)` & 4-TIER CROSS-SECTION
// ============================================================================

const OROGRAPHIC_PROFILE_KNOTS: ReadonlyArray<readonly [number, number]> = [
  [0, 0.91],
  [15, 0.92],
  [100, 1.0],
  [550, 1.18],
  [1850, 1.52],
  [2500, 1.64]
];

/**
 * Continuous piecewise-linear orographic precipitation weight `W_oro(z)` anchored to Bursa Ova (`100 m -> 1.00`).
 */
export function computeOrographicWeight(elevationM: number): number {
  const z = Number.isFinite(elevationM) ? Math.max(0, elevationM) : 100;
  if (z <= OROGRAPHIC_PROFILE_KNOTS[0][0]) {
    return OROGRAPHIC_PROFILE_KNOTS[0][1];
  }
  for (let i = 0; i < OROGRAPHIC_PROFILE_KNOTS.length - 1; i++) {
    const [z0, w0] = OROGRAPHIC_PROFILE_KNOTS[i];
    const [z1, w1] = OROGRAPHIC_PROFILE_KNOTS[i + 1];
    if (z <= z1) {
      const frac = (z - z0) / Math.max(1e-6, z1 - z0);
      return w0 + (w1 - w0) * frac;
    }
  }
  const [zLast, wLast] =
    OROGRAPHIC_PROFILE_KNOTS[OROGRAPHIC_PROFILE_KNOTS.length - 1];
  return Math.min(1.8, wLast + ((z - zLast) / 1500) * 0.12);
}

export interface ElevationBandSpec {
  id: string;
  labelTr: string;
  elevationM: number;
  orographicBoost: number;
  isReferenceBand: boolean;
}

export function buildElevationBandSpecs(
  lat: number,
  lon: number,
  cityElevationM: number
): ElevationBandSpec[] {
  const refElev = Number.isFinite(cityElevationM)
    ? Math.max(0, Math.round(cityElevationM))
    : 100;
  const wRef = computeOrographicWeight(refElev);
  const relBoost = (zBand: number, isRef: boolean): number =>
    isRef
      ? 1.0
      : Number(clamp(computeOrographicWeight(zBand) / wRef, 0.55, 1.75).toFixed(4));

  const isBursaDomain =
    lat >= 39.85 && lat <= 40.55 && lon >= 28.35 && lon <= 29.75;
  if (isBursaDomain) {
    const refSlot: "coast" | "center" | "foothill" | "summit" =
      refElev < 55
        ? "coast"
        : refElev <= 360
          ? "center"
          : refElev <= 1150
            ? "foothill"
            : "summit";

    const coastElev = refSlot === "coast" ? refElev : 15;
    const centerElev = refSlot === "center" ? refElev : 100;
    const foothillElev = refSlot === "foothill" ? refElev : 550;
    const summitElev = refSlot === "summit" ? refElev : 1850;

    return [
      {
        id: "coast",
        labelTr:
          refSlot === "coast" && Math.abs(refElev - 15) > 20
            ? "Seçili Kıyı Noktası"
            : "Mudanya / Kıyı",
        elevationM: coastElev,
        orographicBoost: relBoost(coastElev, refSlot === "coast"),
        isReferenceBand: refSlot === "coast"
      },
      {
        id: "center",
        labelTr:
          refSlot === "center"
            ? Math.abs(refElev - 100) <= 25
              ? "Bursa Merkez (17116 · Ova)"
              : "Seçili Bursa Noktası"
            : "Bursa Merkez (17116 · Ova)",
        elevationM: centerElev,
        orographicBoost: relBoost(centerElev, refSlot === "center"),
        isReferenceBand: refSlot === "center"
      },
      {
        id: "foothill",
        labelTr:
          refSlot === "foothill" && Math.abs(refElev - 550) > 120
            ? "Seçili Yamaç Noktası"
            : "Çekirge – İnkaya Yamaç",
        elevationM: foothillElev,
        orographicBoost: relBoost(foothillElev, refSlot === "foothill"),
        isReferenceBand: refSlot === "foothill"
      },
      {
        id: "summit",
        labelTr:
          refSlot === "summit" && Math.abs(refElev - 1850) > 150
            ? "Seçili Zirve Noktası"
            : "Uludağ Oteller / Zirve",
        elevationM: summitElev,
        orographicBoost: relBoost(summitElev, refSlot === "summit"),
        isReferenceBand: refSlot === "summit"
      }
    ];
  }

  if (refElev < 45) {
    const e0 = refElev;
    const e1 = Math.max(refElev + 85, 120);
    const e2 = Math.max(refElev + 380, 450);
    const e3 = Math.max(refElev + 1200, 1300);
    return [
      {
        id: "low",
        labelTr: refElev <= 15 ? "Kıyı / Şehir Merkezi" : "Alt Havza / Merkez",
        elevationM: e0,
        orographicBoost: 1.0,
        isReferenceBand: true
      },
      {
        id: "center",
        labelTr: "İç Kesim / Plato",
        elevationM: e1,
        orographicBoost: relBoost(e1, false),
        isReferenceBand: false
      },
      {
        id: "foothill",
        labelTr: "Yüksek Semt / Yamaç",
        elevationM: e2,
        orographicBoost: relBoost(e2, false),
        isReferenceBand: false
      },
      {
        id: "summit",
        labelTr: "Dağ / Zirve Kuşağı",
        elevationM: e3,
        orographicBoost: relBoost(e3, false),
        isReferenceBand: false
      }
    ];
  }

  const lowElev =
    refElev >= 160 ? Math.max(0, Math.round((refElev - 150) / 10) * 10) : 0;
  const foothillElev = refElev + 350;
  const summitElev = refElev + 1200;
  return [
    {
      id: "low",
      labelTr: lowElev === 0 ? "Kıyı / Deniz Seviyesi" : "Alt Havza",
      elevationM: lowElev,
      orographicBoost: relBoost(lowElev, false),
      isReferenceBand: false
    },
    {
      id: "center",
      labelTr: "Şehir Merkezi",
      elevationM: refElev,
      orographicBoost: 1.0,
      isReferenceBand: true
    },
    {
      id: "foothill",
      labelTr: "Yüksek Semt / Yamaç",
      elevationM: foothillElev,
      orographicBoost: relBoost(foothillElev, false),
      isReferenceBand: false
    },
    {
      id: "summit",
      labelTr: "Dağ / Zirve Kuşağı",
      elevationM: summitElev,
      orographicBoost: relBoost(summitElev, false),
      isReferenceBand: false
    }
  ];
}

/**
 * Computes falling snow liquid-water equivalent (`SWE_mm`), snow probability (`%`), active `refinedPhase`,
 * and thermodynamic `potentialPhase`. Enforces `PRECIP_WETNESS_CONTRACT.WET_ACTIVE_MIN_MM` (`0.05 mm`)
 * so `0.00 mm` dry hours NEVER produce phantom snow regardless of `rawModelSnowfallCm`.
 */
export function diagnoseFallingSnowAtPoint(params: {
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
  slr?: number;
}): {
  refinedPhase: PrecipPhase;
  potentialPhase: PrecipPhase;
  airSnowSweMm: number;
  airSnowCm: number;
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
    tempP90C,
    slr
  } = params;

  let thermalSnowProb = 0;
  if (ensembleTempMembersC && ensembleTempMembersC.length >= 6) {
    const dewSpread = Math.max(0, tempC - wetBulbC);
    const coldMembers = ensembleTempMembersC.filter(
      (tM) => tM - dewSpread * 0.75 <= 1.25
    ).length;
    thermalSnowProb = coldMembers / ensembleTempMembersC.length;
  } else {
    const sigmaT =
      tempP10C !== undefined && tempP90C !== undefined
        ? Math.max(0.65, (tempP90C - tempP10C) / 2.56)
        : 1.1;
    const z = (0.85 - wetBulbC) / sigmaT;
    thermalSnowProb = 1 / (1 + Math.exp(-1.7 * z));
  }

  if (bourgouin.columnPhase === "freezing_rain") {
    thermalSnowProb *= 0.15;
  } else if (bourgouin.meltingEnergyJkg > 15) {
    thermalSnowProb *= 0.08;
  }

  const airSnowProbPct = Math.round(
    clamp((precipProbPct / 100) * thermalSnowProb * 100, 0, 99)
  );

  // Diagnose thermodynamic potential phase of the column independent of wetness
  let potentialPhase: PrecipPhase;
  let snowFraction = 0;

  if (basePhase === "hail") {
    potentialPhase = "hail";
    snowFraction = 0;
  } else if (
    basePhase === "freezing_rain" ||
    bourgouin.columnPhase === "freezing_rain"
  ) {
    potentialPhase = "freezing_rain";
    snowFraction = 0;
  } else if (wetBulbC <= 0.15 && bourgouin.meltingEnergyJkg <= 6.8) {
    snowFraction = clamp(bourgouin.iceSurvivalFraction, 0.85, 1.0);
    potentialPhase = "snow";
  } else if (wetBulbC <= 0.85 && bourgouin.meltingEnergyJkg <= 10.5) {
    const twFrac = clamp(1 - (wetBulbC - 0.05) * 0.62, 0.42, 0.92);
    snowFraction = Math.min(twFrac, Math.max(0.35, bourgouin.iceSurvivalFraction));
    potentialPhase = snowFraction >= 0.65 ? "snow" : "sleet";
  } else if (wetBulbC <= 1.65 && bourgouin.meltingEnergyJkg <= 14.2) {
    snowFraction = clamp(0.42 - (wetBulbC - 0.85) * 0.38, 0.08, 0.42);
    potentialPhase = "sleet";
  } else {
    snowFraction = 0;
    potentialPhase = "rain";
  }

  // PHANTOM SNOW BAN: strictly gate active snow/phase on PRECIP_WETNESS_CONTRACT.WET_ACTIVE_MIN_MM (0.05 mm)
  if (
    !Number.isFinite(precipMmHr) ||
    precipMmHr < PRECIP_WETNESS_CONTRACT.WET_ACTIVE_MIN_MM
  ) {
    return {
      refinedPhase: "none",
      potentialPhase,
      airSnowSweMm: 0,
      airSnowCm: 0,
      liquidRainMm: 0,
      airSnowProbPct:
        potentialPhase === "hail" ? Math.min(12, airSnowProbPct) : airSnowProbPct
    };
  }

  if (potentialPhase === "hail") {
    return {
      refinedPhase: "hail",
      potentialPhase: "hail",
      airSnowSweMm: 0,
      airSnowCm: 0,
      liquidRainMm: precipMmHr,
      airSnowProbPct: Math.min(12, airSnowProbPct)
    };
  }

  if (potentialPhase === "freezing_rain") {
    return {
      refinedPhase: "freezing_rain",
      potentialPhase: "freezing_rain",
      airSnowSweMm: 0,
      airSnowCm: 0,
      liquidRainMm: precipMmHr,
      airSnowProbPct
    };
  }

  const refinedPhase: PrecipPhase = potentialPhase;

  let airSnowSweMm = precipMmHr * snowFraction;
  if (snowFraction > 0.25 && rawModelSnowfallCm > 0.05 && wetBulbC <= 1.1) {
    const impliedModelSwe = rawModelSnowfallCm * 0.95;
    airSnowSweMm = Math.max(
      airSnowSweMm,
      Math.min(precipMmHr * 1.05, impliedModelSwe * snowFraction)
    );
  }

  const effSlr = slr && slr > 0 ? slr : 10;
  const airSnowCm =
    airSnowSweMm > 0 ? Number((airSnowSweMm * (effSlr / 10)).toFixed(2)) : 0;
  const liquidRainMm = Math.max(0, precipMmHr - airSnowSweMm);

  return {
    refinedPhase,
    potentialPhase,
    airSnowSweMm,
    airSnowCm,
    liquidRainMm,
    airSnowProbPct: Math.max(
      airSnowProbPct,
      airSnowSweMm >= 0.08
        ? Math.min(96, Math.round(precipProbPct * Math.max(0.55, snowFraction)))
        : 0
    )
  };
}

function resolveAntecedentPrecipSplit(params: {
  precipMmHr: number;
  wetBulbC: number;
  snowfallCm?: number;
}): { fallingSnowSweMm: number; liquidRainMm: number; slr: number } {
  const safePrecip = Number.isFinite(params.precipMmHr)
    ? Math.max(0, params.precipMmHr)
    : 0;
  const safeRawSnowCm =
    params.snowfallCm !== undefined && Number.isFinite(params.snowfallCm)
      ? Math.max(0, params.snowfallCm)
      : 0;

  if (safePrecip < PRECIP_WETNESS_CONTRACT.WET_ACTIVE_MIN_MM) {
    return { fallingSnowSweMm: 0, liquidRainMm: 0, slr: 10 };
  }

  const wb = params.wetBulbC;
  const snowFrac =
    wb <= 0.2
      ? 1.0
      : wb <= 1.0
        ? clamp(1 - (wb - 0.2) * 0.75, 0.35, 1.0)
        : wb <= 1.65
          ? clamp(0.4 - (wb - 1.0) * 0.5, 0.08, 0.4)
          : 0;

  let snowSwe = safePrecip * snowFrac;
  if (safeRawSnowCm > 0.05 && wb <= 1.4 && snowFrac > 0) {
    const modelSwe = Math.min(safePrecip, safeRawSnowCm * 0.95);
    snowSwe = Math.max(snowSwe, modelSwe * Math.max(0.4, snowFrac));
  }
  snowSwe = clamp(snowSwe, 0, safePrecip);
  const liquidRainMm = Math.max(0, safePrecip - snowSwe);

  let slr = wb <= -3 ? 14 : wb <= -0.5 ? 11.5 : wb <= 0.5 ? 9.5 : 7.5;
  if (safeRawSnowCm > 0.1 && snowSwe > 0.05) {
    slr = clamp((safeRawSnowCm / snowSwe) * 10, 6.5, 18);
  }

  return { fallingSnowSweMm: snowSwe, liquidRainMm, slr };
}

function roundDisplaySnowCm(rawCm: number): number {
  if (!Number.isFinite(rawCm) || rawCm < 0.04) return 0;
  return Number(rawCm.toFixed(1));
}

/**
 * Runs the complete coupled multi-day hourly snow simulation across all forecast hours (`0..359h`).
 */
export function simulateCoupledSnowTimeline(
  params: SimulateSnowTimelineInput
): SimulatedSnowHourOutput[] {
  const { hours, antecedentHours = [], initialSnowpackCm } = params;
  if (hours.length === 0) return [];

  const first = hours[0];
  const bandSpecs = buildElevationBandSpecs(
    first.lat,
    first.lon,
    first.elevationM
  );

  let initSoilT = clamp(first.temp2mC * 0.85 + 1.0, -6, 28);
  let initRoadT = clamp(first.temp2mC * 0.9 + 1.6, -5, 32);

  if (antecedentHours.length >= 4) {
    const meanPastT =
      antecedentHours.reduce((acc, h) => acc + h.temp2mC, 0) /
      antecedentHours.length;
    initSoilT = clamp(meanPastT * 0.78 + first.temp2mC * 0.22 + 0.5, -8, 30);
    initRoadT = clamp(meanPastT * 0.72 + first.temp2mC * 0.28 + 1.1, -7, 34);
  }

  const recentWetAntecedent = antecedentHours
    .slice(-6)
    .some((h) => (h.precipMmHr ?? 0) >= 0.15);

  const mainState: SurfaceThermalState = {
    soilTempC: initSoilT,
    roadTempC: initRoadT,
    soilSweMm: 0,
    soilDepthCm: 0,
    roadSweMm: 0,
    roadDepthCm: 0,
    roadWetFilmMm: recentWetAntecedent ? 0.45 : 0
  };

  const lapseInitPerM = clamp(
    (first.lapseRateCPerKm ?? 6.2) / 1000,
    0.0045,
    0.0082
  );
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

  // Warm up `mainState` AND all 3 non-reference `bandStates` over the last 24 antecedent hours,
  // preserving overnight snowfall SWE so morning snowpack is never falsely reset to `0.0 cm`!
  const warmupSlice = antecedentHours.slice(-24);
  for (const ah of warmupSlice) {
    const ahPrecip = Math.max(0, ah.precipMmHr ?? 0);
    const baseRh = ahPrecip >= 0.1 ? 88 : 72;
    const wb =
      ah.wetBulbC !== undefined && Number.isFinite(ah.wetBulbC)
        ? ah.wetBulbC
        : wetBulbStullC(ah.temp2mC, baseRh);
    const mainSplit = resolveAntecedentPrecipSplit({
      precipMmHr: ahPrecip,
      wetBulbC: wb,
      snowfallCm: ah.snowfallCm
    });

    stepSurfaceSnowEnergyBalance(mainState, {
      temp2mC: ah.temp2mC,
      wetBulbC: wb,
      windSpeedKmh: 10,
      cloudCoverPct: ah.cloudCoverPct,
      shortwaveWm2: ah.shortwaveWm2,
      liquidRainMm: mainSplit.liquidRainMm,
      fallingSnowSweMm: mainSplit.fallingSnowSweMm,
      slr: mainSplit.slr,
      isFreezingRain: false
    });

    for (let bIdx = 0; bIdx < bandSpecs.length; bIdx++) {
      const spec = bandSpecs[bIdx];
      if (spec.isReferenceBand) continue;
      const dz = spec.elevationM - first.elevationM;
      const bTemp = ah.temp2mC - dz * lapseInitPerM;
      const bRh = clamp(
        Math.round(
          baseRh + (dz > 0 ? Math.min(18, dz * 0.012) : dz * 0.008)
        ),
        20,
        100
      );
      const bWb = wetBulbStullC(bTemp, bRh);
      const bPrecip =
        ahPrecip < PRECIP_WETNESS_CONTRACT.WET_ACTIVE_MIN_MM
          ? 0
          : ahPrecip * spec.orographicBoost;
      const bSplit = resolveAntecedentPrecipSplit({
        precipMmHr: bPrecip,
        wetBulbC: bWb
      });

      stepSurfaceSnowEnergyBalance(bandStates[bIdx], {
        temp2mC: bTemp,
        wetBulbC: bWb,
        windSpeedKmh: 10 * (dz > 500 ? 1.22 : 1),
        cloudCoverPct: ah.cloudCoverPct,
        shortwaveWm2: ah.shortwaveWm2,
        liquidRainMm: bSplit.liquidRainMm,
        fallingSnowSweMm: bSplit.fallingSnowSweMm,
        slr: bSplit.slr,
        isFreezingRain: false
      });
    }
  }

  // Assimilate live observed initial snowpack (`initialSnowpackCm`) if provided
  const initPackCm =
    initialSnowpackCm !== undefined && Number.isFinite(initialSnowpackCm)
      ? Math.max(0, initialSnowpackCm)
      : 0;
  if (initPackCm > 0) {
    if (mainState.soilDepthCm < initPackCm) {
      mainState.soilDepthCm = initPackCm;
      mainState.soilSweMm = Math.max(mainState.soilSweMm, initPackCm * 1.25);
      mainState.soilTempC = Math.min(mainState.soilTempC, 0.15);
    }
    for (let bIdx = 0; bIdx < bandSpecs.length; bIdx++) {
      const spec = bandSpecs[bIdx];
      if (spec.isReferenceBand) continue;
      const dz = spec.elevationM - first.elevationM;
      if (dz >= 0 && bandStates[bIdx].soilDepthCm < initPackCm) {
        bandStates[bIdx].soilDepthCm = initPackCm;
        bandStates[bIdx].soilSweMm = Math.max(
          bandStates[bIdx].soilSweMm,
          initPackCm * 1.25
        );
        bandStates[bIdx].soilTempC = Math.min(bandStates[bIdx].soilTempC, 0.15);
      }
    }
  }

  let cumulativeAirSnowRawCm = 0;
  let cumulativeGroundSnowRawCm = 0;
  const outputs: SimulatedSnowHourOutput[] = [];

  for (let idx = 0; idx < hours.length; idx++) {
    const h = hours[idx];
    const lapsePerM = clamp(
      (h.lapseRateCPerKm ?? 6.2) / 1000,
      0.0042,
      0.0085
    );

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
      isDekActive:
        dekEval.status === "moderate_dek" || dekEval.status === "heavy_dek",
      precipPhase: snowDiag.refinedPhase,
      levels: h.soundingLevels
    });

    const effSlr = slrEval.slr > 0 ? slrEval.slr : 10;
    const rawAirSnowCm =
      snowDiag.airSnowSweMm > 0 ? snowDiag.airSnowSweMm * (effSlr / 10) : 0;

    // P90 upper-bound snow (accounts for cold-tail ensemble member + P90 precip intensity)
    const p90WetBulb =
      h.tempP10C !== undefined
        ? wetBulbStullC(h.tempP10C, Math.min(98, h.rh2mPct + 8))
        : h.wetBulbC - 1.2;
    const p90SnowFrac =
      p90WetBulb <= 0.3
        ? 1.0
        : p90WetBulb <= 1.5
          ? clamp(1 - (p90WetBulb - 0.3) * 0.7, 0.15, 0.95)
          : 0;
    const p90Slr = Math.min(20, Math.max(effSlr, p90WetBulb <= -2 ? 14 : 10.5));
    const p90CandidateCm =
      h.precipP90MmHr >= PRECIP_WETNESS_CONTRACT.WET_ACTIVE_MIN_MM
        ? h.precipP90MmHr * p90SnowFrac * (p90Slr / 10)
        : 0;
    const rawAirSnowP90Cm = Math.max(rawAirSnowCm, p90CandidateCm);

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

    const rawGroundSnowCm = stepRes.groundSnowNewCm;
    const rawRoadSnowCm = stepRes.roadSnowNewCm;

    const stickRatioP90 =
      rawAirSnowCm > 0.05
        ? clamp(
            rawGroundSnowCm / rawAirSnowCm,
            p90WetBulb <= 0.1 ? 0.65 : 0.25,
            1
          )
        : p90WetBulb <= 0.0 && mainState.soilTempC <= 1.2
          ? 0.78
          : p90WetBulb <= 0.8
            ? 0.42
            : 0;
    const rawGroundSnowP90Cm = Math.max(
      rawGroundSnowCm,
      rawAirSnowP90Cm * stickRatioP90
    );

    const outAirSnowCm = roundDisplaySnowCm(rawAirSnowCm);
    const outAirSnowP90Cm = roundDisplaySnowCm(rawAirSnowP90Cm);
    const outGroundSnowCm = roundDisplaySnowCm(rawGroundSnowCm);
    const outGroundSnowP90Cm = roundDisplaySnowCm(rawGroundSnowP90Cm);
    const outRoadSnowCm = roundDisplaySnowCm(rawRoadSnowCm);
    const outSnowpackDepthCm = Number(mainState.soilDepthCm.toFixed(1));
    const outRoadSnowDepthCm = Number(mainState.roadDepthCm.toFixed(1));

    // Step all 4 elevation bands: `isReferenceBand` copies `mainState` outputs with 0.0 cm / 0% drift!
    const hourElevationBands: ElevationSnowBand[] = bandSpecs.map(
      (spec, bIdx) => {
        if (spec.isReferenceBand) {
          return {
            id: spec.id,
            labelTr: spec.labelTr,
            elevationM: spec.elevationM,
            tempMeanC: Number(h.temp2mC.toFixed(1)),
            wetBulbMeanC: Number(h.wetBulbC.toFixed(1)),
            precipPhase: snowDiag.refinedPhase,
            snowProbPct: snowDiag.airSnowProbPct,
            airSnowCm: outAirSnowCm,
            groundSnowCm: outGroundSnowCm,
            roadSnowCm: outRoadSnowCm,
            maxSnowpackCm: outSnowpackDepthCm,
            slr: slrEval.slr,
            snowQualityTr: slrEval.snowQualityTr
          };
        }

        const dz = spec.elevationM - h.elevationM;
        const tempShiftC = -dz * lapsePerM;
        const bTemp = Number((h.temp2mC + tempShiftC).toFixed(1));
        const bRh = clamp(
          Math.round(
            h.rh2mPct + (dz > 0 ? Math.min(18, dz * 0.012) : dz * 0.008)
          ),
          20,
          100
        );
        const bTw = Number(wetBulbStullC(bTemp, bRh).toFixed(1));
        const bPrecip =
          h.precipMmHr < PRECIP_WETNESS_CONTRACT.WET_ACTIVE_MIN_MM
            ? 0
            : Number((h.precipMmHr * spec.orographicBoost).toFixed(3));

        const bandLevels: SoundingLevel[] | undefined =
          h.elevationM > spec.elevationM + 100 && h.soundingLevels && h.soundingLevels.length > 0
            ? [
                {
                  pressure: Math.round(1013.25 * Math.pow(1 - h.elevationM / 44330, 5.255)),
                  altitudeM: h.elevationM,
                  temperature: h.temp2mC,
                  dewPoint: h.temp2mC - Math.max(0, (100 - h.rh2mPct) * 0.2),
                  humidity: h.rh2mPct,
                  windSpeedKt: h.windSpeedKmh / 1.852,
                  windDirection: h.windDirDeg
                },
                ...h.soundingLevels
              ]
            : h.soundingLevels;

        const bandFreezingLevelM =
          bTemp > 0.15 && (h.freezingLevelM === null || h.freezingLevelM <= spec.elevationM)
            ? Math.round(spec.elevationM + bTemp / lapsePerM)
            : h.freezingLevelM;

        const bBourgouin = solveBourgouinSnowLine({
          elevationM: spec.elevationM,
          surfaceTempC: bTemp,
          surfaceRhPct: bRh,
          precipMmHr: bPrecip,
          freezingLevelM: bandFreezingLevelM,
          temp850hPa: h.temp850hPa,
          levels: bandLevels,
          lapseRateCPerKm: h.lapseRateCPerKm
        });

        const bBasePhase: PrecipPhase =
          bPrecip < PRECIP_WETNESS_CONTRACT.WET_ACTIVE_MIN_MM
            ? "none"
            : bBourgouin.columnPhase === "freezing_rain"
              ? "freezing_rain"
              : bTw <= 0.4
                ? "snow"
                : bTw <= 1.6
                  ? "sleet"
                  : "rain";

        const shiftedEnsembleMembers = h.ensembleTempMembersC
          ? h.ensembleTempMembersC.map((tM) => tM + tempShiftC)
          : h.ensembleTempMembersC;

        const bDiag = diagnoseFallingSnowAtPoint({
          tempC: bTemp,
          rhPct: bRh,
          wetBulbC: bTw,
          precipMmHr: bPrecip,
          precipProbPct: clamp(
            Math.round(h.precipProbPct * (dz > 250 ? 1.12 : 1)),
            0,
            99
          ),
          rawModelSnowfallCm: 0,
          bourgouin: bBourgouin,
          basePhase: bBasePhase,
          ensembleTempMembersC: shiftedEnsembleMembers,
          tempP10C:
            h.tempP10C !== undefined ? h.tempP10C + tempShiftC : undefined,
          tempP90C:
            h.tempP90C !== undefined ? h.tempP90C + tempShiftC : undefined
        });

        const bSlrEval = computeDynamicSnowLiquidRatio({
          surfaceTempC: bTemp,
          surfaceWetBulbC: bTw,
          surfaceWindKmh: h.windSpeedKmh * (dz > 500 ? 1.25 : 1),
          temp850hPa: h.temp850hPa,
          capeJkg: h.capeJkg,
          isDekActive:
            dekEval.status === "moderate_dek" || dekEval.status === "heavy_dek",
          precipPhase: bDiag.refinedPhase,
          levels: h.soundingLevels
        });

        const bEffSlr = bSlrEval.slr > 0 ? bSlrEval.slr : 10;
        const bRawAirSnowCm =
          bDiag.airSnowSweMm > 0 ? bDiag.airSnowSweMm * (bEffSlr / 10) : 0;
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
          airSnowCm: roundDisplaySnowCm(bRawAirSnowCm),
          groundSnowCm: roundDisplaySnowCm(bStep.groundSnowNewCm),
          roadSnowCm: roundDisplaySnowCm(bStep.roadSnowNewCm),
          maxSnowpackCm: Number(bandStates[bIdx].soilDepthCm.toFixed(1)),
          slr: bSlrEval.slr,
          snowQualityTr: bSlrEval.snowQualityTr
        };
      }
    );

    // Li & Pomeroy (1997) Blowing Snow / Blizzard threshold
    let blowingSnowRisk: BlowingSnowRisk = "none";
    const hasLooseSnow =
      rawAirSnowCm >= 0.25 ||
      (mainState.soilDepthCm >= 1.5 && h.temp2mC <= 0.4);
    if (hasLooseSnow) {
      if (
        h.windGustsKmh >= 52 &&
        (rawAirSnowCm >= 0.8 || h.windSpeedKmh >= 34)
      ) {
        blowingSnowRisk = "blizzard";
      } else if (h.windGustsKmh >= 36 || h.windSpeedKmh >= 26) {
        blowingSnowRisk = "drifting";
      }
    }

    cumulativeAirSnowRawCm += rawAirSnowCm;
    cumulativeGroundSnowRawCm += rawGroundSnowCm;

    outputs.push({
      snowLineElevationM: bourgouin.snowLineElevationM,
      wetBulbZeroM: bourgouin.wetBulbZeroM,
      meltingEnergyJkg: bourgouin.meltingEnergyJkg,
      refinedPhase: snowDiag.refinedPhase,
      potentialPhase: snowDiag.potentialPhase,
      airSnowProbPct: snowDiag.airSnowProbPct,
      airSnowCm: outAirSnowCm,
      airSnowP90Cm: outAirSnowP90Cm,
      groundSnowCm: outGroundSnowCm,
      groundSnowP90Cm: outGroundSnowP90Cm,
      roadSnowCm: outRoadSnowCm,
      rawAirSnowCm,
      rawAirSnowP90Cm,
      rawGroundSnowCm,
      rawGroundSnowP90Cm,
      rawRoadSnowCm,
      airSnowCmRaw: rawAirSnowCm,
      airSnowP90CmRaw: rawAirSnowP90Cm,
      groundSnowCmRaw: rawGroundSnowCm,
      groundSnowP90CmRaw: rawGroundSnowP90Cm,
      roadSnowCmRaw: rawRoadSnowCm,
      snowpackDepthCm: outSnowpackDepthCm,
      roadSnowDepthCm: outRoadSnowDepthCm,
      cumulativeAirSnowCm: Number(cumulativeAirSnowRawCm.toFixed(1)),
      cumulativeGroundSnowCm: Number(cumulativeGroundSnowRawCm.toFixed(1)),
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
  wmoStormAgreeCount?: number;
  rawWmoCode?: number;
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
  let coldestCloudTempC = -22;
  let mixedPhaseMoisture = 0.65;
  let midLevelLapseCPerKm = 6.3;

  if (input.soundingLevels && input.soundingLevels.length >= 3) {
    const moistCloudLevels = input.soundingLevels.filter(
      (lv) => lv.humidity >= 68
    );
    if (moistCloudLevels.length > 0) {
      coldestCloudTempC = Math.min(
        ...moistCloudLevels.map((lv) => lv.temperature)
      );
    } else {
      coldestCloudTempC = Math.min(
        ...input.soundingLevels.map((lv) => lv.temperature)
      );
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
        ((lv850.temperature - lv500.temperature) /
          (lv500.altitudeM - lv850.altitudeM)) *
        1000;
    }
  } else if (input.temp850hPa !== null && Number.isFinite(input.temp850hPa)) {
    const depthKm =
      input.capeJkg >= 800
        ? 8.5
        : input.capeJkg >= 250
          ? 6.5
          : input.precipMmHr >= 2.0
            ? 5.2
            : 3.2;
    coldestCloudTempC = input.temp850hPa - (depthKm - 1.5) * 6.4;
  }

  const rawLpi =
    input.lpiJkg !== null && Number.isFinite(input.lpiJkg)
      ? Math.max(0, input.lpiJkg)
      : 0;

  // Non-circular cold-top glaciation gate: derived `wmoCode >= 95` alone cannot pierce `-8.5°C`!
  const effectiveStormAgree =
    input.wmoStormAgreeCount ??
    (input.rawWmoCode !== undefined && input.rawWmoCode >= 95 ? 2 : 0);

  const isGlaciated =
    coldestCloudTempC <= -8.5 ||
    rawLpi >= 0.4 ||
    Boolean(input.liveMetarTs) ||
    (effectiveStormAgree >= 2 && coldestCloudTempC <= -5.5);

  if (!isGlaciated) {
    return {
      lightningProbPct: Math.min(6, Math.round(input.stormLightningProbPct * 0.2)),
      lpiEffectiveJkg: Number((rawLpi * 0.25).toFixed(2)),
      flashesPerMin: 0,
      cgFractionPct: 22,
      isThundersnow: false
    };
  }

  const isColdSnowEnv =
    input.precipPhase === "snow" ||
    input.precipPhase === "sleet" ||
    input.wetBulbC <= 1.2;

  const dekConvectiveSignal =
    (input.dekStatus === "heavy_dek" &&
      (input.dekDeltaTC ?? 0) >= 15.5 &&
      input.precipMmHr >= 0.8) ||
    (input.dekStatus === "moderate_dek" &&
      (input.dekDeltaTC ?? 0) >= 14.5 &&
      input.capeJkg >= 70);
  const steepColdLapseSignal =
    isColdSnowEnv &&
    input.precipMmHr >= 1.4 &&
    (midLevelLapseCPerKm >= 7.0 ||
      input.capeJkg >= 90 ||
      (input.liftedIndex ?? 4) <= -0.5);

  const thundersnowBoost =
    isColdSnowEnv &&
    (dekConvectiveSignal ||
      steepColdLapseSignal ||
      rawLpi >= 0.8 ||
      input.liveMetarTs)
      ? clamp(
          18 +
            (dekConvectiveSignal ? 22 : 0) +
            Math.max(0, midLevelLapseCPerKm - 6.6) * 14 +
            Math.min(25, input.capeJkg * 0.14),
          15,
          68
        )
      : 0;

  const capeCharging =
    input.capeJkg > 40
      ? clamp(
          Math.pow(input.capeJkg / 1650, 0.62) *
            78 *
            (0.55 + 0.45 * mixedPhaseMoisture),
          0,
          92
        )
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

  const hasRawWmoStormSupport =
    effectiveStormAgree >= 2 ||
    (input.wmoStormAgreeCount === undefined &&
      input.rawWmoCode === undefined &&
      input.wmoCode >= 95);

  if (input.liveMetarTs) {
    prob = Math.max(prob, 92);
  } else if (hasRawWmoStormSupport && prob < 48) {
    prob = Math.max(prob, 54);
  }

  const lightningProbPct = Math.round(clamp(prob, 0, 99));
  const isThundersnow =
    isColdSnowEnv &&
    lightningProbPct >= 24 &&
    (input.precipMmHr >= 0.2 || Boolean(input.liveMetarTs));

  const synthLpi =
    lightningProbPct >= 15
      ? Number(
          (
            Math.pow(lightningProbPct / 100, 2.1) * 14 +
            (input.capeJkg / 650) * (input.precipMmHr / 4)
          ).toFixed(2)
        )
      : 0;
  const lpiEffectiveJkg = Number(Math.max(rawLpi, synthLpi).toFixed(2));

  let flashesPerMin = 0;
  if (lightningProbPct >= 18) {
    const rawRate =
      0.18 * lpiEffectiveJkg +
      (input.capeJkg >= 150
        ? Math.pow(input.capeJkg / 900, 1.25) *
          (0.4 + input.precipMmHr * 0.16)
        : 0) +
      (isThundersnow ? 0.35 : 0);
    const capRate = isThundersnow ? 3.8 : 42;
    flashesPerMin = Number(
      clamp(rawRate * (lightningProbPct / 85), 0.1, capRate).toFixed(1)
    );
  }

  const cgFractionPct = Math.round(
    isThundersnow
      ? clamp(48 - input.wetBulbC * 3, 36, 58)
      : clamp(
          34 -
            Math.max(0, input.temp2mC - 12) * 0.55 -
            Math.min(8, flashesPerMin * 0.35),
          16,
          44
        )
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

  let metarConfirmedTs = false;
  for (const st of metarStations) {
    if (st.wxFlags?.isThunderstorm && st.distanceKm <= 100 && st.ageMinutes <= 90) {
      metarConfirmedTs = true;
      const pseudoBearing =
        st.icaoId.split("").reduce((acc, ch) => acc * 31 + ch.charCodeAt(0), 7) %
        360;
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

  for (let i = 0; i < radarCells.length; i++) {
    const rc = radarCells[i];
    if (rc.distanceKm > 100 || rc.peakDbz < minConvectiveDbz) continue;

    if (chargingScale < 0.16 && rc.peakDbz < 45 && !metarConfirmedTs) continue;

    const dbzExcess = Math.max(0, rc.peakDbz - minConvectiveDbz);
    const cellFlashRate = Number(
      clamp(
        (0.15 + Math.pow(dbzExcess / 11, 1.65) * 2.4) *
          Math.max(0.35, chargingScale),
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

  cells.sort((a, b) => a.distanceKm - b.distanceKm || b.peakDbz - a.peakDbz);
  const topCells = cells.slice(0, 8);

  const summarizeRing = (
    minKm: number,
    maxKm: 15 | 40 | 100,
    labelTr: string
  ): LightningRangeRingSummary => {
    const inRing = topCells.filter(
      (c) => c.distanceKm >= minKm && c.distanceKm <= maxKm
    );
    const maxDbz = inRing.reduce(
      (m, c) => Math.max(m, c.peakDbz),
      maxKm === 15 ? currentRadarDbz : 0
    );
    const estFlashes = Number(
      inRing.reduce((s, c) => s + c.estFlashesPerMin, 0).toFixed(1)
    );

    let prob =
      inRing.length > 0
        ? clamp(
            Math.round(
              Math.max(
                hour0Lightning.lightningProbPct,
                32 +
                  (maxDbz - minConvectiveDbz) * 3.4 +
                  (metarConfirmedTs && maxKm <= 40 ? 35 : 0)
              )
            ),
            15,
            99
          )
        : maxKm === 15
          ? metarConfirmedTs
            ? Math.max(hour0Lightning.lightningProbPct, 65)
            : hour0Lightning.lightningProbPct
          : Math.round(
              Math.max(
                hour0Lightning.lightningProbPct * (maxKm === 40 ? 0.9 : 0.78),
                (hour1Lightning?.lightningProbPct ?? 0) *
                  (maxKm === 100 ? 0.95 : 0.75)
              )
            );

    if (
      inRing.length === 0 &&
      radarAvailable &&
      currentRadarDbz < 20 &&
      !metarConfirmedTs
    ) {
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
  const approachingCell =
    topCells.find((c) => c.approaching && c.etaMinutes !== null) ?? null;

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
  } else if (
    ring100.status !== "clear" ||
    ring15.probabilityPct >= 20 ||
    ring40.probabilityPct >= 22
  ) {
    safetyLevel = "awareness";
    safetyTitleTr = "Uzak Ufuk / Konvektif Kararsızlık İzlemesi";
    safetyDetailTr =
      "40–100 km ufkunda veya atmosferik buz-graupel kuşağında orta düzey şarj potansiyeli mevcut; radar gelişimini takip edin.";
  }

  const innerClearByRadar =
    radarAvailable &&
    ring15.activeCellCount === 0 &&
    currentRadarDbz < 20 &&
    !metarConfirmedTs;

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
    currentFlashesPerMin: innerClearByRadar
      ? ring15.estFlashesPerMin
      : Math.max(ring15.estFlashesPerMin, hour0Lightning.flashesPerMin),
    currentLpiJkg: hour0Lightning.lpiEffectiveJkg,
    currentCgFractionPct: hour0Lightning.cgFractionPct,
    isThundersnowNow: hour0Lightning.isThundersnow,
    rings: [ring15, ring40, ring100],
    cells: topCells
  };
}

export interface ReconcileNowLightningInput {
  modelHour0ProbPct: number;
  modelHour0FlashesPerMin: number;
  lightningRadar: LightningProximityRadar;
  radarAvailable?: boolean;
  currentRadarDbz?: number;
}

export interface ReconcileNowLightningResult {
  nowProbPct: number;
  hour0ProbPct: number;
  nowFlashesPerMin: number;
  hour0FlashesPerMin: number;
  regime:
    | "active_inner"
    | "approaching_cell"
    | "clear_radar_suppressed"
    | "model_fallback";
}

/**
 * Reconciles NWP Hour-0 lightning diagnostics with live 3-ring Doppler radar & METAR TS observations:
 *  1. Active 0-15 km convective cell or confirmed METAR TS -> `ring15` becomes the floor for both `now` and `hour0`.
 *  2. Radar online, 0-15 km clear (`activeCellCount === 0 && dBZ < 20 && !metarConfirmedTs`), and no cell
 *     approaching within 45 min -> `nowProbPct = ring15.probabilityPct` (`<= 14%`, no `Math.max` override!).
 *  3. Approaching cell in 15-40 km with `approachingEtaMin <= 45` -> smooth ETA-weighted transition.
 */
export function reconcileNowLightningWithRadar(
  params: ReconcileNowLightningInput
): ReconcileNowLightningResult {
  const { lightningRadar } = params;
  const ring15 = lightningRadar.rings[0];
  const ring40 = lightningRadar.rings[1];
  const radarActive = params.radarAvailable ?? lightningRadar.radarBacked;
  const dbzNow = params.currentRadarDbz ?? ring15.maxDbz ?? 0;
  const metarTs = Boolean(lightningRadar.metarConfirmedTs);
  const baseProb = clamp(Math.round(params.modelHour0ProbPct || 0), 0, 99);
  const baseFlashes = Math.max(0, Number(params.modelHour0FlashesPerMin) || 0);

  // (1) 0-15 km active convective cell OR confirmed live METAR TS
  if (ring15.activeCellCount > 0 || metarTs) {
    const ringFloorProb = clamp(Math.round(ring15.probabilityPct), 0, 99);
    const mergedProb = Math.max(baseProb, ringFloorProb);
    const mergedFlashes = Number(
      Math.max(baseFlashes, ring15.estFlashesPerMin).toFixed(1)
    );
    return {
      nowProbPct: mergedProb,
      hour0ProbPct: mergedProb,
      nowFlashesPerMin: mergedFlashes,
      hour0FlashesPerMin: mergedFlashes,
      regime: "active_inner"
    };
  }

  // Check for approaching 15-40 km convective cell arriving within <= 45 minutes
  const cellEta40 = lightningRadar.cells
    .filter(
      (c) =>
        c.distanceKm > 15 &&
        c.distanceKm <= 40 &&
        c.approaching &&
        c.etaMinutes !== null &&
        c.etaMinutes <= 45
    )
    .reduce<number | null>(
      (best, c) =>
        c.etaMinutes === null
          ? best
          : best === null
            ? c.etaMinutes
            : Math.min(best, c.etaMinutes),
      null
    );
  const ringEta40 =
    ring40.activeCellCount > 0 &&
    lightningRadar.approachingEtaMin !== null &&
    lightningRadar.approachingEtaMin <= 45
      ? lightningRadar.approachingEtaMin
      : null;
  const approachingEtaMin = cellEta40 ?? ringEta40;

  // (3) 15-40 km approaching cell with `approachingEtaMin <= 45` -> ETA-weighted transition
  if (approachingEtaMin !== null) {
    const etaClamped = clamp(approachingEtaMin, 0, 45);
    const wEta = clamp(1 - etaClamped / 45, 0.15, 0.95);
    const innerBase =
      radarActive && dbzNow < 20
        ? Math.min(14, ring15.probabilityPct)
        : ring15.probabilityPct;
    const outerTarget = Math.max(ring40.probabilityPct, innerBase);
    const nowProbPct = clamp(
      Math.round(innerBase + (outerTarget - innerBase) * wEta),
      0,
      99
    );
    const hour0ProbPct = clamp(
      Math.round(
        Math.max(baseProb, nowProbPct, outerTarget * (0.65 + 0.35 * wEta))
      ),
      0,
      99
    );
    const nowFlashesPerMin = Number(
      (ring40.estFlashesPerMin * wEta * 0.6).toFixed(1)
    );
    const hour0FlashesPerMin = Number(
      Math.max(
        baseFlashes,
        ring40.estFlashesPerMin * (0.5 + 0.5 * wEta)
      ).toFixed(1)
    );
    return {
      nowProbPct,
      hour0ProbPct,
      nowFlashesPerMin,
      hour0FlashesPerMin,
      regime: "approaching_cell"
    };
  }

  // (2) Radar online and 0-15 km clear (`activeCellCount === 0 && dBZ < 20 && !metarConfirmedTs`)
  // with NO cell approaching within 45 min -> `nowProbPct = ring15.probabilityPct` (`<= 14%`, NO Math.max!)
  if (radarActive && ring15.activeCellCount === 0 && dbzNow < 20 && !metarTs) {
    const clearNowProb = clamp(Math.min(14, Math.round(ring15.probabilityPct)), 0, 14);
    const dampedHour0Prob = clamp(
      Math.min(24, Math.max(clearNowProb, Math.round(baseProb * 0.35))),
      0,
      99
    );
    return {
      nowProbPct: clearNowProb,
      hour0ProbPct: dampedHour0Prob,
      nowFlashesPerMin: 0,
      hour0FlashesPerMin: 0,
      regime: "clear_radar_suppressed"
    };
  }

  // (4) Radar offline or non-convective stratiform echo (`dBZ >= 20`, `0` convective cores)
  if (!radarActive) {
    return {
      nowProbPct: baseProb,
      hour0ProbPct: baseProb,
      nowFlashesPerMin: baseFlashes,
      hour0FlashesPerMin: baseFlashes,
      regime: "model_fallback"
    };
  }

  const stratiformNowProb = clamp(
    Math.round(Math.min(baseProb, Math.max(ring15.probabilityPct, 22))),
    0,
    99
  );
  return {
    nowProbPct: stratiformNowProb,
    hour0ProbPct: baseProb,
    nowFlashesPerMin: ring15.estFlashesPerMin,
    hour0FlashesPerMin: baseFlashes,
    regime: "model_fallback"
  };
}
