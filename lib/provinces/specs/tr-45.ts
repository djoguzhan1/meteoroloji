import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceSpec } from "../types";

const CLIM_TR_45 = TR81_CLIMATOLOGY_1991_2020["TR-45"];
const HYPSO_TR_45 = TR81_HYPSOMETRIC_PROFILES["TR-45"];

/**
 * Wave 3A (REG-03) — `TR-45` Manisa Bespoke Physical & Microclimatic Specification:
 *  - Spil Dağı (1517 m) & Sabuncubeli Pass Barrier + Gediz Graben Plain (`basinFloorElevationM: 71`):
 *    physically walled off from İzmir Bay's afternoon İmbat (`waterBodies: []`), making summer
 *    afternoons +3..+4°C hotter than coastal İzmir (`maxPlausibleTempC: 48°C`).
 *  - Severe Gediz Graben Nocturnal Frost & Radiation Fog: high enclosure (`0.84`) traps cold
 *    air across Saruhanlı (37 m), Manisa Merkez (71 m), Turgutlu (45 m), and Salihli (111 m) on
 *    clear winter nights (~+4.5°C/km surface-layer inversion against Spil slopes).
 *  - Kula / Gördes / Demirci (620–855 m) Inner Aegean Volcanic Plateau step.
 *  - Strict Zero-Leakage Policy: `icaoWhitelist: []` & `calibrationTier: "TIER_B_DONOR_KALMAN"`
 *    (explicitly prevents borrowing coastal İzmir `17220` / `LTBJ`).
 */
export const PROVINCE_SPEC_TR_45: ProvinceSpec = Object.freeze({
  provinceCode: "TR-45",
  plateCode: 45,
  slug: "manisa",
  nameTr: "Manisa",
  region: "AEGEAN",
  climateRegion: "EGE",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "AEGEAN_COASTAL_GRABEN",
  icaoWhitelist: Object.freeze([]),
  domainBounds: Object.freeze({
    minLat: 38.08,
    maxLat: 39.36,
    minLon: 27.12,
    maxLon: 29.12
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 94508,
    mgmIstNo: 17186,
    mgmSaatlikIstNo: 17186,
    mgmGunlukIstNo: 94501,
    lat: 38.6153,
    lon: 27.4049,
    demVerifiedElevationM: 71,
    subBasinId: "TR45_GEDIZ_GRABEN_FLOOR",
    urbanFraction: 0.66,
    monthlyTmaxNormalsC: CLIM_TR_45.tmaxC,
    monthlyTminNormalsC: CLIM_TR_45.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "manisa-saruhanli-gediz",
      name: "Saruhanlı – Aşağı Gediz Ovası",
      role: "plain",
      lat: 38.738,
      lon: 27.5745,
      elevationM: 37
    }),
    Object.freeze({
      id: "manisa-merkez-sehzadeler",
      name: "Manisa Merkez (Yunusemre / Şehzadeler)",
      role: "plain",
      lat: 38.6153,
      lon: 27.4049,
      elevationM: 71
    }),
    Object.freeze({
      id: "manisa-kula-demirci-plato",
      name: "Kula / Demirci İç Ege Platosu",
      role: "foothill",
      lat: 38.5272,
      lon: 28.6368,
      elevationM: 720
    }),
    Object.freeze({
      id: "manisa-spil-atalani",
      name: "Spil Dağı Milli Parkı (Atalanı)",
      role: "summit",
      lat: 38.5539,
      lon: 27.4485,
      elevationM: 1238
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR45_GEDIZ_GRABEN_FLOOR",
      labelTr: "Gediz Graben Tabanı (Manisa – Saruhanlı – Turgutlu – Salihli – Alaşehir)",
      polygonOrBbox: Object.freeze({
        minLat: 38.2,
        maxLat: 38.82,
        minLon: 27.28,
        maxLon: 28.76
      }),
      elevationRangeM: Object.freeze([30, 230] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.52
    }),
    Object.freeze({
      id: "TR45_AKHISAR_SOMA_NORTH_CORRIDOR",
      labelTr: "Akhisar – Soma – Kırkağaç Kuzey Poyraz Eşiği",
      polygonOrBbox: Object.freeze({
        minLat: 38.82,
        maxLat: 39.32,
        minLon: 27.42,
        maxLon: 28.08
      }),
      elevationRangeM: Object.freeze([60, 340] as const),
      defaultZone: "urban_plain",
      defaultUrbanFraction: 0.46
    }),
    Object.freeze({
      id: "TR45_KULA_DEMIRCI_INNER_PLATEAU",
      labelTr: "Kula – Gördes – Demirci – Selendi Yüksek İç Ege Platosu",
      polygonOrBbox: Object.freeze({
        minLat: 38.45,
        maxLat: 39.22,
        minLon: 28.18,
        maxLon: 29.1
      }),
      elevationRangeM: Object.freeze([340, 1050] as const),
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.28
    }),
    Object.freeze({
      id: "TR45_SPIL_BOZDAG_CREST",
      labelTr: "Spil Dağı (1517 m) – Kuzey Bozdağlar – Demirci Akdağ Zirve Kuşağı",
      polygonOrBbox: Object.freeze({
        minLat: 38.32,
        maxLat: 39.12,
        minLon: 27.34,
        maxLon: 28.78
      }),
      elevationRangeM: Object.freeze([1050, 2070] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.05
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR45_GEDIZ_GRABEN_FLOOR: Object.freeze({
      TR45_GEDIZ_GRABEN_FLOOR: 1.0,
      TR45_AKHISAR_SOMA_NORTH_CORRIDOR: 0.56,
      TR45_KULA_DEMIRCI_INNER_PLATEAU: 0.22,
      TR45_SPIL_BOZDAG_CREST: 0.16
    }),
    TR45_AKHISAR_SOMA_NORTH_CORRIDOR: Object.freeze({
      TR45_GEDIZ_GRABEN_FLOOR: 0.56,
      TR45_AKHISAR_SOMA_NORTH_CORRIDOR: 1.0,
      TR45_KULA_DEMIRCI_INNER_PLATEAU: 0.34,
      TR45_SPIL_BOZDAG_CREST: 0.18
    }),
    TR45_KULA_DEMIRCI_INNER_PLATEAU: Object.freeze({
      TR45_GEDIZ_GRABEN_FLOOR: 0.22,
      TR45_AKHISAR_SOMA_NORTH_CORRIDOR: 0.34,
      TR45_KULA_DEMIRCI_INNER_PLATEAU: 1.0,
      TR45_SPIL_BOZDAG_CREST: 0.42
    }),
    TR45_SPIL_BOZDAG_CREST: Object.freeze({
      TR45_GEDIZ_GRABEN_FLOOR: 0.16,
      TR45_AKHISAR_SOMA_NORTH_CORRIDOR: 0.18,
      TR45_KULA_DEMIRCI_INNER_PLATEAU: 0.42,
      TR45_SPIL_BOZDAG_CREST: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17186": Object.freeze({
      stationId: 17186,
      nameTr: "Manisa Merkez (Gediz Etek)",
      lat: 38.6153,
      lon: 27.4049,
      demElevationM: 71,
      subBasinId: "TR45_GEDIZ_GRABEN_FLOOR",
      urbanFraction: 0.66,
      coldPoolSusceptibility: 0.64,
      verticalStratumRole: "basin_floor"
    }),
    "18051": Object.freeze({
      stationId: 18051,
      nameTr: "Saruhanlı (Gediz Çukur Taban)",
      lat: 38.738,
      lon: 27.5745,
      demElevationM: 37,
      subBasinId: "TR45_GEDIZ_GRABEN_FLOOR",
      urbanFraction: 0.34,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor"
    }),
    "18052": Object.freeze({
      stationId: 18052,
      nameTr: "Turgutlu (Gediz Ovası)",
      lat: 38.5312,
      lon: 27.7065,
      demElevationM: 45,
      subBasinId: "TR45_GEDIZ_GRABEN_FLOOR",
      urbanFraction: 0.54,
      coldPoolSusceptibility: 0.82,
      verticalStratumRole: "basin_floor"
    }),
    "17792": Object.freeze({
      stationId: 17792,
      nameTr: "Salihli (Orta Gediz)",
      lat: 38.4831,
      lon: 28.1234,
      demElevationM: 111,
      subBasinId: "TR45_GEDIZ_GRABEN_FLOOR",
      urbanFraction: 0.5,
      coldPoolSusceptibility: 0.76,
      verticalStratumRole: "basin_floor"
    }),
    "17184": Object.freeze({
      stationId: 17184,
      nameTr: "Akhisar Kuzey Koridor",
      lat: 38.9118,
      lon: 27.8233,
      demElevationM: 92,
      subBasinId: "TR45_AKHISAR_SOMA_NORTH_CORRIDOR",
      urbanFraction: 0.52,
      coldPoolSusceptibility: 0.58,
      verticalStratumRole: "coastal_or_gap"
    }),
    "18042": Object.freeze({
      stationId: 18042,
      nameTr: "Kula Volkanik Platosu",
      lat: 38.5272,
      lon: 28.6368,
      demElevationM: 720,
      subBasinId: "TR45_KULA_DEMIRCI_INNER_PLATEAU",
      urbanFraction: 0.3,
      coldPoolSusceptibility: 0.38,
      verticalStratumRole: "mid_slope"
    }),
    "17746": Object.freeze({
      stationId: 17746,
      nameTr: "Demirci Yüksek Eşik",
      lat: 39.0349,
      lon: 28.6482,
      demElevationM: 855,
      subBasinId: "TR45_KULA_DEMIRCI_INNER_PLATEAU",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.26,
      verticalStratumRole: "mid_slope"
    }),
    "17771": Object.freeze({
      stationId: 17771,
      nameTr: "Spil Dağı Milli Parkı (Atalanı)",
      lat: 38.5539,
      lon: 27.4485,
      demElevationM: 1238,
      subBasinId: "TR45_SPIL_BOZDAG_CREST",
      urbanFraction: 0.04,
      coldPoolSusceptibility: 0.05,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([71, 460, 1180, 1650] as const),
    maxPhysicalPeakM: HYPSO_TR_45.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_45.bands
  }),
  waterBodies: Object.freeze([]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR45_SPIL_YAMANLAR_IMBAT_BLOCK_AND_FOEHN",
      labelTr: "Spil Dağı (1517 m) & Sabuncubeli İmbat Blokajı ve Güney Lodos Fön Duvarı",
      effectiveBarrierHeightM: 1517,
      crestPressureHpa: 850,
      applicableSubBasins: Object.freeze([
        "TR45_GEDIZ_GRABEN_FLOOR",
        "TR45_SPIL_BOZDAG_CREST"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 175, toDeg: 230 }),
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.42,
        sourcePlateauElevationM: 550,
        maxTargetElevationM: 230,
        maxWarmingCapC: 3.5,
        subCloudVirgaFactor: 0.44,
        wetCutoffMmHr: 1.6
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 345, toDeg: 45 }),
        minOnshoreOrUpslopeSpeedMs: 5.5,
        coastalFrictionalConvergenceBoost: 1.16,
        maxPrecipMultiplierCap: 1.58
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 255, toDeg: 315 }),
        precipAttenuationFactor: 0.82
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR45_SABUNCUBELI_PASS_VENTURI",
      labelTr: "Sabuncubeli Geçidi Kanalı",
      centerCoord: Object.freeze({ lat: 38.562, lon: 27.345 }),
      influenceRadiusKm: 11,
      channelAxisFromDeg: 215,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.26,
      gustMultiplier: 1.35,
      suppressesNocturnalInversion: true
    }),
    Object.freeze({
      id: "TR45_AKHISAR_GELENBE_POYRAZ_GATE",
      labelTr: "Gelenbe – Akhisar Kuzey Poyraz Koridoru",
      centerCoord: Object.freeze({ lat: 39.02, lon: 27.78 }),
      influenceRadiusKm: 18,
      channelAxisFromDeg: 25,
      bidirectional: true,
      sectorHalfWidthDeg: 32,
      speedMultiplier: 1.22,
      gustMultiplier: 1.3,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 71,
    coldPoolMaxDepthM: 260,
    topographicEnclosureIndex: 0.84,
    deltaPressureTopHpa: 950,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 4,
      maxExtraRadiativeCoolingC: 2.5
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.62
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 5, toDeg: 65 }),
      minWindShearVs850Deg: 75
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.58,
    invertedVDryMicroburstSusceptibility: 0.48,
    coastalWaterspoutSusceptibility: 0.0
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "manisa_gediz_center",
      labelTr: "Manisa Merkez (Gediz Taban)",
      lat: 38.6153,
      lon: 27.4049,
      elevationM: 71,
      role: "target"
    }),
    Object.freeze({
      key: "spil_atalani_summit",
      labelTr: "Spil Dağı Atalanı Zirve Duvarı",
      lat: 38.5539,
      lon: 27.4485,
      elevationM: 1238,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "sabuncubeli_southwest_pass",
      labelTr: "Sabuncubeli Geçidi Rüzgâr-Üstü",
      lat: 38.562,
      lon: 27.345,
      elevationM: 420,
      role: "foehn_windward"
    }),
    Object.freeze({
      key: "saruhanli_low_frost_floor",
      labelTr: "Saruhanlı Gediz Çukur Taban (37 m)",
      lat: 38.738,
      lon: 27.5745,
      elevationM: 37,
      role: "corridor"
    }),
    Object.freeze({
      key: "turgutlu_west_graben",
      labelTr: "Turgutlu Gediz Koridoru",
      lat: 38.5312,
      lon: 27.7065,
      elevationM: 45,
      role: "corridor"
    }),
    Object.freeze({
      key: "salihli_mid_graben",
      labelTr: "Salihli Orta Gediz Ovası",
      lat: 38.4831,
      lon: 28.1234,
      elevationM: 111,
      role: "lee_shadow"
    }),
    Object.freeze({
      key: "akhisar_north_inflow",
      labelTr: "Akhisar Kuzey Poyraz Kapısı",
      lat: 38.9118,
      lon: 27.8233,
      elevationM: 92,
      role: "corridor"
    }),
    Object.freeze({
      key: "kula_volcanic_plateau",
      labelTr: "Kula İç Ege Platosu (720 m)",
      lat: 38.5272,
      lon: 28.6368,
      elevationM: 720,
      role: "orographic_wall"
    }),
    Object.freeze({
      key: "demirci_high_ridge",
      labelTr: "Demirci Yüksek Eşik (855 m)",
      lat: 39.0349,
      lon: 28.6482,
      elevationM: 855,
      role: "orographic_wall"
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -18,
    maxPlausibleTempC: 48,
    minPlausibleMslpHpa: 978,
    maxPlausibleMslpHpa: 1046,
    kalmanTempBiasCapC: 5.5
  })
});

export default PROVINCE_SPEC_TR_45;
