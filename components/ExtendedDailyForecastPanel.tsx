"use client";

import { memo, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Layers,
  ShieldCheck,
  Sparkles,
  Wind
} from "lucide-react";
import { atmosUiSfx } from "@/lib/ui-sfx";
import { formatTemperature, formatWindSpeed } from "@/lib/weather-client";
import type {
  DailyPoint,
  HourlyPoint,
  SubseasonalOutlookBundle,
  UnitSystem
} from "@/lib/weather-types";
import AnimatedWeatherIcon from "./AnimatedWeatherIcon";

type DailyHorizonTab = "7d" | "15d" | "30d";

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

function toDisplayDelta(deltaC: number, unit: UnitSystem): string {
  const v = unit === "imperial" ? deltaC * 1.8 : deltaC;
  const rounded = Math.round(v * 10) / 10;
  if (rounded > 0) return `+${rounded}°`;
  return `${rounded}°`;
}

export interface ExtendedDailyForecastPanelProps {
  daily: DailyPoint[];
  subseasonal?: SubseasonalOutlookBundle | null;
  hourly: HourlyPoint[];
  ensembleMembers?: number;
  unit: UnitSystem;
  onJumpToHourIndex?: (idx: number) => void;
}

function ExtendedDailyForecastPanelBase({
  daily,
  subseasonal,
  hourly,
  ensembleMembers = 212,
  unit,
  onJumpToHourIndex
}: ExtendedDailyForecastPanelProps) {
  const has15d = daily.length > 7;
  const has30d = Boolean(subseasonal && subseasonal.days.length > 0);

  const [tab, setTab] = useState<DailyHorizonTab>("7d");
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const effectiveTab: DailyHorizonTab =
    tab === "30d" && !has30d
      ? has15d
        ? "15d"
        : "7d"
      : tab === "15d" && !has15d
        ? "7d"
        : tab;

  const visibleDays = useMemo(() => {
    if (effectiveTab === "7d") return daily.slice(0, 7);
    return daily.slice(0, 15);
  }, [daily, effectiveTab]);

  const barScale = useMemo(() => {
    if (visibleDays.length === 0) return { min: 0, max: 20, span: 20 };
    let lo = Infinity;
    let hi = -Infinity;
    for (const d of visibleDays) {
      const candidateLo =
        d.tempMinP10 !== undefined ? Math.min(d.tempMin, d.tempMinP10) : d.tempMin;
      const candidateHi =
        d.tempMaxP90 !== undefined ? Math.max(d.tempMax, d.tempMaxP90) : d.tempMax;
      if (candidateLo < lo) lo = candidateLo;
      if (candidateHi > hi) hi = candidateHi;
      if (d.tempNormalMin !== undefined && d.tempNormalMin < lo) lo = d.tempNormalMin;
      if (d.tempNormalMax !== undefined && d.tempNormalMax > hi) hi = d.tempNormalMax;
    }
    return {
      min: lo - 0.5,
      max: hi + 0.5,
      span: Math.max(2, hi - lo + 1)
    };
  }, [visibleDays]);

  const subScale = useMemo(() => {
    const days = subseasonal?.days ?? [];
    if (days.length === 0) return { min: 0, max: 20, span: 20 };
    let lo = Infinity;
    let hi = -Infinity;
    for (const d of days) {
      lo = Math.min(lo, d.tempMinP25, d.tempNormalMin);
      hi = Math.max(hi, d.tempMaxP90, d.tempNormalMax);
    }
    return {
      min: lo - 0.5,
      max: hi + 0.5,
      span: Math.max(2, hi - lo + 1)
    };
  }, [subseasonal]);

  const firstHourIdxByDate = useMemo(() => {
    const map = new Map<string, number>();
    hourly.forEach((h, idx) => {
      const dateStr = h.time.slice(0, 10);
      const hr = Number(h.time.slice(11, 13));
      if (!map.has(dateStr) || hr === 13) {
        if (!map.has(dateStr) || hr === 13) {
          map.set(dateStr, idx);
        }
      }
    });
    return map;
  }, [hourly]);

  const pctOnScale = (val: number, scale: { min: number; span: number }) =>
    Math.max(0, Math.min(100, ((val - scale.min) / scale.span) * 100));

  return (
    <div className="surface-panel p-5 sm:p-6 space-y-4">
      {/* Üst Başlık & 7 / 15 / 30 Gün Kademe Seçici */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-base sm:text-lg font-semibold text-ink-primary">
              {effectiveTab === "7d"
                ? "7 Günlük Yüksek Kesinlikli Tahmin"
                : effectiveTab === "15d"
                  ? `${visibleDays.length} Günlük Birleşik Sinoptik Tahmin`
                  : "16–30 Gün Alt-Mevsimsel Olasılıksal Eğilim"}
            </h2>
          </div>
          <p className="mt-0.5 font-mono text-[11px] text-ink-muted">
            {effectiveTab === "7d"
              ? `10-Model + ${ensembleMembers}-Üye Kalibre · P10–P90 Olasılık Zarfı`
              : effectiveTab === "15d"
                ? "Gün 1–7 EMOS Kesinlik + Gün 8–15 Kaos-Dengeli AIFS/IFS & 172-Üye Ensemble"
                : `${subseasonal?.modelsLabel ?? "52-Üye GEFSv12 + GEPS"} · İlk 7 Güne Dikişsiz Kenetli`}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Tahmin vade kademesi"
          className="inline-flex rounded-xl border border-white/10 bg-obsidian-950/80 p-1 text-xs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={effectiveTab === "7d"}
            onClick={() => {
              atmosUiSfx.playNavTick();
              setTab("7d");
            }}
            className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
              effectiveTab === "7d"
                ? "bg-white/15 text-ink-primary shadow-sm"
                : "text-ink-secondary hover:text-ink-primary"
            }`}
          >
            7 Gün
          </button>

          {has15d && (
            <button
              type="button"
              role="tab"
              aria-selected={effectiveTab === "15d"}
              onClick={() => {
                atmosUiSfx.playNavTick();
                setTab("15d");
              }}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
                effectiveTab === "15d"
                  ? "bg-white/15 text-ink-primary shadow-sm"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              15 Gün
            </button>
          )}

          {has30d && (
            <button
              type="button"
              role="tab"
              aria-selected={effectiveTab === "30d"}
              onClick={() => {
                atmosUiSfx.playNavTick();
                setTab("30d");
              }}
              className={`rounded-lg px-2.5 py-1.5 font-medium transition-all ${
                effectiveTab === "30d"
                  ? "bg-white/15 text-ink-primary shadow-sm"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              30 Gün
            </button>
          )}
        </div>
      </div>

      {/* MOD A & B: 7 GÜN KESİNLİK VE 15 GÜN SİNOPTİK GÖRÜNÜM */}
      {effectiveTab !== "30d" ? (
        <div className="divide-y divide-white/[0.07] tabular">
          {visibleDays.map((d, dIdx) => {
            const isSynopticTier = dIdx >= 7 || d.horizonTier === "synoptic";
            const isExpanded = expandedDate === d.date;

            const coreLeft = pctOnScale(d.tempMin, barScale);
            const coreRight = pctOnScale(d.tempMax, barScale);
            const coreWidth = Math.max(6, coreRight - coreLeft);

            const wingLoVal = d.tempMinP10 ?? d.tempMin;
            const wingHiVal = d.tempMaxP90 ?? d.tempMax;
            const wingLeft = pctOnScale(wingLoVal, barScale);
            const wingRight = pctOnScale(wingHiVal, barScale);
            const wingWidth = Math.max(coreWidth, wingRight - wingLeft);

            const normMean =
              d.tempNormalMax !== undefined && d.tempNormalMin !== undefined
                ? 0.5 * (d.tempNormalMax + d.tempNormalMin)
                : null;
            const normTickLeft =
              normMean !== null ? pctOnScale(normMean, barScale) : null;

            const jumpHourIdx = firstHourIdxByDate.get(d.date);
            const anom = d.tempAnomalyC ?? 0;

            return (
              <div key={d.date}>
                {/* 8. Gün Başlangıcında Şeffaf Sinoptik Kademe Ayırıcısı */}
                {dIdx === 7 && (
                  <div className="my-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-signal-sky/25 bg-signal-sky/[0.07] px-3 py-2 font-mono text-[11px] text-sky-200">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Layers className="h-3.5 w-3.5 text-signal-sky" />
                      <span>
                        Gün 8–15 · Sinoptik AI+Ensemble Ufku (ECMWF AIFS/IFS + 172 Üye EPS)
                      </span>
                    </span>
                    <span className="text-[10px] text-ink-muted">
                      Kaos-dengeli P10–P90 olasılık bandı aktif
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    atmosUiSfx.playNavTick();
                    setExpandedDate((prev) => (prev === d.date ? null : d.date));
                  }}
                  aria-expanded={isExpanded}
                  className="-mx-2 grid w-[calc(100%+1rem)] grid-cols-[72px_22px_36px_minmax(68px,1fr)_auto] sm:grid-cols-[88px_28px_44px_1fr_auto] items-center gap-2 sm:gap-2.5 rounded-xl px-2 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.045]"
                >
                  <div className="leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-ink-primary">{d.dayName}</span>
                      {d.bimodalSplit && (
                        <span
                          title="Ensemble iki ayrı cephe senaryosuna bölünmüş durumda"
                          className="text-signal-amber"
                        >
                          <GitBranch className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-ink-muted">
                      {formatShortDateTr(d.date)}
                    </span>
                  </div>

                  <AnimatedWeatherIcon
                    code={d.weatherCode}
                    precipPhase={d.precipPhase}
                    intensityMm={d.precipSum / 6}
                    phaseSeed={dIdx * 9 + 1}
                    className="h-5 w-5"
                  />

                  <span className="font-mono text-xs text-[var(--atmos-accent)]">
                    %{d.precipProbabilityMax}
                  </span>

                  {/* Çift Katmanlı Sıcaklık Barı: Dış P10-P90 Belirsizlik Zarfı + İç P50 Çekirdek */}
                  <div className="flex items-center gap-2">
                    <span className="w-8 text-right font-mono text-xs text-ink-muted">
                      {formatTemperature(d.tempMin, unit)}
                    </span>

                    <div className="relative h-2 flex-1 rounded-full bg-white/[0.07]">
                      {wingWidth > coreWidth + 1 && (
                        <div
                          aria-hidden="true"
                          className="absolute -top-0.5 -bottom-0.5 rounded-full border border-sky-300/20 bg-sky-400/16"
                          style={{
                            left: `${wingLeft}%`,
                            width: `${wingWidth}%`
                          }}
                        />
                      )}

                      {normTickLeft !== null && (
                        <span
                          aria-hidden="true"
                          title="Mevsim normali referansı"
                          className="absolute -top-1 -bottom-1 w-[1.5px] bg-white/35"
                          style={{ left: `${normTickLeft}%` }}
                        />
                      )}

                      <div
                        className={`absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-signal-sky via-cyan-300 to-signal-amber transition-all duration-500 ${
                          isSynopticTier
                            ? "opacity-85"
                            : "shadow-[0_0_10px_rgba(56,189,248,0.38)]"
                        }`}
                        style={{
                          left: `${coreLeft}%`,
                          width: `${coreWidth}%`
                        }}
                      />
                    </div>

                    <span className="w-8 font-mono text-xs font-medium text-ink-primary">
                      {formatTemperature(d.tempMax, unit)}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-2 font-mono text-xs">
                    {Math.abs(anom) >= 1.5 ? (
                      <span
                        className={`hidden sm:inline-block rounded px-1.5 py-0.5 text-[10px] ${
                          anom > 0
                            ? "bg-signal-amber/14 text-amber-200"
                            : "bg-signal-sky/14 text-sky-200"
                        }`}
                      >
                        {toDisplayDelta(anom, unit)}
                      </span>
                    ) : (
                      <span className="hidden sm:inline-block w-12 text-right text-ink-muted">
                        {formatWindSpeed(d.windSpeedMax, unit)}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5 text-ink-muted" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
                    )}
                  </div>
                </button>

                {/* Satır Altı Açılır Sinoptik Gün Denetçisi */}
                {isExpanded && (
                  <div className="mb-2.5 mt-1 rounded-xl border border-white/[0.08] bg-obsidian-950/70 p-3.5 text-xs space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-ink-primary">
                        {d.dayName} ({formatShortDateTr(d.date)}) · {d.condition}
                      </span>

                      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                        <span
                          className={`rounded-md border px-2 py-0.5 ${
                            isSynopticTier
                              ? "border-signal-sky/35 bg-signal-sky/12 text-sky-200"
                              : "border-signal-emerald/35 bg-signal-emerald/12 text-signal-emerald"
                          }`}
                        >
                          <ShieldCheck className="mr-1 inline h-3 w-3" />
                          {isSynopticTier ? "Sinoptik AI+EPS" : "Yüksek Kesinlik"} · Güven %
                          {d.confidencePct ?? (isSynopticTier ? 64 : 90)}
                        </span>
                        {d.activeModelCount !== undefined && (
                          <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-ink-secondary">
                            {d.activeModelCount} Model + {d.ensembleMemberCount ?? ensembleMembers} EPS
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-[11px] tabular">
                      <div className="surface-tile p-2.5">
                        <span className="text-[10px] text-ink-muted">Gündüz / Gece</span>
                        <p className="mt-0.5 font-semibold text-ink-primary">
                          {formatTemperature(d.daytimeTempC ?? d.tempMax, unit)} /{" "}
                          {formatTemperature(d.nighttimeTempC ?? d.tempMin, unit)}
                        </p>
                      </div>

                      <div className="surface-tile p-2.5">
                        <span className="text-[10px] text-ink-muted">P10–P90 Olasılık Zarfı</span>
                        <p className="mt-0.5 font-semibold text-sky-200">
                          {d.tempMaxP10 !== undefined && d.tempMaxP90 !== undefined
                            ? `Maks ${formatTemperature(d.tempMaxP10, unit)}..${formatTemperature(d.tempMaxP90, unit)}`
                            : `${formatTemperature(d.tempMin, unit)}..${formatTemperature(d.tempMax, unit)}`}
                        </p>
                      </div>

                      <div className="surface-tile p-2.5">
                        <span className="text-[10px] text-ink-muted">Mevsim Normali</span>
                        <p className="mt-0.5 font-semibold text-ink-primary">
                          {d.tempNormalMin !== undefined && d.tempNormalMax !== undefined
                            ? `${formatTemperature(d.tempNormalMin, unit)}..${formatTemperature(d.tempNormalMax, unit)} (${toDisplayDelta(anom, unit)})`
                            : "Normal civarı"}
                        </p>
                      </div>

                      <div className="surface-tile p-2.5">
                        <span className="text-[10px] text-ink-muted">Yağış & Rüzgar</span>
                        <p className="mt-0.5 font-semibold text-ink-primary">
                          {d.precipSum} mm
                          {d.precipP90 !== undefined && d.precipP90 > d.precipSum
                            ? ` (P90 ${d.precipP90})`
                            : ""}{" "}
                          · <Wind className="inline h-3 w-3 text-signal-sky" />{" "}
                          {d.dominantWindCompass ? `${d.dominantWindCompass} ` : ""}
                          {formatWindSpeed(d.windSpeedMax, unit)}
                        </p>
                      </div>
                    </div>

                    {d.bimodalSplit && (
                      <div className="flex items-center justify-between gap-2 rounded-lg border border-signal-amber/35 bg-signal-amber/10 px-3 py-2 font-mono text-[11px] text-amber-100">
                        <span className="flex items-center gap-1.5">
                          <GitBranch className="h-3.5 w-3.5 shrink-0 text-signal-amber" />
                          <span>
                            Cephe Çatallanması: Baskın senaryo %{d.bimodalSplit.winningWeightPct} (
                            {formatTemperature(
                              d.bimodalSplit.winningMode === "warm"
                                ? d.bimodalSplit.warmModeC
                                : d.bimodalSplit.coldModeC,
                              unit
                            )}
                            ) · Alternatif küme (
                            {formatTemperature(
                              d.bimodalSplit.winningMode === "warm"
                                ? d.bimodalSplit.coldModeC
                                : d.bimodalSplit.warmModeC,
                              unit
                            )}
                            )
                          </span>
                        </span>
                      </div>
                    )}

                    {jumpHourIdx !== undefined && onJumpToHourIndex && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            atmosUiSfx.playNavTick();
                            onJumpToHourIndex(jumpHourIdx);
                            document
                              .getElementById("saatlik")
                              ?.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1 font-mono text-[11px] text-ink-primary hover:bg-white/[0.12]"
                        >
                          <span>Saatlik Meteogramda İncele</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {effectiveTab === "7d" && has15d && (
            <div className="pt-3 flex items-center justify-between gap-2 text-xs">
              <span className="text-ink-muted">
                8–15. gün sinoptik AI+Ensemble uzantısı hazır
              </span>
              <button
                type="button"
                onClick={() => {
                  atmosUiSfx.playNavTick();
                  setTab("15d");
                }}
                className="atmos-btn inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1.5 font-mono text-[11px] font-medium text-ink-primary hover:bg-white/[0.1]"
              >
                <Sparkles className="h-3 w-3 text-[var(--atmos-accent)]" />
                <span>15 Güne Genişlet →</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* MOD C: 16–30 GÜN ALT-MEVSİMSEL (52-ÜYE GEFSv12 + GEPS) OLASILIKSAL GÖRÜNÜM */
        subseasonal && (
          <div className="space-y-4 tabular">
            {/* 3. ve 4. Hafta Sinoptik Rejim Kartları */}
            <div className="grid gap-3 sm:grid-cols-2">
              {subseasonal.weeks.map((wk) => {
                const isWarm = wk.meanAnomalyC >= 0.8;
                const isCold = wk.meanAnomalyC <= -0.8;
                return (
                  <div
                    key={wk.weekIndex}
                    className="surface-tile p-3.5 space-y-2 border border-white/[0.08]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                          {wk.titleTr} · {wk.dateRangeTr}
                        </span>
                        <p className="font-display text-sm font-semibold text-ink-primary">
                          {wk.dominantRegimeTr}
                        </p>
                      </div>
                      <span
                        className={`rounded-lg border px-2 py-1 font-mono text-xs font-semibold ${
                          isWarm
                            ? "border-signal-amber/35 bg-signal-amber/12 text-amber-200"
                            : isCold
                              ? "border-signal-sky/35 bg-signal-sky/12 text-sky-200"
                              : "border-white/15 bg-white/[0.06] text-ink-primary"
                        }`}
                      >
                        {toDisplayDelta(wk.meanAnomalyC, unit)} Norm
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-ink-secondary">
                      {wk.summaryNoteTr}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-[10px] text-ink-muted">
                      <span>
                        Gündüz Bandı: {formatTemperature(wk.tempMaxRangeC[0], unit)}–
                        {formatTemperature(wk.tempMaxRangeC[1], unit)}
                      </span>
                      <span>Yağış Eğilimi: %{wk.meanWetProbPct}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Gün 16–30 Olasılıksal Koridor (P25–P75) Tablosu */}
            <div className="divide-y divide-white/[0.06]">
              {subseasonal.days.map((sd, idx) => {
                const iqrLeft = pctOnScale(sd.tempMinP50, subScale);
                const iqrRight = pctOnScale(sd.tempMaxP75, subScale);
                const iqrWidth = Math.max(8, iqrRight - iqrLeft);

                const outerLeft = pctOnScale(sd.tempMinP25, subScale);
                const outerRight = pctOnScale(sd.tempMaxP90, subScale);
                const outerWidth = Math.max(iqrWidth, outerRight - outerLeft);

                const normMid = 0.5 * (sd.tempNormalMax + sd.tempNormalMin);
                const normLeft = pctOnScale(normMid, subScale);

                return (
                  <div
                    key={sd.date}
                    className="-mx-2 grid grid-cols-[78px_22px_36px_minmax(64px,1fr)_auto] sm:grid-cols-[94px_26px_42px_1fr_auto] items-center gap-2 sm:gap-2.5 rounded-lg px-2 py-2 text-xs hover:bg-white/[0.035]"
                  >
                    <div className="leading-tight">
                      <span className="font-medium text-ink-primary">{sd.dayLabel}</span>
                      <span className="block font-mono text-[10px] text-ink-muted">
                        +{16 + idx}. gün
                      </span>
                    </div>

                    <AnimatedWeatherIcon
                      code={sd.weatherCode}
                      intensityMm={sd.precipP50Mm / 4}
                      phaseSeed={idx * 7 + 5}
                      className="h-4 w-4"
                    />

                    <span className="font-mono text-[11px] text-[var(--atmos-accent)]">
                      %{sd.wetProbPct}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="w-9 text-right font-mono text-[11px] text-ink-muted">
                        {formatTemperature(sd.tempMinP50, unit)}
                      </span>

                      <div className="relative h-2 flex-1 rounded-full bg-white/[0.06]">
                        <div
                          aria-hidden="true"
                          className="absolute -top-0.5 -bottom-0.5 rounded-full bg-purple-400/15"
                          style={{
                            left: `${outerLeft}%`,
                            width: `${outerWidth}%`
                          }}
                        />
                        <span
                          aria-hidden="true"
                          title="Mevsim normali"
                          className="absolute -top-1 -bottom-1 w-[1.5px] bg-white/35"
                          style={{ left: `${normLeft}%` }}
                        />
                        <div
                          className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400/80 via-indigo-300/85 to-amber-300/85"
                          style={{
                            left: `${iqrLeft}%`,
                            width: `${iqrWidth}%`
                          }}
                        />
                      </div>

                      <span className="w-16 font-mono text-[11px] font-medium text-ink-primary">
                        {formatTemperature(sd.tempMaxP25, unit)}–
                        {formatTemperature(sd.tempMaxP75, unit)}
                      </span>
                    </div>

                    <span
                      className={`hidden md:inline-block rounded px-1.5 py-0.5 font-mono text-[10px] ${
                        sd.anomalyC >= 1.5
                          ? "bg-signal-amber/14 text-amber-200"
                          : sd.anomalyC <= -1.5
                            ? "bg-signal-sky/14 text-sky-200"
                            : "bg-white/[0.05] text-ink-muted"
                      }`}
                    >
                      {sd.regimeTagTr}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="rounded-xl border border-white/[0.07] bg-obsidian-950/60 px-3.5 py-2.5 font-mono text-[10px] leading-relaxed text-ink-muted">
              Bilimsel Şeffaflık Notu: 16–30. günler ({subseasonal.ensembleMembers} üyeli{" "}
              {subseasonal.modelsLabel}), Lorenz kaos sınırı gereği tekil saat tahmini yerine{" "}
              <strong className="text-ink-secondary">P25–P75 olasılıksal sıcaklık koridoru</strong>{" "}
              ve yerel WMO mevsim normali sapması olarak sunulur (İlk 7 güne dikişsiz yanlılık düzeltmesi:{" "}
              {subseasonal.biasShiftMaxC > 0 ? `+${subseasonal.biasShiftMaxC}` : subseasonal.biasShiftMaxC}°C).
            </p>
          </div>
        )
      )}
    </div>
  );
}

const ExtendedDailyForecastPanel = memo(ExtendedDailyForecastPanelBase);
export default ExtendedDailyForecastPanel;
