import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const SIIRT_CLIM = TR81_CLIMATOLOGY_1991_2020["TR-56"];
const SIIRT_HYPSO = TR81_HYPSOMETRIC_PROFILES["TR-56"];

/**
 * Bespoke Botan–Tigris confluence & SE Taurus southern escarpment contract for `TR-56` Siirt:
 * 1) Empirical `TIER_A_WMO` anchor (`WMO 17210`, `895 m` Siirt Merkez terrace, `17,083` verified WMO hours),
 * 2) Scorching dry summer heat (`+44°C`) under the Basra thermal low paired with intense
 *    Syrian/Iraqi dust transport (`dustTransportSusceptibility: 0.88`) and inverted-V dry microbursts,
 * 3) Strong winter/spring frontal upslope precipitation along the SE Taurus southern wall
 *    (Şirvan `1025 m` – Tillo/Aydınlar `1193 m` – Pervari `1440 m` – Herekol/Yazlıca `2838 m`),
 * 4) Lower Garzan/Botan corridor (`LTCL` Siirt Airport `634 m`, Kurtalan `730 m`, Baykan `791 m`)
 *    isolated from center headline bias via `excludeFromCenterHeadline: true`.
 */
export const TR_56_BOTAN_TIGRIS_THRESHOLD_CONTRACT = Object.freeze({
  wmoStationId: "17210",
  centerElevationM: 895,
  tilloDemRepairedElevationM: 1193,
  herekolSummitM: 2838,
  basraSummerDesignHeatC: 44.0,
  dustTransportSusceptibility: 0.88,
  seTaurusFrontalUpslopeCap: 1.66,
  allowedMetarIcaos: Object.freeze(["LTCL"] as const)
});

const specTr56: ProvinceSpec = {
  provinceCode: "TR-56",
  plateCode: 56,
  slug: "siirt",
  nameTr: "Siirt",
  region: "SOUTHEASTERN_ANATOLIA",
  climateRegion: "GUNEYDOGU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "SOUTHEAST_THRESHOLD_ARID",
  icaoWhitelist: ["LTCL"],
  domainBounds: {
    minLat: 37.5817,
    maxLat: 38.2672,
    minLon: 41.363,
    maxLon: 42.8845
  },
  primaryCenter: {
    mgmMerkezId: 95601,
    mgmIstNo: 17210,
    mgmSaatlikIstNo: 17210,
    mgmGunlukIstNo: 95601,
    wmoId: "17210",
    lat: 37.9319,
    lon: 41.9354,
    demVerifiedElevationM: 895,
    subBasinId: "siirt_botan_threshold_terrace",
    urbanFraction: 0.72,
    monthlyTmaxNormalsC: SIIRT_CLIM.tmaxC,
    monthlyTminNormalsC: SIIRT_CLIM.tminC
  },
  curatedSubLocations: [
    {
      id: "kurtalan-garzan-ova-tr",
      name: "Kurtalan – Garzan Alt Ovası (730m)",
      role: "coast",
      lat: 37.9186,
      lon: 41.7064,
      elevationM: 730
    },
    {
      id: "siirt-merkez-tr",
      name: "Siirt Merkez (Botan–Dicle Eşiği · WMO 17210 · 895m)",
      role: "plain",
      lat: 37.9319,
      lon: 41.9354,
      elevationM: 895
    },
    {
      id: "tillo-sirvan-yamac-tr",
      name: "Tillo (Aydınlar) & Şirvan Güneydoğu Toros Yamacı (1193m)",
      role: "foothill",
      lat: 37.9502,
      lon: 42.0127,
      elevationM: 1193
    },
    {
      id: "pervari-herekol-yuksek-tr",
      name: "Pervari – Herekol (Yazlıca) Dağı Kuşağı (1440–2838m)",
      role: "summit",
      lat: 37.9286,
      lon: 42.5464,
      elevationM: 1440
    }
  ],
  subBasins: [
    {
      id: "kurtalan_baykan_low_corridor",
      labelTr: "Kurtalan – Garzan – LTCL (634m) – Baykan Alt Havza ve Vadi Koridoru",
      polygonOrBbox: {
        minLat: 37.76,
        maxLat: 38.22,
        minLon: 41.363,
        maxLon: 41.88
      },
      elevationRangeM: [460, 830],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.42
    },
    {
      id: "siirt_botan_threshold_terrace",
      labelTr: "Siirt Merkez – Botan/Dicle Kavşağı Eşik Platosu (830–1050m)",
      polygonOrBbox: {
        minLat: 37.82,
        maxLat: 38.04,
        minLon: 41.85,
        maxLon: 42.08
      },
      elevationRangeM: [830, 1050],
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.68
    },
    {
      id: "sirvan_tillo_eruh_mid_escarpment",
      labelTr: "Tillo (Aydınlar 1193m) – Şirvan – Eruh Güneydoğu Toros Güney Yamacı",
      polygonOrBbox: {
        minLat: 37.64,
        maxLat: 38.24,
        minLon: 41.98,
        maxLon: 42.38
      },
      elevationRangeM: [1000, 1650],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.24
    },
    {
      id: "pervari_herekol_alpine_wall",
      labelTr: "Pervari – Herekol (Yazlıca 2838m) Doğu Toros Alpin Kar Duvarı",
      polygonOrBbox: {
        minLat: 37.68,
        maxLat: 38.12,
        minLon: 42.36,
        maxLon: 42.8845
      },
      elevationRangeM: [1400, 2838],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.1
    }
  ],
  barrierCouplingMatrix: {
    kurtalan_baykan_low_corridor: {
      kurtalan_baykan_low_corridor: 1.0,
      siirt_botan_threshold_terrace: 0.56,
      sirvan_tillo_eruh_mid_escarpment: 0.3,
      pervari_herekol_alpine_wall: 0.12
    },
    siirt_botan_threshold_terrace: {
      kurtalan_baykan_low_corridor: 0.56,
      siirt_botan_threshold_terrace: 1.0,
      sirvan_tillo_eruh_mid_escarpment: 0.54,
      pervari_herekol_alpine_wall: 0.22
    },
    sirvan_tillo_eruh_mid_escarpment: {
      kurtalan_baykan_low_corridor: 0.3,
      siirt_botan_threshold_terrace: 0.54,
      sirvan_tillo_eruh_mid_escarpment: 1.0,
      pervari_herekol_alpine_wall: 0.48
    },
    pervari_herekol_alpine_wall: {
      kurtalan_baykan_low_corridor: 0.12,
      siirt_botan_threshold_terrace: 0.22,
      sirvan_tillo_eruh_mid_escarpment: 0.48,
      pervari_herekol_alpine_wall: 1.0
    }
  },
  stationOverrides: {
    "17210": {
      stationId: 17210,
      nameTr: "Siirt Merkez (WMO 17210 · Botan Eşiği 895m)",
      lat: 37.9319,
      lon: 41.9354,
      demElevationM: 895,
      subBasinId: "siirt_botan_threshold_terrace",
      urbanFraction: 0.74,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "mid_slope"
    },
    "17209": {
      stationId: 17209,
      nameTr: "Siirt Havalimanı (LTCL · Kezer/Garzan Çanağı 634m)",
      lat: 37.9789,
      lon: 41.8404,
      demElevationM: 634,
      subBasinId: "kurtalan_baykan_low_corridor",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    LTCL: {
      stationId: "LTCL",
      nameTr: "Siirt Havalimanı METAR (LTCL · 634m Alt Vadi)",
      lat: 37.9789,
      lon: 41.8404,
      demElevationM: 634,
      subBasinId: "kurtalan_baykan_low_corridor",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.48,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18338": {
      stationId: 18338,
      nameTr: "Siirt Kurtalan (Garzan Sıcak Ova Tabanı)",
      lat: 37.9186,
      lon: 41.7064,
      demElevationM: 730,
      subBasinId: "kurtalan_baykan_low_corridor",
      urbanFraction: 0.46,
      coldPoolSusceptibility: 0.46,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18169": {
      stationId: 18169,
      nameTr: "Siirt Baykan (Bitlis Çayı Boğaz Girişi)",
      lat: 38.1664,
      lon: 41.7917,
      demElevationM: 791,
      subBasinId: "kurtalan_baykan_low_corridor",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "19269": {
      stationId: 19269,
      nameTr: "Siirt Tillo / Aydınlar (DEM Onarımlı 1180–1193m Sırt)",
      lat: 37.9502,
      lon: 42.0127,
      demElevationM: 1180,
      subBasinId: "sirvan_tillo_eruh_mid_escarpment",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.26,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18340": {
      stationId: 18340,
      nameTr: "Siirt Şirvan (Güneydoğu Toros Güney Yamacı)",
      lat: 38.0558,
      lon: 42.0356,
      demElevationM: 1025,
      subBasinId: "sirvan_tillo_eruh_mid_escarpment",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.32,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18337": {
      stationId: 18337,
      nameTr: "Siirt Eruh (Çırav Dağı Kuzey Yamacı)",
      lat: 37.7522,
      lon: 42.1878,
      demElevationM: 1130,
      subBasinId: "sirvan_tillo_eruh_mid_escarpment",
      urbanFraction: 0.25,
      coldPoolSusceptibility: 0.35,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18339": {
      stationId: 18339,
      nameTr: "Siirt Pervari (Herekol – Botan Yüksek Yamaç)",
      lat: 37.9286,
      lon: 42.5464,
      demElevationM: 1440,
      subBasinId: "pervari_herekol_alpine_wall",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.44,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [480, 895, 1480, 2420],
    maxPhysicalPeakM: 2838,
    snowElevationBands: SIIRT_HYPSO.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "se_taurus_pervari_sirvan_2838m_wall",
      labelTr: "Güneydoğu Toroslar (Şirvan–Tillo–Pervari–Herekol 2838m) Güney Cephesel Yağış Duvarı",
      effectiveBarrierHeightM: 2838,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "kurtalan_baykan_low_corridor",
        "siirt_botan_threshold_terrace",
        "sirvan_tillo_eruh_mid_escarpment",
        "pervari_herekol_alpine_wall"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 345, toDeg: 55 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.78,
        sourcePlateauElevationM: 1650,
        maxTargetElevationM: 950,
        maxWarmingCapC: 4.6,
        subCloudVirgaFactor: 0.58,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 245 },
        minOnshoreOrUpslopeSpeedMs: 4.8,
        coastalFrictionalConvergenceBoost: 1.22,
        maxPrecipMultiplierCap: 1.66
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 350, toDeg: 50 },
        precipAttenuationFactor: 0.52
      }
    }
  ],
  venturiCorridors: [
    {
      id: "baykan_bitlis_stream_corridor",
      labelTr: "Baykan – Bitlis Çayı Kuzey Boğaz Oluk Akışı",
      centerCoord: { lat: 38.1664, lon: 41.7917 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 15,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.32,
      gustMultiplier: 1.46,
      suppressesNocturnalInversion: true
    },
    {
      id: "botan_canyon_alkumru_chute",
      labelTr: "Botan Kanyonu (Alkumru – Tillo – Eruh) Doğu-Batı Kanalı",
      centerCoord: { lat: 37.84, lon: 42.06 },
      influenceRadiusKm: 22,
      channelAxisFromDeg: 110,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.26,
      gustMultiplier: 1.4,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 634,
    coldPoolMaxDepthM: 280,
    topographicEnclosureIndex: 0.58,
    deltaPressureTopHpa: 850,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 8,
      maxExtraRadiativeCoolingC: 4.2
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.72
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 65, toDeg: 145 },
      minWindShearVs850Deg: 60
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.88,
    invertedVDryMicroburstSusceptibility: 0.78,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TGT_SIIRT_CENTER",
      labelTr: "Siirt Merkez (WMO 17210 · Botan Eşiği 895m)",
      lat: 37.9319,
      lon: 41.9354,
      elevationM: 895,
      role: "target"
    },
    {
      key: "COR_KURTALAN_PLAIN",
      labelTr: "Kurtalan Garzan Batı Sıcak Ova Girişi (730m)",
      lat: 37.9186,
      lon: 41.7064,
      elevationM: 730,
      role: "corridor"
    },
    {
      key: "COR_GARZAN_TIGRIS_LOW",
      labelTr: "Garzan – Dicle Kavşağı Alt Havzası (540m)",
      lat: 37.96,
      lon: 41.52,
      elevationM: 540,
      role: "corridor"
    },
    {
      key: "COR_BAYKAN_PASS",
      labelTr: "Baykan Bitlis Çayı Kuzey Geçidi (791m)",
      lat: 38.1664,
      lon: 41.7917,
      elevationM: 791,
      role: "corridor"
    },
    {
      key: "ORO_TILLO_TERRACE",
      labelTr: "Tillo (Aydınlar) Doğu Yamaç Sırtı (1193m)",
      lat: 37.9502,
      lon: 42.0127,
      elevationM: 1193,
      role: "orographic_wall"
    },
    {
      key: "ORO_SIRVAN_SLOPE",
      labelTr: "Şirvan Güneydoğu Toros Cephe Yamacı (1025m)",
      lat: 38.0558,
      lon: 42.0356,
      elevationM: 1025,
      role: "orographic_wall"
    },
    {
      key: "ORO_PERVARI_HIGH",
      labelTr: "Pervari Doğu Yamaç Platosu (1440m)",
      lat: 37.9286,
      lon: 42.5464,
      elevationM: 1440,
      role: "foehn_windward"
    },
    {
      key: "ORO_HEREKOL_SUMMIT",
      labelTr: "Herekol (Yazlıca) Dağı Alpin Duvarı (2838m)",
      lat: 37.82,
      lon: 42.48,
      elevationM: 2838,
      role: "orographic_wall"
    },
    {
      key: "LEE_ERUH_SOUTH",
      labelTr: "Eruh – Botan Güney Kanyon Eşiği (1130m)",
      lat: 37.7522,
      lon: 42.1878,
      elevationM: 1130,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -22,
    maxPlausibleTempC: 47,
    minPlausibleMslpHpa: 980,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 6.5
  }
};

export const PROVINCE_SPEC_TR_56: ProvinceSpec = Object.freeze(specTr56);
export default PROVINCE_SPEC_TR_56;
