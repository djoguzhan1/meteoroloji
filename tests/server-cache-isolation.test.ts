import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchMetarNetworkHistory,
  fetchNearestMetar,
  resetMetarCacheForTests,
  TURKEY_ICAO_WHITELIST_BY_PROVINCE,
  type RawMetarRecord
} from "../lib/metar-verify";
import { CORE_MODEL_KEYS } from "../lib/model-registry";
import {
  BoundedSingleflightCache,
  makeStrictProvinceCacheKey
} from "../lib/provinces/isolation/namespaced-cache";
import {
  TR_PLATE_NUMBERS,
  type ProvinceCode,
  type TrProvinceCode
} from "../lib/provinces/types";
import {
  evictSnapshotMemoryForTests,
  getModelsSnapshotFromDisk,
  getWeatherSnapshotFromDisk,
  resetSnapshotStoreForTests,
  resolveSnapshotVaultShardPath,
  saveModelsSnapshotToDisk,
  saveWeatherSnapshotToDisk
} from "../lib/snapshot-store";
import {
  computeSynopticCycleId,
  evictStateLedgerMemoryForTests,
  getPriorCalibratedRunsFromLedger,
  getProvinceStationHistoryFromLedger,
  getSameHour24hResidualFromLedger,
  getStationHistoryFromLedger,
  getTodayObservedExtremesFromLedger,
  makeLedgerLocationKey,
  recordProvinceStationObservationsToLedger,
  recordStationObservationsToLedger,
  recordTargetResidualToLedger,
  resetStateLedgerForTests,
  resolveLedgerShardPath,
  saveCalibratedRunToLedger
} from "../lib/state-ledger";
import { DEFAULT_LOCATION } from "../lib/weather-client";
import type {
  GeoLocation,
  MultiModelBundle,
  WeatherBundle
} from "../lib/weather-types";

function makeMinimalBundle(
  loc: GeoLocation & { provinceCode?: ProvinceCode },
  tempC: number,
  fetchedAtIso = "2026-11-28T12:00:00.000Z"
): WeatherBundle {
  return {
    location: loc,
    source: "hybrid-nwp-verified",
    fetchedAt: fetchedAtIso,
    timezone: "Europe/Istanbul",
    utcOffsetSeconds: 10800,
    current: {
      time: "2026-11-28T15:00",
      temperature: tempC,
      apparentTemperature: tempC - 0.5,
      wetBulbC: tempC - 2,
      humidity: 65,
      dewPoint: tempC - 5,
      pressure: 1016,
      pressureDelta3h: 0,
      pressureTrend: "sabit",
      pressureTrendDetail: "Sabit barometre",
      windSpeed: 10,
      windGusts: 16,
      windDirection: 45,
      beaufort: { scale: 2, label: "Hafif esinti" },
      cloudCover: 30,
      visibilityKm: 15,
      uvIndex: 2,
      uvLabel: "Düşük",
      precipitation: 0,
      precipProbability: 5,
      precipConsensus: {
        agreeingModels: 0,
        totalModels: 8,
        minMm: 0,
        medianMm: 0,
        maxMm: 0
      },
      precipType: "none",
      precipPhase: "none",
      snowLineElevationM: 2000,
      weatherCode: 1,
      condition: "Az Bulutlu",
      isDay: true,
      isStorm: false,
      stormScore: 0,
      solarElevationDeg: 25,
      daylight: 0.8,
      sunrise: "08:05",
      sunset: "17:40",
      temp850hPa: tempC - 7
    },
    airQuality: {
      europeanAqi: 20,
      categoryIndex: 1,
      label: "İyi",
      dominantPollutant: "PM2.5",
      dominantValueText: "6 µg/m³",
      pm25: 6,
      pm10: 12,
      ozone: 38,
      no2: 9,
      so2: 2,
      dust: 2
    },
    hourly: [],
    daily: [],
    sounding: [],
    hourlySoundings: [],
    nativeConvective: {
      cape: 0,
      cin: 0,
      liftedIndex: 4,
      freezingLevelM: 2200,
      lightningPotential: 0
    },
    hybrid: {
      engineVersion: "ATMOS-Core v5.0",
      activeModels: ["ECMWF IFS", "ECMWF AIFS"],
      ensembleMembers: 212,
      confidencePct: 95,
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
          ecmwfIfs: 10,
          ecmwfAifs: 10,
          icon: 10,
          ukmo: 10,
          gfs: 10
        },
        temp850hPa: {
          ecmwfIfs: tempC - 7,
          ecmwfAifs: tempC - 7,
          icon: tempC - 7,
          ukmo: tempC - 7,
          gfs: tempC - 7
        },
        precipitation: {
          ecmwfIfs: 0,
          ecmwfAifs: 0,
          icon: 0,
          ukmo: 0,
          gfs: 0
        }
      },
      verification: {
        mode: "live-mgm-mesh",
        station: null,
        matchedHours: 24,
        winners: {
          temperature: "ecmwfAifs",
          pressure: "ecmwfIfs",
          wind: "icon",
          precipitation: "ecmwfAifs"
        },
        rows: []
      },
      attributions: []
    }
  };
}

function makeMinimalModels(
  lat: number,
  lon: number,
  tempC: number,
  elevation?: number,
  name?: string
): MultiModelBundle {
  const zeroSummary = Object.fromEntries(
    CORE_MODEL_KEYS.map((k) => [k, 0])
  ) as Record<(typeof CORE_MODEL_KEYS)[number], number>;
  return {
    fetchedAt: "2026-11-28T12:00:00.000Z",
    lat,
    lon,
    elevation,
    name,
    utcOffsetSeconds: 10800,
    temp2m: [
      {
        time: "2026-11-28T15:00",
        hourLabel: "15:00",
        dayLabel: "Bugün",
        ecmwfIfs: tempC,
        ecmwfAifs: tempC,
        icon: tempC,
        ukmo: tempC,
        meteofrance: tempC,
        gfs: tempC,
        gem: tempC,
        jma: tempC
      }
    ],
    temp850: [],
    precip: [],
    wind10m: [],
    summary: {
      precip72h: zeroSummary,
      precip168h: zeroSummary,
      maxSpreadTemp2m: 0,
      min850hPa: zeroSummary
    }
  };
}

describe("ARC-02 — İl-Bölümlü Sunucu Önbellekleri, .data/bursa-tr16 Disk Kasası ve LT** METAR Güvenlik Duvarı", () => {
  let tmpDataDir: string;

  beforeEach(() => {
    delete process.env.ATMOS_SNAPSHOT_PATH;
    delete process.env.ATMOS_LEDGER_PATH;
    tmpDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "atmos-test-arc02-"));
    process.env.ATMOS_DATA_DIR = tmpDataDir;
    resetSnapshotStoreForTests();
    resetStateLedgerForTests();
    resetMetarCacheForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetSnapshotStoreForTests();
    resetStateLedgerForTests();
    resetMetarCacheForTests();
    delete process.env.ATMOS_DATA_DIR;
    try {
      fs.rmSync(tmpDataDir, { recursive: true, force: true });
    } catch {
      // ignore temp cleanup error
    }
  });

  it("BoundedSingleflightCache TR-16 haritasını sabitler (0% eviction), singleflight birleştirir ve structuredClone ile yerinde mutasyonu engeller", async () => {
    const cache = new BoundedSingleflightCache<{ temps: number[]; label: string }>({
      maxEntriesPerProvince: 4,
      bursaMaxEntries: 16,
      maxTotalNonPinnedEntries: 20
    });

    const bursaKey = makeStrictProvinceCacheKey({
      provinceCode: "TR-16",
      locationId: "bursa-tr",
      lat: 40.2308,
      lon: 29.0133,
      elevationM: 100
    });
    expect(bursaKey).toBe("TR-16:bursa-tr:40.2308,29.0133:e100");

    const sourceObj = { temps: [14.2, 11.8, 9.4], label: "Bursa Osmangazi" };
    cache.set("TR-16", bursaKey, sourceObj);
    // Mutating caller's input after set() MUST NOT touch cached copy
    sourceObj.temps.sort((a, b) => a - b);
    sourceObj.temps.push(999);

    // Flood all other 80 provinces (320 entries >> maxTotalNonPinnedEntries = 20)
    for (const plate of TR_PLATE_NUMBERS) {
      if (plate === "16") continue;
      const pc = `TR-${plate}` as TrProvinceCode;
      for (let d = 0; d < 4; d++) {
        const k = makeStrictProvinceCacheKey({
          provinceCode: pc,
          locationId: `dist-${d}`,
          lat: 39.0 + Number(plate) * 0.02,
          lon: 28.0 + d * 0.05,
          elevationM: 120
        });
        cache.set(pc, k, { temps: [10 + d], label: `${pc}-${d}` });
      }
    }

    // Bursa TR-16 MUST remain 100% un-evicted and un-mutated!
    const read1 = cache.get("TR-16", bursaKey);
    expect(read1).not.toBeNull();
    expect(read1!.temps).toEqual([14.2, 11.8, 9.4]);

    // Mutating read1 in-place MUST NOT poison read2!
    read1!.temps.sort((a, b) => a - b);
    read1!.label = "CORRUPTED";
    const read2 = cache.get("TR-16", bursaKey);
    expect(read2!.temps).toEqual([14.2, 11.8, 9.4]);
    expect(read2!.label).toBe("Bursa Osmangazi");

    // Concurrent millisecond singleflight burst for TR-16 vs TR-77
    let tr16FetchCalls = 0;
    let tr77FetchCalls = 0;
    const yalovaKey = makeStrictProvinceCacheKey({
      provinceCode: "TR-77",
      locationId: "yalova-merkez",
      lat: 40.655,
      lon: 29.2769,
      elevationM: 8
    });
    const gemlikKey = makeStrictProvinceCacheKey({
      provinceCode: "TR-16",
      locationId: "bursa-gemlik",
      lat: 40.4325,
      lon: 29.1564,
      elevationM: 15
    });

    const [b1, b2, y1, y2] = await Promise.all([
      cache.getOrFetch("TR-16", gemlikKey, async () => {
        tr16FetchCalls++;
        await new Promise((r) => setTimeout(r, 15));
        return { temps: [13.5, 12.1], label: "Gemlik" };
      }),
      cache.getOrFetch("TR-16", gemlikKey, async () => {
        tr16FetchCalls++;
        return { temps: [99], label: "ShouldNotRun" };
      }),
      cache.getOrFetch("TR-77", yalovaKey, async () => {
        tr77FetchCalls++;
        await new Promise((r) => setTimeout(r, 15));
        return { temps: [15.1, 14.0], label: "Yalova" };
      }),
      cache.getOrFetch("TR-77", yalovaKey, async () => {
        tr77FetchCalls++;
        return { temps: [-99], label: "ShouldNotRun" };
      })
    ]);

    expect(tr16FetchCalls).toBe(1);
    expect(tr77FetchCalls).toBe(1);
    b1.temps.push(888);
    expect(b2.temps).toEqual([13.5, 12.1]);
    expect(y1.label).toBe("Yalova");
    expect(y2.temps).toEqual([15.1, 14.0]);
  });

  it("80 ilin tamamına arka arkaya snapshot yazıldığında .data/bursa-tr16/snapshots.json kaydı %100 dokunulmaz kalır (0% eviction)", () => {
    const nowMs = Date.parse("2026-11-28T12:00:00.000Z");

    // 1. Persist Bursa TR-16 weather + models snapshot
    const bursaBundle = makeMinimalBundle(
      { ...DEFAULT_LOCATION, provinceCode: "TR-16" },
      14.6
    );
    const bursaModels = makeMinimalModels(
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lon,
      14.6,
      DEFAULT_LOCATION.elevation,
      "Bursa"
    );
    saveWeatherSnapshotToDisk(bursaBundle, nowMs, true, {
      provinceCode: "TR-16",
      elevationM: 100
    });
    saveModelsSnapshotToDisk(bursaModels, nowMs, true, {
      provinceCode: "TR-16",
      elevationM: 100
    });

    const expectedBursaShard = path.join(tmpDataDir, "bursa-tr16", "snapshots.json");
    expect(resolveSnapshotVaultShardPath("TR-16")).toBe(expectedBursaShard);
    expect(fs.existsSync(expectedBursaShard)).toBe(true);

    // 2. Write snapshots to ALL 80 OTHER TURKISH PROVINCES + GLOBAL (81 shards >> MAX_WEATHER_LOCATIONS = 24!)
    for (const plate of TR_PLATE_NUMBERS) {
      if (plate === "16") continue;
      const pc = `TR-${plate}` as TrProvinceCode;
      const pNum = Number(plate);
      const lat = Number((36.5 + (pNum % 15) * 0.32).toFixed(4));
      const lon = Number((26.5 + Math.floor(pNum / 5) * 0.95).toFixed(4));
      const bundle = makeMinimalBundle(
        {
          id: `prov-${pc.toLowerCase()}`,
          name: `İl ${pc}`,
          country: "Türkiye",
          countryCode: "TR",
          lat,
          lon,
          elevation: 250,
          provinceCode: pc
        },
        10 + (pNum % 12)
      );
      saveWeatherSnapshotToDisk(bundle, nowMs + pNum * 1000, true, {
        provinceCode: pc,
        elevationM: 250
      });
      saveModelsSnapshotToDisk(
        makeMinimalModels(lat, lon, 10 + (pNum % 12), 250, `İl ${pc}`),
        nowMs + pNum * 1000,
        true,
        { provinceCode: pc, elevationM: 250 }
      );
      expect(
        fs.existsSync(path.join(tmpDataDir, "provinces", pc, "snapshots.json"))
      ).toBe(true);
    }

    // Write GLOBAL shard too
    saveWeatherSnapshotToDisk(
      makeMinimalBundle(
        {
          id: "london-gb",
          name: "Londra",
          country: "Birleşik Krallık",
          countryCode: "GB",
          lat: 51.5072,
          lon: -0.1276,
          elevation: 24,
          provinceCode: "GLOBAL"
        },
        8.1
      ),
      nowMs + 100_000,
      true,
      { provinceCode: "GLOBAL", elevationM: 24 }
    );
    expect(fs.existsSync(path.join(tmpDataDir, "global", "snapshots.json"))).toBe(true);

    // 3. Simulate cold Node.js restart and verify Bursa TR-16 is 100% intact (0% eviction!)
    evictSnapshotMemoryForTests();

    const recoveredBursa = getWeatherSnapshotFromDisk(
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lon,
      nowMs + 120_000,
      { provinceCode: "TR-16", elevationM: 100 }
    );
    expect(recoveredBursa).not.toBeNull();
    expect(recoveredBursa!.bundle.location.name).toBe("Bursa");
    expect(recoveredBursa!.bundle.current.temperature).toBe(14.6);

    const recoveredBursaModels = getModelsSnapshotFromDisk(
      DEFAULT_LOCATION.lat,
      DEFAULT_LOCATION.lon,
      nowMs + 120_000,
      { provinceCode: "TR-16", elevationM: 100 }
    );
    expect(recoveredBursaModels).not.toBeNull();
    expect(recoveredBursaModels!.models.temp2m[0].ecmwfIfs).toBe(14.6);
  });

  it("Tuzla (TR-34) ile Çayırova (TR-41) (Δ ≈ 1.4 km) ve 155m ova ile 1230m dağ arasında snapshot ve ledger sızıntısı %0.00'dır", () => {
    const nowMs = Date.parse("2026-11-28T12:00:00.000Z");

    // 1. Border Collision Test: Çayırova (Kocaeli TR-41) vs Tuzla-Şifa (İstanbul TR-34) (~1.4 km apart!)
    const cayirovaLoc = {
      id: "kocaeli-cayirova-tr",
      name: "Çayırova",
      admin1: "Kocaeli",
      country: "Türkiye",
      countryCode: "TR",
      lat: 40.8242,
      lon: 29.3641, // rounds to 40.82, 29.36!
      elevation: 55,
      provinceCode: "TR-41" as const
    };
    const tuzlaLoc = {
      id: "istanbul-tuzla-tr",
      name: "Tuzla",
      admin1: "İstanbul",
      country: "Türkiye",
      countryCode: "TR",
      lat: 40.8214,
      lon: 29.3558, // ALSO rounds to 40.82, 29.36 (~0.75 km away)!
      elevation: 42,
      provinceCode: "TR-34" as const
    };

    saveWeatherSnapshotToDisk(makeMinimalBundle(cayirovaLoc, 9.1), nowMs, true, {
      provinceCode: "TR-41",
      elevationM: 55
    });
    saveModelsSnapshotToDisk(
      makeMinimalModels(cayirovaLoc.lat, cayirovaLoc.lon, 9.1, 55, "Çayırova"),
      nowMs,
      true,
      { provinceCode: "TR-41", elevationM: 55 }
    );

    // Tuzla (TR-34) MUST NOT receive Çayırova's (TR-41) snapshot despite <1.5 km distance & identical toFixed(2)!
    expect(
      getWeatherSnapshotFromDisk(tuzlaLoc.lat, tuzlaLoc.lon, nowMs + 5000, {
        provinceCode: "TR-34",
        elevationM: 42
      })
    ).toBeNull();
    expect(
      getModelsSnapshotFromDisk(tuzlaLoc.lat, tuzlaLoc.lon, nowMs + 5000, {
        provinceCode: "TR-34",
        elevationM: 42
      })
    ).toBeNull();

    // Ledger isolation between Tuzla (TR-34) and Çayırova (TR-41)
    const cayirovaLedgerKey = makeLedgerLocationKey(cayirovaLoc.lat, cayirovaLoc.lon, {
      provinceCode: "TR-41",
      elevationM: 55
    });
    const tuzlaLedgerKey = makeLedgerLocationKey(tuzlaLoc.lat, tuzlaLoc.lon, {
      provinceCode: "TR-34",
      elevationM: 42
    });
    expect(cayirovaLedgerKey).not.toBe(tuzlaLedgerKey);

    recordTargetResidualToLedger(
      {
        locKey: cayirovaLedgerKey,
        utcHourKey: "2026-11-27T12:00",
        localDateYmd: "2026-11-27",
        localHour: 15,
        observedAtMs: nowMs - 24 * 3600_000,
        observedTempC: 7.2,
        emosBaseTempC: 9.0,
        residualC: -1.8,
        regime: "POYRAZ_KARAYEL_ADV",
        precipMmHr: 2.5
      },
      true
    );
    saveCalibratedRunToLedger(
      cayirovaLedgerKey,
      {
        cycleId: computeSynopticCycleId(nowMs - 6 * 3600_000),
        createdAtMs: nowMs - 6 * 3600_000,
        regime: "POYRAZ_KARAYEL_ADV",
        hours: {
          "2026-11-29T12:00": { tempC: 8.4, isWet: true, precipMmHr: 3.1, popPct: 82 }
        }
      },
      true
    );

    expect(
      getSameHour24hResidualFromLedger({
        locKey: tuzlaLedgerKey,
        targetUtcMs: nowMs,
        currentRegime: "POYRAZ_KARAYEL_ADV"
      })
    ).toBeNull();
    expect(
      getPriorCalibratedRunsFromLedger(tuzlaLedgerKey, computeSynopticCycleId(nowMs))
    ).toEqual([]);
    expect(getTodayObservedExtremesFromLedger(tuzlaLedgerKey, "2026-11-27").minTempC).toBeNull();

    // 2. Elevation Collision Test within TR-16: 155m Osmangazi Foothill vs 1230m Uludağ Mountain Slope
    const ova155Loc = {
      id: "bursa-osmangazi-etek-tr",
      name: "Osmangazi Etek",
      admin1: "Bursa",
      country: "Türkiye",
      countryCode: "TR",
      lat: 40.1885,
      lon: 29.061,
      elevation: 155,
      provinceCode: "TR-16" as const
    };
    const mtn1230Loc = {
      id: "bursa-kadiyayla-tr",
      name: "Uludağ Kadıyayla",
      admin1: "Bursa",
      country: "Türkiye",
      countryCode: "TR",
      lat: 40.155, // Δlat = 0.0335° <= 0.05°, Δlon = 0.024° <= 0.05°!
      lon: 29.085,
      elevation: 1230,
      provinceCode: "TR-16" as const
    };

    saveWeatherSnapshotToDisk(makeMinimalBundle(mtn1230Loc, -2.8), nowMs, true, {
      provinceCode: "TR-16",
      elevationM: 1230
    });
    saveModelsSnapshotToDisk(
      makeMinimalModels(mtn1230Loc.lat, mtn1230Loc.lon, -2.8, 1230, "Kadıyayla"),
      nowMs,
      true,
      { provinceCode: "TR-16", elevationM: 1230 }
    );

    // Querying 155m Ova MUST NOT receive 1230m mountain (-2.8°C) snapshot!
    expect(
      getWeatherSnapshotFromDisk(ova155Loc.lat, ova155Loc.lon, nowMs + 5000, {
        provinceCode: "TR-16",
        elevationM: 155
      })
    ).toBeNull();
    expect(
      getModelsSnapshotFromDisk(ova155Loc.lat, ova155Loc.lon, nowMs + 5000, {
        provinceCode: "TR-16",
        elevationM: 155
      })
    ).toBeNull();

    const mtnLedgerKey = makeLedgerLocationKey(mtn1230Loc.lat, mtn1230Loc.lon, {
      provinceCode: "TR-16",
      elevationM: 1230
    });
    const ovaLedgerKey = makeLedgerLocationKey(ova155Loc.lat, ova155Loc.lon, {
      provinceCode: "TR-16",
      elevationM: 155
    });
    recordTargetResidualToLedger(
      {
        locKey: mtnLedgerKey,
        utcHourKey: "2026-11-28T06:00",
        localDateYmd: "2026-11-28",
        localHour: 9,
        observedAtMs: nowMs - 6 * 3600_000,
        observedTempC: -3.4,
        emosBaseTempC: -2.0,
        residualC: -1.4,
        regime: "POYRAZ_KARAYEL_ADV",
        precipMmHr: 4.0
      },
      true
    );
    expect(getTodayObservedExtremesFromLedger(ovaLedgerKey, "2026-11-28").minTempC).toBeNull();

    // 3. Bursa parameterless ledger filters out LTFJ/LTBG/Yalova & separates provincial station ledgers
    recordStationObservationsToLedger(
      [
        {
          stationId: "WMO_17116",
          utcHourKey: "2026-11-28T11:00",
          observedAtMs: nowMs - 3600_000,
          lat: 40.2308,
          lon: 29.0133,
          elevationM: 100,
          tempC: 14.1,
          dewPointC: 6.2,
          pressureMslHpa: 1017,
          windSpeedKmh: 9,
          windDirDeg: 40,
          precipMmHr: 0,
          hasPrecip: false
        },
        {
          stationId: "LTFJ",
          utcHourKey: "2026-11-28T11:00",
          observedAtMs: nowMs - 3600_000,
          lat: 40.8986,
          lon: 29.3092,
          elevationM: 95,
          tempC: 11.0,
          dewPointC: 5.0,
          pressureMslHpa: 1018,
          windSpeedKmh: 22,
          windDirDeg: 30,
          precipMmHr: 0,
          hasPrecip: false
        },
        {
          stationId: "LTBG",
          utcHourKey: "2026-11-28T11:00",
          observedAtMs: nowMs - 3600_000,
          lat: 40.318,
          lon: 27.9777,
          elevationM: 52,
          tempC: 12.5,
          dewPointC: 8.0,
          pressureMslHpa: 1017,
          windSpeedKmh: 18,
          windDirDeg: 20,
          precipMmHr: 0,
          hasPrecip: false
        }
      ],
      true
    );

    recordProvinceStationObservationsToLedger(
      "TR-77",
      [
        {
          stationId: "MGM_17119_YALOVA",
          utcHourKey: "2026-11-28T11:00",
          observedAtMs: nowMs - 3600_000,
          lat: 40.655,
          lon: 29.2769,
          elevationM: 4,
          tempC: 15.8,
          dewPointC: 9.4,
          pressureMslHpa: 1016,
          windSpeedKmh: 14,
          windDirDeg: 45,
          precipMmHr: 0,
          hasPrecip: false
        }
      ],
      true
    );

    expect(fs.existsSync(resolveLedgerShardPath("TR-16"))).toBe(true);
    expect(fs.existsSync(resolveLedgerShardPath("TR-77"))).toBe(true);

    evictStateLedgerMemoryForTests();

    const bursaStations = getStationHistoryFromLedger(undefined, 48, nowMs);
    expect(bursaStations.map((s) => s.stationId)).toEqual(["WMO_17116"]);

    const yalovaStations = getProvinceStationHistoryFromLedger("TR-77", 48, nowMs);
    expect(yalovaStations.map((s) => s.stationId)).toEqual(["MGM_17119_YALOVA"]);
  });

  it("Yalova (TR-77), Edirne (TR-22), İzmir (TR-35) ve Artvin (TR-08) sorgularında Yunanistan/Gürcistan veya İstanbul (LTFJ) METAR'ları kesinlikle dönmez", async () => {
    // 1. Validate 81-province whitelist completeness, ^LT[A-Z]{2}$ purity, and disjointness
    expect(Object.keys(TURKEY_ICAO_WHITELIST_BY_PROVINCE)).toHaveLength(81);
    const seenIcaos = new Set<string>();
    for (const plate of TR_PLATE_NUMBERS) {
      const pc = `TR-${plate}` as TrProvinceCode;
      const list = TURKEY_ICAO_WHITELIST_BY_PROVINCE[pc];
      expect(Array.isArray(list)).toBe(true);
      for (const icao of list) {
        expect(icao).toMatch(/^LT[A-Z]{2}$/);
        expect(seenIcaos.has(icao)).toBe(false);
        seenIcaos.add(icao);
      }
    }
    expect(TURKEY_ICAO_WHITELIST_BY_PROVINCE["TR-16"]).toEqual(["LTBR"]);
    expect(TURKEY_ICAO_WHITELIST_BY_PROVINCE["TR-77"]).toEqual([]);
    expect(TURKEY_ICAO_WHITELIST_BY_PROVINCE["TR-22"]).toEqual([]);
    expect(TURKEY_ICAO_WHITELIST_BY_PROVINCE["TR-08"]).toEqual([]);

    const nowMs = Date.parse("2026-11-28T12:00:00.000Z");
    const baseSec = Math.floor(nowMs / 1000) - 900; // 15 min ago
    const calledUrls: string[] = [];

    // Adversarial mock: tries to sneak in Greek islands (LGSM, LGHI, LGAL), Batum (UGSB), and Istanbul (LTFJ)!
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;
        calledUrls.push(url);

        const mkSeries = (
          icaoId: string,
          lat: number,
          lon: number,
          temp: number
        ): RawMetarRecord[] =>
          [0, 1, 2, 3].map((h) => ({
            icaoId,
            name: icaoId,
            lat,
            lon,
            elev: 30,
            obsTime: baseSec - h * 3600,
            rawOb: `METAR ${icaoId}`,
            temp,
            dewp: temp - 4,
            wspd: 8,
            altim: 1016
          }));

        const adversarialPayload: RawMetarRecord[] = [
          ...mkSeries("LTBJ", 38.2924, 27.157, 17.4), // İzmir Adnan Menderes (valid TR-35)
          ...mkSeries("LGHI", 38.3432, 26.1406, 18.9), // Chios, Greece (!LT** -> MUST BLOCK)
          ...mkSeries("LGSM", 37.69, 26.9117, 19.2), // Samos, Greece (!LT** -> MUST BLOCK)
          ...mkSeries("LGAL", 40.8559, 25.9563, 12.0), // Alexandroupoli, Greece (!LT** -> MUST BLOCK)
          ...mkSeries("UGSB", 41.6103, 41.5997, 14.5), // Batumi, Georgia (!LT** -> MUST BLOCK)
          ...mkSeries("LTFJ", 40.8986, 29.3092, 11.2), // Sabiha Gökçen (TR-34 -> MUST BLOCK for TR-35/TR-16/TR-77)
          ...mkSeries("LTFE", 37.2506, 27.6643, 18.1) // Milas-Bodrum (TR-48 -> MUST BLOCK for TR-35)
        ];

        return new Response(JSON.stringify(adversarialPayload), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      })
    );

    // 2. Airportless / border provinces MUST return [] and issue ZERO network requests!
    const yalovaMetars = await fetchMetarNetworkHistory(40.655, 29.2769, 4, 85, {
      provinceCode: "TR-77",
      nowMs
    });
    const edirneMetars = await fetchMetarNetworkHistory(41.6771, 26.5557, 4, 85, {
      provinceCode: "TR-22",
      nowMs
    });
    const artvinMetars = await fetchMetarNetworkHistory(41.1828, 41.8183, 4, 85, {
      provinceCode: "TR-08",
      nowMs
    });
    const yalovaNearest = await fetchNearestMetar(40.655, 29.2769, 85, {
      provinceCode: "TR-77",
      nowMs
    });

    expect(yalovaMetars).toEqual([]);
    expect(edirneMetars).toEqual([]);
    expect(artvinMetars).toEqual([]);
    expect(yalovaNearest).toBeNull();
    expect(calledUrls).toHaveLength(0);

    // 3. İzmir Çeşme (38.323, 26.303 — only 14 km from Greek island Chios LGHI, 75 km from LTBJ):
    //    MUST NOT send `bbox=`, MUST query `ids=LTBJ%2CLTBL`, and MUST filter out LGHI/LGSM/LTFJ/LTFE!
    const izmirCesmeMetars = await fetchMetarNetworkHistory(38.323, 26.303, 4, 85, {
      provinceCode: "TR-35",
      nowMs
    });
    expect(calledUrls).toHaveLength(1);
    expect(calledUrls[0]).not.toContain("bbox=");
    expect(decodeURIComponent(calledUrls[0])).toContain("ids=LTBJ,LTBL");
    expect(izmirCesmeMetars.map((s) => s.station.icaoId)).toEqual(["LTBJ"]);
    expect(izmirCesmeMetars[0].station.distanceKm).toBeGreaterThan(65);
    expect(izmirCesmeMetars[0].station.ageMinutes).toBe(15);

    // 4. Second query inside TR-35 right next to LTBJ (Gaziemir: 38.32, 27.13) 20 minutes later:
    //    Hits TR-35 cache (still 1 fetch call!) AND dynamically recomputes fresh distanceKm (~3.8 km) & ageMinutes (35 min)!
    const izmirGaziemirMetars = await fetchMetarNetworkHistory(
      38.32,
      27.13,
      4,
      85,
      {
        provinceCode: "TR-35",
        nowMs: nowMs + 20 * 60_000
      }
    );
    expect(calledUrls).toHaveLength(1);
    expect(izmirGaziemirMetars[0].station.icaoId).toBe("LTBJ");
    expect(izmirGaziemirMetars[0].station.distanceKm).toBeLessThan(6);
    expect(izmirGaziemirMetars[0].station.ageMinutes).toBe(35);
  });
});
