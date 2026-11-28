import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_40 = TR81_CLIMATOLOGY_1991_2020["TR-40"];
const HYPSO_TR_40 = TR81_HYPSOMETRIC_PROFILES["TR-40"];

export const TR_40_BESPOKE_MODIFIERS = Object.freeze({
  allowedMetarIcaos: [] as const,
  coldBasinAirportIcaos: [] as const,
  invertedVDryMicroburstSusceptibility: 0.74
});

/**
 * ATMOS v5.0 — Wave 3B (REG-13) Bespoke Microclimate Spec: TR-40 Kırşehir
 *
 * Key Physical & Synoptic Mechanisms:
 *  1. Middle Kızılırmak / Kılıçözü Continental Steppe Basin (`~1,007 m`, WMO `17160` Tier-A):
 *     Enclosed between Kervansaray / Baran Dağı (`1,720–1,825 m`) and Kaman highlands, forming a
 *     strong nocturnal continental cold-air pool (`topographicEnclosureIndex: 0.79`) in winter.
 *  2. Summer Afternoon Inverted-V Dry Microburst Regime:
 *     Deep dry sub-cloud adiabatic boundary layers (`invertedVDryMicroburstSusceptibility: 0.74`)
 *     drive evaporative downdraft gusts and blowing steppe dust during May–September convection.
 *  3. Strictly Zero External METAR Bleed (`icaoWhitelist: []`) & `waterBodies: []` (ZERO DEK).
 */
const SPEC_TR_40: ProvinceSpec = {
  provinceCode: "TR-40",
  plateCode: 40,
  slug: "kirsehir",
  nameTr: "Kırşehir",
  region: "CENTRAL_ANATOLIA",
  climateRegion: "IC_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "CENTRAL_ANATOLIA_BASIN",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 38.823,
    maxLat: 39.7985,
    minLon: 33.4063,
    maxLon: 34.7048
  },
  primaryCenter: {
    mgmMerkezId: 94001,
    mgmIstNo: 17160,
    mgmSaatlikIstNo: 17160,
    mgmGunlukIstNo: 94001,
    wmoId: "17160",
    lat: 39.1639,
    lon: 34.1561,
    demVerifiedElevationM: 1007,
    subBasinId: "kilicozu_kirsehir_basin",
    urbanFraction: 0.58,
    monthlyTmaxNormalsC: CLIM_TR_40.tmaxC,
    monthlyTminNormalsC: CLIM_TR_40.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-40-cicekdagi-vadi",
      name: "Çiçekdağı – Delice Vadi Eşiği",
      role: "plain",
      lat: 39.6067,
      lon: 34.4235,
      elevationM: 900
    },
    {
      id: "tr-40-kaman",
      name: "Kaman – Hirfanlı Doğu Havzası",
      role: "foothill",
      lat: 39.3652,
      lon: 33.7064,
      elevationM: 1075
    },
    {
      id: "tr-40-mucur-bozkir",
      name: "Mucur – Boztepe Bozkır Platosu",
      role: "foothill",
      lat: 39.0602,
      lon: 34.3767,
      elevationM: 1074
    },
    {
      id: "tr-40-akcakent-kervansaray",
      name: "Akçakent – Baran / Kervansaray Sırtı",
      role: "summit",
      lat: 39.6128,
      lon: 34.0944,
      elevationM: 1450
    }
  ],
  subBasins: [
    {
      id: "kilicozu_kirsehir_basin",
      labelTr: "Kırşehir Merkez – Kılıçözü Çayı Bozkır Çanağı (~980–1080 m)",
      polygonOrBbox: {
        minLat: 39.04,
        maxLat: 39.28,
        minLon: 34.02,
        maxLon: 34.3
      },
      elevationRangeM: [975, 1090],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.58
    },
    {
      id: "kaman_hirfanli_basin",
      labelTr: "Kaman – Orta Kızılırmak / Hirfanlı Havzası (820–1120 m)",
      polygonOrBbox: {
        minLat: 39.12,
        maxLat: 39.48,
        minLon: 33.45,
        maxLon: 33.98
      },
      elevationRangeM: [820, 1120],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.28
    },
    {
      id: "mucur_boztepe_steppe",
      labelTr: "Mucur – Boztepe – Seyfe Bozkır ve Kapalı Çanak Platosu",
      polygonOrBbox: {
        minLat: 38.94,
        maxLat: 39.42,
        minLon: 34.24,
        maxLon: 34.68
      },
      elevationRangeM: [1040, 1340],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.22
    },
    {
      id: "cicekdagi_north_valley",
      labelTr: "Çiçekdağı – Akpınar Kuzey Bozkır Vadisi",
      polygonOrBbox: {
        minLat: 39.42,
        maxLat: 39.76,
        minLon: 33.88,
        maxLon: 34.58
      },
      elevationRangeM: [860, 1200],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.24
    },
    {
      id: "kervansaray_baran_ridge",
      labelTr: "Kervansaray – Baran Dağı & Akçakent Yüksek Sırtları (1350–1825 m)",
      polygonOrBbox: {
        minLat: 39.2,
        maxLat: 39.68,
        minLon: 33.98,
        maxLon: 34.34
      },
      elevationRangeM: [1350, 1825],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.04
    }
  ],
  barrierCouplingMatrix: {
    kilicozu_kirsehir_basin: {
      kilicozu_kirsehir_basin: 1.0,
      kaman_hirfanli_basin: 0.48,
      mucur_boztepe_steppe: 0.58,
      cicekdagi_north_valley: 0.36,
      kervansaray_baran_ridge: 0.32
    },
    kaman_hirfanli_basin: {
      kilicozu_kirsehir_basin: 0.48,
      kaman_hirfanli_basin: 1.0,
      mucur_boztepe_steppe: 0.28,
      cicekdagi_north_valley: 0.44,
      kervansaray_baran_ridge: 0.34
    },
    mucur_boztepe_steppe: {
      kilicozu_kirsehir_basin: 0.58,
      kaman_hirfanli_basin: 0.28,
      mucur_boztepe_steppe: 1.0,
      cicekdagi_north_valley: 0.42,
      kervansaray_baran_ridge: 0.38
    },
    cicekdagi_north_valley: {
      kilicozu_kirsehir_basin: 0.36,
      kaman_hirfanli_basin: 0.44,
      mucur_boztepe_steppe: 0.42,
      cicekdagi_north_valley: 1.0,
      kervansaray_baran_ridge: 0.46
    },
    kervansaray_baran_ridge: {
      kilicozu_kirsehir_basin: 0.3,
      kaman_hirfanli_basin: 0.32,
      mucur_boztepe_steppe: 0.36,
      cicekdagi_north_valley: 0.46,
      kervansaray_baran_ridge: 1.0
    }
  },
  stationOverrides: {
    "17160": {
      stationId: 17160,
      nameTr: "Kırşehir Merkez (WMO 17160)",
      lat: 39.1639,
      lon: 34.1561,
      demElevationM: 1007,
      subBasinId: "kilicozu_kirsehir_basin",
      urbanFraction: 0.58,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "basin_floor"
    },
    "17756": {
      stationId: 17756,
      nameTr: "Kaman",
      lat: 39.3652,
      lon: 33.7064,
      demElevationM: 1075,
      subBasinId: "kaman_hirfanli_basin",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17758": {
      stationId: 17758,
      nameTr: "Mucur",
      lat: 39.0602,
      lon: 34.3767,
      demElevationM: 1074,
      subBasinId: "mucur_boztepe_steppe",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.76,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17732": {
      stationId: 17732,
      nameTr: "Çiçekdağı",
      lat: 39.6067,
      lon: 34.4235,
      demElevationM: 900,
      subBasinId: "cicekdagi_north_valley",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.64,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18462": {
      stationId: 18462,
      nameTr: "Akçakent (Yüksek Meşe Platosu)",
      lat: 39.6128,
      lon: 34.0944,
      demElevationM: 1450,
      subBasinId: "kervansaray_baran_ridge",
      urbanFraction: 0.08,
      coldPoolSusceptibility: 0.24,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [820, 1007, 1320, 1720],
    maxPhysicalPeakM: 1825,
    snowElevationBands: HYPSO_TR_40.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "KERVANSARAY_BARAN_CENTRAL_RIDGE",
      labelTr: "Kervansaray – Baran Dağı (1825 m) Kılıçözü Çanak Bariyeri",
      effectiveBarrierHeightM: 1825,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "kilicozu_kirsehir_basin",
        "mucur_boztepe_steppe",
        "kervansaray_baran_ridge"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 25, toDeg: 75 },
        minCrossCrestSpeedMs: 10.5,
        minFroudeNumber: 0.46,
        sourcePlateauElevationM: 1120,
        maxTargetElevationM: 1040,
        maxWarmingCapC: 2.0,
        subCloudVirgaFactor: 0.28,
        wetCutoffMmHr: 0.7
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 195, toDeg: 255 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.2,
        maxPrecipMultiplierCap: 1.34
      }
    }
  ],
  venturiCorridors: [
    {
      id: "KIZILIRMAK_KESIKKOPRU_TROUGH",
      labelTr: "Orta Kızılırmak – Kesikköprü Güneybatı Vadi Oluğu",
      centerCoord: { lat: 39.06, lon: 33.92 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 315,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.2,
      gustMultiplier: 1.32,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 985,
    coldPoolMaxDepthM: 290,
    topographicEnclosureIndex: 0.79,
    deltaPressureTopHpa: 850,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 6.2
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.58
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 20, toDeg: 95 },
      minWindShearVs850Deg: 60
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.52,
    invertedVDryMicroburstSusceptibility: 0.74,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "target_kirsehir_17160",
      labelTr: "Kırşehir Merkez – Kılıçözü (1007 m)",
      lat: 39.1639,
      lon: 34.1561,
      elevationM: 1007,
      role: "target"
    },
    {
      key: "orog_kervansaray_ridge",
      labelTr: "Kervansaray Dağı Sırtı (1680 m)",
      lat: 39.24,
      lon: 34.26,
      elevationM: 1680,
      role: "orographic_wall"
    },
    {
      key: "orog_akcakent_highland",
      labelTr: "Akçakent – Çiçekdağı Yükseltisi (1450 m)",
      lat: 39.6128,
      lon: 34.0944,
      elevationM: 1450,
      role: "orographic_wall"
    },
    {
      key: "valley_kaman_west",
      labelTr: "Kaman Batı Platosu (1075 m)",
      lat: 39.3652,
      lon: 33.7064,
      elevationM: 1075,
      role: "foehn_windward"
    },
    {
      key: "basin_hirfanli_east_bank",
      labelTr: "Hirfanlı Doğu Kıyısı (855 m)",
      lat: 39.22,
      lon: 33.66,
      elevationM: 855,
      role: "corridor"
    },
    {
      key: "steppe_mucur_se",
      labelTr: "Mucur Güneydoğu Bozkırı (1074 m)",
      lat: 39.0602,
      lon: 34.3767,
      elevationM: 1074,
      role: "lee_shadow"
    },
    {
      key: "steppe_boztepe_seyfe",
      labelTr: "Boztepe – Seyfe Çanağı (1127 m)",
      lat: 39.3038,
      lon: 34.3421,
      elevationM: 1127,
      role: "lee_shadow"
    },
    {
      key: "valley_cicekdagi_ne",
      labelTr: "Çiçekdağı Kuzeydoğu Vadisi (900 m)",
      lat: 39.6067,
      lon: 34.4235,
      elevationM: 900,
      role: "corridor"
    },
    {
      key: "plateau_akpinar_nw",
      labelTr: "Akpınar Kuzeybatı Eşiği (1156 m)",
      lat: 39.4486,
      lon: 33.977,
      elevationM: 1156,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -30,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 6.5
  }
};

export const PROVINCE_SPEC_TR_40: ProvinceSpec = Object.freeze(SPEC_TR_40);
export default PROVINCE_SPEC_TR_40;
