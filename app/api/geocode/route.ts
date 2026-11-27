import { NextRequest, NextResponse } from "next/server";
import {
  BURSA_CURATED_LOCATIONS,
  GLOBE_CITIES,
  normalizeCanonicalBursaLocation
} from "@/lib/weather-client";
import type { GeoLocation } from "@/lib/weather-types";

export const dynamic = "force-dynamic";

type CacheItem = { results: GeoLocation[]; expiresAt: number; staleUntil: number };
const geoCache = new Map<string, CacheItem>();
const GEO_TTL_MS = 60 * 60 * 1000;
const GEO_STALE_MS = 48 * 60 * 60 * 1000;

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

function matchCuratedBursaLocations(qNorm: string): GeoLocation[] {
  if (!qNorm) return [];
  if (qNorm === "bursa" || qNorm === "bursa merkez") {
    return BURSA_CURATED_LOCATIONS.slice(0, 6);
  }
  return BURSA_CURATED_LOCATIONS.filter((loc) => {
    const n = normQuery(loc.name);
    const a = normQuery(loc.admin1 ?? "");
    return n.includes(qNorm) || a.includes(qNorm);
  });
}

function deduplicateLocations(list: GeoLocation[]): GeoLocation[] {
  const out: GeoLocation[] = [];
  for (const item of list) {
    const dup = out.some(
      (existing) =>
        Math.abs(existing.lat - item.lat) < 0.018 &&
        Math.abs(existing.lon - item.lon) < 0.018
    );
    if (!dup) out.push(item);
  }
  return out;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ results: GLOBE_CITIES.slice(0, 6) });
  }

  const key = normQuery(q);
  const cached = geoCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ results: cached.results });
  }

  const curatedMatches = matchCuratedBursaLocations(key);

  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", q);
    url.searchParams.set("count", "8");
    url.searchParams.set("language", "tr");
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString(), {
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
        normalizeCanonicalBursaLocation({
          id: `${item.id ?? `${item.latitude.toFixed(2)}_${item.longitude.toFixed(2)}`}`,
          name: String(item.name ?? q),
          admin1: item.admin1 ? String(item.admin1) : undefined,
          country: String(item.country ?? ""),
          countryCode: item.country_code ? String(item.country_code) : undefined,
          lat: Number(item.latitude),
          lon: Number(item.longitude),
          elevation: typeof item.elevation === "number" ? Math.round(item.elevation) : undefined,
          timezone: item.timezone ? String(item.timezone) : undefined
        })
    );

    const results = deduplicateLocations([...curatedMatches, ...apiResults]).slice(0, 10);

    const nowMs = Date.now();
    geoCache.set(key, {
      results,
      expiresAt: nowMs + GEO_TTL_MS,
      staleUntil: nowMs + GEO_STALE_MS
    });
    return NextResponse.json({ results });
  } catch {
    if (cached && cached.staleUntil > Date.now()) {
      return NextResponse.json({ results: cached.results });
    }
    const localMatches = deduplicateLocations([
      ...curatedMatches,
      ...GLOBE_CITIES.filter(
        (c) => normQuery(c.name).includes(key) || normQuery(c.country).includes(key)
      )
    ]);
    return NextResponse.json({ results: localMatches });
  }
}
