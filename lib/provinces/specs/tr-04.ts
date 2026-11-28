import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";
import type { ProvinceSpec } from "../types";

const CLIM_TR_04 = TR81_CLIMATOLOGY_1991_2020["TR-04"];
const HYPSO_TR_04 = TR81_HYPSOMETRIC_PROFILES["TR-04"];

export const TR_04_SIBERIAN_POLE_META = Object.freeze({
  provinceCode: "TR-04" as const,
  wmoStationId: "17099",
  meteostatStationId: "LTCO0",
  allowedMetarIcaos: Object.freeze(["LTCO"] as const),
  muratBowlFloorM: 1632,
  eleskirtTahirPassM: 2470,
  buyukAgriSummitM: 5137,
  minPlausibleTempC: -46,
  snowDepthTriggerCm: 5,
  maxExtraRadiativeCoolingC: 8.5,
  deltaPressureTopHpa: 700
});

/**
 * ATMOS v5.0 — Wave 3C (REG-18) Bespoke Microclimate & Synoptic Spec: `TR-04` Ağrı
 *
 * Fiziksel ve Sinoptik Mekanizmalar:
 *  1. Türkiye'nin Mutlak Soğuk Kutbu (1.632–1.640 m Murat Nehri Kapalı Kar Çanağı, WMO 17099 / LTCO0):
 *     Kışın Sibirya termik yüksek basıncı altında taze kar örtüsü (`snowDepthTriggerCm: 5`) üstünde
 *     çok haftalık donan stratus / buz sisi (elmas tozu) ve `deltaPressureTopHpa: 700` derinliğinde
 *     enverziyon havuzu oluşur (`minPlausibleTempC: -46`, `maxExtraRadiativeCoolingC: 8.5`).
 *  2. Eleşkirt – Tahir Geçidi (2.470 m) & Bubi Dağı Tipi Boğazı:
 *     Batı-kuzeybatı ve doğu-güneydoğu eksenli çift yönlü Venturi kanalı kar fırtınalarını hızlandırırken
 *     geçit sırtında gece enverziyonunu mekanik türbülansla kırar.
 *  3. Büyük Ağrı Dağı (5.137 m — Türkiye'nin En Yüksek Zirvesi & Takke Buzulu) ve Doğubayazıt Çukuru (1.640 m):
 *     Ağrı Dağı ile Tendürek (3.533 m) arasında sıkışan Doğubayazıt – Gürbulak koridoru kuvvetli yağış gölgesi
 *     ve dağ-arkası adyabatik ısınma karakteri taşır.
 */
const SPEC_TR_04_ENGINE = Object.freeze({
  provinceCode: "TR-04",
  plateCode: 4,
  slug: "agri",
  nameTr: "Ağrı",
  region: "EASTERN_ANATOLIA",
  climateRegion: "DOGU_ANADOLU",
  calibrationTier: "TIER_A_WMO",
  donorCluster: "HIGH_EAST_SNOW_BASIN",
  icaoWhitelist: Object.freeze(["LTCO"] as const),
  domainBounds: Object.freeze({
    minLat: 38.9307,
    maxLat: 40.0022,
    minLon: 42.2802,
    maxLon: 44.487
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 90401,
    mgmIstNo: 17099,
    mgmSaatlikIstNo: 17099,
    mgmGunlukIstNo: 90401,
    wmoId: "17099",
    lat: 39.7253,
    lon: 43.0522,
    demVerifiedElevationM: 1632,
    subBasinId: "TR04_AGRI_MURAT_SIBERIAN_BOWL",
    urbanFraction: 0.56,
    monthlyTmaxNormalsC: CLIM_TR_04.tmaxC,
    monthlyTminNormalsC: CLIM_TR_04.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-04-tutak-murat",
      name: "Tutak – Murat Nehri Alt Çanağı (1562 m)",
      role: "plain" as const,
      lat: 39.5369,
      lon: 42.7761,
      elevationM: 1562
    }),
    Object.freeze({
      id: "tr-04-merkez",
      name: "Ağrı Merkez (Murat Kar Çanağı · WMO 17099 · 1632 m)",
      role: "plain" as const,
      lat: 39.7253,
      lon: 43.0522,
      elevationM: 1632
    }),
    Object.freeze({
      id: "tr-04-dogubayazit",
      name: "Doğubayazıt Çukuru (Ağrı–Tendürek Arası · 1640 m)",
      role: "plain" as const,
      lat: 39.5469,
      lon: 44.0842,
      elevationM: 1640
    }),
    Object.freeze({
      id: "tr-04-eleskirt-tahir",
      name: "Eleşkirt – Tahir Geçidi (2470 m)",
      role: "foothill" as const,
      lat: 39.855,
      lon: 42.455,
      elevationM: 2470
    }),
    Object.freeze({
      id: "tr-04-buyuk-agri-zirve",
      name: "Büyük Ağrı Dağı Zirve Kuşağı (5137 m)",
      role: "summit" as const,
      lat: 39.6765,
      lon: 44.292,
      elevationM: 5137
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR04_AGRI_MURAT_SIBERIAN_BOWL",
      labelTr: "Ağrı Merkez – Hamur – Taşlıçay – Tutak Murat Nehri Sibirya Ayaz Çanağı (1520–1760 m)",
      polygonOrBbox: Object.freeze({
        minLat: 39.46,
        maxLat: 39.84,
        minLon: 42.68,
        maxLon: 43.52
      }),
      elevationRangeM: Object.freeze([1520, 1760] as const),
      defaultZone: "rural_closed_basin",
      defaultUrbanFraction: 0.48
    }),
    Object.freeze({
      id: "TR04_PATNOS_SOUTH_PLATEAU",
      labelTr: "Patnos – Süphan Kuzey Eteği Yüksek Platosu (1580–1920 m)",
      polygonOrBbox: Object.freeze({
        minLat: 38.94,
        maxLat: 39.45,
        minLon: 42.52,
        maxLon: 43.28
      }),
      elevationRangeM: Object.freeze([1580, 1920] as const),
      defaultZone: "high_plateau",
      defaultUrbanFraction: 0.32
    }),
    Object.freeze({
      id: "TR04_ELESKIRT_TAHIR_BLIZZARD_PASS",
      labelTr: "Eleşkirt – Bubi Dağı – Tahir Geçidi (2470 m) Tipi ve Geçit Kuşağı",
      polygonOrBbox: Object.freeze({
        minLat: 39.72,
        maxLat: 39.99,
        minLon: 42.29,
        maxLon: 42.96
      }),
      elevationRangeM: Object.freeze([1780, 2550] as const),
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.16
    }),
    Object.freeze({
      id: "TR04_DOGUBAYAZIT_DIYADIN_DEPRESSION",
      labelTr: "Doğubayazıt Çukuru – Diyadin – Gürbulak Yarı-Kurak Koridoru (1580–2150 m)",
      polygonOrBbox: Object.freeze({
        minLat: 39.32,
        maxLat: 39.66,
        minLon: 43.54,
        maxLon: 44.48
      }),
      elevationRangeM: Object.freeze([1580, 2150] as const),
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.34
    }),
    Object.freeze({
      id: "TR04_BUYUK_AGRI_GLACIER_SUMMIT",
      labelTr: "Büyük Ağrı Dağı (5137 m Takke Buzulu) & Tendürek Alpin Zirve Kuşağı",
      polygonOrBbox: Object.freeze({
        minLat: 39.28,
        maxLat: 39.7,
        minLon: 43.82,
        maxLon: 44.46
      }),
      elevationRangeM: Object.freeze([2500, 5137] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.02
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR04_AGRI_MURAT_SIBERIAN_BOWL: Object.freeze({
      TR04_AGRI_MURAT_SIBERIAN_BOWL: 1.0,
      TR04_PATNOS_SOUTH_PLATEAU: 0.56,
      TR04_ELESKIRT_TAHIR_BLIZZARD_PASS: 0.44,
      TR04_DOGUBAYAZIT_DIYADIN_DEPRESSION: 0.26,
      TR04_BUYUK_AGRI_GLACIER_SUMMIT: 0.16
    }),
    TR04_PATNOS_SOUTH_PLATEAU: Object.freeze({
      TR04_AGRI_MURAT_SIBERIAN_BOWL: 0.56,
      TR04_PATNOS_SOUTH_PLATEAU: 1.0,
      TR04_ELESKIRT_TAHIR_BLIZZARD_PASS: 0.34,
      TR04_DOGUBAYAZIT_DIYADIN_DEPRESSION: 0.24,
      TR04_BUYUK_AGRI_GLACIER_SUMMIT: 0.14
    }),
    TR04_ELESKIRT_TAHIR_BLIZZARD_PASS: Object.freeze({
      TR04_AGRI_MURAT_SIBERIAN_BOWL: 0.44,
      TR04_PATNOS_SOUTH_PLATEAU: 0.34,
      TR04_ELESKIRT_TAHIR_BLIZZARD_PASS: 1.0,
      TR04_DOGUBAYAZIT_DIYADIN_DEPRESSION: 0.18,
      TR04_BUYUK_AGRI_GLACIER_SUMMIT: 0.22
    }),
    TR04_DOGUBAYAZIT_DIYADIN_DEPRESSION: Object.freeze({
      TR04_AGRI_MURAT_SIBERIAN_BOWL: 0.26,
      TR04_PATNOS_SOUTH_PLATEAU: 0.24,
      TR04_ELESKIRT_TAHIR_BLIZZARD_PASS: 0.18,
      TR04_DOGUBAYAZIT_DIYADIN_DEPRESSION: 1.0,
      TR04_BUYUK_AGRI_GLACIER_SUMMIT: 0.32
    }),
    TR04_BUYUK_AGRI_GLACIER_SUMMIT: Object.freeze({
      TR04_AGRI_MURAT_SIBERIAN_BOWL: 0.16,
      TR04_PATNOS_SOUTH_PLATEAU: 0.14,
      TR04_ELESKIRT_TAHIR_BLIZZARD_PASS: 0.22,
      TR04_DOGUBAYAZIT_DIYADIN_DEPRESSION: 0.32,
      TR04_BUYUK_AGRI_GLACIER_SUMMIT: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17099": Object.freeze({
      stationId: 17099,
      nameTr: "Ağrı Merkez (WMO 17099 · 1632 m)",
      lat: 39.7253,
      lon: 43.0522,
      demElevationM: 1632,
      subBasinId: "TR04_AGRI_MURAT_SIBERIAN_BOWL",
      urbanFraction: 0.56,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor"
    }),
    "17104": Object.freeze({
      stationId: 17104,
      nameTr: "Ağrı Ahmed-i Hani Havalimanı (MGM 17104 / LTCO)",
      lat: 39.6545,
      lon: 43.0271,
      demElevationM: 1632,
      subBasinId: "TR04_AGRI_MURAT_SIBERIAN_BOWL",
      urbanFraction: 0.08,
      coldPoolSusceptibility: 0.98,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    LTCO: Object.freeze({
      stationId: "LTCO",
      nameTr: "Ağrı Ahmed-i Hani Havalimanı (LTCO · Murat Kırsal Ayaz Tabanı)",
      lat: 39.6545,
      lon: 43.0271,
      demElevationM: 1632,
      subBasinId: "TR04_AGRI_MURAT_SIBERIAN_BOWL",
      urbanFraction: 0.08,
      coldPoolSusceptibility: 0.98,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18359": Object.freeze({
      stationId: 18359,
      nameTr: "Tutak (Murat Nehri Vadi Tabanı)",
      lat: 39.5369,
      lon: 42.7761,
      demElevationM: 1562,
      subBasinId: "TR04_AGRI_MURAT_SIBERIAN_BOWL",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.95,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18357": Object.freeze({
      stationId: 18357,
      nameTr: "Hamur",
      lat: 39.6072,
      lon: 42.9867,
      demElevationM: 1692,
      subBasinId: "TR04_AGRI_MURAT_SIBERIAN_BOWL",
      urbanFraction: 0.2,
      coldPoolSusceptibility: 0.88,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18358": Object.freeze({
      stationId: 18358,
      nameTr: "Taşlıçay",
      lat: 39.6358,
      lon: 43.3689,
      demElevationM: 1745,
      subBasinId: "TR04_AGRI_MURAT_SIBERIAN_BOWL",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.86,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18193": Object.freeze({
      stationId: 18193,
      nameTr: "Patnos",
      lat: 39.2394,
      lon: 42.842,
      demElevationM: 1638,
      subBasinId: "TR04_PATNOS_SOUTH_PLATEAU",
      urbanFraction: 0.42,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18194": Object.freeze({
      stationId: 18194,
      nameTr: "Eleşkirt",
      lat: 39.7915,
      lon: 42.682,
      demElevationM: 1818,
      subBasinId: "TR04_ELESKIRT_TAHIR_BLIZZARD_PASS",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.72,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "19065": Object.freeze({
      stationId: 19065,
      nameTr: "Eleşkirt – Tahir Geçidi (2470 m)",
      lat: 39.855,
      lon: 42.455,
      demElevationM: 2470,
      subBasinId: "TR04_ELESKIRT_TAHIR_BLIZZARD_PASS",
      urbanFraction: 0.03,
      coldPoolSusceptibility: 0.14,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }),
    "19066": Object.freeze({
      stationId: 19066,
      nameTr: "Bubi Dağı Kayak Merkezi / Küpkıran",
      lat: 39.7544,
      lon: 42.905,
      demElevationM: 1985,
      subBasinId: "TR04_ELESKIRT_TAHIR_BLIZZARD_PASS",
      urbanFraction: 0.06,
      coldPoolSusceptibility: 0.26,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "17720": Object.freeze({
      stationId: 17720,
      nameTr: "Doğubayazıt",
      lat: 39.5469,
      lon: 44.0842,
      demElevationM: 1640,
      subBasinId: "TR04_DOGUBAYAZIT_DIYADIN_DEPRESSION",
      urbanFraction: 0.44,
      coldPoolSusceptibility: 0.74,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18356": Object.freeze({
      stationId: 18356,
      nameTr: "Diyadin",
      lat: 39.5436,
      lon: 43.6694,
      demElevationM: 1930,
      subBasinId: "TR04_DOGUBAYAZIT_DIYADIN_DEPRESSION",
      urbanFraction: 0.22,
      coldPoolSusceptibility: 0.78,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    }),
    "19249": Object.freeze({
      stationId: 19249,
      nameTr: "Tendürek Geçidi (2644 m)",
      lat: 39.38,
      lon: 43.92,
      demElevationM: 2644,
      subBasinId: "TR04_BUYUK_AGRI_GLACIER_SUMMIT",
      urbanFraction: 0.02,
      coldPoolSusceptibility: 0.1,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    }),
    "19250": Object.freeze({
      stationId: 19250,
      nameTr: "Büyük Ağrı Dağı Güney Yüksek Kamp Kuşağı (3200 m)",
      lat: 39.635,
      lon: 44.245,
      demElevationM: 3200,
      subBasinId: "TR04_BUYUK_AGRI_GLACIER_SUMMIT",
      urbanFraction: 0.01,
      coldPoolSusceptibility: 0.05,
      verticalStratumRole: "alpine_snow",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([1632, 2152, 3200, 5137] as const),
    maxPhysicalPeakM: HYPSO_TR_04.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_04.bands
  }),
  waterBodies: Object.freeze([]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR04_TAHIR_KOSE_WEST_SNOW_WALL",
      labelTr: "Eleşkirt – Tahir Geçidi (2470 m) & Köse Dağı (3433 m) Cephesel Kar ve Tipi Duvarı",
      effectiveBarrierHeightM: 2850,
      crestPressureHpa: 700,
      applicableSubBasins: Object.freeze([
        "TR04_ELESKIRT_TAHIR_BLIZZARD_PASS",
        "TR04_AGRI_MURAT_SIBERIAN_BOWL",
        "TR04_PATNOS_SOUTH_PLATEAU"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 75, toDeg: 135 }),
        minCrossCrestSpeedMs: 8.5,
        minFroudeNumber: 0.36,
        sourcePlateauElevationM: 1950,
        maxTargetElevationM: 1760,
        maxWarmingCapC: 3.2,
        subCloudVirgaFactor: 0.54,
        wetCutoffMmHr: 1.4
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 205, toDeg: 290 }),
        minOnshoreOrUpslopeSpeedMs: 5.0,
        coastalFrictionalConvergenceBoost: 1.18,
        maxPrecipMultiplierCap: 1.56
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 70, toDeg: 135 }),
        precipAttenuationFactor: 0.66
      })
    }),
    Object.freeze({
      id: "TR04_ARARAT_TENDUREK_DOGUBAYAZIT_SHADOW",
      labelTr: "Büyük Ağrı (5137 m) & Tendürek (3533 m) Doğubayazıt Çukuru Yağış Gölgesi ve Fön Kalkanı",
      effectiveBarrierHeightM: 3800,
      crestPressureHpa: 700,
      applicableSubBasins: Object.freeze([
        "TR04_DOGUBAYAZIT_DIYADIN_DEPRESSION",
        "TR04_BUYUK_AGRI_GLACIER_SUMMIT"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 330, toDeg: 50 }),
        minCrossCrestSpeedMs: 9.0,
        minFroudeNumber: 0.3,
        sourcePlateauElevationM: 2100,
        maxTargetElevationM: 1850,
        maxWarmingCapC: 4.4,
        subCloudVirgaFactor: 0.72,
        wetCutoffMmHr: 1.2
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 175, toDeg: 245 }),
        minOnshoreOrUpslopeSpeedMs: 6.0,
        coastalFrictionalConvergenceBoost: 1.14,
        maxPrecipMultiplierCap: 1.48
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 325, toDeg: 55 }),
        precipAttenuationFactor: 0.52
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR04_ELESKIRT_TAHIR_PASS_VENTURI",
      labelTr: "Eleşkirt – Tahir Geçidi (2470 m) WNW–ESE Çift Yönlü Tipi ve Rüzgâr Kanalı",
      centerCoord: Object.freeze({ lat: 39.855, lon: 42.455 }),
      influenceRadiusKm: 20,
      channelAxisFromDeg: 285,
      bidirectional: true,
      sectorHalfWidthDeg: 30,
      speedMultiplier: 1.38,
      gustMultiplier: 1.52,
      suppressesNocturnalInversion: true
    }),
    Object.freeze({
      id: "TR04_DOGUBAYAZIT_GURBULAK_GAP",
      labelTr: "Doğubayazıt – Gürbulak Sınır Koridoru Doğu-Batı Oluk Akışı",
      centerCoord: Object.freeze({ lat: 39.5469, lon: 44.0842 }),
      influenceRadiusKm: 22,
      channelAxisFromDeg: 95,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.28,
      gustMultiplier: 1.38,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 1632,
    coldPoolMaxDepthM: 520,
    topographicEnclosureIndex: 0.96,
    deltaPressureTopHpa: 700,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 5,
      maxExtraRadiativeCoolingC: 8.5
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.46
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 20, toDeg: 125 }),
      minWindShearVs850Deg: 55
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.36,
    invertedVDryMicroburstSusceptibility: 0.38,
    coastalWaterspoutSusceptibility: 0.0
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "agri_center_17099",
      labelTr: "Ağrı Merkez Murat Kar Çanağı (WMO 17099 · 1632 m)",
      lat: 39.7253,
      lon: 43.0522,
      elevationM: 1632,
      role: "target" as const
    }),
    Object.freeze({
      key: "tutak_murat_drainage_floor",
      labelTr: "Tutak Murat Nehri Drenaj Tabanı (1562 m)",
      lat: 39.5369,
      lon: 42.7761,
      elevationM: 1562,
      role: "corridor" as const
    }),
    Object.freeze({
      key: "tahir_pass_west_inflow",
      labelTr: "Eleşkirt – Tahir Geçidi Batı Tipi Girişi (2470 m)",
      lat: 39.855,
      lon: 42.455,
      elevationM: 2470,
      role: "corridor" as const
    }),
    Object.freeze({
      key: "bubi_kose_snow_wall",
      labelTr: "Bubi Dağı – Köse Dağı Kar Duvarı",
      lat: 39.7544,
      lon: 42.905,
      elevationM: 1985,
      role: "orographic_wall" as const
    }),
    Object.freeze({
      key: "patnos_south_windward",
      labelTr: "Patnos Güney Cephe Girişi (1638 m)",
      lat: 39.2394,
      lon: 42.842,
      elevationM: 1638,
      role: "foehn_windward" as const
    }),
    Object.freeze({
      key: "aladaglar_south_barrier",
      labelTr: "Aladağlar Güney Sınır Sırtı (2850 m)",
      lat: 39.42,
      lon: 43.32,
      elevationM: 2850,
      role: "orographic_wall" as const
    }),
    Object.freeze({
      key: "diyadin_upper_murat",
      labelTr: "Diyadin Yukarı Murat Platosu (1930 m)",
      lat: 39.5436,
      lon: 43.6694,
      elevationM: 1930,
      role: "lee_shadow" as const
    }),
    Object.freeze({
      key: "dogubayazit_lee_depression",
      labelTr: "Doğubayazıt Çukuru Yağış Gölgesi (1640 m)",
      lat: 39.5469,
      lon: 44.0842,
      elevationM: 1640,
      role: "lee_shadow" as const
    }),
    Object.freeze({
      key: "buyuk_agri_glacier_summit",
      labelTr: "Büyük Ağrı Dağı Zirve Kuşağı (5137 m)",
      lat: 39.6765,
      lon: 44.292,
      elevationM: 5137,
      role: "orographic_wall" as const
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -46,
    maxPlausibleTempC: 40,
    minPlausibleMslpHpa: 970,
    maxPlausibleMslpHpa: 1066,
    kalmanTempBiasCapC: 9.0
  }),
  inversion: Object.freeze({
    valleyFloorM: 1632,
    coldPoolDepthM: 520,
    clearNightInversionLapseCPerKm: 5.8,
    snowpackBoostFactor: 2.15,
    enclosureIndex: 0.96
  }),
  urbanHeatIsland: Object.freeze({
    maxNocturnalUhiC: 2.8,
    referenceUrbanFraction: 0.56,
    coldBasinAirportIcaos: Object.freeze(["LTCO"] as const)
  })
} satisfies ProvinceEngineSpec);

export const PROVINCE_SPEC_TR_04: ProvinceSpec = SPEC_TR_04_ENGINE;
export default PROVINCE_SPEC_TR_04;
