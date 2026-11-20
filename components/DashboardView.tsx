"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BellOff,
  Droplets,
  Plus,
  RefreshCw,
  Trash2,
  Wind
} from "lucide-react";
import { useWeather } from "@/context/WeatherContext";
import { formatTemperature, formatWindSpeed } from "@/lib/weather";
import type {
  AlertMetric,
  GeoLocation,
  WeatherAlertRule,
  WeatherBundle
} from "@/lib/weather-types";
import CitySearch from "./CitySearch";

function formatLocalClock(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date());
  } catch {
    return "--:--";
  }
}

function stationAccentBorder(bundle: WeatherBundle): string {
  if (bundle.current.isStorm) return "border-t-signal-amber/70";
  if (bundle.current.precipType !== "none") return "border-t-signal-sky/60";
  return "border-t-white/10";
}

function MiniSpark({ temps }: { temps: number[] }) {
  if (temps.length < 2) return null;
  const min = Math.min(...temps) - 1;
  const max = Math.max(...temps) + 1;
  const span = Math.max(1, max - min);
  const w = 132;
  const h = 30;
  const step = w / (temps.length - 1);
  const d = temps
    .map(
      (t, i) =>
        `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(h - 4 - ((t - min) / span) * (h - 8)).toFixed(1)}`
    )
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-32 shrink-0" aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const METRIC_LABELS: Record<AlertMetric, { label: string; unit: string }> = {
  temperature: { label: "Sıcaklık", unit: "°C" },
  windSpeed: { label: "Rüzgar", unit: "km/s" },
  precipProbability: { label: "Yağış Olasılığı", unit: "%" },
  aqi: { label: "Hava Kalitesi (EAQI)", unit: "" }
};

function evaluateRule(
  rule: WeatherAlertRule,
  bundle: WeatherBundle | undefined
): { triggered: boolean; currentVal: number | null } {
  if (!bundle || !rule.enabled) return { triggered: false, currentVal: null };
  let val = 0;
  if (rule.metric === "temperature") val = Math.round(bundle.current.temperature);
  else if (rule.metric === "windSpeed") val = Math.round(bundle.current.windSpeed);
  else if (rule.metric === "precipProbability") val = bundle.current.precipProbability;
  else val = bundle.airQuality.europeanAqi;

  const triggered =
    rule.operator === ">" ? val > rule.threshold : val < rule.threshold;
  return { triggered, currentVal: val };
}

export default function DashboardView() {
  const router = useRouter();
  const {
    favorites,
    addFavorite,
    removeFavorite,
    setActiveLocation,
    alerts,
    addAlert,
    removeAlert,
    toggleAlert,
    unit
  } = useWeather();

  const [cityBundles, setCityBundles] = useState<Record<string, WeatherBundle>>({});
  const [failedCities, setFailedCities] = useState<Record<string, string>>({});
  const [loadingMap, setLoadingMap] = useState(false);

  // Yeni eşik form state
  const [alertCityId, setAlertCityId] = useState(favorites[0]?.id ?? "");
  const [alertMetric, setAlertMetric] = useState<AlertMetric>("windSpeed");
  const [alertOperator, setAlertOperator] = useState<">" | "<">(">");
  const [alertThreshold, setAlertThreshold] = useState(45);

  useEffect(() => {
    if (!favorites.some((f) => f.id === alertCityId) && favorites[0]) {
      setAlertCityId(favorites[0].id);
    }
  }, [favorites, alertCityId]);

  const fetchCityList = useCallback(async (list: GeoLocation[]) => {
    setLoadingMap(true);
    const results = await Promise.all(
      list.map(async (loc) => {
        try {
          const qs = new URLSearchParams({
            lat: String(loc.lat),
            lon: String(loc.lon),
            name: loc.name,
            country: loc.country ?? ""
          });
          const res = await fetch(`/api/weather?${qs.toString()}`);
          if (!res.ok) {
            return { id: loc.id, bundle: null, err: `HTTP ${res.status}` };
          }
          const data: WeatherBundle = await res.json();
          return {
            id: loc.id,
            bundle: { ...data, location: { ...data.location, ...loc } },
            err: null
          };
        } catch {
          return { id: loc.id, bundle: null, err: "Bağlantı hatası" };
        }
      })
    );

    const nextBundles: Record<string, WeatherBundle> = {};
    const nextFailed: Record<string, string> = {};
    for (const r of results) {
      if (r.bundle) nextBundles[r.id] = r.bundle;
      else if (r.err) nextFailed[r.id] = r.err;
    }
    setCityBundles(nextBundles);
    setFailedCities(nextFailed);
    setLoadingMap(false);
  }, []);

  useEffect(() => {
    void fetchCityList(favorites);
  }, [favorites, fetchCityList]);

  const loadedList = useMemo(
    () =>
      favorites
        .map((f) => cityBundles[f.id])
        .filter((b): b is WeatherBundle => Boolean(b)),
    [favorites, cityBundles]
  );

  const extremes = useMemo(() => {
    if (loadedList.length === 0) return null;
    const hottest = [...loadedList].sort(
      (a, b) => b.current.temperature - a.current.temperature
    )[0];
    const coldest = [...loadedList].sort(
      (a, b) => a.current.temperature - b.current.temperature
    )[0];
    const windiest = [...loadedList].sort(
      (a, b) => b.current.windSpeed - a.current.windSpeed
    )[0];
    const wettest = [...loadedList].sort(
      (a, b) => b.current.precipProbability - a.current.precipProbability
    )[0];
    return { hottest, coldest, windiest, wettest };
  }, [loadedList]);

  const evaluatedAlerts = useMemo(
    () =>
      alerts.map((rule) => ({
        rule,
        ...evaluateRule(rule, cityBundles[rule.cityId])
      })),
    [alerts, cityBundles]
  );

  const activeTriggered = evaluatedAlerts.filter((e) => e.triggered);

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const city = favorites.find((f) => f.id === alertCityId);
    if (!city) return;
    addAlert({
      cityId: city.id,
      cityName: city.name,
      metric: alertMetric,
      operator: alertOperator,
      threshold: Number(alertThreshold),
      enabled: true
    });
  };

  const openCityOnRoute = (loc: GeoLocation, route: "/" | "/lab") => {
    setActiveLocation(loc);
    router.push(route);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Üst Başlık & İstasyon Ekle */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-ink-muted">
            Çoklu İstasyon İzleme
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink-primary">
            İstasyonlar
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Takip ettiğin istasyonların canlı ölçümlerini kıyasla ve eşik kuralları tanımla.
          </p>
        </div>

        <div className="flex w-full max-w-md items-center gap-2">
          <div className="flex-1">
            <CitySearch
              onSelect={(loc) => addFavorite(loc)}
              placeholder="+ Yeni istasyon ekle..."
            />
          </div>
          <button
            type="button"
            onClick={() => void fetchCityList(favorites)}
            disabled={loadingMap}
            aria-label="Tüm istasyonları yenile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-obsidian-900/90 text-ink-secondary hover:text-ink-primary disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loadingMap ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Tetiklenen Eşik Uyarı Bandı */}
      {activeTriggered.length > 0 && (
        <div className="rounded-2xl border border-signal-amber/40 bg-signal-amber/10 p-4 space-y-2">
          <p className="flex items-center gap-2 font-display text-sm font-semibold text-signal-amber">
            <AlertTriangle className="h-4 w-4" />
            Eşik Aşımı Tespit Edildi ({activeTriggered.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {activeTriggered.map(({ rule, currentVal }) => (
              <span
                key={rule.id}
                className="rounded-lg border border-signal-amber/30 bg-obsidian-950/75 px-3 py-1.5 text-xs text-ink-primary tabular"
              >
                <strong>{rule.cityName}</strong> · {METRIC_LABELS[rule.metric].label}{" "}
                <span className="font-mono text-signal-amber">
                  {currentVal}
                  {METRIC_LABELS[rule.metric].unit}
                </span>{" "}
                ({rule.operator} {rule.threshold}
                {METRIC_LABELS[rule.metric].unit})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Özet Karşılaştırma Şeridi */}
      {extremes && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="surface-panel p-4">
            <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              En Sıcak
            </p>
            <p className="mt-1.5 font-display text-base font-semibold text-ink-primary tabular">
              {extremes.hottest.location.name} ·{" "}
              <span className="font-mono text-signal-amber">
                {formatTemperature(extremes.hottest.current.temperature, unit)}
              </span>
            </p>
          </div>
          <div className="surface-panel p-4">
            <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              En Serin
            </p>
            <p className="mt-1.5 font-display text-base font-semibold text-ink-primary tabular">
              {extremes.coldest.location.name} ·{" "}
              <span className="font-mono text-signal-sky">
                {formatTemperature(extremes.coldest.current.temperature, unit)}
              </span>
            </p>
          </div>
          <div className="surface-panel p-4">
            <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              En Rüzgarlı
            </p>
            <p className="mt-1.5 font-display text-base font-semibold text-ink-primary tabular">
              {extremes.windiest.location.name} ·{" "}
              <span className="font-mono text-ink-primary">
                {formatWindSpeed(extremes.windiest.current.windSpeed, unit)}
              </span>
            </p>
          </div>
          <div className="surface-panel p-4">
            <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              Yağış Olasılığı
            </p>
            <p className="mt-1.5 font-display text-base font-semibold text-ink-primary tabular">
              {extremes.wettest.location.name} ·{" "}
              <span className="font-mono text-signal-emerald">
                %{extremes.wettest.current.precipProbability}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* İstasyon Kartları */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {favorites.map((city) => {
          const b = cityBundles[city.id];
          const err = failedCities[city.id];

          if (!b && err) {
            return (
              <div
                key={city.id}
                className="surface-panel p-5 flex flex-col justify-between space-y-4 border-signal-rose/30"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-ink-primary">
                      {city.name}
                    </h2>
                    <p className="text-xs text-ink-muted">{city.country}</p>
                  </div>
                  {favorites.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFavorite(city.id)}
                      aria-label={`${city.name} istasyonunu kaldır`}
                      className="rounded-lg border border-white/10 p-1.5 text-ink-muted hover:border-signal-rose/40 hover:text-signal-rose transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-ink-secondary">
                  Veri alınamadı ({err}).
                </p>
                <button
                  type="button"
                  onClick={() => void fetchCityList(favorites)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-medium text-ink-primary hover:bg-white/[0.08]"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Tekrar Dene
                </button>
              </div>
            );
          }

          if (!b) {
            return (
              <div
                key={city.id}
                className="surface-panel h-60 p-5 flex flex-col justify-between"
              >
                <div className="h-5 w-32 rounded bg-white/[0.06]" />
                <div className="h-12 w-24 rounded bg-white/[0.06]" />
                <div className="h-10 w-full rounded bg-white/[0.04]" />
              </div>
            );
          }

          return (
            <article
              key={city.id}
              className={`surface-panel border-t-2 p-5 flex flex-col justify-between space-y-4 transition-colors hover:border-white/20 ${stationAccentBorder(b)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink-primary">
                    {city.name}
                  </h2>
                  <p className="font-mono text-[11px] text-ink-muted tabular">
                    {city.country} · Yerel {formatLocalClock(b.timezone)} ·{" "}
                    {b.current.pressure} hPa{" "}
                    {b.current.pressureTrend === "yükseliyor" ? (
                      <ArrowUpRight className="inline h-3 w-3 text-signal-emerald" />
                    ) : b.current.pressureTrend === "düşüyor" ? (
                      <ArrowDownRight className="inline h-3 w-3 text-signal-amber" />
                    ) : (
                      <ArrowRight className="inline h-3 w-3 text-ink-muted" />
                    )}
                  </p>
                </div>

                {favorites.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFavorite(city.id)}
                    aria-label={`${city.name} istasyonunu kaldır`}
                    className="rounded-lg border border-white/[0.08] p-1.5 text-ink-muted hover:border-signal-rose/40 hover:text-signal-rose transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-display text-5xl font-semibold tracking-tight text-ink-primary tabular">
                    {formatTemperature(b.current.temperature, unit)}
                  </span>
                  <p className="mt-1 text-xs font-medium text-ink-secondary">
                    {b.current.condition}
                  </p>
                </div>
                <MiniSpark temps={b.hourly.slice(0, 12).map((h) => h.temperature)} />
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                <div className="surface-tile px-2 py-2">
                  <span className="flex items-center gap-1 text-ink-muted">
                    <Wind className="h-3 w-3 text-signal-sky" /> Rüzgar
                  </span>
                  <p className="mt-0.5 font-mono font-semibold text-ink-primary tabular">
                    {formatWindSpeed(b.current.windSpeed, unit)}
                  </p>
                </div>
                <div className="surface-tile px-2 py-2">
                  <span className="flex items-center gap-1 text-ink-muted">
                    <Droplets className="h-3 w-3 text-signal-sky" /> Nem
                  </span>
                  <p className="mt-0.5 font-mono font-semibold text-ink-primary tabular">
                    %{b.current.humidity}
                  </p>
                </div>
                <div className="surface-tile px-2 py-2">
                  <span className="text-ink-muted">850 hPa</span>
                  <p className="mt-0.5 font-mono font-semibold text-signal-sky tabular">
                    {b.current.temp850hPa !== null
                      ? `${b.current.temp850hPa > 0 ? "+" : ""}${b.current.temp850hPa}°`
                      : "--"}
                  </p>
                </div>
                <div className="surface-tile px-2 py-2">
                  <span className="text-ink-muted">EAQI</span>
                  <p className="mt-0.5 font-mono font-semibold text-ink-primary tabular">
                    {b.airQuality.europeanAqi}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openCityOnRoute(city, "/")}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] py-2 text-xs font-medium text-ink-primary hover:bg-white/[0.12] transition-colors"
                >
                  <span>Hava Durumu</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openCityOnRoute(city, "/lab")}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-ink-secondary hover:text-ink-primary hover:bg-white/[0.08] transition-colors"
                >
                  <Activity className="h-3.5 w-3.5 text-signal-sky" />
                  <span>Sondaj</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* İzleme Eşikleri */}
      <section className="surface-panel p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink-primary">
            <Bell className="h-4 w-4 text-signal-amber" />
            İzleme Eşikleri
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Tanımladığın eşik değerler canlı istasyon ölçümlerinde aşıldığında üstte uyarı bandı görünür.
          </p>
        </div>

        <form
          onSubmit={handleAddAlert}
          className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_0.75fr_0.85fr_auto]"
        >
          <select
            value={alertCityId}
            onChange={(e) => setAlertCityId(e.target.value)}
            aria-label="Eşik istasyonu"
            className="h-10 rounded-xl border border-white/10 bg-obsidian-950/90 px-3 text-sm text-ink-primary focus:border-signal-sky/60 focus:outline-none"
          >
            {favorites.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={alertMetric}
            onChange={(e) => setAlertMetric(e.target.value as AlertMetric)}
            aria-label="Eşik parametresi"
            className="h-10 rounded-xl border border-white/10 bg-obsidian-950/90 px-3 text-sm text-ink-primary focus:border-signal-sky/60 focus:outline-none"
          >
            <option value="windSpeed">Rüzgar Hızı (km/s)</option>
            <option value="temperature">Sıcaklık (°C)</option>
            <option value="precipProbability">Yağış Olasılığı (%)</option>
            <option value="aqi">Hava Kalitesi (EAQI)</option>
          </select>

          <select
            value={alertOperator}
            onChange={(e) => setAlertOperator(e.target.value as ">" | "<")}
            aria-label="Eşik koşulu"
            className="h-10 rounded-xl border border-white/10 bg-obsidian-950/90 px-3 font-mono text-sm text-ink-primary focus:border-signal-sky/60 focus:outline-none"
          >
            <option value=">">&gt; Üstünde</option>
            <option value="<">&lt; Altında</option>
          </select>

          <input
            type="number"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(Number(e.target.value))}
            aria-label="Eşik değeri"
            className="h-10 rounded-xl border border-white/10 bg-obsidian-950/90 px-3 font-mono text-sm text-ink-primary tabular focus:border-signal-sky/60 focus:outline-none"
          />

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-ink-primary px-4 text-sm font-medium text-obsidian-950 hover:bg-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Kural Ekle</span>
          </button>
        </form>

        <div className="divide-y divide-white/[0.07]">
          {evaluatedAlerts.map(({ rule, triggered, currentVal }) => (
            <div
              key={rule.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    !rule.enabled
                      ? "bg-white/20"
                      : triggered
                        ? "bg-signal-amber"
                        : "bg-signal-emerald"
                  }`}
                />
                <span className="font-medium text-ink-primary">{rule.cityName}</span>
                <span className="text-xs text-ink-secondary">
                  {METRIC_LABELS[rule.metric].label}{" "}
                  <strong className="font-mono text-ink-primary tabular">
                    {rule.operator} {rule.threshold}
                    {METRIC_LABELS[rule.metric].unit}
                  </strong>
                </span>
                {currentVal !== null && (
                  <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-signal-sky tabular">
                    Güncel: {currentVal}
                    {METRIC_LABELS[rule.metric].unit}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleAlert(rule.id)}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-ink-secondary hover:bg-white/[0.08] hover:text-ink-primary transition-colors"
                >
                  {rule.enabled ? (
                    <span className="flex items-center gap-1">
                      <Bell className="h-3.5 w-3.5 text-signal-emerald" /> Aktif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <BellOff className="h-3.5 w-3.5 text-ink-muted" /> Pasif
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => removeAlert(rule.id)}
                  aria-label="Kuralı sil"
                  className="rounded-lg border border-white/[0.08] p-1.5 text-ink-muted hover:border-signal-rose/40 hover:text-signal-rose transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
