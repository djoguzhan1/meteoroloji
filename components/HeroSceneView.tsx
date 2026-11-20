"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import {
  Activity,
  ArrowDown,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Compass,
  Droplets,
  Eye,
  Gauge,
  RefreshCw,
  Star,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Wind
} from "lucide-react";
import { SCENARIO_META, useWeather } from "@/context/WeatherContext";
import {
  formatTemperature,
  formatWindSpeed,
  windDirectionToCompass
} from "@/lib/weather";
import { analyzeConvectiveProfile } from "@/lib/thermo-cape";
import TimeScrubber from "./TimeScrubber";
import HourlyCharts from "./HourlyCharts";

function WeatherGlyph({ code, className = "h-5 w-5" }: { code: number; className?: string }) {
  if (code >= 95) return <CloudLightning className={`${className} text-neon-orange`} />;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return <CloudSnow className={`${className} text-sky-200`} />;
  }
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    return <CloudRain className={`${className} text-neon-cyan`} />;
  }
  if (code === 0 || code === 1) return <Sun className={`${className} text-amber-300`} />;
  return <Cloud className={`${className} text-slate-300`} />;
}

function SunArc({ sunrise, sunset }: { sunrise: string; sunset: string }) {
  const srTime = sunrise ? sunrise.slice(11, 16) : "06:45";
  const ssTime = sunset ? sunset.slice(11, 16) : "18:00";

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

  // Yarım daire yay üstündeki güneş noktası
  const angle = Math.PI * (1 - progress);
  const cx = 110 + Math.cos(angle) * 85;
  const cy = 92 - Math.sin(angle) * 74;

  const dayDurationMin = Math.max(0, ssMin - srMin);
  const durH = Math.floor(dayDurationMin / 60);
  const durM = dayDurationMin % 60;

  return (
    <div className="glass-panel p-5 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-semibold text-neon-white">
          Güneş Döngüsü
        </span>
        <span className="font-mono text-xs text-neon-white/55">
          {durH}s {durM}dk
        </span>
      </div>

      <svg viewBox="0 0 220 106" className="my-2 h-28 w-full" aria-hidden="true">
        <line
          x1="15"
          y1="92"
          x2="205"
          y2="92"
          stroke="rgba(255,255,255,0.14)"
          strokeDasharray="3 3"
        />
        <path
          d="M 25 92 A 85 74 0 0 1 195 92"
          fill="none"
          stroke="rgba(255,138,60,0.45)"
          strokeWidth="2.5"
          strokeDasharray="4 4"
        />
        <circle
          cx={cx}
          cy={cy}
          r="7"
          fill="#ff8a3c"
          stroke="#fff7ed"
          strokeWidth="2"
        />
      </svg>

      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-amber-300">
          <Sunrise className="h-4 w-4" />
          <span className="font-mono">{srTime}</span>
        </span>
        <span className="flex items-center gap-1.5 text-neon-orange">
          <Sunset className="h-4 w-4" />
          <span className="font-mono">{ssTime}</span>
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
    scenario,
    setScenario,
    frameIndex,
    setFrameIndex
  } = useWeather();

  const heroRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        [headingRef.current, cardRef.current],
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: "power3.out"
        }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const presetOverride = SCENARIO_META[scenario]?.override;
  const activeHour = frameIndex > 0 ? bundle.hourly[frameIndex] : null;

  const display = useMemo(() => {
    if (presetOverride) {
      return {
        temperature: presetOverride.temperature,
        apparentTemperature: presetOverride.apparentTemperature,
        windSpeed: presetOverride.windSpeed,
        windGusts: presetOverride.windGusts,
        windDirection: presetOverride.windDirection,
        cloudCover: presetOverride.cloudCover,
        humidity: presetOverride.humidity,
        dewPoint: bundle.current.dewPoint,
        pressure: presetOverride.pressure,
        visibilityKm: presetOverride.isStorm ? 4.5 : 14,
        uvIndex: presetOverride.daylight > 0.7 ? 7.2 : 1.2,
        condition: presetOverride.condition,
        isStorm: presetOverride.isStorm,
        aqiLabel: presetOverride.airQualityLabel,
        aqiValue: presetOverride.airQualityIndex * 18,
        badge: `${SCENARIO_META[scenario].label} Simülasyonu`,
        sourceText: "Simülasyon"
      };
    }

    if (activeHour) {
      return {
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
        isStorm: activeHour.isStorm,
        aqiLabel: bundle.airQuality.label,
        aqiValue: bundle.airQuality.europeanAqi,
        badge: `${activeHour.dayLabel} · ${activeHour.hourLabel}`,
        sourceText: bundle.source === "open-meteo" ? "Open-Meteo Canlı" : "Demo Veri"
      };
    }

    const c = bundle.current;
    return {
      temperature: c.temperature,
      apparentTemperature: c.apparentTemperature,
      windSpeed: c.windSpeed,
      windGusts: c.windGusts,
      windDirection: c.windDirection,
      cloudCover: c.cloudCover,
      humidity: c.humidity,
      dewPoint: c.dewPoint,
      pressure: c.pressure,
      visibilityKm: c.visibilityKm,
      uvIndex: c.uvIndex,
      condition: c.condition,
      isStorm: c.isStorm,
      aqiLabel: bundle.airQuality.label,
      aqiValue: bundle.airQuality.europeanAqi,
      badge: "Anlık Atmosfer",
      sourceText: bundle.source === "open-meteo" ? "Open-Meteo Canlı" : "Demo Veri"
    };
  }, [activeHour, bundle, presetOverride, scenario]);

  const liveCapeSummary = useMemo(() => {
    return analyzeConvectiveProfile({
      surfaceType: "soil",
      surfaceTempC: bundle.current.temperature,
      surfaceHumidity: bundle.current.humidity,
      surfacePressureHpa: bundle.current.pressure,
      levels: bundle.sounding,
      applySurfacePhysics: false
    });
  }, [bundle]);

  const fav = isFavorite(activeLocation);

  // 7 günlük sıcaklık aralığı normalizasyonu
  const weekMin = Math.min(...bundle.daily.map((d) => d.tempMin));
  const weekMax = Math.max(...bundle.daily.map((d) => d.tempMax));
  const weekSpan = Math.max(1, weekMax - weekMin);

  return (
    <div ref={heroRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
      {error && (
        <div className="rounded-2xl border border-amber-400/35 bg-amber-500/15 px-4 py-3 text-xs text-amber-200">
          {error}
        </div>
      )}

      {/* BÖLÜM 1: HERO & CANLI ATMOSFER */}
      <section className="flex min-h-[calc(100vh-7.5rem)] flex-col justify-between gap-8 py-4">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
          {/* Sol: Konum, Dev Sıcaklık, Özet */}
          <div ref={headingRef} className="space-y-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-neon-white/90 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {display.sourceText} · {display.badge}
              </span>

              <button
                type="button"
                onClick={() =>
                  fav
                    ? removeFavorite(activeLocation.id)
                    : addFavorite(activeLocation)
                }
                aria-label={fav ? "Favorilerden çıkar" : "Favorilere ekle"}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  fav
                    ? "border-amber-400/50 bg-amber-400/15 text-amber-200"
                    : "border-white/15 bg-white/5 text-neon-white/80 hover:bg-white/10"
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${fav ? "fill-amber-300 text-amber-300" : ""}`} />
                {fav ? "Favoride" : "Panoma Ekle"}
              </button>

              <button
                type="button"
                onClick={() => void refreshWeather()}
                aria-label="Hava durumunu yenile"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-neon-white/75 hover:bg-white/10 hover:text-neon-white transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Yenile
              </button>
            </div>

            <div>
              <p className="text-sm font-medium text-neon-white/75">
                {activeLocation.name}
                {activeLocation.country ? `, ${activeLocation.country}` : ""}
                <span className="ml-2 font-mono text-xs text-neon-white/45">
                  {activeLocation.lat.toFixed(2)}°K · {activeLocation.lon.toFixed(2)}°D
                </span>
              </p>

              <div className="mt-2 flex flex-wrap items-baseline gap-4">
                <h1 className="heading-glow font-display text-7xl font-black tracking-tight text-transparent bg-gradient-to-br from-white via-neon-white to-neon-orange bg-clip-text sm:text-8xl lg:text-9xl">
                  {formatTemperature(display.temperature, unit)}
                </h1>
                <div className="space-y-1">
                  <p className="font-display text-2xl font-semibold text-neon-white sm:text-3xl">
                    {display.condition}
                  </p>
                  <p className="text-sm text-neon-white/70">
                    Hissedilen{" "}
                    <span className="font-mono font-semibold text-neon-white">
                      {formatTemperature(display.apparentTemperature, unit)}
                    </span>
                    {" · "}
                    En Y / En D:{" "}
                    <span className="font-mono text-neon-white/90">
                      {formatTemperature(bundle.daily[0]?.tempMax ?? display.temperature, unit)} /{" "}
                      {formatTemperature(bundle.daily[0]?.tempMin ?? display.temperature, unit)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {display.isStorm && (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-neon-orange/50 bg-neon-orange/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-neon-orange">
                <CloudLightning className="h-4 w-4" />
                Fırtına modu aktif — 3D kamera & şimşek tepkisi devrede
              </div>
            )}
          </div>

          {/* Sağ: Canlı Telemetri Kartı */}
          <div ref={cardRef} className="glass-panel p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-neon-white/80">
                Canlı Atmosfer Telemetrisi
              </h2>
              <span className="font-mono text-xs text-neon-cyan">
                AQI {display.aqiValue} · {display.aqiLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="glass-card p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-neon-white/60">
                  <span>Rüzgar</span>
                  <Wind className="h-3.5 w-3.5 text-neon-cyan" />
                </div>
                <p className="font-mono text-lg font-semibold text-neon-white">
                  {formatWindSpeed(display.windSpeed, unit)}
                </p>
                <p className="flex items-center gap-1 text-xs text-neon-white/55">
                  <Compass
                    className="h-3.5 w-3.5 text-neon-orange"
                    style={{ transform: `rotate(${display.windDirection}deg)` }}
                  />
                  {windDirectionToCompass(display.windDirection)} · Hamle{" "}
                  {formatWindSpeed(display.windGusts, unit)}
                </p>
              </div>

              <div className="glass-card p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-neon-white/60">
                  <span>Nem & Çiy</span>
                  <Droplets className="h-3.5 w-3.5 text-neon-cyan" />
                </div>
                <p className="font-mono text-lg font-semibold text-neon-white">
                  %{display.humidity}
                </p>
                <p className="text-xs text-neon-white/55">
                  Çiy {formatTemperature(display.dewPoint, unit)}
                </p>
              </div>

              <div className="glass-card p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-neon-white/60">
                  <span>Basınç</span>
                  <Gauge className="h-3.5 w-3.5 text-neon-violet" />
                </div>
                <p className="font-mono text-lg font-semibold text-neon-white">
                  {display.pressure} hPa
                </p>
                <p className="text-xs text-neon-white/55">
                  {display.pressure < 1008
                    ? "Alçak basınç"
                    : display.pressure > 1020
                      ? "Yüksek basınç"
                      : "Normal"}
                </p>
              </div>

              <div className="glass-card p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-neon-white/60">
                  <span>Bulut Örtüsü</span>
                  <Cloud className="h-3.5 w-3.5 text-slate-300" />
                </div>
                <p className="font-mono text-lg font-semibold text-neon-white">
                  %{display.cloudCover}
                </p>
                <p className="text-xs text-neon-white/55">
                  UV {display.uvIndex.toFixed(1)}
                </p>
              </div>

              <div className="glass-card p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-neon-white/60">
                  <span>Görüş</span>
                  <Eye className="h-3.5 w-3.5 text-emerald-300" />
                </div>
                <p className="font-mono text-lg font-semibold text-neon-white">
                  {display.visibilityKm} km
                </p>
                <p className="text-xs text-neon-white/55">
                  {display.visibilityKm >= 10 ? "Berrak" : "Kısıtlı"}
                </p>
              </div>

              <div className="glass-card p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-neon-white/60">
                  <span>Hissedilen</span>
                  <Thermometer className="h-3.5 w-3.5 text-neon-orange" />
                </div>
                <p className="font-mono text-lg font-semibold text-neon-white">
                  {formatTemperature(display.apparentTemperature, unit)}
                </p>
                <p className="text-xs text-neon-white/55">
                  PM2.5: {bundle.airQuality.pm25} µg
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Zaman Çizelgesi (24s) + Aşağı Kaydır İpucu */}
        <div className="space-y-4">
          <TimeScrubber
            hourly={bundle.hourly}
            frameIndex={frameIndex}
            onChange={(idx) => {
              if (scenario !== "live") setScenario("live");
              setFrameIndex(idx);
            }}
            scenario={scenario}
            unit={unit}
          />

          <div className="flex items-center justify-between text-xs text-neon-white/55">
            <a
              href="#saatlik"
              className="inline-flex items-center gap-2 hover:text-neon-white transition-colors"
            >
              <ArrowDown className="h-4 w-4 animate-bounce text-neon-orange" />
              <span>48 Saatlik Grafik & 7 Günlük Tahmin için aşağı kaydır</span>
            </a>
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/world" className="hover:text-neon-cyan transition-colors">
                3D Dünya Küresi →
              </Link>
              <Link href="/lab" className="hover:text-neon-orange transition-colors">
                CAPE / Skew-T Lab →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* BÖLÜM 2: 48 SAATLİK ŞERİT & İNTERAKTİF GRAFİKLER */}
      <section id="saatlik" className="scroll-mt-24 space-y-6">
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-neon-white">
              48 Saatlik Saatlik Akış
            </h2>
            <span className="font-mono text-xs text-neon-white/55">
              Kartlara tıklayarak 3D sahneyi o saate al
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {bundle.hourly.slice(0, 24).map((h, i) => {
              const isSelected = scenario === "live" && frameIndex === i;
              return (
                <button
                  key={h.time}
                  type="button"
                  onClick={() => {
                    setScenario("live");
                    setFrameIndex(i);
                  }}
                  className={`flex min-w-[92px] shrink-0 flex-col items-center gap-2 rounded-2xl border px-3 py-3.5 text-center transition-colors ${
                    isSelected
                      ? "border-neon-orange/70 bg-neon-orange/20 text-neon-white"
                      : "border-white/10 bg-white/[0.04] text-neon-white/80 hover:bg-white/10"
                  }`}
                >
                  <span className="font-mono text-xs text-neon-white/65">
                    {i === 0 ? "Şimdi" : h.hourLabel}
                  </span>
                  <WeatherGlyph code={h.weatherCode} className="h-5 w-5" />
                  <span className="font-mono text-base font-bold text-neon-white">
                    {formatTemperature(h.temperature, unit)}
                  </span>
                  <span className="font-mono text-xs text-neon-cyan">
                    %{h.precipProbability}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <HourlyCharts hourly={bundle.hourly} unit={unit} />
      </section>

      {/* BÖLÜM 3: 7 GÜNLÜK TAHMİN & ATMOSFER DETAY IZGARASI */}
      <section id="haftalik" className="scroll-mt-24 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* 7 Günlük Tahmin */}
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-neon-white">
              7 Günlük Tahmin
            </h2>
            <span className="text-xs text-neon-white/55">
              Normalize sıcaklık aralığı
            </span>
          </div>

          <div className="divide-y divide-white/10">
            {bundle.daily.map((d) => {
              const leftPct = ((d.tempMin - weekMin) / weekSpan) * 100;
              const widthPct = Math.max(8, ((d.tempMax - d.tempMin) / weekSpan) * 100);
              return (
                <div
                  key={d.date}
                  className="grid grid-cols-[72px_36px_54px_1fr_84px] items-center gap-3 py-3 text-sm"
                >
                  <span className="font-medium text-neon-white">{d.dayName}</span>
                  <WeatherGlyph code={d.weatherCode} className="h-5 w-5" />
                  <span className="font-mono text-xs text-neon-cyan">
                    %{d.precipProbabilityMax}
                  </span>

                  <div className="flex items-center gap-2.5">
                    <span className="w-9 text-right font-mono text-xs text-neon-white/60">
                      {formatTemperature(d.tempMin, unit)}
                    </span>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-neon-cyan via-amber-300 to-neon-orange"
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`
                        }}
                      />
                    </div>
                    <span className="w-9 font-mono text-xs font-semibold text-neon-white">
                      {formatTemperature(d.tempMax, unit)}
                    </span>
                  </div>

                  <span className="text-right font-mono text-xs text-neon-white/60">
                    {formatWindSpeed(d.windSpeedMax, unit)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Atmosfer Detay Kartı */}
        <div className="grid gap-4 sm:grid-cols-2">
          <SunArc
            sunrise={bundle.current.sunrise}
            sunset={bundle.current.sunset}
          />

          {/* UV İndeksi */}
          <div className="glass-panel p-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold text-neon-white">
                UV İndeksi
              </span>
              <Sun className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <p className="font-mono text-3xl font-bold text-neon-white">
                {bundle.daily[0]?.uvIndexMax.toFixed(1) ?? "0.0"}
              </p>
              <p className="text-xs text-neon-white/65">
                {(bundle.daily[0]?.uvIndexMax ?? 0) >= 8
                  ? "Çok Yüksek — doğrudan güneşten kaçın"
                  : (bundle.daily[0]?.uvIndexMax ?? 0) >= 6
                    ? "Yüksek — güneş gözlüğü & SPF önerilir"
                    : (bundle.daily[0]?.uvIndexMax ?? 0) >= 3
                      ? "Orta düzey güneş radyasyonu"
                      : "Düşük UV riski"}
              </p>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 via-orange-500 to-purple-500">
              <div
                className="h-full w-1.5 rounded-full bg-white shadow"
                style={{
                  marginLeft: `${Math.min(95, ((bundle.daily[0]?.uvIndexMax ?? 0) / 11) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* Hava Kalitesi Kırılımı */}
          <div className="glass-panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold text-neon-white">
                Hava Kalitesi
              </span>
              <span className="rounded-lg border border-neon-cyan/40 bg-neon-cyan/15 px-2 py-0.5 font-mono text-xs text-neon-cyan">
                EAQI {bundle.airQuality.europeanAqi} · {bundle.airQuality.label}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="glass-card p-2.5">
                <span className="text-neon-white/55">PM2.5</span>
                <p className="font-mono font-semibold text-neon-white">
                  {bundle.airQuality.pm25} µg/m³
                </p>
              </div>
              <div className="glass-card p-2.5">
                <span className="text-neon-white/55">PM10</span>
                <p className="font-mono font-semibold text-neon-white">
                  {bundle.airQuality.pm10} µg/m³
                </p>
              </div>
              <div className="glass-card p-2.5">
                <span className="text-neon-white/55">Ozon (O₃)</span>
                <p className="font-mono font-semibold text-neon-white">
                  {bundle.airQuality.ozone} µg/m³
                </p>
              </div>
              <div className="glass-card p-2.5">
                <span className="text-neon-white/55">NO₂</span>
                <p className="font-mono font-semibold text-neon-white">
                  {bundle.airQuality.no2} µg/m³
                </p>
              </div>
            </div>
          </div>

          {/* Canlı CAPE Fırtına Riski Özeti -> /lab */}
          <div className="glass-panel p-5 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold text-neon-white">
                Konvektif CAPE Riski
              </span>
              <Activity className="h-4 w-4 text-neon-orange" />
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold text-neon-white">
                  {bundle.nativeConvective.cape ?? liveCapeSummary.cape}
                </span>
                <span className="font-mono text-xs text-neon-white/60">J/kg</span>
                <span
                  className={`ml-auto rounded-lg border px-2 py-0.5 text-xs font-medium ${liveCapeSummary.capeRisk.badgeClass}`}
                >
                  {liveCapeSummary.capeRisk.label}
                </span>
              </div>
              <p className="font-mono text-xs text-neon-white/60">
                LI: {liveCapeSummary.liftedIndex} · K: {liveCapeSummary.kIndex} · LCL:{" "}
                {liveCapeSummary.lclHeightM} m
              </p>
            </div>

            <Link
              href="/lab"
              className="inline-flex items-center justify-center rounded-xl border border-neon-orange/50 bg-neon-orange/15 px-3 py-2 text-xs font-semibold text-neon-orange hover:bg-neon-orange/25 transition-colors"
            >
              Skew-T & CAPE Laboratuvarını Aç →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
