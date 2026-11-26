import { NextRequest, NextResponse } from "next/server";
import { fetchWeatherBundle } from "@/lib/weather";
import { DEFAULT_LOCATION } from "@/lib/weather-client";
import type { GeoLocation } from "@/lib/weather-types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latRaw = searchParams.get("lat");
  const lonRaw = searchParams.get("lon");
  const name = searchParams.get("name")?.trim();
  const country = searchParams.get("country")?.trim();

  const lat = latRaw !== null ? Number(latRaw) : DEFAULT_LOCATION.lat;
  const lon = lonRaw !== null ? Number(lonRaw) : DEFAULT_LOCATION.lon;

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return NextResponse.json(
      { error: "Geçersiz koordinat parametreleri." },
      { status: 400 }
    );
  }

  const location: GeoLocation = {
    id: `${lat.toFixed(2)}_${lon.toFixed(2)}`,
    name:
      name ||
      (latRaw === null
        ? DEFAULT_LOCATION.name
        : `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`),
    country: country || (latRaw === null ? DEFAULT_LOCATION.country : ""),
    lat,
    lon
  };

  try {
    const bundle = await fetchWeatherBundle(location);
    const freshnessStatus = bundle.freshness?.status ?? "live";
    const sourceTier = bundle.freshness?.sourceTier ?? "live";
    const isFullyLive = freshnessStatus === "live";

    const headers: Record<string, string> = {
      "Cache-Control": isFullyLive
        ? "public, s-maxage=300, stale-while-revalidate=600"
        : "no-store, must-revalidate",
      "X-Atmos-Freshness": freshnessStatus,
      "X-Atmos-Source-Tier": sourceTier
    };
    if (!isFullyLive) {
      headers.Warning = '110 - "ATMOS serving cached forecast while upstream recovers"';
    }

    return NextResponse.json(bundle, { headers });
  } catch (err) {
    console.error("Weather API error:", err);
    return NextResponse.json(
      { error: "Meteoroloji veri servisine şu an ulaşılamıyor." },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, must-revalidate"
        }
      }
    );
  }
}
