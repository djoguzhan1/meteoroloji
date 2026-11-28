/**
 * ATMOS v5.0 — Province-Sharded Persistent Observation & Calibrated Forecast Run Ledger
 * File: lib/state-ledger.ts
 *
 * Eliminates serverless/process amnesia AND enforces 0.00% cross-province state bleed:
 *  1. Dedicated Bursa TR-16 ledger: `.data/bursa-tr16/ledger.json`
 *     - Parameterless `recordStationObservationsToLedger` (called by SHA-256 frozen `bursa-mesh.ts`)
 *       writes exclusively to `.data/bursa-tr16/ledger.json` and strips perimeter neighbor stations
 *       (`LTFJ` Istanbul, `LTBG` Balikesir, cross-bay Yalova PWS).
 *  2. 80 isolated provincial ledgers: `.data/provinces/TR-XX/ledger.json` (plus `.data/global/ledger.json`)
 *     via `recordProvinceStationObservationsToLedger` & `getProvinceStationHistoryFromLedger`.
 *  3. Elevation + Province namespaced `makeLedgerLocationKey` (`TR-XX:lat,lon:eElev`) with 100%
 *     backward compatibility for legacy 2-arg callers and `process.env.ATMOS_LEDGER_PATH` tests.
 *  4. Copy-on-write & `structuredClone` isolation (zero in-place `.push`/`.sort` mutation on shared arrays).
 */

import {
  cloneIsolatedValue,
  parseProvinceFromCacheKey
} from "./provinces/isolation/namespaced-cache";
import { isValidProvinceCode, type ProvinceCode } from "./provinces/types";

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

export interface LedgerStationPoint {
  stationId: string;
  utcHourKey: string; // "YYYY-MM-DDTHH:00"
  observedAtMs: number;
  lat: number;
  lon: number;
  elevationM: number;
  tempC: number;
  dewPointC: number | null;
  pressureMslHpa: number | null;
  windSpeedKmh: number | null;
  windDirDeg: number | null;
  precipMmHr: number;
  hasPrecip: boolean;
}

export interface LedgerTargetResidualPoint {
  locKey: string; // legacy "lat,lon" or strict "TR-XX:lat,lon:eElev"
  utcHourKey: string; // "YYYY-MM-DDTHH:00"
  localDateYmd: string; // "YYYY-MM-DD" in local timezone
  localHour: number; // 0..23
  observedAtMs: number;
  observedTempC: number;
  emosBaseTempC: number | null;
  residualC: number | null; // observedTempC - emosBaseTempC
  regime: string;
  precipMmHr: number;
}

export interface LedgerForecastHourLock {
  tempC: number;
  isWet: boolean;
  precipMmHr: number;
  popPct: number;
}

export interface LedgerCalibratedRun {
  cycleId: string; // e.g. "2026-11-26T12Z"
  createdAtMs: number;
  regime: string;
  /** Map from UTC hour key ("YYYY-MM-DDTHH:00") to calibrated forecast values */
  hours: Record<string, LedgerForecastHourLock>;
}

export interface LedgerLocationKeyOptions {
  provinceCode?: ProvinceCode;
  elevationM?: number | null;
}

interface LedgerDiskSchema {
  version: 5;
  updatedAtMs: number;
  /** stationId -> utcHourKey -> observation */
  stations: Record<string, Record<string, LedgerStationPoint>>;
  /** locKey -> utcHourKey -> target residual & observed temp */
  targetHistory: Record<string, Record<string, LedgerTargetResidualPoint>>;
  /** locKey -> ordered list of calibrated synoptic runs (oldest..newest, max 6) */
  calibratedRuns: Record<string, LedgerCalibratedRun[]>;
}

interface LedgerShardRuntime {
  filePath: string;
  ledger: LedgerDiskSchema;
  lastDiskFlushMs: number;
  dirty: boolean;
  pendingTimer: ReturnType<typeof setTimeout> | null;
  writeSeq: number;
}

const RETENTION_MS = 96 * 3600 * 1000; // 96 hours
const MAX_RUNS_PER_LOC = 6;
const LEDGER_WRITE_THROTTLE_MS = 15_000;
const PROVINCE_STATION_SEP = "::";

/** Non-Bursa neighbor stations that must never enter Bursa's TR-16 ledger */
const NON_BURSA_LEDGER_STATION_IDS = new Set([
  "LTFJ",
  "ICAO_LTFJ",
  "LTBG",
  "ICAO_LTBG",
  "LTBQ",
  "ICAO_LTBQ",
  "LTBA",
  "ICAO_LTBA",
  "LTFM",
  "ICAO_LTFM",
  "LTBY",
  "ICAO_LTBY",
  "17114",
  "WMO_17114"
]);

const ledgerShards = new Map<string, LedgerShardRuntime>();
let cachedBaseDir: string | null = null;
let cachedBaseDirEnv: string | undefined;

function emptySchema(): LedgerDiskSchema {
  return {
    version: 5,
    updatedAtMs: Date.now(),
    stations: {},
    targetHistory: {},
    calibratedRuns: {}
  };
}

function hasExplicitLegacyLedgerPath(): boolean {
  return Boolean(
    typeof process !== "undefined" &&
      process.env?.ATMOS_LEDGER_PATH &&
      process.env.ATMOS_LEDGER_PATH.trim().length > 0
  );
}

function resolveBaseDataDir(): string {
  if (!nodeFs || !nodePath) return "/tmp/atmos-v5-data";

  const envDataDir =
    typeof process !== "undefined" && process.env?.ATMOS_DATA_DIR
      ? process.env.ATMOS_DATA_DIR.trim()
      : undefined;

  if (cachedBaseDir && cachedBaseDirEnv === envDataDir) {
    return cachedBaseDir;
  }

  const candidates = envDataDir
    ? [nodePath.resolve(envDataDir), "/tmp/atmos-v5-data"]
    : [nodePath.resolve(process.cwd(), ".data"), "/tmp/atmos-v5-data"];

  for (const candidate of candidates) {
    try {
      nodeFs.mkdirSync(candidate, { recursive: true });
      nodeFs.accessSync(candidate, nodeFs.constants.W_OK);
      cachedBaseDir = candidate;
      cachedBaseDirEnv = envDataDir;
      return candidate;
    } catch {
      // Fall through to next writable directory
    }
  }

  cachedBaseDir = "/tmp/atmos-v5-data";
  cachedBaseDirEnv = envDataDir;
  return cachedBaseDir;
}

/**
 * Resolves the isolated physical disk shard path for a given `ProvinceCode`.
 *  - `TR-16` -> `<baseDir>/bursa-tr16/ledger.json`
 *  - `TR-01..TR-81` (`!= TR-16`) -> `<baseDir>/provinces/<provinceCode>/ledger.json`
 *  - `GLOBAL` -> `<baseDir>/global/ledger.json`
 */
export function resolveLedgerShardPath(provinceCode: ProvinceCode = "TR-16"): string {
  if (hasExplicitLegacyLedgerPath()) {
    return process.env.ATMOS_LEDGER_PATH!;
  }
  const baseDir = resolveBaseDataDir();
  if (!nodePath) {
    if (provinceCode === "TR-16") return `${baseDir}/bursa-tr16/ledger.json`;
    if (provinceCode === "GLOBAL") return `${baseDir}/global/ledger.json`;
    return `${baseDir}/provinces/${provinceCode}/ledger.json`;
  }
  if (provinceCode === "TR-16") {
    return nodePath.join(baseDir, "bursa-tr16", "ledger.json");
  }
  if (provinceCode === "GLOBAL") {
    return nodePath.join(baseDir, "global", "ledger.json");
  }
  return nodePath.join(baseDir, "provinces", provinceCode, "ledger.json");
}

function loadLedgerShard(provinceCode: ProvinceCode): LedgerShardRuntime {
  const filePath = resolveLedgerShardPath(provinceCode);
  const existing = ledgerShards.get(filePath);
  if (existing) return existing;

  let loaded: LedgerDiskSchema | null = null;
  if (nodeFs && nodePath) {
    try {
      if (nodeFs.existsSync(filePath)) {
        const raw = nodeFs.readFileSync(filePath, "utf8");
        const parsed = JSON.parse(raw) as LedgerDiskSchema;
        if (
          parsed &&
          parsed.version === 5 &&
          parsed.stations &&
          parsed.targetHistory &&
          parsed.calibratedRuns
        ) {
          loaded = parsed;
        }
      }
    } catch {
      // Corrupted or unreadable file -> start clean
    }
  }

  const runtime: LedgerShardRuntime = {
    filePath,
    ledger: loaded ?? emptySchema(),
    lastDiskFlushMs: 0,
    dirty: false,
    pendingTimer: null,
    writeSeq: 0
  };
  ledgerShards.set(filePath, runtime);
  return runtime;
}

function pruneLedger(ledger: LedgerDiskSchema, nowMs: number): void {
  const cutoffMs = nowMs - RETENTION_MS;

  for (const [stId, hourMap] of Object.entries(ledger.stations)) {
    for (const [uKey, pt] of Object.entries(hourMap)) {
      if (pt.observedAtMs < cutoffMs) {
        delete hourMap[uKey];
      }
    }
    if (Object.keys(hourMap).length === 0) {
      delete ledger.stations[stId];
    }
  }

  for (const [locKey, hourMap] of Object.entries(ledger.targetHistory)) {
    for (const [uKey, pt] of Object.entries(hourMap)) {
      if (pt.observedAtMs < cutoffMs) {
        delete hourMap[uKey];
      }
    }
    if (Object.keys(hourMap).length === 0) {
      delete ledger.targetHistory[locKey];
    }
  }

  for (const [locKey, runs] of Object.entries(ledger.calibratedRuns)) {
    const filtered = runs
      .filter((r) => r.createdAtMs >= cutoffMs)
      .slice(-MAX_RUNS_PER_LOC);
    if (filtered.length === 0) {
      delete ledger.calibratedRuns[locKey];
    } else {
      ledger.calibratedRuns[locKey] = filtered;
    }
  }
}

function writeLedgerShardNowSync(shard: LedgerShardRuntime, nowMs = Date.now()): void {
  if (shard.pendingTimer !== null) {
    clearTimeout(shard.pendingTimer);
    shard.pendingTimer = null;
  }
  if (!nodeFs || !nodePath) {
    shard.dirty = false;
    return;
  }

  pruneLedger(shard.ledger, nowMs);
  shard.ledger.updatedAtMs = nowMs;

  try {
    nodeFs.mkdirSync(nodePath.dirname(shard.filePath), { recursive: true });
    shard.writeSeq += 1;
    const tmpPath = `${shard.filePath}.${process.pid}.${shard.writeSeq}.tmp`;
    nodeFs.writeFileSync(tmpPath, JSON.stringify(shard.ledger), "utf8");
    nodeFs.renameSync(tmpPath, shard.filePath);
    shard.lastDiskFlushMs = nowMs;
    shard.dirty = false;
  } catch {
    // Non-fatal in read-only sandbox; in-memory ledger continues uninterrupted
  }
}

function flushLedgerShardToDisk(shard: LedgerShardRuntime, force = false): void {
  if (!nodeFs || !nodePath) return;
  const nowMs = Date.now();
  const elapsed = nowMs - shard.lastDiskFlushMs;

  if (force || shard.lastDiskFlushMs === 0 || elapsed >= LEDGER_WRITE_THROTTLE_MS) {
    writeLedgerShardNowSync(shard, nowMs);
    return;
  }

  shard.dirty = true;
  if (shard.pendingTimer === null) {
    const remainingMs = Math.max(25, LEDGER_WRITE_THROTTLE_MS - elapsed);
    const timer = setTimeout(() => {
      shard.pendingTimer = null;
      if (shard.dirty) {
        writeLedgerShardNowSync(shard, Date.now());
      }
    }, remainingMs);
    const maybeUnref = timer as unknown as { unref?: () => void };
    if (typeof maybeUnref.unref === "function") {
      maybeUnref.unref();
    }
    shard.pendingTimer = timer;
  }
}

export function flushAllPendingLedgersSync(): void {
  const nowMs = Date.now();
  for (const shard of ledgerShards.values()) {
    if (shard.dirty) {
      writeLedgerShardNowSync(shard, nowMs);
    } else if (shard.pendingTimer !== null) {
      clearTimeout(shard.pendingTimer);
      shard.pendingTimer = null;
    }
  }
}

export function evictStateLedgerMemoryForTests(): void {
  flushAllPendingLedgersSync();
  ledgerShards.clear();
  cachedBaseDir = null;
}

export function resetStateLedgerForTests(): void {
  for (const shard of ledgerShards.values()) {
    if (shard.pendingTimer !== null) {
      clearTimeout(shard.pendingTimer);
      shard.pendingTimer = null;
    }
  }
  ledgerShards.clear();
  cachedBaseDir = null;

  if (typeof process !== "undefined" && nodeFs) {
    if (process.env?.ATMOS_LEDGER_PATH) {
      try {
        if (nodeFs.existsSync(process.env.ATMOS_LEDGER_PATH)) {
          nodeFs.unlinkSync(process.env.ATMOS_LEDGER_PATH);
        }
      } catch {
        // Ignore cleanup errors
      }
    }
    if (process.env?.ATMOS_DATA_DIR && nodePath) {
      try {
        const customDir = nodePath.resolve(process.env.ATMOS_DATA_DIR);
        if (
          customDir.startsWith("/tmp") ||
          customDir.includes("atmos-test") ||
          customDir.includes("vitest")
        ) {
          nodeFs.rmSync(customDir, { recursive: true, force: true });
        }
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Builds a ledger location key:
 *  - Legacy 2-arg call (`opts` omitted): `${lat.toFixed(2)},${lon.toFixed(2)}` (100% backward compatible)
 *  - Strict 3-arg call (`opts` provided): `${provinceCode}:${lat.toFixed(3)},${lon.toFixed(3)}:e${Math.round(elev)}`
 */
export function makeLedgerLocationKey(
  lat: number,
  lon: number,
  opts?: LedgerLocationKeyOptions
): string {
  if (!opts) {
    return `${lat.toFixed(2)},${lon.toFixed(2)}`;
  }
  const pc = opts.provinceCode ?? "TR-16";
  if (!isValidProvinceCode(pc)) {
    throw new Error(`[ZeroBleed] Invalid provinceCode "${String(pc)}" in makeLedgerLocationKey`);
  }
  const elevInt =
    opts.elevationM !== undefined &&
    opts.elevationM !== null &&
    Number.isFinite(opts.elevationM)
      ? Math.round(opts.elevationM)
      : 0;
  return `${pc}:${lat.toFixed(3)},${lon.toFixed(3)}:e${elevInt}`;
}

function resolveShardProvinceForLocKey(locKey: string): ProvinceCode {
  return parseProvinceFromCacheKey(locKey) ?? "TR-16";
}

function isStrictBursaTr16StationPoint(pt: LedgerStationPoint): boolean {
  const idNorm = (pt.stationId ?? "").trim().toUpperCase();
  if (!idNorm || NON_BURSA_LEDGER_STATION_IDS.has(idNorm)) {
    return false;
  }
  if (idNorm.includes(PROVINCE_STATION_SEP)) {
    return false;
  }
  if (!Number.isFinite(pt.lat) || !Number.isFinite(pt.lon)) {
    return false;
  }
  // Exclude neighbor-province coordinates (Yalova >=40.52N, Istanbul >=40.70N, Bandirma <28.18E, Kutahya/Bilecik)
  if (pt.lat < 39.65 || pt.lat > 40.52 || pt.lon < 28.18 || pt.lon > 29.80) {
    return false;
  }
  if (pt.lat < 39.85 && pt.lon > 29.50) {
    return false;
  }
  return true;
}

/**
 * Computes the active 6-hourly synoptic NWP assimilation cycle ID ("YYYY-MM-DDT00Z" | "06Z" | "12Z" | "18Z").
 * Operational centers publish ~3.5 hours after synoptic nominal time, so we lag by 3.5h to align cycles cleanly.
 */
export function computeSynopticCycleId(nowMs = Date.now()): string {
  const shifted = new Date(nowMs - 3.5 * 3600 * 1000);
  const ymd = shifted.toISOString().slice(0, 10);
  const cyc = Math.floor(shifted.getUTCHours() / 6) * 6;
  return `${ymd}T${String(cyc).padStart(2, "0")}Z`;
}

/**
 * Records fresh QC-passed Bursa (TR-16) station observations into `.data/bursa-tr16/ledger.json`.
 * Automatically strips perimeter neighbor stations (`LTFJ`, `LTBG`, cross-border PWS) emitted by
 * SHA-256 frozen `lib/bursa-mesh.ts`.
 */
export function recordStationObservationsToLedger(
  points: LedgerStationPoint[],
  forceFlush = false
): void {
  if (points.length === 0) return;
  const strictTr16Points = points.filter(
    (pt) => Number.isFinite(pt.tempC) && isStrictBursaTr16StationPoint(pt)
  );
  if (strictTr16Points.length === 0) return;

  const shard = loadLedgerShard("TR-16");
  const ledger = shard.ledger;

  for (const pt of strictTr16Points) {
    const clonedPt = cloneIsolatedValue(pt);
    const stMap = ledger.stations[clonedPt.stationId]
      ? { ...ledger.stations[clonedPt.stationId] }
      : {};
    const existing = stMap[clonedPt.utcHourKey];
    if (!existing || clonedPt.observedAtMs >= existing.observedAtMs) {
      stMap[clonedPt.utcHourKey] = clonedPt;
      ledger.stations[clonedPt.stationId] = stMap;
    }
  }

  flushLedgerShardToDisk(shard, forceFlush);
}

/**
 * Retrieves up to `maxHours` of recorded Bursa (TR-16) station history from `.data/bursa-tr16/ledger.json`.
 */
export function getStationHistoryFromLedger(
  stationIds?: string[],
  maxAgeHours = 72,
  nowMs = Date.now()
): LedgerStationPoint[] {
  const shard = loadLedgerShard("TR-16");
  const ledger = shard.ledger;
  const minMs = nowMs - maxAgeHours * 3600 * 1000;
  const out: LedgerStationPoint[] = [];
  const keys = stationIds ?? Object.keys(ledger.stations);

  for (const id of keys) {
    if (id.includes(PROVINCE_STATION_SEP)) continue;
    if (NON_BURSA_LEDGER_STATION_IDS.has(id.trim().toUpperCase())) continue;
    const stMap = ledger.stations[id];
    if (!stMap) continue;
    for (const pt of Object.values(stMap)) {
      if (!isStrictBursaTr16StationPoint(pt)) continue;
      if (pt.observedAtMs >= minMs && pt.observedAtMs <= nowMs + 1800_000) {
        out.push(cloneIsolatedValue(pt));
      }
    }
  }
  return out.sort((a, b) => a.observedAtMs - b.observedAtMs);
}

/**
 * Records fresh QC-passed station observations strictly into that province's isolated shard
 * (`.data/provinces/TR-XX/ledger.json`, `.data/bursa-tr16/ledger.json`, or `.data/global/ledger.json`).
 */
export function recordProvinceStationObservationsToLedger(
  provinceCode: ProvinceCode,
  points: LedgerStationPoint[],
  forceFlush = false
): void {
  if (!isValidProvinceCode(provinceCode)) {
    throw new Error(
      `[ZeroBleed] Invalid provinceCode "${String(provinceCode)}" in recordProvinceStationObservationsToLedger`
    );
  }
  if (provinceCode === "TR-16") {
    recordStationObservationsToLedger(points, forceFlush);
    return;
  }
  if (points.length === 0) return;

  const shard = loadLedgerShard(provinceCode);
  const ledger = shard.ledger;
  const useSingleFilePrefix = hasExplicitLegacyLedgerPath();
  let wroteAny = false;

  for (const pt of points) {
    if (!Number.isFinite(pt.tempC) || !pt.stationId) continue;
    const clonedPt = cloneIsolatedValue(pt);
    const bucketKey = useSingleFilePrefix
      ? `${provinceCode}${PROVINCE_STATION_SEP}${clonedPt.stationId}`
      : clonedPt.stationId;
    const stMap = ledger.stations[bucketKey] ? { ...ledger.stations[bucketKey] } : {};
    const existing = stMap[clonedPt.utcHourKey];
    if (!existing || clonedPt.observedAtMs >= existing.observedAtMs) {
      stMap[clonedPt.utcHourKey] = clonedPt;
      ledger.stations[bucketKey] = stMap;
      wroteAny = true;
    }
  }

  if (wroteAny) {
    flushLedgerShardToDisk(shard, forceFlush);
  }
}

/**
 * Retrieves up to `maxAgeHours` of recorded station history strictly from `provinceCode`'s isolated shard.
 */
export function getProvinceStationHistoryFromLedger(
  provinceCode: ProvinceCode,
  maxAgeHours = 72,
  nowMs = Date.now(),
  stationIds?: string[]
): LedgerStationPoint[] {
  if (!isValidProvinceCode(provinceCode)) {
    throw new Error(
      `[ZeroBleed] Invalid provinceCode "${String(provinceCode)}" in getProvinceStationHistoryFromLedger`
    );
  }
  if (provinceCode === "TR-16") {
    return getStationHistoryFromLedger(stationIds, maxAgeHours, nowMs);
  }

  const shard = loadLedgerShard(provinceCode);
  const ledger = shard.ledger;
  const minMs = nowMs - maxAgeHours * 3600 * 1000;
  const useSingleFilePrefix = hasExplicitLegacyLedgerPath();
  const prefix = `${provinceCode}${PROVINCE_STATION_SEP}`;
  const requestedSet = stationIds ? new Set(stationIds) : null;

  const out: LedgerStationPoint[] = [];
  for (const [bucketKey, stMap] of Object.entries(ledger.stations)) {
    if (!stMap) continue;
    let rawStationId = bucketKey;
    if (useSingleFilePrefix) {
      if (!bucketKey.startsWith(prefix)) continue;
      rawStationId = bucketKey.slice(prefix.length);
    } else if (bucketKey.includes(PROVINCE_STATION_SEP)) {
      continue;
    }
    if (requestedSet && !requestedSet.has(rawStationId)) continue;

    for (const pt of Object.values(stMap)) {
      if (pt.observedAtMs >= minMs && pt.observedAtMs <= nowMs + 1800_000) {
        out.push(cloneIsolatedValue(pt));
      }
    }
  }

  return out.sort((a, b) => a.observedAtMs - b.observedAtMs);
}

/**
 * Records target surface truth + EMOS base residual at exact hour into the target province's shard.
 */
export function recordTargetResidualToLedger(
  point: LedgerTargetResidualPoint,
  forceFlush = false
): void {
  const provinceCode = resolveShardProvinceForLocKey(point.locKey);
  const shard = loadLedgerShard(provinceCode);
  const ledger = shard.ledger;
  const clonedPoint = cloneIsolatedValue(point);
  const locMap = ledger.targetHistory[clonedPoint.locKey]
    ? { ...ledger.targetHistory[clonedPoint.locKey] }
    : {};
  locMap[clonedPoint.utcHourKey] = clonedPoint;
  ledger.targetHistory[clonedPoint.locKey] = locMap;
  flushLedgerShardToDisk(shard, forceFlush);
}

/**
 * Looks up the verified residual (T_obs - T_emos) from ~24 hours ago (searching [t-25h, t-23h])
 * ONLY within the target's isolated `locKey` & synoptic regime.
 */
export function getSameHour24hResidualFromLedger(params: {
  locKey: string;
  targetUtcMs: number;
  currentRegime: string;
}): number | null {
  const provinceCode = resolveShardProvinceForLocKey(params.locKey);
  const shard = loadLedgerShard(provinceCode);
  const locMap = shard.ledger.targetHistory[params.locKey];
  if (!locMap) return null;

  const offsetsHours = [-24, -23, -25, -48];
  for (const offH of offsetsHours) {
    const probeKey =
      new Date(params.targetUtcMs + offH * 3600 * 1000).toISOString().slice(0, 13) + ":00";
    const match = locMap[probeKey];
    if (
      match &&
      match.residualC !== null &&
      Number.isFinite(match.residualC) &&
      (match.regime === params.currentRegime ||
        params.currentRegime === "SYNOPTIC_TRANSITION" ||
        match.regime === "SYNOPTIC_TRANSITION")
    ) {
      return match.residualC;
    }
  }
  return null;
}

/**
 * Returns today's true observed temperature extremes and accumulated precipitation recorded so far.
 */
export function getTodayObservedExtremesFromLedger(
  locKey: string,
  localDateYmd: string
): {
  minTempC: number | null;
  maxTempC: number | null;
  precipSumMm: number;
  observedHours: number;
} {
  const provinceCode = resolveShardProvinceForLocKey(locKey);
  const shard = loadLedgerShard(provinceCode);
  const locMap = shard.ledger.targetHistory[locKey];
  if (!locMap) {
    return { minTempC: null, maxTempC: null, precipSumMm: 0, observedHours: 0 };
  }

  let minT = Infinity;
  let maxT = -Infinity;
  let precipSum = 0;
  let count = 0;

  for (const pt of Object.values(locMap)) {
    if (pt.localDateYmd !== localDateYmd) continue;
    if (Number.isFinite(pt.observedTempC)) {
      if (pt.observedTempC < minT) minT = pt.observedTempC;
      if (pt.observedTempC > maxT) maxT = pt.observedTempC;
      precipSum += Math.max(0, pt.precipMmHr);
      count++;
    }
  }

  return {
    minTempC: count > 0 ? minT : null,
    maxTempC: count > 0 ? maxT : null,
    precipSumMm: Number(precipSum.toFixed(2)),
    observedHours: count
  };
}

/**
 * Retrieves deep-cloned prior calibrated forecast runs (excluding `activeCycleId`).
 */
export function getPriorCalibratedRunsFromLedger(
  locKey: string,
  activeCycleId: string
): LedgerCalibratedRun[] {
  const provinceCode = resolveShardProvinceForLocKey(locKey);
  const shard = loadLedgerShard(provinceCode);
  const runs = shard.ledger.calibratedRuns[locKey] ?? [];
  return cloneIsolatedValue(runs.filter((r) => r.cycleId !== activeCycleId));
}

/**
 * Saves or updates the calibrated 168-hour trajectory for `activeCycleId` using copy-on-write
 * (zero in-place `.push` or `.sort` mutation on shared arrays).
 */
export function saveCalibratedRunToLedger(
  locKey: string,
  run: LedgerCalibratedRun,
  forceFlush = false
): void {
  const provinceCode = resolveShardProvinceForLocKey(locKey);
  const shard = loadLedgerShard(provinceCode);
  const existingRuns = shard.ledger.calibratedRuns[locKey] ?? [];
  const clonedRun = cloneIsolatedValue(run);

  const nextRuns = [...existingRuns];
  const idx = nextRuns.findIndex((r) => r.cycleId === clonedRun.cycleId);
  if (idx >= 0) {
    nextRuns[idx] = clonedRun;
  } else {
    nextRuns.push(clonedRun);
  }
  nextRuns.sort((a, b) => a.createdAtMs - b.createdAtMs);

  shard.ledger.calibratedRuns[locKey] = nextRuns.slice(-MAX_RUNS_PER_LOC);
  flushLedgerShardToDisk(shard, forceFlush);
}
