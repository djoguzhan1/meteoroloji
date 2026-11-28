import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_68 = TR81_CLIMATOLOGY_1991_2020["TR-68"];
const HYPSO_TR_68 = TR81_HYPSOMETRIC_PROFILES["TR-68"];

export const TR_68_TUZGOLU_HASANDAGI_GRADIENT = Object.freeze({
  tuzGoluSeFlatElevationM: 965,
  hasanDagiSummitElevationM: 3268,
  verticalReliefSpanM: 2303,
  donorProvinces: Object.freeze(["TR-51", "TR-42", "TR-50"] as const),
  alaroAnchorWeight0to72h: 0.24,
  allowedMetarIcaos: Object.freeze([] as const)
});

/**
 * ATMOS v5.0 — Wave 3B (REG-14) Bespoke Microclimate Spec: TR-68 Aksaray
 *
 * Key Physical Mechanisms:
 *  1. Extreme 2,300 m+ Stratovolcanic Vertical Gradient Over 30 km:
 *     Rises abruptly from the hypersaline Tuz Gölü southeastern flat (`~910–965 m`, Eskil–Sultanhanı–Merkez)
 *     through Ihlara–Güzelyurt tuff canyons (`1,520 m`) up to the isolated twin stratovolcanic cone
 *     of **Hasan Dağı (`3,268 m`)**, which captures free-tropospheric W/SW/NW moisture (`1.68x` upslope snow)
 *     while the `965 m` plain below stays arid or dusty.
 *  2. Tuz Gölü SE Dust Plumes, Inverted-V Dry Microbursts & Winter Fog Sink:
 *     Bare saline-alkaline steppe soils drive severe spring/summer dust transport (`0.82`) and
 *     inverted-V dry convective gusts (`0.84`), while calm winter anticyclones lock freezing fog
 *     across Eskil–Sultanhanı–Aksaray (`persistentStratusLock.enabled: true`).
 *  3. Tier-B Scale-Equivariant Donor Calibration (`TIER_B_DONOR_KALMAN`, `icaoWhitelist: []`):
 *     Zero constant intercept bias, anchored to `TR-51` Niğde / `TR-42` Konya / `TR-50` Nevşehir
 *     donor simplex weights + 0–72h MGM ALARO 4.5 km mesoscale hook, blocking `LTAZ` & `LTAN`.
 */
const SPEC_TR_68: ProvinceSpec = {
  provinceCode: "TR-68",
  plateCode: 68,
  slug: "aksaray",
  nameTr: "Aksaray",
  region: "CENTRAL_ANATOLIA",
  climateRegion: "IC_ANADOLU",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "CENTRAL_ANATOLIA_BASIN",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 37.9827,
    maxLat: 39.051,
    minLon: 33.1713,
    maxLon: 34.5005
  },
  primaryCenter: {
    mgmMerkezId: 96801,
    mgmIstNo: 17192,
    mgmSaatlikIstNo: 17192,
    mgmGunlukIstNo: 96801,
    wmoId: "17192",
    lat: 38.3705,
    lon: 33.9987,
    demVerifiedElevationM: 965,
    subBasinId: "aksaray_central_plain",
    urbanFraction: 0.58,
    monthlyTmaxNormalsC: CLIM_TR_68.tmaxC,
    monthlyTminNormalsC: CLIM_TR_68.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-68-eskil-tuzgolu",
      name: "Eskil – Tuz Gölü Güneydoğu Düzlüğü",
      role: "coast",
      lat: 38.3086,
      lon: 33.3592,
      elevationM: 915
    },
    {
      id: "tr-68-sultanhani",
      name: "Sultanhanı Ova Düzlüğü",
      role: "plain",
      lat: 38.1997,
      lon: 33.5169,
      elevationM: 999
    },
    {
      id: "tr-68-merkez",
      name: "Aksaray Merkez (965m Ova)",
      role: "plain",
      lat: 38.3705,
      lon: 33.9987,
      elevationM: 965
    },
    {
      id: "tr-68-ortakoy",
      name: "Ortaköy Kuzey Eşiği",
      role: "foothill",
      lat: 38.765,
      lon: 34.0892,
      elevationM: 1130
    },
    {
      id: "tr-68-ihlara-guzelyurt",
      name: "Ihlara – Güzelyurt Volkanik Platosu",
      role: "foothill",
      lat: 38.2708,
      lon: 34.3722,
      elevationM: 1524
    },
    {
      id: "tr-68-helvadere-karbeyaz",
      name: "Helvadere / Karbeyaz (Hasan Dağı Kuzey Yamaç)",
      role: "summit",
      lat: 38.1592,
      lon: 34.1611,
      elevationM: 2012
    },
    {
      id: "tr-68-hasandagi-zirve",
      name: "Hasan Dağı Yüksek Stratovolkan Konisi (2750–3268m)",
      role: "summit",
      lat: 38.1275,
      lon: 34.165,
      elevationM: 2750
    }
  ],
  subBasins: [
    {
      id: "tuzgolu_eskil_sultanhani_flat",
      labelTr: "Eskil – Sultanhanı – Tuz Gölü Güneydoğu Kurak/Tuzcul Düzlüğü (910–1005m)",
      polygonOrBbox: {
        minLat: 38.05,
        maxLat: 38.68,
        minLon: 33.1713,
        maxLon: 33.78
      },
      elevationRangeM: [905, 1015],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.18
    },
    {
      id: "aksaray_central_plain",
      labelTr: "Aksaray Merkez (~965m) – Sarıyahşi – Ortaköy Ova & Kuzey Eşik Hattı",
      polygonOrBbox: {
        minLat: 38.25,
        maxLat: 39.051,
        minLon: 33.78,
        maxLon: 34.22
      },
      elevationRangeM: [920, 1220],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.56
    },
    {
      id: "ihlara_guzelyurt_volcanic_tuff",
      labelTr: "Ihlara Kanyonu – Güzelyurt – Gülağaç – Ağaçören Volkanik Tüf Platosu",
      polygonOrBbox: {
        minLat: 38.2,
        maxLat: 38.92,
        minLon: 34.18,
        maxLon: 34.5005
      },
      elevationRangeM: [1150, 1750],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.2
    },
    {
      id: "hasandagi_stratovolcano_cone",
      labelTr: "Hasan Dağı (3268m) İzole Stratovolkanik Orografik Kar Konisi",
      polygonOrBbox: {
        minLat: 37.9827,
        maxLat: 38.24,
        minLon: 34.04,
        maxLon: 34.38
      },
      elevationRangeM: [1750, 3268],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.02
    }
  ],
  barrierCouplingMatrix: {
    tuzgolu_eskil_sultanhani_flat: {
      tuzgolu_eskil_sultanhani_flat: 1.0,
      aksaray_central_plain: 0.82,
      ihlara_guzelyurt_volcanic_tuff: 0.34,
      hasandagi_stratovolcano_cone: 0.08
    },
    aksaray_central_plain: {
      tuzgolu_eskil_sultanhani_flat: 0.82,
      aksaray_central_plain: 1.0,
      ihlara_guzelyurt_volcanic_tuff: 0.48,
      hasandagi_stratovolcano_cone: 0.14
    },
    ihlara_guzelyurt_volcanic_tuff: {
      tuzgolu_eskil_sultanhani_flat: 0.34,
      aksaray_central_plain: 0.48,
      ihlara_guzelyurt_volcanic_tuff: 1.0,
      hasandagi_stratovolcano_cone: 0.52
    },
    hasandagi_stratovolcano_cone: {
      tuzgolu_eskil_sultanhani_flat: 0.08,
      aksaray_central_plain: 0.14,
      ihlara_guzelyurt_volcanic_tuff: 0.52,
      hasandagi_stratovolcano_cone: 1.0
    }
  },
  stationOverrides: {
    "17192": {
      stationId: 17192,
      nameTr: "Aksaray Merkez (965m Ova)",
      lat: 38.3705,
      lon: 33.9987,
      demElevationM: 965,
      subBasinId: "aksaray_central_plain",
      urbanFraction: 0.58,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "basin_floor"
    },
    "18481": {
      stationId: 18481,
      nameTr: "Eskil (Tuz Gölü Güneydoğu Düzlüğü)",
      lat: 38.3086,
      lon: 33.3592,
      demElevationM: 985,
      subBasinId: "tuzgolu_eskil_sultanhani_flat",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.9,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18117": {
      stationId: 18117,
      nameTr: "Sultanhanı",
      lat: 38.1997,
      lon: 33.5169,
      demElevationM: 999,
      subBasinId: "tuzgolu_eskil_sultanhani_flat",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18483": {
      stationId: 18483,
      nameTr: "Sarıyahşi",
      lat: 38.9917,
      lon: 33.8497,
      demElevationM: 925,
      subBasinId: "aksaray_central_plain",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.64,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18118": {
      stationId: 18118,
      nameTr: "Ortaköy",
      lat: 38.765,
      lon: 34.0892,
      demElevationM: 1130,
      subBasinId: "aksaray_central_plain",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18480": {
      stationId: 18480,
      nameTr: "Ağaçören",
      lat: 38.8564,
      lon: 33.9219,
      demElevationM: 1305,
      subBasinId: "ihlara_guzelyurt_volcanic_tuff",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18482": {
      stationId: 18482,
      nameTr: "Gülağaç",
      lat: 38.4089,
      lon: 34.3436,
      demElevationM: 1180,
      subBasinId: "ihlara_guzelyurt_volcanic_tuff",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18116": {
      stationId: 18116,
      nameTr: "Güzelyurt (Ihlara Platosu)",
      lat: 38.2708,
      lon: 34.3722,
      demElevationM: 1524,
      subBasinId: "ihlara_guzelyurt_volcanic_tuff",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.42,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18889": {
      stationId: 18889,
      nameTr: "Hasan Dağı Stratovolkan Kar İstasyonu (2012m)",
      lat: 38.1592,
      lon: 34.1611,
      demElevationM: 2012,
      subBasinId: "hasandagi_stratovolcano_cone",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.2,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [910, 980, 1520, 2750],
    maxPhysicalPeakM: HYPSO_TR_68.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_68.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "hasandagi_isolated_stratovolcano_cone",
      labelTr: "Hasan Dağı (3268m) İzole Stratovolkanik Orografik Kar Konisi",
      effectiveBarrierHeightM: 2650,
      crestPressureHpa: 700,
      applicableSubBasins: [
        "hasandagi_stratovolcano_cone",
        "ihlara_guzelyurt_volcanic_tuff"
      ],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 110, toDeg: 170 },
        minCrossCrestSpeedMs: 12.0,
        minFroudeNumber: 0.6,
        sourcePlateauElevationM: 1200,
        maxTargetElevationM: 1500,
        maxWarmingCapC: 2.2,
        subCloudVirgaFactor: 0.4,
        wetCutoffMmHr: 0.2
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 195, toDeg: 355 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.06,
        maxPrecipMultiplierCap: 1.68
      }
    },
    {
      id: "tuzgolu_aksaray_plain_lee_foehn_and_shadow",
      labelTr: "Tuz Gölü Güneydoğu Düzlüğü (~965m) Güneyli Fön & Yağış Gölgesi",
      effectiveBarrierHeightM: 2250,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "tuzgolu_eskil_sultanhani_flat",
        "aksaray_central_plain"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 135, toDeg: 205 },
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.44,
        sourcePlateauElevationM: 1200,
        maxTargetElevationM: 1120,
        maxWarmingCapC: 3.9,
        subCloudVirgaFactor: 0.72,
        wetCutoffMmHr: 0.35
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 295, toDeg: 20 },
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 1.0,
        maxPrecipMultiplierCap: 1.18
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 135, toDeg: 210 },
        precipAttenuationFactor: 0.6
      }
    }
  ],
  venturiCorridors: [
    {
      id: "hasandagi_nw_flank_acceleration",
      labelTr: "Hasan Dağı – Aksaray Kuzeybatı Konik Sapma Akışı",
      centerCoord: { lat: 38.24, lon: 34.08 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 220,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.26,
      gustMultiplier: 1.38,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 910,
    coldPoolMaxDepthM: 290,
    topographicEnclosureIndex: 0.82,
    deltaPressureTopHpa: 36,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 2.0,
      maxExtraRadiativeCoolingC: 5.0
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.52
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 340, toDeg: 65 },
      minWindShearVs850Deg: 60
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.82,
    invertedVDryMicroburstSusceptibility: 0.84,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TARGET_AKSARAY_17192",
      labelTr: "Aksaray Merkez (965m Ova)",
      lat: 38.3705,
      lon: 33.9987,
      elevationM: 965,
      role: "target"
    },
    {
      key: "ESKIL_TUZGOLU_FLAT",
      labelTr: "Eskil – Tuz Gölü Güneydoğu Tuzcul Düzlüğü",
      lat: 38.3086,
      lon: 33.3592,
      elevationM: 915,
      role: "lee_shadow"
    },
    {
      key: "SULTANHANI_STEPPE",
      labelTr: "Sultanhanı Kurak Bozkır",
      lat: 38.1997,
      lon: 33.5169,
      elevationM: 999,
      role: "lee_shadow"
    },
    {
      key: "HASANDAGI_SUMMIT_CONE",
      labelTr: "Hasan Dağı Stratovolkan Zirve Konisi (3268m)",
      lat: 38.1275,
      lon: 34.165,
      elevationM: 3268,
      role: "orographic_wall"
    },
    {
      key: "HELVADERE_KARBEYAZ_SLOPE",
      labelTr: "Helvadere / Karbeyaz Kuzey Kar Yamacı (2012m)",
      lat: 38.1592,
      lon: 34.1611,
      elevationM: 2012,
      role: "orographic_wall"
    },
    {
      key: "IHLARA_GUZELYURT_TUFF",
      labelTr: "Ihlara – Güzelyurt Platosu (1524m)",
      lat: 38.2708,
      lon: 34.3722,
      elevationM: 1524,
      role: "foehn_windward"
    },
    {
      key: "GULAGAC_EAST_TRANSITION",
      labelTr: "Gülağaç Doğu Tüf Geçişi",
      lat: 38.4089,
      lon: 34.3436,
      elevationM: 1180,
      role: "corridor"
    },
    {
      key: "ORTAKOY_NORTH_SILL",
      labelTr: "Ortaköy Kuzey Eşiği",
      lat: 38.765,
      lon: 34.0892,
      elevationM: 1130,
      role: "corridor"
    },
    {
      key: "SARIYAHSI_HIRFANLI_NORTH",
      labelTr: "Sarıyahşi Kuzey Alt Havza",
      lat: 38.9917,
      lon: 33.8497,
      elevationM: 925,
      role: "foehn_windward"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -29,
    maxPlausibleTempC: 43,
    minPlausibleMslpHpa: 984,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 6.2
  }
};

export const PROVINCE_SPEC_TR_68: ProvinceSpec = Object.freeze(SPEC_TR_68);
export default PROVINCE_SPEC_TR_68;
