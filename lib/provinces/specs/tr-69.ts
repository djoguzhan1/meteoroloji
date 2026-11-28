import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";

const CLIM_TR_69 = TR81_CLIMATOLOGY_1991_2020["TR-69"];
const HYPSO_TR_69 = TR81_HYPSOMETRIC_PROFILES["TR-69"];

/**
 * ATMOS v5.0 — Wave 3C (REG-17) Bespoke Microclimate Spec: TR-69 Bayburt
 *
 * Key Synoptic & Microclimate Mechanisms (Upper Çoruh Steppe-Plateau Transition — 700 hPa Reference):
 *  1. Soğanlı – Haldizen Northern Barrier (`~3,100–3,356 m`, `rainShadowSpec`):
 *     Despite sitting <50 km south of the Eastern Black Sea coast (Rize/Trabzon), the continuous
 *     3,000 m+ Soğanlı wall blocks shallow maritime boundary-layer moisture (`precipAttenuationFactor: 0.46`
 *     under NNW–NE flow), turning Bayburt (`~1,550–1,584 m`) into a dry-snow continental plateau.
 *  2. Kop Dağı Pass (`2,409 m` / Kop Ski Center `~2,900 m`) Blizzard Gap (`VenturiCorridorRule`):
 *     Intense channeling between the Upper Çoruh basin and the Aşkale/Karasu trough (`speedMultiplier: 1.38`,
 *     `gustMultiplier: 1.52`), producing severe blowing-snow/blizzard (`tipi`) events and mechanically
 *     eroding nocturnal inversions along the pass corridor.
 *  3. Honest Tier-B Donor Kalman Architecture (`icaoWhitelist: []`):
 *     Zero foreign METAR contamination (blocks Trabzon `LTCG`, Erzurum `LTCE`, Erzincan `LTCD`),
 *     paired with a `700 hPa` upper-reference snow-albedo inversion solver in the Aydıntepe–Bayburt basin.
 */
const SPEC_TR_69: ProvinceEngineSpec = {
  provinceCode: "TR-69",
  plateCode: 69,
  slug: "bayburt",
  nameTr: "Bayburt",
  region: "BLACK_SEA_EAST",
  climateRegion: "DOGU_ANADOLU",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "INLAND_PASS_PLATEAU",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 39.9307,
    maxLat: 40.5682,
    minLon: 39.663,
    maxLon: 40.7112
  },
  primaryCenter: {
    mgmMerkezId: 96901,
    mgmIstNo: 17089,
    mgmSaatlikIstNo: 17089,
    mgmGunlukIstNo: 96901,
    lat: 40.2547,
    lon: 40.2207,
    demVerifiedElevationM: 1582,
    subBasinId: "UPPER_CORUH_BAYBURT_BASIN",
    urbanFraction: 0.52,
    monthlyTmaxNormalsC: CLIM_TR_69.tmaxC,
    monthlyTminNormalsC: CLIM_TR_69.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-69-bayburt-merkez",
      name: "Bayburt Merkez / Üst Çoruh Havzası (MGM 17089)",
      role: "plain",
      lat: 40.2547,
      lon: 40.2207,
      elevationM: 1582
    },
    {
      id: "tr-69-aydintepe-ova",
      name: "Aydıntepe Çanağı",
      role: "plain",
      lat: 40.3812,
      lon: 40.1287,
      elevationM: 1597
    },
    {
      id: "tr-69-demirozu-yayla",
      name: "Demirözü – Pulur Yüksek Platosu",
      role: "foothill",
      lat: 40.1639,
      lon: 39.8858,
      elevationM: 1757
    },
    {
      id: "tr-69-soganli-gecidi",
      name: "Soğanlı Dağları Güney Eşiği",
      role: "foothill",
      lat: 40.485,
      lon: 40.245,
      elevationM: 2330
    },
    {
      id: "tr-69-kop-dagi-kayak",
      name: "Kop Dağı Geçidi & Kayak Merkezi (2409–2900 m)",
      role: "summit",
      lat: 40.0505,
      lon: 40.4568,
      elevationM: 2410
    }
  ],
  subBasins: [
    {
      id: "UPPER_CORUH_BAYBURT_BASIN",
      labelTr: "Bayburt Merkez – Aydıntepe Üst Çoruh Ovası & Boğazı (1450–1680 m)",
      polygonOrBbox: {
        minLat: 40.14,
        maxLat: 40.43,
        minLon: 40.04,
        maxLon: 40.52
      },
      elevationRangeM: [1450, 1680],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.46
    },
    {
      id: "DEMIROZU_PULUR_PLATEAU",
      labelTr: "Demirözü – Gökçedere Güneybatı Yüksek Platosu (1650–1980 m)",
      polygonOrBbox: {
        minLat: 39.96,
        maxLat: 40.28,
        minLon: 39.663,
        maxLon: 40.12
      },
      elevationRangeM: [1650, 1980],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.22
    },
    {
      id: "SOGANLI_NORTH_WALL",
      labelTr: "Soğanlı – Haldizen Dağları Güney Yamacı & Salmankaş Eşiği (1850–3356 m)",
      polygonOrBbox: {
        minLat: 40.41,
        maxLat: 40.5682,
        minLon: 39.92,
        maxLon: 40.62
      },
      elevationRangeM: [1850, 3356],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.05
    },
    {
      id: "KOP_MESCIT_ALPINE_PASS",
      labelTr: "Kop Dağı Geçidi (2409 m) – Kayak Merkezi (~2900 m) & Mescit Batı Sırtı",
      polygonOrBbox: {
        minLat: 39.9307,
        maxLat: 40.26,
        minLon: 40.32,
        maxLon: 40.7112
      },
      elevationRangeM: [1950, 3150],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.04
    }
  ],
  barrierCouplingMatrix: {
    UPPER_CORUH_BAYBURT_BASIN: {
      UPPER_CORUH_BAYBURT_BASIN: 1.0,
      DEMIROZU_PULUR_PLATEAU: 0.64,
      SOGANLI_NORTH_WALL: 0.26,
      KOP_MESCIT_ALPINE_PASS: 0.32
    },
    DEMIROZU_PULUR_PLATEAU: {
      UPPER_CORUH_BAYBURT_BASIN: 0.64,
      DEMIROZU_PULUR_PLATEAU: 1.0,
      SOGANLI_NORTH_WALL: 0.22,
      KOP_MESCIT_ALPINE_PASS: 0.36
    },
    SOGANLI_NORTH_WALL: {
      UPPER_CORUH_BAYBURT_BASIN: 0.26,
      DEMIROZU_PULUR_PLATEAU: 0.22,
      SOGANLI_NORTH_WALL: 1.0,
      KOP_MESCIT_ALPINE_PASS: 0.28
    },
    KOP_MESCIT_ALPINE_PASS: {
      UPPER_CORUH_BAYBURT_BASIN: 0.32,
      DEMIROZU_PULUR_PLATEAU: 0.36,
      SOGANLI_NORTH_WALL: 0.28,
      KOP_MESCIT_ALPINE_PASS: 1.0
    }
  },
  stationOverrides: {
    "17089": {
      stationId: 17089,
      nameTr: "Bayburt Merkez",
      lat: 40.2547,
      lon: 40.2207,
      demElevationM: 1582,
      subBasinId: "UPPER_CORUH_BAYBURT_BASIN",
      urbanFraction: 0.52,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor"
    },
    "18557": {
      stationId: 18557,
      nameTr: "Aydıntepe",
      lat: 40.3812,
      lon: 40.1287,
      demElevationM: 1597,
      subBasinId: "UPPER_CORUH_BAYBURT_BASIN",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18219": {
      stationId: 18219,
      nameTr: "Demirözü",
      lat: 40.1639,
      lon: 39.8858,
      demElevationM: 1757,
      subBasinId: "DEMIROZU_PULUR_PLATEAU",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "19050": {
      stationId: 19050,
      nameTr: "Bayburt Maden / Kop Kuzey Yaklaşımı",
      lat: 40.16,
      lon: 40.42,
      demElevationM: 1756,
      subBasinId: "UPPER_CORUH_BAYBURT_BASIN",
      urbanFraction: 0.12,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "19236": {
      stationId: 19236,
      nameTr: "Kop Dağı Kayak Merkezi",
      lat: 40.0505,
      lon: 40.4568,
      demElevationM: 2045,
      subBasinId: "KOP_MESCIT_ALPINE_PASS",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18718": {
      stationId: 18718,
      nameTr: "Soğanlı Güney Sırtı",
      lat: 40.47,
      lon: 40.24,
      demElevationM: 2260,
      subBasinId: "SOGANLI_NORTH_WALL",
      urbanFraction: 0.03,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [1450, 1890, 2409, 2920],
    maxPhysicalPeakM: HYPSO_TR_69.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_69.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "SOGANLI_BLACK_SEA_MOISTURE_BARRIER",
      labelTr: "Soğanlı – Haldizen Dağları (3100–3356 m) Karadeniz Yağış Gölgesi & Kuzey Fön Kalkanı",
      effectiveBarrierHeightM: 3120,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "UPPER_CORUH_BAYBURT_BASIN",
        "DEMIROZU_PULUR_PLATEAU"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 335, toDeg: 35 },
        minCrossCrestSpeedMs: 12.0,
        minFroudeNumber: 0.9,
        sourcePlateauElevationM: 600,
        maxTargetElevationM: 1750,
        maxWarmingCapC: 3.6,
        subCloudVirgaFactor: 0.62,
        wetCutoffMmHr: 1.2
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 195, toDeg: 250 },
        minOnshoreOrUpslopeSpeedMs: 8.0,
        coastalFrictionalConvergenceBoost: 1.1,
        maxPrecipMultiplierCap: 1.48
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 315, toDeg: 45 },
        precipAttenuationFactor: 0.46
      }
    },
    {
      id: "KOP_SOGANLI_ALPINE_SNOW_BARRIER",
      labelTr: "Kop Dağı (2409–2900 m) & Soğanlı Alpin Sırtı Orografik Kar/Tipi Duvarı",
      effectiveBarrierHeightM: 2850,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "KOP_MESCIT_ALPINE_PASS",
        "SOGANLI_NORTH_WALL"
      ],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 0, toDeg: 10 },
        minCrossCrestSpeedMs: 25.0,
        minFroudeNumber: 1.5,
        sourcePlateauElevationM: 1850,
        maxTargetElevationM: 1500,
        maxWarmingCapC: 1.0,
        subCloudVirgaFactor: 0.85,
        wetCutoffMmHr: 2.0
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 330, toDeg: 35 },
        minOnshoreOrUpslopeSpeedMs: 7.5,
        coastalFrictionalConvergenceBoost: 1.14,
        maxPrecipMultiplierCap: 1.64
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 160, toDeg: 210 },
        precipAttenuationFactor: 0.82
      }
    }
  ],
  venturiCorridors: [
    {
      id: "KOP_PASS_BLIZZARD_VENTURI",
      labelTr: "Kop Dağı Geçidi (2409 m) & Kayak Kuşağı Kar/Tipi Venturi Kanalı",
      centerCoord: { lat: 40.048, lon: 40.468 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 150,
      bidirectional: true,
      sectorHalfWidthDeg: 25,
      speedMultiplier: 1.38,
      gustMultiplier: 1.52,
      suppressesNocturnalInversion: true
    },
    {
      id: "CORUH_UPPER_GORGE_CORRIDOR",
      labelTr: "Üst Çoruh – Maden – İspir Çıkış Boğazı Vadi Kanalı",
      centerCoord: { lat: 40.36, lon: 40.44 },
      influenceRadiusKm: 18,
      channelAxisFromDeg: 235,
      bidirectional: true,
      sectorHalfWidthDeg: 22,
      speedMultiplier: 1.22,
      gustMultiplier: 1.32,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1550,
    coldPoolMaxDepthM: 340,
    topographicEnclosureIndex: 0.84,
    deltaPressureTopHpa: 700,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 5.8
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.66
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 40, toDeg: 115 },
      minWindShearVs850Deg: 48
    }
  },
  inversion: {
    valleyFloorM: 1550,
    coldPoolDepthM: 340,
    clearNightInversionLapseCPerKm: 6.8,
    snowpackBoostFactor: 1.58,
    enclosureIndex: 0.84
  },
  urbanHeatIsland: {
    maxNocturnalUhiC: 2.6,
    referenceUrbanFraction: 0.52,
    coldBasinAirportIcaos: []
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.26,
    invertedVDryMicroburstSusceptibility: 0.32,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "center_bayburt_17089",
      labelTr: "Bayburt Merkez Üst Çoruh (1582 m)",
      lat: 40.2547,
      lon: 40.2207,
      elevationM: 1582,
      role: "target"
    },
    {
      key: "aydintepe_cold_basin",
      labelTr: "Aydıntepe Kuzeybatı Çanağı (1597 m)",
      lat: 40.3812,
      lon: 40.1287,
      elevationM: 1597,
      role: "lee_shadow"
    },
    {
      key: "demirozu_sw_plateau",
      labelTr: "Demirözü Güneybatı Platosu (1757 m)",
      lat: 40.1639,
      lon: 39.8858,
      elevationM: 1757,
      role: "foehn_windward"
    },
    {
      key: "soganli_north_barrier",
      labelTr: "Soğanlı Dağları Kuzey Karadeniz Duvarı (2650 m)",
      lat: 40.485,
      lon: 40.245,
      elevationM: 2650,
      role: "orographic_wall"
    },
    {
      key: "salmankas_nw_wall",
      labelTr: "Salmankaş – Erikbeli Kuzeybatı Sırtı (2420 m)",
      lat: 40.47,
      lon: 40.04,
      elevationM: 2420,
      role: "orographic_wall"
    },
    {
      key: "kop_pass_corridor",
      labelTr: "Kop Dağı Geçidi & Kayak Koridoru (2409 m)",
      lat: 40.048,
      lon: 40.468,
      elevationM: 2409,
      role: "corridor"
    },
    {
      key: "maden_approach_corridor",
      labelTr: "Maden – Kop Kuzey Yaklaşım Kanalı (1756 m)",
      lat: 40.16,
      lon: 40.42,
      elevationM: 1756,
      role: "corridor"
    },
    {
      key: "coruh_ne_exit_gorge",
      labelTr: "Çoruh Kuzeydoğu Boğaz Çıkışı (1450 m)",
      lat: 40.36,
      lon: 40.44,
      elevationM: 1450,
      role: "lee_shadow"
    },
    {
      key: "mescit_east_alpine_wall",
      labelTr: "Mescit Dağları Batı Yamacı (2780 m)",
      lat: 40.22,
      lon: 40.56,
      elevationM: 2780,
      role: "orographic_wall"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -36,
    maxPlausibleTempC: 39,
    minPlausibleMslpHpa: 975,
    maxPlausibleMslpHpa: 1062,
    kalmanTempBiasCapC: 4.2
  }
};

export const PROVINCE_SPEC_TR_69: ProvinceEngineSpec = Object.freeze(SPEC_TR_69);
export default PROVINCE_SPEC_TR_69;
