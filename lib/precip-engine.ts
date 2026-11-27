import { CORE_MODEL_KEYS } from "./model-registry";
import { wetBulbStullC } from "./thermo-cape";
import type { BursaSynopticRegime } from "./topographic-cressman";
import {
  type CoreModelKey,
  type HybridModelSnapshot,
  type MetarWxFlags,
  PRECIP_WETNESS_CONTRACT,
  type PrecipPhase,
  type PrecipitationConsensus,
  type PrecipType
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

export type HydrometeorPhase =
  | "none"
  | "rain"
  | "freezing_rain"
  | "sleet"
  | "wet_snow"
  | "dry_snow"
  | "hail";

export function computeStullWetBulbC(tempC: number, rhPct: number): number {
  return wetBulbStullC(tempC, rhPct);
}

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

function weightedQuantile(sortedItems: Array<{ v: number; w: number }>, q: number): number {
  if (sortedItems.length === 0) return 0;
  const totalW = sortedItems.reduce((acc, x) => acc + x.w, 0);
  if (totalW <= 0) return sortedItems[Math.floor(sortedItems.length * q)]?.v ?? 0;
  let cum = 0;
  const target = q * totalW;
  for (const item of sortedItems) {
    cum += item.w;
    if (cum >= target) return item.v;
  }
  return sortedItems[sortedItems.length - 1].v;
}

/**
 * 212-üyeli gerçek AI+Fizik ensemble dizisinden (ECMWF ENS + AIFS-ENS + ICON-EPS + GEFS + GEM + UKMO)
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
 * ATMOS v5.0 Küresel 8-Model + 212-Üye Ensemble Yağış Füzyon Motoru:
 * - 212-Üye Ensemble PoP + 8-Model Ağırlıklı PoP + 0–2s Canlı İstasyon / 15dk Nowcast Kalibrasyonu
 * - Probability-Matched Mean (PMM — Ebert 2001): hayalet çiseleme bastırılır, sağanak tepe şiddeti korunur.
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
  detWeights: Record<CoreModelKey, number>;
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

  for (const k of CORE_MODEL_KEYS) {
    const v = detSnapshot[k];
    const w = detWeights[k] ?? 0;
    if (v !== null && v !== undefined && Number.isFinite(v) && w > 0) {
      const safeV = Math.max(0, v);
      detVals.push(safeV);
      detWeightedMmNum += safeV * w;
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

  let calibratedPop: number;
  if (eps) {
    calibratedPop =
      eps.probGe01 * 0.58 + detWeightedPop * 0.3 + rawPopFallbackPct * 0.12;
  } else if (totalModels >= 3) {
    calibratedPop = detWeightedPop * 0.62 + rawPopFallbackPct * 0.38;
  } else {
    calibratedPop = rawPopFallbackPct;
  }

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

  let pmmMm = detWeightedMean;
  const pFrac = calibratedPop / 100;

  if (calibratedPop < 18 && agreeingModels < 2 && !metarWetNow) {
    pmmMm = 0;
  } else if (eps) {
    const matchedQ = Math.max(0.5, Math.min(0.92, 1 - 0.5 * Math.max(0.15, pFrac)));
    const epsMatched = quantileSorted(
      [...ensembleMembersMm!].filter((v) => Number.isFinite(v)).sort((a, b) => a - b),
      matchedQ
    );
    const wetScale = Math.min(1, calibratedPop / 55);
    const highResAnchor = Math.max(detWeightedMean, quantileSorted(detVals, 0.65));
    pmmMm = wetScale * (highResAnchor * 0.58 + epsMatched * 0.42);
  } else if (totalModels >= 3) {
    const detP65 = quantileSorted(detVals, 0.65);
    const wetScale = Math.min(1, calibratedPop / 55);
    pmmMm = wetScale * (detWeightedMean * 0.6 + detP65 * 0.4);
  }

  if (leadHour <= 1 && nowcast15Mm !== null && Number.isFinite(nowcast15Mm)) {
    const ncW = leadHour === 0 ? 0.45 : 0.25;
    pmmMm = pmmMm * (1 - ncW) + Math.max(0, nowcast15Mm) * ncW;
  }
  if (leadHour === 0 && liveMetarWx?.hasPrecip) {
    pmmMm = Math.max(pmmMm, liveMetarWx.heavyPrecip ? 3.5 : 0.4);
  }

  const rawFinalMm = Number(Math.max(0, pmmMm).toFixed(2));
  const finalMm =
    rawFinalMm < PRECIP_WETNESS_CONTRACT.WET_ACTIVE_MIN_MM && !metarWetNow
      ? 0
      : rawFinalMm;
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

export interface PrecipStepFusionInput {
  leadHours: number;
  regime: BursaSynopticRegime;
  modelPrecipMm: Array<{
    modelKey: string;
    precipMmHr: number;
    weight: number;
    resolutionKm?: number;
  }>;
  /** 9-noktalı mekansal Bursa şablonu yağış miktarları (mm/s) */
  spatialNeighborhoodMm?: number[];
  /** +/-2 saatlik zamansal pencere PoP [0..100] (Gün 3-7 cephe faz kaymalarını yakalar) */
  temporalWindowPopPct?: number | null;
  /** Resmi MGM ALARO mezoskaleli ıslak saat/gün göstergesi */
  mgmOfficialWet?: boolean | null;
  ensemblePopPct?: number | null;
  ensembleP50Mm?: number | null;
  ensembleP75Mm?: number | null;
  ensembleP90Mm?: number | null;
  temp2mC: number;
  relHumidityPct: number;
  freezingLevelM?: number | null;
  snowfallHeightM?: number | null;
  temp850C?: number | null;
  capeJkg?: number | null;
  lpiJkg?: number | null;
  targetElevationM: number;
}

export interface PrecipStepFusionOutput {
  isWetHour: boolean;
  calibratedPopPct: number;
  qpfMmHr: number;
  qpfP10MmHr: number;
  qpfP90MmHr: number;
  drizzleSuppressed: boolean;
  phase: HydrometeorPhase;
  snowLineElevationM: number;
  wetBulbC: number;
}

export function classifyHydrometeorPhase(params: {
  isWetHour: boolean;
  qpfMmHr: number;
  temp2mC: number;
  relHumidityPct: number;
  targetElevationM: number;
  freezingLevelM?: number | null;
  snowfallHeightM?: number | null;
  temp850C?: number | null;
  capeJkg?: number | null;
  lpiJkg?: number | null;
}): { phase: HydrometeorPhase; wetBulbC: number; snowLineElevationM: number } {
  const wetBulbC = computeStullWetBulbC(params.temp2mC, params.relHumidityPct);

  const estFreezingM =
    params.freezingLevelM ?? Math.max(0, params.targetElevationM + (params.temp2mC / 6.2) * 1000);
  const snowLineElevationM = Math.round(
    params.snowfallHeightM ?? Math.max(0, estFreezingM - 280)
  );

  if (
    !params.isWetHour ||
    !Number.isFinite(params.qpfMmHr) ||
    params.qpfMmHr < PRECIP_WETNESS_CONTRACT.WET_ACTIVE_MIN_MM
  ) {
    return { phase: "none", wetBulbC: Number(wetBulbC.toFixed(2)), snowLineElevationM };
  }

  if (
    ((params.lpiJkg ?? 0) >= 12 || (params.capeJkg ?? 0) >= 1350) &&
    params.qpfMmHr >= 6.5 &&
    params.temp2mC >= 4
  ) {
    return { phase: "hail", wetBulbC: Number(wetBulbC.toFixed(2)), snowLineElevationM };
  }

  if (
    params.temp850C !== null &&
    params.temp850C !== undefined &&
    params.temp850C >= 1.0 &&
    wetBulbC <= 0.1
  ) {
    return {
      phase: params.temp2mC <= -0.3 ? "freezing_rain" : "sleet",
      wetBulbC: Number(wetBulbC.toFixed(2)),
      snowLineElevationM
    };
  }

  if (wetBulbC <= -0.4) {
    return { phase: "dry_snow", wetBulbC: Number(wetBulbC.toFixed(2)), snowLineElevationM };
  }
  if (wetBulbC <= 0.75) {
    return { phase: "wet_snow", wetBulbC: Number(wetBulbC.toFixed(2)), snowLineElevationM };
  }
  if (wetBulbC <= 1.45) {
    return { phase: "sleet", wetBulbC: Number(wetBulbC.toFixed(2)), snowLineElevationM };
  }
  return { phase: "rain", wetBulbC: Number(wetBulbC.toFixed(2)), snowLineElevationM };
}

/**
 * ATMOS v5.0 — Zamansal-Mekansal CSGD-EMOS PoP & PM-QM Yağış Çözücüsü (Bursa / Uludağ Alanı):
 * - +/-2s zamansal pencere ve 9-nokta Bursa mekansal şablonuyla cephe faz kaymalarını yakalar,
 * - Lodos Föhn kuru alt-bulut rejiminde sahte çiselemeyi bastırır,
 * - Aşama-B Probability-Matched Quantile Mapping (PM-QM) ile konvektif/orografik sağanak şiddetini korur.
 */
export function fusePrecipitationPmqm(input: PrecipStepFusionInput): PrecipStepFusionOutput {
  const validModels = input.modelPrecipMm.filter(
    (m) => Number.isFinite(m.precipMmHr) && m.precipMmHr >= 0 && m.weight > 0
  );

  if (validModels.length === 0) {
    const ph = classifyHydrometeorPhase({
      isWetHour: false,
      qpfMmHr: 0,
      temp2mC: input.temp2mC,
      relHumidityPct: input.relHumidityPct,
      targetElevationM: input.targetElevationM,
      freezingLevelM: input.freezingLevelM,
      snowfallHeightM: input.snowfallHeightM,
      temp850C: input.temp850C,
      capeJkg: input.capeJkg,
      lpiJkg: input.lpiJkg
    });
    return {
      isWetHour: false,
      calibratedPopPct: 0,
      qpfMmHr: 0,
      qpfP10MmHr: 0,
      qpfP90MmHr: 0,
      drizzleSuppressed: false,
      ...ph
    };
  }

  const sumW = validModels.reduce((acc, m) => acc + m.weight, 0);
  const normModels = validModels.map((m) => ({ ...m, w: m.weight / sumW }));

  const modelWetCutoffMm = input.regime === "LODOS_FOEHN" ? 0.36 : 0.20;

  let detWetFraction = 0;
  let arithmeticMeanMm = 0;
  for (const m of normModels) {
    arithmeticMeanMm += m.w * m.precipMmHr;
    if (m.precipMmHr >= modelWetCutoffMm) {
      detWetFraction += m.w;
    } else if (m.precipMmHr >= 0.10) {
      detWetFraction += input.regime === "LODOS_FOEHN" ? 0 : 0.35 * m.w;
    }
  }

  const ensPopFrac =
    input.ensemblePopPct !== null && input.ensemblePopPct !== undefined
      ? Math.max(0, Math.min(1, input.ensemblePopPct / 100))
      : detWetFraction;

  const ensBlend = Math.min(0.68, 0.25 + (input.leadHours / 168) * 0.43);
  let rawPop = (1 - ensBlend) * detWetFraction + ensBlend * ensPopFrac;

  if (
    input.leadHours >= 54 &&
    input.temporalWindowPopPct !== null &&
    input.temporalWindowPopPct !== undefined
  ) {
    const winFrac = Math.max(0, Math.min(1, input.temporalWindowPopPct / 100));
    const winBlend = Math.min(0.32, ((input.leadHours - 54) / 114) * 0.32);
    rawPop = (1 - winBlend) * rawPop + winBlend * winFrac;
  }

  if (
    input.spatialNeighborhoodMm &&
    input.spatialNeighborhoodMm.length >= 5 &&
    input.regime !== "LODOS_FOEHN"
  ) {
    const spatialWetFrac =
      input.spatialNeighborhoodMm.filter((v) => v >= 0.25).length /
      input.spatialNeighborhoodMm.length;
    if (spatialWetFrac >= 0.44 && rawPop >= 0.22) {
      rawPop = 0.82 * rawPop + 0.18 * spatialWetFrac;
    }
  }

  if (input.mgmOfficialWet === true && rawPop >= 0.24) {
    rawPop = Math.min(1, rawPop + 0.08);
  } else if (input.mgmOfficialWet === false && rawPop <= 0.38) {
    rawPop = Math.max(0, rawPop - 0.05);
  }

  if (input.regime === "LODOS_FOEHN" && input.relHumidityPct < 58) {
    rawPop *= 0.62;
  } else if (input.regime === "POYRAZ_KARAYEL_ADV" && input.relHumidityPct >= 82) {
    rawPop = Math.min(1, rawPop * 1.12);
  }

  const logisticCentered = 1 / (1 + Math.exp(-7.2 * (rawPop - 0.44)));
  const calibratedPopPct = Math.round(
    Math.max(0, Math.min(100, 100 * (0.55 * rawPop + 0.45 * logisticCentered)))
  );

  const decisionPopThreshold =
    input.regime === "LODOS_FOEHN" ? 48 : input.leadHours >= 96 ? 39 : 42;
  const isWetHour = calibratedPopPct >= decisionPopThreshold;
  const drizzleSuppressed = !isWetHour && arithmeticMeanMm >= 0.08;

  if (!isWetHour) {
    const ph = classifyHydrometeorPhase({
      isWetHour: false,
      qpfMmHr: 0,
      temp2mC: input.temp2mC,
      relHumidityPct: input.relHumidityPct,
      targetElevationM: input.targetElevationM,
      freezingLevelM: input.freezingLevelM,
      snowfallHeightM: input.snowfallHeightM,
      temp850C: input.temp850C,
      capeJkg: input.capeJkg,
      lpiJkg: input.lpiJkg
    });
    return {
      isWetHour: false,
      calibratedPopPct,
      qpfMmHr: 0,
      qpfP10MmHr: 0,
      qpfP90MmHr: Number(Math.max(0, input.ensembleP90Mm ?? arithmeticMeanMm * 1.5).toFixed(2)),
      drizzleSuppressed,
      ...ph
    };
  }

  const sortedModels = [...normModels]
    .map((m) => ({ v: m.precipMmHr, w: m.w }))
    .sort((a, b) => a.v - b.v);

  const targetQuantile = Math.min(0.80, 0.52 + 0.28 * (calibratedPopPct / 100));
  let pmQmAmount = weightedQuantile(sortedModels, targetQuantile);

  if (input.spatialNeighborhoodMm && input.spatialNeighborhoodMm.length >= 3) {
    const sortedSpatial = [...input.spatialNeighborhoodMm].sort((a, b) => a - b);
    const spatialQ70 =
      sortedSpatial[Math.min(sortedSpatial.length - 1, Math.floor(sortedSpatial.length * 0.70))];
    pmQmAmount = 0.72 * pmQmAmount + 0.28 * spatialQ70;
  }

  if (input.leadHours >= 84 && input.ensembleP75Mm !== null && input.ensembleP75Mm !== undefined) {
    pmQmAmount = 0.65 * pmQmAmount + 0.35 * input.ensembleP75Mm;
  }

  const qpfMmHr = Number(
    Math.max(PRECIP_WETNESS_CONTRACT.CALIBRATED_NWP_WET_FLOOR_MM, pmQmAmount).toFixed(2)
  );
  const qpfP10MmHr = Number(weightedQuantile(sortedModels, 0.15).toFixed(2));
  const qpfP90MmHr = Number(
    Math.max(qpfMmHr, input.ensembleP90Mm ?? weightedQuantile(sortedModels, 0.90)).toFixed(2)
  );

  const phaseInfo = classifyHydrometeorPhase({
    isWetHour: true,
    qpfMmHr,
    temp2mC: input.temp2mC,
    relHumidityPct: input.relHumidityPct,
    targetElevationM: input.targetElevationM,
    freezingLevelM: input.freezingLevelM,
    snowfallHeightM: input.snowfallHeightM,
    temp850C: input.temp850C,
    capeJkg: input.capeJkg,
    lpiJkg: input.lpiJkg
  });

  return {
    isWetHour: true,
    calibratedPopPct,
    qpfMmHr,
    qpfP10MmHr,
    qpfP90MmHr,
    drizzleSuppressed: false,
    ...phaseInfo
  };
}

/**
 * Birleşik Fiziksel Yağış Fazı ve Kar Sınırı Sınıflandırıcısı (Stull 2011 Tw + Kalınlık + 850 hPa Sıcak Burun + Donma Seviyesi):
 * - PRECIP_WETNESS_CONTRACT: `precipitationMm < 0.05 mm` iken (canlı METAR aktif yağış doğrulaması yoksa)
 *   ham model `snowfallCm` veya `weatherCode` tek başına asla `"snow"` / ıslak faz döndüremez!
 * - none: yağış yok
 * - hail: yüksek MUCAPE + güçlü 0–6 km shear + aktif konvektif sağanak (veya canlı METAR GR)
 * - freezing_rain: 850 hPa sıcak burun (+1°C üstü) + donma altı yüzey sıcaklığı (veya WMO 56/57/66/67)
 * - snow: Tw <= 0.4°C ve soğuk kolon / kar verisi
 * - sleet: 0.4°C < Tw <= 1.6°C geçiş bandı
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
  snowfallHeightM = null,
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
  snowfallHeightM?: number | null;
  elevationM?: number;
  mucape?: number;
  bulkShear06Kt?: number;
  liveMetarWx?: MetarWxFlags | null;
}): {
  precipPhase: PrecipPhase;
  precipType: PrecipType;
  wetBulbC: number;
  snowLineElevationM: number;
  phaseLabel: string;
} {
  const wetBulbC = Number(wetBulbStullC(temperatureC, humidityPct).toFixed(1));
  const estFreezingM =
    freezingLevelM ?? Math.max(0, elevationM + (temperatureC / 6.2) * 1000);
  const snowLineElevationM = Math.round(
    snowfallHeightM ?? Math.max(0, estFreezingM - 280)
  );

  const safePrecipMm =
    typeof precipitationMm === "number" && Number.isFinite(precipitationMm)
      ? precipitationMm
      : 0;
  const metarConfirmedWet = Boolean(
    liveMetarWx?.hasPrecip || liveMetarWx?.hasSnow || liveMetarWx?.hasHail
  );

  if (
    safePrecipMm < PRECIP_WETNESS_CONTRACT.WET_ACTIVE_MIN_MM &&
    !metarConfirmedWet
  ) {
    return {
      precipPhase: "none",
      precipType: "none",
      wetBulbC,
      snowLineElevationM,
      phaseLabel: "Yağış Yok"
    };
  }

  // 1. Dolu (Hail) tespiti
  const freezingAboveGround =
    freezingLevelM !== null ? freezingLevelM - elevationM : 2600;
  const isHail =
    Boolean(liveMetarWx?.hasHail) ||
    weatherCode === 96 ||
    weatherCode === 99 ||
    (safePrecipMm >= 2.0 &&
      mucape >= 1200 &&
      bulkShear06Kt >= 28 &&
      freezingAboveGround >= 1500 &&
      freezingAboveGround <= 4300);

  if (isHail) {
    return {
      precipPhase: "hail",
      precipType: "rain",
      wetBulbC,
      snowLineElevationM,
      phaseLabel: "Dolu Riski"
    };
  }

  // 2. Donan Yağmur (Freezing Rain — 850 hPa sıcak burun + yüzeyde don)
  const wmoFreezingRain =
    (weatherCode === 56 ||
      weatherCode === 57 ||
      weatherCode === 66 ||
      weatherCode === 67) &&
    temperatureC <= 2.0;
  if (
    wmoFreezingRain ||
    (temp850hPa !== null && temp850hPa >= 1.0 && wetBulbC <= 0.1 && temperatureC <= -0.3)
  ) {
    return {
      precipPhase: "freezing_rain",
      precipType: "rain",
      wetBulbC,
      snowLineElevationM,
      phaseLabel: "Donan Yağmur"
    };
  }

  // 3. Kar (Snow) tespiti — Stull Tw + 500–1000 kalınlık + 850 hPa + donma seviyesi
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
    return {
      precipPhase: "snow",
      precipType: "snow",
      wetBulbC,
      snowLineElevationM,
      phaseLabel: "Kar Yağışı"
    };
  }

  // 4. Karla Karışık Yağmur (Sleet / Wet Snow)
  const borderlineCold =
    (thickness5001000Dam !== null && thickness5001000Dam <= 546) ||
    (freezingLevelM !== null && freezingLevelM - elevationM <= 650) ||
    (temp850hPa !== null && temp850hPa <= -1.5) ||
    (temp850hPa !== null && temp850hPa >= 1.0 && wetBulbC <= 0.1);

  if (wetBulbC <= 1.6 && (borderlineCold || snowfallCm >= 0.05)) {
    return {
      precipPhase: "sleet",
      precipType: "snow",
      wetBulbC,
      snowLineElevationM,
      phaseLabel: "Karla Karışık"
    };
  }

  return {
    precipPhase: "rain",
    precipType: "rain",
    wetBulbC,
    snowLineElevationM,
    phaseLabel: "Yağmur"
  };
}
