import { describe, expect, it } from "vitest";
import {
  analyzeConvectiveProfile,
  classifyCapeRisk,
  computeLCL,
  dewPointMagnus,
  equivalentPotentialTemperatureK,
  mixingRatio,
  potentialTemperatureK,
  relativeHumidityFromDewPoint,
  saturationVaporPressure,
  STANDARD_PRESSURE_LEVELS,
  virtualTemperatureK
} from "../lib/thermo-cape";

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

  it("kararsız sıcak-nemli alt katman + soğuk üst katman yüksek CAPE ve negatif LI üretir", () => {
    const unstable = analyzeConvectiveProfile({
      surfaceType: "grass",
      surfaceTempC: 30,
      surfaceHumidity: 75,
      surfacePressureHpa: 1005,
      levels: [
        { pressure: 1000, altitudeM: 110, temperature: 30, dewPoint: 25, humidity: 75, windSpeedKt: 12, windDirection: 165 },
        { pressure: 925, altitudeM: 760, temperature: 23, dewPoint: 18, humidity: 74, windSpeedKt: 22, windDirection: 185 },
        { pressure: 850, altitudeM: 1500, temperature: 16, dewPoint: 13, humidity: 82, windSpeedKt: 30, windDirection: 205 },
        { pressure: 700, altitudeM: 3050, temperature: 2, dewPoint: -4, humidity: 65, windSpeedKt: 40, windDirection: 235 },
        { pressure: 500, altitudeM: 5600, temperature: -16, dewPoint: -30, humidity: 30, windSpeedKt: 55, windDirection: 255 },
        { pressure: 400, altitudeM: 7300, temperature: -30, dewPoint: -45, humidity: 22, windSpeedKt: 65, windDirection: 260 },
        { pressure: 300, altitudeM: 9200, temperature: -45, dewPoint: -62, humidity: 18, windSpeedKt: 75, windDirection: 265 }
      ]
    });

    expect(unstable.cape).toBeGreaterThan(1500);
    expect(unstable.liftedIndex).toBeLessThan(-3);
    expect(unstable.lfcPressureHpa).not.toBeNull();
    expect(unstable.elPressureHpa).not.toBeNull();
    expect(unstable.parcelProfile.length).toBeGreaterThan(40);
    expect(unstable.levels).toHaveLength(7);
    expect(unstable.sweatIndex).toBeGreaterThan(200);
  });

  it("kararlı soğuk-kuru profil sıfır veya çok düşük CAPE üretir", () => {
    const stable = analyzeConvectiveProfile({
      surfaceType: "concrete",
      surfaceTempC: 5,
      surfaceHumidity: 35,
      surfacePressureHpa: 1020,
      levels: STANDARD_PRESSURE_LEVELS.map((lvl) => ({
        ...lvl,
        temperature: lvl.pressure === 1000 ? 5 : lvl.temperature + 4,
        dewPoint: lvl.dewPoint - 8
      }))
    });

    expect(stable.cape).toBeLessThan(150);
    expect(stable.liftedIndex).toBeGreaterThan(0);
    expect(classifyCapeRisk(stable.cape).label).toBe("Düşük");
  });
});
