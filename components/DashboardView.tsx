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
  Clock,
  Droplets,
  Plus,
  RefreshCw,
  Trash2,
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
import {
  resolveActiveTemporalView,
  type ActiveTemporalView
} from "@/lib/temporal-view";
import {
  ATMOS_REFRESH_ALL_EVENT,
  buildWeatherApiUrl,
  canonicalizeStationIdentity,
  createFastZonedTimeResolver,
  formatElevation,
  formatPressure,
  formatTemperature,
  formatWindSpeed
} from "@/lib/weather-client";
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

const MPH_PER_KMH = 0.621371;

function formatStationLocalClock(
  timezone: string | undefined,
  utcOffsetSeconds: number | undefined,
  nowMs: number
): string {
  const safeOffset =
    typeof utcOffsetSeconds === "number" && Number.isFinite(utcOffsetSeconds)
      ? utcOffsetSeconds
      : 0;
  const effectiveTz =
    timezone === "UTC" && safeOffset !== 0 ? undefined : timezone;
  try {
    return createFastZonedTimeResolver(effectiveTz, safeOffset).epochMsToLocalParts(
      nowMs
    ).hm;
  } catch {
    return "--:--";
  }
}

function stationAccentBorder(tv: ActiveTemporalView, isStaleCard: boolean): string {
  if (isStaleCard) return "border-t-signal-amber/55";
  if (tv.telemetry.isStorm || tv.stormChip.score >= 35) return "border-t-signal-amber/70";
  if (tv.telemetry.precipType !== "none") return "border-t-signal-sky/60";
  return "border-t-white/10";
}

function stationAmbientGlow(tv: ActiveTemporalView): string {
  if (tv.telemetry.isStorm || tv.stormChip.score >= 50) {
    return "radial-gradient(280px circle at 85% 0%, rgba(245, 158, 11, 0.16), transparent 70%)";
  }
  if (tv.telemetry.precipType === "snow" || tv.telemetry.temperature <= 1) {
    return "radial-gradient(280px circle at 85% 0%, rgba(186, 230, 253, 0.16), transparent 70%)";
  }
  if (tv.telemetry.precipType === "rain") {
    return "radial-gradient(280px circle at 85% 0%, rgba(56, 189, 248, 0.16), transparent 70%)";
  }
  if (tv.telemetry.solarElevationDeg > 4 && tv.telemetry.cloudCover < 65) {
    return "radial-gradient(280px circle at 85% 0%, rgba(251, 191, 36, 0.15), transparent 70%)";
  }
  if (tv.telemetry.solarElevationDeg < -4) {
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
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-24 sm:w-32 shrink-0 overflow-visible" aria-hidden="true">
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

export function normalizeName(value: string | undefined | null): string {
  return (value ?? "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/g, " ");
}

/**
 * 3 kademeli kırılmaz alarm-istasyon eşleştiricisi:
 * 1) `rule.cityId === c.id`
 * 2) `rule.lat !== undefined && areLocationsEquivalent(rule, c)`
 * 3) `normalizeName(rule.cityName) === normalizeName(c.name)`
 * Eşleşme favorilerde henüz yoksa `activeBundle` üzerinden de aynı 3 kademeyi dener.
 */
export function resolveBundleForAlertRule(
  rule: WeatherAlertRule,
  favorites: GeoLocation[],
  bundlesMap: Record<string, WeatherBundle>,
  activeBundle: WeatherBundle | null
): WeatherBundle | undefined {
  // Kademe 1: Doğrudan ID eşleşmesi
  const directFav = favorites.find((c) => rule.cityId === c.id);
  if (directFav && bundlesMap[directFav.id]) {
    return bundlesMap[directFav.id];
  }
  if (bundlesMap[rule.cityId]) {
    return bundlesMap[rule.cityId];
  }

  // Kademe 2: Koordinat + rakım (< 65m) eşdeğerliği
  if (
    rule.lat !== undefined &&
    rule.lon !== undefined &&
    Number.isFinite(rule.lat) &&
    Number.isFinite(rule.lon)
  ) {
    const ruleGeo = {
      lat: rule.lat,
      lon: rule.lon,
      elevation: rule.elevation
    };
    const coordFav = favorites.find((c) => areLocationsEquivalent(ruleGeo, c));
    if (coordFav && bundlesMap[coordFav.id]) {
      return bundlesMap[coordFav.id];
    }
    for (const candidate of Object.values(bundlesMap)) {
      if (areLocationsEquivalent(ruleGeo, candidate.location)) {
        return candidate;
      }
    }
  }

  // Kademe 3: Normalize şehir adı eşleşmesi
  const targetName = normalizeName(rule.cityName);
  if (targetName) {
    const nameFav = favorites.find((c) => normalizeName(c.name) === targetName);
    if (nameFav && bundlesMap[nameFav.id]) {
      return bundlesMap[nameFav.id];
    }
    for (const candidate of Object.values(bundlesMap)) {
      if (normalizeName(candidate.location.name) === targetName) {
        return candidate;
      }
    }
  }

  // Aktif bağlam paketi yedeği (istasyon favorilerden silinmiş ama aktif seçiliyse)
  if (activeBundle) {
    if (activeBundle.location.id === rule.cityId) {
      return activeBundle;
    }
    if (
      rule.lat !== undefined &&
      rule.lon !== undefined &&
      areLocationsEquivalent(
        { lat: rule.lat, lon: rule.lon, elevation: rule.elevation },
        activeBundle.location
      )
    ) {
      return activeBundle;
    }
    if (targetName && normalizeName(activeBundle.location.name) === targetName) {
      return activeBundle;
    }
  }

  return undefined;
}

export function getSmartDefaultThreshold(
  metric: AlertMetric,
  operator: ">" | "<",
  unit: UnitSystem
): number {
  if (metric === "temperature") {
    if (operator === "<") {
      return unit === "imperial" ? 32 : 0;
    }
    return unit === "imperial" ? 86 : 30;
  }
  if (metric === "windSpeed") {
    if (operator === "<") {
      return unit === "imperial" ? 6 : 10;
    }
    return unit === "imperial" ? 28 : 45;
  }
  if (metric === "precipProbability") {
    return operator === "<" ? 20 : 70;
  }
  return operator === "<" ? 25 : 60;
}

/**
 * Kayıpsız tam IEEE-754 metrik eşik dönüşümü (ara yuvarlama YOK!):
 * Örn: 76°F -> 24.444444444444443°C
 */
export function toMetricThreshold(
  metric: AlertMetric,
  rawNumericInput: number,
  unit: UnitSystem
): number {
  if (unit === "imperial") {
    if (metric === "temperature") {
      return ((rawNumericInput - 32) * 5) / 9;
    }
    if (metric === "windSpeed") {
      return rawNumericInput / MPH_PER_KMH;
    }
  }
  return rawNumericInput;
}

function convertMetricScalarToDisplay(
  metric: AlertMetric,
  metricValue: number,
  unit: UnitSystem
): number {
  if (unit === "imperial") {
    if (metric === "temperature") {
      return (metricValue * 9) / 5 + 32;
    }
    if (metric === "windSpeed") {
      return metricValue * MPH_PER_KMH;
    }
  }
  return metricValue;
}

function roundSingleStep(value: number, decimals: number): number {
  const factor = 10 ** Math.max(0, decimals);
  const rounded = Math.round(value * factor) / factor;
  return Math.abs(rounded) < 1e-9 ? 0 : rounded;
}

function resolveAlertRuleDecimals(rule: WeatherAlertRule): number {
  if (rule.metric !== "temperature") return 0;
  if (rule.sourceValue !== undefined && Number.isFinite(rule.sourceValue)) {
    return Math.abs(rule.sourceValue - Math.round(rule.sourceValue)) > 1e-6 ? 1 : 0;
  }
  if (rule.sourceUnit === undefined) {
    return Math.abs(rule.threshold - Math.round(rule.threshold)) > 1e-6 ? 1 : 0;
  }
  return 0;
}

export function toDisplayRuleThreshold(
  rule: WeatherAlertRule,
  unit: UnitSystem
): number {
  const decimals = resolveAlertRuleDecimals(rule);
  const rawDisplay =
    rule.sourceUnit === unit &&
    rule.sourceValue !== undefined &&
    Number.isFinite(rule.sourceValue)
      ? rule.sourceValue
      : convertMetricScalarToDisplay(rule.metric, rule.threshold, unit);
  return roundSingleStep(rawDisplay, decimals);
}

/**
 * Sıfır-sapmalı görüntü uzayı değerlendirmesi:
 * Hem `currentDisplayVal` hem `thresholdDisplayVal` aynı tek adımlı yuvarlamadan geçer;
 * böylece `6 mph > 6 mph` paradoksu %100 imkânsızdır ve karttaki değer ile birebir örtüşür.
 */
export function evaluateRule(
  rule: WeatherAlertRule,
  bundle: WeatherBundle | undefined,
  unit: UnitSystem,
  precomputedTemporalView?: ActiveTemporalView
): { triggered: boolean; currentVal: number | null; displayThreshold: number } {
  const decimals = resolveAlertRuleDecimals(rule);
  const thresholdDisplayVal = toDisplayRuleThreshold(rule, unit);

  if (!bundle) {
    return { triggered: false, currentVal: null, displayThreshold: thresholdDisplayVal };
  }

  const tv = precomputedTemporalView ?? resolveActiveTemporalView(bundle, 0);
  let rawMetricVal = 0;
  if (rule.metric === "temperature") {
    rawMetricVal = tv.telemetry.temperature;
  } else if (rule.metric === "windSpeed") {
    rawMetricVal = tv.telemetry.windSpeed;
  } else if (rule.metric === "precipProbability") {
    rawMetricVal = tv.telemetry.precipProbability;
  } else {
    rawMetricVal = bundle.airQuality.europeanAqi;
  }

  const rawCurrentDisplay = convertMetricScalarToDisplay(rule.metric, rawMetricVal, unit);
  const currentDisplayVal = roundSingleStep(rawCurrentDisplay, decimals);

  if (!rule.enabled) {
    return {
      triggered: false,
      currentVal: currentDisplayVal,
      displayThreshold: thresholdDisplayVal
    };
  }

  const triggered =
    rule.operator === ">"
      ? currentDisplayVal > thresholdDisplayVal
      : currentDisplayVal < thresholdDisplayVal;

  return {
    triggered,
    currentVal: currentDisplayVal,
    displayThreshold: thresholdDisplayVal
  };
}

function mergeStationIntoBundle(data: WeatherBundle, loc: GeoLocation): WeatherBundle {
  return {
    ...data,
    location: {
      ...data.location,
      ...loc,
      elevation: loc.elevation ?? data.location.elevation,
      timezone: data.location.timezone ?? loc.timezone
    }
  };
}

export default function DashboardView() {
  const router = useRouter();
  const {
    bundle: activeContextBundle,
    activeLocation,
    favorites,
    addFavorite,
    removeFavorite,
    setActiveLocation,
    syncExternalBundle,
    alerts,
    addAlert,
    removeAlert,
    toggleAlert,
    unit
  } = useWeatherData();
  const { recoveryCount, isOffline } = useWeatherStatus();

  const [cityBundles, setCityBundles] = useState<Record<string, WeatherBundle>>({});
  const [failedCities, setFailedCities] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(() => new Set());
  const [loadingMap, setLoadingMap] = useState(false);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [clockNowMs, setClockNowMs] = useState<number>(() => Date.now());

  const mountedRef = useRef(true);
  const inFlightCountRef = useRef(0);
  const cityAbortMapRef = useRef<Map<string, AbortController>>(new Map());
  const bundlesRef = useRef<Record<string, WeatherBundle>>({});
  const favoritesRef = useRef<GeoLocation[]>(favorites);
  const activeContextBundleRef = useRef<WeatherBundle | null>(activeContextBundle);
  const activeLocationRef = useRef<GeoLocation>(activeLocation);
  const isOfflineRef = useRef<boolean>(isOffline);

  useEffect(() => {
    bundlesRef.current = cityBundles;
  }, [cityBundles]);

  useEffect(() => {
    favoritesRef.current = favorites;
  }, [favorites]);

  useEffect(() => {
    activeContextBundleRef.current = activeContextBundle;
  }, [activeContextBundle]);

  useEffect(() => {
    activeLocationRef.current = activeLocation;
  }, [activeLocation]);

  useEffect(() => {
    isOfflineRef.current = isOffline;
  }, [isOffline]);

  // Unmount anında açık tüm ağ isteklerini iptal et
  useEffect(() => {
    mountedRef.current = true;
    const abortMap = cityAbortMapRef.current;
    return () => {
      mountedRef.current = false;
      for (const ctrl of abortMap.values()) {
        ctrl.abort();
      }
      abortMap.clear();
      inFlightCountRef.current = 0;
    };
  }, []);

  // Sayfa görünürken 30 saniyede bir canlı yerel duvar saatini ilerlet
  useEffect(() => {
    const tick = () => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      setClockNowMs(Date.now());
    };
    const timer = window.setInterval(tick, 30_000);
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        setClockNowMs(Date.now());
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Favoriden silinen istasyonun devam eden isteğini iptal et ve hata/önbellek haritasından anında temizle
  useEffect(() => {
    const activeIds = new Set(favorites.map((f) => f.id));

    for (const [cityId, ctrl] of cityAbortMapRef.current.entries()) {
      if (!activeIds.has(cityId)) {
        ctrl.abort();
        cityAbortMapRef.current.delete(cityId);
      }
    }

    queueMicrotask(() => {
      setFailedCities((prev) => {
        const keys = Object.keys(prev);
        if (keys.every((k) => activeIds.has(k))) return prev;
        const next: Record<string, string> = {};
        for (const k of keys) {
          if (activeIds.has(k)) next[k] = prev[k];
        }
        return next;
      });

      setCityBundles((prev) => {
        const keys = Object.keys(prev);
        if (keys.every((k) => activeIds.has(k))) return prev;
        const next: Record<string, WeatherBundle> = {};
        for (const k of keys) {
          if (activeIds.has(k)) next[k] = prev[k];
        }
        bundlesRef.current = next;
        return next;
      });
    });
  }, [favorites]);

  // İleri Yön Senkronu: WeatherContext'teki aktif istasyon güncellendiğinde eşleşen favori kartını anında güncelle
  useEffect(() => {
    if (!activeContextBundle) return;
    const matchedFavs = favorites.filter((c) =>
      areLocationsEquivalent(c, activeContextBundle.location)
    );
    if (matchedFavs.length === 0) return;

    queueMicrotask(() => {
    setCityBundles((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const fav of matchedFavs) {
        const cur = prev[fav.id];
        if (
          !cur ||
          cur.fetchedAt !== activeContextBundle.fetchedAt ||
          cur.current.time !== activeContextBundle.current.time ||
          cur.current.temperature !== activeContextBundle.current.temperature ||
          cur.freshness?.status !== activeContextBundle.freshness?.status
        ) {
          next[fav.id] = mergeStationIntoBundle(activeContextBundle, fav);
          changed = true;
        }
      }
      if (!changed) return prev;
      bundlesRef.current = next;
      return next;
    });

    setFailedCities((prev) => {
      const hasFailedMatch = matchedFavs.some((f) => f.id in prev);
      if (!hasFailedMatch) return prev;
      const next = { ...prev };
      for (const fav of matchedFavs) {
        delete next[fav.id];
      }
      return next;
    });
    });
  }, [activeContextBundle, favorites]);

  // Yeni eşik form state (metin tamponlu, negatif / ondalık dostu)
  const [alertCityId, setAlertCityId] = useState(favorites[0]?.id ?? "");
  const [alertMetric, setAlertMetric] = useState<AlertMetric>("windSpeed");
  const [alertOperator, setAlertOperator] = useState<">" | "<">(">");
  const [thresholdInput, setThresholdInput] = useState<string>(() =>
    String(getSmartDefaultThreshold("windSpeed", ">", unit))
  );
  const [isCustomThreshold, setIsCustomThreshold] = useState(false);
  const [thresholdError, setThresholdError] = useState<string | null>(null);
  const prevUnitRef = useRef<UnitSystem>(unit);

  useEffect(() => {
    if (prevUnitRef.current === unit) return;
    prevUnitRef.current = unit;
    if (!isCustomThreshold) {
      queueMicrotask(() => {
        setThresholdInput(String(getSmartDefaultThreshold(alertMetric, alertOperator, unit)));
      });
    }
  }, [unit, alertMetric, alertOperator, isCustomThreshold]);

  const effectiveAlertCityId = favorites.some((f) => f.id === alertCityId)
    ? alertCityId
    : (favorites[0]?.id ?? "");

  // Kilitlenmeyen (deadlock-free) istasyon yükleyici
  const fetchCityList = useCallback(
    async (list: GeoLocation[], forceAll = false) => {
      if (!mountedRef.current || list.length === 0) {
        if (mountedRef.current) {
          setLoadingMap(inFlightCountRef.current > 0);
        }
        return;
      }

      const nowMs = Date.now();
      const ctxBundle = activeContextBundleRef.current;
      const offlineNow = isOfflineRef.current;
      const hydratedSeed: Record<string, WeatherBundle> = {};

      for (const loc of list) {
        if (!forceAll && bundlesRef.current[loc.id]) continue;
        if (
          !forceAll &&
          ctxBundle &&
          areLocationsEquivalent(ctxBundle.location, loc)
        ) {
          hydratedSeed[loc.id] = mergeStationIntoBundle(ctxBundle, loc);
          continue;
        }
        if (!forceAll) {
          const syncHit = readCachedWeatherBundleSync(loc, nowMs, {
            forceStale: offlineNow
          });
          if (syncHit) {
            hydratedSeed[loc.id] = mergeStationIntoBundle(syncHit, loc);
          }
        }
      }

      if (Object.keys(hydratedSeed).length > 0 && mountedRef.current) {
        setCityBundles((prev) => {
          const next = { ...prev, ...hydratedSeed };
          bundlesRef.current = next;
          return next;
        });
        setFailedCities((prev) => {
          const hasAny = Object.keys(hydratedSeed).some((id) => id in prev);
          if (!hasAny) return prev;
          const next = { ...prev };
          for (const id of Object.keys(hydratedSeed)) {
            delete next[id];
          }
          return next;
        });
      }

      const toFetch = list.filter((loc) => {
        if (forceAll) return true;
        if (cityAbortMapRef.current.has(loc.id)) return false;
        const cur = hydratedSeed[loc.id] ?? bundlesRef.current[loc.id];
        if (!cur) return true;
        return (cur.freshness?.status ?? "live") !== "live";
      });

      if (toFetch.length === 0) {
        if (mountedRef.current) {
          setLoadingMap(inFlightCountRef.current > 0);
        }
        return;
      }

      const CONCURRENCY = 2;
      let cursor = 0;

      const worker = async () => {
        while (cursor < toFetch.length) {
          if (!mountedRef.current) return;
          const loc = toFetch[cursor++];

          if (forceAll) {
            const existingCtrl = cityAbortMapRef.current.get(loc.id);
            if (existingCtrl) {
              existingCtrl.abort();
              cityAbortMapRef.current.delete(loc.id);
            }
          } else if (cityAbortMapRef.current.has(loc.id)) {
            continue;
          }

          const controller = new AbortController();
          cityAbortMapRef.current.set(loc.id, controller);
          inFlightCountRef.current += 1;

          if (mountedRef.current) {
            setLoadingMap(true);
            setLoadingIds((prev) => {
              if (prev.has(loc.id)) return prev;
              const next = new Set(prev);
              next.add(loc.id);
              return next;
            });
          }

          try {
            const res = await fetch(buildWeatherApiUrl(loc), {
              signal: controller.signal,
              cache: forceAll ? "no-store" : "default"
            });
            if (controller.signal.aborted || !mountedRef.current) return;
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}`);
            }

            const data: WeatherBundle = await res.json();
            if (controller.signal.aborted || !mountedRef.current) return;

            const isStillFavorite = favoritesRef.current.some((f) => f.id === loc.id);
            const merged = mergeStationIntoBundle(data, loc);

            if ((merged.freshness?.status ?? "live") === "live") {
              writeCachedWeatherBundle(merged);
            }

            if (isStillFavorite) {
              setCityBundles((prev) => {
                const next = { ...prev, [loc.id]: merged };
                bundlesRef.current = next;
                return next;
              });
              setFailedCities((prev) => {
                if (!(loc.id in prev)) return prev;
                const next = { ...prev };
                delete next[loc.id];
                return next;
              });
            }

            // Ters Yön Senkronu: Yenilenen kart aktif istasyonla eşleşiyorsa WeatherContext'e taze paketi aktar
            if (areLocationsEquivalent(loc, activeLocationRef.current)) {
              syncExternalBundle(merged);
            }
          } catch (err) {
            if (
              controller.signal.aborted ||
              !mountedRef.current ||
              (err instanceof Error && err.name === "AbortError")
            ) {
              return;
            }

            const isStillFavorite = favoritesRef.current.some((f) => f.id === loc.id);
            if (!isStillFavorite) return;

            const errText = err instanceof Error ? err.message : "Bağlantı hatası";
            const existing = bundlesRef.current[loc.id];

            if (existing) {
              const reanchored = reanchorWeatherBundleToNow(
                existing,
                Date.now(),
                {
                  status: "stale",
                  sourceTier:
                    existing.freshness?.sourceTier === "live"
                      ? "client-cache"
                      : (existing.freshness?.sourceTier ?? "client-cache"),
                  cachedAtMs:
                    existing.freshness?.cachedAtMs ??
                    Date.parse(existing.fetchedAt),
                  staleReason: errText,
                  modelsRespondedCount: existing.hybrid.activeModels.length
                }
              );
              setCityBundles((prev) => {
                const next = { ...prev, [loc.id]: reanchored };
                bundlesRef.current = next;
                return next;
              });
            } else {
              const idbFallback = await readCachedWeatherBundleAsync(
                loc,
                Date.now(),
                { forceStale: true, staleReason: errText }
              );
              if (controller.signal.aborted || !mountedRef.current) return;
              if (!favoritesRef.current.some((f) => f.id === loc.id)) return;

              if (idbFallback) {
                const mergedFallback = mergeStationIntoBundle(idbFallback, loc);
                setCityBundles((prev) => {
                  const next = { ...prev, [loc.id]: mergedFallback };
                  bundlesRef.current = next;
                  return next;
                });
                setFailedCities((prev) => {
                  if (!(loc.id in prev)) return prev;
                  const next = { ...prev };
                  delete next[loc.id];
                  return next;
                });
              } else {
                setFailedCities((prev) => ({ ...prev, [loc.id]: errText }));
              }
            }
          } finally {
            if (cityAbortMapRef.current.get(loc.id) === controller) {
              cityAbortMapRef.current.delete(loc.id);
            }
            inFlightCountRef.current = Math.max(0, inFlightCountRef.current - 1);
            if (mountedRef.current) {
              setLoadingIds((prev) => {
                if (!prev.has(loc.id)) return prev;
                const next = new Set(prev);
                next.delete(loc.id);
                return next;
              });
              setLoadingMap(inFlightCountRef.current > 0);
            }
          }
        }
      };

      await Promise.all(
        Array.from({ length: Math.min(CONCURRENCY, toFetch.length) }, () =>
          worker()
        )
      );
    },
    [syncExternalBundle]
  );

  // Favoriler değiştiğinde yeni istasyonları yükle
  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void fetchCityList(favorites, false);
    });
    return () => {
      cancelled = true;
    };
  }, [favorites, fetchCityList]);

  // Canlı bağlantı kurtarıldığında tüm istasyonları tazele
  useEffect(() => {
    if (recoveryCount <= 0) return;
    queueMicrotask(() => {
      void fetchCityList(favoritesRef.current, true);
    });
  }, [recoveryCount, fetchCityList]);

  // Küresel `ATMOS_REFRESH_ALL_EVENT` olayını dinleyerek tüm favorileri tazele
  useEffect(() => {
    const onRefreshAll = () => {
      void fetchCityList(favoritesRef.current, true);
    };
    window.addEventListener(ATMOS_REFRESH_ALL_EVENT, onRefreshAll);
    return () => {
      window.removeEventListener(ATMOS_REFRESH_ALL_EVENT, onRefreshAll);
    };
  }, [fetchCityList]);

  const hasImpairedStation = useMemo(
    () =>
      Object.keys(failedCities).length > 0 ||
      Object.values(cityBundles).some(
        (b) => (b.freshness?.status ?? "live") !== "live"
      ),
    [cityBundles, failedCities]
  );

  useEffect(() => {
    if (isOffline || !hasImpairedStation || loadingMap) return;
    const timer = window.setTimeout(() => {
      const targetCities = favoritesRef.current.filter((c) => {
        const b = bundlesRef.current[c.id];
        return !b || (b.freshness?.status ?? "live") !== "live";
      });
      if (targetCities.length > 0) {
        void fetchCityList(targetCities, true);
      }
    }, 20_000);
    return () => window.clearTimeout(timer);
  }, [isOffline, hasImpairedStation, loadingMap, fetchCityList]);

  // Her istasyon için deterministik `resolveActiveTemporalView(b, 0)` önbelleği
  const temporalByCityId = useMemo<Record<string, ActiveTemporalView>>(() => {
    const map: Record<string, ActiveTemporalView> = {};
    for (const [id, b] of Object.entries(cityBundles)) {
      map[id] = resolveActiveTemporalView(b, 0);
    }
    return map;
  }, [cityBundles]);

  const loadedStations = useMemo(
    () =>
      favorites
        .map((city) => {
          const bundle = cityBundles[city.id];
          const tv = temporalByCityId[city.id];
          return bundle && tv ? { city, bundle, tv } : null;
        })
        .filter(
          (
            entry
          ): entry is {
            city: GeoLocation;
            bundle: WeatherBundle;
            tv: ActiveTemporalView;
          } => Boolean(entry)
        ),
    [favorites, cityBundles, temporalByCityId]
  );

  const extremes = useMemo(() => {
    if (loadedStations.length === 0) return null;
    const hottest = [...loadedStations].sort(
      (a, b) => b.tv.telemetry.temperature - a.tv.telemetry.temperature
    )[0];
    const coldest = [...loadedStations].sort(
      (a, b) => a.tv.telemetry.temperature - b.tv.telemetry.temperature
    )[0];
    const windiest = [...loadedStations].sort(
      (a, b) => b.tv.telemetry.windSpeed - a.tv.telemetry.windSpeed
    )[0];
    const wettest = [...loadedStations].sort(
      (a, b) => b.tv.telemetry.precipProbability - a.tv.telemetry.precipProbability
    )[0];
    return { hottest, coldest, windiest, wettest };
  }, [loadedStations]);

  const evaluatedAlerts = useMemo(
    () =>
      alerts.map((rule) => {
        const matchedBundle = resolveBundleForAlertRule(
          rule,
          favorites,
          cityBundles,
          activeContextBundle
        );
        const precomputedTv = matchedBundle
          ? temporalByCityId[matchedBundle.location.id]
          : undefined;
        return {
          rule,
          ...evaluateRule(rule, matchedBundle, unit, precomputedTv)
        };
      }),
    [alerts, favorites, cityBundles, activeContextBundle, temporalByCityId, unit]
  );

  const activeTriggered = evaluatedAlerts.filter((e) => e.triggered);

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const city = favorites.find((f) => f.id === effectiveAlertCityId);
    if (!city) return;

    const normalizedRaw = thresholdInput.trim().replace(",", ".");
    const rawNumericInput = Number(normalizedRaw);
    if (normalizedRaw === "" || !Number.isFinite(rawNumericInput)) {
      setThresholdError("Geçerli bir sayısal eşik girin (ör. -5 veya 32).");
      return;
    }
    if (alertMetric !== "temperature" && rawNumericInput < 0) {
      setThresholdError("Bu parametre için eşik değeri 0 veya üzerinde olmalıdır.");
      return;
    }
    if (alertMetric === "precipProbability" && rawNumericInput > 100) {
      setThresholdError("Yağış olasılığı eşiği en fazla %100 olabilir.");
      return;
    }

    const canonicalCity = canonicalizeStationIdentity(city);
    const cityBundle = bundlesRef.current[city.id] ?? cityBundles[city.id];
    const resolvedElevation =
      city.elevation ?? canonicalCity.elevation ?? cityBundle?.location.elevation;

    addAlert({
      cityId: city.id,
      cityName: city.name,
      lat: city.lat,
      lon: city.lon,
      ...(resolvedElevation !== undefined && Number.isFinite(resolvedElevation)
        ? { elevation: Math.round(resolvedElevation) }
        : {}),
      metric: alertMetric,
      operator: alertOperator,
      threshold: toMetricThreshold(alertMetric, rawNumericInput, unit),
      sourceUnit: unit,
      sourceValue: rawNumericInput,
      enabled: true
    });

    setThresholdError(null);
    setIsCustomThreshold(false);
    setShowAlertForm(false);
  };

  const openCityOnRoute = (city: GeoLocation, route: "/" | "/lab") => {
    const cityBundle = bundlesRef.current[city.id] ?? cityBundles[city.id] ?? null;
    setActiveLocation(city, cityBundle);
    router.push(buildLocationHref(route, city));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Kompakt Üst Başlık & İstasyon Ekle (z-30 ile CitySearch menüsü tüm cam kartların üstünde açılır) */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-3">
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
              {extremes.hottest.city.name} ·{" "}
              <span className="font-mono text-signal-amber">
                {formatTemperature(extremes.hottest.tv.telemetry.temperature, unit)}
              </span>
            </p>
          </div>
          <div className="surface-panel p-4">
            <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              En Serin
            </p>
            <p className="mt-1.5 font-display text-base font-semibold text-ink-primary tabular">
              {extremes.coldest.city.name} ·{" "}
              <span className="font-mono text-signal-sky">
                {formatTemperature(extremes.coldest.tv.telemetry.temperature, unit)}
              </span>
            </p>
          </div>
          <div className="surface-panel p-4">
            <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              En Rüzgarlı
            </p>
            <p className="mt-1.5 font-display text-base font-semibold text-ink-primary tabular">
              {extremes.windiest.city.name} ·{" "}
              <span className="font-mono text-ink-primary">
                {formatWindSpeed(extremes.windiest.tv.telemetry.windSpeed, unit)}
              </span>
            </p>
          </div>
          <div className="surface-panel p-4">
            <p className="text-[11px] font-mono uppercase tracking-wider text-ink-muted">
              Yağış Olasılığı
            </p>
            <p className="mt-1.5 font-display text-base font-semibold text-ink-primary tabular">
              {extremes.wettest.city.name} ·{" "}
              <span className="font-mono text-signal-emerald">
                %{Math.round(extremes.wettest.tv.telemetry.precipProbability)}
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
          const isCityLoading = loadingIds.has(city.id);

          if (!b && err) {
            return (
              <div
                key={city.id}
                className="surface-panel min-h-[312px] p-5 flex flex-col justify-between space-y-4 border-signal-rose/30"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-ink-primary">
                      {city.name}
                    </h2>
                    <p className="text-xs text-ink-muted">
                      {city.country}
                      {city.elevation !== undefined
                        ? ` · ${formatElevation(city.elevation, unit)}`
                        : ""}
                    </p>
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
                  Kayıtlı önbellek yok ({err}). Bağlantı sağlandığında otomatik yüklenecek.
                </p>
                <button
                  type="button"
                  disabled={isCityLoading}
                  onClick={() => void fetchCityList([city], true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-medium text-ink-primary hover:bg-white/[0.08] disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isCityLoading ? "animate-spin" : ""}`} />
                  <span>Tekrar Dene</span>
                </button>
              </div>
            );
          }

          if (!b) {
            return (
              <div
                key={city.id}
                className="surface-panel min-h-[312px] p-5 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="h-5 w-32 rounded bg-white/[0.06]" />
                  <div className="h-3.5 w-48 rounded bg-white/[0.04]" />
                </div>
                <div className="space-y-2">
                  <div className="h-12 w-24 rounded bg-white/[0.06]" />
                  <div className="h-4 w-36 rounded bg-white/[0.04]" />
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="h-12 rounded bg-white/[0.04]" />
                  <div className="h-12 rounded bg-white/[0.04]" />
                  <div className="h-12 rounded bg-white/[0.04]" />
                  <div className="h-12 rounded bg-white/[0.04]" />
                </div>
                <div className="h-9 w-full rounded bg-white/[0.04]" />
              </div>
            );
          }

          const tv = temporalByCityId[city.id] ?? resolveActiveTemporalView(b, 0);
          const isStaleCard =
            isOffline || (b.freshness?.status ?? "live") === "stale";
          const stationElev = city.elevation ?? b.location.elevation;

          return (
            <article
              key={city.id}
              style={{ backgroundImage: stationAmbientGlow(tv) }}
              className={`surface-panel min-h-[312px] border-t-2 p-5 flex flex-col justify-between space-y-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/25 ${stationAccentBorder(tv, isStaleCard)}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold text-ink-primary">
                      {city.name}
                    </h2>
                    {isStaleCard && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-signal-amber/35 bg-signal-amber/12 px-1.5 py-0.5 font-mono text-[10px] text-amber-200 tabular">
                        <Clock className="h-2.5 w-2.5 text-signal-amber" />
                        <span>Arşiv · {formatFreshnessAgeTr(b.fetchedAt)}</span>
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-[11px] text-ink-muted tabular">
                    {city.country}
                    {stationElev !== undefined && Number.isFinite(stationElev)
                      ? ` · ${formatElevation(stationElev, unit)}`
                      : ""}
                    {" · "}Yerel{" "}
                    {formatStationLocalClock(b.timezone, b.utcOffsetSeconds, clockNowMs)} ·{" "}
                    {formatPressure(tv.telemetry.pressure, unit)}{" "}
                    {tv.telemetry.pressureTrend.includes("yükseliyor") ? (
                      <ArrowUpRight className="inline h-3 w-3 text-signal-emerald" />
                    ) : tv.telemetry.pressureTrend.includes("düşüyor") ? (
                      <ArrowDownRight className="inline h-3 w-3 text-signal-amber" />
                    ) : (
                      <ArrowRight className="inline h-3 w-3 text-ink-muted" />
                    )}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={isCityLoading}
                    onClick={() => void fetchCityList([city], true)}
                    aria-label={`${city.name} istasyonunu yenile`}
                    title="İstasyonu yenile"
                    className="atmos-btn rounded-lg border border-white/[0.08] p-1.5 text-ink-muted hover:border-white/25 hover:text-ink-primary disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isCityLoading ? "animate-spin" : ""}`} />
                  </button>
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
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-display text-4xl sm:text-5xl font-semibold tracking-tight text-ink-primary tabular">
                      <AnimatedNumber value={formatTemperature(tv.telemetry.temperature, unit)} />
                    </span>
                    <span className="font-mono text-[11px] text-ink-muted tabular">
                      Min {formatTemperature(tv.dayContext.tempMin, unit)} / Maks{" "}
                      {formatTemperature(tv.dayContext.tempMax, unit)}
                    </span>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-medium text-ink-secondary">
                    <AnimatedWeatherIcon
                      code={tv.telemetry.weatherCode}
                      isNight={tv.dayContext.isNight}
                      precipPhase={tv.telemetry.precipPhase}
                      intensityMm={tv.telemetry.precipitation}
                      className="h-4 w-4"
                    />
                    <span>{tv.telemetry.condition}</span>
                    <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-ink-muted">
                      {tv.dayContext.isNight ? "Gece" : "Gündüz"}
                    </span>
                    {b.hybrid?.engineMeta && (
                      <span className="rounded border border-signal-emerald/30 bg-signal-emerald/10 px-1.5 py-0.5 font-mono text-[10px] text-signal-emerald">
                        %{b.hybrid.engineMeta.stabilityPct} Kilitli
                      </span>
                    )}
                    {tv.stormChip.score >= 35 && (
                      <span
                        className="rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                        style={{
                          color: tv.stormChip.color,
                          borderColor: `${tv.stormChip.color}55`,
                          backgroundColor: `${tv.stormChip.color}18`
                        }}
                      >
                        {tv.stormChip.label} {tv.stormChip.score}
                      </span>
                    )}
                  </p>
                </div>
                <MiniSpark
                  id={city.id}
                  temps={b.hourly.slice(0, 12).map((h) => h.temperature)}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                <div className="surface-tile px-2 py-2">
                  <span className="flex items-center gap-1 text-ink-muted">
                    <Wind className="h-3 w-3 text-signal-sky" /> Rüzgar
                  </span>
                  <p className="mt-0.5 font-mono font-semibold text-ink-primary tabular">
                    {formatWindSpeed(tv.telemetry.windSpeed, unit)}
                  </p>
                </div>
                <div className="surface-tile px-2 py-2">
                  <span className="flex items-center gap-1 text-ink-muted">
                    <Droplets className="h-3 w-3 text-signal-sky" /> Nem
                  </span>
                  <p className="mt-0.5 font-mono font-semibold text-ink-primary tabular">
                    %{tv.telemetry.humidity}
                  </p>
                </div>
                <div className="surface-tile px-2 py-2">
                  <span className="text-ink-muted">850 hPa</span>
                  <p className="mt-0.5 font-mono font-semibold text-signal-sky tabular">
                    {tv.telemetry.temp850hPa !== null
                      ? formatTemperature(tv.telemetry.temp850hPa, unit, {
                          decimals: 1,
                          showUnit: true
                        })
                      : "—"}
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

      {/* İzleme Eşikleri (Katlanabilir Form & Sıfır-Sapmalı IEEE-754 Motoru) */}
      <section className="surface-panel p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink-primary">
            <Bell className="h-4 w-4 text-signal-amber" />
            <span>İzleme Eşikleri ({alerts.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => {
              setThresholdError(null);
              setShowAlertForm((v) => !v);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-white/[0.1] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{showAlertForm ? "Kapat" : "Yeni Kural"}</span>
          </button>
        </div>

        {showAlertForm && (
          <div className="space-y-2">
            <form
              onSubmit={handleAddAlert}
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
                onChange={(e) => {
                  const nextMetric = e.target.value as AlertMetric;
                  setAlertMetric(nextMetric);
                  setThresholdInput(
                    String(getSmartDefaultThreshold(nextMetric, alertOperator, unit))
                  );
                  setIsCustomThreshold(false);
                  setThresholdError(null);
                }}
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
                onChange={(e) => {
                  const nextOp = e.target.value as ">" | "<";
                  setAlertOperator(nextOp);
                  setThresholdInput(
                    String(getSmartDefaultThreshold(alertMetric, nextOp, unit))
                  );
                  setIsCustomThreshold(false);
                  setThresholdError(null);
                }}
                aria-label="Eşik koşulu"
                className="h-10 rounded-xl border border-white/10 bg-obsidian-950/90 px-3 font-mono text-sm text-ink-primary focus:border-signal-sky/60 focus:outline-none"
              >
                <option value=">">&gt; Üstünde</option>
                <option value="<">&lt; Altında</option>
              </select>

              <input
                type="text"
                inputMode="decimal"
                value={thresholdInput}
                onChange={(e) => {
                  setThresholdInput(e.target.value);
                  setIsCustomThreshold(true);
                  if (thresholdError) setThresholdError(null);
                }}
                placeholder={String(
                  getSmartDefaultThreshold(alertMetric, alertOperator, unit)
                )}
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

            {thresholdError && (
              <p role="alert" className="text-xs text-signal-rose">
                {thresholdError}
              </p>
            )}
          </div>
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
