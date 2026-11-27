"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { CloudRain, Pause, Play, RotateCcw, Snowflake } from "lucide-react";
import {
  buildSmoothCurvePath,
  getPrecipPhaseVisual
} from "@/lib/hourly-meteogram";
import { atmosUiSfx } from "@/lib/ui-sfx";
import { formatTemperature } from "@/lib/weather-client";
import type {
  CurrentWeather,
  HourlyPoint,
  UnitSystem
} from "@/lib/weather-types";
import AnimatedNumber from "./AnimatedNumber";
import AnimatedWeatherIcon from "./AnimatedWeatherIcon";

export type ScrubberHorizon = 24 | 48 | 168 | 240;

export type TimeScrubberProps = {
  hourly: HourlyPoint[];
  frameIndex: number;
  onChange: (idx: number) => void;
  unit: UnitSystem;
  horizonHours?: 24 | 48 | 168 | 240;
  onHorizonChange?: (h: 48 | 168 | 240) => void;
  canonicalNow?: CurrentWeather;
};

function requiredHorizonForFrame(idx: number): ScrubberHorizon {
  if (idx >= 168) return 240;
  if (idx >= 48) return 168;
  if (idx >= 24) return 48;
  return 24;
}

function mergeCanonicalNowIntoHour0(
  hour0: HourlyPoint,
  now: CurrentWeather
): HourlyPoint {
  const nowHourLabel =
    now.time && now.time.length >= 16 ? now.time.slice(11, 16) : hour0.hourLabel;
  return {
    ...hour0,
    hourLabel: nowHourLabel,
    temperature: now.temperature,
    apparentTemperature: now.apparentTemperature,
    wetBulbC: now.wetBulbC ?? hour0.wetBulbC,
    humidity: now.humidity,
    dewPoint: now.dewPoint,
    pressure: now.pressure,
    windSpeed: now.windSpeed,
    windGusts: now.windGusts,
    windDirection: now.windDirection,
    cloudCover: now.cloudCover,
    visibilityKm: now.visibilityKm,
    uvIndex: now.uvIndex,
    precipitation: now.precipitation,
    precipProbability: now.precipProbability,
    precipConsensus: now.precipConsensus,
    precipType: now.precipType,
    precipPhase: now.precipPhase ?? hour0.precipPhase,
    snowLineElevationM:
      now.snowLineElevationM !== undefined
        ? now.snowLineElevationM
        : hour0.snowLineElevationM,
    airSnowCm: now.airSnowCmHr !== undefined ? now.airSnowCmHr : hour0.airSnowCm,
    groundSnowCm:
      now.groundSnowCmHr !== undefined ? now.groundSnowCmHr : hour0.groundSnowCm,
    roadSnowCm:
      now.roadSnowCmHr !== undefined ? now.roadSnowCmHr : hour0.roadSnowCm,
    snowpackDepthCm:
      now.snowpackDepthCm !== undefined
        ? now.snowpackDepthCm
        : hour0.snowpackDepthCm,
    snowSlr: now.snowSlr ?? hour0.snowSlr,
    snowQualityTr: now.snowQualityTr ?? hour0.snowQualityTr,
    icingRisk: now.icingRisk ?? hour0.icingRisk,
    blowingSnowRisk: now.blowingSnowRisk ?? hour0.blowingSnowRisk,
    dekStatus: now.dekStatus ?? hour0.dekStatus,
    weatherCode: now.weatherCode,
    condition: now.condition,
    isStorm: now.isStorm,
    stormScore: now.stormScore ?? hour0.stormScore,
    lightningProbPct:
      now.lightningProbPct !== undefined
        ? now.lightningProbPct
        : hour0.lightningProbPct,
    lightningFlashesPerMin:
      now.lightningFlashesPerMin !== undefined
        ? now.lightningFlashesPerMin
        : hour0.lightningFlashesPerMin,
    isThundersnow:
      now.isThundersnow !== undefined ? now.isThundersnow : hour0.isThundersnow,
    solarElevationDeg: now.solarElevationDeg,
    daylight: now.daylight,
    temp850hPa: now.temp850hPa
  };
}

function formatWindowRainTotal(mm: number, unit: UnitSystem): string {
  if (unit === "imperial") {
    return `${(mm / 25.4).toFixed(2)} in`;
  }
  return `${mm.toFixed(1)} mm`;
}

function formatWindowSnowPair(
  airCm: number,
  groundCm: number,
  unit: UnitSystem
): string {
  if (unit === "imperial") {
    return `Hava ${(airCm / 2.54).toFixed(1)} · Yer ${(groundCm / 2.54).toFixed(1)} in`;
  }
  return `Hava ${airCm.toFixed(1)} · Yer ${groundCm.toFixed(1)} cm`;
}

function formatHoveredHourlyRate(pt: HourlyPoint, unit: UnitSystem): string {
  const airSnow = pt.airSnowCm ?? 0;
  const groundSnow = pt.groundSnowCm ?? 0;
  if (airSnow >= 0.05 || (pt.precipPhase === "snow" && pt.precipitation >= 0.05)) {
    if (unit === "imperial") {
      return `Saatlik: ❄ H ${(airSnow / 2.54).toFixed(2)} / Y ${(groundSnow / 2.54).toFixed(2)} in/sa`;
    }
    return `Saatlik: ❄ H ${airSnow.toFixed(1)} / Y ${groundSnow.toFixed(1)} cm/sa`;
  }
  if (unit === "imperial") {
    return `Saatlik: ${(pt.precipitation / 25.4).toFixed(2)} in/sa`;
  }
  return `Saatlik: ${pt.precipitation.toFixed(1)} mm/sa`;
}

function TimeScrubberBase({
  hourly,
  frameIndex,
  onChange,
  unit,
  horizonHours,
  onHorizonChange,
  canonicalNow
}: TimeScrubberProps) {
  const [playing, setPlaying] = useState(false);
  const [preferredHorizon, setPreferredHorizon] = useState<ScrubberHorizon>(
    horizonHours ?? 24
  );
  const [prevExternalHorizon, setPrevExternalHorizon] = useState<
    ScrubberHorizon | undefined
  >(horizonHours);
  const [prevFrameIndex, setPrevFrameIndex] = useState<number>(frameIndex);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragPointerIdRef = useRef<number | null>(null);
  const handledByPointerRef = useRef(false);

  if (horizonHours !== prevExternalHorizon) {
    setPrevExternalHorizon(horizonHours);
    if (horizonHours !== undefined) {
      setPreferredHorizon(horizonHours);
    }
  }

  if (frameIndex !== prevFrameIndex) {
    setPrevFrameIndex(frameIndex);
    const needed = requiredHorizonForFrame(frameIndex);
    if (needed > preferredHorizon) {
      setPreferredHorizon(needed);
    }
  }

  const minHorizonForActiveFrame = requiredHorizonForFrame(frameIndex);
  const horizon: ScrubberHorizon =
    minHorizonForActiveFrame > preferredHorizon
      ? minHorizonForActiveFrame
      : preferredHorizon;

  const normalizedHourly = useMemo(() => {
    if (!canonicalNow || hourly.length === 0) return hourly;
    const copy = hourly.slice();
    copy[0] = mergeCanonicalNowIntoHour0(hourly[0], canonicalNow);
    return copy;
  }, [hourly, canonicalNow]);

  const slice = useMemo(
    () => normalizedHourly.slice(0, Math.min(horizon, normalizedHourly.length)),
    [horizon, normalizedHourly]
  );

  const maxIdx = Math.max(0, slice.length - 1);
  const clampedIdx = Math.min(frameIndex, maxIdx);
  const active = slice[clampedIdx];
  const hovered = hoverIdx !== null ? slice[Math.min(hoverIdx, maxIdx)] : null;

  const windowTotals = useMemo(() => {
    let rainMm = 0;
    let airSnowCm = 0;
    let groundSnowCm = 0;
    let maxAirSnowProbPct = 0;

    for (const pt of slice) {
      const aSnow = pt.airSnowCm ?? 0;
      const gSnow = pt.groundSnowCm ?? 0;
      airSnowCm += aSnow;
      groundSnowCm += gSnow;
      if ((pt.airSnowProbPct ?? 0) > maxAirSnowProbPct) {
        maxAirSnowProbPct = pt.airSnowProbPct ?? 0;
      }

      if (pt.precipPhase === "snow" && aSnow > 0) {
        continue;
      }
      const slr = pt.snowSlr && pt.snowSlr > 0 ? pt.snowSlr : 10;
      const snowSweMm = aSnow > 0 ? (aSnow * 10) / slr : 0;
      rainMm += Math.max(0, (pt.precipitation ?? 0) - snowSweMm);
    }

    return {
      rainMm,
      airSnowCm,
      groundSnowCm,
      maxAirSnowProbPct
    };
  }, [slice]);

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
  const activePctY =
    ((curveGeometry.ys[clampedIdx] ?? height / 2) / height) * 100;

  const hoverPctX =
    hoverIdx !== null
      ? (Math.min(hoverIdx, maxIdx) / Math.max(1, slice.length - 1)) * 100
      : null;

  const pickIndexFromClientX = (el: HTMLDivElement, clientX: number): number => {
    const rect = el.getBoundingClientRect();
    const frac = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / Math.max(1, rect.width))
    );
    return Math.round(frac * maxIdx);
  };

  const finishPointerDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current === e.pointerId) {
      if (typeof e.currentTarget.releasePointerCapture === "function") {
        try {
          if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        } catch {
          // Sentetik pointer test ortamlarında capture serbest bırakma hatası yutulur
        }
      }
      dragPointerIdRef.current = null;
      setIsDragging(false);
    }
    if (e.pointerType !== "mouse") {
      setHoverIdx(null);
    }
  };

  const availableHorizons = ([24, 48, 168, 240] as const).filter((h) =>
    h === 240 ? normalizedHourly.length > 168 : h <= normalizedHourly.length || h === 24
  );

  const horizonLabel = horizon === 240 ? "10g" : `${slice.length}s`;
  const activeTempStr = formatTemperature(active.temperature, unit);
  const ariaValueText =
    clampedIdx === 0
      ? `Şimdi (${active.hourLabel}), ${activeTempStr}, ${active.condition}`
      : `${active.dayLabel} ${active.hourLabel}, ${activeTempStr}, ${active.condition}`;

  return (
    <div className="surface-panel w-full px-4 py-3.5 sm:px-5 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => {
              atmosUiSfx.playNavTick();
              setPlaying((p) => !p);
            }}
            aria-label={playing ? "Zaman akışını durdur" : "Zaman akışını oynat"}
            className={`atmos-btn relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-ink-primary ${
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

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-xs font-medium tracking-wide text-ink-secondary">
                3D Gökyüzü Zaman Cetveli ({horizonLabel})
              </p>
              {normalizedHourly.length >= 36 && (
                <div
                  role="group"
                  aria-label="Zaman cetveli vade seçimi"
                  className="inline-flex rounded-md border border-white/10 bg-obsidian-950/75 p-0.5 font-mono text-[10px]"
                >
                  {availableHorizons.map((h) => (
                    <button
                      key={h}
                      type="button"
                      aria-pressed={horizon === h}
                      onClick={() => {
                        atmosUiSfx.playNavTick();
                        setPreferredHorizon(h);
                        if (h !== 24) {
                          onHorizonChange?.(h);
                        }
                        if (frameIndex >= h) {
                          onChange(Math.min(frameIndex, h - 1));
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
            <p className="flex items-center gap-1.5 text-xs text-ink-muted truncate">
              <AnimatedWeatherIcon
                code={active.weatherCode}
                isNight={active.solarElevationDeg < -3}
                precipPhase={active.precipPhase}
                intensityMm={active.precipitation}
                windSpeedKmh={active.windSpeed}
                phaseSeed={clampedIdx}
                className="h-4 w-4 shrink-0"
              />
              <span className="truncate">
                {clampedIdx === 0
                  ? `Şimdi · ${active.condition}`
                  : `${active.dayLabel} ${active.hourLabel} · ${active.condition}`}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs tabular">
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
          {windowTotals.rainMm >= 0.1 && (
            <span
              title={`${horizonLabel} penceresi toplam sıvı yağış`}
              className="flex items-center gap-1 rounded-lg border border-[rgba(var(--atmos-accent-rgb),0.32)] bg-[rgba(var(--atmos-accent-rgb),0.12)] px-2.5 py-1 text-[11px] sm:text-xs text-[var(--atmos-accent)]"
            >
              <CloudRain className="h-3.5 w-3.5 shrink-0" />
              <span>
                {horizonLabel} Toplam:{" "}
                {formatWindowRainTotal(windowTotals.rainMm, unit)}
              </span>
            </span>
          )}
          {(windowTotals.airSnowCm >= 0.1 ||
            windowTotals.maxAirSnowProbPct >= 25) && (
            <span
              title={`${horizonLabel} penceresi toplam havada yağan / zeminde tutan kar`}
              className="flex items-center gap-1 rounded-lg border border-sky-300/30 bg-sky-400/12 px-2.5 py-1 text-[11px] sm:text-xs text-sky-100"
            >
              <Snowflake className="h-3.5 w-3.5 shrink-0 text-sky-300" />
              <span>
                {horizonLabel} Toplam:{" "}
                {formatWindowSnowPair(
                  windowTotals.airSnowCm,
                  windowTotals.groundSnowCm,
                  unit
                )}
              </span>
            </span>
          )}
          <span className="rounded-lg border border-white/15 bg-white/[0.06] px-2.5 py-1 text-ink-primary">
            {active.hourLabel} · <AnimatedNumber value={activeTempStr} />
          </span>
        </div>
      </div>

      <div className="relative pt-6">
        {hovered && hoverPctX !== null && (
          <div
            className="atmos-hud-glass pointer-events-none absolute top-0 z-20 -translate-x-1/2 max-w-[calc(100%-1rem)] flex items-center gap-1.5 whitespace-normal sm:whitespace-nowrap rounded-lg px-2 sm:px-2.5 py-0.5 font-mono text-[10px] sm:text-[11px] leading-tight text-ink-primary tabular"
            style={{
              left: `clamp(calc(50% - max(0px, 50% - 9.5rem)), ${hoverPctX.toFixed(2)}%, calc(50% + max(0px, 50% - 9.5rem)))`
            }}
          >
            <AnimatedWeatherIcon
              code={hovered.weatherCode}
              isNight={hovered.solarElevationDeg < -3}
              precipPhase={hovered.precipPhase}
              intensityMm={hovered.precipitation}
              phaseSeed={hoverIdx ?? 0}
              animated={false}
              className="h-3.5 w-3.5 shrink-0"
            />
            <span className="min-w-0 break-words sm:truncate">
              {hovered.dayLabel} {hovered.hourLabel} ·{" "}
              {formatTemperature(hovered.temperature, unit)} · %
              {hovered.precipProbability} ·{" "}
              {formatHoveredHourlyRate(hovered, unit)}
              {(hovered.lightningProbPct ?? 0) >= 25
                ? ` · ⚡%${hovered.lightningProbPct}`
                : ""}
            </span>
          </div>
        )}

        <div
          className="relative h-12 w-full cursor-pointer select-none touch-none rounded-lg focus-within:ring-1 focus-within:ring-[var(--atmos-accent)]"
          onPointerDown={(e) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            const el = e.currentTarget;
            if (typeof el.setPointerCapture === "function") {
              try {
                el.setPointerCapture(e.pointerId);
              } catch {
                // JSDOM / sentetik olay ortamı için güvenli yakalama
              }
            }
            dragPointerIdRef.current = e.pointerId;
            handledByPointerRef.current = true;
            setIsDragging(true);
            setPlaying(false);
            const idx = pickIndexFromClientX(el, e.clientX);
            setHoverIdx(idx);
            atmosUiSfx.playScrubTick(idx / Math.max(1, maxIdx));
            onChange(idx);
          }}
          onPointerMove={(e) => {
            const next = pickIndexFromClientX(e.currentTarget, e.clientX);
            setHoverIdx((prev) => (prev === next ? prev : next));
            if (dragPointerIdRef.current === e.pointerId && next !== clampedIdx) {
              atmosUiSfx.playScrubTick(next / Math.max(1, maxIdx));
              onChange(next);
            }
          }}
          onPointerUp={finishPointerDrag}
          onPointerCancel={finishPointerDrag}
          onPointerLeave={() => {
            if (dragPointerIdRef.current === null) {
              setHoverIdx(null);
            }
          }}
          onClick={(e) => {
            if (handledByPointerRef.current) {
              handledByPointerRef.current = false;
              return;
            }
            const idx = pickIndexFromClientX(e.currentTarget, e.clientX);
            setPlaying(false);
            atmosUiSfx.playScrubTick(idx / Math.max(1, maxIdx));
            onChange(idx);
          }}
        >
          {/* Klavye ve ekran okuyucu erişilebilirlik katmanı (tekil görünür SVG thumb korunur) */}
          <input
            type="range"
            min={0}
            max={maxIdx}
            step={1}
            value={clampedIdx}
            onChange={(e) => {
              const val = Number(e.target.value);
              setPlaying(false);
              atmosUiSfx.playScrubTick(val / Math.max(1, maxIdx));
              onChange(val);
            }}
            aria-label={`${slice.length} saatlik hava durumu zaman kaydırıcısı`}
            aria-valuetext={ariaValueText}
            className="sr-only"
          />

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
            className={`pointer-events-none absolute top-0 bottom-0 w-px ${
              isDragging ? "" : "transition-[left] duration-150"
            }`}
            style={{
              left: `${activePctX}%`,
              background:
                "linear-gradient(180deg, transparent, var(--atmos-accent), rgba(255,255,255,0.65))"
            }}
          />

          {/* Tekil Net Işıklı Eğri Tutamacı (Thumb) */}
          <div
            className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 ${
              isDragging ? "" : "transition-[left,top] duration-150"
            }`}
            style={{ left: `${activePctX}%`, top: `${activePctY}%` }}
          >
            <span
              className="atmos-beacon-ring absolute -inset-1.5 rounded-full"
              style={{ backgroundColor: "var(--atmos-accent)" }}
            />
            <span
              className="relative block h-3 w-3 rounded-full border-2 border-obsidian-900 bg-white"
              style={{ boxShadow: "0 0 12px var(--atmos-accent)" }}
            />
          </div>
        </div>

        <div className="mt-1 flex justify-between font-mono text-[11px] text-ink-muted tabular">
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
