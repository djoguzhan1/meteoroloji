"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowUpRight,
  Droplets,
  Gauge,
  Globe,
  MapPin,
  Star,
  Wind
} from "lucide-react";
import { useWeather } from "@/context/WeatherContext";
import {
  formatTemperature,
  formatWindSpeed,
  GLOBE_CITIES,
  windDirectionToCompass
} from "@/lib/weather";
import type { GeoLocation, WeatherBundle } from "@/lib/weather-types";

const GlobeScene = dynamic(() => import("./GlobeScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-neon-white/60">
      3D Dünya Küresi hazırlanıyor...
    </div>
  )
});

export default function WorldView() {
  const router = useRouter();
  const {
    bundle,
    activeLocation,
    setActiveLocation,
    addFavorite,
    isFavorite,
    unit
  } = useWeather();

  const [selectedLoc, setSelectedLoc] = useState<GeoLocation>(activeLocation);
  const [pointBundle, setPointBundle] = useState<WeatherBundle>(bundle);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    setSelectedLoc(activeLocation);
    setPointBundle(bundle);
  }, [activeLocation, bundle]);

  const fetchPoint = useCallback(async (loc: GeoLocation) => {
    setSelectedLoc(loc);
    setFetching(true);
    try {
      const qs = new URLSearchParams({
        lat: String(loc.lat),
        lon: String(loc.lon),
        name: loc.name,
        country: loc.country ?? ""
      });
      const res = await fetch(`/api/weather?${qs.toString()}`);
      if (res.ok) {
        const data: WeatherBundle = await res.json();
        setPointBundle({
          ...data,
          location: { ...data.location, name: loc.name, country: loc.country }
        });
      }
    } finally {
      setFetching(false);
    }
  }, []);

  const handlePickCoords = useCallback(
    async (lat: number, lon: number) => {
      setFetching(true);
      let name = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
      let country = "Koordinat";
      try {
        const r = await fetch(
          `/api/reverse-geocode?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`
        );
        if (r.ok) {
          const geo = await r.json();
          name = geo.name || name;
          country = geo.country || country;
        }
      } catch {
        // fallback koordinat
      }

      const loc: GeoLocation = {
        id: `globe_${lat.toFixed(2)}_${lon.toFixed(2)}`,
        name,
        country,
        lat,
        lon
      };
      await fetchPoint(loc);
    },
    [fetchPoint]
  );

  const fav = isFavorite(selectedLoc);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-neon-cyan">
            <Globe className="h-4 w-4" />
            İnteraktif 3D Gezegen & Jet Stream
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold text-neon-white sm:text-4xl">
            3D Dünya Hava Küresi
          </h1>
          <p className="mt-1 text-sm text-neon-white/65">
            Küreyi çevir, yakınlaştır ve yeryüzünde herhangi bir noktaya tıklayarak canlı atmosfer verisini ölç.
          </p>
        </div>

        {/* Hızlı Şehir Pin Çubuğu */}
        <div className="flex flex-wrap gap-1.5">
          {GLOBE_CITIES.map((city) => {
            const active =
              Math.abs(selectedLoc.lat - city.lat) < 0.2 &&
              Math.abs(selectedLoc.lon - city.lon) < 0.2;
            return (
              <button
                key={city.id}
                type="button"
                onClick={() => void fetchPoint(city)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-neon-orange/70 bg-neon-orange/20 text-neon-white"
                    : "border-white/10 bg-white/5 text-neon-white/75 hover:bg-white/10 hover:text-neon-white"
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3D Küre + Sağ Telemetri Paneli */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.85fr)]">
        <div className="glass-panel relative h-[480px] overflow-hidden sm:h-[580px]">
          <GlobeScene
            selectedLat={selectedLoc.lat}
            selectedLon={selectedLoc.lon}
            presetCities={GLOBE_CITIES}
            onPickCoords={(lat, lon) => void handlePickCoords(lat, lon)}
            onPickCity={(city) => void fetchPoint(city)}
          />
          <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl border border-white/15 bg-night-950/75 px-3 py-2 text-xs text-neon-white/75 backdrop-blur-md">
            Sürükle: Döndür · Tekerlek: Yakınlaştır · Tıkla: Canlı Hava Ölç
          </div>
        </div>

        {/* Sağ Seçili Nokta Paneli */}
        <div className="glass-panel flex flex-col justify-between p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-mono text-neon-cyan">
                  <MapPin className="h-3.5 w-3.5 text-neon-orange" />
                  {selectedLoc.lat.toFixed(2)}°, {selectedLoc.lon.toFixed(2)}°
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-neon-white">
                  {selectedLoc.name}
                </h2>
                {selectedLoc.country && (
                  <p className="text-xs text-neon-white/60">{selectedLoc.country}</p>
                )}
              </div>
              {fetching && (
                <span className="rounded-lg border border-neon-cyan/40 bg-neon-cyan/15 px-2.5 py-1 text-xs text-neon-cyan">
                  Ölçülüyor...
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3 border-y border-white/10 py-4">
              <span className="font-display text-6xl font-black text-transparent bg-gradient-to-br from-white to-neon-orange bg-clip-text">
                {formatTemperature(pointBundle.current.temperature, unit)}
              </span>
              <div>
                <p className="text-base font-semibold text-neon-white">
                  {pointBundle.current.condition}
                </p>
                <p className="text-xs text-neon-white/60">
                  Hissedilen{" "}
                  {formatTemperature(pointBundle.current.apparentTemperature, unit)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="glass-card p-3 space-y-1">
                <span className="flex items-center gap-1.5 text-neon-white/55">
                  <Wind className="h-3.5 w-3.5 text-neon-cyan" /> Rüzgar
                </span>
                <p className="font-mono text-base font-semibold text-neon-white">
                  {formatWindSpeed(pointBundle.current.windSpeed, unit)}
                </p>
                <p className="text-neon-white/55">
                  Yön: {windDirectionToCompass(pointBundle.current.windDirection)}
                </p>
              </div>

              <div className="glass-card p-3 space-y-1">
                <span className="flex items-center gap-1.5 text-neon-white/55">
                  <Droplets className="h-3.5 w-3.5 text-neon-cyan" /> Nem
                </span>
                <p className="font-mono text-base font-semibold text-neon-white">
                  %{pointBundle.current.humidity}
                </p>
                <p className="text-neon-white/55">
                  Bulut %{pointBundle.current.cloudCover}
                </p>
              </div>

              <div className="glass-card p-3 space-y-1">
                <span className="flex items-center gap-1.5 text-neon-white/55">
                  <Gauge className="h-3.5 w-3.5 text-neon-violet" /> Basınç
                </span>
                <p className="font-mono text-base font-semibold text-neon-white">
                  {pointBundle.current.pressure} hPa
                </p>
                <p className="text-neon-white/55">
                  Görüş {pointBundle.current.visibilityKm} km
                </p>
              </div>

              <div className="glass-card p-3 space-y-1">
                <span className="text-neon-white/55">Hava Kalitesi</span>
                <p className="font-mono text-base font-semibold text-neon-white">
                  AQI {pointBundle.airQuality.europeanAqi}
                </p>
                <p className="text-neon-white/55">{pointBundle.airQuality.label}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setActiveLocation(selectedLoc);
                router.push("/");
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-neon-orange to-amber-500 px-4 py-3 text-sm font-semibold text-night-950 hover:brightness-110 transition"
            >
              <span>3D Sahnede Aç</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => addFavorite(selectedLoc)}
              disabled={fav}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-neon-white hover:bg-white/10 disabled:opacity-60 transition"
            >
              <Star className={`h-4 w-4 ${fav ? "fill-amber-300 text-amber-300" : ""}`} />
              <span>{fav ? "Panoda" : "Panoma Ekle"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
