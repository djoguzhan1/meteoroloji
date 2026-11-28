"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Droplets,
  Layers,
  Mountain,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import { useWeatherData, useWeatherStatus } from "@/context/WeatherContext";
import { areLocationsEquivalent } from "@/lib/forecast-resilience";
import type { CalibrationTier } from "@/lib/provinces/types";
import {
  analyzeConvectiveProfile,
  classifyCapeRisk,
  type ParcelMode
} from "@/lib/thermo-cape";
import {
  formatElevation,
  formatLapseRate,
  formatPressure,
  formatTempDelta,
  formatTemperature,
  windDirectionToCompass
} from "@/lib/weather-client";
import type {
  AtmosCalibrationTierLabel,
  GeoLocation
} from "@/lib/weather-types";
import AnimatedNumber from "./AnimatedNumber";

const ModelComparisonChart = dynamic(() => import("./ModelComparisonChart"), {
  loading: () => (
    <div className="surface-panel p-8 text-center font-mono text-xs text-ink-muted">
      8-Model sinoptik karşılaştırma grafiği hazırlanıyor...
    </div>
  )
});

const SkewTCanvas = dynamic(() => import("./SkewTCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[340px] items-center justify-center rounded-xl border border-white/[0.06] bg-obsidian-950/60 font-mono text-xs text-ink-muted">
      Skew-T Log-P diyagramı çiziliyor...
    </div>
  )
});

const PARCEL_MODES: ReadonlyArray<{
  mode: ParcelMode;
  shortLabel: string;
  capeTitle: string;
  cinTitle: string;
}> = [
  {
    mode: "mu",
    shortLabel: "En Kararsız (MU)",
    capeTitle: "MUCAPE",
    cinTitle: "MUCIN"
  },
  {
    mode: "sb",
    shortLabel: "Yüzey (SB)",
    capeTitle: "SBCAPE",
    cinTitle: "SBCIN"
  },
  {
    mode: "ml",
    shortLabel: "Karışım (ML)",
    capeTitle: "MLCAPE",
    cinTitle: "MLCIN"
  }
];

const VALID_PROVINCE_CODE_RE = /^(?:TR-(?:0[1-9]|[1-7][0-9]|8[01])|GLOBAL)$/i;

function normalizeProvinceCode(raw?: string | null): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const trimmed = raw.trim().toUpperCase();
  return VALID_PROVINCE_CODE_RE.test(trimmed) ? trimmed : undefined;
}

function hasProvinceConflict(
  a?: string | null,
  b?: string | null
): boolean {
  const pa = normalizeProvinceCode(a);
  const pb = normalizeProvinceCode(b);
  if (!pa || !pb) return false;
  return pa !== pb;
}

function resolveLabTierBadge(params: {
  provinceCode?: string | null;
  summaryTier?: CalibrationTier | null;
  engineTier?: AtmosCalibrationTierLabel | null;
}): {
  code: CalibrationTier | "GLOBAL";
  detail: string;
  className: string;
} | null {
  const pc = normalizeProvinceCode(params.provinceCode);
  const { summaryTier, engineTier } = params;

  if (
    pc === "TR-16" &&
    (summaryTier === "TIER_0_BURSA" ||
      engineTier === "BURSA_FROZEN_V5" ||
      (!summaryTier && !engineTier))
  ) {
    return {
      code: "TIER_0_BURSA",
      detail: "Dondurulmuş Referans v5",
      className: "border-emerald-400/35 bg-emerald-500/12 text-emerald-200"
    };
  }

  if (
    summaryTier === "TIER_A_WMO" ||
    engineTier === "TIER_A_EMPIRICAL_WMO"
  ) {
    return {
      code: "TIER_A_WMO",
      detail: "Ampirik WMO + Kalman",
      className: "border-signal-sky/35 bg-signal-sky/12 text-sky-200"
    };
  }

  if (
    summaryTier === "TIER_B_DONOR_KALMAN" ||
    engineTier === "TIER_B_DONOR_ALARO"
  ) {
    return {
      code: "TIER_B_DONOR_KALMAN",
      detail: "Donör EMOS + Kalman",
      className: "border-indigo-400/35 bg-indigo-500/12 text-indigo-200"
    };
  }

  if (pc === "GLOBAL" || engineTier === "GLOBAL") {
    return {
      code: "GLOBAL",
      detail: "Küresel Hibrit NWP",
      className: "border-white/15 bg-white/[0.06] text-ink-secondary"
    };
  }

  return null;
}

export default function CapeLabView() {
  const { bundle: rawBundle, activeLocation, unit } = useWeatherData();
  const { error, isStale, isOffline, loading, refreshWeather } = useWeatherStatus();

  // Katı şehir ve il kodu kalkanı: eski şehrin radyosonda paketi asla yeni şehir başlığı altında gösterilmez
  const bundle = useMemo(() => {
    if (!rawBundle) return null;
    const bundlePc =
      rawBundle.location.provinceCode ??
      rawBundle.provinceSummary?.provinceCode ??
      rawBundle.hybrid?.engineMeta?.provinceCode;
    if (hasProvinceConflict(bundlePc, activeLocation.provinceCode)) {
      return null;
    }
    if (!areLocationsEquivalent(rawBundle.location, activeLocation)) {
      return null;
    }
    return rawBundle;
  }, [rawBundle, activeLocation]);

  const resolvedProvinceCode = useMemo(
    () =>
      normalizeProvinceCode(
        activeLocation.provinceCode ??
          bundle?.location.provinceCode ??
          bundle?.provinceSummary?.provinceCode ??
          bundle?.hybrid?.engineMeta?.provinceCode
      ),
    [
      activeLocation.provinceCode,
      bundle?.location.provinceCode,
      bundle?.provinceSummary?.provinceCode,
      bundle?.hybrid?.engineMeta?.provinceCode
    ]
  );

  const resolvedProvinceName =
    bundle?.provinceSummary?.provinceName ??
    bundle?.hybrid?.engineMeta?.provinceName ??
    undefined;

  const targetElevationM =
    bundle?.location.elevation ??
    activeLocation.elevation ??
    bundle?.provinceSummary?.canonicalCenter.elevationM;

  const enrichedLocation = useMemo<GeoLocation>(
    () => ({
      ...activeLocation,
      ...(resolvedProvinceCode ? { provinceCode: resolvedProvinceCode } : {}),
      ...(targetElevationM !== undefined && Number.isFinite(targetElevationM)
        ? { elevation: Math.round(targetElevationM) }
        : {})
    }),
    [activeLocation, resolvedProvinceCode, targetElevationM]
  );

  const locIsolationKey = `${activeLocation.id}::${resolvedProvinceCode ?? ""}`;

  const [labTimeState, setLabTimeState] = useState<{
    locKey: string;
    iso: string | null;
    source: "sounding" | "chart";
  }>({
    locKey: locIsolationKey,
    iso: null,
    source: "sounding"
  });
  const [parcelMode, setParcelMode] = useState<ParcelMode>("mu");
  const [showRawTable, setShowRawTable] = useState(false);

  const activeLabTimeIso =
    labTimeState.locKey === locIsolationKey ? labTimeState.iso : null;
  const activeTimeSource =
    labTimeState.locKey === locIsolationKey ? labTimeState.source : "sounding";

  // Gerçek saatlik radyosonda kapsamı (canlıda 168s, localStorage çevrimdışı yedeğinde 24s olabilir)
  const availableSoundingHours = useMemo(() => {
    if (!bundle) return 0;
    const hourlySoundingLen = bundle.hourlySoundings?.length ?? 0;
    if (hourlySoundingLen > 0) {
      return Math.min(bundle.hourly.length, hourlySoundingLen);
    }
    return bundle.sounding.length >= 2 && bundle.hourly.length > 0 ? 1 : 0;
  }, [bundle]);

  const maxSoundingIdx = useMemo(
    () => Math.max(0, availableSoundingHours - 1),
    [availableSoundingHours]
  );

  const requestedHourIdx = useMemo(() => {
    if (!bundle || !activeLabTimeIso) return 0;
    const exactIdx = bundle.hourly.findIndex((h) => h.time === activeLabTimeIso);
    if (exactIdx !== -1) return exactIdx;
    const prefix = activeLabTimeIso.slice(0, 13);
    const prefixIdx = bundle.hourly.findIndex(
      (h) => h.time.slice(0, 13) === prefix
    );
    return prefixIdx !== -1 ? prefixIdx : 0;
  }, [bundle, activeLabTimeIso]);

  const isClampedToSoundingCeiling =
    availableSoundingHours > 0 && requestedHourIdx > maxSoundingIdx;

  // ASLA sahte T+0 yaması yapılmaz; gerçek availableSoundingHours - 1 sınırına kenetlenir
  const safeIdx = Math.max(0, Math.min(maxSoundingIdx, requestedHourIdx));
  const activeHour = bundle?.hourly[safeIdx] ?? null;

  const setSoundingHourByIdx = useCallback(
    (idx: number) => {
      if (!bundle) return;
      const clamped = Math.max(0, Math.min(maxSoundingIdx, idx));
      const targetIso = bundle.hourly[clamped]?.time ?? null;
      setLabTimeState({
        locKey: locIsolationKey,
        iso: targetIso,
        source: "sounding"
      });
    },
    [bundle, maxSoundingIdx, locIsolationKey]
  );

  const handleChartTimeSync = useCallback(
    (iso: string | null) => {
      if (!iso) return;
      setLabTimeState({
        locKey: locIsolationKey,
        iso,
        source: "chart"
      });
    },
    [locIsolationKey]
  );

  const selectedLevels = useMemo(() => {
    if (!bundle || availableSoundingHours === 0) return [];
    if (bundle.hourlySoundings.length > 0) {
      const levelsAtHour = bundle.hourlySoundings[safeIdx];
      return levelsAtHour && levelsAtHour.length >= 2 ? levelsAtHour : [];
    }
    return safeIdx === 0 ? bundle.sounding : [];
  }, [bundle, availableSoundingHours, safeIdx]);

  const surfaceConditions = useMemo(() => {
    if (!bundle) return null;
    const isNow = safeIdx === 0;
    return {
      tempC: isNow
        ? bundle.current.temperature
        : (activeHour?.temperature ?? bundle.current.temperature),
      humidity: isNow
        ? bundle.current.humidity
        : (activeHour?.humidity ?? bundle.current.humidity),
      pressureHpa: isNow
        ? bundle.current.pressure
        : (activeHour?.pressure ?? bundle.current.pressure),
      windSpeedKmh: isNow
        ? bundle.current.windSpeed
        : (activeHour?.windSpeed ?? bundle.current.windSpeed),
      windDirection: isNow
        ? bundle.current.windDirection
        : (activeHour?.windDirection ?? bundle.current.windDirection)
    };
  }, [bundle, safeIdx, activeHour]);

  const analysis = useMemo(() => {
    if (!bundle || !surfaceConditions || selectedLevels.length < 2) return null;
    return analyzeConvectiveProfile({
      surfaceTempC: surfaceConditions.tempC,
      surfaceHumidity: surfaceConditions.humidity,
      surfacePressureHpa: surfaceConditions.pressureHpa,
      elevationM: targetElevationM,
      surfaceWindSpeedKmh: surfaceConditions.windSpeedKmh,
      surfaceWindDirection: surfaceConditions.windDirection,
      levels: selectedLevels
    });
  }, [bundle, targetElevationM, surfaceConditions, selectedLevels]);

  const quickJumps = useMemo(() => {
    const base = [0, 6, 12, 24, 48, 72, 120, 167].filter(
      (h) => h <= maxSoundingIdx
    );
    if (maxSoundingIdx > 0 && !base.includes(maxSoundingIdx)) {
      base.push(maxSoundingIdx);
    }
    return base;
  }, [maxSoundingIdx]);

  const syncedChartIso =
    activeTimeSource === "chart" && activeLabTimeIso
      ? activeLabTimeIso
      : (activeHour?.time ?? null);

  const activeParcel = analysis ? analysis.parcels[parcelMode] : null;
  const activeParcelMeta =
    PARCEL_MODES.find((m) => m.mode === parcelMode) ?? PARCEL_MODES[0];
  const activeParcelRisk = activeParcel
    ? classifyCapeRisk(activeParcel.cape)
    : null;

  const bulkShearText = analysis
    ? unit === "imperial"
      ? `${Math.round(analysis.bulkShear06Kt * 1.15078)} mph (${analysis.bulkShear06Kt} kt)`
      : `${Math.round(analysis.bulkShear06Kt * 1.852)} km/s (${analysis.bulkShear06Kt} kt)`
    : "—";

  const showOfflinePartialSoundingBadge =
    availableSoundingHours > 0 && availableSoundingHours < 72;

  const tierBadge = useMemo(
    () =>
      resolveLabTierBadge({
        provinceCode: resolvedProvinceCode,
        summaryTier: bundle?.provinceSummary?.calibrationTier ?? null,
        engineTier: bundle?.hybrid?.engineMeta?.calibrationTier ?? null
      }),
    [
      resolvedProvinceCode,
      bundle?.provinceSummary?.calibrationTier,
      bundle?.hybrid?.engineMeta?.calibrationTier
    ]
  );

  const activeMicroclimateTags = useMemo(
    () => bundle?.hybrid?.engineMeta?.activeMicroclimateTags ?? [],
    [bundle?.hybrid?.engineMeta?.activeMicroclimateTags]
  );

  const waterTelemetry = useMemo(() => {
    const eng = bundle?.hybrid?.engineMeta;
    if (
      eng?.waterBodyLabelTr &&
      eng.seaOrLakeTempC !== null &&
      eng.seaOrLakeTempC !== undefined &&
      Number.isFinite(eng.seaOrLakeTempC)
    ) {
      return {
        label: eng.waterBodyLabelTr,
        tempC: eng.seaOrLakeTempC
      };
    }
    const wb = bundle?.provinceSummary?.activeWaterBodies?.find(
      (item) => item.liveTempC !== null && item.liveTempC !== undefined && Number.isFinite(item.liveTempC)
    );
    if (wb && wb.liveTempC !== null && wb.liveTempC !== undefined) {
      return {
        label: wb.labelTr,
        tempC: wb.liveTempC
      };
    }
    if (
      resolvedProvinceCode === "TR-16" &&
      eng?.marmaraSstC !== null &&
      eng?.marmaraSstC !== undefined &&
      Number.isFinite(eng.marmaraSstC)
    ) {
      return {
        label: "Marmara Denizi",
        tempC: eng.marmaraSstC
      };
    }
    return null;
  }, [bundle?.hybrid?.engineMeta, bundle?.provinceSummary?.activeWaterBodies, resolvedProvinceCode]);

  const filteredSubterraneanIsobars = useMemo(() => {
    if (!analysis) return [];
    return [1000, 925, 850].filter((p) => p >= analysis.surfacePressureHpa);
  }, [analysis]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Üst Başlık & Seçili İl Kalibrasyon / Mikroiklim Kimliği */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-ink-primary">
            Modeller &amp; Sondaj
          </h1>
          {resolvedProvinceCode && resolvedProvinceCode !== "GLOBAL" && (
            <span className="inline-flex items-center rounded-lg border border-white/15 bg-white/[0.05] px-2.5 py-0.5 font-mono text-xs font-medium text-ink-primary tabular">
              {resolvedProvinceCode}
              {resolvedProvinceName ? ` · ${resolvedProvinceName}` : ""}
            </span>
          )}
          {tierBadge && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 font-mono text-xs font-medium ${tierBadge.className}`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>
                {tierBadge.code} · {tierBadge.detail}
              </span>
            </span>
          )}
          {targetElevationM !== undefined && Number.isFinite(targetElevationM) && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-obsidian-950/75 px-2.5 py-0.5 font-mono text-xs text-ink-secondary tabular">
              <Mountain className="h-3.5 w-3.5 text-signal-sky" />
              <span>Hedef Rakım: {formatElevation(targetElevationM, unit)}</span>
            </span>
          )}
          {waterTelemetry && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-signal-sky/30 bg-signal-sky/10 px-2.5 py-0.5 font-mono text-xs text-sky-200 tabular">
              <Droplets className="h-3.5 w-3.5 text-signal-sky" />
              <span>
                {waterTelemetry.label}:{" "}
                {formatTemperature(waterTelemetry.tempC, unit, {
                  decimals: 1,
                  showUnit: true
                })}
              </span>
            </span>
          )}
        </div>

        <p className="text-xs sm:text-sm text-ink-secondary">
          {activeLocation.name}
          {targetElevationM !== undefined && Number.isFinite(targetElevationM)
            ? ` (${formatElevation(targetElevationM, unit)})`
            : ""}{" "}
          · 8 küresel ve mezoskaleli model karşılaştırması ile{" "}
          {availableSoundingHours > 0 ? availableSoundingHours : 168} saatlik gerçek basınçlı Skew-T radyosonda
        </p>

        {(bundle?.hybrid?.engineMeta?.activeRegimeLabel ||
          activeMicroclimateTags.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {bundle?.hybrid?.engineMeta?.activeRegimeLabel && (
              <span className="inline-flex items-center gap-1 rounded-md border border-signal-sky/30 bg-signal-sky/10 px-2 py-0.5 font-mono text-[11px] text-sky-200">
                <Compass className="h-3 w-3 text-signal-sky" />
                <span>Rejim: {bundle.hybrid.engineMeta.activeRegimeLabel}</span>
              </span>
            )}
            {activeMicroclimateTags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] text-ink-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 1. Bölüm: Gerçek 8-Model Çoklu Ufuk Karşılaştırması (Çift Yönlü Zaman Senkronlu & İl Kilitli) */}
      <ModelComparisonChart
        location={enrichedLocation}
        unit={unit}
        syncedTimeIso={syncedChartIso}
        onInspectTimeChange={handleChartTimeSync}
        provinceSummary={bundle?.provinceSummary ?? null}
        engineMeta={bundle?.hybrid?.engineMeta ?? null}
      />

      {/* 2. Bölüm: Gerçek Basınçlı Radyosonda (Psfc → 300 hPa) */}
      {!bundle || !analysis || !activeParcel || !activeParcelRisk || !surfaceConditions ? (
        <div className="surface-panel p-8 text-center space-y-3">
          <p className="text-sm text-ink-secondary">
            {loading && !error
              ? `${activeLocation.name} için dikey sondaj profili hazırlanıyor...`
              : (error ??
                "Bu konum için kayıtlı sondaj önbelleği yok; bağlantı sağlandığında otomatik yüklenecek.")}
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
          {/* Gerçek Sondaj Zaman Çubuğu + Parsel Seçici */}
          <div className="surface-panel p-4 sm:p-5 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Clock className="h-4 w-4 text-signal-sky" />
                <span className="font-display text-sm font-semibold text-ink-primary">
                  {availableSoundingHours} Saatlik Gerçek Radyosonda Profili (
                  {formatPressure(analysis.surfacePressureHpa, unit)} →{" "}
                  {formatPressure(300, unit)})
                </span>
                {showOfflinePartialSoundingBadge && (
                  <span className="rounded-md border border-signal-amber/40 bg-signal-amber/15 px-2.5 py-0.5 font-mono text-[11px] text-amber-200 tabular">
                    Çevrimdışı Önbellek · İlk {availableSoundingHours} Saat Radyosonda Mevcut
                  </span>
                )}
                {(isStale || isOffline) && !showOfflinePartialSoundingBadge && (
                  <span className="rounded-md border border-signal-amber/35 bg-signal-amber/12 px-2 py-0.5 font-mono text-[10px] text-amber-200">
                    Arşiv Profili
                  </span>
                )}
              </div>

              <div className="font-mono text-xs text-ink-secondary tabular">
                {safeIdx === 0
                  ? `Anlık (${activeHour?.hourLabel ?? "--:--"})`
                  : `+${safeIdx}s · ${activeHour?.dayLabel ?? ""} ${activeHour?.hourLabel ?? ""}`}
                {" · "}Yüzey{" "}
                {formatTemperature(surfaceConditions.tempC, unit, {
                  decimals: 1,
                  showUnit: true
                })}{" "}
                · %{Math.round(surfaceConditions.humidity)} · İstasyon{" "}
                {formatPressure(analysis.surfacePressureHpa, unit)} (
                {formatElevation(analysis.stationElevationM, unit)})
              </div>
            </div>

            {filteredSubterraneanIsobars.length > 0 && (
              <p className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 font-mono text-[11px] text-emerald-200 tabular">
                Hipsometrik İrtifa Kenetlemesi ({formatElevation(analysis.stationElevationM, unit)}): Skew-T profili doğrudan istasyon zemini Psfc {formatPressure(analysis.surfacePressureHpa, unit)} düzeyinden başlar; yeraltında kalan {filteredSubterraneanIsobars.join(" / ")} hPa standart seviyeleri süzülmüştür.
              </p>
            )}

            {isClampedToSoundingCeiling && (
              <p className="rounded-lg border border-signal-sky/25 bg-signal-sky/10 px-3 py-1.5 font-mono text-[11px] text-sky-200 tabular">
                Üst model grafiğinde +{requestedHourIdx}s inceleniyor; radyosonda dikey profili mevcut üst sınır olan +{maxSoundingIdx}s ({activeHour?.dayLabel} {activeHour?.hourLabel}) noktasına kenetlendi.
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="range"
                min={0}
                max={maxSoundingIdx}
                value={safeIdx}
                disabled={maxSoundingIdx === 0}
                onChange={(e) => setSoundingHourByIdx(Number(e.target.value))}
                aria-label="Radyosonda tahmin saati"
                className="meteo-range flex-1 min-w-[200px]"
              />
              <div className="flex flex-wrap gap-1">
                {quickJumps.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setSoundingHourByIdx(h)}
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

            {/* Segmentli Parsel Seçici: Skew-T ve CAPE kartının üstünde ortak kontrol */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-ink-muted">Parsel:</span>
                <div
                  role="group"
                  aria-label="Konvektif parsel modu seçici"
                  className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-obsidian-950/80 p-1"
                >
                  {PARCEL_MODES.map((item) => {
                    const selected = parcelMode === item.mode;
                    return (
                      <button
                        key={item.mode}
                        type="button"
                        onClick={() => setParcelMode(item.mode)}
                        className={`rounded-lg px-2.5 py-1 font-mono text-xs font-medium transition-colors ${
                          selected
                            ? "bg-white/15 text-ink-primary"
                            : "text-ink-secondary hover:text-ink-primary"
                        }`}
                      >
                        {item.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
              <span className="font-mono text-[11px] text-ink-muted tabular">
                Kalkış: {formatPressure(activeParcel.startPressureHpa, unit)} ·{" "}
                {formatTemperature(activeParcel.startTempC, unit, {
                  decimals: 1,
                  showUnit: true
                })}{" "}
                / Td{" "}
                {formatTemperature(activeParcel.startDewPointC, unit, {
                  decimals: 1,
                  showUnit: true
                })}
              </span>
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
                    className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium ${activeParcelRisk.badgeClass}`}
                  >
                    Risk: {activeParcelRisk.label}
                  </span>
                </div>

                {/* Seçili Parsel CAPE Göstergesi (MUCAPE / SBCAPE / MLCAPE) */}
                <div className="surface-tile p-4 space-y-2.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                      {activeParcelMeta.capeTitle}
                    </span>
                    <span
                      className="font-mono text-3xl font-semibold tabular"
                      style={{ color: activeParcelRisk.color }}
                    >
                      <AnimatedNumber value={activeParcel.cape} />{" "}
                      <span className="text-xs font-normal text-ink-muted">
                        J/kg (MU {analysis.mucape} · SB {analysis.cape} · ML{" "}
                        {analysis.mlcape})
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, (activeParcel.cape / 3500) * 100)}%`,
                        backgroundColor: activeParcelRisk.color
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

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-2 font-mono text-xs tabular">
                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">{activeParcelMeta.cinTitle}</span>
                    <p className="mt-0.5 text-base font-semibold text-signal-sky">
                      {activeParcel.cin}{" "}
                      <span className="text-[11px] font-normal">J/kg</span>
                    </p>
                    <span className="text-[10px] text-ink-muted">
                      SB: {analysis.cin} · MU: {analysis.mucin} J/kg
                    </span>
                  </div>

                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">İstasyon Basıncı (Psfc)</span>
                    <p className="mt-0.5 text-base font-semibold text-emerald-300">
                      {formatPressure(analysis.surfacePressureHpa, unit)}
                    </p>
                    <span className="text-[10px] text-ink-muted">
                      Rakım: {formatElevation(analysis.stationElevationM, unit)}
                    </span>
                  </div>

                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">
                      Donma Sınırı ({unit === "imperial" ? "32°F" : "0°C"})
                    </span>
                    <p className="mt-0.5 text-base font-semibold text-signal-sky">
                      {formatElevation(analysis.freezingLevelM, unit)}
                    </p>
                    <span className="text-[10px] text-ink-muted">
                      {analysis.freezingPressureHpa !== null
                        ? formatPressure(analysis.freezingPressureHpa, unit)
                        : "Kolon donma üstü"}
                    </span>
                  </div>

                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">Süper Hücre SCP &amp; STP</span>
                    <p
                      className={`mt-0.5 text-base font-semibold ${
                        analysis.scp >= 1 || analysis.stp >= 1
                          ? "text-signal-rose"
                          : "text-ink-primary"
                      }`}
                    >
                      SCP {analysis.scp.toFixed(2)} · STP {analysis.stp.toFixed(1)}
                    </p>
                    <span className="text-[10px] text-ink-muted">
                      0–1 km SRH: {analysis.srh01} · 0–3 km: {analysis.srh03} m²/s²
                    </span>
                  </div>

                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">0–6 km Kesme</span>
                    <p className="mt-0.5 text-base font-semibold text-signal-amber">
                      {bulkShearText}
                    </p>
                    <span className="text-[10px] text-ink-muted">
                      {formatPressure(analysis.surfacePressureHpa, unit)} →{" "}
                      {formatPressure(500, unit)}
                    </span>
                  </div>

                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">DCAPE / Islak Hazne Tw</span>
                    <p className="mt-0.5 text-base font-semibold text-signal-sky">
                      {analysis.dcape}{" "}
                      <span className="text-[11px] font-normal">J/kg</span>
                    </p>
                    <span className="text-[10px] text-ink-muted">
                      Tw{" "}
                      {formatTemperature(analysis.wetBulbC, unit, {
                        decimals: 1,
                        showUnit: true
                      })}
                    </span>
                  </div>

                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">Lifted / Showalter</span>
                    <p
                      className="mt-0.5 text-base font-semibold"
                      style={{ color: analysis.liRisk.color }}
                    >
                      LI{" "}
                      {formatTempDelta(analysis.liftedIndex, unit, {
                        decimals: 1,
                        signed: true,
                        showUnit: true
                      })}
                    </p>
                    <span className="text-[10px] text-ink-muted">
                      SI{" "}
                      {formatTempDelta(analysis.showalterIndex, unit, {
                        decimals: 1,
                        signed: true,
                        showUnit: true
                      })}{" "}
                      · {analysis.liRisk.label}
                    </span>
                  </div>

                  <div className="surface-tile p-3">
                    <span className="text-ink-muted">700–500 Lapse &amp; Kalınlık</span>
                    <p
                      className={`mt-0.5 text-base font-semibold ${
                        analysis.thickness5001000Dam <= 540
                          ? "text-signal-sky"
                          : "text-ink-primary"
                      }`}
                    >
                      {formatLapseRate(analysis.lapseRate700500, unit)}
                    </p>
                    <span className="text-[10px] text-ink-muted">
                      500–1000: {analysis.thickness5001000Dam} dam · K-Idx{" "}
                      {analysis.kIndex}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-white/[0.07] bg-obsidian-950/60 px-3 py-2 font-mono text-[11px] text-ink-secondary tabular space-y-1">
                <div>
                  Taban Psfc {formatPressure(analysis.surfacePressureHpa, unit)} (
                  {formatElevation(analysis.stationElevationM, unit)}) · LCL{" "}
                  {formatElevation(activeParcel.lclHeightM, unit)} (
                  {formatPressure(activeParcel.lclPressureHpa, unit)}) · LFC{" "}
                  {activeParcel.lfcPressureHpa !== null
                    ? formatPressure(activeParcel.lfcPressureHpa, unit)
                    : "Yok"}{" "}
                  · EL{" "}
                  {activeParcel.elPressureHpa !== null
                    ? formatPressure(activeParcel.elPressureHpa, unit)
                    : "Yok"}
                </div>
                <div>
                  TT {analysis.totalTotals} · SWEAT {analysis.sweatIndex} · Yüzey Td{" "}
                  {formatTemperature(analysis.surfaceDewPointC, unit, {
                    decimals: 1,
                    showUnit: true
                  })}
                </div>
              </div>
            </div>

            {/* Sağ: Gerçek Skew-T Log-P Diyagramı */}
            <div className="surface-panel p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-base font-semibold text-ink-primary">
                    Skew-T Log-P Diyagramı
                  </h2>
                  <p className="text-xs text-ink-muted">
                    {activeLocation.name} ({formatElevation(analysis.stationElevationM, unit)}) · Eğik izotermler ·{" "}
                    {formatPressure(analysis.surfacePressureHpa, unit)} →{" "}
                    {formatPressure(300, unit)} dikey sondaj &amp; WMO rüzgar barbları
                  </p>
                </div>
                <span className="font-mono text-xs text-signal-sky tabular">
                  Yüzey Td:{" "}
                  {formatTemperature(analysis.surfaceDewPointC, unit, {
                    decimals: 1,
                    showUnit: true
                  })}
                </span>
              </div>

              <SkewTCanvas
                analysis={analysis}
                parcelMode={parcelMode}
                unit={unit}
              />
            </div>
          </div>

          {/* Gerçek Basınç Seviyeleri Dikey Ölçüm Tablosu (Katlanabilir) */}
          <div className="surface-panel p-4 sm:p-5 space-y-4">
            <button
              type="button"
              onClick={() => setShowRawTable((v) => !v)}
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <span className="flex items-center gap-2 font-display text-sm font-semibold text-ink-primary">
                <Layers className="h-4 w-4 text-signal-sky" />
                {analysis.levels.length} Seviyeli Dikey Radyosonda Tablosu (
                {formatPressure(analysis.surfacePressureHpa, unit)} →{" "}
                {formatPressure(300, unit)})
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
                <table className="w-full min-w-[740px] text-left font-mono text-xs tabular">
                  <thead>
                    <tr className="border-b border-white/10 text-ink-muted">
                      <th className="py-2 pr-3 font-medium">
                        Basınç ({unit === "imperial" ? "inHg" : "hPa"})
                      </th>
                      <th className="py-2 pr-3 font-medium">
                        İrtifa ({unit === "imperial" ? "ft" : "m"})
                      </th>
                      <th className="py-2 pr-3 font-medium">
                        T ({unit === "imperial" ? "°F" : "°C"})
                      </th>
                      <th className="py-2 pr-3 font-medium">
                        Td ({unit === "imperial" ? "°F" : "°C"})
                      </th>
                      <th className="py-2 pr-3 font-medium">Nem</th>
                      <th className="py-2 pr-3 font-medium">Rüzgar</th>
                      <th className="py-2 pr-3 font-medium">w (g/kg)</th>
                      <th className="py-2 pr-3 font-medium">Tv (K)</th>
                      <th className="py-2 pr-3 font-medium">θ (K)</th>
                      <th className="py-2 font-medium">θe (K)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.07]">
                    {analysis.levels.map((lvl) => {
                      const windCell =
                        unit === "imperial"
                          ? `${Math.round(lvl.windSpeedKt * 1.15078)} mph (${lvl.windSpeedKt} kt)`
                          : `${Math.round(lvl.windSpeedKt * 1.852)} km/s (${lvl.windSpeedKt} kt)`;
                      return (
                        <tr
                          key={lvl.isSurface ? `sfc-${lvl.pressure}` : `lvl-${lvl.pressure}`}
                          className="hover:bg-white/[0.025]"
                        >
                          <td className="py-2.5 pr-3 font-semibold text-signal-sky">
                            <span>{formatPressure(lvl.pressure, unit)}</span>
                            {lvl.isSurface && (
                              <span className="ml-1.5 inline-flex items-center rounded border border-emerald-400/35 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-200">
                                Yüzey
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 pr-3 text-ink-muted">
                            {formatElevation(lvl.altitudeM, unit)}
                          </td>
                          <td className="py-2.5 pr-3 font-medium text-ink-primary">
                            {formatTemperature(lvl.temperature, unit, {
                              decimals: 1,
                              signed: unit === "metric",
                              showUnit: true
                            })}
                          </td>
                          <td className="py-2.5 pr-3 text-signal-emerald">
                            {formatTemperature(lvl.dewPoint, unit, {
                              decimals: 1,
                              signed: unit === "metric",
                              showUnit: true
                            })}
                          </td>
                          <td className="py-2.5 pr-3 text-ink-secondary">
                            %{lvl.humidity}
                          </td>
                          <td className="py-2.5 pr-3 text-ink-secondary">
                            {windCell} · {windDirectionToCompass(lvl.windDirection)}
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
                      );
                    })}
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
