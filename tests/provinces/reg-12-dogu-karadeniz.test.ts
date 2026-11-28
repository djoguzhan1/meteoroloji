import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchMetarNetworkHistory,
  getAllowedTurkeyIcaosForProvince,
  isIcaoAllowedForProvince,
  resetMetarCacheForTests,
  type RawMetarRecord
} from "../../lib/metar-verify";
import { getTrCatalogEntryById, getTrProvinceCenterEntry } from "../../lib/provinces/catalog-1102";
import { TR81_CLIMATOLOGY_1991_2020 } from "../../lib/provinces/climatology-1991-2020";
import { PROVINCE_CALIBRATION_TR_08 } from "../../lib/provinces/emos-weights/tr-08";
import { PROVINCE_CALIBRATION_TR_29 } from "../../lib/provinces/emos-weights/tr-29";
import { PROVINCE_CALIBRATION_TR_53 } from "../../lib/provinces/emos-weights/tr-53";
import { PROVINCE_CALIBRATION_TR_61 } from "../../lib/provinces/emos-weights/tr-61";
import { pointInProvincePolygon, resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import { TR81_HYPSOMETRIC_PROFILES } from "../../lib/provinces/hypsometric-bands-tr81";
import {
  isCrossProvinceProxyMerkez,
  isMgmStationOwnedByProvince
} from "../../lib/provinces/mgm-dem-repair";
import PROVINCE_SPEC_TR_08_DEFAULT, {
  evaluateArtvinCoastToCoruhContrast,
  PROVINCE_SPEC_TR_08,
  TR_08_BESPOKE_META
} from "../../lib/provinces/specs/tr-08";
import PROVINCE_SPEC_TR_29_DEFAULT, {
  evaluateGumushaneZiganaShadowTransect,
  PROVINCE_SPEC_TR_29
} from "../../lib/provinces/specs/tr-29";
import PROVINCE_SPEC_TR_53_DEFAULT, {
  evaluateRizeKackarExtremeRegime,
  PROVINCE_SPEC_TR_53,
  TR_53_BESPOKE_META
} from "../../lib/provinces/specs/tr-53";
import PROVINCE_SPEC_TR_61_DEFAULT, {
  evaluateTrabzonYorozAndFoehnResponse,
  PROVINCE_SPEC_TR_61
} from "../../lib/provinces/specs/tr-61";
import type { ProvinceSpec } from "../../lib/provinces/types";

const REG_12_SPECS: readonly ProvinceSpec[] = [
  PROVINCE_SPEC_TR_08,
  PROVINCE_SPEC_TR_29,
  PROVINCE_SPEC_TR_53,
  PROVINCE_SPEC_TR_61
];

describe("Wave 3B — REG-12 Doğu Karadeniz Dik Orografi, Fön & Çoruh Gölgesi (TR-08 Artvin, TR-29 Gümüşhane, TR-53 Rize, TR-61 Trabzon)", () => {
  afterEach(() => {
    resetMetarCacheForTests();
    vi.restoreAllMocks();
  });

  it("4 ilin tamamı ProvinceSpec, EMOS ağırlık paketleri, 1991-2020 klimatolojisi, 4-bant hipsometri ve poligon sınırlarıyla %100 uyumludur", () => {
    expect(PROVINCE_SPEC_TR_08_DEFAULT).toBe(PROVINCE_SPEC_TR_08);
    expect(PROVINCE_SPEC_TR_29_DEFAULT).toBe(PROVINCE_SPEC_TR_29);
    expect(PROVINCE_SPEC_TR_53_DEFAULT).toBe(PROVINCE_SPEC_TR_53);
    expect(PROVINCE_SPEC_TR_61_DEFAULT).toBe(PROVINCE_SPEC_TR_61);

    const emosWmoByCode: Record<string, string | null> = {
      "TR-08": PROVINCE_CALIBRATION_TR_08.wmoStationId,
      "TR-29": PROVINCE_CALIBRATION_TR_29.wmoStationId,
      "TR-53": PROVINCE_CALIBRATION_TR_53.wmoStationId,
      "TR-61": PROVINCE_CALIBRATION_TR_61.wmoStationId
    };

    for (const spec of REG_12_SPECS) {
      expect(spec.region).toBe("BLACK_SEA_EAST");
      expect(spec.climateRegion).toBe("KARADENIZ");
      expect(spec.calibrationTier).toBe("TIER_A_WMO");
      expect(spec.primaryCenter.wmoId).toBe(emosWmoByCode[spec.provinceCode]);
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.icaoWhitelist).toEqual(getAllowedTurkeyIcaosForProvince(spec.provinceCode));

      const catCenter = getTrProvinceCenterEntry(spec.provinceCode);
      expect(catCenter).toBeDefined();
      expect(spec.primaryCenter.mgmMerkezId).toBe(catCenter!.mgmMerkezId);
      expect(spec.primaryCenter.mgmIstNo).toBe(catCenter!.mgmSondurumIstNo);
      expect(spec.primaryCenter.demVerifiedElevationM).toBe(catCenter!.elevationM);

      const clim = TR81_CLIMATOLOGY_1991_2020[spec.provinceCode];
      const hypso = TR81_HYPSOMETRIC_PROFILES[spec.provinceCode];
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toEqual(clim.tmaxC);
      expect(spec.primaryCenter.monthlyTminNormalsC).toEqual(clim.tminC);
      expect(spec.verticalProfileSpec.maxPhysicalPeakM).toBe(hypso.maxPhysicalPeakM);
      expect(spec.verticalProfileSpec.snowElevationBands).toEqual(hypso.bands);

      // Merkez, alt-lokasyonlar ve tüm kara stencil noktaları yalnızca kendi iline çözünür (%0 komşu/yabancı sızıntı)
      const centerRes = resolveProvinceCode({
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon
      });
      expect(centerRes.provinceCode).toBe(spec.provinceCode);

      for (const sub of spec.curatedSubLocations) {
        const subRes = resolveProvinceCode({ lat: sub.lat, lon: sub.lon });
        expect(subRes.provinceCode).toBe(spec.provinceCode);
        const catSub = getTrCatalogEntryById(sub.id);
        if (catSub) {
          expect(catSub.provinceCode).toBe(spec.provinceCode);
        }
      }

      for (const stPt of spec.stencil9Points) {
        if (stPt.role !== "marine_upwind") {
          expect(pointInProvincePolygon(stPt.lat, stPt.lon, spec.provinceCode)).toBe(true);
          const stRes = resolveProvinceCode({ lat: stPt.lat, lon: stPt.lon });
          expect(stRes.provinceCode).toBe(spec.provinceCode);
        }
      }

      // Simetrik barrierCouplingMatrix ve [0, 1] kontrolü
      const basinIds = spec.subBasins.map((b) => b.id);
      for (const b1 of basinIds) {
        expect(spec.barrierCouplingMatrix[b1]?.[b1]).toBe(1.0);
        for (const b2 of basinIds) {
          const w12 = spec.barrierCouplingMatrix[b1]?.[b2];
          const w21 = spec.barrierCouplingMatrix[b2]?.[b1];
          expect(w12).toBeDefined();
          expect(w12).toBeGreaterThanOrEqual(0);
          expect(w12).toBeLessThanOrEqual(1);
          expect(w12).toBeCloseTo(w21 ?? -1, 6);
        }
      }
    }
  });

  it("TR-08 Artvin: Hopa–Arhavi (>2200 mm DEK+upslope) kıyı kuşağı ile Artvin Merkez (613m) ve Yusufeli (~600m mikro-Akdeniz kanyonu) arasında <=0.15 keskin bariyer duvarı kurar", () => {
    expect(PROVINCE_SPEC_TR_08.primaryCenter.wmoId).toBe("17045");
    expect(PROVINCE_SPEC_TR_08.primaryCenter.demVerifiedElevationM).toBe(613);
    expect(PROVINCE_SPEC_TR_08.icaoWhitelist).toEqual([]);
    expect(PROVINCE_SPEC_TR_08.waterBodies).toHaveLength(1);
    expect(PROVINCE_SPEC_TR_08.verticalProfileSpec.maxPhysicalPeakM).toBeGreaterThanOrEqual(3400);

    const coastCouplings =
      PROVINCE_SPEC_TR_08.barrierCouplingMatrix.hopa_arhavi_kemalpasa_coast;
    expect(coastCouplings.artvin_merkez_coruh_slope).toBeLessThanOrEqual(
      TR_08_BESPOKE_META.maxCoastToCoruhCoupling
    );
    expect(coastCouplings.yusufeli_inner_coruh_micro_med).toBeLessThanOrEqual(0.15);
    expect(coastCouplings.savsat_karcal_mersivan_alpine).toBeLessThanOrEqual(0.15);

    // Deniz kütlesi etkisi Hopa kıyısında ~0.98 iken Yusufeli derin kanyonunda ~0.02'ye düşer
    const seaWeights = PROVINCE_SPEC_TR_08.waterBodies[0].subBasinInfluenceWeights;
    expect(seaWeights.hopa_arhavi_kemalpasa_coast).toBeGreaterThan(0.95);
    expect(seaWeights.yusufeli_inner_coruh_micro_med).toBeLessThan(0.05);

    // 320° Karayel sisteminde Hopa kıyı duvarı vs Yusufeli Çoruh yağış gölgesi (>5x oran!)
    const contrast = evaluateArtvinCoastToCoruhContrast({
      synopticPrecipMmHr: 12.0,
      windFromDirDeg: 320,
      windSpeedMs: 11.0
    });
    expect(contrast.hopaCoastPrecipMmHr).toBeCloseTo(21.0, 3);
    expect(contrast.yusufeliCanyonPrecipMmHr).toBeCloseTo(4.08, 3);
    expect(contrast.artvinMerkezSlopePrecipMmHr).toBeLessThan(contrast.hopaCoastPrecipMmHr);
    expect(contrast.artvinMerkezSlopePrecipMmHr).toBeGreaterThan(contrast.yusufeliCanyonPrecipMmHr);
    expect(contrast.coastToYusufeliRatio).toBeGreaterThan(5.0);
  });

  it("TR-29 Gümüşhane: Zigana (2032m) & Soğanlı güney yağış gölgesinde Harşit vadisi (1216m) ve Kelkit–Şiran kuru ovasını Zigana Kayak (2050m) kar kuşağından ayırır", () => {
    expect(PROVINCE_SPEC_TR_29.primaryCenter.wmoId).toBe("17088");
    expect(PROVINCE_SPEC_TR_29.primaryCenter.demVerifiedElevationM).toBe(1216);
    expect(PROVINCE_SPEC_TR_29.waterBodies).toEqual([]);
    expect(PROVINCE_SPEC_TR_29.icaoWhitelist).toEqual([]);

    const transect = evaluateGumushaneZiganaShadowTransect({
      upstreamPrecipMmHr: 8.0,
      temp850C: -1.0,
      windFromDirDeg: 350,
      windSpeedMs: 10.0
    });

    expect(transect.ziganaSnowPhase).toBe(true);
    expect(transect.ziganaSki2050mTempC).toBeLessThan(-3.5);
    expect(transect.harsitValley1216mTempC).toBeGreaterThan(2.0);
    expect(transect.ziganaSki2050mPrecipMmHr).toBeCloseTo(12.0, 3);
    expect(transect.harsitValley1216mPrecipMmHr).toBeCloseTo(3.52, 3);
    expect(transect.kelkitPlain1483mPrecipMmHr).toBeLessThan(transect.harsitValley1216mPrecipMmHr);
    expect(
      transect.ziganaSki2050mPrecipMmHr / transect.harsitValley1216mPrecipMmHr
    ).toBeGreaterThan(3.0);
  });

  it("TR-53 Rize: Kaçkar (3937m) duvarında Karayel/Yıldız (310°–30°) fiziksel tavanlı (1.85x) upslope + DEK yağışı, Ayder/Ovit kar fazı ve güneyli +8..+11°C fön patlamasını doğrular", () => {
    expect(PROVINCE_SPEC_TR_53.primaryCenter.wmoId).toBe("17040");
    expect(PROVINCE_SPEC_TR_53.verticalProfileSpec.maxPhysicalPeakM).toBe(3937);
    expect(PROVINCE_SPEC_TR_53.icaoWhitelist).toEqual(["LTFO"]);

    const kackarWall = PROVINCE_SPEC_TR_53.directionalBarriers[0];
    expect(kackarWall.upslopeSpec.windFromSectorDeg).toEqual({ fromDeg: 310, toDeg: 30 });
    expect(kackarWall.upslopeSpec.maxPrecipMultiplierCap).toBe(TR_53_BESPOKE_META.maxPrecipMultiplierCap);
    expect(kackarWall.upslopeSpec.maxPrecipMultiplierCap).toBeGreaterThanOrEqual(1.75);
    expect(kackarWall.upslopeSpec.maxPrecipMultiplierCap).toBeLessThanOrEqual(2.0);

    // 1) Kış Karayel/Yıldız (345°, 16 m/s) + Sıcak Karadeniz (SST=11.2°C, T850=-4.2°C -> ΔT=15.4°C DEK!)
    const dekDeluge = evaluateRizeKackarExtremeRegime({
      windFromDirDeg: 345,
      windSpeedMs: 16,
      basePrecipMmHr: 18.0,
      coastalBaseTempC: 5.2,
      temp850C: -4.2,
      sstC: 11.2
    });
    expect(dekDeluge.dekHeavyActive).toBe(true);
    expect(dekDeluge.foehnWarmingC).toBe(0);
    expect(dekDeluge.coastalPrecipMultiplier).toBe(1.85); // Aşırı hızda dahi 1.85 tavanını aşmaz!
    expect(dekDeluge.coastalAdjustedPrecipMmHr).toBeCloseTo(33.3, 3);
    expect(dekDeluge.ayder1350mSnowPhase).toBe(true);
    expect(dekDeluge.ovit2640mSnowPhase).toBe(true);

    // 2) Güneyli Kaçkar Fön Patlaması (180°, 14 m/s): +8..+11°C ani ısınma ve kuruma!
    const kackarFoehn = evaluateRizeKackarExtremeRegime({
      windFromDirDeg: 180,
      windSpeedMs: 14,
      basePrecipMmHr: 4.0,
      coastalBaseTempC: 12.0,
      temp850C: 8.5,
      sstC: 11.2
    });
    expect(kackarFoehn.foehnWarmingC).toBeGreaterThanOrEqual(8.0);
    expect(kackarFoehn.foehnWarmingC).toBeLessThanOrEqual(11.0);
    expect(kackarFoehn.coastalAdjustedTempC).toBeGreaterThan(20.0);
    expect(kackarFoehn.coastalPrecipMultiplier).toBeLessThan(0.35);
  });

  it("TR-61 Trabzon: Yoroz Burnu Karayel (270°–315°) mikro-gölgesini, Kuzey/Kuzeydoğu doğrudan denizel etkisini ve Değirmendere/Maçka fönünü eksiksiz ayrıştırır", () => {
    expect(PROVINCE_SPEC_TR_61.primaryCenter.wmoId).toBe("17038");
    expect(PROVINCE_SPEC_TR_61.icaoWhitelist).toEqual(["LTCG"]);

    // 1) Batılı/Karayel (295°): Trabzon Merkez (LTCG) Yoroz gölgesinde kalırken Beşikdüzü ve Of tam yağış alır
    const karayelCase = evaluateTrabzonYorozAndFoehnResponse({
      windFromDirDeg: 295,
      windSpeedMs: 12.0,
      basePrecipMmHr: 10.0,
      baseTempC: 9.0
    });
    expect(karayelCase.isYorozShadowActive).toBe(true);
    expect(karayelCase.trabzonMerkezPrecipMmHr).toBeCloseTo(6.6, 3);
    expect(karayelCase.besikduzuPrecipMmHr).toBeCloseTo(16.6, 3);
    expect(karayelCase.ofEastPrecipMmHr).toBeCloseTo(16.6, 3);
    expect(karayelCase.trabzonMerkezPrecipMmHr).toBeLessThan(
      0.5 * karayelCase.besikduzuPrecipMmHr
    );

    // 2) Kuzey/Kuzeydoğu Yıldız-Poyraz (15°): Yoroz gölgesi kalkar, Trabzon Merkez doğrudan denizel upslope alır!
    const poyrazCase = evaluateTrabzonYorozAndFoehnResponse({
      windFromDirDeg: 15,
      windSpeedMs: 11.0,
      basePrecipMmHr: 10.0,
      baseTempC: 7.5
    });
    expect(poyrazCase.isYorozShadowActive).toBe(false);
    expect(poyrazCase.trabzonMerkezPrecipMmHr).toBeCloseTo(14.8, 3);
    expect(poyrazCase.trabzonMerkezPrecipMmHr).toBeGreaterThan(2.0 * karayelCase.trabzonMerkezPrecipMmHr);

    // 3) Güneyli Değirmendere/Maçka Vadi Oluğu Fönü (185°, 13 m/s): +7..+9.2°C sıcak fön
    const degirmendereFoehn = evaluateTrabzonYorozAndFoehnResponse({
      windFromDirDeg: 185,
      windSpeedMs: 13.0,
      basePrecipMmHr: 2.0,
      baseTempC: 13.0
    });
    expect(degirmendereFoehn.trabzonFoehnWarmingC).toBeGreaterThan(7.5);
    expect(degirmendereFoehn.trabzonFoehnWarmingC).toBeLessThanOrEqual(9.2);
    expect(degirmendereFoehn.trabzonAdjustedTempC).toBeGreaterThan(20.5);
  });

  it("METAR & MGM Sınır Güvenlik Duvarı: Batum (UGSB), komşu LTFO/LTCG ve MGM çapraz-il vekil istasyonları (18559, 17775, 18223) %100 izole edilir", async () => {
    // 1) MGM çapraz-il vekil istasyon kilitleri (Trabzon/Şalpazarı 96107 -> 18559 TR-28; Rize/İyidere 95305 -> 17775 TR-61)
    expect(isCrossProvinceProxyMerkez(96107)).toBe(true);
    expect(isCrossProvinceProxyMerkez(95305)).toBe(true);
    expect(isMgmStationOwnedByProvince(18559, "TR-61")).toBe(false);
    expect(isMgmStationOwnedByProvince(18559, "TR-28")).toBe(true);
    expect(isMgmStationOwnedByProvince(17775, "TR-53")).toBe(false);
    expect(isMgmStationOwnedByProvince(17775, "TR-61")).toBe(true);
    expect(isMgmStationOwnedByProvince(18223, "TR-28")).toBe(false);
    expect(isMgmStationOwnedByProvince(18223, "TR-61")).toBe(true);

    // 2) Gürcistan (UGSB Batum, UGKO Kutaisi) ve komşu il ICAO sızıntı kontrolleri
    expect(isIcaoAllowedForProvince("UGSB", "TR-08")).toBe(false);
    expect(isIcaoAllowedForProvince("LTFO", "TR-08")).toBe(false);
    expect(isIcaoAllowedForProvince("LTCG", "TR-29")).toBe(false);
    expect(isIcaoAllowedForProvince("LTCD", "TR-29")).toBe(false);
    expect(isIcaoAllowedForProvince("LTFO", "TR-53")).toBe(true);
    expect(isIcaoAllowedForProvince("LTCG", "TR-53")).toBe(false);
    expect(isIcaoAllowedForProvince("UGSB", "TR-53")).toBe(false);
    expect(isIcaoAllowedForProvince("LTCG", "TR-61")).toBe(true);
    expect(isIcaoAllowedForProvince("LTFO", "TR-61")).toBe(false);

    const nowSec = Math.floor(Date.now() / 1000);
    const makeSeries = (
      icaoId: string,
      lat: number,
      lon: number,
      temp: number
    ): RawMetarRecord[] =>
      [0, 1, 2, 3].map((step) => ({
        icaoId,
        lat,
        lon,
        elev: 10,
        obsTime: nowSec - step * 3600,
        temp,
        dewp: temp - 2.0,
        wspd: 12,
        wdir: 330,
        altim: 1014,
        rawOb: `METAR ${icaoId}`
      }));

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      expect(url).not.toContain("bbox=");
      const payload: RawMetarRecord[] = [
        ...makeSeries("LTFO", 41.1777, 40.8993, 12.4),
        ...makeSeries("LTCG", 40.9951, 39.7897, 13.1),
        ...makeSeries("UGSB", 41.6103, 41.5997, 14.0),
        ...makeSeries("LTCB", 40.967, 38.0805, 13.5)
      ];
      return new Response(JSON.stringify(payload), { status: 200 });
    });

    // Artvin (Kemalpaşa/Hopa — Batum UGSB'ye 15 km!) ve Gümüşhane (Zigana — LTCG'ye 42 km!): 0 ağ çağrısı!
    const artvinMetars = await fetchMetarNetworkHistory(41.4065, 41.433, 4, 100, {
      provinceCode: "TR-08"
    });
    const gumushaneMetars = await fetchMetarNetworkHistory(40.6413, 39.4037, 4, 100, {
      provinceCode: "TR-29"
    });
    expect(artvinMetars).toEqual([]);
    expect(gumushaneMetars).toEqual([]);
    expect(fetchSpy).toHaveBeenCalledTimes(0);

    // Rize (TR-53): Yalnız LTFO döner (UGSB ve LTCG bloklanır)
    const rizeMetars = await fetchMetarNetworkHistory(41.04, 40.5013, 4, 100, {
      provinceCode: "TR-53"
    });
    expect(rizeMetars.map((m) => m.station.icaoId)).toEqual(["LTFO"]);

    // Trabzon (TR-61): Yalnız LTCG döner (LTFO ve LTCB bloklanır)
    const trabzonMetars = await fetchMetarNetworkHistory(40.9985, 39.7649, 4, 100, {
      provinceCode: "TR-61"
    });
    expect(trabzonMetars.map((m) => m.station.icaoId)).toEqual(["LTCG"]);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
