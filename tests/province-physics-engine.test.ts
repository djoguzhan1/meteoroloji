import { describe, expect, it } from "vitest";
import {
  applyDirectionalBarrierRules,
  applyVenturiCorridorRules,
  computeProvinceMicroclimateOffsetC,
  solveProvinceTopographicSurface
} from "../lib/provinces/engine/province-cressman";
import {
  evaluateProvinceCalibratedHour,
  evaluateSimplexCombination
} from "../lib/provinces/engine/province-mos-engine";
import {
  computeProvinceLiveVerticalProfile,
  integrateProvinceVerticalDeltaC,
  type ProvinceEngineSpec,
  type ProvinceLiveStationObs
} from "../lib/provinces/engine/province-vertical-profile";
import { TR81_CLIMATOLOGY_1991_2020 } from "../lib/provinces/climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../lib/provinces/hypsometric-bands-tr81";
import type { HybridModelSnapshot } from "../lib/weather-types";

function uniformSnapshot(val: number): HybridModelSnapshot {
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

function buildErzurumSpec(): ProvinceEngineSpec {
  const clim = TR81_CLIMATOLOGY_1991_2020["TR-25"];
  const hyp = TR81_HYPSOMETRIC_PROFILES["TR-25"];
  return {
    provinceCode: "TR-25",
    plateCode: 25,
    slug: "erzurum",
    nameTr: "Erzurum",
    region: "EASTERN_ANATOLIA",
    climateRegion: "DOGU_ANADOLU",
    calibrationTier: "TIER_A_WMO",
    donorCluster: "HIGH_EAST_SNOW_BASIN",
    icaoWhitelist: ["LTCE"],
    domainBounds: { minLat: 39.1, maxLat: 40.9, minLon: 40.2, maxLon: 42.6 },
    primaryCenter: {
      mgmMerkezId: 92501,
      mgmIstNo: 17095,
      mgmSaatlikIstNo: 17095,
      mgmGunlukIstNo: 92501,
      wmoId: "17096",
      lat: 39.9055,
      lon: 41.2658,
      demVerifiedElevationM: 1860,
      subBasinId: "ERZURUM_OVA_BASIN",
      urbanFraction: 0.62,
      monthlyTmaxNormalsC: clim.tmaxC,
      monthlyTminNormalsC: clim.tminC
    },
    curatedSubLocations: [
      { id: "aziziye-ova", name: "Aziziye Ova Tabanı", role: "plain", lat: 39.95, lon: 41.11, elevationM: 1758 },
      { id: "palandoken-zirve", name: "Palandöken Zirve", role: "summit", lat: 39.85, lon: 41.28, elevationM: 2850 }
    ],
    subBasins: [
      {
        id: "ERZURUM_OVA_BASIN",
        labelTr: "Erzurum Karasu Ovası",
        polygonOrBbox: { minLat: 39.82, maxLat: 40.12, minLon: 40.95, maxLon: 41.45 },
        elevationRangeM: [1740, 2138],
        defaultZone: "rural_closed_basin",
        defaultUrbanFraction: 0.45
      },
      {
        id: "PALANDOKEN_MASSIF",
        labelTr: "Palandöken Dağ Kütlesi",
        polygonOrBbox: { minLat: 39.72, maxLat: 39.89, minLon: 41.18, maxLon: 41.42 },
        elevationRangeM: [2138, 3180],
        defaultZone: "alpine_summit",
        defaultUrbanFraction: 0.05
      }
    ],
    barrierCouplingMatrix: {
      ERZURUM_OVA_BASIN: { ERZURUM_OVA_BASIN: 1.0, PALANDOKEN_MASSIF: 0.35 },
      PALANDOKEN_MASSIF: { ERZURUM_OVA_BASIN: 0.35, PALANDOKEN_MASSIF: 1.0 }
    },
    stationOverrides: {
      LTCE: {
        stationId: "LTCE",
        demElevationM: 1758,
        subBasinId: "ERZURUM_OVA_BASIN",
        urbanFraction: 0.06,
        coldPoolSusceptibility: 0.96,
        verticalStratumRole: "basin_floor",
        excludeFromCenterHeadline: true
      }
    },
    verticalProfileSpec: {
      piecewiseKnotsM: [1758, 2138, 2550, 3176],
      maxPhysicalPeakM: hyp.maxPhysicalPeakM,
      snowElevationBands: hyp.bands
    },
    waterBodies: [],
    directionalBarriers: [],
    venturiCorridors: [],
    inversionAndWedgeSpec: {
      basinFloorElevationM: 1758,
      coldPoolMaxDepthM: 380,
      topographicEnclosureIndex: 0.92,
      deltaPressureTopHpa: 55,
      snowAlbedoFeedback: {
        snowDepthTriggerCm: 3.0,
        maxExtraRadiativeCoolingC: 6.5
      },
      persistentStratusLock: {
        enabled: true,
        daytimeSolarDampingFactor: 0.45
      }
    },
    inversion: {
      valleyFloorM: 1758,
      coldPoolDepthM: 380,
      clearNightInversionLapseCPerKm: 4.8,
      snowpackBoostFactor: 1.85
    },
    urbanHeatIsland: {
      maxNocturnalUhiC: 2.8,
      referenceUrbanFraction: 0.62,
      coldBasinAirportIcaos: ["LTCE"]
    },
    aridAndSevereDrivers: {
      dustTransportSusceptibility: 0.1,
      invertedVDryMicroburstSusceptibility: 0.25,
      coastalWaterspoutSusceptibility: 0
    },
    stencil9Points: [],
    qcAndMosBounds: {
      minPlausibleTempC: -48,
      maxPlausibleTempC: 44,
      minPlausibleMslpHpa: 965,
      maxPlausibleMslpHpa: 1068,
      kalmanTempBiasCapC: 10.0
    }
  };
}

function buildRizeSpec(): ProvinceEngineSpec {
  const clim = TR81_CLIMATOLOGY_1991_2020["TR-53"];
  const hyp = TR81_HYPSOMETRIC_PROFILES["TR-53"];
  return {
    provinceCode: "TR-53",
    plateCode: 53,
    slug: "rize",
    nameTr: "Rize",
    region: "BLACK_SEA_EAST",
    climateRegion: "KARADENIZ",
    calibrationTier: "TIER_A_WMO",
    donorCluster: "EAST_BLACK_SEA_STEEP_OROG",
    icaoWhitelist: ["LTFO"],
    domainBounds: { minLat: 40.55, maxLat: 41.35, minLon: 40.3, maxLon: 41.5 },
    primaryCenter: {
      mgmMerkezId: 95301,
      mgmIstNo: 17040,
      mgmSaatlikIstNo: 17040,
      mgmGunlukIstNo: 95301,
      wmoId: "17040",
      lat: 41.0201,
      lon: 40.5234,
      demVerifiedElevationM: 8,
      subBasinId: "RIZE_COAST_WALL",
      urbanFraction: 0.55,
      monthlyTmaxNormalsC: clim.tmaxC,
      monthlyTminNormalsC: clim.tminC
    },
    curatedSubLocations: [],
    subBasins: [
      {
        id: "RIZE_COAST_WALL",
        labelTr: "Rize Kıyı Şeridi",
        polygonOrBbox: { minLat: 40.95, maxLat: 41.3, minLon: 40.3, maxLon: 41.45 },
        elevationRangeM: [0, 650],
        defaultZone: "coastal_marine",
        defaultUrbanFraction: 0.5
      }
    ],
    barrierCouplingMatrix: { RIZE_COAST_WALL: { RIZE_COAST_WALL: 1.0 } },
    stationOverrides: {},
    verticalProfileSpec: {
      piecewiseKnotsM: [0, 450, 1450, 3200],
      maxPhysicalPeakM: hyp.maxPhysicalPeakM,
      snowElevationBands: hyp.bands
    },
    waterBodies: [],
    directionalBarriers: [
      {
        id: "KACKAR_WALL",
        labelTr: "Kaçkar Dağları Dik Kıyı Duvarı",
        effectiveBarrierHeightM: 3100,
        crestPressureHpa: 700,
        applicableSubBasins: ["RIZE_COAST_WALL"],
        foehnSpec: {
          enabled: true,
          windFromSectorDeg: { fromDeg: 150, toDeg: 215 },
          minCrossCrestSpeedMs: 7.0,
          minFroudeNumber: 0.36,
          sourcePlateauElevationM: 1900,
          maxTargetElevationM: 1100,
          maxWarmingCapC: 8.0,
          subCloudVirgaFactor: 1.15,
          wetCutoffMmHr: 0.4
        },
        upslopeSpec: {
          enabled: true,
          windFromSectorDeg: { fromDeg: 295, toDeg: 20 },
          minOnshoreOrUpslopeSpeedMs: 5.5,
          coastalFrictionalConvergenceBoost: 1.45,
          maxPrecipMultiplierCap: 2.85
        },
        rainShadowSpec: {
          shadowedWindFromSectorDeg: { fromDeg: 155, toDeg: 210 },
          precipAttenuationFactor: 0.38
        }
      }
    ],
    venturiCorridors: [],
    inversionAndWedgeSpec: {
      basinFloorElevationM: 0,
      coldPoolMaxDepthM: 180,
      topographicEnclosureIndex: 0.12,
      deltaPressureTopHpa: 45,
      snowAlbedoFeedback: { snowDepthTriggerCm: 5, maxExtraRadiativeCoolingC: 0.8 },
      persistentStratusLock: { enabled: false, daytimeSolarDampingFactor: 0.9 }
    },
    aridAndSevereDrivers: {
      dustTransportSusceptibility: 0.1,
      invertedVDryMicroburstSusceptibility: 0.05,
      coastalWaterspoutSusceptibility: 0.72
    },
    stencil9Points: [],
    qcAndMosBounds: {
      minPlausibleTempC: -14,
      maxPlausibleTempC: 44,
      minPlausibleMslpHpa: 970,
      maxPlausibleMslpHpa: 1055,
      kalmanTempBiasCapC: 5.5
    }
  };
}

function buildAntalyaSpec(): ProvinceEngineSpec {
  const clim = TR81_CLIMATOLOGY_1991_2020["TR-07"];
  const hyp = TR81_HYPSOMETRIC_PROFILES["TR-07"];
  return {
    provinceCode: "TR-07",
    plateCode: 7,
    slug: "antalya",
    nameTr: "Antalya",
    region: "MEDITERRANEAN",
    climateRegion: "AKDENIZ",
    calibrationTier: "TIER_A_WMO",
    donorCluster: "MEDITERRANEAN_COASTAL_OROG",
    icaoWhitelist: ["LTAI"],
    domainBounds: { minLat: 36.0, maxLat: 37.5, minLon: 29.2, maxLon: 32.6 },
    primaryCenter: {
      mgmMerkezId: 90701,
      mgmIstNo: 17302,
      mgmSaatlikIstNo: 17302,
      mgmGunlukIstNo: 90701,
      wmoId: "17300",
      lat: 36.8969,
      lon: 30.7133,
      demVerifiedElevationM: 47,
      subBasinId: "ANTALYA_GULF_COAST",
      urbanFraction: 0.78,
      monthlyTmaxNormalsC: clim.tmaxC,
      monthlyTminNormalsC: clim.tminC
    },
    curatedSubLocations: [],
    subBasins: [
      {
        id: "ANTALYA_GULF_COAST",
        labelTr: "Antalya Körfezi Falez Kıyısı",
        polygonOrBbox: { minLat: 36.5, maxLat: 37.1, minLon: 30.4, maxLon: 31.4 },
        elevationRangeM: [0, 350],
        defaultZone: "coastal_marine",
        defaultUrbanFraction: 0.72
      }
    ],
    barrierCouplingMatrix: { ANTALYA_GULF_COAST: { ANTALYA_GULF_COAST: 1.0 } },
    stationOverrides: {},
    verticalProfileSpec: {
      piecewiseKnotsM: [0, 350, 1050, 2350],
      maxPhysicalPeakM: hyp.maxPhysicalPeakM,
      snowElevationBands: hyp.bands
    },
    waterBodies: [],
    directionalBarriers: [
      {
        id: "TOROS_ANTALYA_ARC",
        labelTr: "Batı Toroslar / Beydağları Duvarı",
        effectiveBarrierHeightM: 2250,
        crestPressureHpa: 800,
        applicableSubBasins: ["ANTALYA_GULF_COAST"],
        foehnSpec: {
          // Northerly "Poyraz Foehn" descending from Central Anatolian / Pisidian plateau!
          enabled: true,
          windFromSectorDeg: { fromDeg: 340, toDeg: 45 },
          minCrossCrestSpeedMs: 6.5,
          minFroudeNumber: 0.38,
          sourcePlateauElevationM: 1150,
          maxTargetElevationM: 450,
          maxWarmingCapC: 5.8,
          subCloudVirgaFactor: 1.05,
          wetCutoffMmHr: 0.35
        },
        upslopeSpec: {
          // Southerly / Lodos onshore Mediterranean flood upslope — NEVER suppressed as Foehn!
          enabled: true,
          windFromSectorDeg: { fromDeg: 155, toDeg: 225 },
          minOnshoreOrUpslopeSpeedMs: 5.5,
          coastalFrictionalConvergenceBoost: 1.4,
          maxPrecipMultiplierCap: 2.55
        }
      }
    ],
    venturiCorridors: [],
    inversionAndWedgeSpec: {
      basinFloorElevationM: 0,
      coldPoolMaxDepthM: 160,
      topographicEnclosureIndex: 0.15,
      deltaPressureTopHpa: 45,
      snowAlbedoFeedback: { snowDepthTriggerCm: 5, maxExtraRadiativeCoolingC: 0.4 },
      persistentStratusLock: { enabled: false, daytimeSolarDampingFactor: 0.95 }
    },
    aridAndSevereDrivers: {
      dustTransportSusceptibility: 0.45,
      invertedVDryMicroburstSusceptibility: 0.2,
      coastalWaterspoutSusceptibility: 0.94
    },
    stencil9Points: [],
    qcAndMosBounds: {
      minPlausibleTempC: -8,
      maxPlausibleTempC: 49,
      minPlausibleMslpHpa: 975,
      maxPlausibleMslpHpa: 1048,
      kalmanTempBiasCapC: 4.8
    }
  };
}

describe("ARC-03 — 80-İl 3B Topoğrafik Cressman, Z_base Enversiyon, Yönlü Bariyer, Venturi ve Simpleks MOS Motoru", () => {
  it("Erzurum (TR-25, 1758m ova vs 2850m Palandöken): kar örtülü açık kış gecesinde Z_base-bağıl enversiyon (Z_i = 2138m) ovayı yamaçtan soğuk tutar", () => {
    const erzurumSpec = buildErzurumSpec();

    const stationsWithSummit: ProvinceLiveStationObs[] = [
      {
        stationId: 17096,
        provinceCode: "TR-25",
        name: "Erzurum Aziziye Ova",
        icaoId: "LTCE",
        lat: 39.952,
        lon: 41.106,
        elevationM: 1758,
        tempC: -24.6,
        relHumidityPct: 82,
        pressureMslHpa: 1064,
        windSpeedKmh: 4,
        windDirDeg: 65,
        snowDepthCm: 34,
        qcWeight: 1.0,
        subBasinId: "ERZURUM_OVA_BASIN"
      },
      {
        stationId: 18925,
        provinceCode: "TR-25",
        name: "Palandöken Kayak / Zirve Sırtı",
        lat: 39.848,
        lon: 41.282,
        elevationM: 2850,
        tempC: -15.2,
        relHumidityPct: 58,
        pressureMslHpa: 1061,
        windSpeedKmh: 11,
        windDirDeg: 80,
        snowDepthCm: 95,
        qcWeight: 1.0,
        subBasinId: "PALANDOKEN_MASSIF"
      }
    ];

    const liveProf = computeProvinceLiveVerticalProfile({
      spec: erzurumSpec,
      stations: stationsWithSummit,
      isNight: true,
      cloudCoverPct: 8,
      wind850SpeedKmh: 10,
      hasSnowpack: true
    });

    expect(liveProf.valleyFloorM).toBe(1758);
    expect(liveProf.coldPoolTopM).toBe(2138);
    expect(liveProf.boundaryLayerState).toBe("STRONG_INVERSION");
    expect(liveProf.lowerPoolLapseCPerKm).toBeGreaterThan(4.0);
    expect(liveProf.inversionStrengthC).toBeGreaterThan(6.0);

    const deltaFloorToFoothillC = integrateProvinceVerticalDeltaC(1758, 2100, liveProf);
    const deltaFloorToSummitC = integrateProvinceVerticalDeltaC(1758, 2850, liveProf);
    expect(deltaFloorToFoothillC).toBeGreaterThan(1.5);
    expect(deltaFloorToSummitC).toBeGreaterThan(5.0);
    expect(
      deltaFloorToSummitC + integrateProvinceVerticalDeltaC(2850, 1758, liveProf)
    ).toBeCloseTo(0, 10);

    // Yüksek dağ istasyonu çevrimdışı olsa bile kar örtüsü güçlendirmesi (`snowpackBoostFactor`) pozitif enversiyon kurar
    const floorOnlyProf = computeProvinceLiveVerticalProfile({
      spec: erzurumSpec,
      stations: [stationsWithSummit[0]],
      isNight: true,
      cloudCoverPct: 5,
      wind850SpeedKmh: 6,
      hasSnowpack: true
    });
    expect(floorOnlyProf.snowpackAmplified).toBe(true);
    expect(floorOnlyProf.lowerPoolLapseCPerKm).toBeGreaterThan(5.0);
    expect(floorOnlyProf.boundaryLayerState).toBe("STRONG_INVERSION");

    const drivers = {
      localHour: 4,
      month: 1,
      isNight: true,
      cloudCoverPct: 5,
      wind10mSpeedKmh: 4,
      wind10mDirDeg: 70,
      hasSnowpack: true
    };
    const ovaSurface = solveProvinceTopographicSurface({
      spec: erzurumSpec,
      target: {
        lat: 39.948,
        lon: 41.12,
        elevationM: 1762,
        subBasinId: "ERZURUM_OVA_BASIN",
        urbanFraction: 0.1
      },
      stations: [stationsWithSummit[0]],
      drivers,
      verticalProfile: floorOnlyProf
    });
    const foothillSurface = solveProvinceTopographicSurface({
      spec: erzurumSpec,
      target: {
        lat: 39.875,
        lon: 41.27,
        elevationM: 2120,
        subBasinId: "PALANDOKEN_MASSIF",
        urbanFraction: 0.1
      },
      stations: [stationsWithSummit[0]],
      drivers,
      verticalProfile: floorOnlyProf
    });

    expect(ovaSurface).not.toBeNull();
    expect(foothillSurface).not.toBeNull();
    expect(ovaSurface!.tempC).toBeLessThan(foothillSurface!.tempC - 2.0);
    expect(ovaSurface!.pressureMslHpa).toBeCloseTo(1064, 0);
  });

  it("Rize güneyli Kaçkar fönü (190°) vs kuzeybatılı orografik yağış (330°), Antalya kuzeyli Poyraz fönü vs güneyli Lodos taşkını ve Trakya sığ soğuk kama kilidini çözer", () => {
    const rizeSpec = buildRizeSpec();
    const rizeTarget = {
      lat: 41.025,
      lon: 40.53,
      elevationM: 25,
      subBasinId: "RIZE_COAST_WALL",
      zone: "coastal_marine" as const,
      urbanFraction: 0.52,
      isCoastal: true,
      coastalDistanceKm: 0.8
    };

    const rizeFoehn = applyDirectionalBarrierRules({
      spec: rizeSpec,
      target: rizeTarget,
      drivers: {
        localHour: 14,
        isNight: false,
        cloudCoverPct: 30,
        wind850DirDeg: 190,
        wind850SpeedKmh: 68
      }
    });
    expect(rizeFoehn.activeRegime).toBe("FOEHN_LEE");
    expect(rizeFoehn.froudeNumber).toBeGreaterThan(0.45);
    expect(rizeFoehn.foehnTempDeltaC).toBeGreaterThan(3.8);
    expect(rizeFoehn.foehnRhDeltaPct).toBeLessThan(-15);
    expect(rizeFoehn.precipMultiplier).toBeLessThan(0.65);

    const rizeUpslope = applyDirectionalBarrierRules({
      spec: rizeSpec,
      target: rizeTarget,
      drivers: {
        localHour: 14,
        isNight: false,
        cloudCoverPct: 95,
        wind850DirDeg: 330,
        wind850SpeedKmh: 62
      }
    });
    expect(rizeUpslope.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(rizeUpslope.foehnTempDeltaC).toBe(0);
    expect(rizeUpslope.precipMultiplier).toBeGreaterThan(1.85);

    const antalyaSpec = buildAntalyaSpec();
    const antalyaTarget = {
      lat: 36.89,
      lon: 30.71,
      elevationM: 42,
      subBasinId: "ANTALYA_GULF_COAST",
      zone: "coastal_marine" as const,
      urbanFraction: 0.75,
      isCoastal: true,
      coastalDistanceKm: 1.2
    };

    const antalyaNorthFoehn = applyDirectionalBarrierRules({
      spec: antalyaSpec,
      target: antalyaTarget,
      drivers: {
        localHour: 15,
        isNight: false,
        cloudCoverPct: 10,
        wind850DirDeg: 15,
        wind850SpeedKmh: 64
      }
    });
    expect(antalyaNorthFoehn.activeRegime).toBe("FOEHN_LEE");
    expect(antalyaNorthFoehn.foehnTempDeltaC).toBeGreaterThan(2.6);
    expect(antalyaNorthFoehn.precipMultiplier).toBeLessThan(0.8);

    const antalyaSouthFlood = applyDirectionalBarrierRules({
      spec: antalyaSpec,
      target: antalyaTarget,
      drivers: {
        localHour: 15,
        isNight: false,
        cloudCoverPct: 98,
        wind850DirDeg: 190,
        wind850SpeedKmh: 68
      }
    });
    expect(antalyaSouthFlood.activeRegime).toBe("UPSLOPE_OROGRAPHIC");
    expect(antalyaSouthFlood.foehnTempDeltaC).toBe(0);
    expect(antalyaSouthFlood.precipMultiplier).toBeGreaterThan(1.75);

    // Trakya sığ Balkan soğuk kama kilidi: yüzeyde Karayel (320°) eserken 850 hPa Lodos (200°) fön üretemez!
    const thraceWedgeSpec: ProvinceEngineSpec = {
      ...rizeSpec,
      provinceCode: "TR-22",
      inversionAndWedgeSpec: {
        ...rizeSpec.inversionAndWedgeSpec,
        shallowColdWedgeRule: {
          surfaceColdSectorDeg: { fromDeg: 285, toDeg: 350 },
          minWindShearVs850Deg: 85
        }
      }
    };
    const thraceBlocked = applyDirectionalBarrierRules({
      spec: thraceWedgeSpec,
      target: rizeTarget,
      drivers: {
        localHour: 9,
        isNight: false,
        cloudCoverPct: 100,
        wind10mDirDeg: 320,
        wind10mSpeedKmh: 28,
        wind850DirDeg: 200,
        wind850SpeedKmh: 65
      }
    });
    expect(thraceBlocked.foehnBlockedByColdWedge).toBe(true);
    expect(thraceBlocked.foehnTempDeltaC).toBe(0);
  });

  it("Çanakkale Boğazı Poyraz (40°) Venturi hamle çarpanını cos^2(Δθ) ile uygular, UHI havalimanı çanağını ve İmbat meltemini çözer", () => {
    const canakkaleCorridors = [
      {
        id: "DARDANELLES_STRAIT_JET",
        labelTr: "Çanakkale Boğazı Venturi Kanalı",
        centerCoord: { lat: 40.155, lon: 26.405 },
        influenceRadiusKm: 22,
        channelAxisFromDeg: 40,
        bidirectional: true,
        sectorHalfWidthDeg: 55,
        speedMultiplier: 1.52,
        gustMultiplier: 1.68,
        suppressesNocturnalInversion: true
      }
    ];

    const alignedPoyraz = applyVenturiCorridorRules({
      corridors: canakkaleCorridors,
      targetLat: 40.15,
      targetLon: 26.41,
      windDirDeg: 40,
      windSpeedKmh: 34
    });
    expect(alignedPoyraz.alignmentCos2).toBeCloseTo(1.0, 3);
    expect(alignedPoyraz.speedMultiplier).toBeCloseTo(1.52, 2);
    expect(alignedPoyraz.gustMultiplier).toBeCloseTo(1.68, 2);
    expect(alignedPoyraz.suppressesNocturnalInversion).toBe(true);

    const obliqueFlow = applyVenturiCorridorRules({
      corridors: canakkaleCorridors,
      targetLat: 40.15,
      targetLon: 26.41,
      windDirDeg: 70,
      windSpeedKmh: 34
    });
    expect(obliqueFlow.alignmentCos2).toBeCloseTo(0.75, 2);
    expect(obliqueFlow.speedMultiplier).toBeCloseTo(1 + 0.52 * 0.75, 2);

    const crossFlow = applyVenturiCorridorRules({
      corridors: canakkaleCorridors,
      targetLat: 40.15,
      targetLon: 26.41,
      windDirDeg: 130,
      windSpeedKmh: 34
    });
    expect(crossFlow.speedMultiplier).toBe(1.0);
    expect(crossFlow.gustMultiplier).toBe(1.0);

    const erzurumSpec = buildErzurumSpec();
    // Kırsal havalimanı LTCE -> kentsel merkez gece Oke (1987) UHI + soğuk çanak kaçış ofseti
    const ltceToCityUhi = computeProvinceMicroclimateOffsetC({
      spec: erzurumSpec,
      target: {
        lat: 39.905,
        lon: 41.266,
        elevationM: 1860,
        subBasinId: "ERZURUM_OVA_BASIN",
        zone: "urban_plain",
        urbanFraction: 0.78,
        isCoastal: false,
        coastalDistanceKm: 180
      },
      drivers: {
        localHour: 3,
        month: 1,
        isNight: true,
        cloudCoverPct: 5,
        wind10mSpeedKmh: 3
      },
      referenceUrbanFraction: 0.06,
      referenceStationColdPool: 0.96,
      referenceStationIcao: "LTCE"
    });
    expect(ltceToCityUhi.uhiNocturnalOffsetC).toBeGreaterThan(2.5);

    const izmirLikeSpec: ProvinceEngineSpec = {
      ...erzurumSpec,
      provinceCode: "TR-35",
      seaBreeze: {
        enabled: true,
        activeMonths: [4, 10],
        onshoreSectorDeg: { fromDeg: 255, toDeg: 305 },
        maxCoolingC: 3.4,
        inlandDecayScaleKm: 25
      }
    };
    const coastBreeze = computeProvinceMicroclimateOffsetC({
      spec: izmirLikeSpec,
      target: {
        lat: 38.43,
        lon: 27.14,
        elevationM: 12,
        subBasinId: "IZMIR_BAY",
        zone: "coastal_marine",
        urbanFraction: 0.8,
        isCoastal: true,
        coastalDistanceKm: 2
      },
      drivers: {
        localHour: 15,
        month: 7,
        isNight: false,
        cloudCoverPct: 5,
        wind10mDirDeg: 280,
        wind10mSpeedKmh: 20
      }
    });
    const inlandBreeze = computeProvinceMicroclimateOffsetC({
      spec: izmirLikeSpec,
      target: {
        lat: 38.48,
        lon: 27.7,
        elevationM: 85,
        subBasinId: "GEDIZ_INLAND",
        zone: "graben_valley",
        urbanFraction: 0.4,
        isCoastal: false,
        coastalDistanceKm: 50
      },
      drivers: {
        localHour: 15,
        month: 7,
        isNight: false,
        cloudCoverPct: 5,
        wind10mDirDeg: 280,
        wind10mSpeedKmh: 20
      }
    });
    expect(coastBreeze.seaBreezeOffsetC).toBeLessThan(-2.5);
    expect(Math.abs(inlandBreeze.seaBreezeOffsetC)).toBeLessThan(
      Math.abs(coastBreeze.seaBreezeOffsetC) * 0.2
    );
  });

  it("Komşu ilden sızdırılmaya çalışılan sahte istasyonu %100 reddeder ve Tier-A / Tier-B simpleks ağırlıkları -35°C ve +46°C uçlarda ölçek-eşdeğer (sum(w) === 1) + C^1 bimodal uyumlu davranır", () => {
    const rizeSpec = buildRizeSpec();

    const mixedStations: ProvinceLiveStationObs[] = [
      {
        stationId: 17040,
        provinceCode: "TR-53",
        name: "Rize Merkez",
        lat: 41.0201,
        lon: 40.5234,
        elevationM: 8,
        tempC: 14.0,
        relHumidityPct: 76,
        pressureMslHpa: 1016,
        windSpeedKmh: 12,
        windDirDeg: 320,
        qcWeight: 1.0
      },
      {
        stationId: 999999,
        provinceCode: "TR-61", // Komşu Trabzon il kodu!
        name: "Sahte Komşu İl Sızıntısı",
        lat: 41.021,
        lon: 40.524,
        elevationM: 10,
        tempC: -10.0,
        relHumidityPct: 90,
        pressureMslHpa: 1016,
        windSpeedKmh: 40,
        windDirDeg: 180,
        qcWeight: 1.0
      }
    ];

    const surface = solveProvinceTopographicSurface({
      spec: rizeSpec,
      target: { lat: 41.0205, lon: 40.5238, elevationM: 10 },
      stations: mixedStations,
      drivers: {
        localHour: 13,
        month: 11,
        isNight: false,
        cloudCoverPct: 50
      }
    });

    expect(surface).not.toBeNull();
    expect(surface!.acceptedStationCount).toBe(1);
    expect(surface!.rejectedCrossBorderCount).toBe(1);
    expect(surface!.contributions).toHaveLength(1);
    expect(surface!.contributions[0].provinceCode).toBe("TR-53");
    expect(surface!.tempC).toBeCloseTo(14.0, 1);

    const partialCold35: HybridModelSnapshot = {
      ecmwfIfs: -35.0,
      ecmwfAifs: -35.0,
      icon: -35.0,
      ukmo: null,
      meteofrance: null,
      gfs: -35.0,
      gem: -35.0,
      jma: null
    };
    const partialHot46: HybridModelSnapshot = {
      ecmwfIfs: 46.0,
      ecmwfAifs: 46.0,
      icon: 46.0,
      ukmo: null,
      meteofrance: null,
      gfs: 46.0,
      gem: 46.0,
      jma: null
    };

    const rawDonorWeights = {
      ecmwfIfs: 0.28,
      ecmwfAifs: 0.24,
      icon: 0.18,
      ukmo: 0.1,
      meteofrance: 0.08,
      gfs: 0.05,
      gem: 0.04,
      jma: 0.03
    };

    const combCheck = evaluateSimplexCombination(partialCold35, rawDonorWeights);
    expect(combCheck.weightSum).toBeCloseTo(1.0, 6);
    expect(Object.values(combCheck.weights).every((w) => w >= 0)).toBe(true);

    const extremeBounds = {
      minPlausibleTempC: -48,
      maxPlausibleTempC: 52,
      minPlausibleMslpHpa: 955,
      maxPlausibleMslpHpa: 1068,
      kalmanTempBiasCapC: 10.0
    };

    const tierBCold = evaluateProvinceCalibratedHour({
      leadHours: 96,
      localHour: 5,
      qcAndMos: extremeBounds,
      mosPackage: {
        tier: "TIER_B_DONOR_ALARO",
        weights: rawDonorWeights,
        interceptC: 3.9
      },
      tempSnapshot: partialCold35
    });
    const tierBHot = evaluateProvinceCalibratedHour({
      leadHours: 96,
      localHour: 15,
      qcAndMos: extremeBounds,
      mosPackage: {
        tier: "TIER_B_DONOR_ALARO",
        weights: rawDonorWeights,
        interceptC: 3.9
      },
      tempSnapshot: partialHot46
    });

    expect(tierBCold.appliedInterceptC).toBe(0);
    expect(tierBCold.weightSum).toBeCloseTo(1.0, 6);
    expect(tierBCold.temperatureC).toBeCloseTo(-35.0, 4);
    expect(tierBHot.temperatureC).toBeCloseTo(46.0, 4);
    expect(tierBHot.temperatureC - tierBCold.temperatureC).toBeCloseTo(81.0, 4);

    const tierACold = evaluateProvinceCalibratedHour({
      leadHours: 48,
      localHour: 4,
      qcAndMos: extremeBounds,
      mosPackage: {
        tier: "TIER_A_EMPIRICAL_WMO",
        weights: rawDonorWeights,
        interceptC: -0.4,
        betaDrivers: [-1.2, 0.5, 0.3, 0.1],
        maxResidualShiftC: 2.5
      },
      drivers: {
        radiativeClearNight: 1.0,
        solarHeating: 0,
        foehnProjection: 0,
        onshoreSstDeltaC: 0
      },
      tempSnapshot: partialCold35
    });
    const tierAHotSameDrivers = evaluateProvinceCalibratedHour({
      leadHours: 48,
      localHour: 4,
      qcAndMos: extremeBounds,
      mosPackage: {
        tier: "TIER_A_EMPIRICAL_WMO",
        weights: rawDonorWeights,
        interceptC: -0.4,
        betaDrivers: [-1.2, 0.5, 0.3, 0.1],
        maxResidualShiftC: 2.5
      },
      drivers: {
        radiativeClearNight: 1.0,
        solarHeating: 0,
        foehnProjection: 0,
        onshoreSstDeltaC: 0
      },
      tempSnapshot: partialHot46
    });

    expect(tierACold.weightSum).toBeCloseTo(1.0, 6);
    expect(tierACold.temperatureC).toBeCloseTo(-36.6, 2);
    expect(tierAHotSameDrivers.temperatureC - tierACold.temperatureC).toBeCloseTo(81.0, 4);

    // MGM ALARO 4.5 km 0–72s kancası + [0.45, 0.55] C^1 bimodal çözücü entegrasyonu
    const tierBWithAlaro12h = evaluateProvinceCalibratedHour({
      leadHours: 12,
      localHour: 14,
      qcAndMos: extremeBounds,
      mosPackage: {
        tier: "TIER_B_DONOR_ALARO",
        weights: rawDonorWeights,
        alaroBlendMaxWeight: 0.25
      },
      tempSnapshot: uniformSnapshot(10.0),
      mgmAlaroHourly: { tempC: 12.0, isWet: false }
    });
    expect(tierBWithAlaro12h.appliedAlaroBlendWeight).toBeCloseTo(0.25, 2);
    expect(tierBWithAlaro12h.temperatureC).toBeCloseTo(10.5, 2);

    const coldCluster80 = [
      ...Array.from({ length: 80 }, (_, i) => -2.0 + (i % 3) * 0.1),
      ...Array.from({ length: 20 }, (_, i) => 8.0 + (i % 3) * 0.1)
    ];
    const bimodalEval = evaluateProvinceCalibratedHour({
      leadHours: 132,
      localHour: 12,
      qcAndMos: extremeBounds,
      mosPackage: {
        tier: "TIER_B_DONOR_ALARO",
        weights: rawDonorWeights
      },
      tempSnapshot: uniformSnapshot(5.5),
      ensembleTempMembersC: coldCluster80
    });
    expect(bimodalEval.bimodal?.isBimodal).toBe(true);
    expect(bimodalEval.temperatureC).toBeLessThan(-1.2);
  });
});
