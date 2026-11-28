import { afterEach, describe, expect, it, vi } from "vitest";
import { trainKalmanMos, type ProvinceScopedLedgerStationPoint } from "../../lib/kalman-mos";
import {
  fetchMetarNetworkHistory,
  getAllowedTurkeyIcaosForProvince,
  isIcaoAllowedForProvince,
  resetMetarCacheForTests,
  type MetarNetworkStation,
  type RawMetarRecord
} from "../../lib/metar-verify";
import { getTrCatalogEntryById, getTrProvinceCenterEntry } from "../../lib/provinces/catalog-1102";
import { TR81_CLIMATOLOGY_1991_2020 } from "../../lib/provinces/climatology-1991-2020";
import { pointInProvincePolygon, resolveProvinceCode } from "../../lib/provinces/geo-adm1-resolver";
import { TR81_HYPSOMETRIC_PROFILES } from "../../lib/provinces/hypsometric-bands-tr81";
import PROVINCE_SPEC_TR_09_DEFAULT, {
  evaluateAydinGrabenSummerProfile,
  PROVINCE_SPEC_TR_09,
  TR_09_BESPOKE_META
} from "../../lib/provinces/specs/tr-09";
import PROVINCE_SPEC_TR_20_DEFAULT, {
  evaluateDenizliVerticalTransect,
  PROVINCE_SPEC_TR_20,
  TR_20_BESPOKE_META
} from "../../lib/provinces/specs/tr-20";
import PROVINCE_SPEC_TR_48_DEFAULT, {
  evaluateMuglaOrographicCycloneResponse,
  PROVINCE_SPEC_TR_48,
  TR_48_BESPOKE_META
} from "../../lib/provinces/specs/tr-48";
import PROVINCE_SPEC_TR_64_DEFAULT, {
  evaluateUsakThresholdSnowTransition,
  PROVINCE_SPEC_TR_64,
  TR_64_BESPOKE_META
} from "../../lib/provinces/specs/tr-64";
import type { ProvinceSpec } from "../../lib/provinces/types";

const REG_04_SPECS: readonly ProvinceSpec[] = [
  PROVINCE_SPEC_TR_09,
  PROVINCE_SPEC_TR_20,
  PROVINCE_SPEC_TR_48,
  PROVINCE_SPEC_TR_64
];

describe("Wave 3A — REG-04 Güney Kıyı Ege & İç Ege Eşikleri (TR-09 Aydın, TR-20 Denizli, TR-48 Muğla, TR-64 Uşak)", () => {
  afterEach(() => {
    resetMetarCacheForTests();
    vi.restoreAllMocks();
  });

  it("4 ilin tamamı ProvinceSpec şemasını, 1991-2020 klimatolojisini, 4-bant hipsometriyi ve mülki poligon sınırlarını %100 sağlar", () => {
    expect(PROVINCE_SPEC_TR_09_DEFAULT).toBe(PROVINCE_SPEC_TR_09);
    expect(PROVINCE_SPEC_TR_20_DEFAULT).toBe(PROVINCE_SPEC_TR_20);
    expect(PROVINCE_SPEC_TR_48_DEFAULT).toBe(PROVINCE_SPEC_TR_48);
    expect(PROVINCE_SPEC_TR_64_DEFAULT).toBe(PROVINCE_SPEC_TR_64);

    const expectedWmoByCode: Record<string, string> = {
      "TR-09": "17234",
      "TR-20": "17237",
      "TR-48": "17292",
      "TR-64": "17188"
    };

    for (const spec of REG_04_SPECS) {
      expect(spec.region).toBe("AEGEAN");
      expect(spec.climateRegion).toBe("EGE");
      expect(spec.calibrationTier).toBe("TIER_A_WMO");
      expect(spec.primaryCenter.wmoId).toBe(expectedWmoByCode[spec.provinceCode]);
      expect(spec.stencil9Points).toHaveLength(9);

      const catCenter = getTrProvinceCenterEntry(spec.provinceCode);
      expect(catCenter).toBeDefined();
      expect(spec.primaryCenter.mgmMerkezId).toBe(catCenter!.mgmMerkezId);
      expect(spec.primaryCenter.mgmIstNo).toBe(catCenter!.mgmSondurumIstNo);
      expect(spec.primaryCenter.demVerifiedElevationM).toBe(catCenter!.elevationM);

      const clim = TR81_CLIMATOLOGY_1991_2020[spec.provinceCode];
      const hypso = TR81_HYPSOMETRIC_PROFILES[spec.provinceCode];
      expect(spec.primaryCenter.monthlyTmaxNormalsC).toEqual(clim.tmaxC);
      expect(spec.primaryCenter.monthlyTminNormalsC).toEqual(clim.tminC);
      expect(spec.verticalProfileSpec.maxPhysicalPeakM).toBe(hypso.maxPhysicalPeakM);
      expect(spec.verticalProfileSpec.snowElevationBands).toEqual(hypso.bands);

      expect(
        pointInProvincePolygon(
          spec.primaryCenter.lat,
          spec.primaryCenter.lon,
          spec.provinceCode
        )
      ).toBe(true);

      for (const sub of spec.curatedSubLocations) {
        const res = resolveProvinceCode({ lat: sub.lat, lon: sub.lon });
        expect(res.provinceCode).toBe(spec.provinceCode);
        if (sub.id.startsWith(`tr-${String(spec.plateCode).padStart(2, "0")}-`)) {
          const catSub = getTrCatalogEntryById(sub.id);
          if (catSub) {
            expect(catSub.provinceCode).toBe(spec.provinceCode);
          }
        }
      }

      for (const stPt of spec.stencil9Points) {
        if (stPt.role !== "marine_upwind") {
          const res = resolveProvinceCode({ lat: stPt.lat, lon: stPt.lon });
          expect(res.provinceCode).toBe(spec.provinceCode);
        }
      }

      const basinIds = spec.subBasins.map((b) => b.id);
      for (const b1 of basinIds) {
        expect(spec.barrierCouplingMatrix[b1]?.[b1]).toBe(1.0);
        for (const b2 of basinIds) {
          const w12 = spec.barrierCouplingMatrix[b1]?.[b2];
          const w21 = spec.barrierCouplingMatrix[b2]?.[b1];
          expect(w12).toBeDefined();
          expect(w12).toBeGreaterThanOrEqual(0);
          expect(w12).toBeLessThanOrEqual(1);
          expect(w12).toBeCloseTo(w21 ?? -1, 6);
        }
      }
    }
  });

  it("TR-48 Muğla: Güneyli-güneybatılı (170°–240°) siklonlarda Lodos fön kurutması YAPMAZ (0°C), Marmaris–Köyceğiz–Muğla Merkez (646m) hattında 1.55x taşkın yağışı üretir ve 2400m+ zirvede kara döner", () => {
    expect(PROVINCE_SPEC_TR_48.primaryCenter.demVerifiedElevationM).toBe(646);
    expect(TR_48_BESPOKE_META.upslopePrecipMultiplier).toBe(1.55);
    expect(TR_48_BESPOKE_META.lodosFoehnDryingAllowed).toBe(false);

    const mainWall = PROVINCE_SPEC_TR_48.directionalBarriers[0];
    expect(mainWall.foehnSpec.enabled).toBe(false);
    expect(mainWall.foehnSpec.maxWarmingCapC).toBe(0);
    expect(mainWall.upslopeSpec.enabled).toBe(true);
    expect(mainWall.upslopeSpec.windFromSectorDeg).toEqual({ fromDeg: 170, toDeg: 240 });
    expect(mainWall.upslopeSpec.maxPrecipMultiplierCap).toBe(1.55);

    const muglaCenterStorm = evaluateMuglaOrographicCycloneResponse({
      windFromDirDeg: 205,
      windSpeedMs: 16,
      basePrecipMmHr: 20.0,
      targetSubBasinId: "mentese_ula_karst_plateau",
      targetElevationM: 646,
      temp850C: 5.5
    });
    expect(muglaCenterStorm.isLodosDelugeRegime).toBe(true);
    expect(muglaCenterStorm.foehnWarmingC).toBe(0);
    expect(muglaCenterStorm.precipMultiplier).toBeCloseTo(1.55, 5);
    expect(muglaCenterStorm.adjustedPrecipMmHr).toBeCloseTo(31.0, 4);
    expect(muglaCenterStorm.summitSnowPhase).toBe(false);

    const marmarisKoycegizStorm = evaluateMuglaOrographicCycloneResponse({
      windFromDirDeg: 185,
      windSpeedMs: 15,
      basePrecipMmHr: 24.0,
      targetSubBasinId: "marmaris_koycegiz_dalaman_coast",
      targetElevationM: 24,
      temp850C: 5.5
    });
    expect(marmarisKoycegizStorm.foehnWarmingC).toBe(0);
    expect(marmarisKoycegizStorm.precipMultiplier).toBeCloseTo(1.55, 5);
    expect(marmarisKoycegizStorm.adjustedPrecipMmHr).toBeCloseTo(37.2, 4);

    const akdagSummitBlizzard = evaluateMuglaOrographicCycloneResponse({
      windFromDirDeg: 210,
      windSpeedMs: 18,
      basePrecipMmHr: 14.0,
      targetSubBasinId: "babadag_sandras_akdag_alpine",
      targetElevationM: 2450,
      temp850C: 1.0
    });
    expect(akdagSummitBlizzard.foehnWarmingC).toBe(0);
    expect(akdagSummitBlizzard.precipMultiplier).toBeCloseTo(1.55, 5);
    expect(akdagSummitBlizzard.summitSnowPhase).toBe(true);

    const etesianCorridor = PROVINCE_SPEC_TR_48.venturiCorridors.find(
      (c) => c.id === "bodrum_datca_etesian_corridor"
    );
    expect(etesianCorridor).toBeDefined();
    expect(etesianCorridor!.channelAxisFromDeg).toBe(325);
    expect(etesianCorridor!.speedMultiplier).toBeGreaterThan(1.3);
  });

  it("TR-09 Aydın: Büyük Menderes graben tabanı (valleyFloorM=55) üzerinde Kuşadası/Didim kıyı meltemi ile Nazilli/Aydın Merkez +45..+47°C yaz sıcağını keskin biçimde ayırır", () => {
    expect(PROVINCE_SPEC_TR_09.inversionAndWedgeSpec.basinFloorElevationM).toBe(55);
    expect(TR_09_BESPOKE_META.valleyFloorM).toBe(55);
    expect(PROVINCE_SPEC_TR_09.verticalProfileSpec.maxPhysicalPeakM).toBe(1831);
    expect(PROVINCE_SPEC_TR_09.qcAndMosBounds.maxPlausibleTempC).toBeGreaterThanOrEqual(48.0);
    expect(PROVINCE_SPEC_TR_09.icaoWhitelist).toEqual([]);

    const kusadasiCoast = evaluateAydinGrabenSummerProfile({
      temp850C: 26.6,
      windFromDirDeg: 280,
      windSpeedMs: 6.5,
      inlandDistanceKm: 2,
      elevationM: 25,
      month1To12: 7
    });

    const nazilliInnerGraben = evaluateAydinGrabenSummerProfile({
      temp850C: 26.6,
      windFromDirDeg: 20,
      windSpeedMs: 9.0,
      inlandDistanceKm: 88,
      elevationM: 84,
      month1To12: 7
    });

    expect(kusadasiCoast.seaBreezeCoolingC).toBeGreaterThan(5.5);
    expect(nazilliInnerGraben.seaBreezeCoolingC).toBe(0);
    expect(nazilliInnerGraben.northFoehnWarmingC).toBeGreaterThan(3.5);
    expect(nazilliInnerGraben.estimatedTemp2mC).toBeGreaterThanOrEqual(45.0);
    expect(nazilliInnerGraben.estimatedTemp2mC).toBeLessThanOrEqual(47.0);
    expect(nazilliInnerGraben.estimatedTemp2mC - kusadasiCoast.estimatedTemp2mC).toBeGreaterThan(9.5);
  });

  it("TR-20 Denizli: Honaz (2571m) – Merkez (425m) – Çardak LTAY (851m) dikey kesitini korur ve LTAY kırsal plato ayazının Denizli Merkez Kalman kalibrasyonunu soğutmasını engeller", () => {
    expect(PROVINCE_SPEC_TR_20.verticalProfileSpec.maxPhysicalPeakM).toBe(2571);
    expect(PROVINCE_SPEC_TR_20.waterBodies).toEqual([]);
    expect(PROVINCE_SPEC_TR_20.icaoWhitelist).toEqual(["LTAY"]);
    expect(TR_20_BESPOKE_META.coldBasinAirportIcaos).toEqual(["LTAY"]);

    const ltayOverride = PROVINCE_SPEC_TR_20.stationOverrides.ICAO_LTAY;
    expect(ltayOverride).toBeDefined();
    expect(ltayOverride.demElevationM).toBe(851);
    expect(ltayOverride.coldPoolSusceptibility).toBeGreaterThan(0.8);
    expect(ltayOverride.excludeFromCenterHeadline).toBe(true);

    const transect = evaluateDenizliVerticalTransect({
      denizliMerkezTempC: 3.5,
      windSpeedMs: 1.0,
      clearSkyFraction0To1: 1.0
    });
    expect(transect.saraykoy194mTempC).toBeGreaterThan(transect.denizliMerkez425mTempC);
    expect(transect.cardakLtay851mTempC).toBeLessThan(-3.0);
    expect(transect.ltayVsCenterColdOffsetC).toBeLessThan(-6.0);
    expect(transect.nikferBozdag1918mTempC).toBeLessThan(-5.0);
    expect(transect.honazSummit2571mTempC).toBeLessThan(transect.nikferBozdag1918mTempC);

    const baseMs = Date.parse("2026-01-18T00:00:00Z");
    const hours = 12;
    const utcTimeIndex = new Map<string, number>();
    const denizliLedger: ProvinceScopedLedgerStationPoint[] = [];

    for (let h = 0; h < hours; h++) {
      const ms = baseMs + h * 3600_000;
      const uKey = new Date(ms).toISOString().slice(0, 16);
      utcTimeIndex.set(uKey, h);
      denizliLedger.push({
        stationId: "WMO_17237",
        stationProvinceCode: "TR-20",
        utcHourKey: uKey,
        observedAtMs: ms,
        lat: 37.762,
        lon: 29.0921,
        elevationM: 425,
        tempC: 3.5,
        dewPointC: -1.0,
        pressureMslHpa: 1021,
        windSpeedKmh: 4,
        windDirDeg: 90,
        precipMmHr: 0,
        hasPrecip: false
      });
    }

    const ltayHistory: RawMetarRecord[] = Array.from({ length: hours }, (_, h) => ({
      icaoId: "LTAY",
      lat: 37.785,
      lon: 29.7011,
      elev: 851,
      obsTime: Math.floor((baseMs + h * 3600_000) / 1000),
      temp: -5.5,
      dewp: -7.0,
      wspd: 2,
      altim: 1022
    }));

    const ltayNetwork: MetarNetworkStation[] = [
      {
        station: {
          icaoId: "LTAY",
          stationName: "Denizli Cardak",
          distanceKm: 54,
          elevationM: 851,
          obsTimeIso: new Date(baseMs + 11 * 3600_000).toISOString(),
          ageMinutes: 15,
          rawOb: "METAR LTAY",
          tempC: -5.5,
          dewPointC: -7.0,
          windSpeedKmh: 3.7,
          windGustKmh: null,
          windDirectionDeg: 70,
          qnhHpa: 1022,
          visibilityKm: 10,
          wxString: null
        },
        history: ltayHistory
      }
    ];

    const modelHourlyUtc: Record<string, Array<number | null>> = {
      temperature_2m_ecmwf_ifs: Array(hours).fill(3.5),
      temperature_2m_ecmwf_aifs025_single: Array(hours).fill(3.5),
      temperature_2m_icon_seamless: Array(hours).fill(3.5),
      temperature_2m_ukmo_seamless: Array(hours).fill(3.5),
      temperature_2m_meteofrance_seamless: Array(hours).fill(3.5),
      temperature_2m_gfs_seamless: Array(hours).fill(3.5),
      temperature_2m_gem_seamless: Array(hours).fill(3.5),
      temperature_2m_jma_seamless: Array(hours).fill(3.5)
    };

    const denizliMos = trainKalmanMos({
      network: ltayNetwork,
      cityElevationM: 425,
      cityLat: 37.762,
      cityLon: 29.0921,
      envLapseRateCPerM: -0.0055,
      modelHourlyUtc,
      utcTimeIndex,
      nowUtcMs: baseMs + 11 * 3600_000,
      utcOffsetSeconds: 10800,
      ledgerStationHistory: denizliLedger,
      provinceCode: "TR-20",
      kalmanTempBiasCapC: PROVINCE_SPEC_TR_20.qcAndMosBounds.kalmanTempBiasCapC,
      coldBasinAirportIcaos: TR_20_BESPOKE_META.coldBasinAirportIcaos
    });

    expect(Math.abs(denizliMos.biases.ecmwfIfs.tempKalmanBiasC)).toBeLessThan(0.4);
  });

  it("TR-64 Uşak: Kıyı su kütlesi içermez (waterBodies=[]), 919m İç Batı Anadolu eşiğinde İzmir/Manisa yağmur alırken kar fazına hızlı geçiş yapar", () => {
    expect(PROVINCE_SPEC_TR_64.waterBodies).toEqual([]);
    expect(TR_64_BESPOKE_META.hasCoastalWaterBody).toBe(false);
    expect(PROVINCE_SPEC_TR_64.primaryCenter.demVerifiedElevationM).toBe(919);
    expect(PROVINCE_SPEC_TR_64.verticalProfileSpec.maxPhysicalPeakM).toBe(2309);
    expect(PROVINCE_SPEC_TR_64.icaoWhitelist).toEqual(["LTBO"]);

    const thresholdTransition = evaluateUsakThresholdSnowTransition({
      izmirCoastalTempC: 8.5,
      temp850C: -1.4,
      surfaceWindFromDeg: 55,
      wind850FromDeg: 225,
      precipRateMmHr: 4.5
    });

    expect(thresholdTransition.izmirPhase).toBe("rain");
    expect(thresholdTransition.coldWedgeActive).toBe(true);
    expect(thresholdTransition.usakWetBulbC).toBeLessThanOrEqual(0.6);
    expect(thresholdTransition.usakPhase).toBe("snow");
  });

  it("METAR Güvenlik Duvarı: TR-09 sivil METAR kullanmaz (icaoWhitelist=[]); TR-48 yalnız LTFE/LTBS kabul eder ve Yunan adaları (LGRP/LGKO/LGSM) ile komşu il istasyonlarını %100 bloklar", async () => {
    // Spec icaoWhitelist listeleri ulusal METAR güvenlik duvarının sıkı alt-kümesi veya birebir eşidir
    expect(PROVINCE_SPEC_TR_09.icaoWhitelist).toEqual([]);
    expect(getAllowedTurkeyIcaosForProvince("TR-20")).toEqual(PROVINCE_SPEC_TR_20.icaoWhitelist);
    expect([...getAllowedTurkeyIcaosForProvince("TR-48")].sort()).toEqual(
      [...PROVINCE_SPEC_TR_48.icaoWhitelist].sort()
    );
    expect(getAllowedTurkeyIcaosForProvince("TR-64")).toEqual(PROVINCE_SPEC_TR_64.icaoWhitelist);

    // Yunan adaları (Rodos LGRP, İstanköy LGKO, Sisam LGSM) ve komşu iller (İzmir LTBJ, Antalya LTAI) %100 reddedilir
    for (const greekOrNeighbor of ["LGRP", "LGKO", "LGSM", "LTBJ", "LTAI"]) {
      expect(isIcaoAllowedForProvince(greekOrNeighbor, "TR-09")).toBe(false);
      expect(isIcaoAllowedForProvince(greekOrNeighbor, "TR-20")).toBe(false);
      expect(isIcaoAllowedForProvince(greekOrNeighbor, "TR-48")).toBe(false);
      expect(isIcaoAllowedForProvince(greekOrNeighbor, "TR-64")).toBe(false);
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const makeSeries = (
      icaoId: string,
      name: string,
      lat: number,
      lon: number,
      elev: number,
      temp: number
    ): RawMetarRecord[] =>
      [0, 1, 2, 3].map((step) => ({
        icaoId,
        name,
        lat,
        lon,
        elev,
        obsTime: nowSec - step * 3600,
        temp,
        dewp: temp - 3.5,
        wspd: 14,
        wdir: 205,
        altim: 1010,
        rawOb: `METAR ${icaoId}`
      }));

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);
      const payload: RawMetarRecord[] = [
        ...makeSeries("LTFE", "Milas Bodrum", 37.2506, 27.6643, 6, 15.2),
        ...makeSeries("LTBS", "Mugla Dalaman", 36.7131, 28.7925, 6, 16.0),
        ...makeSeries("LGRP", "Rhodes Diagoras (Greece)", 36.4054, 28.0862, 11, 18.5),
        ...makeSeries("LGKO", "Kos Hippocrates (Greece)", 36.7933, 27.0917, 126, 17.1),
        ...makeSeries("LGSM", "Samos Aristarchos (Greece)", 37.69, 26.9117, 6, 17.4),
        ...makeSeries("LTAI", "Antalya Neighbor Leak", 36.8987, 30.8005, 54, 19.0)
      ];
      expect(url).not.toContain("bbox=");
      expect(url).toContain("LTFE");
      expect(url).toContain("LTBS");
      return new Response(JSON.stringify(payload), { status: 200 });
    });

    // Spec tabanlı sivil METAR kapısı: Aydın (icaoWhitelist: []) için 0 ağ çağrısı
    const aydinMetars =
      PROVINCE_SPEC_TR_09.icaoWhitelist.length === 0
        ? []
        : await fetchMetarNetworkHistory(37.8597, 27.2652, 4, 150, {
            provinceCode: "TR-09"
          });
    expect(aydinMetars).toEqual([]);
    expect(fetchSpy).toHaveBeenCalledTimes(0);

    // Muğla (TR-48, Marmaris 36.8395, 28.2452): Yalnız LTFE ve LTBS döner; LGRP, LGKO, LGSM ve LTAI elenir!
    const muglaMetars = await fetchMetarNetworkHistory(36.8395, 28.2452, 4, 150, {
      provinceCode: "TR-48"
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const returnedIcaos = muglaMetars.map((m) => m.station.icaoId).sort();
    expect(returnedIcaos).toEqual(["LTBS", "LTFE"]);
    expect(returnedIcaos).not.toContain("LGRP");
    expect(returnedIcaos).not.toContain("LGKO");
    expect(returnedIcaos).not.toContain("LGSM");
    expect(returnedIcaos).not.toContain("LTAI");
  });
});
