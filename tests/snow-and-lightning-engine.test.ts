import { describe, expect, it } from "vitest";
import { BURSA_REFERENCE_STATIONS, mapMeshToMetarObservations, runBursaObservationQC } from "../lib/bursa-mesh";
import { scanPolarConvectiveCells } from "../lib/radar-nowcast";
import { BURSA_WMO_17116_ELEVATION_M, BURSA_WMO_17116_LAT, BURSA_WMO_17116_LON, DEFAULT_LOCATION, normalizeCanonicalBursaLocation } from "../lib/weather-client";
import {
  buildLightningProximityRadar,
  computeDynamicSnowLiquidRatio,
  evaluateHourLightningPhysics,
  evaluateSeaEffectSnow,
  simulateCoupledSnowTimeline,
  solveBourgouinSnowLine
} from "../lib/snow-and-lightning-engine";
import { buildCalibratedSubseasonalOutlook } from "../lib/extended-horizon";
import type { DailyPoint, SoundingLevel } from "../lib/weather-types";

describe("Hava Sekmesi — Keskin Kar Mikrofiziği (Havada vs Zeminde) & 3-Halkalı Şimşek Motoru", () => {
  it("1. Bourgouin erime enerjisi: sıcak burunlu donan yağmuru (FZRA) kardan ayırır ve şiddetli yağışta kar sınırını diyabatik soğumayla indirir", () => {
    // Yüksekte +4°C sıcak kama (850 hPa), yüzeyde -2.0°C sığ soğuk kama -> Donan Yağmur!
    const warmNoseLevels: SoundingLevel[] = [
      { pressure: 925, altitudeM: 760, temperature: -1.8, dewPoint: -2.2, humidity: 96, windSpeedKt: 15, windDirection: 40 },
      { pressure: 850, altitudeM: 1480, temperature: 4.2, dewPoint: 3.8, humidity: 97, windSpeedKt: 25, windDirection: 200 },
      { pressure: 700, altitudeM: 3020, temperature: -4.5, dewPoint: -5.5, humidity: 92, windSpeedKt: 32, windDirection: 220 },
      { pressure: 500, altitudeM: 5560, temperature: -19.0, dewPoint: -22.0, humidity: 78, windSpeedKt: 45, windDirection: 235 }
    ];

    const fzra = solveBourgouinSnowLine({
      elevationM: 155,
      surfaceTempC: -2.0,
      surfaceRhPct: 95,
      precipMmHr: 1.8,
      freezingLevelM: 2100,
      temp850hPa: 4.2,
      levels: warmNoseLevels
    });

    expect(fzra.meltingEnergyJkg).toBeGreaterThan(15);
    expect(fzra.refreezeEnergyJkg).toBeLessThanOrEqual(-14);
    expect(fzra.columnPhase).toBe("freezing_rain");
    expect(fzra.iceSurvivalFraction).toBe(0);

    // Şiddetli yağış (6.0 mm/sa) vs hafif yağış (0.3 mm/sa) diyabatik kar sınırı düşüşü
    const lightSnowLine = solveBourgouinSnowLine({
      elevationM: 155,
      surfaceTempC: 4.5,
      surfaceRhPct: 86,
      precipMmHr: 0.3,
      freezingLevelM: 1150,
      temp850hPa: -1.5
    });
    const heavyBurstSnowLine = solveBourgouinSnowLine({
      elevationM: 155,
      surfaceTempC: 4.5,
      surfaceRhPct: 86,
      precipMmHr: 6.0,
      freezingLevelM: 1150,
      temp850hPa: -1.5
    });

    expect(heavyBurstSnowLine.snowLineElevationM).toBeLessThan(
      lightSnowLine.snowLineElevationM - 95
    );
  });

  it("2. Dinamik Kuchera + DGZ (-12..-18°C) SLR: Kristal Toz Kar (~16-20:1) ile Ağır Islak Kar (~5-8:1) ayrımını doğru kurar", () => {
    const dgzLevels: SoundingLevel[] = [
      { pressure: 925, altitudeM: 740, temperature: -6.5, dewPoint: -7.0, humidity: 96, windSpeedKt: 12, windDirection: 20 },
      { pressure: 850, altitudeM: 1440, temperature: -11.2, dewPoint: -11.6, humidity: 97, windSpeedKt: 16, windDirection: 15 },
      { pressure: 700, altitudeM: 2940, temperature: -15.4, dewPoint: -15.6, humidity: 99, windSpeedKt: 20, windDirection: 10 },
      { pressure: 500, altitudeM: 5420, temperature: -29.0, dewPoint: -33.0, humidity: 72, windSpeedKt: 28, windDirection: 355 }
    ];

    const powder = computeDynamicSnowLiquidRatio({
      surfaceTempC: -3.4,
      surfaceWetBulbC: -3.8,
      surfaceWindKmh: 12,
      temp850hPa: -11.2,
      capeJkg: 20,
      isDekActive: false,
      precipPhase: "snow",
      levels: dgzLevels
    });

    expect(powder.dgzBoostActive).toBe(true);
    expect(powder.slr).toBeGreaterThanOrEqual(15.5);
    expect(powder.snowQualityTr).toBe("Kristal Toz Kar");

    const wetSnow = computeDynamicSnowLiquidRatio({
      surfaceTempC: 1.1,
      surfaceWetBulbC: 0.4,
      surfaceWindKmh: 18,
      temp850hPa: -2.0,
      capeJkg: 0,
      isDekActive: false,
      precipPhase: "snow"
    });

    expect(wetSnow.slr).toBeLessThanOrEqual(8.5);
    expect(wetSnow.snowQualityTr).toBe("Ağır Islak Kar");
  });

  it("3. Havada vs. Çim/Toprakta vs. Asfaltta Kar Enerji Bütçesi: sıcak zeminde hafif kar erirken, yoğun kar gizli ısıyla asfaltı soğutup tutunur", () => {
    // 24 saatlik ılık ve güneşli geçmiş (+11°C, 360 W/m2)
    const warmAntecedent = Array.from({ length: 24 }, (_, i) => ({
      temp2mC: 10.5,
      shortwaveWm2: i >= 8 && i <= 16 ? 360 : 0,
      cloudCoverPct: 25,
      precipMmHr: 0
    }));

    // Saat 0-1: Hafif gündüz kar geçişi (0.45 mm/s, +0.6°C) -> Havada kar var, sıcak asfaltta 0 cm!
    // Saat 2-6: Gece yoğun kar fırtınası (3.4 mm/s, -1.6°C) -> Gizli erime ısısı zemini soğutur ve hem çimde hem asfaltta örtü birikir!
    const simHours = Array.from({ length: 7 }, (_, idx) => {
      const isLightWarmStart = idx < 2;
      return {
        timeIso: `2026-12-18T${String(14 + idx).padStart(2, "0")}:00`,
        dateYmd: "2026-12-18",
        leadHour: idx,
        elevationM: 155,
        lat: 40.19,
        lon: 29.06,
        temp2mC: isLightWarmStart ? 0.6 : -1.8,
        rh2mPct: 92,
        wetBulbC: isLightWarmStart ? 0.1 : -2.2,
        windSpeedKmh: isLightWarmStart ? 14 : 28,
        windGustsKmh: isLightWarmStart ? 22 : 44,
        windDirDeg: 25,
        cloudCoverPct: 95,
        solarElevationDeg: isLightWarmStart ? 18 : -15,
        shortwaveWm2: isLightWarmStart ? 95 : 0,
        precipMmHr: isLightWarmStart ? 0.45 : 3.4,
        precipP90MmHr: isLightWarmStart ? 0.8 : 4.8,
        precipProbPct: 90,
        rawModelSnowfallCm: isLightWarmStart ? 0.4 : 3.6,
        precipPhase: "snow" as const,
        freezingLevelM: isLightWarmStart ? 420 : 0,
        temp850hPa: isLightWarmStart ? -4.5 : -9.5,
        capeJkg: 40,
        seaSurfaceTempC: 11.5
      };
    });

    const res = simulateCoupledSnowTimeline({
      hours: simHours,
      antecedentHours: warmAntecedent
    });

    // İlk saatte havada kar yağmasına rağmen sıcak asfaltta tutmaz (0 cm)
    expect(res[0].airSnowCm).toBeGreaterThanOrEqual(0.3);
    expect(res[0].roadSnowCm).toBe(0);
    expect(res[0].groundSnowCm).toBeLessThan(res[0].airSnowCm);

    // Yoğun gece tipisinin sonunda hem toprakta hem asfaltta ciddi kar örtüsü oluşur
    const last = res[res.length - 1];
    expect(last.cumulativeAirSnowCm).toBeGreaterThan(15);
    expect(last.snowpackDepthCm).toBeGreaterThan(10);
    expect(last.roadSnowDepthCm).toBeGreaterThan(6);
    expect(last.blowingSnowRisk).toBe("drifting");
  });

  it("4. 4-Bant Rakım Kar Kesiti & DEK + Asfalt Gizli Buzlanma: Bursa ovada +5°C yağmur yağarken Uludağ (1850m) yoğun kar alır", () => {
    const dek = evaluateSeaEffectSnow({
      lat: 40.2,
      lon: 29.06,
      seaSurfaceTempC: 12.2,
      temp850hPa: -5.4,
      surfaceTempC: 1.2,
      windSpeedKmh: 26,
      windDirDeg: 30, // Poyraz
      precipMmHr: 1.9
    });
    expect(dek.status).toBe("heavy_dek");
    expect(dek.deltaTSst850C).toBeCloseTo(17.6, 1);

    // Bursa merkezde +5.2°C yağmur, ardından gece açık gökyüzünde radyatif soğuma (-0.8°C) -> Gizli Buzlanma!
    const bursaRainThenFreeze = [
      {
        timeIso: "2026-12-20T18:00",
        dateYmd: "2026-12-20",
        leadHour: 0,
        elevationM: 155,
        lat: 40.19,
        lon: 29.06,
        temp2mC: 5.2,
        rh2mPct: 88,
        wetBulbC: 4.3,
        windSpeedKmh: 16,
        windGustsKmh: 26,
        windDirDeg: 15,
        cloudCoverPct: 92,
        solarElevationDeg: -8,
        shortwaveWm2: 0,
        precipMmHr: 3.2,
        precipP90MmHr: 4.5,
        precipProbPct: 92,
        rawModelSnowfallCm: 0,
        precipPhase: "rain" as const,
        freezingLevelM: 1120,
        temp850hPa: -2.2,
        capeJkg: 20,
        seaSurfaceTempC: 11.0
      },
      ...Array.from({ length: 4 }, (_, k) => ({
        timeIso: `2026-12-20T${String(19 + k).padStart(2, "0")}:00`,
        dateYmd: "2026-12-20",
        leadHour: k + 1,
        elevationM: 155,
        lat: 40.19,
        lon: 29.06,
        temp2mC: -1.6 - k * 0.6,
        rh2mPct: 82,
        wetBulbC: -2.4 - k * 0.6,
        windSpeedKmh: 6,
        windGustsKmh: 10,
        windDirDeg: 30,
        cloudCoverPct: 8, // Açık gece -> kuvvetli uzun dalga radyatif soğuma!
        solarElevationDeg: -35,
        shortwaveWm2: 0,
        precipMmHr: 0,
        precipP90MmHr: 0,
        precipProbPct: 5,
        rawModelSnowfallCm: 0,
        precipPhase: "none" as const,
        freezingLevelM: 0,
        temp850hPa: -6.0,
        capeJkg: 0,
        seaSurfaceTempC: 11.0
      }))
    ];

    const out = simulateCoupledSnowTimeline({ hours: bursaRainThenFreeze });
    const rainyHour = out[0];
    expect(rainyHour.airSnowCm).toBe(0);
    // Aynı saatte Uludağ Oteller / Zirve (1850 m) bandı saf kar alır!
    const uludagBand = rainyHour.elevationBands.find((b) => b.id === "summit");
    expect(uludagBand).toBeDefined();
    expect(uludagBand!.elevationM).toBe(1850);
    expect(uludagBand!.airSnowCm).toBeGreaterThan(3.5);
    expect(uludagBand!.groundSnowCm).toBeGreaterThan(2.5);

    // Yağmur sonrası açık gecede ıslak asfalt film tabakası donarak `black_ice` üretir
    const hasBlackIce = out.slice(1).some((h) => h.icingRisk === "black_ice");
    expect(hasBlackIce).toBe(true);
  });

  it("5. Şimşek Fiziği & 3-Halkalı Yakınlık Radarı: sıcak tepeli yalancı alarmları bastırır, Thundersnow'u yakalar ve 15/40/100 km hücre ETA hesaplar", () => {
    // Sıcak tepeli sığ bulut (bulut tepesi -4°C > -8°C) -> CAPE olsa bile graupel çarpışması yok!
    const warmShallow = evaluateHourLightningPhysics({
      temp2mC: 19,
      wetBulbC: 16,
      precipMmHr: 2.0,
      precipProbPct: 75,
      precipPhase: "rain",
      capeJkg: 450,
      liftedIndex: -1.2,
      lpiJkg: 0,
      stormLightningProbPct: 28,
      wmoCode: 61,
      temp850hPa: 11,
      dekStatus: "none",
      dekDeltaTC: null,
      windGustsKmh: 28,
      soundingLevels: [
        { pressure: 850, altitudeM: 1500, temperature: 11, dewPoint: 9, humidity: 88, windSpeedKt: 15, windDirection: 210 },
        { pressure: 700, altitudeM: 3080, temperature: -3.5, dewPoint: -5, humidity: 85, windSpeedKt: 20, windDirection: 220 },
        { pressure: 500, altitudeM: 5720, temperature: -4.2, dewPoint: -28, humidity: 18, windSpeedKt: 30, windDirection: 240 }
      ]
    });
    expect(warmShallow.lightningProbPct).toBeLessThanOrEqual(6);
    expect(warmShallow.flashesPerMin).toBe(0);

    // Kuvvetli DEK + dik lapse rate -> Gökgürültülü Kar (Thundersnow)!
    const thundersnow = evaluateHourLightningPhysics({
      temp2mC: -0.4,
      wetBulbC: -0.9,
      precipMmHr: 2.8,
      precipProbPct: 92,
      precipPhase: "snow",
      capeJkg: 185,
      liftedIndex: -1.1,
      lpiJkg: 1.6,
      stormLightningProbPct: 24,
      wmoCode: 75,
      temp850hPa: -9.5,
      dekStatus: "heavy_dek",
      dekDeltaTC: 18.2,
      windGustsKmh: 54
    });
    expect(thundersnow.isThundersnow).toBe(true);
    expect(thundersnow.lightningProbPct).toBeGreaterThanOrEqual(45);
    expect(thundersnow.cgFractionPct).toBeGreaterThanOrEqual(36);

    // 512x512 radar dBZ ızgarasında 12 km (Acil) ve 32 km (Yaklaşan) iki konvektif hücre testi
    const W = 512;
    const H = 512;
    const grid = new Float32Array(W * H);
    const cx = 256;
    const cy = 256;
    const metersPerPx = 466; // Zoom 7 @ 512px

    // Hücre 1: 11 km Kuzeybatıda 51 dBZ şiddetli çekirdek (`dx = -17, dy = -17` -> ~11.2 km)
    grid[(cy - 17) * W + (cx - 17)] = 51;
    // Hücre 2: 30 km Güneybatıda 46 dBZ merkeze doğru ilerleyen çekirdek (`dx = -45, dy = +45` -> ~29.7 km)
    grid[(cy + 45) * W + (cx - 45)] = 46;

    const scanned = scanPolarConvectiveCells({
      grid,
      width: W,
      height: H,
      targetPx: cx,
      targetPy: cy,
      metersPerPixel: metersPerPx,
      vxPxPerMin: 1.2, // GB'den KD'ye (merkeze doğru) ilerliyor
      vyPxPerMin: -1.2,
      minDbzThreshold: 34
    });

    expect(scanned.length).toBeGreaterThanOrEqual(2);
    expect(scanned[0].distanceKm).toBeLessThanOrEqual(15);

    const prox = buildLightningProximityRadar({
      updatedAtIso: "2026-11-26T12:00:00Z",
      radarAvailable: true,
      currentRadarDbz: 42,
      radarCells: scanned,
      hour0Lightning: thundersnow,
      surfaceTempC: -0.4,
      dekStatus: "heavy_dek"
    });

    expect(prox.safetyLevel).toBe("shelter_now");
    expect(prox.rings[0].activeCellCount).toBeGreaterThanOrEqual(1);
    expect(prox.rings[1].activeCellCount).toBeGreaterThanOrEqual(1);
    expect(prox.approachingEtaMin).not.toBeNull();
  });

  it("6. 16-30 Gün Alt-Mevsimsel Olasılıksal Kar Ufku: soğuk hava dalgasında her tarih için P50-P90 havada ve zeminde kar üretir", () => {
    const dates = Array.from({ length: 30 }, (_, d) => {
      const dt = new Date(Date.UTC(2027, 0, 1 + d));
      return dt.toISOString().slice(0, 10);
    });
    const calibratedDaily: DailyPoint[] = dates.slice(0, 15).map((date, idx) => ({
      date,
      dayName: idx === 0 ? "Bugün" : "Pzt",
      tempMax: 4.5,
      tempMin: -1.0,
      weatherCode: 3,
      condition: "Kapalı",
      precipSum: 1.2,
      precipProbabilityMax: 40,
      windSpeedMax: 15,
      uvIndexMax: 2,
      sunrise: `${date}T08:15`,
      sunset: `${date}T17:55`
    }));

    // 20-üyeli alt-mevsimsel topluluk: 16-30. günlerde sert kış soğuğu (-2..+1°C) ve 6-12 mm yağış
    const maxCols = Array.from({ length: 20 }, (_, m) => ({
      weight: 1,
      values: dates.map((_, dIdx) => (dIdx < 15 ? 4.5 : m < 14 ? 0.6 : 2.8))
    }));
    const minCols = Array.from({ length: 20 }, (_, m) => ({
      weight: 1,
      values: dates.map((_, dIdx) => (dIdx < 15 ? -1.0 : m < 14 ? -3.8 : -0.5))
    }));
    const precipCols = Array.from({ length: 20 }, (_, m) =>
      dates.map((_, dIdx) => (dIdx < 15 ? 1.0 : m < 15 ? 6.5 : 1.2))
    );

    const sub = buildCalibratedSubseasonalOutlook({
      raw: {
        fetchedAt: "2027-01-01T00:00:00Z",
        dates,
        maxCols,
        minCols,
        precipCols
      },
      calibratedDaily,
      lat: 40.19,
      lon: 29.06,
      elevationM: 155
    });

    expect(sub).not.toBeNull();
    expect(sub!.days.length).toBe(15);
    const firstSubDay = sub!.days[0];
    expect(firstSubDay.snowProbPct).toBeGreaterThanOrEqual(45);
    expect(firstSubDay.airSnowP90Cm).toBeGreaterThan(3.0);
    expect(firstSubDay.groundSnowP90Cm).toBeGreaterThan(2.0);
    expect(firstSubDay.weatherCode).toBe(71);
  });

  it("7. Bursa Merkez (WMO 17116 · Osmangazi 100m) Sabitlemesi: 'Bursa' araması asla Yıldırım (18746) istasyonuna kaymaz, ilçe aramaları korunur", () => {
    // 1. DEFAULT_LOCATION doğrudan WMO 17116 Bursa Merkez (40.2308, 29.0133, 100m) olmalı
    expect(DEFAULT_LOCATION.lat).toBe(BURSA_WMO_17116_LAT);
    expect(DEFAULT_LOCATION.lon).toBe(BURSA_WMO_17116_LON);
    expect(DEFAULT_LOCATION.elevation).toBe(BURSA_WMO_17116_ELEVATION_M);

    // 2. Open-Meteo GeoNames 'Bursa' iğnesi (40.1956, 29.0601, 155m) ve eski 40.1885, 29.061 pini WMO 17116'ya kenetlenir
    const geoNamesBursa = normalizeCanonicalBursaLocation({
      id: "750269",
      name: "Bursa",
      admin1: "Bursa",
      country: "Türkiye",
      lat: 40.19559,
      lon: 29.06013,
      elevation: 155
    });
    expect(geoNamesBursa.lat).toBe(40.2308);
    expect(geoNamesBursa.lon).toBe(29.0133);
    expect(geoNamesBursa.elevation).toBe(100);

    // 3. Kullanıcı açıkça 'Yıldırım', 'Nilüfer' veya 'Uludağ' seçtiğinde ilçe koordinatı asla ezilmez!
    const explicitYildirim = normalizeCanonicalBursaLocation({
      id: "bursa-yildirim-tr",
      name: "Yıldırım",
      admin1: "Bursa",
      country: "Türkiye",
      lat: 40.1919,
      lon: 29.1086,
      elevation: 147
    });
    expect(explicitYildirim.lat).toBe(40.1919);
    expect(explicitYildirim.lon).toBe(29.1086);
    expect(explicitYildirim.elevation).toBe(147);

    // 4. İstasyon sıralamasında hem Bursa Merkez (40.2308, 29.0133) hem Gökdere batısındaki Heykel/Osmangazi'de
    // birincil istasyon YILDIRIM değil, 17116-OSM (Bursa Merkez · Osmangazi) olur!
    const nowIso = "2026-11-26T23:00:00Z";
    const qc = runBursaObservationQC(
      [
        {
          station: BURSA_REFERENCE_STATIONS.WMO_17116,
          observedAtIso: nowIso,
          tempC: 9.2,
          dewPointC: 5.1,
          relHumidityPct: 76,
          pressureMslHpa: 1016,
          pressureStationHpa: 1004,
          windSpeedKt: 6,
          windGustKt: 10,
          windDirDeg: 35,
          precip10MinMm: 0,
          precip1HrMm: 0,
          precip24HrMm: 0,
          snowDepthCm: null,
          isPrecipitating: false,
          hasTenthDegreePrecision: true,
          source: "MGM_10MIN" as const,
          visibilityM: 12000
        },
        {
          station: BURSA_REFERENCE_STATIONS.MGM_YILDIRIM,
          observedAtIso: nowIso,
          tempC: 8.6,
          dewPointC: 4.9,
          relHumidityPct: 78,
          pressureMslHpa: 1016,
          pressureStationHpa: 998,
          windSpeedKt: 5,
          windGustKt: 9,
          windDirDeg: 40,
          precip10MinMm: 0,
          precip1HrMm: 0,
          precip24HrMm: 0,
          snowDepthCm: null,
          isPrecipitating: false,
          hasTenthDegreePrecision: true,
          source: "MGM_10MIN" as const,
          visibilityM: 12000
        }
      ],
      { nowMs: Date.parse(nowIso), isNight: true }
    );

    const meshSnap = {
      fetchedAtIso: nowIso,
      isBursaRegion: true,
      stations: qc.stations,
      acceptedCount: 2,
      rejectedCount: 0,
      tier1OnlineCount: 2,
      verticalProfile: qc.verticalProfile
    };

    const forBursaMerkez = mapMeshToMetarObservations(meshSnap, 40.2308, 29.0133);
    expect(forBursaMerkez[0].icaoId).toBe("17116-OSM");

    const forOsmangaziHeykel = mapMeshToMetarObservations(meshSnap, 40.1956, 29.0601);
    expect(forOsmangaziHeykel[0].icaoId).toBe("17116-OSM");

    const forActualYildirim = mapMeshToMetarObservations(meshSnap, 40.1919, 29.1086);
    expect(forActualYildirim[0].icaoId).toBe("YILDIRIM");
  });
});
