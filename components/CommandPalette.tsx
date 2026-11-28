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
  Mountain,
  Radar,
  Search,
  Snowflake,
  Thermometer,
  Volume2,
  VolumeX,
  X
} from "lucide-react";
import { useWeatherData } from "@/context/WeatherContext";
import { buildLocationHref } from "@/lib/location-url";
import { DEFAULT_LOCATION, formatElevation, GLOBE_CITIES } from "@/lib/weather-client";
import { atmosUiSfx } from "@/lib/ui-sfx";
import type { GeoLocation } from "@/lib/weather-types";

type SubLocationRole = "coast" | "plain" | "foothill" | "summit";

type PlateQueryInfo = {
  plateNumber: number;
  paddedPlate: string;
  provinceCode: string;
};

type TerrainBadgeMeta = {
  kind: "ski" | "summit" | "high";
  label: string;
};

type PaletteItem =
  | { kind: "route"; id: string; label: string; sub: string; href: string }
  | {
      kind: "city";
      id: string;
      label: string;
      sub: string;
      loc: GeoLocation;
      trBadge?: string | null;
      roleLabel?: string;
      terrainBadge?: TerrainBadgeMeta | null;
      categoryLabel?: string;
    }
  | { kind: "action"; id: string; label: string; sub: string; action: "unit" | "audio" | "gps" };

const SUBLOCATION_ROLE_LABEL_TR: Record<SubLocationRole, string> = {
  coast: "Kıyı",
  plain: "Ova",
  foothill: "Yamaç",
  summit: "Zirve"
};

const ROUTE_ITEMS: PaletteItem[] = [
  { kind: "route", id: "r-home", label: "Hava Durumu", sub: "Canlı atmosfer, saatlik akış & istasyon doğrulaması", href: "/" },
  { kind: "route", id: "r-world", label: "Radar & 3D Küre", sub: "Doppler yağış, rüzgar akımı & dünya", href: "/world" },
  { kind: "route", id: "r-dash", label: "İstasyonlar", sub: "Çoklu şehir takibi & izleme eşikleri", href: "/dashboard" },
  { kind: "route", id: "r-lab", label: "Modeller & Sondaj", sub: "8-Model 72/168s karşılaştırma & 72s Skew-T", href: "/lab" },
  { kind: "route", id: "r-play", label: "CUMULUS · Bulut Savaşı", sub: "3D Süper Hücre & taktik fırtına oyunu", href: "/play" }
];

/**
 * Lightweight 7-climate-region showcase (zero `catalog-1102` or `specs/*` client bundle import).
 */
const TURKEY_SEVEN_REGION_PALETTE_CITIES: readonly GeoLocation[] = [
  {
    ...DEFAULT_LOCATION,
    provinceCode: "TR-16",
    admin1: "Marmara · Osmangazi Merkez (WMO 17116)"
  },
  {
    id: "istanbul-tr",
    name: "İstanbul",
    admin1: "Marmara · Boğaz & Karadeniz",
    provinceCode: "TR-34",
    country: "Türkiye",
    countryCode: "TR",
    lat: 41.0082,
    lon: 28.9784,
    elevation: 40,
    timezone: "Europe/Istanbul"
  },
  {
    id: "ankara-tr",
    name: "Ankara",
    admin1: "İç Anadolu · Bozkır Çanağı",
    provinceCode: "TR-06",
    country: "Türkiye",
    countryCode: "TR",
    lat: 39.9334,
    lon: 32.8597,
    elevation: 890,
    timezone: "Europe/Istanbul"
  },
  {
    id: "izmir-tr",
    name: "İzmir",
    admin1: "Ege · Körfez & İmbat",
    provinceCode: "TR-35",
    country: "Türkiye",
    countryCode: "TR",
    lat: 38.4237,
    lon: 27.1428,
    elevation: 25,
    timezone: "Europe/Istanbul"
  },
  {
    id: "tr-07-antalya-merkez",
    name: "Antalya",
    admin1: "Akdeniz · Körfez & Beydağları",
    provinceCode: "TR-07",
    country: "Türkiye",
    countryCode: "TR",
    lat: 36.8969,
    lon: 30.7133,
    elevation: 47,
    timezone: "Europe/Istanbul"
  },
  {
    id: "trabzon-tr",
    name: "Trabzon",
    admin1: "Karadeniz · Denizel Yamaç",
    provinceCode: "TR-61",
    country: "Türkiye",
    countryCode: "TR",
    lat: 41.0027,
    lon: 39.7168,
    elevation: 39,
    timezone: "Europe/Istanbul"
  },
  {
    id: "tr-25-erzurum-merkez",
    name: "Erzurum",
    admin1: "Doğu Anadolu · Yüksek Havza",
    provinceCode: "TR-25",
    country: "Türkiye",
    countryCode: "TR",
    lat: 39.9055,
    lon: 41.2658,
    elevation: 1890,
    timezone: "Europe/Istanbul"
  },
  {
    id: "tr-27-gaziantep-merkez",
    name: "Gaziantep",
    admin1: "Güneydoğu · Geçiş Platosu",
    provinceCode: "TR-27",
    country: "Türkiye",
    countryCode: "TR",
    lat: 37.0662,
    lon: 37.3833,
    elevation: 855,
    timezone: "Europe/Istanbul"
  }
];

const GLOBAL_PALETTE_CITIES: readonly GeoLocation[] = GLOBE_CITIES.filter(
  (c) => c.countryCode !== "TR"
)
  .slice(0, 4)
  .map((c) => ({
    ...c,
    provinceCode: "GLOBAL"
  }));

const FOCUSABLE_SELECTOR =
  'input:not([disabled]), button:not([disabled]), [href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SKI_KEYWORD_RE = /\bkayak\b/iu;
const SUMMIT_KEYWORD_RE = /\b(zirve|yayla|yaylası|yaylasi|oteller)\b|dağı|dagi/iu;

function parseTrPlateQuery(raw: string): PlateQueryInfo | null {
  const trimmed = raw.trim();
  const directDigits = /^(\d{1,2})$/.exec(trimmed);
  const prefixedDigits = /^tr[-\s]?(\d{1,2})$/i.exec(trimmed);
  const digits = directDigits?.[1] ?? prefixedDigits?.[1];
  if (!digits) return null;

  const num = Number(digits);
  if (!Number.isInteger(num) || num < 1 || num > 81) return null;

  const paddedPlate = String(num).padStart(2, "0");
  return {
    plateNumber: num,
    paddedPlate,
    provinceCode: `TR-${paddedPlate}`
  };
}

function resolveTrProvinceBadge(loc: GeoLocation): string | null {
  if (loc.provinceCode && /^TR-\d{2}$/.test(loc.provinceCode)) {
    return loc.provinceCode;
  }
  if (loc.id === "bursa-tr" || loc.id?.startsWith("bursa-")) {
    return "TR-16";
  }
  const idMatch = /^tr-(\d{2})-/i.exec(loc.id ?? "");
  if (idMatch) {
    return `TR-${idMatch[1]}`;
  }
  return null;
}

function resolveTerrainBadge(loc: GeoLocation): TerrainBadgeMeta | null {
  const haystack = `${loc.name} ${loc.admin1 ?? ""} ${loc.district ?? ""}`;
  if (SKI_KEYWORD_RE.test(haystack)) {
    return { kind: "ski", label: "Kayak" };
  }
  if (SUMMIT_KEYWORD_RE.test(haystack)) {
    return { kind: "summit", label: "Zirve" };
  }
  if (
    typeof loc.elevation === "number" &&
    Number.isFinite(loc.elevation) &&
    loc.elevation >= 1400
  ) {
    return { kind: "high", label: "Yüksek İrtifa" };
  }
  return null;
}

function normalizeSelectedGeoLocation(loc: GeoLocation): GeoLocation {
  const trBadge = resolveTrProvinceBadge(loc);
  const isTr =
    Boolean(trBadge) || loc.countryCode === "TR" || loc.country === "Türkiye";
  const resolvedProvinceCode =
    trBadge ?? loc.provinceCode ?? (isTr ? undefined : "GLOBAL");

  return {
    id: loc.id,
    name: loc.name,
    ...(loc.admin1 !== undefined ? { admin1: loc.admin1 } : {}),
    ...(loc.district !== undefined ? { district: loc.district } : {}),
    ...(resolvedProvinceCode !== undefined
      ? { provinceCode: resolvedProvinceCode }
      : {}),
    country: loc.country || (isTr ? "Türkiye" : ""),
    ...(loc.countryCode || isTr
      ? { countryCode: loc.countryCode ?? "TR" }
      : {}),
    lat: loc.lat,
    lon: loc.lon,
    ...(typeof loc.elevation === "number" && Number.isFinite(loc.elevation)
      ? { elevation: loc.elevation }
      : {}),
    ...(loc.timezone || isTr
      ? { timezone: loc.timezone ?? "Europe/Istanbul" }
      : {})
  };
}

function prioritizePlateMatches(
  list: GeoLocation[],
  plateInfo: PlateQueryInfo | null
): GeoLocation[] {
  if (!plateInfo) return list;

  const exactCenters: GeoLocation[] = [];
  const sameProvinceDistricts: GeoLocation[] = [];
  const others: GeoLocation[] = [];

  for (const rawLoc of list) {
    const badge = resolveTrProvinceBadge(rawLoc);
    if (badge === plateInfo.provinceCode) {
      const stamped: GeoLocation = {
        ...rawLoc,
        provinceCode: plateInfo.provinceCode
      };
      const isProvinceCenter =
        !stamped.district &&
        (stamped.id === "bursa-tr" ||
          stamped.id.endsWith("-merkez") ||
          Boolean(stamped.admin1?.includes("Merkez")));
      if (isProvinceCenter) {
        exactCenters.push(stamped);
      } else {
        sameProvinceDistricts.push(stamped);
      }
    } else {
      others.push(rawLoc);
    }
  }

  return [...exactCenters, ...sameProvinceDistricts, ...others];
}

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
    bundle,
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

  const trimmedQuery = query.trim();
  const plateQuery = useMemo(() => parseTrPlateQuery(trimmedQuery), [trimmedQuery]);
  const isLiveSearch = Boolean(plateQuery) || trimmedQuery.length >= 2;
  const remoteApiQuery = plateQuery ? plateQuery.paddedPlate : trimmedQuery;

  // Canlı şehir / ilçe / zirve / plaka araması
  useEffect(() => {
    if (!open) return;
    if (!isLiveSearch) {
      queueMicrotask(() => setSearching(false));
      return;
    }

    const controller = new AbortController();
    const delayMs = plateQuery ? 110 : 180;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(remoteApiQuery)}`, {
          signal: controller.signal
        });
        if (!res.ok) return;
        const data = await res.json();
        const rawList: GeoLocation[] = Array.isArray(data.results) ? data.results : [];
        const ordered = prioritizePlateMatches(rawList, plateQuery).slice(0, 8);
        setRemoteCities(ordered);
        setActiveIdx(0);
      } catch {
        // aborted
      } finally {
        if (!controller.signal.aborted) {
          setSearching(false);
        }
      }
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, isLiveSearch, remoteApiQuery, plateQuery]);

  const provinceSummary = bundle?.provinceSummary ?? null;

  const items = useMemo<PaletteItem[]>(() => {
    const q = trimmedQuery.toLowerCase();
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

    const toCityPaletteItem = (
      loc: GeoLocation,
      idPrefix: string,
      opts?: { roleLabel?: string; categoryLabel?: string }
    ): PaletteItem => {
      const trBadge = resolveTrProvinceBadge(loc);
      const terrainBadge = resolveTerrainBadge(loc);
      return {
        kind: "city",
        id: `${idPrefix}-${loc.id}`,
        label: loc.name,
        sub:
          [
            loc.district && loc.district !== loc.name ? loc.district : null,
            loc.admin1 && loc.admin1 !== loc.name ? loc.admin1 : null,
            loc.elevation !== undefined && Number.isFinite(loc.elevation)
              ? formatElevation(loc.elevation, unit)
              : null,
            loc.country || "İstasyon"
          ]
            .filter(Boolean)
            .join(" · ") || "Konum",
        loc,
        trBadge,
        roleLabel: opts?.roleLabel,
        terrainBadge,
        categoryLabel:
          opts?.categoryLabel ??
          (terrainBadge?.kind === "ski"
            ? "Kayak"
            : terrainBadge?.kind === "summit"
              ? "Zirve"
              : "Şehir")
      };
    };

    if (!isLiveSearch) {
      const seenIds = new Set<string>();
      const activeSubItems: PaletteItem[] = [];

      if (provinceSummary?.curatedSubLocations?.length) {
        for (const sub of provinceSummary.curatedSubLocations) {
          const roleLabel = SUBLOCATION_ROLE_LABEL_TR[sub.role] ?? "Alt Nokta";
          const isBursaRoot = sub.id === "bursa-tr";
          const subLoc: GeoLocation = {
            id: sub.id,
            name: sub.name,
            admin1: isBursaRoot
              ? DEFAULT_LOCATION.admin1
              : `${provinceSummary.provinceName} · Aktif İl Alt Noktası (${roleLabel})`,
            ...(isBursaRoot ? {} : { district: sub.name }),
            provinceCode: provinceSummary.provinceCode,
            country: "Türkiye",
            countryCode: "TR",
            lat: sub.lat,
            lon: sub.lon,
            elevation: sub.elevationM,
            timezone: "Europe/Istanbul"
          };
          seenIds.add(subLoc.id);
          activeSubItems.push(
            toCityPaletteItem(subLoc, "sub", {
              roleLabel,
              categoryLabel: "Alt Nokta"
            })
          );
        }
      }

      const quickCities: PaletteItem[] = [];
      for (const loc of [...TURKEY_SEVEN_REGION_PALETTE_CITIES, ...GLOBAL_PALETTE_CITIES]) {
        if (seenIds.has(loc.id)) continue;
        seenIds.add(loc.id);
        quickCities.push(toCityPaletteItem(loc, "c"));
      }

      return [...ROUTE_ITEMS, ...activeSubItems, ...quickCities, ...actions];
    }

    const matchedRoutes = ROUTE_ITEMS.filter(
      (r) =>
        r.label.toLowerCase().includes(q) || r.sub.toLowerCase().includes(q)
    );
    const matchedActions = actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) || a.sub.toLowerCase().includes(q)
    );
    const cityItems: PaletteItem[] = remoteCities.map((loc) =>
      toCityPaletteItem(loc, "rc")
    );
    return [...cityItems, ...matchedRoutes, ...matchedActions];
  }, [
    trimmedQuery,
    isLiveSearch,
    provinceSummary,
    remoteCities,
    unit,
    audioEnabled,
    gpsLoading
  ]);

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
      setActiveLocation(normalizeSelectedGeoLocation(item.loc));
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
            placeholder="Plaka (01-81), şehir, ilçe, zirve veya komut ara..."
            aria-label="Komut ve istasyon ara"
            className="w-full bg-transparent text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
          />
          {plateQuery && (
            <span className="shrink-0 rounded border border-sky-400/35 bg-sky-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-sky-300">
              {plateQuery.provinceCode}
            </span>
          )}
          {searching && (
            <span className="shrink-0 font-mono text-[11px] text-[var(--atmos-accent)]">
              Aranıyor...
            </span>
          )}
          <button
            type="button"
            onClick={handleClosePalette}
            aria-label="Komut merkezini kapat"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-ink-muted hover:text-ink-primary"
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
              {searching
                ? `"${query}" aranıyor...`
                : `“${query}” için eşleşme bulunamadı.`}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {items.map((item, idx) => {
                const active = idx === clampedIdx;
                const isExactPlateHit =
                  item.kind === "city" &&
                  Boolean(plateQuery) &&
                  item.trBadge === plateQuery?.provinceCode;

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
                            item.terrainBadge?.kind === "ski" ? (
                              <Snowflake className="h-4 w-4 text-cyan-300" />
                            ) : item.terrainBadge ? (
                              <Mountain className="h-4 w-4 text-sky-300" />
                            ) : (
                              <MapPin className="h-4 w-4 text-[var(--atmos-accent)]" />
                            )
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
                          <span className="flex items-center gap-1.5 truncate text-sm font-medium text-ink-primary">
                            {item.kind === "city" && item.trBadge && (
                              <span
                                className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none ${
                                  isExactPlateHit
                                    ? "border-sky-300/60 bg-sky-400/20 text-sky-200"
                                    : "border-white/14 bg-white/[0.05] text-sky-300/90"
                                }`}
                              >
                                {item.trBadge}
                              </span>
                            )}
                            <span className="truncate">{item.label}</span>
                            {item.kind === "city" && item.roleLabel && (
                              <span className="shrink-0 rounded border border-emerald-400/25 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase leading-none text-emerald-300">
                                {item.roleLabel}
                              </span>
                            )}
                            {item.kind === "city" && item.terrainBadge && (
                              <span
                                className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase leading-none ${
                                  item.terrainBadge.kind === "ski"
                                    ? "border-cyan-400/35 bg-cyan-500/15 text-cyan-200"
                                    : "border-sky-400/30 bg-sky-500/12 text-sky-200"
                                }`}
                              >
                                {item.terrainBadge.label}
                              </span>
                            )}
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
                              ? item.categoryLabel ?? "Şehir"
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
