import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchNationalMgmMarineStations,
  fetchNationalMgmSnowStations,
  fetchProvinceMgmForecasts,
  fetchProvinceMgmMesh,
  getProvinceMgmCenters,
  MGM_NATIONAL_USER_AGENT,
  resetMgmNationalCachesForTests,
  resolveCanonicalMgmProvinceName,
  runNationalObservationQC,
  verifyMgmStationOwnership
} from "../lib/provinces/mgm-national-live";
import type { RegionalQcAndMosBounds } from "../lib/provinces/types";

const FIXED_NOW_ISO = "2026-11-28T12:00:00.000Z";
const FIXED_NOW_MS = Date.parse(FIXED_NOW_ISO);

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

describe("GEO-04 National MGM Live Mesh, Singleflight /kar + /denizler & Ownership Firewall", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    resetMgmNationalCachesForTests();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
    resetMgmNationalCachesForTests();
  });

  it("enforces NFC canonical Turkish province names and seals TR-16 Bursa away from national collector", async () => {
    expect(resolveCanonicalMgmProvinceName("TR-76")).toBe("Iğdır".normalize("NFC"));
    expect(resolveCanonicalMgmProvinceName("TR-32")).toBe("Isparta".normalize("NFC"));
    expect(resolveCanonicalMgmProvinceName("TR-30")).toBe("Hakkari".normalize("NFC"));
    expect(resolveCanonicalMgmProvinceName("TR-34")).toBe("İstanbul".normalize("NFC"));
    expect(resolveCanonicalMgmProvinceName("TR-35")).toBe("İzmir".normalize("NFC"));

    expect(() => resolveCanonicalMgmProvinceName("TR-16")).toThrow(/TR-16 Bursa is sealed/);
    await expect(fetchProvinceMgmMesh("TR-16")).rejects.toThrow(/TR-16 Bursa is sealed/);
    await expect(getProvinceMgmCenters("TR-16")).rejects.toThrow(/TR-16 Bursa is sealed/);
    await expect(fetchProvinceMgmForecasts("TR-16")).rejects.toThrow(/TR-16 Bursa is sealed/);

    const bursaVerdict = verifyMgmStationOwnership({
      targetProvinceCode: "TR-16",
      rawIlPlaka: 16,
      sondurumIstNo: 17116,
      lat: 40.2308,
      lon: 29.0133
    });
    expect(bursaVerdict.accepted).toBe(false);
    expect(bursaVerdict.rejectReason).toBe("BURSA_VAULT_SEALED");
  });

  it("coalesces 10 simultaneous millisecond requests into exactly 1 network call for /kar, /denizler, and province mesh while enforcing MGM headers & cache:no-store", async () => {
    const callCounts = new Map<string, number>();
    const recordedInits: RequestInit[] = [];

    globalThis.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      recordedInits.push(init ?? {});
      callCounts.set(url, (callCounts.get(url) ?? 0) + 1);

      // Simulate 25ms network latency so all 10 concurrent callers overlap in-flight
      await new Promise((resolve) => setTimeout(resolve, 25));

      if (url.endsWith("/web/sondurumlar/kar")) {
        return jsonResponse([
          {
            istNo: 18774,
            karYukseklik: 19,
            veriZamani: "2026-11-28T11:50:00.000Z",
            istAd: "BAHÇESARAY/KARABET TEPESİ",
            enlem: 38.1464,
            boylam: 42.8583,
            il: "Van",
            ilce: "Bahçesaray"
          }
        ]);
      }

      if (url.endsWith("/web/sondurumlar/denizler")) {
        return jsonResponse([
          {
            istNo: 17482,
            denizSicaklik: 11.6,
            denizVeriZamani: "2026-11-28T11:50:00.000Z",
            istAd: "VAN LİMAN",
            enlem: 38.5149,
            boylam: 43.3074,
            il: "Van",
            ilce: "Tuşba"
          }
        ]);
      }

      if (url.includes("/web/merkezler/ililcesi?il=Van")) {
        return jsonResponse([
          {
            merkezId: 96501,
            ilPlaka: 65,
            il: "Van",
            ilce: "İpekyolu",
            enlem: 38.5012,
            boylam: 43.373,
            yukseklik: 1725,
            oncelik: 1,
            sondurumIstNo: 17172,
            saatlikTahminIstNo: 17170,
            gunlukTahminIstNo: 96501,
            aciklama: ""
          },
          {
            merkezId: 96504,
            ilPlaka: 65,
            il: "Van",
            ilce: "Edremit",
            enlem: 38.4231,
            boylam: 43.2594,
            yukseklik: 1670,
            oncelik: 0,
            sondurumIstNo: 17482,
            saatlikTahminIstNo: null,
            gunlukTahminIstNo: 96504,
            aciklama: ""
          }
        ]);
      }

      if (url.includes("/web/sondurumlar?istno=")) {
        const istNo = Number(new URL(url).searchParams.get("istno"));
        return jsonResponse([
          {
            istNo,
            sicaklik: istNo === 18774 ? -4.2 : 5.8,
            hissedilenSicaklik: istNo === 18774 ? -7.0 : 5.8,
            nem: 68,
            aktuelBasinc: istNo === 18774 ? 710.2 : 832.5,
            denizeIndirgenmisBasinc: 1021.4,
            ruzgarHiz: 9.0,
            ruzgarYon: 240,
            yagis10Dk: 0,
            yagis1Saat: 0,
            yagis24Saat: 0,
            yagis00Now: 0,
            gorus: 15000,
            karYukseklik: istNo === 18774 ? 19 : -9999,
            denizSicaklik: istNo === 17482 ? 11.6 : -9999,
            hadiseKodu: "PB",
            veriZamani: "2026-11-28T11:52:00.000Z"
          }
        ]);
      }

      return jsonResponse([], 404);
    }) as typeof fetch;

    // Fire 10 concurrent mesh + snow + marine calls at the exact same millisecond
    const concurrentPromises = Array.from({ length: 10 }, () =>
      Promise.all([
        fetchProvinceMgmMesh("TR-65", { nowMs: FIXED_NOW_MS }),
        fetchNationalMgmSnowStations({ nowMs: FIXED_NOW_MS }),
        fetchNationalMgmMarineStations({ nowMs: FIXED_NOW_MS })
      ])
    );

    const results = await Promise.all(concurrentPromises);

    expect(callCounts.get("https://servis.mgm.gov.tr/web/sondurumlar/kar")).toBe(1);
    expect(callCounts.get("https://servis.mgm.gov.tr/web/sondurumlar/denizler")).toBe(1);
    expect(callCounts.get("https://servis.mgm.gov.tr/web/merkezler/ililcesi?il=Van")).toBe(1);
    expect(callCounts.get("https://servis.mgm.gov.tr/web/sondurumlar?istno=17172")).toBe(1);
    expect(callCounts.get("https://servis.mgm.gov.tr/web/sondurumlar?istno=17482")).toBe(1);
    expect(callCounts.get("https://servis.mgm.gov.tr/web/sondurumlar?istno=18774")).toBe(1);

    // Verify mandatory headers & cache: "no-store" on every single HTTP request
    expect(recordedInits.length).toBe(6);
    for (const init of recordedInits) {
      expect(init.cache).toBe("no-store");
      const hdrs = init.headers as Record<string, string>;
      expect(hdrs.Origin).toBe("https://www.mgm.gov.tr");
      expect(hdrs.Referer).toBe("https://www.mgm.gov.tr/");
      expect(hdrs["User-Agent"]).toBe(MGM_NATIONAL_USER_AGENT);
    }

    const firstMesh = results[0][0];
    expect(firstMesh.nearestWaterTempC).toBe(11.6);
    expect(firstMesh.marineStations).toHaveLength(1);
    expect(firstMesh.marineStations[0].istNo).toBe(17482);
    expect(firstMesh.selectedStationIds).toEqual(expect.arrayContaining([17172, 17482, 18774]));

    // Verify immutability: returned objects are frozen so callers cannot corrupt cache
    expect(Object.isFrozen(firstMesh)).toBe(true);
    expect(Object.isFrozen(firstMesh.stations)).toBe(true);
    expect(() => {
      (firstMesh.selectedStationIds as number[]).push(99999);
    }).toThrow();
  });

  it("blocks cross-province proxy stations 18559 (TR-61), 17775 (TR-53), and 18223 (TR-28) with 100% precision while deduplicating intra-province borrows and fixing 0m elevations", async () => {
    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("il=Trabzon")) {
        return jsonResponse([
          {
            merkezId: 96101,
            ilPlaka: 61,
            il: "Trabzon",
            ilce: "Ortahisar",
            enlem: 41.0027,
            boylam: 39.7168,
            yukseklik: 39,
            oncelik: 1,
            sondurumIstNo: 17037,
            saatlikTahminIstNo: 17038,
            gunlukTahminIstNo: 96101,
            aciklama: ""
          },
          {
            merkezId: 96115,
            ilPlaka: 61,
            il: "Trabzon",
            ilce: "Arsin",
            enlem: 40.9486,
            boylam: 39.9497,
            yukseklik: 169,
            oncelik: 0,
            sondurumIstNo: 18223, // Legitimate owner in Trabzon!
            saatlikTahminIstNo: null,
            gunlukTahminIstNo: 96115,
            aciklama: ""
          },
          {
            merkezId: 96107,
            ilPlaka: 61,
            il: "Trabzon",
            ilce: "Şalpazarı",
            enlem: 40.9413,
            boylam: 39.1943,
            yukseklik: 0,
            oncelik: 0,
            sondurumIstNo: 18559, // LEAK: Giresun/Eynesil station!
            saatlikTahminIstNo: null,
            gunlukTahminIstNo: 96107,
            aciklama: "Bu merkez sondurum verisini Giresun/Eynesil (Ören Beldesi)'den almaktadır."
          }
        ]);
      }

      if (url.includes("il=Rize")) {
        return jsonResponse([
          {
            merkezId: 95301,
            ilPlaka: 53,
            il: "Rize",
            ilce: "Merkez",
            enlem: 41.0255,
            boylam: 40.5177,
            yukseklik: 0,
            oncelik: 1,
            sondurumIstNo: 17040,
            saatlikTahminIstNo: 17040,
            gunlukTahminIstNo: 95301,
            aciklama: ""
          },
          {
            merkezId: 95305,
            ilPlaka: 53,
            il: "Rize",
            ilce: "İyidere",
            enlem: 40.9835,
            boylam: 40.3319,
            yukseklik: 6,
            oncelik: 0,
            sondurumIstNo: 17775, // LEAK: Trabzon/Of station!
            saatlikTahminIstNo: null,
            gunlukTahminIstNo: 95305,
            aciklama: "Bu merkez sondurum verilerini OF/Fidanlık istasyonundan almaktadır."
          }
        ]);
      }

      if (url.includes("il=Giresun")) {
        return jsonResponse([
          {
            merkezId: 92801,
            ilPlaka: 28,
            il: "Giresun",
            ilce: "Merkez",
            enlem: 40.9227,
            boylam: 38.3878,
            yukseklik: 38,
            oncelik: 1,
            sondurumIstNo: 17034,
            saatlikTahminIstNo: 17034,
            gunlukTahminIstNo: 92801,
            aciklama: ""
          },
          {
            merkezId: 92816,
            ilPlaka: 28,
            il: "Giresun",
            ilce: "Eynesil",
            enlem: 41.0637,
            boylam: 39.1408,
            yukseklik: 12,
            oncelik: 0,
            sondurumIstNo: 18559, // Legitimate owner in Giresun!
            saatlikTahminIstNo: null,
            gunlukTahminIstNo: 92816,
            aciklama: ""
          },
          {
            merkezId: 92809,
            ilPlaka: 28,
            il: "Giresun",
            ilce: "Çanakçı",
            enlem: 40.9173,
            boylam: 39.009,
            yukseklik: 0,
            oncelik: 0,
            sondurumIstNo: 18223, // SILENT LEAK (empty aciklama!): Trabzon/Arsin station!
            saatlikTahminIstNo: null,
            gunlukTahminIstNo: 92809,
            aciklama: ""
          },
          {
            merkezId: 92805,
            ilPlaka: 28,
            il: "Giresun",
            ilce: "Espiye",
            enlem: 40.95,
            boylam: 38.71,
            yukseklik: 0,
            oncelik: 0,
            sondurumIstNo: 18225, // Intra-province borrow from Tirebolu
            saatlikTahminIstNo: null,
            gunlukTahminIstNo: 92805,
            aciklama: "Bu merkez sondurum verisini Giresun/Tirebolu'dan almaktadır."
          },
          {
            merkezId: 92812,
            ilPlaka: 28,
            il: "Giresun",
            ilce: "Tirebolu",
            enlem: 41.006,
            boylam: 38.814,
            yukseklik: 42,
            oncelik: 0,
            sondurumIstNo: 18225, // True physical owner in Giresun
            saatlikTahminIstNo: null,
            gunlukTahminIstNo: 92812,
            aciklama: ""
          }
        ]);
      }

      if (url.includes("il=Kahramanmara%C5%9F")) {
        return jsonResponse([
          {
            merkezId: 94601,
            ilPlaka: 46,
            il: "Kahramanmaraş",
            ilce: "Merkez",
            enlem: 37.576,
            boylam: 36.915,
            yukseklik: 0, // Broken MGM 0m inland elevation!
            oncelik: 1,
            sondurumIstNo: 17255,
            saatlikTahminIstNo: 17255,
            gunlukTahminIstNo: 94601,
            aciklama: ""
          },
          {
            merkezId: 94609,
            ilPlaka: 46,
            il: "Kahramanmaraş",
            ilce: "Çağlayancerit",
            enlem: 37.7503,
            boylam: 37.2909,
            yukseklik: 0, // Broken MGM 0m mountain district!
            oncelik: 0,
            sondurumIstNo: 18279,
            saatlikTahminIstNo: null,
            gunlukTahminIstNo: 94609,
            aciklama: ""
          }
        ]);
      }

      return jsonResponse([]);
    }) as typeof fetch;

    const trabzonCenters = await getProvinceMgmCenters("TR-61", { nowMs: FIXED_NOW_MS });
    expect(trabzonCenters.map((c) => c.sondurumIstNo)).toEqual([17037, 18223]);
    expect(trabzonCenters.some((c) => c.sondurumIstNo === 18559)).toBe(false);

    const rizeCenters = await getProvinceMgmCenters("TR-53", { nowMs: FIXED_NOW_MS });
    expect(rizeCenters.map((c) => c.sondurumIstNo)).toEqual([17040]);
    expect(rizeCenters.some((c) => c.sondurumIstNo === 17775)).toBe(false);

    const giresunCenters = await getProvinceMgmCenters("TR-28", { nowMs: FIXED_NOW_MS });
    expect(giresunCenters.map((c) => c.sondurumIstNo)).toEqual([17034, 18559, 18225]);
    expect(giresunCenters.some((c) => c.sondurumIstNo === 18223)).toBe(false);
    // Intra-province shared 18225 must resolve to physical owner Tirebolu (42m), NOT proxy Espiye (0m)!
    const st18225 = giresunCenters.find((c) => c.sondurumIstNo === 18225)!;
    expect(st18225.ilce).toBe("Tirebolu");
    expect(st18225.elevationM).toBe(42);

    // Built-in DEM elevation fix for Kahramanmaraş 0m inland bug
    const marasCenters = await getProvinceMgmCenters("TR-46", { nowMs: FIXED_NOW_MS });
    expect(marasCenters.find((c) => c.sondurumIstNo === 17255)?.elevationM).toBe(581);
    expect(marasCenters.find((c) => c.sondurumIstNo === 18279)?.elevationM).toBe(1117);
  });

  it("caps 40+ district mega-provinces at <= 12 unique sondurumIstNo requests while preserving floor, coastal, mid-slope, and alpine/snow stations", async () => {
    const queriedSondurumIds: number[] = [];

    // Build 42 synthetic districts across TR-34 / mega-province profile + 2 high mountain snow stations
    const mockDistricts = Array.from({ length: 42 }, (_, idx) => {
      const isPrimary = idx === 0;
      const isCoastal = idx >= 1 && idx <= 6;
      const isMidSlope = idx === 38 || idx === 39;
      const isHigh = idx === 40 || idx === 41;
      const elev = isPrimary
        ? 33
        : isCoastal
          ? 8
          : isMidSlope
            ? 560 + idx
            : isHigh
              ? 1350 + idx * 5
              : 85 + (idx % 5) * 12;
      return {
        merkezId: 93401 + idx,
        ilPlaka: 34,
        il: "İstanbul",
        ilce: isCoastal
          ? `Sahil Liman ${idx}`
          : isMidSlope
            ? `Yamaç ${idx}`
            : isHigh
              ? `Zirve Dağ ${idx}`
              : `İlçe ${idx}`,
        enlem: 41.0 + idx * 0.008,
        boylam: 28.95 + idx * 0.008,
        yukseklik: elev,
        oncelik: isPrimary ? 1 : 0,
        sondurumIstNo: 17060 + idx,
        saatlikTahminIstNo: isPrimary ? 17060 : null,
        gunlukTahminIstNo: 93401 + idx,
        aciklama: ""
      };
    });

    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/web/sondurumlar/kar")) {
        return jsonResponse([
          {
            istNo: 19991,
            karYukseklik: 24,
            veriZamani: "2026-11-28T11:55:00.000Z",
            istAd: "AYDOS ZİRVE OMGİ",
            enlem: 40.93,
            boylam: 29.26,
            il: "İstanbul",
            ilce: "Kartal"
          }
        ]);
      }
      if (url.endsWith("/web/sondurumlar/denizler")) {
        return jsonResponse([]);
      }
      if (url.includes("/web/merkezler/ililcesi")) {
        return jsonResponse(mockDistricts);
      }
      if (url.includes("/web/sondurumlar?istno=")) {
        const id = Number(new URL(url).searchParams.get("istno"));
        queriedSondurumIds.push(id);
        return jsonResponse([
          {
            istNo: id,
            sicaklik: id === 19991 ? 0.4 : 12.5,
            nem: 72,
            denizeIndirgenmisBasinc: 1016.2,
            aktuelBasinc: 1005.0,
            ruzgarHiz: 11.0,
            ruzgarYon: 40,
            karYukseklik: id === 19991 ? 24 : -9999,
            hadiseKodu: "CB",
            veriZamani: "2026-11-28T11:55:00.000Z"
          }
        ]);
      }
      return jsonResponse([]);
    }) as typeof fetch;

    const mesh = await fetchProvinceMgmMesh("TR-34", {
      nowMs: FIXED_NOW_MS,
      targetLat: 41.005,
      targetLon: 28.96,
      targetElevationM: 35
    });

    expect(queriedSondurumIds.length).toBe(12);
    expect(new Set(queriedSondurumIds).size).toBe(12);
    expect(mesh.selectedStationIds.length).toBe(12);

    // Canonical primary station (17060) MUST be included
    expect(mesh.selectedStationIds).toContain(17060);
    // Snow-reporting alpine OMGI station (19991) and high mountain station MUST be preserved
    expect(mesh.selectedStationIds).toContain(19991);

    const roles = new Set(mesh.stations.map((s) => s.station.stratumRole));
    expect(roles.has("basin_floor")).toBe(true);
    expect(roles.has("coastal_or_gap")).toBe(true);
    expect(roles.has("mid_slope")).toBe(true);
    expect(roles.has("alpine_snow")).toBe(true);
  });

  it("accepts genuine Ardahan/Erzurum -39.5°C and 1063 hPa Siberian winter observations under regional QC bounds", () => {
    const easternAnatoliaBounds: RegionalQcAndMosBounds = {
      minPlausibleTempC: -48,
      maxPlausibleTempC: 42,
      minPlausibleMslpHpa: 960,
      maxPlausibleMslpHpa: 1068,
      kalmanTempBiasCapC: 7.5
    };

    const { stations, verticalProfile } = runNationalObservationQC(
      [
        {
          station: {
            provinceCode: "TR-75",
            plateNumber: 75,
            merkezId: 97501,
            sondurumIstNo: 17046,
            gunlukTahminIstNo: 97501,
            saatlikTahminIstNo: 17046,
            il: "Ardahan",
            ilce: "Merkez",
            lat: 41.1105,
            lon: 42.7022,
            elevationM: 1827,
            rawElevationM: 1827,
            priority: 1,
            isPrimaryCenter: true,
            isIntraProvinceBorrowed: false,
            stratumRole: "basin_floor",
            zone: "high_plateau",
            subBasinId: "TR-75_KURA_BASIN",
            urbanFraction: 0.45,
            coldPoolSusceptibility: 0.65,
            sourceKind: "MGM_ILILCESI",
            preReportedSnowDepthCm: 48
          },
          observedAtIso: "2026-11-28T11:55:00.000Z",
          tempC: -39.5,
          apparentTempC: -44.0,
          dewPointC: -42.1,
          relHumidityPct: 76,
          pressureMslHpa: 1063.0,
          pressureStationHpa: 818.4,
          windSpeedKt: 2.0,
          windDirDeg: 60,
          precip10MinMm: 0,
          precip1HrMm: 0,
          precip24HrMm: 0,
          precipToday00Mm: 0,
          visibilityM: 4500,
          snowDepthCm: 48,
          seaTempC: null,
          isPrecipitating: false,
          wxCodeRaw: "PUS",
          tier: 1,
          hasTenthDegreePrecision: true,
          source: "MGM_10MIN"
        },
        {
          station: {
            provinceCode: "TR-75",
            plateNumber: 75,
            merkezId: 97503,
            sondurumIstNo: 18196,
            gunlukTahminIstNo: 97503,
            saatlikTahminIstNo: null,
            il: "Ardahan",
            ilce: "Yalnızçam Kayak Merkezi",
            lat: 41.066,
            lon: 42.512,
            elevationM: 2450,
            rawElevationM: 2450,
            priority: 0,
            isPrimaryCenter: false,
            isIntraProvinceBorrowed: false,
            stratumRole: "alpine_snow",
            zone: "alpine_summit",
            subBasinId: "TR-75_ALPINE",
            urbanFraction: 0.04,
            coldPoolSusceptibility: 0.05,
            sourceKind: "MGM_ILILCESI",
            preReportedSnowDepthCm: 92
          },
          observedAtIso: "2026-11-28T11:55:00.000Z",
          tempC: -36.8,
          apparentTempC: -43.2,
          dewPointC: -39.0,
          relHumidityPct: 80,
          pressureMslHpa: 1062.4,
          pressureStationHpa: 752.1,
          windSpeedKt: 6.0,
          windDirDeg: 45,
          precip10MinMm: 0,
          precip1HrMm: 0,
          precip24HrMm: 0,
          precipToday00Mm: 0,
          visibilityM: 8000,
          snowDepthCm: 92,
          seaTempC: null,
          isPrecipitating: false,
          wxCodeRaw: "AB",
          tier: 1,
          hasTenthDegreePrecision: true,
          source: "MGM_10MIN"
        }
      ],
      {
        nowMs: FIXED_NOW_MS,
        referenceElevationM: 1827,
        qcBounds: easternAnatoliaBounds,
        isNight: true
      }
    );

    expect(stations[0].qcWeight).toBeGreaterThan(0.75);
    expect(stations[0].qcFlags).toContain("OK");
    expect(stations[0].qcFlags).not.toContain("GROSS_LIMIT_REJECT");
    expect(stations[1].qcWeight).toBeGreaterThan(0.75);
    expect(verticalProfile.isDirectlyMeasured).toBe(true);
    expect(verticalProfile.boundaryLayerState).toBe("STRONG_INVERSION");
  });

  it("fetches ALARO 3-hourly forecasts via saatlikTahminIstNo, interpolates to 1-hour steps, and resolves district daily deltas via gunlukTahminIstNo", async () => {
    const requestedUrls: string[] = [];

    globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      requestedUrls.push(url);

      if (url.includes("/web/merkezler/ililcesi?il=Adana")) {
        return jsonResponse([
          {
            merkezId: 90101,
            ilPlaka: 1,
            il: "Adana",
            ilce: "Seyhan",
            enlem: 37.0017,
            boylam: 35.3289,
            yukseklik: 23,
            oncelik: 1,
            sondurumIstNo: 19272,
            saatlikTahminIstNo: 17352,
            gunlukTahminIstNo: 90101,
            aciklama: ""
          },
          {
            merkezId: 90109,
            ilPlaka: 1,
            il: "Adana",
            ilce: "Pozantı",
            enlem: 37.4265,
            boylam: 34.8717,
            yukseklik: 780,
            oncelik: 0,
            sondurumIstNo: 17934,
            saatlikTahminIstNo: null,
            gunlukTahminIstNo: 90109,
            aciklama: ""
          }
        ]);
      }

      if (url.endsWith("/web/tahminler/saatlik?istno=17352")) {
        return jsonResponse([
          {
            istNo: 17352,
            tahmin: [
              {
                tarih: "2026-11-28T12:00:00.000Z",
                hadise: "PB",
                sicaklik: 18,
                hissedilenSicaklik: 18,
                nem: 50,
                ruzgarYonu: 180,
                ruzgarHizi: 12,
                maksimumRuzgarHizi: 24
              },
              {
                tarih: "2026-11-28T15:00:00.000Z",
                hadise: "SY",
                sicaklik: 15,
                hissedilenSicaklik: 15,
                nem: 80,
                ruzgarYonu: 200,
                ruzgarHizi: 18,
                maksimumRuzgarHizi: 36
              }
            ]
          }
        ]);
      }

      if (url.endsWith("/web/tahminler/gunluk?istno=90109")) {
        return jsonResponse([
          {
            istNo: 90109,
            tarihGun0: "2026-11-28T00:00:00.000Z",
            enDusukGun0: 3.4,
            enYuksekGun0: 11.2,
            hadiseGun0: "PB",
            tarihGun1: "2026-11-29T00:00:00.000Z",
            enDusukGun1: 1.5,
            enYuksekGun1: 9.0,
            hadiseGun1: "KY"
          }
        ]);
      }

      if (url.endsWith("/web/tahminler/gunluk?istno=90101")) {
        return jsonResponse([
          {
            istNo: 90101,
            tarihGun0: "2026-11-28T00:00:00.000Z",
            enDusukGun0: 9.4,
            enYuksekGun0: 19.2,
            hadiseGun0: "PB",
            tarihGun1: "2026-11-29T00:00:00.000Z",
            enDusukGun1: 8.5,
            enYuksekGun1: 17.0,
            hadiseGun1: "Y"
          }
        ]);
      }

      return jsonResponse([]);
    }) as typeof fetch;

    const forecast = await fetchProvinceMgmForecasts("TR-01", {
      nowMs: FIXED_NOW_MS,
      targetLat: 37.4265,
      targetLon: 34.8717,
      targetElevationM: 780
    });

    expect(forecast).not.toBeNull();
    expect(forecast!.targetDistrict).toBe("Pozantı");
    expect(forecast!.saatlikIstNo).toBe(17352);
    expect(forecast!.targetGunlukIstNo).toBe(90109);
    expect(requestedUrls).toContain("https://servis.mgm.gov.tr/web/tahminler/saatlik?istno=17352");
    expect(requestedUrls).toContain("https://servis.mgm.gov.tr/web/tahminler/gunluk?istno=90109");
    expect(requestedUrls).toContain("https://servis.mgm.gov.tr/web/tahminler/gunluk?istno=90101");

    // Verify linear interpolation at 13:00 and 14:00 UTC
    expect(forecast!.hourlyAlaro.get("2026-11-28T12:00")?.tempC).toBe(18);
    expect(forecast!.hourlyAlaro.get("2026-11-28T13:00")?.tempC).toBe(17);
    expect(forecast!.hourlyAlaro.get("2026-11-28T14:00")?.tempC).toBe(16);
    expect(forecast!.hourlyAlaro.get("2026-11-28T15:00")?.tempC).toBe(15);

    // Verify Gun0 extremes & Pozantı vs Seyhan differential
    expect(forecast!.todayObservedMinC).toBe(3.4);
    expect(forecast!.todayObservedMaxC).toBe(11.2);
    const day1 = forecast!.dailyDistrict.get("2026-11-29")!;
    expect(day1.deltaMinVsPrimaryC).toBe(-7);
    expect(day1.deltaMaxVsPrimaryC).toBe(-8);
    expect(day1.isWet).toBe(true);
  });
});
