import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_26 = TR81_CLIMATOLOGY_1991_2020["TR-26"];
const HYPSO_TR_26 = TR81_HYPSOMETRIC_PROFILES["TR-26"];

export const TR_26_BESPOKE_MODIFIERS = Object.freeze({
  allowedMetarIcaos: ["LTBY", "LTBI"] as const,
  coldBasinAirportIcaos: ["LTBY", "LTBI"] as const,
  saricakayaPorsukMaxCoupling: 0.06,
  porsukSnowFloorTempC: -26.0
});

/**
 * ATMOS v5.0 — Wave 3B (REG-13) Bespoke Microclimate Spec: TR-26 Eskişehir
 *
 * Key Physical & Synoptic Mechanisms:
 *  1. Porsuk Ovası Enclosed Frost & Freezing-Fog Basin (`~788 m`, WMO `17124` / MGM `17126`, `LTBY`, `LTBI`):
 *     Strong winter stratus/fog trapping (`persistentStratusLock.enabled: true`) and snowpack-albedo
 *     radiative feedback plunging temperatures below `-22°C` on clear post-frontal snow nights.
 *  2. Sarıcakaya – Mihalgazi Middle Sakarya Deep Micro-Mediterranean Canyon (`~220 m`):
 *     Sheltered behind the `1,826 m` Sündiken (Bozdağ) massif; strictly decoupled (`0.06`) in
 *     `barrierCouplingMatrix` so warm `220 m` valley readings never contaminate Porsuk Plain frosts.
 *  3. Sündiken & Türkmenbaba (`~1,800–1,826 m`) Alpine Ridges vs Sivrihisar – Çifteler Steppe.
 *  4. Strictly Continental (`waterBodies: []` — ZERO sea-effect DEK).
 */
const SPEC_TR_26: ProvinceSpec = {
  provinceCode: "TR-26",
  plateCode: 26,
  slug: "eskisehir",
  nameTr: "Eskişehir",
  region: "CENTRAL_ANATOLIA",
  climateRegion: "IC_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "CENTRAL_ANATOLIA_BASIN",
  icaoWhitelist: ["LTBY", "LTBI"],
  domainBounds: {
    minLat: 39.0433,
    maxLat: 40.1872,
    minLon: 29.9883,
    maxLon: 32.0115
  },
  primaryCenter: {
    mgmMerkezId: 92601,
    mgmIstNo: 17126,
    mgmSaatlikIstNo: 17126,
    mgmGunlukIstNo: 92601,
    wmoId: "17124",
    lat: 39.7656,
    lon: 30.5502,
    demVerifiedElevationM: 788,
    subBasinId: "porsuk_frost_fog_basin",
    urbanFraction: 0.7,
    monthlyTmaxNormalsC: CLIM_TR_26.tmaxC,
    monthlyTminNormalsC: CLIM_TR_26.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-26-saricakaya-mihalgazi",
      name: "Sarıcakaya – Mihalgazi Orta Sakarya Vadisi (220 m)",
      role: "plain",
      lat: 40.0422,
      lon: 30.6136,
      elevationM: 220
    },
    {
      id: "tr-26-alpu-porsuk",
      name: "Alpu – Porsuk Ayaz ve Sis Ovası",
      role: "plain",
      lat: 39.7661,
      lon: 30.9556,
      elevationM: 771
    },
    {
      id: "tr-26-sivrihisar",
      name: "Sivrihisar Bozkır Eşiği",
      role: "foothill",
      lat: 39.4455,
      lon: 31.5278,
      elevationM: 1065
    },
    {
      id: "tr-26-mihaliccik-sundiken",
      name: "Mihalıççık – Sündiken Dağları Sırtı",
      role: "summit",
      lat: 39.8733,
      lon: 31.4889,
      elevationM: 1388
    },
    {
      id: "tr-26-turkmenbaba-zirve",
      name: "Türkmenbaba / Kalabak Yüksek Kuşak (~1800 m)",
      role: "summit",
      lat: 39.56,
      lon: 30.38,
      elevationM: 1720
    }
  ],
  subBasins: [
    {
      id: "porsuk_frost_fog_basin",
      labelTr: "Porsuk Ovası Kapalı Ayaz ve Donan Sis Çanağı (Tepebaşı – Odunpazarı – Alpu)",
      polygonOrBbox: {
        minLat: 39.68,
        maxLat: 39.88,
        minLon: 30.32,
        maxLon: 31.24
      },
      elevationRangeM: [755, 835],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.7
    },
    {
      id: "saricakaya_sakarya_microvalley",
      labelTr: "Sarıcakaya – Mihalgazi Orta Sakarya Derin Vadi Mikrokliması (~220 m)",
      polygonOrBbox: {
        minLat: 39.98,
        maxLat: 40.16,
        minLon: 30.42,
        maxLon: 30.88
      },
      elevationRangeM: [195, 420],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.26
    },
    {
      id: "inonu_west_threshold",
      labelTr: "İnönü Batı Geçit Havzası",
      polygonOrBbox: {
        minLat: 39.74,
        maxLat: 39.92,
        minLon: 30.02,
        maxLon: 30.32
      },
      elevationRangeM: [800, 1020],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.28
    },
    {
      id: "cifteler_sivrihisar_steppe",
      labelTr: "Çifteler – Mahmudiye – Sivrihisar Yukarı Sakarya Bozkırı",
      polygonOrBbox: {
        minLat: 39.12,
        maxLat: 39.66,
        minLon: 30.62,
        maxLon: 31.98
      },
      elevationRangeM: [840, 1220],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.24
    },
    {
      id: "sundiken_turkmen_ridges",
      labelTr: "Sündiken Dağları & Türkmenbaba (~1800–1826 m) Alpin Sırtları",
      polygonOrBbox: {
        minLat: 39.42,
        maxLat: 39.96,
        minLon: 30.22,
        maxLon: 31.65
      },
      elevationRangeM: [1200, 1826],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.04
    }
  ],
  barrierCouplingMatrix: {
    porsuk_frost_fog_basin: {
      porsuk_frost_fog_basin: 1.0,
      saricakaya_sakarya_microvalley: 0.06,
      inonu_west_threshold: 0.54,
      cifteler_sivrihisar_steppe: 0.46,
      sundiken_turkmen_ridges: 0.22
    },
    saricakaya_sakarya_microvalley: {
      porsuk_frost_fog_basin: 0.06,
      saricakaya_sakarya_microvalley: 1.0,
      inonu_west_threshold: 0.12,
      cifteler_sivrihisar_steppe: 0.05,
      sundiken_turkmen_ridges: 0.24
    },
    inonu_west_threshold: {
      porsuk_frost_fog_basin: 0.54,
      saricakaya_sakarya_microvalley: 0.12,
      inonu_west_threshold: 1.0,
      cifteler_sivrihisar_steppe: 0.34,
      sundiken_turkmen_ridges: 0.38
    },
    cifteler_sivrihisar_steppe: {
      porsuk_frost_fog_basin: 0.46,
      saricakaya_sakarya_microvalley: 0.05,
      inonu_west_threshold: 0.34,
      cifteler_sivrihisar_steppe: 1.0,
      sundiken_turkmen_ridges: 0.26
    },
    sundiken_turkmen_ridges: {
      porsuk_frost_fog_basin: 0.22,
      saricakaya_sakarya_microvalley: 0.24,
      inonu_west_threshold: 0.38,
      cifteler_sivrihisar_steppe: 0.26,
      sundiken_turkmen_ridges: 1.0
    }
  },
  stationOverrides: {
    "17124": {
      stationId: 17124,
      nameTr: "Eskişehir Meydan (WMO 17124)",
      lat: 39.7833,
      lon: 30.5667,
      demElevationM: 785,
      subBasinId: "porsuk_frost_fog_basin",
      urbanFraction: 0.58,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor"
    },
    "17126": {
      stationId: 17126,
      nameTr: "Eskişehir Bölge – Odunpazarı",
      lat: 39.7656,
      lon: 30.5502,
      demElevationM: 788,
      subBasinId: "porsuk_frost_fog_basin",
      urbanFraction: 0.7,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "basin_floor"
    },
    LTBY: {
      stationId: "LTBY",
      nameTr: "Eskişehir Hasan Polatkan Havalimanı (Porsuk Ayaz Tabanı)",
      lat: 39.8119,
      lon: 30.5287,
      demElevationM: 789,
      subBasinId: "porsuk_frost_fog_basin",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    LTBI: {
      stationId: "LTBI",
      nameTr: "Eskişehir Hava Meydanı (Porsuk Ovası)",
      lat: 39.7841,
      lon: 30.5821,
      demElevationM: 785,
      subBasinId: "porsuk_frost_fog_basin",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18091": {
      stationId: 18091,
      nameTr: "Sarıcakaya (Orta Sakarya Mikro-Akdeniz Vadisi)",
      lat: 40.0422,
      lon: 30.6136,
      demElevationM: 220,
      subBasinId: "saricakaya_sakarya_microvalley",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.2,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "19372": {
      stationId: 19372,
      nameTr: "Mihalgazi (Orta Sakarya Vadisi)",
      lat: 40.0263,
      lon: 30.5771,
      demElevationM: 236,
      subBasinId: "saricakaya_sakarya_microvalley",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18092": {
      stationId: 18092,
      nameTr: "Mihalıççık (Sündiken Sırtı)",
      lat: 39.8733,
      lon: 31.4889,
      demElevationM: 1388,
      subBasinId: "sundiken_turkmen_ridges",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.26,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [220, 788, 1220, 1720],
    maxPhysicalPeakM: 1826,
    snowElevationBands: HYPSO_TR_26.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "SUNDIKEN_SAKARYA_UPSLOPE_FOEHN",
      labelTr: "Sündiken / Bozdağ (1826 m) Orta Sakarya Fön ve Kuzey Orografik Kuşağı",
      effectiveBarrierHeightM: 1826,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "saricakaya_sakarya_microvalley",
        "sundiken_turkmen_ridges"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 175, toDeg: 230 },
        minCrossCrestSpeedMs: 9.5,
        minFroudeNumber: 0.44,
        sourcePlateauElevationM: 820,
        maxTargetElevationM: 450,
        maxWarmingCapC: 3.4,
        subCloudVirgaFactor: 0.25,
        wetCutoffMmHr: 0.8
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 335, toDeg: 45 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.24,
        maxPrecipMultiplierCap: 1.42
      }
    },
    {
      id: "SUNDIKEN_PORSUK_LEE_SHADOW",
      labelTr: "Sündiken Dağları Güney Porsuk Ovası Yağış Gölgesi",
      effectiveBarrierHeightM: 1826,
      crestPressureHpa: 800,
      applicableSubBasins: ["porsuk_frost_fog_basin"],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 195, toDeg: 240 },
        minCrossCrestSpeedMs: 12.0,
        minFroudeNumber: 0.5,
        sourcePlateauElevationM: 900,
        maxTargetElevationM: 800,
        maxWarmingCapC: 1.5,
        subCloudVirgaFactor: 0.2,
        wetCutoffMmHr: 0.8
      },
      upslopeSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 295, toDeg: 335 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.12,
        maxPrecipMultiplierCap: 1.18
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 345, toDeg: 40 },
        precipAttenuationFactor: 0.82
      }
    },
    {
      id: "TURKMENBABA_SW_RIDGE",
      labelTr: "Türkmenbaba (~1800 m) Güneybatı Cephesel Kar Sırtı",
      effectiveBarrierHeightM: 1800,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "inonu_west_threshold",
        "sundiken_turkmen_ridges"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 200, toDeg: 245 },
        minCrossCrestSpeedMs: 10.5,
        minFroudeNumber: 0.46,
        sourcePlateauElevationM: 960,
        maxTargetElevationM: 860,
        maxWarmingCapC: 2.1,
        subCloudVirgaFactor: 0.2,
        wetCutoffMmHr: 0.8
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 295, toDeg: 350 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.2,
        maxPrecipMultiplierCap: 1.38
      }
    }
  ],
  venturiCorridors: [
    {
      id: "INONU_BOZUYUK_PORSUK_GATE",
      labelTr: "İnönü – Bozüyük Batı Rüzgar Eşiği",
      centerCoord: { lat: 39.8184, lon: 30.1243 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 285,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.24,
      gustMultiplier: 1.35,
      suppressesNocturnalInversion: true
    },
    {
      id: "SIVRIHISAR_STEPPE_RIDGE_FLOW",
      labelTr: "Sivrihisar Açık Bozkır Rüzgar Geçidi",
      centerCoord: { lat: 39.4455, lon: 31.5278 },
      influenceRadiusKm: 22,
      channelAxisFromDeg: 35,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.22,
      gustMultiplier: 1.32,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 765,
    coldPoolMaxDepthM: 320,
    topographicEnclosureIndex: 0.86,
    deltaPressureTopHpa: 850,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 7.4
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.52
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 350, toDeg: 75 },
      minWindShearVs850Deg: 60
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.42,
    invertedVDryMicroburstSusceptibility: 0.56,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "target_eskisehir_porsuk",
      labelTr: "Eskişehir Merkez – Porsuk Ovası (788 m)",
      lat: 39.7656,
      lon: 30.5502,
      elevationM: 788,
      role: "target"
    },
    {
      key: "microvalley_saricakaya",
      labelTr: "Sarıcakaya Derin Sakarya Vadisi (220 m)",
      lat: 40.0422,
      lon: 30.6136,
      elevationM: 220,
      role: "lee_shadow"
    },
    {
      key: "orog_sundiken_mihaliccik",
      labelTr: "Sündiken Dağları – Mihalıççık (1388 m)",
      lat: 39.8733,
      lon: 31.4889,
      elevationM: 1388,
      role: "orographic_wall"
    },
    {
      key: "orog_turkmenbaba_sw",
      labelTr: "Türkmenbaba Sırtı (1720 m)",
      lat: 39.56,
      lon: 30.38,
      elevationM: 1720,
      role: "orographic_wall"
    },
    {
      key: "gate_inonu_west",
      labelTr: "İnönü Batı Geçidi (833 m)",
      lat: 39.8184,
      lon: 30.1243,
      elevationM: 833,
      role: "corridor"
    },
    {
      key: "basin_alpu_east_porsuk",
      labelTr: "Alpu Doğu Porsuk Sis Tabanı (771 m)",
      lat: 39.7661,
      lon: 30.9556,
      elevationM: 771,
      role: "lee_shadow"
    },
    {
      key: "steppe_cifteler_sakarya",
      labelTr: "Çifteler Sakarya Başı (900 m)",
      lat: 39.3659,
      lon: 31.0209,
      elevationM: 900,
      role: "foehn_windward"
    },
    {
      key: "steppe_seyitgazi",
      labelTr: "Seyitgazi Eşiği (998 m)",
      lat: 39.4483,
      lon: 30.6978,
      elevationM: 998,
      role: "foehn_windward"
    },
    {
      key: "ridge_sivrihisar_se",
      labelTr: "Sivrihisar Bozkır Sırtı (1065 m)",
      lat: 39.4455,
      lon: 31.5278,
      elevationM: 1065,
      role: "corridor"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -30,
    maxPlausibleTempC: 50,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 6.5
  }
};

export const PROVINCE_SPEC_TR_26: ProvinceSpec = Object.freeze(SPEC_TR_26);
export default PROVINCE_SPEC_TR_26;
