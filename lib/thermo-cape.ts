import type { SoundingLevel } from "./weather-types";

// Fiziksel sabitler
const R_D = 287.05; // J/(kg·K)
const C_P = 1004.0; // J/(kg·K)
const L_V = 2.5e6; // J/kg
const KAPPA = R_D / C_P; // ~0.2859
const EPSILON = 0.622;

export function saturationVaporPressure(tempC: number): number {
  return 6.112 * Math.exp((17.502 * tempC) / (240.97 + tempC));
}

export function vaporPressureFromRH(tempC: number, rhPercent: number): number {
  const rh = Math.max(1, Math.min(100, rhPercent));
  return saturationVaporPressure(tempC) * (rh / 100);
}

export function dewPointMagnus(tempC: number, rhPercent: number): number {
  const rh = Math.max(1, Math.min(100, rhPercent));
  const beta = 17.502;
  const gamma = 240.97;
  const lnRh = Math.log(rh / 100);
  const alpha = lnRh + (beta * tempC) / (gamma + tempC);
  return (gamma * alpha) / (beta - alpha);
}

export function relativeHumidityFromDewPoint(tempC: number, dewPointC: number): number {
  const es = saturationVaporPressure(tempC);
  const e = saturationVaporPressure(Math.min(dewPointC, tempC));
  return Math.max(1, Math.min(100, (e / es) * 100));
}

export function mixingRatio(vaporPressureHpa: number, pressureHpa: number): number {
  const denom = Math.max(1, pressureHpa - vaporPressureHpa);
  return (EPSILON * vaporPressureHpa) / denom;
}

export function virtualTemperatureK(tempC: number, w: number): number {
  const tK = tempC + 273.15;
  return tK * ((1 + w / EPSILON) / (1 + w));
}

export function potentialTemperatureK(tempC: number, pressureHpa: number): number {
  const tK = tempC + 273.15;
  return tK * Math.pow(1000 / Math.max(50, pressureHpa), KAPPA);
}

export function equivalentPotentialTemperatureK(
  tempC: number,
  pressureHpa: number,
  w: number
): number {
  const theta = potentialTemperatureK(tempC, pressureHpa);
  const tK = tempC + 273.15;
  return theta * Math.exp((L_V * w) / (C_P * Math.max(180, tK)));
}

function moistAdiabaticDtdP(tempC: number, pressureHpa: number): number {
  const tK = tempC + 273.15;
  const es = saturationVaporPressure(tempC);
  const ws = mixingRatio(es, pressureHpa);
  const numerator = (R_D * tK) / C_P + (L_V * ws) / C_P;
  const denominator = 1 + (L_V * L_V * ws * EPSILON) / (C_P * R_D * tK * tK);
  return numerator / (Math.max(50, pressureHpa) * denominator);
}

export function computeLCL(
  surfaceTempC: number,
  surfaceDewPointC: number,
  surfacePressureHpa: number
): { lclHeightM: number; lclTempC: number; lclPressureHpa: number } {
  const spread = Math.max(0, surfaceTempC - surfaceDewPointC);
  const lclHeightM = Math.max(0, 125 * spread);
  const tK = surfaceTempC + 273.15;
  const tdK = Math.min(surfaceDewPointC, surfaceTempC) + 273.15;
  const lclTempK =
    1 / (1 / Math.max(150, tdK - 56) + Math.log(tK / tdK) / 800) + 56;
  const lclTempC = Math.min(surfaceTempC, lclTempK - 273.15);
  const lclPressureHpa =
    surfacePressureHpa * Math.pow(lclTempK / tK, 1 / KAPPA);

  return {
    lclHeightM,
    lclTempC,
    lclPressureHpa: Math.max(300, Math.min(surfacePressureHpa, lclPressureHpa))
  };
}

/**
 * 0–6 km (1000 hPa → 500 hPa) vektörel rüzgar kırılması (knots)
 */
export function computeBulkWindShearKt(
  lowSpeedKt: number,
  lowDirDeg: number,
  highSpeedKt: number,
  highDirDeg: number
): number {
  const r1 = (lowDirDeg * Math.PI) / 180;
  const r2 = (highDirDeg * Math.PI) / 180;
  const u1 = -lowSpeedKt * Math.sin(r1);
  const v1 = -lowSpeedKt * Math.cos(r1);
  const u2 = -highSpeedKt * Math.sin(r2);
  const v2 = -highSpeedKt * Math.cos(r2);
  return Math.round(Math.hypot(u2 - u1, v2 - v1));
}

export type ComputedLevelMetrics = {
  pressure: number;
  altitudeM: number;
  temperature: number;
  dewPoint: number;
  humidity: number;
  windSpeedKt: number;
  windDirection: number;
  mixingRatioGKg: number;
  virtualTempK: number;
  potentialTempK: number;
  equivPotentialTempK: number;
};

export type ParcelPoint = {
  pressure: number;
  envTempC: number;
  envDewPointC: number;
  parcelTempC: number;
  envTvK: number;
  parcelTvK: number;
};

export type RiskLevel = {
  label: "Düşük" | "Orta" | "Yüksek" | "Şiddetli" | "Ekstrem";
  color: string;
  badgeClass: string;
};

export type CapeAnalysisResult = {
  cape: number;
  cin: number;
  lclHeightM: number;
  lclPressureHpa: number;
  lfcPressureHpa: number | null;
  elPressureHpa: number | null;
  liftedIndex: number;
  showalterIndex: number;
  kIndex: number;
  totalTotals: number;
  sweatIndex: number;
  bulkShear06Kt: number;
  lapseRate700500: number; // °C/km
  surfaceDewPointC: number;
  capeRisk: RiskLevel;
  liRisk: RiskLevel;
  kRisk: RiskLevel;
  levels: ComputedLevelMetrics[];
  parcelProfile: ParcelPoint[];
};

export function classifyCapeRisk(cape: number): RiskLevel {
  if (cape < 300) {
    return {
      label: "Düşük",
      color: "#10b981",
      badgeClass: "text-emerald-300 border-emerald-500/35 bg-emerald-500/10"
    };
  }
  if (cape < 1000) {
    return {
      label: "Orta",
      color: "#eab308",
      badgeClass: "text-amber-300 border-amber-500/35 bg-amber-500/10"
    };
  }
  if (cape < 2500) {
    return {
      label: "Yüksek",
      color: "#f97316",
      badgeClass: "text-orange-300 border-orange-500/35 bg-orange-500/10"
    };
  }
  if (cape < 4000) {
    return {
      label: "Şiddetli",
      color: "#ef4444",
      badgeClass: "text-red-300 border-red-500/35 bg-red-500/10"
    };
  }
  return {
    label: "Ekstrem",
    color: "#e11d48",
    badgeClass: "text-rose-200 border-rose-500/40 bg-rose-500/15"
  };
}

export function classifyLiftedIndexRisk(li: number): RiskLevel {
  if (li > 0) return classifyCapeRisk(100);
  if (li > -2) return classifyCapeRisk(500);
  if (li > -4) return classifyCapeRisk(1500);
  if (li > -6) return classifyCapeRisk(3000);
  return classifyCapeRisk(4500);
}

export function classifyKIndexRisk(k: number): RiskLevel {
  if (k < 20) return classifyCapeRisk(100);
  if (k <= 25) return classifyCapeRisk(500);
  if (k <= 30) return classifyCapeRisk(1500);
  if (k <= 35) return classifyCapeRisk(3000);
  return classifyCapeRisk(4500);
}

function interpolateProfile(
  sortedLevels: SoundingLevel[],
  pressureHpa: number
): { tempC: number; dewPointC: number; windSpeedKt: number; windDirection: number } {
  if (pressureHpa >= sortedLevels[0].pressure) {
    const first = sortedLevels[0];
    return {
      tempC: first.temperature,
      dewPointC: first.dewPoint,
      windSpeedKt: first.windSpeedKt,
      windDirection: first.windDirection
    };
  }
  const last = sortedLevels[sortedLevels.length - 1];
  if (pressureHpa <= last.pressure) {
    return {
      tempC: last.temperature,
      dewPointC: last.dewPoint,
      windSpeedKt: last.windSpeedKt,
      windDirection: last.windDirection
    };
  }

  for (let i = 0; i < sortedLevels.length - 1; i++) {
    const low = sortedLevels[i];
    const high = sortedLevels[i + 1];
    if (pressureHpa <= low.pressure && pressureHpa >= high.pressure) {
      const logSpan = Math.log(low.pressure) - Math.log(high.pressure);
      const frac =
        logSpan > 0 ? (Math.log(low.pressure) - Math.log(pressureHpa)) / logSpan : 0;
      return {
        tempC: low.temperature + (high.temperature - low.temperature) * frac,
        dewPointC: low.dewPoint + (high.dewPoint - low.dewPoint) * frac,
        windSpeedKt: low.windSpeedKt + (high.windSpeedKt - low.windSpeedKt) * frac,
        windDirection: low.windDirection + (high.windDirection - low.windDirection) * frac
      };
    }
  }

  return {
    tempC: last.temperature,
    dewPointC: last.dewPoint,
    windSpeedKt: last.windSpeedKt,
    windDirection: last.windDirection
  };
}

function liftParcelToPressure(
  startTempC: number,
  startDewPointC: number,
  startPressureHpa: number,
  targetPressureHpa: number
): number {
  const { lclPressureHpa, lclTempC } = computeLCL(
    startTempC,
    startDewPointC,
    startPressureHpa
  );

  if (targetPressureHpa >= lclPressureHpa) {
    const tK =
      (startTempC + 273.15) *
      Math.pow(targetPressureHpa / Math.max(50, startPressureHpa), KAPPA);
    return tK - 273.15;
  }

  let p = lclPressureHpa;
  let t = lclTempC;
  const step = 5;
  while (p > targetPressureHpa) {
    const dp = Math.min(step, p - targetPressureHpa);
    const k1 = moistAdiabaticDtdP(t, p);
    const k2 = moistAdiabaticDtdP(t - k1 * dp * 0.5, p - dp * 0.5);
    t -= k2 * dp;
    p -= dp;
  }
  return t;
}

export type SoundingAnalysisInput = {
  surfaceTempC: number;
  surfaceHumidity: number;
  surfacePressureHpa: number;
  levels: SoundingLevel[];
};

export function analyzeConvectiveProfile(
  input: SoundingAnalysisInput
): CapeAnalysisResult {
  const sortedLevels = [...input.levels]
    .sort((a, b) => b.pressure - a.pressure)
    .map((lvl) => ({ ...lvl }));

  const clampedRh = Math.max(1, Math.min(100, input.surfaceHumidity));
  const surfaceDewPointC = dewPointMagnus(input.surfaceTempC, clampedRh);
  const surfaceP = Math.max(850, Math.min(1060, input.surfacePressureHpa));

  if (sortedLevels.length > 0 && sortedLevels[0].pressure >= 980) {
    sortedLevels[0].temperature = input.surfaceTempC;
    sortedLevels[0].dewPoint = surfaceDewPointC;
    sortedLevels[0].humidity = Math.round(clampedRh);
  }

  const lcl = computeLCL(input.surfaceTempC, surfaceDewPointC, surfaceP);
  const surfaceE = vaporPressureFromRH(input.surfaceTempC, clampedRh);
  const surfaceW = mixingRatio(surfaceE, surfaceP);

  const parcelProfile: ParcelPoint[] = [];
  const pStep = 10;
  let currentP = surfaceP;
  let parcelT = input.surfaceTempC;

  const pushPoint = (p: number, pTemp: number) => {
    const env = interpolateProfile(sortedLevels, p);
    const envE = saturationVaporPressure(Math.min(env.dewPointC, env.tempC));
    const envW = mixingRatio(envE, p);
    const parcelW =
      p >= lcl.lclPressureHpa
        ? surfaceW
        : mixingRatio(saturationVaporPressure(pTemp), p);
    parcelProfile.push({
      pressure: p,
      envTempC: env.tempC,
      envDewPointC: env.dewPointC,
      parcelTempC: pTemp,
      envTvK: virtualTemperatureK(env.tempC, envW),
      parcelTvK: virtualTemperatureK(pTemp, parcelW)
    });
  };

  pushPoint(currentP, parcelT);

  while (currentP > 300) {
    const nextP = Math.max(300, currentP - pStep);
    if (nextP >= lcl.lclPressureHpa) {
      parcelT =
        (input.surfaceTempC + 273.15) * Math.pow(nextP / surfaceP, KAPPA) - 273.15;
    } else if (currentP > lcl.lclPressureHpa && nextP < lcl.lclPressureHpa) {
      const dpMoist = lcl.lclPressureHpa - nextP;
      const k1 = moistAdiabaticDtdP(lcl.lclTempC, lcl.lclPressureHpa);
      const k2 = moistAdiabaticDtdP(
        lcl.lclTempC - k1 * dpMoist * 0.5,
        lcl.lclPressureHpa - dpMoist * 0.5
      );
      parcelT = lcl.lclTempC - k2 * dpMoist;
    } else {
      const dp = currentP - nextP;
      const k1 = moistAdiabaticDtdP(parcelT, currentP);
      const k2 = moistAdiabaticDtdP(parcelT - k1 * dp * 0.5, currentP - dp * 0.5);
      parcelT -= k2 * dp;
    }
    currentP = nextP;
    pushPoint(currentP, parcelT);
  }

  let lfcPressureHpa: number | null = null;
  let elPressureHpa: number | null = null;
  let cape = 0;
  let cin = 0;

  for (let i = 0; i < parcelProfile.length - 1; i++) {
    const a = parcelProfile[i];
    const b = parcelProfile[i + 1];
    const diffA = a.parcelTvK - a.envTvK;
    const diffB = b.parcelTvK - b.envTvK;
    const avgDiff = 0.5 * (diffA + diffB);
    const dLnP = Math.log(a.pressure / b.pressure);
    const energy = R_D * avgDiff * dLnP;

    if (lfcPressureHpa === null && b.pressure <= lcl.lclPressureHpa + 20 && diffB > 0) {
      lfcPressureHpa = b.pressure;
    }

    if (energy > 0 && (lfcPressureHpa !== null || a.pressure <= lcl.lclPressureHpa)) {
      cape += energy;
      if (lfcPressureHpa === null) lfcPressureHpa = a.pressure;
      elPressureHpa = b.pressure;
    } else if (energy < 0 && lfcPressureHpa === null) {
      cin += energy;
    }
  }

  const env1000 = interpolateProfile(sortedLevels, 1000);
  const env850 = interpolateProfile(sortedLevels, 850);
  const env700 = interpolateProfile(sortedLevels, 700);
  const env500 = interpolateProfile(sortedLevels, 500);

  const parcel500FromSfc = liftParcelToPressure(
    input.surfaceTempC,
    surfaceDewPointC,
    surfaceP,
    500
  );
  const liftedIndex = env500.tempC - parcel500FromSfc;

  const parcel500From850 = liftParcelToPressure(
    env850.tempC,
    env850.dewPointC,
    850,
    500
  );
  const showalterIndex = env500.tempC - parcel500From850;

  const kIndex =
    env850.tempC - env500.tempC + env850.dewPointC - (env700.tempC - env700.dewPointC);

  const totalTotals = env850.tempC + env850.dewPointC - 2 * env500.tempC;

  const td850Term = env850.dewPointC > 0 ? 12 * env850.dewPointC : 0;
  const ttTerm = totalTotals > 49 ? 20 * (totalTotals - 49) : 0;
  const windTerm = 2 * env850.windSpeedKt + env500.windSpeedKt;
  const dirDiffDeg = env500.windDirection - env850.windDirection;
  const shearValid =
    env850.windDirection >= 130 &&
    env850.windDirection <= 250 &&
    env500.windDirection >= 210 &&
    env500.windDirection <= 310 &&
    dirDiffDeg > 0 &&
    env850.windSpeedKt >= 15 &&
    env500.windSpeedKt >= 15;
  const shearTerm = shearValid
    ? 125 * (Math.sin((dirDiffDeg * Math.PI) / 180) + 0.2)
    : 0;
  const sweatIndex = Math.max(0, td850Term + ttTerm + windTerm + shearTerm);

  const bulkShear06Kt = computeBulkWindShearKt(
    env1000.windSpeedKt,
    env1000.windDirection,
    env500.windSpeedKt,
    env500.windDirection
  );

  // 700-500 hPa orta troposfer lapse rate (°C / km; ~2.55 km fark)
  const lapseRate700500 = Number(((env700.tempC - env500.tempC) / 2.55).toFixed(1));

  const levels: ComputedLevelMetrics[] = sortedLevels.map((lvl) => {
    const e = saturationVaporPressure(Math.min(lvl.dewPoint, lvl.temperature));
    const w = mixingRatio(e, lvl.pressure);
    return {
      pressure: lvl.pressure,
      altitudeM: lvl.altitudeM,
      temperature: Number(lvl.temperature.toFixed(1)),
      dewPoint: Number(lvl.dewPoint.toFixed(1)),
      humidity: Math.round(relativeHumidityFromDewPoint(lvl.temperature, lvl.dewPoint)),
      windSpeedKt: Math.round(lvl.windSpeedKt),
      windDirection: Math.round(lvl.windDirection),
      mixingRatioGKg: Number((w * 1000).toFixed(2)),
      virtualTempK: Number(virtualTemperatureK(lvl.temperature, w).toFixed(2)),
      potentialTempK: Number(potentialTemperatureK(lvl.temperature, lvl.pressure).toFixed(1)),
      equivPotentialTempK: Number(
        equivalentPotentialTemperatureK(lvl.temperature, lvl.pressure, w).toFixed(1)
      )
    };
  });

  const roundedCape = Math.max(0, Math.round(cape));

  return {
    cape: roundedCape,
    cin: Math.round(cin),
    lclHeightM: Math.round(lcl.lclHeightM),
    lclPressureHpa: Math.round(lcl.lclPressureHpa),
    lfcPressureHpa: lfcPressureHpa ? Math.round(lfcPressureHpa) : null,
    elPressureHpa: elPressureHpa ? Math.round(elPressureHpa) : null,
    liftedIndex: Number(liftedIndex.toFixed(1)),
    showalterIndex: Number(showalterIndex.toFixed(1)),
    kIndex: Number(kIndex.toFixed(1)),
    totalTotals: Number(totalTotals.toFixed(1)),
    sweatIndex: Math.round(sweatIndex),
    bulkShear06Kt,
    lapseRate700500,
    surfaceDewPointC: Number(surfaceDewPointC.toFixed(1)),
    capeRisk: classifyCapeRisk(roundedCape),
    liRisk: classifyLiftedIndexRisk(liftedIndex),
    kRisk: classifyKIndexRisk(kIndex),
    levels,
    parcelProfile
  };
}
