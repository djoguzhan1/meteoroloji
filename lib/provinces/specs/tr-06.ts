import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_06 = TR81_CLIMATOLOGY_1991_2020["TR-06"];
const HYPSO_TR_06 = TR81_HYPSOMETRIC_PROFILES["TR-06"];

export const TR_06_BESPOKE_MODIFIERS = Object.freeze({
  allowedMetarIcaos: ["LTAC", "LTAB", "LTAD"] as const,
  coldBasinAirportIcaos: ["LTAC"] as const,
  esenbogaNocturnalColdBiasVsUrbanC: 5.5,
  incekFirstSnowThresholdElevationM: 1060
});

/**
 * ATMOS v5.0 — Wave 3B (REG-13) Bespoke Microclimate Spec: TR-06 Ankara
 *
 * Key Physical & Synoptic Mechanisms:
 *  1. Esenboğa (`LTAC`, Çubuk Ovası 949 m) vs Ankara Merkez (`17130` Kalaba 891 m) Decoupling:
 *     Ankara urban core (`urbanFraction: 0.85`) retains strong Oke (1987) nocturnal UHI warmth,
 *     whereas `LTAC` sits 26 km NE in the enclosed rural Çubuk frost basin (`coldPoolSusceptibility: 0.88`,
 *     `excludeFromCenterHeadline: true`), dropping 4–7°C colder on calm clear winter nights.
 *  2. İncek – Oran – Gölbaşı Southern Plateau (`1,050–1,180 m`) & Elmadağ (`1,750–1,862 m`):
 *     200–300 m higher than Kızılay/Etimesgut (`806–891 m`), acting as the capital's primary
 *     wet-bulb 0°C phase-transition shelf where valley rain turns to accumulating snow first.
 *  3. Polatlı – Beypazarı Western Steppe vs Kızılcahamam – Çamlıdere Northern Black Sea Transition:
 *     Işık Dağı / Köroğlu ridges (`2,034 m`) capture moist northerly Black Sea spillover snow in
 *     Kızılcahamam–Çamlıdere while casting a continental lee shadow across Polatlı & central Ankara.
 *  4. Strictly Continental (`waterBodies: []` — ZERO sea-effect DEK).
 */
const SPEC_TR_06: ProvinceSpec = {
  provinceCode: "TR-06",
  plateCode: 6,
  slug: "ankara",
  nameTr: "Ankara",
  region: "CENTRAL_ANATOLIA",
  climateRegion: "IC_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "CENTRAL_ANATOLIA_BASIN",
  icaoWhitelist: ["LTAC", "LTAB", "LTAD"],
  domainBounds: {
    minLat: 38.662,
    maxLat: 40.752,
    minLon: 30.836,
    maxLon: 33.8852
  },
  primaryCenter: {
    mgmMerkezId: 90601,
    mgmIstNo: 17130,
    mgmSaatlikIstNo: 17130,
    mgmGunlukIstNo: 90601,
    wmoId: "17130",
    lat: 39.9727,
    lon: 32.8637,
    demVerifiedElevationM: 891,
    subBasinId: "ankara_urban_bowl",
    urbanFraction: 0.85,
    monthlyTmaxNormalsC: CLIM_TR_06.tmaxC,
    monthlyTminNormalsC: CLIM_TR_06.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-06-polatli-bozkir",
      name: "Polatlı – Sakarya Batı Bozkırı",
      role: "plain",
      lat: 39.5834,
      lon: 32.1624,
      elevationM: 886
    },
    {
      id: "tr-06-cubuk-esenboga",
      name: "Çubuk Ovası – Esenboğa Ayaz Çanağı",
      role: "plain",
      lat: 40.1281,
      lon: 32.995,
      elevationM: 949
    },
    {
      id: "tr-06-incek-golbasi",
      name: "İncek – Gölbaşı Güney Platosu (İlk Kar Kuşağı)",
      role: "foothill",
      lat: 39.8032,
      lon: 32.8434,
      elevationM: 1115
    },
    {
      id: "tr-06-kizilcahamam-camlidere",
      name: "Kızılcahamam – Çamlıdere Kuzey Geçiş Kuşağı",
      role: "foothill",
      lat: 40.4729,
      lon: 32.6441,
      elevationM: 1033
    },
    {
      id: "tr-06-elmadag-kayak",
      name: "Elmadağ Kayak Merkezi (1750–1862 m)",
      role: "summit",
      lat: 39.7981,
      lon: 32.9706,
      elevationM: 1750
    }
  ],
  subBasins: [
    {
      id: "ankara_urban_bowl",
      labelTr: "Ankara Kentsel Çanağı (Kalaba – Çankaya – Yenimahalle – Etimesgut – Sincan)",
      polygonOrBbox: {
        minLat: 39.88,
        maxLat: 40.04,
        minLon: 32.54,
        maxLon: 33.02
      },
      elevationRangeM: [800, 980],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.85
    },
    {
      id: "cubuk_esenboga_frost_basin",
      labelTr: "Çubuk Ovası – Esenboğa (LTAC 949 m) – Akyurt Kırsal Ayaz Çanağı",
      polygonOrBbox: {
        minLat: 40.06,
        maxLat: 40.36,
        minLon: 32.88,
        maxLon: 33.24
      },
      elevationRangeM: [935, 1180],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.08
    },
    {
      id: "incek_golbasi_south_plateau",
      labelTr: "İncek – Oran – Gölbaşı – Haymana Güney Yüksek Platosu (1050–1280 m)",
      polygonOrBbox: {
        minLat: 39.38,
        maxLat: 39.88,
        minLon: 32.45,
        maxLon: 33.05
      },
      elevationRangeM: [1040, 1320],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.44
    },
    {
      id: "polatli_beypazari_steppe",
      labelTr: "Polatlı – Beypazarı – Nallıhan Batı Bozkır ve Sakarya Oluğu",
      polygonOrBbox: {
        minLat: 39.42,
        maxLat: 40.26,
        minLon: 31.15,
        maxLon: 32.45
      },
      elevationRangeM: [620, 940],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.28
    },
    {
      id: "kizilcahamam_camlidere_north",
      labelTr: "Kızılcahamam – Çamlıdere Karadeniz Orman Geçiş Kuşağı",
      polygonOrBbox: {
        minLat: 40.34,
        maxLat: 40.72,
        minLon: 32.28,
        maxLon: 32.88
      },
      elevationRangeM: [980, 1650],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.16
    },
    {
      id: "elmadag_isik_alpine",
      labelTr: "Elmadağ (1750–1862 m) & Işık Dağı (2034 m) Alpin Kuşağı",
      polygonOrBbox: {
        minLat: 39.74,
        maxLat: 39.96,
        minLon: 32.92,
        maxLon: 33.28
      },
      elevationRangeM: [1420, 2034],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.03
    }
  ],
  barrierCouplingMatrix: {
    ankara_urban_bowl: {
      ankara_urban_bowl: 1.0,
      cubuk_esenboga_frost_basin: 0.22,
      incek_golbasi_south_plateau: 0.56,
      polatli_beypazari_steppe: 0.44,
      kizilcahamam_camlidere_north: 0.24,
      elmadag_isik_alpine: 0.26
    },
    cubuk_esenboga_frost_basin: {
      ankara_urban_bowl: 0.18,
      cubuk_esenboga_frost_basin: 1.0,
      incek_golbasi_south_plateau: 0.2,
      polatli_beypazari_steppe: 0.16,
      kizilcahamam_camlidere_north: 0.42,
      elmadag_isik_alpine: 0.28
    },
    incek_golbasi_south_plateau: {
      ankara_urban_bowl: 0.54,
      cubuk_esenboga_frost_basin: 0.2,
      incek_golbasi_south_plateau: 1.0,
      polatli_beypazari_steppe: 0.42,
      kizilcahamam_camlidere_north: 0.18,
      elmadag_isik_alpine: 0.58
    },
    polatli_beypazari_steppe: {
      ankara_urban_bowl: 0.44,
      cubuk_esenboga_frost_basin: 0.16,
      incek_golbasi_south_plateau: 0.42,
      polatli_beypazari_steppe: 1.0,
      kizilcahamam_camlidere_north: 0.28,
      elmadag_isik_alpine: 0.16
    },
    kizilcahamam_camlidere_north: {
      ankara_urban_bowl: 0.24,
      cubuk_esenboga_frost_basin: 0.42,
      incek_golbasi_south_plateau: 0.18,
      polatli_beypazari_steppe: 0.28,
      kizilcahamam_camlidere_north: 1.0,
      elmadag_isik_alpine: 0.36
    },
    elmadag_isik_alpine: {
      ankara_urban_bowl: 0.24,
      cubuk_esenboga_frost_basin: 0.26,
      incek_golbasi_south_plateau: 0.58,
      polatli_beypazari_steppe: 0.16,
      kizilcahamam_camlidere_north: 0.36,
      elmadag_isik_alpine: 1.0
    }
  },
  stationOverrides: {
    "17130": {
      stationId: 17130,
      nameTr: "Ankara Bölge – Keçiören Kalaba (WMO 17130)",
      lat: 39.9727,
      lon: 32.8637,
      demElevationM: 891,
      subBasinId: "ankara_urban_bowl",
      urbanFraction: 0.85,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "basin_floor"
    },
    LTAC: {
      stationId: "LTAC",
      nameTr: "Ankara Esenboğa Havalimanı (Çubuk Ayaz Çanağı)",
      lat: 40.1281,
      lon: 32.995,
      demElevationM: 949,
      subBasinId: "cubuk_esenboga_frost_basin",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    LTAB: {
      stationId: "LTAB",
      nameTr: "Ankara Güvercinlik Meydanı",
      lat: 39.9347,
      lon: 32.7408,
      demElevationM: 820,
      subBasinId: "ankara_urban_bowl",
      urbanFraction: 0.72,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "basin_floor"
    },
    LTAD: {
      stationId: "LTAD",
      nameTr: "Ankara Etimesgut Meydanı",
      lat: 39.9498,
      lon: 32.6886,
      demElevationM: 806,
      subBasinId: "ankara_urban_bowl",
      urbanFraction: 0.65,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "basin_floor"
    },
    "17134": {
      stationId: 17134,
      nameTr: "Gölbaşı – İncek Güney Platosu",
      lat: 39.8032,
      lon: 32.8434,
      demElevationM: 1115,
      subBasinId: "incek_golbasi_south_plateau",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17664": {
      stationId: 17664,
      nameTr: "Kızılcahamam (Karadeniz Geçişi)",
      lat: 40.4729,
      lon: 32.6441,
      demElevationM: 1033,
      subBasinId: "kizilcahamam_camlidere_north",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.5,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17728": {
      stationId: 17728,
      nameTr: "Polatlı (Batı Bozkırı)",
      lat: 39.5834,
      lon: 32.1624,
      demElevationM: 886,
      subBasinId: "polatli_beypazari_steppe",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "20506": {
      stationId: 20506,
      nameTr: "Elmadağ Kayak Merkezi",
      lat: 39.7981,
      lon: 32.9706,
      demElevationM: 1750,
      subBasinId: "elmadag_isik_alpine",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.16,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [690, 891, 1220, 1860],
    maxPhysicalPeakM: 2034,
    snowElevationBands: HYPSO_TR_06.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "KOROGLU_ISIK_NORTH_UPSLOPE",
      labelTr: "Köroğlu – Işık Dağı (2034 m) Kızılcahamam – Çamlıdere Karadeniz Orografik Kuşağı",
      effectiveBarrierHeightM: 2034,
      crestPressureHpa: 800,
      applicableSubBasins: ["kizilcahamam_camlidere_north"],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 185, toDeg: 240 },
        minCrossCrestSpeedMs: 12.0,
        minFroudeNumber: 0.5,
        sourcePlateauElevationM: 920,
        maxTargetElevationM: 980,
        maxWarmingCapC: 1.5,
        subCloudVirgaFactor: 0.2,
        wetCutoffMmHr: 0.8
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 325, toDeg: 35 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.26,
        maxPrecipMultiplierCap: 1.44
      }
    },
    {
      id: "KOROGLU_ISIK_CENTRAL_LEE_SHADOW",
      labelTr: "Köroğlu – Işık Dağı Güney İç Havza Yağış Gölgesi (Ankara – Çubuk – Polatlı)",
      effectiveBarrierHeightM: 2034,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "cubuk_esenboga_frost_basin",
        "ankara_urban_bowl",
        "polatli_beypazari_steppe"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 185, toDeg: 240 },
        minCrossCrestSpeedMs: 10.5,
        minFroudeNumber: 0.45,
        sourcePlateauElevationM: 960,
        maxTargetElevationM: 1020,
        maxWarmingCapC: 2.3,
        subCloudVirgaFactor: 0.24,
        wetCutoffMmHr: 0.8
      },
      upslopeSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 195, toDeg: 245 },
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 1.12,
        maxPrecipMultiplierCap: 1.18
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 330, toDeg: 30 },
        precipAttenuationFactor: 0.82
      }
    },
    {
      id: "ELMADAG_INCEK_SNOW_SHELF",
      labelTr: "Elmadağ (1862 m) – İncek Güney Kar Tutma Basamağı",
      effectiveBarrierHeightM: 1862,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "incek_golbasi_south_plateau",
        "elmadag_isik_alpine"
      ],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 190, toDeg: 235 },
        minCrossCrestSpeedMs: 12.0,
        minFroudeNumber: 0.5,
        sourcePlateauElevationM: 980,
        maxTargetElevationM: 950,
        maxWarmingCapC: 1.5,
        subCloudVirgaFactor: 0.18,
        wetCutoffMmHr: 0.6
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 175, toDeg: 255 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.22,
        maxPrecipMultiplierCap: 1.38
      }
    }
  ],
  venturiCorridors: [
    {
      id: "ANKARA_CAYI_SINCAN_CORRIDOR",
      labelTr: "Ankara Çayı – Sincan – Etimesgut Batı Rüzgar Koridoru",
      centerCoord: { lat: 39.95, lon: 32.68 },
      influenceRadiusKm: 22,
      channelAxisFromDeg: 265,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.18,
      gustMultiplier: 1.28,
      suppressesNocturnalInversion: false
    },
    {
      id: "KIZILIRMAK_KALECIK_GAP",
      labelTr: "Kalecik – Kızılırmak Kuzeydoğu Vadi Oluğu",
      centerCoord: { lat: 40.0947, lon: 33.4133 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 30,
      bidirectional: true,
      sectorHalfWidthDeg: 26,
      speedMultiplier: 1.22,
      gustMultiplier: 1.32,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 806,
    coldPoolMaxDepthM: 280,
    topographicEnclosureIndex: 0.78,
    deltaPressureTopHpa: 850,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 5.8
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.58
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 25, toDeg: 95 },
      minWindShearVs850Deg: 60
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.48,
    invertedVDryMicroburstSusceptibility: 0.64,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "target_ankara_kalaba_17130",
      labelTr: "Ankara Merkez – Kalaba (891 m)",
      lat: 39.9727,
      lon: 32.8637,
      elevationM: 891,
      role: "target"
    },
    {
      key: "basin_esenboga_ltac",
      labelTr: "Çubuk – Esenboğa Ayaz Çanağı (949 m)",
      lat: 40.1281,
      lon: 32.995,
      elevationM: 949,
      role: "lee_shadow"
    },
    {
      key: "plateau_incek_golbasi",
      labelTr: "İncek – Gölbaşı Güney Platosu (1115 m)",
      lat: 39.8032,
      lon: 32.8434,
      elevationM: 1115,
      role: "orographic_wall"
    },
    {
      key: "orog_elmadag_summit",
      labelTr: "Elmadağ Zirve Kuşağı (1750 m)",
      lat: 39.7981,
      lon: 32.9706,
      elevationM: 1750,
      role: "orographic_wall"
    },
    {
      key: "north_kizilcahamam_transition",
      labelTr: "Kızılcahamam Kuzey Geçişi (1033 m)",
      lat: 40.4729,
      lon: 32.6441,
      elevationM: 1033,
      role: "orographic_wall"
    },
    {
      key: "steppe_polatli_west",
      labelTr: "Polatlı Batı Bozkırı (886 m)",
      lat: 39.5834,
      lon: 32.1624,
      elevationM: 886,
      role: "foehn_windward"
    },
    {
      key: "valley_beypazari_nw",
      labelTr: "Beypazarı Vadisi (682 m)",
      lat: 40.1608,
      lon: 31.9172,
      elevationM: 682,
      role: "corridor"
    },
    {
      key: "corridor_etimesgut_sincan",
      labelTr: "Etimesgut – Sincan Oluğu (806 m)",
      lat: 39.9558,
      lon: 32.6854,
      elevationM: 806,
      role: "corridor"
    },
    {
      key: "south_sereflikochisar_steppe",
      labelTr: "Şereflikoçhisar Güney Bozkırı (975 m)",
      lat: 38.9539,
      lon: 33.4218,
      elevationM: 975,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -30,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 6.5
  }
};

export const PROVINCE_SPEC_TR_06: ProvinceSpec = Object.freeze(SPEC_TR_06);
export default PROVINCE_SPEC_TR_06;
