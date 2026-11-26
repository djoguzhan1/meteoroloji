import type { CoreModelKey } from "./weather-types";

export type ModelFamily =
  | "ECMWF"
  | "ECMWF_AI"
  | "DWD"
  | "UKMO"
  | "METEOFRANCE"
  | "NOAA"
  | "CMC"
  | "JMA";

export interface CoreModelMeta {
  key: CoreModelKey;
  apiModel: string;
  label: string;
  shortLabel: string;
  resolution: string;
  resolutionKm: number;
  maxHorizonHours: number;
  color: string;
  family: ModelFamily;
  isAiFoundation: boolean;
}

export const CORE_MODEL_KEYS: readonly CoreModelKey[] = [
  "ecmwfIfs",
  "ecmwfAifs",
  "icon",
  "ukmo",
  "meteofrance",
  "gfs",
  "gem",
  "jma"
];

export const CORE_MODEL_META: Record<CoreModelKey, CoreModelMeta> = {
  ecmwfIfs: {
    key: "ecmwfIfs",
    apiModel: "ecmwf_ifs",
    label: "ECMWF IFS 9km",
    shortLabel: "ECMWF IFS",
    resolution: "9 km HRES",
    resolutionKm: 9,
    maxHorizonHours: 360,
    color: "#38bdf8",
    family: "ECMWF",
    isAiFoundation: false
  },
  ecmwfAifs: {
    key: "ecmwfAifs",
    apiModel: "ecmwf_aifs025_single",
    label: "ECMWF AIFS v1",
    shortLabel: "AIFS AI",
    resolution: "0.25° AI",
    resolutionKm: 28,
    maxHorizonHours: 378,
    color: "#a78bfa",
    family: "ECMWF_AI",
    isAiFoundation: true
  },
  icon: {
    key: "icon",
    apiModel: "icon_seamless",
    label: "DWD ICON-EU/D2",
    shortLabel: "ICON-EU",
    resolution: "2–7 km",
    resolutionKm: 7,
    maxHorizonHours: 192,
    color: "#10b981",
    family: "DWD",
    isAiFoundation: false
  },
  ukmo: {
    key: "ukmo",
    apiModel: "ukmo_seamless",
    label: "UKMO Unified",
    shortLabel: "UKMO 10km",
    resolution: "2–10 km",
    resolutionKm: 10,
    maxHorizonHours: 168,
    color: "#f472b6",
    family: "UKMO",
    isAiFoundation: false
  },
  meteofrance: {
    key: "meteofrance",
    apiModel: "meteofrance_seamless",
    label: "Météo-France AROME",
    shortLabel: "AROME/ARP",
    resolution: "1.3–10 km",
    resolutionKm: 10,
    maxHorizonHours: 114,
    color: "#22d3ee",
    family: "METEOFRANCE",
    isAiFoundation: false
  },
  gfs: {
    key: "gfs",
    apiModel: "gfs_seamless",
    label: "NOAA GFS",
    shortLabel: "NOAA GFS",
    resolution: "3–13 km",
    resolutionKm: 13,
    maxHorizonHours: 384,
    color: "#f59e0b",
    family: "NOAA",
    isAiFoundation: false
  },
  gem: {
    key: "gem",
    apiModel: "gem_seamless",
    label: "ECCC GEM",
    shortLabel: "GEM Global",
    resolution: "15 km",
    resolutionKm: 15,
    maxHorizonHours: 252,
    color: "#fb7185",
    family: "CMC",
    isAiFoundation: false
  },
  jma: {
    key: "jma",
    apiModel: "jma_seamless",
    label: "JMA GSM Global",
    shortLabel: "JMA GSM",
    resolution: "20 km",
    resolutionKm: 20,
    maxHorizonHours: 270,
    color: "#facc15",
    family: "JMA",
    isAiFoundation: false
  }
};

export type DynamicHybridWeights = {
  temperature: Record<CoreModelKey, number>;
  pressure: Record<CoreModelKey, number>;
  wind: Record<CoreModelKey, number>;
  precipitation: Record<CoreModelKey, number>;
};

/**
 * WMO LC-DNV & ECMWF 2025/2026 Operasyonel Skor Kartlarına dayalı 8-Model ön ağırlıkları (priors).
 * Aktif MGM 19-ilçe ağı veya yerel istasyon ağı bulunduğunda canlı UBRMSE² ve Yağış Brier kanıtıyla güncellenir.
 */
export const WMO_PRIOR_WEIGHTS: DynamicHybridWeights = {
  temperature: {
    ecmwfIfs: 0.21,
    ecmwfAifs: 0.23,
    icon: 0.16,
    ukmo: 0.13,
    meteofrance: 0.10,
    gfs: 0.07,
    gem: 0.05,
    jma: 0.05
  },
  pressure: {
    ecmwfIfs: 0.24,
    ecmwfAifs: 0.19,
    ukmo: 0.17,
    icon: 0.12,
    meteofrance: 0.10,
    gfs: 0.07,
    gem: 0.06,
    jma: 0.05
  },
  wind: {
    icon: 0.22,
    ecmwfIfs: 0.19,
    meteofrance: 0.15,
    ukmo: 0.15,
    gfs: 0.10,
    ecmwfAifs: 0.09,
    gem: 0.05,
    jma: 0.05
  },
  precipitation: {
    icon: 0.23,
    ecmwfIfs: 0.21,
    meteofrance: 0.18,
    ukmo: 0.13,
    ecmwfAifs: 0.08,
    gfs: 0.07,
    gem: 0.05,
    jma: 0.05
  }
};

/**
 * Orta vade (3–7 gün) sinoptik ağırlıklar: ECMWF IFS + AIFS AI liderliği artar.
 */
export const MEDIUM_RANGE_PRIOR_WEIGHTS: DynamicHybridWeights = {
  temperature: {
    ecmwfIfs: 0.27,
    ecmwfAifs: 0.29,
    ukmo: 0.12,
    icon: 0.10,
    gfs: 0.07,
    meteofrance: 0.05,
    gem: 0.05,
    jma: 0.05
  },
  pressure: {
    ecmwfIfs: 0.29,
    ecmwfAifs: 0.24,
    ukmo: 0.16,
    icon: 0.10,
    gfs: 0.06,
    meteofrance: 0.05,
    gem: 0.05,
    jma: 0.05
  },
  wind: {
    ecmwfIfs: 0.25,
    icon: 0.19,
    ukmo: 0.15,
    ecmwfAifs: 0.14,
    meteofrance: 0.09,
    gfs: 0.08,
    gem: 0.05,
    jma: 0.05
  },
  precipitation: {
    ecmwfIfs: 0.27,
    icon: 0.19,
    meteofrance: 0.14,
    ukmo: 0.13,
    ecmwfAifs: 0.10,
    gfs: 0.07,
    gem: 0.05,
    jma: 0.05
  }
};

/**
 * Uzatılmış sinoptik vade (8–15 gün / +169s..+360s) öncül ağırlıkları:
 * Bölgesel modeller koptukça yalnızca o saatte aktif olan küresel/AI modeller üzerinden 1.0'a normalize edilir.
 */
export const EXTENDED_SYNOPTIC_PRIOR_WEIGHTS: DynamicHybridWeights = {
  temperature: {
    ecmwfAifs: 0.36,
    ecmwfIfs: 0.33,
    jma: 0.09,
    gem: 0.08,
    icon: 0.07,
    gfs: 0.07,
    ukmo: 0.0,
    meteofrance: 0.0
  },
  pressure: {
    ecmwfIfs: 0.36,
    ecmwfAifs: 0.34,
    jma: 0.09,
    gem: 0.08,
    icon: 0.07,
    gfs: 0.06,
    ukmo: 0.0,
    meteofrance: 0.0
  },
  wind: {
    ecmwfIfs: 0.35,
    ecmwfAifs: 0.31,
    icon: 0.10,
    jma: 0.08,
    gem: 0.08,
    gfs: 0.08,
    ukmo: 0.0,
    meteofrance: 0.0
  },
  precipitation: {
    ecmwfIfs: 0.36,
    ecmwfAifs: 0.30,
    icon: 0.10,
    jma: 0.08,
    gem: 0.08,
    gfs: 0.08,
    ukmo: 0.0,
    meteofrance: 0.0
  }
};

/**
 * Düzenlileştirilmiş Ters-Hata² (Inverse-Variance / Inverse-UBRMSE²) Ağırlıklandırma:
 * w_i = [pi_i / (err_i^2 + sigma0^2)] / sum(...)
 */
export function computeInverseRmseWeights(
  rmses: Partial<Record<CoreModelKey, number | null>>,
  priors: Record<CoreModelKey, number>,
  sigma0: number
): Record<CoreModelKey, number> {
  const raw = {} as Record<CoreModelKey, number>;
  let sum = 0;

  for (const key of CORE_MODEL_KEYS) {
    const rmse = rmses[key];
    const prior = priors[key] ?? 0.05;
    const score =
      typeof rmse === "number" && Number.isFinite(rmse) && rmse >= 0
        ? prior / (rmse * rmse + sigma0 * sigma0)
        : prior / (sigma0 * sigma0 * 4);
    raw[key] = score;
    sum += score;
  }

  if (sum <= 0) return { ...priors };

  const out = {} as Record<CoreModelKey, number>;
  for (const key of CORE_MODEL_KEYS) {
    out[key] = raw[key] / sum;
  }
  return out;
}
