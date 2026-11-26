"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { CloudRain, Pause, Play, RotateCcw, Snowflake } from "lucide-react";
import {
  buildSmoothCurvePath,
  getPrecipPhaseVisual
} from "@/lib/hourly-meteogram";
import { atmosUiSfx } from "@/lib/ui-sfx";
import { formatTemperature } from "@/lib/weather-client";
import type { HourlyPoint, UnitSystem } from "@/lib/weather-types";
import AnimatedNumber from "./AnimatedNumber";
import AnimatedWeatherIcon from "./AnimatedWeatherIcon";

type ScrubberHorizon = 24 | 48 | 168 | 240;

type TimeScrubberProps = {
  hourly: HourlyPoint[];
  frameIndex: number;
  onChange: (idx: number) => void;
  unit: UnitSystem;
};

function TimeScrubberBase({
  hourly,
  frameIndex,
  onChange,
  unit
}: TimeScrubberProps) {
  const [playing, setPlaying] = useState(false);
  const [preferredHorizon, setPreferredHorizon] = useState<ScrubberHorizon>(24);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const horizon: ScrubberHorizon =
    frameIndex >= 168
      ? 240
      : frameIndex >= 48 && preferredHorizon < 168
        ? 168
        : frameIndex >= 24 && preferredHorizon === 24
          ? 48
          : preferredHorizon;

  const slice = useMemo(
    () => hourly.slice(0, Math.min(horizon, hourly.length)),
    [horizon, hourly]
  );
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
    }, 820);
    return () => window.clearInterval(timer);
  }, [playing, clampedIdx, slice.length, onChange]);

  const width = 1000;
  const height = 48;
  const stepX = width / Math.max(1, slice.length - 1);

  const curveGeometry = useMemo(() => {
    if (slice.length < 2) {
      return {
        tempPath: "",
        areaPath: "",
        ys: [] as number[],
        bars: [] as Array<{
          key: string;
          x: number;
          y: number;
          w: number;
          h: number;
          rx: number;
          fill: string;
          focusFill: string;
          idx: number;
        }>
      };
    }
    const temps = slice.map((h) => h.temperature);
    const minT = Math.min(...temps) - 1;
    const maxT = Math.max(...temps) + 1;
    const spanT = Math.max(1, maxT - minT);

    const pts = slice.map((h, i) => ({
      x: i * stepX,
      y: height - 8 - ((h.temperature - minT) / spanT) * (height - 16)
    }));
    const tempPath = buildSmoothCurvePath(pts, 0.2);
    const areaPath = `${tempPath} L${width},${height} L0,${height} Z`;

    const barW =
      horizon === 240
        ? 2.4
        : horizon === 168
          ? 3.2
          : horizon === 48
            ? 7
            : 12;
    const rx = horizon >= 168 ? 1.2 : 2.5;
    const bars: Array<{
      key: string;
      x: number;
      y: number;
      w: number;
      h: number;
      rx: number;
      fill: string;
      focusFill: string;
      idx: number;
    }> = [];

    for (let i = 0; i < slice.length; i++) {
      const h = slice[i];
      const barH = (h.precipProbability / 100) * (height - 12);
      if (barH <= 1) continue;
      const vis = getPrecipPhaseVisual(h.precipPhase, h.precipType);
      bars.push({
        key: h.time,
        x: i * stepX - barW / 2,
        y: height - barH,
        w: barW,
        h: barH,
        rx,
        fill: vis.barFill,
        focusFill: vis.barFocusFill,
        idx: i
      });
    }

    return { tempPath, areaPath, ys: pts.map((p) => p.y), bars };
  }, [horizon, slice, stepX]);

  if (slice.length < 2 || !active) return null;

  const activePctX = (clampedIdx / Math.max(1, slice.length - 1)) * 100;
  const activePctY = ((curveGeometry.ys[clampedIdx] ?? height / 2) / height) * 100;

  const hoverPctX =
    hoverIdx !== null
      ? (Math.min(hoverIdx, maxIdx) / Math.max(1, slice.length - 1)) * 100
      : null;

  const pickFromPointer = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / Math.max(1, rect.width)));
    return Math.round(frac * maxIdx);
  };

  const availableHorizons = ([24, 48, 168, 240] as const).filter((h) =>
    h === 240 ? hourly.length > 168 : h <= hourly.length || h === 24
  );

  return (
    <div className="surface-panel w-full px-4 py-3.5 sm:px-5 space-y-2.5">
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
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-medium tracking-wide text-ink-secondary">
                3D Gökyüzü Zaman Cetveli ({slice.length}s)
              </p>
              {hourly.length >= 36 && (
                <div className="inline-flex rounded-md border border-white/10 bg-obsidian-950/75 p-0.5 font-mono text-[10px]">
                  {availableHorizons.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => {
                        atmosUiSfx.playNavTick();
                        setPreferredHorizon(h);
                        if (frameIndex >= h) {
                          onChange(0);
                        }
                      }}
                      className={`rounded px-1.5 py-0.5 transition-colors ${
                        horizon === h
                          ? "bg-white/15 text-ink-primary"
                          : "text-ink-muted hover:text-ink-primary"
                      }`}
                    >
                      {h === 240 ? "10g" : `${h}s`}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="flex items-center gap-1.5 text-xs text-ink-muted">
              <AnimatedWeatherIcon
                code={active.weatherCode}
                isNight={active.solarElevationDeg < -3}
                precipPhase={active.precipPhase}
                intensityMm={active.precipitation}
                windSpeedKmh={active.windSpeed}
                phaseSeed={clampedIdx}
                className="h-4 w-4"
              />
              <span>
                {clampedIdx === 0
                  ? `Şimdi · ${active.condition}`
                  : `${active.dayLabel} ${active.hourLabel} · ${active.condition}`}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs tabular">
          {clampedIdx > 0 && (
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                atmosUiSfx.playNavTick();
                onChange(0);
              }}
              title="Anlık gözleme dön"
              className="atmos-btn inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/[0.05] px-2 py-1 text-[11px] text-ink-secondary hover:text-ink-primary"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Şimdi</span>
            </button>
          )}
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

      <div className="relative">
        <div
          className="relative h-12 w-full cursor-pointer select-none"
          onPointerMove={(e) => {
            const next = pickFromPointer(e);
            setHoverIdx((prev) => (prev === next ? prev : next));
          }}
          onPointerLeave={() => setHoverIdx((prev) => (prev === null ? prev : null))}
          onClick={(e) => {
            const idx = pickFromPointer(e);
            setPlaying(false);
            atmosUiSfx.playScrubTick(idx / Math.max(1, maxIdx));
            onChange(idx);
          }}
        >
          {hovered && hoverPctX !== null && (
            <div
              className="pointer-events-none absolute -top-8 z-20 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-white/15 bg-[#070c17]/96 px-2.5 py-1 font-mono text-[11px] text-ink-primary shadow-lg tabular"
              style={{ left: `${Math.max(8, Math.min(92, hoverPctX))}%` }}
            >
              <AnimatedWeatherIcon
                code={hovered.weatherCode}
                isNight={hovered.solarElevationDeg < -3}
                precipPhase={hovered.precipPhase}
                intensityMm={hovered.precipitation}
                phaseSeed={hoverIdx ?? 0}
                animated={false}
                className="h-3.5 w-3.5"
              />
              <span>
                {hovered.dayLabel} {hovered.hourLabel} ·{" "}
                {formatTemperature(hovered.temperature, unit)} · %{hovered.precipProbability}
              </span>
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
                <stop offset="0%" stopColor="var(--atmos-accent)" stopOpacity="0.20" />
                <stop offset="100%" stopColor="var(--atmos-accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {curveGeometry.bars.map((b) => {
              const isFocus = b.idx === clampedIdx || b.idx === hoverIdx;
              return (
                <rect
                  key={b.key}
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  rx={b.rx}
                  fill={isFocus ? b.focusFill : b.fill}
                />
              );
            })}

            <path d={curveGeometry.areaPath} fill="url(#scrubberGlowFill)" />

            <path
              d={curveGeometry.tempPath}
              fill="none"
              stroke="rgba(243, 246, 251, 0.92)"
              strokeWidth={horizon >= 168 ? 1.65 : 2.15}
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
          aria-label={`${slice.length} saatlik hava durumu zaman kaydırıcısı`}
          className="meteo-range mt-0.5 w-full"
        />

        <div className="mt-0.5 flex justify-between font-mono text-[11px] text-ink-muted tabular">
          <span>{slice[0]?.hourLabel}</span>
          <span>
            {horizon >= 168 ? `${slice[Math.floor(maxIdx * 0.25)]?.dayLabel} ` : ""}
            {slice[Math.floor(maxIdx * 0.25)]?.hourLabel}
          </span>
          <span>
            {horizon >= 48 ? `${slice[Math.floor(maxIdx * 0.5)]?.dayLabel} ` : ""}
            {slice[Math.floor(maxIdx * 0.5)]?.hourLabel}
          </span>
          <span>
            {horizon >= 168 ? `${slice[Math.floor(maxIdx * 0.75)]?.dayLabel} ` : ""}
            {slice[Math.floor(maxIdx * 0.75)]?.hourLabel}
          </span>
          <span>
            {horizon >= 168 ? `${slice[maxIdx]?.dayLabel} ` : ""}
            {slice[maxIdx]?.hourLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

const TimeScrubber = memo(TimeScrubberBase);
export default TimeScrubber;
