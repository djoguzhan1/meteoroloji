import { describe, expect, it } from "vitest";
import {
  blendHybridParameter,
  classifyPressureTrend,
  computeHybridConfidence,
  computeSolarElevationDeg,
  computeSubsolarPoint,
  formatTemperature,
  formatWindSpeed,
  mapEuropeanAqi,
  mapWmoCodeToLabel,
  mapWmoToPrecipType,
  solarElevationToDaylight,
  windDirectionToCompass
} from "../lib/weather";

describe("weather gerçek astronomik ve meteoroloji yardımcıları", () => {
  it("WMO kodlarını doğru Türkçe meteoroloji etiketine ve yağış tipine çevirir", () => {
    expect(mapWmoCodeToLabel(0)).toBe("Açık");
    expect(mapWmoCodeToLabel(73)).toBe("Kar Yağışlı");
    expect(mapWmoCodeToLabel(95)).toBe("Gök Gürültülü Sağanak");

    expect(mapWmoToPrecipType(0, 0, 0)).toBe("none");
    expect(mapWmoToPrecipType(61, 1.5, 0)).toBe("rain");
    expect(mapWmoToPrecipType(73, 0, 0.8)).toBe("snow");
  });

  it("Avrupa AQI kategorilerini doğru sınıflandırır", () => {
    expect(mapEuropeanAqi(15)).toEqual({ categoryIndex: 1, label: "İyi" });
    expect(mapEuropeanAqi(55)).toEqual({ categoryIndex: 3, label: "Orta" });
    expect(mapEuropeanAqi(120)).toEqual({ categoryIndex: 6, label: "Tehlikeli" });
  });

  it("NOAA güneş yükselme açısı öğlen pozitif, gece negatif ve gün ışığı [0..1] aralığındadır", () => {
    // 21 Haziran Bursa (40.19K, 29.06D) — UTC 10:00 (~yerel güneş öğleni)
    const summerNoon = computeSolarElevationDeg(
      40.19,
      29.06,
      new Date("2026-06-21T10:00:00Z")
    );
    expect(summerNoon).toBeGreaterThan(65);
    expect(solarElevationToDaylight(summerNoon)).toBe(1);

    // Aynı gün gece yarısı (UTC 22:00)
    const summerMidnight = computeSolarElevationDeg(
      40.19,
      29.06,
      new Date("2026-06-21T22:00:00Z")
    );
    expect(summerMidnight).toBeLessThan(-15);
    expect(solarElevationToDaylight(summerMidnight)).toBe(0);
  });

  it("güneş altı noktası (subsolar point) geçerli enlem ve boylam üretir", () => {
    const sub = computeSubsolarPoint(new Date("2026-03-21T12:00:00Z"));
    expect(Math.abs(sub.lat)).toBeLessThan(2);
    expect(Math.abs(sub.lon)).toBeLessThan(2);
  });

  it("3 saatlik barometrik eğilimi doğru sınıflandırır", () => {
    expect(classifyPressureTrend(2.4)).toBe("yükseliyor");
    expect(classifyPressureTrend(-1.8)).toBe("düşüyor");
    expect(classifyPressureTrend(0.3)).toBe("sabit");
  });

  it("rüzgar yönü ve birim dönüşümlerini doğru biçimlendirir", () => {
    expect(windDirectionToCompass(0)).toBe("K");
    expect(windDirectionToCompass(90)).toBe("D");
    expect(windDirectionToCompass(225)).toBe("GB");
    expect(formatTemperature(20, "metric")).toBe("20°");
    expect(formatTemperature(20, "imperial")).toBe("68°F");
    expect(formatWindSpeed(100, "metric")).toBe("100 km/s");
    expect(formatWindSpeed(100, "imperial")).toBe("62 mph");
  });

  it("hibrit ağırlıklı model birleştirme ve eksik model normalize etmesi doğrudur", () => {
    const weights = { ecmwf: 0.5, icon: 0.3, gfs: 0.2 };
    // Tam 3 model: 20*0.5 + 18*0.3 + 22*0.2 = 10 + 5.4 + 4.4 = 19.8
    expect(
      blendHybridParameter({ ecmwf: 20, icon: 18, gfs: 22 }, weights, 0)
    ).toBeCloseTo(19.8, 4);

    // GFS null ise kalan ECMWF (0.5) + ICON (0.3) => toplam 0.8 ağırlıkla normalize edilir
    // (20*0.5 + 16*0.3) / 0.8 = 14.8 / 0.8 = 18.5
    expect(
      blendHybridParameter({ ecmwf: 20, icon: 16, gfs: null }, weights, 0)
    ).toBeCloseTo(18.5, 4);

    // Tüm modeller null ise fallback döner
    expect(
      blendHybridParameter({ ecmwf: null, icon: null, gfs: null }, weights, 14.2)
    ).toBe(14.2);

    // Model uzlaşı skoru: düşük sapmada yüksek, yüksek sapmada düşük
    expect(computeHybridConfidence(0.4, 0.3)).toBeGreaterThanOrEqual(98);
    expect(computeHybridConfidence(5.5, 3.0)).toBeLessThan(65);
  });
});
