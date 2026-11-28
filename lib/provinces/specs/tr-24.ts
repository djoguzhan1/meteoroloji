import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";
import type { ProvinceSpec } from "../types";

const CLIM_TR_24 = TR81_CLIMATOLOGY_1991_2020["TR-24"];
const HYPSO_TR_24 = TR81_HYPSOMETRIC_PROFILES["TR-24"];

export const TR_24_KARASU_GRABEN_META = Object.freeze({
  provinceCode: "TR-24",
  wmoStationId: "17092",
  mgmCenterIstNo: 17094,
  allowedMetarIcaos: Object.freeze(["LTCD"] as const),
  kesisEsenceNorthWallM: 3549,
  munzurSouthWallM: 3462,
  erganSkiSummitM: 2970,
  daytimeWarmthVsErzurumBayburtC: 6.0
});

/**
 * Wave 3C (REG-16) — `TR-24` Erzincan Bespoke Physical & Microclimatic Specification:
 *  - Sheltered Karasu Tectonic Graben (`~1,156–1,216 m`, WMO `17092` / `LTCD` & MGM `17094`):
 *    Walled in on the north by **Keşiş / Esence Mountains (`3,549 m`)** and on the south by
 *    **Munzur / Mercan Mountains (`3,462 m`)**, yielding a daytime microclimate `5–7°C` milder than
 *    neighboring Erzurum (`1,758 m`) & Bayburt (`1,584 m`) via adiabatic cross-barrier subsidence,
 *    paired with intense clear-night snow-covered graben inversions (`+5.6°C/km`, `coldPoolDepthM: 420`).
 *  - Ergan Dağı Ski Center (`~2,970 m` alpine ridge, station `17983` at `2,347 m`) & High Passes:
 *    Refahiye (`18199`, `1,594 m`) – Sakaltutan (`2,160 m`) – Çayırlı/Otlukbeli (`18363`, `1,740 m`)
 *    blizzard passes contrasted with Kemaliye (`18362`, `910 m`) deep Karasu Dark Canyon micro-warmth.
 */
const SPEC_TR_24_ENGINE = Object.freeze({
  provinceCode: "TR-24",
  plateCode: 24,
  slug: "erzincan",
  nameTr: "Erzincan",
  region: "EASTERN_ANATOLIA",
  climateRegion: "DOGU_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "EAST_MICRO_DEPRESSION",
  icaoWhitelist: Object.freeze(["LTCD"]),
  domainBounds: Object.freeze({
    minLat: 39.01,
    maxLat: 40.09,
    minLon: 38.27,
    maxLon: 40.76
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 92401,
    mgmIstNo: 17094,
    mgmSaatlikIstNo: 17094,
    mgmGunlukIstNo: 92401,
    wmoId: "17092",
    lat: 39.7523,
    lon: 39.4868,
    demVerifiedElevationM: 1216,
    subBasinId: "TR24_ERZINCAN_KARASU_GRABEN",
    urbanFraction: 0.64,
    monthlyTmaxNormalsC: CLIM_TR_24.tmaxC,
    monthlyTminNormalsC: CLIM_TR_24.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-24-kemaliye",
      name: "Kemaliye – İliç Karasu Karanlık Kanyon (910 m)",
      role: "plain",
      lat: 39.2808,
      lon: 38.4906,
      elevationM: 910
    }),
    Object.freeze({
      id: "tr-24-merkez",
      name: "Erzincan Merkez (Karasu Graben Ovası · WMO 17092)",
      role: "plain",
      lat: 39.7523,
      lon: 39.4868,
      elevationM: 1216
    }),
    Object.freeze({
      id: "tr-24-refahiye",
      name: "Refahiye / Sakaltutan Geçidi Yüksek Kuşak",
      role: "foothill",
      lat: 39.9044,
      lon: 38.7672,
      elevationM: 1594
    }),
    Object.freeze({
      id: "tr-24-ergan-kayak",
      name: "Ergan Dağı Kayak Merkezi / Munzur Alpin Sırtı (2970 m)",
      role: "summit",
      lat: 39.6092,
      lon: 39.4964,
      elevationM: 2750
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR24_ERZINCAN_KARASU_GRABEN",
      labelTr: "Erzincan Merkez – Üzümlü – LTCD Korunaklı Karasu Graben Ovası (1156–1318 m)",
      polygonOrBbox: Object.freeze({
        minLat: 39.62,
        maxLat: 39.84,
        minLon: 39.22,
        maxLon: 39.82
      }),
      elevationRangeM: Object.freeze([1140, 1420] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.56
    }),
    Object.freeze({
      id: "TR24_KEMALIYE_KEMAH_CANYON",
      labelTr: "Kemaliye – İliç – Kemah Derin Fırat/Karasu Kanyon Koridoru (880–1120 m)",
      polygonOrBbox: Object.freeze({
        minLat: 39.04,
        maxLat: 39.68,
        minLon: 38.3,
        maxLon: 39.22
      }),
      elevationRangeM: Object.freeze([850, 1250] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.24
    }),
    Object.freeze({
      id: "TR24_REFAHIYE_SAKALTUTAN_TERCAN_PASSES",
      labelTr: "Refahiye – Sakaltutan – Çayırlı – Tercan – Otlukbeli Yüksek Geçit Platosu",
      polygonOrBbox: Object.freeze({
        minLat: 39.68,
        maxLat: 40.06,
        minLon: 38.45,
        maxLon: 40.72
      }),
      elevationRangeM: Object.freeze([1400, 2220] as const),
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.2
    }),
    Object.freeze({
      id: "TR24_KESIS_ERGAN_MUNZUR_ALPINE",
      labelTr: "Keşiş/Esence (3549 m) & Ergan/Munzur (2970–3462 m) Alpin Kar Duvarları",
      polygonOrBbox: Object.freeze({
        minLat: 39.48,
        maxLat: 39.96,
        minLon: 39.18,
        maxLon: 40.05
      }),
      elevationRangeM: Object.freeze([2050, 3549] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.02
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR24_ERZINCAN_KARASU_GRABEN: Object.freeze({
      TR24_ERZINCAN_KARASU_GRABEN: 1.0,
      TR24_KEMALIYE_KEMAH_CANYON: 0.52,
      TR24_REFAHIYE_SAKALTUTAN_TERCAN_PASSES: 0.34,
      TR24_KESIS_ERGAN_MUNZUR_ALPINE: 0.18
    }),
    TR24_KEMALIYE_KEMAH_CANYON: Object.freeze({
      TR24_ERZINCAN_KARASU_GRABEN: 0.52,
      TR24_KEMALIYE_KEMAH_CANYON: 1.0,
      TR24_REFAHIYE_SAKALTUTAN_TERCAN_PASSES: 0.28,
      TR24_KESIS_ERGAN_MUNZUR_ALPINE: 0.16
    }),
    TR24_REFAHIYE_SAKALTUTAN_TERCAN_PASSES: Object.freeze({
      TR24_ERZINCAN_KARASU_GRABEN: 0.34,
      TR24_KEMALIYE_KEMAH_CANYON: 0.28,
      TR24_REFAHIYE_SAKALTUTAN_TERCAN_PASSES: 1.0,
      TR24_KESIS_ERGAN_MUNZUR_ALPINE: 0.48
    }),
    TR24_KESIS_ERGAN_MUNZUR_ALPINE: Object.freeze({
      TR24_ERZINCAN_KARASU_GRABEN: 0.18,
      TR24_KEMALIYE_KEMAH_CANYON: 0.16,
      TR24_REFAHIYE_SAKALTUTAN_TERCAN_PASSES: 0.48,
      TR24_KESIS_ERGAN_MUNZUR_ALPINE: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17094": Object.freeze({
      stationId: 17094,
      nameTr: "Erzincan Merkez (Karasu Graben · 1216 m)",
      lat: 39.7523,
      lon: 39.4868,
      demElevationM: 1216,
      subBasinId: "TR24_ERZINCAN_KARASU_GRABEN",
      urbanFraction: 0.64,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor"
    }),
    "17092": Object.freeze({
      stationId: 17092,
      nameTr: "Erzincan Havalimanı (WMO 17092 · LTCD)",
      lat: 39.7102,
      lon: 39.527,
      demElevationM: 1156,
      subBasinId: "TR24_ERZINCAN_KARASU_GRABEN",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.92,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    LTCD: Object.freeze({
      stationId: "LTCD",
      nameTr: "Erzincan Meydan METAR (Graben Ayaz Tabanı · 1156 m)",
      lat: 39.7102,
      lon: 39.527,
      demElevationM: 1156,
      subBasinId: "TR24_ERZINCAN_KARASU_GRABEN",
      urbanFraction: 0.12,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18364": Object.freeze({
      stationId: 18364,
      nameTr: "Üzümlü Keşiş Güney Eteği",
      lat: 39.6964,
      lon: 39.6782,
      demElevationM: 1318,
      subBasinId: "TR24_ERZINCAN_KARASU_GRABEN",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18200": Object.freeze({
      stationId: 18200,
      nameTr: "Kemah Karasu Boğazı",
      lat: 39.6011,
      lon: 39.0328,
      demElevationM: 1071,
      subBasinId: "TR24_KEMALIYE_KEMAH_CANYON",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "18361": Object.freeze({
      stationId: 18361,
      nameTr: "İliç Fırat Vadisi",
      lat: 39.4611,
      lon: 38.5633,
      demElevationM: 1085,
      subBasinId: "TR24_KEMALIYE_KEMAH_CANYON",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "18362": Object.freeze({
      stationId: 18362,
      nameTr: "Kemaliye Karanlık Kanyon Ilıman Mikrohavza",
      lat: 39.2808,
      lon: 38.4906,
      demElevationM: 910,
      subBasinId: "TR24_KEMALIYE_KEMAH_CANYON",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.38,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "18199": Object.freeze({
      stationId: 18199,
      nameTr: "Refahiye – Sakaltutan Yüksek Geçit Kuşağı",
      lat: 39.9044,
      lon: 38.7672,
      demElevationM: 1594,
      subBasinId: "TR24_REFAHIYE_SAKALTUTAN_TERCAN_PASSES",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "17718": Object.freeze({
      stationId: 17718,
      nameTr: "Tercan Doğu Yüksek Havza",
      lat: 39.7769,
      lon: 40.3906,
      demElevationM: 1429,
      subBasinId: "TR24_REFAHIYE_SAKALTUTAN_TERCAN_PASSES",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18360": Object.freeze({
      stationId: 18360,
      nameTr: "Çayırlı Kuzeydoğu Plato",
      lat: 39.8156,
      lon: 40.0364,
      demElevationM: 1515,
      subBasinId: "TR24_REFAHIYE_SAKALTUTAN_TERCAN_PASSES",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18363": Object.freeze({
      stationId: 18363,
      nameTr: "Otlukbeli Yüksek Eşik (1740 m)",
      lat: 39.9703,
      lon: 40.02,
      demElevationM: 1740,
      subBasinId: "TR24_REFAHIYE_SAKALTUTAN_TERCAN_PASSES",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.8,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "17983": Object.freeze({
      stationId: 17983,
      nameTr: "Ergan Dağı Kayak Merkezi (Munzur Kuzey Yamacı · 2347–2970 m)",
      lat: 39.6092,
      lon: 39.4964,
      demElevationM: 2347,
      subBasinId: "TR24_KESIS_ERGAN_MUNZUR_ALPINE",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([1185, 1605, 2280, 3250] as const),
    maxPhysicalPeakM: HYPSO_TR_24.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_24.bands
  }),
  waterBodies: Object.freeze([]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR24_KESIS_ESENCE_3549M_NORTH_SHIELD",
      labelTr: "Keşiş / Esence Dağları (3549 m) Kuzey Koruma Duvarı ve Graben Fön Isınması",
      effectiveBarrierHeightM: 2280,
      crestPressureHpa: 700,
      applicableSubBasins: Object.freeze([
        "TR24_ERZINCAN_KARASU_GRABEN",
        "TR24_KEMALIYE_KEMAH_CANYON"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 335, toDeg: 45 }),
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.36,
        sourcePlateauElevationM: 1950,
        maxTargetElevationM: 1400,
        maxWarmingCapC: 4.6,
        subCloudVirgaFactor: 0.52,
        wetCutoffMmHr: 1.4
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 175, toDeg: 245 }),
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.18,
        maxPrecipMultiplierCap: 1.38
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 330, toDeg: 50 }),
        precipAttenuationFactor: 0.54
      })
    }),
    Object.freeze({
      id: "TR24_MUNZUR_ERGAN_3462M_SOUTH_WALL",
      labelTr: "Munzur / Ergan Dağı (2970–3462 m) Güneyli Fön ve Alpin Kar Bariyeri",
      effectiveBarrierHeightM: 2150,
      crestPressureHpa: 700,
      applicableSubBasins: Object.freeze([
        "TR24_ERZINCAN_KARASU_GRABEN",
        "TR24_KESIS_ERGAN_MUNZUR_ALPINE",
        "TR24_REFAHIYE_SAKALTUTAN_TERCAN_PASSES"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 165, toDeg: 225 }),
        minCrossCrestSpeedMs: 8.0,
        minFroudeNumber: 0.38,
        sourcePlateauElevationM: 1750,
        maxTargetElevationM: 1380,
        maxWarmingCapC: 4.2,
        subCloudVirgaFactor: 0.48,
        wetCutoffMmHr: 1.5
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 310, toDeg: 25 }),
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.24,
        maxPrecipMultiplierCap: 1.54
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR24_SAKALTUTAN_REFAHIYE_PASS_JET",
      labelTr: "Sakaltutan – Refahiye (2160 m) Geçit Tipi ve Boğaz Kanalı",
      centerCoord: Object.freeze({ lat: 39.885, lon: 39.085 }),
      influenceRadiusKm: 16,
      channelAxisFromDeg: 280,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.32,
      gustMultiplier: 1.44,
      suppressesNocturnalInversion: true
    }),
    Object.freeze({
      id: "TR24_SANSLI_KEMAH_KARASU_GORGE",
      labelTr: "Kemah – Acemoğlu Karasu Kanyon Boğazı",
      centerCoord: Object.freeze({ lat: 39.6011, lon: 39.0328 }),
      influenceRadiusKm: 12,
      channelAxisFromDeg: 255,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.24,
      gustMultiplier: 1.32,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 1185,
    coldPoolMaxDepthM: 420,
    topographicEnclosureIndex: 0.93,
    deltaPressureTopHpa: 48,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 5.8
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.5
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 55, toDeg: 125 }),
      minWindShearVs850Deg: 70
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.34,
    invertedVDryMicroburstSusceptibility: 0.42,
    coastalWaterspoutSusceptibility: 0.0
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "erzincan_center_17094",
      labelTr: "Erzincan Merkez Karasu Graben (1216 m)",
      lat: 39.7523,
      lon: 39.4868,
      elevationM: 1216,
      role: "target"
    }),
    Object.freeze({
      key: "erzincan_ltcd_floor",
      labelTr: "Erzincan Havalimanı Tabanı (LTCD · 1156 m)",
      lat: 39.7102,
      lon: 39.527,
      elevationM: 1156,
      role: "lee_shadow"
    }),
    Object.freeze({
      key: "kesis_esence_north_wall",
      labelTr: "Keşiş / Esence Kuzey Alpin Duvarı (3549 m Kuşağı)",
      lat: 39.885,
      lon: 39.625,
      elevationM: 2850,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "ergan_munzur_south_wall",
      labelTr: "Ergan Dağı Kayak / Munzur Kuzey Yamacı (2970 m Kuşağı)",
      lat: 39.6092,
      lon: 39.4964,
      elevationM: 2347,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "sakaltutan_refahiye_west_pass",
      labelTr: "Sakaltutan – Refahiye Yüksek Geçidi",
      lat: 39.9044,
      lon: 38.7672,
      elevationM: 1594,
      role: "corridor"
    }),
    Object.freeze({
      key: "tercan_east_corridor",
      labelTr: "Tercan Doğu Soğuk Plato Girişi",
      lat: 39.7769,
      lon: 40.3906,
      elevationM: 1429,
      role: "corridor"
    }),
    Object.freeze({
      key: "otlukbeli_ne_crest",
      labelTr: "Otlukbeli Kuzeydoğu Eşiği",
      lat: 39.9703,
      lon: 40.02,
      elevationM: 1740,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "kemah_gorge_sw",
      labelTr: "Kemah Karasu Boğazı",
      lat: 39.6011,
      lon: 39.0328,
      elevationM: 1071,
      role: "corridor"
    }),
    Object.freeze({
      key: "kemaliye_dark_canyon",
      labelTr: "Kemaliye Karanlık Kanyon (910 m)",
      lat: 39.2808,
      lon: 38.4906,
      elevationM: 910,
      role: "lee_shadow"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -34,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 975,
    maxPlausibleMslpHpa: 1050,
    kalmanTempBiasCapC: 7.2
  }),
  inversion: Object.freeze({
    valleyFloorM: 1185,
    coldPoolDepthM: 420,
    clearNightInversionLapseCPerKm: 5.6,
    snowpackBoostFactor: 1.55,
    enclosureIndex: 0.93
  }),
  urbanHeatIsland: Object.freeze({
    maxNocturnalUhiC: 2.6,
    referenceUrbanFraction: 0.64,
    coldBasinAirportIcaos: Object.freeze(["LTCD"])
  })
} satisfies ProvinceEngineSpec);

export const PROVINCE_SPEC_TR_24: ProvinceSpec = SPEC_TR_24_ENGINE;
export default PROVINCE_SPEC_TR_24;
