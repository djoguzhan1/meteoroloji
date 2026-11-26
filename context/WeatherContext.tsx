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
import { DEFAULT_LOCATION, PRESET_CITIES } from "@/lib/weather";
import type {
  GeoLocation,
  SceneAtmosphereInput,
  UnitSystem,
  WeatherAlertRule,
  WeatherBundle
} from "@/lib/weather-types";

const STORAGE_KEYS = {
  location: "atmos:location:v3",
  favorites: "atmos:stations:v3",
  alerts: "atmos:alerts:v3",
  unit: "atmos:unit:v3"
};

type WeatherContextValue = {
  bundle: WeatherBundle | null;
  loading: boolean;
  error: string | null;
  activeLocation: GeoLocation;
  setActiveLocation: (loc: GeoLocation) => void;
  refreshWeather: () => Promise<void>;
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
  frameIndex: number;
  setFrameIndex: (idx: number) => void;
  audioEnabled: boolean;
  setAudioEnabled: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  atmosphere: SceneAtmosphereInput;
};

const WeatherContext = createContext<WeatherContextValue | null>(null);

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
  const [error, setError] = useState<string | null>(initialError);

  const [favorites, setFavorites] = useState<GeoLocation[]>(PRESET_CITIES);
  const [alerts, setAlerts] = useState<WeatherAlertRule[]>(DEFAULT_ALERTS);
  const [unit, setUnitState] = useState<UnitSystem>("metric");
  const [frameIndex, setFrameIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const loadSeqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const loadForLocation = useCallback(async (loc: GeoLocation) => {
    const seq = ++loadSeqRef.current;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        lat: String(loc.lat),
        lon: String(loc.lon),
        name: loc.name,
        country: loc.country ?? ""
      });
      const res = await fetch(`/api/weather?${qs.toString()}`, {
        signal: controller.signal
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const data: WeatherBundle = await res.json();
      if (seq !== loadSeqRef.current) return;
      setBundle({
        ...data,
        location: {
          ...data.location,
          id: loc.id,
          name: loc.name,
          admin1: loc.admin1 ?? data.location.admin1,
          country: loc.country || data.location.country
        }
      });
      setFrameIndex(0);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      if (seq !== loadSeqRef.current) return;
      setError(
        e instanceof Error
          ? e.message
          : "Meteoroloji verileri alınamadı. Bağlantını kontrol edip tekrar dene."
      );
    } finally {
      if (seq === loadSeqRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        const savedFavs = localStorage.getItem(STORAGE_KEYS.favorites);
        if (savedFavs) {
          const parsed = JSON.parse(savedFavs);
          if (Array.isArray(parsed) && parsed.length > 0) setFavorites(parsed);
        }
        const savedAlerts = localStorage.getItem(STORAGE_KEYS.alerts);
        if (savedAlerts) {
          const parsed = JSON.parse(savedAlerts);
          if (Array.isArray(parsed)) setAlerts(parsed);
        }
        const savedUnit = localStorage.getItem(STORAGE_KEYS.unit);
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
          const urlLoc: GeoLocation = {
            id: `url_${urlLat.toFixed(2)}_${urlLon.toFixed(2)}`,
            name: urlCity || `${urlLat.toFixed(2)}°, ${urlLon.toFixed(2)}°`,
            country: urlCountry,
            lat: urlLat,
            lon: urlLon
          };
          setActiveLocationState(urlLoc);
          void loadForLocation(urlLoc);
          return;
        }

        // 2. Öncelik: Kayıtlı son konum
        const savedLoc = localStorage.getItem(STORAGE_KEYS.location);
        if (savedLoc) {
          const loc: GeoLocation = JSON.parse(savedLoc);
          const initLoc = initialBundle?.location ?? DEFAULT_LOCATION;
          if (
            loc &&
            typeof loc.lat === "number" &&
            typeof loc.lon === "number" &&
            (Math.abs(loc.lat - initLoc.lat) > 0.05 ||
              Math.abs(loc.lon - initLoc.lon) > 0.05)
          ) {
            setActiveLocationState(loc);
            void loadForLocation(loc);
          }
        }
      } catch {
        // ignore storage errors
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setActiveLocation = useCallback(
    (loc: GeoLocation) => {
      setActiveLocationState(loc);
      setFrameIndex(0);
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
      void loadForLocation(loc);
    },
    [loadForLocation]
  );

  const refreshWeather = useCallback(async () => {
    await loadForLocation(activeLocation);
  }, [activeLocation, loadForLocation]);

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
          (f) =>
            f.id === loc.id ||
            (Math.abs(f.lat - loc.lat) < 0.05 && Math.abs(f.lon - loc.lon) < 0.05)
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
        (f) =>
          f.id === loc.id ||
          (Math.abs(f.lat - loc.lat) < 0.05 && Math.abs(f.lon - loc.lon) < 0.05)
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

  // %100 gerçek anlık / seçili saatlik atmosfer verisi
  const atmosphere: SceneAtmosphereInput = useMemo(() => {
    if (!bundle) return FALLBACK_SCENE;

    const activeHour = frameIndex > 0 ? bundle.hourly[frameIndex] : null;
    if (activeHour) {
      return {
        windSpeed: activeHour.windSpeed,
        windDirection: activeHour.windDirection,
        cloudCover: activeHour.cloudCover,
        visibilityKm: activeHour.visibilityKm,
        airQualityIndex: bundle.airQuality.categoryIndex,
        isStorm: activeHour.isStorm,
        precipType: activeHour.precipType,
        precipIntensity:
          activeHour.precipType === "none"
            ? 0
            : Math.min(1, 0.3 + activeHour.precipitation * 0.25),
        rainAccum: activeHour.rainAccum,
        snowAccum: activeHour.snowAccum,
        solarElevationDeg: activeHour.solarElevationDeg,
        daylight: activeHour.daylight,
        cape: activeHour.cape ?? bundle.nativeConvective.cape ?? 0
      };
    }

    const cur = bundle.current;
    return {
      windSpeed: cur.windSpeed,
      windDirection: cur.windDirection,
      cloudCover: cur.cloudCover,
      visibilityKm: cur.visibilityKm,
      airQualityIndex: bundle.airQuality.categoryIndex,
      isStorm: cur.isStorm,
      precipType: cur.precipType,
      precipIntensity:
        cur.precipType === "none"
          ? 0
          : Math.min(1, 0.3 + cur.precipitation * 0.3 + (cur.isStorm ? 0.35 : 0)),
      rainAccum: bundle.hourly[0]?.rainAccum ?? 0,
      snowAccum: bundle.hourly[0]?.snowAccum ?? 0,
      solarElevationDeg: cur.solarElevationDeg,
      daylight: cur.daylight,
      cape: bundle.nativeConvective.cape ?? 0
    };
  }, [bundle, frameIndex]);

  const value = useMemo<WeatherContextValue>(
    () => ({
      bundle,
      loading,
      error,
      activeLocation,
      setActiveLocation,
      refreshWeather,
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
      frameIndex,
      setFrameIndex,
      audioEnabled,
      setAudioEnabled,
      searchOpen,
      setSearchOpen,
      atmosphere
    }),
    [
      bundle,
      loading,
      error,
      activeLocation,
      setActiveLocation,
      refreshWeather,
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
      frameIndex,
      audioEnabled,
      searchOpen,
      atmosphere
    ]
  );

  return (
    <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>
  );
}

export function useWeather(): WeatherContextValue {
  const ctx = useContext(WeatherContext);
  if (!ctx) {
    throw new Error("useWeather must be used inside WeatherProvider");
  }
  return ctx;
}
