import { describe, expect, it } from "vitest";
import {
  blendHybridParameter,
  blendWindDirectionDeg,
  classifyPressureTrend,
  classifyUvIndex,
  computeEquationOfTimeMin,
  computeHybridConfidence,
  computePrecipConsensus,
  computeSolarElevationDeg,
  computeSubsolarPoint,
  computeSynopticSignals,
  describePressureTrendDetail,
  detectDominantPollutant,
  formatLatLon,
  formatTemperature,
  formatWindSpeed,
  mapEuropeanAqi,
  mapWmoCodeToLabel,
  mapWmoToPrecipType,
  solarElevationToDaylight,
  windDirectionToCompass,
  windKmhToBeaufort,
  WMO_PRIOR_WEIGHTS
} from "../lib/weather";

describe("weather WMO, NOAA, EEA ve 5-model hibrit yardımcıları", () => {
  it("WMO kodlarını doğru Türkçe meteoroloji etiketine ve yağış tipine çevirir", () => {
    expect(mapWmoCodeToLabel(0)).toBe("Açık");
    expect(mapWmoCodeToLabel(73)).toBe("Kar Yağışlı");
    expect(mapWmoCodeToLabel(95)).toBe("Gök Gürültülü Sağanak");

    expect(mapWmoToPrecipType(0, 0, 0)).toBe("none");
    expect(mapWmoToPrecipType(61, 1.5, 0)).toBe("rain");
    expect(mapWmoToPrecipType(73, 0, 0.8)).toBe("snow");
  });

  it("resmi EEA EAQI kategorilerini ve baskın kirleticiyi doğru hesaplar", () => {
    expect(mapEuropeanAqi(15)).toEqual({ categoryIndex: 1, label: "İyi" });
    expect(mapEuropeanAqi(55)).toEqual({ categoryIndex: 3, label: "Orta" });
    expect(mapEuropeanAqi(120)).toEqual({ categoryIndex: 6, label: "Aşırı Kötü" });

    const dom = detectDominantPollutant({
      pm25: 68, // Kötü bandı (50-90)
      pm10: 25, // Makul bandı
      ozone: 40, // İyi bandı
      no2: 12,
      so2: 5
    });
    expect(dom.dominantPollutant).toBe("PM2.5");
  });

  it("NOAA Zaman Denklemi (EoT) Kasım'da +13..+17 dk, Şubat'ta -15..-12 dk üretir", () => {
    const novEot = computeEquationOfTimeMin(new Date("2026-11-03T12:00:00Z"));
    expect(novEot).toBeGreaterThan(14);
    expect(novEot).toBeLessThan(17.5);

    const febEot = computeEquationOfTimeMin(new Date("2026-02-12T12:00:00Z"));
    expect(febEot).toBeGreaterThan(-15.5);
    expect(febEot).toBeLessThan(-12.5);
  });

  it("NOAA güneş yükselme açısı öğlen pozitif, gece negatif ve subsolar nokta EoT içerir", () => {
    const summerNoon = computeSolarElevationDeg(
      40.19,
      29.06,
      new Date("2026-06-21T10:00:00Z")
    );
    expect(summerNoon).toBeGreaterThan(68);
    expect(solarElevationToDaylight(summerNoon)).toBe(1);

    const summerMidnight = computeSolarElevationDeg(
      40.19,
      29.06,
      new Date("2026-06-21T22:00:00Z")
    );
    expect(summerMidnight).toBeLessThan(-15);
    expect(solarElevationToDaylight(summerMidnight)).toBe(0);

    const sub = computeSubsolarPoint(new Date("2026-03-21T12:00:00Z"));
    expect(Math.abs(sub.lat)).toBeLessThan(1.5);
    expect(Math.abs(sub.lon)).toBeLessThan(3);
  });

  it("resmi WMO barometrik eğilim, Beaufort ve WHO UV sınıflandırması doğrudur", () => {
    expect(classifyPressureTrend(4.2)).toBe("hızlı yükseliyor");
    expect(classifyPressureTrend(1.8)).toBe("yükseliyor");
    expect(classifyPressureTrend(0.3)).toBe("sabit");
    expect(classifyPressureTrend(-2.0)).toBe("düşüyor");
    expect(classifyPressureTrend(-4.5)).toBe("hızlı düşüyor");
    expect(describePressureTrendDetail(-4.5)).toContain("Hızlı düşüş");

    expect(windKmhToBeaufort(0.5).scale).toBe(0);
    expect(windKmhToBeaufort(25).scale).toBe(4);
    expect(windKmhToBeaufort(68).scale).toBe(8);
    expect(classifyUvIndex(1.5)).toBe("Düşük");
    expect(classifyUvIndex(6.5)).toBe("Yüksek");
  });

  it("vektörel rüzgar yönü ortalaması 350° ile 10° arasında 0° (Kuzey) üretir", () => {
    const equalW = { ecmwfIfs: 0.5, ecmwfAifs: 0.5, icon: 0, ukmo: 0, gfs: 0 };
    const avg = blendWindDirectionDeg(
      { ecmwfIfs: 350, ecmwfAifs: 10, icon: null, ukmo: null, gfs: null },
      equalW,
      180
    );
    expect(avg === 0 || avg === 360).toBe(true);
    expect(windDirectionToCompass(avg)).toBe("K");
    expect(formatTemperature(20, "metric")).toBe("20°");
    expect(formatTemperature(20, "imperial")).toBe("68°F");
    expect(formatWindSpeed(100, "metric")).toBe("100 km/s");
    expect(formatWindSpeed(100, "imperial")).toBe("62 mph");
  });

  it("5-model hibrit ağırlıklı birleştirme, eksik model normalize etme ve yağış uzlaşısı doğrudur", () => {
    const blended = blendHybridParameter(
      { ecmwfIfs: 20, ecmwfAifs: 18, icon: 19, ukmo: 21, gfs: 22 },
      WMO_PRIOR_WEIGHTS.temperature,
      0
    );
    expect(blended).toBeGreaterThan(19);
    expect(blended).toBeLessThan(20.5);

    // Kısmi null modellerde kalan ağırlıklarla doğru normalize
    const partial = blendHybridParameter(
      { ecmwfIfs: 20, ecmwfAifs: null, icon: 16, ukmo: null, gfs: null },
      { ecmwfIfs: 0.6, ecmwfAifs: 0.2, icon: 0.2, ukmo: 0, gfs: 0 },
      0
    );
    // (20*0.6 + 16*0.2) / 0.8 = 15.2 / 0.8 = 19.0
    expect(partial).toBeCloseTo(19.0, 4);

    // 5-model yağış uzlaşısı (3/5 model >= 0.1 mm)
    const cons = computePrecipConsensus({
      ecmwfIfs: 0.8,
      ecmwfAifs: 0,
      icon: 1.4,
      ukmo: 0.3,
      gfs: 0
    });
    expect(cons.agreeingModels).toBe(3);
    expect(cons.totalModels).toBe(5);
    expect(cons.minMm).toBe(0);
    expect(cons.medianMm).toBe(0.3);
    expect(cons.maxMm).toBe(1.4);

    expect(computeHybridConfidence(0.4, 0.3)).toBeGreaterThanOrEqual(98);
    expect(computeHybridConfidence(5.5, 3.0)).toBeLessThan(65);
  });

  it("Güney/Batı yarımküre koordinatları ve fiziksel sinoptik eşik sinyalleri doğrudur", () => {
    expect(formatLatLon(-33.87, 151.21)).toBe("33.87°G · 151.21°D");
    expect(formatLatLon(40.71, -74.01)).toBe("40.71°K · 74.01°B");

    const calm = computeSynopticSignals({
      pressureDelta3h: 0.4,
      temp850hPa: 8,
      thickness5001000Dam: 556,
      windGustsKmh: 22,
      cape: 100,
      isStorm: false,
      europeanAqi: 25,
      dominantPollutant: "PM2.5",
      uvIndex: 2,
      freezingLevelM: 2800,
      temperatureC: 16
    });
    expect(calm).toHaveLength(0);

    const active = computeSynopticSignals({
      pressureDelta3h: -4.2,
      temp850hPa: -2.5,
      thickness5001000Dam: 538,
      windGustsKmh: 65,
      cape: 1200,
      isStorm: true,
      europeanAqi: 72,
      dominantPollutant: "PM2.5",
      uvIndex: 1,
      freezingLevelM: 950,
      temperatureC: 3
    });
    expect(active.length).toBeGreaterThanOrEqual(3);
    expect(active.some((s) => s.id === "pressure-tendency")).toBe(true);
    expect(active.some((s) => s.id === "cold-snow-threshold")).toBe(true);
  });
});
