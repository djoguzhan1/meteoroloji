"use client";

import { useEffect, useState } from "react";
import { CloudRain, Pause, Play, Snowflake } from "lucide-react";
import { formatTemperature } from "@/lib/weather";
import { atmosUiSfx } from "@/lib/ui-sfx";
import type { HourlyPoint, UnitSystem } from "@/lib/weather-types";
import AnimatedNumber from "./AnimatedNumber";

type TimeScrubberProps = {
  hourly: HourlyPoint[];
  frameIndex: number;
  onChange: (idx: number) => void;
  unit: UnitSystem;
};

export default function TimeScrubber({
  hourly,
  frameIndex,
  onChange,
  unit
}: TimeScrubberProps) {
  const [playing, setPlaying] = useState(false);
  const [horizon, setHorizon] = useState<24 | 48 | 168>(24);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const slice = hourly.slice(0, Math.min(horizon, hourly.length));
  const maxIdx = Math.max(0, slice.length - 1);
  const clampedIdx = Math.min(frameIndex, maxIdx);
  const active = slice[clampedIdx];
  const hovered = hoverIdx !== null ? slice[Math.min(hoverIdx, maxIdx)] : null;

  useEffect(() => {
    if (!playing || slice.length <= 1) return;
    const timer = window.setInterval(() => {
      const next = (clampedIdx + 1) % slice.length;
      atmosUiSfx.playScrubTick(next / Math.max(1, slice.length - 1));
      onChange(next);
    }, 850);
    return () => window.clearInterval(timer);
  }, [playing, clampedIdx, slice.length, onChange]);

  if (slice.length < 2) return null;

  const temps = slice.map((h) => h.temperature);
  const minT = Math.min(...temps) - 1;
  const maxT = Math.max(...temps) + 1;
  const spanT = Math.max(1, maxT - minT);

  const width = 1000;
  const height = 56;
  const stepX = width / Math.max(1, slice.length - 1);

  const yOfTemp = (t: number) =>
    height - 9 - ((t - minT) / spanT) * (height - 18);

  const tempPath = slice
    .map((h, i) => {
      const x = i * stepX;
      const y = yOfTemp(h.temperature);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const areaPath = `${tempPath} L${width},${height} L0,${height} Z`;

  const activePctX = (clampedIdx / Math.max(1, slice.length - 1)) * 100;
  const activePctY = (yOfTemp(active.temperature) / height) * 100;

  const hoverPctX =
    hoverIdx !== null ? (Math.min(hoverIdx, maxIdx) / Math.max(1, slice.length - 1)) * 100 : null;

  const pickFromSvgPointer = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
    return Math.round(frac * maxIdx);
  };

  return (
    <div className="surface-panel w-full p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              atmosUiSfx.playNavTick();
              setPlaying((p) => !p);
            }}
            aria-label={playing ? "Zaman akışını durdur" : "Zaman akışını oynat"}
            className={`atmos-btn relative flex h-8 w-8 items-center justify-center rounded-lg border text-ink-primary ${
              playing
                ? "border-[rgba(var(--atmos-accent-rgb),0.55)] bg-[rgba(var(--atmos-accent-rgb),0.18)] text-[var(--atmos-accent)]"
                : "border-white/15 bg-white/[0.06]"
            }`}
          >
            {playing && (
              <span
                aria-hidden="true"
                className="atmos-beacon-ring pointer-events-none absolute inset-0 rounded-lg border border-[var(--atmos-accent)]"
              />
            )}
            {playing ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 ml-0.5" />
            )}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium tracking-wide text-ink-secondary">
                {horizon} Saatlik Tahmin Akışı
              </p>
              {hourly.length >= 36 && (
                <div className="inline-flex rounded-md border border-white/10 bg-obsidian-950/75 p-0.5 font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() => {
                      atmosUiSfx.playNavTick();
                      setHorizon(24);
                      if (frameIndex >= 24) onChange(23);
                    }}
                    className={`rounded px-1.5 py-0.5 transition-colors ${
                      horizon === 24
                        ? "bg-white/15 text-ink-primary"
                        : "text-ink-muted hover:text-ink-primary"
                    }`}
                  >
                    24s
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      atmosUiSfx.playNavTick();
                      setHorizon(48);
                      if (frameIndex >= 48) onChange(47);
                    }}
                    className={`rounded px-1.5 py-0.5 transition-colors ${
                      horizon === 48
                        ? "bg-white/15 text-ink-primary"
                        : "text-ink-muted hover:text-ink-primary"
                    }`}
                  >
                    48s
                  </button>
                  {hourly.length >= 96 && (
                    <button
                      type="button"
                      onClick={() => {
                        atmosUiSfx.playNavTick();
                        setHorizon(168);
                      }}
                      className={`rounded px-1.5 py-0.5 transition-colors ${
                        horizon === 168
                          ? "bg-white/15 text-ink-primary"
                          : "text-ink-muted hover:text-ink-primary"
                      }`}
                    >
                      168s
                    </button>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-ink-muted">
              {clampedIdx === 0
                ? `Şimdi · ${active.condition}`
                : `${active.dayLabel} ${active.hourLabel} · ${active.condition}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs tabular">
          {active.rainAccum > 0 && (
            <span className="flex items-center gap-1 rounded-lg border border-[rgba(var(--atmos-accent-rgb),0.32)] bg-[rgba(var(--atmos-accent-rgb),0.12)] px-2.5 py-1 text-[var(--atmos-accent)]">
              <CloudRain className="h-3.5 w-3.5" />
              {active.rainAccum.toFixed(1)} mm
            </span>
          )}
          {active.snowAccum > 0 && (
            <span className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/[0.08] px-2.5 py-1 text-ink-primary">
              <Snowflake className="h-3.5 w-3.5" />
              {active.snowAccum.toFixed(1)} cm
            </span>
          )}
          <span className="rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1 text-ink-primary">
            {active.hourLabel} ·{" "}
            <AnimatedNumber value={formatTemperature(active.temperature, unit)} />
          </span>
        </div>
      </div>

      {/* İnteraktif Tıklanabilir / Hover Önizlemeli SVG Eğri + Yağış Barları */}
      <div className="relative">
        <div
          className="relative h-14 w-full cursor-pointer select-none"
          onPointerMove={(e) => setHoverIdx(pickFromSvgPointer(e))}
          onPointerLeave={() => setHoverIdx(null)}
          onClick={(e) => {
            const idx = pickFromSvgPointer(e);
            setPlaying(false);
            atmosUiSfx.playScrubTick(idx / Math.max(1, maxIdx));
            onChange(idx);
          }}
        >
          {hovered && hoverPctX !== null && (
            <div
              className="pointer-events-none absolute -top-8 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/15 bg-[#070c17]/95 px-2.5 py-1 font-mono text-[11px] text-ink-primary shadow-lg backdrop-blur-md tabular"
              style={{ left: `${Math.max(8, Math.min(92, hoverPctX))}%` }}
            >
              {hovered.dayLabel} {hovered.hourLabel} · {formatTemperature(hovered.temperature, unit)} · %
              {hovered.precipProbability}
            </div>
          )}

          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="scrubberGlowFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--atmos-accent)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--atmos-accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {slice.map((h, i) => {
              const barH = (h.precipProbability / 100) * (height - 14);
              if (barH <= 1) return null;
              const barW = horizon === 168 ? 3.2 : horizon === 48 ? 7 : 12;
              const isFocus = i === clampedIdx || i === hoverIdx;
              return (
                <rect
                  key={h.time}
                  x={i * stepX - barW / 2}
                  y={height - barH}
                  width={barW}
                  height={barH}
                  rx={horizon === 168 ? 1.2 : 2.5}
                  fill={
                    h.precipType === "snow"
                      ? isFocus
                        ? "rgba(226, 232, 240, 0.55)"
                        : "rgba(226, 232, 240, 0.25)"
                      : isFocus
                        ? "rgba(56, 189, 248, 0.62)"
                        : "rgba(56, 189, 248, 0.26)"
                  }
                />
              );
            })}

            <path d={areaPath} fill="url(#scrubberGlowFill)" />

            <path
              d={tempPath}
              fill="none"
              stroke="rgba(243, 246, 251, 0.92)"
              strokeWidth={horizon === 168 ? 1.7 : 2.2}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {hoverPctX !== null && (
            <div
              className="pointer-events-none absolute top-0 bottom-0 w-px bg-white/20"
              style={{ left: `${hoverPctX}%` }}
            />
          )}

          <div
            className="pointer-events-none absolute top-0 bottom-0 w-px transition-[left] duration-150"
            style={{
              left: `${activePctX}%`,
              background:
                "linear-gradient(180deg, transparent, var(--atmos-accent), rgba(255,255,255,0.65))"
            }}
          />

          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-150"
            style={{ left: `${activePctX}%`, top: `${activePctY}%` }}
          >
            <span
              className="atmos-beacon-ring absolute -inset-1.5 rounded-full"
              style={{ backgroundColor: "var(--atmos-accent)" }}
            />
            <span
              className="relative block h-2.5 w-2.5 rounded-full border-2 border-obsidian-900 bg-white"
              style={{ boxShadow: "0 0 12px var(--atmos-accent)" }}
            />
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={maxIdx}
          value={clampedIdx}
          onChange={(e) => {
            const val = Number(e.target.value);
            setPlaying(false);
            atmosUiSfx.playScrubTick(val / Math.max(1, maxIdx));
            onChange(val);
          }}
          aria-label={`${horizon} saatlik hava durumu zaman kaydırıcısı`}
          className="meteo-range mt-1 w-full"
        />

        <div className="mt-1 flex justify-between font-mono text-xs text-ink-muted tabular">
          <span>{slice[0]?.hourLabel}</span>
          <span>
            {horizon === 168 ? `${slice[Math.floor(maxIdx * 0.25)]?.dayLabel} ` : ""}
            {slice[Math.floor(maxIdx * 0.25)]?.hourLabel}
          </span>
          <span>
            {horizon >= 48 ? `${slice[Math.floor(maxIdx * 0.5)]?.dayLabel} ` : ""}
            {slice[Math.floor(maxIdx * 0.5)]?.hourLabel}
          </span>
          <span>
            {horizon === 168 ? `${slice[Math.floor(maxIdx * 0.75)]?.dayLabel} ` : ""}
            {slice[Math.floor(maxIdx * 0.75)]?.hourLabel}
          </span>
          <span>
            {horizon === 168 ? `${slice[maxIdx]?.dayLabel} ` : ""}
            {slice[maxIdx]?.hourLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
