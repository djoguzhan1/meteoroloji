import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_21 = TR81_CLIMATOLOGY_1991_2020["TR-21"];
const HYPSO_TR_21 = TR81_HYPSOMETRIC_PROFILES["TR-21"];

/**
 * ATMOS v5.0 — Wave 3C (`REG-22`) Bespoke Microclimate Contract: `TR-21` Diyarbakır
 *
 * Physical Mechanisms:
 *  1. Enclosed Basalt Caldera / Tigris Bowl (`545–750 m`, center `674 m`, `LTCC` `686 m`):
 *     Ringed on 360° by the Southeastern Taurus wall to the north (`Lice–Kulp–Çüngüş 1,100–2,000 m`),
 *     the dark Plio-Quaternary Karacadağ basalt shield volcano to the southwest (`1,957 m`),
 *     and the Mardin–Mazıdağı limestone threshold to the south (`~1,050 m`).
 *  2. Summer Basra Thermal Trough (`+46°C+`) & Inverted-V Dry Microbursts (`0.86`):
 *     Low-albedo Karacadağ basalt (`~0.09`) drives extreme sensible heat fluxes and a `4 km`-deep
 *     dry-adiabatic boundary layer (`LCL ~620 hPa`, surface `RH < 15%`), producing severe virga-driven
 *     evaporative downdrafts / haboob gusts (`invertedVDryMicroburstSusceptibility: 0.86`).
 *  3. Winter Snow-Albedo Radiative Plunge (`-15..-24°C`) & Tigris Valley Radiation Fog:
 *     Under anticyclonic clear skies over fresh basin snowpack (`>= 2 cm`), katabatic drainage
 *     trapped inside `topographicEnclosureIndex: 0.84` triggers `STRONG_INVERSION` down to `-24.2°C`
 *     alongside multi-day Bismil–Dicle radiation fog (`daytimeSolarDampingFactor: 0.64`).
 */
export const TR_21_BASALT_CALDERA_BASIN_CONTRACT = Object.freeze({
  centerBasaltBowlElevationM: 674,
  ltccAirportElevationM: 686,
  bismilTigrisFloorElevationM: 545,
  karacadagShieldPeakM: 1957,
  summerScorchingPeakTempC: 46.2,
  winterSnowRadiativeFloorC: -24.2,
  invertedVDryMicroburstSusceptibility: 0.86,
  allowedMetarIcaos: Object.freeze(["LTCC"] as const),
  blockedNeighborMetarIcaos: Object.freeze([
    "LTCA",
    "LTCS",
    "LTCR",
    "LTCJ",
    "LTCU"
  ] as const)
});

const specTr21: ProvinceSpec = {
  provinceCode: "TR-21",
  plateCode: 21,
  slug: "diyarbakir",
  nameTr: "Diyarbakır",
  region: "SOUTHEASTERN_ANATOLIA",
  climateRegion: "GUNEYDOGU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "SOUTHEAST_THRESHOLD_ARID",
  icaoWhitelist: ["LTCC"],
  domainBounds: {
    minLat: 37.5065,
    maxLat: 38.7145,
    minLon: 39.1065,
    maxLon: 41.3665
  },
  primaryCenter: {
    mgmMerkezId: 92101,
    mgmIstNo: 17281,
    mgmSaatlikIstNo: 17280,
    mgmGunlukIstNo: 92101,
    wmoId: "17280",
    lat: 37.9094,
    lon: 40.2133,
    demVerifiedElevationM: 674,
    subBasinId: "diyarbakir_basalt_central_bowl",
    urbanFraction: 0.82,
    monthlyTmaxNormalsC: CLIM_TR_21.tmaxC,
    monthlyTminNormalsC: CLIM_TR_21.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-21-bismil-dicle-taban",
      name: "Bismil – Dicle Alüvyal Sis Tabanı",
      role: "plain",
      lat: 37.8308,
      lon: 40.6544,
      elevationM: 558
    },
    {
      id: "tr-21-diyarbakir-sur-baglar",
      name: "Diyarbakır Merkez (Sur / Bağlar / Kayapınar)",
      role: "plain",
      lat: 37.9094,
      lon: 40.2133,
      elevationM: 674
    },
    {
      id: "tr-21-ergani-maden-esigi",
      name: "Ergani – Çüngüş Güneydoğu Toros Etekleri",
      role: "foothill",
      lat: 38.267,
      lon: 39.766,
      elevationM: 986
    },
    {
      id: "tr-21-lice-kulp-toros-duvari",
      name: "Lice – Kulp Güneydoğu Toros Yamaç Kuşağı",
      role: "foothill",
      lat: 38.5042,
      lon: 41.01,
      elevationM: 1150
    },
    {
      id: "tr-21-karacadag-dogu-kalkan",
      name: "Karacadağ Bazalt Kalkan Sırtı (Doğu Yamaç)",
      role: "summit",
      lat: 37.745,
      lon: 39.915,
      elevationM: 1785
    }
  ],
  subBasins: [
    {
      id: "diyarbakir_basalt_central_bowl",
      labelTr: "Diyarbakır Bazalt Çanağı (Sur – Bağlar – Kayapınar – Yenişehir – Çınar)",
      polygonOrBbox: {
        minLat: 37.62,
        maxLat: 38.12,
        minLon: 39.98,
        maxLon: 40.52
      },
      elevationRangeM: [580, 830],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.76
    },
    {
      id: "bismil_silvan_tigris_trough",
      labelTr: "Bismil – Aşağı Dicle Alüvyal Sis Oluk Tabanı & Silvan Eşiği",
      polygonOrBbox: {
        minLat: 37.68,
        maxLat: 38.22,
        minLon: 40.52,
        maxLon: 41.22
      },
      elevationRangeM: [535, 850],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.28
    },
    {
      id: "karacadag_basalt_shield",
      labelTr: "Karacadağ (1957m) Bazalt Kalkan Volkanı Doğu/Kuzeydoğu Yamacı",
      polygonOrBbox: {
        minLat: 37.5065,
        maxLat: 37.96,
        minLon: 39.55,
        maxLon: 40.02
      },
      elevationRangeM: [820, 1957],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.06
    },
    {
      id: "ergani_cermik_maden_foothill",
      labelTr: "Ergani – Çermik – Eğil Güney Toros Eşik ve Boğaz Kuşağı",
      polygonOrBbox: {
        minLat: 38.02,
        maxLat: 38.36,
        minLon: 39.28,
        maxLon: 40.22
      },
      elevationRangeM: [660, 1250],
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.3
    },
    {
      id: "lice_kulp_cungus_taurus_wall",
      labelTr: "Güneydoğu Toroslar Dik Orografik Duvarı (Çüngüş – Dicle – Hani – Lice – Hazro – Kulp)",
      polygonOrBbox: {
        minLat: 38.18,
        maxLat: 38.7145,
        minLon: 39.1065,
        maxLon: 41.3665
      },
      elevationRangeM: [880, 2000],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.14
    }
  ],
  barrierCouplingMatrix: {
    diyarbakir_basalt_central_bowl: {
      diyarbakir_basalt_central_bowl: 1.0,
      bismil_silvan_tigris_trough: 0.78,
      karacadag_basalt_shield: 0.26,
      ergani_cermik_maden_foothill: 0.42,
      lice_kulp_cungus_taurus_wall: 0.14
    },
    bismil_silvan_tigris_trough: {
      diyarbakir_basalt_central_bowl: 0.76,
      bismil_silvan_tigris_trough: 1.0,
      karacadag_basalt_shield: 0.16,
      ergani_cermik_maden_foothill: 0.3,
      lice_kulp_cungus_taurus_wall: 0.2
    },
    karacadag_basalt_shield: {
      diyarbakir_basalt_central_bowl: 0.24,
      bismil_silvan_tigris_trough: 0.14,
      karacadag_basalt_shield: 1.0,
      ergani_cermik_maden_foothill: 0.34,
      lice_kulp_cungus_taurus_wall: 0.18
    },
    ergani_cermik_maden_foothill: {
      diyarbakir_basalt_central_bowl: 0.4,
      bismil_silvan_tigris_trough: 0.28,
      karacadag_basalt_shield: 0.34,
      ergani_cermik_maden_foothill: 1.0,
      lice_kulp_cungus_taurus_wall: 0.54
    },
    lice_kulp_cungus_taurus_wall: {
      diyarbakir_basalt_central_bowl: 0.12,
      bismil_silvan_tigris_trough: 0.18,
      karacadag_basalt_shield: 0.18,
      ergani_cermik_maden_foothill: 0.52,
      lice_kulp_cungus_taurus_wall: 1.0
    }
  },
  stationOverrides: {
    "17280": {
      stationId: 17280,
      nameTr: "Diyarbakır Havalimanı (WMO 17280 / LTCC)",
      lat: 37.8939,
      lon: 40.201,
      demElevationM: 686,
      subBasinId: "diyarbakir_basalt_central_bowl",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor"
    },
    LTCC: {
      stationId: "LTCC",
      nameTr: "Diyarbakır Havalimanı METAR (LTCC)",
      lat: 37.8939,
      lon: 40.201,
      demElevationM: 686,
      subBasinId: "diyarbakir_basalt_central_bowl",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor"
    },
    "17281": {
      stationId: 17281,
      nameTr: "Diyarbakır Bağlar / Bölge Merkez",
      lat: 37.9094,
      lon: 40.2133,
      demElevationM: 674,
      subBasinId: "diyarbakir_basalt_central_bowl",
      urbanFraction: 0.84,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "basin_floor"
    },
    "17283": {
      stationId: 17283,
      nameTr: "Diyarbakır Sur (Bazalt Surlar / Dicle Terası)",
      lat: 37.9247,
      lon: 40.2328,
      demElevationM: 679,
      subBasinId: "diyarbakir_basalt_central_bowl",
      urbanFraction: 0.8,
      coldPoolSusceptibility: 0.7,
      verticalStratumRole: "basin_floor"
    },
    "19375": {
      stationId: 19375,
      nameTr: "Diyarbakır Kayapınar (Sensör DEM 819m · Merkez 676m)",
      lat: 37.8973,
      lon: 40.2027,
      demElevationM: 819,
      subBasinId: "diyarbakir_basalt_central_bowl",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "basin_floor"
    },
    "19916": {
      stationId: 19916,
      nameTr: "Diyarbakır Yenişehir (Sensör DEM 725m · Merkez 671m)",
      lat: 37.9247,
      lon: 40.2328,
      demElevationM: 725,
      subBasinId: "diyarbakir_basalt_central_bowl",
      urbanFraction: 0.76,
      coldPoolSusceptibility: 0.66,
      verticalStratumRole: "basin_floor"
    },
    "18165": {
      stationId: 18165,
      nameTr: "Diyarbakır Bismil (Dicle Radyasyonel Sis & Ayaz Çukuru)",
      lat: 37.8308,
      lon: 40.6544,
      demElevationM: 558,
      subBasinId: "bismil_silvan_tigris_trough",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18321": {
      stationId: 18321,
      nameTr: "Diyarbakır Çınar (Göksu / Mardin Eşiği Kuzey Eteği)",
      lat: 37.7325,
      lon: 40.4111,
      demElevationM: 650,
      subBasinId: "diyarbakir_basalt_central_bowl",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18164": {
      stationId: 18164,
      nameTr: "Diyarbakır Silvan",
      lat: 38.1328,
      lon: 41.0081,
      demElevationM: 804,
      subBasinId: "bismil_silvan_tigris_trough",
      urbanFraction: 0.4,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17847": {
      stationId: 17847,
      nameTr: "Diyarbakır Ergani (Maden Boğazı Çıkışı)",
      lat: 38.267,
      lon: 39.766,
      demElevationM: 986,
      subBasinId: "ergani_cermik_maden_foothill",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.4,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17874": {
      stationId: 17874,
      nameTr: "Diyarbakır Çermik",
      lat: 38.1371,
      lon: 39.4644,
      demElevationM: 695,
      subBasinId: "ergani_cermik_maden_foothill",
      urbanFraction: 0.32,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18324": {
      stationId: 18324,
      nameTr: "Diyarbakır Eğil",
      lat: 38.2506,
      lon: 40.0756,
      demElevationM: 837,
      subBasinId: "ergani_cermik_maden_foothill",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.42,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18322": {
      stationId: 18322,
      nameTr: "Diyarbakır Çüngüş",
      lat: 38.21,
      lon: 39.3072,
      demElevationM: 1036,
      subBasinId: "lice_kulp_cungus_taurus_wall",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18323": {
      stationId: 18323,
      nameTr: "Diyarbakır Dicle",
      lat: 38.3597,
      lon: 40.07,
      demElevationM: 879,
      subBasinId: "lice_kulp_cungus_taurus_wall",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18325": {
      stationId: 18325,
      nameTr: "Diyarbakır Hani",
      lat: 38.4114,
      lon: 40.4011,
      demElevationM: 907,
      subBasinId: "lice_kulp_cungus_taurus_wall",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18163": {
      stationId: 18163,
      nameTr: "Diyarbakır Lice (Güneydoğu Toros Yağış/Kar Duvarı)",
      lat: 38.4531,
      lon: 40.6447,
      demElevationM: 954,
      subBasinId: "lice_kulp_cungus_taurus_wall",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18326": {
      stationId: 18326,
      nameTr: "Diyarbakır Hazro",
      lat: 38.2506,
      lon: 40.7792,
      demElevationM: 1000,
      subBasinId: "lice_kulp_cungus_taurus_wall",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.32,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18329": {
      stationId: 18329,
      nameTr: "Diyarbakır Kulp (Toros Kuzeydoğu Yüksek Kuşak)",
      lat: 38.5042,
      lon: 41.01,
      demElevationM: 1150,
      subBasinId: "lice_kulp_cungus_taurus_wall",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.38,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [545, 885, 1320, 1957],
    maxPhysicalPeakM: HYPSO_TR_21.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_21.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "guneydogu_toroslar_lice_kulp_wall",
      labelTr: "Güneydoğu Toroslar (Lice – Kulp – Çüngüş ~2000m) Güneyli Orografik Yağış & Kuzeyli Fön Duvarı",
      effectiveBarrierHeightM: 1950,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "lice_kulp_cungus_taurus_wall",
        "ergani_cermik_maden_foothill",
        "diyarbakir_basalt_central_bowl",
        "bismil_silvan_tigris_trough"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 340, toDeg: 50 },
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.72,
        sourcePlateauElevationM: 1320,
        maxTargetElevationM: 860,
        maxWarmingCapC: 4.6,
        subCloudVirgaFactor: 0.68,
        wetCutoffMmHr: 0.3
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 150, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.18,
        maxPrecipMultiplierCap: 1.72
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 345, toDeg: 45 },
        precipAttenuationFactor: 0.48
      }
    },
    {
      id: "karacadag_volcanic_shield_barrier",
      labelTr: "Karacadağ Bazalt Kalkan Volkanı (1957m) — Batılı/Güneybatılı Fön & Ters-V Virga Kalkanı",
      effectiveBarrierHeightM: 1957,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "diyarbakir_basalt_central_bowl",
        "karacadag_basalt_shield"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 220, toDeg: 285 },
        minCrossCrestSpeedMs: 8.0,
        minFroudeNumber: 0.74,
        sourcePlateauElevationM: 760,
        maxTargetElevationM: 780,
        maxWarmingCapC: 3.4,
        subCloudVirgaFactor: 0.78,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 218 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.12,
        maxPrecipMultiplierCap: 1.38
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 230, toDeg: 280 },
        precipAttenuationFactor: 0.72
      }
    }
  ],
  venturiCorridors: [
    {
      id: "ergani_maden_pass_chute",
      labelTr: "Ergani – Maden Boğazı (Dicle/Fırat SuBölümü) KKB–GGD Kanalize Geçit Rüzgarı",
      centerCoord: { lat: 38.295, lon: 39.725 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 335,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.28,
      gustMultiplier: 1.4,
      suppressesNocturnalInversion: true
    },
    {
      id: "cinar_mardin_threshold_gap",
      labelTr: "Çınar – Göksu / Mardin Eşiği Güneyli Mezopotamya Sıcak & Toz Koridoru",
      centerCoord: { lat: 37.685, lon: 40.425 },
      influenceRadiusKm: 22,
      channelAxisFromDeg: 190,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.22,
      gustMultiplier: 1.34,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 545,
    coldPoolMaxDepthM: 340,
    topographicEnclosureIndex: 0.84,
    deltaPressureTopHpa: 915,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 2.0,
      maxExtraRadiativeCoolingC: 8.8
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.64
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.84,
    invertedVDryMicroburstSusceptibility: 0.86,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TGT_DIYARBAKIR_BOWL",
      labelTr: "Diyarbakır Merkez Bazalt Çanağı (674m / WMO 17280)",
      lat: 37.9094,
      lon: 40.2133,
      elevationM: 674,
      role: "target"
    },
    {
      key: "LEE_BISMIL_TIGRIS_FLOOR",
      labelTr: "Bismil – Aşağı Dicle Sis ve Ayaz Tabanı (558m)",
      lat: 37.8308,
      lon: 40.6544,
      elevationM: 558,
      role: "lee_shadow"
    },
    {
      key: "ORO_KARACADAG_SHIELD",
      labelTr: "Karacadağ Bazalt Kalkanı Doğu Sırtı (1785m)",
      lat: 37.745,
      lon: 39.915,
      elevationM: 1785,
      role: "orographic_wall"
    },
    {
      key: "COR_CINAR_SOUTH_GAP",
      labelTr: "Çınar – Mardin Eşiği Güney Geçişi (650m)",
      lat: 37.7325,
      lon: 40.4111,
      elevationM: 650,
      role: "corridor"
    },
    {
      key: "COR_ERGANI_MADEN_PASS",
      labelTr: "Ergani – Maden Boğazı Eşiği (986m)",
      lat: 38.267,
      lon: 39.766,
      elevationM: 986,
      role: "corridor"
    },
    {
      key: "ORO_CUNGUS_WEST_TAURUS",
      labelTr: "Çüngüş Güneydoğu Toros Batı Duvarı (1036m)",
      lat: 38.21,
      lon: 39.3072,
      elevationM: 1036,
      role: "orographic_wall"
    },
    {
      key: "ORO_LICE_TAURUS_WALL",
      labelTr: "Lice Güneydoğu Toros Orografik Yağış Yamacı (954m)",
      lat: 38.4531,
      lon: 40.6447,
      elevationM: 954,
      role: "orographic_wall"
    },
    {
      key: "FOE_KULP_HIGH_TAURUS",
      labelTr: "Kulp Kuzeydoğu Toros Yüksek Kuşağı (1150m)",
      lat: 38.5042,
      lon: 41.01,
      elevationM: 1150,
      role: "foehn_windward"
    },
    {
      key: "LEE_SILVAN_EAST_BENCH",
      labelTr: "Silvan Doğu Eşik Terası (804m)",
      lat: 38.1328,
      lon: 41.0081,
      elevationM: 804,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -28,
    maxPlausibleTempC: 49,
    minPlausibleMslpHpa: 984,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 5.8
  }
};

export const PROVINCE_SPEC_TR_21: ProvinceSpec = Object.freeze(specTr21);
export default PROVINCE_SPEC_TR_21;
