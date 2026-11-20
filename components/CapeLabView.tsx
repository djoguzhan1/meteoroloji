"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Flame, Layers, RotateCcw, Zap } from "lucide-react";
import { useWeather } from "@/context/WeatherContext";
import {
  analyzeConvectiveProfile,
  STANDARD_PRESSURE_LEVELS,
  SURFACE_PRESETS,
  type SurfaceTypeKey
} from "@/lib/thermo-cape";
import type { SoundingLevel } from "@/lib/weather-types";
import SkewTCanvas from "./SkewTCanvas";

const SUPERCELL_LEVELS: SoundingLevel[] = [
  { pressure: 1000, altitudeM: 110, temperature: 31, dewPoint: 24, humidity: 66, windSpeedKt: 12, windDirection: 165 },
  { pressure: 925, altitudeM: 760, temperature: 24, dewPoint: 18, humidity: 70, windSpeedKt: 24, windDirection: 185 },
  { pressure: 850, altitudeM: 1500, temperature: 17, dewPoint: 14, humidity: 82, windSpeedKt: 34, windDirection: 205 },
  { pressure: 700, altitudeM: 3050, temperature: 3, dewPoint: -4, humidity: 60, windSpeedKt: 44, windDirection: 235 },
  { pressure: 500, altitudeM: 5600, temperature: -16, dewPoint: -31, humidity: 26, windSpeedKt: 58, windDirection: 255 },
  { pressure: 400, altitudeM: 7300, temperature: -30, dewPoint: -46, humidity: 20, windSpeedKt: 68, windDirection: 260 },
  { pressure: 300, altitudeM: 9200, temperature: -46, dewPoint: -62, humidity: 16, windSpeedKt: 78, windDirection: 265 }
];

function CapeArcGauge({
  cape,
  color,
  label
}: {
  cape: number;
  color: string;
  label: string;
}) {
  const maxScale = 4500;
  const pct = Math.min(1, cape / maxScale);
  const r = 84;
  const circ = 2 * Math.PI * r;
  const arcLen = circ * 0.75; // 270 derece
  const dashOffset = arcLen * (1 - pct);

  return (
    <div className="relative flex flex-col items-center justify-center py-2">
      <svg viewBox="0 0 220 200" className="h-48 w-52" aria-hidden="true">
        <g transform="rotate(135 110 110)">
          <circle
            cx="110"
            cy="110"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="14"
            strokeDasharray={`${arcLen} ${circ}`}
            strokeLinecap="round"
          />
          <circle
            cx="110"
            cy="110"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="14"
            strokeDasharray={`${arcLen} ${circ}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 0.45s ease, stroke 0.35s ease",
              filter: `drop-shadow(0 0 12px ${color})`
            }}
          />
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-5">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-neon-white/55">
          CAPE İndeksi
        </span>
        <span
          className="font-mono text-4xl font-black"
          style={{ color, textShadow: `0 0 24px ${color}55` }}
        >
          {cape}
        </span>
        <span className="font-mono text-xs text-neon-white/65">J/kg · {label}</span>
      </div>
    </div>
  );
}

export default function CapeLabView() {
  const { bundle, activeLocation } = useWeather();

  const [labMode, setLabMode] = useState<"live" | "simulator">("live");
  const [surfaceType, setSurfaceType] = useState<SurfaceTypeKey>("grass");
  const [surfaceTempC, setSurfaceTempC] = useState(
    Math.round(bundle.current.temperature)
  );
  const [surfaceHumidity, setSurfaceHumidity] = useState(bundle.current.humidity);
  const [surfacePressureHpa, setSurfacePressureHpa] = useState(
    bundle.current.pressure
  );
  const [levels, setLevels] = useState<SoundingLevel[]>(
    bundle.sounding.length === 7 ? bundle.sounding : STANDARD_PRESSURE_LEVELS
  );

  // Şehir değiştiğinde Canlı Mod verilerini otomatik senkronla
  useEffect(() => {
    if (labMode !== "live") return;
    setSurfaceTempC(Math.round(bundle.current.temperature));
    setSurfaceHumidity(bundle.current.humidity);
    setSurfacePressureHpa(bundle.current.pressure);
    setLevels(
      bundle.sounding.length === 7 ? bundle.sounding : STANDARD_PRESSURE_LEVELS
    );
  }, [bundle, labMode]);

  const activePreset = SURFACE_PRESETS[surfaceType];

  const analysis = useMemo(
    () =>
      analyzeConvectiveProfile({
        surfaceType,
        surfaceTempC,
        surfaceHumidity,
        surfacePressureHpa,
        levels,
        applySurfacePhysics: labMode === "simulator"
      }),
    [surfaceType, surfaceTempC, surfaceHumidity, surfacePressureHpa, levels, labMode]
  );

  const loadSupercellDemo = () => {
    setLabMode("simulator");
    setSurfaceType("grass");
    setSurfaceTempC(31);
    setSurfaceHumidity(72);
    setSurfacePressureHpa(1004);
    setLevels(SUPERCELL_LEVELS);
  };

  const resetToLive = () => {
    setLabMode("live");
    setSurfaceTempC(Math.round(bundle.current.temperature));
    setSurfaceHumidity(bundle.current.humidity);
    setSurfacePressureHpa(bundle.current.pressure);
    setLevels(
      bundle.sounding.length === 7 ? bundle.sounding : STANDARD_PRESSURE_LEVELS
    );
  };

  const updateLevelField = (
    pressure: number,
    field: "temperature" | "dewPoint",
    value: number
  ) => {
    setLabMode("simulator");
    setLevels((prev) =>
      prev.map((lvl) =>
        lvl.pressure === pressure ? { ...lvl, [field]: value } : lvl
      )
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Üst Başlık ve Mod Geçişi */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-neon-orange">
            <Activity className="h-4 w-4" />
            Konvektif Termodinamik & Skew-T Log-P Laboratuvarı
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-neon-white sm:text-4xl">
            CAPE & Fırtına Analiz Laboratuvarı
          </h1>
          <p className="mt-1 text-sm text-neon-white/65">
            {activeLocation.name} için canlı 1000–300 hPa atmosfer profilini incele veya yüzey/katman parametreleriyle anlık fırtına simüle et.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-2xl border border-white/15 bg-night-900/80 p-1">
            <button
              type="button"
              onClick={resetToLive}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                labMode === "live"
                  ? "bg-neon-cyan/20 text-neon-cyan"
                  : "text-neon-white/70 hover:text-neon-white"
              }`}
            >
              Canlı ({activeLocation.name})
            </button>
            <button
              type="button"
              onClick={() => setLabMode("simulator")}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                labMode === "simulator"
                  ? "bg-neon-orange/25 text-neon-orange"
                  : "text-neon-white/70 hover:text-neon-white"
              }`}
            >
              İnteraktif Simülatör
            </button>
          </div>

          <button
            type="button"
            onClick={loadSupercellDemo}
            className="inline-flex items-center gap-1.5 rounded-xl border border-neon-orange/50 bg-neon-orange/15 px-3.5 py-2.5 text-xs font-semibold text-neon-orange hover:bg-neon-orange/25 transition-colors"
          >
            <Flame className="h-4 w-4" />
            Süper Hücre Testi
          </button>

          <button
            type="button"
            onClick={resetToLive}
            aria-label="Canlı verilere sıfırla"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs text-neon-white/80 hover:bg-white/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Sıfırla
          </button>
        </div>
      </div>

      {/* Üst Ana Izgara: CAPE Gauge + Konvektif İndeksler + Canlı Skew-T */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
        {/* Sol: CAPE Gauge, Seviyeler & 5 İndeks */}
        <div className="space-y-5">
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-display text-sm font-semibold text-neon-white">
                <Zap className="h-4 w-4 text-neon-orange" />
                Konvektif Enerji Özeti
              </span>
              <span
                className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${analysis.capeRisk.badgeClass}`}
              >
                Risk: {analysis.capeRisk.label}
              </span>
            </div>

            <CapeArcGauge
              cape={analysis.cape}
              color={analysis.capeRisk.color}
              label={analysis.capeRisk.label}
            />

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 font-mono text-xs">
              <div className="glass-card p-3">
                <span className="text-neon-white/55">CIN</span>
                <p className="mt-0.5 text-base font-bold text-neon-cyan">
                  {analysis.cin} <span className="text-xs font-normal">J/kg</span>
                </p>
              </div>
              <div className="glass-card p-3">
                <span className="text-neon-white/55">LCL</span>
                <p className="mt-0.5 text-base font-bold text-amber-300">
                  {analysis.lclHeightM} m
                </p>
                <span className="text-[11px] text-neon-white/45">
                  {analysis.lclPressureHpa} hPa
                </span>
              </div>
              <div className="glass-card p-3">
                <span className="text-neon-white/55">LFC</span>
                <p className="mt-0.5 text-base font-bold text-neon-orange">
                  {analysis.lfcPressureHpa ? `${analysis.lfcPressureHpa} hPa` : "Yok"}
                </p>
              </div>
              <div className="glass-card p-3">
                <span className="text-neon-white/55">EL</span>
                <p className="mt-0.5 text-base font-bold text-neon-violet">
                  {analysis.elPressureHpa ? `${analysis.elPressureHpa} hPa` : "Yok"}
                </p>
              </div>
            </div>

            {labMode === "live" && bundle.nativeConvective.cape !== null && (
              <p className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 font-mono text-xs text-neon-white/70">
                Open-Meteo Model Referansı → CAPE: {bundle.nativeConvective.cape} J/kg ·
                LI: {bundle.nativeConvective.liftedIndex ?? "--"} · Donma Seviyesi:{" "}
                {bundle.nativeConvective.freezingLevelM ?? "--"} m
              </p>
            )}
          </div>

          {/* 5 Konvektif İndeks */}
          <div className="glass-panel p-5 space-y-3">
            <h2 className="font-display text-sm font-semibold text-neon-white">
              5 Konvektif Kararsızlık İndeksi
            </h2>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 font-mono text-xs">
              <div className="glass-card p-3">
                <span className="text-neon-white/55">Lifted Index (LI)</span>
                <p
                  className="mt-1 text-xl font-bold"
                  style={{ color: analysis.liRisk.color }}
                >
                  {analysis.liftedIndex > 0 ? `+${analysis.liftedIndex}` : analysis.liftedIndex}
                </p>
                <span className="text-neon-white/55">{analysis.liRisk.label}</span>
              </div>

              <div className="glass-card p-3">
                <span className="text-neon-white/55">Showalter (SI)</span>
                <p className="mt-1 text-xl font-bold text-neon-cyan">
                  {analysis.showalterIndex > 0
                    ? `+${analysis.showalterIndex}`
                    : analysis.showalterIndex}
                </p>
                <span className="text-neon-white/55">850→500 hPa</span>
              </div>

              <div className="glass-card p-3">
                <span className="text-neon-white/55">K-Index</span>
                <p
                  className="mt-1 text-xl font-bold"
                  style={{ color: analysis.kRisk.color }}
                >
                  {analysis.kIndex}
                </p>
                <span className="text-neon-white/55">{analysis.kRisk.label}</span>
              </div>

              <div className="glass-card p-3">
                <span className="text-neon-white/55">Total Totals (TT)</span>
                <p className="mt-1 text-xl font-bold text-amber-300">
                  {analysis.totalTotals}
                </p>
                <span className="text-neon-white/55">
                  {analysis.totalTotals >= 52 ? "Şiddetli risk" : "Normal"}
                </span>
              </div>

              <div className="glass-card p-3 col-span-2 sm:col-span-2">
                <span className="text-neon-white/55">SWEAT Index (Rüzgar Kırılması + Nem)</span>
                <p className="mt-1 text-xl font-bold text-neon-violet">
                  {analysis.sweatIndex}
                </p>
                <span className="text-neon-white/55">
                  {analysis.sweatIndex >= 300
                    ? "Şiddetli konvektif fırtına eşiği"
                    : "Düşük / orta rüzgar kırılması"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ: Canlı Skew-T Log-P Diyagramı */}
        <div className="glass-panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-neon-white">
                Canlı Skew-T Log-P Diyagramı
              </h2>
              <p className="text-xs text-neon-white/55">
                Eğik izotermler · Logaritmik basınç (1000 → 300 hPa) · Kuru & yaş adyabatik parsel yolu
              </p>
            </div>
            <span className="font-mono text-xs text-neon-cyan">
              Yüzey Td: {analysis.surfaceDewPointC}°C
            </span>
          </div>

          <SkewTCanvas analysis={analysis} />
        </div>
      </div>

      {/* Alt Izgara: Yüzey Parametreleri + 7 Seviyeli Atmosfer Profili */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)]">
        {/* Yüzey Parametreleri */}
        <div className="glass-panel p-5 space-y-5">
          <div>
            <h2 className="font-display text-base font-semibold text-neon-white">
              Yüzey Parametreleri & Zemin Fiziği
            </h2>
            <p className="text-xs text-neon-white/55">
              Slider değişikliği anında simülatör modunu ve Skew-T eğrisini günceller.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(SURFACE_PRESETS) as SurfaceTypeKey[]).map((key) => {
              const p = SURFACE_PRESETS[key];
              const active = surfaceType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setLabMode("simulator");
                    setSurfaceType(key);
                    setSurfaceHumidity((prev) =>
                      Math.max(p.minHumidity, Math.min(p.maxHumidity, prev))
                    );
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    active
                      ? "border-neon-orange/70 bg-neon-orange/20 text-neon-white"
                      : "border-white/10 bg-white/5 text-neon-white/75 hover:bg-white/10"
                  }`}
                >
                  <p className="text-xs font-semibold">{p.label}</p>
                  <p className="font-mono text-[11px] text-neon-white/55">
                    Albedo {p.albedo} · Isı {p.heatAbsorption}
                  </p>
                </button>
              );
            })}
          </div>

          <p className="text-xs text-neon-white/60">{activePreset.description}</p>

          <div className="space-y-4">
            <label className="block space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-neon-white/75">Yüzey Sıcaklığı</span>
                <span className="font-mono font-semibold text-neon-orange">
                  {surfaceTempC}°C (Efektif: {analysis.surfaceEffectiveTempC}°C)
                </span>
              </div>
              <input
                type="range"
                min={-25}
                max={45}
                value={surfaceTempC}
                onChange={(e) => {
                  setLabMode("simulator");
                  setSurfaceTempC(Number(e.target.value));
                }}
                className="atmos-range w-full"
              />
            </label>

            <label className="block space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-neon-white/75">
                  Bağıl Nem ({activePreset.minHumidity}%–{activePreset.maxHumidity}%)
                </span>
                <span className="font-mono font-semibold text-neon-cyan">
                  %{surfaceHumidity}
                </span>
              </div>
              <input
                type="range"
                min={labMode === "simulator" ? activePreset.minHumidity : 5}
                max={labMode === "simulator" ? activePreset.maxHumidity : 100}
                value={surfaceHumidity}
                onChange={(e) => {
                  setLabMode("simulator");
                  setSurfaceHumidity(Number(e.target.value));
                }}
                className="atmos-range w-full"
              />
            </label>

            <label className="block space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-neon-white/75">Yüzey Basıncı</span>
                <span className="font-mono font-semibold text-neon-violet">
                  {surfacePressureHpa} hPa
                </span>
              </div>
              <input
                type="range"
                min={960}
                max={1045}
                value={surfacePressureHpa}
                onChange={(e) => {
                  setLabMode("simulator");
                  setSurfacePressureHpa(Number(e.target.value));
                }}
                className="atmos-range w-full"
              />
            </label>
          </div>
        </div>

        {/* 7 Seviyeli Atmosfer Profili & Hesaplanan Termodinamik Değerler */}
        <div className="glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-neon-white">
              <Layers className="h-4 w-4 text-neon-cyan" />
              7 Basınç Seviyesi Profili & Termodinamik Tablo
            </h2>
            <span className="font-mono text-xs text-neon-white/55">
              T ve Td düzenlenebilir
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 text-neon-white/55">
                  <th className="py-2 pr-3">Basınç</th>
                  <th className="py-2 pr-3">Rakım</th>
                  <th className="py-2 pr-3">T (°C)</th>
                  <th className="py-2 pr-3">Td (°C)</th>
                  <th className="py-2 pr-3">Nem</th>
                  <th className="py-2 pr-3">w (g/kg)</th>
                  <th className="py-2 pr-3">Tv (K)</th>
                  <th className="py-2 pr-3">θ (K)</th>
                  <th className="py-2">θe (K)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {analysis.levels.map((lvl) => (
                  <tr key={lvl.pressure} className="hover:bg-white/[0.03]">
                    <td className="py-2.5 pr-3 font-semibold text-neon-cyan">
                      {lvl.pressure} hPa
                    </td>
                    <td className="py-2.5 pr-3 text-neon-white/60">
                      ~{lvl.altitudeM}m
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        step={0.5}
                        value={lvl.temperature}
                        onChange={(e) =>
                          updateLevelField(
                            lvl.pressure,
                            "temperature",
                            Number(e.target.value)
                          )
                        }
                        aria-label={`${lvl.pressure} hPa sıcaklık`}
                        className="w-16 rounded-lg border border-white/15 bg-night-950/80 px-2 py-1 text-neon-white focus:border-neon-orange focus:outline-none"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        step={0.5}
                        value={lvl.dewPoint}
                        onChange={(e) =>
                          updateLevelField(
                            lvl.pressure,
                            "dewPoint",
                            Number(e.target.value)
                          )
                        }
                        aria-label={`${lvl.pressure} hPa çiy noktası`}
                        className="w-16 rounded-lg border border-white/15 bg-night-950/80 px-2 py-1 text-emerald-300 focus:border-neon-cyan focus:outline-none"
                      />
                    </td>
                    <td className="py-2.5 pr-3 text-neon-white/80">%{lvl.humidity}</td>
                    <td className="py-2.5 pr-3 text-neon-white/80">
                      {lvl.mixingRatioGKg}
                    </td>
                    <td className="py-2.5 pr-3 text-neon-white/80">
                      {lvl.virtualTempK}
                    </td>
                    <td className="py-2.5 pr-3 text-amber-200">
                      {lvl.potentialTempK}
                    </td>
                    <td className="py-2.5 text-neon-orange">
                      {lvl.equivPotentialTempK}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
