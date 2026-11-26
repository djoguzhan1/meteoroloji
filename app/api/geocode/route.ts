import { NextRequest, NextResponse } from "next/server";
import { GLOBE_CITIES } from "@/lib/weather-client";
import type { GeoLocation } from "@/lib/weather-types";

export const dynamic = "force-dynamic";

type CacheItem = { results: GeoLocation[]; expiresAt: number; staleUntil: number };
const geoCache = new Map<string, CacheItem>();
const GEO_TTL_MS = 60 * 60 * 1000;
const GEO_STALE_MS = 48 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ results: GLOBE_CITIES.slice(0, 6) });
  }

  const key = q.toLowerCase();
  const cached = geoCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json({ results: cached.results });
  }

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
    const results: GeoLocation[] = raw.map(
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
      }) => ({
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
    const localMatches = GLOBE_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(key) || c.country.toLowerCase().includes(key)
    );
    return NextResponse.json({ results: localMatches });
  }
}
