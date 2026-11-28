import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const AYDIN_NORMALS = TR81_CLIMATOLOGY_1991_2020["TR-09"];
const AYDIN_HYPSO = TR81_HYPSOMETRIC_PROFILES["TR-09"];

/**
 * TR-09 Aydın — Büyük Menderes Graben Oluğu, Ege İmbat Koridoru ve Aydın/Menteşe Duvarları
 *
 * Fiziksel Kilitler:
 * - Doğu–batı uzanımlı Büyük Menderes graben tabanı (`basinFloorElevationM = 55m`).
 * - Kuşadası / Didim kıyısında kuvvetli Ege meltemi (İmbat, `250°–305°`, `-6.2°C`'ye varan
 *   kıyı serinlemesi) etkiliyken; Söke–Ortaklar kapısından doğuya doğru deniz etkisi zayıflar,
 *   Aydın Merkez (Efeler, `56m`) ve Nazilli–Kuyucak–Buharkent iç graben hattında kuzeyli Etesian/Poyraz
 *   (`1831m` Aydın Dağları aşımı adyabatik sıkışma) + subtropikal çökme ile Türkiye'nin en yüksek yaz
 *   ekstremleri (`+45..+47°C`) oluşur.
 * - Uluslararası sivil METAR meydanı yoktur (`icaoWhitelist: []`); İzmir `LTBJ` veya Yunan Sisam
 *   `LGSM` verisi sızdırılmaz. Kalibrasyon `WMO 17234` (Tier-A) üzerinden yürütülür.
 */
export const TR_09_BESPOKE_META = Object.freeze({
  valleyFloorM: 55,
  allowedMetarIcaos: Object.freeze([] as const),
  forbiddenNeighborAndForeignIcaos: Object.freeze(["LTBJ", "LTFE", "LTBD", "LGSM", "LGKO"] as const),
  wmoStationId: "17234",
  aydinMountainsPeakM: 1831,
  extremeSummerHeatRangeC: Object.freeze([45, 47] as const)
});

const RAW_PROVINCE_SPEC_TR_09: ProvinceSpec = {
  provinceCode: "TR-09",
  plateCode: 9,
  slug: "aydin",
  nameTr: "Aydın",
  region: "AEGEAN",
  climateRegion: "EGE",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "AEGEAN_COASTAL_GRABEN",
  icaoWhitelist: TR_09_BESPOKE_META.allowedMetarIcaos,
  domainBounds: {
    minLat: 37.30,
    maxLat: 38.15,
    minLon: 27.00,
    maxLon: 28.92
  },
  primaryCenter: {
    mgmMerkezId: 90901,
    mgmIstNo: 17234,
    mgmSaatlikIstNo: 17234,
    mgmGunlukIstNo: 90901,
    wmoId: "17234",
    lat: 37.8402,
    lon: 27.8379,
    demVerifiedElevationM: 56,
    subBasinId: "buyuk_menderes_central_graben",
    urbanFraction: 0.68,
    monthlyTmaxNormalsC: AYDIN_NORMALS.tmaxC,
    monthlyTminNormalsC: AYDIN_NORMALS.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-09-kusadasi",
      name: "Kuşadası",
      role: "coast",
      lat: 37.8597,
      lon: 27.2652,
      elevationM: 25
    },
    {
      id: "tr-09-didim",
      name: "Didim",
      role: "coast",
      lat: 37.3699,
      lon: 27.2645,
      elevationM: 44
    },
    {
      id: "tr-09-soke",
      name: "Söke",
      role: "plain",
      lat: 37.7049,
      lon: 27.3827,
      elevationM: 75
    },
    {
      id: "tr-09-nazilli",
      name: "Nazilli",
      role: "plain",
      lat: 37.9135,
      lon: 28.3437,
      elevationM: 84
    },
    {
      id: "tr-09-karacasu",
      name: "Karacasu",
      role: "foothill",
      lat: 37.7194,
      lon: 28.6075,
      elevationM: 580
    },
    {
      id: "tr-09-aydin-daglari-pasayaylasi",
      name: "Aydın Dağları (Paşayaylası / Cevizli Sırtı)",
      role: "summit",
      lat: 37.985,
      lon: 28.085,
      elevationM: 1480
    }
  ],
  subBasins: [
    {
      id: "kusadasi_didim_coast",
      labelTr: "Kuşadası – Dilek Yarımadası – Didim Ege Kıyı Kuşağı",
      polygonOrBbox: { minLat: 37.32, maxLat: 37.95, minLon: 27.00, maxLon: 27.42 },
      elevationRangeM: [0, 220],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.56
    },
    {
      id: "soke_germencik_lower_graben",
      labelTr: "Söke Ovası – Ortaklar – Germencik Alt Menderes Meltem Kapısı",
      polygonOrBbox: { minLat: 37.52, maxLat: 37.92, minLon: 27.32, maxLon: 27.72 },
      elevationRangeM: [5, 180],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.42
    },
    {
      id: "buyuk_menderes_central_graben",
      labelTr: "Aydın Merkez (Efeler) – İncirliova – Köşk Orta Graben Oluğu",
      polygonOrBbox: { minLat: 37.72, maxLat: 37.93, minLon: 27.64, maxLon: 28.18 },
      elevationRangeM: [30, 240],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.68
    },
    {
      id: "nazilli_buharkent_inner_graben",
      labelTr: "Sultanhisar – Nazilli – Kuyucak – Buharkent İç Graben Sıcak Oluğu",
      polygonOrBbox: { minLat: 37.80, maxLat: 38.04, minLon: 28.12, maxLon: 28.90 },
      elevationRangeM: [45, 320],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.55
    },
    {
      id: "cine_bozdogan_madran_south",
      labelTr: "Çine Çayı – Bozdoğan – Karacasu – Madranbaba (Menteşe Kuzey Yamacı)",
      polygonOrBbox: { minLat: 37.44, maxLat: 37.78, minLon: 27.75, maxLon: 28.75 },
      elevationRangeM: [70, 1792],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.22
    },
    {
      id: "aydin_mountains_north_wall",
      labelTr: "Aydın Dağları (Cevizli – Paşayaylası – Hacetdede 1831m) Kuzey Duvarı",
      polygonOrBbox: { minLat: 37.92, maxLat: 38.13, minLon: 27.45, maxLon: 28.65 },
      elevationRangeM: [550, 1831],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.05
    }
  ],
  barrierCouplingMatrix: {
    kusadasi_didim_coast: {
      kusadasi_didim_coast: 1.0,
      soke_germencik_lower_graben: 0.78,
      buyuk_menderes_central_graben: 0.42,
      nazilli_buharkent_inner_graben: 0.18,
      cine_bozdogan_madran_south: 0.24,
      aydin_mountains_north_wall: 0.22
    },
    soke_germencik_lower_graben: {
      kusadasi_didim_coast: 0.78,
      soke_germencik_lower_graben: 1.0,
      buyuk_menderes_central_graben: 0.82,
      nazilli_buharkent_inner_graben: 0.48,
      cine_bozdogan_madran_south: 0.38,
      aydin_mountains_north_wall: 0.28
    },
    buyuk_menderes_central_graben: {
      kusadasi_didim_coast: 0.42,
      soke_germencik_lower_graben: 0.82,
      buyuk_menderes_central_graben: 1.0,
      nazilli_buharkent_inner_graben: 0.84,
      cine_bozdogan_madran_south: 0.52,
      aydin_mountains_north_wall: 0.32
    },
    nazilli_buharkent_inner_graben: {
      kusadasi_didim_coast: 0.18,
      soke_germencik_lower_graben: 0.48,
      buyuk_menderes_central_graben: 0.84,
      nazilli_buharkent_inner_graben: 1.0,
      cine_bozdogan_madran_south: 0.46,
      aydin_mountains_north_wall: 0.34
    },
    cine_bozdogan_madran_south: {
      kusadasi_didim_coast: 0.24,
      soke_germencik_lower_graben: 0.38,
      buyuk_menderes_central_graben: 0.52,
      nazilli_buharkent_inner_graben: 0.46,
      cine_bozdogan_madran_south: 1.0,
      aydin_mountains_north_wall: 0.14
    },
    aydin_mountains_north_wall: {
      kusadasi_didim_coast: 0.22,
      soke_germencik_lower_graben: 0.28,
      buyuk_menderes_central_graben: 0.32,
      nazilli_buharkent_inner_graben: 0.34,
      cine_bozdogan_madran_south: 0.14,
      aydin_mountains_north_wall: 1.0
    }
  },
  stationOverrides: {
    "17234": {
      stationId: 17234,
      nameTr: "Aydın Merkez (Efeler WMO)",
      lat: 37.8402,
      lon: 27.8379,
      demElevationM: 56,
      subBasinId: "buyuk_menderes_central_graben",
      urbanFraction: 0.68,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "basin_floor"
    },
    "17232": {
      stationId: 17232,
      nameTr: "Kuşadası Kıyı",
      lat: 37.8597,
      lon: 27.2652,
      demElevationM: 22,
      subBasinId: "kusadasi_didim_coast",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17233": {
      stationId: 17233,
      nameTr: "Didim Kıyı",
      lat: 37.3699,
      lon: 27.2645,
      demElevationM: 44,
      subBasinId: "kusadasi_didim_coast",
      urbanFraction: 0.50,
      coldPoolSusceptibility: 0.10,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17881": {
      stationId: 17881,
      nameTr: "Söke",
      lat: 37.7049,
      lon: 27.3827,
      demElevationM: 75,
      subBasinId: "soke_germencik_lower_graben",
      urbanFraction: 0.48,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "coastal_or_gap"
    },
    "17860": {
      stationId: 17860,
      nameTr: "Nazilli İç Graben",
      lat: 37.9135,
      lon: 28.3437,
      demElevationM: 84,
      subBasinId: "nazilli_buharkent_inner_graben",
      urbanFraction: 0.64,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "basin_floor"
    },
    "18025": {
      stationId: 18025,
      nameTr: "Karacasu Yayla Eteği",
      lat: 37.7194,
      lon: 28.6075,
      demElevationM: 580,
      subBasinId: "cine_bozdogan_madran_south",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [
      AYDIN_HYPSO.bands[0].elevationM,
      AYDIN_HYPSO.bands[1].elevationM,
      AYDIN_HYPSO.bands[2].elevationM,
      AYDIN_HYPSO.bands[3].elevationM
    ],
    maxPhysicalPeakM: AYDIN_HYPSO.maxPhysicalPeakM,
    snowElevationBands: AYDIN_HYPSO.bands
  },
  waterBodies: [
    {
      id: "aegean_kusadasi_didim_shelf",
      labelTr: "Güney Ege Kıta Sahanlığı (Kuşadası Körfezi – Dilek Boğazı – Didim)",
      kind: "open_sea",
      mgmMarineStationIds: [17232, 17233, 17381, 17492],
      sampleCoord: { lat: 37.78, lon: 27.16 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -2.0,
      monthlyWaterTempNormalsC: [
        16.2, 15.6, 16.0, 17.4, 20.1, 23.2,
        24.8, 25.4, 24.1, 21.8, 19.1, 17.2
      ],
      subBasinInfluenceWeights: {
        kusadasi_didim_coast: 0.95,
        soke_germencik_lower_graben: 0.58,
        buyuk_menderes_central_graben: 0.24,
        nazilli_buharkent_inner_graben: 0.08,
        cine_bozdogan_madran_south: 0.12,
        aydin_mountains_north_wall: 0.18
      },
      onshoreWindSectorDeg: { fromDeg: 235, toDeg: 315 },
      effectiveFetchKm: 185,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 12.5,
      dekHeavyDeltaTC: 15.5,
      seaBreezeSpec: {
        activeMonths: [4, 10],
        sectorDeg: { fromDeg: 250, toDeg: 305 },
        maxInlandPenetrationKm: 62,
        maxCoolingAmplitudeC: 6.2
      }
    }
  ],
  directionalBarriers: [
    {
      id: "aydin_daglari_north_wall",
      labelTr: "Aydın Dağları (1831m) Kuzey Duvarı — Kuzeyli Fön Isınması & Güneybatılı Orografik Kaldırma",
      effectiveBarrierHeightM: 1831,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "buyuk_menderes_central_graben",
        "nazilli_buharkent_inner_graben",
        "soke_germencik_lower_graben"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 350, toDeg: 55 },
        minCrossCrestSpeedMs: 5.5,
        minFroudeNumber: 0.75,
        sourcePlateauElevationM: 760,
        maxTargetElevationM: 260,
        maxWarmingCapC: 4.8,
        subCloudVirgaFactor: 0.35,
        wetCutoffMmHr: 0.4
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 200, toDeg: 270 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 0.18,
        maxPrecipMultiplierCap: 1.38
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 355, toDeg: 50 },
        precipAttenuationFactor: 0.68
      }
    },
    {
      id: "mentese_madranbaba_south_wall",
      labelTr: "Madranbaba – Çine Menteşe Kuzey Eşiği (1792m)",
      effectiveBarrierHeightM: 1792,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "cine_bozdogan_madran_south",
        "buyuk_menderes_central_graben",
        "nazilli_buharkent_inner_graben"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 150, toDeg: 205 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.85,
        sourcePlateauElevationM: 650,
        maxTargetElevationM: 220,
        maxWarmingCapC: 3.6,
        subCloudVirgaFactor: 0.28,
        wetCutoffMmHr: 0.6
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 245, toDeg: 320 },
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 0.14,
        maxPrecipMultiplierCap: 1.34
      }
    }
  ],
  venturiCorridors: [
    {
      id: "soke_ortaklar_imbat_gate",
      labelTr: "Söke – Ortaklar – Germencik İmbat Koridoru",
      centerCoord: { lat: 37.785, lon: 27.495 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 265,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.28,
      gustMultiplier: 1.36,
      suppressesNocturnalInversion: true
    },
    {
      id: "dilek_strait_kusadasi_jet",
      labelTr: "Dilek Boğazı – Kuşadası Etesian Kanalı",
      centerCoord: { lat: 37.685, lon: 27.145 },
      influenceRadiusKm: 18,
      channelAxisFromDeg: 310,
      bidirectional: false,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.32,
      gustMultiplier: 1.42,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 55,
    coldPoolMaxDepthM: 180,
    topographicEnclosureIndex: 0.62,
    deltaPressureTopHpa: 28,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 2.2
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.22
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.68,
    invertedVDryMicroburstSusceptibility: 0.64,
    coastalWaterspoutSusceptibility: 0.48
  },
  stencil9Points: [
    {
      key: "target_efeler_center",
      labelTr: "Aydın Merkez (Efeler Graben Tabanı 56m)",
      lat: 37.8402,
      lon: 27.8379,
      elevationM: 56,
      role: "target"
    },
    {
      key: "marine_kusadasi_upwind",
      labelTr: "Kuşadası Körfezi Açığı (Ege İmbat Kaynağı)",
      lat: 37.82,
      lon: 27.14,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "marine_didim_sw_upwind",
      labelTr: "Didim Güneybatı Ege Açığı",
      lat: 37.33,
      lon: 27.16,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "corridor_soke_gate",
      labelTr: "Söke – Ortaklar Meltem Giriş Kapısı",
      lat: 37.7049,
      lon: 27.3827,
      elevationM: 75,
      role: "corridor"
    },
    {
      key: "corridor_nazilli_inner_graben",
      labelTr: "Nazilli İç Graben Sıcak Ekseni",
      lat: 37.9135,
      lon: 28.3437,
      elevationM: 84,
      role: "corridor"
    },
    {
      key: "orographic_aydin_daglari_north",
      labelTr: "Aydın Dağları Cevizli Sırtı (Kuzey Duvarı)",
      lat: 37.985,
      lon: 28.085,
      elevationM: 1480,
      role: "orographic_wall"
    },
    {
      key: "orographic_madranbaba_south",
      labelTr: "Madranbaba Zirve Kuşağı (Güney Duvarı)",
      lat: 37.625,
      lon: 28.185,
      elevationM: 1520,
      role: "orographic_wall"
    },
    {
      key: "foehn_cine_south_pass",
      labelTr: "Çine – Yatağan Güney Geçidi",
      lat: 37.5947,
      lon: 28.0447,
      elevationM: 70,
      role: "foehn_windward"
    },
    {
      key: "lee_buharkent_east_exit",
      labelTr: "Buharkent – Sarayköy Doğu Graben Çıkışı",
      lat: 37.9739,
      lon: 28.7444,
      elevationM: 210,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -14.0,
    maxPlausibleTempC: 48.5,
    minPlausibleMslpHpa: 982,
    maxPlausibleMslpHpa: 1040,
    kalmanTempBiasCapC: 5.5
  }
};

export const PROVINCE_SPEC_TR_09: ProvinceSpec = Object.freeze(RAW_PROVINCE_SPEC_TR_09);

function isSectorMatch(deg: number, sector: { fromDeg: number; toDeg: number }): boolean {
  const d = ((deg % 360) + 360) % 360;
  if (sector.fromDeg <= sector.toDeg) {
    return d >= sector.fromDeg && d <= sector.toDeg;
  }
  return d >= sector.fromDeg || d <= sector.toDeg;
}

/**
 * Büyük Menderes graben ekseninde kıyı Ege meltemi (Kuşadası/Didim) ile iç graben
 * (Aydın Merkez / Nazilli `+45..+47°C`) yaz termal ayrışmasını `PROVINCE_SPEC_TR_09`
 * parametrelerinden deterministik olarak hesaplar.
 */
export function evaluateAydinGrabenSummerProfile(params: {
  temp850C: number;
  windFromDirDeg: number;
  windSpeedMs: number;
  inlandDistanceKm: number;
  elevationM: number;
  month1To12: number;
}): {
  estimatedTemp2mC: number;
  seaBreezeCoolingC: number;
  northFoehnWarmingC: number;
} {
  const seaBody = PROVINCE_SPEC_TR_09.waterBodies[0];
  const northWall = PROVINCE_SPEC_TR_09.directionalBarriers[0];
  const valleyFloorM = PROVINCE_SPEC_TR_09.inversionAndWedgeSpec.basinFloorElevationM;

  const dryAdiabaticDeltaC = ((1500 - Math.max(valleyFloorM, params.elevationM)) / 1000) * 9.8;
  const grabenSolarSuperheatC =
    params.month1To12 >= 6 && params.month1To12 <= 8
      ? 1.2 * Math.min(1, Math.max(0, params.inlandDistanceKm / 45))
      : 0.4;

  let seaBreezeCoolingC = 0;
  const [mStart, mEnd] = seaBody.seaBreezeSpec.activeMonths;
  if (
    params.month1To12 >= mStart &&
    params.month1To12 <= mEnd &&
    isSectorMatch(params.windFromDirDeg, seaBody.seaBreezeSpec.sectorDeg) &&
    params.inlandDistanceKm < seaBody.seaBreezeSpec.maxInlandPenetrationKm
  ) {
    const penetrationDecay =
      1 - params.inlandDistanceKm / seaBody.seaBreezeSpec.maxInlandPenetrationKm;
    const speedFactor = Math.min(1, Math.max(0.25, params.windSpeedMs / 6.0));
    seaBreezeCoolingC =
      seaBody.seaBreezeSpec.maxCoolingAmplitudeC * penetrationDecay * speedFactor;
  }

  let northFoehnWarmingC = 0;
  if (
    northWall.foehnSpec.enabled &&
    isSectorMatch(params.windFromDirDeg, northWall.foehnSpec.windFromSectorDeg) &&
    params.windSpeedMs >= northWall.foehnSpec.minCrossCrestSpeedMs &&
    params.elevationM <= northWall.foehnSpec.maxTargetElevationM &&
    params.inlandDistanceKm >= 25
  ) {
    const ramp = Math.min(
      1,
      (params.windSpeedMs - northWall.foehnSpec.minCrossCrestSpeedMs) / 7.0 + 0.35
    );
    northFoehnWarmingC = northWall.foehnSpec.maxWarmingCapC * ramp;
  }

  const rawTempC =
    params.temp850C +
    dryAdiabaticDeltaC +
    grabenSolarSuperheatC +
    northFoehnWarmingC -
    seaBreezeCoolingC;

  const estimatedTemp2mC = Math.max(
    PROVINCE_SPEC_TR_09.qcAndMosBounds.minPlausibleTempC,
    Math.min(PROVINCE_SPEC_TR_09.qcAndMosBounds.maxPlausibleTempC, rawTempC)
  );

  return {
    estimatedTemp2mC,
    seaBreezeCoolingC,
    northFoehnWarmingC
  };
}

export default PROVINCE_SPEC_TR_09;
