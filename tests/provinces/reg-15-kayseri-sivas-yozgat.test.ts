import { describe, expect, it } from "vitest";
import { isIcaoAllowedForProvince } from "../../lib/metar-verify";
import { getTrCatalogByProvince } from "../../lib/provinces/catalog-1102";
import { computeTrDailyClimatologyNormal } from "../../lib/provinces/climatology-1991-2020";
import EMOS_CALIBRATION_TR_38 from "../../lib/provinces/emos-weights/tr-38";
import EMOS_CALIBRATION_TR_58 from "../../lib/provinces/emos-weights/tr-58";
import EMOS_CALIBRATION_TR_66 from "../../lib/provinces/emos-weights/tr-66";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import { resolveProvinceElevationBandSpecs } from "../../lib/provinces/hypsometric-bands-tr81";
import {
  MGM_DEM_ELEVATION_REPAIR_BY_ISTNO,
  STATIC_MGM_ISTNO_OWNER_PROVINCE
} from "../../lib/provinces/mgm-dem-repair";
import PROVINCE_SPEC_TR_38, {
  PROVINCE_SPEC_TR_38 as NAMED_TR_38,
  TR_38_KARASAZLIGI_ERCIYES_CONTRACT
} from "../../lib/provinces/specs/tr-38";
import PROVINCE_SPEC_TR_58, {
  PROVINCE_SPEC_TR_58 as NAMED_TR_58,
  TR_58_CONTINENTAL_FROST_AND_KELKIT_CONTRACT
} from "../../lib/provinces/specs/tr-58";
import PROVINCE_SPEC_TR_66, {
  PROVINCE_SPEC_TR_66 as NAMED_TR_66,
  TR_66_BOZOK_RIDGE_CONTRACT
} from "../../lib/provinces/specs/tr-66";
import type {
  DirectionalBarrierRule,
  ProvinceSpec,
  VenturiCorridorRule
} from "../../lib/provinces/types";

function isAngleInSector(
  deg: number,
  sector: { fromDeg: number; toDeg: number }
): boolean {
  const d = ((deg % 360) + 360) % 360;
  const from = ((sector.fromDeg % 360) + 360) % 360;
  const to = ((sector.toDeg % 360) + 360) % 360;
  if (from <= to) {
    return d >= from && d <= to;
  }
  return d >= from || d <= to;
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function angularDiffDeg(a: number, b: number): number {
  return Math.abs((((a - b) % 360) + 540) % 360 - 180);
}

function evaluateVenturiAtPoint(
  corridor: VenturiCorridorRule,
  lat: number,
  lon: number,
  windFromDeg: number
): { active: boolean; speedMultiplier: number; gustMultiplier: number } {
  const distKm = haversineKm(
    lat,
    lon,
    corridor.centerCoord.lat,
    corridor.centerCoord.lon
  );
  if (distKm > corridor.influenceRadiusKm) {
    return { active: false, speedMultiplier: 1.0, gustMultiplier: 1.0 };
  }
  const forwardDiff = angularDiffDeg(windFromDeg, corridor.channelAxisFromDeg);
  const reverseDiff = angularDiffDeg(
    windFromDeg,
    (corridor.channelAxisFromDeg + 180) % 360
  );
  const aligned = corridor.bidirectional
    ? Math.min(forwardDiff, reverseDiff) <= corridor.sectorHalfWidthDeg
    : forwardDiff <= corridor.sectorHalfWidthDeg;

  if (!aligned) {
    return { active: false, speedMultiplier: 1.0, gustMultiplier: 1.0 };
  }
  return {
    active: true,
    speedMultiplier: corridor.speedMultiplier,
    gustMultiplier: corridor.gustMultiplier
  };
}

function evaluateBarrierRegimeForSubBasin(
  barriers: readonly DirectionalBarrierRule[],
  subBasinId: string,
  windFromDeg: number,
  crossSpeedMs: number,
  froudeNumber: number,
  targetElevM: number
): {
  foehnWarmingC: number;
  precipMultiplier: number;
} {
  let foehnWarmingC = 0;
  let precipMultiplier = 1.0;

  for (const b of barriers) {
    if (!b.applicableSubBasins.includes(subBasinId)) continue;

    if (
      b.foehnSpec.enabled &&
      isAngleInSector(windFromDeg, b.foehnSpec.windFromSectorDeg) &&
      crossSpeedMs >= b.foehnSpec.minCrossCrestSpeedMs &&
      froudeNumber >= b.foehnSpec.minFroudeNumber &&
      targetElevM <= b.foehnSpec.maxTargetElevationM
    ) {
      const descentKm = Math.max(
        0,
        (b.foehnSpec.sourcePlateauElevationM - targetElevM) / 1000
      );
      const rawWarm = Math.min(
        b.foehnSpec.maxWarmingCapC,
        Math.max(1.4, descentKm * 3.8 + 1.2)
      );
      foehnWarmingC = Math.max(foehnWarmingC, Number(rawWarm.toFixed(2)));
    }

    if (
      b.upslopeSpec.enabled &&
      isAngleInSector(windFromDeg, b.upslopeSpec.windFromSectorDeg) &&
      crossSpeedMs >= b.upslopeSpec.minOnshoreOrUpslopeSpeedMs
    ) {
      precipMultiplier = Math.max(
        precipMultiplier,
        b.upslopeSpec.maxPrecipMultiplierCap
      );
    }

    if (
      b.rainShadowSpec &&
      isAngleInSector(windFromDeg, b.rainShadowSpec.shadowedWindFromSectorDeg)
    ) {
      precipMultiplier = Math.min(
        precipMultiplier,
        b.rainShadowSpec.precipAttenuationFactor
      );
    }
  }

  return { foehnWarmingC, precipMultiplier };
}

/**
 * Simulates clear-sky snow-covered winter morning surface temperature across an inversion profile:
 * - Below `basinFloorElevationM + coldPoolMaxDepthM`, radiative + snow-albedo cooling deepens toward the basin floor.
 * - Above the inversion lid, free-troposphere thermal belt / standard cold-season lapse applies.
 */
function simulateWinterInversionColumnTempC(
  spec: ProvinceSpec,
  t850C: number,
  elevationM: number,
  coldPoolSusceptibility: number
): number {
  const inv = spec.inversionAndWedgeSpec;
  const lidElevationM = inv.basinFloorElevationM + inv.coldPoolMaxDepthM;
  const freeAtmAt1500mC = t850C;
  const freeAtmTempC = freeAtmAt1500mC - ((elevationM - 1500) / 1000) * 5.2;

  if (elevationM >= lidElevationM) {
    return Number(freeAtmTempC.toFixed(2));
  }

  const depthFraction = Math.max(
    0,
    Math.min(1, (lidElevationM - elevationM) / inv.coldPoolMaxDepthM)
  );
  const coldPoolDropC =
    (inv.snowAlbedoFeedback.maxExtraRadiativeCoolingC +
      6.0 * inv.topographicEnclosureIndex) *
    depthFraction *
    coldPoolSusceptibility;

  return Number((freeAtmTempC - coldPoolDropC).toFixed(2));
}

describe("Wave 3B — REG-15 (Doğu İç Anadolu Yüksek Ayaz Havzaları: TR-38 Kayseri, TR-58 Sivas, TR-66 Yozgat)", () => {
  const ALL_SPECS: readonly ProvinceSpec[] = [
    PROVINCE_SPEC_TR_38,
    PROVINCE_SPEC_TR_58,
    PROVINCE_SPEC_TR_66
  ];

  it("1. Üç ilin tamamı şema bütünlüğünü, donmuş (frozen) tekilliği, EMOS Tier-A WMO uyumunu, poligon aidiyetini ve MGM istasyon sahipliğini eksiksiz sağlar", () => {
    expect(PROVINCE_SPEC_TR_38).toBe(NAMED_TR_38);
    expect(PROVINCE_SPEC_TR_58).toBe(NAMED_TR_58);
    expect(PROVINCE_SPEC_TR_66).toBe(NAMED_TR_66);

    expect(EMOS_CALIBRATION_TR_38.wmoStationId).toBe(
      PROVINCE_SPEC_TR_38.primaryCenter.wmoId
    );
    expect(EMOS_CALIBRATION_TR_58.wmoStationId).toBe(
      PROVINCE_SPEC_TR_58.primaryCenter.wmoId
    );
    expect(EMOS_CALIBRATION_TR_66.wmoStationId).toBe(
      PROVINCE_SPEC_TR_66.primaryCenter.wmoId
    );

    for (const spec of ALL_SPECS) {
      expect(Object.isFrozen(spec)).toBe(true);
      expect(spec.region).toBe("CENTRAL_ANATOLIA");
      expect(spec.climateRegion).toBe("IC_ANADOLU");
      expect(spec.calibrationTier).toBe("TIER_A_WMO");
      expect(spec.waterBodies).toEqual([]);
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.curatedSubLocations.length).toBeGreaterThanOrEqual(4);
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toHaveLength(12);
      expect(spec.primaryCenter.monthlyTminNormalsC).toHaveLength(12);

      // 4-düğümlü dikey profil ve 4 hipsometrik kar bandı kesin artan olmalıdır
      const knots = spec.verticalProfileSpec.piecewiseKnotsM;
      expect(knots[0]).toBeLessThan(knots[1]);
      expect(knots[1]).toBeLessThan(knots[2]);
      expect(knots[2]).toBeLessThan(knots[3]);
      expect(knots[3]).toBeLessThanOrEqual(
        spec.verticalProfileSpec.maxPhysicalPeakM
      );

      const bands = spec.verticalProfileSpec.snowElevationBands;
      expect(bands[0].elevationM).toBeLessThan(bands[1].elevationM);
      expect(bands[1].elevationM).toBeLessThan(bands[2].elevationM);
      expect(bands[2].elevationM).toBeLessThan(bands[3].elevationM);

      // Alt havza kuplaj matrisi [0, 1] aralığında ve köşegende 1.0 olmalıdır
      const subIds = spec.subBasins.map((sb) => sb.id);
      for (const a of subIds) {
        expect(spec.barrierCouplingMatrix[a]?.[a]).toBe(1.0);
        for (const b of subIds) {
          const w = spec.barrierCouplingMatrix[a]?.[b];
          expect(w).toBeDefined();
          expect(w!).toBeGreaterThanOrEqual(0);
          expect(w!).toBeLessThanOrEqual(1);
        }
      }

      // Birincil merkez, küratörlü alt konumlar ve tüm 9-nokta şablonları ilgili il sınırları içinde kalmalıdır
      const centerRes = resolveProvinceCode({
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon,
        countryCode: "TR"
      });
      expect(centerRes.provinceCode).toBe(spec.provinceCode);

      for (const subLoc of spec.curatedSubLocations) {
        const subRes = resolveProvinceCode({
          lat: subLoc.lat,
          lon: subLoc.lon,
          admin1: spec.nameTr,
          countryCode: "TR"
        });
        expect(subRes.provinceCode).toBe(spec.provinceCode);
      }

      for (const pt of spec.stencil9Points) {
        expect(pt.lat).toBeGreaterThanOrEqual(spec.domainBounds.minLat);
        expect(pt.lat).toBeLessThanOrEqual(spec.domainBounds.maxLat);
        expect(pt.lon).toBeGreaterThanOrEqual(spec.domainBounds.minLon);
        expect(pt.lon).toBeLessThanOrEqual(spec.domainBounds.maxLon);
      }

      // Tüm sayısal stationOverrides istasyonları MGM sahiplik tablosunda aynı ile ait olmalıdır
      for (const override of Object.values(spec.stationOverrides)) {
        const istNo = Number(override.stationId);
        if (Number.isFinite(istNo) && STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo]) {
          expect(STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo]).toBe(spec.provinceCode);
        }
      }
    }
  });

  it("2. TR-38 Kayseri: Karasazlığı (1053–1094m) radyasyonel soğuk gölü & donan sis kilidi (-34°C), Erciyes (3917m / Tekir Kapı 2215m / Hacılar 1450m) terselme kesiti ve Uzunyayla (1550m) Sibirya koridoru", () => {
    expect(PROVINCE_SPEC_TR_38.primaryCenter.wmoId).toBe("17195");
    expect(PROVINCE_SPEC_TR_38.qcAndMosBounds.minPlausibleTempC).toBe(-34);
    expect(PROVINCE_SPEC_TR_38.verticalProfileSpec.piecewiseKnotsM).toEqual([
      1053, 1450, 2215, 3917
    ]);
    expect(PROVINCE_SPEC_TR_38.verticalProfileSpec.maxPhysicalPeakM).toBe(3917);

    // METAR güvenlik duvarı: Yalnızca LTAU serbest; Nevşehir LTAZ ve Sivas LTAR kesin yasak!
    expect(PROVINCE_SPEC_TR_38.icaoWhitelist).toEqual(["LTAU"]);
    expect(isIcaoAllowedForProvince("LTAU", "TR-38")).toBe(true);
    expect(isIcaoAllowedForProvince("LTAZ", "TR-38")).toBe(false);
    expect(isIcaoAllowedForProvince("LTAR", "TR-38")).toBe(false);
    expect(isIcaoAllowedForProvince("LTAF", "TR-38")).toBe(false);

    // Erciyes Kayak Merkezi (18149) DEM onarım tablosuyla (2210m) tam uyumludur ve merkez manşetinden dışlanır
    expect(PROVINCE_SPEC_TR_38.stationOverrides["18149"]?.demElevationM).toBe(
      MGM_DEM_ELEVATION_REPAIR_BY_ISTNO[18149]
    );
    expect(
      PROVINCE_SPEC_TR_38.stationOverrides["18149"]?.excludeFromCenterHeadline
    ).toBe(true);
    expect(
      PROVINCE_SPEC_TR_38.stationOverrides["19185"]?.excludeFromCenterHeadline
    ).toBe(true);

    // Donan sis / alçak stratus kilidi ve güçlü radyasyonel soğuk havuz
    const inv = PROVINCE_SPEC_TR_38.inversionAndWedgeSpec;
    expect(inv.persistentStratusLock.enabled).toBe(true);
    expect(inv.persistentStratusLock.daytimeSolarDampingFactor).toBeLessThanOrEqual(
      0.6
    );
    expect(inv.topographicEnclosureIndex).toBeGreaterThanOrEqual(0.88);
    expect(TR_38_KARASAZLIGI_ERCIYES_CONTRACT.freezingFogStratusLockEnabled).toBe(
      true
    );

    // Termal terselme doğrulaması (T850 = -2°C açık kar örtülü Sibirya yüksek basıncı sabahı):
    // Karasazlığı (1053m, soğuk göl tabanı) << Hacılar/Hisarcık (1450m termal kuşak) ve Tekir Kapı (2215m) çanaktan daha ılık kalabilir!
    const tKarasazligiC = simulateWinterInversionColumnTempC(
      PROVINCE_SPEC_TR_38,
      -2.0,
      1053,
      PROVINCE_SPEC_TR_38.stationOverrides["17195"].coldPoolSusceptibility
    );
    const tHacilarSlopeC = simulateWinterInversionColumnTempC(
      PROVINCE_SPEC_TR_38,
      -2.0,
      1450,
      PROVINCE_SPEC_TR_38.stationOverrides["19185"].coldPoolSusceptibility
    );
    const tTekirKapiC = simulateWinterInversionColumnTempC(
      PROVINCE_SPEC_TR_38,
      -2.0,
      2215,
      PROVINCE_SPEC_TR_38.stationOverrides["18149"].coldPoolSusceptibility
    );

    expect(tHacilarSlopeC - tKarasazligiC).toBeGreaterThan(8.0);
    expect(tTekirKapiC).toBeGreaterThan(tKarasazligiC);

    // Pınarbaşı – Sarız Uzunyayla (~1550m) KD-DKD (68°) Sibirya soğuk koridoru rüzgar ivmelenmesi
    const uzunyaylaCorridor = PROVINCE_SPEC_TR_38.venturiCorridors.find(
      (c) => c.id === "uzunyayla_pinarbasi_siberian_chute"
    )!;
    expect(uzunyaylaCorridor).toBeDefined();
    const pinarbasiSiberiaFlow = evaluateVenturiAtPoint(
      uzunyaylaCorridor,
      38.7251,
      36.3904,
      65
    );
    expect(pinarbasiSiberiaFlow.active).toBe(true);
    expect(pinarbasiSiberiaFlow.speedMultiplier).toBeCloseTo(1.34, 2);
    expect(pinarbasiSiberiaFlow.gustMultiplier).toBeCloseTo(1.48, 2);

    // Kuzeyli (355°) kar sisteminde Erciyes yamacı yağış çarpanı (1.48x) vs Güneyli (195°) Lodos fön ısınması
    const erciyesNorthSnow = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_38.directionalBarriers,
      "erciyes_hacilar_tekir_volcanic_cone",
      355,
      8.5,
      0.9,
      2210
    );
    const kayseriSouthLodosFoehn = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_38.directionalBarriers,
      "karasazligi_kayseri_cold_basin",
      195,
      10.0,
      0.95,
      1094
    );
    expect(erciyesNorthSnow.precipMultiplier).toBeCloseTo(1.48, 2);
    expect(kayseriSouthLodosFoehn.foehnWarmingC).toBeGreaterThan(4.0);
  });

  it("3. TR-58 Sivas: Nuri Demirağ LTAR (1596m) 311m sırt farkı & manşet dışlaması, İmranlı–Kangal–Altınyayla (-38°C) ayaz bozkırı, Yıldız Dağı (2552m) ve Kelkit (860–950m) ılıman vadi yalıtımı", () => {
    expect(PROVINCE_SPEC_TR_58.primaryCenter.wmoId).toBe("17090");
    expect(PROVINCE_SPEC_TR_58.primaryCenter.demVerifiedElevationM).toBe(1285);
    expect(PROVINCE_SPEC_TR_58.qcAndMosBounds.minPlausibleTempC).toBe(-38);
    expect(
      TR_58_CONTINENTAL_FROST_AND_KELKIT_CONTRACT.kangalImranliExtremeFrostFloorC
    ).toBe(-38);

    // METAR güvenlik duvarı: Yalnızca LTAR serbest; komşu Tokat LTAW, Malatya LTAT, Erzincan LTCD yasak!
    expect(PROVINCE_SPEC_TR_58.icaoWhitelist).toEqual(["LTAR"]);
    expect(isIcaoAllowedForProvince("LTAR", "TR-58")).toBe(true);
    expect(isIcaoAllowedForProvince("LTAW", "TR-58")).toBe(false);
    expect(isIcaoAllowedForProvince("LTAT", "TR-58")).toBe(false);
    expect(isIcaoAllowedForProvince("LTCD", "TR-58")).toBe(false);

    // KRİTİK KURAL: Nuri Demirağ LTAR / 17091 (1596m) Sivas Merkez'den (1285m) 311m yüksektir ve kesinlikle excludeFromCenterHeadline: true olmalıdır!
    const ltarByIcao = PROVINCE_SPEC_TR_58.stationOverrides.LTAR;
    const ltarByMgm = PROVINCE_SPEC_TR_58.stationOverrides["17091"];
    expect(ltarByIcao).toBeDefined();
    expect(ltarByMgm).toBeDefined();
    expect(ltarByIcao.demElevationM).toBe(1596);
    expect(ltarByMgm.demElevationM).toBe(1596);
    expect(
      ltarByIcao.demElevationM -
        PROVINCE_SPEC_TR_58.primaryCenter.demVerifiedElevationM
    ).toBe(311);
    expect(ltarByIcao.excludeFromCenterHeadline).toBe(true);
    expect(ltarByMgm.excludeFromCenterHeadline).toBe(true);

    // Yıldız Dağı (18672 -> 1752m AWS, 2552m zirve) ve 18674 (1968m) DEM onarım uyumu
    expect(PROVINCE_SPEC_TR_58.stationOverrides["18672"]?.demElevationM).toBe(
      MGM_DEM_ELEVATION_REPAIR_BY_ISTNO[18672]
    );
    expect(PROVINCE_SPEC_TR_58.stationOverrides["18674"]?.demElevationM).toBe(
      MGM_DEM_ELEVATION_REPAIR_BY_ISTNO[18674]
    );
    expect(
      PROVINCE_SPEC_TR_58.curatedSubLocations.find(
        (s) => s.id === "sivas-yildiz-dagi-kayak-tr"
      )?.elevationM
    ).toBe(2552);

    // İmranlı (18470), Kangal (17762), Altınyayla (18466) ayaz bozkırı yüksek soğuk-havuz duyarlılığına (>= 0.92) sahiptir
    for (const frostId of ["18470", "17762", "18466"]) {
      const st = PROVINCE_SPEC_TR_58.stationOverrides[frostId];
      expect(st).toBeDefined();
      expect(st.subBasinId).toBe("imranli_kangal_altinyayla_frost_steppe");
      expect(st.coldPoolSusceptibility).toBeGreaterThanOrEqual(0.92);
      expect(st.excludeFromCenterHeadline).toBe(true);
    }

    // Suşehri – Koyulhisar – Akıncılar Kelkit alçak vadi oluğu (~860–950m) Köse Dağları ardında yalıtılmıştır ve kışın Kangal/Sivas'tan çok daha ılımandır!
    expect(
      PROVINCE_SPEC_TR_58.barrierCouplingMatrix.yukari_kizilirmak_sivas_basin
        .kelkit_susehri_koyulhisar_trough
    ).toBeLessThanOrEqual(0.08);
    expect(
      PROVINCE_SPEC_TR_58.barrierCouplingMatrix
        .imranli_kangal_altinyayla_frost_steppe.kelkit_susehri_koyulhisar_trough
    ).toBeLessThanOrEqual(0.08);

    const koyulhisarJan = computeTrDailyClimatologyNormal({
      provinceCode: "TR-58",
      lat: 40.3008,
      lon: 37.8239,
      elevationM: 860,
      dayOfYear: 15
    });
    const sivasMerkezJan = computeTrDailyClimatologyNormal({
      provinceCode: "TR-58",
      lat: 39.7437,
      lon: 37.002,
      elevationM: 1285,
      dayOfYear: 15
    });
    const kangalJanBase = computeTrDailyClimatologyNormal({
      provinceCode: "TR-58",
      lat: 39.2428,
      lon: 37.389,
      elevationM: 1521,
      dayOfYear: 15
    });
    const kangalSnowNightMinC =
      kangalJanBase.tminNormalC -
      PROVINCE_SPEC_TR_58.inversionAndWedgeSpec.snowAlbedoFeedback
        .maxExtraRadiativeCoolingC *
        PROVINCE_SPEC_TR_58.stationOverrides["17762"].coldPoolSusceptibility;

    expect(koyulhisarJan.tmaxNormalC).toBeGreaterThan(
      sivasMerkezJan.tmaxNormalC + 1.8
    );
    expect(koyulhisarJan.tminNormalC - kangalSnowNightMinC).toBeGreaterThan(
      11.0
    );
  });

  it("4. TR-66 Yozgat: Bozok Platosu Çamlık sırt kenti (1301m) rüzgar/erken kar karakteri, Akdağmadeni (1350–1900m) orman/kar kuşağı vs Yerköy (~750–806m) Delice vadisi ve sıfır-ICAO yalıtımı", () => {
    expect(PROVINCE_SPEC_TR_66.primaryCenter.wmoId).toBe("17140");
    expect(PROVINCE_SPEC_TR_66.primaryCenter.demVerifiedElevationM).toBe(1301);
    expect(TR_66_BOZOK_RIDGE_CONTRACT.isExposedRidgeCity).toBe(true);

    // METAR güvenlik duvarı: Yozgat'ta havalimanı yoktur (icaoWhitelist: []), komşu LTAU/LTAR/LTAC/LTAZ/LTAP sızamaz!
    expect(PROVINCE_SPEC_TR_66.icaoWhitelist).toEqual([]);
    for (const blockedIcao of ["LTAU", "LTAR", "LTAC", "LTAZ", "LTAP"]) {
      expect(isIcaoAllowedForProvince(blockedIcao, "TR-66")).toBe(false);
    }

    // Bozok/Çamlık sırt kenti (1301m) vs Kayseri/Sivas çanakları:
    // Yozgat merkezde topografik kapanma düşüktür (< 0.40), inatçı çanak stratus kilidi kapalıdır ve Çamlık sırt rüzgarı gece terselmesini bastırır!
    expect(
      PROVINCE_SPEC_TR_66.inversionAndWedgeSpec.topographicEnclosureIndex
    ).toBeLessThan(0.4);
    expect(
      PROVINCE_SPEC_TR_66.inversionAndWedgeSpec.topographicEnclosureIndex
    ).toBeLessThan(
      PROVINCE_SPEC_TR_38.inversionAndWedgeSpec.topographicEnclosureIndex - 0.45
    );
    expect(
      PROVINCE_SPEC_TR_66.inversionAndWedgeSpec.persistentStratusLock.enabled
    ).toBe(false);
    expect(
      PROVINCE_SPEC_TR_66.stationOverrides["17140"]?.coldPoolSusceptibility
    ).toBeLessThanOrEqual(0.32);

    const camlikCrestCorridor = PROVINCE_SPEC_TR_66.venturiCorridors.find(
      (c) => c.id === "bozok_camlik_crest_wind_exposure"
    )!;
    expect(camlikCrestCorridor).toBeDefined();
    expect(camlikCrestCorridor.suppressesNocturnalInversion).toBe(true);
    const northRidgeWind = evaluateVenturiAtPoint(
      camlikCrestCorridor,
      39.8243,
      34.8159,
      350
    );
    expect(northRidgeWind.active).toBe(true);
    expect(northRidgeWind.speedMultiplier).toBeGreaterThanOrEqual(1.25);

    // Kuzeybatı/Kuzeyli (340°) soğuk cephe akışında Çamlık & Akdağmadeni (1508m) orografik kar artışı (1.45x) alır
    const akdagmadeniSnow = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_66.directionalBarriers,
      "akdagmadeni_cayiralan_forest_snow_belt",
      340,
      7.5,
      0.85,
      1508
    );
    expect(akdagmadeniSnow.precipMultiplier).toBeCloseTo(1.45, 2);

    // Yerköy (~750–806m Delice çukur vadisi) vs Yozgat Merkez (1301m) vs Akdağmadeni (1508m) termal ve kar-sınırı farkı:
    // Yerköy Delice vadisi gündüz Yozgat sırtından >= 2.5°C, Akdağmadeni orman kuşağından >= 3.8°C daha ılımandır!
    const yerkoyNov = computeTrDailyClimatologyNormal({
      provinceCode: "TR-66",
      lat: 39.6575,
      lon: 34.4078,
      elevationM: 750,
      dayOfYear: 325
    });
    const yozgatCrestNov = computeTrDailyClimatologyNormal({
      provinceCode: "TR-66",
      lat: 39.8243,
      lon: 34.8159,
      elevationM: 1301,
      dayOfYear: 325
    });
    const akdagmadeniNov = computeTrDailyClimatologyNormal({
      provinceCode: "TR-66",
      lat: 39.6665,
      lon: 35.9163,
      elevationM: 1508,
      dayOfYear: 325
    });

    expect(yerkoyNov.tmaxNormalC - yozgatCrestNov.tmaxNormalC).toBeGreaterThan(
      2.5
    );
    expect(yerkoyNov.tmaxNormalC - akdagmadeniNov.tmaxNormalC).toBeGreaterThan(
      3.8
    );

    // Hipsometrik 4-bant çözümleyici ve 1102-konum kataloğu entegrasyonu
    const erciyesBands = resolveProvinceElevationBandSpecs({
      provinceCode: "TR-38",
      referenceElevationM: 2215,
      locationName: "Erciyes Tekir Kapı"
    });
    const yildizBands = resolveProvinceElevationBandSpecs({
      provinceCode: "TR-58",
      referenceElevationM: 1752,
      locationName: "Yıldız Dağı Kayak Merkezi"
    });
    const akdagBands = resolveProvinceElevationBandSpecs({
      provinceCode: "TR-66",
      referenceElevationM: 1508,
      locationName: "Akdağmadeni"
    });

    expect(erciyesBands).toHaveLength(4);
    expect(yildizBands).toHaveLength(4);
    expect(akdagBands).toHaveLength(4);

    expect(getTrCatalogByProvince("TR-38").length).toBeGreaterThanOrEqual(17);
    expect(getTrCatalogByProvince("TR-58").length).toBeGreaterThanOrEqual(18);
    expect(getTrCatalogByProvince("TR-66").length).toBeGreaterThanOrEqual(14);
  });
});
