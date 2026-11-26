import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCATION, fetchMultiModelBundle } from "@/lib/weather";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat") ?? DEFAULT_LOCATION.lat);
  const lon = Number(searchParams.get("lon") ?? DEFAULT_LOCATION.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "Geçersiz koordinat." }, { status: 400 });
  }

  try {
    const data = await fetchMultiModelBundle(lat, lon);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=900"
      }
    });
  } catch (err) {
    console.error("Multi-model API error:", err);
    return NextResponse.json(
      { error: "7-model (ECMWF / AIFS / ICON / UKMO / AROME / GFS / GEM) verileri alınamadı." },
      { status: 503 }
    );
  }
}
