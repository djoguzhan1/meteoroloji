import { describe, expect, it } from "vitest";
import {
  analyzeConvectiveProfile,
  classifyCapeRisk,
  computeBulkWindShearKt,
  computeLCL,
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
  { pressure: 1000, altitudeM: 110, temperature: 30, dewPoint: 25, humidity: 75, windSpeedKt: 12, windDirection: 165 },
  { pressure: 925, altitudeM: 760, temperature: 23, dewPoint: 18, humidity: 74, windSpeedKt: 22, windDirection: 185 },
  { pressure: 850, altitudeM: 1500, temperature: 16, dewPoint: 13, humidity: 82, windSpeedKt: 30, windDirection: 205 },
  { pressure: 700, altitudeM: 3050, temperature: 2, dewPoint: -4, humidity: 65, windSpeedKt: 40, windDirection: 235 },
  { pressure: 500, altitudeM: 5600, temperature: -16, dewPoint: -30, humidity: 30, windSpeedKt: 55, windDirection: 255 },
  { pressure: 400, altitudeM: 7300, temperature: -30, dewPoint: -45, humidity: 22, windSpeedKt: 65, windDirection: 260 },
  { pressure: 300, altitudeM: 9200, temperature: -45, dewPoint: -62, humidity: 18, windSpeedKt: 75, windDirection: 265 }
];

const SAMPLE_STABLE_LEVELS: SoundingLevel[] = [
  { pressure: 1000, altitudeM: 110, temperature: 5, dewPoint: -4, humidity: 52, windSpeedKt: 8, windDirection: 350 },
  { pressure: 925, altitudeM: 760, temperature: 4, dewPoint: -6, humidity: 48, windSpeedKt: 12, windDirection: 355 },
  { pressure: 850, altitudeM: 1500, temperature: 2, dewPoint: -10, humidity: 40, windSpeedKt: 15, windDirection: 5 },
  { pressure: 700, altitudeM: 3050, temperature: -6, dewPoint: -22, humidity: 28, windSpeedKt: 22, windDirection: 15 },
  { pressure: 500, altitudeM: 5600, temperature: -20, dewPoint: -38, humidity: 20, windSpeedKt: 30, windDirection: 20 },
  { pressure: 400, altitudeM: 7300, temperature: -32, dewPoint: -50, humidity: 18, windSpeedKt: 36, windDirection: 25 },
  { pressure: 300, altitudeM: 9200, temperature: -48, dewPoint: -64, humidity: 16, windSpeedKt: 42, windDirection: 30 }
];

describe("thermo-cape meteoroloji termodinamik motoru", () => {
  it("Magnus çiy noktası ve bağıl nem ters dönüşümü tutarlıdır", () => {
    const td = dewPointMagnus(25, 60);
    expect(td).toBeGreaterThan(16);
    expect(td).toBeLessThan(17.5);
    const rhBack = relativeHumidityFromDewPoint(25, td);
    expect(rhBack).toBeCloseTo(60, 0);
  });

  it("doygunluk buhar basıncı ve karışım oranı fiziksel aralıktadır", () => {
    const es20 = saturationVaporPressure(20);
    expect(es20).toBeCloseTo(23.38, 0);
    const w = mixingRatio(es20 * 0.5, 1000);
    expect(w).toBeGreaterThan(0.006);
    expect(w).toBeLessThan(0.009);
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

  it("LCL yüksekliği sıcaklık-çiy noktası farkıyla orantılıdır", () => {
    const lcl = computeLCL(24, 16, 1000);
    expect(lcl.lclHeightM).toBeCloseTo(1000, -1);
    expect(lcl.lclPressureHpa).toBeLessThan(1000);
    expect(lcl.lclPressureHpa).toBeGreaterThan(800);
  });

  it("0–6 km vektörel rüzgar kırılması (bulk wind shear) yön değişimini doğru hesaplar", () => {
    // Aynı yönde 10 kt -> 40 kt = 30 kt fark
    expect(computeBulkWindShearKt(10, 180, 40, 180)).toBe(30);
    // Dik yönde 30 kt (güney) -> 40 kt (batı) = 50 kt vektör farkı
    expect(computeBulkWindShearKt(30, 180, 40, 270)).toBe(50);
  });

  it("kararsız sıcak-nemli alt katman + soğuk üst katman yüksek CAPE, negatif LI, shear ve lapse rate üretir", () => {
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
    expect(unstable.parcelProfile.length).toBeGreaterThan(40);
    expect(unstable.levels).toHaveLength(7);
    expect(unstable.sweatIndex).toBeGreaterThan(200);
    expect(unstable.bulkShear06Kt).toBeGreaterThan(40);
    expect(unstable.lapseRate700500).toBeGreaterThan(6.5);
  });

  it("kararlı soğuk-kuru profil sıfır veya çok düşük CAPE üretir", () => {
    const stable = analyzeConvectiveProfile({
      surfaceTempC: 5,
      surfaceHumidity: 35,
      surfacePressureHpa: 1020,
      levels: SAMPLE_STABLE_LEVELS
    });

    expect(stable.cape).toBeLessThan(150);
    expect(stable.liftedIndex).toBeGreaterThan(0);
    expect(classifyCapeRisk(stable.cape).label).toBe("Düşük");
  });
});
