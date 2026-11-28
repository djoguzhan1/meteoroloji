"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { LocateFixed, MapPin, Search, X } from "lucide-react";
import { useWeatherData } from "@/context/WeatherContext";
import type { GeoLocation } from "@/lib/weather-types";
import { formatElevation, GLOBE_CITIES } from "@/lib/weather-client";

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
  const { unit, gpsLoading, gpsError, requestGpsLocation } = useWeatherData();

  const instanceId = useId();
  const listboxId = `${instanceId}-listbox`;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>(GLOBE_CITIES.slice(0, 6));
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const openRef = useRef(false);
  const onOpenChangeRef = useRef(onOpenChange);

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  const updateOpen = useCallback((next: boolean) => {
    if (openRef.current === next) {
      setOpen(next);
      return;
    }
    openRef.current = next;
    setOpen(next);
    onOpenChangeRef.current?.(next);
  }, []);

  // Unmount anında açık kalan arama kutusunun boğuk ses (muffled audio) kilidini kaldır
  useEffect(() => {
    return () => {
      if (openRef.current) {
        openRef.current = false;
        onOpenChangeRef.current?.(false);
      }
    };
  }, []);

  // CSS `hidden` / `sm:hidden` ile görünmez olan arama kutusunu anında kapat (boğuk ses kilidi kalkanı)
  useEffect(() => {
    if (!open) return;

    const closeIfHidden = () => {
      if (containerRef.current && containerRef.current.getClientRects().length === 0) {
        updateOpen(false);
        setActiveIndex(-1);
      }
    };

    closeIfHidden();
    window.addEventListener("resize", closeIfHidden, { passive: true });

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(closeIfHidden);
      if (containerRef.current) {
        ro.observe(containerRef.current);
      }
      if (typeof document !== "undefined" && document.documentElement) {
        ro.observe(document.documentElement);
      }
    }

    return () => {
      window.removeEventListener("resize", closeIfHidden);
      ro?.disconnect();
    };
  }, [open, updateOpen]);

  // Dış tıklama ile kapatma
  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        updateOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [updateOpen]);

  // Canlı coğrafi arama (2+ karakter)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      queueMicrotask(() => setLoading(false));
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
        const nextList: GeoLocation[] = Array.isArray(data.results) ? data.results : [];
        setResults(nextList);
        setActiveIndex(nextList.length > 0 ? 0 : -1);
      } catch {
        // aborted or network error
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 220);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const displayResults = query.trim().length < 2 ? GLOBE_CITIES.slice(0, 6) : results;

  // Klavye ile gezinirken aktif seçeneği görünür alanda tut
  useEffect(() => {
    if (!open || activeIndex < 0 || activeIndex >= displayResults.length) return;
    optionRefs.current[activeIndex]?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeIndex, displayResults.length]);

  const handleChoose = (loc: GeoLocation) => {
    onSelect(loc);
    setQuery("");
    setActiveIndex(-1);
    updateOpen(false);
  };

  const handleGps = async () => {
    const ok = await requestGpsLocation();
    if (ok) {
      setQuery("");
      setActiveIndex(-1);
      updateOpen(false);
    } else {
      updateOpen(true);
    }
  };

  const activeDescendantId =
    open && activeIndex >= 0 && activeIndex < displayResults.length
      ? `${instanceId}-opt-${activeIndex}`
      : undefined;

  return (
    <div
      ref={containerRef}
      onBlur={(e) => {
        const nextFocused = e.relatedTarget as Node | null;
        if (nextFocused && containerRef.current?.contains(nextFocused)) {
          return;
        }
        // Yalnızca gerçek odak başka bir elemana (ör. Tab ile) geçtiğinde kapat
        if (nextFocused) {
          updateOpen(false);
          setActiveIndex(-1);
        }
      }}
      className="relative w-full"
    >
      <div className="flex h-9 items-center gap-2 rounded-xl border border-white/12 bg-[#070d19]/65 px-3 transition-all duration-200 hover:border-white/25 focus-within:border-[rgba(var(--atmos-rim-rgb),0.45)] focus-within:bg-obsidian-900/95 focus-within:shadow-[0_0_24px_-8px_rgba(var(--atmos-accent-rgb),0.55)]">
        <Search className="h-3.5 w-3.5 shrink-0 text-slate-300/80" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeDescendantId}
          aria-label="Şehir ara"
          value={query}
          onFocus={() => updateOpen(true)}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setActiveIndex(val.trim().length > 0 ? 0 : -1);
            updateOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (!open) {
                updateOpen(true);
                setActiveIndex(displayResults.length > 0 ? 0 : -1);
              } else {
                setActiveIndex((prev) =>
                  displayResults.length > 0
                    ? prev < 0
                      ? 0
                      : (prev + 1) % displayResults.length
                    : -1
                );
              }
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              if (!open) {
                updateOpen(true);
                setActiveIndex(
                  displayResults.length > 0 ? displayResults.length - 1 : -1
                );
              } else {
                setActiveIndex((prev) =>
                  displayResults.length > 0
                    ? prev <= 0
                      ? displayResults.length - 1
                      : prev - 1
                    : -1
                );
              }
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (!open) {
                updateOpen(true);
                setActiveIndex(displayResults.length > 0 ? 0 : -1);
              } else if (
                activeIndex >= 0 &&
                activeIndex < displayResults.length &&
                displayResults[activeIndex]
              ) {
                handleChoose(displayResults[activeIndex]);
              }
            } else if (e.key === "Escape") {
              if (open) {
                e.preventDefault();
                updateOpen(false);
                setActiveIndex(-1);
              }
            } else if (e.key === "Tab") {
              // Odağın konteyner dışına çıkacağı Tab geçişlerinde menüyü temiz kapat
              if (e.shiftKey) {
                updateOpen(false);
                setActiveIndex(-1);
              }
            }
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-ink-primary placeholder:text-slate-300/70 focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            aria-label="Temizle"
            className="text-ink-muted hover:text-ink-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => void handleGps()}
          disabled={gpsLoading}
          onKeyDown={(e) => {
            if (e.key === "Tab" && !e.shiftKey) {
              updateOpen(false);
              setActiveIndex(-1);
            }
          }}
          title="Mevcut GPS konumunu kullan"
          aria-label="Konumumu kullan"
          className="atmos-btn flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-ink-secondary hover:text-ink-primary disabled:opacity-50"
        >
          <LocateFixed className={`h-3.5 w-3.5 ${gpsLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[65] overflow-hidden rounded-xl border border-white/18 bg-[#070c18]/98 shadow-[0_24px_64px_rgba(0,0,0,0.78)] backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-3.5 py-2 text-xs text-ink-muted">
            <span>{query.trim().length < 2 ? "Hızlı Seçim" : "Konumlar"}</span>
            {loading && <span className="text-signal-sky">Aranıyor...</span>}
          </div>

          {gpsError && (
            <p
              role="alert"
              className="border-b border-white/[0.08] bg-red-500/10 px-3.5 py-2 text-xs text-red-300"
            >
              {gpsError}
            </p>
          )}

          {displayResults.length === 0 ? (
            <p className="px-4 py-3.5 text-xs text-ink-muted">
              &ldquo;{query}&rdquo; için sonuç bulunamadı.
            </p>
          ) : (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="İstasyon sonuçları"
              className="max-h-72 overflow-y-auto py-1"
            >
              {displayResults.map((loc, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <li key={loc.id} role="presentation">
                    <button
                      ref={(el) => {
                        optionRefs.current[idx] = el;
                      }}
                      id={`${instanceId}-opt-${idx}`}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={-1}
                      onMouseDown={(e) => {
                        // Input odağını koruyarak bulanıklaşma yarışını önle
                        e.preventDefault();
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => handleChoose(loc)}
                      className={`flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-white/[0.08] text-ink-primary"
                          : "text-ink-secondary hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
                        <span className="truncate font-medium text-ink-primary">
                          {loc.name}
                        </span>
                        {loc.admin1 && loc.admin1 !== loc.name && (
                          <span className="truncate text-xs text-ink-muted">
                            {loc.admin1}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-ink-muted tabular">
                        {loc.elevation !== undefined && Number.isFinite(loc.elevation)
                          ? `${formatElevation(loc.elevation, unit)} · `
                          : ""}
                        {loc.country}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
