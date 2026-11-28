import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_52 = TR81_CLIMATOLOGY_1991_2020["TR-52"];
const HYPSO_TR_52 = TR81_HYPSOMETRIC_PROFILES["TR-52"];

/**
 * ATMOS v5.0 — Wave 3B (REG-11) Bespoke Microclimate Spec: `TR-52` Ordu
 *
 * Key Physical & Synoptic Mechanisms:
 *  1. Ünye – Fatsa – Perşembe (Yason Burnu) – Altınordu – Gülyalı Maritime Belt & `LTCB` Sea-Fill Runway:
 *     Ordu-Giresun Airport (`LTCB` / `17616`) sits directly on an artificial Black Sea island in Gülyalı,
 *     exhibiting pure maritime thermal inertia (`coldPoolSusceptibility: 0.02`).
 *  2. Boztepe – Ulubey – Gürgentepe – Çambaşı Yaylası (1,850–2,000 m) Moderate-Steep Orographic Ramp:
 *     Enhances NW/N Black Sea moisture convergence and DEK snowfall while funneling southerly Melet Valley
 *     Foehn warming (`maxWarmingCapC: 4.1°C`) onto Altınordu and Fatsa.
 *  3. Akkuş (1,285 m) – Gürgentepe (1,260 m) – Aybastı – Mesudiye (1,191 m) Interior Snow & Frost Belt:
 *     Decoupled from the mild hazelnut coast (`0.12` barrier coupling vs Mesudiye interior).
 *  4. Calibration & METAR Alignment: `TIER_B_DONOR_KALMAN` (`emos-weights/tr-52.ts`) and
 *     `icaoWhitelist: ["LTCB"]` (`lib/metar-verify.ts`).
 */
export const PROVINCE_SPEC_TR_52: ProvinceSpec = Object.freeze({
  provinceCode: "TR-52",
  plateCode: 52,
  slug: "ordu",
  nameTr: "Ordu",
  region: "BLACK_SEA_EAST",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "EAST_BLACK_SEA_STEEP_OROG",
  icaoWhitelist: Object.freeze(["LTCB"]),
  domainBounds: Object.freeze({
    minLat: 40.3,
    maxLat: 41.24,
    minLon: 36.86,
    maxLon: 38.18
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 95201,
    mgmIstNo: 17033,
    mgmSaatlikIstNo: 17033,
    mgmGunlukIstNo: 95201,
    lat: 40.9838,
    lon: 37.8858,
    demVerifiedElevationM: 5,
    subBasinId: "TR52_UNYE_FATSA_ALTINORDU_COAST",
    urbanFraction: 0.68,
    monthlyTmaxNormalsC: CLIM_TR_52.tmaxC,
    monthlyTminNormalsC: CLIM_TR_52.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-52-altinordu-gulyali-sahil",
      name: "Altınordu / Gülyalı Sahil (LTCB)",
      role: "coast",
      lat: 40.9838,
      lon: 37.8858,
      elevationM: 5
    }),
    Object.freeze({
      id: "tr-52-unye-fatsa-kiyi",
      name: "Ünye / Fatsa Kıyı Şeridi",
      role: "coast",
      lat: 41.143,
      lon: 37.293,
      elevationM: 12
    }),
    Object.freeze({
      id: "tr-52-aybasti-gurgentepe-yayla",
      name: "Aybastı Perşembe Yaylası / Gürgentepe",
      role: "foothill",
      lat: 40.685,
      lon: 37.3991,
      elevationM: 950
    }),
    Object.freeze({
      id: "tr-52-cambasi-kayak",
      name: "Çambaşı Kayak Merkezi / Karagöl Zirve",
      role: "summit",
      lat: 40.6334,
      lon: 37.9359,
      elevationM: 1991
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR52_UNYE_FATSA_ALTINORDU_COAST",
      labelTr: "Ünye – Fatsa – Perşembe (Yason) – Altınordu – Gülyalı (LTCB) Kıyı Kuşağı",
      polygonOrBbox: Object.freeze({
        minLat: 40.93,
        maxLat: 41.24,
        minLon: 36.98,
        maxLon: 38.16
      }),
      elevationRangeM: Object.freeze([0, 160] as const),
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.58
    }),
    Object.freeze({
      id: "TR52_BOZTEPE_ULUBEY_MID_RAMP",
      labelTr: "Boztepe – Ulubey – Kumru – Korgan Orta Orografik Yamaç Rampası",
      polygonOrBbox: Object.freeze({
        minLat: 40.74,
        maxLat: 41.06,
        minLon: 37.02,
        maxLon: 38.05
      }),
      elevationRangeM: Object.freeze([160, 920] as const),
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.24
    }),
    Object.freeze({
      id: "TR52_AKKUS_MESUDIYE_INTERIOR_PLATEAU",
      labelTr: "Akkuş – Gürgentepe – Aybastı – Gölköy – Mesudiye İç Plato Kar Kuşağı",
      polygonOrBbox: Object.freeze({
        minLat: 40.3,
        maxLat: 40.86,
        minLon: 36.88,
        maxLon: 37.92
      }),
      elevationRangeM: Object.freeze([740, 1550] as const),
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.22
    }),
    Object.freeze({
      id: "TR52_CAMBASI_KARAGOL_ALPINE",
      labelTr: "Çambaşı Yaylası / Kayak Merkezi (1991 m) & Karagöl Alpin Sırtı",
      polygonOrBbox: Object.freeze({
        minLat: 40.48,
        maxLat: 40.74,
        minLon: 37.75,
        maxLon: 38.16
      }),
      elevationRangeM: Object.freeze([1550, 3107] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.04
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR52_UNYE_FATSA_ALTINORDU_COAST: Object.freeze({
      TR52_UNYE_FATSA_ALTINORDU_COAST: 1.0,
      TR52_BOZTEPE_ULUBEY_MID_RAMP: 0.58,
      TR52_AKKUS_MESUDIYE_INTERIOR_PLATEAU: 0.12,
      TR52_CAMBASI_KARAGOL_ALPINE: 0.16
    }),
    TR52_BOZTEPE_ULUBEY_MID_RAMP: Object.freeze({
      TR52_UNYE_FATSA_ALTINORDU_COAST: 0.58,
      TR52_BOZTEPE_ULUBEY_MID_RAMP: 1.0,
      TR52_AKKUS_MESUDIYE_INTERIOR_PLATEAU: 0.42,
      TR52_CAMBASI_KARAGOL_ALPINE: 0.36
    }),
    TR52_AKKUS_MESUDIYE_INTERIOR_PLATEAU: Object.freeze({
      TR52_UNYE_FATSA_ALTINORDU_COAST: 0.12,
      TR52_BOZTEPE_ULUBEY_MID_RAMP: 0.42,
      TR52_AKKUS_MESUDIYE_INTERIOR_PLATEAU: 1.0,
      TR52_CAMBASI_KARAGOL_ALPINE: 0.52
    }),
    TR52_CAMBASI_KARAGOL_ALPINE: Object.freeze({
      TR52_UNYE_FATSA_ALTINORDU_COAST: 0.16,
      TR52_BOZTEPE_ULUBEY_MID_RAMP: 0.36,
      TR52_AKKUS_MESUDIYE_INTERIOR_PLATEAU: 0.52,
      TR52_CAMBASI_KARAGOL_ALPINE: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17033": Object.freeze({
      stationId: 17033,
      nameTr: "Ordu Merkez (Altınordu)",
      lat: 40.9838,
      lon: 37.8858,
      demElevationM: 5,
      subBasinId: "TR52_UNYE_FATSA_ALTINORDU_COAST",
      urbanFraction: 0.68,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "basin_floor"
    }),
    LTCB: Object.freeze({
      stationId: "LTCB",
      nameTr: "Ordu-Giresun Havalimanı (Gülyalı Deniz Dolgusu)",
      lat: 40.967,
      lon: 38.0815,
      demElevationM: 3,
      subBasinId: "TR52_UNYE_FATSA_ALTINORDU_COAST",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.02,
      verticalStratumRole: "coastal_or_gap"
    }),
    "17616": Object.freeze({
      stationId: 17616,
      nameTr: "Gülyalı / Ordu-Giresun Havalimanı",
      lat: 40.9646,
      lon: 38.0842,
      demElevationM: 3,
      subBasinId: "TR52_UNYE_FATSA_ALTINORDU_COAST",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.02,
      verticalStratumRole: "coastal_or_gap"
    }),
    "17461": Object.freeze({
      stationId: 17461,
      nameTr: "Perşembe (Yasonburnu Feneri)",
      lat: 41.066,
      lon: 37.7739,
      demElevationM: 4,
      subBasinId: "TR52_UNYE_FATSA_ALTINORDU_COAST",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.02,
      verticalStratumRole: "coastal_or_gap"
    }),
    "17624": Object.freeze({
      stationId: 17624,
      nameTr: "Ünye Kıyı",
      lat: 41.143,
      lon: 37.293,
      demElevationM: 16,
      subBasinId: "TR52_UNYE_FATSA_ALTINORDU_COAST",
      urbanFraction: 0.56,
      coldPoolSusceptibility: 0.06,
      verticalStratumRole: "coastal_or_gap"
    }),
    "17689": Object.freeze({
      stationId: 17689,
      nameTr: "Fatsa Kıyı",
      lat: 41.0405,
      lon: 37.4878,
      demElevationM: 7,
      subBasinId: "TR52_UNYE_FATSA_ALTINORDU_COAST",
      urbanFraction: 0.58,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "coastal_or_gap"
    }),
    "18534": Object.freeze({
      stationId: 18534,
      nameTr: "Ulubey Orta Yamaç",
      lat: 40.8733,
      lon: 37.7528,
      demElevationM: 607,
      subBasinId: "TR52_BOZTEPE_ULUBEY_MID_RAMP",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "mid_slope"
    }),
    "18131": Object.freeze({
      stationId: 18131,
      nameTr: "Akkuş (Canik Kar Kuşağı)",
      lat: 40.7906,
      lon: 37.0181,
      demElevationM: 1285,
      subBasinId: "TR52_AKKUS_MESUDIYE_INTERIOR_PLATEAU",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18528": Object.freeze({
      stationId: 18528,
      nameTr: "Gürgentepe Geçidi",
      lat: 40.7861,
      lon: 37.5928,
      demElevationM: 1260,
      subBasinId: "TR52_AKKUS_MESUDIYE_INTERIOR_PLATEAU",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18532": Object.freeze({
      stationId: 18532,
      nameTr: "Mesudiye (İç Melet Vadisi)",
      lat: 40.4661,
      lon: 37.776,
      demElevationM: 1191,
      subBasinId: "TR52_AKKUS_MESUDIYE_INTERIOR_PLATEAU",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18525": Object.freeze({
      stationId: 18525,
      nameTr: "Çambaşı Kayak Merkezi",
      lat: 40.6334,
      lon: 37.9359,
      demElevationM: 1991,
      subBasinId: "TR52_CAMBASI_KARAGOL_ALPINE",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([5, 450, 1250, 1991] as const),
    maxPhysicalPeakM: HYPSO_TR_52.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_52.bands
  }),
  waterBodies: Object.freeze([
    Object.freeze({
      id: "TR52_CENTRAL_EAST_BLACK_SEA",
      labelTr: "Orta–Doğu Karadeniz (Ünye – Yason Burnu – Altınordu – Gülyalı)",
      kind: "open_sea",
      mgmMarineStationIds: Object.freeze([17033, 17397, 17460, 17461, 17616]),
      sampleCoord: Object.freeze({ lat: 41.05, lon: 37.85 }),
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.0,
      monthlyWaterTempNormalsC: Object.freeze([
        9.2, 8.4, 8.8, 11.3, 15.8, 20.7, 24.5, 25.4, 22.9, 19.0, 14.7, 11.2
      ] as const),
      subBasinInfluenceWeights: Object.freeze({
        TR52_UNYE_FATSA_ALTINORDU_COAST: 1.0,
        TR52_BOZTEPE_ULUBEY_MID_RAMP: 0.65,
        TR52_AKKUS_MESUDIYE_INTERIOR_PLATEAU: 0.14,
        TR52_CAMBASI_KARAGOL_ALPINE: 0.28
      }),
      onshoreWindSectorDeg: Object.freeze({ fromDeg: 295, toDeg: 40 }),
      effectiveFetchKm: 410,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 11.5,
      dekHeavyDeltaTC: 14.5,
      seaBreezeSpec: Object.freeze({
        activeMonths: Object.freeze([5, 9] as const),
        sectorDeg: Object.freeze({ fromDeg: 315, toDeg: 35 }),
        maxInlandPenetrationKm: 20,
        maxCoolingAmplitudeC: 2.3
      })
    })
  ]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR52_CANIK_CAMBASI_OROG_AND_FOEHN",
      labelTr: "Canik – Çambaşı (2000 m) Orografik Rampa & Melet Vadisi Güneyli Fönü",
      effectiveBarrierHeightM: 1950,
      crestPressureHpa: 800,
      applicableSubBasins: Object.freeze([
        "TR52_UNYE_FATSA_ALTINORDU_COAST",
        "TR52_BOZTEPE_ULUBEY_MID_RAMP",
        "TR52_CAMBASI_KARAGOL_ALPINE"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 160, toDeg: 225 }),
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.38,
        sourcePlateauElevationM: 1180,
        maxTargetElevationM: 350,
        maxWarmingCapC: 4.1,
        subCloudVirgaFactor: 0.48,
        wetCutoffMmHr: 1.5
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 295, toDeg: 40 }),
        minOnshoreOrUpslopeSpeedMs: 4.8,
        coastalFrictionalConvergenceBoost: 1.28,
        maxPrecipMultiplierCap: 1.76
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 165, toDeg: 220 }),
        precipAttenuationFactor: 0.64
      })
    }),
    Object.freeze({
      id: "TR52_MESUDIYE_LEE_SHADOW",
      labelTr: "Mesudiye İç Melet Havzası Kuzey Yağış Sönümlemesi",
      effectiveBarrierHeightM: 1750,
      crestPressureHpa: 800,
      applicableSubBasins: Object.freeze(["TR52_AKKUS_MESUDIYE_INTERIOR_PLATEAU"]),
      foehnSpec: Object.freeze({
        enabled: false,
        windFromSectorDeg: Object.freeze({ fromDeg: 330, toDeg: 20 }),
        minCrossCrestSpeedMs: 10.0,
        minFroudeNumber: 0.5,
        sourcePlateauElevationM: 1300,
        maxTargetElevationM: 1000,
        maxWarmingCapC: 1.2,
        subCloudVirgaFactor: 0.2,
        wetCutoffMmHr: 1.8
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 315, toDeg: 35 }),
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 1.0,
        maxPrecipMultiplierCap: 1.32
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 175, toDeg: 235 }),
        precipAttenuationFactor: 0.72
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR52_YASON_CAPE_MARINE_JET",
      labelTr: "Yason Burnu – Perşembe Kıyı Burun İvmelenmesi",
      centerCoord: Object.freeze({ lat: 41.095, lon: 37.72 }),
      influenceRadiusKm: 15,
      channelAxisFromDeg: 300,
      bidirectional: true,
      sectorHalfWidthDeg: 35,
      speedMultiplier: 1.26,
      gustMultiplier: 1.36,
      suppressesNocturnalInversion: true
    }),
    Object.freeze({
      id: "TR52_MELET_VALLEY_FOEHN_JET",
      labelTr: "Melet Irmağı Vadisi (Mesudiye – Kabadüz – Altınordu) Fön Kanalı",
      centerCoord: Object.freeze({ lat: 40.86, lon: 37.89 }),
      influenceRadiusKm: 13,
      channelAxisFromDeg: 185,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.24,
      gustMultiplier: 1.34,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 5,
    coldPoolMaxDepthM: 220,
    topographicEnclosureIndex: 0.58,
    deltaPressureTopHpa: 950,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 2.8
    }),
    persistentStratusLock: Object.freeze({
      enabled: false,
      daytimeSolarDampingFactor: 0.8
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.24,
    invertedVDryMicroburstSusceptibility: 0.2,
    coastalWaterspoutSusceptibility: 0.6
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "altinordu_center_coast",
      labelTr: "Altınordu Merkez Kıyı",
      lat: 40.9838,
      lon: 37.8858,
      elevationM: 5,
      role: "target"
    }),
    Object.freeze({
      key: "persembe_yason_marine_upwind",
      labelTr: "Yason Burnu / Perşembe Karadeniz Rüzgâr-Üstü",
      lat: 41.115,
      lon: 37.76,
      elevationM: 2,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "gulyali_ltcb_sea_runway",
      labelTr: "Gülyalı Ordu-Giresun Havalimanı (LTCB)",
      lat: 40.9646,
      lon: 38.0842,
      elevationM: 3,
      role: "corridor"
    }),
    Object.freeze({
      key: "unye_fatsa_west_coast",
      labelTr: "Ünye – Fatsa Batı Kıyı Koridoru",
      lat: 41.0405,
      lon: 37.4878,
      elevationM: 7,
      role: "corridor"
    }),
    Object.freeze({
      key: "ulubey_kabaduz_ramp",
      labelTr: "Ulubey – Kabadüz Orta Yamaç",
      lat: 40.8733,
      lon: 37.7528,
      elevationM: 607,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "gurgentepe_pass_ridge",
      labelTr: "Gürgentepe – Gölköy Kar Eşiği",
      lat: 40.7861,
      lon: 37.5928,
      elevationM: 1260,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "akkus_west_canik_snow",
      labelTr: "Akkuş Batı Canik Sırtı",
      lat: 40.7906,
      lon: 37.0181,
      elevationM: 1285,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "cambasi_ski_summit",
      labelTr: "Çambaşı Kayak Merkezi Zirve (1991 m)",
      lat: 40.6334,
      lon: 37.9359,
      elevationM: 1991,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "mesudiye_melet_interior",
      labelTr: "Mesudiye İç Melet Fön/Gölge Havzası",
      lat: 40.4661,
      lon: 37.776,
      elevationM: 1191,
      role: "foehn_windward"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -28,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 974,
    maxPlausibleMslpHpa: 1052,
    kalmanTempBiasCapC: 5.5
  })
});

export default PROVINCE_SPEC_TR_52;
