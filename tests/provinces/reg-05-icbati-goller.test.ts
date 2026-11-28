import { describe, expect, it } from "vitest";
import type { BursaMeshSnapshot, QcStationObservation } from "../../lib/bursa-mesh";
import {
  blendKalmanCorrectedScalar,
  type ProvinceScopedLedgerStationPoint,
  trainKalmanMos
} from "../../lib/kalman-mos";
import type { MetarNetworkStation, RawMetarRecord } from "../../lib/metar-verify";
import { sanitizeBursaMeshToStrictTr16 } from "../../lib/provinces/bursa-vault-guard";
import {
  computeTrDailyClimatologyNormal,
  TR81_CLIMATOLOGY_1991_2020
} from "../../lib/provinces/climatology-1991-2020";
import {
  applyDirectionalBarrierRules,
  resolveProvinceTargetMetadata,
  solveProvinceTopographicSurface
} from "../../lib/provinces/engine/province-cressman";
import { computeProvinceLiveVerticalProfile } from "../../lib/provinces/engine/province-vertical-profile";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import { resolveProvinceElevationBandSpecs } from "../../lib/provinces/hypsometric-bands-tr81";
import defaultTr03, {
  PROVINCE_SPEC_TR_03,
  TR_03_BESPOKE_MODIFIERS
} from "../../lib/provinces/specs/tr-03";
import defaultTr15, {
  PROVINCE_SPEC_TR_15,
  TR_15_BESPOKE_MODIFIERS
} from "../../lib/provinces/specs/tr-15";
import defaultTr32, {
  PROVINCE_SPEC_TR_32,
  TR_32_BESPOKE_MODIFIERS
} from "../../lib/provinces/specs/tr-32";
import defaultTr43, {
  PROVINCE_SPEC_TR_43,
  TR_43_BESPOKE_MODIFIERS
} from "../../lib/provinces/specs/tr-43";
import type { ProvinceSpec } from "../../lib/provinces/types";
import type { HybridModelSnapshot } from "../../lib/weather-types";

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

describe("Wave 3A — REG-05 (İç Batı Anadolu Yükseltisi & Göller Bölgesi: TR-03, TR-15, TR-32, TR-43)", () => {
  it("Dört ilin ProvinceSpec şeması, 9-nokta şablonu, 4-bant hipsometrisi ve ADM1 poligon koordinatları %100 tutarlıdır", () => {
    expect(defaultTr03).toBe(PROVINCE_SPEC_TR_03);
    expect(defaultTr15).toBe(PROVINCE_SPEC_TR_15);
    expect(defaultTr32).toBe(PROVINCE_SPEC_TR_32);
    expect(defaultTr43).toBe(PROVINCE_SPEC_TR_43);

    const allSpecs: readonly ProvinceSpec[] = [
      PROVINCE_SPEC_TR_03,
      PROVINCE_SPEC_TR_15,
      PROVINCE_SPEC_TR_32,
      PROVINCE_SPEC_TR_43
    ];

    for (const spec of allSpecs) {
      expect(spec.calibrationTier).toBe("TIER_A_WMO");
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toHaveLength(12);
      expect(spec.primaryCenter.monthlyTminNormalsC).toHaveLength(12);
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.stencil9Points.some((p) => p.role === "target")).toBe(true);

      const centerRes = resolveProvinceCode({
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon
      });
      expect(centerRes.provinceCode).toBe(spec.provinceCode);

      for (const loc of spec.curatedSubLocations) {
        const locRes = resolveProvinceCode({ lat: loc.lat, lon: loc.lon });
        expect(locRes.provinceCode).toBe(spec.provinceCode);
      }

      for (const sp of spec.stencil9Points) {
        const spRes = resolveProvinceCode({ lat: sp.lat, lon: sp.lon });
        expect(spRes.provinceCode).toBe(spec.provinceCode);
      }

      const [k0, k1, k2, k3] = spec.verticalProfileSpec.piecewiseKnotsM;
      expect(k0).toBeLessThan(k1);
      expect(k1).toBeLessThan(k2);
      expect(k2).toBeLessThan(k3);
      expect(k3).toBeLessThanOrEqual(spec.verticalProfileSpec.maxPhysicalPeakM);

      const resolvedBands = resolveProvinceElevationBandSpecs({
        provinceCode: spec.provinceCode,
        referenceElevationM: spec.primaryCenter.demVerifiedElevationM
      });
      expect(resolvedBands).toHaveLength(4);
      expect(resolvedBands[0].elevationM).toBeLessThan(resolvedBands[1].elevationM);
      expect(resolvedBands[1].elevationM).toBeLessThan(resolvedBands[2].elevationM);
      expect(resolvedBands[2].elevationM).toBeLessThan(resolvedBands[3].elevationM);

      const basinIds = spec.subBasins.map((b) => b.id);
      for (const bA of basinIds) {
        expect(spec.barrierCouplingMatrix[bA]?.[bA]).toBe(1.0);
        for (const bB of basinIds) {
          const w = spec.barrierCouplingMatrix[bA]?.[bB];
          expect(typeof w).toBe("number");
          expect(w).toBeGreaterThanOrEqual(0);
          expect(w).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("TR-43 Kütahya — Bursa Domaniç–İnegöl %0.00 sınır yalıtımını, Murat Dağı (2309 m) tavanını ve Simav grabeni vs LTBZ Altıntaş ayaz çanağı ayrımını sağlar", () => {
    expect(PROVINCE_SPEC_TR_43.primaryCenter.demVerifiedElevationM).toBe(969);
    expect(PROVINCE_SPEC_TR_43.primaryCenter.wmoId).toBe("17155");
    expect(PROVINCE_SPEC_TR_43.verticalProfileSpec.maxPhysicalPeakM).toBe(2309);
    expect(PROVINCE_SPEC_TR_43.waterBodies).toEqual([]);
    expect(PROVINCE_SPEC_TR_43.icaoWhitelist).toEqual(["LTBZ", "LTBN"]);
    expect(PROVINCE_SPEC_TR_43.icaoWhitelist).not.toContain("LTBR");
    expect(TR_43_BESPOKE_MODIFIERS.coldBasinAirportIcaos).toEqual(["LTBZ"]);

    // Topografik sınır testi: Domaniç (886 m) TR-43 Kütahya'da, İnegöl (293 m) TR-16 Bursa'da kalır
    expect(resolveProvinceCode({ lat: 39.7853, lon: 29.5847 }).provinceCode).toBe("TR-43");
    expect(resolveProvinceCode({ lat: 40.0781, lon: 29.5133 }).provinceCode).toBe("TR-16");

    // Simav çöküntü ovası (809 m) ayaz duyarlılığı Altıntaş/LTBZ (1011 m) çanağından çok daha düşüktür
    const simavOverride = PROVINCE_SPEC_TR_43.stationOverrides["17748"];
    const ltbzOverride = PROVINCE_SPEC_TR_43.stationOverrides.LTBZ;
    expect(simavOverride.demElevationM).toBe(809);
    expect(ltbzOverride.demElevationM).toBe(1011);
    expect(simavOverride.coldPoolSusceptibility).toBeLessThan(0.35);
    expect(ltbzOverride.coldPoolSusceptibility).toBeGreaterThanOrEqual(0.9);
    expect(ltbzOverride.excludeFromCenterHeadline).toBe(true);

    // 1) Bursa TR-16 çalışma zamanı süzgeci Kütahya istasyonlarını (Domaniç 18094 & LTBZ) %0.00 sızıntıyla temizler
    const makeMockObs = (
      id: string,
      lat: number,
      lon: number,
      elev: number,
      tempC: number,
      icaoId?: string
    ): QcStationObservation => ({
      station: {
        id,
        name: id,
        icaoId,
        lat,
        lon,
        elevationM: elev,
        zone: "urban_plain",
        barrierGroup: "BURSA_OVA",
        tier: 1,
        urbanFraction: 0.5,
        coldPoolSusceptibility: 0.3
      },
      observedAtIso: "2026-11-28T03:00:00Z",
      tempC,
      dewPointC: tempC - 3,
      relHumidityPct: 80,
      pressureMslHpa: 1018,
      pressureStationHpa: null,
      windSpeedKt: 4,
      windGustKt: null,
      windDirDeg: 40,
      precip10MinMm: 0,
      precip1HrMm: 0,
      precip24HrMm: 0,
      visibilityM: 10000,
      snowDepthCm: null,
      isPrecipitating: false,
      hasTenthDegreePrecision: true,
      source: "MGM_10MIN",
      ageMinutes: 5,
      freshnessWeight: 1,
      qcFlags: [],
      qcWeight: 1,
      reducedTempAtRefC: tempC,
      madZScore: 0
    });

    const mixedMesh: BursaMeshSnapshot = {
      fetchedAtIso: "2026-11-28T03:00:00Z",
      isBursaRegion: true,
      stations: [
        makeMockObs("17116", 40.2308, 29.0133, 100, 7.5), // Bursa Merkez (TR-16)
        makeMockObs("18094", 39.7853, 29.5847, 886, -2.5), // Domaniç (TR-43 -> ELENMELİ!)
        makeMockObs("ICAO_LTBZ", 39.1114, 30.13, 1011, -9.0, "LTBZ") // Zafer Meydan (TR-43 -> ELENMELİ!)
      ],
      acceptedCount: 3,
      rejectedCount: 0,
      tier1OnlineCount: 3,
      verticalProfile: {
        lapseRateCPerKm: -5.8,
        lowerLapseCPerKm: -5.5,
        midLapseCPerKm: -6.0,
        upperLapseCPerKm: -6.2,
        inversionStrengthC: 0,
        boundaryLayerState: "STANDARD_MIXED",
        ovaRefTempC: 7.5,
        mountainRefTempC: -3.0,
        measuredPairCount: 1,
        isDirectlyMeasured: true
      }
    };

    const sanitizedBursa = sanitizeBursaMeshToStrictTr16(
      mixedMesh,
      (lat, lon) => resolveProvinceCode({ lat, lon }).provinceCode
    );
    expect(sanitizedBursa.stations.map((s) => s.station.id)).toEqual(["17116"]);

    // 2) Wave 2 3B Cressman çözücüsü Kütahya (TR-43) içinde Bursa İnegöl (TR-16) istasyonunu %100 reddeder
    const kutahyaSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_43,
      target: {
        lat: PROVINCE_SPEC_TR_43.primaryCenter.lat,
        lon: PROVINCE_SPEC_TR_43.primaryCenter.lon,
        elevationM: PROVINCE_SPEC_TR_43.primaryCenter.demVerifiedElevationM
      },
      stations: [
        {
          stationId: 17155,
          provinceCode: "TR-43",
          name: "Kütahya Merkez",
          lat: 39.4171,
          lon: 29.9891,
          elevationM: 969,
          tempC: -1.5,
          subBasinId: "KUTAHYA_CENTRAL_PLAIN"
        },
        {
          stationId: 17984,
          provinceCode: "TR-16",
          name: "İnegöl (Bursa Sızıntı Testi)",
          lat: 40.0781,
          lon: 29.5133,
          elevationM: 293,
          tempC: 9.2
        }
      ],
      drivers: {
        localHour: 3,
        isNight: true,
        cloudCoverPct: 15
      }
    });
    expect(kutahyaSurface).not.toBeNull();
    expect(kutahyaSurface!.rejectedCrossBorderCount).toBe(1);
    expect(kutahyaSurface!.acceptedStationCount).toBe(1);
    expect(kutahyaSurface!.tempC).toBeCloseTo(-1.5, 1);

    // 3) Kalman MOS eğitimi de TR-16 defter sızıntısını reddeder ve LTBZ kırsal ayazını bastırır
    const baseMs = Date.parse("2026-11-27T18:00:00Z");
    const hours = 12;
    const utcTimeIndex = new Map<string, number>();
    const ledger: ProvinceScopedLedgerStationPoint[] = [];
    for (let h = 0; h < hours; h++) {
      const ms = baseMs + h * 3600_000;
      const uKey = new Date(ms).toISOString().slice(0, 16);
      utcTimeIndex.set(uKey, h);
      ledger.push({
        stationId: "KUT_17155",
        stationProvinceCode: "TR-43",
        utcHourKey: uKey,
        observedAtMs: ms,
        lat: 39.4171,
        lon: 29.9891,
        elevationM: 969,
        tempC: -1.5,
        dewPointC: -4.0,
        pressureMslHpa: 1021,
        windSpeedKmh: 5,
        windDirDeg: 45,
        precipMmHr: 0,
        hasPrecip: false
      });
      ledger.push({
        stationId: "INEGOL_TR16",
        stationProvinceCode: "TR-16",
        utcHourKey: uKey,
        observedAtMs: ms,
        lat: 39.68,
        lon: 29.62,
        elevationM: 620,
        tempC: 6.5,
        dewPointC: 3.0,
        pressureMslHpa: 1020,
        windSpeedKmh: 6,
        windDirDeg: 30,
        precipMmHr: 0,
        hasPrecip: false
      });
    }

    const ltbzHistory: RawMetarRecord[] = Array.from({ length: hours }, (_, h) => ({
      icaoId: "LTBZ",
      lat: 39.1114,
      lon: 30.13,
      elev: 1011,
      obsTime: Math.floor((baseMs + h * 3600_000) / 1000),
      temp: -9.5,
      dewp: -11.0,
      wspd: 2,
      altim: 1022
    }));

    const ltbzNetwork: MetarNetworkStation[] = [
      {
        station: {
          icaoId: "LTBZ",
          stationName: "Zafer Airport",
          distanceKm: 36,
          elevationM: 1011,
          obsTimeIso: new Date(baseMs + 11 * 3600_000).toISOString(),
          ageMinutes: 15,
          rawOb: "METAR LTBZ",
          tempC: -9.5,
          dewPointC: -11.0,
          windSpeedKmh: 3.7,
          windGustKmh: null,
          windDirectionDeg: 20,
          qnhHpa: 1022,
          visibilityKm: 10,
          wxString: null
        },
        history: ltbzHistory
      }
    ];

    const kutahyaMos = trainKalmanMos({
      network: ltbzNetwork,
      cityElevationM: 969,
      cityLat: 39.4171,
      cityLon: 29.9891,
      envLapseRateCPerM: -0.005,
      modelHourlyUtc: {
        temperature_2m_ecmwf_ifs: Array(hours).fill(-1.5),
        temperature_2m_icon_seamless: Array(hours).fill(-1.5),
        temperature_2m_gfs_seamless: Array(hours).fill(-1.5)
      },
      utcTimeIndex,
      nowUtcMs: baseMs + 11 * 3600_000,
      utcOffsetSeconds: 10800,
      ledgerStationHistory: ledger,
      provinceCode: "TR-43",
      kalmanTempBiasCapC: PROVINCE_SPEC_TR_43.qcAndMosBounds.kalmanTempBiasCapC,
      coldBasinAirportIcaos: TR_43_BESPOKE_MODIFIERS.coldBasinAirportIcaos
    });

    expect(kutahyaMos.summary.stationIds).toContain("KUT_17155");
    expect(kutahyaMos.summary.stationIds).not.toContain("INEGOL_TR16");
    expect(Math.abs(kutahyaMos.biases.ecmwfIfs.tempKalmanBiasC)).toBeLessThan(0.35);
  });

  it("TR-03 Afyonkarahisar — Kapalı havza kar çanağı radyasyon ayazını (-22..-27°C), snowpackBoostFactor=1.45 ve kalmanTempBiasCapC=6.5 düzeltmesini doğrular", () => {
    expect(PROVINCE_SPEC_TR_03.primaryCenter.demVerifiedElevationM).toBe(1034);
    expect(PROVINCE_SPEC_TR_03.primaryCenter.wmoId).toBe("17190");
    expect(PROVINCE_SPEC_TR_03.icaoWhitelist).toEqual(["LTAH"]);
    expect(PROVINCE_SPEC_TR_03.verticalProfileSpec.maxPhysicalPeakM).toBe(2519);
    expect(PROVINCE_SPEC_TR_03.qcAndMosBounds.kalmanTempBiasCapC).toBe(6.5);
    expect(PROVINCE_SPEC_TR_03.qcAndMosBounds.minPlausibleTempC).toBeLessThanOrEqual(-30);
    expect(TR_03_BESPOKE_MODIFIERS.snowpackBoostFactor).toBe(1.45);
    expect(PROVINCE_SPEC_TR_03.inversionAndWedgeSpec.topographicEnclosureIndex).toBeGreaterThanOrEqual(
      0.85
    );
    expect(
      PROVINCE_SPEC_TR_03.inversionAndWedgeSpec.snowAlbedoFeedback.maxExtraRadiativeCoolingC
    ).toBeGreaterThanOrEqual(7.0);
    expect(PROVINCE_SPEC_TR_03.inversionAndWedgeSpec.persistentStratusLock.enabled).toBe(true);
    expect(PROVINCE_SPEC_TR_03.inversionAndWedgeSpec.shallowColdWedgeRule).toBeDefined();

    // 1) Wave 2 Z_base-bağıl dikey profil çözücüsü Afyon kar örtüsü altında güçlü pozitif enversiyon üretir
    const afyonSnowInversion = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_03,
      stations: [
        {
          stationId: 17190,
          provinceCode: "TR-03",
          lat: 38.738,
          lon: 30.5604,
          elevationM: 1034,
          tempC: -24.5,
          snowDepthCm: 18,
          windSpeedKmh: 3
        },
        {
          stationId: 18006,
          provinceCode: "TR-03",
          lat: 38.51,
          lon: 31.18,
          elevationM: 1580,
          tempC: -17.5,
          snowDepthCm: 35,
          windSpeedKmh: 8
        }
      ],
      cloudCoverPct: 8,
      isNight: true,
      hasSnowpack: true,
      wind10mSpeedKmh: 3
    });
    expect(afyonSnowInversion.snowpackAmplified).toBe(true);
    expect(afyonSnowInversion.lowerPoolLapseCPerKm).toBeGreaterThan(5.0);
    expect(afyonSnowInversion.inversionStrengthC).toBeGreaterThan(2.5);
    expect(afyonSnowInversion.boundaryLayerState).toBe("STRONG_INVERSION");

    // 2) Kışın taze kar örtüsü üstünde Afyon çanağı -25.0°C'ye düşerken NWP modelleri -18.5°C (+6.5°C sıcak hata) veriyor
    const baseMs = Date.parse("2026-01-18T00:00:00Z");
    const hours = 48;
    const utcTimeIndex = new Map<string, number>();
    const afyonLedger: ProvinceScopedLedgerStationPoint[] = [];

    for (let h = 0; h < hours; h++) {
      const ms = baseMs + h * 3600_000;
      const uKey = new Date(ms).toISOString().slice(0, 16);
      utcTimeIndex.set(uKey, h);
      afyonLedger.push({
        stationId: "AFYON_17190",
        stationProvinceCode: "TR-03",
        utcHourKey: uKey,
        observedAtMs: ms,
        lat: 38.738,
        lon: 30.5604,
        elevationM: 1034,
        tempC: -25.0,
        dewPointC: -27.5,
        pressureMslHpa: 1030,
        windSpeedKmh: 3,
        windDirDeg: 60,
        precipMmHr: 0,
        hasPrecip: false
      });
    }

    const modelHourlyUtc: Record<string, Array<number | null>> = {
      temperature_2m_ecmwf_ifs: Array.from(
        { length: hours },
        (_, h) => -18.5 + (h % 2 === 0 ? 0.1 : -0.1)
      ),
      temperature_2m_ecmwf_aifs025_single: Array(hours).fill(-18.4),
      temperature_2m_icon_seamless: Array(hours).fill(-18.6),
      temperature_2m_ukmo_seamless: Array(hours).fill(-18.5),
      temperature_2m_meteofrance_seamless: Array(hours).fill(-18.4),
      temperature_2m_gfs_seamless: Array(hours).fill(-18.3),
      temperature_2m_gem_seamless: Array(hours).fill(-18.5),
      temperature_2m_jma_seamless: Array(hours).fill(-18.5),
      temperature_850hPa_ecmwf_ifs: Array(hours).fill(-10.5)
    };

    const capped45Mos = trainKalmanMos({
      network: [],
      cityElevationM: 1034,
      cityLat: 38.738,
      cityLon: 30.5604,
      envLapseRateCPerM: 0.0028,
      modelHourlyUtc,
      utcTimeIndex,
      nowUtcMs: baseMs + (hours - 1) * 3600_000,
      utcOffsetSeconds: 10800,
      ledgerStationHistory: afyonLedger,
      provinceCode: "TR-03",
      kalmanTempBiasCapC: 4.5
    });

    const afyon65Mos = trainKalmanMos({
      network: [],
      cityElevationM: 1034,
      cityLat: 38.738,
      cityLon: 30.5604,
      envLapseRateCPerM: 0.0028,
      modelHourlyUtc,
      utcTimeIndex,
      nowUtcMs: baseMs + (hours - 1) * 3600_000,
      utcOffsetSeconds: 10800,
      ledgerStationHistory: afyonLedger,
      provinceCode: "TR-03",
      kalmanTempBiasCapC: PROVINCE_SPEC_TR_03.qcAndMosBounds.kalmanTempBiasCapC,
      coldBasinAirportIcaos: TR_03_BESPOKE_MODIFIERS.coldBasinAirportIcaos
    });

    const predCapped45 = blendKalmanCorrectedScalar({
      snapshot: makeUniformSnapshot(-18.5),
      mos: capped45Mos,
      param: "temperature",
      leadHour: 2,
      localHour: 5,
      fallback: -18.5,
      targetSynopticContext: { temp850C: -10.5 }
    });
    const predAfyon65 = blendKalmanCorrectedScalar({
      snapshot: makeUniformSnapshot(-18.5),
      mos: afyon65Mos,
      param: "temperature",
      leadHour: 2,
      localHour: 5,
      fallback: -18.5,
      targetSynopticContext: { temp850C: -10.5 }
    });

    expect(afyon65Mos.biases.ecmwfIfs.tempKalmanBiasC).toBeGreaterThan(5.9);
    expect(capped45Mos.biases.ecmwfIfs.tempKalmanBiasC).toBeLessThanOrEqual(4.5);
    expect(predAfyon65).toBeLessThan(predCapped45 - 0.5);
    expect(predAfyon65).toBeLessThan(-24.2);
    expect(Math.abs(predAfyon65 - -25.0)).toBeLessThan(0.8);
  });

  it("TR-32 Isparta vs TR-15 Burdur — Batı Toros güneyli (165°–215°) orografik yağış cepleri vs 0.78 yağış gölgesi, göl fetch < 35 km ve LTFC yalıtımı asimetrisini doğrular", () => {
    // 1) METAR ve WMO İstasyon Yalıtımı: LTFC yalnızca Isparta'dadır, Burdur'un icaoWhitelist listesi boştur!
    expect(PROVINCE_SPEC_TR_32.icaoWhitelist).toEqual(["LTFC"]);
    expect(TR_32_BESPOKE_MODIFIERS.coldBasinAirportIcaos).toEqual(["LTFC"]);
    expect(PROVINCE_SPEC_TR_32.stationOverrides.LTFC.demElevationM).toBe(864);
    expect(PROVINCE_SPEC_TR_32.stationOverrides.LTFC.excludeFromCenterHeadline).toBe(true);
    expect(PROVINCE_SPEC_TR_32.primaryCenter.demVerifiedElevationM).toBe(1050);
    expect(PROVINCE_SPEC_TR_32.primaryCenter.wmoId).toBe("17240");

    expect(PROVINCE_SPEC_TR_15.icaoWhitelist).toEqual([]);
    expect(PROVINCE_SPEC_TR_15.icaoWhitelist).not.toContain("LTFC");
    expect(PROVINCE_SPEC_TR_15.primaryCenter.demVerifiedElevationM).toBe(950);
    expect(PROVINCE_SPEC_TR_15.primaryCenter.wmoId).toBe("17241");
    expect(TR_15_BESPOKE_MODIFIERS.rainShadowMultiplier).toBe(0.78);

    // 2) Göller Bölgesi Su Kütleleri: Eğirdir (917 m) & Beyşehir (tatlı su), Burdur (845 m tuzlu) & Salda; hepsinde fetch < 35 km!
    expect(PROVINCE_SPEC_TR_32.waterBodies.length).toBeGreaterThanOrEqual(2);
    const egirdir = PROVINCE_SPEC_TR_32.waterBodies[0];
    expect(egirdir.kind).toBe("fresh_lake");
    expect(egirdir.surfaceElevationM).toBe(917);
    expect(
      egirdir.subBasinInfluenceWeights.EGIRDIR_GELENDOST_ORCHARD_SHORE
    ).toBeGreaterThanOrEqual(0.7);
    for (const wb of PROVINCE_SPEC_TR_32.waterBodies) {
      expect(wb.effectiveFetchKm).toBeLessThan(35);
      expect(wb.dekWatchDeltaTC).toBeGreaterThanOrEqual(16);
    }

    expect(PROVINCE_SPEC_TR_15.waterBodies.length).toBeGreaterThanOrEqual(2);
    const burdurLake = PROVINCE_SPEC_TR_15.waterBodies[0];
    expect(burdurLake.kind).toBe("alkaline_lake");
    expect(burdurLake.surfaceElevationM).toBe(845);
    expect(burdurLake.freezingPointC).toBeLessThan(0);
    for (const wb of PROVINCE_SPEC_TR_15.waterBodies) {
      expect(wb.effectiveFetchKm).toBeLessThan(35);
    }

    // 3) Gerçek Wave 2 `applyDirectionalBarrierRules` Motoru Altında Antalya Körfezi Güneyli (190°, 48 km/s) Nemli Akış Testi
    const southerlyDrivers = {
      localHour: 14,
      month: 12,
      isNight: false,
      cloudCoverPct: 92,
      wind850DirDeg: 190,
      wind850SpeedKmh: 48
    };

    const ispartaSutculerTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_32, {
      lat: 37.4939,
      lon: 30.9721,
      elevationM: 985,
      subBasinId: "SUTCULER_AKSU_OROG_POCKET"
    });
    const ispartaDavrazTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_32, {
      lat: 37.7703,
      lon: 30.7425,
      elevationM: 1951,
      subBasinId: "DAVRAZ_DEDEGOL_ALPINE"
    });
    const burdurCenterTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_15, {
      lat: 37.722,
      lon: 30.294,
      elevationM: 950,
      subBasinId: "BURDUR_TECTONIC_LAKE_BASIN"
    });

    const ispartaSutculerEffect = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_32,
      target: ispartaSutculerTarget,
      drivers: southerlyDrivers
    });
    const ispartaDavrazEffect = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_32,
      target: ispartaDavrazTarget,
      drivers: southerlyDrivers
    });
    const burdurCenterEffect = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_15,
      target: burdurCenterTarget,
      drivers: southerlyDrivers
    });

    expect(ispartaSutculerEffect.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(ispartaDavrazEffect.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(burdurCenterEffect.activeRegime).toBe("RAIN_SHADOW");

    expect(ispartaSutculerEffect.precipMultiplier).toBeGreaterThan(1.55);
    expect(ispartaDavrazEffect.precipMultiplier).toBeGreaterThan(1.55);
    expect(burdurCenterEffect.precipMultiplier).toBeCloseTo(0.78, 2);
    expect(
      ispartaSutculerEffect.precipMultiplier / burdurCenterEffect.precipMultiplier
    ).toBeGreaterThan(1.95);

    // 4) 1991–2020 WMO Resmi Klimatoloji Teyidi: Kışın Isparta yağışı > Burdur yağışı, yazın Burdur çanağı Isparta'dan sıcak/kuru!
    const climIsparta = TR81_CLIMATOLOGY_1991_2020["TR-32"];
    const climBurdur = TR81_CLIMATOLOGY_1991_2020["TR-15"];
    const djfIspartaMm =
      climIsparta.precipMm[11] + climIsparta.precipMm[0] + climIsparta.precipMm[1];
    const djfBurdurMm =
      climBurdur.precipMm[11] + climBurdur.precipMm[0] + climBurdur.precipMm[1];
    expect(djfIspartaMm).toBeGreaterThan(djfBurdurMm * 1.25);

    const julyIsparta = computeTrDailyClimatologyNormal({
      provinceCode: "TR-32",
      lat: PROVINCE_SPEC_TR_32.primaryCenter.lat,
      lon: PROVINCE_SPEC_TR_32.primaryCenter.lon,
      elevationM: PROVINCE_SPEC_TR_32.primaryCenter.demVerifiedElevationM,
      dayOfYear: 200
    });
    const julyBurdur = computeTrDailyClimatologyNormal({
      provinceCode: "TR-15",
      lat: PROVINCE_SPEC_TR_15.primaryCenter.lat,
      lon: PROVINCE_SPEC_TR_15.primaryCenter.lon,
      elevationM: PROVINCE_SPEC_TR_15.primaryCenter.demVerifiedElevationM,
      dayOfYear: 200
    });
    expect(julyBurdur.tmaxNormalC).toBeGreaterThan(julyIsparta.tmaxNormalC + 1.0);
    expect(julyBurdur.dailyPrecipNormalMm).toBeLessThan(julyIsparta.dailyPrecipNormalMm);
  });
});
