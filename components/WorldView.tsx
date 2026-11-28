"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Clock,
  CloudRain,
  Droplets,
  Gauge,
  Globe,
  MapPin,
  Radio,
  RefreshCw,
  Star,
  Wind
} from "lucide-react";
import { useWeatherData, useWeatherStatus } from "@/context/WeatherContext";
import {
  readCachedWeatherBundleAsync,
  readCachedWeatherBundleSync,
  writeCachedWeatherBundle
} from "@/lib/client-forecast-cache";
import {
  areLocationsEquivalent,
  formatFreshnessAgeTr,
  reanchorWeatherBundleToNow
} from "@/lib/forecast-resilience";
import { buildLocationHref } from "@/lib/location-url";
import { resolveActiveTemporalView } from "@/lib/temporal-view";
import {
  ATMOS_REFRESH_ALL_EVENT,
  buildWeatherApiUrl,
  canonicalizeStationIdentity,
  formatDistance,
  formatElevation,
  formatLatLon,
  formatPrecip,
  formatPressure,
  formatPressureDelta,
  formatTemperature,
  formatWindSpeed,
  GLOBE_CITIES,
  windDirectionToCompass
} from "@/lib/weather-client";
import type { GeoLocation, WeatherBundle } from "@/lib/weather-types";
import { atmosUiSfx } from "@/lib/ui-sfx";
import type { LiveRadarFrameState } from "./LiveRadarMap";
import AnimatedNumber from "./AnimatedNumber";
import AnimatedWeatherIcon from "./AnimatedWeatherIcon";

const LiveRadarMap = dynamic(() => import("./LiveRadarMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#070c16] font-mono text-xs text-ink-muted">
      Doppler yağış radarı hazırlanıyor...
    </div>
  )
});

const GlobeScene = dynamic(() => import("./GlobeScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#05080f] text-xs font-mono text-ink-muted">
      3D Dünya Küresi yükleniyor...
    </div>
  )
});

function formatRadarNowcastSummary(meta?: {
  radarSummaryCode?: string;
  nextRainOnsetMin?: number | null;
  rainCessationMin?: number | null;
}): { badge: string; toneClass: string } {
  const code = meta?.radarSummaryCode ?? "DRY_CLEAR";
  if (code === "RAIN_ACTIVE") {
    return {
      badge: "Aktif Yağış Ekosu",
      toneClass: "border-sky-400/35 bg-sky-400/12 text-sky-200"
    };
  }
  if (code === "RAIN_ENDING") {
    const min = meta?.rainCessationMin;
    return {
      badge: min ? `Yağış Çekiliyor (~${min} dk)` : "Yağış Zayıflıyor",
      toneClass: "border-emerald-400/35 bg-emerald-400/12 text-emerald-200"
    };
  }
  if (code === "RAIN_APPROACHING") {
    const min = meta?.nextRainOnsetMin;
    return {
      badge: min ? `Yağış Yaklaşıyor (~${min} dk)` : "Yağış Yaklaşıyor",
      toneClass: "border-amber-400/35 bg-amber-400/12 text-amber-200"
    };
  }
  if (code === "VIRGA_ALOFT") {
    return {
      badge: "Virga (Alt Katmanda Buharlaşma)",
      toneClass: "border-white/15 bg-white/[0.05] text-ink-secondary"
    };
  }
  return {
    badge: "Aktif Yağış Ekosu Yok",
    toneClass: "border-white/10 bg-white/[0.04] text-ink-secondary"
  };
}

export default function WorldView() {
  const router = useRouter();
  const {
    bundle,
    activeLocation,
    promoteLocationWithBundle,
    addFavorite,
    isFavorite,
    unit
  } = useWeatherData();
  const { recoveryCount, isOffline } = useWeatherStatus();

  const [viewMode, setViewMode] = useState<"radar" | "globe">("radar");
  const [manualPick, setManualPick] = useState<{
    baseId: string;
    loc: GeoLocation;
    bundle: WeatherBundle | null;
  } | null>(null);
  const [fetching, setFetching] = useState(false);
  const [pointError, setPointError] = useState<string | null>(null);
  const [radarFrameState, setRadarFrameState] = useState<LiveRadarFrameState | null>(null);

  const requestSeqRef = useRef(0);
  const manualPickRef = useRef(manualPick);

  useEffect(() => {
    manualPickRef.current = manualPick;
  }, [manualPick]);

  const isManualActive =
    manualPick !== null && manualPick.baseId === activeLocation.id;
  const selectedLoc = isManualActive ? manualPick.loc : activeLocation;
  const pointBundle = isManualActive ? manualPick.bundle : bundle;

  // 100% SSOT Data Parity with Weather ("Hava") tab via resolveActiveTemporalView(pointBundle, 0)
  const temporal = useMemo(
    () => (pointBundle ? resolveActiveTemporalView(pointBundle, 0) : null),
    [pointBundle]
  );

  const fetchPoint = useCallback(
    async (rawLoc: GeoLocation, opts?: { forceRefresh?: boolean }) => {
      const loc = canonicalizeStationIdentity(rawLoc);
      const seq = ++requestSeqRef.current;
      const baseId = activeLocation.id;

      // Zero duplicate request when selecting the active location whose context bundle is already live
      const matchesActiveLive =
        !opts?.forceRefresh &&
        areLocationsEquivalent(loc, activeLocation) &&
        bundle !== null &&
        areLocationsEquivalent(bundle.location, loc) &&
        (bundle.freshness?.status ?? "live") === "live";

      if (matchesActiveLive) {
        setManualPick(null);
        setFetching(false);
        setPointError(null);
        return;
      }

      // Strict city isolation: only prefill if existing bundle belongs to `loc`, or L4 vault has `loc`
      const prevPick = manualPickRef.current;
      const sameAsPrevPick =
        prevPick !== null &&
        prevPick.bundle !== null &&
        areLocationsEquivalent(prevPick.bundle.location, loc);
      const sameAsContext =
        bundle !== null && areLocationsEquivalent(bundle.location, loc);

      const initialPointBundle = sameAsPrevPick
        ? prevPick.bundle
        : sameAsContext
          ? bundle
          : readCachedWeatherBundleSync(loc, Date.now(), { forceStale: isOffline });

      setManualPick({
        baseId,
        loc,
        bundle: initialPointBundle
      });
      setFetching(true);
      setPointError(null);

      try {
        const res = await fetch(buildWeatherApiUrl(loc), {
          cache: opts?.forceRefresh || initialPointBundle ? "no-store" : "default"
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }
        const data: WeatherBundle = await res.json();
        if (seq !== requestSeqRef.current) return;
        const merged: WeatherBundle = {
          ...data,
          location: {
            ...data.location,
            id: loc.id || data.location.id,
            name: loc.name || data.location.name,
            admin1: loc.admin1 ?? data.location.admin1,
            country: loc.country || data.location.country,
            countryCode: loc.countryCode ?? data.location.countryCode,
            elevation: loc.elevation ?? data.location.elevation,
            timezone: data.location.timezone ?? loc.timezone
          }
        };
        if ((merged.freshness?.status ?? "live") === "live") {
          writeCachedWeatherBundle(merged);
        }
        setManualPick({
          baseId,
          loc,
          bundle: merged
        });
        setPointError(null);
      } catch (e) {
        if (seq !== requestSeqRef.current) return;
        const msg =
          e instanceof Error
            ? e.message
            : "Seçili koordinat için canlı veri alınamadı.";

        if (initialPointBundle) {
          const staleCopy = reanchorWeatherBundleToNow(
            initialPointBundle,
            Date.now(),
            {
              status: "stale",
              sourceTier:
                initialPointBundle.freshness?.sourceTier === "live"
                  ? "client-cache"
                  : (initialPointBundle.freshness?.sourceTier ?? "client-cache"),
              cachedAtMs:
                initialPointBundle.freshness?.cachedAtMs ??
                Date.parse(initialPointBundle.fetchedAt),
              staleReason: msg,
              modelsRespondedCount: initialPointBundle.hybrid.activeModels.length
            }
          );
          setManualPick({ baseId, loc, bundle: staleCopy });
          setPointError(null);
        } else {
          const idbHit = await readCachedWeatherBundleAsync(loc, Date.now(), {
            forceStale: true,
            staleReason: msg
          });
          if (seq !== requestSeqRef.current) return;
          if (idbHit) {
            setManualPick({ baseId, loc, bundle: idbHit });
            setPointError(null);
          } else {
            setPointError(msg);
          }
        }
      } finally {
        if (seq === requestSeqRef.current) setFetching(false);
      }
    },
    [activeLocation, bundle, isOffline]
  );

  // Auto-recover manually selected coordinate/city when live connection returns
  useEffect(() => {
    if (recoveryCount <= 0) return;
    const cur = manualPickRef.current;
    if (!cur || cur.baseId !== activeLocation.id) return;
    if (!cur.bundle || (cur.bundle.freshness?.status ?? "live") !== "live") {
      queueMicrotask(() => {
        void fetchPoint(cur.loc, { forceRefresh: true });
      });
    }
  }, [recoveryCount, activeLocation.id, fetchPoint]);

  // Global refresh listener: refreshes manualPick when user triggers global refresh
  useEffect(() => {
    const onGlobalRefresh = () => {
      const cur = manualPickRef.current;
      if (cur && cur.baseId === activeLocation.id) {
        void fetchPoint(cur.loc, { forceRefresh: true });
      }
    };
    window.addEventListener(ATMOS_REFRESH_ALL_EVENT, onGlobalRefresh);
    return () => window.removeEventListener(ATMOS_REFRESH_ALL_EVENT, onGlobalRefresh);
  }, [activeLocation.id, fetchPoint]);

  const handlePickCoords = useCallback(
    async (lat: number, lon: number) => {
      const seq = ++requestSeqRef.current;
      setFetching(true);
      let name = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
      let country = "Koordinat";
      let admin1: string | undefined;
      let countryCode: string | undefined;
      let elevation: number | undefined;
      let timezone: string | undefined;
      try {
        const r = await fetch(
          `/api/reverse-geocode?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`
        );
        if (r.ok) {
          const geo = await r.json();
          name = geo.name || name;
          country = geo.country || country;
          if (typeof geo.admin1 === "string" && geo.admin1.trim()) {
            admin1 = geo.admin1.trim();
          }
          if (typeof geo.countryCode === "string" && geo.countryCode.trim()) {
            countryCode = geo.countryCode.trim().toUpperCase();
          }
          if (typeof geo.elevation === "number" && Number.isFinite(geo.elevation)) {
            elevation = Math.round(geo.elevation);
          }
          if (typeof geo.timezone === "string" && geo.timezone.trim()) {
            timezone = geo.timezone.trim();
          }
        }
      } catch {
        // koordinat adı korunur
      }
      if (seq !== requestSeqRef.current) return;

      const loc = canonicalizeStationIdentity({
        id: `coord_${lat.toFixed(4)}_${lon.toFixed(4)}`,
        name,
        admin1,
        country,
        countryCode,
        lat,
        lon,
        elevation,
        timezone
      });
      await fetchPoint(loc);
    },
    [fetchPoint]
  );

  const fav = isFavorite(selectedLoc);
  const isPointArchive = Boolean(
    pointBundle &&
      (isOffline || (pointBundle.freshness?.status ?? "live") === "stale")
  );
  const engineMeta = pointBundle?.hybrid.engineMeta;
  const nowcastUi = formatRadarNowcastSummary(engineMeta);

  const liveRainMmHr =
    typeof engineMeta?.currentRadarRainMmHr === "number" && engineMeta.radarAvailable
      ? engineMeta.currentRadarRainMmHr
      : (temporal?.telemetry.precipitation ?? pointBundle?.current.precipitation ?? 0);
  const liveRadarDbz =
    typeof engineMeta?.currentRadarDbz === "number" ? engineMeta.currentRadarDbz : 0;

  // Synchronize Doppler box with timeline player frame (+5..+30m forecast steps & -120..-5m archive label)
  const syncedDopplerReadout = useMemo(() => {
    if (viewMode !== "radar" || !radarFrameState) {
      return {
        rainMmHr: liveRainMmHr,
        dbz: liveRadarDbz,
        frameNote: null as string | null,
        isForecastStep: false
      };
    }

    const { deltaMin, isForecast } = radarFrameState;
    if (isForecast || deltaMin >= 5) {
      const steps = engineMeta?.nowcastSteps5Min ?? [];
      if (steps.length > 0) {
        let best = steps[0];
        let bestDiff = Math.abs(best.offsetMin - deltaMin);
        for (let i = 1; i < steps.length; i++) {
          const diff = Math.abs(steps[i].offsetMin - deltaMin);
          if (diff < bestDiff) {
            best = steps[i];
            bestDiff = diff;
          }
        }
        return {
          rainMmHr: best.rainMmHr,
          dbz: best.dbz,
          frameNote: `+${best.offsetMin} dk Nowcast${best.virga ? " · Virga" : ""}`,
          isForecastStep: true
        };
      }
      return {
        rainMmHr: liveRainMmHr,
        dbz: liveRadarDbz,
        frameNote: `+${Math.max(5, deltaMin)} dk Tahmin`,
        isForecastStep: true
      };
    }

    if (deltaMin <= -5) {
      return {
        rainMmHr: liveRainMmHr,
        dbz: liveRadarDbz,
        frameNote: `Yüzey: Canlı · Radar: -${Math.abs(deltaMin)} dk Arşiv`,
        isForecastStep: false
      };
    }

    return {
      rainMmHr: liveRainMmHr,
      dbz: liveRadarDbz,
      frameNote: null,
      isForecastStep: false
    };
  }, [viewMode, radarFrameState, engineMeta?.nowcastSteps5Min, liveRainMmHr, liveRadarDbz]);

  const resolvedElevationM =
    selectedLoc.elevation ?? pointBundle?.location.elevation;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Kompakt Üst Başlık + Görünüm Geçişi */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
          Radar & Dünya Küresi
        </h1>

        {/* Mod Seçici */}
        <div
          className="inline-flex rounded-xl border border-white/10 bg-obsidian-900/90 p-1"
          role="tablist"
          aria-label="Harita görünüm modu"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "radar"}
            onClick={() => {
              atmosUiSfx.playNavTick();
              setViewMode("radar");
            }}
            className={`atmos-btn inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium ${
              viewMode === "radar"
                ? "border border-[rgba(var(--atmos-rim-rgb),0.3)] bg-white/15 text-white"
                : "border border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-[var(--atmos-accent)]" />
            <span>Yağış Radarı</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "globe"}
            onClick={() => {
              atmosUiSfx.playNavTick();
              setViewMode("globe");
            }}
            className={`atmos-btn inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium ${
              viewMode === "globe"
                ? "border border-[rgba(var(--atmos-rim-rgb),0.3)] bg-white/15 text-white"
                : "border border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-[var(--atmos-accent)]" />
            <span>3D Küre</span>
          </button>
        </div>
      </div>

      {/* Tek Satır Kaydırılabilir Hızlı İstasyon Şeridi */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {GLOBE_CITIES.map((city) => {
          const active = areLocationsEquivalent(selectedLoc, city);
          return (
            <button
              key={city.id}
              type="button"
              onClick={() => {
                atmosUiSfx.playNavTick();
                void fetchPoint(city);
              }}
              className={`atmos-btn shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                active
                  ? "border-[rgba(var(--atmos-rim-rgb),0.4)] bg-[rgba(var(--atmos-accent-rgb),0.16)] text-white"
                  : "border-white/[0.08] bg-white/[0.03] text-ink-secondary hover:text-ink-primary"
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>

      {/* Ana Harita / Küre + Sağ Ölçüm Kartı */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.85fr)]">
        <div className="surface-panel relative h-[clamp(340px,calc(100svh-264px-env(safe-area-inset-bottom,0px)),460px)] sm:h-[560px] lg:h-[580px] overflow-hidden">
          {viewMode === "radar" ? (
            <LiveRadarMap
              selectedLat={selectedLoc.lat}
              selectedLon={selectedLoc.lon}
              presetCities={GLOBE_CITIES}
              onPickCoords={(lat, lon) => void handlePickCoords(lat, lon)}
              onPickCity={(city) => void fetchPoint(city)}
              unit={unit}
              timeZone={pointBundle?.timezone ?? selectedLoc.timezone}
              utcOffsetSeconds={pointBundle?.utcOffsetSeconds}
              convectiveCells={temporal?.lightningRadar.cells}
              advectionFromDeg={engineMeta?.radarAdvectionFromDeg}
              advectionSpeedKmh={engineMeta?.radarAdvectionSpeedKmh}
              onFrameStateChange={setRadarFrameState}
            />
          ) : (
            <GlobeScene
              selectedLat={selectedLoc.lat}
              selectedLon={selectedLoc.lon}
              homeLat={activeLocation.lat}
              homeLon={activeLocation.lon}
              presetCities={GLOBE_CITIES}
              selectedCloudCover={temporal?.telemetry.cloudCover}
              onPickCoords={(lat, lon) => void handlePickCoords(lat, lon)}
              onPickCity={(city) => void fetchPoint(city)}
            />
          )}
        </div>

        {/* Sağ Seçili Nokta Telemetri Kartı */}
        <div className="surface-panel flex flex-col justify-between p-5 sm:p-6 space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-ink-muted tabular">
                  <MapPin className="h-3.5 w-3.5 text-signal-sky" />
                  <span>{formatLatLon(selectedLoc.lat, selectedLoc.lon, 3)}</span>
                  {resolvedElevationM !== undefined && Number.isFinite(resolvedElevationM) && (
                    <>
                      <span>·</span>
                      <span>Rakım {formatElevation(resolvedElevationM, unit)}</span>
                    </>
                  )}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl font-semibold text-ink-primary">
                    {selectedLoc.name}
                  </h2>
                  {isPointArchive && pointBundle && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-signal-amber/35 bg-signal-amber/12 px-2 py-0.5 font-mono text-[10px] text-amber-200 tabular">
                      <Clock className="h-2.5 w-2.5 text-signal-amber" />
                      <span>Arşiv · {formatFreshnessAgeTr(pointBundle.fetchedAt)}</span>
                    </span>
                  )}
                </div>
                {(selectedLoc.admin1 || selectedLoc.country) && (
                  <p className="text-xs text-ink-secondary">
                    {[selectedLoc.admin1, selectedLoc.country].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              {fetching && (
                <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 font-mono text-[11px] text-ink-secondary">
                  Ölçülüyor...
                </span>
              )}
            </div>

            {pointError && !pointBundle && (
              <div className="rounded-xl border border-signal-rose/35 bg-signal-rose/10 p-3 text-xs text-ink-primary flex items-center justify-between gap-2">
                <span>{pointError}</span>
                <button
                  type="button"
                  onClick={() => void fetchPoint(selectedLoc, { forceRefresh: true })}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-[11px] hover:bg-white/10"
                >
                  <RefreshCw className="h-3 w-3" /> Tekrar
                </button>
              </div>
            )}

            {pointBundle && temporal ? (
              <>
                <div className="flex items-baseline justify-between gap-3 border-y border-white/[0.08] py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-5xl font-semibold tracking-tight text-ink-primary tabular">
                      <AnimatedNumber
                        value={formatTemperature(temporal.telemetry.temperature, unit)}
                      />
                    </span>
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-medium text-ink-primary">
                        <AnimatedWeatherIcon
                          code={temporal.telemetry.weatherCode}
                          isNight={temporal.dayContext.isNight}
                          className="h-5 w-5"
                        />
                        <span>{temporal.telemetry.condition}</span>
                      </p>
                      <p className="text-xs text-ink-muted tabular">
                        Hissedilen{" "}
                        {formatTemperature(temporal.telemetry.apparentTemperature, unit)}
                      </p>
                    </div>
                  </div>
                  {temporal.telemetry.temp850hPa !== null && (
                    <div className="text-right font-mono text-xs tabular">
                      <span className="block text-[10px] uppercase text-ink-muted">
                        850 hPa
                      </span>
                      <span className="font-semibold text-signal-sky">
                        {formatTemperature(temporal.telemetry.temp850hPa, unit, {
                          signed: true,
                          showUnit: true
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Canlı Doppler Radar & 180 dk Nowcast Telemetri Özeti */}
                <div className="surface-tile p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-ink-secondary">
                      <CloudRain className="h-3.5 w-3.5 text-signal-sky" />
                      <span>Doppler Eko & Nowcast</span>
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono text-[10px] ${nowcastUi.toneClass}`}
                    >
                      {nowcastUi.badge}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs tabular">
                    <span className="text-ink-primary">
                      {formatPrecip(syncedDopplerReadout.rainMmHr, unit, { per: "hour" })}
                      <span className="text-ink-muted">
                        {" "}
                        ·{" "}
                        {syncedDopplerReadout.dbz > 0
                          ? `${Math.round(syncedDopplerReadout.dbz)} dBZ`
                          : "0 dBZ"}
                      </span>
                    </span>
                    <span className="text-ink-muted">
                      {typeof engineMeta?.radarAdvectionSpeedKmh === "number" &&
                      engineMeta.radarAdvectionSpeedKmh > 0 &&
                      typeof engineMeta.radarAdvectionFromDeg === "number"
                        ? `Sürüklenme ${windDirectionToCompass(
                            engineMeta.radarAdvectionFromDeg
                          )} ${formatWindSpeed(engineMeta.radarAdvectionSpeedKmh, unit)}`
                        : `Olasılık %${temporal.telemetry.precipProbability}`}
                    </span>
                  </div>
                  {syncedDopplerReadout.frameNote && (
                    <p
                      className={`font-mono text-[11px] tabular ${
                        syncedDopplerReadout.isForecastStep
                          ? "text-sky-300"
                          : "text-amber-200/90"
                      }`}
                    >
                      {syncedDopplerReadout.frameNote}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="surface-tile p-3 space-y-1">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <Wind className="h-3.5 w-3.5 text-signal-sky" /> Rüzgar
                    </span>
                    <p className="font-mono text-base font-semibold text-ink-primary tabular">
                      {formatWindSpeed(temporal.telemetry.windSpeed, unit)}
                    </p>
                    <p className="text-ink-muted tabular">
                      {temporal.telemetry.windCompassTr} · Hamle{" "}
                      {formatWindSpeed(temporal.telemetry.windGusts, unit)}
                    </p>
                  </div>

                  <div className="surface-tile p-3 space-y-1">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <Droplets className="h-3.5 w-3.5 text-signal-sky" /> Nem & Çiy
                    </span>
                    <p className="font-mono text-base font-semibold text-ink-primary tabular">
                      %{temporal.telemetry.humidity}
                    </p>
                    <p className="text-ink-muted tabular">
                      Td {formatTemperature(temporal.telemetry.dewPoint, unit)} · Bulut %
                      {temporal.telemetry.cloudCover}
                    </p>
                  </div>

                  <div className="surface-tile p-3 space-y-1">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <Gauge className="h-3.5 w-3.5 text-ink-secondary" /> Basınç
                    </span>
                    <p className="flex items-center gap-1 font-mono text-base font-semibold text-ink-primary tabular">
                      <span>{formatPressure(temporal.telemetry.pressure, unit)}</span>
                      {temporal.telemetry.pressureTrend.includes("yükseliyor") ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-signal-emerald" />
                      ) : temporal.telemetry.pressureTrend.includes("düşüyor") ? (
                        <ArrowDownRight className="h-3.5 w-3.5 text-signal-amber" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 text-ink-muted" />
                      )}
                    </p>
                    <p className="text-ink-muted tabular">
                      3s: {formatPressureDelta(temporal.telemetry.pressureDelta3h, unit, false)}{" "}
                      · Görüş {formatDistance(temporal.telemetry.visibilityKm, unit)}
                    </p>
                  </div>

                  <div className="surface-tile p-3 space-y-1">
                    <span className="text-ink-muted">Hava Kalitesi</span>
                    <p className="font-mono text-base font-semibold text-ink-primary tabular">
                      EAQI {temporal.airQualityContext.data.europeanAqi}
                    </p>
                    <p className="text-ink-muted tabular">
                      {temporal.airQualityContext.data.label} · PM2.5{" "}
                      {temporal.airQualityContext.data.pm25}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="surface-tile p-6 text-center text-xs text-ink-muted">
                {fetching
                  ? "Ölçüm verisi hazırlanıyor..."
                  : "Kayıtlı önbellek bulunamadı. Bağlantı sağlandığında otomatik güncellenecek."}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                promoteLocationWithBundle(selectedLoc, pointBundle);
                router.push(buildLocationHref("/", selectedLoc));
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink-primary px-4 py-2.5 text-sm font-medium text-obsidian-950 hover:bg-white transition-colors"
            >
              <span>Hava Durumunda Aç</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => addFavorite(selectedLoc)}
              disabled={fav}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-ink-primary hover:bg-white/[0.08] disabled:opacity-50 transition-colors"
            >
              <Star
                className={`h-4 w-4 ${fav ? "fill-signal-amber text-signal-amber" : "text-ink-secondary"}`}
              />
              <span>{fav ? "İstasyonlarda" : "İstasyonlara Ekle"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
