import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_11 = TR81_CLIMATOLOGY_1991_2020["TR-11"];
const HYPSO_TR_11 = TR81_HYPSOMETRIC_PROFILES["TR-11"];

/**
 * Wave 3A (REG-03) — `TR-11` Bilecik Bespoke Physical & Microclimatic Specification:
 *  - Sharp Marmara–Central Anatolia Escarpment Step: transitions within 35 km from
 *    Osmaneli (96 m) / İnhisar (202 m) mild Sakarya Gorge microclimate up through
 *    Bilecik Merkez (539 m) to Bozüyük (754 m) & Pazaryeri (825 m) continental snow/frost plateau.
 *  - Landlocked (`waterBodies: []`) & Strict Zero-Leakage METAR Policy (`icaoWhitelist: []`):
 *    blocks Bursa Yenişehir (`LTBR`, `TR-16`) and Eskişehir (`LTBY`/`LTBI`, `TR-26`).
 *  - Calibration Tier: `TIER_B_DONOR_KALMAN` (`wmoId` intentionally omitted — explicitly rejects
 *    the Meteostat `17120` Ankara/Akıncı archive trap while retaining MGM live `mgmIstNo: 17120`).
 */
export const PROVINCE_SPEC_TR_11: ProvinceSpec = Object.freeze({
  provinceCode: "TR-11",
  plateCode: 11,
  slug: "bilecik",
  nameTr: "Bilecik",
  region: "MARMARA",
  climateRegion: "MARMARA",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "INLAND_PASS_PLATEAU",
  icaoWhitelist: Object.freeze([]),
  domainBounds: Object.freeze({
    minLat: 39.65,
    maxLat: 40.53,
    minLon: 29.71,
    maxLon: 30.68
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 91101,
    mgmIstNo: 17120,
    mgmSaatlikIstNo: 17120,
    mgmGunlukIstNo: 91101,
    lat: 40.1414,
    lon: 29.9772,
    demVerifiedElevationM: 539,
    subBasinId: "TR11_BILECIK_MID_BENCH",
    urbanFraction: 0.56,
    monthlyTmaxNormalsC: CLIM_TR_11.tmaxC,
    monthlyTminNormalsC: CLIM_TR_11.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "bilecik-osmaneli-vadi",
      name: "Osmaneli (Sakarya Boğazı)",
      role: "plain",
      lat: 40.3628,
      lon: 30.0064,
      elevationM: 96
    }),
    Object.freeze({
      id: "bilecik-merkez",
      name: "Bilecik Merkez",
      role: "plain",
      lat: 40.1414,
      lon: 29.9772,
      elevationM: 539
    }),
    Object.freeze({
      id: "bilecik-bozuyuk-plato",
      name: "Bozüyük / Pazaryeri Platosu",
      role: "foothill",
      lat: 39.9039,
      lon: 30.0525,
      elevationM: 754
    }),
    Object.freeze({
      id: "bilecik-komursu-sirti",
      name: "Bozüyük Kömürsu / Metristepe Sırtı",
      role: "summit",
      lat: 39.828,
      lon: 29.885,
      elevationM: 1520
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR11_OSMANELI_SAKARYA_GORGE",
      labelTr: "Osmaneli – İnhisar Derin Sakarya Boğazı Mikrokliması",
      polygonOrBbox: Object.freeze({
        minLat: 40.04,
        maxLat: 40.53,
        minLon: 29.92,
        maxLon: 30.48
      }),
      elevationRangeM: Object.freeze([80, 290] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.34
    }),
    Object.freeze({
      id: "TR11_BILECIK_MID_BENCH",
      labelTr: "Bilecik Merkez – Gölpazarı – Söğüt – Yenipazar Orta Eşik",
      polygonOrBbox: Object.freeze({
        minLat: 39.98,
        maxLat: 40.36,
        minLon: 29.88,
        maxLon: 30.65
      }),
      elevationRangeM: Object.freeze([300, 710] as const),
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.48
    }),
    Object.freeze({
      id: "TR11_BOZUYUK_PAZARYERI_PLATEAU",
      labelTr: "Bozüyük – Pazaryeri İç Anadolu Kar/Ayaz Platosu",
      polygonOrBbox: Object.freeze({
        minLat: 39.72,
        maxLat: 40.04,
        minLon: 29.74,
        maxLon: 30.28
      }),
      elevationRangeM: Object.freeze([710, 1120] as const),
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.44
    }),
    Object.freeze({
      id: "TR11_KOMURSU_METRISTEPE_RIDGE",
      labelTr: "Kömürsu – Dodurga – Metristepe Yüksek Orman Sırtı",
      polygonOrBbox: Object.freeze({
        minLat: 39.68,
        maxLat: 39.96,
        minLon: 29.72,
        maxLon: 30.14
      }),
      elevationRangeM: Object.freeze([1120, 1906] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.06
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR11_OSMANELI_SAKARYA_GORGE: Object.freeze({
      TR11_OSMANELI_SAKARYA_GORGE: 1.0,
      TR11_BILECIK_MID_BENCH: 0.32,
      TR11_BOZUYUK_PAZARYERI_PLATEAU: 0.1,
      TR11_KOMURSU_METRISTEPE_RIDGE: 0.08
    }),
    TR11_BILECIK_MID_BENCH: Object.freeze({
      TR11_OSMANELI_SAKARYA_GORGE: 0.32,
      TR11_BILECIK_MID_BENCH: 1.0,
      TR11_BOZUYUK_PAZARYERI_PLATEAU: 0.48,
      TR11_KOMURSU_METRISTEPE_RIDGE: 0.28
    }),
    TR11_BOZUYUK_PAZARYERI_PLATEAU: Object.freeze({
      TR11_OSMANELI_SAKARYA_GORGE: 0.1,
      TR11_BILECIK_MID_BENCH: 0.48,
      TR11_BOZUYUK_PAZARYERI_PLATEAU: 1.0,
      TR11_KOMURSU_METRISTEPE_RIDGE: 0.54
    }),
    TR11_KOMURSU_METRISTEPE_RIDGE: Object.freeze({
      TR11_OSMANELI_SAKARYA_GORGE: 0.08,
      TR11_BILECIK_MID_BENCH: 0.28,
      TR11_BOZUYUK_PAZARYERI_PLATEAU: 0.54,
      TR11_KOMURSU_METRISTEPE_RIDGE: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17120": Object.freeze({
      stationId: 17120,
      nameTr: "Bilecik Merkez",
      lat: 40.1414,
      lon: 29.9772,
      demElevationM: 539,
      subBasinId: "TR11_BILECIK_MID_BENCH",
      urbanFraction: 0.56,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "basin_floor"
    }),
    "18087": Object.freeze({
      stationId: 18087,
      nameTr: "Osmaneli (Sakarya Boğazı)",
      lat: 40.3628,
      lon: 30.0064,
      demElevationM: 96,
      subBasinId: "TR11_OSMANELI_SAKARYA_GORGE",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "18380": Object.freeze({
      stationId: 18380,
      nameTr: "İnhisar (Orta Sakarya Vadisi)",
      lat: 40.0767,
      lon: 30.3825,
      demElevationM: 202,
      subBasinId: "TR11_OSMANELI_SAKARYA_GORGE",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "17702": Object.freeze({
      stationId: 17702,
      nameTr: "Bozüyük Platosu",
      lat: 39.9039,
      lon: 30.0525,
      demElevationM: 754,
      subBasinId: "TR11_BOZUYUK_PAZARYERI_PLATEAU",
      urbanFraction: 0.52,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "mid_slope"
    }),
    "17701": Object.freeze({
      stationId: 17701,
      nameTr: "Pazaryeri Çanağı",
      lat: 39.9938,
      lon: 29.9114,
      demElevationM: 825,
      subBasinId: "TR11_BOZUYUK_PAZARYERI_PLATEAU",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "mid_slope"
    }),
    "17703": Object.freeze({
      stationId: 17703,
      nameTr: "Söğüt Eşiği",
      lat: 40.0205,
      lon: 30.185,
      demElevationM: 695,
      subBasinId: "TR11_BILECIK_MID_BENCH",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "mid_slope"
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([100, 540, 880, 1520] as const),
    maxPhysicalPeakM: HYPSO_TR_11.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_11.bands
  }),
  waterBodies: Object.freeze([]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR11_BOZUYUK_ANATOLIAN_ESCARPMENT",
      labelTr: "Bozüyük – Pazaryeri – Kömürsu İç Anadolu Basamak Duvarı",
      effectiveBarrierHeightM: 1380,
      crestPressureHpa: 850,
      applicableSubBasins: Object.freeze([
        "TR11_OSMANELI_SAKARYA_GORGE",
        "TR11_BILECIK_MID_BENCH",
        "TR11_BOZUYUK_PAZARYERI_PLATEAU",
        "TR11_KOMURSU_METRISTEPE_RIDGE"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 185, toDeg: 240 }),
        minCrossCrestSpeedMs: 8.0,
        minFroudeNumber: 0.45,
        sourcePlateauElevationM: 780,
        maxTargetElevationM: 280,
        maxWarmingCapC: 2.6,
        subCloudVirgaFactor: 0.38,
        wetCutoffMmHr: 1.5
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 325, toDeg: 45 }),
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.14,
        maxPrecipMultiplierCap: 1.54
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 245, toDeg: 320 }),
        precipAttenuationFactor: 0.78
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR11_KARASU_VALLEY_PASS",
      labelTr: "Karasu Vadisi (Bozüyük – Bilecik – Osmaneli Geçit Kanalı)",
      centerCoord: Object.freeze({ lat: 40.065, lon: 30.005 }),
      influenceRadiusKm: 14,
      channelAxisFromDeg: 190,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.25,
      gustMultiplier: 1.34,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 96,
    coldPoolMaxDepthM: 260,
    topographicEnclosureIndex: 0.76,
    deltaPressureTopHpa: 925,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 3.4
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.64
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 350, toDeg: 75 }),
      minWindShearVs850Deg: 80
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.28,
    invertedVDryMicroburstSusceptibility: 0.32,
    coastalWaterspoutSusceptibility: 0.0
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "bilecik_center_bench",
      labelTr: "Bilecik Merkez Eşik",
      lat: 40.1414,
      lon: 29.9772,
      elevationM: 539,
      role: "target"
    }),
    Object.freeze({
      key: "osmaneli_sakarya_gorge",
      labelTr: "Osmaneli Sakarya Boğazı (96 m)",
      lat: 40.3628,
      lon: 30.0064,
      elevationM: 96,
      role: "corridor"
    }),
    Object.freeze({
      key: "bozuyuk_continental_plateau",
      labelTr: "Bozüyük İç Anadolu Basamağı (754 m)",
      lat: 39.9039,
      lon: 30.0525,
      elevationM: 754,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "pazaryeri_frost_polje",
      labelTr: "Pazaryeri Yüksek Çanak (825 m)",
      lat: 39.9938,
      lon: 29.9114,
      elevationM: 825,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "komursu_summit_ridge",
      labelTr: "Bozüyük Kömürsu / Dodurga Zirve Sırtı",
      lat: 39.828,
      lon: 29.885,
      elevationM: 1520,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "sogut_south_plateau",
      labelTr: "Söğüt Güneydoğu Platosu",
      lat: 40.0205,
      lon: 30.185,
      elevationM: 695,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "golpazari_east_basin",
      labelTr: "Gölpazarı Havzası",
      lat: 40.275,
      lon: 30.3297,
      elevationM: 537,
      role: "corridor"
    }),
    Object.freeze({
      key: "inhisar_middle_sakarya",
      labelTr: "İnhisar Orta Sakarya Vadisi",
      lat: 40.0767,
      lon: 30.3825,
      elevationM: 202,
      role: "lee_shadow"
    }),
    Object.freeze({
      key: "yenipazar_east_bench",
      labelTr: "Yenipazar Doğu Eşik",
      lat: 40.1678,
      lon: 30.5186,
      elevationM: 668,
      role: "corridor"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -26,
    maxPlausibleTempC: 44,
    minPlausibleMslpHpa: 972,
    maxPlausibleMslpHpa: 1052,
    kalmanTempBiasCapC: 5.8
  })
});

export default PROVINCE_SPEC_TR_11;
