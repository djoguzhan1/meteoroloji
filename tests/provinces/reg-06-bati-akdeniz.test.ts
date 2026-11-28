import { describe, expect, it } from "vitest";
import {
  getAllowedTurkeyIcaosForProvince,
  isIcaoAllowedForProvince
} from "../../lib/metar-verify";
import { verifyBursaImmutabilityManifest } from "../../lib/provinces/bursa-vault-guard";
import { searchTrNationalCatalog } from "../../lib/provinces/catalog-1102";
import { TR81_CLIMATOLOGY_1991_2020 } from "../../lib/provinces/climatology-1991-2020";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import {
  resolveProvinceElevationBandSpecs,
  TR81_HYPSOMETRIC_PROFILES
} from "../../lib/provinces/hypsometric-bands-tr81";
import { isMgmStationOwnedByProvince } from "../../lib/provinces/mgm-dem-repair";
import PROVINCE_SPEC_TR_07_DEFAULT, {
  evaluateTr07AntalyaColumnPhysics,
  isWindInCircularSector,
  PROVINCE_SPEC_TR_07,
  TR_07_BESPOKE_PRECIP_AND_FOEHN_LIMITS
} from "../../lib/provinces/specs/tr-07";
import PROVINCE_SPEC_TR_33_DEFAULT, {
  evaluateTr33MersinColumnPhysics,
  PROVINCE_SPEC_TR_33,
  TR_33_BESPOKE_LIMITS
} from "../../lib/provinces/specs/tr-33";
import PROVINCE_SPEC_TR_70_DEFAULT, {
  evaluateTr70KaramanColumnPhysics,
  PROVINCE_SPEC_TR_70,
  TR_70_BESPOKE_LIMITS
} from "../../lib/provinces/specs/tr-70";
import type { ProvinceSpec } from "../../lib/provinces/types";
import { simulateCoupledSnowTimeline } from "../../lib/snow-and-lightning-engine";

const REG_06_SPECS: readonly ProvinceSpec[] = [
  PROVINCE_SPEC_TR_07,
  PROVINCE_SPEC_TR_33,
  PROVINCE_SPEC_TR_70
];

describe("Wave 3A — REG-06 (Batı & Orta Akdeniz Toros Duvarı ve Sertavul Geçişi: TR-07 Antalya, TR-33 Mersin, TR-70 Karaman)", () => {
  it("1. Yapısal Sözleşme, MGM İstasyon Sahipliği, Hipsometrik 4-Bant ve 1991–2020 Klimatoloji Uyumu", () => {
    expect(PROVINCE_SPEC_TR_07_DEFAULT).toBe(PROVINCE_SPEC_TR_07);
    expect(PROVINCE_SPEC_TR_33_DEFAULT).toBe(PROVINCE_SPEC_TR_33);
    expect(PROVINCE_SPEC_TR_70_DEFAULT).toBe(PROVINCE_SPEC_TR_70);

    for (const spec of REG_06_SPECS) {
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.stencil9Points.filter((p) => p.role === "target")).toHaveLength(1);

      // 4-band hypsometric alignment & strict elevation monotonicity
      const officialHyp = TR81_HYPSOMETRIC_PROFILES[spec.provinceCode];
      expect(spec.verticalProfileSpec.maxPhysicalPeakM).toBe(officialHyp.maxPhysicalPeakM);
      expect(spec.verticalProfileSpec.snowElevationBands).toEqual(officialHyp.bands);
      const [k0, k1, k2, k3] = spec.verticalProfileSpec.piecewiseKnotsM;
      expect(k0).toBeLessThan(k1);
      expect(k1).toBeLessThan(k2);
      expect(k2).toBeLessThan(k3);
      expect(k3).toBeLessThanOrEqual(spec.verticalProfileSpec.maxPhysicalPeakM);

      // 1991–2020 WMO/MGM monthly Tmax/Tmin normals alignment
      const officialClim = TR81_CLIMATOLOGY_1991_2020[spec.provinceCode];
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toEqual(officialClim.tmaxC);
      expect(spec.primaryCenter.monthlyTminNormalsC).toEqual(officialClim.tminC);

      // Sub-basin coupling matrix symmetry & diagonal = 1.0
      const subBasinIds = spec.subBasins.map((b) => b.id);
      expect(subBasinIds).toContain(spec.primaryCenter.subBasinId);
      for (const a of subBasinIds) {
        expect(spec.barrierCouplingMatrix[a]?.[a]).toBe(1.0);
        for (const b of subBasinIds) {
          const wAB = spec.barrierCouplingMatrix[a]?.[b];
          const wBA = spec.barrierCouplingMatrix[b]?.[a];
          expect(wAB).toBeDefined();
          expect(wAB).toBeGreaterThanOrEqual(0);
          expect(wAB).toBeLessThanOrEqual(1);
          expect(wAB).toBeCloseTo(wBA ?? -1, 6);
        }
      }

      // Strict MGM station ownership (zero cross-province contamination)
      expect(
        isMgmStationOwnedByProvince(spec.primaryCenter.mgmIstNo, spec.provinceCode)
      ).toBe(true);
      for (const ov of Object.values(spec.stationOverrides)) {
        expect(subBasinIds).toContain(ov.subBasinId);
        if (typeof ov.stationId === "number") {
          expect(
            isMgmStationOwnedByProvince(ov.stationId, spec.provinceCode),
            `${spec.provinceCode} stationOverride ${ov.stationId}`
          ).toBe(true);
        }
      }
      for (const wb of spec.waterBodies) {
        for (const buoyId of wb.mgmMarineStationIds) {
          expect(
            isMgmStationOwnedByProvince(buoyId, spec.provinceCode),
            `${spec.provinceCode} marine buoy ${buoyId}`
          ).toBe(true);
        }
      }
    }

    // Tier & WMO / Donor contract checks
    expect(PROVINCE_SPEC_TR_07.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_07.primaryCenter.wmoId).toBe("17300");
    expect(PROVINCE_SPEC_TR_07.verticalProfileSpec.maxPhysicalPeakM).toBe(3070); // Kızlarsevrisi

    expect(PROVINCE_SPEC_TR_33.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_33.primaryCenter.wmoId).toBe("17340");
    expect(PROVINCE_SPEC_TR_33.verticalProfileSpec.maxPhysicalPeakM).toBe(3524); // Bolkar Medetsiz

    expect(PROVINCE_SPEC_TR_70.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(TR_70_BESPOKE_LIMITS.calibrationStrategy).toBe("TIER_B_DONOR_ALARO");
    expect(PROVINCE_SPEC_TR_70.primaryCenter.demVerifiedElevationM).toBe(1033);
    expect(PROVINCE_SPEC_TR_70.qcAndMosBounds.kalmanTempBiasCapC).toBe(6.5);
  });

  it("2. METAR Güvenlik Duvarı ve Sınır İzolasyonu: Meis Yunan Adası (LGKJ), Adana (LTAF) ve Konya (LTAN) Sızmaz", () => {
    // TR-07 Antalya: ONLY LTAI & LTFG; Greek Kastellorizo/Meis (LGKJ) strictly excluded
    expect(PROVINCE_SPEC_TR_07.icaoWhitelist).toEqual(["LTAI", "LTFG"]);
    expect(getAllowedTurkeyIcaosForProvince("TR-07")).toEqual(
      PROVINCE_SPEC_TR_07.icaoWhitelist
    );
    expect(isIcaoAllowedForProvince("LTAI", "TR-07")).toBe(true);
    expect(isIcaoAllowedForProvince("LTFG", "TR-07")).toBe(true);
    expect(isIcaoAllowedForProvince("LGKJ", "TR-07")).toBe(false);
    expect(isIcaoAllowedForProvince("LGRP", "TR-07")).toBe(false);
    expect(isIcaoAllowedForProvince("LTFC", "TR-07")).toBe(false);

    const meisIsland = resolveProvinceCode({ lat: 36.15, lon: 29.59 });
    expect(meisIsland.provinceCode).toBe("GLOBAL");
    const kasCoast = resolveProvinceCode({ lat: 36.2002, lon: 29.6502 });
    expect(kasCoast.provinceCode).toBe("TR-07");

    // TR-33 Mersin: Çukurova Intl (LTDB) in Tarsus is whitelisted; Adana Şakirpaşa (LTAF) & İncirlik (LTAG) barred
    expect(PROVINCE_SPEC_TR_33.icaoWhitelist).toEqual(["LTDB"]);
    expect(getAllowedTurkeyIcaosForProvince("TR-33")).toEqual(
      PROVINCE_SPEC_TR_33.icaoWhitelist
    );
    expect(isIcaoAllowedForProvince("LTDB", "TR-33")).toBe(true);
    expect(isIcaoAllowedForProvince("LTAF", "TR-33")).toBe(false);
    expect(isIcaoAllowedForProvince("LTAG", "TR-33")).toBe(false);
    const cukurovaAirportTarsus = resolveProvinceCode({ lat: 36.8942, lon: 34.9597 });
    expect(cukurovaAirportTarsus.provinceCode).toBe("TR-33");

    // TR-70 Karaman: zero METAR airports and zero water bodies (strictly landlocked Inner Anatolia)
    expect(PROVINCE_SPEC_TR_70.icaoWhitelist).toEqual([]);
    expect(getAllowedTurkeyIcaosForProvince("TR-70")).toEqual([]);
    expect(isIcaoAllowedForProvince("LTAN", "TR-70")).toBe(false);
    expect(isIcaoAllowedForProvince("LTDB", "TR-70")).toBe(false);
    expect(PROVINCE_SPEC_TR_70.waterBodies).toEqual([]);
    expect(PROVINCE_SPEC_TR_70.aridAndSevereDrivers.coastalWaterspoutSusceptibility).toBe(0);

    // Catalog lookups for Saklıkent, Tahtalı, Mut, and Karaman
    const saklikentHits = searchTrNationalCatalog("Antalya Saklıkent", { limit: 3 });
    expect(saklikentHits[0]?.provinceCode).toBe("TR-07");
    expect(saklikentHits[0]?.elevationM).toBeGreaterThanOrEqual(1850);
  });

  it("3. TR-07 Antalya Asimetrisi: Güneyli (150°–230°) Kıble/Lodos Ekstrem Taşkın + 1850–2500m Islak Dağ Karı vs. Kuzeyli (330°–40°) Poyraz Kuru Fön (+4.5°C, %15–25 Nem)", () => {
    // Akdeniz SST normals: winter ~20°C, summer 28–29°C
    const antalyaSea = PROVINCE_SPEC_TR_07.waterBodies[0];
    expect(antalyaSea.monthlyWaterTempNormalsC[0]).toBeGreaterThanOrEqual(19.5); // Ocak ~20°C
    expect(antalyaSea.monthlyWaterTempNormalsC[11]).toBeGreaterThanOrEqual(20.0); // Aralık ~20.6°C
    expect(antalyaSea.monthlyWaterTempNormalsC[6]).toBeGreaterThanOrEqual(28.0); // Temmuz 28.4°C
    expect(antalyaSea.monthlyWaterTempNormalsC[7]).toBeLessThanOrEqual(29.2); // Ağustos 29.0°C

    // Circular wrap-around check for 330°–40° northerly sector vs 150°–230° southerly sector
    expect(isWindInCircularSector(350, { fromDeg: 330, toDeg: 40 })).toBe(true);
    expect(isWindInCircularSector(20, { fromDeg: 330, toDeg: 40 })).toBe(true);
    expect(isWindInCircularSector(195, { fromDeg: 330, toDeg: 40 })).toBe(false);
    expect(isWindInCircularSector(195, { fromDeg: 150, toDeg: 230 })).toBe(true);

    // A) Güneyli (195° Kıble/Lodos) Akdeniz Fırtınası: Bursa Lodos yağış kesmesinin TAM TERSİ!
    // Kıyıda (47m) ekstrem konvektif sağanak (1.62x çarpan, 140 mm/s tavan) + 1850–2500m Saklıkent/Tahtalı'da yoğun ıslak kar!
    const southerlyDeluge = evaluateTr07AntalyaColumnPhysics({
      subBasinId: "antalya_gulf_travertine",
      targetElevationM: 47,
      windFromDirDeg: 195,
      windSpeed850Ms: 18.5,
      rawPrecipMmHr: 42.0,
      baseTemp2mC: 11.8,
      baseRh2mPct: 88,
      temp850C: 2.2, // 850 hPa (~1500m) +2.2°C -> 2100m Saklıkent/Tahtalı ~ -1.2°C ıslak dağ karı!
      month: 1
    });

    expect(southerlyDeluge.regime).toBe("SOUTHERLY_OROG_CONVECTIVE_DELUGE");
    expect(southerlyDeluge.precipMultiplier).toBeCloseTo(1.62, 2);
    expect(southerlyDeluge.adjustedPrecipMmHr).toBeCloseTo(42.0 * 1.62, 1);
    expect(southerlyDeluge.foehnWarmingC).toBe(0);
    expect(southerlyDeluge.activeMountainWetSnow1850To2500m).toBe(true);
    expect(southerlyDeluge.estimatedAlpineSnowSlr).not.toBeNull();
    expect(southerlyDeluge.estimatedAlpineSnowSlr!).toBeGreaterThanOrEqual(6.5);
    expect(southerlyDeluge.estimatedAlpineSnowSlr!).toBeLessThanOrEqual(10.5);

    // Extreme cloudburst cap check: 110 mm/h * 1.62 -> strictly capped at 140 mm/h
    const extremeBurst = evaluateTr07AntalyaColumnPhysics({
      subBasinId: "antalya_gulf_travertine",
      targetElevationM: 10,
      windFromDirDeg: 180,
      windSpeed850Ms: 22,
      rawPrecipMmHr: 110,
      baseTemp2mC: 14.0,
      baseRh2mPct: 92,
      temp850C: 4.0,
      month: 12
    });
    expect(extremeBurst.adjustedPrecipMmHr).toBe(
      TR_07_BESPOKE_PRECIP_AND_FOEHN_LIMITS.maxHourlyPrecipMm
    );
    expect(extremeBurst.adjustedPrecipMmHr).toBe(140);

    // Coupled snow-engine proof at Saklıkent (1920m) vs Antalya Coast (47m) during the exact same southerly storm:
    const antalyaBandsAtSaklikent = resolveProvinceElevationBandSpecs({
      provinceCode: "TR-07",
      referenceElevationM: 1920,
      locationName: "Saklıkent Kayak Merkezi"
    });
    expect(antalyaBandsAtSaklikent[3].isReferenceBand).toBe(true);
    expect(antalyaBandsAtSaklikent[3].elevationM).toBe(1920);

    const saklikentWetSnowSim = simulateCoupledSnowTimeline({
      hours: [
        {
          timeIso: "2026-01-18T12:00",
          dateYmd: "2026-01-18",
          leadHour: 0,
          elevationM: 2050,
          lat: 36.8405,
          lon: 30.3315,
          temp2mC: -0.6,
          rh2mPct: 95,
          wetBulbC: -0.9,
          windSpeedKmh: 38,
          windGustsKmh: 58,
          windDirDeg: 195,
          cloudCoverPct: 100,
          solarElevationDeg: 28,
          shortwaveWm2: 65,
          precipMmHr: 18.5,
          precipP90MmHr: 26.0,
          precipProbPct: 98,
          rawModelSnowfallCm: 14.0,
          precipPhase: "snow",
          freezingLevelM: 1950,
          temp850hPa: 2.2,
          capeJkg: 380,
          seaSurfaceTempC: 19.8,
          lapseRateCPerKm: 5.8
        }
      ]
    });
    expect(saklikentWetSnowSim[0].airSnowCm).toBeGreaterThan(10);
    expect(saklikentWetSnowSim[0].groundSnowCm).toBeGreaterThan(5);

    // B) Kuzeyli (15° Poyraz / 345° Yıldız) Toros Aşan Akış: Kıyıda Kuru Fön (+4.5°C tavan) ve %15–25 Bağıl Nem Çöküşü!
    const northerlyPoyrazFoehn = evaluateTr07AntalyaColumnPhysics({
      subBasinId: "antalya_gulf_travertine",
      targetElevationM: 15,
      windFromDirDeg: 15,
      windSpeed850Ms: 18.0,
      froudeNumber: 1.35,
      rawPrecipMmHr: 0.4, // Toros sırtından sarkan zayıf serpinti virga ile tamamen kurur
      baseTemp2mC: 17.0,
      baseRh2mPct: 58,
      temp850C: 6.0,
      month: 11
    });

    expect(northerlyPoyrazFoehn.regime).toBe("NORTHERLY_POYRAZ_DRY_FOEHN");
    expect(northerlyPoyrazFoehn.foehnWarmingC).toBeGreaterThan(4.0);
    expect(northerlyPoyrazFoehn.foehnWarmingC).toBeLessThanOrEqual(4.5);
    expect(northerlyPoyrazFoehn.adjustedTemp2mC).toBeGreaterThan(21.0);
    expect(northerlyPoyrazFoehn.adjustedRh2mPct).toBeGreaterThanOrEqual(15);
    expect(northerlyPoyrazFoehn.adjustedRh2mPct).toBeLessThanOrEqual(25);
    expect(northerlyPoyrazFoehn.adjustedPrecipMmHr).toBe(0);
    expect(southerlyDeluge.adjustedPrecipMmHr).toBeGreaterThan(
      northerlyPoyrazFoehn.adjustedPrecipMmHr + 60
    );

    // C) Elmalı / Korkuteli (1095m) Toros Ardı Karasal Çanak: Kıyıdan yalıtılmış sert gece ayazı
    expect(
      PROVINCE_SPEC_TR_07.barrierCouplingMatrix.antalya_gulf_travertine.elmali_korkuteli_basin
    ).toBeLessThanOrEqual(0.12);
    const elmaliFrostNight = evaluateTr07AntalyaColumnPhysics({
      subBasinId: "elmali_korkuteli_basin",
      targetElevationM: 1095,
      windFromDirDeg: 20,
      windSpeed850Ms: 2.5,
      rawPrecipMmHr: 0,
      baseTemp2mC: -4.0,
      baseRh2mPct: 82,
      temp850C: -3.5,
      month: 1,
      clearCalmNight: true,
      snowDepthCm: 8
    });
    expect(elmaliFrostNight.regime).toBe("ELMALI_CONTINENTAL_BASIN");
    expect(elmaliFrostNight.adjustedTemp2mC).toBeLessThan(-9.0);
  });

  it("4. Orta Toros Kesiti: TR-33 Mersin (Rüzgarüstü Sağanak + Mut 290m Sıcak Çöküntü + Sertavul Venturi) vs. TR-70 Karaman (0.58x Yağış Gölgesi + Kuru Fön + Sertavul Tipi & Ayaz)", () => {
    // 1) Aynı Güneyli (185° Kıble) Doğu Akdeniz Cephesinde (14 mm/s sinoptik zorlama):
    // Mersin Toros rüzgarüstünde kuvvetli sağanak alırken, Toros'un hemen ardındaki Karaman (1033m) 0.58x yağış gölgesinde kalır!
    const synopticSouthPrecipMmHr = 14.0;

    const mersinWindward = evaluateTr33MersinColumnPhysics({
      subBasinId: "mersin_tarsus_coastal_plain",
      targetElevationM: 11,
      windFromDirDeg: 185,
      windSpeed850Ms: 16.5,
      baseWind10mKmh: 34,
      baseGust10mKmh: 52,
      rawPrecipMmHr: synopticSouthPrecipMmHr,
      baseTemp2mC: 15.2,
      temp850C: 4.5,
      month: 1
    });

    const karamanLeeShadow = evaluateTr70KaramanColumnPhysics({
      subBasinId: "karaman_closed_plain",
      targetElevationM: 1033,
      windFromDirDeg: 185,
      windSpeed850Ms: 16.5,
      baseWind10mKmh: 30,
      baseGust10mKmh: 48,
      froudeNumber: 1.2,
      rawPrecipMmHr: synopticSouthPrecipMmHr,
      baseTemp2mC: 6.5,
      baseRh2mPct: 62
    });

    expect(mersinWindward.regime).toBe("SOUTHERLY_TAURUS_UPSLOPE_RAIN");
    expect(mersinWindward.precipMultiplier).toBeGreaterThan(1.4);
    expect(mersinWindward.precipMultiplier).toBeLessThanOrEqual(
      TR_33_BESPOKE_LIMITS.upslopePrecipMultiplier
    );
    expect(mersinWindward.adjustedPrecipMmHr).toBeGreaterThan(20.0);

    expect(karamanLeeShadow.regime).toBe("SOUTHERLY_TAURUS_RAIN_SHADOW_FOEHN");
    expect(karamanLeeShadow.precipMultiplier).toBe(0.58);
    expect(karamanLeeShadow.adjustedPrecipMmHr).toBeCloseTo(14.0 * 0.58, 2);
    expect(karamanLeeShadow.foehnWarmingC).toBeGreaterThan(2.5);
    expect(karamanLeeShadow.adjustedTemp2mC).toBeGreaterThan(9.0);
    expect(karamanLeeShadow.adjustedRh2mPct).toBeLessThan(48);

    // Rüzgarüstü Mersin yağışı, rüzgaraltı Karaman yağışının 2.4 katından fazladır!
    expect(mersinWindward.adjustedPrecipMmHr / karamanLeeShadow.adjustedPrecipMmHr).toBeGreaterThan(
      2.4
    );

    // Zayıf güneyli cephede (0.5 mm/s) Karaman ovasında alt-bulut virga ile yağış 0 mm/s'ye düşer
    const karamanVirgaDry = evaluateTr70KaramanColumnPhysics({
      subBasinId: "karaman_closed_plain",
      targetElevationM: 1033,
      windFromDirDeg: 195,
      windSpeed850Ms: 13.0,
      baseWind10mKmh: 28,
      baseGust10mKmh: 44,
      froudeNumber: 1.15,
      rawPrecipMmHr: 0.5,
      baseTemp2mC: 9.0,
      baseRh2mPct: 50
    });
    expect(karamanVirgaDry.adjustedPrecipMmHr).toBe(0);

    // 2) Kuzeyli (340° Karayel/Yıldız) Kış Sisteminde:
    // Sertavul / Yellibel (1910m) geçidinde Venturi tipi fırtınası, Mersin kıyısında ise kuzeyli kuru fön!
    const karamanSertavulBlizzard = evaluateTr70KaramanColumnPhysics({
      subBasinId: "sertavul_yellibel_taurus_ridge",
      targetElevationM: 1910,
      windFromDirDeg: 340,
      windSpeed850Ms: 15.0,
      baseWind10mKmh: 36,
      baseGust10mKmh: 54,
      rawPrecipMmHr: 3.2,
      baseTemp2mC: -4.5,
      baseRh2mPct: 92,
      nearSertavulYellibelPass: true
    });

    const mersinNorthFoehn = evaluateTr33MersinColumnPhysics({
      subBasinId: "anamur_silifke_subtropical_coast",
      targetElevationM: 10,
      windFromDirDeg: 340,
      windSpeed850Ms: 15.0,
      baseWind10mKmh: 32,
      baseGust10mKmh: 50,
      froudeNumber: 1.25,
      rawPrecipMmHr: 3.2,
      baseTemp2mC: 13.5,
      temp850C: -2.0,
      month: 1,
      nearSertavulGoksuCorridor: true
    });

    expect(karamanSertavulBlizzard.regime).toBe("NORTHERLY_SERTAVUL_BLIZZARD");
    expect(karamanSertavulBlizzard.sertavulBlizzardActive).toBe(true);
    expect(karamanSertavulBlizzard.precipMultiplier).toBeGreaterThan(1.2);
    expect(karamanSertavulBlizzard.adjustedWind10mKmh).toBeCloseTo(36 * 1.44, 1);
    expect(karamanSertavulBlizzard.adjustedGust10mKmh).toBeCloseTo(54 * 1.6, 1);

    expect(mersinNorthFoehn.regime).toBe("NORTHERLY_COASTAL_FOEHN");
    expect(mersinNorthFoehn.foehnWarmingC).toBeGreaterThan(3.0);
    expect(mersinNorthFoehn.venturiActive).toBe(true);
    expect(mersinNorthFoehn.adjustedPrecipMmHr).toBeLessThan(
      karamanSertavulBlizzard.adjustedPrecipMmHr * 0.35
    );

    // 3) Mut (290m Göksu Çöküntüsü) yaz adyabatik ekstrem sıcağı & KB–GD Sertavul Venturi oluğu:
    const mutSummerHeat = evaluateTr33MersinColumnPhysics({
      subBasinId: "mut_goksu_depression",
      targetElevationM: 290,
      windFromDirDeg: 330,
      windSpeed850Ms: 12.5,
      baseWind10mKmh: 28,
      baseGust10mKmh: 42,
      rawPrecipMmHr: 0,
      baseTemp2mC: 39.5,
      temp850C: 25.0,
      month: 7
    });
    expect(mutSummerHeat.regime).toBe("MUT_GOKSU_SUBSIDENCE_HEAT");
    expect(mutSummerHeat.venturiActive).toBe(true);
    expect(mutSummerHeat.adjustedTemp2mC).toBeGreaterThan(43.0);
    expect(mutSummerHeat.adjustedGust10mKmh).toBeCloseTo(42 * 1.62, 1);

    // 4) Karaman Ovası (1033m) Kar Örtülü Açık Gece Ayazı vs. Anamur Subtropikal Don-Görmez Kıyı:
    const karamanSevereFrost = evaluateTr70KaramanColumnPhysics({
      subBasinId: "karaman_closed_plain",
      targetElevationM: 1033,
      windFromDirDeg: 45,
      windSpeed850Ms: 2.0,
      baseWind10mKmh: 5,
      baseGust10mKmh: 9,
      rawPrecipMmHr: 0,
      baseTemp2mC: -8.5,
      baseRh2mPct: 80,
      clearCalmNight: true,
      snowDepthCm: 12
    });
    const anamurFrostFree = evaluateTr33MersinColumnPhysics({
      subBasinId: "anamur_silifke_subtropical_coast",
      targetElevationM: 6,
      windFromDirDeg: 60,
      windSpeed850Ms: 3.0,
      baseWind10mKmh: 8,
      baseGust10mKmh: 14,
      rawPrecipMmHr: 0,
      baseTemp2mC: 0.4,
      temp850C: -3.0,
      month: 1
    });
    expect(karamanSevereFrost.regime).toBe("KARAMAN_BASIN_CONTINENTAL_FROST");
    expect(karamanSevereFrost.radiativeFrostCoolingC).toBeGreaterThan(7.0);
    expect(karamanSevereFrost.adjustedTemp2mC).toBeLessThan(-15.5);
    expect(anamurFrostFree.regime).toBe("SUBTROPICAL_COASTAL_FROST_FREE");
    expect(anamurFrostFree.adjustedTemp2mC).toBeGreaterThan(2.0);
  });

  it("5. Bursa TR-16 Dondurulmuş SHA-256 Koruması (%0 Sızıntı) Bozulmadan Kalır", () => {
    const check = verifyBursaImmutabilityManifest();
    expect(check.ok).toBe(true);
    expect(check.violations).toEqual([]);
  });
});
