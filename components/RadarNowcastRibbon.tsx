"use client";

import { memo, useMemo, useState } from "react";
import { CloudOff, CloudRain, Clock, Radar } from "lucide-react";
import { getPrecipPhaseVisual } from "@/lib/hourly-meteogram";
import type {
  AtmosEngineMeta,
  HourlyPoint,
  Minutely15Point,
  PrecipPhase,
  UnitSystem
} from "@/lib/weather-types";

export type RadarNowcastRibbonProps = {
  minutely15?: ReadonlyArray<Minutely15Point>;
  hourly?: ReadonlyArray<HourlyPoint>;
  engineMeta?: AtmosEngineMeta;
  frameIndex: number;
  unit: UnitSystem;
  className?: string;
};

function formatSlotTemp(celsius: number, unit: UnitSystem): string {
  return unit === "imperial"
    ? `${Math.round(celsius * 1.8 + 32)}°F`
    : `${Math.round(celsius)}°C`;
}

function formatSlotPrecip(mm: number, unit: UnitSystem): string {
  return unit === "imperial"
    ? `${(mm / 25.4).toFixed(2)} in`
    : `${mm.toFixed(2)} mm`;
}

function deriveShiftedIsoHourPrefix(baseIso: string, addHours: number): string | null {
  if (!baseIso || baseIso.length < 13) return null;
  const y = Number(baseIso.slice(0, 4));
  const m = Number(baseIso.slice(5, 7));
  const d = Number(baseIso.slice(8, 10));
  const h = Number(baseIso.slice(11, 13));
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d) || !Number.isFinite(h)) {
    return null;
  }
  const shifted = new Date(Date.UTC(y, m - 1, d, h + addHours, 0, 0));
  const sy = shifted.getUTCFullYear();
  const sm = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const sd = String(shifted.getUTCDate()).padStart(2, "0");
  const sh = String(shifted.getUTCHours()).padStart(2, "0");
  return `${sy}-${sm}-${sd}T${sh}`;
}

function RadarNowcastRibbonBase({
  minutely15,
  hourly,
  engineMeta,
  frameIndex,
  unit,
  className
}: RadarNowcastRibbonProps) {
  const [activeSlotIdx, setActiveSlotIdx] = useState<number | null>(null);

  const slots = useMemo(() => (minutely15 ?? []).slice(0, 24), [minutely15]);

  const hasPrecipInSlots = useMemo(
    () => (minutely15 ?? []).some((pt) => pt.precipitation >= 0.04),
    [minutely15]
  );

  const hasOnset = engineMeta?.nextRainOnsetMin != null;
  const hasCessation = engineMeta?.rainCessationMin != null;
  const isVirgaAloft = engineMeta?.radarSummaryCode === "VIRGA_ALOFT";

  const isVisible =
    frameIndex <= 6 &&
    (hasPrecipInSlots || hasOnset || hasCessation || isVirgaAloft);

  const metrics = useMemo(() => {
    let maxPrecipMm = 0;
    let totalMm = 0;
    const presentPhases = new Set<PrecipPhase>();

    for (const pt of slots) {
      if (pt.precipitation > maxPrecipMm) {
        maxPrecipMm = pt.precipitation;
      }
      totalMm += pt.precipitation;
      if (pt.precipitation >= 0.02) {
        const effectivePhase: PrecipPhase =
          pt.precipPhase && pt.precipPhase !== "none"
            ? pt.precipPhase
            : pt.snowfall > 0
              ? "snow"
              : "rain";
        presentPhases.add(effectivePhase);
      }
    }

    const peakMm = Math.max(2.0, maxPrecipMm * 1.15);
    return {
      maxPrecipMm,
      totalMm,
      peakMm,
      presentPhases: Array.from(presentPhases)
    };
  }, [slots]);

  const lockedSlotIdx = useMemo<number | null>(() => {
    if (slots.length === 0) return null;
    if (frameIndex <= 0) return 0;
    if (frameIndex > 6) return null;

    const targetPrefix =
      hourly?.[frameIndex]?.time.slice(0, 13) ??
      deriveShiftedIsoHourPrefix(slots[0].time, frameIndex);
    if (!targetPrefix) return null;

    const matchedIdx = slots.findIndex((pt) => pt.time.slice(0, 13) === targetPrefix);
    return matchedIdx >= 0 ? matchedIdx : null;
  }, [frameIndex, hourly, slots]);

  if (!isVisible) return null;

  const scaleCeilingLabel =
    unit === "imperial"
      ? `${(metrics.peakMm / 25.4).toFixed(2)} in/15dk`
      : `${metrics.peakMm.toFixed(1)} mm/15dk`;

  const totalWindowLabel =
    unit === "imperial"
      ? `${(metrics.totalMm / 25.4).toFixed(2)} in`
      : `${metrics.totalMm.toFixed(1)} mm`;

  const clampedInspectedIdx =
    activeSlotIdx !== null && slots.length > 0
      ? Math.min(activeSlotIdx, slots.length - 1)
      : null;
  const inspectedSlot =
    clampedInspectedIdx !== null ? slots[clampedInspectedIdx] : null;
  const inspectedVis = inspectedSlot
    ? getPrecipPhaseVisual(
        inspectedSlot.precipPhase,
        inspectedSlot.snowfall > 0
          ? "snow"
          : inspectedSlot.precipitation >= 0.02
            ? "rain"
            : "none"
      )
    : null;
  const inspectedPctX =
    clampedInspectedIdx !== null && slots.length > 1
      ? ((clampedInspectedIdx + 0.5) / slots.length) * 100
      : 50;

  const tickIndices =
    slots.length >= 4
      ? [
          0,
          Math.floor((slots.length - 1) / 3),
          Math.floor(((slots.length - 1) * 2) / 3),
          slots.length - 1
        ]
      : slots.map((_, idx) => idx);

  return (
    <section
      aria-label="15 dakikalık radar yağış nowcast şeridi"
      className={`surface-panel w-full px-3.5 py-3.5 sm:px-5 sm:py-4 space-y-2.5 ${className ?? ""}`}
    >
      {/* Üst Rasathane Başlığı, Durum Rozetleri ve Adaptif Tavan Ölçeği */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center gap-1.5 font-display text-xs sm:text-sm font-semibold tracking-tight text-ink-primary">
            <Radar className="h-3.5 w-3.5 shrink-0 text-signal-sky" />
            <span>15dk Radar Nowcast</span>
          </span>
          <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-ink-muted tabular">
            0–6s · {slots.length || 24} Dilim
          </span>

          {hasOnset && (
            <span className="inline-flex items-center gap-1 rounded-md border border-sky-400/35 bg-sky-400/12 px-2 py-0.5 font-mono text-[11px] font-medium text-sky-100 tabular">
              <CloudRain className="h-3 w-3 shrink-0 text-sky-300" />
              <span>
                Yağış Başlangıcı: ~{Math.round(engineMeta!.nextRainOnsetMin!)} dk
              </span>
            </span>
          )}

          {hasCessation && (
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/35 bg-emerald-400/12 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-100 tabular">
              <Clock className="h-3 w-3 shrink-0 text-emerald-300" />
              <span>
                Yağış Bitişi: ~{Math.round(engineMeta!.rainCessationMin!)} dk
              </span>
            </span>
          )}

          {isVirgaAloft && (
            <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-400/14 px-2 py-0.5 font-mono text-[11px] font-medium text-amber-100">
              <CloudOff className="h-3 w-3 shrink-0 text-signal-amber" />
              <span>Üst Atmosfer Virga · Zemine Ulaşmıyor</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] tabular">
          {metrics.totalMm >= 0.05 && (
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-ink-secondary">
              6s Toplam: <strong className="text-ink-primary">{totalWindowLabel}</strong>
            </span>
          )}
          <span
            title="15 dakikalık adaptif dikey ölçek tavanı"
            className="rounded-md border border-[rgba(var(--atmos-accent-rgb),0.28)] bg-[rgba(var(--atmos-accent-rgb),0.10)] px-2 py-0.5 text-[var(--atmos-accent)]"
          >
            Tavan: {scaleCeilingLabel}
          </span>
        </div>
      </div>

      {/* 24 Adet 15-Dakikalık Faz-Duyarlı Hyetograf Çubuğu */}
      {slots.length > 0 && (
        <div className="relative pt-6">
          {inspectedSlot && inspectedVis ? (
            <div
              className="atmos-hud-glass pointer-events-none absolute top-0 z-20 -translate-x-1/2 max-w-[calc(100%-1rem)] flex items-center gap-1.5 whitespace-normal sm:whitespace-nowrap rounded-lg px-2 sm:px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] leading-tight text-ink-primary tabular"
              style={{
                left: `clamp(calc(50% - max(0px, 50% - 8.5rem)), ${inspectedPctX.toFixed(2)}%, calc(50% + max(0px, 50% - 8.5rem)))`
              }}
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: inspectedVis.barFocusFill }}
              />
              <span className="min-w-0 break-words sm:truncate">
                {inspectedSlot.label} · {inspectedVis.label} ·{" "}
                {formatSlotPrecip(inspectedSlot.precipitation, unit)} ·{" "}
                {formatSlotTemp(inspectedSlot.temperature, unit)}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between font-mono text-[10px] text-ink-muted tabular">
              <span>
                {frameIndex === 0
                  ? "Canlı radar + NWP 15dk akışı (dokun/üzerine gel)"
                  : lockedSlotIdx !== null && slots[lockedSlotIdx]
                    ? `Seçili saat hizası: +${frameIndex}s (${slots[lockedSlotIdx].label})`
                    : "Canlı radar + NWP 15dk akışı (ilk dilimler)"}
              </span>
              {metrics.presentPhases.length > 0 && (
                <span className="hidden sm:inline-flex items-center gap-2">
                  {metrics.presentPhases.map((ph) => {
                    const phVis = getPrecipPhaseVisual(ph);
                    return (
                      <span key={ph} className="inline-flex items-center gap-1">
                        <span
                          className="h-2 w-2 rounded-sm"
                          style={{ backgroundColor: phVis.barFocusFill }}
                        />
                        <span>{phVis.label}</span>
                      </span>
                    );
                  })}
                </span>
              )}
            </div>
          )}

          <div
            role="group"
            aria-label="24 dilimli 15 dakikalık yağış çubukları"
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") {
                setActiveSlotIdx(null);
              }
            }}
            className="relative mt-1 flex h-14 w-full items-end gap-[2px] sm:gap-1 rounded-xl border border-white/[0.07] bg-obsidian-950/65 px-2 pt-2 pb-1.5 overflow-hidden"
          >
            {/* %50 referans ölçek çizgisi */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-2 top-1/2 border-t border-dashed border-white/[0.08]"
            />

            {slots.map((pt, idx) => {
              const isWet = pt.precipitation >= 0.02;
              const fallbackType =
                pt.snowfall > 0 ? "snow" : isWet ? "rain" : "none";
              const phaseVis = getPrecipPhaseVisual(pt.precipPhase, fallbackType);
              const rawPct = (pt.precipitation / metrics.peakMm) * 100;
              const barPct = isWet ? Math.min(100, Math.max(10, rawPct)) : 6;
              const isFocused = clampedInspectedIdx === idx;
              const isFrameMarker =
                clampedInspectedIdx === null &&
                lockedSlotIdx !== null &&
                idx === lockedSlotIdx;

              const slotPrecipStr = formatSlotPrecip(pt.precipitation, unit);
              const slotTempStr = formatSlotTemp(pt.temperature, unit);
              const tooltipStr = `${pt.label} · ${phaseVis.label} · ${slotPrecipStr} · ${slotTempStr}`;

              return (
                <button
                  key={pt.time}
                  type="button"
                  title={tooltipStr}
                  aria-label={tooltipStr}
                  aria-pressed={isFocused}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") {
                      setActiveSlotIdx(idx);
                    }
                  }}
                  onFocus={() => setActiveSlotIdx(idx)}
                  onBlur={() =>
                    setActiveSlotIdx((prev) => (prev === idx ? null : prev))
                  }
                  onClick={() =>
                    setActiveSlotIdx((prev) => (prev === idx ? null : idx))
                  }
                  className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end rounded-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--atmos-accent)]"
                >
                  <span
                    className="block w-full rounded-t-[2px] transition-[height,background-color,opacity] duration-150"
                    style={{
                      height: `${barPct}%`,
                      backgroundColor: isWet
                        ? isFocused || isFrameMarker
                          ? phaseVis.barFocusFill
                          : phaseVis.barFill
                        : isFocused
                          ? "rgba(255, 255, 255, 0.24)"
                          : "rgba(255, 255, 255, 0.08)",
                      boxShadow:
                        isWet && (isFocused || isFrameMarker)
                          ? `0 0 10px ${phaseVis.stroke}`
                          : undefined
                    }}
                  />
                </button>
              );
            })}
          </div>

          <div className="mt-1 flex justify-between px-0.5 font-mono text-[10px] text-ink-muted tabular">
            {tickIndices.map((tIdx) => (
              <span key={`${slots[tIdx]?.time}-${tIdx}`}>
                {slots[tIdx]?.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export const RadarNowcastRibbon = memo(RadarNowcastRibbonBase);
export default RadarNowcastRibbon;
