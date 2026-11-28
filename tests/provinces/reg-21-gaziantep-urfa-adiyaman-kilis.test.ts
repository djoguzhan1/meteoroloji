import { describe, expect, it } from "vitest";
import {
  getAllowedTurkeyIcaosForProvince,
  isIcaoAllowedForProvince
} from "../../lib/metar-verify";
import { getTrCatalogByProvince } from "../../lib/provinces/catalog-1102";
import { computeTrDailyClimatologyNormal } from "../../lib/provinces/climatology-1991-2020";
import PROVINCE_CALIBRATION_TR_02 from "../../lib/provinces/emos-weights/tr-02";
import PROVINCE_CALIBRATION_TR_63 from "../../lib/provinces/emos-weights/tr-63";
import PROVINCE_CALIBRATION_TR_79 from "../../lib/provinces/emos-weights/tr-79";
import {
  applyDirectionalBarrierRules,
  applyVenturiCorridorRules,
  computeProvinceMicroclimateOffsetC,
  resolveProvinceTargetMetadata,
  solveProvinceTopographicSurface
} from "../../lib/provinces/engine/province-cressman";
import { evaluateProvinceCalibratedHour } from "../../lib/provinces/engine/province-mos-engine";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import { resolveProvinceElevationBandSpecs } from "../../lib/provinces/hypsometric-bands-tr81";
import {
  MGM_DEM_ELEVATION_REPAIR_BY_ISTNO,
  MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID,
  STATIC_MGM_ISTNO_OWNER_PROVINCE
} from "../../lib/provinces/mgm-dem-repair";
import PROVINCE_SPEC_TR_02, {
  PROVINCE_SPEC_TR_02 as NAMED_TR_02,
  TR_02_ATATURK_RESERVOIR_NEMRUT_CONTRACT
} from "../../lib/provinces/specs/tr-02";
import PROVINCE_SPEC_TR_27, {
  PROVINCE_SPEC_TR_27 as NAMED_TR_27,
  TR_27_GAZIANTEP_PLATEAU_SNOW_CONTRACT
} from "../../lib/provinces/specs/tr-27";
import PROVINCE_SPEC_TR_63, {
  PROVINCE_SPEC_TR_63 as NAMED_TR_63,
  TR_63_HARRAN_GAP_KARACADAG_CONTRACT
} from "../../lib/provinces/specs/tr-63";
import PROVINCE_SPEC_TR_79, {
  PROVINCE_SPEC_TR_79 as NAMED_TR_79,
  TR_79_KILIS_OLIVE_THRESHOLD_CONTRACT
} from "../../lib/provinces/specs/tr-79";
import type { ProvinceSpec } from "../../lib/provinces/types";

describe("Wave 3C — REG-21 (Batı Güneydoğu Anadolu, Fırat Havzası & Suriye Eşiği: TR-02, TR-27, TR-63, TR-79)", () => {
  const ALL_SPECS: readonly ProvinceSpec[] = [
    PROVINCE_SPEC_TR_02,
    PROVINCE_SPEC_TR_27,
    PROVINCE_SPEC_TR_63,
    PROVINCE_SPEC_TR_79
  ];

  it("1. Dört ilin tamamı şema bütünlüğünü, derin donmuş (frozen) tekilliği, ADM1 poligon aidiyetini ve MGM istasyon sahipliğini eksiksiz sağlar", () => {
    expect(PROVINCE_SPEC_TR_02).toBe(NAMED_TR_02);
    expect(PROVINCE_SPEC_TR_27).toBe(NAMED_TR_27);
    expect(PROVINCE_SPEC_TR_63).toBe(NAMED_TR_63);
    expect(PROVINCE_SPEC_TR_79).toBe(NAMED_TR_79);

    for (const spec of ALL_SPECS) {
      expect(Object.isFrozen(spec)).toBe(true);
      expect(Object.isFrozen(spec.primaryCenter)).toBe(true);
      expect(Object.isFrozen(spec.subBasins)).toBe(true);
      expect(Object.isFrozen(spec.directionalBarriers)).toBe(true);
      expect(Object.isFrozen(spec.stencil9Points)).toBe(true);

      expect(spec.region).toBe("SOUTHEASTERN_ANATOLIA");
      expect(spec.climateRegion).toBe("GUNEYDOGU");
      expect(spec.donorCluster).toBe("SOUTHEAST_THRESHOLD_ARID");
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.curatedSubLocations.length).toBeGreaterThanOrEqual(4);
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toHaveLength(12);
      expect(spec.primaryCenter.monthlyTminNormalsC).toHaveLength(12);
      expect(spec.aridAndSevereDrivers.coastalWaterspoutSusceptibility).toBe(0);

      // 4-düğümlü dikey profil ve 4 kar bandı kesin artan olmalıdır
      const knots = spec.verticalProfileSpec.piecewiseKnotsM;
      expect(knots[0]).toBeLessThan(knots[1]);
      expect(knots[1]).toBeLessThan(knots[2]);
      expect(knots[2]).toBeLessThan(knots[3]);
      expect(knots[3]).toBeLessThanOrEqual(
        spec.verticalProfileSpec.maxPhysicalPeakM
      );

      const bands = spec.verticalProfileSpec.snowElevationBands;
      expect(bands[0].elevationM).toBeLessThan(bands[1].elevationM);
      expect(bands[1].elevationM).toBeLessThan(bands[2].elevationM);
      expect(bands[2].elevationM).toBeLessThan(bands[3].elevationM);

      // Alt havza kuplaj matrisi [0, 1] aralığında ve köşegende 1.0 olmalıdır
      const subIds = spec.subBasins.map((sb) => sb.id);
      for (const a of subIds) {
        expect(spec.barrierCouplingMatrix[a]?.[a]).toBe(1.0);
        for (const b of subIds) {
          const w = spec.barrierCouplingMatrix[a]?.[b];
          expect(w).toBeDefined();
          expect(w!).toBeGreaterThanOrEqual(0);
          expect(w!).toBeLessThanOrEqual(1);
        }
      }

      // Birincil merkez, küratörlü alt konumlar ve tüm stationOverrides noktaları kendi il poligonuna düşmelidir
      const centerRes = resolveProvinceCode({
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon,
        countryCode: "TR"
      });
      expect(centerRes.provinceCode).toBe(spec.provinceCode);

      for (const subLoc of spec.curatedSubLocations) {
        const subRes = resolveProvinceCode({
          lat: subLoc.lat,
          lon: subLoc.lon,
          admin1: spec.nameTr,
          countryCode: "TR"
        });
        expect(subRes.provinceCode).toBe(spec.provinceCode);
      }

      for (const override of Object.values(spec.stationOverrides)) {
        if (override.lat !== undefined && override.lon !== undefined) {
          const stRes = resolveProvinceCode({
            lat: override.lat,
            lon: override.lon,
            admin1: spec.nameTr,
            countryCode: "TR"
          });
          expect(stRes.provinceCode).toBe(spec.provinceCode);
        }
        const istNo = Number(override.stationId);
        if (Number.isFinite(istNo) && STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo]) {
          expect(STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo]).toBe(spec.provinceCode);
        }
      }
    }
  });

  it("2. TR-02 Adıyaman: Atatürk Baraj Gölü (fresh_lake 540 m, açık deniz DEK değil!) + Nemrut (2150 m) / Çelikhan (1380 m) dik güney Toros orografik yağış duvarı ve +44°C Basra sıcağı", () => {
    expect(PROVINCE_SPEC_TR_02.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_02.primaryCenter.wmoId).toBe("17265");
    expect(PROVINCE_SPEC_TR_02.primaryCenter.demVerifiedElevationM).toBe(672);
    expect(PROVINCE_SPEC_TR_02.icaoWhitelist).toEqual(["LTCP"]);
    expect(getAllowedTurkeyIcaosForProvince("TR-02")).toEqual(["LTCP"]);
    expect(isIcaoAllowedForProvince("LTCP", "TR-02")).toBe(true);
    expect(isIcaoAllowedForProvince("LTCS", "TR-02")).toBe(false);
    expect(isIcaoAllowedForProvince("LTAJ", "TR-02")).toBe(false);
    expect(isIcaoAllowedForProvince("LTAT", "TR-02")).toBe(false);

    // Atatürk Baraj Gölü: fresh_lake ılımanlığı / göl meltemi vardır ama açık deniz Marine API / DEK yoktur!
    expect(PROVINCE_SPEC_TR_02.waterBodies).toHaveLength(1);
    const reservoir = PROVINCE_SPEC_TR_02.waterBodies[0];
    expect(reservoir.kind).toBe("fresh_lake");
    expect(reservoir.useOpenMeteoMarineApi).toBe(false);
    expect(reservoir.mgmMarineStationIds).toEqual([]);
    expect(reservoir.surfaceElevationM).toBe(540);
    expect(reservoir.effectiveFetchKm).toBeLessThanOrEqual(35);
    expect(reservoir.convectiveInstabilityUpperHpa).toBe(700);
    expect(reservoir.dekWatchDeltaTC).toBeGreaterThanOrEqual(18.0);
    expect(reservoir.subBasinInfluenceWeights.ataturk_reservoir_samsat_terrace).toBeGreaterThan(
      0.75
    );
    expect(reservoir.subBasinInfluenceWeights.nemrut_akdag_alpine).toBe(0);

    // Yaz öğleden sonra Samsat baraj terasında (590 m) güneyli su esintisi serinletme etkisi üretir
    const samsatTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_02, {
      lat: 37.5825,
      lon: 38.4806,
      elevationM: 590,
      subBasinId: "ataturk_reservoir_samsat_terrace"
    });
    const samsatLakeBreeze = computeProvinceMicroclimateOffsetC({
      spec: PROVINCE_SPEC_TR_02,
      target: samsatTarget,
      drivers: {
        localHour: 15,
        month: 7,
        isNight: false,
        cloudCoverPct: 5,
        wind10mDirDeg: 185,
        wind10mSpeedKmh: 18
      },
      ambientTempC: 42.5
    });
    expect(samsatLakeBreeze.seaBreezeOffsetC).toBeLessThan(-0.6);

    // Nemrut (2134 m DEM onarımlı) ve Çelikhan (1380 m) dik güney yamacı: Güneyli/GB (195°) siklonda güçlü upslope!
    expect(PROVINCE_SPEC_TR_02.stationOverrides["19258"].demElevationM).toBe(
      MGM_DEM_ELEVATION_REPAIR_BY_ISTNO[19258]
    );
    expect(PROVINCE_SPEC_TR_02.stationOverrides["18180"].demElevationM).toBe(1380);

    const celikhanTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_02, {
      lat: 38.0294,
      lon: 38.2272,
      elevationM: 1380,
      subBasinId: "celikhan_sincik_taurus_slope"
    });
    const celikhanSoutherlyUpslope = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_02,
      target: celikhanTarget,
      drivers: {
        localHour: 12,
        month: 1,
        isNight: false,
        cloudCoverPct: 95,
        wind850DirDeg: 195,
        wind850SpeedKmh: 54
      }
    });
    expect(celikhanSoutherlyUpslope.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(celikhanSoutherlyUpslope.precipMultiplier).toBeGreaterThan(1.55);
    expect(celikhanSoutherlyUpslope.foehnTempDeltaC).toBe(0);

    // Tersine Malatya yönünden esen KKD (15°) rüzgarda Adıyaman–Kahta eteği (672 m) kuru fön ve yağış gölgesi alır
    const adiyamanPiedmontTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_02, {
      lat: 37.7553,
      lon: 38.2775,
      elevationM: 672,
      subBasinId: "adiyaman_kahta_piedmont"
    });
    const adiyamanNorthFoehn = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_02,
      target: adiyamanPiedmontTarget,
      drivers: {
        localHour: 14,
        month: 3,
        isNight: false,
        cloudCoverPct: 25,
        wind850DirDeg: 15,
        wind850SpeedKmh: 52
      }
    });
    expect(adiyamanNorthFoehn.activeRegime).toBe("FOEHN_LEE");
    expect(adiyamanNorthFoehn.foehnTempDeltaC).toBeGreaterThan(1.8);
    expect(adiyamanNorthFoehn.precipMultiplier).toBeLessThan(0.72);

    // Gölbaşı–Erkenek oluğu Venturi ivmelenmesi ve +44°C Basra sıcağı EMOS doğrulaması
    const golbasiJet = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_02.venturiCorridors,
      targetLat: 37.7867,
      targetLon: 37.6532,
      windDirDeg: 225,
      windSpeedKmh: 30
    });
    expect(golbasiJet.activeCorridorIds).toContain("golbasi_erkenek_rift_chute");
    expect(golbasiJet.speedMultiplier).toBeCloseTo(1.28, 2);

    const basraHour = evaluateProvinceCalibratedHour({
      leadHours: 24,
      localHour: 15,
      month: 7,
      spec: PROVINCE_SPEC_TR_02,
      bundle: PROVINCE_CALIBRATION_TR_02,
      tempSnapshot: {
        ecmwfIfs: 44.2,
        ecmwfAifs: 44.0,
        icon: 43.8,
        ukmo: 44.4,
        meteofrance: 44.1,
        gfs: 44.5,
        gem: 43.9,
        jma: 43.7
      }
    });
    expect(basraHour.tier).toBe("TIER_A_EMPIRICAL_WMO");
    expect(basraHour.temperatureC).toBeGreaterThan(43.2);
    expect(basraHour.temperatureC).toBeLessThanOrEqual(
      PROVINCE_SPEC_TR_02.qcAndMosBounds.maxPlausibleTempC
    );
    expect(TR_02_ATATURK_RESERVOIR_NEMRUT_CONTRACT.nemrutSummitElevationM).toBe(2150);
  });

  it("3. TR-27 Gaziantep: 850–927 m Plato & Sof Dağı (1496 m) sürpriz yoğun kar mekanizması (sığ soğuk kama vs Akdeniz alçağı), İslahiye Amanos koridoru vs 375 m Karkamış Fırat tabanı", () => {
    expect(PROVINCE_SPEC_TR_27.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_27.primaryCenter.wmoId).toBe("17260");
    expect(PROVINCE_SPEC_TR_27.primaryCenter.demVerifiedElevationM).toBe(850);
    expect(PROVINCE_SPEC_TR_27.verticalProfileSpec.maxPhysicalPeakM).toBe(1496);
    expect(PROVINCE_SPEC_TR_27.waterBodies).toEqual([]);

    // METAR izolasyonu: Yalnızca LTAJ serbest; Maraş LTCN, Hatay LTDA, Urfa LTCS ve Halep OSAP yasak!
    expect(PROVINCE_SPEC_TR_27.icaoWhitelist).toEqual(["LTAJ"]);
    expect(isIcaoAllowedForProvince("LTAJ", "TR-27")).toBe(true);
    expect(isIcaoAllowedForProvince("LTCN", "TR-27")).toBe(false);
    expect(isIcaoAllowedForProvince("LTDA", "TR-27")).toBe(false);
    expect(isIcaoAllowedForProvince("LTCS", "TR-27")).toBe(false);
    expect(isIcaoAllowedForProvince("OSAP", "TR-27")).toBe(false);

    // İrtifa farkı doğrulaması: Gaziantep Platosu (850–927 m) Şanlıurfa (550 m), Harran (375 m), Karkamış (375 m) ve Kilis'ten (640 m) belirgin yüksektir
    const antepElev = PROVINCE_SPEC_TR_27.stationOverrides["17261"].demElevationM;
    const sehitkamilElev = PROVINCE_SPEC_TR_27.stationOverrides["18272"].demElevationM;
    const karkamisElev = PROVINCE_SPEC_TR_27.stationOverrides["18150"].demElevationM;
    expect(antepElev - PROVINCE_SPEC_TR_63.primaryCenter.demVerifiedElevationM).toBeGreaterThanOrEqual(300);
    expect(sehitkamilElev - karkamisElev).toBeGreaterThan(500);
    expect(antepElev - PROVINCE_SPEC_TR_79.primaryCenter.demVerifiedElevationM).toBeGreaterThan(200);

    // SÜRPRİZ YOĞUN KAR ÇARPIŞMASI: Yüzeyde KD (45°) soğuk kıta kaması varken 850 hPa'da GGB (200°)
    // Akdeniz alçağı tırmandığında sığ soğuk kama kuralı sahte fönü kilitler ve yamaç kar yağışını büyütür!
    const antepPlateauTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_27, {
      lat: 37.0585,
      lon: 37.351,
      elevationM: 854,
      subBasinId: "gaziantep_central_plateau"
    });
    const snowCollisionBarrier = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_27,
      target: antepPlateauTarget,
      drivers: {
        localHour: 6,
        month: 1,
        isNight: true,
        cloudCoverPct: 100,
        wind10mDirDeg: 45,
        wind10mSpeedKmh: 22,
        wind850DirDeg: 200,
        wind850SpeedKmh: 50
      }
    });
    expect(snowCollisionBarrier.foehnBlockedByColdWedge).toBe(true);
    expect(snowCollisionBarrier.foehnTempDeltaC).toBe(0);
    expect(snowCollisionBarrier.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(snowCollisionBarrier.precipMultiplier).toBeGreaterThan(1.35);

    // Canlı Cressman: Karkamış Fırat vadisi (+4.8°C yağmur) iken Gaziantep Platosu (+0.2°C) ve Sof Dağı (-3.4°C yoğun kar) korunur
    const winterStations = [
      {
        stationId: 17261,
        provinceCode: "TR-27" as const,
        name: "Gaziantep Şahinbey",
        lat: 37.0585,
        lon: 37.351,
        elevationM: 854,
        tempC: 0.3,
        relHumidityPct: 96,
        precip1hMm: 3.4,
        snowDepthCm: 18,
        isPrecipitating: true,
        subBasinId: "gaziantep_central_plateau"
      },
      {
        stationId: 18272,
        provinceCode: "TR-27" as const,
        name: "Gaziantep Şehitkamil",
        lat: 37.1701,
        lon: 37.2877,
        elevationM: 927,
        tempC: -0.4,
        relHumidityPct: 97,
        precip1hMm: 3.8,
        snowDepthCm: 26,
        isPrecipitating: true,
        subBasinId: "gaziantep_central_plateau"
      },
      {
        stationId: 18150,
        provinceCode: "TR-27" as const,
        name: "Gaziantep Karkamış",
        lat: 36.8356,
        lon: 38.0008,
        elevationM: 375,
        tempC: 4.8,
        relHumidityPct: 88,
        precip1hMm: 1.6,
        snowDepthCm: 0,
        isPrecipitating: true,
        subBasinId: "karkamis_nizip_euphrates_valley"
      }
    ];
    const sofdagiSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_27,
      target: {
        lat: 37.162,
        lon: 37.128,
        elevationM: 1420,
        subBasinId: "sofdagi_duluk_snow_ridge"
      },
      stations: winterStations,
      drivers: {
        localHour: 6,
        month: 1,
        isNight: true,
        cloudCoverPct: 100,
        wind10mDirDeg: 45,
        wind10mSpeedKmh: 20,
        wind850DirDeg: 200,
        wind850SpeedKmh: 50,
        hasSnowpack: true
      }
    })!;
    const karkamisSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_27,
      target: {
        lat: 36.8356,
        lon: 38.0008,
        elevationM: 375,
        subBasinId: "karkamis_nizip_euphrates_valley"
      },
      stations: winterStations,
      drivers: {
        localHour: 6,
        month: 1,
        isNight: true,
        cloudCoverPct: 100,
        wind10mDirDeg: 45,
        wind10mSpeedKmh: 18,
        wind850DirDeg: 200,
        wind850SpeedKmh: 45
      }
    })!;
    expect(sofdagiSurface.tempC).toBeLessThan(-2.0);
    expect(karkamisSurface.tempC).toBeGreaterThan(4.0);
    expect(karkamisSurface.tempC - sofdagiSurface.tempC).toBeGreaterThan(6.5);

    // İslahiye–Nurdağı Amanos koridoru: hem GB upslope yağışı (1.62x tavan) hem Ayran/Nurdağı geçit jeti aktif!
    const nurdagiJet = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_27.venturiCorridors,
      targetLat: 37.1708,
      targetLon: 36.7533,
      windDirDeg: 260,
      windSpeedKmh: 32
    });
    expect(nurdagiJet.activeCorridorIds).toContain("gavurdagi_ayran_pass_jet");
    expect(nurdagiJet.speedMultiplier).toBeCloseTo(1.34, 2);
    expect(TR_27_GAZIANTEP_PLATEAU_SNOW_CONTRACT.sofdagiPeakM).toBe(1496);
  });

  it("4. TR-63 Şanlıurfa: Harran–Akçakale Basra +47°C sıcağı, 0.94 toz taşınımı, 0.88 ters-V kuru microburst, GAP sulama nemi ve Karacadağ (1957 m) tek kar tutan kubbe", () => {
    expect(PROVINCE_SPEC_TR_63.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_63.primaryCenter.wmoId).toBe("17270");
    expect(PROVINCE_SPEC_TR_63.primaryCenter.demVerifiedElevationM).toBe(550);
    expect(PROVINCE_SPEC_TR_63.icaoWhitelist).toEqual(["LTCS"]);
    expect(isIcaoAllowedForProvince("LTCS", "TR-63")).toBe(true);
    expect(isIcaoAllowedForProvince("LTCP", "TR-63")).toBe(false);
    expect(isIcaoAllowedForProvince("LTAJ", "TR-63")).toBe(false);
    expect(isIcaoAllowedForProvince("LTCR", "TR-63")).toBe(false);
    expect(isIcaoAllowedForProvince("OSAP", "TR-63")).toBe(false);

    // Zorunlu kurak / şiddetli hadise katsayıları ve +47°C Basra pik kapasitesi
    expect(PROVINCE_SPEC_TR_63.aridAndSevereDrivers.dustTransportSusceptibility).toBe(0.94);
    expect(
      PROVINCE_SPEC_TR_63.aridAndSevereDrivers.invertedVDryMicroburstSusceptibility
    ).toBe(0.88);
    expect(PROVINCE_SPEC_TR_63.qcAndMosBounds.maxPlausibleTempC).toBeGreaterThanOrEqual(49);

    // DEM onarımları: Harran 19270 (375 m ova, asla 1675 m değil!), Haliliye/Karaköprü (548 m), Karacadağ 18922 (1946 m)
    expect(PROVINCE_SPEC_TR_63.stationOverrides["19270"].demElevationM).toBe(375);
    expect(MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID[96303]).toBe(548);
    expect(MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID[96305]).toBe(548);
    expect(PROVINCE_SPEC_TR_63.stationOverrides["19341"].demElevationM).toBe(
      MGM_DEM_ELEVATION_REPAIR_BY_ISTNO[19341]
    );
    expect(PROVINCE_SPEC_TR_63.stationOverrides["18922"].demElevationM).toBe(
      MGM_DEM_ELEVATION_REPAIR_BY_ISTNO[18922]
    );

    // +47°C Basra sıcak dalgası + GAP sulama kanalı yüksek çiy noktası (Td ~ 22°C) ölçek-eşdeğer EMOS testi
    const urfaBasraPeak = evaluateProvinceCalibratedHour({
      leadHours: 18,
      localHour: 15,
      month: 7,
      spec: PROVINCE_SPEC_TR_63,
      bundle: PROVINCE_CALIBRATION_TR_63,
      targetElevationM: 375,
      referenceElevationM: 547,
      tempSnapshot: {
        ecmwfIfs: 46.4,
        ecmwfAifs: 46.2,
        icon: 46.0,
        ukmo: 46.5,
        meteofrance: 46.3,
        gfs: 46.8,
        gem: 46.1,
        jma: 45.9
      },
      dewSnapshot: {
        ecmwfIfs: 21.8,
        ecmwfAifs: 21.5,
        icon: 22.0,
        ukmo: 21.6,
        meteofrance: 22.2,
        gfs: 22.4,
        gem: 21.4,
        jma: 21.2
      }
    });
    expect(urfaBasraPeak.temperatureC).toBeGreaterThan(46.8);
    expect(urfaBasraPeak.dewPointC).not.toBeNull();
    expect(urfaBasraPeak.dewPointC!).toBeGreaterThan(21.5);
    expect(TR_63_HARRAN_GAP_KARACADAG_CONTRACT.gapIrrigationDewPointSurgeC).toBeGreaterThanOrEqual(
      5.0
    );

    // KARACADAĞ (1957 m) YALITIMI: Urfa'nın tek kar tutan kubbesi Harran/Akçakale (+10°C) ile karışmaz
    expect(
      PROVINCE_SPEC_TR_63.barrierCouplingMatrix.harran_akcakale_ceylanpinar_plain
        .karacadag_shield_summit
    ).toBeLessThanOrEqual(0.05);
    expect(
      PROVINCE_SPEC_TR_63.stationOverrides["18922"].excludeFromCenterHeadline
    ).toBe(true);

    const urfaWinterStations = [
      {
        stationId: 17980,
        provinceCode: "TR-63" as const,
        name: "Akçakale",
        lat: 36.7276,
        lon: 38.9473,
        elevationM: 365,
        tempC: 10.4,
        snowDepthCm: 0,
        subBasinId: "harran_akcakale_ceylanpinar_plain"
      },
      {
        stationId: 17270,
        provinceCode: "TR-63" as const,
        name: "Şanlıurfa Merkez",
        lat: 37.1608,
        lon: 38.7863,
        elevationM: 549,
        tempC: 8.8,
        snowDepthCm: 0,
        subBasinId: "sanliurfa_piedmont_steppe"
      },
      {
        stationId: 18922,
        provinceCode: "TR-63" as const,
        name: "Karacadağ Kayak Merkezi",
        lat: 37.7151,
        lon: 39.8293,
        elevationM: 1946,
        tempC: -3.2,
        snowDepthCm: 64,
        subBasinId: "karacadag_shield_summit"
      },
      {
        // Komşu Diyarbakır TR-21 istasyonu sınır güvenlik duvarı tarafından reddedilmelidir!
        stationId: 17280,
        provinceCode: "TR-21" as const,
        name: "Diyarbakır Sızıntı Testi",
        lat: 37.8973,
        lon: 40.2027,
        elevationM: 674,
        tempC: -15.0
      }
    ];

    const harranWinter = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_63,
      target: {
        lat: 36.8644,
        lon: 39.0314,
        elevationM: 375,
        subBasinId: "harran_akcakale_ceylanpinar_plain"
      },
      stations: urfaWinterStations,
      drivers: {
        localHour: 13,
        month: 1,
        isNight: false,
        cloudCoverPct: 50,
        wind10mDirDeg: 210,
        wind10mSpeedKmh: 16
      }
    })!;
    const karacadagWinter = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_63,
      target: {
        lat: 37.7151,
        lon: 39.8293,
        elevationM: 1946,
        subBasinId: "karacadag_shield_summit"
      },
      stations: urfaWinterStations,
      drivers: {
        localHour: 13,
        month: 1,
        isNight: false,
        cloudCoverPct: 85,
        wind10mDirDeg: 220,
        wind10mSpeedKmh: 28,
        hasSnowpack: true
      }
    })!;

    expect(harranWinter.rejectedCrossBorderCount).toBe(1);
    expect(harranWinter.tempC).toBeGreaterThan(9.2);
    expect(harranWinter.snowDepthCm).toBe(0);
    expect(karacadagWinter.tempC).toBeLessThan(-2.5);
    expect(karacadagWinter.snowDepthCm).toBeGreaterThanOrEqual(60);

    const karacadagBands = resolveProvinceElevationBandSpecs({
      provinceCode: "TR-63",
      referenceElevationM: 1946,
      locationName: "Karacadağ Kayak Merkezi"
    });
    expect(karacadagBands).toHaveLength(4);
    expect(karacadagBands.find((b) => b.isReferenceBand)?.id).toBe("summit");
  });

  it("5. TR-79 Kilis: TIER_B_DONOR_KALMAN (intercept=0), sıfır METAR listesi (Gaziantep LTAJ & Halep OSAP kesin yasak!), Akdeniz-zeytinlik esinti eşiği ve toz duyarlılığı", () => {
    expect(PROVINCE_SPEC_TR_79.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(PROVINCE_SPEC_TR_79.primaryCenter.wmoId).toBeUndefined();
    expect(PROVINCE_SPEC_TR_79.primaryCenter.demVerifiedElevationM).toBe(640);
    expect(PROVINCE_SPEC_TR_79.waterBodies).toEqual([]);

    // KESİN METAR İZOLASYONU: Kilis [] olmalı; Gaziantep LTAJ, Hatay LTDA ve Suriye OSAP sızıntısı YASAK!
    expect(PROVINCE_SPEC_TR_79.icaoWhitelist).toEqual([]);
    expect(getAllowedTurkeyIcaosForProvince("TR-79")).toEqual([]);
    expect(isIcaoAllowedForProvince("LTAJ", "TR-79")).toBe(false);
    expect(isIcaoAllowedForProvince("LTDA", "TR-79")).toBe(false);
    expect(isIcaoAllowedForProvince("LTCN", "TR-79")).toBe(false);
    expect(isIcaoAllowedForProvince("OSAP", "TR-79")).toBe(false);
    expect(TR_79_KILIS_OLIVE_THRESHOLD_CONTRACT.blockedNeighborAndForeignMetarIcaos).toContain(
      "LTAJ"
    );

    // Tier-B EMOS doğrulaması: interceptC === 0, donörler TR-27 / TR-63 / TR-46 ve 0–36s ALARO çengeli (0.24)
    expect(PROVINCE_CALIBRATION_TR_79.wmoStationId).toBeNull();
    expect(PROVINCE_CALIBRATION_TR_79.donorProvinces).toEqual([
      "TR-27",
      "TR-63",
      "TR-46"
    ]);
    const kilisTierB = evaluateProvinceCalibratedHour({
      leadHours: 12,
      localHour: 14,
      month: 8,
      spec: PROVINCE_SPEC_TR_79,
      bundle: PROVINCE_CALIBRATION_TR_79,
      mgmAlaroHourly: { tempC: 34.8, rhPct: 36, windSpeedKmh: 24, isWet: false },
      tempSnapshot: {
        ecmwfIfs: 36.0,
        ecmwfAifs: 35.8,
        icon: 35.6,
        ukmo: 36.2,
        meteofrance: 35.9,
        gfs: 36.4,
        gem: 35.7,
        jma: 35.5
      }
    });
    expect(kilisTierB.tier).toBe("TIER_B_DONOR_ALARO");
    expect(kilisTierB.appliedInterceptC).toBe(0);
    expect(kilisTierB.appliedDriverShiftC).toBe(0);
    expect(kilisTierB.appliedAlaroBlendWeight).toBeCloseTo(0.24, 2);

    // Canlı Cressman sınır güvenlik duvarı: 35 km ötedeki Gaziantep LTAJ / Oğuzeli istasyonu TR-79'a ASLA sızamaz!
    const kilisSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_79,
      target: {
        lat: 36.7085,
        lon: 37.1123,
        elevationM: 640,
        subBasinId: "kilis_olive_piedmont_threshold"
      },
      stations: [
        {
          stationId: 17262,
          provinceCode: "TR-79",
          name: "Kilis Merkez",
          lat: 36.7085,
          lon: 37.1123,
          elevationM: 640,
          tempC: 33.4,
          relHumidityPct: 42,
          windSpeedKmh: 22,
          windDirDeg: 245
        },
        {
          stationId: 17260,
          provinceCode: "TR-27",
          icaoId: "LTAJ",
          name: "Gaziantep Oğuzeli Havalimanı",
          lat: 36.9472,
          lon: 37.4789,
          elevationM: 701,
          tempC: 19.0
        }
      ],
      drivers: {
        localHour: 15,
        month: 7,
        isNight: false,
        cloudCoverPct: 10,
        wind10mDirDeg: 245,
        wind10mSpeedKmh: 22
      }
    })!;
    expect(kilisSurface.acceptedStationCount).toBe(1);
    expect(kilisSurface.rejectedCrossBorderCount).toBe(1);
    expect(kilisSurface.tempC).toBeCloseTo(33.4, 1);

    // Afrin / Hassa–İslahiye BGB (242°) Akdeniz esinti koridoru ve zeytinlik iklim geçişi (Urfa'dan serin yaz, Antep'ten ılıman kış!)
    expect(kilisSurface.venturiEffect.activeCorridorIds).toContain(
      "afrin_hassa_mediterranean_gap"
    );
    expect(kilisSurface.venturiEffect.speedMultiplier).toBeGreaterThan(1.2);

    const kilisJuly = computeTrDailyClimatologyNormal({
      provinceCode: "TR-79",
      lat: 36.7085,
      lon: 37.1123,
      elevationM: 640,
      dayOfYear: 196
    });
    const urfaJuly = computeTrDailyClimatologyNormal({
      provinceCode: "TR-63",
      lat: 37.1608,
      lon: 38.7863,
      elevationM: 550,
      dayOfYear: 196
    });
    const kilisJan = computeTrDailyClimatologyNormal({
      provinceCode: "TR-79",
      lat: 36.7085,
      lon: 37.1123,
      elevationM: 640,
      dayOfYear: 15
    });
    const antepJan = computeTrDailyClimatologyNormal({
      provinceCode: "TR-27",
      lat: 37.0585,
      lon: 37.351,
      elevationM: 854,
      dayOfYear: 15
    });

    expect(urfaJuly.tmaxNormalC - kilisJuly.tmaxNormalC).toBeGreaterThan(3.0);
    expect(kilisJan.tminNormalC - antepJan.tminNormalC).toBeGreaterThan(1.8);
    expect(PROVINCE_SPEC_TR_79.aridAndSevereDrivers.dustTransportSusceptibility).toBeGreaterThanOrEqual(
      0.85
    );

    // 4 ilin ulusal katalog (1102 merkez/ilçe/zirve) kapsam doğrulaması
    expect(getTrCatalogByProvince("TR-02").length).toBeGreaterThanOrEqual(11);
    expect(getTrCatalogByProvince("TR-27").length).toBeGreaterThanOrEqual(10);
    expect(getTrCatalogByProvince("TR-63").length).toBeGreaterThanOrEqual(15);
    expect(getTrCatalogByProvince("TR-79").length).toBeGreaterThanOrEqual(5);
  });
});
