"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { LocateFixed, MapPin, Mountain, Search, Snowflake, X } from "lucide-react";
import { useWeatherData } from "@/context/WeatherContext";
import type { GeoLocation } from "@/lib/weather-types";
import { DEFAULT_LOCATION, formatElevation, GLOBE_CITIES } from "@/lib/weather-client";

type CitySearchProps = {
  onSelect: (loc: GeoLocation) => void;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
};

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

type ShowcaseOptionMeta = {
  loc: GeoLocation;
  roleLabel?: string;
};

const SUBLOCATION_ROLE_LABEL_TR: Record<SubLocationRole, string> = {
  coast: "Kıyı",
  plain: "Ova",
  foothill: "Yamaç",
  summit: "Zirve"
};

/**
 * Lightweight 7-climate-region showcase (~1 KB, zero `catalog-1102` or `specs/*` client bundle import).
 */
const TURKEY_SEVEN_REGION_SHOWCASE: readonly GeoLocation[] = [
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

const GLOBAL_SHOWCASE_CITIES: readonly GeoLocation[] = GLOBE_CITIES.filter(
  (city) => city.countryCode !== "TR"
).map((city) => ({
  ...city,
  provinceCode: "GLOBAL"
}));

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

export default function CitySearch({
  onSelect,
  onOpenChange,
  placeholder = "Plaka (01-81), şehir, ilçe veya zirve ara..."
}: CitySearchProps) {
  const { bundle, unit, gpsLoading, gpsError, requestGpsLocation } = useWeatherData();

  const instanceId = useId();
  const listboxId = `${instanceId}-listbox`;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
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

  const trimmedQuery = query.trim();
  const plateQuery = useMemo(() => parseTrPlateQuery(trimmedQuery), [trimmedQuery]);
  const isLiveSearch = Boolean(plateQuery) || trimmedQuery.length >= 2;
  const remoteApiQuery = plateQuery ? plateQuery.paddedPlate : trimmedQuery;

  // Canlı coğrafi arama (2+ karakter VEYA 1-81 arası tek/çift haneli plaka kodu)
  useEffect(() => {
    if (!isLiveSearch) {
      queueMicrotask(() => setLoading(false));
      return;
    }

    const controller = new AbortController();
    const delayMs = plateQuery ? 120 : 200;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(remoteApiQuery)}`,
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data = await res.json();
        const rawList: GeoLocation[] = Array.isArray(data.results) ? data.results : [];
        const nextList = prioritizePlateMatches(rawList, plateQuery);
        setResults(nextList);
        setActiveIndex(nextList.length > 0 ? 0 : -1);
      } catch {
        // aborted or network error
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isLiveSearch, remoteApiQuery, plateQuery]);

  const provinceSummary = bundle?.provinceSummary ?? null;

  const emptyQueryShowcase = useMemo(() => {
    const options: ShowcaseOptionMeta[] = [];
    const sectionHeaders = new Map<number, { title: string; badge?: string }>();
    const seenIds = new Set<string>();

    if (provinceSummary?.curatedSubLocations?.length) {
      sectionHeaders.set(0, {
        title: "Aktif İl Alt Noktaları",
        badge: `${provinceSummary.provinceCode} · ${provinceSummary.provinceName}`
      });

      for (const sub of provinceSummary.curatedSubLocations) {
        const roleLabel = SUBLOCATION_ROLE_LABEL_TR[sub.role] ?? "Alt Nokta";
        const isBursaRoot = sub.id === "bursa-tr";
        const subLoc: GeoLocation = {
          id: sub.id,
          name: sub.name,
          admin1: isBursaRoot
            ? DEFAULT_LOCATION.admin1
            : `${provinceSummary.provinceName} · ${roleLabel}`,
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
        options.push({ loc: subLoc, roleLabel });
      }
    }

    const trStartIdx = options.length;
    for (const city of TURKEY_SEVEN_REGION_SHOWCASE) {
      if (seenIds.has(city.id)) continue;
      seenIds.add(city.id);
      options.push({ loc: city });
    }
    if (options.length > trStartIdx) {
      sectionHeaders.set(trStartIdx, {
        title: "Türkiye · 7 İklim Bölgesi",
        badge: "81 İl"
      });
    }

    const globalStartIdx = options.length;
    for (const city of GLOBAL_SHOWCASE_CITIES) {
      if (seenIds.has(city.id)) continue;
      seenIds.add(city.id);
      options.push({ loc: city });
    }
    if (options.length > globalStartIdx) {
      sectionHeaders.set(globalStartIdx, {
        title: "Küresel Şehirler"
      });
    }

    return { options, sectionHeaders };
  }, [provinceSummary]);

  const displayEntries = useMemo<ShowcaseOptionMeta[]>(() => {
    if (!isLiveSearch) {
      return emptyQueryShowcase.options;
    }
    return results.map((loc) => ({ loc }));
  }, [isLiveSearch, emptyQueryShowcase.options, results]);

  const displayResults = useMemo<GeoLocation[]>(
    () => displayEntries.map((entry) => entry.loc),
    [displayEntries]
  );

  // Klavye ile gezinirken aktif seçeneği görünür alanda tut
  useEffect(() => {
    if (!open || activeIndex < 0 || activeIndex >= displayResults.length) return;
    optionRefs.current[activeIndex]?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeIndex, displayResults.length]);

  const handleChoose = (loc: GeoLocation) => {
    onSelect(normalizeSelectedGeoLocation(loc));
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
        <div className="absolute left-0 right-0 sm:left-auto sm:right-0 sm:w-[23rem] top-[calc(100%+6px)] z-[65] overflow-hidden rounded-xl border border-white/18 bg-[#070c18]/98 shadow-[0_24px_64px_rgba(0,0,0,0.78)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] px-3.5 py-2 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5 truncate">
              {plateQuery ? (
                <>
                  <span>Plaka Kodu</span>
                  <span className="rounded border border-sky-400/35 bg-sky-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-sky-300">
                    {plateQuery.provinceCode}
                  </span>
                </>
              ) : !isLiveSearch ? (
                <span>Hızlı Seçim</span>
              ) : (
                <span>Ulusal &amp; Küresel Konumlar</span>
              )}
            </span>
            {loading && <span className="shrink-0 text-signal-sky">Aranıyor...</span>}
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
              {loading
                ? `"${query}" aranıyor...`
                : `“${query}” için sonuç bulunamadı.`}
            </p>
          ) : (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="İstasyon sonuçları"
              className="max-h-80 overflow-y-auto py-1"
            >
              {displayEntries.map(({ loc, roleLabel }, idx) => {
                const isSelected = idx === activeIndex;
                const trBadge = resolveTrProvinceBadge(loc);
                const terrainBadge = resolveTerrainBadge(loc);
                const isExactPlateHit =
                  Boolean(plateQuery) && trBadge === plateQuery?.provinceCode;
                const sectionHeader = !isLiveSearch
                  ? emptyQueryShowcase.sectionHeaders.get(idx)
                  : undefined;

                const subText =
                  loc.district &&
                  loc.district !== loc.name &&
                  loc.admin1 &&
                  !loc.admin1.includes(loc.district)
                    ? `${loc.district} · ${loc.admin1}`
                    : loc.admin1 && loc.admin1 !== loc.name
                      ? loc.admin1
                      : undefined;

                return (
                  <li key={`${isLiveSearch ? "q" : "s"}-${loc.id}-${idx}`} role="presentation">
                    {sectionHeader && (
                      <div
                        aria-hidden="true"
                        className={`flex items-center justify-between px-3.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400/90 ${
                          idx > 0 ? "mt-1 border-t border-white/[0.07]" : ""
                        }`}
                      >
                        <span>{sectionHeader.title}</span>
                        {sectionHeader.badge && (
                          <span className="font-mono text-[10px] font-normal text-sky-300/85">
                            {sectionHeader.badge}
                          </span>
                        )}
                      </div>
                    )}
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
                      className={`flex w-full items-center justify-between gap-2.5 px-3.5 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? "bg-white/[0.09] text-ink-primary"
                          : "text-ink-secondary hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {terrainBadge?.kind === "ski" ? (
                          <Snowflake
                            className="h-3.5 w-3.5 shrink-0 text-cyan-300"
                            aria-hidden="true"
                          />
                        ) : terrainBadge ? (
                          <Mountain
                            className="h-3.5 w-3.5 shrink-0 text-sky-300"
                            aria-hidden="true"
                          />
                        ) : (
                          <MapPin
                            className="h-3.5 w-3.5 shrink-0 text-ink-muted"
                            aria-hidden="true"
                          />
                        )}

                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 truncate">
                            {trBadge && (
                              <span
                                className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold leading-none ${
                                  isExactPlateHit
                                    ? "border-sky-300/60 bg-sky-400/20 text-sky-200"
                                    : "border-white/14 bg-white/[0.05] text-sky-300/90"
                                }`}
                              >
                                {trBadge}
                              </span>
                            )}
                            <span className="truncate font-medium text-ink-primary">
                              {loc.name}
                            </span>
                            {roleLabel && (
                              <span className="shrink-0 rounded border border-emerald-400/25 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase leading-none text-emerald-300">
                                {roleLabel}
                              </span>
                            )}
                            {terrainBadge && (
                              <span
                                className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase leading-none ${
                                  terrainBadge.kind === "ski"
                                    ? "border-cyan-400/35 bg-cyan-500/15 text-cyan-200"
                                    : "border-sky-400/30 bg-sky-500/12 text-sky-200"
                                }`}
                              >
                                {terrainBadge.label}
                              </span>
                            )}
                          </span>

                          {subText && (
                            <span className="block truncate text-[11px] text-ink-muted">
                              {subText}
                            </span>
                          )}
                        </span>
                      </span>

                      <span className="shrink-0 font-mono text-[11px] text-ink-muted tabular">
                        {loc.elevation !== undefined && Number.isFinite(loc.elevation)
                          ? `${formatElevation(loc.elevation, unit)} · `
                          : ""}
                        {trBadge ? "TR" : loc.country}
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
