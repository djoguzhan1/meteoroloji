import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const OSMANIYE_CLIM = TR81_CLIMATOLOGY_1991_2020["TR-80"];
const OSMANIYE_HYPSO = TR81_HYPSOMETRIC_PROFILES["TR-80"];

/**
 * Bespoke East Çukurova – Amanos Western Escarpment convective funnel contract for `TR-80` Osmaniye.
 * Landlocked (`waterBodies: []`, `icaoWhitelist: []`, Tier-B `TIER_B_DONOR_KALMAN`), yet funnels
 * moist SW (`200°–250°`) İskenderun Gulf air orthogonally into the Bahçe/Hasanbeyli/Düziçi wall (`1.48x`).
 */
export const TR_80_CONVECTIVE_FUNNEL_CONTRACT = Object.freeze({
  centerPiedmontElevationM: 125,
  zorkunPlateauSummitM: 2200,
  duldulPeakM: 2246,
  upslopePrecipMultiplier: 1.48,
  onshoreFunnelSectorDeg: Object.freeze({ fromDeg: 200, toDeg: 250 }),
  allowedMetarIcaos: Object.freeze([] as const),
  calibrationMode: "TIER_B_DONOR_ALARO" as const
});

const specTr80: ProvinceSpec = {
  provinceCode: "TR-80",
  plateCode: 80,
  slug: "osmaniye",
  nameTr: "Osmaniye",
  region: "MEDITERRANEAN",
  climateRegion: "AKDENIZ",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "MEDITERRANEAN_COASTAL_OROG",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 36.93,
    maxLat: 37.7497,
    minLon: 35.8765,
    maxLon: 36.6932
  },
  primaryCenter: {
    mgmMerkezId: 98001,
    mgmIstNo: 17355,
    mgmSaatlikIstNo: 17355,
    mgmGunlukIstNo: 98001,
    lat: 37.1021,
    lon: 36.2539,
    demVerifiedElevationM: 125,
    subBasinId: "osmaniye_east_cukurova_funnel",
    urbanFraction: 0.72,
    monthlyTmaxNormalsC: OSMANIYE_CLIM.tmaxC,
    monthlyTminNormalsC: OSMANIYE_CLIM.tminC
  },
  curatedSubLocations: [
    {
      id: "osmaniye-toprakkale-kadirli-tr",
      name: "Toprakkale / Kadirli Alt Ova",
      role: "coast",
      lat: 37.0626,
      lon: 36.1415,
      elevationM: 65
    },
    {
      id: "osmaniye-merkez-tr",
      name: "Osmaniye Merkez",
      role: "plain",
      lat: 37.1021,
      lon: 36.2539,
      elevationM: 125
    },
    {
      id: "osmaniye-bahce-hasanbeyli-tr",
      name: "Hasanbeyli / Bahçe (Gavurdağı Yamaç)",
      role: "foothill",
      lat: 37.1333,
      lon: 36.5667,
      elevationM: 909
    },
    {
      id: "osmaniye-zorkun-duldul-tr",
      name: "Zorkun Yaylası / Düldül Dağı",
      role: "summit",
      lat: 36.985,
      lon: 36.358,
      elevationM: 1820
    }
  ],
  subBasins: [
    {
      id: "osmaniye_east_cukurova_funnel",
      labelTr: "Doğu Çukurova – Toprakkale – Kadirli – Osmaniye Konvektif Huni Tabanı",
      polygonOrBbox: {
        minLat: 36.98,
        maxLat: 37.55,
        minLon: 35.8765,
        maxLon: 36.36
      },
      elevationRangeM: [55, 260],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.62
    },
    {
      id: "bahce_hasanbeyli_duzici_windward",
      labelTr: "Düziçi – Bahçe – Hasanbeyli Amanos Batı Orografik Çarpma Yamacı",
      polygonOrBbox: {
        minLat: 37.08,
        maxLat: 37.45,
        minLon: 36.34,
        maxLon: 36.6932
      },
      elevationRangeM: [260, 1150],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.34
    },
    {
      id: "zorkun_duldul_alpine",
      labelTr: "Zorkun Yaylası – Amanos Sırtı – Düldül Dağı (1150–2246m)",
      polygonOrBbox: {
        minLat: 36.93,
        maxLat: 37.7497,
        minLon: 36.28,
        maxLon: 36.66
      },
      elevationRangeM: [1150, 2246],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.08
    }
  ],
  barrierCouplingMatrix: {
    osmaniye_east_cukurova_funnel: {
      osmaniye_east_cukurova_funnel: 1.0,
      bahce_hasanbeyli_duzici_windward: 0.64,
      zorkun_duldul_alpine: 0.22
    },
    bahce_hasanbeyli_duzici_windward: {
      osmaniye_east_cukurova_funnel: 0.6,
      bahce_hasanbeyli_duzici_windward: 1.0,
      zorkun_duldul_alpine: 0.54
    },
    zorkun_duldul_alpine: {
      osmaniye_east_cukurova_funnel: 0.18,
      bahce_hasanbeyli_duzici_windward: 0.5,
      zorkun_duldul_alpine: 1.0
    }
  },
  stationOverrides: {
    "17355": {
      stationId: 17355,
      nameTr: "Osmaniye Merkez (MGM 17355)",
      lat: 37.1021,
      lon: 36.2539,
      demElevationM: 125,
      subBasinId: "osmaniye_east_cukurova_funnel",
      urbanFraction: 0.74,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "basin_floor"
    },
    "18290": {
      stationId: 18290,
      nameTr: "Osmaniye Toprakkale (Körfez Huni Girişi)",
      lat: 37.0626,
      lon: 36.1415,
      demElevationM: 62,
      subBasinId: "osmaniye_east_cukurova_funnel",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "coastal_or_gap"
    },
    "17907": {
      stationId: 17907,
      nameTr: "Osmaniye Kadirli",
      lat: 37.3575,
      lon: 36.0907,
      demElevationM: 86,
      subBasinId: "osmaniye_east_cukurova_funnel",
      urbanFraction: 0.56,
      coldPoolSusceptibility: 0.34,
      verticalStratumRole: "basin_floor"
    },
    "19184": {
      stationId: 19184,
      nameTr: "Osmaniye Sumbas (DEM Onarımlı 78m)",
      lat: 37.3575,
      lon: 36.0907,
      demElevationM: 78,
      subBasinId: "osmaniye_east_cukurova_funnel",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.36,
      verticalStratumRole: "basin_floor"
    },
    "18064": {
      stationId: 18064,
      nameTr: "Osmaniye Düziçi (Düldül Batı Eteği)",
      lat: 37.262,
      lon: 36.4542,
      demElevationM: 366,
      subBasinId: "bahce_hasanbeyli_duzici_windward",
      urbanFraction: 0.48,
      coldPoolSusceptibility: 0.24,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18063": {
      stationId: 18063,
      nameTr: "Osmaniye Bahçe (Gavurdağı Geçit Ağzı)",
      lat: 37.2022,
      lon: 36.5778,
      demElevationM: 606,
      subBasinId: "bahce_hasanbeyli_duzici_windward",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.22,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18289": {
      stationId: 18289,
      nameTr: "Osmaniye Hasanbeyli (Kızlaç / Amanos Geçidi)",
      lat: 37.1333,
      lon: 36.5667,
      demElevationM: 909,
      subBasinId: "bahce_hasanbeyli_duzici_windward",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.26,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [65, 420, 1100, 2150],
    maxPhysicalPeakM: 2246,
    snowElevationBands: OSMANIYE_HYPSO.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "amanos_duldul_west_convective_funnel",
      labelTr: "Amanos / Gavurdağı Batı Yamacı — GB (200°–250°) Körfez Nem Hunisi & Orografik Sağanak Duvarı",
      effectiveBarrierHeightM: 2246,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "osmaniye_east_cukurova_funnel",
        "bahce_hasanbeyli_duzici_windward",
        "zorkun_duldul_alpine"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 55, toDeg: 115 },
        minCrossCrestSpeedMs: 6.5,
        minFroudeNumber: 0.74,
        sourcePlateauElevationM: 860,
        maxTargetElevationM: 420,
        maxWarmingCapC: 4.4,
        subCloudVirgaFactor: 0.58,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 200, toDeg: 250 },
        minOnshoreOrUpslopeSpeedMs: 4.5,
        coastalFrictionalConvergenceBoost: 1.24,
        maxPrecipMultiplierCap: 1.48
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 60, toDeg: 115 },
        precipAttenuationFactor: 0.52
      }
    }
  ],
  venturiCorridors: [
    {
      id: "gavurdagi_nurdagi_bahce_pass",
      labelTr: "Bahçe – Gavurdağı / Nurdağı Geçidi Çift Yönlü Venturi Kanalı",
      centerCoord: { lat: 37.185, lon: 36.58 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 78,
      bidirectional: true,
      sectorHalfWidthDeg: 35,
      speedMultiplier: 1.36,
      gustMultiplier: 1.48,
      suppressesNocturnalInversion: true
    },
    {
      id: "toprakkale_iskenderun_funnel_gate",
      labelTr: "Toprakkale – Erzin İskenderun Körfez Nem Giriş Kanalı",
      centerCoord: { lat: 37.05, lon: 36.14 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 225,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.26,
      gustMultiplier: 1.36,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 65,
    coldPoolMaxDepthM: 210,
    topographicEnclosureIndex: 0.52,
    deltaPressureTopHpa: 985,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 3.6
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.76
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.7,
    invertedVDryMicroburstSusceptibility: 0.44,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TGT_OSMANIYE",
      labelTr: "Osmaniye Merkez (125m)",
      lat: 37.1021,
      lon: 36.2539,
      elevationM: 125,
      role: "target"
    },
    {
      key: "MAR_ISKENDERUN_UPWIND",
      labelTr: "İskenderun Körfezi GB Nem Kaynağı",
      lat: 36.82,
      lon: 36.02,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "COR_TOPRAKKALE",
      labelTr: "Toprakkale Huni Giriş Boğazı (62m)",
      lat: 37.0626,
      lon: 36.1415,
      elevationM: 62,
      role: "corridor"
    },
    {
      key: "ORO_ZORKUN_YAYLASI",
      labelTr: "Zorkun Yaylası Amanos Sırtı (1950m)",
      lat: 36.985,
      lon: 36.358,
      elevationM: 1950,
      role: "orographic_wall"
    },
    {
      key: "ORO_DULDUL_DAGI",
      labelTr: "Düldül Dağı Zirve Duvarı (2246m)",
      lat: 37.335,
      lon: 36.475,
      elevationM: 2246,
      role: "orographic_wall"
    },
    {
      key: "COR_BAHCE_GAVURDAGI",
      labelTr: "Bahçe – Gavurdağı / Kızlaç Geçidi (909m)",
      lat: 37.168,
      lon: 36.572,
      elevationM: 909,
      role: "corridor"
    },
    {
      key: "FOE_NURDAGI_EAST",
      labelTr: "Nurdağı Doğu Plato Eşiği (860m)",
      lat: 37.175,
      lon: 36.735,
      elevationM: 860,
      role: "foehn_windward"
    },
    {
      key: "ORO_DUZICI_SLOPE",
      labelTr: "Düziçi Konvektif Yükselim Yamacı (366m)",
      lat: 37.262,
      lon: 36.4542,
      elevationM: 366,
      role: "orographic_wall"
    },
    {
      key: "LEE_KADIRLI_PLAIN",
      labelTr: "Kadirli – Sumbas Kuzeybatı Ova (86m)",
      lat: 37.3575,
      lon: 36.0907,
      elevationM: 86,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -20,
    maxPlausibleTempC: 47,
    minPlausibleMslpHpa: 984,
    maxPlausibleMslpHpa: 1044,
    kalmanTempBiasCapC: 5.8
  }
};

export const PROVINCE_SPEC_TR_80: ProvinceSpec = Object.freeze(specTr80);
export default PROVINCE_SPEC_TR_80;
