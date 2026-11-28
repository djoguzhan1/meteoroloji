import { NextRequest, NextResponse } from "next/server";
import { fetchMultiModelBundle } from "@/lib/weather";
import { DEFAULT_LOCATION } from "@/lib/weather-client";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat") ?? DEFAULT_LOCATION.lat);
  const lon = Number(searchParams.get("lon") ?? DEFAULT_LOCATION.lon);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return NextResponse.json({ error: "Geçersiz koordinat." }, { status: 400 });
  }

  const id = searchParams.get("id")?.trim() || undefined;
  const name = searchParams.get("name")?.trim() || undefined;
  const admin1 = searchParams.get("admin1")?.trim() || undefined;
  const country = searchParams.get("country")?.trim() || undefined;
  const rawElev = searchParams.get("elevation");
  const parsedElev =
    rawElev !== null && rawElev.trim() !== "" ? Number(rawElev) : undefined;
  const elevation =
    parsedElev !== undefined &&
    Number.isFinite(parsedElev) &&
    parsedElev >= -500 &&
    parsedElev <= 9000
      ? parsedElev
      : undefined;

  try {
    const data = await fetchMultiModelBundle(lat, lon, {
      id,
      name,
      admin1,
      country,
      elevation
    });
    const freshnessStatus = data.freshness?.status ?? "live";
    const sourceTier = data.freshness?.sourceTier ?? "live";
    const isFullyLive = freshnessStatus === "live";

    const headers: Record<string, string> = {
      "Cache-Control": isFullyLive
        ? "public, s-maxage=600, stale-while-revalidate=900"
        : "no-store, must-revalidate",
      "X-Atmos-Freshness": freshnessStatus,
      "X-Atmos-Source-Tier": sourceTier
    };
    if (!isFullyLive) {
      headers.Warning = '110 - "ATMOS serving cached multi-model series while upstream recovers"';
    }

    return NextResponse.json(data, { headers });
  } catch (err) {
    console.error("Multi-model API error:", err);
    return NextResponse.json(
      {
        error:
          "8-model (ECMWF IFS / AIFS / ICON / UKMO / AROME / GFS / GEM / JMA) verileri alınamadı."
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, must-revalidate"
        }
      }
    );
  }
}
