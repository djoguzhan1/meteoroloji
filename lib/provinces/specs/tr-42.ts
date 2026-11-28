import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_42 = TR81_CLIMATOLOGY_1991_2020["TR-42"];
const HYPSO_TR_42 = TR81_HYPSOMETRIC_PROFILES["TR-42"];

export const TR_42_KONYA_BASIN_REGIME = Object.freeze({
  closedBasinFloorRangeM: Object.freeze([1011, 1031] as const),
  stratusSolarDampingFactor: 0.56,
  dustTransportSusceptibility: 0.78,
  invertedVDryMicroburstSusceptibility: 0.82,
  beysehirLakeOpenSeaDekAllowed: false,
  allowedMetarIcaos: Object.freeze(["LTAN"] as const)
});

/**
 * ATMOS v5.0 — Wave 3B (REG-14) Bespoke Microclimate Spec: TR-42 Konya
 *
 * Key Physical Mechanisms:
 *  1. Türkiye's Largest Closed Endorheic Basin (~1,011–1,031 m):
 *     Under stagnant winter anticyclones, traps dense radiatively cooled air in a multi-day
 *     freezing fog / low stratus lock (`persistentStratusLock: { enabled: true, daytimeSolarDampingFactor: 0.56 }`)
 *     amplified by snow-albedo feedback (`maxExtraRadiativeCoolingC: 5.4°C`).
 *  2. Sharp SW Taurus Orographic Snow/Rain Belt vs. Arid Central/Northern Steppe:
 *     Seydişehir–Beyşehir–Derebucak–Hadim–Taşkent–Alacabel receives heavy Mediterranean
 *     SW/S orographic precipitation (`maxPrecipMultiplierCap: 1.64`) while Konya Merkez and
 *     northern Cihanbeyli–Kulu / Karapınar steppe remain in Taurus lee shadow (`0.54x`).
 *  3. Spring/Summer Dust & Inverted-V Dry Microbursts across Cihanbeyli–Kulu & Karapınar:
 *     High Saharan/Syrian dust transport (`0.78`) and deep dry sub-cloud boundary layers (`0.82`).
 *  4. Beyşehir Lake (`1,123 m`):
 *     Modeled strictly as a shallow freshwater lake (`fresh_lake`, `useOpenMeteoMarineApi: false`),
 *     never triggering open-sea DEK snow bands.
 */
const SPEC_TR_42: ProvinceSpec = {
  provinceCode: "TR-42",
  plateCode: 42,
  slug: "konya",
  nameTr: "Konya",
  region: "CENTRAL_ANATOLIA",
  climateRegion: "IC_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "CENTRAL_ANATOLIA_BASIN",
  icaoWhitelist: ["LTAN"],
  domainBounds: {
    minLat: 36.7515,
    maxLat: 39.3045,
    minLon: 31.2585,
    maxLon: 34.4365
  },
  primaryCenter: {
    mgmMerkezId: 94201,
    mgmIstNo: 17244,
    mgmSaatlikIstNo: 17245,
    mgmGunlukIstNo: 94201,
    wmoId: "17244",
    lat: 37.8687,
    lon: 32.4713,
    demVerifiedElevationM: 1029,
    subBasinId: "konya_central_closed_basin",
    urbanFraction: 0.74,
    monthlyTmaxNormalsC: CLIM_TR_42.tmaxC,
    monthlyTminNormalsC: CLIM_TR_42.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-42-cihanbeyli-tuzgolu",
      name: "Cihanbeyli – Tuz Gölü Batı Bozkırı",
      role: "coast",
      lat: 38.6506,
      lon: 32.9219,
      elevationM: 973
    },
    {
      id: "tr-42-kulu",
      name: "Kulu Kuzey Bozkırı",
      role: "plain",
      lat: 39.0788,
      lon: 33.0657,
      elevationM: 1005
    },
    {
      id: "tr-42-karapinar",
      name: "Karapınar Kurak Havza & Meke",
      role: "plain",
      lat: 37.7147,
      lon: 33.5261,
      elevationM: 996
    },
    {
      id: "tr-42-merkez",
      name: "Konya Merkez (Selçuklu – Meram · WMO 17244)",
      role: "plain",
      lat: 37.8687,
      lon: 32.4713,
      elevationM: 1029
    },
    {
      id: "tr-42-eregli",
      name: "Konya Ereğli (Bolkar Kuzey Eteği)",
      role: "plain",
      lat: 37.5255,
      lon: 34.0485,
      elevationM: 1046
    },
    {
      id: "tr-42-beysehir",
      name: "Beyşehir Göl Havzası",
      role: "foothill",
      lat: 37.6777,
      lon: 31.7463,
      elevationM: 1141
    },
    {
      id: "tr-42-seydisehir",
      name: "Seydişehir (Küpe – Geyik Dağları Eteği)",
      role: "foothill",
      lat: 37.4267,
      lon: 31.849,
      elevationM: 1129
    },
    {
      id: "tr-42-hadim",
      name: "Hadim (Orta Toros Yamaç)",
      role: "foothill",
      lat: 36.9893,
      lon: 32.4557,
      elevationM: 1552
    },
    {
      id: "tr-42-taskent-alacabel",
      name: "Taşkent / Alacabel Geçidi (Toros Kar Kuşağı)",
      role: "summit",
      lat: 36.9093,
      lon: 32.4976,
      elevationM: 1825
    }
  ],
  subBasins: [
    {
      id: "cihanbeyli_kulu_tuzgolu_steppe",
      labelTr: "Cihanbeyli – Kulu – Çeltik Kuzey Tuz Gölü Kurak Bozkır Çanağı",
      polygonOrBbox: {
        minLat: 38.35,
        maxLat: 39.3045,
        minLon: 31.65,
        maxLon: 33.48
      },
      elevationRangeM: [870, 1080],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.22
    },
    {
      id: "konya_central_closed_basin",
      labelTr: "Konya Merkez (Selçuklu – Karatay – Meram – Çumra) Kapalı Havza Tabanı",
      polygonOrBbox: {
        minLat: 37.42,
        maxLat: 38.35,
        minLon: 32.18,
        maxLon: 33.18
      },
      elevationRangeM: [995, 1180],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.68
    },
    {
      id: "karapinar_eregli_arid_basin",
      labelTr: "Karapınar – Emirgazi – Konya Ereğli Güneydoğu Kurak Havza",
      polygonOrBbox: {
        minLat: 37.32,
        maxLat: 38.08,
        minLon: 33.18,
        maxLon: 34.4365
      },
      elevationRangeM: [990, 1220],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.28
    },
    {
      id: "aksehir_ilgin_sultandag_trough",
      labelTr: "Akşehir – Ilgın – Doğanhisar Sultandağları Kuzeydoğu Etek Oluk Havzası",
      polygonOrBbox: {
        minLat: 38.05,
        maxLat: 38.68,
        minLon: 31.2585,
        maxLon: 32.22
      },
      elevationRangeM: [990, 1420],
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.36
    },
    {
      id: "beysehir_seydisehir_hadim_taurus",
      labelTr: "Beyşehir – Seydişehir – Derebucak – Hadim – Taşkent Toros Orografik Kar Kuşağı",
      polygonOrBbox: {
        minLat: 36.7515,
        maxLat: 37.98,
        minLon: 31.32,
        maxLon: 32.78
      },
      elevationRangeM: [1120, 3240],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.18
    }
  ],
  barrierCouplingMatrix: {
    cihanbeyli_kulu_tuzgolu_steppe: {
      cihanbeyli_kulu_tuzgolu_steppe: 1.0,
      konya_central_closed_basin: 0.74,
      karapinar_eregli_arid_basin: 0.68,
      aksehir_ilgin_sultandag_trough: 0.42,
      beysehir_seydisehir_hadim_taurus: 0.1
    },
    konya_central_closed_basin: {
      cihanbeyli_kulu_tuzgolu_steppe: 0.74,
      konya_central_closed_basin: 1.0,
      karapinar_eregli_arid_basin: 0.72,
      aksehir_ilgin_sultandag_trough: 0.46,
      beysehir_seydisehir_hadim_taurus: 0.16
    },
    karapinar_eregli_arid_basin: {
      cihanbeyli_kulu_tuzgolu_steppe: 0.68,
      konya_central_closed_basin: 0.72,
      karapinar_eregli_arid_basin: 1.0,
      aksehir_ilgin_sultandag_trough: 0.32,
      beysehir_seydisehir_hadim_taurus: 0.18
    },
    aksehir_ilgin_sultandag_trough: {
      cihanbeyli_kulu_tuzgolu_steppe: 0.42,
      konya_central_closed_basin: 0.46,
      karapinar_eregli_arid_basin: 0.32,
      aksehir_ilgin_sultandag_trough: 1.0,
      beysehir_seydisehir_hadim_taurus: 0.44
    },
    beysehir_seydisehir_hadim_taurus: {
      cihanbeyli_kulu_tuzgolu_steppe: 0.1,
      konya_central_closed_basin: 0.16,
      karapinar_eregli_arid_basin: 0.18,
      aksehir_ilgin_sultandag_trough: 0.44,
      beysehir_seydisehir_hadim_taurus: 1.0
    }
  },
  stationOverrides: {
    "17244": {
      stationId: 17244,
      nameTr: "Konya Havalimanı / Selçuklu (WMO 17244)",
      lat: 37.9837,
      lon: 32.574,
      demElevationM: 1031,
      subBasinId: "konya_central_closed_basin",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "basin_floor"
    },
    LTAN: {
      stationId: "LTAN",
      nameTr: "Konya Havalimanı (LTAN)",
      lat: 37.979,
      lon: 32.5619,
      demElevationM: 1031,
      subBasinId: "konya_central_closed_basin",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor"
    },
    "17245": {
      stationId: 17245,
      nameTr: "Konya Bölge / Meram",
      lat: 37.8687,
      lon: 32.4713,
      demElevationM: 1029,
      subBasinId: "konya_central_closed_basin",
      urbanFraction: 0.76,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "basin_floor"
    },
    "18213": {
      stationId: 18213,
      nameTr: "Karatay",
      lat: 37.8606,
      lon: 32.5839,
      demElevationM: 1011,
      subBasinId: "konya_central_closed_basin",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.9,
      verticalStratumRole: "basin_floor"
    },
    "17900": {
      stationId: 17900,
      nameTr: "Çumra",
      lat: 37.5658,
      lon: 32.79,
      demElevationM: 1014,
      subBasinId: "konya_central_closed_basin",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.9,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17191": {
      stationId: 17191,
      nameTr: "Cihanbeyli",
      lat: 38.6506,
      lon: 32.9219,
      demElevationM: 973,
      subBasinId: "cihanbeyli_kulu_tuzgolu_steppe",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.8,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17754": {
      stationId: 17754,
      nameTr: "Kulu",
      lat: 39.0788,
      lon: 33.0657,
      demElevationM: 1005,
      subBasinId: "cihanbeyli_kulu_tuzgolu_steppe",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.76,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17902": {
      stationId: 17902,
      nameTr: "Karapınar",
      lat: 37.7147,
      lon: 33.5261,
      demElevationM: 996,
      subBasinId: "karapinar_eregli_arid_basin",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17248": {
      stationId: 17248,
      nameTr: "Konya Ereğli",
      lat: 37.5255,
      lon: 34.0485,
      demElevationM: 1046,
      subBasinId: "karapinar_eregli_arid_basin",
      urbanFraction: 0.48,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17239": {
      stationId: 17239,
      nameTr: "Akşehir",
      lat: 38.3688,
      lon: 31.4297,
      demElevationM: 1002,
      subBasinId: "aksehir_ilgin_sultandag_trough",
      urbanFraction: 0.45,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17242": {
      stationId: 17242,
      nameTr: "Beyşehir",
      lat: 37.6777,
      lon: 31.7463,
      demElevationM: 1141,
      subBasinId: "beysehir_seydisehir_hadim_taurus",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17972": {
      stationId: 17972,
      nameTr: "Seydişehir",
      lat: 37.4267,
      lon: 31.849,
      demElevationM: 1129,
      subBasinId: "beysehir_seydisehir_hadim_taurus",
      urbanFraction: 0.4,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17928": {
      stationId: 17928,
      nameTr: "Hadim",
      lat: 36.9893,
      lon: 32.4557,
      demElevationM: 1552,
      subBasinId: "beysehir_seydisehir_hadim_taurus",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.42,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18498": {
      stationId: 18498,
      nameTr: "Taşkent",
      lat: 36.9093,
      lon: 32.4976,
      demElevationM: 1679,
      subBasinId: "beysehir_seydisehir_hadim_taurus",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18887": {
      stationId: 18887,
      nameTr: "Alacabel Geçidi (Seydişehir – Toros Kar İstasyonu)",
      lat: 37.285,
      lon: 31.925,
      demElevationM: 1825,
      subBasinId: "beysehir_seydisehir_hadim_taurus",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.24,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [905, 1016, 1350, 1950],
    maxPhysicalPeakM: HYPSO_TR_42.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_42.bands
  },
  waterBodies: [
    {
      id: "beysehir_fresh_lake",
      labelTr: "Beyşehir Gölü (Sığ Tatlı Su Gölü · 1123m)",
      kind: "fresh_lake",
      mgmMarineStationIds: [17242],
      sampleCoord: { lat: 37.76, lon: 31.55 },
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 1123,
      freezingPointC: 0.0,
      monthlyWaterTempNormalsC: [
        2.4, 3.0, 6.2, 11.4, 16.5, 21.0,
        24.2, 24.4, 20.4, 14.8, 8.6, 4.1
      ],
      subBasinInfluenceWeights: {
        beysehir_seydisehir_hadim_taurus: 0.42,
        aksehir_ilgin_sultandag_trough: 0.08,
        konya_central_closed_basin: 0.02,
        cihanbeyli_kulu_tuzgolu_steppe: 0.0,
        karapinar_eregli_arid_basin: 0.0
      },
      onshoreWindSectorDeg: { fromDeg: 240, toDeg: 315 },
      effectiveFetchKm: 26,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 28.0,
      dekHeavyDeltaTC: 32.0,
      seaBreezeSpec: {
        activeMonths: [6, 9],
        sectorDeg: { fromDeg: 250, toDeg: 310 },
        maxInlandPenetrationKm: 10,
        maxCoolingAmplitudeC: 1.4
      }
    }
  ],
  directionalBarriers: [
    {
      id: "sw_taurus_seydisehir_hadim_orog_wall",
      labelTr: "Geyik – Küpe Dağları (Alacabel – Seydişehir – Hadim – Taşkent) Toros Orografik Kar Duvarı",
      effectiveBarrierHeightM: 2250,
      crestPressureHpa: 750,
      applicableSubBasins: ["beysehir_seydisehir_hadim_taurus"],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 20, toDeg: 70 },
        minCrossCrestSpeedMs: 11.0,
        minFroudeNumber: 0.55,
        sourcePlateauElevationM: 1020,
        maxTargetElevationM: 1200,
        maxWarmingCapC: 2.0,
        subCloudVirgaFactor: 0.5,
        wetCutoffMmHr: 0.2
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 155, toDeg: 245 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.08,
        maxPrecipMultiplierCap: 1.64
      }
    },
    {
      id: "konya_basin_taurus_lee_shadow_and_poyraz_rim",
      labelTr: "Konya Kapalı Havzası Toros Yağış Gölgesi (Lodos Fönü) & Kuzeyli Kar Yığılması",
      effectiveBarrierHeightM: 2150,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "konya_central_closed_basin",
        "cihanbeyli_kulu_tuzgolu_steppe",
        "karapinar_eregli_arid_basin"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 235 },
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.44,
        sourcePlateauElevationM: 1250,
        maxTargetElevationM: 1180,
        maxWarmingCapC: 3.6,
        subCloudVirgaFactor: 0.72,
        wetCutoffMmHr: 0.4
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 335, toDeg: 45 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.0,
        maxPrecipMultiplierCap: 1.28
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 155, toDeg: 240 },
        precipAttenuationFactor: 0.54
      }
    }
  ],
  venturiCorridors: [
    {
      id: "alacabel_suğla_pass_chute",
      labelTr: "Alacabel Geçidi (1825m) – Seydişehir Güneybatı Fırtına ve Kar Kanalı",
      centerCoord: { lat: 37.285, lon: 31.925 },
      influenceRadiusKm: 26,
      channelAxisFromDeg: 215,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.38,
      gustMultiplier: 1.54,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1011,
    coldPoolMaxDepthM: 320,
    topographicEnclosureIndex: 0.88,
    deltaPressureTopHpa: 38,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 2.0,
      maxExtraRadiativeCoolingC: 5.4
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.56
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 340, toDeg: 65 },
      minWindShearVs850Deg: 60
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.78,
    invertedVDryMicroburstSusceptibility: 0.82,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TARGET_KONYA_17244",
      labelTr: "Konya Merkez (Ova · WMO 17244)",
      lat: 37.8687,
      lon: 32.4713,
      elevationM: 1029,
      role: "target"
    },
    {
      key: "CIHANBEYLI_TUZGOLU_NORTH",
      labelTr: "Cihanbeyli – Kuzey Tuz Gölü Bozkırı",
      lat: 38.6506,
      lon: 32.9219,
      elevationM: 973,
      role: "lee_shadow"
    },
    {
      key: "KARAPINAR_ARID_EAST",
      labelTr: "Karapınar – Kumul ve Toz Koridoru",
      lat: 37.7147,
      lon: 33.5261,
      elevationM: 996,
      role: "lee_shadow"
    },
    {
      key: "CUMRA_COLD_SINK",
      labelTr: "Çumra – Kapalı Havza Ayaz Çukuru",
      lat: 37.5658,
      lon: 32.79,
      elevationM: 1014,
      role: "lee_shadow"
    },
    {
      key: "BEYSEHIR_LAKE_BASIN",
      labelTr: "Beyşehir Gölü Tatlı Su Havzası",
      lat: 37.6777,
      lon: 31.7463,
      elevationM: 1141,
      role: "foehn_windward"
    },
    {
      key: "SEYDISEHIR_ALACABEL_WALL",
      labelTr: "Seydişehir – Alacabel Toros Duvarı",
      lat: 37.34,
      lon: 31.88,
      elevationM: 1750,
      role: "orographic_wall"
    },
    {
      key: "HADIM_TASKENT_CREST",
      labelTr: "Hadim – Taşkent Orta Toros Kar Kuşağı",
      lat: 36.94,
      lon: 32.48,
      elevationM: 1680,
      role: "orographic_wall"
    },
    {
      key: "AKSEHIR_SULTANDAG_GAP",
      labelTr: "Akşehir – Sultandağları Kuzeybatı Koridoru",
      lat: 38.3688,
      lon: 31.4297,
      elevationM: 1002,
      role: "corridor"
    },
    {
      key: "EREGLI_BOLKAR_FOOT",
      labelTr: "Konya Ereğli – Bolkar Kuzey Eteği",
      lat: 37.5255,
      lon: 34.0485,
      elevationM: 1046,
      role: "corridor"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -30,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 984,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 5.8
  }
};

export const PROVINCE_SPEC_TR_42: ProvinceSpec = Object.freeze(SPEC_TR_42);
export default PROVINCE_SPEC_TR_42;
