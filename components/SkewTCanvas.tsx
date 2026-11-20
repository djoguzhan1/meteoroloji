"use client";

import { useEffect, useRef } from "react";
import type { CapeAnalysisResult } from "@/lib/thermo-cape";

export default function SkewTCanvas({
  analysis
}: {
  analysis: CapeAnalysisResult;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = 560;
    const height = 430;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const padLeft = 56;
    const padRight = 56;
    const padTop = 24;
    const padBottom = 36;
    const plotW = width - padLeft - padRight;
    const plotH = height - padTop - padBottom;

    const pMin = 300;
    const pMax = 1020;
    const lnPMax = Math.log(pMax);
    const lnPMin = Math.log(pMin);

    const pToY = (p: number) => {
      const clamped = Math.max(pMin, Math.min(pMax, p));
      const frac = (lnPMax - Math.log(clamped)) / (lnPMax - lnPMin);
      return padTop + plotH * (1 - frac);
    };

    const tMinBase = -40;
    const tMaxBase = 42;
    const skewDeg = 34;

    const tpToX = (tempC: number, pressureHpa: number) => {
      const yFrac = (pToY(pMax) - pToY(pressureHpa)) / plotH;
      const shiftedT = tempC + yFrac * skewDeg;
      const xFrac = (shiftedT - tMinBase) / (tMaxBase - tMinBase);
      return padLeft + xFrac * plotW;
    };

    // Enstrüman koyu arka plan
    ctx.fillStyle = "#070b14";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.beginPath();
    ctx.rect(padLeft, padTop, plotW, plotH);
    ctx.clip();

    // Eğik izotermler (10°C aralık; 0°C vurgulu)
    for (let t = -80; t <= 45; t += 10) {
      ctx.beginPath();
      ctx.moveTo(tpToX(t, pMax), pToY(pMax));
      ctx.lineTo(tpToX(t, pMin), pToY(pMin));
      ctx.strokeStyle =
        t === 0 ? "rgba(56, 189, 248, 0.45)" : "rgba(148, 163, 184, 0.13)";
      ctx.lineWidth = t === 0 ? 1.5 : 1;
      ctx.stroke();
    }

    // İzobarlar (hPa)
    const isobars = [1000, 925, 850, 700, 500, 400, 300];
    for (const p of isobars) {
      const y = pToY(p);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.14)";
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
        ctx.fillStyle = "rgba(245, 158, 11, 0.24)";
        ctx.fill();
      } else if (!pos && a.pressure > (analysis.lfcPressureHpa ?? 300)) {
        ctx.fillStyle = "rgba(56, 189, 248, 0.11)";
        ctx.fill();
      }
    }

    // Çiy noktası profili (Td)
    ctx.beginPath();
    prof.forEach((pt, idx) => {
      const x = tpToX(pt.envDewPointC, pt.pressure);
      const y = pToY(pt.pressure);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Çevre sıcaklığı profili (T)
    ctx.beginPath();
    prof.forEach((pt, idx) => {
      const x = tpToX(pt.envTempC, pt.pressure);
      const y = pToY(pt.pressure);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.4;
    ctx.stroke();

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

    ctx.restore();

    // Çerçeve
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 1;
    ctx.strokeRect(padLeft, padTop, plotW, plotH);

    // Sol eksen: Basınç (hPa)
    ctx.fillStyle = "rgba(167, 180, 200, 0.8)";
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    for (const p of isobars) {
      ctx.fillText(`${p}`, padLeft - 8, pToY(p) + 4);
    }

    // Alt eksen: Sıcaklık (°C)
    ctx.textAlign = "center";
    for (let t = -30; t <= 40; t += 10) {
      const x = tpToX(t, pMax);
      if (x >= padLeft && x <= padLeft + plotW) {
        ctx.fillText(`${t}°`, x, height - 12);
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
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = color;
      ctx.font = "bold 11px monospace";
      ctx.textAlign = "left";
      ctx.fillText(label, padLeft + plotW + 6, y + 4);
    };

    drawMarker(analysis.lclPressureHpa, "LCL", "#f59e0b");
    drawMarker(analysis.lfcPressureHpa, "LFC", "#ef4444");
    drawMarker(analysis.elPressureHpa, "EL", "#94a3b8");
  }, [analysis]);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#070b14] p-2">
        <canvas
          ref={canvasRef}
          className="h-auto w-full max-w-[560px] mx-auto block"
          aria-label="Gerçek Skew-T Log-P dikey atmosfer diyagramı"
        />
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
