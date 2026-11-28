import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_13 = TR81_CLIMATOLOGY_1991_2020["TR-13"];
const HYPSO_TR_13 = TR81_HYPSOMETRIC_PROFILES["TR-13"];

/**
 * ATMOS v5.0 — Wave 3C (REG-19) Bespoke Microclimate Spec: TR-13 Bitlis
 *
 * Key Physical Mechanisms:
 *  1. Bitlis Gorge & Rahva Saddle (`1,550–1,800 m`) — Türkiye's Snowiest Provincial Capital:
 *     First steep topographic wall encountered by warm, moist southerly Mesopotamian / Basra
 *     cyclones funneling up the Bitlis Çayı valley (`1.98x` upslope precipitation cap and Venturi
 *     gorge channeling).
 *  2. Western Lake Van Shoreline LES Regime (Tatvan – Ahlat – Adilcevaz, `1,648 m` Alkaline Lake):
 *     Under cold winter E/NE (`35°–145°`) continental outbreaks, air crossing `>100 km` of unfrozen
 *     saline-alkaline Lake Van (`freezingPointC: -1.8°C`, `convectiveInstabilityUpperHpa: 700`)
 *     triggers intense 700 hPa Lake-Effect Snow (`LST - T700 >= 12°C`) banked against Tatvan and
 *     Nemrut Caldera (`2,948 m`).
 *  3. Stratovolcanic Alpine Giants:
 *     Mount Süphan (`4,058 m`) and Nemrut Crater Ski Center (`2,550–2,948 m`) anchor the 4-layer
 *     hypsometric profile while maintaining strict `icaoWhitelist: []` isolation.
 */
const SPEC_TR_13: ProvinceSpec = {
  provinceCode: "TR-13",
  plateCode: 13,
  slug: "bitlis",
  nameTr: "Bitlis",
  region: "EASTERN_ANATOLIA",
  climateRegion: "DOGU_ANADOLU",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "VAN_LAKE_BASIN",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 37.9693,
    maxLat: 39.0217,
    minLon: 41.4937,
    maxLon: 43.199
  },
  primaryCenter: {
    mgmMerkezId: 91301,
    mgmIstNo: 17208,
    mgmSaatlikIstNo: 17208,
    mgmGunlukIstNo: 91301,
    lat: 38.475,
    lon: 42.1625,
    demVerifiedElevationM: 1789,
    subBasinId: "bitlis_gorge_rahva_wall",
    urbanFraction: 0.48,
    monthlyTmaxNormalsC: CLIM_TR_13.tmaxC,
    monthlyTminNormalsC: CLIM_TR_13.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-13-tatvan-sahil",
      name: "Tatvan (Van Gölü Batı Kıyısı · 1.655 m)",
      role: "coast",
      lat: 38.5033,
      lon: 42.2808,
      elevationM: 1668
    },
    {
      id: "tr-13-ahlat-adilcevaz-sahil",
      name: "Ahlat – Adilcevaz Van Gölü Kuzeybatı Kıyısı",
      role: "coast",
      lat: 38.7486,
      lon: 42.475,
      elevationM: 1720
    },
    {
      id: "tr-13-guroymak-havza",
      name: "Güroymak (Norşin Alt Havza)",
      role: "plain",
      lat: 38.5675,
      lon: 42.0633,
      elevationM: 1407
    },
    {
      id: "tr-13-bitlis-rahva",
      name: "Bitlis Merkez & Rahva Geçidi Kar Duvarı",
      role: "foothill",
      lat: 38.475,
      lon: 42.1625,
      elevationM: 1789
    },
    {
      id: "tr-13-nemrut-kaldera-kayak",
      name: "Nemrut Krateri ve Kayak Merkezi (2.550 m)",
      role: "summit",
      lat: 38.5759,
      lon: 42.2773,
      elevationM: 2550
    },
    {
      id: "tr-13-suphan-dagi-zirve",
      name: "Süphan Dağı Zirve Kuşağı (4.058 m)",
      role: "summit",
      lat: 38.9314,
      lon: 42.8339,
      elevationM: 4032
    }
  ],
  subBasins: [
    {
      id: "bitlis_gorge_rahva_wall",
      labelTr: "Bitlis Boğazı & Rahva Geçidi Güney Kar Duvarı (1540–1880m)",
      polygonOrBbox: { minLat: 38.34, maxLat: 38.55, minLon: 42.02, maxLon: 42.24 },
      elevationRangeM: [1450, 1920],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.48
    },
    {
      id: "tatvan_ahlat_lake_shore",
      labelTr: "Tatvan – Ahlat – Adilcevaz Van Gölü Batı Kıyısı (1648–1760m)",
      polygonOrBbox: { minLat: 38.46, maxLat: 38.88, minLon: 42.24, maxLon: 43.05 },
      elevationRangeM: [1648, 1780],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.44
    },
    {
      id: "guroymak_mus_gate",
      labelTr: "Güroymak (Norşin) Batı Çukur Havzası",
      polygonOrBbox: { minLat: 38.52, maxLat: 38.68, minLon: 41.88, maxLon: 42.16 },
      elevationRangeM: [1320, 1560],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.3
    },
    {
      id: "mutki_hizan_south_taurus",
      labelTr: "Hizan – Mutki Güneydoğu Toros Derin Güney Yamaçları",
      polygonOrBbox: { minLat: 37.9693, maxLat: 38.46, minLon: 41.4937, maxLon: 42.62 },
      elevationRangeM: [1050, 1850],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.2
    },
    {
      id: "suphan_nemrut_volcanic_summits",
      labelTr: "Süphan Dağı (4058m) & Nemrut Kalderası (2948m) Volkanik Zirve Kuşağı",
      polygonOrBbox: { minLat: 38.55, maxLat: 39.0217, minLon: 42.18, maxLon: 43.199 },
      elevationRangeM: [2000, 4058],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.05
    }
  ],
  barrierCouplingMatrix: {
    bitlis_gorge_rahva_wall: {
      bitlis_gorge_rahva_wall: 1.0,
      tatvan_ahlat_lake_shore: 0.38,
      guroymak_mus_gate: 0.44,
      mutki_hizan_south_taurus: 0.56,
      suphan_nemrut_volcanic_summits: 0.24
    },
    tatvan_ahlat_lake_shore: {
      bitlis_gorge_rahva_wall: 0.38,
      tatvan_ahlat_lake_shore: 1.0,
      guroymak_mus_gate: 0.34,
      mutki_hizan_south_taurus: 0.14,
      suphan_nemrut_volcanic_summits: 0.28
    },
    guroymak_mus_gate: {
      bitlis_gorge_rahva_wall: 0.44,
      tatvan_ahlat_lake_shore: 0.34,
      guroymak_mus_gate: 1.0,
      mutki_hizan_south_taurus: 0.22,
      suphan_nemrut_volcanic_summits: 0.18
    },
    mutki_hizan_south_taurus: {
      bitlis_gorge_rahva_wall: 0.56,
      tatvan_ahlat_lake_shore: 0.14,
      guroymak_mus_gate: 0.22,
      mutki_hizan_south_taurus: 1.0,
      suphan_nemrut_volcanic_summits: 0.12
    },
    suphan_nemrut_volcanic_summits: {
      bitlis_gorge_rahva_wall: 0.24,
      tatvan_ahlat_lake_shore: 0.28,
      guroymak_mus_gate: 0.18,
      mutki_hizan_south_taurus: 0.12,
      suphan_nemrut_volcanic_summits: 1.0
    }
  },
  stationOverrides: {
    "17208": {
      stationId: 17208,
      nameTr: "Bitlis Merkez (MGM 17208)",
      lat: 38.475,
      lon: 42.1625,
      demElevationM: 1789,
      subBasinId: "bitlis_gorge_rahva_wall",
      urbanFraction: 0.48,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "mid_slope"
    },
    "17205": {
      stationId: 17205,
      nameTr: "Tatvan (Van Gölü Batı Kıyısı)",
      lat: 38.5033,
      lon: 42.2808,
      demElevationM: 1668,
      subBasinId: "tatvan_ahlat_lake_shore",
      urbanFraction: 0.52,
      coldPoolSusceptibility: 0.26,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17483": {
      stationId: 17483,
      nameTr: "Tatvan Feribot İskelesi (Van Gölü Şamandıra)",
      lat: 38.5012,
      lon: 42.295,
      demElevationM: 1654,
      subBasinId: "tatvan_ahlat_lake_shore",
      urbanFraction: 0.25,
      coldPoolSusceptibility: 0.15,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17810": {
      stationId: 17810,
      nameTr: "Ahlat",
      lat: 38.7486,
      lon: 42.475,
      demElevationM: 1720,
      subBasinId: "tatvan_ahlat_lake_shore",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.32,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18576": {
      stationId: 18576,
      nameTr: "Adilcevaz",
      lat: 38.7953,
      lon: 42.7764,
      demElevationM: 1680,
      subBasinId: "tatvan_ahlat_lake_shore",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18577": {
      stationId: 18577,
      nameTr: "Güroymak",
      lat: 38.5675,
      lon: 42.0633,
      demElevationM: 1407,
      subBasinId: "guroymak_mus_gate",
      urbanFraction: 0.32,
      coldPoolSusceptibility: 0.76,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18578": {
      stationId: 18578,
      nameTr: "Hizan",
      lat: 38.2165,
      lon: 42.4159,
      demElevationM: 1474,
      subBasinId: "mutki_hizan_south_taurus",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18579": {
      stationId: 18579,
      nameTr: "Mutki",
      lat: 38.4131,
      lon: 41.9228,
      demElevationM: 1430,
      subBasinId: "mutki_hizan_south_taurus",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18584": {
      stationId: 18584,
      nameTr: "Nemrut Krateri ve Kayak Merkezi",
      lat: 38.5759,
      lon: 42.2773,
      demElevationM: 2550,
      subBasinId: "suphan_nemrut_volcanic_summits",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.35,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [1180, 1660, 2350, 4058],
    maxPhysicalPeakM: HYPSO_TR_13.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_13.bands
  },
  waterBodies: [
    {
      id: "lake_van_west_tatvan",
      labelTr: "Van Gölü Batı Havzası (Tatvan – Ahlat – Adilcevaz 1.648 m Sodalı Göl)",
      kind: "alkaline_lake",
      mgmMarineStationIds: [17483, 17484],
      sampleCoord: { lat: 38.56, lon: 42.45 },
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 1648,
      freezingPointC: -1.8,
      monthlyWaterTempNormalsC: [
        3.8, 3.4, 4.6, 7.8, 12.6, 17.5, 21.4, 22.3, 19.2, 14.8, 9.9, 5.8
      ],
      subBasinInfluenceWeights: {
        tatvan_ahlat_lake_shore: 0.94,
        bitlis_gorge_rahva_wall: 0.28,
        suphan_nemrut_volcanic_summits: 0.32,
        guroymak_mus_gate: 0.12,
        mutki_hizan_south_taurus: 0.04
      },
      onshoreWindSectorDeg: { fromDeg: 35, toDeg: 145 },
      effectiveFetchKm: 108,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 12,
      dekHeavyDeltaTC: 15,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 55, toDeg: 135 },
        maxInlandPenetrationKm: 18,
        maxCoolingAmplitudeC: 2.6
      }
    }
  ],
  directionalBarriers: [
    {
      id: "bitlis_rahva_mesopotamia_snow_wall",
      labelTr: "Bitlis Boğazı & Rahva Geçidi (1789m) Güneyli Mezopotamya Nem Çarpma Kar Duvarı",
      effectiveBarrierHeightM: 2650,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "bitlis_gorge_rahva_wall",
        "mutki_hizan_south_taurus",
        "suphan_nemrut_volcanic_summits"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 350, toDeg: 45 },
        minCrossCrestSpeedMs: 11.0,
        minFroudeNumber: 0.75,
        sourcePlateauElevationM: 1750,
        maxTargetElevationM: 1520,
        maxWarmingCapC: 3.4,
        subCloudVirgaFactor: 0.65,
        wetCutoffMmHr: 1.4
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 145, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.24,
        maxPrecipMultiplierCap: 1.98
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 355, toDeg: 40 },
        precipAttenuationFactor: 0.74
      }
    },
    {
      id: "tatvan_nemrut_easterly_lake_effect_wall",
      labelTr: "Tatvan – Nemrut Kalderası (2948m) Doğu/Kuzeydoğu Van Gölü LES Yükselim Duvarı",
      effectiveBarrierHeightM: 2948,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "tatvan_ahlat_lake_shore",
        "suphan_nemrut_volcanic_summits",
        "bitlis_gorge_rahva_wall"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 245, toDeg: 300 },
        minCrossCrestSpeedMs: 11.5,
        minFroudeNumber: 0.78,
        sourcePlateauElevationM: 1950,
        maxTargetElevationM: 1730,
        maxWarmingCapC: 2.6,
        subCloudVirgaFactor: 0.6,
        wetCutoffMmHr: 1.5
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 40, toDeg: 140 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.26,
        maxPrecipMultiplierCap: 1.88
      }
    }
  ],
  venturiCorridors: [
    {
      id: "bitlis_rahva_gorge_funnel",
      labelTr: "Bitlis Boğazı – Rahva Düzlüğü Güney-Kuzey Dar Oluk İvmelenmesi",
      centerCoord: { lat: 38.455, lon: 42.145 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 195,
      bidirectional: true,
      sectorHalfWidthDeg: 24,
      speedMultiplier: 1.34,
      gustMultiplier: 1.46,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1405,
    coldPoolMaxDepthM: 340,
    topographicEnclosureIndex: 0.74,
    deltaPressureTopHpa: 700,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 5.8
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.7
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 25, toDeg: 115 },
      minWindShearVs850Deg: 45
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.58,
    invertedVDryMicroburstSusceptibility: 0.3,
    coastalWaterspoutSusceptibility: 0.16
  },
  stencil9Points: [
    {
      key: "center_bitlis_17208",
      labelTr: "Bitlis Merkez · Rahva Eşiği (MGM 17208)",
      lat: 38.475,
      lon: 42.1625,
      elevationM: 1789,
      role: "target"
    },
    {
      key: "tatvan_west_lake_shore",
      labelTr: "Tatvan Van Gölü Batı Kıyısı (MGM 17205)",
      lat: 38.5033,
      lon: 42.2808,
      elevationM: 1668,
      role: "marine_upwind"
    },
    {
      key: "ahlat_nw_lake_shore",
      labelTr: "Ahlat Van Gölü Kuzeybatı Kıyısı",
      lat: 38.7486,
      lon: 42.475,
      elevationM: 1720,
      role: "marine_upwind"
    },
    {
      key: "adilcevaz_north_shore",
      labelTr: "Adilcevaz Kıyı & Süphan Eteği",
      lat: 38.7953,
      lon: 42.7764,
      elevationM: 1680,
      role: "marine_upwind"
    },
    {
      key: "nemrut_caldera_wall",
      labelTr: "Nemrut Kalderası & Kayak Merkezi",
      lat: 38.5759,
      lon: 42.2773,
      elevationM: 2550,
      role: "orographic_wall"
    },
    {
      key: "suphan_stratovolcano_summit",
      labelTr: "Süphan Dağı Zirve (4058m)",
      lat: 38.9314,
      lon: 42.8339,
      elevationM: 4032,
      role: "orographic_wall"
    },
    {
      key: "bitlis_south_gorge_inflow",
      labelTr: "Bitlis Boğazı Güney Girişi (Narlıdere)",
      lat: 38.33,
      lon: 42.04,
      elevationM: 1320,
      role: "foehn_windward"
    },
    {
      key: "hizan_se_taurus_slope",
      labelTr: "Hizan Güneydoğu Yamaç",
      lat: 38.2165,
      lon: 42.4159,
      elevationM: 1474,
      role: "foehn_windward"
    },
    {
      key: "guroymak_west_basin",
      labelTr: "Güroymak (Norşin) Batı Çukur Havza",
      lat: 38.5675,
      lon: 42.0633,
      elevationM: 1407,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -36,
    maxPlausibleTempC: 41,
    minPlausibleMslpHpa: 970,
    maxPlausibleMslpHpa: 1060,
    kalmanTempBiasCapC: 4.4
  }
};

export const PROVINCE_SPEC_TR_13: ProvinceSpec = Object.freeze(SPEC_TR_13);
export default PROVINCE_SPEC_TR_13;
