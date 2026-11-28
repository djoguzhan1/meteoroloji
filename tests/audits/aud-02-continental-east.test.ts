import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TURKEY_ICAO_WHITELIST_BY_PROVINCE } from "../../lib/metar-verify";
import { verifyBursaImmutabilityManifest } from "../../lib/provinces/bursa-vault-guard";
import { TR81_CLIMATOLOGY_1991_2020 } from "../../lib/provinces/climatology-1991-2020";
import { solveProvinceTopographicSurface } from "../../lib/provinces/engine/province-cressman";
import {
  computeProvinceLiveVerticalProfile,
  type ProvinceEngineSpec
} from "../../lib/provinces/engine/province-vertical-profile";
import { STATIC_MGM_ISTNO_OWNER_PROVINCE } from "../../lib/provinces/mgm-dem-repair";
import {
  loadProvinceCalibration,
  loadProvinceSpec,
  NON_BURSA_PROVINCE_CODES
} from "../../lib/provinces/registry";
import type { ProvinceSpec, TrProvinceCode } from "../../lib/provinces/types";
import { evaluateSeaEffectSnow } from "../../lib/snow-and-lightning-engine";

const REPO_ROOT = path.resolve(__dirname, "../..");
const REPORT_PATH = path.join(REPO_ROOT, "reports/audit-aud02-continental-east.json");

const AUD02_PROVINCE_CODES: readonly TrProvinceCode[] = [
  "TR-02", "TR-04", "TR-06", "TR-12", "TR-13", "TR-21", "TR-23", "TR-24", "TR-25",
  "TR-26", "TR-27", "TR-30", "TR-36", "TR-38", "TR-40", "TR-42", "TR-44", "TR-47",
  "TR-49", "TR-50", "TR-51", "TR-56", "TR-58", "TR-62", "TR-63", "TR-65", "TR-66",
  "TR-68", "TR-69", "TR-71", "TR-72", "TR-73", "TR-75", "TR-76", "TR-79"
] as const;

const NAMED_HIGH_EAST_PROVINCES: readonly TrProvinceCode[] = [
  "TR-04", // Ağrı (1632 m)
  "TR-25", // Erzurum (1895 m)
  "TR-30", // Hakkari (1727 m)
  "TR-36", // Kars (1775 m)
  "TR-65", // Van (1675 m)
  "TR-69", // Bayburt (1582 m)
  "TR-75"  // Ardahan (1829 m)
] as const;

const STRICT_LANDLOCKED_NO_SEA_CODES: readonly TrProvinceCode[] = [
  "TR-02", "TR-03", "TR-04", "TR-05", "TR-06", "TR-11", "TR-12", "TR-13", "TR-14",
  "TR-15", "TR-18", "TR-19", "TR-20", "TR-21", "TR-23", "TR-24", "TR-25", "TR-26",
  "TR-27", "TR-29", "TR-30", "TR-32", "TR-36", "TR-38", "TR-40", "TR-42", "TR-43",
  "TR-44", "TR-45", "TR-46", "TR-47", "TR-49", "TR-50", "TR-51", "TR-56", "TR-58",
  "TR-60", "TR-62", "TR-63", "TR-64", "TR-65", "TR-66", "TR-68", "TR-69", "TR-70",
  "TR-71", "TR-72", "TR-73", "TR-75", "TR-76", "TR-78", "TR-79", "TR-80"
] as const;

interface AuditDefectEntry {
  id: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  criterion: string;
  affectedProvinces: string[];
  files: string[];
  title: string;
  physicalMechanism: string;
  remediation: string;
}

interface AuditReportJson {
  auditId: string;
  wave: string;
  writeLockRespected: boolean;
  sealedBursaUntouched: boolean;
  scope: {
    primaryAuditedProvincesCount: number;
    primaryAuditedProvinceCodes: string[];
    nationalCrossCheckProvincesCount: number;
    sealedExcludedProvince: string;
  };
  defects: AuditDefectEntry[];
  provinceAuditMatrix: Array<{
    provinceCode: string;
    centerElevationM: number;
    deltaPressureTopHpa: number;
    findingIds: string[];
    verdict: string;
  }>;
}

function loadAuditReport(): AuditReportJson {
  expect(fs.existsSync(REPORT_PATH), "Audit JSON report must exist").toBe(true);
  return JSON.parse(fs.readFileSync(REPORT_PATH, "utf8")) as AuditReportJson;
}

describe("Wave 3D Independent Physical Meteorology Audit — AUD-02 (Continental, Siberian East, Lake Van LES & Mesopotamia)", () => {
  it("0. Enforces Bursa (TR-16) cryptographic immutability and loads all 35 AUD-02 + 80 national specs cleanly", async () => {
    const vault = verifyBursaImmutabilityManifest(REPO_ROOT);
    expect(vault.ok).toBe(true);
    expect(vault.checkedCount).toBe(11);
    expect(vault.violations).toEqual([]);

    expect(await loadProvinceSpec("TR-16")).toBeNull();
    expect(AUD02_PROVINCE_CODES.length).toBe(35);
    expect(NON_BURSA_PROVINCE_CODES.length).toBe(80);

    const report = loadAuditReport();
    expect(report.auditId).toBe("AUD-02");
    expect(report.writeLockRespected).toBe(true);
    expect(report.sealedBursaUntouched).toBe(true);
    expect(report.scope.primaryAuditedProvincesCount).toBe(35);
    expect(report.scope.nationalCrossCheckProvincesCount).toBe(80);
    expect(report.provinceAuditMatrix.length).toBe(35);
    expect(report.defects.length).toBeGreaterThanOrEqual(8);

    for (const code of NON_BURSA_PROVINCE_CODES) {
      const spec = await loadProvinceSpec(code);
      expect(spec, `Missing spec for ${code}`).not.toBeNull();
      expect(spec!.provinceCode).toBe(code);
      const sbIds = new Set(spec!.subBasins.map((sb) => sb.id));
      expect(sbIds.has(spec!.primaryCenter.subBasinId)).toBe(true);

      for (const sbA of sbIds) {
        expect(spec!.barrierCouplingMatrix[sbA], `${code} missing row ${sbA}`).toBeDefined();
        expect(spec!.barrierCouplingMatrix[sbA][sbA]).toBeCloseTo(1.0, 6);
        for (const sbB of sbIds) {
          const w = spec!.barrierCouplingMatrix[sbA][sbB];
          expect(w, `${code} missing coupling ${sbA}->${sbB}`).toBeGreaterThanOrEqual(0);
          expect(w).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("1. Criterion 1 — High-Altitude (>= 1500 m) Pressure & Siberian Inversion Physics (850 hPa Trap Audit)", async () => {
    const report = loadAuditReport();
    const def02 = report.defects.find((d) => d.id === "AUD02-DEF-02");
    expect(def02).toBeDefined();
    const def02Provinces = new Set(def02!.affectedProvinces);

    const highProvinces: ProvinceSpec[] = [];
    for (const code of NON_BURSA_PROVINCE_CODES) {
      const spec = (await loadProvinceSpec(code))!;
      if (spec.primaryCenter.demVerifiedElevationM >= 1500) {
        highProvinces.push(spec);
      }
      const dp = spec.inversionAndWedgeSpec.deltaPressureTopHpa;
      expect(Number.isFinite(dp)).toBe(true);
      const validDelta = dp >= 15 && dp <= 120;
      const validIsobar = dp >= 650 && dp <= 1005;
      expect(validDelta || validIsobar, `${code} invalid deltaPressureTopHpa=${dp}`).toBe(true);
    }

    for (const reqCode of NAMED_HIGH_EAST_PROVINCES) {
      expect(highProvinces.some((s) => s.provinceCode === reqCode)).toBe(true);
    }
    expect(highProvinces.some((s) => s.provinceCode === "TR-13")).toBe(true);

    for (const spec of highProvinces) {
      for (const barrier of spec.directionalBarriers) {
        expect(
          barrier.crestPressureHpa,
          `${spec.provinceCode} barrier ${barrier.id} crestPressureHpa=${barrier.crestPressureHpa} must be <= 750 hPa`
        ).toBeLessThanOrEqual(750);
      }
      for (const wb of spec.waterBodies) {
        expect(wb.convectiveInstabilityUpperHpa).toBe(700);
      }

      const dp = spec.inversionAndWedgeSpec.deltaPressureTopHpa;
      expect(dp).not.toBe(850);
      expect(dp).not.toBe(925);

      if (dp > 750) {
        expect(
          def02Provinces.has(spec.provinceCode),
          `Undocumented >=1500m deltaPressureTopHpa=${dp} > 750 in ${spec.provinceCode}`
        ).toBe(true);
      } else {
        expect(dp).toBeLessThanOrEqual(750);
      }
    }

    for (const code of ["TR-04", "TR-25", "TR-30", "TR-36", "TR-69", "TR-75"] as const) {
      const spec = (await loadProvinceSpec(code))!;
      expect(spec.inversionAndWedgeSpec.deltaPressureTopHpa).toBe(700);
    }

    // Physical simulation: Erzurum (TR-25) Siberian snowpack nocturnal inversion (Z_base=1758m, Z_i=2138m)
    const specErzurum = (await loadProvinceSpec("TR-25")) as ProvinceEngineSpec;
    const erzurumProfile = computeProvinceLiveVerticalProfile({
      spec: specErzurum,
      isNight: true,
      cloudCoverPct: 5,
      hasSnowpack: true,
      wind10mSpeedKmh: 3,
      wind850SpeedKmh: 8,
      stations: [
        {
          stationId: 17096,
          provinceCode: "TR-25",
          icaoId: "LTCE",
          lat: 39.9529,
          lon: 41.1897,
          elevationM: 1758,
          tempC: -31.4,
          snowDepthCm: 42,
          subBasinId: "KARASU_OVA_FLOOR"
        },
        {
          stationId: 17095,
          provinceCode: "TR-25",
          lat: 39.9058,
          lon: 41.2544,
          elevationM: 1895,
          tempC: -24.8,
          snowDepthCm: 36,
          subBasinId: "ERZURUM_FOOTHILL_THERMAL_BELT"
        },
        {
          stationId: 17777,
          provinceCode: "TR-25",
          lat: 39.8446,
          lon: 41.2905,
          elevationM: 2580,
          tempC: -19.2,
          snowDepthCm: 115,
          subBasinId: "PALANDOKEN_KARGAPAZARI_ALPINE"
        }
      ]
    });

    expect(erzurumProfile.valleyFloorM).toBe(1758);
    expect(erzurumProfile.coldPoolTopM).toBeGreaterThanOrEqual(2100);
    expect(erzurumProfile.snowpackAmplified).toBe(true);
    expect(erzurumProfile.lowerPoolLapseCPerKm).toBeGreaterThan(0);
    expect(erzurumProfile.inversionStrengthC).toBeGreaterThan(8.0);
    expect(erzurumProfile.boundaryLayerState).toBe("STRONG_INVERSION");
  });

  it("2. Criterion 2 — Cold-Basin / Altitude-Offset Airport Quarantine & Regional Plausible Bounds", async () => {
    const report = loadAuditReport();
    const def01Provinces = new Set(
      report.defects.find((d) => d.id === "AUD02-DEF-01")?.affectedProvinces ?? []
    );

    const spotlightChecks: ReadonlyArray<{
      code: TrProvinceCode;
      icao: string;
      mgmTwin?: string;
      expectDistinctSubBasin: boolean;
    }> = [
      { code: "TR-06", icao: "LTAC", expectDistinctSubBasin: true },
      { code: "TR-25", icao: "LTCE", mgmTwin: "17096", expectDistinctSubBasin: true },
      { code: "TR-58", icao: "LTAR", mgmTwin: "17091", expectDistinctSubBasin: true },
      { code: "TR-50", icao: "LTAZ", expectDistinctSubBasin: true },
      { code: "TR-30", icao: "LTCW", mgmTwin: "18771", expectDistinctSubBasin: true },
      { code: "TR-47", icao: "LTCR", mgmTwin: "17276", expectDistinctSubBasin: true },
      { code: "TR-04", icao: "LTCO", mgmTwin: "17104", expectDistinctSubBasin: false },
      { code: "TR-36", icao: "LTCF", mgmTwin: "17098", expectDistinctSubBasin: false },
      { code: "TR-23", icao: "LTCA", mgmTwin: "17202", expectDistinctSubBasin: false },
      { code: "TR-24", icao: "LTCD", mgmTwin: "17092", expectDistinctSubBasin: false },
      { code: "TR-44", icao: "LTAT", mgmTwin: "17200", expectDistinctSubBasin: true },
      { code: "TR-56", icao: "LTCL", mgmTwin: "17209", expectDistinctSubBasin: true },
      { code: "TR-63", icao: "LTCS", mgmTwin: "17271", expectDistinctSubBasin: false },
      { code: "TR-73", icao: "LTCV", mgmTwin: "17949", expectDistinctSubBasin: true },
      { code: "TR-76", icao: "LTCT", mgmTwin: "17763", expectDistinctSubBasin: false }
    ];

    for (const item of spotlightChecks) {
      const spec = (await loadProvinceSpec(item.code))!;
      expect(spec.icaoWhitelist).toContain(item.icao);
      expect(TURKEY_ICAO_WHITELIST_BY_PROVINCE[item.code]).toContain(item.icao);

      const icaoOv = spec.stationOverrides[item.icao];
      expect(icaoOv, `${item.code} missing override for ${item.icao}`).toBeDefined();
      expect(
        icaoOv.excludeFromCenterHeadline,
        `${item.code} ${item.icao} must set excludeFromCenterHeadline: true`
      ).toBe(true);

      if (item.mgmTwin) {
        const mgmOv = spec.stationOverrides[item.mgmTwin];
        expect(mgmOv, `${item.code} missing override for MGM twin ${item.mgmTwin}`).toBeDefined();
        expect(mgmOv.excludeFromCenterHeadline).toBe(true);
      }

      if (item.expectDistinctSubBasin) {
        expect(icaoOv.subBasinId).not.toBe(spec.primaryCenter.subBasinId);
        const coup =
          spec.barrierCouplingMatrix[spec.primaryCenter.subBasinId]?.[icaoOv.subBasinId] ?? 1;
        expect(
          coup,
          `${item.code} ${item.icao} cross-basin coupling=${coup} too high`
        ).toBeLessThanOrEqual(0.58);
      }
    }

    // Live Cressman decoupling proof: Mardin Artuklu ridge (1040 m, +6.5°C) vs Kızıltepe LTCR (523 m, -1.2°C)
    const specMardin = (await loadProvinceSpec("TR-47")) as ProvinceEngineSpec;
    const mardinCenterSolved = solveProvinceTopographicSurface({
      spec: specMardin,
      target: {
        lat: specMardin.primaryCenter.lat,
        lon: specMardin.primaryCenter.lon,
        elevationM: specMardin.primaryCenter.demVerifiedElevationM,
        subBasinId: specMardin.primaryCenter.subBasinId,
        urbanFraction: specMardin.primaryCenter.urbanFraction
      },
      drivers: {
        localHour: 4,
        month: 1,
        isNight: true,
        cloudCoverPct: 8,
        wind10mSpeedKmh: 5,
        wind10mDirDeg: 45
      },
      stations: [
        {
          stationId: 17275,
          provinceCode: "TR-47",
          lat: 37.3103,
          lon: 40.7284,
          elevationM: 1040,
          tempC: 6.5,
          subBasinId: "mardin_artuklu_escarpment_ridge",
          urbanFraction: 0.72,
          coldPoolSusceptibility: 0.08
        },
        {
          stationId: 17276,
          provinceCode: "TR-47",
          icaoId: "LTCR",
          lat: 37.2233,
          lon: 40.6317,
          elevationM: 523,
          tempC: -1.2,
          subBasinId: "kiziltepe_nusaybin_mesopotamian_plain",
          urbanFraction: 0.24,
          coldPoolSusceptibility: 0.84,
          excludeFromCenterHeadline: true
        },
        {
          stationId: 17280,
          provinceCode: "TR-21",
          icaoId: "LTCC",
          lat: 37.8939,
          lon: 40.201,
          elevationM: 686,
          tempC: -8.5
        }
      ]
    });

    expect(mardinCenterSolved).not.toBeNull();
    expect(mardinCenterSolved!.rejectedCrossBorderCount).toBe(1);
    expect(mardinCenterSolved!.tempC).toBeGreaterThan(5.5);

    const coldBenchmarkCodes: readonly TrProvinceCode[] = [
      "TR-04", "TR-12", "TR-13", "TR-25", "TR-30", "TR-36",
      "TR-49", "TR-58", "TR-65", "TR-69", "TR-75"
    ];
    for (const code of coldBenchmarkCodes) {
      const spec = (await loadProvinceSpec(code))!;
      expect(
        spec.qcAndMosBounds.minPlausibleTempC,
        `${code} minPlausibleTempC=${spec.qcAndMosBounds.minPlausibleTempC} must be <= -35°C`
      ).toBeLessThanOrEqual(-35);
    }
    expect((await loadProvinceSpec("TR-65"))!.qcAndMosBounds.minPlausibleTempC).toBeLessThanOrEqual(-46.5);
    expect((await loadProvinceSpec("TR-04"))!.qcAndMosBounds.minPlausibleTempC).toBeLessThanOrEqual(-45.6);

    const hotBenchmarkCodes: readonly TrProvinceCode[] = [
      "TR-02", "TR-21", "TR-47", "TR-56", "TR-63", "TR-72", "TR-73", "TR-79"
    ];
    for (const code of hotBenchmarkCodes) {
      const spec = (await loadProvinceSpec(code))!;
      expect(
        spec.qcAndMosBounds.maxPlausibleTempC,
        `${code} maxPlausibleTempC=${spec.qcAndMosBounds.maxPlausibleTempC} must be >= 46°C`
      ).toBeGreaterThanOrEqual(46);
    }
    expect((await loadProvinceSpec("TR-73"))!.qcAndMosBounds.maxPlausibleTempC).toBeGreaterThanOrEqual(50);

    const specEskisehir = (await loadProvinceSpec("TR-26"))!;
    if (specEskisehir.qcAndMosBounds.maxPlausibleTempC < 49.5) {
      expect(def01Provinces.has("TR-26")).toBe(true);
    } else {
      expect(specEskisehir.qcAndMosBounds.maxPlausibleTempC).toBeGreaterThanOrEqual(49.5);
    }
  });

  it("3. Criterion 3 — Lake Van (TR-65, TR-13) 700 hPa Alkaline LES, Inland False-DEK Reservoir Audit & Forbidden Station Bans (37787, 17120)", async () => {
    const report = loadAuditReport();
    const def00Provinces = new Set(
      report.defects.find((d) => d.id === "AUD02-DEF-00")?.affectedProvinces ?? []
    );

    // 3A. Lake Van on TR-65 (Van) and TR-13 (Bitlis)
    for (const vanCode of ["TR-65", "TR-13"] as const) {
      const spec = (await loadProvinceSpec(vanCode))!;
      expect(spec.waterBodies.length).toBeGreaterThanOrEqual(1);
      const lakeVan = spec.waterBodies[0];
      expect(lakeVan.kind).toBe("alkaline_lake");
      expect(lakeVan.surfaceElevationM).toBe(1648);
      expect(lakeVan.convectiveInstabilityUpperHpa).toBe(700);
      expect(lakeVan.useOpenMeteoMarineApi).toBe(false);
      expect(lakeVan.freezingPointC).toBeLessThanOrEqual(-1.2);
      expect(lakeVan.effectiveFetchKm).toBeGreaterThanOrEqual(100);
    }

    // Live 700 hPa Lake-Effect Snow (LES) verification on Van (850 hPa subterranean = null!)
    const specVan = (await loadProvinceSpec("TR-65"))!;
    const vanLes = evaluateSeaEffectSnow({
      lat: specVan.primaryCenter.lat,
      lon: specVan.primaryCenter.lon,
      provinceCode: "TR-65",
      waterBodies: specVan.waterBodies,
      liveWaterTempC: 4.2,
      temp850hPa: null,
      temp700hPa: -12.8,
      surfaceTempC: -1.5,
      windSpeedKmh: 28,
      windDirDeg: 285,
      precipMmHr: 1.4,
      month: 1
    });
    expect(vanLes.status).toBe("heavy_dek");
    expect(vanLes.deltaTSst850C).toBeCloseTo(17.0, 1);

    // 3B. Zero open_sea / inland_sea or Open-Meteo Marine API leakage + full 360° winter false-DEK sweep across ALL 54 landlocked provinces
    for (const code of STRICT_LANDLOCKED_NO_SEA_CODES) {
      const spec = (await loadProvinceSpec(code))!;
      expect(TR81_CLIMATOLOGY_1991_2020[code].isCoastal).toBe(false);

      for (const wb of spec.waterBodies) {
        expect(
          wb.kind === "open_sea" || wb.kind === "inland_sea",
          `Landlocked ${code} (${spec.nameTr}) illegally defines ${wb.kind} (${wb.id})`
        ).toBe(false);
        expect(
          wb.useOpenMeteoMarineApi,
          `Landlocked ${code} (${spec.nameTr}) illegally enables Open-Meteo Marine API on ${wb.id}`
        ).toBe(false);
      }

      if (code !== "TR-65" && code !== "TR-13") {
        expect(spec.aridAndSevereDrivers.coastalWaterspoutSusceptibility).toBe(0);

        // Sweep all wind directions under winter outbreak conditions to catch any false inland reservoir DEK
        let triggeredFalseDek = false;
        for (let dir = 0; dir < 360; dir += 15) {
          const res = evaluateSeaEffectSnow({
            lat: spec.primaryCenter.lat,
            lon: spec.primaryCenter.lon,
            provinceCode: code,
            waterBodies: spec.waterBodies,
            temp850hPa: -12,
            temp700hPa: -18,
            surfaceTempC: 0,
            windSpeedKmh: 25,
            windDirDeg: dir,
            precipMmHr: 0.8,
            month: 1
          });
          if (res.status !== "none") {
            triggeredFalseDek = true;
            break;
          }
        }

        if (triggeredFalseDek) {
          expect(
            def00Provinces.has(code),
            `Undocumented false inland DEK firing in landlocked ${code} (${spec.nameTr})`
          ).toBe(true);
        }
      }
    }

    // Dry continental interior & frozen Çıldır Lake provinces must strictly return 'none'
    for (const dryCode of [
      "TR-06", "TR-26", "TR-27", "TR-38", "TR-40",
      "TR-47", "TR-58", "TR-66", "TR-71", "TR-75", "TR-79"
    ] as const) {
      const spec = (await loadProvinceSpec(dryCode))!;
      const res = evaluateSeaEffectSnow({
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon,
        provinceCode: dryCode,
        waterBodies: spec.waterBodies,
        temp850hPa: -14,
        temp700hPa: -22,
        surfaceTempC: -2,
        windSpeedKmh: 30,
        windDirDeg: 330,
        precipMmHr: 1.2,
        month: 1
      });
      expect(res.status, `${dryCode} must never trigger false sea-effect snow`).toBe("none");
    }

    // 3C. Iğdır (TR-76) Foreign Station Ban (37787 / 37789 Yerevan, UDYZ, UDSG, UBBN)
    const specIgdir = (await loadProvinceSpec("TR-76"))!;
    const calIgdir = (await loadProvinceCalibration("TR-76"))!;
    expect(specIgdir.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(specIgdir.primaryCenter.wmoId).toBeUndefined();
    expect(specIgdir.icaoWhitelist).toEqual(["LTCT"]);
    expect(calIgdir.wmoStationId).toBeNull();
    expect(calIgdir.temperature.DJF.d0_1.interceptC).toBe(0);

    const forbiddenArmeniaTokens = ["37787", "37789", "UDYZ", "UDSG", "UBBN"];
    for (const tok of forbiddenArmeniaTokens) {
      expect(specIgdir.stationOverrides[tok]).toBeUndefined();
      expect(specIgdir.icaoWhitelist).not.toContain(tok);
      expect(STATIC_MGM_ISTNO_OWNER_PROVINCE[Number(tok)]).toBeUndefined();
    }
    const calIgdirRaw = fs.readFileSync(
      path.join(REPO_ROOT, "lib/provinces/emos-weights/tr-76.ts"),
      "utf8"
    );
    expect(/\b37787\b/.test(calIgdirRaw)).toBe(false);

    // 3D. Bilecik (TR-11) Fake Ankara/Akıncı 17120 WMO Archive Ban
    const specBilecik = (await loadProvinceSpec("TR-11"))!;
    const calBilecik = (await loadProvinceCalibration("TR-11"))!;
    expect(specBilecik.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(specBilecik.primaryCenter.wmoId).toBeUndefined();
    expect(specBilecik.icaoWhitelist).toEqual([]);
    expect(calBilecik.wmoStationId).toBeNull();
    expect(calBilecik.temperature.DJF.d0_1.interceptC).toBe(0);

    const calBilecikRaw = fs.readFileSync(
      path.join(REPO_ROOT, "lib/provinces/emos-weights/tr-11.ts"),
      "utf8"
    );
    expect(/\b17120\b/.test(calBilecikRaw)).toBe(false);

    expect(specBilecik.primaryCenter.lat).toBeCloseTo(40.1414, 3);
    expect(specBilecik.primaryCenter.lon).toBeCloseTo(29.9772, 3);
    expect(specBilecik.primaryCenter.demVerifiedElevationM).toBe(539);
    expect(TR81_CLIMATOLOGY_1991_2020["TR-11"].tminC[0]).toBeGreaterThan(-1.5);
  });
});
