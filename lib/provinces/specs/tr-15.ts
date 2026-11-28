import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_15 = TR81_CLIMATOLOGY_1991_2020["TR-15"];
const HYPSO_TR_15 = TR81_HYPSOMETRIC_PROFILES["TR-15"];

export const TR_15_BESPOKE_MODIFIERS = Object.freeze({
  allowedMetarIcaos: [] as const,
  coldBasinAirportIcaos: [] as const,
  rainShadowMultiplier: 0.78
});

/**
 * TR-15 Burdur — Tuzlu Tektonik Göl Çanağı (845 m Göl, 950 m Merkez) & Salda/Tefenni Yaylası (WMO 17241 / MGM 17238 Tier-A)
 *
 * Fiziksel Karakteristikler:
 *  - Batı Toros / Katrancık – Söğüt sırtlarının rüzgaraltında kaldığı için Isparta'ya kıyasla
 *    belirgin yağış gölgesi (`rainShadowMultiplier: 0.78`) ve yazın daha sıcak/kuru tektonik çanak.
 *  - Tuzlu/alkali Burdur Gölü (845 m, kışın donmaz) ve Salda Gölü (1140 m, `effectiveFetchKm < 35`).
 *  - Çeltikçi Beli ve Çubuk Boğazı koridorlarından kuzeyli/güneyli kanalize rüzgar geçişi.
 *  - `LTFC` Süleyman Demirel Havalimanı kesinlikle Isparta'da (`TR-32`) kalır; `icaoWhitelist: []`.
 */
export const PROVINCE_SPEC_TR_15: ProvinceSpec = {
  provinceCode: "TR-15",
  plateCode: 15,
  slug: "burdur",
  nameTr: "Burdur",
  region: "MEDITERRANEAN",
  climateRegion: "AKDENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "INLAND_PASS_PLATEAU",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 36.7982,
    maxLat: 37.8453,
    minLon: 29.3298,
    maxLon: 30.9138
  },
  primaryCenter: {
    mgmMerkezId: 91501,
    mgmIstNo: 17238,
    mgmSaatlikIstNo: 17238,
    mgmGunlukIstNo: 91501,
    wmoId: "17241",
    lat: 37.722,
    lon: 30.294,
    demVerifiedElevationM: 950,
    subBasinId: "BURDUR_TECTONIC_LAKE_BASIN",
    urbanFraction: 0.62,
    monthlyTmaxNormalsC: CLIM_TR_15.tmaxC,
    monthlyTminNormalsC: CLIM_TR_15.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-15-bucak-cubuk",
      name: "Bucak – Çubuk Boğazı Eşiği",
      role: "plain",
      lat: 37.459,
      lon: 30.585,
      elevationM: 875
    },
    {
      id: "tr-15-celtikci",
      name: "Çeltikçi Geçit Ovası",
      role: "plain",
      lat: 37.5642,
      lon: 30.4425,
      elevationM: 927
    },
    {
      id: "tr-15-tefenni-yesilova",
      name: "Yeşilova – Tefenni Yaylası (Salda)",
      role: "foothill",
      lat: 37.5006,
      lon: 29.7408,
      elevationM: 1206
    },
    {
      id: "tr-15-salda-kayak",
      name: "Salda Kayak Merkezi (Tınaztepe / Eşeler)",
      role: "summit",
      lat: 37.4725,
      lon: 29.6741,
      elevationM: 1810
    }
  ],
  subBasins: [
    {
      id: "BURDUR_TECTONIC_LAKE_BASIN",
      labelTr: "Burdur Tuzlu Tektonik Göl Çanağı (845–1020 m)",
      polygonOrBbox: {
        minLat: 37.56,
        maxLat: 37.84,
        minLon: 30.02,
        maxLon: 30.42
      },
      elevationRangeM: [845, 1020],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.62
    },
    {
      id: "BUCAK_CELTIKCI_CORRIDOR",
      labelTr: "Bucak – Çeltikçi – Çubuk Boğazı Geçit Havzası",
      polygonOrBbox: {
        minLat: 37.24,
        maxLat: 37.66,
        minLon: 30.38,
        maxLon: 30.88
      },
      elevationRangeM: [450, 1150],
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.34
    },
    {
      id: "TEFENNI_YESILOVA_HIGH_PLATEAU",
      labelTr: "Salda – Yeşilova – Tefenni – Karamanlı Yaylası (1150 m+)",
      polygonOrBbox: {
        minLat: 37.22,
        maxLat: 37.62,
        minLon: 29.58,
        maxLon: 30.08
      },
      elevationRangeM: [1140, 1480],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.22
    },
    {
      id: "GOLHISAR_ALTINYAYLA_BASIN",
      labelTr: "Gölhisar – Çavdır – Altınyayla Güneybatı Havzası",
      polygonOrBbox: {
        minLat: 36.88,
        maxLat: 37.24,
        minLon: 29.35,
        maxLon: 29.82
      },
      elevationRangeM: [940, 1380],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.25
    },
    {
      id: "ESELER_SOGUT_ALPINE",
      labelTr: "Eşeler Dağı (2598 m) & Salda Kayak Yüksek Kuşağı",
      polygonOrBbox: {
        minLat: 37.34,
        maxLat: 37.54,
        minLon: 29.55,
        maxLon: 29.82
      },
      elevationRangeM: [1500, 2598],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.03
    }
  ],
  barrierCouplingMatrix: {
    BURDUR_TECTONIC_LAKE_BASIN: {
      BURDUR_TECTONIC_LAKE_BASIN: 1.0,
      BUCAK_CELTIKCI_CORRIDOR: 0.54,
      TEFENNI_YESILOVA_HIGH_PLATEAU: 0.42,
      GOLHISAR_ALTINYAYLA_BASIN: 0.26,
      ESELER_SOGUT_ALPINE: 0.2
    },
    BUCAK_CELTIKCI_CORRIDOR: {
      BURDUR_TECTONIC_LAKE_BASIN: 0.54,
      BUCAK_CELTIKCI_CORRIDOR: 1.0,
      TEFENNI_YESILOVA_HIGH_PLATEAU: 0.28,
      GOLHISAR_ALTINYAYLA_BASIN: 0.24,
      ESELER_SOGUT_ALPINE: 0.18
    },
    TEFENNI_YESILOVA_HIGH_PLATEAU: {
      BURDUR_TECTONIC_LAKE_BASIN: 0.42,
      BUCAK_CELTIKCI_CORRIDOR: 0.28,
      TEFENNI_YESILOVA_HIGH_PLATEAU: 1.0,
      GOLHISAR_ALTINYAYLA_BASIN: 0.62,
      ESELER_SOGUT_ALPINE: 0.52
    },
    GOLHISAR_ALTINYAYLA_BASIN: {
      BURDUR_TECTONIC_LAKE_BASIN: 0.26,
      BUCAK_CELTIKCI_CORRIDOR: 0.24,
      TEFENNI_YESILOVA_HIGH_PLATEAU: 0.62,
      GOLHISAR_ALTINYAYLA_BASIN: 1.0,
      ESELER_SOGUT_ALPINE: 0.44
    },
    ESELER_SOGUT_ALPINE: {
      BURDUR_TECTONIC_LAKE_BASIN: 0.2,
      BUCAK_CELTIKCI_CORRIDOR: 0.18,
      TEFENNI_YESILOVA_HIGH_PLATEAU: 0.52,
      GOLHISAR_ALTINYAYLA_BASIN: 0.44,
      ESELER_SOGUT_ALPINE: 1.0
    }
  },
  stationOverrides: {
    "17238": {
      stationId: 17238,
      nameTr: "Burdur Merkez (WMO 17241 / MGM 17238)",
      lat: 37.722,
      lon: 30.294,
      demElevationM: 950,
      subBasinId: "BURDUR_TECTONIC_LAKE_BASIN",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "basin_floor"
    },
    "17894": {
      stationId: 17894,
      nameTr: "Bucak",
      lat: 37.459,
      lon: 30.585,
      demElevationM: 875,
      subBasinId: "BUCAK_CELTIKCI_CORRIDOR",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.4,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17892": {
      stationId: 17892,
      nameTr: "Tefenni Yaylası",
      lat: 37.3161,
      lon: 29.7792,
      demElevationM: 1142,
      subBasinId: "TEFENNI_YESILOVA_HIGH_PLATEAU",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.76,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18113": {
      stationId: 18113,
      nameTr: "Yeşilova (Salda Platosu)",
      lat: 37.5006,
      lon: 29.7408,
      demElevationM: 1206,
      subBasinId: "TEFENNI_YESILOVA_HIGH_PLATEAU",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18956": {
      stationId: 18956,
      nameTr: "Salda Kayak Merkezi (Tınaztepe)",
      lat: 37.4725,
      lon: 29.6741,
      demElevationM: 1810,
      subBasinId: "ESELER_SOGUT_ALPINE",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.16,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [450, 950, 1380, 2050],
    maxPhysicalPeakM: 2598,
    snowElevationBands: HYPSO_TR_15.bands
  },
  waterBodies: [
    {
      id: "BURDUR_SALINE_TECTONIC_LAKE",
      labelTr: "Burdur Tuzlu Tektonik Gölü (845 m)",
      kind: "alkaline_lake",
      mgmMarineStationIds: [],
      sampleCoord: { lat: 37.74, lon: 30.18 },
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 845,
      freezingPointC: -1.3,
      monthlyWaterTempNormalsC: [
        5.4, 6.1, 8.8, 13.0, 17.8, 22.4,
        25.4, 25.6, 21.8, 16.4, 10.8, 6.9
      ],
      subBasinInfluenceWeights: {
        BURDUR_TECTONIC_LAKE_BASIN: 0.56,
        BUCAK_CELTIKCI_CORRIDOR: 0.06,
        TEFENNI_YESILOVA_HIGH_PLATEAU: 0.08,
        GOLHISAR_ALTINYAYLA_BASIN: 0.02,
        ESELER_SOGUT_ALPINE: 0.02
      },
      onshoreWindSectorDeg: { fromDeg: 255, toDeg: 335 },
      effectiveFetchKm: 24,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 17.5,
      dekHeavyDeltaTC: 22.5,
      seaBreezeSpec: {
        activeMonths: [5, 9],
        sectorDeg: { fromDeg: 270, toDeg: 330 },
        maxInlandPenetrationKm: 9,
        maxCoolingAmplitudeC: 1.3
      }
    },
    {
      id: "SALDA_ALKALINE_LAKE",
      labelTr: "Salda Krater/Tektonik Gölü (1140 m)",
      kind: "alkaline_lake",
      mgmMarineStationIds: [],
      sampleCoord: { lat: 37.55, lon: 29.68 },
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 1140,
      freezingPointC: -0.6,
      monthlyWaterTempNormalsC: [
        4.0, 4.6, 7.0, 10.9, 15.2, 19.4,
        22.2, 22.5, 19.0, 14.2, 9.2, 5.5
      ],
      subBasinInfluenceWeights: {
        BURDUR_TECTONIC_LAKE_BASIN: 0.02,
        BUCAK_CELTIKCI_CORRIDOR: 0.0,
        TEFENNI_YESILOVA_HIGH_PLATEAU: 0.34,
        GOLHISAR_ALTINYAYLA_BASIN: 0.06,
        ESELER_SOGUT_ALPINE: 0.08
      },
      onshoreWindSectorDeg: { fromDeg: 310, toDeg: 50 },
      effectiveFetchKm: 8,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 19.0,
      dekHeavyDeltaTC: 24.0,
      seaBreezeSpec: {
        activeMonths: [6, 9],
        sectorDeg: { fromDeg: 320, toDeg: 45 },
        maxInlandPenetrationKm: 5,
        maxCoolingAmplitudeC: 0.9
      }
    }
  ],
  directionalBarriers: [
    {
      id: "WESTERN_TAURUS_KATRANCIK_LEE_SHADOW",
      labelTr: "Batı Toros – Katrancık / Söğüt Rüzgaraltı Yağış Gölgesi",
      effectiveBarrierHeightM: 2328,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "BURDUR_TECTONIC_LAKE_BASIN",
        "TEFENNI_YESILOVA_HIGH_PLATEAU"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 150, toDeg: 220 },
        minCrossCrestSpeedMs: 15.5,
        minFroudeNumber: 0.52,
        sourcePlateauElevationM: 1200,
        maxTargetElevationM: 1000,
        maxWarmingCapC: 2.8,
        subCloudVirgaFactor: 0.28,
        wetCutoffMmHr: 1.0
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 295, toDeg: 350 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.14,
        maxPrecipMultiplierCap: 1.22
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 145, toDeg: 225 },
        precipAttenuationFactor: 0.78
      }
    },
    {
      id: "ESELER_SALDA_HIGHLAND_WALL",
      labelTr: "Eşeler Dağı (2598 m) – Salda Yüksek Yamaç Bariyeri",
      effectiveBarrierHeightM: 2598,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "TEFENNI_YESILOVA_HIGH_PLATEAU",
        "GOLHISAR_ALTINYAYLA_BASIN",
        "ESELER_SOGUT_ALPINE"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 240, toDeg: 285 },
        minCrossCrestSpeedMs: 12.5,
        minFroudeNumber: 0.45,
        sourcePlateauElevationM: 1180,
        maxTargetElevationM: 1020,
        maxWarmingCapC: 2.2,
        subCloudVirgaFactor: 0.22,
        wetCutoffMmHr: 0.9
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 205, toDeg: 255 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.2,
        maxPrecipMultiplierCap: 1.38
      }
    }
  ],
  venturiCorridors: [
    {
      id: "CUBUK_BOGAZI_PASS",
      labelTr: "Çubuk Boğazı (Antalya – Bucak Geçidi)",
      centerCoord: { lat: 37.34, lon: 30.56 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 185,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.28,
      gustMultiplier: 1.38,
      suppressesNocturnalInversion: true
    },
    {
      id: "CELTIKCI_BELI_FUNNEL",
      labelTr: "Çeltikçi Beli – Ağlasun Geçit Koridoru",
      centerCoord: { lat: 37.5642, lon: 30.4425 },
      influenceRadiusKm: 18,
      channelAxisFromDeg: 170,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.24,
      gustMultiplier: 1.34,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 845,
    coldPoolMaxDepthM: 260,
    topographicEnclosureIndex: 0.74,
    deltaPressureTopHpa: 850,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 4.2
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.68
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 10, toDeg: 75 },
      minWindShearVs850Deg: 65
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.44,
    invertedVDryMicroburstSusceptibility: 0.62,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TARGET_BURDUR_CENTER",
      labelTr: "Burdur Merkez (950 m)",
      lat: 37.722,
      lon: 30.294,
      elevationM: 950,
      role: "target"
    },
    {
      key: "LAKE_BURDUR_SURFACE",
      labelTr: "Burdur Gölü Orta Çanak (845 m)",
      lat: 37.73,
      lon: 30.19,
      elevationM: 845,
      role: "marine_upwind"
    },
    {
      key: "CORRIDOR_CUBUK_BUCAK",
      labelTr: "Bucak – Çubuk Boğazı Girişi",
      lat: 37.459,
      lon: 30.585,
      elevationM: 875,
      role: "corridor"
    },
    {
      key: "CORRIDOR_CELTIKCI",
      labelTr: "Çeltikçi Beli",
      lat: 37.5642,
      lon: 30.4425,
      elevationM: 927,
      role: "corridor"
    },
    {
      key: "OROG_AGLASUN_EAST_RIDGE",
      labelTr: "Ağlasun – Batı Toros Doğu Sırtı",
      lat: 37.6364,
      lon: 30.5197,
      elevationM: 1450,
      role: "orographic_wall"
    },
    {
      key: "OROG_ESELER_SALDA_SUMMIT",
      labelTr: "Salda Tınaztepe / Eşeler Sırtı",
      lat: 37.4725,
      lon: 29.6741,
      elevationM: 1810,
      role: "orographic_wall"
    },
    {
      key: "PLATEAU_TEFENNI",
      labelTr: "Tefenni Yaylası (1142 m)",
      lat: 37.3161,
      lon: 29.7792,
      elevationM: 1142,
      role: "foehn_windward"
    },
    {
      key: "PLATEAU_YESILOVA",
      labelTr: "Yeşilova – Salda Havzası",
      lat: 37.5006,
      lon: 29.7408,
      elevationM: 1206,
      role: "lee_shadow"
    },
    {
      key: "BASIN_GOLHISAR_SW",
      labelTr: "Gölhisar Güneybatı Ovası",
      lat: 37.1427,
      lon: 29.526,
      elevationM: 990,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -24,
    maxPlausibleTempC: 44,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1044,
    kalmanTempBiasCapC: 5.5
  }
};

export default PROVINCE_SPEC_TR_15;
