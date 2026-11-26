"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Clock, Layers, RefreshCw } from "lucide-react";
import { useWeather } from "@/context/WeatherContext";
import { analyzeConvectiveProfile } from "@/lib/thermo-cape";
import { windDirectionToCompass } from "@/lib/weather";
import ModelComparisonChart from "./ModelComparisonChart";
import SkewTCanvas from "./SkewTCanvas";
import AnimatedNumber from "./AnimatedNumber";

export default function CapeLabView() {
  const { bundle, activeLocation, unit, error, refreshWeather } = useWeather();
  const [soundingPick, setSoundingPick] = useState<{ locId: string; idx: number }>({
    locId: activeLocation.id,
    idx: 0
  });
  const [showRawTable, setShowRawTable] = useState(false);

  const soundingIndex =
    soundingPick.locId === activeLocation.id ? soundingPick.idx : 0;
  const setSoundingIndex = (idx: number) =>
    setSoundingPick({ locId: activeLocation.id, idx });

  const maxSoundingIdx = useMemo(() => {
    if (!bundle) return 0;
    const count = Math.min(
      bundle.hourly.length,
      bundle.hourlySoundings.length || 1
    );
    return Math.max(0, count - 1);
  }, [bundle]);

  const safeIdx = Math.max(0, Math.min(maxSoundingIdx, soundingIndex));

  const selectedHour = bundle?.hourly[safeIdx] ?? null;
  const selectedLevels = useMemo(() => {
    if (!bundle) return [];
    const fromHourly = bundle.hourlySoundings[safeIdx];
    if (fromHourly && fromHourly.length >= 2) return fromHourly;
    return bundle.sounding;
  }, [bundle, safeIdx]);

  const analysis = useMemo(() => {
    if (!bundle || selectedLevels.length < 2) return null;
    const isNow = safeIdx === 0;
    const surfaceTempC = isNow
      ? bundle.current.temperature
      : selectedHour?.temperature ?? bundle.current.temperature;
    const surfaceHumidity = isNow
      ? bundle.current.humidity
      : selectedHour?.humidity ?? bundle.current.humidity;
    const surfacePressureHpa = isNow
      ? bundle.current.pressure
      : selectedHour?.pressure ?? bundle.current.pressure;

    return analyzeConvectiveProfile({
      surfaceTempC,
      surfaceHumidity,
      surfacePressureHpa,
      levels: selectedLevels
    });
  }, [bundle, safeIdx, selectedHour, selectedLevels]);

  const quickJumps = [0, 3, 6, 12, 24, 36, 47].filter((h) => h <= maxSoundingIdx);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Üst Başlık */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-primary">
          Modeller &amp; Sondaj
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-ink-secondary">
          {activeLocation.name} · 7 Tier-1 model karşılaştırması ve 48 saatlik Skew-T radyosonda
        </p>
      </div>

      {/* 1. Bölüm: Gerçek 72 Saatlik ECMWF / GFS / ICON Çoklu Model Karşılaştırması */}
      <ModelComparisonChart location={activeLocation} unit={unit} />

      {/* 2. Bölüm: Gerçek 48 Saatlik Radyosonda (1000 → 300 hPa) */}
      {!bundle || !analysis ? (
        <div className="surface-panel p-8 text-center space-y-3">
          <p className="text-sm text-ink-secondary">
            {error ?? "Dikey atmosfer sondaj verileri şu an yüklenemedi."}
          </p>
          <button
            type="button"
            onClick={() => void refreshWeather()}
            className="inline-flex items-center gap-2 rounded-xl bg-ink-primary px-4 py-2 text-xs font-medium text-obsidian-950 hover:bg-white"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Tekrar Dene
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* 48 Saatlik Gerçek Sondaj Zaman Çubuğu */}
          <div className="surface-panel p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-signal-sky" />
                <span className="font-display text-sm font-semibold text-ink-primary">
                  48 Saatlik Gerçek Radyosonda Profili (1000 → 300 hPa)
                </span>
              </div>
              <div className="font-mono text-xs text-ink-secondary tabular">
                {safeIdx === 0
                  ? `Anlık (${selectedHour?.hourLabel ?? "--:--"})`
                  : `+${safeIdx}s · ${selectedHour?.dayLabel ?? ""} ${selectedHour?.hourLabel ?? ""}`}
                {" · "}Yüzey {Math.round(selectedHour?.temperature ?? bundle.current.temperature)}°C · %
                {selectedHour?.humidity ?? bundle.current.humidity} ·{" "}
                {selectedHour?.pressure ?? bundle.current.pressure} hPa
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="range"
                min={0}
                max={maxSoundingIdx}
                value={safeIdx}
                onChange={(e) => setSoundingIndex(Number(e.target.value))}
                aria-label="Radyosonda tahmin saati"
                className="meteo-range flex-1 min-w-[200px]"
              />
              <div className="flex flex-wrap gap-1">
                {quickJumps.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSoundingIndex(h)}
                    className={`rounded-md border px-2 py-1 font-mono text-[11px] tabular transition-colors ${
                      safeIdx === h
                        ? "border-white/25 bg-white/15 text-ink-primary"
                        : "border-white/[0.08] bg-white/[0.03] text-ink-muted hover:text-ink-primary"
                    }`}
                  >
                    {h === 0 ? "Şimdi" : `+${h}s`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Üst Izgara: Birleşik Termodinamik & Fırtına Profili + Gerçek Skew-T */}
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
            <div className="surface-panel p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-sm font-semibold text-ink-primary">
                    Termodinamik &amp; Fırtına Profili
                  </h2>
                  <span
                    className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium ${analysis.capeRisk.badgeClass}`}
                  >
                    Risk: {analysis.capeRisk.label}
                  </span>
                </div>

                {/* MUCAPE / SBCAPE / MLCAPE Göstergesi */}
                <div className="surface-tile p-4 space-y-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                      MUCAPE
                    </span>
                    <span
                      className="font-mono text-3xl font-semibold tabular"
                      style={{ color: analysis.capeRisk.color }}
                    >
                      <AnimatedNumber value={analysis.mucape} />{" "}
                      <span className="text-xs font-normal text-ink-muted">
                        J/kg (SB {analysis.cape} · ML {analysis.mlcape})
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (Math.max(analysis.mucape, analysis.cape) / 3500) * 100)}%`,
                        backgroundColor: analysis.capeRisk.color
                      }}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-ink-muted tabular">
                    <span>0</span>
                    <span>500</span>
                    <span>1500</span>
                    <span>2500</span>
                    <span>3500+ J/kg</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2 font-mono text-xs tabular">
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">CIN / MUCIN</span>
                    <p className="mt-0.5 text-base font-semibold text-signal-sky">
                      {analysis.cin} <span className="text-[11px] font-normal">J/kg</span>
                    </p>
                    <span className="text-[10px] text-ink-muted">
                      MU @{analysis.muParcelPressureHpa} hPa
                    </span>
                  </div>
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">0–3 km SRH</span>
                    <p className="mt-0.5 text-base font-semibold text-signal-amber">
                      {analysis.srh03} <span className="text-[11px] font-normal">m²/s²</span>
                    </p>
                    <span className="text-[10px] text-ink-muted">Bunkers Right</span>
                  </div>
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">Süper Hücre SCP</span>
                    <p
                      className={`mt-0.5 text-base font-semibold ${
                        analysis.scp >= 1 ? "text-signal-rose" : "text-ink-primary"
                      }`}
                    >
                      {analysis.scp.toFixed(2)}
                    </p>
                    <span className="text-[10px] text-ink-muted">
                      {analysis.scp >= 1 ? "Mezosiklon eşiği" : "Düşük dönme"}
                    </span>
                  </div>
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">0–6 km Shear</span>
                    <p className="mt-0.5 text-base font-semibold text-signal-amber">
                      {analysis.bulkShear06Kt} kt
                    </p>
                    <span className="text-[10px] text-ink-muted">1000→500 hPa</span>
                  </div>
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">DCAPE / Islak Tw</span>
                    <p className="mt-0.5 text-base font-semibold text-signal-sky">
                      {analysis.dcape} <span className="text-[11px] font-normal">J/kg</span>
                    </p>
                    <span className="text-[10px] text-ink-muted">
                      Tw {analysis.wetBulbC}°C
                    </span>
                  </div>
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">Lifted Index</span>
                    <p
                      className="mt-0.5 text-base font-semibold"
                      style={{ color: analysis.liRisk.color }}
                    >
                      {analysis.liftedIndex > 0
                        ? `+${analysis.liftedIndex}`
                        : analysis.liftedIndex}
                    </p>
                    <span className="text-[10px] text-ink-muted">{analysis.liRisk.label}</span>
                  </div>
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">K-Index</span>
                    <p
                      className="mt-0.5 text-base font-semibold"
                      style={{ color: analysis.kRisk.color }}
                    >
                      {analysis.kIndex}
                    </p>
                    <span className="text-[10px] text-ink-muted">{analysis.kRisk.label}</span>
                  </div>
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">500–1000 Kalınlık</span>
                    <p
                      className={`mt-0.5 text-base font-semibold ${
                        analysis.thickness5001000Dam <= 540
                          ? "text-signal-sky"
                          : "text-ink-primary"
                      }`}
                    >
                      {analysis.thickness5001000Dam} dam
                    </p>
                    <span className="text-[10px] text-ink-muted">
                      {analysis.thickness5001000Dam <= 540
                        ? "≤540 Kar eşiği"
                        : `Lapse ${analysis.lapseRate700500}°/km`}
                    </span>
                  </div>
                </div>
              </div>

              <p className="rounded-lg border border-white/[0.07] bg-obsidian-950/60 px-3 py-2 font-mono text-[11px] text-ink-secondary tabular">
                LCL {analysis.lclHeightM} m · SI {analysis.showalterIndex > 0 ? `+${analysis.showalterIndex}` : analysis.showalterIndex} · TT {analysis.totalTotals} · SWEAT {analysis.sweatIndex} · Td {analysis.surfaceDewPointC}°C
              </p>
            </div>

            {/* Sağ: Gerçek Skew-T Log-P Diyagramı */}
            <div className="surface-panel p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-semibold text-ink-primary">
                    Skew-T Log-P Diyagramı
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Eğik izotermler · 1000 → 300 hPa dikey sondaj
                  </p>
                </div>
                <span className="font-mono text-xs text-signal-sky tabular">
                  Yüzey Td: {analysis.surfaceDewPointC}°C
                </span>
              </div>

              <SkewTCanvas analysis={analysis} />
            </div>
          </div>

          {/* 7 Basınç Seviyesi Ham Tablo (İsteğe Bağlı Katlanabilir) */}
          <div className="surface-panel p-4 sm:p-5 space-y-4">
            <button
              type="button"
              onClick={() => setShowRawTable((v) => !v)}
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <span className="flex items-center gap-2 font-display text-sm font-semibold text-ink-primary">
                <Layers className="h-4 w-4 text-signal-sky" />
                7 Basınç Seviyesi Dikey Ölçüm Tablosu (1000 → 300 hPa)
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-ink-secondary">
                <span>{showRawTable ? "Gizle" : "Göster"}</span>
                {showRawTable ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </span>
            </button>

            {showRawTable && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left font-mono text-xs tabular">
                  <thead>
                    <tr className="border-b border-white/10 text-ink-muted">
                      <th className="py-2 pr-3 font-medium">Basınç</th>
                      <th className="py-2 pr-3 font-medium">Rakım</th>
                      <th className="py-2 pr-3 font-medium">T (°C)</th>
                      <th className="py-2 pr-3 font-medium">Td (°C)</th>
                      <th className="py-2 pr-3 font-medium">Nem</th>
                      <th className="py-2 pr-3 font-medium">Rüzgar</th>
                      <th className="py-2 pr-3 font-medium">w (g/kg)</th>
                      <th className="py-2 pr-3 font-medium">Tv (K)</th>
                      <th className="py-2 pr-3 font-medium">θ (K)</th>
                      <th className="py-2 font-medium">θe (K)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.07]">
                    {analysis.levels.map((lvl) => (
                      <tr key={lvl.pressure} className="hover:bg-white/[0.025]">
                        <td className="py-2.5 pr-3 font-semibold text-signal-sky">
                          {lvl.pressure} hPa
                        </td>
                        <td className="py-2.5 pr-3 text-ink-muted">{lvl.altitudeM} m</td>
                        <td className="py-2.5 pr-3 font-medium text-ink-primary">
                          {lvl.temperature > 0 ? `+${lvl.temperature}` : lvl.temperature}°
                        </td>
                        <td className="py-2.5 pr-3 text-signal-emerald">
                          {lvl.dewPoint > 0 ? `+${lvl.dewPoint}` : lvl.dewPoint}°
                        </td>
                        <td className="py-2.5 pr-3 text-ink-secondary">%{lvl.humidity}</td>
                        <td className="py-2.5 pr-3 text-ink-secondary">
                          {lvl.windSpeedKt} kt · {windDirectionToCompass(lvl.windDirection)}
                        </td>
                        <td className="py-2.5 pr-3 text-ink-secondary">
                          {lvl.mixingRatioGKg}
                        </td>
                        <td className="py-2.5 pr-3 text-ink-secondary">
                          {lvl.virtualTempK}
                        </td>
                        <td className="py-2.5 pr-3 text-ink-primary">
                          {lvl.potentialTempK}
                        </td>
                        <td className="py-2.5 text-signal-amber">
                          {lvl.equivPotentialTempK}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
