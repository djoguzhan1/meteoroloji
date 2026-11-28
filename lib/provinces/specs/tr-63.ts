import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_63 = TR81_CLIMATOLOGY_1991_2020["TR-63"];
const HYPSO_TR_63 = TR81_HYPSOMETRIC_PROFILES["TR-63"];

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
 * ATMOS v5.0 — Wave 3C (REG-21) Bespoke Physical Regime Contract: `TR-63` Şanlıurfa
 *
 * Captures the extreme Mesopotamian thermal/dust core, GAP irrigation humidity, and Karacadağ dome:
 *  1. Harran – Akçakale – Ceylanpınar Mesopotamian Plain (~360–420 m) & Basra Thermal Low Core:
 *     Extreme `+47°C` summer peaks, severe Syrian/Mesopotamian Haboob & synoptic dust transport
 *     (`dustTransportSusceptibility: 0.94`), and deep dry-adiabatic convective boundary layers
 *     driving inverted-V dry microbursts (`invertedVDryMicroburstSusceptibility: 0.88`).
 *  2. GAP Irrigation Canal Evapotranspiration & Atatürk Reservoir Southeastern Terrace (`fresh_lake`):
 *     Summer cotton/corn irrigation across Harran–Suruç–Akçakale injects `+4.5..+6.5°C` afternoon
 *     dew-point surges (`gapIrrigationDewPointSurgeC: 5.5`), turning dry desert heat into oppressive
 *     sultry heat-index episodes, while Bozova–Halfeti borders Atatürk Reservoir (540 m).
 *  3. Karacadağ Shield Volcano (`1,957 m` physical summit / MGM `18922` Kayak Merkezi `1,946 m`):
 *     Rising abruptly in NE Siverek above the basalt plateau (`801 m`), Karacadağ is Şanlıurfa's
 *     SOLE snow-retaining alpine volcanic dome (`barrierCoupling <= 0.08` vs Harran/Center).
 */
export const TR_63_HARRAN_GAP_KARACADAG_CONTRACT = deepFreeze({
  harranAkcakalePlainElevationRangeM: [360, 420] as const,
  urfaCenterElevationM: 550,
  gapAirportLtcsElevationM: 822,
  karacadagPhysicalSummitM: 1957,
  karacadagSkiStationDemM: 1946,
  summerBasraPeakTempC: 47.5,
  gapIrrigationDewPointSurgeC: 5.5,
  dustTransportSusceptibility: 0.94,
  invertedVDryMicroburstSusceptibility: 0.88,
  allowedMetarIcaos: ["LTCS"] as const,
  blockedNeighborAndForeignMetarIcaos: ["LTCP", "LTAJ", "LTCC", "LTCR", "OSAP", "OSKL"] as const
});

const SPEC_TR_63: ProvinceSpec = {
  provinceCode: "TR-63",
  plateCode: 63,
  slug: "sanliurfa",
  nameTr: "Şanlıurfa",
  region: "SOUTHEASTERN_ANATOLIA",
  climateRegion: "GUNEYDOGU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "SOUTHEAST_THRESHOLD_ARID",
  icaoWhitelist: ["LTCS"],
  domainBounds: {
    minLat: 36.669,
    maxLat: 38.018,
    minLon: 37.8353,
    maxLon: 40.2385
  },
  primaryCenter: {
    mgmMerkezId: 96301,
    mgmIstNo: 17270,
    mgmSaatlikIstNo: 17270,
    mgmGunlukIstNo: 96301,
    wmoId: "17270",
    lat: 37.1608,
    lon: 38.7863,
    demVerifiedElevationM: 550,
    subBasinId: "sanliurfa_piedmont_steppe",
    urbanFraction: 0.78,
    monthlyTmaxNormalsC: CLIM_TR_63.tmaxC,
    monthlyTminNormalsC: CLIM_TR_63.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-63-harran-akcakale-ova",
      name: "Harran – Akçakale GAP & Mezopotamya Ovası",
      role: "plain",
      lat: 36.7276,
      lon: 38.9473,
      elevationM: 365
    },
    {
      id: "tr-63-birecik-halfeti-firat",
      name: "Birecik – Halfeti Fırat Vadi Kuşağı",
      role: "plain",
      lat: 37.0139,
      lon: 37.9715,
      elevationM: 347
    },
    {
      id: "tr-63-sanliurfa-merkez",
      name: "Şanlıurfa Merkez (Haliliye / Eyyübiye · WMO 17270)",
      role: "plain",
      lat: 37.1608,
      lon: 38.7863,
      elevationM: 550
    },
    {
      id: "tr-63-siverek-bazalt-plato",
      name: "Siverek Bazalt Platosu",
      role: "foothill",
      lat: 37.7522,
      lon: 39.3291,
      elevationM: 801
    },
    {
      id: "tr-63-karacadag-kayak-zirve",
      name: "Karacadağ Kayak Merkezi / Kalkan Volkanı (1957 m Kütlesi)",
      role: "summit",
      lat: 37.7151,
      lon: 39.8293,
      elevationM: 1946
    }
  ],
  subBasins: [
    {
      id: "harran_akcakale_ceylanpinar_plain",
      labelTr: "Harran – Akçakale – Ceylanpınar Alçak Mezopotamya & GAP Sulama Ovası (355–450 m)",
      polygonOrBbox: {
        minLat: 36.669,
        maxLat: 37.08,
        minLon: 38.75,
        maxLon: 40.2385
      },
      elevationRangeM: [355, 460],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.24
    },
    {
      id: "sanliurfa_piedmont_steppe",
      labelTr: "Şanlıurfa Merkez (Haliliye – Eyyübiye – Karaköprü) – Suruç – Viranşehir Eşik Platosu",
      polygonOrBbox: {
        minLat: 36.96,
        maxLat: 37.48,
        minLon: 38.28,
        maxLon: 39.92
      },
      elevationRangeM: [460, 840],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.68
    },
    {
      id: "bozova_halfeti_euphrates_terrace",
      labelTr: "Birecik – Halfeti – Bozova Fırat Vadisi & Atatürk Barajı Güneydoğu Kıyısı",
      polygonOrBbox: {
        minLat: 36.92,
        maxLat: 37.55,
        minLon: 37.8353,
        maxLon: 38.66
      },
      elevationRangeM: [340, 680],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.3
    },
    {
      id: "siverek_hilvan_basalt_plateau",
      labelTr: "Hilvan – Siverek Kuzeydoğu Bazalt Platosu (580–1150 m)",
      polygonOrBbox: {
        minLat: 37.48,
        maxLat: 38.018,
        minLon: 38.78,
        maxLon: 39.68
      },
      elevationRangeM: [580, 1150],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.34
    },
    {
      id: "karacadag_shield_summit",
      labelTr: "Karacadağ Kalkan Volkanı Kubbesi & Kayak Merkezi (1150–1957 m Tek Kar Tutucu Zirve)",
      polygonOrBbox: {
        minLat: 37.56,
        maxLat: 37.94,
        minLon: 39.62,
        maxLon: 40.05
      },
      elevationRangeM: [1150, 1957],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.02
    }
  ],
  barrierCouplingMatrix: {
    harran_akcakale_ceylanpinar_plain: {
      harran_akcakale_ceylanpinar_plain: 1.0,
      sanliurfa_piedmont_steppe: 0.72,
      bozova_halfeti_euphrates_terrace: 0.38,
      siverek_hilvan_basalt_plateau: 0.2,
      karacadag_shield_summit: 0.04
    },
    sanliurfa_piedmont_steppe: {
      harran_akcakale_ceylanpinar_plain: 0.7,
      sanliurfa_piedmont_steppe: 1.0,
      bozova_halfeti_euphrates_terrace: 0.56,
      siverek_hilvan_basalt_plateau: 0.36,
      karacadag_shield_summit: 0.08
    },
    bozova_halfeti_euphrates_terrace: {
      harran_akcakale_ceylanpinar_plain: 0.36,
      sanliurfa_piedmont_steppe: 0.56,
      bozova_halfeti_euphrates_terrace: 1.0,
      siverek_hilvan_basalt_plateau: 0.28,
      karacadag_shield_summit: 0.05
    },
    siverek_hilvan_basalt_plateau: {
      harran_akcakale_ceylanpinar_plain: 0.18,
      sanliurfa_piedmont_steppe: 0.34,
      bozova_halfeti_euphrates_terrace: 0.26,
      siverek_hilvan_basalt_plateau: 1.0,
      karacadag_shield_summit: 0.54
    },
    karacadag_shield_summit: {
      harran_akcakale_ceylanpinar_plain: 0.03,
      sanliurfa_piedmont_steppe: 0.07,
      bozova_halfeti_euphrates_terrace: 0.04,
      siverek_hilvan_basalt_plateau: 0.52,
      karacadag_shield_summit: 1.0
    }
  },
  stationOverrides: {
    "17270": {
      stationId: 17270,
      nameTr: "Şanlıurfa Merkez (WMO 17270 · DEM Onarımlı 549 m)",
      lat: 37.1608,
      lon: 38.7863,
      demElevationM: 549,
      subBasinId: "sanliurfa_piedmont_steppe",
      urbanFraction: 0.8,
      coldPoolSusceptibility: 0.26,
      verticalStratumRole: "basin_floor"
    },
    "19341": {
      stationId: 19341,
      nameTr: "Şanlıurfa Karaköprü (Kuzey Yamaç · DEM Onarımlı 693 m)",
      lat: 37.245,
      lon: 38.795,
      demElevationM: 693,
      subBasinId: "sanliurfa_piedmont_steppe",
      urbanFraction: 0.66,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "mid_slope"
    },
    "17271": {
      stationId: 17271,
      nameTr: "Şanlıurfa GAP Havalimanı (MGM 17271 / LTCS · 822 m)",
      lat: 37.4508,
      lon: 38.9022,
      demElevationM: 822,
      subBasinId: "sanliurfa_piedmont_steppe",
      urbanFraction: 0.08,
      coldPoolSusceptibility: 0.42,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    LTCS: {
      stationId: "LTCS",
      nameTr: "Şanlıurfa GAP Havalimanı (LTCS · Germüş Sırtı 822 m)",
      lat: 37.4508,
      lon: 38.9022,
      demElevationM: 822,
      subBasinId: "sanliurfa_piedmont_steppe",
      urbanFraction: 0.08,
      coldPoolSusceptibility: 0.42,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "19270": {
      stationId: 19270,
      nameTr: "Şanlıurfa Harran Ovası (GAP Sulama Tabanı · DEM Onarımlı 375 m)",
      lat: 36.8644,
      lon: 39.0314,
      demElevationM: 375,
      subBasinId: "harran_akcakale_ceylanpinar_plain",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17980": {
      stationId: 17980,
      nameTr: "Şanlıurfa Akçakale (365 m Suriye Sınır Mezopotamya Tabanı)",
      lat: 36.7276,
      lon: 38.9473,
      demElevationM: 365,
      subBasinId: "harran_akcakale_ceylanpinar_plain",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17968": {
      stationId: 17968,
      nameTr: "Şanlıurfa Ceylanpınar (360 m Habur Çöl Eşiği)",
      lat: 36.8406,
      lon: 40.0307,
      demElevationM: 360,
      subBasinId: "harran_akcakale_ceylanpinar_plain",
      urbanFraction: 0.32,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18171": {
      stationId: 18171,
      nameTr: "Şanlıurfa Suruç Ovası",
      lat: 37.0333,
      lon: 38.4125,
      demElevationM: 522,
      subBasinId: "sanliurfa_piedmont_steppe",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.4,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17946": {
      stationId: 17946,
      nameTr: "Şanlıurfa Viranşehir",
      lat: 37.2278,
      lon: 39.749,
      demElevationM: 556,
      subBasinId: "sanliurfa_piedmont_steppe",
      urbanFraction: 0.46,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17966": {
      stationId: 17966,
      nameTr: "Şanlıurfa Birecik (347 m Fırat Nehri Tabanı)",
      lat: 37.0139,
      lon: 37.9715,
      demElevationM: 347,
      subBasinId: "bozova_halfeti_euphrates_terrace",
      urbanFraction: 0.48,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18170": {
      stationId: 18170,
      nameTr: "Şanlıurfa Halfeti",
      lat: 37.2283,
      lon: 37.9461,
      demElevationM: 662,
      subBasinId: "bozova_halfeti_euphrates_terrace",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17944": {
      stationId: 17944,
      nameTr: "Şanlıurfa Bozova (Atatürk Baraj Gölü Güney Terası)",
      lat: 37.3651,
      lon: 38.5134,
      demElevationM: 622,
      subBasinId: "bozova_halfeti_euphrates_terrace",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.26,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17914": {
      stationId: 17914,
      nameTr: "Şanlıurfa Hilvan",
      lat: 37.5806,
      lon: 38.9508,
      demElevationM: 589,
      subBasinId: "siverek_hilvan_basalt_plateau",
      urbanFraction: 0.32,
      coldPoolSusceptibility: 0.32,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17912": {
      stationId: 17912,
      nameTr: "Şanlıurfa Siverek (801 m Bazalt Platosu)",
      lat: 37.7522,
      lon: 39.3291,
      demElevationM: 801,
      subBasinId: "siverek_hilvan_basalt_plateau",
      urbanFraction: 0.54,
      coldPoolSusceptibility: 0.38,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18922": {
      stationId: 18922,
      nameTr: "Şanlıurfa Karacadağ Kayak Merkezi (DEM Onarımlı 1946 m Volkan Kubbesi)",
      lat: 37.7151,
      lon: 39.8293,
      demElevationM: 1946,
      subBasinId: "karacadag_shield_summit",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.2,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [365, 550, 820, 1850],
    maxPhysicalPeakM: 1957,
    snowElevationBands: HYPSO_TR_63.bands
  },
  waterBodies: [
    {
      id: "ataturk_reservoir_bozova_arm",
      labelTr: "Atatürk Baraj Gölü Bozova–Yaslıca Güneydoğu Kolu (540 m Tatlı Su Nem/Ilımanlık Havzası)",
      kind: "fresh_lake",
      mgmMarineStationIds: [],
      sampleCoord: { lat: 37.445, lon: 38.485 },
      useOpenMeteoMarineApi: false,
      surfaceElevationM: 540,
      freezingPointC: 0.0,
      monthlyWaterTempNormalsC: [
        8.6, 8.4, 10.6, 14.5, 19.4, 24.4,
        28.0, 28.8, 25.9, 21.1, 15.4, 10.8
      ],
      subBasinInfluenceWeights: {
        bozova_halfeti_euphrates_terrace: 0.72,
        sanliurfa_piedmont_steppe: 0.16,
        siverek_hilvan_basalt_plateau: 0.12,
        harran_akcakale_ceylanpinar_plain: 0.04,
        karacadag_shield_summit: 0.0
      },
      onshoreWindSectorDeg: { fromDeg: 280, toDeg: 20 },
      effectiveFetchKm: 19,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 18.5,
      dekHeavyDeltaTC: 24.0,
      seaBreezeSpec: {
        activeMonths: [5, 10],
        sectorDeg: { fromDeg: 285, toDeg: 15 },
        maxInlandPenetrationKm: 16,
        maxCoolingAmplitudeC: 1.8
      }
    }
  ],
  directionalBarriers: [
    {
      id: "karacadag_1957m_volcanic_snow_dome",
      labelTr: "Karacadağ Kalkan Volkanı (1957 m) — Siverek–Karacadağ Kış Kar Kubbesi & GB Orografik Yükselim",
      effectiveBarrierHeightM: 1957,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "siverek_hilvan_basalt_plateau",
        "karacadag_shield_summit"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 35, toDeg: 95 },
        minCrossCrestSpeedMs: 8.0,
        minFroudeNumber: 0.45,
        sourcePlateauElevationM: 1150,
        maxTargetElevationM: 920,
        maxWarmingCapC: 2.8,
        subCloudVirgaFactor: 0.55,
        wetCutoffMmHr: 0.3
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 180, toDeg: 255 },
        minOnshoreOrUpslopeSpeedMs: 5.2,
        coastalFrictionalConvergenceBoost: 1.2,
        maxPrecipMultiplierCap: 1.56
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 40, toDeg: 95 },
        precipAttenuationFactor: 0.68
      }
    },
    {
      id: "harran_mesopotamian_virga_and_karacadag_lee",
      labelTr: "Harran – Akçakale – Ceylanpınar Düzlüğü — Kuzeydoğu Fön Kuruması & Alt-Bulut Virga Sönümü",
      effectiveBarrierHeightM: 1450,
      crestPressureHpa: 850,
      applicableSubBasins: [
        "harran_akcakale_ceylanpinar_plain",
        "sanliurfa_piedmont_steppe"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 355, toDeg: 55 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.45,
        sourcePlateauElevationM: 950,
        maxTargetElevationM: 620,
        maxWarmingCapC: 3.6,
        subCloudVirgaFactor: 0.78,
        wetCutoffMmHr: 0.2
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 175, toDeg: 230 },
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 1.06,
        maxPrecipMultiplierCap: 1.18
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 355, toDeg: 55 },
        precipAttenuationFactor: 0.58
      }
    }
  ],
  venturiCorridors: [
    {
      id: "harran_akcakale_syrian_haboob_gate",
      labelTr: "Akçakale – Harran Mezopotamya Güneyli Toz/Haboob & Basra Sıcak Akış Kanalı",
      centerCoord: { lat: 36.82, lon: 38.98 },
      influenceRadiusKm: 34,
      channelAxisFromDeg: 185,
      bidirectional: true,
      sectorHalfWidthDeg: 35,
      speedMultiplier: 1.26,
      gustMultiplier: 1.44,
      suppressesNocturnalInversion: true
    },
    {
      id: "birecik_halfeti_euphrates_corridor",
      labelTr: "Birecik – Halfeti Fırat Vadisi K–G Kanal Akışı",
      centerCoord: { lat: 37.12, lon: 37.96 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 10,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.22,
      gustMultiplier: 1.34,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 365,
    coldPoolMaxDepthM: 220,
    topographicEnclosureIndex: 0.36,
    deltaPressureTopHpa: 950,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 3.8
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.78
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.94,
    invertedVDryMicroburstSusceptibility: 0.88,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TGT_SANLIURFA_17270",
      labelTr: "Şanlıurfa Merkez (WMO 17270 · 550 m)",
      lat: 37.1608,
      lon: 38.7863,
      elevationM: 550,
      role: "target"
    },
    {
      key: "LAKE_ATATURK_BOZOVA",
      labelTr: "Atatürk Baraj Gölü Bozova Kolu (540 m)",
      lat: 37.445,
      lon: 38.485,
      elevationM: 540,
      role: "marine_upwind"
    },
    {
      key: "COR_AKCAKALE_HABOOB",
      labelTr: "Akçakale Güney Mezopotamya Kapısı (365 m)",
      lat: 36.7276,
      lon: 38.9473,
      elevationM: 365,
      role: "corridor"
    },
    {
      key: "LEE_HARRAN_GAP_PLAIN",
      labelTr: "Harran GAP Sulama Ovası (375 m)",
      lat: 36.8644,
      lon: 39.0314,
      elevationM: 375,
      role: "lee_shadow"
    },
    {
      key: "COR_BIRECIK_EUPHRATES",
      labelTr: "Birecik Fırat Nehri Boğazı (347 m)",
      lat: 37.0139,
      lon: 37.9715,
      elevationM: 347,
      role: "corridor"
    },
    {
      key: "FOE_LTCS_GERMUS_RIDGE",
      labelTr: "Şanlıurfa GAP Havalimanı (LTCS · 822 m)",
      lat: 37.4508,
      lon: 38.9022,
      elevationM: 822,
      role: "foehn_windward"
    },
    {
      key: "ORO_SIVEREK_PLATEAU",
      labelTr: "Siverek Bazalt Platosu (801 m)",
      lat: 37.7522,
      lon: 39.3291,
      elevationM: 801,
      role: "orographic_wall"
    },
    {
      key: "ORO_KARACADAG_DOME",
      labelTr: "Karacadağ Kalkan Volkanı Zirvesi (1946 m)",
      lat: 37.7151,
      lon: 39.8293,
      elevationM: 1946,
      role: "orographic_wall"
    },
    {
      key: "LEE_CEYLANPINAR_STEPPE",
      labelTr: "Ceylanpınar Doğu Bozkır Düzlüğü (360 m)",
      lat: 36.8406,
      lon: 40.0307,
      elevationM: 360,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -18,
    maxPlausibleTempC: 49,
    minPlausibleMslpHpa: 980,
    maxPlausibleMslpHpa: 1044,
    kalmanTempBiasCapC: 5.2
  }
};

export const PROVINCE_SPEC_TR_63: ProvinceSpec = deepFreeze(SPEC_TR_63);
export default PROVINCE_SPEC_TR_63;
