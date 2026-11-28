"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  Cloud,
  CloudLightning,
  Command,
  CornerDownLeft,
  LayoutList,
  LocateFixed,
  MapPin,
  Radar,
  Search,
  Thermometer,
  Volume2,
  VolumeX,
  X
} from "lucide-react";
import { useWeatherData } from "@/context/WeatherContext";
import { buildLocationHref } from "@/lib/location-url";
import { formatElevation, GLOBE_CITIES } from "@/lib/weather-client";
import { atmosUiSfx } from "@/lib/ui-sfx";
import type { GeoLocation } from "@/lib/weather-types";

type PaletteItem =
  | { kind: "route"; id: string; label: string; sub: string; href: string }
  | { kind: "city"; id: string; label: string; sub: string; loc: GeoLocation }
  | { kind: "action"; id: string; label: string; sub: string; action: "unit" | "audio" | "gps" };

const ROUTE_ITEMS: PaletteItem[] = [
  { kind: "route", id: "r-home", label: "Hava Durumu", sub: "Canlı atmosfer, saatlik akış & istasyon doğrulaması", href: "/" },
  { kind: "route", id: "r-world", label: "Radar & 3D Küre", sub: "Doppler yağış, rüzgar akımı & dünya", href: "/world" },
  { kind: "route", id: "r-dash", label: "İstasyonlar", sub: "Çoklu şehir takibi & izleme eşikleri", href: "/dashboard" },
  { kind: "route", id: "r-lab", label: "Modeller & Sondaj", sub: "8-Model 72/168s karşılaştırma & 72s Skew-T", href: "/lab" },
  { kind: "route", id: "r-play", label: "CUMULUS · Bulut Savaşı", sub: "3D Süper Hücre & taktik fırtına oyunu", href: "/play" }
];

const FOCUSABLE_SELECTOR =
  'input:not([disabled]), button:not([disabled]), [href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function RouteIcon({ href }: { href: string }) {
  if (href === "/world") return <Radar className="h-4 w-4 text-[var(--atmos-accent)]" />;
  if (href === "/dashboard") return <LayoutList className="h-4 w-4 text-[var(--atmos-accent)]" />;
  if (href === "/lab") return <Activity className="h-4 w-4 text-[var(--atmos-accent)]" />;
  if (href === "/play") return <CloudLightning className="h-4 w-4 text-signal-amber" />;
  return <Cloud className="h-4 w-4 text-[var(--atmos-accent)]" />;
}

export default function CommandPalette({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const {
    activeLocation,
    setActiveLocation,
    unit,
    setUnit,
    audioEnabled,
    setAudioEnabled,
    gpsLoading,
    gpsError,
    requestGpsLocation
  } = useWeatherData();

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const [query, setQuery] = useState("");
  const [remoteCities, setRemoteCities] = useState<GeoLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleClosePalette = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  // Açılışta önceki odaklanan elemanı sakla, kapanışta (veya unmount anında) odağı geri döndür
  useEffect(() => {
    if (open) {
      if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
        previousFocusRef.current = document.activeElement;
      }
      atmosUiSfx.playPaletteOpen();
      const t = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => window.clearTimeout(t);
    }

    const prev = previousFocusRef.current;
    if (prev && prev.isConnected) {
      prev.focus();
    }
    previousFocusRef.current = null;
  }, [open]);

  useEffect(() => {
    return () => {
      const prev = previousFocusRef.current;
      if (prev && prev.isConnected) {
        prev.focus();
      }
      previousFocusRef.current = null;
    };
  }, []);

  // Modal açıkken Tab / Shift+Tab odak tuzağı (focus trap) ve Escape ile kapatma
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClosePalette();
        return;
      }
      if (e.key !== "Tab") return;

      const dialogEl = dialogRef.current;
      if (!dialogEl) return;

      const focusables = Array.from(
        dialogEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter(
        (el) =>
          !el.hasAttribute("disabled") &&
          el.getAttribute("aria-hidden") !== "true" &&
          el.getClientRects().length > 0
      );

      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeEl = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!activeEl || !dialogEl.contains(activeEl) || activeEl === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!activeEl || !dialogEl.contains(activeEl) || activeEl === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, handleClosePalette]);

  // Canlı şehir araması
  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      queueMicrotask(() => setSearching(false));
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal
        });
        if (!res.ok) return;
        const data = await res.json();
        setRemoteCities(Array.isArray(data.results) ? data.results.slice(0, 6) : []);
        setActiveIdx(0);
      } catch {
        // aborted
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);

  const items = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();
    const actions: PaletteItem[] = [
      {
        kind: "action",
        id: "a-gps",
        label: gpsLoading ? "GPS Konumu Alınıyor..." : "Mevcut GPS Konumumu Bul",
        sub: "Tarayıcı konum servisiyle yarış-korumalı anlık istasyon",
        action: "gps"
      },
      {
        kind: "action",
        id: "a-unit",
        label: unit === "metric" ? "Sıcaklık Birimi: °F / mph yap" : "Sıcaklık Birimi: °C / km/s yap",
        sub: "Metrik ve Emperyal arasında geç",
        action: "unit"
      },
      {
        kind: "action",
        id: "a-audio",
        label: audioEnabled ? "Atmosfer & Kokpit Sesini Kapat" : "Atmosfer & Kokpit Sesini Aç",
        sub: "Gerçek rüzgar/yağmur ortam sesi + dokunsal tık",
        action: "audio"
      }
    ];

    if (q.length < 2) {
      const quickCities: PaletteItem[] = GLOBE_CITIES.slice(0, 6).map((loc) => ({
        kind: "city",
        id: `c-${loc.id}`,
        label: loc.name,
        sub: [
          loc.elevation !== undefined ? formatElevation(loc.elevation, unit) : null,
          loc.country || "İstasyon"
        ]
          .filter(Boolean)
          .join(" · "),
        loc
      }));
      return [...ROUTE_ITEMS, ...quickCities, ...actions];
    }

    const matchedRoutes = ROUTE_ITEMS.filter(
      (r) =>
        r.label.toLowerCase().includes(q) || r.sub.toLowerCase().includes(q)
    );
    const matchedActions = actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) || a.sub.toLowerCase().includes(q)
    );
    const cityItems: PaletteItem[] = remoteCities.map((loc) => ({
      kind: "city",
      id: `rc-${loc.id}`,
      label: loc.name,
      sub:
        [
          loc.admin1,
          loc.elevation !== undefined ? formatElevation(loc.elevation, unit) : null,
          loc.country
        ]
          .filter(Boolean)
          .join(" · ") || "Konum",
      loc
    }));
    return [...cityItems, ...matchedRoutes, ...matchedActions];
  }, [query, remoteCities, unit, audioEnabled, gpsLoading]);

  const clampedIdx = Math.max(0, Math.min(items.length - 1, activeIdx));

  useEffect(() => {
    if (!open || items.length === 0) return;
    itemRefs.current[clampedIdx]?.scrollIntoView?.({ block: "nearest" });
  }, [open, clampedIdx, items.length]);

  const executeItem = async (item: PaletteItem) => {
    if (item.kind === "route") {
      atmosUiSfx.playNavTick();
      router.push(buildLocationHref(item.href, activeLocation));
      handleClosePalette();
      return;
    }
    if (item.kind === "city") {
      atmosUiSfx.playChime(true);
      setActiveLocation(item.loc);
      handleClosePalette();
      return;
    }
    if (item.action === "unit") {
      setUnit(unit === "metric" ? "imperial" : "metric");
      atmosUiSfx.playNavTick();
      handleClosePalette();
    } else if (item.action === "audio") {
      setAudioEnabled(!audioEnabled);
      handleClosePalette();
    } else if (item.action === "gps") {
      atmosUiSfx.playNavTick();
      const ok = await requestGpsLocation();
      if (ok) {
        handleClosePalette();
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-[#03060d]/76 px-4 pt-[10vh] sm:pt-[13vh] backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClosePalette();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="ATMOS Komut Merkezi"
        className="surface-panel atmos-route-enter w-full max-w-xl overflow-hidden border-white/15 shadow-[0_32px_90px_rgba(0,0,0,0.75)]"
      >
        {/* Arama Satırı */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-[var(--atmos-accent)]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveIdx((i) => (items.length ? (i + 1) % items.length : 0));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveIdx((i) =>
                  items.length ? (i - 1 + items.length) % items.length : 0
                );
              } else if (e.key === "Enter" && items[clampedIdx]) {
                e.preventDefault();
                void executeItem(items[clampedIdx]);
              }
            }}
            placeholder="Şehir ara, sekme değiştir veya komut çalıştır..."
            aria-label="Komut ve istasyon ara"
            className="w-full bg-transparent text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
          />
          {searching && (
            <span className="font-mono text-[11px] text-[var(--atmos-accent)]">
              Aranıyor...
            </span>
          )}
          <button
            type="button"
            onClick={handleClosePalette}
            aria-label="Komut merkezini kapat"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-ink-muted hover:text-ink-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {gpsError && (
          <p
            role="alert"
            className="border-b border-white/[0.08] bg-red-500/10 px-4 py-2 text-xs text-red-300"
          >
            {gpsError}
          </p>
        )}

        {/* Sonuç Listesi */}
        <div className="max-h-[54vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-ink-muted">
              &ldquo;{query}&rdquo; için eşleşme bulunamadı.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {items.map((item, idx) => {
                const active = idx === clampedIdx;
                return (
                  <li key={item.id}>
                    <button
                      ref={(el) => {
                        itemRefs.current[idx] = el;
                      }}
                      type="button"
                      disabled={item.kind === "action" && item.action === "gps" && gpsLoading}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => void executeItem(item)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-all disabled:opacity-60 ${
                        active
                          ? "bg-white/[0.09] text-ink-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                          : "text-ink-secondary hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                            active
                              ? "border-[rgba(var(--atmos-rim-rgb),0.4)] bg-[rgba(var(--atmos-accent-rgb),0.14)]"
                              : "border-white/[0.08] bg-white/[0.03]"
                          }`}
                        >
                          {item.kind === "route" ? (
                            <RouteIcon href={item.href} />
                          ) : item.kind === "city" ? (
                            <MapPin className="h-4 w-4 text-[var(--atmos-accent)]" />
                          ) : item.action === "gps" ? (
                            <LocateFixed
                              className={`h-4 w-4 text-signal-emerald ${
                                gpsLoading ? "animate-spin" : ""
                              }`}
                            />
                          ) : item.action === "unit" ? (
                            <Thermometer className="h-4 w-4 text-signal-amber" />
                          ) : audioEnabled ? (
                            <Volume2 className="h-4 w-4 text-[var(--atmos-accent)]" />
                          ) : (
                            <VolumeX className="h-4 w-4 text-ink-muted" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-ink-primary">
                            {item.label}
                          </span>
                          <span className="block truncate text-[11px] text-ink-muted">
                            {item.sub}
                          </span>
                        </span>
                      </span>

                      <span className="flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-ink-muted">
                        <span>
                          {item.kind === "route"
                            ? "Sayfa"
                            : item.kind === "city"
                              ? "Şehir"
                              : "Komut"}
                        </span>
                        {active && (
                          <CornerDownLeft className="h-3 w-3 text-[var(--atmos-accent)]" />
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Alt Kısayol Çubuğu */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-obsidian-950/60 px-4 py-2 font-mono text-[10px] text-ink-muted">
          <span className="flex items-center gap-2">
            <Command className="h-3 w-3 text-[var(--atmos-accent)]" />
            <span>ATMOS Komut Merkezi</span>
          </span>
          <span>↑↓ Seç · ↵ Uygula · Tab Odak · ESC Kapat</span>
        </div>
      </div>
    </div>
  );
}
