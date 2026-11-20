"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { buildDemoBundle, DEFAULT_LOCATION, PRESET_CITIES } from "@/lib/weather";
import type {
  GeoLocation,
  PerformanceMode,
  ScenarioKey,
  SceneAtmosphereInput,
  UnitSystem,
  WeatherAlertRule,
  WeatherBundle
} from "@/lib/weather-types";

const STORAGE_KEYS = {
  location: "atmos:activeLocation:v2",
  favorites: "atmos:favorites:v2",
  alerts: "atmos:alerts:v2",
  unit: "atmos:unit:v2",
  perf: "atmos:perf:v2"
};

export const SCENARIO_META: Record<
  ScenarioKey,
  {
    label: string;
    shortDesc: string;
    override?: {
      temperature: number;
      apparentTemperature: number;
      windSpeed: number;
      windGusts: number;
      windDirection: number;
      cloudCover: number;
      humidity: number;
      pressure: number;
      condition: string;
      isStorm: boolean;
      precipType: "none" | "rain" | "snow";
      precipIntensity: number;
      rainAccum: number;
      snowAccum: number;
      airQualityIndex: number;
      airQualityLabel: string;
      daylight: number;
      cape: number;
    };
  }
> = {
  live: {
    label: "Canlı Veri",
    shortDesc: "Seçili şehrin gerçek zamanlı atmosferi"
  },
  storm: {
    label: "Fırtına",
    shortDesc: "Şiddetli sağanak, 68 km/s rüzgar, şimşek",
    override: {
      temperature: 12,
      apparentTemperature: 8,
      windSpeed: 68,
      windGusts: 92,
      windDirection: 225,
      cloudCover: 96,
      humidity: 89,
      pressure: 998,
      condition: "Gök Gürültülü Fırtına",
      isStorm: true,
      precipType: "rain",
      precipIntensity: 1.0,
      rainAccum: 14.5,
      snowAccum: 0,
      airQualityIndex: 2,
      airQualityLabel: "Makul",
      daylight: 0.14,
      cape: 2650
    }
  },
  snow: {
    label: "Kar Fırtınası",
    shortDesc: "Yoğun 3D kar taneleri ve beyaz zemin örtüsü",
    override: {
      temperature: -3,
      apparentTemperature: -9,
      windSpeed: 38,
      windGusts: 54,
      windDirection: 35,
      cloudCover: 92,
      humidity: 86,
      pressure: 1009,
      condition: "Yoğun Kar Yağışlı",
      isStorm: false,
      precipType: "snow",
      precipIntensity: 0.9,
      rainAccum: 0,
      snowAccum: 12.0,
      airQualityIndex: 1,
      airQualityLabel: "İyi",
      daylight: 0.42,
      cape: 80
    }
  },
  fog: {
    label: "Yoğun Sis",
    shortDesc: "Düşük görüş, kenar sisi ve yüksek AQI",
    override: {
      temperature: 8,
      apparentTemperature: 6,
      windSpeed: 9,
      windGusts: 14,
      windDirection: 110,
      cloudCover: 88,
      humidity: 96,
      pressure: 1021,
      condition: "Sisli / Puslu",
      isStorm: false,
      precipType: "none",
      precipIntensity: 0,
      rainAccum: 0.5,
      snowAccum: 0,
      airQualityIndex: 5,
      airQualityLabel: "Çok Kötü",
      daylight: 0.35,
      cape: 40
    }
  },
  sunset: {
    label: "Gün Batımı",
    shortDesc: "Kızıl ufuk, hafif esinti, parçalı bulut",
    override: {
      temperature: 19,
      apparentTemperature: 18,
      windSpeed: 18,
      windGusts: 25,
      windDirection: 280,
      cloudCover: 46,
      humidity: 54,
      pressure: 1016,
      condition: "Parçalı Bulutlu",
      isStorm: false,
      precipType: "none",
      precipIntensity: 0,
      rainAccum: 0,
      snowAccum: 0,
      airQualityIndex: 1,
      airQualityLabel: "İyi",
      daylight: 0.58,
      cape: 220
    }
  },
  sunny: {
    label: "Güneşli",
    shortDesc: "Açık gökyüzü, berrak atmosfer",
    override: {
      temperature: 26,
      apparentTemperature: 25,
      windSpeed: 12,
      windGusts: 18,
      windDirection: 160,
      cloudCover: 18,
      humidity: 42,
      pressure: 1020,
      condition: "Açık / Güneşli",
      isStorm: false,
      precipType: "none",
      precipIntensity: 0,
      rainAccum: 0,
      snowAccum: 0,
      airQualityIndex: 1,
      airQualityLabel: "İyi",
      daylight: 0.96,
      cape: 310
    }
  }
};

type WeatherContextValue = {
  bundle: WeatherBundle;
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
  scenario: ScenarioKey;
  setScenario: (s: ScenarioKey) => void;
  frameIndex: number;
  setFrameIndex: (idx: number) => void;
  audioEnabled: boolean;
  setAudioEnabled: (v: boolean) => void;
  audioVolume: number;
  setAudioVolume: (v: number) => void;
  controlOpen: boolean;
  setControlOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  performanceMode: PerformanceMode;
  setPerformanceMode: (m: PerformanceMode) => void;
  atmosphere: SceneAtmosphereInput;
};

const WeatherContext = createContext<WeatherContextValue | null>(null);

const DEFAULT_ALERTS: WeatherAlertRule[] = [
  {
    id: "default-wind-bursa",
    cityId: "bursa-tr",
    cityName: "Bursa",
    metric: "windSpeed",
    operator: ">",
    threshold: 45,
    enabled: true
  },
  {
    id: "default-rain-istanbul",
    cityId: "istanbul-tr",
    cityName: "İstanbul",
    metric: "precipProbability",
    operator: ">",
    threshold: 70,
    enabled: true
  }
];

export function WeatherProvider({
  initialBundle,
  children
}: {
  initialBundle: WeatherBundle;
  children: ReactNode;
}) {
  const [bundle, setBundle] = useState<WeatherBundle>(initialBundle);
  const [activeLocation, setActiveLocationState] = useState<GeoLocation>(
    initialBundle.location
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<GeoLocation[]>(PRESET_CITIES);
  const [alerts, setAlerts] = useState<WeatherAlertRule[]>(DEFAULT_ALERTS);
  const [unit, setUnitState] = useState<UnitSystem>("metric");
  const [scenario, setScenario] = useState<ScenarioKey>("live");
  const [frameIndex, setFrameIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.55);
  const [controlOpen, setControlOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [performanceMode, setPerformanceModeState] =
    useState<PerformanceMode>("auto");

  const loadForLocation = useCallback(async (loc: GeoLocation) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        lat: String(loc.lat),
        lon: String(loc.lon),
        name: loc.name,
        country: loc.country ?? ""
      });
      const res = await fetch(`/api/weather?${qs.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: WeatherBundle = await res.json();
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
    } catch {
      setError("Canlı hava verisi alınamadı, yedek veri gösteriliyor.");
      setBundle(buildDemoBundle(loc));
    } finally {
      setLoading(false);
    }
  }, []);

  // localStorage hydrate
  useEffect(() => {
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

      const savedPerf = localStorage.getItem(STORAGE_KEYS.perf);
      if (savedPerf === "auto" || savedPerf === "high" || savedPerf === "low") {
        setPerformanceModeState(savedPerf);
      }

      const savedLoc = localStorage.getItem(STORAGE_KEYS.location);
      if (savedLoc) {
        const loc: GeoLocation = JSON.parse(savedLoc);
        if (
          loc &&
          typeof loc.lat === "number" &&
          typeof loc.lon === "number" &&
          (Math.abs(loc.lat - initialBundle.location.lat) > 0.05 ||
            Math.abs(loc.lon - initialBundle.location.lon) > 0.05)
        ) {
          setActiveLocationState(loc);
          void loadForLocation(loc);
        }
      }
    } catch {
      // ignore malformed storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setActiveLocation = useCallback(
    (loc: GeoLocation) => {
      setActiveLocationState(loc);
      setScenario("live");
      setFrameIndex(0);
      try {
        localStorage.setItem(STORAGE_KEYS.location, JSON.stringify(loc));
      } catch {
        // ignore quota errors
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

  const setPerformanceMode = useCallback((m: PerformanceMode) => {
    setPerformanceModeState(m);
    try {
      localStorage.setItem(STORAGE_KEYS.perf, m);
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

  // Aktif 3D sahne atmosfer parametreleri
  const atmosphere: SceneAtmosphereInput = useMemo(() => {
    const preset = SCENARIO_META[scenario]?.override;
    if (preset) {
      return {
        windSpeed: preset.windSpeed,
        windDirection: preset.windDirection,
        cloudCover: preset.cloudCover,
        airQualityIndex: preset.airQualityIndex,
        isStorm: preset.isStorm,
        precipType: preset.precipType,
        precipIntensity: preset.precipIntensity,
        rainAccum: preset.rainAccum,
        snowAccum: preset.snowAccum,
        daylight: preset.daylight,
        cape: preset.cape
      };
    }

    const activeHour = frameIndex > 0 ? bundle.hourly[frameIndex] : null;
    if (activeHour) {
      return {
        windSpeed: activeHour.windSpeed,
        windDirection: activeHour.windDirection,
        cloudCover: activeHour.cloudCover,
        airQualityIndex: bundle.airQuality.categoryIndex,
        isStorm: activeHour.isStorm,
        precipType: activeHour.precipType,
        precipIntensity:
          activeHour.precipType === "none"
            ? 0
            : Math.min(1, 0.35 + activeHour.precipitation * 0.25),
        rainAccum: activeHour.rainAccum,
        snowAccum: activeHour.snowAccum,
        daylight: activeHour.daylight,
        cape: bundle.nativeConvective.cape ?? 0
      };
    }

    const cur = bundle.current;
    return {
      windSpeed: cur.windSpeed,
      windDirection: cur.windDirection,
      cloudCover: cur.cloudCover,
      airQualityIndex: bundle.airQuality.categoryIndex,
      isStorm: cur.isStorm,
      precipType: cur.precipType,
      precipIntensity:
        cur.precipType === "none"
          ? 0
          : Math.min(1, 0.35 + cur.precipitation * 0.3 + (cur.isStorm ? 0.4 : 0)),
      rainAccum: bundle.hourly[0]?.rainAccum ?? 0,
      snowAccum: bundle.hourly[0]?.snowAccum ?? 0,
      daylight: cur.daylight,
      cape: bundle.nativeConvective.cape ?? 0
    };
  }, [bundle, frameIndex, scenario]);

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
      scenario,
      setScenario,
      frameIndex,
      setFrameIndex,
      audioEnabled,
      setAudioEnabled,
      audioVolume,
      setAudioVolume,
      controlOpen,
      setControlOpen,
      searchOpen,
      setSearchOpen,
      performanceMode,
      setPerformanceMode,
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
      scenario,
      frameIndex,
      audioEnabled,
      audioVolume,
      controlOpen,
      searchOpen,
      performanceMode,
      setPerformanceMode,
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

export { DEFAULT_LOCATION };
