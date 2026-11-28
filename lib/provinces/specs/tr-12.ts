import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_12 = TR81_CLIMATOLOGY_1991_2020["TR-12"];
const HYPSO_TR_12 = TR81_HYPSOMETRIC_PROFILES["TR-12"];

/**
 * ATMOS v5.0 — Wave 3C (REG-19) Bespoke Microclimate Spec: TR-12 Bingöl
 *
 * Key Physical Mechanisms:
 *  1. Southeastern Taurus Frontal Overrunning Wall (Genç – Çapakçur – Hesarek):
 *     Warm, moisture-laden S/SW Mediterranean & Basra cyclonic air ascends sharply from the
 *     Diyarbakır basin up the Murat River gorge (`~980 m`) into Bingöl (`1,139 m`) and Hesarek
 *     (`1,970–2,500 m`), producing heavy wet/dense snowfall (`SLR ~8–11`) and intense upslope rates.
 *  2. Karlıova High-Altitude Blizzard Saddle (`1,828–1,940 m`):
 *     Triple-divide junction between Bingöl Dağları and Şerafettin Dağları acting as Eastern
 *     Anatolia's premier winter blizzard & drifting-snow bottleneck (`1.38x` Venturi speed,
 *     `1.52x` gust amplification), thermally decoupled (`<= 0.18`) from the milder Çapakçur basin.
 *  3. Shallow Continental NE Cold-Wedge Under SW Aloft Overrunning:
 *     Surface NE cold advection channeled from Karlıova locks sub-freezing air in the basin
 *     even while 850/700 hPa SSW warm advection overruns aloft, preventing false rain transitions.
 */
const SPEC_TR_12: ProvinceSpec = {
  provinceCode: "TR-12",
  plateCode: 12,
  slug: "bingol",
  nameTr: "Bingöl",
  region: "EASTERN_ANATOLIA",
  climateRegion: "DOGU_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "HIGH_EAST_SNOW_BASIN",
  icaoWhitelist: ["LTCU"],
  domainBounds: {
    minLat: 38.4767,
    maxLat: 39.565,
    minLon: 39.9345,
    maxLon: 41.266
  },
  primaryCenter: {
    mgmMerkezId: 91201,
    mgmIstNo: 17203,
    mgmSaatlikIstNo: 17203,
    mgmGunlukIstNo: 91201,
    wmoId: "17203",
    lat: 38.8847,
    lon: 40.5007,
    demVerifiedElevationM: 1139,
    subBasinId: "capakcur_bingol_basin",
    urbanFraction: 0.58,
    monthlyTmaxNormalsC: CLIM_TR_12.tmaxC,
    monthlyTminNormalsC: CLIM_TR_12.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-12-bingol-merkez",
      name: "Bingöl Merkez · Çapakçur Ovası (WMO 17203)",
      role: "plain",
      lat: 38.8847,
      lon: 40.5007,
      elevationM: 1139
    },
    {
      id: "tr-12-genc-murat-vadi",
      name: "Genç (Murat Nehri Boğaz Girişi)",
      role: "plain",
      lat: 38.7616,
      lon: 40.5577,
      elevationM: 993
    },
    {
      id: "tr-12-solhan",
      name: "Solhan – Buğlan Geçidi Eteği",
      role: "foothill",
      lat: 38.9597,
      lon: 41.0503,
      elevationM: 1366
    },
    {
      id: "tr-12-kigi-adakli",
      name: "Kiğı – Peri Suyu Yukarı Havza",
      role: "foothill",
      lat: 39.3086,
      lon: 40.3458,
      elevationM: 1495
    },
    {
      id: "tr-12-karliova",
      name: "Karlıova (1.828–1.940 m Kış Tipi Kavşağı)",
      role: "summit",
      lat: 39.2936,
      lon: 41.0106,
      elevationM: 1828
    },
    {
      id: "tr-12-hesarek-kayak",
      name: "Hesarek Kayak Merkezi (Dikme / Zirve)",
      role: "summit",
      lat: 38.8871,
      lon: 40.2878,
      elevationM: 1970
    }
  ],
  subBasins: [
    {
      id: "capakcur_bingol_basin",
      labelTr: "Çapakçur Ovası & Bingöl Merkez Çanağı (Merkez – LTCU)",
      polygonOrBbox: { minLat: 38.8, maxLat: 39.04, minLon: 40.36, maxLon: 40.76 },
      elevationRangeM: [1020, 1380],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.54
    },
    {
      id: "genc_murat_gorge",
      labelTr: "Genç – Murat Nehri Alt Vadisi & Güneydoğu Toros Boğazı",
      polygonOrBbox: { minLat: 38.4767, maxLat: 38.82, minLon: 40.25, maxLon: 40.88 },
      elevationRangeM: [930, 1350],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.28
    },
    {
      id: "solhan_buglan_corridor",
      labelTr: "Solhan – Kuruca / Buğlan Geçidi Doğu Koridoru",
      polygonOrBbox: { minLat: 38.82, maxLat: 39.12, minLon: 40.76, maxLon: 41.266 },
      elevationRangeM: [1280, 1850],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.26
    },
    {
      id: "karliova_blizzard_hub",
      labelTr: "Karlıova Yüksek Kar & Tipi Düğüm Noktası (1800–2350m)",
      polygonOrBbox: { minLat: 39.12, maxLat: 39.52, minLon: 40.72, maxLon: 41.26 },
      elevationRangeM: [1720, 2350],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.2
    },
    {
      id: "hesarek_kigi_alpine",
      labelTr: "Hesarek Kayak Merkezi, Bingöl Dağları & Kiğı–Yayladere–Yedisu Dağ Kuşağı",
      polygonOrBbox: { minLat: 38.85, maxLat: 39.565, minLon: 39.9345, maxLon: 40.72 },
      elevationRangeM: [1420, 3250],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.1
    }
  ],
  barrierCouplingMatrix: {
    capakcur_bingol_basin: {
      capakcur_bingol_basin: 1.0,
      genc_murat_gorge: 0.68,
      solhan_buglan_corridor: 0.52,
      karliova_blizzard_hub: 0.18,
      hesarek_kigi_alpine: 0.24
    },
    genc_murat_gorge: {
      capakcur_bingol_basin: 0.68,
      genc_murat_gorge: 1.0,
      solhan_buglan_corridor: 0.42,
      karliova_blizzard_hub: 0.12,
      hesarek_kigi_alpine: 0.2
    },
    solhan_buglan_corridor: {
      capakcur_bingol_basin: 0.52,
      genc_murat_gorge: 0.42,
      solhan_buglan_corridor: 1.0,
      karliova_blizzard_hub: 0.44,
      hesarek_kigi_alpine: 0.36
    },
    karliova_blizzard_hub: {
      capakcur_bingol_basin: 0.18,
      genc_murat_gorge: 0.12,
      solhan_buglan_corridor: 0.44,
      karliova_blizzard_hub: 1.0,
      hesarek_kigi_alpine: 0.62
    },
    hesarek_kigi_alpine: {
      capakcur_bingol_basin: 0.24,
      genc_murat_gorge: 0.2,
      solhan_buglan_corridor: 0.36,
      karliova_blizzard_hub: 0.62,
      hesarek_kigi_alpine: 1.0
    }
  },
  stationOverrides: {
    "17203": {
      stationId: 17203,
      nameTr: "Bingöl Merkez (WMO 17203)",
      lat: 38.8847,
      lon: 40.5007,
      demElevationM: 1139,
      subBasinId: "capakcur_bingol_basin",
      urbanFraction: 0.58,
      coldPoolSusceptibility: 0.64,
      verticalStratumRole: "basin_floor"
    },
    LTCU: {
      stationId: "LTCU",
      nameTr: "Bingöl Çeltiksuyu Havalimanı (LTCU)",
      lat: 38.8611,
      lon: 40.5925,
      demElevationM: 1057,
      subBasinId: "capakcur_bingol_basin",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor"
    },
    "17808": {
      stationId: 17808,
      nameTr: "Genç",
      lat: 38.7616,
      lon: 40.5577,
      demElevationM: 993,
      subBasinId: "genc_murat_gorge",
      urbanFraction: 0.32,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17776": {
      stationId: 17776,
      nameTr: "Solhan",
      lat: 38.9597,
      lon: 41.0503,
      demElevationM: 1366,
      subBasinId: "solhan_buglan_corridor",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18177": {
      stationId: 18177,
      nameTr: "Karlıova",
      lat: 39.2936,
      lon: 41.0106,
      demElevationM: 1828,
      subBasinId: "karliova_blizzard_hub",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18176": {
      stationId: 18176,
      nameTr: "Kiğı",
      lat: 39.3086,
      lon: 40.3458,
      demElevationM: 1495,
      subBasinId: "hesarek_kigi_alpine",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18348": {
      stationId: 18348,
      nameTr: "Adaklı",
      lat: 39.2297,
      lon: 40.4775,
      demElevationM: 1488,
      subBasinId: "hesarek_kigi_alpine",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.5,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18349": {
      stationId: 18349,
      nameTr: "Yayladere",
      lat: 39.2294,
      lon: 40.0589,
      demElevationM: 1710,
      subBasinId: "hesarek_kigi_alpine",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18350": {
      stationId: 18350,
      nameTr: "Yedisu",
      lat: 39.4403,
      lon: 40.5431,
      demElevationM: 1598,
      subBasinId: "hesarek_kigi_alpine",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "19917": {
      stationId: 19917,
      nameTr: "Hesarek Kayak Merkezi",
      lat: 38.8871,
      lon: 40.2878,
      demElevationM: 1970,
      subBasinId: "hesarek_kigi_alpine",
      urbanFraction: 0.05,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [980, 1320, 1900, 3250],
    maxPhysicalPeakM: HYPSO_TR_12.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_12.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "se_taurus_murat_bingol_snow_wall",
      labelTr: "Güneydoğu Toroslar – Genç Boğazı Akdeniz/Basra Cephesel Ağır Kar Yükselim Duvarı",
      effectiveBarrierHeightM: 2550,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "capakcur_bingol_basin",
        "genc_murat_gorge",
        "solhan_buglan_corridor",
        "hesarek_kigi_alpine"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 350, toDeg: 50 },
        minCrossCrestSpeedMs: 10.5,
        minFroudeNumber: 0.72,
        sourcePlateauElevationM: 1940,
        maxTargetElevationM: 1260,
        maxWarmingCapC: 3.1,
        subCloudVirgaFactor: 0.62,
        wetCutoffMmHr: 1.5
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 155, toDeg: 245 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.2,
        maxPrecipMultiplierCap: 1.88
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 355, toDeg: 45 },
        precipAttenuationFactor: 0.78
      }
    },
    {
      id: "karliova_bingol_daglari_blizzard_convergence",
      labelTr: "Bingöl Dağları (3250m) – Şerafettin Dağları Karlıova Kış Tipi Yakınsama Duvarı",
      effectiveBarrierHeightM: 3050,
      crestPressureHpa: 700,
      applicableSubBasins: ["karliova_blizzard_hub", "hesarek_kigi_alpine"],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 0, toDeg: 10 },
        minCrossCrestSpeedMs: 25,
        minFroudeNumber: 1.4,
        sourcePlateauElevationM: 1900,
        maxTargetElevationM: 1600,
        maxWarmingCapC: 1.0,
        subCloudVirgaFactor: 0.4,
        wetCutoffMmHr: 2.0
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 145, toDeg: 255 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.22,
        maxPrecipMultiplierCap: 1.94
      }
    }
  ],
  venturiCorridors: [
    {
      id: "karliova_high_saddle_blizzard_jet",
      labelTr: "Karlıova Yüksek Geçit (1940m) NE–SW Kış Tipi & Kar Sürüklenme Kanalı",
      centerCoord: { lat: 39.2936, lon: 41.0106 },
      influenceRadiusKm: 28,
      channelAxisFromDeg: 35,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.38,
      gustMultiplier: 1.52,
      suppressesNocturnalInversion: true
    },
    {
      id: "solhan_buglan_pass_jet",
      labelTr: "Solhan – Buğlan Geçidi Doğu-Batı Oluk Akışı",
      centerCoord: { lat: 38.945, lon: 41.08 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 80,
      bidirectional: true,
      sectorHalfWidthDeg: 22,
      speedMultiplier: 1.24,
      gustMultiplier: 1.34,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1055,
    coldPoolMaxDepthM: 320,
    topographicEnclosureIndex: 0.72,
    deltaPressureTopHpa: 850,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 5.4
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.72
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 10, toDeg: 85 },
      minWindShearVs850Deg: 50
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.54,
    invertedVDryMicroburstSusceptibility: 0.36,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "center_bingol_17203",
      labelTr: "Bingöl Merkez · Çapakçur (WMO 17203)",
      lat: 38.8847,
      lon: 40.5007,
      elevationM: 1139,
      role: "target"
    },
    {
      key: "genc_south_murat_inflow",
      labelTr: "Genç Güney Cephesel Nem Girişi",
      lat: 38.7616,
      lon: 40.5577,
      elevationM: 993,
      role: "foehn_windward"
    },
    {
      key: "hesarek_west_orographic_wall",
      labelTr: "Hesarek Kayak & Dikme Zirve Duvarı",
      lat: 38.8871,
      lon: 40.2878,
      elevationM: 1970,
      role: "orographic_wall"
    },
    {
      key: "karliova_ne_blizzard_saddle",
      labelTr: "Karlıova Yüksek Tipi Kavşağı",
      lat: 39.2936,
      lon: 41.0106,
      elevationM: 1828,
      role: "corridor"
    },
    {
      key: "solhan_east_corridor",
      labelTr: "Solhan – Buğlan Geçidi",
      lat: 38.9597,
      lon: 41.0503,
      elevationM: 1366,
      role: "corridor"
    },
    {
      key: "bingol_daglari_north_crest",
      labelTr: "Bingöl Dağları Güney Sırtı",
      lat: 39.34,
      lon: 40.82,
      elevationM: 2680,
      role: "orographic_wall"
    },
    {
      key: "kigi_nw_valley",
      labelTr: "Kiğı Kuzeybatı Dağ Vadisi",
      lat: 39.3086,
      lon: 40.3458,
      elevationM: 1495,
      role: "lee_shadow"
    },
    {
      key: "yayladere_sw_ridge",
      labelTr: "Yayladere – Sülbüs Sırtı",
      lat: 39.2294,
      lon: 40.0589,
      elevationM: 1710,
      role: "orographic_wall"
    },
    {
      key: "ltcu_celtiksuyu_floor",
      labelTr: "Çeltiksuyu Ova Tabanı (LTCU)",
      lat: 38.8611,
      lon: 40.5925,
      elevationM: 1057,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -38,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 970,
    maxPlausibleMslpHpa: 1060,
    kalmanTempBiasCapC: 4.2
  }
};

export const PROVINCE_SPEC_TR_12: ProvinceSpec = Object.freeze(SPEC_TR_12);
export default PROVINCE_SPEC_TR_12;
