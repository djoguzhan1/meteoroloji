import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_02 = TR81_CLIMATOLOGY_1991_2020["TR-02"];
const HYPSO_TR_02 = TR81_HYPSOMETRIC_PROFILES["TR-02"];

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
 * ATMOS v5.0 — Wave 3C (REG-21) Bespoke Physical Regime Contract: `TR-02` Adıyaman
 *
 * Captures the sharp hydro-thermodynamic contrast between:
 *  1. Atatürk Baraj Gölü (~817 km², 540 m `fresh_lake`): moderates nocturnal radiation frost
 *     across Samsat–Kahta–Adıyaman terraces and moistens pre-frontal S/SW boundary layers,
 *     strictly WITHOUT open-sea DEK instability (`useOpenMeteoMarineApi: false`, `dekWatchDeltaTC: 18.0`).
 *  2. Southeastern Taurus Escarpment — Nemrut Dağı (2,150 m / MGM 19258 DEM 2,134 m), Akdağ (2,551 m),
 *     Çelikhan (~1,380 m) & Sincik (~1,368 m): orthogonal S/SW (160°–235°) Mediterranean cyclonic
 *     warm-conveyor upslope lifting (`maxPrecipMultiplierCap: 1.76`), making northern Adıyaman one of
 *     Southeastern Anatolia's wettest winter/spring orographic belts (~700–1,000+ mm/yr on slopes).
 *  3. Summer Basra Thermal Low Lowland Surge (`+44°C` Samsat / Kahta / LTCP peaks) & N/NE Malatya
 *     downslope Foehn drying across the Taurus crest.
 */
export const TR_02_ATATURK_RESERVOIR_NEMRUT_CONTRACT = deepFreeze({
  reservoirSurfaceElevationM: 540,
  reservoirEffectiveFetchKm: 34,
  celikhanHighlandTownElevationM: 1380,
  nemrutSummitElevationM: 2150,
  akdagMaxPhysicalPeakM: 2551,
  summerBasraDesignPeakC: 44.5,
  southerlyTaurusUpslopeSectorDeg: { fromDeg: 160, toDeg: 235 },
  maxTaurusUpslopePrecipMultiplier: 1.76,
  allowedMetarIcaos: ["LTCP"] as const,
  blockedNeighborMetarIcaos: ["LTCS", "LTAJ", "LTAT", "LTCN", "LTCC"] as const
});

const SPEC_TR_02: ProvinceSpec = {
  provinceCode: "TR-02",
  plateCode: 2,
  slug: "adiyaman",
  nameTr: "Adıyaman",
  region: "SOUTHEASTERN_ANATOLIA",
  climateRegion: "GUNEYDOGU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "SOUTHEAST_THRESHOLD_ARID",
  icaoWhitelist: ["LTCP"],
  domainBounds: {
    minLat: 37.4102,
    maxLat: 38.21,
    minLon: 37.436,
    maxLon: 39.2632
  },
  primaryCenter: {
    mgmMerkezId: 90201,
    mgmIstNo: 17265,
    mgmSaatlikIstNo: 17265,
    mgmGunlukIstNo: 90201,
    wmoId: "17265",
    lat: 37.7553,
    lon: 38.2775,
    demVerifiedElevationM: 672,
    subBasinId: "adiyaman_kahta_piedmont",
    urbanFraction: 0.68,
    monthlyTmaxNormalsC: CLIM_TR_02.tmaxC,
    monthlyTminNormalsC: CLIM_TR_02.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-02-samsat-ataturk-baraji",
      name: "Samsat / Atatürk Baraj Gölü Kıyısı",
      role: "plain",
      lat: 37.5825,
      lon: 38.4806,
      elevationM: 590
    },
    {
      id: "tr-02-adiyaman-merkez",
      name: "Adıyaman Merkez (WMO 17265)",
      role: "plain",
      lat: 37.7553,
      lon: 38.2775,
      elevationM: 672
    },
    {
      id: "tr-02-golbasi-besni-esik",
      name: "Gölbaşı – Besni Batı Geçit Kuşağı",
      role: "foothill",
      lat: 37.7867,
      lon: 37.6532,
      elevationM: 900
    },
    {
      id: "tr-02-celikhan-sincik-yamac",
      name: "Çelikhan – Sincik Güneydoğu Toros Yamacı",
      role: "foothill",
      lat: 38.0294,
      lon: 38.2272,
      elevationM: 1380
    },
    {
      id: "tr-02-nemrut-dagi-zirve",
      name: "Nemrut Dağı Zirve (2150 m Kütlesi)",
      role: "summit",
      lat: 37.9808,
      lon: 38.7408,
      elevationM: 2134
    }
  ],
  subBasins: [
    {
      id: "ataturk_reservoir_samsat_terrace",
      labelTr: "Atatürk Baraj Gölü Kıyısı – Samsat – Sitilce Alt Fırat Terası",
      polygonOrBbox: {
        minLat: 37.4102,
        maxLat: 37.7,
        minLon: 38.1,
        maxLon: 38.92
      },
      elevationRangeM: [400, 620],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.2
    },
    {
      id: "adiyaman_kahta_piedmont",
      labelTr: "Adıyaman Merkez – Kahta – LTCP Orta Etek Platosu",
      polygonOrBbox: {
        minLat: 37.66,
        maxLat: 37.9,
        minLon: 38.08,
        maxLon: 38.86
      },
      elevationRangeM: [600, 880],
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.64
    },
    {
      id: "golbasi_besni_west_corridor",
      labelTr: "Gölbaşı – Besni – Tut Batı Geçit ve Kalker Platosu",
      polygonOrBbox: {
        minLat: 37.48,
        maxLat: 37.92,
        minLon: 37.436,
        maxLon: 38.08
      },
      elevationRangeM: [780, 1180],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.34
    },
    {
      id: "celikhan_sincik_taurus_slope",
      labelTr: "Çelikhan – Sincik – Gerger Güneydoğu Toros Dik Güney Yamacı",
      polygonOrBbox: {
        minLat: 37.88,
        maxLat: 38.21,
        minLon: 38.02,
        maxLon: 39.2632
      },
      elevationRangeM: [820, 1680],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.18
    },
    {
      id: "nemrut_akdag_alpine",
      labelTr: "Nemrut Dağı (2150 m) & Akdağ (2551 m) Alpin Kar Sırtı",
      polygonOrBbox: {
        minLat: 37.93,
        maxLat: 38.21,
        minLon: 38.16,
        maxLon: 38.95
      },
      elevationRangeM: [1680, 2551],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.02
    }
  ],
  barrierCouplingMatrix: {
    ataturk_reservoir_samsat_terrace: {
      ataturk_reservoir_samsat_terrace: 1.0,
      adiyaman_kahta_piedmont: 0.76,
      golbasi_besni_west_corridor: 0.34,
      celikhan_sincik_taurus_slope: 0.14,
      nemrut_akdag_alpine: 0.05
    },
    adiyaman_kahta_piedmont: {
      ataturk_reservoir_samsat_terrace: 0.74,
      adiyaman_kahta_piedmont: 1.0,
      golbasi_besni_west_corridor: 0.52,
      celikhan_sincik_taurus_slope: 0.28,
      nemrut_akdag_alpine: 0.1
    },
    golbasi_besni_west_corridor: {
      ataturk_reservoir_samsat_terrace: 0.32,
      adiyaman_kahta_piedmont: 0.52,
      golbasi_besni_west_corridor: 1.0,
      celikhan_sincik_taurus_slope: 0.36,
      nemrut_akdag_alpine: 0.14
    },
    celikhan_sincik_taurus_slope: {
      ataturk_reservoir_samsat_terrace: 0.12,
      adiyaman_kahta_piedmont: 0.26,
      golbasi_besni_west_corridor: 0.34,
      celikhan_sincik_taurus_slope: 1.0,
      nemrut_akdag_alpine: 0.58
    },
    nemrut_akdag_alpine: {
      ataturk_reservoir_samsat_terrace: 0.04,
      adiyaman_kahta_piedmont: 0.08,
      golbasi_besni_west_corridor: 0.12,
      celikhan_sincik_taurus_slope: 0.56,
      nemrut_akdag_alpine: 1.0
    }
  },
  stationOverrides: {
    "17265": {
      stationId: 17265,
      nameTr: "Adıyaman Merkez (WMO 17265)",
      lat: 37.7553,
      lon: 38.2775,
      demElevationM: 672,
      subBasinId: "adiyaman_kahta_piedmont",
      urbanFraction: 0.68,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "basin_floor"
    },
    "17266": {
      stationId: 17266,
      nameTr: "Adıyaman Havalimanı (MGM 17266 / LTCP)",
      lat: 37.7314,
      lon: 38.4689,
      demElevationM: 675,
      subBasinId: "adiyaman_kahta_piedmont",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "basin_floor"
    },
    LTCP: {
      stationId: "LTCP",
      nameTr: "Adıyaman Havalimanı (LTCP)",
      lat: 37.7314,
      lon: 38.4689,
      demElevationM: 675,
      subBasinId: "adiyaman_kahta_piedmont",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "basin_floor"
    },
    "18345": {
      stationId: 18345,
      nameTr: "Adıyaman Samsat (Atatürk Baraj Gölü Kıyısı)",
      lat: 37.5825,
      lon: 38.4806,
      demElevationM: 590,
      subBasinId: "ataturk_reservoir_samsat_terrace",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.24,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17910": {
      stationId: 17910,
      nameTr: "Adıyaman Kahta",
      lat: 37.7918,
      lon: 38.6155,
      demElevationM: 725,
      subBasinId: "adiyaman_kahta_piedmont",
      urbanFraction: 0.48,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "basin_floor"
    },
    "17871": {
      stationId: 17871,
      nameTr: "Adıyaman Gölbaşı (Batı Oluk Eşiği)",
      lat: 37.7867,
      lon: 37.6532,
      demElevationM: 900,
      subBasinId: "golbasi_besni_west_corridor",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18181": {
      stationId: 18181,
      nameTr: "Adıyaman Besni",
      lat: 37.6853,
      lon: 37.825,
      demElevationM: 1078,
      subBasinId: "golbasi_besni_west_corridor",
      urbanFraction: 0.4,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18347": {
      stationId: 18347,
      nameTr: "Adıyaman Tut (Toros Güney Eteği)",
      lat: 37.7975,
      lon: 37.9317,
      demElevationM: 1086,
      subBasinId: "golbasi_besni_west_corridor",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.32,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18182": {
      stationId: 18182,
      nameTr: "Adıyaman Gerger (Fırat Kanyon Yamacı)",
      lat: 38.0328,
      lon: 39.0408,
      demElevationM: 821,
      subBasinId: "celikhan_sincik_taurus_slope",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18180": {
      stationId: 18180,
      nameTr: "Adıyaman Çelikhan (1380 m Güneydoğu Toros Orografik Cep)",
      lat: 38.0294,
      lon: 38.2272,
      demElevationM: 1380,
      subBasinId: "celikhan_sincik_taurus_slope",
      urbanFraction: 0.25,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18346": {
      stationId: 18346,
      nameTr: "Adıyaman Sincik (1368 m Toros Güney Yamacı)",
      lat: 38.0329,
      lon: 38.6252,
      demElevationM: 1368,
      subBasinId: "celikhan_sincik_taurus_slope",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "19258": {
      stationId: 19258,
      nameTr: "Adıyaman Nemrut Dağı Zirve (DEM Onarımlı 2134 m)",
      lat: 37.9808,
      lon: 38.7408,
      demElevationM: 2134,
      subBasinId: "nemrut_akdag_alpine",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.16,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [410, 720, 1380, 2150],
    maxPhysicalPeakM: HYPSO_TR_02.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_02.bands
  },
  waterBodies: [
    {
      id: "ataturk_dam_reservoir",
      labelTr: "Atatürk Baraj Gölü (540 m Geniş Tatlı Su Rezervuarı — Nem & Don Tamponu)",
      kind: "fresh_lake",
      mgmMarineStationIds: [],
      sampleCoord: { lat: 37.54, lon: 38.52 },
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 540,
      freezingPointC: 0.0,
      monthlyWaterTempNormalsC: [
        8.4, 8.2, 10.4, 14.2, 19.1, 24.0,
        27.6, 28.4, 25.6, 20.8, 15.1, 10.6
      ],
      subBasinInfluenceWeights: {
        ataturk_reservoir_samsat_terrace: 0.82,
        adiyaman_kahta_piedmont: 0.38,
        golbasi_besni_west_corridor: 0.08,
        celikhan_sincik_taurus_slope: 0.04,
        nemrut_akdag_alpine: 0.0
      },
      onshoreWindSectorDeg: { fromDeg: 130, toDeg: 225 },
      effectiveFetchKm: 20,
      convectiveInstabilityUpperHpa: 700,
      dekWatchDeltaTC: 18.0,
      dekHeavyDeltaTC: 23.5,
      seaBreezeSpec: {
        activeMonths: [5, 10],
        sectorDeg: { fromDeg: 135, toDeg: 225 },
        maxInlandPenetrationKm: 18,
        maxCoolingAmplitudeC: 2.1
      }
    }
  ],
  directionalBarriers: [
    {
      id: "se_taurus_nemrut_celikhan_escarpment",
      labelTr: "Güneydoğu Toroslar — Nemrut (2150 m) & Çelikhan–Sincik Dik Güney Yamaç Yağış Duvarı",
      effectiveBarrierHeightM: 2150,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "celikhan_sincik_taurus_slope",
        "nemrut_akdag_alpine"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 345, toDeg: 45 },
        minCrossCrestSpeedMs: 8.5,
        minFroudeNumber: 0.45,
        sourcePlateauElevationM: 1450,
        maxTargetElevationM: 1390,
        maxWarmingCapC: 2.8,
        subCloudVirgaFactor: 0.48,
        wetCutoffMmHr: 0.4
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 160, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.32,
        maxPrecipMultiplierCap: 1.76
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 350, toDeg: 45 },
        precipAttenuationFactor: 0.56
      }
    },
    {
      id: "adiyaman_kahta_piedmont_taurus_foehn_and_upslope",
      labelTr: "Adıyaman – Kahta – Besni Etek Kuşağı — Güneyli Konverjans & Kuzeyli Malatya Fönü",
      effectiveBarrierHeightM: 1950,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "adiyaman_kahta_piedmont",
        "ataturk_reservoir_samsat_terrace",
        "golbasi_besni_west_corridor"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 345, toDeg: 45 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.44,
        sourcePlateauElevationM: 1380,
        maxTargetElevationM: 920,
        maxWarmingCapC: 4.4,
        subCloudVirgaFactor: 0.62,
        wetCutoffMmHr: 0.3
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 160, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.22,
        maxPrecipMultiplierCap: 1.54
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 350, toDeg: 40 },
        precipAttenuationFactor: 0.52
      }
    }
  ],
  venturiCorridors: [
    {
      id: "golbasi_erkenek_rift_chute",
      labelTr: "Gölbaşı – Erkenek (900 m) GB–KD Tektonik Oluk Koridoru",
      centerCoord: { lat: 37.7867, lon: 37.6532 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 225,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.28,
      gustMultiplier: 1.4,
      suppressesNocturnalInversion: true
    },
    {
      id: "kahta_gerger_euphrates_gorge_jet",
      labelTr: "Kahta – Gerger Fırat Kanyonu Vadi Boğazı",
      centerCoord: { lat: 37.92, lon: 38.84 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 35,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.22,
      gustMultiplier: 1.34,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 540,
    coldPoolMaxDepthM: 260,
    topographicEnclosureIndex: 0.52,
    deltaPressureTopHpa: 925,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 4.4
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.74
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 10, toDeg: 75 },
      minWindShearVs850Deg: 60
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.78,
    invertedVDryMicroburstSusceptibility: 0.72,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TGT_ADIYAMAN_17265",
      labelTr: "Adıyaman Merkez (WMO 17265 · 672 m)",
      lat: 37.7553,
      lon: 38.2775,
      elevationM: 672,
      role: "target"
    },
    {
      key: "LAKE_ATATURK_RESERVOIR",
      labelTr: "Atatürk Baraj Gölü Açık Su Yüzeyi (540 m)",
      lat: 37.54,
      lon: 38.52,
      elevationM: 540,
      role: "marine_upwind"
    },
    {
      key: "UPW_SAMSAT_TERRACE",
      labelTr: "Samsat Güney Baraj Kıyısı (590 m)",
      lat: 37.5825,
      lon: 38.4806,
      elevationM: 590,
      role: "marine_upwind"
    },
    {
      key: "COR_GOLBASI_RIFT",
      labelTr: "Gölbaşı Batı Geçit Oluğu (900 m)",
      lat: 37.7867,
      lon: 37.6532,
      elevationM: 900,
      role: "corridor"
    },
    {
      key: "FOE_BESNI_PLATEAU",
      labelTr: "Besni Güneybatı Kalker Platosu (1078 m)",
      lat: 37.6853,
      lon: 37.825,
      elevationM: 1078,
      role: "foehn_windward"
    },
    {
      key: "ORO_CELIKHAN_WALL",
      labelTr: "Çelikhan Güneydoğu Toros Yağış Cebi (1380 m)",
      lat: 38.0294,
      lon: 38.2272,
      elevationM: 1380,
      role: "orographic_wall"
    },
    {
      key: "ORO_SINCIK_SLOPE",
      labelTr: "Sincik Dik Güney Toros Yamacı (1368 m)",
      lat: 38.0329,
      lon: 38.6252,
      elevationM: 1368,
      role: "orographic_wall"
    },
    {
      key: "ORO_NEMRUT_SUMMIT",
      labelTr: "Nemrut Dağı Zirve Sırtı (2134 m)",
      lat: 37.9808,
      lon: 38.7408,
      elevationM: 2134,
      role: "orographic_wall"
    },
    {
      key: "LEE_KAHTA_LTCP_PLAIN",
      labelTr: "Kahta – LTCP Doğu Etek Düzlüğü (675 m)",
      lat: 37.7314,
      lon: 38.4689,
      elevationM: 675,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -24,
    maxPlausibleTempC: 46,
    minPlausibleMslpHpa: 980,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 5.4
  }
};

export const PROVINCE_SPEC_TR_02: ProvinceSpec = deepFreeze(SPEC_TR_02);
export default PROVINCE_SPEC_TR_02;
