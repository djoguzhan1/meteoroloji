import { NextRequest, NextResponse } from "next/server";
import { resolveProvinceCode } from "@/lib/provinces/geo-adm1-resolver";
import { isValidProvinceCode } from "@/lib/provinces/types";
import { fetchMultiModelBundle } from "@/lib/weather";
import { DEFAULT_LOCATION } from "@/lib/weather-client";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, must-revalidate"
} as const;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latRaw = searchParams.get("lat");
  const lonRaw = searchParams.get("lon");
  const hasLat = latRaw !== null && latRaw.trim() !== "";
  const hasLon = lonRaw !== null && lonRaw.trim() !== "";

  // Franken-coordinate firewall: forbid single-axis lat or lon injection
  if (hasLat !== hasLon) {
    return NextResponse.json(
      { error: "Eksik koordinat: lat ve lon birlikte verilmelidir." },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const lat = hasLat ? Number(latRaw) : DEFAULT_LOCATION.lat;
  const lon = hasLon ? Number(lonRaw) : DEFAULT_LOCATION.lon;

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return NextResponse.json(
      { error: "Geçersiz koordinat." },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

  const id = searchParams.get("id")?.trim() || undefined;
  const name =
    (searchParams.get("name") ?? searchParams.get("city") ?? "").trim() ||
    undefined;
  const admin1 = searchParams.get("admin1")?.trim() || undefined;
  const country = searchParams.get("country")?.trim() || undefined;
  const ccRaw = (
    searchParams.get("cc") ??
    searchParams.get("countryCode") ??
    ""
  )
    .trim()
    .toUpperCase();
  const rawElev = searchParams.get("elevation") ?? searchParams.get("elev");
  const parsedElev =
    rawElev !== null && rawElev.trim() !== "" ? Number(rawElev) : undefined;
  const elevation =
    parsedElev !== undefined &&
    Number.isFinite(parsedElev) &&
    parsedElev >= -500 &&
    parsedElev <= 9000
      ? parsedElev
      : undefined;

  const effectiveAdmin1 =
    admin1 || (!hasLat ? DEFAULT_LOCATION.admin1 : undefined);
  const effectiveCc =
    ccRaw || (!hasLat ? DEFAULT_LOCATION.countryCode : undefined);

  const resolved = resolveProvinceCode({
    lat,
    lon,
    admin1: effectiveAdmin1,
    countryCode: effectiveCc
  });

  // Explicit provinceCode (`pc` / `provinceCode`) cross-province mismatch firewall
  const pcRaw = (
    searchParams.get("pc") ??
    searchParams.get("provinceCode") ??
    ""
  )
    .trim()
    .toUpperCase();
  if (pcRaw !== "") {
    if (!isValidProvinceCode(pcRaw) || pcRaw !== resolved.provinceCode) {
      return NextResponse.json(
        {
          error: `İl kodu uyuşmazlığı: istenen ${pcRaw}, koordinat ${resolved.provinceCode} iline aittir.`
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }
  }

  try {
    const rawData = await fetchMultiModelBundle(lat, lon, {
      id,
      name,
      admin1,
      country,
      elevation
    });
    const data = {
      ...rawData,
      provinceCode: resolved.provinceCode
    };
    const freshnessStatus = data.freshness?.status ?? "live";
    const sourceTier = data.freshness?.sourceTier ?? "live";
    const isFullyLive = freshnessStatus === "live";

    const headers: Record<string, string> = {
      "Cache-Control": isFullyLive
        ? "public, s-maxage=600, stale-while-revalidate=900"
        : "no-store, must-revalidate",
      "X-Atmos-Freshness": freshnessStatus,
      "X-Atmos-Source-Tier": sourceTier,
      "X-Atmos-Province": resolved.provinceCode,
      Vary: "Accept-Encoding"
    };
    if (!isFullyLive) {
      headers.Warning =
        '110 - "ATMOS serving cached multi-model series while upstream recovers"';
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
          "Cache-Control": "no-store, must-revalidate",
          "X-Atmos-Province": resolved.provinceCode,
          Vary: "Accept-Encoding"
        }
      }
    );
  }
}
