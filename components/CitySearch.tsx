"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, Search, X } from "lucide-react";
import type { GeoLocation } from "@/lib/weather-types";
import { GLOBE_CITIES } from "@/lib/weather";

type CitySearchProps = {
  onSelect: (loc: GeoLocation) => void;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  compact?: boolean;
};

export default function CitySearch({
  onSelect,
  onOpenChange,
  placeholder = "Şehir veya ilçe ara...",
  compact = false
}: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>(GLOBE_CITIES.slice(0, 6));
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updateOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        updateOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(GLOBE_CITIES.slice(0, 6));
      setActiveIndex(0);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data = await res.json();
        setResults(Array.isArray(data.results) ? data.results : []);
        setActiveIndex(0);
      } catch {
        // aborted or network error
      } finally {
        setLoading(false);
      }
    }, 240);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleChoose = (loc: GeoLocation) => {
    onSelect(loc);
    setQuery("");
    updateOpen(false);
  };

  const handleGps = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsError("Tarayıcın konum servisini desteklemiyor.");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const res = await fetch(
            `/api/reverse-geocode?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`
          );
          const geo = res.ok
            ? await res.json()
            : { name: "Konumum", country: "" };
          handleChoose({
            id: `gps_${lat.toFixed(2)}_${lon.toFixed(2)}`,
            name: geo.name || "Konumum",
            admin1: geo.admin1,
            country: geo.country || "",
            countryCode: geo.countryCode,
            lat,
            lon
          });
        } catch {
          handleChoose({
            id: `gps_${lat.toFixed(2)}_${lon.toFixed(2)}`,
            name: "Konumum",
            country: "",
            lat,
            lon
          });
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        setGpsLoading(false);
        setGpsError("Konum izni reddedildi.");
      },
      { timeout: 8000 }
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`flex items-center gap-2 rounded-2xl border border-white/15 bg-night-900/75 px-3 backdrop-blur-xl transition-colors focus-within:border-neon-orange/60 ${
          compact ? "h-10" : "h-11"
        }`}
      >
        <Search className="h-4 w-4 shrink-0 text-neon-white/50" />
        <input
          type="text"
          value={query}
          onFocus={() => updateOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            updateOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((prev) =>
                results.length > 0 ? (prev + 1) % results.length : 0
              );
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((prev) =>
                results.length > 0
                  ? (prev - 1 + results.length) % results.length
                  : 0
              );
            } else if (e.key === "Enter" && results[activeIndex]) {
              e.preventDefault();
              handleChoose(results[activeIndex]);
            } else if (e.key === "Escape") {
              updateOpen(false);
            }
          }}
          placeholder={placeholder}
          aria-label="Şehir ara"
          className="w-full bg-transparent text-sm text-neon-white placeholder:text-neon-white/45 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Aramayı temizle"
            className="text-neon-white/50 hover:text-neon-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={handleGps}
          disabled={gpsLoading}
          title="GPS ile mevcut konumumu bul"
          aria-label="Mevcut konumumu kullan"
          className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neon-white/80 hover:border-neon-cyan/50 hover:text-neon-cyan transition-colors disabled:opacity-50"
        >
          <LocateFixed className={`h-3.5 w-3.5 ${gpsLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Konumum</span>
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-white/15 bg-night-900/95 shadow-glass backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-3.5 py-2 text-xs text-neon-white/55">
            <span>{query.trim().length < 2 ? "Popüler Şehirler" : "Arama Sonuçları"}</span>
            {loading && <span className="text-neon-cyan">Aranıyor...</span>}
          </div>

          {gpsError && (
            <p className="border-b border-white/10 bg-red-500/10 px-3.5 py-2 text-xs text-red-300">
              {gpsError}
            </p>
          )}

          {results.length === 0 ? (
            <p className="px-4 py-4 text-xs text-neon-white/55">
              &ldquo;{query}&rdquo; için eşleşen konum bulunamadı.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {results.map((loc, idx) => (
                <li key={loc.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleChoose(loc)}
                    className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition-colors ${
                      idx === activeIndex
                        ? "bg-white/10 text-neon-white"
                        : "text-neon-white/80 hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <MapPin className="h-4 w-4 shrink-0 text-neon-orange" />
                      <span className="truncate font-medium">{loc.name}</span>
                      {loc.admin1 && loc.admin1 !== loc.name && (
                        <span className="truncate text-xs text-neon-white/50">
                          {loc.admin1}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-neon-white/50">
                      {loc.country}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
