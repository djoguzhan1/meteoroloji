import { SEVEN_MODEL_KEYS } from "./metar-verify";
import { wetBulbStullC } from "./thermo-cape";
import type {
  HybridModelSnapshot,
  MetarWxFlags,
  PrecipPhase,
  PrecipitationConsensus,
  PrecipType,
  SevenModelKey
} from "./weather-types";

export type EnsembleDistStats = {
  count: number;
  mean: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  max: number;
  probGe01: number; // 0..100
  probGe2: number; // 0..100
  probGe5: number; // 0..100
  probGe15: number; // 0..100
};

/**
 * Sıralı diziden doğrusal enterpolasyonlu yüzdelik dilim (q ∈ [0, 1]).
 */
export function quantileSorted(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const pos = Math.max(0, Math.min(1, q)) * (sorted.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.min(sorted.length - 1, lo + 1);
  const frac = pos - lo;
  return sorted[lo] + (sorted[hi] - sorted[lo]) * frac;
}

/**
 * 122-üyeli gerçek ensemble dizisinden (ECMWF ENS + ICON-EPS + GEFS)
 * dağılım istatistikleri ve eşik aşım olasılıklarını çıkarır.
 */
export function computeEnsembleDistStats(values: number[]): EnsembleDistStats | null {
  const clean = values.filter((v) => typeof v === "number" && Number.isFinite(v));
  const n = clean.length;
  if (n === 0) return null;
  clean.sort((a, b) => a - b);

  let sum = 0;
  let ge01 = 0;
  let ge2 = 0;
  let ge5 = 0;
  let ge15 = 0;
  for (const v of clean) {
    sum += v;
    if (v >= 0.1) ge01++;
    if (v >= 2.0) ge2++;
    if (v >= 5.0) ge5++;
    if (v >= 15.0) ge15++;
  }

  return {
    count: n,
    mean: sum / n,
    p10: quantileSorted(clean, 0.1),
    p25: quantileSorted(clean, 0.25),
    p50: quantileSorted(clean, 0.5),
    p75: quantileSorted(clean, 0.75),
    p90: quantileSorted(clean, 0.9),
    max: clean[n - 1],
    probGe01: (ge01 / n) * 100,
    probGe2: (ge2 / n) * 100,
    probGe5: (ge5 / n) * 100,
    probGe15: (ge15 / n) * 100
  };
}

export type FusedPrecipResult = {
  precipitationMm: number;
  precipProbabilityPct: number;
  consensus: PrecipitationConsensus;
};

/**
 * ATMOS-Core v4.5 Yağış Füzyon Motoru:
 * - 122-Üye Ensemble PoP + 7-Model Ağırlıklı PoP + 0–2s Canlı METAR / 15dk Nowcast Kalibrasyonu
 * - Probability-Matched Mean (PMM — Ebert 2001): hayalet çiseleme (drizzle bias) bastırılır,
 *   gerçek sağanakların tepe şiddeti aritmetik ortalamayla ezilmez!
 */
export function fusePrecipitationHour({
  detSnapshot,
  detWeights,
  ensembleMembersMm,
  rawPrecipFallbackMm,
  rawPopFallbackPct,
  leadHour,
  nowcast15Mm = null,
  liveMetarWx = null
}: {
  detSnapshot: HybridModelSnapshot;
  detWeights: Record<SevenModelKey, number>;
  ensembleMembersMm: number[] | null;
  rawPrecipFallbackMm: number;
  rawPopFallbackPct: number;
  leadHour: number;
  nowcast15Mm?: number | null;
  liveMetarWx?: MetarWxFlags | null;
}): FusedPrecipResult {
  const detVals: number[] = [];
  let detWeightedMmNum = 0;
  let detWeightedPopNum = 0;
  let detWeightDen = 0;

  for (const k of SEVEN_MODEL_KEYS) {
    const v = detSnapshot[k];
    const w = detWeights[k] ?? 0;
    if (v !== null && v !== undefined && Number.isFinite(v) && w > 0) {
      const safeV = Math.max(0, v);
      detVals.push(safeV);
      detWeightedMmNum += safeV * w;
      // Deterministik modelin yumuşak yağış ikilisi (0.08 mm altı gürültü azaltılır)
      const wetSignal = safeV >= 0.1 ? 1 - Math.exp(-safeV / 0.25) : 0;
      detWeightedPopNum += wetSignal * 100 * w;
      detWeightDen += w;
    }
  }

  detVals.sort((a, b) => a - b);
  const agreeingModels = detVals.filter((v) => v >= 0.1).length;
  const totalModels = detVals.length;
  const detWeightedMean =
    detWeightDen > 0 ? detWeightedMmNum / detWeightDen : Math.max(0, rawPrecipFallbackMm);
  const detWeightedPop =
    detWeightDen > 0 ? detWeightedPopNum / detWeightDen : rawPopFallbackPct;

  const eps =
    ensembleMembersMm && ensembleMembersMm.length >= 10
      ? computeEnsembleDistStats(ensembleMembersMm)
      : null;

  // 1. Kalibre Yağış Olasılığı (0..100%)
  let calibratedPop: number;
  if (eps) {
    // 122-üye olasılıksal dağılım + 7 yüksek çözünürlüklü model uzlaşısı + Open-Meteo referansı
    calibratedPop =
      eps.probGe01 * 0.58 + detWeightedPop * 0.3 + rawPopFallbackPct * 0.12;
  } else if (totalModels >= 3) {
    calibratedPop = detWeightedPop * 0.62 + rawPopFallbackPct * 0.38;
  } else {
    calibratedPop = rawPopFallbackPct;
  }

  // 0–2s Nowcast & Canlı Fiziksel METAR wxString Asimilasyonu
  const metarWetNow = Boolean(leadHour <= 1 && liveMetarWx?.hasPrecip);
  if (leadHour === 0 && liveMetarWx?.hasPrecip) {
    calibratedPop = Math.max(calibratedPop, liveMetarWx.heavyPrecip ? 96 : 88);
  } else if (leadHour === 1 && liveMetarWx?.hasPrecip) {
    calibratedPop = Math.max(calibratedPop, 68);
  }
  if (leadHour <= 2 && nowcast15Mm !== null && nowcast15Mm >= 0.15) {
    calibratedPop = Math.max(calibratedPop, Math.min(95, 55 + nowcast15Mm * 22));
  }
  calibratedPop = Math.round(Math.max(0, Math.min(100, calibratedPop)));

  // 2. Probability-Matched Mean (PMM — Ebert 2001)
  let pmmMm = detWeightedMean;
  const pFrac = calibratedPop / 100;

  if (calibratedPop < 18 && agreeingModels < 2 && !metarWetNow) {
    // Hayalet çiseleme (drizzle bias) bastırma: < %18 olasılık ve < 2/7 uzlaşıda 0 mm
    pmmMm = 0;
  } else if (eps) {
    // Islak senaryoların orta yoğunluğu: q = 1 - 0.5 * pFrac (Ebert PMM yüzdelik eşlemesi)
    const matchedQ = Math.max(0.5, Math.min(0.92, 1 - 0.5 * Math.max(0.15, pFrac)));
    const epsMatched = quantileSorted(
      [...ensembleMembersMm!].filter((v) => Number.isFinite(v)).sort((a, b) => a - b),
      matchedQ
    );
    // Yüksek çözünürlüklü 7-model ağırlıklı ortalama ile PMM yüzdeliğinin fiziki birleşimi
    const wetScale = Math.min(1, calibratedPop / 55);
    const highResAnchor = Math.max(detWeightedMean, quantileSorted(detVals, 0.65));
    pmmMm = wetScale * (highResAnchor * 0.58 + epsMatched * 0.42);
  } else if (totalModels >= 3) {
    const detP65 = quantileSorted(detVals, 0.65);
    const wetScale = Math.min(1, calibratedPop / 55);
    pmmMm = wetScale * (detWeightedMean * 0.6 + detP65 * 0.4);
  }

  // Canlı 0–1 saat fiziksel METAR yağışı veya 15dk nowcast miktarını harmanla
  if (leadHour <= 1 && nowcast15Mm !== null && Number.isFinite(nowcast15Mm)) {
    const ncW = leadHour === 0 ? 0.45 : 0.25;
    pmmMm = pmmMm * (1 - ncW) + Math.max(0, nowcast15Mm) * ncW;
  }
  if (leadHour === 0 && liveMetarWx?.hasPrecip) {
    pmmMm = Math.max(pmmMm, liveMetarWx.heavyPrecip ? 3.5 : 0.4);
  }

  const finalMm = Number(Math.max(0, pmmMm).toFixed(2));
  const minMm = detVals.length > 0 ? Number(detVals[0].toFixed(1)) : 0;
  const medianMm =
    detVals.length > 0 ? Number(quantileSorted(detVals, 0.5).toFixed(1)) : 0;
  const maxMm =
    detVals.length > 0 ? Number(detVals[detVals.length - 1].toFixed(1)) : 0;

  return {
    precipitationMm: finalMm,
    precipProbabilityPct: calibratedPop,
    consensus: {
      agreeingModels,
      totalModels,
      minMm,
      medianMm,
      maxMm,
      p10Mm: eps ? Number(eps.p10.toFixed(1)) : minMm,
      p50Mm: eps ? Number(eps.p50.toFixed(1)) : medianMm,
      p90Mm: eps ? Number(eps.p90.toFixed(1)) : maxMm,
      heavyProbPct: eps
        ? Math.round(eps.probGe5)
        : totalModels > 0
          ? Math.round((detVals.filter((v) => v >= 5).length / totalModels) * 100)
          : 0,
      extremeProbPct: eps
        ? Math.round(eps.probGe15)
        : totalModels > 0
          ? Math.round((detVals.filter((v) => v >= 15).length / totalModels) * 100)
          : 0,
      ensembleMembers: eps?.count ?? 0
    }
  };
}

/**
 * Fiziksel Yağış Fazı Sınıflandırıcısı (Stull 2011 Islak Termometre Tw + Kalınlık + Donma Seviyesi + Dolu):
 * - none: yağış yok
 * - hail: yüksek MUCAPE + güçlü 0–6 km shear + aktif konvektif sağanak (veya canlı METAR GR)
 * - snow: Tw <= 0.4°C ve (500–1000 kalınlık <= 542 dam veya donma seviyesi yakın veya kar verisi)
 * - sleet: 0.4°C < Tw <= 1.6°C (karla karışık yağmur / sulu kar geçiş bandı)
 * - rain: sıvı yağmur
 */
export function classifyPrecipPhase({
  temperatureC,
  humidityPct,
  precipitationMm,
  snowfallCm = 0,
  weatherCode = 0,
  temp850hPa = null,
  thickness5001000Dam = null,
  freezingLevelM = null,
  elevationM = 0,
  mucape = 0,
  bulkShear06Kt = 0,
  liveMetarWx = null
}: {
  temperatureC: number;
  humidityPct: number;
  precipitationMm: number;
  snowfallCm?: number;
  weatherCode?: number;
  temp850hPa?: number | null;
  thickness5001000Dam?: number | null;
  freezingLevelM?: number | null;
  elevationM?: number;
  mucape?: number;
  bulkShear06Kt?: number;
  liveMetarWx?: MetarWxFlags | null;
}): {
  precipPhase: PrecipPhase;
  precipType: PrecipType;
  wetBulbC: number;
  phaseLabel: string;
} {
  const wetBulbC = Number(wetBulbStullC(temperatureC, humidityPct).toFixed(1));
  const wmoWet =
    (weatherCode >= 51 && weatherCode <= 86) || weatherCode >= 95;
  const hasAnyPrecip =
    precipitationMm >= 0.08 ||
    snowfallCm >= 0.05 ||
    wmoWet ||
    Boolean(liveMetarWx?.hasPrecip);

  if (!hasAnyPrecip) {
    return { precipPhase: "none", precipType: "none", wetBulbC, phaseLabel: "Yağış Yok" };
  }

  // 1. Dolu (Hail) tespiti
  const freezingAboveGround =
    freezingLevelM !== null ? freezingLevelM - elevationM : 2600;
  const isHail =
    Boolean(liveMetarWx?.hasHail) ||
    weatherCode === 96 ||
    weatherCode === 99 ||
    (precipitationMm >= 2.0 &&
      mucape >= 1200 &&
      bulkShear06Kt >= 28 &&
      freezingAboveGround >= 1500 &&
      freezingAboveGround <= 4300);

  if (isHail) {
    return { precipPhase: "hail", precipType: "rain", wetBulbC, phaseLabel: "Dolu Riski" };
  }

  // 2. Kar (Snow) tespiti — Stull Tw + 500–1000 kalınlık + 850 hPa + donma seviyesi
  const coldColumn =
    (thickness5001000Dam !== null && thickness5001000Dam <= 542) ||
    (temp850hPa !== null && temp850hPa <= -3.5) ||
    (freezingLevelM !== null && freezingLevelM - elevationM <= 350);

  const wmoSnow =
    (weatherCode >= 71 && weatherCode <= 77) || weatherCode === 85 || weatherCode === 86;

  if (
    liveMetarWx?.hasSnow ||
    (wetBulbC <= 0.4 && (coldColumn || snowfallCm >= 0.05 || wmoSnow || temperatureC <= 1.2)) ||
    (snowfallCm >= 0.25 && wetBulbC <= 1.0)
  ) {
    return { precipPhase: "snow", precipType: "snow", wetBulbC, phaseLabel: "Kar Yağışı" };
  }

  // 3. Karla Karışık Yağmur (Sleet / Wet Snow)
  const borderlineCold =
    (thickness5001000Dam !== null && thickness5001000Dam <= 546) ||
    (freezingLevelM !== null && freezingLevelM - elevationM <= 650) ||
    (temp850hPa !== null && temp850hPa <= -1.5);

  if (wetBulbC <= 1.6 && (borderlineCold || snowfallCm >= 0.05)) {
    return {
      precipPhase: "sleet",
      precipType: "snow",
      wetBulbC,
      phaseLabel: "Karla Karışık"
    };
  }

  return { precipPhase: "rain", precipType: "rain", wetBulbC, phaseLabel: "Yağmur" };
}
