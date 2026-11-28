import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_49 = TR81_CLIMATOLOGY_1991_2020["TR-49"];
const HYPSO_TR_49 = TR81_HYPSOMETRIC_PROFILES["TR-49"];

/**
 * ATMOS v5.0 — Wave 3C (REG-19) Bespoke Microclimate Spec: TR-49 Muş
 *
 * Key Physical Mechanisms:
 *  1. Muş Ovası Closed Alluvial Cold-Pool & Freezing-Fog Trap (`1,250–1,330 m`):
 *     Ringed on all sides by Kurtik/Haçreş (`2,963 m`), Şerafettin (`2,544 m`), and the Rahva
 *     threshold (`~1,800 m`), `topographicEnclosureIndex: 0.93` traps dense winter radiative
 *     cold pools (`maxExtraRadiativeCoolingC: 7.2°C` over snowpack) and multi-day freezing fog
 *     (`persistentStratusLock` with `daytimeSolarDampingFactor: 0.54`).
 *  2. Rural Alluvial Airport (`LTCK`, `1,267 m`) vs Foothill Muş Merkez (`1,316–1,420 m`):
 *     `LTCK` sits directly on the flat Murat–Karasu flood plain where nocturnal inversions pool
 *     severely (`coldPoolSusceptibility: 0.96`), requiring Oke/basin-escape unbiasing for
 *     southern Kurtik foothill neighborhoods.
 *  3. Bulanık – Malazgirt High NE Steppe Plateau (`~1,480–1,550 m`) & Varto Highland Rim:
 *     Exposed to Siberian/Ağrı NE cold outbreaks while decoupled from inner Muş Ovası fog locks.
 */
const SPEC_TR_49: ProvinceSpec = {
  provinceCode: "TR-49",
  plateCode: 49,
  slug: "mus",
  nameTr: "Muş",
  region: "EASTERN_ANATOLIA",
  climateRegion: "DOGU_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "HIGH_EAST_SNOW_BASIN",
  icaoWhitelist: ["LTCK"],
  domainBounds: {
    minLat: 38.4832,
    maxLat: 39.538,
    minLon: 41.1045,
    maxLon: 42.7125
  },
  primaryCenter: {
    mgmMerkezId: 94901,
    mgmIstNo: 17204,
    mgmSaatlikIstNo: 17204,
    mgmGunlukIstNo: 94901,
    wmoId: "17204",
    lat: 38.7509,
    lon: 41.5023,
    demVerifiedElevationM: 1316,
    subBasinId: "mus_alluvial_cold_basin",
    urbanFraction: 0.52,
    monthlyTmaxNormalsC: CLIM_TR_49.tmaxC,
    monthlyTminNormalsC: CLIM_TR_49.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-49-mus-ova-tabani-ltck",
      name: "Muş Ovası Tabanı (LTCK / Sungu – Hasköy · 1.267 m)",
      role: "plain",
      lat: 38.7478,
      lon: 41.6612,
      elevationM: 1267
    },
    {
      id: "tr-49-mus-merkez",
      name: "Muş Merkez · Etek Kuşağı (WMO 17204)",
      role: "plain",
      lat: 38.7509,
      lon: 41.5023,
      elevationM: 1316
    },
    {
      id: "tr-49-bulanik-malazgirt",
      name: "Malazgirt – Bulanık Kuzeydoğu Platosu",
      role: "foothill",
      lat: 39.1436,
      lon: 42.5308,
      elevationM: 1515
    },
    {
      id: "tr-49-varto",
      name: "Varto (Bingöl – Şerafettin Dağ Eteği)",
      role: "foothill",
      lat: 39.1763,
      lon: 41.4455,
      elevationM: 1500
    },
    {
      id: "tr-49-guzeltepe-kurtik-zirve",
      name: "Güzeltepe Kayak Merkezi & Kurtik Dağı Yamacı",
      role: "summit",
      lat: 38.685,
      lon: 41.435,
      elevationM: 2280
    }
  ],
  subBasins: [
    {
      id: "mus_alluvial_cold_basin",
      labelTr: "Muş Ovası Dev Alüvyal Ayaz & Donan Sis Çanağı (Merkez – LTCK – Hasköy – Korkut)",
      polygonOrBbox: { minLat: 38.64, maxLat: 38.92, minLon: 41.32, maxLon: 42.02 },
      elevationRangeM: [1245, 1410],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.38
    },
    {
      id: "bulanik_malazgirt_high_plain",
      labelTr: "Bulanık – Malazgirt Kuzeydoğu Yüksek Platosu (1460–1780m)",
      polygonOrBbox: { minLat: 38.92, maxLat: 39.42, minLon: 41.95, maxLon: 42.7125 },
      elevationRangeM: [1440, 1780],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.24
    },
    {
      id: "varto_bingol_foothill",
      labelTr: "Varto – Şerafettin & Bingöl Dağları Kuzeybatı Kuşağı",
      polygonOrBbox: { minLat: 39.02, maxLat: 39.538, minLon: 41.1045, maxLon: 41.95 },
      elevationRangeM: [1450, 2850],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.18
    },
    {
      id: "kurtik_south_mountain_wall",
      labelTr: "Kurtik Dağı & Güzeltepe Güneydoğu Toros Yamacı (1420–2963m)",
      polygonOrBbox: { minLat: 38.4832, maxLat: 38.69, minLon: 41.15, maxLon: 42.05 },
      elevationRangeM: [1420, 2963],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.12
    }
  ],
  barrierCouplingMatrix: {
    mus_alluvial_cold_basin: {
      mus_alluvial_cold_basin: 1.0,
      bulanik_malazgirt_high_plain: 0.36,
      varto_bingol_foothill: 0.28,
      kurtik_south_mountain_wall: 0.24
    },
    bulanik_malazgirt_high_plain: {
      mus_alluvial_cold_basin: 0.36,
      bulanik_malazgirt_high_plain: 1.0,
      varto_bingol_foothill: 0.52,
      kurtik_south_mountain_wall: 0.18
    },
    varto_bingol_foothill: {
      mus_alluvial_cold_basin: 0.28,
      bulanik_malazgirt_high_plain: 0.52,
      varto_bingol_foothill: 1.0,
      kurtik_south_mountain_wall: 0.22
    },
    kurtik_south_mountain_wall: {
      mus_alluvial_cold_basin: 0.24,
      bulanik_malazgirt_high_plain: 0.18,
      varto_bingol_foothill: 0.22,
      kurtik_south_mountain_wall: 1.0
    }
  },
  stationOverrides: {
    "17204": {
      stationId: 17204,
      nameTr: "Muş Merkez (WMO 17204)",
      lat: 38.7509,
      lon: 41.5023,
      demElevationM: 1316,
      subBasinId: "mus_alluvial_cold_basin",
      urbanFraction: 0.52,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "basin_floor"
    },
    LTCK: {
      stationId: "LTCK",
      nameTr: "Muş Sultan Alparslan Havalimanı (LTCK · Ova Tabanı)",
      lat: 38.7478,
      lon: 41.6612,
      demElevationM: 1267,
      subBasinId: "mus_alluvial_cold_basin",
      urbanFraction: 0.12,
      coldPoolSusceptibility: 0.96,
      verticalStratumRole: "basin_floor"
    },
    "19094": {
      stationId: 19094,
      nameTr: "Hasköy",
      lat: 38.6823,
      lon: 41.6897,
      demElevationM: 1298,
      subBasinId: "mus_alluvial_cold_basin",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.9,
      verticalStratumRole: "basin_floor"
    },
    "18582": {
      stationId: 18582,
      nameTr: "Korkut",
      lat: 38.7178,
      lon: 41.86,
      demElevationM: 1325,
      subBasinId: "mus_alluvial_cold_basin",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor"
    },
    "18581": {
      stationId: 18581,
      nameTr: "Bulanık",
      lat: 39.0961,
      lon: 42.2617,
      demElevationM: 1480,
      subBasinId: "bulanik_malazgirt_high_plain",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17780": {
      stationId: 17780,
      nameTr: "Malazgirt",
      lat: 39.1436,
      lon: 42.5308,
      demElevationM: 1515,
      subBasinId: "bulanik_malazgirt_high_plain",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.76,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17778": {
      stationId: 17778,
      nameTr: "Varto",
      lat: 39.1763,
      lon: 41.4455,
      demElevationM: 1500,
      subBasinId: "varto_bingol_foothill",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.64,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [1255, 1675, 2200, 2963],
    maxPhysicalPeakM: HYPSO_TR_49.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_49.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "kurtik_south_taurus_barrier_mus",
      labelTr: "Kurtik & Haçreş Dağları (2963m) Güney Cephe Kar Duvarı ve Ova Gölgeleme Hattı",
      effectiveBarrierHeightM: 2750,
      crestPressureHpa: 700,
      applicableSubBasins: ["kurtik_south_mountain_wall", "mus_alluvial_cold_basin"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 170, toDeg: 225 },
        minCrossCrestSpeedMs: 12.0,
        minFroudeNumber: 0.85,
        sourcePlateauElevationM: 950,
        maxTargetElevationM: 1380,
        maxWarmingCapC: 3.0,
        subCloudVirgaFactor: 0.58,
        wetCutoffMmHr: 1.4
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 155, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 1.18,
        maxPrecipMultiplierCap: 1.82
      }
    },
    {
      id: "serafettin_varto_north_rim",
      labelTr: "Şerafettin & Bingöl Dağları Kuzey Kar-Tipi Kalkanı",
      effectiveBarrierHeightM: 2650,
      crestPressureHpa: 750,
      applicableSubBasins: ["varto_bingol_foothill", "bulanik_malazgirt_high_plain"],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 0, toDeg: 10 },
        minCrossCrestSpeedMs: 25,
        minFroudeNumber: 1.5,
        sourcePlateauElevationM: 1900,
        maxTargetElevationM: 1450,
        maxWarmingCapC: 1.0,
        subCloudVirgaFactor: 0.4,
        wetCutoffMmHr: 2.0
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 145, toDeg: 245 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.16,
        maxPrecipMultiplierCap: 1.76
      }
    }
  ],
  venturiCorridors: [
    {
      id: "rahva_korkut_easterly_spill_jet",
      labelTr: "Rahva Eşiği – Korkut – Hasköy Doğu Soğuk Hava Taşma Oluğu",
      centerCoord: { lat: 38.69, lon: 41.88 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 105,
      bidirectional: true,
      sectorHalfWidthDeg: 22,
      speedMultiplier: 1.25,
      gustMultiplier: 1.35,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1255,
    coldPoolMaxDepthM: 420,
    topographicEnclosureIndex: 0.93,
    deltaPressureTopHpa: 825,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 7.2
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.54
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 35, toDeg: 135 },
      minWindShearVs850Deg: 45
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.5,
    invertedVDryMicroburstSusceptibility: 0.34,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "center_mus_17204",
      labelTr: "Muş Merkez (WMO 17204)",
      lat: 38.7509,
      lon: 41.5023,
      elevationM: 1316,
      role: "target"
    },
    {
      key: "ltck_ova_cold_floor",
      labelTr: "Muş Ovası Alüvyal Taban (LTCK)",
      lat: 38.7478,
      lon: 41.6612,
      elevationM: 1267,
      role: "lee_shadow"
    },
    {
      key: "haskoy_se_plain",
      labelTr: "Hasköy – Karasu Çukuru",
      lat: 38.6823,
      lon: 41.6897,
      elevationM: 1298,
      role: "lee_shadow"
    },
    {
      key: "korkut_east_corridor",
      labelTr: "Korkut Doğu Ova Çıkışı",
      lat: 38.7178,
      lon: 41.86,
      elevationM: 1325,
      role: "corridor"
    },
    {
      key: "kurtik_guzeltepe_south_wall",
      labelTr: "Kurtik Dağı & Güzeltepe Kayak Sırtı",
      lat: 38.685,
      lon: 41.435,
      elevationM: 2280,
      role: "orographic_wall"
    },
    {
      key: "south_taurus_windward_slope",
      labelTr: "Üçevler – Kurtik Güneybatı Rüzgar-Üstü Yamaç",
      lat: 38.645,
      lon: 41.36,
      elevationM: 2150,
      role: "foehn_windward"
    },
    {
      key: "varto_nw_foothill",
      labelTr: "Varto Kuzeybatı Etek",
      lat: 39.1763,
      lon: 41.4455,
      elevationM: 1500,
      role: "orographic_wall"
    },
    {
      key: "bulanik_ne_plateau",
      labelTr: "Bulanık Kuzeydoğu Platosu",
      lat: 39.0961,
      lon: 42.2617,
      elevationM: 1480,
      role: "corridor"
    },
    {
      key: "malazgirt_east_steppe",
      labelTr: "Malazgirt Yüksek Ova",
      lat: 39.1436,
      lon: 42.5308,
      elevationM: 1515,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -42,
    maxPlausibleTempC: 42,
    minPlausibleMslpHpa: 970,
    maxPlausibleMslpHpa: 1064,
    kalmanTempBiasCapC: 4.5
  }
};

export const PROVINCE_SPEC_TR_49: ProvinceSpec = Object.freeze(SPEC_TR_49);
export default PROVINCE_SPEC_TR_49;
