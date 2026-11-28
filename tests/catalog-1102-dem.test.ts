import { describe, expect, it } from "vitest";
import { TR_PLATE_NUMBERS, type TrProvinceCode } from "../lib/provinces/types";
import { BURSA_CURATED_LOCATIONS } from "../lib/weather-client";
import {
  TR_NATIONAL_CATALOG,
  foldTrCatalog,
  searchTrNationalCatalog,
  findNearestTrCatalogEntry,
  getTrCatalogEntryById,
  getTrProvinceCenterEntry
} from "../lib/provinces/catalog-1102";
import {
  MGM_DEM_ELEVATION_REPAIR_BY_ISTNO,
  MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID,
  CROSS_PROVINCE_PROXY_MERKEZ_IDS,
  STATIC_MGM_ISTNO_OWNER_PROVINCE,
  resolveVerifiedStationElevationM,
  isCrossProvinceProxyMerkez,
  isMgmStationOwnedByProvince
} from "../lib/provinces/mgm-dem-repair";

const COASTAL_PLATES = new Set([
  1, 7, 8, 9, 10, 16, 17, 22, 28, 31, 33, 34, 35, 37, 39, 41, 48, 52, 53, 54, 55, 57, 59, 61, 67, 74, 77, 81
]);

describe("GEO-02: 1,102-Entry 81-Province + 973-District + 48-Summit Catalog & MGM DEM Repair", () => {
  it("contains all 81 provinces, >= 1050 total entries (exact 1,102: 81 + 973 + 48), and unique IDs", () => {
    expect(TR_NATIONAL_CATALOG.length).toBeGreaterThanOrEqual(1050);
    expect(TR_NATIONAL_CATALOG.length).toBe(1102);

    const provinceCenters = TR_NATIONAL_CATALOG.filter((e) => e.kind === "province_center");
    const districts = TR_NATIONAL_CATALOG.filter((e) => e.kind === "district");
    const summits = TR_NATIONAL_CATALOG.filter((e) => e.kind === "summit_ski");

    expect(provinceCenters).toHaveLength(81);
    expect(districts).toHaveLength(973);
    expect(summits.length).toBeGreaterThanOrEqual(48);

    const seenPlates = new Set<number>();
    const seenCodes = new Set<TrProvinceCode>();
    for (const c of provinceCenters) {
      seenPlates.add(c.plateNumber);
      seenCodes.add(c.provinceCode);
    }
    expect(seenPlates.size).toBe(81);
    for (const p of TR_PLATE_NUMBERS) {
      const code = `TR-${p}` as TrProvinceCode;
      expect(seenCodes.has(code)).toBe(true);
      expect(getTrProvinceCenterEntry(code)).toBeDefined();
    }

    const ids = new Set<string>();
    for (const entry of TR_NATIONAL_CATALOG) {
      expect(ids.has(entry.id)).toBe(false);
      ids.add(entry.id);
      expect(Number.isFinite(entry.lat)).toBe(true);
      expect(Number.isFinite(entry.lon)).toBe(true);
      expect(Number.isFinite(entry.elevationM)).toBe(true);
      expect(entry.elevationM).toBeGreaterThanOrEqual(0);
    }
  });

  it("preserves Bursa WMO 17116 center lock, BURSA_CURATED_LOCATIONS IDs, and separate MGM ID fields", () => {
    const bursaCenter = getTrCatalogEntryById("bursa-tr");
    expect(bursaCenter).toBeDefined();
    expect(bursaCenter?.provinceCode).toBe("TR-16");
    expect(bursaCenter?.lat).toBeCloseTo(40.2308, 4);
    expect(bursaCenter?.lon).toBeCloseTo(29.0133, 4);
    expect(bursaCenter?.elevationM).toBe(100);
    expect(bursaCenter?.wmoId).toBe("17116");
    expect(bursaCenter?.mgmMerkezId).toBe(91601);
    expect(bursaCenter?.mgmSondurumIstNo).toBe(17116);
    expect(bursaCenter?.mgmSaatlikIstNo).toBe(17116);
    expect(bursaCenter?.mgmGunlukIstNo).toBe(91601);

    for (const loc of BURSA_CURATED_LOCATIONS) {
      const found = getTrCatalogEntryById(loc.id);
      expect(found, `Missing Bursa curated location ID: ${loc.id}`).toBeDefined();
      expect(found?.provinceCode).toBe("TR-16");
    }

    // Critical MGM schema split: merkezId !== gunlukTahminIstNo in Manisa & Mardin!
    const manisa = getTrProvinceCenterEntry("TR-45");
    expect(manisa?.mgmMerkezId).toBe(94508);
    expect(manisa?.mgmGunlukIstNo).toBe(94501);
    expect(manisa?.mgmSondurumIstNo).toBe(17186);

    const mardin = getTrProvinceCenterEntry("TR-47");
    expect(mardin?.mgmMerkezId).toBe(94711);
    expect(mardin?.mgmGunlukIstNo).toBe(94701);
    expect(mardin?.mgmSondurumIstNo).toBe(17275);
  });

  it("repairs all broken 0 m inland centers with GLO-90 DEM so zero inland entries remain <= 10 m", () => {
    const criticalInlandChecks: Array<{ query: string; province: TrProvinceCode; minElevM: number }> = [
      { query: "eskişehir tepebaşı", province: "TR-26", minElevM: 700 },
      { query: "denizli merkezefendi", province: "TR-20", minElevM: 350 },
      { query: "kahramanmaraş", province: "TR-46", minElevM: 500 },
      { query: "kahramanmaraş çağlayancerit", province: "TR-46", minElevM: 950 },
      { query: "diyarbakır", province: "TR-21", minElevM: 600 },
      { query: "diyarbakır kayapınar", province: "TR-21", minElevM: 600 },
      { query: "diyarbakır yenişehir", province: "TR-21", minElevM: 600 },
      { query: "şanlıurfa", province: "TR-63", minElevM: 500 },
      { query: "şanlıurfa haliliye", province: "TR-63", minElevM: 500 },
      { query: "şanlıurfa karaköprü", province: "TR-63", minElevM: 500 },
      { query: "siirt tillo", province: "TR-56", minElevM: 1100 },
      { query: "osmaniye sumbas", province: "TR-80", minElevM: 50 },
      { query: "ladik akdağ", province: "TR-55", minElevM: 1450 }
    ];

    for (const check of criticalInlandChecks) {
      const hits = searchTrNationalCatalog(check.query, { limit: 5 });
      const target = hits.find((h) => h.provinceCode === check.province);
      expect(target, `Expected match for ${check.query}`).toBeDefined();
      expect(target!.elevationM).toBeGreaterThan(10);
      expect(target!.elevationM).toBeGreaterThanOrEqual(check.minElevM);
    }

    // Global invariant: NO entry in any of the 53 landlocked provinces may have elevationM <= 10!
    const brokenLandlocked = TR_NATIONAL_CATALOG.filter(
      (e) => !COASTAL_PLATES.has(e.plateNumber) && e.elevationM <= 10
    );
    expect(brokenLandlocked).toEqual([]);

    // Verify mgm-dem-repair functions on missing/zero elevations (including /kar and /denizler)
    expect(MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID[92602]).toBeGreaterThan(700); // Eskişehir Tepebaşı
    expect(MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID[92002]).toBeGreaterThan(350); // Denizli Merkezefendi
    expect(MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID[95603]).toBeGreaterThan(1100); // Siirt Tillo
    expect(MGM_DEM_ELEVATION_REPAIR_BY_ISTNO[17691]).toBeGreaterThan(2300); // Kop Dağı /sondurumlar/kar
    expect(MGM_DEM_ELEVATION_REPAIR_BY_ISTNO[17482]).toBeGreaterThan(1600); // Van Liman /sondurumlar/denizler

    expect(resolveVerifiedStationElevationM({ rawElevationM: 0, merkezId: 92602, istNo: 17123 })).toBeGreaterThan(700);
    expect(resolveVerifiedStationElevationM(null, 17482)).toBeGreaterThan(1600);
    expect(resolveVerifiedStationElevationM(100, 17116, 91601)).toBe(100);
  });

  it("disambiguates homonymous districts & district-vs-summit pairs and resolves compound queries in < 0.3 ms", () => {
    expect(foldTrCatalog("İSTANBUL / Çamlıhemşin (Hakkâri) Iğdır")).toBe(
      "istanbul camlihemsin hakkari igdir"
    );

    const homonymGroups: Array<{ query: string; expectedProvinces: TrProvinceCode[] }> = [
      { query: "Ereğli", expectedProvinces: ["TR-42", "TR-67", "TR-59"] },
      { query: "Kemer", expectedProvinces: ["TR-07", "TR-15"] },
      { query: "Edremit", expectedProvinces: ["TR-10", "TR-65"] },
      { query: "Gölbaşı", expectedProvinces: ["TR-02", "TR-06"] },
      { query: "Yenice", expectedProvinces: ["TR-17", "TR-78"] },
      { query: "Yenişehir", expectedProvinces: ["TR-16", "TR-21", "TR-33"] }
    ];

    for (const group of homonymGroups) {
      const results = searchTrNationalCatalog(group.query, { limit: 15 });
      const returnedProvinces = new Set(results.map((r) => r.provinceCode));
      for (const expProv of group.expectedProvinces) {
        expect(
          returnedProvinces.has(expProv),
          `Query "${group.query}" should return ${expProv}, got ${[...returnedProvinces].join(",")}`
        ).toBe(true);
      }
    }

    // Kartepe district vs Kartepe summit_ski
    const kartepeHits = searchTrNationalCatalog("Kartepe", { limit: 10 });
    const kartepeDistrict = kartepeHits.find((x) => x.id === "tr-41-kartepe");
    const kartepeSummit = kartepeHits.find((x) => x.id === "tr-41-kartepe-zirve");
    expect(kartepeDistrict?.kind).toBe("district");
    expect(kartepeSummit?.kind).toBe("summit_ski");
    expect(kartepeSummit!.elevationM).toBeGreaterThan(1200);

    // Saklıkent TR-07 ski vs TR-48 canyon
    const saklikentHits = searchTrNationalCatalog("Saklıkent", { limit: 10 });
    expect(saklikentHits.some((x) => x.id === "tr-07-saklikent-zirve" && x.provinceCode === "TR-07")).toBe(true);
    expect(saklikentHits.some((x) => x.id === "tr-48-saklikent-kanyon" && x.provinceCode === "TR-48")).toBe(true);

    // Compound queries
    expect(searchTrNationalCatalog("konya ereğli")[0]?.id).toBe("tr-42-eregli");
    expect(searchTrNationalCatalog("67 ereğli")[0]?.id).toBe("tr-67-eregli");
    expect(searchTrNationalCatalog("kartepe kayak")[0]?.id).toBe("tr-41-kartepe-zirve");
    expect(searchTrNationalCatalog("rize çamlıhemşin")[0]?.id).toBe("tr-53-camlihemsin");

    // Nearest neighbor helper
    const nearUludag = findNearestTrCatalogEntry(40.107, 29.129, "TR-16", 10);
    expect(nearUludag?.id).toBe("bursa-uludag-tr");
    expect(findNearestTrCatalogEntry(40.107, 29.129, "TR-06", 10)).toBeNull();

    // Sub-0.3 ms latency benchmark (warmed median/mean over 200 compound & homonym queries)
    const benchQueries = [
      "konya ereğli",
      "67 ereğli",
      "kartepe kayak",
      "rize çamlıhemşin",
      "yenişehir",
      "kahramanmaraş yedikuyular",
      "şanlıurfa karaköprü",
      "uludağ zirve"
    ];
    for (const q of benchQueries) searchTrNationalCatalog(q);

    const iterations = 200;
    const t0 = performance.now();
    for (let i = 0; i < iterations; i++) {
      searchTrNationalCatalog(benchQueries[i % benchQueries.length]);
    }
    const avgMs = (performance.now() - t0) / iterations;
    expect(avgMs).toBeLessThan(0.3);
  });

  it("locks cross-province proxy stations to their physical owner provinces (18559->TR-28, 17775->TR-61, 18223->TR-61)", () => {
    expect(Object.keys(STATIC_MGM_ISTNO_OWNER_PROVINCE).length).toBeGreaterThanOrEqual(1026);

    expect(STATIC_MGM_ISTNO_OWNER_PROVINCE[18559]).toBe("TR-28");
    expect(STATIC_MGM_ISTNO_OWNER_PROVINCE[17775]).toBe("TR-61");
    expect(STATIC_MGM_ISTNO_OWNER_PROVINCE[18223]).toBe("TR-61");

    expect(CROSS_PROVINCE_PROXY_MERKEZ_IDS.has(96107)).toBe(true); // Trabzon/Şalpazarı -> 18559 (TR-28)
    expect(CROSS_PROVINCE_PROXY_MERKEZ_IDS.has(95305)).toBe(true); // Rize/İyidere -> 17775 (TR-61)
    expect(CROSS_PROVINCE_PROXY_MERKEZ_IDS.has(92809)).toBe(true); // Giresun/Çanakçı -> 18223 (TR-61)
    expect(isCrossProvinceProxyMerkez(96107)).toBe(true);
    expect(isCrossProvinceProxyMerkez(91601)).toBe(false);

    expect(isMgmStationOwnedByProvince(18559, "TR-28")).toBe(true);
    expect(isMgmStationOwnedByProvince(18559, "TR-61")).toBe(false);
    expect(isMgmStationOwnedByProvince(17775, "TR-61")).toBe(true);
    expect(isMgmStationOwnedByProvince(17775, "TR-53")).toBe(false);
    expect(isMgmStationOwnedByProvince(18223, "TR-61")).toBe(true);
    expect(isMgmStationOwnedByProvince(18223, "TR-28")).toBe(false);
  });
});
