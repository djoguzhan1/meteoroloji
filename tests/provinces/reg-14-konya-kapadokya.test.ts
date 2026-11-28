import { describe, expect, it } from "vitest";
import {
  getAllowedTurkeyIcaosForProvince,
  isIcaoAllowedForProvince
} from "../../lib/metar-verify";
import { verifyBursaImmutabilityManifest } from "../../lib/provinces/bursa-vault-guard";
import { searchTrNationalCatalog } from "../../lib/provinces/catalog-1102";
import { TR81_CLIMATOLOGY_1991_2020 } from "../../lib/provinces/climatology-1991-2020";
import { PROVINCE_CALIBRATION_TR_42 } from "../../lib/provinces/emos-weights/tr-42";
import { PROVINCE_CALIBRATION_TR_50 } from "../../lib/provinces/emos-weights/tr-50";
import { PROVINCE_CALIBRATION_TR_51 } from "../../lib/provinces/emos-weights/tr-51";
import { PROVINCE_CALIBRATION_TR_68 } from "../../lib/provinces/emos-weights/tr-68";
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
  type ProvinceLiveStationObs
} from "../../lib/provinces/engine/province-vertical-profile";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import {
  resolveProvinceElevationBandSpecs,
  TR81_HYPSOMETRIC_PROFILES
} from "../../lib/provinces/hypsometric-bands-tr81";
import { isMgmStationOwnedByProvince } from "../../lib/provinces/mgm-dem-repair";
import PROVINCE_SPEC_TR_42_DEFAULT, {
  PROVINCE_SPEC_TR_42,
  TR_42_KONYA_BASIN_REGIME
} from "../../lib/provinces/specs/tr-42";
import PROVINCE_SPEC_TR_50_DEFAULT, {
  PROVINCE_SPEC_TR_50,
  TR_50_CAPPADOCIA_VALLEY_PLATEAU_DELTA
} from "../../lib/provinces/specs/tr-50";
import PROVINCE_SPEC_TR_51_DEFAULT, {
  PROVINCE_SPEC_TR_51,
  TR_51_ALADAGLAR_GULEK_REGIME
} from "../../lib/provinces/specs/tr-51";
import PROVINCE_SPEC_TR_68_DEFAULT, {
  PROVINCE_SPEC_TR_68,
  TR_68_TUZGOLU_HASANDAGI_GRADIENT
} from "../../lib/provinces/specs/tr-68";
import type { ProvinceSpec } from "../../lib/provinces/types";

const REG_14_SPECS: readonly ProvinceSpec[] = [
  PROVINCE_SPEC_TR_42,
  PROVINCE_SPEC_TR_50,
  PROVINCE_SPEC_TR_51,
  PROVINCE_SPEC_TR_68
];

describe("Wave 3B — REG-14 (Konya Kapalı Havzası & Kapadokya Volkanik Platosu: TR-42 Konya, TR-50 Nevşehir, TR-51 Niğde, TR-68 Aksaray)", () => {
  it("1. Yapısal Sözleşme, MGM İstasyon Sahipliği, METAR Beyaz Listesi, 4-Bant Hipsometri ve 1991–2020 Klimatoloji Uyumu", () => {
    expect(PROVINCE_SPEC_TR_42_DEFAULT).toBe(PROVINCE_SPEC_TR_42);
    expect(PROVINCE_SPEC_TR_50_DEFAULT).toBe(PROVINCE_SPEC_TR_50);
    expect(PROVINCE_SPEC_TR_51_DEFAULT).toBe(PROVINCE_SPEC_TR_51);
    expect(PROVINCE_SPEC_TR_68_DEFAULT).toBe(PROVINCE_SPEC_TR_68);

    for (const spec of REG_14_SPECS) {
      expect(spec.region).toBe("CENTRAL_ANATOLIA");
      expect(spec.climateRegion).toBe("IC_ANADOLU");
      expect(spec.donorCluster).toBe("CENTRAL_ANATOLIA_BASIN");
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.stencil9Points.filter((p) => p.role === "target")).toHaveLength(1);
      expect(spec.aridAndSevereDrivers.coastalWaterspoutSusceptibility).toBe(0);

      // Official ADM1 polygon center resolution
      const resolved = resolveProvinceCode({
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon
      });
      expect(resolved.provinceCode).toBe(spec.provinceCode);

      // Official ICAO METAR parity with lib/metar-verify.ts
      expect(getAllowedTurkeyIcaosForProvince(spec.provinceCode)).toEqual(
        spec.icaoWhitelist
      );

      // Official 4-band hypsometry & 1991–2020 normals parity
      const hyp = TR81_HYPSOMETRIC_PROFILES[spec.provinceCode];
      expect(spec.verticalProfileSpec.maxPhysicalPeakM).toBe(hyp.maxPhysicalPeakM);
      expect(spec.verticalProfileSpec.snowElevationBands).toEqual(hyp.bands);
      const [k0, k1, k2, k3] = spec.verticalProfileSpec.piecewiseKnotsM;
      expect(k0).toBeLessThan(k1);
      expect(k1).toBeLessThan(k2);
      expect(k2).toBeLessThan(k3);
      expect(k3).toBeLessThanOrEqual(hyp.maxPhysicalPeakM);

      const clim = TR81_CLIMATOLOGY_1991_2020[spec.provinceCode];
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toEqual(clim.tmaxC);
      expect(spec.primaryCenter.monthlyTminNormalsC).toEqual(clim.tminC);

      // Symmetric barrier coupling matrix in [0, 1] with 1.0 diagonal
      const sbIds = spec.subBasins.map((s) => s.id);
      expect(sbIds).toContain(spec.primaryCenter.subBasinId);
      for (const a of sbIds) {
        expect(spec.barrierCouplingMatrix[a]?.[a]).toBe(1.0);
        for (const b of sbIds) {
          const wAB = spec.barrierCouplingMatrix[a]?.[b];
          const wBA = spec.barrierCouplingMatrix[b]?.[a];
          expect(wAB).toBeDefined();
          expect(wAB).toBeGreaterThanOrEqual(0);
          expect(wAB).toBeLessThanOrEqual(1);
          expect(wAB).toBeCloseTo(wBA ?? -1, 6);
        }
      }

      // 100% strict MGM station ownership check
      expect(
        isMgmStationOwnedByProvince(spec.primaryCenter.mgmIstNo, spec.provinceCode)
      ).toBe(true);
      for (const ov of Object.values(spec.stationOverrides)) {
        expect(sbIds).toContain(ov.subBasinId);
        if (typeof ov.stationId === "number") {
          expect(
            isMgmStationOwnedByProvince(ov.stationId, spec.provinceCode),
            `${spec.provinceCode} station ${ov.stationId}`
          ).toBe(true);
        }
      }
      for (const wb of spec.waterBodies) {
        for (const buoyId of wb.mgmMarineStationIds) {
          expect(
            isMgmStationOwnedByProvince(buoyId, spec.provinceCode),
            `${spec.provinceCode} waterBody station ${buoyId}`
          ).toBe(true);
        }
      }
    }

    // Exact Tier & ICAO checks for all 4 provinces
    expect(PROVINCE_SPEC_TR_42.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_42.primaryCenter.wmoId).toBe("17244");
    expect(PROVINCE_SPEC_TR_42.icaoWhitelist).toEqual(["LTAN"]);

    expect(PROVINCE_SPEC_TR_50.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_50.primaryCenter.wmoId).toBe("17193");
    expect(PROVINCE_SPEC_TR_50.icaoWhitelist).toEqual(["LTAZ"]);

    expect(PROVINCE_SPEC_TR_51.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_51.primaryCenter.wmoId).toBe("17250");
    expect(PROVINCE_SPEC_TR_51.icaoWhitelist).toEqual([]);
    expect(isIcaoAllowedForProvince("LTAF", "TR-51")).toBe(false);
    expect(isIcaoAllowedForProvince("LTAU", "TR-51")).toBe(false);

    expect(PROVINCE_SPEC_TR_68.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(PROVINCE_SPEC_TR_68.icaoWhitelist).toEqual([]);
    expect(isIcaoAllowedForProvince("LTAZ", "TR-68")).toBe(false);
    expect(isIcaoAllowedForProvince("LTAN", "TR-68")).toBe(false);
  });

  it("2. TR-42 Konya: Kış Stratus/Sis Kilidi (0.56), Seydişehir–Hadim Toros Kar Kuşağı vs. Merkez/Cihanbeyli Kurak Gölge, Toz/Ters-V ve Beyşehir Tatlı Su Gölü (Açık Deniz DEK Yok)", () => {
    // Persistent stratus lock & dust/microburst drivers
    expect(PROVINCE_SPEC_TR_42.inversionAndWedgeSpec.persistentStratusLock).toEqual({
      enabled: true,
      daytimeSolarDampingFactor: 0.56
    });
    expect(PROVINCE_SPEC_TR_42.aridAndSevereDrivers.dustTransportSusceptibility).toBe(0.78);
    expect(
      PROVINCE_SPEC_TR_42.aridAndSevereDrivers.invertedVDryMicroburstSusceptibility
    ).toBe(0.82);

    // Beyşehir Gölü is strictly a shallow freshwater lake (1123m), NO Marine API, NO open-sea DEK!
    expect(PROVINCE_SPEC_TR_42.waterBodies).toHaveLength(1);
    const beysehir = PROVINCE_SPEC_TR_42.waterBodies[0];
    expect(beysehir.kind).toBe("fresh_lake");
    expect(beysehir.useOpenMeteoMarineApi).toBe(false);
    expect(beysehir.surfaceElevationM).toBe(1123);
    expect(beysehir.freezingPointC).toBe(0.0);
    expect(beysehir.dekWatchDeltaTC).toBeGreaterThanOrEqual(26.0);
    expect(TR_42_KONYA_BASIN_REGIME.beysehirLakeOpenSeaDekAllowed).toBe(false);

    // Güneybatı (200° Lodos/Kıble) Akdeniz Cephesi:
    // Seydişehir–Hadim–Taşkent Toros kuşağında yoğun orografik yağış/kar (UPSLOPE_OROGRAPHIC > 1.4x)
    // olurken, Konya Merkez ve Cihanbeyli/Karapınar Toros yağış gölgesinde (FOEHN_LEE / RAIN_SHADOW < 0.7x) kalır!
    const hadimTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_42, {
      lat: 36.9893,
      lon: 32.4557,
      elevationM: 1552,
      subBasinId: "beysehir_seydisehir_hadim_taurus"
    });
    const konyaCenterTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_42, {
      lat: 37.8687,
      lon: 32.4713,
      elevationM: 1029,
      subBasinId: "konya_central_closed_basin"
    });
    const cihanbeyliTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_42, {
      lat: 38.6506,
      lon: 32.9219,
      elevationM: 973,
      subBasinId: "cihanbeyli_kulu_tuzgolu_steppe"
    });

    const swDrivers = {
      localHour: 14,
      month: 1,
      isNight: false,
      cloudCoverPct: 92,
      wind850DirDeg: 200,
      wind850SpeedKmh: 58,
      wind10mDirDeg: 195,
      wind10mSpeedKmh: 28
    };

    const hadimEffect = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_42,
      target: hadimTarget,
      drivers: swDrivers
    });
    const konyaCenterEffect = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_42,
      target: konyaCenterTarget,
      drivers: swDrivers
    });
    const cihanbeyliEffect = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_42,
      target: cihanbeyliTarget,
      drivers: swDrivers
    });

    expect(hadimEffect.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(hadimEffect.precipMultiplier).toBeGreaterThan(1.45);
    expect(konyaCenterEffect.precipMultiplier).toBeLessThan(0.65);
    expect(cihanbeyliEffect.precipMultiplier).toBeLessThan(0.65);
    expect(hadimEffect.precipMultiplier / konyaCenterEffect.precipMultiplier).toBeGreaterThan(2.3);

    // Cressman spatial decoupling: heavy precipitation at Hadim/Seydişehir does NOT contaminate dry Konya Merkez
    const liveKonyaStations: ProvinceLiveStationObs[] = [
      {
        stationId: 17245,
        provinceCode: "TR-42",
        lat: 37.8687,
        lon: 32.4713,
        elevationM: 1029,
        tempC: -2.4,
        relHumidityPct: 96,
        precip1hMm: 0.0,
        isPrecipitating: false,
        snowDepthCm: 6
      },
      {
        stationId: 17928,
        provinceCode: "TR-42",
        lat: 36.9893,
        lon: 32.4557,
        elevationM: 1552,
        tempC: -1.1,
        relHumidityPct: 97,
        precip1hMm: 8.4,
        isPrecipitating: true,
        snowDepthCm: 42
      }
    ];
    const centerSfc = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_42,
      target: { lat: 37.8687, lon: 32.4713, elevationM: 1029 },
      stations: liveKonyaStations,
      drivers: {
        localHour: 3,
        month: 1,
        isNight: true,
        cloudCoverPct: 12,
        wind850DirDeg: 40,
        wind850SpeedKmh: 10,
        wind10mDirDeg: 35,
        wind10mSpeedKmh: 4,
        hasSnowpack: true
      }
    });
    expect(centerSfc).not.toBeNull();
    expect(centerSfc!.precip1hMm).toBeLessThan(0.05);
    expect(centerSfc!.isPrecipitatingNow).toBe(false);
    expect(centerSfc!.verticalState).toBe("STRONG_INVERSION");
  });

  it("3. TR-50 Nevşehir: 1260m Tüf Platosu Merkez vs. 945m Gülşehir LTAZ Kızılırmak Vadi Tabanı (315m İrtifa & Ayaz Farkı, excludeFromCenterHeadline: true) ve Göreme–Ürgüp–Uçhisar Terselmesi", () => {
    expect(TR_50_CAPPADOCIA_VALLEY_PLATEAU_DELTA.centerToLtazElevationDiffM).toBe(315);
    const ltazOverride = PROVINCE_SPEC_TR_50.stationOverrides.LTAZ;
    expect(ltazOverride).toBeDefined();
    expect(ltazOverride.demElevationM).toBe(945);
    expect(ltazOverride.subBasinId).toBe("kizilirmak_gulsehir_avanos_trough");
    expect(ltazOverride.excludeFromCenterHeadline).toBe(true);
    expect(ltazOverride.coldPoolSusceptibility).toBeGreaterThanOrEqual(0.9);

    // Clear calm snow-covered winter night across Cappadocia:
    // Kızılırmak trough (LTAZ 945m: -14.2°C) & Göreme/Ürgüp valley (1068m: -11.8°C) pool frigid air,
    // while Nevşehir Merkez (1260m: -6.8°C) & Uçhisar ridge (1350m) sit in the warmer thermal belt!
    const cappadociaNightObs: ProvinceLiveStationObs[] = [
      {
        stationId: "LTAZ",
        icaoId: "LTAZ",
        provinceCode: "TR-50",
        lat: 38.7719,
        lon: 34.5345,
        elevationM: 945,
        tempC: -14.2,
        relHumidityPct: 92,
        windSpeedKmh: 3,
        snowDepthCm: 7
      },
      {
        stationId: 17835,
        provinceCode: "TR-50",
        lat: 38.6218,
        lon: 34.9144,
        elevationM: 1068,
        tempC: -11.8,
        relHumidityPct: 89,
        windSpeedKmh: 4,
        snowDepthCm: 6
      },
      {
        stationId: 17193,
        provinceCode: "TR-50",
        lat: 38.6163,
        lon: 34.7025,
        elevationM: 1260,
        tempC: -6.8,
        relHumidityPct: 74,
        windSpeedKmh: 6,
        snowDepthCm: 8
      }
    ];

    const vProfile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_50,
      stations: cappadociaNightObs,
      isNight: true,
      cloudCoverPct: 5,
      wind850SpeedKmh: 9,
      wind10mSpeedKmh: 4,
      hasSnowpack: true
    });

    expect(vProfile.boundaryLayerState).toBe("STRONG_INVERSION");
    expect(vProfile.lowerPoolLapseCPerKm).toBeGreaterThan(4.0);
    expect(vProfile.inversionStrengthC).toBeGreaterThan(2.5);

    // Solving surface at Nevşehir Merkez (1260m) MUST NOT be dragged down to LTAZ's -14.2°C!
    const nevsehirCenterSolved = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_50,
      target: {
        lat: 38.6163,
        lon: 34.7025,
        elevationM: 1260,
        subBasinId: "cappadocia_tuff_plateau"
      },
      stations: cappadociaNightObs,
      drivers: {
        localHour: 4,
        month: 1,
        isNight: true,
        cloudCoverPct: 5,
        wind10mSpeedKmh: 4,
        wind850SpeedKmh: 9,
        hasSnowpack: true
      },
      verticalProfile: vProfile
    });
    expect(nevsehirCenterSolved).not.toBeNull();
    expect(nevsehirCenterSolved!.tempC).toBeGreaterThan(-8.0);
    const ltazWeightOnCenter =
      nevsehirCenterSolved!.contributions.find((c) => c.stationId === "LTAZ")
        ?.normalizedWeight ?? 0;
    expect(ltazWeightOnCenter).toBeLessThan(0.02);

    // Meanwhile Uçhisar ridge (1350m) stays warmer than Göreme valley floor (1075m) under nocturnal inversion
    const deltaGoremeToUchisar = integrateProvinceVerticalDeltaC(1075, 1350, vProfile);
    expect(deltaGoremeToUchisar).toBeGreaterThan(0.4);
  });

  it("4. TR-51 Niğde: Aladağlar (3756m Demirkazık) & Bolkar Batı/KB Kar Yamacı + Ulukışla (Gülek Kuzey Çıkışı) Venturi Koridoru vs. Bor–Altunhisar Kurak Ova", () => {
    expect(TR_51_ALADAGLAR_GULEK_REGIME.demirkazikPeakM).toBe(3756);
    expect(PROVINCE_SPEC_TR_51.verticalProfileSpec.maxPhysicalPeakM).toBe(3756);

    const camardiTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_51, {
      lat: 37.8358,
      lon: 34.9975,
      elevationM: 1603,
      subBasinId: "camardi_aladaglar_bolkar_alpine"
    });
    const borPlainTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_51, {
      lat: 37.9214,
      lon: 34.5528,
      elevationM: 1115,
      subBasinId: "bor_altunhisar_arid_plain"
    });

    // A) Güney/Güneybatı (195°) cephe sisteminde Çamardı/Ulukışla-Gülek hattı yoğun orografik kar alırken,
    // Bor–Altunhisar ovası Bolkar (3524m) yağış gölgesinde kalır!
    const southSwFront = {
      localHour: 12,
      month: 2,
      isNight: false,
      cloudCoverPct: 95,
      wind850DirDeg: 195,
      wind850SpeedKmh: 56,
      wind10mDirDeg: 190,
      wind10mSpeedKmh: 30
    };

    const camardiOro = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_51,
      target: camardiTarget,
      drivers: southSwFront
    });
    const borShadow = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_51,
      target: borPlainTarget,
      drivers: southSwFront
    });

    expect(camardiOro.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(camardiOro.precipMultiplier).toBeGreaterThan(1.45);
    expect(borShadow.precipMultiplier).toBeLessThan(0.65);
    expect(camardiOro.precipMultiplier / borShadow.precipMultiplier).toBeGreaterThan(2.3);

    // B) Batı/Kuzeybatı (280° WNW) İç Anadolu kar cephesi doğrudan Aladağlar (3756m Demirkazık) batı duvarına çarpar:
    const wnwAladaglarSnow = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_51,
      target: camardiTarget,
      drivers: {
        ...southSwFront,
        wind850DirDeg: 280,
        wind10mDirDeg: 275
      }
    });
    expect(wnwAladaglarSnow.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(wnwAladaglarSnow.precipMultiplier).toBeGreaterThan(1.55);

    // C) Ulukışla (Gülek Kuzey Çıkışı, 1453m): NNE (25°) ve SSW (205°) iki yönlü Venturi ivmelenmesi ve terselme kırılması!
    const ulukislaVenturiNne = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_51.venturiCorridors,
      targetLat: 37.548,
      targetLon: 34.4867,
      windDirDeg: 25,
      windSpeedKmh: 32
    });
    const ulukislaVenturiSsw = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_51.venturiCorridors,
      targetLat: 37.548,
      targetLon: 34.4867,
      windDirDeg: 205,
      windSpeedKmh: 32
    });

    expect(ulukislaVenturiNne.activeCorridorIds).toContain("ulukisla_gulek_north_exit_venturi");
    expect(ulukislaVenturiNne.speedMultiplier).toBeCloseTo(1.45, 2);
    expect(ulukislaVenturiNne.gustMultiplier).toBeCloseTo(1.62, 2);
    expect(ulukislaVenturiNne.suppressesNocturnalInversion).toBe(true);
    expect(ulukislaVenturiSsw.speedMultiplier).toBeCloseTo(1.45, 2);
  });

  it("5. TR-68 Aksaray: Tuz Gölü Güneydoğu Düzlüğü (~965m, Toz/Ters-V/Sis) vs. Hasan Dağı (3268m) İzole Stratovolkan Kar Konisi & Tier-B Donor/ALARO Sıfır-Kesme Kalibrasyonu", () => {
    expect(PROVINCE_SPEC_TR_68.primaryCenter.demVerifiedElevationM).toBe(965);
    expect(PROVINCE_SPEC_TR_68.verticalProfileSpec.maxPhysicalPeakM).toBe(3268);
    expect(TR_68_TUZGOLU_HASANDAGI_GRADIENT.verticalReliefSpanM).toBe(2303);
    expect(PROVINCE_SPEC_TR_68.aridAndSevereDrivers.dustTransportSusceptibility).toBeGreaterThanOrEqual(0.8);
    expect(
      PROVINCE_SPEC_TR_68.aridAndSevereDrivers.invertedVDryMicroburstSusceptibility
    ).toBeGreaterThanOrEqual(0.8);

    // Catalog summit lookup for Hasan Dağı (18889)
    const hasanHits = searchTrNationalCatalog("Hasan Dağı", { limit: 3 });
    expect(hasanHits[0]?.provinceCode).toBe("TR-68");
    expect(hasanHits[0]?.elevationM).toBeGreaterThan(2000);

    // Dramatic vertical & orographic contrast between Eskil–Tuz Gölü flat (915m) and Hasan Dağı cone (2750m):
    const eskilFlatTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_68, {
      lat: 38.3086,
      lon: 33.3592,
      elevationM: 915,
      subBasinId: "tuzgolu_eskil_sultanhani_flat"
    });
    const hasanConeTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_68, {
      lat: 38.1275,
      lon: 34.165,
      elevationM: 2750,
      subBasinId: "hasandagi_stratovolcano_cone"
    });

    const wswMoistFlow = {
      localHour: 15,
      month: 1,
      isNight: false,
      cloudCoverPct: 90,
      wind850DirDeg: 255,
      wind850SpeedKmh: 58,
      wind10mDirDeg: 245,
      wind10mSpeedKmh: 30
    };
    const hasanUpslope = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_68,
      target: hasanConeTarget,
      drivers: wswMoistFlow
    });
    const eskilFlatWsw = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_68,
      target: eskilFlatTarget,
      drivers: wswMoistFlow
    });

    expect(hasanUpslope.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(hasanUpslope.precipMultiplier).toBeGreaterThan(1.5);
    expect(eskilFlatWsw.precipMultiplier).toBe(1.0);

    // Hypsometric 4-band monotonicity at both Aksaray Merkez (965m) and Hasan Dağı (2750m)
    const bandsPlain = resolveProvinceElevationBandSpecs({
      provinceCode: "TR-68",
      referenceElevationM: 965
    });
    const bandsSummit = resolveProvinceElevationBandSpecs({
      provinceCode: "TR-68",
      referenceElevationM: 2750
    });
    expect(bandsPlain[1].isReferenceBand).toBe(true);
    expect(bandsSummit[3].isReferenceBand).toBe(true);
    expect(bandsPlain[3].orographicBoost).toBeGreaterThan(1.45);

    // EMOS calibration integration across all 4 provinces (Tier-A TR-42/50/51 vs Tier-B TR-68 zero-intercept + ALARO hook):
    const uniformMinus15 = {
      ecmwfIfs: -15,
      ecmwfAifs: -15,
      icon: -15,
      ukmo: -15,
      meteofrance: -15,
      gfs: -15,
      gem: -15,
      jma: -15
    };
    const calTr68 = evaluateProvinceCalibratedHour({
      leadHours: 12,
      localHour: 6,
      month: 1,
      spec: PROVINCE_SPEC_TR_68,
      bundle: PROVINCE_CALIBRATION_TR_68,
      tempSnapshot: uniformMinus15,
      mgmAlaroHourly: { tempC: -16.2, rhPct: 92, windSpeedKmh: 6, isWet: false }
    });
    expect(calTr68.tier).toBe("TIER_B_DONOR_ALARO");
    expect(calTr68.appliedInterceptC).toBe(0);
    expect(calTr68.weightSum).toBeCloseTo(1.0, 6);
    expect(calTr68.appliedAlaroBlendWeight).toBeGreaterThan(0);
    expect(calTr68.temperatureC).toBeLessThan(-15.0);

    for (const [spec, bundle] of [
      [PROVINCE_SPEC_TR_42, PROVINCE_CALIBRATION_TR_42],
      [PROVINCE_SPEC_TR_50, PROVINCE_CALIBRATION_TR_50],
      [PROVINCE_SPEC_TR_51, PROVINCE_CALIBRATION_TR_51]
    ] as const) {
      const res = evaluateProvinceCalibratedHour({
        leadHours: 24,
        localHour: 14,
        month: 7,
        spec,
        bundle,
        tempSnapshot: {
          ecmwfIfs: 31.2,
          ecmwfAifs: 30.8,
          icon: 31.5,
          ukmo: 31.0,
          meteofrance: 31.4,
          gfs: 31.9,
          gem: 31.1,
          jma: 30.7
        }
      });
      expect(res.tier).toBe("TIER_A_EMPIRICAL_WMO");
      expect(res.weightSum).toBeCloseTo(1.0, 6);
    }
  });

  it("6. Bursa TR-16 Dondurulmuş SHA-256 Koruması (%0 Sızıntı) Bozulmadan Kalır", () => {
    const check = verifyBursaImmutabilityManifest();
    expect(check.ok).toBe(true);
    expect(check.violations).toEqual([]);
  });
});
