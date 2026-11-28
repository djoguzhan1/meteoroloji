import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";
import type { ProvinceSpec } from "../types";

const CLIM_TR_44 = TR81_CLIMATOLOGY_1991_2020["TR-44"];
const HYPSO_TR_44 = TR81_HYPSOMETRIC_PROFILES["TR-44"];

export const TR_44_APRICOT_BASIN_META = Object.freeze({
  provinceCode: "TR-44",
  wmoStationId: "LTAO0",
  wmoSynopNumericId: "17199",
  erhacAirportIcao: "LTAT",
  erhacElevationM: 862,
  springApricotFrostTrapActive: true,
  beydaglariPeakM: 2544
});

/**
 * Wave 3C (REG-16) — `TR-44` Malatya Bespoke Physical & Microclimatic Specification:
 *  - Malatya Apricot Bowl (`~850–950 m`, WMO `LTAO0` / `17199` & Battalgazi `18187` `738 m`):
 *    Moderated along its eastern margin by **Karakaya Dam Reservoir (`693 m`, `fresh_lake`,
 *    `effectiveFetchKm: 19 < 25` — strictly zero sea DEK!)**, while exposed western **Erhaç Airport (`LTAT`,
 *    `17200`, `862 m`)** sits in a treeless Akçadağ radiation frost plain that plunges `3.5–5.5°C` colder on
 *    clear spring nights (`coldBasinAirportIcaos: ["LTAT"]`, `excludeFromCenterHeadline: true`).
 *  - Southeastern Taurus / Beydağları (`2,544–2,639 m`) Northern Foehn & Rain-Shadow:
 *    Southerly/southwesterly Mediterranean systems dump heavy precipitation on Doğanşehir–Pütürge windward
 *    slopes (`17872`, `18186`) while descending into Malatya Merkez as a warm, dry Foehn (`maxWarmingCapC: 4.3`).
 *  - Darende (`18185`, `1,069 m`) – Hekimhan (`18183`, `1,227 m`) – Kuluncak (`18184`, `1,343 m`) High NW Steppe.
 */
const SPEC_TR_44_ENGINE = Object.freeze({
  provinceCode: "TR-44",
  plateCode: 44,
  slug: "malatya",
  nameTr: "Malatya",
  region: "EASTERN_ANATOLIA",
  climateRegion: "DOGU_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "EAST_MICRO_DEPRESSION",
  icaoWhitelist: Object.freeze(["LTAT"]),
  domainBounds: Object.freeze({
    minLat: 37.87,
    maxLat: 39.16,
    minLon: 37.26,
    maxLon: 39.16
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 94401,
    mgmIstNo: 17199,
    mgmSaatlikIstNo: 17197,
    mgmGunlukIstNo: 94401,
    wmoId: "LTAO0",
    lat: 38.35,
    lon: 38.25,
    demVerifiedElevationM: 950,
    subBasinId: "TR44_MALATYA_APRICOT_FOOTHILL_PLAIN",
    urbanFraction: 0.72,
    monthlyTmaxNormalsC: CLIM_TR_44.tmaxC,
    monthlyTminNormalsC: CLIM_TR_44.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-44-battalgazi",
      name: "Battalgazi / Karakaya Baraj Gölü Kayısı Ovası",
      role: "plain",
      lat: 38.4531,
      lon: 38.3564,
      elevationM: 738
    }),
    Object.freeze({
      id: "tr-44-yesilyurt",
      name: "Malatya Merkez / Yeşilyurt (WMO 17199 · LTAO0)",
      role: "plain",
      lat: 38.35,
      lon: 38.25,
      elevationM: 950
    }),
    Object.freeze({
      id: "tr-44-darende",
      name: "Darende – Kuluncak Yüksek Kuzeybatı Bozkırı",
      role: "foothill",
      lat: 38.5603,
      lon: 37.4908,
      elevationM: 1069
    }),
    Object.freeze({
      id: "tr-44-beydagi-zirve",
      name: "Güneydoğu Toroslar / Beydağları Zirve (2544 m)",
      role: "summit",
      lat: 38.225,
      lon: 38.325,
      elevationM: 2250
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR44_MALATYA_APRICOT_FOOTHILL_PLAIN",
      labelTr: "Malatya Merkez – Yeşilyurt Kayısı Etek ve Kent Kuşağı (900–1080 m)",
      polygonOrBbox: Object.freeze({
        minLat: 38.26,
        maxLat: 38.44,
        minLon: 38.14,
        maxLon: 38.48
      }),
      elevationRangeM: Object.freeze([860, 1120] as const),
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.68
    }),
    Object.freeze({
      id: "TR44_KARAKAYA_BATTALGAZI_LOW_BASIN",
      labelTr: "Battalgazi – Kale – Yazıhan – Doğanyol Karakaya Barajı Ilıman Tabanı",
      polygonOrBbox: Object.freeze({
        minLat: 38.28,
        maxLat: 38.72,
        minLon: 38.12,
        maxLon: 39.12
      }),
      elevationRangeM: Object.freeze([690, 920] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.34
    }),
    Object.freeze({
      id: "TR44_ERHAC_AKCADAG_FROST_STEPPE",
      labelTr: "Erhaç Havalimanı (LTAT · 862 m) – Akçadağ Kırsal İlkbahar Radyasyon Don Ovası",
      polygonOrBbox: Object.freeze({
        minLat: 38.28,
        maxLat: 38.56,
        minLon: 37.88,
        maxLon: 38.16
      }),
      elevationRangeM: Object.freeze([810, 1050] as const),
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.14
    }),
    Object.freeze({
      id: "TR44_DARENDE_KULUNCAK_NW_STEPPE",
      labelTr: "Darende – Hekimhan – Kuluncak – Arguvan – Arapgir Kuzeybatı Yüksek Bozkırı",
      polygonOrBbox: Object.freeze({
        minLat: 38.46,
        maxLat: 39.14,
        minLon: 37.28,
        maxLon: 38.62
      }),
      elevationRangeM: Object.freeze([1020, 1680] as const),
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.22
    }),
    Object.freeze({
      id: "TR44_BEYDAGI_SE_TAURUS_WALL",
      labelTr: "Beydağları (2544 m) – Doğanşehir – Pütürge – Kubbe Geçidi Toros Bariyeri",
      polygonOrBbox: Object.freeze({
        minLat: 37.88,
        maxLat: 38.32,
        minLon: 37.75,
        maxLon: 39.02
      }),
      elevationRangeM: Object.freeze([1180, 2639] as const),
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.12
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR44_MALATYA_APRICOT_FOOTHILL_PLAIN: Object.freeze({
      TR44_MALATYA_APRICOT_FOOTHILL_PLAIN: 1.0,
      TR44_KARAKAYA_BATTALGAZI_LOW_BASIN: 0.72,
      TR44_ERHAC_AKCADAG_FROST_STEPPE: 0.34,
      TR44_DARENDE_KULUNCAK_NW_STEPPE: 0.28,
      TR44_BEYDAGI_SE_TAURUS_WALL: 0.24
    }),
    TR44_KARAKAYA_BATTALGAZI_LOW_BASIN: Object.freeze({
      TR44_MALATYA_APRICOT_FOOTHILL_PLAIN: 0.72,
      TR44_KARAKAYA_BATTALGAZI_LOW_BASIN: 1.0,
      TR44_ERHAC_AKCADAG_FROST_STEPPE: 0.38,
      TR44_DARENDE_KULUNCAK_NW_STEPPE: 0.26,
      TR44_BEYDAGI_SE_TAURUS_WALL: 0.22
    }),
    TR44_ERHAC_AKCADAG_FROST_STEPPE: Object.freeze({
      TR44_MALATYA_APRICOT_FOOTHILL_PLAIN: 0.34,
      TR44_KARAKAYA_BATTALGAZI_LOW_BASIN: 0.38,
      TR44_ERHAC_AKCADAG_FROST_STEPPE: 1.0,
      TR44_DARENDE_KULUNCAK_NW_STEPPE: 0.46,
      TR44_BEYDAGI_SE_TAURUS_WALL: 0.26
    }),
    TR44_DARENDE_KULUNCAK_NW_STEPPE: Object.freeze({
      TR44_MALATYA_APRICOT_FOOTHILL_PLAIN: 0.28,
      TR44_KARAKAYA_BATTALGAZI_LOW_BASIN: 0.26,
      TR44_ERHAC_AKCADAG_FROST_STEPPE: 0.46,
      TR44_DARENDE_KULUNCAK_NW_STEPPE: 1.0,
      TR44_BEYDAGI_SE_TAURUS_WALL: 0.24
    }),
    TR44_BEYDAGI_SE_TAURUS_WALL: Object.freeze({
      TR44_MALATYA_APRICOT_FOOTHILL_PLAIN: 0.24,
      TR44_KARAKAYA_BATTALGAZI_LOW_BASIN: 0.22,
      TR44_ERHAC_AKCADAG_FROST_STEPPE: 0.26,
      TR44_DARENDE_KULUNCAK_NW_STEPPE: 0.24,
      TR44_BEYDAGI_SE_TAURUS_WALL: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17199": Object.freeze({
      stationId: 17199,
      nameTr: "Malatya Bölge / Merkez (WMO 17199 · 950 m)",
      lat: 38.35,
      lon: 38.25,
      demElevationM: 950,
      subBasinId: "TR44_MALATYA_APRICOT_FOOTHILL_PLAIN",
      urbanFraction: 0.72,
      coldPoolSusceptibility: 0.24,
      verticalStratumRole: "mid_slope"
    }),
    "17200": Object.freeze({
      stationId: 17200,
      nameTr: "Malatya Erhaç Havalimanı (LTAT · 862 m Don Çanağı)",
      lat: 38.4353,
      lon: 38.091,
      demElevationM: 862,
      subBasinId: "TR44_ERHAC_AKCADAG_FROST_STEPPE",
      urbanFraction: 0.06,
      coldPoolSusceptibility: 0.92,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    LTAT: Object.freeze({
      stationId: "LTAT",
      nameTr: "Erhaç Meydan METAR (Kırsal Radyasyon Don Ovası · 862 m)",
      lat: 38.4353,
      lon: 38.091,
      demElevationM: 862,
      subBasinId: "TR44_ERHAC_AKCADAG_FROST_STEPPE",
      urbanFraction: 0.06,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "17706": Object.freeze({
      stationId: 17706,
      nameTr: "Akçadağ Batı Kayısı Ovası",
      lat: 38.3406,
      lon: 38.0586,
      demElevationM: 864,
      subBasinId: "TR44_ERHAC_AKCADAG_FROST_STEPPE",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18187": Object.freeze({
      stationId: 18187,
      nameTr: "Battalgazi Karakaya Kıyı Ovası",
      lat: 38.4531,
      lon: 38.3564,
      demElevationM: 738,
      subBasinId: "TR44_KARAKAYA_BATTALGAZI_LOW_BASIN",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "17845": Object.freeze({
      stationId: 17845,
      nameTr: "Kale Karakaya Barajı Kıyısı",
      lat: 38.4073,
      lon: 38.7507,
      demElevationM: 722,
      subBasinId: "TR44_KARAKAYA_BATTALGAZI_LOW_BASIN",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }),
    "18188": Object.freeze({
      stationId: 18188,
      nameTr: "Yazıhan Tohma Ova",
      lat: 38.6008,
      lon: 38.1794,
      demElevationM: 835,
      subBasinId: "TR44_KARAKAYA_BATTALGAZI_LOW_BASIN",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18185": Object.freeze({
      stationId: 18185,
      nameTr: "Darende Tohma Kanyonu / Plato",
      lat: 38.5603,
      lon: 37.4908,
      demElevationM: 1069,
      subBasinId: "TR44_DARENDE_KULUNCAK_NW_STEPPE",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.66,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18183": Object.freeze({
      stationId: 18183,
      nameTr: "Hekimhan Kuzey Sırtı",
      lat: 38.8122,
      lon: 37.9508,
      demElevationM: 1227,
      subBasinId: "TR44_DARENDE_KULUNCAK_NW_STEPPE",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18184": Object.freeze({
      stationId: 18184,
      nameTr: "Kuluncak Yüksek Kuzeybatı Bozkırı",
      lat: 38.885,
      lon: 37.6647,
      demElevationM: 1343,
      subBasinId: "TR44_DARENDE_KULUNCAK_NW_STEPPE",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "17764": Object.freeze({
      stationId: 17764,
      nameTr: "Arapgir Kuzey Plato",
      lat: 39.0405,
      lon: 38.4875,
      demElevationM: 1200,
      subBasinId: "TR44_DARENDE_KULUNCAK_NW_STEPPE",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "17872": Object.freeze({
      stationId: 17872,
      nameTr: "Doğanşehir Güneydoğu Toros Geçidi",
      lat: 38.0958,
      lon: 37.8873,
      demElevationM: 1223,
      subBasinId: "TR44_BEYDAGI_SE_TAURUS_WALL",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18186": Object.freeze({
      stationId: 18186,
      nameTr: "Pütürge – Kubbe Dağı Yamaç Kuşağı",
      lat: 38.1958,
      lon: 38.8742,
      demElevationM: 1265,
      subBasinId: "TR44_BEYDAGI_SE_TAURUS_WALL",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.4,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([730, 1060, 1620, 2450] as const),
    maxPhysicalPeakM: HYPSO_TR_44.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_44.bands
  }),
  waterBodies: Object.freeze([
    Object.freeze({
      id: "TR44_KARAKAYA_DAM_RESERVOIR",
      labelTr: "Karakaya Baraj Gölü (Battalgazi – Kale Kayısı Don Tamponu)",
      kind: "fresh_lake",
      mgmMarineStationIds: Object.freeze([]),
      sampleCoord: Object.freeze({ lat: 38.49, lon: 38.48 }),
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 693,
      freezingPointC: 0.0,
      monthlyWaterTempNormalsC: Object.freeze([
        6.4, 6.1, 8.2, 12.6, 17.6, 22.4, 25.8, 26.4, 23.2, 18.2, 12.8, 8.4
      ] as const),
      subBasinInfluenceWeights: Object.freeze({
        TR44_KARAKAYA_BATTALGAZI_LOW_BASIN: 0.88,
        TR44_MALATYA_APRICOT_FOOTHILL_PLAIN: 0.46,
        TR44_ERHAC_AKCADAG_FROST_STEPPE: 0.08,
        TR44_DARENDE_KULUNCAK_NW_STEPPE: 0.04,
        TR44_BEYDAGI_SE_TAURUS_WALL: 0.06
      }),
      onshoreWindSectorDeg: Object.freeze({ fromDeg: 35, toDeg: 115 }),
      // Strictly < 25 km: freshwater thermal buffer only, NEVER sea DEK!
      effectiveFetchKm: 19,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 22.0,
      dekHeavyDeltaTC: 26.0,
      seaBreezeSpec: Object.freeze({
        activeMonths: Object.freeze([6, 9] as const),
        sectorDeg: Object.freeze({ fromDeg: 45, toDeg: 110 }),
        maxInlandPenetrationKm: 12,
        maxCoolingAmplitudeC: 1.4
      })
    })
  ]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR44_SE_TAURUS_BEYDAGLARI_FOEHN_AND_SHADOW",
      labelTr: "Güneydoğu Toroslar / Beydağları (2544 m) Kuzey Fön ve Yağış Gölgesi",
      effectiveBarrierHeightM: 1620,
      crestPressureHpa: 750,
      applicableSubBasins: Object.freeze([
        "TR44_MALATYA_APRICOT_FOOTHILL_PLAIN",
        "TR44_KARAKAYA_BATTALGAZI_LOW_BASIN",
        "TR44_ERHAC_AKCADAG_FROST_STEPPE"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 155, toDeg: 225 }),
        minCrossCrestSpeedMs: 7.2,
        minFroudeNumber: 0.4,
        sourcePlateauElevationM: 1450,
        maxTargetElevationM: 1080,
        maxWarmingCapC: 4.3,
        subCloudVirgaFactor: 0.54,
        wetCutoffMmHr: 1.5
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 340, toDeg: 55 }),
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.15,
        maxPrecipMultiplierCap: 1.32
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 160, toDeg: 220 }),
        precipAttenuationFactor: 0.56
      })
    }),
    Object.freeze({
      id: "TR44_DOGANSEHIR_PUTURGE_SOUTH_WINDWARD",
      labelTr: "Doğanşehir – Pütürge Toros Güney Rüzgâr-Üstü Yağış Duvarı",
      effectiveBarrierHeightM: 1650,
      crestPressureHpa: 750,
      applicableSubBasins: Object.freeze(["TR44_BEYDAGI_SE_TAURUS_WALL"]),
      foehnSpec: Object.freeze({
        enabled: false,
        windFromSectorDeg: Object.freeze({ fromDeg: 350, toDeg: 30 }),
        minCrossCrestSpeedMs: 10.0,
        minFroudeNumber: 0.55,
        sourcePlateauElevationM: 1200,
        maxTargetElevationM: 900,
        maxWarmingCapC: 1.5,
        subCloudVirgaFactor: 0.25,
        wetCutoffMmHr: 2.0
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 150, toDeg: 225 }),
        minOnshoreOrUpslopeSpeedMs: 4.5,
        coastalFrictionalConvergenceBoost: 1.28,
        maxPrecipMultiplierCap: 1.62
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR44_DARENDE_TOHMA_VALLEY_GAP",
      labelTr: "Darende – Akçadağ Tohma Vadisi Kuzeybatı Rüzgâr Oluk Hattı",
      centerCoord: Object.freeze({ lat: 38.465, lon: 37.785 }),
      influenceRadiusKm: 15,
      channelAxisFromDeg: 305,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.27,
      gustMultiplier: 1.37,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 835,
    coldPoolMaxDepthM: 280,
    topographicEnclosureIndex: 0.78,
    deltaPressureTopHpa: 33,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 3.9
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.58
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 325, toDeg: 55 }),
      minWindShearVs850Deg: 70
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.64,
    invertedVDryMicroburstSusceptibility: 0.52,
    coastalWaterspoutSusceptibility: 0.0
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "malatya_center_17199",
      labelTr: "Malatya Merkez / Yeşilyurt (950 m)",
      lat: 38.35,
      lon: 38.25,
      elevationM: 950,
      role: "target"
    }),
    Object.freeze({
      key: "erhac_ltat_frost_hollow",
      labelTr: "Erhaç Havalimanı Kırsal Don Çanağı (LTAT · 862 m)",
      lat: 38.4353,
      lon: 38.091,
      elevationM: 862,
      role: "lee_shadow"
    }),
    Object.freeze({
      key: "battalgazi_karakaya_basin",
      labelTr: "Battalgazi – Karakaya Ilıman Kayısı Tabanı",
      lat: 38.4531,
      lon: 38.3564,
      elevationM: 738,
      role: "corridor"
    }),
    Object.freeze({
      key: "kale_euphrates_east",
      labelTr: "Kale Karakaya Doğusu (722 m)",
      lat: 38.4073,
      lon: 38.7507,
      elevationM: 722,
      role: "corridor"
    }),
    Object.freeze({
      key: "beydagi_taurus_crest",
      labelTr: "Beydağları Kuzey Fön Sırtı (2544 m Kuşağı)",
      lat: 38.225,
      lon: 38.325,
      elevationM: 2250,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "dogansehir_south_windward",
      labelTr: "Doğanşehir Güney Toros Geçidi",
      lat: 38.0958,
      lon: 37.8873,
      elevationM: 1223,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "puturge_kubbe_pass",
      labelTr: "Pütürge – Kubbe Dağı Sırtı",
      lat: 38.1958,
      lon: 38.8742,
      elevationM: 1265,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "darende_nw_steppe",
      labelTr: "Darende Kuzeybatı Bozkır Koridoru",
      lat: 38.5603,
      lon: 37.4908,
      elevationM: 1069,
      role: "corridor"
    }),
    Object.freeze({
      key: "kuluncak_hekimhan_high_steppe",
      labelTr: "Kuluncak – Hekimhan Yüksek Bozkırı (1343 m)",
      lat: 38.885,
      lon: 37.6647,
      elevationM: 1343,
      role: "orographic_wall"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -27,
    maxPlausibleTempC: 45,
    minPlausibleMslpHpa: 976,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 6.4
  }),
  inversion: Object.freeze({
    valleyFloorM: 835,
    coldPoolDepthM: 280,
    clearNightInversionLapseCPerKm: 3.9,
    snowpackBoostFactor: 1.38,
    enclosureIndex: 0.78
  }),
  urbanHeatIsland: Object.freeze({
    maxNocturnalUhiC: 2.9,
    referenceUrbanFraction: 0.72,
    coldBasinAirportIcaos: Object.freeze(["LTAT"])
  })
} satisfies ProvinceEngineSpec);

export const PROVINCE_SPEC_TR_44: ProvinceSpec = SPEC_TR_44_ENGINE;
export default PROVINCE_SPEC_TR_44;
