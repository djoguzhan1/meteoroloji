import { NextRequest, NextResponse } from "next/server";
import { resolveGeocodeQuery } from "@/lib/geocode-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const countryHint =
    (searchParams.get("country") ?? searchParams.get("cc") ?? "").trim() ||
    undefined;

  const results = await resolveGeocodeQuery(q, countryHint);
  return NextResponse.json({ results });
}
