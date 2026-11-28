import { ATMOS_STORAGE_KEYS, canonicalizeStationIdentity } from "./weather-client";
import type { GeoLocation } from "./weather-types";

export const ATMOS_LOCATION_COOKIE = "atmos_loc" as const;

export type SearchParamsLike =
  | URLSearchParams
  | {
      get(name: string): string | null;
      has?(name: string): boolean;
      toString?(): string;
    }
  | string
  | null
  | undefined;

export type ParsedUrlLocation =
  | {
      kind: "coords";
      location: GeoLocation;
      needsCanonicalRewrite: boolean;
    }
  | {
      kind: "city-only";
      cityQuery: string;
      countryHint?: string;
    }
  | {
      kind: "none";
    };

const ALL_LOCATION_PARAM_KEYS = [
  "city",
  "name",
  "lat",
  "lon",
  "country",
  "cc",
  "countryCode",
  "admin1",
  "elev",
  "elevation",
  "tz",
  "timezone"
] as const;

const CANONICAL_LOCATION_PARAM_KEYS = [
  "city",
  "lat",
  "lon",
  "country",
  "cc",
  "admin1",
  "elev",
  "tz"
] as const;

const LEGACY_LOCATION_PARAM_KEYS = [
  "name",
  "elevation",
  "countryCode",
  "timezone"
] as const;

function toURLSearchParams(input?: SearchParamsLike): URLSearchParams {
  if (!input) return new URLSearchParams();
  if (input instanceof URLSearchParams) {
    return new URLSearchParams(input.toString());
  }
  if (typeof input === "string") {
    return new URLSearchParams(input.startsWith("?") ? input.slice(1) : input);
  }
  if (typeof input.toString === "function" && input.toString !== Object.prototype.toString) {
    const str = input.toString();
    return new URLSearchParams(str.startsWith("?") ? str.slice(1) : str);
  }
  const out = new URLSearchParams();
  for (const key of ALL_LOCATION_PARAM_KEYS) {
    const val = input.get(key);
    if (val !== null) out.set(key, val);
  }
  return out;
}

export function serializeLocationSearchParams(
  loc: GeoLocation,
  baseSearch?: string | URLSearchParams
): URLSearchParams {
  const c = canonicalizeStationIdentity(loc);
  const next = toURLSearchParams(baseSearch);

  for (const key of ALL_LOCATION_PARAM_KEYS) {
    next.delete(key);
  }

  next.set("city", c.name || `${c.lat.toFixed(2)}°, ${c.lon.toFixed(2)}°`);
  next.set("lat", c.lat.toFixed(4));
  next.set("lon", c.lon.toFixed(4));
  if (c.country) {
    next.set("country", c.country);
  }
  if (c.countryCode) {
    next.set("cc", c.countryCode);
  }
  if (c.admin1) {
    next.set("admin1", c.admin1);
  }
  if (typeof c.elevation === "number" && Number.isFinite(c.elevation)) {
    next.set("elev", String(Math.round(c.elevation)));
  }
  if (c.timezone) {
    next.set("tz", c.timezone);
  }

  return next;
}

export function buildLocationHref(
  pathname: string,
  loc: GeoLocation,
  opts?: { hash?: string; baseSearch?: string | URLSearchParams }
): string {
  const cleanPath = pathname
    ? pathname.startsWith("/")
      ? pathname
      : `/${pathname}`
    : "/";
  const qs = serializeLocationSearchParams(loc, opts?.baseSearch).toString();
  const rawHash = opts?.hash ? opts.hash.trim() : "";
  const hashSuffix = rawHash
    ? rawHash.startsWith("#")
      ? rawHash
      : `#${rawHash}`
    : "";
  return `${cleanPath}${qs ? `?${qs}` : ""}${hashSuffix}`;
}

export function parseLocationFromSearchParams(
  params: SearchParamsLike
): ParsedUrlLocation {
  const sp = toURLSearchParams(params);
  const latRaw = sp.get("lat")?.trim();
  const lonRaw = sp.get("lon")?.trim();

  if (
    latRaw !== undefined &&
    latRaw !== "" &&
    lonRaw !== undefined &&
    lonRaw !== ""
  ) {
    const lat = Number(latRaw);
    const lon = Number(lonRaw);
    if (
      Number.isFinite(lat) &&
      Number.isFinite(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    ) {
      const cityRaw = (sp.get("city") ?? sp.get("name") ?? "").trim();
      const elevRaw = (sp.get("elev") ?? sp.get("elevation") ?? "").trim();
      const parsedElev =
        elevRaw !== "" && Number.isFinite(Number(elevRaw))
          ? Math.round(Number(elevRaw))
          : undefined;
      const ccRaw = (sp.get("cc") ?? sp.get("countryCode") ?? "").trim();
      const tzRaw = (sp.get("tz") ?? sp.get("timezone") ?? "").trim();
      const admin1Raw = (sp.get("admin1") ?? "").trim();
      const countryRaw = (sp.get("country") ?? "").trim();

      const rawLoc: GeoLocation = {
        id: `${lat.toFixed(4)}_${lon.toFixed(4)}`,
        name: cityRaw || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
        admin1: admin1Raw || undefined,
        country: countryRaw,
        countryCode: ccRaw ? ccRaw.toUpperCase() : undefined,
        lat,
        lon,
        elevation: parsedElev,
        timezone: tzRaw || undefined
      };

      const location = canonicalizeStationIdentity(rawLoc);
      const canonicalSp = serializeLocationSearchParams(location);

      const hasLegacyKeys = LEGACY_LOCATION_PARAM_KEYS.some(
        (key) => sp.get(key) !== null
      );
      const hasCanonicalDiff = CANONICAL_LOCATION_PARAM_KEYS.some(
        (key) => (sp.get(key) ?? null) !== (canonicalSp.get(key) ?? null)
      );

      return {
        kind: "coords",
        location,
        needsCanonicalRewrite: hasLegacyKeys || hasCanonicalDiff
      };
    }
  }

  const cityOnlyRaw = (sp.get("city") ?? sp.get("name") ?? "").trim();
  if (cityOnlyRaw.length >= 2) {
    const hintRaw = (
      sp.get("cc") ??
      sp.get("countryCode") ??
      sp.get("country") ??
      ""
    ).trim();
    return {
      kind: "city-only",
      cityQuery: cityOnlyRaw,
      ...(hintRaw ? { countryHint: hintRaw } : {})
    };
  }

  return { kind: "none" };
}

export function serializeLocationCookieValue(loc: GeoLocation): string {
  const c = canonicalizeStationIdentity(loc);
  const compact: GeoLocation = {
    id: c.id,
    name: c.name,
    ...(c.admin1 ? { admin1: c.admin1 } : {}),
    country: c.country ?? "",
    ...(c.countryCode ? { countryCode: c.countryCode } : {}),
    lat: Number(c.lat.toFixed(4)),
    lon: Number(c.lon.toFixed(4)),
    ...(typeof c.elevation === "number" && Number.isFinite(c.elevation)
      ? { elevation: Math.round(c.elevation) }
      : {}),
    ...(c.timezone ? { timezone: c.timezone } : {})
  };
  return encodeURIComponent(JSON.stringify(compact));
}

function extractCookieToken(rawCookie: string): string {
  const trimmed = rawCookie.trim();
  const prefix = `${ATMOS_LOCATION_COOKIE}=`;
  if (trimmed.includes(prefix)) {
    const parts = trimmed.split(";");
    for (const part of parts) {
      const p = part.trim();
      if (p.startsWith(prefix)) {
        return p.slice(prefix.length).trim();
      }
    }
  }
  return trimmed;
}

export function parseLocationCookieValue(
  rawCookie?: string | null
): GeoLocation | null {
  if (!rawCookie || typeof rawCookie !== "string") return null;
  const token = extractCookieToken(rawCookie);
  if (!token) return null;

  let decoded = token;
  try {
    decoded = decodeURIComponent(token);
  } catch {
    decoded = token;
  }

  try {
    const parsed = JSON.parse(decoded) as Partial<GeoLocation> | null;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.lat !== "number" ||
      !Number.isFinite(parsed.lat) ||
      parsed.lat < -90 ||
      parsed.lat > 90 ||
      typeof parsed.lon !== "number" ||
      !Number.isFinite(parsed.lon) ||
      parsed.lon < -180 ||
      parsed.lon > 180 ||
      typeof parsed.name !== "string" ||
      parsed.name.trim().length === 0
    ) {
      return null;
    }

    const elev =
      typeof parsed.elevation === "number" && Number.isFinite(parsed.elevation)
        ? Math.round(parsed.elevation)
        : undefined;

    return canonicalizeStationIdentity({
      id:
        typeof parsed.id === "string" && parsed.id.trim()
          ? parsed.id.trim()
          : `${parsed.lat.toFixed(4)}_${parsed.lon.toFixed(4)}`,
      name: parsed.name.trim(),
      admin1:
        typeof parsed.admin1 === "string" && parsed.admin1.trim()
          ? parsed.admin1.trim()
          : undefined,
      country: typeof parsed.country === "string" ? parsed.country.trim() : "",
      countryCode:
        typeof parsed.countryCode === "string" && parsed.countryCode.trim()
          ? parsed.countryCode.trim().toUpperCase()
          : undefined,
      lat: parsed.lat,
      lon: parsed.lon,
      elevation: elev,
      timezone:
        typeof parsed.timezone === "string" && parsed.timezone.trim()
          ? parsed.timezone.trim()
          : undefined
    });
  } catch {
    return null;
  }
}

export function syncLocationToBrowserUrlAndCookie(loc: GeoLocation): void {
  const canonical = canonicalizeStationIdentity(loc);
  if (typeof window === "undefined") return;

  try {
    const nextHref = buildLocationHref(window.location.pathname, canonical, {
      baseSearch: window.location.search,
      hash: window.location.hash
    });
    window.history.replaceState(window.history.state, "", nextHref);
  } catch {
    // ignore History API restrictions
  }

  try {
    if (typeof document !== "undefined") {
      const encoded = serializeLocationCookieValue(canonical);
      const maxAgeSec = 365 * 24 * 60 * 60;
      document.cookie = `${ATMOS_LOCATION_COOKIE}=${encoded}; path=/; max-age=${maxAgeSec}; SameSite=Lax`;
    }
  } catch {
    // ignore cookie restrictions
  }

  try {
    window.localStorage?.setItem(
      ATMOS_STORAGE_KEYS.location,
      JSON.stringify(canonical)
    );
  } catch {
    // ignore storage quota/privacy errors
  }
}
