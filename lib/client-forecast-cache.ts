/**
 * ATMOS v5.0 — Dual-Tier Client Forecast Vault (L4 Browser Cache)
 * File: lib/client-forecast-cache.ts
 *
 * Provides strictly location-isolated browser persistence across:
 *  - Tier L4a (Sync): In-memory session map + quota-guarded `localStorage` LRU mirror
 *    (`atmos:v5:bundle-cache` & `atmos:v5:models-cache`, instant 0-ms hydration).
 *  - Tier L4b (Async): `IndexedDB` (`atmos_v5_forecast_db`, full 72h `hourlySoundings`,
 *    16-city LRU, 72-hour retention).
 *
 * Guarantees that:
 *  1. Refreshing (`F5`) or opening the site while offline / during upstream 5xx
 *     immediately restores the user's last verified forecast with transparent `client-cache` metadata.
 *  2. Switching cities while offline NEVER leaks City A's forecast under City B's title.
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
  entries: Record<string, T>;
}

const IDB_NAME = "atmos_v5_forecast_db";
const IDB_VERSION = 1;
const IDB_WEATHER_STORE = "weather_bundles";
const IDB_MODELS_STORE = "model_bundles";

const MAX_LOCAL_WEATHER_CITIES = 8;
const MAX_LOCAL_MODELS_CITIES = 6;
const MAX_IDB_CITIES = 16;

const sessionWeatherMap = new Map<string, StoredClientWeatherEntry>();
const sessionModelsMap = new Map<string, StoredClientModelsEntry>();

let pendingIdleFlushTimer: ReturnType<typeof setTimeout> | number | null = null;
let pendingIdleUsesRic = false;
const pendingJobs = new Map<string, () => void>();
let unloadListenerBound = false;

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

function readStorageEnvelope<T extends { savedAtMs: number }>(
  storageKey: string,
  nowMs: number,
  storage?: StorageLike | null
): Record<string, T> {
  const target = getDefaultStorage(storage);
  if (!target) return {};
  try {
    const raw = target.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LocalStorageVaultEnvelope<T>;
    if (!parsed || parsed.version !== 5 || typeof parsed.entries !== "object") {
      return {};
    }
    const cutoff = nowMs - STALE_RETENTION_MAX_MS;
    const valid: Record<string, T> = {};
    for (const [k, v] of Object.entries(parsed.entries)) {
      if (v && typeof v.savedAtMs === "number" && v.savedAtMs >= cutoff) {
        valid[k] = v;
      }
    }
    return valid;
  } catch {
    return {};
  }
}

function writeStorageEnvelope<T extends { savedAtMs: number }>(
  storageKey: string,
  entries: Record<string, T>,
  maxCount: number,
  storage?: StorageLike | null
): void {
  const target = getDefaultStorage(storage);
  if (!target) return;

  const sorted = Object.entries(entries).sort(
    (a, b) => b[1].savedAtMs - a[1].savedAtMs
  );

  const attemptWrite = (limit: number): boolean => {
    try {
      const payload: LocalStorageVaultEnvelope<T> = {
        version: 5,
        entries: Object.fromEntries(sorted.slice(0, limit))
      };
      target.setItem(storageKey, JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  };

  if (!attemptWrite(maxCount)) {
    // QuotaExceededError fallback: trim aggressively to most recent 2 cities
    attemptWrite(Math.min(2, sorted.length));
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
        const keep = new Set(
          items
            .filter((x) => x && x.savedAtMs >= cutoff)
            .sort((a, b) => b.savedAtMs - a.savedAtMs)
            .slice(0, MAX_IDB_CITIES)
            .map((x) => x.locKey)
        );
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

async function idbGetRecord<T extends { locKey: string; savedAtMs: number }>(
  storeName: string,
  locKey: string,
  nowMs: number
): Promise<T | null> {
  const db = await openForecastIdb();
  if (!db) return null;
  try {
    return await new Promise<T | null>((resolve) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const getReq = store.get(locKey);
      getReq.onsuccess = () => {
        const hit = getReq.result as T | undefined;
        if (hit && nowMs - hit.savedAtMs <= STALE_RETENTION_MAX_MS) {
          resolve(hit);
        } else {
          resolve(null);
        }
      };
      getReq.onerror = () => resolve(null);
    });
  } catch {
    return null;
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
  if (!areLocationsEquivalent(entry.bundle.location, requestedLoc)) {
    return null;
  }
  if (nowMs - entry.savedAtMs > STALE_RETENTION_MAX_MS) {
    return null;
  }

  const fetchedMs = Date.parse(entry.bundle.fetchedAt);
  const ageMs = Number.isFinite(fetchedMs) ? nowMs - fetchedMs : nowMs - entry.savedAtMs;
  const isStale = Boolean(options?.forceStale) || ageMs > 5 * 60 * 1000;

  return reanchorWeatherBundleToNow(
    {
      ...entry.bundle,
      location: {
        ...entry.bundle.location,
        id: requestedLoc.id || entry.bundle.location.id,
        name: requestedLoc.name || entry.bundle.location.name,
        admin1: requestedLoc.admin1 ?? entry.bundle.location.admin1,
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
  const locKey = makeLocationCacheKey(bundle.location);
  const fullRecord: StoredClientWeatherEntry = {
    locKey,
    savedAtMs: nowMs,
    bundle
  };
  sessionWeatherMap.set(locKey, fullRecord);

  const persistToLocalStorage = () => {
    const existing = readStorageEnvelope<StoredClientWeatherEntry>(
      ATMOS_STORAGE_KEYS.bundleCache,
      nowMs,
      storage
    );
    existing[locKey] = {
      locKey,
      savedAtMs: nowMs,
      bundle: compactBundleForLocalStorage(bundle)
    };
    writeStorageEnvelope(
      ATMOS_STORAGE_KEYS.bundleCache,
      existing,
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
  const locKey = makeLocationCacheKey(location);

  if (options?.storage === undefined) {
    const memHit = sessionWeatherMap.get(locKey);
    if (memHit) {
      const hydrated = hydrateWeatherRecord(memHit, location, nowMs, options);
      if (hydrated) return hydrated;
    }
  }

  const stored = readStorageEnvelope<StoredClientWeatherEntry>(
    ATMOS_STORAGE_KEYS.bundleCache,
    nowMs,
    options?.storage
  );
  const direct = stored[locKey];
  if (direct) {
    if (options?.storage === undefined) sessionWeatherMap.set(locKey, direct);
    const hydrated = hydrateWeatherRecord(direct, location, nowMs, options);
    if (hydrated) return hydrated;
  }

  // ±0.05° tolerance lookup strictly within equivalent city bounds
  for (const candidate of Object.values(stored)) {
    if (areLocationsEquivalent(candidate.bundle.location, location)) {
      const hydrated = hydrateWeatherRecord(candidate, location, nowMs, options);
      if (hydrated) return hydrated;
    }
  }

  return null;
}

export async function readCachedWeatherBundleAsync(
  location: GeoLocation,
  nowMs = Date.now(),
  options?: { forceStale?: boolean; staleReason?: string; storage?: StorageLike | null }
): Promise<WeatherBundle | null> {
  const locKey = makeLocationCacheKey(location);

  if (options?.storage === undefined) {
    const idbHit = await idbGetRecord<StoredClientWeatherEntry>(
      IDB_WEATHER_STORE,
      locKey,
      nowMs
    );
    if (idbHit) {
      sessionWeatherMap.set(locKey, idbHit);
      const hydrated = hydrateWeatherRecord(idbHit, location, nowMs, options);
      if (hydrated) return hydrated;
    }
  }

  return readCachedWeatherBundleSync(location, nowMs, options);
}

export function writeCachedModelsBundle(
  models: MultiModelBundle,
  nowMs = Date.now(),
  storage?: StorageLike | null
): void {
  const locKey = makeLocationCacheKey(models.lat, models.lon);
  const record: StoredClientModelsEntry = {
    locKey,
    savedAtMs: nowMs,
    models
  };
  sessionModelsMap.set(locKey, record);

  const persistModelsToLocalStorage = () => {
    const existing = readStorageEnvelope<StoredClientModelsEntry>(
      ATMOS_STORAGE_KEYS.modelsCache,
      nowMs,
      storage
    );
    existing[locKey] = record;
    writeStorageEnvelope(
      ATMOS_STORAGE_KEYS.modelsCache,
      existing,
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
  options?: { forceStale?: boolean; staleReason?: string; storage?: StorageLike | null }
): MultiModelBundle | null {
  const locKey = makeLocationCacheKey(lat, lon);
  const probeLoc = { lat, lon };

  const hydrate = (entry: StoredClientModelsEntry): MultiModelBundle | null => {
    if (!areLocationsEquivalent({ lat: entry.models.lat, lon: entry.models.lon }, probeLoc)) {
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
  };

  if (options?.storage === undefined) {
    const memHit = sessionModelsMap.get(locKey);
    if (memHit) {
      const h = hydrate(memHit);
      if (h) return h;
    }
  }

  const stored = readStorageEnvelope<StoredClientModelsEntry>(
    ATMOS_STORAGE_KEYS.modelsCache,
    nowMs,
    options?.storage
  );
  const direct = stored[locKey];
  if (direct) {
    if (options?.storage === undefined) sessionModelsMap.set(locKey, direct);
    const h = hydrate(direct);
    if (h) return h;
  }

  return null;
}

export async function readCachedModelsBundleAsync(
  lat: number,
  lon: number,
  nowMs = Date.now(),
  options?: { forceStale?: boolean; staleReason?: string; storage?: StorageLike | null }
): Promise<MultiModelBundle | null> {
  const locKey = makeLocationCacheKey(lat, lon);

  if (options?.storage === undefined) {
    const idbHit = await idbGetRecord<StoredClientModelsEntry>(
      IDB_MODELS_STORE,
      locKey,
      nowMs
    );
    if (idbHit && areLocationsEquivalent({ lat: idbHit.models.lat, lon: idbHit.models.lon }, { lat, lon })) {
      sessionModelsMap.set(locKey, idbHit);
      const fetchedMs = Date.parse(idbHit.models.fetchedAt);
      const ageMs = Number.isFinite(fetchedMs) ? nowMs - fetchedMs : nowMs - idbHit.savedAtMs;
      const isStale = Boolean(options?.forceStale) || ageMs > 10 * 60 * 1000;
      return reanchorMultiModelBundleToNow(idbHit.models, nowMs, {
        status: isStale ? "stale" : (idbHit.models.freshness?.status ?? "live"),
        sourceTier: "client-cache",
        cachedAtMs: idbHit.savedAtMs,
        staleReason: options?.staleReason,
        modelsRespondedCount: idbHit.models.freshness?.modelsRespondedCount
      });
    }
  }

  return readCachedModelsBundleSync(lat, lon, nowMs, options);
}

export function clearClientForecastSessionForTests(): void {
  flushPendingClientCacheWritesSync();
  pendingJobs.clear();
  sessionWeatherMap.clear();
  sessionModelsMap.clear();
}
