"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Clock,
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
import {
  formatLatLon,
  formatTemperature,
  formatWindSpeed,
  GLOBE_CITIES,
  windDirectionToCompass
} from "@/lib/weather-client";
import type { GeoLocation, WeatherBundle } from "@/lib/weather-types";
import { atmosUiSfx } from "@/lib/ui-sfx";
const LiveRadarMap = dynamic(() => import("./LiveRadarMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#070c16] font-mono text-xs text-ink-muted">
      Doppler yağış radarı hazırlanıyor...
    </div>
  )
});
import AnimatedNumber from "./AnimatedNumber";
import AnimatedWeatherIcon from "./AnimatedWeatherIcon";

const GlobeScene = dynamic(() => import("./GlobeScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#05080f] text-xs font-mono text-ink-muted">
      3D Dünya Küresi yükleniyor...
    </div>
  )
});

export default function WorldView() {
  const router = useRouter();
  const {
    bundle,
    activeLocation,
    setActiveLocation,
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
  const requestSeqRef = useRef(0);
  const manualPickRef = useRef(manualPick);

  useEffect(() => {
    manualPickRef.current = manualPick;
  }, [manualPick]);

  const isManualActive =
    manualPick !== null && manualPick.baseId === activeLocation.id;
  const selectedLoc = isManualActive ? manualPick.loc : activeLocation;
  const pointBundle = isManualActive ? manualPick.bundle : bundle;

  const fetchPoint = useCallback(
    async (loc: GeoLocation) => {
      const seq = ++requestSeqRef.current;
      const baseId = activeLocation.id;

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
        const qs = new URLSearchParams({
          lat: String(loc.lat),
          lon: String(loc.lon),
          name: loc.name,
          country: loc.country ?? ""
        });
        const res = await fetch(`/api/weather?${qs.toString()}`, {
          cache: initialPointBundle ? "no-store" : "default"
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }
        const data: WeatherBundle = await res.json();
        if (seq !== requestSeqRef.current) return;
        const merged: WeatherBundle = {
          ...data,
          location: { ...data.location, name: loc.name, country: loc.country }
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
    [activeLocation.id, bundle, isOffline]
  );

  // Auto-recover manually selected coordinate/city when live connection returns
  useEffect(() => {
    if (recoveryCount <= 0) return;
    const cur = manualPickRef.current;
    if (!cur || cur.baseId !== activeLocation.id) return;
    if (!cur.bundle || (cur.bundle.freshness?.status ?? "live") !== "live") {
      queueMicrotask(() => {
        void fetchPoint(cur.loc);
      });
    }
  }, [recoveryCount, activeLocation.id, fetchPoint]);

  const handlePickCoords = useCallback(
    async (lat: number, lon: number) => {
      const seq = ++requestSeqRef.current;
      setFetching(true);
      let name = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
      let country = "Koordinat";
      try {
        const r = await fetch(
          `/api/reverse-geocode?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`
        );
        if (r.ok) {
          const geo = await r.json();
          name = geo.name || name;
          country = geo.country || country;
        }
      } catch {
        // koordinat adı korunur
      }
      if (seq !== requestSeqRef.current) return;

      const loc: GeoLocation = {
        id: `coord_${lat.toFixed(2)}_${lon.toFixed(2)}`,
        name,
        country,
        lat,
        lon
      };
      await fetchPoint(loc);
    },
    [fetchPoint]
  );

  const fav = isFavorite(selectedLoc);
  const isPointArchive = Boolean(
    pointBundle &&
      (isOffline || (pointBundle.freshness?.status ?? "live") === "stale")
  );

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
          const active =
            Math.abs(selectedLoc.lat - city.lat) < 0.2 &&
            Math.abs(selectedLoc.lon - city.lon) < 0.2;
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
        <div className="surface-panel relative h-[480px] overflow-hidden sm:h-[580px]">
          {viewMode === "radar" ? (
            <LiveRadarMap
              selectedLat={selectedLoc.lat}
              selectedLon={selectedLoc.lon}
              presetCities={GLOBE_CITIES}
              onPickCoords={(lat, lon) => void handlePickCoords(lat, lon)}
              onPickCity={(city) => void fetchPoint(city)}
            />
          ) : (
            <GlobeScene
              selectedLat={selectedLoc.lat}
              selectedLon={selectedLoc.lon}
              homeLat={activeLocation.lat}
              homeLon={activeLocation.lon}
              presetCities={GLOBE_CITIES}
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
                <p className="flex items-center gap-1.5 font-mono text-xs text-ink-muted tabular">
                  <MapPin className="h-3.5 w-3.5 text-signal-sky" />
                  {formatLatLon(selectedLoc.lat, selectedLoc.lon, 3)}
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
                {selectedLoc.country && (
                  <p className="text-xs text-ink-secondary">{selectedLoc.country}</p>
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
                  onClick={() => void fetchPoint(selectedLoc)}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-[11px] hover:bg-white/10"
                >
                  <RefreshCw className="h-3 w-3" /> Tekrar
                </button>
              </div>
            )}

            {pointBundle ? (
              <>
                <div className="flex items-baseline justify-between gap-3 border-y border-white/[0.08] py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-5xl font-semibold tracking-tight text-ink-primary tabular">
                      <AnimatedNumber value={formatTemperature(pointBundle.current.temperature, unit)} />
                    </span>
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-medium text-ink-primary">
                        <AnimatedWeatherIcon
                          code={pointBundle.current.weatherCode}
                          isNight={pointBundle.current.solarElevationDeg < -3}
                          className="h-5 w-5"
                        />
                        <span>{pointBundle.current.condition}</span>
                      </p>
                      <p className="text-xs text-ink-muted tabular">
                        Hissedilen{" "}
                        {formatTemperature(pointBundle.current.apparentTemperature, unit)}
                      </p>
                    </div>
                  </div>
                  {pointBundle.current.temp850hPa !== null && (
                    <div className="text-right font-mono text-xs tabular">
                      <span className="block text-[10px] uppercase text-ink-muted">
                        850 hPa
                      </span>
                      <span className="font-semibold text-signal-sky">
                        {pointBundle.current.temp850hPa > 0
                          ? `+${pointBundle.current.temp850hPa}°`
                          : `${pointBundle.current.temp850hPa}°`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="surface-tile p-3 space-y-1">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <Wind className="h-3.5 w-3.5 text-signal-sky" /> Rüzgar
                    </span>
                    <p className="font-mono text-base font-semibold text-ink-primary tabular">
                      {formatWindSpeed(pointBundle.current.windSpeed, unit)}
                    </p>
                    <p className="text-ink-muted tabular">
                      {windDirectionToCompass(pointBundle.current.windDirection)} · Hamle{" "}
                      {formatWindSpeed(pointBundle.current.windGusts, unit)}
                    </p>
                  </div>

                  <div className="surface-tile p-3 space-y-1">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <Droplets className="h-3.5 w-3.5 text-signal-sky" /> Nem & Çiy
                    </span>
                    <p className="font-mono text-base font-semibold text-ink-primary tabular">
                      %{pointBundle.current.humidity}
                    </p>
                    <p className="text-ink-muted tabular">
                      Td {formatTemperature(pointBundle.current.dewPoint, unit)} · Bulut %
                      {pointBundle.current.cloudCover}
                    </p>
                  </div>

                  <div className="surface-tile p-3 space-y-1">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <Gauge className="h-3.5 w-3.5 text-ink-secondary" /> Basınç
                    </span>
                    <p className="flex items-center gap-1 font-mono text-base font-semibold text-ink-primary tabular">
                      <span>{pointBundle.current.pressure} hPa</span>
                      {pointBundle.current.pressureTrend.includes("yükseliyor") ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-signal-emerald" />
                      ) : pointBundle.current.pressureTrend.includes("düşüyor") ? (
                        <ArrowDownRight className="h-3.5 w-3.5 text-signal-amber" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 text-ink-muted" />
                      )}
                    </p>
                    <p className="text-ink-muted tabular">
                      3s: {pointBundle.current.pressureDelta3h > 0 ? "+" : ""}
                      {pointBundle.current.pressureDelta3h} hPa · Görüş{" "}
                      {pointBundle.current.visibilityKm} km
                    </p>
                  </div>

                  <div className="surface-tile p-3 space-y-1">
                    <span className="text-ink-muted">Hava Kalitesi</span>
                    <p className="font-mono text-base font-semibold text-ink-primary tabular">
                      EAQI {pointBundle.airQuality.europeanAqi}
                    </p>
                    <p className="text-ink-muted tabular">
                      {pointBundle.airQuality.label} · PM2.5 {pointBundle.airQuality.pm25}
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
                setActiveLocation(selectedLoc);
                router.push("/");
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
