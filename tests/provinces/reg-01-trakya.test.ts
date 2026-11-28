import { describe, expect, it } from "vitest";
import {
  applyDirectionalBarrierRules,
  applyVenturiCorridorRules,
  resolveProvinceTargetMetadata,
  solveProvinceTopographicSurface
} from "../../lib/provinces/engine/province-cressman";
import { computeProvinceLiveVerticalProfile } from "../../lib/provinces/engine/province-vertical-profile";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import { PROVINCE_SPEC_TR_17 } from "../../lib/provinces/specs/tr-17";
import { PROVINCE_SPEC_TR_22 } from "../../lib/provinces/specs/tr-22";
import { PROVINCE_SPEC_TR_39 } from "../../lib/provinces/specs/tr-39";
import { PROVINCE_SPEC_TR_59 } from "../../lib/provinces/specs/tr-59";
import type { ProvinceSpec } from "../../lib/provinces/types";

const REG01_SPECS: readonly ProvinceSpec[] = [
  PROVINCE_SPEC_TR_17,
  PROVINCE_SPEC_TR_22,
  PROVINCE_SPEC_TR_39,
  PROVINCE_SPEC_TR_59
];

describe("REG-01: Trakya & Çanakkale Boğazı Mikroiklim Profilleri (TR-17, TR-22, TR-39, TR-59)", () => {
  it("1. 4 ilin ProvinceSpec şema bütünlüğü, alt-havza matrisi, 4-irtifa bandı monotonluğu, 9-nokta şablonu ve ADM1 poligon uyumu tamdır", () => {
    const slugs = new Set<string>();

    for (const spec of REG01_SPECS) {
      expect(slugs.has(spec.slug)).toBe(false);
      slugs.add(spec.slug);

      // Ana merkez ADM1 poligon doğrulaması
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

      // Alt-havza ve bariyer matrisi simetri/diyagonal kontrolü
      const subIds = new Set(spec.subBasins.map((s) => s.id));
      expect(subIds.has(spec.primaryCenter.subBasinId)).toBe(true);
      for (const idA of subIds) {
        expect(spec.barrierCouplingMatrix[idA]?.[idA]).toBe(1.0);
        for (const idB of subIds) {
          const w = spec.barrierCouplingMatrix[idA]?.[idB];
          expect(typeof w).toBe("number");
          expect(w).toBeGreaterThanOrEqual(0);
          expect(w).toBeLessThanOrEqual(1);
        }
      }

      // Station overrides alt-havza tutarlılığı
      for (const ov of Object.values(spec.stationOverrides)) {
        expect(subIds.has(ov.subBasinId)).toBe(true);
      }

      // 4-irtifa bandı kesin artan monotonluk ve fiziki tavan sınırı
      const bands = spec.verticalProfileSpec.snowElevationBands;
      expect(bands).toHaveLength(4);
      expect(bands[0].elevationM).toBeLessThan(bands[1].elevationM);
      expect(bands[1].elevationM).toBeLessThan(bands[2].elevationM);
      expect(bands[2].elevationM).toBeLessThan(bands[3].elevationM);
      expect(bands[3].elevationM).toBeLessThanOrEqual(
        spec.verticalProfileSpec.maxPhysicalPeakM
      );

      // 9-nokta uzamsal şablon tamlığı
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.stencil9Points.some((p) => p.role === "target")).toBe(true);
    }
  });

  it("2. METAR beyaz listeleri kesin izoledir: TR-17=[LTBH], TR-22=[] (LGAL yasak!), TR-39=[], TR-59=[LTBU]", () => {
    expect(PROVINCE_SPEC_TR_17.icaoWhitelist).toEqual(["LTBH"]);
    expect(PROVINCE_SPEC_TR_17.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_17.primaryCenter.wmoId).toBe("17112");

    expect(PROVINCE_SPEC_TR_22.icaoWhitelist).toEqual([]);
    expect(PROVINCE_SPEC_TR_22.icaoWhitelist).not.toContain("LGAL");
    expect(PROVINCE_SPEC_TR_22.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_22.primaryCenter.wmoId).toBe("17050");

    expect(PROVINCE_SPEC_TR_39.icaoWhitelist).toEqual([]);
    expect(PROVINCE_SPEC_TR_39.calibrationTier).toBe("TIER_B_DONOR_KALMAN");

    expect(PROVINCE_SPEC_TR_59.icaoWhitelist).toEqual(["LTBU"]);
    expect(PROVINCE_SPEC_TR_59.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_59.primaryCenter.wmoId).toBe("17056");
  });

  it("3. TR-17 Çanakkale: Boğaz NE Poyraz (35°–55°) & SW Lodos (205°–235°) Venturi (1.34x / 1.42x), Kazdağları (1774m) güney yağış / kuzey fön ve 3 deniz kütlesi çalışır", () => {
    expect(PROVINCE_SPEC_TR_17.waterBodies.map((w) => w.id)).toEqual([
      "north_aegean_open",
      "dardanelles_strait_water",
      "southwest_marmara_gate"
    ]);
    expect(PROVINCE_SPEC_TR_17.verticalProfileSpec.maxPhysicalPeakM).toBe(1774);

    // Boğaz tam eksen Poyraz (~42.5°) ve Lodos (~222.5°) ivmelenmesi
    const poyrazPeak = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_17.venturiCorridors,
      targetLat: 40.141,
      targetLon: 26.3993,
      windDirDeg: 42.5,
      windSpeedKmh: 38
    });
    expect(poyrazPeak.speedMultiplier).toBeCloseTo(1.34, 2);
    expect(poyrazPeak.gustMultiplier).toBeCloseTo(1.42, 2);
    expect(poyrazPeak.suppressesNocturnalInversion).toBe(true);

    const lodosWindow = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_17.venturiCorridors,
      targetLat: 40.141,
      targetLon: 26.3993,
      windDirDeg: 220,
      windSpeedKmh: 42
    });
    expect(lodosWindow.speedMultiplier).toBeGreaterThan(1.3);
    expect(lodosWindow.gustMultiplier).toBeGreaterThan(1.38);

    // Boğaza dik rüzgarda (135° Keşişleme) Venturi pasiftir
    const crossWind = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_17.venturiCorridors,
      targetLat: 40.141,
      targetLon: 26.3993,
      windDirDeg: 135,
      windSpeedKmh: 30
    });
    expect(crossWind.speedMultiplier).toBe(1.0);

    // Kaz Dağları güneyli akışta Ayvacık yamacında orografik artış, Bayramiç/Yenice çanağında fön ısınması
    const ayvacikTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_17, {
      lat: 39.6081,
      lon: 26.3958,
      elevationM: 341,
      subBasinId: "kazdaglari_massif"
    });
    const ayvacikUpslope = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_17,
      target: ayvacikTarget,
      drivers: {
        localHour: 14,
        isNight: false,
        cloudCoverPct: 90,
        wind850DirDeg: 195,
        wind850SpeedKmh: 62
      }
    });
    expect(ayvacikUpslope.precipMultiplier).toBeGreaterThan(1.25);

    const bayramicTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_17, {
      lat: 39.8147,
      lon: 26.5906,
      elevationM: 92,
      subBasinId: "biga_can_interior"
    });
    const bayramicFoehn = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_17,
      target: bayramicTarget,
      drivers: {
        localHour: 15,
        isNight: false,
        cloudCoverPct: 45,
        wind850DirDeg: 190,
        wind850SpeedKmh: 68
      }
    });
    expect(bayramicFoehn.foehnTempDeltaC).toBeGreaterThan(0.8);
  });

  it("4. TR-22 Edirne: 678m tavan sınırı, Meriç 41m / 220m sığ taban enversiyonu ve Balkan Karayel soğuk kamasının üst seviye Lodos fönünü kilitlemesi doğrulanır", () => {
    expect(PROVINCE_SPEC_TR_22.verticalProfileSpec.maxPhysicalPeakM).toBe(678);
    expect(PROVINCE_SPEC_TR_22.inversionAndWedgeSpec.basinFloorElevationM).toBe(41);
    expect(PROVINCE_SPEC_TR_22.inversionAndWedgeSpec.coldPoolMaxDepthM).toBe(220);

    // Açık karlı sakin gecede Meriç-Tunca tabanında kuvvetli radyasyon enversiyonu
    const invProfile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_22,
      stations: [
        {
          stationId: 17050,
          provinceCode: "TR-22",
          lat: 41.6767,
          lon: 26.5508,
          elevationM: 51,
          tempC: -5.4,
          windSpeedKmh: 4
        },
        {
          stationId: 18395,
          provinceCode: "TR-22",
          lat: 41.7742,
          lon: 26.9164,
          elevationM: 190,
          tempC: -2.1,
          windSpeedKmh: 6
        }
      ],
      cloudCoverPct: 10,
      isNight: true,
      hasSnowpack: true,
      wind10mSpeedKmh: 4
    });
    expect(invProfile.valleyFloorM).toBe(41);
    expect(invProfile.coldPoolDepthM).toBe(220);
    expect(invProfile.inversionStrengthC).toBeGreaterThan(0);

    // Yüzeyde 325° Karayel soğuk kaması varken 850 hPa'da 195° Lodos esse bile fön ısınması KİLİTLENİR!
    const edirneCenter = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_22, {
      lat: 41.6767,
      lon: 26.5508,
      elevationM: 51,
      subBasinId: "meric_tunca_confluence"
    });
    const coldWedgeCheck = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_22,
      target: edirneCenter,
      drivers: {
        localHour: 9,
        isNight: false,
        cloudCoverPct: 95,
        wind10mDirDeg: 325,
        wind10mSpeedKmh: 26,
        wind850DirDeg: 195,
        wind850SpeedKmh: 65
      }
    });
    expect(coldWedgeCheck.foehnBlockedByColdWedge).toBe(true);
    expect(coldWedgeCheck.foehnTempDeltaC).toBe(0);
  });

  it("5. TR-39 Kırklareli (Mahya Dağı 1031m NE Karadeniz kalkanı) ve TR-59 Tekirdağ (Ganos 945m + Kıyı vs Çorlu LTBU don sınırı + sınır güvenlik duvarı) doğrulanır", () => {
    expect(PROVINCE_SPEC_TR_39.verticalProfileSpec.maxPhysicalPeakM).toBe(1031);
    expect(PROVINCE_SPEC_TR_59.verticalProfileSpec.maxPhysicalPeakM).toBe(945);

    // Kırklareli Demirköy / Istranca 45° Karadeniz poyrazında kuvvetli orografik yağış çarpanı alır
    const demirkoyTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_39, {
      lat: 41.8228,
      lon: 27.7589,
      elevationM: 540,
      subBasinId: "demirkoy_istranca_forest"
    });
    const istrancaNeShield = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_39,
      target: demirkoyTarget,
      drivers: {
        localHour: 6,
        isNight: true,
        cloudCoverPct: 100,
        wind850DirDeg: 42,
        wind850SpeedKmh: 58
      }
    });
    expect(istrancaNeShield.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(istrancaNeShield.precipMultiplier).toBeGreaterThan(1.35);

    // Tekirdağ: Süleymanpaşa kıyı (+3.4°C) vs Çorlu LTBU iç plato (-1.8°C) don sınırı ayrımı + LGAL reddi
    const tekirdagStations = [
      {
        stationId: 17056,
        provinceCode: "TR-59",
        name: "Tekirdağ Merkez",
        lat: 40.9585,
        lon: 27.4965,
        elevationM: 4,
        tempC: 3.4,
        relHumidityPct: 86,
        windSpeedKmh: 24,
        windDirDeg: 35,
        subBasinId: "suleymanpasa_marmara_coast"
      },
      {
        stationId: "LTBU",
        provinceCode: "TR-59",
        name: "Çorlu LTBU",
        lat: 41.1383,
        lon: 27.9191,
        elevationM: 174,
        tempC: -1.8,
        relHumidityPct: 92,
        windSpeedKmh: 32,
        windDirDeg: 25,
        subBasinId: "corlu_cerkezkoy_plateau",
        excludeFromCenterHeadline: true
      },
      {
        stationId: "LGAL",
        provinceCode: "GLOBAL",
        name: "Alexandroupoli (Yabancı İstasyon)",
        lat: 40.8558,
        lon: 25.9564,
        elevationM: 7,
        tempC: 8.5,
        relHumidityPct: 70
      }
    ];

    const coastEst = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_59,
      target: {
        lat: 40.9585,
        lon: 27.4965,
        elevationM: 4,
        subBasinId: "suleymanpasa_marmara_coast"
      },
      stations: tekirdagStations,
      drivers: {
        localHour: 3,
        month: 1,
        isNight: true,
        cloudCoverPct: 95,
        wind10mDirDeg: 35,
        wind10mSpeedKmh: 26
      }
    });

    const corluPlateauEst = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_59,
      target: {
        lat: 41.14,
        lon: 27.92,
        elevationM: 165,
        subBasinId: "corlu_cerkezkoy_plateau"
      },
      stations: tekirdagStations,
      drivers: {
        localHour: 3,
        month: 1,
        isNight: true,
        cloudCoverPct: 95,
        wind10mDirDeg: 25,
        wind10mSpeedKmh: 30
      }
    });

    expect(coastEst).not.toBeNull();
    expect(corluPlateauEst).not.toBeNull();
    expect(coastEst!.rejectedCrossBorderCount).toBe(1); // LGAL reddedildi!
    expect(coastEst!.tempC).toBeGreaterThan(2.2); // Kıyı donma üstünde
    expect(corluPlateauEst!.tempC).toBeLessThan(0.0); // Çorlu platosu donma altında
  });
});
