import { describe, expect, it } from "vitest";
import {
  buildDemoBundle,
  computeDaylightFactor,
  formatTemperature,
  formatWindSpeed,
  mapEuropeanAqi,
  mapWmoCodeToLabel,
  mapWmoToPrecipType,
  windDirectionToCompass
} from "../lib/weather";

describe("weather veri yardımcıları", () => {
  it("WMO kodlarını doğru Türkçe metin ve yağış tipine çevirir", () => {
    expect(mapWmoCodeToLabel(0)).toBe("Açık / Güneşli");
    expect(mapWmoCodeToLabel(73)).toBe("Karlı");
    expect(mapWmoCodeToLabel(95)).toBe("Gök Gürültülü Fırtına");

    expect(mapWmoToPrecipType(0, 0, 0)).toBe("none");
    expect(mapWmoToPrecipType(61, 1.5, 0)).toBe("rain");
    expect(mapWmoToPrecipType(73, 0, 0.8)).toBe("snow");
  });

  it("Avrupa AQI kategorilerini doğru sınıflandırır", () => {
    expect(mapEuropeanAqi(15)).toEqual({ categoryIndex: 1, label: "İyi" });
    expect(mapEuropeanAqi(55)).toEqual({ categoryIndex: 3, label: "Orta" });
    expect(mapEuropeanAqi(120)).toEqual({ categoryIndex: 6, label: "Tehlikeli" });
  });

  it("gün ışığı eğrisi gece 0, öğlen 1 döndürür", () => {
    expect(computeDaylightFactor(2)).toBe(0);
    expect(computeDaylightFactor(12)).toBeCloseTo(1, 3);
    expect(computeDaylightFactor(22)).toBe(0);
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

  it("demo paketi 48 saatlik tahmin, 7 günlük tahmin ve 7 basınç seviyesi içerir", () => {
    const demo = buildDemoBundle();
    expect(demo.hourly).toHaveLength(48);
    expect(demo.daily).toHaveLength(7);
    expect(demo.sounding).toHaveLength(7);
    expect(demo.airQuality.europeanAqi).toBeGreaterThan(0);
  });
});
