import { describe, expect, it } from "vitest";
import { getAllowedTurkeyIcaosForProvince } from "../../lib/metar-verify";
import {
  applyDirectionalBarrierRules,
  applyVenturiCorridorRules,
  resolveProvinceTargetMetadata,
  solveProvinceTopographicSurface
} from "../../lib/provinces/engine/province-cressman";
import { computeProvinceLiveVerticalProfile } from "../../lib/provinces/engine/province-vertical-profile";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import { PROVINCE_SPEC_TR_18 } from "../../lib/provinces/specs/tr-18";
import { PROVINCE_SPEC_TR_37 } from "../../lib/provinces/specs/tr-37";
import { PROVINCE_SPEC_TR_78 } from "../../lib/provinces/specs/tr-78";
import type { ProvinceSpec } from "../../lib/provinces/types";

const REG09_SPECS: readonly ProvinceSpec[] = [
  PROVINCE_SPEC_TR_18,
  PROVINCE_SPEC_TR_37,
  PROVINCE_SPEC_TR_78
];

describe("REG-09: Batı Karadeniz İç & Küre/Ilgaz Geçişi Mikroiklim Profilleri (TR-18, TR-37, TR-78)", () => {
  it("1. 3 ilin ProvinceSpec şeması, domainBounds, simetrik/köşegen 1.0 barrierCouplingMatrix, tam 9 noktalı şablon ve kesin artan 4-irtifa bandı kuralları tamdır", () => {
    const slugs = new Set<string>();

    for (const spec of REG09_SPECS) {
      expect(slugs.has(spec.slug)).toBe(false);
      slugs.add(spec.slug);

      // domainBounds geçerliliği ve merkez kapsama
      expect(spec.domainBounds.minLat).toBeLessThan(spec.domainBounds.maxLat);
      expect(spec.domainBounds.minLon).toBeLessThan(spec.domainBounds.maxLon);
      expect(spec.primaryCenter.lat).toBeGreaterThanOrEqual(spec.domainBounds.minLat);
      expect(spec.primaryCenter.lat).toBeLessThanOrEqual(spec.domainBounds.maxLat);
      expect(spec.primaryCenter.lon).toBeGreaterThanOrEqual(spec.domainBounds.minLon);
      expect(spec.primaryCenter.lon).toBeLessThanOrEqual(spec.domainBounds.maxLon);

      // ADM1 poligon sahipliği
      const centerRes = resolveProvinceCode({
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon
      });
      expect(centerRes.provinceCode, `${spec.nameTr} center ADM1`).toBe(
        spec.provinceCode
      );

      // 12 aylık klimatoloji dizileri (Tmax > Tmin)
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toHaveLength(12);
      expect(spec.primaryCenter.monthlyTminNormalsC).toHaveLength(12);
      for (let m = 0; m < 12; m++) {
        expect(spec.primaryCenter.monthlyTmaxNormalsC[m]).toBeGreaterThan(
          spec.primaryCenter.monthlyTminNormalsC[m]
        );
      }

      // barrierCouplingMatrix: köşegen 1.0 + tam simetri M[a][b] === M[b][a]
      const subIds = spec.subBasins.map((sb) => sb.id);
      const subSet = new Set(subIds);
      expect(subSet.has(spec.primaryCenter.subBasinId)).toBe(true);

      for (const a of subIds) {
        expect(spec.barrierCouplingMatrix[a]?.[a]).toBe(1.0);
        for (const b of subIds) {
          const ab = spec.barrierCouplingMatrix[a]?.[b];
          const ba = spec.barrierCouplingMatrix[b]?.[a];
          expect(typeof ab).toBe("number");
          expect(ab).toBe(ba);
          expect(ab).toBeGreaterThanOrEqual(0);
          expect(ab).toBeLessThanOrEqual(1);
        }
      }

      for (const ov of Object.values(spec.stationOverrides)) {
        expect(subSet.has(ov.subBasinId)).toBe(true);
      }

      // 4-bant kesin artan rakım (b0 < b1 < b2 < b3 <= maxPhysicalPeakM)
      const [b0, b1, b2, b3] = spec.verticalProfileSpec.snowElevationBands;
      expect(b0.elevationM).toBeLessThan(b1.elevationM);
      expect(b1.elevationM).toBeLessThan(b2.elevationM);
      expect(b2.elevationM).toBeLessThan(b3.elevationM);
      expect(b3.elevationM).toBeLessThanOrEqual(
        spec.verticalProfileSpec.maxPhysicalPeakM
      );

      // Tam 9 noktalı uzamsal şablon
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.stencil9Points.filter((p) => p.role === "target")).toHaveLength(1);
    }
  });

  it("2. Kalibrasyon katmanları ve METAR beyaz listeleri lib/metar-verify.ts ile birebir uyumludur", () => {
    expect(PROVINCE_SPEC_TR_18.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_18.primaryCenter.wmoId).toBe("17080");
    expect(PROVINCE_SPEC_TR_18.icaoWhitelist).toEqual(
      getAllowedTurkeyIcaosForProvince("TR-18")
    );
    expect(PROVINCE_SPEC_TR_18.icaoWhitelist).toEqual([]);

    expect(PROVINCE_SPEC_TR_37.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_37.primaryCenter.wmoId).toBe("17074");
    expect(PROVINCE_SPEC_TR_37.icaoWhitelist).toEqual(
      getAllowedTurkeyIcaosForProvince("TR-37")
    );
    expect(PROVINCE_SPEC_TR_37.icaoWhitelist).toEqual(["LTAL"]);

    expect(PROVINCE_SPEC_TR_78.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(PROVINCE_SPEC_TR_78.icaoWhitelist).toEqual(
      getAllowedTurkeyIcaosForProvince("TR-78")
    );
    expect(PROVINCE_SPEC_TR_78.icaoWhitelist).toEqual([]);
  });

  it("3. TR-18 Çankırı: Ilgaz (2587m) güney yağış gölgesi, Acıçay/Kızılırmak -32..44°C kontinentalitesi ve Çerkeş–Ilgaz ayaz ayrımı çalışır", () => {
    expect(PROVINCE_SPEC_TR_18.verticalProfileSpec.maxPhysicalPeakM).toBe(2587);
    expect(PROVINCE_SPEC_TR_18.qcAndMosBounds.minPlausibleTempC).toBe(-32);
    expect(PROVINCE_SPEC_TR_18.qcAndMosBounds.maxPlausibleTempC).toBe(44);
    expect(PROVINCE_SPEC_TR_18.waterBodies).toHaveLength(0);

    // Kuzeyli (5°) akışta Çankırı Acıçay/Kızılırmak çanağı Ilgaz yağış gölgesine girer (< 0.70x)
    const cankiriBasin = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_18, {
      lat: 40.6082,
      lon: 33.6102,
      elevationM: 751,
      subBasinId: "acicay_kizilirmak_salt_trough"
    });
    const northShadow = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_18,
      target: cankiriBasin,
      drivers: {
        localHour: 12,
        isNight: false,
        cloudCoverPct: 85,
        wind850DirDeg: 5,
        wind850SpeedKmh: 45
      }
    });
    expect(northShadow.precipMultiplier).toBeLessThan(0.7);

    // Güneyli (195°) cephede Yıldıztepe Alpin sırtı orografik kar artışı alır (> 1.30x)
    const yildiztepeTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_18, {
      lat: 41.0371,
      lon: 33.7899,
      elevationM: 1850,
      subBasinId: "ilgaz_south_alpine_wall"
    });
    const southAlpineSnow = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_18,
      target: yildiztepeTarget,
      drivers: {
        localHour: 6,
        isNight: true,
        cloudCoverPct: 100,
        wind850DirDeg: 195,
        wind850SpeedKmh: 58
      }
    });
    expect(southAlpineSnow.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(southAlpineSnow.precipMultiplier).toBeGreaterThan(1.3);
  });

  it("4. TR-37 Kastamonu: Küre Dağları kıyı DEK/upslope (11/13°C, 850 hPa) vs Gökırmak çanağı yağış gölgesi ve LTAL plato izolasyonu doğrulanır", () => {
    expect(PROVINCE_SPEC_TR_37.waterBodies).toHaveLength(1);
    const blackSea = PROVINCE_SPEC_TR_37.waterBodies[0];
    expect(blackSea.convectiveInstabilityUpperHpa).toBe(850);
    expect(blackSea.dekWatchDeltaTC).toBe(11);
    expect(blackSea.dekHeavyDeltaTC).toBe(13);

    // LTAL havalimanı (1073m plato) merkez manşetinden izole edilmiştir
    expect(PROVINCE_SPEC_TR_37.stationOverrides.LTAL.excludeFromCenterHeadline).toBe(
      true
    );
    expect(
      PROVINCE_SPEC_TR_37.barrierCouplingMatrix.kure_black_sea_littoral
        .gokirmak_kastamonu_bowl
    ).toBeLessThanOrEqual(0.1);

    // 345° Karayel/Yıldız fırtınasında İnebolu kıyısı şiddetli upslope (> 1.50x) alırken Kastamonu çanağı Küre gölgesinde (< 0.65x) kalır!
    const ineboluTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_37, {
      lat: 41.9789,
      lon: 33.7636,
      elevationM: 40,
      subBasinId: "kure_black_sea_littoral",
      isCoastal: true
    });
    const kastamonuBowlTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_37, {
      lat: 41.371,
      lon: 33.7756,
      elevationM: 800,
      subBasinId: "gokirmak_kastamonu_bowl"
    });

    const nwStormDrivers = {
      localHour: 3,
      isNight: true,
      cloudCoverPct: 100,
      wind850DirDeg: 345,
      wind850SpeedKmh: 60
    };

    const coastUpslope = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_37,
      target: ineboluTarget,
      drivers: nwStormDrivers
    });
    const bowlShadow = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_37,
      target: kastamonuBowlTarget,
      drivers: nwStormDrivers
    });

    expect(coastUpslope.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(coastUpslope.precipMultiplier).toBeGreaterThan(1.5);
    expect(bowlShadow.precipMultiplier).toBeLessThan(0.65);

    // Aynı anda güneydoğudaki yüksek Ilgaz Yurduntepe (2100m) üst seviye kar yakalar (> 1.35x)
    const ilgazSkiTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_37, {
      lat: 41.0678,
      lon: 33.7261,
      elevationM: 2100,
      subBasinId: "ilgaz_north_alpine_ski"
    });
    const ilgazUpslope = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_37,
      target: ilgazSkiTarget,
      drivers: nwStormDrivers
    });
    expect(ilgazUpslope.precipMultiplier).toBeGreaterThan(1.35);
  });

  it("5. TR-78 Karabük: 280m V-vadi gece enverziyonu, 485m Safranbolu taraçası, Yenice orman boğazı kanalizasyonu ve 1950–2000m Keltepe kar kuşağı doğrulanır", () => {
    expect(PROVINCE_SPEC_TR_78.primaryCenter.demVerifiedElevationM).toBe(280);
    expect(PROVINCE_SPEC_TR_78.verticalProfileSpec.maxPhysicalPeakM).toBe(2000);

    // Yenice Filyos Boğazı 310° Karayel kanal ivmelenmesi
    const yeniceFunnel = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_78.venturiCorridors,
      targetLat: 41.1983,
      targetLon: 32.3267,
      windDirDeg: 310,
      windSpeedKmh: 34
    });
    expect(yeniceFunnel.speedMultiplier).toBeGreaterThan(1.18);
    expect(yeniceFunnel.gustMultiplier).toBeGreaterThan(1.25);

    // Keltepe Kayak Merkezi (1950m) 315° Karayel nem kanalizasyonunda kuvvetli orografik kar artışı alır
    const keltepeTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_78, {
      lat: 41.064,
      lon: 32.4625,
      elevationM: 1950,
      subBasinId: "keltepe_ahmetusta_alpine"
    });
    const keltepeSnow = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_78,
      target: keltepeTarget,
      drivers: {
        localHour: 4,
        isNight: true,
        cloudCoverPct: 100,
        wind850DirDeg: 315,
        wind850SpeedKmh: 56
      }
    });
    expect(keltepeSnow.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(keltepeSnow.precipMultiplier).toBeGreaterThan(1.38);

    // Sakin açık kış gecesinde Karabük V-vadi tabanı (280m, -3.6°C) Safranbolu taraçasından (581m, +0.2°C) daha soğuk enverziyon üretir
    const stations = [
      {
        stationId: 17078,
        provinceCode: "TR-78",
        name: "Karabük V-Vadi",
        lat: 41.1956,
        lon: 32.6227,
        elevationM: 280,
        tempC: -3.6,
        relHumidityPct: 92,
        windSpeedKmh: 3,
        subBasinId: "karabuk_arac_soganli_v_valley"
      },
      {
        stationId: 17904,
        provinceCode: "TR-78",
        name: "Safranbolu",
        lat: 41.2636,
        lon: 32.6951,
        elevationM: 581,
        tempC: 0.2,
        relHumidityPct: 74,
        windSpeedKmh: 6,
        subBasinId: "safranbolu_eflani_ovacik_plateau"
      },
      {
        stationId: 17074,
        provinceCode: "TR-37",
        name: "Kastamonu (Komşu İl — Reddedilmeli)",
        lat: 41.371,
        lon: 33.7756,
        elevationM: 800,
        tempC: -9.5,
        relHumidityPct: 88
      }
    ];

    const vProfile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_78,
      stations,
      cloudCoverPct: 8,
      isNight: true,
      hasSnowpack: false,
      wind10mSpeedKmh: 3
    });
    expect(vProfile.inversionStrengthC).toBeGreaterThan(0.5);

    const valleySurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_78,
      target: {
        lat: 41.1956,
        lon: 32.6227,
        elevationM: 280,
        subBasinId: "karabuk_arac_soganli_v_valley"
      },
      stations,
      drivers: {
        localHour: 5,
        month: 1,
        isNight: true,
        cloudCoverPct: 8,
        wind10mSpeedKmh: 3
      },
      verticalProfile: vProfile
    });
    expect(valleySurface).not.toBeNull();
    expect(valleySurface!.rejectedCrossBorderCount).toBe(1);
    expect(valleySurface!.tempC).toBeLessThan(-1.5);
  });
});
