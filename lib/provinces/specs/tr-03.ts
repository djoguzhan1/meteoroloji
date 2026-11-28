import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_03 = TR81_CLIMATOLOGY_1991_2020["TR-03"];
const HYPSO_TR_03 = TR81_HYPSOMETRIC_PROFILES["TR-03"];

export const TR_03_BESPOKE_MODIFIERS = Object.freeze({
  allowedMetarIcaos: ["LTAH"] as const,
  coldBasinAirportIcaos: ["LTAH"] as const,
  kalmanTempBiasCapC: 6.5,
  snowpackBoostFactor: 1.45,
  winterExtremeRadiativeFloorC: -27.0
});

/**
 * TR-03 Afyonkarahisar — Anadolu Kavşağı Kapalı Havza & Kar Çanağı (1034 m Merkez, WMO 17190 Tier-A)
 *
 * Fiziksel Karakteristikler:
 *  - Akdeniz nemli siklonlarının (165°–235°) İç Anadolu soğuk kamasıyla (20°–95°) çarpıştığı
 *    yoğun cephesel kar ve tipi kavşağı (Kocatepe – Köroğlu Beli – Sultandağları 2519 m).
 *  - Kışın taze kar örtüsü üstünde Akarçay – Eber kapalı havzasında sert gece radyasyon ayazı
 *    (-22..-27°C; `kalmanTempBiasCapC: 6.5`, `snowpackBoostFactor: 1.45`).
 *  - Batıda Dinar – Başmakçı – Sandıklı basamağı ile doğuda Eber – Bolvadin – Çay kapalı havza
 *    donan sis / stratus kilidi ayrımı.
 */
export const PROVINCE_SPEC_TR_03: ProvinceSpec = {
  provinceCode: "TR-03",
  plateCode: 3,
  slug: "afyonkarahisar",
  nameTr: "Afyonkarahisar",
  region: "AEGEAN",
  climateRegion: "EGE",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "INLAND_PASS_PLATEAU",
  icaoWhitelist: ["LTAH"],
  domainBounds: {
    minLat: 37.7775,
    maxLat: 39.267,
    minLon: 29.661,
    maxLon: 31.732
  },
  primaryCenter: {
    mgmMerkezId: 90301,
    mgmIstNo: 17190,
    mgmSaatlikIstNo: 17190,
    mgmGunlukIstNo: 90301,
    wmoId: "17190",
    lat: 38.738,
    lon: 30.5604,
    demVerifiedElevationM: 1034,
    subBasinId: "AFYON_AKARCAY_SNOW_BASIN",
    urbanFraction: 0.68,
    monthlyTmaxNormalsC: CLIM_TR_03.tmaxC,
    monthlyTminNormalsC: CLIM_TR_03.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-03-dinar",
      name: "Dinar (Menderes Kaynak Basamağı)",
      role: "plain",
      lat: 38.0597,
      lon: 30.1531,
      elevationM: 864
    },
    {
      id: "tr-03-bolvadin-eber",
      name: "Bolvadin – Eber Kapalı Havzası",
      role: "plain",
      lat: 38.7268,
      lon: 31.0477,
      elevationM: 1018
    },
    {
      id: "tr-03-sandikli",
      name: "Sandıklı – Kumalar Yamaç",
      role: "foothill",
      lat: 38.4558,
      lon: 30.2313,
      elevationM: 1040
    },
    {
      id: "tr-03-sultandaglari",
      name: "Sultandağları / Kocatepe Yüksek Kuşak",
      role: "summit",
      lat: 38.51,
      lon: 31.18,
      elevationM: 2100
    }
  ],
  subBasins: [
    {
      id: "AFYON_AKARCAY_SNOW_BASIN",
      labelTr: "Afyonkarahisar Merkez – Akarçay Kar ve Ayaz Çanağı",
      polygonOrBbox: {
        minLat: 38.62,
        maxLat: 38.92,
        minLon: 30.38,
        maxLon: 30.88
      },
      elevationRangeM: [995, 1120],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.68
    },
    {
      id: "EBER_AKSEHIR_FOG_BASIN",
      labelTr: "Bolvadin – Çay – Eber Kapalı Havza Sis Tabanı",
      polygonOrBbox: {
        minLat: 38.52,
        maxLat: 38.86,
        minLon: 30.88,
        maxLon: 31.38
      },
      elevationRangeM: [960, 1060],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.22
    },
    {
      id: "DINAR_SANDIKLI_WEST_STEP",
      labelTr: "Dinar – Başmakçı – Sandıklı Batı Basamağı",
      polygonOrBbox: {
        minLat: 37.82,
        maxLat: 38.56,
        minLon: 29.78,
        maxLon: 30.38
      },
      elevationRangeM: [860, 1180],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.36
    },
    {
      id: "SINANPASA_KOCATEPE_PASS",
      labelTr: "Sinanpaşa – Kocatepe – Şuhut Cephe ve Tipi Eşiği",
      polygonOrBbox: {
        minLat: 38.45,
        maxLat: 39.08,
        minLon: 29.95,
        maxLon: 30.62
      },
      elevationRangeM: [1080, 1875],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.2
    },
    {
      id: "EMIRDAG_NORTH_STEPPE",
      labelTr: "Emirdağ – Bayat Kuzey Bozkır Platosu",
      polygonOrBbox: {
        minLat: 38.88,
        maxLat: 39.25,
        minLon: 30.82,
        maxLon: 31.68
      },
      elevationRangeM: [970, 2060],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.25
    },
    {
      id: "SULTANDAGLARI_ALPINE",
      labelTr: "Sultandağları (2519 m) & Akdağ Alpin Kuşağı",
      polygonOrBbox: {
        minLat: 38.28,
        maxLat: 38.62,
        minLon: 30.95,
        maxLon: 31.48
      },
      elevationRangeM: [1450, 2519],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.03
    }
  ],
  barrierCouplingMatrix: {
    AFYON_AKARCAY_SNOW_BASIN: {
      AFYON_AKARCAY_SNOW_BASIN: 1.0,
      EBER_AKSEHIR_FOG_BASIN: 0.74,
      DINAR_SANDIKLI_WEST_STEP: 0.32,
      SINANPASA_KOCATEPE_PASS: 0.56,
      EMIRDAG_NORTH_STEPPE: 0.48,
      SULTANDAGLARI_ALPINE: 0.24
    },
    EBER_AKSEHIR_FOG_BASIN: {
      AFYON_AKARCAY_SNOW_BASIN: 0.72,
      EBER_AKSEHIR_FOG_BASIN: 1.0,
      DINAR_SANDIKLI_WEST_STEP: 0.18,
      SINANPASA_KOCATEPE_PASS: 0.34,
      EMIRDAG_NORTH_STEPPE: 0.52,
      SULTANDAGLARI_ALPINE: 0.3
    },
    DINAR_SANDIKLI_WEST_STEP: {
      AFYON_AKARCAY_SNOW_BASIN: 0.32,
      EBER_AKSEHIR_FOG_BASIN: 0.18,
      DINAR_SANDIKLI_WEST_STEP: 1.0,
      SINANPASA_KOCATEPE_PASS: 0.46,
      EMIRDAG_NORTH_STEPPE: 0.16,
      SULTANDAGLARI_ALPINE: 0.22
    },
    SINANPASA_KOCATEPE_PASS: {
      AFYON_AKARCAY_SNOW_BASIN: 0.56,
      EBER_AKSEHIR_FOG_BASIN: 0.34,
      DINAR_SANDIKLI_WEST_STEP: 0.46,
      SINANPASA_KOCATEPE_PASS: 1.0,
      EMIRDAG_NORTH_STEPPE: 0.38,
      SULTANDAGLARI_ALPINE: 0.44
    },
    EMIRDAG_NORTH_STEPPE: {
      AFYON_AKARCAY_SNOW_BASIN: 0.48,
      EBER_AKSEHIR_FOG_BASIN: 0.52,
      DINAR_SANDIKLI_WEST_STEP: 0.16,
      SINANPASA_KOCATEPE_PASS: 0.38,
      EMIRDAG_NORTH_STEPPE: 1.0,
      SULTANDAGLARI_ALPINE: 0.2
    },
    SULTANDAGLARI_ALPINE: {
      AFYON_AKARCAY_SNOW_BASIN: 0.22,
      EBER_AKSEHIR_FOG_BASIN: 0.28,
      DINAR_SANDIKLI_WEST_STEP: 0.22,
      SINANPASA_KOCATEPE_PASS: 0.44,
      EMIRDAG_NORTH_STEPPE: 0.2,
      SULTANDAGLARI_ALPINE: 1.0
    }
  },
  stationOverrides: {
    "17190": {
      stationId: 17190,
      nameTr: "Afyonkarahisar Bölge (WMO 17190)",
      lat: 38.738,
      lon: 30.5604,
      demElevationM: 1034,
      subBasinId: "AFYON_AKARCAY_SNOW_BASIN",
      urbanFraction: 0.68,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "basin_floor"
    },
    LTAH: {
      stationId: "LTAH",
      nameTr: "Afyonkarahisar Hava Meydanı",
      lat: 38.7264,
      lon: 30.6011,
      demElevationM: 1009,
      subBasinId: "AFYON_AKARCAY_SNOW_BASIN",
      urbanFraction: 0.08,
      coldPoolSusceptibility: 0.92,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17796": {
      stationId: 17796,
      nameTr: "Bolvadin (Eber Havzası)",
      lat: 38.7268,
      lon: 31.0477,
      demElevationM: 1018,
      subBasinId: "EBER_AKSEHIR_FOG_BASIN",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17862": {
      stationId: 17862,
      nameTr: "Dinar",
      lat: 38.0597,
      lon: 30.1531,
      demElevationM: 864,
      subBasinId: "DINAR_SANDIKLI_WEST_STEP",
      urbanFraction: 0.4,
      coldPoolSusceptibility: 0.38,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18002": {
      stationId: 18002,
      nameTr: "Sandıklı",
      lat: 38.4558,
      lon: 30.2313,
      demElevationM: 1040,
      subBasinId: "DINAR_SANDIKLI_WEST_STEP",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.56,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [960, 1034, 1450, 2100],
    maxPhysicalPeakM: 2519,
    snowElevationBands: HYPSO_TR_03.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "SULTANDAGLARI_FRONTAL_CONVERGENCE_WALL",
      labelTr: "Sultandağları (2519 m) Cephesel Kar ve Yamaç Kaldırma Duvarı",
      effectiveBarrierHeightM: 2519,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "AFYON_AKARCAY_SNOW_BASIN",
        "EBER_AKSEHIR_FOG_BASIN",
        "SULTANDAGLARI_ALPINE"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 250, toDeg: 305 },
        minCrossCrestSpeedMs: 11.0,
        minFroudeNumber: 0.45,
        sourcePlateauElevationM: 1050,
        maxTargetElevationM: 1060,
        maxWarmingCapC: 2.2,
        subCloudVirgaFactor: 0.18,
        wetCutoffMmHr: 0.8
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 165, toDeg: 245 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.24,
        maxPrecipMultiplierCap: 1.45
      }
    },
    {
      id: "EMIRDAG_KOCATEPE_COLD_WEDGE_BARRIER",
      labelTr: "Emir Dağları & Kocatepe Kar/Tipi Sıkışma Kuşağı",
      effectiveBarrierHeightM: 2066,
      crestPressureHpa: 800,
      applicableSubBasins: [
        "AFYON_AKARCAY_SNOW_BASIN",
        "SINANPASA_KOCATEPE_PASS",
        "EMIRDAG_NORTH_STEPPE"
      ],
      foehnSpec: {
        enabled: false,
        windFromSectorDeg: { fromDeg: 190, toDeg: 230 },
        minCrossCrestSpeedMs: 12.0,
        minFroudeNumber: 0.5,
        sourcePlateauElevationM: 1000,
        maxTargetElevationM: 1050,
        maxWarmingCapC: 1.5,
        subCloudVirgaFactor: 0.15,
        wetCutoffMmHr: 0.5
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 15, toDeg: 85 },
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.22,
        maxPrecipMultiplierCap: 1.45
      }
    }
  ],
  venturiCorridors: [
    {
      id: "KOROGLU_KOCATEPE_BLIZZARD_GAP",
      labelTr: "Köroğlu Beli – Sinanpaşa Tipi Koridoru",
      centerCoord: { lat: 38.8, lon: 30.32 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 35,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.3,
      gustMultiplier: 1.42,
      suppressesNocturnalInversion: true
    },
    {
      id: "DINAR_DOMBAYOVA_THRESHOLD",
      labelTr: "Dinar – Dombayova Güneybatı Siklon Giriş Boğazı",
      centerCoord: { lat: 38.12, lon: 30.16 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 205,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.22,
      gustMultiplier: 1.34,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 1005,
    coldPoolMaxDepthM: 360,
    topographicEnclosureIndex: 0.88,
    deltaPressureTopHpa: 850,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 7.8
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.54
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 20, toDeg: 95 },
      minWindShearVs850Deg: 60
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.36,
    invertedVDryMicroburstSusceptibility: 0.48,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TARGET_AFYON_17190",
      labelTr: "Afyonkarahisar Merkez (1034 m)",
      lat: 38.738,
      lon: 30.5604,
      elevationM: 1034,
      role: "target"
    },
    {
      key: "UPWIND_DINAR_SW",
      labelTr: "Dinar Güneybatı Siklon Kapısı",
      lat: 38.0597,
      lon: 30.1531,
      elevationM: 864,
      role: "foehn_windward"
    },
    {
      key: "OROG_SULTANDAGLARI_CREST",
      labelTr: "Sultandağları Gelincikana Sırtı",
      lat: 38.51,
      lon: 31.18,
      elevationM: 2250,
      role: "orographic_wall"
    },
    {
      key: "OROG_KUMALAR_AKDAG",
      labelTr: "Kumalar – Sandıklı Akdağ Kütlesi",
      lat: 38.36,
      lon: 30.08,
      elevationM: 1920,
      role: "orographic_wall"
    },
    {
      key: "OROG_EMIRDAG_NORTH",
      labelTr: "Emir Dağları Kuzeydoğu Duvarı",
      lat: 38.94,
      lon: 31.22,
      elevationM: 1880,
      role: "orographic_wall"
    },
    {
      key: "CORRIDOR_SINANPASA_PASS",
      labelTr: "Sinanpaşa – Dumlupınar Geçidi",
      lat: 38.7415,
      lon: 30.2352,
      elevationM: 1164,
      role: "corridor"
    },
    {
      key: "BASIN_BOLVADIN_EBER",
      labelTr: "Bolvadin – Eber Sis Çanağı",
      lat: 38.7268,
      lon: 31.0477,
      elevationM: 1018,
      role: "lee_shadow"
    },
    {
      key: "STEP_SANDIKLI_BASIN",
      labelTr: "Sandıklı Ovası",
      lat: 38.4558,
      lon: 30.2313,
      elevationM: 1040,
      role: "corridor"
    },
    {
      key: "NORTH_IHSANIYE_PLATEAU",
      labelTr: "İhsaniye Frigya Platosu",
      lat: 39.0343,
      lon: 30.395,
      elevationM: 1078,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -32,
    maxPlausibleTempC: 42,
    minPlausibleMslpHpa: 976,
    maxPlausibleMslpHpa: 1048,
    kalmanTempBiasCapC: 6.5
  }
};

export default PROVINCE_SPEC_TR_03;
