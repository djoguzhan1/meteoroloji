"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  Cloud,
  Compass,
  Droplets,
  Eye,
  Gauge,
  Layers,
  Radio,
  RefreshCw,
  Share2,
  ShieldCheck,
  Star,
  Sunrise,
  Sunset,
  Wind
} from "lucide-react";
import { useWeather } from "@/context/WeatherContext";
import {
  classifyPressureTrend,
  classifyUvIndex,
  computeSynopticSignals,
  describePressureTrendDetail,
  formatLatLon,
  formatTemperature,
  formatWindSpeed,
  windDirectionToCompass,
  windKmhToBeaufort
} from "@/lib/weather";
import { SEVEN_MODEL_META } from "@/lib/metar-verify";
import { analyzeConvectiveProfile } from "@/lib/thermo-cape";
import { atmosUiSfx } from "@/lib/ui-sfx";
import type { WeatherBundle } from "@/lib/weather-types";
import TimeScrubber from "./TimeScrubber";
import HourlyCharts from "./HourlyCharts";
import AnimatedNumber from "./AnimatedNumber";
import AnimatedWeatherIcon from "./AnimatedWeatherIcon";

function WeatherGlyph({
  code,
  isNight = false,
  className = "h-5 w-5"
}: {
  code: number;
  isNight?: boolean;
  className?: string;
}) {
  return <AnimatedWeatherIcon code={code} isNight={isNight} className={className} />;
}

function WindCompassMini({ deg, beaufort = 2 }: { deg: number; beaufort?: number }) {
  const arcLen = Math.min(100, Math.max(12, (beaufort / 10) * 100));
  return (
    <svg viewBox="0 0 42 42" className="h-10 w-10 shrink-0" aria-hidden="true">
      <circle
        cx="21"
        cy="21"
        r="17.5"
        fill="none"
        stroke="rgba(255,255,255,0.10)"
        strokeWidth="1.4"
      />
      <circle
        cx="21"
        cy="21"
        r="17.5"
        fill="none"
        stroke="var(--atmos-accent)"
        strokeOpacity="0.45"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray={`${arcLen * 1.1} 120`}
        transform="rotate(-90 21 21)"
      />
      <text x="21" y="8.5" textAnchor="middle" fill="rgba(186,210,235,0.8)" fontSize="5.8" fontFamily="monospace">
        K
      </text>
      <text x="34.5" y="23" textAnchor="middle" fill="rgba(167,180,200,0.45)" fontSize="5.2" fontFamily="monospace">
        D
      </text>
      <text x="21" y="36.8" textAnchor="middle" fill="rgba(167,180,200,0.45)" fontSize="5.2" fontFamily="monospace">
        G
      </text>
      <text x="7.2" y="23" textAnchor="middle" fill="rgba(167,180,200,0.45)" fontSize="5.2" fontFamily="monospace">
        B
      </text>
      <g
        style={{
          transformOrigin: "21px 21px",
          transform: `rotate(${deg}deg)`,
          transition: "transform 680ms cubic-bezier(0.22, 1, 0.36, 1)"
        }}
      >
        <line
          x1="21"
          y1="28.5"
          x2="21"
          y2="11.5"
          stroke="var(--atmos-accent)"
          strokeWidth="1.9"
          strokeLinecap="round"
        />
        <polygon points="21,8.5 18,14.5 24,14.5" fill="var(--atmos-accent)" />
        <circle cx="21" cy="21" r="2.1" fill="#090d16" stroke="var(--atmos-accent)" strokeWidth="1.3" />
      </g>
    </svg>
  );
}

function BarometerDialMini({
  pressure,
  delta3h = 0
}: {
  pressure: number;
  delta3h?: number;
}) {
  const clamped = Math.max(980, Math.min(1040, pressure));
  const frac = (clamped - 980) / 60;
  const angleDeg = -115 + frac * 230;
  const trendColor =
    delta3h >= 0.8 ? "#10b981" : delta3h <= -0.8 ? "#f59e0b" : "var(--atmos-accent)";

  return (
    <svg viewBox="0 0 46 38" className="h-9 w-11 shrink-0" aria-hidden="true">
      <path
        d="M 7.5 30 A 16.5 16.5 0 1 1 38.5 30"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M 15.5 10.5 A 16.5 16.5 0 0 1 30.5 10.5"
        fill="none"
        stroke={trendColor}
        strokeOpacity="0.65"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <g
        style={{
          transformOrigin: "23px 22px",
          transform: `rotate(${angleDeg}deg)`,
          transition: "transform 680ms cubic-bezier(0.22, 1, 0.36, 1)"
        }}
      >
        <line
          x1="23"
          y1="22"
          x2="23"
          y2="8.5"
          stroke="#f3f6fb"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>
      <circle cx="23" cy="22" r="2.6" fill={trendColor} />
    </svg>
  );
}

function SunAndUvCard({
  sunrise,
  sunset,
  solarElevationDeg,
  timezone,
  uvMax
}: {
  sunrise: string;
  sunset: string;
  solarElevationDeg: number;
  timezone: string;
  uvMax: number;
}) {
  const srTime = sunrise ? sunrise.slice(11, 16) : "--:--";
  const ssTime = sunset ? sunset.slice(11, 16) : "--:--";

  const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  let nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(new Date());
    const hh = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const mm = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    if (Number.isFinite(hh) && Number.isFinite(mm)) {
      nowMin = (hh % 24) * 60 + mm;
    }
  } catch {
    // geçersiz timezone ise yerel saat yedek
  }

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
  const isUp = solarElevationDeg > 0;
  const arcTotal = 250;

  return (
    <div className="surface-panel p-5 flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-semibold text-ink-primary">
          Güneş & UV
        </span>
        <span className="font-mono text-xs text-ink-muted tabular">
          {solarElevationDeg > 0 ? `+${solarElevationDeg}°` : `${solarElevationDeg}°`} · {durH}s {durM}dk
        </span>
      </div>

      <svg viewBox="0 0 220 102" className="h-24 w-full overflow-visible" aria-hidden="true">
        <defs>
          <linearGradient id="solarArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#fcd34d" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <radialGradient id="sunCorona" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isUp ? "rgba(251,191,36,0.75)" : "rgba(147,197,253,0.5)"} />
            <stop offset="100%" stopColor="rgba(251,191,36,0)" />
          </radialGradient>
        </defs>
        <line
          x1="14"
          y1="90"
          x2="206"
          y2="90"
          stroke="rgba(255,255,255,0.14)"
          strokeDasharray="3 3"
        />
        <path
          d="M 26 90 A 84 72 0 0 1 194 90"
          fill="none"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        <path
          d="M 26 90 A 84 72 0 0 1 194 90"
          fill="none"
          stroke="url(#solarArcGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray={`${(progress * arcTotal).toFixed(1)} ${arcTotal}`}
        />
        <circle cx={cx} cy={cy} r="16" fill="url(#sunCorona)" />
        <circle
          cx={cx}
          cy={cy}
          r="5.8"
          fill={isUp ? "#fbbf24" : "#93c5fd"}
          stroke="#f8fbff"
          strokeWidth="1.6"
        />
      </svg>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs tabular">
          <span className="flex items-center gap-1.5 text-ink-secondary">
            <Sunrise className="h-3.5 w-3.5 text-signal-amber" />
            <span className="font-mono text-ink-primary">{srTime}</span>
          </span>
          <span className="font-mono text-[11px] text-ink-secondary">
            Maks UV <strong className="text-ink-primary">{uvMax.toFixed(1)}</strong> ({classifyUvIndex(uvMax)})
          </span>
          <span className="flex items-center gap-1.5 text-ink-secondary">
            <Sunset className="h-3.5 w-3.5 text-signal-amber" />
            <span className="font-mono text-ink-primary">{ssTime}</span>
          </span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500">
          <div
            className="h-full w-2 rounded-full bg-white shadow-[0_0_8px_#fff] transition-all duration-500"
            style={{ marginLeft: `${Math.min(94, (uvMax / 11) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function computeLiveSounding(b: WeatherBundle | null) {
  if (!b || b.sounding.length === 0) return null;
  const obs = b.current;
  return analyzeConvectiveProfile({
    surfaceTempC: obs.temperature,
    surfaceHumidity: obs.humidity,
    surfacePressureHpa: obs.pressure,
    levels: b.sounding
  });
}

function computeHeroDisplay(b: WeatherBundle | null, frameIndex: number) {
  if (!b) return null;
  const activeHour = frameIndex > 0 ? b.hourly[frameIndex] ?? null : null;
  if (activeHour) {
    const prevP = b.hourly[Math.max(0, frameIndex - 3)]?.pressure ?? activeHour.pressure;
    const activeDelta3h = Number((activeHour.pressure - prevP).toFixed(1));
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
      pressureDelta3h: activeDelta3h,
      pressureTrend: classifyPressureTrend(activeDelta3h),
      pressureTrendDetail: describePressureTrendDetail(activeDelta3h),
      visibilityKm: activeHour.visibilityKm,
      uvIndex: activeHour.uvIndex,
      condition: activeHour.condition,
      weatherCode: activeHour.weatherCode,
      isStorm: activeHour.isStorm,
      cape: activeHour.cape,
      temp850hPa: activeHour.temp850hPa,
      freezingLevelM: activeHour.freezingLevelM,
      precipConsensus: activeHour.precipConsensus,
      wetBulbC: activeHour.wetBulbC,
      stormScore: activeHour.stormScore ?? 0,
      solarElevationDeg: activeHour.solarElevationDeg,
      timeLabel: `${activeHour.dayLabel} · ${activeHour.hourLabel}`
    };
  }
  const obs = b.current;
  return {
    temperature: obs.temperature,
    apparentTemperature: obs.apparentTemperature,
    windSpeed: obs.windSpeed,
    windGusts: obs.windGusts,
    windDirection: obs.windDirection,
    cloudCover: obs.cloudCover,
    humidity: obs.humidity,
    dewPoint: obs.dewPoint,
    pressure: obs.pressure,
    pressureDelta3h: obs.pressureDelta3h,
    pressureTrend: obs.pressureTrend,
    pressureTrendDetail: obs.pressureTrendDetail,
    visibilityKm: obs.visibilityKm,
    uvIndex: obs.uvIndex,
    condition: obs.condition,
    weatherCode: obs.weatherCode,
    isStorm: obs.isStorm,
    cape: b.nativeConvective.cape,
    temp850hPa: obs.temp850hPa,
    freezingLevelM: b.nativeConvective.freezingLevelM,
    precipConsensus: obs.precipConsensus,
    wetBulbC: obs.wetBulbC,
    stormScore: b.storm?.score ?? obs.stormScore ?? 0,
    solarElevationDeg: obs.solarElevationDeg,
    timeLabel: `Gözlem · ${obs.time.slice(11, 16)}`
  };
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

  const [copiedLink, setCopiedLink] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  const liveSoundingSummary = useMemo(() => computeLiveSounding(bundle), [bundle]);
  const display = useMemo(() => computeHeroDisplay(bundle, frameIndex), [bundle, frameIndex]);

  // Tüm Hook'lar erken dönüşten ÖNCE çağrılır (React Rules of Hooks güvencesi)
  const synopticSignals = useMemo(() => {
    if (!bundle || !display) return [];
    return computeSynopticSignals({
      pressureDelta3h: display.pressureDelta3h,
      temp850hPa: display.temp850hPa,
      thickness5001000Dam: liveSoundingSummary?.thickness5001000Dam ?? null,
      windGustsKmh: display.windGusts,
      cape: display.cape ?? liveSoundingSummary?.mucape ?? liveSoundingSummary?.cape ?? null,
      isStorm: display.isStorm,
      stormScore: display.stormScore,
      scp: liveSoundingSummary?.scp,
      europeanAqi: bundle.airQuality.europeanAqi,
      dominantPollutant: bundle.airQuality.dominantPollutant,
      uvIndex: display.uvIndex,
      freezingLevelM: display.freezingLevelM,
      temperatureC: display.temperature
    });
  }, [bundle, display, liveSoundingSummary]);

  if (!bundle || !display) {
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

  const displayBeaufort = windKmhToBeaufort(display.windSpeed);
  const displayUvLabel = classifyUvIndex(display.uvIndex);
  const metarStation = bundle.hybrid?.verification?.station ?? null;
  const metarStations =
    bundle.hybrid?.verification?.stations ?? (metarStation ? [metarStation] : []);
  const calInfo = bundle.hybrid?.verification?.calibration;
  const isLiveMetar =
    bundle.hybrid?.verification?.mode === "live-metar-48h" ||
    bundle.hybrid?.verification?.mode === "live-metar-24h";
  const has15MinPrecip = Boolean(
    bundle.minutely15?.some((pt) => pt.precipitation >= 0.05)
  );
  const showStormOrNowcastPanel = Boolean(
    (bundle.storm && (bundle.storm.score >= 35 || bundle.storm.nextWindow)) ||
      has15MinPrecip
  );

  const handleShareStation = async () => {
    try {
      const qs = new URLSearchParams({
        city: activeLocation.name,
        lat: activeLocation.lat.toFixed(4),
        lon: activeLocation.lon.toFixed(4)
      });
      if (activeLocation.country) qs.set("country", activeLocation.country);
      const url = `${window.location.origin}/?${qs.toString()}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // clipboard restrictions
    }
  };

  const fav = isFavorite(activeLocation);
  const weekMin = Math.min(...bundle.daily.map((d) => d.tempMin));
  const weekMax = Math.max(...bundle.daily.map((d) => d.tempMax));
  const weekSpan = Math.max(1, weekMax - weekMin);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {error && (
        <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-200">
          {error}
        </div>
      )}

      {/* BÖLÜM 1: SADE, FERAH ANLIK GÖZLEM & ÖLÇÜMLER */}
      <section className="flex min-h-[calc(100vh-7.5rem)] flex-col justify-between gap-7 py-3">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end">
          {/* Sol: Konum, Odometre Sıcaklık ve Temel Özet */}
          <div className="atmos-enter-1 space-y-4">
            {/* Tek Satır Kompakt Durum & Aksiyon Şeridi */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
              <span className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-obsidian-900/65 px-2.5 py-1 font-mono text-ink-primary backdrop-blur-md tabular">
                <span className="relative flex h-2 w-2">
                  <span
                    className="atmos-beacon-ring absolute inline-flex h-full w-full rounded-full"
                    style={{ backgroundColor: "var(--atmos-accent)" }}
                  />
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: "var(--atmos-accent)" }}
                  />
                </span>
                <span>
                  {display.timeLabel}
                  {bundle.location.elevation !== undefined ? ` · ${bundle.location.elevation} m` : ""}
                </span>
              </span>
              {bundle.hybrid && (
                <a
                  href="#hibrit"
                  className="atmos-btn inline-flex items-center gap-1.5 rounded-lg border border-[rgba(var(--atmos-accent-rgb),0.36)] bg-[rgba(var(--atmos-accent-rgb),0.11)] px-2.5 py-1 font-mono text-[var(--atmos-accent)] backdrop-blur-md tabular"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>
                    {isLiveMetar
                      ? `ATMOS v3 · ${metarStation?.icaoId}${
                          metarStations.length > 1 ? `+${metarStations.length - 1}` : ""
                        } · %${bundle.hybrid.confidencePct}`
                      : `7-Model · %${bundle.hybrid.confidencePct}`}
                  </span>
                </a>
              )}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    atmosUiSfx.playChime(!fav);
                    if (fav) removeFavorite(activeLocation.id);
                    else addFavorite(activeLocation);
                  }}
                  title={fav ? "İstasyonlardan çıkar" : "İstasyonlara kaydet"}
                  aria-label={fav ? "İstasyonlardan çıkar" : "İstasyonlara kaydet"}
                  className={`atmos-btn flex h-7 w-7 items-center justify-center rounded-lg border backdrop-blur-md ${
                    fav
                      ? "border-signal-amber/45 bg-signal-amber/15 text-amber-200"
                      : "border-white/10 bg-obsidian-900/55 text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 transition-transform ${fav ? "fill-amber-300 text-amber-300 scale-110" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    atmosUiSfx.playNavTick();
                    void refreshWeather();
                  }}
                  title="Verileri güncelle"
                  aria-label="Verileri güncelle"
                  className="atmos-btn flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-obsidian-900/55 text-ink-secondary hover:text-ink-primary backdrop-blur-md"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    atmosUiSfx.playChime(true);
                    void handleShareStation();
                  }}
                  title={copiedLink ? "Bağlantı kopyalandı" : "İstasyon bağlantısını paylaş"}
                  aria-label="İstasyon bağlantısını paylaş"
                  className={`atmos-btn flex h-7 w-7 items-center justify-center rounded-lg border backdrop-blur-md ${
                    copiedLink
                      ? "border-signal-emerald/45 bg-signal-emerald/15 text-signal-emerald"
                      : "border-white/10 bg-obsidian-900/55 text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-baseline gap-2.5">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)]">
                  {activeLocation.name}
                  {activeLocation.country ? `, ${activeLocation.country}` : ""}
                </h1>
                <span className="font-mono text-xs text-ink-muted tabular">
                  {formatLatLon(activeLocation.lat, activeLocation.lon)}
                </span>
              </div>

              <div className="mt-2.5 flex flex-wrap items-baseline gap-5">
                <span
                  className="font-display text-7xl font-bold tracking-tight text-ink-primary tabular sm:text-8xl lg:text-[7.25rem] leading-none"
                  style={{
                    textShadow: "0 10px 42px rgba(var(--atmos-accent-rgb), 0.22)"
                  }}
                >
                  <AnimatedNumber value={formatTemperature(display.temperature, unit)} />
                </span>
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2.5 font-display text-xl font-medium text-ink-primary sm:text-2xl">
                    <WeatherGlyph
                      code={display.weatherCode}
                      isNight={display.solarElevationDeg < -3}
                      className="h-8 w-8"
                    />
                    <span>{display.condition}</span>
                  </p>
                  <p className="text-sm text-ink-secondary tabular">
                    Hissedilen{" "}
                    <strong className="font-mono font-medium text-ink-primary">
                      <AnimatedNumber value={formatTemperature(display.apparentTemperature, unit)} />
                    </strong>
                    {" · "}
                    <span className="font-mono text-ink-primary">
                      {formatTemperature(bundle.daily[0]?.tempMax ?? display.temperature, unit)} /{" "}
                      {formatTemperature(bundle.daily[0]?.tempMin ?? display.temperature, unit)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* 3 Temel Özet Çipi (Fırtına · Yağış · Üst Atmosfer) */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-ink-secondary tabular">
              {bundle.storm && (
                <a
                  href="#hibrit"
                  className="atmos-btn rounded-lg border border-white/10 bg-obsidian-900/60 px-3 py-1.5 backdrop-blur-md"
                >
                  Fırtına:{" "}
                  <strong style={{ color: bundle.storm.color }}>
                    <AnimatedNumber value={display.stormScore} />
                    /100 · {bundle.storm.label}
                  </strong>
                </a>
              )}
              {display.precipConsensus && display.precipConsensus.totalModels > 0 && (
                <span className="rounded-lg border border-white/10 bg-obsidian-900/60 px-3 py-1.5 backdrop-blur-md">
                  Yağış:{" "}
                  <strong
                    className={
                      display.precipConsensus.agreeingModels >= 3
                        ? "text-[var(--atmos-accent)]"
                        : "text-ink-primary"
                    }
                  >
                    {display.precipConsensus.agreeingModels}/{display.precipConsensus.totalModels} model
                  </strong>
                  {(display.precipConsensus.p90Mm ?? display.precipConsensus.maxMm) > 0 && (
                    <span className="text-ink-muted">
                      {" "}
                      (P90 {(display.precipConsensus.p90Mm ?? display.precipConsensus.maxMm).toFixed(1)} mm)
                    </span>
                  )}
                </span>
              )}
              <Link
                href="/lab"
                className="atmos-btn rounded-lg border border-white/10 bg-obsidian-900/60 px-3 py-1.5 text-ink-secondary hover:text-ink-primary backdrop-blur-md"
              >
                {display.temp850hPa !== null ? `850 hPa ${display.temp850hPa}°C` : "Sondaj"}
                {display.wetBulbC !== undefined ? ` · Tw ${display.wetBulbC}°C` : ""} →
              </Link>
            </div>

            {/* Sinoptik Eşik Uyarıları (yalnızca aktif eşik aşıldığında) */}
            {synopticSignals.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {synopticSignals.map((sig) => (
                  <div
                    key={sig.id}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs backdrop-blur-md tabular ${
                      sig.severity === "warning"
                        ? "border-signal-amber/40 bg-signal-amber/15 text-amber-100"
                        : sig.severity === "caution"
                          ? "border-signal-sky/35 bg-signal-sky/10 text-sky-100"
                          : "border-white/15 bg-obsidian-900/70 text-ink-primary"
                    }`}
                  >
                    <AlertTriangle
                      className={`h-3.5 w-3.5 shrink-0 ${
                        sig.severity === "warning"
                          ? "text-signal-amber"
                          : "text-signal-sky"
                      }`}
                    />
                    <span className="font-medium">{sig.title}</span>
                    <span className="font-mono text-[11px] opacity-80">· {sig.detail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sağ: 2x3 Anlık Ölçüm Kokpit Paneli */}
          <div className="atmos-enter-2 surface-panel p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
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
                  <span>Rüzgar · Bft {displayBeaufort.scale}</span>
                  <Wind className="h-3.5 w-3.5 text-[var(--atmos-accent)]" />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-mono text-lg font-semibold text-ink-primary">
                      <AnimatedNumber value={formatWindSpeed(display.windSpeed, unit)} />
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-ink-muted">
                      <Compass className="h-3 w-3 text-[var(--atmos-accent)]" />
                      {windDirectionToCompass(display.windDirection)} · Hamle{" "}
                      {formatWindSpeed(display.windGusts, unit)}
                    </p>
                  </div>
                  <WindCompassMini deg={display.windDirection} beaufort={displayBeaufort.scale} />
                </div>
              </div>

              <div className="surface-tile p-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Nem & Çiy</span>
                  <Droplets className="h-3.5 w-3.5 text-[var(--atmos-accent)]" />
                </div>
                <p className="font-mono text-lg font-semibold text-ink-primary">
                  <AnimatedNumber value={`%${display.humidity}`} />
                </p>
                <p className="text-xs text-ink-muted">
                  Çiy {formatTemperature(display.dewPoint, unit)}
                </p>
              </div>

              <div className="surface-tile p-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Basınç (MSL)</span>
                  <Gauge className="h-3.5 w-3.5 text-[var(--atmos-accent)]" />
                </div>
                <div className="flex items-center justify-between gap-1.5">
                  <div>
                    <p className="font-mono text-lg font-semibold text-ink-primary">
                      <AnimatedNumber value={`${Math.round(display.pressure)} hPa`} />
                    </p>
                    <p
                      className="flex items-center gap-1 text-[11px] text-ink-muted"
                      title={display.pressureTrendDetail}
                    >
                      {display.pressureTrend.includes("yükseliyor") ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-signal-emerald" />
                      ) : display.pressureTrend.includes("düşüyor") ? (
                        <ArrowDownRight className="h-3.5 w-3.5 text-signal-amber" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 text-ink-muted" />
                      )}
                      {display.pressureDelta3h > 0
                        ? `+${display.pressureDelta3h}`
                        : display.pressureDelta3h}{" "}
                      hPa/3s
                    </p>
                  </div>
                  <BarometerDialMini
                    pressure={display.pressure}
                    delta3h={display.pressureDelta3h}
                  />
                </div>
              </div>

              <div className="surface-tile p-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Bulut & UV</span>
                  <Cloud className="h-3.5 w-3.5 text-[var(--atmos-accent)]" />
                </div>
                <p className="font-mono text-lg font-semibold text-ink-primary">
                  <AnimatedNumber value={`%${display.cloudCover}`} />
                </p>
                <p className="text-xs text-ink-muted">
                  UV {display.uvIndex.toFixed(1)} · {displayUvLabel}
                </p>
              </div>

              <div className="surface-tile p-3 space-y-1">
                <div className="flex items-center justify-between text-xs text-ink-muted">
                  <span>Görüş</span>
                  <Eye className="h-3.5 w-3.5 text-[var(--atmos-accent)]" />
                </div>
                <p className="font-mono text-lg font-semibold text-ink-primary">
                  <AnimatedNumber value={`${display.visibilityKm} km`} />
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
                  <Activity className="h-3.5 w-3.5 text-[var(--atmos-accent)]" />
                </div>
                <p className="font-mono text-lg font-semibold text-ink-primary">
                  {bundle.airQuality.label}
                </p>
                <p className="text-[11px] text-ink-muted">
                  {bundle.airQuality.dominantPollutant} ({bundle.airQuality.dominantValueText})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 24/48 Saatlik Zaman Kaydırıcısı */}
        <div className="atmos-enter-3 space-y-2.5">
          <TimeScrubber
            hourly={bundle.hourly}
            frameIndex={frameIndex}
            onChange={setFrameIndex}
            unit={unit}
          />

          <div className="flex items-center justify-between text-xs text-slate-200/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
            <a
              href="#saatlik"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ArrowDown className="h-3.5 w-3.5 text-[var(--atmos-accent)]" />
              <span>Saatlik grafik, 7 günlük tahmin & doğrulama</span>
            </a>
            <div className="hidden sm:flex items-center gap-5">
              <Link href="/world" className="hover:text-white transition-colors">
                Canlı Radar & Küre →
              </Link>
              <Link href="/lab" className="hover:text-white transition-colors">
                7-Model & Skew-T →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AKTİF FIRTINA VEYA YAKIN 15 DK YAĞIŞ VARSA ÖNE ÇIKAN PANEL */}
      {showStormOrNowcastPanel && (
        <section className="surface-panel p-5 sm:p-6 space-y-4 border-signal-amber/25">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-signal-amber">
                Şiddetli Hava & 15 Dakikalık Nowcast
              </p>
              <h2 className="mt-0.5 font-display text-lg font-semibold text-ink-primary">
                {bundle.storm?.label ?? "Aktif Yağış İzleme"}
                {bundle.storm && (
                  <span className="ml-2 font-mono text-base" style={{ color: bundle.storm.color }}>
                    {bundle.storm.score}/100
                  </span>
                )}
              </h2>
            </div>

            {bundle.storm?.nextWindow && (
              <div className="rounded-xl border border-signal-amber/30 bg-signal-amber/10 px-3.5 py-1.5 font-mono text-xs text-amber-100 tabular">
                Pencere: <strong>{bundle.storm.nextWindow.startLabel}</strong> →{" "}
                {bundle.storm.nextWindow.endLabel} (Zirve {bundle.storm.nextWindow.peakLabel})
              </div>
            )}
          </div>

          {bundle.storm && (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 font-mono text-xs tabular">
              {[
                { label: "Konvektif", val: bundle.storm.components.convective, sub: `Şimşek %${bundle.storm.lightningProbPct}` },
                { label: "Rüzgar", val: bundle.storm.components.wind, sub: `Hamle ${bundle.storm.expectedPeakGustP50}–${bundle.storm.expectedPeakGustP90} km/s` },
                { label: "Sağanak", val: bundle.storm.components.rainfall, sub: `Ani Sel: ${bundle.storm.flashFloodRisk}` },
                { label: "Cephe / SCP", val: bundle.storm.components.synoptic, sub: `Dolu: ${bundle.storm.hailRisk}` }
              ].map((c) => (
                <div key={c.label} className="surface-tile p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-muted">{c.label}</span>
                    <strong className="text-ink-primary">{c.val}/100</strong>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(4, c.val)}%`,
                        backgroundColor:
                          c.val >= 65 ? "#ef4444" : c.val >= 40 ? "#f97316" : c.val >= 20 ? "#eab308" : "#10b981"
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-ink-secondary">{c.sub}</p>
                </div>
              ))}
            </div>
          )}

          {has15MinPrecip && bundle.minutely15 && (
            <div className="rounded-xl border border-white/[0.07] bg-obsidian-950/60 p-3.5 space-y-2">
              <div className="flex items-center justify-between font-mono text-[11px] text-ink-muted">
                <span>15 Dakikalık Yağış Nowcast (6 Saat · mm/15dk)</span>
                <span className="text-signal-sky">Canlı Akış</span>
              </div>
              <div className="flex items-end gap-1 h-14">
                {bundle.minutely15.slice(0, 24).map((pt) => {
                  const hPct = Math.min(100, Math.max(8, (pt.precipitation / 3.5) * 100));
                  return (
                    <div
                      key={pt.time}
                      title={`${pt.label} · ${pt.precipitation.toFixed(2)} mm · ${pt.temperature}°C`}
                      className="flex-1 flex flex-col items-center justify-end h-full"
                    >
                      <div
                        className={`w-full rounded-t ${
                          pt.precipitation >= 1.5
                            ? "bg-signal-amber"
                            : pt.precipitation >= 0.1
                              ? "bg-signal-sky"
                              : "bg-white/10"
                        }`}
                        style={{ height: `${pt.precipitation > 0 ? hPct : 6}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between font-mono text-[10px] text-ink-muted tabular">
                <span>{bundle.minutely15[0]?.label}</span>
                <span>{bundle.minutely15[7]?.label}</span>
                <span>{bundle.minutely15[15]?.label}</span>
                <span>{bundle.minutely15[23]?.label}</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* BÖLÜM 2: SENKRONİZE SAATLİK GRAFİK */}
      <section id="saatlik" className="scroll-mt-20">
        <HourlyCharts
          hourly={bundle.hourly}
          unit={unit}
          selectedIndex={Math.min(frameIndex, 23)}
          onSelectIndex={setFrameIndex}
        />
      </section>

      {/* BÖLÜM 3: 7 GÜNLÜK KALİBRE TAHMİN + GÜNEŞ/UV & HAVA KALİTESİ */}
      <section
        id="haftalik"
        className="scroll-mt-20 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]"
      >
        <div className="surface-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink-primary">
              7 Günlük Tahmin
            </h2>
            <span className="font-mono text-[11px] text-ink-muted">
              7-Model + 122-Üye Kalibre
            </span>
          </div>

          <div className="divide-y divide-white/[0.07] tabular">
            {bundle.daily.map((d) => {
              const leftPct = ((d.tempMin - weekMin) / weekSpan) * 100;
              const widthPct = Math.max(8, ((d.tempMax - d.tempMin) / weekSpan) * 100);
              const rangeTitle =
                d.tempMaxP10 !== undefined && d.tempMaxP90 !== undefined
                  ? `122-üye P10–P90 Maks: ${d.tempMaxP10}°–${d.tempMaxP90}°`
                  : undefined;
              return (
                <div
                  key={d.date}
                  title={rangeTitle}
                  className="-mx-2 grid grid-cols-[64px_30px_46px_1fr_72px] items-center gap-3 rounded-xl px-2 py-3 text-sm transition-colors hover:bg-white/[0.04]"
                >
                  <span className="font-medium text-ink-primary">{d.dayName}</span>
                  <WeatherGlyph code={d.weatherCode} className="h-5 w-5" />
                  <span className="font-mono text-xs text-[var(--atmos-accent)]">
                    %{d.precipProbabilityMax}
                  </span>

                  <div className="flex items-center gap-2.5">
                    <span className="w-8 text-right font-mono text-xs text-ink-muted">
                      {formatTemperature(d.tempMin, unit)}
                    </span>
                    <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-signal-sky via-cyan-300 to-signal-amber shadow-[0_0_10px_rgba(56,189,248,0.4)] transition-all duration-500"
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

        <div className="flex flex-col gap-5">
          <SunAndUvCard
            sunrise={bundle.current.sunrise}
            sunset={bundle.current.sunset}
            solarElevationDeg={bundle.current.solarElevationDeg}
            timezone={bundle.timezone}
            uvMax={bundle.daily[0]?.uvIndexMax ?? 0}
          />

          <div className="surface-panel flex-1 p-5 flex flex-col justify-between space-y-3 tabular">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold text-ink-primary">
                Hava Kalitesi (CAMS)
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
        </div>
      </section>

      {/* BÖLÜM 4: ATMOS-CORE v3.0 — SADELEŞTİRİLMİŞ CANLI DOĞRULAMA & 7-MODEL SKOR KARTI */}
      {bundle.hybrid && (
        <section id="hibrit" className="scroll-mt-20 surface-panel p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
            <div>
              <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-signal-sky">
                <Layers className="h-3.5 w-3.5" />
                {bundle.hybrid.engineVersion ?? "ATMOS-Core v3.0"} · 7-Model
                {bundle.hybrid.ensembleMembers ? ` + ${bundle.hybrid.ensembleMembers} EPS` : ""}
              </p>
              <h2 className="mt-0.5 font-display text-base font-semibold text-ink-primary">
                Canlı METAR Kalibrasyonu & Model Doğruluk Tablosu
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-ink-secondary tabular">
                Uzlaşı <strong className="text-signal-emerald">%{bundle.hybrid.confidencePct}</strong> · ΔT{" "}
                {bundle.hybrid.tempSpreadC}°C
              </span>
              <Link
                href="/lab"
                className="rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-white/[0.1] transition-colors"
              >
                7-Model 72s →
              </Link>
            </div>
          </div>

          {bundle.hybrid.atmosV4 && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-signal-sky/25 bg-signal-sky/[0.06] px-4 py-2.5 font-mono text-xs tabular">
              <div className="flex flex-wrap items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-signal-sky shrink-0" />
                <span className="font-semibold text-signal-sky">
                  {bundle.hybrid.atmosV4.activeRegimeLabel}
                </span>
                <span className="text-ink-secondary">
                  · dProg/dt Kararlılık %{bundle.hybrid.atmosV4.stabilityPct} ({Math.round(bundle.hybrid.atmosV4.meanRunLockCount)} koşu kilitli)
                </span>
                {bundle.hybrid.atmosV4.ltbrIsolated && (
                  <span className="rounded bg-signal-emerald/15 px-1.5 py-0.5 text-[10px] text-signal-emerald">
                    {bundle.hybrid.atmosV4.bursaTier1Online} Bursa MGM Sensörü Aktif · LTBR İzole
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-ink-muted">
                {bundle.hybrid.atmosV4.nextRainOnsetMin !== null && (
                  <span className="text-signal-amber font-semibold">
                    Radar Yağış Başlangıcı: +{bundle.hybrid.atmosV4.nextRainOnsetMin} dk
                  </span>
                )}
                {bundle.hybrid.atmosV4.radarSummaryCode === "VIRGA_ALOFT" && (
                  <span className="text-amber-200">Alt Seviye Virga Bastırıldı</span>
                )}
                {bundle.hybrid.atmosV4.blockedFlipFlops > 0 && (
                  <span>Engellenen Sapma: {bundle.hybrid.atmosV4.blockedFlipFlops}s</span>
                )}
              </div>
            </div>
          )}

          {/* Kompakt Fiziksel İstasyon & Kalman Özet Şeridi */}
          {metarStation && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-signal-emerald/30 bg-signal-emerald/[0.06] px-4 py-3 font-mono text-xs tabular shadow-[inset_0_1px_0_rgba(16,185,129,0.22)]">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="atmos-beacon-ring absolute inline-flex h-full w-full rounded-full bg-signal-emerald" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-signal-emerald" />
                </span>
                <Radio className="h-3.5 w-3.5 text-signal-emerald shrink-0" />
                <span className="font-semibold text-signal-emerald">
                  {metarStations.map((s) => s.icaoId).join(" + ")}
                </span>
                <span className="text-ink-primary">
                  {metarStation.tempC !== null ? formatTemperature(metarStation.tempC, unit) : "—"} ·{" "}
                  {metarStation.qnhHpa !== null ? `${metarStation.qnhHpa} hPa` : "—"} ·{" "}
                  {metarStation.windSpeedKmh !== null
                    ? formatWindSpeed(metarStation.windSpeedKmh, unit)
                    : "—"}
                </span>
                <span className="text-ink-muted">
                  ({metarStation.distanceKm} km · {metarStation.ageMinutes} dk önce)
                </span>
              </div>

              {calInfo && (
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-secondary">
                  <span>
                    Kalman ΔT{" "}
                    <strong className="text-signal-emerald">
                      {calInfo.nowcastTempDeltaC > 0 ? "+" : ""}
                      {calInfo.nowcastTempDeltaC}°C
                    </strong>
                  </span>
                  <span>· K %{Math.round(calInfo.nowcastKalmanGain * 100)}</span>
                  <span>· Γ {calInfo.envLapseRateCPerKm}°/km</span>
                </div>
              )}
            </div>
          )}

          {/* Temiz 6-Sütunlu 7-Model Skor Tablosu */}
          <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-obsidian-950/55">
            <table className="w-full min-w-[640px] text-left font-mono text-xs tabular">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] text-ink-muted">
                  <th className="px-3.5 py-2.5 font-medium">Model</th>
                  <th className="px-2.5 py-2.5 font-medium">Anlık T</th>
                  <th className="px-2.5 py-2.5 font-medium">48s Bias</th>
                  <th className="px-2.5 py-2.5 font-medium">UBRMSE</th>
                  <th className="px-2.5 py-2.5 font-medium">Yağış BS</th>
                  <th className="px-3.5 py-2.5 font-medium text-right">
                    Ağırlık (T / P / W / Y)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {bundle.hybrid.verification.rows.map((row) => {
                  const meta = SEVEN_MODEL_META[row.modelKey];
                  const tNow = bundle.hybrid.currentBreakdown.temperature[row.modelKey] ?? null;
                  const winT = bundle.hybrid.verification.winners.temperature === row.modelKey;
                  const winY = bundle.hybrid.verification.winners.precipitation === row.modelKey;

                  return (
                    <tr key={row.modelKey} className="hover:bg-white/[0.025]">
                      <td className="px-3.5 py-2">
                        <span className="flex items-center gap-2 font-semibold text-ink-primary">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: meta.color }}
                          />
                          <span>{row.label}</span>
                          <span className="hidden sm:inline text-[10px] font-normal text-ink-muted">
                            {row.resolution}
                          </span>
                        </span>
                      </td>
                      <td className="px-2.5 py-2 text-ink-primary">
                        {tNow !== null ? formatTemperature(tNow, unit) : "—"}
                      </td>
                      <td className="px-2.5 py-2 text-ink-secondary">
                        {row.tempBiasC !== null && row.tempBiasC !== undefined
                          ? `${row.tempBiasC > 0 ? "+" : ""}${row.tempBiasC}°`
                          : "—"}
                      </td>
                      <td
                        className={`px-2.5 py-2 ${
                          winT ? "font-semibold text-signal-emerald" : "text-ink-secondary"
                        }`}
                      >
                        {row.tempUbRmseC !== null && row.tempUbRmseC !== undefined
                          ? `${row.tempUbRmseC}°C`
                          : row.tempRmseC !== null
                            ? `${row.tempRmseC}°C`
                            : "—"}
                        {winT && <span className="ml-1 text-[10px]">#1</span>}
                      </td>
                      <td
                        className={`px-2.5 py-2 ${
                          winY ? "font-semibold text-signal-emerald" : "text-ink-secondary"
                        }`}
                      >
                        {row.precipBrier !== null && row.precipBrier !== undefined
                          ? row.precipBrier.toFixed(3)
                          : "—"}
                        {winY && <span className="ml-1 text-[10px]">#1</span>}
                      </td>
                      <td className="px-3.5 py-2 text-right text-ink-secondary">
                        <div className="inline-flex flex-col items-end gap-1">
                          <span>
                            %{row.weightsPct.temperature} / %{row.weightsPct.pressure} / %
                            {row.weightsPct.wind} / %{row.weightsPct.precipitation}
                          </span>
                          <span className="h-1 w-24 overflow-hidden rounded-full bg-white/[0.08]">
                            <span
                              className="block h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(100, Math.max(8, row.weightsPct.temperature * 2.2))}%`,
                                backgroundColor: meta.color
                              }}
                            />
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* İsteğe Bağlı Açılır Bilimsel Metodoloji Detayı (varsayılan kapalı -> ferah sayfa!) */}
          <div>
            <button
              type="button"
              onClick={() => setShowMethodology((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink-primary transition-colors"
            >
              <span>Bilimsel metodoloji ve standart detayları ({bundle.hybrid.attributions.length})</span>
              {showMethodology ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {showMethodology && (
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 text-xs">
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
                    <p className="font-mono text-[10px] text-signal-emerald/90">
                      {item.standardRef}
                    </p>
                    <p className="text-[11px] text-ink-muted leading-relaxed">
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
