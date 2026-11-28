import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveEffectiveFrameIndex } from "../context/WeatherContext";
import {
  resetGeocodeCacheForTests,
  resolveInitialServerLocation
} from "../lib/geocode-server";
import {
  ATMOS_LOCATION_COOKIE,
  buildLocationHref,
  parseLocationCookieValue,
  parseLocationFromSearchParams,
  serializeLocationCookieValue,
  serializeLocationSearchParams
} from "../lib/location-url";
import { extractStormSceneDrive } from "../lib/temporal-view";
import {
  BURSA_CURATED_LOCATIONS,
  BURSA_WMO_17116_ELEVATION_M,
  BURSA_WMO_17116_LAT,
  BURSA_WMO_17116_LON,
  DEFAULT_LOCATION,
  GLOBE_CITIES
} from "../lib/weather-client";
import type { GeoLocation, SceneAtmosphereInput } from "../lib/weather-types";
import { config as proxyConfig, proxy } from "../proxy";

const REPO_ROOT = path.resolve(__dirname, "..");

describe("Kabuk, Rota-Yalıtımlı Zaman, Kanonik URL/Çerez, Proxy ve Akustik Değişmezlikleri", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resetGeocodeCacheForTests();
  });

  it("1. Rota-Yalıtımlı Zaman Durumu (resolveEffectiveFrameIndex): '/' rotasında +80 korunurken diğer tüm rotalarda 0 döner, SSR null/undefined '/' kabul edilir", () => {
    expect(resolveEffectiveFrameIndex("/", 80)).toBe(80);
    expect(resolveEffectiveFrameIndex("/", 0)).toBe(0);
    expect(resolveEffectiveFrameIndex("/", 168)).toBe(168);
    expect(resolveEffectiveFrameIndex("/", 239)).toBe(239);

    for (const nonHomeRoute of ["/world", "/dashboard", "/lab", "/play"]) {
      expect(resolveEffectiveFrameIndex(nonHomeRoute, 80)).toBe(0);
      expect(resolveEffectiveFrameIndex(nonHomeRoute, 144)).toBe(0);
      expect(resolveEffectiveFrameIndex(nonHomeRoute, 1)).toBe(0);
    }

    // SSR / ilk hidrasyon anında pathname null veya undefined geldiğinde '/' kabul edilmelidir
    expect(resolveEffectiveFrameIndex(null, 80)).toBe(80);
    expect(resolveEffectiveFrameIndex(undefined, 80)).toBe(80);
    expect(resolveEffectiveFrameIndex(null, 0)).toBe(0);
    expect(resolveEffectiveFrameIndex(undefined, 0)).toBe(0);
  });

  it("2. serializeLocationSearchParams & buildLocationHref: /world, /lab, #kar-simsek hash ve mevcut diğer query parametrelerini kayıpsız korur", () => {
    const uludag = BURSA_CURATED_LOCATIONS.find((c) => c.id === "bursa-uludag-tr")!;
    expect(uludag).toBeDefined();
    expect(uludag.elevation).toBe(1850);

    // Eski konum anahtarları silinmeli, ancak konuma ait olmayan mevcut query parametreleri korunmalı
    const sp = serializeLocationSearchParams(
      uludag,
      "?view=skewt&model=ecmwf&name=EskiIsim&elevation=999&countryCode=XX&timezone=UTC"
    );
    expect(sp.get("view")).toBe("skewt");
    expect(sp.get("model")).toBe("ecmwf");
    expect(sp.get("name")).toBeNull();
    expect(sp.get("elevation")).toBeNull();
    expect(sp.get("countryCode")).toBeNull();
    expect(sp.get("timezone")).toBeNull();
    expect(sp.get("city")).toBe(uludag.name);
    expect(sp.get("lat")).toBe("40.1069");
    expect(sp.get("lon")).toBe("29.1292");
    expect(sp.get("elev")).toBe("1850");
    expect(sp.get("cc")).toBe("TR");
    expect(sp.get("tz")).toBe("Europe/Istanbul");

    // /world rotası + mevcut query korunumu
    const worldHref = buildLocationHref("/world", DEFAULT_LOCATION, {
      baseSearch: "?layer=both&zoom=7"
    });
    expect(worldHref.startsWith("/world?")).toBe(true);
    const worldUrl = new URL(worldHref, "https://atmos.local");
    expect(worldUrl.pathname).toBe("/world");
    expect(worldUrl.searchParams.get("layer")).toBe("both");
    expect(worldUrl.searchParams.get("zoom")).toBe("7");
    expect(worldUrl.searchParams.get("city")).toBe("Bursa");
    expect(worldUrl.searchParams.get("lat")).toBe(BURSA_WMO_17116_LAT.toFixed(4));
    expect(worldUrl.searchParams.get("lon")).toBe(BURSA_WMO_17116_LON.toFixed(4));
    expect(worldUrl.searchParams.get("elev")).toBe(String(BURSA_WMO_17116_ELEVATION_M));

    // /lab rotası + #kar-simsek hash korunumu (hem '#' ile hem '#' olmadan)
    const labHrefWithHash = buildLocationHref("/lab", uludag, {
      baseSearch: "?horizon=168&tab=ensemble",
      hash: "#kar-simsek"
    });
    const labUrl1 = new URL(labHrefWithHash, "https://atmos.local");
    expect(labUrl1.pathname).toBe("/lab");
    expect(labUrl1.hash).toBe("#kar-simsek");
    expect(labUrl1.searchParams.get("horizon")).toBe("168");
    expect(labUrl1.searchParams.get("tab")).toBe("ensemble");
    expect(labUrl1.searchParams.get("elev")).toBe("1850");

    const homeAnchorHref = buildLocationHref("/", DEFAULT_LOCATION, {
      hash: "kar-simsek"
    });
    expect(homeAnchorHref.endsWith("#kar-simsek")).toBe(true);
  });

  it("3. parseLocationFromSearchParams: kanonik coords, koordinatsız ?city=Tokyo city-only, eski Bursa (40.1885, 29.0610) -> WMO 17116 100 m dönüşümü ve Uludağ 1850 m rakım korunumu", () => {
    // 3a. Tam kanonik URL -> needsCanonicalRewrite === false
    const canonicalQs = serializeLocationSearchParams(DEFAULT_LOCATION);
    const parsedCanonical = parseLocationFromSearchParams(canonicalQs);
    expect(parsedCanonical.kind).toBe("coords");
    if (parsedCanonical.kind === "coords") {
      expect(parsedCanonical.needsCanonicalRewrite).toBe(false);
      expect(parsedCanonical.location.id).toBe("bursa-tr");
      expect(parsedCanonical.location.lat).toBeCloseTo(BURSA_WMO_17116_LAT, 4);
      expect(parsedCanonical.location.lon).toBeCloseTo(BURSA_WMO_17116_LON, 4);
      expect(parsedCanonical.location.elevation).toBe(100);
    }

    // 3b. Koordinatsız ?city=Tokyo sorgusu -> city-only
    const parsedCityOnly = parseLocationFromSearchParams("?city=Tokyo");
    expect(parsedCityOnly).toEqual({
      kind: "city-only",
      cityQuery: "Tokyo"
    });

    const parsedCityWithHint = parseLocationFromSearchParams("?city=Tokyo&cc=JP");
    expect(parsedCityWithHint).toEqual({
      kind: "city-only",
      cityQuery: "Tokyo",
      countryHint: "JP"
    });

    // Boş veya 1 harfli sorguda 'none' dönmeli
    expect(parseLocationFromSearchParams("")).toEqual({ kind: "none" });
    expect(parseLocationFromSearchParams("?city=A")).toEqual({ kind: "none" });

    // 3c. Eski Bursa linki (?lat=40.1885&lon=29.0610&city=Bursa ve legacy ?lat=40.1885&lon=29.0610&name=Bursa&elevation=155)
    const legacyBursa1 = parseLocationFromSearchParams(
      "?city=Bursa&lat=40.1885&lon=29.0610"
    );
    expect(legacyBursa1.kind).toBe("coords");
    if (legacyBursa1.kind === "coords") {
      expect(legacyBursa1.needsCanonicalRewrite).toBe(true);
      expect(legacyBursa1.location.id).toBe("bursa-tr");
      expect(legacyBursa1.location.lat).toBe(BURSA_WMO_17116_LAT);
      expect(legacyBursa1.location.lon).toBe(BURSA_WMO_17116_LON);
      expect(legacyBursa1.location.elevation).toBe(BURSA_WMO_17116_ELEVATION_M);
      expect(legacyBursa1.location.elevation).toBe(100);
      expect(legacyBursa1.location.admin1).toContain("WMO 17116");
    }

    const legacyBursa2 = parseLocationFromSearchParams(
      "?name=Bursa&lat=40.1885&lon=29.0610&elevation=155&countryCode=TR&timezone=Europe/Istanbul"
    );
    expect(legacyBursa2.kind).toBe("coords");
    if (legacyBursa2.kind === "coords") {
      expect(legacyBursa2.needsCanonicalRewrite).toBe(true);
      expect(legacyBursa2.location.lat).toBe(40.2308);
      expect(legacyBursa2.location.lon).toBe(29.0133);
      expect(legacyBursa2.location.elevation).toBe(100);
    }

    // 3d. Uludağ 1850 m rakım korunumu (asla 100 m ova istasyonuna ezilmez!)
    const uludag = BURSA_CURATED_LOCATIONS.find((c) => c.id === "bursa-uludag-tr")!;
    const uludagQs = serializeLocationSearchParams(uludag);
    const parsedUludag = parseLocationFromSearchParams(uludagQs);
    expect(parsedUludag.kind).toBe("coords");
    if (parsedUludag.kind === "coords") {
      expect(parsedUludag.needsCanonicalRewrite).toBe(false);
      expect(parsedUludag.location.id).toBe("bursa-uludag-tr");
      expect(parsedUludag.location.elevation).toBe(1850);
      expect(parsedUludag.location.lat).toBeCloseTo(40.1069, 4);
      expect(parsedUludag.location.lon).toBeCloseTo(29.1292, 4);
    }
  });

  it("4. serializeLocationCookieValue <-> parseLocationCookieValue gidiş-dönüş (round-trip) eşitliği ve geçersiz çerez kalkanı", () => {
    const uludag = BURSA_CURATED_LOCATIONS.find((c) => c.id === "bursa-uludag-tr")!;
    const tokyo = GLOBE_CITIES.find((c) => c.id === "tokyo-jp")!;
    const customMountain: GeoLocation = {
      id: "chamonix-fr",
      name: "Chamonix-Mont-Blanc",
      admin1: "Auvergne-Rhône-Alpes",
      country: "Fransa",
      countryCode: "FR",
      lat: 45.9237,
      lon: 6.8694,
      elevation: 1035,
      timezone: "Europe/Paris"
    };

    for (const sample of [DEFAULT_LOCATION, uludag, tokyo, customMountain]) {
      const encoded = serializeLocationCookieValue(sample);
      expect(encoded.length).toBeGreaterThan(10);

      // Doğrudan değer çözümleme
      const directParsed = parseLocationCookieValue(encoded);
      expect(directParsed).not.toBeNull();
      expect(directParsed!.id).toBe(sample.id);
      expect(directParsed!.name).toBe(sample.name);
      expect(directParsed!.lat).toBeCloseTo(sample.lat, 4);
      expect(directParsed!.lon).toBeCloseTo(sample.lon, 4);
      expect(directParsed!.elevation).toBe(sample.elevation);
      expect(directParsed!.countryCode).toBe(sample.countryCode);
      expect(directParsed!.timezone).toBe(sample.timezone);

      // Çoklu HTTP Cookie başlığı içinden çözümleme
      const headerCookie = `theme=dark; ${ATMOS_LOCATION_COOKIE}=${encoded}; session_id=xyz987`;
      const headerParsed = parseLocationCookieValue(headerCookie);
      expect(headerParsed).toEqual(directParsed);
    }

    // Bozuk JSON veya sınır dışı koordinatlar güvenle reddedilmeli
    expect(parseLocationCookieValue(null)).toBeNull();
    expect(parseLocationCookieValue("")).toBeNull();
    expect(parseLocationCookieValue("not-json-at-all")).toBeNull();
    expect(
      parseLocationCookieValue(
        encodeURIComponent(JSON.stringify({ name: "OutOfBounds", lat: 94.2, lon: 29.0 }))
      )
    ).toBeNull();
    expect(
      parseLocationCookieValue(
        encodeURIComponent(JSON.stringify({ name: "", lat: 40.2, lon: 29.0 }))
      )
    ).toBeNull();
  });

  it("5. Next.js 16 proxy.ts: İstemcinin enjekte ettiği sahte x-atmos-search ve x-atmos-pathname başlıklarını ezip gerçek URL bilgisini yazar", () => {
    const spoofedRequest = new NextRequest(
      "https://atmos.example.com/world?city=Tokyo&cc=JP",
      {
        headers: {
          "x-atmos-search": "city=SpoofedAtlantis&lat=0.0000&lon=0.0000",
          "x-atmos-pathname": "/spoofed-internal",
          "x-custom-client": "keep-me"
        }
      }
    );

    const response = proxy(spoofedRequest);
    expect(response.headers.get("x-middleware-request-x-atmos-pathname")).toBe("/world");
    expect(response.headers.get("x-middleware-request-x-atmos-search")).toBe(
      "city=Tokyo&cc=JP"
    );
    expect(response.headers.get("x-middleware-request-x-custom-client")).toBe("keep-me");

    // Sorgu parametresi olmayan rotada da istemcinin sahte x-atmos-search başlığı tamamen sıfırlanmalıdır
    const cleanRouteWithSpoof = new NextRequest("https://atmos.example.com/dashboard", {
      headers: {
        "X-Atmos-Search": "city=FakeCity&lat=12.3456&lon=65.4321"
      }
    });
    const cleanResponse = proxy(cleanRouteWithSpoof);
    expect(cleanResponse.headers.get("x-middleware-request-x-atmos-pathname")).toBe(
      "/dashboard"
    );
    expect(cleanResponse.headers.get("x-middleware-request-x-atmos-search")).toBe("");
    expect(Array.isArray(proxyConfig.matcher)).toBe(true);
    expect(proxyConfig.matcher.length).toBeGreaterThan(0);
  });

  it("6. SSR Konum Önceliği (resolveInitialServerLocation): URL > atmos_loc Çerezi > DEFAULT_LOCATION sırasını ve ?city=Tokyo çözümlemesini garanti eder", async () => {
    const london = GLOBE_CITIES.find((c) => c.id === "london-gb")!;
    const newYork = GLOBE_CITIES.find((c) => c.id === "newyork-us")!;
    const londonCookie = serializeLocationCookieValue(london);

    // 6a. URL (coords) vs Çerez -> URL kesin önceliklidir (fromUrl === true)
    const nySearch = serializeLocationSearchParams(newYork).toString();
    const resUrlOverCookie = await resolveInitialServerLocation({
      searchStr: nySearch,
      cookieVal: londonCookie
    });
    expect(resUrlOverCookie.fromUrl).toBe(true);
    expect(resUrlOverCookie.location.id).toBe("newyork-us");
    expect(resUrlOverCookie.location.lat).toBeCloseTo(40.7128, 3);
    expect(resUrlOverCookie.location.lon).toBeCloseTo(-74.006, 3);

    // 6b. Koordinatsız ?city=Tokyo sorgusu (ağ kesintisinde GLOBE_CITIES üzerinden ve canlı geocode yanıtıyla)
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Simulated offline"));
    resetGeocodeCacheForTests();
    const resTokyoOffline = await resolveInitialServerLocation({
      searchStr: "city=Tokyo",
      cookieVal: londonCookie
    });
    expect(resTokyoOffline.fromUrl).toBe(true);
    expect(resTokyoOffline.location.id).toBe("tokyo-jp");
    expect(resTokyoOffline.location.countryCode).toBe("JP");
    expect(resTokyoOffline.location.timezone).toBe("Asia/Tokyo");
    expect(resTokyoOffline.location.lat).toBeCloseTo(35.6762, 3);
    expect(resTokyoOffline.location.lon).toBeCloseTo(139.6503, 3);

    resetGeocodeCacheForTests();
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 1850147,
              name: "Tokyo",
              admin1: "Tokyo",
              country: "Japonya",
              country_code: "JP",
              latitude: 35.6895,
              longitude: 139.6917,
              elevation: 44,
              timezone: "Asia/Tokyo"
            }
          ]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );
    const resTokyoLive = await resolveInitialServerLocation({
      searchStr: "?city=Tokyo",
      cookieVal: londonCookie
    });
    expect(resTokyoLive.fromUrl).toBe(true);
    expect(resTokyoLive.location.name).toContain("Tokyo");
    expect(resTokyoLive.location.countryCode).toBe("JP");
    expect(resTokyoLive.location.timezone).toBe("Asia/Tokyo");
    expect(resTokyoLive.location.lat).toBeGreaterThan(35.5);
    expect(resTokyoLive.location.lat).toBeLessThan(35.8);
    expect(resTokyoLive.location.lon).toBeGreaterThan(139.5);
    expect(resTokyoLive.location.lon).toBeLessThan(139.8);

    // 6c. URL boşken geçerli atmos_loc çerezi seçilir (fromUrl === false)
    const resCookieOnly = await resolveInitialServerLocation({
      searchStr: "",
      cookieVal: londonCookie
    });
    expect(resCookieOnly.fromUrl).toBe(false);
    expect(resCookieOnly.location.id).toBe("london-gb");
    expect(resCookieOnly.location.timezone).toBe("Europe/London");

    // 6d. URL boş ve çerez yok/geçersizken DEFAULT_LOCATION (Bursa WMO 17116, 100 m) döner
    const resFallback = await resolveInitialServerLocation({
      searchStr: null,
      cookieVal: null
    });
    expect(resFallback.fromUrl).toBe(false);
    expect(resFallback.location.id).toBe("bursa-tr");
    expect(resFallback.location.lat).toBe(BURSA_WMO_17116_LAT);
    expect(resFallback.location.lon).toBe(BURSA_WMO_17116_LON);
    expect(resFallback.location.elevation).toBe(100);
  });

  it("7. extractStormSceneDrive Kuru Lodos Şimşek Kalkanı ve AtmosphereAudio.tsx Akustik Sözleşmesi (canFlashLightning & 760 Hz kar bandı)", () => {
    const dryLodosStorm: SceneAtmosphereInput = {
      windSpeed: 65,
      windDirection: 215,
      cloudCover: 78,
      visibilityKm: 12,
      airQualityIndex: 2,
      isStorm: true,
      precipType: "none",
      precipIntensity: 0,
      precipitationMmHr: 0,
      rainAccum: 0,
      snowAccum: 0,
      lightningProbPct: 0,
      lightningFlashRatePerMin: 0,
      isThundersnow: false,
      solarElevationDeg: 14,
      daylight: 0.5,
      cape: 1150
    };

    const driveDryLodos = extractStormSceneDrive(dryLodosStorm);
    expect(driveDryLodos.canFlashLightning).toBe(false);
    expect(driveDryLodos.flashFrequencyHz).toBe(0);
    expect(driveDryLodos.isWet).toBe(false);
    expect(driveDryLodos.effectivePrecipType).toBe("none");
    expect(driveDryLodos.effectivePrecipIntensity).toBe(0);
    expect(driveDryLodos.precipParticleCount).toBe(0);
    expect(driveDryLodos.hasGaleWindStreaks).toBe(true);

    // Gerçek konvektif orajda şimşek ve yağış sürücüleri aktifleşmelidir
    const wetConvectiveStorm: SceneAtmosphereInput = {
      ...dryLodosStorm,
      precipType: "rain",
      precipIntensity: 0.72,
      precipitationMmHr: 9.5,
      lightningProbPct: 68,
      lightningFlashRatePerMin: 3.2
    };
    const driveWetStorm = extractStormSceneDrive(wetConvectiveStorm);
    expect(driveWetStorm.canFlashLightning).toBe(true);
    expect(driveWetStorm.isWet).toBe(true);
    expect(driveWetStorm.effectivePrecipType).toBe("rain");
    expect(driveWetStorm.flashFrequencyHz).toBeGreaterThan(0.14);

    // AtmosphereAudio.tsx statik akustik sözleşmesi
    const audioSrc = fs.readFileSync(
      path.join(REPO_ROOT, "components/AtmosphereAudio.tsx"),
      "utf-8"
    );
    expect(audioSrc).toContain("extractStormSceneDrive(atmosphere)");
    expect(audioSrc).toContain("!sceneDrive.canFlashLightning");
    expect(audioSrc).toContain('sceneDrive.effectivePrecipType === "snow"');
    expect(audioSrc).toContain("linearRampToValueAtTime(760,");
    expect(audioSrc).toContain("linearRampToValueAtTime(1800,");
  });

  it("8. AppShell.tsx: '/play' rotasında ortam sesini askıya alır, tüm sekmelerde buildLocationHref kullanır ve 0 useWeather() içerir", () => {
    const shellSrc = fs.readFileSync(
      path.join(REPO_ROOT, "components/AppShell.tsx"),
      "utf-8"
    );

    expect(shellSrc).toContain('const suspendAmbientAudio = pathname === "/play"');
    expect(shellSrc).toContain("suspendAmbientAudio={suspendAmbientAudio}");
    expect(shellSrc).toContain("suspended={suspendAmbientAudio}");
    expect(shellSrc).toContain("buildLocationHref(");
    expect(shellSrc).toContain('buildLocationHref("/", activeLocation)');
    expect(shellSrc).toContain("buildLocationHref(href, activeLocation)");

    // Birleşik useWeather() aboneliği 0 olmalı; yalnızca ayrık useWeatherData / useWeatherScrub kullanılmalı
    const monolithicMatches = shellSrc.match(/\buseWeather\s*\(/g) ?? [];
    expect(monolithicMatches.length).toBe(0);
    expect(shellSrc).toContain("useWeatherData()");
    expect(shellSrc).toContain("useWeatherScrub()");
  });
});
