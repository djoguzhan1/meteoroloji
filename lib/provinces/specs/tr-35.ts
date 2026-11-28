import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_35 = TR81_CLIMATOLOGY_1991_2020["TR-35"];
const HYPSO_TR_35 = TR81_HYPSOMETRIC_PROFILES["TR-35"];

/**
 * Wave 3A (REG-03) — `TR-35` İzmir Bespoke Physical & Microclimatic Specification:
 *  - Famous Afternoon İmbat Sea Breeze (`275°–315°` WNW–NW): cools Konak / Alsancak / Karşıyaka
 *    by up to `3.4°C` (`maxInlandPenetrationKm: 22`), decaying inland across Bornova / Buca.
 *  - Cumaovası (`LTBJ` / `17219`) Rural Basin Frost-Hollow vs Konak/Alsancak Urban Core UHI:
 *    decoupled via `barrierCouplingMatrix` (`0.14`) and `coldPoolSusceptibility: 0.90` +
 *    `excludeFromCenterHeadline: true` so clear winter night airport frost does not bias İzmir Bay.
 *  - Çeşme / Alaçatı / Karaburun Etesian & Poyraz Channel (`speedMultiplier: 1.38`),
 *    Yamanlar / Nif / Bozdağlar (`2159 m`) orographic wall, and intense southerly Mediterranean
 *    convective squalls (`coastalWaterspoutSusceptibility: 0.68`).
 *  - Strict METAR Whitelist: `icaoWhitelist: ["LTBJ"]` (blocks Chios `LGHI`, Samos `LGSM`, Lesbos `LGMT`).
 */
export const PROVINCE_SPEC_TR_35: ProvinceSpec = Object.freeze({
  provinceCode: "TR-35",
  plateCode: 35,
  slug: "izmir",
  nameTr: "İzmir",
  region: "AEGEAN",
  climateRegion: "EGE",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "AEGEAN_COASTAL_GRABEN",
  icaoWhitelist: Object.freeze(["LTBJ"]),
  domainBounds: Object.freeze({
    minLat: 37.88,
    maxLat: 39.38,
    minLon: 26.21,
    maxLon: 28.49
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 93501,
    mgmIstNo: 17220,
    mgmSaatlikIstNo: 17220,
    mgmGunlukIstNo: 93501,
    wmoId: "17220",
    lat: 38.4049,
    lon: 27.1895,
    demVerifiedElevationM: 29,
    subBasinId: "TR35_INNER_BAY_URBAN_CORE",
    urbanFraction: 0.88,
    monthlyTmaxNormalsC: CLIM_TR_35.tmaxC,
    monthlyTminNormalsC: CLIM_TR_35.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "izmir-konak-kordon",
      name: "Konak / Alsancak Kordon Kıyısı",
      role: "coast",
      lat: 38.4292,
      lon: 27.1317,
      elevationM: 5
    }),
    Object.freeze({
      id: "izmir-cesme-alacati",
      name: "Çeşme / Alaçatı Yarımadası",
      role: "coast",
      lat: 38.3036,
      lon: 26.3724,
      elevationM: 5
    }),
    Object.freeze({
      id: "izmir-bornova-ova",
      name: "Bornova / İç Körfez Ovası",
      role: "plain",
      lat: 38.4517,
      lon: 27.1979,
      elevationM: 28
    }),
    Object.freeze({
      id: "izmir-yamanlar-sabuncubeli",
      name: "Yamanlar / Sabuncubeli Yamaç",
      role: "foothill",
      lat: 38.546,
      lon: 27.192,
      elevationM: 680
    }),
    Object.freeze({
      id: "izmir-bozdag-kayak",
      name: "Bozdağ Kayak Merkezi (Ödemiş)",
      role: "summit",
      lat: 38.3316,
      lon: 28.1149,
      elevationM: 1527
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR35_INNER_BAY_URBAN_CORE",
      labelTr: "İzmir İç Körfez Kentsel UHI & İmbat Çekirdeği (Konak – Karşıyaka – Balçova)",
      polygonOrBbox: Object.freeze({
        minLat: 38.35,
        maxLat: 38.54,
        minLon: 26.86,
        maxLon: 27.22
      }),
      elevationRangeM: Object.freeze([0, 165] as const),
      defaultZone: "coastal_marine",
      defaultUrbanFraction: 0.86
    }),
    Object.freeze({
      id: "TR35_CESME_KARABURUN_PENINSULA",
      labelTr: "Çeşme – Karaburun – Urla – Foça Açık Ege Yarımadası",
      polygonOrBbox: Object.freeze({
        minLat: 38.12,
        maxLat: 38.76,
        minLon: 26.21,
        maxLon: 26.88
      }),
      elevationRangeM: Object.freeze([0, 340] as const),
      defaultZone: "peninsula_exposed",
      defaultUrbanFraction: 0.36
    }),
    Object.freeze({
      id: "TR35_CUMAOVASI_MENDERES_BASIN",
      labelTr: "Cumaovası (LTBJ) – Menderes – Torbalı – Selçuk Kırsal Ayaz Çanağı",
      polygonOrBbox: Object.freeze({
        minLat: 37.9,
        maxLat: 38.34,
        minLon: 27.02,
        maxLon: 27.46
      }),
      elevationRangeM: Object.freeze([5, 220] as const),
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.18
    }),
    Object.freeze({
      id: "TR35_BORNOVA_KEMALPASA_GAP",
      labelTr: "Bornova – Buca – Kemalpaşa İç Körfez Geçit Vadisi",
      polygonOrBbox: Object.freeze({
        minLat: 38.34,
        maxLat: 38.52,
        minLon: 27.18,
        maxLon: 27.52
      }),
      elevationRangeM: Object.freeze([15, 380] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.64
    }),
    Object.freeze({
      id: "TR35_KUCUK_MENDERES_BAKIRCA_VALLEY",
      labelTr: "Ödemiş – Tire – Bayındır – Bergama İç Graben Ovası",
      polygonOrBbox: Object.freeze({
        minLat: 38.02,
        maxLat: 39.32,
        minLon: 26.95,
        maxLon: 28.38
      }),
      elevationRangeM: Object.freeze([10, 420] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.42
    }),
    Object.freeze({
      id: "TR35_YAMANLAR_NIF_BOZDAG_MASSIF",
      labelTr: "Yamanlar – Nif Dağı – Bozdağlar Orografik Zirve Kuşağı",
      polygonOrBbox: Object.freeze({
        minLat: 38.22,
        maxLat: 38.62,
        minLon: 27.12,
        maxLon: 28.28
      }),
      elevationRangeM: Object.freeze([450, 2159] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.06
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR35_INNER_BAY_URBAN_CORE: Object.freeze({
      TR35_INNER_BAY_URBAN_CORE: 1.0,
      TR35_CESME_KARABURUN_PENINSULA: 0.58,
      TR35_CUMAOVASI_MENDERES_BASIN: 0.14,
      TR35_BORNOVA_KEMALPASA_GAP: 0.64,
      TR35_KUCUK_MENDERES_BAKIRCA_VALLEY: 0.16,
      TR35_YAMANLAR_NIF_BOZDAG_MASSIF: 0.18
    }),
    TR35_CESME_KARABURUN_PENINSULA: Object.freeze({
      TR35_INNER_BAY_URBAN_CORE: 0.58,
      TR35_CESME_KARABURUN_PENINSULA: 1.0,
      TR35_CUMAOVASI_MENDERES_BASIN: 0.22,
      TR35_BORNOVA_KEMALPASA_GAP: 0.36,
      TR35_KUCUK_MENDERES_BAKIRCA_VALLEY: 0.18,
      TR35_YAMANLAR_NIF_BOZDAG_MASSIF: 0.14
    }),
    TR35_CUMAOVASI_MENDERES_BASIN: Object.freeze({
      TR35_INNER_BAY_URBAN_CORE: 0.14,
      TR35_CESME_KARABURUN_PENINSULA: 0.22,
      TR35_CUMAOVASI_MENDERES_BASIN: 1.0,
      TR35_BORNOVA_KEMALPASA_GAP: 0.34,
      TR35_KUCUK_MENDERES_BAKIRCA_VALLEY: 0.46,
      TR35_YAMANLAR_NIF_BOZDAG_MASSIF: 0.15
    }),
    TR35_BORNOVA_KEMALPASA_GAP: Object.freeze({
      TR35_INNER_BAY_URBAN_CORE: 0.64,
      TR35_CESME_KARABURUN_PENINSULA: 0.36,
      TR35_CUMAOVASI_MENDERES_BASIN: 0.34,
      TR35_BORNOVA_KEMALPASA_GAP: 1.0,
      TR35_KUCUK_MENDERES_BAKIRCA_VALLEY: 0.38,
      TR35_YAMANLAR_NIF_BOZDAG_MASSIF: 0.28
    }),
    TR35_KUCUK_MENDERES_BAKIRCA_VALLEY: Object.freeze({
      TR35_INNER_BAY_URBAN_CORE: 0.16,
      TR35_CESME_KARABURUN_PENINSULA: 0.18,
      TR35_CUMAOVASI_MENDERES_BASIN: 0.46,
      TR35_BORNOVA_KEMALPASA_GAP: 0.38,
      TR35_KUCUK_MENDERES_BAKIRCA_VALLEY: 1.0,
      TR35_YAMANLAR_NIF_BOZDAG_MASSIF: 0.26
    }),
    TR35_YAMANLAR_NIF_BOZDAG_MASSIF: Object.freeze({
      TR35_INNER_BAY_URBAN_CORE: 0.18,
      TR35_CESME_KARABURUN_PENINSULA: 0.14,
      TR35_CUMAOVASI_MENDERES_BASIN: 0.15,
      TR35_BORNOVA_KEMALPASA_GAP: 0.28,
      TR35_KUCUK_MENDERES_BAKIRCA_VALLEY: 0.26,
      TR35_YAMANLAR_NIF_BOZDAG_MASSIF: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17220": Object.freeze({
      stationId: 17220,
      nameTr: "İzmir Bölge (Konak / Güzelyalı)",
      lat: 38.3949,
      lon: 27.0819,
      demElevationM: 25,
      subBasinId: "TR35_INNER_BAY_URBAN_CORE",
      urbanFraction: 0.88,
      coldPoolSusceptibility: 0.06,
      verticalStratumRole: "basin_floor"
    }),
    LTBJ: Object.freeze({
      stationId: "LTBJ",
      nameTr: "İzmir Adnan Menderes Havalimanı (Cumaovası Çanak)",
      lat: 38.2924,
      lon: 27.157,
      demElevationM: 125,
      subBasinId: "TR35_CUMAOVASI_MENDERES_BASIN",
      urbanFraction: 0.08,
      coldPoolSusceptibility: 0.9,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "17219": Object.freeze({
      stationId: 17219,
      nameTr: "Adnan Menderes Havalimanı (Cumaovası)",
      lat: 38.295,
      lon: 27.1481,
      demElevationM: 125,
      subBasinId: "TR35_CUMAOVASI_MENDERES_BASIN",
      urbanFraction: 0.08,
      coldPoolSusceptibility: 0.9,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "17221": Object.freeze({
      stationId: 17221,
      nameTr: "Çeşme Yarımadası",
      lat: 38.3036,
      lon: 26.3724,
      demElevationM: 5,
      subBasinId: "TR35_CESME_KARABURUN_PENINSULA",
      urbanFraction: 0.38,
      coldPoolSusceptibility: 0.04,
      verticalStratumRole: "coastal_or_gap"
    }),
    "18032": Object.freeze({
      stationId: 18032,
      nameTr: "Karaburun Boğaz Sırtı",
      lat: 38.6401,
      lon: 26.5081,
      demElevationM: 132,
      subBasinId: "TR35_CESME_KARABURUN_PENINSULA",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.05,
      verticalStratumRole: "coastal_or_gap"
    }),
    "17822": Object.freeze({
      stationId: 17822,
      nameTr: "Ödemiş (Küçük Menderes Ovası)",
      lat: 38.2157,
      lon: 27.9642,
      demElevationM: 111,
      subBasinId: "TR35_KUCUK_MENDERES_BAKIRCA_VALLEY",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "19135": Object.freeze({
      stationId: 19135,
      nameTr: "Bozdağ Kayak Merkezi",
      lat: 38.3316,
      lon: 28.1149,
      demElevationM: 1527,
      subBasinId: "TR35_YAMANLAR_NIF_BOZDAG_MASSIF",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.06,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([25, 420, 1120, 1680] as const),
    maxPhysicalPeakM: HYPSO_TR_35.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_35.bands
  }),
  waterBodies: Object.freeze([
    Object.freeze({
      id: "TR35_IZMIR_GULF_AEGEAN",
      labelTr: "İzmir Körfezi & Orta Ege Denizi (İmbat Koridoru)",
      kind: "open_sea",
      mgmMarineStationIds: Object.freeze([
        17220, 17442, 17383, 17440, 17384, 17221, 17444, 17180
      ]),
      sampleCoord: Object.freeze({ lat: 38.4292, lon: 27.1317 }),
      useOpenMeteoMarineApi: true,
      surfaceElevationM: 0,
      freezingPointC: -1.9,
      monthlyWaterTempNormalsC: Object.freeze([
        15.2, 14.8, 15.4, 16.9, 19.8, 23.2, 25.1, 25.4, 23.6, 20.8, 18.1, 16.2
      ] as const),
      subBasinInfluenceWeights: Object.freeze({
        TR35_INNER_BAY_URBAN_CORE: 1.0,
        TR35_CESME_KARABURUN_PENINSULA: 1.0,
        TR35_BORNOVA_KEMALPASA_GAP: 0.56,
        TR35_CUMAOVASI_MENDERES_BASIN: 0.34,
        TR35_KUCUK_MENDERES_BAKIRCA_VALLEY: 0.14,
        TR35_YAMANLAR_NIF_BOZDAG_MASSIF: 0.22
      }),
      onshoreWindSectorDeg: Object.freeze({ fromDeg: 245, toDeg: 325 }),
      effectiveFetchKm: 240,
      convectiveInstabilityUpperHpa: 850,
      dekWatchDeltaTC: 13.0,
      dekHeavyDeltaTC: 16.0,
      seaBreezeSpec: Object.freeze({
        activeMonths: Object.freeze([4, 10] as const),
        sectorDeg: Object.freeze({ fromDeg: 275, toDeg: 315 }),
        maxInlandPenetrationKm: 22,
        maxCoolingAmplitudeC: 3.4
      })
    })
  ]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR35_YAMANLAR_NIF_BOZDAG_CONVECTIVE_WALL",
      labelTr: "Yamanlar – Nif Dağı – Bozdağlar Akdeniz Siklonik Konveksiyon & Fön Duvarı",
      effectiveBarrierHeightM: 1650,
      crestPressureHpa: 850,
      applicableSubBasins: Object.freeze([
        "TR35_INNER_BAY_URBAN_CORE",
        "TR35_BORNOVA_KEMALPASA_GAP",
        "TR35_CUMAOVASI_MENDERES_BASIN",
        "TR35_YAMANLAR_NIF_BOZDAG_MASSIF"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 45, toDeg: 105 }),
        minCrossCrestSpeedMs: 8.5,
        minFroudeNumber: 0.46,
        sourcePlateauElevationM: 650,
        maxTargetElevationM: 180,
        maxWarmingCapC: 2.2,
        subCloudVirgaFactor: 0.3,
        wetCutoffMmHr: 1.5
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 165, toDeg: 245 }),
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.28,
        maxPrecipMultiplierCap: 1.78
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 15, toDeg: 65 }),
        precipAttenuationFactor: 0.75
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR35_CESME_KARABURUN_ETESIAN_JET",
      labelTr: "Çeşme – Alaçatı – Karaburun Etesian / Poyraz Kanalı",
      centerCoord: Object.freeze({ lat: 38.285, lon: 26.385 }),
      influenceRadiusKm: 24,
      channelAxisFromDeg: 15,
      bidirectional: true,
      sectorHalfWidthDeg: 35,
      speedMultiplier: 1.38,
      gustMultiplier: 1.48,
      suppressesNocturnalInversion: true
    }),
    Object.freeze({
      id: "TR35_INNER_GULF_IMBAT_FUNNEL",
      labelTr: "İzmir İç Körfez (Narlıdere – Yenikale) İmbat Kanalı",
      centerCoord: Object.freeze({ lat: 38.418, lon: 27.012 }),
      influenceRadiusKm: 15,
      channelAxisFromDeg: 295,
      bidirectional: false,
      sectorHalfWidthDeg: 25,
      speedMultiplier: 1.22,
      gustMultiplier: 1.3,
      suppressesNocturnalInversion: false
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 25,
    coldPoolMaxDepthM: 190,
    topographicEnclosureIndex: 0.62,
    deltaPressureTopHpa: 975,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 1.4
    }),
    persistentStratusLock: Object.freeze({
      enabled: false,
      daytimeSolarDampingFactor: 0.85
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.64,
    invertedVDryMicroburstSusceptibility: 0.36,
    coastalWaterspoutSusceptibility: 0.68
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "konak_bay_center",
      labelTr: "Konak / Güzelyalı Körfez Merkez",
      lat: 38.4049,
      lon: 27.1895,
      elevationM: 29,
      role: "target"
    }),
    Object.freeze({
      key: "narlidere_gulf_buoy",
      labelTr: "İzmir Körfezi İmbat Girişi (Urla / Narlıdere)",
      lat: 38.4212,
      lon: 26.9178,
      elevationM: 2,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "cesme_aegean_upwind",
      labelTr: "Çeşme Açık Ege Rüzgâr-Üstü",
      lat: 38.3036,
      lon: 26.3724,
      elevationM: 5,
      role: "marine_upwind"
    }),
    Object.freeze({
      key: "karaburun_north_gate",
      labelTr: "Karaburun Poyraz / Etesian Kapısı",
      lat: 38.6401,
      lon: 26.5081,
      elevationM: 132,
      role: "corridor"
    }),
    Object.freeze({
      key: "bornova_kemalpasa_corridor",
      labelTr: "Bornova – Belkahve İç Koridor",
      lat: 38.4517,
      lon: 27.245,
      elevationM: 95,
      role: "corridor"
    }),
    Object.freeze({
      key: "cumaovasi_ltbj_basin",
      labelTr: "Gaziemir / Cumaovası (LTBJ) Kırsal Çanak",
      lat: 38.295,
      lon: 27.1481,
      elevationM: 125,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "yamanlar_north_wall",
      labelTr: "Yamanlar Dağı Güney Yamaç",
      lat: 38.546,
      lon: 27.192,
      elevationM: 880,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "bozdag_alpine_summit",
      labelTr: "Ödemiş Bozdağ Kayak / Zirve Duvarı",
      lat: 38.3316,
      lon: 28.1149,
      elevationM: 1527,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "odemis_inner_graben",
      labelTr: "Ödemiş Küçük Menderes İç Ovası",
      lat: 38.2157,
      lon: 27.9642,
      elevationM: 111,
      role: "lee_shadow"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -14,
    maxPlausibleTempC: 47,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1044,
    kalmanTempBiasCapC: 4.8
  })
});

export default PROVINCE_SPEC_TR_35;
