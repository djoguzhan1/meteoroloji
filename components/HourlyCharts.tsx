"use client";

import { useState } from "react";
import { formatTemperature, formatWindSpeed } from "@/lib/weather";
import type { HourlyPoint, UnitSystem } from "@/lib/weather-types";

type ChartMode = "temp" | "precip" | "wind" | "pressure";

const CHART_TABS: Array<{ key: ChartMode; label: string }> = [
  { key: "temp", label: "Sıcaklık & Hissedilen" },
  { key: "precip", label: "Yağış (% & mm)" },
  { key: "wind", label: "Rüzgar & Hamle" },
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
  const padX = 24;
  const padTop = 22;
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
    mode === "precip"
      ? 0
      : Math.floor(Math.min(...combined) - 2);
  const maxVal =
    mode === "precip"
      ? 100
      : Math.ceil(Math.max(...combined) + 2);
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

  return (
    <div className="glass-panel p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-neon-white">
            24 Saatlik Grafik Analizi
          </h3>
          <p className="text-xs text-neon-white/60">
            Saat noktalarına tıklayarak detaylı telemetriyi incele
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CHART_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setMode(t.key)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === t.key
                  ? "border-neon-orange/60 bg-neon-orange/20 text-neon-white"
                  : "border-white/10 bg-white/5 text-neon-white/70 hover:text-neon-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seçili saat özeti */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs">
        <span className="font-mono font-semibold text-neon-orange">
          {selected.dayLabel} · {selected.hourLabel}
        </span>
        {mode === "temp" && (
          <>
            <span>
              Sıcaklık:{" "}
              <strong className="font-mono text-neon-white">
                {formatTemperature(selected.temperature, unit)}
              </strong>
            </span>
            <span>
              Hissedilen:{" "}
              <strong className="font-mono text-neon-cyan">
                {formatTemperature(selected.apparentTemperature, unit)}
              </strong>
            </span>
            <span>
              Çiy Noktası:{" "}
              <strong className="font-mono text-neon-white/85">
                {formatTemperature(selected.dewPoint, unit)}
              </strong>
            </span>
          </>
        )}
        {mode === "precip" && (
          <>
            <span>
              Yağış Olasılığı:{" "}
              <strong className="font-mono text-neon-cyan">
                %{selected.precipProbability}
              </strong>
            </span>
            <span>
              Miktar:{" "}
              <strong className="font-mono text-neon-white">
                {selected.precipitation.toFixed(1)} mm/sa
              </strong>
            </span>
            <span>
              Durum: <strong className="text-neon-white">{selected.condition}</strong>
            </span>
          </>
        )}
        {mode === "wind" && (
          <>
            <span>
              Rüzgar:{" "}
              <strong className="font-mono text-neon-cyan">
                {formatWindSpeed(selected.windSpeed, unit)}
              </strong>
            </span>
            <span>
              Hamle:{" "}
              <strong className="font-mono text-neon-orange">
                {formatWindSpeed(selected.windGusts, unit)}
              </strong>
            </span>
            <span>
              Yön: <strong className="font-mono">{selected.windDirection}°</strong>
            </span>
          </>
        )}
        {mode === "pressure" && (
          <>
            <span>
              Basınç:{" "}
              <strong className="font-mono text-neon-violet">
                {selected.pressure} hPa
              </strong>
            </span>
            <span>
              Bağıl Nem:{" "}
              <strong className="font-mono text-neon-cyan">
                %{selected.humidity}
              </strong>
            </span>
            <span>
              Görüş:{" "}
              <strong className="font-mono">{selected.visibilityKm} km</strong>
            </span>
          </>
        )}
      </div>

      {/* İnteraktif SVG Grafik */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-52 w-full min-w-[540px]"
          role="img"
          aria-label="24 saatlik meteoroloji grafiği"
        >
          <defs>
            <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ff8a3c" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Yatay kılavuz çizgileri */}
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
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="4 4"
                />
                <text
                  x={4}
                  y={y + 4}
                  fill="rgba(245,247,255,0.45)"
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
                  rx={5}
                  fill={
                    i === selectedIdx
                      ? "#38bdf8"
                      : "rgba(56,189,248,0.42)"
                  }
                  className="cursor-pointer transition-opacity"
                  onClick={() => setSelectedIdx(i)}
                />
              );
            })
          ) : (
            <>
              <path d={areaPath} fill="url(#chartFill)" />
              <path
                d={primaryPath}
                fill="none"
                stroke={mode === "pressure" ? "#a78bfa" : "#ff8a3c"}
                strokeWidth={2.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {(mode === "temp" || mode === "wind") && (
                <path
                  d={linePath(secondarySeries)}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                />
              )}
            </>
          )}

          {/* Etkileşim noktaları ve saat etiketleri */}
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
                  r={isSel ? 5.5 : 3}
                  fill={isSel ? "#ff8a3c" : "#f5f7ff"}
                  stroke={isSel ? "#ffffff" : "transparent"}
                  strokeWidth={2}
                />
                {i % 3 === 0 && (
                  <text
                    x={x}
                    y={height - 6}
                    textAnchor="middle"
                    fill="rgba(245,247,255,0.55)"
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
