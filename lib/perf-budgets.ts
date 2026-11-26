/**
 * ATMOS v5.0 — Deterministic UI, Canvas & WebGL Performance Primitives
 * File: lib/perf-budgets.ts
 *
 * Pure, side-effect-free calculations for:
 *  1. Zero-GSAP passive scroll camera rig (`computeSkyScrollRig`)
 *  2. Adaptive WebGL DPR hysteresis governor (`computeAdaptiveDpr`)
 *  3. Hourly meteogram viewport windowing (`computeVirtualHourWindow`)
 *  4. 5-bucket wind particle stroke batching & screen-space bilinear projection (`batchWindSegmentsByBucket`)
 */

import type { WindGridBundle } from "./weather-types";

export interface SkyScrollRigTarget {
  progress: number;
  x: number;
  y: number;
  z: number;
}

/**
 * Replaces `129.2 KB` `gsap/ScrollTrigger` in `StormScene` with 0-KB passive scroll math.
 */
export function computeSkyScrollRig(
  scrollY: number,
  viewportHeight: number,
  docScrollHeight: number
): SkyScrollRigTarget {
  const maxScroll = Math.max(1, docScrollHeight - Math.max(1, viewportHeight));
  const p = Math.max(0, Math.min(1, scrollY / maxScroll));
  return {
    progress: p,
    x: (p - 0.5) * 0.7,
    y: 0.65 - p * 0.36,
    z: 3.1 + p * 0.42
  };
}

/**
 * Adaptive WebGL DPR governor with hysteresis so DPR never ping-pongs on borderline GPUs.
 */
export function computeAdaptiveDpr(params: {
  avgFrameMs: number;
  currentDpr: number;
  devicePixelRatio: number;
  maxDpr?: number;
}): number {
  const cap = Math.min(Math.max(1, params.devicePixelRatio || 1), params.maxDpr ?? 1.35);
  if (params.avgFrameMs > 22.5 && params.currentDpr > 1.0) {
    return 1.0;
  }
  if (params.avgFrameMs < 13.5 && params.currentDpr < cap) {
    return Number(cap.toFixed(2));
  }
  return Math.min(cap, params.currentDpr);
}

export interface VirtualHourWindow {
  startIdx: number;
  endIdx: number; // inclusive
  offsetLeftPx: number;
  visibleCount: number;
}

/**
 * Computes the active virtualized column slice `[startIdx..endIdx]` (inclusive)
 * for `HourlyForecastStrip` so off-screen columns & their infinite `@keyframes` are unmounted.
 */
export function computeVirtualHourWindow(params: {
  scrollLeft: number;
  viewportWidth: number;
  totalCount: number;
  colWidth: number;
  overscan?: number;
}): VirtualHourWindow {
  const { totalCount, colWidth } = params;
  if (totalCount <= 0 || colWidth <= 0) {
    return { startIdx: 0, endIdx: -1, offsetLeftPx: 0, visibleCount: 0 };
  }
  const safeViewW = Math.max(colWidth * 6, params.viewportWidth || 960);
  const overscan = params.overscan ?? 6;
  const rawFirst = Math.floor(Math.max(0, params.scrollLeft) / colWidth);
  const rawLast = Math.ceil((Math.max(0, params.scrollLeft) + safeViewW) / colWidth);

  const startIdx = Math.max(0, Math.min(totalCount - 1, rawFirst - overscan));
  const endIdx = Math.max(startIdx, Math.min(totalCount - 1, rawLast + overscan));

  return {
    startIdx,
    endIdx,
    offsetLeftPx: startIdx * colWidth,
    visibleCount: endIdx - startIdx + 1
  };
}

export const WIND_SPEED_BUCKET_COLORS = [
  "rgba(147, 197, 253, 0.58)", // 0: < 12 km/h (Hafif: buz mavisi)
  "rgba(56, 189, 248, 0.72)", // 1: 12..24 km/h (Orta: gök mavisi)
  "rgba(52, 211, 153, 0.80)", // 2: 24..38 km/h (Sertçe: zümrüt)
  "rgba(245, 158, 11, 0.86)", // 3: 38..55 km/h (Kuvvetli: kehribar)
  "rgba(248, 113, 113, 0.92)" // 4: >= 55 km/h (Fırtına: mercan kırmızı)
] as const;

export function classifyWindBucketIndex(speedKmh: number): 0 | 1 | 2 | 3 | 4 {
  if (speedKmh < 12) return 0;
  if (speedKmh < 24) return 1;
  if (speedKmh < 38) return 2;
  if (speedKmh < 55) return 3;
  return 4;
}

export interface WindParticleState {
  x: number;
  y: number;
  age: number;
  maxAge: number;
}

export interface ViewportGeoBounds {
  northLat: number;
  southLat: number;
  westLon: number;
  eastLon: number;
}

function sampleWindFast(
  grid: WindGridBundle,
  lat: number,
  lon: number
): { u: number; v: number; speed: number } {
  const { rows, cols, south, north, west, east, u, v } = grid;
  const latSpan = Math.max(0.0001, north - south);
  const lonSpan = Math.max(0.0001, east - west);

  const fy = Math.max(0, Math.min(rows - 1.0001, ((lat - south) / latSpan) * (rows - 1)));
  const fx = Math.max(0, Math.min(cols - 1.0001, ((lon - west) / lonSpan) * (cols - 1)));

  const r0 = fy | 0;
  const c0 = fx | 0;
  const r1 = r0 + 1 < rows ? r0 + 1 : rows - 1;
  const c1 = c0 + 1 < cols ? c0 + 1 : cols - 1;
  const ty = fy - r0;
  const tx = fx - c0;

  const idx00 = r0 * cols + c0;
  const idx01 = r0 * cols + c1;
  const idx10 = r1 * cols + c0;
  const idx11 = r1 * cols + c1;

  const uTop = u[idx00] * (1 - tx) + u[idx01] * tx;
  const uBot = u[idx10] * (1 - tx) + u[idx11] * tx;
  const uVal = uTop * (1 - ty) + uBot * ty;

  const vTop = v[idx00] * (1 - tx) + v[idx01] * tx;
  const vBot = v[idx10] * (1 - tx) + v[idx11] * tx;
  const vVal = vTop * (1 - ty) + vBot * ty;

  return { u: uVal, v: vVal, speed: Math.hypot(uVal, vVal) };
}

/**
 * Steps all wind particles in O(N) without per-particle inverse-Mercator `atan(exp())`
 * and groups visible line segments `[x0, y0, x1, y1, ...]` into 5 color buckets so
 * Canvas2D executes at most 5 `ctx.stroke()` calls per frame instead of 1,150.
 */
export function stepAndBatchWindParticles(params: {
  particles: WindParticleState[];
  grid: WindGridBundle;
  width: number;
  height: number;
  bounds: ViewportGeoBounds;
  rng?: () => number;
}): [number[], number[], number[], number[], number[]] {
  const { particles, grid, width, height, bounds } = params;
  const rand = params.rng ?? Math.random;
  const buckets: [number[], number[], number[], number[], number[]] = [
    [],
    [],
    [],
    [],
    []
  ];
  if (width <= 0 || height <= 0) return buckets;

  const invW = 1 / width;
  const invH = 1 / height;
  const latSpan = bounds.southLat - bounds.northLat; // y=0 -> northLat, y=height -> southLat
  const lonSpan = bounds.eastLon - bounds.westLon;
  const scale = 0.055;

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if (p.age >= p.maxAge || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
      p.x = rand() * width;
      p.y = rand() * height;
      p.age = 0;
      p.maxAge = 55 + ((rand() * 55) | 0);
      continue;
    }

    const lon = bounds.westLon + p.x * invW * lonSpan;
    const lat = bounds.northLat + p.y * invH * latSpan;
    const { u, v, speed } = sampleWindFast(grid, lat, lon);

    const nx = p.x + u * scale;
    const ny = p.y - v * scale;

    if (speed > 0.4) {
      const bIdx = classifyWindBucketIndex(speed);
      const arr = buckets[bIdx];
      arr.push(p.x, p.y, nx, ny);
    }

    p.x = nx;
    p.y = ny;
    p.age += 1;
  }

  return buckets;
}
