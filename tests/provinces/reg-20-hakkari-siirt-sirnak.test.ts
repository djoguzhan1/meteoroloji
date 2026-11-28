import { describe, expect, it } from "vitest";
import { isIcaoAllowedForProvince } from "../../lib/metar-verify";
import { getTrCatalogByProvince } from "../../lib/provinces/catalog-1102";
import { computeTrDailyClimatologyNormal } from "../../lib/provinces/climatology-1991-2020";
import { loadProvinceCalibrationBundle } from "../../lib/provinces/emos-weights/index";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import { resolveProvinceElevationBandSpecs } from "../../lib/provinces/hypsometric-bands-tr81";
import {
  MGM_DEM_ELEVATION_REPAIR_BY_ISTNO,
  MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID,
  STATIC_MGM_ISTNO_OWNER_PROVINCE
} from "../../lib/provinces/mgm-dem-repair";
import PROVINCE_SPEC_TR_30, {
  PROVINCE_SPEC_TR_30 as NAMED_TR_30,
  TR_30_ZAP_CILO_ALPINE_CONTRACT
} from "../../lib/provinces/specs/tr-30";
import PROVINCE_SPEC_TR_56, {
  PROVINCE_SPEC_TR_56 as NAMED_TR_56,
  TR_56_BOTAN_TIGRIS_THRESHOLD_CONTRACT
} from "../../lib/provinces/specs/tr-56";
import PROVINCE_SPEC_TR_73, {
  PROVINCE_SPEC_TR_73 as NAMED_TR_73,
  TR_73_VERTICAL_ESCARPMENT_CONTRACT
} from "../../lib/provinces/specs/tr-73";
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

describe("Wave 3C — REG-20 (Zap/Cilo Alpin Duvarı & Botan-Dicle Eşiği: TR-30 Hakkari, TR-56 Siirt, TR-73 Şırnak)", () => {
  const ALL_SPECS: readonly ProvinceSpec[] = [
    PROVINCE_SPEC_TR_30,
    PROVINCE_SPEC_TR_56,
    PROVINCE_SPEC_TR_73
  ];

  it("1. Üç ilin tamamı şema bütünlüğünü, donmuş (frozen) tekilliği, poligon aidiyetini, 9-nokta şablonunu ve istasyon sahipliğini eksiksiz sağlar", async () => {
    expect(PROVINCE_SPEC_TR_30).toBe(NAMED_TR_30);
    expect(PROVINCE_SPEC_TR_56).toBe(NAMED_TR_56);
    expect(PROVINCE_SPEC_TR_73).toBe(NAMED_TR_73);

    for (const spec of ALL_SPECS) {
      expect(Object.isFrozen(spec)).toBe(true);
      expect(spec.stencil9Points).toHaveLength(9);
      expect(
        spec.stencil9Points.filter((pt) => pt.role === "target")
      ).toHaveLength(1);
      expect(spec.curatedSubLocations.length).toBeGreaterThanOrEqual(4);
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toHaveLength(12);
      expect(spec.primaryCenter.monthlyTminNormalsC).toHaveLength(12);
      expect(spec.waterBodies).toHaveLength(0);

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

      const resolvedBands = resolveProvinceElevationBandSpecs({
        provinceCode: spec.provinceCode,
        referenceElevationM: spec.primaryCenter.demVerifiedElevationM,
        locationName: spec.nameTr
      });
      expect(resolvedBands).toHaveLength(4);
      expect(resolvedBands.filter((b) => b.isReferenceBand)).toHaveLength(1);

      // Alt havza kuplaj matrisi simetrik, [0, 1] aralığında ve köşegende 1.0 olmalıdır
      const subIds = spec.subBasins.map((sb) => sb.id);
      for (const a of subIds) {
        expect(spec.barrierCouplingMatrix[a]?.[a]).toBe(1.0);
        for (const b of subIds) {
          const wab = spec.barrierCouplingMatrix[a]?.[b];
          const wba = spec.barrierCouplingMatrix[b]?.[a];
          expect(wab).toBeDefined();
          expect(wba).toBeDefined();
          expect(wab!).toBeGreaterThanOrEqual(0);
          expect(wab!).toBeLessThanOrEqual(1);
          expect(wab).toBeCloseTo(wba!, 6);
        }
      }

      // Birincil merkez, küratörlü alt konumlar ve 9 şablon noktası kendi il poligonuna düşmelidir
      const centerRes = resolveProvinceCode({
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon,
        countryCode: "TR"
      });
      expect(centerRes.provinceCode).toBe(spec.provinceCode);

      for (const subLoc of spec.curatedSubLocations) {
        expect(subLoc.lat).toBeGreaterThanOrEqual(spec.domainBounds.minLat);
        expect(subLoc.lat).toBeLessThanOrEqual(spec.domainBounds.maxLat);
        expect(subLoc.lon).toBeGreaterThanOrEqual(spec.domainBounds.minLon);
        expect(subLoc.lon).toBeLessThanOrEqual(spec.domainBounds.maxLon);

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

        const ptRes = resolveProvinceCode({
          lat: pt.lat,
          lon: pt.lon,
          admin1: spec.nameTr,
          countryCode: "TR"
        });
        expect(ptRes.provinceCode).toBe(spec.provinceCode);
      }

      // Tüm sayısal stationOverrides istasyonları MGM sahiplik tablosunda aynı ile ait olmalıdır
      for (const override of Object.values(spec.stationOverrides)) {
        expect(subIds).toContain(override.subBasinId);
        const istNo = Number(override.stationId);
        if (Number.isFinite(istNo) && STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo]) {
          expect(STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo]).toBe(
            spec.provinceCode
          );
        }
      }

      // Wave 4 kalibrasyon paketiyle (TIER_A_WMO / TIER_B_DONOR_KALMAN) tam uyum doğrulaması
      const calBundle = await loadProvinceCalibrationBundle(spec.provinceCode);
      expect(calBundle).not.toBeNull();
      expect(calBundle!.calibrationTier).toBe(spec.calibrationTier);
    }
  });

  it("2. TR-30 Hakkari: Cilo–Sat (4135m Uludoruk) buzul kütlesi, Yüksekova LTCW (coldPoolSusceptibility 0.94, -35°C ayaz izolasyonu), Mergabütan vs Çukurca/Derecik derin vadileri ve GB siklonik kar çarpanı", () => {
    expect(PROVINCE_SPEC_TR_30.region).toBe("EASTERN_ANATOLIA");
    expect(PROVINCE_SPEC_TR_30.climateRegion).toBe("DOGU_ANADOLU");
    expect(PROVINCE_SPEC_TR_30.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(PROVINCE_SPEC_TR_30.donorCluster).toBe("HIGH_EAST_SNOW_BASIN");
    expect(PROVINCE_SPEC_TR_30.primaryCenter.wmoId).toBeUndefined();
    expect(PROVINCE_SPEC_TR_30.primaryCenter.demVerifiedElevationM).toBe(1727);
    expect(PROVINCE_SPEC_TR_30.verticalProfileSpec.maxPhysicalPeakM).toBe(4135);
    expect(TR_30_ZAP_CILO_ALPINE_CONTRACT.uludorukGlacialPeakM).toBe(4135);

    // METAR izolasyonu: Yalnızca LTCW serbest; Erbil (ORER), Urmiye (OITR), Cizre (LTCV) ve Van (LTCI) kesin yasak!
    expect(PROVINCE_SPEC_TR_30.icaoWhitelist).toEqual(["LTCW"]);
    expect(isIcaoAllowedForProvince("LTCW", "TR-30")).toBe(true);
    expect(isIcaoAllowedForProvince("ORER", "TR-30")).toBe(false);
    expect(isIcaoAllowedForProvince("OITR", "TR-30")).toBe(false);
    expect(isIcaoAllowedForProvince("LTCV", "TR-30")).toBe(false);
    expect(isIcaoAllowedForProvince("LTCI", "TR-30")).toBe(false);

    // Yüksekova (LTCW & OMGİ 17920) kapalı kar/ayaz havzası: coldPoolSusceptibility = 0.94 ve merkez başlığından dışlanmış!
    const ltcwOverride = PROVINCE_SPEC_TR_30.stationOverrides.LTCW;
    const yuksekova17920 = PROVINCE_SPEC_TR_30.stationOverrides["17920"];
    expect(ltcwOverride).toBeDefined();
    expect(ltcwOverride.coldPoolSusceptibility).toBe(0.94);
    expect(ltcwOverride.excludeFromCenterHeadline).toBe(true);
    expect(yuksekova17920.coldPoolSusceptibility).toBe(0.94);
    expect(yuksekova17920.excludeFromCenterHeadline).toBe(true);

    // -35°C kış minimumları QC alt sınırının (-38°C) içinde kalır ve kar-albedo soğuması güçlüdür
    expect(
      PROVINCE_SPEC_TR_30.qcAndMosBounds.minPlausibleTempC
    ).toBeLessThanOrEqual(-35);
    expect(
      PROVINCE_SPEC_TR_30.inversionAndWedgeSpec.snowAlbedoFeedback
        .maxExtraRadiativeCoolingC
    ).toBeGreaterThanOrEqual(10.0);

    // Yüksekova çanağı ile Hakkari dik Zap yamacı ve Çukurca/Derecik ılıman olukları bariyerle ayrışır
    expect(
      PROVINCE_SPEC_TR_30.barrierCouplingMatrix.yuksekova_gever_frost_basin
        .hakkari_zap_steep_slope
    ).toBeLessThanOrEqual(0.15);
    expect(
      PROVINCE_SPEC_TR_30.barrierCouplingMatrix.yuksekova_gever_frost_basin
        .cukurca_derecik_semdinli_troughs
    ).toBeLessThanOrEqual(0.1);

    // Mergabütan Kayak Merkezi (19909 -> DEM 2516m) ve Derecik (761m) katalog/DEM kayıtlarıyla uyumludur
    expect(MGM_DEM_ELEVATION_REPAIR_BY_ISTNO[19909]).toBe(2516);
    expect(
      PROVINCE_SPEC_TR_30.stationOverrides["19909"].demElevationM
    ).toBe(2516);
    const catalog30 = getTrCatalogByProvince("TR-30");
    expect(catalog30.some((loc) => loc.name.includes("Derecik"))).toBe(true);
    expect(catalog30.some((loc) => loc.name.includes("Mergabütan"))).toBe(true);

    // Güneybatılı (215°) Basra/Akdeniz siklonlarında Cilo–Sat duvarında 1.88x devasa orografik kar/yağış çarpanı
    const swCyclone = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_30.directionalBarriers,
      "hakkari_zap_steep_slope",
      215,
      9.0,
      0.85,
      1727
    );
    expect(swCyclone.precipMultiplier).toBeCloseTo(1.88, 2);
    expect(swCyclone.foehnWarmingC).toBe(0);

    // Kuzeydoğulu (45°) yüksek plato akışında Çukurca/Derecik alt vadilerinde iniş fönü ve yağış gölgesi oluşur
    const neDescent = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_30.directionalBarriers,
      "cukurca_derecik_semdinli_troughs",
      45,
      10.0,
      0.95,
      1250
    );
    expect(neDescent.foehnWarmingC).toBeGreaterThan(4.0);
    expect(neDescent.precipMultiplier).toBeLessThan(0.6);

    // Büyük Zap Boğazı (195°) oluk rüzgarı aktivasyonu
    const zapVenturi = evaluateVenturiAtPoint(
      PROVINCE_SPEC_TR_30.venturiCorridors[0],
      37.44,
      43.68,
      200
    );
    expect(zapVenturi.active).toBe(true);
    expect(zapVenturi.speedMultiplier).toBeCloseTo(1.34, 2);
  });

  it("3. TR-56 Siirt: WMO 17210 TIER_A_WMO çıpası, Botan/Dicle kavşağı (895m), +44°C Basra termal sıcağı, 0.88 Suriye/Irak toz taşınımı ve Pervari–Şirvan–Tillo cephesel yağış duvarı", () => {
    expect(PROVINCE_SPEC_TR_56.region).toBe("SOUTHEASTERN_ANATOLIA");
    expect(PROVINCE_SPEC_TR_56.climateRegion).toBe("GUNEYDOGU");
    expect(PROVINCE_SPEC_TR_56.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_56.primaryCenter.wmoId).toBe("17210");
    expect(PROVINCE_SPEC_TR_56.primaryCenter.demVerifiedElevationM).toBe(895);
    expect(PROVINCE_SPEC_TR_56.verticalProfileSpec.maxPhysicalPeakM).toBe(2838);

    // METAR izolasyonu: Yalnızca LTCL serbest; Batman (LTCJ), Şırnak (LTCV) ve Diyarbakır (LTCC) yasak!
    expect(PROVINCE_SPEC_TR_56.icaoWhitelist).toEqual(["LTCL"]);
    expect(isIcaoAllowedForProvince("LTCL", "TR-56")).toBe(true);
    expect(isIcaoAllowedForProvince("LTCJ", "TR-56")).toBe(false);
    expect(isIcaoAllowedForProvince("LTCV", "TR-56")).toBe(false);
    expect(isIcaoAllowedForProvince("LTCC", "TR-56")).toBe(false);

    // Suriye/Irak toz taşınımı (0.88), ters-V kuru mikro-patlama riski ve +44°C kavurucu yaz sınırları
    expect(
      PROVINCE_SPEC_TR_56.aridAndSevereDrivers.dustTransportSusceptibility
    ).toBe(0.88);
    expect(
      TR_56_BOTAN_TIGRIS_THRESHOLD_CONTRACT.dustTransportSusceptibility
    ).toBe(0.88);
    expect(
      PROVINCE_SPEC_TR_56.aridAndSevereDrivers
        .invertedVDryMicroburstSusceptibility
    ).toBeGreaterThanOrEqual(0.75);
    expect(
      PROVINCE_SPEC_TR_56.qcAndMosBounds.maxPlausibleTempC
    ).toBeGreaterThanOrEqual(46);

    // Temmuz normali (WMO 17210 · DOY 201 · 895m) ~37°C kavurucu yaz rejimini doğrular
    const julyNormal = computeTrDailyClimatologyNormal({
      provinceCode: "TR-56",
      lat: 37.9319,
      lon: 41.9354,
      elevationM: 895,
      dayOfYear: 201
    });
    expect(julyNormal.tmaxNormalC).toBeGreaterThan(36.5);

    // Tillo / Aydınlar DEM onarımı (merkezId 95603 -> 1193m, istNo 19269 -> 1180m) ve LTCL alt vadi izolasyonu
    expect(MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID[95603]).toBe(1193);
    expect(MGM_DEM_ELEVATION_REPAIR_BY_ISTNO[19269]).toBe(1180);
    expect(
      PROVINCE_SPEC_TR_56.stationOverrides.LTCL.excludeFromCenterHeadline
    ).toBe(true);
    expect(
      PROVINCE_SPEC_TR_56.stationOverrides["18339"].subBasinId
    ).toBe("pervari_herekol_alpine_wall");

    // Kış/ilkbahar güneybatılı (205°) cephelerde Güneydoğu Toros (Pervari–Şirvan–Tillo) 1.66x yamaç yağışı
    const frontalUpslope = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_56.directionalBarriers,
      "sirvan_tillo_eruh_mid_escarpment",
      205,
      7.5,
      0.85,
      1193
    );
    expect(frontalUpslope.precipMultiplier).toBeCloseTo(1.66, 2);
    expect(frontalUpslope.foehnWarmingC).toBe(0);

    // Kuzey-kuzeydoğulu (20°) Bitlis–Van platosu akışında Siirt/Kurtalan eşiğine kuru fön inişi
    const northFoehn = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_56.directionalBarriers,
      "siirt_botan_threshold_terrace",
      20,
      8.5,
      0.9,
      895
    );
    expect(northFoehn.foehnWarmingC).toBeGreaterThan(3.5);
    expect(northFoehn.precipMultiplier).toBeCloseTo(0.52, 2);
  });

  it("4. TR-73 Şırnak: >1000m dikey basamak uçurumu (Cizre 400m +49.1°C / maxPlausibleTempC 51 vs Merkez 1350m vs Beytüşşebap 1450–3356m), LTCV düzlüğü izolasyonu ve barrierCouplingMatrix <= 0.14", () => {
    expect(PROVINCE_SPEC_TR_73.region).toBe("SOUTHEASTERN_ANATOLIA");
    expect(PROVINCE_SPEC_TR_73.climateRegion).toBe("GUNEYDOGU");
    expect(PROVINCE_SPEC_TR_73.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(PROVINCE_SPEC_TR_73.primaryCenter.wmoId).toBeUndefined();
    expect(PROVINCE_SPEC_TR_73.primaryCenter.demVerifiedElevationM).toBe(1350);
    expect(PROVINCE_SPEC_TR_73.verticalProfileSpec.maxPhysicalPeakM).toBe(3356);

    // Cizre resmi sıcaklık kıstası (+49.1°C) için maxPlausibleTempC = 51 kesin kilidi!
    expect(PROVINCE_SPEC_TR_73.qcAndMosBounds.maxPlausibleTempC).toBe(51);
    expect(TR_73_VERTICAL_ESCARPMENT_CONTRACT.maxPlausibleTempC).toBe(51);
    expect(
      TR_73_VERTICAL_ESCARPMENT_CONTRACT.cizreOfficialHeatBenchmarkC
    ).toBe(49.1);

    // Cizre (400m) ile Şırnak Merkez (1350m) arasındaki ~950m dikey basamak klimatolojik yaz normalinde de >5°C fark üretir
    const cizreJuly = computeTrDailyClimatologyNormal({
      provinceCode: "TR-73",
      lat: 37.3326,
      lon: 42.2027,
      elevationM: 400,
      dayOfYear: 201
    });
    const sirnakCenterJuly = computeTrDailyClimatologyNormal({
      provinceCode: "TR-73",
      lat: 37.5209,
      lon: 42.4523,
      elevationM: 1350,
      dayOfYear: 201
    });
    expect(cizreJuly.tmaxNormalC - sirnakCenterJuly.tmaxNormalC).toBeGreaterThan(
      5.0
    );

    // METAR izolasyonu: Yalnızca LTCV serbest; Kamışlı (OSKL), Erbil (ORER), Siirt (LTCL), Mardin (LTCK) yasak!
    expect(PROVINCE_SPEC_TR_73.icaoWhitelist).toEqual(["LTCV"]);
    expect(isIcaoAllowedForProvince("LTCV", "TR-73")).toBe(true);
    expect(isIcaoAllowedForProvince("OSKL", "TR-73")).toBe(false);
    expect(isIcaoAllowedForProvince("ORER", "TR-73")).toBe(false);
    expect(isIcaoAllowedForProvince("LTCL", "TR-73")).toBe(false);
    expect(isIcaoAllowedForProvince("LTCK", "TR-73")).toBe(false);

    // KRİTİK ANTİ-PLASEBO KORUMASI: LTCV Havalimanı (621m) ve Cizre (17950, 400m) Dicle ovasındadır;
    // 1350m Şırnak Merkez kar/sıcaklık başlığını asla kirletemez!
    expect(PROVINCE_SPEC_TR_73.stationOverrides.LTCV.subBasinId).toBe(
      "cizre_silopi_tigris_plain"
    );
    expect(
      PROVINCE_SPEC_TR_73.stationOverrides.LTCV.excludeFromCenterHeadline
    ).toBe(true);
    expect(
      PROVINCE_SPEC_TR_73.stationOverrides["17950"].excludeFromCenterHeadline
    ).toBe(true);
    expect(
      PROVINCE_SPEC_TR_73.stationOverrides["18344"].excludeFromCenterHeadline
    ).toBe(true);

    // İl-içi >1000m irtifa uçurumu: Cizre–Silopi ovası (380–400m) ile Merkez (1350–1360m) ve Beytüşşebap arasında
    // barrierCouplingMatrix kesinlikle <= 0.14 olmalıdır!
    const matrix = PROVINCE_SPEC_TR_73.barrierCouplingMatrix;
    expect(
      matrix.cizre_silopi_tigris_plain.sirnak_cudi_namaz_ridge
    ).toBeLessThanOrEqual(0.14);
    expect(
      matrix.sirnak_cudi_namaz_ridge.cizre_silopi_tigris_plain
    ).toBeLessThanOrEqual(0.14);
    expect(
      matrix.cizre_silopi_tigris_plain.uludere_beytussebap_alpine_snow
    ).toBeLessThanOrEqual(0.14);
    expect(
      matrix.uludere_beytussebap_alpine_snow.cizre_silopi_tigris_plain
    ).toBeLessThanOrEqual(0.14);

    // Dikey düğüm farkı: Cizre (380m) -> Şırnak Merkez (1360m) -> Uludere/Beytüşşebap (1920m) -> Kato (2750m)
    const [lowKnot, centerKnot, midAlpineKnot, summitKnot] =
      PROVINCE_SPEC_TR_73.verticalProfileSpec.piecewiseKnotsM;
    expect(centerKnot - lowKnot).toBeGreaterThanOrEqual(950);
    expect(summitKnot - lowKnot).toBeGreaterThan(2300);
    expect(midAlpineKnot).toBe(1920);

    // Güneyli/Güneybatılı (210°) nemli akışta Tanintanin/Kato kar kuşağında 1.82x kuvvetli yamaç yağışı,
    // Kuzeydoğulu (25°) akışta ise Cudi güney eteğinden Cizre ovasına (400m) sıcak kuru fön inişi!
    const katoSnowUpslope = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_73.directionalBarriers,
      "uludere_beytussebap_alpine_snow",
      210,
      8.5,
      0.85,
      1450
    );
    expect(katoSnowUpslope.precipMultiplier).toBeCloseTo(1.82, 2);
    expect(katoSnowUpslope.foehnWarmingC).toBe(0);

    const cizreDownslopeFoehn = evaluateBarrierRegimeForSubBasin(
      PROVINCE_SPEC_TR_73.directionalBarriers,
      "cizre_silopi_tigris_plain",
      25,
      8.5,
      0.9,
      400
    );
    expect(cizreDownslopeFoehn.foehnWarmingC).toBeGreaterThan(4.8);
    expect(cizreDownslopeFoehn.precipMultiplier).toBeCloseTo(0.46, 2);

    // Kasrik Boğazı (Dicle geçidi) Venturi oluk rüzgarı
    const kasrikJet = evaluateVenturiAtPoint(
      PROVINCE_SPEC_TR_73.venturiCorridors[0],
      37.395,
      42.17,
      195
    );
    expect(kasrikJet.active).toBe(true);
    expect(kasrikJet.speedMultiplier).toBeCloseTo(1.36, 2);
  });
});
