import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_27 = TR81_CLIMATOLOGY_1991_2020["TR-27"];
const HYPSO_TR_27 = TR81_HYPSOMETRIC_PROFILES["TR-27"];

function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === "object" && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      deepFreeze((obj as Record<string, unknown>)[key]);
    }
  }
  return obj;
}

/**
 * ATMOS v5.0 — Wave 3C (REG-21) Bespoke Physical Regime Contract: `TR-27` Gaziantep
 *
 * Captures Gaziantep's classic three-zone topographic structure and surprise heavy-snow physics:
 *  1. Elevated Gaziantep Plateau (~840–930 m: Şahinbey 854 m, Şehitkamil 927 m) & Sof Dağı (1,496 m):
 *     Standing 350–470 m above Şanlıurfa (550 m / Harran 375 m), Karkamış (375 m), and Kilis (640 m),
 *     Gaziantep acts as Southeastern Anatolia's classic heavy wet-snow battleground whenever moist
 *     Eastern Mediterranean / Cyprus lows (170°–235° aloft) overrun shallow NE/ENE continental cold
 *     wedges (`shallowColdWedgeRule`: 15°–85° surface shear >= 55° vs 850 hPa).
 *  2. Western İslahiye (470 m) – Nurdağı (491 m) Amanos / Dead Sea Rift Corridor:
 *     Channeled SW Mediterranean moisture inflow (`maxPrecipMultiplierCap: 1.62`) & Gavurdağı/Ayran
 *     gap-wind acceleration (`speedMultiplier: 1.34`, `gustMultiplier: 1.46`).
 *  3. Eastern Karkamış (375 m) – Nizip (477 m) Low Euphrates Pistachio Valley:
 *     330–550 m lower and +2.5..+3.5°C warmer than Şehitkamil/Sof Dağı, decoupled (`<= 0.22`) from
 *     central plateau snowstorms and exposed to Syrian steppe heat/dust plumes.
 */
export const TR_27_GAZIANTEP_PLATEAU_SNOW_CONTRACT = deepFreeze({
  plateauElevationRangeM: [840, 930] as const,
  sofdagiPeakM: 1496,
  elevationAdvantageOverUrfaKilisM: [210, 475] as const,
  karkamisNizipValleyRangeM: [375, 520] as const,
  oguzeliAirportDemM: 701,
  surpriseSnowOverrunningSectorDeg: { fromDeg: 170, toDeg: 235 },
  continentalColdWedgeSectorDeg: { fromDeg: 15, toDeg: 85 },
  allowedMetarIcaos: ["LTAJ"] as const,
  blockedNeighborAndForeignMetarIcaos: ["LTCN", "LTDA", "LTCS", "LTCP", "OSAP"] as const
});

const SPEC_TR_27: ProvinceSpec = {
  provinceCode: "TR-27",
  plateCode: 27,
  slug: "gaziantep",
  nameTr: "Gaziantep",
  region: "SOUTHEASTERN_ANATOLIA",
  climateRegion: "GUNEYDOGU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "SOUTHEAST_THRESHOLD_ARID",
  icaoWhitelist: ["LTAJ"],
  domainBounds: {
    minLat: 36.7058,
    maxLat: 37.527,
    minLon: 36.4428,
    maxLon: 38.081
  },
  primaryCenter: {
    mgmMerkezId: 92701,
    mgmIstNo: 17261,
    mgmSaatlikIstNo: 17261,
    mgmGunlukIstNo: 92701,
    wmoId: "17260",
    lat: 37.0585,
    lon: 37.351,
    demVerifiedElevationM: 850,
    subBasinId: "gaziantep_central_plateau",
    urbanFraction: 0.82,
    monthlyTmaxNormalsC: CLIM_TR_27.tmaxC,
    monthlyTminNormalsC: CLIM_TR_27.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-27-karkamis-nizip-firat",
      name: "Karkamış – Nizip Fırat Alt Vadisi",
      role: "plain",
      lat: 36.8356,
      lon: 38.0008,
      elevationM: 375
    },
    {
      id: "tr-27-islahiye-nurdagi-oluk",
      name: "İslahiye – Nurdağı Batı Amanos Koridoru",
      role: "plain",
      lat: 36.9585,
      lon: 36.5882,
      elevationM: 470
    },
    {
      id: "tr-27-gaziantep-merkez-plato",
      name: "Gaziantep Merkez Plato (Şahinbey / Şehitkamil)",
      role: "foothill",
      lat: 37.0585,
      lon: 37.351,
      elevationM: 854
    },
    {
      id: "tr-27-sehitkamil-yuksek",
      name: "Şehitkamil / İbrahimli Kuzey Sırtı",
      role: "foothill",
      lat: 37.1701,
      lon: 37.2877,
      elevationM: 927
    },
    {
      id: "tr-27-sofdagi-zirve",
      name: "Sof Dağı (Dülük / Hızır Yaylası · 1496 m Kütlesi)",
      role: "summit",
      lat: 37.162,
      lon: 37.128,
      elevationM: 1420
    }
  ],
  subBasins: [
    {
      id: "gaziantep_central_plateau",
      labelTr: "Gaziantep Merkez Platosu (Şahinbey – Şehitkamil – Oğuzeli LTAJ 700–960 m)",
      polygonOrBbox: {
        minLat: 36.88,
        maxLat: 37.24,
        minLon: 37.18,
        maxLon: 37.62
      },
      elevationRangeM: [680, 1020],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.78
    },
    {
      id: "sofdagi_duluk_snow_ridge",
      labelTr: "Sof Dağı (1496 m) – Dülükbaba – İslahiye Doğu Sırtı Kar Kuşağı",
      polygonOrBbox: {
        minLat: 37.06,
        maxLat: 37.32,
        minLon: 36.88,
        maxLon: 37.24
      },
      elevationRangeM: [1020, 1496],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.08
    },
    {
      id: "islahiye_nurdagi_amanos_rift",
      labelTr: "İslahiye – Nurdağı Karasu/Aksu Graben ve Doğu Amanos Eteği",
      polygonOrBbox: {
        minLat: 36.78,
        maxLat: 37.28,
        minLon: 36.4428,
        maxLon: 36.92
      },
      elevationRangeM: [440, 1120],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.36
    },
    {
      id: "karkamis_nizip_euphrates_valley",
      labelTr: "Karkamış – Nizip Fırat Alçak Sıcak Vadi Tabanı (375–520 m)",
      polygonOrBbox: {
        minLat: 36.7058,
        maxLat: 37.16,
        minLon: 37.62,
        maxLon: 38.081
      },
      elevationRangeM: [340, 540],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.38
    },
    {
      id: "araban_yavuzeli_plain",
      labelTr: "Araban – Yavuzeli Kuzeydoğu Karasu–Fırat Eşik Ovası",
      polygonOrBbox: {
        minLat: 37.22,
        maxLat: 37.527,
        minLon: 37.42,
        maxLon: 37.98
      },
      elevationRangeM: [480, 680],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.28
    }
  ],
  barrierCouplingMatrix: {
    gaziantep_central_plateau: {
      gaziantep_central_plateau: 1.0,
      sofdagi_duluk_snow_ridge: 0.62,
      islahiye_nurdagi_amanos_rift: 0.24,
      karkamis_nizip_euphrates_valley: 0.22,
      araban_yavuzeli_plain: 0.42
    },
    sofdagi_duluk_snow_ridge: {
      gaziantep_central_plateau: 0.58,
      sofdagi_duluk_snow_ridge: 1.0,
      islahiye_nurdagi_amanos_rift: 0.34,
      karkamis_nizip_euphrates_valley: 0.08,
      araban_yavuzeli_plain: 0.28
    },
    islahiye_nurdagi_amanos_rift: {
      gaziantep_central_plateau: 0.22,
      sofdagi_duluk_snow_ridge: 0.32,
      islahiye_nurdagi_amanos_rift: 1.0,
      karkamis_nizip_euphrates_valley: 0.06,
      araban_yavuzeli_plain: 0.16
    },
    karkamis_nizip_euphrates_valley: {
      gaziantep_central_plateau: 0.2,
      sofdagi_duluk_snow_ridge: 0.08,
      islahiye_nurdagi_amanos_rift: 0.05,
      karkamis_nizip_euphrates_valley: 1.0,
      araban_yavuzeli_plain: 0.54
    },
    araban_yavuzeli_plain: {
      gaziantep_central_plateau: 0.4,
      sofdagi_duluk_snow_ridge: 0.26,
      islahiye_nurdagi_amanos_rift: 0.14,
      karkamis_nizip_euphrates_valley: 0.54,
      araban_yavuzeli_plain: 1.0
    }
  },
  stationOverrides: {
    "17260": {
      stationId: 17260,
      nameTr: "Gaziantep Oğuzeli Havalimanı (WMO 17260 / LTAJ)",
      lat: 36.9472,
      lon: 37.4789,
      demElevationM: 701,
      subBasinId: "gaziantep_central_plateau",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.74,
      verticalStratumRole: "basin_floor"
    },
    LTAJ: {
      stationId: "LTAJ",
      nameTr: "Gaziantep Havalimanı (LTAJ · Oğuzeli Çanağı 701 m)",
      lat: 36.9472,
      lon: 37.4789,
      demElevationM: 701,
      subBasinId: "gaziantep_central_plateau",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.74,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17261": {
      stationId: 17261,
      nameTr: "Gaziantep Bölge / Şahinbey Merkez (854 m)",
      lat: 37.0585,
      lon: 37.351,
      demElevationM: 854,
      subBasinId: "gaziantep_central_plateau",
      urbanFraction: 0.84,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "mid_slope"
    },
    "18271": {
      stationId: 18271,
      nameTr: "Gaziantep Şahinbey",
      lat: 37.0585,
      lon: 37.351,
      demElevationM: 854,
      subBasinId: "gaziantep_central_plateau",
      urbanFraction: 0.84,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "mid_slope"
    },
    "18272": {
      stationId: 18272,
      nameTr: "Gaziantep Şehitkamil (927 m Kuzey Yüksek Plato)",
      lat: 37.1701,
      lon: 37.2877,
      demElevationM: 927,
      subBasinId: "gaziantep_central_plateau",
      urbanFraction: 0.76,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "mid_slope"
    },
    "17965": {
      stationId: 17965,
      nameTr: "Gaziantep İslahiye (Amanos Doğu Graben Tabanı)",
      lat: 36.9585,
      lon: 36.5882,
      demElevationM: 470,
      subBasinId: "islahiye_nurdagi_amanos_rift",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18151": {
      stationId: 18151,
      nameTr: "Gaziantep Nurdağı (Bahçe – Gavurdağı Geçit Çıkışı)",
      lat: 37.1708,
      lon: 36.7533,
      demElevationM: 491,
      subBasinId: "islahiye_nurdagi_amanos_rift",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.32,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18150": {
      stationId: 18150,
      nameTr: "Gaziantep Karkamış (375 m Fırat Sınır Tabanı)",
      lat: 36.8356,
      lon: 38.0008,
      demElevationM: 375,
      subBasinId: "karkamis_nizip_euphrates_valley",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18153": {
      stationId: 18153,
      nameTr: "Gaziantep Nizip (477 m Fırat Fıstık Terası)",
      lat: 37.0122,
      lon: 37.8628,
      demElevationM: 477,
      subBasinId: "karkamis_nizip_euphrates_valley",
      urbanFraction: 0.56,
      coldPoolSusceptibility: 0.4,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18273": {
      stationId: 18273,
      nameTr: "Gaziantep Yavuzeli",
      lat: 37.2917,
      lon: 37.5792,
      demElevationM: 530,
      subBasinId: "araban_yavuzeli_plain",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18152": {
      stationId: 18152,
      nameTr: "Gaziantep Araban Ovası",
      lat: 37.4194,
      lon: 37.6925,
      demElevationM: 518,
      subBasinId: "araban_yavuzeli_plain",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.64,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [380, 850, 1120, 1420],
    maxPhysicalPeakM: HYPSO_TR_27.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_27.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "sofdagi_gaziantep_plateau_snow_barrier",
      labelTr: "Sof Dağı (1496 m) & Gaziantep Platosu (850–930 m) — Akdeniz Alçağı Çarpışma & Yoğun Kar Bariyeri",
      effectiveBarrierHeightM: 1496,
      crestPressureHpa: 850,
      applicableSubBasins: [
        "gaziantep_central_plateau",
        "sofdagi_duluk_snow_ridge"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 275, toDeg: 325 },
        minCrossCrestSpeedMs: 8.5,
        minFroudeNumber: 0.48,
        sourcePlateauElevationM: 1120,
        maxTargetElevationM: 900,
        maxWarmingCapC: 2.6,
        subCloudVirgaFactor: 0.42,
        wetCutoffMmHr: 0.4
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.24,
        maxPrecipMultiplierCap: 1.56
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 285, toDeg: 330 },
        precipAttenuationFactor: 0.7
      }
    },
    {
      id: "amanos_east_lee_and_islahiye_rift_wall",
      labelTr: "Amanos / Gavurdağı Doğu Yamacı — İslahiye–Nurdağı GB Konverjans vs BKB Amanos Fönü",
      effectiveBarrierHeightM: 2100,
      crestPressureHpa: 750,
      applicableSubBasins: ["islahiye_nurdagi_amanos_rift"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 265, toDeg: 320 },
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.44,
        sourcePlateauElevationM: 980,
        maxTargetElevationM: 620,
        maxWarmingCapC: 4.2,
        subCloudVirgaFactor: 0.58,
        wetCutoffMmHr: 0.3
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 185, toDeg: 245 },
        minOnshoreOrUpslopeSpeedMs: 4.8,
        coastalFrictionalConvergenceBoost: 1.26,
        maxPrecipMultiplierCap: 1.62
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 270, toDeg: 320 },
        precipAttenuationFactor: 0.58
      }
    },
    {
      id: "karkamis_nizip_lee_steppe_attenuation",
      labelTr: "Sof Dağı & Gaziantep Platosu Doğu Gölgesi — Nizip–Karkamış Fırat Vadisi Yağış Sönümlemesi",
      effectiveBarrierHeightM: 1496,
      crestPressureHpa: 850,
      applicableSubBasins: [
        "karkamis_nizip_euphrates_valley",
        "araban_yavuzeli_plain"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 255, toDeg: 315 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.44,
        sourcePlateauElevationM: 880,
        maxTargetElevationM: 560,
        maxWarmingCapC: 3.4,
        subCloudVirgaFactor: 0.65,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 150, toDeg: 205 },
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 1.08,
        maxPrecipMultiplierCap: 1.22
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 255, toDeg: 315 },
        precipAttenuationFactor: 0.62
      }
    }
  ],
  venturiCorridors: [
    {
      id: "nurdagi_islahiye_rift_jet",
      labelTr: "İslahiye – Nurdağı Karasu–Aksu Graben Oluk Akışı",
      centerCoord: { lat: 37.065, lon: 36.67 },
      influenceRadiusKm: 26,
      channelAxisFromDeg: 205,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.32,
      gustMultiplier: 1.44,
      suppressesNocturnalInversion: true
    },
    {
      id: "gavurdagi_ayran_pass_jet",
      labelTr: "Bahçe – Ayran – Nurdağı Geçidi B–D Boğaz Jeti",
      centerCoord: { lat: 37.1708, lon: 36.7533 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 260,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.34,
      gustMultiplier: 1.46,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 701,
    coldPoolMaxDepthM: 250,
    topographicEnclosureIndex: 0.62,
    deltaPressureTopHpa: 885,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 5.4
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.7
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 15, toDeg: 85 },
      minWindShearVs850Deg: 55
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.82,
    invertedVDryMicroburstSusceptibility: 0.74,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TGT_GAZIANTEP_PLATEAU",
      labelTr: "Gaziantep Merkez Plato (Şahinbey · 854 m)",
      lat: 37.0585,
      lon: 37.351,
      elevationM: 854,
      role: "target"
    },
    {
      key: "ORO_SOFDAGI_SUMMIT",
      labelTr: "Sof Dağı Zirve Sırtı (1420–1496 m)",
      lat: 37.162,
      lon: 37.128,
      elevationM: 1420,
      role: "orographic_wall"
    },
    {
      key: "ORO_SEHITKAMIL_NORTH",
      labelTr: "Şehitkamil Kuzey Yüksek Plato (927 m)",
      lat: 37.1701,
      lon: 37.2877,
      elevationM: 927,
      role: "orographic_wall"
    },
    {
      key: "COR_ISLAHIYE_GRABEN",
      labelTr: "İslahiye Batı Amanos Graben Oluğu (470 m)",
      lat: 36.9585,
      lon: 36.5882,
      elevationM: 470,
      role: "corridor"
    },
    {
      key: "COR_NURDAGI_PASS",
      labelTr: "Nurdağı – Gavurdağı Geçit Çıkışı (491 m)",
      lat: 37.1708,
      lon: 36.7533,
      elevationM: 491,
      role: "corridor"
    },
    {
      key: "FOE_OGUZELI_LTAJ",
      labelTr: "Oğuzeli – LTAJ Güney Plato Eşiği (701 m)",
      lat: 36.9472,
      lon: 37.4789,
      elevationM: 701,
      role: "foehn_windward"
    },
    {
      key: "LEE_NIZIP_TERRACE",
      labelTr: "Nizip Doğu Fıstık Terası (477 m)",
      lat: 37.0122,
      lon: 37.8628,
      elevationM: 477,
      role: "lee_shadow"
    },
    {
      key: "LEE_KARKAMIS_EUPHRATES",
      labelTr: "Karkamış Fırat Sınır Vadi Tabanı (375 m)",
      lat: 36.8356,
      lon: 38.0008,
      elevationM: 375,
      role: "lee_shadow"
    },
    {
      key: "LEE_ARABAN_BASIN",
      labelTr: "Araban Kuzeydoğu Çanak Ovası (518 m)",
      lat: 37.4194,
      lon: 37.6925,
      elevationM: 518,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -22,
    maxPlausibleTempC: 45,
    minPlausibleMslpHpa: 980,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 5.6
  }
};

export const PROVINCE_SPEC_TR_27: ProvinceSpec = deepFreeze(SPEC_TR_27);
export default PROVINCE_SPEC_TR_27;
