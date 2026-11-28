import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const HAKKARI_CLIM = TR81_CLIMATOLOGY_1991_2020["TR-30"];
const HAKKARI_HYPSO = TR81_HYPSOMETRIC_PROFILES["TR-30"];

/**
 * Bespoke alpine-glacial & enclosed snow-frost basin contract for `TR-30` Hakkari:
 * 1) Cilo–Sat Glacial Massif (`4135 m` Uludoruk / Reşko) & Mergabütan Ski Zone (`2516–2800 m`),
 * 2) Hakkari Merkez (`1727 m`) perched on the steep Great Zap Gorge slope (cold air drains into gorge),
 * 3) Yüksekova / Gever (`LTCW`, `~1877–1950 m`) flat high enclosed snow-albedo frost basin
 *    (`coldPoolSusceptibility: 0.94`, `excludeFromCenterHeadline: true`, `-35°C` winter minima),
 * 4) Milder deep southern border valley troughs at Çukurca (`~1250–1310 m`) & Derecik (`~761–850 m`),
 * 5) Extreme SW Basra/Mediterranean warm-conveyor cyclonic orographic snow/precipitation multiplier (`1.88x`).
 */
export const TR_30_ZAP_CILO_ALPINE_CONTRACT = Object.freeze({
  uludorukGlacialPeakM: 4135,
  mergabutanSkiRangeM: Object.freeze([2516, 2800] as const),
  centerZapSlopeElevationM: 1727,
  yuksekovaBasinElevationRangeM: Object.freeze([1877, 1950] as const),
  yuksekovaColdPoolSusceptibility: 0.94,
  yuksekovaWinterExtremeMinC: -35.0,
  southernTroughElevationRangeM: Object.freeze([761, 1316] as const),
  swCycloneOrographicMultiplierCap: 1.88,
  allowedMetarIcaos: Object.freeze(["LTCW"] as const),
  blockedForeignAndNeighborIcaos: Object.freeze([
    "ORER",
    "OITR",
    "LTCV",
    "LTCI"
  ] as const)
});

const specTr30: ProvinceSpec = {
  provinceCode: "TR-30",
  plateCode: 30,
  slug: "hakkari",
  nameTr: "Hakkari",
  region: "EASTERN_ANATOLIA",
  climateRegion: "DOGU_ANADOLU",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "HIGH_EAST_SNOW_BASIN",
  icaoWhitelist: ["LTCW"],
  domainBounds: {
    minLat: 36.9627,
    maxLat: 37.8105,
    minLon: 43.3065,
    maxLon: 44.8145
  },
  primaryCenter: {
    mgmMerkezId: 93001,
    mgmIstNo: 17285,
    mgmSaatlikIstNo: 17285,
    mgmGunlukIstNo: 93001,
    lat: 37.5744,
    lon: 43.7388,
    demVerifiedElevationM: 1727,
    subBasinId: "hakkari_zap_steep_slope",
    urbanFraction: 0.54,
    monthlyTmaxNormalsC: HAKKARI_CLIM.tmaxC,
    monthlyTminNormalsC: HAKKARI_CLIM.tminC
  },
  curatedSubLocations: [
    {
      id: "derecik-rubarok-vadi-tr",
      name: "Derecik – Rubarok Alt Sınır Vadisi (761–850m)",
      role: "coast",
      lat: 37.0686,
      lon: 44.3164,
      elevationM: 810
    },
    {
      id: "cukurca-zap-vadi-tr",
      name: "Çukurca – Alt Zap Kanyonu (1250m)",
      role: "plain",
      lat: 37.247,
      lon: 43.6117,
      elevationM: 1250
    },
    {
      id: "hakkari-merkez-tr",
      name: "Hakkari Merkez (Dik Zap Yamacı · 1727m)",
      role: "foothill",
      lat: 37.5744,
      lon: 43.7388,
      elevationM: 1727
    },
    {
      id: "yuksekova-ltcw-ova-tr",
      name: "Yüksekova / Gever (LTCW Yüksek Ayaz Ovası · 1950m)",
      role: "plain",
      lat: 37.5785,
      lon: 44.2862,
      elevationM: 1950
    },
    {
      id: "mergabutan-cilo-zirve-tr",
      name: "Mergabütan Kayak Merkezi & Cilo–Sat (2800–4135m)",
      role: "summit",
      lat: 37.5714,
      lon: 43.6818,
      elevationM: 2800
    }
  ],
  subBasins: [
    {
      id: "hakkari_zap_steep_slope",
      labelTr: "Hakkari Merkez – Sümbül / Büyük Zap Dik Yamaç Kuşağı (1500–2200m)",
      polygonOrBbox: {
        minLat: 37.42,
        maxLat: 37.75,
        minLon: 43.52,
        maxLon: 43.94
      },
      elevationRangeM: [1500, 2200],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.48
    },
    {
      id: "yuksekova_gever_frost_basin",
      labelTr: "Yüksekova (Gever / LTCW ~1950m) Yüksek Kapalı Kar ve Radyatif Ayaz Ovası",
      polygonOrBbox: {
        minLat: 37.44,
        maxLat: 37.78,
        minLon: 44.08,
        maxLon: 44.68
      },
      elevationRangeM: [1840, 2150],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.34
    },
    {
      id: "cilo_sat_mergabutan_glacial_wall",
      labelTr: "Cilo–Sat Buzul Kütlesi (Uludoruk 4135m) & Mergabütan Kayak Duvarı",
      polygonOrBbox: {
        minLat: 37.34,
        maxLat: 37.76,
        minLon: 43.62,
        maxLon: 44.36
      },
      elevationRangeM: [2200, 4135],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.03
    },
    {
      id: "cukurca_derecik_semdinli_troughs",
      labelTr: "Çukurca (1250m) – Şemdinli – Derecik (850m) Güney Sınır Derin Vadi Olukları",
      polygonOrBbox: {
        minLat: 36.9627,
        maxLat: 37.36,
        minLon: 43.42,
        maxLon: 44.76
      },
      elevationRangeM: [750, 1480],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.24
    }
  ],
  barrierCouplingMatrix: {
    hakkari_zap_steep_slope: {
      hakkari_zap_steep_slope: 1.0,
      yuksekova_gever_frost_basin: 0.14,
      cilo_sat_mergabutan_glacial_wall: 0.44,
      cukurca_derecik_semdinli_troughs: 0.28
    },
    yuksekova_gever_frost_basin: {
      hakkari_zap_steep_slope: 0.14,
      yuksekova_gever_frost_basin: 1.0,
      cilo_sat_mergabutan_glacial_wall: 0.32,
      cukurca_derecik_semdinli_troughs: 0.08
    },
    cilo_sat_mergabutan_glacial_wall: {
      hakkari_zap_steep_slope: 0.44,
      yuksekova_gever_frost_basin: 0.32,
      cilo_sat_mergabutan_glacial_wall: 1.0,
      cukurca_derecik_semdinli_troughs: 0.16
    },
    cukurca_derecik_semdinli_troughs: {
      hakkari_zap_steep_slope: 0.28,
      yuksekova_gever_frost_basin: 0.08,
      cilo_sat_mergabutan_glacial_wall: 0.16,
      cukurca_derecik_semdinli_troughs: 1.0
    }
  },
  stationOverrides: {
    "17285": {
      stationId: 17285,
      nameTr: "Hakkari Merkez (Dik Zap Yamacı · OMGİ 17285)",
      lat: 37.5744,
      lon: 43.7388,
      demElevationM: 1727,
      subBasinId: "hakkari_zap_steep_slope",
      urbanFraction: 0.56,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "mid_slope"
    },
    "17920": {
      stationId: 17920,
      nameTr: "Hakkari Yüksekova (Gever Kapalı Kar/Ayaz Havzası)",
      lat: 37.5785,
      lon: 44.2862,
      demElevationM: 1877,
      subBasinId: "yuksekova_gever_frost_basin",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    LTCW: {
      stationId: "LTCW",
      nameTr: "Yüksekova Selahaddin Eyyubi Havalimanı (LTCW · ~1950m Ayaz Ovası)",
      lat: 37.5503,
      lon: 44.2381,
      demElevationM: 1950,
      subBasinId: "yuksekova_gever_frost_basin",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18771": {
      stationId: 18771,
      nameTr: "Yüksekova Havalimanı OMGİ (LTCW Pist Çanağı)",
      lat: 37.5503,
      lon: 44.2381,
      demElevationM: 1950,
      subBasinId: "yuksekova_gever_frost_basin",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "19909": {
      stationId: 19909,
      nameTr: "Hakkari Mergabütan Kayak Merkezi (DEM 2516m · Pist 2800m)",
      lat: 37.5714,
      lon: 43.6818,
      demElevationM: 2516,
      subBasinId: "cilo_sat_mergabutan_glacial_wall",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18234": {
      stationId: 18234,
      nameTr: "Hakkari Çukurca / Alt Zap Sınır Vadisi",
      lat: 37.247,
      lon: 43.6117,
      demElevationM: 1310,
      subBasinId: "cukurca_derecik_semdinli_troughs",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.42,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17815": {
      stationId: 17815,
      nameTr: "Hakkari Şemdinli – Derecik Güney Vadi Kuşağı",
      lat: 37.2951,
      lon: 44.5819,
      demElevationM: 1316,
      subBasinId: "cukurca_derecik_semdinli_troughs",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [850, 1720, 2516, 3650],
    maxPhysicalPeakM: 4135,
    snowElevationBands: HAKKARI_HYPSO.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "cilo_sat_4135m_sw_cyclone_wall",
      labelTr: "Cilo–Sat (Uludoruk 4135m) & Zap Duvarı Güneybatılı Basra/Akdeniz Siklonik Kar/Yağış Kapanı",
      effectiveBarrierHeightM: 4135,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "hakkari_zap_steep_slope",
        "cilo_sat_mergabutan_glacial_wall",
        "cukurca_derecik_semdinli_troughs"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 10, toDeg: 75 },
        minCrossCrestSpeedMs: 8.0,
        minFroudeNumber: 0.82,
        sourcePlateauElevationM: 2150,
        maxTargetElevationM: 1350,
        maxWarmingCapC: 5.2,
        subCloudVirgaFactor: 0.62,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 175, toDeg: 255 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.28,
        maxPrecipMultiplierCap: 1.88
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 15, toDeg: 75 },
        precipAttenuationFactor: 0.54
      }
    },
    {
      id: "yuksekova_cilo_lee_frost_shield",
      labelTr: "Cilo–Sat Doğu Arkası — Yüksekova (Gever) Kar Tutulumu ve Soğuk Havuz Kalkanı",
      effectiveBarrierHeightM: 3800,
      crestPressureHpa: 700,
      applicableSubBasins: ["yuksekova_gever_frost_basin"],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 220, toDeg: 275 },
        minCrossCrestSpeedMs: 14.0,
        minFroudeNumber: 1.25,
        sourcePlateauElevationM: 1727,
        maxTargetElevationM: 1960,
        maxWarmingCapC: 1.2,
        subCloudVirgaFactor: 0.85,
        wetCutoffMmHr: 0.2
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 245 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.18,
        maxPrecipMultiplierCap: 1.62
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 295, toDeg: 355 },
        precipAttenuationFactor: 0.62
      }
    }
  ],
  venturiCorridors: [
    {
      id: "great_zap_cukurca_gorge_chute",
      labelTr: "Büyük Zap Kanyonu (Çukurca – Hakkari) Derin Boğaz Kanalı",
      centerCoord: { lat: 37.44, lon: 43.68 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 195,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.34,
      gustMultiplier: 1.5,
      suppressesNocturnalInversion: true
    },
    {
      id: "derecik_semdinli_rubarok_corridor",
      labelTr: "Derecik – Şemdinli (Rubarok) Güney Sınır Vadi Oluğu",
      centerCoord: { lat: 37.16, lon: 44.44 },
      influenceRadiusKm: 22,
      channelAxisFromDeg: 210,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.28,
      gustMultiplier: 1.42,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1877,
    coldPoolMaxDepthM: 550,
    topographicEnclosureIndex: 0.95,
    deltaPressureTopHpa: 700,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 10.5
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.58
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 35, toDeg: 125 },
      minWindShearVs850Deg: 65
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.52,
    invertedVDryMicroburstSusceptibility: 0.44,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TGT_HAKKARI_CENTER",
      labelTr: "Hakkari Merkez (Dik Zap Yamacı · 1727m)",
      lat: 37.5744,
      lon: 43.7388,
      elevationM: 1727,
      role: "target"
    },
    {
      key: "ORO_CILO_ULUDORUK",
      labelTr: "Cilo–Sat Uludoruk Buzul Zirvesi (4135m)",
      lat: 37.495,
      lon: 44.006,
      elevationM: 4135,
      role: "orographic_wall"
    },
    {
      key: "ORO_MERGABUTAN_SKI",
      labelTr: "Mergabütan Kayak Platosu (2800m)",
      lat: 37.5714,
      lon: 43.6818,
      elevationM: 2800,
      role: "orographic_wall"
    },
    {
      key: "LEE_YUKSEKOVA_LTCW",
      labelTr: "Yüksekova (LTCW) Kapalı Kar/Ayaz Havzası (1950m)",
      lat: 37.5503,
      lon: 44.2381,
      elevationM: 1950,
      role: "lee_shadow"
    },
    {
      key: "COR_CUKURCA_ZAP",
      labelTr: "Çukurca Alt Zap Kanyon Girişi (1250m)",
      lat: 37.247,
      lon: 43.6117,
      elevationM: 1250,
      role: "corridor"
    },
    {
      key: "COR_DERECIK_TROUGH",
      labelTr: "Derecik (Rubarok) Ilıman Güney Oluk Tabanı (810m)",
      lat: 37.0686,
      lon: 44.3164,
      elevationM: 810,
      role: "corridor"
    },
    {
      key: "COR_SEMDINLI_VALLEY",
      labelTr: "Şemdinli Güneydoğu Vadi Eşiği (1316m)",
      lat: 37.2951,
      lon: 44.5819,
      elevationM: 1316,
      role: "corridor"
    },
    {
      key: "FOE_KARADAG_NORTH",
      labelTr: "Karadağ – Başkale Kuzey Sırt Eşiği (2950m)",
      lat: 37.68,
      lon: 43.82,
      elevationM: 2950,
      role: "foehn_windward"
    },
    {
      key: "FOE_ESENDERE_DIVIDE",
      labelTr: "Esendere İran Sınır Platosu (2180m)",
      lat: 37.7,
      lon: 44.56,
      elevationM: 2180,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -38,
    maxPlausibleTempC: 42,
    minPlausibleMslpHpa: 975,
    maxPlausibleMslpHpa: 1056,
    kalmanTempBiasCapC: 8.5
  }
};

export const PROVINCE_SPEC_TR_30: ProvinceSpec = Object.freeze(specTr30);
export default PROVINCE_SPEC_TR_30;
