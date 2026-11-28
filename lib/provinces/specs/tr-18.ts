import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_18 = TR81_CLIMATOLOGY_1991_2020["TR-18"];
const HYPSO_TR_18 = TR81_HYPSOMETRIC_PROFILES["TR-18"];

/**
 * ATMOS v5.0 — Wave 3B (REG-09) Bespoke Microclimate Spec: TR-18 Çankırı
 *
 * Key Physical Mechanisms:
 *  1. Ilgaz Massif (Büyükhacet 2,587 m) Southern Rain Shadow & Lee Foehn Drying:
 *     Northerly / NW Black Sea airmasses (`330°–45°`) lose moisture over Küre and Ilgaz,
 *     placing the Çankırı–Kızılırmak steppe in a pronounced precipitation shadow (`0.56x`)
 *     with dry-adiabatic lee compression.
 *  2. Acıçay – Tatlıçay – Kızılırmak Salt-Steppe Bowl (`560–755 m`) Extreme Continentality:
 *     Enclosed gypsum/salt valley floor (`WMO 17080`, `751 m`) traps severe winter radiative
 *     cold pools and snow-albedo inversions (`minPlausibleTempC: -32`) while heating intensely
 *     in summer (`maxPlausibleTempC: 44`).
 *  3. Çerkeş – Atkaracalar – Kurşunlu – Ilgaz Northern Tectonic Frost Trench (`885–1,450 m`)
 *     vs. Yıldıztepe Ski / Yapraklı Alpine Rim (`1,488–2,587 m`).
 */
const SPEC_TR_18: ProvinceSpec = {
  provinceCode: "TR-18",
  plateCode: 18,
  slug: "cankiri",
  nameTr: "Çankırı",
  region: "CENTRAL_ANATOLIA",
  climateRegion: "IC_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "CENTRAL_ANATOLIA_BASIN",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 40.2548,
    maxLat: 41.0892,
    minLon: 32.5692,
    maxLon: 34.1658
  },
  primaryCenter: {
    mgmMerkezId: 91801,
    mgmIstNo: 17080,
    mgmSaatlikIstNo: 17080,
    mgmGunlukIstNo: 91801,
    wmoId: "17080",
    lat: 40.6082,
    lon: 33.6102,
    demVerifiedElevationM: 751,
    subBasinId: "acicay_kizilirmak_salt_trough",
    urbanFraction: 0.56,
    monthlyTmaxNormalsC: CLIM_TR_18.tmaxC,
    monthlyTminNormalsC: CLIM_TR_18.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-18-kizilirmak-taban",
      name: "Kızılırmak Alt Bozkır Vadisi (574 m)",
      role: "plain",
      lat: 40.3436,
      lon: 33.9839,
      elevationM: 574
    },
    {
      id: "tr-18-cankiri-merkez",
      name: "Çankırı Merkez (WMO 17080 · Acıçay Çanağı)",
      role: "plain",
      lat: 40.6082,
      lon: 33.6102,
      elevationM: 751
    },
    {
      id: "tr-18-cerkes-kursunlu-koridor",
      name: "Çerkeş – Kurşunlu Kuzey Ayaz Koridoru",
      role: "foothill",
      lat: 40.815,
      lon: 32.8831,
      elevationM: 1126
    },
    {
      id: "tr-18-yaprakli-yaylasi",
      name: "Yapraklı Yaylası",
      role: "foothill",
      lat: 40.756,
      lon: 33.7774,
      elevationM: 1267
    },
    {
      id: "tr-18-ilgaz-yildiztepe",
      name: "Ilgaz Yıldıztepe Kayak Merkezi / Büyükhacet Eteği",
      role: "summit",
      lat: 41.0371,
      lon: 33.7899,
      elevationM: 1850
    }
  ],
  subBasins: [
    {
      id: "acicay_kizilirmak_salt_trough",
      labelTr: "Çankırı Merkez – Acıçay – Kızılırmak Tuz ve Bozkır Çanağı (560–860 m)",
      polygonOrBbox: { minLat: 40.2548, maxLat: 40.69, minLon: 33.42, maxLon: 34.1658 },
      elevationRangeM: [550, 860],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.44
    },
    {
      id: "cerkes_kursunlu_devrez_corridor",
      labelTr: "Çerkeş – Atkaracalar – Kurşunlu – Ilgaz Kuzey Tektonik Ayaz Koridoru",
      polygonOrBbox: { minLat: 40.78, maxLat: 40.98, minLon: 32.5692, maxLon: 33.72 },
      elevationRangeM: [840, 1500],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.24
    },
    {
      id: "orta_sabanozu_eldivan_plateau",
      labelTr: "Orta – Şabanözü – Eldivan – Korgun Batı İç Plato Kuşağı",
      polygonOrBbox: { minLat: 40.42, maxLat: 40.78, minLon: 32.85, maxLon: 33.54 },
      elevationRangeM: [880, 1480],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.22
    },
    {
      id: "ilgaz_south_alpine_wall",
      labelTr: "Ilgaz Yıldıztepe – Büyükhacet Güney Yüzü & Yapraklı Yayla Kuşağı",
      polygonOrBbox: { minLat: 40.72, maxLat: 41.0892, minLon: 33.52, maxLon: 34.05 },
      elevationRangeM: [1250, 2587],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.06
    }
  ],
  barrierCouplingMatrix: {
    acicay_kizilirmak_salt_trough: {
      acicay_kizilirmak_salt_trough: 1.0,
      cerkes_kursunlu_devrez_corridor: 0.34,
      orta_sabanozu_eldivan_plateau: 0.58,
      ilgaz_south_alpine_wall: 0.18
    },
    cerkes_kursunlu_devrez_corridor: {
      acicay_kizilirmak_salt_trough: 0.34,
      cerkes_kursunlu_devrez_corridor: 1.0,
      orta_sabanozu_eldivan_plateau: 0.62,
      ilgaz_south_alpine_wall: 0.46
    },
    orta_sabanozu_eldivan_plateau: {
      acicay_kizilirmak_salt_trough: 0.58,
      cerkes_kursunlu_devrez_corridor: 0.62,
      orta_sabanozu_eldivan_plateau: 1.0,
      ilgaz_south_alpine_wall: 0.32
    },
    ilgaz_south_alpine_wall: {
      acicay_kizilirmak_salt_trough: 0.18,
      cerkes_kursunlu_devrez_corridor: 0.46,
      orta_sabanozu_eldivan_plateau: 0.32,
      ilgaz_south_alpine_wall: 1.0
    }
  },
  stationOverrides: {
    "17080": {
      stationId: 17080,
      nameTr: "Çankırı Merkez (WMO 17080)",
      lat: 40.6082,
      lon: 33.6102,
      demElevationM: 751,
      subBasinId: "acicay_kizilirmak_salt_trough",
      urbanFraction: 0.56,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor"
    },
    "18079": {
      stationId: 18079,
      nameTr: "Kızılırmak",
      lat: 40.3436,
      lon: 33.9839,
      demElevationM: 574,
      subBasinId: "acicay_kizilirmak_salt_trough",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17646": {
      stationId: 17646,
      nameTr: "Çerkeş (Ayaz Çanağı)",
      lat: 40.815,
      lon: 32.8831,
      demElevationM: 1126,
      subBasinId: "cerkes_kursunlu_devrez_corridor",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.95,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18249": {
      stationId: 18249,
      nameTr: "Atkaracalar",
      lat: 40.8206,
      lon: 33.08,
      demElevationM: 1292,
      subBasinId: "cerkes_kursunlu_devrez_corridor",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17643": {
      stationId: 17643,
      nameTr: "Kurşunlu",
      lat: 40.8328,
      lon: 33.2691,
      demElevationM: 1075,
      subBasinId: "cerkes_kursunlu_devrez_corridor",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.8,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17648": {
      stationId: 17648,
      nameTr: "Ilgaz İlçe (Devrez Vadisi)",
      lat: 40.9156,
      lon: 33.6258,
      demElevationM: 885,
      subBasinId: "cerkes_kursunlu_devrez_corridor",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18251": {
      stationId: 18251,
      nameTr: "Bayramören",
      lat: 40.9289,
      lon: 33.2425,
      demElevationM: 1450,
      subBasinId: "cerkes_kursunlu_devrez_corridor",
      urbanFraction: 0.12,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18253": {
      stationId: 18253,
      nameTr: "Orta",
      lat: 40.6322,
      lon: 33.0769,
      demElevationM: 1321,
      subBasinId: "orta_sabanozu_eldivan_plateau",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17665": {
      stationId: 17665,
      nameTr: "Şabanözü",
      lat: 40.4742,
      lon: 33.2857,
      demElevationM: 1060,
      subBasinId: "orta_sabanozu_eldivan_plateau",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.74,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18080": {
      stationId: 18080,
      nameTr: "Eldivan",
      lat: 40.535,
      lon: 33.495,
      demElevationM: 923,
      subBasinId: "orta_sabanozu_eldivan_plateau",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18252": {
      stationId: 18252,
      nameTr: "Korgun",
      lat: 40.7369,
      lon: 33.5044,
      demElevationM: 1042,
      subBasinId: "orta_sabanozu_eldivan_plateau",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17647": {
      stationId: 17647,
      nameTr: "Yapraklı",
      lat: 40.756,
      lon: 33.7774,
      demElevationM: 1267,
      subBasinId: "ilgaz_south_alpine_wall",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17982": {
      stationId: 17982,
      nameTr: "Ilgaz Yıldıztepe Kayak Merkezi",
      lat: 41.0371,
      lon: 33.7899,
      demElevationM: 1488,
      subBasinId: "ilgaz_south_alpine_wall",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [560, 751, 1350, 2587],
    maxPhysicalPeakM: HYPSO_TR_18.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_18.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "ilgaz_south_rain_shadow_steppe",
      labelTr: "Ilgaz Dağları (2587m) Güney Yağış Gölgesi & Kuzeyli Fön Kurutması",
      effectiveBarrierHeightM: 2587,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "acicay_kizilirmak_salt_trough",
        "cerkes_kursunlu_devrez_corridor",
        "orta_sabanozu_eldivan_plateau"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 340, toDeg: 35 },
        minCrossCrestSpeedMs: 10.0,
        minFroudeNumber: 0.88,
        sourcePlateauElevationM: 800,
        maxTargetElevationM: 1150,
        maxWarmingCapC: 3.4,
        subCloudVirgaFactor: 0.78,
        wetCutoffMmHr: 1.2
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 230 },
        minOnshoreOrUpslopeSpeedMs: 7.0,
        coastalFrictionalConvergenceBoost: 1.08,
        maxPrecipMultiplierCap: 1.42
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 330, toDeg: 45 },
        precipAttenuationFactor: 0.56
      }
    },
    {
      id: "ilgaz_yildiztepe_alpine_snow_wall",
      labelTr: "Ilgaz Yıldıztepe – Büyükhacet Yüksek Alpin Kar Yakalama Sırtı",
      effectiveBarrierHeightM: 2587,
      crestPressureHpa: 750,
      applicableSubBasins: ["ilgaz_south_alpine_wall"],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 180, toDeg: 220 },
        minCrossCrestSpeedMs: 15.0,
        minFroudeNumber: 1.2,
        sourcePlateauElevationM: 750,
        maxTargetElevationM: 1200,
        maxWarmingCapC: 1.5,
        subCloudVirgaFactor: 0.9,
        wetCutoffMmHr: 1.0
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 160, toDeg: 235 },
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.15,
        maxPrecipMultiplierCap: 1.68
      }
    }
  ],
  venturiCorridors: [
    {
      id: "devrez_cerkes_ilgaz_tectonic_channel",
      labelTr: "Çerkeş – Kurşunlu – Ilgaz Kuzey Anadolu Fayı Rüzgar Oluğu",
      centerCoord: { lat: 40.86, lon: 33.32 },
      influenceRadiusKm: 32,
      channelAxisFromDeg: 75,
      bidirectional: true,
      sectorHalfWidthDeg: 24,
      speedMultiplier: 1.22,
      gustMultiplier: 1.32,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 730,
    coldPoolMaxDepthM: 340,
    topographicEnclosureIndex: 0.78,
    deltaPressureTopHpa: 915,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 2.0,
      maxExtraRadiativeCoolingC: 5.8
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.62
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 350, toDeg: 75 },
      minWindShearVs850Deg: 50
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.56,
    invertedVDryMicroburstSusceptibility: 0.72,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "cankiri_center_17080",
      labelTr: "Çankırı Merkez (WMO 17080 · Acıçay Havzası)",
      lat: 40.6082,
      lon: 33.6102,
      elevationM: 751,
      role: "target"
    },
    {
      key: "kizilirmak_south_steppe",
      labelTr: "Kızılırmak Güney Tuz Bozkırı",
      lat: 40.3436,
      lon: 33.9839,
      elevationM: 574,
      role: "lee_shadow"
    },
    {
      key: "sabanozu_southwest_inflow",
      labelTr: "Şabanözü Güneybatı Giriş Eşiği",
      lat: 40.4742,
      lon: 33.2857,
      elevationM: 1060,
      role: "foehn_windward"
    },
    {
      key: "orta_west_plateau",
      labelTr: "Orta Batı Volkanik Plato",
      lat: 40.6322,
      lon: 33.0769,
      elevationM: 1321,
      role: "corridor"
    },
    {
      key: "cerkes_frost_trench",
      labelTr: "Çerkeş Tektonik Ayaz Çanağı",
      lat: 40.815,
      lon: 32.8831,
      elevationM: 1126,
      role: "corridor"
    },
    {
      key: "kursunlu_devrez_corridor",
      labelTr: "Kurşunlu – Devrez Oluk Hattı",
      lat: 40.8328,
      lon: 33.2691,
      elevationM: 1075,
      role: "corridor"
    },
    {
      key: "ilgaz_valley_shadow",
      labelTr: "Ilgaz İlçe Güney Etek Gölgesi",
      lat: 40.9156,
      lon: 33.6258,
      elevationM: 885,
      role: "lee_shadow"
    },
    {
      key: "yildiztepe_ilgaz_crest",
      labelTr: "Ilgaz Yıldıztepe / Büyükhacet Zirve Duvarı",
      lat: 41.0371,
      lon: 33.7899,
      elevationM: 1850,
      role: "orographic_wall"
    },
    {
      key: "yaprakli_east_highland",
      labelTr: "Yapraklı Yaylası Doğu Sırtı",
      lat: 40.756,
      lon: 33.7774,
      elevationM: 1267,
      role: "orographic_wall"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -32,
    maxPlausibleTempC: 44,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 4.2
  }
};

export const PROVINCE_SPEC_TR_18: ProvinceSpec = Object.freeze(SPEC_TR_18);
export default PROVINCE_SPEC_TR_18;
