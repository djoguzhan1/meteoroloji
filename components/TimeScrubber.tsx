"use client";

import { useEffect, useState } from "react";
import { CloudRain, Pause, Play, Snowflake, Sun } from "lucide-react";
import { formatTemperature } from "@/lib/weather";
import type { HourlyPoint, ScenarioKey, UnitSystem } from "@/lib/weather-types";

type TimeScrubberProps = {
  hourly: HourlyPoint[];
  frameIndex: number;
  onChange: (idx: number) => void;
  scenario: ScenarioKey;
  unit: UnitSystem;
};

export default function TimeScrubber({
  hourly,
  frameIndex,
  onChange,
  scenario,
  unit
}: TimeScrubberProps) {
  const [playing, setPlaying] = useState(false);
  const slice = hourly.slice(0, 24);
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

  // Mini SVG sparkline (sıcaklık + yağış çubukları)
  const temps = slice.map((h) => h.temperature);
  const minT = Math.min(...temps) - 1;
  const maxT = Math.max(...temps) + 1;
  const spanT = Math.max(1, maxT - minT);

  const width = 1000;
  const height = 56;
  const stepX = width / Math.max(1, slice.length - 1);

  const tempPath = slice
    .map((h, i) => {
      const x = i * stepX;
      const y = height - 8 - ((h.temperature - minT) / spanT) * (height - 18);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const activePctX = (clampedIdx / Math.max(1, slice.length - 1)) * 100;
  const activePctY =
    ((height - 8 - ((active.temperature - minT) / spanT) * (height - 18)) /
      height) *
    100;

  return (
    <div className="glass-panel w-full p-4 sm:p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Zaman çizelgesini durdur" : "Zaman çizelgesini oynat"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neon-orange/50 bg-neon-orange/20 text-neon-white hover:bg-neon-orange/30 transition-colors"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-neon-white/85">
              24 Saatlik Zaman Çizelgesi
            </p>
            <p className="text-xs text-neon-white/55">
              {scenario !== "live"
                ? "Simülasyon modu aktif — canlıya dönmek için kaydır"
                : clampedIdx === 0
                  ? `Şimdi · ${active.condition}`
                  : `${active.dayLabel} ${active.hourLabel} · ${active.condition}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          {active.rainAccum > 0 && (
            <span className="flex items-center gap-1 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-2.5 py-1 text-neon-cyan">
              <CloudRain className="h-3.5 w-3.5" />
              {active.rainAccum.toFixed(1)} mm
            </span>
          )}
          {active.snowAccum > 0 && (
            <span className="flex items-center gap-1 rounded-lg border border-white/25 bg-white/10 px-2.5 py-1 text-neon-white">
              <Snowflake className="h-3.5 w-3.5" />
              {active.snowAccum.toFixed(1)} cm
            </span>
          )}
          <span className="flex items-center gap-1 rounded-lg border border-neon-orange/40 bg-neon-orange/15 px-2.5 py-1 text-neon-orange">
            <Sun className="h-3.5 w-3.5" />
            {active.hourLabel} · {formatTemperature(active.temperature, unit)}
          </span>
        </div>
      </div>

      {/* SVG Sparkline + Yağış Barları (tam genişlik slider hizalı) */}
      <div className="relative">
        <div className="relative h-14 w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="sparkStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#ff8a3c" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            {slice.map((h, i) => {
              const barH = (h.precipProbability / 100) * (height - 14);
              if (barH <= 1) return null;
              return (
                <rect
                  key={h.time}
                  x={i * stepX - 7}
                  y={height - barH}
                  width={14}
                  height={barH}
                  rx={4}
                  fill={
                    h.precipType === "snow"
                      ? "rgba(241,245,255,0.28)"
                      : "rgba(56,189,248,0.28)"
                  }
                />
              );
            })}
            <path
              d={tempPath}
              fill="none"
              stroke="url(#sparkStroke)"
              strokeWidth={2.5}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Aktif saat dikey çizgisi ve dairesel gösterge */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 w-px border-l border-dashed border-neon-orange/55"
            style={{ left: `${activePctX}%` }}
          />
          <div
            className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-neon-white bg-neon-orange shadow-[0_0_10px_rgba(255,138,60,0.9)]"
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
          aria-label="24 saatlik hava durumu zaman kaydırıcısı"
          className="atmos-range mt-1 w-full"
        />

        <div className="mt-1 flex justify-between font-mono text-xs text-neon-white/50">
          <span>{slice[0]?.hourLabel}</span>
          <span>{slice[Math.floor(maxIdx * 0.25)]?.hourLabel}</span>
          <span>{slice[Math.floor(maxIdx * 0.5)]?.hourLabel}</span>
          <span>{slice[Math.floor(maxIdx * 0.75)]?.hourLabel}</span>
          <span>{slice[maxIdx]?.hourLabel}</span>
        </div>
      </div>
    </div>
  );
}
