import type { SoundingLevel } from "./weather-types";

// WMO / Bolton (1980) fiziksel sabitler
const R_D = 287.05; // J/(kg·K) kuru hava gaz sabiti
const C_P = 1004.0; // J/(kg·K) sabit basınçta özgül ısı
const L_V = 2.501e6; // J/kg 0°C buharlaşma gizli ısısı
const G_0 = 9.80665; // m/s² standart yerçekimi
const KAPPA = R_D / C_P; // ~0.2859
const EPSILON = 0.622; // Mw / Md
const KT_TO_MS = 0.514444;
const KMH_TO_KT = 0.539957;

function clamp(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return Math.max(lo, Math.min(hi, 1013.25));
  return Math.max(lo, Math.min(hi, v));
}

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
 * WMO No. 8 (CIMO) sanal sıcaklık düzeltmeli hipsometrik indirgeme + NWP jeopotansiyel kuşatma
 * ile gerçek istasyon yüzey basıncı P_sfc [hPa].
 */
export function computeStationSurfacePressureHpa(input: {
  surfaceTempC: number;
  surfaceHumidity: number;
  surfacePressureHpa: number;
  elevationM?: number;
  isStationPressure?: boolean;
  levels?: SoundingLevel[];
}): number {
  const { elevationM } = input;
  if (
    elevationM === undefined ||
    !Number.isFinite(elevationM) ||
    elevationM <= 5 ||
    input.isStationPressure === true
  ) {
    return clamp(input.surfacePressureHpa, 500, 1060);
  }

  const pMsl = clamp(input.surfacePressureHpa, 500, 1085);
  const zSfc = elevationM;
  const tSfc = Number.isFinite(input.surfaceTempC) ? input.surfaceTempC : 15;
  const rhSfc = clamp(Number.isFinite(input.surfaceHumidity) ? input.surfaceHumidity : 60, 1, 100);

  // WMO No. 8 ilk tahmin P^(0) ve sanal sıcaklık düzeltmeli P_sfc,hyp
  const denom0 = Math.max(180, tSfc + 273.15 + 0.00325 * zSfc);
  const p0 = pMsl * Math.exp((-G_0 * zSfc) / (R_D * denom0));
  const tdSfc = dewPointMagnus(tSfc, rhSfc);
  const eSfc = saturationVaporPressure(Math.min(tdSfc, tSfc));
  const wSfc = mixingRatio(eSfc, p0);
  const tvSfcK = virtualTemperatureK(tSfc, wSfc);
  const meanTvK = Math.max(180, tvSfcK + 0.5 * 0.0065 * zSfc);
  const pSfcHyp = pMsl * Math.exp((-G_0 * zSfc) / (R_D * meanTvK));

  let pSfc = pSfcHyp;

  // NWP kolonu Z_low <= z_sfc <= Z_high kuşatması varsa log-basınç enterpolasyonu ile uyumlu bağla
  if (input.levels && input.levels.length >= 2) {
    const sorted = [...input.levels].sort((a, b) => b.pressure - a.pressure);
    for (let i = 0; i < sorted.length - 1; i++) {
      const low = sorted[i];
      const high = sorted[i + 1];
      if (
        low.pressure > high.pressure &&
        high.altitudeM > low.altitudeM + 5 &&
        low.altitudeM <= zSfc &&
        zSfc <= high.altitudeM
      ) {
        const frac = (zSfc - low.altitudeM) / (high.altitudeM - low.altitudeM);
        const pSfcGph = low.pressure * Math.pow(high.pressure / low.pressure, frac);
        if (Number.isFinite(pSfcGph) && Math.abs(pSfcGph - pSfcHyp) <= 25) {
          pSfc = clamp(0.5 * pSfcHyp + 0.5 * pSfcGph, high.pressure, low.pressure);
        }
        break;
      }
    }
  }

  return Number(clamp(pSfc, 500, 1060).toFixed(2));
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

function uvMsToWindKtDir(u: number, v: number): { windSpeedKt: number; windDirection: number } {
  const windSpeedKt = Math.hypot(u, v) / KT_TO_MS;
  const windDirection =
    windSpeedKt > 1e-4 ? ((Math.atan2(-u, -v) * 180) / Math.PI + 360) % 360 : 0;
  return { windSpeedKt, windDirection };
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

export type ParcelMode = "mu" | "sb" | "ml";

export type EnvProfilePoint = {
  pressure: number;
  altitudeM: number;
  envTempC: number;
  envDewPointC: number;
  envTvC: number;
};

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
  isSurface?: boolean;
};

export type ParcelPoint = {
  pressure: number;
  envTempC: number;
  envDewPointC: number;
  parcelTempC: number;
  envTvK: number;
  parcelTvK: number;
  envTvC: number;
  parcelTvC: number;
};

export type ParcelTrajectory = {
  mode: ParcelMode;
  labelTr: string;
  startPressureHpa: number;
  startTempC: number;
  startDewPointC: number;
  cape: number;
  cin: number;
  lclHeightM: number;
  lclPressureHpa: number;
  lfcPressureHpa: number | null;
  elPressureHpa: number | null;
  parcelProfile: ParcelPoint[];
};

export type RiskLevel = {
  label: "Düşük" | "Orta" | "Yüksek" | "Şiddetli" | "Ekstrem";
  color: string;
  badgeClass: string;
};

export type CapeAnalysisResult = {
  cape: number; // Yüzey tabanlı SBCAPE (J/kg)
  cin: number; // SBCIN (J/kg)
  mucape: number; // En kararsız parsel MUCAPE (J/kg)
  mucin: number;
  muParcelPressureHpa: number;
  mlcape: number; // 0–100 hPa karışım tabakası MLCAPE (J/kg)
  mlcin: number; // 0–100 hPa karışım tabakası MLCIN (J/kg)
  dcape: number; // Downdraft CAPE — kuru tabakalı microburst rüzgar hamlesi enerjisi (J/kg)
  srh01: number; // 0–1 km AGL Storm-Relative Helicity (m²/s², Bunkers Right-Mover)
  srh03: number; // 0–3 km AGL Storm-Relative Helicity (m²/s², Bunkers Right-Mover)
  scp: number; // Supercell Composite Parameter
  stp: number; // SPC Thompson et al. Sabit-Tabaka Significant Tornado Parameter
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
  surfacePressureHpa: number;
  stationElevationM: number;
  freezingLevelM: number | null;
  freezingPressureHpa: number | null;
  capeRisk: RiskLevel;
  liRisk: RiskLevel;
  kRisk: RiskLevel;
  levels: ComputedLevelMetrics[];
  envProfile: EnvProfilePoint[];
  parcelProfile: ParcelPoint[];
  parcels: Record<ParcelMode, ParcelTrajectory>;
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

type InternalSoundingLevel = SoundingLevel & {
  isSurface?: boolean;
};

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
  if (sortedLevels.length === 0) {
    return {
      tempC: 15,
      dewPointC: 8,
      altitudeM: 0,
      windSpeedKt: 0,
      windDirection: 0
    };
  }
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
      const { windSpeedKt: spdKt, windDirection: dir } = uvMsToWindKtDir(u, v);

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

function interpolateUvAtAltitudeM(
  sortedLevels: SoundingLevel[],
  targetAltM: number
): { u: number; v: number } {
  if (sortedLevels.length === 0) return { u: 0, v: 0 };
  const first = sortedLevels[0];
  if (targetAltM <= first.altitudeM) {
    return windKtToUVMs(first.windSpeedKt, first.windDirection);
  }
  const last = sortedLevels[sortedLevels.length - 1];
  if (targetAltM >= last.altitudeM) {
    return windKtToUVMs(last.windSpeedKt, last.windDirection);
  }
  for (let i = 0; i < sortedLevels.length - 1; i++) {
    const low = sortedLevels[i];
    const high = sortedLevels[i + 1];
    if (targetAltM >= low.altitudeM && targetAltM <= high.altitudeM) {
      const dz = high.altitudeM - low.altitudeM;
      const frac = dz > 0 ? (targetAltM - low.altitudeM) / dz : 0;
      const uv1 = windKtToUVMs(low.windSpeedKt, low.windDirection);
      const uv2 = windKtToUVMs(high.windSpeedKt, high.windDirection);
      return {
        u: uv1.u + (uv2.u - uv1.u) * frac,
        v: uv1.v + (uv2.v - uv1.v) * frac
      };
    }
  }
  return windKtToUVMs(last.windSpeedKt, last.windDirection);
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
 * Kararlı kış profilinde LFC oluşmadığında sahte negatif alanı CIN olarak raporlamaz (CIN === 0).
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
    const envTvK = virtualTemperatureK(env.tempC, envW);
    const parcelTvK = virtualTemperatureK(pTemp, parcelW);
    parcelProfile.push({
      pressure: p,
      envTempC: env.tempC,
      envDewPointC: env.dewPointC,
      parcelTempC: pTemp,
      envTvK,
      parcelTvK,
      envTvC: envTvK - 273.15,
      parcelTvC: parcelTvK - 273.15
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
  let pendingNegEnergy = 0;
  let cinBeforeLfc = 0;

  for (let i = 0; i < parcelProfile.length - 1; i++) {
    const a = parcelProfile[i];
    const b = parcelProfile[i + 1];
    const diffA = a.parcelTvK - a.envTvK;
    const diffB = b.parcelTvK - b.envTvK;
    const avgDiff = 0.5 * (diffA + diffB);
    const dLnP = Math.log(a.pressure / b.pressure);
    const dE = R_D * avgDiff * dLnP;

    if (dE < 0 && lfcPressureHpa === null) {
      pendingNegEnergy += dE;
    }

    if (lfcPressureHpa === null && b.pressure <= lcl.lclPressureHpa + 20 && diffB > 0) {
      if (diffA <= 0 && diffB > diffA) {
        const crossFrac = (0 - diffA) / (diffB - diffA);
        lfcPressureHpa = a.pressure + (b.pressure - a.pressure) * crossFrac;
      } else {
        lfcPressureHpa = b.pressure;
      }
      cinBeforeLfc = pendingNegEnergy;
    }

    if (dE > 0 && (lfcPressureHpa !== null || a.pressure <= lcl.lclPressureHpa)) {
      if (lfcPressureHpa === null) {
        lfcPressureHpa = a.pressure;
        cinBeforeLfc = pendingNegEnergy;
      }
      cape += dE;
      elPressureHpa = b.pressure;
    }
  }

  const validConvection = lfcPressureHpa !== null && cape >= 1;
  const roundedCin = validConvection ? Math.round(cinBeforeLfc) : 0;
  const cin = roundedCin === 0 ? 0 : roundedCin;

  return {
    cape: validConvection ? Math.max(0, cape) : 0,
    cin,
    lcl,
    lfcPressureHpa: validConvection ? lfcPressureHpa : null,
    elPressureHpa: validConvection ? elPressureHpa : null,
    parcelProfile
  };
}

/**
 * Bunkers et al. (2000) Right-Mover Fırtına Hareket Vektörü ile tutarlı
 * 0–1 km AGL ve 0–3 km AGL Storm-Relative Helicity [m²/s²].
 */
function computeBunkersSrh(sortedLevels: SoundingLevel[]): {
  srh01: number;
  srh03: number;
} {
  if (sortedLevels.length < 2) return { srh01: 0, srh03: 0 };

  const baseAltM = sortedLevels[0].altitudeM;

  // 0–6 km AGL ağırlıksız ortalama rüzgar (500 m adımlarla 13 seviye)
  let sumU = 0;
  let sumV = 0;
  const meanSteps = 13;
  for (let i = 0; i < meanSteps; i++) {
    const uv = interpolateUvAtAltitudeM(sortedLevels, baseAltM + i * 500);
    sumU += uv.u;
    sumV += uv.v;
  }
  const meanU = sumU / meanSteps;
  const meanV = sumV / meanSteps;

  // Bunkers 0–0.5 km kuyruk ve 5.5–6.0 km baş rüzgar farkı vektörü
  const uv0 = interpolateUvAtAltitudeM(sortedLevels, baseAltM);
  const uv05 = interpolateUvAtAltitudeM(sortedLevels, baseAltM + 500);
  const uv55 = interpolateUvAtAltitudeM(sortedLevels, baseAltM + 5500);
  const uv60 = interpolateUvAtAltitudeM(sortedLevels, baseAltM + 6000);
  const shU = 0.5 * (uv55.u + uv60.u) - 0.5 * (uv0.u + uv05.u);
  const shV = 0.5 * (uv55.v + uv60.v) - 0.5 * (uv0.v + uv05.v);
  const shMag = Math.hypot(shU, shV);

  // Bunkers sapma büyüklüğü D = 7.5 m/s (kırılma vektörünün 90° sağına)
  const D = 7.5;
  const rmU = shMag > 1e-3 ? meanU + (D * shV) / shMag : meanU;
  const rmV = shMag > 1e-3 ? meanV - (D * shU) / shMag : meanV;

  const aglGrid01 = [0, 200, 400, 600, 800, 1000];
  let srh01Raw = 0;
  for (let i = 0; i < aglGrid01.length - 1; i++) {
    const a = interpolateUvAtAltitudeM(sortedLevels, baseAltM + aglGrid01[i]);
    const b = interpolateUvAtAltitudeM(sortedLevels, baseAltM + aglGrid01[i + 1]);
    srh01Raw += (b.u - rmU) * (a.v - rmV) - (a.u - rmU) * (b.v - rmV);
  }

  const aglGrid13 = [1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000];
  let srh13Raw = 0;
  for (let i = 0; i < aglGrid13.length - 1; i++) {
    const a = interpolateUvAtAltitudeM(sortedLevels, baseAltM + aglGrid13[i]);
    const b = interpolateUvAtAltitudeM(sortedLevels, baseAltM + aglGrid13[i + 1]);
    srh13Raw += (b.u - rmU) * (a.v - rmV) - (a.u - rmU) * (b.v - rmV);
  }

  const srh01 = Math.round(Math.max(0, srh01Raw));
  const srh03 = Math.round(Math.max(0, srh01Raw + srh13Raw));
  return {
    srh01: srh01 === 0 ? 0 : srh01,
    srh03: srh03 === 0 ? 0 : srh03
  };
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

/**
 * effectiveLevels üzerinde en üstteki T >= 0 -> T < 0 donma seviyesi (0°C izotermi) hesabı.
 * Tüm profil <= 0°C ise istasyon rakımı ve P_sfc döner.
 */
function computeFreezingLevel(
  effectiveLevels: SoundingLevel[],
  stationElevationM: number,
  surfaceP: number
): { freezingLevelM: number | null; freezingPressureHpa: number | null } {
  if (effectiveLevels.length === 0) {
    return { freezingLevelM: null, freezingPressureHpa: null };
  }

  const allSubFreezing = effectiveLevels.every((lvl) => lvl.temperature <= 0);
  if (allSubFreezing) {
    return {
      freezingLevelM: Math.round(stationElevationM),
      freezingPressureHpa: Number(surfaceP.toFixed(1))
    };
  }

  // En üstteki (en düşük basınç / en yüksek irtifa) T >= 0 -> T < 0 geçişini bul
  let foundAltM: number | null = null;
  let foundPressureHpa: number | null = null;

  for (let i = 0; i < effectiveLevels.length - 1; i++) {
    const low = effectiveLevels[i];
    const high = effectiveLevels[i + 1];
    if (low.temperature >= 0 && high.temperature < 0) {
      const spanT = low.temperature - high.temperature;
      const frac = spanT > 1e-6 ? low.temperature / spanT : 0;
      foundAltM = Math.round(low.altitudeM + frac * (high.altitudeM - low.altitudeM));
      foundPressureHpa = Number(
        (low.pressure * Math.pow(high.pressure / low.pressure, frac)).toFixed(1)
      );
    }
  }

  return {
    freezingLevelM: foundAltM,
    freezingPressureHpa: foundPressureHpa
  };
}

/**
 * P_sfc -> 300 hPa kesintisiz çevre T, Td, Tv profili.
 * MU yükseltilmiş parsel seçildiğinde bile SkewTCanvas alt atmosfer çevre eğrisini eksiksiz çizer.
 */
function buildEnvProfile(
  effectiveLevels: SoundingLevel[],
  surfaceP: number,
  surfaceTempC: number,
  surfaceDewPointC: number,
  stationElevationM: number
): EnvProfilePoint[] {
  const topP = 300;
  const startP = Math.max(topP, Math.round(surfaceP * 10) / 10);

  // Eğer effectiveLevels[0] yüzey basıncının belirgin altındaysa (örn. deniz seviyesinde P_sfc=1015, ilk izobar=1000),
  // çevre eğrisinin tam P_sfc noktasında yüzey T/Td ile başlaması için geçici referans dizisi oluştur.
  const curveLevels: SoundingLevel[] =
    effectiveLevels.length > 0 && startP > effectiveLevels[0].pressure + 1.5
      ? [
          {
            pressure: startP,
            altitudeM: stationElevationM,
            temperature: surfaceTempC,
            dewPoint: surfaceDewPointC,
            humidity: relativeHumidityFromDewPoint(surfaceTempC, surfaceDewPointC),
            windSpeedKt: effectiveLevels[0].windSpeedKt,
            windDirection: effectiveLevels[0].windDirection
          },
          ...effectiveLevels
        ]
      : effectiveLevels;

  const rawPressures: number[] = [startP, topP];
  for (const lvl of curveLevels) {
    if (lvl.pressure <= startP && lvl.pressure >= topP) {
      rawPressures.push(Math.round(lvl.pressure * 10) / 10);
    }
  }
  for (let p = Math.floor(startP / 10) * 10; p >= topP; p -= 10) {
    if (p <= startP && p >= topP) rawPressures.push(p);
  }

  rawPressures.sort((a, b) => b - a);

  const uniquePressures: number[] = [];
  for (const p of rawPressures) {
    if (
      uniquePressures.length === 0 ||
      uniquePressures[uniquePressures.length - 1] - p >= 0.25
    ) {
      uniquePressures.push(p);
    }
  }
  if (uniquePressures[uniquePressures.length - 1] !== topP) {
    if (uniquePressures[uniquePressures.length - 1] - topP < 0.25) {
      uniquePressures[uniquePressures.length - 1] = topP;
    } else {
      uniquePressures.push(topP);
    }
  }

  return uniquePressures.map((p) => {
    const env = interpolateProfile(curveLevels, p);
    const e = saturationVaporPressure(Math.min(env.dewPointC, env.tempC));
    const w = mixingRatio(e, p);
    const tvC = virtualTemperatureK(env.tempC, w) - 273.15;
    return {
      pressure: Number(p.toFixed(1)),
      altitudeM: Math.round(env.altitudeM),
      envTempC: Number(env.tempC.toFixed(2)),
      envDewPointC: Number(env.dewPointC.toFixed(2)),
      envTvC: Number(tvC.toFixed(2))
    };
  });
}

export type SoundingAnalysisInput = {
  surfaceTempC: number;
  surfaceHumidity: number;
  surfacePressureHpa: number;
  elevationM?: number;
  isStationPressure?: boolean;
  surfaceWindSpeedKmh?: number;
  surfaceWindSpeedKt?: number;
  surfaceWindDirection?: number;
  levels: SoundingLevel[];
};

export function analyzeConvectiveProfile(
  input: SoundingAnalysisInput
): CapeAnalysisResult {
  const clampedRh = clamp(input.surfaceHumidity, 1, 100);
  const surfaceDewPointC = dewPointMagnus(input.surfaceTempC, clampedRh);
  const wetBulbC = Number(wetBulbStullC(input.surfaceTempC, clampedRh).toFixed(1));

  const surfaceP = computeStationSurfacePressureHpa(input);
  const hasElevatedSurface =
    input.elevationM !== undefined &&
    Number.isFinite(input.elevationM) &&
    input.elevationM > 5;
  const stationElevationM =
    input.elevationM !== undefined && Number.isFinite(input.elevationM)
      ? Math.round(input.elevationM)
      : 0;

  // Ham sinoptik seviyeler (1000 hPa mutasyonu YOK; 500–1000 dam kalınlık hesabı için korunur)
  const rawSortedLevels: SoundingLevel[] =
    input.levels.length > 0
      ? [...input.levels]
          .sort((a, b) => b.pressure - a.pressure)
          .map((lvl) => ({ ...lvl }))
      : [
          {
            pressure: Math.round(surfaceP * 10) / 10,
            altitudeM: stationElevationM,
            temperature: input.surfaceTempC,
            dewPoint: surfaceDewPointC,
            humidity: Math.round(clampedRh),
            windSpeedKt: 0,
            windDirection: 0
          }
        ];

  // Yeraltı filtreleme & gerçek yüzey düğümü
  let effectiveLevels: InternalSoundingLevel[];
  if (hasElevatedSurface) {
    const elevM = input.elevationM!;
    const aboveGround = rawSortedLevels.filter(
      (lvl) => lvl.pressure < surfaceP - 1.5 && lvl.altitudeM > elevM + 8
    );
    const interpAtSfc = interpolateProfile(rawSortedLevels, surfaceP);
    const sfcWindKt =
      typeof input.surfaceWindSpeedKt === "number" && Number.isFinite(input.surfaceWindSpeedKt)
        ? Math.max(0, input.surfaceWindSpeedKt)
        : typeof input.surfaceWindSpeedKmh === "number" && Number.isFinite(input.surfaceWindSpeedKmh)
          ? Math.max(0, input.surfaceWindSpeedKmh * KMH_TO_KT)
          : aboveGround[0]?.windSpeedKt ?? interpAtSfc.windSpeedKt ?? 0;
    const sfcWindDir =
      typeof input.surfaceWindDirection === "number" && Number.isFinite(input.surfaceWindDirection)
        ? ((input.surfaceWindDirection % 360) + 360) % 360
        : aboveGround[0]?.windDirection ?? interpAtSfc.windDirection ?? 0;

    const sfcNode: InternalSoundingLevel = {
      pressure: Math.round(surfaceP * 10) / 10,
      altitudeM: Math.round(elevM),
      temperature: input.surfaceTempC,
      dewPoint: surfaceDewPointC,
      humidity: Math.round(clampedRh),
      windSpeedKt: sfcWindKt,
      windDirection: sfcWindDir,
      isSurface: true
    };
    effectiveLevels = [sfcNode, ...aboveGround];
  } else {
    const filtered = rawSortedLevels.filter((lvl) => lvl.pressure <= surfaceP + 5);
    effectiveLevels = filtered.length > 0 ? filtered : rawSortedLevels;
  }

  // 1. Yüzey Tabanlı SBCAPE & Tam Parsel Eğrisi
  const sbRaw = integrateParcelCape(
    effectiveLevels,
    input.surfaceTempC,
    surfaceDewPointC,
    surfaceP,
    10
  );
  const roundedSbCape = Math.max(0, Math.round(sbRaw.cape));
  const sbTrajectory: ParcelTrajectory = {
    mode: "sb",
    labelTr: "Yüzey Tabanlı (SB)",
    startPressureHpa: Number(surfaceP.toFixed(1)),
    startTempC: Number(input.surfaceTempC.toFixed(1)),
    startDewPointC: Number(surfaceDewPointC.toFixed(1)),
    cape: roundedSbCape,
    cin: sbRaw.cin,
    lclHeightM: Math.round(sbRaw.lcl.lclHeightM),
    lclPressureHpa: Math.round(sbRaw.lcl.lclPressureHpa),
    lfcPressureHpa: sbRaw.lfcPressureHpa !== null ? Math.round(sbRaw.lfcPressureHpa) : null,
    elPressureHpa: sbRaw.elPressureHpa !== null ? Math.round(sbRaw.elPressureHpa) : null,
    parcelProfile: sbRaw.parcelProfile
  };

  // 2. Mixed-Layer MLCAPE (en alt 0–100 hPa ortalama potansiyel sıcaklık θ ve karışım oranı w)
  const mlDepthHpa = Math.min(100, Math.max(20, surfaceP - 400));
  const mlSteps = 11;
  let sumThetaK = 0;
  let sumW = 0;
  for (let i = 0; i < mlSteps; i++) {
    const p = surfaceP - (mlDepthHpa * i) / (mlSteps - 1);
    const env =
      i === 0
        ? { tempC: input.surfaceTempC, dewPointC: surfaceDewPointC }
        : interpolateProfile(effectiveLevels, p);
    const e = saturationVaporPressure(Math.min(env.dewPointC, env.tempC));
    sumThetaK += potentialTemperatureK(env.tempC, p);
    sumW += mixingRatio(e, p);
  }
  const meanThetaK = sumThetaK / mlSteps;
  const meanW = sumW / mlSteps;
  const mlStartTempC = meanThetaK * Math.pow(surfaceP / 1000, KAPPA) - 273.15;
  const mlStartE = Math.max(0.05, (meanW * surfaceP) / (EPSILON + meanW));
  const mlLnRatio = Math.log(mlStartE / 6.112);
  const mlStartDewPointC = Math.min(
    mlStartTempC,
    (243.5 * mlLnRatio) / (17.67 - mlLnRatio)
  );

  const mlRaw = integrateParcelCape(
    effectiveLevels,
    mlStartTempC,
    mlStartDewPointC,
    surfaceP,
    10
  );
  const mlcape = Math.max(0, Math.round(mlRaw.cape));
  const mlcin = mlRaw.cin;
  const mlLclAglM = Math.max(0, Math.round(mlRaw.lcl.lclHeightM));

  const mlTrajectory: ParcelTrajectory = {
    mode: "ml",
    labelTr: "Karışım Tabakası (ML)",
    startPressureHpa: Number(surfaceP.toFixed(1)),
    startTempC: Number(mlStartTempC.toFixed(1)),
    startDewPointC: Number(mlStartDewPointC.toFixed(1)),
    cape: mlcape,
    cin: mlcin,
    lclHeightM: mlLclAglM,
    lclPressureHpa: Math.round(mlRaw.lcl.lclPressureHpa),
    lfcPressureHpa: mlRaw.lfcPressureHpa !== null ? Math.round(mlRaw.lfcPressureHpa) : null,
    elPressureHpa: mlRaw.elPressureHpa !== null ? Math.round(mlRaw.elPressureHpa) : null,
    parcelProfile: mlRaw.parcelProfile
  };

  // 3. Most-Unstable MUCAPE (P_sfc -> min(700, P_sfc - 250) hPa arası en yüksek θ_e parselini bul)
  const muTopP = Math.max(450, Math.min(700, surfaceP - 250));
  const candidateSet = new Set<number>([surfaceP]);
  for (const p of [975, 950, 925, 900, 875, 850, 825, 800, 775, 750, 725, 700, 650, 600]) {
    if (p <= surfaceP && p >= muTopP) candidateSet.add(p);
  }
  for (const lvl of effectiveLevels) {
    if (lvl.pressure <= surfaceP && lvl.pressure >= muTopP) candidateSet.add(lvl.pressure);
  }
  const candidatePs = [...candidateSet].sort((a, b) => b - a);

  let bestThetaE = -Infinity;
  let muStart = { p: surfaceP, t: input.surfaceTempC, td: surfaceDewPointC };
  for (const p of candidatePs) {
    const env =
      Math.abs(p - surfaceP) < 0.2
        ? { tempC: input.surfaceTempC, dewPointC: surfaceDewPointC }
        : interpolateProfile(effectiveLevels, p);
    const e = saturationVaporPressure(Math.min(env.dewPointC, env.tempC));
    const w = mixingRatio(e, p);
    const thE = equivalentPotentialTemperatureK(env.tempC, p, w, env.dewPointC);
    if (thE > bestThetaE) {
      bestThetaE = thE;
      muStart = { p, t: env.tempC, td: env.dewPointC };
    }
  }

  const muCandidate =
    Math.abs(muStart.p - surfaceP) < 0.2
      ? sbRaw
      : integrateParcelCape(effectiveLevels, muStart.t, muStart.td, muStart.p, 10);

  // MUCAPE >= max(SBCAPE, MLCAPE) fiziksel değişmezini garanti et
  let muChosen = muCandidate;
  let muOrigin = muStart;
  if (roundedSbCape > Math.round(muChosen.cape)) {
    muChosen = sbRaw;
    muOrigin = { p: surfaceP, t: input.surfaceTempC, td: surfaceDewPointC };
  }
  if (mlcape > Math.round(muChosen.cape)) {
    muChosen = mlRaw;
    muOrigin = { p: surfaceP, t: mlStartTempC, td: mlStartDewPointC };
  }

  const baseAltForAgl = hasElevatedSurface
    ? stationElevationM
    : interpolateProfile(effectiveLevels, surfaceP).altitudeM;
  const muOriginAltM =
    Math.abs(muOrigin.p - surfaceP) < 0.2
      ? baseAltForAgl
      : interpolateProfile(effectiveLevels, muOrigin.p).altitudeM;
  const muLclAglM = Math.max(
    0,
    Math.round(muOriginAltM - baseAltForAgl + muChosen.lcl.lclHeightM)
  );

  const mucape = Math.max(0, Math.round(muChosen.cape));
  const mucin = muChosen.cin;

  const muTrajectory: ParcelTrajectory = {
    mode: "mu",
    labelTr: "En Kararsız (MU)",
    startPressureHpa: Number(muOrigin.p.toFixed(1)),
    startTempC: Number(muOrigin.t.toFixed(1)),
    startDewPointC: Number(muOrigin.td.toFixed(1)),
    cape: mucape,
    cin: mucin,
    lclHeightM: muLclAglM,
    lclPressureHpa: Math.round(muChosen.lcl.lclPressureHpa),
    lfcPressureHpa: muChosen.lfcPressureHpa !== null ? Math.round(muChosen.lfcPressureHpa) : null,
    elPressureHpa: muChosen.elPressureHpa !== null ? Math.round(muChosen.elPressureHpa) : null,
    parcelProfile: muChosen.parcelProfile
  };

  const env850 = interpolateProfile(effectiveLevels, 850);
  const env700 = interpolateProfile(effectiveLevels, 700);
  const env500 = interpolateProfile(effectiveLevels, 500);

  const parcel500FromSfc = liftParcelToPressure(
    input.surfaceTempC,
    surfaceDewPointC,
    surfaceP,
    500
  );
  const liftedIndex = env500.tempC - parcel500FromSfc;

  const showalterStartP = Math.min(surfaceP, 850);
  const envShowalter = interpolateProfile(effectiveLevels, showalterStartP);
  const parcel500From850 = liftParcelToPressure(
    envShowalter.tempC,
    envShowalter.dewPointC,
    showalterStartP,
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

  // 0–6 km Bulk Wind Shear (yüksek rakımda gerçek 0–6 km AGL, deniz seviyesinde standart 1000->500 hPa)
  let bulkShear06Kt: number;
  if (hasElevatedSurface) {
    const uvLow = interpolateUvAtAltitudeM(effectiveLevels, effectiveLevels[0].altitudeM);
    const uvHigh = interpolateUvAtAltitudeM(
      effectiveLevels,
      effectiveLevels[0].altitudeM + 6000
    );
    const lowW = uvMsToWindKtDir(uvLow.u, uvLow.v);
    const highW = uvMsToWindKtDir(uvHigh.u, uvHigh.v);
    bulkShear06Kt = computeBulkWindShearKt(
      lowW.windSpeedKt,
      lowW.windDirection,
      highW.windSpeedKt,
      highW.windDirection
    );
  } else {
    const env1000 = interpolateProfile(effectiveLevels, 1000);
    bulkShear06Kt = computeBulkWindShearKt(
      env1000.windSpeedKt,
      env1000.windDirection,
      env500.windSpeedKt,
      env500.windDirection
    );
  }
  const bulkShear06Ms = bulkShear06Kt * KT_TO_MS;

  // 4. Bunkers 0–1 km & 0–3 km AGL SRH, SPC SCP, SPC Sabit-Tabaka STP, Craven-Brooks ve DCAPE
  const { srh01, srh03 } = computeBunkersSrh(effectiveLevels);
  const effectiveShearTerm =
    bulkShear06Ms < 10 ? 0 : Math.min(1.5, bulkShear06Ms / 20);
  const scpCinTerm =
    mucin >= -40 ? 1 : mucin <= -180 ? 0 : Math.max(0, Math.min(1, -40 / mucin));
  const scp =
    mucape >= 450 && scpCinTerm > 0
      ? Number(
          Math.max(
            0,
            (mucape / 1000) * (srh03 / 50) * effectiveShearTerm * scpCinTerm
          ).toFixed(2)
        )
      : 0;

  // SPC Thompson et al. Sabit-Tabaka Significant Tornado Parameter (STP)
  // Z_mllcl AGL metredir!
  const lclTerm =
    mlLclAglM < 1000
      ? 1
      : mlLclAglM > 2000
        ? 0
        : (2000 - mlLclAglM) / 1000;
  const bwdTerm =
    bulkShear06Ms < 12.5 ? 0 : Math.min(1.5, bulkShear06Ms / 20);
  const cinTerm =
    mlcin >= -50 ? 1 : mlcin <= -200 ? 0 : (200 + mlcin) / 150;
  const stp =
    mlcape > 0
      ? Number(
          Math.max(
            0,
            (mlcape / 1500) *
              lclTerm *
              (Math.max(0, srh01) / 150) *
              bwdTerm *
              cinTerm
          ).toFixed(2)
        )
      : 0;

  const sigSevere = Math.round(mucape * bulkShear06Ms);
  const dcape = computeDcape(effectiveLevels, surfaceP);

  // Gerçek dinamik jeopotansiyel yükseklik farkından 700–500 hPa lapse rate (°C/km)
  const dz700500Km = Math.max(1.5, (env500.altitudeM - env700.altitudeM) / 1000);
  const lapseRate700500 = Number(((env700.tempC - env500.tempC) / dz700500Km).toFixed(1));

  // Sinoptik 500–1000 hPa jeopotansiyel kalınlık (filtreleme öncesi ham rawSortedLevels üzerinden!)
  const rawEnv1000 = interpolateProfile(rawSortedLevels, 1000);
  const rawEnv500 = interpolateProfile(rawSortedLevels, 500);
  const thickness5001000Dam = Number(
    ((rawEnv500.altitudeM - rawEnv1000.altitudeM) / 10).toFixed(1)
  );

  // 0°C Donma Sınırı (effectiveLevels üzerinde en üstteki T >= 0 -> T < 0 geçişi)
  const { freezingLevelM, freezingPressureHpa } = computeFreezingLevel(
    effectiveLevels,
    stationElevationM,
    surfaceP
  );

  // Kesintisiz P_sfc -> 300 hPa çevre T, Td, Tv profili
  const envProfile = buildEnvProfile(
    effectiveLevels,
    surfaceP,
    input.surfaceTempC,
    surfaceDewPointC,
    stationElevationM
  );

  const levels: ComputedLevelMetrics[] = effectiveLevels.map((lvl) => {
    const e = saturationVaporPressure(Math.min(lvl.dewPoint, lvl.temperature));
    const w = mixingRatio(e, lvl.pressure);
    const row: ComputedLevelMetrics = {
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
    if (lvl.isSurface) {
      row.isSurface = true;
    }
    return row;
  });

  return {
    cape: sbTrajectory.cape,
    cin: sbTrajectory.cin,
    mucape,
    mucin,
    muParcelPressureHpa: Math.round(muTrajectory.startPressureHpa),
    mlcape,
    mlcin,
    dcape,
    srh01,
    srh03,
    scp,
    stp,
    sigSevere,
    wetBulbC,
    lclHeightM: sbTrajectory.lclHeightM,
    lclPressureHpa: sbTrajectory.lclPressureHpa,
    lfcPressureHpa: sbTrajectory.lfcPressureHpa,
    elPressureHpa: sbTrajectory.elPressureHpa,
    liftedIndex: Number(liftedIndex.toFixed(1)),
    showalterIndex: Number(showalterIndex.toFixed(1)),
    kIndex: Number(kIndex.toFixed(1)),
    totalTotals: Number(totalTotals.toFixed(1)),
    sweatIndex: Math.round(sweatIndex),
    bulkShear06Kt,
    lapseRate700500,
    thickness5001000Dam,
    surfaceDewPointC: Number(surfaceDewPointC.toFixed(1)),
    surfacePressureHpa: Number(surfaceP.toFixed(1)),
    stationElevationM,
    freezingLevelM,
    freezingPressureHpa,
    capeRisk: classifyCapeRisk(Math.max(sbTrajectory.cape, mucape)),
    liRisk: classifyLiftedIndexRisk(liftedIndex),
    kRisk: classifyKIndexRisk(kIndex),
    levels,
    envProfile,
    parcelProfile: sbTrajectory.parcelProfile,
    parcels: {
      mu: muTrajectory,
      sb: sbTrajectory,
      ml: mlTrajectory
    }
  };
}
