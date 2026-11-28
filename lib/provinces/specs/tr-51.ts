import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_51 = TR81_CLIMATOLOGY_1991_2020["TR-51"];
const HYPSO_TR_51 = TR81_HYPSOMETRIC_PROFILES["TR-51"];

export const TR_51_ALADAGLAR_GULEK_REGIME = Object.freeze({
  demirkazikPeakM: 3756,
  ulukislaGulekExitElevationM: 1453,
  borPlainElevationRangeM: Object.freeze([1100, 1215] as const),
  allowedMetarIcaos: Object.freeze([] as const)
});

/**
 * ATMOS v5.0 — Wave 3B (REG-14) Bespoke Microclimate Spec: TR-51 Niğde
 *
 * Key Physical Mechanisms:
 *  1. Aladağlar (`3,756 m` Demirkazık) & Bolkar Mountains W/NW Alpine Snow Wall:
 *     Çamardı–Ketençimen and high Aladağlar/Bolkar slopes intercept W/NW/SW moist airmasses
 *     with intense upslope snow enhancement (`maxPrecipMultiplierCap: 1.66`), contrasting sharply
 *     against the arid western Bor–Altunhisar steppe plain (`~1,100–1,215 m`).
 *  2. Ulukışla – Gülek Northern Exit Venturi & Blizzard Corridor (`1,453 m`):
 *     Funnels bidirectional NNE–SSW winds (`speedMultiplier: 1.45`, `gustMultiplier: 1.62`) through
 *     the northern exit of Cilician Gates (`Gülek Boğazı`), producing heavy pass snow/blizzards
 *     and turbulent nocturnal inversion breakup.
 *  3. Strict Zero-METAR Isolation (`icaoWhitelist: []`):
 *     Blocks Kayseri (`LTAU`), Nevşehir (`LTAZ`), and low-elevation Adana (`LTAF`) from leaking
 *     across the Aladağlar/Bolkar/Erciyes divides.
 */
const SPEC_TR_51: ProvinceSpec = {
  provinceCode: "TR-51",
  plateCode: 51,
  slug: "nigde",
  nameTr: "Niğde",
  region: "CENTRAL_ANATOLIA",
  climateRegion: "IC_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "CENTRAL_ANATOLIA_BASIN",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 37.3315,
    maxLat: 38.3865,
    minLon: 33.981,
    maxLon: 35.311
  },
  primaryCenter: {
    mgmMerkezId: 95101,
    mgmIstNo: 17250,
    mgmSaatlikIstNo: 17250,
    mgmGunlukIstNo: 95101,
    wmoId: "17250",
    lat: 37.9587,
    lon: 34.6795,
    demVerifiedElevationM: 1211,
    subBasinId: "nigde_central_corridor",
    urbanFraction: 0.58,
    monthlyTmaxNormalsC: CLIM_TR_51.tmaxC,
    monthlyTminNormalsC: CLIM_TR_51.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-51-bor-ovasi",
      name: "Bor Kurak Ovası",
      role: "coast",
      lat: 37.9214,
      lon: 34.5528,
      elevationM: 1115
    },
    {
      id: "tr-51-altunhisar",
      name: "Altunhisar Batı Bozkırı",
      role: "plain",
      lat: 38.0015,
      lon: 34.3588,
      elevationM: 1185
    },
    {
      id: "tr-51-merkez",
      name: "Niğde Merkez (WMO 17250)",
      role: "plain",
      lat: 37.9587,
      lon: 34.6795,
      elevationM: 1211
    },
    {
      id: "tr-51-ulukisla",
      name: "Ulukışla (Gülek Kuzey Çıkışı Koridoru)",
      role: "foothill",
      lat: 37.548,
      lon: 34.4867,
      elevationM: 1453
    },
    {
      id: "tr-51-camardi",
      name: "Çamardı (Aladağlar Batı Yamacı)",
      role: "foothill",
      lat: 37.8358,
      lon: 34.9975,
      elevationM: 1603
    },
    {
      id: "tr-51-ciftlik",
      name: "Çiftlik (Melendiz Yüksek Çanağı)",
      role: "foothill",
      lat: 38.1431,
      lon: 34.4619,
      elevationM: 1630
    },
    {
      id: "tr-51-ketencimen-kayak",
      name: "Ketençimen Kayak & Geçit Kuşağı",
      role: "summit",
      lat: 38.032,
      lon: 34.845,
      elevationM: 2150
    },
    {
      id: "tr-51-aladaglar-demirkazik",
      name: "Aladağlar (Demirkazık) & Bolkar Zirve Kuşağı",
      role: "summit",
      lat: 37.836,
      lon: 35.154,
      elevationM: 2850
    }
  ],
  subBasins: [
    {
      id: "bor_altunhisar_arid_plain",
      labelTr: "Bor – Altunhisar Batı Kurak Bozkır Ovası (1100–1215m)",
      polygonOrBbox: {
        minLat: 37.72,
        maxLat: 38.12,
        minLon: 33.981,
        maxLon: 34.62
      },
      elevationRangeM: [1060, 1230],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.28
    },
    {
      id: "nigde_central_corridor",
      labelTr: "Niğde Merkez (1211m) – Melendiz Güney Etek Oluk Hattı",
      polygonOrBbox: {
        minLat: 37.86,
        maxLat: 38.24,
        minLon: 34.62,
        maxLon: 34.92
      },
      elevationRangeM: [1190, 1480],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.56
    },
    {
      id: "ulukisla_gulek_north_gate",
      labelTr: "Ulukışla – Darboğaz – Gülek Kuzey Çıkışı Venturi ve Kar Koridoru",
      polygonOrBbox: {
        minLat: 37.38,
        maxLat: 37.74,
        minLon: 34.28,
        maxLon: 34.88
      },
      elevationRangeM: [1250, 1880],
      defaultZone: "strait_corridor",
      defaultUrbanFraction: 0.2
    },
    {
      id: "ciftlik_melendiz_caldera_basin",
      labelTr: "Çiftlik (1630m) – Melendiz – Göllüdağ Yüksek Volkanik Çanak",
      polygonOrBbox: {
        minLat: 38.08,
        maxLat: 38.3865,
        minLon: 34.25,
        maxLon: 34.72
      },
      elevationRangeM: [1500, 2963],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.14
    },
    {
      id: "camardi_aladaglar_bolkar_alpine",
      labelTr: "Çamardı – Aladağlar (3756m Demirkazık) & Bolkar Batı/KB Alp Kuşağı",
      polygonOrBbox: {
        minLat: 37.3315,
        maxLat: 38.08,
        minLon: 34.78,
        maxLon: 35.311
      },
      elevationRangeM: [1550, 3756],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.06
    }
  ],
  barrierCouplingMatrix: {
    bor_altunhisar_arid_plain: {
      bor_altunhisar_arid_plain: 1.0,
      nigde_central_corridor: 0.78,
      ulukisla_gulek_north_gate: 0.34,
      ciftlik_melendiz_caldera_basin: 0.26,
      camardi_aladaglar_bolkar_alpine: 0.14
    },
    nigde_central_corridor: {
      bor_altunhisar_arid_plain: 0.78,
      nigde_central_corridor: 1.0,
      ulukisla_gulek_north_gate: 0.42,
      ciftlik_melendiz_caldera_basin: 0.38,
      camardi_aladaglar_bolkar_alpine: 0.28
    },
    ulukisla_gulek_north_gate: {
      bor_altunhisar_arid_plain: 0.34,
      nigde_central_corridor: 0.42,
      ulukisla_gulek_north_gate: 1.0,
      ciftlik_melendiz_caldera_basin: 0.2,
      camardi_aladaglar_bolkar_alpine: 0.56
    },
    ciftlik_melendiz_caldera_basin: {
      bor_altunhisar_arid_plain: 0.26,
      nigde_central_corridor: 0.38,
      ulukisla_gulek_north_gate: 0.2,
      ciftlik_melendiz_caldera_basin: 1.0,
      camardi_aladaglar_bolkar_alpine: 0.36
    },
    camardi_aladaglar_bolkar_alpine: {
      bor_altunhisar_arid_plain: 0.14,
      nigde_central_corridor: 0.28,
      ulukisla_gulek_north_gate: 0.56,
      ciftlik_melendiz_caldera_basin: 0.36,
      camardi_aladaglar_bolkar_alpine: 1.0
    }
  },
  stationOverrides: {
    "17250": {
      stationId: 17250,
      nameTr: "Niğde Merkez (WMO 17250)",
      lat: 37.9587,
      lon: 34.6795,
      demElevationM: 1211,
      subBasinId: "nigde_central_corridor",
      urbanFraction: 0.58,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "basin_floor"
    },
    "18502": {
      stationId: 18502,
      nameTr: "Bor (Kurak Ova)",
      lat: 37.9214,
      lon: 34.5528,
      demElevationM: 1215,
      subBasinId: "bor_altunhisar_arid_plain",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18501": {
      stationId: 18501,
      nameTr: "Altunhisar (Batı Bozkırı)",
      lat: 38.0015,
      lon: 34.3588,
      demElevationM: 1185,
      subBasinId: "bor_altunhisar_arid_plain",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17906": {
      stationId: 17906,
      nameTr: "Ulukışla (Gülek Kuzey Çıkışı)",
      lat: 37.548,
      lon: 34.4867,
      demElevationM: 1453,
      subBasinId: "ulukisla_gulek_north_gate",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.4,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18214": {
      stationId: 18214,
      nameTr: "Çamardı (Aladağlar Batı Yamacı)",
      lat: 37.8358,
      lon: 34.9975,
      demElevationM: 1603,
      subBasinId: "camardi_aladaglar_bolkar_alpine",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18503": {
      stationId: 18503,
      nameTr: "Çiftlik (Melendiz Yüksek Çanağı)",
      lat: 38.1431,
      lon: 34.4619,
      demElevationM: 1630,
      subBasinId: "ciftlik_melendiz_caldera_basin",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.9,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18899": {
      stationId: 18899,
      nameTr: "Aladağlar / Bolkar Yüksek Kar İstasyonu",
      lat: 37.482,
      lon: 34.612,
      demElevationM: 2240,
      subBasinId: "camardi_aladaglar_bolkar_alpine",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.25,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [1085, 1230, 1850, 2850],
    maxPhysicalPeakM: HYPSO_TR_51.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_51.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "aladaglar_west_nw_orographic_snow_wall",
      labelTr: "Aladağlar (3756m Demirkazık) Batı / Kuzeybatı Orografik Kar Duvarı",
      effectiveBarrierHeightM: 2950,
      crestPressureHpa: 700,
      applicableSubBasins: ["camardi_aladaglar_bolkar_alpine"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 75, toDeg: 140 },
        minCrossCrestSpeedMs: 8.5,
        minFroudeNumber: 0.42,
        sourcePlateauElevationM: 1450,
        maxTargetElevationM: 1700,
        maxWarmingCapC: 3.5,
        subCloudVirgaFactor: 0.55,
        wetCutoffMmHr: 0.3
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 230, toDeg: 335 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.08,
        maxPrecipMultiplierCap: 1.66
      }
    },
    {
      id: "gulek_bolkar_ssw_spillover_snow_corridor",
      labelTr: "Gülek Boğazı – Ulukışla – Çamardı Güneybatı Akdeniz Nem Taşması ve Kar Kanalı",
      effectiveBarrierHeightM: 2350,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "ulukisla_gulek_north_gate",
        "camardi_aladaglar_bolkar_alpine"
      ],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 20, toDeg: 65 },
        minCrossCrestSpeedMs: 11.0,
        minFroudeNumber: 0.55,
        sourcePlateauElevationM: 1210,
        maxTargetElevationM: 1500,
        maxWarmingCapC: 2.0,
        subCloudVirgaFactor: 0.4,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 245 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.12,
        maxPrecipMultiplierCap: 1.64
      }
    },
    {
      id: "bor_altunhisar_bolkar_lee_rain_shadow",
      labelTr: "Bor – Altunhisar Kurak Ova Bolkar (3524m) Yağış Gölgesi",
      effectiveBarrierHeightM: 2550,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "bor_altunhisar_arid_plain",
        "nigde_central_corridor"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 150, toDeg: 225 },
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.44,
        sourcePlateauElevationM: 1100,
        maxTargetElevationM: 1320,
        maxWarmingCapC: 3.8,
        subCloudVirgaFactor: 0.68,
        wetCutoffMmHr: 0.35
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 295, toDeg: 25 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.0,
        maxPrecipMultiplierCap: 1.26
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 145, toDeg: 230 },
        precipAttenuationFactor: 0.54
      }
    }
  ],
  venturiCorridors: [
    {
      id: "ulukisla_gulek_north_exit_venturi",
      labelTr: "Ulukışla – Gülek Boğazı Kuzey Çıkışı (1453m) Venturi Fırtına ve Kar Kanalı",
      centerCoord: { lat: 37.548, lon: 34.4867 },
      influenceRadiusKm: 30,
      channelAxisFromDeg: 25,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.45,
      gustMultiplier: 1.62,
      suppressesNocturnalInversion: true
    },
    {
      id: "ecemis_camardi_canyon_corridor",
      labelTr: "Ecemiş Koridoru – Çamardı Kanalı",
      centerCoord: { lat: 37.8358, lon: 34.9975 },
      influenceRadiusKm: 22,
      channelAxisFromDeg: 15,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.28,
      gustMultiplier: 1.4,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1085,
    coldPoolMaxDepthM: 310,
    topographicEnclosureIndex: 0.78,
    deltaPressureTopHpa: 36,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 2.0,
      maxExtraRadiativeCoolingC: 5.0
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.42
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 350, toDeg: 70 },
      minWindShearVs850Deg: 60
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.66,
    invertedVDryMicroburstSusceptibility: 0.74,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TARGET_NIGDE_17250",
      labelTr: "Niğde Merkez (WMO 17250)",
      lat: 37.9587,
      lon: 34.6795,
      elevationM: 1211,
      role: "target"
    },
    {
      key: "BOR_ARID_PLAIN",
      labelTr: "Bor Kurak Ovası (1115m)",
      lat: 37.9214,
      lon: 34.5528,
      elevationM: 1115,
      role: "lee_shadow"
    },
    {
      key: "ALTUNHISAR_STEPPE",
      labelTr: "Altunhisar Batı Bozkırı",
      lat: 38.0015,
      lon: 34.3588,
      elevationM: 1185,
      role: "lee_shadow"
    },
    {
      key: "ULUKISLA_GULEK_EXIT",
      labelTr: "Ulukışla – Gülek Kuzey Çıkışı (1453m)",
      lat: 37.548,
      lon: 34.4867,
      elevationM: 1453,
      role: "corridor"
    },
    {
      key: "CAMARDI_ECEMIS",
      labelTr: "Çamardı – Aladağlar Batı Eteği (1603m)",
      lat: 37.8358,
      lon: 34.9975,
      elevationM: 1603,
      role: "corridor"
    },
    {
      key: "DEMIRKAZIK_ALADAGLAR_WALL",
      labelTr: "Aladağlar / Demirkazık Batı Kar Duvarı",
      lat: 37.836,
      lon: 35.154,
      elevationM: 2850,
      role: "orographic_wall"
    },
    {
      key: "BOLKAR_NW_CREST",
      labelTr: "Bolkar Dağları Kuzeybatı Sırtı",
      lat: 37.42,
      lon: 34.62,
      elevationM: 2550,
      role: "orographic_wall"
    },
    {
      key: "MELENDIZ_CIFTLIK_CALDERA",
      labelTr: "Çiftlik – Melendiz Yüksek Çanağı",
      lat: 38.1431,
      lon: 34.4619,
      elevationM: 1630,
      role: "foehn_windward"
    },
    {
      key: "KETENCIMEN_PASS",
      labelTr: "Ketençimen Geçit Sırtı",
      lat: 38.032,
      lon: 34.845,
      elevationM: 2150,
      role: "orographic_wall"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -30,
    maxPlausibleTempC: 42,
    minPlausibleMslpHpa: 984,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 5.5
  }
};

export const PROVINCE_SPEC_TR_51: ProvinceSpec = Object.freeze(SPEC_TR_51);
export default PROVINCE_SPEC_TR_51;
