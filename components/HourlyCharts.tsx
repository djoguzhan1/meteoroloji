"use client";

import { useState } from "react";
import { formatTemperature, formatWindSpeed } from "@/lib/weather";
import { atmosUiSfx } from "@/lib/ui-sfx";
import type { HourlyPoint, UnitSystem } from "@/lib/weather-types";

type ChartMode = "temp" | "precip" | "wind" | "pressure";

const CHART_TABS: Array<{ key: ChartMode; label: string }> = [
  { key: "temp", label: "Sıcaklık" },
  { key: "precip", label: "Yağış" },
  { key: "wind", label: "Rüzgar" },
  { key: "pressure", label: "Basınç & Nem" }
];

function toDisplayTemp(c: number, unit: UnitSystem): number {
  return unit === "imperial" ? (c * 9) / 5 + 32 : c;
}

function toDisplayWind(kmh: number, unit: UnitSystem): number {
  return unit === "imperial" ? kmh * 0.621371 : kmh;
}

export default function HourlyCharts({
  hourly,
  unit,
  selectedIndex,
  onSelectIndex
}: {
  hourly: HourlyPoint[];
  unit: UnitSystem;
  selectedIndex?: number;
  onSelectIndex?: (idx: number) => void;
}) {
  const [mode, setMode] = useState<ChartMode>("temp");
  const [localIdx, setLocalIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const data = hourly.slice(0, 24);
  if (data.length < 2) return null;

  const lockedIdx = selectedIndex !== undefined ? selectedIndex : localIdx;
  const clampedLocked = Math.max(0, Math.min(lockedIdx, data.length - 1));
  const clampedDisplayIdx =
    hoverIdx !== null ? Math.max(0, Math.min(hoverIdx, data.length - 1)) : clampedLocked;

  const setSelectedIdx = (idx: number) => {
    atmosUiSfx.playScrubTick(idx / Math.max(1, data.length - 1));
    setLocalIdx(idx);
    onSelectIndex?.(idx);
  };

  const selected = data[clampedDisplayIdx];

  const width = 760;
  const height = 220;
  const padLeft = 38;
  const padRight = mode === "pressure" ? 38 : 22;
  const padTop = 20;
  const padBot = 28;
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBot;
  const stepX = innerW / Math.max(1, data.length - 1);

  const primarySeries = data.map((h) => {
    if (mode === "temp") return toDisplayTemp(h.temperature, unit);
    if (mode === "precip") return h.precipProbability;
    if (mode === "wind") return toDisplayWind(h.windSpeed, unit);
    return h.pressure;
  });

  const secondarySeries = data.map((h) => {
    if (mode === "temp") return toDisplayTemp(h.apparentTemperature, unit);
    if (mode === "precip") return h.precipitation * 10;
    if (mode === "wind") return toDisplayWind(h.windGusts, unit);
    return h.humidity;
  });

  const combined =
    mode === "temp" || mode === "wind"
      ? [...primarySeries, ...secondarySeries]
      : primarySeries;
  const minVal =
    mode === "precip" || mode === "wind"
      ? 0
      : Math.floor(Math.min(...combined) - 2);
  const maxVal =
    mode === "precip" ? 100 : Math.ceil(Math.max(...combined) + 2);
  const span = Math.max(1, maxVal - minVal);

  const yOf = (val: number) =>
    padTop + innerH - ((val - minVal) / span) * innerH;

  const yOfHumidity = (rh: number) =>
    padTop + innerH - (Math.max(0, Math.min(100, rh)) / 100) * innerH;

  const linePath = (vals: number[], yFn: (v: number) => number = yOf) =>
    vals
      .map(
        (v, i) =>
          `${i === 0 ? "M" : "L"}${(padLeft + i * stepX).toFixed(1)},${yFn(v).toFixed(1)}`
      )
      .join(" ");

  const primaryPath = linePath(primarySeries);
  const areaPath = `${primaryPath} L${(padLeft + (data.length - 1) * stepX).toFixed(1)},${(padTop + innerH).toFixed(1)} L${padLeft},${(padTop + innerH).toFixed(1)} Z`;

  const primaryStroke =
    mode === "temp"
      ? "#f3f6fb"
      : mode === "wind"
        ? "var(--atmos-accent)"
        : "#cbd5e1";

  const yUnitSuffix =
    mode === "temp"
      ? unit === "imperial"
        ? "°F"
        : "°"
      : mode === "precip"
        ? "%"
        : "";

  const activeX = padLeft + clampedDisplayIdx * stepX;

  return (
    <div className="surface-panel p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink-primary">
            Saatlik Değişim Grafiği (24s)
          </h3>
          <p className="text-xs text-ink-muted">
            Gezinerek önizle, saati sahneye kilitlemek için tıkla
          </p>
        </div>

        <div className="flex flex-wrap gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          {CHART_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                atmosUiSfx.playNavTick();
                setMode(t.key);
              }}
              className={`atmos-btn rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                mode === t.key
                  ? "border border-[rgba(var(--atmos-rim-rgb),0.3)] bg-white/[0.12] text-white shadow-[0_0_16px_-6px_rgba(var(--atmos-accent-rgb),0.55)]"
                  : "border border-transparent text-ink-secondary hover:text-ink-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seçili / Taranan Saat Telemetri Bandı */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs tabular">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-ink-primary">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: "var(--atmos-accent)",
                boxShadow: "0 0 8px var(--atmos-accent)"
              }}
            />
            {selected.dayLabel} · {selected.hourLabel}
          </span>
          {mode === "temp" && (
            <>
              <span className="text-ink-secondary">
                Sıcaklık:{" "}
                <strong className="font-mono text-ink-primary">
                  {formatTemperature(selected.temperature, unit)}
                </strong>
              </span>
              <span className="text-ink-secondary">
                Hissedilen:{" "}
                <strong className="font-mono text-[var(--atmos-accent)]">
                  {formatTemperature(selected.apparentTemperature, unit)}
                </strong>
              </span>
              <span className="text-ink-secondary">
                Çiy:{" "}
                <strong className="font-mono text-ink-primary">
                  {formatTemperature(selected.dewPoint, unit)}
                </strong>
              </span>
              {selected.temp850hPa !== null && (
                <span className="text-ink-secondary">
                  850 hPa:{" "}
                  <strong className="font-mono text-ink-primary">
                    {selected.temp850hPa}°C
                  </strong>
                </span>
              )}
            </>
          )}
          {mode === "precip" && (
            <>
              <span className="text-ink-secondary">
                Olasılık:{" "}
                <strong className="font-mono text-[var(--atmos-accent)]">
                  %{selected.precipProbability}
                </strong>
              </span>
              <span className="text-ink-secondary">
                Yağış:{" "}
                <strong className="font-mono text-ink-primary">
                  {selected.precipitation.toFixed(1)} mm/sa
                </strong>
              </span>
              {selected.precipConsensus && selected.precipConsensus.totalModels > 0 && (
                <span className="text-ink-secondary">
                  Uzlaşı:{" "}
                  <strong className="font-mono text-ink-primary">
                    {selected.precipConsensus.agreeingModels}/{selected.precipConsensus.totalModels} model
                  </strong>
                </span>
              )}
              <span className="text-ink-secondary">
                Durum:{" "}
                <strong className="text-ink-primary">{selected.condition}</strong>
              </span>
            </>
          )}
          {mode === "wind" && (
            <>
              <span className="text-ink-secondary">
                Ortalama:{" "}
                <strong className="font-mono text-[var(--atmos-accent)]">
                  {formatWindSpeed(selected.windSpeed, unit)}
                </strong>
              </span>
              <span className="text-ink-secondary">
                Hamle:{" "}
                <strong className="font-mono text-signal-amber">
                  {formatWindSpeed(selected.windGusts, unit)}
                </strong>
              </span>
              <span className="text-ink-secondary">
                Yön:{" "}
                <strong className="font-mono text-ink-primary">
                  {selected.windDirection}°
                </strong>
              </span>
            </>
          )}
          {mode === "pressure" && (
            <>
              <span className="text-ink-secondary">
                Basınç (MSL):{" "}
                <strong className="font-mono text-ink-primary">
                  {selected.pressure} hPa
                </strong>
              </span>
              <span className="text-ink-secondary">
                Bağıl Nem:{" "}
                <strong className="font-mono text-[var(--atmos-accent)]">
                  %{selected.humidity}
                </strong>
              </span>
              <span className="text-ink-secondary">
                Görüş:{" "}
                <strong className="font-mono text-ink-primary">
                  {selected.visibilityKm} km
                </strong>
              </span>
            </>
          )}
        </div>

        {/* Çizgi Lejantı */}
        {mode !== "precip" && (
          <div className="flex items-center gap-3 font-mono text-[10px] text-ink-muted">
            <span className="flex items-center gap-1">
              <span
                className="h-0.5 w-3 rounded"
                style={{ backgroundColor: primaryStroke }}
              />
              {mode === "temp"
                ? "Sıcaklık"
                : mode === "wind"
                  ? "Ortalama"
                  : "Basınç (hPa)"}
            </span>
            <span className="flex items-center gap-1">
              <span
                className="h-0.5 w-3 border-t border-dashed"
                style={{
                  borderColor: mode === "wind" ? "#f59e0b" : "var(--atmos-accent)"
                }}
              />
              {mode === "temp"
                ? "Hissedilen"
                : mode === "wind"
                  ? "Hamle"
                  : "Nem (%)"}
            </span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-52 w-full min-w-[540px]"
          role="img"
          aria-label="24 saatlik meteoroloji grafiği"
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="meteoArea" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--atmos-accent)" stopOpacity="0.24" />
              <stop offset="100%" stopColor="var(--atmos-accent)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.33, 0.66, 1].map((frac) => {
            const y = padTop + innerH * frac;
            const val = Math.round(maxVal - span * frac);
            return (
              <g key={frac}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="rgba(255,255,255,0.07)"
                />
                <text
                  x={padLeft - 6}
                  y={y + 4}
                  textAnchor="end"
                  fill="rgba(167,180,200,0.68)"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {val}
                  {yUnitSuffix}
                </text>
                {mode === "pressure" && (
                  <text
                    x={width - padRight + 6}
                    y={y + 4}
                    textAnchor="start"
                    fill="rgba(56,189,248,0.68)"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    %{Math.round((1 - frac) * 100)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Canlı Dikey Lazer Tarama Çizgisi */}
          <line
            x1={activeX}
            y1={padTop}
            x2={activeX}
            y2={padTop + innerH}
            stroke="var(--atmos-accent)"
            strokeOpacity="0.45"
            strokeDasharray="3 3"
            strokeWidth={1.2}
          />

          {mode === "precip" ? (
            data.map((h, i) => {
              const x = padLeft + i * stepX;
              const barH = (h.precipProbability / 100) * innerH;
              const isFocus = i === clampedDisplayIdx;
              return (
                <rect
                  key={h.time}
                  x={x - 9}
                  y={padTop + innerH - barH}
                  width={18}
                  height={Math.max(2, barH)}
                  rx={4}
                  fill={isFocus ? "var(--atmos-accent)" : "rgba(56, 189, 248, 0.34)"}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoverIdx(i)}
                  onClick={() => setSelectedIdx(i)}
                />
              );
            })
          ) : (
            <g key={mode}>
              <path d={areaPath} fill="url(#meteoArea)" />
              <path
                d={primaryPath}
                fill="none"
                stroke={primaryStroke}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="atmos-line-draw"
              />
              {(mode === "temp" || mode === "wind") && (
                <path
                  d={linePath(secondarySeries)}
                  fill="none"
                  stroke={mode === "wind" ? "#f59e0b" : "var(--atmos-accent)"}
                  strokeWidth={1.6}
                  strokeDasharray="4 4"
                />
              )}
              {mode === "pressure" && (
                <path
                  d={linePath(secondarySeries, yOfHumidity)}
                  fill="none"
                  stroke="var(--atmos-accent)"
                  strokeWidth={1.7}
                  strokeDasharray="4 4"
                />
              )}
            </g>
          )}

          {data.map((h, i) => {
            const x = padLeft + i * stepX;
            const y = yOf(primarySeries[i]);
            const isSel = i === clampedDisplayIdx;
            const isLocked = i === clampedLocked;
            return (
              <g
                key={h.time}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIdx(i)}
                onClick={() => setSelectedIdx(i)}
              >
                <rect
                  x={x - stepX / 2}
                  y={padTop}
                  width={stepX}
                  height={innerH}
                  fill="transparent"
                />
                {isSel && (
                  <circle
                    cx={x}
                    cy={y}
                    r={10}
                    fill="var(--atmos-accent)"
                    fillOpacity={0.22}
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isSel ? 5.2 : isLocked ? 4 : 2.4}
                  fill={isSel || isLocked ? "var(--atmos-accent)" : "#f3f6fb"}
                  stroke={isSel ? "#090d16" : "transparent"}
                  strokeWidth={2}
                />
                {i % 3 === 0 && (
                  <text
                    x={x}
                    y={height - 6}
                    textAnchor="middle"
                    fill={isSel ? "#f3f6fb" : "rgba(167,180,200,0.68)"}
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    {h.hourLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
