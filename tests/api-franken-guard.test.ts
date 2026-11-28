import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const mockedRequestState = {
  searchStr: null as string | null,
  cookieVal: null as string | null
};

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter", className: "font-inter" }),
  Space_Grotesk: () => ({
    variable: "--font-space-grotesk",
    className: "font-space-grotesk"
  }),
  JetBrains_Mono: () => ({
    variable: "--font-jetbrains-mono",
    className: "font-jetbrains-mono"
  })
}));

vi.mock("../app/globals.css", () => ({}));

vi.mock("next/headers", () => ({
  headers: async () => ({
    get: (key: string) =>
      key.toLowerCase() === "x-atmos-search" ? mockedRequestState.searchStr : null
  }),
  cookies: async () => ({
    get: (key: string) =>
      key === "atmos_loc" && mockedRequestState.cookieVal !== null
        ? { value: mockedRequestState.cookieVal }
        : undefined
  })
}));

import { GET as getModelsRoute } from "../app/api/models/route";
import { GET as getWeatherRoute } from "../app/api/weather/route";
import { generateMetadata } from "../app/layout";
import {
  resetGeocodeCacheForTests,
  resolveGeocodeQuery,
  resolveInitialServerLocation
} from "../lib/geocode-server";
import {
  BURSA_WMO_17116_ELEVATION_M,
  BURSA_WMO_17116_LAT,
  BURSA_WMO_17116_LON
} from "../lib/weather-client";

describe("Wave 2 — ARC-07: API Franken-Koordinat 400 Güvenlik Duvarı, 1.102 Ulusal Geocode ve Dinamik SEO", () => {
  afterEach(() => {
    mockedRequestState.searchStr = null;
    mockedRequestState.cookieVal = null;
    vi.restoreAllMocks();
    resetGeocodeCacheForTests();
  });

  it("1. Franken-Koordinat Yasağı: /api/weather?lat=41.0082 (eksik lon) ve /api/models?lon=32.8597 (eksik lat) derhal 400 + Cache-Control: no-store döner", async () => {
    const weatherMissingLon = await getWeatherRoute(
      new NextRequest("https://atmos.local/api/weather?lat=41.0082")
    );
    expect(weatherMissingLon.status).toBe(400);
    expect(weatherMissingLon.headers.get("cache-control")).toContain("no-store");
    const weatherBody1 = await weatherMissingLon.json();
    expect(weatherBody1.error).toContain("lat ve lon birlikte");

    const weatherEmptyLat = await getWeatherRoute(
      new NextRequest("https://atmos.local/api/weather?lat=&lon=29.0133")
    );
    expect(weatherEmptyLat.status).toBe(400);
    expect(weatherEmptyLat.headers.get("cache-control")).toContain("no-store");

    const modelsMissingLat = await getModelsRoute(
      new NextRequest("https://atmos.local/api/models?lon=32.8597")
    );
    expect(modelsMissingLat.status).toBe(400);
    expect(modelsMissingLat.headers.get("cache-control")).toContain("no-store");
    const modelsBody1 = await modelsMissingLat.json();
    expect(modelsBody1.error).toContain("lat ve lon birlikte");

    const modelsEmptyLon = await getModelsRoute(
      new NextRequest("https://atmos.local/api/models?lat=39.9334&lon=%20")
    );
    expect(modelsEmptyLon.status).toBe(400);
    expect(modelsEmptyLon.headers.get("cache-control")).toContain("no-store");
  });

  it("2. Çapraz-İl pc Enjeksiyon Yasağı: Bursa koordinatına ?pc=TR-34 veya Gebze koordinatına ?pc=TR-34 verilmesi 400 + no-store ile reddedilir", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    // Bursa WMO 17116 koordinatına İstanbul plakası (TR-34) enjeksiyonu
    const bursaWithIstanbulPc = await getWeatherRoute(
      new NextRequest(
        "https://atmos.local/api/weather?lat=40.2308&lon=29.0133&pc=TR-34"
      )
    );
    expect(bursaWithIstanbulPc.status).toBe(400);
    expect(bursaWithIstanbulPc.headers.get("cache-control")).toContain("no-store");
    const body1 = await bursaWithIstanbulPc.json();
    expect(body1.error).toContain("TR-34");
    expect(body1.error).toContain("TR-16");

    // Gebze (TR-41 Kocaeli) koordinatına İstanbul plakası (TR-34) enjeksiyonu (/api/models)
    const gebzeWithIstanbulPc = await getModelsRoute(
      new NextRequest(
        "https://atmos.local/api/models?lat=40.8028&lon=29.4307&pc=TR-34"
      )
    );
    expect(gebzeWithIstanbulPc.status).toBe(400);
    expect(gebzeWithIstanbulPc.headers.get("cache-control")).toContain("no-store");

    // Geçersiz plaka kodu (?pc=TR-99) reddedilir
    const invalidPlate = await getWeatherRoute(
      new NextRequest(
        "https://atmos.local/api/weather?lat=39.9334&lon=32.8597&pc=TR-99"
      )
    );
    expect(invalidPlate.status).toBe(400);
    expect(invalidPlate.headers.get("cache-control")).toContain("no-store");

    // Hiçbir yukarı akış ağ isteği yapılmadan güvenlik duvarında kesilmiş olmalı
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("3. Geriye Dönük Uyumluluk: Parametresiz /api/weather ve /api/models çağrıları DEFAULT_LOCATION (TR-16 Bursa) ve X-Atmos-Province / Vary başlıklarıyla çalışır", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Simulated upstream offline")
    );

    const weatherDefaultRes = await getWeatherRoute(
      new NextRequest("https://atmos.local/api/weather")
    );
    expect(weatherDefaultRes.status).not.toBe(400);
    expect(weatherDefaultRes.headers.get("x-atmos-province")).toBe("TR-16");
    expect(weatherDefaultRes.headers.get("vary")).toBe("Accept-Encoding");

    const modelsRizeValidPc = await getModelsRoute(
      new NextRequest(
        "https://atmos.local/api/models?lat=41.0201&lon=40.5234&pc=TR-53"
      )
    );
    expect(modelsRizeValidPc.status).not.toBe(400);
    expect(modelsRizeValidPc.headers.get("x-atmos-province")).toBe("TR-53");
    expect(modelsRizeValidPc.headers.get("vary")).toBe("Accept-Encoding");
  });

  it("4. 1.102 Ulusal Geocode Çevrimdışı Çözümleme: Konya Ereğli, Zonguldak Ereğli, 67 Ereğli, Kartepe Zirve, Palandöken, İskenderun ve city=Erzurum doğru plaka ve DEM rakımıyla çözülür", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Open-Meteo Geocoding Offline")
    );

    const konyaEregli = await resolveGeocodeQuery("Konya Ereğli");
    expect(konyaEregli.length).toBeGreaterThan(0);
    expect(konyaEregli[0].provinceCode).toBe("TR-42");
    expect(konyaEregli[0].name).toBe("Ereğli");
    expect(konyaEregli[0].elevation).toBeGreaterThan(950);
    expect(konyaEregli[0].countryCode).toBe("TR");
    expect(konyaEregli[0].timezone).toBe("Europe/Istanbul");

    const zonguldakEregli = await resolveGeocodeQuery("Zonguldak Ereğli");
    expect(zonguldakEregli.length).toBeGreaterThan(0);
    expect(zonguldakEregli[0].provinceCode).toBe("TR-67");
    expect(zonguldakEregli[0].name).toBe("Ereğli");
    expect(zonguldakEregli[0].elevation).toBeLessThan(150);

    const plate67Eregli = await resolveGeocodeQuery("67 Ereğli");
    expect(plate67Eregli[0]?.provinceCode).toBe("TR-67");

    const kartepeZirve = await resolveGeocodeQuery("Kartepe Zirve");
    expect(kartepeZirve.length).toBeGreaterThan(0);
    expect(kartepeZirve[0].provinceCode).toBe("TR-41");
    expect(kartepeZirve[0].elevation).toBeGreaterThanOrEqual(1250);

    const palandoken = await resolveGeocodeQuery("Palandöken");
    expect(palandoken.length).toBeGreaterThan(0);
    expect(palandoken[0].provinceCode).toBe("TR-25");
    expect(palandoken.some((p) => (p.elevation ?? 0) >= 2400)).toBe(true);

    const rizeCamlihemsin = await resolveGeocodeQuery("Rize Çamlıhemşin");
    expect(rizeCamlihemsin[0]?.provinceCode).toBe("TR-53");
    expect(rizeCamlihemsin[0]?.elevation).toBeGreaterThanOrEqual(300);

    const iskenderun = await resolveGeocodeQuery("İskenderun");
    expect(iskenderun[0]?.provinceCode).toBe("TR-31");
    expect(iskenderun[0]?.countryCode).toBe("TR");

    // SSR city=Erzurum çevrimdışı çözümleme
    const erzurumInitial = await resolveInitialServerLocation({
      searchStr: "city=Erzurum"
    });
    expect(erzurumInitial.fromUrl).toBe(true);
    expect(erzurumInitial.location.provinceCode).toBe("TR-25");
    expect(erzurumInitial.location.name).toBe("Erzurum");
    expect(erzurumInitial.location.elevation).toBeGreaterThanOrEqual(1800);

    // Yabancı ülke ipucu (countryHint="JP") verildiğinde Türkiye kataloğu atlanır
    const tokyoJp = await resolveGeocodeQuery("Tokyo", "JP");
    expect(tokyoJp[0]?.id).toBe("tokyo-jp");
    expect(tokyoJp[0]?.provinceCode).toBe("GLOBAL");

    // Bursa sorgusunda dondurulmuş BURSA_CURATED_LOCATIONS kimlikleri birebir korunur
    const bursaResults = await resolveGeocodeQuery("Bursa");
    expect(bursaResults[0]?.id).toBe("bursa-tr");
    expect(bursaResults[0]?.lat).toBe(BURSA_WMO_17116_LAT);
    expect(bursaResults[0]?.lon).toBe(BURSA_WMO_17116_LON);
    expect(bursaResults[0]?.elevation).toBe(BURSA_WMO_17116_ELEVATION_M);
    expect(bursaResults[0]?.provinceCode).toBe("TR-16");
  });

  it("5. Dinamik SEO Üst Verisi (generateMetadata): TR-16 Bursa başlığını birebir korurken Ankara, Rize Çamlıhemşin ve Tokyo linklerinde sıfır Bursa sızıntısı üretir", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Offline metadata check")
    );

    // Varsayılan (Bursa TR-16)
    mockedRequestState.searchStr = null;
    const bursaMeta = await generateMetadata();
    expect(bursaMeta.title).toBe(
      "ATMOS v5.0 — Sıfır-Sapma Hibrit Meteoroloji, 19-İlçe MGM & Radar"
    );
    expect(String(bursaMeta.description)).toContain("Bursa 19-ilçe MGM");

    // Ankara (TR-06)
    mockedRequestState.searchStr = "city=Ankara";
    const ankaraMeta = await generateMetadata();
    expect(ankaraMeta.title).toBe(
      "ATMOS v5.0 — Ankara (Türkiye) Hibrit Meteoroloji, MGM & Radar"
    );
    expect(String(ankaraMeta.title)).not.toContain("Bursa");
    expect(String(ankaraMeta.description)).not.toContain("Bursa");

    // Rize Çamlıhemşin (TR-53 ilçe)
    mockedRequestState.searchStr = "city=Rize+%C3%87aml%C4%B1hem%C5%9Fin";
    const rizeMeta = await generateMetadata();
    expect(rizeMeta.title).toBe(
      "ATMOS v5.0 — Çamlıhemşin (Rize) Hibrit Meteoroloji, MGM & Radar"
    );
    expect(String(rizeMeta.description)).not.toContain("Bursa");

    // Tokyo (GLOBAL)
    mockedRequestState.searchStr = "city=Tokyo";
    const tokyoMeta = await generateMetadata();
    expect(tokyoMeta.title).toBe(
      "ATMOS v5.0 — Tokyo (Japonya) Hibrit Meteoroloji, MGM & Radar"
    );
    expect(String(tokyoMeta.description)).not.toContain("Bursa");
  });
});
