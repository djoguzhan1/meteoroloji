import { describe, expect, it } from "vitest";
import {
  blendKalmanCorrectedScalar,
  type ProvinceScopedLedgerStationPoint,
  trainKalmanMos
} from "../../lib/kalman-mos";
import {
  getAllowedTurkeyIcaosForProvince,
  isIcaoAllowedForProvince,
  type MetarNetworkStation,
  type RawMetarRecord
} from "../../lib/metar-verify";
import { TR81_CLIMATOLOGY_1991_2020 } from "../../lib/provinces/climatology-1991-2020";
import { PROVINCE_CALIBRATION_TR_06 } from "../../lib/provinces/emos-weights/tr-06";
import { PROVINCE_CALIBRATION_TR_26 } from "../../lib/provinces/emos-weights/tr-26";
import { PROVINCE_CALIBRATION_TR_40 } from "../../lib/provinces/emos-weights/tr-40";
import { PROVINCE_CALIBRATION_TR_71 } from "../../lib/provinces/emos-weights/tr-71";
import {
  applyDirectionalBarrierRules,
  resolveProvinceTargetMetadata,
  solveProvinceTopographicSurface
} from "../../lib/provinces/engine/province-cressman";
import {
  computeProvinceLiveVerticalProfile,
  integrateProvinceVerticalDeltaC
} from "../../lib/provinces/engine/province-vertical-profile";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import { resolveProvinceElevationBandSpecs } from "../../lib/provinces/hypsometric-bands-tr81";
import defaultTr06, {
  PROVINCE_SPEC_TR_06,
  TR_06_BESPOKE_MODIFIERS
} from "../../lib/provinces/specs/tr-06";
import defaultTr26, {
  PROVINCE_SPEC_TR_26,
  TR_26_BESPOKE_MODIFIERS
} from "../../lib/provinces/specs/tr-26";
import defaultTr40, {
  PROVINCE_SPEC_TR_40,
  TR_40_BESPOKE_MODIFIERS
} from "../../lib/provinces/specs/tr-40";
import defaultTr71, {
  PROVINCE_SPEC_TR_71,
  TR_71_BESPOKE_MODIFIERS
} from "../../lib/provinces/specs/tr-71";
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

describe("Wave 3B — REG-13 (Yukarı Sakarya & Başkent İç Anadolu Çanakları: TR-06, TR-26, TR-40, TR-71)", () => {
  it("Dört ilin ProvinceSpec şeması, 0 sahte DEK (waterBodies=[]), METAR beyaz listesi, 4-bant hipsometrisi ve ADM1 poligon koordinatları %100 tutarlıdır", () => {
    expect(defaultTr06).toBe(PROVINCE_SPEC_TR_06);
    expect(defaultTr26).toBe(PROVINCE_SPEC_TR_26);
    expect(defaultTr40).toBe(PROVINCE_SPEC_TR_40);
    expect(defaultTr71).toBe(PROVINCE_SPEC_TR_71);

    const allSpecs: readonly ProvinceSpec[] = [
      PROVINCE_SPEC_TR_06,
      PROVINCE_SPEC_TR_26,
      PROVINCE_SPEC_TR_40,
      PROVINCE_SPEC_TR_71
    ];

    for (const spec of allSpecs) {
      // Sıfır sahte deniz etkisi DEK!
      expect(spec.waterBodies).toEqual([]);
      expect(spec.aridAndSevereDrivers.coastalWaterspoutSusceptibility).toBe(0);

      // lib/metar-verify.ts ile birebir ICAO whitelist uyumu
      expect(spec.icaoWhitelist).toEqual(
        getAllowedTurkeyIcaosForProvince(spec.provinceCode)
      );

      // Klimatoloji ve 9-nokta şablonu bütünlüğü
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toHaveLength(12);
      expect(spec.primaryCenter.monthlyTminNormalsC).toHaveLength(12);
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toEqual(
        TR81_CLIMATOLOGY_1991_2020[spec.provinceCode].tmaxC
      );
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.stencil9Points.some((p) => p.role === "target")).toBe(true);

      // ADM1 poligon üyeliği: merkez, alt lokasyonlar ve 9-nokta şablonu kendi il sınırları içinde kalır
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

      // Hipsometrik düğümler ve 4-bant monotonluğu
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

      // Bariyer kuplaj matrisi [0, 1] ve köşegen = 1.0 kontrolü
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

  it("TR-06 Ankara — Esenboğa (LTAC, 949 m kırsal ayaz çanağı) vs Ankara Merkez (17130 Kalaba, 891 m Kentsel Isı Adası) ayrımını, İncek–Elmadağ kar basamağını ve Kızılcahamam kuzey geçişini doğrular", () => {
    expect(PROVINCE_SPEC_TR_06.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_06.primaryCenter.wmoId).toBe("17130");
    expect(PROVINCE_SPEC_TR_06.primaryCenter.demVerifiedElevationM).toBe(891);
    expect(PROVINCE_SPEC_TR_06.primaryCenter.urbanFraction).toBe(0.85);
    expect(PROVINCE_SPEC_TR_06.icaoWhitelist).toEqual(["LTAC", "LTAB", "LTAD"]);
    expect(isIcaoAllowedForProvince("LTAC", "TR-06")).toBe(true);
    expect(isIcaoAllowedForProvince("LTAB", "TR-06")).toBe(true);
    expect(isIcaoAllowedForProvince("LTAD", "TR-06")).toBe(true);
    expect(isIcaoAllowedForProvince("LTBY", "TR-06")).toBe(false);
    expect(PROVINCE_CALIBRATION_TR_06.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_CALIBRATION_TR_06.wmoStationId).toBe("17130");

    const ltacOverride = PROVINCE_SPEC_TR_06.stationOverrides.LTAC;
    expect(ltacOverride.demElevationM).toBe(949);
    expect(ltacOverride.subBasinId).toBe("cubuk_esenboga_frost_basin");
    expect(ltacOverride.excludeFromCenterHeadline).toBe(true);
    expect(ltacOverride.coldPoolSusceptibility).toBe(0.88);
    expect(ltacOverride.urbanFraction).toBeLessThanOrEqual(0.08);
    expect(TR_06_BESPOKE_MODIFIERS.coldBasinAirportIcaos).toEqual(["LTAC"]);

    // 1) Açık ve sakin kış gecesinde LTAC (-9.5°C) merkezden (17130: -3.0°C) 6.5°C daha soğuk düşer:
    //    Ankara Merkez çözümü 17130 kentsel ısı adasını korur, LTAC tek başına kaldığında dahi Oke UHI unbias devreye girer!
    const clearCalmNightDrivers = {
      localHour: 4,
      month: 1,
      isNight: true,
      cloudCoverPct: 5,
      wind10mSpeedKmh: 4,
      wind850SpeedKmh: 10
    };

    const centerWithBoth = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_06,
      target: {
        lat: PROVINCE_SPEC_TR_06.primaryCenter.lat,
        lon: PROVINCE_SPEC_TR_06.primaryCenter.lon,
        elevationM: 891,
        subBasinId: "ankara_urban_bowl",
        urbanFraction: 0.85
      },
      stations: [
        {
          stationId: 17130,
          provinceCode: "TR-06",
          name: "Ankara Bölge Kalaba",
          lat: 39.9727,
          lon: 32.8637,
          elevationM: 891,
          tempC: -3.0,
          subBasinId: "ankara_urban_bowl",
          urbanFraction: 0.85,
          coldPoolSusceptibility: 0.36
        },
        {
          stationId: "LTAC",
          icaoId: "LTAC",
          provinceCode: "TR-06",
          name: "Esenboğa Havalimanı",
          lat: 40.1281,
          lon: 32.995,
          elevationM: 949,
          tempC: -9.5,
          subBasinId: "cubuk_esenboga_frost_basin",
          urbanFraction: 0.04,
          coldPoolSusceptibility: 0.88,
          excludeFromCenterHeadline: true
        }
      ],
      drivers: clearCalmNightDrivers
    });

    expect(centerWithBoth).not.toBeNull();
    expect(centerWithBoth!.tempC).toBeGreaterThan(-3.5);
    expect(centerWithBoth!.tempC).toBeLessThan(-2.5);

    const centerFromLtacOnly = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_06,
      target: {
        lat: PROVINCE_SPEC_TR_06.primaryCenter.lat,
        lon: PROVINCE_SPEC_TR_06.primaryCenter.lon,
        elevationM: 891,
        subBasinId: "ankara_urban_bowl",
        urbanFraction: 0.85
      },
      stations: [
        {
          stationId: "LTAC",
          icaoId: "LTAC",
          provinceCode: "TR-06",
          name: "Esenboğa Havalimanı",
          lat: 40.1281,
          lon: 32.995,
          elevationM: 949,
          tempC: -9.5,
          subBasinId: "cubuk_esenboga_frost_basin",
          urbanFraction: 0.04,
          coldPoolSusceptibility: 0.88,
          excludeFromCenterHeadline: true
        }
      ],
      drivers: clearCalmNightDrivers
    });
    expect(centerFromLtacOnly).not.toBeNull();
    expect(centerFromLtacOnly!.contributions[0].usedColdBasinUnbias).toBe(true);
    expect(centerFromLtacOnly!.tempC).toBeGreaterThan(-6.5);

    // 2) Kalman MOS eğitiminde coldBasinAirportIcaos=["LTAC"] koruması kırsal Çubuk ayazını Ankara Merkez'e bulaştırmaz
    const baseMs = Date.parse("2026-01-14T18:00:00Z");
    const hours = 14;
    const utcTimeIndex = new Map<string, number>();
    const ankaraLedger: ProvinceScopedLedgerStationPoint[] = [];
    for (let h = 0; h < hours; h++) {
      const ms = baseMs + h * 3600_000;
      const uKey = new Date(ms).toISOString().slice(0, 16);
      utcTimeIndex.set(uKey, h);
      ankaraLedger.push({
        stationId: "ANK_17130",
        stationProvinceCode: "TR-06",
        utcHourKey: uKey,
        observedAtMs: ms,
        lat: 39.9727,
        lon: 32.8637,
        elevationM: 891,
        tempC: -3.0,
        dewPointC: -6.0,
        pressureMslHpa: 1024,
        windSpeedKmh: 4,
        windDirDeg: 40,
        precipMmHr: 0,
        hasPrecip: false
      });
    }

    const ltacHistory: RawMetarRecord[] = Array.from({ length: hours }, (_, h) => ({
      icaoId: "LTAC",
      lat: 40.1281,
      lon: 32.995,
      elev: 949,
      obsTime: Math.floor((baseMs + h * 3600_000) / 1000),
      temp: -9.5,
      dewp: -11.0,
      wspd: 2,
      altim: 1025
    }));
    const ltacNet: MetarNetworkStation[] = [
      {
        station: {
          icaoId: "LTAC",
          stationName: "Ankara Esenboga",
          distanceKm: 21,
          elevationM: 949,
          obsTimeIso: new Date(baseMs + (hours - 1) * 3600_000).toISOString(),
          ageMinutes: 10,
          rawOb: "METAR LTAC",
          tempC: -9.5,
          dewPointC: -11.0,
          windSpeedKmh: 3.7,
          windGustKmh: null,
          windDirectionDeg: 30,
          qnhHpa: 1025,
          visibilityKm: 10,
          wxString: null
        },
        history: ltacHistory
      }
    ];

    const ankaraMos = trainKalmanMos({
      network: ltacNet,
      cityElevationM: 891,
      cityLat: 39.9727,
      cityLon: 32.8637,
      envLapseRateCPerM: -0.0045,
      modelHourlyUtc: {
        temperature_2m_ecmwf_ifs: Array(hours).fill(-3.0),
        temperature_2m_icon_seamless: Array(hours).fill(-3.0),
        temperature_2m_gfs_seamless: Array(hours).fill(-3.0)
      },
      utcTimeIndex,
      nowUtcMs: baseMs + (hours - 1) * 3600_000,
      utcOffsetSeconds: 10800,
      ledgerStationHistory: ankaraLedger,
      provinceCode: "TR-06",
      kalmanTempBiasCapC: PROVINCE_SPEC_TR_06.qcAndMosBounds.kalmanTempBiasCapC,
      coldBasinAirportIcaos: TR_06_BESPOKE_MODIFIERS.coldBasinAirportIcaos
    });
    expect(Math.abs(ankaraMos.biases.ecmwfIfs.tempKalmanBiasC)).toBeLessThan(0.35);

    // 3) İncek–Gölbaşı (1115 m) ve Elmadağ (1750 m) cephesel yağış anında Ankara Merkez'den (891 m, +1.8°C) soğuktur (ilk kar tutan kuşak!)
    const frontalSnowProfile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_06,
      stations: [
        {
          stationId: 17130,
          provinceCode: "TR-06",
          lat: 39.9727,
          lon: 32.8637,
          elevationM: 891,
          tempC: 1.8,
          relHumidityPct: 92,
          isPrecipitating: true
        },
        {
          stationId: 17134,
          provinceCode: "TR-06",
          lat: 39.8032,
          lon: 32.8434,
          elevationM: 1115,
          tempC: 0.2,
          relHumidityPct: 96,
          isPrecipitating: true
        },
        {
          stationId: 20506,
          provinceCode: "TR-06",
          lat: 39.7981,
          lon: 32.9706,
          elevationM: 1750,
          tempC: -4.1,
          relHumidityPct: 98,
          isPrecipitating: true
        }
      ],
      cloudCoverPct: 100,
      isNight: false,
      wind850DirDeg: 215,
      wind850SpeedKmh: 36
    });
    const incekTempC =
      1.8 + integrateProvinceVerticalDeltaC(891, 1115, frontalSnowProfile);
    const elmadagTempC =
      1.8 + integrateProvinceVerticalDeltaC(891, 1750, frontalSnowProfile);
    expect(incekTempC).toBeLessThan(0.6);
    expect(elmadagTempC).toBeLessThan(-3.2);

    // 4) Kuzeyli (355°, 38 km/s) Karadeniz akışında Kızılcahamam–Çamlıdere orografik yükselme alırken Polatlı bozkırı yağış gölgesinde kalır
    const northerlyDrivers = {
      localHour: 13,
      month: 12,
      isNight: false,
      cloudCoverPct: 90,
      wind850DirDeg: 355,
      wind850SpeedKmh: 38
    };
    const kizilcahamamTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_06, {
      lat: 40.4729,
      lon: 32.6441,
      elevationM: 1033,
      subBasinId: "kizilcahamam_camlidere_north",
      zone: "mountain_slope"
    });
    const polatliTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_06, {
      lat: 39.5834,
      lon: 32.1624,
      elevationM: 886,
      subBasinId: "polatli_beypazari_steppe"
    });

    const kizilcahamamBarrier = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_06,
      target: kizilcahamamTarget,
      drivers: northerlyDrivers
    });
    const polatliBarrier = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_06,
      target: polatliTarget,
      drivers: northerlyDrivers
    });

    expect(kizilcahamamBarrier.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(kizilcahamamBarrier.precipMultiplier).toBeGreaterThan(1.15);
    expect(polatliBarrier.activeRegime).toBe("RAIN_SHADOW");
    expect(polatliBarrier.precipMultiplier).toBeLessThan(0.9);
  });

  it("TR-26 Eskişehir — Porsuk Ovası (~788 m) donan sis stratus kilidini, <-22°C kar-albedo ayazını ve Sarıcakaya (~220 m Orta Sakarya mikro-Akdeniz vadisi) tam yalıtımını doğrular", () => {
    expect(PROVINCE_SPEC_TR_26.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_26.primaryCenter.wmoId).toBe("17124");
    expect(PROVINCE_SPEC_TR_26.primaryCenter.demVerifiedElevationM).toBe(788);
    expect(PROVINCE_SPEC_TR_26.icaoWhitelist).toEqual(["LTBY", "LTBI"]);
    expect(isIcaoAllowedForProvince("LTBY", "TR-26")).toBe(true);
    expect(isIcaoAllowedForProvince("LTBI", "TR-26")).toBe(true);
    expect(isIcaoAllowedForProvince("LTBZ", "TR-26")).toBe(false);
    expect(PROVINCE_CALIBRATION_TR_26.wmoStationId).toBe("17124");

    // 1) Porsuk donan sis kilidi & kar örtüsü albedo geri beslemesi
    expect(PROVINCE_SPEC_TR_26.inversionAndWedgeSpec.persistentStratusLock.enabled).toBe(true);
    expect(
      PROVINCE_SPEC_TR_26.inversionAndWedgeSpec.persistentStratusLock.daytimeSolarDampingFactor
    ).toBeLessThanOrEqual(0.55);
    expect(
      PROVINCE_SPEC_TR_26.inversionAndWedgeSpec.snowAlbedoFeedback.maxExtraRadiativeCoolingC
    ).toBeGreaterThanOrEqual(7.0);
    expect(PROVINCE_SPEC_TR_26.qcAndMosBounds.kalmanTempBiasCapC).toBe(6.5);

    const porsukSnowInversion = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_26,
      stations: [
        {
          stationId: 17124,
          provinceCode: "TR-26",
          lat: 39.7833,
          lon: 30.5667,
          elevationM: 785,
          tempC: -23.4,
          snowDepthCm: 14,
          windSpeedKmh: 3,
          subBasinId: "porsuk_frost_fog_basin"
        },
        {
          stationId: 18092,
          provinceCode: "TR-26",
          lat: 39.8733,
          lon: 31.4889,
          elevationM: 1388,
          tempC: -15.8,
          snowDepthCm: 28,
          windSpeedKmh: 7,
          subBasinId: "sundiken_turkmen_ridges"
        }
      ],
      cloudCoverPct: 10,
      isNight: true,
      hasSnowpack: true,
      wind10mSpeedKmh: 3
    });
    expect(porsukSnowInversion.snowpackAmplified).toBe(true);
    expect(porsukSnowInversion.boundaryLayerState).toBe("STRONG_INVERSION");
    expect(porsukSnowInversion.lowerPoolLapseCPerKm).toBeGreaterThan(5.5);
    expect(porsukSnowInversion.inversionStrengthC).toBeGreaterThan(3.0);

    // 2) Sarıcakaya–Mihalgazi (~220 m, "Eskişehir'in Akdeniz'i") Sündiken Dağları (1826 m) arkasında Porsuk Ovası'ndan ayrıktır!
    const coupPorsukToSaricakaya =
      PROVINCE_SPEC_TR_26.barrierCouplingMatrix.porsuk_frost_fog_basin
        .saricakaya_sakarya_microvalley;
    expect(coupPorsukToSaricakaya).toBe(TR_26_BESPOKE_MODIFIERS.saricakayaPorsukMaxCoupling);
    expect(coupPorsukToSaricakaya).toBeLessThanOrEqual(0.08);
    expect(PROVINCE_SPEC_TR_26.stationOverrides["18091"].demElevationM).toBe(220);
    expect(PROVINCE_SPEC_TR_26.stationOverrides["18091"].excludeFromCenterHeadline).toBe(true);

    const freezingFogDrivers = {
      localHour: 9,
      month: 1,
      isNight: false,
      cloudCoverPct: 95,
      wind10mSpeedKmh: 4,
      hasSnowpack: true
    };
    const stationsWithWarmSaricakaya = [
      {
        stationId: 17126,
        provinceCode: "TR-26" as const,
        name: "Eskişehir Bölge Porsuk",
        lat: 39.7656,
        lon: 30.5502,
        elevationM: 788,
        tempC: -7.2,
        relHumidityPct: 98,
        subBasinId: "porsuk_frost_fog_basin"
      },
      {
        stationId: 18091,
        provinceCode: "TR-26" as const,
        name: "Sarıcakaya (Orta Sakarya 220 m)",
        lat: 40.0422,
        lon: 30.6136,
        elevationM: 220,
        tempC: 9.8,
        relHumidityPct: 68,
        subBasinId: "saricakaya_sakarya_microvalley"
      }
    ];

    const porsukSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_26,
      target: {
        lat: 39.7661,
        lon: 30.9556, // Alpu (Porsuk doğu tabanı, merkezden ~35 km doğuda)
        elevationM: 771,
        subBasinId: "porsuk_frost_fog_basin"
      },
      stations: stationsWithWarmSaricakaya,
      drivers: freezingFogDrivers
    });
    const saricakayaSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_26,
      target: {
        lat: 40.0422,
        lon: 30.6136,
        elevationM: 220,
        subBasinId: "saricakaya_sakarya_microvalley"
      },
      stations: stationsWithWarmSaricakaya,
      drivers: freezingFogDrivers
    });

    expect(porsukSurface).not.toBeNull();
    expect(saricakayaSurface).not.toBeNull();
    // Porsuk tabanı dondurucu (-6.5°C altı) kalırken Sarıcakaya +9.5°C mikro-ılımanlığını korur!
    expect(porsukSurface!.tempC).toBeLessThan(-6.2);
    expect(saricakayaSurface!.tempC).toBeGreaterThan(9.2);
    expect(saricakayaSurface!.tempC - porsukSurface!.tempC).toBeGreaterThan(15.5);

    // 3) Porsuk kar çanağında -23.5°C ölçülürken 8 NWP modeli -17.3°C verdiğinde kalmanTempBiasCapC=6.5 tam düzeltme yapar
    const baseMs = Date.parse("2026-01-20T00:00:00Z");
    const hours = 36;
    const utcTimeIndex = new Map<string, number>();
    const porsukLedger: ProvinceScopedLedgerStationPoint[] = [];
    for (let h = 0; h < hours; h++) {
      const ms = baseMs + h * 3600_000;
      const uKey = new Date(ms).toISOString().slice(0, 16);
      utcTimeIndex.set(uKey, h);
      porsukLedger.push({
        stationId: "ESK_17124",
        stationProvinceCode: "TR-26",
        utcHourKey: uKey,
        observedAtMs: ms,
        lat: 39.7656,
        lon: 30.5502,
        elevationM: 788,
        tempC: -23.5,
        dewPointC: -25.0,
        pressureMslHpa: 1031,
        windSpeedKmh: 3,
        windDirDeg: 70,
        precipMmHr: 0,
        hasPrecip: false
      });
    }

    const eskMos = trainKalmanMos({
      network: [],
      cityElevationM: 788,
      cityLat: 39.7656,
      cityLon: 30.5502,
      envLapseRateCPerM: 0.003,
      modelHourlyUtc: {
        temperature_2m_ecmwf_ifs: Array(hours).fill(-17.3),
        temperature_2m_ecmwf_aifs025_single: Array(hours).fill(-17.3),
        temperature_2m_icon_seamless: Array(hours).fill(-17.3),
        temperature_2m_ukmo_seamless: Array(hours).fill(-17.3),
        temperature_2m_meteofrance_seamless: Array(hours).fill(-17.3),
        temperature_2m_gfs_seamless: Array(hours).fill(-17.3),
        temperature_2m_gem_seamless: Array(hours).fill(-17.3),
        temperature_2m_jma_seamless: Array(hours).fill(-17.3),
        temperature_850hPa_ecmwf_ifs: Array(hours).fill(-11.0)
      },
      utcTimeIndex,
      nowUtcMs: baseMs + (hours - 1) * 3600_000,
      utcOffsetSeconds: 10800,
      ledgerStationHistory: porsukLedger,
      provinceCode: "TR-26",
      kalmanTempBiasCapC: PROVINCE_SPEC_TR_26.qcAndMosBounds.kalmanTempBiasCapC
    });
    const correctedPorsukTemp = blendKalmanCorrectedScalar({
      snapshot: makeUniformSnapshot(-17.3),
      mos: eskMos,
      param: "temperature",
      leadHour: 2,
      localHour: 5,
      fallback: -17.3,
      targetSynopticContext: { temp850C: -11.0 }
    });
    expect(correctedPorsukTemp).toBeLessThan(-22.5);
  });

  it("TR-40 Kırşehir & TR-71 Kırıkkale — Kırşehir (WMO 17160, ters-V kuru mikroburst) ve Kırıkkale (TIER_B_DONOR_KALMAN, sıfır Ankara LTAC sızıntısı, Delice 680 m – Kırıkkale 751 m – Keskin 1120 m 3-katman rölyefi) kurallarını doğrular", () => {
    // 1) TR-40 Kırşehir: TIER_A_WMO, WMO 17160 (~1007 m), icaoWhitelist=[], yüksek yaz öğleden sonra ters-V kuru mikroburst
    expect(PROVINCE_SPEC_TR_40.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_40.primaryCenter.wmoId).toBe("17160");
    expect(PROVINCE_SPEC_TR_40.primaryCenter.demVerifiedElevationM).toBe(1007);
    expect(PROVINCE_SPEC_TR_40.icaoWhitelist).toEqual([]);
    expect(isIcaoAllowedForProvince("LTAZ", "TR-40")).toBe(false);
    expect(isIcaoAllowedForProvince("LTAC", "TR-40")).toBe(false);
    expect(PROVINCE_CALIBRATION_TR_40.wmoStationId).toBe("17160");
    expect(
      PROVINCE_SPEC_TR_40.aridAndSevereDrivers.invertedVDryMicroburstSusceptibility
    ).toBe(TR_40_BESPOKE_MODIFIERS.invertedVDryMicroburstSusceptibility);
    expect(
      PROVINCE_SPEC_TR_40.aridAndSevereDrivers.invertedVDryMicroburstSusceptibility
    ).toBeGreaterThanOrEqual(0.72);
    expect(PROVINCE_SPEC_TR_40.inversionAndWedgeSpec.topographicEnclosureIndex).toBeGreaterThan(
      0.75
    );

    // 2) TR-71 Kırıkkale: TIER_B_DONOR_KALMAN, icaoWhitelist=[] — Ankara LTAC sızıntısı KESİNLİKLE YASAK!
    expect(PROVINCE_SPEC_TR_71.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(PROVINCE_SPEC_TR_71.primaryCenter.wmoId).toBeUndefined();
    expect(PROVINCE_SPEC_TR_71.primaryCenter.demVerifiedElevationM).toBe(751);
    expect(PROVINCE_SPEC_TR_71.icaoWhitelist).toEqual([]);
    expect(TR_71_BESPOKE_MODIFIERS.ankaraLtacLeakageBlocked).toBe(true);
    expect(isIcaoAllowedForProvince("LTAC", "TR-71")).toBe(false);
    expect(isIcaoAllowedForProvince("LTAB", "TR-71")).toBe(false);
    expect(isIcaoAllowedForProvince("LTAD", "TR-71")).toBe(false);

    // EMOS donör paketi: sıfır kesişim sızıntısı (`intercept: 0`, `maxResidualShiftC: 0`) ve Ankara + Kırşehir + Çankırı ağırlık aktarımı
    expect(PROVINCE_CALIBRATION_TR_71.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(PROVINCE_CALIBRATION_TR_71.wmoStationId).toBeNull();
    expect(PROVINCE_CALIBRATION_TR_71.donorProvinces).toEqual(["TR-06", "TR-40", "TR-18"]);
    expect(PROVINCE_CALIBRATION_TR_71.slices.DJF.short_0_72h.intercept).toBe(0);
    expect(PROVINCE_CALIBRATION_TR_71.slices.DJF.short_0_72h.maxResidualShiftC).toBe(0);

    // 3) Kırıkkale Cressman yüzey çözücüsü sınır ötesi Ankara LTAC / Elmadağ istasyonlarını %100 reddeder
    //    ve Delice (680 m) > Kırıkkale/Yahşihan (720–751 m) > Keskin (1120 m) 3-katmanlı termal gradyanı korur!
    const summerAfternoonDrivers = {
      localHour: 15,
      month: 7,
      isNight: false,
      cloudCoverPct: 15,
      wind10mDirDeg: 200,
      wind10mSpeedKmh: 16
    };

    const kirikkaleMixedStations = [
      {
        stationId: 18081,
        provinceCode: "TR-71" as const,
        name: "Delice Tuzlu Vadi",
        lat: 39.9406,
        lon: 34.0328,
        elevationM: 680,
        tempC: 35.6,
        subBasinId: "delice_low_saline_valley"
      },
      {
        stationId: 17135,
        provinceCode: "TR-71" as const,
        name: "Kırıkkale Merkez",
        lat: 39.8433,
        lon: 33.5181,
        elevationM: 751,
        tempC: 34.4,
        subBasinId: "kizilirmak_yahsihan_trough"
      },
      {
        stationId: 17730,
        provinceCode: "TR-71" as const,
        name: "Keskin Yüksek Platosu",
        lat: 39.6682,
        lon: 33.6118,
        elevationM: 1120,
        tempC: 31.2,
        subBasinId: "keskin_celebi_high_plateau"
      },
      {
        stationId: "LTAC",
        icaoId: "LTAC",
        provinceCode: "TR-06" as const,
        name: "Ankara Esenboğa Sızıntı Testi",
        lat: 40.1281,
        lon: 32.995,
        elevationM: 949,
        tempC: 24.0,
        subBasinId: "cubuk_esenboga_frost_basin"
      }
    ];

    const deliceSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_71,
      target: {
        lat: 39.9406,
        lon: 34.0328,
        elevationM: 680,
        subBasinId: "delice_low_saline_valley"
      },
      stations: kirikkaleMixedStations,
      drivers: summerAfternoonDrivers
    });
    const kirikkaleCenterSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_71,
      target: {
        lat: 39.8433,
        lon: 33.5181,
        elevationM: 751,
        subBasinId: "kizilirmak_yahsihan_trough"
      },
      stations: kirikkaleMixedStations,
      drivers: summerAfternoonDrivers
    });
    const keskinSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_71,
      target: {
        lat: 39.6682,
        lon: 33.6118,
        elevationM: 1120,
        subBasinId: "keskin_celebi_high_plateau"
      },
      stations: kirikkaleMixedStations,
      drivers: summerAfternoonDrivers
    });

    expect(kirikkaleCenterSurface).not.toBeNull();
    expect(kirikkaleCenterSurface!.rejectedCrossBorderCount).toBe(1);
    expect(kirikkaleCenterSurface!.acceptedStationCount).toBe(3);
    expect(
      kirikkaleCenterSurface!.contributions.some((c) => c.stationId === "LTAC")
    ).toBe(false);

    expect(deliceSurface!.tempC).toBeGreaterThan(kirikkaleCenterSurface!.tempC);
    expect(kirikkaleCenterSurface!.tempC).toBeGreaterThan(keskinSurface!.tempC + 2.2);

    // 4) Kalman MOS defter süzgeci de TR-71 içinde TR-06 Ankara istasyon sızıntısını %100 engeller
    const baseMs = Date.parse("2026-11-28T00:00:00Z");
    const utcTimeIndex = new Map<string, number>();
    const ledger: ProvinceScopedLedgerStationPoint[] = [];
    for (let h = 0; h < 10; h++) {
      const ms = baseMs + h * 3600_000;
      const uKey = new Date(ms).toISOString().slice(0, 16);
      utcTimeIndex.set(uKey, h);
      ledger.push({
        stationId: "KKL_17135",
        stationProvinceCode: "TR-71",
        utcHourKey: uKey,
        observedAtMs: ms,
        lat: 39.8433,
        lon: 33.5181,
        elevationM: 751,
        tempC: 6.4,
        dewPointC: 2.0,
        pressureMslHpa: 1019,
        windSpeedKmh: 8,
        windDirDeg: 195,
        precipMmHr: 0,
        hasPrecip: false
      });
      ledger.push({
        stationId: "ANK_LTAC_LEAK",
        stationProvinceCode: "TR-06",
        utcHourKey: uKey,
        observedAtMs: ms,
        lat: 40.1281,
        lon: 32.995,
        elevationM: 949,
        tempC: -4.5,
        dewPointC: -6.0,
        pressureMslHpa: 1021,
        windSpeedKmh: 3,
        windDirDeg: 30,
        precipMmHr: 0,
        hasPrecip: false
      });
    }

    const kklMos = trainKalmanMos({
      network: [],
      cityElevationM: 751,
      cityLat: 39.8433,
      cityLon: 33.5181,
      envLapseRateCPerM: -0.0055,
      modelHourlyUtc: {
        temperature_2m_ecmwf_ifs: Array(10).fill(5.0),
        temperature_2m_icon_seamless: Array(10).fill(5.0)
      },
      utcTimeIndex,
      nowUtcMs: baseMs + 9 * 3600_000,
      utcOffsetSeconds: 10800,
      ledgerStationHistory: ledger,
      provinceCode: "TR-71",
      kalmanTempBiasCapC: PROVINCE_SPEC_TR_71.qcAndMosBounds.kalmanTempBiasCapC
    });
    expect(kklMos.summary.stationIds).toEqual(["KKL_17135"]);
    expect(kklMos.summary.stationIds).not.toContain("ANK_LTAC_LEAK");
    expect(kklMos.biases.ecmwfIfs.tempKalmanBiasC).toBeLessThan(0); // Gözlem (6.4°C) modelden (5.0°C) sıcak -> negatif (model soğuk) bias, ASLA LTAC (-4.5°C) kaynaklı pozitif bias değil!
  });
});
