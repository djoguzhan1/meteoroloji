import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  clearClientForecastSessionForTests,
  flushPendingClientCacheWritesSync,
  readCachedWeatherBundleSync,
  writeCachedWeatherBundle
} from "@/lib/client-forecast-cache";
import {
  getAllowedTurkeyIcaosForProvince,
  isIcaoAllowedForProvince,
  TURKEY_ICAO_WHITELIST_BY_PROVINCE
} from "@/lib/metar-verify";
import {
  sanitizeBursaMeshToStrictTr16,
  verifyBursaImmutabilityManifest
} from "@/lib/provinces/bursa-vault-guard";
import { TR_NATIONAL_CATALOG } from "@/lib/provinces/catalog-1102";
import { solveProvinceTopographicSurface } from "@/lib/provinces/engine/province-cressman";
import { resolveProvinceCode } from "@/lib/provinces/geo-adm1-resolver";
import {
  BoundedSingleflightCache,
  makeStrictProvinceCacheKey
} from "@/lib/provinces/isolation/namespaced-cache";
import {
  CROSS_PROVINCE_PROXY_MERKEZ_IDS,
  isMgmStationOwnedByProvince
} from "@/lib/provinces/mgm-dem-repair";
import {
  loadProvinceCalibration,
  loadProvinceSpec,
  NON_BURSA_PROVINCE_CODES
} from "@/lib/provinces/registry";
import type { ProvinceCode, TrProvinceCode } from "@/lib/provinces/types";
import { evaluateSeaEffectSnow } from "@/lib/snow-and-lightning-engine";
import { DEFAULT_LOCATION } from "@/lib/weather-client";
import type { GeoLocation, WeatherBundle } from "@/lib/weather-types";

const REPO_ROOT = path.resolve(__dirname, "..");

function walkCodeFiles(dirRel: string): string[] {
  const absDir = path.join(REPO_ROOT, dirRel);
  if (!fs.existsSync(absDir)) return [];
  const out: string[] = [];
  for (const ent of fs.readdirSync(absDir, { withFileTypes: true })) {
    const full = path.join(absDir, ent.name);
    if (ent.isDirectory()) {
      out.push(...walkCodeFiles(path.join(dirRel, ent.name)));
    } else if (/\.(ts|tsx|js|mjs)$/.test(ent.name)) {
      out.push(full);
    }
  }
  return out;
}

function makeTestBundleForLocation(loc: GeoLocation, tempC: number): WeatherBundle {
  return {
    location: { ...loc },
    source: "open-meteo-8model",
    fetchedAt: "2026-11-28T12:00:00.000Z",
    utcOffsetSeconds: 10800,
    current: {
      time: "2026-11-28T12:00",
      temperature: tempC,
      apparentTemperature: tempC - 1,
      humidity: 62,
      dewPoint: tempC - 6,
      windSpeed: 14,
      windGusts: 22,
      windDir: 40,
      pressure: 1016,
      surfacePressure: 1004,
      cloudCover: 35,
      visibility: 10000,
      uvIndex: 2,
      precip: 0,
      isDay: true,
      wmoCode: 1,
      conditionTr: "Az Bulutlu",
      precipType: "none"
    },
    hourly: [],
    hourlySoundings: [],
    daily: [],
    minutely15: [],
    airQuality: {
      europeanAqi: 24,
      pm25: 7,
      pm10: 14,
      no2: 11,
      o3: 48,
      so2: 2,
      dust: 4,
      uvIndex: 2,
      label: "İyi",
      color: "#10b981"
    },
    storm: {
      score: 6,
      level: "calm",
      headlineTr: "Sakin atmosfer",
      factors: [],
      cape: 40,
      liftedIndex: 3,
      cin: -10,
      shear06kmKmh: 12,
      precipitableWaterMm: 14,
      freezingLevelM: 2200
    },
    hybrid: {
      activeModelCount: 8,
      activeModels: ["ecmwf_ifs025", "gfs_global"],
      consensusConfidencePct: 92,
      modelSpreadTempC: 0.8,
      kalmanBiasTempC: 0,
      verification: {
        verifiedHours: 24,
        stations: []
      },
      modelAccuracy: [],
      attributions: [],
      engineMeta: {
        provinceCode: loc.provinceCode ?? "GLOBAL",
        calibrationTier:
          loc.provinceCode === "TR-16"
            ? "BURSA_FROZEN_V5"
            : loc.provinceCode
              ? "TIER_A_EMPIRICAL_WMO"
              : "GLOBAL"
      }
    },
    provinceSummary: loc.provinceCode
      ? {
          provinceCode: loc.provinceCode as TrProvinceCode,
          plateNumber: loc.provinceCode.slice(3),
          provinceName: loc.admin1 ?? loc.name,
          calibrationTier: loc.provinceCode === "TR-16" ? "TIER_0_BURSA" : "TIER_A_WMO",
          cumulusStageId: loc.provinceCode === "TR-34" ? "bogaz" : "marmara",
          activeWaterBodies: [],
          curatedSubLocations: [],
          mgmMeshStationCount: 12,
          metarIcaos: getAllowedTurkeyIcaosForProvince(loc.provinceCode as TrProvinceCode)
        }
      : undefined
  } as unknown as WeatherBundle;
}

describe("Wave 7 Red-Team Chaos, Concurrency & 0.00% Cross-City Leakage Gate (RED-01..05)", () => {
  it("RED-01: Simultaneous multi-province & border-pair chaos burst yields 0.00% cache, METAR, MGM, Cressman, or DEK cross-contamination", async () => {
    clearClientForecastSessionForTests();

    const borderChaosPairs: ReadonlyArray<{
      a: GeoLocation;
      b: GeoLocation;
      tempA: number;
      tempB: number;
    }> = [
      {
        a: {
          id: "tr-16-orhangazi",
          name: "Orhangazi",
          lat: 40.4892,
          lon: 29.3089,
          elevation: 125,
          country: "Türkiye",
          countryCode: "TR",
          admin1: "Bursa",
          timezone: "Europe/Istanbul",
          provinceCode: "TR-16"
        },
        b: {
          id: "tr-77-merkez",
          name: "Yalova",
          lat: 40.655,
          lon: 29.2769,
          elevation: 4,
          country: "Türkiye",
          countryCode: "TR",
          admin1: "Yalova",
          timezone: "Europe/Istanbul",
          provinceCode: "TR-77"
        },
        tempA: 11.4,
        tempB: 15.8
      },
      {
        a: {
          id: "tr-34-tuzla",
          name: "Tuzla",
          lat: 40.8161,
          lon: 29.3022,
          elevation: 18,
          country: "Türkiye",
          countryCode: "TR",
          admin1: "İstanbul",
          timezone: "Europe/Istanbul",
          provinceCode: "TR-34"
        },
        b: {
          id: "tr-41-gebze",
          name: "Gebze",
          lat: 40.8028,
          lon: 29.4307,
          elevation: 182,
          country: "Türkiye",
          countryCode: "TR",
          admin1: "Kocaeli",
          timezone: "Europe/Istanbul",
          provinceCode: "TR-41"
        },
        tempA: 14.2,
        tempB: 12.1
      },
      {
        a: {
          id: "tr-11-merkez",
          name: "Bilecik",
          lat: 40.1414,
          lon: 29.9772,
          elevation: 539,
          country: "Türkiye",
          countryCode: "TR",
          admin1: "Bilecik",
          timezone: "Europe/Istanbul",
          provinceCode: "TR-11"
        },
        b: {
          id: "tr-26-merkez",
          name: "Eskişehir",
          lat: 39.7656,
          lon: 30.5502,
          elevation: 801,
          country: "Türkiye",
          countryCode: "TR",
          admin1: "Eskişehir",
          timezone: "Europe/Istanbul",
          provinceCode: "TR-26"
        },
        tempA: 8.7,
        tempB: 3.2
      },
      {
        a: {
          id: "tr-01-merkez",
          name: "Adana",
          lat: 36.9914,
          lon: 35.3308,
          elevation: 23,
          country: "Türkiye",
          countryCode: "TR",
          admin1: "Adana",
          timezone: "Europe/Istanbul",
          provinceCode: "TR-01"
        },
        b: {
          id: "tr-33-merkez",
          name: "Mersin",
          lat: 36.8121,
          lon: 34.6415,
          elevation: 7,
          country: "Türkiye",
          countryCode: "TR",
          admin1: "Mersin",
          timezone: "Europe/Istanbul",
          provinceCode: "TR-33"
        },
        tempA: 21.6,
        tempB: 22.9
      },
      {
        a: {
          id: "tr-25-merkez",
          name: "Erzurum",
          lat: 39.9058,
          lon: 41.2544,
          elevation: 1860,
          country: "Türkiye",
          countryCode: "TR",
          admin1: "Erzurum",
          timezone: "Europe/Istanbul",
          provinceCode: "TR-25"
        },
        b: {
          id: "tr-08-merkez",
          name: "Artvin",
          lat: 41.1828,
          lon: 41.8183,
          elevation: 613,
          country: "Türkiye",
          countryCode: "TR",
          admin1: "Artvin",
          timezone: "Europe/Istanbul",
          provinceCode: "TR-08"
        },
        tempA: -18.4,
        tempB: 7.3
      },
      {
        a: {
          id: "tr-65-merkez",
          name: "Van",
          lat: 38.4942,
          lon: 43.38,
          elevation: 1675,
          country: "Türkiye",
          countryCode: "TR",
          admin1: "Van",
          timezone: "Europe/Istanbul",
          provinceCode: "TR-65"
        },
        b: {
          id: "tr-04-merkez",
          name: "Ağrı",
          lat: 39.7191,
          lon: 43.0503,
          elevation: 1632,
          country: "Türkiye",
          countryCode: "TR",
          admin1: "Ağrı",
          timezone: "Europe/Istanbul",
          provinceCode: "TR-04"
        },
        tempA: -2.1,
        tempB: -24.6
      }
    ];

    const serverCache = new BoundedSingleflightCache<WeatherBundle>({
      maxEntriesPerProvince: 8,
      maxTotalNonPinnedEntries: 32,
      defaultTtlMs: 600_000
    });

    await Promise.all(
      borderChaosPairs.flatMap((pair) => [
        (async () => {
          const pcA = (pair.a.provinceCode ?? "GLOBAL") as ProvinceCode;
          const bA = makeTestBundleForLocation(pair.a, pair.tempA);
          writeCachedWeatherBundle(bA);
          const keyA = makeStrictProvinceCacheKey({
            provinceCode: pcA,
            locationId: pair.a.id,
            lat: pair.a.lat,
            lon: pair.a.lon,
            elevationM: pair.a.elevation
          });
          serverCache.set(pcA, keyA, bA);
        })(),
        (async () => {
          const pcB = (pair.b.provinceCode ?? "GLOBAL") as ProvinceCode;
          const bB = makeTestBundleForLocation(pair.b, pair.tempB);
          writeCachedWeatherBundle(bB);
          const keyB = makeStrictProvinceCacheKey({
            provinceCode: pcB,
            locationId: pair.b.id,
            lat: pair.b.lat,
            lon: pair.b.lon,
            elevationM: pair.b.elevation
          });
          serverCache.set(pcB, keyB, bB);
        })()
      ])
    );

    const bursaLoc: GeoLocation = { ...DEFAULT_LOCATION, provinceCode: "TR-16" };
    const canonicalBursaBundle = makeTestBundleForLocation(bursaLoc, 13.5);
    writeCachedWeatherBundle(canonicalBursaBundle);
    const bursaKey = makeStrictProvinceCacheKey({
      provinceCode: "TR-16",
      locationId: bursaLoc.id,
      lat: bursaLoc.lat,
      lon: bursaLoc.lon,
      elevationM: bursaLoc.elevation
    });
    serverCache.set("TR-16", bursaKey, canonicalBursaBundle);
    flushPendingClientCacheWritesSync();

    for (const pair of borderChaosPairs) {
      const hitA = readCachedWeatherBundleSync(pair.a);
      const hitB = readCachedWeatherBundleSync(pair.b);
      expect(hitA).not.toBeNull();
      expect(hitB).not.toBeNull();
      expect(hitA!.current.temperature).toBe(pair.tempA);
      expect(hitB!.current.temperature).toBe(pair.tempB);
      expect(hitA!.location.provinceCode).toBe(pair.a.provinceCode);
      expect(hitB!.location.provinceCode).toBe(pair.b.provinceCode);

      const spoofedCrossProbe: GeoLocation = {
        ...pair.a,
        provinceCode: pair.b.provinceCode
      };
      expect(readCachedWeatherBundleSync(spoofedCrossProbe)).toBeNull();

      const pcA = pair.a.provinceCode as ProvinceCode;
      const keyA = makeStrictProvinceCacheKey({
        provinceCode: pcA,
        locationId: pair.a.id,
        lat: pair.a.lat,
        lon: pair.a.lon,
        elevationM: pair.a.elevation
      });
      const srvA = serverCache.get(pcA, keyA)!;
      srvA.current.temperature = 999;
      expect(serverCache.get(pcA, keyA)!.current.temperature).toBe(pair.tempA);
      expect(() => serverCache.get(pair.b.provinceCode as ProvinceCode, keyA)).toThrow();
    }

    expect(readCachedWeatherBundleSync(bursaLoc)!.current.temperature).toBe(13.5);
    expect(serverCache.get("TR-16", bursaKey)!.current.temperature).toBe(13.5);

    const [spec34, spec41, spec25, spec04] = await Promise.all([
      loadProvinceSpec("TR-34"),
      loadProvinceSpec("TR-41"),
      loadProvinceSpec("TR-25"),
      loadProvinceSpec("TR-04")
    ]);
    expect(spec34 && spec41 && spec25 && spec04).toBeTruthy();

    const cressman41 = solveProvinceTopographicSurface({
      spec: spec41!,
      target: {
        lat: 40.8028,
        lon: 29.4307,
        elevationM: 182
      },
      drivers: {
        localHour: 14,
        month: 1,
        isNight: false,
        cloudCoverPct: 50,
        wind10mSpeedKmh: 18,
        wind10mDirDeg: 30
      },
      stations: [
        {
          stationId: 17066,
          provinceCode: "TR-41",
          lat: 40.7667,
          lon: 29.9167,
          elevationM: 76,
          tempC: 9.2
        },
        {
          stationId: 17063,
          provinceCode: "TR-34",
          icaoId: "LTFJ",
          lat: 40.8986,
          lon: 29.3092,
          elevationM: 95,
          tempC: 24.0
        },
        {
          stationId: 17116,
          provinceCode: "TR-16",
          icaoId: "LTBR",
          lat: 40.255,
          lon: 29.562,
          elevationM: 233,
          tempC: -15.0
        }
      ]
    });
    expect(cressman41).not.toBeNull();
    expect(cressman41!.rejectedCrossBorderCount).toBe(2);
    expect(cressman41!.acceptedStationCount).toBe(1);
    expect(cressman41!.tempC).toBeLessThan(11.0);
    expect(cressman41!.tempC).toBeGreaterThan(6.5);

    const agriDek = evaluateSeaEffectSnow({
      lat: 39.7191,
      lon: 43.0503,
      provinceCode: "TR-04",
      waterBodies: spec04!.waterBodies,
      temp850hPa: -16,
      temp700hPa: -24,
      surfaceTempC: -12,
      windSpeedKmh: 35,
      windDirDeg: 180,
      precipMmHr: 1.5,
      month: 1
    });
    expect(agriDek.status).toBe("none");

    expect(CROSS_PROVINCE_PROXY_MERKEZ_IDS.size).toBeGreaterThanOrEqual(3);
    expect(isMgmStationOwnedByProvince(18559, "TR-47")).toBe(false);
    expect(isMgmStationOwnedByProvince(17775, "TR-53")).toBe(false);
    expect(isMgmStationOwnedByProvince(18223, "TR-28")).toBe(false);
    expect(isMgmStationOwnedByProvince(17116, "TR-77")).toBe(false);
    expect(isMgmStationOwnedByProvince(17116, "TR-16")).toBe(true);
  });

  it("RED-02: Bursa (TR-16) 11-file SHA-256 cryptographic lock, Golden Snapshot v5 parity, and LTFJ/LTBG perimeter stripping", () => {
    const immutability = verifyBursaImmutabilityManifest(REPO_ROOT);
    expect(immutability.ok).toBe(true);
    expect(immutability.checkedCount).toBe(11);
    expect(immutability.violations).toEqual([]);

    const goldenPath = path.join(REPO_ROOT, "tests/fixtures/bursa-golden-v5.json");
    expect(fs.existsSync(goldenPath)).toBe(true);
    const golden = JSON.parse(fs.readFileSync(goldenPath, "utf8"));
    expect(golden.schemaVersion).toBe("bursa-golden-v5.0");
    expect(golden.frozenManifestCount).toBe(11);
    expect(golden.winterEmosTempC).toBeCloseTo(1.23, 2);
    expect(golden.lodosEmosTempC).toBeCloseTo(19.56, 2);

    expect(TURKEY_ICAO_WHITELIST_BY_PROVINCE["TR-16"]).toEqual(["LTBR"]);
    expect(isIcaoAllowedForProvince("LTBR", "TR-16")).toBe(true);
    expect(isIcaoAllowedForProvince("LTFJ", "TR-16")).toBe(false);
    expect(isIcaoAllowedForProvince("LTBG", "TR-16")).toBe(false);
    expect(isIcaoAllowedForProvince("LTBP", "TR-16")).toBe(false);

    const rawMockMesh = {
      fetchedAtIso: "2026-11-28T12:00:00Z",
      acceptedCount: 4,
      rejectedCount: 0,
      tier1OnlineCount: 1,
      marmaraSstC: 12.8,
      verticalProfile: {
        lowerPoolLapseCPerKm: -6.0,
        upperSlopeLapseCPerKm: -6.2,
        coldPoolTopM: 420,
        inversionStrengthC: 0,
        isNocturnalInversion: false
      },
      stations: [
        {
          station: {
            id: "17116",
            name: "Bursa Osmangazi",
            tier: 1,
            lat: 40.2308,
            lon: 29.0133,
            elevationM: 100
          },
          tempC: 12.4,
          qcWeight: 1.0
        },
        {
          station: {
            id: "ICAO_LTBR",
            icaoId: "LTBR",
            name: "Bursa Yenişehir LTBR",
            tier: 2,
            lat: 40.2552,
            lon: 29.5626,
            elevationM: 233
          },
          tempC: 10.8,
          qcWeight: 0.95
        },
        {
          station: {
            id: "ICAO_LTFJ",
            icaoId: "LTFJ",
            name: "Sabiha Gökçen LTFJ",
            tier: 2,
            lat: 40.8986,
            lon: 29.3092,
            elevationM: 95
          },
          tempC: 14.1,
          qcWeight: 0.9
        },
        {
          station: {
            id: "ICAO_LTBG",
            icaoId: "LTBG",
            name: "Bandırma LTBG",
            tier: 2,
            lat: 40.318,
            lon: 27.9777,
            elevationM: 52
          },
          tempC: 13.6,
          qcWeight: 0.9
        },
        {
          station: {
            id: "PWS_YALOVA",
            name: "Yalova Çiftlikköy PWS",
            tier: 3,
            lat: 40.662,
            lon: 29.324,
            elevationM: 12
          },
          tempC: 15.9,
          qcWeight: 0.55
        }
      ]
    };

    const sanitized = sanitizeBursaMeshToStrictTr16(
      rawMockMesh as never,
      (lat, lon) => resolveProvinceCode({ lat, lon }).provinceCode
    );
    const keptIds = sanitized.stations.map((o) => o.station.id);
    expect(keptIds).toEqual(["17116", "ICAO_LTBR"]);
  });

  it("RED-03: Zero ERA5-Land / archive-api reanalysis contamination across all active runtime & calibration modules", () => {
    const codeFiles = [
      ...walkCodeFiles("app"),
      ...walkCodeFiles("components"),
      ...walkCodeFiles("context"),
      ...walkCodeFiles("lib/provinces"),
      path.join(REPO_ROOT, "scripts/calibrate-tr80-honest-wmo.mjs")
    ];

    const archiveHostRe = new RegExp(["archive-api", "open-meteo", "com"].join("\\."), "i");
    const era5LandRe = new RegExp(["era5", "_land"].join(""), "i");

    for (const file of codeFiles) {
      const content = fs.readFileSync(file, "utf8");
      const rel = path.relative(REPO_ROOT, file);
      expect(archiveHostRe.test(content), `Forbidden archive-api in ${rel}`).toBe(false);
      expect(era5LandRe.test(content), `Forbidden era5_land in ${rel}`).toBe(false);
    }
  });

  it("RED-04: 100.0% (1,102 / 1,102) National Catalog & all 80 ProvinceSpec curatedSubLocations resolve strictly to their own TR-XX province", async () => {
    expect(TR_NATIONAL_CATALOG).toHaveLength(1102);

    const catalogMismatches: string[] = [];
    for (const entry of TR_NATIONAL_CATALOG) {
      const res = resolveProvinceCode({
        lat: entry.lat,
        lon: entry.lon,
        admin1: entry.provinceName,
        countryCode: "TR"
      });
      if (res.provinceCode !== entry.provinceCode) {
        catalogMismatches.push(`${entry.id}: expected ${entry.provinceCode}, got ${res.provinceCode}`);
      }
    }
    expect(catalogMismatches).toEqual([]);

    const subLocMismatches: string[] = [];
    for (const code of NON_BURSA_PROVINCE_CODES) {
      const spec = await loadProvinceSpec(code);
      const cal = await loadProvinceCalibration(code);
      expect(spec).not.toBeNull();
      expect(cal).not.toBeNull();
      expect(spec!.calibrationTier).toBe(cal!.calibrationTier);

      for (const sub of spec!.curatedSubLocations) {
        const res = resolveProvinceCode({
          lat: sub.lat,
          lon: sub.lon,
          admin1: spec!.nameTr,
          countryCode: "TR"
        });
        if (res.provinceCode !== code) {
          subLocMismatches.push(`${code}:${sub.id} -> ${res.provinceCode}`);
        }
      }
    }
    expect(subLocMismatches).toEqual([]);
  });

  it("RED-05: Client JS bundle guard — zero heavy server province specs, EMOS matrices, 1,102 catalog, or MGM live engine imports in components/** or context/**", () => {
    const clientFiles = [...walkCodeFiles("components"), ...walkCodeFiles("context")];
    expect(clientFiles.length).toBeGreaterThan(15);

    const forbiddenImportPatterns = [
      /from\s+["']@\/lib\/provinces\/specs\//,
      /from\s+["']@\/lib\/provinces\/emos-weights/,
      /from\s+["']@\/lib\/provinces\/catalog-1102/,
      /from\s+["']@\/lib\/provinces\/mgm-national-live/,
      /from\s+["']@\/lib\/provinces\/registry/,
      /import\(\s*["'][^"']*provinces\/(specs|emos-weights|catalog-1102|mgm-national-live|registry)/
    ];

    const violations: string[] = [];
    for (const file of clientFiles) {
      const text = fs.readFileSync(file, "utf8");
      const rel = path.relative(REPO_ROOT, file);
      for (const pat of forbiddenImportPatterns) {
        if (pat.test(text)) {
          violations.push(`${rel} matched ${pat.source}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
