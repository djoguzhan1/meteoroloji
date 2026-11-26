"use client";

import { memo, useEffect } from "react";
import { useWeatherData, useWeatherScrub } from "@/context/WeatherContext";
import { atmosUiSfx } from "@/lib/ui-sfx";

export type AtmosRegimeId =
  | "storm"
  | "frost"
  | "rain-front"
  | "golden"
  | "clear-day"
  | "clear-night";

type RegimePalette = {
  accent: string;
  accentRgb: string;
  secondary: string;
  secondaryRgb: string;
  rimRgb: string;
  glow: string;
  surfaceTint: string;
};

const REGIME_PALETTES: Record<AtmosRegimeId, RegimePalette> = {
  storm: {
    accent: "#7dd3fc",
    accentRgb: "125, 211, 252",
    secondary: "#f59e0b",
    secondaryRgb: "245, 158, 11",
    rimRgb: "186, 230, 253",
    glow: "rgba(56, 189, 248, 0.24)",
    surfaceTint: "rgba(8, 13, 25, 0.78)"
  },
  frost: {
    accent: "#bae6fd",
    accentRgb: "186, 230, 253",
    secondary: "#e2e8f0",
    secondaryRgb: "226, 232, 240",
    rimRgb: "224, 242, 254",
    glow: "rgba(186, 230, 253, 0.22)",
    surfaceTint: "rgba(9, 15, 27, 0.76)"
  },
  "rain-front": {
    accent: "#38bdf8",
    accentRgb: "56, 189, 248",
    secondary: "#67e8f9",
    secondaryRgb: "103, 232, 249",
    rimRgb: "147, 197, 253",
    glow: "rgba(56, 189, 248, 0.22)",
    surfaceTint: "rgba(8, 13, 23, 0.77)"
  },
  golden: {
    accent: "#f6bd60",
    accentRgb: "246, 189, 96",
    secondary: "#fb923c",
    secondaryRgb: "251, 146, 60",
    rimRgb: "253, 213, 152",
    glow: "rgba(246, 189, 96, 0.22)",
    surfaceTint: "rgba(16, 12, 18, 0.74)"
  },
  "clear-day": {
    accent: "#56ccf2",
    accentRgb: "86, 204, 242",
    secondary: "#fbbf24",
    secondaryRgb: "251, 191, 36",
    rimRgb: "191, 235, 255",
    glow: "rgba(86, 204, 242, 0.20)",
    surfaceTint: "rgba(9, 15, 26, 0.72)"
  },
  "clear-night": {
    accent: "#7da5ff",
    accentRgb: "125, 165, 255",
    secondary: "#38bdf8",
    secondaryRgb: "56, 189, 248",
    rimRgb: "165, 196, 255",
    glow: "rgba(125, 165, 255, 0.20)",
    surfaceTint: "rgba(7, 11, 21, 0.78)"
  }
};

export function resolveAtmosRegime(input: {
  isStorm: boolean;
  precipType: "none" | "rain" | "snow";
  cloudCover: number;
  solarElevationDeg: number;
  tempC?: number | null;
  stormScore?: number;
}): AtmosRegimeId {
  if (input.isStorm || (input.stormScore ?? 0) >= 52) return "storm";
  if (
    input.precipType === "snow" ||
    (input.tempC !== null && input.tempC !== undefined && input.tempC <= 1.2)
  ) {
    return "frost";
  }
  if (input.precipType === "rain") return "rain-front";
  if (
    input.solarElevationDeg >= -7 &&
    input.solarElevationDeg <= 15 &&
    input.cloudCover < 80
  ) {
    return "golden";
  }
  if (input.solarElevationDeg > 15 && input.cloudCover < 78) return "clear-day";
  if (input.cloudCover >= 78) return "rain-front";
  return "clear-night";
}

/**
 * 1) Canlı atmosfer rejimini yalnızca rejim gerçekten değiştiğinde :root'a yazar.
 * 2) Geometri önbellekli (0 layout-thrashing) pointer spotlight takipçisi çalıştırır.
 */
function WeatherThemeSyncBase() {
  const { bundle, audioEnabled } = useWeatherData();
  const { atmosphere, frameIndex } = useWeatherScrub();

  useEffect(() => {
    atmosUiSfx.setEnabled(audioEnabled);
  }, [audioEnabled]);

  useEffect(() => {
    const activeHour = bundle && frameIndex > 0 ? bundle.hourly[frameIndex] : null;
    const tempC = activeHour ? activeHour.temperature : bundle?.current.temperature ?? null;
    const stormScore = activeHour
      ? activeHour.stormScore ?? 0
      : bundle?.storm?.score ?? bundle?.current.stormScore ?? 0;

    const regime = resolveAtmosRegime({
      isStorm: atmosphere.isStorm,
      precipType: atmosphere.precipType,
      cloudCover: atmosphere.cloudCover,
      solarElevationDeg: atmosphere.solarElevationDeg,
      tempC,
      stormScore
    });

    const root = document.documentElement;
    if (root.dataset.atmosRegime === regime) return;

    const pal = REGIME_PALETTES[regime];
    root.dataset.atmosRegime = regime;
    root.style.setProperty("--atmos-accent", pal.accent);
    root.style.setProperty("--atmos-accent-rgb", pal.accentRgb);
    root.style.setProperty("--atmos-secondary", pal.secondary);
    root.style.setProperty("--atmos-secondary-rgb", pal.secondaryRgb);
    root.style.setProperty("--atmos-rim-rgb", pal.rimRgb);
    root.style.setProperty("--atmos-glow", pal.glow);
    root.style.setProperty("--atmos-surface-tint", pal.surfaceTint);
  }, [atmosphere, bundle, frameIndex]);

  // Zero-Reflow Delegated Pointer Spotlight (caches rects per active element; invalidates passively on scroll/resize)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const coarse = window.matchMedia?.("(pointer: coarse)").matches;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (coarse || reduced) return;

    let raf = 0;
    let lastX = 0;
    let lastY = 0;
    let lastTarget: EventTarget | null = null;
    let activePanel: HTMLElement | null = null;
    let activeTile: HTMLElement | null = null;
    let panelRect: DOMRect | null = null;
    let tileRect: DOMRect | null = null;
    let rectsDirty = true;

    const markRectsDirty = () => {
      rectsDirty = true;
    };

    const updateSpot = () => {
      raf = 0;
      const el = lastTarget instanceof HTMLElement ? lastTarget : null;
      const panel = el?.closest<HTMLElement>(".surface-panel") ?? null;
      const tile = el?.closest<HTMLElement>(".surface-tile, .atmos-btn") ?? null;

      if (activePanel && activePanel !== panel) {
        activePanel.style.setProperty("--spot-o", "0");
      }
      if (activeTile && activeTile !== tile) {
        activeTile.style.setProperty("--spot-o", "0");
      }

      if (panel !== activePanel || rectsDirty) {
        panelRect = panel ? panel.getBoundingClientRect() : null;
      }
      if (tile !== activeTile || rectsDirty) {
        tileRect = tile ? tile.getBoundingClientRect() : null;
      }
      rectsDirty = false;

      if (panel && panelRect) {
        panel.style.setProperty("--mx", `${Math.round(lastX - panelRect.left)}px`);
        panel.style.setProperty("--my", `${Math.round(lastY - panelRect.top)}px`);
        if (activePanel !== panel) panel.style.setProperty("--spot-o", "1");
      }

      if (tile && tileRect) {
        tile.style.setProperty("--mx", `${Math.round(lastX - tileRect.left)}px`);
        tile.style.setProperty("--my", `${Math.round(lastY - tileRect.top)}px`);
        if (activeTile !== tile) tile.style.setProperty("--spot-o", "1");
      }

      activePanel = panel;
      activeTile = tile;
    };

    const onPointerMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      lastTarget = e.target;
      if (!raf) {
        raf = window.requestAnimationFrame(updateSpot);
      }
    };

    const onPointerLeave = () => {
      if (activePanel) activePanel.style.setProperty("--spot-o", "0");
      if (activeTile) activeTile.style.setProperty("--spot-o", "0");
      activePanel = null;
      activeTile = null;
      panelRect = null;
      tileRect = null;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", markRectsDirty, { passive: true, capture: true });
    window.addEventListener("resize", markRectsDirty, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", markRectsDirty, true);
      window.removeEventListener("resize", markRectsDirty);
      document.removeEventListener("mouseleave", onPointerLeave);
    };
  }, []);

  return null;
}

const WeatherThemeSync = memo(WeatherThemeSyncBase);
export default WeatherThemeSync;
