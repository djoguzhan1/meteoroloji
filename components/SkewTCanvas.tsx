"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CapeAnalysisResult,
  EnvProfilePoint,
  ParcelMode,
  ParcelPoint,
  ParcelTrajectory
} from "@/lib/thermo-cape";
import {
  formatElevation,
  formatPressure,
  formatTemperature,
  windDirectionToCompass
} from "@/lib/weather-client";
import type { UnitSystem } from "@/lib/weather-types";

const CANVAS_W = 560;
const CANVAS_H = 430;
const PAD_TOP = 24;
const PAD_BOTTOM = 36;
const PLOT_H = CANVAS_H - PAD_TOP - PAD_BOTTOM;
const P_MIN = 300;
const P_MAX = 1020;

export interface SkewTMarkerInput {
  label: string;
  color: string;
  rawY: number;
}

export interface ResolvedSkewTMarker extends SkewTMarkerInput {
  labelY: number;
}

/**
 * Prevents right-axis thermodynamic level labels (EL, LFC, LCL, 0°C/32°F) from overlapping
 * when levels sit within a few hPa of each other.
 */
export function resolveSkewTMarkerCollisions(
  markers: SkewTMarkerInput[],
  minGapPx = 14,
  minY = PAD_TOP + 6,
  maxY = PAD_TOP + PLOT_H - 4
): ResolvedSkewTMarker[] {
  if (markers.length === 0) return [];
  const sorted = [...markers]
    .sort((a, b) => a.rawY - b.rawY)
    .map((m) => ({
      ...m,
      labelY: Math.max(minY, Math.min(maxY, m.rawY))
    }));

  // Forward pass: push overlapping lower labels downward
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].labelY - sorted[i - 1].labelY < minGapPx) {
      sorted[i].labelY = sorted[i - 1].labelY + minGapPx;
    }
  }

  // Backward pass: clamp bottom label to maxY and pull upward if needed
  if (sorted[sorted.length - 1].labelY > maxY) {
    sorted[sorted.length - 1].labelY = maxY;
    for (let i = sorted.length - 2; i >= 0; i--) {
      if (sorted[i + 1].labelY - sorted[i].labelY < minGapPx) {
        sorted[i].labelY = Math.max(minY, sorted[i + 1].labelY - minGapPx);
      }
    }
  }

  return sorted;
}

export interface SkewTCanvasProps {
  analysis: CapeAnalysisResult;
  parcelMode?: ParcelMode;
  unit?: UnitSystem;
}

/**
 * Standart WMO Rüzgar Barbı çizici (Kuzey Yarımküre konvansiyonu):
 * - < 2.5 kt: eş merkezli sakin rüzgar çemberi
 * - >= 2.5 kt: rüzgarın geldiği yöne dönük mil, 50 kt dolu flama, 10 kt tam çentik, 5 kt yarım çentik
 */
function drawWmoWindBarb(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  speedKt: number,
  dirDeg: number,
  shaftLen: number,
  color: string
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.25;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (!Number.isFinite(speedKt) || speedKt < 2.5) {
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  const rad = (((dirDeg % 360) + 360) % 360) * (Math.PI / 180);
  // Rüzgarın geldiği yöne doğru birim vektör (0° = Kuzey/Yukarı, 90° = Doğu/Sağ)
  const ux = Math.sin(rad);
  const uy = -Math.cos(rad);
  // Kuzey Yarımküre saat yönü (düşük basınca doğru) çentik vektörü (hafif dışa eğimli)
  const px = -uy * 0.94 + ux * 0.34;
  const py = ux * 0.94 + uy * 0.34;

  const tipX = cx + ux * shaftLen;
  const tipY = cy + uy * shaftLen;

  // Merkez nokta + ana mil
  ctx.beginPath();
  ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  let rem = Math.round(speedKt / 5) * 5;
  const onlyFiveKt = rem === 5;
  let cursor = onlyFiveKt ? shaftLen - 3.2 : shaftLen;
  const featherLen = Math.max(6.2, shaftLen * 0.44);

  while (rem >= 50 && cursor > 4) {
    const base1X = cx + ux * cursor;
    const base1Y = cy + uy * cursor;
    const base2X = cx + ux * (cursor - 4.2);
    const base2Y = cy + uy * (cursor - 4.2);
    const apexX = cx + ux * (cursor - 2.1) + px * featherLen;
    const apexY = cy + uy * (cursor - 2.1) + py * featherLen;

    ctx.beginPath();
    ctx.moveTo(base1X, base1Y);
    ctx.lineTo(apexX, apexY);
    ctx.lineTo(base2X, base2Y);
    ctx.closePath();
    ctx.fill();

    cursor -= 5.0;
    rem -= 50;
  }

  while (rem >= 10 && cursor > 2.5) {
    const bx = cx + ux * cursor;
    const by = cy + uy * cursor;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + px * featherLen, by + py * featherLen);
    ctx.stroke();

    cursor -= 3.2;
    rem -= 10;
  }

  if (rem >= 5 && cursor > 2) {
    const bx = cx + ux * cursor;
    const by = cy + uy * cursor;
    const halfLen = featherLen * 0.54;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + px * halfLen, by + py * halfLen);
    ctx.stroke();
  }

  ctx.restore();
}

function interpolateSlicePoint(a: ParcelPoint, b: ParcelPoint, frac: number): ParcelPoint {
  const f = Math.max(0, Math.min(1, frac));
  const p = Math.exp(Math.log(a.pressure) + (Math.log(b.pressure) - Math.log(a.pressure)) * f);
  const envTempC = a.envTempC + (b.envTempC - a.envTempC) * f;
  const envDewPointC = a.envDewPointC + (b.envDewPointC - a.envDewPointC) * f;
  const parcelTempC = a.parcelTempC + (b.parcelTempC - a.parcelTempC) * f;
  const envTvK = a.envTvK + (b.envTvK - a.envTvK) * f;
  const parcelTvK = a.parcelTvK + (b.parcelTvK - a.parcelTvK) * f;
  const envTvC = (a.envTvC ?? a.envTempC) + ((b.envTvC ?? b.envTempC) - (a.envTvC ?? a.envTempC)) * f;
  const parcelTvC =
    (a.parcelTvC ?? a.parcelTempC) +
    ((b.parcelTvC ?? b.parcelTempC) - (a.parcelTvC ?? a.parcelTempC)) * f;
  return {
    pressure: p,
    envTempC,
    envDewPointC,
    parcelTempC,
    envTvK,
    parcelTvK,
    envTvC,
    parcelTvC
  };
}

export default function SkewTCanvas({
  analysis,
  parcelMode = "mu",
  unit = "metric"
}: SkewTCanvasProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cssWidth, setCssWidth] = useState<number>(CANVAS_W);
  const [hoverPressure, setHoverPressure] = useState<number | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const applyWidth = (rawW: number) => {
      const w = Math.round(rawW);
      if (w > 0) {
        setCssWidth(Math.max(296, Math.min(680, w)));
      }
    };

    applyWidth(el.clientWidth);

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        applyWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const activeParcel: ParcelTrajectory = useMemo(() => {
    const candidate = analysis.parcels?.[parcelMode];
    if (candidate) return candidate;
    return {
      mode: "sb",
      labelTr: "Yüzey Tabanlı (SB)",
      startPressureHpa: analysis.surfacePressureHpa ?? 1000,
      startTempC: analysis.parcelProfile[0]?.parcelTempC ?? 15,
      startDewPointC: analysis.surfaceDewPointC,
      cape: analysis.cape,
      cin: analysis.cin,
      lclHeightM: analysis.lclHeightM,
      lclPressureHpa: analysis.lclPressureHpa,
      lfcPressureHpa: analysis.lfcPressureHpa,
      elPressureHpa: analysis.elPressureHpa,
      parcelProfile: analysis.parcelProfile
    };
  }, [analysis, parcelMode]);

  const sfcP = useMemo(
    () => Math.max(520, Math.min(1055, analysis.surfacePressureHpa ?? 1013.25)),
    [analysis.surfacePressureHpa]
  );

  // Yeraltı izobarları gizleyen dinamik alt basınç sınırı
  const pMax = useMemo(
    () => Math.max(540, Math.min(P_MAX, Math.ceil((sfcP + 4) / 10) * 10)),
    [sfcP]
  );

  const layout = useMemo(() => {
    const compact = cssWidth < 420;
    const W = cssWidth;
    const H = compact ? 396 : 432;
    const padLeft = compact ? 48 : 56;
    const padRight = compact ? 78 : 88;
    const padTop = 24;
    const padBottom = 34;
    const plotW = Math.max(140, W - padLeft - padRight);
    const plotH = H - padTop - padBottom;
    const windShaftX = W - (compact ? 22 : 25);
    const barbLen = compact ? 14.5 : 16.5;
    const lnPMax = Math.log(pMax);
    const lnPMin = Math.log(P_MIN);

    const pToY = (p: number): number => {
      const clamped = Math.max(P_MIN, Math.min(pMax, p));
      const frac = (lnPMax - Math.log(clamped)) / (lnPMax - lnPMin);
      return padTop + plotH * (1 - frac);
    };

    const yToP = (y: number): number => {
      const clampedY = Math.max(padTop, Math.min(padTop + plotH, y));
      const frac = 1 - (clampedY - padTop) / plotH;
      return Math.exp(lnPMax - frac * (lnPMax - lnPMin));
    };

    return {
      compact,
      W,
      H,
      padLeft,
      padRight,
      padTop,
      padBottom,
      plotW,
      plotH,
      windShaftX,
      barbLen,
      pToY,
      yToP
    };
  }, [cssWidth, pMax]);

  // Gerçek yüzey -> 300 hPa lazer tarayıcı için en yakın gerçek basınç seviyesi
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

    const {
      compact,
      W,
      H,
      padLeft,
      padTop,
      plotW,
      plotH,
      windShaftX,
      barbLen,
      pToY
    } = layout;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const tMinBase = -40;
    const tMaxBase = 42;
    const skewDeg = 34;

    const tpToX = (tempC: number, pressureHpa: number) => {
      const yFrac = (pToY(pMax) - pToY(pressureHpa)) / plotH;
      const shiftedT = tempC + yFrac * skewDeg;
      const xFrac = (shiftedT - tMinBase) / (tMaxBase - tMinBase);
      return padLeft + xFrac * plotW;
    };

    // Enstrüman koyu arka plan + hafif derinlik gradyanı
    const bg = ctx.createLinearGradient(0, padTop, 0, padTop + plotH);
    bg.addColorStop(0, "#050914");
    bg.addColorStop(1, "#080e1c");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Yeraltı izobarları süzülmüş standart izobarlar
    const visibleIsobars = [1000, 925, 850, 700, 500, 400, 300].filter(
      (p) => p <= sfcP + 1 && p >= P_MIN
    );

    ctx.save();
    ctx.beginPath();
    ctx.rect(padLeft, padTop, plotW, plotH);
    ctx.clip();

    // Eğik izotermler (10°C aralık; 0°C / 32°F donma izotermi vurgulu)
    for (let t = -80; t <= 45; t += 10) {
      ctx.beginPath();
      ctx.moveTo(tpToX(t, pMax), pToY(pMax));
      ctx.lineTo(tpToX(t, P_MIN), pToY(P_MIN));
      ctx.strokeStyle =
        t === 0 ? "rgba(56, 189, 248, 0.52)" : "rgba(148, 163, 184, 0.13)";
      ctx.lineWidth = t === 0 ? 1.6 : 1;
      ctx.stroke();
    }

    // İzobarlar
    for (const p of visibleIsobars) {
      const y = pToY(p);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // İstasyon zemin çizgisi (gerçek P_sfc altı zemin taraması)
    const ySfc = pToY(sfcP);
    if (ySfc < padTop + plotH - 0.5) {
      ctx.fillStyle = "rgba(15, 23, 42, 0.72)";
      ctx.fillRect(padLeft, ySfc, plotW, padTop + plotH - ySfc);
    }
    ctx.beginPath();
    ctx.moveTo(padLeft, ySfc);
    ctx.lineTo(padLeft + plotW, ySfc);
    ctx.strokeStyle = "rgba(16, 185, 129, 0.55)";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Sanal Sıcaklık (Tv) tabanlı CAPE ve CIN alan boyaması
    const parcelProf = activeParcel.parcelProfile ?? [];
    const lfcP = activeParcel.lfcPressureHpa;
    const elP = activeParcel.elPressureHpa;
    const startP = activeParcel.startPressureHpa;
    const hasValidConvection = lfcP !== null && activeParcel.cape >= 1;

    const shadeSubSlice = (s1: ParcelPoint, s2: ParcelPoint) => {
      const envTv1 = s1.envTvC ?? s1.envTempC;
      const envTv2 = s2.envTvC ?? s2.envTempC;
      const parTv1 = s1.parcelTvC ?? s1.parcelTempC;
      const parTv2 = s2.parcelTvC ?? s2.parcelTempC;
      const d1 = parTv1 - envTv1;
      const d2 = parTv2 - envTv2;
      const midP = 0.5 * (s1.pressure + s2.pressure);
      const midDiff = 0.5 * (d1 + d2);

      // CAPE: yalnızca LFC mevcutken parcelTvC > envTvC dilimlerinde
      const isCapeSlice =
        lfcP !== null &&
        midDiff > 0.01 &&
        midP <= lfcP + 5 &&
        (elP === null || midP >= elP - 5);

      // CIN: yalnızca lfcPressureHpa !== null && cape >= 1 iken P_LFC <= P <= P_start aralığında parcelTvC < envTvC
      const isCinSlice =
        hasValidConvection &&
        lfcP !== null &&
        midDiff < -0.01 &&
        midP <= startP + 1 &&
        midP >= lfcP - 1;

      if (!isCapeSlice && !isCinSlice) return;

      ctx.beginPath();
      ctx.moveTo(tpToX(envTv1, s1.pressure), pToY(s1.pressure));
      ctx.lineTo(tpToX(envTv2, s2.pressure), pToY(s2.pressure));
      ctx.lineTo(tpToX(parTv2, s2.pressure), pToY(s2.pressure));
      ctx.lineTo(tpToX(parTv1, s1.pressure), pToY(s1.pressure));
      ctx.closePath();

      ctx.fillStyle = isCapeSlice
        ? "rgba(245, 158, 11, 0.28)"
        : "rgba(56, 189, 248, 0.16)";
      ctx.fill();
    };

    for (let i = 0; i < parcelProf.length - 1; i++) {
      const a = parcelProf[i];
      const b = parcelProf[i + 1];
      const dA = (a.parcelTvC ?? a.parcelTempC) - (a.envTvC ?? a.envTempC);
      const dB = (b.parcelTvC ?? b.parcelTempC) - (b.envTvC ?? b.envTempC);

      if ((dA > 0 && dB < 0) || (dA < 0 && dB > 0)) {
        const crossFrac = (0 - dA) / (dB - dA);
        const midPt = interpolateSlicePoint(a, b, crossFrac);
        shadeSubSlice(a, midPt);
        shadeSubSlice(midPt, b);
      } else {
        shadeSubSlice(a, b);
      }
    }

    // Kesintisiz P_sfc -> 300 hPa Çevre Eğrisi (analysis.envProfile)
    const envCurve: EnvProfilePoint[] =
      analysis.envProfile && analysis.envProfile.length >= 2
        ? analysis.envProfile
        : parcelProf.map((pt) => ({
            pressure: pt.pressure,
            altitudeM: 0,
            envTempC: pt.envTempC,
            envDewPointC: pt.envDewPointC,
            envTvC: pt.envTvC ?? pt.envTempC
          }));

    // Çiy noktası profili (Td) — parlak zümrüt hat
    ctx.save();
    ctx.shadowColor = "rgba(16, 185, 129, 0.45)";
    ctx.shadowBlur = 7;
    ctx.beginPath();
    envCurve.forEach((pt, idx) => {
      const x = tpToX(pt.envDewPointC, pt.pressure);
      const y = pToY(pt.pressure);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.1;
    ctx.stroke();
    ctx.restore();

    // Çevre sıcaklığı profili (T) — parlak cyan hat
    ctx.save();
    ctx.shadowColor = "rgba(56, 189, 248, 0.52)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    envCurve.forEach((pt, idx) => {
      const x = tpToX(pt.envTempC, pt.pressure);
      const y = pToY(pt.pressure);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2.4;
    ctx.stroke();
    ctx.restore();

    // Seçili parsel (MU | SB | ML) yükseliş eğrisi (parcelTvC üzerinden kesikli hat + başlangıç düğümü)
    if (parcelProf.length >= 2) {
      ctx.beginPath();
      ctx.setLineDash([5, 4]);
      parcelProf.forEach((pt, idx) => {
        const x = tpToX(pt.parcelTvC ?? pt.parcelTempC, pt.pressure);
        const y = pToY(pt.pressure);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2.1;
      ctx.stroke();
      ctx.setLineDash([]);

      const originPt = parcelProf[0];
      const ox = tpToX(originPt.parcelTvC ?? originPt.parcelTempC, originPt.pressure);
      const oy = pToY(originPt.pressure);
      ctx.beginPath();
      ctx.arc(ox, oy, 3.6, 0, Math.PI * 2);
      ctx.fillStyle = "#f59e0b";
      ctx.fill();
      ctx.strokeStyle = "#070b14";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // İnteraktif İrtifa Lazer Tarama Çizgisi + Kesişim Noktaları
    if (hoveredLevel) {
      const ly = pToY(hoveredLevel.pressure);
      ctx.beginPath();
      ctx.moveTo(padLeft, ly);
      ctx.lineTo(padLeft + plotW, ly);
      ctx.strokeStyle = "rgba(248, 251, 255, 0.68)";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      const tx = tpToX(hoveredLevel.temperature, hoveredLevel.pressure);
      const tdx = tpToX(hoveredLevel.dewPoint, hoveredLevel.pressure);

      ctx.beginPath();
      ctx.arc(tx, ly, 6.8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(56, 189, 248, 0.28)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tx, ly, 3.4, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf8";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(tdx, ly, 6.8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(16, 185, 129, 0.28)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tdx, ly, 3.4, 0, Math.PI * 2);
      ctx.fillStyle = "#10b981";
      ctx.fill();
    }

    ctx.restore();

    // Çerçeve
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 1;
    ctx.strokeRect(padLeft, padTop, plotW, plotH);

    // Sol eksen başlığı + Basınç etiketleri (unit uyumlu: hPa / inHg)
    const labelFontPx = compact ? 10.5 : 11;
    ctx.font = `600 ${labelFontPx}px monospace`;
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(148, 163, 184, 0.72)";
    ctx.fillText(unit === "imperial" ? "inHg" : "hPa", padLeft - 6, padTop - 7);

    ctx.font = `${labelFontPx}px monospace`;
    let lastLeftLabelY = -Infinity;
    for (const p of visibleIsobars) {
      const y = pToY(p);
      lastLeftLabelY = y;
      const isFocus = hoveredLevel?.pressure === p;
      ctx.fillStyle = isFocus ? "#38bdf8" : "rgba(167, 180, 200, 0.84)";
      const labelStr =
        unit === "imperial"
          ? (p * 0.029529983).toFixed(1)
          : String(Math.round(p));
      ctx.fillText(labelStr, padLeft - 6, y + 3.5);
    }

    // İstasyon gerçek yüzey basıncı sol eksen işareti (çakışma yoksa)
    if (Math.abs(ySfc - lastLeftLabelY) >= 13) {
      ctx.fillStyle = "#10b981";
      const sfcLabel =
        unit === "imperial"
          ? (sfcP * 0.029529983).toFixed(1)
          : String(Math.round(sfcP));
      ctx.fillText(sfcLabel, padLeft - 6, ySfc + 3.5);
    }

    // Alt eksen: Sıcaklık (°C veya °F)
    ctx.fillStyle = "rgba(167, 180, 200, 0.84)";
    ctx.textAlign = "center";
    ctx.font = `${labelFontPx}px monospace`;
    if (unit === "imperial") {
      const fTicks = compact
        ? [-20, 0, 32, 60, 90]
        : [-20, 0, 20, 32, 50, 70, 90, 105];
      let prevX = -Infinity;
      for (const f of fTicks) {
        const tempC = (f - 32) / 1.8;
        const x = tpToX(tempC, pMax);
        if (x >= padLeft + 10 && x <= padLeft + plotW - 10 && x - prevX >= 34) {
          ctx.fillStyle = f === 32 ? "#38bdf8" : "rgba(167, 180, 200, 0.84)";
          ctx.fillText(`${f}°F`, x, H - 10);
          prevX = x;
        }
      }
    } else {
      const stepC = compact ? 20 : 10;
      const cTicks: number[] = [];
      for (let t = -30; t <= 40; t += stepC) cTicks.push(t);
      if (compact && !cTicks.includes(0)) {
        cTicks.push(0);
        cTicks.sort((a, b) => a - b);
      }
      let prevX = -Infinity;
      for (const t of cTicks) {
        const x = tpToX(t, pMax);
        if (x >= padLeft + 8 && x <= padLeft + plotW - 8 && x - prevX >= 30) {
          ctx.fillStyle = t === 0 ? "#38bdf8" : "rgba(167, 180, 200, 0.84)";
          ctx.fillText(`${t}°C`, x, H - 10);
          prevX = x;
        }
      }
    }

    // Sağ eksen 1: LCL, LFC, EL ve 0°C/32°F Donma Sınırı (Çakışma çözücülü lider çizgili yerleşim)
    const rawMarkers: SkewTMarkerInput[] = [];
    if (
      activeParcel.lclPressureHpa !== null &&
      activeParcel.lclPressureHpa >= P_MIN &&
      activeParcel.lclPressureHpa <= pMax
    ) {
      rawMarkers.push({
        label: "LCL",
        color: "#f59e0b",
        rawY: pToY(activeParcel.lclPressureHpa)
      });
    }
    if (
      activeParcel.lfcPressureHpa !== null &&
      activeParcel.lfcPressureHpa >= P_MIN &&
      activeParcel.lfcPressureHpa <= pMax
    ) {
      rawMarkers.push({
        label: "LFC",
        color: "#ef4444",
        rawY: pToY(activeParcel.lfcPressureHpa)
      });
    }
    if (
      activeParcel.elPressureHpa !== null &&
      activeParcel.elPressureHpa >= P_MIN &&
      activeParcel.elPressureHpa <= pMax
    ) {
      rawMarkers.push({
        label: "EL",
        color: "#94a3b8",
        rawY: pToY(activeParcel.elPressureHpa)
      });
    }
    if (
      analysis.freezingPressureHpa !== null &&
      analysis.freezingPressureHpa !== undefined &&
      analysis.freezingPressureHpa >= P_MIN &&
      analysis.freezingPressureHpa <= pMax
    ) {
      rawMarkers.push({
        label: unit === "imperial" ? "32°F" : "0°C",
        color: "#38bdf8",
        rawY: pToY(analysis.freezingPressureHpa)
      });
    }

    const resolvedMarkers = resolveSkewTMarkerCollisions(
      rawMarkers,
      13,
      padTop + 6,
      padTop + plotH - 4
    );
    for (const mk of resolvedMarkers) {
      ctx.strokeStyle = mk.color;
      ctx.lineWidth = 1.05;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padLeft, mk.rawY);
      ctx.lineTo(padLeft + plotW, mk.rawY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.strokeStyle = mk.color;
      ctx.lineWidth = 1;
      ctx.moveTo(padLeft + plotW, mk.rawY);
      ctx.lineTo(padLeft + plotW + 5, mk.labelY);
      ctx.stroke();

      ctx.fillStyle = mk.color;
      ctx.font = `bold ${compact ? 10 : 10.5}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText(mk.label, padLeft + plotW + 7, mk.labelY + 3.5);
    }

    // Sağ eksen 2: Dikey WMO Rüzgar Profili Ekseni ve Rüzgar Barbları
    ctx.font = `600 ${compact ? 9.5 : 10}px monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(148, 163, 184, 0.72)";
    ctx.fillText("Rüzgar", windShaftX, padTop - 7);

    ctx.beginPath();
    ctx.moveTo(windShaftX, pToY(sfcP));
    ctx.lineTo(windShaftX, pToY(P_MIN));
    ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
    ctx.lineWidth = 1;
    ctx.stroke();

    let lastBarbY = Infinity;
    for (const lvl of analysis.levels) {
      if (lvl.pressure > pMax || lvl.pressure < P_MIN) continue;
      const by = pToY(lvl.pressure);
      if (Math.abs(lastBarbY - by) < 16) continue;
      lastBarbY = by;
      const isHovered = hoveredLevel?.pressure === lvl.pressure;
      const barbColor = isHovered
        ? "#38bdf8"
        : lvl.isSurface
          ? "#34d399"
          : "rgba(226, 232, 240, 0.86)";
      drawWmoWindBarb(
        ctx,
        windShaftX,
        by,
        lvl.windSpeedKt,
        lvl.windDirection,
        barbLen,
        barbColor
      );
    }
  }, [analysis, activeParcel, hoveredLevel, layout, pMax, sfcP, unit]);

  const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.height <= 0) return;
    const yCanvas = ((e.clientY - rect.top) / rect.height) * layout.H;
    if (yCanvas < layout.padTop || yCanvas > layout.padTop + layout.plotH) {
      setHoverPressure(null);
      return;
    }
    setHoverPressure(layout.yToP(yCanvas));
  };

  const formatHoveredWind = (speedKt: number, dirDeg: number) => {
    const compass = windDirectionToCompass(dirDeg);
    if (unit === "imperial") {
      return `${Math.round(speedKt * 1.15078)} mph (${speedKt} kt) ${compass}`;
    }
    return `${Math.round(speedKt * 1.852)} km/s (${speedKt} kt) ${compass}`;
  };

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-white/[0.08] bg-[#070b14] p-2">
        <div ref={wrapRef} className="w-full max-w-[640px] mx-auto">
          <canvas
            ref={canvasRef}
            onPointerMove={handlePointer}
            onPointerDown={handlePointer}
            onPointerLeave={() => setHoverPressure(null)}
            style={{ width: `${layout.W}px`, height: `${layout.H}px` }}
            className="block mx-auto cursor-crosshair select-none touch-pan-y"
            aria-label="İnteraktif Skew-T Log-P dikey atmosfer diyagramı ve WMO rüzgar barbları"
          />
        </div>

        {/* Yüzen İrtifa Lazer Telemetri HUD'ı */}
        {hoveredLevel ? (
          <div className="pointer-events-none mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[rgba(var(--atmos-accent-rgb),0.35)] bg-[#050b16]/90 px-3 py-1.5 font-mono text-[11px] text-ink-primary backdrop-blur-md tabular">
            <span className="font-semibold text-[var(--atmos-accent)]">
              {hoveredLevel.isSurface ? "Yüzey · " : ""}
              {formatPressure(hoveredLevel.pressure, unit)} ·{" "}
              {formatElevation(hoveredLevel.altitudeM, unit)}
            </span>
            <span>
              T{" "}
              <strong className="text-signal-sky">
                {formatTemperature(hoveredLevel.temperature, unit, {
                  decimals: 1,
                  showUnit: true
                })}
              </strong>{" "}
              · Td{" "}
              <strong className="text-signal-emerald">
                {formatTemperature(hoveredLevel.dewPoint, unit, {
                  decimals: 1,
                  showUnit: true
                })}
              </strong>{" "}
              · θe{" "}
              <strong className="text-signal-amber">
                {hoveredLevel.equivPotentialTempK} K
              </strong>
            </span>
            <span className="text-ink-secondary">
              {formatHoveredWind(hoveredLevel.windSpeedKt, hoveredLevel.windDirection)}
            </span>
          </div>
        ) : (
          <p className="mt-2 text-center font-mono text-[10.5px] text-ink-muted">
            {formatPressure(sfcP, unit)} → {formatPressure(P_MIN, unit)} dikey irtifa ve WMO rüzgar profilini taramak için diyagram üzerinde gezin
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#38bdf8]" /> Çevre (T)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#10b981]" /> Çiy Noktası (Td)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-[#f59e0b]" />{" "}
          {activeParcel.mode.toUpperCase()} Parsel (Tv)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#f59e0b]/40" /> CAPE (Tv+)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#38bdf8]/30" /> CIN (Tv−)
        </span>
      </div>
    </div>
  );
}
