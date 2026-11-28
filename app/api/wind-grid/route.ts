import { NextRequest, NextResponse } from "next/server";
import { fetchWindGrid } from "@/lib/weather";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const south = Number(searchParams.get("south"));
  const west = Number(searchParams.get("west"));
  const north = Number(searchParams.get("north"));
  const east = Number(searchParams.get("east"));

  if (
    !Number.isFinite(south) ||
    !Number.isFinite(west) ||
    !Number.isFinite(north) ||
    !Number.isFinite(east) ||
    south < -90 ||
    south > 90 ||
    north < -90 ||
    north > 90 ||
    west < -180 ||
    west > 180 ||
    east < -180 ||
    east > 180
  ) {
    return NextResponse.json(
      { error: "Geçersiz harita sınır koordinatları." },
      { status: 400 }
    );
  }

  const deltaLon = east > west ? east - west : east + 360 - west;

  if (
    north <= south ||
    north - south > 85 ||
    deltaLon <= 0 ||
    deltaLon > 140
  ) {
    return NextResponse.json(
      { error: "Geçersiz harita sınır koordinatları." },
      { status: 400 }
    );
  }

  try {
    const data = await fetchWindGrid({ south, west, north, east });
    const freshnessStatus = data.freshness?.status ?? "live";
    const isFullyLive = freshnessStatus === "live";

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": isFullyLive
          ? "public, s-maxage=300, stale-while-revalidate=600"
          : "no-store, must-revalidate",
        "X-Atmos-Freshness": freshnessStatus
      }
    });
  } catch (err) {
    console.error("Wind grid API error:", err);
    return NextResponse.json(
      { error: "Canlı rüzgar vektör ızgarası alınamadı." },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, must-revalidate"
        }
      }
    );
  }
}
