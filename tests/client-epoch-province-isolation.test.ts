import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  buildModelsApiUrlWithProvince,
  buildWeatherApiUrlWithProvince,
  createWeatherEpochTransitionCoordinator,
  isEpochResponseValidForActiveLocation,
  useWeatherData,
  WeatherProvider
} from "../context/WeatherContext";
import {
  clearClientForecastSessionForTests,
  flushPendingClientCacheWritesSync,
  MAX_ELEVATION_DELTA_CACHE_M,
  readCachedModelsBundleSync,
  readCachedWeatherBundleSync,
  writeCachedModelsBundle,
  writeCachedWeatherBundle
} from "../lib/client-forecast-cache";
import { serializeLocationSearchParams } from "../lib/location-url";
import {
  ATMOS_STORAGE_KEYS,
  BURSA_CURATED_LOCATIONS,
  DEFAULT_LOCATION,
  type StorageLike
} from "../lib/weather-client";
import type {
  CoreModelKey,
  GeoLocation,
  MultiModelBundle,
  WeatherBundle
} from "../lib/weather-types";

function createMemoryStorage(maxBytes = Infinity): StorageLike {
  const store = new Map<string, string>();
  return {
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      if (value.length > maxBytes) {
        throw new Error("QuotaExceededError");
      }
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    }
  };
}

function makeWeatherFixture(
  loc: GeoLocation,
  tempC: number,
  opts?: {
    fetchedAt?: string;
    cloudCover?: number;
    isStorm?: boolean;
    summaryProvinceCode?: string;
  }
): WeatherBundle {
  const fetchedAt = opts?.fetchedAt ?? "2026-11-28T14:00:00.000Z";
  const cloudCover = opts?.cloudCover ?? 30;
  const isStorm = opts?.isStorm ?? false;
  return {
    location: loc,
    ...(opts?.summaryProvinceCode
      ? {
          provinceSummary: {
            provinceCode: opts.summaryProvinceCode as "TR-16",
            plateNumber: Number(opts.summaryProvinceCode.slice(3)) || 16,
            provinceName: loc.name,
            climateRegion: "MARMARA",
            calibrationTier: "TIER_A_WMO",
            canonicalCenter: {
              id: loc.id,
              name: loc.name,
              stationLabel: loc.name,
              lat: loc.lat,
              lon: loc.lon,
              elevationM: loc.elevation ?? 100
            },
            mgmMeshStationCount: 12,
            activeWaterBodies: [],
            cumulusStageId: "marmara",
            curatedSubLocations: []
          }
        }
      : {}),
    source: "hybrid-nwp-verified",
    fetchedAt,
    timezone: loc.timezone ?? "Europe/Istanbul",
    utcOffsetSeconds: 10800,
    current: {
      time: "2026-11-28T17:00",
      temperature: tempC,
      apparentTemperature: tempC - 0.8,
      humidity: 68,
      dewPoint: tempC - 5.2,
      pressure: 1016,
      pressureDelta3h: -0.4,
      pressureTrend: "sabit",
      pressureTrendDetail: "Sabit barometre",
      windSpeed: 14,
      windGusts: 24,
      windDirection: 45,
      beaufort: { scale: 3, label: "Tatlı esinti" },
      cloudCover,
      visibilityKm: 16,
      uvIndex: 1,
      uvLabel: "Düşük",
      precipitation: isStorm ? 6.4 : 0,
      precipProbability: isStorm ? 85 : 5,
      precipConsensus: {
        agreeingModels: isStorm ? 8 : 0,
        totalModels: 8,
        minMm: 0,
        medianMm: isStorm ? 6.4 : 0,
        maxMm: isStorm ? 8.0 : 0
      },
      precipType: isStorm ? "rain" : "none",
      weatherCode: isStorm ? 95 : 1,
      condition: isStorm ? "Gök Gürültülü Sağanak" : "Az Bulutlu",
      isDay: true,
      isStorm,
      solarElevationDeg: 18,
      daylight: 0.65,
      sunrise: "2026-11-28T08:04",
      sunset: "2026-11-28T17:40",
      temp850hPa: tempC - 7.5
    },
    airQuality: {
      europeanAqi: 24,
      categoryIndex: 2,
      label: "Makul",
      dominantPollutant: "PM2.5",
      dominantValueText: "9 µg/m³",
      pm25: 9,
      pm10: 16,
      ozone: 40,
      no2: 12,
      so2: 2,
      dust: 3
    },
    hourly: Array.from({ length: 48 }, (_, hIdx) => {
      const baseMs = Date.parse("2026-11-28T14:00:00.000Z") + hIdx * 3600_000;
      const localIso = new Date(baseMs + 3 * 3600_000).toISOString().slice(0, 16);
      return {
        time: localIso,
        hourLabel: localIso.slice(11, 16),
        dayLabel: hIdx < 7 ? "Bugün" : "Yarın",
        temperature: Number((tempC - (hIdx % 6) * 0.3).toFixed(1)),
        apparentTemperature: Number((tempC - 0.8).toFixed(1)),
        humidity: 68,
        dewPoint: Number((tempC - 5.2).toFixed(1)),
        pressure: 1016,
        windSpeed: 14,
        windGusts: 24,
        windDirection: 45,
        cloudCover,
        visibilityKm: 16,
        uvIndex: 1,
        precipitation: isStorm && hIdx < 3 ? 6.4 : 0,
        precipProbability: isStorm && hIdx < 3 ? 85 : 5,
        precipConsensus: {
          agreeingModels: 0,
          totalModels: 8,
          minMm: 0,
          medianMm: 0,
          maxMm: 0
        },
        precipType: isStorm && hIdx < 3 ? "rain" : "none",
        rainAccum: 0,
        snowAccum: 0,
        weatherCode: isStorm && hIdx < 3 ? 95 : 1,
        condition: isStorm && hIdx < 3 ? "Gök Gürültülü Sağanak" : "Az Bulutlu",
        isStorm: isStorm && hIdx < 3,
        solarElevationDeg: 18,
        daylight: 0.65,
        cape: isStorm ? 1200 : 25,
        cin: -5,
        liftedIndex: isStorm ? -3.5 : 3,
        freezingLevelM: 2200,
        temp850hPa: Number((tempC - 7.5).toFixed(1))
      };
    }),
    daily: [
      {
        date: "2026-11-28",
        dayName: "Bugün",
        tempMax: tempC + 3,
        tempMin: tempC - 4,
        weatherCode: isStorm ? 95 : 1,
        condition: isStorm ? "Gök Gürültülü Sağanak" : "Az Bulutlu",
        precipSum: isStorm ? 18 : 0,
        precipProbabilityMax: isStorm ? 85 : 5,
        windSpeedMax: 24,
        uvIndexMax: 3,
        sunrise: "2026-11-28T08:04",
        sunset: "2026-11-28T17:40"
      },
      {
        date: "2026-11-29",
        dayName: "Yarın",
        tempMax: tempC + 2,
        tempMin: tempC - 5,
        weatherCode: 1,
        condition: "Az Bulutlu",
        precipSum: 0,
        precipProbabilityMax: 10,
        windSpeedMax: 18,
        uvIndexMax: 3,
        sunrise: "2026-11-29T08:05",
        sunset: "2026-11-29T17:40"
      }
    ],
    sounding: [],
    hourlySoundings: [],
    nativeConvective: {
      cape: isStorm ? 1200 : 25,
      cin: -5,
      liftedIndex: 3,
      freezingLevelM: 2200
    },
    hybrid: {
      activeModels: ["ecmwfIfs", "ecmwfAifs", "icon", "ukmo", "gfs"],
      confidencePct: 93,
      tempSpreadC: 0.6,
      pressureSpreadHpa: 0.4,
      currentBreakdown: {
        temperature: {
          ecmwfIfs: tempC,
          ecmwfAifs: tempC,
          icon: tempC,
          ukmo: tempC,
          gfs: tempC
        },
        pressure: {
          ecmwfIfs: 1016,
          ecmwfAifs: 1016,
          icon: 1016,
          ukmo: 1016,
          gfs: 1016
        },
        windSpeed: {
          ecmwfIfs: 14,
          ecmwfAifs: 14,
          icon: 14,
          ukmo: 14,
          gfs: 14
        },
        temp850hPa: {
          ecmwfIfs: tempC - 7.5,
          ecmwfAifs: tempC - 7.5,
          icon: tempC - 7.5,
          ukmo: tempC - 7.5,
          gfs: tempC - 7.5
        },
        precipitation: {
          ecmwfIfs: 0,
          ecmwfAifs: 0,
          icon: 0,
          ukmo: 0,
          gfs: 0
        }
      },
      attributions: [],
      verification: {
        mode: "live-mgm-mesh",
        matchedHours: 48,
        station: null,
        stations: [],
        rows: [],
        winners: {
          temperature: "ecmwfIfs",
          pressure: "ecmwfIfs",
          wind: "icon",
          precipitation: "ecmwfIfs"
        }
      }
    }
  };
}

function makeModelsFixture(
  loc: GeoLocation,
  tempC: number,
  fetchedAt = "2026-11-28T14:00:00.000Z"
): MultiModelBundle {
  const zeroMap: Record<CoreModelKey, number> = {
    ecmwfIfs: 0,
    ecmwfAifs: 0,
    icon: 0,
    ukmo: 0,
    meteofrance: 0,
    gfs: 0,
    gem: 0,
    jma: 0
  };
  return {
    fetchedAt,
    lat: loc.lat,
    lon: loc.lon,
    elevation: loc.elevation,
    name: loc.name,
    admin1: loc.admin1,
    provinceCode: loc.provinceCode,
    country: loc.country,
    timezone: loc.timezone ?? "Europe/Istanbul",
    utcOffsetSeconds: 10800,
    temp2m: [
      {
        time: "2026-11-28T17:00",
        hourLabel: "17:00",
        dayLabel: "Bugün",
        ecmwfIfs: tempC,
        ecmwfAifs: tempC,
        icon: tempC,
        ukmo: tempC,
        gfs: tempC,
        meteofrance: tempC,
        gem: tempC,
        jma: tempC
      }
    ],
    temp850: [
      {
        time: "2026-11-28T17:00",
        hourLabel: "17:00",
        dayLabel: "Bugün",
        ecmwfIfs: tempC - 7,
        ecmwfAifs: tempC - 7,
        icon: tempC - 7,
        ukmo: tempC - 7,
        gfs: tempC - 7,
        meteofrance: tempC - 7,
        gem: tempC - 7,
        jma: tempC - 7
      }
    ],
    precip: [
      {
        time: "2026-11-28T17:00",
        hourLabel: "17:00",
        dayLabel: "Bugün",
        ecmwfIfs: 0,
        ecmwfAifs: 0,
        icon: 0,
        ukmo: 0,
        gfs: 0,
        meteofrance: 0,
        gem: 0,
        jma: 0
      }
    ],
    wind10m: [
      {
        time: "2026-11-28T17:00",
        hourLabel: "17:00",
        dayLabel: "Bugün",
        ecmwfIfs: 12,
        ecmwfAifs: 12,
        icon: 12,
        ukmo: 12,
        gfs: 12,
        meteofrance: 12,
        gem: 12,
        jma: 12
      }
    ],
    summary: {
      precip72h: zeroMap,
      precip168h: zeroMap,
      maxSpreadTemp2m: 0.4,
      min850hPa: zeroMap
    }
  };
}

describe("Wave 5 (FE-01 + FE-02) — 4-Katmanlı İstemci İzolasyonu, Rakım Kalkanı, Bursa Pinleme ve Yarışsız EpochTicket Geçişi", () => {
  const NOW_MS = Date.parse("2026-11-28T14:02:00.000Z");

  beforeEach(() => {
    clearClientForecastSessionForTests();
  });

  afterEach(() => {
    clearClientForecastSessionForTests();
  });

  it("1. İl Sınırı İzolasyonu (%0.00 Sızıntı): Yakın koordinatlarda bile Orhangazi (TR-16) <-> Yalova (TR-77) ve Tuzla (TR-34) <-> Gebze (TR-41) L1/L2 önbellekleri asla birbirine sızmaz", () => {
    const storage = createMemoryStorage();

    // İl sınırında < 0.005° (~500m) yakınlıkta ve <= 30m rakım farkında iki komşu nokta:
    // Koordinat ve rakım tek başına eşleşse dahi provinceCode vetosu sızıntıyı %100 engellemelidir!
    const orhangaziTr16: GeoLocation = {
      id: "orhangazi-border-tr16",
      name: "Orhangazi Kuzey Sınır",
      admin1: "Bursa",
      provinceCode: "TR-16",
      country: "Türkiye",
      countryCode: "TR",
      lat: 40.5312,
      lon: 29.3084,
      elevation: 115,
      timezone: "Europe/Istanbul"
    };
    const yalovaTr77: GeoLocation = {
      id: "yalova-border-tr77",
      name: "Yalova Güney Sınır",
      admin1: "Yalova",
      provinceCode: "TR-77",
      country: "Türkiye",
      countryCode: "TR",
      lat: 40.5348,
      lon: 29.3102,
      elevation: 92,
      timezone: "Europe/Istanbul"
    };

    // Adım A: Yalnızca Orhangazi (TR-16, 12.4°C) L1 ve L2'ye yazılır -> Yalova (TR-77) sorgusu KESİNLİKLE null döner!
    const orhangaziBundle = makeWeatherFixture(orhangaziTr16, 12.4);
    writeCachedWeatherBundle(orhangaziBundle, NOW_MS);
    writeCachedWeatherBundle(orhangaziBundle, NOW_MS, storage);

    expect(readCachedWeatherBundleSync(yalovaTr77, NOW_MS)).toBeNull();
    expect(readCachedWeatherBundleSync(yalovaTr77, NOW_MS, { storage })).toBeNull();
    expect(
      readCachedWeatherBundleSync(orhangaziTr16, NOW_MS)?.current.temperature
    ).toBe(12.4);

    // Adım B: Yalova (TR-77, 16.9°C) da yazıldığında Orhangazi'yi ezmez; her iki il kendi verisini döner!
    const yalovaBundle = makeWeatherFixture(yalovaTr77, 16.9);
    writeCachedWeatherBundle(yalovaBundle, NOW_MS + 1000);
    writeCachedWeatherBundle(yalovaBundle, NOW_MS + 1000, storage);

    const readOrhL1 = readCachedWeatherBundleSync(orhangaziTr16, NOW_MS + 2000);
    const readYalL1 = readCachedWeatherBundleSync(yalovaTr77, NOW_MS + 2000);
    const readOrhL2 = readCachedWeatherBundleSync(orhangaziTr16, NOW_MS + 2000, {
      storage
    });
    const readYalL2 = readCachedWeatherBundleSync(yalovaTr77, NOW_MS + 2000, {
      storage
    });

    expect(readOrhL1?.current.temperature).toBe(12.4);
    expect(readOrhL1?.location.provinceCode).toBe("TR-16");
    expect(readYalL1?.current.temperature).toBe(16.9);
    expect(readYalL1?.location.provinceCode).toBe("TR-77");
    expect(readOrhL2?.current.temperature).toBe(12.4);
    expect(readYalL2?.current.temperature).toBe(16.9);

    // Adım C: Tuzla (TR-34, provinceSummary üzerinden il kodu) vs Gebze (TR-41) + MultiModelBundle izolasyonu
    const tuzlaTr34: GeoLocation = {
      id: "tuzla-tr34",
      name: "Tuzla",
      country: "Türkiye",
      lat: 40.8162,
      lon: 29.3621,
      elevation: 28
    };
    const gebzeTr41: GeoLocation = {
      id: "gebze-tr41",
      name: "Gebze",
      provinceCode: "TR-41",
      country: "Türkiye",
      lat: 40.8188,
      lon: 29.3665,
      elevation: 42
    };

    const tuzlaViaSummaryBundle = makeWeatherFixture(tuzlaTr34, 15.1, {
      summaryProvinceCode: "TR-34"
    });
    writeCachedWeatherBundle(tuzlaViaSummaryBundle, NOW_MS, storage);
    expect(readCachedWeatherBundleSync(gebzeTr41, NOW_MS, { storage })).toBeNull();

    writeCachedModelsBundle(
      makeModelsFixture({ ...tuzlaTr34, provinceCode: "TR-34" }, 15.1),
      NOW_MS,
      storage
    );
    expect(
      readCachedModelsBundleSync(gebzeTr41.lat, gebzeTr41.lon, NOW_MS, {
        storage,
        provinceCode: "TR-41",
        elevation: 42
      })
    ).toBeNull();
  });

  it("2. Rakım Kalkanı (|Δelev| <= 65 m): Bursa Merkez (100 m) <-> Uludağ (1850 m) ve Kayseri (1054 m) <-> Erciyes (2215 m) asla birbirinin önbelleğini okumaz", () => {
    expect(MAX_ELEVATION_DELTA_CACHE_M).toBe(65);
    const storage = createMemoryStorage();

    // Bursa Merkez (100 m, +14.8°C) yazılır -> Uludağ (1850 m) ve aynı enlem/boylamdaki dik yamaç (1850 m) KESİNLİKLE null döner!
    const bursaCenter: GeoLocation = {
      ...DEFAULT_LOCATION,
      provinceCode: "TR-16",
      elevation: 100
    };
    const uludagCurated = {
      ...BURSA_CURATED_LOCATIONS.find((c) => c.id === "bursa-uludag-tr")!,
      provinceCode: "TR-16"
    };
    const sameCoordHighSummit: GeoLocation = {
      id: "custom-summit-pin",
      name: "Bursa Dik Yamaç",
      provinceCode: "TR-16",
      country: "Türkiye",
      lat: bursaCenter.lat,
      lon: bursaCenter.lon,
      elevation: 1850
    };

    writeCachedWeatherBundle(makeWeatherFixture(bursaCenter, 14.8), NOW_MS);
    writeCachedWeatherBundle(makeWeatherFixture(bursaCenter, 14.8), NOW_MS, storage);

    expect(readCachedWeatherBundleSync(uludagCurated, NOW_MS)).toBeNull();
    expect(readCachedWeatherBundleSync(uludagCurated, NOW_MS, { storage })).toBeNull();
    expect(readCachedWeatherBundleSync(sameCoordHighSummit, NOW_MS)).toBeNull();
    expect(
      readCachedWeatherBundleSync(sameCoordHighSummit, NOW_MS, { storage })
    ).toBeNull();

    // Tam eşik sınırı testi: |165 - 100| = 65 m (İZİN VERİLİR) vs |166 - 100| = 66 m > 65 m (KESİN VETO -> null!)
    const elev165: GeoLocation = {
      ...bursaCenter,
      id: "custom-165m",
      elevation: 165
    };
    const elev166: GeoLocation = {
      ...bursaCenter,
      id: "custom-166m",
      elevation: 166
    };
    expect(
      readCachedWeatherBundleSync(elev165, NOW_MS, { storage })?.current.temperature
    ).toBe(14.8);
    expect(readCachedWeatherBundleSync(elev166, NOW_MS, { storage })).toBeNull();
    expect(readCachedWeatherBundleSync(elev166, NOW_MS)).toBeNull();

    // Kayseri Merkez (1054 m, +2.1°C) vs Erciyes Tekir Kapı (2215 m) izolasyonu
    const kayseriCenter: GeoLocation = {
      id: "kayseri-merkez",
      name: "Kayseri",
      provinceCode: "TR-38",
      country: "Türkiye",
      lat: 38.7205,
      lon: 35.4894,
      elevation: 1054
    };
    const erciyesTekir: GeoLocation = {
      id: "erciyes-tekir",
      name: "Erciyes Tekir Kapı",
      provinceCode: "TR-38",
      country: "Türkiye",
      lat: 38.721,
      lon: 35.49,
      elevation: 2215
    };
    writeCachedWeatherBundle(makeWeatherFixture(kayseriCenter, 2.1), NOW_MS, storage);
    expect(readCachedWeatherBundleSync(erciyesTekir, NOW_MS, { storage })).toBeNull();
  });

  it("3. Sabit Bursa Yuvası (pinnedBursaEntry): 80 il art arda L1 ve L2 önbelleğe yazılsa bile Bursa (TR-16) LRU'dan asla silinmez", () => {
    const storage = createMemoryStorage();
    const bursaLoc: GeoLocation = {
      ...DEFAULT_LOCATION,
      provinceCode: "TR-16"
    };

    // 1) Önce Bursa (TR-16, 11.4°C) hem L1 belleğe hem L2 localStorage'a yazılır
    writeCachedWeatherBundle(makeWeatherFixture(bursaLoc, 11.4), NOW_MS);
    writeCachedWeatherBundle(makeWeatherFixture(bursaLoc, 11.4), NOW_MS, storage);

    // 2) Ardından TR-16 dışındaki 80 ilin tamamı (TR-01 .. TR-81, toplam 80 il) sırayla yazılır!
    const otherPlates: number[] = [];
    for (let p = 1; p <= 81; p++) {
      if (p !== 16) otherPlates.push(p);
    }
    expect(otherPlates).toHaveLength(80);

    for (let idx = 0; idx < otherPlates.length; idx++) {
      const plate = otherPlates[idx];
      const provCode = `TR-${String(plate).padStart(2, "0")}`;
      const provLoc: GeoLocation = {
        id: `prov-${provCode.toLowerCase()}`,
        name: `İl ${provCode}`,
        provinceCode: provCode,
        country: "Türkiye",
        countryCode: "TR",
        lat: Number((36.5 + idx * 0.07).toFixed(4)),
        lon: Number((26.5 + idx * 0.22).toFixed(4)),
        elevation: 300 + (idx % 10) * 80,
        timezone: "Europe/Istanbul"
      };
      const stepTime = NOW_MS + (idx + 1) * 1000;
      const provBundle = makeWeatherFixture(provLoc, Number((5 + idx * 0.2).toFixed(1)));
      writeCachedWeatherBundle(provBundle, stepTime);
      writeCachedWeatherBundle(provBundle, stepTime, storage);
    }
    flushPendingClientCacheWritesSync();

    const after80Ms = NOW_MS + 90_000;

    // İlk yazılan diğer iller (ör. TR-01, 80 adım geride) L2 8-il LRU sınırından tahliye edilmiştir
    const firstNonBursaLoc: GeoLocation = {
      id: "prov-tr-01",
      name: "İl TR-01",
      provinceCode: "TR-01",
      country: "Türkiye",
      lat: 36.5,
      lon: 26.5,
      elevation: 300
    };
    expect(
      readCachedWeatherBundleSync(firstNonBursaLoc, after80Ms, { storage })
    ).toBeNull();

    // ANCAK Bursa (TR-16) hem L1 bellekten hem de tam sayfa yenilemesi sonrası L2 localStorage'dan (%100 sağlam) okunur!
    const l1BursaHit = readCachedWeatherBundleSync(DEFAULT_LOCATION, after80Ms);
    expect(l1BursaHit).not.toBeNull();
    expect(l1BursaHit?.current.temperature).toBe(11.4);
    expect(l1BursaHit?.location.name).toBe("Bursa");

    // L1 belleği sıfırlayıp (F5 simülasyonu) doğrudan L2 localStorage zarfındaki pinnedBursaEntry yuvasını doğrula
    clearClientForecastSessionForTests();
    const rawEnvelope = JSON.parse(
      storage.getItem(ATMOS_STORAGE_KEYS.bundleCache) ?? "{}"
    );
    expect(rawEnvelope.pinnedBursaEntry).toBeDefined();

    const l2BursaHit = readCachedWeatherBundleSync(DEFAULT_LOCATION, after80Ms, {
      storage
    });
    expect(l2BursaHit).not.toBeNull();
    expect(l2BursaHit?.current.temperature).toBe(11.4);
  });

  it("4. Yarışsız EpochTicket + AbortController + popstate + &pc= Query + Sıfır Hibrit Flaş ve StormScene Gökyüzü Korunumu", async () => {
    const bursaLoc: GeoLocation = {
      ...DEFAULT_LOCATION,
      provinceCode: "TR-16"
    };
    const ankaraLoc: GeoLocation = {
      id: "ankara-tr",
      name: "Ankara",
      admin1: "Ankara",
      provinceCode: "TR-06",
      country: "Türkiye",
      countryCode: "TR",
      lat: 39.9334,
      lon: 32.8597,
      elevation: 890,
      timezone: "Europe/Istanbul"
    };
    const sivasLoc: GeoLocation = {
      id: "sivas-tr",
      name: "Sivas",
      admin1: "Sivas",
      provinceCode: "TR-58",
      country: "Türkiye",
      countryCode: "TR",
      lat: 39.7437,
      lon: 37.002,
      elevation: 1285,
      timezone: "Europe/Istanbul"
    };

    // 4a. API isteklerine &pc= eklenir, ancak tarayıcı kanonik URL'sine (location-url.ts) dokunulmaz!
    expect(buildWeatherApiUrlWithProvince(ankaraLoc)).toContain("&pc=TR-06");
    expect(buildModelsApiUrlWithProvince(sivasLoc)).toContain("&pc=TR-58");
    const browserCanonicalQs = serializeLocationSearchParams(ankaraLoc);
    expect(browserCanonicalQs.get("pc")).toBeNull();
    expect(browserCanonicalQs.get("city")).toBe("Ankara");

    // 4b. Gecikmeli/sırasız ağ yanıtları için sahte ertelenmiş fetch denetleyicisi
    interface DeferredFetch {
      url: string;
      signal?: AbortSignal | null;
      resolve: (payload: WeatherBundle | MultiModelBundle) => void;
    }
    const pendingFetches: DeferredFetch[] = [];

    const mockFetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      return new Promise<Response>((resolve, reject) => {
        if (init?.signal?.aborted) {
          const abortErr = new Error("Aborted");
          abortErr.name = "AbortError";
          reject(abortErr);
          return;
        }
        pendingFetches.push({
          url,
          signal: init?.signal,
          resolve: (payload) => {
            if (init?.signal?.aborted) {
              const abortErr = new Error("Aborted");
              abortErr.name = "AbortError";
              reject(abortErr);
              return;
            }
            resolve(
              new Response(JSON.stringify(payload), {
                status: 200,
                headers: { "Content-Type": "application/json" }
              })
            );
          }
        });
      });
    }) as typeof fetch;

    // Başlangıçta Bursa fırtınalı gökyüzü (cloudCover: 92, isStorm: true, 14.2°C) aktif ve kullanıcı +18. saat / Yarın'ı inceliyor
    const bursaStormBundle = makeWeatherFixture(bursaLoc, 14.2, {
      cloudCover: 92,
      isStorm: true
    });
    const coordinator = createWeatherEpochTransitionCoordinator({
      initialLocation: bursaLoc,
      initialBundle: bursaStormBundle,
      fetchImpl: mockFetch
    });
    coordinator.setTemporalFocus(18, "2026-11-29");
    expect(coordinator.getSnapshot().frameIndex).toBe(18);
    expect(coordinator.getSnapshot().focusedDate).toBe("2026-11-29");

    // Adım 1: Kullanıcı önbellekte olmayan Ankara'ya (TR-06) geçer
    const ankaraTurn = coordinator.switchLocation(ankaraLoc);
    const snapDuringAnkaraLoad = coordinator.getSnapshot();

    // SIFIR HİBRİT FLAŞ VE ZAMAN SIFIRLAMASI:
    // - epochId = 1
    // - frameIndex -> 0 (Şimdi), focusedDate -> null
    // - bundle -> null ("Ankara başlığı altında Bursa 14.2°C" milisaniyelik bile görünmez!)
    // - StormScene karanlığa düşmemesi için atmosphere son gökyüzü durumunu (cloudCover: 92) yumuşak korur!
    expect(snapDuringAnkaraLoad.epochId).toBe(1);
    expect(snapDuringAnkaraLoad.activeLocation.provinceCode).toBe("TR-06");
    expect(snapDuringAnkaraLoad.frameIndex).toBe(0);
    expect(snapDuringAnkaraLoad.focusedDate).toBeNull();
    expect(snapDuringAnkaraLoad.bundle).toBeNull();
    expect(snapDuringAnkaraLoad.atmosphere.cloudCover).toBe(92);

    // Adım 2: Ankara henüz yanıt vermeden kullanıcı hızla Sivas'a (TR-58) geçer -> Ankara /api/weather VE /api/models ANINDA abort edilir!
    const sivasTurn = coordinator.switchLocation(sivasLoc);
    expect(ankaraTurn.ticket.weatherAbortController.signal.aborted).toBe(true);
    expect(ankaraTurn.ticket.modelsAbortController.signal.aborted).toBe(true);
    expect(coordinator.getSnapshot().epochId).toBe(2);
    expect(coordinator.getSnapshot().activeLocation.provinceCode).toBe("TR-58");

    // Adım 3: Kullanıcı tarayıcı Geri (popstate) tuşuyla Ankara URL'sine döner -> Sivas istekleri de ANINDA abort edilir (epochId = 3)!
    const ankaraPopSearch = `?${serializeLocationSearchParams(ankaraLoc).toString()}&pc=TR-06`;
    const popTurn = coordinator.handlePopStateSearch(ankaraPopSearch);
    expect(popTurn).not.toBeNull();
    expect(sivasTurn.ticket.weatherAbortController.signal.aborted).toBe(true);
    expect(sivasTurn.ticket.modelsAbortController.signal.aborted).toBe(true);
    expect(coordinator.getSnapshot().epochId).toBe(3);
    expect(coordinator.getSnapshot().activeLocation.name).toBe("Ankara");

    // Adım 4: Gecikmeli Sivas (epoch 2, -6.5°C) yanıtı ağdan gelse dahi %100 çöpe atılır!
    expect(
      isEpochResponseValidForActiveLocation({
        ticketEpochId: sivasTurn.ticket.epochId,
        currentEpochId: coordinator.getSnapshot().epochId,
        requestedLocation: sivasLoc,
        activeLocation: coordinator.getSnapshot().activeLocation,
        responseLocation: sivasLoc,
        responseProvinceCode: "TR-58"
      })
    ).toBe(false);

    const sivasPendingWeather = pendingFetches.find(
      (f) => f.url.includes("pc=TR-58") && f.url.startsWith("/api/weather")
    )!;
    sivasPendingWeather.resolve(makeWeatherFixture(sivasLoc, -6.5));
    await sivasTurn.weatherPromise;
    expect(coordinator.getSnapshot().bundle).toBeNull();

    // Adım 5: Aktif epoch (epoch 3, Ankara +4.3°C, cloudCover: 15) yanıtı döner -> kabul edilir!
    const latestAnkaraWeather = pendingFetches
      .filter((f) => f.url.startsWith("/api/weather") && f.url.includes("lat=39.9334"))
      .at(-1)!;
    latestAnkaraWeather.resolve(
      makeWeatherFixture(ankaraLoc, 4.3, { cloudCover: 15, isStorm: false })
    );
    await popTurn!.weatherPromise;

    const finalSnap = coordinator.getSnapshot();
    expect(finalSnap.bundle).not.toBeNull();
    expect(finalSnap.bundle?.current.temperature).toBe(4.3);
    expect(finalSnap.bundle?.location.name).toBe("Ankara");
    expect(finalSnap.atmosphere.cloudCover).toBe(15);

    // 4c. WeatherProvider SSR/Render koruma duvarı: initialLocation (Ankara TR-06) ile çelişen initialBundle (Bursa TR-16) asla sızmaz!
    function ProbeConsumer() {
      const { activeLocation: loc, bundle: activeB } = useWeatherData();
      return React.createElement(
        "div",
        { "data-city": loc.name },
        activeB ? `${activeB.current.temperature}` : "WAITING"
      );
    }

    const mismatchedMarkup = renderToStaticMarkup(
      React.createElement(
        WeatherProvider,
        {
          initialLocation: ankaraLoc,
          initialBundle: makeWeatherFixture(bursaLoc, 19.7)
        } as React.ComponentProps<typeof WeatherProvider>,
        React.createElement(ProbeConsumer)
      )
    );
    expect(mismatchedMarkup).toContain('data-city="Ankara"');
    expect(mismatchedMarkup).toContain("WAITING");
    expect(mismatchedMarkup).not.toContain("19.7");
  });
});
