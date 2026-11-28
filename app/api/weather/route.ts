import { NextRequest, NextResponse } from "next/server";
import { resolveProvinceCode } from "@/lib/provinces/geo-adm1-resolver";
import { isValidProvinceCode } from "@/lib/provinces/types";
import { fetchWeatherBundle } from "@/lib/weather";
import {
  DEFAULT_LOCATION,
  normalizeCanonicalBursaLocation
} from "@/lib/weather-client";
import type { GeoLocation } from "@/lib/weather-types";

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

  const name = (
    searchParams.get("name") ??
    searchParams.get("city") ??
    ""
  ).trim();
  const admin1 = searchParams.get("admin1")?.trim();
  const district = searchParams.get("district")?.trim();
  const country = searchParams.get("country")?.trim();
  const ccRaw = (
    searchParams.get("cc") ??
    searchParams.get("countryCode") ??
    ""
  )
    .trim()
    .toUpperCase();
  const tzRaw = (
    searchParams.get("tz") ??
    searchParams.get("timezone") ??
    ""
  ).trim();
  const idRaw = searchParams.get("id")?.trim();
  const elevRaw = searchParams.get("elevation") ?? searchParams.get("elev");
  const parsedElev =
    elevRaw !== null && elevRaw.trim() !== "" ? Number(elevRaw) : undefined;

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
      { error: "Geçersiz koordinat parametreleri." },
      { status: 400, headers: NO_STORE_HEADERS }
    );
  }

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

  const baseLocation: GeoLocation = {
    id:
      idRaw ||
      (!hasLat ? DEFAULT_LOCATION.id : `${lat.toFixed(2)}_${lon.toFixed(2)}`),
    name:
      name ||
      (!hasLat
        ? DEFAULT_LOCATION.name
        : `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`),
    admin1: effectiveAdmin1,
    ...(district ? { district } : {}),
    provinceCode: resolved.provinceCode,
    country: country || (!hasLat ? DEFAULT_LOCATION.country : ""),
    ...(effectiveCc ? { countryCode: effectiveCc } : {}),
    lat,
    lon,
    elevation:
      parsedElev !== undefined && Number.isFinite(parsedElev)
        ? Math.round(parsedElev)
        : !hasLat
          ? DEFAULT_LOCATION.elevation
          : undefined,
    ...(tzRaw
      ? { timezone: tzRaw }
      : !hasLat && DEFAULT_LOCATION.timezone
        ? { timezone: DEFAULT_LOCATION.timezone }
        : {})
  };

  // Strictly isolate Bursa canonical station normalization to TR-16 only
  const location: GeoLocation =
    resolved.provinceCode === "TR-16"
      ? {
          ...normalizeCanonicalBursaLocation(baseLocation),
          provinceCode: "TR-16"
        }
      : baseLocation;

  try {
    const rawBundle = await fetchWeatherBundle(location);
    const bundle = {
      ...rawBundle,
      location: {
        ...rawBundle.location,
        provinceCode: resolved.provinceCode,
        ...(district && !rawBundle.location.district ? { district } : {})
      }
    };
    const freshnessStatus = bundle.freshness?.status ?? "live";
    const sourceTier = bundle.freshness?.sourceTier ?? "live";
    const isFullyLive = freshnessStatus === "live";

    const headers: Record<string, string> = {
      "Cache-Control": isFullyLive
        ? "public, s-maxage=300, stale-while-revalidate=600"
        : "no-store, must-revalidate",
      "X-Atmos-Freshness": freshnessStatus,
      "X-Atmos-Source-Tier": sourceTier,
      "X-Atmos-Province": resolved.provinceCode,
      Vary: "Accept-Encoding"
    };
    if (!isFullyLive) {
      headers.Warning =
        '110 - "ATMOS serving cached forecast while upstream recovers"';
    }

    return NextResponse.json(bundle, { headers });
  } catch (err) {
    console.error("Weather API error:", err);
    return NextResponse.json(
      { error: "Meteoroloji veri servisine şu an ulaşılamıyor." },
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
