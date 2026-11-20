"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  BellOff,
  Droplets,
  LayoutGrid,
  Plus,
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

function cardGradient(bundle: WeatherBundle): string {
  if (bundle.current.isStorm) {
    return "from-indigo-950/90 via-purple-950/75 to-slate-950/90 border-neon-orange/40";
  }
  if (bundle.current.precipType === "snow") {
    return "from-slate-800/80 via-sky-950/70 to-slate-950/90 border-sky-300/35";
  }
  if (bundle.current.precipType === "rain") {
    return "from-slate-900/85 via-cyan-950/70 to-slate-950/90 border-neon-cyan/35";
  }
  if (bundle.current.daylight > 0.65) {
    return "from-sky-900/75 via-blue-950/70 to-slate-950/90 border-amber-300/30";
  }
  return "from-night-800/85 via-night-900/80 to-night-950/90 border-white/15";
}

function MiniSpark({ temps }: { temps: number[] }) {
  if (temps.length < 2) return null;
  const min = Math.min(...temps) - 1;
  const max = Math.max(...temps) + 1;
  const span = Math.max(1, max - min);
  const w = 140;
  const h = 32;
  const step = w / (temps.length - 1);
  const d = temps
    .map(
      (t, i) =>
        `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(h - 4 - ((t - min) / span) * (h - 8)).toFixed(1)}`
    )
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-36" aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke="#ff8a3c"
        strokeWidth="2"
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
  const [loadingMap, setLoadingMap] = useState(false);

  // Yeni alarm form state
  const [alertCityId, setAlertCityId] = useState(favorites[0]?.id ?? "");
  const [alertMetric, setAlertMetric] = useState<AlertMetric>("windSpeed");
  const [alertOperator, setAlertOperator] = useState<">" | "<">(">");
  const [alertThreshold, setAlertThreshold] = useState(40);

  useEffect(() => {
    if (!favorites.some((f) => f.id === alertCityId) && favorites[0]) {
      setAlertCityId(favorites[0].id);
    }
  }, [favorites, alertCityId]);

  useEffect(() => {
    let cancelled = false;
    const loadAll = async () => {
      setLoadingMap(true);
      const entries = await Promise.all(
        favorites.map(async (loc) => {
          try {
            const qs = new URLSearchParams({
              lat: String(loc.lat),
              lon: String(loc.lon),
              name: loc.name,
              country: loc.country ?? ""
            });
            const res = await fetch(`/api/weather?${qs.toString()}`);
            if (!res.ok) return null;
            const data: WeatherBundle = await res.json();
            return [loc.id, { ...data, location: { ...data.location, ...loc } }] as const;
          } catch {
            return null;
          }
        })
      );

      if (!cancelled) {
        const next: Record<string, WeatherBundle> = {};
        for (const item of entries) {
          if (item) next[item[0]] = item[1];
        }
        setCityBundles(next);
        setLoadingMap(false);
      }
    };

    void loadAll();
    return () => {
      cancelled = true;
    };
  }, [favorites]);

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Üst Başlık & Şehir Ekle */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-neon-orange">
            <LayoutGrid className="h-4 w-4" />
            Çoklu Şehir Karşılaştırma & Alarmlar
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-neon-white sm:text-4xl">
            Atmosfer Panom
          </h1>
          <p className="mt-1 text-sm text-neon-white/65">
            Favori şehirlerinin canlı hava durumunu tek ekranda kıyasla ve kişisel eşik uyarıları kur.
          </p>
        </div>

        <div className="w-full max-w-sm">
          <CitySearch
            compact
            onSelect={(loc) => addFavorite(loc)}
            placeholder="+ Panoya yeni şehir ekle..."
          />
        </div>
      </div>

      {/* Tetiklenen Canlı Uyarı Bandı */}
      {activeTriggered.length > 0 && (
        <div className="rounded-3xl border border-neon-orange/55 bg-neon-orange/15 p-4 space-y-2 backdrop-blur-xl">
          <p className="flex items-center gap-2 font-display text-sm font-semibold text-neon-orange">
            <AlertTriangle className="h-4 w-4" />
            Aktif Atmosfer Uyarıları ({activeTriggered.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {activeTriggered.map(({ rule, currentVal }) => (
              <span
                key={rule.id}
                className="rounded-xl border border-neon-orange/40 bg-night-950/60 px-3 py-1.5 text-xs text-neon-white"
              >
                <strong>{rule.cityName}</strong> · {METRIC_LABELS[rule.metric].label}{" "}
                <span className="font-mono text-neon-orange">
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
          <div className="glass-panel p-4">
            <p className="text-xs text-neon-white/55">En Sıcak</p>
            <p className="mt-1 font-display text-lg font-bold text-neon-orange">
              {extremes.hottest.location.name} ·{" "}
              <span className="font-mono">
                {formatTemperature(extremes.hottest.current.temperature, unit)}
              </span>
            </p>
          </div>
          <div className="glass-panel p-4">
            <p className="text-xs text-neon-white/55">En Serin</p>
            <p className="mt-1 font-display text-lg font-bold text-neon-cyan">
              {extremes.coldest.location.name} ·{" "}
              <span className="font-mono">
                {formatTemperature(extremes.coldest.current.temperature, unit)}
              </span>
            </p>
          </div>
          <div className="glass-panel p-4">
            <p className="text-xs text-neon-white/55">En Rüzgarlı</p>
            <p className="mt-1 font-display text-lg font-bold text-neon-violet">
              {extremes.windiest.location.name} ·{" "}
              <span className="font-mono">
                {formatWindSpeed(extremes.windiest.current.windSpeed, unit)}
              </span>
            </p>
          </div>
          <div className="glass-panel p-4">
            <p className="text-xs text-neon-white/55">En Yüksek Yağış Riski</p>
            <p className="mt-1 font-display text-lg font-bold text-emerald-300">
              {extremes.wettest.location.name} ·{" "}
              <span className="font-mono">
                %{extremes.wettest.current.precipProbability}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Çoklu Şehir Kart Izgarası */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {favorites.map((city) => {
          const b = cityBundles[city.id];
          if (!b) {
            return (
              <div
                key={city.id}
                className="glass-panel h-60 animate-pulse p-5 flex flex-col justify-between"
              >
                <div className="h-5 w-32 rounded bg-white/10" />
                <div className="h-12 w-24 rounded bg-white/10" />
                <div className="h-10 w-full rounded bg-white/5" />
              </div>
            );
          }

          return (
            <article
              key={city.id}
              className={`rounded-3xl border bg-gradient-to-br p-5 shadow-glass backdrop-blur-xl transition-transform hover:-translate-y-0.5 flex flex-col justify-between space-y-4 ${cardGradient(b)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl font-bold text-neon-white">
                    {city.name}
                  </h2>
                  <p className="text-xs text-neon-white/60">
                    {city.country} · Yerel {formatLocalClock(b.timezone)}
                  </p>
                </div>

                {favorites.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFavorite(city.id)}
                    aria-label={`${city.name} şehrini panodan kaldır`}
                    className="rounded-lg border border-white/10 p-1.5 text-neon-white/55 hover:border-red-400/40 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-display text-5xl font-black text-neon-white">
                    {formatTemperature(b.current.temperature, unit)}
                  </span>
                  <p className="mt-1 text-xs font-medium text-neon-white/80">
                    {b.current.condition}
                  </p>
                </div>
                <MiniSpark temps={b.hourly.slice(0, 12).map((h) => h.temperature)} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-xl bg-white/[0.06] px-2.5 py-2">
                  <span className="flex items-center gap-1 text-neon-white/55">
                    <Wind className="h-3 w-3 text-neon-cyan" /> Rüzgar
                  </span>
                  <p className="font-mono font-semibold text-neon-white">
                    {formatWindSpeed(b.current.windSpeed, unit)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.06] px-2.5 py-2">
                  <span className="flex items-center gap-1 text-neon-white/55">
                    <Droplets className="h-3 w-3 text-neon-cyan" /> Nem
                  </span>
                  <p className="font-mono font-semibold text-neon-white">
                    %{b.current.humidity}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.06] px-2.5 py-2">
                  <span className="text-neon-white/55">AQI</span>
                  <p className="font-mono font-semibold text-neon-white">
                    {b.airQuality.europeanAqi} · {b.airQuality.label}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => openCityOnRoute(city, "/")}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 py-2 text-xs font-semibold text-neon-white hover:bg-white/20 transition-colors"
                >
                  <span>3D Sahnede Aç</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openCityOnRoute(city, "/lab")}
                  className="flex items-center justify-center gap-1 rounded-xl border border-neon-orange/40 bg-neon-orange/15 px-3 py-2 text-xs font-semibold text-neon-orange hover:bg-neon-orange/25 transition-colors"
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>CAPE</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {loadingMap && (
        <p className="text-xs text-neon-white/55">Şehir verileri güncelleniyor...</p>
      )}

      {/* Kişisel Atmosfer Alarmları */}
      <section className="glass-panel p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-neon-white">
              <Bell className="h-5 w-5 text-neon-orange" />
              Kişisel Atmosfer Alarmları
            </h2>
            <p className="text-xs text-neon-white/60">
              Belirlediğin eşikler aşıldığında canlı uyarı bandı otomatik tetiklenir.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleAddAlert}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_0.7fr_0.9fr_auto]"
        >
          <select
            value={alertCityId}
            onChange={(e) => setAlertCityId(e.target.value)}
            aria-label="Alarm şehri"
            className="h-10 rounded-xl border border-white/15 bg-night-900/90 px-3 text-sm text-neon-white focus:border-neon-orange/60 focus:outline-none"
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
            aria-label="Alarm metriği"
            className="h-10 rounded-xl border border-white/15 bg-night-900/90 px-3 text-sm text-neon-white focus:border-neon-orange/60 focus:outline-none"
          >
            <option value="windSpeed">Rüzgar Hızı (km/s)</option>
            <option value="temperature">Sıcaklık (°C)</option>
            <option value="precipProbability">Yağış Olasılığı (%)</option>
            <option value="aqi">Hava Kalitesi (EAQI)</option>
          </select>

          <select
            value={alertOperator}
            onChange={(e) => setAlertOperator(e.target.value as ">" | "<")}
            aria-label="Alarm koşulu"
            className="h-10 rounded-xl border border-white/15 bg-night-900/90 px-3 font-mono text-sm text-neon-white focus:border-neon-orange/60 focus:outline-none"
          >
            <option value=">">&gt; Üstünde</option>
            <option value="<">&lt; Altında</option>
          </select>

          <input
            type="number"
            value={alertThreshold}
            onChange={(e) => setAlertThreshold(Number(e.target.value))}
            aria-label="Alarm eşik değeri"
            className="h-10 rounded-xl border border-white/15 bg-night-900/90 px-3 font-mono text-sm text-neon-white focus:border-neon-orange/60 focus:outline-none"
          />

          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-neon-orange px-4 text-sm font-semibold text-night-950 hover:brightness-110 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Kural Ekle</span>
          </button>
        </form>

        <div className="divide-y divide-white/10">
          {evaluatedAlerts.map(({ rule, triggered, currentVal }) => (
            <div
              key={rule.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    !rule.enabled
                      ? "bg-white/25"
                      : triggered
                        ? "bg-neon-orange animate-pulse"
                        : "bg-emerald-400"
                  }`}
                />
                <span className="font-medium text-neon-white">{rule.cityName}</span>
                <span className="text-xs text-neon-white/70">
                  {METRIC_LABELS[rule.metric].label}{" "}
                  <strong className="font-mono text-neon-white">
                    {rule.operator} {rule.threshold}
                    {METRIC_LABELS[rule.metric].unit}
                  </strong>
                </span>
                {currentVal !== null && (
                  <span className="rounded-lg bg-white/5 px-2 py-0.5 font-mono text-xs text-neon-cyan">
                    Şu an: {currentVal}
                    {METRIC_LABELS[rule.metric].unit}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleAlert(rule.id)}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-neon-white/80 hover:bg-white/10"
                >
                  {rule.enabled ? (
                    <span className="flex items-center gap-1">
                      <Bell className="h-3.5 w-3.5 text-emerald-300" /> Aktif
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <BellOff className="h-3.5 w-3.5 text-neon-white/45" /> Pasif
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => removeAlert(rule.id)}
                  aria-label="Kuralı sil"
                  className="rounded-lg border border-white/10 p-1.5 text-neon-white/55 hover:border-red-400/40 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
