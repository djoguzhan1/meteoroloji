import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";
import type { ProvinceSpec } from "../types";

const CLIM_TR_67 = TR81_CLIMATOLOGY_1991_2020["TR-67"];
const HYPSO_TR_67 = TR81_HYPSOMETRIC_PROFILES["TR-67"];

export const TR_67_CALIBRATION_ANCHOR_META = Object.freeze({
  provinceCode: "TR-67",
  wmoStationId: "17022",
  meteostatStationId: "17022",
  allowedMetarIcaos: Object.freeze(["LTAS"] as const),
  disambiguatedDistrictLock: Object.freeze({
    eregliCatalogId: "tr-67-eregli",
    forbiddenCrossProvinceCollisionId: "tr-42-eregli"
  })
});

/**
 * Wave 3A (REG-08) — `TR-67` Zonguldak Bespoke Physical & Microclimatic Specification:
 *  - Steep Western Black Sea Coastal Cliff & Extreme DEK / Thundersnow Core (`300°–50°` onshore fetch `480 km`,
 *    orographic upslope multiplier `1.50` across Zonguldak Merkez, Kozlu, Kilimli, Kdz. Ereğli & Alaplı).
 *  - Intense Southerly Lodos Foehn (`155°–235°`): Air descending Küre / Bolu-Alaplı (`1500–1637 m`) ridges
 *    warms adiabatically up to `+4.8°C` (`maxWarmingCapC: 4.8`), lifting winter coastal temperatures above `22°C+`
 *    while drying relative humidity sharply.
 *  - Filyos / Çaycuma / Devrek Inner Valley Fog & Cold Pool: Sheltered valley floor (`13–100 m`) decouples
 *    at night (`coldBasinAirportIcaos: ["LTAS"]`, `excludeFromCenterHeadline: true` on `LTAS` / `19356`).
 *  - Strict Ereğli Disambiguation: `tr-67-eregli` (Kdz. Ereğli, `19 m` Black Sea) never collides with Konya Ereğli.
 */
const SPEC_TR_67_ENGINE = Object.freeze({
  provinceCode: "TR-67",
  plateCode: 67,
  slug: "zonguldak",
  nameTr: "Zonguldak",
  region: "BLACK_SEA_WEST_CENTRAL",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "WEST_MID_BLACK_SEA_DEK",
  icaoWhitelist: Object.freeze(["LTAS"]),
  domainBounds: Object.freeze({
    minLat: 41.0,
    maxLat: 41.6,
    minLon: 31.28,
    maxLon: 32.3
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 96701,
    mgmIstNo: 17022,
    mgmSaatlikIstNo: 17022,
    mgmGunlukIstNo: 96701,
    wmoId: "17022",
    lat: 41.4492,
    lon: 31.7779,
    demVerifiedElevationM: 135,
    subBasinId: "TR67_ZONGULDAK_STEEP_DEK_COAST",
    urbanFraction: 0.72,
    monthlyTmaxNormalsC: CLIM_TR_67.tmaxC,
    monthlyTminNormalsC: CLIM_TR_67.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-67-eregli",
      name: "Karadeniz Ereğli / Alaplı Kıyı",
      role: "coast",
      lat: 41.2691,
      lon: 31.4328,
      elevationM: 19
    }),
    Object.freeze({
      id: "tr-67-caycuma",
      name: "Çaycuma / Filyos Vadisi (LTAS)",
      role: "plain",
      lat: 41.432,
      lon: 32.078,
      elevationM: 24
    }),
    Object.freeze({
      id: "tr-67-devrek",
      name: "Devrek / Gökçebey İç Vadi Yamaç",
      role: "foothill",
      lat: 41.2347,
      lon: 31.9689,
      elevationM: 100
    }),
    Object.freeze({
      id: "tr-67-bacakliyayla-zirve",
      name: "Bacaklıyayla / Alaplı Gümeli Zirve",
      role: "summit",
      lat: 41.085,
      lon: 31.645,
      elevationM: 1520
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR67_ZONGULDAK_STEEP_DEK_COAST",
      labelTr: "Zonguldak Merkez – Kozlu – Kilimli Dik Kıyı DEK Duvarı",
      polygonOrBbox: Object.freeze({
        minLat: 41.36,
        maxLat: 41.59,
        minLon: 31.62,
        maxLon: 32.02
      }),
      elevationRangeM: Object.freeze([0, 380] as const),
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.68
    }),
    Object.freeze({
      id: "TR67_EREGLI_ALAPLI_WEST_COAST",
      labelTr: "Karadeniz Ereğli – Alaplı Batı DEK ve Liman Kıyısı",
      polygonOrBbox: Object.freeze({
        minLat: 41.1,
        maxLat: 41.36,
        minLon: 31.29,
        maxLon: 31.62
      }),
      elevationRangeM: Object.freeze([0, 320] as const),
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.58
    }),
    Object.freeze({
      id: "TR67_FILYOS_DEVREK_VALLEY",
      labelTr: "Çaycuma (LTAS) – Gökçebey – Devrek Filyos Sisli İç Vadisi",
      polygonOrBbox: Object.freeze({
        minLat: 41.16,
        maxLat: 41.57,
        minLon: 31.88,
        maxLon: 32.29
      }),
      elevationRangeM: Object.freeze([5, 340] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.34
    }),
    Object.freeze({
      id: "TR67_BACAKLIYAYLA_OROG_WALL",
      labelTr: "Bacaklıyayla – Gümeli – Göldağı Orografik Kar ve Fön Sırtı",
      polygonOrBbox: Object.freeze({
        minLat: 41.01,
        maxLat: 41.28,
        minLon: 31.42,
        maxLon: 32.12
      }),
      elevationRangeM: Object.freeze([420, 1637] as const),
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.08
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR67_ZONGULDAK_STEEP_DEK_COAST: Object.freeze({
      TR67_ZONGULDAK_STEEP_DEK_COAST: 1.0,
      TR67_EREGLI_ALAPLI_WEST_COAST: 0.78,
      TR67_FILYOS_DEVREK_VALLEY: 0.36,
      TR67_BACAKLIYAYLA_OROG_WALL: 0.28
    }),
    TR67_EREGLI_ALAPLI_WEST_COAST: Object.freeze({
      TR67_ZONGULDAK_STEEP_DEK_COAST: 0.78,
      TR67_EREGLI_ALAPLI_WEST_COAST: 1.0,
      TR67_FILYOS_DEVREK_VALLEY: 0.3,
      TR67_BACAKLIYAYLA_OROG_WALL: 0.32
    }),
    TR67_FILYOS_DEVREK_VALLEY: Object.freeze({
      TR67_ZONGULDAK_STEEP_DEK_COAST: 0.36,
      TR67_EREGLI_ALAPLI_WEST_COAST: 0.3,
      TR67_FILYOS_DEVREK_VALLEY: 1.0,
      TR67_BACAKLIYAYLA_OROG_WALL: 0.34
    }),
    TR67_BACAKLIYAYLA_OROG_WALL: Object.freeze({
      TR67_ZONGULDAK_STEEP_DEK_COAST: 0.28,
      TR67_EREGLI_ALAPLI_WEST_COAST: 0.32,
      TR67_FILYOS_DEVREK_VALLEY: 0.34,
      TR67_BACAKLIYAYLA_OROG_WALL: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17022": Object.freeze({
      stationId: 17022,
      nameTr: "Zonguldak Merkez (WMO 17022)",
      lat: 41.4492,
      lon: 31.7779,
      demElevationM: 135,
      subBasinId: "TR67_ZONGULDAK_STEEP_DEK_COAST",
      urbanFraction: 0.72,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "coastal_or_gap"
    }),
    "19379": Object.freeze({
      stationId: 19379,
      nameTr: "Kilimli Kıyı",
      lat: 41.483,
      lon: 31.841,
      demElevationM: 65,
      subBasinId: "TR67_ZONGULDAK_STEEP_DEK_COAST",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "coastal_or_gap"
    }),
    "19383": Object.freeze({
      stationId: 19383,
      nameTr: "Kozlu Sahil Yamaç",
      lat: 41.436,
      lon: 31.748,
      demElevationM: 95,
      subBasinId: "TR67_ZONGULDAK_STEEP_DEK_COAST",
      urbanFraction: 0.66,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "coastal_or_gap"
    }),
    "17611": Object.freeze({
      stationId: 17611,
      nameTr: "Karadeniz Ereğli",
      lat: 41.2691,
      lon: 31.4328,
      demElevationM: 19,
      subBasinId: "TR67_EREGLI_ALAPLI_WEST_COAST",
      urbanFraction: 0.64,
      coldPoolSusceptibility: 0.16,
      verticalStratumRole: "coastal_or_gap"
    }),
    "18265": Object.freeze({
      stationId: 18265,
      nameTr: "Alaplı Kıyı",
      lat: 41.1814,
      lon: 31.3852,
      demElevationM: 20,
      subBasinId: "TR67_EREGLI_ALAPLI_WEST_COAST",
      urbanFraction: 0.48,
      coldPoolSusceptibility: 0.2,
      verticalStratumRole: "coastal_or_gap"
    }),
    "17023": Object.freeze({
      stationId: 17023,
      nameTr: "Zonguldak Çaycuma Havalimanı (LTAS)",
      lat: 41.5064,
      lon: 32.0886,
      demElevationM: 13,
      subBasinId: "TR67_FILYOS_DEVREK_VALLEY",
      urbanFraction: 0.12,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    LTAS: Object.freeze({
      stationId: "LTAS",
      nameTr: "Çaycuma Meydan METAR (Filyos Vadi Sisi)",
      lat: 41.5064,
      lon: 32.0886,
      demElevationM: 13,
      subBasinId: "TR67_FILYOS_DEVREK_VALLEY",
      urbanFraction: 0.1,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "19356": Object.freeze({
      stationId: 19356,
      nameTr: "Çaycuma İlçe Vadi Tabanı",
      lat: 41.428,
      lon: 32.076,
      demElevationM: 26,
      subBasinId: "TR67_FILYOS_DEVREK_VALLEY",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.76,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "17613": Object.freeze({
      stationId: 17613,
      nameTr: "Devrek İç Vadi",
      lat: 41.2347,
      lon: 31.9689,
      demElevationM: 100,
      subBasinId: "TR67_FILYOS_DEVREK_VALLEY",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18267": Object.freeze({
      stationId: 18267,
      nameTr: "Gökçebey Vadi",
      lat: 41.3069,
      lon: 32.1514,
      demElevationM: 73,
      subBasinId: "TR67_FILYOS_DEVREK_VALLEY",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.74,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "19023": Object.freeze({
      stationId: 19023,
      nameTr: "Zonguldak Yüksek Orman / Bacaklıyayla Sırtı",
      lat: 41.095,
      lon: 31.652,
      demElevationM: 1420,
      subBasinId: "TR67_BACAKLIYAYLA_OROG_WALL",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.15,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([15, 260, 820, 1580] as const),
    maxPhysicalPeakM: HYPSO_TR_67.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_67.bands
  }),
  waterBodies: Object.freeze([
    Object.freeze({
      id: "TR67_WEST_BLACK_SEA_DEK_CORE",
      labelTr: "Batı Karadeniz (Zonguldak – Ereğli 480 km DEK Kuşağı)",
      kind: "open_sea",
      mgmMarineStationIds: Object.freeze([17453, 17498]),
      sampleCoord: Object.freeze({ lat: 41.56, lon: 31.72 }),
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.0,
      monthlyWaterTempNormalsC: Object.freeze([
        8.5, 7.6, 8.2, 10.9, 15.6, 20.6, 24.0, 24.9, 22.2, 18.0, 13.9, 10.4
      ] as const),
      subBasinInfluenceWeights: Object.freeze({
        TR67_ZONGULDAK_STEEP_DEK_COAST: 1.0,
        TR67_EREGLI_ALAPLI_WEST_COAST: 0.96,
        TR67_BACAKLIYAYLA_OROG_WALL: 0.74,
        TR67_FILYOS_DEVREK_VALLEY: 0.34
      }),
      onshoreWindSectorDeg: Object.freeze({ fromDeg: 300, toDeg: 50 }),
      effectiveFetchKm: 480,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 11.5,
      dekHeavyDeltaTC: 14.5,
      seaBreezeSpec: Object.freeze({
        activeMonths: Object.freeze([5, 9] as const),
        sectorDeg: Object.freeze({ fromDeg: 310, toDeg: 45 }),
        maxInlandPenetrationKm: 18,
        maxCoolingAmplitudeC: 2.7
      })
    })
  ]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR67_STEEP_COASTAL_DEK_AND_LODOS_FOEHN_WALL",
      labelTr: "Zonguldak – Bacaklıyayla Dik DEK Duvarı ve Güneyli Lodos Fön Sırtı",
      effectiveBarrierHeightM: 1480,
      crestPressureHpa: 850,
      applicableSubBasins: Object.freeze([
        "TR67_ZONGULDAK_STEEP_DEK_COAST",
        "TR67_EREGLI_ALAPLI_WEST_COAST",
        "TR67_BACAKLIYAYLA_OROG_WALL",
        "TR67_FILYOS_DEVREK_VALLEY"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 155, toDeg: 235 }),
        minCrossCrestSpeedMs: 6.5,
        minFroudeNumber: 0.38,
        sourcePlateauElevationM: 960,
        maxTargetElevationM: 350,
        maxWarmingCapC: 4.8,
        subCloudVirgaFactor: 0.58,
        wetCutoffMmHr: 1.4
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 300, toDeg: 50 }),
        minOnshoreOrUpslopeSpeedMs: 4.2,
        coastalFrictionalConvergenceBoost: 1.32,
        maxPrecipMultiplierCap: 1.5
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 160, toDeg: 230 }),
        precipAttenuationFactor: 0.58
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR67_FILYOS_MOUTH_GORGE",
      labelTr: "Filyos – Hisarönü Boğaz Kanalı",
      centerCoord: Object.freeze({ lat: 41.555, lon: 32.042 }),
      influenceRadiusKm: 10,
      channelAxisFromDeg: 190,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.22,
      gustMultiplier: 1.3,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 20,
    coldPoolMaxDepthM: 220,
    topographicEnclosureIndex: 0.58,
    deltaPressureTopHpa: 28,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 2.6
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.64
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 315, toDeg: 55 }),
      minWindShearVs850Deg: 75
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.22,
    invertedVDryMicroburstSusceptibility: 0.14,
    coastalWaterspoutSusceptibility: 0.68
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "zonguldak_center_17022",
      labelTr: "Zonguldak Merkez (WMO 17022)",
      lat: 41.4492,
      lon: 31.7779,
      elevationM: 135,
      role: "target"
    }),
    Object.freeze({
      key: "blacksea_nw_upwind_buoy",
      labelTr: "Batı Karadeniz Açık Deniz DEK Kaynağı",
      lat: 41.58,
      lon: 31.68,
      elevationM: 0,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "eregli_west_coast",
      labelTr: "Karadeniz Ereğli Kıyı",
      lat: 41.2691,
      lon: 31.4328,
      elevationM: 19,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "kilimli_filyos_coast",
      labelTr: "Kilimli – Hisarönü Doğu Kıyı",
      lat: 41.515,
      lon: 31.935,
      elevationM: 35,
      role: "corridor"
    }),
    Object.freeze({
      key: "gokgol_coastal_escarpment",
      labelTr: "Gökgöl – Elvanpazarcık Dik Kıyı Duvarı",
      lat: 41.405,
      lon: 31.835,
      elevationM: 580,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "bacakliyayla_gumeli_crest",
      labelTr: "Bacaklıyayla / Gümeli Alpin Sırt",
      lat: 41.085,
      lon: 31.645,
      elevationM: 1520,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "devrek_south_windward",
      labelTr: "Devrek Güney Rüzgâr-Üstü Yamaç",
      lat: 41.155,
      lon: 31.955,
      elevationM: 740,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "caycuma_filyos_floor",
      labelTr: "Çaycuma Filyos Vadi Tabanı",
      lat: 41.432,
      lon: 32.078,
      elevationM: 24,
      role: "corridor"
    }),
    Object.freeze({
      key: "gokcebey_inner_pocket",
      labelTr: "Gökçebey İç Vadi Gölge Çanağı",
      lat: 41.3069,
      lon: 32.1514,
      elevationM: 73,
      role: "lee_shadow"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -18,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 976,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 5.6
  }),
  urbanHeatIsland: Object.freeze({
    maxNocturnalUhiC: 2.4,
    referenceUrbanFraction: 0.72,
    coldBasinAirportIcaos: Object.freeze(["LTAS"])
  })
} satisfies ProvinceEngineSpec);

export const PROVINCE_SPEC_TR_67: ProvinceSpec = SPEC_TR_67_ENGINE;
export default PROVINCE_SPEC_TR_67;
