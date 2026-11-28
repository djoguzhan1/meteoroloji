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
import { usePathname } from "next/navigation";
import {
  extractBundleProvinceCode,
  isClientCacheLocationCompatible,
  MAX_ELEVATION_DELTA_CACHE_M,
  normalizeProvinceCodeToken,
  readCachedModelsBundleAsync,
  readCachedWeatherBundleAsync,
  readCachedWeatherBundleSync,
  writeCachedModelsBundle,
  writeCachedWeatherBundle
} from "@/lib/client-forecast-cache";
import {
  areLocationsEquivalent,
  LIVE_FRESHNESS_MAX_AGE_MS,
  reanchorWeatherBundleToNow
} from "@/lib/forecast-resilience";
import {
  parseLocationFromSearchParams,
  syncLocationToBrowserUrlAndCookie
} from "@/lib/location-url";
import {
  ATMOS_STORAGE_KEYS,
  buildWeatherApiUrl,
  canonicalizeStationIdentity,
  DEFAULT_LOCATION,
  dispatchAtmosRefreshAll,
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
  MultiModelBundle,
  SceneAtmosphereInput,
  UnitSystem,
  WeatherAlertRule,
  WeatherBundle
} from "@/lib/weather-types";

const STORAGE_KEYS = ATMOS_STORAGE_KEYS;
const RECOVERY_BACKOFF_SEC = [10, 20, 35, 60] as const;

export const ATMOS_EPOCH_CHANGE_EVENT = "atmos:location-epoch-change" as const;

export interface EpochTicket {
  readonly epochId: number;
  readonly location: GeoLocation;
  readonly provinceCode?: string;
  readonly weatherAbortController: AbortController;
  readonly modelsAbortController: AbortController;
}

export function resolveEffectiveFrameIndex(
  pathname: string | null | undefined,
  savedHomeFrameIndex: number
): number {
  return (pathname ?? "/") === "/" ? savedHomeFrameIndex : 0;
}

/**
 * Appends `&pc=<provinceCode>` to `/api/weather` requests when `loc.provinceCode` is present,
 * while keeping the browser address bar canonical URL (`lib/location-url.ts`) untouched.
 */
export function buildWeatherApiUrlWithProvince(loc: GeoLocation): string {
  const base = buildWeatherApiUrl(loc);
  const pc = normalizeProvinceCodeToken(loc.provinceCode);
  if (!pc) return base;
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}pc=${encodeURIComponent(pc)}`;
}

/**
 * Builds `/api/models` request URL with optional `&pc=<provinceCode>` firewall parameter.
 */
export function buildModelsApiUrlWithProvince(loc: GeoLocation): string {
  const c = canonicalizeStationIdentity(normalizeCanonicalBursaLocation(loc));
  const qs = new URLSearchParams({
    lat: String(c.lat),
    lon: String(c.lon),
    name: c.name,
    country: c.country ?? ""
  });
  if (c.admin1) {
    qs.set("admin1", c.admin1);
  }
  if (typeof c.elevation === "number" && Number.isFinite(c.elevation)) {
    qs.set("elevation", String(Math.round(c.elevation)));
  }
  if (c.timezone) {
    qs.set("timezone", c.timezone);
  }
  const base = `/api/models?${qs.toString()}`;
  const pc =
    normalizeProvinceCodeToken(c.provinceCode) ??
    normalizeProvinceCodeToken(loc.provinceCode);
  if (!pc) return base;
  return `${base}&pc=${encodeURIComponent(pc)}`;
}

/**
 * Verifies that an asynchronous `/api/weather` or `/api/models` payload still belongs
 * to the active monotonic `epochId`, coordinates, `provinceCode`, and `|Δelev| <= 65 m` gate.
 */
export function isEpochResponseValidForActiveLocation(params: {
  ticketEpochId: number;
  currentEpochId: number;
  requestedLocation: GeoLocation;
  activeLocation: GeoLocation;
  responseLocation?:
    | (Pick<GeoLocation, "lat" | "lon"> & {
        id?: string;
        provinceCode?: string | null;
        elevation?: number | null;
      })
    | null;
  responseProvinceCode?: string | null;
}): boolean {
  const {
    ticketEpochId,
    currentEpochId,
    requestedLocation,
    activeLocation,
    responseLocation,
    responseProvinceCode
  } = params;

  if (ticketEpochId !== currentEpochId) {
    return false;
  }

  if (!isClientCacheLocationCompatible(activeLocation, requestedLocation)) {
    return false;
  }

  if (responseLocation) {
    const activePc = normalizeProvinceCodeToken(activeLocation.provinceCode);
    const respPc =
      normalizeProvinceCodeToken(responseProvinceCode) ??
      normalizeProvinceCodeToken(responseLocation.provinceCode);
    if (activePc && respPc && activePc !== respPc) {
      return false;
    }

    if (
      Math.abs(activeLocation.lat - responseLocation.lat) > 0.05 ||
      Math.abs(activeLocation.lon - responseLocation.lon) > 0.05
    ) {
      return false;
    }

    if (
      typeof activeLocation.elevation === "number" &&
      Number.isFinite(activeLocation.elevation) &&
      typeof responseLocation.elevation === "number" &&
      Number.isFinite(responseLocation.elevation) &&
      Math.abs(activeLocation.elevation - responseLocation.elevation) >
        MAX_ELEVATION_DELTA_CACHE_M
    ) {
      return false;
    }
  }

  return true;
}

export type WeatherDataContextValue = {
  bundle: WeatherBundle | null;
  activeLocation: GeoLocation;
  requestEpochId?: number;
  setActiveLocation: (loc: GeoLocation, preloadedBundle?: WeatherBundle | null) => void;
  promoteLocationWithBundle: (
    loc: GeoLocation,
    preloadedBundle: WeatherBundle | null
  ) => void;
  syncExternalBundle: (incomingBundle: WeatherBundle) => void;
  fetchModelsForActiveEpoch?: (overrideLoc?: GeoLocation) => Promise<MultiModelBundle | null>;
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
  gpsLoading: boolean;
  gpsError: string | null;
  requestGpsLocation: () => Promise<boolean>;
};

export type WeatherScrubContextValue = {
  frameIndex: number;
  savedHomeFrameIndex: number;
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

export const DEFAULT_ALERTS: WeatherAlertRule[] = [
  {
    id: "watch-wind-bursa",
    cityId: "bursa-tr",
    cityName: "Bursa",
    lat: 40.2308,
    lon: 29.0133,
    elevation: 100,
    metric: "windSpeed",
    operator: ">",
    threshold: 45,
    sourceUnit: "metric",
    sourceValue: 45,
    enabled: true
  },
  {
    id: "watch-rain-istanbul",
    cityId: "istanbul-tr",
    cityName: "İstanbul",
    lat: 41.0082,
    lon: 28.9784,
    elevation: 40,
    metric: "precipProbability",
    operator: ">",
    threshold: 70,
    sourceUnit: "metric",
    sourceValue: 70,
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

function mergeLocationIntoBundle(data: WeatherBundle, loc: GeoLocation): WeatherBundle {
  const resolvedProvinceCode =
    normalizeProvinceCodeToken(loc.provinceCode) ??
    extractBundleProvinceCode(data);
  return {
    ...data,
    location: {
      ...data.location,
      id: loc.id || data.location.id,
      name: loc.name || data.location.name,
      admin1: loc.admin1 ?? data.location.admin1,
      district: loc.district ?? data.location.district,
      ...(resolvedProvinceCode ? { provinceCode: resolvedProvinceCode } : {}),
      country: loc.country || data.location.country,
      countryCode: loc.countryCode ?? data.location.countryCode,
      elevation: loc.elevation ?? data.location.elevation,
      timezone: data.location.timezone ?? loc.timezone
    }
  };
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

/**
 * Deterministic, framework-independent state & epoch coordinator encapsulating the exact
 * city-transition, `AbortController`, `&pc=` query, `popstate`, zero-hybrid-flash, and
 * `StormScene` sky-hold contract used by `WeatherProvider`.
 */
export interface WeatherEpochTransitionSnapshot {
  epochId: number;
  activeLocation: GeoLocation;
  bundle: WeatherBundle | null;
  models: MultiModelBundle | null;
  frameIndex: number;
  focusedDate: string | null;
  atmosphere: SceneAtmosphereInput;
  loading: boolean;
}

export function createWeatherEpochTransitionCoordinator(options?: {
  initialLocation?: GeoLocation;
  initialBundle?: WeatherBundle | null;
  fetchImpl?: typeof fetch;
  storage?: Storage | null;
}) {
  const fetchFn = options?.fetchImpl ?? globalThis.fetch;
  let epochId = 0;
  let activeLocation = canonicalizeStationIdentity(
    options?.initialBundle?.location ?? options?.initialLocation ?? DEFAULT_LOCATION
  );
  let bundle: WeatherBundle | null =
    options?.initialBundle &&
    isClientCacheLocationCompatible(
      activeLocation,
      options.initialBundle.location,
      extractBundleProvinceCode(options.initialBundle)
    )
      ? options.initialBundle
      : null;
  let models: MultiModelBundle | null = null;
  let frameIndex = 0;
  let focusedDate: string | null = null;
  let loading = false;
  let lastAtmosphere: SceneAtmosphereInput | null = bundle
    ? resolveActiveTemporalView(bundle, 0).atmosphere
    : null;

  let weatherController: AbortController | null = null;
  let modelsController: AbortController | null = null;

  const issueEpochTicket = (rawLoc: GeoLocation): EpochTicket => {
    const loc = canonicalizeStationIdentity(rawLoc);
    epochId += 1;
    weatherController?.abort();
    modelsController?.abort();
    weatherController = new AbortController();
    modelsController = new AbortController();
    return {
      epochId,
      location: loc,
      provinceCode: normalizeProvinceCodeToken(loc.provinceCode),
      weatherAbortController: weatherController,
      modelsAbortController: modelsController
    };
  };

  const getAtmosphere = (): SceneAtmosphereInput => {
    if (bundle) {
      const nextAtm = resolveActiveTemporalView(bundle, frameIndex).atmosphere;
      lastAtmosphere = nextAtm;
      return nextAtm;
    }
    if (lastAtmosphere) {
      return lastAtmosphere;
    }
    const solarElev = estimateInstantSolarElevationDeg(
      activeLocation.lat,
      activeLocation.lon,
      new Date()
    );
    return {
      ...FALLBACK_SCENE,
      solarElevationDeg: solarElev,
      daylight: Math.max(0, Math.min(1, (solarElev + 6) / 36))
    };
  };

  const getSnapshot = (): WeatherEpochTransitionSnapshot => ({
    epochId,
    activeLocation,
    bundle,
    models,
    frameIndex,
    focusedDate,
    atmosphere: getAtmosphere(),
    loading
  });

  const setTemporalFocus = (nextFrameIdx: number, nextDate: string | null) => {
    frameIndex = nextFrameIdx;
    focusedDate = nextDate;
  };

  const switchLocation = (rawLoc: GeoLocation): {
    ticket: EpochTicket;
    weatherPromise: Promise<WeatherBundle | null>;
    modelsPromise: Promise<MultiModelBundle | null>;
  } => {
    const ticket = issueEpochTicket(rawLoc);
    const loc = ticket.location;

    if (bundle) {
      lastAtmosphere = resolveActiveTemporalView(bundle, frameIndex).atmosphere;
    }

    activeLocation = loc;
    frameIndex = 0;
    focusedDate = null;
    models = null;

    const syncHit = readCachedWeatherBundleSync(loc, Date.now(), {
      storage: options?.storage
    });
    if (syncHit) {
      bundle = syncHit;
      loading = false;
    } else {
      // Zero hybrid flash: NEVER retain previous city's bundle under new city's label
      bundle = null;
      loading = true;
    }

    const weatherPromise = (async (): Promise<WeatherBundle | null> => {
      try {
        const res = await fetchFn(buildWeatherApiUrlWithProvince(loc), {
          signal: ticket.weatherAbortController.signal,
          cache: "no-store"
        });
        if (!res.ok) return null;
        const data: WeatherBundle = await res.json();
        if (
          !isEpochResponseValidForActiveLocation({
            ticketEpochId: ticket.epochId,
            currentEpochId: epochId,
            requestedLocation: loc,
            activeLocation,
            responseLocation: data.location,
            responseProvinceCode: extractBundleProvinceCode(data)
          })
        ) {
          return null;
        }
        const merged = mergeLocationIntoBundle(data, loc);
        bundle = merged;
        lastAtmosphere = resolveActiveTemporalView(merged, 0).atmosphere;
        if ((merged.freshness?.status ?? "live") === "live") {
          writeCachedWeatherBundle(merged, Date.now(), options?.storage);
        }
        return merged;
      } catch {
        return null;
      } finally {
        if (ticket.epochId === epochId) {
          loading = false;
        }
      }
    })();

    const modelsPromise = (async (): Promise<MultiModelBundle | null> => {
      try {
        const res = await fetchFn(buildModelsApiUrlWithProvince(loc), {
          signal: ticket.modelsAbortController.signal,
          cache: "no-store"
        });
        if (!res.ok) return null;
        const data: MultiModelBundle = await res.json();
        if (
          !isEpochResponseValidForActiveLocation({
            ticketEpochId: ticket.epochId,
            currentEpochId: epochId,
            requestedLocation: loc,
            activeLocation,
            responseLocation: {
              lat: data.lat,
              lon: data.lon,
              provinceCode: data.provinceCode,
              elevation: data.elevation
            },
            responseProvinceCode: data.provinceCode
          })
        ) {
          return null;
        }
        models = data;
        if ((data.freshness?.status ?? "live") === "live") {
          writeCachedModelsBundle(data, Date.now(), options?.storage);
        }
        return data;
      } catch {
        return null;
      }
    })();

    return { ticket, weatherPromise, modelsPromise };
  };

  const handlePopStateSearch = (searchStr: string) => {
    const parsed = parseLocationFromSearchParams(searchStr);
    const nextLoc =
      parsed.kind === "coords"
        ? parsed.location
        : parsed.kind === "none"
          ? DEFAULT_LOCATION
          : null;
    if (nextLoc && !isClientCacheLocationCompatible(activeLocation, nextLoc)) {
      return switchLocation(nextLoc);
    }
    return null;
  };

  return {
    getSnapshot,
    setTemporalFocus,
    switchLocation,
    handlePopStateSearch
  };
}

export type WeatherProviderProps = {
  initialBundle: WeatherBundle | null;
  initialLocation?: GeoLocation;
  initialError?: string | null;
  children: ReactNode;
};

export function WeatherProvider({
  initialBundle,
  initialLocation,
  initialError = null,
  children
}: WeatherProviderProps) {
  const rawPathname = usePathname();
  const activePathname = rawPathname ?? "/";

  const resolvedInitialLocation = useMemo(
    () =>
      canonicalizeStationIdentity(
        initialLocation ?? initialBundle?.location ?? DEFAULT_LOCATION
      ),
    [initialBundle, initialLocation]
  );

  const sanitizedInitialBundle = useMemo<WeatherBundle | null>(() => {
    if (!initialBundle) return null;
    if (
      !isClientCacheLocationCompatible(
        resolvedInitialLocation,
        initialBundle.location,
        extractBundleProvinceCode(initialBundle)
      )
    ) {
      return null;
    }
    return initialBundle;
  }, [initialBundle, resolvedInitialLocation]);

  const [bundle, setBundle] = useState<WeatherBundle | null>(sanitizedInitialBundle);
  const [activeLocation, setActiveLocationState] = useState<GeoLocation>(
    resolvedInitialLocation
  );
  const [requestEpochId, setRequestEpochId] = useState(0);
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
  const [frameIndexState, setFrameIndexState] = useState(0);
  const [hourlyHorizon, setHourlyHorizonState] = useState<HourlyHorizonHours>(168);
  const [focusedDate, setFocusedDateState] = useState<string | null>(null);
  const [audioEnabled, setAudioEnabledState] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const requestEpochRef = useRef(0);
  const loadSeqRef = useRef(0);
  const locationReqSeqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const modelsAbortRef = useRef<AbortController | null>(null);
  const gpsAbortRef = useRef<AbortController | null>(null);
  const bundleRef = useRef<WeatherBundle | null>(sanitizedInitialBundle);
  const activeLocRef = useRef<GeoLocation>(resolvedInitialLocation);
  const [lastKnownAtmosphere, setLastKnownAtmosphere] = useState<SceneAtmosphereInput | null>(
    sanitizedInitialBundle
      ? resolveActiveTemporalView(sanitizedInitialBundle, 0).atmosphere
      : null
  );
  const frameIndexRef = useRef(0);
  const errorRef = useRef<string | null>(initialError);
  const retryAttemptRef = useRef(0);
  const wasOfflineSinceLiveRef = useRef(false);
  const hadInitialFailureRef = useRef(
    sanitizedInitialBundle === null ||
      (sanitizedInitialBundle?.freshness !== undefined &&
        sanitizedInitialBundle.freshness.status !== "live")
  );
  const recoveryBadgeTimerRef = useRef<number | null>(null);

  const effectiveFrameIndex = resolveEffectiveFrameIndex(
    activePathname,
    frameIndexState
  );

  const abortAllInFlightEpochRequests = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    modelsAbortRef.current?.abort();
    modelsAbortRef.current = null;
  }, []);

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
    frameIndexRef.current = frameIndexState;
  }, [frameIndexState]);

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
      opts?: { background?: boolean; manual?: boolean; epochId?: number }
    ) => {
      const ticketEpochId = opts?.epochId ?? requestEpochRef.current;
      const seq = ++loadSeqRef.current;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const hasMatchingBundle = Boolean(
        bundleRef.current &&
          isClientCacheLocationCompatible(
            loc,
            bundleRef.current.location,
            extractBundleProvinceCode(bundleRef.current)
          )
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
        const bypassHttpCache =
          runInBackground ||
          Boolean(opts?.manual) ||
          bundleRef.current?.freshness?.status !== "live";

        const res = await fetch(buildWeatherApiUrlWithProvince(loc), {
          signal: controller.signal,
          cache: bypassHttpCache ? "no-store" : "default"
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }
        const data: WeatherBundle = await res.json();
        if (seq !== loadSeqRef.current) return;
        if (
          !isEpochResponseValidForActiveLocation({
            ticketEpochId,
            currentEpochId: requestEpochRef.current,
            requestedLocation: loc,
            activeLocation: activeLocRef.current,
            responseLocation: data.location,
            responseProvinceCode: extractBundleProvinceCode(data)
          })
        ) {
          return;
        }

        const merged = mergeLocationIntoBundle(data, loc);

        const prevWasImpaired =
          Boolean(errorRef.current) ||
          wasOfflineSinceLiveRef.current ||
          hadInitialFailureRef.current ||
          (bundleRef.current !== null &&
            isClientCacheLocationCompatible(
              loc,
              bundleRef.current.location,
              extractBundleProvinceCode(bundleRef.current)
            ) &&
            bundleRef.current.freshness !== undefined &&
            bundleRef.current.freshness.status !== "live");

        // Preserve user's selected hour across silent background live updates on the SAME city
        let nextFrameIdx = 0;
        if (
          runInBackground &&
          frameIndexRef.current > 0 &&
          bundleRef.current &&
          isClientCacheLocationCompatible(
            loc,
            bundleRef.current.location,
            extractBundleProvinceCode(bundleRef.current)
          )
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
        if (
          !isEpochResponseValidForActiveLocation({
            ticketEpochId,
            currentEpochId: requestEpochRef.current,
            requestedLocation: loc,
            activeLocation: activeLocRef.current
          })
        ) {
          return;
        }

        const errMessage =
          e instanceof Error
            ? e.message
            : "Meteoroloji verileri alınamadı. Bağlantı sağlandığında otomatik güncellenecek.";

        retryAttemptRef.current = Math.min(retryAttemptRef.current + 1, 6);

        // Tier 1 client defense: keep current bundle ONLY if it strictly belongs to `loc`
        if (
          bundleRef.current &&
          isClientCacheLocationCompatible(
            loc,
            bundleRef.current.location,
            extractBundleProvinceCode(bundleRef.current)
          )
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
          bundleRef.current = fallbackBundle;
          setBundle(fallbackBundle);
          setError(null);
        } else {
          // Tier 2 client defense: check IndexedDB / localStorage vault for `loc`
          const cachedFallback = await readCachedWeatherBundleAsync(
            loc,
            Date.now(),
            {
              forceStale: true,
              staleReason: errMessage
            }
          );
          if (
            seq !== loadSeqRef.current ||
            ticketEpochId !== requestEpochRef.current
          ) {
            return;
          }
          if (cachedFallback) {
            bundleRef.current = cachedFallback;
            setBundle(cachedFallback);
            setFrameIndexState(0);
            setFocusedDateState(null);
            setError(null);
          } else {
            bundleRef.current = null;
            setBundle(null);
            setError(errMessage);
          }
        }
      } finally {
        if (seq === loadSeqRef.current && ticketEpochId === requestEpochRef.current) {
          setLoading(false);
          setIsRevalidating(false);
        }
      }
    },
    [triggerJustRecovered]
  );

  const fetchModelsForActiveEpoch = useCallback(
    async (overrideLoc?: GeoLocation): Promise<MultiModelBundle | null> => {
      const targetLoc = canonicalizeStationIdentity(
        overrideLoc ?? activeLocRef.current
      );
      const ticketEpochId = requestEpochRef.current;
      modelsAbortRef.current?.abort();
      const modelsController = new AbortController();
      modelsAbortRef.current = modelsController;

      try {
        const res = await fetch(buildModelsApiUrlWithProvince(targetLoc), {
          signal: modelsController.signal,
          cache: "no-store"
        });
        if (!res.ok) return null;
        const data: MultiModelBundle = await res.json();
        if (
          !isEpochResponseValidForActiveLocation({
            ticketEpochId,
            currentEpochId: requestEpochRef.current,
            requestedLocation: targetLoc,
            activeLocation: activeLocRef.current,
            responseLocation: {
              lat: data.lat,
              lon: data.lon,
              provinceCode: data.provinceCode,
              elevation: data.elevation
            },
            responseProvinceCode: data.provinceCode
          })
        ) {
          return null;
        }
        if ((data.freshness?.status ?? "live") === "live") {
          writeCachedModelsBundle(data);
        }
        return data;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return null;
        if (ticketEpochId !== requestEpochRef.current) return null;
        return readCachedModelsBundleAsync(
          targetLoc.lat,
          targetLoc.lon,
          Date.now(),
          {
            forceStale: true,
            provinceCode: targetLoc.provinceCode,
            elevation: targetLoc.elevation
          }
        );
      }
    },
    []
  );

  const switchAndHydrateLocation = useCallback(
    (rawLoc: GeoLocation, preloadedBundle?: WeatherBundle | null) => {
      const loc = canonicalizeStationIdentity(rawLoc);
      const nextEpochId = ++requestEpochRef.current;
      setRequestEpochId(nextEpochId);

      // Immediately abort any in-flight `/api/weather` AND `/api/models` requests from the previous city
      abortAllInFlightEpochRequests();

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(ATMOS_EPOCH_CHANGE_EVENT, {
            detail: { epochId: nextEpochId, location: loc }
          })
        );
      }

      if (bundleRef.current) {
        setLastKnownAtmosphere(
          resolveActiveTemporalView(bundleRef.current, frameIndexRef.current).atmosphere
        );
      }

      setActiveLocationState(loc);
      activeLocRef.current = loc;
      retryAttemptRef.current = 0;
      setRetryCountdownSec(null);
      frameIndexRef.current = 0;
      setFrameIndexState(0);
      setFocusedDateState(null);

      if (
        preloadedBundle &&
        isClientCacheLocationCompatible(
          loc,
          preloadedBundle.location,
          extractBundleProvinceCode(preloadedBundle)
        )
      ) {
        loadSeqRef.current += 1;
        const mergedPreloaded = mergeLocationIntoBundle(preloadedBundle, loc);
        bundleRef.current = mergedPreloaded;
        setBundle(mergedPreloaded);
        setError(null);
        setLoading(false);
        setIsRevalidating(false);
        if ((mergedPreloaded.freshness?.status ?? "live") === "live") {
          writeCachedWeatherBundle(mergedPreloaded);
        } else {
          void loadForLocation(loc, { background: true, epochId: nextEpochId });
        }
        return;
      }

      const sameAsCurrent = Boolean(
        bundleRef.current &&
          isClientCacheLocationCompatible(
            loc,
            bundleRef.current.location,
            extractBundleProvinceCode(bundleRef.current)
          )
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
          // Strict zero-bleed isolation: NEVER display the old city's bundle under the new city's title!
          bundleRef.current = null;
          setBundle(null);
          setError(null);
        }
      }

      void loadForLocation(loc, {
        background: Boolean(bundleRef.current),
        epochId: nextEpochId
      });
    },
    [abortAllInFlightEpochRequests, loadForLocation]
  );

  const syncExternalBundle = useCallback((incomingBundle: WeatherBundle) => {
    if (!incomingBundle) return;
    if (
      !isClientCacheLocationCompatible(
        activeLocRef.current,
        incomingBundle.location,
        extractBundleProvinceCode(incomingBundle)
      )
    ) {
      return;
    }
    const merged = mergeLocationIntoBundle(incomingBundle, activeLocRef.current);
    let nextFrameIdx = 0;
    if (frameIndexRef.current > 0 && bundleRef.current) {
      const prevIso = bundleRef.current.hourly[frameIndexRef.current]?.time;
      if (prevIso) {
        const matched = merged.hourly.findIndex((h) => h.time === prevIso);
        if (matched >= 0) nextFrameIdx = matched;
      }
    }
    bundleRef.current = merged;
    setBundle(merged);
    setFrameIndexState(nextFrameIdx);
    setError(null);
    if ((merged.freshness?.status ?? "live") === "live") {
      writeCachedWeatherBundle(merged);
      retryAttemptRef.current = 0;
      setRetryCountdownSec(null);
    }
  }, []);

  // Initial mount: persist live SSR bundle, restore preferences, sync URL/cookie, and recover from L2 if SSR failed
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;

      if (typeof navigator !== "undefined" && navigator.onLine === false) {
        setIsOffline(true);
        wasOfflineSinceLiveRef.current = true;
      }

      if (
        sanitizedInitialBundle &&
        (sanitizedInitialBundle.freshness?.status ?? "live") === "live"
      ) {
        writeCachedWeatherBundle(sanitizedInitialBundle);
      }

      try {
        const savedFavs = readMigratedStorageItem("favorites", localStorage);
        if (savedFavs) {
          const parsed = JSON.parse(savedFavs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFavorites(
              parsed.map((item: GeoLocation) => canonicalizeStationIdentity(item))
            );
          }
        }
        const savedAlerts = readMigratedStorageItem("alerts", localStorage);
        if (savedAlerts) {
          const parsed = JSON.parse(savedAlerts);
          if (Array.isArray(parsed)) setAlerts(parsed);
        }
        const savedUnit = readMigratedStorageItem("unit", localStorage);
        if (savedUnit === "metric" || savedUnit === "imperial") setUnitState(savedUnit);

        const savedAudio = readMigratedStorageItem("audio", localStorage);
        if (savedAudio === "1" || savedAudio === "true") {
          setAudioEnabledState(true);
        } else if (savedAudio === "0" || savedAudio === "false") {
          setAudioEnabledState(false);
        }

        // 1. Öncelik: Paylaşılabilir URL query parametreleri (koordinatlı veya koordinatsız ?city=)
        const parsedUrl = parseLocationFromSearchParams(window.location.search);
        if (parsedUrl.kind === "coords") {
          if (parsedUrl.needsCanonicalRewrite) {
            syncLocationToBrowserUrlAndCookie(parsedUrl.location);
          }
          const alreadyHydrated =
            bundleRef.current &&
            isClientCacheLocationCompatible(
              parsedUrl.location,
              bundleRef.current.location,
              extractBundleProvinceCode(bundleRef.current)
            );
          if (!alreadyHydrated) {
            if (!isClientCacheLocationCompatible(resolvedInitialLocation, parsedUrl.location)) {
              syncLocationToBrowserUrlAndCookie(parsedUrl.location);
              switchAndHydrateLocation(parsedUrl.location);
              return;
            }
          } else {
            syncLocationToBrowserUrlAndCookie(parsedUrl.location);
            return;
          }
        } else if (parsedUrl.kind === "city-only") {
          const normCity = parsedUrl.cityQuery.trim().toLowerCase();
          const initMatchesCity =
            resolvedInitialLocation.name.toLowerCase().includes(normCity) ||
            (resolvedInitialLocation.admin1 ?? "").toLowerCase().includes(normCity);
          if (initMatchesCity) {
            syncLocationToBrowserUrlAndCookie(resolvedInitialLocation);
          } else {
            const seq = ++locationReqSeqRef.current;
            void fetch(
              `/api/geocode?q=${encodeURIComponent(parsedUrl.cityQuery)}`
            )
              .then((r) => (r.ok ? r.json() : null))
              .then((data) => {
                if (!active || seq !== locationReqSeqRef.current) return;
                const first: GeoLocation | undefined = data?.results?.[0];
                if (first) {
                  const canonical = canonicalizeStationIdentity(first);
                  syncLocationToBrowserUrlAndCookie(canonical);
                  switchAndHydrateLocation(canonical);
                }
              })
              .catch(() => {});
            return;
          }
        } else {
          // 2. Öncelik: Kayıtlı son konum (yalnızca URL'de şehir yokken)
          const savedLoc = readMigratedStorageItem("location", localStorage);
          if (savedLoc) {
            const parsedLoc: GeoLocation = JSON.parse(savedLoc);
            if (
              parsedLoc &&
              typeof parsedLoc.lat === "number" &&
              typeof parsedLoc.lon === "number"
            ) {
              const loc = canonicalizeStationIdentity(parsedLoc);
              if (!isClientCacheLocationCompatible(loc, resolvedInitialLocation)) {
                syncLocationToBrowserUrlAndCookie(loc);
                switchAndHydrateLocation(loc);
                return;
              }
              syncLocationToBrowserUrlAndCookie(loc);
            }
          }
        }
      } catch {
        // ignore storage errors
      }

      // 3. SSR başlangıçta başarısız olduysa (sanitizedInitialBundle === null), L2 tarayıcı kasasından anında kurtar
      if (!sanitizedInitialBundle) {
        const bootEpoch = requestEpochRef.current;
        void readCachedWeatherBundleAsync(resolvedInitialLocation, Date.now(), {
          forceStale: true,
          staleReason:
            initialError ??
            "Sunucu başlangıç verisi alınamadı; tarayıcı kasasındaki son tahmin yüklendi"
        }).then((cached) => {
          if (!active || !cached || bootEpoch !== requestEpochRef.current) return;
          if (
            !bundleRef.current &&
            isClientCacheLocationCompatible(activeLocRef.current, resolvedInitialLocation)
          ) {
            bundleRef.current = cached;
            setBundle(cached);
            setError(null);
          }
        });
      }
    });

    const handlePopState = () => {
      const parsed = parseLocationFromSearchParams(window.location.search);
      const targetLoc =
        parsed.kind === "coords"
          ? parsed.location
          : parsed.kind === "none"
            ? DEFAULT_LOCATION
            : null;
      if (targetLoc && !isClientCacheLocationCompatible(activeLocRef.current, targetLoc)) {
        locationReqSeqRef.current += 1;
        abortAllInFlightEpochRequests();
        gpsAbortRef.current?.abort();
        setGpsLoading(false);
        switchAndHydrateLocation(targetLoc);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      active = false;
      window.removeEventListener("popstate", handlePopState);
      abortAllInFlightEpochRequests();
      gpsAbortRef.current?.abort();
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
      dispatchAtmosRefreshAll({
        reason: "online",
        timestampMs: Date.now(),
        location: activeLocRef.current
      });
      void loadForLocation(activeLocRef.current, {
        background: Boolean(bundleRef.current),
        epochId: requestEpochRef.current
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
          background: Boolean(cur),
          epochId: requestEpochRef.current
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

  // Render-time zero-bleed firewall: never expose a bundle that mismatches activeLocation
  const verifiedActiveBundle = useMemo<WeatherBundle | null>(() => {
    if (!bundle) return null;
    if (
      !isClientCacheLocationCompatible(
        activeLocation,
        bundle.location,
        extractBundleProvinceCode(bundle)
      )
    ) {
      return null;
    }
    return bundle;
  }, [bundle, activeLocation]);

  const freshness: DataFreshnessMeta | null = verifiedActiveBundle?.freshness ?? null;
  const isStale = freshness?.status === "stale";
  const isDegraded = freshness?.status === "degraded";
  const needsAutoRecovery =
    isStale || isDegraded || (verifiedActiveBundle === null && error !== null);

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
          background: Boolean(bundleRef.current),
          epochId: requestEpochRef.current
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
        void loadForLocation(activeLocRef.current, {
          background: true,
          epochId: requestEpochRef.current
        });
      }
    }, 45_000);

    return () => window.clearInterval(heartbeat);
  }, [loadForLocation]);

  const setActiveLocation = useCallback(
    (rawLoc: GeoLocation, preloadedBundle?: WeatherBundle | null) => {
      locationReqSeqRef.current += 1;
      abortAllInFlightEpochRequests();
      gpsAbortRef.current?.abort();
      setGpsLoading(false);
      setGpsError(null);

      const loc = canonicalizeStationIdentity(rawLoc);
      syncLocationToBrowserUrlAndCookie(loc);
      switchAndHydrateLocation(loc, preloadedBundle);
    },
    [abortAllInFlightEpochRequests, switchAndHydrateLocation]
  );

  const promoteLocationWithBundle = useCallback(
    (rawLoc: GeoLocation, preloadedBundle: WeatherBundle | null) => {
      setActiveLocation(rawLoc, preloadedBundle);
    },
    [setActiveLocation]
  );

  const requestGpsLocation = useCallback(async (): Promise<boolean> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsError("Tarayıcınız konum servisini desteklemiyor.");
      return false;
    }

    const seq = ++locationReqSeqRef.current;
    gpsAbortRef.current?.abort();
    const gpsController = new AbortController();
    gpsAbortRef.current = gpsController;

    setGpsLoading(true);
    setGpsError(null);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 9000,
          maximumAge: 60_000
        });
      });

      if (seq !== locationReqSeqRef.current) {
        return false;
      }

      const lat = Number(pos.coords.latitude.toFixed(4));
      const lon = Number(pos.coords.longitude.toFixed(4));

      let resolvedLoc: GeoLocation = canonicalizeStationIdentity({
        id: `gps_${lat.toFixed(3)}_${lon.toFixed(3)}`,
        name: "Mevcut Konum",
        country: "",
        lat,
        lon
      });

      try {
        const res = await fetch(
          `/api/reverse-geocode?lat=${lat}&lon=${lon}`,
          { signal: gpsController.signal }
        );
        if (seq !== locationReqSeqRef.current) {
          return false;
        }
        if (res.ok) {
          const geo = await res.json();
          resolvedLoc = canonicalizeStationIdentity({
            id: `gps_${lat.toFixed(3)}_${lon.toFixed(3)}`,
            name: String(geo?.name || "Mevcut Konum"),
            admin1: geo?.admin1 ? String(geo.admin1) : undefined,
            district: geo?.district ? String(geo.district) : undefined,
            provinceCode: geo?.provinceCode ? String(geo.provinceCode) : undefined,
            country: String(geo?.country || ""),
            countryCode: geo?.countryCode ? String(geo.countryCode) : undefined,
            lat,
            lon,
            elevation:
              typeof geo?.elevation === "number" && Number.isFinite(geo.elevation)
                ? Math.round(geo.elevation)
                : undefined,
            timezone: geo?.timezone ? String(geo.timezone) : undefined
          });
        }
      } catch {
        if (seq !== locationReqSeqRef.current) {
          return false;
        }
      }

      if (seq !== locationReqSeqRef.current) {
        return false;
      }

      setGpsLoading(false);
      syncLocationToBrowserUrlAndCookie(resolvedLoc);
      switchAndHydrateLocation(resolvedLoc);
      return true;
    } catch (err) {
      if (seq !== locationReqSeqRef.current) {
        return false;
      }
      setGpsLoading(false);
      const code = (err as GeolocationPositionError | undefined)?.code;
      const msg =
        code === 1
          ? "Konum izni reddedildi. Tarayıcı ayarlarından konum izni verebilirsiniz."
          : code === 3
            ? "GPS konum yanıtı zaman aşımına uğradı."
            : "GPS konumu alınamadı.";
      setGpsError(msg);
      return false;
    }
  }, [switchAndHydrateLocation]);

  const refreshWeather = useCallback(async () => {
    retryAttemptRef.current = 0;
    dispatchAtmosRefreshAll({
      reason: "manual",
      timestampMs: Date.now(),
      location: activeLocRef.current
    });
    await loadForLocation(activeLocRef.current, {
      background: Boolean(bundleRef.current),
      manual: true,
      epochId: requestEpochRef.current
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

  const setAudioEnabled = useCallback((v: boolean) => {
    setAudioEnabledState(v);
    try {
      localStorage.setItem(STORAGE_KEYS.audio, v ? "1" : "0");
    } catch {
      // ignore
    }
  }, []);

  const addFavorite = useCallback((rawLoc: GeoLocation) => {
    const loc = canonicalizeStationIdentity(rawLoc);
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
    (rawLoc: GeoLocation) => {
      const loc = canonicalizeStationIdentity(rawLoc);
      return favorites.some(
        (f) => f.id === loc.id || areLocationsEquivalent(f, loc)
      );
    },
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

  // %100 deterministik rota-yalıtımlı zaman görünümü ve fiziksel 3D sahne girdisi
  const temporalView = useMemo<ActiveTemporalView | null>(() => {
    if (!verifiedActiveBundle) return null;
    return resolveActiveTemporalView(verifiedActiveBundle, effectiveFrameIndex);
  }, [verifiedActiveBundle, effectiveFrameIndex]);

  // Keep lastKnownAtmosphere synchronized via transition boundary above

  const effectiveFocusedDate = useMemo<string | null>(() => {
    if (!temporalView?.dayContext.date) return focusedDate;
    if (effectiveFrameIndex > 0 || focusedDate === null) {
      return temporalView.dayContext.date;
    }
    if (
      verifiedActiveBundle &&
      verifiedActiveBundle.daily.length > 0 &&
      !verifiedActiveBundle.daily.some((d) => d.date === focusedDate)
    ) {
      return temporalView.dayContext.date;
    }
    return focusedDate;
  }, [verifiedActiveBundle, focusedDate, effectiveFrameIndex, temporalView]);

  // Smooth StormScene driver: retains last live sky atmosphere across uncached city transitions
  // so WebGL sky never flashes pitch-black while data cards strictly await the new city!
  const atmosphere: SceneAtmosphereInput = useMemo(() => {
    if (temporalView) return temporalView.atmosphere;
    if (lastKnownAtmosphere) return lastKnownAtmosphere;
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
  }, [temporalView, lastKnownAtmosphere, activeLocation.lat, activeLocation.lon]);

  const dataValue = useMemo<WeatherDataContextValue>(
    () => ({
      bundle: verifiedActiveBundle,
      activeLocation,
      requestEpochId,
      setActiveLocation,
      promoteLocationWithBundle,
      syncExternalBundle,
      fetchModelsForActiveEpoch,
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
      setSearchOpen,
      gpsLoading,
      gpsError,
      requestGpsLocation
    }),
    [
      verifiedActiveBundle,
      activeLocation,
      requestEpochId,
      setActiveLocation,
      promoteLocationWithBundle,
      syncExternalBundle,
      fetchModelsForActiveEpoch,
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
      gpsLoading,
      gpsError,
      requestGpsLocation
    ]
  );

  const scrubValue = useMemo<WeatherScrubContextValue>(
    () => ({
      frameIndex: effectiveFrameIndex,
      savedHomeFrameIndex: frameIndexState,
      setFrameIndex,
      hourlyHorizon,
      setHourlyHorizon,
      focusedDate: effectiveFocusedDate,
      setFocusedDate,
      temporalView,
      atmosphere
    }),
    [
      effectiveFrameIndex,
      frameIndexState,
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
