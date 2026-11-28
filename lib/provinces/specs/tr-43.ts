import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_43 = TR81_CLIMATOLOGY_1991_2020["TR-43"];
const HYPSO_TR_43 = TR81_HYPSOMETRIC_PROFILES["TR-43"];

export const TR_43_BESPOKE_MODIFIERS = Object.freeze({
  allowedMetarIcaos: ["LTBZ", "LTBN"] as const,
  coldBasinAirportIcaos: ["LTBZ"] as const,
  bursaBorderLeakagePct: 0.0
});

/**
 * TR-43 Kütahya — Bursa'nın Güney Dağ Komşusu (%0.00 Domaniç–İnegöl Sızıntı Kalkanı, WMO 17155 Tier-A)
 *
 * Fiziksel Karakteristikler:
 *  - Kuzeyde Domaniç Dağları / Kocayayla Eşiği (1500 m+) ile Bursa – İnegöl Ovası'ndan (`TR-16`)
 *    kesin topografik ve idari sınır yalıtımı (`%0.00` istasyon/METAR sızıntısı; `LTBR` yasaklı).
 *  - Kütahya Ovası (`969 m`), Murat Dağı (`2309 m`) ve Akdağ alpin kütleleri.
 *  - Simav – Gediz çöküntü grabeninin mikro-ılımanlığına karşılık Altıntaş / Zafer Havalimanı
 *    (`LTBZ`, `1011 m`) kırsal kapalı çanağında sert gece radyasyon ayazı.
 */
export const PROVINCE_SPEC_TR_43: ProvinceSpec = {
  provinceCode: "TR-43",
  plateCode: 43,
  slug: "kutahya",
  nameTr: "Kütahya",
  region: "AEGEAN",
  climateRegion: "EGE",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "INNER_AEGEAN_STEPPE",
  icaoWhitelist: ["LTBZ", "LTBN"],
  domainBounds: {
    minLat: 38.792,
    maxLat: 39.8717,
    minLon: 28.6163,
    maxLon: 30.4462
  },
  primaryCenter: {
    mgmMerkezId: 94301,
    mgmIstNo: 17155,
    mgmSaatlikIstNo: 17155,
    mgmGunlukIstNo: 94301,
    wmoId: "17155",
    lat: 39.4171,
    lon: 29.9891,
    demVerifiedElevationM: 969,
    subBasinId: "KUTAHYA_CENTRAL_PLAIN",
    urbanFraction: 0.72,
    monthlyTmaxNormalsC: CLIM_TR_43.tmaxC,
    monthlyTminNormalsC: CLIM_TR_43.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-43-simav-graben",
      name: "Simav Çöküntü Ovası (809 m)",
      role: "plain",
      lat: 39.0925,
      lon: 28.9786,
      elevationM: 809
    },
    {
      id: "tr-43-altintas-zafer",
      name: "Altıntaş – Zafer Meydan Ayaz Çanağı",
      role: "plain",
      lat: 39.0594,
      lon: 30.0967,
      elevationM: 1021
    },
    {
      id: "tr-43-domanic",
      name: "Domaniç – Kocayayla Yamaç Kuşağı",
      role: "foothill",
      lat: 39.7853,
      lon: 29.5847,
      elevationM: 886
    },
    {
      id: "tr-43-murat-dagi",
      name: "Murat Dağı Termal Kayak Merkezi (2309 m Kütlesi)",
      role: "summit",
      lat: 38.9425,
      lon: 29.6291,
      elevationM: 1850
    }
  ],
  subBasins: [
    {
      id: "KUTAHYA_CENTRAL_PLAIN",
      labelTr: "Kütahya Ovası & Yukarı Porsuk Havzası (930–1060 m)",
      polygonOrBbox: {
        minLat: 39.3,
        maxLat: 39.58,
        minLon: 29.82,
        maxLon: 30.22
      },
      elevationRangeM: [930, 1060],
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.72
    },
    {
      id: "ALTINTAS_ZAFER_FROST_BASIN",
      labelTr: "Altıntaş – Aslanapa – Zafer Meydan (LTBZ 1011 m) Ayaz Çanağı",
      polygonOrBbox: {
        minLat: 38.82,
        maxLat: 39.28,
        minLon: 29.84,
        maxLon: 30.32
      },
      elevationRangeM: [1000, 1260],
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.08
    },
    {
      id: "SIMAV_GEDIZ_WARM_GRABEN",
      labelTr: "Simav – Gediz – Pazarlar Mikro-Ilıman Çöküntü Ovası",
      polygonOrBbox: {
        minLat: 38.92,
        maxLat: 39.2,
        minLon: 28.75,
        maxLon: 29.48
      },
      elevationRangeM: [700, 960],
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.38
    },
    {
      id: "TAVSANLI_EMET_WEST_PLATEAU",
      labelTr: "Tavşanlı – Emet – Çavdarhisar Batı Eşik Platosu",
      polygonOrBbox: {
        minLat: 39.14,
        maxLat: 39.62,
        minLon: 29.15,
        maxLon: 29.75
      },
      elevationRangeM: [800, 1140],
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.42
    },
    {
      id: "DOMANIC_NORTH_BARRIER_SLOPE",
      labelTr: "Domaniç Dağları – Kocayayla Kuzey Sınır Duvarı (1500 m+)",
      polygonOrBbox: {
        minLat: 39.66,
        maxLat: 39.87,
        minLon: 29.42,
        maxLon: 29.85
      },
      elevationRangeM: [880, 1660],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.16
    },
    {
      id: "MURAT_AKDAG_ALPINE",
      labelTr: "Murat Dağı (2309 m) & Akdağ Alpin Kar Kuşağı",
      polygonOrBbox: {
        minLat: 38.86,
        maxLat: 39.06,
        minLon: 29.48,
        maxLon: 29.8
      },
      elevationRangeM: [1450, 2309],
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.02
    }
  ],
  barrierCouplingMatrix: {
    KUTAHYA_CENTRAL_PLAIN: {
      KUTAHYA_CENTRAL_PLAIN: 1.0,
      ALTINTAS_ZAFER_FROST_BASIN: 0.28,
      SIMAV_GEDIZ_WARM_GRABEN: 0.18,
      TAVSANLI_EMET_WEST_PLATEAU: 0.52,
      DOMANIC_NORTH_BARRIER_SLOPE: 0.34,
      MURAT_AKDAG_ALPINE: 0.22
    },
    ALTINTAS_ZAFER_FROST_BASIN: {
      KUTAHYA_CENTRAL_PLAIN: 0.22,
      ALTINTAS_ZAFER_FROST_BASIN: 1.0,
      SIMAV_GEDIZ_WARM_GRABEN: 0.1,
      TAVSANLI_EMET_WEST_PLATEAU: 0.26,
      DOMANIC_NORTH_BARRIER_SLOPE: 0.14,
      MURAT_AKDAG_ALPINE: 0.28
    },
    SIMAV_GEDIZ_WARM_GRABEN: {
      KUTAHYA_CENTRAL_PLAIN: 0.18,
      ALTINTAS_ZAFER_FROST_BASIN: 0.1,
      SIMAV_GEDIZ_WARM_GRABEN: 1.0,
      TAVSANLI_EMET_WEST_PLATEAU: 0.44,
      DOMANIC_NORTH_BARRIER_SLOPE: 0.12,
      MURAT_AKDAG_ALPINE: 0.36
    },
    TAVSANLI_EMET_WEST_PLATEAU: {
      KUTAHYA_CENTRAL_PLAIN: 0.52,
      ALTINTAS_ZAFER_FROST_BASIN: 0.26,
      SIMAV_GEDIZ_WARM_GRABEN: 0.44,
      TAVSANLI_EMET_WEST_PLATEAU: 1.0,
      DOMANIC_NORTH_BARRIER_SLOPE: 0.48,
      MURAT_AKDAG_ALPINE: 0.28
    },
    DOMANIC_NORTH_BARRIER_SLOPE: {
      KUTAHYA_CENTRAL_PLAIN: 0.34,
      ALTINTAS_ZAFER_FROST_BASIN: 0.14,
      SIMAV_GEDIZ_WARM_GRABEN: 0.12,
      TAVSANLI_EMET_WEST_PLATEAU: 0.48,
      DOMANIC_NORTH_BARRIER_SLOPE: 1.0,
      MURAT_AKDAG_ALPINE: 0.18
    },
    MURAT_AKDAG_ALPINE: {
      KUTAHYA_CENTRAL_PLAIN: 0.2,
      ALTINTAS_ZAFER_FROST_BASIN: 0.26,
      SIMAV_GEDIZ_WARM_GRABEN: 0.34,
      TAVSANLI_EMET_WEST_PLATEAU: 0.28,
      DOMANIC_NORTH_BARRIER_SLOPE: 0.18,
      MURAT_AKDAG_ALPINE: 1.0
    }
  },
  stationOverrides: {
    "17155": {
      stationId: 17155,
      nameTr: "Kütahya Merkez (WMO 17155)",
      lat: 39.4171,
      lon: 29.9891,
      demElevationM: 969,
      subBasinId: "KUTAHYA_CENTRAL_PLAIN",
      urbanFraction: 0.72,
      coldPoolSusceptibility: 0.52,
      verticalStratumRole: "basin_floor"
    },
    LTBZ: {
      stationId: "LTBZ",
      nameTr: "Zafer Havalimanı (Altıntaş Ayaz Çanağı)",
      lat: 39.1114,
      lon: 30.13,
      demElevationM: 1011,
      subBasinId: "ALTINTAS_ZAFER_FROST_BASIN",
      urbanFraction: 0.03,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    LTBN: {
      stationId: "LTBN",
      nameTr: "Kütahya Hava Meydanı",
      lat: 39.4267,
      lon: 30.0169,
      demElevationM: 969,
      subBasinId: "KUTAHYA_CENTRAL_PLAIN",
      urbanFraction: 0.45,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "basin_floor"
    },
    "18093": {
      stationId: 18093,
      nameTr: "Altıntaş",
      lat: 39.0594,
      lon: 30.0967,
      demElevationM: 1021,
      subBasinId: "ALTINTAS_ZAFER_FROST_BASIN",
      urbanFraction: 0.14,
      coldPoolSusceptibility: 0.9,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "17748": {
      stationId: 17748,
      nameTr: "Simav (Mikro-Ilıman Graben)",
      lat: 39.0925,
      lon: 28.9786,
      demElevationM: 809,
      subBasinId: "SIMAV_GEDIZ_WARM_GRABEN",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "coastal_or_gap",
      excludeFromCenterHeadline: true
    },
    "18094": {
      stationId: 18094,
      nameTr: "Domaniç (Kuzey Sınır Yamaç)",
      lat: 39.7853,
      lon: 29.5847,
      demElevationM: 886,
      subBasinId: "DOMANIC_NORTH_BARRIER_SLOPE",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.38,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18603": {
      stationId: 18603,
      nameTr: "Murat Dağı Kayak Merkezi",
      lat: 38.9425,
      lon: 29.6291,
      demElevationM: 1850,
      subBasinId: "MURAT_AKDAG_ALPINE",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [780, 969, 1420, 2050],
    maxPhysicalPeakM: 2309,
    snowElevationBands: HYPSO_TR_43.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "DOMANIC_KOCAYAYLA_NORTH_SHIELD",
      labelTr: "Domaniç Dağları (1500 m+) Kuzey Sınır ve Kar Kalkanı",
      effectiveBarrierHeightM: 1560,
      crestPressureHpa: 850,
      applicableSubBasins: [
        "DOMANIC_NORTH_BARRIER_SLOPE",
        "TAVSANLI_EMET_WEST_PLATEAU",
        "KUTAHYA_CENTRAL_PLAIN"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 185, toDeg: 235 },
        minCrossCrestSpeedMs: 10.0,
        minFroudeNumber: 0.45,
        sourcePlateauElevationM: 980,
        maxTargetElevationM: 975,
        maxWarmingCapC: 2.2,
        subCloudVirgaFactor: 0.2,
        wetCutoffMmHr: 0.8
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 340, toDeg: 50 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.24,
        maxPrecipMultiplierCap: 1.42
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 185, toDeg: 235 },
        precipAttenuationFactor: 0.86
      }
    },
    {
      id: "MURAT_AKDAG_SW_OROG_WALL",
      labelTr: "Murat Dağı (2309 m) & Akdağ Güneybatı Orografik Kütlesi",
      effectiveBarrierHeightM: 2309,
      crestPressureHpa: 750,
      applicableSubBasins: [
        "SIMAV_GEDIZ_WARM_GRABEN",
        "ALTINTAS_ZAFER_FROST_BASIN",
        "MURAT_AKDAG_ALPINE"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 255, toDeg: 295 },
        minCrossCrestSpeedMs: 11.5,
        minFroudeNumber: 0.45,
        sourcePlateauElevationM: 820,
        maxTargetElevationM: 1050,
        maxWarmingCapC: 2.4,
        subCloudVirgaFactor: 0.22,
        wetCutoffMmHr: 0.9
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 190, toDeg: 250 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.28,
        maxPrecipMultiplierCap: 1.54
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 255, toDeg: 295 },
        precipAttenuationFactor: 0.84
      }
    }
  ],
  venturiCorridors: [
    {
      id: "SIMAV_FAULT_GRABEN_FLOW",
      labelTr: "Simav Çöküntü Fayı Batı–Doğu Rüzgar Oluğu",
      centerCoord: { lat: 39.0925, lon: 28.9786 },
      influenceRadiusKm: 20,
      channelAxisFromDeg: 265,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.2,
      gustMultiplier: 1.3,
      suppressesNocturnalInversion: true
    },
    {
      id: "DUMLUPINAR_ALTINTAS_STEPPE_PASS",
      labelTr: "Dumlupınar – Altıntaş Yüksek Bozkır Geçidi",
      centerCoord: { lat: 38.92, lon: 30.04 },
      influenceRadiusKm: 22,
      channelAxisFromDeg: 35,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.24,
      gustMultiplier: 1.36,
      suppressesNocturnalInversion: true
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 969,
    coldPoolMaxDepthM: 280,
    topographicEnclosureIndex: 0.76,
    deltaPressureTopHpa: 850,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 5.4
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.62
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 350, toDeg: 65 },
      minWindShearVs850Deg: 65
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.3,
    invertedVDryMicroburstSusceptibility: 0.44,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TARGET_KUTAHYA_17155",
      labelTr: "Kütahya Merkez (969 m)",
      lat: 39.4171,
      lon: 29.9891,
      elevationM: 969,
      role: "target"
    },
    {
      key: "OROG_DOMANIC_NORTH_CREST",
      labelTr: "Domaniç – Kocayayla Kuzey Sırtı",
      lat: 39.7853,
      lon: 29.5847,
      elevationM: 1450,
      role: "orographic_wall"
    },
    {
      key: "OROG_MURAT_DAGI_SUMMIT",
      labelTr: "Murat Dağı (2309 m Kütlesi)",
      lat: 38.9425,
      lon: 29.6291,
      elevationM: 1850,
      role: "orographic_wall"
    },
    {
      key: "GRABEN_SIMAV_UPWIND",
      labelTr: "Simav Çöküntü Ovası (809 m)",
      lat: 39.0925,
      lon: 28.9786,
      elevationM: 809,
      role: "foehn_windward"
    },
    {
      key: "BASIN_ALTINTAS_LTBZ",
      labelTr: "Altıntaş – Zafer Meydan Ayaz Çanağı",
      lat: 39.1114,
      lon: 30.13,
      elevationM: 1011,
      role: "lee_shadow"
    },
    {
      key: "CORRIDOR_TAVSANLI",
      labelTr: "Tavşanlı Havzası",
      lat: 39.5384,
      lon: 29.4941,
      elevationM: 833,
      role: "corridor"
    },
    {
      key: "VALLEY_GEDIZ",
      labelTr: "Gediz Vadisi (736 m)",
      lat: 38.9947,
      lon: 29.4003,
      elevationM: 736,
      role: "foehn_windward"
    },
    {
      key: "PLATEAU_EMET_CAVDARHISAR",
      labelTr: "Çavdarhisar – Emet Platosu",
      lat: 39.1758,
      lon: 29.5878,
      elevationM: 1056,
      role: "corridor"
    },
    {
      key: "PASS_DUMLUPINAR_SE",
      labelTr: "Dumlupınar Yüksek Eşiği (1250 m)",
      lat: 38.8526,
      lon: 29.9789,
      elevationM: 1250,
      role: "orographic_wall"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -30,
    maxPlausibleTempC: 42,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 6.0
  }
};

export default PROVINCE_SPEC_TR_43;
