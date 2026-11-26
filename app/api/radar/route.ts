import { NextResponse } from "next/server";
import { fetchRadarMetadata } from "@/lib/weather";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const meta = await fetchRadarMetadata();
    const freshnessStatus = meta.freshness?.status ?? "live";
    const isFullyLive = freshnessStatus === "live";

    return NextResponse.json(meta, {
      headers: {
        "Cache-Control": isFullyLive
          ? "public, s-maxage=120, stale-while-revalidate=300"
          : "no-store, must-revalidate",
        "X-Atmos-Freshness": freshnessStatus
      }
    });
  } catch (err) {
    console.error("Radar API error:", err);
    return NextResponse.json(
      { error: "Canlı yağış radarı verisi alınamadı." },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, must-revalidate"
        }
      }
    );
  }
}
