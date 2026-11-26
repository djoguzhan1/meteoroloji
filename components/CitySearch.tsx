"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, Search, X } from "lucide-react";
import type { GeoLocation } from "@/lib/weather-types";
import { GLOBE_CITIES } from "@/lib/weather-client";

type CitySearchProps = {
  onSelect: (loc: GeoLocation) => void;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
};

export default function CitySearch({
  onSelect,
  onOpenChange,
  placeholder = "Şehir, ilçe veya istasyon ara..."
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
    if (trimmed.length < 2) return;

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
        // aborted
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const displayResults = query.trim().length < 2 ? GLOBE_CITIES.slice(0, 6) : results;

  const handleChoose = (loc: GeoLocation) => {
    onSelect(loc);
    setQuery("");
    updateOpen(false);
  };

  const handleGps = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsError("Konum servisi desteklenmiyor.");
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
            : { name: "Mevcut Konum", country: "" };
          handleChoose({
            id: `gps_${lat.toFixed(2)}_${lon.toFixed(2)}`,
            name: geo.name || "Mevcut Konum",
            admin1: geo.admin1,
            country: geo.country || "",
            countryCode: geo.countryCode,
            lat,
            lon
          });
        } catch {
          handleChoose({
            id: `gps_${lat.toFixed(2)}_${lon.toFixed(2)}`,
            name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
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
        setGpsError("Konum izni alınamadı.");
      },
      { timeout: 8000 }
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex h-9 items-center gap-2 rounded-xl border border-white/12 bg-[#070d19]/65 px-3 transition-all duration-200 hover:border-white/25 focus-within:border-[rgba(var(--atmos-rim-rgb),0.45)] focus-within:bg-obsidian-900/95 focus-within:shadow-[0_0_24px_-8px_rgba(var(--atmos-accent-rgb),0.55)]">
        <Search className="h-3.5 w-3.5 shrink-0 text-slate-300/80" />
        <input
          type="text"
          value={query}
          onFocus={() => updateOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            updateOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((prev) =>
                displayResults.length > 0 ? (prev + 1) % displayResults.length : 0
              );
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((prev) =>
                displayResults.length > 0
                  ? (prev - 1 + displayResults.length) % displayResults.length
                  : 0
              );
            } else if (e.key === "Enter" && displayResults[activeIndex]) {
              e.preventDefault();
              handleChoose(displayResults[activeIndex]);
            } else if (e.key === "Escape") {
              updateOpen(false);
            }
          }}
          placeholder={placeholder}
          aria-label="Şehir ara"
          className="w-full bg-transparent text-sm text-ink-primary placeholder:text-slate-300/70 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Temizle"
            className="text-ink-muted hover:text-ink-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={handleGps}
          disabled={gpsLoading}
          title="Mevcut GPS konumunu kullan"
          aria-label="Konumumu kullan"
          className="atmos-btn flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-ink-secondary hover:text-ink-primary disabled:opacity-50"
        >
          <LocateFixed className={`h-3.5 w-3.5 ${gpsLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-white/15 bg-obsidian-900/95 shadow-instrument backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-3.5 py-2 text-xs text-ink-muted">
            <span>{query.trim().length < 2 ? "Hızlı Seçim" : "Konumlar"}</span>
            {loading && <span className="text-signal-sky">Aranıyor...</span>}
          </div>

          {gpsError && (
            <p className="border-b border-white/[0.08] bg-red-500/10 px-3.5 py-2 text-xs text-red-300">
              {gpsError}
            </p>
          )}

          {displayResults.length === 0 ? (
            <p className="px-4 py-3.5 text-xs text-ink-muted">
              &ldquo;{query}&rdquo; için sonuç bulunamadı.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {displayResults.map((loc, idx) => (
                <li key={loc.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleChoose(loc)}
                    className={`flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-sm transition-colors ${
                      idx === activeIndex
                        ? "bg-white/[0.08] text-ink-primary"
                        : "text-ink-secondary hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
                      <span className="truncate font-medium text-ink-primary">
                        {loc.name}
                      </span>
                      {loc.admin1 && loc.admin1 !== loc.name && (
                        <span className="truncate text-xs text-ink-muted">
                          {loc.admin1}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-ink-muted">
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
