"use client";

import { memo, useEffect, useRef } from "react";
import {
  latToMercatorY,
  stepAndBatchWindParticles,
  WIND_SPEED_BUCKET_COLORS,
  type ViewportGeoBounds,
  type WindParticleState
} from "@/lib/perf-budgets";
import type { WindGridBundle } from "@/lib/weather-types";

function WindStreamOverlayBase({
  grid,
  width,
  height,
  zoom,
  isInteracting = false,
  screenToLatLon
}: {
  grid: WindGridBundle | null;
  width: number;
  height: number;
  zoom: number;
  isInteracting?: boolean;
  screenToLatLon: (x: number, y: number) => { lat: number; lon: number };
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gridRef = useRef<WindGridBundle | null>(grid);
  const zoomRef = useRef<number>(zoom);
  const interactingRef = useRef<boolean>(isInteracting);
  const particlesRef = useRef<WindParticleState[]>([]);
  const clearRequestedRef = useRef<boolean>(false);
  const boundsRef = useRef<ViewportGeoBounds>({
    northLat: 42,
    southLat: 38,
    westLon: 26,
    eastLon: 32
  });
  const prevBoundsRef = useRef<{ bounds: ViewportGeoBounds; zoom: number } | null>(null);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    interactingRef.current = isInteracting;
  }, [isInteracting]);

  // Precompute viewport geo bounds on pan/zoom; reproject existing particles & request trail clear
  // so stale screen-space trails never float over wrong cities!
  useEffect(() => {
    if (width <= 0 || height <= 0) return;
    const nw = screenToLatLon(0, 0);
    const se = screenToLatLon(width, height);
    let eastLon = se.lon;
    const westLon = nw.lon;
    if (eastLon < westLon) eastLon += 360;

    const nextBounds: ViewportGeoBounds = {
      northLat: nw.lat,
      southLat: se.lat,
      westLon,
      eastLon
    };

    const prev = prevBoundsRef.current;
    if (
      prev &&
      (Math.abs(prev.bounds.northLat - nextBounds.northLat) > 1e-4 ||
        Math.abs(prev.bounds.southLat - nextBounds.southLat) > 1e-4 ||
        Math.abs(prev.bounds.westLon - nextBounds.westLon) > 1e-4 ||
        prev.zoom !== zoom)
    ) {
      clearRequestedRef.current = true;
      const pts = particlesRef.current;
      const prevLonSpan = prev.bounds.eastLon - prev.bounds.westLon;
      const nextLonSpan = Math.max(1e-5, nextBounds.eastLon - nextBounds.westLon);
      const prevNorthM = latToMercatorY(prev.bounds.northLat);
      const prevMercSpan = latToMercatorY(prev.bounds.southLat) - prevNorthM;
      const nextNorthM = latToMercatorY(nextBounds.northLat);
      const nextMercSpan = latToMercatorY(nextBounds.southLat) - nextNorthM;

      if (pts.length > 0 && Math.abs(nextMercSpan) > 1e-6) {
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          const lon = prev.bounds.westLon + (p.x / width) * prevLonSpan;
          const mercY = prevNorthM + (p.y / height) * prevMercSpan;
          const nx = ((lon - nextBounds.westLon) / nextLonSpan) * width;
          const ny = ((mercY - nextNorthM) / nextMercSpan) * height;
          if (nx >= 0 && nx <= width && ny >= 0 && ny <= height) {
            p.x = nx;
            p.y = ny;
          } else {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.age = 0;
          }
        }
      }
    }

    boundsRef.current = nextBounds;
    prevBoundsRef.current = { bounds: nextBounds, zoom };
  }, [screenToLatLon, width, height, zoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const particleCount = Math.min(780, Math.max(320, Math.round((width * height) / 620)));
    const spawn = (): WindParticleState => ({
      x: Math.random() * width,
      y: Math.random() * height,
      age: Math.floor(Math.random() * 90),
      maxAge: 90 + Math.floor(Math.random() * 75)
    });

    const particles: WindParticleState[] = Array.from({ length: particleCount }, spawn);
    particlesRef.current = particles;

    const reducedMotionMql =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    let prefersReducedMotion = Boolean(reducedMotionMql?.matches);

    const drawStaticSnapshot = () => {
      ctx.clearRect(0, 0, width, height);
      const activeGrid = gridRef.current;
      if (!activeGrid) return;
      const staticPts: WindParticleState[] = particles.map((p) => ({
        ...p,
        age: 0,
        maxAge: 120
      }));
      const buckets = stepAndBatchWindParticles({
        particles: staticPts,
        grid: activeGrid,
        width,
        height,
        bounds: boundsRef.current,
        dtSec: 0.28,
        zoom: zoomRef.current
      });
      ctx.lineWidth = 1.35;
      ctx.lineCap = "round";
      for (let b = 0; b < 5; b++) {
        const segs = buckets[b];
        if (segs.length === 0) continue;
        ctx.beginPath();
        ctx.strokeStyle = WIND_SPEED_BUCKET_COLORS[b];
        for (let j = 0; j < segs.length; j += 4) {
          ctx.moveTo(segs[j], segs[j + 1]);
          ctx.lineTo(segs[j + 2], segs[j + 3]);
        }
        ctx.stroke();
      }
    };

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      rafId = 0;
      if (document.visibilityState === "hidden" || prefersReducedMotion) {
        return;
      }

      const dtSec = Math.max(0.004, Math.min(0.05, (now - lastTime) / 1000));
      lastTime = now;

      if (clearRequestedRef.current) {
        clearRequestedRef.current = false;
        ctx.clearRect(0, 0, width, height);
      } else {
        // Time-invariant exponential trail decay capped at 0.945 so 8-bit Canvas alpha strictly reaches 0
        const baseFade = interactingRef.current ? 0.78 : 0.91;
        const keepAlpha = Math.min(0.945, Math.pow(baseFade, dtSec * 60));
        ctx.globalCompositeOperation = "destination-in";
        ctx.fillStyle = `rgba(0, 0, 0, ${keepAlpha.toFixed(3)})`;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
      }

      const activeGrid = gridRef.current;
      if (activeGrid) {
        const buckets = stepAndBatchWindParticles({
          particles,
          grid: activeGrid,
          width,
          height,
          bounds: boundsRef.current,
          dtSec,
          zoom: zoomRef.current
        });

        ctx.lineWidth = 1.3;
        ctx.lineCap = "round";

        for (let b = 0; b < 5; b++) {
          const segs = buckets[b];
          if (segs.length === 0) continue;
          ctx.beginPath();
          ctx.strokeStyle = WIND_SPEED_BUCKET_COLORS[b];
          for (let j = 0; j < segs.length; j += 4) {
            ctx.moveTo(segs[j], segs[j + 1]);
            ctx.lineTo(segs[j + 2], segs[j + 3]);
          }
          ctx.stroke();
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const startLoopIfEligible = () => {
      if (prefersReducedMotion) {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
        drawStaticSnapshot();
        return;
      }
      if (document.visibilityState === "visible" && !rafId) {
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
      } else {
        startLoopIfEligible();
      }
    };

    const handleMotionChange = (ev: MediaQueryListEvent) => {
      prefersReducedMotion = ev.matches;
      startLoopIfEligible();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    reducedMotionMql?.addEventListener?.("change", handleMotionChange);
    startLoopIfEligible();

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      reducedMotionMql?.removeEventListener?.("change", handleMotionChange);
    };
  }, [width, height]);

  // Refresh static vector snapshot when grid or viewport changes in reduced-motion mode
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !grid || width <= 0 || height <= 0) return;

    ctx.clearRect(0, 0, width, height);
    const staticPts: WindParticleState[] = particlesRef.current.map((p) => ({
      ...p,
      age: 0,
      maxAge: 120
    }));
    const buckets = stepAndBatchWindParticles({
      particles: staticPts,
      grid,
      width,
      height,
      bounds: boundsRef.current,
      dtSec: 0.28,
      zoom
    });
    ctx.lineWidth = 1.35;
    ctx.lineCap = "round";
    for (let b = 0; b < 5; b++) {
      const segs = buckets[b];
      if (segs.length === 0) continue;
      ctx.beginPath();
      ctx.strokeStyle = WIND_SPEED_BUCKET_COLORS[b];
      for (let j = 0; j < segs.length; j += 4) {
        ctx.moveTo(segs[j], segs[j + 1]);
        ctx.lineTo(segs[j + 2], segs[j + 3]);
      }
      ctx.stroke();
    }
  }, [grid, width, height, zoom, screenToLatLon]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
      className="pointer-events-none absolute inset-0 block"
      aria-hidden="true"
    />
  );
}

const WindStreamOverlay = memo(WindStreamOverlayBase);
export default WindStreamOverlay;
