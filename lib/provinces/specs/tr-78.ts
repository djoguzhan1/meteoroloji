import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_78 = TR81_CLIMATOLOGY_1991_2020["TR-78"];
const HYPSO_TR_78 = TR81_HYPSOMETRIC_PROFILES["TR-78"];

/**
 * ATMOS v5.0 — Wave 3B (REG-09) Bespoke Microclimate Spec: TR-78 Karabük
 *
 * Key Physical Mechanisms:
 *  1. Araç – Soğanlı Confluence Deep V-Valley Industrial Bowl (`~259–280 m`):
 *     Extreme topographic enclosure (`0.84`) traps nocturnal radiative & industrial haze
 *     inversions in winter while driving intense daytime sensible heating in summer (`+44°C`).
 *  2. Safranbolu – Eflani – Ovacık Limestone Terraces (`485–1,155 m`):
 *     Upper Safranbolu (`485–581 m`) sits near/above the shallow V-valley inversion lid,
 *     while Eflani (`941 m`) and Ovacık (`1,155 m`) transition rapidly to cold snow plateaus.
 *  3. Yenice – Filyos Forest Gorge (`182 m`) Moisture Funneling & Keltepe Ski Summit (`1,850–2,000 m`):
 *     NW Karayel flow (`280°–20°`) channels humid Black Sea air up the Filyos/Yenice canyon directly
 *     onto the Keltepe (Karaağaç) alpine ridge (`maxPhysicalPeakM: 2,000 m`).
 */
const SPEC_TR_78: ProvinceSpec = {
  provinceCode: "TR-78",
  plateCode: 78,
  slug: "karabuk",
  nameTr: "Karabük",
  region: "BLACK_SEA_WEST_CENTRAL",
  climateRegion: "KARADENIZ",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "INLAND_PASS_PLATEAU",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 40.8255,
    maxLat: 41.5877,
    minLon: 31.98,
    maxLon: 33.1373
  },
  primaryCenter: {
    mgmMerkezId: 97801,
    mgmIstNo: 17078,
    mgmSaatlikIstNo: 17077,
    mgmGunlukIstNo: 97801,
    wmoId: "17078",
    lat: 41.1956,
    lon: 32.6227,
    demVerifiedElevationM: 280,
    subBasinId: "karabuk_arac_soganli_v_valley",
    urbanFraction: 0.74,
    monthlyTmaxNormalsC: CLIM_TR_78.tmaxC,
    monthlyTminNormalsC: CLIM_TR_78.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-78-yenice-orman-vadisi",
      name: "Yenice Orman Boğazı / Filyos Vadisi (182 m)",
      role: "plain",
      lat: 41.1983,
      lon: 32.3267,
      elevationM: 182
    },
    {
      id: "tr-78-karabuk-merkez-vadi",
      name: "Karabük Merkez (Araç–Soğanlı V-Vadi Çanağı · 280 m)",
      role: "plain",
      lat: 41.1956,
      lon: 32.6227,
      elevationM: 280
    },
    {
      id: "tr-78-safranbolu-plato",
      name: "Safranbolu Tarihi Taraça / Plato (485 m)",
      role: "foothill",
      lat: 41.2458,
      lon: 32.6942,
      elevationM: 485
    },
    {
      id: "tr-78-eflani-yayla",
      name: "Eflani – Ahmetusta Geçidi Platosu",
      role: "foothill",
      lat: 41.4253,
      lon: 32.9708,
      elevationM: 950
    },
    {
      id: "tr-78-keltepe-kayak",
      name: "Keltepe Kayak Merkezi / Zirve (1950 m)",
      role: "summit",
      lat: 41.064,
      lon: 32.4625,
      elevationM: 1950
    }
  ],
  subBasins: [
    {
      id: "karabuk_arac_soganli_v_valley",
      labelTr: "Karabük Merkez Araç–Soğanlı Birleşimi Derin V-Vadi Sanayi Çanağı (250–380 m)",
      polygonOrBbox: { minLat: 41.13, maxLat: 41.24, minLon: 32.54, maxLon: 32.72 },
      elevationRangeM: [230, 410],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.74
    },
    {
      id: "yenice_filyos_forest_gorge",
      labelTr: "Yenice – Şeker Kanyonu Filyos Nem ve Orman Boğazı (120–450 m)",
      polygonOrBbox: { minLat: 41.08, maxLat: 41.38, minLon: 31.98, maxLon: 32.52 },
      elevationRangeM: [120, 480],
      defaultZone: "strait_corridor",
      defaultUrbanFraction: 0.22
    },
    {
      id: "safranbolu_eflani_ovacik_plateau",
      labelTr: "Safranbolu (485m) – Eskipazar – Eflani – Ovacık Kalker Plato Kuşağı",
      polygonOrBbox: { minLat: 40.84, maxLat: 41.5877, minLon: 32.48, maxLon: 33.1373 },
      elevationRangeM: [450, 1220],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.34
    },
    {
      id: "keltepe_ahmetusta_alpine",
      labelTr: "Keltepe Kayak Merkezi (1950–2000 m) & Ahmetusta Geçidi Yüksek Kar Sırtı",
      polygonOrBbox: { minLat: 40.98, maxLat: 41.34, minLon: 32.34, maxLon: 32.66 },
      elevationRangeM: [1020, 2000],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.04
    }
  ],
  barrierCouplingMatrix: {
    karabuk_arac_soganli_v_valley: {
      karabuk_arac_soganli_v_valley: 1.0,
      yenice_filyos_forest_gorge: 0.58,
      safranbolu_eflani_ovacik_plateau: 0.44,
      keltepe_ahmetusta_alpine: 0.16
    },
    yenice_filyos_forest_gorge: {
      karabuk_arac_soganli_v_valley: 0.58,
      yenice_filyos_forest_gorge: 1.0,
      safranbolu_eflani_ovacik_plateau: 0.28,
      keltepe_ahmetusta_alpine: 0.36
    },
    safranbolu_eflani_ovacik_plateau: {
      karabuk_arac_soganli_v_valley: 0.44,
      yenice_filyos_forest_gorge: 0.28,
      safranbolu_eflani_ovacik_plateau: 1.0,
      keltepe_ahmetusta_alpine: 0.48
    },
    keltepe_ahmetusta_alpine: {
      karabuk_arac_soganli_v_valley: 0.16,
      yenice_filyos_forest_gorge: 0.36,
      safranbolu_eflani_ovacik_plateau: 0.48,
      keltepe_ahmetusta_alpine: 1.0
    }
  },
  stationOverrides: {
    "17078": {
      stationId: 17078,
      nameTr: "Karabük Merkez (V-Vadi Tabanı · 280 m)",
      lat: 41.1956,
      lon: 32.6227,
      demElevationM: 280,
      subBasinId: "karabuk_arac_soganli_v_valley",
      urbanFraction: 0.74,
      coldPoolSusceptibility: 0.9,
      verticalStratumRole: "basin_floor"
    },
    "17077": {
      stationId: 17077,
      nameTr: "Karabük Üst Kuşak / Rasat",
      lat: 41.2327,
      lon: 32.6294,
      demElevationM: 485,
      subBasinId: "safranbolu_eflani_ovacik_plateau",
      urbanFraction: 0.56,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "mid_slope"
    },
    "17904": {
      stationId: 17904,
      nameTr: "Safranbolu",
      lat: 41.2636,
      lon: 32.6951,
      demElevationM: 581,
      subBasinId: "safranbolu_eflani_ovacik_plateau",
      urbanFraction: 0.48,
      coldPoolSusceptibility: 0.42,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18262": {
      stationId: 18262,
      nameTr: "Yenice (Filyos Orman Boğazı)",
      lat: 41.1983,
      lon: 32.3267,
      demElevationM: 182,
      subBasinId: "yenice_filyos_forest_gorge",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17641": {
      stationId: 17641,
      nameTr: "Eskipazar",
      lat: 40.9442,
      lon: 32.5331,
      demElevationM: 757,
      subBasinId: "safranbolu_eflani_ovacik_plateau",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18159": {
      stationId: 18159,
      nameTr: "Eflani",
      lat: 41.4253,
      lon: 32.9708,
      demElevationM: 941,
      subBasinId: "safranbolu_eflani_ovacik_plateau",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.76,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18266": {
      stationId: 18266,
      nameTr: "Ovacık",
      lat: 41.0778,
      lon: 32.91,
      demElevationM: 1155,
      subBasinId: "safranbolu_eflani_ovacik_plateau",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.64,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "19215": {
      stationId: 19215,
      nameTr: "Keltepe Kayak Merkezi",
      lat: 41.064,
      lon: 32.4625,
      demElevationM: 1680,
      subBasinId: "keltepe_ahmetusta_alpine",
      urbanFraction: 0.03,
      coldPoolSusceptibility: 0.2,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [182, 280, 950, 2000],
    maxPhysicalPeakM: HYPSO_TR_78.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_78.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "keltepe_yenice_nw_moisture_wall",
      labelTr: "Yenice Boğazı – Keltepe (2000m) Karayel/Batı Karadeniz Nem ve Kar Duvarı",
      effectiveBarrierHeightM: 2000,
      crestPressureHpa: 800,
      applicableSubBasins: ["yenice_filyos_forest_gorge", "keltepe_ahmetusta_alpine"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 155, toDeg: 220 },
        minCrossCrestSpeedMs: 9.5,
        minFroudeNumber: 0.86,
        sourcePlateauElevationM: 800,
        maxTargetElevationM: 480,
        maxWarmingCapC: 4.4,
        subCloudVirgaFactor: 0.72,
        wetCutoffMmHr: 1.5
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 280, toDeg: 20 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.25,
        maxPrecipMultiplierCap: 1.85
      }
    },
    {
      id: "karabuk_v_valley_foehn_and_bartin_ridge_shadow",
      labelTr: "Ahmetusta / Bartın Sırtları Kuzey Gölgesi & V-Vadi Güneyli Fön Isınması",
      effectiveBarrierHeightM: 1650,
      crestPressureHpa: 850,
      applicableSubBasins: [
        "karabuk_arac_soganli_v_valley",
        "safranbolu_eflani_ovacik_plateau"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 230 },
        minCrossCrestSpeedMs: 8.5,
        minFroudeNumber: 0.84,
        sourcePlateauElevationM: 850,
        maxTargetElevationM: 600,
        maxWarmingCapC: 4.8,
        subCloudVirgaFactor: 0.7,
        wetCutoffMmHr: 1.5
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 285, toDeg: 335 },
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 1.12,
        maxPrecipMultiplierCap: 1.44
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 0, toDeg: 55 },
        precipAttenuationFactor: 0.68
      }
    }
  ],
  venturiCorridors: [
    {
      id: "yenice_filyos_canyon_funnel",
      labelTr: "Yenice – Şeker Kanyonu Filyos Nem ve Karayel Boğaz Kanalı",
      centerCoord: { lat: 41.2, lon: 32.38 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 305,
      bidirectional: true,
      sectorHalfWidthDeg: 22,
      speedMultiplier: 1.24,
      gustMultiplier: 1.34,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 259,
    coldPoolMaxDepthM: 320,
    topographicEnclosureIndex: 0.84,
    deltaPressureTopHpa: 960,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 2.0,
      maxExtraRadiativeCoolingC: 4.2
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.54
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 295, toDeg: 45 },
      minWindShearVs850Deg: 48
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.36,
    invertedVDryMicroburstSusceptibility: 0.54,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "karabuk_center_v_valley",
      labelTr: "Karabük Merkez (Araç–Soğanlı V-Vadi Çanağı · 280m)",
      lat: 41.1956,
      lon: 32.6227,
      elevationM: 280,
      role: "target"
    },
    {
      key: "yenice_gorge_nw_inflow",
      labelTr: "Yenice Filyos Boğazı Nem Girişi",
      lat: 41.1983,
      lon: 32.3267,
      elevationM: 182,
      role: "corridor"
    },
    {
      key: "safranbolu_upper_terrace",
      labelTr: "Safranbolu Kalker Platosu (485–581m)",
      lat: 41.2636,
      lon: 32.6951,
      elevationM: 581,
      role: "lee_shadow"
    },
    {
      key: "keltepe_alpine_summit",
      labelTr: "Keltepe Kayak Merkezi / Zirve Duvarı",
      lat: 41.064,
      lon: 32.4625,
      elevationM: 1950,
      role: "orographic_wall"
    },
    {
      key: "ahmetusta_north_pass",
      labelTr: "Ahmetusta Kuzey Bartın Eşiği (1030m)",
      lat: 41.385,
      lon: 32.665,
      elevationM: 1030,
      role: "orographic_wall"
    },
    {
      key: "eflani_northeast_plateau",
      labelTr: "Eflani Kuzeydoğu Yayla Eşiği",
      lat: 41.4253,
      lon: 32.9708,
      elevationM: 941,
      role: "lee_shadow"
    },
    {
      key: "arac_valley_east_corridor",
      labelTr: "Araç Çayı Doğu Vadi Koridoru",
      lat: 41.225,
      lon: 32.95,
      elevationM: 520,
      role: "corridor"
    },
    {
      key: "ovacik_southeast_highland",
      labelTr: "Ovacık Güneydoğu Yüksek Plato",
      lat: 41.0778,
      lon: 32.91,
      elevationM: 1155,
      role: "foehn_windward"
    },
    {
      key: "eskipazar_south_inflow",
      labelTr: "Eskipazar Güney Geçit Girişi",
      lat: 40.9442,
      lon: 32.5331,
      elevationM: 757,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -22,
    maxPlausibleTempC: 45,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 4.0
  }
};

export const PROVINCE_SPEC_TR_78: ProvinceSpec = Object.freeze(SPEC_TR_78);
export default PROVINCE_SPEC_TR_78;
