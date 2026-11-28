import { describe, expect, it } from "vitest";
import { computeDailyClimatologyNormals } from "../lib/extended-horizon";
import {
  computeTrDailyClimatologyNormal,
  TR81_CLIMATOLOGY_1991_2020
} from "../lib/provinces/climatology-1991-2020";
import {
  resolveProvinceElevationBandSpecs,
  TR81_HYPSOMETRIC_PROFILES
} from "../lib/provinces/hypsometric-bands-tr81";
import { TR_PLATE_NUMBERS, type TrProvinceCode } from "../lib/provinces/types";
import { buildElevationBandSpecs } from "../lib/snow-and-lightning-engine";

const ALL_PROVINCE_CODES: readonly TrProvinceCode[] = TR_PLATE_NUMBERS.map(
  (p) => `TR-${p}` as TrProvinceCode
);

describe("GEO-03: 81 İl 4-İrtifa Hipsometrik Kesit Tablosu & 1991–2020 WMO/MGM Klimatoloji Motoru", () => {
  it("1. 81 ilin tamamında (TR-01..TR-81) geçerli hipsometrik profil, gerçek Türkçe yer adları ve fiziki tavan bulunur", () => {
    expect(ALL_PROVINCE_CODES).toHaveLength(81);
    expect(Object.keys(TR81_HYPSOMETRIC_PROFILES)).toHaveLength(81);

    for (const code of ALL_PROVINCE_CODES) {
      const p = TR81_HYPSOMETRIC_PROFILES[code];
      expect(p, `${code} profili eksik`).toBeDefined();
      expect(p.provinceCode).toBe(code);
      expect(p.provinceName.length).toBeGreaterThanOrEqual(3);
      expect(p.bands).toHaveLength(4);
      expect(p.bands.map((b) => b.id)).toEqual(["low", "center", "foothill", "summit"]);

      const [b0, b1, b2, b3] = p.bands;
      expect(b0.elevationM, `${code} low >= 0 olmalı`).toBeGreaterThanOrEqual(0);
      expect(b0.elevationM, `${code} low < center`).toBeLessThan(b1.elevationM);
      expect(b1.elevationM, `${code} center < foothill`).toBeLessThan(b2.elevationM);
      expect(b2.elevationM, `${code} foothill < summit`).toBeLessThan(b3.elevationM);
      expect(b3.elevationM, `${code} summit <= maxPhysicalPeakM`).toBeLessThanOrEqual(
        p.maxPhysicalPeakM
      );

      // Orografik temel ağırlık monotonluğu
      expect(b0.baseOroWeight).toBeLessThan(b1.baseOroWeight);
      expect(b1.baseOroWeight).toBe(1.0);
      expect(b1.baseOroWeight).toBeLessThan(b2.baseOroWeight);
      expect(b2.baseOroWeight).toBeLessThan(b3.baseOroWeight);
    }

    // Düşük rölyefli illerde hayali 1300m+ dağ üretilmediğini doğrula
    expect(TR81_HYPSOMETRIC_PROFILES["TR-22"].maxPhysicalPeakM).toBe(678); // Edirne Mahya-Istranca / Koru sınırı
    expect(TR81_HYPSOMETRIC_PROFILES["TR-34"].maxPhysicalPeakM).toBe(537); // İstanbul Aydos Tepesi
    expect(TR81_HYPSOMETRIC_PROFILES["TR-59"].maxPhysicalPeakM).toBe(945); // Tekirdağ Ganos Dağı
    expect(TR81_HYPSOMETRIC_PROFILES["TR-77"].maxPhysicalPeakM).toBe(926); // Yalova Taz Dağı

    // İkonik kayak / dağ / ova illerinin gerçek coğrafi çapaları
    expect(TR81_HYPSOMETRIC_PROFILES["TR-42"].bands.map((b) => b.elevationM)).toEqual([
      905, 1016, 1350, 1950
    ]);
    expect(TR81_HYPSOMETRIC_PROFILES["TR-63"].bands[0].elevationM).toBe(375); // Harran
    expect(TR81_HYPSOMETRIC_PROFILES["TR-63"].bands[1].elevationM).toBe(550); // Şanlıurfa Merkez
    expect(TR81_HYPSOMETRIC_PROFILES["TR-63"].bands[2].elevationM).toBe(820); // Siverek
    expect(TR81_HYPSOMETRIC_PROFILES["TR-63"].maxPhysicalPeakM).toBe(1919); // Karacadağ
    expect(TR81_HYPSOMETRIC_PROFILES["TR-38"].bands[3].labelTr).toContain("Erciyes");
    expect(TR81_HYPSOMETRIC_PROFILES["TR-25"].bands[3].labelTr).toContain("Palandöken");
    expect(TR81_HYPSOMETRIC_PROFILES["TR-14"].bands[3].labelTr).toContain("Kartalkaya");
    expect(TR81_HYPSOMETRIC_PROFILES["TR-41"].bands[3].labelTr).toContain("Kartepe");
    expect(TR81_HYPSOMETRIC_PROFILES["TR-36"].bands[3].labelTr).toContain("Sarıkamış");
    expect(TR81_HYPSOMETRIC_PROFILES["TR-32"].bands[3].labelTr).toContain("Davraz");
    expect(TR81_HYPSOMETRIC_PROFILES["TR-53"].bands[2].labelTr).toContain("Ayder");
    expect(TR81_HYPSOMETRIC_PROFILES["TR-61"].bands[3].labelTr).toContain("Zigana");
  });

  it("2. TR-16 Bursa (15m / 100m / 550m / 1850m) çapalarını ve I-4 orografik özdeşlik sözleşmesini birebir korur", () => {
    const bursaProf = TR81_HYPSOMETRIC_PROFILES["TR-16"];
    expect(bursaProf.bands.map((b) => b.elevationM)).toEqual([15, 100, 550, 1850]);
    expect(bursaProf.bands.map((b) => b.baseOroWeight)).toEqual([0.92, 1.0, 1.18, 1.52]);
    expect(bursaProf.bands.map((b) => b.labelTr)).toEqual([
      "Mudanya / Kıyı",
      "Bursa Merkez (Ova)",
      "Yamaç / Teleferik Etek",
      "Uludağ Oteller / Zirve"
    ]);

    for (const testElev of [15, 100, 155, 550, 1850]) {
      const legacySpecs = buildElevationBandSpecs(40.2308, 29.0133, testElev);
      const resolved = resolveProvinceElevationBandSpecs({
        provinceCode: "TR-16",
        referenceElevationM: testElev
      });

      expect(resolved.map((b) => b.elevationM)).toEqual(legacySpecs.map((b) => b.elevationM));
      expect(resolved.map((b) => b.isReferenceBand)).toEqual(
        legacySpecs.map((b) => b.isReferenceBand)
      );
      expect(resolved.map((b) => b.orographicBoost)).toEqual(
        legacySpecs.map((b) => b.orographicBoost)
      );
    }
  });

  it("3. Fuzz Testi (81 İl × 36 Rakım = 2.916 Kombinasyon, 0..3500m): kesin monotonluk, tekil referans (boost=1.0) ve fiziki tavan", () => {
    const fuzzElevationsM = [
      0, 1, 2, 5, 10, 15, 25, 35, 42, 55, 75, 100, 155, 240, 375, 480, 536, 537,
      550, 610, 677, 678, 679, 850, 905, 1016, 1250, 1450, 1650, 1850, 2000, 2200,
      2543, 2850, 3150, 3500
    ];
    expect(fuzzElevationsM.length).toBeGreaterThanOrEqual(30);

    let combinationsChecked = 0;

    for (const code of ALL_PROVINCE_CODES) {
      const profile = TR81_HYPSOMETRIC_PROFILES[code];
      for (const zInput of fuzzElevationsM) {
        combinationsChecked++;
        const specs = resolveProvinceElevationBandSpecs({
          provinceCode: code,
          referenceElevationM: zInput,
          locationName: "Test Noktası"
        });

        expect(specs).toHaveLength(4);
        expect(specs.map((s) => s.id)).toEqual(["low", "center", "foothill", "summit"]);

        // Kesin monoton irtifa dizilimi: 0 <= b0 < b1 < b2 < b3
        expect(specs[0].elevationM, `${code}@${zInput}m b0 >= 0`).toBeGreaterThanOrEqual(0);
        expect(specs[0].elevationM, `${code}@${zInput}m b0 < b1`).toBeLessThan(specs[1].elevationM);
        expect(specs[1].elevationM, `${code}@${zInput}m b1 < b2`).toBeLessThan(specs[2].elevationM);
        expect(specs[2].elevationM, `${code}@${zInput}m b2 < b3`).toBeLessThan(specs[3].elevationM);

        // Fiziki tavan uyumu: <= Math.max(maxPhysicalPeakM, zRef)
        const expectedCeiling = Math.max(profile.maxPhysicalPeakM, Math.round(zInput));
        expect(specs[3].elevationM, `${code}@${zInput}m ceiling`).toBeLessThanOrEqual(
          expectedCeiling
        );

        // Tam 1 adet referans bandı ve 1.0 orografik özdeşlik
        const refBands = specs.filter((s) => s.isReferenceBand);
        expect(refBands, `${code}@${zInput}m single ref`).toHaveLength(1);
        expect(refBands[0].elevationM).toBe(Math.round(zInput));
        expect(refBands[0].orographicBoost).toBe(1.0);

        // Orografik çarpan monotonluğu (kütle korunumu)
        expect(specs[0].orographicBoost).toBeLessThanOrEqual(specs[1].orographicBoost);
        expect(specs[1].orographicBoost).toBeLessThanOrEqual(specs[2].orographicBoost);
        expect(specs[2].orographicBoost).toBeLessThanOrEqual(specs[3].orographicBoost);
      }
    }

    expect(combinationsChecked).toBe(81 * fuzzElevationsM.length);
  });

  it("4. 81 ilin 1991–2020 klimatolojisinde termodinamik tutarlılık, kış soğuk kutupları, Akdeniz ılımanlığı ve Rize/Konya/Iğdır yağış uçları doğrulanır", () => {
    expect(Object.keys(TR81_CLIMATOLOGY_1991_2020)).toHaveLength(81);

    for (const code of ALL_PROVINCE_CODES) {
      const c = TR81_CLIMATOLOGY_1991_2020[code];
      expect(c, `${code} klimatoloji eksik`).toBeDefined();
      expect(c.provinceCode).toBe(code);
      expect(c.tmaxC).toHaveLength(12);
      expect(c.tminC).toHaveLength(12);
      expect(c.precipMm).toHaveLength(12);
      expect(c.wetDays).toHaveLength(12);

      for (let m = 0; m < 12; m++) {
        expect(c.tmaxC[m], `${code} ay=${m + 1} tmax > tmin`).toBeGreaterThan(c.tminC[m]);
        expect(c.precipMm[m], `${code} ay=${m + 1} precip >= 0`).toBeGreaterThanOrEqual(0);
        expect(c.wetDays[m], `${code} ay=${m + 1} wetDays > 0`).toBeGreaterThan(0);
        expect(c.wetDays[m], `${code} ay=${m + 1} wetDays < 28`).toBeLessThan(28);
      }
    }

    // Ocak (m = 0) Doğu Anadolu soğuk kutbu (< -10°C) vs Akdeniz kıyısı (> +5°C)
    expect(TR81_CLIMATOLOGY_1991_2020["TR-25"].tminC[0]).toBeLessThan(-10); // Erzurum
    expect(TR81_CLIMATOLOGY_1991_2020["TR-36"].tminC[0]).toBeLessThan(-10); // Kars
    expect(TR81_CLIMATOLOGY_1991_2020["TR-75"].tminC[0]).toBeLessThan(-10); // Ardahan
    expect(TR81_CLIMATOLOGY_1991_2020["TR-04"].tminC[0]).toBeLessThan(-10); // Ağrı

    expect(TR81_CLIMATOLOGY_1991_2020["TR-07"].tminC[0]).toBeGreaterThan(5); // Antalya
    expect(TR81_CLIMATOLOGY_1991_2020["TR-33"].tminC[0]).toBeGreaterThan(5); // Mersin
    expect(TR81_CLIMATOLOGY_1991_2020["TR-01"].tminC[0]).toBeGreaterThan(5); // Adana

    // Yıllık toplam yağış gerçekliği: Rize > 2000 mm; Konya & Iğdır < 380 mm
    const sumAnnualMm = (code: TrProvinceCode) =>
      TR81_CLIMATOLOGY_1991_2020[code].precipMm.reduce((acc, v) => acc + v, 0);

    expect(sumAnnualMm("TR-53")).toBeGreaterThan(2000); // Rize (~2304 mm)
    expect(sumAnnualMm("TR-42")).toBeLessThan(380); // Konya (~329 mm)
    expect(sumAnnualMm("TR-76")).toBeLessThan(380); // Iğdır (~261 mm)
  });

  it("5. computeTrDailyClimatologyNormal: TR-16 Bursa WMO 17116 paritesini korur, Rize–Kars / İzmir–Van kış kontrastını ve C¹ sürekliliğini sağlar", () => {
    // TR-16 Bursa (100 m ve 1850 m) tam parite
    const sampleDates: Array<[string, number]> = [
      ["2026-01-15", 15],
      ["2026-04-15", 105],
      ["2026-07-15", 196],
      ["2026-11-28", 332]
    ];

    for (const [dateYmd, doy] of sampleDates) {
      for (const elev of [15, 100, 1850]) {
        const legacy = computeDailyClimatologyNormals({
          lat: 40.2308,
          lon: 29.0133,
          elevationM: elev,
          dateYmd
        });
        const tr16 = computeTrDailyClimatologyNormal({
          provinceCode: "TR-16",
          lat: 40.2308,
          lon: 29.0133,
          elevationM: elev,
          dayOfYear: doy
        });
        expect(tr16.tmaxNormalC).toBe(legacy.normalMaxC);
        expect(tr16.tminNormalC).toBe(legacy.normalMinC);
      }
    }

    // 15 Ocak (DOY = 15): Rize (40 m) ile Kars (1775 m) arasında > 15°C kış farkı
    const rizeJan = computeTrDailyClimatologyNormal({
      provinceCode: "TR-53",
      lat: 41.04,
      lon: 40.5,
      elevationM: 40,
      dayOfYear: 15
    });
    const karsJan = computeTrDailyClimatologyNormal({
      provinceCode: "TR-36",
      lat: 40.6,
      lon: 43.1,
      elevationM: 1775,
      dayOfYear: 15
    });
    expect(rizeJan.tminNormalC - karsJan.tminNormalC).toBeGreaterThan(18);
    expect(rizeJan.tmaxNormalC - karsJan.tmaxNormalC).toBeGreaterThan(14);
    expect(rizeJan.dailyPrecipNormalMm).toBeGreaterThan(karsJan.dailyPrecipNormalMm * 6);

    // 15 Ocak: İzmir (29 m) ile Van (1669 m) kış kontrastı
    const izmirJan = computeTrDailyClimatologyNormal({
      provinceCode: "TR-35",
      lat: 38.39,
      lon: 27.08,
      elevationM: 29,
      dayOfYear: 15
    });
    const vanJan = computeTrDailyClimatologyNormal({
      provinceCode: "TR-65",
      lat: 38.47,
      lon: 43.35,
      elevationM: 1669,
      dayOfYear: 15
    });
    expect(izmirJan.tminNormalC - vanJan.tminNormalC).toBeGreaterThan(13);
    expect(izmirJan.tmaxNormalC - vanJan.tmaxNormalC).toBeGreaterThan(10);

    // Yılbaşı (DOY 365 -> DOY 1) C¹ geçiş sürekliliği (sıçrama yok)
    const ank365 = computeTrDailyClimatologyNormal({
      provinceCode: "TR-06",
      lat: 39.97,
      lon: 32.86,
      elevationM: 891,
      dayOfYear: 365
    });
    const ank001 = computeTrDailyClimatologyNormal({
      provinceCode: "TR-06",
      lat: 39.97,
      lon: 32.86,
      elevationM: 891,
      dayOfYear: 1
    });
    expect(Math.abs(ank365.tmaxNormalC - ank001.tmaxNormalC)).toBeLessThanOrEqual(0.3);
    expect(Math.abs(ank365.tminNormalC - ank001.tminNormalC)).toBeLessThanOrEqual(0.3);
  });
});
