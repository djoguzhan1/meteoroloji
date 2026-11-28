import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const YOZGAT_CLIM = TR81_CLIMATOLOGY_1991_2020["TR-66"];
const YOZGAT_HYPSO = TR81_HYPSOMETRIC_PROFILES["TR-66"];

/**
 * Bespoke ridge-city & valley-contrast contract for `TR-66` Yozgat.
 * Captures:
 * 1) Bozok Plateau exposed crest at Yozgat Merkez / Çamlık Milli Parkı (~1,301 m) — windier,
 *    less stagnant than Konya/Ankara bowls, with earlier cold-front snow transition,
 * 2) Akdağmadeni (~1,350–1,900 m+; Akdağlar 2,272 m) eastern Scots-pine forest & heavy snow belt,
 * 3) Yerköy (~750–806 m) – Şefaatli (906 m) deep Delice River valley trough (~500–550 m lower and milder),
 * 4) Strict inland zero-ICAO firewall (`icaoWhitelist: []`).
 */
export const TR_66_BOZOK_RIDGE_CONTRACT = Object.freeze({
  camlikRidgeCenterElevationM: 1301,
  akdagmadeniForestBandRangeM: Object.freeze([1350, 1900] as const),
  akdaglarPeakElevationM: 2272,
  yerkoyDeliceValleyFloorM: 750,
  centerToDeliceReliefM: 551,
  isExposedRidgeCity: true,
  earlySnowWetBulbBonusC: 0.65,
  allowedMetarIcaos: Object.freeze([] as const),
  blockedNeighborMetarIcaos: Object.freeze(["LTAU", "LTAR", "LTAC", "LTAZ", "LTAP"] as const)
});

const specTr66: ProvinceSpec = {
  provinceCode: "TR-66",
  plateCode: 66,
  slug: "yozgat",
  nameTr: "Yozgat",
  region: "CENTRAL_ANATOLIA",
  climateRegion: "IC_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "INLAND_PASS_PLATEAU",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 38.9872,
    maxLat: 40.255,
    minLon: 34.0607,
    maxLon: 36.1683
  },
  primaryCenter: {
    mgmMerkezId: 96601,
    mgmIstNo: 17140,
    mgmSaatlikIstNo: 17140,
    mgmGunlukIstNo: 96601,
    wmoId: "17140",
    lat: 39.8243,
    lon: 34.8159,
    demVerifiedElevationM: 1301,
    subBasinId: "bozok_camlik_ridge_crest",
    urbanFraction: 0.58,
    monthlyTmaxNormalsC: YOZGAT_CLIM.tmaxC,
    monthlyTminNormalsC: YOZGAT_CLIM.tminC
  },
  curatedSubLocations: [
    {
      id: "yozgat-yerkoy-delice-valley-tr",
      name: "Yerköy / Şefaatli (Delice Çukur Vadisi)",
      role: "plain",
      lat: 39.6395,
      lon: 34.4672,
      elevationM: 750
    },
    {
      id: "yozgat-sorgun-bogazliyan-bozok-tr",
      name: "Sorgun / Boğazlıyan İç Bozok Ovası",
      role: "plain",
      lat: 39.8016,
      lon: 35.1805,
      elevationM: 1116
    },
    {
      id: "yozgat-merkez-camlik-sirt-tr",
      name: "Yozgat Merkez / Çamlık Milli Parkı Sırtı",
      role: "foothill",
      lat: 39.8243,
      lon: 34.8159,
      elevationM: 1301
    },
    {
      id: "yozgat-akdagmadeni-orman-kar-tr",
      name: "Akdağmadeni Orman ve Kar Kuşağı",
      role: "summit",
      lat: 39.6665,
      lon: 35.9163,
      elevationM: 1508
    }
  ],
  subBasins: [
    {
      id: "yerkoy_sefaatli_delice_trough",
      labelTr: "Yerköy – Şefaatli Delice Irmağı Alçak Çukur Vadisi (~750–920m)",
      polygonOrBbox: {
        minLat: 39.38,
        maxLat: 39.78,
        minLon: 34.0607,
        maxLon: 34.82
      },
      elevationRangeM: [730, 960],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.28
    },
    {
      id: "cekerek_kadisehri_north_valley",
      labelTr: "Çekerek – Aydıncık – Kadışehri Kuzey Yeşilırmak Kolu Vadileri",
      polygonOrBbox: {
        minLat: 39.92,
        maxLat: 40.255,
        minLon: 35.1,
        maxLon: 35.95
      },
      elevationRangeM: [880, 1180],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.2
    },
    {
      id: "bozok_camlik_ridge_crest",
      labelTr: "Yozgat Merkez (Çamlık Sırtı 1301m) – Sorgun – Boğazlıyan Bozok Platosu",
      polygonOrBbox: {
        minLat: 38.9872,
        maxLat: 40.02,
        minLon: 34.68,
        maxLon: 35.58
      },
      elevationRangeM: [1040, 1560],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.44
    },
    {
      id: "akdagmadeni_cayiralan_forest_snow_belt",
      labelTr: "Akdağmadeni – Çayıralan – Akdağlar (1350–2272m) Sarıçam Orman ve Kar Kuşağı",
      polygonOrBbox: {
        minLat: 39.18,
        maxLat: 39.88,
        minLon: 35.54,
        maxLon: 36.1683
      },
      elevationRangeM: [1350, 2272],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.14
    }
  ],
  barrierCouplingMatrix: {
    yerkoy_sefaatli_delice_trough: {
      yerkoy_sefaatli_delice_trough: 1.0,
      cekerek_kadisehri_north_valley: 0.28,
      bozok_camlik_ridge_crest: 0.22,
      akdagmadeni_cayiralan_forest_snow_belt: 0.08
    },
    cekerek_kadisehri_north_valley: {
      yerkoy_sefaatli_delice_trough: 0.28,
      cekerek_kadisehri_north_valley: 1.0,
      bozok_camlik_ridge_crest: 0.34,
      akdagmadeni_cayiralan_forest_snow_belt: 0.24
    },
    bozok_camlik_ridge_crest: {
      yerkoy_sefaatli_delice_trough: 0.2,
      cekerek_kadisehri_north_valley: 0.32,
      bozok_camlik_ridge_crest: 1.0,
      akdagmadeni_cayiralan_forest_snow_belt: 0.56
    },
    akdagmadeni_cayiralan_forest_snow_belt: {
      yerkoy_sefaatli_delice_trough: 0.06,
      cekerek_kadisehri_north_valley: 0.22,
      bozok_camlik_ridge_crest: 0.54,
      akdagmadeni_cayiralan_forest_snow_belt: 1.0
    }
  },
  stationOverrides: {
    "17140": {
      stationId: 17140,
      nameTr: "Yozgat Merkez (WMO 17140 — Çamlık Sırtı)",
      lat: 39.8243,
      lon: 34.8159,
      demElevationM: 1301,
      subBasinId: "bozok_camlik_ridge_crest",
      urbanFraction: 0.58,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "mid_slope"
    },
    "18209": {
      stationId: 18209,
      nameTr: "Yozgat Akdağmadeni (Orman ve Kar Kuşağı)",
      lat: 39.6665,
      lon: 35.9163,
      demElevationM: 1508,
      subBasinId: "akdagmadeni_cayiralan_forest_snow_belt",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    },
    "18474": {
      stationId: 18474,
      nameTr: "Yozgat Çayıralan (Güney Akdağlar Orman Eteği)",
      lat: 39.3053,
      lon: 35.6747,
      demElevationM: 1400,
      subBasinId: "akdagmadeni_cayiralan_forest_snow_belt",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17712": {
      stationId: 17712,
      nameTr: "Yozgat Sorgun (Bozok İç Havza)",
      lat: 39.8016,
      lon: 35.1805,
      demElevationM: 1116,
      subBasinId: "bozok_camlik_ridge_crest",
      urbanFraction: 0.46,
      coldPoolSusceptibility: 0.62,
      verticalStratumRole: "basin_floor"
    },
    "17760": {
      stationId: 17760,
      nameTr: "Yozgat Boğazlıyan (Güney Bozok Ovası)",
      lat: 39.1897,
      lon: 35.2532,
      demElevationM: 1070,
      subBasinId: "bozok_camlik_ridge_crest",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "19355": {
      stationId: 19355,
      nameTr: "Yozgat Yerköy (Delice Çukur Vadisi)",
      lat: 39.6395,
      lon: 34.4672,
      demElevationM: 806,
      subBasinId: "yerkoy_sefaatli_delice_trough",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18478": {
      stationId: 18478,
      nameTr: "Yozgat Şefaatli (Karanlıkdere – Delice Vadisi)",
      lat: 39.5021,
      lon: 34.7431,
      demElevationM: 906,
      subBasinId: "yerkoy_sefaatli_delice_trough",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.7,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18208": {
      stationId: 18208,
      nameTr: "Yozgat Çekerek (Kuzey Alçak Vadi)",
      lat: 40.0708,
      lon: 35.5094,
      demElevationM: 942,
      subBasinId: "cekerek_kadisehri_north_valley",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.54,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [750, 1301, 1580, 1980],
    maxPhysicalPeakM: 2272,
    snowElevationBands: YOZGAT_HYPSO.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "akdaglar_camlik_bozok_snow_barrier",
      labelTr: "Çamlık Sırtı (1560m) & Akdağmadeni/Akdağlar (2272m) — Erken Kar Kapanı ve Delice İniş Fönü",
      effectiveBarrierHeightM: 1980,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "bozok_camlik_ridge_crest",
        "akdagmadeni_cayiralan_forest_snow_belt",
        "yerkoy_sefaatli_delice_trough"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 65, toDeg: 135 },
        minCrossCrestSpeedMs: 6.5,
        minFroudeNumber: 0.72,
        sourcePlateauElevationM: 1350,
        maxTargetElevationM: 950,
        maxWarmingCapC: 4.4,
        subCloudVirgaFactor: 0.68,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 315, toDeg: 40 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.15,
        maxPrecipMultiplierCap: 1.45
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 185, toDeg: 245 },
        precipAttenuationFactor: 0.68
      }
    }
  ],
  venturiCorridors: [
    {
      id: "bozok_camlik_crest_wind_exposure",
      labelTr: "Bozok Platosu – Çamlık Milli Parkı (1301m) Açık Sırt Rüzgar İvmelenmesi",
      centerCoord: { lat: 39.8243, lon: 34.8159 },
      influenceRadiusKm: 30,
      channelAxisFromDeg: 345,
      bidirectional: true,
      sectorHalfWidthDeg: 42,
      speedMultiplier: 1.28,
      gustMultiplier: 1.42,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 806,
    coldPoolMaxDepthM: 240,
    topographicEnclosureIndex: 0.34,
    deltaPressureTopHpa: 890,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 4.6
    },
    persistentStratusLock: {
      enabled: false,
      daytimeSolarDampingFactor: 0.86
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.48,
    invertedVDryMicroburstSusceptibility: 0.6,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TGT_YOZGAT_CAMLIK_CREST",
      labelTr: "Yozgat Merkez Çamlık Sırtı (1301m)",
      lat: 39.8243,
      lon: 34.8159,
      elevationM: 1301,
      role: "target"
    },
    {
      key: "ORO_AKDAGMADENI_FOREST",
      labelTr: "Akdağmadeni Sarıçam Orman Kuşağı (1508m)",
      lat: 39.6665,
      lon: 35.9163,
      elevationM: 1508,
      role: "orographic_wall"
    },
    {
      key: "ORO_AKDAGLAR_SUMMIT",
      labelTr: "Akdağlar Zirve Sırtı (1980m)",
      lat: 39.54,
      lon: 35.88,
      elevationM: 1980,
      role: "orographic_wall"
    },
    {
      key: "LEE_YERKOY_DELICE",
      labelTr: "Yerköy Delice Çukur Vadisi (806m)",
      lat: 39.6395,
      lon: 34.4672,
      elevationM: 806,
      role: "lee_shadow"
    },
    {
      key: "LEE_SEFAATLI_VALLEY",
      labelTr: "Şefaatli Karanlıkdere Vadisi (906m)",
      lat: 39.5021,
      lon: 34.7431,
      elevationM: 906,
      role: "lee_shadow"
    },
    {
      key: "COR_SORGUN_GAP",
      labelTr: "Sorgun Bozok Eşiği (1116m)",
      lat: 39.8016,
      lon: 35.1805,
      elevationM: 1116,
      role: "corridor"
    },
    {
      key: "COR_CEKEREK_NORTH",
      labelTr: "Çekerek Kuzey Vadisi (942m)",
      lat: 40.0708,
      lon: 35.5094,
      elevationM: 942,
      role: "corridor"
    },
    {
      key: "FOE_BOGAZLIYAN_SOUTH",
      labelTr: "Boğazlıyan Güney Bozok Platosu (1070m)",
      lat: 39.1897,
      lon: 35.2532,
      elevationM: 1070,
      role: "foehn_windward"
    },
    {
      key: "ORO_CAYIRALAN_HIGHLAND",
      labelTr: "Çayıralan Yüksek Yayla Kuşağı (1400m)",
      lat: 39.3053,
      lon: 35.6747,
      elevationM: 1400,
      role: "orographic_wall"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -30,
    maxPlausibleTempC: 42,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1050,
    kalmanTempBiasCapC: 6.5
  }
};

export const PROVINCE_SPEC_TR_66: ProvinceSpec = Object.freeze(specTr66);
export default PROVINCE_SPEC_TR_66;
