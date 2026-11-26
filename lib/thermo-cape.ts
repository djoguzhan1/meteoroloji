import type { SoundingLevel } from "./weather-types";

// WMO / Bolton (1980) fiziksel sabitler
const R_D = 287.05; // J/(kg·K) kuru hava gaz sabiti
const C_P = 1004.0; // J/(kg·K) sabit basınçta özgül ısı
const L_V = 2.501e6; // J/kg 0°C buharlaşma gizli ısısı
const G_0 = 9.80665; // m/s² standart yerçekimi
const KAPPA = R_D / C_P; // ~0.2859
const EPSILON = 0.622; // Mw / Md
const KT_TO_MS = 0.514444;

/**
 * Bolton (1980, Monthly Weather Review, Vol. 108, Eq. 10)
 * Doygunluk buhar basıncı e_s(T) [hPa]. -30°C..+35°C aralığında <%0.1 hata.
 */
export function saturationVaporPressure(tempC: number): number {
  return 6.112 * Math.exp((17.67 * tempC) / (tempC + 243.5));
}

/**
 * Bolton (1980) Eq. 10 tam tersi: sıcaklık ve bağıl nemden çiy noktası [°C].
 */
export function dewPointMagnus(tempC: number, rhPercent: number): number {
  const rh = Math.max(1, Math.min(100, rhPercent));
  const beta = 17.67;
  const gamma = 243.5;
  const lnRh = Math.log(rh / 100);
  const alpha = lnRh + (beta * tempC) / (gamma + tempC);
  return (gamma * alpha) / (beta - alpha);
}

export function relativeHumidityFromDewPoint(tempC: number, dewPointC: number): number {
  const es = saturationVaporPressure(tempC);
  const e = saturationVaporPressure(Math.min(dewPointC, tempC));
  return Math.max(1, Math.min(100, (e / es) * 100));
}

/**
 * Stull (2011, Journal of Applied Meteorology and Climatology, Vol. 50, Eq. 1)
 * Islak Termometre Sıcaklığı Tw [°C]. Kar / sulu kar / yağmur faz ayrımı ve ısı stresi için altın standart.
 */
export function wetBulbStullC(tempC: number, rhPercent: number): number {
  const rh = Math.max(5, Math.min(100, rhPercent));
  const tw =
    tempC * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
    Math.atan(tempC + rh) -
    Math.atan(rh - 1.676331) +
    0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
    4.686035;
  return Math.min(tempC, tw);
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

/**
 * Bolton (1980, Eq. 22) — Yoğunlaşma Seviyesi Sıcaklığı T_LCL [K] (< 0.1 K hata)
 */
export function computeLclTempK(tempC: number, dewPointC: number): number {
  const tK = tempC + 273.15;
  const tdK = Math.min(dewPointC, tempC) + 273.15;
  return 1 / (1 / Math.max(150, tdK - 56) + Math.log(tK / tdK) / 800) + 56;
}

/**
 * Bolton (1980, Monthly Weather Review, Vol. 108, Eq. 43) — Eşdeğer Potansiyel Sıcaklık θ_e [K].
 */
export function equivalentPotentialTemperatureK(
  tempC: number,
  pressureHpa: number,
  w: number,
  dewPointC?: number
): number {
  const tK = tempC + 273.15;
  const e = (w * pressureHpa) / (EPSILON + w);

  let tdC = dewPointC;
  if (tdC === undefined) {
    const clampedE = Math.max(0.05, e);
    const lnRatio = Math.log(clampedE / 6.112);
    tdC = Math.min(tempC, (243.5 * lnRatio) / (17.67 - lnRatio));
  }

  const tLclK = computeLclTempK(tempC, tdC);
  const thetaM =
    tK * Math.pow(1000 / Math.max(50, pressureHpa), 0.2854 * (1 - 0.28 * w));
  return thetaM * Math.exp(w * (1 + 0.81 * w) * (3376 / Math.max(180, tLclK) - 2.54));
}

function moistAdiabaticDtdP(tempC: number, pressureHpa: number): number {
  const tK = tempC + 273.15;
  const es = saturationVaporPressure(tempC);
  const ws = mixingRatio(es, pressureHpa);
  const numerator = (R_D * tK) / C_P + (L_V * ws) / C_P;
  const denominator = 1 + (L_V * L_V * ws * EPSILON) / (C_P * R_D * tK * tK);
  return numerator / (Math.max(50, pressureHpa) * denominator);
}

/**
 * Bolton (1980, Eq. 22) + Hipsometrik denklem ile LCL basıncı, sıcaklığı ve yüksekliği.
 */
export function computeLCL(
  surfaceTempC: number,
  surfaceDewPointC: number,
  surfacePressureHpa: number
): { lclHeightM: number; lclTempC: number; lclPressureHpa: number } {
  const tK = surfaceTempC + 273.15;
  const lclTempK = computeLclTempK(surfaceTempC, surfaceDewPointC);
  const lclTempC = Math.min(surfaceTempC, lclTempK - 273.15);
  const lclPressureHpa = Math.max(
    300,
    Math.min(surfacePressureHpa, surfacePressureHpa * Math.pow(lclTempK / tK, 1 / KAPPA))
  );

  const tMeanK = 0.5 * (tK + lclTempK);
  const lclHeightM = Math.max(
    0,
    ((R_D * tMeanK) / G_0) * Math.log(surfacePressureHpa / Math.max(1, lclPressureHpa))
  );

  return {
    lclHeightM,
    lclTempC,
    lclPressureHpa
  };
}

/**
 * Rüzgar (hız kt, yön derece) -> meteorolojik (u, v) bileşenleri [m/s].
 */
function windKtToUVMs(speedKt: number, dirDeg: number): { u: number; v: number } {
  const rad = (dirDeg * Math.PI) / 180;
  const ms = speedKt * KT_TO_MS;
  return {
    u: -ms * Math.sin(rad),
    v: -ms * Math.cos(rad)
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

/**
 * Canlı 1000→850 hPa sondaj profilinden gerçek çevresel sıcaklık gradyanı dT/dz [°C/m].
 * Kışın sıcaklık terselmesi (inversiyon) olduğunda sabit -0.0065 °C/m hatasını önler.
 */
export function computeEnvironmentalLapseRateCPerM(levels: SoundingLevel[]): number {
  if (!levels || levels.length < 2) return -0.0065;
  const sorted = [...levels].sort((a, b) => b.pressure - a.pressure);
  const low = sorted.find((l) => l.pressure >= 925) ?? sorted[0];
  const high = sorted.find((l) => l.pressure <= 850 && l.pressure >= 700) ?? sorted[sorted.length - 1];
  const dz = high.altitudeM - low.altitudeM;
  if (!Number.isFinite(dz) || dz < 250) return -0.0065;
  const grad = (high.temperature - low.temperature) / dz; // genelde negatif (~ -0.0065)
  // Fiziksel troposfer sınırı: kuru adyabat (-9.8°C/km) ile güçlü inversiyon (+4.0°C/km) arası
  return Math.max(-0.0098, Math.min(0.004, grad));
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
  cape: number; // Yüzey tabanlı SBCAPE (J/kg)
  cin: number; // SBCIN (J/kg)
  mucape: number; // En kararsız parsel MUCAPE (1000–700 hPa, gece/cephe orajları!)
  mucin: number;
  muParcelPressureHpa: number;
  mlcape: number; // 0–100 hPa karışım tabakası MLCAPE (J/kg)
  dcape: number; // Downdraft CAPE — kuru tabakalı microburst rüzgar hamlesi enerjisi (J/kg)
  srh03: number; // 0–3 km Storm-Relative Helicity (m²/s², Bunkers Right-Mover)
  scp: number; // Supercell Composite Parameter
  sigSevere: number; // Craven-Brooks Significant Severe (MUCAPE * Shear_06_ms)
  wetBulbC: number; // Stull (2011) yüzey ıslak termometre sıcaklığı (°C)
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
  lapseRate700500: number;
  thickness5001000Dam: number;
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
): {
  tempC: number;
  dewPointC: number;
  altitudeM: number;
  windSpeedKt: number;
  windDirection: number;
} {
  if (pressureHpa >= sortedLevels[0].pressure) {
    const first = sortedLevels[0];
    return {
      tempC: first.temperature,
      dewPointC: first.dewPoint,
      altitudeM: first.altitudeM,
      windSpeedKt: first.windSpeedKt,
      windDirection: first.windDirection
    };
  }
  const last = sortedLevels[sortedLevels.length - 1];
  if (pressureHpa <= last.pressure) {
    return {
      tempC: last.temperature,
      dewPointC: last.dewPoint,
      altitudeM: last.altitudeM,
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
      // Vektörel rüzgar enterpolasyonu (350° -> 10° geçişinde hata yapmaz)
      const uv1 = windKtToUVMs(low.windSpeedKt, low.windDirection);
      const uv2 = windKtToUVMs(high.windSpeedKt, high.windDirection);
      const u = uv1.u + (uv2.u - uv1.u) * frac;
      const v = uv1.v + (uv2.v - uv1.v) * frac;
      const spdKt = Math.hypot(u, v) / KT_TO_MS;
      const dir = ((Math.atan2(-u, -v) * 180) / Math.PI + 360) % 360;

      return {
        tempC: low.temperature + (high.temperature - low.temperature) * frac,
        dewPointC: low.dewPoint + (high.dewPoint - low.dewPoint) * frac,
        altitudeM: low.altitudeM + (high.altitudeM - low.altitudeM) * frac,
        windSpeedKt: spdKt,
        windDirection: dir
      };
    }
  }

  return {
    tempC: last.temperature,
    dewPointC: last.dewPoint,
    altitudeM: last.altitudeM,
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

/**
 * Herhangi bir başlangıç parselinden (yüzey, karışım tabakası veya yükseltilmiş tabaka)
 * 300 hPa'ya kadar CAPE, CIN, LFC, EL ve tam parsel eğrisi entegrasyonu.
 */
function integrateParcelCape(
  sortedLevels: SoundingLevel[],
  startTempC: number,
  startDewPointC: number,
  startPressureHpa: number,
  pStep = 10
): {
  cape: number;
  cin: number;
  lcl: { lclHeightM: number; lclTempC: number; lclPressureHpa: number };
  lfcPressureHpa: number | null;
  elPressureHpa: number | null;
  parcelProfile: ParcelPoint[];
} {
  const safeTd = Math.min(startTempC, startDewPointC);
  const lcl = computeLCL(startTempC, safeTd, startPressureHpa);
  const startE = saturationVaporPressure(safeTd);
  const startW = mixingRatio(startE, startPressureHpa);

  const parcelProfile: ParcelPoint[] = [];
  let currentP = startPressureHpa;
  let parcelT = startTempC;

  const pushPoint = (p: number, pTemp: number) => {
    const env = interpolateProfile(sortedLevels, p);
    const envE = saturationVaporPressure(Math.min(env.dewPointC, env.tempC));
    const envW = mixingRatio(envE, p);
    const parcelW =
      p >= lcl.lclPressureHpa
        ? startW
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
        (startTempC + 273.15) * Math.pow(nextP / startPressureHpa, KAPPA) - 273.15;
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

  return {
    cape: Math.max(0, cape),
    cin,
    lcl,
    lfcPressureHpa,
    elPressureHpa,
    parcelProfile
  };
}

/**
 * Bunkers (2000) Right-Mover Fırtına Hareket Vektörü ve 0–3 km Storm-Relative Helicity (m²/s²).
 */
function computeBunkersSrh03(sortedLevels: SoundingLevel[], surfaceP: number): number {
  const w0 = interpolateProfile(sortedLevels, surfaceP);
  const w925 = interpolateProfile(sortedLevels, Math.min(surfaceP, 925));
  const w850 = interpolateProfile(sortedLevels, 850);
  const w700 = interpolateProfile(sortedLevels, 700);
  const w500 = interpolateProfile(sortedLevels, 500);

  const uv0 = windKtToUVMs(w0.windSpeedKt, w0.windDirection);
  const uv925 = windKtToUVMs(w925.windSpeedKt, w925.windDirection);
  const uv850 = windKtToUVMs(w850.windSpeedKt, w850.windDirection);
  const uv700 = windKtToUVMs(w700.windSpeedKt, w700.windDirection);
  const uv500 = windKtToUVMs(w500.windSpeedKt, w500.windDirection);

  // 0–6 km ortalama rüzgar ve kırılma vektörü
  const meanU = (uv0.u + uv925.u + uv850.u + uv700.u + uv500.u) / 5;
  const meanV = (uv0.v + uv925.v + uv850.v + uv700.v + uv500.v) / 5;
  const shU = uv500.u - uv0.u;
  const shV = uv500.v - uv0.v;
  const shMag = Math.hypot(shU, shV);

  // Bunkers sapma büyüklüğü D = 7.5 m/s (kırılma vektörünün 90° sağına)
  const D = 7.5;
  const rmU = shMag > 1e-3 ? meanU + (D * shV) / shMag : meanU;
  const rmV = shMag > 1e-3 ? meanV - (D * shU) / shMag : meanV;

  // 0–3 km (yüzey -> 925 -> 850 -> 700 hPa) hodograf üzerinde SRH = Σ ((u_{i+1}-c_x)(v_i-c_y) - (u_i-c_x)(v_{i+1}-c_y))
  const pts = [uv0, uv925, uv850, uv700];
  let srh = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    srh += (b.u - rmU) * (a.v - rmV) - (a.u - rmU) * (b.v - rmV);
  }
  return Math.round(Math.max(0, srh));
}

/**
 * Downdraft CAPE (DCAPE, J/kg): 700 hPa'daki ıslak termometre parselinin nemli adyabatla
 * yüzeye inerken ürettiği negatif yüzdürme enerjisi -> şiddetli microburst / rüzgar hamlesi göstergesi.
 */
function computeDcape(sortedLevels: SoundingLevel[], surfaceP: number): number {
  const startP = Math.min(surfaceP - 80, 700);
  if (startP <= 500) return 0;
  const env700 = interpolateProfile(sortedLevels, startP);
  const rh700 = relativeHumidityFromDewPoint(env700.tempC, env700.dewPointC);
  let parcelT = wetBulbStullC(env700.tempC, rh700);

  let p = startP;
  const step = 15;
  let dcape = 0;

  while (p < surfaceP) {
    const nextP = Math.min(surfaceP, p + step);
    const dp = nextP - p;
    const midP = p + dp * 0.5;
    const k1 = moistAdiabaticDtdP(parcelT, p);
    const k2 = moistAdiabaticDtdP(parcelT + k1 * dp * 0.5, midP);
    const nextT = parcelT + k2 * dp;

    const envMid = interpolateProfile(sortedLevels, midP);
    const tMid = 0.5 * (parcelT + nextT);
    const diffK = envMid.tempC - tMid; // pozitifse parsel çevreden soğuk -> hızlanarak aşağı iner!
    if (diffK > 0) {
      dcape += R_D * diffK * Math.log(nextP / p);
    }
    parcelT = nextT;
    p = nextP;
  }

  return Math.round(Math.max(0, dcape));
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
  const wetBulbC = Number(wetBulbStullC(input.surfaceTempC, clampedRh).toFixed(1));
  const surfaceP = Math.max(850, Math.min(1060, input.surfacePressureHpa));

  if (sortedLevels.length > 0 && sortedLevels[0].pressure >= 980) {
    sortedLevels[0].temperature = input.surfaceTempC;
    sortedLevels[0].dewPoint = surfaceDewPointC;
    sortedLevels[0].humidity = Math.round(clampedRh);
  }

  // 1. Yüzey Tabanlı SBCAPE & Tam Parsel Eğrisi (Skew-T için)
  const sb = integrateParcelCape(
    sortedLevels,
    input.surfaceTempC,
    surfaceDewPointC,
    surfaceP,
    10
  );

  // 2. Most-Unstable MUCAPE (yüzey -> 700 hPa arası en yüksek θ_e parselini bul — gece/cephe orajları!)
  let bestThetaE = -Infinity;
  let muStart = { p: surfaceP, t: input.surfaceTempC, td: surfaceDewPointC };
  const candidatePs = [surfaceP, 975, 950, 925, 900, 850, 800, 750, 700].filter(
    (p) => p <= surfaceP && p >= 700
  );
  for (const p of candidatePs) {
    const env =
      p === surfaceP
        ? { tempC: input.surfaceTempC, dewPointC: surfaceDewPointC }
        : interpolateProfile(sortedLevels, p);
    const e = saturationVaporPressure(Math.min(env.dewPointC, env.tempC));
    const w = mixingRatio(e, p);
    const thE = equivalentPotentialTemperatureK(env.tempC, p, w, env.dewPointC);
    if (thE > bestThetaE) {
      bestThetaE = thE;
      muStart = { p, t: env.tempC, td: env.dewPointC };
    }
  }
  const mu =
    muStart.p === surfaceP
      ? sb
      : integrateParcelCape(sortedLevels, muStart.t, muStart.td, muStart.p, 15);
  const mucape = Math.max(Math.round(sb.cape), Math.round(mu.cape));
  const mucin = muStart.p === surfaceP ? Math.round(sb.cin) : Math.round(mu.cin);

  // 3. Mixed-Layer MLCAPE (en alt 100 hPa ortalaması)
  let mlT = 0;
  let mlTd = 0;
  const mlSteps = 5;
  for (let i = 0; i < mlSteps; i++) {
    const p = surfaceP - (100 * i) / (mlSteps - 1);
    const env =
      i === 0
        ? { tempC: input.surfaceTempC, dewPointC: surfaceDewPointC }
        : interpolateProfile(sortedLevels, p);
    mlT += env.tempC;
    mlTd += env.dewPointC;
  }
  const ml = integrateParcelCape(
    sortedLevels,
    mlT / mlSteps,
    mlTd / mlSteps,
    surfaceP - 25,
    15
  );
  const mlcape = Math.round(ml.cape);

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
  const bulkShear06Ms = bulkShear06Kt * KT_TO_MS;

  // 4. Bunkers 0–3 km SRH, SPC SCP (MUCAPE >= 450 & CIN korumalı), Craven-Brooks ve DCAPE
  const srh03 = computeBunkersSrh03(sortedLevels, surfaceP);
  const effectiveShearTerm =
    bulkShear06Ms < 10 ? 0 : Math.min(1.5, bulkShear06Ms / 20);
  const cinTerm =
    mucin >= -40 ? 1 : mucin <= -180 ? 0 : Math.max(0, Math.min(1, -40 / mucin));
  const scp =
    mucape >= 450 && cinTerm > 0
      ? Number(
          Math.max(
            0,
            (mucape / 1000) * (srh03 / 50) * effectiveShearTerm * cinTerm
          ).toFixed(2)
        )
      : 0;
  const sigSevere = Math.round(mucape * bulkShear06Ms);
  const dcape = computeDcape(sortedLevels, surfaceP);

  // Gerçek dinamik jeopotansiyel yükseklik farkından 700–500 hPa lapse rate (°C/km)
  const dz700500Km = Math.max(1.5, (env500.altitudeM - env700.altitudeM) / 1000);
  const lapseRate700500 = Number(((env700.tempC - env500.tempC) / dz700500Km).toFixed(1));

  // 500–1000 hPa jeopotansiyel kalınlık (dam; <=540 dam klasik kar sınırı)
  const thickness5001000Dam = Number(
    ((env500.altitudeM - env1000.altitudeM) / 10).toFixed(1)
  );

  const levels: ComputedLevelMetrics[] = sortedLevels.map((lvl) => {
    const e = saturationVaporPressure(Math.min(lvl.dewPoint, lvl.temperature));
    const w = mixingRatio(e, lvl.pressure);
    return {
      pressure: lvl.pressure,
      altitudeM: Math.round(lvl.altitudeM),
      temperature: Number(lvl.temperature.toFixed(1)),
      dewPoint: Number(lvl.dewPoint.toFixed(1)),
      humidity: Math.round(relativeHumidityFromDewPoint(lvl.temperature, lvl.dewPoint)),
      windSpeedKt: Math.round(lvl.windSpeedKt),
      windDirection: Math.round(lvl.windDirection),
      mixingRatioGKg: Number((w * 1000).toFixed(2)),
      virtualTempK: Number(virtualTemperatureK(lvl.temperature, w).toFixed(2)),
      potentialTempK: Number(potentialTemperatureK(lvl.temperature, lvl.pressure).toFixed(1)),
      equivPotentialTempK: Number(
        equivalentPotentialTemperatureK(
          lvl.temperature,
          lvl.pressure,
          w,
          lvl.dewPoint
        ).toFixed(1)
      )
    };
  });

  const roundedCape = Math.max(0, Math.round(sb.cape));

  return {
    cape: roundedCape,
    cin: Math.round(sb.cin),
    mucape,
    mucin,
    muParcelPressureHpa: Math.round(muStart.p),
    mlcape,
    dcape,
    srh03,
    scp,
    sigSevere,
    wetBulbC,
    lclHeightM: Math.round(sb.lcl.lclHeightM),
    lclPressureHpa: Math.round(sb.lcl.lclPressureHpa),
    lfcPressureHpa: sb.lfcPressureHpa ? Math.round(sb.lfcPressureHpa) : null,
    elPressureHpa: sb.elPressureHpa ? Math.round(sb.elPressureHpa) : null,
    liftedIndex: Number(liftedIndex.toFixed(1)),
    showalterIndex: Number(showalterIndex.toFixed(1)),
    kIndex: Number(kIndex.toFixed(1)),
    totalTotals: Number(totalTotals.toFixed(1)),
    sweatIndex: Math.round(sweatIndex),
    bulkShear06Kt,
    lapseRate700500,
    thickness5001000Dam,
    surfaceDewPointC: Number(surfaceDewPointC.toFixed(1)),
    capeRisk: classifyCapeRisk(Math.max(roundedCape, mucape)),
    liRisk: classifyLiftedIndexRisk(liftedIndex),
    kRisk: classifyKIndexRisk(kIndex),
    levels,
    parcelProfile: sb.parcelProfile
  };
}
