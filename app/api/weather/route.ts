import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCATION, fetchWeatherBundle, PRESET_CITIES } from "@/lib/weather";
import type { GeoLocation } from "@/lib/weather-types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latRaw = searchParams.get("lat");
  const lonRaw = searchParams.get("lon");
  const elevRaw = searchParams.get("elevation");
  const name = searchParams.get("name")?.trim();
  const country = searchParams.get("country")?.trim();

  const lat = latRaw !== null ? Number(latRaw) : DEFAULT_LOCATION.lat;
  const lon = lonRaw !== null ? Number(lonRaw) : DEFAULT_LOCATION.lon;
  const parsedElev = elevRaw !== null && elevRaw !== "" ? Number(elevRaw) : NaN;

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

  const presetMatch = PRESET_CITIES.find(
    (p) => Math.abs(p.lat - lat) < 0.01 && Math.abs(p.lon - lon) < 0.01
  );
  const elevation = Number.isFinite(parsedElev) ? parsedElev : presetMatch?.elevation;

  const location: GeoLocation = {
    id: presetMatch?.id ?? `${lat.toFixed(2)}_${lon.toFixed(2)}`,
    name:
      name ||
      presetMatch?.name ||
      (latRaw === null
        ? DEFAULT_LOCATION.name
        : `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`),
    country: country || presetMatch?.country || (latRaw === null ? DEFAULT_LOCATION.country : ""),
    lat,
    lon,
    ...(elevation !== undefined ? { elevation } : {})
  };

  try {
    const bundle = await fetchWeatherBundle(location);
    return NextResponse.json(bundle, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600"
      }
    });
  } catch (err) {
    console.error("Weather API error:", err);
    return NextResponse.json(
      { error: "Meteoroloji veri servisine şu an ulaşılamıyor." },
      { status: 503 }
    );
  }
}
