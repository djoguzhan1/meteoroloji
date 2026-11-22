"use client";

import { useEffect, useRef } from "react";
import type { WindGridBundle } from "@/lib/weather-types";

type Particle = {
  x: number;
  y: number;
  age: number;
  maxAge: number;
};

function speedToColor(speedKmh: number): string {
  if (speedKmh < 12) return "rgba(147, 197, 253, 0.58)"; // Hafif: buz mavisi
  if (speedKmh < 24) return "rgba(56, 189, 248, 0.72)"; // Orta: gök mavisi
  if (speedKmh < 38) return "rgba(52, 211, 153, 0.80)"; // Sertçe: zümrüt
  if (speedKmh < 55) return "rgba(245, 158, 11, 0.86)"; // Kuvvetli: kehribar
  return "rgba(248, 113, 113, 0.92)"; // Fırtına: mercan kırmızı
}

function sampleWindAt(
  grid: WindGridBundle,
  lat: number,
  lon: number
): { u: number; v: number; speed: number } {
  const { rows, cols, south, north, west, east, u, v } = grid;
  const latSpan = Math.max(0.0001, north - south);
  const lonSpan = Math.max(0.0001, east - west);

  const fy = Math.max(0, Math.min(rows - 1.0001, ((lat - south) / latSpan) * (rows - 1)));
  const fx = Math.max(0, Math.min(cols - 1.0001, ((lon - west) / lonSpan) * (cols - 1)));

  const r0 = Math.floor(fy);
  const c0 = Math.floor(fx);
  const r1 = Math.min(rows - 1, r0 + 1);
  const c1 = Math.min(cols - 1, c0 + 1);
  const ty = fy - r0;
  const tx = fx - c0;

  const idx00 = r0 * cols + c0;
  const idx01 = r0 * cols + c1;
  const idx10 = r1 * cols + c0;
  const idx11 = r1 * cols + c1;

  const bilerp = (arr: number[]) => {
    const top = arr[idx00] * (1 - tx) + arr[idx01] * tx;
    const bot = arr[idx10] * (1 - tx) + arr[idx11] * tx;
    return top * (1 - ty) + bot * ty;
  };

  const uVal = bilerp(u);
  const vVal = bilerp(v);
  return { u: uVal, v: vVal, speed: Math.hypot(uVal, vVal) };
}

export default function WindStreamOverlay({
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
  const mapFnRef = useRef(screenToLatLon);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    mapFnRef.current = screenToLatLon;
  }, [screenToLatLon]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const particleCount = Math.min(1150, Math.max(450, Math.round((width * height) / 420)));
    const spawn = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      age: Math.floor(Math.random() * 65),
      maxAge: 55 + Math.floor(Math.random() * 55)
    });

    const particles: Particle[] = Array.from({ length: particleCount }, spawn);
    let rafId = 0;

    const tick = () => {
      const activeGrid = gridRef.current;
      // Eski izleri saydam biçimde yumuşakça sönümle (alttaki harita/radar bozulmaz)
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = "rgba(0, 0, 0, 0.90)";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      if (activeGrid) {
        ctx.lineWidth = 1.35;
        ctx.lineCap = "round";

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (p.age >= p.maxAge || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.age = 0;
            p.maxAge = 55 + Math.floor(Math.random() * 55);
            continue;
          }

          const { lat, lon } = mapFnRef.current(p.x, p.y);
          const { u, v, speed } = sampleWindAt(activeGrid, lat, lon);

          // Ekran hızı ölçeği: gerçek rüzgar hızına orantılı (y ekseni aşağı pozitif, +v kuzey yukarı)
          const scale = 0.055;
          const dx = u * scale;
          const dy = -v * scale;
          const nx = p.x + dx;
          const ny = p.y + dy;

          if (speed > 0.4) {
            ctx.beginPath();
            ctx.strokeStyle = speedToColor(speed);
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(nx, ny);
            ctx.stroke();
          }

          p.x = nx;
          p.y = ny;
          p.age += 1;
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
