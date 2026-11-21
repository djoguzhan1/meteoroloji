import { describe, expect, it } from "vitest";
import {
  analyzeConvectiveProfile,
  classifyCapeRisk,
  computeBulkWindShearKt,
  computeLCL,
  computeLclTempK,
  dewPointMagnus,
  equivalentPotentialTemperatureK,
  mixingRatio,
  potentialTemperatureK,
  relativeHumidityFromDewPoint,
  saturationVaporPressure,
  virtualTemperatureK
} from "../lib/thermo-cape";
import type { SoundingLevel } from "../lib/weather-types";

const SAMPLE_UNSTABLE_LEVELS: SoundingLevel[] = [
  { pressure: 1000, altitudeM: 95, temperature: 30, dewPoint: 25, humidity: 75, windSpeedKt: 12, windDirection: 165 },
  { pressure: 925, altitudeM: 760, temperature: 23, dewPoint: 18, humidity: 74, windSpeedKt: 22, windDirection: 185 },
  { pressure: 850, altitudeM: 1500, temperature: 16, dewPoint: 13, humidity: 82, windSpeedKt: 30, windDirection: 205 },
  { pressure: 700, altitudeM: 3080, temperature: 2, dewPoint: -4, humidity: 65, windSpeedKt: 40, windDirection: 235 },
  { pressure: 500, altitudeM: 5680, temperature: -16, dewPoint: -30, humidity: 30, windSpeedKt: 55, windDirection: 255 },
  { pressure: 400, altitudeM: 7340, temperature: -30, dewPoint: -45, humidity: 22, windSpeedKt: 65, windDirection: 260 },
  { pressure: 300, altitudeM: 9320, temperature: -45, dewPoint: -62, humidity: 18, windSpeedKt: 75, windDirection: 265 }
];

const SAMPLE_STABLE_LEVELS: SoundingLevel[] = [
  { pressure: 1000, altitudeM: 160, temperature: 2, dewPoint: -4, humidity: 64, windSpeedKt: 8, windDirection: 350 },
  { pressure: 925, altitudeM: 780, temperature: -1, dewPoint: -8, humidity: 58, windSpeedKt: 12, windDirection: 355 },
  { pressure: 850, altitudeM: 1450, temperature: -4, dewPoint: -12, humidity: 52, windSpeedKt: 15, windDirection: 5 },
  { pressure: 700, altitudeM: 2940, temperature: -13, dewPoint: -24, humidity: 35, windSpeedKt: 22, windDirection: 15 },
  { pressure: 500, altitudeM: 5440, temperature: -27, dewPoint: -42, humidity: 22, windSpeedKt: 30, windDirection: 20 },
  { pressure: 400, altitudeM: 7050, temperature: -38, dewPoint: -54, humidity: 18, windSpeedKt: 36, windDirection: 25 },
  { pressure: 300, altitudeM: 8950, temperature: -51, dewPoint: -66, humidity: 16, windSpeedKt: 42, windDirection: 30 }
];

describe("thermo-cape Bolton (1980) termodinamik motoru", () => {
  it("Bolton (1980) Eq. 10 doygunluk buhar basıncı ve çiy noktası tersi tutarlıdır", () => {
    const es20 = saturationVaporPressure(20);
    // Bolton (1980) Table 1 referansı: e_s(20°C) = 23.37 hPa
    expect(es20).toBeCloseTo(23.37, 1);

    const td = dewPointMagnus(25, 60);
    expect(td).toBeGreaterThan(16.4);
    expect(td).toBeLessThan(17.0);
    const rhBack = relativeHumidityFromDewPoint(25, td);
    expect(rhBack).toBeCloseTo(60, 0);
  });

  it("Bolton (1980) Eq. 22 T_LCL ve Eq. 39 θ_e referans doğruluk sınırları içindedir", () => {
    // T = 20°C, Td = 15°C, P = 1000 hPa
    const tLclK = computeLclTempK(20, 15);
    expect(tLclK).toBeGreaterThan(286.8);
    expect(tLclK).toBeLessThan(287.4);

    const e = saturationVaporPressure(15);
    const w = mixingRatio(e, 1000);
    const theta = potentialTemperatureK(20, 1000);
    const thetaE = equivalentPotentialTemperatureK(20, 1000, w, 15);
    // Bolton Eq.39 referans değeri ~324.0 K (±0.8 K)
    expect(thetaE).toBeGreaterThan(323.0);
    expect(thetaE).toBeLessThan(325.2);
    expect(thetaE).toBeGreaterThan(theta);
  });

  it("sanal, potansiyel ve eşdeğer potansiyel sıcaklık sıralaması doğrudur (Tv < theta < theta_e 850hPa)", () => {
    const w = 0.01;
    const tv = virtualTemperatureK(15, w);
    const theta = potentialTemperatureK(15, 850);
    const thetaE = equivalentPotentialTemperatureK(15, 850, w);
    expect(tv).toBeGreaterThan(288.15);
    expect(theta).toBeGreaterThan(tv);
    expect(thetaE).toBeGreaterThan(theta);
  });

  it("hipsometrik LCL yüksekliği fiziksel aralıktadır", () => {
    const lcl = computeLCL(24, 16, 1000);
    expect(lcl.lclHeightM).toBeGreaterThan(900);
    expect(lcl.lclHeightM).toBeLessThan(1120);
    expect(lcl.lclPressureHpa).toBeLessThan(1000);
    expect(lcl.lclPressureHpa).toBeGreaterThan(850);
  });

  it("0–6 km vektörel rüzgar kırılması (bulk wind shear) yön değişimini doğru hesaplar", () => {
    expect(computeBulkWindShearKt(10, 180, 40, 180)).toBe(30);
    expect(computeBulkWindShearKt(30, 180, 40, 270)).toBe(50);
  });

  it("kararsız profilde yüksek CAPE, negatif LI, dinamik jeopotansiyel lapse rate ve 500–1000 kalınlık üretir", () => {
    const unstable = analyzeConvectiveProfile({
      surfaceTempC: 30,
      surfaceHumidity: 75,
      surfacePressureHpa: 1005,
      levels: SAMPLE_UNSTABLE_LEVELS
    });

    expect(unstable.cape).toBeGreaterThan(1500);
    expect(unstable.liftedIndex).toBeLessThan(-3);
    expect(unstable.lfcPressureHpa).not.toBeNull();
    expect(unstable.elPressureHpa).not.toBeNull();
    expect(unstable.bulkShear06Kt).toBeGreaterThan(40);
    // (2 - (-16)) / ((5680 - 3080)/1000) = 18 / 2.6 = 6.9 °C/km
    expect(unstable.lapseRate700500).toBeCloseTo(6.9, 1);
    // (5680 - 95) / 10 = 558.5 dam
    expect(unstable.thickness5001000Dam).toBeCloseTo(558.5, 1);
  });

  it("soğuk kararlı profil sıfır CAPE ve <=540 dam kar sınırı kalınlığı üretir", () => {
    const stable = analyzeConvectiveProfile({
      surfaceTempC: 2,
      surfaceHumidity: 55,
      surfacePressureHpa: 1020,
      levels: SAMPLE_STABLE_LEVELS
    });

    expect(stable.cape).toBeLessThan(100);
    expect(stable.liftedIndex).toBeGreaterThan(0);
    expect(classifyCapeRisk(stable.cape).label).toBe("Düşük");
    // (5440 - 160) / 10 = 528.0 dam (<= 540 dam kar eşiği)
    expect(stable.thickness5001000Dam).toBeLessThan(540);
  });
});
