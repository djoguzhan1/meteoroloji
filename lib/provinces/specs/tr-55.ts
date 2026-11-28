import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_55 = TR81_CLIMATOLOGY_1991_2020["TR-55"];
const HYPSO_TR_55 = TR81_HYPSOMETRIC_PROFILES["TR-55"];

/**
 * Delta, Canik Foehn & Ladik Akdağ snow-basin metadata for `TR-55` Samsun (`TIER_A_WMO`, WMO `17030`):
 * Models moderate coastal orography (low Canik crest relative to Eastern Black Sea), open Black Sea
 * DEK exposure, Çarşamba (`LTFH`) alluvial delta fog/dew-point regime, winter `+20°C` southerly
 * Canik Foehn surges, and Ladik Akdağ (`~1,900 m`) inland snow accumulation.
 */
export const TR_55_DELTA_CANIK_META = Object.freeze({
  provinceCode: "TR-55",
  wmoStationId: "17030",
  carsambaAerodromeIcao: "LTFH",
  moderateCanikUpslopeCap: 1.38,
  canikSoutherlyFoehnCapC: 5.4,
  ladikAkdagSummitZoneM: 1900
});

const SPEC_TR_55_ENGINE = Object.freeze({
  provinceCode: "TR-55",
  plateCode: 55,
  slug: "samsun",
  nameTr: "Samsun",
  region: "BLACK_SEA_WEST_CENTRAL",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "WEST_MID_BLACK_SEA_DEK",
  icaoWhitelist: Object.freeze(["LTFH"]),
  domainBounds: Object.freeze({
    minLat: 40.82,
    maxLat: 41.76,
    minLon: 34.86,
    maxLon: 37.22
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 95501,
    mgmIstNo: 17030,
    mgmSaatlikIstNo: 17030,
    mgmGunlukIstNo: 95501,
    wmoId: "17030",
    lat: 41.3441,
    lon: 36.2564,
    demVerifiedElevationM: 4,
    subBasinId: "samsun_coastal_core",
    urbanFraction: 0.78,
    monthlyTmaxNormalsC: CLIM_TR_55.tmaxC,
    monthlyTminNormalsC: CLIM_TR_55.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-55-bafra-carsamba-delta",
      name: "Bafra & Çarşamba Alüvyal Deltaları (LTFH)",
      role: "coast",
      lat: 41.2631,
      lon: 36.5587,
      elevationM: 7
    }),
    Object.freeze({
      id: "tr-55-atakum-ilkadim-merkez",
      name: "Samsun Merkez (Atakum – İlkadım Kıyı)",
      role: "plain",
      lat: 41.3441,
      lon: 36.2564,
      elevationM: 25
    }),
    Object.freeze({
      id: "tr-55-kavak-havza-gecidi",
      name: "Kavak – Havza İç Karadeniz Geçidi",
      role: "foothill",
      lat: 41.0998,
      lon: 36.0551,
      elevationM: 741
    }),
    Object.freeze({
      id: "tr-55-ladik-akdag-zirve",
      name: "Ladik Akdağ Kayak Merkezi (~1900m Kar Havzası)",
      role: "summit",
      lat: 40.8753,
      lon: 35.9075,
      elevationM: 1850
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "samsun_coastal_core",
      labelTr: "Atakum – İlkadım – Canik – Yakakent Orta Karadeniz Kıyı Hattı",
      polygonOrBbox: Object.freeze({
        minLat: 41.22,
        maxLat: 41.66,
        minLon: 35.42,
        maxLon: 36.44
      }),
      elevationRangeM: Object.freeze([0, 180] as const),
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.72
    }),
    Object.freeze({
      id: "bafra_carsamba_alluvial_deltas",
      labelTr: "Bafra (Kızılırmak) & Çarşamba–Terme (Yeşilırmak) Alüvyal Sis/Delta Ovaları",
      polygonOrBbox: Object.freeze({
        minLat: 41.12,
        maxLat: 41.75,
        minLon: 35.78,
        maxLon: 37.18
      }),
      elevationRangeM: Object.freeze([0, 95] as const),
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.28
    }),
    Object.freeze({
      id: "kavak_havza_vezirkopru_inland",
      labelTr: "Kavak – Havza – Vezirköprü Canik Ardı Geçit Platosu",
      polygonOrBbox: Object.freeze({
        minLat: 40.94,
        maxLat: 41.28,
        minLon: 34.92,
        maxLon: 36.32
      }),
      elevationRangeM: Object.freeze([300, 960] as const),
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.26
    }),
    Object.freeze({
      id: "ladik_akdag_snow_basin",
      labelTr: "Ladik Havzası & Akdağ (~1900m) Yüksek İç Kar Kuşağı",
      polygonOrBbox: Object.freeze({
        minLat: 40.83,
        maxLat: 41.05,
        minLon: 35.75,
        maxLon: 36.22
      }),
      elevationRangeM: Object.freeze([880, 2062] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.08
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    samsun_coastal_core: Object.freeze({
      samsun_coastal_core: 1.0,
      bafra_carsamba_alluvial_deltas: 0.86,
      kavak_havza_vezirkopru_inland: 0.36,
      ladik_akdag_snow_basin: 0.22
    }),
    bafra_carsamba_alluvial_deltas: Object.freeze({
      samsun_coastal_core: 0.86,
      bafra_carsamba_alluvial_deltas: 1.0,
      kavak_havza_vezirkopru_inland: 0.32,
      ladik_akdag_snow_basin: 0.2
    }),
    kavak_havza_vezirkopru_inland: Object.freeze({
      samsun_coastal_core: 0.36,
      bafra_carsamba_alluvial_deltas: 0.32,
      kavak_havza_vezirkopru_inland: 1.0,
      ladik_akdag_snow_basin: 0.62
    }),
    ladik_akdag_snow_basin: Object.freeze({
      samsun_coastal_core: 0.22,
      bafra_carsamba_alluvial_deltas: 0.2,
      kavak_havza_vezirkopru_inland: 0.62,
      ladik_akdag_snow_basin: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17030": Object.freeze({
      stationId: 17030,
      nameTr: "Samsun Bölge / Atakum (WMO 17030)",
      lat: 41.3443,
      lon: 36.2558,
      demElevationM: 4,
      subBasinId: "samsun_coastal_core",
      urbanFraction: 0.78,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "coastal_or_gap"
    }),
    "19339": Object.freeze({
      stationId: 19339,
      nameTr: "İlkadım Üst Kentsel Kuşak",
      lat: 41.2701,
      lon: 36.3016,
      demElevationM: 142,
      subBasinId: "samsun_coastal_core",
      urbanFraction: 0.82,
      coldPoolSusceptibility: 0.16,
      verticalStratumRole: "coastal_or_gap"
    }),
    "17031": Object.freeze({
      stationId: 17031,
      nameTr: "Samsun Çarşamba Havalimanı (LTFH Delta Sis/Çiy)",
      lat: 41.2631,
      lon: 36.5587,
      demElevationM: 7,
      subBasinId: "bafra_carsamba_alluvial_deltas",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "coastal_or_gap"
    }),
    LTFH: Object.freeze({
      stationId: "LTFH",
      nameTr: "Çarşamba Havalimanı METAR (LTFH)",
      lat: 41.2631,
      lon: 36.5587,
      demElevationM: 7,
      subBasinId: "bafra_carsamba_alluvial_deltas",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "coastal_or_gap"
    }),
    "18133": Object.freeze({
      stationId: 18133,
      nameTr: "Bafra Delta Ovası (TAGEM)",
      lat: 41.6016,
      lon: 35.919,
      demElevationM: 15,
      subBasinId: "bafra_carsamba_alluvial_deltas",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "coastal_or_gap"
    }),
    "19340": Object.freeze({
      stationId: 19340,
      nameTr: "Terme Doğu Delta Kıyısı",
      lat: 41.2041,
      lon: 36.9999,
      demElevationM: 8,
      subBasinId: "bafra_carsamba_alluvial_deltas",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "coastal_or_gap"
    }),
    "18540": Object.freeze({
      stationId: 18540,
      nameTr: "Kavak (Canik Geçidi 741m)",
      lat: 41.0998,
      lon: 36.0551,
      demElevationM: 741,
      subBasinId: "kavak_havza_vezirkopru_inland",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18539": Object.freeze({
      stationId: 18539,
      nameTr: "Havza İç Plato",
      lat: 40.9908,
      lon: 35.7089,
      demElevationM: 675,
      subBasinId: "kavak_havza_vezirkopru_inland",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.6,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "18134": Object.freeze({
      stationId: 18134,
      nameTr: "Vezirköprü Kızılırmak İç Havza",
      lat: 41.1367,
      lon: 35.4686,
      demElevationM: 343,
      subBasinId: "kavak_havza_vezirkopru_inland",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18507": Object.freeze({
      stationId: 18507,
      nameTr: "Atakum / Samsun Radar Sahası (Kocadağ 1309m)",
      lat: 41.3148,
      lon: 36.0374,
      demElevationM: 1309,
      subBasinId: "ladik_akdag_snow_basin",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.16,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }),
    "18135": Object.freeze({
      stationId: 18135,
      nameTr: "Ladik (Yüksek Soğuk Göl Havzası 900m)",
      lat: 40.9102,
      lon: 35.9108,
      demElevationM: 900,
      subBasinId: "ladik_akdag_snow_basin",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "19037": Object.freeze({
      stationId: 19037,
      nameTr: "Ladik Akdağ Kayak Merkezi (1543m–1900m)",
      lat: 40.8753,
      lon: 35.9075,
      demElevationM: 1543,
      subBasinId: "ladik_akdag_snow_basin",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([10, 35, 720, 1850] as const),
    maxPhysicalPeakM: HYPSO_TR_55.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_55.bands
  }),
  waterBodies: Object.freeze([
    Object.freeze({
      id: "central_black_sea_samsun",
      labelTr: "Orta Karadeniz (Bafra Burnu – Samsun Körfezi – Çarşamba Açık DEK Koridoru)",
      kind: "open_sea",
      mgmMarineStationIds: Object.freeze([17030, 17459]),
      sampleCoord: Object.freeze({ lat: 41.48, lon: 36.42 }),
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.0,
      monthlyWaterTempNormalsC: Object.freeze([
        8.9, 8.1, 8.7, 11.4, 16.2, 21.5, 24.8, 25.6, 22.8, 18.6, 14.3, 10.9
      ] as const),
      subBasinInfluenceWeights: Object.freeze({
        samsun_coastal_core: 0.96,
        bafra_carsamba_alluvial_deltas: 0.94,
        kavak_havza_vezirkopru_inland: 0.34,
        ladik_akdag_snow_basin: 0.28
      }),
      onshoreWindSectorDeg: Object.freeze({ fromDeg: 310, toDeg: 60 }),
      effectiveFetchKm: 460,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 11.0,
      dekHeavyDeltaTC: 13.5,
      seaBreezeSpec: Object.freeze({
        activeMonths: Object.freeze([5, 9] as const),
        sectorDeg: Object.freeze({ fromDeg: 5, toDeg: 60 }),
        maxInlandPenetrationKm: 28,
        maxCoolingAmplitudeC: 2.6
      })
    })
  ]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "canik_moderate_orog_strong_south_foehn",
      labelTr: "Canik Dağları (~1200m) Ilımlı Kıyı Orografisi & Şiddetli Güneyli Kış Fönü (+20°C Sıçraması)",
      effectiveBarrierHeightM: 1220,
      crestPressureHpa: 850,
      applicableSubBasins: Object.freeze([
        "samsun_coastal_core",
        "bafra_carsamba_alluvial_deltas"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 155, toDeg: 230 }),
        minCrossCrestSpeedMs: 6.5,
        minFroudeNumber: 0.42,
        sourcePlateauElevationM: 880,
        maxTargetElevationM: 180,
        maxWarmingCapC: 5.4,
        subCloudVirgaFactor: 0.66,
        wetCutoffMmHr: 1.8
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 315, toDeg: 50 }),
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.16,
        maxPrecipMultiplierCap: 1.38
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 165, toDeg: 220 }),
        precipAttenuationFactor: 0.62
      })
    }),
    Object.freeze({
      id: "ladik_akdag_1900m_snow_wall",
      labelTr: "Ladik Akdağ (~1900–2062m) İç Yüksek Kar Duvarı",
      effectiveBarrierHeightM: 1920,
      crestPressureHpa: 800,
      applicableSubBasins: Object.freeze([
        "ladik_akdag_snow_basin",
        "kavak_havza_vezirkopru_inland"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 175, toDeg: 225 }),
        minCrossCrestSpeedMs: 8.0,
        minFroudeNumber: 0.44,
        sourcePlateauElevationM: 1050,
        maxTargetElevationM: 800,
        maxWarmingCapC: 3.4,
        subCloudVirgaFactor: 0.78,
        wetCutoffMmHr: 1.8
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 315, toDeg: 40 }),
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.18,
        maxPrecipMultiplierCap: 1.72
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "bafra_cape_karayel_jet",
      labelTr: "Bafra Burnu Karayel / Yıldız Kıyı Sıyırma Jeti",
      centerCoord: Object.freeze({ lat: 41.68, lon: 35.94 }),
      influenceRadiusKm: 20,
      channelAxisFromDeg: 315,
      bidirectional: false,
      sectorHalfWidthDeg: 24,
      speedMultiplier: 1.25,
      gustMultiplier: 1.36,
      suppressesNocturnalInversion: true
    }),
    Object.freeze({
      id: "kavak_cakalli_foehn_chute",
      labelTr: "Kavak – Çakallı – Samsun Güneyli Fön Oluk İnişi",
      centerCoord: Object.freeze({ lat: 41.2, lon: 36.18 }),
      influenceRadiusKm: 18,
      channelAxisFromDeg: 195,
      bidirectional: true,
      sectorHalfWidthDeg: 22,
      speedMultiplier: 1.22,
      gustMultiplier: 1.35,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 8,
    coldPoolMaxDepthM: 220,
    topographicEnclosureIndex: 0.36,
    deltaPressureTopHpa: 26,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 3.2
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.74
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 300, toDeg: 35 }),
      minWindShearVs850Deg: 48
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.32,
    invertedVDryMicroburstSusceptibility: 0.24,
    coastalWaterspoutSusceptibility: 0.64
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "target_samsun_coast",
      labelTr: "Samsun Bölge Merkez (WMO 17030)",
      lat: 41.3441,
      lon: 36.2564,
      elevationM: 4,
      role: "target"
    }),
    Object.freeze({
      key: "black_sea_dek_open_n",
      labelTr: "Orta Karadeniz Açık DEK Kaynağı",
      lat: 41.68,
      lon: 36.32,
      elevationM: 0,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "bafra_delta_nw",
      labelTr: "Bafra Burnu & Kızılırmak Deltası",
      lat: 41.6016,
      lon: 35.919,
      elevationM: 15,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "carsamba_ltfh_delta",
      labelTr: "Çarşamba Havalimanı (LTFH) Yeşilırmak Deltası",
      lat: 41.2631,
      lon: 36.5587,
      elevationM: 7,
      role: "corridor"
    }),
    Object.freeze({
      key: "kocadag_radar_crest",
      labelTr: "Atakum Kocadağ Radar Sırtı (1309m)",
      lat: 41.3148,
      lon: 36.0374,
      elevationM: 1309,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "kavak_canik_pass",
      labelTr: "Kavak Canik Geçidi (741m)",
      lat: 41.0998,
      lon: 36.0551,
      elevationM: 741,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "ladik_akdag_summit",
      labelTr: "Ladik Akdağ Kayak & Kar Kuşağı (~1900m)",
      lat: 40.8753,
      lon: 35.9075,
      elevationM: 1850,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "havza_south_upwind",
      labelTr: "Havza Güney Lodos Rüzgârüstü Platosu",
      lat: 40.9908,
      lon: 35.7089,
      elevationM: 675,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "vezirkopru_lee_basin",
      labelTr: "Vezirköprü İç Gölge Havzası",
      lat: 41.1367,
      lon: 35.4686,
      elevationM: 343,
      role: "lee_shadow"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -20,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 974,
    maxPlausibleMslpHpa: 1050,
    kalmanTempBiasCapC: 5.6
  }),
  urbanHeatIsland: Object.freeze({
    maxNocturnalUhiC: 2.5,
    referenceUrbanFraction: 0.78,
    coldBasinAirportIcaos: Object.freeze(["LTFH"])
  })
} satisfies ProvinceEngineSpec);

export const PROVINCE_SPEC_TR_55: ProvinceSpec = SPEC_TR_55_ENGINE;
export default PROVINCE_SPEC_TR_55;
