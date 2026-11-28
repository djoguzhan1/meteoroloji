import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_79 = TR81_CLIMATOLOGY_1991_2020["TR-79"];
const HYPSO_TR_79 = TR81_HYPSOMETRIC_PROFILES["TR-79"];

function deepFreeze<T>(obj: T): T {
  if (obj && typeof obj === "object" && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      deepFreeze((obj as Record<string, unknown>)[key]);
    }
  }
  return obj;
}

/**
 * ATMOS v5.0 — Wave 3C (REG-21) Bespoke Physical Regime Contract: `TR-79` Kilis
 *
 * Captures the Mediterranean–Mesopotamian Olive Threshold (`~640 m`) & strict Tier-B isolation:
 *  1. Strict `TIER_B_DONOR_KALMAN` & Zero-ICAO METAR Firewall (`icaoWhitelist: []`):
 *     Kilis has no physical aerodrome inside `TR-79`; Gaziantep Oğuzeli (`LTAJ`, `TR-27`) and
 *     foreign Syrian Aleppo (`OSAP`) / Hatay (`LTDA`) are strictly blocked (`interceptC === 0`).
 *  2. Afrin / Hassa–İslahiye Mediterranean Breeze Corridor (`215°–265°`):
 *     Maritime-modified WSW airflow spilling across the Amik–Afrin saddle ventilates Kilis (~640 m),
 *     yielding a classic Mediterranean-transition olive microclimate (~3.3°C cooler summer Tmax
 *     than Şanlıurfa and ~2.0°C milder winter Tmin than the higher 854 m Gaziantep plateau).
 *  3. Musabeyli – Polateli – Darmık/Kartal Dağı (1,264 m) Ridge vs Elbeyli – Aleppo/Resulayn
 *     Border Steppe (460–520 m): northern upslope enhancement on S/SW cyclones paired with
 *     high summer/spring Syrian steppe dust susceptibility (`0.88`).
 */
export const TR_79_KILIS_OLIVE_THRESHOLD_CONTRACT = deepFreeze({
  centerThresholdElevationM: 640,
  darmikKartalPeakM: 1264,
  elbeyliBorderPlainElevationM: 508,
  mediterraneanAfrinBreezeSectorDeg: { fromDeg: 215, toDeg: 265 },
  calibrationMode: "TIER_B_DONOR_ALARO" as const,
  donorProvinces: ["TR-27", "TR-63", "TR-46"] as const,
  allowedMetarIcaos: [] as const,
  blockedNeighborAndForeignMetarIcaos: ["LTAJ", "LTDA", "LTCN", "LTCS", "OSAP", "OSLK"] as const
});

const SPEC_TR_79: ProvinceSpec = {
  provinceCode: "TR-79",
  plateCode: 79,
  slug: "kilis",
  nameTr: "Kilis",
  region: "SOUTHEASTERN_ANATOLIA",
  climateRegion: "GUNEYDOGU",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "SOUTHEAST_THRESHOLD_ARID",
  icaoWhitelist: [],
  domainBounds: {
    minLat: 36.633,
    maxLat: 37.0347,
    minLon: 36.7122,
    maxLon: 37.5727
  },
  primaryCenter: {
    mgmMerkezId: 97901,
    mgmIstNo: 17262,
    mgmSaatlikIstNo: 17262,
    mgmGunlukIstNo: 97901,
    lat: 36.7085,
    lon: 37.1123,
    demVerifiedElevationM: 640,
    subBasinId: "kilis_olive_piedmont_threshold",
    urbanFraction: 0.64,
    monthlyTmaxNormalsC: CLIM_TR_79.tmaxC,
    monthlyTminNormalsC: CLIM_TR_79.tminC
  },
  curatedSubLocations: [
    {
      id: "tr-79-elbeyli-sinir-ovasi",
      name: "Elbeyli – Çobanbey / Halep Sınır Düzlüğü",
      role: "plain",
      lat: 36.6725,
      lon: 37.4731,
      elevationM: 508
    },
    {
      id: "tr-79-kilis-merkez",
      name: "Kilis Merkez (Zeytinlik Eşik · 640 m)",
      role: "plain",
      lat: 36.7085,
      lon: 37.1123,
      elevationM: 640
    },
    {
      id: "tr-79-musabeyli-polateli-yamac",
      name: "Musabeyli – Polateli Yamaç Kuşağı",
      role: "foothill",
      lat: 36.8419,
      lon: 37.1486,
      elevationM: 851
    },
    {
      id: "tr-79-darmik-kartal-sirti",
      name: "Darmık / Kartal Dağı Sırtı (1180–1264 m)",
      role: "summit",
      lat: 36.805,
      lon: 36.865,
      elevationM: 1180
    }
  ],
  subBasins: [
    {
      id: "kilis_olive_piedmont_threshold",
      labelTr: "Kilis Merkez – Öncüpınar Akdeniz–Mezopotamya Zeytinlik Eşiği (560–720 m)",
      polygonOrBbox: {
        minLat: 36.64,
        maxLat: 36.8,
        minLon: 36.96,
        maxLon: 37.26
      },
      elevationRangeM: [560, 720],
      defaultZone: "urban_foothill",
      defaultUrbanFraction: 0.6
    },
    {
      id: "elbeyli_syrian_steppe_plain",
      labelTr: "Elbeyli – Çobanbey – Halep/Resulayn Sınır Bozkır Düzlüğü (450–560 m)",
      polygonOrBbox: {
        minLat: 36.633,
        maxLat: 36.79,
        minLon: 37.26,
        maxLon: 37.5727
      },
      elevationRangeM: [450, 560],
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.22
    },
    {
      id: "musabeyli_polateli_kartal_ridge",
      labelTr: "Musabeyli – Polateli – Darmık/Kartal Dağı Kuzeybatı Sırt Kuşağı (720–1264 m)",
      polygonOrBbox: {
        minLat: 36.77,
        maxLat: 37.0347,
        minLon: 36.7122,
        maxLon: 37.28
      },
      elevationRangeM: [720, 1264],
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.16
    }
  ],
  barrierCouplingMatrix: {
    kilis_olive_piedmont_threshold: {
      kilis_olive_piedmont_threshold: 1.0,
      elbeyli_syrian_steppe_plain: 0.72,
      musabeyli_polateli_kartal_ridge: 0.48
    },
    elbeyli_syrian_steppe_plain: {
      kilis_olive_piedmont_threshold: 0.7,
      elbeyli_syrian_steppe_plain: 1.0,
      musabeyli_polateli_kartal_ridge: 0.28
    },
    musabeyli_polateli_kartal_ridge: {
      kilis_olive_piedmont_threshold: 0.46,
      elbeyli_syrian_steppe_plain: 0.26,
      musabeyli_polateli_kartal_ridge: 1.0
    }
  },
  stationOverrides: {
    "17262": {
      stationId: 17262,
      nameTr: "Kilis Merkez (MGM 17262 · 640 m)",
      lat: 36.7085,
      lon: 37.1123,
      demElevationM: 640,
      subBasinId: "kilis_olive_piedmont_threshold",
      urbanFraction: 0.64,
      coldPoolSusceptibility: 0.24,
      verticalStratumRole: "basin_floor"
    },
    "18155": {
      stationId: 18155,
      nameTr: "Kilis Elbeyli (508 m Suriye Sınır Ovası)",
      lat: 36.6725,
      lon: 37.4731,
      demElevationM: 508,
      subBasinId: "elbeyli_syrian_steppe_plain",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.42,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    },
    "18154": {
      stationId: 18154,
      nameTr: "Kilis Musabeyli (739 m Batı Yamaç & Afrin Boğazı)",
      lat: 36.885,
      lon: 36.9203,
      demElevationM: 739,
      subBasinId: "musabeyli_polateli_kartal_ridge",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.28,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    },
    "18283": {
      stationId: 18283,
      nameTr: "Kilis Polateli (851 m Kuzey Plato Eşiği)",
      lat: 36.8419,
      lon: 37.1486,
      demElevationM: 851,
      subBasinId: "musabeyli_polateli_kartal_ridge",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.3,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }
  },
  verticalProfileSpec: {
    piecewiseKnotsM: [460, 640, 860, 1180],
    maxPhysicalPeakM: HYPSO_TR_79.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_79.bands
  },
  waterBodies: [],
  directionalBarriers: [
    {
      id: "kartal_darmik_sofdagi_south_threshold",
      labelTr: "Kartal / Darmık Dağı (1264 m) & Güney Gaziantep Eşiği — Akdeniz Esintisi Yükselimi & Kuzeyli Fön",
      effectiveBarrierHeightM: 1264,
      crestPressureHpa: 850,
      applicableSubBasins: [
        "kilis_olive_piedmont_threshold",
        "musabeyli_polateli_kartal_ridge",
        "elbeyli_syrian_steppe_plain"
      ],
      foehnSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 10, toDeg: 65 },
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.46,
        sourcePlateauElevationM: 920,
        maxTargetElevationM: 680,
        maxWarmingCapC: 2.8,
        subCloudVirgaFactor: 0.56,
        wetCutoffMmHr: 0.3
      },
      upslopeSpec: {
        enabled: true,
        windFromSectorDeg: { fromDeg: 190, toDeg: 255 },
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.2,
        maxPrecipMultiplierCap: 1.44
      },
      rainShadowSpec: {
        shadowedWindFromSectorDeg: { fromDeg: 15, toDeg: 65 },
        precipAttenuationFactor: 0.64
      }
    }
  ],
  venturiCorridors: [
    {
      id: "afrin_hassa_mediterranean_gap",
      labelTr: "Amik / Afrin – Musabeyli – Kilis BGB Akdeniz Esinti Koridoru",
      centerCoord: { lat: 36.755, lon: 37.02 },
      influenceRadiusKm: 24,
      channelAxisFromDeg: 242,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.28,
      gustMultiplier: 1.38,
      suppressesNocturnalInversion: true
    },
    {
      id: "elbeyli_aleppo_steppe_corridor",
      labelTr: "Elbeyli – Çobanbey / Halep–Resulayn Sınır Bozkır Rüzgar ve Toz Kanalı",
      centerCoord: { lat: 36.6725, lon: 37.4731 },
      influenceRadiusKm: 22,
      channelAxisFromDeg: 170,
      bidirectional: true,
      sectorHalfWidthDeg: 35,
      speedMultiplier: 1.24,
      gustMultiplier: 1.36,
      suppressesNocturnalInversion: false
    }
  ],
  inversionAndWedgeSpec: {
    basinFloorElevationM: 508,
    coldPoolMaxDepthM: 190,
    topographicEnclosureIndex: 0.38,
    deltaPressureTopHpa: 935,
    snowAlbedoFeedback: {
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 3.6
    },
    persistentStratusLock: {
      enabled: true,
      daytimeSolarDampingFactor: 0.78
    },
    shallowColdWedgeRule: {
      surfaceColdSectorDeg: { fromDeg: 20, toDeg: 85 },
      minWindShearVs850Deg: 60
    }
  },
  aridAndSevereDrivers: {
    dustTransportSusceptibility: 0.88,
    invertedVDryMicroburstSusceptibility: 0.76,
    coastalWaterspoutSusceptibility: 0.0
  },
  stencil9Points: [
    {
      key: "TGT_KILIS_17262",
      labelTr: "Kilis Merkez (MGM 17262 · 640 m)",
      lat: 36.7085,
      lon: 37.1123,
      elevationM: 640,
      role: "target"
    },
    {
      key: "COR_AFRIN_BREEZE_INFLOW",
      labelTr: "Afrin – Hassa BGB Akdeniz Esinti Girişi",
      lat: 36.805,
      lon: 36.865,
      elevationM: 920,
      role: "marine_upwind"
    },
    {
      key: "ORO_DARMIK_KARTAL_CREST",
      labelTr: "Darmık / Kartal Dağı Sırtı (1180 m)",
      lat: 36.885,
      lon: 36.9203,
      elevationM: 1180,
      role: "orographic_wall"
    },
    {
      key: "ORO_RAVANDA_NORTH_SLOPE",
      labelTr: "Ravanda – Musabeyli Kuzey Yamaç (810 m)",
      lat: 36.865,
      lon: 37.045,
      elevationM: 810,
      role: "orographic_wall"
    },
    {
      key: "FOE_POLATELI_PLATEAU",
      labelTr: "Polateli Kuzeydoğu Plato Eşiği (851 m)",
      lat: 36.8419,
      lon: 37.1486,
      elevationM: 851,
      role: "foehn_windward"
    },
    {
      key: "COR_ONCUPINAR_GATE",
      labelTr: "Öncüpınar – Azez Güney Sınır Eşiği (585 m)",
      lat: 36.652,
      lon: 37.088,
      elevationM: 585,
      role: "corridor"
    },
    {
      key: "COR_COBANBEY_STEPPE",
      labelTr: "Çobanbey Güneydoğu Sınır Koridoru (520 m)",
      lat: 36.658,
      lon: 37.365,
      elevationM: 520,
      role: "corridor"
    },
    {
      key: "LEE_ELBEYLI_PLAIN",
      labelTr: "Elbeyli Doğu Sınır Düzlüğü (508 m)",
      lat: 36.6725,
      lon: 37.4731,
      elevationM: 508,
      role: "lee_shadow"
    },
    {
      key: "LEE_DOGANCAY_EAST",
      labelTr: "Elbeyli – Oğuzeli Güney Geçiş Ovası (530 m)",
      lat: 36.735,
      lon: 37.395,
      elevationM: 530,
      role: "lee_shadow"
    }
  ],
  qcAndMosBounds: {
    minPlausibleTempC: -18,
    maxPlausibleTempC: 46,
    minPlausibleMslpHpa: 982,
    maxPlausibleMslpHpa: 1044,
    kalmanTempBiasCapC: 5.0
  }
};

export const PROVINCE_SPEC_TR_79: ProvinceSpec = deepFreeze(SPEC_TR_79);
export default PROVINCE_SPEC_TR_79;
