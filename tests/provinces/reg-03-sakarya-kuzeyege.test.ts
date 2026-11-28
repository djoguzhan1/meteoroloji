import { describe, expect, it } from "vitest";
import {
  applyDirectionalBarrierRules,
  applyVenturiCorridorRules,
  computeProvinceMicroclimateOffsetC,
  resolveProvinceTargetMetadata,
  solveProvinceTopographicSurface
} from "../../lib/provinces/engine/province-cressman";
import {
  computeProvinceLiveVerticalProfile,
  type ProvinceLiveStationObs
} from "../../lib/provinces/engine/province-vertical-profile";
import { resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import PROVINCE_SPEC_TR_11_DEFAULT, {
  PROVINCE_SPEC_TR_11
} from "../../lib/provinces/specs/tr-11";
import PROVINCE_SPEC_TR_35_DEFAULT, {
  PROVINCE_SPEC_TR_35
} from "../../lib/provinces/specs/tr-35";
import PROVINCE_SPEC_TR_45_DEFAULT, {
  PROVINCE_SPEC_TR_45
} from "../../lib/provinces/specs/tr-45";
import PROVINCE_SPEC_TR_54_DEFAULT, {
  PROVINCE_SPEC_TR_54
} from "../../lib/provinces/specs/tr-54";
import type { ProvinceSpec } from "../../lib/provinces/types";

const REG_03_SPECS: readonly ProvinceSpec[] = [
  PROVINCE_SPEC_TR_11,
  PROVINCE_SPEC_TR_35,
  PROVINCE_SPEC_TR_45,
  PROVINCE_SPEC_TR_54
];

describe("Wave 3A — REG-03 (TR-11 Bilecik, TR-35 İzmir, TR-45 Manisa, TR-54 Sakarya)", () => {
  it("validates structural invariants, default exports, symmetric barrier matrices, 9-point stencils, and ADM1 polygon lock across all 4 specs", () => {
    expect(PROVINCE_SPEC_TR_11_DEFAULT).toBe(PROVINCE_SPEC_TR_11);
    expect(PROVINCE_SPEC_TR_35_DEFAULT).toBe(PROVINCE_SPEC_TR_35);
    expect(PROVINCE_SPEC_TR_45_DEFAULT).toBe(PROVINCE_SPEC_TR_45);
    expect(PROVINCE_SPEC_TR_54_DEFAULT).toBe(PROVINCE_SPEC_TR_54);

    for (const spec of REG_03_SPECS) {
      expect(Object.isFrozen(spec)).toBe(true);
      expect(spec.stencil9Points).toHaveLength(9);
      expect(spec.curatedSubLocations.length).toBeGreaterThanOrEqual(4);

      const knots = spec.verticalProfileSpec.piecewiseKnotsM;
      expect(knots[0]).toBeLessThan(knots[1]);
      expect(knots[1]).toBeLessThan(knots[2]);
      expect(knots[2]).toBeLessThan(knots[3]);
      expect(knots[3]).toBeLessThanOrEqual(spec.verticalProfileSpec.maxPhysicalPeakM);

      const subBasinIds = new Set(spec.subBasins.map((sb) => sb.id));
      expect(subBasinIds.has(spec.primaryCenter.subBasinId)).toBe(true);

      // Symmetric barrier coupling matrix with 1.0 diagonal
      for (const idA of subBasinIds) {
        expect(spec.barrierCouplingMatrix[idA]?.[idA]).toBe(1.0);
        for (const idB of subBasinIds) {
          const wAB = spec.barrierCouplingMatrix[idA]?.[idB];
          const wBA = spec.barrierCouplingMatrix[idB]?.[idA];
          expect(typeof wAB).toBe("number");
          expect(wAB).toBeGreaterThan(0);
          expect(wAB).toBeLessThanOrEqual(1.0);
          expect(wAB).toBeCloseTo(wBA ?? -1, 6);
        }
      }

      // Every stationOverride references a valid sub-basin
      for (const ov of Object.values(spec.stationOverrides)) {
        expect(subBasinIds.has(ov.subBasinId)).toBe(true);
      }

      // Primary center & terrestrial stencil points must resolve strictly to spec.provinceCode
      const primaryGeo = resolveProvinceCode({
        lat: spec.primaryCenter.lat,
        lon: spec.primaryCenter.lon,
        admin1: spec.nameTr,
        countryCode: "TR"
      });
      expect(primaryGeo.provinceCode).toBe(spec.provinceCode);

      for (const pt of spec.stencil9Points) {
        if (pt.role === "marine_upwind") continue;
        const geo = resolveProvinceCode({
          lat: pt.lat,
          lon: pt.lon,
          admin1: spec.nameTr,
          countryCode: "TR"
        });
        expect(geo.provinceCode).toBe(spec.provinceCode);
      }
    }
  });

  it("captures İzmir (TR-35) afternoon İmbat cooling + LTBJ Cumaovası cold-basin decoupling vs Manisa (TR-45) Spil-sheltered Gediz summer heat & winter inversion", () => {
    // 1. Metadata & calibration contracts
    expect(PROVINCE_SPEC_TR_35.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_35.primaryCenter.wmoId).toBe("17220");
    expect(PROVINCE_SPEC_TR_35.icaoWhitelist).toEqual(["LTBJ"]);

    expect(PROVINCE_SPEC_TR_45.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(PROVINCE_SPEC_TR_45.primaryCenter.wmoId).toBeUndefined();
    expect(PROVINCE_SPEC_TR_45.icaoWhitelist).toEqual([]);
    expect(PROVINCE_SPEC_TR_45.waterBodies).toHaveLength(0);
    expect(PROVINCE_SPEC_TR_45.inversionAndWedgeSpec.basinFloorElevationM).toBe(71);
    expect(PROVINCE_SPEC_TR_45.qcAndMosBounds.maxPlausibleTempC).toBe(48);

    // 2. Summer July 15:00 afternoon WNW (295°) İmbat sea breeze comparison: Konak vs Ödemiş vs Manisa Gediz
    const konakTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_35, {
      lat: 38.4292,
      lon: 27.1317,
      elevationM: 5,
      subBasinId: "TR35_INNER_BAY_URBAN_CORE"
    });
    const odemisTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_35, {
      lat: 38.2157,
      lon: 27.9642,
      elevationM: 111,
      subBasinId: "TR35_KUCUK_MENDERES_BAKIRCA_VALLEY"
    });
    const manisaTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_45, {
      lat: 38.6153,
      lon: 27.4049,
      elevationM: 71,
      subBasinId: "TR45_GEDIZ_GRABEN_FLOOR"
    });

    const imbatDrivers = {
      localHour: 15,
      month: 7,
      isNight: false,
      cloudCoverPct: 5,
      wind10mDirDeg: 295, // Classic WNW İzmir Körfezi İmbat!
      wind10mSpeedKmh: 20,
      liveWaterTempsByIdC: { TR35_IZMIR_GULF_AEGEAN: 24.5 }
    };

    const konakMicro = computeProvinceMicroclimateOffsetC({
      spec: PROVINCE_SPEC_TR_35,
      target: konakTarget,
      drivers: imbatDrivers,
      ambientTempC: 35.5
    });
    const odemisMicro = computeProvinceMicroclimateOffsetC({
      spec: PROVINCE_SPEC_TR_35,
      target: odemisTarget,
      drivers: imbatDrivers,
      ambientTempC: 38.0
    });
    const manisaMicro = computeProvinceMicroclimateOffsetC({
      spec: PROVINCE_SPEC_TR_45,
      target: manisaTarget,
      drivers: imbatDrivers,
      ambientTempC: 38.5
    });

    // Konak receives strong İmbat cooling; Ödemiş (>70 km inland) decays to ~0; Manisa behind Spil gets strictly 0!
    expect(konakMicro.seaBreezeOffsetC).toBeLessThan(-2.5);
    expect(Math.abs(odemisMicro.seaBreezeOffsetC)).toBeLessThan(0.05);
    expect(manisaMicro.seaBreezeOffsetC).toBe(0);

    // Extreme 47.4°C Gediz heatwave observation is accepted in Manisa (maxPlausibleTempC: 48)
    const manisaExtremeHeatSurface = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_45,
      target: {
        lat: 38.6153,
        lon: 27.4049,
        elevationM: 71,
        subBasinId: "TR45_GEDIZ_GRABEN_FLOOR"
      },
      stations: [
        {
          stationId: 17186,
          provinceCode: "TR-45",
          lat: 38.6153,
          lon: 27.4049,
          elevationM: 71,
          tempC: 47.4,
          relHumidityPct: 16,
          windSpeedKmh: 12,
          windDirDeg: 90
        },
        // Attempted İzmir coastal 17220 cross-border leak must be rejected!
        {
          stationId: 17220,
          provinceCode: "TR-35",
          lat: 38.3949,
          lon: 27.0819,
          elevationM: 25,
          tempC: 33.2,
          relHumidityPct: 58
        }
      ],
      drivers: imbatDrivers
    });
    expect(manisaExtremeHeatSurface).not.toBeNull();
    expect(manisaExtremeHeatSurface!.rejectedCrossBorderCount).toBe(1);
    expect(manisaExtremeHeatSurface!.tempC).toBeGreaterThan(46.5);

    // 3. Clear winter night (04:00): İzmir LTBJ Cumaovası frost hollow (+1.0°C) vs Konak urban UHI (+7.5°C)
    //    plus Chios (LGHI) foreign Greek island METAR rejection!
    const izmirWinterNight = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_35,
      target: {
        lat: 38.4049,
        lon: 27.1895,
        elevationM: 25,
        subBasinId: "TR35_INNER_BAY_URBAN_CORE"
      },
      stations: [
        {
          stationId: 17220,
          provinceCode: "TR-35",
          name: "İzmir Konak",
          lat: 38.3949,
          lon: 27.0819,
          elevationM: 25,
          tempC: 7.5,
          relHumidityPct: 72,
          windSpeedKmh: 5,
          windDirDeg: 110
        },
        {
          stationId: "LTBJ",
          icaoId: "LTBJ",
          provinceCode: "TR-35",
          name: "Adnan Menderes Cumaovası",
          lat: 38.2924,
          lon: 27.157,
          elevationM: 125,
          tempC: 1.0,
          relHumidityPct: 92,
          windSpeedKmh: 3,
          windDirDeg: 0
        },
        {
          stationId: "LGHI",
          icaoId: "LGHI",
          provinceCode: "GLOBAL",
          name: "Chios Airport (Greece)",
          lat: 38.343,
          lon: 26.14,
          elevationM: 5,
          tempC: 11.2
        }
      ],
      drivers: {
        localHour: 4,
        month: 1,
        isNight: true,
        cloudCoverPct: 5,
        wind10mDirDeg: 90,
        wind10mSpeedKmh: 5
      }
    });

    expect(izmirWinterNight).not.toBeNull();
    expect(izmirWinterNight!.rejectedCrossBorderCount).toBe(1);
    expect(izmirWinterNight!.tempC).toBeGreaterThan(6.6);
    const ltbjContrib = izmirWinterNight!.contributions.find((c) => c.stationId === "LTBJ");
    expect(ltbjContrib).toBeDefined();
    expect(ltbjContrib!.usedColdBasinUnbias).toBe(true);
    expect(ltbjContrib!.normalizedWeight).toBeLessThan(0.15);

    // 4. Çeşme Etesian/Poyraz Venturi acceleration (015° NNE)
    const cesmeVenturi = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_35.venturiCorridors,
      targetLat: 38.3036,
      targetLon: 26.3724,
      windDirDeg: 15,
      windSpeedKmh: 28
    });
    expect(cesmeVenturi.speedMultiplier).toBeGreaterThan(1.3);
    expect(cesmeVenturi.suppressesNocturnalInversion).toBe(true);

    // 5. Manisa Gediz Graben clear winter night radiation inversion (+4.5 °C/km across Gediz -> Spil)
    const manisaWinterStations: ProvinceLiveStationObs[] = [
      {
        stationId: 18051,
        provinceCode: "TR-45",
        name: "Saruhanlı Gediz",
        lat: 38.738,
        lon: 27.5745,
        elevationM: 37,
        tempC: -1.8,
        relHumidityPct: 96
      },
      {
        stationId: 17186,
        provinceCode: "TR-45",
        name: "Manisa Merkez",
        lat: 38.6153,
        lon: 27.4049,
        elevationM: 71,
        tempC: -0.6,
        relHumidityPct: 93
      },
      {
        stationId: 17771,
        provinceCode: "TR-45",
        name: "Spil Dağı Atalanı",
        lat: 38.5539,
        lon: 27.4485,
        elevationM: 1238,
        tempC: 4.6,
        relHumidityPct: 58
      }
    ];
    const manisaProfile = computeProvinceLiveVerticalProfile({
      spec: PROVINCE_SPEC_TR_45,
      stations: manisaWinterStations,
      isNight: true,
      cloudCoverPct: 8,
      wind10mSpeedKmh: 4
    });
    expect(manisaProfile.boundaryLayerState).toBe("STRONG_INVERSION");
    expect(manisaProfile.lowerPoolLapseCPerKm).toBeGreaterThan(3.0);
    expect(manisaProfile.inversionStrengthC).toBeGreaterThan(1.2);
  });

  it("models Sakarya (TR-54) 380 km Black Sea DEK upslope vs Geyve Strait rain-shadow/Venturi and blocks Kocaeli LTBQ", () => {
    expect(PROVINCE_SPEC_TR_54.calibrationTier).toBe("TIER_A_WMO");
    expect(PROVINCE_SPEC_TR_54.primaryCenter.wmoId).toBe("17069");
    expect(PROVINCE_SPEC_TR_54.icaoWhitelist).toEqual([]);
    expect(PROVINCE_SPEC_TR_54.inversionAndWedgeSpec.basinFloorElevationM).toBe(31);
    expect(PROVINCE_SPEC_TR_54.waterBodies[0].effectiveFetchKm).toBe(380);
    expect(PROVINCE_SPEC_TR_54.waterBodies[1].kind).toBe("fresh_lake");

    // Northerly Karadeniz DEK / Poyraz-Yıldız (010° at 38 km/h): Karasu upslope vs Geyve rain-shadow!
    const karasuTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_54, {
      lat: 41.1113,
      lon: 30.6901,
      elevationM: 8,
      subBasinId: "TR54_KARASU_BLACKSEA_COAST"
    });
    const geyveTarget = resolveProvinceTargetMetadata(PROVINCE_SPEC_TR_54, {
      lat: 40.5214,
      lon: 30.296,
      elevationM: 100,
      subBasinId: "TR54_GEYVE_PAMUKOVA_GORGE"
    });

    const dekDrivers = {
      localHour: 10,
      month: 1,
      isNight: false,
      cloudCoverPct: 95,
      wind850DirDeg: 10,
      wind850SpeedKmh: 38,
      wind10mDirDeg: 5,
      wind10mSpeedKmh: 28,
      liveWaterTempsByIdC: { TR54_WESTERN_BLACK_SEA: 9.5 }
    };

    const karasuBarrier = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_54,
      target: karasuTarget,
      drivers: dekDrivers
    });
    const geyveBarrier = applyDirectionalBarrierRules({
      spec: PROVINCE_SPEC_TR_54,
      target: geyveTarget,
      drivers: dekDrivers
    });

    expect(karasuBarrier.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(karasuBarrier.precipMultiplier).toBeGreaterThan(1.3);
    expect(geyveBarrier.activeRegime).toBe("RAIN_SHADOW");
    expect(geyveBarrier.precipMultiplier).toBeLessThan(0.8);

    // Geyve Strait Venturi channel (195° SSW Lodos jet)
    const geyveVenturi = applyVenturiCorridorRules({
      corridors: PROVINCE_SPEC_TR_54.venturiCorridors,
      targetLat: 40.585,
      targetLon: 30.315,
      windDirDeg: 195,
      windSpeedKmh: 26
    });
    expect(geyveVenturi.speedMultiplier).toBeGreaterThan(1.2);
    expect(geyveVenturi.suppressesNocturnalInversion).toBe(true);

    // Zero Kocaeli (TR-41 / LTBQ) cross-border leakage into Adapazarı
    const sakaryaSurf = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_54,
      target: {
        lat: 40.7676,
        lon: 30.3934,
        elevationM: 31,
        subBasinId: "TR54_ADAPAZARI_ALLUVIAL_PLAIN"
      },
      stations: [
        {
          stationId: 17069,
          provinceCode: "TR-54",
          name: "Adapazarı",
          lat: 40.7676,
          lon: 30.3934,
          elevationM: 31,
          tempC: 4.2,
          relHumidityPct: 94
        },
        {
          stationId: "LTBQ",
          icaoId: "LTBQ",
          provinceCode: "TR-41",
          name: "Kocaeli Cengiz Topel",
          lat: 40.735,
          lon: 30.083,
          elevationM: 55,
          tempC: 9.8
        }
      ],
      drivers: {
        localHour: 5,
        month: 12,
        isNight: true,
        cloudCoverPct: 20,
        wind10mSpeedKmh: 4
      }
    });
    expect(sakaryaSurf).not.toBeNull();
    expect(sakaryaSurf!.rejectedCrossBorderCount).toBe(1);
    expect(sakaryaSurf!.contributions).toHaveLength(1);
    expect(sakaryaSurf!.contributions[0].stationId).toBe(17069);
  });

  it("enforces Bilecik (TR-11) 35 km Osmaneli (96 m) -> Bozüyük (754 m) escarpment contrast and 100% blocks Bursa (TR-16) & Eskişehir (TR-26) leakage", () => {
    expect(PROVINCE_SPEC_TR_11.calibrationTier).toBe("TIER_B_DONOR_KALMAN");
    expect(PROVINCE_SPEC_TR_11.primaryCenter.wmoId).toBeUndefined();
    expect(PROVINCE_SPEC_TR_11.waterBodies).toHaveLength(0);
    expect(PROVINCE_SPEC_TR_11.icaoWhitelist).toEqual([]);

    const mixedStations: ProvinceLiveStationObs[] = [
      // Valid TR-11 Bilecik stations across the 35 km step
      {
        stationId: 18087,
        provinceCode: "TR-11",
        name: "Osmaneli (Sakarya Boğazı)",
        lat: 40.3628,
        lon: 30.0064,
        elevationM: 96,
        tempC: 6.2,
        relHumidityPct: 78
      },
      {
        stationId: 17120,
        provinceCode: "TR-11",
        name: "Bilecik Merkez",
        lat: 40.1414,
        lon: 29.9772,
        elevationM: 539,
        tempC: 1.8,
        relHumidityPct: 84
      },
      {
        stationId: 17702,
        provinceCode: "TR-11",
        name: "Bozüyük",
        lat: 39.9039,
        lon: 30.0525,
        elevationM: 754,
        tempC: -2.4,
        relHumidityPct: 88,
        snowDepthCm: 8
      },
      {
        stationId: 17701,
        provinceCode: "TR-11",
        name: "Pazaryeri",
        lat: 39.9938,
        lon: 29.9114,
        elevationM: 825,
        tempC: -3.6,
        relHumidityPct: 90,
        snowDepthCm: 12
      },
      // Attempted neighbor leaks from Bursa (TR-16) & Eskişehir (TR-26) — MUST BE 100% REJECTED!
      {
        stationId: "LTBR",
        icaoId: "LTBR",
        provinceCode: "TR-16",
        name: "Bursa Yenişehir Havalimanı",
        lat: 40.2553,
        lon: 29.5625,
        elevationM: 233,
        tempC: 9.5
      },
      {
        stationId: 17984,
        provinceCode: "TR-16",
        name: "Bursa İnegöl",
        lat: 40.0657,
        lon: 29.5619,
        elevationM: 290,
        tempC: 8.8
      },
      {
        stationId: 17116,
        provinceCode: "TR-16",
        name: "Bursa Merkez",
        lat: 40.2308,
        lon: 29.0133,
        elevationM: 100,
        tempC: 11.4
      },
      {
        stationId: "LTBY",
        icaoId: "LTBY",
        provinceCode: "TR-26",
        name: "Eskişehir Anadolu Havalimanı",
        lat: 39.81,
        lon: 30.52,
        elevationM: 787,
        tempC: -9.5
      },
      {
        stationId: 17126,
        provinceCode: "TR-26",
        name: "Eskişehir Bölge",
        lat: 39.7656,
        lon: 30.5502,
        elevationM: 801,
        tempC: -8.9
      }
    ];

    const drivers = {
      localHour: 8,
      month: 1,
      isNight: false,
      cloudCoverPct: 75,
      wind10mDirDeg: 25,
      wind10mSpeedKmh: 16,
      hasSnowpack: true
    };

    const osmaneliRes = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_11,
      target: {
        lat: 40.3628,
        lon: 30.0064,
        elevationM: 96,
        subBasinId: "TR11_OSMANELI_SAKARYA_GORGE"
      },
      stations: mixedStations,
      drivers
    });
    const bozuyukRes = solveProvinceTopographicSurface({
      spec: PROVINCE_SPEC_TR_11,
      target: {
        lat: 39.9039,
        lon: 30.0525,
        elevationM: 754,
        subBasinId: "TR11_BOZUYUK_PAZARYERI_PLATEAU"
      },
      stations: mixedStations,
      drivers
    });

    expect(osmaneliRes).not.toBeNull();
    expect(bozuyukRes).not.toBeNull();

    // All 5 Bursa (TR-16) and Eskişehir (TR-26) stations must be strictly rejected!
    expect(osmaneliRes!.rejectedCrossBorderCount).toBe(5);
    expect(bozuyukRes!.rejectedCrossBorderCount).toBe(5);
    for (const c of [...osmaneliRes!.contributions, ...bozuyukRes!.contributions]) {
      expect(c.provinceCode).toBe("TR-11");
    }

    // Sharp 35 km step preserved: Osmaneli Sakarya Gorge > +5.5°C while Bozüyük Plateau < -1.8°C!
    expect(osmaneliRes!.tempC).toBeGreaterThan(5.5);
    expect(bozuyukRes!.tempC).toBeLessThan(-1.8);
    expect(osmaneliRes!.tempC - bozuyukRes!.tempC).toBeGreaterThan(7.5);
  });
});
