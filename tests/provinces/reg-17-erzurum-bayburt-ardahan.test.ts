import { describe, expect, it } from "vitest";
import { TURKEY_ICAO_WHITELIST_BY_PROVINCE } from "../../lib/metar-verify";
import { PROVINCE_CALIBRATION_TR_25 } from "../../lib/provinces/emos-weights/tr-25";
import { PROVINCE_CALIBRATION_TR_69 } from "../../lib/provinces/emos-weights/tr-69";
import { PROVINCE_CALIBRATION_TR_75 } from "../../lib/provinces/emos-weights/tr-75";
import {
  applyDirectionalBarrierRules,
  applyVenturiCorridorRules,
  resolveProvinceTargetMetadata,
  solveProvinceTopographicSurface
} from "../../lib/provinces/engine/province-cressman";
import { evaluateProvinceCalibratedHour } from "../../lib/provinces/engine/province-mos-engine";
import {
  computeProvinceLiveVerticalProfile,
  integrateProvinceVerticalDeltaC,
  type ProvinceEngineSpec
} from "../../lib/provinces/engine/province-vertical-profile";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import { STATIC_MGM_ISTNO_OWNER_PROVINCE } from "../../lib/provinces/mgm-dem-repair";
import { PROVINCE_SPEC_TR_25 } from "../../lib/provinces/specs/tr-25";
import { PROVINCE_SPEC_TR_69 } from "../../lib/provinces/specs/tr-69";
import { PROVINCE_SPEC_TR_75 } from "../../lib/provinces/specs/tr-75";
import type { ProvinceSpec } from "../../lib/provinces/types";

const REG17_SPECS: readonly ProvinceEngineSpec[] = [
  PROVINCE_SPEC_TR_25,
  PROVINCE_SPEC_TR_69,
  PROVINCE_SPEC_TR_75
];

describe("REG-17: Kuzeydoğu Anadolu Sibirya Yüksek Platoları (TR-25 Erzurum, TR-69 Bayburt, TR-75 Ardahan)", () => {
  it("1. 3 ilin ProvinceSpec şema bütünlüğü, Object.freeze kilidi, ADM1 poligon uyumu, simetrik bariyer matrisi, 700 hPa referansı ve MGM istasyon mülkiyeti tamdır", () => {
    const seenSlugs = new Set<string>();
    const canonicalCheck: readonly ProvinceSpec[] = REG17_SPECS;
    expect(canonicalCheck).toHaveLength(3);

    for (const spec of REG17_SPECS) {
      expect(Object.isFrozen(spec), `${spec.provinceCode} frozen`).toBe(true);
      expect(seenSlugs.has(spec.slug)).toBe(false);
      seenSlugs.add(spec.slug);

      // Derin Sibirya kış enverziyonu 700 hPa üst referansı (850/925 hPa yeraltı izobar tuzağı önlenir!)
      expect(spec.inversionAndWedgeSpec.deltaPressureTopHpa).toBe(700);
      expect(spec.qcAndMosBounds.maxPlausibleMslpHpa).toBeGreaterThanOrEqual(1062);

      // Ana merkez ADM1 poligon ve klimatoloji doğrulaması
      const centerGeo = resolveProvinceCode({
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon
      });
      expect(centerGeo.provinceCode, `${spec.nameTr} primaryCenter`).toBe(
        spec.provinceCode
      );
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toHaveLength(12);
      expect(spec.primaryCenter.monthlyTminNormalsC).toHaveLength(12);
      for (let m = 0; m < 12; m++) {
        expect(spec.primaryCenter.monthlyTmaxNormalsC[m]).toBeGreaterThan(
          spec.primaryCenter.monthlyTminNormalsC[m]
        );
      }

      // Curated lokasyonlar, Venturi merkezleri, 9-nokta şablonu ve su kütleleri ADM1 poligon kontrolü
      for (const loc of spec.curatedSubLocations) {
        expect(
          resolveProvinceCode({ lat: loc.lat, lon: loc.lon }).provinceCode,
          `${spec.provinceCode} curated ${loc.id}`
        ).toBe(spec.provinceCode);
      }
      for (const vc of spec.venturiCorridors) {
        expect(
          resolveProvinceCode(vc.centerCoord).provinceCode,
          `${spec.provinceCode} venturi ${vc.id}`
        ).toBe(spec.provinceCode);
      }
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.stencil9Points.some((p) => p.role === "target")).toBe(true);
      for (const pt of spec.stencil9Points) {
        expect(
          resolveProvinceCode({ lat: pt.lat, lon: pt.lon }).provinceCode,
          `${spec.provinceCode} stencil ${pt.key}`
        ).toBe(spec.provinceCode);
      }
      for (const wb of spec.waterBodies) {
        expect(
          resolveProvinceCode(wb.sampleCoord).provinceCode,
          `${spec.provinceCode} waterBody ${wb.id}`
        ).toBe(spec.provinceCode);
      }

      // Alt-havza ve simetrik bariyer kuplaj matrisi kontrolü
      const subIds = new Set(spec.subBasins.map((s) => s.id));
      expect(subIds.has(spec.primaryCenter.subBasinId)).toBe(true);
      for (const idA of subIds) {
        expect(spec.barrierCouplingMatrix[idA]?.[idA]).toBe(1.0);
        for (const idB of subIds) {
          const wAB = spec.barrierCouplingMatrix[idA]?.[idB];
          const wBA = spec.barrierCouplingMatrix[idB]?.[idA];
          expect(typeof wAB).toBe("number");
          expect(wAB).toBeCloseTo(wBA ?? -1, 6);
          expect(wAB).toBeGreaterThan(0);
          expect(wAB).toBeLessThanOrEqual(1);
        }
      }

      // MGM istasyon mülkiyeti & ADM1 koordinat kilidi
      for (const [key, ov] of Object.entries(spec.stationOverrides)) {
        expect(subIds.has(ov.subBasinId), `${spec.provinceCode} override ${key}`).toBe(
          true
        );
        if (ov.lat !== undefined && ov.lon !== undefined) {
          expect(
            resolveProvinceCode({ lat: ov.lat, lon: ov.lon }).provinceCode,
            `${spec.provinceCode} station ${key}`
          ).toBe(spec.provinceCode);
        }
        const numericIst = Number(ov.stationId);
        if (Number.isInteger(numericIst)) {
          expect(
            STATIC_MGM_ISTNO_OWNER_PROVINCE[numericIst],
            `MGM istNo ${numericIst} owner`
          ).toBe(spec.provinceCode);
        } else {
          expect(spec.icaoWhitelist).toContain(String(ov.stationId));
        }
      }

      // 4-irtifa bandı ve parçalı düğümler kesin monotonluk kontrolü
      const knots = spec.verticalProfileSpec.piecewiseKnotsM;
      expect(knots[0]).toBeLessThan(knots[1]);
      expect(knots[1]).toBeLessThan(knots[2]);
      expect(knots[2]).toBeLessThan(knots[3]);
      expect(knots[3]).toBeLessThanOrEqual(spec.verticalProfileSpec.maxPhysicalPeakM);

      const bands = spec.verticalProfileSpec.snowElevationBands;
      expect(bands).toHaveLength(4);
      expect(bands[0].elevationM).toBeLessThan(bands[1].elevationM);
      expect(bands[1].elevationM).toBeLessThan(bands[2].elevationM);
      expect(bands[2].elevationM).toBeLessThan(bands[3].elevationM);
      expect(bands[3].elevationM).toBeLessThanOrEqual(
        spec.verticalProfileSpec.maxPhysicalPeakM
      );
    }
  });

  it("2. METAR beyaz listeleri ve EMOS kalibrasyon katmanları dürüsttür: TR-25=[LTCE] (TIER_A_WMO, 17096), TR-69=[] ve TR-75=[] (TIER_B_DONOR_KALMAN)", () => {
    expect(PROVINCE_SPEC_TR_25.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_25.icaoWhitelist).toEqual(["LTCE"]);
    expect(PROVINCE_SPEC_TR_25.icaoWhitelist).toEqual(
      TURKEY_ICAO_WHITELIST_BY_PROVINCE["TR-25"]
    );
    expect(PROVINCE_SPEC_TR_25.primaryCenter.wmoId).toBe("17096");

    expect(PROVINCE_SPEC_TR_69.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(PROVINCE_SPEC_TR_69.icaoWhitelist).toEqual([]);
    expect(PROVINCE_SPEC_TR_69.icaoWhitelist).toEqual(
      TURKEY_ICAO_WHITELIST_BY_PROVINCE["TR-69"]
    );
    expect(PROVINCE_SPEC_TR_69.icaoWhitelist).not.toContain("LTCG");
    expect(PROVINCE_SPEC_TR_69.icaoWhitelist).not.toContain("LTCE");

    expect(PROVINCE_SPEC_TR_75.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(PROVINCE_SPEC_TR_75.icaoWhitelist).toEqual([]);
    expect(PROVINCE_SPEC_TR_75.icaoWhitelist).toEqual(
      TURKEY_ICAO_WHITELIST_BY_PROVINCE["TR-75"]
    );
    expect(PROVINCE_SPEC_TR_75.icaoWhitelist).not.toContain("LTCF");
    expect(PROVINCE_SPEC_TR_75.icaoWhitelist).not.toContain("UGSB");
    expect(PROVINCE_SPEC_TR_75.icaoWhitelist).not.toContain("UDYZ");
  });

  it("3. TR-25 Erzurum: LTCE Karasu Ovası (1758 m, -35°C ayaz havuzu) vs Şehir Merkezi Yakutiye/Palandöken Eteği (+4..+8°C daha ılık!) vs Ejder3200 (3176 m) ve İspir–Uzundere Çoruh izolasyonu (<=0.18) fiziksel olarak doğrulanır", () => {
    const ltceOv = PROVINCE_SPEC_TR_25.stationOverrides["LTCE"];
    const wmoOv = PROVINCE_SPEC_TR_25.stationOverrides["17096"];
    expect(ltceOv.demElevationM).toBe(1758);
    expect(ltceOv.excludeFromCenterHeadline).toBe(true);
    expect(ltceOv.coldPoolSusceptibility).toBe(0.96);
    expect(wmoOv.excludeFromCenterHeadline).toBe(true);
    expect(wmoOv.coldPoolSusceptibility).toBe(0.96);

    expect(PROVINCE_SPEC_TR_25.qcAndMosBounds.minPlausibleTempC).toBe(-42);
    expect(PROVINCE_SPEC_TR_25.inversionAndWedgeSpec.snowAlbedoFeedback).toEqual({
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 7.5
    });

    // İspir–Tortum–Uzundere Çoruh mikro-ılıman kuşağı kuplaj sınırı <= 0.18
    expect(
      PROVINCE_SPEC_TR_25.barrierCouplingMatrix.ISPIR_TORTUM_CORUH_VALLEY
        .ERZURUM_FOOTHILL_THERMAL_BELT
    ).toBeLessThanOrEqual(0.18);
    expect(
      PROVINCE_SPEC_TR_25.barrierCouplingMatrix.ISPIR_TORTUM_CORUH_VALLEY
        .KARASU_OVA_FLOOR
    ).toBeLessThanOrEqual(0.18);

    // Açık ve karlı (35 cm kar örtüsü, 1064 hPa Sibirya yükseği) kış gecesinde LTCE -35°C iken
    // Erzurum Şehir Merkezi (~1915 m Palandöken kuzey eteği) ovadan 4–8°C daha ılık çözülür!
    const profile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_25,
      stations: [
        {
          stationId: "LTCE",
          icaoId: "LTCE",
          provinceCode: "TR-25",
          lat: 39.9529,
          lon: 41.1897,
          elevationM: 1758,
          tempC: -35.0,
          snowDepthCm: 35,
          pressureMslHpa: 1064
        }
      ],
      isNight: true,
      cloudCoverPct: 5,
      wind10mSpeedKmh: 3,
      wind850SpeedKmh: 8,
      hasSnowpack: true
    });

    expect(profile.coldPoolTopM).toBe(2138); // 1758m + 380m
    expect(profile.snowpackAmplified).toBe(true);
    expect(profile.lowerPoolLapseCPerKm).toBeGreaterThan(8.0);

    // Z_i = 2138 m üstünde Palandöken Ejder3200 (3176 m) serbest troposferde tekrar soğur
    const deltaFoothillToEjder = integrateProvinceVerticalDeltaC(2138, 3176, profile);
    expect(deltaFoothillToEjder).toBeLessThan(-4.5);

    const cityCenterSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_25,
      target: {
        lat: 39.9058,
        lon: 41.2544,
        elevationM: 1915,
        subBasinId: "ERZURUM_FOOTHILL_THERMAL_BELT",
        urbanFraction: 0.72
      },
      stations: [
        {
          stationId: "LTCE",
          icaoId: "LTCE",
          provinceCode: "TR-25",
          lat: 39.9529,
          lon: 41.1897,
          elevationM: 1758,
          tempC: -35.0,
          relHumidityPct: 84,
          pressureMslHpa: 1064,
          windSpeedKmh: 3,
          snowDepthCm: 35
        },
        {
          stationId: 17666,
          provinceCode: "TR-25",
          lat: 40.4868,
          lon: 40.9997,
          elevationM: 1223,
          tempC: -6.0,
          relHumidityPct: 68,
          pressureMslHpa: 1032,
          windSpeedKmh: 6,
          snowDepthCm: 0
        }
      ],
      drivers: {
        localHour: 3,
        isNight: true,
        cloudCoverPct: 5,
        wind10mSpeedKmh: 3,
        wind850SpeedKmh: 8,
        hasSnowpack: true
      },
      verticalProfile: profile
    });

    expect(cityCenterSurface).not.toBeNull();
    if (!cityCenterSurface) throw new Error("Expected cityCenterSurface");
    const diffVsBasinFloorC = cityCenterSurface.tempC - -35.0;
    expect(diffVsBasinFloorC).toBeGreaterThanOrEqual(4.0);
    expect(diffVsBasinFloorC).toBeLessThanOrEqual(8.5);
    expect(cityCenterSurface.pressureMslHpa).toBeGreaterThan(1055);
  });

  it("4. TR-69 Bayburt: Soğanlı Dağları Karadeniz yağış gölgesi, Kop Dağı (2409 m / ~2900 m) tipi Venturi kanalı ve komşu il güvenlik duvarı çalışır", () => {
    const bayburtBasinTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_69, {
      lat: 40.2547,
      lon: 40.2207,
      elevationM: 1582,
      subBasinId: "UPPER_CORUH_BAYBURT_BASIN"
    });

    // Kuzeyli (5°) Karadeniz akışında Soğanlı Dağları nem bariyeri yağışı sönümler
    const northFlowBarrier = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_69,
      target: bayburtBasinTarget,
      drivers: {
        localHour: 12,
        isNight: false,
        cloudCoverPct: 90,
        wind850DirDeg: 5,
        wind850SpeedKmh: 54,
        wind10mDirDeg: 10,
        wind10mSpeedKmh: 22
      }
    });
    expect(northFlowBarrier.precipMultiplier).toBeLessThan(0.65);

    // Kop Dağı Geçidi (2409 m) güneydoğulu / kuzeybatılı fırtınada Venturi tipi hızlanması üretir ve gece enversiyonunu kırar
    const kopVenturi = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_69.venturiCorridors,
      targetLat: 40.048,
      targetLon: 40.468,
      windDirDeg: 150,
      windSpeedKmh: 45
    });
    expect(kopVenturi.activeCorridorIds).toContain("KOP_PASS_BLIZZARD_VENTURI");
    expect(kopVenturi.speedMultiplier).toBeGreaterThan(1.3);
    expect(kopVenturi.gustMultiplier).toBeGreaterThan(1.42);
    expect(kopVenturi.suppressesNocturnalInversion).toBe(true);

    // Kesin il sınır güvenlik duvarı: Rize (TR-53) ve Gümüşhane (TR-29) istasyonları reddedilir
    const surface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_69,
      target: bayburtBasinTarget,
      stations: [
        {
          stationId: 17089,
          provinceCode: "TR-69",
          lat: 40.2547,
          lon: 40.2207,
          elevationM: 1582,
          tempC: -18.4,
          windSpeedKmh: 8
        },
        {
          stationId: 17040,
          provinceCode: "TR-53",
          lat: 41.04,
          lon: 40.5,
          elevationM: 4,
          tempC: 9.5,
          windSpeedKmh: 18
        },
        {
          stationId: 17088,
          provinceCode: "TR-29",
          lat: 40.46,
          lon: 39.48,
          elevationM: 1216,
          tempC: -7.2,
          windSpeedKmh: 10
        }
      ],
      drivers: {
        localHour: 4,
        isNight: true,
        cloudCoverPct: 10,
        hasSnowpack: true
      }
    });
    expect(surface).not.toBeNull();
    if (!surface) throw new Error("Expected Bayburt surface");
    expect(surface.acceptedStationCount).toBe(1);
    expect(surface.rejectedCrossBorderCount).toBe(2);
    expect(surface.tempC).toBeCloseTo(-18.4, 1);
  });

  it("5. TR-75 Ardahan: Göle (-42°C sınıfı Sibirya ayaz çukuru, minPlausibleTempC=-44), kışın donan Çıldır Gölü (1959 m, 0.0°C) ve Ilgar kuzeyi Posof mikro-vadisi ayrışması çalışır", () => {
    expect(PROVINCE_SPEC_TR_75.qcAndMosBounds.minPlausibleTempC).toBe(-44);
    expect(PROVINCE_SPEC_TR_75.qcAndMosBounds.maxPlausibleMslpHpa).toBe(1068);

    // Çıldır Gölü 1959 m tatlı su gölü: kış aylarında (Aralık–Mart) 0.0°C buz örtüsü!
    expect(PROVINCE_SPEC_TR_75.waterBodies).toHaveLength(1);
    const cildir = PROVINCE_SPEC_TR_75.waterBodies[0];
    expect(cildir.id).toBe("CILDIR_FROZEN_HIGH_LAKE");
    expect(cildir.kind).toBe("fresh_lake");
    expect(cildir.surfaceElevationM).toBe(1959);
    expect(cildir.freezingPointC).toBe(0.0);
    expect(cildir.monthlyWaterTempNormalsC[0]).toBe(0.0);
    expect(cildir.monthlyWaterTempNormalsC[1]).toBe(0.0);
    expect(cildir.monthlyWaterTempNormalsC[2]).toBe(0.0);
    expect(cildir.monthlyWaterTempNormalsC[11]).toBe(0.0);
    expect(cildir.monthlyWaterTempNormalsC[7]).toBeGreaterThan(17.0);

    // Posof (Ilgar Dağı kuzeyi ~1350 m) ile Göle/Ardahan kuplajı <= 0.16
    expect(
      PROVINCE_SPEC_TR_75.barrierCouplingMatrix.POSOF_ILGAR_MICRO_VALLEY
        .GOLE_FROST_HOLLOW
    ).toBeLessThanOrEqual(0.16);
    expect(
      PROVINCE_SPEC_TR_75.barrierCouplingMatrix.POSOF_ILGAR_MICRO_VALLEY
        .KURA_ARDAHAN_PLATEAU
    ).toBeLessThanOrEqual(0.16);

    // Kuzeybatılı Kafkas/Karadeniz akışında Posof orografik yağış alırken Ardahan platosu yağış gölgesinde kalır
    const posofTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_75, {
      lat: 41.4969,
      lon: 42.7344,
      elevationM: 1350,
      subBasinId: "POSOF_ILGAR_MICRO_VALLEY"
    });
    const ardahanTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_75, {
      lat: 41.1061,
      lon: 42.7055,
      elevationM: 1829,
      subBasinId: "KURA_ARDAHAN_PLATEAU"
    });
    const posofBarrier = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_75,
      target: posofTarget,
      drivers: {
        localHour: 15,
        isNight: false,
        cloudCoverPct: 95,
        wind850DirDeg: 325,
        wind850SpeedKmh: 48
      }
    });
    const ardahanBarrier = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_75,
      target: ardahanTarget,
      drivers: {
        localHour: 15,
        isNight: false,
        cloudCoverPct: 85,
        wind850DirDeg: 300,
        wind850SpeedKmh: 48
      }
    });
    expect(posofBarrier.precipMultiplier).toBeGreaterThan(1.15);
    expect(ardahanBarrier.precipMultiplier).toBeLessThan(0.75);

    // Göle Ovası'nda -41.8°C ekstrem Sibirya ayazı QC tarafından reddedilmez ve Posof (-8.5°C) Göle'yi ısıtmaz
    const goleSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_75,
      target: {
        lat: 40.8014,
        lon: 42.5992,
        elevationM: 2010,
        subBasinId: "GOLE_FROST_HOLLOW",
        urbanFraction: 0.16
      },
      stations: [
        {
          stationId: 18378,
          provinceCode: "TR-75",
          lat: 40.8014,
          lon: 42.5992,
          elevationM: 2006,
          tempC: -41.8,
          pressureMslHpa: 1066,
          snowDepthCm: 48,
          windSpeedKmh: 2
        },
        {
          stationId: 18236,
          provinceCode: "TR-75",
          lat: 41.4969,
          lon: 42.7344,
          elevationM: 1374,
          tempC: -8.5,
          pressureMslHpa: 1042,
          snowDepthCm: 8,
          windSpeedKmh: 6
        }
      ],
      drivers: {
        localHour: 5,
        isNight: true,
        cloudCoverPct: 0,
        wind10mSpeedKmh: 2,
        wind850SpeedKmh: 7,
        hasSnowpack: true
      }
    });
    expect(goleSurface).not.toBeNull();
    if (!goleSurface) throw new Error("Expected Göle surface");
    expect(goleSurface.acceptedStationCount).toBe(2);
    expect(goleSurface.tempC).toBeLessThan(-40.5);
  });

  it("6. Kalibre MOS motoru (evaluateProvinceCalibratedHour): TR-25 ampirik WMO 17096 ağırlıklarını, TR-69 ve TR-75 sıfır-kesişim donör prior + bölgesel QC sınırlarını uygular", () => {
    const tempSnapshot = {
      ecmwfIfs: -22.5,
      ecmwfAifs: -23.1,
      icon: -25.4,
      ukmo: -24.0,
      gfs: -26.2
    };
    const precipSnapshot = {
      ecmwfIfs: 0.4,
      ecmwfAifs: 0.3,
      icon: 0.5,
      ukmo: 0.4,
      gfs: 0.6
    };
    const windSnapshot = {
      ecmwfIfs: 9,
      ecmwfAifs: 10,
      icon: 8,
      ukmo: 9,
      gfs: 11
    };
    const pressureSnapshot = {
      ecmwfIfs: 1048,
      ecmwfAifs: 1049,
      icon: 1051,
      ukmo: 1048,
      gfs: 1052
    };

    const erzurumMos = evaluateProvinceCalibratedHour({
      bundle: PROVINCE_CALIBRATION_TR_25,
      spec: PROVINCE_SPEC_TR_25,
      month: 1,
      leadHours: 18,
      localHour: 4,
      tempSnapshot,
      precipSnapshot,
      windSnapshot,
      pressureSnapshot,
      drivers: { radiativeClearNight: 0.9 }
    });
    expect(erzurumMos.tier).toBe("TIER_A_EMPIRICAL_WMO");
    expect(erzurumMos.temperatureC).toBeLessThan(-24.0);
    expect(erzurumMos.temperatureC).toBeGreaterThanOrEqual(-42);

    const bayburtMos = evaluateProvinceCalibratedHour({
      bundle: PROVINCE_CALIBRATION_TR_69,
      spec: PROVINCE_SPEC_TR_69,
      month: 1,
      leadHours: 18,
      localHour: 4,
      tempSnapshot,
      precipSnapshot,
      windSnapshot,
      pressureSnapshot
    });
    expect(bayburtMos.tier).toBe("TIER_B_DONOR_ALARO");
    expect(PROVINCE_CALIBRATION_TR_69.temperature.DJF.d0_1.interceptC).toBe(0);

    const ardahanMos = evaluateProvinceCalibratedHour({
      bundle: PROVINCE_CALIBRATION_TR_75,
      spec: PROVINCE_SPEC_TR_75,
      month: 1,
      leadHours: 18,
      localHour: 4,
      tempSnapshot,
      precipSnapshot,
      windSnapshot,
      pressureSnapshot,
      explicitKalmanShiftC: -6.5 // kalmanTempBiasCapC = 4.5 ile sınırlanmalı
    });
    expect(ardahanMos.tier).toBe("TIER_B_DONOR_ALARO");
    expect(PROVINCE_CALIBRATION_TR_75.temperature.DJF.d0_1.interceptC).toBe(0);
    expect(ardahanMos.appliedKalmanShiftC).toBeCloseTo(-4.5, 5);
  });
});
