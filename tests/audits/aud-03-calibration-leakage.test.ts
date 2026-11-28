import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  getAllowedTurkeyIcaosForProvince,
  isIcaoAllowedForProvince,
  TURKEY_ICAO_WHITELIST_BY_PROVINCE
} from "../../lib/metar-verify";
import {
  BURSA_FROZEN_SHA256_MANIFEST,
  verifyBursaImmutabilityManifest
} from "../../lib/provinces/bursa-vault-guard";
import {
  getTrCatalogEntryById,
  getTrProvinceCenterEntry,
  TR_NATIONAL_CATALOG
} from "../../lib/provinces/catalog-1102";
import {
  type EmosHorizonSliceKey,
  loadProvinceCalibrationBundle
} from "../../lib/provinces/emos-weights";
import {
  pointInProvincePolygon,
  resolveProvinceCode
} from "../../lib/provinces/geo-adm1-resolver";
import {
  CROSS_PROVINCE_PROXY_MERKEZ_IDS,
  STATIC_MGM_ISTNO_OWNER_PROVINCE
} from "../../lib/provinces/mgm-dem-repair";
import { TR_PROVINCE_MGM_REGISTRY } from "../../lib/provinces/mgm-national-live";
import {
  loadProvinceCalibration,
  loadProvinceSpec,
  NON_BURSA_PROVINCE_CODES
} from "../../lib/provinces/registry";
import {
  type HorizonBucket,
  type SeasonBucket,
  type SimplexModelWeightMap,
  TR_PLATE_NUMBERS,
  type TrProvinceCode
} from "../../lib/provinces/types";
import { BURSA_CURATED_LOCATIONS } from "../../lib/weather-client";

const REPO_ROOT = path.resolve(__dirname, "../..");
const AUDIT_REPORT_PATH = path.join(
  REPO_ROOT,
  "reports/audit-aud03-calibration-leakage.json"
);
const CV_AUDIT_PATH = path.join(
  REPO_ROOT,
  "reports/tr80-calibration-cv-audit.json"
);
const CALIBRATION_SCRIPT_PATH = path.join(
  REPO_ROOT,
  "scripts/calibrate-tr80-honest-wmo.mjs"
);

const SEASONS: readonly SeasonBucket[] = ["DJF", "MAM", "JJA", "SON"];
const CELL_HORIZONS: readonly HorizonBucket[] = ["d0_1", "d2_4", "d5_7"];
const SLICE_HORIZONS: readonly EmosHorizonSliceKey[] = [
  "short_0_72h",
  "medium_73_240h"
];
const MODEL_KEYS: readonly (keyof SimplexModelWeightMap)[] = [
  "ecmwfIfs",
  "ecmwfAifs",
  "icon",
  "ukmo",
  "meteofrance",
  "gfs",
  "gem",
  "jma"
];

function collectFilesRecursively(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFilesRecursively(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

function assertConvexSimplex(w: SimplexModelWeightMap, label: string): void {
  let sum = 0;
  for (const k of MODEL_KEYS) {
    const v = w[k];
    expect(Number.isFinite(v), `${label}.${k} finite`).toBe(true);
    expect(v, `${label}.${k} >= 0`).toBeGreaterThanOrEqual(0);
    sum += v;
  }
  expect(
    Math.abs(sum - 1.0),
    `${label} simplex sum=${sum} within 1e-5`
  ).toBeLessThanOrEqual(1e-5);
}

describe("AUD-03: Zero-Context Independent Calibration Integrity, ERA5 Ban, Station/METAR Disjointness & Bursa SHA-256 Audit", () => {
  it("1. enforces absolute zero ERA5 / archive-api reanalysis ban across lib/provinces/**, calibration script, and CV audit report", () => {
    const provinceFiles = collectFilesRecursively(
      path.join(REPO_ROOT, "lib/provinces")
    );
    expect(provinceFiles.length).toBeGreaterThanOrEqual(170);

    const targets = [
      ...provinceFiles,
      CALIBRATION_SCRIPT_PATH,
      CV_AUDIT_PATH
    ];

    // Constructed dynamically so even the audit test source never embeds raw forbidden tokens if scanned
    const archiveHostRegex = new RegExp(
      ["archive-api", "open-meteo", "com"].join("\\."),
      "i"
    );
    const era5LandRegex = new RegExp(["era5", "_land"].join(""), "i");
    const era5Regex = new RegExp(["er", "a5"].join(""), "i");

    for (const filePath of targets) {
      const text = fs.readFileSync(filePath, "utf8");
      const rel = path.relative(REPO_ROOT, filePath);
      expect(
        archiveHostRegex.test(text),
        `Forbidden archive-api host found in ${rel}`
      ).toBe(false);
      expect(
        era5LandRegex.test(text),
        `Forbidden era5_land token found in ${rel}`
      ).toBe(false);
      expect(
        era5Regex.test(text),
        `Forbidden era5 token found in ${rel}`
      ).toBe(false);
    }

    const cvAudit = JSON.parse(fs.readFileSync(CV_AUDIT_PATH, "utf8"));
    expect(cvAudit.reanalysisSurrogatesUsed).toBe(false);
    expect(cvAudit.excludedSealedProvince).toBe("TR-16");
  });

  it("2. verifies 1-to-1 provinceCode & calibrationTier parity (60 TIER_A_WMO vs 20 TIER_B_DONOR_KALMAN), 2,720 convex simplex vectors, and strict Tier-B zero-intercept/zero-beta rules", async () => {
    expect(NON_BURSA_PROVINCE_CODES).toHaveLength(80);
    expect(await loadProvinceSpec("TR-16")).toBeNull();
    expect(await loadProvinceCalibration("TR-16")).toBeNull();
    expect(await loadProvinceCalibrationBundle("TR-16")).toBeNull();

    let tierACount = 0;
    let tierBCount = 0;
    let checkedSimplexVectors = 0;
    const tierASet = new Set<TrProvinceCode>();
    const seenWmoIds = new Set<string>();

    for (const code of NON_BURSA_PROVINCE_CODES) {
      const spec = await loadProvinceSpec(code);
      const bundle = await loadProvinceCalibrationBundle(code);
      const viaRegistry = await loadProvinceCalibration(code);

      expect(spec, `Missing ProvinceSpec for ${code}`).not.toBeNull();
      expect(bundle, `Missing ProvinceCalibrationBundle for ${code}`).not.toBeNull();
      expect(viaRegistry).toBe(bundle);

      expect(spec!.provinceCode).toBe(code);
      expect(bundle!.provinceCode).toBe(code);
      expect(
        spec!.calibrationTier,
        `Tier mismatch between specs/${code} (${spec!.calibrationTier}) and emos-weights/${code} (${bundle!.calibrationTier})`
      ).toBe(bundle!.calibrationTier);

      if (spec!.calibrationTier === "TIER_A_WMO") {
        tierACount++;
        tierASet.add(code);
        expect(bundle!.tier).toBe("TIER_A_EMPIRICAL_WMO");
        expect(bundle!.wmoStationId).toBeTruthy();
        expect(bundle!.wmoStationId).not.toBe("17116"); // Bursa WMO lock
        expect(seenWmoIds.has(bundle!.wmoStationId!)).toBe(false);
        seenWmoIds.add(bundle!.wmoStationId!);
        expect(bundle!.matchedHours2024_2025).toBeGreaterThanOrEqual(15000);
      } else {
        expect(spec!.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
        expect(bundle!.tier).toBe("TIER_B_DONOR_ALARO");
        tierBCount++;
        expect(bundle!.wmoStationId).toBeNull();
        expect(bundle!.matchedHours2024_2025).toBe(0);
        expect(bundle!.alaroAnchorWeight0to72h).toBe(0.24);
      }

      // Check all 34 simplex vectors per province (80 * 34 = 2,720)
      assertConvexSimplex(bundle!.windWeights, `${code}.windWeights`);
      assertConvexSimplex(bundle!.pressureWeights, `${code}.pressureWeights`);
      checkedSimplexVectors += 2;

      for (const season of SEASONS) {
        assertConvexSimplex(
          bundle!.precipitation[season].weights,
          `${code}.precipitation.${season}`
        );
        checkedSimplexVectors += 1;

        for (const horizon of CELL_HORIZONS) {
          const cell = bundle!.temperature[season][horizon];
          assertConvexSimplex(
            cell.weights,
            `${code}.temperature.${season}.${horizon}`
          );
          checkedSimplexVectors += 1;

          if (bundle!.calibrationTier === "TIER_B_DONOR_KALMAN") {
            expect(cell.interceptC, `${code}.${season}.${horizon}.interceptC`).toBe(0);
            expect(
              cell.diurnalHarmonicsC,
              `${code}.${season}.${horizon}.diurnalHarmonicsC`
            ).toEqual([0, 0, 0, 0]);
            expect(
              cell.driverBetasC,
              `${code}.${season}.${horizon}.driverBetasC`
            ).toEqual([0, 0, 0, 0]);
          }
        }

        for (const sliceKey of SLICE_HORIZONS) {
          const sl = bundle!.slices[season][sliceKey];
          assertConvexSimplex(
            sl.weights,
            `${code}.slices.${season}.${sliceKey}.weights`
          );
          assertConvexSimplex(
            sl.precip.weights,
            `${code}.slices.${season}.${sliceKey}.precip.weights`
          );
          checkedSimplexVectors += 2;

          if (bundle!.calibrationTier === "TIER_B_DONOR_KALMAN") {
            expect(sl.intercept, `${code}.slices.${season}.${sliceKey}.intercept`).toBe(0);
            expect(sl.betaDrivers, `${code}.slices.${season}.${sliceKey}.betaDrivers`).toEqual([
              0, 0, 0, 0, 0, 0
            ]);
            expect(
              sl.maxResidualShiftC,
              `${code}.slices.${season}.${sliceKey}.maxResidualShiftC`
            ).toBe(0);
          }
        }
      }
    }

    expect(tierACount).toBe(60);
    expect(tierBCount).toBe(20);
    expect(seenWmoIds.size).toBe(60);
    expect(checkedSimplexVectors).toBe(2720);

    // Verify all Tier-B donor references point strictly to Tier-A provinces with convex weights summing to 1
    for (const code of NON_BURSA_PROVINCE_CODES) {
      const bundle = (await loadProvinceCalibrationBundle(code))!;
      if (bundle.calibrationTier !== "TIER_B_DONOR_KALMAN") continue;
      const donors = bundle.donorStations ?? [];
      expect(donors.length).toBeGreaterThanOrEqual(2);
      const dSum = donors.reduce((acc, d) => acc + d.weight, 0);
      expect(Math.abs(dSum - 1.0)).toBeLessThan(1e-6);
      for (const d of donors) {
        expect(tierASet.has(d.provinceCode)).toBe(true);
      }
    }
  });

  it("3a. proves 100% disjointness of 81-province METAR ICAO & MGM primary registries and audits ProvinceSpec.icaoWhitelist alignment", async () => {
    const allCodes = TR_PLATE_NUMBERS.map((p) => `TR-${p}` as TrProvinceCode);
    expect(Object.keys(TURKEY_ICAO_WHITELIST_BY_PROVINCE)).toHaveLength(81);

    const ownerByIcao = new Map<string, TrProvinceCode>();
    for (const pc of allCodes) {
      const list = getAllowedTurkeyIcaosForProvince(pc);
      for (const icao of list) {
        expect(/^LT[A-Z]{2}$/.test(icao), `Invalid ICAO ${icao} in ${pc}`).toBe(true);
        expect(
          ownerByIcao.has(icao),
          `Duplicate ICAO ${icao} assigned to both ${ownerByIcao.get(icao)} and ${pc}`
        ).toBe(false);
        ownerByIcao.set(icao, pc);
        expect(isIcaoAllowedForProvince(icao, pc)).toBe(true);
      }
    }
    expect(ownerByIcao.size).toBe(67);
    expect(TURKEY_ICAO_WHITELIST_BY_PROVINCE["TR-16"]).toEqual(["LTBR"]);

    // Verify zero cross-province ICAO leakage in all 80 ProvinceSpec.icaoWhitelist arrays,
    // and track the 4 audited narrower subset provinces (AUD03-METAR-01).
    const documentedSubsetCodes = new Set<TrProvinceCode>([
      "TR-09",
      "TR-17",
      "TR-35",
      "TR-45"
    ]);
    const observedSubsetCodes: TrProvinceCode[] = [];

    for (const code of NON_BURSA_PROVINCE_CODES) {
      const spec = (await loadProvinceSpec(code))!;
      const authSet = new Set(TURKEY_ICAO_WHITELIST_BY_PROVINCE[code]);
      for (const ic of spec.icaoWhitelist) {
        expect(
          authSet.has(ic),
          `Cross-province/unlisted ICAO leak ${ic} in ProvinceSpec ${code}`
        ).toBe(true);
        expect(ownerByIcao.get(ic)).toBe(code);
      }
      if (spec.icaoWhitelist.length < authSet.size) {
        observedSubsetCodes.push(code);
        expect(
          documentedSubsetCodes.has(code),
          `Undocumented spec.icaoWhitelist subset drift on ${code}`
        ).toBe(true);
      }

      // Verify ProvinceSpec stationOverrides never claim another province's MGM istNo
      const primaryIst = spec.primaryCenter.mgmIstNo;
      if (STATIC_MGM_ISTNO_OWNER_PROVINCE[primaryIst]) {
        expect(STATIC_MGM_ISTNO_OWNER_PROVINCE[primaryIst]).toBe(code);
      }
      for (const ov of Object.values(spec.stationOverrides)) {
        const numId = Number(ov.stationId);
        if (Number.isFinite(numId) && STATIC_MGM_ISTNO_OWNER_PROVINCE[numId]) {
          expect(STATIC_MGM_ISTNO_OWNER_PROVINCE[numId]).toBe(code);
        }
      }
    }

    // Disjointness of all 81 primary MGM IDs
    const seenMerkez = new Set<number>();
    const seenSondurum = new Set<number>();
    const seenSaatlik = new Set<number>();
    const seenGunluk = new Set<number>();
    for (const pc of allCodes) {
      const m = TR_PROVINCE_MGM_REGISTRY[pc];
      expect(seenMerkez.has(m.primaryMerkezId)).toBe(false);
      expect(seenSondurum.has(m.primarySondurumIstNo)).toBe(false);
      expect(seenSaatlik.has(m.primarySaatlikIstNo)).toBe(false);
      expect(seenGunluk.has(m.primaryGunlukIstNo)).toBe(false);
      seenMerkez.add(m.primaryMerkezId);
      seenSondurum.add(m.primarySondurumIstNo);
      seenSaatlik.add(m.primarySaatlikIstNo);
      seenGunluk.add(m.primaryGunlukIstNo);
    }
    expect(seenMerkez.size).toBe(81);
    expect(seenSondurum.size).toBe(81);
  });

  it("3b. audits all 1,102 catalog-1102 entries against provincial boundaries, preserves bursa-tr (TR-16), and verifies 11 frozen Bursa SHA-256 hashes", () => {
    expect(TR_NATIONAL_CATALOG).toHaveLength(1102);

    // Bursa TR-16 preservation check
    const bursaCenter = getTrCatalogEntryById("bursa-tr");
    expect(bursaCenter).toBeDefined();
    expect(bursaCenter!.provinceCode).toBe("TR-16");
    expect(bursaCenter!.plateNumber).toBe(16);
    expect(bursaCenter!.lat).toBeCloseTo(40.2308, 4);
    expect(bursaCenter!.lon).toBeCloseTo(29.0133, 4);
    expect(bursaCenter!.elevationM).toBe(100);
    expect(bursaCenter!.wmoId).toBe("17116");
    expect(pointInProvincePolygon(bursaCenter!.lat, bursaCenter!.lon, "TR-16")).toBe(true);

    for (const curated of BURSA_CURATED_LOCATIONS) {
      const hit = getTrCatalogEntryById(curated.id);
      expect(hit, `Missing curated Bursa entry ${curated.id}`).toBeDefined();
      expect(hit!.provinceCode).toBe("TR-16");
    }

    const tr16Entries = TR_NATIONAL_CATALOG.filter((e) => e.provinceCode === "TR-16");
    expect(tr16Entries).toHaveLength(19);
    for (const e of tr16Entries) {
      const res = resolveProvinceCode({
        lat: e.lat,
        lon: e.lon,
        admin1: e.provinceName,
        countryCode: "TR"
      });
      expect(res.provinceCode, `TR-16 entry ${e.id} escaped Bursa`).toBe("TR-16");
    }

    // All 81 province_center entries must resolve 100% to their own province
    for (const p of TR_PLATE_NUMBERS) {
      const code = `TR-${p}` as TrProvinceCode;
      const center = getTrProvinceCenterEntry(code);
      expect(center).toBeDefined();
      const res = resolveProvinceCode({
        lat: center!.lat,
        lon: center!.lon,
        admin1: center!.provinceName,
        countryCode: "TR"
      });
      expect(res.provinceCode, `Province center ${center!.id}`).toBe(code);
    }

    // Full 1,102 boundary audit: any unresolved entry must belong strictly to the 9 documented AUD03-CAT-01 IDs
    const documentedOutlierIds = new Set<string>([
      "tr-62-pulumur",
      "tr-76-karakoyunlu",
      "tr-54-akyazi",
      "tr-66-yerkoy",
      "tr-08-kemalpasa",
      "tr-31-arsuz",
      "tr-34-adalar",
      "tr-53-kackar-zirve",
      "tr-04-agri-dagi-zirve"
    ]);
    const unresolvedIds: string[] = [];

    for (const entry of TR_NATIONAL_CATALOG) {
      if (entry.mgmSondurumIstNo && entry.mgmSondurumIstNo > 0) {
        const stOwner = STATIC_MGM_ISTNO_OWNER_PROVINCE[entry.mgmSondurumIstNo];
        if (stOwner && stOwner !== entry.provinceCode) {
          expect(
            entry.mgmMerkezId !== undefined &&
              CROSS_PROVINCE_PROXY_MERKEZ_IDS.has(entry.mgmMerkezId),
            `Unflagged cross-province MGM station ${entry.mgmSondurumIstNo} on ${entry.id}`
          ).toBe(true);
        }
      }

      const res = resolveProvinceCode({
        lat: entry.lat,
        lon: entry.lon,
        admin1: entry.provinceName,
        countryCode: "TR"
      });
      if (res.provinceCode !== entry.provinceCode) {
        unresolvedIds.push(entry.id);
        expect(
          documentedOutlierIds.has(entry.id),
          `Undocumented catalog boundary mismatch: ${entry.id} (${entry.provinceCode} -> ${res.provinceCode})`
        ).toBe(true);
      }
    }
    expect(unresolvedIds.length).toBeLessThanOrEqual(9);

    // Independent SHA-256 verification of all 11 frozen Bursa files
    const manifestResult = verifyBursaImmutabilityManifest(REPO_ROOT);
    expect(manifestResult.ok).toBe(true);
    expect(manifestResult.checkedCount).toBe(11);
    expect(manifestResult.violations).toEqual([]);

    for (const [relPath, expectedHex] of Object.entries(BURSA_FROZEN_SHA256_MANIFEST)) {
      const rawBytes = fs.readFileSync(path.join(REPO_ROOT, relPath));
      const actualHex = crypto.createHash("sha256").update(rawBytes).digest("hex");
      expect(actualHex, `SHA-256 drift in ${relPath}`).toBe(expectedHex);
    }
  });

  it("4. validates completeness and truthfulness of reports/audit-aud03-calibration-leakage.json", () => {
    expect(fs.existsSync(AUDIT_REPORT_PATH)).toBe(true);
    const report = JSON.parse(fs.readFileSync(AUDIT_REPORT_PATH, "utf8"));

    expect(report.auditId).toBe("AUD-03");
    expect(report.writeLockRespected).toBe(true);
    expect(report.modifiedProductionFiles).toEqual([]);
    expect(report.criterion1_era5ZeroBan.matchesFound).toBe(0);
    expect(report.criterion2_tr80CalibrationAndSpecConsistency.totalNonBursaProvincesChecked).toBe(80);
    expect(report.criterion2_tr80CalibrationAndSpecConsistency.simplexVerification.totalVectorsChecked).toBe(2720);
    expect(report.criterion2_tr80CalibrationAndSpecConsistency.simplexVerification.violationsCount).toBe(0);
    expect(report.criterion2_tr80CalibrationAndSpecConsistency.tierBZeroInterceptVerification.violationsCount).toBe(0);
    expect(report.criterion3_disjointStationMetarCatalogAndBursaIntegrity.metarVerifyDisjointness.totalUniqueLtIcaos).toBe(67);
    expect(report.criterion3_disjointStationMetarCatalogAndBursaIntegrity.bursaImmutabilitySha256.checkedFileCount).toBe(11);

    const findingIds = new Set(
      (report.explicitDiscrepancyFindings as Array<{ id: string }>).map((f) => f.id)
    );
    expect(findingIds.has("AUD03-CAT-01")).toBe(true);
    expect(findingIds.has("AUD03-METAR-01")).toBe(true);
    expect(findingIds.has("AUD03-METAR-02")).toBe(true);
    expect(findingIds.has("AUD03-CAL-01")).toBe(true);
    expect(findingIds.has("AUD03-CAL-02")).toBe(true);
    expect(findingIds.has("AUD03-CAL-03")).toBe(true);
  });
});
