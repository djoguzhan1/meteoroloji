"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Compass,
  Layers,
  Mountain,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Snowflake,
  ThermometerSnowflake,
  Wind,
  Zap
} from "lucide-react";
import { useWeatherData, useWeatherScrub } from "@/context/WeatherContext";
import {
  resolveTemporalLightningRadar,
  type TemporalLightningRadar
} from "@/lib/temporal-view";
import { atmosUiSfx } from "@/lib/ui-sfx";
import {
  formatDistance,
  formatElevation,
  formatSnowDepth,
  formatTempDelta,
  formatTemperature,
  isSnowLinePhysicallyRelevant
} from "@/lib/weather-client";
import type {
  BlowingSnowRisk,
  CurrentWeather,
  DailyPoint,
  DekSnowStatus,
  ElevationSnowBand,
  HourlyPoint,
  LightningProximityRadar,
  LightningRangeRingSummary,
  LightningSafetyLevel,
  RoadIcingRisk,
  SnowAndLightningObservatorySummary,
  StormAssessment,
  SubseasonalOutlookBundle,
  UnitSystem,
  WeatherBundle
} from "@/lib/weather-types";

const MONTH_ABBR_TR = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara"
] as const;

export type ObservatoryDensityMode = 0 | 1 | 2 | 3;

export interface ConvectiveStormWindow {
  id: string;
  startIdx: number;
  endIdx: number;
  peakHourIdx: number;
  startLabel: string;
  endLabel: string;
  peakLabel: string;
  peakProbPct: number;
  peakFlashesPerMin: number;
  hasThundersnow: boolean;
}

interface UserInspectOverride {
  anchorKey: string;
  atHourIndex: number;
  atFocusedDate: string | null;
  mode: "date" | "hour";
  dateYmd: string;
}

function useOptionalWeatherScrub() {
  try {
    return useWeatherScrub();
  } catch {
    return null;
  }
}

function useOptionalWeatherData() {
  try {
    return useWeatherData();
  } catch {
    return null;
  }
}

function formatShortDateTr(dateYmd: string): string {
  const m = Number(dateYmd.slice(5, 7)) - 1;
  const d = Number(dateYmd.slice(8, 10));
  if (!Number.isFinite(d) || m < 0 || m > 11) return dateYmd.slice(5);
  return `${d} ${MONTH_ABBR_TR[m]}`;
}

function describeIcingTr(risk: RoadIcingRisk | undefined): {
  label: string;
  cls: string;
} {
  if (risk === "black_ice") {
    return {
      label: "ASFALT GİZLİ BUZLANMA",
      cls: "border-rose-400/45 bg-rose-500/15 text-rose-200"
    };
  }
  if (risk === "high") {
    return {
      label: "Kuvvetli Buzlanma",
      cls: "border-signal-amber/45 bg-signal-amber/15 text-amber-200"
    };
  }
  if (risk === "low") {
    return {
      label: "Yerel Don / Kırağı",
      cls: "border-sky-400/35 bg-sky-400/12 text-sky-200"
    };
  }
  return {
    label: "Buzlanma Yok",
    cls: "border-white/10 bg-white/[0.04] text-ink-muted"
  };
}

function describeDekTr(
  dek: DekSnowStatus | undefined,
  deltaT: number | null | undefined,
  unit: UnitSystem
): {
  label: string;
  cls: string;
} {
  const dtTxt =
    deltaT !== null && deltaT !== undefined && Number.isFinite(deltaT)
      ? ` (ΔT ${formatTempDelta(deltaT, unit, { decimals: 1, showUnit: true })})`
      : "";
  if (dek === "heavy_dek") {
    return {
      label: `Kuvvetli DEK Bantları${dtTxt}`,
      cls: "border-cyan-300/45 bg-cyan-400/15 text-cyan-100"
    };
  }
  if (dek === "moderate_dek") {
    return {
      label: `Aktif Deniz Etkisi (DEK)${dtTxt}`,
      cls: "border-sky-400/40 bg-sky-400/12 text-sky-200"
    };
  }
  if (dek === "watch") {
    return {
      label: `Zayıf DEK Potansiyeli${dtTxt}`,
      cls: "border-white/15 bg-white/[0.06] text-ink-secondary"
    };
  }
  return {
    label: "DEK Yok",
    cls: "border-white/10 bg-white/[0.03] text-ink-muted"
  };
}

function describeBlowingTr(risk: BlowingSnowRisk | undefined): string {
  if (risk === "blizzard") return "Tipi / Beyaz Körlük";
  if (risk === "drifting") return "Sürüklenen Kar";
  return "Sakin";
}

function formatRingLabelByUnit(ringKm: 15 | 40 | 100, unit: UnitSystem): string {
  if (ringKm === 15) {
    return unit === "imperial"
      ? "0–9 mi · Acil Yakın Çember"
      : "0–15 km · Acil Yakın Çember";
  }
  if (ringKm === 40) {
    return unit === "imperial"
      ? "9–25 mi · Yaklaşma Çemberi"
      : "15–40 km · Yaklaşma Çemberi";
  }
  return unit === "imperial"
    ? "25–62 mi · Erken Uyarı Ufku"
    : "40–100 km · Erken Uyarı Ufku";
}

function localizeDistanceText(text: string, unit: UnitSystem): string {
  if (unit !== "imperial" || !text) return text;
  const withRanges = text.replace(
    /(\d+(?:\.\d+)?)\s*([–-])\s*(\d+(?:\.\d+)?)\s*km\b/g,
    (_match, aStr: string, dash: string, bStr: string) => {
      const aMi = Math.round(Number(aStr) * 0.621371);
      const bMi = Math.round(Number(bStr) * 0.621371);
      return `${aMi}${dash}${bMi} mi`;
    }
  );
  return withRanges.replace(/(\d+(?:\.\d+)?)\s*km\b/g, (_match, nStr: string) => {
    const km = Number(nStr);
    if (km === 15) return "9 mi";
    if (km === 40) return "25 mi";
    if (km === 100) return "62 mi";
    return formatDistance(km, "imperial");
  });
}

export function resolveObservatoryDensityMode(
  summary: SnowAndLightningObservatorySummary,
  daily: DailyPoint[]
): ObservatoryDensityMode {
  const isCalmMode0 =
    !summary.hasAnySnow15d &&
    summary.maxIcingRisk48h === "none" &&
    summary.lightningRadar.safetyLevel === "safe" &&
    summary.peak48hLightningProbPct <= 20;

  if (isCalmMode0) {
    return 0;
  }

  const hasSnowSignal =
    summary.hasAnySnow15d ||
    summary.maxIcingRisk48h !== "none" ||
    daily.some(
      (d) =>
        (d.airSnowSumCm ?? 0) >= 0.1 ||
        (d.snowProbMaxPct ?? 0) >= 30 ||
        (d.elevationSnowBands?.some((b) => b.airSnowCm >= 0.5) ?? false)
    );

  const hasLightningSignal =
    summary.lightningRadar.safetyLevel !== "safe" ||
    summary.peak48hLightningProbPct > 20 ||
    summary.hasThundersnow168h;

  if (hasSnowSignal && hasLightningSignal) return 3;
  if (!hasSnowSignal && hasLightningSignal) return 1;
  if (hasSnowSignal && !hasLightningSignal) return 2;
  return 0;
}

export function buildConvectiveStormWindows(
  sparkHours: Array<{
    idx: number;
    time: string;
    dayLabel: string;
    hourLabel: string;
    label: string;
    prob: number;
    flashes: number;
    isThundersnow: boolean;
  }>
): ConvectiveStormWindow[] {
  const windows: ConvectiveStormWindow[] = [];
  let current: ConvectiveStormWindow | null = null;

  for (const h of sparkHours) {
    const isActive = h.prob >= 22 || h.flashes >= 0.15 || h.isThundersnow;
    if (!isActive) continue;

    if (current && h.idx - current.endIdx <= 2) {
      current.endIdx = h.idx;
      current.endLabel = h.hourLabel;
      current.hasThundersnow = current.hasThundersnow || h.isThundersnow;
      if (
        h.prob > current.peakProbPct ||
        (h.prob === current.peakProbPct && h.flashes > current.peakFlashesPerMin)
      ) {
        current.peakHourIdx = h.idx;
        current.peakLabel = h.label;
        current.peakProbPct = h.prob;
        current.peakFlashesPerMin = h.flashes;
      }
    } else {
      current = {
        id: `storm-win-${h.idx}`,
        startIdx: h.idx,
        endIdx: h.idx,
        peakHourIdx: h.idx,
        startLabel: h.label,
        endLabel: h.hourLabel,
        peakLabel: h.label,
        peakProbPct: h.prob,
        peakFlashesPerMin: h.flashes,
        hasThundersnow: h.isThundersnow
      };
      windows.push(current);
    }
  }

  return windows
    .sort((a, b) => b.peakProbPct - a.peakProbPct || a.startIdx - b.startIdx)
    .slice(0, 4)
    .sort((a, b) => a.startIdx - b.startIdx);
}

function buildDailyFallbackRadar(
  day: DailyPoint,
  dayOffset: number
): TemporalLightningRadar {
  const prob = Math.max(0, Math.min(99, Math.round(day.lightningProbMaxPct ?? 0)));
  const flashes = Math.max(0, Number((day.lightningPeakFlashesPerMin ?? 0).toFixed(1)));
  const lpi = Math.max(0, Number((day.lpiMaxJkg ?? 0).toFixed(2)));
  const isTsnow = Boolean(day.hasThundersnow);
  const cg = isTsnow ? 46 : 28;

  const mkRing = (
    ringKm: 15 | 40 | 100,
    labelTr: string,
    factor: number
  ): LightningRangeRingSummary => {
    const rProb = Math.max(0, Math.min(99, Math.round(prob * factor)));
    const rFlash = rProb >= 25 ? Number((flashes * factor).toFixed(1)) : 0;
    const status: LightningRangeRingSummary["status"] =
      rProb >= 68 || rFlash >= 2.5
        ? "severe"
        : rProb >= 38
          ? "active"
          : rProb >= 18
            ? "watch"
            : "clear";
    return {
      ringKm,
      labelTr,
      activeCellCount: status === "severe" || status === "active" ? 1 : 0,
      maxDbz: status === "clear" ? 0 : Number((34 + rProb * 0.2).toFixed(1)),
      estFlashesPerMin: rFlash,
      probabilityPct: rProb,
      status
    };
  };

  const ring15 = mkRing(15, "0–15 km · Acil Yakın Çember", 1);
  const ring40 = mkRing(40, "15–40 km · Yaklaşma Çemberi", 0.86);
  const ring100 = mkRing(100, "40–100 km · Erken Uyarı Ufku", 0.72);

  let safetyLevel: LightningSafetyLevel = "safe";
  let safetyTitleTr = "Açık Alan Güvenli (Aktif Deşarj Yok)";
  let safetyDetailTr = `${day.dayName} (${formatShortDateTr(day.date)}) gününde 0–100 km çevrede kuvvetli yıldırım/şimşek sinyali öngörülmüyor.`;

  if (ring15.status === "severe" || ring15.status === "active") {
    safetyLevel = "shelter_now";
    safetyTitleTr = isTsnow
      ? "ACİL: Gökgürültülü Kar (Thundersnow) — Kapalı Alana Geçin"
      : "30-30 KURALI AKTİF: 15 km İçinde Yıldırım Tehlikesi";
    safetyDetailTr = `${day.dayName} gününün zirve konvektif diliminde 0–15 km merkez halkada yüksek deşarj riski öngörülüyor.`;
  } else if (ring40.status === "severe" || ring40.status === "active") {
    safetyLevel = "caution_30_30";
    safetyTitleTr = "Yakın Çevrede Aktif Oraj (15–40 km)";
    safetyDetailTr = `${day.dayName} gününün zirve saatlerinde 15–40 km çevrede konvektif hücre geçişi öngörülüyor.`;
  } else if (ring100.status !== "clear" || prob >= 20) {
    safetyLevel = "awareness";
    safetyTitleTr = "Uzak Ufuk / Konvektif Kararsızlık İzlemesi";
    safetyDetailTr = `${day.dayName} gününde orta düzey buz-graupel şarj potansiyeli izleniyor.`;
  }

  const leadHours = Math.max(24, dayOffset * 24 + 12);

  return {
    updatedAtIso: `${day.date}T12:00`,
    radarBacked: false,
    metarConfirmedTs: false,
    safetyLevel,
    safetyTitleTr,
    safetyDetailTr,
    nearestCellKm:
      safetyLevel === "shelter_now"
        ? 9
        : safetyLevel === "caution_30_30"
          ? 26
          : null,
    nearestBearingTr: day.dominantWindCompass ?? "GB",
    approachingEtaMin: null,
    currentFlashesPerMin: flashes,
    currentLpiJkg: lpi,
    currentCgFractionPct: cg,
    isThundersnowNow: isTsnow,
    rings: [ring15, ring40, ring100],
    cells: [],
    sourceMode: "NWP_ADVECTIVE_PROJECTION",
    modeBadgeTr: `NWP Konvektif Projeksiyon (+${leadHours}s)`,
    leadHours
  };
}

function buildMinimalBundleForRadar(
  hourly: HourlyPoint[],
  daily: DailyPoint[],
  summary: SnowAndLightningObservatorySummary
): WeatherBundle {
  const h0 = hourly[0];
  const fallbackCurrent: CurrentWeather = {
    time: h0?.time ?? summary.lightningRadar.updatedAtIso,
    temperature: h0?.temperature ?? 12,
    apparentTemperature: h0?.apparentTemperature ?? h0?.temperature ?? 12,
    humidity: h0?.humidity ?? 65,
    dewPoint: h0?.dewPoint ?? 5,
    pressure: h0?.pressure ?? 1015,
    pressureDelta3h: 0,
    pressureTrend: "sabit",
    pressureTrendDetail: "Sabit barometre",
    windSpeed: h0?.windSpeed ?? 16,
    windGusts: h0?.windGusts ?? 24,
    windDirection: h0?.windDirection ?? 220,
    beaufort: { scale: 3, label: "Hafif rüzgar" },
    cloudCover: h0?.cloudCover ?? 40,
    visibilityKm: h0?.visibilityKm ?? 15,
    uvIndex: h0?.uvIndex ?? 2,
    uvLabel: "Düşük",
    precipitation: h0?.precipitation ?? 0,
    precipProbability: h0?.precipProbability ?? 0,
    precipConsensus: h0?.precipConsensus ?? {
      agreeingModels: 0,
      totalModels: 8,
      minMm: 0,
      medianMm: 0,
      maxMm: 0
    },
    precipType: h0?.precipType ?? "none",
    lightningProbPct:
      h0?.lightningProbPct ?? summary.lightningRadar.rings[0].probabilityPct,
    lightningFlashesPerMin:
      h0?.lightningFlashesPerMin ?? summary.lightningRadar.currentFlashesPerMin,
    isThundersnow: h0?.isThundersnow ?? summary.lightningRadar.isThundersnowNow,
    weatherCode: h0?.weatherCode ?? 1,
    condition: h0?.condition ?? "Az Bulutlu",
    isStorm: h0?.isStorm ?? false,
    isDay: true,
    solarElevationDeg: h0?.solarElevationDeg ?? 25,
    daylight: h0?.daylight ?? 0.8,
    sunrise: daily[0]?.sunrise ?? "",
    sunset: daily[0]?.sunset ?? "",
    temp850hPa: h0?.temp850hPa ?? null
  };

  return {
    location: {
      id: "observatory-ref",
      name: "Merkez",
      country: "TR",
      lat: 40.23,
      lon: 29.01,
      elevation: summary.referenceElevationM
    },
    source: "hybrid-nwp",
    fetchedAt: summary.lightningRadar.updatedAtIso,
    timezone: "UTC",
    utcOffsetSeconds: 0,
    current: fallbackCurrent,
    airQuality: {
      europeanAqi: 20,
      categoryIndex: 1,
      label: "İyi",
      dominantPollutant: "PM2.5",
      dominantValueText: "5 µg/m³",
      pm25: 5,
      pm10: 10,
      ozone: 40,
      no2: 8,
      so2: 2,
      dust: 0
    },
    hourly,
    daily,
    sounding: [],
    hourlySoundings: [],
    nativeConvective: {
      cape: h0?.cape ?? null,
      cin: h0?.cin ?? null,
      liftedIndex: h0?.liftedIndex ?? null,
      freezingLevelM: h0?.freezingLevelM ?? null
    },
    snowAndLightning: summary,
    hybrid: {
      activeModels: [],
      confidencePct: 90,
      tempSpreadC: 0.8,
      pressureSpreadHpa: 0.8,
      currentBreakdown: {
        temperature: { ecmwfIfs: null, ecmwfAifs: null, icon: null, ukmo: null, gfs: null },
        pressure: { ecmwfIfs: null, ecmwfAifs: null, icon: null, ukmo: null, gfs: null },
        windSpeed: { ecmwfIfs: null, ecmwfAifs: null, icon: null, ukmo: null, gfs: null },
        temp850hPa: { ecmwfIfs: null, ecmwfAifs: null, icon: null, ukmo: null, gfs: null },
        precipitation: { ecmwfIfs: null, ecmwfAifs: null, icon: null, ukmo: null, gfs: null }
      },
      verification: {
        mode: "wmo-prior",
        station: null,
        matchedHours: 0,
        winners: { temperature: null, pressure: null, wind: null },
        rows: []
      },
      attributions: []
    }
  };
}

function LightningScopeSvg({
  radar,
  unit
}: {
  radar: LightningProximityRadar;
  unit: UnitSystem;
}) {
  const size = 236;
  const c = size / 2;
  const maxR = 94;

  // Non-linear perceptual ring radii: 15 km -> 28px, 40 km -> 58px, 100 km -> 94px
  const mapDistToR = (km: number): number => {
    if (km <= 15) return (km / 15) * 28;
    if (km <= 40) return 28 + ((km - 15) / 25) * 30;
    return 58 + (Math.min(100, km - 40) / 60) * 36;
  };

  const ringLabels =
    unit === "imperial"
      ? {
          r15: "9mi",
          r40: "25mi",
          r100: "62mi",
          aria: "0-9 mi, 9-25 mi ve 25-62 mi üç halkalı şimşek ve konvektif hücre yakınlık radarı"
        }
      : {
          r15: "15km",
          r40: "40km",
          r100: "100km",
          aria: "0-15 km, 15-40 km ve 40-100 km üç halkalı şimşek ve konvektif hücre yakınlık radarı"
        };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-52 w-52 sm:h-56 sm:w-56 max-w-full shrink-0 select-none"
      role="img"
      aria-label={ringLabels.aria}
    >
      <defs>
        <radialGradient id="ltScopeBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(14, 24, 42, 0.95)" />
          <stop offset="70%" stopColor="rgba(8, 13, 24, 0.96)" />
          <stop offset="100%" stopColor="rgba(5, 9, 17, 0.98)" />
        </radialGradient>
        <radialGradient id="ltDangerInner" cx="50%" cy="50%" r="50%">
          <stop
            offset="0%"
            stopColor={
              radar.safetyLevel === "shelter_now"
                ? "rgba(244, 63, 94, 0.28)"
                : radar.safetyLevel === "caution_30_30"
                  ? "rgba(245, 158, 11, 0.18)"
                  : "rgba(56, 189, 248, 0.08)"
            }
          />
          <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
        </radialGradient>
      </defs>

      <circle
        cx={c}
        cy={c}
        r={maxR + 8}
        fill="url(#ltScopeBg)"
        stroke="rgba(255,255,255,0.09)"
        strokeWidth="1.2"
      />
      <circle cx={c} cy={c} r={58} fill="url(#ltDangerInner)" />

      {/* Azimuth Crosshairs */}
      <line x1={c} y1={c - maxR} x2={c} y2={c + maxR} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      <line x1={c - maxR} y1={c} x2={c + maxR} y2={c} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
      <line
        x1={c - maxR * 0.707}
        y1={c - maxR * 0.707}
        x2={c + maxR * 0.707}
        y2={c + maxR * 0.707}
        stroke="rgba(255,255,255,0.045)"
        strokeDasharray="2 3"
      />
      <line
        x1={c + maxR * 0.707}
        y1={c - maxR * 0.707}
        x2={c - maxR * 0.707}
        y2={c + maxR * 0.707}
        stroke="rgba(255,255,255,0.045)"
        strokeDasharray="2 3"
      />

      {/* 100 km / 62 mi Outer Horizon Ring */}
      <circle
        cx={c}
        cy={c}
        r={94}
        fill="none"
        stroke={radar.rings[2].status !== "clear" ? "rgba(56, 189, 248, 0.45)" : "rgba(255,255,255,0.13)"}
        strokeWidth="1.2"
        strokeDasharray="4 3"
      />

      {/* 40 km / 25 mi Approach Ring */}
      <circle
        cx={c}
        cy={c}
        r={58}
        fill="none"
        stroke={
          radar.rings[1].status === "severe" || radar.rings[1].status === "active"
            ? "rgba(245, 158, 11, 0.65)"
            : "rgba(255,255,255,0.16)"
        }
        strokeWidth="1.35"
      />

      {/* 15 km / 9 mi 30-30 Safety Ring */}
      <circle
        cx={c}
        cy={c}
        r={28}
        fill="none"
        stroke={
          radar.rings[0].status === "severe" || radar.rings[0].status === "active"
            ? "rgba(244, 63, 94, 0.85)"
            : "rgba(251, 191, 36, 0.34)"
        }
        strokeWidth="1.5"
      />

      {/* Ring Distance Labels */}
      <text x={c + 4} y={c - 30} fill="rgba(251,191,36,0.78)" fontSize="7.2" fontFamily="monospace">
        {ringLabels.r15}
      </text>
      <text x={c + 4} y={c - 60} fill="rgba(186,230,253,0.68)" fontSize="7.2" fontFamily="monospace">
        {ringLabels.r40}
      </text>
      <text x={c + 4} y={c - 84} fill="rgba(148,163,184,0.65)" fontSize="7.2" fontFamily="monospace">
        {ringLabels.r100}
      </text>

      {/* Cardinal Compass Labels */}
      <text x={c} y={15} textAnchor="middle" fill="rgba(226,232,240,0.86)" fontSize="8.5" fontFamily="monospace" fontWeight="600">
        K
      </text>
      <text x={size - 11} y={c + 3} textAnchor="middle" fill="rgba(148,163,184,0.72)" fontSize="8" fontFamily="monospace">
        D
      </text>
      <text x={c} y={size - 8} textAnchor="middle" fill="rgba(148,163,184,0.72)" fontSize="8" fontFamily="monospace">
        G
      </text>
      <text x={11} y={c + 3} textAnchor="middle" fill="rgba(148,163,184,0.72)" fontSize="8" fontFamily="monospace">
        B
      </text>

      {/* Detected Convective / Graupel / Thundersnow Cells */}
      {radar.cells.map((cell) => {
        const rPx = mapDistToR(cell.distanceKm);
        const rad = (cell.bearingDeg * Math.PI) / 180;
        const x = c + Math.sin(rad) * rPx;
        const y = c - Math.cos(rad) * rPx;
        const isTsnow = cell.kind === "thundersnow_dek";
        const isSevere = cell.peakDbz >= 48 || cell.distanceKm <= 15;
        const fillCol = isTsnow
          ? "#38bdf8"
          : isSevere
            ? "#fb7185"
            : "#fbbf24";

        const vx = c - x;
        const vy = c - y;
        const vLen = Math.max(1, Math.hypot(vx, vy));
        const tipX = x + (vx / vLen) * Math.min(14, vLen * 0.45);
        const tipY = y + (vy / vLen) * Math.min(14, vLen * 0.45);

        return (
          <g key={cell.id}>
            {cell.approaching && vLen > 8 && (
              <line
                x1={x}
                y1={y}
                x2={tipX}
                y2={tipY}
                stroke={fillCol}
                strokeWidth="1.4"
                strokeOpacity="0.85"
                strokeLinecap="round"
              />
            )}
            <circle cx={x} cy={y} r={isSevere ? 7.5 : 6} fill={fillCol} fillOpacity="0.22" />
            <circle
              cx={x}
              cy={y}
              r={isSevere ? 3.8 : 3.1}
              fill={fillCol}
              stroke="#060a13"
              strokeWidth="1.1"
            />
          </g>
        );
      })}

      {/* Center Target Observatory Pin */}
      <circle cx={c} cy={c} r="4.5" fill="var(--atmos-accent)" fillOpacity="0.28" />
      <circle cx={c} cy={c} r="2.4" fill="#f8fafc" stroke="var(--atmos-accent)" strokeWidth="1.2" />
    </svg>
  );
}

function DayHourlySnowVectorSlider({
  dayName,
  shortDateTr,
  dayHours,
  clampedHourIdx,
  totalHourlyCount,
  unit,
  onSelectGlobalHour
}: {
  dayName: string;
  shortDateTr: string;
  dayHours: Array<{ pt: HourlyPoint; globalIdx: number }>;
  clampedHourIdx: number;
  totalHourlyCount: number;
  unit: UnitSystem;
  onSelectGlobalHour: (globalIdx: number) => void;
}) {
  const matchedLocalIdx = dayHours.findIndex((dh) => dh.globalIdx === clampedHourIdx);
  const activeLocalIdx = matchedLocalIdx >= 0 ? matchedLocalIdx : 0;
  const activeEntry = dayHours[activeLocalIdx] ?? dayHours[0];

  const maxHourBar = useMemo(
    () =>
      Math.max(
        0.8,
        ...dayHours.map((dh) =>
          Math.max(dh.pt.airSnowCm ?? 0, dh.pt.groundSnowCm ?? 0)
        )
      ),
    [dayHours]
  );

  const selectByLocalIndex = useCallback(
    (localIdx: number) => {
      const clampedLocal = Math.max(0, Math.min(localIdx, dayHours.length - 1));
      const target = dayHours[clampedLocal];
      if (!target) return;
      atmosUiSfx.playScrubTick(
        target.globalIdx / Math.max(1, totalHourlyCount - 1)
      );
      onSelectGlobalHour(target.globalIdx);
    },
    [dayHours, onSelectGlobalHour, totalHourlyCount]
  );

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (dayHours.length === 0) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      selectByLocalIndex(activeLocalIdx + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      selectByLocalIndex(activeLocalIdx - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      selectByLocalIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      selectByLocalIndex(dayHours.length - 1);
    }
  };

  const touchTrackRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    lockedAxis: "x" | "y" | null;
  } | null>(null);

  const pickAtClientX = (el: HTMLDivElement, clientX: number) => {
    if (dayHours.length === 0) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const ratio = Math.max(0, Math.min(0.9999, (clientX - rect.left) / rect.width));
    const pickedLocalIdx = Math.floor(ratio * dayHours.length);
    selectByLocalIndex(pickedLocalIdx);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dayHours.length === 0) return;
    if (e.pointerType === "touch") {
      touchTrackRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        lockedAxis: null
      };
      return;
    }
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pickAtClientX(e.currentTarget, e.clientX);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dayHours.length === 0) return;
    if (e.pointerType === "touch") {
      const st = touchTrackRef.current;
      if (!st || st.pointerId !== e.pointerId) return;
      const dx = e.clientX - st.startX;
      const dy = e.clientY - st.startY;
      if (st.lockedAxis === null) {
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
          st.lockedAxis = "y";
          return;
        }
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
          st.lockedAxis = "x";
        } else {
          return;
        }
      }
      if (st.lockedAxis === "x") {
        pickAtClientX(e.currentTarget, e.clientX);
      }
      return;
    }
    if (e.buttons === 1) {
      pickAtClientX(e.currentTarget, e.clientX);
    }
  };

  const clearTouchTrack = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (touchTrackRef.current?.pointerId === e.pointerId) {
      touchTrackRef.current = null;
    }
  };

  const activePt = activeEntry?.pt;
  const valueText = activePt
    ? `${dayName} ${activePt.hourLabel} · T ${formatTemperature(activePt.temperature, unit, { decimals: 1, showUnit: true })} (Tw ${formatTemperature(activePt.wetBulbC ?? activePt.temperature, unit, { decimals: 1, showUnit: true })}) · Havada ${formatSnowDepth(activePt.airSnowCm ?? 0, unit, { per: "hour" })} · Zeminde ${formatSnowDepth(activePt.groundSnowCm ?? 0, unit, { per: "hour" })} · Örtü ${formatSnowDepth(activePt.snowpackDepthCm ?? 0, unit)}`
    : `${dayName} saatlik kar akışı`;

  const svgW = 288;
  const svgH = 64;
  const slotW = svgW / Math.max(1, dayHours.length);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#060b15]/85 p-3.5 space-y-2 tabular">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
        <span className="text-ink-secondary">
          <strong>
            {dayName} ({shortDateTr})
          </strong>{" "}
          Saatlik Havada (Açık Mavi) vs. Zeminde Tutan (Beyaz) Kar Akışı
        </span>
        <span className="text-[10px] text-ink-muted">
          Dokunarak veya ok tuşlarıyla saati kilitleyin
        </span>
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-label={`${dayName} ${shortDateTr} 24 saatlik havada ve zeminde kar akışı seçici`}
        aria-valuemin={0}
        aria-valuemax={Math.max(0, dayHours.length - 1)}
        aria-valuenow={activeLocalIdx}
        aria-valuetext={valueText}
        title={valueText}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={clearTouchTrack}
        onPointerCancel={clearTouchTrack}
        className="cursor-pointer rounded-lg p-1 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-sky-400/70 touch-pan-y"
      >
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          preserveAspectRatio="none"
          className="h-16 w-full select-none overflow-hidden"
          aria-hidden="true"
        >
          <line
            x1={0}
            y1={svgH - 1}
            x2={svgW}
            y2={svgH - 1}
            stroke="rgba(255,255,255,0.09)"
            strokeWidth="1"
          />
          {dayHours.map(({ pt, globalIdx }, i) => {
            const hAir = pt.airSnowCm ?? 0;
            const hGnd = pt.groundSnowCm ?? 0;
            const hProb = pt.airSnowProbPct ?? 0;
            const airFrac =
              hAir > 0
                ? Math.max(0.14, Math.min(1, hAir / maxHourBar))
                : hProb >= 20
                  ? 0.1
                  : 0.05;
            const gndFrac =
              hGnd > 0 ? Math.max(0.08, Math.min(airFrac, hGnd / maxHourBar)) : 0;

            const isHourSel = globalIdx === clampedHourIdx;
            const x = i * slotW + slotW * 0.12;
            const barW = Math.max(2, slotW * 0.76);
            const airH = airFrac * (svgH - 6);
            const gndH = gndFrac * (svgH - 6);

            const airFill =
              hAir > 0
                ? "rgba(56, 189, 248, 0.52)"
                : hProb >= 20
                  ? "rgba(56, 189, 248, 0.22)"
                  : "rgba(255, 255, 255, 0.08)";

            return (
              <g key={pt.time}>
                {isHourSel && (
                  <rect
                    x={i * slotW}
                    y={0}
                    width={slotW}
                    height={svgH}
                    rx={2}
                    fill="rgba(56, 189, 248, 0.18)"
                  />
                )}
                <rect
                  x={x}
                  y={svgH - airH}
                  width={barW}
                  height={airH}
                  rx={1.5}
                  fill={airFill}
                />
                {gndH > 0 && (
                  <rect
                    x={x + barW * 0.12}
                    y={svgH - gndH}
                    width={Math.max(1.5, barW * 0.76)}
                    height={gndH}
                    rx={1}
                    fill="#ffffff"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-1 font-mono text-[10px] text-ink-muted">
        <span>{dayHours[0]?.pt.hourLabel}</span>
        <span>{dayHours[Math.floor(dayHours.length * 0.33)]?.pt.hourLabel}</span>
        <span>{dayHours[Math.floor(dayHours.length * 0.66)]?.pt.hourLabel}</span>
        <span>{dayHours[dayHours.length - 1]?.pt.hourLabel}</span>
      </div>
    </div>
  );
}

function SevenDayLightningCurveSvg({
  sparkHours,
  highlightedHourIdx,
  peakProbPct
}: {
  sparkHours: Array<{
    idx: number;
    time: string;
    label: string;
    prob: number;
    flashes: number;
    isThundersnow: boolean;
  }>;
  highlightedHourIdx: number;
  peakProbPct: number;
}) {
  const svgW = 336;
  const svgH = 60;
  const padTop = 6;
  const padBot = 6;
  const usableH = svgH - padTop - padBot;
  const count = Math.max(1, sparkHours.length);

  const { areaPath, linePath, thundersnowDots, markerPos } = useMemo(() => {
    if (sparkHours.length === 0) {
      return {
        areaPath: "",
        linePath: "",
        thundersnowDots: [] as Array<{ x: number; y: number; key: string }>,
        markerPos: null as { x: number; y: number } | null
      };
    }

    const pts = sparkHours.map((s, idx) => {
      const x = count === 1 ? svgW / 2 : (idx / (count - 1)) * svgW;
      const norm = Math.max(0.03, Math.min(1, s.prob / 100));
      const y = svgH - padBot - norm * usableH;
      return { x, y, s };
    });

    const line = pts
      .map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(" ");
    const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${svgH - padBot} L${pts[0].x.toFixed(1)},${svgH - padBot} Z`;

    const tsDots = pts
      .filter((p) => p.s.isThundersnow)
      .filter((_, i) => i % 2 === 0)
      .map((p) => ({ x: p.x, y: p.y, key: p.s.time }));

    const clamped = Math.max(0, Math.min(highlightedHourIdx, pts.length - 1));
    const marker =
      highlightedHourIdx >= 0 && highlightedHourIdx < pts.length
        ? { x: pts[clamped].x, y: pts[clamped].y }
        : null;

    return {
      areaPath: area,
      linePath: line,
      thundersnowDots: tsDots,
      markerPos: marker
    };
  }, [count, highlightedHourIdx, sparkHours, usableH]);

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      preserveAspectRatio="none"
      className="h-14 w-full select-none overflow-hidden rounded-lg bg-obsidian-950/60"
      role="img"
      aria-label={`7 günlük 168 saatlik şimşek olasılığı yoğunluk eğrisi, haftalık zirve yüzde ${peakProbPct}`}
    >
      <defs>
        <linearGradient id="lt7dCurveFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(251, 191, 36, 0.44)" />
          <stop offset="65%" stopColor="rgba(244, 63, 94, 0.16)" />
          <stop offset="100%" stopColor="rgba(15, 23, 42, 0.02)" />
        </linearGradient>
      </defs>

      <line
        x1={0}
        y1={svgH - padBot - usableH * 0.5}
        x2={svgW}
        y2={svgH - padBot - usableH * 0.5}
        stroke="rgba(255,255,255,0.06)"
        strokeDasharray="3 3"
      />
      <line
        x1={0}
        y1={svgH - padBot}
        x2={svgW}
        y2={svgH - padBot}
        stroke="rgba(255,255,255,0.1)"
      />

      {areaPath && <path d={areaPath} fill="url(#lt7dCurveFill)" />}
      {linePath && (
        <path
          d={linePath}
          fill="none"
          stroke={peakProbPct >= 25 ? "#fbbf24" : "rgba(148, 163, 184, 0.55)"}
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {thundersnowDots.map((d) => (
        <circle key={d.key} cx={d.x} cy={d.y} r="2.6" fill="#38bdf8" />
      ))}

      {markerPos && (
        <g>
          <line
            x1={markerPos.x}
            y1={2}
            x2={markerPos.x}
            y2={svgH - 2}
            stroke="rgba(251, 191, 36, 0.72)"
            strokeWidth="1.2"
            strokeDasharray="2 2"
          />
          <circle
            cx={markerPos.x}
            cy={markerPos.y}
            r="3.2"
            fill="#fef3c7"
            stroke="#f59e0b"
            strokeWidth="1.2"
          />
        </g>
      )}
    </svg>
  );
}

export interface SnowAndLightningObservatoryProps {
  cityName?: string;
  daily: DailyPoint[];
  hourly: HourlyPoint[];
  subseasonal?: SubseasonalOutlookBundle | null;
  summary?: SnowAndLightningObservatorySummary;
  storm?: StormAssessment;
  temporalLightningRadar?: TemporalLightningRadar;
  focusedDate?: string | null;
  onSelectDate?: (ymd: string) => void;
  onJumpTo30dSnow?: () => void;
  onOpenConvectiveMeteogram?: () => void;
  selectedHourIndex?: number;
  onSelectHourIndex?: (idx: number) => void;
  onSelectHour?: (idx: number) => void;
  unit?: UnitSystem;
  defaultExpanded?: boolean;
}

function SnowAndLightningObservatoryBase({
  cityName: cityNameProp,
  daily,
  hourly,
  subseasonal,
  summary,
  temporalLightningRadar,
  focusedDate: focusedDateProp,
  onSelectDate,
  onJumpTo30dSnow,
  onOpenConvectiveMeteogram,
  selectedHourIndex: selectedHourIndexProp,
  onSelectHourIndex,
  onSelectHour,
  unit: unitProp,
  defaultExpanded = false
}: SnowAndLightningObservatoryProps) {
  const scrubCtx = useOptionalWeatherScrub();
  const dataCtx = useOptionalWeatherData();

  const ctxBundle = dataCtx?.bundle ?? null;
  const ctxFrameIndex = scrubCtx?.frameIndex ?? null;
  const ctxTemporalRadar = scrubCtx?.temporalView?.lightningRadar ?? null;
  const ctxSetFrameIndex = scrubCtx?.setFrameIndex ?? null;
  const ctxSetFocusedDate = scrubCtx?.setFocusedDate ?? null;

  const cityName =
    cityNameProp ??
    ctxBundle?.location.name ??
    dataCtx?.activeLocation.name ??
    "Merkez";
  const unit: UnitSystem = unitProp ?? dataCtx?.unit ?? "metric";
  const selectedHourIndex = selectedHourIndexProp ?? ctxFrameIndex ?? 0;

  const handleSelectHour = useCallback(
    (idx: number) => {
      onSelectHourIndex?.(idx);
      onSelectHour?.(idx);
      if (!onSelectHourIndex && !onSelectHour && ctxSetFrameIndex) {
        ctxSetFrameIndex(idx);
      }
    },
    [ctxSetFrameIndex, onSelectHour, onSelectHourIndex]
  );

  const clampedHourIdx = Math.max(
    0,
    Math.min(selectedHourIndex, Math.max(0, hourly.length - 1))
  );
  const activeHour = hourly[clampedHourIdx] ?? null;
  const todayYmd = daily[0]?.date ?? hourly[0]?.time.slice(0, 10) ?? "";
  const anchorKey = `${cityName}|${todayYmd}`;
  const externalFocusedDate = focusedDateProp ?? scrubCtx?.focusedDate ?? null;

  const defaultSnowDate = useMemo(() => {
    if (
      summary &&
      summary.lightningRadar.safetyLevel !== "safe" &&
      daily[0]?.date
    ) {
      return daily[0].date;
    }
    const firstCitySnow = daily.find(
      (d) => (d.airSnowSumCm ?? 0) >= 0.1 || (d.snowProbMaxPct ?? 0) >= 25
    );
    if (firstCitySnow) return firstCitySnow.date;
    const firstHighlandSnow = daily.find((d) =>
      d.elevationSnowBands?.some((b) => b.airSnowCm >= 0.3 || b.snowProbPct >= 30)
    );
    return firstHighlandSnow?.date ?? daily[0]?.date ?? "";
  }, [daily, summary]);

  const [userInspect, setUserInspect] = useState<UserInspectOverride | null>(null);
  const inspectTabRefs = useRef<Partial<Record<"date" | "hour", HTMLButtonElement | null>>>({});

  const [prevTracked, setPrevTracked] = useState<{
    anchorKey: string;
    hourIdx: number;
    focusedDate: string | null;
  }>({
    anchorKey,
    hourIdx: clampedHourIdx,
    focusedDate: externalFocusedDate
  });

  if (
    prevTracked.anchorKey !== anchorKey ||
    prevTracked.hourIdx !== clampedHourIdx ||
    prevTracked.focusedDate !== externalFocusedDate
  ) {
    const prevDate = prevTracked.focusedDate;
    setPrevTracked({
      anchorKey,
      hourIdx: clampedHourIdx,
      focusedDate: externalFocusedDate
    });
    if (userInspect !== null) {
      const externallyResetDate =
        prevDate !== externalFocusedDate &&
        externalFocusedDate !== null &&
        externalFocusedDate !== userInspect.dateYmd;
      const matchesPending =
        userInspect.anchorKey === anchorKey &&
        userInspect.atHourIndex === clampedHourIdx &&
        (externalFocusedDate === userInspect.dateYmd ||
          externalFocusedDate === userInspect.atFocusedDate);
      if (!matchesPending || externallyResetDate) {
        setUserInspect(null);
      }
    }
  }
  const [hashTriggeredExpand, setHashTriggeredExpand] = useState<boolean>(false);
  const [userDensityOverride, setUserDensityOverride] = useState<{
    anchorKey: string;
    mode: "expanded" | "compact";
  } | null>(() =>
    defaultExpanded ? { anchorKey, mode: "expanded" } : null
  );

  // URL `#kar-simsek` hash + top chip anchor click auto-expansion listener
  useEffect(() => {
    if (typeof window === "undefined") return;

    const activateExpand = () => {
      setHashTriggeredExpand(true);
      setUserDensityOverride((prev) =>
        prev?.mode === "expanded" && prev.anchorKey === anchorKey
          ? prev
          : { anchorKey, mode: "expanded" }
      );
    };

    const handleHashChange = () => {
      if (window.location.hash === "#kar-simsek") {
        activateExpand();
      }
    };

    const handleDocClick = (ev: MouseEvent) => {
      const target = ev.target as HTMLElement | null;
      const anchor = target?.closest?.('a[href="#kar-simsek"]');
      if (anchor) {
        activateExpand();
      }
    };

    if (window.location.hash === "#kar-simsek") {
      queueMicrotask(activateExpand);
    }

    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("click", handleDocClick);
    window.addEventListener("atmos:open-observatory", activateExpand);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleDocClick);
      window.removeEventListener("atmos:open-observatory", activateExpand);
    };
  }, [anchorKey]);

  // Pure derived bidirectional Date / Hour state (zero cascading setState in effects!)
  const isUserInspectActive =
    userInspect !== null &&
    userInspect.anchorKey === anchorKey &&
    userInspect.atHourIndex === clampedHourIdx &&
    (externalFocusedDate === userInspect.atFocusedDate ||
      externalFocusedDate === userInspect.dateYmd);

  const inspectMode: "date" | "hour" = isUserInspectActive
    ? userInspect.mode
    : clampedHourIdx > 0
      ? "hour"
      : "date";

  const rawTargetDate = isUserInspectActive
    ? userInspect.dateYmd
    : clampedHourIdx > 0 && activeHour
      ? activeHour.time.slice(0, 10)
      : externalFocusedDate && daily.some((d) => d.date === externalFocusedDate)
        ? externalFocusedDate
        : defaultSnowDate;

  const effectiveSelectedDate = useMemo(() => {
    if (daily.some((d) => d.date === rawTargetDate)) return rawTargetDate;
    return defaultSnowDate || daily[0]?.date || "";
  }, [daily, defaultSnowDate, rawTargetDate]);

  const activeDayIndex = useMemo(() => {
    const idx = daily.findIndex((d) => d.date === effectiveSelectedDate);
    return idx >= 0 ? idx : 0;
  }, [daily, effectiveSelectedDate]);

  const activeDay = daily[activeDayIndex] ?? null;

  // Hourly slices belonging to `effectiveSelectedDate`
  const dayHours = useMemo(() => {
    const out: Array<{ pt: HourlyPoint; globalIdx: number }> = [];
    hourly.forEach((pt, idx) => {
      if (pt.time.startsWith(effectiveSelectedDate)) {
        out.push({ pt, globalIdx: idx });
      }
    });
    return out;
  }, [effectiveSelectedDate, hourly]);

  const firstHourIdxOfSelectedDate = dayHours[0]?.globalIdx;

  // Peak lightning hour inside `effectiveSelectedDate` (used when `inspectMode === "date"` on future days)
  const dayPeakLightningEntry = useMemo(() => {
    if (dayHours.length === 0) return null;
    return dayHours.reduce((best, cur) => {
      const curScore =
        (cur.pt.lightningProbPct ?? 0) * 1000 +
        (cur.pt.lightningFlashesPerMin ?? 0) * 100 +
        (cur.pt.lpiJkg ?? 0) * 10 +
        (cur.pt.isThundersnow ? 500 : 0);
      const bestScore =
        (best.pt.lightningProbPct ?? 0) * 1000 +
        (best.pt.lightningFlashesPerMin ?? 0) * 100 +
        (best.pt.lpiJkg ?? 0) * 10 +
        (best.pt.isThundersnow ? 500 : 0);
      return curScore > bestScore ? cur : best;
    }, dayHours[0]);
  }, [dayHours]);

  const snowDatesCount15d = useMemo(
    () =>
      daily.filter(
        (d) =>
          (d.airSnowSumCm ?? 0) >= 0.1 ||
          (d.snowProbMaxPct ?? 0) >= 20 ||
          (d.elevationSnowBands?.some((b) => b.airSnowCm >= 0.5) ?? false)
      ).length,
    [daily]
  );

  const hasAnyRelevantSnowLine15d = useMemo(() => {
    if (!summary) return false;
    return daily.some((d) =>
      isSnowLinePhysicallyRelevant({
        snowLineElevationM: d.minSnowLineM,
        baseElevationM: summary.referenceElevationM,
        temperatureC: d.tempMin,
        precipMmHr: (d.precipSum ?? 0) >= 0.5 ? 0.2 : 0,
        precipProbabilityPct: d.precipProbabilityMax,
        airSnowProbPct: d.snowProbMaxPct ?? 0,
        snowpackDepthCm: d.maxSnowpackDepthCm ?? 0
      })
    );
  }, [daily, summary]);

  const lightningSparkHours = useMemo(() => {
    return hourly.slice(0, 168).map((h, idx) => ({
      idx,
      time: h.time,
      dayLabel: h.dayLabel,
      hourLabel: h.hourLabel,
      label: `${h.dayLabel} ${h.hourLabel}`,
      prob: h.lightningProbPct ?? 0,
      flashes: h.lightningFlashesPerMin ?? 0,
      lpi: h.lpiJkg ?? 0,
      isThundersnow: Boolean(h.isThundersnow)
    }));
  }, [hourly]);

  const activeStormWindows = useMemo(
    () => buildConvectiveStormWindows(lightningSparkHours),
    [lightningSparkHours]
  );

  const bundleForRadar = useMemo(() => {
    if (!summary) return null;
    if (ctxBundle && ctxBundle.hourly === hourly) {
      return ctxBundle;
    }
    return buildMinimalBundleForRadar(hourly, daily, summary);
  }, [ctxBundle, daily, hourly, summary]);

  const isHourView = inspectMode === "hour" && activeHour !== null;
  const isFutureDateInspect =
    !isHourView && Boolean(effectiveSelectedDate) && effectiveSelectedDate !== todayYmd;

  // Unified Temporal Lightning Radar + 4 Telemetry State (ZERO internal split!)
  const { activeRadar, radarScopeContextLabel, highlightedCurveHourIdx } = useMemo(() => {
    if (!summary || !bundleForRadar) {
      return {
        activeRadar: null as TemporalLightningRadar | null,
        radarScopeContextLabel: null as string | null,
        highlightedCurveHourIdx: clampedHourIdx
      };
    }

    if (isHourView) {
      if (
        temporalLightningRadar &&
        temporalLightningRadar.leadHours === clampedHourIdx
      ) {
        return {
          activeRadar: temporalLightningRadar,
          radarScopeContextLabel:
            clampedHourIdx > 0 && activeHour
              ? `Seçili Saat: ${activeHour.dayLabel} ${activeHour.hourLabel}`
              : null,
          highlightedCurveHourIdx: clampedHourIdx
        };
      }
      if (
        ctxTemporalRadar &&
        ctxFrameIndex === clampedHourIdx &&
        ctxBundle?.hourly === hourly
      ) {
        return {
          activeRadar: ctxTemporalRadar,
          radarScopeContextLabel:
            clampedHourIdx > 0 && activeHour
              ? `Seçili Saat: ${activeHour.dayLabel} ${activeHour.hourLabel}`
              : null,
          highlightedCurveHourIdx: clampedHourIdx
        };
      }
      return {
        activeRadar: resolveTemporalLightningRadar(bundleForRadar, clampedHourIdx),
        radarScopeContextLabel:
          clampedHourIdx > 0 && activeHour
            ? `Seçili Saat: ${activeHour.dayLabel} ${activeHour.hourLabel}`
            : null,
        highlightedCurveHourIdx: clampedHourIdx
      };
    }

    if (isFutureDateInspect && activeDay) {
      if (dayPeakLightningEntry) {
        const projected = resolveTemporalLightningRadar(
          bundleForRadar,
          dayPeakLightningEntry.globalIdx
        );
        return {
          activeRadar: projected,
          radarScopeContextLabel: `${activeDay.dayName} (${formatShortDateTr(activeDay.date)}) Zirve Oraj Saati: ${dayPeakLightningEntry.pt.hourLabel}`,
          highlightedCurveHourIdx: dayPeakLightningEntry.globalIdx
        };
      }
      return {
        activeRadar: buildDailyFallbackRadar(activeDay, activeDayIndex),
        radarScopeContextLabel: `${activeDay.dayName} (${formatShortDateTr(activeDay.date)}) Günlük Zirve Projeksiyonu`,
        highlightedCurveHourIdx: -1
      };
    }

    // Today in date mode (`T+0` live Doppler + METAR)
    const liveRadar =
      temporalLightningRadar && temporalLightningRadar.leadHours === 0
        ? temporalLightningRadar
        : resolveTemporalLightningRadar(bundleForRadar, 0);
    return {
      activeRadar: liveRadar,
      radarScopeContextLabel: null,
      highlightedCurveHourIdx: 0
    };
  }, [
    activeDay,
    activeDayIndex,
    activeHour,
    bundleForRadar,
    clampedHourIdx,
    ctxBundle,
    ctxFrameIndex,
    ctxTemporalRadar,
    dayPeakLightningEntry,
    hourly,
    isFutureDateInspect,
    isHourView,
    summary,
    temporalLightningRadar
  ]);

  if (!activeDay || !summary || !activeRadar) return null;

  const densityMode = resolveObservatoryDensityMode(summary, daily);

  const currentDensityOverride =
    userDensityOverride?.anchorKey === anchorKey
      ? userDensityOverride.mode
      : defaultExpanded || hashTriggeredExpand
        ? "expanded"
        : null;

  const userExpanded = currentDensityOverride === "expanded";
  const userForceCompact = currentDensityOverride === "compact";

  // Auto-promote if user scrubbed to a specific future hour that actively has snow or convective lightning
  const scrubbedHourHasActiveHazard =
    clampedHourIdx > 0 &&
    activeHour !== null &&
    ((activeHour.airSnowCm ?? 0) >= 0.08 ||
      (activeHour.airSnowProbPct ?? 0) >= 25 ||
      (activeHour.lightningProbPct ?? 0) > 20 ||
      Boolean(activeHour.isThundersnow));

  const showCompactMode0Bar =
    userForceCompact ||
    (densityMode === 0 && !userExpanded && !scrubbedHourHasActiveHazard);

  const showSnowFull =
    !showCompactMode0Bar &&
    (userExpanded ||
      densityMode === 2 ||
      densityMode === 3 ||
      (densityMode === 0 && scrubbedHourHasActiveHazard));

  const showLightningFull =
    !showCompactMode0Bar &&
    (userExpanded ||
      densityMode === 1 ||
      densityMode === 3 ||
      (densityMode === 0 && scrubbedHourHasActiveHazard));

  const bothColumnsOpen = showSnowFull && showLightningFull;

  const handleExpandFull = () => {
    atmosUiSfx.playNavTick();
    setUserDensityOverride({ anchorKey, mode: "expanded" });
  };

  const handleCollapseCompact = () => {
    atmosUiSfx.playNavTick();
    setHashTriggeredExpand(false);
    setUserDensityOverride({ anchorKey, mode: "compact" });
    if (typeof window !== "undefined" && window.location.hash === "#kar-simsek") {
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${window.location.search}`
      );
    }
  };

  const handleJumpTo30dCorridor = () => {
    atmosUiSfx.playNavTick();
    onJumpTo30dSnow?.();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("atmos:open-30d-snow"));
      document.getElementById("haftalik")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOpenMeteogram = () => {
    atmosUiSfx.playNavTick();
    onOpenConvectiveMeteogram?.();
    const targetHourIdx =
      highlightedCurveHourIdx >= 0
        ? highlightedCurveHourIdx
        : firstHourIdxOfSelectedDate ?? clampedHourIdx;
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("atmos:open-convective-lens", {
          detail: { hourIndex: targetHourIdx }
        })
      );
    }
    if (typeof document !== "undefined") {
      document.getElementById("saatlik")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleInspectTabKeyDown = (
    e: ReactKeyboardEvent<HTMLButtonElement>,
    currentMode: "date" | "hour"
  ) => {
    if (
      e.key !== "ArrowRight" &&
      e.key !== "ArrowLeft" &&
      e.key !== "Home" &&
      e.key !== "End"
    ) {
      return;
    }
    e.preventDefault();
    const nextMode: "date" | "hour" =
      e.key === "Home"
        ? "date"
        : e.key === "End"
          ? "hour"
          : currentMode === "date"
            ? "hour"
            : "date";
    atmosUiSfx.playNavTick();
    setUserInspect({
      anchorKey,
      atHourIndex: clampedHourIdx,
      atFocusedDate: externalFocusedDate,
      mode: nextMode,
      dateYmd:
        nextMode === "hour" && activeHour
          ? activeHour.time.slice(0, 10)
          : effectiveSelectedDate
    });
    inspectTabRefs.current[nextMode]?.focus();
  };

  const lockInspectHour = (targetGlobalIdx: number) => {
    const targetPt = hourly[targetGlobalIdx];
    const targetYmd = targetPt ? targetPt.time.slice(0, 10) : effectiveSelectedDate;
    setUserInspect({
      anchorKey,
      atHourIndex: targetGlobalIdx,
      atFocusedDate: targetYmd,
      mode: "hour",
      dateYmd: targetYmd
    });
    handleSelectHour(targetGlobalIdx);
  };

  // Mode 0 Compact ~64px Status Strip
  if (showCompactMode0Bar) {
    const radarHorizonLabel = formatDistance(100, unit);
    const radarShortStatus =
      summary.lightningRadar.safetyLevel === "safe" &&
      summary.peak48hLightningProbPct <= 20
        ? "Temiz"
        : `48s Zirve %${summary.peak48hLightningProbPct}`;

    return (
      <section id="kar-simsek" className="scroll-mt-28 sm:scroll-mt-20 atmos-cv-auto">
        <div className="surface-panel min-h-[64px] px-4 py-3 flex flex-wrap items-center justify-between gap-3 tabular">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 font-mono text-xs">
            <span className="inline-flex items-center gap-1.5 text-sky-200">
              <Snowflake className="h-3.5 w-3.5 text-sky-300 shrink-0" />
              <span>
                ❄ 15g Kar:{" "}
                <strong className="text-ink-primary">
                  {formatSnowDepth(summary.total15dAirSnowCm, unit)}
                </strong>
              </span>
            </span>

            <span className="text-white/20" aria-hidden="true">
              /
            </span>

            <span className="inline-flex items-center gap-1.5 text-emerald-200">
              <Zap className="h-3.5 w-3.5 text-signal-emerald shrink-0" />
              <span>
                ⚡ {radarHorizonLabel} Radar:{" "}
                <strong className="text-ink-primary">{radarShortStatus}</strong>
              </span>
            </span>

            {summary.hasAnySnow30d && !summary.hasAnySnow15d && (
              <span className="rounded-md border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 text-[10px] text-sky-200">
                16–30G kar sinyali mevcut
              </span>
            )}
          </div>

          <button
            type="button"
            aria-expanded={false}
            onClick={handleExpandFull}
            className="atmos-btn inline-flex items-center gap-1.5 rounded-xl border border-sky-400/35 bg-sky-400/12 px-3.5 py-2 font-mono text-xs font-semibold text-sky-100 hover:border-sky-300/55 hover:bg-sky-400/20 transition-colors"
          >
            <span>Tam Rasathaneyi Aç (1–30G Kar & Radar) ▾</span>
          </button>
        </div>
      </section>
    );
  }

  // Unified Snow & Ground Energy Readout Values
  const airSnowValCm = isHourView
    ? activeHour.airSnowCm ?? 0
    : activeDay.airSnowSumCm ?? 0;
  const airSnowP90Cm = isHourView
    ? Math.max(airSnowValCm, Number(((activeHour.airSnowCm ?? 0) * 1.35).toFixed(1)))
    : activeDay.airSnowP90Cm ?? airSnowValCm;
  const snowProbPct = isHourView
    ? activeHour.airSnowProbPct ?? 0
    : activeDay.snowProbMaxPct ?? 0;

  const groundSnowValCm = isHourView
    ? activeHour.groundSnowCm ?? 0
    : activeDay.groundSnowSumCm ?? 0;
  const groundSnowP90Cm = isHourView
    ? Math.max(
        groundSnowValCm,
        Number(((activeHour.groundSnowCm ?? 0) * 1.35).toFixed(1))
      )
    : activeDay.groundSnowP90Cm ?? groundSnowValCm;
  const snowpackDepthCm = isHourView
    ? activeHour.snowpackDepthCm ?? 0
    : activeDay.maxSnowpackDepthCm ?? 0;

  const roadSnowValCm = isHourView
    ? activeHour.roadSnowCm ?? 0
    : activeDay.roadSnowSumCm ?? 0;

  const soilTempValC = isHourView
    ? activeHour.soilTempC ?? summary.soilTempNowC
    : activeDay.minSoilTempC ?? summary.soilTempNowC;
  const roadTempValC = isHourView
    ? activeHour.roadTempC ?? summary.roadTempNowC
    : activeDay.minRoadTempC ?? summary.roadTempNowC;

  const slrVal = isHourView
    ? activeHour.snowSlr ?? 0
    : activeDay.snowSlrMean ?? 0;
  const snowQuality = isHourView
    ? activeHour.snowQualityTr ?? "Yok"
    : activeDay.snowQualityTr ?? "Yok";
  const snowLineM = isHourView
    ? activeHour.snowLineElevationM ?? null
    : activeDay.minSnowLineM ?? null;

  const dayMinTemp850 =
    dayHours.length > 0
      ? dayHours.reduce<number | null>((acc, dh) => {
          const v = dh.pt.temp850hPa;
          if (v === null || v === undefined || !Number.isFinite(v)) return acc;
          return acc === null ? v : Math.min(acc, v);
        }, null)
      : null;

  const showActiveSnowLine = isHourView
    ? isSnowLinePhysicallyRelevant({
        snowLineElevationM: snowLineM,
        baseElevationM: summary.referenceElevationM,
        temperatureC: activeHour.temperature,
        temp850hPa: activeHour.temp850hPa,
        precipMmHr: activeHour.precipitation,
        precipProbabilityPct: activeHour.precipProbability,
        airSnowProbPct: activeHour.airSnowProbPct ?? 0,
        snowpackDepthCm: activeHour.snowpackDepthCm ?? 0
      })
    : isSnowLinePhysicallyRelevant({
        snowLineElevationM: snowLineM,
        baseElevationM: summary.referenceElevationM,
        temperatureC: activeDay.tempMin,
        temp850hPa: dayMinTemp850,
        precipMmHr: (activeDay.precipSum ?? 0) >= 0.5 ? 0.2 : 0,
        precipProbabilityPct: activeDay.precipProbabilityMax,
        airSnowProbPct: activeDay.snowProbMaxPct ?? 0,
        snowpackDepthCm: activeDay.maxSnowpackDepthCm ?? 0
      });

  const icingRisk = isHourView
    ? activeHour.icingRisk ?? "none"
    : activeDay.icingRiskMax ?? "none";
  const blowingRisk = isHourView
    ? activeHour.blowingSnowRisk ?? "none"
    : activeDay.blowingSnowMax ?? "none";
  const dekStatus = isHourView
    ? activeHour.dekStatus ?? "none"
    : activeDay.dekStatus ?? "none";

  const elevationBands: ElevationSnowBand[] =
    (isHourView ? activeHour.elevationSnowBands : activeDay.elevationSnowBands) ?? [];

  const snowRatePerOpt = isHourView
    ? ({ per: "hour" } as const)
    : ({ per: "day" } as const);

  const icingMeta = describeIcingTr(icingRisk);
  const dekMeta = describeDekTr(dekStatus, summary.dekDeltaTSst850C, unit);

  const safetyColors =
    activeRadar.safetyLevel === "shelter_now"
      ? "border-rose-400/45 bg-rose-500/14 text-rose-100"
      : activeRadar.safetyLevel === "caution_30_30"
        ? "border-signal-amber/45 bg-signal-amber/14 text-amber-100"
        : activeRadar.safetyLevel === "awareness"
          ? "border-signal-sky/35 bg-signal-sky/10 text-sky-100"
          : "border-signal-emerald/30 bg-signal-emerald/[0.07] text-emerald-100";

  const radarBadgeText =
    activeRadar.sourceMode === "NWP_ADVECTIVE_PROJECTION"
      ? activeRadar.modeBadgeTr
      : activeRadar.radarBacked
        ? "Canlı Doppler + METAR"
        : activeRadar.modeBadgeTr || "Canlı Gözlem + NWP";

  const graupelTempBandLabel = unit === "imperial" ? "14..-4°F" : "-10..-20°C";

  return (
    <section
      id="kar-simsek"
      className={`scroll-mt-28 sm:scroll-mt-20 atmos-cv-auto grid gap-5 ${
        bothColumnsOpen
          ? "xl:grid-cols-[minmax(0,1.28fr)_minmax(0,0.92fr)]"
          : "grid-cols-1"
      }`}
    >
      {/* =====================================================================
          SOL MODÜL: TARİH & RAKIM BAZLI KESKİN KAR RASATHANESİ (HAVADA vs ZEMİNDE)
          ===================================================================== */}
      {showSnowFull ? (
        <div className="surface-panel p-4 sm:p-6 space-y-4">
          {/* 1. Üst Başlık + 1–15G / Seçili Saat / 16–30G Kar Koridoru Yönlendirici */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.08] pb-3.5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-sky-300">
                  <Snowflake className="h-3.5 w-3.5" />
                  KAR MİKROFİZİĞİ & ZEMİN ENERJİ BÜTÇESİ
                </span>
                <span className="rounded-md border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 font-mono text-[10px] text-sky-200 tabular">
                  {cityName} ({formatElevation(summary.referenceElevationM, unit)})
                </span>
              </div>
              <h2 className="mt-1 font-display text-base sm:text-lg font-semibold text-ink-primary">
                Tarih Bazlı Havada & Zeminde Keskin Kar Tahmini
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Bourgouin ıslak-hazne erime integrali · Kuchera+DGZ SLR · Toprak ve asfalt 24s ısı hafızası
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <div
                role="tablist"
                aria-label="Kar inceleme modu"
                className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-obsidian-950/80 p-1 text-xs"
              >
                <button
                  ref={(el) => {
                    inspectTabRefs.current.date = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={!isHourView}
                  tabIndex={!isHourView ? 0 : -1}
                  onKeyDown={(e) => handleInspectTabKeyDown(e, "date")}
                  onClick={() => {
                    atmosUiSfx.playNavTick();
                    setUserInspect({
                      anchorKey,
                      atHourIndex: clampedHourIdx,
                      atFocusedDate: externalFocusedDate,
                      mode: "date",
                      dateYmd: effectiveSelectedDate
                    });
                  }}
                  className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                    !isHourView
                      ? "bg-white/15 text-ink-primary shadow-sm"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  1–15. Günler
                </button>

                <button
                  ref={(el) => {
                    inspectTabRefs.current.hour = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={isHourView}
                  tabIndex={isHourView ? 0 : -1}
                  onKeyDown={(e) => handleInspectTabKeyDown(e, "hour")}
                  onClick={() => {
                    atmosUiSfx.playNavTick();
                    setUserInspect({
                      anchorKey,
                      atHourIndex: clampedHourIdx,
                      atFocusedDate: externalFocusedDate,
                      mode: "hour",
                      dateYmd: activeHour
                        ? activeHour.time.slice(0, 10)
                        : effectiveSelectedDate
                    });
                  }}
                  className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                    isHourView
                      ? "bg-sky-400/20 text-sky-100 shadow-sm"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  Seçili Saat ({activeHour?.hourLabel ?? "--:--"})
                </button>
              </div>

              {(Boolean(subseasonal && subseasonal.days.length > 0) ||
                Boolean(onJumpTo30dSnow)) && (
                <button
                  type="button"
                  onClick={handleJumpTo30dCorridor}
                  className="atmos-btn inline-flex items-center gap-1 rounded-xl border border-sky-400/30 bg-sky-400/10 px-2.5 py-1.5 font-mono text-xs font-medium text-sky-200 hover:border-sky-300/50 hover:text-sky-100 transition-colors"
                >
                  <span>16–30. Gün Kar Koridoru ↗</span>
                </button>
              )}

              {!bothColumnsOpen && (
                <button
                  type="button"
                  aria-expanded={true}
                  onClick={handleCollapseCompact}
                  className="atmos-btn inline-flex items-center gap-1 rounded-xl border border-white/12 bg-white/[0.04] px-2.5 py-1.5 font-mono text-[11px] text-ink-secondary hover:text-ink-primary transition-colors"
                >
                  <span>Kompakt Görünüm ▴</span>
                </button>
              )}
            </div>
          </div>

          {/* 15 Günlük Genel Özet Durum Şeridi */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-obsidian-950/65 px-3.5 py-2.5 font-mono text-xs tabular">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-ink-secondary">
                15 Gün Merkez Havada:{" "}
                <strong className="text-sky-200">
                  {formatSnowDepth(summary.total15dAirSnowCm, unit)}
                </strong>
              </span>
              <span className="text-white/20">·</span>
              <span className="text-ink-secondary">
                Zeminde Tutan:{" "}
                <strong className="text-white">
                  {formatSnowDepth(summary.total15dGroundSnowCm, unit)}
                </strong>
              </span>
              <span className="text-white/20">·</span>
              <span className="text-ink-secondary">
                Asfaltta:{" "}
                <strong className="text-cyan-200">
                  {formatSnowDepth(summary.total15dRoadSnowCm, unit)}
                </strong>
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              {hasAnyRelevantSnowLine15d && summary.lowest15dSnowLineM !== null ? (
                <span className="rounded border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 text-sky-200">
                  En Düşük Kar Sınırı: {formatElevation(summary.lowest15dSnowLineM, unit)}
                </span>
              ) : (
                <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5 text-ink-muted">
                  Kar Koşulu Yok (Sıcak Profil)
                </span>
              )}
              <span className="text-ink-muted">
                {snowDatesCount15d > 0
                  ? `${snowDatesCount15d} tarihte merkez/zirve kar sinyali`
                  : "15 günde merkezde kar sinyali düşük"}
              </span>
            </div>
          </div>

          {/* 2. Etkileşimli 15-Gün Tarih Seçici Şeridi */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-ink-muted">
              <span>
                Tarih seçerek o günün 24 saatlik havada, çimde, asfaltta ve zirvede kar bütçesini inceleyin:
              </span>
              {firstHourIdxOfSelectedDate !== undefined && !isHourView && (
                <button
                  type="button"
                  onClick={() => {
                    atmosUiSfx.playNavTick();
                    lockInspectHour(firstHourIdxOfSelectedDate);
                  }}
                  className="inline-flex items-center gap-1 text-sky-300 hover:text-sky-100 transition-colors"
                >
                  <span>3D Sahneyi Bu Tarihe Al</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="no-scrollbar flex items-stretch gap-2 overflow-x-auto pb-1 pt-0.5">
              {daily.map((d) => {
                const isSelected = !isHourView
                  ? d.date === effectiveSelectedDate
                  : Boolean(activeHour?.time.startsWith(d.date));
                const dAir = d.airSnowSumCm ?? 0;
                const dGnd = d.groundSnowSumCm ?? 0;
                const dProb = d.snowProbMaxPct ?? 0;
                const summitBand =
                  d.elevationSnowBands?.[d.elevationSnowBands.length - 1];
                const summitAir = summitBand?.airSnowCm ?? 0;
                const hasCenterSnow = dAir >= 0.1 || dProb >= 20;
                const hasOnlySummitSnow = !hasCenterSnow && summitAir >= 0.4;

                return (
                  <button
                    key={d.date}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      atmosUiSfx.playNavTick();
                      setUserInspect({
                        anchorKey,
                        atHourIndex: clampedHourIdx,
                        atFocusedDate: externalFocusedDate,
                        mode: "date",
                        dateYmd: d.date
                      });
                      onSelectDate?.(d.date);
                      ctxSetFocusedDate?.(d.date);
                    }}
                    className={`atmos-btn flex min-w-[112px] shrink-0 flex-col justify-between rounded-xl border p-2.5 text-left transition-all tabular ${
                      isSelected
                        ? "border-sky-300/55 bg-sky-400/[0.13] shadow-[0_0_20px_-8px_rgba(56,189,248,0.65)]"
                        : hasCenterSnow
                          ? "border-sky-400/25 bg-[#0a1324]/85 hover:border-sky-300/45"
                          : "border-white/[0.07] bg-obsidian-950/60 hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-semibold text-ink-primary">
                        {d.dayName}
                      </span>
                      <span className="font-mono text-[10px] text-ink-muted">
                        {formatShortDateTr(d.date)}
                      </span>
                    </div>

                    <div className="my-1.5 font-mono text-[10px] text-ink-secondary">
                      {formatTemperature(d.tempMin, unit)} /{" "}
                      {formatTemperature(d.tempMax, unit)}
                      {dProb >= 10 && (
                        <span className="ml-1 text-sky-300">· ❄%{dProb}</span>
                      )}
                    </div>

                    {hasCenterSnow ? (
                      <div className="space-y-0.5 rounded-lg border border-sky-300/20 bg-sky-400/10 px-2 py-1 font-mono text-[10px]">
                        <div className="flex items-center justify-between text-sky-200">
                          <span>Hava:</span>
                          <strong>{formatSnowDepth(dAir, unit)}</strong>
                        </div>
                        <div className="flex items-center justify-between text-white">
                          <span>Zemin:</span>
                          <strong>{formatSnowDepth(dGnd, unit)}</strong>
                        </div>
                      </div>
                    ) : hasOnlySummitSnow ? (
                      <div className="rounded-lg border border-indigo-300/20 bg-indigo-400/10 px-2 py-1 font-mono text-[10px] text-indigo-200">
                        <div className="flex items-center justify-between">
                          <span>Merkez:</span>
                          <span>{formatSnowDepth(0, unit)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Zirve:</span>
                          <strong>{formatSnowDepth(summitAir, unit)}</strong>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-2 py-1 font-mono text-[10px] text-ink-muted">
                        <div>Hava: {formatSnowDepth(0, unit)}</div>
                        <div>Zemin: {formatSnowDepth(0, unit)}</div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Seçili Tarih (24s) veya Seçili Saat (1s) İçin 4 Ana Keskin Kar Bütçe Kartı */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 tabular">
            {/* Kart 1: Havada Yağan Saf Kar */}
            <div className="surface-tile p-3 space-y-1 border border-sky-400/20">
              <div className="flex items-center justify-between gap-1 text-[11px] text-sky-200">
                <span>
                  {isHourView
                    ? "Saatlik Akış · Havada"
                    : "24s Gün Toplamı · Havada"}
                </span>
                <Snowflake className="h-3.5 w-3.5 shrink-0 text-sky-300" />
              </div>
              <p className="font-mono text-xl font-bold text-white">
                {formatSnowDepth(airSnowValCm, unit, snowRatePerOpt)}
              </p>
              <p className="font-mono text-[10px] text-ink-secondary">
                İhtimal <strong className="text-sky-300">%{snowProbPct}</strong>
                {airSnowP90Cm > airSnowValCm + 0.1 && (
                  <span>
                    {" "}
                    · P90 {formatSnowDepth(airSnowP90Cm, unit, snowRatePerOpt)}
                  </span>
                )}
              </p>
            </div>

            {/* Kart 2: Çim & Doğal Zeminde Tutan */}
            <div className="surface-tile p-3 space-y-1 border border-cyan-300/20">
              <div className="flex items-center justify-between gap-1 text-[11px] text-cyan-200">
                <span>
                  {isHourView
                    ? "Saatlik Akış · Çim/Toprak"
                    : "24s Gün Toplamı · Çim"}
                </span>
                <Layers className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
              </div>
              <p className="font-mono text-xl font-bold text-cyan-100">
                {formatSnowDepth(groundSnowValCm, unit, snowRatePerOpt)}
              </p>
              <p className="font-mono text-[10px] text-ink-secondary">
                Maks Örtü{" "}
                <strong className="text-white">
                  {formatSnowDepth(snowpackDepthCm, unit)}
                </strong>{" "}
                · Toprak{" "}
                {formatTemperature(soilTempValC, unit, {
                  decimals: 1,
                  showUnit: true
                })}
              </p>
            </div>

            {/* Kart 3: Asfalt & Yolda Tutan */}
            <div className="surface-tile p-3 space-y-1">
              <div className="flex items-center justify-between gap-1 text-[11px] text-ink-secondary">
                <span>
                  {isHourView
                    ? "Saatlik Akış · Asfalt"
                    : "24s Gün Toplamı · Asfalt"}
                </span>
                <ThermometerSnowflake className="h-3.5 w-3.5 shrink-0 text-amber-300" />
              </div>
              <p className="font-mono text-xl font-bold text-ink-primary">
                {formatSnowDepth(roadSnowValCm, unit, snowRatePerOpt)}
              </p>
              <p className="font-mono text-[10px] text-ink-muted">
                Asfalt{" "}
                {formatTemperature(roadTempValC, unit, {
                  decimals: 1,
                  showUnit: true
                })}
                {groundSnowP90Cm > groundSnowValCm + 0.2 && (
                  <span>
                    {" "}
                    · Zemin P90{" "}
                    {formatSnowDepth(groundSnowP90Cm, unit, snowRatePerOpt)}
                  </span>
                )}
              </p>
            </div>

            {/* Kart 4: SLR, Kar Kalitesi & Fiziksel Sıcak Gün Kapılı Kar Sınırı */}
            <div className="surface-tile p-3 space-y-1">
              <div className="flex items-center justify-between gap-1 text-[11px] text-ink-secondary">
                <span>Kar Kalitesi & Sınır</span>
                <Mountain className="h-3.5 w-3.5 shrink-0 text-[var(--atmos-accent)]" />
              </div>
              <p className="font-display text-sm font-semibold text-ink-primary leading-snug">
                {snowQuality !== "Yok"
                  ? snowQuality
                  : showActiveSnowLine
                    ? "Yağışta Kar Yok"
                    : "Kar Koşulu Yok (Sıcak Profil)"}
              </p>
              <p className="font-mono text-[10px] text-ink-secondary">
                {showActiveSnowLine && snowLineM !== null ? (
                  <>
                    {slrVal > 0 ? `SLR ${slrVal}:1 · ` : ""}
                    Sınır{" "}
                    <strong className="text-sky-200">
                      {formatElevation(snowLineM, unit)}
                    </strong>
                  </>
                ) : (
                  <span className="text-ink-muted">
                    Kar Koşulu Yok (Sıcak Profil)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Fiziksel Risk Etiketleri (DEK · Gizli Buzlanma · Tipi) */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] tabular">
            <span className={`rounded-lg border px-2.5 py-1 ${icingMeta.cls}`}>
              Yol Durumu: <strong>{icingMeta.label}</strong>
            </span>
            <span className={`rounded-lg border px-2.5 py-1 ${dekMeta.cls}`}>
              {dekMeta.label}
            </span>
            <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-ink-secondary">
              <Wind className="mr-1 inline h-3 w-3 text-signal-sky" />
              Rüzgar/Tipi:{" "}
              <strong className="text-ink-primary">
                {describeBlowingTr(blowingRisk)}
              </strong>
            </span>
            {isHourView && activeHour?.meltingEnergyJkg !== undefined && (
              <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-ink-muted">
                Erime İntegrali: {activeHour.meltingEnergyJkg} J/kg (Tw=
                {unit === "imperial" ? "32°F" : "0°C"}:{" "}
                {formatElevation(activeHour.wetBulbZeroM ?? 0, unit)})
              </span>
            )}
          </div>

          {/* Seçili Tarihin 24-Saatlik Erişilebilir Vektörel Kar Akışı (role="slider") */}
          {dayHours.length >= 3 && (
            <DayHourlySnowVectorSlider
              dayName={activeDay.dayName}
              shortDateTr={formatShortDateTr(activeDay.date)}
              dayHours={dayHours}
              clampedHourIdx={clampedHourIdx}
              totalHourlyCount={hourly.length}
              unit={unit}
              onSelectGlobalHour={lockInspectHour}
            />
          )}

          {/* 4. 4-Bant Rakım Kar Kesiti (Kıyı / Merkez / Yamaç / Zirve) */}
          {elevationBands.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-ink-secondary">
                <span className="flex items-center gap-1.5">
                  <Mountain className="h-3.5 w-3.5 text-sky-300" />
                  <span>
                    4-Kademeli Rakım Kar Kesiti (
                    {isHourView
                      ? `${activeHour.dayLabel} ${activeHour.hourLabel}`
                      : `${activeDay.dayName} · ${formatShortDateTr(activeDay.date)}`}
                    )
                  </span>
                </span>
                <span className="text-[10px] text-ink-muted">
                  Havada vs. Zeminde Tutan
                </span>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 font-mono text-xs tabular">
                {elevationBands.map((b) => {
                  const hasSnow = b.airSnowCm >= 0.1 || b.snowProbPct >= 20;
                  return (
                    <div
                      key={b.id}
                      className={`rounded-xl border p-3 space-y-1.5 ${
                        hasSnow
                          ? "border-sky-300/30 bg-[#091426]/85"
                          : "border-white/[0.07] bg-obsidian-950/55"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-sans text-xs font-semibold text-ink-primary truncate">
                          {b.labelTr}
                        </span>
                        <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-sky-200">
                          {formatElevation(b.elevationM, unit)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-1 text-[10px] text-ink-muted">
                        <span>
                          T{" "}
                          {formatTemperature(b.tempMeanC, unit, {
                            decimals: 1,
                            showUnit: true
                          })}{" "}
                          (Tw{" "}
                          {formatTemperature(b.wetBulbMeanC, unit, {
                            decimals: 1,
                            showUnit: true
                          })}
                          )
                        </span>
                        <span className="shrink-0 text-sky-300">
                          ❄ %{b.snowProbPct}
                        </span>
                      </div>

                      <div className="space-y-0.5 pt-0.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-ink-secondary">Havada:</span>
                          <strong
                            className={
                              b.airSnowCm > 0 ? "text-sky-200" : "text-ink-muted"
                            }
                          >
                            {formatSnowDepth(
                              b.airSnowCm,
                              unit,
                              isHourView ? { per: "hour" } : undefined
                            )}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-ink-secondary">Zeminde:</span>
                          <strong
                            className={
                              b.groundSnowCm > 0 ? "text-white" : "text-ink-muted"
                            }
                          >
                            {formatSnowDepth(
                              b.groundSnowCm,
                              unit,
                              isHourView ? { per: "hour" } : undefined
                            )}
                          </strong>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-ink-muted">
                          <span>Asfalt / Örtü:</span>
                          <span>
                            {formatSnowDepth(
                              b.roadSnowCm,
                              unit,
                              isHourView ? { per: "hour" } : undefined
                            )}{" "}
                            / {formatSnowDepth(b.maxSnowpackCm, unit)}
                          </span>
                        </div>
                      </div>

                      {b.snowQualityTr !== "Yok" && (
                        <div className="truncate rounded bg-sky-400/10 px-1.5 py-0.5 text-[10px] text-sky-200">
                          {b.snowQualityTr} ({b.slr}:1)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Mod 1 (Yaz Orajı Aktif, Kar Sakin): Tek Tıkla Açılır Kompakt Kar Çekmecesi */
        <div className="surface-panel px-4 py-3 flex flex-wrap items-center justify-between gap-3 tabular">
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
            <Snowflake className="h-4 w-4 text-sky-300 shrink-0" />
            <span className="text-ink-primary font-semibold">
              Kar Mikrofiziği & 4-Rakım Zemin Bütçesi
            </span>
            <span className="text-ink-secondary">
              · 15g Kar:{" "}
              <strong className="text-sky-200">
                {formatSnowDepth(summary.total15dAirSnowCm, unit)}
              </strong>
            </span>
            {!hasAnyRelevantSnowLine15d && (
              <span className="text-ink-muted">· Kar Koşulu Yok (Sıcak Profil)</span>
            )}
          </div>
          <button
            type="button"
            aria-expanded={false}
            onClick={handleExpandFull}
            className="atmos-btn inline-flex items-center gap-1.5 rounded-xl border border-sky-400/35 bg-sky-400/12 px-3 py-1.5 font-mono text-xs font-medium text-sky-100 hover:bg-sky-400/20 transition-colors"
          >
            <span>1–30G Kar Modülünü Yan Yana Aç</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* =====================================================================
          SAĞ MODÜL: 3-HALKALI CANLI / NWP PROJEKSİYONLU ŞİMŞEK & KONVEKTİF RADAR
          ===================================================================== */}
      {showLightningFull ? (
        <div className="surface-panel p-4 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Başlık */}
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/[0.08] pb-3.5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-signal-amber">
                    <Zap className="h-3.5 w-3.5" />
                    BUZ-GRAUPEL ({graupelTempBandLabel}) ELEKTRİKSEL RADAR
                  </span>
                  {activeRadar.metarConfirmedTs && (
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-rose-200">
                      METAR TS DOĞRULANDI
                    </span>
                  )}
                </div>
                <h2 className="mt-1 font-display text-base sm:text-lg font-semibold text-ink-primary">
                  3-Halkalı Şimşek Radarı & 168s Oraj Akışı
                </h2>
                {radarScopeContextLabel && (
                  <p className="mt-0.5 font-mono text-[11px] text-amber-200/90 tabular">
                    {radarScopeContextLabel}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] tabular ${
                    activeRadar.sourceMode === "NWP_ADVECTIVE_PROJECTION"
                      ? "border-signal-amber/35 bg-signal-amber/12 text-amber-100"
                      : "border-white/10 bg-obsidian-950/75 text-ink-secondary"
                  }`}
                >
                  <Radio
                    className={`h-3 w-3 ${
                      activeRadar.sourceMode === "NWP_ADVECTIVE_PROJECTION"
                        ? "text-signal-amber"
                        : "text-signal-emerald"
                    }`}
                  />
                  {radarBadgeText}
                </span>

                <button
                  type="button"
                  aria-expanded={true}
                  onClick={handleCollapseCompact}
                  className="atmos-btn inline-flex items-center gap-1 rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-ink-secondary hover:text-ink-primary transition-colors"
                >
                  <span>Kompakt Görünüm ▴</span>
                </button>
              </div>
            </div>

            {/* WMO 30-30 Yıldırım Güvenlik Durumu Kartı */}
            <div className={`rounded-xl border px-3.5 py-2.5 space-y-1 ${safetyColors}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  {activeRadar.safetyLevel === "safe" ? (
                    <ShieldCheck className="h-4 w-4 shrink-0 text-signal-emerald" />
                  ) : activeRadar.safetyLevel === "shelter_now" ? (
                    <ShieldAlert className="h-4 w-4 shrink-0 text-rose-300" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-signal-amber" />
                  )}
                  <span>{localizeDistanceText(activeRadar.safetyTitleTr, unit)}</span>
                </span>
                {activeRadar.nearestCellKm !== null && (
                  <span className="shrink-0 font-mono text-[11px] font-bold tabular">
                    En Yakın: {formatDistance(activeRadar.nearestCellKm, unit)} (
                    {activeRadar.nearestBearingTr})
                  </span>
                )}
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {localizeDistanceText(activeRadar.safetyDetailTr, unit)}
              </p>
            </div>

            {/* 3-Halkalı SVG Polar Radar + Halka Bazlı Tablo */}
            <div className="grid items-center gap-3.5 sm:grid-cols-[216px_minmax(0,1fr)]">
              <LightningScopeSvg radar={activeRadar} unit={unit} />

              <div className="space-y-2 font-mono text-xs tabular">
                {activeRadar.rings.map((ring) => {
                  const badgeCls =
                    ring.status === "severe"
                      ? "border-rose-400/45 bg-rose-500/15 text-rose-200"
                      : ring.status === "active"
                        ? "border-signal-amber/40 bg-signal-amber/12 text-amber-200"
                        : ring.status === "watch"
                          ? "border-signal-sky/35 bg-signal-sky/10 text-sky-200"
                          : "border-white/[0.08] bg-obsidian-950/60 text-ink-secondary";
                  return (
                    <div
                      key={ring.ringKm}
                      className={`rounded-xl border p-2.5 space-y-1 ${badgeCls}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-sans text-xs font-semibold text-ink-primary">
                          {formatRingLabelByUnit(ring.ringKm, unit)}
                        </span>
                        <strong>%{ring.probabilityPct}</strong>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] opacity-90">
                        <span>
                          {ring.activeCellCount > 0
                            ? `${ring.activeCellCount} hücre · Maks ${ring.maxDbz} dBZ`
                            : "Konvektif çekirdek yok"}
                        </span>
                        <span>
                          {ring.estFlashesPerMin > 0
                            ? `~${ring.estFlashesPerMin} çakım/dk`
                            : "0 çakım/dk"}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {activeRadar.approachingEtaMin !== null && (
                  <div className="flex items-center justify-between rounded-lg border border-signal-amber/35 bg-signal-amber/10 px-2.5 py-1.5 text-[11px] text-amber-100">
                    <span className="flex items-center gap-1">
                      <Compass className="h-3.5 w-3.5 text-signal-amber" />
                      <span>Yaklaşan Hücre Vektörü</span>
                    </span>
                    <strong>~{activeRadar.approachingEtaMin} dk ETA</strong>
                  </div>
                )}
              </div>
            </div>

            {/* 4 Elektriksel Mikrofizik Telemetri Kutusu — Üst Radarla %100 Senkronize! */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-xs tabular">
              <div className="surface-tile p-2.5">
                <span className="text-[10px] text-ink-muted">Çakım Hızı</span>
                <p className="mt-0.5 font-semibold text-ink-primary">
                  {activeRadar.currentFlashesPerMin.toFixed(1)}{" "}
                  <span className="text-[10px] font-normal text-ink-muted">/dk</span>
                </p>
              </div>
              <div className="surface-tile p-2.5">
                <span className="text-[10px] text-ink-muted">Buz-Akısı LPI</span>
                <p className="mt-0.5 font-semibold text-amber-200">
                  {activeRadar.currentLpiJkg.toFixed(2)}{" "}
                  <span className="text-[10px] font-normal text-ink-muted">J/kg</span>
                </p>
              </div>
              <div className="surface-tile p-2.5">
                <span className="text-[10px] text-ink-muted">Bulut-Yer (%CG)</span>
                <p className="mt-0.5 font-semibold text-ink-primary">
                  %{activeRadar.currentCgFractionPct}
                </p>
              </div>
              <div className="surface-tile p-2.5">
                <span className="text-[10px] text-ink-muted">Kış Orajı</span>
                <p
                  className={`mt-0.5 font-semibold ${
                    activeRadar.isThundersnowNow || summary.hasThundersnow168h
                      ? "text-cyan-300"
                      : "text-ink-secondary"
                  }`}
                >
                  {activeRadar.isThundersnowNow
                    ? "Thundersnow!"
                    : summary.hasThundersnow168h
                      ? "Haftada Var"
                      : "Yok"}
                </p>
              </div>
            </div>
          </div>

          {/* 7-Günlük (168s) Sıfır-Taşmalı Vektörel Şimşek Yoğunluk Eğrisi + Aktif Oraj Pencereleri */}
          <div className="rounded-xl border border-white/[0.08] bg-[#060b15]/85 p-3.5 space-y-2.5 tabular">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
              <span className="text-ink-secondary">
                7 Günlük (168s) Şimşek & Graupel Yoğunluk Eğrisi
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-amber-200">
                  7g Zirve: <strong>%{summary.peak168hLightningProbPct}</strong>
                  {summary.peak168hFlashesPerMin > 0
                    ? ` (${summary.peak168hFlashesPerMin}/dk)`
                    : ""}
                </span>
                <button
                  type="button"
                  onClick={handleOpenMeteogram}
                  className="inline-flex items-center gap-1 rounded border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] text-sky-200 hover:border-sky-300/40 hover:text-sky-100 transition-colors"
                >
                  <span>Meteogram ↗</span>
                </button>
              </div>
            </div>

            <SevenDayLightningCurveSvg
              sparkHours={lightningSparkHours}
              highlightedHourIdx={highlightedCurveHourIdx}
              peakProbPct={summary.peak168hLightningProbPct}
            />

            {activeStormWindows.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5 font-mono text-[10px]">
                <span className="text-ink-muted">Aktif Oraj Pencereleri:</span>
                {activeStormWindows.map((w) => {
                  const windowSpanLabel =
                    w.endIdx > w.startIdx
                      ? `${w.startLabel}–${w.endLabel}`
                      : w.peakLabel;
                  const isWindowSelected =
                    isHourView &&
                    clampedHourIdx >= w.startIdx &&
                    clampedHourIdx <= w.endIdx;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        atmosUiSfx.playNavTick();
                        lockInspectHour(w.peakHourIdx);
                      }}
                      className={`rounded-md border px-2 py-1 transition-colors ${
                        w.hasThundersnow
                          ? "border-cyan-300/45 bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/25"
                          : isWindowSelected
                            ? "border-amber-300/65 bg-signal-amber/25 text-amber-50"
                            : "border-signal-amber/35 bg-signal-amber/12 text-amber-100 hover:bg-signal-amber/20"
                      }`}
                    >
                      ⚡ {windowSpanLabel} · %{w.peakProbPct}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap justify-between gap-2 font-mono text-[10px] text-ink-muted">
                <span>Şimdi</span>
                <span>+48s</span>
                <span>+96s</span>
                <span>+168s · Sakin elektriksel profil</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Mod 2 (Kış / Zirve Karı Aktif, Şimşek Sakin): Tek Tıkta Açılabilir 100 km Şimşek Radarı Başlığı */
        <div className="surface-panel px-4 py-3 flex flex-wrap items-center justify-between gap-3 tabular">
          <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
            <Zap className="h-4 w-4 text-signal-emerald shrink-0" />
            <span className="text-ink-primary font-semibold">
              ⚡ {formatDistance(100, unit)} Şimşek & Konvektif Hücre Radarı: Temiz
            </span>
            <span className="text-ink-secondary">
              · 7g Zirve: <strong>%{summary.peak168hLightningProbPct}</strong>
            </span>
          </div>
          <button
            type="button"
            aria-expanded={false}
            onClick={handleExpandFull}
            className="atmos-btn inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-3 py-1.5 font-mono text-xs font-medium text-ink-primary hover:bg-white/[0.12] transition-colors"
          >
            <span>3-Halkalı Şimşek Radarını Aç</span>
            <ChevronUp className="h-3.5 w-3.5 rotate-180" />
          </button>
        </div>
      )}
    </section>
  );
}

const SnowAndLightningObservatory = memo(SnowAndLightningObservatoryBase);
export default SnowAndLightningObservatory;
