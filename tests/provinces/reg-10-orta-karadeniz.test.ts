import { describe, expect, it } from "vitest";
import { TURKEY_ICAO_WHITELIST_BY_PROVINCE } from "../../lib/metar-verify";
import { TR_NATIONAL_CATALOG } from "../../lib/provinces/catalog-1102";
import { TR81_CLIMATOLOGY_1991_2020 } from "../../lib/provinces/climatology-1991-2020";
import { PROVINCE_CALIBRATION_TR_05 } from "../../lib/provinces/emos-weights/tr-05";
import { PROVINCE_CALIBRATION_TR_19 } from "../../lib/provinces/emos-weights/tr-19";
import { PROVINCE_CALIBRATION_TR_55 } from "../../lib/provinces/emos-weights/tr-55";
import { PROVINCE_CALIBRATION_TR_57 } from "../../lib/provinces/emos-weights/tr-57";
import {
  applyDirectionalBarrierRules,
  applyVenturiCorridorRules,
  computeProvinceMicroclimateOffsetC,
  resolveProvinceTargetMetadata,
  solveProvinceTopographicSurface
} from "../../lib/provinces/engine/province-cressman";
import { computeProvinceLiveVerticalProfile } from "../../lib/provinces/engine/province-vertical-profile";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import {
  interpolateProvinceOrographicWeight,
  TR81_HYPSOMETRIC_PROFILES
} from "../../lib/provinces/hypsometric-bands-tr81";
import { STATIC_MGM_ISTNO_OWNER_PROVINCE } from "../../lib/provinces/mgm-dem-repair";
import PROVINCE_SPEC_TR_05_DEFAULT, {
  PROVINCE_SPEC_TR_05,
  TR_05_MICROCLIMATE_META
} from "../../lib/provinces/specs/tr-05";
import PROVINCE_SPEC_TR_19_DEFAULT, {
  PROVINCE_SPEC_TR_19,
  TR_19_TRANSITION_BASIN_META
} from "../../lib/provinces/specs/tr-19";
import PROVINCE_SPEC_TR_55_DEFAULT, {
  PROVINCE_SPEC_TR_55,
  TR_55_DELTA_CANIK_META
} from "../../lib/provinces/specs/tr-55";
import PROVINCE_SPEC_TR_57_DEFAULT, {
  PROVINCE_SPEC_TR_57,
  TR_57_PENINSULA_SHADOW_META
} from "../../lib/provinces/specs/tr-57";
import type { ProvinceSpec, TrProvinceCode } from "../../lib/provinces/types";

const REG_10_SPECS: readonly ProvinceSpec[] = [
  PROVINCE_SPEC_TR_05,
  PROVINCE_SPEC_TR_19,
  PROVINCE_SPEC_TR_55,
  PROVINCE_SPEC_TR_57
];

function collectAllSpecMgmIds(spec: ProvinceSpec): number[] {
  const ids = new Set<number>([
    spec.primaryCenter.mgmIstNo,
    spec.primaryCenter.mgmSaatlikIstNo
  ]);
  for (const key of Object.keys(spec.stationOverrides)) {
    const n = Number(key);
    if (Number.isFinite(n)) ids.add(n);
    const sid = Number(spec.stationOverrides[key].stationId);
    if (Number.isFinite(sid)) ids.add(sid);
  }
  for (const wb of spec.waterBodies) {
    for (const mId of wb.mgmMarineStationIds) {
      ids.add(mId);
    }
  }
  return [...ids];
}

describe("Wave 3B REG-10: Central Black Sea & Yesilirmak/Kizilirmak Inland Transition (TR-05, TR-19, TR-55, TR-57)", () => {
  it("exports frozen Tier-A WMO ProvinceSpec contracts aligned with EMOS bundles, ICAO whitelists, 4-band hypsometry, and ADM1 polygons", () => {
    expect(PROVINCE_SPEC_TR_05_DEFAULT).toBe(PROVINCE_SPEC_TR_05);
    expect(PROVINCE_SPEC_TR_19_DEFAULT).toBe(PROVINCE_SPEC_TR_19);
    expect(PROVINCE_SPEC_TR_55_DEFAULT).toBe(PROVINCE_SPEC_TR_55);
    expect(PROVINCE_SPEC_TR_57_DEFAULT).toBe(PROVINCE_SPEC_TR_57);

    expect(PROVINCE_SPEC_TR_05.primaryCenter.wmoId).toBe(PROVINCE_CALIBRATION_TR_05.wmoStationId);
    expect(PROVINCE_SPEC_TR_19.primaryCenter.wmoId).toBe(PROVINCE_CALIBRATION_TR_19.wmoStationId);
    expect(PROVINCE_SPEC_TR_55.primaryCenter.wmoId).toBe(PROVINCE_CALIBRATION_TR_55.wmoStationId);
    expect(PROVINCE_SPEC_TR_57.primaryCenter.wmoId).toBe(PROVINCE_CALIBRATION_TR_57.wmoStationId);

    for (const spec of REG_10_SPECS) {
      expect(Object.isFrozen(spec)).toBe(true);
      expect(spec.region).toBe("BLACK_SEA_WEST_CENTRAL");
      expect(spec.climateRegion).toBe("KARADENIZ");
      expect(spec.calibrationTier).toBe("TIER_A_WMO");
      expect(spec.icaoWhitelist).toEqual(TURKEY_ICAO_WHITELIST_BY_PROVINCE[spec.provinceCode]);
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.curatedSubLocations).toHaveLength(4);
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toEqual(
        TR81_CLIMATOLOGY_1991_2020[spec.provinceCode].tmaxC
      );
      expect(spec.primaryCenter.monthlyTminNormalsC).toEqual(
        TR81_CLIMATOLOGY_1991_2020[spec.provinceCode].tminC
      );

      const knots = spec.verticalProfileSpec.piecewiseKnotsM;
      expect(knots[0]).toBeLessThan(knots[1]);
      expect(knots[1]).toBeLessThan(knots[2]);
      expect(knots[2]).toBeLessThan(knots[3]);
      expect(knots[3]).toBeLessThanOrEqual(spec.verticalProfileSpec.maxPhysicalPeakM);

      const subIds = spec.subBasins.map((sb) => sb.id);
      expect(subIds).toContain(spec.primaryCenter.subBasinId);

      for (const a of subIds) {
        expect(spec.barrierCouplingMatrix[a]?.[a]).toBe(1.0);
        for (const b of subIds) {
          const ab = spec.barrierCouplingMatrix[a]?.[b];
          const ba = spec.barrierCouplingMatrix[b]?.[a];
          expect(ab).toBeGreaterThan(0);
          expect(ab).toBeLessThanOrEqual(1.0);
          expect(ab).toBeCloseTo(ba, 6);
        }
      }

      for (const ov of Object.values(spec.stationOverrides)) {
        expect(subIds).toContain(ov.subBasinId);
      }

      for (const loc of spec.curatedSubLocations) {
        const resolved = resolveProvinceCode({
          lat: loc.lat,
          lon: loc.lon,
          admin1: spec.nameTr,
          countryCode: "TR"
        });
        expect(
          resolved.provinceCode,
          `Sub-location ${loc.id} resolved to ${resolved.provinceCode} instead of ${spec.provinceCode}`
        ).toBe(spec.provinceCode);
      }
    }
  });

  it("TR-05 Amasya: models Yesilirmak (~412 m) Canik-lee Foehn fruit canyon, decouples windy/frosty Merzifon LTAP plain, and enforces Akdag (2062 m) snow belt", () => {
    expect(PROVINCE_SPEC_TR_05.icaoWhitelist).toEqual(["LTAP"]);
    expect(PROVINCE_SPEC_TR_05.primaryCenter.wmoId).toBe("17082");
    expect(PROVINCE_SPEC_TR_05.primaryCenter.mgmIstNo).toBe(17085);
    expect(PROVINCE_SPEC_TR_05.verticalProfileSpec.maxPhysicalPeakM).toBe(2062);
    expect(TR_05_MICROCLIMATE_META.akdagPeakElevationM).toBe(2062);

    // Merzifon LTAP / WMO 17082 is decoupled from sheltered Amasya Harşena canyon headline
    expect(PROVINCE_SPEC_TR_05.stationOverrides["17082"].subBasinId).toBe("merzifon_suluova_open_plain");
    expect(PROVINCE_SPEC_TR_05.stationOverrides["17082"].excludeFromCenterHeadline).toBe(true);
    expect(PROVINCE_SPEC_TR_05.stationOverrides.LTAP.excludeFromCenterHeadline).toBe(true);
    expect(PROVINCE_SPEC_TR_05.stationOverrides["17082"].coldPoolSusceptibility).toBeGreaterThan(
      PROVINCE_SPEC_TR_05.stationOverrides["17085"].coldPoolSusceptibility
    );
    expect(
      PROVINCE_SPEC_TR_05.barrierCouplingMatrix.yesilirmak_harsena_canyon.merzifon_suluova_open_plain
    ).toBeLessThan(0.5);

    // Canik lee northerly flow warms the sheltered Yeşilırmak orchard canyon (~412 m)
    const amasyaCanyonTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_05, {
      lat: 40.6668,
      lon: 35.8353,
      elevationM: 412,
      subBasinId: "yesilirmak_harsena_canyon"
    });
    const canikLeeFoehn = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_05,
      target: amasyaCanyonTarget,
      drivers: {
        localHour: 14,
        month: 2,
        isNight: false,
        cloudCoverPct: 35,
        wind850DirDeg: 10,
        wind850SpeedKmh: 48
      }
    });
    expect(canikLeeFoehn.activeRegime).toBe("FOEHN_LEE");
    expect(canikLeeFoehn.foehnTempDeltaC).toBeGreaterThan(1.2);

    // Merzifon (LTAP) – Suluova open plain experiences Karayel/Poyraz Venturi acceleration
    const merzifonVenturi = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_05.venturiCorridors,
      targetLat: 40.824,
      targetLon: 35.5086,
      windDirDeg: 345,
      windSpeedKmh: 30
    });
    expect(merzifonVenturi.activeCorridorIds).toContain("merzifon_suluova_wind_corridor");
    expect(merzifonVenturi.speedMultiplier).toBeGreaterThan(1.2);
    expect(merzifonVenturi.suppressesNocturnalInversion).toBe(true);

    // Akdağ (2062 m) northerly upslope snow wall enhancement
    const akdagSummitTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_05, {
      lat: 40.7684,
      lon: 35.8953,
      elevationM: 1850,
      subBasinId: "akdag_tavsandagi_alpine"
    });
    const akdagUpslope = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_05,
      target: akdagSummitTarget,
      drivers: {
        localHour: 4,
        month: 1,
        isNight: true,
        cloudCoverPct: 95,
        wind850DirDeg: 355,
        wind850SpeedKmh: 46
      }
    });
    expect(akdagUpslope.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(akdagUpslope.precipMultiplier).toBeGreaterThan(1.4);

    // Clear nocturnal cold-basin unbiasing ensures LTAP frost does not drag Amasya canyon down
    const canyonSolved = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_05,
      target: {
        lat: 40.6668,
        lon: 35.8353,
        elevationM: 412,
        subBasinId: "yesilirmak_harsena_canyon",
        urbanFraction: 0.64
      },
      stations: [
        {
          stationId: 17085,
          provinceCode: "TR-05",
          name: "Amasya Merkez",
          lat: 40.6668,
          lon: 35.8353,
          elevationM: 409,
          tempC: 4.8,
          relHumidityPct: 72,
          windSpeedKmh: 4
        },
        {
          stationId: "LTAP",
          icaoId: "LTAP",
          provinceCode: "TR-05",
          name: "Merzifon LTAP",
          lat: 40.824,
          lon: 35.5086,
          elevationM: 535,
          tempC: -3.6,
          relHumidityPct: 88,
          windSpeedKmh: 6
        }
      ],
      drivers: {
        localHour: 4,
        month: 1,
        isNight: true,
        cloudCoverPct: 10,
        wind10mSpeedKmh: 4
      }
    });
    expect(canyonSolved).not.toBeNull();
    expect(canyonSolved!.tempC).toBeGreaterThan(3.8);
  });

  it("TR-19 Corum: enforces empty ICAO whitelist, contrasts Osmancik-Kargi Kizilirmak (~419 m) rice valley vs Corum-Alaca-Sungurlu stratus/frost basin, and models Kosedagi (2097 m)", () => {
    expect(PROVINCE_SPEC_TR_19.icaoWhitelist).toEqual([]);
    expect(PROVINCE_SPEC_TR_19.primaryCenter.wmoId).toBe("17084");
    expect(PROVINCE_SPEC_TR_19.primaryCenter.demVerifiedElevationM).toBe(776);
    expect(PROVINCE_SPEC_TR_19.verticalProfileSpec.maxPhysicalPeakM).toBe(2097);
    expect(TR_19_TRANSITION_BASIN_META.kizilirmakRiceValleyFloorM).toBe(419);

    // Persistent stratus lock & deep radiative frost hollow across Çorum–Alaca–Sungurlu steppe
    expect(PROVINCE_SPEC_TR_19.inversionAndWedgeSpec.persistentStratusLock.enabled).toBe(true);
    expect(
      PROVINCE_SPEC_TR_19.inversionAndWedgeSpec.persistentStratusLock.daytimeSolarDampingFactor
    ).toBeLessThanOrEqual(0.65);
    expect(PROVINCE_SPEC_TR_19.inversionAndWedgeSpec.topographicEnclosureIndex).toBeGreaterThanOrEqual(0.8);

    // Osmancık–Kargı Kızılırmak rice trench (~419–446 m) has far lower cold-pool susceptibility than Alaca/Çorum steppe
    const osmancikOv = PROVINCE_SPEC_TR_19.stationOverrides["17652"];
    const kargiOv = PROVINCE_SPEC_TR_19.stationOverrides["18510"];
    const alacaOv = PROVINCE_SPEC_TR_19.stationOverrides["18124"];
    const corumOv = PROVINCE_SPEC_TR_19.stationOverrides["17084"];
    expect(osmancikOv.demElevationM).toBe(419);
    expect(kargiOv.demElevationM).toBe(446);
    expect(alacaOv.coldPoolSusceptibility - osmancikOv.coldPoolSusceptibility).toBeGreaterThan(0.45);
    expect(corumOv.coldPoolSusceptibility - kargiOv.coldPoolSusceptibility).toBeGreaterThan(0.4);
    expect(
      PROVINCE_SPEC_TR_19.barrierCouplingMatrix.corum_alaca_sungurlu_frost_steppe
        .osmancik_kargi_kizilirmak_trench
    ).toBeLessThan(0.35);

    // Clear snow-covered winter night produces strong radiative inversion in Çorum basin
    const profile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_19,
      stations: [
        {
          stationId: 17084,
          provinceCode: "TR-19",
          lat: 40.546,
          lon: 34.9363,
          elevationM: 776,
          tempC: -11.5
        },
        {
          stationId: 18508,
          provinceCode: "TR-19",
          lat: 40.0242,
          lon: 34.6065,
          elevationM: 998,
          tempC: -6.8
        },
        {
          stationId: 18700,
          provinceCode: "TR-19",
          lat: 41.1974,
          lon: 34.6391,
          elevationM: 1530,
          tempC: -8.2
        }
      ],
      isNight: true,
      cloudCoverPct: 8,
      wind10mSpeedKmh: 3,
      hasSnowpack: true
    });
    expect(["STRONG_INVERSION", "SHALLOW_INVERSION"]).toContain(profile.boundaryLayerState);
    expect(profile.inversionStrengthC).toBeGreaterThan(1.5);
    expect(profile.lowerPoolLapseCPerKm).toBeGreaterThan(2.0);
    expect(profile.snowpackAmplified).toBe(true);

    // Köse Dağı / Kargı Akkaya highlands (2097 m) vs Kızılırmak trench Foehn
    const osmancikTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_19, {
      lat: 40.9792,
      lon: 34.8008,
      elevationM: 419,
      subBasinId: "osmancik_kargi_kizilirmak_trench"
    });
    const trenchFoehn = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_19,
      target: osmancikTarget,
      drivers: {
        localHour: 13,
        month: 3,
        isNight: false,
        cloudCoverPct: 30,
        wind850DirDeg: 5,
        wind850SpeedKmh: 58
      }
    });
    expect(trenchFoehn.activeRegime).toBe("FOEHN_LEE");
    expect(trenchFoehn.foehnTempDeltaC).toBeGreaterThan(1.2);
  });

  it("TR-55 Samsun: models Bafra/Carsamba deltas (LTFH fog/cold-pool), moderate Canik upslope rain, strong winter +20°C Canik southerly Foehn, Black Sea DEK, and Ladik Akdag (~1900 m) snow basin", () => {
    expect(PROVINCE_SPEC_TR_55.icaoWhitelist).toEqual(["LTFH"]);
    expect(PROVINCE_SPEC_TR_55.primaryCenter.wmoId).toBe("17030");
    expect(TR_55_DELTA_CANIK_META.moderateCanikUpslopeCap).toBe(1.38);
    expect(TR_55_DELTA_CANIK_META.canikSoutherlyFoehnCapC).toBeGreaterThanOrEqual(5.0);

    // Open Black Sea DEK corridor with 460 km fetch
    const blackSea = PROVINCE_SPEC_TR_55.waterBodies[0];
    expect(blackSea.kind).toBe("open_sea");
    expect(blackSea.effectiveFetchKm).toBe(460);
    expect(blackSea.dekWatchDeltaTC).toBe(11.0);
    expect(blackSea.dekHeavyDeltaTC).toBe(13.5);

    // Çarşamba LTFH alluvial delta has elevated radiative fog/cold-pool susceptibility compared to urban Atakum/İlkadım coast
    expect(PROVINCE_SPEC_TR_55.stationOverrides.LTFH.subBasinId).toBe(
      "bafra_carsamba_alluvial_deltas"
    );
    expect(PROVINCE_SPEC_TR_55.stationOverrides.LTFH.coldPoolSusceptibility).toBeGreaterThan(0.55);
    expect(PROVINCE_SPEC_TR_55.stationOverrides["17030"].coldPoolSusceptibility).toBeLessThan(0.2);

    // Moderate coastal upslope precipitation on Samsun delta/coast (lower Canik wall than Eastern Black Sea)
    const samsunCoastTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_55, {
      lat: 41.3441,
      lon: 36.2564,
      elevationM: 4,
      subBasinId: "samsun_coastal_core"
    });
    const canikUpslope = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_55,
      target: samsunCoastTarget,
      drivers: {
        localHour: 9,
        month: 12,
        isNight: false,
        cloudCoverPct: 95,
        wind850DirDeg: 10,
        wind850SpeedKmh: 45
      }
    });
    expect(canikUpslope.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(canikUpslope.precipMultiplier).toBeGreaterThan(1.1);
    expect(canikUpslope.precipMultiplier).toBeLessThanOrEqual(1.38);

    // Strong southerly Canik Foehn produces winter +20°C surge potential on Samsun coast
    const canikSoutherlyFoehn = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_55,
      target: samsunCoastTarget,
      drivers: {
        localHour: 14,
        month: 1,
        isNight: false,
        cloudCoverPct: 25,
        wind850DirDeg: 195,
        wind850SpeedKmh: 62
      }
    });
    expect(canikSoutherlyFoehn.activeRegime).toBe("FOEHN_LEE");
    expect(canikSoutherlyFoehn.foehnTempDeltaC).toBeGreaterThan(2.5);
    expect(16.5 + canikSoutherlyFoehn.foehnTempDeltaC).toBeGreaterThan(19.0);

    // Ladik Akdağ (~1900 m) inland snow basin receives substantially stronger orographic snow weighting
    const ladikAkdagTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_55, {
      lat: 40.8753,
      lon: 35.9075,
      elevationM: 1850,
      subBasinId: "ladik_akdag_snow_basin"
    });
    const ladikSnowWall = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_55,
      target: ladikAkdagTarget,
      drivers: {
        localHour: 2,
        month: 1,
        isNight: true,
        cloudCoverPct: 100,
        wind850DirDeg: 350,
        wind850SpeedKmh: 50
      }
    });
    expect(ladikSnowWall.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(ladikSnowWall.precipMultiplier).toBeGreaterThan(canikUpslope.precipMultiplier);

    const wDelta = interpolateProvinceOrographicWeight(TR81_HYPSOMETRIC_PROFILES["TR-55"], 7);
    const wAkdag = interpolateProvinceOrographicWeight(TR81_HYPSOMETRIC_PROFILES["TR-55"], 1850);
    expect(wAkdag - wDelta).toBeGreaterThan(0.5);
  });

  it("TR-57 Sinop: models Inceburun/Boztepe peninsula_exposed thermal inertia, Karayel/Yildiz Venturi, 520 km DEK fetch, and Boyabat-Duragan Gokirmak rain shadow", () => {
    expect(PROVINCE_SPEC_TR_57.icaoWhitelist).toEqual(["LTCM"]);
    expect(PROVINCE_SPEC_TR_57.primaryCenter.wmoId).toBe("17026");
    expect(TR_57_PENINSULA_SHADOW_META.blackSeaOpenFetchKm).toBe(520);
    expect(TR_57_PENINSULA_SHADOW_META.gokirmakRainShadowFactor).toBe(0.54);

    // Peninsula exposed zone & high maritime thermal inertia (ultra-low cold-pool susceptibility)
    const peninsulaBasin = PROVINCE_SPEC_TR_57.subBasins.find(
      (sb) => sb.id === "inceburun_boztepe_peninsula"
    );
    expect(peninsulaBasin?.defaultZone).toBe("peninsula_exposed");
    expect(PROVINCE_SPEC_TR_57.stationOverrides["17026"].coldPoolSusceptibility).toBeLessThanOrEqual(0.08);
    expect(PROVINCE_SPEC_TR_57.stationOverrides["17456"].coldPoolSusceptibility).toBeLessThanOrEqual(0.06);
    expect(PROVINCE_SPEC_TR_57.waterBodies[0].effectiveFetchKm).toBe(520);
    expect(
      PROVINCE_SPEC_TR_57.waterBodies[0].subBasinInfluenceWeights.inceburun_boztepe_peninsula
    ).toBeGreaterThanOrEqual(0.95);
    expect(
      PROVINCE_SPEC_TR_57.waterBodies[0].subBasinInfluenceWeights.boyabat_duragan_gokirmak_shadow
    ).toBeLessThanOrEqual(0.12);

    // Winter night marine thermal moderation warms the exposed Boztepe cape relative to cold air mass
    const boztepeTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_57, {
      lat: 42.0299,
      lon: 35.1545,
      elevationM: 32,
      subBasinId: "inceburun_boztepe_peninsula",
      zone: "peninsula_exposed",
      isCoastal: true,
      coastalDistanceKm: 0.6
    });
    const marineInertia = computeProvinceMicroclimateOffsetC({
      spec: PROVINCE_SPEC_TR_57,
      target: boztepeTarget,
      drivers: {
        localHour: 3,
        month: 1,
        isNight: true,
        cloudCoverPct: 80,
        wind10mDirDeg: 335,
        wind10mSpeedKmh: 34,
        liveWaterTempsByIdC: { central_black_sea_sinop_cape: 9.4 }
      },
      ambientTempC: -1.5
    });
    expect(marineInertia.marineThermalModerationC).toBeGreaterThan(0.8);

    // İnceburun / Boztepe Karayel–Yıldız cape Venturi acceleration
    const capeVenturi = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_57.venturiCorridors,
      targetLat: 42.0209,
      targetLon: 35.079,
      windDirDeg: 330,
      windSpeedKmh: 36
    });
    expect(capeVenturi.activeCorridorIds).toContain("inceburun_boztepe_karayel_yildiz_venturi");
    expect(capeVenturi.speedMultiplier).toBeGreaterThan(1.28);
    expect(capeVenturi.gustMultiplier).toBeGreaterThan(1.4);

    // Boyabat–Durağan Gökırmak valley sits in strong Küre/Dranaz lee rain shadow under northerly Black Sea flow
    const boyabatTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_57, {
      lat: 41.463,
      lon: 34.7853,
      elevationM: 350,
      subBasinId: "boyabat_duragan_gokirmak_shadow"
    });
    const moderateNorthShadow = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_57,
      target: boyabatTarget,
      drivers: {
        localHour: 11,
        month: 11,
        isNight: false,
        cloudCoverPct: 85,
        wind850DirDeg: 350,
        wind850SpeedKmh: 22 // ~6.1 m/s (< 7.5 m/s Foehn threshold -> pure RAIN_SHADOW)
      }
    });
    expect(moderateNorthShadow.activeRegime).toBe("RAIN_SHADOW");
    expect(moderateNorthShadow.precipMultiplier).toBeLessThan(0.85);

    // Compare windward Ayancık coastal upslope vs Boyabat Gökırmak shadow under identical northerly gale
    const ayancikTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_57, {
      lat: 41.9243,
      lon: 34.5807,
      elevationM: 40,
      subBasinId: "ayancik_turkeli_windward_coast"
    });
    const ayancikWindward = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_57,
      target: ayancikTarget,
      drivers: {
        localHour: 11,
        month: 12,
        isNight: false,
        cloudCoverPct: 95,
        wind850DirDeg: 350,
        wind850SpeedKmh: 48
      }
    });
    const boyabatGaleLee = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_57,
      target: boyabatTarget,
      drivers: {
        localHour: 11,
        month: 12,
        isNight: false,
        cloudCoverPct: 75,
        wind850DirDeg: 350,
        wind850SpeedKmh: 52
      }
    });
    expect(ayancikWindward.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(ayancikWindward.precipMultiplier).toBeGreaterThan(1.45);
    expect(boyabatGaleLee.precipMultiplier).toBeLessThan(0.8);
  });

  it("enforces 100% station ownership parity, cross-border Cressman firewall, and 0.00% leakage with TR-16 Bursa or neighbors", () => {
    const bursaStationIds = new Set<number>();
    for (const [istStr, owner] of Object.entries(STATIC_MGM_ISTNO_OWNER_PROVINCE)) {
      if (owner === "TR-16") {
        bursaStationIds.add(Number(istStr));
      }
    }
    for (const entry of TR_NATIONAL_CATALOG) {
      if (entry.provinceCode === "TR-16" && entry.mgmSondurumIstNo) {
        bursaStationIds.add(entry.mgmSondurumIstNo);
      }
    }
    expect(bursaStationIds.size).toBeGreaterThanOrEqual(25);

    const seenByProvince = new Map<TrProvinceCode, Set<number>>();
    for (const spec of REG_10_SPECS) {
      expect(spec.icaoWhitelist).not.toContain("LTBR");

      const ids = collectAllSpecMgmIds(spec);
      expect(ids.length).toBeGreaterThanOrEqual(9);

      for (const istNo of ids) {
        expect(
          bursaStationIds.has(istNo),
          `Station ${istNo} in ${spec.provinceCode} illegally intersects TR-16 Bursa!`
        ).toBe(false);

        expect(
          STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo],
          `Station ${istNo} in ${spec.provinceCode} is owned by ${STATIC_MGM_ISTNO_OWNER_PROVINCE[istNo]}`
        ).toBe(spec.provinceCode);

        for (const [otherProv, otherSet] of seenByProvince.entries()) {
          expect(
            otherSet.has(istNo),
            `Station ${istNo} shared between ${spec.provinceCode} and ${otherProv}`
          ).toBe(false);
        }
      }

      seenByProvince.set(spec.provinceCode, new Set(ids));
    }

    // Verify Cressman firewall blocks Samsun (TR-55) & Amasya (TR-05) & Bursa (TR-16) observations when solving Çorum (TR-19)
    const corumSolved = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_19,
      target: { lat: 40.5461, lon: 34.9362, elevationM: 776 },
      stations: [
        {
          stationId: 17084,
          provinceCode: "TR-19",
          name: "Çorum Merkez",
          lat: 40.546,
          lon: 34.9363,
          elevationM: 776,
          tempC: -4.2,
          relHumidityPct: 86,
          windSpeedKmh: 5
        },
        {
          stationId: "LTAP",
          icaoId: "LTAP",
          provinceCode: "TR-05",
          name: "Amasya Merzifon LTAP (MUST REJECT)",
          lat: 40.824,
          lon: 35.5086,
          elevationM: 535,
          tempC: 8.5
        },
        {
          stationId: "LTFH",
          icaoId: "LTFH",
          provinceCode: "TR-55",
          name: "Samsun LTFH (MUST REJECT)",
          lat: 41.2631,
          lon: 36.5587,
          elevationM: 7,
          tempC: 15.0
        },
        {
          stationId: 17116,
          provinceCode: "TR-16",
          name: "Bursa Merkez (MUST REJECT)",
          lat: 40.2308,
          lon: 29.0133,
          elevationM: 100,
          tempC: 19.0
        }
      ],
      drivers: {
        localHour: 6,
        month: 1,
        isNight: true,
        cloudCoverPct: 95,
        wind10mSpeedKmh: 5
      }
    });
    expect(corumSolved).not.toBeNull();
    expect(corumSolved!.acceptedStationCount).toBe(1);
    expect(corumSolved!.rejectedCrossBorderCount).toBe(3);
    expect(corumSolved!.tempC).toBeCloseTo(-4.2, 1);
  });
});
