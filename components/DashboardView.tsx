"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  UnitSystem,
  WeatherAlertRule,
  WeatherBundle
} from "@/lib/weather-types";
import { atmosUiSfx } from "@/lib/ui-sfx";
import CitySearch from "./CitySearch";
import AnimatedNumber from "./AnimatedNumber";
import AnimatedWeatherIcon from "./AnimatedWeatherIcon";

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

function stationAmbientGlow(b: WeatherBundle): string {
  if (b.current.isStorm || (b.storm?.score ?? 0) >= 50) {
    return "radial-gradient(280px circle at 85% 0%, rgba(245, 158, 11, 0.16), transparent 70%)";
  }
  if (b.current.precipType === "snow" || b.current.temperature <= 1) {
    return "radial-gradient(280px circle at 85% 0%, rgba(186, 230, 253, 0.16), transparent 70%)";
  }
  if (b.current.precipType === "rain") {
    return "radial-gradient(280px circle at 85% 0%, rgba(56, 189, 248, 0.16), transparent 70%)";
  }
  if (b.current.solarElevationDeg > 4 && b.current.cloudCover < 65) {
    return "radial-gradient(280px circle at 85% 0%, rgba(251, 191, 36, 0.15), transparent 70%)";
  }
  if (b.current.solarElevationDeg < -4) {
    return "radial-gradient(280px circle at 85% 0%, rgba(129, 140, 248, 0.14), transparent 70%)";
  }
  return "radial-gradient(280px circle at 85% 0%, rgba(148, 163, 184, 0.10), transparent 70%)";
}

function MiniSpark({ temps, id }: { temps: number[]; id: string }) {
  if (temps.length < 2) return null;
  const min = Math.min(...temps) - 1;
  const max = Math.max(...temps) + 1;
  const span = Math.max(1, max - min);
  const w = 132;
  const h = 34;
  const step = w / (temps.length - 1);
  const pts = temps.map((t, i) => ({
    x: i * step,
    y: h - 5 - ((t - min) / span) * (h - 10)
  }));

  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const midX = ((prev.x + curr.x) / 2).toFixed(1);
    d += ` Q${prev.x.toFixed(1)},${prev.y.toFixed(1)} ${midX},${((prev.y + curr.y) / 2).toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  d += ` L${last.x.toFixed(1)},${last.y.toFixed(1)}`;
  const area = `${d} L${w},${h} L0,${h} Z`;
  const gradId = `spark-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-32 shrink-0 overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--atmos-accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--atmos-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={d}
        fill="none"
        stroke="var(--atmos-accent)"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={last.x}
        cy={last.y}
        r="2.6"
        fill="#f8fbff"
        stroke="var(--atmos-accent)"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function getMetricMeta(metric: AlertMetric, unit: UnitSystem): { label: string; unit: string } {
  if (metric === "temperature") {
    return { label: "Sıcaklık", unit: unit === "imperial" ? "°F" : "°C" };
  }
  if (metric === "windSpeed") {
    return { label: "Rüzgar", unit: unit === "imperial" ? " mph" : " km/s" };
  }
  if (metric === "precipProbability") {
    return { label: "Yağış Olasılığı", unit: "%" };
  }
  return { label: "Hava Kalitesi (EAQI)", unit: "" };
}

function toDisplayRuleThreshold(
  metric: AlertMetric,
  metricThreshold: number,
  unit: UnitSystem
): number {
  if (unit === "imperial") {
    if (metric === "temperature") return Math.round((metricThreshold * 9) / 5 + 32);
    if (metric === "windSpeed") return Math.round(metricThreshold * 0.621371);
  }
  return metricThreshold;
}

function toMetricThreshold(
  metric: AlertMetric,
  inputVal: number,
  unit: UnitSystem
): number {
  if (unit === "imperial") {
    if (metric === "temperature") return Math.round(((inputVal - 32) * 5) / 9);
    if (metric === "windSpeed") return Math.round(inputVal / 0.621371);
  }
  return inputVal;
}

function evaluateRule(
  rule: WeatherAlertRule,
  bundle: WeatherBundle | undefined,
  unit: UnitSystem
): { triggered: boolean; currentVal: number | null; displayThreshold: number } {
  const displayThreshold = toDisplayRuleThreshold(rule.metric, rule.threshold, unit);
  if (!bundle || !rule.enabled) {
    return { triggered: false, currentVal: null, displayThreshold };
  }
  let metricVal = 0;
  if (rule.metric === "temperature") metricVal = Math.round(bundle.current.temperature);
  else if (rule.metric === "windSpeed") metricVal = Math.round(bundle.current.windSpeed);
  else if (rule.metric === "precipProbability") metricVal = bundle.current.precipProbability;
  else metricVal = bundle.airQuality.europeanAqi;

  const triggered =
    rule.operator === ">" ? metricVal > rule.threshold : metricVal < rule.threshold;
  const currentVal = toDisplayRuleThreshold(rule.metric, metricVal, unit);
  return { triggered, currentVal, displayThreshold };
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
  const [showAlertForm, setShowAlertForm] = useState(false);
  const fetchSeqRef = useRef(0);
  const bundlesRef = useRef<Record<string, WeatherBundle>>({});

  useEffect(() => {
    bundlesRef.current = cityBundles;
  }, [cityBundles]);

  // Yeni eşik form state
  const [alertCityId, setAlertCityId] = useState(favorites[0]?.id ?? "");
  const [alertMetric, setAlertMetric] = useState<AlertMetric>("windSpeed");
  const [alertOperator, setAlertOperator] = useState<">" | "<">(">");
  const [alertThreshold, setAlertThreshold] = useState(45);

  const effectiveAlertCityId = favorites.some((f) => f.id === alertCityId)
    ? alertCityId
    : (favorites[0]?.id ?? "");

  const fetchCityList = useCallback(async (list: GeoLocation[], forceAll = false) => {
    const seq = ++fetchSeqRef.current;
    const toFetch = forceAll
      ? list
      : list.filter((loc) => !bundlesRef.current[loc.id]);

    // Silinen istasyonları temizle
    const activeIds = new Set(list.map((l) => l.id));
    setCityBundles((prev) => {
      const pruned: Record<string, WeatherBundle> = {};
      for (const [k, v] of Object.entries(prev)) {
        if (activeIds.has(k)) pruned[k] = v;
      }
      return pruned;
    });

    if (toFetch.length === 0) return;

    setLoadingMap(true);
    const nextFailed: Record<string, string> = {};

    const CONCURRENCY = 2;
    let cursor = 0;
    const worker = async () => {
      while (cursor < toFetch.length) {
        if (seq !== fetchSeqRef.current) return;
        const loc = toFetch[cursor++];
        try {
          const qs = new URLSearchParams({
            lat: String(loc.lat),
            lon: String(loc.lon),
            name: loc.name,
            country: loc.country ?? ""
          });
          const res = await fetch(`/api/weather?${qs.toString()}`);
          if (seq !== fetchSeqRef.current) return;
          if (!res.ok) {
            nextFailed[loc.id] = `HTTP ${res.status}`;
            continue;
          }
          const data: WeatherBundle = await res.json();
          if (seq !== fetchSeqRef.current) return;
          const merged = { ...data, location: { ...data.location, ...loc } };
          setCityBundles((prev) => ({ ...prev, [loc.id]: merged }));
        } catch {
          if (seq === fetchSeqRef.current) nextFailed[loc.id] = "Bağlantı hatası";
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, toFetch.length) }, () => worker())
    );

    if (seq === fetchSeqRef.current) {
      setFailedCities(nextFailed);
      setLoadingMap(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void fetchCityList(favorites, false);
    });
    return () => {
      cancelled = true;
    };
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
        ...evaluateRule(rule, cityBundles[rule.cityId], unit)
      })),
    [alerts, cityBundles, unit]
  );

  const activeTriggered = evaluatedAlerts.filter((e) => e.triggered);

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const city = favorites.find((f) => f.id === effectiveAlertCityId);
    if (!city) return;
    addAlert({
      cityId: city.id,
      cityName: city.name,
      metric: alertMetric,
      operator: alertOperator,
      threshold: toMetricThreshold(alertMetric, Number(alertThreshold), unit),
      enabled: true
    });
  };

  const openCityOnRoute = (loc: GeoLocation, route: "/" | "/lab") => {
    setActiveLocation(loc);
    router.push(route);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Kompakt Üst Başlık & İstasyon Ekle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
          İstasyonlar
        </h1>

        <div className="flex w-full max-w-sm items-center gap-2">
          <div className="flex-1">
            <CitySearch
              onSelect={(loc) => addFavorite(loc)}
              placeholder="+ Yeni istasyon ekle..."
            />
          </div>
          <button
            type="button"
            onClick={() => void fetchCityList(favorites, true)}
            disabled={loadingMap}
            aria-label="Tüm istasyonları yenile"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-obsidian-900/90 text-ink-secondary hover:text-ink-primary disabled:opacity-50 transition-colors"
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
            {activeTriggered.map(({ rule, currentVal, displayThreshold }) => {
              const meta = getMetricMeta(rule.metric, unit);
              return (
                <span
                  key={rule.id}
                  className="rounded-lg border border-signal-amber/30 bg-obsidian-950/75 px-3 py-1.5 text-xs text-ink-primary tabular"
                >
                  <strong>{rule.cityName}</strong> · {meta.label}{" "}
                  <span className="font-mono text-signal-amber">
                    {currentVal}
                    {meta.unit}
                  </span>{" "}
                  ({rule.operator} {displayThreshold}
                  {meta.unit})
                </span>
              );
            })}
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
                  onClick={() => void fetchCityList(favorites, true)}
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
              style={{ backgroundImage: stationAmbientGlow(b) }}
              className={`surface-panel border-t-2 p-5 flex flex-col justify-between space-y-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 ${stationAccentBorder(b)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink-primary">
                    {city.name}
                  </h2>
                  <p className="font-mono text-[11px] text-ink-muted tabular">
                    {city.country} · Yerel {formatLocalClock(b.timezone)} ·{" "}
                    {b.current.pressure} hPa{" "}
                    {b.current.pressureTrend.includes("yükseliyor") ? (
                      <ArrowUpRight className="inline h-3 w-3 text-signal-emerald" />
                    ) : b.current.pressureTrend.includes("düşüyor") ? (
                      <ArrowDownRight className="inline h-3 w-3 text-signal-amber" />
                    ) : (
                      <ArrowRight className="inline h-3 w-3 text-ink-muted" />
                    )}
                  </p>
                </div>

                {favorites.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      atmosUiSfx.playChime(false);
                      removeFavorite(city.id);
                    }}
                    aria-label={`${city.name} istasyonunu kaldır`}
                    className="atmos-btn rounded-lg border border-white/[0.08] p-1.5 text-ink-muted hover:border-signal-rose/40 hover:text-signal-rose"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-display text-5xl font-semibold tracking-tight text-ink-primary tabular">
                    <AnimatedNumber value={formatTemperature(b.current.temperature, unit)} />
                  </span>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-medium text-ink-secondary">
                    <AnimatedWeatherIcon
                      code={b.current.weatherCode}
                      isNight={b.current.solarElevationDeg < -3}
                      className="h-4 w-4"
                    />
                    <span>{b.current.condition}</span>
                    {b.hybrid?.atmosV4 && (
                      <span className="rounded border border-signal-emerald/30 bg-signal-emerald/10 px-1.5 py-0.5 font-mono text-[10px] text-signal-emerald">
                        %{b.hybrid.atmosV4.stabilityPct} Kilitli
                      </span>
                    )}
                    {b.storm && b.storm.score >= 35 && (
                      <span
                        className="rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                        style={{
                          color: b.storm.color,
                          borderColor: `${b.storm.color}55`,
                          backgroundColor: `${b.storm.color}18`
                        }}
                      >
                        {b.storm.label} {b.storm.score}
                      </span>
                    )}
                  </p>
                </div>
                <MiniSpark
                  id={city.id}
                  temps={b.hourly.slice(0, 12).map((h) => h.temperature)}
                />
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

      {/* İzleme Eşikleri (Katlanabilir Form ile Sadeleştirilmiş) */}
      <section className="surface-panel p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink-primary">
            <Bell className="h-4 w-4 text-signal-amber" />
            <span>İzleme Eşikleri ({alerts.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => setShowAlertForm((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-white/[0.1] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{showAlertForm ? "Kapat" : "Yeni Kural"}</span>
          </button>
        </div>

        {showAlertForm && (
          <form
            onSubmit={(e) => {
              handleAddAlert(e);
              setShowAlertForm(false);
            }}
            className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_0.75fr_0.85fr_auto]"
          >
            <select
              value={effectiveAlertCityId}
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
              <option value="windSpeed">
                Rüzgar Hızı ({unit === "imperial" ? "mph" : "km/s"})
              </option>
              <option value="temperature">
                Sıcaklık ({unit === "imperial" ? "°F" : "°C"})
              </option>
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
              <span>Ekle</span>
            </button>
          </form>
        )}

        <div className="divide-y divide-white/[0.07]">
          {evaluatedAlerts.map(({ rule, triggered, currentVal, displayThreshold }) => {
            const meta = getMetricMeta(rule.metric, unit);
            return (
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
                    {meta.label}{" "}
                    <strong className="font-mono text-ink-primary tabular">
                      {rule.operator} {displayThreshold}
                      {meta.unit}
                    </strong>
                  </span>
                  {currentVal !== null && (
                    <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 font-mono text-xs text-signal-sky tabular">
                      Güncel: {currentVal}
                      {meta.unit}
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
            );
          })}
        </div>
      </section>
    </div>
  );
}
