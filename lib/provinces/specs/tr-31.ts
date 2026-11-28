import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const HATAY_CLIM = TR81_CLIMATOLOGY_1991_2020["TR-31"];
const HATAY_HYPSO = TR81_HYPSOMETRIC_PROFILES["TR-31"];

/**
 * Bespoke Amanos (Nur) Mountains double-sided barrier & Belen/Yarıkkaya katabatic storm contract for `TR-31` Hatay.
 * Strictly blocks Syrian aerodromes (`OSLK` Latakia, `OSAP` Aleppo) while locking `LTDA` Hatay Airport.
 */
export const TR_31_AMANOS_BIFACIAL_CONTRACT = Object.freeze({
  amanosBozdagPeakM: 2240,
  belenPassElevationM: 750,
  amikBasinFloorM: 85,
  yarikkayaSpeedMultiplier: 1.42,
  yarikkayaGustMultiplier: 1.55,
  allowedMetarIcaos: Object.freeze(["LTDA"] as const),
  blockedForeignMetarIcaos: Object.freeze(["OSLK", "OSAP", "OSDI", "OLBA"] as const)
});

const specTr31: ProvinceSpec = {
  provinceCode: "TR-31",
  plateCode: 31,
  slug: "hatay",
  nameTr: "Hatay",
  region: "MEDITERRANEAN",
  climateRegion: "AKDENIZ",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "MEDITERRANEAN_COASTAL_OROG",
  icaoWhitelist: ["LTDA"],
  domainBounds: {
    minLat: 35.8077,
    maxLat: 37.0082,
    minLon: 35.7803,
    maxLon: 36.6953
  },
  primaryCenter: {
    mgmMerkezId: 93101,
    mgmIstNo: 17372,
    mgmSaatlikIstNo: 17372,
    mgmGunlukIstNo: 93101,
    wmoId: "17372",
    lat: 36.2048,
    lon: 36.1513,
    demVerifiedElevationM: 85,
    subBasinId: "amik_asi_reyhanli_basin",
    urbanFraction: 0.78,
    monthlyTmaxNormalsC: HATAY_CLIM.tmaxC,
    monthlyTminNormalsC: HATAY_CLIM.tminC
  },
  curatedSubLocations: [
    {
      id: "hatay-iskenderun-coast-tr",
      name: "İskenderun / Arsuz Körfez Kıyısı",
      role: "coast",
      lat: 36.5924,
      lon: 36.1582,
      elevationM: 4
    },
    {
      id: "hatay-antakya-merkez-tr",
      name: "Antakya Merkez (Asi / Amik Havzası)",
      role: "plain",
      lat: 36.2048,
      lon: 36.1513,
      elevationM: 85
    },
    {
      id: "hatay-belen-gecidi-tr",
      name: "Belen Geçidi / Soğukoluk",
      role: "foothill",
      lat: 36.4889,
      lon: 36.2172,
      elevationM: 750
    },
    {
      id: "hatay-amanos-bozdag-tr",
      name: "Amanoslar (Bozdağ / Mığır Zirve)",
      role: "summit",
      lat: 36.695,
      lon: 36.325,
      elevationM: 1850
    }
  ],
  subBasins: [
    {
      id: "iskenderun_dortyol_coastal_strip",
      labelTr: "İskenderun – Payas – Dörtyol – Arsuz Körfez Kıyı Şeridi",
      polygonOrBbox: {
        minLat: 36.2,
        maxLat: 37.0082,
        minLon: 35.7803,
        maxLon: 36.24
      },
      elevationRangeM: [0, 220],
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.72
    },
    {
      id: "samandag_orontes_mouth",
      labelTr: "Samandağ – Asi Nehri Ağzı Deniz Meltemi Koridoru",
      polygonOrBbox: {
        minLat: 35.98,
        maxLat: 36.2,
        minLon: 35.9,
        maxLon: 36.12
      },
      elevationRangeM: [0, 180],
      defaultZone: "strait_corridor",
      defaultUrbanFraction: 0.42
    },
    {
      id: "amanos_belen_crest",
      labelTr: "Amanos (Nur) Dağları Sırtı & Belen Geçidi (750–2240m)",
      polygonOrBbox: {
        minLat: 36.22,
        maxLat: 36.96,
        minLon: 36.14,
        maxLon: 36.42
      },
      elevationRangeM: [350, 2240],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.16
    },
    {
      id: "amik_asi_reyhanli_basin",
      labelTr: "Amik Ovası – Antakya – Kırıkhan – Reyhanlı Graben Çanağı",
      polygonOrBbox: {
        minLat: 35.8077,
        maxLat: 36.85,
        minLon: 36.12,
        maxLon: 36.6953
      },
      elevationRangeM: [75, 480],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.58
    }
  ],
  barrierCouplingMatrix: {
    iskenderun_dortyol_coastal_strip: {
      iskenderun_dortyol_coastal_strip: 1.0,
      samandag_orontes_mouth: 0.64,
      amanos_belen_crest: 0.24,
      amik_asi_reyhanli_basin: 0.14
    },
    samandag_orontes_mouth: {
      iskenderun_dortyol_coastal_strip: 0.62,
      samandag_orontes_mouth: 1.0,
      amanos_belen_crest: 0.2,
      amik_asi_reyhanli_basin: 0.68
    },
    amanos_belen_crest: {
      iskenderun_dortyol_coastal_strip: 0.22,
      samandag_orontes_mouth: 0.18,
      amanos_belen_crest: 1.0,
      amik_asi_reyhanli_basin: 0.24
    },
    amik_asi_reyhanli_basin: {
      iskenderun_dortyol_coastal_strip: 0.14,
      samandag_orontes_mouth: 0.66,
      amanos_belen_crest: 0.24,
      amik_asi_reyhanli_basin: 1.0
    }
  },
  stationOverrides: {
    "17372": {
      stationId: 17372,
      nameTr: "Hatay Antakya Merkez (WMO 17372)",
      lat: 36.2048,
      lon: 36.1513,
      demElevationM: 85,
      subBasinId: "amik_asi_reyhanli_basin",
      urbanFraction: 0.8,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "basin_floor"
    },
    "17370": {
      stationId: 17370,
      nameTr: "İskenderun Kıyı (WMO 17370)",
      lat: 36.5924,
      lon: 36.1582,
      demElevationM: 4,
      subBasinId: "iskenderun_dortyol_coastal_strip",
      urbanFraction: 0.82,
      coldPoolSusceptibility: 0.08,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "19378": {
      stationId: 19378,
      nameTr: "Hatay Payas (DEM Onarımlı Kıyı-Etek)",
      lat: 36.7554,
      lon: 36.2348,
      demElevationM: 76,
      subBasinId: "iskenderun_dortyol_coastal_strip",
      urbanFraction: 0.65,
      coldPoolSusceptibility: 0.12,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17962": {
      stationId: 17962,
      nameTr: "Hatay Dörtyol",
      lat: 36.8244,
      lon: 36.1981,
      demElevationM: 29,
      subBasinId: "iskenderun_dortyol_coastal_strip",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18858": {
      stationId: 18858,
      nameTr: "Hatay Arsuz",
      lat: 36.24,
      lon: 35.7833,
      demElevationM: 24,
      subBasinId: "iskenderun_dortyol_coastal_strip",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.1,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18057": {
      stationId: 18057,
      nameTr: "Hatay Belen Geçidi",
      lat: 36.4889,
      lon: 36.2172,
      demElevationM: 624,
      subBasinId: "amanos_belen_crest",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.18,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "17986": {
      stationId: 17986,
      nameTr: "Hatay Samandağ Kıyı",
      lat: 36.0814,
      lon: 35.9492,
      demElevationM: 4,
      subBasinId: "samandag_orontes_mouth",
      urbanFraction: 0.45,
      coldPoolSusceptibility: 0.1,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "17645": {
      stationId: 17645,
      nameTr: "Hatay Reyhanlı (Amik Ovası Doğu Çanağı)",
      lat: 36.2658,
      lon: 36.4981,
      demElevationM: 96,
      subBasinId: "amik_asi_reyhanli_basin",
      urbanFraction: 0.36,
      coldPoolSusceptibility: 0.76,
      verticalStratumRole: "basin_floor"
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [10, 350, 950, 2100],
    maxPhysicalPeakM: 2240,
    snowElevationBands: HATAY_HYPSO.bands
  },
  waterBodies: [
    {
      id: "iskenderun_gulf_samandag_sea",
      labelTr: "İskenderun Körfezi & Samandağ Akdeniz Suları",
      kind: "open_sea",
      mgmMarineStationIds: [17481, 17486],
      sampleCoord: { lat: 36.58, lon: 36.02 },
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -2.0,
      monthlyWaterTempNormalsC: [
        17.8, 17.2, 17.9, 19.8, 23.2, 26.6,
        29.0, 29.8, 28.6, 25.8, 22.0, 19.1
      ],
      subBasinInfluenceWeights: {
        iskenderun_dortyol_coastal_strip: 1.0,
        samandag_orontes_mouth: 1.0,
        amanos_belen_crest: 0.35,
        amik_asi_reyhanli_basin: 0.55
      },
      onshoreWindSectorDeg: { fromDeg: 195, toDeg: 305 },
      effectiveFetchKm: 240,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 13.0,
      dekHeavyDeltaTC: 17.0,
      seaBreezeSpec: {
        activeMonths: [4, 10],
        sectorDeg: { fromDeg: 210, toDeg: 265 },
        maxInlandPenetrationKm: 52,
        maxCoolingAmplitudeC: 3.8
      }
    }
  ],
  directionalBarriers: [
    {
      id: "amanos_west_face_yarikkaya_wall",
      labelTr: "Amanos Batı Duvarı — Yarıkkaya/Belen Doğu Fönü & Körfez Denizden Yamaç Yağışı",
      effectiveBarrierHeightM: 2240,
      crestPressureHpa: 750,
      applicableSubBasins: ["iskenderun_dortyol_coastal_strip"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 60, toDeg: 135 },
        minCrossCrestSpeedMs: 6.0,
        minFroudeNumber: 0.7,
        sourcePlateauElevationM: 520,
        maxTargetElevationM: 220,
        maxWarmingCapC: 5.2,
        subCloudVirgaFactor: 0.55,
        wetCutoffMmHr: 0.25
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 215, toDeg: 295 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.25,
        maxPrecipMultiplierCap: 1.58
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 65, toDeg: 130 },
        precipAttenuationFactor: 0.45
      }
    },
    {
      id: "amanos_east_face_amik_asi_wall",
      labelTr: "Amanos Doğu Yamacı & Asi Oluğu — KB Yağış Gölgesi vs GB Asi Deniz Oluk Yağışı",
      effectiveBarrierHeightM: 2240,
      crestPressureHpa: 750,
      applicableSubBasins: ["amik_asi_reyhanli_basin"],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 275, toDeg: 335 },
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.78,
        sourcePlateauElevationM: 900,
        maxTargetElevationM: 320,
        maxWarmingCapC: 3.8,
        subCloudVirgaFactor: 0.68,
        wetCutoffMmHr: 0.3
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 185, toDeg: 250 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.22,
        maxPrecipMultiplierCap: 1.46
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 280, toDeg: 335 },
        precipAttenuationFactor: 0.62
      }
    }
  ],
  venturiCorridors: [
    {
      id: "belen_yarikkaya_katabatic_chute",
      labelTr: "Belen Geçidi (750m) – İskenderun Yarıkkaya Katabatik Fırtına Oluğu",
      centerCoord: { lat: 36.535, lon: 36.185 },
      influenceRadiusKm: 28,
      channelAxisFromDeg: 105,
      bidirectional: true,
      sectorHalfWidthDeg: 35,
      speedMultiplier: 1.42,
      gustMultiplier: 1.55,
      suppressesNocturnalInversion: true
    },
    {
      id: "samandag_asi_valley_breeze_jet",
      labelTr: "Samandağ – Asi Vadisi (Antakya – Amik) Meltem ve Lodos Oluğu",
      centerCoord: { lat: 36.145, lon: 36.055 },
      influenceRadiusKm: 26,
      channelAxisFromDeg: 225,
      bidirectional: false,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.28,
      gustMultiplier: 1.38,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 82,
    coldPoolMaxDepthM: 280,
    topographicEnclosureIndex: 0.68,
    deltaPressureTopHpa: 982,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 3.8
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.72
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 55, toDeg: 125 },
      minWindShearVs850Deg: 65
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.82,
    invertedVDryMicroburstSusceptibility: 0.42,
    coastalWaterspoutSusceptibility: 0.84
  },
  stencil9Points: [
    {
      key: "TGT_ANTAKYA",
      labelTr: "Antakya Merkez (Asi Vadisi 85m)",
      lat: 36.2048,
      lon: 36.1513,
      elevationM: 85,
      role: "target"
    },
    {
      key: "MAR_ISKENDERUN_GULF",
      labelTr: "İskenderun Körfezi Orta Havza",
      lat: 36.6,
      lon: 35.98,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "MAR_SAMANDAG",
      labelTr: "Samandağ Akdeniz Açıkları",
      lat: 36.04,
      lon: 35.88,
      elevationM: 0,
      role: "marine_upwind"
    },
    {
      key: "COR_BELEN_PASS",
      labelTr: "Belen Geçidi (750m)",
      lat: 36.4889,
      lon: 36.2172,
      elevationM: 750,
      role: "corridor"
    },
    {
      key: "ORO_AMANOS_BOZDAG",
      labelTr: "Amanoslar Bozdağ / Mığır Zirve (2240m)",
      lat: 36.695,
      lon: 36.325,
      elevationM: 2240,
      role: "orographic_wall"
    },
    {
      key: "COR_ISKENDERUN_COAST",
      labelTr: "İskenderun – Payas Yarıkkaya İniş Kıyısı",
      lat: 36.5924,
      lon: 36.1582,
      elevationM: 4,
      role: "corridor"
    },
    {
      key: "FOE_AMIK_REYHANLI",
      labelTr: "Amik Ovası – Reyhanlı Doğu Eşiği (96m)",
      lat: 36.2658,
      lon: 36.4981,
      elevationM: 96,
      role: "foehn_windward"
    },
    {
      key: "LEE_KIRIKHAN_HASSA",
      labelTr: "Kırıkhan – Hassa Amanos Doğu Etek Oluk",
      lat: 36.4917,
      lon: 36.3444,
      elevationM: 250,
      role: "lee_shadow"
    },
    {
      key: "ORO_YAYLADAGI_KEL",
      labelTr: "Yayladağı / Keldağ Güney Sınır Sırtı",
      lat: 35.9081,
      lon: 36.0644,
      elevationM: 437,
      role: "orographic_wall"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -16,
    maxPlausibleTempC: 47,
    minPlausibleMslpHpa: 984,
    maxPlausibleMslpHpa: 1042,
    kalmanTempBiasCapC: 5.5
  }
};

export const PROVINCE_SPEC_TR_31: ProvinceSpec = Object.freeze(specTr31);
export default PROVINCE_SPEC_TR_31;
