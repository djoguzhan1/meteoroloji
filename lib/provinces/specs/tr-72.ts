import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_72 = TR81_CLIMATOLOGY_1991_2020["TR-72"];
const HYPSO_TR_72 = TR81_HYPSOMETRIC_PROFILES["TR-72"];

/**
 * ATMOS v5.0 — Wave 3C (`REG-22`) Bespoke Microclimate Contract: `TR-72` Batman
 *
 * Physical Mechanisms:
 *  1. Low Batman–Tigris Confluence Bowl (`465–610 m`) & Ilısu Dam Lake (`525 m` Reservoir) Fog Lock:
 *     Sitting at the lowest gravitational sink of the Upper Tigris valley where Batman Çayı, Garzan,
 *     and Dicle merge into the Ilısu Reservoir (`ilisu_tigris_reservoir`), winter cold-air pooling
 *     (`topographicEnclosureIndex: 0.86`) + reservoir moisture locks the basin in multi-day dense
 *     radiation fog / stratus (`persistentStratusLock: { enabled: true, daytimeSolarDampingFactor: 0.58 }`),
 *     while snow-covered clear nights plunge to `-24.0°C`.
 *  2. Extreme Summer Scorching Bowl (`+47°C+`, July normal Tmax `39.6°C`):
 *     Intense Basra low thermal compression in the `540–610 m` depression drives `+47..+48.8°C`
 *     extremes alongside dry microbursts (`0.84`) and Mesopotamian dust advection (`0.85`).
 *  3. Sason – Mereto (Aydınlık) Dağı (`2,973 m`) Steep Orographic Rain/Snow Wall:
 *     Over >2,400 m vertical relief (`effectiveBarrierHeightM: 2420`, summit `2,973 m`) in ~55 km,
 *     Sason–Mereto intercepts southerly moist cyclonic inflow (`1.88x` upslope enhancement) and strictly
 *     decouples alpine stations from the low Batman–Ilısu basin (`barrierCouplingMatrix <= 0.16`).
 */
export const TR_72_ILISU_STRATUS_MERETO_WALL_CONTRACT = Object.freeze({
  batmanCenterElevationM: 563,
  ltcjAirportElevationM: 555,
  ilisuReservoirSurfaceM: 525,
  meretoDagiPeakM: 2973,
  daytimeSolarDampingFactor: 0.58,
  summerExtremePeakTempC: 47.5,
  maxBasinToMeretoCoupling: 0.16,
  allowedMetarIcaos: Object.freeze(["LTCJ"] as const),
  blockedNeighborMetarIcaos: Object.freeze([
    "LTCC",
    "LTCL",
    "LTCK",
    "LTCR",
    "LTCV"
  ] as const)
});

const specTr72: ProvinceSpec = {
  provinceCode: "TR-72",
  plateCode: 72,
  slug: "batman",
  nameTr: "Batman",
  region: "SOUTHEASTERN_ANATOLIA",
  climateRegion: "GUNEYDOGU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "SOUTHEAST_THRESHOLD_ARID",
  icaoWhitelist: ["LTCJ"],
  domainBounds: {
    minLat: 37.4937,
    maxLat: 38.551,
    minLon: 40.9865,
    maxLon: 41.8203
  },
  primaryCenter: {
    mgmMerkezId: 97201,
    mgmIstNo: 17282,
    mgmSaatlikIstNo: 17282,
    mgmGunlukIstNo: 97201,
    wmoId: "17282",
    lat: 37.8636,
    lon: 41.1562,
    demVerifiedElevationM: 563,
    subBasinId: "batman_tigris_ilisu_basin",
    urbanFraction: 0.78,
    monthlyTmaxNormalsC: CLIM_TR_72.tmaxC,
    monthlyTminNormalsC: CLIM_TR_72.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-72-hasankeyf-ilisu-kanyon",
      name: "Hasankeyf – Ilısu Baraj Gölü Havzası",
      role: "coast",
      lat: 37.7144,
      lon: 41.4169,
      elevationM: 526
    },
    {
      id: "tr-72-batman-merkez-ova",
      name: "Batman Merkez – Dicle Alçak Çanağı (WMO 17282 / LTCJ)",
      role: "plain",
      lat: 37.8636,
      lon: 41.1562,
      elevationM: 563
    },
    {
      id: "tr-72-gercus-kalker-esik",
      name: "Gercüş (Kuzey Mardin / Midyat Kalker Eşiği)",
      role: "foothill",
      lat: 37.5697,
      lon: 41.3917,
      elevationM: 932
    },
    {
      id: "tr-72-kozluk-sason-yamac",
      name: "Kozluk – Sason Orografik Yamaç Kuşağı",
      role: "foothill",
      lat: 38.3319,
      lon: 41.42,
      elevationM: 912
    },
    {
      id: "tr-72-sason-mereto-zirve",
      name: "Sason – Mereto (Aydınlık) Dağı Yüksek Kuşağı",
      role: "summit",
      lat: 38.365,
      lon: 41.465,
      elevationM: 2350
    }
  ],
  subBasins: [
    {
      id: "batman_tigris_ilisu_basin",
      labelTr: "Batman Merkez – Beşiri – Hasankeyf / Ilısu Baraj Gölü Dicle Sis ve Sıcak Çanağı (495–730 m)",
      polygonOrBbox: {
        minLat: 37.66,
        maxLat: 38.08,
        minLon: 40.9865,
        maxLon: 41.56
      },
      elevationRangeM: [495, 730],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.64
    },
    {
      id: "gercus_midyat_limestone_ridge",
      labelTr: "Gercüş – Güney Kalker Platosu (Tur Abdin Kuzey Eşiği 780–1180 m)",
      polygonOrBbox: {
        minLat: 37.4937,
        maxLat: 37.68,
        minLon: 41.12,
        maxLon: 41.68
      },
      elevationRangeM: [780, 1180],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.22
    },
    {
      id: "kozluk_sason_orographic_slope",
      labelTr: "Kozluk – Sason Alt Vadi & Güneydoğu Toros Orografik Etek Kuşağı (680–1350 m)",
      polygonOrBbox: {
        minLat: 38.08,
        maxLat: 38.34,
        minLon: 41.18,
        maxLon: 41.72
      },
      elevationRangeM: [680, 1350],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.26
    },
    {
      id: "sason_mereto_alpine_wall",
      labelTr: "Sason – Mereto (Aydınlık 2973m) Dik Alpin Kar ve Orografik Yağış Duvarı",
      polygonOrBbox: {
        minLat: 38.28,
        maxLat: 38.551,
        minLon: 41.24,
        maxLon: 41.8203
      },
      elevationRangeM: [1350, 2973],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.06
    }
  ],
  barrierCouplingMatrix: {
    batman_tigris_ilisu_basin: {
      batman_tigris_ilisu_basin: 1.0,
      gercus_midyat_limestone_ridge: 0.28,
      kozluk_sason_orographic_slope: 0.15,
      sason_mereto_alpine_wall: 0.08
    },
    gercus_midyat_limestone_ridge: {
      batman_tigris_ilisu_basin: 0.28,
      gercus_midyat_limestone_ridge: 1.0,
      kozluk_sason_orographic_slope: 0.16,
      sason_mereto_alpine_wall: 0.1
    },
    kozluk_sason_orographic_slope: {
      batman_tigris_ilisu_basin: 0.15,
      gercus_midyat_limestone_ridge: 0.16,
      kozluk_sason_orographic_slope: 1.0,
      sason_mereto_alpine_wall: 0.52
    },
    sason_mereto_alpine_wall: {
      batman_tigris_ilisu_basin: 0.08,
      gercus_midyat_limestone_ridge: 0.1,
      kozluk_sason_orographic_slope: 0.52,
      sason_mereto_alpine_wall: 1.0
    }
  },
  stationOverrides: {
    "17282": {
      stationId: 17282,
      nameTr: "Batman Merkez / Bölge (WMO 17282)",
      lat: 37.8636,
      lon: 41.1562,
      demElevationM: 563,
      subBasinId: "batman_tigris_ilisu_basin",
      urbanFraction: 0.78,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor"
    },
    LTCJ: {
      stationId: "LTCJ",
      nameTr: "Batman Havalimanı METAR (LTCJ · Batman Çayı Sis Ovası)",
      lat: 37.929,
      lon: 41.1166,
      demElevationM: 555,
      subBasinId: "batman_tigris_ilisu_basin",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.92,
      verticalStratumRole: "basin_floor"
    },
    "17284": {
      stationId: 17284,
      nameTr: "Batman Havalimanı MGM (17284 / LTCJ)",
      lat: 37.929,
      lon: 41.1166,
      demElevationM: 555,
      subBasinId: "batman_tigris_ilisu_basin",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.92,
      verticalStratumRole: "basin_floor"
    },
    "18161": {
      stationId: 18161,
      nameTr: "Batman Hasankeyf (Ilısu Baraj Gölü Kıyısı & Dicle Sis Kanyonu)",
      lat: 37.7144,
      lon: 41.4169,
      demElevationM: 526,
      subBasinId: "batman_tigris_ilisu_basin",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.95,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18318": {
      stationId: 18318,
      nameTr: "Batman Beşiri (Garzan / Kıra Dağı Eteği)",
      lat: 37.9283,
      lon: 41.2964,
      demElevationM: 725,
      subBasinId: "batman_tigris_ilisu_basin",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18319": {
      stationId: 18319,
      nameTr: "Batman Gercüş (Güney Kalker Eşiği 932m)",
      lat: 37.5697,
      lon: 41.3917,
      demElevationM: 932,
      subBasinId: "gercus_midyat_limestone_ridge",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.38,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18320": {
      stationId: 18320,
      nameTr: "Batman Kozluk (Güney Toros Etek Yamacı)",
      lat: 38.1647,
      lon: 41.4869,
      demElevationM: 704,
      subBasinId: "kozluk_sason_orographic_slope",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18162": {
      stationId: 18162,
      nameTr: "Batman Sason (Mereto Dağı Orografik Yağış/Kar Vadisi)",
      lat: 38.3319,
      lon: 41.42,
      demElevationM: 912,
      subBasinId: "sason_mereto_alpine_wall",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [495, 855, 1450, 2973],
    maxPhysicalPeakM: HYPSO_TR_72.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_72.bands
  },
  waterBodies: [
    {
      id: "ilisu_tigris_reservoir",
      labelTr: "Ilısu (Prof. Dr. Veysel Eroğlu) Baraj Gölü — Hasankeyf / Dicle Rezervuarı (525 m)",
      kind: "fresh_lake",
      mgmMarineStationIds: [],
      sampleCoord: { lat: 37.705, lon: 41.39 },
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 525,
      freezingPointC: 0.0,
      monthlyWaterTempNormalsC: [
        6.8, 7.2, 9.8, 13.8, 18.6, 23.4,
        26.8, 27.4, 24.2, 19.2, 13.4, 8.6
      ],
      subBasinInfluenceWeights: {
        batman_tigris_ilisu_basin: 0.58,
        gercus_midyat_limestone_ridge: 0.14,
        kozluk_sason_orographic_slope: 0.06,
        sason_mereto_alpine_wall: 0.0
      },
      onshoreWindSectorDeg: { fromDeg: 115, toDeg: 205 },
      effectiveFetchKm: 16,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 18.5,
      dekHeavyDeltaTC: 23.5,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 125, toDeg: 195 },
        maxInlandPenetrationKm: 12,
        maxCoolingAmplitudeC: 1.2
      }
    }
  ],
  directionalBarriers: [
    {
      id: "sason_mereto_2973m_orographic_wall",
      labelTr: "Sason – Mereto Dağı (2973m) Dik Güneydoğu Toros Yağış/Kar Duvarı & Kuzeyli Fön İnişi",
      effectiveBarrierHeightM: 2420,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "sason_mereto_alpine_wall",
        "kozluk_sason_orographic_slope",
        "batman_tigris_ilisu_basin"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 345, toDeg: 50 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.54,
        sourcePlateauElevationM: 1420,
        maxTargetElevationM: 760,
        maxWarmingCapC: 5.4,
        subCloudVirgaFactor: 0.66,
        wetCutoffMmHr: 0.3
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 155, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.22,
        maxPrecipMultiplierCap: 1.88
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 350, toDeg: 45 },
        precipAttenuationFactor: 0.44
      }
    }
  ],
  venturiCorridors: [
    {
      id: "hasankeyf_ilisu_tigris_canyon",
      labelTr: "Hasankeyf – Ilısu Dicle Kanyonu Doğu–Batı Kanalize Vadi Akışı",
      centerCoord: { lat: 37.718, lon: 41.385 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 105,
      bidirectional: true,
      sectorHalfWidthDeg: 26,
      speedMultiplier: 1.24,
      gustMultiplier: 1.35,
      suppressesNocturnalInversion: false
    },
    {
      id: "sason_kozluk_katabatic_chute",
      labelTr: "Sason – Kozluk Vadisi Mereto Kuzeyli Katabatik İniş Oluğu",
      centerCoord: { lat: 38.225, lon: 41.45 },
      influenceRadiusKm: 22,
      channelAxisFromDeg: 15,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.3,
      gustMultiplier: 1.44,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 495,
    coldPoolMaxDepthM: 360,
    topographicEnclosureIndex: 0.86,
    deltaPressureTopHpa: 918,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 2.0,
      maxExtraRadiativeCoolingC: 8.6
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.58
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.85,
    invertedVDryMicroburstSusceptibility: 0.84,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TGT_BATMAN_BASIN",
      labelTr: "Batman Merkez Alçak Çanağı (563m / WMO 17282)",
      lat: 37.8636,
      lon: 41.1562,
      elevationM: 563,
      role: "target"
    },
    {
      key: "MAR_ILISU_HASANKEYF",
      labelTr: "Hasankeyf – Ilısu Baraj Gölü Nem/Sis Kaynağı (526m)",
      lat: 37.7144,
      lon: 41.4169,
      elevationM: 526,
      role: "marine_upwind"
    },
    {
      key: "LEE_LTCJ_BATMAN_CAYI",
      labelTr: "Batman Çayı / LTCJ Havalimanı Sis Ovası (555m)",
      lat: 37.929,
      lon: 41.1166,
      elevationM: 555,
      role: "lee_shadow"
    },
    {
      key: "LEE_BESIRI_GARZAN",
      labelTr: "Beşiri – Garzan Havza Terası (725m)",
      lat: 37.9283,
      lon: 41.2964,
      elevationM: 725,
      role: "lee_shadow"
    },
    {
      key: "ORO_GERCUS_SOUTH_RIDGE",
      labelTr: "Gercüş Güney Kalker Eşiği (932m)",
      lat: 37.5697,
      lon: 41.3917,
      elevationM: 932,
      role: "orographic_wall"
    },
    {
      key: "COR_KOZLUK_PIEDMONT",
      labelTr: "Kozluk Güney Toros Etek Boğazı (704m)",
      lat: 38.1647,
      lon: 41.4869,
      elevationM: 704,
      role: "corridor"
    },
    {
      key: "ORO_SASON_VALLEY",
      labelTr: "Sason Orografik Yağış Vadisi (912m)",
      lat: 38.3319,
      lon: 41.42,
      elevationM: 912,
      role: "orographic_wall"
    },
    {
      key: "ORO_MERETO_SUMMIT_WALL",
      labelTr: "Mereto (Aydınlık) Dağı Güney Duvarı (2350m+)",
      lat: 38.365,
      lon: 41.465,
      elevationM: 2350,
      role: "orographic_wall"
    },
    {
      key: "FOE_SASON_NORTH_CREST",
      labelTr: "Sason Kuzey Sırtı / Muş–Bitlis SuBölümü (2150m)",
      lat: 38.445,
      lon: 41.435,
      elevationM: 2150,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -28,
    maxPlausibleTempC: 50,
    minPlausibleMslpHpa: 984,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 5.6
  }
};

export const PROVINCE_SPEC_TR_72: ProvinceSpec = Object.freeze(specTr72);
export default PROVINCE_SPEC_TR_72;
