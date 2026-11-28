import { describe, expect, it } from "vitest";
import { isIcaoAllowedForProvince } from "../../lib/metar-verify";
import { getTrCatalogByProvince } from "../../lib/provinces/catalog-1102";
import { computeTrDailyClimatologyNormal } from "../../lib/provinces/climatology-1991-2020";
import {
  PROVINCE_CALIBRATION_TR_21
} from "../../lib/provinces/emos-weights/tr-21";
import {
  PROVINCE_CALIBRATION_TR_47
} from "../../lib/provinces/emos-weights/tr-47";
import {
  PROVINCE_CALIBRATION_TR_72
} from "../../lib/provinces/emos-weights/tr-72";
import {
  applyDirectionalBarrierRules,
  applyVenturiCorridorRules,
  resolveProvinceTargetMetadata,
  solveProvinceTopographicSurface
} from "../../lib/provinces/engine/province-cressman";
import { evaluateProvinceCalibratedHour } from "../../lib/provinces/engine/province-mos-engine";
import {
  computeProvinceLiveVerticalProfile,
  integrateProvinceVerticalDeltaC
} from "../../lib/provinces/engine/province-vertical-profile";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import { resolveProvinceElevationBandSpecs } from "../../lib/provinces/hypsometric-bands-tr81";
import {
  MGM_DEM_ELEVATION_REPAIR_BY_ISTNO,
  MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID,
  STATIC_MGM_ISTNO_OWNER_PROVINCE
} from "../../lib/provinces/mgm-dem-repair";
import PROVINCE_SPEC_TR_21, {
  PROVINCE_SPEC_TR_21 as NAMED_TR_21,
  TR_21_BASALT_CALDERA_BASIN_CONTRACT
} from "../../lib/provinces/specs/tr-21";
import PROVINCE_SPEC_TR_47, {
  PROVINCE_SPEC_TR_47 as NAMED_TR_47,
  TR_47_ESCARPMENT_PLAIN_DICHOTOMY_CONTRACT
} from "../../lib/provinces/specs/tr-47";
import PROVINCE_SPEC_TR_72, {
  PROVINCE_SPEC_TR_72 as NAMED_TR_72,
  TR_72_ILISU_STRATUS_MERETO_WALL_CONTRACT
} from "../../lib/provinces/specs/tr-72";
import type { ProvinceSpec } from "../../lib/provinces/types";

describe("Wave 3C — REG-22 (Dicle Havzası & Mardin Eşiği: TR-21 Diyarbakır, TR-47 Mardin, TR-72 Batman)", () => {
  const ALL_SPECS: readonly ProvinceSpec[] = [
    PROVINCE_SPEC_TR_21,
    PROVINCE_SPEC_TR_47,
    PROVINCE_SPEC_TR_72
  ];

  it("1. Üç ilin tamamı şema bütünlüğünü, Object.freeze tekilliğini, topolojik poligon aidiyetini, katalog uyumunu ve MGM istasyon sahipliğini eksiksiz sağlar", () => {
    expect(PROVINCE_SPEC_TR_21).toBe(NAMED_TR_21);
    expect(PROVINCE_SPEC_TR_47).toBe(NAMED_TR_47);
    expect(PROVINCE_SPEC_TR_72).toBe(NAMED_TR_72);

    for (const spec of ALL_SPECS) {
      expect(Object.isFrozen(spec)).toBe(true);
      expect(spec.region).toBe("SOUTHEASTERN_ANATOLIA");
      expect(spec.climateRegion).toBe("GUNEYDOGU");
      expect(spec.donorCluster).toBe("SOUTHEAST_THRESHOLD_ARID");
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.curatedSubLocations.length).toBeGreaterThanOrEqual(4);
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toHaveLength(12);
      expect(spec.primaryCenter.monthlyTminNormalsC).toHaveLength(12);

      // 4-düğümlü dikey profil ve 4 kar bandı kesin artan olmalıdır
      const knots = spec.verticalProfileSpec.piecewiseKnotsM;
      expect(knots[0]).toBeLessThan(knots[1]);
      expect(knots[1]).toBeLessThan(knots[2]);
      expect(knots[2]).toBeLessThan(knots[3]);
      expect(knots[3]).toBeLessThanOrEqual(
        spec.verticalProfileSpec.maxPhysicalPeakM
      );

      const bands = spec.verticalProfileSpec.snowElevationBands;
      expect(bands).toHaveLength(4);
      expect(bands[0].elevationM).toBeLessThan(bands[1].elevationM);
      expect(bands[1].elevationM).toBeLessThan(bands[2].elevationM);
      expect(bands[2].elevationM).toBeLessThan(bands[3].elevationM);

      const hypsoResolved = resolveProvinceElevationBandSpecs({
        provinceCode: spec.provinceCode,
        referenceElevationM: spec.primaryCenter.demVerifiedElevationM,
        locationName: spec.nameTr
      });
      expect(hypsoResolved).toHaveLength(4);

      // Günlük harmonik klimatoloji enterpolasyonu çalışmalıdır
      const summerNormal = computeTrDailyClimatologyNormal({
        provinceCode: spec.provinceCode,
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon,
        elevationM: spec.primaryCenter.demVerifiedElevationM,
        dayOfYear: 201
      });
      const winterNormal = computeTrDailyClimatologyNormal({
        provinceCode: spec.provinceCode,
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon,
        elevationM: spec.primaryCenter.demVerifiedElevationM,
        dayOfYear: 15
      });
      expect(summerNormal.tmaxNormalC).toBeGreaterThan(34.0);
      expect(winterNormal.tminNormalC).toBeLessThan(2.0);

      // Ulusal 1102 katalog kaydı doğrulaması
      const catEntries = getTrCatalogByProvince(spec.provinceCode);
      expect(catEntries.length).toBeGreaterThan(5);
      const centerCat = catEntries.find((e) => e.kind === "province_center");
      expect(centerCat).toBeDefined();
      expect(centerCat!.mgmMerkezId).toBe(spec.primaryCenter.mgmMerkezId);

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

      // Birincil merkez, tüm küratörlü alt konumlar ve 9-nokta şablonu ilin kendi poligonuna düşmelidir
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

      for (const stPt of spec.stencil9Points) {
        const ptRes = resolveProvinceCode({
          lat: stPt.lat,
          lon: stPt.lon,
          admin1: spec.nameTr,
          countryCode: "TR"
        });
        expect(ptRes.provinceCode).toBe(spec.provinceCode);
      }

      // Tüm stationOverrides istasyonları MGM sahiplik tablosunda aynı ile ait olmalıdır
      for (const override of Object.values(spec.stationOverrides)) {
        expect(subIds).toContain(override.subBasinId);
        const istNo = Number(override.stationId);
        if (Number.isFinite(istNo)) {
          expect(STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo]).toBe(spec.provinceCode);
        }
      }
    }
  });

  it("2. TR-21 Diyarbakır: 674m kapalı bazalt çanağı, Karacadağ (1957m) & Güneydoğu Toroslar duvarı, yaz +46°C ters-V kuru mikroburst (0.86) ve kış kar-albedo -15..-24°C soğuma + Dicle sisi", () => {
    expect(PROVINCE_SPEC_TR_21.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_21.primaryCenter.wmoId).toBe("17280");
    expect(PROVINCE_SPEC_TR_21.primaryCenter.mgmSaatlikIstNo).toBe(17280);
    expect(PROVINCE_SPEC_TR_21.primaryCenter.demVerifiedElevationM).toBe(674);
    expect(PROVINCE_SPEC_TR_21.verticalProfileSpec.maxPhysicalPeakM).toBe(1957);
    expect(PROVINCE_SPEC_TR_21.waterBodies).toEqual([]);

    // METAR izolasyonu: yalnızca LTCC serbest; komşu LTCA, LTCS, LTCR, LTCJ, LTCU yasak
    expect(PROVINCE_SPEC_TR_21.icaoWhitelist).toEqual(["LTCC"]);
    expect(isIcaoAllowedForProvince("LTCC", "TR-21")).toBe(true);
    for (const blocked of TR_21_BASALT_CALDERA_BASIN_CONTRACT.blockedNeighborMetarIcaos) {
      expect(isIcaoAllowedForProvince(blocked, "TR-21")).toBe(false);
    }

    // DEM sıfır-rakım onarımları (Kayapınar 19375 -> 819m / 92102 -> 676m; Yenişehir 19916 -> 725m / 92104 -> 671m)
    expect(PROVINCE_SPEC_TR_21.stationOverrides["19375"]?.demElevationM).toBe(
      MGM_DEM_ELEVATION_REPAIR_BY_ISTNO[19375]
    );
    expect(PROVINCE_SPEC_TR_21.stationOverrides["19916"]?.demElevationM).toBe(
      MGM_DEM_ELEVATION_REPAIR_BY_ISTNO[19916]
    );
    expect(MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID[92102]).toBe(676);
    expect(MGM_DEM_ELEVATION_REPAIR_BY_MERKEZ_ID[92104]).toBe(671);

    // Yaz +46°C kavurucu bazalt çanağı & ters-V kuru mikroburst (0.86)
    expect(
      PROVINCE_SPEC_TR_21.aridAndSevereDrivers.invertedVDryMicroburstSusceptibility
    ).toBe(0.86);
    expect(PROVINCE_SPEC_TR_21.qcAndMosBounds.maxPlausibleTempC).toBeGreaterThanOrEqual(48);
    expect(PROVINCE_SPEC_TR_21.qcAndMosBounds.minPlausibleTempC).toBeLessThanOrEqual(-26);

    // Kış kar örtülü açık gecede (-18..-22°C bazalt çanağı vs -8°C Toros yamacı) STRONG_INVERSION & snowpackAmplified
    const winterSnowProfile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_21,
      stations: [
        {
          stationId: 18165,
          provinceCode: "TR-21",
          lat: 37.8308,
          lon: 40.6544,
          elevationM: 558,
          tempC: -21.4,
          snowDepthCm: 14
        },
        {
          stationId: 17280,
          provinceCode: "TR-21",
          lat: 37.8939,
          lon: 40.201,
          elevationM: 686,
          tempC: -18.8,
          snowDepthCm: 12
        },
        {
          stationId: 17847,
          provinceCode: "TR-21",
          lat: 38.267,
          lon: 39.766,
          elevationM: 986,
          tempC: -9.6,
          snowDepthCm: 18
        }
      ],
      isNight: true,
      cloudCoverPct: 5,
      wind10mSpeedKmh: 3,
      wind850SpeedKmh: 8,
      hasSnowpack: true
    });
    expect(winterSnowProfile.snowpackAmplified).toBe(true);
    expect(winterSnowProfile.boundaryLayerState).toBe("STRONG_INVERSION");
    expect(winterSnowProfile.lowerPoolLapseCPerKm).toBeGreaterThan(6.0);
    expect(
      PROVINCE_SPEC_TR_21.inversionAndWedgeSpec.persistentStratusLock.enabled
    ).toBe(true);

    // Güneyli (190°) Akdeniz/Mezopotamya nemli akışında Lice–Kulp Toros duvarında güçlü yamaç yağışı (>1.45x)
    const liceTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_21, {
      lat: 38.4531,
      lon: 40.6447,
      elevationM: 954,
      subBasinId: "lice_kulp_cungus_taurus_wall"
    });
    const liceUpslope = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_21,
      target: liceTarget,
      drivers: {
        localHour: 12,
        isNight: false,
        cloudCoverPct: 95,
        wind850DirDeg: 190,
        wind850SpeedKmh: 48
      }
    });
    expect(liceUpslope.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(liceUpslope.precipMultiplier).toBeGreaterThan(1.45);

    // Kuzeyli (15°) Doğu Anadolu akışında Diyarbakır çanağında Toros fön ısınması ve yağış gölgesi
    const bowlTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_21, {
      lat: 37.9094,
      lon: 40.2133,
      elevationM: 674,
      subBasinId: "diyarbakir_basalt_central_bowl"
    });
    const bowlFoehn = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_21,
      target: bowlTarget,
      drivers: {
        localHour: 14,
        isNight: false,
        cloudCoverPct: 25,
        wind850DirDeg: 15,
        wind850SpeedKmh: 62
      }
    });
    expect(bowlFoehn.activeRegime).toBe("FOEHN_LEE");
    expect(bowlFoehn.foehnTempDeltaC).toBeGreaterThan(2.0);
    expect(bowlFoehn.precipMultiplier).toBeLessThan(0.75);

    // Ergani–Maden boğazı Venturi ivmelenmesi
    const erganiVenturi = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_21.venturiCorridors,
      targetLat: 38.28,
      targetLon: 39.74,
      windDirDeg: 335,
      windSpeedKmh: 28
    });
    expect(erganiVenturi.activeCorridorIds).toContain("ergani_maden_pass_chute");
    expect(erganiVenturi.speedMultiplier).toBeGreaterThan(1.2);
    expect(erganiVenturi.suppressesNocturnalInversion).toBe(true);
  });

  it("3. TR-47 Mardin: 1040m Eski Mardin/Artuklu sırtı vs 480–523m Kızıltepe–LTCR Mezopotamya ovası kış enverziyon ikiliği, LTCR dışlaması, 0.96 Suriye toz taşınımı ve OSKL sınır kilidi", () => {
    expect(PROVINCE_SPEC_TR_47.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(PROVINCE_SPEC_TR_47.primaryCenter.wmoId).toBeUndefined();
    expect(PROVINCE_SPEC_TR_47.primaryCenter.demVerifiedElevationM).toBe(1040);
    expect(PROVINCE_SPEC_TR_47.verticalProfileSpec.maxPhysicalPeakM).toBe(1385);
    expect(PROVINCE_SPEC_TR_47.waterBodies).toEqual([]);

    // METAR izolasyonu: LTCR serbest, Suriye Kamışlı OSKL ve komşu LTCC/LTCS/LTCJ/LTCV kesin yasak!
    expect(PROVINCE_SPEC_TR_47.icaoWhitelist).toEqual(["LTCR"]);
    expect(isIcaoAllowedForProvince("LTCR", "TR-47")).toBe(true);
    expect(isIcaoAllowedForProvince("OSKL", "TR-47")).toBe(false);
    for (const blocked of TR_47_ESCARPMENT_PLAIN_DICHOTOMY_CONTRACT.blockedForeignAndNeighborIcaos) {
      expect(isIcaoAllowedForProvince(blocked, "TR-47")).toBe(false);
    }

    // Suriye çölünden doğrudan cephe toz taşınımı (0.96)
    expect(PROVINCE_SPEC_TR_47.aridAndSevereDrivers.dustTransportSusceptibility).toBe(0.96);

    // LTCR (523m), 17276, Kızıltepe (480m) ve Nusaybin (488m) merkez manşetinden kesin dışlanmıştır!
    expect(PROVINCE_SPEC_TR_47.stationOverrides.LTCR?.excludeFromCenterHeadline).toBe(true);
    expect(PROVINCE_SPEC_TR_47.stationOverrides["17276"]?.excludeFromCenterHeadline).toBe(true);
    expect(PROVINCE_SPEC_TR_47.stationOverrides["18332"]?.excludeFromCenterHeadline).toBe(true);
    expect(PROVINCE_SPEC_TR_47.stationOverrides["17948"]?.excludeFromCenterHeadline).toBe(true);
    expect(PROVINCE_SPEC_TR_47.stationOverrides["17275"]?.excludeFromCenterHeadline).toBeUndefined();

    // Kuplaj yalıtımı: 1040m Mardin sırtı <-> 480m Kızıltepe Mezopotamya ovası <= 0.18
    expect(
      PROVINCE_SPEC_TR_47.barrierCouplingMatrix.mardin_artuklu_escarpment_ridge
        .kiziltepe_nusaybin_mesopotamian_plain
    ).toBeLessThanOrEqual(0.18);

    // Kış gecesi ikiliği simülasyonu:
    // Kızıltepe (480m: -1.8°C sis/ayaz) & LTCR (523m: -0.9°C sis) enverziyon havuzunda (Z_i = 800m),
    // Mardin Merkez / Artuklu (1040m: +4.6°C) ise enverziyon üstü termal kuşakta kalır!
    const mardinWinterNightStations = [
      {
        stationId: 18332,
        provinceCode: "TR-47" as const,
        lat: 37.2058,
        lon: 40.5725,
        elevationM: 480,
        tempC: -1.8,
        relHumidityPct: 98
      },
      {
        stationId: "LTCR",
        icaoId: "LTCR",
        provinceCode: "TR-47" as const,
        lat: 37.2233,
        lon: 40.6317,
        elevationM: 523,
        tempC: -0.9,
        relHumidityPct: 97
      },
      {
        stationId: 17275,
        provinceCode: "TR-47" as const,
        lat: 37.3103,
        lon: 40.7284,
        elevationM: 1040,
        tempC: 4.6,
        relHumidityPct: 58
      }
    ];

    const mardinNightProfile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_47,
      stations: mardinWinterNightStations,
      isNight: true,
      cloudCoverPct: 10,
      wind10mSpeedKmh: 5,
      wind850SpeedKmh: 14
    });

    expect(mardinNightProfile.coldPoolTopM).toBe(800);
    expect(mardinNightProfile.lowerPoolLapseCPerKm).toBeGreaterThan(0);
    const deltaPlainToInversionTop = integrateProvinceVerticalDeltaC(
      480,
      800,
      mardinNightProfile
    );
    expect(deltaPlainToInversionTop).toBeGreaterThan(1.0);

    // 3D Cressman çözücüsü Mardin Merkez (1040m) ve Kızıltepe (480m) arasında >4.5°C termal ayrımı korur
    // ve sınır ötesi TR-21 istasyonunu reddeder!
    const withForeignLeakStation = [
      ...mardinWinterNightStations,
      {
        stationId: 18321,
        provinceCode: "TR-21" as const,
        lat: 37.7325,
        lon: 40.4111,
        elevationM: 650,
        tempC: -8.0
      }
    ];
    const ridgeSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_47,
      target: {
        lat: 37.3103,
        lon: 40.7284,
        elevationM: 1040,
        subBasinId: "mardin_artuklu_escarpment_ridge"
      },
      stations: withForeignLeakStation,
      drivers: {
        localHour: 3,
        month: 1,
        isNight: true,
        cloudCoverPct: 10,
        wind10mSpeedKmh: 5
      }
    })!;
    const plainSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_47,
      target: {
        lat: 37.2058,
        lon: 40.5725,
        elevationM: 480,
        subBasinId: "kiziltepe_nusaybin_mesopotamian_plain"
      },
      stations: withForeignLeakStation,
      drivers: {
        localHour: 3,
        month: 1,
        isNight: true,
        cloudCoverPct: 10,
        wind10mSpeedKmh: 4
      }
    })!;

    expect(ridgeSurface.rejectedCrossBorderCount).toBe(1);
    expect(ridgeSurface.tempC).toBeGreaterThan(3.8);
    expect(plainSurface.tempC).toBeLessThan(0.0);
    expect(ridgeSurface.tempC - plainSurface.tempC).toBeGreaterThan(4.5);

    // Güneyli (195°) Mezopotamya akışında Mazıdağı–Mardin kalker eşiğinde ilk-temas yamaç yağışı (1.62x tavan)
    const mazidagiTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_47, {
      lat: 37.4761,
      lon: 40.4914,
      elevationM: 1032,
      subBasinId: "mazidagi_omerli_savur_high_plateau"
    });
    const mazidagiUpslope = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_47,
      target: mazidagiTarget,
      drivers: {
        localHour: 10,
        isNight: false,
        cloudCoverPct: 95,
        wind850DirDeg: 195,
        wind850SpeedKmh: 46
      }
    });
    expect(mazidagiUpslope.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(mazidagiUpslope.precipMultiplier).toBeGreaterThan(1.35);

    // Kuzeyli (10°) plato inişinde Kızıltepe ovasında (480m) fön ısınması ve yağış gölgesi
    const kiziltepeTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_47, {
      lat: 37.2058,
      lon: 40.5725,
      elevationM: 480,
      subBasinId: "kiziltepe_nusaybin_mesopotamian_plain"
    });
    const kiziltepeFoehn = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_47,
      target: kiziltepeTarget,
      drivers: {
        localHour: 14,
        isNight: false,
        cloudCoverPct: 20,
        wind850DirDeg: 10,
        wind850SpeedKmh: 48
      }
    });
    expect(kiziltepeFoehn.activeRegime).toBe("FOEHN_LEE");
    expect(kiziltepeFoehn.foehnTempDeltaC).toBeGreaterThan(2.0);
  });

  it("4. TR-72 Batman: 540–610m Dicle/Ilısu Baraj Gölü yoğun kış sisi kilidi (daytimeSolarDampingFactor: 0.58), yaz +47°C ekstrem sıcak ve Sason–Mereto (2973m) dik duvar yalıtımı (<= 0.16)", () => {
    expect(PROVINCE_SPEC_TR_72.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_72.primaryCenter.wmoId).toBe("17282");
    expect(PROVINCE_SPEC_TR_72.primaryCenter.mgmIstNo).toBe(17282);
    expect(PROVINCE_SPEC_TR_72.primaryCenter.demVerifiedElevationM).toBe(563);
    expect(PROVINCE_SPEC_TR_72.verticalProfileSpec.maxPhysicalPeakM).toBe(2973);

    // METAR izolasyonu: yalnızca LTCJ serbest; komşu LTCC, LTCL, LTCK, LTCR, LTCV kesin yasak
    expect(PROVINCE_SPEC_TR_72.icaoWhitelist).toEqual(["LTCJ"]);
    expect(isIcaoAllowedForProvince("LTCJ", "TR-72")).toBe(true);
    for (const blocked of TR_72_ILISU_STRATUS_MERETO_WALL_CONTRACT.blockedNeighborMetarIcaos) {
      expect(isIcaoAllowedForProvince(blocked, "TR-72")).toBe(false);
    }

    // Ilısu Baraj Gölü (fresh_lake, ~525m) + çok günlük yoğun radyasyonel sis kilidi (0.58)
    expect(PROVINCE_SPEC_TR_72.waterBodies).toHaveLength(1);
    const ilisuLake = PROVINCE_SPEC_TR_72.waterBodies[0];
    expect(ilisuLake.id).toBe("ilisu_tigris_reservoir");
    expect(ilisuLake.kind).toBe("fresh_lake");
    expect(ilisuLake.useOpenMeteoMarineApi).toBe(false);
    expect(ilisuLake.mgmMarineStationIds).toEqual([]);
    expect(ilisuLake.surfaceElevationM).toBe(525);
    expect(ilisuLake.subBasinInfluenceWeights.batman_tigris_ilisu_basin).toBeGreaterThan(0.5);

    expect(
      PROVINCE_SPEC_TR_72.inversionAndWedgeSpec.persistentStratusLock
    ).toEqual({
      enabled: true,
      daytimeSolarDampingFactor: 0.58
    });

    // Yaz +47°C ekstrem sıcak tavanı (Temmuz ort. Tmax 39.6°C, QC üst sınır >= 49°C)
    expect(Math.max(...PROVINCE_SPEC_TR_72.primaryCenter.monthlyTmaxNormalsC)).toBeCloseTo(
      39.6,
      1
    );
    expect(PROVINCE_SPEC_TR_72.qcAndMosBounds.maxPlausibleTempC).toBeGreaterThanOrEqual(49);

    // Sason–Mereto Dağı (2973m) dik duvar yalıtımı: alt çanak <-> Sason/Mereto kuplajı <= 0.16!
    const basinToMereto =
      PROVINCE_SPEC_TR_72.barrierCouplingMatrix.batman_tigris_ilisu_basin
        .sason_mereto_alpine_wall;
    const meretoToBasin =
      PROVINCE_SPEC_TR_72.barrierCouplingMatrix.sason_mereto_alpine_wall
        .batman_tigris_ilisu_basin;
    const basinToKozlukSason =
      PROVINCE_SPEC_TR_72.barrierCouplingMatrix.batman_tigris_ilisu_basin
        .kozluk_sason_orographic_slope;

    expect(basinToMereto).toBeLessThanOrEqual(0.16);
    expect(meretoToBasin).toBeLessThanOrEqual(0.16);
    expect(basinToKozlukSason).toBeLessThanOrEqual(0.16);

    // Güneyli (185°) nemli siklonik akışta Sason–Mereto (2973m) duvarında şiddetli orografik yağış/kar (>1.55x)
    const sasonTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_72, {
      lat: 38.3319,
      lon: 41.42,
      elevationM: 912,
      subBasinId: "sason_mereto_alpine_wall"
    });
    const sasonUpslope = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_72,
      target: sasonTarget,
      drivers: {
        localHour: 9,
        isNight: false,
        cloudCoverPct: 100,
        wind850DirDeg: 185,
        wind850SpeedKmh: 52
      }
    });
    expect(sasonUpslope.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(sasonUpslope.precipMultiplier).toBeGreaterThan(1.55);

    // Kuzeyli (20°) Muş/Bitlis aşan akışta Batman–Kozluk çanağında güçlü fön ısınması ve yağış gölgesi
    const batmanPlainTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_72, {
      lat: 37.8636,
      lon: 41.1562,
      elevationM: 563,
      subBasinId: "batman_tigris_ilisu_basin"
    });
    const batmanFoehn = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_72,
      target: batmanPlainTarget,
      drivers: {
        localHour: 13,
        isNight: false,
        cloudCoverPct: 20,
        wind850DirDeg: 20,
        wind850SpeedKmh: 68
      }
    });
    expect(batmanFoehn.activeRegime).toBe("FOEHN_LEE");
    expect(batmanFoehn.foehnTempDeltaC).toBeGreaterThan(2.5);
    expect(batmanFoehn.precipMultiplier).toBeLessThan(0.7);
  });

  it("5. EMOS Kalibrasyon Motoru: TR-21 & TR-72 (TIER_A_WMO) ve TR-47 (TIER_B_DONOR_KALMAN sıfır-intercept + ALARO kancası) ekstrem sıcak/soğuk altında ölçek-eşdeğişken çalışır", () => {
    // TR-47 Tier-B Donor: sabit kayma (interceptC) ve günlük harmonik kalıntı kesinlikle 0.0 olmalıdır!
    const mardinCal = evaluateProvinceCalibratedHour({
      leadHours: 18,
      localHour: 15,
      month: 7,
      spec: PROVINCE_SPEC_TR_47,
      bundle: PROVINCE_CALIBRATION_TR_47,
      tempSnapshot: {
        ecmwfIfs: 38.4,
        ecmwfAifs: 38.0,
        icon: 37.8,
        ukmo: 38.6,
        meteofrance: 38.2,
        gfs: 39.0,
        gem: 38.5,
        jma: 37.9
      },
      mgmAlaroHourly: {
        tempC: 37.6,
        rhPct: 16,
        windSpeedKmh: 22,
        isWet: false
      }
    });
    expect(mardinCal.tier).toBe("TIER_B_DONOR_ALARO");
    expect(mardinCal.appliedInterceptC).toBe(0);
    expect(mardinCal.appliedDriverShiftC).toBe(0);
    expect(mardinCal.weightSum).toBeCloseTo(1.0, 6);
    expect(mardinCal.appliedAlaroBlendWeight).toBeCloseTo(0.24, 3);

    // TR-21 Diyarbakır yaz +46°C ekstrem sıcak ölçek-eşdeğişkenliği
    const diyarSummerExtreme = evaluateProvinceCalibratedHour({
      leadHours: 24,
      localHour: 15,
      month: 7,
      spec: PROVINCE_SPEC_TR_21,
      bundle: PROVINCE_CALIBRATION_TR_21,
      tempSnapshot: {
        ecmwfIfs: 45.8,
        ecmwfAifs: 45.4,
        icon: 46.1,
        ukmo: 46.4,
        meteofrance: 45.9,
        gfs: 46.5,
        gem: 46.2,
        jma: 45.5
      },
      drivers: {
        solarHeating: 1.0,
        radiativeClearNight: 0
      }
    });
    expect(diyarSummerExtreme.tier).toBe("TIER_A_EMPIRICAL_WMO");
    expect(diyarSummerExtreme.weightSum).toBeCloseTo(1.0, 6);
    expect(diyarSummerExtreme.temperatureC).toBeGreaterThan(45.0);
    expect(diyarSummerExtreme.temperatureC).toBeLessThanOrEqual(
      PROVINCE_SPEC_TR_21.qcAndMosBounds.maxPlausibleTempC
    );

    // TR-72 Batman yaz +47°C kavurucu sıcak & kış sisli gecede radyasyonel soğuma düzeltmesi
    const batmanSummerExtreme = evaluateProvinceCalibratedHour({
      leadHours: 18,
      localHour: 15,
      month: 8,
      spec: PROVINCE_SPEC_TR_72,
      bundle: PROVINCE_CALIBRATION_TR_72,
      tempSnapshot: {
        ecmwfIfs: 46.6,
        ecmwfAifs: 46.2,
        icon: 46.8,
        ukmo: 47.4,
        meteofrance: 46.9,
        gfs: 47.5,
        gem: 47.2,
        jma: 46.4
      },
      drivers: {
        solarHeating: 1.0,
        radiativeClearNight: 0
      }
    });
    expect(batmanSummerExtreme.tier).toBe("TIER_A_EMPIRICAL_WMO");
    expect(batmanSummerExtreme.weightSum).toBeCloseTo(1.0, 6);
    expect(batmanSummerExtreme.temperatureC).toBeGreaterThan(46.5);

    const batmanWinterFogNight = evaluateProvinceCalibratedHour({
      leadHours: 12,
      localHour: 4,
      month: 1,
      spec: PROVINCE_SPEC_TR_72,
      bundle: PROVINCE_CALIBRATION_TR_72,
      tempSnapshot: {
        ecmwfIfs: -4.2,
        ecmwfAifs: -3.8,
        icon: -5.1,
        ukmo: -4.8,
        meteofrance: -4.5,
        gfs: -3.9,
        gem: -5.4,
        jma: -4.0
      },
      drivers: {
        radiativeClearNight: 1.0,
        solarHeating: 0
      }
    });
    expect(batmanWinterFogNight.temperatureC).toBeLessThan(-4.5);
  });
});
