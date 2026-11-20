import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = Number(searchParams.get("lat"));
  const lon = Number(searchParams.get("lon"));

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Geçersiz koordinat." }, { status: 400 });
  }

  try {
    const url = new URL(
      "https://api.bigdatacloud.net/data/reverse-geocode-client"
    );
    url.searchParams.set("latitude", lat.toFixed(4));
    url.searchParams.set("longitude", lon.toFixed(4));
    url.searchParams.set("localityLanguage", "tr");

    const res = await fetch(url.toString(), {
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

    return NextResponse.json({
      name: String(city),
      admin1: data.principalSubdivision ? String(data.principalSubdivision) : undefined,
      country: String(country),
      countryCode: data.countryCode ? String(data.countryCode) : undefined
    });
  } catch {
    return NextResponse.json({
      name: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
      country: "Koordinat"
    });
  }
}
