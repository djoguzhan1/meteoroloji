import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_71 = TR81_CLIMATOLOGY_1991_2020["TR-71"];
const HYPSO_TR_71 = TR81_HYPSOMETRIC_PROFILES["TR-71"];

export const TR_71_BESPOKE_MODIFIERS = Object.freeze({
  allowedMetarIcaos: [] as const,
  coldBasinAirportIcaos: [] as const,
  ankaraLtacLeakageBlocked: true,
  deliceValleyFloorElevationM: 680,
  keskinPlateauElevationM: 1120
});

/**
 * ATMOS v5.0 — Wave 3B (REG-13) Bespoke Microclimate Spec: TR-71 Kırıkkale
 *
 * Key Physical & Synoptic Mechanisms:
 *  1. `TIER_B_DONOR_KALMAN` Calibration with Strict Zero-METAR Firewall (`icaoWhitelist: []`):
 *     Blocks cross-ridge Ankara Esenboğa (`LTAC`) frost-basin observations from leaking across
 *     Elmadağ / İdris Dağı into the `715–751 m` Kızılırmak valley.
 *  2. Sharp 3-Tier Hypsometric Contrast:
 *     - Delice Low Saline River Floor (`~674–680 m`): hottest summer maxima & strong nocturnal drainage.
 *     - Kırıkkale – Yahşihan – Bahşili Kızılırmak Trough (`~715–751 m`): main urban valley corridor.
 *     - Keskin (`~1,120–1,140 m`) & Çelebi (`~1,299 m`) High Granite Plateau + Dinek Dağı (`1,744 m`):
 *       2.5–3.5°C cooler than Kırıkkale valley floor with much earlier snow accumulation.
 *  3. Strictly Continental (`waterBodies: []` — ZERO sea-effect DEK).
 */
const SPEC_TR_71: ProvinceSpec = {
  provinceCode: "TR-71",
  plateCode: 71,
  slug: "kirikkale",
  nameTr: "Kırıkkale",
  region: "CENTRAL_ANATOLIA",
  climateRegion: "IC_ANADOLU",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "CENTRAL_ANATOLIA_BASIN",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 39.3965,
    maxLat: 40.335,
    minLon: 33.186,
    maxLon: 34.2082
  },
  primaryCenter: {
    mgmMerkezId: 97101,
    mgmIstNo: 17135,
    mgmSaatlikIstNo: 17135,
    mgmGunlukIstNo: 97101,
    lat: 39.8433,
    lon: 33.5181,
    demVerifiedElevationM: 751,
    subBasinId: "kizilirmak_yahsihan_trough",
    urbanFraction: 0.64,
    monthlyTmaxNormalsC: CLIM_TR_71.tmaxC,
    monthlyTminNormalsC: CLIM_TR_71.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-71-delice-vadi",
      name: "Delice Alçak Tuzlu Vadi Tabanı (~680 m)",
      role: "plain",
      lat: 39.9406,
      lon: 34.0328,
      elevationM: 680
    },
    {
      id: "tr-71-yahsihan-kizilirmak",
      name: "Yahşihan – Kızılırmak Vadi Oluğu (720 m)",
      role: "plain",
      lat: 39.851,
      lon: 33.4527,
      elevationM: 720
    },
    {
      id: "tr-71-keskin-plato",
      name: "Keskin Yüksek Platosu (~1120 m)",
      role: "foothill",
      lat: 39.6682,
      lon: 33.6118,
      elevationM: 1120
    },
    {
      id: "tr-71-dinek-dagi",
      name: "Dinek Dağı Zirve Kuşağı (1620–1744 m)",
      role: "summit",
      lat: 39.81,
      lon: 33.78,
      elevationM: 1620
    }
  ],
  subBasins: [
    {
      id: "kizilirmak_yahsihan_trough",
      labelTr: "Kırıkkale Merkez – Yahşihan – Bahşili Kızılırmak Vadi Oluğu (715–820 m)",
      polygonOrBbox: {
        minLat: 39.7,
        maxLat: 39.98,
        minLon: 33.36,
        maxLon: 33.62
      },
      elevationRangeM: [715, 825],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.64
    },
    {
      id: "delice_low_saline_valley",
      labelTr: "Delice – Sulakyurt Alçak Tuzlu Çay Vadi Tabanı (~660–760 m)",
      polygonOrBbox: {
        minLat: 39.88,
        maxLat: 40.28,
        minLon: 33.68,
        maxLon: 34.18
      },
      elevationRangeM: [660, 880],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.2
    },
    {
      id: "keskin_celebi_high_plateau",
      labelTr: "Keskin (~1120 m) – Çelebi Yüksek Granit Platosu",
      polygonOrBbox: {
        minLat: 39.42,
        maxLat: 39.74,
        minLon: 33.46,
        maxLon: 33.86
      },
      elevationRangeM: [1020, 1380],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.24
    },
    {
      id: "baliseyh_karakecili_steppe",
      labelTr: "Balışeyh – Karakeçili Bozkır Geçiş Kuşağı",
      polygonOrBbox: {
        minLat: 39.54,
        maxLat: 39.96,
        minLon: 33.24,
        maxLon: 33.82
      },
      elevationRangeM: [800, 1020],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.22
    },
    {
      id: "dinek_kure_summit",
      labelTr: "Dinek Dağı (1744 m) & Küre Dağı Yüksek Sırtı",
      polygonOrBbox: {
        minLat: 39.74,
        maxLat: 39.88,
        minLon: 33.68,
        maxLon: 33.92
      },
      elevationRangeM: [1380, 1744],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.03
    }
  ],
  barrierCouplingMatrix: {
    kizilirmak_yahsihan_trough: {
      kizilirmak_yahsihan_trough: 1.0,
      delice_low_saline_valley: 0.56,
      keskin_celebi_high_plateau: 0.3,
      baliseyh_karakecili_steppe: 0.58,
      dinek_kure_summit: 0.22
    },
    delice_low_saline_valley: {
      kizilirmak_yahsihan_trough: 0.56,
      delice_low_saline_valley: 1.0,
      keskin_celebi_high_plateau: 0.22,
      baliseyh_karakecili_steppe: 0.52,
      dinek_kure_summit: 0.2
    },
    keskin_celebi_high_plateau: {
      kizilirmak_yahsihan_trough: 0.3,
      delice_low_saline_valley: 0.22,
      keskin_celebi_high_plateau: 1.0,
      baliseyh_karakecili_steppe: 0.48,
      dinek_kure_summit: 0.56
    },
    baliseyh_karakecili_steppe: {
      kizilirmak_yahsihan_trough: 0.58,
      delice_low_saline_valley: 0.52,
      keskin_celebi_high_plateau: 0.48,
      baliseyh_karakecili_steppe: 1.0,
      dinek_kure_summit: 0.38
    },
    dinek_kure_summit: {
      kizilirmak_yahsihan_trough: 0.22,
      delice_low_saline_valley: 0.2,
      keskin_celebi_high_plateau: 0.56,
      baliseyh_karakecili_steppe: 0.38,
      dinek_kure_summit: 1.0
    }
  },
  stationOverrides: {
    "17135": {
      stationId: 17135,
      nameTr: "Kırıkkale Merkez (MGM 17135)",
      lat: 39.8433,
      lon: 33.5181,
      demElevationM: 751,
      subBasinId: "kizilirmak_yahsihan_trough",
      urbanFraction: 0.64,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "basin_floor"
    },
    "19216": {
      stationId: 19216,
      nameTr: "Yahşihan (Kızılırmak Vadi Oluğu)",
      lat: 39.851,
      lon: 33.4527,
      demElevationM: 720,
      subBasinId: "kizilirmak_yahsihan_trough",
      urbanFraction: 0.48,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "basin_floor"
    },
    "18081": {
      stationId: 18081,
      nameTr: "Delice (Alçak Tuzlu Vadi Tabanı)",
      lat: 39.9406,
      lon: 34.0328,
      demElevationM: 680,
      subBasinId: "delice_low_saline_valley",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17730": {
      stationId: 17730,
      nameTr: "Keskin (Yüksek Granit Platosu)",
      lat: 39.6682,
      lon: 33.6118,
      demElevationM: 1120,
      subBasinId: "keskin_celebi_high_plateau",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18254": {
      stationId: 18254,
      nameTr: "Çelebi",
      lat: 39.4642,
      lon: 33.5178,
      demElevationM: 1299,
      subBasinId: "keskin_celebi_high_plateau",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [670, 751, 1140, 1620],
    maxPhysicalPeakM: 1744,
    snowElevationBands: HYPSO_TR_71.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "ELMADAG_IDRIS_WEST_LEE_WALL",
      labelTr: "Elmadağ – İdris Dağı Batı Rüzgaraltı Gölge Bariyeri",
      effectiveBarrierHeightM: 1862,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "kizilirmak_yahsihan_trough",
        "baliseyh_karakecili_steppe",
        "delice_low_saline_valley"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 245, toDeg: 305 },
        minCrossCrestSpeedMs: 9.5,
        minFroudeNumber: 0.44,
        sourcePlateauElevationM: 1050,
        maxTargetElevationM: 830,
        maxWarmingCapC: 2.5,
        subCloudVirgaFactor: 0.26,
        wetCutoffMmHr: 0.8
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 350, toDeg: 55 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.18,
        maxPrecipMultiplierCap: 1.28
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 250, toDeg: 300 },
        precipAttenuationFactor: 0.82
      }
    },
    {
      id: "DINEK_KESKIN_PLATEAU_STEP",
      labelTr: "Dinek Dağı (1744 m) – Keskin Yüksek Plato Basamağı",
      effectiveBarrierHeightM: 1744,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "keskin_celebi_high_plateau",
        "dinek_kure_summit"
      ],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 200, toDeg: 250 },
        minCrossCrestSpeedMs: 12.0,
        minFroudeNumber: 0.5,
        sourcePlateauElevationM: 1000,
        maxTargetElevationM: 900,
        maxWarmingCapC: 1.5,
        subCloudVirgaFactor: 0.2,
        wetCutoffMmHr: 0.6
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 185, toDeg: 260 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.22,
        maxPrecipMultiplierCap: 1.36
      }
    }
  ],
  venturiCorridors: [
    {
      id: "KIZILIRMAK_YAHSIHAN_CHANNEL",
      labelTr: "Kızılırmak – Yahşihan – Bahşili Güney–Kuzey Vadi Kanalı",
      centerCoord: { lat: 39.84, lon: 33.46 },
      influenceRadiusKm: 18,
      channelAxisFromDeg: 195,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.24,
      gustMultiplier: 1.35,
      suppressesNocturnalInversion: true
    },
    {
      id: "DELICE_CAYI_GAP",
      labelTr: "Delice Çayı Doğu Bozkır Oluğu",
      centerCoord: { lat: 39.9406, lon: 34.0328 },
      influenceRadiusKm: 18,
      channelAxisFromDeg: 250,
      bidirectional: true,
      sectorHalfWidthDeg: 26,
      speedMultiplier: 1.18,
      gustMultiplier: 1.28,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 680,
    coldPoolMaxDepthM: 270,
    topographicEnclosureIndex: 0.78,
    deltaPressureTopHpa: 850,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 5.6
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.56
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 15, toDeg: 85 },
      minWindShearVs850Deg: 60
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.48,
    invertedVDryMicroburstSusceptibility: 0.68,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "target_kirikkale_17135",
      labelTr: "Kırıkkale Merkez – Kızılırmak Vadisi (751 m)",
      lat: 39.8433,
      lon: 33.5181,
      elevationM: 751,
      role: "target"
    },
    {
      key: "trough_yahsihan_floor",
      labelTr: "Yahşihan Vadi Tabanı (720 m)",
      lat: 39.851,
      lon: 33.4527,
      elevationM: 720,
      role: "corridor"
    },
    {
      key: "valley_delice_saline",
      labelTr: "Delice Alçak Tuzlu Vadi (680 m)",
      lat: 39.9406,
      lon: 34.0328,
      elevationM: 680,
      role: "lee_shadow"
    },
    {
      key: "plateau_keskin_high",
      labelTr: "Keskin Yüksek Platosu (1120 m)",
      lat: 39.6682,
      lon: 33.6118,
      elevationM: 1120,
      role: "orographic_wall"
    },
    {
      key: "orog_dinek_summit",
      labelTr: "Dinek Dağı Sırtı (1620 m)",
      lat: 39.81,
      lon: 33.78,
      elevationM: 1620,
      role: "orographic_wall"
    },
    {
      key: "plateau_celebi_south",
      labelTr: "Çelebi Güney Platosu (1299 m)",
      lat: 39.4642,
      lon: 33.5178,
      elevationM: 1299,
      role: "orographic_wall"
    },
    {
      key: "corridor_bahsili_sw",
      labelTr: "Bahşili Kızılırmak Boğazı (798 m)",
      lat: 39.7356,
      lon: 33.4297,
      elevationM: 798,
      role: "foehn_windward"
    },
    {
      key: "steppe_karakecili",
      labelTr: "Karakeçili Geçidi (814 m)",
      lat: 39.5944,
      lon: 33.3817,
      elevationM: 814,
      role: "foehn_windward"
    },
    {
      key: "valley_sulakyurt_north",
      labelTr: "Sulakyurt Kuzey Vadisi (878 m)",
      lat: 40.1606,
      lon: 33.7131,
      elevationM: 878,
      role: "corridor"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -28,
    maxPlausibleTempC: 44,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 6.2
  }
};

export const PROVINCE_SPEC_TR_71: ProvinceSpec = Object.freeze(SPEC_TR_71);
export default PROVINCE_SPEC_TR_71;
