import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const MUGLA_NORMALS = TR81_CLIMATOLOGY_1991_2020["TR-48"];
const MUGLA_HYPSO = TR81_HYPSOMETRIC_PROFILES["TR-48"];

/**
 * TR-48 Muğla — Menteşe Masa-Dağ Çanağı (646m), Güneybatılı Orografik Taşkın Duvarı (1.55x),
 * Bodrum–Datça Etesian Koridoru ve Babadağ–Sandras–Akdağlar Zirve Kuşağı
 *
 * Fiziksel Kilitler:
 * - Menteşe Dağları kıyıya paralel değil açılı/dik uzandığından güneyli-güneybatılı (`170°–240°`)
 *   Akdeniz/Ege siklonları Gökova–Marmaris–Köyceğiz oluklarından doğrudan tırmanır: Lodos burada
 *   ASLA fön kurutması yapmaz (`foehnSpec.enabled = false`), tersine Marmaris–Köyceğiz–Muğla Merkez
 *   (`646m` karst polye çanağı) hattında Türkiye'nin en şiddetli kış orografik sağanaklarını
 *   (`maxPrecipMultiplierCap = 1.55`) üretir.
 * - Bodrum–Datça yarımadalarında yaz boyu kuzeybatılı Etesian (Meltem) jet koridoru hakimdir.
 * - Babadağ (`1969m`), Sandras (`2295m`) ve Akdağlar (`2400–2915m`) zirvelerinde siklonik kar fazı görülür.
 * - Çift sivil meydan `["LTFE", "LTBS"]` (Milas-Bodrum & Dalaman) dışında Yunan Rodos (`LGRP`) ve
 *   İstanköy (`LGKO`) METAR istasyonları %100 blokelidir.
 */
export const TR_48_BESPOKE_META = Object.freeze({
  upslopePrecipMultiplier: 1.55,
  lodosSectorDeg: Object.freeze({ fromDeg: 170, toDeg: 240 }),
  lodosFoehnDryingAllowed: false,
  menteseBasinElevationM: 646,
  allowedMetarIcaos: Object.freeze(["LTFE", "LTBS"] as const),
  forbiddenGreekIslandIcaos: Object.freeze(["LGRP", "LGKO", "LGSM", "LGKP"] as const),
  wmoStationId: "17292"
});

const RAW_PROVINCE_SPEC_TR_48: ProvinceSpec = {
  provinceCode: "TR-48",
  plateCode: 48,
  slug: "mugla",
  nameTr: "Muğla",
  region: "AEGEAN",
  climateRegion: "EGE",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "MEDITERRANEAN_COASTAL_OROG",
  icaoWhitelist: TR_48_BESPOKE_META.allowedMetarIcaos,
  domainBounds: {
    minLat: 36.28,
    maxLat: 37.62,
    minLon: 27.20,
    maxLon: 29.78
  },
  primaryCenter: {
    mgmMerkezId: 94801,
    mgmIstNo: 17292,
    mgmSaatlikIstNo: 17292,
    mgmGunlukIstNo: 94801,
    wmoId: "17292",
    lat: 37.2095,
    lon: 28.3668,
    demVerifiedElevationM: 646,
    subBasinId: "mentese_ula_karst_plateau",
    urbanFraction: 0.54,
    monthlyTmaxNormalsC: MUGLA_NORMALS.tmaxC,
    monthlyTminNormalsC: MUGLA_NORMALS.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-48-bodrum",
      name: "Bodrum",
      role: "coast",
      lat: 37.0328,
      lon: 27.4398,
      elevationM: 26
    },
    {
      id: "tr-48-marmaris",
      name: "Marmaris",
      role: "coast",
      lat: 36.8395,
      lon: 28.2452,
      elevationM: 16
    },
    {
      id: "tr-48-fethiye",
      name: "Fethiye",
      role: "coast",
      lat: 36.6266,
      lon: 29.1238,
      elevationM: 3
    },
    {
      id: "tr-48-koycegiz",
      name: "Köyceğiz",
      role: "plain",
      lat: 36.97,
      lon: 28.6869,
      elevationM: 24
    },
    {
      id: "tr-48-kavaklidere",
      name: "Kavaklıdere",
      role: "foothill",
      lat: 37.4508,
      lon: 28.3622,
      elevationM: 973
    },
    {
      id: "tr-48-babadag-zirve",
      name: "Fethiye Babadağ Zirve",
      role: "summit",
      lat: 36.5289,
      lon: 29.185,
      elevationM: 1969
    }
  ],
  subBasins: [
    {
      id: "bodrum_datca_peninsulas",
      labelTr: "Bodrum – Milas Kıyı – Datça Yarımadası Etesian Kuşağı",
      polygonOrBbox: { minLat: 36.64, maxLat: 37.36, minLon: 27.20, maxLon: 28.05 },
      elevationRangeM: [0, 420],
      defaultZone: "peninsula_exposed",
      defaultUrbanFraction: 0.46
    },
    {
      id: "marmaris_koycegiz_dalaman_coast",
      labelTr: "Gökova – Marmaris – Köyceğiz – Ortaca – Dalaman Siklonik Giriş Kıyısı",
      polygonOrBbox: { minLat: 36.65, maxLat: 37.08, minLon: 28.05, maxLon: 28.98 },
      elevationRangeM: [0, 350],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.44
    },
    {
      id: "mentese_ula_karst_plateau",
      labelTr: "Muğla Merkez (Menteşe 646m) – Ula Masa-Dağ Karst Polyesi",
      polygonOrBbox: { minLat: 37.08, maxLat: 37.32, minLon: 28.18, maxLon: 28.62 },
      elevationRangeM: [520, 1050],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.54
    },
    {
      id: "kavaklidere_yatagan_inland",
      labelTr: "Yatağan – Kavaklıdere İç Menteşe Kuzey Geçiş Havzası",
      polygonOrBbox: { minLat: 37.28, maxLat: 37.58, minLon: 27.95, maxLon: 28.62 },
      elevationRangeM: [300, 1350],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.30
    },
    {
      id: "fethiye_seydikemer_basin",
      labelTr: "Fethiye Körfezi – Eşen Çayı – Seydikemer Havzası",
      polygonOrBbox: { minLat: 36.29, maxLat: 36.88, minLon: 28.95, maxLon: 29.52 },
      elevationRangeM: [0, 850],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.48
    },
    {
      id: "babadag_sandras_akdag_alpine",
      labelTr: "Babadağ (1969m) – Sandras (2295m) – Akdağlar (2915m) Alpin Kar Zirveleri",
      polygonOrBbox: { minLat: 36.45, maxLat: 37.18, minLon: 28.72, maxLon: 29.76 },
      elevationRangeM: [1350, 2915],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.03
    }
  ],
  barrierCouplingMatrix: {
    bodrum_datca_peninsulas: {
      bodrum_datca_peninsulas: 1.0,
      marmaris_koycegiz_dalaman_coast: 0.62,
      mentese_ula_karst_plateau: 0.38,
      kavaklidere_yatagan_inland: 0.44,
      fethiye_seydikemer_basin: 0.32,
      babadag_sandras_akdag_alpine: 0.14
    },
    marmaris_koycegiz_dalaman_coast: {
      bodrum_datca_peninsulas: 0.62,
      marmaris_koycegiz_dalaman_coast: 1.0,
      mentese_ula_karst_plateau: 0.76,
      kavaklidere_yatagan_inland: 0.42,
      fethiye_seydikemer_basin: 0.72,
      babadag_sandras_akdag_alpine: 0.46
    },
    mentese_ula_karst_plateau: {
      bodrum_datca_peninsulas: 0.38,
      marmaris_koycegiz_dalaman_coast: 0.76,
      mentese_ula_karst_plateau: 1.0,
      kavaklidere_yatagan_inland: 0.74,
      fethiye_seydikemer_basin: 0.36,
      babadag_sandras_akdag_alpine: 0.48
    },
    kavaklidere_yatagan_inland: {
      bodrum_datca_peninsulas: 0.44,
      marmaris_koycegiz_dalaman_coast: 0.42,
      mentese_ula_karst_plateau: 0.74,
      kavaklidere_yatagan_inland: 1.0,
      fethiye_seydikemer_basin: 0.22,
      babadag_sandras_akdag_alpine: 0.28
    },
    fethiye_seydikemer_basin: {
      bodrum_datca_peninsulas: 0.32,
      marmaris_koycegiz_dalaman_coast: 0.72,
      mentese_ula_karst_plateau: 0.36,
      kavaklidere_yatagan_inland: 0.22,
      fethiye_seydikemer_basin: 1.0,
      babadag_sandras_akdag_alpine: 0.64
    },
    babadag_sandras_akdag_alpine: {
      bodrum_datca_peninsulas: 0.14,
      marmaris_koycegiz_dalaman_coast: 0.46,
      mentese_ula_karst_plateau: 0.48,
      kavaklidere_yatagan_inland: 0.28,
      fethiye_seydikemer_basin: 0.64,
      babadag_sandras_akdag_alpine: 1.0
    }
  },
  stationOverrides: {
    "17292": {
      stationId: 17292,
      nameTr: "Muğla Merkez (Menteşe 646m WMO)",
      lat: 37.2095,
      lon: 28.3668,
      demElevationM: 646,
      subBasinId: "mentese_ula_karst_plateau",
      urbanFraction: 0.54,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "mid_slope"
    },
    "17290": {
      stationId: 17290,
      nameTr: "Bodrum Yarımada",
      lat: 37.0328,
      lon: 27.4398,
      demElevationM: 26,
      subBasinId: "bodrum_datca_peninsulas",
      urbanFraction: 0.56,
      coldPoolSusceptibility: 0.06,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17297": {
      stationId: 17297,
      nameTr: "Datça Yarımada",
      lat: 36.735,
      lon: 27.685,
      demElevationM: 28,
      subBasinId: "bodrum_datca_peninsulas",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.05,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17298": {
      stationId: 17298,
      nameTr: "Marmaris",
      lat: 36.8395,
      lon: 28.2452,
      demElevationM: 21,
      subBasinId: "marmaris_koycegiz_dalaman_coast",
      urbanFraction: 0.58,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17924": {
      stationId: 17924,
      nameTr: "Köyceğiz Orografik Çanak",
      lat: 36.97,
      lon: 28.6869,
      demElevationM: 24,
      subBasinId: "marmaris_koycegiz_dalaman_coast",
      urbanFraction: 0.32,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17294": {
      stationId: 17294,
      nameTr: "Dalaman Meydan (LTBS)",
      lat: 36.7719,
      lon: 28.7986,
      demElevationM: 12,
      subBasinId: "marmaris_koycegiz_dalaman_coast",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    ICAO_LTBS: {
      stationId: "ICAO_LTBS",
      nameTr: "Dalaman Havalimanı METAR (LTBS)",
      lat: 36.7131,
      lon: 28.7925,
      demElevationM: 6,
      subBasinId: "marmaris_koycegiz_dalaman_coast",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.38,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    ICAO_LTFE: {
      stationId: "ICAO_LTFE",
      nameTr: "Milas-Bodrum Havalimanı METAR (LTFE)",
      lat: 37.2506,
      lon: 27.6643,
      demElevationM: 6,
      subBasinId: "bodrum_datca_peninsulas",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17296": {
      stationId: 17296,
      nameTr: "Fethiye Kıyı",
      lat: 36.6266,
      lon: 29.1238,
      demElevationM: 4,
      subBasinId: "fethiye_seydikemer_basin",
      urbanFraction: 0.58,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [
      MUGLA_HYPSO.bands[0].elevationM,
      MUGLA_HYPSO.bands[1].elevationM,
      MUGLA_HYPSO.bands[2].elevationM,
      MUGLA_HYPSO.bands[3].elevationM
    ],
    maxPhysicalPeakM: MUGLA_HYPSO.maxPhysicalPeakM,
    snowElevationBands: MUGLA_HYPSO.bands
  },
  waterBodies: [
    {
      id: "sw_mediterranean_marmaris_fethiye",
      labelTr: "Güneybatı Akdeniz (Marmaris – Köyceğiz/Dalaman Açığı – Fethiye Körfezi)",
      kind: "open_sea",
      mgmMarineStationIds: [17296, 17298, 17386, 17468, 17469, 17471, 17472],
      sampleCoord: { lat: 36.62, lon: 28.45 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -2.1,
      monthlyWaterTempNormalsC: [
        17.6, 16.9, 17.2, 18.5, 21.4, 24.8,
        27.2, 28.3, 26.9, 24.2, 21.1, 18.8
      ],
      subBasinInfluenceWeights: {
        marmaris_koycegiz_dalaman_coast: 0.96,
        fethiye_seydikemer_basin: 0.94,
        mentese_ula_karst_plateau: 0.58,
        babadag_sandras_akdag_alpine: 0.44,
        bodrum_datca_peninsulas: 0.35,
        kavaklidere_yatagan_inland: 0.22
      },
      onshoreWindSectorDeg: { fromDeg: 165, toDeg: 245 },
      effectiveFetchKm: 420,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 11.5,
      dekHeavyDeltaTC: 14.5,
      seaBreezeSpec: {
        activeMonths: [4, 10],
        sectorDeg: { fromDeg: 195, toDeg: 265 },
        maxInlandPenetrationKm: 38,
        maxCoolingAmplitudeC: 4.8
      }
    },
    {
      id: "se_aegean_bodrum_gokova",
      labelTr: "Güney Ege (Güllük – Bodrum – Datça – Gökova Körfezi)",
      kind: "open_sea",
      mgmMarineStationIds: [17290, 17297, 17450, 17470],
      sampleCoord: { lat: 36.94, lon: 27.32 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -2.0,
      monthlyWaterTempNormalsC: [
        16.8, 16.2, 16.5, 17.8, 20.4, 23.4,
        25.1, 25.9, 24.6, 22.4, 19.6, 17.8
      ],
      subBasinInfluenceWeights: {
        bodrum_datca_peninsulas: 0.96,
        marmaris_koycegiz_dalaman_coast: 0.48,
        mentese_ula_karst_plateau: 0.42,
        kavaklidere_yatagan_inland: 0.25,
        fethiye_seydikemer_basin: 0.14,
        babadag_sandras_akdag_alpine: 0.12
      },
      onshoreWindSectorDeg: { fromDeg: 210, toDeg: 335 },
      effectiveFetchKm: 240,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 12.0,
      dekHeavyDeltaTC: 15.0,
      seaBreezeSpec: {
        activeMonths: [5, 10],
        sectorDeg: { fromDeg: 275, toDeg: 335 },
        maxInlandPenetrationKm: 32,
        maxCoolingAmplitudeC: 5.4
      }
    }
  ],
  directionalBarriers: [
    {
      id: "mentese_gokova_sw_orographic_deluge_wall",
      labelTr: "Menteşe – Gökova – Sakartepe Güneybatı Orografik Sağanak Duvarı (Lodos Fönsüz Taşkın Kuşağı)",
      effectiveBarrierHeightM: 1790,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "marmaris_koycegiz_dalaman_coast",
        "mentese_ula_karst_plateau",
        "kavaklidere_yatagan_inland"
      ],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 170, toDeg: 240 },
        minCrossCrestSpeedMs: 99,
        minFroudeNumber: 99,
        sourcePlateauElevationM: 0,
        maxTargetElevationM: 0,
        maxWarmingCapC: 0,
        subCloudVirgaFactor: 0,
        wetCutoffMmHr: 0
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 170, toDeg: 240 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 0.28,
        maxPrecipMultiplierCap: 1.55
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 10, toDeg: 65 },
        precipAttenuationFactor: 0.72
      }
    },
    {
      id: "babadag_sandras_akdag_alpine_barrier",
      labelTr: "Babadağ (1969m) – Sandras (2295m) – Akdağlar (2915m) Siklonik Zirve Bariyeri",
      effectiveBarrierHeightM: 2550,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "fethiye_seydikemer_basin",
        "babadag_sandras_akdag_alpine"
      ],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 165, toDeg: 245 },
        minCrossCrestSpeedMs: 99,
        minFroudeNumber: 99,
        sourcePlateauElevationM: 0,
        maxTargetElevationM: 0,
        maxWarmingCapC: 0,
        subCloudVirgaFactor: 0,
        wetCutoffMmHr: 0
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 245 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 0.26,
        maxPrecipMultiplierCap: 1.55
      }
    }
  ],
  venturiCorridors: [
    {
      id: "bodrum_datca_etesian_corridor",
      labelTr: "Bodrum – Gökova Ağzı – Datça Yarımada Etesian (Meltem) Koridoru",
      centerCoord: { lat: 36.86, lon: 27.56 },
      influenceRadiusKm: 42,
      channelAxisFromDeg: 325,
      bidirectional: false,
      sectorHalfWidthDeg: 38,
      speedMultiplier: 1.38,
      gustMultiplier: 1.48,
      suppressesNocturnalInversion: true
    },
    {
      id: "gokova_sakartepe_inflow_chute",
      labelTr: "Gökova Körfezi – Akyaka – Sakartepe Güneybatı Siklonik Besleme Oluğu",
      centerCoord: { lat: 37.03, lon: 28.32 },
      influenceRadiusKm: 28,
      channelAxisFromDeg: 205,
      bidirectional: true,
      sectorHalfWidthDeg: 35,
      speedMultiplier: 1.30,
      gustMultiplier: 1.44,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 646,
    coldPoolMaxDepthM: 190,
    topographicEnclosureIndex: 0.68,
    deltaPressureTopHpa: 26,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 3.1
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.28
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.74,
    invertedVDryMicroburstSusceptibility: 0.34,
    coastalWaterspoutSusceptibility: 0.88
  },
  stencil9Points: [
    {
      key: "target_mugla_mentese",
      labelTr: "Muğla Merkez (Menteşe Karst Polyesi 646m)",
      lat: 37.2095,
      lon: 28.3668,
      elevationM: 646,
      role: "target"
    },
    {
      key: "marine_marmaris_rhodes_channel",
      labelTr: "Marmaris Güneybatı Akdeniz Siklon Girişi",
      lat: 36.68,
      lon: 28.22,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "marine_gokova_bay_upwind",
      labelTr: "Gökova Körfezi Deniz Nem Kaynağı",
      lat: 36.98,
      lon: 28.08,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "corridor_bodrum_datca_etesian",
      labelTr: "Bodrum – Datça Etesian Yarımada Hattı",
      lat: 37.0328,
      lon: 27.4398,
      elevationM: 26,
      role: "corridor"
    },
    {
      key: "corridor_koycegiz_dalaman",
      labelTr: "Köyceğiz – Dalaman Orografik Besleme Ovası",
      lat: 36.97,
      lon: 28.6869,
      elevationM: 24,
      role: "corridor"
    },
    {
      key: "orographic_sandras_wall",
      labelTr: "Sandras Dağı (2295m) Ana Orografik Duvar",
      lat: 37.068,
      lon: 28.836,
      elevationM: 2295,
      role: "orographic_wall"
    },
    {
      key: "orographic_babadag_summit",
      labelTr: "Fethiye Babadağ Zirve (1969m)",
      lat: 36.5289,
      lon: 29.185,
      elevationM: 1969,
      role: "orographic_wall"
    },
    {
      key: "orographic_akdaglar_seydikemer",
      labelTr: "Seydikemer Akdağlar Batı Sırtı (2450m)",
      lat: 36.565,
      lon: 29.535,
      elevationM: 2450,
      role: "orographic_wall"
    },
    {
      key: "lee_yatagan_kavaklidere_north",
      labelTr: "Yatağan – Kavaklıdere Kuzey İç Geçiş",
      lat: 37.3395,
      lon: 28.1369,
      elevationM: 365,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -16.0,
    maxPlausibleTempC: 46.0,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1038,
    kalmanTempBiasCapC: 5.5
  }
};

export const PROVINCE_SPEC_TR_48: ProvinceSpec = Object.freeze(RAW_PROVINCE_SPEC_TR_48);

function isSectorMatch(deg: number, sector: { fromDeg: number; toDeg: number }): boolean {
  const d = ((deg % 360) + 360) % 360;
  if (sector.fromDeg <= sector.toDeg) {
    return d >= sector.fromDeg && d <= sector.toDeg;
  }
  return d >= sector.fromDeg || d <= sector.toDeg;
}

export function evaluateMuglaOrographicCycloneResponse(params: {
  windFromDirDeg: number;
  windSpeedMs: number;
  basePrecipMmHr: number;
  targetSubBasinId: string;
  targetElevationM: number;
  temp850C: number;
}): {
  adjustedPrecipMmHr: number;
  precipMultiplier: number;
  foehnWarmingC: number;
  isLodosDelugeRegime: boolean;
  summitSnowPhase: boolean;
} {
  const matchingBarrier =
    PROVINCE_SPEC_TR_48.directionalBarriers.find((b) =>
      b.applicableSubBasins.includes(params.targetSubBasinId)
    ) ?? PROVINCE_SPEC_TR_48.directionalBarriers[0];

  const foehnWarmingC = matchingBarrier.foehnSpec.enabled
    ? matchingBarrier.foehnSpec.maxWarmingCapC
    : 0;

  let precipMultiplier = 1.0;
  let isLodosDelugeRegime = false;

  if (
    matchingBarrier.upslopeSpec.enabled &&
    isSectorMatch(params.windFromDirDeg, matchingBarrier.upslopeSpec.windFromSectorDeg) &&
    params.windSpeedMs >= matchingBarrier.upslopeSpec.minOnshoreOrUpslopeSpeedMs
  ) {
    isLodosDelugeRegime = true;
    const speedRamp = Math.min(
      1,
      (params.windSpeedMs - matchingBarrier.upslopeSpec.minOnshoreOrUpslopeSpeedMs) / 10.0 +
        matchingBarrier.upslopeSpec.coastalFrictionalConvergenceBoost
    );
    const maxCap = matchingBarrier.upslopeSpec.maxPrecipMultiplierCap;
    precipMultiplier = Math.min(maxCap, 1 + (maxCap - 1) * Math.min(1, speedRamp + 0.35));
  } else if (
    matchingBarrier.rainShadowSpec &&
    isSectorMatch(
      params.windFromDirDeg,
      matchingBarrier.rainShadowSpec.shadowedWindFromSectorDeg
    )
  ) {
    precipMultiplier = matchingBarrier.rainShadowSpec.precipAttenuationFactor;
  }

  const estimatedTargetTempC =
    params.temp850C - ((params.targetElevationM - 1500) / 1000) * 5.5;
  const summitSnowPhase =
    params.targetElevationM >= 1850 && estimatedTargetTempC <= 1.2 && params.basePrecipMmHr > 0;

  return {
    adjustedPrecipMmHr: params.basePrecipMmHr * precipMultiplier,
    precipMultiplier,
    foehnWarmingC,
    isLodosDelugeRegime,
    summitSnowPhase
  };
}

export default PROVINCE_SPEC_TR_48;
