import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const REVERSE_GEOCODE_UA =
  "Mozilla/5.0 (compatible; Google-Agent; +https://developers.google.com/crawling/docs/crawlers-fetchers/google-agent)";
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_CACHE_ENTRIES = 256;

interface ReverseGeocodePayload {
  name: string;
  admin1?: string;
  country: string;
  countryCode?: string;
}

const reverseGeocodeCache = new Map<
  string,
  { value: ReverseGeocodePayload; expiresAt: number }
>();

export function readReverseGeocodeCache(
  lat: number,
  lon: number,
  nowMs = Date.now()
): ReverseGeocodePayload | null {
  const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const hit = reverseGeocodeCache.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= nowMs) {
    reverseGeocodeCache.delete(key);
    return null;
  }
  // Refresh LRU order
  reverseGeocodeCache.delete(key);
  reverseGeocodeCache.set(key, hit);
  return hit.value;
}

export function writeReverseGeocodeCache(
  lat: number,
  lon: number,
  value: ReverseGeocodePayload,
  nowMs = Date.now()
): void {
  const key = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  if (reverseGeocodeCache.has(key)) {
    reverseGeocodeCache.delete(key);
  } else if (reverseGeocodeCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = reverseGeocodeCache.keys().next().value;
    if (oldestKey !== undefined) reverseGeocodeCache.delete(oldestKey);
  }
  reverseGeocodeCache.set(key, {
    value,
    expiresAt: nowMs + CACHE_TTL_MS
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "Geçersiz koordinat." }, { status: 400 });
  }

  const cached = readReverseGeocodeCache(lat, lon);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
        "X-Atmos-Cache": "HIT"
      }
    });
  }

  try {
    const url = new URL(
      "https://api.bigdatacloud.net/data/reverse-geocode-client"
    );
    url.searchParams.set("latitude", lat.toFixed(4));
    url.searchParams.set("longitude", lon.toFixed(4));
    url.searchParams.set("localityLanguage", "tr");

    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": REVERSE_GEOCODE_UA
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) {
      throw new Error(`Reverse geocode HTTP ${res.status}`);
    }

    const data = await res.json();
    const city =
      data.city ||
      data.locality ||
      data.principalSubdivision ||
      data.countryName ||
      `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
    const country = data.countryName || (city.includes("°") ? "Açık Deniz" : "");

    const payload: ReverseGeocodePayload = {
      name: String(city),
      admin1: data.principalSubdivision ? String(data.principalSubdivision) : undefined,
      country: String(country),
      countryCode: data.countryCode ? String(data.countryCode) : undefined
    };

    writeReverseGeocodeCache(lat, lon, payload);

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
        "X-Atmos-Cache": "MISS"
      }
    });
  } catch {
    return NextResponse.json(
      {
        name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
        country: "Koordinat"
      },
      {
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
