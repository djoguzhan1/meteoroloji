"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CapeAnalysisResult } from "@/lib/thermo-cape";
import { windDirectionToCompass } from "@/lib/weather-client";

const CANVAS_W = 560;
const CANVAS_H = 430;
const PAD_LEFT = 56;
const PAD_RIGHT = 56;
const PAD_TOP = 24;
const PAD_BOTTOM = 36;
const PLOT_W = CANVAS_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = CANVAS_H - PAD_TOP - PAD_BOTTOM;
const P_MIN = 300;
const P_MAX = 1020;
const LN_P_MAX = Math.log(P_MAX);
const LN_P_MIN = Math.log(P_MIN);

function pToY(p: number): number {
  const clamped = Math.max(P_MIN, Math.min(P_MAX, p));
  const frac = (LN_P_MAX - Math.log(clamped)) / (LN_P_MAX - LN_P_MIN);
  return PAD_TOP + PLOT_H * (1 - frac);
}

function yToP(y: number): number {
  const clampedY = Math.max(PAD_TOP, Math.min(PAD_TOP + PLOT_H, y));
  const frac = 1 - (clampedY - PAD_TOP) / PLOT_H;
  return Math.exp(LN_P_MAX - frac * (LN_P_MAX - LN_P_MIN));
}

export default function SkewTCanvas({
  analysis
}: {
  analysis: CapeAnalysisResult;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoverPressure, setHoverPressure] = useState<number | null>(null);

  // 1000 -> 300 hPa lazer tarayıcı için en yakın gerçek basınç seviyesi
  const hoveredLevel = useMemo(() => {
    if (hoverPressure === null || analysis.levels.length === 0) return null;
    let closest = analysis.levels[0];
    let bestDiff = Infinity;
    for (const lvl of analysis.levels) {
      const diff = Math.abs(lvl.pressure - hoverPressure);
      if (diff < bestDiff) {
        bestDiff = diff;
        closest = lvl;
      }
    }
    return closest;
  }, [analysis.levels, hoverPressure]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CANVAS_W * dpr;
    canvas.height = CANVAS_H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const tMinBase = -40;
    const tMaxBase = 42;
    const skewDeg = 34;

    const tpToX = (tempC: number, pressureHpa: number) => {
      const yFrac = (pToY(P_MAX) - pToY(pressureHpa)) / PLOT_H;
      const shiftedT = tempC + yFrac * skewDeg;
      const xFrac = (shiftedT - tMinBase) / (tMaxBase - tMinBase);
      return PAD_LEFT + xFrac * PLOT_W;
    };

    // Enstrüman koyu arka plan + hafif derinlik gradyanı
    const bg = ctx.createLinearGradient(0, PAD_TOP, 0, PAD_TOP + PLOT_H);
    bg.addColorStop(0, "#050914");
    bg.addColorStop(1, "#080e1c");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.save();
    ctx.beginPath();
    ctx.rect(PAD_LEFT, PAD_TOP, PLOT_W, PLOT_H);
    ctx.clip();

    // Eğik izotermler (10°C aralık; 0°C donma izotermi vurgulu)
    for (let t = -80; t <= 45; t += 10) {
      ctx.beginPath();
      ctx.moveTo(tpToX(t, P_MAX), pToY(P_MAX));
      ctx.lineTo(tpToX(t, P_MIN), pToY(P_MIN));
      ctx.strokeStyle =
        t === 0 ? "rgba(56, 189, 248, 0.52)" : "rgba(148, 163, 184, 0.13)";
      ctx.lineWidth = t === 0 ? 1.6 : 1;
      ctx.stroke();
    }

    // İzobarlar (hPa)
    const isobars = [1000, 925, 850, 700, 500, 400, 300];
    for (const p of isobars) {
      const y = pToY(p);
      ctx.beginPath();
      ctx.moveTo(PAD_LEFT, y);
      ctx.lineTo(PAD_LEFT + PLOT_W, y);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // CAPE ve CIN alan gölgelendirmesi
    const prof = analysis.parcelProfile;
    for (let i = 0; i < prof.length - 1; i++) {
      const a = prof[i];
      const b = prof[i + 1];
      const pos = a.parcelTempC > a.envTempC || b.parcelTempC > b.envTempC;
      const inCapeZone =
        analysis.lfcPressureHpa !== null && a.pressure <= analysis.lfcPressureHpa;
      if (!pos && inCapeZone) continue;

      ctx.beginPath();
      ctx.moveTo(tpToX(a.envTempC, a.pressure), pToY(a.pressure));
      ctx.lineTo(tpToX(b.envTempC, b.pressure), pToY(b.pressure));
      ctx.lineTo(tpToX(b.parcelTempC, b.pressure), pToY(b.pressure));
      ctx.lineTo(tpToX(a.parcelTempC, a.pressure), pToY(a.pressure));
      ctx.closePath();

      if (pos && a.pressure <= analysis.lclPressureHpa + 20) {
        ctx.fillStyle = "rgba(245, 158, 11, 0.28)";
        ctx.fill();
      } else if (!pos && a.pressure > (analysis.lfcPressureHpa ?? 300)) {
        ctx.fillStyle = "rgba(56, 189, 248, 0.13)";
        ctx.fill();
      }
    }

    // Çiy noktası profili (Td) — hafif parlak hat
    ctx.save();
    ctx.shadowColor = "rgba(16, 185, 129, 0.45)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    prof.forEach((pt, idx) => {
      const x = tpToX(pt.envDewPointC, pt.pressure);
      const y = pToY(pt.pressure);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.2;
    ctx.stroke();
    ctx.restore();

    // Çevre sıcaklığı profili (T) — parlak cyan hat
    ctx.save();
    ctx.shadowColor = "rgba(56, 189, 248, 0.55)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    prof.forEach((pt, idx) => {
      const x = tpToX(pt.envTempC, pt.pressure);
      const y = pToY(pt.pressure);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // Yüzey parsel yükseliş eğrisi
    ctx.beginPath();
    ctx.setLineDash([5, 4]);
    prof.forEach((pt, idx) => {
      const x = tpToX(pt.parcelTempC, pt.pressure);
      const y = pToY(pt.pressure);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2.1;
    ctx.stroke();
    ctx.setLineDash([]);

    // İnteraktif İrtifa Lazer Tarama Çizgisi + Kesişim Noktaları
    if (hoveredLevel) {
      const ly = pToY(hoveredLevel.pressure);
      ctx.beginPath();
      ctx.moveTo(PAD_LEFT, ly);
      ctx.lineTo(PAD_LEFT + PLOT_W, ly);
      ctx.strokeStyle = "rgba(248, 251, 255, 0.65)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      const tx = tpToX(hoveredLevel.temperature, hoveredLevel.pressure);
      const tdx = tpToX(hoveredLevel.dewPoint, hoveredLevel.pressure);

      // T noktası
      ctx.beginPath();
      ctx.arc(tx, ly, 7, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(56, 189, 248, 0.28)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx, ly, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.fill();

      // Td noktası
      ctx.beginPath();
      ctx.arc(tdx, ly, 7, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(16, 185, 129, 0.28)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tdx, ly, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = "#10b981";
      ctx.fill();
    }

    ctx.restore();

    // Çerçeve
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 1;
    ctx.strokeRect(PAD_LEFT, PAD_TOP, PLOT_W, PLOT_H);

    // Sol eksen: Basınç (hPa)
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    for (const p of isobars) {
      const isFocus = hoveredLevel?.pressure === p;
      ctx.fillStyle = isFocus ? "#38bdf8" : "rgba(167, 180, 200, 0.8)";
      ctx.fillText(`${p}`, PAD_LEFT - 8, pToY(p) + 4);
    }

    // Alt eksen: Sıcaklık (°C)
    ctx.fillStyle = "rgba(167, 180, 200, 0.8)";
    ctx.textAlign = "center";
    for (let t = -30; t <= 40; t += 10) {
      const x = tpToX(t, P_MAX);
      if (x >= PAD_LEFT && x <= PAD_LEFT + PLOT_W) {
        ctx.fillText(`${t}°`, x, CANVAS_H - 12);
      }
    }

    // Sağ eksen: LCL, LFC, EL seviyeleri
    const drawMarker = (pressure: number | null, label: string, color: string) => {
      if (pressure === null) return;
      const y = pToY(pressure);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(PAD_LEFT, y);
      ctx.lineTo(PAD_LEFT + PLOT_W, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = color;
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "left";
      ctx.fillText(label, PAD_LEFT + PLOT_W + 6, y + 4);
    };

    drawMarker(analysis.lclPressureHpa, "LCL", "#f59e0b");
    drawMarker(analysis.lfcPressureHpa, "LFC", "#ef4444");
    drawMarker(analysis.elPressureHpa, "EL", "#94a3b8");
  }, [analysis, hoveredLevel]);

  const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const yCanvas = ((e.clientY - rect.top) / Math.max(1, rect.height)) * CANVAS_H;
    if (yCanvas < PAD_TOP || yCanvas > PAD_TOP + PLOT_H) {
      setHoverPressure(null);
      return;
    }
    setHoverPressure(yToP(yCanvas));
  };

  return (
    <div className="space-y-3">
      <div className="relative overflow-x-auto rounded-xl border border-white/[0.08] bg-[#070b14] p-2">
        <canvas
          ref={canvasRef}
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
          onPointerLeave={() => setHoverPressure(null)}
          className="h-auto w-full max-w-[560px] mx-auto block cursor-crosshair touch-none"
          aria-label="İnteraktif Skew-T Log-P dikey atmosfer diyagramı"
        />

        {/* Yüzen İrtifa Lazer Telemetri HUD'ı */}
        {hoveredLevel ? (
          <div className="pointer-events-none mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[rgba(var(--atmos-accent-rgb),0.35)] bg-[#050b16]/90 px-3 py-1.5 font-mono text-[11px] text-ink-primary backdrop-blur-md tabular">
            <span className="font-semibold text-[var(--atmos-accent)]">
              {hoveredLevel.pressure} hPa · {hoveredLevel.altitudeM} m
            </span>
            <span>
              T <strong className="text-signal-sky">{hoveredLevel.temperature}°C</strong> · Td{" "}
              <strong className="text-signal-emerald">{hoveredLevel.dewPoint}°C</strong> · θe{" "}
              <strong className="text-signal-amber">{hoveredLevel.equivPotentialTempK} K</strong>
            </span>
            <span className="text-ink-secondary">
              {hoveredLevel.windSpeedKt} kt {windDirectionToCompass(hoveredLevel.windDirection)}
            </span>
          </div>
        ) : (
          <p className="mt-2 text-center font-mono text-[10px] text-ink-muted">
            1000 → 300 hPa dikey irtifa profilini taramak için diyagram üzerinde gezin
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#38bdf8]" /> Çevre Sıcaklığı (T)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#10b981]" /> Çiy Noktası (Td)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-[#f59e0b]" /> Parsel Yolu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]/40" /> CAPE Alanı
        </span>
      </div>
    </div>
  );
}
