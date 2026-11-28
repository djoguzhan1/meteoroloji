"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Clock,
  CloudRain,
  Droplets,
  Gauge,
  Globe,
  MapPin,
  Radio,
  RefreshCw,
  Star,
  Waves,
  Wind
} from "lucide-react";
import { useWeatherData, useWeatherStatus } from "@/context/WeatherContext";
import {
  readCachedWeatherBundleAsync,
  readCachedWeatherBundleSync,
  writeCachedWeatherBundle
} from "@/lib/client-forecast-cache";
import {
  areLocationsEquivalent,
  formatFreshnessAgeTr,
  reanchorWeatherBundleToNow
} from "@/lib/forecast-resilience";
import { buildLocationHref } from "@/lib/location-url";
import { isTrProvinceCode, type TrProvinceCode } from "@/lib/provinces/types";
import { resolveActiveTemporalView } from "@/lib/temporal-view";
import {
  ATMOS_REFRESH_ALL_EVENT,
  buildWeatherApiUrl,
  canonicalizeStationIdentity,
  formatDistance,
  formatElevation,
  formatLatLon,
  formatPrecip,
  formatPressure,
  formatPressureDelta,
  formatTemperature,
  formatWindSpeed,
  GLOBE_CITIES,
  PRESET_CITIES,
  windDirectionToCompass
} from "@/lib/weather-client";
import type { GeoLocation, MetarObservation, WeatherBundle } from "@/lib/weather-types";
import { atmosUiSfx } from "@/lib/ui-sfx";
import type {
  DecodedTr81Province,
  DecodedTr81Topology,
  LiveRadarFrameState,
  TrProvinceCenterMeta
} from "./LiveRadarMap";
import AnimatedNumber from "./AnimatedNumber";
import AnimatedWeatherIcon from "./AnimatedWeatherIcon";

const LiveRadarMap = dynamic(() => import("./LiveRadarMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#070c16] font-mono text-xs text-ink-muted">
      Doppler yağış radarı hazırlanıyor...
    </div>
  )
});

const GlobeScene = dynamic(() => import("./GlobeScene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[#05080f] text-xs font-mono text-ink-muted">
      3D Dünya Küresi yükleniyor...
    </div>
  )
});

const TR_PROVINCE_NAMES_BY_PLATE: readonly string[] = [
  "",
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

function normalizeTrAsciiToken(raw: string): string {
  return raw
    .normalize("NFC")
    .trim()
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/ı/g, "i")
    .replace(/Ş/g, "s")
    .replace(/ş/g, "s")
    .replace(/Ğ/g, "g")
    .replace(/ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/ü/g, "u")
    .replace(/Ö/g, "o")
    .replace(/ö/g, "o")
    .replace(/Ç/g, "c")
    .replace(/ç/g, "c")
    .replace(/Â/g, "a")
    .replace(/â/g, "a")
    .toLowerCase();
}

const CLIENT_ADMIN_TOKEN_TO_CODE: Readonly<Record<string, TrProvinceCode>> = (() => {
  const map: Record<string, TrProvinceCode> = {};
  for (let p = 1; p <= 81; p++) {
    const code = `TR-${String(p).padStart(2, "0")}` as TrProvinceCode;
    const norm = normalizeTrAsciiToken(TR_PROVINCE_NAMES_BY_PLATE[p]);
    map[norm] = code;
  }
  map["icel"] = "TR-33";
  map["afyon"] = "TR-03";
  map["antakya"] = "TR-31";
  map["izmit"] = "TR-41";
  map["adapazari"] = "TR-54";
  map["maras"] = "TR-46";
  map["urfa"] = "TR-63";
  map["antep"] = "TR-27";
  return Object.freeze(map);
})();

const REJECTED_GEO_REGION_NAMES = new Set([
  "marmara",
  "marmara bolgesi",
  "ege",
  "ege bolgesi",
  "akdeniz",
  "akdeniz bolgesi",
  "ic anadolu",
  "ic anadolu bolgesi",
  "karadeniz",
  "karadeniz bolgesi",
  "dogu anadolu",
  "dogu anadolu bolgesi",
  "guneydogu anadolu",
  "guneydogu anadolu bolgesi",
  "turkiye",
  "turkey"
]);

function inferTrProvinceCodeFromText(
  admin1?: string,
  name?: string,
  countryCode?: string
): TrProvinceCode | "GLOBAL" | null {
  if (countryCode && countryCode.toUpperCase() !== "TR") {
    return "GLOBAL";
  }
  for (const raw of [admin1, name]) {
    if (!raw) continue;
    const upper = raw.trim().toUpperCase();
    if (isTrProvinceCode(upper)) return upper;
    const parts = normalizeTrAsciiToken(raw)
      .split(/[·,/|()[\]\u2013\u2014-]+/)
      .map((s) => s.replace(/\b(?:ili|province|merkez)\b/g, "").trim())
      .filter(Boolean);
    for (const part of parts) {
      if (REJECTED_GEO_REGION_NAMES.has(part) || part.includes("bolgesi")) continue;
      const hit = CLIENT_ADMIN_TOKEN_TO_CODE[part];
      if (hit) return hit;
    }
  }
  return null;
}

function isGeographicRegionLabel(raw: string | undefined): boolean {
  if (!raw) return false;
  const norm = normalizeTrAsciiToken(raw);
  return REJECTED_GEO_REGION_NAMES.has(norm) || norm.includes("bolgesi") || norm.includes("region");
}

const BURSA_ONLY_STATION_IDS = new Set([
  "17116-OSM",
  "OSM-ETEK",
  "NILUFER",
  "YILDIRIM",
  "KESTEL",
  "GURSU",
  "MUDANYA",
  "GEMLIK",
  "KARACABEY",
  "ULUDAG",
  "SARIALAN",
  "LTBR"
]);

const TR_AIRPORT_OWNER_BY_ICAO: Readonly<Record<string, TrProvinceCode>> = Object.freeze({
  LTAF: "TR-01", LTAG: "TR-01", LTCP: "TR-02", LTAH: "TR-03", LTCO: "TR-04",
  LTAP: "TR-05", LTAC: "TR-06", LTAB: "TR-06", LTAD: "TR-06", LTAI: "TR-07",
  LTFG: "TR-07", LTBD: "TR-09", LTBF: "TR-10", LTBG: "TR-10", LTFD: "TR-10",
  LTCU: "TR-12", LTBR: "TR-16", LTBH: "TR-17", LTFK: "TR-17", LTAY: "TR-20",
  LTCC: "TR-21", LTCA: "TR-23", LTCD: "TR-24", LTCE: "TR-25", LTBY: "TR-26",
  LTBI: "TR-26", LTAJ: "TR-27", LTCW: "TR-30", LTDA: "TR-31", LTFC: "TR-32",
  LTDB: "TR-33", LTFM: "TR-34", LTFJ: "TR-34", LTBA: "TR-34", LTBJ: "TR-35",
  LTBL: "TR-35", LTCF: "TR-36", LTAL: "TR-37", LTAU: "TR-38", LTBQ: "TR-41",
  LTAN: "TR-42", LTBZ: "TR-43", LTBN: "TR-43", LTAT: "TR-44", LTBT: "TR-45",
  LTCN: "TR-46", LTCR: "TR-47", LTBS: "TR-48", LTFE: "TR-48", LTCK: "TR-49",
  LTAZ: "TR-50", LTCB: "TR-52", LTFO: "TR-53", LTFH: "TR-55", LTCL: "TR-56",
  LTCM: "TR-57", LTAR: "TR-58", LTBU: "TR-59", LTAW: "TR-60", LTCG: "TR-61",
  LTCS: "TR-63", LTBO: "TR-64", LTCI: "TR-65", LTAS: "TR-67", LTCJ: "TR-72",
  LTCV: "TR-73", LTCT: "TR-76"
});

function isStationOwnedByActiveProvince(
  st: MetarObservation,
  activeProvinceCode: TrProvinceCode | "GLOBAL" | null
): boolean {
  const code = String(st.icaoId || "").trim().toUpperCase();
  if (!code) return false;
  if (activeProvinceCode && isTrProvinceCode(activeProvinceCode)) {
    if (BURSA_ONLY_STATION_IDS.has(code) && activeProvinceCode !== "TR-16") {
      return false;
    }
    const airportOwner = TR_AIRPORT_OWNER_BY_ICAO[code];
    if (airportOwner && airportOwner !== activeProvinceCode) {
      return false;
    }
    if (/^(?:LG|UG|UD|OS|OI|LB|LC)[A-Z]{2}$/.test(code)) {
      return false;
    }
    const stProv = (st as MetarObservation & { provinceCode?: string }).provinceCode;
    if (stProv && stProv !== activeProvinceCode) {
      return false;
    }
    return true;
  }
  if (activeProvinceCode === "GLOBAL") {
    return !BURSA_ONLY_STATION_IDS.has(code);
  }
  return true;
}

function buildProvinceCenterLocation(meta: TrProvinceCenterMeta): GeoLocation {
  const presetMatch = PRESET_CITIES.find(
    (c) =>
      c.countryCode === "TR" &&
      normalizeTrAsciiToken(c.name) === normalizeTrAsciiToken(meta.nameTr)
  );
  if (presetMatch) {
    return {
      ...presetMatch,
      provinceCode: meta.code
    };
  }
  const slug = normalizeTrAsciiToken(meta.nameTr).replace(/[^a-z0-9]+/g, "-");
  return canonicalizeStationIdentity({
    id: meta.code === "TR-16" ? "bursa-tr" : `tr-${String(meta.plateNumber).padStart(2, "0")}-${slug}`,
    name: meta.nameTr,
    admin1: meta.nameTr,
    provinceCode: meta.code,
    country: "Türkiye",
    countryCode: "TR",
    lat: meta.lat,
    lon: meta.lon,
    elevation: meta.elevationM,
    timezone: "Europe/Istanbul"
  });
}

function formatRadarNowcastSummary(meta?: {
  radarSummaryCode?: string;
  nextRainOnsetMin?: number | null;
  rainCessationMin?: number | null;
}): { badge: string; toneClass: string } {
  const code = meta?.radarSummaryCode ?? "DRY_CLEAR";
  if (code === "RAIN_ACTIVE") {
    return {
      badge: "Aktif Yağış Ekosu",
      toneClass: "border-sky-400/35 bg-sky-400/12 text-sky-200"
    };
  }
  if (code === "RAIN_ENDING") {
    const min = meta?.rainCessationMin;
    return {
      badge: min ? `Yağış Çekiliyor (~${min} dk)` : "Yağış Zayıflıyor",
      toneClass: "border-emerald-400/35 bg-emerald-400/12 text-emerald-200"
    };
  }
  if (code === "RAIN_APPROACHING") {
    const min = meta?.nextRainOnsetMin;
    return {
      badge: min ? `Yağış Yaklaşıyor (~${min} dk)` : "Yağış Yaklaşıyor",
      toneClass: "border-amber-400/35 bg-amber-400/12 text-amber-200"
    };
  }
  if (code === "VIRGA_ALOFT") {
    return {
      badge: "Virga (Alt Katmanda Buharlaşma)",
      toneClass: "border-white/15 bg-white/[0.05] text-ink-secondary"
    };
  }
  return {
    badge: "Aktif Yağış Ekosu Yok",
    toneClass: "border-white/10 bg-white/[0.04] text-ink-secondary"
  };
}

interface LazyRadarGeoModule {
  trTopo: DecodedTr81Topology | null;
  centersByCode: Readonly<Record<TrProvinceCode, TrProvinceCenterMeta>>;
  findProvinceAt: (
    topo: DecodedTr81Topology | null | undefined,
    lat: number,
    lon: number
  ) => DecodedTr81Province | null;
}

export default function WorldView() {
  const router = useRouter();
  const {
    bundle,
    activeLocation,
    promoteLocationWithBundle,
    addFavorite,
    isFavorite,
    unit
  } = useWeatherData();
  const { recoveryCount, isOffline } = useWeatherStatus();

  const [viewMode, setViewMode] = useState<"radar" | "globe">("radar");
  const [manualPick, setManualPick] = useState<{
    baseId: string;
    loc: GeoLocation;
    bundle: WeatherBundle | null;
  } | null>(null);
  const [fetching, setFetching] = useState(false);
  const [pointError, setPointError] = useState<string | null>(null);
  const [radarFrameState, setRadarFrameState] = useState<LiveRadarFrameState | null>(null);
  const [radarGeo, setRadarGeo] = useState<LazyRadarGeoModule | null>(null);

  const requestSeqRef = useRef(0);
  const pointAbortRef = useRef<AbortController | null>(null);
  const manualPickRef = useRef(manualPick);

  useEffect(() => {
    manualPickRef.current = manualPick;
  }, [manualPick]);

  // Abort any in-flight coordinate/city request on unmount
  useEffect(() => {
    return () => {
      pointAbortRef.current?.abort();
    };
  }, []);

  // Lazy-bind shared in-memory `tr-81-adm1-topo.json` solver from the `/world` dynamic chunk
  useEffect(() => {
    if (typeof window === "undefined") return;
    let mounted = true;
    void import("./LiveRadarMap")
      .then(async (mod) => {
        const topo = await mod.loadTr81Adm1Topology().catch(() => null);
        if (!mounted) return;
        setRadarGeo({
          trTopo: topo,
          centersByCode: mod.TR81_PROVINCE_CENTERS,
          findProvinceAt: mod.findTrProvinceAtLatLon
        });
      })
      .catch(() => null);
    return () => {
      mounted = false;
    };
  }, []);

  // When global `activeLocation` changes in header/search, abort stale manual requests & clear residual state
  useEffect(() => {
    pointAbortRef.current?.abort();
    pointAbortRef.current = null;
    queueMicrotask(() => {
      setManualPick((prev) =>
        prev && prev.baseId !== activeLocation.id ? null : prev
      );
      setFetching(false);
      setPointError(null);
    });
  }, [
    activeLocation.id,
    activeLocation.lat,
    activeLocation.lon,
    activeLocation.provinceCode
  ]);

  const isManualActive =
    manualPick !== null && manualPick.baseId === activeLocation.id;
  const selectedLoc = isManualActive ? manualPick.loc : activeLocation;
  const rawCandidateBundle = isManualActive ? manualPick.bundle : bundle;

  // Strict location & province firewall: NEVER allow a previous city's bundle to linger on screen
  const pointBundle = useMemo(() => {
    if (!rawCandidateBundle) return null;
    const directEq = areLocationsEquivalent(rawCandidateBundle.location, selectedLoc, 0.08);
    const canonEq =
      directEq ||
      areLocationsEquivalent(
        canonicalizeStationIdentity(rawCandidateBundle.location),
        canonicalizeStationIdentity(selectedLoc),
        0.08
      );
    if (!canonEq) return null;
    if (
      selectedLoc.provinceCode &&
      rawCandidateBundle.location.provinceCode &&
      selectedLoc.provinceCode !== rawCandidateBundle.location.provinceCode
    ) {
      return null;
    }
    return rawCandidateBundle;
  }, [rawCandidateBundle, selectedLoc]);

  // Resolve authoritative active province code (`TR-01`..`TR-81` or `"GLOBAL"`)
  const activeProvinceCode = useMemo((): TrProvinceCode | "GLOBAL" | null => {
    const candidates = [
      selectedLoc.provinceCode,
      pointBundle?.location.provinceCode,
      pointBundle?.hybrid.engineMeta?.provinceCode,
      pointBundle?.provinceSummary?.provinceCode
    ];
    for (const c of candidates) {
      if (isTrProvinceCode(c)) return c;
      if (c === "GLOBAL") return "GLOBAL";
    }
    if (radarGeo?.trTopo) {
      const polyHit = radarGeo.findProvinceAt(
        radarGeo.trTopo,
        selectedLoc.lat,
        selectedLoc.lon
      );
      if (polyHit) return polyHit.code;
      if (
        selectedLoc.lon < 25.4 ||
        selectedLoc.lon > 45.0 ||
        selectedLoc.lat < 35.7 ||
        selectedLoc.lat > 42.3
      ) {
        return "GLOBAL";
      }
    }
    return inferTrProvinceCodeFromText(
      selectedLoc.admin1,
      selectedLoc.name,
      selectedLoc.countryCode
    );
  }, [selectedLoc, pointBundle, radarGeo]);

  const activeProvinceName = useMemo((): string | null => {
    if (activeProvinceCode && isTrProvinceCode(activeProvinceCode)) {
      const plate = Number(activeProvinceCode.slice(3));
      return (
        pointBundle?.provinceSummary?.provinceName ||
        pointBundle?.hybrid.engineMeta?.provinceName ||
        TR_PROVINCE_NAMES_BY_PLATE[plate] ||
        null
      );
    }
    return null;
  }, [activeProvinceCode, pointBundle]);

  // 100% SSOT Data Parity with Weather ("Hava") tab via resolveActiveTemporalView(pointBundle, 0)
  const temporal = useMemo(
    () => (pointBundle ? resolveActiveTemporalView(pointBundle, 0) : null),
    [pointBundle]
  );

  const fetchPoint = useCallback(
    async (
      rawLoc: GeoLocation,
      opts?: { forceRefresh?: boolean; sharedController?: AbortController }
    ) => {
      const canon = canonicalizeStationIdentity(rawLoc);
      const polyHit =
        radarGeo?.trTopo && !canon.provinceCode
          ? radarGeo.findProvinceAt(radarGeo.trTopo, canon.lat, canon.lon)
          : null;
      const loc: GeoLocation = polyHit
        ? {
            ...canon,
            provinceCode: polyHit.code,
            admin1:
              canon.admin1 && !isGeographicRegionLabel(canon.admin1)
                ? canon.admin1
                : polyHit.nameTr,
            country: canon.country || "Türkiye",
            countryCode: canon.countryCode || "TR",
            timezone: canon.timezone || "Europe/Istanbul"
          }
        : canon;

      if (!opts?.sharedController) {
        pointAbortRef.current?.abort();
      }
      const controller = opts?.sharedController ?? new AbortController();
      pointAbortRef.current = controller;

      const seq = ++requestSeqRef.current;
      const baseId = activeLocation.id;

      // Zero duplicate request when selecting the active location whose context bundle is already live
      const matchesActiveLive =
        !opts?.forceRefresh &&
        areLocationsEquivalent(loc, activeLocation) &&
        bundle !== null &&
        areLocationsEquivalent(bundle.location, loc) &&
        (bundle.freshness?.status ?? "live") === "live";

      if (matchesActiveLive) {
        setManualPick(null);
        setFetching(false);
        setPointError(null);
        return;
      }

      // Strict city isolation: only prefill if existing bundle belongs to `loc`, or L4 vault has `loc`
      const prevPick = manualPickRef.current;
      const sameAsPrevPick =
        prevPick !== null &&
        prevPick.bundle !== null &&
        areLocationsEquivalent(prevPick.bundle.location, loc);
      const sameAsContext =
        bundle !== null && areLocationsEquivalent(bundle.location, loc);

      const initialPointBundle = sameAsPrevPick
        ? prevPick.bundle
        : sameAsContext
          ? bundle
          : readCachedWeatherBundleSync(loc, Date.now(), { forceStale: isOffline });

      setManualPick({
        baseId,
        loc,
        bundle: initialPointBundle
      });
      setFetching(true);
      setPointError(null);

      try {
        const res = await fetch(buildWeatherApiUrl(loc), {
          signal: controller.signal,
          cache: opts?.forceRefresh || initialPointBundle ? "no-store" : "default"
        });
        if (controller.signal.aborted || seq !== requestSeqRef.current) return;
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }
        const data: WeatherBundle = await res.json();
        if (controller.signal.aborted || seq !== requestSeqRef.current) return;
        const merged: WeatherBundle = {
          ...data,
          location: {
            ...data.location,
            id: loc.id || data.location.id,
            name: loc.name || data.location.name,
            admin1:
              loc.admin1 && !isGeographicRegionLabel(loc.admin1)
                ? loc.admin1
                : data.location.admin1,
            provinceCode: data.location.provinceCode ?? loc.provinceCode,
            country: loc.country || data.location.country,
            countryCode: loc.countryCode ?? data.location.countryCode,
            elevation: loc.elevation ?? data.location.elevation,
            timezone: data.location.timezone ?? loc.timezone
          }
        };
        if ((merged.freshness?.status ?? "live") === "live") {
          writeCachedWeatherBundle(merged);
        }
        setManualPick({
          baseId,
          loc: merged.location,
          bundle: merged
        });
        setPointError(null);
      } catch (e) {
        if (
          controller.signal.aborted ||
          (e instanceof Error && e.name === "AbortError") ||
          seq !== requestSeqRef.current
        ) {
          return;
        }
        const msg =
          e instanceof Error
            ? e.message
            : "Seçili koordinat için canlı veri alınamadı.";

        if (initialPointBundle) {
          const staleCopy = reanchorWeatherBundleToNow(
            initialPointBundle,
            Date.now(),
            {
              status: "stale",
              sourceTier:
                initialPointBundle.freshness?.sourceTier === "live"
                  ? "client-cache"
                  : (initialPointBundle.freshness?.sourceTier ?? "client-cache"),
              cachedAtMs:
                initialPointBundle.freshness?.cachedAtMs ??
                Date.parse(initialPointBundle.fetchedAt),
              staleReason: msg,
              modelsRespondedCount: initialPointBundle.hybrid.activeModels.length
            }
          );
          setManualPick({ baseId, loc, bundle: staleCopy });
          setPointError(null);
        } else {
          const idbHit = await readCachedWeatherBundleAsync(loc, Date.now(), {
            forceStale: true,
            staleReason: msg
          });
          if (controller.signal.aborted || seq !== requestSeqRef.current) return;
          if (idbHit) {
            setManualPick({ baseId, loc, bundle: idbHit });
            setPointError(null);
          } else {
            setPointError(msg);
          }
        }
      } finally {
        if (!controller.signal.aborted && seq === requestSeqRef.current) {
          setFetching(false);
        }
      }
    },
    [activeLocation, bundle, isOffline, radarGeo]
  );

  // Auto-recover manually selected coordinate/city when live connection returns
  useEffect(() => {
    if (recoveryCount <= 0) return;
    const cur = manualPickRef.current;
    if (!cur || cur.baseId !== activeLocation.id) return;
    if (!cur.bundle || (cur.bundle.freshness?.status ?? "live") !== "live") {
      queueMicrotask(() => {
        void fetchPoint(cur.loc, { forceRefresh: true });
      });
    }
  }, [recoveryCount, activeLocation.id, fetchPoint]);

  // Global refresh listener: refreshes manualPick when user triggers global refresh
  useEffect(() => {
    const onGlobalRefresh = () => {
      const cur = manualPickRef.current;
      if (cur && cur.baseId === activeLocation.id) {
        void fetchPoint(cur.loc, { forceRefresh: true });
      }
    };
    window.addEventListener(ATMOS_REFRESH_ALL_EVENT, onGlobalRefresh);
    return () => window.removeEventListener(ATMOS_REFRESH_ALL_EVENT, onGlobalRefresh);
  }, [activeLocation.id, fetchPoint]);

  const handlePickProvince = useCallback(
    (provMeta: TrProvinceCenterMeta) => {
      atmosUiSfx.playNavTick();
      const targetLoc = buildProvinceCenterLocation(provMeta);
      void fetchPoint(targetLoc);
    },
    [fetchPoint]
  );

  const handlePickCoords = useCallback(
    async (lat: number, lon: number) => {
      pointAbortRef.current?.abort();
      const controller = new AbortController();
      pointAbortRef.current = controller;

      const seq = ++requestSeqRef.current;
      const baseId = activeLocation.id;
      const hitProv = radarGeo?.trTopo
        ? radarGeo.findProvinceAt(radarGeo.trTopo, lat, lon)
        : null;

      const fallbackCoordLabel = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
      // Immediate optimistic update: clears stale markers/water-body and highlights clicked province in 0ms
      setManualPick({
        baseId,
        loc: {
          id: `coord_${lat.toFixed(4)}_${lon.toFixed(4)}`,
          name: hitProv ? `${hitProv.nameTr} (${fallbackCoordLabel})` : fallbackCoordLabel,
          admin1: hitProv?.nameTr,
          provinceCode: hitProv ? hitProv.code : radarGeo?.trTopo ? "GLOBAL" : undefined,
          country: hitProv ? "Türkiye" : "Koordinat",
          countryCode: hitProv ? "TR" : undefined,
          lat,
          lon,
          timezone: hitProv ? "Europe/Istanbul" : undefined
        },
        bundle: null
      });
      setFetching(true);
      setPointError(null);

      let name = hitProv ? hitProv.nameTr : fallbackCoordLabel;
      let country = hitProv ? "Türkiye" : "Koordinat";
      let admin1: string | undefined = hitProv?.nameTr;
      let countryCode: string | undefined = hitProv ? "TR" : undefined;
      let elevation: number | undefined;
      let timezone: string | undefined = hitProv ? "Europe/Istanbul" : undefined;

      try {
        const r = await fetch(
          `/api/reverse-geocode?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`,
          { signal: controller.signal }
        );
        if (r.ok) {
          const geo = await r.json();
          if (geo.name && !isGeographicRegionLabel(String(geo.name))) {
            name = String(geo.name);
          }
          if (!hitProv) {
            country = geo.country || country;
            if (
              typeof geo.admin1 === "string" &&
              geo.admin1.trim() &&
              !isGeographicRegionLabel(geo.admin1)
            ) {
              admin1 = geo.admin1.trim();
            }
            if (typeof geo.countryCode === "string" && geo.countryCode.trim()) {
              countryCode = geo.countryCode.trim().toUpperCase();
            }
            if (typeof geo.timezone === "string" && geo.timezone.trim()) {
              timezone = geo.timezone.trim();
            }
          }
          if (typeof geo.elevation === "number" && Number.isFinite(geo.elevation)) {
            elevation = Math.round(geo.elevation);
          }
        }
      } catch (err) {
        if (controller.signal.aborted || (err instanceof Error && err.name === "AbortError")) {
          return;
        }
      }
      if (controller.signal.aborted || seq !== requestSeqRef.current) return;

      const loc = canonicalizeStationIdentity({
        id: `coord_${lat.toFixed(4)}_${lon.toFixed(4)}`,
        name,
        admin1,
        provinceCode: hitProv ? hitProv.code : countryCode && countryCode !== "TR" ? "GLOBAL" : undefined,
        country,
        countryCode,
        lat,
        lon,
        elevation,
        timezone
      });
      await fetchPoint(loc, { sharedController: controller });
    },
    [activeLocation.id, fetchPoint, radarGeo]
  );

  const fav = isFavorite(selectedLoc);
  const isPointArchive = Boolean(
    pointBundle &&
      (isOffline || (pointBundle.freshness?.status ?? "live") === "stale")
  );
  const engineMeta = pointBundle?.hybrid.engineMeta;
  const nowcastUi = formatRadarNowcastSummary(engineMeta);

  // Strictly province-scoped active water body (`waterBodyLabelTr` & `seaOrLakeTempC`; Marmara fallback ONLY for TR-16)
  const activeWaterBody = useMemo(() => {
    if (!pointBundle) return null;
    if (
      engineMeta?.waterBodyLabelTr &&
      typeof engineMeta.seaOrLakeTempC === "number" &&
      Number.isFinite(engineMeta.seaOrLakeTempC)
    ) {
      return {
        labelTr: engineMeta.waterBodyLabelTr,
        tempC: engineMeta.seaOrLakeTempC
      };
    }
    const summaryBody = pointBundle.provinceSummary?.activeWaterBodies?.find(
      (wb) => typeof wb.liveTempC === "number" && Number.isFinite(wb.liveTempC)
    );
    if (
      summaryBody &&
      typeof summaryBody.liveTempC === "number" &&
      (!pointBundle.provinceSummary?.provinceCode ||
        !activeProvinceCode ||
        pointBundle.provinceSummary.provinceCode === activeProvinceCode)
    ) {
      return {
        labelTr: summaryBody.labelTr,
        tempC: summaryBody.liveTempC
      };
    }
    if (
      activeProvinceCode === "TR-16" &&
      typeof engineMeta?.marmaraSstC === "number" &&
      Number.isFinite(engineMeta.marmaraSstC)
    ) {
      return {
        labelTr: "Marmara Denizi",
        tempC: engineMeta.marmaraSstC
      };
    }
    return null;
  }, [pointBundle, engineMeta, activeProvinceCode]);

  // Strictly province-scoped verification stations (`bundle?.hybrid?.verification?.stations`)
  const activeVerificationStations = useMemo(() => {
    const list = pointBundle?.hybrid?.verification?.stations;
    if (!list || list.length === 0) return [];
    return list.filter((st) => isStationOwnedByActiveProvince(st, activeProvinceCode));
  }, [pointBundle, activeProvinceCode]);

  // Province-scoped curated microclimate sub-locations (coast / plain / foothill / summit)
  const activeProvinceSubLocations = useMemo(() => {
    const summary = pointBundle?.provinceSummary;
    if (!summary || !activeProvinceCode || summary.provinceCode !== activeProvinceCode) {
      return undefined;
    }
    return summary.curatedSubLocations;
  }, [pointBundle?.provinceSummary, activeProvinceCode]);

  const quickStripCities = useMemo(() => {
    const inPreset = GLOBE_CITIES.some((c) => areLocationsEquivalent(c, selectedLoc));
    if (inPreset) return GLOBE_CITIES;
    return [selectedLoc, ...GLOBE_CITIES];
  }, [selectedLoc]);

  const liveRainMmHr =
    typeof engineMeta?.currentRadarRainMmHr === "number" && engineMeta.radarAvailable
      ? engineMeta.currentRadarRainMmHr
      : (temporal?.telemetry.precipitation ?? pointBundle?.current.precipitation ?? 0);
  const liveRadarDbz =
    typeof engineMeta?.currentRadarDbz === "number" ? engineMeta.currentRadarDbz : 0;

  // Synchronize Doppler box with timeline player frame (+5..+30m forecast steps & -120..-5m archive label)
  const syncedDopplerReadout = useMemo(() => {
    if (viewMode !== "radar" || !radarFrameState) {
      return {
        rainMmHr: liveRainMmHr,
        dbz: liveRadarDbz,
        frameNote: null as string | null,
        isForecastStep: false
      };
    }

    const { deltaMin, isForecast } = radarFrameState;
    if (isForecast || deltaMin >= 5) {
      const steps = engineMeta?.nowcastSteps5Min ?? [];
      if (steps.length > 0) {
        let best = steps[0];
        let bestDiff = Math.abs(best.offsetMin - deltaMin);
        for (let i = 1; i < steps.length; i++) {
          const diff = Math.abs(steps[i].offsetMin - deltaMin);
          if (diff < bestDiff) {
            best = steps[i];
            bestDiff = diff;
          }
        }
        return {
          rainMmHr: best.rainMmHr,
          dbz: best.dbz,
          frameNote: `+${best.offsetMin} dk Nowcast${best.virga ? " · Virga" : ""}`,
          isForecastStep: true
        };
      }
      return {
        rainMmHr: liveRainMmHr,
        dbz: liveRadarDbz,
        frameNote: `+${Math.max(5, deltaMin)} dk Tahmin`,
        isForecastStep: true
      };
    }

    if (deltaMin <= -5) {
      return {
        rainMmHr: liveRainMmHr,
        dbz: liveRadarDbz,
        frameNote: `Yüzey: Canlı · Radar: -${Math.abs(deltaMin)} dk Arşiv`,
        isForecastStep: false
      };
    }

    return {
      rainMmHr: liveRainMmHr,
      dbz: liveRadarDbz,
      frameNote: null,
      isForecastStep: false
    };
  }, [viewMode, radarFrameState, engineMeta?.nowcastSteps5Min, liveRainMmHr, liveRadarDbz]);

  const resolvedElevationM =
    selectedLoc.elevation ?? pointBundle?.location.elevation;

  const adminSubtitle = useMemo(() => {
    const cleanAdmin =
      selectedLoc.admin1 && !isGeographicRegionLabel(selectedLoc.admin1)
        ? selectedLoc.admin1
        : activeProvinceName ?? undefined;
    return [cleanAdmin, selectedLoc.country].filter(Boolean).join(" · ");
  }, [selectedLoc.admin1, selectedLoc.country, activeProvinceName]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Kompakt Üst Başlık + Görünüm Geçişi */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-primary sm:text-3xl">
          Radar & Dünya Küresi
        </h1>

        {/* Mod Seçici */}
        <div
          className="inline-flex rounded-xl border border-white/10 bg-obsidian-900/90 p-1"
          role="tablist"
          aria-label="Harita görünüm modu"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "radar"}
            onClick={() => {
              atmosUiSfx.playNavTick();
              setViewMode("radar");
            }}
            className={`atmos-btn inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium ${
              viewMode === "radar"
                ? "border border-[rgba(var(--atmos-rim-rgb),0.3)] bg-white/15 text-white"
                : "border border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-[var(--atmos-accent)]" />
            <span>Yağış Radarı</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === "globe"}
            onClick={() => {
              atmosUiSfx.playNavTick();
              setViewMode("globe");
            }}
            className={`atmos-btn inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium ${
              viewMode === "globe"
                ? "border border-[rgba(var(--atmos-rim-rgb),0.3)] bg-white/15 text-white"
                : "border border-transparent text-ink-secondary hover:text-ink-primary"
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-[var(--atmos-accent)]" />
            <span>3D Küre</span>
          </button>
        </div>
      </div>

      {/* Tek Satır Kaydırılabilir Hızlı İstasyon Şeridi + 81 İl Seçici */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {radarGeo && (
          <label className="sr-only" htmlFor="world-tr81-select">
            81 İl Hızlı Seçim
          </label>
        )}
        {radarGeo && (
          <select
            id="world-tr81-select"
            aria-label="81 İl Hızlı Seçim"
            value={activeProvinceCode && isTrProvinceCode(activeProvinceCode) ? activeProvinceCode : ""}
            onChange={(ev) => {
              const code = ev.target.value;
              if (isTrProvinceCode(code)) {
                const meta = radarGeo.centersByCode[code];
                if (meta) handlePickProvince(meta);
              }
            }}
            className="shrink-0 rounded-lg border border-sky-400/30 bg-obsidian-900/95 px-2.5 py-1.5 font-mono text-xs font-medium text-sky-200 focus:border-sky-400 focus:outline-none"
          >
            <option value="">81 İl Seç...</option>
            {Array.from({ length: 81 }, (_, idx) => {
              const plate = idx + 1;
              const code = `TR-${String(plate).padStart(2, "0")}` as TrProvinceCode;
              const pName = TR_PROVINCE_NAMES_BY_PLATE[plate];
              return (
                <option key={code} value={code}>
                  {String(plate).padStart(2, "0")} · {pName}
                </option>
              );
            })}
          </select>
        )}

        {quickStripCities.map((city) => {
          const active = areLocationsEquivalent(selectedLoc, city);
          return (
            <button
              key={city.id}
              type="button"
              onClick={() => {
                atmosUiSfx.playNavTick();
                void fetchPoint(city);
              }}
              className={`atmos-btn shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                active
                  ? "border-[rgba(var(--atmos-rim-rgb),0.4)] bg-[rgba(var(--atmos-accent-rgb),0.16)] text-white"
                  : "border-white/[0.08] bg-white/[0.03] text-ink-secondary hover:text-ink-primary"
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>

      {/* Ana Harita / Küre + Sağ Ölçüm Kartı */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.85fr)]">
        <div className="surface-panel relative h-[clamp(340px,calc(100svh-264px-env(safe-area-inset-bottom,0px)),460px)] sm:h-[560px] lg:h-[580px] overflow-hidden">
          {viewMode === "radar" ? (
            <LiveRadarMap
              selectedLat={selectedLoc.lat}
              selectedLon={selectedLoc.lon}
              selectedProvinceCode={activeProvinceCode}
              selectedProvinceName={activeProvinceName}
              activeWaterBody={activeWaterBody}
              verificationStations={activeVerificationStations}
              provinceSubLocations={activeProvinceSubLocations}
              presetCities={GLOBE_CITIES}
              onPickCoords={(lat, lon) => void handlePickCoords(lat, lon)}
              onPickCity={(city) => void fetchPoint(city)}
              onPickProvince={handlePickProvince}
              unit={unit}
              timeZone={pointBundle?.timezone ?? selectedLoc.timezone}
              utcOffsetSeconds={pointBundle?.utcOffsetSeconds}
              convectiveCells={temporal?.lightningRadar.cells}
              advectionFromDeg={engineMeta?.radarAdvectionFromDeg}
              advectionSpeedKmh={engineMeta?.radarAdvectionSpeedKmh}
              onFrameStateChange={setRadarFrameState}
            />
          ) : (
            <GlobeScene
              selectedLat={selectedLoc.lat}
              selectedLon={selectedLoc.lon}
              homeLat={activeLocation.lat}
              homeLon={activeLocation.lon}
              presetCities={GLOBE_CITIES}
              selectedCloudCover={temporal?.telemetry.cloudCover}
              onPickCoords={(lat, lon) => void handlePickCoords(lat, lon)}
              onPickCity={(city) => void fetchPoint(city)}
            />
          )}
        </div>

        {/* Sağ Seçili Nokta Telemetri Kartı */}
        <div className="surface-panel flex flex-col justify-between p-5 sm:p-6 space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-ink-muted tabular">
                  <MapPin className="h-3.5 w-3.5 text-signal-sky" />
                  <span>{formatLatLon(selectedLoc.lat, selectedLoc.lon, 3)}</span>
                  {resolvedElevationM !== undefined && Number.isFinite(resolvedElevationM) && (
                    <>
                      <span>·</span>
                      <span>Rakım {formatElevation(resolvedElevationM, unit)}</span>
                    </>
                  )}
                  {activeProvinceCode && (
                    <span className="rounded border border-sky-400/35 bg-sky-400/12 px-1.5 py-0.5 text-[10px] font-medium text-sky-200">
                      {isTrProvinceCode(activeProvinceCode) && activeProvinceName
                        ? `${activeProvinceCode} · ${activeProvinceName}`
                        : activeProvinceCode === "GLOBAL"
                          ? "KÜRESEL"
                          : activeProvinceCode}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl font-semibold text-ink-primary">
                    {selectedLoc.name}
                  </h2>
                  {isPointArchive && pointBundle && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-signal-amber/35 bg-signal-amber/12 px-2 py-0.5 font-mono text-[10px] text-amber-200 tabular">
                      <Clock className="h-2.5 w-2.5 text-signal-amber" />
                      <span>Arşiv · {formatFreshnessAgeTr(pointBundle.fetchedAt)}</span>
                    </span>
                  )}
                </div>
                {adminSubtitle && (
                  <p className="text-xs text-ink-secondary">{adminSubtitle}</p>
                )}
              </div>
              {fetching && (
                <span className="rounded-md border border-white/10 bg-white/[0.05] px-2 py-1 font-mono text-[11px] text-ink-secondary">
                  Ölçülüyor...
                </span>
              )}
            </div>

            {/* Seçili İl Mikroiklim Alt Noktaları (Sahil / Ova / Etek / Zirve) */}
            {activeProvinceSubLocations && activeProvinceSubLocations.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {activeProvinceSubLocations.map((sub) => {
                  const isSubSelected =
                    Math.hypot(sub.lat - selectedLoc.lat, sub.lon - selectedLoc.lon) < 0.015 &&
                    Math.abs((resolvedElevationM ?? sub.elevationM) - sub.elevationM) < 80;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        atmosUiSfx.playNavTick();
                        void fetchPoint({
                          id: sub.id,
                          name: sub.name,
                          admin1: activeProvinceName ?? selectedLoc.admin1,
                          provinceCode:
                            activeProvinceCode && isTrProvinceCode(activeProvinceCode)
                              ? activeProvinceCode
                              : undefined,
                          country: "Türkiye",
                          countryCode: "TR",
                          lat: sub.lat,
                          lon: sub.lon,
                          elevation: sub.elevationM,
                          timezone: "Europe/Istanbul"
                        });
                      }}
                      className={`rounded-md border px-2 py-1 font-mono text-[10px] transition-colors tabular ${
                        isSubSelected
                          ? "border-sky-400/45 bg-sky-400/15 text-sky-100"
                          : "border-white/10 bg-white/[0.03] text-ink-muted hover:text-ink-primary"
                      }`}
                    >
                      {sub.name} ({formatElevation(sub.elevationM, unit)})
                    </button>
                  );
                })}
              </div>
            )}

            {pointError && !pointBundle && (
              <div className="rounded-xl border border-signal-rose/35 bg-signal-rose/10 p-3 text-xs text-ink-primary flex items-center justify-between gap-2">
                <span>{pointError}</span>
                <button
                  type="button"
                  onClick={() => void fetchPoint(selectedLoc, { forceRefresh: true })}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-[11px] hover:bg-white/10"
                >
                  <RefreshCw className="h-3 w-3" /> Tekrar
                </button>
              </div>
            )}

            {pointBundle && temporal ? (
              <>
                <div className="flex items-baseline justify-between gap-3 border-y border-white/[0.08] py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-5xl font-semibold tracking-tight text-ink-primary tabular">
                      <AnimatedNumber
                        value={formatTemperature(temporal.telemetry.temperature, unit)}
                      />
                    </span>
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-medium text-ink-primary">
                        <AnimatedWeatherIcon
                          code={temporal.telemetry.weatherCode}
                          isNight={temporal.dayContext.isNight}
                          className="h-5 w-5"
                        />
                        <span>{temporal.telemetry.condition}</span>
                      </p>
                      <p className="text-xs text-ink-muted tabular">
                        Hissedilen{" "}
                        {formatTemperature(temporal.telemetry.apparentTemperature, unit)}
                      </p>
                    </div>
                  </div>
                  {temporal.telemetry.temp850hPa !== null && (
                    <div className="text-right font-mono text-xs tabular">
                      <span className="block text-[10px] uppercase text-ink-muted">
                        850 hPa
                      </span>
                      <span className="font-semibold text-signal-sky">
                        {formatTemperature(temporal.telemetry.temp850hPa, unit, {
                          signed: true,
                          showUnit: true
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Aktif Su Kütlesi Sıcaklığı (`waterBodyLabelTr` & `seaOrLakeTempC`) */}
                {activeWaterBody && (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/[0.07] px-3 py-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-cyan-100">
                      <Waves className="h-3.5 w-3.5 text-cyan-300" />
                      <span>{activeWaterBody.labelTr}</span>
                    </span>
                    <span className="font-mono font-semibold text-cyan-200 tabular">
                      Su {formatTemperature(activeWaterBody.tempC, unit)}
                    </span>
                  </div>
                )}

                {/* Canlı Doppler Radar & 180 dk Nowcast Telemetri Özeti */}
                <div className="surface-tile p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-ink-secondary">
                      <CloudRain className="h-3.5 w-3.5 text-signal-sky" />
                      <span>Doppler Eko & Nowcast</span>
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 font-mono text-[10px] ${nowcastUi.toneClass}`}
                    >
                      {nowcastUi.badge}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs tabular">
                    <span className="text-ink-primary">
                      {formatPrecip(syncedDopplerReadout.rainMmHr, unit, { per: "hour" })}
                      <span className="text-ink-muted">
                        {" "}
                        ·{" "}
                        {syncedDopplerReadout.dbz > 0
                          ? `${Math.round(syncedDopplerReadout.dbz)} dBZ`
                          : "0 dBZ"}
                      </span>
                    </span>
                    <span className="text-ink-muted">
                      {typeof engineMeta?.radarAdvectionSpeedKmh === "number" &&
                      engineMeta.radarAdvectionSpeedKmh > 0 &&
                      typeof engineMeta.radarAdvectionFromDeg === "number"
                        ? `Sürüklenme ${windDirectionToCompass(
                            engineMeta.radarAdvectionFromDeg
                          )} ${formatWindSpeed(engineMeta.radarAdvectionSpeedKmh, unit)}`
                        : `Olasılık %${temporal.telemetry.precipProbability}`}
                    </span>
                  </div>
                  {syncedDopplerReadout.frameNote && (
                    <p
                      className={`font-mono text-[11px] tabular ${
                        syncedDopplerReadout.isForecastStep
                          ? "text-sky-300"
                          : "text-amber-200/90"
                      }`}
                    >
                      {syncedDopplerReadout.frameNote}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="surface-tile p-3 space-y-1">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <Wind className="h-3.5 w-3.5 text-signal-sky" /> Rüzgar
                    </span>
                    <p className="font-mono text-base font-semibold text-ink-primary tabular">
                      {formatWindSpeed(temporal.telemetry.windSpeed, unit)}
                    </p>
                    <p className="text-ink-muted tabular">
                      {temporal.telemetry.windCompassTr} · Hamle{" "}
                      {formatWindSpeed(temporal.telemetry.windGusts, unit)}
                    </p>
                  </div>

                  <div className="surface-tile p-3 space-y-1">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <Droplets className="h-3.5 w-3.5 text-signal-sky" /> Nem & Çiy
                    </span>
                    <p className="font-mono text-base font-semibold text-ink-primary tabular">
                      %{temporal.telemetry.humidity}
                    </p>
                    <p className="text-ink-muted tabular">
                      Td {formatTemperature(temporal.telemetry.dewPoint, unit)} · Bulut %
                      {temporal.telemetry.cloudCover}
                    </p>
                  </div>

                  <div className="surface-tile p-3 space-y-1">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <Gauge className="h-3.5 w-3.5 text-ink-secondary" /> Basınç
                    </span>
                    <p className="flex items-center gap-1 font-mono text-base font-semibold text-ink-primary tabular">
                      <span>{formatPressure(temporal.telemetry.pressure, unit)}</span>
                      {temporal.telemetry.pressureTrend.includes("yükseliyor") ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-signal-emerald" />
                      ) : temporal.telemetry.pressureTrend.includes("düşüyor") ? (
                        <ArrowDownRight className="h-3.5 w-3.5 text-signal-amber" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 text-ink-muted" />
                      )}
                    </p>
                    <p className="text-ink-muted tabular">
                      3s: {formatPressureDelta(temporal.telemetry.pressureDelta3h, unit, false)}{" "}
                      · Görüş {formatDistance(temporal.telemetry.visibilityKm, unit)}
                    </p>
                  </div>

                  <div className="surface-tile p-3 space-y-1">
                    <span className="text-ink-muted">Hava Kalitesi</span>
                    <p className="font-mono text-base font-semibold text-ink-primary tabular">
                      EAQI {temporal.airQualityContext.data.europeanAqi}
                    </p>
                    <p className="text-ink-muted tabular">
                      {temporal.airQualityContext.data.label} · PM2.5{" "}
                      {temporal.airQualityContext.data.pm25}
                    </p>
                  </div>
                </div>

                {/* Seçili İle Kilitli Canlı Doğrulama İstasyonları (`verification.stations`) */}
                {activeVerificationStations.length > 0 && (
                  <div className="surface-tile p-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-ink-muted">
                      <span>CANLI İSTASYON DOĞRULAMA AĞI</span>
                      <span className="text-emerald-300">
                        {activeVerificationStations.length} istasyon
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {activeVerificationStations.slice(0, 4).map((st) => (
                        <span
                          key={`${st.icaoId}-${st.elevationM}`}
                          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-ink-secondary tabular"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span className="text-ink-primary">{st.icaoId}</span>
                          {typeof st.tempC === "number" && Number.isFinite(st.tempC) && (
                            <span className="text-emerald-300">
                              {formatTemperature(st.tempC, unit)}
                            </span>
                          )}
                          <span className="text-ink-muted">
                            {formatElevation(st.elevationM, unit)}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="surface-tile p-6 text-center text-xs text-ink-muted">
                {fetching
                  ? "Ölçüm verisi hazırlanıyor..."
                  : "Kayıtlı önbellek bulunamadı. Bağlantı sağlandığında otomatik güncellenecek."}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                promoteLocationWithBundle(selectedLoc, pointBundle);
                router.push(buildLocationHref("/", selectedLoc));
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink-primary px-4 py-2.5 text-sm font-medium text-obsidian-950 hover:bg-white transition-colors"
            >
              <span>Hava Durumunda Aç</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => addFavorite(selectedLoc)}
              disabled={fav}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-ink-primary hover:bg-white/[0.08] disabled:opacity-50 transition-colors"
            >
              <Star
                className={`h-4 w-4 ${fav ? "fill-signal-amber text-signal-amber" : "text-ink-secondary"}`}
              />
              <span>{fav ? "İstasyonlarda" : "İstasyonlara Ekle"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
