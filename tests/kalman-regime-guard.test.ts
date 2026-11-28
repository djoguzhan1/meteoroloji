import { describe, expect, it } from "vitest";
import {
  blendKalmanCorrectedScalar,
  type ProvinceScopedLedgerStationPoint,
  trainKalmanMos
} from "../lib/kalman-mos";
import type { MetarNetworkStation, RawMetarRecord } from "../lib/metar-verify";
import {
  computeDeadbandMarginGate,
  computeDominantClusterWeightC1,
  computeRegimeGateFactor,
  evaluateRegimeGateComponents,
  resolveRegimeGatedBimodalCluster
} from "../lib/provinces/engine/regime-bimodal-solver";
import type { HybridModelSnapshot } from "../lib/weather-types";

function makeUniformSnapshot(val: number): HybridModelSnapshot {
  return {
    ecmwfIfs: val,
    ecmwfAifs: val,
    icon: val,
    ukmo: val,
    meteofrance: val,
    gfs: val,
    gem: val,
    jma: val
  };
}

function buildBimodalEnsemble(params: {
  totalMembers?: number;
  warmFraction: number;
  coldCenterC: number;
  warmCenterC: number;
  spreadHalfWidthC?: number;
}): number[] {
  const total = params.totalMembers ?? 100;
  const warmCount = Math.round(total * params.warmFraction);
  const coldCount = total - warmCount;
  const hw = params.spreadHalfWidthC ?? 0.25;

  const members: number[] = [];
  for (let i = 0; i < coldCount; i++) {
    const offset = coldCount > 1 ? ((i / (coldCount - 1)) * 2 - 1) * hw : 0;
    members.push(params.coldCenterC + offset);
  }
  for (let i = 0; i < warmCount; i++) {
    const offset = warmCount > 1 ? ((i / (warmCount - 1)) * 2 - 1) * hw : 0;
    members.push(params.warmCenterC + offset);
  }
  return members;
}

describe("ARC-04 — Rejim-Korumalı Kalman-MOS G_regime(h), Havalimanı Çanak Koruması & C^1 Bimodal Çözücü", () => {
  it("Canlı Bursa senaryosu: 48s +16°C Lodos (+8°C T850, 210°) sıcak Kalman düzeltmesini (+2.4°C+) +168s Poyraz (-8.1°C T850, 30°, Tw=+0.4°C, PoP=%75) kar gününde < +0.15°C altına bastırır; durağan rejimde korur", () => {
    const baseMs = Date.parse("2026-11-26T12:00:00Z");
    const hours = 48;
    const utcTimeIndex = new Map<string, number>();
    const ledgerPts: ProvinceScopedLedgerStationPoint[] = [];

    for (let h = 0; h < hours; h++) {
      const ms = baseMs + h * 3600_000;
      const uKey = new Date(ms).toISOString().slice(0, 16);
      utcTimeIndex.set(uKey, h);
      ledgerPts.push({
        stationId: "WMO_17116",
        stationProvinceCode: "TR-16",
        utcHourKey: uKey,
        observedAtMs: ms,
        lat: 40.2308,
        lon: 29.0133,
        elevationM: 100,
        tempC: 16.0,
        dewPointC: 9.0,
        pressureMslHpa: 1011,
        windSpeedKmh: 26,
        windDirDeg: 210,
        precipMmHr: 0,
        hasPrecip: false
      });
    }

    // Modeller Lodos fönünde +16.0°C yerine +13.2°C (-2.8°C soğuk hata) tahmin etmiş olsun
    const makeModel2m = (offset: number) =>
      Array.from({ length: hours }, (_, h) => 16.0 - 2.8 + offset + (h % 2 === 0 ? 0.1 : -0.1));

    const modelHourlyUtc: Record<string, Array<number | null>> = {
      temperature_2m_ecmwf_ifs: makeModel2m(0.0),
      temperature_2m_ecmwf_aifs025_single: makeModel2m(0.05),
      temperature_2m_icon_seamless: makeModel2m(-0.05),
      temperature_2m_ukmo_seamless: makeModel2m(0.0),
      temperature_2m_meteofrance_seamless: makeModel2m(-0.1),
      temperature_2m_gfs_seamless: makeModel2m(-0.15),
      temperature_2m_gem_seamless: makeModel2m(-0.1),
      temperature_2m_jma_seamless: makeModel2m(0.0),
      temperature_850hPa_ecmwf_ifs: Array(hours).fill(8.0),
      temperature_850hPa_gfs_seamless: Array(hours).fill(8.0),
      wind_speed_850hPa_ecmwf_ifs: Array(hours).fill(32),
      wind_direction_850hPa_ecmwf_ifs: Array(hours).fill(210)
    };

    const mos = trainKalmanMos({
      network: [],
      cityElevationM: 100,
      cityLat: 40.2308,
      cityLon: 29.0133,
      envLapseRateCPerM: -0.0065,
      modelHourlyUtc,
      utcTimeIndex,
      nowUtcMs: baseMs + (hours - 1) * 3600_000,
      utcOffsetSeconds: 10800,
      ensembleMembers: 212,
      ledgerStationHistory: ledgerPts,
      provinceCode: "TR-16"
    });

    // Kalıcı Lodos düzeltmesi ~ +2.54°C (tempPersistentBiasC < -2.4°C) ve toplam EWMA düzeltmesi ~ +2.3°C..+2.4°C
    expect(mos.biases.ecmwfIfs.tempPersistentBiasC).toBeLessThan(-2.4);
    expect(mos.biases.ecmwfIfs.tempKalmanBiasC).toBeLessThan(-2.25);
    expect(mos.trainingRegimeSummary?.meanTemp2mC).toBeCloseTo(16.0, 1);
    expect(mos.trainingRegimeSummary?.meanTemp850C).toBeCloseTo(8.0, 1);
    expect(mos.trainingRegimeSummary?.meanWind850U).not.toBeNull();
    expect(mos.trainingRegimeSummary?.meanWind850V).not.toBeNull();

    // 1) +168h Kutup Soğuğu + Poyraz Kar Senaryosu: T850 = -8.1°C, Poyraz 30° (28 km/s), Tw = +0.4°C, PoP = %75
    const polarRawTempC = 0.8;
    const polarSnapshot = makeUniformSnapshot(polarRawTempC);
    const polarContext = {
      temp850C: -8.1,
      wind850DirDeg: 30,
      wind850SpeedKmh: 28,
      wetBulbC: 0.4,
      popPct: 75
    };

    const gateBreakdown = evaluateRegimeGateComponents({
      trainingRegimeSummary: mos.trainingRegimeSummary,
      targetSynopticContext: polarContext,
      biasRemoveC: mos.biases.ecmwfIfs.tempPersistentBiasC
    });
    expect(gateBreakdown.airmassGate).toBeLessThan(0.001);
    expect(gateBreakdown.windGate).toBe(0);
    expect(gateBreakdown.phaseGate).toBeCloseTo(0.1, 3);
    expect(gateBreakdown.gate).toBeLessThan(0.001);

    const predPolar168h = blendKalmanCorrectedScalar({
      snapshot: polarSnapshot,
      mos,
      param: "temperature",
      leadHour: 168,
      localHour: 12,
      fallback: polarRawTempC,
      ensembleP50: polarRawTempC,
      targetSynopticContext: polarContext
    });
    const warmShift168h = predPolar168h - polarRawTempC;
    expect(warmShift168h).toBeGreaterThanOrEqual(0);
    expect(warmShift168h).toBeLessThan(0.15);

    // Yakın vadede (+36h ani cephe geçişinde bile) sıcak Lodos yanlılığı kar gününe taşınmaz (< +0.15°C)
    const predPolar36h = blendKalmanCorrectedScalar({
      snapshot: polarSnapshot,
      mos,
      param: "temperature",
      leadHour: 36,
      localHour: 12,
      fallback: polarRawTempC,
      ensembleP50: polarRawTempC,
      targetSynopticContext: polarContext
    });
    expect(predPolar36h - polarRawTempC).toBeLessThan(0.15);

    // 2) Durağan Hava Kütlesi Senaryosu (T850 = +8.0°C -> +7.5°C, Lodos 210° -> 205°): Kalman düzeltmesi tam korunur!
    const stationaryRawTempC = 13.2;
    const stationarySnapshot = makeUniformSnapshot(stationaryRawTempC);
    const unGatedStationary = blendKalmanCorrectedScalar({
      snapshot: stationarySnapshot,
      mos,
      param: "temperature",
      leadHour: 2,
      localHour: 15,
      fallback: stationaryRawTempC
    });
    const gatedStationary = blendKalmanCorrectedScalar({
      snapshot: stationarySnapshot,
      mos,
      param: "temperature",
      leadHour: 2,
      localHour: 15,
      fallback: stationaryRawTempC,
      targetSynopticContext: {
        temp850C: 7.5,
        wind850DirDeg: 205,
        wind850SpeedKmh: 30,
        wetBulbC: 11.5,
        popPct: 10
      }
    });

    const unGatedCorrection = unGatedStationary - stationaryRawTempC;
    const gatedCorrection = gatedStationary - stationaryRawTempC;
    expect(unGatedCorrection).toBeGreaterThan(2.2);
    expect(gatedCorrection).toBeGreaterThan(0.98 * unGatedCorrection);
  });

  it("Bimodal çözücü: %51 sıcak / %49 soğuk (c0=-0.5°C, c1=+9.5°C) -> %49 sıcak / %51 soğuk geçişinde sert sıçrama yapmaz (|ΔT| < 0.5°C), %80 soğuk kümede c0 etrafına kilitlenir ve sıcak EMOS çarpıklığını sızdırmaz", () => {
    const ens51Warm = buildBimodalEnsemble({
      totalMembers: 100,
      warmFraction: 0.51,
      coldCenterC: -0.5,
      warmCenterC: 9.5,
      spreadHalfWidthC: 0.25
    });
    const ens49Warm = buildBimodalEnsemble({
      totalMembers: 100,
      warmFraction: 0.49,
      coldCenterC: -0.5,
      warmCenterC: 9.5,
      spreadHalfWidthC: 0.25
    });

    // Tek koşuluk dProg/dt gürültüsü (+1.8°C vs -1.8°C) eklense dahi [0.45, 0.55] g_margin ölü bandı devrilmeyi önler!
    const res51 = resolveRegimeGatedBimodalCluster({
      leadHours: 132,
      emosTempC: 7.8, // Kasıtlı sıcak EMOS gecikmesi -> c0'ı yukarı çekmemeli!
      ensembleMembersC: ens51Warm,
      dProgDtTrendC: 1.8
    });
    const res49 = resolveRegimeGatedBimodalCluster({
      leadHours: 132,
      emosTempC: 7.8,
      ensembleMembersC: ens49Warm,
      dProgDtTrendC: -1.8
    });

    expect(res51.isBimodal).toBe(true);
    expect(res49.isBimodal).toBe(true);
    expect(res51.coldModeC).toBeCloseTo(-0.5, 1);
    expect(res51.warmModeC).toBeCloseTo(9.5, 1);
    expect(Math.abs(res51.adjustedTempC - res49.adjustedTempC)).toBeLessThan(0.5);
    expect(Math.abs(res51.adjustedTempC - res49.adjustedTempC)).toBeCloseTo(0.2, 1);

    // %80 soğuk / %20 sıcak (p = 0.20) uzlaşıda >= %95 soğuk kümeye (c0 = -0.5°C) tam kilitlenme!
    const ens80Cold = buildBimodalEnsemble({
      totalMembers: 100,
      warmFraction: 0.2,
      coldCenterC: -0.5,
      warmCenterC: 9.5,
      spreadHalfWidthC: 0.25
    });
    const res80Cold = resolveRegimeGatedBimodalCluster({
      leadHours: 144,
      emosTempC: 6.5, // Eski çözücüde localBiasShift ile c0'ı +3.8°C'ye çekip karı yağmura çeviriyordu!
      ensembleMembersC: ens80Cold
    });

    expect(res80Cold.isBimodal).toBe(true);
    expect(res80Cold.coldModeC).toBeCloseTo(-0.5, 1);
    expect(res80Cold.coldAlphaWeight).toBeGreaterThanOrEqual(0.95);
    expect(Math.abs(res80Cold.adjustedTempC - -0.5)).toBeLessThan(0.4);

    // Tüm [0, 1] aralığında alpha_dom(p) C^1-süreklilik ve g_margin [0.45, 0.55] ölü bant kontrolü
    expect(computeDeadbandMarginGate(0.45)).toBe(0);
    expect(computeDeadbandMarginGate(0.5)).toBe(0);
    expect(computeDeadbandMarginGate(0.55)).toBe(0);

    const eps = 1e-5;
    for (const knot of [0.15, 0.25, 0.45, 0.5, 0.55, 0.75, 0.85]) {
      const leftDeriv =
        (computeDominantClusterWeightC1(knot) -
          computeDominantClusterWeightC1(knot - eps)) /
        eps;
      const rightDeriv =
        (computeDominantClusterWeightC1(knot + eps) -
          computeDominantClusterWeightC1(knot)) /
        eps;
      expect(Math.abs(rightDeriv - leftDeriv)).toBeLessThan(1e-3);
    }
  });

  it("Doğu Anadolu kalmanTempBiasCapC: 10.0 ile Erzurum -24°C kar çanağında +8.5°C model sıcak hatasını başarıyla giderir", () => {
    const baseMs = Date.parse("2026-11-26T00:00:00Z");
    const hours = 48;
    const utcTimeIndex = new Map<string, number>();
    const erzurumLedger: ProvinceScopedLedgerStationPoint[] = [];

    for (let h = 0; h < hours; h++) {
      const ms = baseMs + h * 3600_000;
      const uKey = new Date(ms).toISOString().slice(0, 16);
      utcTimeIndex.set(uKey, h);
      erzurumLedger.push({
        stationId: "MGM_17096",
        stationProvinceCode: "TR-25",
        utcHourKey: uKey,
        observedAtMs: ms,
        lat: 39.9055,
        lon: 41.2658,
        elevationM: 1860,
        tempC: -24.0,
        dewPointC: -27.0,
        pressureMslHpa: 1032,
        windSpeedKmh: 4,
        windDirDeg: 60,
        precipMmHr: 0,
        hasPrecip: false
      });
    }

    // Küresel modeller kar-albedo inversiyonunu çözemeyip -15.5°C (+8.5°C sıcak hata!) veriyor
    const makeErzurumModel = (jitter: number) =>
      Array.from({ length: hours }, (_, h) => -15.5 + (h % 2 === 0 ? jitter : -jitter));

    const modelHourlyUtc: Record<string, Array<number | null>> = {
      temperature_2m_ecmwf_ifs: makeErzurumModel(0.15),
      temperature_2m_ecmwf_aifs025_single: makeErzurumModel(0.12),
      temperature_2m_icon_seamless: makeErzurumModel(0.2),
      temperature_2m_ukmo_seamless: makeErzurumModel(0.18),
      temperature_2m_meteofrance_seamless: makeErzurumModel(0.22),
      temperature_2m_gfs_seamless: makeErzurumModel(0.25),
      temperature_2m_gem_seamless: makeErzurumModel(0.2),
      temperature_2m_jma_seamless: makeErzurumModel(0.18),
      temperature_850hPa_ecmwf_ifs: Array(hours).fill(-12.0)
    };

    const erzurumMos = trainKalmanMos({
      network: [],
      cityElevationM: 1860,
      cityLat: 39.9055,
      cityLon: 41.2658,
      envLapseRateCPerM: 0.003, // Güçlü kış kar-albedo inversiyonu
      modelHourlyUtc,
      utcTimeIndex,
      nowUtcMs: baseMs + (hours - 1) * 3600_000,
      utcOffsetSeconds: 10800,
      ledgerStationHistory: erzurumLedger,
      provinceCode: "TR-25",
      kalmanTempBiasCapC: 10.0,
      coldBasinAirportIcaos: ["LTCE"]
    });

    expect(erzurumMos.active).toBe(true);
    expect(erzurumMos.biases.ecmwfIfs.tempKalmanBiasC).toBeGreaterThan(7.5);

    const correctedErzurum = blendKalmanCorrectedScalar({
      snapshot: makeUniformSnapshot(-15.5),
      mos: erzurumMos,
      param: "temperature",
      leadHour: 3,
      localHour: 6,
      fallback: -15.5,
      targetSynopticContext: {
        temp850C: -12.0,
        wetBulbC: -24.5,
        popPct: 5
      }
    });

    // +8.5°C model sıcak hatası büyük oranda temizlenip -24°C kar çanağı gerçeğine yakınsar (< 1.0°C fark)
    expect(correctedErzurum).toBeLessThan(-23.0);
    expect(Math.abs(correctedErzurum - -24.0)).toBeLessThan(1.0);
  });

  it("İl sınırı kilidi (provinceCode) komşu il istasyonlarını %100 filtreler ve coldBasinAirportIcaos kırsal havalimanı ayaz tuzağını bastırır", () => {
    const baseMs = Date.parse("2026-11-26T18:00:00Z");
    const hours = 12;
    const utcTimeIndex = new Map<string, number>();
    const mixedLedger: ProvinceScopedLedgerStationPoint[] = [];

    for (let h = 0; h < hours; h++) {
      const ms = baseMs + h * 3600_000;
      const uKey = new Date(ms).toISOString().slice(0, 16);
      utcTimeIndex.set(uKey, h);

      // Ankara Merkez (TR-06) istasyonu: +4.0°C
      mixedLedger.push({
        stationId: "ANK_17130",
        stationProvinceCode: "TR-06",
        utcHourKey: uKey,
        observedAtMs: ms,
        lat: 39.9727,
        lon: 32.8637,
        elevationM: 891,
        tempC: 4.0,
        dewPointC: -1.0,
        pressureMslHpa: 1022,
        windSpeedKmh: 5,
        windDirDeg: 45,
        precipMmHr: 0,
        hasPrecip: false
      });

      // Sınır sızıntısı testi: 20 km yakında ama farklı il kodu (TR-18) taşıyan sahte soğuk istasyon (-9.0°C)
      mixedLedger.push({
        stationId: "LEAK_TR18",
        stationProvinceCode: "TR-18",
        utcHourKey: uKey,
        observedAtMs: ms,
        lat: 40.05,
        lon: 32.92,
        elevationM: 900,
        tempC: -9.0,
        dewPointC: -11.0,
        pressureMslHpa: 1022,
        windSpeedKmh: 3,
        windDirDeg: 30,
        precipMmHr: 0,
        hasPrecip: false
      });
    }

    // Esenboğa LTAC kırsal çanağı gece -4.5°C ölçerken şehir merkezi +4.0°C
    const ltacHistory: RawMetarRecord[] = Array.from({ length: hours }, (_, h) => ({
      icaoId: "LTAC",
      lat: 40.1281,
      lon: 32.995,
      elev: 953,
      obsTime: Math.floor((baseMs + h * 3600_000) / 1000),
      temp: -4.5,
      dewp: -6.0,
      wspd: 2,
      altim: 1022
    }));

    const ltacNet: MetarNetworkStation[] = [
      {
        station: {
          icaoId: "LTAC",
          stationName: "Ankara Esenboga",
          distanceKm: 24,
          elevationM: 953,
          obsTimeIso: new Date(baseMs + 11 * 3600_000).toISOString(),
          ageMinutes: 15,
          rawOb: "METAR LTAC",
          tempC: -4.5,
          dewPointC: -6.0,
          windSpeedKmh: 3.7,
          windGustKmh: null,
          windDirectionDeg: 30,
          qnhHpa: 1022,
          visibilityKm: 10,
          wxString: null
        },
        history: ltacHistory
      }
    ];

    // Modeller Ankara şehir merkezini tam doğru (+4.0°C) tahmin ediyor olsun
    const modelHourlyUtc: Record<string, Array<number | null>> = {
      temperature_2m_ecmwf_ifs: Array(hours).fill(4.0),
      temperature_2m_ecmwf_aifs025_single: Array(hours).fill(4.0),
      temperature_2m_icon_seamless: Array(hours).fill(4.0),
      temperature_2m_ukmo_seamless: Array(hours).fill(4.0),
      temperature_2m_meteofrance_seamless: Array(hours).fill(4.0),
      temperature_2m_gfs_seamless: Array(hours).fill(4.0),
      temperature_2m_gem_seamless: Array(hours).fill(4.0),
      temperature_2m_jma_seamless: Array(hours).fill(4.0)
    };

    const ankaraMos = trainKalmanMos({
      network: ltacNet,
      cityElevationM: 891,
      cityLat: 39.9727,
      cityLon: 32.8637,
      envLapseRateCPerM: -0.005,
      modelHourlyUtc,
      utcTimeIndex,
      nowUtcMs: baseMs + 11 * 3600_000,
      utcOffsetSeconds: 10800,
      ledgerStationHistory: mixedLedger,
      provinceCode: "TR-06",
      kalmanTempBiasCapC: 6.5,
      coldBasinAirportIcaos: ["LTAC"]
    });

    // TR-18 istasyonu kesinlikle elenmiş olmalı (0 sınır sızıntısı!)
    expect(ankaraMos.summary.stationIds).toContain("ANK_17130");
    expect(ankaraMos.summary.stationIds).not.toContain("LEAK_TR18");
    // LTAC Esenboğa ayaz tuzağı bastırıldığı için +4.0°C şehir gerçeğine karşı model hatası ~0°C kalmalı
    expect(Math.abs(ankaraMos.biases.ecmwfIfs.tempKalmanBiasC)).toBeLessThan(0.35);

    // G_phase tek başına da Tw <= 0.2°C ve PoP >= %30 altında ılık eğitim kaymasını tam sıfırlamalı
    const snowEdgeGate = computeRegimeGateFactor({
      trainingRegimeSummary: {
        meanTemp2mC: 11.0,
        meanTemp850C: null,
        meanWind850U: null,
        meanWind850V: null
      },
      targetSynopticContext: {
        wetBulbC: 0.1,
        popPct: 60
      },
      kalmanShiftC: 1.8
    });
    expect(snowEdgeGate).toBe(0);
  });
});
