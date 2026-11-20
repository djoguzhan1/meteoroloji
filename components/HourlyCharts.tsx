"use client";

import { useState } from "react";
import { formatTemperature, formatWindSpeed } from "@/lib/weather";
import type { HourlyPoint, UnitSystem } from "@/lib/weather-types";

type ChartMode = "temp" | "precip" | "wind" | "pressure";

const CHART_TABS: Array<{ key: ChartMode; label: string }> = [
  { key: "temp", label: "Sıcaklık" },
  { key: "precip", label: "Yağış" },
  { key: "wind", label: "Rüzgar" },
  { key: "pressure", label: "Basınç & Nem" }
];

export default function HourlyCharts({
  hourly,
  unit
}: {
  hourly: HourlyPoint[];
  unit: UnitSystem;
}) {
  const [mode, setMode] = useState<ChartMode>("temp");
  const [selectedIdx, setSelectedIdx] = useState(0);

  const data = hourly.slice(0, 24);
  if (data.length < 2) return null;

  const selected = data[Math.min(selectedIdx, data.length - 1)];

  const width = 760;
  const height = 210;
  const padX = 32;
  const padTop = 20;
  const padBot = 28;
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBot;
  const stepX = innerW / Math.max(1, data.length - 1);

  const primarySeries = data.map((h) => {
    if (mode === "temp") return h.temperature;
    if (mode === "precip") return h.precipProbability;
    if (mode === "wind") return h.windSpeed;
    return h.pressure;
  });

  const secondarySeries = data.map((h) => {
    if (mode === "temp") return h.apparentTemperature;
    if (mode === "precip") return h.precipitation * 10;
    if (mode === "wind") return h.windGusts;
    return h.humidity;
  });

  const combined =
    mode === "temp" || mode === "wind"
      ? [...primarySeries, ...secondarySeries]
      : primarySeries;
  const minVal =
    mode === "precip" ? 0 : Math.floor(Math.min(...combined) - 2);
  const maxVal =
    mode === "precip" ? 100 : Math.ceil(Math.max(...combined) + 2);
  const span = Math.max(1, maxVal - minVal);

  const yOf = (val: number) =>
    padTop + innerH - ((val - minVal) / span) * innerH;

  const linePath = (vals: number[]) =>
    vals
      .map(
        (v, i) =>
          `${i === 0 ? "M" : "L"}${(padX + i * stepX).toFixed(1)},${yOf(v).toFixed(1)}`
      )
      .join(" ");

  const primaryPath = linePath(primarySeries);
  const areaPath = `${primaryPath} L${(padX + (data.length - 1) * stepX).toFixed(1)},${(padTop + innerH).toFixed(1)} L${padX},${(padTop + innerH).toFixed(1)} Z`;

  const primaryStroke =
    mode === "temp"
      ? "#f3f6fb"
      : mode === "wind"
        ? "#38bdf8"
        : "#cbd5e1";

  return (
    <div className="surface-panel p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-ink-primary">
            Saatlik Değişim Grafiği (24s)
          </h3>
          <p className="text-xs text-ink-muted">
            Saat seçmek için grafikteki noktalara tıkla
          </p>
        </div>

        <div className="flex flex-wrap gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          {CHART_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setMode(t.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === t.key
                  ? "bg-white/[0.12] text-ink-primary"
                  : "text-ink-secondary hover:text-ink-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seçili saat satırı */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-xs tabular">
        <span className="font-mono font-semibold text-ink-primary">
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
              <strong className="font-mono text-signal-sky">
                {formatTemperature(selected.apparentTemperature, unit)}
              </strong>
            </span>
            <span className="text-ink-secondary">
              Çiy Noktası:{" "}
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
              <strong className="font-mono text-signal-sky">
                %{selected.precipProbability}
              </strong>
            </span>
            <span className="text-ink-secondary">
              Yağış:{" "}
              <strong className="font-mono text-ink-primary">
                {selected.precipitation.toFixed(1)} mm/sa
              </strong>
            </span>
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
              <strong className="font-mono text-signal-sky">
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
              Yön: <strong className="font-mono text-ink-primary">{selected.windDirection}°</strong>
            </span>
          </>
        )}
        {mode === "pressure" && (
          <>
            <span className="text-ink-secondary">
              Basınç:{" "}
              <strong className="font-mono text-ink-primary">
                {selected.pressure} hPa
              </strong>
            </span>
            <span className="text-ink-secondary">
              Nem:{" "}
              <strong className="font-mono text-signal-sky">
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

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-52 w-full min-w-[540px]"
          role="img"
          aria-label="24 saatlik meteoroloji grafiği"
        >
          <defs>
            <linearGradient id="meteoArea" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(243,246,251,0.16)" />
              <stop offset="100%" stopColor="rgba(243,246,251,0.0)" />
            </linearGradient>
          </defs>

          {[0, 0.33, 0.66, 1].map((frac) => {
            const y = padTop + innerH * frac;
            const val = Math.round(maxVal - span * frac);
            return (
              <g key={frac}>
                <line
                  x1={padX}
                  y1={y}
                  x2={width - padX}
                  y2={y}
                  stroke="rgba(255,255,255,0.07)"
                />
                <text
                  x={26}
                  y={y + 4}
                  textAnchor="end"
                  fill="rgba(167,180,200,0.65)"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {mode === "precip" ? (
            data.map((h, i) => {
              const x = padX + i * stepX;
              const barH = (h.precipProbability / 100) * innerH;
              return (
                <rect
                  key={h.time}
                  x={x - 9}
                  y={padTop + innerH - barH}
                  width={18}
                  height={Math.max(2, barH)}
                  rx={4}
                  fill={
                    i === selectedIdx
                      ? "#38bdf8"
                      : "rgba(56, 189, 248, 0.38)"
                  }
                  className="cursor-pointer"
                  onClick={() => setSelectedIdx(i)}
                />
              );
            })
          ) : (
            <>
              <path d={areaPath} fill="url(#meteoArea)" />
              <path
                d={primaryPath}
                fill="none"
                stroke={primaryStroke}
                strokeWidth={2.2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {(mode === "temp" || mode === "wind") && (
                <path
                  d={linePath(secondarySeries)}
                  fill="none"
                  stroke={mode === "wind" ? "#f59e0b" : "#38bdf8"}
                  strokeWidth={1.6}
                  strokeDasharray="4 4"
                />
              )}
            </>
          )}

          {data.map((h, i) => {
            const x = padX + i * stepX;
            const y = yOf(primarySeries[i]);
            const isSel = i === selectedIdx;
            return (
              <g
                key={h.time}
                className="cursor-pointer"
                onClick={() => setSelectedIdx(i)}
              >
                <rect
                  x={x - stepX / 2}
                  y={padTop}
                  width={stepX}
                  height={innerH}
                  fill="transparent"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={isSel ? 5 : 2.5}
                  fill={isSel ? "#38bdf8" : "#f3f6fb"}
                  stroke={isSel ? "#090d16" : "transparent"}
                  strokeWidth={2}
                />
                {i % 3 === 0 && (
                  <text
                    x={x}
                    y={height - 6}
                    textAnchor="middle"
                    fill="rgba(167,180,200,0.68)"
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
