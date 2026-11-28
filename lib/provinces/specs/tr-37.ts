import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_37 = TR81_CLIMATOLOGY_1991_2020["TR-37"];
const HYPSO_TR_37 = TR81_HYPSOMETRIC_PROFILES["TR-37"];

/**
 * ATMOS v5.0 — Wave 3B (REG-09) Bespoke Microclimate Spec: TR-37 Kastamonu
 *
 * Key Physical Mechanisms:
 *  1. Dual-Barrier Topography (Coastal Küre Mountains + Southern Ilgaz Massif 2,587 m):
 *     - Steep Black Sea littoral (`İnebolu–Abana–Bozkurt–Cide`, `0–350 m`) experiences intense
 *       Karayel/Yıldız (`290°–55°`) upslope rain/floods and Sea-Effect Snow (DEK: `watch 11°C`,
 *       `heavy 13°C` at `850 hPa`), plus warm southerly Küre Foehn (`+18..+23°C` winter spikes).
 *     - Inland Gökırmak / Karaçomak Bowl (`Kastamonu Merkez WMO 17074`, `~800 m` & `Seydiler`
 *       `-30°C` frost plateau) sits in deep Küre rain shadow (`0.54x`) with persistent winter
 *       fog/stratus inversions, decoupled (`0.08` coupling) from coastal İnebolu.
 *     - Southern Ilgaz Ski / Çatalılgaz Alpine Ridge (`1,850–2,587 m`) intercepts upper-level
 *       moisture overtopping Küre.
 *  2. `LTAL` Kastamonu Uzunyazı Airport (`1,073 m` open plateau) isolated via `stationOverrides`
 *     (`excludeFromCenterHeadline: true`) so exposed runway winds/temps never skew `800 m` city bowl.
 */
const SPEC_TR_37: ProvinceSpec = {
  provinceCode: "TR-37",
  plateCode: 37,
  slug: "kastamonu",
  nameTr: "Kastamonu",
  region: "BLACK_SEA_WEST_CENTRAL",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "WEST_MID_BLACK_SEA_DEK",
  icaoWhitelist: ["LTAL"],
  domainBounds: {
    minLat: 40.8222,
    maxLat: 42.0195,
    minLon: 32.7467,
    maxLon: 34.6043
  },
  primaryCenter: {
    mgmMerkezId: 93701,
    mgmIstNo: 17074,
    mgmSaatlikIstNo: 17074,
    mgmGunlukIstNo: 93701,
    wmoId: "17074",
    lat: 41.371,
    lon: 33.7756,
    demVerifiedElevationM: 800,
    subBasinId: "gokirmak_kastamonu_bowl",
    urbanFraction: 0.6,
    monthlyTmaxNormalsC: CLIM_TR_37.tmaxC,
    monthlyTminNormalsC: CLIM_TR_37.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-37-inebolu-cide-kiyi",
      name: "İnebolu – Abana – Cide Karadeniz Kıyısı",
      role: "coast",
      lat: 41.9789,
      lon: 33.7636,
      elevationM: 40
    },
    {
      id: "tr-37-kastamonu-merkez",
      name: "Kastamonu Merkez (WMO 17074 · Gökırmak Çanağı)",
      role: "plain",
      lat: 41.371,
      lon: 33.7756,
      elevationM: 800
    },
    {
      id: "tr-37-kure-yaraligoz",
      name: "Küre – Yaralıgöz / Ecevit Geçidi",
      role: "foothill",
      lat: 41.8106,
      lon: 33.7111,
      elevationM: 1380
    },
    {
      id: "tr-37-ilgaz-kayak-yurduntepe",
      name: "Ilgaz Dağı Kayak Merkezi / Yurduntepe (2100 m)",
      role: "summit",
      lat: 41.0678,
      lon: 33.7261,
      elevationM: 2100
    }
  ],
  subBasins: [
    {
      id: "kure_black_sea_littoral",
      labelTr: "İnebolu – Abana – Bozkurt – Cide Dik Karadeniz DEK & Kıyı Kuşağı",
      polygonOrBbox: { minLat: 41.82, maxLat: 42.0195, minLon: 32.7467, maxLon: 34.35 },
      elevationRangeM: [0, 360],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.28
    },
    {
      id: "kure_karst_highland_wall",
      labelTr: "Küre – Ağlı – Azdavay – Pınarbaşı – Yaralıgöz Karst Dağ Kalkanı",
      polygonOrBbox: { minLat: 41.52, maxLat: 41.88, minLon: 32.95, maxLon: 34.18 },
      elevationRangeM: [380, 2019],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.14
    },
    {
      id: "gokirmak_kastamonu_bowl",
      labelTr: "Kastamonu Merkez – Taşköprü – Seydiler – Tosya İç Ayaz ve Gölge Çanağı",
      polygonOrBbox: { minLat: 40.96, maxLat: 41.66, minLon: 33.18, maxLon: 34.6043 },
      elevationRangeM: [400, 1180],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.42
    },
    {
      id: "ilgaz_north_alpine_ski",
      labelTr: "Ilgaz Dağı Kuzey Yüzü – Yurduntepe Kayak & Büyükhacet Zirve Kuşağı",
      polygonOrBbox: { minLat: 40.8222, maxLat: 41.18, minLon: 33.42, maxLon: 34.08 },
      elevationRangeM: [1250, 2587],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.04
    }
  ],
  barrierCouplingMatrix: {
    kure_black_sea_littoral: {
      kure_black_sea_littoral: 1.0,
      kure_karst_highland_wall: 0.54,
      gokirmak_kastamonu_bowl: 0.08,
      ilgaz_north_alpine_ski: 0.06
    },
    kure_karst_highland_wall: {
      kure_black_sea_littoral: 0.54,
      kure_karst_highland_wall: 1.0,
      gokirmak_kastamonu_bowl: 0.42,
      ilgaz_north_alpine_ski: 0.28
    },
    gokirmak_kastamonu_bowl: {
      kure_black_sea_littoral: 0.08,
      kure_karst_highland_wall: 0.42,
      gokirmak_kastamonu_bowl: 1.0,
      ilgaz_north_alpine_ski: 0.36
    },
    ilgaz_north_alpine_ski: {
      kure_black_sea_littoral: 0.06,
      kure_karst_highland_wall: 0.28,
      gokirmak_kastamonu_bowl: 0.36,
      ilgaz_north_alpine_ski: 1.0
    }
  },
  stationOverrides: {
    "17074": {
      stationId: 17074,
      nameTr: "Kastamonu Merkez (WMO 17074)",
      lat: 41.371,
      lon: 33.7756,
      demElevationM: 800,
      subBasinId: "gokirmak_kastamonu_bowl",
      urbanFraction: 0.6,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "basin_floor"
    },
    LTAL: {
      stationId: "LTAL",
      nameTr: "Kastamonu Uzunyazı Havalimanı (LTAL · Plato)",
      lat: 41.3142,
      lon: 33.7958,
      demElevationM: 1073,
      subBasinId: "gokirmak_kastamonu_bowl",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17024": {
      stationId: 17024,
      nameTr: "İnebolu (WMO 17024 · Karadeniz Kıyı)",
      lat: 41.9789,
      lon: 33.7636,
      demElevationM: 40,
      subBasinId: "kure_black_sea_littoral",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17604": {
      stationId: 17604,
      nameTr: "Cide",
      lat: 41.8822,
      lon: 32.9476,
      demElevationM: 36,
      subBasinId: "kure_black_sea_littoral",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.1,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "19221": {
      stationId: 19221,
      nameTr: "Abana",
      lat: 41.9778,
      lon: 34.0066,
      demElevationM: 10,
      subBasinId: "kure_black_sea_littoral",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.06,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17606": {
      stationId: 17606,
      nameTr: "Bozkurt (Ezine Çayı Boğazı)",
      lat: 41.9597,
      lon: 34.0037,
      demElevationM: 167,
      subBasinId: "kure_black_sea_littoral",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17625": {
      stationId: 17625,
      nameTr: "Çatalzeytin",
      lat: 41.9538,
      lon: 34.218,
      demElevationM: 75,
      subBasinId: "kure_black_sea_littoral",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18518": {
      stationId: 18518,
      nameTr: "Küre (Karadeniz Geçit Duvarı)",
      lat: 41.8106,
      lon: 33.7111,
      demElevationM: 1015,
      subBasinId: "kure_karst_highland_wall",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "19031": {
      stationId: 19031,
      nameTr: "Ağlı",
      lat: 41.6869,
      lon: 33.5538,
      demElevationM: 1162,
      subBasinId: "kure_karst_highland_wall",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18520": {
      stationId: 18520,
      nameTr: "Seydiler (Karasal Ayaz Çukuru)",
      lat: 41.6244,
      lon: 33.7186,
      demElevationM: 1052,
      subBasinId: "gokirmak_kastamonu_bowl",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.96,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17618": {
      stationId: 17618,
      nameTr: "Devrekani",
      lat: 41.5996,
      lon: 33.8345,
      demElevationM: 1050,
      subBasinId: "gokirmak_kastamonu_bowl",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.92,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18522": {
      stationId: 18522,
      nameTr: "Taşköprü (Gökırmak Vadisi)",
      lat: 41.4942,
      lon: 34.2225,
      demElevationM: 632,
      subBasinId: "gokirmak_kastamonu_bowl",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "19222": {
      stationId: 19222,
      nameTr: "Hanönü",
      lat: 41.6254,
      lon: 34.4634,
      demElevationM: 425,
      subBasinId: "gokirmak_kastamonu_bowl",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.76,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17650": {
      stationId: 17650,
      nameTr: "Tosya (Devrez Çeltik Vadisi)",
      lat: 41.0132,
      lon: 34.0367,
      demElevationM: 870,
      subBasinId: "gokirmak_kastamonu_bowl",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.74,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18904": {
      stationId: 18904,
      nameTr: "Ilgaz Dağı Kayak Merkezi",
      lat: 41.0731,
      lon: 33.7294,
      demElevationM: 1843,
      subBasinId: "ilgaz_north_alpine_ski",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "20516": {
      stationId: 20516,
      nameTr: "Ilgaz Yurduntepe Kayak Merkezi",
      lat: 41.0678,
      lon: 33.7261,
      demElevationM: 1950,
      subBasinId: "ilgaz_north_alpine_ski",
      urbanFraction: 0.03,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [15, 800, 1380, 2587],
    maxPhysicalPeakM: HYPSO_TR_37.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_37.bands
  },
  waterBodies: [
    {
      id: "west_central_black_sea_inebolu",
      labelTr: "Batı-Orta Karadeniz (İnebolu – Abana – Cide Açıkları)",
      kind: "open_sea",
      mgmMarineStationIds: [17024, 17604, 19221],
      sampleCoord: { lat: 42.08, lon: 33.76 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.0,
      monthlyWaterTempNormalsC: [
        8.4, 7.6, 8.2, 11.1, 15.9, 21.0, 24.1, 24.8, 21.8, 17.6, 13.6, 10.2
      ],
      subBasinInfluenceWeights: {
        kure_black_sea_littoral: 0.96,
        kure_karst_highland_wall: 0.58,
        gokirmak_kastamonu_bowl: 0.04,
        ilgaz_north_alpine_ski: 0.18
      },
      onshoreWindSectorDeg: { fromDeg: 290, toDeg: 55 },
      effectiveFetchKm: 480,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 11.0,
      dekHeavyDeltaTC: 13.0,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 315, toDeg: 45 },
        maxInlandPenetrationKm: 16,
        maxCoolingAmplitudeC: 3.4
      }
    }
  ],
  directionalBarriers: [
    {
      id: "kure_coastal_dek_wall_and_lodos_foehn",
      labelTr: "Küre Dağları (2019m) İnebolu–Bozkurt–Cide Kıyı DEK Duvarı & Güneyli Lodos Fönü",
      effectiveBarrierHeightM: 1850,
      crestPressureHpa: 800,
      applicableSubBasins: ["kure_black_sea_littoral", "kure_karst_highland_wall"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 225 },
        minCrossCrestSpeedMs: 9.0,
        minFroudeNumber: 0.82,
        sourcePlateauElevationM: 850,
        maxTargetElevationM: 380,
        maxWarmingCapC: 6.2,
        subCloudVirgaFactor: 0.65,
        wetCutoffMmHr: 1.5
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 295, toDeg: 50 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.32,
        maxPrecipMultiplierCap: 1.95
      }
    },
    {
      id: "kure_inland_gokirmak_rain_shadow",
      labelTr: "Küre Dağları İç Gökırmak / Kastamonu Çanağı Kuzeyli Yağış Gölgesi",
      effectiveBarrierHeightM: 1850,
      crestPressureHpa: 800,
      applicableSubBasins: ["gokirmak_kastamonu_bowl"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 175, toDeg: 225 },
        minCrossCrestSpeedMs: 10.5,
        minFroudeNumber: 0.9,
        sourcePlateauElevationM: 1100,
        maxTargetElevationM: 920,
        maxWarmingCapC: 3.8,
        subCloudVirgaFactor: 0.75,
        wetCutoffMmHr: 1.4
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 55, toDeg: 115 },
        minOnshoreOrUpslopeSpeedMs: 7.0,
        coastalFrictionalConvergenceBoost: 1.06,
        maxPrecipMultiplierCap: 1.26
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 315, toDeg: 40 },
        precipAttenuationFactor: 0.54
      }
    },
    {
      id: "ilgaz_north_face_alpine_snow_trap",
      labelTr: "Ilgaz Dağı (2587m) Kuzey Yüzü & Yurduntepe Kayak Kuşağı Kar Yakalama Duvarı",
      effectiveBarrierHeightM: 2587,
      crestPressureHpa: 750,
      applicableSubBasins: ["ilgaz_north_alpine_ski"],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 175, toDeg: 215 },
        minCrossCrestSpeedMs: 16.0,
        minFroudeNumber: 1.2,
        sourcePlateauElevationM: 900,
        maxTargetElevationM: 1300,
        maxWarmingCapC: 1.5,
        subCloudVirgaFactor: 0.9,
        wetCutoffMmHr: 1.0
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 315, toDeg: 40 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.18,
        maxPrecipMultiplierCap: 1.74
      }
    }
  ],
  venturiCorridors: [
    {
      id: "ecevit_kure_pass_funnel",
      labelTr: "İnebolu – Küre – Ecevit Geçidi Kuzey-Güney Boğaz Kanalı",
      centerCoord: { lat: 41.78, lon: 33.71 },
      influenceRadiusKm: 22,
      channelAxisFromDeg: 5,
      bidirectional: true,
      sectorHalfWidthDeg: 22,
      speedMultiplier: 1.24,
      gustMultiplier: 1.35,
      suppressesNocturnalInversion: true
    },
    {
      id: "gokirmak_taskopru_valley_drainage",
      labelTr: "Kastamonu – Taşköprü – Hanönü Gökırmak Vadi Akışı",
      centerCoord: { lat: 41.52, lon: 34.15 },
      influenceRadiusKm: 28,
      channelAxisFromDeg: 245,
      bidirectional: true,
      sectorHalfWidthDeg: 24,
      speedMultiplier: 1.16,
      gustMultiplier: 1.25,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 775,
    coldPoolMaxDepthM: 360,
    topographicEnclosureIndex: 0.82,
    deltaPressureTopHpa: 910,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 2.0,
      maxExtraRadiativeCoolingC: 6.2
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.56
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 330, toDeg: 65 },
      minWindShearVs850Deg: 48
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.34,
    invertedVDryMicroburstSusceptibility: 0.42,
    coastalWaterspoutSusceptibility: 0.64
  },
  stencil9Points: [
    {
      key: "kastamonu_center_17074",
      labelTr: "Kastamonu Merkez (WMO 17074 · Gökırmak Çanağı)",
      lat: 41.371,
      lon: 33.7756,
      elevationM: 800,
      role: "target"
    },
    {
      key: "inebolu_marine_upwind",
      labelTr: "İnebolu Karadeniz DEK Denizel Giriş",
      lat: 41.9789,
      lon: 33.7636,
      elevationM: 40,
      role: "marine_upwind"
    },
    {
      key: "cide_west_coast_upwind",
      labelTr: "Cide Batı Karadeniz Kıyı Girişi",
      lat: 41.8822,
      lon: 32.9476,
      elevationM: 36,
      role: "marine_upwind"
    },
    {
      key: "kure_yaraligoz_wall",
      labelTr: "Küre – Yaralıgöz Kuzey Dağ Duvarı",
      lat: 41.8106,
      lon: 33.7111,
      elevationM: 1380,
      role: "orographic_wall"
    },
    {
      key: "seydiler_frost_basin",
      labelTr: "Seydiler – Devrekani Ayaz Platosu",
      lat: 41.6244,
      lon: 33.7186,
      elevationM: 1052,
      role: "lee_shadow"
    },
    {
      key: "taskopru_gokirmak_corridor",
      labelTr: "Taşköprü Gökırmak Doğu Koridoru",
      lat: 41.4942,
      lon: 34.2225,
      elevationM: 632,
      role: "corridor"
    },
    {
      key: "arac_west_corridor",
      labelTr: "Araç Batı Vadi Koridoru",
      lat: 41.2467,
      lon: 33.3306,
      elevationM: 680,
      role: "corridor"
    },
    {
      key: "ilgaz_yurduntepe_summit",
      labelTr: "Ilgaz Dağı Yurduntepe Zirve Duvarı",
      lat: 41.0678,
      lon: 33.7261,
      elevationM: 2100,
      role: "orographic_wall"
    },
    {
      key: "tosya_south_windward",
      labelTr: "Tosya Güneydoğu Geçiş Vadisi",
      lat: 41.0132,
      lon: 34.0367,
      elevationM: 870,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -34,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 976,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 4.5
  }
};

export const PROVINCE_SPEC_TR_37: ProvinceSpec = Object.freeze(SPEC_TR_37);
export default PROVINCE_SPEC_TR_37;
