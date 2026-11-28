import { describe, expect, it } from "vitest";
import { isIcaoAllowedForProvince } from "../../lib/metar-verify";
import { getTrCatalogByProvince } from "../../lib/provinces/catalog-1102";
import { computeTrDailyClimatologyNormal } from "../../lib/provinces/climatology-1991-2020";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import { resolveProvinceElevationBandSpecs } from "../../lib/provinces/hypsometric-bands-tr81";
import {
  MGM_DEM_ELEVATION_REPAIR_BY_ISTNO,
  MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID,
  STATIC_MGM_ISTNO_OWNER_PROVINCE
} from "../../lib/provinces/mgm-dem-repair";
import PROVINCE_SPEC_TR_01, {
  PROVINCE_SPEC_TR_01 as NAMED_TR_01,
  TR_01_CUKUROVA_THERMAL_REGIME
} from "../../lib/provinces/specs/tr-01";
import PROVINCE_SPEC_TR_31, {
  PROVINCE_SPEC_TR_31 as NAMED_TR_31,
  TR_31_AMANOS_BIFACIAL_CONTRACT
} from "../../lib/provinces/specs/tr-31";
import PROVINCE_SPEC_TR_46, {
  PROVINCE_SPEC_TR_46 as NAMED_TR_46,
  TR_46_DUAL_CLIMATE_BASIN_CONTRACT
} from "../../lib/provinces/specs/tr-46";
import PROVINCE_SPEC_TR_80, {
  PROVINCE_SPEC_TR_80 as NAMED_TR_80,
  TR_80_CONVECTIVE_FUNNEL_CONTRACT
} from "../../lib/provinces/specs/tr-80";
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
  const diff = Math.abs((((a - b) % 360) + 540) % 360 - 180);
  return diff;
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

describe("Wave 3A — REG-07 (Çukurova, İskenderun Körfezi & Amanos Oluk/Bariyer Kuşağı: TR-01, TR-31, TR-46, TR-80)", () => {
  const ALL_SPECS: readonly ProvinceSpec[] = [
    PROVINCE_SPEC_TR_01,
    PROVINCE_SPEC_TR_31,
    PROVINCE_SPEC_TR_46,
    PROVINCE_SPEC_TR_80
  ];

  it("1. Dört ilin tamamı şema bütünlüğünü, donmuş (frozen) tekilliği, poligon aidiyetini ve istasyon sahipliğini eksiksiz sağlar", () => {
    expect(PROVINCE_SPEC_TR_01).toBe(NAMED_TR_01);
    expect(PROVINCE_SPEC_TR_31).toBe(NAMED_TR_31);
    expect(PROVINCE_SPEC_TR_46).toBe(NAMED_TR_46);
    expect(PROVINCE_SPEC_TR_80).toBe(NAMED_TR_80);

    for (const spec of ALL_SPECS) {
      expect(Object.isFrozen(spec)).toBe(true);
      expect(spec.region).toBe("MEDITERRANEAN");
      expect(spec.climateRegion).toBe("AKDENIZ");
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.curatedSubLocations.length).toBeGreaterThanOrEqual(4);
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toHaveLength(12);
      expect(spec.primaryCenter.monthlyTminNormalsC).toHaveLength(12);

      // 4-düğümlü dikey profil ve 4 kar bandı kesin artan olmalıdır
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

      // Birincil merkez ve tüm küratörlü alt konumlar ilgili il poligonuna düşmelidir
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

      // Tüm stationOverrides istasyonları MGM sahiplik tablosunda aynı ile ait olmalıdır
      for (const override of Object.values(spec.stationOverrides)) {
        const istNo = Number(override.stationId);
        if (Number.isFinite(istNo) && STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo]) {
          expect(STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo]).toBe(spec.provinceCode);
        }
      }
    }
  });

  it("2. TR-01 Adana: 23m Çukurova -> 3756m Aladağlar kesiti, Gülek Boğazı (1050m) Poyraz fön/Venturi oluğu, yaz 29°C+ SST bunaltıcı nem ve LTDB (Tarsus) METAR izolasyonu", () => {
    expect(PROVINCE_SPEC_TR_01.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_01.primaryCenter.wmoId).toBe("17352");
    expect(PROVINCE_SPEC_TR_01.primaryCenter.mgmSaatlikIstNo).toBe(17352);
    expect(PROVINCE_SPEC_TR_01.primaryCenter.demVerifiedElevationM).toBe(23);
    expect(PROVINCE_SPEC_TR_01.verticalProfileSpec.maxPhysicalPeakM).toBe(3756);

    // METAR izolasyonu: LTAF & LTAG serbest, Mersin/Tarsus LTDB kesin yasak!
    expect(PROVINCE_SPEC_TR_01.icaoWhitelist).toEqual(["LTAF", "LTAG"]);
    expect(isIcaoAllowedForProvince("LTAF", "TR-01")).toBe(true);
    expect(isIcaoAllowedForProvince("LTAG", "TR-01")).toBe(true);
    expect(isIcaoAllowedForProvince("LTDB", "TR-01")).toBe(false);
    expect(isIcaoAllowedForProvince("LTDA", "TR-01")).toBe(false);

    // Gülek Boğazı (1050m) kuzey-kuzeydoğu (22°) Venturi / katabatik Poyraz oluğu
    const gulekCorridor = PROVINCE_SPEC_TR_01.venturiCorridors.find(
      (c) => c.id === "gulek_bogazi_poyraz_chute"
    )!;
    expect(gulekCorridor).toBeDefined();
    expect(gulekCorridor.suppressesNocturnalInversion).toBe(true);

    const poyrazInGulek = evaluateVenturiAtPoint(
      gulekCorridor,
      37.315,
      34.885,
      25
    );
    expect(poyrazInGulek.active).toBe(true);
    expect(poyrazInGulek.speedMultiplier).toBeCloseTo(1.38, 2);
    expect(poyrazInGulek.gustMultiplier).toBeCloseTo(1.52, 2);

    // Kışın İç Anadolu yüksek basıncından (1120m) Çukurova'ya (23m) inen KKD (20°) kuru Poyraz fönü
    const poyrazFoehn = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_01.directionalBarriers,
      "cukurova_delta_plain",
      20,
      9.5,
      1.05,
      23
    );
    expect(poyrazFoehn.foehnWarmingC).toBeGreaterThan(4.5);
    expect(poyrazFoehn.precipMultiplier).toBeLessThan(0.5);

    // Güneyli (195°) Akdeniz nemli akışında fön sıfırlanır, yamaç yağışı (1.52x) devreye girer
    const medUpslope = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_01.directionalBarriers,
      "cukurova_delta_plain",
      195,
      8.0,
      0.9,
      23
    );
    expect(medUpslope.foehnWarmingC).toBe(0);
    expect(medUpslope.precipMultiplier).toBeCloseTo(1.52, 2);

    // Doğu Akdeniz su kütlesi (MGM 17480) yazın >= 29°C SST ve Td > 24°C bunaltıcı nem rejimini taşır
    expect(PROVINCE_SPEC_TR_01.waterBodies).toHaveLength(1);
    const medSea = PROVINCE_SPEC_TR_01.waterBodies[0];
    expect(medSea.mgmMarineStationIds).toContain(17480);
    expect(Math.max(...medSea.monthlyWaterTempNormalsC)).toBeGreaterThanOrEqual(
      29.0
    );
    expect(TR_01_CUKUROVA_THERMAL_REGIME.sultryDewPointThresholdC).toBe(24.0);

    // Tufanbeyli (1415m) Adana merkez başlığına sızamaz
    expect(
      PROVINCE_SPEC_TR_01.stationOverrides["18053"]?.excludeFromCenterHeadline
    ).toBe(true);
    expect(
      PROVINCE_SPEC_TR_01.barrierCouplingMatrix.cukurova_delta_plain
        .aladaglar_tufanbeyli_highlands
    ).toBeLessThan(0.1);
  });

  it("3. TR-31 Hatay: Amanos (2240m) iki-yüzlü bariyeri, Belen/Yarıkkaya katabatik şutu (1.42x / 1.55x), Asi/Amik grabeni ve Suriye OSLK METAR yasağı", () => {
    expect(PROVINCE_SPEC_TR_31.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_31.primaryCenter.wmoId).toBe("17372");
    expect(PROVINCE_SPEC_TR_31.verticalProfileSpec.maxPhysicalPeakM).toBe(2240);

    // Suriye OSLK (Lazkiye) ve OSAP (Halep) kesinlikle yasak; yalnızca LTDA serbest!
    expect(PROVINCE_SPEC_TR_31.icaoWhitelist).toEqual(["LTDA"]);
    expect(isIcaoAllowedForProvince("LTDA", "TR-31")).toBe(true);
    expect(isIcaoAllowedForProvince("OSLK", "TR-31")).toBe(false);
    expect(isIcaoAllowedForProvince("OSAP", "TR-31")).toBe(false);
    expect(isIcaoAllowedForProvince("LTAF", "TR-31")).toBe(false);
    expect(TR_31_AMANOS_BIFACIAL_CONTRACT.blockedForeignMetarIcaos).toContain(
      "OSLK"
    );

    // Belen Geçidi (750m) -> İskenderun (4m) meşhur Yarıkkaya doğulu katabatik fırtınası
    const belenChute = PROVINCE_SPEC_TR_31.venturiCorridors.find(
      (c) => c.id === "belen_yarikkaya_katabatic_chute"
    )!;
    expect(belenChute).toBeDefined();
    expect(belenChute.speedMultiplier).toBe(1.42);
    expect(belenChute.gustMultiplier).toBe(1.55);

    const iskenderunYarikkaya = evaluateVenturiAtPoint(
      belenChute,
      36.5924,
      36.1582,
      105
    );
    expect(iskenderunYarikkaya.active).toBe(true);
    expect(iskenderunYarikkaya.speedMultiplier).toBe(1.42);
    expect(iskenderunYarikkaya.gustMultiplier).toBe(1.55);

    // ÇİFT-YÜZLÜ AMANOS DUVARI AYRIMI:
    // Rejim A: Doğulu/Güneydoğulu (100°) akışta İskenderun/Dörtyol kıyısı Yarıkkaya fönü + yağış gölgesi yaşar
    const coastUnderEastFlow = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_31.directionalBarriers,
      "iskenderun_dortyol_coastal_strip",
      100,
      9.0,
      0.95,
      15
    );
    const amikUnderEastFlow = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_31.directionalBarriers,
      "amik_asi_reyhanli_basin",
      100,
      9.0,
      0.95,
      85
    );
    expect(coastUnderEastFlow.foehnWarmingC).toBeGreaterThan(2.5);
    expect(coastUnderEastFlow.precipMultiplier).toBeLessThan(0.55);
    expect(amikUnderEastFlow.foehnWarmingC).toBe(0);

    // Rejim B: Körfezden esen BGB (255°) deniz akışında İskenderun/Payas/Dörtyol yamacı şiddetli yağış (1.58x) alır
    const coastUnderGulfInflow = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_31.directionalBarriers,
      "iskenderun_dortyol_coastal_strip",
      255,
      8.5,
      0.9,
      29
    );
    expect(coastUnderGulfInflow.foehnWarmingC).toBe(0);
    expect(coastUnderGulfInflow.precipMultiplier).toBeCloseTo(1.58, 2);

    // Rejim C: Kuzeybatılı (305°) Amanos aşan akışta Amik/Kırıkhan doğu yamacı fön ve yağış gölgesi (0.62x) yaşar
    const amikUnderNwCrossFlow = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_31.directionalBarriers,
      "amik_asi_reyhanli_basin",
      305,
      9.0,
      0.95,
      96
    );
    expect(amikUnderNwCrossFlow.foehnWarmingC).toBeGreaterThan(2.0);
    expect(amikUnderNwCrossFlow.precipMultiplier).toBeCloseTo(0.62, 2);

    // Samandağ – Asi Vadisi meltem koridoru ve Amik kış çanak sisi kilidi
    const asiCorridor = PROVINCE_SPEC_TR_31.venturiCorridors.find(
      (c) => c.id === "samandag_asi_valley_breeze_jet"
    )!;
    expect(
      evaluateVenturiAtPoint(asiCorridor, 36.2048, 36.1513, 225).active
    ).toBe(true);
    expect(
      PROVINCE_SPEC_TR_31.inversionAndWedgeSpec.persistentStratusLock.enabled
    ).toBe(true);
    expect(PROVINCE_SPEC_TR_31.waterBodies[0].mgmMarineStationIds).toEqual([
      17481, 17486
    ]);
  });

  it("4. TR-80 Osmaniye: GB (200°–250°) İskenderun Körfezi konvektif hunisi (1.48x), Gavurdağı/Nurdağı Venturi kanalı, kara-içi & Tier-B izolasyonu", () => {
    expect(PROVINCE_SPEC_TR_80.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(TR_80_CONVECTIVE_FUNNEL_CONTRACT.calibrationMode).toBe(
      "TIER_B_DONOR_ALARO"
    );
    expect(PROVINCE_SPEC_TR_80.waterBodies).toEqual([]);
    expect(PROVINCE_SPEC_TR_80.icaoWhitelist).toEqual([]);
    expect(isIcaoAllowedForProvince("LTAF", "TR-80")).toBe(false);
    expect(isIcaoAllowedForProvince("LTDA", "TR-80")).toBe(false);
    expect(isIcaoAllowedForProvince("LTAJ", "TR-80")).toBe(false);
    expect(isIcaoAllowedForProvince("LTCN", "TR-80")).toBe(false);

    // 125m Osmaniye Merkez -> 2200m+ Zorkun / 2246m Düldül Dağı kesiti ve Sumbas DEM onarımı (78m)
    expect(PROVINCE_SPEC_TR_80.primaryCenter.demVerifiedElevationM).toBe(125);
    expect(PROVINCE_SPEC_TR_80.verticalProfileSpec.maxPhysicalPeakM).toBe(2246);
    expect(PROVINCE_SPEC_TR_80.stationOverrides["19184"]?.demElevationM).toBe(
      MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID[98004]
    );

    // İskenderun Körfezi'nden gelen GB (200°–250°) nemli akış Bahçe/Hasanbeyli/Düziçi duvarına dik çarpar -> 1.48x!
    const funnelBarrier = PROVINCE_SPEC_TR_80.directionalBarriers[0];
    expect(funnelBarrier.upslopeSpec.windFromSectorDeg).toEqual({
      fromDeg: 200,
      toDeg: 250
    });
    expect(funnelBarrier.upslopeSpec.maxPrecipMultiplierCap).toBe(1.48);

    const bahceUpslope = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_80.directionalBarriers,
      "bahce_hasanbeyli_duzici_windward",
      225,
      7.5,
      0.85,
      606
    );
    expect(bahceUpslope.precipMultiplier).toBe(1.48);
    expect(bahceUpslope.foehnWarmingC).toBe(0);

    // Gavurdağı / Nurdağı geçidi çift yönlü Venturi ivmelenmesi (Bahçe 37.2022, 36.5778)
    const gavurdagiCorridor = PROVINCE_SPEC_TR_80.venturiCorridors.find(
      (c) => c.id === "gavurdagi_nurdagi_bahce_pass"
    )!;
    const eastPassJet = evaluateVenturiAtPoint(
      gavurdagiCorridor,
      37.2022,
      36.5778,
      80
    );
    const westPassJet = evaluateVenturiAtPoint(
      gavurdagiCorridor,
      37.2022,
      36.5778,
      260
    );
    expect(eastPassJet.active).toBe(true);
    expect(westPassJet.active).toBe(true);
    expect(eastPassJet.speedMultiplier).toBeGreaterThanOrEqual(1.35);
    expect(eastPassJet.gustMultiplier).toBeGreaterThanOrEqual(1.45);
  });

  it("5. TR-46 Kahramanmaraş: 568m Akdeniz geçişli Merkez (DEM onarımlı) vs Berit (3014m) ardı Göksun/Elbistan–Afşin (-30°C ayaz, kalmanCap=8.0, snowpackBoost=1.5) ayrımı", () => {
    expect(PROVINCE_SPEC_TR_46.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_46.primaryCenter.wmoId).toBe("17255");
    expect(PROVINCE_SPEC_TR_46.primaryCenter.demVerifiedElevationM).toBe(568);
    expect(PROVINCE_SPEC_TR_46.waterBodies).toEqual([]);
    expect(PROVINCE_SPEC_TR_46.icaoWhitelist).toEqual(["LTCN"]);
    expect(isIcaoAllowedForProvince("LTCN", "TR-46")).toBe(true);
    expect(isIcaoAllowedForProvince("LTAJ", "TR-46")).toBe(false);
    expect(isIcaoAllowedForProvince("LTAT", "TR-46")).toBe(false);

    // DEM sıfır-rakım onarımı doğrulaması: Merkez (568m), sensör 18279 (985m) ve ilçe 94604 (1117m) asla 0m olmaz!
    expect(
      PROVINCE_SPEC_TR_46.stationOverrides["17255"]?.demElevationM
    ).toBe(568);
    expect(PROVINCE_SPEC_TR_46.stationOverrides["18279"]?.demElevationM).toBe(
      MGM_DEM_ELEVATION_REPAIR_BY_ISTNO[18279]
    );
    expect(PROVINCE_SPEC_TR_46.stationOverrides["18279"]?.demElevationM).toBe(
      985
    );
    expect(MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID[94604]).toBe(1117);

    // İki İklim Dünyası Yalıtımı: Güney Merkez (568m) <-> Kuzey Elbistan/Göksun (1137-1344m) kuplajı <= 0.08
    const southToNorth =
      PROVINCE_SPEC_TR_46.barrierCouplingMatrix.maras_aksu_southern_foothill
        .elbistan_afsin_goksun_frost_basin;
    const northToSouth =
      PROVINCE_SPEC_TR_46.barrierCouplingMatrix
        .elbistan_afsin_goksun_frost_basin.maras_aksu_southern_foothill;
    expect(southToNorth).toBeLessThanOrEqual(0.08);
    expect(northToSouth).toBeLessThanOrEqual(0.08);

    // Kuzey ayaz istasyonlarının tamamı (Göksun 17866, Elbistan 17870, Afşin 17868, Nurhak 18281)
    // yüksek soğuk-havuz duyarlılığına sahiptir ve Merkez manşetinden dışlanmıştır
    for (const northId of ["17866", "17870", "17868", "18281"]) {
      const st = PROVINCE_SPEC_TR_46.stationOverrides[northId];
      expect(st).toBeDefined();
      expect(st.subBasinId).toBe("elbistan_afsin_goksun_frost_basin");
      expect(st.excludeFromCenterHeadline).toBe(true);
      expect(st.coldPoolSusceptibility).toBeGreaterThanOrEqual(0.88);
    }

    // Sert kar/ayaz kapalı havza parametreleri: -30°C kabulü, kalmanTempBiasCapC = 8.0, snowpackBoostFactor = 1.5
    expect(PROVINCE_SPEC_TR_46.qcAndMosBounds.minPlausibleTempC).toBeLessThanOrEqual(
      -30
    );
    expect(PROVINCE_SPEC_TR_46.qcAndMosBounds.kalmanTempBiasCapC).toBe(8.0);
    expect(TR_46_DUAL_CLIMATE_BASIN_CONTRACT.snowpackBoostFactor).toBe(1.5);
    expect(
      PROVINCE_SPEC_TR_46.inversionAndWedgeSpec.topographicEnclosureIndex
    ).toBeGreaterThanOrEqual(0.9);
    expect(
      PROVINCE_SPEC_TR_46.inversionAndWedgeSpec.snowAlbedoFeedback
        .maxExtraRadiativeCoolingC
    ).toBeGreaterThanOrEqual(7.0);

    // Klimatoloji + Kar Albedo Soğuma Farkı: Ocak ortasında (DOY=15) Maraş Merkez (568m) vs Göksun (1344m) kar örtülü gece farkı > 10°C!
    const marasJan = computeTrDailyClimatologyNormal({
      provinceCode: "TR-46",
      lat: 37.576,
      lon: 36.915,
      elevationM: 568,
      dayOfYear: 15
    });
    const goksunJanBase = computeTrDailyClimatologyNormal({
      provinceCode: "TR-46",
      lat: 38.024,
      lon: 36.4823,
      elevationM: 1344,
      dayOfYear: 15
    });
    const goksunSnowNightMinC =
      goksunJanBase.tminNormalC -
      PROVINCE_SPEC_TR_46.inversionAndWedgeSpec.snowAlbedoFeedback
        .maxExtraRadiativeCoolingC *
        PROVINCE_SPEC_TR_46.stationOverrides["17866"].coldPoolSusceptibility;

    expect(marasJan.tminNormalC).toBeGreaterThan(1.0);
    expect(marasJan.tminNormalC - goksunSnowNightMinC).toBeGreaterThan(10.0);

    // 4-bant hipsometrik çözümleyici Yedikuyular (1871m) ve Elbistan (1137m) için monoton kesit üretir
    const yedikuyularBands = resolveProvinceElevationBandSpecs({
      provinceCode: "TR-46",
      referenceElevationM: 1871,
      locationName: "Yedikuyular Kayak Merkezi"
    });
    expect(yedikuyularBands).toHaveLength(4);
    expect(yedikuyularBands.filter((b) => b.isReferenceBand)).toHaveLength(1);
    expect(
      yedikuyularBands.find((b) => b.isReferenceBand)?.elevationM
    ).toBe(1871);

    // Katalog entegrasyonu: 4 ilin tüm ilçe ve zirve kayıtları eksiksiz mevcuttur
    expect(getTrCatalogByProvince("TR-01").length).toBeGreaterThanOrEqual(16);
    expect(getTrCatalogByProvince("TR-31").length).toBeGreaterThanOrEqual(16);
    expect(getTrCatalogByProvince("TR-46").length).toBeGreaterThanOrEqual(13);
    expect(getTrCatalogByProvince("TR-80").length).toBeGreaterThanOrEqual(8);
  });
});
