"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock, Compass, Mountain, RefreshCw, ShieldCheck } from "lucide-react";
import { useWeatherStatus } from "@/context/WeatherContext";
import {
  readCachedModelsBundleAsync,
  readCachedModelsBundleSync,
  writeCachedModelsBundle
} from "@/lib/client-forecast-cache";
import {
  areLocationsEquivalent,
  formatClockTr,
  formatFreshnessAgeTr,
  reanchorMultiModelBundleToNow
} from "@/lib/forecast-resilience";
import { CORE_MODEL_KEYS, CORE_MODEL_META } from "@/lib/model-registry";
import type { CalibrationTier, ProvinceClientSummary } from "@/lib/provinces/types";
import {
  ATMOS_REFRESH_ALL_EVENT,
  convertPrecipMm,
  convertTempValue,
  convertWindSpeed,
  formatElevation,
  formatPrecip,
  formatTempDelta,
  formatTemperature
} from "@/lib/weather-client";
import type {
  AtmosCalibrationTierLabel,
  AtmosEngineMeta,
  CoreModelKey,
  GeoLocation,
  ModelSeriesPoint,
  MultiModelBundle,
  UnitSystem
} from "@/lib/weather-types";

export type MetricTab = "temp2m" | "temp850" | "precip" | "wind10m";
export type HorizonHours = 72 | 168 | 360;

export interface ModelComparisonChartProps {
  location: GeoLocation;
  unit: UnitSystem;
  syncedTimeIso?: string | null;
  onInspectTimeChange?: (iso: string | null) => void;
  provinceSummary?: ProvinceClientSummary | null;
  engineMeta?: AtmosEngineMeta | null;
}

export interface HorizonModelItemSummary {
  key: CoreModelKey;
  validCount: number;
  isPartialHorizon: boolean;
  rawValue: number | null;
  formatted: string;
}

export interface HorizonModelSummaryResult {
  horizonHours: HorizonHours;
  activeModelKeys: CoreModelKey[];
  precipByModel: Record<CoreModelKey, HorizonModelItemSummary>;
  min850ByModel: Record<CoreModelKey, HorizonModelItemSummary>;
  maxSpreadTemp2mC: number | null;
  maxSpreadFormatted: string;
  maxSpreadTimeIso: string | null;
  maxSpreadTimeLabel: string | null;
}

type CanonicalTierBadgeCode =
  | CalibrationTier
  | "GLOBAL";

interface ResolvedTierBadge {
  code: CanonicalTierBadgeCode;
  detail: string;
  className: string;
}

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

function isSameModelTarget(
  candidate:
    | {
        lat: number;
        lon: number;
        elevation?: number;
        id?: string;
        provinceCode?: string | null;
      }
    | null
    | undefined,
  target: GeoLocation
): boolean {
  if (!candidate) return false;
  if (hasProvinceConflict(candidate.provinceCode, target.provinceCode)) {
    return false;
  }
  return areLocationsEquivalent(
    {
      id: candidate.id,
      lat: candidate.lat,
      lon: candidate.lon,
      elevation: candidate.elevation
    },
    target
  );
}

function resolveCalibrationTierBadge(params: {
  provinceCode?: string | null;
  summaryTier?: CalibrationTier | null;
  engineTier?: AtmosCalibrationTierLabel | null;
}): ResolvedTierBadge | null {
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
      className:
        "border-emerald-400/35 bg-emerald-500/12 text-emerald-200"
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

/**
 * Seçili ufuk (`72 | 168 | 360` saat) ve görünür modellere (`visibleModels`) duyarlı,
 * kısa vadeli modellerin gerçek veri kapsamını (`(114s)` vb.) dürüstçe raporlayan saf özet hesaplayıcı.
 */
export function computeHorizonModelSummary(params: {
  temp2m: ModelSeriesPoint[];
  temp850: ModelSeriesPoint[];
  precip: ModelSeriesPoint[];
  horizonHours: HorizonHours;
  visibleModels?: Partial<Record<CoreModelKey, boolean>>;
  unit?: UnitSystem;
}): HorizonModelSummaryResult {
  const { horizonHours } = params;
  const unit: UnitSystem = params.unit ?? "metric";
  const activeModelKeys = CORE_MODEL_KEYS.filter((k) =>
    params.visibleModels ? Boolean(params.visibleModels[k]) : true
  );

  const precipSlice = params.precip.slice(0, horizonHours);
  const precipByModel = {} as Record<CoreModelKey, HorizonModelItemSummary>;

  for (const k of CORE_MODEL_KEYS) {
    const validVals = precipSlice
      .map((p) => p[k])
      .filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v));
    const validCount = validVals.length;
    if (validCount === 0) {
      precipByModel[k] = {
        key: k,
        validCount: 0,
        isPartialHorizon: false,
        rawValue: null,
        formatted: "—"
      };
    } else {
      const sumMm = Number(
        validVals.reduce((acc, v) => acc + Math.max(0, v), 0).toFixed(2)
      );
      const isPartialHorizon = validCount < horizonHours - 2;
      const baseFormatted = formatPrecip(sumMm, unit);
      precipByModel[k] = {
        key: k,
        validCount,
        isPartialHorizon,
        rawValue: sumMm,
        formatted: isPartialHorizon ? `${baseFormatted} (${validCount}s)` : baseFormatted
      };
    }
  }

  const temp850Slice = params.temp850.slice(0, horizonHours);
  const min850ByModel = {} as Record<CoreModelKey, HorizonModelItemSummary>;

  for (const k of CORE_MODEL_KEYS) {
    const validVals = temp850Slice
      .map((p) => p[k])
      .filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v));
    const validCount = validVals.length;
    if (validCount === 0) {
      min850ByModel[k] = {
        key: k,
        validCount: 0,
        isPartialHorizon: false,
        rawValue: null,
        formatted: "—"
      };
    } else {
      const minC = Number(Math.min(...validVals).toFixed(2));
      const isPartialHorizon = validCount < horizonHours - 2;
      const baseFormatted = formatTemperature(minC, unit, {
        decimals: 1,
        showUnit: true
      });
      min850ByModel[k] = {
        key: k,
        validCount,
        isPartialHorizon,
        rawValue: minC,
        formatted: isPartialHorizon ? `${baseFormatted} (${validCount}s)` : baseFormatted
      };
    }
  }

  const temp2mSlice = params.temp2m.slice(0, horizonHours);
  let maxSpreadTemp2mC: number | null = null;
  let maxSpreadTimeIso: string | null = null;
  let maxSpreadTimeLabel: string | null = null;

  for (const pt of temp2mSlice) {
    const vals = activeModelKeys
      .map((k) => pt[k])
      .filter((v): v is number => v !== null && v !== undefined && Number.isFinite(v));
    if (vals.length >= 2) {
      const spreadC = Math.max(...vals) - Math.min(...vals);
      if (maxSpreadTemp2mC === null || spreadC > maxSpreadTemp2mC) {
        maxSpreadTemp2mC = Number(spreadC.toFixed(2));
        maxSpreadTimeIso = pt.time;
        maxSpreadTimeLabel = `${pt.dayLabel} ${pt.hourLabel}`.trim();
      }
    }
  }

  const maxSpreadFormatted =
    maxSpreadTemp2mC !== null
      ? formatTempDelta(maxSpreadTemp2mC, unit, {
          decimals: 1,
          signed: false,
          showUnit: true
        })
      : "—";

  return {
    horizonHours,
    activeModelKeys,
    precipByModel,
    min850ByModel,
    maxSpreadTemp2mC,
    maxSpreadFormatted,
    maxSpreadTimeIso,
    maxSpreadTimeLabel
  };
}

const TAB_CONFIG: Record<
  MetricTab,
  {
    label: string;
    subtitle: string;
    subtitleImperial?: string;
    unitMetric: string;
    unitImperial: string;
  }
> = {
  temp2m: {
    label: "2m Sıcaklık",
    subtitle: "8 operasyonel NWP ve AI modelinin yüzey hava sıcaklığı karşılaştırması",
    unitMetric: "°C",
    unitImperial: "°F"
  },
  temp850: {
    label: "850 hPa",
    subtitle: "~1500 m üst atmosfer sıcaklığı (soğuk cephe & kar sınırı takibi)",
    subtitleImperial: "~5000 ft üst atmosfer sıcaklığı (soğuk cephe & kar sınırı takibi)",
    unitMetric: "°C",
    unitImperial: "°F"
  },
  precip: {
    label: "Yağış",
    subtitle: "Saatlik yağış miktarı (mm/sa)",
    subtitleImperial: "Saatlik yağış miktarı (in/sa)",
    unitMetric: "mm",
    unitImperial: "in"
  },
  wind10m: {
    label: "10m Rüzgar",
    subtitle: "Yüzey rüzgar hızı",
    unitMetric: "km/s",
    unitImperial: "mph"
  }
};

function convertValue(val: number | null, tab: MetricTab, unit: UnitSystem): number | null {
  if (val === null || !Number.isFinite(val)) return null;
  if (tab === "temp2m" || tab === "temp850") {
    return Number(convertTempValue(val, unit).toFixed(1));
  }
  if (tab === "precip") {
    const converted = convertPrecipMm(val, unit);
    return Number(converted.toFixed(unit === "imperial" ? 2 : 1));
  }
  if (tab === "wind10m") {
    return Number(convertWindSpeed(val, unit).toFixed(1));
  }
  return Number(val.toFixed(1));
}

function buildLinePath(points: Array<{ x: number; y: number | null }>): string {
  let d = "";
  let open = false;
  for (const pt of points) {
    if (pt.y === null) {
      open = false;
      continue;
    }
    d += `${open ? "L" : "M"}${pt.x.toFixed(1)},${pt.y.toFixed(1)} `;
    open = true;
  }
  return d.trim();
}

function buildModelsApiUrl(location: GeoLocation): string {
  const qs = new URLSearchParams({
    lat: String(location.lat),
    lon: String(location.lon)
  });
  if (location.name?.trim()) {
    qs.set("name", location.name.trim());
  }
  if (location.admin1?.trim()) {
    qs.set("admin1", location.admin1.trim());
  }
  if (location.country?.trim()) {
    qs.set("country", location.country.trim());
  }
  if (location.countryCode?.trim()) {
    qs.set("cc", location.countryCode.trim().toUpperCase());
  }
  if (location.id?.trim()) {
    qs.set("id", location.id.trim());
  }
  if (location.elevation !== undefined && Number.isFinite(location.elevation)) {
    qs.set("elevation", String(Math.round(location.elevation)));
  }
  const normalizedPc = normalizeProvinceCode(location.provinceCode);
  const pcSuffix = normalizedPc
    ? `&pc=${encodeURIComponent(normalizedPc)}`
    : "";
  return `/api/models?${qs.toString()}${pcSuffix}`;
}

function ModelComparisonChartBase({
  location,
  unit,
  syncedTimeIso,
  onInspectTimeChange,
  provinceSummary,
  engineMeta
}: ModelComparisonChartProps) {
  const { recoveryCount, isOffline } = useWeatherStatus();

  const [models, setModels] = useState<MultiModelBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [revalidating, setRevalidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<MetricTab>("temp2m");
  const [horizonHours, setHorizonHours] = useState<HorizonHours>(72);
  const [hoverIdx, setHoverIdx] = useState<number>(0);
  const [chartWidth, setChartWidth] = useState<number>(760);
  const [visibleModels, setVisibleModels] = useState<Record<CoreModelKey, boolean>>({
    ecmwfIfs: true,
    ecmwfAifs: true,
    icon: true,
    ukmo: true,
    meteofrance: true,
    gfs: true,
    gem: true,
    jma: true
  });

  const toggleModel = (k: CoreModelKey) => {
    setVisibleModels((prev) => {
      const enabledCount = CORE_MODEL_KEYS.filter((m) => prev[m]).length;
      if (prev[k] && enabledCount <= 1) return prev;
      return { ...prev, [k]: !prev[k] };
    });
  };

  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const reqSeqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const modelsRef = useRef<MultiModelBundle | null>(null);
  const locRef = useRef<GeoLocation>(location);
  const lastEmittedIsoRef = useRef<string | null>(null);

  useEffect(() => {
    modelsRef.current = models;
  }, [models]);

  useEffect(() => {
    locRef.current = location;
  }, [location]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const loadModels = useCallback(
    async (opts?: { background?: boolean; forceNoStore?: boolean }) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const seq = ++reqSeqRef.current;
      const targetLoc: GeoLocation = {
        id: location.id,
        name: location.name,
        admin1: location.admin1,
        district: location.district,
        provinceCode: normalizeProvinceCode(location.provinceCode),
        country: location.country,
        countryCode: location.countryCode,
        lat: location.lat,
        lon: location.lon,
        elevation: location.elevation,
        timezone: location.timezone
      };

      const hasMatching = isSameModelTarget(modelsRef.current, targetLoc);
      const isBg = Boolean((opts?.background ?? false) && hasMatching) || hasMatching;

      if (isBg) {
        setRevalidating(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const apiUrl = buildModelsApiUrl(targetLoc);
        const bypassCache =
          Boolean(opts?.forceNoStore) ||
          isBg ||
          modelsRef.current?.freshness?.status !== "live";
        const res = await fetch(apiUrl, {
          cache: bypassCache ? "no-store" : "default",
          signal: controller.signal
        });
        if (controller.signal.aborted || seq !== reqSeqRef.current) return;

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }
        const data: MultiModelBundle = await res.json();
        if (controller.signal.aborted || seq !== reqSeqRef.current) return;
        if (
          !isSameModelTarget(locRef.current, targetLoc) ||
          !isSameModelTarget(data, targetLoc) ||
          !isSameModelTarget(data, locRef.current)
        ) {
          return;
        }

        if ((data.freshness?.status ?? "live") === "live") {
          writeCachedModelsBundle(data);
        }
        modelsRef.current = data;
        setModels(data);
        setError(null);
        if (!isBg && !syncedTimeIso) setHoverIdx(0);
      } catch (e) {
        if (
          controller.signal.aborted ||
          (e instanceof Error && e.name === "AbortError") ||
          seq !== reqSeqRef.current
        ) {
          return;
        }
        const msg =
          e instanceof Error
            ? e.message
            : "8-Model sayısal tahmin verileri alınamadı.";

        if (modelsRef.current && isSameModelTarget(modelsRef.current, targetLoc)) {
          const reanchored = reanchorMultiModelBundleToNow(
            modelsRef.current,
            Date.now(),
            {
              status: "stale",
              sourceTier:
                modelsRef.current.freshness?.sourceTier === "live"
                  ? "client-cache"
                  : (modelsRef.current.freshness?.sourceTier ?? "client-cache"),
              cachedAtMs:
                modelsRef.current.freshness?.cachedAtMs ??
                Date.parse(modelsRef.current.fetchedAt),
              staleReason: msg,
              modelsRespondedCount:
                modelsRef.current.freshness?.modelsRespondedCount
            }
          );
          modelsRef.current = reanchored;
          setModels(reanchored);
          setError(null);
        } else {
          const cached = await readCachedModelsBundleAsync(
            targetLoc.lat,
            targetLoc.lon,
            Date.now(),
            { forceStale: true, staleReason: msg }
          );
          if (controller.signal.aborted || seq !== reqSeqRef.current) return;
          if (!isSameModelTarget(locRef.current, targetLoc)) return;

          if (cached && isSameModelTarget(cached, targetLoc)) {
            modelsRef.current = cached;
            setModels(cached);
            setError(null);
            if (!syncedTimeIso) setHoverIdx(0);
          } else {
            modelsRef.current = null;
            setModels(null);
            setError(msg);
          }
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
        if (seq === reqSeqRef.current) {
          setLoading(false);
          setRevalidating(false);
        }
      }
    },
    [
      location.lat,
      location.lon,
      location.id,
      location.name,
      location.admin1,
      location.district,
      location.provinceCode,
      location.country,
      location.countryCode,
      location.elevation,
      location.timezone,
      syncedTimeIso
    ]
  );

  // Hydrate city-isolated cache immediately on location/province change, then fetch live
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const cur = modelsRef.current;
      const sameLoc = isSameModelTarget(cur, location);

      if (!sameLoc) {
        const syncHit = readCachedModelsBundleSync(
          location.lat,
          location.lon,
          Date.now(),
          { forceStale: isOffline }
        );
        if (syncHit && isSameModelTarget(syncHit, location)) {
          modelsRef.current = syncHit;
          setModels(syncHit);
          setError(null);
          setHoverIdx(0);
        } else {
          modelsRef.current = null;
          setModels(null);
          setError(null);
        }
      }
      void loadModels({ background: Boolean(modelsRef.current) });
    });
    return () => {
      active = false;
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    location.lat,
    location.lon,
    location.id,
    location.provinceCode,
    location.elevation,
    loadModels
  ]);

  // Re-fetch automatically when global WeatherContext recovers live connectivity
  useEffect(() => {
    if (recoveryCount <= 0) return;
    queueMicrotask(() => {
      void loadModels({ background: Boolean(modelsRef.current), forceNoStore: true });
    });
  }, [recoveryCount, loadModels]);

  // Listen for global ATMOS_REFRESH_ALL_EVENT to force no-store refresh
  useEffect(() => {
    const handleRefreshAll = () => {
      void loadModels({ background: Boolean(modelsRef.current), forceNoStore: true });
    };
    window.addEventListener(ATMOS_REFRESH_ALL_EVENT, handleRefreshAll);
    return () => {
      window.removeEventListener(ATMOS_REFRESH_ALL_EVENT, handleRefreshAll);
    };
  }, [loadModels]);

  // Zero-frame cross-city shield: never expose an older city's series under a newly selected location
  const activeModels = useMemo(
    () => (models && isSameModelTarget(models, location) ? models : null),
    [models, location]
  );

  // Self-healing retry loop if models chart is stale or failed while online
  const isModelsStale =
    activeModels?.freshness?.status === "stale" ||
    activeModels?.freshness?.status === "degraded";
  useEffect(() => {
    if (isOffline || (!isModelsStale && !error) || loading || revalidating) {
      return;
    }
    const timer = window.setTimeout(() => {
      void loadModels({ background: Boolean(modelsRef.current), forceNoStore: true });
    }, 18_000);
    return () => window.clearTimeout(timer);
  }, [isOffline, isModelsStale, error, loading, revalidating, loadModels]);

  // Sync external `syncedTimeIso` onto chart cursor (and expand horizon if needed)
  useEffect(() => {
    if (!syncedTimeIso || !activeModels) return;
    const fullSeries = activeModels[tab] ?? [];
    if (fullSeries.length === 0) return;

    let matchIdx = fullSeries.findIndex((pt) => pt.time === syncedTimeIso);
    if (matchIdx === -1) {
      const hourPrefix = syncedTimeIso.slice(0, 13);
      matchIdx = fullSeries.findIndex((pt) => pt.time.slice(0, 13) === hourPrefix);
    }
    if (matchIdx === -1) return;

    lastEmittedIsoRef.current = fullSeries[matchIdx].time;
    queueMicrotask(() => {
      if (matchIdx >= horizonHours) {
        if (matchIdx < 168) {
          setHorizonHours(168);
        } else {
          setHorizonHours(360);
        }
      }
      setHoverIdx(matchIdx);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncedTimeIso, activeModels, tab]);

  const activeSeries: ModelSeriesPoint[] = useMemo(() => {
    if (!activeModels) return [];
    return (activeModels[tab] ?? []).slice(0, horizonHours);
  }, [activeModels, tab, horizonHours]);

  const hasChartDom = Boolean(activeModels && activeSeries.length > 0);

  // Measure real CSS pixel width via ResizeObserver so 360px mobile renders 1:1 native text
  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el) return;

    const applyWidth = (rawW: number) => {
      const rounded = Math.round(rawW);
      if (rounded > 0) {
        setChartWidth(Math.max(300, rounded));
      }
    };

    applyWidth(el.clientWidth);

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        applyWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasChartDom]);

  const chartHeight = chartWidth < 480 ? 228 : 248;

  const chart = useMemo(() => {
    const W = Math.max(300, chartWidth);
    const H = chartHeight;
    const padL = W < 420 ? 38 : 44;
    const padR = 14;
    const padT = 16;
    const padB = 30;
    const plotW = Math.max(120, W - padL - padR);
    const plotH = H - padT - padB;

    const allVals: number[] = [];
    for (const pt of activeSeries) {
      for (const k of CORE_MODEL_KEYS) {
        if (!visibleModels[k]) continue;
        const v = convertValue(pt[k] ?? null, tab, unit);
        if (v !== null) allVals.push(v);
      }
    }

    const minRaw = allVals.length ? Math.min(...allVals) : 0;
    const maxRaw = allVals.length ? Math.max(...allVals) : 10;
    const minVal = tab === "precip" || tab === "wind10m" ? 0 : Math.floor(minRaw - 2);
    const maxVal =
      tab === "precip"
        ? unit === "imperial"
          ? Math.max(0.2, Math.ceil((maxRaw + 0.05) * 10) / 10)
          : Math.max(2, Math.ceil(maxRaw + 0.5))
        : Math.ceil(maxRaw + 2);
    const span = Math.max(
      tab === "precip" && unit === "imperial" ? 0.1 : 1,
      maxVal - minVal
    );

    const n = Math.max(2, activeSeries.length);
    const xAt = (i: number) => padL + (i / (n - 1)) * plotW;
    const yAt = (v: number) => padT + plotH - ((v - minVal) / span) * plotH;

    const paths = {} as Record<CoreModelKey, string>;
    for (const k of CORE_MODEL_KEYS) {
      paths[k] = buildLinePath(
        activeSeries.map((pt, i) => {
          const v = convertValue(pt[k] ?? null, tab, unit);
          return { x: xAt(i), y: v === null ? null : yAt(v) };
        })
      );
    }

    const upperPts: string[] = [];
    const lowerPts: string[] = [];
    activeSeries.forEach((pt, i) => {
      const vals: number[] = [];
      for (const k of CORE_MODEL_KEYS) {
        if (!visibleModels[k]) continue;
        const v = convertValue(pt[k] ?? null, tab, unit);
        if (v !== null) vals.push(v);
      }
      if (vals.length >= 2) {
        const x = xAt(i).toFixed(1);
        upperPts.push(`${x},${yAt(Math.max(...vals)).toFixed(1)}`);
        lowerPts.push(`${x},${yAt(Math.min(...vals)).toFixed(1)}`);
      }
    });
    const envelopePath =
      upperPts.length >= 2
        ? `M${upperPts.join(" L")} L${lowerPts.reverse().join(" L")} Z`
        : "";

    const tickDecimals = tab === "precip" ? (unit === "imperial" ? 2 : 1) : 0;
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((frac, idx) => {
      const val = minVal + span * frac;
      return { id: idx, val: Number(val.toFixed(tickDecimals)), y: yAt(val) };
    });

    const freezeIso = unit === "imperial" ? 32 : 0;
    const zeroY =
      (tab === "temp2m" || tab === "temp850") &&
      minVal < freezeIso &&
      maxVal > freezeIso
        ? yAt(freezeIso)
        : null;

    // Non-overlapping X-axis tick selection adapted to real pixel plotW
    const maxTicks = Math.max(4, Math.floor(plotW / 68));
    const baseMinStride = horizonHours === 360 ? 48 : horizonHours === 168 ? 24 : 12;
    const candidateStrides = [6, 12, 18, 24, 36, 48, 72, 96, 120];
    let stride = candidateStrides[candidateStrides.length - 1];
    for (const s of candidateStrides) {
      if (s < baseMinStride) continue;
      const estCount = Math.floor(Math.max(0, activeSeries.length - 1) / s) + 1;
      if (estCount <= maxTicks) {
        stride = s;
        break;
      }
    }

    const xTicks: Array<{
      idx: number;
      time: string;
      x: number;
      label: string;
      anchor: "start" | "middle" | "end";
    }> = [];
    let lastX = -Infinity;
    const minPxGap = W < 420 ? 58 : 66;
    const compactLabels = W < 480;

    for (let idx = 0; idx < activeSeries.length; idx += stride) {
      const pt = activeSeries[idx];
      const x = xAt(idx);
      if (x - lastX < minPxGap) continue;
      lastX = x;

      let label: string;
      if (compactLabels && horizonHours >= 168) {
        label = pt.dayLabel;
      } else if (pt.hourLabel === "00:00" || idx === 0 || horizonHours >= 168) {
        label = compactLabels
          ? `${pt.dayLabel} ${pt.hourLabel.slice(0, 2)}s`
          : `${pt.dayLabel} ${pt.hourLabel}`;
      } else {
        label = pt.hourLabel;
      }

      const anchor: "start" | "middle" | "end" =
        idx === 0 ? "start" : x > W - padR - 36 ? "end" : "middle";

      xTicks.push({ idx, time: pt.time, x, label, anchor });
    }

    return {
      W,
      H,
      padL,
      padR,
      padT,
      padB,
      plotW,
      plotH,
      xAt,
      yAt,
      paths,
      envelopePath,
      yTicks,
      xTicks,
      zeroY
    };
  }, [activeSeries, tab, unit, visibleModels, chartWidth, chartHeight, horizonHours]);

  const clampedIdx = Math.max(0, Math.min(activeSeries.length - 1, hoverIdx));
  const inspected = activeSeries[clampedIdx] ?? null;

  const inspectedValues = useMemo(() => {
    if (!inspected) return null;
    const map = {} as Record<CoreModelKey, number | null>;
    const present: number[] = [];
    for (const k of CORE_MODEL_KEYS) {
      const v = convertValue(inspected[k] ?? null, tab, unit);
      map[k] = v;
      if (v !== null && visibleModels[k]) present.push(v);
    }
    const spreadDecimals = tab === "precip" && unit === "imperial" ? 2 : 1;
    const spread =
      present.length >= 2
        ? Number((Math.max(...present) - Math.min(...present)).toFixed(spreadDecimals))
        : null;
    return { map, spread };
  }, [inspected, tab, unit, visibleModels]);

  const horizonSummary = useMemo(() => {
    if (!activeModels) return null;
    return computeHorizonModelSummary({
      temp2m: activeModels.temp2m ?? [],
      temp850: activeModels.temp850 ?? [],
      precip: activeModels.precip ?? [],
      horizonHours,
      visibleModels,
      unit
    });
  }, [activeModels, horizonHours, visibleModels, unit]);

  const resolvedProvinceCode = useMemo(
    () =>
      normalizeProvinceCode(
        activeModels?.provinceCode ??
          location.provinceCode ??
          provinceSummary?.provinceCode ??
          engineMeta?.provinceCode
      ),
    [
      activeModels?.provinceCode,
      location.provinceCode,
      provinceSummary?.provinceCode,
      engineMeta?.provinceCode
    ]
  );

  const summaryMatchesLocation =
    !provinceSummary ||
    !hasProvinceConflict(provinceSummary.provinceCode, resolvedProvinceCode);
  const engineMatchesLocation =
    !engineMeta ||
    !hasProvinceConflict(engineMeta.provinceCode, resolvedProvinceCode);

  const safeSummary = summaryMatchesLocation ? provinceSummary : null;
  const safeEngineMeta = engineMatchesLocation ? engineMeta : null;

  const tierBadge = useMemo(
    () =>
      resolveCalibrationTierBadge({
        provinceCode: resolvedProvinceCode,
        summaryTier: safeSummary?.calibrationTier ?? null,
        engineTier: safeEngineMeta?.calibrationTier ?? null
      }),
    [
      resolvedProvinceCode,
      safeSummary?.calibrationTier,
      safeEngineMeta?.calibrationTier
    ]
  );

  const targetElevationM =
    location.elevation ??
    activeModels?.elevation ??
    safeSummary?.canonicalCenter.elevationM;

  const microclimateTags = useMemo(
    () => (safeEngineMeta?.activeMicroclimateTags ?? []).slice(0, 4),
    [safeEngineMeta?.activeMicroclimateTags]
  );

  const rawUnitSuffix =
    unit === "imperial" ? TAB_CONFIG[tab].unitImperial : TAB_CONFIG[tab].unitMetric;
  const unitSuffix = rawUnitSuffix.startsWith("°") ? rawUnitSuffix : ` ${rawUnitSuffix}`;

  const activeSubtitle = useMemo(() => {
    if (
      tab === "temp850" &&
      targetElevationM !== undefined &&
      Number.isFinite(targetElevationM) &&
      targetElevationM >= 1450
    ) {
      return `Yüksek irtifa hedefi (${formatElevation(targetElevationM, unit)}): 850 hPa düzeyi istasyon sınır tabakası / zemin seviyesiyle kesişir`;
    }
    return unit === "imperial" && TAB_CONFIG[tab].subtitleImperial
      ? TAB_CONFIG[tab].subtitleImperial
      : TAB_CONFIG[tab].subtitle;
  }, [tab, targetElevationM, unit]);

  const emitInspectTime = useCallback(
    (nextIdx: number, series: ModelSeriesPoint[]) => {
      const nextPt = series[nextIdx];
      if (!nextPt || !onInspectTimeChange) return;
      if (lastEmittedIsoRef.current !== nextPt.time) {
        lastEmittedIsoRef.current = nextPt.time;
        onInspectTimeChange(nextPt.time);
      }
    },
    [onInspectTimeChange]
  );

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activeSeries.length < 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const relX = ((e.clientX - rect.left) / rect.width) * chart.W;
    const frac = Math.max(0, Math.min(1, (relX - chart.padL) / chart.plotW));
    const nextIdx = Math.round(frac * (activeSeries.length - 1));
    setHoverIdx(nextIdx);
    emitInspectTime(nextIdx, activeSeries);
  };

  const showArchiveBadge = Boolean(activeModels && (isModelsStale || isOffline));
  const axisFontSize = chartWidth < 480 ? 10.5 : 11;

  return (
    <section className="surface-panel p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-ink-primary">
              {horizonHours === 360 ? "15 Günlük (360s)" : `${horizonHours} Saatlik`} 8-Model Karşılaştırma
            </h2>
            {resolvedProvinceCode && resolvedProvinceCode !== "GLOBAL" && (
              <span className="inline-flex items-center rounded-md border border-white/15 bg-white/[0.05] px-2 py-0.5 font-mono text-[11px] font-medium text-ink-primary tabular">
                {resolvedProvinceCode}
                {safeSummary?.provinceName ? ` · ${safeSummary.provinceName}` : ""}
              </span>
            )}
            {tierBadge && (
              <span
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11px] font-medium ${tierBadge.className}`}
              >
                <ShieldCheck className="h-3 w-3" />
                <span>
                  {tierBadge.code} · {tierBadge.detail}
                </span>
              </span>
            )}
            {targetElevationM !== undefined && Number.isFinite(targetElevationM) && (
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-obsidian-950/70 px-2 py-0.5 font-mono text-[11px] text-ink-secondary tabular">
                <Mountain className="h-3 w-3 text-signal-sky" />
                <span>Hedef {formatElevation(targetElevationM, unit)}</span>
              </span>
            )}
            {showArchiveBadge && activeModels && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-signal-amber/35 bg-signal-amber/12 px-2.5 py-0.5 font-mono text-[11px] text-amber-200 tabular">
                <Clock className="h-3 w-3 text-signal-amber" />
                <span>
                  Arşiv · {formatFreshnessAgeTr(activeModels.fetchedAt)} (
                  {formatClockTr(activeModels.fetchedAt, location.timezone)})
                </span>
              </span>
            )}
          </div>

          <p className="text-xs text-ink-muted">
            {location.name}
            {targetElevationM !== undefined && Number.isFinite(targetElevationM)
              ? ` (${formatElevation(targetElevationM, unit)})`
              : ""}{" "}
            · {activeSubtitle}
          </p>

          {(safeEngineMeta?.activeRegimeLabel || microclimateTags.length > 0) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              {safeEngineMeta?.activeRegimeLabel && (
                <span className="inline-flex items-center gap-1 rounded-md border border-signal-sky/25 bg-signal-sky/10 px-2 py-0.5 font-mono text-[10px] text-sky-200">
                  <Compass className="h-2.5 w-2.5 text-signal-sky" />
                  <span>{safeEngineMeta.activeRegimeLabel}</span>
                </span>
              )}
              {microclimateTags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-ink-secondary"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              void loadModels({ background: Boolean(activeModels), forceNoStore: true })
            }
            disabled={loading || revalidating}
            title="8-Model serisini yenile"
            aria-label="8-Model serisini yenile"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-obsidian-950/75 text-ink-secondary hover:text-ink-primary disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading || revalidating ? "animate-spin" : ""}`}
            />
          </button>

          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-obsidian-950/75 p-1">
            {([72, 168, 360] as HorizonHours[]).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  setHorizonHours(h);
                  setHoverIdx((prev) => {
                    const nextIdx = Math.min(prev, h - 1);
                    if (activeModels) {
                      const nextSeries = (activeModels[tab] ?? []).slice(0, h);
                      emitInspectTime(nextIdx, nextSeries);
                    }
                    return nextIdx;
                  });
                }}
                className={`rounded-lg px-2.5 py-1.5 font-mono text-xs font-medium transition-colors ${
                  horizonHours === h
                    ? "bg-white/15 text-ink-primary"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                {h === 360 ? "15g" : h === 168 ? "7g" : "72s"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-obsidian-950/75 p-1">
            {(Object.keys(TAB_CONFIG) as MetricTab[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === key
                    ? "bg-white/15 text-ink-primary"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                {TAB_CONFIG[key].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && !activeModels && (
        <div className="rounded-xl border border-signal-rose/35 bg-signal-rose/10 p-4 flex items-center justify-between gap-3 text-xs text-ink-primary">
          <span>
            {error} · Bağlantı sağlandığında otomatik olarak yüklenecek.
          </span>
          <button
            type="button"
            onClick={() => void loadModels({ forceNoStore: true })}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/10"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Tekrar Dene
          </button>
        </div>
      )}

      {loading && !activeModels && !error && (
        <div className="h-[248px] rounded-xl border border-white/[0.06] bg-obsidian-950/60 flex items-center justify-center font-mono text-xs text-ink-muted">
          {location.name} için 8 küresel ve mezoskaleli model verisi çekiliyor...
        </div>
      )}

      {activeModels && activeSeries.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-white/[0.07] bg-obsidian-950/60 px-3.5 py-2.5 text-xs font-mono tabular">
            <span className="text-ink-secondary">
              {inspected ? `${inspected.dayLabel} · ${inspected.hourLabel}` : "--"}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {CORE_MODEL_KEYS.map((k) => {
                const meta = CORE_MODEL_META[k];
                const active = visibleModels[k];
                const val = inspectedValues?.map[k];
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => toggleModel(k)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 transition-opacity ${
                      active
                        ? "border-white/15 bg-white/[0.04] opacity-100"
                        : "border-white/[0.05] opacity-40"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="text-ink-muted">{meta.shortLabel}</span>
                    <strong className="text-ink-primary">
                      {val !== null && val !== undefined ? `${val}${unitSuffix}` : "—"}
                    </strong>
                  </button>
                );
              })}
              {inspectedValues?.spread !== null &&
                inspectedValues?.spread !== undefined && (
                  <span className="pl-1 text-ink-muted">
                    Fark:{" "}
                    <strong className="text-ink-secondary">
                      Δ{inspectedValues.spread}
                      {unitSuffix}
                    </strong>
                  </span>
                )}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#070b14] p-2">
            <div ref={chartContainerRef} className="w-full">
              <svg
                width={chart.W}
                height={chart.H}
                viewBox={`0 0 ${chart.W} ${chart.H}`}
                style={{ height: `${chart.H}px` }}
                onPointerMove={handlePointer}
                onPointerDown={handlePointer}
                className="block w-full cursor-crosshair select-none touch-pan-y"
                role="img"
                aria-label={`${location.name} 8 meteoroloji modeli ${horizonHours} saatlik karşılaştırma grafiği`}
              >
                {chart.yTicks.map((tick) => (
                  <g key={tick.id}>
                    <line
                      x1={chart.padL}
                      x2={chart.W - chart.padR}
                      y1={tick.y}
                      y2={tick.y}
                      stroke="rgba(148, 163, 184, 0.12)"
                      strokeWidth="1"
                    />
                    <text
                      x={chart.padL - 6}
                      y={tick.y + 3.5}
                      textAnchor="end"
                      fill="rgba(167, 180, 200, 0.8)"
                      fontSize={axisFontSize}
                      fontFamily="monospace"
                    >
                      {tick.val}
                    </text>
                  </g>
                ))}

                {chart.zeroY !== null && (
                  <line
                    x1={chart.padL}
                    x2={chart.W - chart.padR}
                    y1={chart.zeroY}
                    y2={chart.zeroY}
                    stroke="rgba(56, 189, 248, 0.45)"
                    strokeDasharray="4 4"
                    strokeWidth="1.2"
                  />
                )}

                {chart.xTicks.map((xt) => (
                  <g key={xt.time}>
                    <line
                      x1={xt.x}
                      x2={xt.x}
                      y1={chart.padT}
                      y2={chart.H - chart.padB}
                      stroke="rgba(148, 163, 184, 0.08)"
                      strokeWidth="1"
                    />
                    <text
                      x={xt.x}
                      y={chart.H - 9}
                      textAnchor={xt.anchor}
                      fill="rgba(167, 180, 200, 0.78)"
                      fontSize={axisFontSize}
                      fontFamily="monospace"
                    >
                      {xt.label}
                    </text>
                  </g>
                ))}

                {chart.envelopePath && (
                  <path
                    d={chart.envelopePath}
                    fill="rgba(56, 189, 248, 0.10)"
                    stroke="rgba(56, 189, 248, 0.16)"
                    strokeWidth="0.7"
                  />
                )}

                <g key={`${location.id}-${resolvedProvinceCode ?? "loc"}-${tab}-${horizonHours}-${unit}`}>
                  {CORE_MODEL_KEYS.map((k) => {
                    if (!visibleModels[k] || !chart.paths[k]) return null;
                    return (
                      <path
                        key={k}
                        d={chart.paths[k]}
                        fill="none"
                        stroke={CORE_MODEL_META[k].color}
                        strokeWidth={k === "ecmwfIfs" || k === "ecmwfAifs" ? 2.3 : 1.75}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className="atmos-line-draw"
                      />
                    );
                  })}
                </g>

                <line
                  x1={chart.xAt(clampedIdx)}
                  x2={chart.xAt(clampedIdx)}
                  y1={chart.padT}
                  y2={chart.H - chart.padB}
                  stroke="rgba(243, 246, 251, 0.52)"
                  strokeDasharray="3 3"
                  strokeWidth="1.2"
                />

                {inspectedValues &&
                  CORE_MODEL_KEYS.map((k) => {
                    if (!visibleModels[k]) return null;
                    const val = inspectedValues.map[k];
                    if (val === null || val === undefined) return null;
                    const cx = chart.xAt(clampedIdx);
                    const cy = chart.yAt(val);
                    return (
                      <g key={`node-${k}`}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={6.5}
                          fill={CORE_MODEL_META[k].color}
                          fillOpacity={0.22}
                        />
                        <circle
                          cx={cx}
                          cy={cy}
                          r={3.2}
                          fill={CORE_MODEL_META[k].color}
                          stroke="#070b14"
                          strokeWidth="1.4"
                        />
                      </g>
                    );
                  })}
              </svg>
            </div>
            {horizonHours > 72 && (
              <p className="mt-1.5 px-2 font-mono text-[10px] text-ink-muted">
                Doğal model vade sınırları: AROME/ARP 114s (4.8g) · UKMO 168s (7g) · ICON 192s (8g) · GEM 252s (10.5g) · JMA 270s (11.2g) · ECMWF IFS / AIFS AI / NOAA GFS 360s (15g)
              </p>
            )}
          </div>

          {horizonSummary && (
            <div className="grid gap-3 sm:grid-cols-3 text-xs font-mono tabular">
              <div className="surface-tile p-3.5 space-y-1.5">
                <span className="text-[11px] text-ink-muted">
                  {horizonHours} Saat Toplam Yağış ({unit === "imperial" ? "in" : "mm"})
                </span>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {horizonSummary.activeModelKeys.map((k) => {
                    const item = horizonSummary.precipByModel[k];
                    return (
                      <span key={k} style={{ color: CORE_MODEL_META[k].color }}>
                        {CORE_MODEL_META[k].shortLabel}: {item.formatted}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="surface-tile p-3.5 space-y-1.5">
                <span className="text-[11px] text-ink-muted">
                  En Düşük 850 hPa ({horizonHours}s · {unit === "imperial" ? "°F" : "°C"})
                </span>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {horizonSummary.activeModelKeys.map((k) => {
                    const item = horizonSummary.min850ByModel[k];
                    return (
                      <span key={k} style={{ color: CORE_MODEL_META[k].color }}>
                        {CORE_MODEL_META[k].shortLabel}: {item.formatted}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="surface-tile p-3.5 space-y-1.5">
                <span className="text-[11px] text-ink-muted">
                  Maks. 2m {horizonSummary.activeModelKeys.length}-Model Sapması ({horizonHours}s)
                </span>
                {horizonSummary.maxSpreadTemp2mC !== null ? (
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-ink-primary">
                      Δ{horizonSummary.maxSpreadFormatted}{" "}
                      <span className="text-[11px] font-normal text-ink-muted">
                        ({horizonSummary.maxSpreadTemp2mC <= 2.5
                          ? "Yüksek uzlaşı"
                          : horizonSummary.maxSpreadTemp2mC <= 5
                            ? "Orta belirsizlik"
                            : "Yüksek ayrışma"})
                      </span>
                    </p>
                    {horizonSummary.maxSpreadTimeLabel && (
                      <p className="text-[11px] text-ink-muted">
                        Zirve ayrışma: {horizonSummary.maxSpreadTimeLabel}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-ink-muted">
                    — (Karşılaştırma için en az 2 model seçin)
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

const ModelComparisonChart = memo(ModelComparisonChartBase);
export default ModelComparisonChart;
