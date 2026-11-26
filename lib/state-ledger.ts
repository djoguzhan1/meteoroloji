/**
 * ATMOS v5.0 — Persistent Observation & Calibrated Forecast Run Ledger
 * File: lib/state-ledger.ts
 *
 * Eliminates serverless/process amnesia by persisting:
 *  1. Rolling 96-hour Bursa MGM 19-district & target-point verified observations
 *     -> Powers real Bursa MGM 48-72h model verification (replacing 47 km LTBR airport),
 *     -> Supplies true `sameHour24hResidualC` for diurnal AR(2) error locking,
 *     -> Tracks true observed intraday min/max & accumulated rain for `daily[0]` ("Bugün").
 *  2. Rolling 6-hourly Calibrated Forecast Run Snapshots (R0, R-1, R-2, R-3)
 *     -> Guarantees apples-to-apples Calibrated-vs-Calibrated `dProg/dt` run consistency
 *        (fixing the v4.5 bug where calibrated EMOS was damped back toward raw uncalibrated NWP).
 *
 * Pure Node.js (`node:fs`) atomic write-through store with zero native C++ dependencies
 * (works across Node 18/20/22+, Docker, VPS, and serverless `/tmp` fallback).
 */

type NodeFsSubset = typeof import("node:fs");
type NodePathSubset = typeof import("node:path");

function getNodeBuiltin<T>(specifier: string): T | null {
  if (typeof process === "undefined" || !process.versions?.node) return null;
  const procAny = process as unknown as { getBuiltinModule?: (id: string) => T | undefined };
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
  locKey: string; // rounded "lat,lon"
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

const RETENTION_MS = 96 * 3600 * 1000; // 96 hours
const MAX_RUNS_PER_LOC = 6;

let memoryCache: LedgerDiskSchema | null = null;
let resolvedLedgerPath: string | null = null;
let lastDiskFlushMs = 0;

function emptySchema(): LedgerDiskSchema {
  return {
    version: 5,
    updatedAtMs: Date.now(),
    stations: {},
    targetHistory: {},
    calibratedRuns: {}
  };
}

function resolveWritableLedgerPath(): string {
  if (!nodeFs || !nodePath) return "/tmp/atmos-v5-ledger.json";
  if (nodeFs && typeof process !== "undefined" && process.env?.ATMOS_LEDGER_PATH) {
    return process.env.ATMOS_LEDGER_PATH;
  }
  if (resolvedLedgerPath) return resolvedLedgerPath;

  const candidates = [
    nodePath!.resolve(process.cwd(), ".data/atmos-v5-ledger.json"),
    "/tmp/atmos-v5-ledger.json"
  ];

  for (const candidate of candidates) {
    try {
      nodeFs!.mkdirSync(nodePath!.dirname(candidate), { recursive: true });
      nodeFs!.accessSync(nodePath!.dirname(candidate), nodeFs!.constants.W_OK);
      resolvedLedgerPath = candidate;
      return candidate;
    } catch {
      // Fall through to next writable path
    }
  }
  resolvedLedgerPath = "/tmp/atmos-v5-ledger.json";
  return resolvedLedgerPath;
}

function loadLedger(): LedgerDiskSchema {
  if (memoryCache) return memoryCache;
  if (!nodeFs || !nodePath) {
    memoryCache = emptySchema();
    return memoryCache;
  }
  const filePath = resolveWritableLedgerPath();
  try {
    if (nodeFs!.existsSync(filePath)) {
      const raw = nodeFs!.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as LedgerDiskSchema;
      if (parsed && parsed.version === 5 && parsed.stations && parsed.targetHistory && parsed.calibratedRuns) {
        memoryCache = parsed;
        return memoryCache;
      }
    }
  } catch {
    // Corrupted or unreadable file -> start clean
  }
  memoryCache = emptySchema();
  return memoryCache;
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

function flushLedgerToDisk(force = false): void {
  if (!memoryCache || !nodeFs || !nodePath) return;
  const nowMs = Date.now();
  if (!force && nowMs - lastDiskFlushMs < 15_000) return;

  pruneLedger(memoryCache, nowMs);
  memoryCache.updatedAtMs = nowMs;

  const filePath = resolveWritableLedgerPath();
  try {
    nodeFs!.mkdirSync(nodePath!.dirname(filePath), { recursive: true });
    const tmpPath = `${filePath}.${process.pid}.tmp`;
    nodeFs!.writeFileSync(tmpPath, JSON.stringify(memoryCache), "utf8");
    nodeFs!.renameSync(tmpPath, filePath);
    lastDiskFlushMs = nowMs;
  } catch {
    // Non-fatal in read-only sandbox; in-memory ledger continues uninterrupted
  }
}

export function resetStateLedgerForTests(): void {
  memoryCache = emptySchema();
  lastDiskFlushMs = 0;
  if (process.env.ATMOS_LEDGER_PATH) {
    try {
      if (nodeFs!.existsSync(process.env.ATMOS_LEDGER_PATH)) {
        nodeFs!.unlinkSync(process.env.ATMOS_LEDGER_PATH);
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}

export function makeLedgerLocationKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
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
 * Records fresh QC-passed station observations (e.g. 19 MGM Bursa stations) into the rolling 96h ledger.
 */
export function recordStationObservationsToLedger(points: LedgerStationPoint[], forceFlush = false): void {
  if (points.length === 0) return;
  const ledger = loadLedger();
  for (const pt of points) {
    if (!Number.isFinite(pt.tempC)) continue;
    const stMap = ledger.stations[pt.stationId] ?? {};
    const existing = stMap[pt.utcHourKey];
    if (!existing || pt.observedAtMs >= existing.observedAtMs) {
      stMap[pt.utcHourKey] = pt;
      ledger.stations[pt.stationId] = stMap;
    }
  }
  flushLedgerToDisk(forceFlush);
}

/**
 * Retrieves up to `maxHours` of recorded station history for live Bursa MGM model verification.
 */
export function getStationHistoryFromLedger(
  stationIds?: string[],
  maxAgeHours = 72,
  nowMs = Date.now()
): LedgerStationPoint[] {
  const ledger = loadLedger();
  const minMs = nowMs - maxAgeHours * 3600 * 1000;
  const out: LedgerStationPoint[] = [];
  const keys = stationIds ?? Object.keys(ledger.stations);

  for (const id of keys) {
    const stMap = ledger.stations[id];
    if (!stMap) continue;
    for (const pt of Object.values(stMap)) {
      if (pt.observedAtMs >= minMs && pt.observedAtMs <= nowMs + 1800_000) {
        out.push(pt);
      }
    }
  }
  return out.sort((a, b) => a.observedAtMs - b.observedAtMs);
}

/**
 * Records target surface truth + EMOS base residual at exact hour so tomorrow's forecast
 * can query `sameHour24hResidualC` and `daily[0]` knows today's real observed min/max.
 */
export function recordTargetResidualToLedger(point: LedgerTargetResidualPoint, forceFlush = false): void {
  const ledger = loadLedger();
  const locMap = ledger.targetHistory[point.locKey] ?? {};
  locMap[point.utcHourKey] = point;
  ledger.targetHistory[point.locKey] = locMap;
  flushLedgerToDisk(forceFlush);
}

/**
 * Looks up the verified residual (T_obs - T_emos) from ~24 hours ago (searching [t-25h, t-23h])
 * ONLY when the synoptic regime is compatible (prevents carrying pre-frontal Lodos error into post-frontal Poyraz).
 */
export function getSameHour24hResidualFromLedger(params: {
  locKey: string;
  targetUtcMs: number;
  currentRegime: string;
}): number | null {
  const ledger = loadLedger();
  const locMap = ledger.targetHistory[params.locKey];
  if (!locMap) return null;

  const offsetsHours = [-24, -23, -25, -48];
  for (const offH of offsetsHours) {
    const probeKey = new Date(params.targetUtcMs + offH * 3600 * 1000).toISOString().slice(0, 13) + ":00";
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
): { minTempC: number | null; maxTempC: number | null; precipSumMm: number; observedHours: number } {
  const ledger = loadLedger();
  const locMap = ledger.targetHistory[locKey];
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
 * Retrieves prior calibrated forecast runs (excluding the current `activeCycleId` so intra-cycle refreshes
 * compare consistently against previous synoptic cycles R-1, R-2, R-3).
 */
export function getPriorCalibratedRunsFromLedger(
  locKey: string,
  activeCycleId: string
): LedgerCalibratedRun[] {
  const ledger = loadLedger();
  const runs = ledger.calibratedRuns[locKey] ?? [];
  return runs.filter((r) => r.cycleId !== activeCycleId);
}

/**
 * Saves or updates the calibrated 168-hour trajectory for `activeCycleId`.
 */
export function saveCalibratedRunToLedger(
  locKey: string,
  run: LedgerCalibratedRun,
  forceFlush = false
): void {
  const ledger = loadLedger();
  const runs = ledger.calibratedRuns[locKey] ?? [];
  const idx = runs.findIndex((r) => r.cycleId === run.cycleId);
  if (idx >= 0) {
    runs[idx] = run;
  } else {
    runs.push(run);
  }
  runs.sort((a, b) => a.createdAtMs - b.createdAtMs);
  ledger.calibratedRuns[locKey] = runs.slice(-MAX_RUNS_PER_LOC);
  flushLedgerToDisk(forceFlush);
}
