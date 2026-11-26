import { describe, expect, it } from "vitest";
import {
  blendKalmanCorrectedScalar,
  buildCressmanMetarTimeline,
  trainKalmanMos
} from "../lib/kalman-mos";
import {
  parseMetarWxTokens,
  SEVEN_MODEL_KEYS,
  WMO_PRIOR_WEIGHTS,
  type MetarNetworkStation,
  type RawMetarRecord
} from "../lib/metar-verify";
import { classifyPrecipPhase, fusePrecipitationHour } from "../lib/precip-engine";
import { buildStormAssessment, evaluateHourlyStormRisk } from "../lib/storm-engine";
import {
  analyzeConvectiveProfile,
  computeEnvironmentalLapseRateCPerM,
  wetBulbStullC
} from "../lib/thermo-cape";
import type { SoundingLevel } from "../lib/weather-types";

describe("ATMOS-Core v3.0 — Kalman/MOS, PMM Yağış, Stull Tw ve Şiddetli Fırtına Motoru", () => {
  it("tüm 7 model sistematik +2.6°C sıcak kaldığında Kalman/MOS sapmayı < 0.5°C altına indirir", () => {
    const baseMs = Date.parse("2026-11-21T00:00:00Z");
    const utcTimeIndex = new Map<string, number>();
    const hours = 48;
    for (let h = 0; h < hours; h++) {
      utcTimeIndex.set(new Date(baseMs + h * 3600000).toISOString().slice(0, 16), h);
    }

    const history: RawMetarRecord[] = Array.from({ length: 36 }, (_, h) => ({
      icaoId: "LTBR",
      name: "Bursa Yenisehir",
      lat: 40.25,
      lon: 29.56,
      elev: 100,
      obsTime: Math.floor((baseMs + h * 3600000) / 1000),
      temp: 12.0 + Math.sin((h / 24) * Math.PI * 2) * 3.0,
      dewp: 8.0,
      altim: 1014,
      wspd: 8,
      wxString: h % 12 === 0 ? "RA" : null
    }));

    const network: MetarNetworkStation[] = [
      {
        station: {
          icaoId: "LTBR",
          stationName: "Bursa Yenisehir",
          distanceKm: 18,
          elevationM: 100,
          obsTimeIso: new Date(baseMs + 35 * 3600000).toISOString(),
          ageMinutes: 15,
          rawOb: "METAR LTBR",
          tempC: history[35].temp ?? 12,
          dewPointC: 8,
          windSpeedKmh: 14.8,
          windGustKmh: null,
          windDirectionDeg: 40,
          qnhHpa: 1014,
          visibilityKm: 10,
          wxString: null
        },
        history
      }
    ];

    const makeSeries = (bias: number, noiseAmp: number) =>
      Array.from({ length: hours }, (_, h) => {
        const truth = 12.0 + Math.sin((h / 24) * Math.PI * 2) * 3.0;
        return Number((truth + bias + Math.cos(h * 1.7) * noiseAmp).toFixed(2));
      });

    const modelHourlyUtc: Record<string, Array<number | null>> = {
      temperature_2m_ecmwf_ifs: makeSeries(2.6, 0.25),
      temperature_2m_ecmwf_aifs025_single: makeSeries(2.4, 0.2),
      temperature_2m_icon_seamless: makeSeries(2.7, 0.35),
      temperature_2m_ukmo_seamless: makeSeries(2.5, 0.3),
      temperature_2m_meteofrance_seamless: makeSeries(2.8, 0.4),
      temperature_2m_gfs_seamless: makeSeries(3.1, 0.5),
      temperature_2m_gem_seamless: makeSeries(2.9, 0.45),
      dew_point_2m_ecmwf_ifs: Array(hours).fill(9.5),
      dew_point_2m_ecmwf_aifs025_single: Array(hours).fill(9.5),
      dew_point_2m_icon_seamless: Array(hours).fill(9.5),
      dew_point_2m_ukmo_seamless: Array(hours).fill(9.5),
      dew_point_2m_meteofrance_seamless: Array(hours).fill(9.5),
      dew_point_2m_gfs_seamless: Array(hours).fill(9.5),
      dew_point_2m_gem_seamless: Array(hours).fill(9.5),
      pressure_msl_ecmwf_ifs: Array(hours).fill(1014.2),
      pressure_msl_ecmwf_aifs025_single: Array(hours).fill(1014.1),
      pressure_msl_icon_seamless: Array(hours).fill(1014.3),
      pressure_msl_ukmo_seamless: Array(hours).fill(1014.0),
      pressure_msl_meteofrance_seamless: Array(hours).fill(1014.4),
      pressure_msl_gfs_seamless: Array(hours).fill(1014.6),
      pressure_msl_gem_seamless: Array(hours).fill(1014.5),
      wind_speed_10m_ecmwf_ifs: Array(hours).fill(15),
      wind_speed_10m_ecmwf_aifs025_single: Array(hours).fill(15),
      wind_speed_10m_icon_seamless: Array(hours).fill(15),
      wind_speed_10m_ukmo_seamless: Array(hours).fill(15),
      wind_speed_10m_meteofrance_seamless: Array(hours).fill(15),
      wind_speed_10m_gfs_seamless: Array(hours).fill(15),
      wind_speed_10m_gem_seamless: Array(hours).fill(15),
      precipitation_ecmwf_ifs: Array(hours).fill(0),
      precipitation_ecmwf_aifs025_single: Array(hours).fill(0),
      precipitation_icon_seamless: Array(hours).fill(0),
      precipitation_ukmo_seamless: Array(hours).fill(0),
      precipitation_meteofrance_seamless: Array(hours).fill(0),
      precipitation_gfs_seamless: Array(hours).fill(0),
      precipitation_gem_seamless: Array(hours).fill(0)
    };

    const mos = trainKalmanMos({
      network,
      cityElevationM: 100,
      envLapseRateCPerM: -0.0065,
      modelHourlyUtc,
      utcTimeIndex,
      nowUtcMs: baseMs + 35 * 3600000,
      utcOffsetSeconds: 10800,
      ensembleMembers: 122
    });

    expect(mos.active).toBe(true);
    expect(mos.report.mode).toBe("live-metar-48h");
    expect(mos.biases.ecmwfIfs.tempKalmanBiasC).toBeGreaterThan(2.0);

    // Gelecek 3. saat tahmini: gerçek sıcaklık 12.0°C iken tüm ham modeller ~14.6°C diyor
    const truthFuture = 12.0;
    const predicted = blendKalmanCorrectedScalar({
      snapshot: {
        ecmwfIfs: truthFuture + 2.6,
        ecmwfAifs: truthFuture + 2.4,
        icon: truthFuture + 2.7,
        ukmo: truthFuture + 2.5,
        meteofrance: truthFuture + 2.8,
        gfs: truthFuture + 3.1,
        gem: truthFuture + 2.9
      },
      mos,
      param: "temperature",
      leadHour: 3,
      localHour: 14,
      fallback: 14.6
    });

    expect(Math.abs(predicted - truthFuture)).toBeLessThan(0.65);
  });

  it("kış inversiyonunda canlı lapse rate pozitif çıkar ve rakım düzeltmesi doğru yönde çalışır", () => {
    const inversionLevels: SoundingLevel[] = [
      { pressure: 1000, altitudeM: 100, temperature: 1.0, dewPoint: 0.2, humidity: 94, windSpeedKt: 4, windDirection: 90 },
      { pressure: 850, altitudeM: 1450, temperature: 5.0, dewPoint: -2.0, humidity: 60, windSpeedKt: 18, windDirection: 180 },
      { pressure: 500, altitudeM: 5500, temperature: -18.0, dewPoint: -26.0, humidity: 45, windSpeedKt: 45, windDirection: 240 }
    ];
    const lapse = computeEnvironmentalLapseRateCPerM(inversionLevels);
    expect(lapse).toBeGreaterThan(0);

    const net: MetarNetworkStation[] = [
      {
        station: {
          icaoId: "TEST",
          stationName: "Hill Airport",
          distanceKm: 10,
          elevationM: 500,
          obsTimeIso: "2026-11-21T06:00:00Z",
          ageMinutes: 10,
          rawOb: "",
          tempC: 4.0,
          dewPointC: 1.0,
          windSpeedKmh: 10,
          windGustKmh: null,
          windDirectionDeg: 90,
          qnhHpa: 1020,
          visibilityKm: 10,
          wxString: null
        },
        history: [
          {
            icaoId: "TEST",
            lat: 40.2,
            lon: 29.1,
            elev: 500,
            obsTime: Math.floor(Date.parse("2026-11-21T06:00:00Z") / 1000),
            temp: 4.0
          }
        ]
      }
    ];
    // İnversiyon altında alçak vadi (100 m), yüksek tepeden (500 m) daha SOĞUK olmalı!
    const tl = buildCressmanMetarTimeline(net, 100, lapse);
    const pt = tl.get("2026-11-21T06:00");
    expect(pt?.tempC).toBeLessThan(4.0);
  });

  it("PMM yağış motoru hayalet çiselemeyi bastırır ve gerçek sağanak zirvesini korur", () => {
    // Senaryo A: 6 model kuru, 1 model 0.4 mm -> hayalet çiseleme 0.0 mm olmalı
    const dryRes = fusePrecipitationHour({
      detSnapshot: {
        ecmwfIfs: 0,
        ecmwfAifs: 0,
        icon: 0,
        ukmo: 0,
        meteofrance: 0,
        gfs: 0.4,
        gem: 0
      },
      detWeights: WMO_PRIOR_WEIGHTS.precipitation,
      ensembleMembersMm: Array.from({ length: 120 }, (_, i) => (i < 112 ? 0 : 0.3)),
      rawPrecipFallbackMm: 0.1,
      rawPopFallbackPct: 8,
      leadHour: 6
    });
    expect(dryRes.precipitationMm).toBe(0);
    expect(dryRes.precipProbabilityPct).toBeLessThan(18);

    // Senaryo B: Şiddetli sağanak uzlaşısı -> zirve ezilmez, yüksek PoP & P90 üretir
    const wetRes = fusePrecipitationHour({
      detSnapshot: {
        ecmwfIfs: 8.5,
        ecmwfAifs: 6.2,
        icon: 12.4,
        ukmo: 9.0,
        meteofrance: 14.2,
        gfs: 7.5,
        gem: 5.0
      },
      detWeights: WMO_PRIOR_WEIGHTS.precipitation,
      ensembleMembersMm: Array.from({ length: 120 }, (_, i) => 2 + (i / 120) * 16),
      rawPrecipFallbackMm: 8,
      rawPopFallbackPct: 88,
      leadHour: 4
    });
    expect(wetRes.precipProbabilityPct).toBeGreaterThanOrEqual(85);
    expect(wetRes.precipitationMm).toBeGreaterThan(7.5);
    expect(wetRes.consensus.p90Mm).toBeGreaterThan(12);
    expect(wetRes.consensus.ensembleMembers).toBe(120);
  });

  it("METAR wxString ayrıştırıcı ve Stull Tw faz sınıflandırıcısı kar/sulu kar/dolu ayrımını doğru yapar", () => {
    const flags = parseMetarWxTokens("+TSRA GR SQ");
    expect(flags.hasPrecip).toBe(true);
    expect(flags.heavyPrecip).toBe(true);
    expect(flags.isThunderstorm).toBe(true);
    expect(flags.hasHail).toBe(true);
    expect(flags.hasSquall).toBe(true);

    // +1.2°C ama kuru hava (%45 RH) -> Stull Tw < 0°C -> KAR!
    expect(wetBulbStullC(1.2, 45)).toBeLessThan(0);
    const snowPhase = classifyPrecipPhase({
      temperatureC: 1.2,
      humidityPct: 45,
      precipitationMm: 2.0,
      thickness5001000Dam: 536,
      freezingLevelM: 350,
      elevationM: 150
    });
    expect(snowPhase.precipPhase).toBe("snow");
    expect(snowPhase.precipType).toBe("snow");

    // Yüksek MUCAPE + Shear -> DOLU!
    const hailPhase = classifyPrecipPhase({
      temperatureC: 24,
      humidityPct: 72,
      precipitationMm: 8.0,
      freezingLevelM: 3400,
      elevationM: 100,
      mucape: 2200,
      bulkShear06Kt: 38
    });
    expect(hailPhase.precipPhase).toBe("hail");
  });

  it("MUCAPE gece yükseltilmiş kararsızlığı yakalar, SRH/SCP ve 0–100 StormAssessment fırtına penceresini tespit eder", () => {
    // Gece yüzey serin (14°C), 850 hPa sıcak & nemli (18°C / Td 15°C), 500 hPa çok soğuk (-16°C), güçlü yönlü kırılma
    const elevatedStormLevels: SoundingLevel[] = [
      { pressure: 1000, altitudeM: 110, temperature: 14, dewPoint: 12, humidity: 88, windSpeedKt: 12, windDirection: 110 },
      { pressure: 925, altitudeM: 770, temperature: 16, dewPoint: 14, humidity: 88, windSpeedKt: 24, windDirection: 155 },
      { pressure: 850, altitudeM: 1500, temperature: 18, dewPoint: 15, humidity: 83, windSpeedKt: 34, windDirection: 195 },
      { pressure: 700, altitudeM: 3080, temperature: 4, dewPoint: -6, humidity: 48, windSpeedKt: 44, windDirection: 235 },
      { pressure: 500, altitudeM: 5650, temperature: -16, dewPoint: -26, humidity: 42, windSpeedKt: 62, windDirection: 260 },
      { pressure: 300, altitudeM: 9250, temperature: -42, dewPoint: -52, humidity: 35, windSpeedKt: 78, windDirection: 270 }
    ];

    const thermo = analyzeConvectiveProfile({
      surfaceTempC: 14,
      surfaceHumidity: 88,
      surfacePressureHpa: 1006,
      levels: elevatedStormLevels
    });

    expect(thermo.mucape).toBeGreaterThan(thermo.cape);
    expect(thermo.mucape).toBeGreaterThan(1000);
    expect(thermo.srh03).toBeGreaterThan(80);
    expect(thermo.scp).toBeGreaterThan(0.8);
    expect(thermo.dcape).toBeGreaterThan(300);

    const hCalm = evaluateHourlyStormRisk({
      time: "2026-11-21T12:00",
      hourLabel: "12:00",
      dayLabel: "Bugün",
      capeFused: 40,
      sounding: null,
      ensCapeProb500: 0,
      ensGustP50: 14,
      ensGustP90: 18,
      ensGustProb55: 0,
      ensGustProb75: 0,
      windSpeedKmh: 10,
      windGustsKmh: 16,
      precipitationMm: 0,
      precipP90Mm: 0,
      precip3hAccumMm: 0,
      wmoStormAgreeCount: 0,
      wmoTotalModels: 7,
      weatherCode: 1,
      pressureDelta3h: 0.2,
      pressureDelta6h: 0.4,
      lightningPotential: null
    });

    const hSevere = evaluateHourlyStormRisk({
      time: "2026-11-21T15:00",
      hourLabel: "15:00",
      dayLabel: "Bugün",
      capeFused: 1800,
      sounding: thermo,
      ensCapeProb500: 84,
      ensGustP50: 66,
      ensGustP90: 84,
      ensGustProb55: 76,
      ensGustProb75: 38,
      windSpeedKmh: 46,
      windGustsKmh: 78,
      precipitationMm: 14.5,
      precipP90Mm: 24,
      precip3hAccumMm: 26,
      wmoStormAgreeCount: 6,
      wmoTotalModels: 7,
      weatherCode: 95,
      pressureDelta3h: -4.2,
      pressureDelta6h: -7.1,
      lightningPotential: 12
    });

    expect(hCalm.score).toBeLessThan(15);
    expect(hSevere.score).toBeGreaterThanOrEqual(70);
    expect(hSevere.isStorm).toBe(true);
    expect(hSevere.lightningProbPct).toBeGreaterThanOrEqual(75);
    expect(SEVEN_MODEL_KEYS.length).toBe(7);

    const summary = buildStormAssessment([hCalm, hSevere], [0, 14.5]);
    expect(summary.nextWindow).not.toBeNull();
    expect(summary.nextWindow?.peakLabel).toBe("Bugün 15:00");
    expect(summary.score).toBeGreaterThanOrEqual(70);
  });
});
