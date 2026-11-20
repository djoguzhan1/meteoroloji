"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Compass,
  Droplets,
  Eye,
  Gauge,
  Layers,
  RefreshCw,
  ShieldCheck,
  Star,
  Sun,
  Sunrise,
  Sunset,
  Wind
} from "lucide-react";
import { useWeather } from "@/context/WeatherContext";
import {
  formatTemperature,
  formatWindSpeed,
  windDirectionToCompass
} from "@/lib/weather";
import { analyzeConvectiveProfile } from "@/lib/thermo-cape";
import TimeScrubber from "./TimeScrubber";
import HourlyCharts from "./HourlyCharts";

function WeatherGlyph({
  code,
  className = "h-5 w-5"
}: {
  code: number;
  className?: string;
}) {
  if (code >= 95) return <CloudLightning className={`${className} text-signal-amber`} />;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return <CloudSnow className={`${className} text-slate-200`} />;
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain className={`${className} text-signal-sky`} />;
  }
  if (code === 0 || code === 1) return <Sun className={`${className} text-signal-amber`} />;
  return <Cloud className={`${className} text-ink-secondary`} />;
}

function WindCompassMini({ deg }: { deg: number }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className="h-9 w-9 shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="20"
        cy="20"
        r="17"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1.2"
      />
      <text x="20" y="8" textAnchor="middle" fill="rgba(167,180,200,0.75)" fontSize="6" fontFamily="monospace">
        K
      </text>
      <text x="34" y="22" textAnchor="middle" fill="rgba(167,180,200,0.45)" fontSize="5.5" fontFamily="monospace">
        D
      </text>
      <text x="20" y="36" textAnchor="middle" fill="rgba(167,180,200,0.45)" fontSize="5.5" fontFamily="monospace">
        G
      </text>
      <text x="6" y="22" textAnchor="middle" fill="rgba(167,180,200,0.45)" fontSize="5.5" fontFamily="monospace">
        B
      </text>
      <g transform={`rotate(${deg} 20 20)`}>
        <line
          x1="20"
          y1="27"
          x2="20"
          y2="11"
          stroke="#38bdf8"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <polygon points="20,9 17.2,14.5 22.8,14.5" fill="#38bdf8" />
      </g>
    </svg>
  );
}

function BarometerDialMini({ pressure }: { pressure: number }) {
  // 980 hPa -> -115°, 1040 hPa -> +115°
  const clamped = Math.max(980, Math.min(1040, pressure));
  const frac = (clamped - 980) / 60;
  const angleDeg = -115 + frac * 230;
  return (
    <svg
      viewBox="0 0 44 36"
      className="h-9 w-10 shrink-0"
      aria-hidden="true"
    >
      <path
        d="M 7 29 A 16 16 0 1 1 37 29"
        fill="none"
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M 15 10 A 16 16 0 0 1 29 10"
        fill="none"
        stroke="rgba(56,189,248,0.45)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <g transform={`rotate(${angleDeg} 22 21)`}>
        <line
          x1="22"
          y1="21"
          x2="22"
          y2="8"
          stroke="#f3f6fb"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </g>
      <circle cx="22" cy="21" r="2.2" fill="#38bdf8" />
    </svg>
  );
}

function SunCycleCard({
  sunrise,
  sunset,
  solarElevationDeg
}: {
  sunrise: string;
  sunset: string;
  solarElevationDeg: number;
}) {
  const srTime = sunrise ? sunrise.slice(11, 16) : "--:--";
  const ssTime = sunset ? sunset.slice(11, 16) : "--:--";

  const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const srMin = toMin(srTime);
  const ssMin = toMin(ssTime);
  const progress = Math.max(
    0,
    Math.min(1, (nowMin - srMin) / Math.max(60, ssMin - srMin))
  );

  const angle = Math.PI * (1 - progress);
  const cx = 110 + Math.cos(angle) * 84;
  const cy = 90 - Math.sin(angle) * 72;

  const dayDur = Math.max(0, ssMin - srMin);
  const durH = Math.floor(dayDur / 60);
  const durM = dayDur % 60;

  return (
    <div className="surface-panel p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-semibold text-ink-primary">
          Güneş Döngüsü
        </span>
        <span className="font-mono text-xs text-ink-muted tabular">
          Açı {solarElevationDeg > 0 ? `+${solarElevationDeg}°` : `${solarElevationDeg}°`} · {durH}s {durM}dk
        </span>
      </div>

      <svg viewBox="0 0 220 104" className="my-2 h-24 w-full" aria-hidden="true">
        <line
          x1="14"
          y1="90"
          x2="206"
          y2="90"
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="3 3"
        />
        <path
          d="M 26 90 A 84 72 0 0 1 194 90"
          fill="none"
          stroke="rgba(245, 158, 11, 0.45)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <circle
          cx={cx}
          cy={cy}
          r="6"
          fill={solarElevationDeg > 0 ? "#f59e0b" : "#94a3b8"}
          stroke="#f3f6fb"
          strokeWidth="1.5"
        />
      </svg>

      <div className="flex items-center justify-between text-xs tabular">
        <span className="flex items-center gap-1.5 text-ink-secondary">
          <Sunrise className="h-3.5 w-3.5 text-signal-amber" />
          <span className="font-mono text-ink-primary">{srTime}</span>
        </span>
        <span className="flex items-center gap-1.5 text-ink-secondary">
          <Sunset className="h-3.5 w-3.5 text-signal-amber" />
          <span className="font-mono text-ink-primary">{ssTime}</span>
        </span>
      </div>
    </div>
  );
}

export default function HeroSceneView() {
  const {
    bundle,
    loading,
    error,
    refreshWeather,
    activeLocation,
    isFavorite,
    addFavorite,
    removeFavorite,
    unit,
    frameIndex,
    setFrameIndex
  } = useWeather();

  const liveSoundingSummary = useMemo(() => {
    if (!bundle || bundle.sounding.length === 0) return null;
    return analyzeConvectiveProfile({
      surfaceTempC: bundle.current.temperature,
      surfaceHumidity: bundle.current.humidity,
      surfacePressureHpa: bundle.current.pressure,
      levels: bundle.sounding
    });
  }, [bundle]);

  if (!bundle) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center space-y-4">
        <div className="surface-panel p-8 space-y-4">
          <h1 className="font-display text-xl font-semibold text-ink-primary">
            Canlı Veri Alınamadı
          </h1>
          <p className="text-sm text-ink-secondary">
            {error ?? "Meteoroloji veri servisi yanıt vermedi."}
          </p>
          <button
            type="button"
            onClick={() => void refreshWeather()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-ink-primary hover:bg-white/15"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  const activeHour = frameIndex > 0 ? bundle.hourly[frameIndex] : null;
  const display = activeHour
    ? {
        temperature: activeHour.temperature,
        apparentTemperature: activeHour.apparentTemperature,
        windSpeed: activeHour.windSpeed,
        windGusts: activeHour.windGusts,
        windDirection: activeHour.windDirection,
        cloudCover: activeHour.cloudCover,
        humidity: activeHour.humidity,
        dewPoint: activeHour.dewPoint,
        pressure: activeHour.pressure,
        visibilityKm: activeHour.visibilityKm,
        uvIndex: activeHour.uvIndex,
        condition: activeHour.condition,
        weatherCode: activeHour.weatherCode,
        temp850hPa: activeHour.temp850hPa,
        freezingLevelM: activeHour.freezingLevelM,
        timeLabel: `${activeHour.dayLabel} · ${activeHour.hourLabel}`
      }
    : {
        temperature: bundle.current.temperature,
        apparentTemperature: bundle.current.apparentTemperature,
        windSpeed: bundle.current.windSpeed,
        windGusts: bundle.current.windGusts,
        windDirection: bundle.current.windDirection,
        cloudCover: bundle.current.cloudCover,
        humidity: bundle.current.humidity,
        dewPoint: bundle.current.dewPoint,
        pressure: bundle.current.pressure,
        visibilityKm: bundle.current.visibilityKm,
        uvIndex: bundle.current.uvIndex,
        condition: bundle.current.condition,
        weatherCode: bundle.current.weatherCode,
        temp850hPa: bundle.current.temp850hPa,
        freezingLevelM: bundle.nativeConvective.freezingLevelM,
        timeLabel: `Gözlem · ${bundle.current.time.slice(11, 16)}`
      };

  const fav = isFavorite(activeLocation);
  const weekMin = Math.min(...bundle.daily.map((d) => d.tempMin));
  const weekMax = Math.max(...bundle.daily.map((d) => d.tempMax));
  const weekSpan = Math.max(1, weekMax - weekMin);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
      {error && (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
          {error}
        </div>
      )}

      {/* BÖLÜM 1: ANLIK GÖZLEM & ÖLÇÜMLER */}
      <section className="flex min-h-[calc(100vh-7rem)] flex-col justify-between gap-8 py-4">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end">
          {/* Sol: Konum & Ana Sıcaklık */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
              <span className="rounded-lg border border-white/15 bg-obsidian-900/65 px-2.5 py-1 font-mono text-ink-primary backdrop-blur-md">
                {display.timeLabel}
              </span>
              {bundle.location.elevation !== undefined && (
                <span className="rounded-lg border border-white/10 bg-obsidian-900/50 px-2.5 py-1 font-mono backdrop-blur-md">
                  Rakım {bundle.location.elevation} m
                </span>
              )}
              {bundle.hybrid && (
                <a
                  href="#hibrit"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-signal-sky/30 bg-signal-sky/10 px-2.5 py-1 font-mono text-signal-sky hover:bg-signal-sky/15 transition-colors backdrop-blur-md tabular"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Hibrit Uzlaşı %{bundle.hybrid.confidencePct}</span>
                </a>
              )}
              <button
                type="button"
                onClick={() =>
                  fav
                    ? removeFavorite(activeLocation.id)
                    : addFavorite(activeLocation)
                }
                aria-label={fav ? "İstasyonlardan çıkar" : "İstasyonlara kaydet"}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 transition-colors backdrop-blur-md ${
                  fav
                    ? "border-signal-amber/45 bg-signal-amber/15 text-amber-200"
                    : "border-white/10 bg-obsidian-900/50 text-ink-secondary hover:text-ink-primary"
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${fav ? "fill-amber-300 text-amber-300" : ""}`} />
                {fav ? "Kayıtlı" : "Kaydet"}
              </button>
              <button
                type="button"
                onClick={() => void refreshWeather()}
                aria-label="Verileri güncelle"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-obsidian-900/50 px-2.5 py-1 text-ink-secondary hover:text-ink-primary transition-colors backdrop-blur-md"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Güncelle
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-baseline gap-2.5">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
                  {activeLocation.name}
                  {activeLocation.country ? `, ${activeLocation.country}` : ""}
                </h1>
                <span className="font-mono text-xs text-ink-muted tabular">
                  {activeLocation.lat.toFixed(2)}°K · {activeLocation.lon.toFixed(2)}°D
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-baseline gap-5">
                <span className="font-display text-7xl font-bold tracking-tight text-ink-primary tabular sm:text-8xl lg:text-[7.5rem] leading-none">
                  {formatTemperature(display.temperature, unit)}
                </span>
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2 font-display text-xl font-medium text-ink-primary sm:text-2xl">
                    <WeatherGlyph code={display.weatherCode} className="h-6 w-6" />
                    <span>{display.condition}</span>
                  </p>
                  <p className="text-sm text-ink-secondary tabular">
                    Hissedilen{" "}
                    <strong className="font-mono font-medium text-ink-primary">
                      {formatTemperature(display.apparentTemperature, unit)}
                    </strong>
                    {" · "}
                    Günlük{" "}
                    <span className="font-mono text-ink-primary">
                      {formatTemperature(bundle.daily[0]?.tempMax ?? display.temperature, unit)} /{" "}
                      {formatTemperature(bundle.daily[0]?.tempMin ?? display.temperature, unit)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Gerçek Üst Atmosfer Hızlı Satırı (850 hPa + 0°C Donma Seviyesi) */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-ink-secondary tabular">
              {display.temp850hPa !== null && (
                <span className="rounded-lg border border-white/10 bg-obsidian-900/60 px-3 py-1.5 backdrop-blur-md">
                  850 hPa:{" "}
                  <strong className="text-ink-primary">{display.temp850hPa}°C</strong>
                </span>
              )}
              {display.freezingLevelM !== null && (
                <span className="rounded-lg border border-white/10 bg-obsidian-900/60 px-3 py-1.5 backdrop-blur-md">
                  0°C Seviyesi:{" "}
                  <strong className="text-ink-primary">{display.freezingLevelM} m</strong>
                </span>
              )}
              {liveSoundingSummary && (
                <Link
                  href="/lab"
                  className="rounded-lg border border-white/10 bg-obsidian-900/60 px-3 py-1.5 text-ink-secondary hover:border-white/25 hover:text-ink-primary transition-colors backdrop-blur-md"
                >
                  CAPE:{" "}
                  <strong className="text-ink-primary">
                    {bundle.nativeConvective.cape ?? liveSoundingSummary.cape} J/kg
                  </strong>{" "}
                  · ECMWF/GFS/ICON →
                </Link>
              )}
            </div>
          </div>

          {/* Sağ: Meteorolojik Ölçüm Paneli */}
          <div className="surface-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-secondary">
                Anlık Ölçümler
              </h2>
              <span className="font-mono text-xs text-ink-secondary tabular">
                EAQI {bundle.airQuality.europeanAqi} · {bundle.airQuality.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 tabular">
              <div className="surface-tile p-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Rüzgar</span>
                  <Wind className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-mono text-lg font-semibold text-ink-primary">
                      {formatWindSpeed(display.windSpeed, unit)}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-ink-muted">
                      <Compass className="h-3 w-3 text-signal-sky" />
                      {windDirectionToCompass(display.windDirection)} · Hamle{" "}
                      {formatWindSpeed(display.windGusts, unit)}
                    </p>
                  </div>
                  <WindCompassMini deg={display.windDirection} />
                </div>
              </div>

              <div className="surface-tile p-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Nem & Çiy</span>
                  <Droplets className="h-3.5 w-3.5" />
                </div>
                <p className="font-mono text-lg font-semibold text-ink-primary">
                  %{display.humidity}
                </p>
                <p className="text-xs text-ink-muted">
                  Çiy {formatTemperature(display.dewPoint, unit)}
                </p>
              </div>

              <div className="surface-tile p-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Basınç (MSL)</span>
                  <Gauge className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center justify-between gap-1.5">
                  <div>
                    <p className="font-mono text-lg font-semibold text-ink-primary">
                      {Math.round(display.pressure)} hPa
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-ink-muted">
                      {bundle.current.pressureTrend === "yükseliyor" ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-signal-emerald" />
                      ) : bundle.current.pressureTrend === "düşüyor" ? (
                        <ArrowDownRight className="h-3.5 w-3.5 text-signal-amber" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 text-ink-muted" />
                      )}
                      {bundle.current.pressureDelta3h > 0
                        ? `+${bundle.current.pressureDelta3h}`
                        : bundle.current.pressureDelta3h}{" "}
                      hPa/3s
                    </p>
                  </div>
                  <BarometerDialMini pressure={display.pressure} />
                </div>
              </div>

              <div className="surface-tile p-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Bulutluluk</span>
                  <Cloud className="h-3.5 w-3.5" />
                </div>
                <p className="font-mono text-lg font-semibold text-ink-primary">
                  %{display.cloudCover}
                </p>
                <p className="text-xs text-ink-muted">UV {display.uvIndex.toFixed(1)}</p>
              </div>

              <div className="surface-tile p-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Görüş</span>
                  <Eye className="h-3.5 w-3.5" />
                </div>
                <p className="font-mono text-lg font-semibold text-ink-primary">
                  {display.visibilityKm} km
                </p>
                <p className="text-xs text-ink-muted">
                  {display.visibilityKm >= 10
                    ? "Açık"
                    : display.visibilityKm >= 4
                      ? "Puslu"
                      : "Kısıtlı"}
                </p>
              </div>

              <div className="surface-tile p-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Hava Kalitesi</span>
                  <Activity className="h-3.5 w-3.5" />
                </div>
                <p className="font-mono text-lg font-semibold text-ink-primary">
                  {bundle.airQuality.label}
                </p>
                <p className="text-xs text-ink-muted">
                  PM2.5: {bundle.airQuality.pm25} µg
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 24 Saatlik Akış & Alt Yönlendirme */}
        <div className="space-y-3">
          <TimeScrubber
            hourly={bundle.hourly}
            frameIndex={frameIndex}
            onChange={setFrameIndex}
            unit={unit}
          />

          <div className="flex items-center justify-between text-xs text-ink-muted">
            <a
              href="#saatlik"
              className="inline-flex items-center gap-1.5 hover:text-ink-primary transition-colors"
            >
              <ArrowDown className="h-3.5 w-3.5" />
              <span>Saatlik grafik & 7 günlük tahmin</span>
            </a>
            <div className="hidden sm:flex items-center gap-5">
              <Link href="/world" className="hover:text-ink-primary transition-colors">
                Canlı Yağış Radarı →
              </Link>
              <Link href="/lab" className="hover:text-ink-primary transition-colors">
                ECMWF · GFS · ICON & Skew-T →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BÖLÜM 1.5: ÇOKLU MODEL HİBRİT SENTEZ & VERİ KAYNAKLARI */}
      {bundle.hybrid && (
        <section id="hibrit" className="scroll-mt-20 surface-panel p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div>
              <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-signal-sky">
                <Layers className="h-3.5 w-3.5" />
                Parametre Bazlı Çoklu Model Hibrit Sentezi
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold text-ink-primary">
                Canlı Model Karşılaştırması & Uzlaşı Skoru
              </h2>
              <p className="mt-0.5 text-xs text-ink-muted">
                Her meteorolojik değişken, WMO doğrulama puanı en yüksek sayısal tahmin modellerinden ağırlıklı sentezlenir.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right font-mono tabular">
                <span className="block text-[10px] uppercase tracking-wider text-ink-muted">
                  Anlık Model Uzlaşısı
                </span>
                <span className="text-xl font-semibold text-signal-emerald">
                  %{bundle.hybrid.confidencePct}
                </span>
                <span className="ml-2 text-xs text-ink-muted">
                  ΔT {bundle.hybrid.tempSpreadC}°C · ΔP {bundle.hybrid.pressureSpreadHpa} hPa
                </span>
              </div>
              <Link
                href="/lab"
                className="rounded-xl border border-white/15 bg-white/[0.05] px-3 py-2 text-xs font-medium text-ink-primary hover:bg-white/[0.1] transition-colors"
              >
                72s Grafik →
              </Link>
            </div>
          </div>

          {/* 3 Model Canlı Anlık Karşılaştırma Şeridi */}
          <div className="grid gap-3 md:grid-cols-3 font-mono text-xs tabular">
            {[
              {
                key: "ecmwf" as const,
                name: "ECMWF IFS 0.25°",
                org: "Avrupa Merkezi · Sıcaklık & Basınç Lideri",
                accent: "text-[#38bdf8]",
                dot: "bg-[#38bdf8]"
              },
              {
                key: "icon" as const,
                name: "DWD ICON-EU (7 km)",
                org: "Alman Meteoroloji · Yağış & Rüzgar Lideri",
                accent: "text-[#10b981]",
                dot: "bg-[#10b981]"
              },
              {
                key: "gfs" as const,
                name: "NOAA GFS",
                org: "ABD Küresel · Konveksiyon & Üst Atmosfer",
                accent: "text-[#f59e0b]",
                dot: "bg-[#f59e0b]"
              }
            ].map((m) => {
              const t = bundle.hybrid.currentBreakdown.temperature[m.key];
              const p = bundle.hybrid.currentBreakdown.pressure[m.key];
              const w = bundle.hybrid.currentBreakdown.windSpeed[m.key];
              const t850 = bundle.hybrid.currentBreakdown.temp850hPa[m.key];
              return (
                <div key={m.key} className="surface-tile p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-1.5 font-semibold ${m.accent}`}>
                      <span className={`h-2 w-2 rounded-full ${m.dot}`} />
                      {m.name}
                    </span>
                    <span className="text-sm font-semibold text-ink-primary">
                      {t !== null ? formatTemperature(t, unit) : "—"}
                    </span>
                  </div>
                  <p className="font-sans text-[11px] text-ink-muted">{m.org}</p>
                  <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 text-[11px] text-ink-secondary">
                    <span>{p !== null ? `${p} hPa` : "—"}</span>
                    <span>{w !== null ? formatWindSpeed(w, unit) : "—"}</span>
                    <span>850 hPa: {t850 !== null ? `${t850}°` : "—"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Parametre Bazlı Model Yönlendirme Matrisi */}
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 text-xs">
            {bundle.hybrid.attributions.map((item) => (
              <div
                key={item.parameter}
                className="rounded-xl border border-white/[0.06] bg-obsidian-950/55 p-3 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-ink-primary">{item.parameter}</span>
                  <span className="font-mono text-[10px] text-signal-sky">
                    {item.primaryEngine}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-ink-secondary tabular">
                  {item.weightsLabel}
                </p>
                <p className="text-[11px] text-ink-muted leading-relaxed">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BÖLÜM 2: SAATLİK ŞERİT & GRAFİKLER */}
      <section id="saatlik" className="scroll-mt-20 space-y-5">
        <div className="surface-panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-primary">
              Saatlik Tahmin (24s)
            </h2>
            <span className="text-xs text-ink-muted">
              Herhangi bir saate tıklayarak gökyüzünü ve ölçümleri incele
            </span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 tabular">
            {bundle.hourly.slice(0, 24).map((h, i) => {
              const isSelected = frameIndex === i;
              return (
                <button
                  key={h.time}
                  type="button"
                  onClick={() => setFrameIndex(i)}
                  className={`flex min-w-[84px] shrink-0 flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center transition-colors ${
                    isSelected
                      ? "border-white/30 bg-white/[0.12] text-ink-primary"
                      : "border-white/[0.07] bg-white/[0.03] text-ink-secondary hover:bg-white/[0.07]"
                  }`}
                >
                  <span className="font-mono text-xs text-ink-muted">
                    {i === 0 ? "Şimdi" : h.hourLabel}
                  </span>
                  <WeatherGlyph code={h.weatherCode} className="h-5 w-5" />
                  <span className="font-mono text-sm font-semibold text-ink-primary">
                    {formatTemperature(h.temperature, unit)}
                  </span>
                  <span className="font-mono text-xs text-signal-sky">
                    %{h.precipProbability}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <HourlyCharts hourly={bundle.hourly} unit={unit} />
      </section>

      {/* BÖLÜM 3: 7 GÜNLÜK TAHMİN & DETAY KARTLARI */}
      <section
        id="haftalik"
        className="scroll-mt-20 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]"
      >
        <div className="surface-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-primary">
              7 Günlük Tahmin
            </h2>
            <span className="text-xs text-ink-muted">
              Haftalık sıcaklık aralığı & yağış
            </span>
          </div>

          <div className="divide-y divide-white/[0.07] tabular">
            {bundle.daily.map((d) => {
              const leftPct = ((d.tempMin - weekMin) / weekSpan) * 100;
              const widthPct = Math.max(8, ((d.tempMax - d.tempMin) / weekSpan) * 100);
              return (
                <div
                  key={d.date}
                  className="grid grid-cols-[68px_32px_48px_1fr_78px] items-center gap-3 py-3 text-sm"
                >
                  <span className="font-medium text-ink-primary">{d.dayName}</span>
                  <WeatherGlyph code={d.weatherCode} className="h-4 w-4" />
                  <span className="font-mono text-xs text-signal-sky">
                    %{d.precipProbabilityMax}
                  </span>

                  <div className="flex items-center gap-2.5">
                    <span className="w-8 text-right font-mono text-xs text-ink-muted">
                      {formatTemperature(d.tempMin, unit)}
                    </span>
                    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-signal-sky to-signal-amber"
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`
                        }}
                      />
                    </div>
                    <span className="w-8 font-mono text-xs font-medium text-ink-primary">
                      {formatTemperature(d.tempMax, unit)}
                    </span>
                  </div>

                  <span className="text-right font-mono text-xs text-ink-muted">
                    {formatWindSpeed(d.windSpeedMax, unit)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SunCycleCard
            sunrise={bundle.current.sunrise}
            sunset={bundle.current.sunset}
            solarElevationDeg={bundle.current.solarElevationDeg}
          />

          <div className="surface-panel p-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold text-ink-primary">
                UV Radyasyonu
              </span>
              <Sun className="h-4 w-4 text-signal-amber" />
            </div>
            <div>
              <p className="font-mono text-3xl font-bold text-ink-primary tabular">
                {bundle.daily[0]?.uvIndexMax.toFixed(1) ?? "0.0"}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {(bundle.daily[0]?.uvIndexMax ?? 0) >= 8
                  ? "Çok yüksek — öğle saatlerinde korunma gerekli"
                  : (bundle.daily[0]?.uvIndexMax ?? 0) >= 6
                    ? "Yüksek — güneş koruması önerilir"
                    : (bundle.daily[0]?.uvIndexMax ?? 0) >= 3
                      ? "Orta düzey güneş ışınımı"
                      : "Düşük UV indeksi"}
              </p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500">
              <div
                className="h-full w-1.5 rounded-full bg-white"
                style={{
                  marginLeft: `${Math.min(95, ((bundle.daily[0]?.uvIndexMax ?? 0) / 11) * 100)}%`
                }}
              />
            </div>
          </div>

          <div className="surface-panel p-5 space-y-3 tabular">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold text-ink-primary">
                Hava Kalitesi
              </span>
              <span className="font-mono text-xs text-ink-secondary">
                EAQI {bundle.airQuality.europeanAqi} · {bundle.airQuality.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="surface-tile p-2.5">
                <span className="text-ink-muted">PM2.5</span>
                <p className="font-mono font-medium text-ink-primary">
                  {bundle.airQuality.pm25} µg/m³
                </p>
              </div>
              <div className="surface-tile p-2.5">
                <span className="text-ink-muted">PM10</span>
                <p className="font-mono font-medium text-ink-primary">
                  {bundle.airQuality.pm10} µg/m³
                </p>
              </div>
              <div className="surface-tile p-2.5">
                <span className="text-ink-muted">Ozon (O₃)</span>
                <p className="font-mono font-medium text-ink-primary">
                  {bundle.airQuality.ozone} µg/m³
                </p>
              </div>
              <div className="surface-tile p-2.5">
                <span className="text-ink-muted">NO₂ / Toz</span>
                <p className="font-mono font-medium text-ink-primary">
                  {bundle.airQuality.no2} / {bundle.airQuality.dust}
                </p>
              </div>
            </div>
          </div>

          <div className="surface-panel p-5 flex flex-col justify-between space-y-3 tabular">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold text-ink-primary">
                Üst Atmosfer
              </span>
              <Activity className="h-4 w-4 text-ink-secondary" />
            </div>

            {liveSoundingSummary && (
              <div className="space-y-1.5 text-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-ink-muted">CAPE</span>
                  <span className="font-mono text-lg font-semibold text-ink-primary">
                    {bundle.nativeConvective.cape ?? liveSoundingSummary.cape} J/kg
                  </span>
                </div>
                <div className="flex justify-between text-ink-secondary">
                  <span>0–6 km Kırılma</span>
                  <span className="font-mono text-ink-primary">
                    {liveSoundingSummary.bulkShear06Kt} kt
                  </span>
                </div>
                <div className="flex justify-between text-ink-secondary">
                  <span>700–500 Lapse Rate</span>
                  <span className="font-mono text-ink-primary">
                    {liveSoundingSummary.lapseRate700500} °C/km
                  </span>
                </div>
              </div>
            )}

            <Link
              href="/lab"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] px-3 py-2 text-xs font-medium text-ink-primary hover:bg-white/[0.12] transition-colors"
            >
              Sondaj & ECMWF/GFS/ICON →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
