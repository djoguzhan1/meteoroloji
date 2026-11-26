"use client";

import { CSSProperties, memo } from "react";
import {
  computeIconPhaseDelaySec,
  resolveWeatherGlyphKind
} from "@/lib/hourly-meteogram";
import type { PrecipPhase } from "@/lib/weather-types";

export interface AnimatedWeatherIconProps {
  code: number;
  isNight?: boolean;
  precipPhase?: PrecipPhase;
  intensityMm?: number;
  windSpeedKmh?: number;
  phaseSeed?: number;
  animated?: boolean;
  className?: string;
}

/**
 * Çift derinlikli optik bulut katmanı:
 * Arka atmosferik kütle + ön ana kütle + ince speküler sırt ışığı.
 */
function LayeredCloud({
  fillFront,
  strokeFront,
  fillBack = "rgba(148, 163, 184, 0.14)",
  strokeBack = "rgba(148, 163, 184, 0.38)",
  yOffset = 0
}: {
  fillFront: string;
  strokeFront: string;
  fillBack?: string;
  strokeBack?: string;
  yOffset?: number;
}) {
  return (
    <g transform={yOffset !== 0 ? `translate(0 ${yOffset})` : undefined}>
      <g className="atmos-glyph-cloud-back">
        <path
          d="M12.6 16.6h10.8a3.4 3.4 0 0 0 .5-6.7 4.7 4.7 0 0 0-9.1-.9 3.6 3.6 0 0 0-2.2 7.6Z"
          fill={fillBack}
          stroke={strokeBack}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </g>
      <g className="atmos-glyph-cloud-front">
        <path
          d="M8.4 19.2h14.6a4.3 4.3 0 0 0 .7-8.5 5.9 5.9 0 0 0-11.5-1.2 4.5 4.5 0 0 0-3.8 9.7Z"
          fill={fillFront}
          stroke={strokeFront}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M11.6 9.8a4.7 4.7 0 0 1 7.6-.5"
          fill="none"
          stroke="rgba(255, 255, 255, 0.45)"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

function SunDisc({ cx = 16, cy = 16, r = 5.4 }: { cx?: number; cy?: number; r?: number }) {
  const rayIn = r + 2.1;
  const rayOut = r + 4.6;
  return (
    <g>
      <g
        className="atmos-glyph-sun-rays"
        style={{ transformOrigin: `${cx}px ${cy}px` }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1={cx}
            y1={cy - rayOut}
            x2={cx}
            y2={cy - rayIn}
            stroke="#fbbf24"
            strokeWidth="1.55"
            strokeLinecap="round"
            transform={`rotate(${deg} ${cx} ${cy})`}
          />
        ))}
      </g>
      <circle
        cx={cx}
        cy={cy}
        r={r + 1.8}
        fill="rgba(251, 191, 36, 0.14)"
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="rgba(251, 191, 36, 0.36)"
        stroke="#fde68a"
        strokeWidth="1.55"
      />
    </g>
  );
}

function LunarCrescent({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <path
        d="M15.2 13.8A4.4 4.4 0 0 1 11 9.1a4.8 4.8 0 1 0 6.5 5.6 4.3 4.3 0 0 1-2.3-.9Z"
        fill="rgba(165, 196, 255, 0.28)"
        stroke="#c7d8ff"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
    );
  }
  return (
    <g>
      <path
        d="M21.8 18.6A7.5 7.5 0 0 1 13.7 10a7.3 7.3 0 0 1 .6-2.9A8.3 8.3 0 1 0 24.8 18.2a7.4 7.4 0 0 1-3 .4Z"
        fill="rgba(165, 196, 255, 0.28)"
        stroke="#dbeafe"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <circle
        cx="23.6"
        cy="9.0"
        r="1.15"
        fill="#e0e7ff"
        className="atmos-glyph-star-twinkle"
      />
      <circle
        cx="19.8"
        cy="6.4"
        r="0.8"
        fill="#93c5fd"
        opacity="0.82"
      />
    </g>
  );
}

function SixPointCrystal({ cx, cy, size = 1.9, stroke = "#e0f2fe" }: { cx: number; cy: number; size?: number; stroke?: string }) {
  const dx = size * 0.866;
  const dy = size * 0.5;
  return (
    <g stroke={stroke} strokeWidth="1.2" strokeLinecap="round">
      <line x1={cx} y1={cy - size} x2={cx} y2={cy + size} />
      <line x1={cx - dx} y1={cy - dy} x2={cx + dx} y2={cy + dy} />
      <line x1={cx - dx} y1={cy + dy} x2={cx + dx} y2={cy - dy} />
    </g>
  );
}

/**
 * ATMOS v5.0 — 17 Varyantlı Çok Katmanlı Vektör Meteoroloji İkon Seti
 * Saf SVG + GPU transform/opacity sınıfları; faz kaymalı ve prefers-reduced-motion uyumlu.
 */
function AnimatedWeatherIconBase({
  code,
  isNight = false,
  precipPhase,
  intensityMm = 0,
  windSpeedKmh = 0,
  phaseSeed = 0,
  animated = true,
  className = "h-6 w-6"
}: AnimatedWeatherIconProps) {
  const svgCls = `shrink-0 ${animated ? "" : "atmos-glyph-paused "}${className}`;
  const kind = resolveWeatherGlyphKind({
    code,
    isNight,
    precipPhase,
    intensityMm,
    windSpeedKmh
  });

  const phaseStyle = {
    "--icon-delay": computeIconPhaseDelaySec(phaseSeed)
  } as CSSProperties;

  switch (kind) {
    case "clear-day":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <SunDisc />
        </svg>
      );

    case "clear-night":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <LunarCrescent />
        </svg>
      );

    case "mainly-clear-day":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <SunDisc cx={14.5} cy={13.5} r={4.5} />
          <g className="atmos-glyph-cloud-front">
            <path
              d="M11.5 22.2h12.8"
              stroke="#e2e8f0"
              strokeWidth="1.55"
              strokeLinecap="round"
            />
            <path
              d="M15.2 25.0h8.4"
              stroke="rgba(203, 213, 225, 0.72)"
              strokeWidth="1.35"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    case "mainly-clear-night":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <LunarCrescent />
          <g className="atmos-glyph-cloud-front">
            <path
              d="M8.5 23.2h13.5"
              stroke="rgba(199, 216, 255, 0.85)"
              strokeWidth="1.45"
              strokeLinecap="round"
            />
            <path
              d="M12.5 25.8h8.8"
              stroke="rgba(148, 163, 184, 0.65)"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </g>
        </svg>
      );

    case "partly-cloudy-day":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <SunDisc cx={11.8} cy={11.5} r={3.9} />
          <LayeredCloud
            fillFront="rgba(226, 232, 240, 0.20)"
            strokeFront="#f1f5f9"
            yOffset={3.2}
          />
        </svg>
      );

    case "partly-cloudy-night":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <LunarCrescent compact />
          <LayeredCloud
            fillFront="rgba(186, 206, 235, 0.20)"
            strokeFront="#dbeafe"
            yOffset={3.2}
          />
        </svg>
      );

    case "fog":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <path
            d="M8.8 14.2a6.4 6.4 0 0 1 12.2-1.8 4.2 4.2 0 0 1 3.2 4.1"
            fill="none"
            stroke="rgba(203, 213, 225, 0.55)"
            strokeWidth="1.45"
            strokeLinecap="round"
          />
          <line
            x1="6.5"
            y1="18.2"
            x2="25.5"
            y2="18.2"
            stroke="#cbd5e1"
            strokeWidth="1.7"
            strokeLinecap="round"
            className="atmos-glyph-fog-1"
          />
          <line
            x1="8.5"
            y1="22.0"
            x2="23.8"
            y2="22.0"
            stroke="rgba(203, 213, 225, 0.82)"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="atmos-glyph-fog-2"
          />
          <line
            x1="10.5"
            y1="25.6"
            x2="21.5"
            y2="25.6"
            stroke="rgba(148, 163, 184, 0.65)"
            strokeWidth="1.45"
            strokeLinecap="round"
            className="atmos-glyph-fog-1"
          />
        </svg>
      );

    case "drizzle":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <LayeredCloud
            fillFront="rgba(125, 211, 252, 0.14)"
            strokeFront="#bae6fd"
          />
          {[11.5, 16.2, 20.8].map((x, idx) => (
            <line
              key={x}
              x1={x}
              y1="21.2"
              x2={x - 0.8}
              y2="23.6"
              stroke="#7dd3fc"
              strokeWidth="1.55"
              strokeLinecap="round"
              className="atmos-glyph-drizzle"
              style={{ animationDelay: `calc(var(--icon-delay, 0s) - ${(idx * 0.45).toFixed(2)}s)` }}
            />
          ))}
        </svg>
      );

    case "rain":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <LayeredCloud
            fillFront="rgba(56, 189, 248, 0.17)"
            strokeFront="#bae6fd"
          />
          {[11.2, 16.0, 20.8].map((x, idx) => (
            <line
              key={x}
              x1={x}
              y1="20.6"
              x2={x - 1.4}
              y2="25.2"
              stroke="#38bdf8"
              strokeWidth="1.75"
              strokeLinecap="round"
              className="atmos-glyph-rain"
              style={{ animationDelay: `calc(var(--icon-delay, 0s) - ${(idx * 0.36).toFixed(2)}s)` }}
            />
          ))}
        </svg>
      );

    case "heavy-rain":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <LayeredCloud
            fillFront="rgba(14, 165, 233, 0.24)"
            strokeFront="#e0f2fe"
            fillBack="rgba(56, 189, 248, 0.18)"
          />
          {[9.8, 13.8, 17.8, 21.8].map((x, idx) => (
            <line
              key={x}
              x1={x}
              y1="20.3"
              x2={x - 2.0}
              y2="26.3"
              stroke={idx % 2 === 0 ? "#38bdf8" : "#7dd3fc"}
              strokeWidth="1.85"
              strokeLinecap="round"
              className="atmos-glyph-downpour"
              style={{ animationDelay: `calc(var(--icon-delay, 0s) - ${(idx * 0.21).toFixed(2)}s)` }}
            />
          ))}
        </svg>
      );

    case "freezing-rain":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <LayeredCloud
            fillFront="rgba(251, 191, 36, 0.16)"
            strokeFront="#fde68a"
            fillBack="rgba(56, 189, 248, 0.16)"
          />
          <line
            x1="11.2"
            y1="20.8"
            x2="9.8"
            y2="25.2"
            stroke="#38bdf8"
            strokeWidth="1.75"
            strokeLinecap="round"
            className="atmos-glyph-rain"
          />
          <g className="atmos-glyph-snow">
            <SixPointCrystal cx={16.5} cy={23.2} size={2.0} stroke="#fbbf24" />
          </g>
          <path
            d="M19.8 25.6c1.1-1.3 2.7-1.3 3.8 0"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case "sleet":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <LayeredCloud
            fillFront="rgba(45, 212, 191, 0.17)"
            strokeFront="#ccfbf1"
          />
          <line
            x1="11.4"
            y1="20.6"
            x2="10.0"
            y2="25.0"
            stroke="#38bdf8"
            strokeWidth="1.7"
            strokeLinecap="round"
            className="atmos-glyph-rain"
          />
          <g
            className="atmos-glyph-snow"
            style={{ animationDelay: "calc(var(--icon-delay, 0s) - 0.5s)" }}
          >
            <SixPointCrystal cx={16.4} cy={23.2} size={1.95} stroke="#e0f2fe" />
          </g>
          <line
            x1="21.4"
            y1="20.6"
            x2="20.0"
            y2="25.0"
            stroke="#2dd4bf"
            strokeWidth="1.7"
            strokeLinecap="round"
            className="atmos-glyph-rain"
            style={{ animationDelay: "calc(var(--icon-delay, 0s) - 0.35s)" }}
          />
        </svg>
      );

    case "snow":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <LayeredCloud
            fillFront="rgba(226, 232, 240, 0.18)"
            strokeFront="#f1f5f9"
          />
          {[11.2, 16.2, 21.0].map((cx, idx) => (
            <g
              key={cx}
              className="atmos-glyph-snow"
              style={{ animationDelay: `calc(var(--icon-delay, 0s) - ${(idx * 0.65).toFixed(2)}s)` }}
            >
              <SixPointCrystal cx={cx} cy={22.8} size={1.75} stroke="#e0f2fe" />
            </g>
          ))}
        </svg>
      );

    case "heavy-snow":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <LayeredCloud
            fillFront="rgba(241, 245, 249, 0.25)"
            strokeFront="#ffffff"
          />
          {[10.0, 14.4, 18.8, 22.6].map((cx, idx) => (
            <g
              key={cx}
              className="atmos-glyph-blizzard"
              style={{ animationDelay: `calc(var(--icon-delay, 0s) - ${(idx * 0.32).toFixed(2)}s)` }}
            >
              <SixPointCrystal cx={cx} cy={22.6 + (idx % 2) * 1.6} size={1.85} stroke="#f8fafc" />
            </g>
          ))}
        </svg>
      );

    case "thunderstorm":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <LayeredCloud
            fillFront="rgba(100, 116, 139, 0.34)"
            strokeFront="#cbd5e1"
            fillBack="rgba(71, 85, 105, 0.28)"
          />
          <line
            x1="10.8"
            y1="20.8"
            x2="9.5"
            y2="25.0"
            stroke="#38bdf8"
            strokeWidth="1.55"
            strokeLinecap="round"
            className="atmos-glyph-rain"
          />
          <path
            d="M17.4 17.4 13.5 23.1h3.1l-1.3 5.2 5.3-6.5h-3.2l1.4-4.4Z"
            fill="#fbbf24"
            stroke="#fef3c7"
            strokeWidth="0.65"
            strokeLinejoin="round"
            className="atmos-glyph-bolt"
          />
        </svg>
      );

    case "hail-storm":
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <LayeredCloud
            fillFront="rgba(100, 116, 139, 0.36)"
            strokeFront="#e2e8f0"
          />
          <path
            d="M16.8 17.4 13.2 22.8h2.9l-1.2 4.8 4.9-6.0h-3.0l1.3-4.2Z"
            fill="#fbbf24"
            stroke="#fef3c7"
            strokeWidth="0.6"
            strokeLinejoin="round"
            className="atmos-glyph-bolt"
          />
          {[10.4, 21.6].map((cx, idx) => (
            <polygon
              key={cx}
              points={`${cx},21.2 ${cx + 1.7},22.9 ${cx},24.6 ${cx - 1.7},22.9`}
              fill="#fda4af"
              stroke="#ffe4e6"
              strokeWidth="0.7"
              className="atmos-glyph-hail"
              style={{ animationDelay: `calc(var(--icon-delay, 0s) - ${(idx * 0.42).toFixed(2)}s)` }}
            />
          ))}
        </svg>
      );

    case "overcast":
    default:
      return (
        <svg
          viewBox="0 0 32 32"
          style={phaseStyle}
          className={svgCls}
          aria-hidden="true"
        >
          <LayeredCloud
            fillFront="rgba(148, 163, 184, 0.24)"
            strokeFront="#cbd5e1"
            fillBack="rgba(100, 116, 139, 0.24)"
            yOffset={1.8}
          />
        </svg>
      );
  }
}

const AnimatedWeatherIcon = memo(AnimatedWeatherIconBase);
export default AnimatedWeatherIcon;
