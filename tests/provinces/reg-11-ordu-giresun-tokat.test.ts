import { describe, expect, it } from "vitest";
import { getAllowedTurkeyIcaosForProvince } from "../../lib/metar-verify";
import { PROVINCE_CALIBRATION_TR_28 } from "../../lib/provinces/emos-weights/tr-28";
import { PROVINCE_CALIBRATION_TR_52 } from "../../lib/provinces/emos-weights/tr-52";
import { PROVINCE_CALIBRATION_TR_60 } from "../../lib/provinces/emos-weights/tr-60";
import {
  applyDirectionalBarrierRules,
  applyVenturiCorridorRules,
  resolveProvinceTargetMetadata,
  solveProvinceTopographicSurface
} from "../../lib/provinces/engine/province-cressman";
import {
  type ProvinceLiveStationObs
} from "../../lib/provinces/engine/province-vertical-profile";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import PROVINCE_SPEC_TR_28_DEFAULT, {
  PROVINCE_SPEC_TR_28
} from "../../lib/provinces/specs/tr-28";
import PROVINCE_SPEC_TR_52_DEFAULT, {
  PROVINCE_SPEC_TR_52
} from "../../lib/provinces/specs/tr-52";
import PROVINCE_SPEC_TR_60_DEFAULT, {
  PROVINCE_SPEC_TR_60
} from "../../lib/provinces/specs/tr-60";
import type { ProvinceSpec } from "../../lib/provinces/types";

const REG_11_SPECS: readonly ProvinceSpec[] = [
  PROVINCE_SPEC_TR_28,
  PROVINCE_SPEC_TR_52,
  PROVINCE_SPEC_TR_60
];

describe("Wave 3B — REG-11 (TR-28 Giresun, TR-52 Ordu, TR-60 Tokat)", () => {
  it("verifies structural invariants, 100% alignment with metar-verify & emos-weights, symmetric barrier matrices, and ADM1 polygon lock", () => {
    expect(PROVINCE_SPEC_TR_28_DEFAULT).toBe(PROVINCE_SPEC_TR_28);
    expect(PROVINCE_SPEC_TR_52_DEFAULT).toBe(PROVINCE_SPEC_TR_52);
    expect(PROVINCE_SPEC_TR_60_DEFAULT).toBe(PROVINCE_SPEC_TR_60);

    // Exact alignment with `lib/metar-verify.ts` runway ownership
    expect(PROVINCE_SPEC_TR_28.icaoWhitelist).toEqual(
      getAllowedTurkeyIcaosForProvince("TR-28")
    );
    expect(PROVINCE_SPEC_TR_28.icaoWhitelist).toEqual([]);

    expect(PROVINCE_SPEC_TR_52.icaoWhitelist).toEqual(
      getAllowedTurkeyIcaosForProvince("TR-52")
    );
    expect(PROVINCE_SPEC_TR_52.icaoWhitelist).toEqual(["LTCB"]);

    expect(PROVINCE_SPEC_TR_60.icaoWhitelist).toEqual(
      getAllowedTurkeyIcaosForProvince("TR-60")
    );
    expect(PROVINCE_SPEC_TR_60.icaoWhitelist).toEqual(["LTAW"]);

    // Exact alignment with `lib/provinces/emos-weights/*` calibration tiers & WMO IDs
    expect(PROVINCE_SPEC_TR_28.calibrationTier).toBe(
      PROVINCE_CALIBRATION_TR_28.calibrationTier
    );
    expect(PROVINCE_SPEC_TR_28.primaryCenter.wmoId).toBe(
      PROVINCE_CALIBRATION_TR_28.wmoStationId
    );

    expect(PROVINCE_SPEC_TR_52.calibrationTier).toBe(
      PROVINCE_CALIBRATION_TR_52.calibrationTier
    );
    expect(PROVINCE_SPEC_TR_52.primaryCenter.wmoId).toBeUndefined();

    expect(PROVINCE_SPEC_TR_60.calibrationTier).toBe(
      PROVINCE_CALIBRATION_TR_60.calibrationTier
    );
    expect(PROVINCE_SPEC_TR_60.primaryCenter.wmoId).toBe(
      PROVINCE_CALIBRATION_TR_60.wmoStationId
    );

    for (const spec of REG_11_SPECS) {
      expect(Object.isFrozen(spec)).toBe(true);
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.curatedSubLocations).toHaveLength(4);

      const knots = spec.verticalProfileSpec.piecewiseKnotsM;
      expect(knots[0]).toBeLessThan(knots[1]);
      expect(knots[1]).toBeLessThan(knots[2]);
      expect(knots[2]).toBeLessThan(knots[3]);
      expect(knots[3]).toBeLessThanOrEqual(spec.verticalProfileSpec.maxPhysicalPeakM);

      const subIds = new Set(spec.subBasins.map((s) => s.id));
      expect(subIds.has(spec.primaryCenter.subBasinId)).toBe(true);

      for (const a of subIds) {
        expect(spec.barrierCouplingMatrix[a]?.[a]).toBe(1.0);
        for (const b of subIds) {
          const wAB = spec.barrierCouplingMatrix[a]?.[b];
          const wBA = spec.barrierCouplingMatrix[b]?.[a];
          expect(typeof wAB).toBe("number");
          expect(wAB).toBeGreaterThan(0);
          expect(wAB).toBeLessThanOrEqual(1.0);
          expect(wAB).toBeCloseTo(wBA ?? -1, 6);
        }
      }

      for (const ov of Object.values(spec.stationOverrides)) {
        expect(subIds.has(ov.subBasinId)).toBe(true);
      }

      const centerGeo = resolveProvinceCode({
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon,
        admin1: spec.nameTr,
        countryCode: "TR"
      });
      expect(centerGeo.provinceCode).toBe(spec.provinceCode);

      for (const pt of spec.stencil9Points) {
        if (pt.role === "marine_upwind") continue;
        const g = resolveProvinceCode({
          lat: pt.lat,
          lon: pt.lon,
          admin1: spec.nameTr,
          countryCode: "TR"
        });
        expect(g.provinceCode).toBe(spec.provinceCode);
      }
    }
  });

  it("models Giresun (TR-28) steep coastal NW orographic/DEK surge, southerly Kıble Foehn warming, and sharp Eğribel-Kelkit (Şebinkarahisar/Alucra) decoupling while blocking LTCB/LTCG", () => {
    const coastTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_28, {
      lat: 40.9227,
      lon: 38.3878,
      elevationM: 38,
      subBasinId: "TR28_GIRESUN_COASTAL_STRIP"
    });
    const kelkitTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_28, {
      lat: 40.2872,
      lon: 38.4193,
      elevationM: 1364,
      subBasinId: "TR28_KELKIT_SEBINKARAHISAR_INTERIOR"
    });

    // 1. NW (335°) Black Sea DEK / Orographic flow: heavy upslope on Giresun coast vs rain-shadow in Şebinkarahisar!
    const nwDrivers = {
      localHour: 12,
      month: 1,
      isNight: false,
      cloudCoverPct: 95,
      wind850DirDeg: 335,
      wind850SpeedKmh: 42,
      wind10mDirDeg: 330,
      wind10mSpeedKmh: 30
    };
    const coastUpslope = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_28,
      target: coastTarget,
      drivers: nwDrivers
    });
    const kelkitShadow = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_28,
      target: kelkitTarget,
      drivers: nwDrivers
    });
    expect(coastUpslope.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(coastUpslope.precipMultiplier).toBeGreaterThan(1.45);
    expect(kelkitShadow.activeRegime).toBe("RAIN_SHADOW");
    expect(kelkitShadow.precipMultiplier).toBeLessThan(0.65);

    // 2. Southerly (185°) strong Kıble Foehn over 2200m Eğribel crest into Giresun coast
    const foehnEffect = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_28,
      target: coastTarget,
      drivers: {
        localHour: 14,
        month: 12,
        isNight: false,
        cloudCoverPct: 30,
        wind850DirDeg: 185,
        wind850SpeedKmh: 58,
        wind10mDirDeg: 185,
        wind10mSpeedKmh: 36,
        bruntVaisalaFreqS1: 0.0085
      }
    });
    expect(foehnEffect.activeRegime).toBe("FOEHN_LEE");
    expect(foehnEffect.foehnTempDeltaC).toBeGreaterThan(2.5);

    // 3. Sharp Cressman airmass decoupling between Giresun coast (+13.4°C) and Alucra/Şebinkarahisar (-9.2°C),
    //    plus 100% rejection of cross-border LTCB (TR-52 Ordu) & LTCG (TR-61 Trabzon)!
    const mixedStations: ProvinceLiveStationObs[] = [
      {
        stationId: 17034,
        provinceCode: "TR-28",
        name: "Giresun Merkez",
        lat: 40.9227,
        lon: 38.3878,
        elevationM: 38,
        tempC: 13.4,
        relHumidityPct: 62
      },
      {
        stationId: 17682,
        provinceCode: "TR-28",
        name: "Şebinkarahisar",
        lat: 40.2872,
        lon: 38.4193,
        elevationM: 1364,
        tempC: -7.8,
        relHumidityPct: 84,
        snowDepthCm: 22
      },
      {
        stationId: 18224,
        provinceCode: "TR-28",
        name: "Alucra",
        lat: 40.3275,
        lon: 38.7522,
        elevationM: 1477,
        tempC: -9.6,
        relHumidityPct: 86,
        snowDepthCm: 28
      },
      // Cross-border leaks that MUST be rejected in TR-28!
      {
        stationId: "LTCB",
        icaoId: "LTCB",
        provinceCode: "TR-52",
        name: "Ordu-Giresun Airport (Gülyalı)",
        lat: 40.967,
        lon: 38.0815,
        elevationM: 3,
        tempC: 14.8
      },
      {
        stationId: "LTCG",
        icaoId: "LTCG",
        provinceCode: "TR-61",
        name: "Trabzon Airport",
        lat: 40.995,
        lon: 39.789,
        elevationM: 32,
        tempC: 15.1
      }
    ];

    const coastSurf = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_28,
      target: {
        lat: 40.9227,
        lon: 38.3878,
        elevationM: 38,
        subBasinId: "TR28_GIRESUN_COASTAL_STRIP"
      },
      stations: mixedStations,
      drivers: { localHour: 9, month: 1, isNight: false, cloudCoverPct: 60 }
    });
    const alucraSurf = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_28,
      target: {
        lat: 40.3275,
        lon: 38.7522,
        elevationM: 1477,
        subBasinId: "TR28_KELKIT_SEBINKARAHISAR_INTERIOR"
      },
      stations: mixedStations,
      drivers: { localHour: 9, month: 1, isNight: false, cloudCoverPct: 60, hasSnowpack: true }
    });

    expect(coastSurf).not.toBeNull();
    expect(alucraSurf).not.toBeNull();
    expect(coastSurf!.rejectedCrossBorderCount).toBe(2);
    expect(coastSurf!.tempC).toBeGreaterThan(12.0);
    expect(alucraSurf!.tempC).toBeLessThan(-7.5);
  });

  it("models Ordu (TR-52) LTCB sea-fill marine belt, Boztepe-Çambaşı (1991 m) orographic ramp, Mesudiye-Akkuş snow belt, and southerly Melet Foehn", () => {
    const altinorduTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_52, {
      lat: 40.9838,
      lon: 37.8858,
      elevationM: 5,
      subBasinId: "TR52_UNYE_FATSA_ALTINORDU_COAST"
    });

    // NW (325°) Black Sea upslope ramp & Yason Cape coastal jet
    const orduUpslope = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_52,
      target: altinorduTarget,
      drivers: {
        localHour: 11,
        month: 12,
        isNight: false,
        cloudCoverPct: 90,
        wind850DirDeg: 325,
        wind850SpeedKmh: 38,
        wind10mDirDeg: 320,
        wind10mSpeedKmh: 28
      }
    });
    expect(orduUpslope.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(orduUpslope.precipMultiplier).toBeGreaterThan(1.32);

    const yasonJet = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_52.venturiCorridors,
      targetLat: 41.095,
      targetLon: 37.72,
      windDirDeg: 300,
      windSpeedKmh: 30
    });
    expect(yasonJet.speedMultiplier).toBeGreaterThan(1.2);

    // Southerly (190°) Melet Foehn warming onto Altınordu coast
    const orduFoehn = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_52,
      target: altinorduTarget,
      drivers: {
        localHour: 15,
        month: 2,
        isNight: false,
        cloudCoverPct: 25,
        wind850DirDeg: 190,
        wind850SpeedKmh: 54,
        wind10mDirDeg: 185,
        wind10mSpeedKmh: 32,
        bruntVaisalaFreqS1: 0.0085
      }
    });
    expect(orduFoehn.activeRegime).toBe("FOEHN_LEE");
    expect(orduFoehn.foehnTempDeltaC).toBeGreaterThan(2.0);

    // LTCB accepted inside TR-52 while Samsun LTFH (TR-55) is rejected; vertical ramp Altınordu (5m) -> Çambaşı (1991m)
    const orduSurf = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_52,
      target: {
        lat: 40.6334,
        lon: 37.9359,
        elevationM: 1991,
        subBasinId: "TR52_CAMBASI_KARAGOL_ALPINE"
      },
      stations: [
        {
          stationId: "LTCB",
          icaoId: "LTCB",
          provinceCode: "TR-52",
          name: "Ordu-Giresun Airport",
          lat: 40.967,
          lon: 38.0815,
          elevationM: 3,
          tempC: 8.6,
          relHumidityPct: 78
        },
        {
          stationId: 18534,
          provinceCode: "TR-52",
          name: "Ulubey",
          lat: 40.8733,
          lon: 37.7528,
          elevationM: 607,
          tempC: 4.8,
          relHumidityPct: 82
        },
        {
          stationId: 18525,
          provinceCode: "TR-52",
          name: "Çambaşı Kayak Merkezi",
          lat: 40.6334,
          lon: 37.9359,
          elevationM: 1991,
          tempC: -4.4,
          relHumidityPct: 90,
          snowDepthCm: 65
        },
        {
          stationId: "LTFH",
          icaoId: "LTFH",
          provinceCode: "TR-55",
          name: "Samsun Çarşamba",
          lat: 41.254,
          lon: 36.567,
          elevationM: 6,
          tempC: 10.2
        }
      ],
      drivers: { localHour: 13, month: 1, isNight: false, cloudCoverPct: 85, hasSnowpack: true }
    });
    expect(orduSurf).not.toBeNull();
    expect(orduSurf!.rejectedCrossBorderCount).toBe(1);
    expect(orduSurf!.acceptedStationCount).toBe(3);
    expect(orduSurf!.tempC).toBeLessThan(-3.5);
  });

  it("captures Tokat (TR-60) 3-step microclimate: mild Erbaa-Niksar Kelkit trough vs Kazova LTAW fog/inversion floor vs cold Artova-Çamlıbel-Başçiftlik plateau", () => {
    expect(PROVINCE_SPEC_TR_60.waterBodies).toHaveLength(0);

    const tokatStations: ProvinceLiveStationObs[] = [
      // Step 1: Mild Kelkit trough (Erbaa 198m & Niksar 333m)
      {
        stationId: 18142,
        provinceCode: "TR-60",
        name: "Erbaa",
        lat: 40.6931,
        lon: 36.58,
        elevationM: 198,
        tempC: 6.8,
        relHumidityPct: 74
      },
      {
        stationId: 18141,
        provinceCode: "TR-60",
        name: "Niksar",
        lat: 40.5978,
        lon: 36.9353,
        elevationM: 333,
        tempC: 5.9,
        relHumidityPct: 76
      },
      // Step 2: Kazova radiative fog/inversion floor (LTAW 558m colder than Tokat Merkez 611m urban slope!)
      {
        stationId: "LTAW",
        icaoId: "LTAW",
        provinceCode: "TR-60",
        name: "Tokat Havalimanı (Kazova)",
        lat: 40.3117,
        lon: 36.3711,
        elevationM: 558,
        tempC: -3.2,
        relHumidityPct: 98
      },
      {
        stationId: 17086,
        provinceCode: "TR-60",
        name: "Tokat Merkez",
        lat: 40.3312,
        lon: 36.5577,
        elevationM: 611,
        tempC: 0.4,
        relHumidityPct: 86
      },
      // Step 3: Harsh continental Artova (1180m) & Başçiftlik ski crest (1414m)
      {
        stationId: 18143,
        provinceCode: "TR-60",
        name: "Artova",
        lat: 40.1128,
        lon: 36.3069,
        elevationM: 1180,
        tempC: -9.8,
        relHumidityPct: 88,
        snowDepthCm: 18
      },
      {
        stationId: 17717,
        provinceCode: "TR-60",
        name: "Başçiftlik",
        lat: 40.551,
        lon: 37.1625,
        elevationM: 1414,
        tempC: -7.4,
        relHumidityPct: 85,
        snowDepthCm: 42
      },
      // Cross-border Sivas LTAR (TR-58) & Amasya LTAP (TR-05) leaks — MUST BE REJECTED!
      {
        stationId: "LTAR",
        icaoId: "LTAR",
        provinceCode: "TR-58",
        name: "Sivas Nuri Demirağ",
        lat: 39.813,
        lon: 36.903,
        elevationM: 1596,
        tempC: -16.5
      },
      {
        stationId: "LTAP",
        icaoId: "LTAP",
        provinceCode: "TR-05",
        name: "Amasya Merzifon",
        lat: 40.829,
        lon: 35.522,
        elevationM: 536,
        tempC: -1.5
      }
    ];

    const calmWinterNight = {
      localHour: 5,
      month: 1,
      isNight: true,
      cloudCoverPct: 12,
      wind10mDirDeg: 60,
      wind10mSpeedKmh: 4,
      hasSnowpack: true
    };

    const erbaaSurf = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_60,
      target: {
        lat: 40.6931,
        lon: 36.58,
        elevationM: 198,
        subBasinId: "TR60_ERBAA_NIKSAR_KELKIT_TROUGH"
      },
      stations: tokatStations,
      drivers: calmWinterNight
    });
    const tokatCenterSurf = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_60,
      target: {
        lat: 40.3312,
        lon: 36.5577,
        elevationM: 611,
        subBasinId: "TR60_KAZOVA_YESILIRMAK_BASIN"
      },
      stations: tokatStations,
      drivers: calmWinterNight
    });
    const artovaSurf = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_60,
      target: {
        lat: 40.1128,
        lon: 36.3069,
        elevationM: 1180,
        subBasinId: "TR60_ZILE_ARTOVA_CAMLIBEL_PLATEAU"
      },
      stations: tokatStations,
      drivers: calmWinterNight
    });

    expect(erbaaSurf).not.toBeNull();
    expect(tokatCenterSurf).not.toBeNull();
    expect(artovaSurf).not.toBeNull();

    // Zero cross-border leakage from Sivas (LTAR) or Amasya (LTAP)
    expect(tokatCenterSurf!.rejectedCrossBorderCount).toBe(2);

    // Distinct 3-step ordering: Erbaa (+5..+7°C) >> Tokat Merkez (~0°C, protected from LTAW -3.2°C cold pool) >> Artova (<-8°C)!
    expect(erbaaSurf!.tempC).toBeGreaterThan(5.5);
    expect(tokatCenterSurf!.tempC).toBeGreaterThan(-0.6);
    expect(tokatCenterSurf!.tempC).toBeLessThan(2.5);
    expect(artovaSurf!.tempC).toBeLessThan(-8.0);
  });
});
