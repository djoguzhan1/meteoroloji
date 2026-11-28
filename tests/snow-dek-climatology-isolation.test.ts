import { describe, expect, it } from "vitest";
import {
  buildCalibratedSubseasonalOutlook,
  computeDailyClimatologyNormals
} from "../lib/extended-horizon";
import type { WaterBodySpec } from "../lib/provinces/types";
import {
  buildElevationBandSpecs,
  evaluateSeaEffectSnow,
  maxDekStatus,
  simulateCoupledSnowTimeline,
  type SnowSimulationHourInput
} from "../lib/snow-and-lightning-engine";
import type { DailyPoint, DekSnowStatus } from "../lib/weather-types";

function makePolarSnowHour(
  overrides: Partial<SnowSimulationHourInput> & {
    lat: number;
    lon: number;
    elevationM: number;
  }
): SnowSimulationHourInput {
  return {
    timeIso: "2026-12-18T06:00",
    dateYmd: "2026-12-18",
    leadHour: 6,
    temp2mC: -1.6,
    rh2mPct: 90,
    wetBulbC: -2.1,
    windSpeedKmh: 28,
    windGustsKmh: 44,
    windDirDeg: 15,
    cloudCoverPct: 95,
    solarElevationDeg: -12,
    shortwaveWm2: 0,
    precipMmHr: 1.8,
    precipP90MmHr: 2.8,
    precipProbPct: 88,
    rawModelSnowfallCm: 2.0,
    precipPhase: "snow",
    freezingLevelM: 0,
    temp850hPa: -11.0,
    capeJkg: 35,
    seaSurfaceTempC: null,
    ...overrides
  };
}

describe("ARC-06: 81-İl DEK/LES Su Kütlesi Kapısı, 4-Bant Hipsometri ve 16–30 Gün Klimatoloji İzolasyonu", () => {
  it("1. Karasal İllerde Sıfır Sahte DEK: Ankara (TR-06), Eskişehir (TR-26), Kars (TR-36), Sivas ve Konya kuzeyli T850 = -11°C altında dekStatus15d === 'none' üretir", () => {
    const inlandCities = [
      { name: "Ankara", code: "TR-06" as const, lat: 39.9334, lon: 32.8597, elev: 891 },
      { name: "Eskişehir", code: "TR-26" as const, lat: 39.7767, lon: 30.5206, elev: 790 },
      { name: "Kars", code: "TR-36" as const, lat: 40.6013, lon: 43.0975, elev: 1775 },
      { name: "Sivas", code: "TR-58" as const, lat: 39.7477, lon: 37.0179, elev: 1285 },
      { name: "Erzurum", code: "TR-25" as const, lat: 39.9043, lon: 41.2679, elev: 1890 },
      { name: "Konya", code: "TR-42" as const, lat: 37.8716, lon: 32.4846, elev: 1016 },
      { name: "Kayseri", code: "TR-38" as const, lat: 38.7205, lon: 35.4826, elev: 1054 },
      { name: "Diyarbakır", code: "TR-21" as const, lat: 37.9144, lon: 40.2306, elev: 675 }
    ];

    for (const city of inlandCities) {
      // Hem provinceCode otomatik çözümlenirken hem de açıkça verildiğinde 0 sahte DEK!
      const directAuto = evaluateSeaEffectSnow({
        lat: city.lat,
        lon: city.lon,
        seaSurfaceTempC: null,
        temp850hPa: -11.0,
        surfaceTempC: -1.8,
        windSpeedKmh: 30,
        windDirDeg: 10, // Yıldız / Poyraz
        precipMmHr: 2.1
      });
      expect(directAuto.status, `${city.name} auto DEK sızıntısı`).toBe("none");
      expect(directAuto.deltaTSst850C).toBeNull();

      // 15 günlük (15 örnek kış saati) simülasyon özeti: dekStatus15d === "none"
      const hours15d = Array.from({ length: 15 }, (_, d) =>
        makePolarSnowHour({
          lat: city.lat,
          lon: city.lon,
          elevationM: city.elev,
          timeIso: `2026-12-${String(10 + d).padStart(2, "0")}T06:00`,
          dateYmd: `2026-12-${String(10 + d).padStart(2, "0")}`,
          leadHour: d * 24,
          temp850hPa: -11.0,
          windDirDeg: (d * 15) % 70 // 0..60° kuzey/kuzeydoğu
        })
      );

      const simOut = simulateCoupledSnowTimeline({ hours: hours15d });
      const dekStatus15d = simOut.reduce<DekSnowStatus>(
        (acc, h) => maxDekStatus(acc, h.dekStatus),
        "none"
      );
      expect(dekStatus15d, `${city.name} 15d DEK sızıntısı`).toBe("none");
      expect(simOut.every((h) => h.dekDeltaTSst850C === null)).toBe(true);
    }
  });

  it("2. Karadeniz Kıyı İlleri: Zonguldak (TR-67), Samsun (TR-55) ve Rize (TR-53) denizden esen rüzgarda gerçek DEK üretir; güneyli (offshore) rüzgarda ve fetch < 25 km iken kapatır", () => {
    const blackSeaCoasts = [
      { name: "Zonguldak", code: "TR-67" as const, lat: 41.4564, lon: 31.7987, elev: 45, windDeg: 335 },
      { name: "Samsun", code: "TR-55" as const, lat: 41.2867, lon: 36.33, elev: 35, windDeg: 350 },
      { name: "Rize", code: "TR-53" as const, lat: 41.0201, lon: 40.5234, elev: 40, windDeg: 325 }
    ];

    for (const coast of blackSeaCoasts) {
      const onshoreSim = simulateCoupledSnowTimeline({
        hours: [
          makePolarSnowHour({
            lat: coast.lat,
            lon: coast.lon,
            elevationM: coast.elev,
            temp2mC: 0.8,
            wetBulbC: 0.1,
            temp850hPa: -7.5,
            liveWaterTempC: 11.4, // ΔT = 18.9°C >= 16°C -> heavy_dek
            windDirDeg: coast.windDeg,
            windSpeedKmh: 32,
            precipMmHr: 2.4
          })
        ]
      })[0];

      expect(onshoreSim.dekStatus, `${coast.name} onshore DEK`).toBe("heavy_dek");
      expect(onshoreSim.dekDeltaTSst850C).toBeCloseTo(18.9, 1);

      // Güneyli kara rüzgarı (Lodos / Kıble 185°) -> DEK kapalı ("none")
      const offshoreEval = evaluateSeaEffectSnow({
        lat: coast.lat,
        lon: coast.lon,
        seaSurfaceTempC: 11.4,
        temp850hPa: -9.0,
        surfaceTempC: 0.5,
        windSpeedKmh: 30,
        windDirDeg: 185,
        precipMmHr: 2.0
      });
      expect(offshoreEval.status, `${coast.name} offshore Lodos`).toBe("none");
    }

    // Fetch < 25 km küçük gölet/körfez su kütlesinde DEK tetiklenmez
    const tinyPondSpec: WaterBodySpec = {
      id: "SMALL_INLAND_RESERVOIR",
      labelTr: "Küçük Baraj Gölü",
      kind: "fresh_lake",
      mgmMarineStationIds: [],
      sampleCoord: { lat: 39.9, lon: 32.8 },
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 850,
      freezingPointC: 0,
      monthlyWaterTempNormalsC: [5, 5, 6, 9, 14, 19, 22, 22, 19, 14, 9, 6],
      subBasinInfluenceWeights: {},
      onshoreWindSectorDeg: { fromDeg: 300, toDeg: 60 },
      effectiveFetchKm: 14, // < 25 km!
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 11.5,
      dekHeavyDeltaTC: 16.0,
      seaBreezeSpec: {
        activeMonths: [6, 8],
        sectorDeg: { fromDeg: 300, toDeg: 60 },
        maxInlandPenetrationKm: 5,
        maxCoolingAmplitudeC: 0.8
      }
    };

    const shortFetchRes = evaluateSeaEffectSnow({
      lat: 39.93,
      lon: 32.86,
      provinceCode: "TR-06",
      waterBodies: [tinyPondSpec],
      liveWaterTempC: 10.0,
      temp850hPa: -12.0,
      surfaceTempC: -2.0,
      windSpeedKmh: 28,
      windDirDeg: 15,
      precipMmHr: 1.5
    });
    expect(shortFetchRes.status).toBe("none");
  });

  it("3. Van Gölü (1648 m) Yüksek İrtifa Göl-Etkisi Kar (LES): Tatvan (TR-13) ve Van (TR-65) için 850 hPa yerine LST - T700 >= 12°C eşiğini çalıştırır", () => {
    // 1655 m rakımda 850 hPa (~1460 m) yerin altındadır!
    // Ham model yeraltı ekstrapolasyonuyla T850 = +3.5°C verse bile (11.6 - 3.5 = 8.1°C < 13°C),
    // gerçek 700 hPa sıcaklığı T700 = -12.0°C (LST - T700 = 23.6°C >= 12°C) ile kuvvetli göl-etkisi kar yakalanır!
    const tatvanLes = simulateCoupledSnowTimeline({
      hours: [
        makePolarSnowHour({
          lat: 38.502,
          lon: 42.281, // Tatvan (TR-13 Bitlis, Van Gölü batı kıyısı)
          elevationM: 1655,
          temp2mC: -2.2,
          wetBulbC: -2.7,
          windDirDeg: 75, // Van Gölü'nün 110 km doğu ekseninden Tatvan'a esen rüzgar
          windSpeedKmh: 26,
          precipMmHr: 2.2,
          temp850hPa: 3.5, // Yeraltı ekstrapolasyon yanılsaması!
          temp700hPa: -12.0,
          liveWaterTempC: 11.6
        })
      ]
    })[0];

    expect(tatvanLes.dekStatus).toBe("heavy_dek");
    expect(tatvanLes.dekDeltaTSst850C).toBeCloseTo(23.6, 1);
    expect(tatvanLes.airSnowCm).toBeGreaterThan(2.0);

    // Van Merkez / Edremit (TR-65, 1675 m, doğu kıyısı): batılı (265°) göl fetch rüzgarı + temp700hPa verilmediğinde yüzey+lapse eşdeğeri
    const vanFallback700 = evaluateSeaEffectSnow({
      lat: 38.494,
      lon: 43.38,
      elevationM: 1675,
      seaSurfaceTempC: null,
      liveWaterTempC: 11.6,
      temp850hPa: null, // 850 hPa tamamen null olsa bile çalışmalı!
      surfaceTempC: -2.4, // ~3010m (700 hPa) eşdeğeri ~ -10.9°C -> ΔT ~ 22.5°C
      windSpeedKmh: 24,
      windDirDeg: 265,
      precipMmHr: 1.6
    });
    expect(vanFallback700.status).toBe("heavy_dek");
    expect(vanFallback700.deltaTSst850C!).toBeGreaterThan(20);

    // Van Merkez'e doğudan (İran kara sınırı, 95°) esen rüzgar gölden geçmediği için LES üretmez
    const vanLandWind = evaluateSeaEffectSnow({
      lat: 38.494,
      lon: 43.38,
      elevationM: 1675,
      seaSurfaceTempC: null,
      liveWaterTempC: 11.6,
      temp850hPa: -8.0,
      temp700hPa: -12.0,
      surfaceTempC: -2.4,
      windSpeedKmh: 24,
      windDirDeg: 95,
      precipMmHr: 1.6
    });
    expect(vanLandWind.status).toBe("none");
  });

  it("4. 80 İl 4-Rakım Kar Kesiti Bağlantısı: Kayseri Erciyes, Erzurum Palandöken, Edirne <=678m ve TR-16 Bursa bit-özdeşliği", () => {
    const kayseriBands = buildElevationBandSpecs(38.7205, 35.4826, 1054);
    expect(kayseriBands[1].isReferenceBand).toBe(true);
    expect(kayseriBands[1].elevationM).toBe(1054);
    expect(kayseriBands[3].labelTr).toContain("Erciyes");
    expect(kayseriBands[3].elevationM).toBe(2950);

    const edirneBands = buildElevationBandSpecs(41.6771, 26.5557, 42);
    expect(edirneBands[3].elevationM).toBeLessThanOrEqual(678);

    const bursaBands = buildElevationBandSpecs(40.2308, 29.0133, 100);
    expect(bursaBands.map((b) => b.elevationM)).toEqual([15, 100, 550, 1850]);
    expect(bursaBands[0].id).toBe("coast");
    expect(bursaBands[1].labelTr).toBe("Bursa Merkez (17116 · Ova)");
  });

  it("5. extended-horizon 16–30 Gün Alt-Mevsimsel Klimatoloji İzolasyonu: Ocak ayında Antalya (TR-07) ile Erzurum (TR-25) arasında > 15°C gerçek WMO normal farkı kurar", () => {
    const erzurumJanNorm = computeDailyClimatologyNormals({
      lat: 39.9529,
      lon: 41.1897,
      elevationM: 1758,
      dateYmd: "2027-01-18"
    });
    const antalyaJanNorm = computeDailyClimatologyNormals({
      lat: 36.9063,
      lon: 30.799,
      elevationM: 64,
      dateYmd: "2027-01-18"
    });

    expect(antalyaJanNorm.normalMaxC - erzurumJanNorm.normalMaxC).toBeGreaterThan(18);
    expect(antalyaJanNorm.normalMinC - erzurumJanNorm.normalMinC).toBeGreaterThan(19);
    expect(antalyaJanNorm.normalMeanC - erzurumJanNorm.normalMeanC).toBeGreaterThan(18);

    // 16–30. gün buildCalibratedSubseasonalOutlook içinde gerçek il normallerinin taşındığını doğrula
    const dates = Array.from({ length: 30 }, (_, d) =>
      new Date(Date.UTC(2027, 0, 1 + d)).toISOString().slice(0, 10)
    );
    const makeNeutralCalibratedDaily = (tmax: number, tmin: number): DailyPoint[] =>
      dates.slice(0, 15).map((date, idx) => ({
        date,
        dayName: idx === 0 ? "Bugün" : "Pzt",
        tempMax: tmax,
        tempMin: tmin,
        weatherCode: 2,
        condition: "Parçalı Bulutlu",
        precipSum: 0.5,
        precipProbabilityMax: 25,
        windSpeedMax: 12,
        uvIndexMax: 2,
        sunrise: `${date}T08:00`,
        sunset: `${date}T17:30`
      }));

    const mkCols = (val: number) =>
      Array.from({ length: 16 }, () => ({
        weight: 1,
        values: dates.map(() => val)
      }));
    const dryPrecipCols = Array.from({ length: 16 }, () => dates.map(() => 0.2));

    const erzurumSub = buildCalibratedSubseasonalOutlook({
      raw: {
        fetchedAt: "2027-01-01T00:00:00Z",
        dates,
        maxCols: mkCols(-4.0),
        minCols: mkCols(-14.8),
        precipCols: dryPrecipCols
      },
      calibratedDaily: makeNeutralCalibratedDaily(-4.0, -14.8),
      lat: 39.9529,
      lon: 41.1897,
      elevationM: 1758
    });

    const antalyaSub = buildCalibratedSubseasonalOutlook({
      raw: {
        fetchedAt: "2027-01-01T00:00:00Z",
        dates,
        maxCols: mkCols(15.1),
        minCols: mkCols(6.2),
        precipCols: dryPrecipCols
      },
      calibratedDaily: makeNeutralCalibratedDaily(15.1, 6.2),
      lat: 36.9063,
      lon: 30.799,
      elevationM: 64
    });

    expect(erzurumSub).not.toBeNull();
    expect(antalyaSub).not.toBeNull();

    const erzDay16 = erzurumSub!.days[0];
    const antDay16 = antalyaSub!.days[0];
    expect(antDay16.tempNormalMax - erzDay16.tempNormalMax).toBeGreaterThan(15);
    expect(antDay16.tempNormalMin - erzDay16.tempNormalMin).toBeGreaterThan(15);
    expect(erzDay16.tempNormalMin).toBeLessThan(-12);
    expect(antDay16.tempNormalMin).toBeGreaterThan(5);
  });
});
