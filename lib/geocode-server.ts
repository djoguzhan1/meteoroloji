import { ATMOS_HTTP_USER_AGENT } from "./bursa-mesh";
import { areLocationsEquivalent } from "./forecast-resilience";
import {
  parseLocationCookieValue,
  parseLocationFromSearchParams
} from "./location-url";
import {
  foldTrCatalog,
  searchTrNationalCatalog
} from "./provinces/catalog-1102";
import { resolveProvinceCode } from "./provinces/geo-adm1-resolver";
import {
  isValidProvinceCode,
  type CatalogLocationEntry
} from "./provinces/types";
import {
  BURSA_CURATED_LOCATIONS,
  canonicalizeStationIdentity,
  DEFAULT_LOCATION,
  GLOBE_CITIES
} from "./weather-client";
import type { GeoLocation } from "./weather-types";

type CacheItem = {
  results: GeoLocation[];
  expiresAt: number;
  staleUntil: number;
};

const MAX_GEO_CACHE_ENTRIES = 512;
const geoCache = new Map<string, CacheItem>();
export const GEO_TTL_MS = 60 * 60 * 1000; // 1 hour
export const GEO_STALE_MS = 48 * 60 * 60 * 1000; // 48 hours

const BURSA_CURATED_BY_ID: ReadonlyMap<string, GeoLocation> = new Map(
  BURSA_CURATED_LOCATIONS.map((loc) => [loc.id, loc])
);

export function resetGeocodeCacheForTests(): void {
  geoCache.clear();
}

function setGeoCacheBounded(key: string, value: CacheItem): void {
  if (geoCache.has(key)) {
    geoCache.delete(key);
  } else if (geoCache.size >= MAX_GEO_CACHE_ENTRIES) {
    const oldestKey = geoCache.keys().next().value;
    if (oldestKey !== undefined) {
      geoCache.delete(oldestKey);
    }
  }
  geoCache.set(key, value);
}

function normQuery(s: string): string {
  return foldTrCatalog(s);
}

function isTurkishOrEmptyCountryHint(hintNorm: string): boolean {
  if (!hintNorm) return true;
  return (
    hintNorm === "tr" ||
    hintNorm === "tur" ||
    hintNorm === "turkiye" ||
    hintNorm === "turkey"
  );
}

function matchesCountryHint(loc: GeoLocation, hintNorm: string): boolean {
  if (!hintNorm) return true;
  const cc = normQuery(loc.countryCode ?? "");
  const country = normQuery(loc.country ?? "");
  if (hintNorm.length === 2) {
    return cc === hintNorm;
  }
  return country.includes(hintNorm) || cc === hintNorm;
}

function stampLocationProvinceCode(loc: GeoLocation): GeoLocation {
  if (loc.provinceCode && isValidProvinceCode(loc.provinceCode)) {
    return loc;
  }
  const resolved = resolveProvinceCode({
    lat: loc.lat,
    lon: loc.lon,
    admin1: loc.admin1,
    countryCode: loc.countryCode
  });
  return {
    ...loc,
    provinceCode: resolved.provinceCode
  };
}

function catalogEntryToGeoLocation(entry: CatalogLocationEntry): GeoLocation {
  const curatedBursa = BURSA_CURATED_BY_ID.get(entry.id);
  if (curatedBursa) {
    return {
      ...curatedBursa,
      provinceCode: "TR-16",
      ...(entry.kind !== "province_center" ? { district: entry.name } : {})
    };
  }

  let admin1: string;
  if (entry.kind === "province_center") {
    admin1 = entry.wmoId
      ? `${entry.provinceName} · Merkez (WMO ${entry.wmoId})`
      : `${entry.provinceName} · Merkez`;
  } else if (entry.kind === "summit_ski") {
    admin1 = entry.mgmSondurumIstNo
      ? `${entry.provinceName} · Zirve / Kayak (MGM ${entry.mgmSondurumIstNo})`
      : `${entry.provinceName} · Zirve / Kayak`;
  } else {
    admin1 = entry.mgmSondurumIstNo
      ? `${entry.provinceName} (MGM ${entry.mgmSondurumIstNo})`
      : entry.provinceName;
  }

  return {
    id: entry.id,
    name: entry.name,
    admin1,
    ...(entry.kind !== "province_center" ? { district: entry.name } : {}),
    provinceCode: entry.provinceCode,
    country: "Türkiye",
    countryCode: "TR",
    lat: entry.lat,
    lon: entry.lon,
    elevation: entry.elevationM,
    timezone: "Europe/Istanbul"
  };
}

function hasStrongTurkishAnchor(
  query: string,
  entries: readonly CatalogLocationEntry[]
): boolean {
  if (entries.length === 0) return false;
  const qFolded = foldTrCatalog(query);
  if (!qFolded) return false;
  const qTokens = qFolded.split(" ").filter(Boolean);

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const nameFolded = foldTrCatalog(e.name);
    const provFolded = foldTrCatalog(e.provinceName);
    const platePadded = e.plateNumber < 10 ? `0${e.plateNumber}` : String(e.plateNumber);
    const nameWords = nameFolded.split(" ").filter(Boolean);
    const aliasesFolded = (e.aliases ?? []).map(foldTrCatalog);

    const anyPrefixOrExact = qTokens.some(
      (tok) =>
        tok === platePadded ||
        tok === String(e.plateNumber) ||
        nameFolded.startsWith(tok) ||
        provFolded.startsWith(tok) ||
        nameWords.some((w) => w.startsWith(tok)) ||
        aliasesFolded.some((a) => a.startsWith(tok) || a.split(" ").some((aw) => aw.startsWith(tok)))
    );
    if (anyPrefixOrExact) return true;
  }
  return false;
}

function isExactOrCompoundTrCatalogHit(
  query: string,
  entries: readonly CatalogLocationEntry[]
): boolean {
  if (entries.length === 0) return false;
  const qFolded = foldTrCatalog(query);
  if (!qFolded) return false;
  const qTokens = qFolded.split(" ").filter(Boolean);
  const top = entries[0];
  const topName = foldTrCatalog(top.name);
  const topProv = foldTrCatalog(top.provinceName);
  const platePadded = top.plateNumber < 10 ? `0${top.plateNumber}` : String(top.plateNumber);
  const aliases = (top.aliases ?? []).map(foldTrCatalog);

  if (
    qFolded === topName ||
    qFolded === topProv ||
    qFolded === `${topProv} ${topName}` ||
    qFolded === `${platePadded} ${topName}` ||
    qFolded === `${top.plateNumber} ${topName}` ||
    aliases.includes(qFolded)
  ) {
    return true;
  }

  if (qTokens.length >= 1) {
    const topWordPool = new Set<string>([
      ...topName.split(" "),
      ...topProv.split(" "),
      platePadded,
      String(top.plateNumber),
      `tr${platePadded}`,
      "kayak",
      "zirve",
      "merkez",
      ...aliases.flatMap((a) => a.split(" "))
    ]);
    if (qTokens.every((t) => topWordPool.has(t))) {
      return true;
    }
  }

  return false;
}

function matchCuratedBursaLocations(qNorm: string, hintNorm: string): GeoLocation[] {
  if (!qNorm || !isTurkishOrEmptyCountryHint(hintNorm)) return [];
  if (qNorm === "bursa" || qNorm === "bursa merkez") {
    return BURSA_CURATED_LOCATIONS.slice(0, 6);
  }
  return BURSA_CURATED_LOCATIONS.filter((loc) => {
    const n = normQuery(loc.name);
    const a = normQuery(loc.admin1 ?? "");
    return n.includes(qNorm) || a.includes(qNorm);
  });
}

function matchGlobeCities(qNorm: string, hintNorm: string): GeoLocation[] {
  if (!qNorm) return [];
  return GLOBE_CITIES.filter((c) => {
    if (hintNorm && !matchesCountryHint(c, hintNorm)) return false;
    return (
      normQuery(c.name).includes(qNorm) ||
      normQuery(c.country).includes(qNorm) ||
      normQuery(c.id.split("-")[0] ?? "").includes(qNorm)
    );
  }).map((c) => stampLocationProvinceCode(canonicalizeStationIdentity(c)));
}

function isCuratedTurkishCatalogId(id: string | undefined): boolean {
  if (!id) return false;
  return id.startsWith("bursa-") || id.startsWith("tr-");
}

function deduplicateLocations(list: GeoLocation[]): GeoLocation[] {
  const out: GeoLocation[] = [];
  for (const item of list) {
    const dup = out.some((existing) => {
      if (existing.id && item.id && existing.id === item.id) {
        return true;
      }
      if (
        existing.provinceCode &&
        item.provinceCode &&
        existing.provinceCode !== item.provinceCode
      ) {
        return false;
      }
      if (
        existing.id &&
        item.id &&
        existing.id.startsWith("bursa-") &&
        item.id.startsWith("bursa-") &&
        existing.id !== item.id
      ) {
        return false;
      }
      if (
        isCuratedTurkishCatalogId(existing.id) &&
        isCuratedTurkishCatalogId(item.id) &&
        existing.id !== item.id &&
        !existing.id.endsWith("-merkez") &&
        !item.id.endsWith("-merkez") &&
        normQuery(existing.name) !== normQuery(item.name)
      ) {
        return false;
      }
      if (
        typeof existing.elevation === "number" &&
        typeof item.elevation === "number" &&
        Number.isFinite(existing.elevation) &&
        Number.isFinite(item.elevation) &&
        Math.abs(existing.elevation - item.elevation) >= 65
      ) {
        return false;
      }
      return areLocationsEquivalent(existing, item, 0.018);
    });
    if (!dup) out.push(item);
  }
  return out;
}

function prioritizeCountryHint(
  list: GeoLocation[],
  hintNorm: string
): GeoLocation[] {
  if (!hintNorm) return list;
  const preferred: GeoLocation[] = [];
  const rest: GeoLocation[] = [];
  for (const item of list) {
    if (matchesCountryHint(item, hintNorm)) {
      preferred.push(item);
    } else {
      rest.push(item);
    }
  }
  return [...preferred, ...rest];
}

export async function resolveGeocodeQuery(
  query: string,
  countryHint?: string
): Promise<GeoLocation[]> {
  const q = (query ?? "").trim();
  if (q.length < 2) {
    return GLOBE_CITIES.slice(0, 6).map((c) =>
      stampLocationProvinceCode(canonicalizeStationIdentity(c))
    );
  }

  const qNorm = normQuery(q);
  const hintNorm = countryHint ? normQuery(countryHint) : "";
  const cacheKey = hintNorm ? `${qNorm}|${hintNorm}` : qNorm;

  const cached = geoCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.results;
  }

  const trEligible = isTurkishOrEmptyCountryHint(hintNorm);
  const curatedMatches = trEligible
    ? matchCuratedBursaLocations(qNorm, hintNorm).map((loc) =>
        stampLocationProvinceCode(canonicalizeStationIdentity(loc))
      )
    : [];

  const rawTrCatalogEntries = trEligible
    ? searchTrNationalCatalog(q, { limit: 12 })
    : [];
  const trCatalogMatches = rawTrCatalogEntries.map(catalogEntryToGeoLocation);
  const globeMatches = matchGlobeCities(qNorm, hintNorm);

  // Exact / compound Turkish province, district, plate+district or ski summit match -> < 0.5 ms deterministic resolution
  if (trEligible && isExactOrCompoundTrCatalogHit(q, rawTrCatalogEntries)) {
    const isBursaRootQuery = qNorm === "bursa" || qNorm === "bursa merkez";
    const fastMerged = deduplicateLocations(
      isBursaRootQuery
        ? [...curatedMatches, ...trCatalogMatches, ...globeMatches]
        : [...trCatalogMatches, ...curatedMatches, ...globeMatches]
    ).slice(0, 12);

    const nowMs = Date.now();
    setGeoCacheBounded(cacheKey, {
      results: fastMerged,
      expiresAt: nowMs + GEO_TTL_MS,
      staleUntil: nowMs + GEO_STALE_MS
    });
    return fastMerged;
  }

  const strongTrAnchor = hasStrongTurkishAnchor(q, rawTrCatalogEntries);

  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", q);
    url.searchParams.set("count", "8");
    url.searchParams.set("language", "tr");
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": ATMOS_HTTP_USER_AGENT,
        Accept: "application/json"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) {
      throw new Error(`Geocode HTTP ${res.status}`);
    }

    const data = await res.json();
    const raw = Array.isArray(data?.results) ? data.results : [];
    const apiResults: GeoLocation[] = raw.map(
      (item: {
        id?: number;
        name?: string;
        admin1?: string;
        country?: string;
        country_code?: string;
        latitude: number;
        longitude: number;
        elevation?: number;
        timezone?: string;
      }) => {
        const candidate: GeoLocation = {
          id: `${item.id ?? `${item.latitude.toFixed(2)}_${item.longitude.toFixed(2)}`}`,
          name: String(item.name ?? q),
          admin1: item.admin1 ? String(item.admin1) : undefined,
          country: String(item.country ?? ""),
          countryCode: item.country_code
            ? String(item.country_code).toUpperCase()
            : undefined,
          lat: Number(item.latitude),
          lon: Number(item.longitude),
          elevation:
            typeof item.elevation === "number" && Number.isFinite(item.elevation)
              ? Math.round(item.elevation)
              : undefined,
          timezone: item.timezone ? String(item.timezone) : undefined
        };
        const resolved = resolveProvinceCode({
          lat: candidate.lat,
          lon: candidate.lon,
          admin1: candidate.admin1,
          countryCode: candidate.countryCode
        });
        const normalized =
          resolved.provinceCode === "TR-16"
            ? canonicalizeStationIdentity(candidate)
            : candidate;
        return {
          ...normalized,
          provinceCode: resolved.provinceCode
        };
      }
    );

    const prioritizedApi = prioritizeCountryHint(apiResults, hintNorm);
    const orderedCandidates = strongTrAnchor
      ? [...curatedMatches, ...trCatalogMatches, ...prioritizedApi, ...globeMatches]
      : [...curatedMatches, ...prioritizedApi, ...trCatalogMatches, ...globeMatches];

    const merged = deduplicateLocations(orderedCandidates).slice(0, 12);

    const nowMs = Date.now();
    setGeoCacheBounded(cacheKey, {
      results: merged,
      expiresAt: nowMs + GEO_TTL_MS,
      staleUntil: nowMs + GEO_STALE_MS
    });
    return merged;
  } catch {
    if (cached && cached.staleUntil > Date.now()) {
      return cached.results;
    }
    const isBursaRootQuery = qNorm === "bursa" || qNorm === "bursa merkez";
    return deduplicateLocations(
      isBursaRootQuery
        ? [...curatedMatches, ...trCatalogMatches, ...globeMatches]
        : [...trCatalogMatches, ...curatedMatches, ...globeMatches]
    ).slice(0, 12);
  }
}

export async function resolveInitialServerLocation(input: {
  searchStr?: string | null;
  cookieVal?: string | null;
}): Promise<{ location: GeoLocation; fromUrl: boolean }> {
  const parsedUrl = parseLocationFromSearchParams(input.searchStr ?? "");

  if (parsedUrl.kind === "coords") {
    return {
      location: stampLocationProvinceCode(parsedUrl.location),
      fromUrl: true
    };
  }

  if (parsedUrl.kind === "city-only") {
    const matches = await resolveGeocodeQuery(
      parsedUrl.cityQuery,
      parsedUrl.countryHint
    );
    if (matches[0]) {
      const top = matches[0];
      const canonical = isCuratedTurkishCatalogId(top.id)
        ? stampLocationProvinceCode(top)
        : stampLocationProvinceCode(canonicalizeStationIdentity(top));
      return {
        location: canonical,
        fromUrl: true
      };
    }
    return {
      location: stampLocationProvinceCode(DEFAULT_LOCATION),
      fromUrl: true
    };
  }

  const cookieLoc = parseLocationCookieValue(input.cookieVal);
  if (cookieLoc) {
    return {
      location: stampLocationProvinceCode(cookieLoc),
      fromUrl: false
    };
  }

  return {
    location: stampLocationProvinceCode(DEFAULT_LOCATION),
    fromUrl: false
  };
}
