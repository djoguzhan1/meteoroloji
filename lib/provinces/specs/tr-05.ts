import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_05 = TR81_CLIMATOLOGY_1991_2020["TR-05"];
const HYPSO_TR_05 = TR81_HYPSOMETRIC_PROFILES["TR-05"];

/**
 * Calibration & microclimate disambiguation metadata for `TR-05` Amasya (`TIER_A_WMO`, WMO `17082`):
 * Decouples the sheltered Yeşilırmak–Harşena orchard canyon (`17085`, `~410 m`) from the wind-exposed
 * Merzifon aerodrome plain (`17082` / `LTAP`, `535 m`) and the Akdağ (`2,062 m`) snow massif.
 */
export const TR_05_MICROCLIMATE_META = Object.freeze({
  provinceCode: "TR-05",
  wmoStationId: "17082",
  canyonCenterStationId: 17085,
  merzifonAerodromeIcao: "LTAP",
  akdagPeakElevationM: 2062
});

const SPEC_TR_05_ENGINE = Object.freeze({
  provinceCode: "TR-05",
  plateCode: 5,
  slug: "amasya",
  nameTr: "Amasya",
  region: "BLACK_SEA_WEST_CENTRAL",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "INLAND_PASS_PLATEAU",
  icaoWhitelist: Object.freeze(["LTAP"]),
  domainBounds: Object.freeze({
    minLat: 40.26,
    maxLat: 41.08,
    minLon: 34.94,
    maxLon: 36.64
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 90501,
    mgmIstNo: 17085,
    mgmSaatlikIstNo: 17085,
    mgmGunlukIstNo: 90501,
    wmoId: "17082",
    lat: 40.6668,
    lon: 35.8353,
    demVerifiedElevationM: 412,
    subBasinId: "yesilirmak_harsena_canyon",
    urbanFraction: 0.62,
    monthlyTmaxNormalsC: CLIM_TR_05.tmaxC,
    monthlyTminNormalsC: CLIM_TR_05.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-05-tasova-yesilirmak-bogazi",
      name: "Taşova – Yeşilırmak Alt Kanyon Vadisi",
      role: "coast",
      lat: 40.7582,
      lon: 36.3442,
      elevationM: 250
    }),
    Object.freeze({
      id: "tr-05-amasya-harsena-kanyon",
      name: "Amasya Merkez (Harşena Kanyonu ~412m)",
      role: "plain",
      lat: 40.6668,
      lon: 35.8353,
      elevationM: 412
    }),
    Object.freeze({
      id: "tr-05-merzifon-ltap-ova",
      name: "Merzifon – Suluova Açık Rüzgârlı Havza (LTAP)",
      role: "foothill",
      lat: 40.824,
      lon: 35.5086,
      elevationM: 535
    }),
    Object.freeze({
      id: "tr-05-akdag-tavsandagi-zirve",
      name: "Akdağ (2062m) & Tavşan Dağı Yüksek Kar Kuşağı",
      role: "summit",
      lat: 40.7684,
      lon: 35.8953,
      elevationM: 1850
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "yesilirmak_harsena_canyon",
      labelTr: "Yeşilırmak – Harşena – Taşova Ilıman Meyve Kanyonu (~240–495m)",
      polygonOrBbox: Object.freeze({
        minLat: 40.55,
        maxLat: 40.84,
        minLon: 35.62,
        maxLon: 36.58
      }),
      elevationRangeM: Object.freeze([220, 510] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.56
    }),
    Object.freeze({
      id: "merzifon_suluova_open_plain",
      labelTr: "Merzifon (LTAP) – Suluova – Gümüşhacıköy Açık Rüzgârlı Ova",
      polygonOrBbox: Object.freeze({
        minLat: 40.7,
        maxLat: 40.94,
        minLon: 34.98,
        maxLon: 35.72
      }),
      elevationRangeM: Object.freeze([490, 890] as const),
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.34
    }),
    Object.freeze({
      id: "goynucek_cekerek_valley",
      labelTr: "Göynücek – Çekerek Güney Vadi Çanağı",
      polygonOrBbox: Object.freeze({
        minLat: 40.28,
        maxLat: 40.56,
        minLon: 35.34,
        maxLon: 35.78
      }),
      elevationRangeM: Object.freeze([460, 860] as const),
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.22
    }),
    Object.freeze({
      id: "akdag_tavsandagi_alpine",
      labelTr: "Akdağ (2062m) – Tavşan Dağı – Boraboy Yüksek Kar Kuşağı",
      polygonOrBbox: Object.freeze({
        minLat: 40.62,
        maxLat: 41.05,
        minLon: 35.28,
        maxLon: 36.28
      }),
      elevationRangeM: Object.freeze([950, 2062] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.04
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    yesilirmak_harsena_canyon: Object.freeze({
      yesilirmak_harsena_canyon: 1.0,
      merzifon_suluova_open_plain: 0.42,
      goynucek_cekerek_valley: 0.58,
      akdag_tavsandagi_alpine: 0.26
    }),
    merzifon_suluova_open_plain: Object.freeze({
      yesilirmak_harsena_canyon: 0.42,
      merzifon_suluova_open_plain: 1.0,
      goynucek_cekerek_valley: 0.48,
      akdag_tavsandagi_alpine: 0.38
    }),
    goynucek_cekerek_valley: Object.freeze({
      yesilirmak_harsena_canyon: 0.58,
      merzifon_suluova_open_plain: 0.48,
      goynucek_cekerek_valley: 1.0,
      akdag_tavsandagi_alpine: 0.28
    }),
    akdag_tavsandagi_alpine: Object.freeze({
      yesilirmak_harsena_canyon: 0.26,
      merzifon_suluova_open_plain: 0.38,
      goynucek_cekerek_valley: 0.28,
      akdag_tavsandagi_alpine: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17085": Object.freeze({
      stationId: 17085,
      nameTr: "Amasya Merkez (Harşena Kanyonu)",
      lat: 40.6668,
      lon: 35.8353,
      demElevationM: 409,
      subBasinId: "yesilirmak_harsena_canyon",
      urbanFraction: 0.64,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "basin_floor"
    }),
    "18138": Object.freeze({
      stationId: 18138,
      nameTr: "Taşova (Yeşilırmak Alt Vadi 250m)",
      lat: 40.7582,
      lon: 36.3442,
      demElevationM: 250,
      subBasinId: "yesilirmak_harsena_canyon",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.32,
      verticalStratumRole: "basin_floor"
    }),
    "17655": Object.freeze({
      stationId: 17655,
      nameTr: "Amasya / Gökhöyük TİGEM",
      lat: 40.5875,
      lon: 35.6517,
      demElevationM: 475,
      subBasinId: "yesilirmak_harsena_canyon",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "basin_floor"
    }),
    "17082": Object.freeze({
      stationId: 17082,
      nameTr: "Amasya Merzifon Havalimanı (WMO 17082 / LTAP)",
      lat: 40.824,
      lon: 35.5086,
      demElevationM: 535,
      subBasinId: "merzifon_suluova_open_plain",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.74,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    LTAP: Object.freeze({
      stationId: "LTAP",
      nameTr: "Merzifon Havalimanı METAR (LTAP)",
      lat: 40.824,
      lon: 35.5086,
      demElevationM: 535,
      subBasinId: "merzifon_suluova_open_plain",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.74,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "17083": Object.freeze({
      stationId: 17083,
      nameTr: "Merzifon İlçe Merkezi",
      lat: 40.8793,
      lon: 35.4585,
      demElevationM: 754,
      subBasinId: "merzifon_suluova_open_plain",
      urbanFraction: 0.52,
      coldPoolSusceptibility: 0.42,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18137": Object.freeze({
      stationId: 18137,
      nameTr: "Suluova Açık Ova",
      lat: 40.8153,
      lon: 35.6635,
      demElevationM: 514,
      subBasinId: "merzifon_suluova_open_plain",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18505": Object.freeze({
      stationId: 18505,
      nameTr: "Gümüşhacıköy",
      lat: 40.8468,
      lon: 35.1803,
      demElevationM: 865,
      subBasinId: "merzifon_suluova_open_plain",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18504": Object.freeze({
      stationId: 18504,
      nameTr: "Göynücek",
      lat: 40.402,
      lon: 35.5344,
      demElevationM: 504,
      subBasinId: "goynucek_cekerek_valley",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.66,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "19025": Object.freeze({
      stationId: 19025,
      nameTr: "Taşova / Boraboy Orman Sahası",
      lat: 40.8594,
      lon: 36.1031,
      demElevationM: 1157,
      subBasinId: "akdag_tavsandagi_alpine",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.26,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "19218": Object.freeze({
      stationId: 19218,
      nameTr: "Amasya / Ormanözü (Akdağ Yüksek Kuşak 1711m)",
      lat: 40.7684,
      lon: 35.8953,
      demElevationM: 1711,
      subBasinId: "akdag_tavsandagi_alpine",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.2,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }),
    "19026": Object.freeze({
      stationId: 19026,
      nameTr: "Merzifon / Tavşan Dağı Zirve (1830m)",
      lat: 40.9503,
      lon: 35.3739,
      demElevationM: 1830,
      subBasinId: "akdag_tavsandagi_alpine",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([240, 412, 950, 1850] as const),
    maxPhysicalPeakM: HYPSO_TR_05.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_05.bands
  }),
  waterBodies: Object.freeze([]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "canik_lee_canyon_foehn",
      labelTr: "Canik Dağları Güney İnişi — Yeşilırmak Kanyon Fön Isınması & Kuzey Yağış Gölgesi",
      effectiveBarrierHeightM: 1550,
      crestPressureHpa: 850,
      applicableSubBasins: Object.freeze([
        "yesilirmak_harsena_canyon",
        "merzifon_suluova_open_plain"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 335, toDeg: 45 }),
        minCrossCrestSpeedMs: 6.5,
        minFroudeNumber: 0.42,
        sourcePlateauElevationM: 980,
        maxTargetElevationM: 560,
        maxWarmingCapC: 3.9,
        subCloudVirgaFactor: 0.72,
        wetCutoffMmHr: 1.6
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 170, toDeg: 230 }),
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.08,
        maxPrecipMultiplierCap: 1.32
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 340, toDeg: 40 }),
        precipAttenuationFactor: 0.66
      })
    }),
    Object.freeze({
      id: "akdag_2062m_massif_barrier",
      labelTr: "Akdağ (2062m) & Tavşan Dağı Yüksek Kar Duvarı ve Güneyli Kanyon Fönü",
      effectiveBarrierHeightM: 2062,
      crestPressureHpa: 800,
      applicableSubBasins: Object.freeze([
        "akdag_tavsandagi_alpine",
        "yesilirmak_harsena_canyon"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 165, toDeg: 225 }),
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.38,
        sourcePlateauElevationM: 1120,
        maxTargetElevationM: 520,
        maxWarmingCapC: 4.6,
        subCloudVirgaFactor: 0.7,
        wetCutoffMmHr: 1.8
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 315, toDeg: 35 }),
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.14,
        maxPrecipMultiplierCap: 1.68
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "merzifon_suluova_wind_corridor",
      labelTr: "Merzifon (LTAP) – Suluova – Havza Açık Ova Karayel/Poyraz Geçidi",
      centerCoord: Object.freeze({ lat: 40.824, lon: 35.56 }),
      influenceRadiusKm: 22,
      channelAxisFromDeg: 340,
      bidirectional: true,
      sectorHalfWidthDeg: 24,
      speedMultiplier: 1.26,
      gustMultiplier: 1.38,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 409,
    coldPoolMaxDepthM: 320,
    topographicEnclosureIndex: 0.68,
    deltaPressureTopHpa: 38,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 3.8
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.74
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 330, toDeg: 45 }),
      minWindShearVs850Deg: 45
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.34,
    invertedVDryMicroburstSusceptibility: 0.42,
    coastalWaterspoutSusceptibility: 0.0
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "target_amasya_canyon",
      labelTr: "Amasya Merkez Yeşilırmak Kanyonu (412m)",
      lat: 40.6668,
      lon: 35.8353,
      elevationM: 412,
      role: "target"
    }),
    Object.freeze({
      key: "tasova_lower_valley",
      labelTr: "Taşova Yeşilırmak Alt Boğazı (250m)",
      lat: 40.7582,
      lon: 36.3442,
      elevationM: 250,
      role: "lee_shadow"
    }),
    Object.freeze({
      key: "merzifon_ltap_plain",
      labelTr: "Merzifon Havalimanı (LTAP) Açık Rüzgârlı Ova",
      lat: 40.824,
      lon: 35.5086,
      elevationM: 535,
      role: "corridor"
    }),
    Object.freeze({
      key: "suluova_corridor",
      labelTr: "Suluova Havza Geçidi",
      lat: 40.8153,
      lon: 35.6635,
      elevationM: 514,
      role: "corridor"
    }),
    Object.freeze({
      key: "akdag_ormanozu_summit",
      labelTr: "Akdağ / Ormanözü Yüksek Kar Duvarı (1711m–2062m)",
      lat: 40.7684,
      lon: 35.8953,
      elevationM: 1850,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "tavsandagi_crest",
      labelTr: "Merzifon Tavşan Dağı Kuzey Sırtı (1830m)",
      lat: 40.9503,
      lon: 35.3739,
      elevationM: 1830,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "boraboy_canik_pass",
      labelTr: "Boraboy / Canik Kuzey Rüzgârüstü Sırtı",
      lat: 40.8594,
      lon: 36.1031,
      elevationM: 1157,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "goynucek_south_inflow",
      labelTr: "Göynücek Güney Lodos Girişi",
      lat: 40.402,
      lon: 35.5344,
      elevationM: 504,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "gokhoyuk_valley_floor",
      labelTr: "Gökhöyük İç Vadi Tabanı",
      lat: 40.5875,
      lon: 35.6517,
      elevationM: 475,
      role: "lee_shadow"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -24,
    maxPlausibleTempC: 45,
    minPlausibleMslpHpa: 974,
    maxPlausibleMslpHpa: 1052,
    kalmanTempBiasCapC: 5.4
  }),
  urbanHeatIsland: Object.freeze({
    maxNocturnalUhiC: 2.3,
    referenceUrbanFraction: 0.62,
    coldBasinAirportIcaos: Object.freeze(["LTAP"])
  })
} satisfies ProvinceEngineSpec);

export const PROVINCE_SPEC_TR_05: ProvinceSpec = SPEC_TR_05_ENGINE;
export default PROVINCE_SPEC_TR_05;
