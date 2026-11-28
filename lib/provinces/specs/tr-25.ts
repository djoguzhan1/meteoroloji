import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";

const CLIM_TR_25 = TR81_CLIMATOLOGY_1991_2020["TR-25"];
const HYPSO_TR_25 = TR81_HYPSOMETRIC_PROFILES["TR-25"];

/**
 * ATMOS v5.0 — Wave 3C (REG-17) Bespoke Microclimate Spec: TR-25 Erzurum
 *
 * Key Synoptic & Microclimate Mechanisms (Siberian High Plateau — 700 hPa Reference):
 *  1. Karasu Basin Floor (`LTCE` / WMO `17096`, 1,758 m, `excludeFromCenterHeadline: true`,
 *     `coldPoolSusceptibility: 0.96`) vs. Erzurum City Center (`17095` Yakutiye / Palandöken
 *     Northern Foothill Thermal Belt, ~1,890–1,950 m):
 *     Under clear winter Siberian anticyclones over fresh snowpack (`snowDepthTriggerCm: 5`,
 *     `maxExtraRadiativeCoolingC: 7.5`), katabatic drainage plunges the Karasu floor to `-35°C`
 *     while the sloping Yakutiye–Palandöken foothill canopy stays `4–8°C` milder (`~-27°C..-30°C`).
 *  2. Palandöken – Ejder3200 (`3,176 m`) & Kargapazarı Alpine Wall (`maxPhysicalPeakM: 3,937 m`):
 *     Free-tropospheric alpine snow regime above the `Z_i = 2,138 m` cold-pool lid; `deltaPressureTopHpa: 700`
 *     avoids subterranean `850/925 hPa` artifacts since `1,900 m` already sits near `~805 hPa`.
 *  3. İspir – Tortum – Uzundere – Oltu Çoruh Canyon Micro-Mild Belt (`~1,050–1,350 m`):
 *     Strongly decoupled north of the Dumlu–Mescit–Kargapazarı divide (`barrierCouplingMatrix <= 0.18`
 *     against Erzurum basin sub-basins), sheltered from Karasu radiative frost and subject to
 *     southerly adiabatic Foehn descent down the Çoruh gorge.
 */
const SPEC_TR_25: ProvinceEngineSpec = {
  provinceCode: "TR-25",
  plateCode: 25,
  slug: "erzurum",
  nameTr: "Erzurum",
  region: "EASTERN_ANATOLIA",
  climateRegion: "DOGU_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "HIGH_EAST_SNOW_BASIN",
  icaoWhitelist: ["LTCE"],
  domainBounds: {
    minLat: 39.152,
    maxLat: 40.9875,
    minLon: 40.246,
    maxLon: 42.6202
  },
  primaryCenter: {
    mgmMerkezId: 92501,
    mgmIstNo: 17095,
    mgmSaatlikIstNo: 17095,
    mgmGunlukIstNo: 92501,
    wmoId: "17096",
    lat: 39.9058,
    lon: 41.2544,
    demVerifiedElevationM: 1895,
    subBasinId: "ERZURUM_FOOTHILL_THERMAL_BELT",
    urbanFraction: 0.72,
    monthlyTmaxNormalsC: CLIM_TR_25.tmaxC,
    monthlyTminNormalsC: CLIM_TR_25.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-25-yakutiye-merkez",
      name: "Erzurum Merkez / Yakutiye Termal Eteği (MGM 17095)",
      role: "foothill",
      lat: 39.9058,
      lon: 41.2544,
      elevationM: 1895
    },
    {
      id: "tr-25-ltce-karasu-ova",
      name: "Erzurum Havalimanı / Karasu Ayaz Tabanı (LTCE / WMO 17096)",
      role: "plain",
      lat: 39.9529,
      lon: 41.1897,
      elevationM: 1758
    },
    {
      id: "tr-25-ispir-uzundere-coruh",
      name: "Uzundere – İspir Çoruh Mikro-Ilıman Vadisi",
      role: "plain",
      lat: 40.5238,
      lon: 41.5518,
      elevationM: 1151
    },
    {
      id: "tr-25-karayazi-tekman-yayla",
      name: "Karayazı – Tekman Güney Yüksek Platosu",
      role: "foothill",
      lat: 39.6964,
      lon: 42.1256,
      elevationM: 2246
    },
    {
      id: "tr-25-palandoken-kayak",
      name: "Palandöken Kayak Merkezi (MGM 17777)",
      role: "summit",
      lat: 39.8446,
      lon: 41.2905,
      elevationM: 2615
    },
    {
      id: "tr-25-palandoken-ejder3200",
      name: "Palandöken Ejder3200 Zirvesi",
      role: "summit",
      lat: 39.8265,
      lon: 41.2865,
      elevationM: 3176
    }
  ],
  subBasins: [
    {
      id: "ERZURUM_FOOTHILL_THERMAL_BELT",
      labelTr: "Erzurum Şehir Merkezi – Yakutiye / Palandöken Kuzey Eteği Termal Kuşağı (1860–2080 m)",
      polygonOrBbox: {
        minLat: 39.865,
        maxLat: 39.935,
        minLon: 41.21,
        maxLon: 41.34
      },
      elevationRangeM: [1860, 2080],
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.72
    },
    {
      id: "KARASU_OVA_FLOOR",
      labelTr: "Karasu – Aziziye (LTCE 1758 m) – Aşkale – Pasinler Radyasyonel Ayaz Tabanı",
      polygonOrBbox: {
        minLat: 39.91,
        maxLat: 40.06,
        minLon: 40.62,
        maxLon: 41.92
      },
      elevationRangeM: [1680, 1820],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.14
    },
    {
      id: "ISPIR_TORTUM_CORUH_VALLEY",
      labelTr: "İspir – Tortum – Uzundere – Oltu Çoruh Mikro-Ilıman Kanyon Kuşağı (1050–1580 m)",
      polygonOrBbox: {
        minLat: 40.26,
        maxLat: 40.92,
        minLon: 40.72,
        maxLon: 42.38
      },
      elevationRangeM: [980, 1620],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.24
    },
    {
      id: "HINIS_TEKMAN_KARAYAZI_PLATEAU",
      labelTr: "Tekman – Karayazı – Hınıs – Çat – Horasan Güney/Doğu Yüksek Platosu",
      polygonOrBbox: {
        minLat: 39.18,
        maxLat: 40.12,
        minLon: 40.88,
        maxLon: 42.58
      },
      elevationRangeM: [1520, 2420],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.2
    },
    {
      id: "PALANDOKEN_KARGAPAZARI_ALPINE",
      labelTr: "Palandöken Ejder3200 – Konaklı – Kargapazarı – Mescit Alpin Kuşağı (2350–3937 m)",
      polygonOrBbox: {
        minLat: 39.74,
        maxLat: 40.24,
        minLon: 41.12,
        maxLon: 41.62
      },
      elevationRangeM: [2350, 3937],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.04
    }
  ],
  barrierCouplingMatrix: {
    ERZURUM_FOOTHILL_THERMAL_BELT: {
      ERZURUM_FOOTHILL_THERMAL_BELT: 1.0,
      KARASU_OVA_FLOOR: 0.56,
      ISPIR_TORTUM_CORUH_VALLEY: 0.16,
      HINIS_TEKMAN_KARAYAZI_PLATEAU: 0.42,
      PALANDOKEN_KARGAPAZARI_ALPINE: 0.48
    },
    KARASU_OVA_FLOOR: {
      ERZURUM_FOOTHILL_THERMAL_BELT: 0.56,
      KARASU_OVA_FLOOR: 1.0,
      ISPIR_TORTUM_CORUH_VALLEY: 0.12,
      HINIS_TEKMAN_KARAYAZI_PLATEAU: 0.38,
      PALANDOKEN_KARGAPAZARI_ALPINE: 0.24
    },
    ISPIR_TORTUM_CORUH_VALLEY: {
      ERZURUM_FOOTHILL_THERMAL_BELT: 0.16,
      KARASU_OVA_FLOOR: 0.12,
      ISPIR_TORTUM_CORUH_VALLEY: 1.0,
      HINIS_TEKMAN_KARAYAZI_PLATEAU: 0.14,
      PALANDOKEN_KARGAPAZARI_ALPINE: 0.18
    },
    HINIS_TEKMAN_KARAYAZI_PLATEAU: {
      ERZURUM_FOOTHILL_THERMAL_BELT: 0.42,
      KARASU_OVA_FLOOR: 0.38,
      ISPIR_TORTUM_CORUH_VALLEY: 0.14,
      HINIS_TEKMAN_KARAYAZI_PLATEAU: 1.0,
      PALANDOKEN_KARGAPAZARI_ALPINE: 0.44
    },
    PALANDOKEN_KARGAPAZARI_ALPINE: {
      ERZURUM_FOOTHILL_THERMAL_BELT: 0.48,
      KARASU_OVA_FLOOR: 0.24,
      ISPIR_TORTUM_CORUH_VALLEY: 0.18,
      HINIS_TEKMAN_KARAYAZI_PLATEAU: 0.44,
      PALANDOKEN_KARGAPAZARI_ALPINE: 1.0
    }
  },
  stationOverrides: {
    "17095": {
      stationId: 17095,
      nameTr: "Erzurum Bölge / Yakutiye Şehir Merkezi",
      lat: 39.9058,
      lon: 41.2544,
      demElevationM: 1895,
      subBasinId: "ERZURUM_FOOTHILL_THERMAL_BELT",
      urbanFraction: 0.72,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "mid_slope"
    },
    "17096": {
      stationId: 17096,
      nameTr: "Erzurum Havalimanı / Karasu Ova Tabanı (WMO 17096)",
      lat: 39.9529,
      lon: 41.1897,
      demElevationM: 1758,
      subBasinId: "KARASU_OVA_FLOOR",
      urbanFraction: 0.08,
      coldPoolSusceptibility: 0.96,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    LTCE: {
      stationId: "LTCE",
      nameTr: "Erzurum Havalimanı METAR (LTCE)",
      lat: 39.9529,
      lon: 41.1897,
      demElevationM: 1758,
      subBasinId: "KARASU_OVA_FLOOR",
      urbanFraction: 0.08,
      coldPoolSusceptibility: 0.96,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "19284": {
      stationId: 19284,
      nameTr: "Aziziye (Ilıca Karasu Tabanı)",
      lat: 39.9449,
      lon: 41.107,
      demElevationM: 1761,
      subBasinId: "KARASU_OVA_FLOOR",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.92,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18205": {
      stationId: 18205,
      nameTr: "Aşkale",
      lat: 39.9306,
      lon: 40.7092,
      demElevationM: 1691,
      subBasinId: "KARASU_OVA_FLOOR",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18201": {
      stationId: 18201,
      nameTr: "Pasinler Ovası",
      lat: 39.99,
      lon: 41.5742,
      demElevationM: 1720,
      subBasinId: "KARASU_OVA_FLOOR",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17777": {
      stationId: 17777,
      nameTr: "Palandöken Kayak Merkezi",
      lat: 39.8446,
      lon: 41.2905,
      demElevationM: 2580,
      subBasinId: "PALANDOKEN_KARGAPAZARI_ALPINE",
      urbanFraction: 0.05,
      coldPoolSusceptibility: 0.06,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "19067": {
      stationId: 19067,
      nameTr: "Konaklı Kayak Merkezi",
      lat: 39.7818,
      lon: 41.1988,
      demElevationM: 2474,
      subBasinId: "PALANDOKEN_KARGAPAZARI_ALPINE",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "17669": {
      stationId: 17669,
      nameTr: "Palandöken Yüksek Sırt",
      lat: 39.832,
      lon: 41.288,
      demElevationM: 2659,
      subBasinId: "PALANDOKEN_KARGAPAZARI_ALPINE",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.04,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "17666": {
      stationId: 17666,
      nameTr: "İspir (Çoruh Vadisi)",
      lat: 40.4868,
      lon: 40.9997,
      demElevationM: 1223,
      subBasinId: "ISPIR_TORTUM_CORUH_VALLEY",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17660": {
      stationId: 17660,
      nameTr: "Uzundere (Tortum Vadisi)",
      lat: 40.5238,
      lon: 41.5518,
      demElevationM: 1151,
      subBasinId: "ISPIR_TORTUM_CORUH_VALLEY",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.42,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17688": {
      stationId: 17688,
      nameTr: "Tortum",
      lat: 40.3013,
      lon: 41.5409,
      demElevationM: 1576,
      subBasinId: "ISPIR_TORTUM_CORUH_VALLEY",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.5,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17668": {
      stationId: 17668,
      nameTr: "Oltu",
      lat: 40.5497,
      lon: 41.9951,
      demElevationM: 1312,
      subBasinId: "ISPIR_TORTUM_CORUH_VALLEY",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17690": {
      stationId: 17690,
      nameTr: "Horasan (Aras Vadisi)",
      lat: 40.0383,
      lon: 42.1705,
      demElevationM: 1540,
      subBasinId: "HINIS_TEKMAN_KARAYAZI_PLATEAU",
      urbanFraction: 0.32,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17740": {
      stationId: 17740,
      nameTr: "Hınıs",
      lat: 39.3688,
      lon: 41.6957,
      demElevationM: 1715,
      subBasinId: "HINIS_TEKMAN_KARAYAZI_PLATEAU",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.76,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18204": {
      stationId: 18204,
      nameTr: "Karayazı Yüksek Platosu",
      lat: 39.6964,
      lon: 42.1256,
      demElevationM: 2243,
      subBasinId: "HINIS_TEKMAN_KARAYAZI_PLATEAU",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18370": {
      stationId: 18370,
      nameTr: "Tekman Platosu",
      lat: 39.6478,
      lon: 41.5125,
      demElevationM: 1980,
      subBasinId: "HINIS_TEKMAN_KARAYAZI_PLATEAU",
      urbanFraction: 0.16,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [1758, 2138, 2650, 3176],
    maxPhysicalPeakM: HYPSO_TR_25.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_25.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "KACKAR_MESCIT_KARADENIZ_SHIELD",
      labelTr: "Kaçkar – Mescit – Dumlu Dağları (3200–3937 m) Karadeniz Yağış Gölgesi & Palandöken Etek Fönü",
      effectiveBarrierHeightM: 3250,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "KARASU_OVA_FLOOR",
        "ERZURUM_FOOTHILL_THERMAL_BELT"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 170, toDeg: 220 },
        minCrossCrestSpeedMs: 12.5,
        minFroudeNumber: 0.9,
        sourcePlateauElevationM: 1980,
        maxTargetElevationM: 1960,
        maxWarmingCapC: 4.2,
        subCloudVirgaFactor: 0.72,
        wetCutoffMmHr: 1.8
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 225, toDeg: 275 },
        minOnshoreOrUpslopeSpeedMs: 8.5,
        coastalFrictionalConvergenceBoost: 1.08,
        maxPrecipMultiplierCap: 1.38
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 315, toDeg: 40 },
        precipAttenuationFactor: 0.48
      }
    },
    {
      id: "CORUH_GORGE_FOEHN_AND_GAP_INFLOW",
      labelTr: "Çoruh Kanyonu (İspir – Uzundere – Oltu) Güneyli Fön İnişi & Kuzey Vadi Girişi",
      effectiveBarrierHeightM: 3150,
      crestPressureHpa: 700,
      applicableSubBasins: ["ISPIR_TORTUM_CORUH_VALLEY"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 225 },
        minCrossCrestSpeedMs: 11.0,
        minFroudeNumber: 0.85,
        sourcePlateauElevationM: 1950,
        maxTargetElevationM: 1580,
        maxWarmingCapC: 5.4,
        subCloudVirgaFactor: 0.66,
        wetCutoffMmHr: 1.5
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 340, toDeg: 40 },
        minOnshoreOrUpslopeSpeedMs: 8.0,
        coastalFrictionalConvergenceBoost: 1.1,
        maxPrecipMultiplierCap: 1.42
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 170, toDeg: 220 },
        precipAttenuationFactor: 0.64
      }
    },
    {
      id: "PALANDOKEN_BINGOL_SW_SNOW_WALL",
      labelTr: "Palandöken (Ejder3200) – Bingöl Dağları Lodos Orografik Kar Duvarı",
      effectiveBarrierHeightM: 3176,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "PALANDOKEN_KARGAPAZARI_ALPINE",
        "HINIS_TEKMAN_KARAYAZI_PLATEAU"
      ],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 0, toDeg: 10 },
        minCrossCrestSpeedMs: 25.0,
        minFroudeNumber: 1.5,
        sourcePlateauElevationM: 1800,
        maxTargetElevationM: 1600,
        maxWarmingCapC: 1.0,
        subCloudVirgaFactor: 0.85,
        wetCutoffMmHr: 2.0
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 185, toDeg: 255 },
        minOnshoreOrUpslopeSpeedMs: 7.5,
        coastalFrictionalConvergenceBoost: 1.14,
        maxPrecipMultiplierCap: 1.72
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 330, toDeg: 30 },
        precipAttenuationFactor: 0.72
      }
    }
  ],
  venturiCorridors: [
    {
      id: "DEVEBOYNU_PASINLER_SIBERIAN_GAP",
      labelTr: "Deveboynu – Pasinler Doğu Sibirya Ayaz / Tipi Oluğu",
      centerCoord: { lat: 39.965, lon: 41.425 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 85,
      bidirectional: true,
      sectorHalfWidthDeg: 24,
      speedMultiplier: 1.28,
      gustMultiplier: 1.38,
      suppressesNocturnalInversion: true
    },
    {
      id: "ASKALE_KARASU_GORGE_CORRIDOR",
      labelTr: "Aşkale – Karasu Batı Boğazı Tipi Kanalı",
      centerCoord: { lat: 39.9306, lon: 40.7092 },
      influenceRadiusKm: 22,
      channelAxisFromDeg: 265,
      bidirectional: true,
      sectorHalfWidthDeg: 22,
      speedMultiplier: 1.26,
      gustMultiplier: 1.36,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1758,
    coldPoolMaxDepthM: 380,
    topographicEnclosureIndex: 0.92,
    deltaPressureTopHpa: 700,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 7.5
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.58
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 45, toDeg: 115 },
      minWindShearVs850Deg: 50
    }
  },
  inversion: {
    valleyFloorM: 1758,
    coldPoolDepthM: 380,
    clearNightInversionLapseCPerKm: 8.6,
    snowpackBoostFactor: 1.78,
    enclosureIndex: 0.92
  },
  urbanHeatIsland: {
    maxNocturnalUhiC: 4.6,
    referenceUrbanFraction: 0.72,
    coldBasinAirportIcaos: ["LTCE"]
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.24,
    invertedVDryMicroburstSusceptibility: 0.34,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "center_yakutiye_17095",
      labelTr: "Erzurum Merkez / Yakutiye Termal Eteği (1895 m)",
      lat: 39.9058,
      lon: 41.2544,
      elevationM: 1895,
      role: "target"
    },
    {
      key: "ltce_karasu_basin_floor",
      labelTr: "Erzurum Havalimanı LTCE Karasu Ova Tabanı (1758 m)",
      lat: 39.9529,
      lon: 41.1897,
      elevationM: 1758,
      role: "lee_shadow"
    },
    {
      key: "palandoken_ejder3200_wall",
      labelTr: "Palandöken Ejder3200 Zirve Duvarı (3176 m)",
      lat: 39.8265,
      lon: 41.2865,
      elevationM: 3176,
      role: "orographic_wall"
    },
    {
      key: "kargapazari_north_crest",
      labelTr: "Kargapazarı – Dumlu Kuzey Bariyeri (2950 m)",
      lat: 40.12,
      lon: 41.48,
      elevationM: 2950,
      role: "orographic_wall"
    },
    {
      key: "askale_west_corridor",
      labelTr: "Aşkale Karasu Batı Geçidi (1691 m)",
      lat: 39.9306,
      lon: 40.7092,
      elevationM: 1691,
      role: "corridor"
    },
    {
      key: "pasinler_east_corridor",
      labelTr: "Pasinler – Deveboynu Doğu Geçidi (1720 m)",
      lat: 39.99,
      lon: 41.5742,
      elevationM: 1720,
      role: "corridor"
    },
    {
      key: "uzundere_coruh_lee",
      labelTr: "Uzundere – Tortum Çoruh Fön Vadisi (1151 m)",
      lat: 40.5238,
      lon: 41.5518,
      elevationM: 1151,
      role: "lee_shadow"
    },
    {
      key: "ispir_coruh_canyon",
      labelTr: "İspir Çoruh Kanyonu (1223 m)",
      lat: 40.4868,
      lon: 40.9997,
      elevationM: 1223,
      role: "lee_shadow"
    },
    {
      key: "tekman_bingol_windward",
      labelTr: "Tekman Güney Yüksek Plato Girişi (1980 m)",
      lat: 39.6478,
      lon: 41.5125,
      elevationM: 1980,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -42,
    maxPlausibleTempC: 40,
    minPlausibleMslpHpa: 975,
    maxPlausibleMslpHpa: 1066,
    kalmanTempBiasCapC: 4.5
  }
};

export const PROVINCE_SPEC_TR_25: ProvinceEngineSpec = Object.freeze(SPEC_TR_25);
export default PROVINCE_SPEC_TR_25;
