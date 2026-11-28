import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { computeHorizonModelSummary } from "../components/ModelComparisonChart";
import SkewTCanvas, { resolveSkewTMarkerCollisions } from "../components/SkewTCanvas";
import { CORE_MODEL_KEYS } from "../lib/model-registry";
import {
  analyzeConvectiveProfile,
  computeStationSurfacePressureHpa
} from "../lib/thermo-cape";
import {
  formatElevation,
  formatLapseRate,
  formatPressure,
  formatTempDelta
} from "../lib/weather-client";
import type {
  CoreModelKey,
  ModelSeriesPoint,
  SoundingLevel
} from "../lib/weather-types";

function makeStandardSynopticLevels(opts?: {
  tempShiftC?: number;
  shearBoost?: boolean;
}): SoundingLevel[] {
  const shift = opts?.tempShiftC ?? 0;
  const shear = Boolean(opts?.shearBoost);
  return [
    {
      pressure: 1000,
      altitudeM: 140,
      temperature: 22 + shift,
      dewPoint: 16 + shift,
      humidity: 69,
      windSpeedKt: shear ? 18 : 10,
      windDirection: shear ? 165 : 200
    },
    {
      pressure: 925,
      altitudeM: 795,
      temperature: 17 + shift,
      dewPoint: 13 + shift,
      humidity: 77,
      windSpeedKt: shear ? 30 : 15,
      windDirection: shear ? 190 : 210
    },
    {
      pressure: 850,
      altitudeM: 1505,
      temperature: 12 + shift,
      dewPoint: 8 + shift,
      humidity: 76,
      windSpeedKt: shear ? 40 : 20,
      windDirection: shear ? 215 : 220
    },
    {
      pressure: 700,
      altitudeM: 3090,
      temperature: 1 + shift,
      dewPoint: -6 + shift,
      humidity: 60,
      windSpeedKt: shear ? 52 : 28,
      windDirection: shear ? 240 : 235
    },
    {
      pressure: 500,
      altitudeM: 5700,
      temperature: -16 + shift,
      dewPoint: -26 + shift,
      humidity: 42,
      windSpeedKt: shear ? 68 : 38,
      windDirection: shear ? 265 : 250
    },
    {
      pressure: 400,
      altitudeM: 7340,
      temperature: -28 + shift,
      dewPoint: -38 + shift,
      humidity: 36,
      windSpeedKt: shear ? 78 : 45,
      windDirection: shear ? 270 : 255
    },
    {
      pressure: 300,
      altitudeM: 9340,
      temperature: -43 + shift,
      dewPoint: -53 + shift,
      humidity: 30,
      windSpeedKt: shear ? 90 : 54,
      windDirection: shear ? 275 : 260
    }
  ];
}

function buildMultiModelSeries360h(): {
  temp2m: ModelSeriesPoint[];
  temp850: ModelSeriesPoint[];
  precip: ModelSeriesPoint[];
} {
  const baseMs = Date.parse("2026-11-27T12:00:00Z");
  const temp2m: ModelSeriesPoint[] = [];
  const temp850: ModelSeriesPoint[] = [];
  const precip: ModelSeriesPoint[] = [];

  for (let h = 0; h < 360; h++) {
    const dt = new Date(baseMs + h * 3600_000);
    const iso = dt.toISOString().slice(0, 16);
    const hourLabel = iso.slice(11, 16);
    const dayLabel = h < 24 ? "Bugün" : `G+${Math.floor(h / 24)}`;

    // Doğal vade sınırları: meteofrance yalnızca ilk 114 saat (0..113), ukmo ilk 168 saat (0..167)
    const hasMeteofrance = h < 114;
    const hasUkmo = h < 168;
    const baseT2m = Number((12 + Math.sin(h / 12) * 3).toFixed(1));
    const baseT850 = h === 42 ? -4.2 : Number((3.5 - (h % 24) * 0.1).toFixed(1));

    // h === 90 anında gfs modeli +12.0°C ayrışma yaratır; diğer aktif modeller 2.0°C bantta uzlaşır
    const gfsOutlier = h === 90 ? baseT2m + 12.0 : baseT2m + 1.2;

    temp2m.push({
      time: iso,
      hourLabel,
      dayLabel,
      ecmwfIfs: baseT2m,
      ecmwfAifs: Number((baseT2m + 0.6).toFixed(1)),
      icon: Number((baseT2m + 1.4).toFixed(1)),
      ukmo: hasUkmo ? Number((baseT2m + 2.0).toFixed(1)) : null,
      meteofrance: hasMeteofrance ? Number((baseT2m + 0.8).toFixed(1)) : null,
      gfs: Number(gfsOutlier.toFixed(1)),
      gem: Number((baseT2m + 1.0).toFixed(1)),
      jma: Number((baseT2m + 1.6).toFixed(1))
    });

    temp850.push({
      time: iso,
      hourLabel,
      dayLabel,
      ecmwfIfs: h === 220 ? -9.5 : baseT850,
      ecmwfAifs: h === 220 ? -8.8 : baseT850,
      icon: baseT850,
      ukmo: hasUkmo ? baseT850 : null,
      meteofrance: hasMeteofrance ? baseT850 : null,
      gfs: h === 220 ? -11.0 : baseT850,
      gem: baseT850,
      jma: baseT850
    });

    precip.push({
      time: iso,
      hourLabel,
      dayLabel,
      ecmwfIfs: 0.2,
      ecmwfAifs: 0.2,
      icon: 0.1,
      ukmo: hasUkmo ? 0.25 : null,
      meteofrance: hasMeteofrance ? 0.5 : null, // 114 * 0.5 = 57.0 mm
      gfs: 0.3,
      gem: 0.15,
      jma: 0.1
    });
  }

  return { temp2m, temp850, precip };
}

describe("Modeller & Sondaj (Skew-T, Hipsometrik Psfc, Çoklu Parsel, STP ve Kısa Vade Dürüstlüğü) Değişmezleri", () => {
  it("1. Deniz seviyesi geriye dönük uyumluluğu: elevationM verilmediğinde 1000 ve 925 hPa korunur, Psfc MSLP değerine eşittir", () => {
    const levels = makeStandardSynopticLevels({ tempShiftC: 5 });
    const seaLevelResult = analyzeConvectiveProfile({
      surfaceTempC: 28,
      surfaceHumidity: 74,
      surfacePressureHpa: 1013.2,
      levels
    });

    expect(seaLevelResult.stationElevationM).toBe(0);
    expect(seaLevelResult.surfacePressureHpa).toBeCloseTo(1013.2, 1);
    expect(seaLevelResult.levels.map((l) => l.pressure)).toEqual([
      1000, 925, 850, 700, 500, 400, 300
    ]);
    expect(seaLevelResult.levels[0].isSurface).toBeUndefined();
    expect(seaLevelResult.cape).toBeGreaterThan(500);
    expect(seaLevelResult.lfcPressureHpa).not.toBeNull();
  });

  it("2. Ankara (890 m, 1016 hPa MSLP): Psfc ~905..922 hPa bandındadır; 1000 ve 925 hPa yeraltı izobarları süzülüp ilk satır isSurface (890 m) olur", () => {
    const levels = makeStandardSynopticLevels();
    const ankara = analyzeConvectiveProfile({
      surfaceTempC: 18,
      surfaceHumidity: 52,
      surfacePressureHpa: 1016,
      elevationM: 890,
      surfaceWindSpeedKmh: 22,
      surfaceWindDirection: 230,
      levels
    });

    expect(ankara.stationElevationM).toBe(890);
    expect(ankara.surfacePressureHpa).toBeGreaterThanOrEqual(905);
    expect(ankara.surfacePressureHpa).toBeLessThanOrEqual(922);

    const pressures = ankara.levels.map((l) => l.pressure);
    expect(pressures).not.toContain(1000);
    expect(pressures).not.toContain(925);
    expect(pressures.slice(1)).toEqual([850, 700, 500, 400, 300]);

    expect(ankara.levels[0].isSurface).toBe(true);
    expect(ankara.levels[0].altitudeM).toBe(890);
    expect(ankara.levels[0].pressure).toBeCloseTo(ankara.surfacePressureHpa, 1);
    for (const lvl of ankara.levels.slice(1)) {
      expect(lvl.pressure).toBeLessThan(ankara.surfacePressureHpa);
      expect(lvl.altitudeM).toBeGreaterThan(890);
    }
  });

  it("3. Uludağ (1850 m, 1018 hPa MSLP): eski 850 hPa kilidi kalkmıştır (~802..822 hPa), 1000/925/850 hPa süzülür ve 500–1000 dam sinoptik kalınlık bozulmaz", () => {
    const levels = makeStandardSynopticLevels({ tempShiftC: -6 });
    const seaRef = analyzeConvectiveProfile({
      surfaceTempC: 16,
      surfaceHumidity: 65,
      surfacePressureHpa: 1018,
      levels
    });

    const uludag = analyzeConvectiveProfile({
      surfaceTempC: 6,
      surfaceHumidity: 78,
      surfacePressureHpa: 1018,
      elevationM: 1850,
      surfaceWindSpeedKmh: 36,
      surfaceWindDirection: 30,
      levels
    });

    expect(uludag.stationElevationM).toBe(1850);
    expect(uludag.surfacePressureHpa).toBeGreaterThanOrEqual(802);
    expect(uludag.surfacePressureHpa).toBeLessThanOrEqual(822);
    expect(uludag.surfacePressureHpa).toBeLessThan(850);

    // Doğrudan computeStationSurfacePressureHpa ile de eski >= 850 hPa kilidinin olmadığı doğrulanır
    const rawPsfc = computeStationSurfacePressureHpa({
      surfaceTempC: 6,
      surfaceHumidity: 78,
      surfacePressureHpa: 1018,
      elevationM: 1850,
      levels
    });
    expect(rawPsfc).toBeGreaterThanOrEqual(802);
    expect(rawPsfc).toBeLessThanOrEqual(822);

    const pressures = uludag.levels.map((l) => l.pressure);
    expect(pressures).not.toContain(1000);
    expect(pressures).not.toContain(925);
    expect(pressures).not.toContain(850);
    expect(pressures.slice(1)).toEqual([700, 500, 400, 300]);

    expect(uludag.levels[0].isSurface).toBe(true);
    expect(uludag.levels[0].altitudeM).toBe(1850);

    // Sinoptik 500–1000 hPa kalınlığı filtreleme öncesi ham seviyelerden hesaplandığı için bozulmaz (5700 - 140 = 5560 m = 556.0 dam)
    expect(uludag.thickness5001000Dam).toBe(556);
    expect(uludag.thickness5001000Dam).toBe(seaRef.thickness5001000Dam);
  });

  it("4. Kararlı Kış Enversiyonunda CIN === 0 Değişmezliği: LFC === null ve CAPE === 0 iken sahte -1500 J/kg üretilmez ve -0 oluşmaz", () => {
    const winterInversionLevels: SoundingLevel[] = [
      { pressure: 1000, altitudeM: 150, temperature: -2.0, dewPoint: -4.5, humidity: 83, windSpeedKt: 6, windDirection: 40 },
      { pressure: 925, altitudeM: 780, temperature: 3.5, dewPoint: -2.0, humidity: 67, windSpeedKt: 12, windDirection: 70 },
      { pressure: 850, altitudeM: 1480, temperature: 4.0, dewPoint: -5.0, humidity: 52, windSpeedKt: 18, windDirection: 110 },
      { pressure: 700, altitudeM: 3030, temperature: -3.5, dewPoint: -15.0, humidity: 40, windSpeedKt: 26, windDirection: 230 },
      { pressure: 500, altitudeM: 5580, temperature: -18.0, dewPoint: -30.0, humidity: 34, windSpeedKt: 42, windDirection: 260 },
      { pressure: 400, altitudeM: 7190, temperature: -29.0, dewPoint: -41.0, humidity: 30, windSpeedKt: 52, windDirection: 265 },
      { pressure: 300, altitudeM: 9160, temperature: -42.0, dewPoint: -54.0, humidity: 26, windSpeedKt: 65, windDirection: 270 }
    ];

    const stableWinter = analyzeConvectiveProfile({
      surfaceTempC: -2.5,
      surfaceHumidity: 84,
      surfacePressureHpa: 1024,
      elevationM: 100,
      levels: winterInversionLevels
    });

    expect(stableWinter.lfcPressureHpa).toBeNull();
    expect(stableWinter.elPressureHpa).toBeNull();
    expect(stableWinter.cape).toBe(0);
    expect(stableWinter.mucape).toBe(0);
    expect(stableWinter.mlcape).toBe(0);

    expect(stableWinter.cin).toBe(0);
    expect(stableWinter.mucin).toBe(0);
    expect(stableWinter.mlcin).toBe(0);

    // IEEE-754 +0 kontrolü (-0 kesinlikle sızmamalı)
    expect(Object.is(stableWinter.cin, 0)).toBe(true);
    expect(Object.is(stableWinter.mucin, 0)).toBe(true);
    expect(Object.is(stableWinter.mlcin, 0)).toBe(true);
    expect(Object.is(stableWinter.parcels.sb.cin, 0)).toBe(true);
    expect(Object.is(stableWinter.parcels.mu.cin, 0)).toBe(true);
    expect(Object.is(stableWinter.parcels.ml.cin, 0)).toBe(true);
  });

  it("5. Çoklu Parsel (MU | SB | ML) Yükseltilmiş Kararsızlık: yüzey 4°C / 850 hPa 16°C profilinde MUCAPE > SBCAPE ve parcels.mu.cin === result.mucin sağlanır", () => {
    const elevatedInstabilityLevels: SoundingLevel[] = [
      { pressure: 1000, altitudeM: 110, temperature: 4.0, dewPoint: 2.0, humidity: 87, windSpeedKt: 10, windDirection: 60 },
      { pressure: 925, altitudeM: 765, temperature: 9.5, dewPoint: 7.5, humidity: 87, windSpeedKt: 24, windDirection: 150 },
      { pressure: 850, altitudeM: 1490, temperature: 16.0, dewPoint: 14.8, humidity: 93, windSpeedKt: 38, windDirection: 195 },
      { pressure: 700, altitudeM: 3080, temperature: 2.0, dewPoint: -1.5, humidity: 78, windSpeedKt: 46, windDirection: 225 },
      { pressure: 500, altitudeM: 5690, temperature: -18.5, dewPoint: -26.0, humidity: 52, windSpeedKt: 62, windDirection: 250 },
      { pressure: 400, altitudeM: 7310, temperature: -31.5, dewPoint: -40.0, humidity: 44, windSpeedKt: 74, windDirection: 260 },
      { pressure: 300, altitudeM: 9290, temperature: -46.5, dewPoint: -55.0, humidity: 38, windSpeedKt: 86, windDirection: 265 }
    ];

    const elevated = analyzeConvectiveProfile({
      surfaceTempC: 4.0,
      surfaceHumidity: 86,
      surfacePressureHpa: 1014,
      elevationM: 100,
      levels: elevatedInstabilityLevels
    });

    expect(elevated.parcels.sb.cape).toBe(0);
    expect(elevated.parcels.mu.cape).toBeGreaterThan(elevated.parcels.sb.cape);
    expect(elevated.parcels.mu.cape).toBeGreaterThan(900);
    expect(elevated.muParcelPressureHpa).toBe(850);

    // Kanonik parsel-üst alan eşitlikleri
    expect(elevated.parcels.mu.cape).toBe(elevated.mucape);
    expect(elevated.parcels.mu.cin).toBe(elevated.mucin);
    expect(elevated.parcels.sb.cape).toBe(elevated.cape);
    expect(elevated.parcels.sb.cin).toBe(elevated.cin);
    expect(elevated.parcels.ml.cape).toBe(elevated.mlcape);
    expect(elevated.parcels.ml.cin).toBe(elevated.mlcin);
    expect(elevated.mucape).toBeGreaterThanOrEqual(
      Math.max(elevated.cape, elevated.mlcape)
    );

    // MU 850 hPa'dan kalksa bile envProfile tam Psfc -> 300 hPa aralığını kesintisiz kapsar
    expect(elevated.envProfile[0].pressure).toBeCloseTo(
      elevated.surfacePressureHpa,
      0
    );
    expect(
      elevated.envProfile[elevated.envProfile.length - 1].pressure
    ).toBe(300);
  });

  it("6. Süper-Hücre Kinematikleri (STP & SCP): saat yönünde dönen güçlü rüzgar kesmeli kararsız profilde STP > 0, kararlı profilde STP === 0 çıkar", () => {
    const supercellLevels = makeStandardSynopticLevels({
      tempShiftC: 7,
      shearBoost: true
    });
    // Düşük MLLCL (< 1000m) ve yüksek MLCAPE için alt tabakayı nemli tut
    supercellLevels[0].temperature = 29;
    supercellLevels[0].dewPoint = 24;
    supercellLevels[1].temperature = 23;
    supercellLevels[1].dewPoint = 19.5;
    supercellLevels[2].temperature = 17;
    supercellLevels[2].dewPoint = 13;

    const supercell = analyzeConvectiveProfile({
      surfaceTempC: 30,
      surfaceHumidity: 74,
      surfacePressureHpa: 1010,
      elevationM: 120,
      surfaceWindSpeedKt: 18,
      surfaceWindDirection: 150,
      levels: supercellLevels
    });

    expect(supercell.mlcape).toBeGreaterThan(1500);
    expect(supercell.bulkShear06Kt).toBeGreaterThanOrEqual(45);
    expect(supercell.srh01).toBeGreaterThan(80);
    expect(supercell.srh03).toBeGreaterThanOrEqual(supercell.srh01);
    expect(supercell.scp).toBeGreaterThan(1);
    expect(supercell.stp).toBeGreaterThan(0);

    // Kararlı soğuk profilde STP ve SCP tam 0 olmalıdır
    const coldStableLevels = makeStandardSynopticLevels({ tempShiftC: -22 });
    const coldStable = analyzeConvectiveProfile({
      surfaceTempC: -4,
      surfaceHumidity: 60,
      surfacePressureHpa: 1022,
      elevationM: 890,
      levels: coldStableLevels
    });
    expect(coldStable.mlcape).toBe(0);
    expect(coldStable.stp).toBe(0);
    expect(coldStable.scp).toBe(0);
  });

  it("7. 0°C Donma Sınırı (freezingLevelM): pozitif profilde doğru enterpolasyon yapar, tamamen <= 0°C kolonda istasyon rakımına kenetlenir", () => {
    const levels = makeStandardSynopticLevels(); // 700 hPa (3090 m): +1°C, 500 hPa (5700 m): -16°C
    const positiveProfile = analyzeConvectiveProfile({
      surfaceTempC: 21,
      surfaceHumidity: 58,
      surfacePressureHpa: 1015,
      elevationM: 100,
      levels
    });

    // +1°C (3090 m) -> -16°C (5700 m) geçişinde 0°C sınırı: 3090 + (1/17)*(5700-3090) ≈ 3244 m
    expect(positiveProfile.freezingLevelM).not.toBeNull();
    expect(positiveProfile.freezingLevelM!).toBeGreaterThan(3150);
    expect(positiveProfile.freezingLevelM!).toBeLessThan(3350);
    expect(positiveProfile.freezingPressureHpa).not.toBeNull();
    expect(positiveProfile.freezingPressureHpa!).toBeLessThan(700);
    expect(positiveProfile.freezingPressureHpa!).toBeGreaterThan(660);

    // Tüm seviyeleri <= 0°C olan dondurucu kış profilinde freezingLevelM === stationElevationM
    const subZeroLevels = makeStandardSynopticLevels({ tempShiftC: -26 });
    const subZeroResult = analyzeConvectiveProfile({
      surfaceTempC: -6,
      surfaceHumidity: 80,
      surfacePressureHpa: 1020,
      elevationM: 890,
      levels: subZeroLevels
    });
    expect(subZeroResult.freezingLevelM).toBe(890);
    expect(subZeroResult.freezingPressureHpa).toBeCloseTo(
      subZeroResult.surfacePressureHpa,
      1
    );
  });

  it("8. computeHorizonModelSummary Kısa Vade Dürüstlüğü: 360 saatlik seride ilk 114 saat verisi olan meteofrance için sahte 0 yerine (114s) kapsamı raporlar", () => {
    const { temp2m, temp850, precip } = buildMultiModelSeries360h();

    const summary360 = computeHorizonModelSummary({
      temp2m,
      temp850,
      precip,
      horizonHours: 360,
      unit: "metric"
    });

    const mfPrecip360 = summary360.precipByModel.meteofrance;
    expect(mfPrecip360.validCount).toBe(114);
    expect(mfPrecip360.isPartialHorizon).toBe(true);
    expect(mfPrecip360.rawValue).toBe(57);
    expect(mfPrecip360.formatted).toBe("57.0 mm (114s)");

    const mfMin850 = summary360.min850ByModel.meteofrance;
    expect(mfMin850.validCount).toBe(114);
    expect(mfMin850.isPartialHorizon).toBe(true);
    // null değerlerin Math.min içinde 0'a dönüşmesi engellenir; gerçek -4.2°C ve (114s) raporlanır
    expect(mfMin850.rawValue).toBe(-4.2);
    expect(mfMin850.formatted).toBe("-4.2°C (114s)");

    // UKMO (168s) de 360s ufkunda kısmi kapsam etiketi alır, tam 360s modelleri (ECMWF IFS) almaz
    expect(summary360.precipByModel.ukmo.validCount).toBe(168);
    expect(summary360.precipByModel.ukmo.formatted).toContain("(168s)");
    expect(summary360.precipByModel.ecmwfIfs.validCount).toBe(360);
    expect(summary360.precipByModel.ecmwfIfs.isPartialHorizon).toBe(false);
    expect(summary360.precipByModel.ecmwfIfs.formatted).not.toContain("(360s)");

    // 72 saatlik ufukta meteofrance tam kapsamlıdır (validCount === 72), kısmi etiket almaz
    const summary72 = computeHorizonModelSummary({
      temp2m,
      temp850,
      precip,
      horizonHours: 72,
      unit: "metric"
    });
    expect(summary72.precipByModel.meteofrance.validCount).toBe(72);
    expect(summary72.precipByModel.meteofrance.isPartialHorizon).toBe(false);
    expect(summary72.precipByModel.meteofrance.formatted).toBe("36.0 mm");
  });

  it("9. computeHorizonModelSummary Model Gizleme ve Yayılım Birim Bütünlüğü: gizlenen model maxSpreadTemp2m hesabından düşer, Imperial fark ×1.8 ile ölçeklenir (+32 eklenmez)", () => {
    const { temp2m, temp850, precip } = buildMultiModelSeries360h();

    const allVisibleMetric = computeHorizonModelSummary({
      temp2m,
      temp850,
      precip,
      horizonHours: 168,
      unit: "metric"
    });
    expect(allVisibleMetric.maxSpreadTemp2mC).toBe(12);
    expect(allVisibleMetric.maxSpreadFormatted).toBe("12.0°C");

    // Imperial modda 12.0°C yayılım 21.6°F olmalıdır (asla +32 eklenip 53.6°F olmaz!)
    const allVisibleImperial = computeHorizonModelSummary({
      temp2m,
      temp850,
      precip,
      horizonHours: 168,
      unit: "imperial"
    });
    expect(allVisibleImperial.maxSpreadTemp2mC).toBe(12);
    expect(allVisibleImperial.maxSpreadFormatted).toBe("21.6°F");
    expect(allVisibleImperial.precipByModel.meteofrance.formatted).toBe(
      "2.24 in (114s)"
    );

    // Aykırı GFS modeli gizlendiğinde maxSpreadTemp2mC 12.0°C'den 2.0°C'ye (3.6°F) düşer
    const visibleWithoutGfs = Object.fromEntries(
      CORE_MODEL_KEYS.map((k) => [k, k !== "gfs"])
    ) as Record<CoreModelKey, boolean>;

    const filteredSummary = computeHorizonModelSummary({
      temp2m,
      temp850,
      precip,
      horizonHours: 168,
      visibleModels: visibleWithoutGfs,
      unit: "imperial"
    });
    expect(filteredSummary.activeModelKeys).not.toContain("gfs");
    expect(filteredSummary.maxSpreadTemp2mC).toBe(2);
    expect(filteredSummary.maxSpreadFormatted).toBe("3.6°F");

    // Tek model görünür kaldığında yayılım hesaplanamaz (null / "—")
    const singleModelOnly = Object.fromEntries(
      CORE_MODEL_KEYS.map((k) => [k, k === "ecmwfIfs"])
    ) as Record<CoreModelKey, boolean>;
    const singleSummary = computeHorizonModelSummary({
      temp2m,
      temp850,
      precip,
      horizonHours: 72,
      visibleModels: singleModelOnly,
      unit: "metric"
    });
    expect(singleSummary.maxSpreadTemp2mC).toBeNull();
    expect(singleSummary.maxSpreadFormatted).toBe("—");
  });

  it("10. CapeLabView, SkewTCanvas ve ModelComparisonChart: Imperial birim bütünlüğü (inHg, ft, °F, mph, °F/kft), ResizeObserver ve touch-pan-y sözleşmelerini sağlar", () => {
    const analysis = analyzeConvectiveProfile({
      surfaceTempC: 20,
      surfaceHumidity: 60,
      surfacePressureHpa: 1015,
      elevationM: 890,
      levels: makeStandardSynopticLevels()
    });

    // Birim formatlayıcı sözleşmeleri
    expect(formatPressure(analysis.surfacePressureHpa, "imperial")).toContain(
      "inHg"
    );
    expect(formatElevation(analysis.stationElevationM, "imperial")).toBe(
      "2920 ft"
    );
    expect(formatLapseRate(6.5, "imperial")).toBe("3.6°F/kft");
    expect(
      formatTempDelta(-4.0, "imperial", {
        decimals: 1,
        signed: true,
        showUnit: true
      })
    ).toBe("-7.2°F");

    // SkewTCanvas SSR çıktısı Imperial birimde inHg ve touch-pan-y içerir
    const skewHtml = renderToStaticMarkup(
      React.createElement(SkewTCanvas, {
        analysis,
        parcelMode: "mu",
        unit: "imperial"
      })
    );
    expect(skewHtml).toContain("inHg");
    expect(skewHtml).toContain("touch-pan-y");
    expect(skewHtml).toContain("MU Parsel");

    // Etiket çarpışma çözücüsü yakın irtifaları çakıştırmaz
    const markers = resolveSkewTMarkerCollisions([
      { label: "32°F", color: "#38bdf8", rawY: 210 },
      { label: "LFC", color: "#ef4444", rawY: 213 },
      { label: "LCL", color: "#f59e0b", rawY: 216 }
    ]);
    expect(markers[1].labelY - markers[0].labelY).toBeGreaterThanOrEqual(14);
    expect(markers[2].labelY - markers[1].labelY).toBeGreaterThanOrEqual(14);

    // Kaynak kod sözleşmeleri: CapeLabView, SkewTCanvas ve ModelComparisonChart
    const repoRoot = path.resolve(__dirname, "..");
    const capeLabSrc = fs.readFileSync(
      path.join(repoRoot, "components/CapeLabView.tsx"),
      "utf-8"
    );
    const skewSrc = fs.readFileSync(
      path.join(repoRoot, "components/SkewTCanvas.tsx"),
      "utf-8"
    );
    const modelChartSrc = fs.readFileSync(
      path.join(repoRoot, "components/ModelComparisonChart.tsx"),
      "utf-8"
    );

    expect(capeLabSrc).toContain('unit === "imperial" ? "inHg" : "hPa"');
    expect(capeLabSrc).toContain('unit === "imperial" ? "ft" : "m"');
    expect(capeLabSrc).toContain('unit === "imperial" ? "32°F" : "0°C"');
    expect(capeLabSrc).toContain("formatLapseRate(analysis.lapseRate700500, unit)");
    expect(capeLabSrc).toContain("formatTempDelta(analysis.liftedIndex, unit");

    expect(skewSrc).toContain("new ResizeObserver");
    expect(skewSrc).toContain("touch-pan-y");
    expect(skewSrc).toContain('unit === "imperial" ? "inHg" : "hPa"');
    expect(skewSrc).toContain('unit === "imperial" ? "32°F" : "0°C"');

    expect(modelChartSrc).toContain("new ResizeObserver");
    expect(modelChartSrc).toContain("touch-pan-y");
  });
});
