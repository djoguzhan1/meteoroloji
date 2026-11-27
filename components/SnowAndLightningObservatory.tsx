"use client";

import { memo, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Compass,
  Layers,
  Mountain,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Snowflake,
  Sparkles,
  ThermometerSnowflake,
  Wind,
  Zap
} from "lucide-react";
import { atmosUiSfx } from "@/lib/ui-sfx";
import { formatTemperature } from "@/lib/weather-client";
import type {
  BlowingSnowRisk,
  DailyPoint,
  DekSnowStatus,
  ElevationSnowBand,
  HourlyPoint,
  LightningProximityRadar,
  RoadIcingRisk,
  SnowAndLightningObservatorySummary,
  SubseasonalOutlookBundle,
  UnitSystem
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

function describeDekTr(dek: DekSnowStatus | undefined, deltaT: number | null | undefined): {
  label: string;
  cls: string;
} {
  const dtTxt = deltaT !== null && deltaT !== undefined ? ` (ΔT ${deltaT}°C)` : "";
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

function formatCm(val: number | undefined): string {
  const v = val ?? 0;
  if (v <= 0) return "0 cm";
  if (v < 10) return `${v.toFixed(1)} cm`;
  return `${Math.round(v)} cm`;
}

function LightningScopeSvg({ radar }: { radar: LightningProximityRadar }) {
  const size = 236;
  const c = size / 2;
  const maxR = 94;

  // Non-linear perceptual ring radii: 15 km -> 28px, 40 km -> 58px, 100 km -> 94px
  const mapDistToR = (km: number): number => {
    if (km <= 15) return (km / 15) * 28;
    if (km <= 40) return 28 + ((km - 15) / 25) * 30;
    return 58 + (Math.min(100, km - 40) / 60) * 36;
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto h-56 w-56 shrink-0 select-none"
      role="img"
      aria-label="0-15 km, 15-40 km ve 40-100 km üç halkalı canlı şimşek ve konvektif hücre yakınlık radarı"
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

      {/* 100 km Outer Horizon Ring */}
      <circle
        cx={c}
        cy={c}
        r={94}
        fill="none"
        stroke={radar.rings[2].status !== "clear" ? "rgba(56, 189, 248, 0.45)" : "rgba(255,255,255,0.13)"}
        strokeWidth="1.2"
        strokeDasharray="4 3"
      />

      {/* 40 km Approach Ring */}
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

      {/* 15 km 30-30 Safety Ring */}
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
        15km
      </text>
      <text x={c + 4} y={c - 60} fill="rgba(186,230,253,0.68)" fontSize="7.2" fontFamily="monospace">
        40km
      </text>
      <text x={c + 4} y={c - 84} fill="rgba(148,163,184,0.65)" fontSize="7.2" fontFamily="monospace">
        100km
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

        // Approach vector toward center
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

export interface SnowAndLightningObservatoryProps {
  cityName: string;
  daily: DailyPoint[];
  hourly: HourlyPoint[];
  subseasonal?: SubseasonalOutlookBundle | null;
  summary?: SnowAndLightningObservatorySummary;
  selectedHourIndex: number;
  onSelectHourIndex: (idx: number) => void;
  unit: UnitSystem;
}

function SnowAndLightningObservatoryBase({
  cityName,
  daily,
  hourly,
  subseasonal,
  summary,
  selectedHourIndex,
  onSelectHourIndex,
  unit
}: SnowAndLightningObservatoryProps) {
  const defaultSnowDate = useMemo(() => {
    const firstCitySnow = daily.find(
      (d) => (d.airSnowSumCm ?? 0) >= 0.1 || (d.snowProbMaxPct ?? 0) >= 25
    );
    if (firstCitySnow) return firstCitySnow.date;
    const firstHighlandSnow = daily.find((d) =>
      d.elevationSnowBands?.some((b) => b.airSnowCm >= 0.3 || b.snowProbPct >= 30)
    );
    return firstHighlandSnow?.date ?? daily[0]?.date ?? "";
  }, [daily]);

  const [selectedDate, setSelectedDate] = useState<string>(defaultSnowDate);
  const [horizonView, setHorizonView] = useState<"15d" | "30d">("15d");
  const [inspectMode, setInspectMode] = useState<"date" | "hour">("date");

  const effectiveSelectedDate = useMemo(() => {
    if (daily.some((d) => d.date === selectedDate)) return selectedDate;
    return defaultSnowDate || daily[0]?.date || "";
  }, [daily, defaultSnowDate, selectedDate]);

  const activeDay = useMemo(
    () => daily.find((d) => d.date === effectiveSelectedDate) ?? daily[0] ?? null,
    [daily, effectiveSelectedDate]
  );

  const clampedHourIdx = Math.max(0, Math.min(selectedHourIndex, Math.max(0, hourly.length - 1)));
  const activeHour = hourly[clampedHourIdx] ?? null;

  // Hourly slices belonging to `effectiveSelectedDate` (available for Days 1..10)
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

  // Snow-active dates counter across 15d (including summit snow!)
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

  // Peak convective hours across 168h for quick jump
  const lightningSparkHours = useMemo(() => {
    return hourly.slice(0, 168).map((h, idx) => ({
      idx,
      time: h.time,
      label: `${h.dayLabel} ${h.hourLabel}`,
      prob: h.lightningProbPct ?? 0,
      flashes: h.lightningFlashesPerMin ?? 0,
      lpi: h.lpiJkg ?? 0,
      isThundersnow: Boolean(h.isThundersnow)
    }));
  }, [hourly]);

  const topLightningPeaks = useMemo(() => {
    const candidates = lightningSparkHours.filter((s) => s.prob >= 22);
    if (candidates.length === 0) return [];
    const picked: typeof candidates = [];
    for (const c of candidates.sort((a, b) => b.prob - a.prob)) {
      if (picked.every((p) => Math.abs(p.idx - c.idx) >= 5)) {
        picked.push(c);
      }
      if (picked.length >= 4) break;
    }
    return picked.sort((a, b) => a.idx - b.idx);
  }, [lightningSparkHours]);

  if (!activeDay || !summary) return null;

  const isHourView = inspectMode === "hour" && activeHour !== null;

  // Unified readout values depending on whether user is inspecting a full Date (24h) or locked single Hour
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
    ? Math.max(groundSnowValCm, Number(((activeHour.groundSnowCm ?? 0) * 1.35).toFixed(1)))
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

  const icingMeta = describeIcingTr(icingRisk);
  const dekMeta = describeDekTr(dekStatus, summary.dekDeltaTSst850C);
  const radar = summary.lightningRadar;

  const safetyColors =
    radar.safetyLevel === "shelter_now"
      ? "border-rose-400/45 bg-rose-500/14 text-rose-100"
      : radar.safetyLevel === "caution_30_30"
        ? "border-signal-amber/45 bg-signal-amber/14 text-amber-100"
        : radar.safetyLevel === "awareness"
          ? "border-signal-sky/35 bg-signal-sky/10 text-sky-100"
          : "border-signal-emerald/30 bg-signal-emerald/[0.07] text-emerald-100";

  return (
    <section
      id="kar-simsek"
      className="scroll-mt-28 sm:scroll-mt-20 atmos-cv-auto grid gap-5 xl:grid-cols-[minmax(0,1.28fr)_minmax(0,0.92fr)]"
    >
      {/* =====================================================================
          SOL MODÜL: TARİH & RAKIM BAZLI KESKİN KAR RASATHANESİ (HAVADA vs ZEMİNDE)
          ===================================================================== */}
      <div className="surface-panel p-4 sm:p-6 space-y-4">
        {/* 1. Üst Başlık + 15 Gün / 30 Gün / Seçili Saat Mod Seçici */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/[0.08] pb-3.5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-sky-300">
                <Snowflake className="h-3.5 w-3.5" />
                KAR MİKROFİZİĞİ & ZEMİN ENERJİ BÜTÇESİ
              </span>
              <span className="rounded-md border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 font-mono text-[10px] text-sky-200 tabular">
                {cityName} ({summary.referenceElevationM} m)
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
              className="inline-flex rounded-xl border border-white/10 bg-obsidian-950/80 p-1 text-xs"
            >
              <button
                type="button"
                role="tab"
                aria-selected={horizonView === "15d" && inspectMode === "date"}
                onClick={() => {
                  atmosUiSfx.playNavTick();
                  setHorizonView("15d");
                  setInspectMode("date");
                }}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                  horizonView === "15d" && inspectMode === "date"
                    ? "bg-white/15 text-ink-primary shadow-sm"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                1–15. Günler
              </button>

              {subseasonal && subseasonal.days.length > 0 && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={horizonView === "30d"}
                  onClick={() => {
                    atmosUiSfx.playNavTick();
                    setHorizonView("30d");
                    setInspectMode("date");
                  }}
                  className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                    horizonView === "30d"
                      ? "bg-white/15 text-ink-primary shadow-sm"
                      : "text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  16–30. Günler
                </button>
              )}

              <button
                type="button"
                role="tab"
                aria-selected={inspectMode === "hour" && horizonView !== "30d"}
                onClick={() => {
                  atmosUiSfx.playNavTick();
                  setHorizonView("15d");
                  setInspectMode("hour");
                }}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                  inspectMode === "hour" && horizonView !== "30d"
                    ? "bg-sky-400/20 text-sky-100 shadow-sm"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                Seçili Saat ({activeHour?.hourLabel ?? "--:--"})
              </button>
            </div>
          </div>
        </div>

        {/* 15 Günlük Genel Özet Durum Şeridi */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-obsidian-950/65 px-3.5 py-2.5 font-mono text-xs tabular">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-ink-secondary">
              15 Gün Merkez Havada:{" "}
              <strong className="text-sky-200">{formatCm(summary.total15dAirSnowCm)}</strong>
            </span>
            <span className="text-white/20">·</span>
            <span className="text-ink-secondary">
              Zeminde Tutan:{" "}
              <strong className="text-white">{formatCm(summary.total15dGroundSnowCm)}</strong>
            </span>
            <span className="text-white/20">·</span>
            <span className="text-ink-secondary">
              Asfaltta:{" "}
              <strong className="text-cyan-200">{formatCm(summary.total15dRoadSnowCm)}</strong>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {summary.lowest15dSnowLineM !== null && (
              <span className="rounded border border-sky-400/25 bg-sky-400/10 px-2 py-0.5 text-sky-200">
                En Düşük Kar Sınırı: {summary.lowest15dSnowLineM} m
              </span>
            )}
            <span className="text-ink-muted">
              {snowDatesCount15d > 0
                ? `${snowDatesCount15d} tarihte merkez/zirve kar sinyali`
                : "15 günde merkezde kar sinyali düşük"}
            </span>
          </div>
        </div>

        {horizonView === "15d" ? (
          <>
            {/* 2. Etkileşimli 15-Gün Tarih Seçici Şeridi (Her tarihte Havada & Zeminde Kar görünür!) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[11px] text-ink-muted">
                <span>Tarih seçerek o günün havada, çimde, asfaltta ve zirvede kar miktarını inceleyin:</span>
                {firstHourIdxOfSelectedDate !== undefined && inspectMode === "date" && (
                  <button
                    type="button"
                    onClick={() => {
                      atmosUiSfx.playNavTick();
                      onSelectHourIndex(firstHourIdxOfSelectedDate);
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
                  const isSelected =
                    inspectMode === "date"
                      ? d.date === effectiveSelectedDate
                      : activeHour?.time.startsWith(d.date);
                  const dAir = d.airSnowSumCm ?? 0;
                  const dGnd = d.groundSnowSumCm ?? 0;
                  const dProb = d.snowProbMaxPct ?? 0;
                  const summitBand = d.elevationSnowBands?.[d.elevationSnowBands.length - 1];
                  const summitAir = summitBand?.airSnowCm ?? 0;
                  const hasCenterSnow = dAir >= 0.1 || dProb >= 20;
                  const hasOnlySummitSnow = !hasCenterSnow && summitAir >= 0.4;

                  return (
                    <button
                      key={d.date}
                      type="button"
                      onClick={() => {
                        atmosUiSfx.playNavTick();
                        setSelectedDate(d.date);
                        setInspectMode("date");
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
                        <span className="text-xs font-semibold text-ink-primary">{d.dayName}</span>
                        <span className="font-mono text-[10px] text-ink-muted">
                          {formatShortDateTr(d.date)}
                        </span>
                      </div>

                      <div className="my-1.5 font-mono text-[10px] text-ink-secondary">
                        {formatTemperature(d.tempMin, unit)} / {formatTemperature(d.tempMax, unit)}
                        {dProb >= 10 && (
                          <span className="ml-1 text-sky-300">· ❄%{dProb}</span>
                        )}
                      </div>

                      {hasCenterSnow ? (
                        <div className="space-y-0.5 rounded-lg border border-sky-300/20 bg-sky-400/10 px-2 py-1 font-mono text-[10px]">
                          <div className="flex items-center justify-between text-sky-200">
                            <span>Hava:</span>
                            <strong>{formatCm(dAir)}</strong>
                          </div>
                          <div className="flex items-center justify-between text-white">
                            <span>Zemin:</span>
                            <strong>{formatCm(dGnd)}</strong>
                          </div>
                        </div>
                      ) : hasOnlySummitSnow ? (
                        <div className="rounded-lg border border-indigo-300/20 bg-indigo-400/10 px-2 py-1 font-mono text-[10px] text-indigo-200">
                          <div className="flex items-center justify-between">
                            <span>Merkez:</span>
                            <span>0 cm</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Zirve:</span>
                            <strong>{formatCm(summitAir)}</strong>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-2 py-1 font-mono text-[10px] text-ink-muted">
                          <div>Hava: 0 cm</div>
                          <div>Zemin: 0 cm</div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Seçili Tarih veya Saat İçin 4 Ana Keskin Kar Bütçe Kartı */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 tabular">
              {/* Kart 1: Havada Yağan Saf Kar */}
              <div className="surface-tile p-3 space-y-1 border border-sky-400/20">
                <div className="flex items-center justify-between text-[11px] text-sky-200">
                  <span>Havada Yağan Kar</span>
                  <Snowflake className="h-3.5 w-3.5 text-sky-300" />
                </div>
                <p className="font-mono text-xl font-bold text-white">
                  {formatCm(airSnowValCm)}
                </p>
                <p className="font-mono text-[10px] text-ink-secondary">
                  İhtimal <strong className="text-sky-300">%{snowProbPct}</strong>
                  {airSnowP90Cm > airSnowValCm + 0.1 && (
                    <span> · P90 {formatCm(airSnowP90Cm)}</span>
                  )}
                </p>
              </div>

              {/* Kart 2: Çim & Doğal Zeminde Tutan */}
              <div className="surface-tile p-3 space-y-1 border border-cyan-300/20">
                <div className="flex items-center justify-between text-[11px] text-cyan-200">
                  <span>Çim / Toprakta Tutan</span>
                  <Layers className="h-3.5 w-3.5 text-cyan-300" />
                </div>
                <p className="font-mono text-xl font-bold text-cyan-100">
                  {formatCm(groundSnowValCm)}
                </p>
                <p className="font-mono text-[10px] text-ink-secondary">
                  Maks Örtü <strong className="text-white">{formatCm(snowpackDepthCm)}</strong> · Toprak{" "}
                  {soilTempValC.toFixed(1)}°C
                </p>
              </div>

              {/* Kart 3: Asfalt & Yolda Tutan + Gizli Buzlanma */}
              <div className="surface-tile p-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-ink-secondary">
                  <span>Asfalt / Yolda Tutan</span>
                  <ThermometerSnowflake className="h-3.5 w-3.5 text-amber-300" />
                </div>
                <p className="font-mono text-xl font-bold text-ink-primary">
                  {formatCm(roadSnowValCm)}
                </p>
                <p className="font-mono text-[10px] text-ink-muted">
                  Asfalt {roadTempValC.toFixed(1)}°C
                  {groundSnowP90Cm > groundSnowValCm + 0.2 && (
                    <span> · Zemin P90 {formatCm(groundSnowP90Cm)}</span>
                  )}
                </p>
              </div>

              {/* Kart 4: SLR, Kar Kalitesi & Bourgouin Kar Sınırı */}
              <div className="surface-tile p-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-ink-secondary">
                  <span>Kar Kalitesi & Sınır</span>
                  <Mountain className="h-3.5 w-3.5 text-[var(--atmos-accent)]" />
                </div>
                <p className="font-display text-sm font-semibold text-ink-primary leading-snug">
                  {snowQuality !== "Yok" ? snowQuality : "Yağışta Kar Yok"}
                </p>
                <p className="font-mono text-[10px] text-ink-secondary">
                  {slrVal > 0 ? `SLR ${slrVal}:1 · ` : ""}
                  Sınır{" "}
                  <strong className="text-sky-200">
                    {snowLineM !== null ? `${snowLineM} m` : "—"}
                  </strong>
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
                Rüzgar/Tipi: <strong className="text-ink-primary">{describeBlowingTr(blowingRisk)}</strong>
              </span>
              {isHourView && activeHour?.meltingEnergyJkg !== undefined && (
                <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-ink-muted">
                  Erime İntegrali: {activeHour.meltingEnergyJkg} J/kg (Tw=0°C: {activeHour.wetBulbZeroM ?? 0} m)
                </span>
              )}
            </div>

            {/* Seçili Tarihin 24-Saatlik Havada vs Zeminde Kar Dağılım Grafiği (Saatlik Veri Varsa) */}
            {dayHours.length >= 3 && (
              <div className="rounded-xl border border-white/[0.08] bg-[#060b15]/85 p-3.5 space-y-2 tabular">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                  <span className="text-ink-secondary">
                    <strong>
                      {activeDay.dayName} ({formatShortDateTr(activeDay.date)})
                    </strong>{" "}
                    Saatlik Havada (Açık Mavi) vs. Zeminde Tutan (Beyaz) Kar Akışı
                  </span>
                  <span className="text-[10px] text-ink-muted">
                    Saate tıklayarak anlık 3D sahneyi kilitleyin
                  </span>
                </div>

                {(() => {
                  const maxHourBar = Math.max(
                    0.8,
                    ...dayHours.map((dh) => Math.max(dh.pt.airSnowCm ?? 0, dh.pt.groundSnowCm ?? 0))
                  );
                  return (
                    <div className="flex items-end gap-1 h-16 pt-1">
                      {dayHours.map(({ pt, globalIdx }) => {
                        const hAir = pt.airSnowCm ?? 0;
                        const hGnd = pt.groundSnowCm ?? 0;
                        const hProb = pt.airSnowProbPct ?? 0;
                        const airPct = hAir > 0 ? Math.max(14, (hAir / maxHourBar) * 100) : hProb >= 20 ? 10 : 5;
                        const gndPct = hGnd > 0 ? Math.max(8, (hGnd / maxHourBar) * 100) : 0;
                        const isHourSel = globalIdx === clampedHourIdx;

                        return (
                          <button
                            key={pt.time}
                            type="button"
                            onClick={() => {
                              atmosUiSfx.playScrubTick(globalIdx / Math.max(1, hourly.length - 1));
                              onSelectHourIndex(globalIdx);
                              setInspectMode("hour");
                            }}
                            title={`${pt.hourLabel} · T ${pt.temperature}°C (Tw ${pt.wetBulbC ?? 0}°C) · Havada ${hAir.toFixed(1)} cm · Zeminde ${hGnd.toFixed(1)} cm · Örtü ${(pt.snowpackDepthCm ?? 0).toFixed(1)} cm`}
                            className={`group relative flex-1 h-full flex flex-col justify-end rounded-t transition-colors ${
                              isHourSel ? "bg-sky-400/15" : "hover:bg-white/[0.05]"
                            }`}
                          >
                            <div
                              className={`relative w-full rounded-t transition-all ${
                                hAir > 0
                                  ? "bg-sky-400/45"
                                  : hProb >= 20
                                    ? "bg-sky-400/20"
                                    : "bg-white/[0.07]"
                              }`}
                              style={{ height: `${airPct}%` }}
                            >
                              {gndPct > 0 && (
                                <span
                                  className="absolute inset-x-0.5 bottom-0 rounded-t bg-white shadow-[0_0_8px_rgba(255,255,255,0.65)]"
                                  style={{ height: `${Math.min(100, (gndPct / airPct) * 100)}%` }}
                                />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                <div className="flex justify-between font-mono text-[10px] text-ink-muted">
                  <span>{dayHours[0]?.pt.hourLabel}</span>
                  <span>{dayHours[Math.floor(dayHours.length * 0.33)]?.pt.hourLabel}</span>
                  <span>{dayHours[Math.floor(dayHours.length * 0.66)]?.pt.hourLabel}</span>
                  <span>{dayHours[dayHours.length - 1]?.pt.hourLabel}</span>
                </div>
              </div>
            )}

            {/* 4. 4-Bant Rakım Kar Kesiti (Kıyı / Merkez / Yamaç / Zirve) */}
            {elevationBands.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px] text-ink-secondary">
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
                  <span className="text-[10px] text-ink-muted">Havada vs. Zeminde Tutan</span>
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
                            {b.elevationM} m
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-ink-muted">
                          <span>
                            T {formatTemperature(b.tempMeanC, unit)} (Tw {b.wetBulbMeanC}°)
                          </span>
                          <span className="text-sky-300">❄ %{b.snowProbPct}</span>
                        </div>

                        <div className="space-y-0.5 pt-0.5 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-ink-secondary">Havada:</span>
                            <strong className={b.airSnowCm > 0 ? "text-sky-200" : "text-ink-muted"}>
                              {formatCm(b.airSnowCm)}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-ink-secondary">Zeminde:</span>
                            <strong className={b.groundSnowCm > 0 ? "text-white" : "text-ink-muted"}>
                              {formatCm(b.groundSnowCm)}
                            </strong>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-ink-muted">
                            <span>Asfalt / Örtü:</span>
                            <span>
                              {formatCm(b.roadSnowCm)} / {formatCm(b.maxSnowpackCm)}
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
          </>
        ) : (
          /* 16–30 GÜN ALT-MEVSİMSEL OLASILIKSAL KAR GÖRÜNÜMÜ */
          subseasonal && (
            <div className="space-y-3 tabular">
              <p className="rounded-xl border border-sky-400/20 bg-sky-400/[0.06] px-3.5 py-2.5 font-mono text-[11px] text-sky-100">
                <Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-sky-300" />
                16–30. Gün Olasılıksal Kar Koridoru ({subseasonal.ensembleMembers}-Üye{" "}
                {subseasonal.modelsLabel}): Soğuk senaryo kuyruğu (P10–P50) ile yağış topluluğu
                çaprazlanarak her tarih için havada ve zeminde P50–P90 kar aralığı hesaplanır.
              </p>

              <div className="max-h-[370px] overflow-y-auto divide-y divide-white/[0.06] pr-1 font-mono text-xs">
                {subseasonal.days.map((sd, idx) => {
                  const sProb = sd.snowProbPct ?? 0;
                  const airP50 = sd.airSnowP50Cm ?? 0;
                  const airP90 = sd.airSnowP90Cm ?? 0;
                  const gndP50 = sd.groundSnowP50Cm ?? 0;
                  const gndP90 = sd.groundSnowP90Cm ?? 0;
                  return (
                    <div
                      key={sd.date}
                      className="grid grid-cols-[90px_54px_1fr_1fr_auto] items-center gap-2 py-2 px-2 rounded-lg hover:bg-white/[0.03]"
                    >
                      <div>
                        <span className="font-sans font-medium text-ink-primary">{sd.dayLabel}</span>
                        <span className="block text-[10px] text-ink-muted">+{16 + idx}. gün</span>
                      </div>

                      <span
                        className={`rounded px-1.5 py-0.5 text-center text-[11px] ${
                          sProb >= 30
                            ? "bg-sky-400/20 text-sky-200 font-semibold"
                            : sProb >= 12
                              ? "bg-white/[0.07] text-sky-300"
                              : "text-ink-muted"
                        }`}
                      >
                        ❄ %{sProb}
                      </span>

                      <div className="text-[11px]">
                        <span className="text-ink-muted">Havada: </span>
                        <strong className={airP90 > 0 ? "text-sky-200" : "text-ink-muted"}>
                          {airP90 > 0 ? `${airP50}–${airP90} cm` : "0 cm"}
                        </strong>
                      </div>

                      <div className="text-[11px]">
                        <span className="text-ink-muted">Zeminde: </span>
                        <strong className={gndP90 > 0 ? "text-white" : "text-ink-muted"}>
                          {gndP90 > 0 ? `${gndP50}–${gndP90} cm` : "0 cm"}
                        </strong>
                      </div>

                      <span className="hidden sm:inline text-[10px] text-ink-muted">
                        Sınır ~{sd.estSnowLineM ?? 1200}m
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}
      </div>

      {/* =====================================================================
          SAĞ MODÜL: 3-HALKALI (15 / 40 / 100 km) CANLI ŞİMŞEK & KONVEKTİF RADAR
          ===================================================================== */}
      <div className="surface-panel p-4 sm:p-6 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          {/* Başlık */}
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-white/[0.08] pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-signal-amber">
                  <Zap className="h-3.5 w-3.5" />
                  BUZ-GRAUPEL (-10..-20°C) ELEKTRİKSEL RADAR
                </span>
                {radar.metarConfirmedTs && (
                  <span className="rounded bg-rose-500/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-rose-200">
                    METAR TS DOĞRULANDI
                  </span>
                )}
              </div>
              <h2 className="mt-1 font-display text-base sm:text-lg font-semibold text-ink-primary">
                Canlı Şimşek Yakınlık Radarı & 168s Oraj Akışı
              </h2>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-obsidian-950/75 px-2.5 py-1 font-mono text-[11px] text-ink-secondary tabular">
              <Radio className="h-3 w-3 text-signal-emerald" />
              {radar.radarBacked ? "Zoom-7 HD Doppler Aktif" : "NWP + İstasyon Modu"}
            </span>
          </div>

          {/* WMO 30-30 Yıldırım Güvenlik Durumu Kartı */}
          <div className={`rounded-xl border px-3.5 py-2.5 space-y-1 ${safetyColors}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                {radar.safetyLevel === "safe" ? (
                  <ShieldCheck className="h-4 w-4 shrink-0 text-signal-emerald" />
                ) : radar.safetyLevel === "shelter_now" ? (
                  <ShieldAlert className="h-4 w-4 shrink-0 text-rose-300" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-signal-amber" />
                )}
                <span>{radar.safetyTitleTr}</span>
              </span>
              {radar.nearestCellKm !== null && (
                <span className="shrink-0 font-mono text-[11px] font-bold tabular">
                  En Yakın: {radar.nearestCellKm} km ({radar.nearestBearingTr})
                </span>
              )}
            </div>
            <p className="text-[11px] opacity-90 leading-relaxed">{radar.safetyDetailTr}</p>
          </div>

          {/* 3-Halkalı SVG Polar Radar + Halka Bazlı Tablo */}
          <div className="grid items-center gap-3.5 sm:grid-cols-[220px_minmax(0,1fr)]">
            <LightningScopeSvg radar={radar} />

            <div className="space-y-2 font-mono text-xs tabular">
              {radar.rings.map((ring) => {
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
                        {ring.labelTr}
                      </span>
                      <strong>%{ring.probabilityPct}</strong>
                    </div>
                    <div className="flex items-center justify-between text-[10px] opacity-90">
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

              {radar.approachingEtaMin !== null && (
                <div className="flex items-center justify-between rounded-lg border border-signal-amber/35 bg-signal-amber/10 px-2.5 py-1.5 text-[11px] text-amber-100">
                  <span className="flex items-center gap-1">
                    <Compass className="h-3.5 w-3.5 text-signal-amber" />
                    <span>Yaklaşan Hücre Vektörü</span>
                  </span>
                  <strong>~{radar.approachingEtaMin} dk ETA</strong>
                </div>
              )}
            </div>
          </div>

          {/* 4 Elektriksel Mikrofizik Telemetri Kutusu */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-xs tabular">
            <div className="surface-tile p-2.5">
              <span className="text-[10px] text-ink-muted">Çakım Hızı</span>
              <p className="mt-0.5 font-semibold text-ink-primary">
                {(isHourView
                  ? activeHour.lightningFlashesPerMin ?? 0
                  : radar.currentFlashesPerMin
                ).toFixed(1)}{" "}
                <span className="text-[10px] font-normal text-ink-muted">/dk</span>
              </p>
            </div>
            <div className="surface-tile p-2.5">
              <span className="text-[10px] text-ink-muted">Buz-Akısı LPI</span>
              <p className="mt-0.5 font-semibold text-amber-200">
                {(isHourView ? activeHour.lpiJkg ?? 0 : radar.currentLpiJkg).toFixed(2)}{" "}
                <span className="text-[10px] font-normal text-ink-muted">J/kg</span>
              </p>
            </div>
            <div className="surface-tile p-2.5">
              <span className="text-[10px] text-ink-muted">Bulut-Yer (%CG)</span>
              <p className="mt-0.5 font-semibold text-ink-primary">
                %{isHourView ? activeHour.cgFractionPct ?? 24 : radar.currentCgFractionPct}
              </p>
            </div>
            <div className="surface-tile p-2.5">
              <span className="text-[10px] text-ink-muted">Kış Orajı</span>
              <p
                className={`mt-0.5 font-semibold ${
                  (isHourView ? activeHour.isThundersnow : radar.isThundersnowNow) ||
                  summary.hasThundersnow168h
                    ? "text-cyan-300"
                    : "text-ink-secondary"
                }`}
              >
                {(isHourView ? activeHour.isThundersnow : radar.isThundersnowNow)
                  ? "Thundersnow!"
                  : summary.hasThundersnow168h
                    ? "Haftada Var"
                    : "Yok"}
              </p>
            </div>
          </div>
        </div>

        {/* 168-Saatlik Şimşek & Oraj Kıvılcım Zaman Çizelgesi */}
        <div className="rounded-xl border border-white/[0.08] bg-[#060b15]/85 p-3.5 space-y-2.5 tabular">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
            <span className="text-ink-secondary">
              7 Günlük (168s) Şimşek Olasılığı & Graupel Şarj Zaman Çizelgesi
            </span>
            <span className="text-amber-200">
              7g Zirve: <strong>%{summary.peak168hLightningProbPct}</strong>
              {summary.peak168hFlashesPerMin > 0
                ? ` (${summary.peak168hFlashesPerMin}/dk)`
                : ""}
            </span>
          </div>

          <div className="flex items-end gap-[2px] h-12">
            {lightningSparkHours.map((s) => {
              const hPct = s.prob > 0 ? Math.max(10, s.prob) : 5;
              const isSel = s.idx === clampedHourIdx;
              const barColor = s.isThundersnow
                ? "bg-cyan-300"
                : s.prob >= 60
                  ? "bg-rose-400"
                  : s.prob >= 30
                    ? "bg-signal-amber"
                    : s.prob >= 15
                      ? "bg-amber-300/45"
                      : "bg-white/[0.07]";
              return (
                <button
                  key={s.time}
                  type="button"
                  onClick={() => {
                    atmosUiSfx.playScrubTick(s.idx / Math.max(1, hourly.length - 1));
                    onSelectHourIndex(s.idx);
                    setInspectMode("hour");
                  }}
                  title={`${s.label} · Şimşek %${s.prob} · LPI ${s.lpi} J/kg · ~${s.flashes} çakım/dk${s.isThundersnow ? " · Gökgürültülü Kar!" : ""}`}
                  className={`flex-1 h-full flex items-end ${isSel ? "bg-amber-400/20" : ""}`}
                >
                  <span
                    className={`block w-full rounded-t-[1.5px] ${barColor}`}
                    style={{ height: `${hPct}%` }}
                  />
                </button>
              );
            })}
          </div>

          {topLightningPeaks.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5 font-mono text-[10px]">
              <span className="text-ink-muted">Aktif Oraj Pencereleri:</span>
              {topLightningPeaks.map((pk) => (
                <button
                  key={pk.time}
                  type="button"
                  onClick={() => {
                    atmosUiSfx.playNavTick();
                    onSelectHourIndex(pk.idx);
                    setInspectMode("hour");
                  }}
                  className={`rounded-md border px-2 py-0.5 transition-colors ${
                    pk.isThundersnow
                      ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100 hover:bg-cyan-400/25"
                      : "border-signal-amber/35 bg-signal-amber/12 text-amber-100 hover:bg-signal-amber/20"
                  }`}
                >
                  ⚡ {pk.label} · %{pk.prob}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex justify-between font-mono text-[10px] text-ink-muted">
              <span>Şimdi</span>
              <span>+48s</span>
              <span>+96s</span>
              <span>+168s · Sakin elektriksel profil</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const SnowAndLightningObservatory = memo(SnowAndLightningObservatoryBase);
export default SnowAndLightningObservatory;
