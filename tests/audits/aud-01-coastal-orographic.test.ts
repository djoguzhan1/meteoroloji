import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import {
  isIcaoAllowedForProvince,
  TURKEY_ICAO_WHITELIST_BY_PROVINCE
} from "@/lib/metar-verify";
import { TR81_CLIMATOLOGY_1991_2020 } from "@/lib/provinces/climatology-1991-2020";
import {
  applyDirectionalBarrierRules,
  applyVenturiCorridorRules,
  resolveProvinceTargetMetadata
} from "@/lib/provinces/engine/province-cressman";
import { computeSectorAlignmentCos } from "@/lib/provinces/engine/province-vertical-profile";
import {
  pointInProvincePolygon,
  resolveProvinceCode,
  TR_PROVINCE_NAMES_BY_CODE
} from "@/lib/provinces/geo-adm1-resolver";
import { TR81_HYPSOMETRIC_PROFILES } from "@/lib/provinces/hypsometric-bands-tr81";
import {
  loadProvinceCalibration,
  loadProvinceSpec,
  NON_BURSA_PROVINCE_CODES
} from "@/lib/provinces/registry";
import type { ProvinceSpec, TrProvinceCode } from "@/lib/provinces/types";

/**
 * ATMOS v5.0 — Wave 3D (`AUD-01`)
 * Zero-Context Independent Coastal, Strait, Sea-Effect (DEK) & Orographic Microclimate Audit Suite
 *
 * Covers all 45 explicitly listed coastal + pass-transition province specifications across
 * Marmara (excl. sovereign Vault-0 `TR-16` Bursa), Aegean, Mediterranean, and Black Sea belts.
 */
const AUD01_TARGET_CODES: readonly TrProvinceCode[] = Object.freeze([
  "TR-01", "TR-03", "TR-05", "TR-07", "TR-08", "TR-09", "TR-10", "TR-11", "TR-14",
  "TR-15", "TR-17", "TR-18", "TR-19", "TR-20", "TR-22", "TR-28", "TR-29", "TR-31",
  "TR-32", "TR-33", "TR-34", "TR-35", "TR-37", "TR-39", "TR-41", "TR-43", "TR-45",
  "TR-46", "TR-48", "TR-52", "TR-53", "TR-54", "TR-55", "TR-57", "TR-59", "TR-60",
  "TR-61", "TR-64", "TR-67", "TR-70", "TR-74", "TR-77", "TR-78", "TR-80", "TR-81"
]);

const AUD01_LANDLOCKED_CODES = new Set<TrProvinceCode>([
  "TR-03", "TR-05", "TR-11", "TR-14", "TR-15", "TR-18", "TR-19", "TR-20", "TR-29",
  "TR-32", "TR-43", "TR-45", "TR-46", "TR-60", "TR-64", "TR-70", "TR-78", "TR-80"
]);

const BLACK_SEA_COASTAL_CODES: readonly TrProvinceCode[] = Object.freeze([
  "TR-08", "TR-28", "TR-34", "TR-37", "TR-39", "TR-41",
  "TR-52", "TR-53", "TR-54", "TR-55", "TR-57", "TR-61",
  "TR-67", "TR-74", "TR-81"
]);

describe("AUD-01 — Coastal, Strait, Sea-Effect (DEK) & Orographic Microclimate Independent Audit", () => {
  const targetSpecs = new Map<TrProvinceCode, ProvinceSpec>();
  const all80Specs = new Map<TrProvinceCode, ProvinceSpec>();

  beforeAll(async () => {
    for (const code of NON_BURSA_PROVINCE_CODES) {
      const spec = await loadProvinceSpec(code);
      expect(spec, `Failed to load spec for ${code}`).not.toBeNull();
      all80Specs.set(code, spec!);
      if (AUD01_TARGET_CODES.includes(code)) {
        targetSpecs.set(code, spec!);
      }
    }
  });

  it("loads all 45 audited coastal + transition specs while keeping TR-16 Bursa sovereign (null)", async () => {
    expect(AUD01_TARGET_CODES).toHaveLength(45);
    expect(targetSpecs.size).toBe(45);
    expect(all80Specs.size).toBe(80);
    expect(await loadProvinceSpec("TR-16")).toBeNull();
  });

  it("Criterion 1 — Copy-Paste & Placebo Hunt: zero cloned stencil9Points, subBasins, coupling matrices, barriers, Venturi corridors, or qcAndMosBounds across all specs", () => {
    const stencilOffsetFingerprints = new Map<string, TrProvinceCode>();
    const stencilElevFingerprints = new Map<string, TrProvinceCode>();
    const subBasinIdFingerprints = new Map<string, TrProvinceCode>();
    const bcmOffDiagFingerprints = new Map<string, TrProvinceCode>();
    const barrierParamFingerprints = new Map<string, string>();
    const venturiParamFingerprints = new Map<string, string>();
    const qcFingerprints = new Set<string>();

    for (const [code, spec] of all80Specs.entries()) {
      const pc = spec.primaryCenter;
      const offsets = spec.stencil9Points
        .map((p) => `${(p.lat - pc.lat).toFixed(3)},${(p.lon - pc.lon).toFixed(3)}`)
        .sort()
        .join("|");
      const elevs = spec.stencil9Points
        .map((p) => p.elevationM)
        .slice()
        .sort((a, b) => a - b)
        .join(",");

      if (AUD01_TARGET_CODES.includes(code) || stencilOffsetFingerprints.has(offsets)) {
        expect(
          stencilOffsetFingerprints.get(offsets),
          `Cloned stencil9Points relative offsets between ${code} and ${stencilOffsetFingerprints.get(offsets)}`
        ).toBeUndefined();
      }
      stencilOffsetFingerprints.set(offsets, code);

      if (AUD01_TARGET_CODES.includes(code) || stencilElevFingerprints.has(elevs)) {
        expect(
          stencilElevFingerprints.get(elevs),
          `Cloned stencil9Points elevation vector between ${code} and ${stencilElevFingerprints.get(elevs)}`
        ).toBeUndefined();
      }
      stencilElevFingerprints.set(elevs, code);

      const sbIds = spec.subBasins.map((s) => s.id);
      const sbSig = sbIds.join("|");
      if (AUD01_TARGET_CODES.includes(code) || subBasinIdFingerprints.has(sbSig)) {
        expect(subBasinIdFingerprints.get(sbSig)).toBeUndefined();
      }
      subBasinIdFingerprints.set(sbSig, code);

      const offDiag: string[] = [];
      for (const r of sbIds) {
        for (const c of sbIds) {
          if (r !== c) offDiag.push(Number(spec.barrierCouplingMatrix[r]?.[c] ?? -1).toFixed(4));
        }
      }
      const bcmSig = offDiag.join(",");
      if (AUD01_TARGET_CODES.includes(code) || bcmOffDiagFingerprints.has(bcmSig)) {
        expect(
          bcmOffDiagFingerprints.get(bcmSig),
          `Cloned barrierCouplingMatrix off-diagonals between ${code} and ${bcmOffDiagFingerprints.get(bcmSig)}`
        ).toBeUndefined();
      }
      bcmOffDiagFingerprints.set(bcmSig, code);

      for (const b of spec.directionalBarriers) {
        const f = b.foehnSpec;
        const u = b.upslopeSpec;
        const bSig = JSON.stringify([
          b.effectiveBarrierHeightM,
          b.crestPressureHpa,
          f.enabled,
          f.windFromSectorDeg,
          f.minCrossCrestSpeedMs,
          f.minFroudeNumber,
          f.sourcePlateauElevationM,
          f.maxTargetElevationM,
          f.maxWarmingCapC,
          u.enabled,
          u.windFromSectorDeg,
          u.minOnshoreOrUpslopeSpeedMs,
          u.maxPrecipMultiplierCap
        ]);
        if (AUD01_TARGET_CODES.includes(code) || barrierParamFingerprints.has(bSig)) {
          expect(
            barrierParamFingerprints.get(bSig),
            `Cloned directionalBarrier parameters between ${code}:${b.id} and ${barrierParamFingerprints.get(bSig)}`
          ).toBeUndefined();
        }
        barrierParamFingerprints.set(bSig, `${code}:${b.id}`);
      }

      for (const vc of spec.venturiCorridors) {
        const vSig = JSON.stringify([
          vc.influenceRadiusKm,
          vc.channelAxisFromDeg,
          vc.bidirectional,
          vc.sectorHalfWidthDeg,
          vc.speedMultiplier,
          vc.gustMultiplier
        ]);
        if (AUD01_TARGET_CODES.includes(code) || venturiParamFingerprints.has(vSig)) {
          expect(
            venturiParamFingerprints.get(vSig),
            `Cloned venturiCorridor parameters between ${code}:${vc.id} and ${venturiParamFingerprints.get(vSig)}`
          ).toBeUndefined();
        }
        venturiParamFingerprints.set(vSig, `${code}:${vc.id}`);
      }
    }

    for (const code of AUD01_TARGET_CODES) {
      const q = targetSpecs.get(code)!.qcAndMosBounds;
      qcFingerprints.add(
        `${q.minPlausibleTempC}|${q.maxPlausibleTempC}|${q.minPlausibleMslpHpa}|${q.maxPlausibleMslpHpa}|${q.kalmanTempBiasCapC}`
      );
    }
    expect(qcFingerprints.size).toBe(45);
  });

  it("Criterion 1b — Synoptic & Orographic Reality Spot-Checks: Turkish Straits, Amanos/Belen, Gülek, Sertavul, Çubuk, Kaçkar, Hopa-Yusufeli, Küre DEK, İmbat, and Menteşe", () => {
    const tr17 = targetSpecs.get("TR-17")!;
    const tr34 = targetSpecs.get("TR-34")!;
    const dardanelles = applyVenturiCorridorRules({
      corridors: tr17.venturiCorridors,
      targetLat: 40.15,
      targetLon: 26.4,
      windDirDeg: 42,
      windSpeedKmh: 35
    });
    const bosphorus = applyVenturiCorridorRules({
      corridors: tr34.venturiCorridors,
      targetLat: 41.1,
      targetLon: 29.05,
      windDirDeg: 30,
      windSpeedKmh: 35
    });
    expect(dardanelles.speedMultiplier).toBeGreaterThan(1.25);
    expect(bosphorus.speedMultiplier).toBeGreaterThan(1.25);
    expect(bosphorus.suppressesNocturnalInversion).toBe(true);

    const tr31 = targetSpecs.get("TR-31")!;
    expect(tr31.venturiCorridors.some((v) => v.speedMultiplier >= 1.35)).toBe(true);
    expect(tr31.directionalBarriers.some((b) => b.foehnSpec.enabled && b.foehnSpec.maxWarmingCapC >= 4.5)).toBe(true);

    const tr01 = targetSpecs.get("TR-01")!;
    expect(tr01.venturiCorridors[0].speedMultiplier).toBeGreaterThanOrEqual(1.35);
    expect(tr01.directionalBarriers[0].foehnSpec.maxWarmingCapC).toBeGreaterThanOrEqual(5.0);

    const tr33 = targetSpecs.get("TR-33")!;
    const tr70 = targetSpecs.get("TR-70")!;
    expect(tr33.venturiCorridors[0].speedMultiplier).toBeGreaterThanOrEqual(1.4);
    expect(tr70.venturiCorridors[0].speedMultiplier).toBeGreaterThanOrEqual(1.4);

    const tr07 = targetSpecs.get("TR-07")!;
    expect(tr07.directionalBarriers[0].foehnSpec.enabled).toBe(true);
    expect(tr07.directionalBarriers[0].upslopeSpec.maxPrecipMultiplierCap).toBeGreaterThanOrEqual(1.55);
    expect(tr07.aridAndSevereDrivers.coastalWaterspoutSusceptibility).toBeGreaterThanOrEqual(0.75);

    const tr53 = targetSpecs.get("TR-53")!;
    expect(tr53.verticalProfileSpec.maxPhysicalPeakM).toBeGreaterThanOrEqual(3900);
    expect(tr53.directionalBarriers[0].foehnSpec.maxWarmingCapC).toBeGreaterThanOrEqual(9.5);

    const tr08 = targetSpecs.get("TR-08")!;
    expect(
      tr08.barrierCouplingMatrix.hopa_arhavi_kemalpasa_coast.yusufeli_inner_coruh_micro_med
    ).toBeLessThanOrEqual(0.15);

    for (const dekCode of ["TR-67", "TR-74", "TR-37"] as const) {
      const s = targetSpecs.get(dekCode)!;
      expect(s.waterBodies[0].effectiveFetchKm).toBeGreaterThanOrEqual(450);
      expect(s.waterBodies[0].dekWatchDeltaTC).toBeLessThanOrEqual(11.5);
    }
    const tr37 = targetSpecs.get("TR-37")!;
    expect(tr37.barrierCouplingMatrix.kure_black_sea_littoral.gokirmak_kastamonu_bowl).toBeLessThanOrEqual(0.1);

    const tr35 = targetSpecs.get("TR-35")!;
    expect(tr35.waterBodies[0].seaBreezeSpec.maxCoolingAmplitudeC).toBeGreaterThanOrEqual(3.0);
    const tr48 = targetSpecs.get("TR-48")!;
    expect(tr48.directionalBarriers[0].upslopeSpec.maxPrecipMultiplierCap).toBeGreaterThanOrEqual(1.5);
  });

  it("Criterion 2a — Primary Center Bounds & ADM1 Polygon Ownership: 45/45 primaryCenter coordinates lie inside domainBounds and resolve to own TR-XX code", () => {
    for (const code of AUD01_TARGET_CODES) {
      const spec = targetSpecs.get(code)!;
      const pc = spec.primaryCenter;
      const db = spec.domainBounds;

      expect(db.minLat).toBeLessThan(db.maxLat);
      expect(db.minLon).toBeLessThan(db.maxLon);
      expect(pc.lat, `${code} lat outside domainBounds`).toBeGreaterThanOrEqual(db.minLat);
      expect(pc.lat, `${code} lat outside domainBounds`).toBeLessThanOrEqual(db.maxLat);
      expect(pc.lon, `${code} lon outside domainBounds`).toBeGreaterThanOrEqual(db.minLon);
      expect(pc.lon, `${code} lon outside domainBounds`).toBeLessThanOrEqual(db.maxLon);

      const resolved = resolveProvinceCode({ lat: pc.lat, lon: pc.lon });
      expect(resolved.provinceCode, `${code} primaryCenter resolved to ${resolved.provinceCode}`).toBe(code);
    }
  });

  it("Criterion 2b — Vertical Profile Monotonicity & Reference Parity: snowElevationBands (b0 < b1 < b2 < b3) and piecewiseKnotsM strictly increasing across all 45 provinces", async () => {
    for (const code of AUD01_TARGET_CODES) {
      const spec = targetSpecs.get(code)!;
      const knots = spec.verticalProfileSpec.piecewiseKnotsM;
      const bands = spec.verticalProfileSpec.snowElevationBands;

      expect(knots).toHaveLength(4);
      expect(knots[0], `${code} k0 < k1`).toBeLessThan(knots[1]);
      expect(knots[1], `${code} k1 < k2`).toBeLessThan(knots[2]);
      expect(knots[2], `${code} k2 < k3`).toBeLessThan(knots[3]);
      expect(spec.verticalProfileSpec.maxPhysicalPeakM).toBeGreaterThanOrEqual(knots[3]);

      expect(bands.map((b) => b.id)).toEqual(["low", "center", "foothill", "summit"]);
      expect(bands[0].elevationM, `${code} b0 < b1`).toBeLessThan(bands[1].elevationM);
      expect(bands[1].elevationM, `${code} b1 < b2`).toBeLessThan(bands[2].elevationM);
      expect(bands[2].elevationM, `${code} b2 < b3`).toBeLessThan(bands[3].elevationM);
      expect(bands).toEqual(TR81_HYPSOMETRIC_PROFILES[code].bands);

      const clim = TR81_CLIMATOLOGY_1991_2020[code];
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toEqual(clim.tmaxC);
      expect(spec.primaryCenter.monthlyTminNormalsC).toEqual(clim.tminC);

      const cal = await loadProvinceCalibration(code);
      expect(cal).not.toBeNull();
      expect(spec.calibrationTier).toBe(cal!.calibrationTier);
    }
  });

  it("Criterion 2c — Barrier Coupling Matrix Integrity: full subBasin coverage, 1.0 diagonals, [0, 1] bounds, and zero orphan subBasin references across all 45 provinces", () => {
    for (const code of AUD01_TARGET_CODES) {
      const spec = targetSpecs.get(code)!;
      const sbIds = spec.subBasins.map((s) => s.id);
      const sbSet = new Set(sbIds);
      expect(sbSet.size, `${code} duplicate subBasin IDs`).toBe(sbIds.length);
      expect(sbIds.length).toBeGreaterThanOrEqual(3);

      expect(new Set(Object.keys(spec.barrierCouplingMatrix))).toEqual(sbSet);

      for (const rId of sbIds) {
        const row = spec.barrierCouplingMatrix[rId];
        expect(row, `${code} missing row ${rId}`).toBeDefined();
        expect(new Set(Object.keys(row))).toEqual(sbSet);

        for (const cId of sbIds) {
          const val = row[cId];
          expect(Number.isFinite(val), `${code} non-finite coupling ${rId}->${cId}`).toBe(true);
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThanOrEqual(1);
          if (rId === cId) {
            expect(val, `${code} diagonal ${rId} !== 1.0`).toBe(1.0);
          } else {
            expect(val, `${code} off-diagonal ${rId}->${cId} must be < 1.0`).toBeLessThan(1.0);
          }
        }
      }

      expect(sbSet.has(spec.primaryCenter.subBasinId), `${code} primaryCenter invalid subBasinId`).toBe(true);
      for (const st of Object.values(spec.stationOverrides)) {
        expect(sbSet.has(st.subBasinId), `${code} stationOverride ${st.stationId} invalid subBasinId`).toBe(true);
      }
      for (const br of spec.directionalBarriers) {
        for (const appId of br.applicableSubBasins) {
          expect(sbSet.has(appId), `${code} barrier ${br.id} invalid subBasin ${appId}`).toBe(true);
        }
      }
      for (const wb of spec.waterBodies) {
        for (const [sbKey, w] of Object.entries(wb.subBasinInfluenceWeights)) {
          expect(sbSet.has(sbKey), `${code} waterBody ${wb.id} invalid subBasin ${sbKey}`).toBe(true);
          expect(w).toBeGreaterThanOrEqual(0);
          expect(w).toBeLessThanOrEqual(1);
        }
      }

      expect(spec.stencil9Points).toHaveLength(9);
      expect(new Set(spec.stencil9Points.map((p) => p.key)).size).toBe(9);
      expect(spec.stencil9Points.some((p) => p.role === "target")).toBe(true);
    }
  });

  it("Criterion 2d — METAR Ownership Firewall: zero neighbor-province or foreign airport leakage in icaoWhitelist across all 45 provinces", () => {
    for (const code of AUD01_TARGET_CODES) {
      const spec = targetSpecs.get(code)!;
      const officialAllowed = TURKEY_ICAO_WHITELIST_BY_PROVINCE[code];
      const uniqueSpecIcaos = new Set(spec.icaoWhitelist);
      expect(uniqueSpecIcaos.size, `${code} duplicate ICAOs`).toBe(spec.icaoWhitelist.length);

      for (const icao of spec.icaoWhitelist) {
        expect(icao).toMatch(/^LT[A-Z]{2}$/);
        expect(
          isIcaoAllowedForProvince(icao, code),
          `${code} leaks unauthorized/neighbor ICAO ${icao} (official: ${officialAllowed.join(",")})`
        ).toBe(true);
      }
    }
  });

  it("Criterion 2e — Landlocked Marine & DEK Isolation: all 18 landlocked provinces in scope define ZERO open_sea/inland_sea bodies and ZERO Marine API usage", () => {
    expect(AUD01_LANDLOCKED_CODES.size).toBe(18);
    for (const code of AUD01_LANDLOCKED_CODES) {
      const spec = targetSpecs.get(code)!;
      for (const wb of spec.waterBodies) {
        expect(
          wb.kind,
          `Landlocked province ${code} illegally defines marine waterBody ${wb.id} (${wb.kind})`
        ).not.toBe("open_sea");
        expect(
          wb.kind,
          `Landlocked province ${code} illegally defines inland_sea waterBody ${wb.id}`
        ).not.toBe("inland_sea");
        expect(
          wb.useOpenMeteoMarineApi,
          `Landlocked province ${code} illegally enables Open-Meteo Marine API on ${wb.id}`
        ).toBe(false);
      }
    }

    for (const code of AUD01_TARGET_CODES) {
      if (!AUD01_LANDLOCKED_CODES.has(code)) {
        const spec = targetSpecs.get(code)!;
        expect(spec.waterBodies.length, `Coastal province ${code} missing waterBodies`).toBeGreaterThanOrEqual(1);
        for (const wb of spec.waterBodies) {
          expect(wb.dekWatchDeltaTC).toBeLessThan(wb.dekHeavyDeltaTC);
          expect(wb.monthlyWaterTempNormalsC).toHaveLength(12);
        }
      }
    }
  });

  it("Criterion 3 — Audit Report Artifact Integrity: reports/audit-aud01-coastal-orographic.json is complete and covers all 45 provinces", () => {
    const reportPath = path.resolve(process.cwd(), "reports/audit-aud01-coastal-orographic.json");
    expect(fs.existsSync(reportPath)).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    expect(parsed.auditMetadata.auditId).toBe("AUD-01");
    expect(parsed.summaryMetrics.auditedProvinceCount).toBe(45);
    expect(Object.keys(parsed.perProvinceAuditLedger).sort()).toEqual([...AUD01_TARGET_CODES].sort());
    expect(parsed.actionableDefects.length).toBeGreaterThanOrEqual(5);
  });

  // ==========================================================================
  // ACTIONABLE DEFECT GATES FOR ORCHESTRATOR REMEDIATION (AUD01-DEFECT-01..05)
  // ==========================================================================

  it("[AUD01-DEFECT-01] resolveProvinceTargetMetadata unhinted coordinate lookup must NOT latch onto spec.subBasins[0] (province-cressman.ts:169-171)", () => {
    const mismatches: string[] = [];
    for (const code of AUD01_TARGET_CODES) {
      if (code === "TR-55") continue; // Samsun Bafra-Çarşamba delta bbox spans across coastal core centroid
      const spec = targetSpecs.get(code)!;
      const pc = spec.primaryCenter;
      const resolved = resolveProvinceTargetMetadata(spec, {
        lat: pc.lat,
        lon: pc.lon,
        elevationM: pc.demVerifiedElevationM
      });
      if (resolved.subBasinId !== pc.subBasinId) {
        mismatches.push(
          `${code}: expected '${pc.subBasinId}', got '${resolved.subBasinId}' (subBasins[0]='${spec.subBasins[0].id}')`
        );
      }
    }
    expect(
      mismatches,
      `province-cressman.ts:169-171 mutates matchedSubBasinId on i=0 so later lower-score subBasins never win:\n${mismatches.join("\n")}`
    ).toEqual([]);
  });

  it("[AUD01-DEFECT-02] All curatedSubLocations must resolve to their own TR-XX province without triggering cross-province HTTP 400 mismatch (TR-17 tr-17-kazdaglari-zirve & TR-33 tr-33-sertavul-gecidi)", () => {
    const violations: string[] = [];
    for (const code of AUD01_TARGET_CODES) {
      const spec = targetSpecs.get(code)!;
      const pName = TR_PROVINCE_NAMES_BY_CODE[code];
      for (const sub of spec.curatedSubLocations) {
        const resNoHint = resolveProvinceCode({ lat: sub.lat, lon: sub.lon });
        const resApiRoute = resolveProvinceCode({
          lat: sub.lat,
          lon: sub.lon,
          admin1: `${pName} · Zirve`,
          countryCode: "TR"
        });
        if (resNoHint.provinceCode !== code || resApiRoute.provinceCode !== code) {
          violations.push(
            `${code} ${sub.id} (${sub.lat}, ${sub.lon}) -> unhinted=${resNoHint.provinceCode}, apiRoute=${resApiRoute.provinceCode}`
          );
        }
      }
    }
    expect(
      violations,
      `Cross-province curatedSubLocations cause /api/weather?pc=TR-XX HTTP 400 or neighbor bleed:\n${violations.join("\n")}`
    ).toEqual([]);
  });

  it("[AUD01-DEFECT-03] Windward coastal/mountain barriers without lee_shadow disambiguation must NOT self-shadow their own onshore upslope sector (TR-34, TR-43, TR-11)", () => {
    const selfShadowIssues: string[] = [];

    const tr34 = targetSpecs.get("TR-34")!;
    const sileTarget = resolveProvinceTargetMetadata(tr34, {
      lat: 41.1689,
      lon: 29.6005,
      elevationM: 83,
      subBasinId: "black_sea_north_belt"
    });
    const silePoyraz = applyDirectionalBarrierRules({
      spec: tr34,
      target: sileTarget,
      drivers: {
        localHour: 2,
        month: 1,
        isNight: true,
        cloudCoverPct: 90,
        wind850DirDeg: 10,
        wind850SpeedKmh: 17
      }
    });
    if (silePoyraz.activeRegime === "RAIN_SHADOW" || silePoyraz.precipMultiplier < 1.0) {
      selfShadowIssues.push(
        `TR-34 Şile (black_sea_north_belt) at 17 km/h 10° Poyraz got activeRegime='${silePoyraz.activeRegime}' precipMultiplier=${silePoyraz.precipMultiplier}`
      );
    }

    for (const code of AUD01_TARGET_CODES) {
      const spec = targetSpecs.get(code)!;
      for (const rule of spec.directionalBarriers) {
        if (!rule.upslopeSpec.enabled || !rule.rainShadowSpec) continue;
        let overlapDegCount = 0;
        let foehnAlsoOverlaps = true;
        for (let deg = 0; deg < 360; deg += 5) {
          const uIn = computeSectorAlignmentCos(
            deg,
            rule.upslopeSpec.windFromSectorDeg.fromDeg,
            rule.upslopeSpec.windFromSectorDeg.toDeg
          ).inside;
          const rsIn = computeSectorAlignmentCos(
            deg,
            rule.rainShadowSpec.shadowedWindFromSectorDeg.fromDeg,
            rule.rainShadowSpec.shadowedWindFromSectorDeg.toDeg
          ).inside;
          if (uIn && rsIn) {
            overlapDegCount++;
            const fIn =
              rule.foehnSpec.enabled &&
              computeSectorAlignmentCos(
                deg,
                rule.foehnSpec.windFromSectorDeg.fromDeg,
                rule.foehnSpec.windFromSectorDeg.toDeg
              ).inside;
            if (!fIn) foehnAlsoOverlaps = false;
          }
        }
        const hasStencilLee = spec.stencil9Points.some((p) => p.role === "lee_shadow");
        if (overlapDegCount > 0 && !(foehnAlsoOverlaps && hasStencilLee)) {
          selfShadowIssues.push(`${code}:${rule.id} (${overlapDegCount * 5}° upslope/rainShadow sector overlap)`);
        }
      }
    }

    expect(
      selfShadowIssues,
      `Barrier rules self-shadow their own windward upslope sector:\n${selfShadowIssues.join("\n")}`
    ).toEqual([]);
  });

  it("[AUD01-DEFECT-04] Marine sampleCoord on TR-10 south_marmara_bandirma_sea must lie over the Sea of Marmara rather than Kapıdağ Peninsula landmass", () => {
    const tr10 = targetSpecs.get("TR-10")!;
    const bandirmaSea = tr10.waterBodies.find((wb) => wb.id === "south_marmara_bandirma_sea")!;
    expect(bandirmaSea).toBeDefined();
    expect(
      pointInProvincePolygon(bandirmaSea.sampleCoord.lat, bandirmaSea.sampleCoord.lon, "TR-10"),
      `TR-10 south_marmara_bandirma_sea sampleCoord (${bandirmaSea.sampleCoord.lat}, ${bandirmaSea.sampleCoord.lon}) sits on Kapıdağ Peninsula dry land`
    ).toBe(false);
  });

  it("[AUD01-DEFECT-05] All 15 Black Sea coastal provinces must classify the Black Sea waterBody (fetch >= 350 km) consistently as kind='open_sea' (TR-08, TR-53, TR-61)", () => {
    const wrongKinds: string[] = [];
    for (const code of BLACK_SEA_COASTAL_CODES) {
      const spec = targetSpecs.get(code)!;
      const blackSeaBody = spec.waterBodies.find((wb) => wb.effectiveFetchKm >= 350);
      expect(blackSeaBody, `${code} missing Black Sea waterBody`).toBeDefined();
      if (blackSeaBody!.kind !== "open_sea") {
        wrongKinds.push(`${code}:${blackSeaBody!.id} -> kind='${blackSeaBody!.kind}'`);
      }
    }
    expect(
      wrongKinds,
      `Eastern Black Sea specs inconsistently use kind='inland_sea' instead of 'open_sea':\n${wrongKinds.join("\n")}`
    ).toEqual([]);
  });
});
