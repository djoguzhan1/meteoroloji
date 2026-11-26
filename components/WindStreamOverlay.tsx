"use client";

import { memo, useEffect, useRef } from "react";
import {
  stepAndBatchWindParticles,
  WIND_SPEED_BUCKET_COLORS,
  type WindParticleState
} from "@/lib/perf-budgets";
import type { WindGridBundle } from "@/lib/weather-types";

function WindStreamOverlayBase({
  grid,
  width,
  height,
  screenToLatLon
}: {
  grid: WindGridBundle | null;
  width: number;
  height: number;
  screenToLatLon: (x: number, y: number) => { lat: number; lon: number };
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gridRef = useRef<WindGridBundle | null>(grid);
  const boundsRef = useRef({
    northLat: 42,
    southLat: 38,
    westLon: 26,
    eastLon: 32
  });

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  // Precompute viewport geo bounds once per pan/zoom instead of 1,150 inverse-Mercator calls per frame!
  useEffect(() => {
    if (width <= 0 || height <= 0) return;
    const nw = screenToLatLon(0, 0);
    const se = screenToLatLon(width, height);
    let eastLon = se.lon;
    const westLon = nw.lon;
    if (eastLon < westLon) eastLon += 360;
    boundsRef.current = {
      northLat: nw.lat,
      southLat: se.lat,
      westLon,
      eastLon
    };
  }, [screenToLatLon, width, height]);

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

    const particleCount = Math.min(900, Math.max(380, Math.round((width * height) / 520)));
    const spawn = (): WindParticleState => ({
      x: Math.random() * width,
      y: Math.random() * height,
      age: Math.floor(Math.random() * 65),
      maxAge: 55 + Math.floor(Math.random() * 55)
    });

    const particles: WindParticleState[] = Array.from({ length: particleCount }, spawn);
    let rafId = 0;

    const tick = () => {
      if (document.visibilityState === "hidden") {
        rafId = window.requestAnimationFrame(tick);
        return;
      }

      const activeGrid = gridRef.current;
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = "rgba(0, 0, 0, 0.90)";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      if (activeGrid) {
        const buckets = stepAndBatchWindParticles({
          particles,
          grid: activeGrid,
          width,
          height,
          bounds: boundsRef.current
        });

        ctx.lineWidth = 1.35;
        ctx.lineCap = "round";

        // At most 5 batched ctx.stroke() calls per frame (instead of 1,150 individual strokes!)
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

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [width, height]);

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
