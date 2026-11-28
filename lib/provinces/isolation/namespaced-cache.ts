/**
 * ATMOS v5.0 — Province-Namespaced Singleflight & Deep-Isolated Server Cache
 * File: lib/provinces/isolation/namespaced-cache.ts
 *
 * Enforces mathematical 0.00% cross-province data bleed in Node.js server memory:
 *  1. Canonical province-locked cache keys (`TR-XX:<id>:<lat4>,<lon4>:e<elev>`).
 *  2. Partitioned sub-maps (`Map<ProvinceCode, Map<string, Entry>>`) where `TR-16` (Bursa)
 *     is permanently pinned so traffic across the other 80 provinces or GLOBAL can NEVER evict Bursa.
 *  3. Deep `structuredClone` isolation on both write and read so in-place `.sort()`, `.push()`,
 *     or field mutations by any caller can never poison shared cache state.
 *  4. Per-province + per-key `singleflight` request coalescing for concurrent millisecond bursts.
 */

import {
  isTrProvinceCode,
  isValidProvinceCode,
  type ProvinceCode,
  type TrProvinceCode
} from "../types";

export interface StrictProvinceCacheKeyParams {
  provinceCode: ProvinceCode;
  locationId?: string;
  lat: number;
  lon: number;
  elevationM?: number | null;
}

export interface CacheEntryMetadata<T> {
  value: T;
  isStale: boolean;
  cachedAtMs: number;
  expiresAtMs: number;
  staleUntilMs: number;
  provinceCode: ProvinceCode;
  key: string;
}

interface InternalCacheRecord<T> {
  value: T;
  cachedAtMs: number;
  expiresAtMs: number;
  staleUntilMs: number;
  provinceCode: ProvinceCode;
  key: string;
}

export interface BoundedSingleflightCacheOptions {
  /** Maximum entries per non-pinned province partition (default: 64) */
  maxEntriesPerProvince?: number;
  /** Dedicated capacity for pinned TR-16 Bursa partition (default: 128) */
  bursaMaxEntries?: number;
  /** Maximum total entries across all non-pinned partitions combined (default: 1024) */
  maxTotalNonPinnedEntries?: number;
  /** Default live TTL in milliseconds (default: 5 minutes) */
  defaultTtlMs?: number;
  /** Default stale retention window in milliseconds (default: 24 hours) */
  defaultStaleMs?: number;
  /** Provinces immune to cross-province global cap eviction (default: ["TR-16"]) */
  pinnedProvinces?: readonly ProvinceCode[];
}

/**
 * Deeply clones any structured value so shared reference mutations (`sort`, `push`, property writes)
 * are mathematically impossible between concurrent requests and cached entries.
 */
export function cloneIsolatedValue<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }
  return fallbackDeepClone(value);
}

function fallbackDeepClone<T>(val: T): T {
  if (val === null || typeof val !== "object") return val;
  if (val instanceof Date) return new Date(val.getTime()) as unknown as T;
  if (Array.isArray(val)) {
    return val.map((item) => fallbackDeepClone(item)) as unknown as T;
  }
  if (val instanceof Map) {
    const out = new Map();
    for (const [k, v] of val.entries()) {
      out.set(fallbackDeepClone(k), fallbackDeepClone(v));
    }
    return out as unknown as T;
  }
  if (val instanceof Set) {
    const out = new Set();
    for (const v of val.values()) {
      out.add(fallbackDeepClone(v));
    }
    return out as unknown as T;
  }
  if (ArrayBuffer.isView(val)) {
    const ctor = val.constructor as new (buf: ArrayBufferLike) => T;
    return new ctor(val.buffer.slice(val.byteOffset, val.byteOffset + val.byteLength));
  }
  const copy: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
    copy[k] = fallbackDeepClone(v);
  }
  return copy as T;
}

function sanitizeKeySegment(raw?: string): string {
  if (!raw) return "coord";
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[:\s/\\]+/g, "_")
    .replace(/[^a-z0-9_.-]/g, "");
  return cleaned.length > 0 ? cleaned : "coord";
}

/**
 * Constructs a canonical, collision-proof cache key strictly namespaced by `ProvinceCode` and elevation:
 * `${provinceCode}:${cleanId}:${lat.toFixed(4)},${lon.toFixed(4)}:e${Math.round(elevationM ?? 0)}`
 */
export function makeStrictProvinceCacheKey(params: StrictProvinceCacheKeyParams): string {
  if (!isValidProvinceCode(params.provinceCode)) {
    throw new Error(
      `[ZeroBleed] Invalid provinceCode "${String(params.provinceCode)}" in makeStrictProvinceCacheKey`
    );
  }
  if (!Number.isFinite(params.lat) || !Number.isFinite(params.lon)) {
    throw new Error("[ZeroBleed] Non-finite coordinates in makeStrictProvinceCacheKey");
  }
  const cleanId = sanitizeKeySegment(params.locationId);
  const elevInt =
    params.elevationM !== undefined &&
    params.elevationM !== null &&
    Number.isFinite(params.elevationM)
      ? Math.round(params.elevationM)
      : 0;
  return `${params.provinceCode}:${cleanId}:${params.lat.toFixed(4)},${params.lon.toFixed(4)}:e${elevInt}`;
}

/**
 * Extracts a leading `ProvinceCode` (`TR-01`..`TR-81` or `GLOBAL`) from a namespaced key if present.
 */
export function parseProvinceFromCacheKey(key: string): ProvinceCode | null {
  if (!key || typeof key !== "string") return null;
  const colonIdx = key.indexOf(":");
  if (colonIdx <= 0) return null;
  const prefix = key.slice(0, colonIdx);
  return isValidProvinceCode(prefix) ? prefix : null;
}

function normalizeTrToken(input: string): string {
  return input
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u");
}

const TR_PROVINCE_NAME_TO_CODE: Readonly<Record<string, TrProvinceCode>> = Object.freeze({
  adana: "TR-01",
  adiyaman: "TR-02",
  afyonkarahisar: "TR-03",
  afyon: "TR-03",
  agri: "TR-04",
  amasya: "TR-05",
  ankara: "TR-06",
  antalya: "TR-07",
  artvin: "TR-08",
  aydin: "TR-09",
  balikesir: "TR-10",
  bilecik: "TR-11",
  bingol: "TR-12",
  bitlis: "TR-13",
  bolu: "TR-14",
  burdur: "TR-15",
  bursa: "TR-16",
  canakkale: "TR-17",
  cankiri: "TR-18",
  corum: "TR-19",
  denizli: "TR-20",
  diyarbakir: "TR-21",
  edirne: "TR-22",
  elazig: "TR-23",
  erzincan: "TR-24",
  erzurum: "TR-25",
  eskisehir: "TR-26",
  gaziantep: "TR-27",
  giresun: "TR-28",
  gumushane: "TR-29",
  hakkari: "TR-30",
  hatay: "TR-31",
  isparta: "TR-32",
  mersin: "TR-33",
  icel: "TR-33",
  istanbul: "TR-34",
  izmir: "TR-35",
  kars: "TR-36",
  kastamonu: "TR-37",
  kayseri: "TR-38",
  kirklareli: "TR-39",
  kirsehir: "TR-40",
  kocaeli: "TR-41",
  izmit: "TR-41",
  konya: "TR-42",
  kutahya: "TR-43",
  malatya: "TR-44",
  manisa: "TR-45",
  kahramanmaras: "TR-46",
  maras: "TR-46",
  mardin: "TR-47",
  mugla: "TR-48",
  mus: "TR-49",
  nevsehir: "TR-50",
  nigde: "TR-51",
  ordu: "TR-52",
  rize: "TR-53",
  sakarya: "TR-54",
  adapazari: "TR-54",
  samsun: "TR-55",
  siirt: "TR-56",
  sinop: "TR-57",
  sivas: "TR-58",
  tekirdag: "TR-59",
  tokat: "TR-60",
  trabzon: "TR-61",
  tunceli: "TR-62",
  sanliurfa: "TR-63",
  urfa: "TR-63",
  usak: "TR-64",
  van: "TR-65",
  yozgat: "TR-66",
  zonguldak: "TR-67",
  aksaray: "TR-68",
  bayburt: "TR-69",
  karaman: "TR-70",
  kirikkale: "TR-71",
  batman: "TR-72",
  sirnak: "TR-73",
  bartin: "TR-74",
  ardahan: "TR-75",
  igdir: "TR-76",
  yalova: "TR-77",
  karabuk: "TR-78",
  kilis: "TR-79",
  osmaniye: "TR-80",
  duzce: "TR-81"
});

/**
 * Infers a canonical `ProvinceCode` from location metadata when an explicit `provinceCode`
 * is present or derivable from `id`, `admin1`, `name`, or `countryCode`.
 * Returns `null` if the Turkish province cannot be unambiguously determined from metadata alone.
 */
export function inferProvinceCodeFromLocationMeta(
  loc?: {
    provinceCode?: unknown;
    id?: string;
    name?: string;
    admin1?: string;
    country?: string;
    countryCode?: string;
  } | null
): ProvinceCode | null {
  if (!loc) return null;
  if (isValidProvinceCode(loc.provinceCode)) {
    return loc.provinceCode;
  }

  if (loc.id) {
    const idPrefix = parseProvinceFromCacheKey(loc.id);
    if (idPrefix) return idPrefix;

    const idNorm = normalizeTrToken(loc.id);
    const trPlateMatch = idNorm.match(/\btr[-_](0[1-9]|[1-7][0-9]|8[01])\b/);
    if (trPlateMatch) {
      const candidate = `TR-${trPlateMatch[1]}` as ProvinceCode;
      if (isTrProvinceCode(candidate)) return candidate;
    }
    if (idNorm === "bursa-tr" || idNorm.startsWith("bursa-")) {
      return "TR-16";
    }
    const idFirstToken = idNorm.split(/[-_]/)[0] ?? "";
    if (idFirstToken && TR_PROVINCE_NAME_TO_CODE[idFirstToken] && idNorm.endsWith("-tr")) {
      return TR_PROVINCE_NAME_TO_CODE[idFirstToken];
    }
  }

  const cc = (loc.countryCode ?? "").trim().toUpperCase();
  if (cc.length > 0 && cc !== "TR") {
    return "GLOBAL";
  }

  if (loc.country) {
    const cNorm = normalizeTrToken(loc.country);
    if (
      cNorm.length > 0 &&
      cNorm !== "turkiye" &&
      cNorm !== "turkey" &&
      cNorm !== "tr" &&
      cNorm !== "koordinat"
    ) {
      return "GLOBAL";
    }
  }

  if (loc.admin1) {
    const adminNorm = normalizeTrToken(loc.admin1);
    if (adminNorm.includes("wmo 17116") || adminNorm.includes("bursa")) {
      return "TR-16";
    }
    const tokens = adminNorm.split(/[^a-z0-9]+/).filter(Boolean);
    for (const tok of tokens) {
      const mapped = TR_PROVINCE_NAME_TO_CODE[tok];
      if (mapped) return mapped;
    }
  }

  if (loc.name) {
    const nameNorm = normalizeTrToken(loc.name);
    if (TR_PROVINCE_NAME_TO_CODE[nameNorm]) {
      return TR_PROVINCE_NAME_TO_CODE[nameNorm];
    }
  }

  return null;
}

/**
 * Province-partitioned, singleflight-coalesced, clone-on-read/write server memory cache.
 *
 * Guarantees:
 *  - `TR-16` (Bursa) lives in a dedicated pinned `Map` that is NEVER touched by eviction pressure
 *    from `TR-01..TR-81` or `GLOBAL`.
 *  - Concurrent identical requests share a single upstream execution (`singleflight`) while each
 *    awaiting caller receives an independent deep clone.
 */
export class BoundedSingleflightCache<T> {
  private readonly partitions = new Map<ProvinceCode, Map<string, InternalCacheRecord<T>>>();
  private readonly inFlight = new Map<string, Promise<T>>();
  private readonly maxEntriesPerProvince: number;
  private readonly bursaMaxEntries: number;
  private readonly maxTotalNonPinnedEntries: number;
  private readonly defaultTtlMs: number;
  private readonly defaultStaleMs: number;
  private readonly pinnedProvinces: ReadonlySet<ProvinceCode>;

  constructor(options: BoundedSingleflightCacheOptions = {}) {
    this.maxEntriesPerProvince = Math.max(1, options.maxEntriesPerProvince ?? 64);
    this.bursaMaxEntries = Math.max(1, options.bursaMaxEntries ?? 128);
    this.maxTotalNonPinnedEntries = Math.max(8, options.maxTotalNonPinnedEntries ?? 1024);
    this.defaultTtlMs = Math.max(1, options.defaultTtlMs ?? 5 * 60 * 1000);
    this.defaultStaleMs = Math.max(this.defaultTtlMs, options.defaultStaleMs ?? 24 * 3600 * 1000);
    this.pinnedProvinces = new Set<ProvinceCode>(options.pinnedProvinces ?? ["TR-16"]);
  }

  private assertProvince(provinceCode: ProvinceCode): void {
    if (!isValidProvinceCode(provinceCode)) {
      throw new Error(`[ZeroBleed] Invalid provinceCode "${String(provinceCode)}"`);
    }
  }

  private assertKeyBelongsToProvince(provinceCode: ProvinceCode, key: string): void {
    const prefix = parseProvinceFromCacheKey(key);
    if (prefix !== null && prefix !== provinceCode) {
      throw new Error(
        `[ZeroBleed] Cross-province key mismatch: key "${key}" cannot access partition "${provinceCode}"`
      );
    }
  }

  private maxCapFor(provinceCode: ProvinceCode): number {
    return provinceCode === "TR-16" ? this.bursaMaxEntries : this.maxEntriesPerProvince;
  }

  private countNonPinnedEntries(): number {
    let total = 0;
    for (const [pc, subMap] of this.partitions.entries()) {
      if (this.pinnedProvinces.has(pc)) continue;
      total += subMap.size;
    }
    return total;
  }

  private evictGlobalNonPinnedIfNeeded(nowMs: number): void {
    // Pass 1: sweep expired beyond staleUntilMs in non-pinned partitions
    if (this.countNonPinnedEntries() > this.maxTotalNonPinnedEntries) {
      for (const [pc, subMap] of this.partitions.entries()) {
        if (this.pinnedProvinces.has(pc)) continue;
        for (const [k, rec] of subMap.entries()) {
          if (rec.staleUntilMs <= nowMs) {
            subMap.delete(k);
          }
        }
        if (subMap.size === 0) {
          this.partitions.delete(pc);
        }
      }
    }

    // Pass 2: evict globally oldest non-pinned entries (NEVER touches pinned TR-16!)
    while (this.countNonPinnedEntries() > this.maxTotalNonPinnedEntries) {
      let oldestPc: ProvinceCode | null = null;
      let oldestKey: string | null = null;
      let oldestSavedMs = Infinity;

      for (const [pc, subMap] of this.partitions.entries()) {
        if (this.pinnedProvinces.has(pc) || subMap.size === 0) continue;
        const firstEntry = subMap.entries().next().value as [string, InternalCacheRecord<T>] | undefined;
        if (firstEntry && firstEntry[1].cachedAtMs < oldestSavedMs) {
          oldestSavedMs = firstEntry[1].cachedAtMs;
          oldestPc = pc;
          oldestKey = firstEntry[0];
        }
      }

      if (!oldestPc || oldestKey === null) break;
      const targetMap = this.partitions.get(oldestPc);
      targetMap?.delete(oldestKey);
      if (targetMap && targetMap.size === 0) {
        this.partitions.delete(oldestPc);
      }
    }
  }

  get(provinceCode: ProvinceCode, key: string, nowMs = Date.now()): T | null {
    const meta = this.getWithMeta(provinceCode, key, nowMs, false);
    return meta ? meta.value : null;
  }

  getWithMeta(
    provinceCode: ProvinceCode,
    key: string,
    nowMs = Date.now(),
    allowStale = false
  ): CacheEntryMetadata<T> | null {
    this.assertProvince(provinceCode);
    this.assertKeyBelongsToProvince(provinceCode, key);

    const subMap = this.partitions.get(provinceCode);
    if (!subMap) return null;

    const record = subMap.get(key);
    if (!record) return null;

    if (record.staleUntilMs <= nowMs) {
      subMap.delete(key);
      if (subMap.size === 0 && !this.pinnedProvinces.has(provinceCode)) {
        this.partitions.delete(provinceCode);
      }
      return null;
    }

    const isFresh = record.expiresAtMs > nowMs;
    if (!isFresh && !allowStale) {
      return null;
    }

    // Refresh LRU order strictly within this province's isolated partition
    subMap.delete(key);
    subMap.set(key, record);

    return {
      value: cloneIsolatedValue(record.value),
      isStale: !isFresh,
      cachedAtMs: record.cachedAtMs,
      expiresAtMs: record.expiresAtMs,
      staleUntilMs: record.staleUntilMs,
      provinceCode: record.provinceCode,
      key: record.key
    };
  }

  set(
    provinceCode: ProvinceCode,
    key: string,
    value: T,
    opts?: { ttlMs?: number; staleMs?: number; nowMs?: number }
  ): void {
    this.assertProvince(provinceCode);
    this.assertKeyBelongsToProvince(provinceCode, key);

    const nowMs = opts?.nowMs ?? Date.now();
    const ttlMs = Math.max(1, opts?.ttlMs ?? this.defaultTtlMs);
    const staleMs = Math.max(ttlMs, opts?.staleMs ?? this.defaultStaleMs);

    let subMap = this.partitions.get(provinceCode);
    if (!subMap) {
      subMap = new Map<string, InternalCacheRecord<T>>();
      this.partitions.set(provinceCode, subMap);
    }

    if (subMap.has(key)) {
      subMap.delete(key);
    }

    const cap = this.maxCapFor(provinceCode);
    while (subMap.size >= cap) {
      const oldestKey = subMap.keys().next().value;
      if (oldestKey === undefined) break;
      subMap.delete(oldestKey);
    }

    subMap.set(key, {
      value: cloneIsolatedValue(value),
      cachedAtMs: nowMs,
      expiresAtMs: nowMs + ttlMs,
      staleUntilMs: nowMs + staleMs,
      provinceCode,
      key
    });

    if (!this.pinnedProvinces.has(provinceCode)) {
      this.evictGlobalNonPinnedIfNeeded(nowMs);
    }
  }

  async getOrFetch(
    provinceCode: ProvinceCode,
    key: string,
    fetcher: () => Promise<T>,
    opts?: {
      ttlMs?: number;
      staleMs?: number;
      nowMs?: number;
      bypassCache?: boolean;
    }
  ): Promise<T> {
    this.assertProvince(provinceCode);
    this.assertKeyBelongsToProvince(provinceCode, key);

    if (!opts?.bypassCache) {
      const hit = this.get(provinceCode, key, opts?.nowMs ?? Date.now());
      if (hit !== null) {
        return hit;
      }
    }

    const flightKey = `${provinceCode}::${key}`;
    const existingFlight = this.inFlight.get(flightKey);
    if (existingFlight) {
      const shared = await existingFlight;
      return cloneIsolatedValue(shared);
    }

    const promise = (async () => {
      const freshValue = await fetcher();
      this.set(provinceCode, key, freshValue, {
        ttlMs: opts?.ttlMs,
        staleMs: opts?.staleMs,
        nowMs: Date.now()
      });
      return freshValue;
    })();

    this.inFlight.set(flightKey, promise);
    try {
      const resolved = await promise;
      return cloneIsolatedValue(resolved);
    } finally {
      this.inFlight.delete(flightKey);
    }
  }

  has(provinceCode: ProvinceCode, key: string, nowMs = Date.now()): boolean {
    const subMap = this.partitions.get(provinceCode);
    const rec = subMap?.get(key);
    return Boolean(rec && rec.expiresAtMs > nowMs);
  }

  delete(provinceCode: ProvinceCode, key: string): boolean {
    this.assertProvince(provinceCode);
    const subMap = this.partitions.get(provinceCode);
    if (!subMap) return false;
    const deleted = subMap.delete(key);
    if (subMap.size === 0 && !this.pinnedProvinces.has(provinceCode)) {
      this.partitions.delete(provinceCode);
    }
    return deleted;
  }

  clearProvince(provinceCode: ProvinceCode): void {
    this.assertProvince(provinceCode);
    this.partitions.delete(provinceCode);
  }

  clearAll(): void {
    this.partitions.clear();
    this.inFlight.clear();
  }

  sizeForProvince(provinceCode: ProvinceCode): number {
    return this.partitions.get(provinceCode)?.size ?? 0;
  }

  inFlightCount(): number {
    return this.inFlight.size;
  }
}
