import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn()
  }),
  usePathname: () => "/dashboard"
}));

import CitySearch from "../components/CitySearch";
import CommandPalette from "../components/CommandPalette";
import {
  evaluateRule,
  getSmartDefaultThreshold,
  normalizeName,
  resolveBundleForAlertRule,
  toDisplayRuleThreshold,
  toMetricThreshold
} from "../components/DashboardView";
import { DEFAULT_ALERTS, WeatherProvider } from "../context/WeatherContext";
import { areLocationsEquivalent } from "../lib/forecast-resilience";
import {
  buildLocationHref,
  parseLocationFromSearchParams
} from "../lib/location-url";
import {
  buildWeatherApiUrl,
  BURSA_CURATED_LOCATIONS,
  BURSA_WMO_17116_ELEVATION_M,
  BURSA_WMO_17116_LAT,
  BURSA_WMO_17116_LON,
  canonicalizeStationIdentity,
  DEFAULT_LOCATION,
  formatElevation,
  formatWindSpeed
} from "../lib/weather-client";
import type {
  DailyPoint,
  GeoLocation,
  HourlyPoint,
  WeatherAlertRule,
  WeatherBundle
} from "../lib/weather-types";

function createTestWeatherBundle(params: {
  location: GeoLocation;
  temperatureC?: number;
  windSpeedKmh?: number;
  precipProbabilityPct?: number;
  europeanAqi?: number;
}): WeatherBundle {
  const {
    location,
    temperatureC = 18.4,
    windSpeedKmh = 14.2,
    precipProbabilityPct = 25,
    europeanAqi = 28
  } = params;

  const fetchedAt = "2026-11-27T12:00:00.000Z";
  const baseHourIso = "2026-11-27T15:00";

  const hour0: HourlyPoint = {
    time: baseHourIso,
    hourLabel: "15:00",
    dayLabel: "Bugün",
    temperature: temperatureC,
    apparentTemperature: temperatureC - 0.8,
    wetBulbC: temperatureC - 3.2,
    humidity: 62,
    dewPoint: temperatureC - 6.5,
    pressure: 1015.4,
    windSpeed: windSpeedKmh,
    windGusts: Math.max(windSpeedKmh, windSpeedKmh * 1.35),
    windDirection: 215,
    cloudCover: 35,
    visibilityKm: 18,
    uvIndex: 2.4,
    precipitation: 0,
    precipProbability: precipProbabilityPct,
    precipConsensus: {
      agreeingModels: 1,
      totalModels: 8,
      minMm: 0,
      medianMm: 0,
      maxMm: 0.2
    },
    precipType: "none",
    precipPhase: "none",
    rainAccum: 0,
    snowAccum: 0,
    weatherCode: 1,
    condition: "Az Bulutlu",
    isStorm: false,
    stormScore: 6,
    solarElevationDeg: 22,
    daylight: 0.7,
    cape: 40,
    cin: 0,
    liftedIndex: 2.5,
    freezingLevelM: 2400,
    temp850hPa: 6.5
  };

  const day0: DailyPoint = {
    date: "2026-11-27",
    dayName: "Bugün",
    tempMax: temperatureC + 3,
    tempMin: temperatureC - 5,
    weatherCode: 1,
    condition: "Az Bulutlu",
    precipSum: 0,
    precipProbabilityMax: precipProbabilityPct,
    windSpeedMax: Math.max(windSpeedKmh, 20),
    uvIndexMax: 3,
    sunrise: "2026-11-27T07:58",
    sunset: "2026-11-27T17:42"
  };

  return {
    location,
    source: "hybrid-nwp-verified",
    fetchedAt,
    timezone: location.timezone ?? "Europe/Istanbul",
    utcOffsetSeconds: 10800,
    current: {
      time: "2026-11-27T15:15",
      temperature: temperatureC,
      apparentTemperature: temperatureC - 0.8,
      wetBulbC: temperatureC - 3.2,
      humidity: 62,
      dewPoint: temperatureC - 6.5,
      pressure: 1015.4,
      pressureDelta3h: 0.4,
      pressureTrend: "sabit",
      pressureTrendDetail: "Sabit barometre",
      windSpeed: windSpeedKmh,
      windGusts: Math.max(windSpeedKmh, windSpeedKmh * 1.35),
      windDirection: 215,
      beaufort: { scale: 3, label: "Hafif rüzgar" },
      cloudCover: 35,
      visibilityKm: 18,
      uvIndex: 2.4,
      uvLabel: "Düşük",
      precipitation: 0,
      precipProbability: precipProbabilityPct,
      precipConsensus: hour0.precipConsensus,
      precipType: "none",
      precipPhase: "none",
      weatherCode: 1,
      condition: "Az Bulutlu",
      isStorm: false,
      stormScore: 6,
      isDay: true,
      solarElevationDeg: 22,
      daylight: 0.7,
      sunrise: day0.sunrise,
      sunset: day0.sunset,
      temp850hPa: 6.5
    },
    airQuality: {
      europeanAqi,
      categoryIndex: europeanAqi <= 20 ? 1 : europeanAqi <= 40 ? 2 : 3,
      label: europeanAqi <= 20 ? "İyi" : europeanAqi <= 40 ? "Makul" : "Orta",
      dominantPollutant: "PM2.5",
      dominantValueText: "9 µg/m³",
      pm25: 9,
      pm10: 18,
      ozone: 48,
      no2: 14,
      so2: 4,
      dust: 6
    },
    hourly: [hour0],
    daily: [day0],
    sounding: [],
    hourlySoundings: [],
    nativeConvective: {
      cape: 40,
      cin: 0,
      liftedIndex: 2.5,
      freezingLevelM: 2400
    },
    hybrid: {
      activeModels: ["ecmwfIfs", "ecmwfAifs", "icon", "gfs"],
      confidencePct: 92,
      tempSpreadC: 0.8,
      pressureSpreadHpa: 0.5,
      currentBreakdown: {
        temperature: { ecmwfIfs: temperatureC, ecmwfAifs: temperatureC, icon: temperatureC, ukmo: temperatureC, gfs: temperatureC },
        pressure: { ecmwfIfs: 1015.4, ecmwfAifs: 1015.4, icon: 1015.4, ukmo: 1015.4, gfs: 1015.4 },
        windSpeed: { ecmwfIfs: windSpeedKmh, ecmwfAifs: windSpeedKmh, icon: windSpeedKmh, ukmo: windSpeedKmh, gfs: windSpeedKmh },
        temp850hPa: { ecmwfIfs: 6.5, ecmwfAifs: 6.5, icon: 6.5, ukmo: 6.5, gfs: 6.5 },
        precipitation: { ecmwfIfs: 0, ecmwfAifs: 0, icon: 0, ukmo: 0, gfs: 0 }
      },
      verification: {
        mode: "wmo-prior",
        station: null,
        matchedHours: 0,
        winners: { temperature: "ecmwfIfs", pressure: "ecmwfIfs", wind: "icon" },
        rows: []
      },
      attributions: []
    }
  };
}

describe("Dashboard, İstasyon Kimliği, IEEE-754 Alarm Motoru ve Erişilebilirlik Değişmezleri", () => {
  it("1. areLocationsEquivalent: Bursa Merkez (100 m), Heykel/Çekirge (205 m) ve Uludağ Zirve (1850 m) arasında veri sızıntısına asla izin vermez", () => {
    const bursaMerkez: GeoLocation = {
      ...DEFAULT_LOCATION,
      id: "bursa-tr",
      elevation: 100
    };
    const uludagZirveCustom: GeoLocation = {
      id: "bursa-uludag-zirve-tr",
      name: "Uludağ Zirve",
      country: "Türkiye",
      lat: 40.1069,
      lon: 29.1292,
      elevation: 1850
    };
    const uludagCurated = BURSA_CURATED_LOCATIONS.find(
      (c) => c.id === "bursa-uludag-tr"
    )!;
    const heykelEtek: GeoLocation = {
      id: "bursa-osmangazi-etek-tr",
      name: "Osmangazi (Heykel / Çekirge)",
      country: "Türkiye",
      lat: 40.1965,
      lon: 29.0385,
      elevation: 205
    };

    expect(areLocationsEquivalent(bursaMerkez, uludagZirveCustom)).toBe(false);
    expect(areLocationsEquivalent(bursaMerkez, uludagCurated)).toBe(false);
    expect(areLocationsEquivalent(bursaMerkez, heykelEtek)).toBe(false);
    expect(areLocationsEquivalent(heykelEtek, uludagZirveCustom)).toBe(false);

    // Yatay koordinat toleransı genişletilse dahi 65m dikey bariyer ve bursa-* alt kimlik kilidi ayrımı korur
    expect(areLocationsEquivalent(bursaMerkez, heykelEtek, 0.25)).toBe(false);
    expect(
      areLocationsEquivalent(
        { lat: 40.2308, lon: 29.0133, elevation: 100 },
        { lat: 40.2308, lon: 29.0133, elevation: 165 }
      )
    ).toBe(false);
    expect(
      areLocationsEquivalent(
        { lat: 40.2308, lon: 29.0133, elevation: 100 },
        { lat: 40.2312, lon: 29.014, elevation: 135 }
      )
    ).toBe(true);
  });

  it("2. canonicalizeStationIdentity: Bursa ova koridorundaki (40.23, 29.01, 105 m) 'Osmangazi' ters-geocode yanıtını kanonik WMO 17116 (bursa-tr, 100 m) istasyonuna kenetlerken 205 m Heykel ve 1850 m Uludağ kimliklerini korur", () => {
    const reverseGeocodedPlainOsmangazi: GeoLocation = {
      id: "gps_40.230_29.010",
      name: "Osmangazi",
      admin1: "Bursa",
      country: "Türkiye",
      countryCode: "TR",
      lat: 40.23,
      lon: 29.01,
      elevation: 105,
      timezone: "Europe/Istanbul"
    };

    const lockedPlain = canonicalizeStationIdentity(reverseGeocodedPlainOsmangazi);
    expect(lockedPlain.id).toBe("bursa-tr");
    expect(lockedPlain.name).toBe("Bursa");
    expect(lockedPlain.elevation).toBe(BURSA_WMO_17116_ELEVATION_M);
    expect(lockedPlain.lat).toBeCloseTo(BURSA_WMO_17116_LAT, 4);
    expect(lockedPlain.lon).toBeCloseTo(BURSA_WMO_17116_LON, 4);
    expect(lockedPlain.admin1).toContain("WMO 17116");

    // 205 m Heykel / Çekirge etek istasyonu asla 100 m ovaya ezilmez
    const heykelInput: GeoLocation = {
      id: "bursa-osmangazi-etek-tr",
      name: "Osmangazi (Heykel / Çekirge)",
      admin1: "Bursa · Tarihi Etek",
      country: "Türkiye",
      lat: 40.1965,
      lon: 29.0385,
      elevation: 205,
      timezone: "Europe/Istanbul"
    };
    const canonicalHeykel = canonicalizeStationIdentity(heykelInput);
    expect(canonicalHeykel.id).toBe("bursa-osmangazi-etek-tr");
    expect(canonicalHeykel.elevation).toBe(205);
    expect(areLocationsEquivalent(canonicalHeykel, lockedPlain)).toBe(false);

    // 1850 m Uludağ istasyonu hem küratörlü hem özel zirve kimliğiyle rakımını korur
    const uludagCuratedInput: GeoLocation = {
      id: "bursa-uludag-tr",
      name: "Uludağ (Oteller / Zirve)",
      country: "Türkiye",
      lat: 40.1069,
      lon: 29.1292,
      elevation: 1850,
      timezone: "Europe/Istanbul"
    };
    const canonicalUludag = canonicalizeStationIdentity(uludagCuratedInput);
    expect(canonicalUludag.id).toBe("bursa-uludag-tr");
    expect(canonicalUludag.elevation).toBe(1850);

    const uludagCustomInput: GeoLocation = {
      id: "bursa-uludag-zirve-tr",
      name: "Uludağ Zirve",
      country: "Türkiye",
      lat: 40.107,
      lon: 29.129,
      elevation: 1850,
      timezone: "Europe/Istanbul"
    };
    const canonicalUludagCustom = canonicalizeStationIdentity(uludagCustomInput);
    expect(canonicalUludagCustom.id).toBe("bursa-uludag-zirve-tr");
    expect(canonicalUludagCustom.elevation).toBe(1850);
  });

  it("3. buildWeatherApiUrl ve buildLocationHref: elevation ve admin1 parametrelerini eksiksiz taşır", () => {
    const heykelLoc = BURSA_CURATED_LOCATIONS.find(
      (c) => c.id === "bursa-osmangazi-etek-tr"
    )!;
    const apiUrlHeykel = buildWeatherApiUrl(heykelLoc);
    const parsedHeykelUrl = new URL(apiUrlHeykel, "https://atmos.local");
    expect(parsedHeykelUrl.pathname).toBe("/api/weather");
    expect(parsedHeykelUrl.searchParams.get("elevation")).toBe("205");
    expect(parsedHeykelUrl.searchParams.get("admin1")).toBe("Bursa · Tarihi Etek");
    expect(parsedHeykelUrl.searchParams.get("name")).toBe(
      "Osmangazi (Heykel / Çekirge)"
    );

    const plainOsmangaziUrl = buildWeatherApiUrl({
      id: "gps_40.230_29.010",
      name: "Osmangazi",
      country: "Türkiye",
      lat: 40.23,
      lon: 29.01,
      elevation: 105
    });
    const parsedPlainUrl = new URL(plainOsmangaziUrl, "https://atmos.local");
    expect(parsedPlainUrl.searchParams.get("elevation")).toBe("100");
    expect(parsedPlainUrl.searchParams.get("admin1")).toBe(
      "Osmangazi · Merkez (WMO 17116)"
    );

    const labHref = buildLocationHref("/lab", heykelLoc);
    const parsedLabHref = new URL(labHref, "https://atmos.local");
    expect(parsedLabHref.pathname).toBe("/lab");
    expect(parsedLabHref.searchParams.get("elev")).toBe("205");
    expect(parsedLabHref.searchParams.get("admin1")).toBe("Bursa · Tarihi Etek");

    const roundTripped = parseLocationFromSearchParams(parsedLabHref.searchParams);
    expect(roundTripped.kind).toBe("coords");
    if (roundTripped.kind === "coords") {
      expect(roundTripped.location.id).toBe("bursa-osmangazi-etek-tr");
      expect(roundTripped.location.elevation).toBe(205);
    }
  });

  it("4. Sıfır-Sapmalı IEEE-754 Sıcaklık Alarm Dönüşümü: 76°F olarak girilen eşik °F -> °C -> °F geçişlerinde 75°F'a kaymadan tam 76°F kalır", () => {
    const metricStored = toMetricThreshold("temperature", 76, "imperial");
    // Ara basamakta asla toFixed(1) veya Math.round uygulanmaz: ((76 - 32) * 5) / 9 = 24.444444444444443
    expect(metricStored).toBe(((76 - 32) * 5) / 9);
    expect(metricStored).not.toBe(24);
    expect(metricStored).not.toBe(24.4);

    const ruleWithSource: WeatherAlertRule = {
      id: "alert-76f",
      cityId: "bursa-tr",
      cityName: "Bursa",
      metric: "temperature",
      operator: ">",
      threshold: metricStored,
      sourceUnit: "imperial",
      sourceValue: 76,
      enabled: true
    };

    // °F -> °C -> °F geçişi
    expect(toDisplayRuleThreshold(ruleWithSource, "imperial")).toBe(76);
    expect(toDisplayRuleThreshold(ruleWithSource, "metric")).toBe(24);
    expect(toDisplayRuleThreshold(ruleWithSource, "imperial")).toBe(76);

    // Eski kayıt gibi sourceUnit/sourceValue bulunmasa bile saf IEEE-754 threshold'dan dönüş 76°F verir
    const rulePureIeee: WeatherAlertRule = {
      id: "alert-76f-legacy",
      cityId: "bursa-tr",
      cityName: "Bursa",
      metric: "temperature",
      operator: ">",
      threshold: metricStored,
      sourceUnit: "imperial",
      enabled: true
    };
    expect(toDisplayRuleThreshold(rulePureIeee, "imperial")).toBe(76);

    // Tüm tam sayı Fahrenheit değerleri (-40°F .. +125°F) için sıfır sapma değişmezi
    for (let f = -40; f <= 125; f++) {
      const storedC = toMetricThreshold("temperature", f, "imperial");
      const rule: WeatherAlertRule = {
        id: `f-${f}`,
        cityId: "bursa-tr",
        cityName: "Bursa",
        metric: "temperature",
        operator: ">",
        threshold: storedC,
        sourceUnit: "imperial",
        sourceValue: f,
        enabled: true
      };
      expect(toDisplayRuleThreshold(rule, "imperial")).toBe(f);
    }
  });

  it("5. Görüntü Uzayı Alarm Değerlendirmesi: 9.4 km/s (5.84 mph -> 6 mph) rüzgarda '6 mph > 6 mph' görsel paradoksu asla oluşmaz", () => {
    const bundle94Kmh = createTestWeatherBundle({
      location: DEFAULT_LOCATION,
      windSpeedKmh: 9.4 // 9.4 * 0.621371 = 5.8408874 mph -> kartta "6 mph"
    });
    expect(formatWindSpeed(9.4, "imperial")).toBe("6 mph");

    // Durum A: Kullanıcı Imperial modda "> 6 mph" kuralı ekledi
    const ruleImperial6Mph: WeatherAlertRule = {
      id: "wind-6mph-imp",
      cityId: "bursa-tr",
      cityName: "Bursa",
      metric: "windSpeed",
      operator: ">",
      threshold: toMetricThreshold("windSpeed", 6, "imperial"),
      sourceUnit: "imperial",
      sourceValue: 6,
      enabled: true
    };
    const evalA = evaluateRule(ruleImperial6Mph, bundle94Kmh, "imperial");
    expect(evalA.currentVal).toBe(6);
    expect(evalA.displayThreshold).toBe(6);
    expect(evalA.triggered).toBe(false);

    // Durum B: Metrik modda 9.1 km/s (5.65 mph -> 6 mph) eşik girilmiş, rüzgar 9.4 km/s (5.84 mph -> 6 mph):
    // Ham metrikte 9.4 > 9.1 olsa bile Imperial görünümde her ikisi de "6 mph" olduğu için "6 mph > 6 mph" paradoksu engellenir!
    const ruleMetric91Kmh: WeatherAlertRule = {
      id: "wind-9.1kmh",
      cityId: "bursa-tr",
      cityName: "Bursa",
      metric: "windSpeed",
      operator: ">",
      threshold: 9.1,
      sourceUnit: "metric",
      sourceValue: 9.1,
      enabled: true
    };
    const evalB = evaluateRule(ruleMetric91Kmh, bundle94Kmh, "imperial");
    expect(evalB.currentVal).toBe(6);
    expect(evalB.displayThreshold).toBe(6);
    expect(evalB.triggered).toBe(false);

    // Gerçek aşım: 10.8 km/s -> 6.71 mph -> 7 mph > 6 mph olduğunda tetiklenir
    const bundle108Kmh = createTestWeatherBundle({
      location: DEFAULT_LOCATION,
      windSpeedKmh: 10.8
    });
    const evalC = evaluateRule(ruleImperial6Mph, bundle108Kmh, "imperial");
    expect(evalC.currentVal).toBe(7);
    expect(evalC.displayThreshold).toBe(6);
    expect(evalC.triggered).toBe(true);
  });

  it("6. DEFAULT_ALERTS ve resolveBundleForAlertRule: 3 kademeli (cityId, koordinat+rakım, normalize şehir adı) ve aktif bağlam yedeğiyle kırılmaz çalışır", () => {
    expect(DEFAULT_ALERTS.length).toBeGreaterThanOrEqual(2);
    const defaultBursaAlert = DEFAULT_ALERTS.find(
      (r) => r.cityId === "bursa-tr"
    )!;
    const defaultIstanbulAlert = DEFAULT_ALERTS.find(
      (r) => r.cityId === "istanbul-tr"
    )!;
    expect(defaultBursaAlert).toBeDefined();
    expect(defaultBursaAlert.elevation).toBe(100);
    expect(defaultIstanbulAlert).toBeDefined();

    // Kademe 1: Doğrudan cityId eşleşmesi
    const bursaBundle = createTestWeatherBundle({
      location: DEFAULT_LOCATION,
      windSpeedKmh: 52
    });
    const tier1Match = resolveBundleForAlertRule(
      defaultBursaAlert,
      [DEFAULT_LOCATION],
      { "bursa-tr": bursaBundle },
      null
    );
    expect(tier1Match).toBe(bursaBundle);

    // Kademe 2: Farklı sentetik ID ve farklı ilçe adına rağmen koordinat + rakım (< 65m) eşleşmesi;
    // ancak 1850m Uludağ paketi kesinlikle eşleşmez!
    const gpsPlainFav: GeoLocation = {
      id: "geo_custom_osmangazi",
      name: "Osmangazi Ova",
      country: "Türkiye",
      lat: 40.232,
      lon: 29.015,
      elevation: 108
    };
    const uludagFav: GeoLocation = {
      id: "bursa-uludag-zirve-tr",
      name: "Uludağ Zirve",
      country: "Türkiye",
      lat: 40.231, // kasıtlı yakın koordinat verilse bile 1850m rakım bariyeri engeller
      lon: 29.014,
      elevation: 1850
    };
    const gpsPlainBundle = createTestWeatherBundle({
      location: gpsPlainFav,
      windSpeedKmh: 48
    });
    const uludagBundle = createTestWeatherBundle({
      location: uludagFav,
      windSpeedKmh: 85
    });

    const tier2RejectUludag = resolveBundleForAlertRule(
      defaultBursaAlert,
      [uludagFav],
      { [uludagFav.id]: uludagBundle },
      null
    );
    expect(tier2RejectUludag).toBeUndefined();

    const tier2MatchPlain = resolveBundleForAlertRule(
      defaultBursaAlert,
      [uludagFav, gpsPlainFav],
      {
        [uludagFav.id]: uludagBundle,
        [gpsPlainFav.id]: gpsPlainBundle
      },
      null
    );
    expect(tier2MatchPlain).toBe(gpsPlainBundle);

    // Kademe 3: ID ve koordinat farklı (ör. İstanbul Havalimanı pini) fakat normalize Türkçe ad ("İSTANBUL" -> "istanbul") eşleşir
    expect(normalizeName("  İSTANBUL  ")).toBe("istanbul");
    expect(normalizeName("Çekirge / Şişli")).toBe("cekirge / sisli");

    const istAirportLoc: GeoLocation = {
      id: "ist-airport-custom",
      name: "İSTANBUL",
      country: "Türkiye",
      lat: 41.2753,
      lon: 28.7519,
      elevation: 99
    };
    const istBundle = createTestWeatherBundle({
      location: istAirportLoc,
      precipProbabilityPct: 82
    });
    const tier3Match = resolveBundleForAlertRule(
      defaultIstanbulAlert,
      [istAirportLoc],
      { [istAirportLoc.id]: istBundle },
      null
    );
    expect(tier3Match).toBe(istBundle);
    expect(evaluateRule(defaultIstanbulAlert, tier3Match, "metric").triggered).toBe(
      true
    );

    // Aktif bağlam yedeği: Favorilerden silinmiş olsa bile activeBundle eşleşiyorsa çözülür
    const fallbackActiveMatch = resolveBundleForAlertRule(
      defaultBursaAlert,
      [],
      {},
      bursaBundle
    );
    expect(fallbackActiveMatch).toBe(bursaBundle);
  });

  it("7. Negatif Sıcaklık Eşiği ('-5') ve Akıllı Varsayılanlar: '-5' girişi kayıpsız işlenir, sıcaklık dışı metriklerde negatif değer engellenir", () => {
    const rawInput = "-5";
    const parsed = Number(rawInput.trim().replace(",", "."));
    expect(Number.isFinite(parsed)).toBe(true);
    expect(parsed).toBe(-5);

    const frostRuleMetric: WeatherAlertRule = {
      id: "frost-minus-5c",
      cityId: "ankara-tr",
      cityName: "Ankara",
      metric: "temperature",
      operator: "<",
      threshold: toMetricThreshold("temperature", parsed, "metric"),
      sourceUnit: "metric",
      sourceValue: parsed,
      enabled: true
    };
    expect(toDisplayRuleThreshold(frostRuleMetric, "metric")).toBe(-5);
    expect(toDisplayRuleThreshold(frostRuleMetric, "imperial")).toBe(23);

    const freezingBundle = createTestWeatherBundle({
      location: {
        id: "ankara-tr",
        name: "Ankara",
        country: "Türkiye",
        lat: 39.9334,
        lon: 32.8597,
        elevation: 890
      },
      temperatureC: -7.4
    });
    const evalMetric = evaluateRule(frostRuleMetric, freezingBundle, "metric");
    expect(evalMetric.triggered).toBe(true);
    expect(evalMetric.currentVal).toBe(-7);
    expect(evalMetric.displayThreshold).toBe(-5);

    // Imperial '-5°F' girişi de °F -> °C -> °F döngüsünde tam -5°F kalır
    const frostRuleImperial: WeatherAlertRule = {
      id: "frost-minus-5f",
      cityId: "ankara-tr",
      cityName: "Ankara",
      metric: "temperature",
      operator: "<",
      threshold: toMetricThreshold("temperature", -5, "imperial"),
      sourceUnit: "imperial",
      sourceValue: -5,
      enabled: true
    };
    expect(toDisplayRuleThreshold(frostRuleImperial, "imperial")).toBe(-5);

    expect(getSmartDefaultThreshold("temperature", "<", "metric")).toBe(0);
    expect(getSmartDefaultThreshold("temperature", "<", "imperial")).toBe(32);

    // Kaynak sözleşmesi: input type="text" inputMode="decimal" kullanır (min=0 kilidi yoktur) ve yalnızca sıcaklıkta negatife izin verir
    const dashSrc = fs.readFileSync(
      path.resolve(__dirname, "../components/DashboardView.tsx"),
      "utf-8"
    );
    expect(dashSrc).toContain('type="text"');
    expect(dashSrc).toContain('inputMode="decimal"');
    expect(dashSrc).toContain('if (alertMetric !== "temperature" && rawNumericInput < 0)');
  });

  it("8. CitySearch Erişilebilirlik, GPS Yarış Koruması ve Gizli Konteyner Boğuk-Ses Kalkanı doğrulanır", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        WeatherProvider,
        {
          initialBundle: null,
          initialLocation: DEFAULT_LOCATION
        } as React.ComponentProps<typeof WeatherProvider>,
        React.createElement(CitySearch, {
          onSelect: () => {},
          placeholder: "+ Yeni istasyon ekle..."
        })
      )
    );

    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-autocomplete="list"');
    expect(html).toContain('aria-label="Konumumu kullan"');

    const citySearchSrc = fs.readFileSync(
      path.resolve(__dirname, "../components/CitySearch.tsx"),
      "utf-8"
    );
    expect(citySearchSrc).toContain('role="combobox"');
    expect(citySearchSrc).toContain("aria-expanded={open}");
    expect(citySearchSrc).toContain("requestGpsLocation");
    expect(citySearchSrc).toContain("formatElevation(loc.elevation, unit)");
    expect(citySearchSrc).toContain("containerRef.current.getClientRects().length === 0");
    expect(citySearchSrc).toContain("new ResizeObserver(closeIfHidden)");

    // WeatherContext içinde GPS isteği sırasında manuel şehir seçilirse yarış sayacı (locationReqSeqRef) ve AbortController devreye girer
    const ctxSrc = fs.readFileSync(
      path.resolve(__dirname, "../context/WeatherContext.tsx"),
      "utf-8"
    );
    expect(ctxSrc).toContain("const seq = ++locationReqSeqRef.current;");
    expect(ctxSrc).toContain("gpsAbortRef.current?.abort();");
    expect(ctxSrc).toContain("if (seq !== locationReqSeqRef.current)");
  });

  it("9. CommandPalette z-[80] Katmanı, buildLocationHref Navigasyonu, Rakım Formatlama ve Klavye Odak Tuzağı doğrulanır", () => {
    const htmlOpen = renderToStaticMarkup(
      React.createElement(
        WeatherProvider,
        {
          initialBundle: null,
          initialLocation: DEFAULT_LOCATION
        } as React.ComponentProps<typeof WeatherProvider>,
        React.createElement(CommandPalette, {
          open: true,
          onClose: () => {}
        })
      )
    );

    expect(htmlOpen).toContain("z-[80]");
    expect(htmlOpen).toContain('role="dialog"');
    expect(htmlOpen).toContain('aria-modal="true"');
    expect(htmlOpen).toContain(formatElevation(DEFAULT_LOCATION.elevation, "metric"));

    const htmlClosed = renderToStaticMarkup(
      React.createElement(
        WeatherProvider,
        {
          initialBundle: null,
          initialLocation: DEFAULT_LOCATION
        } as React.ComponentProps<typeof WeatherProvider>,
        React.createElement(CommandPalette, {
          open: false,
          onClose: () => {}
        })
      )
    );
    expect(htmlClosed).toBe("");

    const paletteSrc = fs.readFileSync(
      path.resolve(__dirname, "../components/CommandPalette.tsx"),
      "utf-8"
    );
    expect(paletteSrc).toContain("z-[80]");
    expect(paletteSrc).toContain("router.push(buildLocationHref(item.href, activeLocation))");
    expect(paletteSrc).toContain("FOCUSABLE_SELECTOR");
    expect(paletteSrc).toContain('if (e.key !== "Tab") return;');
    expect(paletteSrc).toContain("last.focus()");
    expect(paletteSrc).toContain("first.focus()");
    expect(paletteSrc).toContain("previousFocusRef.current");
  });
});
