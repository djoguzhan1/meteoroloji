import type { CapeAnalysisResult } from "./thermo-cape";
import type {
  MetarWxFlags,
  StormAssessment,
  StormThreatLevel,
  StormWindow
} from "./weather-types";

export type HourlyStormEvalInput = {
  time: string;
  hourLabel: string;
  dayLabel: string;
  capeFused: number; // 7-model fused CAPE
  sounding: CapeAnalysisResult | null; // MUCAPE, CIN, LI, K-Index, SRH, SCP, DCAPE, bulkShear06Kt
  ensCapeProb500: number; // 0..100 (122-üye P(CAPE >= 500))
  ensGustP50: number | null;
  ensGustP90: number | null;
  ensGustProb55: number; // 0..100
  ensGustProb75: number; // 0..100
  windSpeedKmh: number;
  windGustsKmh: number;
  precipitationMm: number;
  precipP90Mm: number;
  precip3hAccumMm: number;
  wmoStormAgreeCount: number; // kaç deterministik model WMO >= 95 diyor
  wmoTotalModels: number;
  weatherCode: number;
  pressureDelta3h: number;
  pressureDelta6h: number;
  lightningPotential: number | null; // DWD ICON LPI (J/kg) varsa
  liveMetarWx?: MetarWxFlags | null;
  /** Tekil otorite `evaluateHourLightningPhysics` şimşek olasılığı (%) */
  canonicalLightningProbPct?: number;
  /** Soğuk-mevsim gökgürültülü kar (Thundersnow) bayrağı */
  isThundersnow?: boolean;
};

export type HourlyStormEvalResult = {
  time: string;
  hourLabel: string;
  dayLabel: string;
  score: number; // 0..100
  level: StormThreatLevel;
  isStorm: boolean;
  lightningProbPct: number;
  hailRisk: "Yok" | "Düşük" | "Orta" | "Yüksek";
  flashFloodRisk: "Yok" | "Düşük" | "Orta" | "Yüksek";
  expectedPeakGustP50: number;
  expectedPeakGustP90: number;
  components: {
    convective: number;
    wind: number;
    rainfall: number;
    synoptic: number;
  };
  drivers: string[];
};

function clamp(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo;
  return Math.max(lo, Math.min(hi, v));
}

export function classifyStormLevel(
  score: number,
  components?: { convective: number; wind: number; rainfall: number; synoptic: number }
): {
  level: StormThreatLevel;
  label: string;
  color: string;
} {
  const c = components ?? { convective: score, wind: 0, rainfall: 0, synoptic: 0 };
  const isConvectiveDom = c.convective >= 38 && c.convective >= c.wind * 0.75;
  const isWindDom = c.wind >= c.rainfall && c.wind >= c.convective;

  if (score >= 80) {
    return {
      level: "extreme",
      label: isConvectiveDom ? "Süper Hücre / Ekstrem" : "Ekstrem Fırtına",
      color: "#e11d48"
    };
  }
  if (score >= 60) {
    return {
      level: "severe",
      label: isConvectiveDom
        ? "Şiddetli Oraj & Fırtına"
        : isWindDom
          ? "Şiddetli Rüzgar Fırtınası"
          : "Şiddetli Sağanak / Sel",
      color: "#ef4444"
    };
  }
  if (score >= 40) {
    return {
      level: "thunderstorm",
      label: isConvectiveDom
        ? "Oraj & Sağanak"
        : isWindDom
          ? "Kuvvetli Rüzgar / Hamle"
          : c.rainfall >= 38
            ? "Kuvvetli Sağanak"
            : "Aktif Cephe Geçişi",
      color: "#f97316"
    };
  }
  if (score >= 20) {
    return {
      level: "watch",
      label: isConvectiveDom
        ? "Oraj İzleme"
        : isWindDom
          ? "Rüzgar İzleme"
          : c.rainfall >= 22
            ? "Yağış İzleme"
            : "Fırtına İzleme",
      color: "#eab308"
    };
  }
  return { level: "calm", label: "Sakin Atmosfer", color: "#10b981" };
}

/**
 * Herhangi bir saatin `stormScore` (`0..100`) ve fiziksel bileşenlerinden tutarlı
 * `{ level, label, color }` fırtına çipi üretir (`4/100` skor asla kırmızı `"Şiddetli Oraj"` alamaz!).
 */
export function classifyHourlyStormChip(
  score: number,
  opts?: {
    isThundersnow?: boolean;
    lightningProbPct?: number;
    windGustsKmh?: number;
    precipMmHr?: number;
  }
): {
  level: StormThreatLevel;
  label: string;
  color: string;
} {
  const s = clamp(Math.round(score), 0, 100);
  if (s < 20) {
    return { level: "calm", label: "Sakin Atmosfer", color: "#10b981" };
  }

  const ltProb = clamp(opts?.lightningProbPct ?? 0, 0, 100);
  const gust = Math.max(0, opts?.windGustsKmh ?? 0);
  const precip = Math.max(0, opts?.precipMmHr ?? 0);
  const isTsnow = Boolean(opts?.isThundersnow);

  if (isTsnow && (ltProb >= 20 || opts?.lightningProbPct === undefined)) {
    if (s >= 80) {
      return {
        level: "extreme",
        label: "Ekstrem Gökgürültülü Kar",
        color: "#e11d48"
      };
    }
    if (s >= 60) {
      return {
        level: "severe",
        label: "Şiddetli Gökgürültülü Kar",
        color: "#ef4444"
      };
    }
    if (s >= 40) {
      return {
        level: "thunderstorm",
        label: "Gökgürültülü Kar (Thundersnow)",
        color: "#f97316"
      };
    }
    return {
      level: "watch",
      label: "Gökgürültülü Kar İzleme",
      color: "#eab308"
    };
  }

  if (!opts) {
    return classifyStormLevel(s, {
      convective: 0,
      wind: 0,
      rainfall: 0,
      synoptic: s
    });
  }

  const convective = Math.round(clamp(ltProb * 0.95, 0, 100));
  const wind =
    gust >= 35 ? Math.round(clamp(((gust - 35) / 55) * 85 + 15, 0, 100)) : 0;
  const rainfall =
    precip >= 1.5 ? Math.round(clamp((precip / 16) * 85 + 10, 0, 100)) : 0;
  const synoptic = Math.round(s * 0.65);

  return classifyStormLevel(s, { convective, wind, rainfall, synoptic });
}

/**
 * Operasyonel SPC / ESTOFEX bileşik fiziğine dayalı saatlik fırtına risk hesaplaması:
 * 4 bağımsız bileşen: Konvektif/Şimşek · Rüzgar/Microburst · Sağanak/Ani Sel · Sinoptik Cephe/SCP
 */
export function evaluateHourlyStormRisk(
  input: HourlyStormEvalInput
): HourlyStormEvalResult {
  const s = input.sounding;
  const mucape = Math.max(input.capeFused, s?.mucape ?? 0, s?.cape ?? 0);
  const cin = s?.mucin ?? s?.cin ?? 0; // negatif değerler kapağı (inhibition) gösterir
  const li = s?.liftedIndex ?? 4;
  const kIdx = s?.kIndex ?? 15;
  const shear06Kt = s?.bulkShear06Kt ?? 0;
  const srh03 = s?.srh03 ?? 0;
  const scp = s?.scp ?? 0;
  const dcape = s?.dcape ?? 0;
  const sigSevere = s?.sigSevere ?? 0;

  const hasCanonicalLt =
    input.canonicalLightningProbPct !== undefined &&
    Number.isFinite(input.canonicalLightningProbPct);
  const canonicalLtPct = hasCanonicalLt
    ? Math.round(clamp(input.canonicalLightningProbPct!, 0, 99))
    : null;
  const isThundersnow = Boolean(input.isThundersnow);

  // Güçlü konvektif kapak (CIN < -140 J/kg) varsa ve aktif oraj yoksa yanlış alarmı bastır
  const activeStormCode =
    input.weatherCode >= 95 ||
    input.wmoStormAgreeCount >= 2 ||
    isThundersnow ||
    Boolean(input.liveMetarWx?.isThunderstorm);
  const cinSuppression =
    !activeStormCode && cin < -120 ? clamp(1 - (-cin - 120) / 180, 0.35, 1) : 1;

  // 1. KONVEKTİF & ŞİMŞEK BİLEŞENİ (0..100)
  const capeTerm = clamp((mucape / 2200) * 62, 0, 68) * cinSuppression;
  const liTerm = li < 0 ? clamp((-li / 6) * 28, 0, 30) * cinSuppression : 0;
  const ensCapeTerm = clamp(input.ensCapeProb500 * 0.42, 0, 42) * cinSuppression;
  const wmoRatio =
    input.wmoTotalModels > 0 ? input.wmoStormAgreeCount / input.wmoTotalModels : 0;
  const wmoTerm = wmoRatio * 48 + (input.weatherCode >= 95 ? 24 : 0);
  const lpiTerm =
    input.lightningPotential !== null && input.lightningPotential > 0
      ? clamp(input.lightningPotential * 3.2, 0, 40)
      : 0;
  const metarTsBoost = input.liveMetarWx?.isThunderstorm ? 58 : 0;
  const thundersnowBoost = isThundersnow
    ? clamp(Math.max(44, (canonicalLtPct ?? 48) * 0.92), 40, 82)
    : 0;
  const canonicalConvAnchor =
    canonicalLtPct !== null ? clamp(canonicalLtPct * 0.88, 0, 92) : 0;

  let convectiveRaw = Math.max(
    capeTerm + liTerm * 0.65 + wmoTerm * 0.6 + lpiTerm * 0.4,
    ensCapeTerm + wmoTerm * 0.75 + lpiTerm * 0.5,
    metarTsBoost + capeTerm * 0.5,
    thundersnowBoost,
    canonicalConvAnchor
  );

  // Kanonik şimşek fiziği bulutun buzlanmadığını / elektriksiz olduğunu doğruladıysa (<= %10) sahte konvektif tavanı sınırla
  if (
    canonicalLtPct !== null &&
    canonicalLtPct <= 10 &&
    !isThundersnow &&
    !input.liveMetarWx?.isThunderstorm
  ) {
    convectiveRaw = Math.min(convectiveRaw, 26);
  }

  const convective = Math.round(clamp(convectiveRaw, 0, 100));

  // 2. RÜZGAR & MICROBURST HAMLE BİLEŞENİ (0..100)
  const gustRef = Math.max(input.windGustsKmh, input.ensGustP50 ?? 0);
  const gustP90 = Math.max(gustRef, input.ensGustP90 ?? gustRef);
  const gustTerm =
    gustRef >= 35 ? clamp(((gustRef - 35) / 55) * 78, 0, 88) : 0;
  const windTerm =
    input.windSpeedKmh >= 30 ? clamp(((input.windSpeedKmh - 30) / 45) * 65, 0, 75) : 0;
  const ensWindTerm = input.ensGustProb55 * 0.45 + input.ensGustProb75 * 0.55;
  const dcapeBoost =
    convective >= 30 && dcape >= 600 ? clamp(((dcape - 600) / 700) * 24, 0, 24) : 0;
  const squallBoost = input.liveMetarWx?.hasSquall ? 35 : 0;

  const wind = Math.round(
    clamp(Math.max(gustTerm, windTerm, ensWindTerm) + dcapeBoost + squallBoost, 0, 100)
  );

  // 3. ŞİDDETLİ SAĞANAK & ANİ SEL BİLEŞENİ (0..100)
  const rainRateTerm =
    input.precipitationMm >= 1.0
      ? clamp((input.precipitationMm / 16) * 72, 0, 82)
      : 0;
  const rainP90Term =
    input.precipP90Mm >= 4.0 ? clamp(((input.precipP90Mm - 4) / 22) * 58, 0, 62) : 0;
  const accum3hTerm =
    input.precip3hAccumMm >= 6.0
      ? clamp(((input.precip3hAccumMm - 6) / 30) * 68, 0, 75)
      : 0;
  const kTerm =
    kIdx >= 28 && input.precipitationMm >= 0.5 ? clamp((kIdx - 26) * 1.4, 0, 16) : 0;
  const heavyMetarBoost = input.liveMetarWx?.heavyPrecip ? 32 : 0;

  const rainfall = Math.round(
    clamp(
      Math.max(rainRateTerm, accum3hTerm, rainP90Term * 0.85) + kTerm + heavyMetarBoost,
      0,
      100
    )
  );

  // 4. SİNOPTİK CEPHE, BAROMETRİK DÜŞÜŞ & SÜPER HÜCRE BİLEŞENİ (0..100)
  const pDrop3 = Math.max(0, -input.pressureDelta3h);
  const pDrop6 = Math.max(0, -input.pressureDelta6h);
  const baroTerm = Math.max(
    pDrop3 >= 2.0 ? ((pDrop3 - 1.5) / 5.0) * 62 : 0,
    pDrop6 >= 4.0 ? ((pDrop6 - 3.0) / 8.0) * 68 : 0
  );
  const scpTerm = scp >= 0.6 ? clamp(scp * 24, 0, 72) : 0;
  const sigSevTerm =
    sigSevere >= 12000 ? clamp(((sigSevere - 10000) / 25000) * 55, 0, 60) : 0;
  const shearBoost =
    convective >= 35 && shear06Kt >= 32 ? clamp((shear06Kt - 28) * 1.1, 0, 22) : 0;

  const synoptic = Math.round(
    clamp(Math.max(baroTerm, scpTerm, sigSevTerm) + shearBoost, 0, 100)
  );

  // Bileşik 0–100 Tehdit Skoru
  const peakComp = Math.max(convective, wind, rainfall, synoptic);
  const weightedAvg =
    convective * 0.34 + wind * 0.28 + rainfall * 0.22 + synoptic * 0.16;
  const synergyBonus =
    (convective >= 45 && wind >= 45 ? 8 : 0) +
    (convective >= 45 && rainfall >= 45 ? 6 : 0) +
    (scp >= 1.5 ? 8 : 0);

  const score = Math.round(
    clamp(peakComp * 0.64 + weightedAvg * 0.36 + synergyBonus, 0, 100)
  );
  const { level } = classifyStormLevel(score, {
    convective,
    wind,
    rainfall,
    synoptic
  });

  // Şimşek Olasılığı (%): kanonik değer verildiğinde ikincil formül uydurulmaz!
  const lightningProbPct =
    canonicalLtPct !== null
      ? canonicalLtPct
      : Math.round(
          clamp(
            Math.max(
              convective * 0.92,
              wmoRatio * 90,
              input.liveMetarWx?.isThunderstorm ? 92 : 0,
              lpiTerm * 2.1
            ),
            0,
            99
          )
        );

  // Dolu Riski
  const hailRisk: HourlyStormEvalResult["hailRisk"] =
    input.liveMetarWx?.hasHail ||
    (mucape >= 2000 && shear06Kt >= 35 && sigSevere >= 25000)
      ? "Yüksek"
      : mucape >= 1200 && shear06Kt >= 28 && convective >= 45
        ? "Orta"
        : mucape >= 650 && convective >= 32
          ? "Düşük"
          : "Yok";

  // Ani Sel Riski
  const flashFloodRisk: HourlyStormEvalResult["flashFloodRisk"] =
    input.precipitationMm >= 18 || input.precip3hAccumMm >= 35
      ? "Yüksek"
      : input.precipitationMm >= 9 ||
          input.precip3hAccumMm >= 20 ||
          input.precipP90Mm >= 18
        ? "Orta"
        : input.precipitationMm >= 4 || input.precip3hAccumMm >= 10
          ? "Düşük"
          : "Yok";

  const drivers: string[] = [];
  if (input.liveMetarWx?.isThunderstorm)
    drivers.push("Canlı METAR aktif oraj (TS)");
  if (isThundersnow) drivers.push("Gökgürültülü kar (Thundersnow)");
  if (mucape >= 600) drivers.push(`MUCAPE ${Math.round(mucape)} J/kg`);
  if (scp >= 1.0)
    drivers.push(`Süper Hücre SCP ${scp.toFixed(1)} (SRH ${srh03} m²/s²)`);
  if (gustP90 >= 55) drivers.push(`Hamle P90 ${Math.round(gustP90)} km/s`);
  if (dcape >= 700 && convective >= 30)
    drivers.push(`DCAPE ${dcape} J/kg (downburst)`);
  if (pDrop3 >= 2.8)
    drivers.push(`Basınç düşüşü -${pDrop3.toFixed(1)} hPa/3s`);
  if (input.precipitationMm >= 4)
    drivers.push(`Sağanak ${input.precipitationMm.toFixed(1)} mm/sa`);
  if (wmoRatio >= 0.4 && input.wmoTotalModels >= 3) {
    drivers.push(
      `Oraj uzlaşısı ${input.wmoStormAgreeCount}/${input.wmoTotalModels} model`
    );
  }

  const isStorm =
    score >= 42 ||
    isThundersnow ||
    input.windSpeedKmh >= 50 ||
    input.windGustsKmh >= 72 ||
    input.weatherCode >= 95 ||
    Boolean(input.liveMetarWx?.isThunderstorm);

  return {
    time: input.time,
    hourLabel: input.hourLabel,
    dayLabel: input.dayLabel,
    score,
    level,
    isStorm,
    lightningProbPct,
    hailRisk,
    flashFloodRisk,
    expectedPeakGustP50: Math.round(gustRef),
    expectedPeakGustP90: Math.round(gustP90),
    components: { convective, wind, rainfall, synoptic },
    drivers: drivers.slice(0, 4)
  };
}

/**
 * 48 saatlik saatlik değerlendirmelerden özet Fırtına Tehdit Raporu + Başlangıç–Zirve–Bitiş Penceresi üretir.
 */
export function buildStormAssessment(
  hourlyEvals: HourlyStormEvalResult[],
  hourlyPrecipMm: number[]
): StormAssessment {
  const cur = hourlyEvals[0];
  if (!cur) {
    return {
      score: 0,
      level: "calm",
      label: "Sakin Atmosfer",
      color: "#10b981",
      lightningProbPct: 0,
      hailRisk: "Yok",
      flashFloodRisk: "Yok",
      expectedPeakGustP50: 0,
      expectedPeakGustP90: 0,
      components: { convective: 0, wind: 0, rainfall: 0, synoptic: 0 },
      nextWindow: null,
      drivers: []
    };
  }

  let nextWindow: StormWindow | null = null;
  const THRESH = 35;
  let winStart = -1;
  let winEnd = -1;

  for (let i = 0; i < hourlyEvals.length; i++) {
    if (hourlyEvals[i].score >= THRESH) {
      if (winStart === -1) winStart = i;
      winEnd = i;
    } else if (winStart !== -1) {
      break;
    }
  }

  if (winStart !== -1) {
    let peakIdx = winStart;
    let peakGust = 0;
    let peakPrecip = 0;
    for (let i = winStart; i <= winEnd; i++) {
      if (hourlyEvals[i].score > hourlyEvals[peakIdx].score) peakIdx = i;
      peakGust = Math.max(peakGust, hourlyEvals[i].expectedPeakGustP90);
      peakPrecip = Math.max(peakPrecip, hourlyPrecipMm[i] ?? 0);
    }
    nextWindow = {
      startTime: hourlyEvals[winStart].time,
      peakTime: hourlyEvals[peakIdx].time,
      endTime: hourlyEvals[winEnd].time,
      startLabel: `${hourlyEvals[winStart].dayLabel} ${hourlyEvals[winStart].hourLabel}`,
      peakLabel: `${hourlyEvals[peakIdx].dayLabel} ${hourlyEvals[peakIdx].hourLabel}`,
      endLabel: `${hourlyEvals[winEnd].dayLabel} ${hourlyEvals[winEnd].hourLabel}`,
      peakScore: hourlyEvals[peakIdx].score,
      peakGustKmh: Math.round(peakGust),
      peakPrecipMm: Number(peakPrecip.toFixed(1))
    };
  }

  const next12 = hourlyEvals.slice(0, 12);
  let headline = cur;
  for (const h of next12) {
    if (h.score > headline.score + 12) headline = h;
  }

  const meta = classifyStormLevel(headline.score, headline.components);
  return {
    score: headline.score,
    level: meta.level,
    label: meta.label,
    color: meta.color,
    lightningProbPct: Math.max(
      cur.lightningProbPct,
      ...next12.map((h) => h.lightningProbPct)
    ),
    hailRisk: headline.hailRisk,
    flashFloodRisk: headline.flashFloodRisk,
    expectedPeakGustP50: Math.max(...next12.map((h) => h.expectedPeakGustP50)),
    expectedPeakGustP90: Math.max(...next12.map((h) => h.expectedPeakGustP90)),
    components: headline.components,
    nextWindow,
    drivers: headline.drivers.length > 0 ? headline.drivers : cur.drivers
  };
}
