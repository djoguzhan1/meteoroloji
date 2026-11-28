import { ATMOS_HTTP_USER_AGENT } from "./bursa-mesh";
import { areLocationsEquivalent } from "./forecast-resilience";
import {
  parseLocationCookieValue,
  parseLocationFromSearchParams
} from "./location-url";
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

const geoCache = new Map<string, CacheItem>();
export const GEO_TTL_MS = 60 * 60 * 1000; // 1 hour
export const GEO_STALE_MS = 48 * 60 * 60 * 1000; // 48 hours

export function resetGeocodeCacheForTests(): void {
  geoCache.clear();
}

function normQuery(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
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

function matchCuratedBursaLocations(qNorm: string, hintNorm: string): GeoLocation[] {
  if (!qNorm) return [];
  if (hintNorm && !matchesCountryHint(DEFAULT_LOCATION, hintNorm)) {
    return [];
  }
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
  }).map(canonicalizeStationIdentity);
}

function deduplicateLocations(list: GeoLocation[]): GeoLocation[] {
  const out: GeoLocation[] = [];
  for (const item of list) {
    const dup = out.some((existing) => {
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
    return GLOBE_CITIES.slice(0, 6).map(canonicalizeStationIdentity);
  }

  const qNorm = normQuery(q);
  const hintNorm = countryHint ? normQuery(countryHint) : "";
  const cacheKey = hintNorm ? `${qNorm}|${hintNorm}` : qNorm;

  const cached = geoCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.results;
  }

  const curatedMatches = matchCuratedBursaLocations(qNorm, hintNorm).map(
    canonicalizeStationIdentity
  );
  const globeMatches = matchGlobeCities(qNorm, hintNorm);

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
      }) =>
        canonicalizeStationIdentity({
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
        })
    );

    const merged = deduplicateLocations([
      ...curatedMatches,
      ...prioritizeCountryHint(apiResults, hintNorm),
      ...globeMatches
    ]).slice(0, 10);

    const nowMs = Date.now();
    geoCache.set(cacheKey, {
      results: merged,
      expiresAt: nowMs + GEO_TTL_MS,
      staleUntil: nowMs + GEO_STALE_MS
    });
    return merged;
  } catch {
    if (cached && cached.staleUntil > Date.now()) {
      return cached.results;
    }
    return deduplicateLocations([...curatedMatches, ...globeMatches]);
  }
}

export async function resolveInitialServerLocation(input: {
  searchStr?: string | null;
  cookieVal?: string | null;
}): Promise<{ location: GeoLocation; fromUrl: boolean }> {
  const parsedUrl = parseLocationFromSearchParams(input.searchStr ?? "");

  if (parsedUrl.kind === "coords") {
    return {
      location: parsedUrl.location,
      fromUrl: true
    };
  }

  if (parsedUrl.kind === "city-only") {
    const matches = await resolveGeocodeQuery(
      parsedUrl.cityQuery,
      parsedUrl.countryHint
    );
    const location = matches[0]
      ? canonicalizeStationIdentity(matches[0])
      : DEFAULT_LOCATION;
    return {
      location,
      fromUrl: true
    };
  }

  const cookieLoc = parseLocationCookieValue(input.cookieVal);
  if (cookieLoc) {
    return {
      location: cookieLoc,
      fromUrl: false
    };
  }

  return {
    location: DEFAULT_LOCATION,
    fromUrl: false
  };
}
