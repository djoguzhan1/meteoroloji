import { TR81_CLIMATOLOGY_1991_2020 } from "../climatology-1991-2020";
import { TR81_HYPSOMETRIC_PROFILES } from "../hypsometric-bands-tr81";
import type { ProvinceEngineSpec } from "../engine/province-vertical-profile";
import type { ProvinceSpec } from "../types";

const CLIM_TR_76 = TR81_CLIMATOLOGY_1991_2020["TR-76"];
const HYPSO_TR_76 = TR81_HYPSOMETRIC_PROFILES["TR-76"];

export const TR_76_SURMELI_DEPRESSION_META = Object.freeze({
  provinceCode: "TR-76" as const,
  calibrationTier: "TIER_B_DONOR_KALMAN" as const,
  mosTier: "TIER_B_DONOR_ALARO" as const,
  allowedMetarIcaos: Object.freeze(["LTCT"] as const),
  forbiddenForeignStationIds: Object.freeze(["37787", "37789", "UDYZ", "UDSG", "UBBN"] as const),
  surmeliFloorRangeM: Object.freeze([805, 876] as const),
  annualPrecipNormalMm: 268.2,
  daytimeSolarDampingFactor: 0.52,
  araratNorthSummitM: 5137
});

/**
 * ATMOS v5.0 — Wave 3C (REG-18) Bespoke Microclimate & Synoptic Spec: `TR-76` Iğdır
 *
 * Fiziksel ve Sinoptik Mekanizmalar:
 *  1. Sürmeli Çukuru İzole Mikro-Çöküntüsü (~805–876 m, MGM 17100, LTCT):
 *     Güneyde Büyük Ağrı Dağı (5.137 m), güneybatıda Zor/Pamuk Dağları (3.196 m) ve batıda
 *     Kars–Kağızman yüksek platosu ile çevrili derin tektonik oluk. Çevresindeki Kars ve Ağrı
 *     platolarından ilkbahar/yaz/sonbaharda 8–12°C daha sıcak pamuk/kayısı mikrokliması üretir.
 *  2. Türkiye'nin En Kurak Tam Yağış Gölgesi Havzası (~260–268 mm/yıl):
 *     Hem güneyli hem batı/kuzeybatılı nemli cepheler 2.500–5.137 m bariyerleri aşarken kurur;
 *     Sürmeli tabanına inen akışlar kuvvetli adyabatik fön ısınması ve bulut-altı virga yaratır.
 *  3. Kış Aras Çanağı Kalıcı Yoğun Sis / Hava Kirliliği Enverziyon Kilidi:
 *     Kış antisiklonlarında soğuk hava Aras çanağına hapsolur; yoğun stratus/donan sis ve partikül
 *     kirliliği gündüz güneşlenmesini bastırır (`persistentStratusLock: { enabled: true, daytimeSolarDampingFactor: 0.52 }`).
 *  4. Dürüst Tier-B Sınır İzolasyonu (`TIER_B_DONOR_KALMAN`, `icaoWhitelist: ["LTCT"]`):
 *     Yabancı Ermenistan Erivan (`37787` / `37789` / `UDYZ`) ve Gümrü (`UDSG`) istasyonlarının
 *     kullanımı kesinlikle yasaktır; sabit sapma terimi `interceptC === 0` kilitlidir.
 */
const SPEC_TR_76_ENGINE = Object.freeze({
  provinceCode: "TR-76",
  plateCode: 76,
  slug: "igdir",
  nameTr: "Iğdır",
  region: "EASTERN_ANATOLIA",
  climateRegion: "DOGU_ANADOLU",
  calibrationTier: "TIER_B_DONOR_KALMAN",
  donorCluster: "EAST_MICRO_DEPRESSION",
  icaoWhitelist: Object.freeze(["LTCT"] as const),
  domainBounds: Object.freeze({
    minLat: 39.6272,
    maxLat: 40.1313,
    minLon: 43.2843,
    maxLon: 44.8178
  }),
  primaryCenter: Object.freeze({
    mgmMerkezId: 97601,
    mgmIstNo: 17100,
    mgmSaatlikIstNo: 17100,
    mgmGunlukIstNo: 97601,
    lat: 39.9227,
    lon: 44.0523,
    demVerifiedElevationM: 856,
    subBasinId: "TR76_IGDIR_SURMELI_MICRO_DEPRESSION",
    urbanFraction: 0.62,
    monthlyTmaxNormalsC: CLIM_TR_76.tmaxC,
    monthlyTminNormalsC: CLIM_TR_76.tminC
  }),
  curatedSubLocations: Object.freeze([
    Object.freeze({
      id: "tr-76-aralik-dilucu",
      name: "Aralık – Dilucu Doğu Aras Çöküntü Tabanı (825 m)",
      role: "plain" as const,
      lat: 39.8731,
      lon: 44.5183,
      elevationM: 825
    }),
    Object.freeze({
      id: "tr-76-merkez",
      name: "Iğdır Merkez (Sürmeli Çukuru Mikroklima Ovası · 856 m)",
      role: "plain" as const,
      lat: 39.9227,
      lon: 44.0523,
      elevationM: 856
    }),
    Object.freeze({
      id: "tr-76-tuzluca",
      name: "Tuzluca – Batı Aras Boğazı / Kaya Tuzu Terası (1110 m)",
      role: "foothill" as const,
      lat: 40.0447,
      lon: 43.6672,
      elevationM: 1110
    }),
    Object.freeze({
      id: "tr-76-agri-kuzey-korhan",
      name: "Ağrı Dağı Kuzey Yamaç / Korhan Yaylası Kuşağı (3200 m)",
      role: "summit" as const,
      lat: 39.765,
      lon: 44.28,
      elevationM: 3200
    })
  ]),
  subBasins: Object.freeze([
    Object.freeze({
      id: "TR76_IGDIR_SURMELI_MICRO_DEPRESSION",
      labelTr: "Iğdır Merkez – Karakoyunlu Sürmeli Çukuru Mikroklima Ovası (835–960 m)",
      polygonOrBbox: Object.freeze({
        minLat: 39.84,
        maxLat: 40.06,
        minLon: 43.82,
        maxLon: 44.28
      }),
      elevationRangeM: Object.freeze([835, 960] as const),
      defaultZone: "graben_valley",
      defaultUrbanFraction: 0.56
    }),
    Object.freeze({
      id: "TR76_ARALIK_DILUCU_ARID_TROUGH",
      labelTr: "Aralık – Dilucu Doğu Aras Kurak Çöküntü Tabanı (805–860 m)",
      polygonOrBbox: Object.freeze({
        minLat: 39.64,
        maxLat: 39.96,
        minLon: 44.28,
        maxLon: 44.81
      }),
      elevationRangeM: Object.freeze([805, 860] as const),
      defaultZone: "arid_steppe",
      defaultUrbanFraction: 0.2
    }),
    Object.freeze({
      id: "TR76_TUZLUCA_WEST_ARAS_GORGE",
      labelTr: "Tuzluca – Batı Aras Kanyonu ve Pamuk/Zor Dağı Eteği (960–1850 m)",
      polygonOrBbox: Object.freeze({
        minLat: 39.74,
        maxLat: 40.12,
        minLon: 43.29,
        maxLon: 43.9
      }),
      elevationRangeM: Object.freeze([960, 1850] as const),
      defaultZone: "mountain_slope",
      defaultUrbanFraction: 0.22
    }),
    Object.freeze({
      id: "TR76_ARARAT_NORTH_KORHAN_SLOPE",
      labelTr: "Büyük Ağrı Dağı Kuzey Yamacı – Korhan – Serdarbulak Alpin Kuşağı (1850–5137 m)",
      polygonOrBbox: Object.freeze({
        minLat: 39.68,
        maxLat: 39.84,
        minLon: 44.08,
        maxLon: 44.48
      }),
      elevationRangeM: Object.freeze([1850, 5137] as const),
      defaultZone: "alpine_summit",
      defaultUrbanFraction: 0.02
    })
  ]),
  barrierCouplingMatrix: Object.freeze({
    TR76_IGDIR_SURMELI_MICRO_DEPRESSION: Object.freeze({
      TR76_IGDIR_SURMELI_MICRO_DEPRESSION: 1.0,
      TR76_ARALIK_DILUCU_ARID_TROUGH: 0.78,
      TR76_TUZLUCA_WEST_ARAS_GORGE: 0.42,
      TR76_ARARAT_NORTH_KORHAN_SLOPE: 0.16
    }),
    TR76_ARALIK_DILUCU_ARID_TROUGH: Object.freeze({
      TR76_IGDIR_SURMELI_MICRO_DEPRESSION: 0.78,
      TR76_ARALIK_DILUCU_ARID_TROUGH: 1.0,
      TR76_TUZLUCA_WEST_ARAS_GORGE: 0.3,
      TR76_ARARAT_NORTH_KORHAN_SLOPE: 0.2
    }),
    TR76_TUZLUCA_WEST_ARAS_GORGE: Object.freeze({
      TR76_IGDIR_SURMELI_MICRO_DEPRESSION: 0.42,
      TR76_ARALIK_DILUCU_ARID_TROUGH: 0.3,
      TR76_TUZLUCA_WEST_ARAS_GORGE: 1.0,
      TR76_ARARAT_NORTH_KORHAN_SLOPE: 0.28
    }),
    TR76_ARARAT_NORTH_KORHAN_SLOPE: Object.freeze({
      TR76_IGDIR_SURMELI_MICRO_DEPRESSION: 0.16,
      TR76_ARALIK_DILUCU_ARID_TROUGH: 0.2,
      TR76_TUZLUCA_WEST_ARAS_GORGE: 0.28,
      TR76_ARARAT_NORTH_KORHAN_SLOPE: 1.0
    })
  }),
  stationOverrides: Object.freeze({
    "17100": Object.freeze({
      stationId: 17100,
      nameTr: "Iğdır Merkez (MGM 17100 · Sürmeli Çukuru · 856 m)",
      lat: 39.9227,
      lon: 44.0523,
      demElevationM: 856,
      subBasinId: "TR76_IGDIR_SURMELI_MICRO_DEPRESSION",
      urbanFraction: 0.62,
      coldPoolSusceptibility: 0.92,
      verticalStratumRole: "basin_floor"
    }),
    "17763": Object.freeze({
      stationId: 17763,
      nameTr: "Iğdır Şehit Bülent Aydın Havalimanı (MGM 17763 / LTCT · 945 m)",
      lat: 39.9831,
      lon: 43.8664,
      demElevationM: 945,
      subBasinId: "TR76_IGDIR_SURMELI_MICRO_DEPRESSION",
      urbanFraction: 0.12,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    LTCT: Object.freeze({
      stationId: "LTCT",
      nameTr: "Iğdır Şehit Bülent Aydın Havalimanı (LTCT · Küllük Terası)",
      lat: 39.9831,
      lon: 43.8664,
      demElevationM: 945,
      subBasinId: "TR76_IGDIR_SURMELI_MICRO_DEPRESSION",
      urbanFraction: 0.12,
      coldPoolSusceptibility: 0.84,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "19903": Object.freeze({
      stationId: 19903,
      nameTr: "Iğdır TİGEM / Kazımkarabekir Ovası (848 m)",
      lat: 39.905,
      lon: 44.125,
      demElevationM: 848,
      subBasinId: "TR76_IGDIR_SURMELI_MICRO_DEPRESSION",
      urbanFraction: 0.18,
      coldPoolSusceptibility: 0.95,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18371": Object.freeze({
      stationId: 18371,
      nameTr: "Karakoyunlu (Sürmeli Ovası · 850 m)",
      lat: 39.9708,
      lon: 44.1753,
      demElevationM: 850,
      subBasinId: "TR76_IGDIR_SURMELI_MICRO_DEPRESSION",
      urbanFraction: 0.28,
      coldPoolSusceptibility: 0.94,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18195": Object.freeze({
      stationId: 18195,
      nameTr: "Aralık (Doğu Aras Çöküntü Tabanı · 825 m)",
      lat: 39.8731,
      lon: 44.5183,
      demElevationM: 825,
      subBasinId: "TR76_ARALIK_DILUCU_ARID_TROUGH",
      urbanFraction: 0.24,
      coldPoolSusceptibility: 0.96,
      verticalStratumRole: "basin_floor",
      excludeFromCenterHeadline: true
    }),
    "18372": Object.freeze({
      stationId: 18372,
      nameTr: "Tuzluca (Batı Aras Kanyonu · 1110 m)",
      lat: 40.0447,
      lon: 43.6672,
      demElevationM: 1110,
      subBasinId: "TR76_TUZLUCA_WEST_ARAS_GORGE",
      urbanFraction: 0.26,
      coldPoolSusceptibility: 0.68,
      verticalStratumRole: "mid_slope",
      excludeFromCenterHeadline: true
    })
  }),
  verticalProfileSpec: Object.freeze({
    piecewiseKnotsM: Object.freeze([856, 1436, 2650, 5137] as const),
    maxPhysicalPeakM: HYPSO_TR_76.maxPhysicalPeakM,
    snowElevationBands: HYPSO_TR_76.bands
  }),
  waterBodies: Object.freeze([]),
  directionalBarriers: Object.freeze([
    Object.freeze({
      id: "TR76_ARARAT_ZOR_SOUTH_RAIN_SHADOW",
      labelTr: "Büyük Ağrı (5137 m) & Aras Güney Dağları (3196 m) Tam Yağış Gölgesi ve Fön Duvarı",
      effectiveBarrierHeightM: 3600,
      crestPressureHpa: 700,
      applicableSubBasins: Object.freeze([
        "TR76_IGDIR_SURMELI_MICRO_DEPRESSION",
        "TR76_ARALIK_DILUCU_ARID_TROUGH"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 145, toDeg: 260 }),
        minCrossCrestSpeedMs: 7.5,
        minFroudeNumber: 0.26,
        sourcePlateauElevationM: 1850,
        maxTargetElevationM: 1050,
        maxWarmingCapC: 5.8,
        subCloudVirgaFactor: 0.78,
        wetCutoffMmHr: 1.0
      }),
      upslopeSpec: Object.freeze({
        enabled: false,
        windFromSectorDeg: Object.freeze({ fromDeg: 60, toDeg: 120 }),
        minOnshoreOrUpslopeSpeedMs: 7.5,
        coastalFrictionalConvergenceBoost: 1.0,
        maxPrecipMultiplierCap: 1.12
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 140, toDeg: 265 }),
        precipAttenuationFactor: 0.42
      })
    }),
    Object.freeze({
      id: "TR76_KARS_DIGOR_WEST_PLATEAU_DESCENT",
      labelTr: "Kars – Digor Platosundan (1800–2500 m) Sürmeli Çukuruna Batı-Kuzeybatı Fön İnişi",
      effectiveBarrierHeightM: 2250,
      crestPressureHpa: 750,
      applicableSubBasins: Object.freeze([
        "TR76_IGDIR_SURMELI_MICRO_DEPRESSION",
        "TR76_ARALIK_DILUCU_ARID_TROUGH",
        "TR76_TUZLUCA_WEST_ARAS_GORGE"
      ]),
      foehnSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 265, toDeg: 350 }),
        minCrossCrestSpeedMs: 7.0,
        minFroudeNumber: 0.32,
        sourcePlateauElevationM: 1780,
        maxTargetElevationM: 1180,
        maxWarmingCapC: 4.6,
        subCloudVirgaFactor: 0.72,
        wetCutoffMmHr: 1.1
      }),
      upslopeSpec: Object.freeze({
        enabled: true,
        windFromSectorDeg: Object.freeze({ fromDeg: 75, toDeg: 130 }),
        minOnshoreOrUpslopeSpeedMs: 6.5,
        coastalFrictionalConvergenceBoost: 1.08,
        maxPrecipMultiplierCap: 1.24
      }),
      rainShadowSpec: Object.freeze({
        shadowedWindFromSectorDeg: Object.freeze({ fromDeg: 265, toDeg: 355 }),
        precipAttenuationFactor: 0.52
      })
    })
  ]),
  venturiCorridors: Object.freeze([
    Object.freeze({
      id: "TR76_TUZLUCA_ARAS_WEST_CANYON",
      labelTr: "Tuzluca – Küllük (LTCT) Batı Aras Kanyonu Rüzgâr Oluklanması",
      centerCoord: Object.freeze({ lat: 40.015, lon: 43.76 }),
      influenceRadiusKm: 18,
      channelAxisFromDeg: 280,
      bidirectional: true,
      sectorHalfWidthDeg: 28,
      speedMultiplier: 1.28,
      gustMultiplier: 1.4,
      suppressesNocturnalInversion: true
    })
  ]),
  inversionAndWedgeSpec: Object.freeze({
    basinFloorElevationM: 856,
    coldPoolMaxDepthM: 580,
    topographicEnclosureIndex: 0.95,
    deltaPressureTopHpa: 850,
    snowAlbedoFeedback: Object.freeze({
      snowDepthTriggerCm: 3,
      maxExtraRadiativeCoolingC: 5.8
    }),
    persistentStratusLock: Object.freeze({
      enabled: true,
      daytimeSolarDampingFactor: 0.52
    }),
    shallowColdWedgeRule: Object.freeze({
      surfaceColdSectorDeg: Object.freeze({ fromDeg: 65, toDeg: 135 }),
      minWindShearVs850Deg: 55
    })
  }),
  aridAndSevereDrivers: Object.freeze({
    dustTransportSusceptibility: 0.64,
    invertedVDryMicroburstSusceptibility: 0.68,
    coastalWaterspoutSusceptibility: 0.0
  }),
  stencil9Points: Object.freeze([
    Object.freeze({
      key: "igdir_center_17100",
      labelTr: "Iğdır Merkez Sürmeli Çukuru (MGM 17100 · 856 m)",
      lat: 39.9227,
      lon: 44.0523,
      elevationM: 856,
      role: "target" as const
    }),
    Object.freeze({
      key: "aralik_east_trough_825",
      labelTr: "Aralık Doğu Aras Çöküntü Tabanı (825 m)",
      lat: 39.8731,
      lon: 44.5183,
      elevationM: 825,
      role: "lee_shadow" as const
    }),
    Object.freeze({
      key: "dilucu_lowest_floor_805",
      labelTr: "Dilucu En Alçak Sınır Tabanı (805 m)",
      lat: 39.685,
      lon: 44.75,
      elevationM: 805,
      role: "corridor" as const
    }),
    Object.freeze({
      key: "karakoyunlu_cotton_plain",
      labelTr: "Karakoyunlu Pamuk Ovası (850 m)",
      lat: 39.9708,
      lon: 44.1753,
      elevationM: 850,
      role: "lee_shadow" as const
    }),
    Object.freeze({
      key: "ltct_kulluk_terrace",
      labelTr: "Küllük Terası / Iğdır Havalimanı (LTCT · 945 m)",
      lat: 39.9831,
      lon: 43.8664,
      elevationM: 945,
      role: "corridor" as const
    }),
    Object.freeze({
      key: "tuzluca_west_gorge",
      labelTr: "Tuzluca Batı Aras Kanyon Girişi (1110 m)",
      lat: 40.0447,
      lon: 43.6672,
      elevationM: 1110,
      role: "corridor" as const
    }),
    Object.freeze({
      key: "abbasgol_west_escarpment",
      labelTr: "Tuzluca Güney / Abbasgöl Yüksek Eşiği (2150 m)",
      lat: 39.905,
      lon: 43.58,
      elevationM: 2150,
      role: "foehn_windward" as const
    }),
    Object.freeze({
      key: "pamuk_zor_sw_barrier",
      labelTr: "Pamuk Geçidi / Zor Dağı Güneybatı Kalkanı (2450 m)",
      lat: 39.775,
      lon: 43.88,
      elevationM: 2450,
      role: "orographic_wall" as const
    }),
    Object.freeze({
      key: "ararat_north_korhan_wall",
      labelTr: "Büyük Ağrı Dağı Kuzey Yamacı / Korhan (3200 m)",
      lat: 39.765,
      lon: 44.28,
      elevationM: 3200,
      role: "orographic_wall" as const
    })
  ]),
  qcAndMosBounds: Object.freeze({
    minPlausibleTempC: -32,
    maxPlausibleTempC: 44,
    minPlausibleMslpHpa: 975,
    maxPlausibleMslpHpa: 1058,
    kalmanTempBiasCapC: 7.5
  }),
  inversion: Object.freeze({
    valleyFloorM: 856,
    coldPoolDepthM: 580,
    clearNightInversionLapseCPerKm: 5.6,
    snowpackBoostFactor: 1.75,
    enclosureIndex: 0.95
  }),
  urbanHeatIsland: Object.freeze({
    maxNocturnalUhiC: 2.5,
    referenceUrbanFraction: 0.62,
    coldBasinAirportIcaos: Object.freeze(["LTCT"] as const)
  })
} satisfies ProvinceEngineSpec);

export const PROVINCE_SPEC_TR_76: ProvinceSpec = SPEC_TR_76_ENGINE;
export default PROVINCE_SPEC_TR_76;
