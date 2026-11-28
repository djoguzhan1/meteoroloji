import { describe, expect, it } from "vitest";
import {
  getAllowedTurkeyIcaosForProvince,
  isIcaoAllowedForProvince
} from "../../lib/metar-verify";
import { verifyBursaImmutabilityManifest } from "../../lib/provinces/bursa-vault-guard";
import { TR_NATIONAL_CATALOG } from "../../lib/provinces/catalog-1102";
import {
  computeTrDailyClimatologyNormal,
  TR81_CLIMATOLOGY_1991_2020
} from "../../lib/provinces/climatology-1991-2020";
import PROVINCE_CALIBRATION_TR_04 from "../../lib/provinces/emos-weights/tr-04";
import PROVINCE_CALIBRATION_TR_36 from "../../lib/provinces/emos-weights/tr-36";
import PROVINCE_CALIBRATION_TR_76 from "../../lib/provinces/emos-weights/tr-76";
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
  resolveProvinceElevationBandSpecs,
  TR81_HYPSOMETRIC_PROFILES
} from "../../lib/provinces/hypsometric-bands-tr81";
import { STATIC_MGM_ISTNO_OWNER_PROVINCE } from "../../lib/provinces/mgm-dem-repair";
import PROVINCE_SPEC_TR_04_DEFAULT, {
  PROVINCE_SPEC_TR_04,
  TR_04_SIBERIAN_POLE_META
} from "../../lib/provinces/specs/tr-04";
import PROVINCE_SPEC_TR_36_DEFAULT, {
  PROVINCE_SPEC_TR_36,
  TR_36_KARS_PLATEAU_META
} from "../../lib/provinces/specs/tr-36";
import PROVINCE_SPEC_TR_76_DEFAULT, {
  PROVINCE_SPEC_TR_76,
  TR_76_SURMELI_DEPRESSION_META
} from "../../lib/provinces/specs/tr-76";
import type { ProvinceSpec, TrProvinceCode } from "../../lib/provinces/types";
import {
  buildElevationBandSpecs,
  maxDekStatus,
  simulateCoupledSnowTimeline,
  type SnowSimulationHourInput
} from "../../lib/snow-and-lightning-engine";
import type { DekSnowStatus } from "../../lib/weather-types";

const REG_18_SPECS: readonly ProvinceSpec[] = [
  PROVINCE_SPEC_TR_04,
  PROVINCE_SPEC_TR_36,
  PROVINCE_SPEC_TR_76
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
  return [...ids];
}

describe("Wave 3C REG-18: Aras–Ağrı Sibirya Havzaları & Iğdır Mikro-Çöküntüsü (TR-04 Ağrı, TR-36 Kars, TR-76 Iğdır)", () => {
  it("1. sözleşme tamlığını, donmuş (frozen) yapıyı, simetrik bariyer matrisini ve ADM1 poligon sahipliğini doğrular", () => {
    expect(PROVINCE_SPEC_TR_04_DEFAULT).toBe(PROVINCE_SPEC_TR_04);
    expect(PROVINCE_SPEC_TR_36_DEFAULT).toBe(PROVINCE_SPEC_TR_36);
    expect(PROVINCE_SPEC_TR_76_DEFAULT).toBe(PROVINCE_SPEC_TR_76);

    for (const spec of REG_18_SPECS) {
      expect(Object.isFrozen(spec)).toBe(true);
      expect(spec.region).toBe("EASTERN_ANATOLIA");
      expect(spec.climateRegion).toBe("DOGU_ANADOLU");
      expect(spec.waterBodies).toEqual([]);
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.curatedSubLocations.length).toBeGreaterThanOrEqual(4);

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

      const centerRes = resolveProvinceCode({
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon
      });
      expect(centerRes.provinceCode).toBe(spec.provinceCode);
      expect(centerRes.method).toBe("exact_polygon");

      for (const sub of spec.curatedSubLocations) {
        const res = resolveProvinceCode({ lat: sub.lat, lon: sub.lon });
        expect(
          res.provinceCode,
          `${sub.id} (${sub.lat}, ${sub.lon}) sızdı -> ${res.provinceCode}`
        ).toBe(spec.provinceCode);
      }

      for (const [key, ov] of Object.entries(spec.stationOverrides)) {
        expect(subBasinIds).toContain(ov.subBasinId);
        if (ov.lat !== undefined && ov.lon !== undefined) {
          const res = resolveProvinceCode({ lat: ov.lat, lon: ov.lon });
          expect(
            res.provinceCode,
            `stationOverride ${key} (${ov.lat}, ${ov.lon}) sızdı -> ${res.provinceCode}`
          ).toBe(spec.provinceCode);
        }
      }

      for (const pt of spec.stencil9Points) {
        const res = resolveProvinceCode({ lat: pt.lat, lon: pt.lon });
        expect(
          res.provinceCode,
          `stencil9Point ${pt.key} (${pt.lat}, ${pt.lon}) sızdı -> ${res.provinceCode}`
        ).toBe(spec.provinceCode);
      }
    }
  });

  it("2. TR-04 Ağrı: Türkiye'nin mutlak soğuk kutbu (-46°C, kar-albedo 8.5°C, 700 hPa tavan), Tahir Geçidi (2470 m) Venturi ve Büyük Ağrı Dağı (5137 m) fiziğini doğrular", () => {
    expect(PROVINCE_SPEC_TR_04.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_04.primaryCenter.wmoId).toBe("17099");
    expect(TR_04_SIBERIAN_POLE_META.meteostatStationId).toBe("LTCO0");
    expect(PROVINCE_SPEC_TR_04.icaoWhitelist).toEqual(["LTCO"]);
    expect(getAllowedTurkeyIcaosForProvince("TR-04")).toEqual(["LTCO"]);
    expect(PROVINCE_SPEC_TR_04.qcAndMosBounds.minPlausibleTempC).toBe(-46);
    expect(PROVINCE_SPEC_TR_04.inversionAndWedgeSpec.deltaPressureTopHpa).toBe(700);
    expect(PROVINCE_SPEC_TR_04.inversionAndWedgeSpec.snowAlbedoFeedback).toEqual({
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 8.5
    });
    expect(PROVINCE_SPEC_TR_04.verticalProfileSpec.maxPhysicalPeakM).toBe(5137);

    const araratSummit = PROVINCE_SPEC_TR_04.curatedSubLocations.find(
      (s) => s.id === "tr-04-buyuk-agri-zirve"
    );
    expect(araratSummit?.elevationM).toBe(5137);

    // 2A. Kar örtüsüz vs 45 cm kar örtülü Sibirya gecesinde Murat Nehri çanağı (1632 m) enverziyon amplifikasyonu
    const bareProfile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_04 as ProvinceEngineSpec,
      stations: [],
      cloudCoverPct: 5,
      wind10mSpeedKmh: 2,
      wind850SpeedKmh: 6,
      isNight: true,
      hasSnowpack: false
    });
    const siberianSnowProfile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_04 as ProvinceEngineSpec,
      stations: [
        {
          stationId: 17099,
          provinceCode: "TR-04",
          lat: 39.7253,
          lon: 43.0522,
          elevationM: 1632,
          tempC: -39.4,
          snowDepthCm: 45,
          subBasinId: "TR04_AGRI_MURAT_SIBERIAN_BOWL"
        },
        {
          stationId: 19065,
          provinceCode: "TR-04",
          lat: 39.855,
          lon: 42.455,
          elevationM: 2470,
          tempC: -26.2,
          snowDepthCm: 95,
          subBasinId: "TR04_ELESKIRT_TAHIR_BLIZZARD_PASS"
        }
      ],
      cloudCoverPct: 5,
      wind10mSpeedKmh: 2,
      wind850SpeedKmh: 6,
      isNight: true,
      hasSnowpack: true
    });

    expect(siberianSnowProfile.snowpackAmplified).toBe(true);
    expect(siberianSnowProfile.boundaryLayerState).toBe("STRONG_INVERSION");
    expect(siberianSnowProfile.lowerPoolLapseCPerKm).toBeGreaterThan(
      bareProfile.lowerPoolLapseCPerKm + 4.0
    );
    expect(siberianSnowProfile.inversionStrengthC).toBeGreaterThan(8.0);

    // 2B. -44.8°C ekstrem Sibirya ayazı QC tarafından reddedilmeden kabul edilir + LTCO kırsal havalimanı unbias
    const muratExtremeSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_04 as ProvinceEngineSpec,
      target: { lat: 39.7253, lon: 43.0522, elevationM: 1632 },
      stations: [
        {
          stationId: 17099,
          provinceCode: "TR-04",
          lat: 39.7253,
          lon: 43.0522,
          elevationM: 1632,
          tempC: -41.6,
          snowDepthCm: 48,
          subBasinId: "TR04_AGRI_MURAT_SIBERIAN_BOWL"
        },
        {
          stationId: "LTCO",
          icaoId: "LTCO",
          provinceCode: "TR-04",
          lat: 39.6545,
          lon: 43.0271,
          elevationM: 1632,
          tempC: -44.8,
          snowDepthCm: 52,
          subBasinId: "TR04_AGRI_MURAT_SIBERIAN_BOWL"
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
    expect(muratExtremeSurface).not.toBeNull();
    expect(muratExtremeSurface!.acceptedStationCount).toBe(2);
    expect(muratExtremeSurface!.tempC).toBeLessThan(-40.5);
    const ltcoNode = muratExtremeSurface!.contributions.find((c) => c.stationId === "LTCO");
    expect(ltcoNode?.usedColdBasinUnbias).toBe(true);

    // 2C. Eleşkirt – Tahir Geçidi (2470 m) Venturi tipi ivmelenmesi ve mekanik enverziyon kırılması
    const tahirVenturi = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_04.venturiCorridors,
      targetLat: 39.855,
      targetLon: 42.455,
      windDirDeg: 285,
      windSpeedKmh: 36
    });
    expect(tahirVenturi.activeCorridorIds).toContain("TR04_ELESKIRT_TAHIR_PASS_VENTURI");
    expect(tahirVenturi.speedMultiplier).toBeGreaterThan(1.34);
    expect(tahirVenturi.gustMultiplier).toBeGreaterThan(1.48);
    expect(tahirVenturi.suppressesNocturnalInversion).toBe(true);

    // 2D. Standart karışımlı gündüz atmosferinde Murat çanağından (1632 m) Büyük Ağrı zirvesine (5137 m) > 21°C soğuma
    const mixedProfile04 = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_04 as ProvinceEngineSpec,
      stations: [],
      cloudCoverPct: 45,
      wind10mSpeedKmh: 18,
      wind850SpeedKmh: 38,
      isNight: false
    });
    const deltaToAraratSummitC = integrateProvinceVerticalDeltaC(1632, 5137, mixedProfile04);
    expect(deltaToAraratSummitC).toBeLessThan(-21.0);

    // 2E. Tier-A WMO 17099 ampirik EMOS entegrasyonu
    const mos04 = evaluateProvinceCalibratedHour({
      leadHours: 24,
      localHour: 6,
      month: 1,
      spec: PROVINCE_SPEC_TR_04 as ProvinceEngineSpec,
      bundle: PROVINCE_CALIBRATION_TR_04,
      tempSnapshot: {
        ecmwfIfs: -19.2,
        ecmwfAifs: -20.4,
        icon: -18.5,
        ukmo: -19.0,
        meteofrance: -21.0,
        gfs: -20.1,
        gem: -21.5,
        jma: -18.8
      }
    });
    expect(mos04.tier).toBe("TIER_A_EMPIRICAL_WMO");
    expect(mos04.weightSum).toBeCloseTo(1.0, 5);
    expect(mos04.temperatureC).toBeLessThan(-19.0);
  });

  it("3. TR-36 Kars: 1775 m bazalt platosu, Mayıs–Haziran konvektif yağış/dolu zirvesi, Sarıkamış Cıbıltepe (2100–2634 m) kristal toz karı ve Kağızman Aras (~1349 m) mikroklimasını doğrular", () => {
    expect(PROVINCE_SPEC_TR_36.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_36.primaryCenter.wmoId).toBe("17098");
    expect(PROVINCE_SPEC_TR_36.icaoWhitelist).toEqual(["LTCF"]);
    expect(getAllowedTurkeyIcaosForProvince("TR-36")).toEqual(["LTCF"]);
    expect(PROVINCE_SPEC_TR_36.qcAndMosBounds.minPlausibleTempC).toBe(-40);
    expect(TR_36_KARS_PLATEAU_META.annualPrecipPeakMonths).toEqual([5, 6]);

    // 3A. Klimatolojik rejim kanıtı: Yıllık yağış maksimumu Mayıs–Haziran (konvektif sağanak/dolu), kış kuru Sibirya ayazı!
    const clim36 = TR81_CLIMATOLOGY_1991_2020["TR-36"];
    const mayJunePrecipMm = clim36.precipMm[4] + clim36.precipMm[5]; // Mayıs (78.4) + Haziran (74.6) = 153.0 mm
    const djfPrecipMm = clim36.precipMm[11] + clim36.precipMm[0] + clim36.precipMm[1]; // Aralık+Ocak+Şubat = 66.8 mm
    expect(clim36.precipMm[4]).toBe(Math.max(...clim36.precipMm));
    expect(mayJunePrecipMm).toBeGreaterThan(djfPrecipMm * 2.0);
    expect(clim36.wetDays[4]).toBeGreaterThan(15);

    // 3B. Sarıkamış Cıbıltepe (2315–2634 m) kristal toz kar fiziği (yüksek SLR > 14:1, 0 sahte DEK ve monoton 4-bant)
    const sarikamisHours: SnowSimulationHourInput[] = Array.from({ length: 12 }, (_, i) => ({
      timeIso: `2026-12-20T${String(i).padStart(2, "0")}:00`,
      dateYmd: "2026-12-20",
      leadHour: i,
      lat: 40.2966,
      lon: 42.5822,
      elevationM: 2315,
      provinceCode: "TR-36",
      temp2mC: -10.5,
      rh2mPct: 82,
      wetBulbC: -11.4,
      windSpeedKmh: 16,
      windGustsKmh: 28,
      windDirDeg: 295,
      cloudCoverPct: 88,
      solarElevationDeg: i >= 8 ? 16 : -14,
      shortwaveWm2: i >= 8 ? 110 : 0,
      precipMmHr: 1.5,
      precipP90MmHr: 2.3,
      precipProbPct: 92,
      rawModelSnowfallCm: 2.2,
      precipPhase: "snow",
      freezingLevelM: 900,
      temp850hPa: 2.0, // 2315 m için yeraltı 850 hPa yanılsaması!
      temp700hPa: -16.5, // Gerçek 700 hPa (~3010 m) kristal dendritik büyüme kuşağı!
      capeJkg: 25,
      seaSurfaceTempC: null
    }));

    const sarikamisSnow = simulateCoupledSnowTimeline({
      hours: sarikamisHours,
      provinceCode: "TR-36",
      locationName: "Sarıkamış Cıbıltepe"
    });

    const dekStatus15d = sarikamisSnow.reduce<DekSnowStatus>(
      (acc, h) => maxDekStatus(acc, h.dekStatus),
      "none"
    );
    expect(dekStatus15d).toBe("none");
    const lastSnowHour = sarikamisSnow[sarikamisSnow.length - 1];
    expect(lastSnowHour.cumulativeAirSnowCm).toBeGreaterThan(22);

    const meanPowderSlr =
      sarikamisSnow.reduce((acc, h) => acc + h.slr, 0) / sarikamisSnow.length;
    expect(meanPowderSlr).toBeGreaterThan(14.0);

    // 4-bant kesiti: Kağızman (1410 m) < Kars Merkez (1775 m) < Sarıkamış Cıbıltepe (2315 m referans) < Zirve (2634 m)
    const bandSpecs36 = buildElevationBandSpecs(
      40.2966,
      42.5822,
      2315,
      "TR-36",
      "Sarıkamış Cıbıltepe"
    );
    expect(bandSpecs36).toHaveLength(4);
    expect(bandSpecs36[2].isReferenceBand).toBe(true);
    expect(bandSpecs36[2].elevationM).toBe(2315);
    expect(bandSpecs36[3].elevationM).toBe(2634);

    const bandTotalsCm = [0, 1, 2, 3].map((bIdx) =>
      sarikamisSnow.reduce((sum, h) => sum + h.elevationBands[bIdx].airSnowCm, 0)
    );
    expect(bandTotalsCm[0]).toBeLessThan(bandTotalsCm[1]);
    expect(bandTotalsCm[1]).toBeLessThan(bandTotalsCm[2]);
    expect(bandTotalsCm[2]).toBeLessThan(bandTotalsCm[3]);

    // 3C. Kağızman Aras derin vadisi (1349 m, MGM 18198) fön ısınması ve Kars platosundan bariyer izolasyonu
    expect(
      PROVINCE_SPEC_TR_36.barrierCouplingMatrix.TR36_KAGIZMAN_ARAS_ORCHARD_VALLEY
        .TR36_KARS_SELIM_BASALT_PLATEAU
    ).toBeLessThanOrEqual(0.2);

    const kagizmanOverride = PROVINCE_SPEC_TR_36.stationOverrides["18198"];
    expect(kagizmanOverride.subBasinId).toBe("TR36_KAGIZMAN_ARAS_ORCHARD_VALLEY");

    const kagizmanTarget = resolveProvinceTargetMetadata(
      PROVINCE_SPEC_TR_36 as ProvinceEngineSpec,
      {
        lat: 40.1533,
        lon: 43.1261,
        elevationM: 1349,
        subBasinId: kagizmanOverride.subBasinId
      }
    );
    expect(kagizmanTarget.subBasinId).toBe("TR36_KAGIZMAN_ARAS_ORCHARD_VALLEY");

    const kagizmanFoehn = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_36 as ProvinceEngineSpec,
      target: kagizmanTarget,
      drivers: {
        localHour: 14,
        month: 3,
        isNight: false,
        cloudCoverPct: 30,
        wind850DirDeg: 345,
        wind850SpeedKmh: 58,
        bruntVaisalaFreqS1: 0.0098
      }
    });
    expect(kagizmanFoehn.activeRegime).toBe("FOEHN_LEE");
    expect(kagizmanFoehn.foehnTempDeltaC).toBeGreaterThan(2.6);
    expect(kagizmanFoehn.precipMultiplier).toBeLessThan(0.75);

    // 3D. Tier-A WMO 17098 ampirik EMOS entegrasyonu (DJF GEM + AIFS ağırlıklı soğuk plato kalibrasyonu)
    const mos36 = evaluateProvinceCalibratedHour({
      leadHours: 18,
      localHour: 5,
      month: 1,
      spec: PROVINCE_SPEC_TR_36 as ProvinceEngineSpec,
      bundle: PROVINCE_CALIBRATION_TR_36,
      tempSnapshot: {
        ecmwfIfs: -14.0,
        ecmwfAifs: -19.5,
        icon: -16.0,
        ukmo: -17.0,
        meteofrance: -18.5,
        gfs: -18.8,
        gem: -21.2,
        jma: -15.5
      }
    });
    expect(mos36.tier).toBe("TIER_A_EMPIRICAL_WMO");
    expect(mos36.activeWeights.gem).toBeGreaterThan(0.3);
    expect(mos36.activeWeights.ecmwfAifs).toBeGreaterThan(0.25);
    expect(mos36.temperatureC).toBeLessThan(-18.5);
  });

  it("4. TR-76 Iğdır: Sürmeli Çukuru (~856 m) +8..12°C sıcak anomali, ~268 mm yağış gölgesi, kış Aras sis/kirlilik kilidi (0.52) ve yabancı 37787 Erivan yasağını doğrular", () => {
    expect(PROVINCE_SPEC_TR_76.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(PROVINCE_SPEC_TR_76.donorCluster).toBe("EAST_MICRO_DEPRESSION");
    expect(PROVINCE_SPEC_TR_76.primaryCenter.wmoId).toBeUndefined();
    expect(PROVINCE_CALIBRATION_TR_76.wmoStationId).toBeNull();
    expect(PROVINCE_SPEC_TR_76.icaoWhitelist).toEqual(["LTCT"]);
    expect(getAllowedTurkeyIcaosForProvince("TR-76")).toEqual(["LTCT"]);

    // 4A. Yabancı 37787 / 37789 Erivan & UDYZ / UDSG / UBBN istasyonlarının kesin yasağı!
    for (const forbidden of TR_76_SURMELI_DEPRESSION_META.forbiddenForeignStationIds) {
      expect(isIcaoAllowedForProvince(forbidden, "TR-76")).toBe(false);
      expect(isIcaoAllowedForProvince(forbidden, "TR-36")).toBe(false);
      expect(isIcaoAllowedForProvince(forbidden, "TR-04")).toBe(false);
      expect(PROVINCE_SPEC_TR_76.stationOverrides[forbidden]).toBeUndefined();
    }
    expect(resolveProvinceCode({ lat: 40.1473, lon: 44.3959 }).provinceCode).toBe("GLOBAL");
    expect(resolveProvinceCode({ lat: 40.7504, lon: 43.8593 }).provinceCode).toBe("GLOBAL");
    expect(PROVINCE_CALIBRATION_TR_76.donorProvinces).toEqual(["TR-24", "TR-04", "TR-44"]);
    for (const donor of PROVINCE_CALIBRATION_TR_76.donorStations ?? []) {
      expect(donor.wmoStationId).not.toBe("37787");
      expect(donor.provinceCode.startsWith("TR-")).toBe(true);
    }

    // 4B. Türkiye'nin en kurak yağış gölgesi (~268.2 mm/yıl) ve Kars/Ağrı'dan +8..10°C sıcak bahar/yaz mikrokliması
    const clim76 = TR81_CLIMATOLOGY_1991_2020["TR-76"];
    const annualPrecip76 = clim76.precipMm.reduce((a, b) => a + b, 0);
    expect(annualPrecip76).toBeCloseTo(268.2, 1);
    expect(annualPrecip76).toBeLessThan(280);

    const springIgdir = computeTrDailyClimatologyNormal({
      provinceCode: "TR-76",
      lat: 39.9227,
      lon: 44.0523,
      elevationM: 856,
      dayOfYear: 95 // 5 Nisan
    });
    const springKars = computeTrDailyClimatologyNormal({
      provinceCode: "TR-36",
      lat: 40.6042,
      lon: 43.1073,
      elevationM: 1775,
      dayOfYear: 95
    });
    const springAgri = computeTrDailyClimatologyNormal({
      provinceCode: "TR-04",
      lat: 39.7253,
      lon: 43.0522,
      elevationM: 1632,
      dayOfYear: 95
    });
    expect(springIgdir.tmaxNormalC - springKars.tmaxNormalC).toBeGreaterThan(8.2);
    expect(springIgdir.tmaxNormalC - springAgri.tmaxNormalC).toBeGreaterThan(7.5);

    // 4C. Büyük Ağrı Dağı (5137 m) güneyli fön & tam yağış gölgesi (precipMultiplier <= 0.66)
    const igdirCenterTarget = resolveProvinceTargetMetadata(
      PROVINCE_SPEC_TR_76 as ProvinceEngineSpec,
      {
        lat: 39.9227,
        lon: 44.0523,
        elevationM: 856
      }
    );
    const araratShadow = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_76 as ProvinceEngineSpec,
      target: igdirCenterTarget,
      drivers: {
        localHour: 15,
        month: 4,
        isNight: false,
        cloudCoverPct: 45,
        wind850DirDeg: 195,
        wind850SpeedKmh: 62,
        bruntVaisalaFreqS1: 0.0092
      }
    });
    expect(araratShadow.activeRegime).toBe("FOEHN_LEE");
    expect(araratShadow.foehnTempDeltaC).toBeGreaterThan(3.5);
    expect(araratShadow.precipMultiplier).toBeLessThanOrEqual(0.66);

    // 4D. Kış Aras çanağı kalıcı yoğun sis / hava kirliliği enverziyon kilidi (daytimeSolarDampingFactor === 0.52)
    expect(PROVINCE_SPEC_TR_76.inversionAndWedgeSpec.persistentStratusLock).toEqual({
      enabled: true,
      daytimeSolarDampingFactor: 0.52
    });
    const winterArasSmogProfile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_76 as ProvinceEngineSpec,
      stations: [
        {
          stationId: 17100,
          provinceCode: "TR-76",
          lat: 39.9227,
          lon: 44.0523,
          elevationM: 856,
          tempC: -6.8,
          relHumidityPct: 99,
          snowDepthCm: 6,
          subBasinId: "TR76_IGDIR_SURMELI_MICRO_DEPRESSION"
        },
        {
          stationId: 18195,
          provinceCode: "TR-76",
          lat: 39.8731,
          lon: 44.5183,
          elevationM: 825,
          tempC: -7.4,
          relHumidityPct: 100,
          snowDepthCm: 5,
          subBasinId: "TR76_ARALIK_DILUCU_ARID_TROUGH"
        },
        {
          stationId: 18372,
          provinceCode: "TR-76",
          lat: 40.0447,
          lon: 43.6672,
          elevationM: 1110,
          tempC: -3.2,
          relHumidityPct: 84,
          subBasinId: "TR76_TUZLUCA_WEST_ARAS_GORGE"
        }
      ],
      cloudCoverPct: 95,
      shortwaveRadiationWm2: 55,
      wind10mSpeedKmh: 2,
      wind850SpeedKmh: 7,
      isNight: false,
      hasSnowpack: true
    });
    expect(winterArasSmogProfile.coldPoolTopM).toBe(1436);
    expect(winterArasSmogProfile.boundaryLayerState).toBe("STRONG_INVERSION");
    expect(winterArasSmogProfile.lowerPoolLapseCPerKm).toBeGreaterThan(1.8);
    expect(winterArasSmogProfile.observedWlsLapseCPerKm!).toBeGreaterThan(10.0);

    // 4E. Dürüst Tier-B MOS doğrulaması: sıfır sabit sapma (interceptC === 0) + MGM ALARO 4.5 km harmanlama
    const mos76 = evaluateProvinceCalibratedHour({
      leadHours: 12,
      localHour: 13,
      month: 1,
      spec: PROVINCE_SPEC_TR_76 as ProvinceEngineSpec,
      bundle: PROVINCE_CALIBRATION_TR_76,
      tempSnapshot: {
        ecmwfIfs: 3.5,
        ecmwfAifs: 2.8,
        icon: 2.2,
        ukmo: 3.0,
        meteofrance: 2.6,
        gfs: 3.8,
        gem: 2.4,
        jma: 3.2
      },
      mgmAlaroHourly: {
        tempC: -1.4,
        rhPct: 97,
        isWet: false
      }
    });
    expect(mos76.tier).toBe("TIER_B_DONOR_ALARO");
    expect(mos76.appliedInterceptC).toBe(0);
    expect(mos76.appliedDriverShiftC).toBe(0);
    expect(mos76.appliedAlaroBlendWeight).toBeGreaterThan(0.15);
    expect(mos76.temperatureC).toBeLessThan(mos76.simplexBackboneTempC - 0.6);

    const bands76 = resolveProvinceElevationBandSpecs({
      provinceCode: "TR-76",
      referenceElevationM: 856
    });
    expect(bands76[0].elevationM).toBeLessThan(bands76[1].elevationM);
    expect(bands76[1].isReferenceBand).toBe(true);
    expect(bands76[1].orographicBoost).toBe(1.0);
    expect(bands76[3].elevationM).toBe(3200);
    const prof76 = TR81_HYPSOMETRIC_PROFILES["TR-76"];
    expect(interpolateProvinceOrographicWeight(prof76, 3200)).toBeGreaterThan(
      interpolateProvinceOrographicWeight(prof76, 856) + 0.5
    );
  });

  it("5. TR-04, TR-36, TR-76, yabancı istasyonlar (37787/UDYZ) ve mühürlü TR-16 Bursa arasında %0.00 sızıntı ve SHA-256 kilidini doğrular", () => {
    const bursaIntegrity = verifyBursaImmutabilityManifest();
    expect(bursaIntegrity.ok).toBe(true);
    expect(bursaIntegrity.checkedCount).toBe(11);
    expect(bursaIntegrity.violations).toEqual([]);

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
    for (const spec of REG_18_SPECS) {
      expect(spec.icaoWhitelist).not.toContain("LTBR");
      expect(spec.icaoWhitelist).not.toContain("UDYZ");
      const ids = collectNumericMgmStationIds(spec);
      expect(ids.length).toBeGreaterThanOrEqual(6);

      for (const istNo of ids) {
        expect(istNo).not.toBe(37787);
        expect(bursaStationIds.has(istNo)).toBe(false);
        expect(
          STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo],
          `istNo ${istNo} (${spec.provinceCode}) yanlış ilde kayıtlı`
        ).toBe(spec.provinceCode);
      }
      byProv.set(spec.provinceCode, new Set(ids));
    }

    const codes = [...byProv.keys()];
    for (let i = 0; i < codes.length; i++) {
      for (let j = i + 1; j < codes.length; j++) {
        for (const id of byProv.get(codes[i])!) {
          expect(byProv.get(codes[j])!.has(id)).toBe(false);
        }
      }
    }

    // Canlı Cressman güvenlik duvarı: Iğdır'a (TR-76) sızdırılmaya çalışılan Erivan (37787/UDYZ), Kars (17097), Ağrı (17099) ve Bursa (17116) %100 reddedilir!
    const igdirFirewall = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_76 as ProvinceEngineSpec,
      target: { lat: 39.9227, lon: 44.0523, elevationM: 856 },
      stations: [
        {
          stationId: 17100,
          provinceCode: "TR-76",
          lat: 39.9227,
          lon: 44.0523,
          elevationM: 856,
          tempC: 11.4
        },
        {
          stationId: "37787",
          icaoId: "UDYZ",
          provinceCode: "GLOBAL",
          lat: 40.1473,
          lon: 44.3959,
          elevationM: 890,
          tempC: 2.0
        },
        {
          stationId: 17097,
          provinceCode: "TR-36",
          lat: 40.6042,
          lon: 43.1073,
          elevationM: 1775,
          tempC: -9.5
        },
        {
          stationId: 17099,
          provinceCode: "TR-04",
          lat: 39.7253,
          lon: 43.0522,
          elevationM: 1632,
          tempC: -18.0
        },
        {
          stationId: 17116,
          provinceCode: "TR-16",
          lat: 40.2308,
          lon: 29.0133,
          elevationM: 100,
          tempC: 19.5
        }
      ],
      drivers: {
        localHour: 14,
        month: 2,
        isNight: false,
        cloudCoverPct: 40
      }
    });

    expect(igdirFirewall).not.toBeNull();
    expect(igdirFirewall!.acceptedStationCount).toBe(1);
    expect(igdirFirewall!.rejectedCrossBorderCount).toBe(4);
    expect(igdirFirewall!.tempC).toBeCloseTo(11.4, 1);
  });
});
