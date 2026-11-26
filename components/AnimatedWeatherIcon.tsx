"use client";

import { memo } from "react";

/**
 * ATMOS 4.0 — Saf SVG + GPU CSS Animasyonlu Meteoroloji İkon Seti
 * WMO kodlarına ve gündüz/gece fazına göre canlı hareket eder.
 */
function AnimatedWeatherIconBase({
  code,
  isNight = false,
  className = "h-6 w-6"
}: {
  code: number;
  isNight?: boolean;
  className?: string;
}) {
  // Oraj / Gök Gürültülü Fırtına (95–99)
  if (code >= 95) {
    return (
      <svg viewBox="0 0 32 32" className={`shrink-0 ${className}`} aria-hidden="true">
        <g style={{ animation: "atmosCloudFloat 4.2s ease-in-out infinite" }}>
          <path
            d="M9 19h14.5a4.5 4.5 0 0 0 .8-8.9A6.2 6.2 0 0 0 12.2 8.8 4.8 4.8 0 0 0 9 19Z"
            fill="rgba(148, 163, 184, 0.25)"
            stroke="#cbd5e1"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </g>
        <path
          d="M17.2 17.5 13.4 23.2h3.1l-1.3 5.2 5.2-6.5h-3.2l1.4-4.4Z"
          fill="#fbbf24"
          stroke="#fef3c7"
          strokeWidth="0.6"
          strokeLinejoin="round"
          style={{ animation: "atmosBoltFlash 2.6s ease-in-out infinite" }}
        />
      </svg>
    );
  }

  // Kar & Kar Sağanağı (71–77, 85–86)
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return (
      <svg viewBox="0 0 32 32" className={`shrink-0 ${className}`} aria-hidden="true">
        <g style={{ animation: "atmosCloudFloat 4.6s ease-in-out infinite" }}>
          <path
            d="M9 18.5h14.5a4.4 4.4 0 0 0 .7-8.7 6 6 0 0 0-11.8-1.2 4.7 4.7 0 0 0-3.4 9.9Z"
            fill="rgba(226, 232, 240, 0.16)"
            stroke="#e2e8f0"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </g>
        {[11, 16, 21].map((cx, idx) => (
          <circle
            key={cx}
            cx={cx}
            cy={21.5}
            r="1.45"
            fill="#e0f2fe"
            style={{
              animation: `atmosSnowFlake 2.1s linear ${(idx * 0.65).toFixed(2)}s infinite`
            }}
          />
        ))}
      </svg>
    );
  }

  // Yağmur / Çiseleme / Sağanak (51–67, 80–82)
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return (
      <svg viewBox="0 0 32 32" className={`shrink-0 ${className}`} aria-hidden="true">
        <g style={{ animation: "atmosCloudFloat 4s ease-in-out infinite" }}>
          <path
            d="M9 18.5h14.5a4.4 4.4 0 0 0 .7-8.7 6 6 0 0 0-11.8-1.2 4.7 4.7 0 0 0-3.4 9.9Z"
            fill="rgba(56, 189, 248, 0.15)"
            stroke="#bae6fd"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </g>
        {[11.5, 16.2, 20.8].map((x, idx) => (
          <line
            key={x}
            x1={x}
            y1="20.5"
            x2={x - 1.2}
            y2="24.5"
            stroke="#38bdf8"
            strokeWidth="1.8"
            strokeLinecap="round"
            style={{
              animation: `atmosRainDrop 1.25s linear ${(idx * 0.36).toFixed(2)}s infinite`
            }}
          />
        ))}
      </svg>
    );
  }

  // Açık / Az Bulutlu (0–1)
  if (code === 0 || code === 1) {
    if (isNight) {
      return (
        <svg viewBox="0 0 32 32" className={`shrink-0 ${className}`} aria-hidden="true">
          <path
            d="M21.8 18.4A7.6 7.6 0 0 1 13.6 9.8a7.4 7.4 0 0 1 .6-2.9A8.4 8.4 0 1 0 24.8 18a7.5 7.5 0 0 1-3 .4Z"
            fill="rgba(165, 196, 255, 0.28)"
            stroke="#c7d8ff"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle
            cx="23.5"
            cy="9.2"
            r="1.15"
            fill="#e0e7ff"
            style={{ animation: "atmosBoltFlash 3.6s ease-in-out infinite" }}
          />
          <circle cx="20.2" cy="6.6" r="0.75" fill="#93c5fd" opacity="0.8" />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 32 32" className={`shrink-0 ${className}`} aria-hidden="true">
        <g
          style={{
            transformOrigin: "16px 16px",
            animation: "atmosSunSpin 22s linear infinite"
          }}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="16"
              y1="4.2"
              x2="16"
              y2="7.2"
              stroke="#fbbf24"
              strokeWidth="1.75"
              strokeLinecap="round"
              transform={`rotate(${deg} 16 16)`}
            />
          ))}
        </g>
        <circle
          cx="16"
          cy="16"
          r="5.6"
          fill="rgba(251, 191, 36, 0.34)"
          stroke="#fcd34d"
          strokeWidth="1.75"
        />
      </svg>
    );
  }

  // Parçalı Bulutlu (2)
  if (code === 2) {
    return (
      <svg viewBox="0 0 32 32" className={`shrink-0 ${className}`} aria-hidden="true">
        {!isNight ? (
          <circle
            cx="12.5"
            cy="12.5"
            r="4.2"
            fill="rgba(251, 191, 36, 0.32)"
            stroke="#fbbf24"
            strokeWidth="1.5"
          />
        ) : (
          <path
            d="M14.5 13.5A4.2 4.2 0 0 1 10.5 9a4.6 4.6 0 1 0 6.2 5.4 4.1 4.1 0 0 1-2.2-.9Z"
            fill="rgba(165, 196, 255, 0.25)"
            stroke="#bfdbfe"
            strokeWidth="1.3"
          />
        )}
        <g style={{ animation: "atmosCloudFloat 4.8s ease-in-out infinite" }}>
          <path
            d="M10.2 22.8h13.6a4 4 0 0 0 .6-7.9 5.5 5.5 0 0 0-10.7-1.1 4.3 4.3 0 0 0-3.5 9Z"
            fill="rgba(203, 213, 225, 0.18)"
            stroke="#e2e8f0"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    );
  }

  // Çok Bulutlu / Sis (3, 45, 48)
  return (
    <svg viewBox="0 0 32 32" className={`shrink-0 ${className}`} aria-hidden="true">
      <g style={{ animation: "atmosCloudFloat 5.2s ease-in-out infinite" }}>
        <path
          d="M8.8 21.5h14.8a4.4 4.4 0 0 0 .7-8.7 6 6 0 0 0-11.8-1.2 4.7 4.7 0 0 0-3.7 9.9Z"
          fill="rgba(148, 163, 184, 0.2)"
          stroke="#cbd5e1"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

const AnimatedWeatherIcon = memo(AnimatedWeatherIconBase);
export default AnimatedWeatherIcon;
