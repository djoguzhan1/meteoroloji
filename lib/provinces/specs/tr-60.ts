import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_60 = TR81_CLIMATOLOGY_1991_2020["TR-60"];
const HYPSO_TR_60 = TR81_HYPSOMETRIC_PROFILES["TR-60"];

/**
 * ATMOS v5.0 — Wave 3B (REG-11) Bespoke Microclimate Spec: `TR-60` Tokat
 *
 * Key Physical & Synoptic Mechanisms (3-Step Microclimatic Architecture):
 *  1. Step 1 — Erbaa (198 m) & Niksar (333 m) Kelkit Fault Trough (`TR60_ERBAA_NIKSAR_KELKIT_TROUGH`):
 *     Deep North Anatolian Fault depression sheltered by Canik Mountains, producing a mild
 *     micro-Mediterranean / Black Sea transition climate ~4–6°C warmer than Tokat Merkez in winter.
 *  2. Step 2 — Kazova – Tokat Merkez (611 m) – Turhal (528 m) Basin (`TR60_KAZOVA_YESILIRMAK_BASIN`):
 *     Enclosed Yeşilırmak alluvial valley where Tokat Airport (`LTAW`, ~558 m) experiences strong
 *     nocturnal radiation fog, persistent stratus trapping, and cold-pool inversions.
 *  3. Step 3 — Zile (719 m) – Artova (1,180 m) – Çamlıbel Pass / Başçiftlik (1,414–2,050 m):
 *     Harsh Central Anatolian continental cold plateau (`TR60_ZILE_ARTOVA_CAMLIBEL_PLATEAU`) and
 *     Canik crest ski belt (`TR60_BASCIFTLIK_CANIK_CREST`) decoupled from Erbaa (`0.10` coupling).
 *  4. Calibration & METAR Alignment: `TIER_A_WMO` (`WMO 17086`) and `icaoWhitelist: ["LTAW"]`.
 */
export const PROVINCE_SPEC_TR_60: ProvinceSpec = Object.freeze({
  provinceCode: "TR-60",
  plateCode: 60,
  slug: "tokat",
  nameTr: "Tokat",
  region: "BLACK_SEA_WEST_CENTRAL",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "INLAND_PASS_PLATEAU",
  icaoWhitelist: Object.freeze(["LTAW"]),
  domainBounds: Object.freeze({
    minLat: 39.85,
    maxLat: 40.92,
    minLon: 35.45,
    maxLon: 37.65
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 96001,
    mgmIstNo: 17086,
    mgmSaatlikIstNo: 17086,
    mgmGunlukIstNo: 96001,
    wmoId: "17086",
    lat: 40.3312,
    lon: 36.5577,
    demVerifiedElevationM: 611,
    subBasinId: "TR60_KAZOVA_YESILIRMAK_BASIN",
    urbanFraction: 0.64,
    monthlyTmaxNormalsC: CLIM_TR_60.tmaxC,
    monthlyTminNormalsC: CLIM_TR_60.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-60-erbaa-niksar-kelkit",
      name: "Erbaa / Niksar Kelkit Çöküntü Ovası",
      role: "plain",
      lat: 40.6931,
      lon: 36.58,
      elevationM: 198
    }),
    Object.freeze({
      id: "tr-60-tokat-kazova-merkez",
      name: "Tokat Merkez / Kazova (LTAW)",
      role: "plain",
      lat: 40.3312,
      lon: 36.5577,
      elevationM: 611
    }),
    Object.freeze({
      id: "tr-60-artova-camlibel-plato",
      name: "Artova / Çamlıbel Geçidi Platosu",
      role: "foothill",
      lat: 40.1128,
      lon: 36.3069,
      elevationM: 1180
    }),
    Object.freeze({
      id: "tr-60-basciftlik-kayak",
      name: "Başçiftlik Kayak Merkezi / Topçam Zirve",
      role: "summit",
      lat: 40.551,
      lon: 37.1625,
      elevationM: 1650
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR60_ERBAA_NIKSAR_KELKIT_TROUGH",
      labelTr: "Erbaa – Niksar – Reşadiye Kelkit Çöküntü Oluğu (Mikro-Ilıman Geçiş)",
      polygonOrBbox: Object.freeze({
        minLat: 40.36,
        maxLat: 40.88,
        minLon: 36.32,
        maxLon: 37.58
      }),
      elevationRangeM: Object.freeze([180, 560] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.44
    }),
    Object.freeze({
      id: "TR60_KAZOVA_YESILIRMAK_BASIN",
      labelTr: "Kazova – Tokat Merkez – Pazar – Turhal Yeşilırmak Enversiyon/Sis Ovası",
      polygonOrBbox: Object.freeze({
        minLat: 40.2,
        maxLat: 40.48,
        minLon: 35.98,
        maxLon: 36.75
      }),
      elevationRangeM: Object.freeze([500, 700] as const),
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.52
    }),
    Object.freeze({
      id: "TR60_ZILE_ARTOVA_CAMLIBEL_PLATEAU",
      labelTr: "Zile – Almus – Sulusaray – Yeşilyurt – Artova – Çamlıbel Karasal Soğuk Plato",
      polygonOrBbox: Object.freeze({
        minLat: 39.85,
        maxLat: 40.42,
        minLon: 35.48,
        maxLon: 37.12
      }),
      elevationRangeM: Object.freeze([700, 1380] as const),
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.3
    }),
    Object.freeze({
      id: "TR60_BASCIFTLIK_CANIK_CREST",
      labelTr: "Başçiftlik Kayak / Topçam / Yaylacık – Köse Dağları Zirve Kuşağı",
      polygonOrBbox: Object.freeze({
        minLat: 40.35,
        maxLat: 40.78,
        minLon: 36.68,
        maxLon: 37.48
      }),
      elevationRangeM: Object.freeze([1380, 2416] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.08
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR60_ERBAA_NIKSAR_KELKIT_TROUGH: Object.freeze({
      TR60_ERBAA_NIKSAR_KELKIT_TROUGH: 1.0,
      TR60_KAZOVA_YESILIRMAK_BASIN: 0.28,
      TR60_ZILE_ARTOVA_CAMLIBEL_PLATEAU: 0.1,
      TR60_BASCIFTLIK_CANIK_CREST: 0.22
    }),
    TR60_KAZOVA_YESILIRMAK_BASIN: Object.freeze({
      TR60_ERBAA_NIKSAR_KELKIT_TROUGH: 0.28,
      TR60_KAZOVA_YESILIRMAK_BASIN: 1.0,
      TR60_ZILE_ARTOVA_CAMLIBEL_PLATEAU: 0.36,
      TR60_BASCIFTLIK_CANIK_CREST: 0.2
    }),
    TR60_ZILE_ARTOVA_CAMLIBEL_PLATEAU: Object.freeze({
      TR60_ERBAA_NIKSAR_KELKIT_TROUGH: 0.1,
      TR60_KAZOVA_YESILIRMAK_BASIN: 0.36,
      TR60_ZILE_ARTOVA_CAMLIBEL_PLATEAU: 1.0,
      TR60_BASCIFTLIK_CANIK_CREST: 0.48
    }),
    TR60_BASCIFTLIK_CANIK_CREST: Object.freeze({
      TR60_ERBAA_NIKSAR_KELKIT_TROUGH: 0.22,
      TR60_KAZOVA_YESILIRMAK_BASIN: 0.2,
      TR60_ZILE_ARTOVA_CAMLIBEL_PLATEAU: 0.48,
      TR60_BASCIFTLIK_CANIK_CREST: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17086": Object.freeze({
      stationId: 17086,
      nameTr: "Tokat Merkez (WMO 17086)",
      lat: 40.3312,
      lon: 36.5577,
      demElevationM: 611,
      subBasinId: "TR60_KAZOVA_YESILIRMAK_BASIN",
      urbanFraction: 0.66,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "basin_floor"
    }),
    LTAW: Object.freeze({
      stationId: "LTAW",
      nameTr: "Tokat Havalimanı (Kazova Tabanı)",
      lat: 40.3117,
      lon: 36.3711,
      demElevationM: 558,
      subBasinId: "TR60_KAZOVA_YESILIRMAK_BASIN",
      urbanFraction: 0.1,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "17087": Object.freeze({
      stationId: 17087,
      nameTr: "Tokat Havalimanı (Kazova)",
      lat: 40.3117,
      lon: 36.3711,
      demElevationM: 558,
      subBasinId: "TR60_KAZOVA_YESILIRMAK_BASIN",
      urbanFraction: 0.1,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "17683": Object.freeze({
      stationId: 17683,
      nameTr: "Turhal (Yeşilırmak Ovası)",
      lat: 40.3753,
      lon: 36.0988,
      demElevationM: 528,
      subBasinId: "TR60_KAZOVA_YESILIRMAK_BASIN",
      urbanFraction: 0.52,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "basin_floor"
    }),
    "18142": Object.freeze({
      stationId: 18142,
      nameTr: "Erbaa (Aşağı Kelkit Ovası)",
      lat: 40.6931,
      lon: 36.58,
      demElevationM: 198,
      subBasinId: "TR60_ERBAA_NIKSAR_KELKIT_TROUGH",
      urbanFraction: 0.48,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "18141": Object.freeze({
      stationId: 18141,
      nameTr: "Niksar (Kelkit Ovası)",
      lat: 40.5978,
      lon: 36.9353,
      demElevationM: 333,
      subBasinId: "TR60_ERBAA_NIKSAR_KELKIT_TROUGH",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "17681": Object.freeze({
      stationId: 17681,
      nameTr: "Zile Ovası",
      lat: 40.296,
      lon: 35.8905,
      demElevationM: 719,
      subBasinId: "TR60_ZILE_ARTOVA_CAMLIBEL_PLATEAU",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.64,
      verticalStratumRole: "mid_slope"
    }),
    "18143": Object.freeze({
      stationId: 18143,
      nameTr: "Artova Soğuk Çanağı",
      lat: 40.1128,
      lon: 36.3069,
      demElevationM: 1180,
      subBasinId: "TR60_ZILE_ARTOVA_CAMLIBEL_PLATEAU",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.9,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18553": Object.freeze({
      stationId: 18553,
      nameTr: "Yeşilyurt Platosu",
      lat: 40.0007,
      lon: 36.2108,
      demElevationM: 1135,
      subBasinId: "TR60_ZILE_ARTOVA_CAMLIBEL_PLATEAU",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "17717": Object.freeze({
      stationId: 17717,
      nameTr: "Başçiftlik (Canik Kar Kuşağı)",
      lat: 40.551,
      lon: 37.1625,
      demElevationM: 1414,
      subBasinId: "TR60_BASCIFTLIK_CANIK_CREST",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.2,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([220, 620, 1220, 2050] as const),
    maxPhysicalPeakM: HYPSO_TR_60.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_60.bands
  }),
  waterBodies: Object.freeze([]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR60_CANIK_DONEK_KELKIT_FOEHN_AND_SHADOW",
      labelTr: "Canik – Yaylacık Sırtı Kelkit Fönü & Kazova Kuzey Yağış Gölgesi",
      effectiveBarrierHeightM: 1550,
      crestPressureHpa: 800,
      applicableSubBasins: Object.freeze([
        "TR60_ERBAA_NIKSAR_KELKIT_TROUGH",
        "TR60_KAZOVA_YESILIRMAK_BASIN"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 170, toDeg: 230 }),
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.4,
        sourcePlateauElevationM: 1180,
        maxTargetElevationM: 650,
        maxWarmingCapC: 3.4,
        subCloudVirgaFactor: 0.45,
        wetCutoffMmHr: 1.4
      }),
      upslopeSpec: Object.freeze({
        enabled: false,
        windFromSectorDeg: Object.freeze({ fromDeg: 330, toDeg: 30 }),
        minOnshoreOrUpslopeSpeedMs: 8.0,
        coastalFrictionalConvergenceBoost: 1.0,
        maxPrecipMultiplierCap: 1.08
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 330, toDeg: 35 }),
        precipAttenuationFactor: 0.68
      })
    }),
    Object.freeze({
      id: "TR60_CAMLIBEL_BASCIFTLIK_OROG_SNOW_WALL",
      labelTr: "Çamlıbel Geçidi – Başçiftlik Yüksek Kar Duvarı",
      effectiveBarrierHeightM: 1750,
      crestPressureHpa: 800,
      applicableSubBasins: Object.freeze([
        "TR60_ZILE_ARTOVA_CAMLIBEL_PLATEAU",
        "TR60_BASCIFTLIK_CANIK_CREST"
      ]),
      foehnSpec: Object.freeze({
        enabled: false,
        windFromSectorDeg: Object.freeze({ fromDeg: 180, toDeg: 225 }),
        minCrossCrestSpeedMs: 9.5,
        minFroudeNumber: 0.5,
        sourcePlateauElevationM: 1300,
        maxTargetElevationM: 900,
        maxWarmingCapC: 1.4,
        subCloudVirgaFactor: 0.25,
        wetCutoffMmHr: 1.6
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 315, toDeg: 35 }),
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.12,
        maxPrecipMultiplierCap: 1.56
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR60_KELKIT_ERBAA_NIKSAR_CHANNEL",
      labelTr: "Kelkit Çöküntü Oluğu (Erbaa – Niksar – Reşadiye) Rüzgâr Koridoru",
      centerCoord: Object.freeze({ lat: 40.64, lon: 36.75 }),
      influenceRadiusKm: 18,
      channelAxisFromDeg: 295,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.24,
      gustMultiplier: 1.32,
      suppressesNocturnalInversion: true
    }),
    Object.freeze({
      id: "TR60_CAMLIBEL_PASS_GAP_JET",
      labelTr: "Çamlıbel Geçidi (Tokat – Yıldızeli Eşiği) Geçit Rüzgârı",
      centerCoord: Object.freeze({ lat: 40.015, lon: 36.515 }),
      influenceRadiusKm: 13,
      channelAxisFromDeg: 190,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.26,
      gustMultiplier: 1.36,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 528,
    coldPoolMaxDepthM: 280,
    topographicEnclosureIndex: 0.82,
    deltaPressureTopHpa: 900,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 3.6
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.6
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 340, toDeg: 65 }),
      minWindShearVs850Deg: 80
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.34,
    invertedVDryMicroburstSusceptibility: 0.38,
    coastalWaterspoutSusceptibility: 0.0
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "tokat_merkez_kazova",
      labelTr: "Tokat Merkez (WMO 17086)",
      lat: 40.3312,
      lon: 36.5577,
      elevationM: 611,
      role: "target"
    }),
    Object.freeze({
      key: "kazova_ltaw_floor",
      labelTr: "Kazova / Tokat Havalimanı (LTAW)",
      lat: 40.3117,
      lon: 36.3711,
      elevationM: 558,
      role: "corridor"
    }),
    Object.freeze({
      key: "turhal_west_basin",
      labelTr: "Turhal Batı Yeşilırmak Ovası",
      lat: 40.3753,
      lon: 36.0988,
      elevationM: 528,
      role: "lee_shadow"
    }),
    Object.freeze({
      key: "erbaa_kelkit_low_trough",
      labelTr: "Erbaa Aşağı Kelkit Oluğu (198 m)",
      lat: 40.6931,
      lon: 36.58,
      elevationM: 198,
      role: "corridor"
    }),
    Object.freeze({
      key: "niksar_kelkit_east",
      labelTr: "Niksar Kelkit Geçiş Havzası (333 m)",
      lat: 40.5978,
      lon: 36.9353,
      elevationM: 333,
      role: "corridor"
    }),
    Object.freeze({
      key: "zile_southwest_bench",
      labelTr: "Zile Batı Eşik (719 m)",
      lat: 40.296,
      lon: 35.8905,
      elevationM: 719,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "artova_frost_plateau",
      labelTr: "Artova Karasal Ayaz Platosu (1180 m)",
      lat: 40.1128,
      lon: 36.3069,
      elevationM: 1180,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "camlibel_south_crest",
      labelTr: "Çamlıbel Geçidi / Yeşilyurt Sırtı",
      lat: 40.0007,
      lon: 36.2108,
      elevationM: 1135,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "basciftlik_alpine_snow",
      labelTr: "Başçiftlik Kayak / Topçam Zirve Duvarı",
      lat: 40.551,
      lon: 37.1625,
      elevationM: 1414,
      role: "orographic_wall"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -32,
    maxPlausibleTempC: 44,
    minPlausibleMslpHpa: 970,
    maxPlausibleMslpHpa: 1056,
    kalmanTempBiasCapC: 6.2
  })
});

export default PROVINCE_SPEC_TR_60;
