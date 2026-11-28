import { describe, expect, it } from "vitest";
import { getAllowedTurkeyIcaosForProvince } from "../../lib/metar-verify";
import { PROVINCE_CALIBRATION_TR_12 } from "../../lib/provinces/emos-weights/tr-12";
import { PROVINCE_CALIBRATION_TR_13 } from "../../lib/provinces/emos-weights/tr-13";
import { PROVINCE_CALIBRATION_TR_49 } from "../../lib/provinces/emos-weights/tr-49";
import { PROVINCE_CALIBRATION_TR_65 } from "../../lib/provinces/emos-weights/tr-65";
import {
  applyDirectionalBarrierRules,
  applyVenturiCorridorRules,
  computeProvinceMicroclimateOffsetC,
  resolveProvinceTargetMetadata,
  solveProvinceTopographicSurface
} from "../../lib/provinces/engine/province-cressman";
import { computeProvinceLiveVerticalProfile } from "../../lib/provinces/engine/province-vertical-profile";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import { PROVINCE_SPEC_TR_12 } from "../../lib/provinces/specs/tr-12";
import { PROVINCE_SPEC_TR_13 } from "../../lib/provinces/specs/tr-13";
import { PROVINCE_SPEC_TR_49 } from "../../lib/provinces/specs/tr-49";
import { PROVINCE_SPEC_TR_65 } from "../../lib/provinces/specs/tr-65";
import type { ProvinceSpec } from "../../lib/provinces/types";
import { evaluateSeaEffectSnow } from "../../lib/snow-and-lightning-engine";

const REG19_SPECS: readonly ProvinceSpec[] = [
  PROVINCE_SPEC_TR_12,
  PROVINCE_SPEC_TR_13,
  PROVINCE_SPEC_TR_49,
  PROVINCE_SPEC_TR_65
];

describe("Wave 3C — REG-19: Van Gölü Kapalı Havzası & Güneydoğu Toros Kar Duvarı (TR-12, TR-13, TR-49, TR-65)", () => {
  it("1. 4 ilin ProvinceSpec şema bütünlüğü, tüm istasyon/alt-konum/9-nokta ADM1 poligon uyumu, EMOS/METAR eşleşmesi ve 4-bant monotonluğu tamdır", () => {
    const slugs = new Set<string>();

    for (const spec of REG19_SPECS) {
      expect(slugs.has(spec.slug)).toBe(false);
      slugs.add(spec.slug);

      // Ana merkez, tüm curatedSubLocations, tüm stationOverrides ve tüm stencil9Points noktalarının il poligonu doğrulaması
      const centerGeo = resolveProvinceCode({
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon
      });
      expect(centerGeo.provinceCode, `${spec.nameTr} primaryCenter`).toBe(
        spec.provinceCode
      );

      for (const sub of spec.curatedSubLocations) {
        const subGeo = resolveProvinceCode({ lat: sub.lat, lon: sub.lon });
        expect(subGeo.provinceCode, `${spec.nameTr} curated ${sub.id}`).toBe(
          spec.provinceCode
        );
      }

      for (const [stKey, ov] of Object.entries(spec.stationOverrides)) {
        if (ov.lat !== undefined && ov.lon !== undefined) {
          const stGeo = resolveProvinceCode({ lat: ov.lat, lon: ov.lon });
          expect(stGeo.provinceCode, `${spec.nameTr} station ${stKey}`).toBe(
            spec.provinceCode
          );
        }
      }

      for (const pt of spec.stencil9Points) {
        const ptGeo = resolveProvinceCode({ lat: pt.lat, lon: pt.lon });
        expect(ptGeo.provinceCode, `${spec.nameTr} stencil ${pt.key}`).toBe(
          spec.provinceCode
        );
      }

      // 12 aylık 1991-2020 klimatoloji bütünlüğü
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toHaveLength(12);
      expect(spec.primaryCenter.monthlyTminNormalsC).toHaveLength(12);
      for (let m = 0; m < 12; m++) {
        expect(spec.primaryCenter.monthlyTmaxNormalsC[m]).toBeGreaterThan(
          spec.primaryCenter.monthlyTminNormalsC[m]
        );
      }

      // Alt-havza ve bariyer matrisi simetri / diyagonal kontrolü
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

      for (const ov of Object.values(spec.stationOverrides)) {
        expect(subIds.has(ov.subBasinId)).toBe(true);
      }

      // 4-irtifa kar bandı kesin artan monotonluk ve fiziki tavan sınırı
      const bands = spec.verticalProfileSpec.snowElevationBands;
      expect(bands).toHaveLength(4);
      expect(bands[0].elevationM).toBeLessThan(bands[1].elevationM);
      expect(bands[1].elevationM).toBeLessThan(bands[2].elevationM);
      expect(bands[2].elevationM).toBeLessThan(bands[3].elevationM);
      expect(bands[3].elevationM).toBeLessThanOrEqual(
        spec.verticalProfileSpec.maxPhysicalPeakM
      );

      // 9-nokta stencil tamlığı
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.stencil9Points.some((p) => p.role === "target")).toBe(true);

      // Resmi ulusal METAR beyaz listesi ile birebir uyum
      expect(spec.icaoWhitelist).toEqual(
        getAllowedTurkeyIcaosForProvince(spec.provinceCode)
      );
    }

    // EMOS kalibrasyon paketi kademe ve WMO istasyon eşleşmeleri
    expect(PROVINCE_SPEC_TR_12.calibrationTier).toBe(
      PROVINCE_CALIBRATION_TR_12.calibrationTier
    );
    expect(PROVINCE_SPEC_TR_12.primaryCenter.wmoId).toBe(
      PROVINCE_CALIBRATION_TR_12.wmoStationId
    );
    expect(PROVINCE_SPEC_TR_12.icaoWhitelist).toEqual(["LTCU"]);

    expect(PROVINCE_SPEC_TR_13.calibrationTier).toBe(
      PROVINCE_CALIBRATION_TR_13.calibrationTier
    );
    expect(PROVINCE_SPEC_TR_13.icaoWhitelist).toEqual([]);

    expect(PROVINCE_SPEC_TR_49.calibrationTier).toBe(
      PROVINCE_CALIBRATION_TR_49.calibrationTier
    );
    expect(PROVINCE_SPEC_TR_49.primaryCenter.wmoId).toBe(
      PROVINCE_CALIBRATION_TR_49.wmoStationId
    );
    expect(PROVINCE_SPEC_TR_49.icaoWhitelist).toEqual(["LTCK"]);

    expect(PROVINCE_SPEC_TR_65.calibrationTier).toBe(
      PROVINCE_CALIBRATION_TR_65.calibrationTier
    );
    expect(PROVINCE_SPEC_TR_65.primaryCenter.wmoId).toBe(
      PROVINCE_CALIBRATION_TR_65.wmoStationId
    );
    expect(PROVINCE_SPEC_TR_65.icaoWhitelist).toEqual(["LTCI"]);
  });

  it("2. TR-12 Bingöl: Güneybatılı Akdeniz/Basra siklonlarında Güneydoğu Toros cephesel kar yükselimi, Karlıova (~1828–1940m) tipi Venturi jeti ve soğuk kama koruması çalışır", () => {
    expect(PROVINCE_SPEC_TR_12.waterBodies).toEqual([]);
    expect(PROVINCE_SPEC_TR_12.verticalProfileSpec.maxPhysicalPeakM).toBe(3250);

    // Güneybatılı (200°) kuvvetli cephe akışında Bingöl Merkez & Hesarek yüksek orografik kar çarpanı alır
    const bingolCenter = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_12, {
      lat: 38.8847,
      lon: 40.5007,
      elevationM: 1139,
      subBasinId: "capakcur_bingol_basin"
    });
    const swFrontalSnow = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_12,
      target: bingolCenter,
      drivers: {
        localHour: 4,
        month: 1,
        isNight: true,
        cloudCoverPct: 100,
        wind850DirDeg: 200,
        wind850SpeedKmh: 64
      }
    });
    expect(swFrontalSnow.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(swFrontalSnow.precipMultiplier).toBeGreaterThan(1.45);

    // Karlıova (~1828m) kış fırtına kavşağında NE (35°) ve SW (215°) akışta kuvvetli Venturi tipi ivmelenmesi
    const karliovaBlizzard = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_12.venturiCorridors,
      targetLat: 39.2936,
      targetLon: 41.0106,
      windDirDeg: 35,
      windSpeedKmh: 44
    });
    expect(karliovaBlizzard.speedMultiplier).toBeCloseTo(1.38, 2);
    expect(karliovaBlizzard.gustMultiplier).toBeCloseTo(1.52, 2);
    expect(karliovaBlizzard.suppressesNocturnalInversion).toBe(true);

    // Çapakçur (1139m, +2.4°C) ile Karlıova (1828m, -7.8°C) keskin bariyer ayrışması (<= 0.18)
    expect(
      PROVINCE_SPEC_TR_12.barrierCouplingMatrix.capakcur_bingol_basin
        .karliova_blizzard_hub
    ).toBeLessThanOrEqual(0.18);
  });

  it("3. TR-13 Bitlis: Bitlis Boğazı / Rahva güneyli maksimum kar duvarı, Tatvan (1648m alkaline_lake 700 hPa) doğulu Van Gölü LES bandı ve Süphan (4058m) doğrulanır", () => {
    expect(PROVINCE_SPEC_TR_13.verticalProfileSpec.maxPhysicalPeakM).toBe(4058);
    expect(PROVINCE_SPEC_TR_13.waterBodies).toHaveLength(1);

    const wbBitlis = PROVINCE_SPEC_TR_13.waterBodies[0];
    expect(wbBitlis.kind).toBe("alkaline_lake");
    expect(wbBitlis.surfaceElevationM).toBe(1648);
    expect(wbBitlis.freezingPointC).toBe(-1.8);
    expect(wbBitlis.convectiveInstabilityUpperHpa).toBe(700);
    expect(wbBitlis.dekWatchDeltaTC).toBe(12);
    expect(wbBitlis.dekHeavyDeltaTC).toBe(15);
    expect(wbBitlis.useOpenMeteoMarineApi).toBe(false);

    // Bitlis Boğazı / Rahva Geçidi: Güneyli (190°) nemli Mezopotamya akışında en yüksek kar çarpanı (> 1.55x) ve boğaz Venturi ivmesi
    const bitlisRahva = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_13, {
      lat: 38.475,
      lon: 42.1625,
      elevationM: 1789,
      subBasinId: "bitlis_gorge_rahva_wall"
    });
    const rahvaSnowWall = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_13,
      target: bitlisRahva,
      drivers: {
        localHour: 2,
        month: 1,
        isNight: true,
        cloudCoverPct: 100,
        wind850DirDeg: 190,
        wind850SpeedKmh: 66
      }
    });
    expect(rahvaSnowWall.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(rahvaSnowWall.precipMultiplier).toBeGreaterThan(1.55);

    const rahvaVenturi = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_13.venturiCorridors,
      targetLat: 38.475,
      targetLon: 42.1625,
      windDirDeg: 195,
      windSpeedKmh: 36
    });
    expect(rahvaVenturi.speedMultiplier).toBeGreaterThan(1.25);

    // Tatvan (1668m batı kıyısı): Doğulu/Kuzeydoğulu (85°) soğuk akışta 700 hPa Van Gölü LES kar bandı (LST=+4.5°C, T700=-11.5°C -> ΔT=16°C >= 15°C -> heavy_dek!)
    const tatvanLes = evaluateSeaEffectSnow({
      lat: 38.5033,
      lon: 42.2808,
      provinceCode: "TR-13",
      waterBodies: PROVINCE_SPEC_TR_13.waterBodies,
      liveWaterTempC: 4.5,
      temp850hPa: null, // 1648 m göl yüzeyinde 850 hPa yer altındadır; 700 hPa kuralı devreye girmeli!
      temp700hPa: -11.5,
      surfaceTempC: -2.0,
      windSpeedKmh: 28,
      windDirDeg: 85,
      precipMmHr: 1.2,
      month: 1
    });
    expect(tatvanLes.status).toBe("heavy_dek");
    expect(tatvanLes.deltaTSst850C).toBeCloseTo(16.0, 1);

    // Ters yönden (260° Batı — kara tarafından) esen rüzgarda Tatvan'da Van Gölü LES tetiklenmez
    const tatvanOffshore = evaluateSeaEffectSnow({
      lat: 38.5033,
      lon: 42.2808,
      provinceCode: "TR-13",
      waterBodies: PROVINCE_SPEC_TR_13.waterBodies,
      liveWaterTempC: 4.5,
      temp850hPa: null,
      temp700hPa: -12.0,
      surfaceTempC: -2.5,
      windSpeedKmh: 28,
      windDirDeg: 260,
      precipMmHr: 0.8,
      month: 1
    });
    expect(tatvanOffshore.status).toBe("none");
  });

  it("4. TR-49 Muş: Muş Ovası kapalı alüvyal çanağında kar-albedo ekstrem radyasyonel soğuma, donan sis (persistentStratusLock) ve LTCK ova tabanı ayrımı çalışır", () => {
    expect(PROVINCE_SPEC_TR_49.waterBodies).toEqual([]);
    expect(PROVINCE_SPEC_TR_49.inversionAndWedgeSpec.topographicEnclosureIndex).toBeGreaterThanOrEqual(
      0.9
    );
    expect(
      PROVINCE_SPEC_TR_49.inversionAndWedgeSpec.persistentStratusLock.enabled
    ).toBe(true);
    expect(
      PROVINCE_SPEC_TR_49.inversionAndWedgeSpec.persistentStratusLock
        .daytimeSolarDampingFactor
    ).toBeLessThanOrEqual(0.56);

    // Kar örtülü açık sakin kış gecesinde Muş Ovası (LTCK 1267m: -24.5°C) vs yamaç/plato (Güzeltepe 2280m: -14.0°C) kuvvetli pozitif lapse (enversiyon) üretir
    const musInvProfile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_49,
      stations: [
        {
          stationId: "LTCK",
          provinceCode: "TR-49",
          lat: 38.7478,
          lon: 41.6612,
          elevationM: 1267,
          tempC: -24.5,
          windSpeedKmh: 3,
          snowDepthCm: 48
        },
        {
          stationId: 17204,
          provinceCode: "TR-49",
          lat: 38.7509,
          lon: 41.5023,
          elevationM: 1316,
          tempC: -21.2,
          windSpeedKmh: 4,
          snowDepthCm: 45
        },
        {
          stationId: 17778,
          provinceCode: "TR-49",
          lat: 39.1763,
          lon: 41.4455,
          elevationM: 1500,
          tempC: -16.4,
          windSpeedKmh: 6,
          snowDepthCm: 55
        }
      ],
      cloudCoverPct: 8,
      isNight: true,
      hasSnowpack: true,
      wind10mSpeedKmh: 3
    });

    expect(musInvProfile.valleyFloorM).toBe(1255);
    expect(musInvProfile.coldPoolDepthM).toBe(420);
    expect(musInvProfile.inversionStrengthC).toBeGreaterThan(3.5);
    expect(musInvProfile.snowpackAmplified).toBe(true);
    expect(musInvProfile.boundaryLayerState).toBe("STRONG_INVERSION");
  });

  it("5. TR-65 Van: 1648m donmayan Van Gölü Batılı/Kuzeybatılı (250°–320°) 700 hPa LES kar bandı, kıyı termal ılımanlığı ve Çaldıran (-46.4°C, minPlausibleTempC=-47) / Başkale / Bahçesaray <= 0.15 keskin izolasyonu doğrulanır", () => {
    expect(PROVINCE_SPEC_TR_65.qcAndMosBounds.minPlausibleTempC).toBe(-47);
    expect(PROVINCE_SPEC_TR_65.waterBodies).toHaveLength(1);

    const wbVan = PROVINCE_SPEC_TR_65.waterBodies[0];
    expect(wbVan.kind).toBe("alkaline_lake");
    expect(wbVan.surfaceElevationM).toBe(1648);
    expect(wbVan.freezingPointC).toBe(-1.8);
    expect(wbVan.convectiveInstabilityUpperHpa).toBe(700);
    expect(wbVan.dekWatchDeltaTC).toBe(12);
    expect(wbVan.dekHeavyDeltaTC).toBe(15);
    expect(wbVan.useOpenMeteoMarineApi).toBe(false);

    // Çaldıran, Başkale ve Bahçesaray dış havzalarının Van Gölü kıyısıyla bariyer kuplajı <= 0.15 olmalıdır!
    const vanShoreCoupling =
      PROVINCE_SPEC_TR_65.barrierCouplingMatrix.van_lake_east_shore;
    expect(
      vanShoreCoupling.caldiran_ozalp_saray_frost_basin
    ).toBeLessThanOrEqual(0.15);
    expect(vanShoreCoupling.baskale_gurpinar_high_plateau).toBeLessThanOrEqual(
      0.15
    );
    expect(
      vanShoreCoupling.bahcesaray_catak_karabet_enclave
    ).toBeLessThanOrEqual(0.15);

    // Batılı/Kuzeybatılı (285° ∈ [250°, 320°]) soğuk hava baskınında LST=+4.2°C, T700=-9.2°C (ΔT=13.4°C >= 12°C) -> moderate_dek; T700=-11.5°C (ΔT=15.7°C >= 15°C) -> heavy_dek!
    const vanModerateLes = evaluateSeaEffectSnow({
      lat: 38.4693,
      lon: 43.346,
      provinceCode: "TR-65",
      waterBodies: PROVINCE_SPEC_TR_65.waterBodies,
      liveWaterTempC: 4.2,
      temp850hPa: null,
      temp700hPa: -9.2,
      surfaceTempC: 0.5,
      windSpeedKmh: 24,
      windDirDeg: 285,
      precipMmHr: 0.6,
      month: 1
    });
    expect(vanModerateLes.status).toBe("moderate_dek");
    expect(vanModerateLes.deltaTSst850C).toBeCloseTo(13.4, 1);

    const vanHeavyLes = evaluateSeaEffectSnow({
      lat: 38.4693,
      lon: 43.346,
      provinceCode: "TR-65",
      waterBodies: PROVINCE_SPEC_TR_65.waterBodies,
      liveWaterTempC: 4.2,
      temp850hPa: null,
      temp700hPa: -11.5,
      surfaceTempC: -1.8,
      windSpeedKmh: 32,
      windDirDeg: 295,
      precipMmHr: 1.4,
      month: 1
    });
    expect(vanHeavyLes.status).toBe("heavy_dek");

    // Doğu Göl Kıyısı termal ılımanlığı (kış gecesi göl +4.2°C iken hava -10°C olduğunda kıyı pozitif ılımanlaşma alır, Çaldıran ise 0.0 alır)
    const vanShoreMeta = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_65, {
      lat: 38.4693,
      lon: 43.346,
      elevationM: 1675,
      subBasinId: "van_lake_east_shore"
    });
    expect(vanShoreMeta.isCoastal).toBe(true);
    const shoreMod = computeProvinceMicroclimateOffsetC({
      spec: PROVINCE_SPEC_TR_65,
      target: vanShoreMeta,
      drivers: {
        localHour: 3,
        month: 1,
        isNight: true,
        cloudCoverPct: 30,
        wind10mDirDeg: 280,
        wind10mSpeedKmh: 18,
        liveWaterTempsByIdC: { lake_van_east_main: 4.2 }
      },
      ambientTempC: -10.0
    });
    expect(shoreMod.marineThermalModerationC).toBeGreaterThan(0.8);

    // Çaldıran'da -46.4°C Türkiye soğuk rekoru QC tarafından reddedilmez ve Van Merkez'i dondurmaz! (Bitlis/İran sınır istasyonu sızıntısı da reddedilir)
    const vanLiveStations = [
      {
        stationId: 17170,
        provinceCode: "TR-65",
        name: "Van Bölge (WMO 17170)",
        lat: 38.4693,
        lon: 43.346,
        elevationM: 1675,
        tempC: -6.8,
        relHumidityPct: 74,
        windSpeedKmh: 14,
        windDirDeg: 280,
        subBasinId: "van_lake_east_shore"
      },
      {
        stationId: "LTCI",
        provinceCode: "TR-65",
        name: "Van Ferit Melen (LTCI)",
        lat: 38.4682,
        lon: 43.3323,
        elevationM: 1670,
        tempC: -7.1,
        relHumidityPct: 76,
        windSpeedKmh: 16,
        windDirDeg: 285,
        subBasinId: "van_lake_east_shore"
      },
      {
        stationId: 18238,
        provinceCode: "TR-65",
        name: "Çaldıran",
        lat: 39.1377,
        lon: 43.9244,
        elevationM: 2050,
        tempC: -46.4, // Türkiye resmi rekoru (-47°C alt sınır içinde kabul edilmeli!)
        relHumidityPct: 82,
        windSpeedKmh: 2,
        snowDepthCm: 65,
        subBasinId: "caldiran_ozalp_saray_frost_basin",
        excludeFromCenterHeadline: true
      },
      {
        stationId: 17205,
        provinceCode: "TR-13", // Komşu Bitlis Tatvan istasyonu -> sınır güvenlik duvarında reddedilmeli!
        name: "Tatvan (Komşu İl)",
        lat: 38.5033,
        lon: 42.2808,
        elevationM: 1668,
        tempC: -2.0
      }
    ];

    const vanCenterSurf = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_65,
      target: {
        lat: 38.4693,
        lon: 43.346,
        elevationM: 1675,
        subBasinId: "van_lake_east_shore"
      },
      stations: vanLiveStations,
      drivers: {
        localHour: 5,
        month: 1,
        isNight: true,
        cloudCoverPct: 20,
        wind10mDirDeg: 280,
        wind10mSpeedKmh: 14,
        hasSnowpack: true
      }
    });

    const caldiranSurf = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_65,
      target: {
        lat: 39.1377,
        lon: 43.9244,
        elevationM: 2050,
        subBasinId: "caldiran_ozalp_saray_frost_basin"
      },
      stations: vanLiveStations,
      drivers: {
        localHour: 5,
        month: 1,
        isNight: true,
        cloudCoverPct: 5,
        wind10mDirDeg: 60,
        wind10mSpeedKmh: 2,
        hasSnowpack: true
      }
    });

    expect(vanCenterSurf).not.toBeNull();
    expect(caldiranSurf).not.toBeNull();
    expect(vanCenterSurf!.acceptedStationCount).toBe(3); // -46.4°C Çaldıran kabul edildi, komşu TR-13 reddedildi!
    expect(vanCenterSurf!.rejectedCrossBorderCount).toBe(1);
    expect(vanCenterSurf!.tempC).toBeGreaterThan(-9.0); // Van Gölü kıyısı Çaldıran'ın -46.4°C soğuğuyla kirlenmedi!
    expect(caldiranSurf!.tempC).toBeLessThan(-42.0); // Çaldıran kendi ekstrem soğuğunu tam korudu!
  });
});
