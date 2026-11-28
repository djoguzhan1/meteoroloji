import { describe, expect, it } from "vitest";
import { getAllowedTurkeyIcaosForProvince } from "../../lib/metar-verify";
import { TR_NATIONAL_CATALOG } from "../../lib/provinces/catalog-1102";
import { TR81_CLIMATOLOGY_1991_2020 } from "../../lib/provinces/climatology-1991-2020";
import { PROVINCE_CALIBRATION_TR_23 } from "../../lib/provinces/emos-weights/tr-23";
import { PROVINCE_CALIBRATION_TR_24 } from "../../lib/provinces/emos-weights/tr-24";
import { PROVINCE_CALIBRATION_TR_44 } from "../../lib/provinces/emos-weights/tr-44";
import { PROVINCE_CALIBRATION_TR_62 } from "../../lib/provinces/emos-weights/tr-62";
import {
  applyDirectionalBarrierRules,
  computeProvinceMicroclimateOffsetC,
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
import PROVINCE_SPEC_TR_23_DEFAULT, {
  PROVINCE_SPEC_TR_23,
  TR_23_CALIBRATION_ANCHOR_META
} from "../../lib/provinces/specs/tr-23";
import PROVINCE_SPEC_TR_24_DEFAULT, {
  PROVINCE_SPEC_TR_24,
  TR_24_KARASU_GRABEN_META
} from "../../lib/provinces/specs/tr-24";
import PROVINCE_SPEC_TR_44_DEFAULT, {
  PROVINCE_SPEC_TR_44,
  TR_44_APRICOT_BASIN_META
} from "../../lib/provinces/specs/tr-44";
import PROVINCE_SPEC_TR_62_DEFAULT, {
  PROVINCE_SPEC_TR_62,
  TR_62_MUNZUR_OVACIK_META
} from "../../lib/provinces/specs/tr-62";
import type { ProvinceSpec, TrProvinceCode } from "../../lib/provinces/types";
import { evaluateSeaEffectSnow } from "../../lib/snow-and-lightning-engine";

const REG_16_SPECS: readonly ProvinceSpec[] = [
  PROVINCE_SPEC_TR_23,
  PROVINCE_SPEC_TR_24,
  PROVINCE_SPEC_TR_44,
  PROVINCE_SPEC_TR_62
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

describe("Wave 3C REG-16: Upper Euphrates Depression Basins & Munzur Wall (TR-23, TR-24, TR-44, TR-62)", () => {
  it("exports frozen, contract-complete ProvinceSpecs aligned with metar-verify, ADM1 polygons, and EMOS calibration bundles", () => {
    expect(PROVINCE_SPEC_TR_23_DEFAULT).toBe(PROVINCE_SPEC_TR_23);
    expect(PROVINCE_SPEC_TR_24_DEFAULT).toBe(PROVINCE_SPEC_TR_24);
    expect(PROVINCE_SPEC_TR_44_DEFAULT).toBe(PROVINCE_SPEC_TR_44);
    expect(PROVINCE_SPEC_TR_62_DEFAULT).toBe(PROVINCE_SPEC_TR_62);

    expect(PROVINCE_SPEC_TR_23.calibrationTier).toBe(PROVINCE_CALIBRATION_TR_23.calibrationTier);
    expect(PROVINCE_SPEC_TR_24.calibrationTier).toBe(PROVINCE_CALIBRATION_TR_24.calibrationTier);
    expect(PROVINCE_SPEC_TR_44.calibrationTier).toBe(PROVINCE_CALIBRATION_TR_44.calibrationTier);
    expect(PROVINCE_SPEC_TR_62.calibrationTier).toBe(PROVINCE_CALIBRATION_TR_62.calibrationTier);

    for (const spec of REG_16_SPECS) {
      expect(spec.region).toBe("EASTERN_ANATOLIA");
      expect(spec.climateRegion).toBe("DOGU_ANADOLU");
      expect(spec.curatedSubLocations).toHaveLength(4);
      expect(spec.stencil9Points).toHaveLength(9);

      // Exact alignment with authoritative national METAR whitelist
      expect(spec.icaoWhitelist).toEqual(getAllowedTurkeyIcaosForProvince(spec.provinceCode));

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

      // Primary center, curated sub-locations, and stencil points must resolve strictly inside spec.provinceCode!
      const centerRes = resolveProvinceCode({
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon,
        admin1: spec.nameTr,
        countryCode: "TR"
      });
      expect(centerRes.provinceCode).toBe(spec.provinceCode);

      for (const sub of spec.curatedSubLocations) {
        const res = resolveProvinceCode({
          lat: sub.lat,
          lon: sub.lon,
          admin1: spec.nameTr,
          countryCode: "TR"
        });
        expect(
          res.provinceCode,
          `SubLocation ${sub.id} resolved to ${res.provinceCode}`
        ).toBe(spec.provinceCode);
      }

      for (const st of spec.stencil9Points) {
        const res = resolveProvinceCode({
          lat: st.lat,
          lon: st.lon,
          admin1: spec.nameTr,
          countryCode: "TR"
        });
        expect(
          res.provinceCode,
          `Stencil point ${st.key} resolved to ${res.provinceCode}`
        ).toBe(spec.provinceCode);
      }
    }
  });

  it("TR-23 Elazığ: models Uluova (WMO 17202 / LTCA), Keban & Hazar freshwater thermal moderation with STRICTLY ZERO sea DEK, Hazarbaba 2347 m ski peak, and Maden–Ergani SE moisture corridor", () => {
    expect(PROVINCE_SPEC_TR_23.primaryCenter.wmoId).toBe("17202");
    expect(PROVINCE_CALIBRATION_TR_23.wmoStationId).toBe("17202");
    expect(PROVINCE_SPEC_TR_23.icaoWhitelist).toEqual(["LTCA"]);
    expect(TR_23_CALIBRATION_ANCHOR_META.openSeaDekAllowed).toBe(false);
    expect(PROVINCE_SPEC_TR_23.verticalProfileSpec.maxPhysicalPeakM).toBe(2347);

    // Keban & Hazar must be pure `fresh_lake` with `useOpenMeteoMarineApi: false` and `effectiveFetchKm < 25`
    expect(PROVINCE_SPEC_TR_23.waterBodies).toHaveLength(2);
    for (const wb of PROVINCE_SPEC_TR_23.waterBodies) {
      expect(wb.kind).toBe("fresh_lake");
      expect(wb.useOpenMeteoMarineApi).toBe(false);
      expect(wb.effectiveFetchKm).toBeLessThan(25);
    }

    // Even during a brutal -18°C 850/700 hPa polar outbreak, Keban & Hazar NEVER trigger open-sea DEK!
    const dekCheck = evaluateSeaEffectSnow({
      lat: 38.6443,
      lon: 39.2561,
      provinceCode: "TR-23",
      waterBodies: PROVINCE_SPEC_TR_23.waterBodies,
      temp850hPa: -18,
      temp700hPa: -26,
      surfaceTempC: -3.5,
      windSpeedKmh: 38,
      windDirDeg: 25,
      precipMmHr: 1.8,
      month: 1
    });
    expect(dekCheck.status).toBe("none");

    // Yet Keban Reservoir positively buffers winter frost along Keban/Fırat shoreline (`marineThermalModerationC > 0`)
    const kebanShoreTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_23, {
      lat: 38.7933,
      lon: 38.7492,
      elevationM: 823,
      isCoastal: true,
      coastalDistanceKm: 2
    });
    const kebanMod = computeProvinceMicroclimateOffsetC({
      spec: PROVINCE_SPEC_TR_23,
      target: kebanShoreTarget,
      drivers: {
        localHour: 5,
        month: 1,
        isNight: true,
        cloudCoverPct: 40,
        wind10mDirDeg: 15,
        wind10mSpeedKmh: 16
      },
      ambientTempC: -4.0
    });
    expect(kebanMod.marineThermalModerationC).toBeGreaterThan(0.5);

    // Maden–Ergani SE moist inflow (160°, 54 km/h) drives Hazarbaba (2,347 m) orographic upslope precipitation
    const hazarbabaTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_23, {
      lat: 38.4107,
      lon: 39.3205,
      elevationM: 2075,
      subBasinId: "TR23_HAZARBABA_TAURUS_SUMMIT"
    });
    const madenUpslope = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_23,
      target: hazarbabaTarget,
      drivers: {
        localHour: 9,
        month: 2,
        isNight: false,
        cloudCoverPct: 95,
        wind850DirDeg: 160,
        wind850SpeedKmh: 54
      }
    });
    expect(madenUpslope.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(madenUpslope.precipMultiplier).toBeGreaterThan(1.3);
  });

  it("TR-24 Erzincan: captures +5–7°C daytime Karasu graben warmth vs Erzurum/Bayburt, Keşiş (3549 m) / Munzur (3462 m) shielding, deep nocturnal graben inversion, and Ergan Ski (2970 m) alpine profile", () => {
    expect(PROVINCE_SPEC_TR_24.primaryCenter.wmoId).toBe("17092");
    expect(PROVINCE_CALIBRATION_TR_24.wmoStationId).toBe("17092");
    expect(PROVINCE_SPEC_TR_24.icaoWhitelist).toEqual(["LTCD"]);
    expect(PROVINCE_SPEC_TR_24.waterBodies).toEqual([]);
    expect(PROVINCE_SPEC_TR_24.verticalProfileSpec.maxPhysicalPeakM).toBe(3549);
    expect(TR_24_KARASU_GRABEN_META.erganSkiSummitM).toBe(2970);

    // 1. Climatological proof: Erzincan daytime winter Tmax is 5–7°C milder than Erzurum (TR-25) & Bayburt (TR-69)!
    const janTmaxErzincan = PROVINCE_SPEC_TR_24.primaryCenter.monthlyTmaxNormalsC[0];
    const janTmaxErzurum = TR81_CLIMATOLOGY_1991_2020["TR-25"].tmaxC[0];
    const febTmaxErzincan = PROVINCE_SPEC_TR_24.primaryCenter.monthlyTmaxNormalsC[1];
    const febTmaxErzurum = TR81_CLIMATOLOGY_1991_2020["TR-25"].tmaxC[1];
    expect(janTmaxErzincan - janTmaxErzurum).toBeGreaterThanOrEqual(5.0);
    expect(febTmaxErzincan - febTmaxErzurum).toBeGreaterThanOrEqual(5.0);

    // 2. Keşiş/Esence (3549 m) shields Karasu graben on northerly flow (Foehn subsidence warming + rain shadow)
    const grabenTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_24, {
      lat: 39.7523,
      lon: 39.4868,
      elevationM: 1216
    });
    const kesisShield = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_24,
      target: grabenTarget,
      drivers: {
        localHour: 14,
        month: 1,
        isNight: false,
        cloudCoverPct: 35,
        wind850DirDeg: 10,
        wind850SpeedKmh: 62,
        bruntVaisalaFreqS1: 0.0095
      }
    });
    expect(kesisShield.activeRegime).toBe("FOEHN_LEE");
    expect(kesisShield.foehnTempDeltaC).toBeGreaterThan(2.8);
    expect(kesisShield.precipMultiplier).toBeLessThan(0.8);

    // 3. Clear winter night over snowpack triggers deep Karasu graben inversion (+5.6°C/km base + snow boost)
    const grabenInversion = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_24 as ProvinceEngineSpec,
      stations: [
        {
          stationId: 17092,
          provinceCode: "TR-24",
          lat: 39.7102,
          lon: 39.527,
          elevationM: 1156,
          tempC: -19.5,
          snowDepthCm: 28,
          subBasinId: "TR24_ERZINCAN_KARASU_GRABEN"
        },
        {
          stationId: 18199,
          provinceCode: "TR-24",
          lat: 39.9044,
          lon: 38.7672,
          elevationM: 1594,
          tempC: -14.2,
          snowDepthCm: 45,
          subBasinId: "TR24_REFAHIYE_SAKALTUTAN_TERCAN_PASSES"
        }
      ],
      cloudCoverPct: 5,
      wind10mSpeedKmh: 2,
      wind850SpeedKmh: 7,
      isNight: true,
      hasSnowpack: true
    });
    expect(grabenInversion.snowpackAmplified).toBe(true);
    expect(grabenInversion.boundaryLayerState).toBe("STRONG_INVERSION");
    expect(grabenInversion.lowerPoolLapseCPerKm).toBeGreaterThan(6.0);
    expect(grabenInversion.inversionStrengthC).toBeGreaterThan(2.5);

    // 4. Ergan Dağı Ski Center (~2,970 m ridge) vs Karasu Graben (1,216 m) standard mixed-day alpine cooling (> 10°C colder!)
    const dayMixed = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_24,
      stations: [],
      cloudCoverPct: 55,
      wind10mSpeedKmh: 20,
      wind850SpeedKmh: 40,
      isNight: false
    });
    const erganDeltaC = integrateProvinceVerticalDeltaC(1216, 2970, dayMixed);
    expect(erganDeltaC).toBeLessThan(-10.0);
  });

  it("TR-44 Malatya: captures LTAT Erhaç (862 m) rural spring radiation frost unbiasing, Karakaya freshwater moderation (no DEK), Beydağları (2544 m) northern Foehn/shadow, and Darende–Kuluncak steppe", () => {
    expect(PROVINCE_SPEC_TR_44.primaryCenter.wmoId).toBe("LTAO0");
    expect(PROVINCE_CALIBRATION_TR_44.wmoStationId).toBe("LTAO0");
    expect(PROVINCE_SPEC_TR_44.primaryCenter.mgmIstNo).toBe(17199);
    expect(PROVINCE_SPEC_TR_44.icaoWhitelist).toEqual(["LTAT"]);
    expect(TR_44_APRICOT_BASIN_META.erhacElevationM).toBe(862);

    // Karakaya Reservoir is fresh_lake (< 25 km fetch) -> zero open-sea DEK
    expect(PROVINCE_SPEC_TR_44.waterBodies[0].kind).toBe("fresh_lake");
    expect(
      evaluateSeaEffectSnow({
        lat: 38.4531,
        lon: 38.3564,
        provinceCode: "TR-44",
        waterBodies: PROVINCE_SPEC_TR_44.waterBodies,
        temp850hPa: -16,
        surfaceTempC: -2,
        windSpeedKmh: 35,
        windDirDeg: 75,
        precipMmHr: 1.5,
        month: 1
      }).status
    ).toBe("none");

    // Spring apricot blossom radiation night (April, 04:00 local, clear calm):
    // Rural Erhaç `LTAT` (862 m, -1.8°C radiation frost) is penalized & unbiased when predicting Malatya urban foothill (950 m, +3.1°C)
    const apricotNight = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_44,
      target: { lat: 38.35, lon: 38.25, elevationM: 950 },
      stations: [
        {
          stationId: 17199,
          provinceCode: "TR-44",
          lat: 38.35,
          lon: 38.25,
          elevationM: 950,
          tempC: 3.1,
          relHumidityPct: 52
        },
        {
          stationId: "LTAT",
          icaoId: "LTAT",
          provinceCode: "TR-44",
          lat: 38.4353,
          lon: 38.091,
          elevationM: 862,
          tempC: -1.8,
          relHumidityPct: 86
        }
      ],
      drivers: {
        localHour: 4,
        month: 4,
        isNight: true,
        cloudCoverPct: 8,
        wind10mSpeedKmh: 3
      }
    });
    expect(apricotNight).not.toBeNull();
    expect(apricotNight!.tempC).toBeGreaterThan(2.5);
    const ltatNode = apricotNight!.contributions.find((c) => c.stationId === "LTAT");
    expect(ltatNode?.usedColdBasinUnbias).toBe(true);
    expect(ltatNode!.normalizedWeight).toBeLessThan(0.05);

    // Beydağları (2,544 m) southerly flow asymmetry: windward Doğanşehir gets upslope enhancement while leeward Malatya gets Foehn warming + rain shadow
    const dogansehirWindward = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_44, {
      lat: 38.0958,
      lon: 37.8873,
      elevationM: 1223,
      subBasinId: "TR44_BEYDAGI_SE_TAURUS_WALL"
    });
    const malatyaLeeward = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_44, {
      lat: 38.35,
      lon: 38.25,
      elevationM: 950,
      subBasinId: "TR44_MALATYA_APRICOT_FOOTHILL_PLAIN"
    });
    const southStormDrivers = {
      localHour: 13,
      month: 3,
      isNight: false,
      cloudCoverPct: 70,
      wind850DirDeg: 185,
      wind850SpeedKmh: 64,
      bruntVaisalaFreqS1: 0.0096
    };
    const windwardRes = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_44,
      target: dogansehirWindward,
      drivers: southStormDrivers
    });
    const leeRes = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_44,
      target: malatyaLeeward,
      drivers: southStormDrivers
    });
    expect(windwardRes.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(windwardRes.precipMultiplier).toBeGreaterThan(1.35);
    expect(leeRes.activeRegime).toBe("FOEHN_LEE");
    expect(leeRes.foehnTempDeltaC).toBeGreaterThan(2.8);
    expect(leeRes.precipMultiplier).toBeLessThan(0.8);
  });

  it("TR-62 Tunceli: models sharp SW Munzur (3462 m) & Ovacık (1280 m) orographic snow upslope (>1.65x), empty METAR lock, and honest Tier-B donor + ALARO calibration", () => {
    expect(PROVINCE_SPEC_TR_62.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(PROVINCE_SPEC_TR_62.icaoWhitelist).toEqual([]);
    expect(TR_62_MUNZUR_OVACIK_META.munzurPeakElevationM).toBe(3462);
    expect(PROVINCE_SPEC_TR_62.verticalProfileSpec.maxPhysicalPeakM).toBe(3462);
    expect(PROVINCE_SPEC_TR_62.inversionAndWedgeSpec.basinFloorElevationM).toBe(915);

    // SW moist inflow (205°, 58 km/h) slamming into Ovacık & Munzur wall -> intense upslope enhancement
    const ovacikTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_62, {
      lat: 39.3681,
      lon: 39.2419,
      elevationM: 1280,
      subBasinId: "TR62_OVACIK_HIGH_SNOW_BOWL"
    });
    const munzurUpslope = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_62,
      target: ovacikTarget,
      drivers: {
        localHour: 6,
        month: 1,
        isNight: true,
        cloudCoverPct: 98,
        wind850DirDeg: 205,
        wind850SpeedKmh: 58
      }
    });
    expect(munzurUpslope.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(munzurUpslope.precipMultiplier).toBeGreaterThan(1.65);

    // 4-band orographic snow weight monotonicity: Pertek (860 m) < Merkez (940 m) < Ovacık (1650 m) < Munzur Zirve (2750 m)
    const prof62 = TR81_HYPSOMETRIC_PROFILES["TR-62"];
    const wPertek = interpolateProvinceOrographicWeight(prof62, 860);
    const wMerkez = interpolateProvinceOrographicWeight(prof62, 940);
    const wOvacik = interpolateProvinceOrographicWeight(prof62, 1650);
    const wMunzur = interpolateProvinceOrographicWeight(prof62, 2750);
    expect(wPertek).toBeLessThan(wMerkez);
    expect(wMerkez).toBeLessThan(wOvacik);
    expect(wOvacik).toBeLessThan(wMunzur);
    expect(wMunzur - wMerkez).toBeGreaterThan(0.55);

    // Honest Tier-B MOS check using real PROVINCE_CALIBRATION_TR_62 weights (intercept forced to 0.0 + ALARO 0.24 anchor)
    const djfShort = PROVINCE_CALIBRATION_TR_62.slices.DJF.short_0_72h;
    const tierBHour = evaluateProvinceCalibratedHour({
      leadHours: 18,
      localHour: 8,
      month: 1,
      spec: PROVINCE_SPEC_TR_62,
      mosPackage: {
        tier: "TIER_B_DONOR_ALARO",
        weights: djfShort.weights,
        interceptC: djfShort.intercept,
        alaroBlendMaxWeight: PROVINCE_CALIBRATION_TR_62.alaroAnchorWeight0to72h
      },
      tempSnapshot: {
        ecmwfIfs: -2.0,
        ecmwfAifs: -1.8,
        icon: -2.6,
        ukmo: -2.2,
        meteofrance: -2.4,
        gfs: -1.9,
        gem: -2.5,
        jma: -2.1
      },
      mgmAlaroHourly: { tempC: -3.2, rhPct: 92, isWet: true },
      orographicPrecipMultiplier: munzurUpslope.precipMultiplier,
      precipSnapshot: {
        ecmwfIfs: 2.4,
        ecmwfAifs: 2.0,
        icon: 2.8,
        ukmo: 2.2,
        gfs: 1.9
      }
    });
    expect(tierBHour.tier).toBe("TIER_B_DONOR_ALARO");
    expect(tierBHour.appliedInterceptC).toBe(0);
    expect(tierBHour.weightSum).toBeCloseTo(1.0, 6);
    expect(tierBHour.precipitationMm).toBeGreaterThan(3.0);
  });

  it("enforces 0.00% cross-province station/METAR leakage across TR-23, TR-24, TR-44, TR-62, and frozen TR-16 Bursa", () => {
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
    for (const spec of REG_16_SPECS) {
      expect(spec.icaoWhitelist).not.toContain("LTBR");
      const ids = collectNumericMgmStationIds(spec);
      expect(ids.length).toBeGreaterThanOrEqual(8);

      for (const istNo of ids) {
        expect(bursaStationIds.has(istNo)).toBe(false);
        const owner = STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo];
        expect(
          owner,
          `MGM istNo ${istNo} in ${spec.provinceCode} is owned by ${owner}`
        ).toBe(spec.provinceCode);
      }
      byProv.set(spec.provinceCode, new Set(ids));
    }

    const codes = [...byProv.keys()];
    for (let i = 0; i < codes.length; i++) {
      for (let j = i + 1; j < codes.length; j++) {
        const a = byProv.get(codes[i])!;
        const b = byProv.get(codes[j])!;
        for (const id of a) {
          expect(b.has(id)).toBe(false);
        }
      }
    }

    // Runtime firewall: Tunceli (TR-62) rejects neighbor Elazığ LTCA, Erzincan LTCD, Malatya LTAT, and Bursa 17116
    const tunceliFirewall = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_62,
      target: { lat: 39.1058, lon: 39.5408, elevationM: 981 },
      stations: [
        {
          stationId: 17165,
          provinceCode: "TR-62",
          lat: 39.1058,
          lon: 39.5408,
          elevationM: 981,
          tempC: -3.4
        },
        {
          stationId: "LTCA",
          icaoId: "LTCA",
          provinceCode: "TR-23",
          lat: 38.6058,
          lon: 39.2973,
          elevationM: 892,
          tempC: 6.2
        },
        {
          stationId: "LTCD",
          icaoId: "LTCD",
          provinceCode: "TR-24",
          lat: 39.7102,
          lon: 39.527,
          elevationM: 1156,
          tempC: 5.1
        },
        {
          stationId: "LTAT",
          icaoId: "LTAT",
          provinceCode: "TR-44",
          lat: 38.4353,
          lon: 38.091,
          elevationM: 862,
          tempC: 9.0
        },
        {
          stationId: 17116,
          provinceCode: "TR-16",
          lat: 40.2308,
          lon: 29.0133,
          elevationM: 100,
          tempC: 15.0
        }
      ],
      drivers: {
        localHour: 11,
        month: 1,
        isNight: false,
        cloudCoverPct: 65
      }
    });
    expect(tunceliFirewall).not.toBeNull();
    expect(tunceliFirewall!.acceptedStationCount).toBe(1);
    expect(tunceliFirewall!.rejectedCrossBorderCount).toBe(4);
    expect(tunceliFirewall!.tempC).toBeCloseTo(-3.4, 1);
  });
});
