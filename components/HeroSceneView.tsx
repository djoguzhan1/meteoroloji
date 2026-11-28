"use client";

import { memo, MouseEvent as ReactMouseEvent, useMemo, useState } from "react";
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
  MapPin,
  Mountain,
  Radio,
  RefreshCw,
  Share2,
  ShieldCheck,
  Snowflake,
  Star,
  Sunrise,
  Sunset,
  Thermometer,
  Waves,
  Wind,
  Zap
} from "lucide-react";
import {
  useWeatherData,
  useWeatherRetryCountdown,
  useWeatherScrub,
  useWeatherStatus
} from "@/context/WeatherContext";
import { formatClockTr, formatFreshnessAgeTr } from "@/lib/forecast-resilience";
import { buildLocationHref } from "@/lib/location-url";
import { CORE_MODEL_META } from "@/lib/model-registry";
import {
  resolveActiveTemporalView,
  type TemporalDayContext
} from "@/lib/temporal-view";
import { atmosUiSfx } from "@/lib/ui-sfx";
import {
  classifyUvIndex,
  computeSynopticSignals,
  DEFAULT_LOCATION,
  formatDistance,
  formatElevation,
  formatLapseRate,
  formatLatLon,
  formatPrecip,
  formatPressure,
  formatPressureDelta,
  formatSnowDepth,
  formatTempDelta,
  formatTemperature,
  formatWindSpeed,
  windDirectionToCompass
} from "@/lib/weather-client";
import type {
  GeoLocation,
  PrecipPhase,
  UnitSystem,
  WeatherBundle
} from "@/lib/weather-types";
import AnimatedNumber from "./AnimatedNumber";
import AnimatedWeatherIcon from "./AnimatedWeatherIcon";
import ExtendedDailyForecastPanel from "./ExtendedDailyForecastPanel";
import HourlyForecastStrip from "./HourlyForecastStrip";
import RadarNowcastRibbon from "./RadarNowcastRibbon";
import SnowAndLightningObservatory from "./SnowAndLightningObservatory";
import TimeScrubber from "./TimeScrubber";

export function localizeMetricProse(text: string, unit: UnitSystem): string {
  if (unit !== "imperial" || !text) return text;
  let out = text;

  // 1) Lapse rate (°C/km -> °F/kft)
  out = out.replace(/(-?\d+(?:\.\d+)?)\s*°C\/km\b/g, (_m, v: string) =>
    formatLapseRate(Number(v), "imperial")
  );

  // 2) Temperature deltas (±X°C and ΔT X°C)
  out = out.replace(/±\s*(\d+(?:\.\d+)?)\s*°C/g, (_m, v: string) => {
    const fDelta = (Number(v) * 1.8).toFixed(1).replace(/\.0$/, "");
    return `±${fDelta}°F`;
  });
  out = out.replace(/(ΔT\s*)([+-]?\d+(?:\.\d+)?)\s*°C/g, (_m, prefix: string, v: string) => {
    const signed = v.startsWith("+") || v.startsWith("-");
    return `${prefix}${formatTempDelta(Number(v), "imperial", {
      decimals: 1,
      signed,
      showUnit: true
    })}`;
  });

  // 3) Absolute temperature ranges & standalone °C
  out = out.replace(
    /(-?\d+(?:\.\d+)?)\s*(\.\.|[–-])\s*(-?\d+(?:\.\d+)?)\s*°C/g,
    (_m, a: string, sep: string, b: string) =>
      `${Math.round(Number(a) * 1.8 + 32)}${sep}${Math.round(Number(b) * 1.8 + 32)}°F`
  );
  out = out.replace(/([+-]?\d+(?:\.\d+)?)\s*°C/g, (_m, v: string) => {
    return `${Math.round(Number(v) * 1.8 + 32)}°F`;
  });

  // 4) Wind speed (km/s or km/h -> mph)
  out = out.replace(/(\d+(?:\.\d+)?)\s*km\/(?:s|h)\b/g, (_m, v: string) =>
    formatWindSpeed(Number(v), "imperial")
  );

  // 5) Distance ranges & standalone km (e.g. 9 km / 9km -> 5.6 mi, 2–7 km -> 1.2–4.3 mi)
  out = out.replace(
    /(\d+(?:\.\d+)?)\s*([–-])\s*(\d+(?:\.\d+)?)\s*km\b/g,
    (_m, a: string, sep: string, b: string) => {
      const aMi = formatDistance(Number(a), "imperial").replace(/\s*mi$/, "");
      const bMi = formatDistance(Number(b), "imperial").replace(/\s*mi$/, "");
      return `${aMi}${sep}${bMi} mi`;
    }
  );
  out = out.replace(/(\d+(?:\.\d+)?)\s*km\b/g, (_m, v: string) =>
    formatDistance(Number(v), "imperial")
  );

  // 6) Precipitation & snow depth (mm -> in, cm -> in)
  out = out.replace(/(\d+(?:\.\d+)?)\s*mm\/sa\b/g, (_m, v: string) =>
    formatPrecip(Number(v), "imperial", { per: "hour" })
  );
  out = out.replace(/(\d+(?:\.\d+)?)\s*mm\b/g, (_m, v: string) =>
    formatPrecip(Number(v), "imperial")
  );
  out = out.replace(/(\d+(?:\.\d+)?)\s*cm\/sa\b/g, (_m, v: string) =>
    formatSnowDepth(Number(v), "imperial", { per: "hour" })
  );
  out = out.replace(/(\d+(?:\.\d+)?)\s*cm\b/g, (_m, v: string) =>
    formatSnowDepth(Number(v), "imperial")
  );

  // 7) Elevation / meter ranges & standalone m (e.g. 0–550m -> 0–1804 ft, 2m -> 6.5 ft)
  out = out.replace(
    /\b(\d+(?:\.\d+)?)\s*([–-])\s*(\d+(?:\.\d+)?)\s*m\b/g,
    (_m, a: string, sep: string, b: string) =>
      `${Math.round(Number(a) * 3.28084)}${sep}${Math.round(Number(b) * 3.28084)} ft`
  );
  out = out.replace(/\b(\d+(?:\.\d+)?)\s*m\b/g, (_m, v: string) => {
    const mVal = Number(v);
    if (mVal === 2) return "6.5 ft";
    if (mVal > 0 && mVal < 10) {
      return `${(mVal * 3.28084).toFixed(1).replace(/\.0$/, "")} ft`;
    }
    return `${Math.round(mVal * 3.28084)} ft`;
  });

  return out;
}

type ProvinceSummaryPayload = NonNullable<WeatherBundle["provinceSummary"]>;
type SubLocationRole = ProvinceSummaryPayload["curatedSubLocations"][number]["role"];
type ResolvedHeroCalibrationTier = "BURSA" | "TIER_A" | "TIER_B" | "GLOBAL";

const SUB_LOCATION_ROLE_LABEL_TR: Record<SubLocationRole, string> = {
  coast: "Kıyı",
  plain: "Ova",
  foothill: "Yamaç",
  summit: "Zirve"
};

interface HeroProvinceIdentity {
  isBursaProvince: boolean;
  isTrNonBursaProvince: boolean;
  provinceCode: string | null;
  provinceName: string;
  calibrationTier: ResolvedHeroCalibrationTier;
}

function isTrPlateProvinceCode(code: unknown): code is string {
  return typeof code === "string" && /^TR-(?:0[1-9]|[1-7][0-9]|8[01])$/.test(code);
}

function resolveHeroProvinceIdentity(
  bundle: WeatherBundle,
  activeLocation: GeoLocation
): HeroProvinceIdentity {
  const provinceSummary = bundle.provinceSummary ?? null;
  const engineMeta = bundle.hybrid?.engineMeta;
  const rawCode =
    provinceSummary?.provinceCode ??
    engineMeta?.provinceCode ??
    bundle.location.provinceCode ??
    activeLocation.provinceCode;

  const hasTrCode = isTrPlateProvinceCode(rawCode);
  const isExplicitGlobal =
    rawCode === "GLOBAL" || engineMeta?.calibrationTier === "GLOBAL";

  const isBursaProvince = hasTrCode
    ? rawCode === "TR-16"
    : isExplicitGlobal
      ? false
      : provinceSummary?.calibrationTier === "TIER_0_BURSA" ||
        engineMeta?.calibrationTier === "BURSA_FROZEN_V5" ||
        Boolean(bundle.location.id?.startsWith("bursa-")) ||
        Boolean(bundle.location.admin1?.includes("WMO 17116")) ||
        ((bundle.location.countryCode?.toUpperCase() === "TR" ||
          bundle.location.country === "Türkiye") &&
          bundle.location.name.trim().toLocaleLowerCase("tr-TR") === "bursa");

  const isTrNonBursaProvince =
    !isBursaProvince &&
    !isExplicitGlobal &&
    (hasTrCode ||
      Boolean(provinceSummary) ||
      engineMeta?.calibrationTier === "TIER_A_EMPIRICAL_WMO" ||
      engineMeta?.calibrationTier === "TIER_B_DONOR_ALARO" ||
      bundle.location.countryCode?.toUpperCase() === "TR" ||
      bundle.location.country === "Türkiye");

  let calibrationTier: ResolvedHeroCalibrationTier;
  if (isBursaProvince) {
    calibrationTier = "BURSA";
  } else if (isExplicitGlobal || !isTrNonBursaProvince) {
    calibrationTier = "GLOBAL";
  } else if (
    engineMeta?.calibrationTier === "TIER_A_EMPIRICAL_WMO" ||
    provinceSummary?.calibrationTier === "TIER_A_WMO"
  ) {
    calibrationTier = "TIER_A";
  } else if (
    engineMeta?.calibrationTier === "TIER_B_DONOR_ALARO" ||
    provinceSummary?.calibrationTier === "TIER_B_DONOR_KALMAN"
  ) {
    calibrationTier = "TIER_B";
  } else {
    const vMode = bundle.hybrid?.verification?.mode;
    calibrationTier =
      vMode === "live-mgm-mesh" ||
      vMode === "live-station-48h" ||
      vMode === "live-station-24h"
        ? "TIER_A"
        : "TIER_B";
  }

  const provinceCode = isBursaProvince
    ? "TR-16"
    : hasTrCode
      ? rawCode
      : null;

  const provinceName = isBursaProvince
    ? "Bursa"
    : (provinceSummary?.provinceName ??
      engineMeta?.provinceName ??
      (bundle.location.name || activeLocation.name));

  return {
    isBursaProvince,
    isTrNonBursaProvince,
    provinceCode,
    provinceName,
    calibrationTier
  };
}

interface WaterBodyBadgeModel {
  shortLabelTr: string;
  tooltipTr: string;
  tempC: number;
  isLake: boolean;
}

function resolveWaterBodyBadge(
  bundle: WeatherBundle,
  identity: HeroProvinceIdentity,
  unit: UnitSystem
): WaterBodyBadgeModel | null {
  const engineMeta = bundle.hybrid?.engineMeta;
  const activeBodies = bundle.provinceSummary?.activeWaterBodies ?? [];

  let rawLabel: string | null = null;
  let tempC: number | null = null;
  let bodyKind: ProvinceSummaryPayload["activeWaterBodies"][number]["kind"] | undefined;

  if (
    typeof engineMeta?.seaOrLakeTempC === "number" &&
    Number.isFinite(engineMeta.seaOrLakeTempC) &&
    engineMeta.waterBodyLabelTr?.trim()
  ) {
    tempC = engineMeta.seaOrLakeTempC;
    rawLabel = engineMeta.waterBodyLabelTr.trim();
    const matched = activeBodies.find(
      (wb) =>
        wb.labelTr === rawLabel ||
        rawLabel?.toLocaleLowerCase("tr-TR").includes(wb.labelTr.slice(0, 12).toLocaleLowerCase("tr-TR"))
    );
    bodyKind = (matched ?? activeBodies[0])?.kind;
  } else if (activeBodies.length > 0) {
    const liveWb = activeBodies.find(
      (wb) => typeof wb.liveTempC === "number" && Number.isFinite(wb.liveTempC)
    );
    if (liveWb && typeof liveWb.liveTempC === "number") {
      tempC = liveWb.liveTempC;
      rawLabel = liveWb.labelTr;
      bodyKind = liveWb.kind;
    }
  } else if (
    identity.isBursaProvince &&
    typeof engineMeta?.marmaraSstC === "number" &&
    Number.isFinite(engineMeta.marmaraSstC)
  ) {
    tempC = engineMeta.marmaraSstC;
    rawLabel = "Marmara Denizi";
    bodyKind = "inland_sea";
  }

  if (tempC === null || !rawLabel) return null;

  const baseName =
    rawLabel
      .replace(/\s*\([^)]*\)/g, "")
      .split(/\s+—\s+/)[0]
      .trim() || rawLabel;

  const isLake =
    bodyKind === "alkaline_lake" ||
    bodyKind === "fresh_lake" ||
    /göl|baraj|rezervuar/i.test(baseName);

  let compactLabel = baseName;
  if (!isLake && !/\bSST\b/i.test(compactLabel)) {
    compactLabel = compactLabel.replace(/\s+(?:Denizi|Suları|Açık Deniz)$/i, "").trim();
    compactLabel = `${compactLabel} SST`;
  }

  return {
    shortLabelTr: localizeMetricProse(compactLabel, unit),
    tooltipTr: localizeMetricProse(rawLabel, unit),
    tempC,
    isLake
  };
}

interface QuickSubLocationOption {
  id: string;
  displayLabel: string;
  rawName: string;
  role: SubLocationRole;
  lat: number;
  lon: number;
  elevationM: number;
  isCanonicalCenter?: boolean;
}

function buildQuickSubLocationOptions(
  provinceSummary: ProvinceSummaryPayload | null,
  unit: UnitSystem
): QuickSubLocationOption[] {
  if (!provinceSummary || !provinceSummary.curatedSubLocations?.length) {
    return [];
  }

  const curated = provinceSummary.curatedSubLocations;
  const center = provinceSummary.canonicalCenter;
  const hasCenterAlready = curated.some(
    (item) =>
      Math.abs(item.lat - center.lat) < 0.025 &&
      Math.abs(item.lon - center.lon) < 0.025 &&
      Math.abs(item.elevationM - center.elevationM) < 160
  );

  const items: QuickSubLocationOption[] = [];
  if (!hasCenterAlready) {
    const hasMarineCoast =
      center.elevationM <= 45 &&
      provinceSummary.activeWaterBodies.some(
        (wb) => wb.kind === "open_sea" || wb.kind === "inland_sea"
      );
    items.push({
      id: center.id,
      displayLabel: `${provinceSummary.provinceName} Merkez`,
      rawName: center.stationLabel,
      role: hasMarineCoast ? "coast" : "plain",
      lat: center.lat,
      lon: center.lon,
      elevationM: center.elevationM,
      isCanonicalCenter: true
    });
  }

  for (const sub of curated) {
    const cleanName =
      sub.name.replace(/\s*\([^)]*\)/g, "").trim() || sub.name.trim();
    items.push({
      id: sub.id,
      displayLabel: localizeMetricProse(cleanName, unit),
      rawName: localizeMetricProse(sub.name, unit),
      role: sub.role,
      lat: sub.lat,
      lon: sub.lon,
      elevationM: sub.elevationM
    });
  }

  return items;
}

function WeatherGlyph({
  code,
  isNight = false,
  precipPhase,
  intensityMm = 0,
  phaseSeed = 0,
  className = "h-5 w-5"
}: {
  code: number;
  isNight?: boolean;
  precipPhase?: PrecipPhase;
  intensityMm?: number;
  phaseSeed?: number;
  className?: string;
}) {
  return (
    <AnimatedWeatherIcon
      code={code}
      isNight={isNight}
      precipPhase={precipPhase}
      intensityMm={intensityMm}
      phaseSeed={phaseSeed}
      className={className}
    />
  );
}

function WindCompassMini({ deg, beaufort = 2 }: { deg: number; beaufort?: number }) {
  const arcLen = Math.min(100, Math.max(12, (beaufort / 10) * 100));
  return (
    <svg viewBox="0 0 42 42" className="h-9 w-9 sm:h-10 sm:w-10 shrink-0" aria-hidden="true">
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
    <svg viewBox="0 0 46 38" className="h-8 w-9 sm:h-9 sm:w-11 shrink-0" aria-hidden="true">
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

const SunAndUvCard = memo(function SunAndUvCard({
  dayContext,
  isForecastLocked,
  timeLabel
}: {
  dayContext: TemporalDayContext;
  isForecastLocked: boolean;
  timeLabel: string;
}) {
  const progress = Math.max(0, Math.min(1, dayContext.solarArcProgress));
  const angle = Math.PI * (1 - progress);
  const cx = 110 + Math.cos(angle) * 84;
  const cy = 90 - Math.sin(angle) * 72;
  const isUp = !dayContext.isNight;
  const arcTotal = 250;
  const elevRounded = Math.round(dayContext.solarElevationDeg * 10) / 10;

  return (
    <div className="surface-panel p-5 flex flex-col justify-between gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-semibold text-ink-primary">
            Güneş & UV
          </span>
          <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-ink-secondary tabular">
            {isForecastLocked ? timeLabel : dayContext.dayName}
          </span>
        </div>
        <span className="font-mono text-xs text-ink-muted tabular">
          {elevRounded > 0 ? `+${elevRounded}°` : `${elevRounded}°`} ·{" "}
          {dayContext.dayDurationLabelTr}
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
        <div className="flex items-center justify-between gap-2 text-xs tabular">
          <span className="flex items-center gap-1.5 text-ink-secondary">
            <Sunrise className="h-3.5 w-3.5 text-signal-amber" />
            <span className="font-mono text-ink-primary">{dayContext.sunriseClock}</span>
          </span>
          <span className="font-mono text-[11px] text-ink-secondary text-center">
            UV <strong className="text-ink-primary">{dayContext.uvCurrent.toFixed(1)}</strong> · Maks{" "}
            <strong className="text-ink-primary">{dayContext.uvDayMax.toFixed(1)}</strong> (
            {classifyUvIndex(dayContext.uvDayMax)})
          </span>
          <span className="flex items-center gap-1.5 text-ink-secondary">
            <Sunset className="h-3.5 w-3.5 text-signal-amber" />
            <span className="font-mono text-ink-primary">{dayContext.sunsetClock}</span>
          </span>
        </div>
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500">
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 w-0.5 bg-white/55 transition-all duration-500"
            style={{ left: `${Math.min(97, (dayContext.uvDayMax / 11) * 100)}%` }}
          />
          <div
            className="h-full w-2 rounded-full bg-white shadow-[0_0_8px_#fff] transition-all duration-500"
            style={{ marginLeft: `${Math.min(94, (dayContext.uvCurrent / 11) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
});

function EmptyHeroRetryStatus({ isOffline }: { isOffline: boolean }) {
  const retryCountdownSec = useWeatherRetryCountdown();
  return (
    <p className="font-mono text-xs text-ink-muted tabular">
      {isOffline
        ? "İnternet bağlantısı geldiği an otomatik olarak yüklenecek."
        : retryCountdownSec !== null && retryCountdownSec > 0
          ? `${retryCountdownSec} sn içinde otomatik olarak yeniden yoklanacak.`
          : "Arka planda canlı akış bekleniyor."}
    </p>
  );
}

export default function HeroSceneView() {
  const {
    bundle,
    activeLocation,
    setActiveLocation,
    isFavorite,
    addFavorite,
    removeFavorite,
    unit
  } = useWeatherData();
  const {
    frameIndex,
    setFrameIndex,
    hourlyHorizon,
    setHourlyHorizon,
    focusedDate,
    setFocusedDate,
    temporalView: scrubTemporalView
  } = useWeatherScrub();
  const {
    loading,
    isRevalidating,
    error,
    isStale,
    isDegraded,
    isOffline,
    refreshWeather
  } = useWeatherStatus();

  const [copiedLink, setCopiedLink] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);

  const temporalView = useMemo(
    () => (bundle ? (scrubTemporalView ?? resolveActiveTemporalView(bundle, frameIndex)) : null),
    [bundle, scrubTemporalView, frameIndex]
  );

  // Tüm Hook'lar erken dönüşten ÖNCE çağrılır (React Rules of Hooks güvencesi)
  const synopticSignals = useMemo(() => {
    if (!bundle || !temporalView) return [];
    const { telemetry, soundingSummary } = temporalView;
    return computeSynopticSignals({
      pressureDelta3h: telemetry.pressureDelta3h,
      temp850hPa: telemetry.temp850hPa,
      thickness5001000Dam: soundingSummary?.thickness5001000Dam ?? null,
      windGustsKmh: telemetry.windGusts,
      cape: telemetry.cape ?? soundingSummary?.mucape ?? soundingSummary?.cape ?? null,
      isStorm: telemetry.isStorm,
      stormScore: telemetry.stormScore,
      scp: soundingSummary?.scp,
      europeanAqi: temporalView.frameIndex === 0 ? bundle.airQuality.europeanAqi : null,
      dominantPollutant:
        temporalView.frameIndex === 0 ? bundle.airQuality.dominantPollutant : undefined,
      uvIndex: telemetry.uvIndex,
      freezingLevelM: telemetry.freezingLevelM,
      temperatureC: telemetry.temperature,
      unit
    });
  }, [bundle, temporalView, unit]);

  const provinceIdentity = useMemo(
    () => (bundle ? resolveHeroProvinceIdentity(bundle, activeLocation) : null),
    [bundle, activeLocation]
  );

  const waterBodyBadge = useMemo(
    () =>
      bundle && provinceIdentity
        ? resolveWaterBodyBadge(bundle, provinceIdentity, unit)
        : null,
    [bundle, provinceIdentity, unit]
  );

  const quickSubLocations = useMemo(
    () => buildQuickSubLocationOptions(bundle?.provinceSummary ?? null, unit),
    [bundle?.provinceSummary, unit]
  );

  if (!bundle || !temporalView || !provinceIdentity) {
    if (loading && !error) {
      return (
        <div className="mx-auto max-w-xl px-4 py-24 text-center space-y-4">
          <div className="surface-panel p-8 space-y-3">
            <RefreshCw className="mx-auto h-6 w-6 animate-spin text-[var(--atmos-accent)]" />
            <h1 className="font-display text-xl font-semibold text-ink-primary">
              {activeLocation.name} Verileri Hazırlanıyor
            </h1>
            <p className="text-sm text-ink-secondary">
              Çoklu model ve atmosferik kalibrasyon akışı yükleniyor...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center space-y-4">
        <div className="surface-panel p-8 space-y-4">
          <h1 className="font-display text-xl font-semibold text-ink-primary">
            {activeLocation.name} İçin Kayıtlı Tahmin Bulunamadı
          </h1>
          <p className="text-sm text-ink-secondary">
            {error ?? "Bu konum için daha önce kaydedilmiş bir önbellek yok ve canlı model servisine şu an ulaşılamıyor."}
          </p>
          <EmptyHeroRetryStatus isOffline={isOffline} />
          <button
            type="button"
            onClick={() => void refreshWeather()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-ink-primary hover:bg-white/15"
          >
            <RefreshCw className={`h-4 w-4 ${loading || isRevalidating ? "animate-spin" : ""}`} />
            Şimdi Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  const { telemetry, dayContext, stormChip } = temporalView;
  const provinceSummary = bundle.provinceSummary ?? null;
  const engineMeta = bundle.hybrid?.engineMeta;
  const metarStation = bundle.hybrid?.verification?.station ?? null;
  const metarStations =
    bundle.hybrid?.verification?.stations ?? (metarStation ? [metarStation] : []);
  const calInfo = bundle.hybrid?.verification?.calibration;
  const verificationMode = bundle.hybrid?.verification?.mode ?? "wmo-prior";
  const isMgmMesh = verificationMode === "live-mgm-mesh";
  const isLiveStation =
    verificationMode === "live-station-48h" || verificationMode === "live-station-24h";

  const { isBursaProvince, isTrNonBursaProvince, provinceCode, provinceName, calibrationTier } =
    provinceIdentity;

  const activeMicroclimateTags = (engineMeta?.activeMicroclimateTags ?? []).filter(
    (tag): tag is string =>
      typeof tag === "string" &&
      tag.trim().length > 0 &&
      (isBursaProvince || !/bursa|uludağ|marmara|17116|ltbr/i.test(tag))
  );

  const nonBursaMgmSensorCount =
    engineMeta?.tier1OnlineCount ?? provinceSummary?.mgmMeshStationCount ?? 0;

  const heroShieldBadgeText = (() => {
    if (!bundle.hybrid) return "";
    const conf = bundle.hybrid.confidencePct;
    if (isBursaProvince) {
      return isMgmMesh
        ? `ATMOS v5 · MGM ${metarStation?.stationName ?? "Bursa"}${
            metarStations.length > 1 ? ` +${metarStations.length - 1}` : ""
          } · %${conf}`
        : isLiveStation
          ? `ATMOS v5 · ${metarStation?.icaoId}${
              metarStations.length > 1 ? `+${metarStations.length - 1}` : ""
            } · %${conf}`
          : `8-Model · %${conf}`;
    }

    if (isMgmMesh) {
      const stationLabel =
        metarStation?.stationName ??
        engineMeta?.mgmDistrictMatched ??
        provinceName;
      return `ATMOS v5 · MGM ${stationLabel}${
        metarStations.length > 1 ? ` +${metarStations.length - 1}` : ""
      } · %${conf}`;
    }

    if (isLiveStation && metarStation?.icaoId) {
      return `ATMOS v5 · ${metarStation.icaoId}${
        metarStations.length > 1 ? `+${metarStations.length - 1}` : ""
      } · %${conf}`;
    }

    if (calibrationTier === "TIER_A") {
      return `ATMOS v5 · WMO L1-EMOS · %${conf}`;
    }
    if (calibrationTier === "TIER_B") {
      return `ATMOS v5 · ALARO + Kalman · %${conf}`;
    }
    return `8-Model · %${conf}`;
  })();

  const referenceStationBadgeText = (() => {
    if (isBursaProvince) {
      if (!bundle.location.admin1 && !engineMeta?.mgmDistrictMatched) return null;
      return bundle.location.admin1?.includes("WMO 17116")
        ? "Bursa Merkez (Osmangazi · WMO 17116)"
        : engineMeta?.mgmDistrictMatched
          ? `MGM ${engineMeta.mgmDistrictMatched}`
          : (bundle.location.admin1 ?? null);
    }

    const codePrefix = provinceCode ? `${provinceCode} · ` : "";
    if (engineMeta?.mgmDistrictMatched) {
      return `${codePrefix}MGM ${engineMeta.mgmDistrictMatched}`;
    }
    if (provinceSummary?.canonicalCenter?.stationLabel) {
      const cleanAdmin = bundle.location.admin1?.trim();
      if (
        cleanAdmin &&
        cleanAdmin.toLocaleLowerCase("tr-TR") !==
          provinceSummary.provinceName.toLocaleLowerCase("tr-TR") &&
        !/bursa|17116/i.test(cleanAdmin)
      ) {
        return `${codePrefix}${localizeMetricProse(cleanAdmin, unit)}`;
      }
      return `${codePrefix}${localizeMetricProse(provinceSummary.canonicalCenter.stationLabel, unit)}`;
    }
    if (bundle.location.admin1 && !/bursa|17116/i.test(bundle.location.admin1)) {
      return `${codePrefix}${localizeMetricProse(bundle.location.admin1, unit)}`;
    }
    return null;
  })();

  const hibritHeadingText = (() => {
    if (calibrationTier === "BURSA") {
      return isMgmMesh
        ? "MGM 19-İlçe Canlı Kalibrasyonu & 8-Model Doğruluk Tablosu"
        : isLiveStation
          ? "Canlı İstasyon Kalibrasyonu & 8-Model Doğruluk Tablosu"
          : "WMO Öncül Ağırlıklandırma & 8-Model Uzlaşı Tablosu";
    }
    if (calibrationTier === "TIER_A") {
      return "2-Yıllık WMO SYNOP Ampirik L1-EMOS + Canlı MGM Ağı";
    }
    if (calibrationTier === "TIER_B") {
      return localizeMetricProse(
        "Fiziksel Simpleks + MGM ALARO 4.5 km + Canlı Kalman-MOS",
        unit
      );
    }
    return "8-Merkez Küresel NWP/AI Ensemble + METAR Kalman";
  })();

  const handleSelectSubLocation = (sub: QuickSubLocationOption) => {
    atmosUiSfx.playNavTick();
    if (
      isBursaProvince &&
      Math.abs(sub.lat - DEFAULT_LOCATION.lat) < 0.02 &&
      Math.abs(sub.lon - DEFAULT_LOCATION.lon) < 0.02
    ) {
      setActiveLocation(DEFAULT_LOCATION);
      return;
    }

    const nextLoc: GeoLocation = {
      id: sub.id,
      name: sub.isCanonicalCenter ? provinceName : sub.displayLabel,
      provinceCode: provinceSummary?.provinceCode ?? (provinceCode as GeoLocation["provinceCode"]) ?? undefined,
      admin1: sub.isCanonicalCenter
        ? (provinceSummary?.canonicalCenter.stationLabel ?? provinceName)
        : `${provinceName} · ${SUB_LOCATION_ROLE_LABEL_TR[sub.role]}`,
      country: "Türkiye",
      countryCode: "TR",
      lat: sub.lat,
      lon: sub.lon,
      elevation: sub.elevationM,
      timezone: bundle.timezone || "Europe/Istanbul"
    };
    setActiveLocation(nextLoc);
  };

  const hasActiveSnow =
    telemetry.airSnowCm > 0 ||
    telemetry.groundSnowCm > 0 ||
    telemetry.precipPhase === "snow" ||
    telemetry.airSnowProbPct >= 20;

  const isObservatoryPromoted = Boolean(
    bundle.snowAndLightning &&
      ((bundle.storm?.score ?? 0) >= 35 ||
        (bundle.snowAndLightning.hasAnySnow15d &&
          (bundle.daily[0]?.airSnowSumCm ?? 0) >= 0.5) ||
        (bundle.snowAndLightning.peak48hLightningProbPct ?? 0) >= 25 ||
        bundle.snowAndLightning.lightningRadar.safetyLevel === "shelter_now" ||
        bundle.snowAndLightning.lightningRadar.safetyLevel === "caution_30_30")
  );

  const handleAnchorJump = (
    e: ReactMouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    const el = typeof document !== "undefined" ? document.getElementById(targetId) : null;
    if (el) {
      e.preventDefault();
      atmosUiSfx.playNavTick();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (typeof window !== "undefined" && window.history?.replaceState) {
        window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}#${targetId}`);
        if (typeof HashChangeEvent === "function") {
          window.dispatchEvent(new HashChangeEvent("hashchange"));
        }
      }
    }
  };

  const handleJumpToDayHour = (idx: number) => {
    setFrameIndex(idx);
    const ymd = bundle.hourly[idx]?.time.slice(0, 10);
    if (ymd) setFocusedDate(ymd);
  };

  const handleShareStation = async () => {
    try {
      const shareHref = buildLocationHref("/", bundle.location);
      const url = `${window.location.origin}${shareHref}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // clipboard restrictions
    }
  };

  const fav = isFavorite(activeLocation);

  const isArchiveMode = isStale || isOffline;
  const statusPillBorder = isArchiveMode
    ? "border-signal-amber/40 bg-[#171107]/80 text-amber-100"
    : isDegraded
      ? "border-signal-sky/35 bg-[#081322]/80 text-sky-100"
      : "border-white/15 bg-[#080d18]/88 text-ink-primary";
  const statusBeaconColor = isArchiveMode
    ? "#f59e0b"
    : isDegraded
      ? "#38bdf8"
      : "var(--atmos-accent)";
  const statusTimeText = isArchiveMode
    ? temporalView.frameIndex === 0
      ? `Arşiv · ${formatClockTr(bundle.fetchedAt, bundle.timezone)} (${formatFreshnessAgeTr(bundle.fetchedAt)})`
      : `${telemetry.timeLabel} · Arşiv`
    : isDegraded
      ? `${telemetry.timeLabel} · Kısmi Akış`
      : telemetry.timeLabel;

  const p90OrMaxPrecip =
    telemetry.precipConsensus.p90Mm ?? telemetry.precipConsensus.maxMm;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
      {/* KATMAN 1: HERO ÜST KOKPİT & 3D GÖKYÜZÜ ZAMAN KAYDIRICISI */}
      <section className="flex min-h-[calc(100svh-11.25rem-env(safe-area-inset-bottom,0px))] sm:min-h-[calc(100svh-9rem-env(safe-area-inset-bottom,0px))] lg:min-h-[calc(100svh-5.75rem)] flex-col justify-between gap-6 py-2">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-end">
          {/* Sol: Konum, Odometre Sıcaklık ve Tekil Durum Çipleri */}
          <div className="atmos-enter-1 space-y-4">
            {/* Tek Satır Kompakt Durum & Aksiyon Şeridi */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
              <span className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 font-mono tabular ${statusPillBorder}`}>
                <span className="relative flex h-2 w-2">
                  {!isArchiveMode && (
                    <span
                      className="atmos-beacon-ring absolute inline-flex h-full w-full rounded-full"
                      style={{ backgroundColor: statusBeaconColor }}
                    />
                  )}
                  <span
                    className="relative inline-flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: statusBeaconColor }}
                  />
                </span>
                <span>
                  {statusTimeText}
                  {bundle.location.elevation !== undefined
                    ? ` · ${formatElevation(bundle.location.elevation, unit)}`
                    : ""}
                </span>
              </span>
              {bundle.hybrid && (
                <a
                  href="#hibrit"
                  onClick={(e) => handleAnchorJump(e, "hibrit")}
                  className="atmos-btn inline-flex items-center gap-1.5 rounded-lg border border-[rgba(var(--atmos-accent-rgb),0.36)] bg-[rgba(var(--atmos-accent-rgb),0.11)] px-2.5 py-1 font-mono text-[var(--atmos-accent)] tabular"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{heroShieldBadgeText}</span>
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
                  className={`atmos-btn flex h-7 w-7 items-center justify-center rounded-lg border ${
                    fav
                      ? "border-signal-amber/45 bg-signal-amber/15 text-amber-200"
                      : "border-white/10 bg-[#080d18]/86 text-ink-secondary hover:text-ink-primary"
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
                  className="atmos-btn flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-[#080d18]/86 text-ink-secondary hover:text-ink-primary"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading || isRevalidating ? "animate-spin" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    atmosUiSfx.playChime(true);
                    void handleShareStation();
                  }}
                  title={copiedLink ? "Bağlantı kopyalandı" : "İstasyon bağlantısını paylaş"}
                  aria-label="İstasyon bağlantısını paylaş"
                  className={`atmos-btn flex h-7 w-7 items-center justify-center rounded-lg border ${
                    copiedLink
                      ? "border-signal-emerald/45 bg-signal-emerald/15 text-signal-emerald"
                      : "border-white/10 bg-[#080d18]/86 text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-baseline gap-2.5">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)]">
                  {bundle.location.name || activeLocation.name}
                  {(bundle.location.country || activeLocation.country)
                    ? `, ${bundle.location.country || activeLocation.country}`
                    : ""}
                </h1>
                <span className="font-mono text-xs text-ink-muted tabular">
                  {formatLatLon(bundle.location.lat, bundle.location.lon)}
                  {bundle.location.elevation !== undefined
                    ? ` · ${formatElevation(bundle.location.elevation, unit)}`
                    : ""}
                </span>
                {referenceStationBadgeText && (
                  <span className="rounded-md border border-sky-400/25 bg-[#081120]/85 px-2 py-0.5 font-mono text-[11px] text-sky-200 tabular">
                    Baz: {referenceStationBadgeText}
                  </span>
                )}
              </div>

              <div className="mt-2.5 flex flex-wrap items-baseline gap-5">
                <span
                  className="font-display text-6xl font-bold tracking-tight text-ink-primary tabular sm:text-7xl lg:text-[6.5rem] xl:text-[7.25rem] leading-none"
                  style={{
                    textShadow: "0 10px 42px rgba(var(--atmos-accent-rgb), 0.22)"
                  }}
                >
                  <AnimatedNumber value={formatTemperature(telemetry.temperature, unit)} />
                </span>
                <div className="space-y-1.5">
                  <p className="flex items-center gap-2.5 font-display text-xl font-medium text-ink-primary sm:text-2xl">
                    <WeatherGlyph
                      code={telemetry.weatherCode}
                      isNight={dayContext.isNight}
                      precipPhase={telemetry.precipPhase}
                      intensityMm={telemetry.precipitation}
                      phaseSeed={temporalView.frameIndex}
                      className="h-8 w-8"
                    />
                    <span>{telemetry.condition}</span>
                  </p>
                  <p className="text-sm text-ink-secondary tabular">
                    Hissedilen{" "}
                    <strong className="font-mono font-medium text-ink-primary">
                      <AnimatedNumber value={formatTemperature(telemetry.apparentTemperature, unit)} />
                    </strong>
                    {" · "}
                    <span className="font-mono text-ink-primary">
                      {dayContext.dayName} · Min {formatTemperature(dayContext.tempMin, unit)} / Maks{" "}
                      {formatTemperature(dayContext.tempMax, unit)}
                    </span>
                  </p>
                </div>
              </div>

              {/* İl İçi İrtifa / Mikroiklim Hızlı Geçiş Çipleri (Kıyı / Ova / Yamaç / Zirve-Kayak) */}
              {quickSubLocations.length > 0 && (
                <div
                  role="group"
                  aria-label={`${provinceName} irtifa ve mikroiklim alt konumları`}
                  className="mt-3 flex flex-wrap items-center gap-1.5"
                >
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-muted mr-0.5">
                    <MapPin className="h-3 w-3 text-[var(--atmos-accent)]" />
                    <span>İrtifa Hattı:</span>
                  </span>
                  {quickSubLocations.map((sub) => {
                    const isSelected =
                      activeLocation.id === sub.id ||
                      bundle.location.id === sub.id ||
                      (Math.abs(bundle.location.lat - sub.lat) < 0.018 &&
                        Math.abs(bundle.location.lon - sub.lon) < 0.018 &&
                        Math.abs((bundle.location.elevation ?? sub.elevationM) - sub.elevationM) <
                          180);

                    return (
                      <button
                        key={sub.id}
                        type="button"
                        aria-pressed={isSelected}
                        title={sub.rawName}
                        onClick={() => handleSelectSubLocation(sub)}
                        className={`atmos-btn inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-[11px] tabular transition-colors ${
                          isSelected
                            ? "border-[rgba(var(--atmos-accent-rgb),0.55)] bg-[rgba(var(--atmos-accent-rgb),0.16)] text-ink-primary font-semibold"
                            : "border-white/10 bg-[#080d18]/82 text-ink-secondary hover:border-white/25 hover:text-ink-primary"
                        }`}
                      >
                        {sub.role === "summit" ? (
                          <Mountain className="h-3 w-3 shrink-0 text-sky-300" />
                        ) : sub.role === "coast" ? (
                          <Waves className="h-3 w-3 shrink-0 text-cyan-300" />
                        ) : null}
                        <span className="truncate max-w-[168px] sm:max-w-[220px]">
                          {sub.displayLabel}
                        </span>
                        <span className="text-[10px] text-ink-muted">
                          {SUB_LOCATION_ROLE_LABEL_TR[sub.role]} ·{" "}
                          {formatElevation(sub.elevationM, unit)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tekil Durum Çipleri Satırı (Sıfır Tekrar & Doğru Çapalar) */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-ink-secondary tabular">
              <a
                href="#kar-simsek"
                onClick={(e) => handleAnchorJump(e, "kar-simsek")}
                className="atmos-btn inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#080d18]/88 px-3 py-1.5 hover:border-white/25"
              >
                <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: stormChip.color }} />
                <span>
                  Konvektif & Fırtına:{" "}
                  <strong style={{ color: stormChip.color }}>
                    <AnimatedNumber value={stormChip.score} />
                    /100 · {stormChip.label}
                  </strong>
                  {" · "}
                  <span className="text-ink-secondary">
                    Şimşek %{telemetry.lightningProbPct}
                    {telemetry.isThundersnow ? " · Thundersnow" : ""}
                  </span>
                </span>
              </a>

              {telemetry.precipConsensus && telemetry.precipConsensus.totalModels > 0 && (
                <span className="rounded-lg border border-white/10 bg-[#080d18]/86 px-3 py-1.5">
                  Yağış:{" "}
                  <strong
                    className={
                      telemetry.precipConsensus.agreeingModels >= 3
                        ? "text-[var(--atmos-accent)]"
                        : "text-ink-primary"
                    }
                  >
                    {telemetry.precipConsensus.agreeingModels}/{telemetry.precipConsensus.totalModels} model
                  </strong>
                  {p90OrMaxPrecip > 0 && (
                    <span className="text-ink-muted">
                      {" "}
                      (P90 {formatPrecip(p90OrMaxPrecip, unit)})
                    </span>
                  )}
                </span>
              )}

              {(hasActiveSnow ||
                (telemetry.showSnowLine && telemetry.snowLineElevationM !== null)) && (
                <a
                  href="#kar-simsek"
                  onClick={(e) => handleAnchorJump(e, "kar-simsek")}
                  className="atmos-btn inline-flex items-center gap-1.5 rounded-lg border border-sky-400/25 bg-[#080d18]/88 px-3 py-1.5 text-sky-100 hover:border-sky-300/45"
                >
                  <Snowflake className="h-3.5 w-3.5 text-sky-300" />
                  {hasActiveSnow ? (
                    <span>
                      Saatlik:{" "}
                      <strong>
                        Hava {formatSnowDepth(telemetry.airSnowCm, unit, { per: "hour" })}
                      </strong>{" "}
                      ·{" "}
                      <strong>
                        Zemin {formatSnowDepth(telemetry.groundSnowCm, unit, { per: "hour" })}
                      </strong>
                      {telemetry.showSnowLine && telemetry.snowLineElevationM !== null
                        ? ` · Kar Sınırı: ${formatElevation(telemetry.snowLineElevationM, unit)}`
                        : ""}
                    </span>
                  ) : (
                    <span>
                      Kar Sınırı:{" "}
                      <strong>{formatElevation(telemetry.snowLineElevationM, unit)}</strong>
                    </span>
                  )}
                </a>
              )}

              {waterBodyBadge && (
                <span
                  title={waterBodyBadge.tooltipTr}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/25 bg-[#08121f]/88 px-3 py-1.5 text-cyan-100"
                >
                  <Waves className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
                  <span>
                    {waterBodyBadge.shortLabelTr}:{" "}
                    <strong className="text-white">
                      {formatTemperature(waterBodyBadge.tempC, unit, {
                        decimals: 1,
                        showUnit: true
                      })}
                    </strong>
                  </span>
                </span>
              )}

              <a
                href="#hava-kalitesi"
                onClick={(e) => handleAnchorJump(e, "hava-kalitesi")}
                className="atmos-btn inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#080d18]/86 px-3 py-1.5 text-ink-secondary hover:text-ink-primary"
              >
                <Activity className="h-3.5 w-3.5 text-[var(--atmos-accent)]" />
                <span>
                  EAQI {bundle.airQuality.europeanAqi} · {bundle.airQuality.label}
                  {temporalView.frameIndex > 0 && (
                    <span className="ml-1 text-[10px] text-ink-muted">(Şimdi)</span>
                  )}
                </span>
              </a>

              <Link
                href={buildLocationHref("/lab", activeLocation)}
                className="atmos-btn rounded-lg border border-white/10 bg-[#080d18]/86 px-3 py-1.5 text-ink-secondary hover:text-ink-primary"
              >
                {telemetry.temp850hPa !== null
                  ? `850 hPa ${formatTemperature(telemetry.temp850hPa, unit, {
                      decimals: 1,
                      showUnit: true
                    })}`
                  : "Sondaj"}
                {` · Tw ${formatTemperature(telemetry.wetBulbC, unit, {
                  decimals: 1,
                  showUnit: true
                })}`}{" "}
                →
              </Link>
            </div>

            {activeMicroclimateTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] tabular">
                {activeMicroclimateTags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-sky-400/20 bg-sky-500/[0.08] px-2 py-0.5 text-sky-200"
                  >
                    {localizeMetricProse(tag, unit)}
                  </span>
                ))}
              </div>
            )}

            {/* Sinoptik Eşik Uyarıları (yalnızca aktif eşik aşıldığında) */}
            {synopticSignals.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {synopticSignals.map((sig) => (
                  <div
                    key={sig.id}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs tabular ${
                      sig.severity === "warning"
                        ? "border-signal-amber/40 bg-signal-amber/15 text-amber-100"
                        : sig.severity === "caution"
                          ? "border-signal-sky/35 bg-signal-sky/10 text-sky-100"
                          : "border-white/15 bg-[#080d18]/90 text-ink-primary"
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

          {/* Sağ: 2x3 Zaman-Duyarlı Telemetri Kokpit Paneli */}
          <div className="atmos-enter-2 surface-panel p-3.5 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-2.5">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-secondary">
                {temporalView.cockpitTitleTr}
              </h2>
              <span className="font-mono text-xs text-ink-secondary tabular">
                {temporalView.frameIndex === 0 ? "Canlı Gözlem + 8-Model" : telemetry.timeLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 sm:grid-cols-3 tabular">
              <div className="surface-tile min-w-0 p-2.5 sm:p-3 space-y-1">
                <div className="flex items-center justify-between gap-1 text-xs text-ink-muted">
                  <span className="truncate">Rüzgar · Bft {telemetry.beaufort.scale}</span>
                  <Wind className="h-3.5 w-3.5 shrink-0 text-[var(--atmos-accent)]" />
                </div>
                <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-base sm:text-lg font-semibold tracking-tight sm:tracking-normal text-ink-primary whitespace-nowrap truncate">
                      <AnimatedNumber value={formatWindSpeed(telemetry.windSpeed, unit)} />
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-ink-muted">
                      <Compass className="h-3 w-3 shrink-0 text-[var(--atmos-accent)]" />
                      <span className="truncate">
                        {windDirectionToCompass(telemetry.windDirection)} · Hamle{" "}
                        {formatWindSpeed(telemetry.windGusts, unit)}
                      </span>
                    </p>
                  </div>
                  <WindCompassMini
                    deg={telemetry.windDirection}
                    beaufort={telemetry.beaufort.scale}
                  />
                </div>
              </div>

              <div className="surface-tile min-w-0 p-2.5 sm:p-3 space-y-1">
                <div className="flex items-center justify-between gap-1 text-xs text-ink-muted">
                  <span className="truncate">Nem & Çiy</span>
                  <Droplets className="h-3.5 w-3.5 shrink-0 text-[var(--atmos-accent)]" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-base sm:text-lg font-semibold tracking-tight sm:tracking-normal text-ink-primary">
                    <AnimatedNumber value={`%${telemetry.humidity}`} />
                  </p>
                  <p className="text-xs text-ink-muted truncate">
                    Çiy {formatTemperature(telemetry.dewPoint, unit)}
                  </p>
                </div>
              </div>

              <div className="surface-tile min-w-0 p-2.5 sm:p-3 space-y-1">
                <div className="flex items-center justify-between gap-1 text-xs text-ink-muted">
                  <span className="truncate">Basınç (MSL)</span>
                  <Gauge className="h-3.5 w-3.5 shrink-0 text-[var(--atmos-accent)]" />
                </div>
                <div className="flex items-center justify-between gap-1">
                  <div className="min-w-0">
                    <p className="font-mono text-base sm:text-lg font-semibold tracking-tight sm:tracking-normal text-ink-primary whitespace-nowrap truncate">
                      <AnimatedNumber value={formatPressure(telemetry.pressure, unit)} />
                    </p>
                    <p
                      className="flex items-center gap-1 text-[11px] text-ink-muted"
                      title={telemetry.pressureTrendDetail}
                    >
                      {telemetry.pressureTrend.includes("yükseliyor") ? (
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-signal-emerald" />
                      ) : telemetry.pressureTrend.includes("düşüyor") ? (
                        <ArrowDownRight className="h-3.5 w-3.5 shrink-0 text-signal-amber" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                      )}
                      <span className="truncate">{formatPressureDelta(telemetry.pressureDelta3h, unit)}</span>
                    </p>
                  </div>
                  <BarometerDialMini
                    pressure={telemetry.pressure}
                    delta3h={telemetry.pressureDelta3h}
                  />
                </div>
              </div>

              <div className="surface-tile min-w-0 p-2.5 sm:p-3 space-y-1">
                <div className="flex items-center justify-between gap-1 text-xs text-ink-muted">
                  <span className="truncate">Bulut & UV</span>
                  <Cloud className="h-3.5 w-3.5 shrink-0 text-[var(--atmos-accent)]" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-base sm:text-lg font-semibold tracking-tight sm:tracking-normal text-ink-primary">
                    <AnimatedNumber value={`%${telemetry.cloudCover}`} />
                  </p>
                  <p className="text-xs text-ink-muted truncate">
                    UV {telemetry.uvIndex.toFixed(1)} · {telemetry.uvLabel}
                  </p>
                </div>
              </div>

              <div className="surface-tile min-w-0 p-2.5 sm:p-3 space-y-1">
                <div className="flex items-center justify-between gap-1 text-xs text-ink-muted">
                  <span className="truncate">Görüş</span>
                  <Eye className="h-3.5 w-3.5 shrink-0 text-[var(--atmos-accent)]" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-base sm:text-lg font-semibold tracking-tight sm:tracking-normal text-ink-primary truncate">
                    <AnimatedNumber value={formatDistance(telemetry.visibilityKm, unit)} />
                  </p>
                  <p className="text-xs text-ink-muted truncate">
                    {telemetry.visibilityKm >= 10
                      ? "Açık"
                      : telemetry.visibilityKm >= 4
                        ? "Puslu"
                        : "Kısıtlı"}
                  </p>
                </div>
              </div>

              <div className="surface-tile min-w-0 p-2.5 sm:p-3 space-y-1">
                <div className="flex items-center justify-between gap-1 text-xs text-ink-muted">
                  <span className="truncate">Islak Hazne & Donma</span>
                  <Thermometer className="h-3.5 w-3.5 shrink-0 text-[var(--atmos-accent)]" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-base sm:text-lg font-semibold tracking-tight sm:tracking-normal text-ink-primary truncate">
                    Tw:{" "}
                    <AnimatedNumber
                      value={formatTemperature(telemetry.wetBulbC, unit, {
                        decimals: 1,
                        showUnit: true
                      })}
                    />
                  </p>
                  <p className="text-[11px] text-ink-muted truncate">
                    {unit === "imperial" ? "32°F Sınırı" : "0°C Sınırı"}:{" "}
                    {formatElevation(telemetry.freezingLevelM, unit)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kanonik 3D Gökyüzü Zaman Kaydırıcısı */}
        <div className="atmos-enter-3 space-y-2.5">
          <TimeScrubber
            hourly={bundle.hourly}
            frameIndex={frameIndex}
            onChange={setFrameIndex}
            unit={unit}
            horizonHours={hourlyHorizon}
            onHorizonChange={setHourlyHorizon}
            canonicalNow={bundle.current}
          />

          <div className="flex items-center justify-between text-xs text-slate-200/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.85)]">
            <a
              href="#saatlik"
              onClick={(e) => handleAnchorJump(e, "saatlik")}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ArrowDown className="h-3.5 w-3.5 text-[var(--atmos-accent)]" />
              <span>Saatlik meteogram, 7–30 günlük tahmin & doğrulama</span>
            </a>
            <div className="hidden sm:flex items-center gap-5">
              <Link href={buildLocationHref("/world", activeLocation)} className="hover:text-white transition-colors">
                Canlı Radar & Küre →
              </Link>
              <Link href={buildLocationHref("/lab", activeLocation)} className="hover:text-white transition-colors">
                8-Model & Skew-T →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* KATMAN 2: TEKİL KANONİK 15DK RADAR NOWCAST ŞERİDİ */}
      <RadarNowcastRibbon
        minutely15={bundle.minutely15}
        hourly={bundle.hourly}
        engineMeta={engineMeta}
        frameIndex={frameIndex}
        unit={unit}
      />

      {/* AKTİF KIRMIZI/AMBER ALARM TERFİSİ: Aktif fırtına/kar/şimşek alarmı varsa Meteogram üstüne çıkar */}
      {isObservatoryPromoted && bundle.snowAndLightning && (
        <SnowAndLightningObservatory
          cityName={bundle.location.name}
          daily={bundle.daily}
          hourly={bundle.hourly}
          subseasonal={bundle.subseasonal}
          summary={bundle.snowAndLightning}
          temporalLightningRadar={temporalView.lightningRadar}
          focusedDate={focusedDate}
          onSelectDate={setFocusedDate}
          selectedHourIndex={frameIndex}
          onSelectHourIndex={setFrameIndex}
          unit={unit}
        />
      )}

      {/* KATMAN 3: BİRLEŞİK SİNOPTİK SAATLİK METEOGRAM & İKON ŞERİDİ */}
      <section id="saatlik" className="scroll-mt-28 sm:scroll-mt-20 atmos-cv-auto">
        <HourlyForecastStrip
          hourly={bundle.hourly}
          daily={bundle.daily}
          minutely15={bundle.minutely15}
          unit={unit}
          selectedIndex={frameIndex}
          onSelectIndex={setFrameIndex}
          horizonHours={hourlyHorizon}
          onHorizonChange={setHourlyHorizon}
          focusedDate={focusedDate}
          onFocusDate={setFocusedDate}
          baseElevationM={bundle.location.elevation}
          subHourOffsetFrac={bundle.current.subHourOffsetFrac}
        />
      </section>

      {/* KATMAN 4: 7–30 GÜNLÜK KALİBRE TAHMİN + GÜNEŞ/UV & KANONİK CAMS HAVA KALİTESİ */}
      <section
        id="haftalik"
        className="scroll-mt-28 sm:scroll-mt-20 atmos-cv-auto grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]"
      >
        <ExtendedDailyForecastPanel
          daily={bundle.daily}
          subseasonal={bundle.subseasonal}
          hourly={bundle.hourly}
          ensembleMembers={bundle.hybrid.ensembleMembers}
          unit={unit}
          selectedHourIndex={frameIndex}
          activeDateYmd={frameIndex > 0 ? dayContext.date : (focusedDate ?? dayContext.date)}
          baseElevationM={bundle.location.elevation}
          onJumpToHourIndex={handleJumpToDayHour}
        />

        <div className="flex flex-col gap-5">
          <SunAndUvCard
            dayContext={dayContext}
            isForecastLocked={temporalView.frameIndex > 0}
            timeLabel={telemetry.timeLabel}
          />

          <div
            id="hava-kalitesi"
            className="scroll-mt-28 sm:scroll-mt-20 surface-panel flex-1 p-5 flex flex-col justify-between space-y-3 tabular"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-display text-sm font-semibold text-ink-primary">
                CAMS Hava Kalitesi
              </span>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                {temporalView.frameIndex > 0 && (
                  <span className="rounded-md border border-white/15 bg-white/[0.06] px-2 py-0.5 text-[10px] text-ink-secondary">
                    Canlı Gözlem (T+0)
                  </span>
                )}
                <span className="text-ink-secondary">
                  EAQI {bundle.airQuality.europeanAqi} · {bundle.airQuality.label}
                </span>
              </div>
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
                  {bundle.airQuality.no2} / {bundle.airQuality.dust} µg/m³
                </p>
              </div>
            </div>
            <p className="font-mono text-[11px] text-ink-muted">
              Baskın kirletici:{" "}
              <strong className="text-ink-secondary">
                {bundle.airQuality.dominantPollutant}
              </strong>{" "}
              ({bundle.airQuality.dominantValueText})
            </p>
          </div>
        </div>
      </section>

      {/* KATMAN 5: SAKİN/NORMAL MODDA BAĞLAMSAL KAR RASATHANESİ & 3-HALKALI ŞİMŞEK RADARI */}
      {!isObservatoryPromoted && bundle.snowAndLightning && (
        <SnowAndLightningObservatory
          cityName={bundle.location.name}
          daily={bundle.daily}
          hourly={bundle.hourly}
          subseasonal={bundle.subseasonal}
          summary={bundle.snowAndLightning}
          temporalLightningRadar={temporalView.lightningRadar}
          focusedDate={focusedDate}
          onSelectDate={setFocusedDate}
          selectedHourIndex={frameIndex}
          onSelectHourIndex={setFrameIndex}
          unit={unit}
        />
      )}

      {/* KATMAN 6: ATMOS-CORE v5.0 — CANLI İSTASYON DOĞRULAMASI & 8-MODEL SKOR KARTI */}
      {bundle.hybrid && (
        <section id="hibrit" className="scroll-mt-28 sm:scroll-mt-20 atmos-cv-auto surface-panel p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
            <div>
              <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-signal-sky">
                <Layers className="h-3.5 w-3.5" />
                {bundle.hybrid.engineVersion ?? "ATMOS-Core v5.0"}
                {bundle.hybrid.ensembleMembers ? ` + ${bundle.hybrid.ensembleMembers} EPS` : ""}
                {!isBursaProvince && provinceCode ? ` · ${provinceCode}` : ""}
              </p>
              <h2 className="mt-0.5 font-display text-base font-semibold text-ink-primary">
                {hibritHeadingText}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-ink-secondary tabular">
                Uzlaşı <strong className="text-signal-emerald">%{bundle.hybrid.confidencePct}</strong> · ΔT{" "}
                {formatTempDelta(bundle.hybrid.tempSpreadC, unit, {
                  decimals: 1,
                  signed: false,
                  showUnit: true
                })}
              </span>
              <Link
                href={buildLocationHref("/lab", activeLocation)}
                className="rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-white/[0.1] transition-colors"
              >
                8-Model 72s / 15g →
              </Link>
            </div>
          </div>

          {(engineMeta || (!isBursaProvince && isTrNonBursaProvince && provinceSummary)) && (
            <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-signal-sky/25 bg-signal-sky/[0.06] px-4 py-2.5 font-mono text-xs tabular">
              <div className="flex flex-wrap items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-signal-sky shrink-0" />
                {engineMeta ? (
                  <>
                    <span className="font-semibold text-signal-sky">
                      {localizeMetricProse(engineMeta.activeRegimeLabel, unit)}
                    </span>
                    <span className="text-ink-secondary">
                      · dProg/dt Kararlılık %{engineMeta.stabilityPct} ({Math.round(engineMeta.meanRunLockCount)} koşu kilitli)
                    </span>
                  </>
                ) : (
                  <span className="font-semibold text-signal-sky">
                    {provinceName} Mikroiklim & Fiziksel İrtifa Ağı
                  </span>
                )}
                {isBursaProvince && engineMeta?.ltbrIsolated && (
                  <span className="rounded bg-signal-emerald/15 px-1.5 py-0.5 text-[10px] text-signal-emerald">
                    {engineMeta.bursaTier1Online} Bursa MGM Sensörü Aktif · LTBR İzole
                  </span>
                )}
                {!isBursaProvince && isTrNonBursaProvince && (
                  <span className="rounded bg-signal-emerald/15 px-1.5 py-0.5 text-[10px] text-signal-emerald">
                    {nonBursaMgmSensorCount > 0
                      ? `${nonBursaMgmSensorCount} ${provinceName} MGM Sensörü Aktif · `
                      : ""}
                    {calibrationTier === "TIER_A"
                      ? "Tier-A WMO SYNOP"
                      : "Tier-B Donör + ALARO"}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-muted">
                {waterBodyBadge && (
                  <span className="text-cyan-200">
                    {waterBodyBadge.shortLabelTr}:{" "}
                    {formatTemperature(waterBodyBadge.tempC, unit, {
                      decimals: 1,
                      showUnit: true
                    })}
                  </span>
                )}
                {telemetry.showSnowLine && telemetry.snowLineElevationM !== null && (
                  <span className="text-sky-200">
                    Kar Sınırı: {formatElevation(telemetry.snowLineElevationM, unit)}
                  </span>
                )}
                {engineMeta && engineMeta.nextRainOnsetMin !== null && (
                  <span className="text-signal-amber font-semibold">
                    Radar Yağış Başlangıcı: +{engineMeta.nextRainOnsetMin} dk
                    {temporalView.frameIndex > 0 ? " (Şimdi)" : ""}
                  </span>
                )}
                {engineMeta?.radarSummaryCode === "VIRGA_ALOFT" && (
                  <span className="text-amber-200">Alt Seviye Virga Bastırıldı</span>
                )}
                {engineMeta && (engineMeta.bimodalHoursResolved ?? 0) > 0 && (
                  <span className="text-sky-200/90">
                    Çift-Modlu Çözüm: {engineMeta.bimodalHoursResolved}s
                  </span>
                )}
                {engineMeta && engineMeta.blockedFlipFlops > 0 && (
                  <span>Engellenen Sapma: {engineMeta.blockedFlipFlops}s</span>
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
                  {metarStation.qnhHpa !== null ? formatPressure(metarStation.qnhHpa, unit) : "—"} ·{" "}
                  {metarStation.windSpeedKmh !== null
                    ? formatWindSpeed(metarStation.windSpeedKmh, unit)
                    : "—"}
                </span>
                <span className="text-ink-muted">
                  ({formatDistance(metarStation.distanceKm, unit)} · {metarStation.ageMinutes} dk önce)
                </span>
              </div>

              {calInfo && (
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink-secondary">
                  <span>
                    Kalman ΔT{" "}
                    <strong className="text-signal-emerald">
                      {formatTempDelta(calInfo.nowcastTempDeltaC, unit, {
                        decimals: 2,
                        signed: true,
                        showUnit: true
                      })}
                    </strong>
                  </span>
                  <span>· K %{Math.round(calInfo.nowcastKalmanGain * 100)}</span>
                  <span>· Γ {formatLapseRate(calInfo.envLapseRateCPerKm, unit)}</span>
                </div>
              )}
            </div>
          )}

          {/* Temiz 6-Sütunlu 8-Model Skor Tablosu */}
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
                  const meta = CORE_MODEL_META[row.modelKey];
                  const tNow = bundle.hybrid.currentBreakdown.temperature[row.modelKey] ?? null;
                  const ubRmseVal = row.tempUbRmseC ?? row.tempRmseC;
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
                          <span>{localizeMetricProse(row.label, unit)}</span>
                          <span className="hidden sm:inline text-[10px] font-normal text-ink-muted">
                            {localizeMetricProse(row.resolution, unit)}
                          </span>
                        </span>
                      </td>
                      <td className="px-2.5 py-2 text-ink-primary">
                        {tNow !== null ? formatTemperature(tNow, unit) : "—"}
                      </td>
                      <td className="px-2.5 py-2 text-ink-secondary">
                        {row.tempBiasC !== null && row.tempBiasC !== undefined
                          ? formatTempDelta(row.tempBiasC, unit, {
                              decimals: 2,
                              signed: true,
                              showUnit: true
                            })
                          : "—"}
                      </td>
                      <td
                        className={`px-2.5 py-2 ${
                          winT ? "font-semibold text-signal-emerald" : "text-ink-secondary"
                        }`}
                      >
                        {ubRmseVal !== null && ubRmseVal !== undefined
                          ? formatTempDelta(ubRmseVal, unit, {
                              decimals: 2,
                              signed: false,
                              showUnit: true
                            })
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
              aria-expanded={showMethodology}
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
                      <span className="font-medium text-ink-primary">
                        {localizeMetricProse(item.parameter, unit)}
                      </span>
                      <span className="font-mono text-[10px] text-signal-sky">
                        {localizeMetricProse(item.primaryEngine, unit)}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-signal-emerald/90">
                      {localizeMetricProse(item.standardRef, unit)}
                    </p>
                    <p className="text-[11px] text-ink-muted leading-relaxed">
                      {localizeMetricProse(item.reason, unit)}
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
