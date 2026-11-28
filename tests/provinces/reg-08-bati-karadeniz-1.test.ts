import { describe, expect, it } from "vitest";
import {
  getTrCatalogEntryById,
  searchTrNationalCatalog,
  TR_NATIONAL_CATALOG
} from "../../lib/provinces/catalog-1102";
import {
  applyDirectionalBarrierRules,
  applyVenturiCorridorRules,
  resolveProvinceTargetMetadata,
  solveProvinceTopographicSurface
} from "../../lib/provinces/engine/province-cressman";
import { evaluateProvinceCalibratedHour } from "../../lib/provinces/engine/province-mos-engine";
import {
  computeProvinceLiveVerticalProfile,
  integrateProvinceVerticalDeltaC,
  type ProvinceEngineSpec
} from "../../lib/provinces/engine/province-vertical-profile";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import {
  interpolateProvinceOrographicWeight,
  TR81_HYPSOMETRIC_PROFILES
} from "../../lib/provinces/hypsometric-bands-tr81";
import { STATIC_MGM_ISTNO_OWNER_PROVINCE } from "../../lib/provinces/mgm-dem-repair";
import PROVINCE_SPEC_TR_14_DEFAULT, {
  PROVINCE_SPEC_TR_14,
  TR_14_SNOW_BASIN_META
} from "../../lib/provinces/specs/tr-14";
import PROVINCE_SPEC_TR_67_DEFAULT, {
  PROVINCE_SPEC_TR_67,
  TR_67_CALIBRATION_ANCHOR_META
} from "../../lib/provinces/specs/tr-67";
import PROVINCE_SPEC_TR_74_DEFAULT, {
  PROVINCE_SPEC_TR_74,
  TR_74_CALIBRATION_ANCHOR_META
} from "../../lib/provinces/specs/tr-74";
import PROVINCE_SPEC_TR_81_DEFAULT, {
  PROVINCE_SPEC_TR_81,
  TR_81_BOWL_INVERSION_META
} from "../../lib/provinces/specs/tr-81";
import type { ProvinceSpec, TrProvinceCode } from "../../lib/provinces/types";

const REG_08_SPECS: readonly ProvinceSpec[] = [
  PROVINCE_SPEC_TR_14,
  PROVINCE_SPEC_TR_67,
  PROVINCE_SPEC_TR_74,
  PROVINCE_SPEC_TR_81
];

function collectNumericMgmStationIds(spec: ProvinceSpec): number[] {
  const ids = new Set<number>([
    spec.primaryCenter.mgmIstNo,
    spec.primaryCenter.mgmSaatlikIstNo
  ]);
  for (const [key, ov] of Object.entries(spec.stationOverrides)) {
    const kNum = Number(key);
    if (Number.isFinite(kNum) && kNum > 0) ids.add(kNum);
    const sid = Number(ov.stationId);
    if (Number.isFinite(sid) && sid > 0) ids.add(sid);
  }
  for (const wb of spec.waterBodies) {
    for (const mId of wb.mgmMarineStationIds) {
      ids.add(mId);
    }
  }
  return [...ids];
}

describe("Wave 3A REG-08: Western Black Sea DEK Wall & Bolu/Düzce Mountain Bowls (TR-14, TR-67, TR-74, TR-81)", () => {
  it("exports frozen, contract-complete ProvinceSpecs with valid ADM1 polygon containment and symmetric barrier matrices", () => {
    expect(PROVINCE_SPEC_TR_14_DEFAULT).toBe(PROVINCE_SPEC_TR_14);
    expect(PROVINCE_SPEC_TR_67_DEFAULT).toBe(PROVINCE_SPEC_TR_67);
    expect(PROVINCE_SPEC_TR_74_DEFAULT).toBe(PROVINCE_SPEC_TR_74);
    expect(PROVINCE_SPEC_TR_81_DEFAULT).toBe(PROVINCE_SPEC_TR_81);

    for (const spec of REG_08_SPECS) {
      expect(spec.region).toBe("BLACK_SEA_WEST_CENTRAL");
      expect(spec.climateRegion).toBe("KARADENIZ");
      expect(spec.curatedSubLocations).toHaveLength(4);
      expect(spec.stencil9Points).toHaveLength(9);

      const knots = spec.verticalProfileSpec.piecewiseKnotsM;
      expect(knots[0]).toBeLessThan(knots[1]);
      expect(knots[1]).toBeLessThan(knots[2]);
      expect(knots[2]).toBeLessThan(knots[3]);
      expect(knots[3]).toBeLessThanOrEqual(spec.verticalProfileSpec.maxPhysicalPeakM);

      const subBasinIds = spec.subBasins.map((sb) => sb.id);
      for (const a of subBasinIds) {
        expect(spec.barrierCouplingMatrix[a]?.[a]).toBe(1.0);
        for (const b of subBasinIds) {
          const ab = spec.barrierCouplingMatrix[a]?.[b];
          const ba = spec.barrierCouplingMatrix[b]?.[a];
          expect(ab).toBeGreaterThan(0);
          expect(ab).toBeLessThanOrEqual(1.0);
          expect(ab).toBeCloseTo(ba, 6);
        }
      }

      for (const ov of Object.values(spec.stationOverrides)) {
        expect(subBasinIds).toContain(ov.subBasinId);
      }

      // Primary center and all 4 curated sub-locations must resolve strictly to their own province!
      const centerRes = resolveProvinceCode({
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon,
        admin1: spec.nameTr,
        countryCode: "TR"
      });
      expect(centerRes.provinceCode).toBe(spec.provinceCode);

      for (const sub of spec.curatedSubLocations) {
        const resolved = resolveProvinceCode({
          lat: sub.lat,
          lon: sub.lon,
          admin1: spec.nameTr,
          countryCode: "TR"
        });
        expect(
          resolved.provinceCode,
          `Curated location ${sub.id} leaked to ${resolved.provinceCode}`
        ).toBe(spec.provinceCode);
      }
    }
  });

  it("TR-67 Zonguldak: enforces 480 km DEK upslope (1.50x on 300°-50°) vs +4.8°C southerly Lodos Foehn asymmetry, LTAS valley fog unbiasing, and Kdz. Ereğli disambiguation", () => {
    expect(PROVINCE_SPEC_TR_67.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_67.primaryCenter.wmoId).toBe("17022");
    expect(PROVINCE_SPEC_TR_67.icaoWhitelist).toEqual(["LTAS"]);
    expect(TR_67_CALIBRATION_ANCHOR_META.allowedMetarIcaos).toEqual(["LTAS"]);

    const wb = PROVINCE_SPEC_TR_67.waterBodies[0];
    expect(wb.kind).toBe("open_sea");
    expect(wb.effectiveFetchKm).toBe(480);
    expect(wb.onshoreWindSectorDeg).toEqual({ fromDeg: 300, toDeg: 50 });

    const zonguldakCoastTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_67, {
      lat: 41.4492,
      lon: 31.7779,
      elevationM: 135
    });

    // 1. NW–NE Karayel/Yıldız/Poyraz (345°, 58 km/h) -> Heavy DEK / Thundersnow upslope (1.50x cap, 0 Foehn warming)
    const dekEffect = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_67,
      target: zonguldakCoastTarget,
      drivers: {
        localHour: 3,
        month: 1,
        isNight: true,
        cloudCoverPct: 95,
        wind850DirDeg: 345,
        wind850SpeedKmh: 58,
        wind10mDirDeg: 340,
        wind10mSpeedKmh: 42
      }
    });
    expect(dekEffect.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(dekEffect.precipMultiplier).toBeCloseTo(1.5, 2);
    expect(dekEffect.foehnTempDeltaC).toBe(0);

    // 2. Southerly Lodos (195°, 72 km/h) descending Küre/Bolu-Alaplı ridges -> +4.8°C Foehn warming & sharp RH drying
    const foehnEffect = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_67,
      target: { ...zonguldakCoastTarget, elevationM: 45 },
      drivers: {
        localHour: 14,
        month: 1,
        isNight: false,
        cloudCoverPct: 35,
        wind850DirDeg: 195,
        wind850SpeedKmh: 72,
        wind10mDirDeg: 190,
        wind10mSpeedKmh: 46,
        bruntVaisalaFreqS1: 0.0095
      }
    });
    expect(foehnEffect.activeRegime).toBe("FOEHN_LEE");
    expect(foehnEffect.foehnTempDeltaC).toBeGreaterThan(3.8);
    expect(foehnEffect.foehnTempDeltaC).toBeLessThanOrEqual(4.8);
    expect(foehnEffect.foehnRhDeltaPct).toBeLessThan(-10);
    expect(foehnEffect.precipMultiplier).toBeLessThan(0.8);

    // 3. Filyos / Çaycuma LTAS rural valley fog/frost pocket is decoupled & penalized vs urban Zonguldak cliff
    const surface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_67,
      target: { lat: 41.4492, lon: 31.7779, elevationM: 135 },
      stations: [
        {
          stationId: 17022,
          provinceCode: "TR-67",
          lat: 41.4492,
          lon: 31.7779,
          elevationM: 135,
          tempC: 7.4,
          relHumidityPct: 68
        },
        {
          stationId: "LTAS",
          icaoId: "LTAS",
          provinceCode: "TR-67",
          lat: 41.5064,
          lon: 32.0886,
          elevationM: 13,
          tempC: 1.2,
          relHumidityPct: 98
        }
      ],
      drivers: {
        localHour: 4,
        month: 12,
        isNight: true,
        cloudCoverPct: 15,
        wind10mSpeedKmh: 4
      }
    });
    expect(surface).not.toBeNull();
    expect(surface!.tempC).toBeGreaterThan(6.5);
    const ltasContribution = surface!.contributions.find((c) => c.stationId === "LTAS");
    expect(ltasContribution?.usedColdBasinUnbias).toBe(true);
    expect(ltasContribution!.normalizedWeight).toBeLessThan(0.05);

    // 4. Kdz. Ereğli (`tr-67-eregli`) never collides with Konya Ereğli (`tr-42-eregli`)
    const kdzEregli = getTrCatalogEntryById("tr-67-eregli");
    const konyaEregli = getTrCatalogEntryById("tr-42-eregli");
    expect(kdzEregli).toBeDefined();
    expect(konyaEregli).toBeDefined();
    expect(kdzEregli!.provinceCode).toBe("TR-67");
    expect(konyaEregli!.provinceCode).toBe("TR-42");
    const kdzMatches = searchTrNationalCatalog("Karadeniz Ereğli");
    expect(kdzMatches[0]?.id).toBe("tr-67-eregli");
  });

  it("TR-74 Bartın: models 490 km Amasra–Kurucaşile DEK coast + Küre Foehn, 30 m Bartın River fog bowl decoupling, empty METAR lock (no LTAS leak), and honest Tier-B calibration", () => {
    expect(PROVINCE_SPEC_TR_74.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(TR_74_CALIBRATION_ANCHOR_META.mosTier).toBe("TIER_B_DONOR_ALARO");
    expect(PROVINCE_SPEC_TR_74.icaoWhitelist).toEqual([]);
    expect(PROVINCE_SPEC_TR_74.icaoWhitelist).not.toContain("LTAS");

    const wb = PROVINCE_SPEC_TR_74.waterBodies[0];
    expect(wb.effectiveFetchKm).toBe(490);
    expect(wb.onshoreWindSectorDeg).toEqual({ fromDeg: 295, toDeg: 55 });

    // Amasra coast (exposed maritime) vs Bartın Merkez (33m sheltered river bowl behind coastal ridge)
    const amasraToBowlCoupling =
      PROVINCE_SPEC_TR_74.barrierCouplingMatrix.TR74_BARTIN_RIVER_BOWL
        .TR74_AMASRA_KURUCASILE_CLIFF_COAST;
    expect(amasraToBowlCoupling).toBeLessThanOrEqual(0.45);
    expect(PROVINCE_SPEC_TR_74.stationOverrides["17020"].coldPoolSusceptibility).toBeGreaterThanOrEqual(0.7);
    expect(PROVINCE_SPEC_TR_74.stationOverrides["17602"].coldPoolSusceptibility).toBeLessThanOrEqual(0.1);

    // Amasra DEK upslope vs Southerly Küre Foehn asymmetry
    const amasraTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_74, {
      lat: 41.7465,
      lon: 32.3865,
      elevationM: 25
    });
    const dek = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_74,
      target: amasraTarget,
      drivers: {
        localHour: 2,
        month: 2,
        isNight: true,
        cloudCoverPct: 92,
        wind850DirDeg: 335,
        wind850SpeedKmh: 56
      }
    });
    const foehn = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_74,
      target: amasraTarget,
      drivers: {
        localHour: 13,
        month: 2,
        isNight: false,
        cloudCoverPct: 30,
        wind850DirDeg: 190,
        wind850SpeedKmh: 66,
        bruntVaisalaFreqS1: 0.0096
      }
    });
    expect(dek.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(dek.precipMultiplier).toBeGreaterThanOrEqual(1.4);
    expect(foehn.activeRegime).toBe("FOEHN_LEE");
    expect(foehn.foehnTempDeltaC).toBeGreaterThan(3.2);

    // Honest Tier-B MOS check: strictly zero intercept + MGM ALARO 4.5 km mesoscale fusion
    const tierBResult = evaluateProvinceCalibratedHour({
      leadHours: 12,
      localHour: 6,
      month: 1,
      spec: PROVINCE_SPEC_TR_74,
      mosPackage: {
        tier: "TIER_B_DONOR_ALARO",
        weights: { ecmwfIfs: 0.35, icon: 0.3, ecmwfAifs: 0.2, ukmo: 0.1, gfs: 0.05 },
        interceptC: 2.9, // must be forced to 0.0 by honest Tier-B contract!
        alaroBlendMaxWeight: 0.3
      },
      tempSnapshot: {
        ecmwfIfs: 3.0,
        icon: 2.4,
        ecmwfAifs: 2.8,
        ukmo: 2.6,
        gfs: 2.5
      },
      mgmAlaroHourly: { tempC: 1.6, rhPct: 94, isWet: false }
    });
    expect(tierBResult.tier).toBe("TIER_B_DONOR_ALARO");
    expect(tierBResult.appliedInterceptC).toBe(0);
    expect(tierBResult.appliedAlaroBlendWeight).toBeGreaterThan(0.15);
  });

  it("TR-81 Düzce: diagnoses deep 146 m enclosed bowl inversion (+5.4°C/km clear-night lapse, 320 m pool depth), Akçakoca DEK separation, 900 m Bolu Dağı icing pass, and 1830 m Kardüz snow wall", () => {
    expect(PROVINCE_SPEC_TR_81.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(PROVINCE_SPEC_TR_81.icaoWhitelist).toEqual([]);
    expect(PROVINCE_SPEC_TR_81.inversionAndWedgeSpec.basinFloorElevationM).toBe(146);
    expect(PROVINCE_SPEC_TR_81.inversionAndWedgeSpec.coldPoolMaxDepthM).toBe(320);
    expect(TR_81_BOWL_INVERSION_META.clearNightInversionLapseCPerKm).toBe(5.4);
    expect(PROVINCE_SPEC_TR_81.verticalProfileSpec.maxPhysicalPeakM).toBe(1830);

    // Clear, calm winter night in Düzce Bowl: floor (146 m) freezes in radiation fog while 466 m cold-pool top is warmer!
    const calmBowlProfile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_81 as ProvinceEngineSpec,
      stations: [
        {
          stationId: 17072,
          provinceCode: "TR-81",
          lat: 40.8437,
          lon: 31.1488,
          elevationM: 146,
          tempC: -2.4,
          relHumidityPct: 99,
          subBasinId: "TR81_DUZCE_ENCLOSED_BOWL"
        },
        {
          stationId: 19214,
          provinceCode: "TR-81",
          lat: 40.7731,
          lon: 31.3194,
          elevationM: 310,
          tempC: -1.4,
          relHumidityPct: 90,
          subBasinId: "TR81_BOLU_DAGI_YIGILCA_PASS"
        },
        {
          stationId: 18260,
          provinceCode: "TR-81",
          lat: 40.9725,
          lon: 31.44,
          elevationM: 501,
          tempC: -0.4,
          relHumidityPct: 82,
          subBasinId: "TR81_BOLU_DAGI_YIGILCA_PASS"
        }
      ],
      cloudCoverPct: 5,
      wind10mSpeedKmh: 2,
      wind850SpeedKmh: 8,
      isNight: true,
      hasSnowpack: false
    });

    expect(calmBowlProfile.valleyFloorM).toBe(146);
    expect(calmBowlProfile.coldPoolDepthM).toBe(320);
    expect(calmBowlProfile.coldPoolTopM).toBe(466);
    expect(calmBowlProfile.lowerPoolLapseCPerKm).toBeGreaterThan(4.2);
    expect(calmBowlProfile.inversionStrengthC).toBeGreaterThan(1.3);
    expect(calmBowlProfile.boundaryLayerState).toBe("STRONG_INVERSION");

    // Prior-only clear calm winter night hits exact +5.4°C/km target inversion lapse rate!
    const priorOnlyBowl = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_81 as ProvinceEngineSpec,
      stations: [],
      cloudCoverPct: 0,
      wind10mSpeedKmh: 0,
      wind850SpeedKmh: 0,
      isNight: true,
      hasSnowpack: false
    });
    expect(priorOnlyBowl.lowerPoolLapseCPerKm).toBeCloseTo(5.4, 2);

    // Akçakoca coast <-> Düzce bowl strong Kaplandede barrier decoupling (<= 0.25)
    expect(
      PROVINCE_SPEC_TR_81.barrierCouplingMatrix.TR81_DUZCE_ENCLOSED_BOWL
        .TR81_AKCAKOCA_BLACKSEA_COAST
    ).toBeLessThanOrEqual(0.25);

    // Bolu Dağı Pass (900 m) upslope icing/fog enhancement under Karayel (315°)
    const boluDagiTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_81, {
      lat: 40.764,
      lon: 31.365,
      elevationM: 900,
      subBasinId: "TR81_BOLU_DAGI_YIGILCA_PASS"
    });
    const passEffect = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_81,
      target: boluDagiTarget,
      drivers: {
        localHour: 22,
        month: 1,
        isNight: true,
        cloudCoverPct: 100,
        wind850DirDeg: 315,
        wind850SpeedKmh: 48
      }
    });
    expect(passEffect.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(passEffect.precipMultiplier).toBeGreaterThan(1.25);
  });

  it("TR-14 Bolu: models 742 m snow bowl, -28°C snow-albedo frost (snowpackBoostFactor: 1.5, kalmanTempBiasCapC: 7.5), 1300 m Gerede blizzard Venturi corridor, and 2400 m Kartalkaya alpine profile", () => {
    expect(PROVINCE_SPEC_TR_14.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_14.primaryCenter.wmoId).toBe("17070");
    expect(PROVINCE_SPEC_TR_14.waterBodies).toEqual([]);
    expect(PROVINCE_SPEC_TR_14.icaoWhitelist).toEqual([]);
    expect(PROVINCE_SPEC_TR_14.qcAndMosBounds.kalmanTempBiasCapC).toBe(7.5);
    expect(PROVINCE_SPEC_TR_14.qcAndMosBounds.minPlausibleTempC).toBeLessThanOrEqual(-32);
    expect(TR_14_SNOW_BASIN_META.snowpackBoostFactor).toBe(1.5);
    expect(PROVINCE_SPEC_TR_14.verticalProfileSpec.maxPhysicalPeakM).toBe(2400);

    // 1. Severe snow-covered radiation frost in Bolu Ova (-26.5°C at 743 m WMO 17070, snowDepthCm = 35 cm)
    const dryFrostProfile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_14 as ProvinceEngineSpec,
      stations: [],
      cloudCoverPct: 5,
      wind10mSpeedKmh: 2,
      wind850SpeedKmh: 6,
      isNight: true,
      hasSnowpack: false
    });
    const snowFrostProfile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_14 as ProvinceEngineSpec,
      stations: [
        {
          stationId: 17070,
          provinceCode: "TR-14",
          lat: 40.7329,
          lon: 31.6022,
          elevationM: 743,
          tempC: -26.5,
          snowDepthCm: 35,
          subBasinId: "TR14_BOLU_OVA_SNOW_BOWL"
        },
        {
          stationId: 18174,
          provinceCode: "TR-14",
          lat: 40.5922,
          lon: 31.8039,
          elevationM: 2052,
          tempC: -18.2,
          snowDepthCm: 145,
          subBasinId: "TR14_KARTALKAYA_KOROGLU_ALPINE"
        }
      ],
      cloudCoverPct: 5,
      wind10mSpeedKmh: 2,
      wind850SpeedKmh: 6,
      isNight: true,
      hasSnowpack: true
    });

    expect(snowFrostProfile.snowpackAmplified).toBe(true);
    expect(snowFrostProfile.lowerPoolLapseCPerKm).toBeGreaterThan(
      dryFrostProfile.lowerPoolLapseCPerKm + 2.0
    );
    expect(snowFrostProfile.boundaryLayerState).toBe("STRONG_INVERSION");

    // Verify -26.5°C is accepted by TR-14 QC bounds (zero false gross-limit rejection!)
    const boluSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_14,
      target: { lat: 40.7329, lon: 31.6022, elevationM: 743 },
      stations: [
        {
          stationId: 17070,
          provinceCode: "TR-14",
          lat: 40.7329,
          lon: 31.6022,
          elevationM: 743,
          tempC: -26.5,
          snowDepthCm: 35,
          subBasinId: "TR14_BOLU_OVA_SNOW_BOWL"
        }
      ],
      drivers: {
        localHour: 5,
        month: 1,
        isNight: true,
        cloudCoverPct: 5,
        wind10mSpeedKmh: 2,
        hasSnowpack: true
      }
    });
    expect(boluSurface).not.toBeNull();
    expect(boluSurface!.acceptedStationCount).toBe(1);
    expect(Math.abs(boluSurface!.tempC - -26.5)).toBeLessThan(0.25);

    // 2. Gerede – Cankurtaran (1300 m) highway Venturi acceleration & mechanical inversion breakup
    const geredeVenturi = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_14.venturiCorridors,
      targetLat: 40.8046,
      targetLon: 32.2176,
      windDirDeg: 285,
      windSpeedKmh: 32
    });
    expect(geredeVenturi.activeCorridorIds).toContain("TR14_GEREDE_CANKURTARAN_HIGHWAY_GAP");
    expect(geredeVenturi.speedMultiplier).toBeGreaterThan(1.25);
    expect(geredeVenturi.suppressesNocturnalInversion).toBe(true);

    // 3. 4-band orographic snow weight monotonicity from Mengen (636 m) -> Bolu (743 m) -> Gerede/Abant (1350 m) -> Kartalkaya (2052 m)
    const prof14 = TR81_HYPSOMETRIC_PROFILES["TR-14"];
    const wMengen = interpolateProvinceOrographicWeight(prof14, 636);
    const wBolu = interpolateProvinceOrographicWeight(prof14, 743);
    const wAbant = interpolateProvinceOrographicWeight(prof14, 1350);
    const wKartalkaya = interpolateProvinceOrographicWeight(prof14, 2052);
    expect(wMengen).toBeLessThan(wBolu);
    expect(wBolu).toBeLessThan(wAbant);
    expect(wAbant).toBeLessThan(wKartalkaya);
    expect(wKartalkaya - wBolu).toBeGreaterThan(0.5);

    // Standard mixed-day elevation transport cools Kartalkaya (2052 m) by > 7.5°C vs Bolu Ova (743 m)
    const mixedDayProfile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_14,
      stations: [],
      cloudCoverPct: 60,
      wind10mSpeedKmh: 18,
      wind850SpeedKmh: 36,
      isNight: false
    });
    const deltaKartalkayaC = integrateProvinceVerticalDeltaC(743, 2052, mixedDayProfile);
    expect(deltaKartalkayaC).toBeLessThan(-7.5);
  });

  it("enforces 0.00% cross-province station/METAR leakage across TR-14, TR-67, TR-74, TR-81, and TR-16 Bursa", () => {
    const bursaStationIds = new Set<number>();
    for (const [istStr, owner] of Object.entries(STATIC_MGM_ISTNO_OWNER_PROVINCE)) {
      if (owner === "TR-16") bursaStationIds.add(Number(istStr));
    }
    for (const entry of TR_NATIONAL_CATALOG) {
      if (entry.provinceCode === "TR-16" && entry.mgmSondurumIstNo) {
        bursaStationIds.add(entry.mgmSondurumIstNo);
      }
    }

    const byProv = new Map<TrProvinceCode, Set<number>>();
    for (const spec of REG_08_SPECS) {
      expect(spec.icaoWhitelist).not.toContain("LTBR");
      const ids = collectNumericMgmStationIds(spec);
      expect(ids.length).toBeGreaterThanOrEqual(7);

      for (const istNo of ids) {
        expect(bursaStationIds.has(istNo)).toBe(false);
        const registeredOwner = STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo];
        expect(
          registeredOwner,
          `MGM istNo ${istNo} in ${spec.provinceCode} belongs to ${registeredOwner}`
        ).toBe(spec.provinceCode);
      }
      byProv.set(spec.provinceCode, new Set(ids));
    }

    // Pairwise disjoint station sets across all 4 provinces
    const codes = [...byProv.keys()];
    for (let i = 0; i < codes.length; i++) {
      for (let j = i + 1; j < codes.length; j++) {
        const setA = byProv.get(codes[i])!;
        const setB = byProv.get(codes[j])!;
        for (const id of setA) {
          expect(setB.has(id)).toBe(false);
        }
      }
    }

    // Runtime firewall test: feeding neighbor Düzce (TR-81), Zonguldak (TR-67 LTAS), and Bursa (TR-16) stations into TR-14 Bolu rejects 100% of foreign stations
    const boluFirewall = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_14,
      target: { lat: 40.7329, lon: 31.6022, elevationM: 743 },
      stations: [
        {
          stationId: 17070,
          provinceCode: "TR-14",
          lat: 40.7329,
          lon: 31.6022,
          elevationM: 743,
          tempC: -4.2
        },
        {
          stationId: 17072,
          provinceCode: "TR-81",
          lat: 40.8437,
          lon: 31.1488,
          elevationM: 146,
          tempC: 9.5
        },
        {
          stationId: "LTAS",
          icaoId: "LTAS",
          provinceCode: "TR-67",
          lat: 41.5064,
          lon: 32.0886,
          elevationM: 13,
          tempC: 14.0
        },
        {
          stationId: 17116,
          provinceCode: "TR-16",
          lat: 40.2308,
          lon: 29.0133,
          elevationM: 100,
          tempC: 18.0
        }
      ],
      drivers: {
        localHour: 12,
        month: 1,
        isNight: false,
        cloudCoverPct: 50
      }
    });
    expect(boluFirewall).not.toBeNull();
    expect(boluFirewall!.acceptedStationCount).toBe(1);
    expect(boluFirewall!.rejectedCrossBorderCount).toBe(3);
    expect(boluFirewall!.tempC).toBeCloseTo(-4.2, 1);
  });
});
