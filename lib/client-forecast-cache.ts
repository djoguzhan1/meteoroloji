/**
 * ATMOS v5.0 — Dual-Tier Client Forecast Vault (L1 Memory + L2 Browser Storage)
 * File: lib/client-forecast-cache.ts
 *
 * Provides strictly province- and elevation-isolated browser persistence across:
 *  - Tier L1 (Sync Memory): Pinned Bursa (`TR-16`) slot (`pinnedBursaEntry`) + bounded session LRU map.
 *  - Tier L2a (Sync Storage): Quota-guarded `localStorage` LRU mirror (`atmos:v5:bundle-cache`
 *    & `atmos:v5:models-cache`, instant 0-ms hydration) with dedicated `pinnedBursaEntry`
 *    exempt from 80-province LRU eviction.
 *  - Tier L2b (Async IndexedDB): `IndexedDB` (`atmos_v5_forecast_db`, full 72h `hourlySoundings`,
 *    16-city LRU + pinned Bursa retention, 72-hour retention).
 *
 * Guarantees `%0.00` cross-province & cross-elevation bleed:
 *  1. `provinceCode` mismatch veto: Border neighbors (e.g. Orhangazi `TR-16` vs Yalova `TR-77`,
 *     Tuzla `TR-34` vs Gebze `TR-41`) NEVER read or overwrite each other's cached bundles.
 *  2. Elevation delta shield (`|Δelev| <= 65 m`): Plain vs summit pairs (e.g. Bursa `100 m` vs
 *     Uludağ `1850 m`, Kayseri `1054 m` vs Erciyes `2215 m`) NEVER cross-contaminate.
 *  3. Pinned Bursa (`TR-16` / `bursa-tr`) immunity: Visiting all 80 other provinces never evicts
 *     Bursa from L1 memory, L2 `localStorage`, or IndexedDB.
 */

import {
  areLocationsEquivalent,
  makeLocationCacheKey,
  reanchorMultiModelBundleToNow,
  reanchorWeatherBundleToNow,
  STALE_RETENTION_MAX_MS
} from "./forecast-resilience";
import { ATMOS_STORAGE_KEYS, type StorageLike } from "./weather-client";
import type {
  GeoLocation,
  MultiModelBundle,
  WeatherBundle
} from "./weather-types";

export const MAX_ELEVATION_DELTA_CACHE_M = 65;

interface StoredClientWeatherEntry {
  locKey: string;
  savedAtMs: number;
  bundle: WeatherBundle;
}

interface StoredClientModelsEntry {
  locKey: string;
  savedAtMs: number;
  models: MultiModelBundle;
}

interface LocalStorageVaultEnvelope<T> {
  version: 5;
  pinnedBursaEntry?: T | null;
  pinnedBursaSubEntries?: Record<string, T>;
  entries: Record<string, T>;
}

const IDB_NAME = "atmos_v5_forecast_db";
const IDB_VERSION = 1;
const IDB_WEATHER_STORE = "weather_bundles";
const IDB_MODELS_STORE = "model_bundles";

const MAX_SESSION_WEATHER_CITIES = 24;
const MAX_SESSION_MODELS_CITIES = 16;
const MAX_LOCAL_WEATHER_CITIES = 8;
const MAX_LOCAL_MODELS_CITIES = 6;
const MAX_PINNED_BURSA_SUB_ENTRIES = 6;
const MAX_IDB_CITIES = 16;

let pinnedBursaEntry: StoredClientWeatherEntry | null = null;
const pinnedBursaSubMap = new Map<string, StoredClientWeatherEntry>();
let pinnedBursaModelsEntry: StoredClientModelsEntry | null = null;

const sessionWeatherMap = new Map<string, StoredClientWeatherEntry>();
const sessionModelsMap = new Map<string, StoredClientModelsEntry>();

let pendingIdleFlushTimer: ReturnType<typeof setTimeout> | number | null = null;
let pendingIdleUsesRic = false;
const pendingJobs = new Map<string, () => void>();
let unloadListenerBound = false;

export function normalizeProvinceCodeToken(
  raw: string | null | undefined
): string | undefined {
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim().toUpperCase();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function extractLocationProvinceCode(
  loc:
    | (Pick<GeoLocation, "lat" | "lon"> & {
        id?: string;
        provinceCode?: string | null;
      })
    | null
    | undefined
): string | undefined {
  if (!loc) return undefined;
  const explicit = normalizeProvinceCodeToken(loc.provinceCode);
  if (explicit) return explicit;
  if (
    typeof loc.id === "string" &&
    (loc.id === "bursa-tr" || loc.id.startsWith("bursa-"))
  ) {
    return "TR-16";
  }
  return undefined;
}

export function extractBundleProvinceCode(
  bundle:
    | Pick<WeatherBundle, "location" | "provinceSummary" | "hybrid">
    | null
    | undefined
): string | undefined {
  if (!bundle) return undefined;
  return (
    normalizeProvinceCodeToken(bundle.location?.provinceCode) ??
    normalizeProvinceCodeToken(bundle.provinceSummary?.provinceCode) ??
    normalizeProvinceCodeToken(bundle.hybrid?.engineMeta?.provinceCode) ??
    extractLocationProvinceCode(bundle.location)
  );
}

export function buildIsolatedClientCacheKey(
  loc: Pick<GeoLocation, "lat" | "lon"> & {
    id?: string;
    provinceCode?: string | null;
    elevation?: number | null;
  },
  fallbackProvinceCode?: string | null
): string {
  const coordKey = makeLocationCacheKey(loc);
  const prov =
    extractLocationProvinceCode(loc) ??
    normalizeProvinceCodeToken(fallbackProvinceCode) ??
    "ANY";
  const elevToken =
    typeof loc.elevation === "number" && Number.isFinite(loc.elevation)
      ? `e${Math.round(loc.elevation)}`
      : "eNA";
  return `${prov}:${coordKey}:${elevToken}`;
}

function isPrimaryBursaCenterLocation(
  loc: Pick<GeoLocation, "lat" | "lon"> & {
    id?: string;
    name?: string;
    provinceCode?: string | null;
    elevation?: number | null;
  },
  resolvedProvinceCode?: string
): boolean {
  if (loc.id === "bursa-tr") return true;
  const prov = resolvedProvinceCode ?? extractLocationProvinceCode(loc);
  if (prov !== "TR-16") return false;
  const nearWmo17116 =
    Math.abs(loc.lat - 40.2308) <= 0.06 && Math.abs(loc.lon - 29.0133) <= 0.08;
  const plainElev =
    loc.elevation === undefined ||
    loc.elevation === null ||
    !Number.isFinite(loc.elevation) ||
    Math.abs(loc.elevation - 100) <= MAX_ELEVATION_DELTA_CACHE_M;
  return nearWmo17116 && plainElev;
}

export function isBursaProvinceWeatherBundle(bundle: WeatherBundle): boolean {
  return extractBundleProvinceCode(bundle) === "TR-16";
}

function isBursaModelsBundle(models: MultiModelBundle): boolean {
  const prov = normalizeProvinceCodeToken(models.provinceCode);
  if (prov === "TR-16") return true;
  if (prov && prov !== "TR-16") return false;
  const nearWmo17116 =
    Math.abs(models.lat - 40.2308) <= 0.02 &&
    Math.abs(models.lon - 29.0133) <= 0.02;
  const plainElev =
    models.elevation === undefined ||
    !Number.isFinite(models.elevation) ||
    Math.abs(models.elevation - 100) <= MAX_ELEVATION_DELTA_CACHE_M;
  return nearWmo17116 && plainElev;
}

/**
 * Strict client-side location equivalence gate enforcing:
 *  1. Curated `bursa-*` sub-location identity separation,
 *  2. Explicit `provinceCode` mismatch veto (`TR-16` vs `TR-77`, `TR-34` vs `TR-41`),
 *  3. Elevation shield (`|Δelev| <= 65 m` allowed; `|Δelev| > 65 m` strictly vetoed),
 *  4. Coordinate proximity (`<= toleranceDeg`, default `0.018°`).
 */
export function isClientCacheLocationCompatible(
  requested:
    | (Pick<GeoLocation, "lat" | "lon"> & {
        id?: string;
        provinceCode?: string | null;
        elevation?: number | null;
      })
    | null
    | undefined,
  cached:
    | (Pick<GeoLocation, "lat" | "lon"> & {
        id?: string;
        provinceCode?: string | null;
        elevation?: number | null;
      })
    | null
    | undefined,
  cachedOverrideProvinceCode?: string | null,
  toleranceDeg = 0.018
): boolean {
  if (!requested || !cached) return false;

  if (
    requested.id &&
    cached.id &&
    requested.id.startsWith("bursa-") &&
    cached.id.startsWith("bursa-") &&
    requested.id !== cached.id
  ) {
    return false;
  }

  const reqProv = extractLocationProvinceCode(requested);
  const cachedProv =
    normalizeProvinceCodeToken(cachedOverrideProvinceCode) ??
    extractLocationProvinceCode(cached);

  // Strict provinceCode mismatch veto: never leak across provincial borders
  if (reqProv && cachedProv && reqProv !== cachedProv) {
    return false;
  }

  // Strict elevation delta veto: |Δelev| > 65 m returns false
  if (
    typeof requested.elevation === "number" &&
    Number.isFinite(requested.elevation) &&
    typeof cached.elevation === "number" &&
    Number.isFinite(cached.elevation) &&
    Math.abs(requested.elevation - cached.elevation) > MAX_ELEVATION_DELTA_CACHE_M
  ) {
    return false;
  }

  return (
    Math.abs(requested.lat - cached.lat) <= toleranceDeg &&
    Math.abs(requested.lon - cached.lon) <= toleranceDeg
  );
}

function pruneSessionMap<T extends { savedAtMs: number }>(
  map: Map<string, T>,
  maxEntries: number,
  nowMs: number
): void {
  const cutoff = nowMs - STALE_RETENTION_MAX_MS;
  for (const [k, v] of map.entries()) {
    if (!v || v.savedAtMs < cutoff) {
      map.delete(k);
    }
  }
  if (map.size <= maxEntries) return;
  const sortedKeys = Array.from(map.entries())
    .sort((a, b) => b[1].savedAtMs - a[1].savedAtMs)
    .map(([k]) => k);
  for (let i = maxEntries; i < sortedKeys.length; i++) {
    map.delete(sortedKeys[i]);
  }
}

function flushPendingClientCacheWritesSync(): void {
  if (pendingIdleFlushTimer !== null) {
    if (
      pendingIdleUsesRic &&
      typeof window !== "undefined" &&
      "cancelIdleCallback" in window
    ) {
      (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(
        pendingIdleFlushTimer as number
      );
    } else {
      clearTimeout(pendingIdleFlushTimer as ReturnType<typeof setTimeout>);
    }
    pendingIdleFlushTimer = null;
    pendingIdleUsesRic = false;
  }
  const jobs = Array.from(pendingJobs.values());
  pendingJobs.clear();
  for (const job of jobs) {
    try {
      job();
    } catch {
      // ignore quota/storage errors
    }
  }
}

function scheduleIdleStorageJob(jobKey: string, job: () => void): void {
  pendingJobs.set(jobKey, job);
  if (typeof window !== "undefined" && !unloadListenerBound) {
    unloadListenerBound = true;
    window.addEventListener("pagehide", flushPendingClientCacheWritesSync);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        flushPendingClientCacheWritesSync();
      }
    });
  }
  if (pendingIdleFlushTimer !== null) return;

  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    pendingIdleUsesRic = true;
    pendingIdleFlushTimer = (
      window as unknown as {
        requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => number;
      }
    ).requestIdleCallback(() => {
      pendingIdleFlushTimer = null;
      pendingIdleUsesRic = false;
      flushPendingClientCacheWritesSync();
    }, { timeout: 900 });
  } else {
    pendingIdleUsesRic = false;
    pendingIdleFlushTimer = setTimeout(() => {
      pendingIdleFlushTimer = null;
      flushPendingClientCacheWritesSync();
    }, 16);
  }
}

export { flushPendingClientCacheWritesSync };

function getDefaultStorage(custom?: StorageLike | null): StorageLike | null {
  if (custom !== undefined) return custom;
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return null;
}

function compactBundleForLocalStorage(bundle: WeatherBundle): WeatherBundle {
  // Keep 24 hours of vertical soundings in synchronous localStorage (~35 KB/city)
  // while IndexedDB retains the complete 72-hour radiosonde array.
  if (bundle.hourlySoundings.length <= 24) return bundle;
  return {
    ...bundle,
    hourlySoundings: bundle.hourlySoundings.slice(0, 24)
  };
}

interface ParsedVaultState<T> {
  pinnedBursaEntry: T | null;
  pinnedBursaSubEntries: Record<string, T>;
  entries: Record<string, T>;
}

function readStorageVault<T extends { savedAtMs: number }>(
  storageKey: string,
  nowMs: number,
  storage?: StorageLike | null
): ParsedVaultState<T> {
  const empty: ParsedVaultState<T> = {
    pinnedBursaEntry: null,
    pinnedBursaSubEntries: {},
    entries: {}
  };
  const target = getDefaultStorage(storage);
  if (!target) return empty;
  try {
    const raw = target.getItem(storageKey);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as LocalStorageVaultEnvelope<T>;
    if (!parsed || parsed.version !== 5 || typeof parsed.entries !== "object") {
      return empty;
    }
    const cutoff = nowMs - STALE_RETENTION_MAX_MS;
    const validEntries: Record<string, T> = {};
    for (const [k, v] of Object.entries(parsed.entries)) {
      if (v && typeof v.savedAtMs === "number" && v.savedAtMs >= cutoff) {
        validEntries[k] = v;
      }
    }

    const validPinnedSub: Record<string, T> = {};
    if (parsed.pinnedBursaSubEntries && typeof parsed.pinnedBursaSubEntries === "object") {
      for (const [k, v] of Object.entries(parsed.pinnedBursaSubEntries)) {
        if (v && typeof v.savedAtMs === "number" && v.savedAtMs >= cutoff) {
          validPinnedSub[k] = v;
        }
      }
    }

    const validPinnedCenter =
      parsed.pinnedBursaEntry &&
      typeof parsed.pinnedBursaEntry.savedAtMs === "number" &&
      parsed.pinnedBursaEntry.savedAtMs >= cutoff
        ? parsed.pinnedBursaEntry
        : null;

    return {
      pinnedBursaEntry: validPinnedCenter,
      pinnedBursaSubEntries: validPinnedSub,
      entries: validEntries
    };
  } catch {
    return empty;
  }
}

function writeStorageVault<T extends { savedAtMs: number }>(
  storageKey: string,
  vault: ParsedVaultState<T>,
  maxCount: number,
  storage?: StorageLike | null
): void {
  const target = getDefaultStorage(storage);
  if (!target) return;

  const sortedNonBursa = Object.entries(vault.entries).sort(
    (a, b) => b[1].savedAtMs - a[1].savedAtMs
  );
  const sortedBursaSub = Object.entries(vault.pinnedBursaSubEntries)
    .sort((a, b) => b[1].savedAtMs - a[1].savedAtMs)
    .slice(0, MAX_PINNED_BURSA_SUB_ENTRIES);

  const attemptWrite = (limit: number, includeSubBursa: boolean): boolean => {
    try {
      const payload: LocalStorageVaultEnvelope<T> = {
        version: 5,
        ...(vault.pinnedBursaEntry ? { pinnedBursaEntry: vault.pinnedBursaEntry } : {}),
        ...(includeSubBursa && sortedBursaSub.length > 0
          ? { pinnedBursaSubEntries: Object.fromEntries(sortedBursaSub) }
          : {}),
        entries: Object.fromEntries(sortedNonBursa.slice(0, limit))
      };
      target.setItem(storageKey, JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  };

  if (!attemptWrite(maxCount, true)) {
    if (!attemptWrite(Math.min(2, sortedNonBursa.length), true)) {
      // Ultimate QuotaExceededError fallback: strictly preserve pinnedBursaEntry above all else
      attemptWrite(0, false);
    }
  }
}

function openForecastIdb(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const req = window.indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_WEATHER_STORE)) {
          db.createObjectStore(IDB_WEATHER_STORE, { keyPath: "locKey" });
        }
        if (!db.objectStoreNames.contains(IDB_MODELS_STORE)) {
          db.createObjectStore(IDB_MODELS_STORE, { keyPath: "locKey" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbPutAndPrune<T extends { locKey: string; savedAtMs: number }>(
  storeName: string,
  record: T,
  nowMs: number
): Promise<void> {
  const db = await openForecastIdb();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      store.put(record);
      const allReq = store.getAll();
      allReq.onsuccess = () => {
        const items = (Array.isArray(allReq.result) ? allReq.result : []) as T[];
        const cutoff = nowMs - STALE_RETENTION_MAX_MS;
        const freshItems = items.filter((x) => x && x.savedAtMs >= cutoff);
        const keep = new Set(
          freshItems
            .sort((a, b) => b.savedAtMs - a.savedAtMs)
            .slice(0, MAX_IDB_CITIES)
            .map((x) => x.locKey)
        );
        // Never evict TR-16 Bursa entries from IndexedDB
        for (const item of freshItems) {
          if (item.locKey.startsWith("TR-16:")) {
            keep.add(item.locKey);
          }
        }
        keep.add(record.locKey);
        for (const item of items) {
          if (item?.locKey && !keep.has(item.locKey)) {
            store.delete(item.locKey);
          }
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Non-fatal IndexedDB error
  } finally {
    db.close();
  }
}

async function idbGetMatchingRecords<T extends { locKey: string; savedAtMs: number }>(
  storeName: string,
  exactLocKey: string,
  nowMs: number
): Promise<T[]> {
  const db = await openForecastIdb();
  if (!db) return [];
  try {
    return await new Promise<T[]>((resolve) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const getReq = store.get(exactLocKey);
      getReq.onsuccess = () => {
        const hit = getReq.result as T | undefined;
        if (hit && nowMs - hit.savedAtMs <= STALE_RETENTION_MAX_MS) {
          resolve([hit]);
          return;
        }
        const allReq = store.getAll();
        allReq.onsuccess = () => {
          const all = (Array.isArray(allReq.result) ? allReq.result : []) as T[];
          resolve(
            all
              .filter((x) => x && nowMs - x.savedAtMs <= STALE_RETENTION_MAX_MS)
              .sort((a, b) => b.savedAtMs - a.savedAtMs)
          );
        };
        allReq.onerror = () => resolve([]);
      };
      getReq.onerror = () => resolve([]);
    });
  } catch {
    return [];
  } finally {
    db.close();
  }
}

function hydrateWeatherRecord(
  entry: StoredClientWeatherEntry,
  requestedLoc: GeoLocation,
  nowMs: number,
  options?: { forceStale?: boolean; staleReason?: string }
): WeatherBundle | null {
  const cachedProvinceCode = extractBundleProvinceCode(entry.bundle);

  if (
    !isClientCacheLocationCompatible(
      requestedLoc,
      entry.bundle.location,
      cachedProvinceCode
    )
  ) {
    return null;
  }

  if (nowMs - entry.savedAtMs > STALE_RETENTION_MAX_MS) {
    return null;
  }

  const fetchedMs = Date.parse(entry.bundle.fetchedAt);
  const ageMs = Number.isFinite(fetchedMs) ? nowMs - fetchedMs : nowMs - entry.savedAtMs;
  const isStale = Boolean(options?.forceStale) || ageMs > 5 * 60 * 1000;
  const resolvedProv =
    normalizeProvinceCodeToken(requestedLoc.provinceCode) ?? cachedProvinceCode;

  return reanchorWeatherBundleToNow(
    {
      ...entry.bundle,
      location: {
        ...entry.bundle.location,
        id: requestedLoc.id || entry.bundle.location.id,
        name: requestedLoc.name || entry.bundle.location.name,
        admin1: requestedLoc.admin1 ?? entry.bundle.location.admin1,
        district: requestedLoc.district ?? entry.bundle.location.district,
        ...(resolvedProv ? { provinceCode: resolvedProv } : {}),
        country: requestedLoc.country || entry.bundle.location.country
      }
    },
    nowMs,
    {
      status: isStale ? "stale" : (entry.bundle.freshness?.status ?? "live"),
      sourceTier: "client-cache",
      cachedAtMs: entry.savedAtMs,
      staleReason:
        options?.staleReason ??
        (isStale
          ? "Canlı modellere ulaşılamadı; tarayıcı kasasındaki son doğrulanmış tahmin gösteriliyor"
          : undefined),
      modelsRespondedCount: entry.bundle.hybrid.activeModels.length
    }
  );
}

export function writeCachedWeatherBundle(
  bundle: WeatherBundle,
  nowMs = Date.now(),
  storage?: StorageLike | null
): void {
  const bundleProv = extractBundleProvinceCode(bundle);
  const locKey = buildIsolatedClientCacheKey(bundle.location, bundleProv);
  const fullRecord: StoredClientWeatherEntry = {
    locKey,
    savedAtMs: nowMs,
    bundle
  };

  const isBursa = bundleProv === "TR-16";
  const isBursaPrimary = isPrimaryBursaCenterLocation(bundle.location, bundleProv);

  if (storage === undefined) {
    if (isBursa) {
      if (isBursaPrimary || pinnedBursaEntry === null) {
        pinnedBursaEntry = fullRecord;
      }
      pinnedBursaSubMap.set(locKey, fullRecord);
      pruneSessionMap(pinnedBursaSubMap, MAX_PINNED_BURSA_SUB_ENTRIES, nowMs);
    } else {
      sessionWeatherMap.set(locKey, fullRecord);
      pruneSessionMap(sessionWeatherMap, MAX_SESSION_WEATHER_CITIES, nowMs);
    }
  }

  const persistToLocalStorage = () => {
    const vault = readStorageVault<StoredClientWeatherEntry>(
      ATMOS_STORAGE_KEYS.bundleCache,
      nowMs,
      storage
    );
    const compactEntry: StoredClientWeatherEntry = {
      locKey,
      savedAtMs: nowMs,
      bundle: compactBundleForLocalStorage(bundle)
    };

    if (isBursa) {
      if (isBursaPrimary || vault.pinnedBursaEntry === null) {
        vault.pinnedBursaEntry = compactEntry;
      }
      vault.pinnedBursaSubEntries[locKey] = compactEntry;
    } else {
      vault.entries[locKey] = compactEntry;
    }

    writeStorageVault(
      ATMOS_STORAGE_KEYS.bundleCache,
      vault,
      MAX_LOCAL_WEATHER_CITIES,
      storage
    );
  };

  if (storage !== undefined) {
    persistToLocalStorage();
  } else {
    scheduleIdleStorageJob(`weather:${locKey}`, persistToLocalStorage);
    void idbPutAndPrune(IDB_WEATHER_STORE, fullRecord, nowMs);
  }
}

export function readCachedWeatherBundleSync(
  location: GeoLocation,
  nowMs = Date.now(),
  options?: { forceStale?: boolean; staleReason?: string; storage?: StorageLike | null }
): WeatherBundle | null {
  const exactKey = buildIsolatedClientCacheKey(location);
  const legacyKey = makeLocationCacheKey(location);

  if (options?.storage === undefined) {
    // 1a. Check pinned Bursa center & sub-location L1 slots first
    if (pinnedBursaEntry) {
      const h = hydrateWeatherRecord(pinnedBursaEntry, location, nowMs, options);
      if (h) return h;
    }
    const pinnedSubHit = pinnedBursaSubMap.get(exactKey);
    if (pinnedSubHit) {
      const h = hydrateWeatherRecord(pinnedSubHit, location, nowMs, options);
      if (h) return h;
    }
    for (const subCandidate of pinnedBursaSubMap.values()) {
      const h = hydrateWeatherRecord(subCandidate, location, nowMs, options);
      if (h) return h;
    }

    // 1b. Check non-Bursa L1 session map (exact key, then compatible scan)
    const memHit = sessionWeatherMap.get(exactKey) ?? sessionWeatherMap.get(legacyKey);
    if (memHit) {
      const hydrated = hydrateWeatherRecord(memHit, location, nowMs, options);
      if (hydrated) return hydrated;
    }
    for (const candidate of sessionWeatherMap.values()) {
      const hydrated = hydrateWeatherRecord(candidate, location, nowMs, options);
      if (hydrated) return hydrated;
    }
  }

  // 2. Check L2 localStorage vault (pinned Bursa slot + non-Bursa LRU entries)
  const vault = readStorageVault<StoredClientWeatherEntry>(
    ATMOS_STORAGE_KEYS.bundleCache,
    nowMs,
    options?.storage
  );

  if (vault.pinnedBursaEntry) {
    const h = hydrateWeatherRecord(vault.pinnedBursaEntry, location, nowMs, options);
    if (h) {
      if (options?.storage === undefined) {
        pinnedBursaEntry = vault.pinnedBursaEntry;
      }
      return h;
    }
  }

  const subDirect = vault.pinnedBursaSubEntries[exactKey];
  if (subDirect) {
    const h = hydrateWeatherRecord(subDirect, location, nowMs, options);
    if (h) {
      if (options?.storage === undefined) {
        pinnedBursaSubMap.set(exactKey, subDirect);
      }
      return h;
    }
  }

  for (const subCandidate of Object.values(vault.pinnedBursaSubEntries)) {
    const h = hydrateWeatherRecord(subCandidate, location, nowMs, options);
    if (h) {
      if (options?.storage === undefined) {
        pinnedBursaSubMap.set(subCandidate.locKey, subCandidate);
      }
      return h;
    }
  }

  const direct = vault.entries[exactKey] ?? vault.entries[legacyKey];
  if (direct) {
    const hydrated = hydrateWeatherRecord(direct, location, nowMs, options);
    if (hydrated) {
      if (options?.storage === undefined) {
        sessionWeatherMap.set(direct.locKey, direct);
      }
      return hydrated;
    }
  }

  const sortedCandidates = Object.values(vault.entries).sort(
    (a, b) => b.savedAtMs - a.savedAtMs
  );
  for (const candidate of sortedCandidates) {
    const hydrated = hydrateWeatherRecord(candidate, location, nowMs, options);
    if (hydrated) {
      if (options?.storage === undefined) {
        sessionWeatherMap.set(candidate.locKey, candidate);
      }
      return hydrated;
    }
  }

  return null;
}

export async function readCachedWeatherBundleAsync(
  location: GeoLocation,
  nowMs = Date.now(),
  options?: { forceStale?: boolean; staleReason?: string; storage?: StorageLike | null }
): Promise<WeatherBundle | null> {
  const exactKey = buildIsolatedClientCacheKey(location);

  if (options?.storage === undefined) {
    const idbCandidates = await idbGetMatchingRecords<StoredClientWeatherEntry>(
      IDB_WEATHER_STORE,
      exactKey,
      nowMs
    );
    for (const candidate of idbCandidates) {
      const hydrated = hydrateWeatherRecord(candidate, location, nowMs, options);
      if (hydrated) {
        if (isBursaProvinceWeatherBundle(candidate.bundle)) {
          if (
            isPrimaryBursaCenterLocation(
              candidate.bundle.location,
              extractBundleProvinceCode(candidate.bundle)
            )
          ) {
            pinnedBursaEntry = candidate;
          }
          pinnedBursaSubMap.set(candidate.locKey, candidate);
        } else {
          sessionWeatherMap.set(candidate.locKey, candidate);
        }
        return hydrated;
      }
    }
  }

  return readCachedWeatherBundleSync(location, nowMs, options);
}

function hydrateModelsRecord(
  entry: StoredClientModelsEntry,
  lat: number,
  lon: number,
  nowMs: number,
  options?: {
    forceStale?: boolean;
    staleReason?: string;
    provinceCode?: string;
    elevation?: number;
  }
): MultiModelBundle | null {
  const probeLoc = {
    lat,
    lon,
    provinceCode: options?.provinceCode,
    elevation: options?.elevation
  };
  const cachedLoc = {
    lat: entry.models.lat,
    lon: entry.models.lon,
    provinceCode: entry.models.provinceCode,
    elevation: entry.models.elevation
  };

  if (
    !areLocationsEquivalent({ lat: entry.models.lat, lon: entry.models.lon }, { lat, lon }) ||
    !isClientCacheLocationCompatible(probeLoc, cachedLoc, entry.models.provinceCode)
  ) {
    return null;
  }
  if (nowMs - entry.savedAtMs > STALE_RETENTION_MAX_MS) return null;

  const fetchedMs = Date.parse(entry.models.fetchedAt);
  const ageMs = Number.isFinite(fetchedMs) ? nowMs - fetchedMs : nowMs - entry.savedAtMs;
  const isStale = Boolean(options?.forceStale) || ageMs > 10 * 60 * 1000;
  return reanchorMultiModelBundleToNow(entry.models, nowMs, {
    status: isStale ? "stale" : (entry.models.freshness?.status ?? "live"),
    sourceTier: "client-cache",
    cachedAtMs: entry.savedAtMs,
    staleReason:
      options?.staleReason ??
      (isStale
        ? "8-model servisine ulaşılamadı; tarayıcıdaki son karşılaştırma serisi korunuyor"
        : undefined),
    modelsRespondedCount: entry.models.freshness?.modelsRespondedCount
  });
}

export function writeCachedModelsBundle(
  models: MultiModelBundle,
  nowMs = Date.now(),
  storage?: StorageLike | null
): void {
  const locKey = buildIsolatedClientCacheKey(
    {
      lat: models.lat,
      lon: models.lon,
      provinceCode: models.provinceCode,
      elevation: models.elevation
    },
    models.provinceCode
  );
  const record: StoredClientModelsEntry = {
    locKey,
    savedAtMs: nowMs,
    models
  };

  const isBursa = isBursaModelsBundle(models);

  if (storage === undefined) {
    if (isBursa) {
      pinnedBursaModelsEntry = record;
    } else {
      sessionModelsMap.set(locKey, record);
      pruneSessionMap(sessionModelsMap, MAX_SESSION_MODELS_CITIES, nowMs);
    }
  }

  const persistModelsToLocalStorage = () => {
    const vault = readStorageVault<StoredClientModelsEntry>(
      ATMOS_STORAGE_KEYS.modelsCache,
      nowMs,
      storage
    );
    if (isBursa) {
      vault.pinnedBursaEntry = record;
      vault.pinnedBursaSubEntries[locKey] = record;
    } else {
      vault.entries[locKey] = record;
    }
    writeStorageVault(
      ATMOS_STORAGE_KEYS.modelsCache,
      vault,
      MAX_LOCAL_MODELS_CITIES,
      storage
    );
  };

  if (storage !== undefined) {
    persistModelsToLocalStorage();
  } else {
    scheduleIdleStorageJob(`models:${locKey}`, persistModelsToLocalStorage);
    void idbPutAndPrune(IDB_MODELS_STORE, record, nowMs);
  }
}

export function readCachedModelsBundleSync(
  lat: number,
  lon: number,
  nowMs = Date.now(),
  options?: {
    forceStale?: boolean;
    staleReason?: string;
    storage?: StorageLike | null;
    provinceCode?: string;
    elevation?: number;
  }
): MultiModelBundle | null {
  const exactKey = buildIsolatedClientCacheKey({
    lat,
    lon,
    provinceCode: options?.provinceCode,
    elevation: options?.elevation
  });
  const legacyKey = makeLocationCacheKey(lat, lon);

  if (options?.storage === undefined) {
    if (pinnedBursaModelsEntry) {
      const h = hydrateModelsRecord(pinnedBursaModelsEntry, lat, lon, nowMs, options);
      if (h) return h;
    }
    const memHit = sessionModelsMap.get(exactKey) ?? sessionModelsMap.get(legacyKey);
    if (memHit) {
      const h = hydrateModelsRecord(memHit, lat, lon, nowMs, options);
      if (h) return h;
    }
    for (const candidate of sessionModelsMap.values()) {
      const h = hydrateModelsRecord(candidate, lat, lon, nowMs, options);
      if (h) return h;
    }
  }

  const vault = readStorageVault<StoredClientModelsEntry>(
    ATMOS_STORAGE_KEYS.modelsCache,
    nowMs,
    options?.storage
  );

  if (vault.pinnedBursaEntry) {
    const h = hydrateModelsRecord(vault.pinnedBursaEntry, lat, lon, nowMs, options);
    if (h) {
      if (options?.storage === undefined) {
        pinnedBursaModelsEntry = vault.pinnedBursaEntry;
      }
      return h;
    }
  }

  for (const subCandidate of Object.values(vault.pinnedBursaSubEntries)) {
    const h = hydrateModelsRecord(subCandidate, lat, lon, nowMs, options);
    if (h) return h;
  }

  const direct = vault.entries[exactKey] ?? vault.entries[legacyKey];
  if (direct) {
    const h = hydrateModelsRecord(direct, lat, lon, nowMs, options);
    if (h) {
      if (options?.storage === undefined) {
        sessionModelsMap.set(direct.locKey, direct);
      }
      return h;
    }
  }

  for (const candidate of Object.values(vault.entries).sort(
    (a, b) => b.savedAtMs - a.savedAtMs
  )) {
    const h = hydrateModelsRecord(candidate, lat, lon, nowMs, options);
    if (h) {
      if (options?.storage === undefined) {
        sessionModelsMap.set(candidate.locKey, candidate);
      }
      return h;
    }
  }

  return null;
}

export async function readCachedModelsBundleAsync(
  lat: number,
  lon: number,
  nowMs = Date.now(),
  options?: {
    forceStale?: boolean;
    staleReason?: string;
    storage?: StorageLike | null;
    provinceCode?: string;
    elevation?: number;
  }
): Promise<MultiModelBundle | null> {
  const exactKey = buildIsolatedClientCacheKey({
    lat,
    lon,
    provinceCode: options?.provinceCode,
    elevation: options?.elevation
  });

  if (options?.storage === undefined) {
    const idbCandidates = await idbGetMatchingRecords<StoredClientModelsEntry>(
      IDB_MODELS_STORE,
      exactKey,
      nowMs
    );
    for (const candidate of idbCandidates) {
      const hydrated = hydrateModelsRecord(candidate, lat, lon, nowMs, options);
      if (hydrated) {
        if (isBursaModelsBundle(candidate.models)) {
          pinnedBursaModelsEntry = candidate;
        } else {
          sessionModelsMap.set(candidate.locKey, candidate);
        }
        return hydrated;
      }
    }
  }

  return readCachedModelsBundleSync(lat, lon, nowMs, options);
}

export function clearClientForecastSessionForTests(): void {
  flushPendingClientCacheWritesSync();
  pendingJobs.clear();
  pinnedBursaEntry = null;
  pinnedBursaSubMap.clear();
  pinnedBursaModelsEntry = null;
  sessionWeatherMap.clear();
  sessionModelsMap.clear();
}
