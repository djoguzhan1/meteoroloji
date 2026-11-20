"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Layers, RefreshCw } from "lucide-react";
import { useWeather } from "@/context/WeatherContext";
import { analyzeConvectiveProfile } from "@/lib/thermo-cape";
import { windDirectionToCompass } from "@/lib/weather";
import ModelComparisonChart from "./ModelComparisonChart";
import SkewTCanvas from "./SkewTCanvas";

export default function CapeLabView() {
  const { bundle, activeLocation, unit, error, refreshWeather } = useWeather();
  const [soundingIndex, setSoundingIndex] = useState(0);

  // Şehir değiştiğinde sondaj saatini anlık (0. saat) profiline sıfırla
  useEffect(() => {
    setSoundingIndex(0);
  }, [activeLocation.id]);

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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-ink-muted">
            Sayısal Tahmin Modelleri & Dikey Sondaj
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink-primary">
            Sondaj & Modeller
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {activeLocation.name} için ECMWF, GFS ve ICON 72 saatlik model karşılaştırması ve 48 saatlik gerçek 1000–300 hPa dikey atmosfer profili.
          </p>
        </div>
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

          {/* Üst Izgara: Termodinamik & Kararsızlık Metrikleri + Gerçek Skew-T */}
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)]">
            <div className="space-y-5">
              {/* Konvektif Enerji & Rüzgar Kırılması */}
              <div className="surface-panel p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-sm font-semibold text-ink-primary">
                    Konvektif Enerji & Dinamik Kesit
                  </h2>
                  <span
                    className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium ${analysis.capeRisk.badgeClass}`}
                  >
                    Risk: {analysis.capeRisk.label}
                  </span>
                </div>

                {/* Minimalist Enstrüman CAPE Göstergesi */}
                <div className="surface-tile p-4 space-y-2.5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                      Hesaplanan CAPE
                    </span>
                    <span
                      className="font-mono text-3xl font-semibold tabular"
                      style={{ color: analysis.capeRisk.color }}
                    >
                      {analysis.cape}{" "}
                      <span className="text-xs font-normal text-ink-muted">J/kg</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (analysis.cape / 3500) * 100)}%`,
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

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 font-mono text-xs tabular">
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">CIN</span>
                    <p className="mt-0.5 text-base font-semibold text-signal-sky">
                      {analysis.cin} <span className="text-[11px] font-normal">J/kg</span>
                    </p>
                  </div>
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">LCL</span>
                    <p className="mt-0.5 text-base font-semibold text-ink-primary">
                      {analysis.lclHeightM} m
                    </p>
                    <span className="text-[10px] text-ink-muted">
                      {analysis.lclPressureHpa} hPa
                    </span>
                  </div>
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">LFC / EL</span>
                    <p className="mt-0.5 text-sm font-semibold text-ink-primary">
                      {analysis.lfcPressureHpa ? `${analysis.lfcPressureHpa}` : "—"} /{" "}
                      {analysis.elPressureHpa ? `${analysis.elPressureHpa}` : "—"}
                    </p>
                    <span className="text-[10px] text-ink-muted">hPa</span>
                  </div>
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">0–6 km Shear</span>
                    <p className="mt-0.5 text-base font-semibold text-signal-amber">
                      {analysis.bulkShear06Kt} kt
                    </p>
                    <span className="text-[10px] text-ink-muted">1000→500 hPa</span>
                  </div>
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">700–500 Lapse</span>
                    <p className="mt-0.5 text-base font-semibold text-ink-primary">
                      {analysis.lapseRate700500}°/km
                    </p>
                    <span className="text-[10px] text-ink-muted">Orta troposfer</span>
                  </div>
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">0°C Donma</span>
                    <p className="mt-0.5 text-base font-semibold text-signal-sky">
                      {selectedHour?.freezingLevelM !== null &&
                      selectedHour?.freezingLevelM !== undefined
                        ? `${selectedHour.freezingLevelM} m`
                        : bundle.nativeConvective.freezingLevelM !== null
                          ? `${bundle.nativeConvective.freezingLevelM} m`
                          : "—"}
                    </p>
                    <span className="text-[10px] text-ink-muted">İzoterm seviyesi</span>
                  </div>
                </div>

                <p className="rounded-lg border border-white/[0.07] bg-obsidian-950/60 px-3 py-2 font-mono text-[11px] text-ink-secondary tabular">
                  Open-Meteo Model Referansı → CAPE:{" "}
                  {selectedHour?.cape ?? bundle.nativeConvective.cape ?? "—"} J/kg · LI:{" "}
                  {selectedHour?.liftedIndex ?? bundle.nativeConvective.liftedIndex ?? "—"} · Yüzey
                  Td: {analysis.surfaceDewPointC}°C
                </p>
              </div>

              {/* 5 Konvektif Kararsızlık İndeksi */}
              <div className="surface-panel p-5 space-y-3">
                <h2 className="font-display text-sm font-semibold text-ink-primary">
                  Konvektif Kararsızlık İndeksleri
                </h2>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 font-mono text-xs tabular">
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">Lifted Index</span>
                    <p
                      className="mt-1 text-lg font-semibold"
                      style={{ color: analysis.liRisk.color }}
                    >
                      {analysis.liftedIndex > 0
                        ? `+${analysis.liftedIndex}`
                        : analysis.liftedIndex}
                    </p>
                    <span className="text-[11px] text-ink-muted">{analysis.liRisk.label}</span>
                  </div>

                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">Showalter (SI)</span>
                    <p className="mt-1 text-lg font-semibold text-signal-sky">
                      {analysis.showalterIndex > 0
                        ? `+${analysis.showalterIndex}`
                        : analysis.showalterIndex}
                    </p>
                    <span className="text-[11px] text-ink-muted">850→500 hPa</span>
                  </div>

                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">K-Index</span>
                    <p
                      className="mt-1 text-lg font-semibold"
                      style={{ color: analysis.kRisk.color }}
                    >
                      {analysis.kIndex}
                    </p>
                    <span className="text-[11px] text-ink-muted">{analysis.kRisk.label}</span>
                  </div>

                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">Total Totals</span>
                    <p className="mt-1 text-lg font-semibold text-signal-amber">
                      {analysis.totalTotals}
                    </p>
                    <span className="text-[11px] text-ink-muted">
                      {analysis.totalTotals >= 52 ? "Yüksek kararsızlık" : "Normal"}
                    </span>
                  </div>

                  <div className="surface-tile p-3 col-span-2">
                    <span className="text-ink-muted">SWEAT Index</span>
                    <p className="mt-1 text-lg font-semibold text-ink-primary">
                      {analysis.sweatIndex}
                    </p>
                    <span className="text-[11px] text-ink-muted">
                      {analysis.sweatIndex >= 300
                        ? "Şiddetli konvektif fırtına eşiği"
                        : "Düşük / orta dinamik kırılma"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ: Gerçek Skew-T Log-P Diyagramı */}
            <div className="surface-panel p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-semibold text-ink-primary">
                    Skew-T Log-P Diyagramı
                  </h2>
                  <p className="text-xs text-ink-muted">
                    Eğik izotermler · Logaritmik basınç (1000 → 300 hPa) · Gerçek dikey profil
                  </p>
                </div>
                <span className="font-mono text-xs text-signal-sky tabular">
                  Yüzey Td: {analysis.surfaceDewPointC}°C
                </span>
              </div>

              <SkewTCanvas analysis={analysis} />
            </div>
          </div>

          {/* 7 Basınç Seviyesi Salt-Okunur Gerçek Profil Tablosu */}
          <div className="surface-panel p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-ink-primary">
                <Layers className="h-4 w-4 text-signal-sky" />
                7 Basınç Seviyesi Dikey Ölçüm Profili (1000 → 300 hPa)
              </h2>
              <span className="font-mono text-[11px] text-ink-muted">
                Kaynak: Open-Meteo Pressure Levels · Salt Okunur Gerçek Veri
              </span>
            </div>

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
                      <td className="py-2.5 pr-3 text-ink-muted">~{lvl.altitudeM} m</td>
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
          </div>
        </div>
      )}
    </div>
  );
}
