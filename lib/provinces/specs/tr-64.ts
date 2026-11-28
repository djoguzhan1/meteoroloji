import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const USAK_NORMALS = TR81_CLIMATOLOGY_1991_2020["TR-64"];
const USAK_HYPSO = TR81_HYPSOMETRIC_PROFILES["TR-64"];

/**
 * TR-64 Uşak — İç Batı Anadolu Karasal Eşiği (919m Merkez, Murat Dağı 2309m, Kıyı Yok)
 *
 * Fiziksel Kilitler:
 * - Gediz oluğunun doğuda bittiği ve İç Batı Anadolu platosuna (`919m` Uşak Merkez, `987m` Banaz)
 *   adım atıldığı keskin karasal eşiktir. Deniz/kıyı kütlesi yoktur (`waterBodies: []`).
 * - Kışın Ege cephe geçişlerinde İzmir (`0–25m`) ve Manisa (`70–90m`) yağmur alırken; cephe nemi
 *   Kula–Eşme–Güre rampasından `919m` Uşak platosuna tırmandığında kuzeydoğulu yüzey soğuk kaması
 *   (`shallowColdWedgeRule`: `15°–95°`) ve buharlaşmalı yaş-hazne soğumasıyla yağış hızla sulu kar
 *   ve örtülü kar fazına döner; Murat Dağı (`2309m`) ve Bulkaz sırtlarında yoğun kar bırakır.
 * - Kalibrasyon `WMO 17188` (Tier-A) ve `icaoWhitelist: ["LTBO"]` (Uşak Havalimanı) ile kilitlidir.
 */
export const TR_64_BESPOKE_META = Object.freeze({
  allowedMetarIcaos: Object.freeze(["LTBO"] as const),
  wmoStationId: "17188",
  centerElevationM: 919,
  muratDagiPeakM: 2309,
  hasCoastalWaterBody: false
});

const RAW_PROVINCE_SPEC_TR_64: ProvinceSpec = {
  provinceCode: "TR-64",
  plateCode: 64,
  slug: "usak",
  nameTr: "Uşak",
  region: "AEGEAN",
  climateRegion: "EGE",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "INNER_AEGEAN_STEPPE",
  icaoWhitelist: TR_64_BESPOKE_META.allowedMetarIcaos,
  domainBounds: {
    minLat: 38.16,
    maxLat: 38.94,
    minLon: 28.75,
    maxLon: 30.04
  },
  primaryCenter: {
    mgmMerkezId: 96401,
    mgmIstNo: 17188,
    mgmSaatlikIstNo: 17188,
    mgmGunlukIstNo: 96401,
    wmoId: "17188",
    lat: 38.6712,
    lon: 29.404,
    demVerifiedElevationM: 919,
    subBasinId: "usak_central_plateau",
    urbanFraction: 0.60,
    monthlyTmaxNormalsC: USAK_NORMALS.tmaxC,
    monthlyTminNormalsC: USAK_NORMALS.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-64-ulubey",
      name: "Ulubey (Kanyon Platosu)",
      role: "plain",
      lat: 38.4169,
      lon: 29.2786,
      elevationM: 730
    },
    {
      id: "tr-64-esme",
      name: "Eşme (Gediz Eşiği)",
      role: "plain",
      lat: 38.3961,
      lon: 28.9906,
      elevationM: 809
    },
    {
      id: "tr-64-banaz",
      name: "Banaz",
      role: "foothill",
      lat: 38.7525,
      lon: 29.7436,
      elevationM: 987
    },
    {
      id: "tr-64-sivasli",
      name: "Sivaslı",
      role: "foothill",
      lat: 38.4986,
      lon: 29.6953,
      elevationM: 990
    },
    {
      id: "tr-64-murat-dagi-guney",
      name: "Murat Dağı Güney Zirve Kuşağı",
      role: "summit",
      lat: 38.91,
      lon: 29.615,
      elevationM: 2050
    }
  ],
  subBasins: [
    {
      id: "esme_ulubey_western_step",
      labelTr: "Eşme – Ulubey Kanyonu – Karahallı Batı/Güney Alt Basamağı (600–905m)",
      polygonOrBbox: { minLat: 38.17, maxLat: 38.56, minLon: 28.76, maxLon: 29.58 },
      elevationRangeM: [580, 910],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.26
    },
    {
      id: "usak_central_plateau",
      labelTr: "Uşak Merkez (919m) – LTBO Havalimanı Ovası İç Eşik Platosu",
      polygonOrBbox: { minLat: 38.56, maxLat: 38.80, minLon: 29.18, maxLon: 29.60 },
      elevationRangeM: [860, 1050],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.60
    },
    {
      id: "banaz_sivasli_eastern_threshold",
      labelTr: "Banaz – Sivaslı – Dumlupınar Batı Yakası Yüksek Karasal Eşik (950–1400m)",
      polygonOrBbox: { minLat: 38.42, maxLat: 38.86, minLon: 29.58, maxLon: 30.03 },
      elevationRangeM: [920, 1450],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.24
    },
    {
      id: "murat_dagi_bulkaz_alpine",
      labelTr: "Murat Dağı (2309m) – Bulkaz Dağı Alpin Kar Kuşağı",
      polygonOrBbox: { minLat: 38.46, maxLat: 38.94, minLon: 29.52, maxLon: 29.92 },
      elevationRangeM: [1450, 2309],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.02
    }
  ],
  barrierCouplingMatrix: {
    esme_ulubey_western_step: {
      esme_ulubey_western_step: 1.0,
      usak_central_plateau: 0.78,
      banaz_sivasli_eastern_threshold: 0.56,
      murat_dagi_bulkaz_alpine: 0.30
    },
    usak_central_plateau: {
      esme_ulubey_western_step: 0.78,
      usak_central_plateau: 1.0,
      banaz_sivasli_eastern_threshold: 0.80,
      murat_dagi_bulkaz_alpine: 0.44
    },
    banaz_sivasli_eastern_threshold: {
      esme_ulubey_western_step: 0.56,
      usak_central_plateau: 0.80,
      banaz_sivasli_eastern_threshold: 1.0,
      murat_dagi_bulkaz_alpine: 0.64
    },
    murat_dagi_bulkaz_alpine: {
      esme_ulubey_western_step: 0.30,
      usak_central_plateau: 0.44,
      banaz_sivasli_eastern_threshold: 0.64,
      murat_dagi_bulkaz_alpine: 1.0
    }
  },
  stationOverrides: {
    "17188": {
      stationId: 17188,
      nameTr: "Uşak Merkez WMO (919m)",
      lat: 38.6712,
      lon: 29.404,
      demElevationM: 919,
      subBasinId: "usak_central_plateau",
      urbanFraction: 0.60,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "mid_slope"
    },
    ICAO_LTBO: {
      stationId: "ICAO_LTBO",
      nameTr: "Uşak Havalimanı METAR (LTBO 881m)",
      lat: 38.6814,
      lon: 29.4717,
      demElevationM: 881,
      subBasinId: "usak_central_plateau",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.74,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17827": {
      stationId: 17827,
      nameTr: "Eşme",
      lat: 38.3961,
      lon: 28.9906,
      demElevationM: 809,
      subBasinId: "esme_ulubey_western_step",
      urbanFraction: 0.32,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "mid_slope"
    },
    "18070": {
      stationId: 18070,
      nameTr: "Ulubey",
      lat: 38.4169,
      lon: 29.2786,
      demElevationM: 730,
      subBasinId: "esme_ulubey_western_step",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "basin_floor"
    },
    "18069": {
      stationId: 18069,
      nameTr: "Banaz Yüksek Eşik (987m)",
      lat: 38.7525,
      lon: 29.7436,
      demElevationM: 987,
      subBasinId: "banaz_sivasli_eastern_threshold",
      urbanFraction: 0.30,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "mid_slope"
    },
    "18071": {
      stationId: 18071,
      nameTr: "Sivaslı (990m)",
      lat: 38.4986,
      lon: 29.6953,
      demElevationM: 990,
      subBasinId: "banaz_sivasli_eastern_threshold",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "mid_slope"
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [
      USAK_HYPSO.bands[0].elevationM,
      USAK_HYPSO.bands[1].elevationM,
      USAK_HYPSO.bands[2].elevationM,
      USAK_HYPSO.bands[3].elevationM
    ],
    maxPhysicalPeakM: USAK_HYPSO.maxPhysicalPeakM,
    snowElevationBands: USAK_HYPSO.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "gediz_headwall_usak_ramp",
      labelTr: "Gediz Çıkışı – Güre – Eşme Batı Tırmanma Rampası (Cephesel Yağmur->Kar Faz Eşiği)",
      effectiveBarrierHeightM: 1250,
      crestPressureHpa: 850,
      applicableSubBasins: [
        "esme_ulubey_western_step",
        "usak_central_plateau",
        "banaz_sivasli_eastern_threshold"
      ],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 215, toDeg: 285 },
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
        windFromSectorDeg: { fromDeg: 210, toDeg: 285 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 0.10,
        maxPrecipMultiplierCap: 1.32
      }
    },
    {
      id: "murat_dagi_bulkaz_alpine_barrier",
      labelTr: "Murat Dağı (2309m) – Bulkaz Dağı Kuzeydoğu/Güneydoğu Kar Duvarı",
      effectiveBarrierHeightM: 2309,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "murat_dagi_bulkaz_alpine",
        "banaz_sivasli_eastern_threshold",
        "usak_central_plateau"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 135, toDeg: 185 },
        minCrossCrestSpeedMs: 8.0,
        minFroudeNumber: 0.90,
        sourcePlateauElevationM: 1100,
        maxTargetElevationM: 940,
        maxWarmingCapC: 2.4,
        subCloudVirgaFactor: 0.25,
        wetCutoffMmHr: 0.5
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 195, toDeg: 275 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 0.14,
        maxPrecipMultiplierCap: 1.44
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 20, toDeg: 75 },
        precipAttenuationFactor: 0.76
      }
    }
  ],
  venturiCorridors: [
    {
      id: "banaz_dumlupinar_continental_gate",
      labelTr: "Banaz – Mezitler/Dumlupınar Batı Ağzı Karasal Poyraz/Ayaz Koridoru",
      centerCoord: { lat: 38.775, lon: 29.855 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 65,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.28,
      gustMultiplier: 1.38,
      suppressesNocturnalInversion: false
    },
    {
      id: "gure_gediz_ascent_channel",
      labelTr: "Güre – Eşme Gediz Tırmanma Kanalı",
      centerCoord: { lat: 38.585, lon: 29.105 },
      influenceRadiusKm: 18,
      channelAxisFromDeg: 255,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.20,
      gustMultiplier: 1.30,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 880,
    coldPoolMaxDepthM: 280,
    topographicEnclosureIndex: 0.58,
    deltaPressureTopHpa: 32,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 4.6
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.34
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 15, toDeg: 95 },
      minWindShearVs850Deg: 65
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.48,
    invertedVDryMicroburstSusceptibility: 0.62,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "target_usak_merkez",
      labelTr: "Uşak Merkez (919m İç Batı Anadolu Eşiği)",
      lat: 38.6712,
      lon: 29.404,
      elevationM: 919,
      role: "target"
    },
    {
      key: "corridor_esme_gediz_west",
      labelTr: "Eşme Batı Cephe Girişi (809m)",
      lat: 38.3961,
      lon: 28.9906,
      elevationM: 809,
      role: "corridor"
    },
    {
      key: "corridor_ulubey_canyon",
      labelTr: "Ulubey Kanyon Platosu (730m)",
      lat: 38.4169,
      lon: 29.2786,
      elevationM: 730,
      role: "corridor"
    },
    {
      key: "corridor_banaz_east_gate",
      labelTr: "Banaz Doğu Karasal Geçidi (987m)",
      lat: 38.7525,
      lon: 29.7436,
      elevationM: 987,
      role: "corridor"
    },
    {
      key: "orographic_murat_dagi_summit",
      labelTr: "Murat Dağı Güney Zirve Kuşağı (2050–2309m)",
      lat: 38.91,
      lon: 29.615,
      elevationM: 2050,
      role: "orographic_wall"
    },
    {
      key: "orographic_bulkaz_sivasli",
      labelTr: "Sivaslı Bulkaz Dağı Batı Sırtı (1680m)",
      lat: 38.49,
      lon: 29.78,
      elevationM: 1680,
      role: "orographic_wall"
    },
    {
      key: "foehn_sivasli_south",
      labelTr: "Sivaslı Güney Yamaç (990m)",
      lat: 38.4986,
      lon: 29.6953,
      elevationM: 990,
      role: "foehn_windward"
    },
    {
      key: "foehn_karahalli_se",
      labelTr: "Karahallı Güney Eşik (905m)",
      lat: 38.3242,
      lon: 29.5425,
      elevationM: 905,
      role: "foehn_windward"
    },
    {
      key: "lee_usak_airport_ltbo",
      labelTr: "Uşak Havalimanı Ovası (LTBO 881m)",
      lat: 38.6814,
      lon: 29.4717,
      elevationM: 881,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -25.0,
    maxPlausibleTempC: 42.5,
    minPlausibleMslpHpa: 982,
    maxPlausibleMslpHpa: 1045,
    kalmanTempBiasCapC: 6.5
  }
};

export const PROVINCE_SPEC_TR_64: ProvinceSpec = Object.freeze(RAW_PROVINCE_SPEC_TR_64);

function angularDifferenceDeg(a: number, b: number): number {
  const diff = Math.abs((((a - b) % 360) + 540) % 360 - 180);
  return diff;
}

export function evaluateUsakThresholdSnowTransition(params: {
  izmirCoastalTempC: number;
  temp850C: number;
  surfaceWindFromDeg: number;
  wind850FromDeg: number;
  precipRateMmHr: number;
  targetElevationM?: number;
}): {
  izmirPhase: "rain";
  usakTempC: number;
  usakWetBulbC: number;
  coldWedgeActive: boolean;
  usakPhase: "rain" | "sleet" | "snow";
} {
  const targetElevM =
    params.targetElevationM ?? PROVINCE_SPEC_TR_64.primaryCenter.demVerifiedElevationM;
  const wedgeRule = PROVINCE_SPEC_TR_64.inversionAndWedgeSpec.shallowColdWedgeRule;

  const surfDeg = ((params.surfaceWindFromDeg % 360) + 360) % 360;
  const inColdSector =
    wedgeRule !== undefined &&
    surfDeg >= wedgeRule.surfaceColdSectorDeg.fromDeg &&
    surfDeg <= wedgeRule.surfaceColdSectorDeg.toDeg;
  const shearDeg = angularDifferenceDeg(params.surfaceWindFromDeg, params.wind850FromDeg);
  const coldWedgeActive =
    wedgeRule !== undefined && inColdSector && shearDeg >= wedgeRule.minWindShearVs850Deg;

  const tempFrom850C = params.temp850C + ((1480 - targetElevM) / 1000) * 5.8;
  const coldWedgeUndercutC = coldWedgeActive ? 2.8 : 0.6;
  const evaporativeCoolingC = Math.min(2.0, Math.max(0, params.precipRateMmHr) * 0.35);

  const usakTempC = tempFrom850C - coldWedgeUndercutC;
  const usakWetBulbC = usakTempC - evaporativeCoolingC;

  let usakPhase: "rain" | "sleet" | "snow" = "rain";
  if (usakWetBulbC <= 0.6) {
    usakPhase = "snow";
  } else if (usakWetBulbC <= 1.6) {
    usakPhase = "sleet";
  }

  return {
    izmirPhase: "rain",
    usakTempC,
    usakWetBulbC,
    coldWedgeActive,
    usakPhase
  };
}

export default PROVINCE_SPEC_TR_64;
