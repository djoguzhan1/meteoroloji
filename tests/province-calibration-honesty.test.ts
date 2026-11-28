import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  type EmosHorizonSliceKey,
  loadProvinceCalibrationBundle,
  type ProvinceCalibrationBundle
} from "../lib/provinces/emos-weights";
import {
  type HorizonBucket,
  type SeasonBucket,
  type SimplexModelWeightMap,
  TR_PLATE_NUMBERS,
  type TrProvinceCode
} from "../lib/provinces/types";

const REPO_ROOT = path.resolve(__dirname, "..");
const WEIGHTS_DIR = path.join(REPO_ROOT, "lib/provinces/emos-weights");
const AUDIT_JSON_PATH = path.join(REPO_ROOT, "reports/tr80-calibration-cv-audit.json");

const SEASONS: readonly SeasonBucket[] = ["DJF", "MAM", "JJA", "SON"];
const SLICE_HORIZONS: readonly EmosHorizonSliceKey[] = ["short_0_72h", "medium_73_240h"];
const CELL_HORIZONS: readonly HorizonBucket[] = ["d0_1", "d2_4", "d5_7"];
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

function assertValidSimplex(w: SimplexModelWeightMap, context: string): void {
  let sum = 0;
  for (const k of MODEL_KEYS) {
    const val = w[k];
    expect(Number.isFinite(val), `${context}.${k} must be finite`).toBe(true);
    expect(val, `${context}.${k} must be >= 0`).toBeGreaterThanOrEqual(0);
    sum += val;
  }
  expect(Math.abs(sum - 1.0), `${context} sum=${sum} must equal 1.0`).toBeLessThan(1e-5);
}

describe("Wave 4 Honest TR-80 WMO & Donor Calibration Suite (CAL-01..08)", () => {
  const nonBursaPlates = TR_PLATE_NUMBERS.filter((p) => p !== "16");

  it("loads all 80 national provinces (TR-01..TR-81 except TR-16 Bursa) with exact 60 Tier-A and 20 Tier-B split", async () => {
    expect(nonBursaPlates.length).toBe(80);
    expect(fs.existsSync(path.join(WEIGHTS_DIR, "tr-16.ts"))).toBe(false);
    expect(await loadProvinceCalibrationBundle("TR-16")).toBeNull();

    const loaded: ProvinceCalibrationBundle[] = [];
    for (const plate of nonBursaPlates) {
      const filePath = path.join(WEIGHTS_DIR, `tr-${plate}.ts`);
      expect(fs.existsSync(filePath), `Missing tr-${plate}.ts`).toBe(true);

      const code = `TR-${plate}` as TrProvinceCode;
      const bundle = await loadProvinceCalibrationBundle(code);
      expect(bundle, `Null bundle for ${code}`).not.toBeNull();
      expect(bundle!.provinceCode).toBe(code);
      expect(bundle!.plateNumber).toBe(Number(plate));

      const mod = (await import(`../lib/provinces/emos-weights/tr-${plate}.ts`)) as Record<
        string,
        unknown
      >;
      expect(mod[`PROVINCE_CALIBRATION_TR_${plate}`]).toBeDefined();
      expect(mod.default).toEqual(bundle);
      loaded.push(bundle!);
    }

    const tierA = loaded.filter((b) => b.tier === "TIER_A_EMPIRICAL_WMO");
    const tierB = loaded.filter((b) => b.tier === "TIER_B_DONOR_ALARO");
    expect(tierA.length).toBe(60);
    expect(tierB.length).toBe(20);

    for (const a of tierA) {
      expect(a.calibrationTier).toBe("TIER_A_WMO");
      expect(a.wmoStationId).toBeTruthy();
      expect(a.matchedHours2024_2025).toBeGreaterThanOrEqual(15000);
    }
    for (const b of tierB) {
      expect(b.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
      expect(b.wmoStationId).toBeNull();
      expect(b.alaroAnchorWeight0to72h).toBe(0.24);
    }
  });

  it("contains zero forbidden reanalysis or misassigned/foreign station tokens across all generated files", () => {
    const forbiddenReanalysis = new RegExp(["ER", "A5"].join(""), "i");
    const forbiddenBilecikAnkaraCollision = new RegExp(`\\b${["17", "120"].join("")}\\b`);
    const forbiddenForeignArmenia = new RegExp(`\\b${["37", "787"].join("")}\\b`);

    const filesToScan = [
      path.join(WEIGHTS_DIR, "index.ts"),
      path.join(REPO_ROOT, "scripts/calibrate-tr80-honest-wmo.mjs"),
      AUDIT_JSON_PATH,
      ...nonBursaPlates.map((p) => path.join(WEIGHTS_DIR, `tr-${p}.ts`))
    ];

    for (const fp of filesToScan) {
      const content = fs.readFileSync(fp, "utf8");
      const rel = path.relative(REPO_ROOT, fp);
      expect(forbiddenReanalysis.test(content), `Forbidden reanalysis token in ${rel}`).toBe(false);
      expect(
        forbiddenBilecikAnkaraCollision.test(content),
        `Forbidden misassigned WMO ID in ${rel}`
      ).toBe(false);
      expect(forbiddenForeignArmenia.test(content), `Forbidden foreign WMO ID in ${rel}`).toBe(
        false
      );
    }
  });

  it("enforces exact probability simplex invariants across all 80 provinces x 8 seasonal-horizon slices (640 vectors)", async () => {
    let checkedSliceVectors = 0;

    for (const plate of nonBursaPlates) {
      const code = `TR-${plate}` as TrProvinceCode;
      const bundle = (await loadProvinceCalibrationBundle(code))!;

      assertValidSimplex(bundle.windWeights, `${code}.windWeights`);
      assertValidSimplex(bundle.pressureWeights, `${code}.pressureWeights`);

      for (const season of SEASONS) {
        assertValidSimplex(
          bundle.precipitation[season].weights,
          `${code}.precipitation.${season}`
        );

        for (const hCell of CELL_HORIZONS) {
          const cell = bundle.temperature[season][hCell];
          assertValidSimplex(cell.weights, `${code}.temperature.${season}.${hCell}`);
          expect(cell.spreadBaseC2).toBeGreaterThan(0);
          expect(cell.spreadScale).toBeGreaterThan(0);
        }

        for (const hSlice of SLICE_HORIZONS) {
          const sl = bundle.slices[season][hSlice];
          assertValidSimplex(sl.weights, `${code}.slices.${season}.${hSlice}.weights`);
          assertValidSimplex(
            sl.precip.weights,
            `${code}.slices.${season}.${hSlice}.precip.weights`
          );
          expect(sl.betaDrivers.length).toBe(6);
          checkedSliceVectors++;
        }
      }
    }

    expect(checkedSliceVectors).toBe(640);
  });

  it("seals all 20 Tier-B provinces with strictly zero intercept, zero driver betas, and transparent Tier-A donor weights", async () => {
    const tierASet = new Set<TrProvinceCode>();
    const allBundles: ProvinceCalibrationBundle[] = [];
    for (const plate of nonBursaPlates) {
      const b = (await loadProvinceCalibrationBundle(`TR-${plate}` as TrProvinceCode))!;
      allBundles.push(b);
      if (b.tier === "TIER_A_EMPIRICAL_WMO") tierASet.add(b.provinceCode);
    }

    const tierBBundles = allBundles.filter((b) => b.tier === "TIER_B_DONOR_ALARO");
    expect(tierBBundles.length).toBe(20);

    for (const b of tierBBundles) {
      expect(b.donorStations?.length).toBeGreaterThanOrEqual(2);
      expect(b.donorStations?.length).toBeLessThanOrEqual(3);
      const donorWeightSum = (b.donorStations ?? []).reduce((acc, d) => acc + d.weight, 0);
      expect(Math.abs(donorWeightSum - 1.0)).toBeLessThan(1e-6);

      for (const d of b.donorStations ?? []) {
        expect(tierASet.has(d.provinceCode), `${b.provinceCode} donor ${d.provinceCode} must be Tier-A`).toBe(true);
        expect(d.wmoStationId).toBeTruthy();
      }

      for (const season of SEASONS) {
        expect(b.precipitation[season].alaroBlendWeight0To36h).toBe(0.24);
        for (const hSlice of SLICE_HORIZONS) {
          const sl = b.slices[season][hSlice];
          expect(sl.intercept).toBe(0);
          expect(sl.maxResidualShiftC).toBe(0);
          expect(sl.betaDrivers.every((v) => v === 0)).toBe(true);
        }
        for (const hCell of CELL_HORIZONS) {
          const cell = b.temperature[season][hCell];
          expect(cell.interceptC).toBe(0);
          expect(cell.diurnalHarmonicsC.every((v) => v === 0)).toBe(true);
          expect(cell.driverBetasC.every((v) => v === 0)).toBe(true);
        }
      }
    }
  });

  it("proves out-of-sample 168h-purged CV MAE and PoP Brier improvement across the 60 Tier-A provinces in audit report", () => {
    expect(fs.existsSync(AUDIT_JSON_PATH)).toBe(true);
    const audit = JSON.parse(fs.readFileSync(AUDIT_JSON_PATH, "utf8"));

    expect(audit.reanalysisSurrogatesUsed).toBe(false);
    expect(audit.excludedSealedProvince).toBe("TR-16");
    expect(audit.counts.totalNationalProvincesCalibrated).toBe(80);
    expect(audit.counts.tierAEmpiricalWmoCount).toBe(60);
    expect(audit.counts.tierBDonorAlaroCount).toBe(20);
    expect(audit.nationalTierASummary.all60BeatOrMatchRawBenchmark).toBe(true);

    expect(audit.nationalTierASummary.meanOutOfSampleCalibratedMaeC).toBeLessThan(
      audit.nationalTierASummary.meanRawIfsMaeC
    );
    expect(audit.nationalTierASummary.meanOutOfSampleCalibratedMaeC).toBeLessThan(
      audit.nationalTierASummary.meanRawEqualEnsembleMaeC
    );
    expect(audit.nationalTierASummary.meanOutOfSampleCalibratedPopBrier).toBeLessThan(
      audit.nationalTierASummary.meanRawPopBrier
    );

    expect(audit.tierAProvinces.length).toBe(60);
    for (const row of audit.tierAProvinces) {
      expect(row.matchedHours).toBeGreaterThanOrEqual(15000);
      const rawBench = Math.min(row.rawIfsMaeC, row.rawEqualMaeC);
      expect(row.cvCalibratedMaeC).toBeLessThanOrEqual(rawBench + 1e-4);
    }
  });
});
