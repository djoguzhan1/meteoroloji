import { describe, expect, it } from "vitest";
import { trainKalmanMos } from "../lib/kalman-mos";
import {
  haversineKm,
  type MetarNetworkStation,
  type RawMetarRecord
} from "../lib/metar-verify";
import {
  computeInverseRmseWeights,
  CORE_MODEL_KEYS,
  WMO_PRIOR_WEIGHTS
} from "../lib/model-registry";
import type { LedgerStationPoint } from "../lib/state-ledger";
import type { MetarObservation } from "../lib/weather-types";

describe("8-model kanonik kayıt defteri, Ters-UBRMSE² ağırlıklandırma ve canlı doğrulama modları", () => {
  it("Haversine mesafesi Bursa–İstanbul arasında ~91 km üretir", () => {
    const dist = haversineKm(40.1885, 29.061, 41.0082, 28.9784);
    expect(dist).toBeGreaterThan(85);
    expect(dist).toBeLessThan(98);
  });

  it("8-model Ters-RMSE² ağırlıklandırma en düşük hatalı modele en yüksek ağırlığı verir ve toplamı 1.0 olur", () => {
    const weights = computeInverseRmseWeights(
      {
        ecmwfIfs: 1.5,
        ecmwfAifs: 0.7,
        icon: 1.1,
        ukmo: 1.3,
        meteofrance: 1.2,
        gfs: 1.9,
        gem: 1.8,
        jma: 1.6
      },
      WMO_PRIOR_WEIGHTS.temperature,
      0.55
    );

    expect(CORE_MODEL_KEYS).toHaveLength(8);
    const sum = CORE_MODEL_KEYS.reduce((acc, k) => acc + weights[k], 0);
    expect(sum).toBeCloseTo(1, 6);
    expect(weights.ecmwfAifs).toBeGreaterThan(weights.ecmwfIfs);
    expect(weights.ecmwfAifs).toBeGreaterThan(weights.gfs);
  });

  it("son 12 saatlik istasyon eşleşmesinde live-station-24h modunu ve kazanan modelleri doğru raporlar", () => {
    const baseMs = Date.parse("2026-11-21T00:00:00Z");
    const baseSec = Math.floor(baseMs / 1000);
    const utcTimeIndex = new Map<string, number>();
    for (let h = 0; h < 24; h++) {
      const iso = new Date(baseMs + h * 3600_000).toISOString().slice(0, 16);
      utcTimeIndex.set(iso, h);
    }

    const station: MetarObservation = {
      icaoId: "LTFM",
      stationName: "Istanbul Airport",
      distanceKm: 28,
      elevationM: 100,
      obsTimeIso: "2026-11-21T11:00:00Z",
      ageMinutes: 15,
      rawOb: "METAR LTFM ...",
      tempC: 15,
      dewPointC: 11,
      windSpeedKmh: 18.5,
      windGustKmh: null,
      windDirectionDeg: 40,
      qnhHpa: 1015,
      visibilityKm: 10,
      wxString: null
    };

    const history: RawMetarRecord[] = Array.from({ length: 12 }, (_, h) => ({
      icaoId: "LTFM",
      lat: 41.26,
      lon: 28.74,
      elev: 100,
      obsTime: baseSec + h * 3600,
      temp: 15 + (h % 2 === 0 ? 0.1 : -0.1),
      dewp: 11,
      altim: 1015,
      wspd: 10
    }));

    const network: MetarNetworkStation[] = [{ station, history }];
    const makeArr = (base: number, jitter: number) =>
      Array.from({ length: 24 }, (_, h) => base + (h % 2 === 0 ? jitter : -jitter));

    const modelHourlyUtc: Record<string, Array<number | null>> = {
      temperature_2m_ecmwf_ifs: makeArr(16.8, 0.5),
      temperature_2m_ecmwf_aifs025_single: makeArr(15.05, 0.08),
      temperature_2m_icon_seamless: makeArr(15.9, 0.4),
      temperature_2m_ukmo_seamless: makeArr(16.2, 0.45),
      temperature_2m_meteofrance_seamless: makeArr(16.0, 0.42),
      temperature_2m_gfs_seamless: makeArr(17.5, 0.8),
      temperature_2m_gem_seamless: makeArr(17.0, 0.7),
      temperature_2m_jma_seamless: makeArr(16.5, 0.55),
      pressure_msl_ecmwf_ifs: makeArr(1015.9, 0.4),
      pressure_msl_ecmwf_aifs025_single: makeArr(1015.8, 0.35),
      pressure_msl_icon_seamless: makeArr(1016.1, 0.45),
      pressure_msl_ukmo_seamless: makeArr(1015.02, 0.05),
      pressure_msl_meteofrance_seamless: makeArr(1015.7, 0.3),
      pressure_msl_gfs_seamless: makeArr(1016.4, 0.5),
      pressure_msl_gem_seamless: makeArr(1016.2, 0.48),
      pressure_msl_jma_seamless: makeArr(1016.0, 0.42),
      wind_speed_10m_ecmwf_ifs: makeArr(21, 1.5),
      wind_speed_10m_ecmwf_aifs025_single: makeArr(22, 1.8),
      wind_speed_10m_icon_seamless: makeArr(18.55, 0.2),
      wind_speed_10m_ukmo_seamless: makeArr(24, 2.0),
      wind_speed_10m_meteofrance_seamless: makeArr(22.5, 1.6),
      wind_speed_10m_gfs_seamless: makeArr(25, 2.2),
      wind_speed_10m_gem_seamless: makeArr(24.5, 2.1),
      wind_speed_10m_jma_seamless: makeArr(23, 1.9)
    };

    const mos = trainKalmanMos({
      network,
      cityElevationM: 100,
      envLapseRateCPerM: -0.0065,
      modelHourlyUtc,
      utcTimeIndex,
      nowUtcMs: baseMs + 11 * 3600_000,
      utcOffsetSeconds: 10800
    });

    expect(mos.report.mode).toBe("live-station-24h");
    expect(mos.report.matchedHours).toBe(12);
    expect(mos.report.rows).toHaveLength(8);
    expect(mos.report.winners.temperature).toBe("ecmwfAifs");
    expect(mos.report.winners.pressure).toBe("ukmo");
    expect(mos.report.winners.wind).toBe("icon");
  });

  it("Bursa MGM 19-ilçe defter geçmişi bulunduğunda live-mgm-mesh modunu, istasyon yokken wmo-prior modunu döndürür", () => {
    const baseMs = Date.parse("2026-11-26T00:00:00Z");
    const utcTimeIndex = new Map<string, number>();
    for (let h = 0; h < 12; h++) {
      utcTimeIndex.set(new Date(baseMs + h * 3600_000).toISOString().slice(0, 16), h);
    }

    const ledgerPoints: LedgerStationPoint[] = Array.from({ length: 10 }, (_, h) => ({
      stationId: "WMO_17116",
      utcHourKey: new Date(baseMs + h * 3600_000).toISOString().slice(0, 16),
      observedAtMs: baseMs + h * 3600_000,
      lat: 40.2308,
      lon: 29.0133,
      elevationM: 100,
      tempC: 14.0,
      dewPointC: 8.5,
      pressureMslHpa: 1016,
      windSpeedKmh: 12,
      windDirDeg: 40,
      precipMmHr: 0,
      hasPrecip: false
    }));

    const modelHourlyUtc: Record<string, Array<number | null>> = {
      temperature_2m_ecmwf_ifs: Array(12).fill(14.1),
      temperature_2m_ecmwf_aifs025_single: Array(12).fill(14.3),
      temperature_2m_icon_seamless: Array(12).fill(14.2),
      temperature_2m_ukmo_seamless: Array(12).fill(14.4),
      temperature_2m_meteofrance_seamless: Array(12).fill(14.3),
      temperature_2m_gfs_seamless: Array(12).fill(14.6),
      temperature_2m_gem_seamless: Array(12).fill(14.5),
      temperature_2m_jma_seamless: Array(12).fill(14.4)
    };

    const mgmMos = trainKalmanMos({
      network: [],
      cityElevationM: 155,
      cityLat: 40.1885,
      cityLon: 29.061,
      envLapseRateCPerM: -0.006,
      modelHourlyUtc,
      utcTimeIndex,
      nowUtcMs: baseMs + 9 * 3600_000,
      utcOffsetSeconds: 10800,
      ledgerStationHistory: ledgerPoints
    });
    expect(mgmMos.report.mode).toBe("live-mgm-mesh");
    expect(mgmMos.summary.stationIds).toContain("WMO_17116");

    const priorMos = trainKalmanMos({
      network: [],
      cityElevationM: 0,
      envLapseRateCPerM: -0.0065,
      modelHourlyUtc: null,
      utcTimeIndex: new Map(),
      nowUtcMs: baseMs,
      utcOffsetSeconds: 0
    });
    expect(priorMos.report.mode).toBe("wmo-prior");
    expect(priorMos.report.winners.temperature).toBeNull();
    expect(priorMos.shortRangeWeights.temperature.ecmwfAifs).toBe(
      WMO_PRIOR_WEIGHTS.temperature.ecmwfAifs
    );
  });
});
