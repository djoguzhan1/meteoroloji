import { NextResponse } from "next/server";
import { fetchRadarMetadata } from "@/lib/weather";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const meta = await fetchRadarMetadata();
    return NextResponse.json(meta, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300"
      }
    });
  } catch (err) {
    console.error("Radar API error:", err);
    return NextResponse.json(
      { error: "Canlı yağış radarı verisi alınamadı." },
      { status: 503 }
    );
  }
}
