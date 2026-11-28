import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";
import type { ProvinceSpec } from "../types";

const CLIM_TR_36 = TR81_CLIMATOLOGY_1991_2020["TR-36"];
const HYPSO_TR_36 = TR81_HYPSOMETRIC_PROFILES["TR-36"];

export const TR_36_KARS_PLATEAU_META = Object.freeze({
  provinceCode: "TR-36" as const,
  wmoStationId: "17098",
  mgmPrimaryIstNo: 17097,
  allowedMetarIcaos: Object.freeze(["LTCF"] as const),
  basaltPlateauRangeM: Object.freeze([1768, 1795] as const),
  sarikamisPowderBeltRangeM: Object.freeze([2100, 2634] as const),
  kagizmanArasValleyM: 1349,
  annualPrecipPeakMonths: Object.freeze([5, 6] as const),
  minPlausibleTempC: -40
});

/**
 * ATMOS v5.0 — Wave 3C (REG-18) Bespoke Microclimate & Synoptic Spec: `TR-36` Kars
 *
 * Fiziksel ve Sinoptik Mekanizmalar:
 *  1. Kars Yüksek Bazalt Platosu (1.768–1.795 m, WMO 17098 / MGM 17097, LTCF):
 *     Kışın Sibirya antisiklonu etkisinde kuru ve sert karasal ayaz (`minPlausibleTempC: -40`),
 *     ilkbahar sonu – yaz başında (Mayıs 78.4 mm, Haziran 74.6 mm — yıllık yağış maksimumu!)
 *     yüksek plato ısınmasıyla tetiklenen konvektif sağanak, gök gürültüsü ve dolu rejimi.
 *  2. Sarıkamış – Cıbıltepe (2.100–2.634 m) Kristal Toz Kar (Powder Snow) & Sarıçam Kuşağı:
 *     Düşük bağıl nem ve soğuk kolonda yüksek SLR (14:1–18:1) ile oluşan Alpler kalitesinde
 *     kristal toz kar kuşağı; Allahuekber Dağları (3.196 m) rüzgâr-üstü kar tahkimatı.
 *  3. Kağızman – Aras Derin Vadisi (~1.300–1.349 m) Meyve Bahçesi Mikrokliması:
 *     Kars platosundan ~450 m daha alçak, kuzeydeki yüksek platodan inen akışlarda fön ve
 *     yağış gölgesiyle korunan kayısı/meyve vadisi; Kars ve Sarıkamış'tan güçlü bariyer
 *     ayrışmasıyla (`<= 0.20`) izole edilir.
 */
const SPEC_TR_36_ENGINE = Object.freeze({
  provinceCode: "TR-36",
  plateCode: 36,
  slug: "kars",
  nameTr: "Kars",
  region: "EASTERN_ANATOLIA",
  climateRegion: "DOGU_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "HIGH_EAST_SNOW_BASIN",
  icaoWhitelist: Object.freeze(["LTCF"] as const),
  domainBounds: Object.freeze({
    minLat: 39.9348,
    maxLat: 41.0953,
    minLon: 42.1008,
    maxLon: 43.7482
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 93601,
    mgmIstNo: 17097,
    mgmSaatlikIstNo: 17097,
    mgmGunlukIstNo: 93601,
    wmoId: "17098",
    lat: 40.6042,
    lon: 43.1073,
    demVerifiedElevationM: 1775,
    subBasinId: "TR36_KARS_SELIM_BASALT_PLATEAU",
    urbanFraction: 0.58,
    monthlyTmaxNormalsC: CLIM_TR_36.tmaxC,
    monthlyTminNormalsC: CLIM_TR_36.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-36-kagizman-aras",
      name: "Kağızman – Aras Derin Vadisi (Meyve Mikrokliması · 1349 m)",
      role: "plain" as const,
      lat: 40.1533,
      lon: 43.1261,
      elevationM: 1349
    }),
    Object.freeze({
      id: "tr-36-merkez",
      name: "Kars Merkez (Bazalt Platosu · WMO 17098 · 1775 m)",
      role: "plain" as const,
      lat: 40.6042,
      lon: 43.1073,
      elevationM: 1775
    }),
    Object.freeze({
      id: "tr-36-sarikamis",
      name: "Sarıkamış Sarıçam / Kristal Kar Kuşağı (2102 m)",
      role: "foothill" as const,
      lat: 40.3329,
      lon: 42.5983,
      elevationM: 2102
    }),
    Object.freeze({
      id: "tr-36-cibiltepe",
      name: "Sarıkamış Cıbıltepe Kayak Zirvesi (2634 m)",
      role: "summit" as const,
      lat: 40.2966,
      lon: 42.5822,
      elevationM: 2634
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR36_KARS_SELIM_BASALT_PLATEAU",
      labelTr: "Kars Merkez – Selim – Susuz Yüksek Bazalt Platosu (1720–1980 m)",
      polygonOrBbox: Object.freeze({
        minLat: 40.42,
        maxLat: 40.92,
        minLon: 42.68,
        maxLon: 43.28
      }),
      elevationRangeM: Object.freeze([1720, 1980] as const),
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.48
    }),
    Object.freeze({
      id: "TR36_ARPACAY_AKYAKA_DIGOR_EAST",
      labelTr: "Arpaçay – Akyaka – Digor Doğu Sınır Basamağı (1450–1980 m)",
      polygonOrBbox: Object.freeze({
        minLat: 40.26,
        maxLat: 41.04,
        minLon: 43.22,
        maxLon: 43.74
      }),
      elevationRangeM: Object.freeze([1450, 1980] as const),
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.24
    }),
    Object.freeze({
      id: "TR36_SARIKAMIS_CIBILTEPE_POWDER_PINE",
      labelTr: "Sarıkamış – Cıbıltepe (2100–2634 m) – Allahuekber Kristal Toz Kar Kuşağı",
      polygonOrBbox: Object.freeze({
        minLat: 40.18,
        maxLat: 40.66,
        minLon: 42.12,
        maxLon: 42.74
      }),
      elevationRangeM: Object.freeze([2050, 3196] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.14
    }),
    Object.freeze({
      id: "TR36_KAGIZMAN_ARAS_ORCHARD_VALLEY",
      labelTr: "Kağızman – Aras Derin Vadisi Korunaklı Meyve Bahçesi Mikrokliması (~1300 m)",
      polygonOrBbox: Object.freeze({
        minLat: 39.95,
        maxLat: 40.28,
        minLon: 42.78,
        maxLon: 43.52
      }),
      elevationRangeM: Object.freeze([1180, 1550] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.32
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR36_KARS_SELIM_BASALT_PLATEAU: Object.freeze({
      TR36_KARS_SELIM_BASALT_PLATEAU: 1.0,
      TR36_ARPACAY_AKYAKA_DIGOR_EAST: 0.68,
      TR36_SARIKAMIS_CIBILTEPE_POWDER_PINE: 0.42,
      TR36_KAGIZMAN_ARAS_ORCHARD_VALLEY: 0.2
    }),
    TR36_ARPACAY_AKYAKA_DIGOR_EAST: Object.freeze({
      TR36_KARS_SELIM_BASALT_PLATEAU: 0.68,
      TR36_ARPACAY_AKYAKA_DIGOR_EAST: 1.0,
      TR36_SARIKAMIS_CIBILTEPE_POWDER_PINE: 0.28,
      TR36_KAGIZMAN_ARAS_ORCHARD_VALLEY: 0.3
    }),
    TR36_SARIKAMIS_CIBILTEPE_POWDER_PINE: Object.freeze({
      TR36_KARS_SELIM_BASALT_PLATEAU: 0.42,
      TR36_ARPACAY_AKYAKA_DIGOR_EAST: 0.28,
      TR36_SARIKAMIS_CIBILTEPE_POWDER_PINE: 1.0,
      TR36_KAGIZMAN_ARAS_ORCHARD_VALLEY: 0.18
    }),
    TR36_KAGIZMAN_ARAS_ORCHARD_VALLEY: Object.freeze({
      TR36_KARS_SELIM_BASALT_PLATEAU: 0.2,
      TR36_ARPACAY_AKYAKA_DIGOR_EAST: 0.3,
      TR36_SARIKAMIS_CIBILTEPE_POWDER_PINE: 0.18,
      TR36_KAGIZMAN_ARAS_ORCHARD_VALLEY: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17097": Object.freeze({
      stationId: 17097,
      nameTr: "Kars Merkez Bölge (MGM 17097 · 1775 m)",
      lat: 40.6042,
      lon: 43.1073,
      demElevationM: 1775,
      subBasinId: "TR36_KARS_SELIM_BASALT_PLATEAU",
      urbanFraction: 0.58,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor"
    }),
    "17098": Object.freeze({
      stationId: 17098,
      nameTr: "Kars Harakani WMO İstasyonu (WMO 17098 · 1795 m)",
      lat: 40.5622,
      lon: 43.115,
      demElevationM: 1795,
      subBasinId: "TR36_KARS_SELIM_BASALT_PLATEAU",
      urbanFraction: 0.12,
      coldPoolSusceptibility: 0.95,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    LTCF: Object.freeze({
      stationId: "LTCF",
      nameTr: "Kars Harakani Havalimanı (LTCF · Açık Plato Ayaz Pisti)",
      lat: 40.5622,
      lon: 43.115,
      demElevationM: 1795,
      subBasinId: "TR36_KARS_SELIM_BASALT_PLATEAU",
      urbanFraction: 0.1,
      coldPoolSusceptibility: 0.96,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18197": Object.freeze({
      stationId: 18197,
      nameTr: "Selim (Kars Çayı Soğuk Çanağı)",
      lat: 40.4625,
      lon: 42.7908,
      demElevationM: 1860,
      subBasinId: "TR36_KARS_SELIM_BASALT_PLATEAU",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18375": Object.freeze({
      stationId: 18375,
      nameTr: "Susuz",
      lat: 40.7781,
      lon: 43.1628,
      demElevationM: 1737,
      subBasinId: "TR36_KARS_SELIM_BASALT_PLATEAU",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "19256": Object.freeze({
      stationId: 19256,
      nameTr: "Boğatepe Geçidi (2280 m)",
      lat: 40.795,
      lon: 42.905,
      demElevationM: 2280,
      subBasinId: "TR36_KARS_SELIM_BASALT_PLATEAU",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.24,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }),
    "17656": Object.freeze({
      stationId: 17656,
      nameTr: "Arpaçay",
      lat: 40.8447,
      lon: 43.3278,
      demElevationM: 1720,
      subBasinId: "TR36_ARPACAY_AKYAKA_DIGOR_EAST",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "19077": Object.freeze({
      stationId: 19077,
      nameTr: "Arpaçay – Çıldır Güney Kıyısı (1965 m)",
      lat: 40.965,
      lon: 43.255,
      demElevationM: 1965,
      subBasinId: "TR36_ARPACAY_AKYAKA_DIGOR_EAST",
      urbanFraction: 0.06,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18373": Object.freeze({
      stationId: 18373,
      nameTr: "Akyaka",
      lat: 40.7419,
      lon: 43.6167,
      demElevationM: 1495,
      subBasinId: "TR36_ARPACAY_AKYAKA_DIGOR_EAST",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18374": Object.freeze({
      stationId: 18374,
      nameTr: "Digor",
      lat: 40.3717,
      lon: 43.4311,
      demElevationM: 1640,
      subBasinId: "TR36_ARPACAY_AKYAKA_DIGOR_EAST",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.74,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "17692": Object.freeze({
      stationId: 17692,
      nameTr: "Sarıkamış (2102 m)",
      lat: 40.3329,
      lon: 42.5983,
      demElevationM: 2102,
      subBasinId: "TR36_SARIKAMIS_CIBILTEPE_POWDER_PINE",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18196": Object.freeze({
      stationId: 18196,
      nameTr: "Sarıkamış Cıbıltepe Kayak Merkezi (2315 m)",
      lat: 40.2966,
      lon: 42.5822,
      demElevationM: 2315,
      subBasinId: "TR36_SARIKAMIS_CIBILTEPE_POWDER_PINE",
      urbanFraction: 0.05,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }),
    "20507": Object.freeze({
      stationId: 20507,
      nameTr: "Sarıkamış Cıbıltepe Zirve Kar İstasyonu (2634 m)",
      lat: 40.282,
      lon: 42.572,
      demElevationM: 2634,
      subBasinId: "TR36_SARIKAMIS_CIBILTEPE_POWDER_PINE",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }),
    "19076": Object.freeze({
      stationId: 19076,
      nameTr: "Allahuekber Dağları Geçit Sırtı (2480 m)",
      lat: 40.52,
      lon: 42.56,
      demElevationM: 2480,
      subBasinId: "TR36_SARIKAMIS_CIBILTEPE_POWDER_PINE",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }),
    "18198": Object.freeze({
      stationId: 18198,
      nameTr: "Kağızman (Aras Derin Vadisi · 1349 m)",
      lat: 40.1533,
      lon: 43.1261,
      demElevationM: 1349,
      subBasinId: "TR36_KAGIZMAN_ARAS_ORCHARD_VALLEY",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([1768, 2128, 2520, 3196] as const),
    maxPhysicalPeakM: HYPSO_TR_36.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_36.bands
  }),
  waterBodies: Object.freeze([]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR36_ALLAHUEKBER_CIBILTEPE_POWDER_UPSLOPE",
      labelTr: "Sarıkamış Cıbıltepe (2634 m) & Allahuekber (3196 m) Kristal Toz Kar Tahkimatı",
      effectiveBarrierHeightM: 2850,
      crestPressureHpa: 700,
      applicableSubBasins: Object.freeze([
        "TR36_SARIKAMIS_CIBILTEPE_POWDER_PINE",
        "TR36_KARS_SELIM_BASALT_PLATEAU"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 85, toDeg: 145 }),
        minCrossCrestSpeedMs: 9.0,
        minFroudeNumber: 0.36,
        sourcePlateauElevationM: 1950,
        maxTargetElevationM: 1850,
        maxWarmingCapC: 2.8,
        subCloudVirgaFactor: 0.52,
        wetCutoffMmHr: 1.4
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 235, toDeg: 335 }),
        minOnshoreOrUpslopeSpeedMs: 4.8,
        coastalFrictionalConvergenceBoost: 1.22,
        maxPrecipMultiplierCap: 1.56
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 80, toDeg: 145 }),
        precipAttenuationFactor: 0.68
      })
    }),
    Object.freeze({
      id: "TR36_KAGIZMAN_ARAS_CANYON_FOEHN",
      labelTr: "Kars Platosu -> Kağızman Aras Derin Vadisi (~1300 m) Fön Isınması ve Yağış Gölgesi",
      effectiveBarrierHeightM: 2450,
      crestPressureHpa: 750,
      applicableSubBasins: Object.freeze(["TR36_KAGIZMAN_ARAS_ORCHARD_VALLEY"]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 285, toDeg: 45 }),
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.32,
        sourcePlateauElevationM: 1850,
        maxTargetElevationM: 1550,
        maxWarmingCapC: 4.8,
        subCloudVirgaFactor: 0.68,
        wetCutoffMmHr: 1.3
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 75, toDeg: 130 }),
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.1,
        maxPrecipMultiplierCap: 1.28
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 280, toDeg: 45 }),
        precipAttenuationFactor: 0.58
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR36_BOGATEPE_ALLAHUEKBER_BLIZZARD_GAP",
      labelTr: "Boğatepe – Selim – Sarıkamış Yüksek Geçit Tipi Koridoru",
      centerCoord: Object.freeze({ lat: 40.52, lon: 42.56 }),
      influenceRadiusKm: 22,
      channelAxisFromDeg: 295,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.32,
      gustMultiplier: 1.45,
      suppressesNocturnalInversion: true
    }),
    Object.freeze({
      id: "TR36_ARAS_KAGIZMAN_GORGE_JET",
      labelTr: "Kağızman – Aras Boğazı Batı-Doğu Vadi Kanalı",
      centerCoord: Object.freeze({ lat: 40.1533, lon: 43.1261 }),
      influenceRadiusKm: 18,
      channelAxisFromDeg: 265,
      bidirectional: true,
      sectorHalfWidthDeg: 26,
      speedMultiplier: 1.24,
      gustMultiplier: 1.34,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 1768,
    coldPoolMaxDepthM: 360,
    topographicEnclosureIndex: 0.88,
    deltaPressureTopHpa: 700,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 7.4
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.58
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 25, toDeg: 115 }),
      minWindShearVs850Deg: 55
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.28,
    invertedVDryMicroburstSusceptibility: 0.46,
    coastalWaterspoutSusceptibility: 0.0
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "kars_center_17098",
      labelTr: "Kars Merkez Bazalt Platosu (WMO 17098 · 1775 m)",
      lat: 40.6042,
      lon: 43.1073,
      elevationM: 1775,
      role: "target" as const
    }),
    Object.freeze({
      key: "selim_kars_frost_hollow",
      labelTr: "Selim – Kars Çayı Ayaz Çanağı (1860 m)",
      lat: 40.4625,
      lon: 42.7908,
      elevationM: 1860,
      role: "corridor" as const
    }),
    Object.freeze({
      key: "sarikamis_pine_belt",
      labelTr: "Sarıkamış Sarıçam Orman Kuşağı (2102 m)",
      lat: 40.3329,
      lon: 42.5983,
      elevationM: 2102,
      role: "foehn_windward" as const
    }),
    Object.freeze({
      key: "cibiltepe_powder_summit",
      labelTr: "Sarıkamış Cıbıltepe Kristal Kar Zirvesi (2634 m)",
      lat: 40.2966,
      lon: 42.5822,
      elevationM: 2634,
      role: "orographic_wall" as const
    }),
    Object.freeze({
      key: "allahuekber_nw_barrier",
      labelTr: "Allahuekber Dağları Kuzeybatı Sırtı (2480 m)",
      lat: 40.52,
      lon: 42.56,
      elevationM: 2480,
      role: "orographic_wall" as const
    }),
    Object.freeze({
      key: "bogatepe_north_pass",
      labelTr: "Boğatepe Kuzey Geçidi (2280 m)",
      lat: 40.795,
      lon: 42.905,
      elevationM: 2280,
      role: "orographic_wall" as const
    }),
    Object.freeze({
      key: "arpacay_cildir_steppe",
      labelTr: "Arpaçay – Çıldır Kuzeydoğu Platosu (1720 m)",
      lat: 40.8447,
      lon: 43.3278,
      elevationM: 1720,
      role: "corridor" as const
    }),
    Object.freeze({
      key: "digor_akyaka_east_border",
      labelTr: "Digor – Akyaka Doğu Basamağı (1640 m)",
      lat: 40.3717,
      lon: 43.4311,
      elevationM: 1640,
      role: "lee_shadow" as const
    }),
    Object.freeze({
      key: "kagizman_aras_orchard_floor",
      labelTr: "Kağızman – Aras Vadisi Meyve Mikrokliması (1349 m)",
      lat: 40.1533,
      lon: 43.1261,
      elevationM: 1349,
      role: "lee_shadow" as const
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -40,
    maxPlausibleTempC: 38,
    minPlausibleMslpHpa: 970,
    maxPlausibleMslpHpa: 1064,
    kalmanTempBiasCapC: 8.5
  }),
  inversion: Object.freeze({
    valleyFloorM: 1768,
    coldPoolDepthM: 360,
    clearNightInversionLapseCPerKm: 5.2,
    snowpackBoostFactor: 1.95,
    enclosureIndex: 0.88
  }),
  urbanHeatIsland: Object.freeze({
    maxNocturnalUhiC: 2.7,
    referenceUrbanFraction: 0.58,
    coldBasinAirportIcaos: Object.freeze(["LTCF"] as const)
  })
} satisfies ProvinceEngineSpec);

export const PROVINCE_SPEC_TR_36: ProvinceSpec = SPEC_TR_36_ENGINE;
export default PROVINCE_SPEC_TR_36;
