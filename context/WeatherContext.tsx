"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  readCachedWeatherBundleAsync,
  readCachedWeatherBundleSync,
  writeCachedWeatherBundle
} from "@/lib/client-forecast-cache";
import {
  areLocationsEquivalent,
  LIVE_FRESHNESS_MAX_AGE_MS,
  reanchorWeatherBundleToNow
} from "@/lib/forecast-resilience";
import {
  ATMOS_STORAGE_KEYS,
  DEFAULT_LOCATION,
  normalizeCanonicalBursaLocation,
  PRESET_CITIES,
  readMigratedStorageItem
} from "@/lib/weather-client";
import {
  resolveActiveTemporalView,
  type ActiveTemporalView
} from "@/lib/temporal-view";
import type {
  DataFreshnessMeta,
  GeoLocation,
  HourlyHorizonHours,
  SceneAtmosphereInput,
  UnitSystem,
  WeatherAlertRule,
  WeatherBundle
} from "@/lib/weather-types";

const STORAGE_KEYS = ATMOS_STORAGE_KEYS;
const RECOVERY_BACKOFF_SEC = [10, 20, 35, 60] as const;

export type WeatherDataContextValue = {
  bundle: WeatherBundle | null;
  activeLocation: GeoLocation;
  setActiveLocation: (loc: GeoLocation) => void;
  favorites: GeoLocation[];
  addFavorite: (loc: GeoLocation) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (loc: GeoLocation) => boolean;
  alerts: WeatherAlertRule[];
  addAlert: (rule: Omit<WeatherAlertRule, "id">) => void;
  removeAlert: (id: string) => void;
  toggleAlert: (id: string) => void;
  unit: UnitSystem;
  setUnit: (u: UnitSystem) => void;
  audioEnabled: boolean;
  setAudioEnabled: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
};

export type WeatherScrubContextValue = {
  frameIndex: number;
  setFrameIndex: (idx: number) => void;
  hourlyHorizon: HourlyHorizonHours;
  setHourlyHorizon: (h: HourlyHorizonHours) => void;
  focusedDate: string | null;
  setFocusedDate: (ymd: string | null) => void;
  temporalView: ActiveTemporalView | null;
  atmosphere: SceneAtmosphereInput;
};

export type WeatherStatusContextValue = {
  loading: boolean;
  isRevalidating: boolean;
  error: string | null;
  freshness: DataFreshnessMeta | null;
  isStale: boolean;
  isDegraded: boolean;
  isOffline: boolean;
  recoveryCount: number;
  justRecovered: boolean;
  refreshWeather: () => Promise<void>;
};

export type WeatherContextValue = WeatherDataContextValue &
  WeatherScrubContextValue &
  WeatherStatusContextValue & {
    retryCountdownSec: number | null;
  };

const WeatherDataContext = createContext<WeatherDataContextValue | null>(null);
const WeatherScrubContext = createContext<WeatherScrubContextValue | null>(null);
const WeatherStatusContext = createContext<WeatherStatusContextValue | null>(null);
const WeatherRetryCountdownContext = createContext<number | null>(null);

const DEFAULT_ALERTS: WeatherAlertRule[] = [
  {
    id: "watch-wind-bursa",
    cityId: "bursa-tr",
    cityName: "Bursa",
    metric: "windSpeed",
    operator: ">",
    threshold: 45,
    enabled: true
  },
  {
    id: "watch-rain-istanbul",
    cityId: "istanbul-tr",
    cityName: "İstanbul",
    metric: "precipProbability",
    operator: ">",
    threshold: 70,
    enabled: true
  }
];

function estimateInstantSolarElevationDeg(latDeg: number, lonDeg: number, date: Date): number {
  const rad = Math.PI / 180;
  const dayOfYear = Math.floor(
    (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(date.getUTCFullYear(), 0, 0)) /
      86_400_000
  );
  const utcHours =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (utcHours - 12) / 24);
  const eqTimeMin =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  const declRad =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma);
  const trueSolarTimeMin = ((utcHours * 60 + eqTimeMin + 4 * lonDeg) % 1440 + 1440) % 1440;
  const hourAngleDeg = trueSolarTimeMin / 4 - 180;
  const latRad = latDeg * rad;
  const sinElev =
    Math.sin(latRad) * Math.sin(declRad) +
    Math.cos(latRad) * Math.cos(declRad) * Math.cos(hourAngleDeg * rad);
  return Math.asin(Math.max(-1, Math.min(1, sinElev))) / rad;
}

function resolveTodayDateFromBundle(b: WeatherBundle | null): string | null {
  if (!b) return null;
  return resolveActiveTemporalView(b, 0).dayContext.date || null;
}

const FALLBACK_SCENE: SceneAtmosphereInput = {
  windSpeed: 8,
  windDirection: 180,
  cloudCover: 35,
  visibilityKm: 15,
  airQualityIndex: 1,
  isStorm: false,
  precipType: "none",
  precipIntensity: 0,
  rainAccum: 0,
  snowAccum: 0,
  solarElevationDeg: -10,
  daylight: 0,
  cape: 0
};

export function WeatherProvider({
  initialBundle,
  initialError = null,
  children
}: {
  initialBundle: WeatherBundle | null;
  initialError?: string | null;
  children: ReactNode;
}) {
  const [bundle, setBundle] = useState<WeatherBundle | null>(initialBundle);
  const [activeLocation, setActiveLocationState] = useState<GeoLocation>(
    initialBundle?.location ?? DEFAULT_LOCATION
  );
  const [loading, setLoading] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [isOffline, setIsOffline] = useState(false);
  const [retryCountdownSec, setRetryCountdownSec] = useState<number | null>(null);
  const [recoveryCount, setRecoveryCount] = useState(0);
  const [justRecovered, setJustRecovered] = useState(false);

  const [favorites, setFavorites] = useState<GeoLocation[]>(PRESET_CITIES);
  const [alerts, setAlerts] = useState<WeatherAlertRule[]>(DEFAULT_ALERTS);
  const [unit, setUnitState] = useState<UnitSystem>("metric");
  const [frameIndex, setFrameIndexState] = useState(0);
  const [hourlyHorizon, setHourlyHorizonState] = useState<HourlyHorizonHours>(168);
  const [focusedDate, setFocusedDateState] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const loadSeqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const bundleRef = useRef<WeatherBundle | null>(initialBundle);
  const activeLocRef = useRef<GeoLocation>(initialBundle?.location ?? DEFAULT_LOCATION);
  const frameIndexRef = useRef(0);
  const errorRef = useRef<string | null>(initialError);
  const retryAttemptRef = useRef(0);
  const wasOfflineSinceLiveRef = useRef(false);
  const hadInitialFailureRef = useRef(
    initialBundle === null ||
      (initialBundle?.freshness !== undefined && initialBundle.freshness.status !== "live")
  );
  const recoveryBadgeTimerRef = useRef<number | null>(null);

  const setFrameIndex = useCallback((idx: number) => {
    setFrameIndexState((prev) => (prev === idx ? prev : idx));
    if (idx === 0) {
      const todayYmd = resolveTodayDateFromBundle(bundleRef.current);
      setFocusedDateState((prev) => (prev === todayYmd ? prev : todayYmd));
    } else if (idx >= 168) {
      setHourlyHorizonState((prev) => (prev < 240 ? 240 : prev));
    } else if (idx >= 48) {
      setHourlyHorizonState((prev) => (prev < 168 ? 168 : prev));
    }
  }, []);

  const setHourlyHorizon = useCallback((h: HourlyHorizonHours) => {
    setHourlyHorizonState((prev) => (prev === h ? prev : h));
    setFrameIndexState((prev) => (prev >= h ? Math.max(0, h - 1) : prev));
  }, []);

  const setFocusedDate = useCallback((ymd: string | null) => {
    setFocusedDateState((prev) => (prev === ymd ? prev : ymd));
  }, []);

  useEffect(() => {
    bundleRef.current = bundle;
  }, [bundle]);

  useEffect(() => {
    activeLocRef.current = activeLocation;
  }, [activeLocation]);

  useEffect(() => {
    frameIndexRef.current = frameIndex;
  }, [frameIndex]);

  useEffect(() => {
    errorRef.current = error;
  }, [error]);

  const triggerJustRecovered = useCallback(() => {
    setJustRecovered(true);
    if (recoveryBadgeTimerRef.current !== null) {
      window.clearTimeout(recoveryBadgeTimerRef.current);
    }
    recoveryBadgeTimerRef.current = window.setTimeout(() => {
      setJustRecovered(false);
      recoveryBadgeTimerRef.current = null;
    }, 4500);
  }, []);

  const loadForLocation = useCallback(
    async (
      loc: GeoLocation,
      opts?: { background?: boolean; manual?: boolean }
    ) => {
      const seq = ++loadSeqRef.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const hasMatchingBundle = Boolean(
        bundleRef.current && areLocationsEquivalent(bundleRef.current.location, loc)
      );
      const runInBackground = Boolean(opts?.background || hasMatchingBundle);

      if (runInBackground) {
        setIsRevalidating(true);
      } else {
        setLoading(true);
      }
      if (!runInBackground) {
        setError(null);
      }

      try {
        const qs = new URLSearchParams({
          lat: String(loc.lat),
          lon: String(loc.lon),
          name: loc.name,
          country: loc.country ?? ""
        });
        if (loc.admin1) qs.set("admin1", loc.admin1);
        if (loc.elevation !== undefined && Number.isFinite(loc.elevation)) {
          qs.set("elevation", String(Math.round(loc.elevation)));
        }
        const bypassHttpCache =
          runInBackground ||
          Boolean(opts?.manual) ||
          bundleRef.current?.freshness?.status !== "live";

        const res = await fetch(`/api/weather?${qs.toString()}`, {
          signal: controller.signal,
          cache: bypassHttpCache ? "no-store" : "default"
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }
        const data: WeatherBundle = await res.json();
        if (seq !== loadSeqRef.current) return;
        if (!areLocationsEquivalent(activeLocRef.current, loc)) return;

        const merged: WeatherBundle = {
          ...data,
          location: {
            ...data.location,
            id: loc.id || data.location.id,
            name: loc.name || data.location.name,
            admin1: loc.admin1 ?? data.location.admin1,
            country: loc.country || data.location.country
          }
        };

        const prevWasImpaired =
          Boolean(errorRef.current) ||
          wasOfflineSinceLiveRef.current ||
          hadInitialFailureRef.current ||
          (bundleRef.current !== null &&
            areLocationsEquivalent(bundleRef.current.location, loc) &&
            bundleRef.current.freshness !== undefined &&
            bundleRef.current.freshness.status !== "live");

        // Preserve user's selected hour across silent background live updates
        let nextFrameIdx = 0;
        if (
          runInBackground &&
          frameIndexRef.current > 0 &&
          bundleRef.current &&
          areLocationsEquivalent(bundleRef.current.location, loc)
        ) {
          const prevIso = bundleRef.current.hourly[frameIndexRef.current]?.time;
          if (prevIso) {
            const matched = merged.hourly.findIndex((h) => h.time === prevIso);
            if (matched >= 0) nextFrameIdx = matched;
          }
        }

        bundleRef.current = merged;
        setBundle(merged);
        setFrameIndexState(nextFrameIdx);
        if (!runInBackground && nextFrameIdx === 0) {
          setFocusedDateState(resolveTodayDateFromBundle(merged));
        }
        setError(null);

        const nextStatus = merged.freshness?.status ?? "live";
        if (nextStatus === "live") {
          writeCachedWeatherBundle(merged);
          retryAttemptRef.current = 0;
          wasOfflineSinceLiveRef.current = false;
          hadInitialFailureRef.current = false;
          setRetryCountdownSec(null);

          if (prevWasImpaired) {
            setRecoveryCount((c) => c + 1);
            triggerJustRecovered();
          } else if (opts?.manual) {
            setRecoveryCount((c) => c + 1);
          }
        } else {
          // Server returned L2/L3 stale or degraded fallback; keep probing in background!
          retryAttemptRef.current = Math.min(retryAttemptRef.current + 1, 6);
        }
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        if (seq !== loadSeqRef.current) return;
        if (!areLocationsEquivalent(activeLocRef.current, loc)) return;

        const errMessage =
          e instanceof Error
            ? e.message
            : "Meteoroloji verileri alınamadı. Bağlantı sağlandığında otomatik güncellenecek.";

        retryAttemptRef.current = Math.min(retryAttemptRef.current + 1, 6);

        // Tier 1 client defense: keep current bundle if it belongs to `loc`, marking it stale & re-anchored
        if (
          bundleRef.current &&
          areLocationsEquivalent(bundleRef.current.location, loc)
        ) {
          const priorTier = bundleRef.current.freshness?.sourceTier;
          const fallbackBundle = reanchorWeatherBundleToNow(
            bundleRef.current,
            Date.now(),
            {
              status: "stale",
              sourceTier:
                priorTier && priorTier !== "live" ? priorTier : "client-cache",
              cachedAtMs:
                bundleRef.current.freshness?.cachedAtMs ??
                Date.parse(bundleRef.current.fetchedAt),
              staleReason: errMessage,
              modelsRespondedCount: bundleRef.current.hybrid.activeModels.length
            }
          );
          setBundle(fallbackBundle);
          setError(null);
        } else {
          // Tier 2 client defense: check IndexedDB / localStorage L4 vault for `loc`
          const cachedFallback = await readCachedWeatherBundleAsync(
            loc,
            Date.now(),
            {
              forceStale: true,
              staleReason: errMessage
            }
          );
          if (seq !== loadSeqRef.current) return;
          if (cachedFallback) {
            bundleRef.current = cachedFallback;
            setBundle(cachedFallback);
            setFrameIndexState(0);
            setFocusedDateState(resolveTodayDateFromBundle(cachedFallback));
            setError(null);
          } else {
            setBundle(null);
            setError(errMessage);
          }
        }
      } finally {
        if (seq === loadSeqRef.current) {
          setLoading(false);
          setIsRevalidating(false);
        }
      }
    },
    [triggerJustRecovered]
  );

  const switchAndHydrateLocation = useCallback(
    (rawLoc: GeoLocation) => {
      const loc = normalizeCanonicalBursaLocation(rawLoc);
      setActiveLocationState(loc);
      activeLocRef.current = loc;
      retryAttemptRef.current = 0;
      setRetryCountdownSec(null);
      frameIndexRef.current = 0;
      setFrameIndexState(0);

      const sameAsCurrent = Boolean(
        bundleRef.current && areLocationsEquivalent(bundleRef.current.location, loc)
      );

      if (!sameAsCurrent) {
        const offlineNow =
          typeof navigator !== "undefined" && navigator.onLine === false;
        const syncCached = readCachedWeatherBundleSync(loc, Date.now(), {
          forceStale: offlineNow
        });

        if (syncCached) {
          bundleRef.current = syncCached;
          setBundle(syncCached);
          setError(null);
        } else {
          // Strict city isolation: NEVER keep the old city's bundle under the new city's title!
          bundleRef.current = null;
          setBundle(null);
          setError(null);
        }
      }

      setFocusedDateState(resolveTodayDateFromBundle(bundleRef.current));

      void loadForLocation(loc, { background: Boolean(bundleRef.current) });
    },
    [loadForLocation]
  );

  // Initial mount: persist live SSR bundle, restore preferences, and recover from L4 if SSR failed
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;

      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        setIsOffline(true);
        wasOfflineSinceLiveRef.current = true;
      }

      if (
        initialBundle &&
        (initialBundle.freshness?.status ?? "live") === "live"
      ) {
        writeCachedWeatherBundle(initialBundle);
      }

      try {
        const savedFavs = readMigratedStorageItem("favorites", localStorage);
        if (savedFavs) {
          const parsed = JSON.parse(savedFavs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFavorites(parsed.map((item: GeoLocation) => normalizeCanonicalBursaLocation(item)));
          }
        }
        const savedAlerts = readMigratedStorageItem("alerts", localStorage);
        if (savedAlerts) {
          const parsed = JSON.parse(savedAlerts);
          if (Array.isArray(parsed)) setAlerts(parsed);
        }
        const savedUnit = readMigratedStorageItem("unit", localStorage);
        if (savedUnit === "metric" || savedUnit === "imperial") setUnitState(savedUnit);

        // 1. Öncelik: Paylaşılabilir URL query parametreleri (?lat=&lon=&city=&country=)
        const params = new URLSearchParams(window.location.search);
        const urlLat = Number(params.get("lat"));
        const urlLon = Number(params.get("lon"));
        const urlCity = params.get("city");
        const urlCountry = params.get("country") ?? "";

        if (
          params.has("lat") &&
          params.has("lon") &&
          Number.isFinite(urlLat) &&
          Number.isFinite(urlLon) &&
          urlLat >= -90 &&
          urlLat <= 90 &&
          urlLon >= -180 &&
          urlLon <= 180
        ) {
          const rawUrlLoc: GeoLocation = {
            id: `url_${urlLat.toFixed(2)}_${urlLon.toFixed(2)}`,
            name: urlCity || `${urlLat.toFixed(2)}°, ${urlLon.toFixed(2)}°`,
            country: urlCountry,
            lat: urlLat,
            lon: urlLon
          };
          const urlLoc = normalizeCanonicalBursaLocation(rawUrlLoc);
          // Eski paylaşılmış linklerde (?lat=40.1885&lon=29.0610) adres çubuğunu da resmi Bursa Merkez (40.2308, 29.0133) ile eşitle!
          if (
            Math.abs(urlLat - urlLoc.lat) > 0.002 ||
            Math.abs(urlLon - urlLoc.lon) > 0.002
          ) {
            const cleanQs = new URLSearchParams({
              city: urlLoc.name,
              lat: urlLoc.lat.toFixed(4),
              lon: urlLoc.lon.toFixed(4)
            });
            if (urlLoc.country) cleanQs.set("country", urlLoc.country);
            window.history.replaceState(null, "", `${window.location.pathname}?${cleanQs.toString()}`);
            localStorage.setItem(STORAGE_KEYS.location, JSON.stringify(urlLoc));
          }
          if (!areLocationsEquivalent(initialBundle?.location, urlLoc, 0.02)) {
            switchAndHydrateLocation(urlLoc);
            return;
          }
        }

        // 2. Öncelik: Kayıtlı son konum
        const savedLoc = readMigratedStorageItem("location", localStorage);
        if (savedLoc) {
          const parsedLoc: GeoLocation = JSON.parse(savedLoc);
          if (parsedLoc && typeof parsedLoc.lat === "number" && typeof parsedLoc.lon === "number") {
            const loc = normalizeCanonicalBursaLocation(parsedLoc);
            if (Math.abs(parsedLoc.lat - loc.lat) > 0.002 || Math.abs(parsedLoc.lon - loc.lon) > 0.002) {
              localStorage.setItem(STORAGE_KEYS.location, JSON.stringify(loc));
            }
            const initLoc = initialBundle?.location ?? DEFAULT_LOCATION;
            if (!areLocationsEquivalent(loc, initLoc, 0.02)) {
              switchAndHydrateLocation(loc);
              return;
            }
          }
        }
      } catch {
        // ignore storage errors
      }

      // 3. SSR başlangıçta başarısız olduysa (initialBundle === null), L4 tarayıcı kasasından anında kurtar
      if (!initialBundle) {
        void readCachedWeatherBundleAsync(DEFAULT_LOCATION, Date.now(), {
          forceStale: true,
          staleReason:
            initialError ??
            "Sunucu başlangıç verisi alınamadı; tarayıcı kasasındaki son tahmin yüklendi"
        }).then((cached) => {
          if (!active || !cached) return;
          if (
            !bundleRef.current &&
            areLocationsEquivalent(activeLocRef.current, DEFAULT_LOCATION)
          ) {
            setBundle(cached);
            setError(null);
          }
        });
      }
    });

    return () => {
      active = false;
      if (recoveryBadgeTimerRef.current !== null) {
        window.clearTimeout(recoveryBadgeTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Real-time `online` / `offline` & `visibilitychange` instant recovery hooks
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      retryAttemptRef.current = 0;
      setRetryCountdownSec(null);
      setRecoveryCount((c) => c + 1);
      void loadForLocation(activeLocRef.current, {
        background: Boolean(bundleRef.current)
      });
    };

    const handleOffline = () => {
      wasOfflineSinceLiveRef.current = true;
      setIsOffline(true);
      setRetryCountdownSec(null);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (typeof navigator !== "undefined" && navigator.onLine === false) return;

      const cur = bundleRef.current;
      const curStatus = cur?.freshness?.status ?? "live";
      const fetchedMs = cur ? Date.parse(cur.fetchedAt) : 0;
      const ageMs = Number.isFinite(fetchedMs) ? Date.now() - fetchedMs : Infinity;

      if (!cur || curStatus !== "live" || errorRef.current || ageMs >= LIVE_FRESHNESS_MAX_AGE_MS) {
        retryAttemptRef.current = 0;
        void loadForLocation(activeLocRef.current, {
          background: Boolean(cur)
        });
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadForLocation]);

  const freshness: DataFreshnessMeta | null = bundle?.freshness ?? null;
  const isStale = freshness?.status === "stale";
  const isDegraded = freshness?.status === "degraded";
  const needsAutoRecovery =
    isStale || isDegraded || (bundle === null && error !== null);

  // Adaptive exponential backoff poller (10s -> 20s -> 35s -> 60s) with isolated 1s live countdown
  useEffect(() => {
    if (!needsAutoRecovery || isOffline || loading || isRevalidating) {
      return;
    }

    const stepIdx = Math.min(
      retryAttemptRef.current,
      RECOVERY_BACKOFF_SEC.length - 1
    );
    let remaining = RECOVERY_BACKOFF_SEC[stepIdx];

    queueMicrotask(() => {
      setRetryCountdownSec(remaining);
    });

    const interval = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      remaining -= 1;
      if (remaining <= 0) {
        window.clearInterval(interval);
        setRetryCountdownSec(0);
        void loadForLocation(activeLocRef.current, {
          background: Boolean(bundleRef.current)
        });
      } else {
        setRetryCountdownSec(remaining);
      }
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [needsAutoRecovery, isOffline, loading, isRevalidating, loadForLocation]);

  // Steady-state 45s heartbeat: silently refreshes live data after 5 min & advances stale clock across hour boundaries
  useEffect(() => {
    const heartbeat = window.setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      const cur = bundleRef.current;
      if (!cur) return;

      const nowMs = Date.now();
      const status = cur.freshness?.status ?? "live";

      if (status !== "live") {
        const localNowHourIso = `${new Date(nowMs + cur.utcOffsetSeconds * 1000)
          .toISOString()
          .slice(0, 13)}:00`;
        if (cur.hourly[0] && cur.hourly[0].time < localNowHourIso) {
          setBundle(reanchorWeatherBundleToNow(cur, nowMs));
        }
        return;
      }

      if (typeof navigator !== "undefined" && navigator.onLine === false) return;
      const fetchedMs = Date.parse(cur.fetchedAt);
      if (Number.isFinite(fetchedMs) && nowMs - fetchedMs >= LIVE_FRESHNESS_MAX_AGE_MS) {
        void loadForLocation(activeLocRef.current, { background: true });
      }
    }, 45_000);

    return () => window.clearInterval(heartbeat);
  }, [loadForLocation]);

  const setActiveLocation = useCallback(
    (rawLoc: GeoLocation) => {
      const loc = normalizeCanonicalBursaLocation(rawLoc);
      try {
        localStorage.setItem(STORAGE_KEYS.location, JSON.stringify(loc));
        if (typeof window !== "undefined" && window.location.pathname === "/") {
          const qs = new URLSearchParams({
            city: loc.name,
            lat: loc.lat.toFixed(4),
            lon: loc.lon.toFixed(4)
          });
          if (loc.country) qs.set("country", loc.country);
          window.history.replaceState(null, "", `/?${qs.toString()}`);
        }
      } catch {
        // ignore
      }
      switchAndHydrateLocation(loc);
    },
    [switchAndHydrateLocation]
  );

  const refreshWeather = useCallback(async () => {
    retryAttemptRef.current = 0;
    await loadForLocation(activeLocRef.current, {
      background: Boolean(bundleRef.current),
      manual: true
    });
  }, [loadForLocation]);

  const setUnit = useCallback((u: UnitSystem) => {
    setUnitState(u);
    try {
      localStorage.setItem(STORAGE_KEYS.unit, u);
    } catch {
      // ignore
    }
  }, []);

  const addFavorite = useCallback((loc: GeoLocation) => {
    setFavorites((prev) => {
      if (
        prev.some(
          (f) => f.id === loc.id || areLocationsEquivalent(f, loc)
        )
      ) {
        return prev;
      }
      const next = [...prev, loc];
      try {
        localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.filter((f) => f.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (loc: GeoLocation) =>
      favorites.some(
        (f) => f.id === loc.id || areLocationsEquivalent(f, loc)
      ),
    [favorites]
  );

  const addAlert = useCallback((rule: Omit<WeatherAlertRule, "id">) => {
    setAlerts((prev) => {
      const next = [...prev, { ...rule, id: `alert-${Date.now()}` }];
      try {
        localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => {
      const next = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setAlerts((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
      try {
        localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  // %100 deterministik aktif zaman görünümü ve fiziksel 3D sahne girdisi
  const temporalView = useMemo<ActiveTemporalView | null>(() => {
    if (!bundle) return null;
    return resolveActiveTemporalView(bundle, frameIndex);
  }, [bundle, frameIndex]);

  const effectiveFocusedDate = useMemo<string | null>(() => {
    if (!temporalView?.dayContext.date) return focusedDate;
    if (frameIndex > 0 || focusedDate === null) {
      return temporalView.dayContext.date;
    }
    if (
      bundle &&
      bundle.daily.length > 0 &&
      !bundle.daily.some((d) => d.date === focusedDate)
    ) {
      return temporalView.dayContext.date;
    }
    return focusedDate;
  }, [bundle, focusedDate, frameIndex, temporalView]);

  const atmosphere: SceneAtmosphereInput = useMemo(() => {
    if (temporalView) return temporalView.atmosphere;
    const solarElev = estimateInstantSolarElevationDeg(
      activeLocation.lat,
      activeLocation.lon,
      new Date()
    );
    const daylight = Math.max(0, Math.min(1, (solarElev + 6) / 36));
    return {
      ...FALLBACK_SCENE,
      solarElevationDeg: solarElev,
      daylight,
      solarArcProgress: 0.5,
      lightningProbPct: 0,
      precipitationMmHr: 0
    };
  }, [temporalView, activeLocation.lat, activeLocation.lon]);

  const dataValue = useMemo<WeatherDataContextValue>(
    () => ({
      bundle,
      activeLocation,
      setActiveLocation,
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      alerts,
      addAlert,
      removeAlert,
      toggleAlert,
      unit,
      setUnit,
      audioEnabled,
      setAudioEnabled,
      searchOpen,
      setSearchOpen
    }),
    [
      bundle,
      activeLocation,
      setActiveLocation,
      favorites,
      addFavorite,
      removeFavorite,
      isFavorite,
      alerts,
      addAlert,
      removeAlert,
      toggleAlert,
      unit,
      setUnit,
      audioEnabled,
      searchOpen
    ]
  );

  const scrubValue = useMemo<WeatherScrubContextValue>(
    () => ({
      frameIndex,
      setFrameIndex,
      hourlyHorizon,
      setHourlyHorizon,
      focusedDate: effectiveFocusedDate,
      setFocusedDate,
      temporalView,
      atmosphere
    }),
    [
      frameIndex,
      setFrameIndex,
      hourlyHorizon,
      setHourlyHorizon,
      effectiveFocusedDate,
      setFocusedDate,
      temporalView,
      atmosphere
    ]
  );

  const statusValue = useMemo<WeatherStatusContextValue>(
    () => ({
      loading,
      isRevalidating,
      error,
      freshness,
      isStale,
      isDegraded,
      isOffline,
      recoveryCount,
      justRecovered,
      refreshWeather
    }),
    [
      loading,
      isRevalidating,
      error,
      freshness,
      isStale,
      isDegraded,
      isOffline,
      recoveryCount,
      justRecovered,
      refreshWeather
    ]
  );

  return (
    <WeatherDataContext.Provider value={dataValue}>
      <WeatherStatusContext.Provider value={statusValue}>
        <WeatherRetryCountdownContext.Provider value={retryCountdownSec}>
          <WeatherScrubContext.Provider value={scrubValue}>
            {children}
          </WeatherScrubContext.Provider>
        </WeatherRetryCountdownContext.Provider>
      </WeatherStatusContext.Provider>
    </WeatherDataContext.Provider>
  );
}

export function useWeatherData(): WeatherDataContextValue {
  const ctx = useContext(WeatherDataContext);
  if (!ctx) {
    throw new Error("useWeatherData must be used inside WeatherProvider");
  }
  return ctx;
}

export function useWeatherScrub(): WeatherScrubContextValue {
  const ctx = useContext(WeatherScrubContext);
  if (!ctx) {
    throw new Error("useWeatherScrub must be used inside WeatherProvider");
  }
  return ctx;
}

export function useWeatherStatus(): WeatherStatusContextValue {
  const ctx = useContext(WeatherStatusContext);
  if (!ctx) {
    throw new Error("useWeatherStatus must be used inside WeatherProvider");
  }
  return ctx;
}

export function useWeatherRetryCountdown(): number | null {
  return useContext(WeatherRetryCountdownContext);
}

/**
 * Geriye dönük %100 uyumlu birleşik kanca; dar performans izolasyonu için
 * bileşenlerde `useWeatherData`, `useWeatherScrub` ve `useWeatherStatus` tercih edilir.
 */
export function useWeather(): WeatherContextValue {
  const data = useWeatherData();
  const scrub = useWeatherScrub();
  const status = useWeatherStatus();
  const retryCountdownSec = useWeatherRetryCountdown();
  return useMemo(
    () => ({
      ...data,
      ...scrub,
      ...status,
      retryCountdownSec
    }),
    [data, scrub, status, retryCountdownSec]
  );
}
