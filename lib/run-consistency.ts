/**
 * ATMOS v4.5 — dProg/dt Lagged-Run Consistency & Anti-Flip-Flop Hysteresis Engine
 * File: lib/run-consistency.ts
 */

import { ATMOS_HTTP_USER_AGENT } from "./bursa-mesh";
import { SEVEN_MODEL_KEYS, SEVEN_MODEL_META } from "./metar-verify";
import type { SevenModelKey } from "./weather-types";

export type StabilityGrade = "LOCKED" | "CONVERGING" | "WATCH";

export interface LaggedModelSeries {
  modelKey: SevenModelKey | string;
  family: string;
  utcTimeIndex?: Map<string, number>;
  run0TempC: Array<number | null>;
  runMinus1TempC?: Array<number | null>;
  runMinus2TempC?: Array<number | null>;
  runMinus3TempC?: Array<number | null>;
  run0PrecipMm?: Array<number | null>;
  runMinus1PrecipMm?: Array<number | null>;
  runMinus2PrecipMm?: Array<number | null>;
  initCycleUtcHour?: number;
}

export interface LiveAnchorVerification {
  liveObsTempC?: number | null;
  liveRadarRainMmHr?: number | null;
  liveGaugePrecipMmHr?: number | null;
  pressureTrend3hHpa?: number | null;
}

export interface HourlyConsistencyInput {
  leadHours: number;
  validTimeIso: string;
  utcHourKey?: string;
  candidateTempC: number;
  candidateIsWet: boolean;
  candidatePrecipMmHr: number;
  candidatePopPct: number;
  previousLockedTempC?: number | null;
  previousLockedIsWet?: boolean | null;
  previousLockedPrecipMmHr?: number | null;
  ensembleTempIqrC?: number | null;
  laggedModels: LaggedModelSeries[];
  hourIndex: number;
  liveAnchor?: LiveAnchorVerification;
}

export interface HourlyConsistencyOutput {
  validTimeIso: string;
  finalTempC: number;
  finalIsWet: boolean;
  finalPrecipMmHr: number;
  finalPopPct: number;
  spinUpVetoApplied: boolean;
  hysteresisDamped: boolean;
  dProgDtTrendC: number;
  consecutiveRunLockCount: number;
  evidenceScore: number;
  stabilityGrade: StabilityGrade;
}

export interface ForecastStabilitySummary {
  overallStabilityPct: number;
  overallGrade: StabilityGrade;
  meanRunLockCount: number;
  blockedNoisyRevisionsCount: number;
  spinUpVetoesCount: number;
  badgeLabelTr: string;
}

const MODEL_FAMILY_MAP: Record<SevenModelKey, string> = {
  ecmwfIfs: "ECMWF",
  ecmwfAifs: "ECMWF_AI",
  icon: "DWD",
  ukmo: "UKMO",
  meteofrance: "METEOFRANCE",
  gfs: "NOAA",
  gem: "CMC"
};

export function getSynopticCycleReliabilityWeight(initCycleUtcHour?: number): number {
  if (initCycleUtcHour === 0 || initCycleUtcHour === 12) return 1.3;
  if (initCycleUtcHour === 6 || initCycleUtcHour === 18) return 0.82;
  return 1.0;
}

/**
 * Fetches 4-generation lagged forecast trajectories (`temperature_2m` + `previous_day1..3`
 * and `precipitation` + `previous_day1..2`) for all 7 operational models in ONE single HTTP call
 * from `https://previous-runs-api.open-meteo.com/v1/forecast`.
 */
export async function fetchOpenMeteoLaggedRuns(params: {
  lat: number;
  lon: number;
  elevationM?: number;
  forecastDays?: number;
  timeoutMs?: number;
}): Promise<Map<string, LaggedModelSeries>> {
  const result = new Map<string, LaggedModelSeries>();
  const apiModels = SEVEN_MODEL_KEYS.map((k) => SEVEN_MODEL_META[k].apiModel).join(",");
  const vars = [
    "temperature_2m",
    "temperature_2m_previous_day1",
    "temperature_2m_previous_day2",
    "temperature_2m_previous_day3",
    "precipitation",
    "precipitation_previous_day1",
    "precipitation_previous_day2"
  ].join(",");

  const days = params.forecastDays ?? 7;
  const timeoutMs = params.timeoutMs ?? 6000;
  const elevParam =
    params.elevationM !== undefined && Number.isFinite(params.elevationM)
      ? `&elevation=${Math.round(params.elevationM)}`
      : "";

  try {
    const url =
      `https://previous-runs-api.open-meteo.com/v1/forecast?latitude=${params.lat.toFixed(4)}` +
      `&longitude=${params.lon.toFixed(4)}${elevParam}` +
      `&hourly=${vars}&forecast_days=${days}&timezone=GMT&models=${apiModels}`;

    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": ATMOS_HTTP_USER_AGENT },
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!res.ok) return result;

    const json = (await res.json()) as {
      hourly?: Record<string, Array<number | string | null>>;
    };
    const h = json.hourly;
    if (!h || !Array.isArray(h.time)) return result;

    const utcTimeIndex = new Map<string, number>();
    (h.time as string[]).forEach((t, idx) => utcTimeIndex.set(String(t), idx));

    for (const k of SEVEN_MODEL_KEYS) {
      const apiId = SEVEN_MODEL_META[k].apiModel;
      const r0 = h[`temperature_2m_${apiId}`] as Array<number | null> | undefined;
      if (!Array.isArray(r0)) continue;

      result.set(k, {
        modelKey: k,
        family: MODEL_FAMILY_MAP[k],
        utcTimeIndex,
        run0TempC: r0,
        runMinus1TempC: h[`temperature_2m_previous_day1_${apiId}`] as Array<number | null> | undefined,
        runMinus2TempC: h[`temperature_2m_previous_day2_${apiId}`] as Array<number | null> | undefined,
        runMinus3TempC: h[`temperature_2m_previous_day3_${apiId}`] as Array<number | null> | undefined,
        run0PrecipMm: h[`precipitation_${apiId}`] as Array<number | null> | undefined,
        runMinus1PrecipMm: h[`precipitation_previous_day1_${apiId}`] as Array<number | null> | undefined,
        runMinus2PrecipMm: h[`precipitation_previous_day2_${apiId}`] as Array<number | null> | undefined
      });
    }
  } catch {
    return result;
  }

  return result;
}

export function evaluateHourlyRunConsistency(input: HourlyConsistencyInput): HourlyConsistencyOutput {
  let finalTempC = input.candidateTempC;
  let finalIsWet = input.candidateIsWet;
  let finalPrecipMmHr = input.candidatePrecipMmHr;
  let finalPopPct = input.candidatePopPct;
  let spinUpVetoApplied = false;
  let hysteresisDamped = false;

  // 1. MODEL SPIN-UP SHOCK VETO (T+0 .. T+2h)
  if (input.leadHours <= 2 && input.liveAnchor) {
    const liveT = input.liveAnchor.liveObsTempC;
    if (liveT !== null && liveT !== undefined && Number.isFinite(liveT)) {
      const obsBlendWeight = input.leadHours === 0 ? 0.9 : input.leadHours === 1 ? 0.62 : 0.34;
      if (Math.abs(finalTempC - liveT) >= 0.8) {
        spinUpVetoApplied = true;
      }
      finalTempC = obsBlendWeight * liveT + (1 - obsBlendWeight) * finalTempC;
    }

    const liveRain =
      input.liveAnchor.liveRadarRainMmHr ?? input.liveAnchor.liveGaugePrecipMmHr ?? null;
    if (liveRain !== null && Number.isFinite(liveRain) && input.leadHours <= 1) {
      const obsIsWet = liveRain >= 0.1;
      if (obsIsWet !== finalIsWet) {
        spinUpVetoApplied = true;
        finalIsWet = obsIsWet;
        finalPrecipMmHr = obsIsWet
          ? Math.max(0.15, 0.75 * liveRain + 0.25 * finalPrecipMmHr)
          : 0;
        finalPopPct = obsIsWet ? Math.max(75, finalPopPct) : Math.min(20, finalPopPct);
      }
    }
  }

  // 2. LAGGED CONSENSUS BASELINE & dProg/dt MONOTONICITY
  let sumPrev1 = 0;
  let wPrev1 = 0;
  let sumPrev2 = 0;
  let wPrev2 = 0;
  const monotonicFamilies = new Set<string>();
  const agreeingShiftFamilies = new Set<string>();
  let runLockCounter = 1;

  for (const m of input.laggedModels) {
    const idx =
      input.utcHourKey && m.utcTimeIndex
        ? (m.utcTimeIndex.get(input.utcHourKey) ?? input.hourIndex)
        : input.hourIndex;
    const relW = getSynopticCycleReliabilityWeight(m.initCycleUtcHour);
    const r0 = m.run0TempC[idx] ?? null;
    const r1 = m.runMinus1TempC?.[idx] ?? null;
    const r2 = m.runMinus2TempC?.[idx] ?? null;
    const r3 = m.runMinus3TempC?.[idx] ?? null;

    if (r1 !== null && Number.isFinite(r1)) {
      sumPrev1 += relW * r1;
      wPrev1 += relW;
    }
    if (r2 !== null && Number.isFinite(r2)) {
      sumPrev2 += relW * r2;
      wPrev2 += relW;
    }

    if (r0 !== null && r1 !== null && Number.isFinite(r0) && Number.isFinite(r1)) {
      const step01 = r0 - r1;
      if (r2 !== null && Number.isFinite(r2)) {
        const step12 = r1 - r2;
        if (Math.sign(step01) === Math.sign(step12) && Math.abs(step01) >= 0.35) {
          monotonicFamilies.add(m.family);
        }
      }
      if (Math.abs(r0 - r1) <= 0.9) {
        let localLock = 2;
        if (r2 !== null && Math.abs(r1 - r2) <= 1.0) {
          localLock = 3;
          if (r3 !== null && Math.abs(r2 - r3) <= 1.1) {
            localLock = 4;
          }
        }
        runLockCounter = Math.max(runLockCounter, localLock);
      }
    }
  }

  const laggedPrev1Temp =
    input.previousLockedTempC ?? (wPrev1 > 0 ? sumPrev1 / wPrev1 : null);
  const laggedPrev2Temp = wPrev2 > 0 ? sumPrev2 / wPrev2 : null;
  const dProgDtTrendC = laggedPrev1Temp !== null ? finalTempC - laggedPrev1Temp : 0;

  if (laggedPrev1Temp !== null) {
    for (const m of input.laggedModels) {
      const idx =
        input.utcHourKey && m.utcTimeIndex
          ? (m.utcTimeIndex.get(input.utcHourKey) ?? input.hourIndex)
          : input.hourIndex;
      const r0 = m.run0TempC[idx] ?? null;
      const r1 = m.runMinus1TempC?.[idx] ?? null;
      if (
        r0 !== null &&
        r1 !== null &&
        Math.sign(r0 - r1) === Math.sign(dProgDtTrendC) &&
        Math.abs(r0 - r1) >= 0.55
      ) {
        agreeingShiftFamilies.add(m.family);
      }
    }
  }

  // 3. 2-OF-3 PHYSICAL EVIDENCE ANTI-FLIP-FLOP GATEKEEPER
  let evidenceScore = 0;

  const isMonotonicMacro =
    monotonicFamilies.size >= 2 ||
    (laggedPrev1Temp !== null &&
      laggedPrev2Temp !== null &&
      Math.sign(finalTempC - laggedPrev1Temp) === Math.sign(laggedPrev1Temp - laggedPrev2Temp) &&
      Math.abs(laggedPrev1Temp - laggedPrev2Temp) >= 0.3);
  if (isMonotonicMacro) evidenceScore++;

  const iqrBounded = (input.ensembleTempIqrC ?? 1.8) <= 2.6;
  if (agreeingShiftFamilies.size >= 3 && iqrBounded) evidenceScore++;

  if (input.leadHours <= 18 && input.liveAnchor) {
    const dp3h = input.liveAnchor.pressureTrend3hHpa ?? 0;
    const liveT = input.liveAnchor.liveObsTempC;
    const radarWet = (input.liveAnchor.liveRadarRainMmHr ?? 0) >= 0.1;
    if (
      ((dProgDtTrendC < -0.6 || (finalIsWet && !input.previousLockedIsWet)) &&
        (dp3h <= -1.2 || radarWet)) ||
      (dProgDtTrendC > 0.6 &&
        liveT !== null &&
        liveT !== undefined &&
        laggedPrev1Temp !== null &&
        liveT > laggedPrev1Temp)
    ) {
      evidenceScore++;
    }
  } else if (input.leadHours > 18 && agreeingShiftFamilies.size >= 4) {
    evidenceScore++;
  }

  if (
    !spinUpVetoApplied &&
    laggedPrev1Temp !== null &&
    Math.abs(dProgDtTrendC) >= 0.85 &&
    evidenceScore < 2
  ) {
    hysteresisDamped = true;
    finalTempC = 0.72 * laggedPrev1Temp + 0.28 * finalTempC;
  }

  const prevWet =
    input.previousLockedIsWet ??
    (() => {
      let wetVotes = 0;
      let total = 0;
      for (const m of input.laggedModels) {
        const idx =
          input.utcHourKey && m.utcTimeIndex
            ? (m.utcTimeIndex.get(input.utcHourKey) ?? input.hourIndex)
            : input.hourIndex;
        const p1 = m.runMinus1PrecipMm?.[idx];
        if (p1 !== null && p1 !== undefined && Number.isFinite(p1)) {
          total++;
          if (p1 >= 0.22) wetVotes++;
        }
      }
      return total > 0 ? wetVotes / total >= 0.45 : null;
    })();

  if (
    !spinUpVetoApplied &&
    prevWet !== null &&
    finalIsWet !== prevWet &&
    evidenceScore < 2 &&
    ((finalIsWet && finalPopPct < 66) || (!finalIsWet && finalPopPct > 30))
  ) {
    hysteresisDamped = true;
    finalIsWet = prevWet;
    if (!finalIsWet) {
      finalPrecipMmHr = 0;
      finalPopPct = Math.min(38, finalPopPct);
    } else {
      finalPrecipMmHr = Math.max(0.2, input.previousLockedPrecipMmHr ?? 0.35);
      finalPopPct = Math.max(52, finalPopPct);
    }
  }

  const stabilityGrade: StabilityGrade =
    runLockCounter >= 3 && Math.abs(dProgDtTrendC) <= 0.9
      ? "LOCKED"
      : runLockCounter >= 2 || evidenceScore >= 2
        ? "CONVERGING"
        : "WATCH";

  return {
    validTimeIso: input.validTimeIso,
    finalTempC: Number(finalTempC.toFixed(2)),
    finalIsWet,
    finalPrecipMmHr: Number((finalIsWet ? finalPrecipMmHr : 0).toFixed(2)),
    finalPopPct: Math.round(finalPopPct),
    spinUpVetoApplied,
    hysteresisDamped,
    dProgDtTrendC: Number(dProgDtTrendC.toFixed(2)),
    consecutiveRunLockCount: runLockCounter,
    evidenceScore,
    stabilityGrade
  };
}

export function summarizeForecastStability(
  steps: HourlyConsistencyOutput[],
  activeRegimeLabelTr?: string
): ForecastStabilitySummary {
  if (steps.length === 0) {
    return {
      overallStabilityPct: 100,
      overallGrade: "LOCKED",
      meanRunLockCount: 4,
      blockedNoisyRevisionsCount: 0,
      spinUpVetoesCount: 0,
      badgeLabelTr: "4 Koşu Kilitli"
    };
  }

  const lockedCount = steps.filter((s) => s.stabilityGrade === "LOCKED").length;
  const convergingCount = steps.filter((s) => s.stabilityGrade === "CONVERGING").length;
  const overallStabilityPct = Math.round(
    ((lockedCount + 0.65 * convergingCount) / steps.length) * 100
  );
  const meanRunLockCount = Number(
    (steps.reduce((acc, s) => acc + s.consecutiveRunLockCount, 0) / steps.length).toFixed(1)
  );
  const blockedNoisyRevisionsCount = steps.filter((s) => s.hysteresisDamped).length;
  const spinUpVetoesCount = steps.filter((s) => s.spinUpVetoApplied).length;

  const overallGrade: StabilityGrade =
    overallStabilityPct >= 75 ? "LOCKED" : overallStabilityPct >= 48 ? "CONVERGING" : "WATCH";

  const gradeText =
    overallGrade === "LOCKED"
      ? `${Math.round(meanRunLockCount)} Koşu Kilitli (%${overallStabilityPct})`
      : overallGrade === "CONVERGING"
        ? `Yakınsıyor (%${overallStabilityPct})`
        : "Cephe Geçişi İzleniyor";

  return {
    overallStabilityPct,
    overallGrade,
    meanRunLockCount,
    blockedNoisyRevisionsCount,
    spinUpVetoesCount,
    badgeLabelTr: activeRegimeLabelTr ? `${gradeText} · ${activeRegimeLabelTr}` : gradeText
  };
}
