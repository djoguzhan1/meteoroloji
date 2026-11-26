import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildConfidenceBandPath,
  buildHourlyDayGroups,
  buildSmoothCurvePath,
  buildSolarMarkers,
  computeIconPhaseDelaySec,
  detectDiurnalExtrema,
  getPrecipPhaseVisual,
  resolveWeatherGlyphKind
} from "../lib/hourly-meteogram";
import type { DailyPoint, HourlyPoint } from "../lib/weather-types";

function makeMockHour(idx: number, overrides: Partial<HourlyPoint> = {}): HourlyPoint {
  const dayOffset = Math.floor(idx / 24);
  const hourOfDay = idx % 24;
  const dateStr = `2026-11-${String(26 + dayOffset).padStart(2, "0")}`;
  const time = `${dateStr}T${String(hourOfDay).padStart(2, "0")}:00`;
  const temp = Number((12 + Math.sin(((hourOfDay - 9) / 24) * Math.PI * 2) * 4.5).toFixed(1));

  return {
    time,
    hourLabel: `${String(hourOfDay).padStart(2, "0")}:00`,
    dayLabel: dayOffset === 0 ? "Bugün" : dayOffset === 1 ? "Yarın" : `Gün+${dayOffset}`,
    temperature: temp,
    tempP10: Number((temp - 1.5).toFixed(1)),
    tempP90: Number((temp + 1.6).toFixed(1)),
    apparentTemperature: temp - 0.8,
    wetBulbC: temp - 2.4,
    humidity: 68,
    dewPoint: temp - 4.5,
    pressure: 1016,
    windSpeed: 14,
    windGusts: 24,
    windDirection: 215,
    cloudCover: 35,
    visibilityKm: 15,
    uvIndex: hourOfDay >= 9 && hourOfDay <= 16 ? 3 : 0,
    precipitation: 0,
    precipProbability: 5,
    precipConsensus: {
      agreeingModels: 0,
      totalModels: 8,
      minMm: 0,
      medianMm: 0,
      maxMm: 0
    },
    precipType: "none",
    precipPhase: "none",
    snowLineElevationM: 1850,
    rainAccum: 0,
    snowAccum: 0,
    weatherCode: 1,
    condition: "Az Bulutlu",
    isStorm: false,
    stormScore: 5,
    solarElevationDeg: hourOfDay >= 8 && hourOfDay <= 17 ? 24 : -18,
    daylight: hourOfDay >= 8 && hourOfDay <= 17 ? 0.8 : 0,
    cape: 40,
    cin: 0,
    liftedIndex: 4,
    freezingLevelM: 2150,
    temp850hPa: 6.5,
    stabilityGrade: "LOCKED",
    ...overrides
  };
}

describe("Kategori 2 — 17-Varyantlı İkonografi, Monoton Spline ve Sinoptik Meteogram Motoru", () => {
  it("tüm 17 fiziksel meteoroloji ve gece/gündüz varyantını birbirinden ayrık çözümler", () => {
    expect(resolveWeatherGlyphKind({ code: 0, isNight: false })).toBe("clear-day");
    expect(resolveWeatherGlyphKind({ code: 0, isNight: true })).toBe("clear-night");
    expect(resolveWeatherGlyphKind({ code: 1, isNight: false })).toBe("mainly-clear-day");
    expect(resolveWeatherGlyphKind({ code: 1, isNight: true })).toBe("mainly-clear-night");
    expect(resolveWeatherGlyphKind({ code: 2, isNight: false })).toBe("partly-cloudy-day");
    expect(resolveWeatherGlyphKind({ code: 2, isNight: true })).toBe("partly-cloudy-night");
    expect(resolveWeatherGlyphKind({ code: 3, isNight: false })).toBe("overcast");
    expect(resolveWeatherGlyphKind({ code: 45, isNight: true })).toBe("fog");
    expect(resolveWeatherGlyphKind({ code: 48, isNight: false })).toBe("fog");
    expect(resolveWeatherGlyphKind({ code: 53, intensityMm: 0.3 })).toBe("drizzle");
    expect(resolveWeatherGlyphKind({ code: 61, intensityMm: 1.4 })).toBe("rain");
    expect(resolveWeatherGlyphKind({ code: 65, intensityMm: 5.2 })).toBe("heavy-rain");
    expect(
      resolveWeatherGlyphKind({ code: 66, precipPhase: "freezing_rain", intensityMm: 1.5 })
    ).toBe("freezing-rain");
    expect(
      resolveWeatherGlyphKind({ code: 68, precipPhase: "sleet", intensityMm: 1.2 })
    ).toBe("sleet");
    expect(resolveWeatherGlyphKind({ code: 71, precipPhase: "snow", intensityMm: 0.8 })).toBe(
      "snow"
    );
    expect(resolveWeatherGlyphKind({ code: 75, precipPhase: "snow", intensityMm: 3.4 })).toBe(
      "heavy-snow"
    );
    expect(resolveWeatherGlyphKind({ code: 95, intensityMm: 4.0 })).toBe("thunderstorm");
    expect(
      resolveWeatherGlyphKind({ code: 96, precipPhase: "hail", intensityMm: 7.5 })
    ).toBe("hail-storm");
  });

  it("yan yana saat sütunlarına farklı faz gecikmeleri üretir ve prefers-reduced-motion tüm ikon sınıflarını kapsar", () => {
    const delays = new Set([0, 1, 2, 3, 4, 5].map((i) => computeIconPhaseDelaySec(i)));
    expect(delays.size).toBe(6);

    const cssPath = path.resolve(__dirname, "../app/globals.css");
    const css = fs.readFileSync(cssPath, "utf8");
    const reducedBlock = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));
    for (const cls of [
      ".atmos-glyph-sun-rays",
      ".atmos-glyph-star-twinkle",
      ".atmos-glyph-cloud-back",
      ".atmos-glyph-cloud-front",
      ".atmos-glyph-fog-1",
      ".atmos-glyph-drizzle",
      ".atmos-glyph-rain",
      ".atmos-glyph-downpour",
      ".atmos-glyph-snow",
      ".atmos-glyph-blizzard",
      ".atmos-glyph-bolt",
      ".atmos-glyph-hail"
    ]) {
      expect(reducedBlock).toContain(cls);
    }
    expect(css).not.toContain("drop-shadow");
  });

  it("monoton Catmull-Rom Bezier eğrisi keskin cephe düşüşlerinde fizik dışı aşım yapmaz ve P10-P90 zarfını kapatır", () => {
    const stepPoints = [
      { x: 0, y: 120 },
      { x: 68, y: 120 },
      { x: 136, y: 180 },
      { x: 204, y: 180 }
    ];
    const pathD = buildSmoothCurvePath(stepPoints);
    expect(pathD.startsWith("M0.0,120.0")).toBe(true);
    expect(pathD).toContain("C");

    // Tüm y koordinatlarının [120, 180] aralığında kaldığını doğrula (sıfır overshoot!)
    const nums = [...pathD.matchAll(/,(-?\d+\.\d+)/g)].map((m) => Number(m[1]));
    expect(nums.length).toBeGreaterThanOrEqual(7);
    for (const y of nums) {
      expect(y).toBeGreaterThanOrEqual(120);
      expect(y).toBeLessThanOrEqual(180);
    }

    const bandD = buildConfidenceBandPath([
      { x: 34, yHigh: 110, yLow: 140 },
      { x: 102, yHigh: 115, yLow: 148 },
      { x: 170, yHigh: 125, yLow: 160 }
    ]);
    expect(bandD.startsWith("M34.0,110.0")).toBe(true);
    expect(bandD.endsWith("Z")).toBe(true);
  });

  it("72 saatlik seriden gün gruplarını, astronomik kesirli gün doğumu/batımı konumlarını ve ekstremumları çıkarır", () => {
    const hourly = Array.from({ length: 48 }, (_, i) => makeMockHour(i));
    const daily: DailyPoint[] = [
      {
        date: "2026-11-26",
        dayName: "Bugün",
        tempMax: 16.5,
        tempMin: 7.5,
        weatherCode: 61,
        condition: "Yağmurlu",
        precipSum: 4.2,
        precipProbabilityMax: 80,
        precipPhase: "rain",
        windSpeedMax: 24,
        uvIndexMax: 3,
        sunrise: "2026-11-26T08:15",
        sunset: "2026-11-26T17:45"
      },
      {
        date: "2026-11-27",
        dayName: "Yarın",
        tempMax: 15.0,
        tempMin: 6.0,
        weatherCode: 1,
        condition: "Az Bulutlu",
        precipSum: 0,
        precipProbabilityMax: 10,
        precipPhase: "none",
        windSpeedMax: 18,
        uvIndexMax: 3,
        sunrise: "2026-11-27T08:16",
        sunset: "2026-11-27T17:44"
      }
    ];

    const groups = buildHourlyDayGroups(hourly, daily);
    expect(groups).toHaveLength(2);
    expect(groups[0].startIndex).toBe(0);
    expect(groups[0].endIndex).toBe(23);
    expect(groups[1].startIndex).toBe(24);
    expect(groups[1].shortDate).toBe("27 Kas");

    const markers = buildSolarMarkers(hourly, daily);
    expect(markers).toHaveLength(4);
    // 08:15 -> 8 + 15/60 = 8.25; 17:45 -> 17 + 45/60 = 17.75
    expect(markers[0].kind).toBe("sunrise");
    expect(markers[0].fractionalIndex).toBeCloseTo(8.25, 2);
    expect(markers[1].kind).toBe("sunset");
    expect(markers[1].fractionalIndex).toBeCloseTo(17.75, 2);

    const extrema = detectDiurnalExtrema(hourly);
    expect(extrema.size).toBeGreaterThanOrEqual(2);
    expect([...extrema.values()]).toContain("max");
    expect([...extrema.values()]).toContain("min");

    expect(getPrecipPhaseVisual("freezing_rain").label).toBe("Donan Yğm");
    expect(getPrecipPhaseVisual("sleet").label).toBe("K.Karışık");
    expect(getPrecipPhaseVisual("hail").label).toBe("Dolu");
  });
});
