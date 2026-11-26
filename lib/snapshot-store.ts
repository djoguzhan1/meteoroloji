/**
 * ATMOS v5.0 — Atomic Persistent Forecast Snapshot Vault (L3 Server Disk Tier)
 * File: lib/snapshot-store.ts
 *
 * Guarantees zero forecast loss across server restarts, cold deploys, and upstream
 * NWP outages by persisting last-known-good calibrated `WeatherBundle` and
 * `MultiModelBundle` snapshots on disk (`.data/atmos-v5-snapshots.json` with `/tmp` fallback).
 *
 * Uses dynamic `process.getBuiltinModule` resolution so client bundles (`[app-client]`)
 * never statically depend on `node:fs` or `node:path`.
 */

import { makeLocationCacheKey } from "./forecast-resilience";
import type { MultiModelBundle, WeatherBundle } from "./weather-types";

type NodeFsSubset = typeof import("node:fs");
type NodePathSubset = typeof import("node:path");

function getNodeBuiltin<T>(specifier: string): T | null {
  if (typeof process === "undefined" || !process.versions?.node) return null;
  const procAny = process as unknown as {
    getBuiltinModule?: (id: string) => T | undefined;
  };
  if (typeof procAny.getBuiltinModule === "function") {
    return procAny.getBuiltinModule(specifier) ?? null;
  }
  try {
    const dynReq = Function("m", "return require(m)") as (id: string) => T;
    return dynReq(specifier);
  } catch {
    return null;
  }
}

const nodeFs = getNodeBuiltin<NodeFsSubset>("node:fs");
const nodePath = getNodeBuiltin<NodePathSubset>("node:path");

export interface StoredWeatherSnapshot {
  locKey: string;
  savedAtMs: number;
  bundle: WeatherBundle;
}

export interface StoredModelsSnapshot {
  locKey: string;
  savedAtMs: number;
  models: MultiModelBundle;
}

interface SnapshotVaultSchema {
  version: 5;
  updatedAtMs: number;
  weather: Record<string, StoredWeatherSnapshot>;
  models: Record<string, StoredModelsSnapshot>;
}

const WEATHER_RETENTION_MS = 72 * 3600 * 1000; // 72 hours
const MODELS_RETENTION_MS = 48 * 3600 * 1000; // 48 hours
const MAX_WEATHER_LOCATIONS = 24;
const MAX_MODELS_LOCATIONS = 16;

let vaultMemory: SnapshotVaultSchema | null = null;
let resolvedVaultPath: string | null = null;
let lastDiskWriteMs = 0;

function emptyVault(): SnapshotVaultSchema {
  return {
    version: 5,
    updatedAtMs: Date.now(),
    weather: {},
    models: {}
  };
}

function resolveVaultFilePath(): string {
  if (!nodeFs || !nodePath) return "/tmp/atmos-v5-snapshots.json";
  if (typeof process !== "undefined" && process.env?.ATMOS_SNAPSHOT_PATH) {
    return process.env.ATMOS_SNAPSHOT_PATH;
  }
  if (resolvedVaultPath) return resolvedVaultPath;

  const candidates = [
    nodePath.resolve(process.cwd(), ".data/atmos-v5-snapshots.json"),
    "/tmp/atmos-v5-snapshots.json"
  ];

  for (const candidate of candidates) {
    try {
      nodeFs.mkdirSync(nodePath.dirname(candidate), { recursive: true });
      nodeFs.accessSync(nodePath.dirname(candidate), nodeFs.constants.W_OK);
      resolvedVaultPath = candidate;
      return candidate;
    } catch {
      // Try next writable directory
    }
  }
  resolvedVaultPath = "/tmp/atmos-v5-snapshots.json";
  return resolvedVaultPath;
}

function loadVault(): SnapshotVaultSchema {
  if (vaultMemory) return vaultMemory;
  if (!nodeFs || !nodePath) {
    vaultMemory = emptyVault();
    return vaultMemory;
  }
  const filePath = resolveVaultFilePath();
  try {
    if (nodeFs.existsSync(filePath)) {
      const raw = nodeFs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as SnapshotVaultSchema;
      if (parsed && parsed.version === 5 && parsed.weather && parsed.models) {
        vaultMemory = parsed;
        return vaultMemory;
      }
    }
  } catch {
    // Corrupted or unreadable snapshot file -> start clean
  }
  vaultMemory = emptyVault();
  return vaultMemory;
}

function pruneVault(vault: SnapshotVaultSchema, nowMs: number): void {
  const weatherCutoff = nowMs - WEATHER_RETENTION_MS;
  const weatherEntries = Object.entries(vault.weather)
    .filter(([, entry]) => entry && entry.savedAtMs >= weatherCutoff)
    .sort((a, b) => b[1].savedAtMs - a[1].savedAtMs)
    .slice(0, MAX_WEATHER_LOCATIONS);
  vault.weather = Object.fromEntries(weatherEntries);

  const modelsCutoff = nowMs - MODELS_RETENTION_MS;
  const modelEntries = Object.entries(vault.models)
    .filter(([, entry]) => entry && entry.savedAtMs >= modelsCutoff)
    .sort((a, b) => b[1].savedAtMs - a[1].savedAtMs)
    .slice(0, MAX_MODELS_LOCATIONS);
  vault.models = Object.fromEntries(modelEntries);
}

function flushVaultToDisk(force = false): void {
  if (!vaultMemory || !nodeFs || !nodePath) return;
  const nowMs = Date.now();
  if (!force && nowMs - lastDiskWriteMs < 8_000) return;

  pruneVault(vaultMemory, nowMs);
  vaultMemory.updatedAtMs = nowMs;

  const filePath = resolveVaultFilePath();
  try {
    nodeFs.mkdirSync(nodePath.dirname(filePath), { recursive: true });
    const tmpPath = `${filePath}.${process.pid}.tmp`;
    nodeFs.writeFileSync(tmpPath, JSON.stringify(vaultMemory), "utf8");
    nodeFs.renameSync(tmpPath, filePath);
    lastDiskWriteMs = nowMs;
  } catch {
    // Non-fatal in read-only filesystems; in-memory vault remains active
  }
}

/**
 * Compacts `hourlySoundings` beyond 72h before disk persistence so 24 cities stay ultra-fast (< 2 MB).
 */
function compactWeatherBundleForDisk(bundle: WeatherBundle): WeatherBundle {
  if (bundle.hourlySoundings.length <= 72) return bundle;
  return {
    ...bundle,
    hourlySoundings: bundle.hourlySoundings.slice(0, 72)
  };
}

export function saveWeatherSnapshotToDisk(
  bundle: WeatherBundle,
  nowMs = Date.now(),
  forceFlush = false
): void {
  const vault = loadVault();
  const locKey = makeLocationCacheKey(bundle.location);
  const isNewLocation = !vault.weather[locKey];
  vault.weather[locKey] = {
    locKey,
    savedAtMs: nowMs,
    bundle: compactWeatherBundleForDisk(bundle)
  };
  flushVaultToDisk(forceFlush || isNewLocation);
}

export function getWeatherSnapshotFromDisk(
  lat: number,
  lon: number,
  nowMs = Date.now()
): StoredWeatherSnapshot | null {
  const vault = loadVault();
  const locKey = makeLocationCacheKey(lat, lon);
  const direct = vault.weather[locKey];
  if (direct && nowMs - direct.savedAtMs <= WEATHER_RETENTION_MS) {
    return direct;
  }

  // Secondary tolerance lookup (±0.05°) in case URL vs preset rounded slightly differently
  let best: StoredWeatherSnapshot | null = null;
  for (const entry of Object.values(vault.weather)) {
    if (nowMs - entry.savedAtMs > WEATHER_RETENTION_MS) continue;
    const bLoc = entry.bundle.location;
    if (Math.abs(bLoc.lat - lat) <= 0.05 && Math.abs(bLoc.lon - lon) <= 0.05) {
      if (!best || entry.savedAtMs > best.savedAtMs) {
        best = entry;
      }
    }
  }
  return best;
}

export function saveModelsSnapshotToDisk(
  models: MultiModelBundle,
  nowMs = Date.now(),
  forceFlush = false
): void {
  const vault = loadVault();
  const locKey = makeLocationCacheKey(models.lat, models.lon);
  const isNewLocation = !vault.models[locKey];
  vault.models[locKey] = {
    locKey,
    savedAtMs: nowMs,
    models
  };
  flushVaultToDisk(forceFlush || isNewLocation);
}

export function getModelsSnapshotFromDisk(
  lat: number,
  lon: number,
  nowMs = Date.now()
): StoredModelsSnapshot | null {
  const vault = loadVault();
  const locKey = makeLocationCacheKey(lat, lon);
  const direct = vault.models[locKey];
  if (direct && nowMs - direct.savedAtMs <= MODELS_RETENTION_MS) {
    return direct;
  }

  for (const entry of Object.values(vault.models)) {
    if (nowMs - entry.savedAtMs > MODELS_RETENTION_MS) continue;
    if (
      Math.abs(entry.models.lat - lat) <= 0.05 &&
      Math.abs(entry.models.lon - lon) <= 0.05
    ) {
      return entry;
    }
  }
  return null;
}

/** Simulates a cold Node.js process restart by dropping RAM cache while keeping the disk file intact. */
export function evictSnapshotMemoryForTests(): void {
  vaultMemory = null;
  lastDiskWriteMs = 0;
}

export function resetSnapshotStoreForTests(): void {
  vaultMemory = emptyVault();
  lastDiskWriteMs = 0;
  if (typeof process !== "undefined" && process.env?.ATMOS_SNAPSHOT_PATH && nodeFs) {
    try {
      if (nodeFs.existsSync(process.env.ATMOS_SNAPSHOT_PATH)) {
        nodeFs.unlinkSync(process.env.ATMOS_SNAPSHOT_PATH);
      }
    } catch {
      // Ignore test cleanup errors
    }
  }
}
