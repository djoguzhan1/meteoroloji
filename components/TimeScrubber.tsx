"use client";

import { useEffect, useState } from "react";
import { CloudRain, Pause, Play, Snowflake } from "lucide-react";
import { formatTemperature } from "@/lib/weather";
import type { HourlyPoint, UnitSystem } from "@/lib/weather-types";

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
  const [horizon, setHorizon] = useState<24 | 48>(24);
  const slice = hourly.slice(0, Math.min(horizon, hourly.length));
  const maxIdx = Math.max(0, slice.length - 1);
  const clampedIdx = Math.min(frameIndex, maxIdx);
  const active = slice[clampedIdx];

  useEffect(() => {
    if (!playing || slice.length <= 1) return;
    const timer = window.setInterval(() => {
      onChange((clampedIdx + 1) % slice.length);
    }, 850);
    return () => window.clearInterval(timer);
  }, [playing, clampedIdx, slice.length, onChange]);

  if (slice.length < 2) return null;

  const temps = slice.map((h) => h.temperature);
  const minT = Math.min(...temps) - 1;
  const maxT = Math.max(...temps) + 1;
  const spanT = Math.max(1, maxT - minT);

  const width = 1000;
  const height = 52;
  const stepX = width / Math.max(1, slice.length - 1);

  const tempPath = slice
    .map((h, i) => {
      const x = i * stepX;
      const y = height - 8 - ((h.temperature - minT) / spanT) * (height - 16);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const activePctX = (clampedIdx / Math.max(1, slice.length - 1)) * 100;
  const activePctY =
    ((height - 8 - ((active.temperature - minT) / spanT) * (height - 16)) /
      height) *
    100;

  return (
    <div className="surface-panel w-full p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Zaman akışını durdur" : "Zaman akışını oynat"}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] text-ink-primary hover:bg-white/[0.12] transition-colors"
          >
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
                    onClick={() => setHorizon(48)}
                    className={`rounded px-1.5 py-0.5 transition-colors ${
                      horizon === 48
                        ? "bg-white/15 text-ink-primary"
                        : "text-ink-muted hover:text-ink-primary"
                    }`}
                  >
                    48s
                  </button>
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
            <span className="flex items-center gap-1 rounded-lg border border-signal-sky/25 bg-signal-sky/10 px-2.5 py-1 text-signal-sky">
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
          <span className="rounded-lg border border-white/15 bg-white/[0.05] px-2.5 py-1 text-ink-primary">
            {active.hourLabel} · {formatTemperature(active.temperature, unit)}
          </span>
        </div>
      </div>

      {/* Tam genişlikte slider ile birebir hizalı SVG eğri + yağış olasılığı barları */}
      <div className="relative">
        <div className="relative h-14 w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
            aria-hidden="true"
          >
            {slice.map((h, i) => {
              const barH = (h.precipProbability / 100) * (height - 14);
              if (barH <= 1) return null;
              const barW = horizon === 48 ? 7 : 12;
              return (
                <rect
                  key={h.time}
                  x={i * stepX - barW / 2}
                  y={height - barH}
                  width={barW}
                  height={barH}
                  rx={2.5}
                  fill={
                    h.precipType === "snow"
                      ? "rgba(226, 232, 240, 0.25)"
                      : "rgba(56, 189, 248, 0.26)"
                  }
                />
              );
            })}
            <path
              d={tempPath}
              fill="none"
              stroke="rgba(243, 246, 251, 0.88)"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div
            className="pointer-events-none absolute top-0 bottom-0 w-px border-l border-dashed border-white/35"
            style={{ left: `${activePctX}%` }}
          />
          <div
            className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-obsidian-900 bg-ink-primary"
            style={{ left: `${activePctX}%`, top: `${activePctY}%` }}
          />
        </div>

        <input
          type="range"
          min={0}
          max={maxIdx}
          value={clampedIdx}
          onChange={(e) => {
            setPlaying(false);
            onChange(Number(e.target.value));
          }}
          aria-label={`${horizon} saatlik hava durumu zaman kaydırıcısı`}
          className="meteo-range mt-1 w-full"
        />

        <div className="mt-1 flex justify-between font-mono text-xs text-ink-muted tabular">
          <span>{slice[0]?.hourLabel}</span>
          <span>{slice[Math.floor(maxIdx * 0.25)]?.hourLabel}</span>
          <span>
            {horizon === 48 ? "Yarın " : ""}
            {slice[Math.floor(maxIdx * 0.5)]?.hourLabel}
          </span>
          <span>{slice[Math.floor(maxIdx * 0.75)]?.hourLabel}</span>
          <span>{slice[maxIdx]?.hourLabel}</span>
        </div>
      </div>
    </div>
  );
}
