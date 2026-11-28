import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_32 = TR81_CLIMATOLOGY_1991_2020["TR-32"];
const HYPSO_TR_32 = TR81_HYPSOMETRIC_PROFILES["TR-32"];

export const TR_32_BESPOKE_MODIFIERS = Object.freeze({
  allowedMetarIcaos: ["LTFC"] as const,
  coldBasinAirportIcaos: ["LTFC"] as const,
  southerlyUpslopeSectorDeg: { fromDeg: 165, toDeg: 215 } as const,
  maxLakeFetchKm: 28
});

/**
 * TR-32 Isparta — Göller Bölgesi & Batı Toros Orografik Cepleri (1050 m Merkez, Davraz 2635 m, Dedegöl 2992 m, WMO 17240 Tier-A)
 *
 * Fiziksel Karakteristikler:
 *  - Eğirdir Gölü (917 m) ve Beyşehir Gölü batı kıyısı tatlı su kütleleri elma/meyve bahçelerinde
 *    gece radyasyon donunu tamponlar; ancak `effectiveFetchKm < 35` olduğu için aşırı DEK üretmez.
 *  - Antalya Körfezi'nden Köprüçay ve Aksu olukları boyunca kuzeye tırmanan güneyli (165°–215°)
 *    nemli akış Davraz (2635 m), Sütçüler ve Dedegöl (2992 m) güney yamaçlarında ağır yağış/kar bırakır.
 *  - Süleyman Demirel Meydan (`LTFC`, 864 m Keçiborlu kapalı çanağı) gece kırsal ayaz tuzağına karşı
 *    şehir merkezinden (`1050 m`) ayrıştırılır.
 */
export const PROVINCE_SPEC_TR_32: ProvinceSpec = {
  provinceCode: "TR-32",
  plateCode: 32,
  slug: "isparta",
  nameTr: "Isparta",
  region: "MEDITERRANEAN",
  climateRegion: "AKDENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "INLAND_PASS_PLATEAU",
  icaoWhitelist: ["LTFC"],
  domainBounds: {
    minLat: 37.3425,
    maxLat: 38.5033,
    minLon: 30.0925,
    maxLon: 31.5395
  },
  primaryCenter: {
    mgmMerkezId: 93201,
    mgmIstNo: 17240,
    mgmSaatlikIstNo: 17240,
    mgmGunlukIstNo: 93201,
    wmoId: "17240",
    lat: 37.7848,
    lon: 30.5679,
    demVerifiedElevationM: 1050,
    subBasinId: "ISPARTA_CENTRAL_PLATEAU",
    urbanFraction: 0.66,
    monthlyTmaxNormalsC: CLIM_TR_32.tmaxC,
    monthlyTminNormalsC: CLIM_TR_32.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-32-egirdir",
      name: "Eğirdir Göl Kıyısı (920 m)",
      role: "plain",
      lat: 37.874,
      lon: 30.85,
      elevationM: 920
    },
    {
      id: "tr-32-sutculer",
      name: "Sütçüler – Köprüçay Orografik Yamaç",
      role: "foothill",
      lat: 37.4939,
      lon: 30.9721,
      elevationM: 985
    },
    {
      id: "tr-32-davraz",
      name: "Davraz Kayak Merkezi (1951–2635 m)",
      role: "summit",
      lat: 37.7703,
      lon: 30.7425,
      elevationM: 1951
    },
    {
      id: "tr-32-dedegol",
      name: "Dedegöl Dağı – Melikler Yaylası (2992 m Kütlesi)",
      role: "summit",
      lat: 37.705,
      lon: 31.295,
      elevationM: 1890
    }
  ],
  subBasins: [
    {
      id: "ISPARTA_CENTRAL_PLATEAU",
      labelTr: "Isparta Merkez – Atabey Etek Platosu (990–1150 m)",
      polygonOrBbox: {
        minLat: 37.7,
        maxLat: 37.98,
        minLon: 30.48,
        maxLon: 30.72
      },
      elevationRangeM: [990, 1180],
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.66
    },
    {
      id: "KECIBORLU_AIRPORT_FROST_BASIN",
      labelTr: "Keçiborlu – Gönen – Süleyman Demirel Meydan (LTFC 864 m) Ayaz Çanağı",
      polygonOrBbox: {
        minLat: 37.82,
        maxLat: 38.05,
        minLon: 30.22,
        maxLon: 30.52
      },
      elevationRangeM: [860, 1050],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.14
    },
    {
      id: "EGIRDIR_GELENDOST_ORCHARD_SHORE",
      labelTr: "Eğirdir – Gelendost – Senirkent Elma Bahçesi Göl Tampon Kuşağı",
      polygonOrBbox: {
        minLat: 37.8,
        maxLat: 38.2,
        minLon: 30.52,
        maxLon: 31.08
      },
      elevationRangeM: [917, 1080],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.32
    },
    {
      id: "SUTCULER_AKSU_OROG_POCKET",
      labelTr: "Sütçüler – Aksu – Köprüçay Güneyli Orografik Yağış Cebi",
      polygonOrBbox: {
        minLat: 37.36,
        maxLat: 37.84,
        minLon: 30.78,
        maxLon: 31.22
      },
      elevationRangeM: [380, 1450],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.16
    },
    {
      id: "YALVAC_SARKIKARAAGAC_BASIN",
      labelTr: "Yalvaç – Şarkikaraağaç – Yenişarbademli Kuzeydoğu Havzası",
      polygonOrBbox: {
        minLat: 37.7,
        maxLat: 38.46,
        minLon: 31.08,
        maxLon: 31.52
      },
      elevationRangeM: [1050, 1320],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.3
    },
    {
      id: "DAVRAZ_DEDEGOL_ALPINE",
      labelTr: "Davraz (2635 m) & Dedegöl (2992 m) Alpin Kar Kuşağı",
      polygonOrBbox: {
        minLat: 37.58,
        maxLat: 37.84,
        minLon: 30.7,
        maxLon: 31.4
      },
      elevationRangeM: [1550, 2992],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.02
    }
  ],
  barrierCouplingMatrix: {
    ISPARTA_CENTRAL_PLATEAU: {
      ISPARTA_CENTRAL_PLATEAU: 1.0,
      KECIBORLU_AIRPORT_FROST_BASIN: 0.34,
      EGIRDIR_GELENDOST_ORCHARD_SHORE: 0.48,
      SUTCULER_AKSU_OROG_POCKET: 0.44,
      YALVAC_SARKIKARAAGAC_BASIN: 0.28,
      DAVRAZ_DEDEGOL_ALPINE: 0.32
    },
    KECIBORLU_AIRPORT_FROST_BASIN: {
      ISPARTA_CENTRAL_PLATEAU: 0.28,
      KECIBORLU_AIRPORT_FROST_BASIN: 1.0,
      EGIRDIR_GELENDOST_ORCHARD_SHORE: 0.3,
      SUTCULER_AKSU_OROG_POCKET: 0.16,
      YALVAC_SARKIKARAAGAC_BASIN: 0.22,
      DAVRAZ_DEDEGOL_ALPINE: 0.14
    },
    EGIRDIR_GELENDOST_ORCHARD_SHORE: {
      ISPARTA_CENTRAL_PLATEAU: 0.48,
      KECIBORLU_AIRPORT_FROST_BASIN: 0.32,
      EGIRDIR_GELENDOST_ORCHARD_SHORE: 1.0,
      SUTCULER_AKSU_OROG_POCKET: 0.4,
      YALVAC_SARKIKARAAGAC_BASIN: 0.56,
      DAVRAZ_DEDEGOL_ALPINE: 0.26
    },
    SUTCULER_AKSU_OROG_POCKET: {
      ISPARTA_CENTRAL_PLATEAU: 0.44,
      KECIBORLU_AIRPORT_FROST_BASIN: 0.16,
      EGIRDIR_GELENDOST_ORCHARD_SHORE: 0.4,
      SUTCULER_AKSU_OROG_POCKET: 1.0,
      YALVAC_SARKIKARAAGAC_BASIN: 0.24,
      DAVRAZ_DEDEGOL_ALPINE: 0.58
    },
    YALVAC_SARKIKARAAGAC_BASIN: {
      ISPARTA_CENTRAL_PLATEAU: 0.28,
      KECIBORLU_AIRPORT_FROST_BASIN: 0.22,
      EGIRDIR_GELENDOST_ORCHARD_SHORE: 0.56,
      SUTCULER_AKSU_OROG_POCKET: 0.24,
      YALVAC_SARKIKARAAGAC_BASIN: 1.0,
      DAVRAZ_DEDEGOL_ALPINE: 0.34
    },
    DAVRAZ_DEDEGOL_ALPINE: {
      ISPARTA_CENTRAL_PLATEAU: 0.3,
      KECIBORLU_AIRPORT_FROST_BASIN: 0.12,
      EGIRDIR_GELENDOST_ORCHARD_SHORE: 0.24,
      SUTCULER_AKSU_OROG_POCKET: 0.58,
      YALVAC_SARKIKARAAGAC_BASIN: 0.32,
      DAVRAZ_DEDEGOL_ALPINE: 1.0
    }
  },
  stationOverrides: {
    "17240": {
      stationId: 17240,
      nameTr: "Isparta Bölge (WMO 17240)",
      lat: 37.7848,
      lon: 30.5679,
      demElevationM: 1050,
      subBasinId: "ISPARTA_CENTRAL_PLATEAU",
      urbanFraction: 0.66,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "mid_slope"
    },
    LTFC: {
      stationId: "LTFC",
      nameTr: "Isparta Süleyman Demirel Havalimanı (Keçiborlu Çanağı)",
      lat: 37.8554,
      lon: 30.3684,
      demElevationM: 864,
      subBasinId: "KECIBORLU_AIRPORT_FROST_BASIN",
      urbanFraction: 0.05,
      coldPoolSusceptibility: 0.92,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17882": {
      stationId: 17882,
      nameTr: "Eğirdir (Göl Kıyısı)",
      lat: 37.874,
      lon: 30.85,
      demElevationM: 920,
      subBasinId: "EGIRDIR_GELENDOST_ORCHARD_SHORE",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17893": {
      stationId: 17893,
      nameTr: "Sütçüler (Batı Toros Orografik Cep)",
      lat: 37.4939,
      lon: 30.9721,
      demElevationM: 985,
      subBasinId: "SUTCULER_AKSU_OROG_POCKET",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17888": {
      stationId: 17888,
      nameTr: "Davraz Kayak Merkezi",
      lat: 37.7703,
      lon: 30.7425,
      demElevationM: 1951,
      subBasinId: "DAVRAZ_DEDEGOL_ALPINE",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "19105": {
      stationId: 19105,
      nameTr: "Dedegöl Dağı / Melikler Yaylası",
      lat: 37.705,
      lon: 31.295,
      demElevationM: 1890,
      subBasinId: "DAVRAZ_DEDEGOL_ALPINE",
      urbanFraction: 0.01,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [380, 1050, 1520, 2250],
    maxPhysicalPeakM: 2992,
    snowElevationBands: HYPSO_TR_32.bands
  },
  waterBodies: [
    {
      id: "EGIRDIR_LAKE",
      labelTr: "Eğirdir Gölü (917 m Elma Bahçesi Don Tamponu)",
      kind: "fresh_lake",
      mgmMarineStationIds: [],
      sampleCoord: { lat: 37.98, lon: 30.86 },
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 917,
      freezingPointC: 0.0,
      monthlyWaterTempNormalsC: [
        4.2, 4.8, 7.5, 11.8, 16.4, 20.8,
        23.6, 23.8, 20.2, 15.2, 9.8, 5.8
      ],
      subBasinInfluenceWeights: {
        ISPARTA_CENTRAL_PLATEAU: 0.14,
        KECIBORLU_AIRPORT_FROST_BASIN: 0.03,
        EGIRDIR_GELENDOST_ORCHARD_SHORE: 0.74,
        SUTCULER_AKSU_OROG_POCKET: 0.08,
        YALVAC_SARKIKARAAGAC_BASIN: 0.18,
        DAVRAZ_DEDEGOL_ALPINE: 0.04
      },
      onshoreWindSectorDeg: { fromDeg: 330, toDeg: 85 },
      effectiveFetchKm: 28,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 16.5,
      dekHeavyDeltaTC: 21.5,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 340, toDeg: 80 },
        maxInlandPenetrationKm: 12,
        maxCoolingAmplitudeC: 1.6
      }
    },
    {
      id: "BEYSEHIR_LAKE_WEST_SHORE",
      labelTr: "Beyşehir Gölü Batı Havzası (Şarkikaraağaç – Yenişarbademli)",
      kind: "fresh_lake",
      mgmMarineStationIds: [],
      sampleCoord: { lat: 37.78, lon: 31.46 },
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 1123,
      freezingPointC: 0.0,
      monthlyWaterTempNormalsC: [
        3.2, 3.9, 6.8, 11.2, 15.8, 20.2,
        23.0, 23.2, 19.4, 14.2, 8.8, 4.8
      ],
      subBasinInfluenceWeights: {
        ISPARTA_CENTRAL_PLATEAU: 0.02,
        KECIBORLU_AIRPORT_FROST_BASIN: 0.0,
        EGIRDIR_GELENDOST_ORCHARD_SHORE: 0.1,
        SUTCULER_AKSU_OROG_POCKET: 0.04,
        YALVAC_SARKIKARAAGAC_BASIN: 0.58,
        DAVRAZ_DEDEGOL_ALPINE: 0.08
      },
      onshoreWindSectorDeg: { fromDeg: 90, toDeg: 185 },
      effectiveFetchKm: 26,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 17.0,
      dekHeavyDeltaTC: 22.0,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 100, toDeg: 175 },
        maxInlandPenetrationKm: 10,
        maxCoolingAmplitudeC: 1.4
      }
    }
  ],
  directionalBarriers: [
    {
      id: "WESTERN_TAURUS_DAVRAZ_SOUTHERLY_UPSLOPE",
      labelTr: "Antalya Körfezi -> Sütçüler / Davraz (2635 m) Güneyli Orografik Tırmanış Duvarı",
      effectiveBarrierHeightM: 2635,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "ISPARTA_CENTRAL_PLATEAU",
        "SUTCULER_AKSU_OROG_POCKET",
        "EGIRDIR_GELENDOST_ORCHARD_SHORE",
        "DAVRAZ_DEDEGOL_ALPINE"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 350, toDeg: 45 },
        minCrossCrestSpeedMs: 11.0,
        minFroudeNumber: 0.42,
        sourcePlateauElevationM: 1150,
        maxTargetElevationM: 980,
        maxWarmingCapC: 2.0,
        subCloudVirgaFactor: 0.15,
        wetCutoffMmHr: 0.6
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 215 },
        minOnshoreOrUpslopeSpeedMs: 4.5,
        coastalFrictionalConvergenceBoost: 1.34,
        maxPrecipMultiplierCap: 1.72
      }
    },
    {
      id: "DEDEGOL_ANAMAS_OROG_WALL",
      labelTr: "Dedegöl Dağları (2992 m) – Anamas Güney Yamaç Kar/Yağış Kapanı",
      effectiveBarrierHeightM: 2992,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "SUTCULER_AKSU_OROG_POCKET",
        "YALVAC_SARKIKARAAGAC_BASIN",
        "DAVRAZ_DEDEGOL_ALPINE"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 245, toDeg: 285 },
        minCrossCrestSpeedMs: 11.5,
        minFroudeNumber: 0.42,
        sourcePlateauElevationM: 1200,
        maxTargetElevationM: 1180,
        maxWarmingCapC: 2.2,
        subCloudVirgaFactor: 0.16,
        wetCutoffMmHr: 0.7
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 225 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.32,
        maxPrecipMultiplierCap: 1.78
      }
    }
  ],
  venturiCorridors: [
    {
      id: "KOPRUCAY_AKSU_SOUTHERLY_CHUTE",
      labelTr: "Köprüçay – Sütçüler – Aksu Nemli Güney Oluğu",
      centerCoord: { lat: 37.54, lon: 30.98 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 185,
      bidirectional: false,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.24,
      gustMultiplier: 1.36,
      suppressesNocturnalInversion: true
    },
    {
      id: "ULUBORLU_SENIRKENT_GRABEN_GAP",
      labelTr: "Uluborlu – Senirkent Hoyran Oluk Koridoru",
      centerCoord: { lat: 38.095, lon: 30.52 },
      influenceRadiusKm: 18,
      channelAxisFromDeg: 265,
      bidirectional: true,
      sectorHalfWidthDeg: 26,
      speedMultiplier: 1.22,
      gustMultiplier: 1.32,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 864,
    coldPoolMaxDepthM: 290,
    topographicEnclosureIndex: 0.78,
    deltaPressureTopHpa: 850,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 5.2
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.64
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 10, toDeg: 75 },
      minWindShearVs850Deg: 60
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.34,
    invertedVDryMicroburstSusceptibility: 0.42,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TARGET_ISPARTA_17240",
      labelTr: "Isparta Merkez (1050 m)",
      lat: 37.7848,
      lon: 30.5679,
      elevationM: 1050,
      role: "target"
    },
    {
      key: "LAKE_EGIRDIR_CENTER",
      labelTr: "Eğirdir Gölü (917 m)",
      lat: 37.98,
      lon: 30.86,
      elevationM: 917,
      role: "marine_upwind"
    },
    {
      key: "UPWIND_SUTCULER_VALLEY",
      labelTr: "Sütçüler – Köprüçay Nem Girişi",
      lat: 37.4939,
      lon: 30.9721,
      elevationM: 985,
      role: "foehn_windward"
    },
    {
      key: "OROG_DAVRAZ_SUMMIT",
      labelTr: "Davraz Dağı (2635 m Kütlesi)",
      lat: 37.7703,
      lon: 30.7425,
      elevationM: 1951,
      role: "orographic_wall"
    },
    {
      key: "OROG_DEDEGOL_CREST",
      labelTr: "Dedegöl Dağı (2992 m Kütlesi)",
      lat: 37.705,
      lon: 31.295,
      elevationM: 1890,
      role: "orographic_wall"
    },
    {
      key: "BASIN_KECIBORLU_LTFC",
      labelTr: "Keçiborlu – LTFC Ayaz Çanağı (864 m)",
      lat: 37.8554,
      lon: 30.3684,
      elevationM: 864,
      role: "lee_shadow"
    },
    {
      key: "CORRIDOR_AKSU_HIGHLAND",
      labelTr: "Aksu Yamaç Oluk Kuşağı",
      lat: 37.7999,
      lon: 31.066,
      elevationM: 1240,
      role: "corridor"
    },
    {
      key: "ORCHARD_GELENDOST",
      labelTr: "Gelendost Elma Havzası",
      lat: 38.1242,
      lon: 30.9986,
      elevationM: 1010,
      role: "corridor"
    },
    {
      key: "PLATEAU_YALVAC_NE",
      labelTr: "Yalvaç Kuzeydoğu Platosu",
      lat: 38.283,
      lon: 31.1778,
      elevationM: 1096,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -26,
    maxPlausibleTempC: 42,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 5.8
  }
};

export default PROVINCE_SPEC_TR_32;
