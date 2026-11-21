import { describe, expect, it } from "vitest";
import {
  computeInverseRmseWeights,
  evaluateModelsAgainstMetar,
  FIVE_MODEL_KEYS,
  haversineKm,
  WMO_PRIOR_WEIGHTS,
  type RawMetarRecord
} from "../lib/metar-verify";
import type { MetarObservation } from "../lib/weather-types";

describe("metar-verify canlı fiziksel istasyon ve Ters-RMSE² doğrulama motoru", () => {
  it("Haversine mesafesi Bursa–İstanbul arasında ~91 km üretir", () => {
    const dist = haversineKm(40.1885, 29.061, 41.0082, 28.9784);
    expect(dist).toBeGreaterThan(85);
    expect(dist).toBeLessThan(98);
  });

  it("Ters-RMSE² ağırlıklandırma en düşük hatalı modele en yüksek ağırlığı verir ve toplamı 1.0 olur", () => {
    const weights = computeInverseRmseWeights(
      {
        ecmwfIfs: 1.5,
        ecmwfAifs: 0.7, // en düşük hata
        icon: 1.1,
        ukmo: 1.3,
        gfs: 1.9
      },
      WMO_PRIOR_WEIGHTS.temperature,
      0.55
    );

    const sum = FIVE_MODEL_KEYS.reduce((acc, k) => acc + weights[k], 0);
    expect(sum).toBeCloseTo(1, 6);
    expect(weights.ecmwfAifs).toBeGreaterThan(weights.ecmwfIfs);
    expect(weights.ecmwfAifs).toBeGreaterThan(weights.gfs);
  });

  it("son 24 saatlik METAR eşleşmesi >=8 olduğunda canlı RMSE kazanını bulur ve ağırlıkları dinamik üretir", () => {
    const baseSec = Math.floor(Date.parse("2026-11-21T00:00:00Z") / 1000);
    const utcTimeIndex = new Map<string, number>();
    const times: string[] = [];
    for (let h = 0; h < 24; h++) {
      const iso = new Date((baseSec + h * 3600) * 1000).toISOString().slice(0, 16);
      times.push(iso);
      utcTimeIndex.set(iso, h);
    }

    const station: MetarObservation = {
      icaoId: "LTFM",
      stationName: "Istanbul Airport",
      distanceKm: 28,
      elevationM: 100,
      obsTimeIso: "2026-11-21T18:00:00Z",
      ageMinutes: 15,
      rawOb: "METAR LTFM ...",
      tempC: 15,
      dewPointC: 11,
      windSpeedKmh: 18,
      windGustKmh: null,
      windDirectionDeg: 40,
      qnhHpa: 1015,
      visibilityKm: 10,
      wxString: null
    };

    const metarHistory: RawMetarRecord[] = Array.from({ length: 12 }, (_, h) => ({
      icaoId: "LTFM",
      lat: 41.26,
      lon: 28.74,
      elev: 100,
      obsTime: baseSec + h * 3600,
      temp: 15,
      dewp: 11,
      altim: 1015,
      wspd: 10 // 18.52 km/h
    }));

    // Model sentetik dizileri: ecmwf_aifs sıcaklıkta tam isabet (0 hata), ukmo basınçta tam isabet (0 hata)
    const fill = (val: number) => Array.from({ length: 24 }, () => val);
    const modelHourlyUtc: Record<string, Array<number | null>> = {
      temperature_2m_ecmwf_ifs: fill(16.8),
      temperature_2m_ecmwf_aifs025_single: fill(15.1), // en iyi T
      temperature_2m_icon_seamless: fill(15.9),
      temperature_2m_ukmo_seamless: fill(16.2),
      temperature_2m_gfs_seamless: fill(17.5),
      dew_point_2m_ecmwf_ifs: fill(11.0),
      dew_point_2m_ecmwf_aifs025_single: fill(11.0),
      dew_point_2m_icon_seamless: fill(11.0),
      dew_point_2m_ukmo_seamless: fill(11.0),
      dew_point_2m_gfs_seamless: fill(11.0),
      pressure_msl_ecmwf_ifs: fill(1015.9),
      pressure_msl_ecmwf_aifs025_single: fill(1015.8),
      pressure_msl_icon_seamless: fill(1016.1),
      pressure_msl_ukmo_seamless: fill(1015.05), // en iyi P
      pressure_msl_gfs_seamless: fill(1016.4),
      wind_speed_10m_ecmwf_ifs: fill(20),
      wind_speed_10m_ecmwf_aifs025_single: fill(22),
      wind_speed_10m_icon_seamless: fill(18.6), // en iyi Wind
      wind_speed_10m_ukmo_seamless: fill(24),
      wind_speed_10m_gfs_seamless: fill(25)
    };

    const { report, weights } = evaluateModelsAgainstMetar({
      station,
      metarHistory,
      cityElevationM: 100,
      modelHourlyUtc,
      utcTimeIndex
    });

    expect(report.mode).toBe("live-metar-24h");
    expect(report.matchedHours).toBe(12);
    expect(report.winners.temperature).toBe("ecmwfAifs");
    expect(report.winners.pressure).toBe("ukmo");
    expect(report.winners.wind).toBe("icon");
    expect(weights.temperature.ecmwfAifs).toBeGreaterThan(0.5);
    expect(weights.pressure.ukmo).toBeGreaterThan(0.4);
  });

  it("yakında METAR yoksa şeffafça wmo-prior moduna döner", () => {
    const { report, weights } = evaluateModelsAgainstMetar({
      station: null,
      metarHistory: [],
      cityElevationM: 0,
      modelHourlyUtc: null,
      utcTimeIndex: new Map()
    });
    expect(report.mode).toBe("wmo-prior");
    expect(report.winners.temperature).toBeNull();
    expect(weights.temperature.ecmwfAifs).toBe(WMO_PRIOR_WEIGHTS.temperature.ecmwfAifs);
  });
});
