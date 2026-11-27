import { describe, expect, it } from "vitest";
import { reanchorWeatherBundleToNow } from "../lib/forecast-resilience";
import {
  buildElevationBandSpecs,
  simulateCoupledSnowTimeline
} from "../lib/snow-and-lightning-engine";
import { computeModularSolarArc } from "../lib/temporal-view";
import {
  BURSA_CURATED_LOCATIONS,
  BURSA_WMO_17116_ELEVATION_M,
  BURSA_WMO_17116_LAT,
  BURSA_WMO_17116_LON,
  computeCalendarDayDiff,
  computeModularSolarArc as computeClientModularSolarArc,
  createFastZonedTimeResolver,
  DEFAULT_LOCATION,
  formatRelativeDayLabelTr
} from "../lib/weather-client";
import type { DailyPoint, HourlyPoint, WeatherBundle } from "../lib/weather-types";

type SimTimelineParams = Parameters<typeof simulateCoupledSnowTimeline>[0];
type SimSnowHourInput = SimTimelineParams["hours"][number];
type SimAntecedentHourInput = NonNullable<SimTimelineParams["antecedentHours"]>[number];

function makeWinterFrontHour(params: {
  lat: number;
  lon: number;
  elevationM: number;
  tempAt100mC?: number;
  precipAt100mMm?: number;
  leadHour?: number;
}): SimSnowHourInput {
  const {
    lat,
    lon,
    elevationM,
    tempAt100mC = 1.6,
    precipAt100mMm = 2.8,
    leadHour = 0
  } = params;
  const lapsePerM = 0.0062;
  const dzFrom100 = elevationM - 100;
  const localTempC = Number((tempAt100mC - dzFrom100 * lapsePerM).toFixed(2));
  const localRh = Math.min(98, Math.max(78, Math.round(90 + dzFrom100 * 0.005)));
  const localWetBulbC = Number((localTempC - (100 - localRh) * 0.06).toFixed(2));

  // Ova (100m) referanslı orografik yağış ölçeğiyle tutarlı model girdisi
  const oroWeight =
    elevationM <= 100
      ? 0.92 + 0.08 * (elevationM / 100)
      : elevationM <= 550
        ? 1.0 + 0.18 * ((elevationM - 100) / 450)
        : 1.18 + 0.34 * Math.min(1, (elevationM - 550) / 1300);
  const localPrecipMm = Number((precipAt100mMm * oroWeight).toFixed(2));

  return {
    timeIso: `2026-12-22T${String(6 + leadHour).padStart(2, "0")}:00`,
    dateYmd: "2026-12-22",
    leadHour,
    elevationM,
    lat,
    lon,
    temp2mC: localTempC,
    rh2mPct: localRh,
    wetBulbC: localWetBulbC,
    windSpeedKmh: elevationM >= 1500 ? 32 : 18,
    windGustsKmh: elevationM >= 1500 ? 52 : 28,
    windDirDeg: 25,
    cloudCoverPct: 96,
    solarElevationDeg: -12,
    shortwaveWm2: 0,
    precipMmHr: localPrecipMm,
    precipP90MmHr: Number((localPrecipMm * 1.35).toFixed(2)),
    precipProbPct: 92,
    rawModelSnowfallCm: localWetBulbC <= 0.4 ? Number((localPrecipMm * 1.1).toFixed(2)) : 0,
    precipPhase: localWetBulbC <= 0.2 ? "snow" : localWetBulbC <= 1.5 ? "sleet" : "rain",
    freezingLevelM: 420,
    temp850hPa: -4.2,
    lapseRateCPerKm: 6.2,
    capeJkg: 35,
    seaSurfaceTempC: 11.4
  };
}

function makeStaleSnowLightningBundle(): WeatherBundle {
  // Fetched at 2026-12-10T18:00:00Z == 2026-12-10T21:00 Europe/Istanbul (UTC+3)
  const fetchedAtIso = "2026-12-10T18:00:00.000Z";
  const baseLocalAsUtcMs = Date.parse("2026-12-10T21:00:00Z");

  const hourly: HourlyPoint[] = Array.from({ length: 48 }, (_, i) => {
    const tIso = new Date(baseLocalAsUtcMs + i * 3600_000).toISOString().slice(0, 16);
    // İlk 3 saat (21:00, 22:00, 23:00 -> 2026-12-10) yoğun kar fırtınası ve kış orajı;
    // t = +3s (2026-12-11T00:00) sakin mola; t = +6s (2026-12-11T03:00) ikinci kar/şimşek dalgası!
    const isPastBurst = i < 3;
    const isSecondWave = i === 6;
    const temp = Number((i < 3 ? -0.8 + i * 0.2 : 2.4 + (i - 3) * 0.15).toFixed(1));
    const airSnowCm = isPastBurst ? 2.5 : isSecondWave ? 1.8 : 0;
    const groundSnowCm = isPastBurst ? 2.0 : isSecondWave ? 1.4 : 0;
    const roadSnowCm = isPastBurst ? 1.5 : isSecondWave ? 1.0 : 0;
    const precipMm = isPastBurst ? 2.4 : isSecondWave ? 1.7 : 0;
    const ltProb = isPastBurst ? 68 : isSecondWave ? 54 : 6;
    const ltFlash = isPastBurst ? 2.8 : isSecondWave ? 1.9 : 0;

    return {
      time: tIso,
      hourLabel: tIso.slice(11, 16),
      dayLabel: i < 3 ? "Bugün" : i < 27 ? "Yarın" : "Cmt",
      temperature: temp,
      tempP10: temp - 1.2,
      tempP90: temp + 1.2,
      apparentTemperature: temp - 2.0,
      wetBulbC: temp - 0.6,
      humidity: isPastBurst || isSecondWave ? 92 : 68,
      dewPoint: temp - 1.4,
      pressure: 1014 + i * 0.2,
      windSpeed: isPastBurst ? 34 : 14,
      windGusts: isPastBurst ? 54 : 22,
      windDirection: 20,
      cloudCover: isPastBurst || isSecondWave ? 96 : 45,
      visibilityKm: isPastBurst ? 2.5 : 14,
      uvIndex: 0,
      precipitation: precipMm,
      precipProbability: isPastBurst || isSecondWave ? 88 : 12,
      precipConsensus: {
        agreeingModels: isPastBurst || isSecondWave ? 7 : 0,
        totalModels: 8,
        minMm: 0,
        medianMm: precipMm,
        maxMm: precipMm * 1.4
      },
      precipType: airSnowCm > 0 ? "snow" : "none",
      precipPhase: airSnowCm > 0 ? "snow" : "none",
      snowLineElevationM: isPastBurst ? 80 : 650,
      rainAccum: 0,
      snowAccum: isPastBurst ? (i + 1) * 2.5 : i < 6 ? 7.5 : 9.3,
      airSnowCm,
      airSnowProbPct: airSnowCm > 0 ? 85 : 5,
      groundSnowCm,
      roadSnowCm,
      snowpackDepthCm: isPastBurst ? (i + 1) * 2.0 : Math.max(1.2, 5.0 - (i - 3) * 0.3),
      roadSnowDepthCm: isPastBurst ? (i + 1) * 1.2 : Math.max(0, 2.4 - (i - 3) * 0.4),
      soilTempC: Number((0.2 + i * 0.1).toFixed(1)),
      roadTempC: Number((0.5 + i * 0.15).toFixed(1)),
      icingRisk: isPastBurst ? "high" : "low",
      blowingSnowRisk: isPastBurst ? "blizzard" : "none",
      dekStatus: isPastBurst ? "heavy_dek" : "none",
      weatherCode: airSnowCm > 0 ? 75 : 2,
      condition: airSnowCm > 0 ? "Kar Yağışlı" : "Parçalı Bulutlu",
      isStorm: isPastBurst,
      stormScore: isPastBurst ? 66 : isSecondWave ? 48 : 8,
      lightningProbPct: ltProb,
      lpiJkg: isPastBurst ? 4.8 : isSecondWave ? 3.2 : 0,
      lightningFlashesPerMin: ltFlash,
      cgFractionPct: 35,
      isThundersnow: isPastBurst,
      solarElevationDeg: -18,
      daylight: 0,
      cape: isPastBurst ? 420 : 40,
      cin: -10,
      liftedIndex: 0,
      freezingLevelM: isPastBurst ? 120 : 850,
      temp850hPa: -6.5,
      stabilityGrade: "LOCKED"
    };
  });

  const daily: DailyPoint[] = [
    {
      date: "2026-12-10",
      dayName: "Bugün",
      tempMin: -1.0,
      tempMax: 6.5,
      weatherCode: 75,
      condition: "Kar Yağışlı",
      precipSum: 7.2,
      precipProbabilityMax: 90,
      precipPhase: "snow",
      snowProbMaxPct: 88,
      airSnowSumCm: 7.5,
      groundSnowSumCm: 6.0,
      roadSnowSumCm: 4.5,
      maxSnowpackDepthCm: 6.0,
      minSnowLineM: 80,
      dekStatus: "heavy_dek",
      windSpeedMax: 34,
      windGustMax: 54,
      lightningProbMaxPct: 68,
      uvIndexMax: 2,
      sunrise: "2026-12-10T08:18",
      sunset: "2026-12-10T17:38"
    },
    {
      date: "2026-12-11",
      dayName: "Yarın",
      tempMin: 1.5,
      tempMax: 9.0,
      weatherCode: 73,
      condition: "Kar Yağışlı",
      precipSum: 1.7,
      precipProbabilityMax: 88,
      precipPhase: "snow",
      snowProbMaxPct: 85,
      airSnowSumCm: 1.8,
      groundSnowSumCm: 1.4,
      roadSnowSumCm: 1.0,
      maxSnowpackDepthCm: 5.0,
      minSnowLineM: 650,
      dekStatus: "none",
      windSpeedMax: 22,
      windGustMax: 32,
      lightningProbMaxPct: 54,
      uvIndexMax: 2,
      sunrise: "2026-12-11T08:19",
      sunset: "2026-12-11T17:38"
    }
  ];

  return {
    location: DEFAULT_LOCATION,
    source: "hybrid-nwp-verified",
    fetchedAt: fetchedAtIso,
    timezone: "Europe/Istanbul",
    utcOffsetSeconds: 10800,
    current: {
      time: "2026-12-10T21:00",
      temperature: -0.8,
      apparentTemperature: -2.8,
      wetBulbC: -1.4,
      humidity: 92,
      dewPoint: -2.2,
      pressure: 1014,
      pressureDelta3h: -1.8,
      pressureTrend: "düşüyor",
      pressureTrendDetail: "Belirgin düşüş",
      windSpeed: 34,
      windGusts: 54,
      windDirection: 20,
      beaufort: { scale: 5, label: "Sertçe rüzgar" },
      cloudCover: 96,
      visibilityKm: 2.5,
      uvIndex: 0,
      uvLabel: "Düşük",
      precipitation: 2.4,
      precipProbability: 88,
      precipConsensus: {
        agreeingModels: 7,
        totalModels: 8,
        minMm: 1.5,
        medianMm: 2.4,
        maxMm: 3.4
      },
      precipType: "snow",
      precipPhase: "snow",
      snowLineElevationM: 80,
      airSnowCmHr: 2.5,
      groundSnowCmHr: 2.0,
      roadSnowCmHr: 1.5,
      snowpackDepthCm: 2.0,
      soilTempC: 0.2,
      roadTempC: 0.5,
      icingRisk: "high",
      blowingSnowRisk: "blizzard",
      dekStatus: "heavy_dek",
      lightningProbPct: 68,
      lightningFlashesPerMin: 2.8,
      isThundersnow: true,
      weatherCode: 75,
      condition: "Kar Yağışlı",
      isStorm: true,
      stormScore: 66,
      isDay: false,
      solarElevationDeg: -24,
      daylight: 0,
      sunrise: "2026-12-10T08:18",
      sunset: "2026-12-10T17:38",
      temp850hPa: -6.5
    },
    airQuality: {
      europeanAqi: 18,
      categoryIndex: 1,
      label: "İyi",
      dominantPollutant: "PM10",
      dominantValueText: "12 µg/m³",
      pm25: 6,
      pm10: 12,
      ozone: 44,
      no2: 10,
      so2: 2,
      dust: 3
    },
    hourly,
    daily,
    sounding: [],
    hourlySoundings: [],
    nativeConvective: {
      cape: 420,
      cin: -10,
      liftedIndex: 0,
      freezingLevelM: 120,
      lightningPotential: 68
    },
    snowAndLightning: {
      referenceElevationM: 100,
      soilTempNowC: 0.2,
      roadTempNowC: 0.5,
      hasAnySnow15d: true,
      hasAnySnow30d: true,
      nextSnowHourIso: "2026-12-10T21:00",
      nextSnowDateYmd: "2026-12-10",
      total15dAirSnowCm: 9.3,
      total15dGroundSnowCm: 7.4,
      total15dRoadSnowCm: 5.5,
      peak15dSnowpackCm: 6.0,
      lowest15dSnowLineM: 80,
      dekStatus15d: "heavy_dek",
      dekDeltaTSst850C: 17.5,
      maxIcingRisk48h: "high",
      maxBlowingSnow48h: "blizzard",
      lightningRadar: {
        updatedAtIso: "2026-12-10T21:00",
        radarBacked: true,
        metarConfirmedTs: true,
        safetyLevel: "shelter_now",
        safetyTitleTr: "ACİL: Gökgürültülü Kar (Thundersnow)",
        safetyDetailTr: "Aktif kış orajı.",
        nearestCellKm: 5.0,
        nearestBearingTr: "KD",
        approachingEtaMin: 0,
        currentFlashesPerMin: 2.8,
        currentLpiJkg: 4.8,
        currentCgFractionPct: 45,
        isThundersnowNow: true,
        rings: [
          {
            ringKm: 15,
            labelTr: "0–15 km",
            activeCellCount: 1,
            maxDbz: 42,
            estFlashesPerMin: 2.8,
            probabilityPct: 68,
            status: "severe"
          },
          {
            ringKm: 40,
            labelTr: "15–40 km",
            activeCellCount: 0,
            maxDbz: 24,
            estFlashesPerMin: 0,
            probabilityPct: 30,
            status: "watch"
          },
          {
            ringKm: 100,
            labelTr: "40–100 km",
            activeCellCount: 0,
            maxDbz: 15,
            estFlashesPerMin: 0,
            probabilityPct: 15,
            status: "clear"
          }
        ],
        cells: []
      },
      peak48hLightningProbPct: 68,
      peak168hLightningProbPct: 68,
      peak168hFlashesPerMin: 2.8,
      hasThundersnow168h: true,
      nextLightningHourIso: "2026-12-10T21:00"
    },
    hybrid: {
      engineVersion: "5.0",
      activeModels: ["ecmwfIfs", "icon", "gfs"],
      ensembleMembers: 212,
      confidencePct: 90,
      tempSpreadC: 0.8,
      pressureSpreadHpa: 0.6,
      currentBreakdown: {
        temperature: { ecmwfIfs: -0.8, ecmwfAifs: -0.7, icon: -0.9, ukmo: -0.8, gfs: -0.8 },
        pressure: { ecmwfIfs: 1014, ecmwfAifs: 1014, icon: 1014, ukmo: 1014, gfs: 1014 },
        windSpeed: { ecmwfIfs: 34, ecmwfAifs: 33, icon: 35, ukmo: 34, gfs: 34 },
        temp850hPa: { ecmwfIfs: -6.5, ecmwfAifs: -6.4, icon: -6.6, ukmo: -6.5, gfs: -6.5 },
        precipitation: { ecmwfIfs: 2.4, ecmwfAifs: 2.3, icon: 2.5, ukmo: 2.4, gfs: 2.4 }
      },
      verification: {
        mode: "live-mgm-mesh",
        station: null,
        matchedHours: 24,
        winners: {
          temperature: "ecmwfIfs",
          pressure: "ecmwfIfs",
          wind: "icon",
          precipitation: "ecmwfIfs"
        },
        rows: []
      },
      attributions: []
    }
  };
}

describe("ATMOS v5.0 — Küresel Saat Dilimi, DST, 4-Rakım Monotonluğu & Paket İleri Sarma Değişmezleri", () => {
  describe("I-3: Tokyo Gece Yarısı, New York DST & Reykjavik Güneş Yayı", () => {
    it("Tokyo (Asia/Tokyo) 2026-11-26 19:00 başlangıcında 23:00 -> 'Bugün' ve 5 saat sonraki 00:00 (2026-11-27) -> 'Yarın' üretir", () => {
      const tokyoResolver = createFastZonedTimeResolver("Asia/Tokyo", 9 * 3600);
      // 2026-11-26T10:00:00Z == 2026-11-26T19:00 JST
      const startEpochMs = Date.parse("2026-11-26T10:00:00.000Z");
      const originParts = tokyoResolver.epochMsToLocalParts(startEpochMs);
      expect(originParts.ymd).toBe("2026-11-26");
      expect(originParts.hm).toBe("19:00");

      // +4 saat -> 23:00 JST (hala 2026-11-26)
      const h4Parts = tokyoResolver.epochMsToLocalParts(startEpochMs + 4 * 3_600_000);
      expect(h4Parts.isoHour).toBe("2026-11-26T23:00");
      expect(computeCalendarDayDiff(h4Parts.ymd, originParts.ymd)).toBe(0);
      expect(formatRelativeDayLabelTr(h4Parts.ymd, originParts.ymd)).toBe("Bugün");

      // +5 saat -> 00:00 JST (2026-11-27 -> henüz 5 saat geçmiş olmasına rağmen takvim günü 'Yarın'!)
      const h5Parts = tokyoResolver.epochMsToLocalParts(startEpochMs + 5 * 3_600_000);
      expect(h5Parts.isoHour).toBe("2026-11-27T00:00");
      expect(computeCalendarDayDiff(h5Parts.ymd, originParts.ymd)).toBe(1);
      expect(formatRelativeDayLabelTr(h5Parts.ymd, originParts.ymd)).toBe("Yarın");
    });

    it("New York (America/New_York) 2026-03-08 ileri sarma ve 2026-11-01 geri sarma (çift 01:00) geçişlerinde tam 3_600_000 ms monoton UTC adımı üretir", () => {
      const nySpring = createFastZonedTimeResolver("America/New_York", -5 * 3600);
      // 2026-03-08 02:00 EST -> 03:00 EDT sıçraması (gerçek saatlik dizi)
      const springLocalHours = [
        "2026-03-08T00:00",
        "2026-03-08T01:00",
        "2026-03-08T03:00",
        "2026-03-08T04:00",
        "2026-03-08T05:00"
      ];

      const springUtcMs: number[] = [];
      let prevSpringMs: number | undefined;
      for (const iso of springLocalHours) {
        const ms = nySpring.localIsoToUtcDate(iso, prevSpringMs).getTime();
        springUtcMs.push(ms);
        prevSpringMs = ms;
      }

      for (let i = 1; i < springUtcMs.length; i++) {
        expect(springUtcMs[i] - springUtcMs[i - 1]).toBe(3_600_000);
      }
      expect(nySpring.epochMsToLocalParts(springUtcMs[1]).offsetSeconds).toBe(-18000); // EST (-5)
      expect(nySpring.epochMsToLocalParts(springUtcMs[2]).offsetSeconds).toBe(-14400); // EDT (-4)

      const nyFall = createFastZonedTimeResolver("America/New_York", -4 * 3600);
      // 2026-11-01 01:00 EDT ve ardından tekrar 01:00 EST (çift 01:00 geri sarma katlanması!)
      const fallLocalHours = [
        "2026-11-01T00:00",
        "2026-11-01T01:00",
        "2026-11-01T01:00",
        "2026-11-01T02:00",
        "2026-11-01T03:00"
      ];

      const fallUtcMs: number[] = [];
      let prevFallMs: number | undefined;
      for (const iso of fallLocalHours) {
        const ms = nyFall.localIsoToUtcDate(iso, prevFallMs).getTime();
        fallUtcMs.push(ms);
        prevFallMs = ms;
      }

      for (let i = 1; i < fallUtcMs.length; i++) {
        expect(fallUtcMs[i] - fallUtcMs[i - 1]).toBe(3_600_000);
      }
      expect(nyFall.epochMsToLocalParts(fallUtcMs[1]).offsetSeconds).toBe(-14400); // 1. 01:00 -> EDT (-4)
      expect(nyFall.epochMsToLocalParts(fallUtcMs[2]).offsetSeconds).toBe(-18000); // 2. 01:00 -> EST (-5)
    });

    it("Reykjavik yaz gündönümünde (sunrise 02:55, sunset 00:04) 0s 0dk yerine 1269 dk (21s 9dk) ve progress ∈ [0, 1] üretir", () => {
      const arcTemporal = computeModularSolarArc({
        referenceIso: "2026-06-21T13:30",
        sunrise: "2026-06-21T02:55",
        sunset: "2026-06-21T00:04",
        solarElevationDeg: 18
      });

      expect(arcTemporal.dayDurationMin).toBe(1269);
      expect(arcTemporal.dayDurationLabelTr).toBe("21s 9dk");
      expect(arcTemporal.dayDurationLabelTr).not.toBe("0s 0dk");
      expect(arcTemporal.solarArcProgress).toBeGreaterThanOrEqual(0);
      expect(arcTemporal.solarArcProgress).toBeLessThanOrEqual(1);
      expect(arcTemporal.solarArcProgress).toBeCloseTo(635 / 1269, 2);

      // Gece yarısını hemen geçtikten sonra (00:02, güneş batmadan 2 dk önce) yay sonuna (~0.998) yakın olmalı
      const arcAfterMidnight = computeModularSolarArc({
        referenceIso: "2026-06-21T00:02",
        sunrise: "2026-06-21T02:55",
        sunset: "2026-06-21T00:04",
        solarElevationDeg: 0.4
      });
      expect(arcAfterMidnight.dayDurationMin).toBe(1269);
      expect(arcAfterMidnight.solarArcProgress).toBeGreaterThan(0.99);
      expect(arcAfterMidnight.solarArcProgress).toBeLessThanOrEqual(1);

      // weather-client içindeki modüler güneş yayı çözücüsü ile de birebir tutarlılık
      const arcClient = computeClientModularSolarArc({
        sunriseIso: "2026-06-21T02:55",
        sunsetIso: "2026-06-21T00:04",
        nowLocalMinutes: 13 * 60 + 30,
        solarElevationDeg: 18
      });
      expect(arcClient.daylightMinutes).toBe(1269);
      expect(arcClient.durationLabelTr).toBe("21s 9dk");
      expect(arcClient.wrapsMidnight).toBe(true);
      expect(arcClient.progress).toBeGreaterThanOrEqual(0);
      expect(arcClient.progress).toBeLessThanOrEqual(1);
    });
  });

  describe("I-4: Mudanya 15m – Bursa WMO 17116 100m – Uludağ 1850m 4-Rakım Monotonluğu & 24s Kar Örtüsü Hafızası", () => {
    it("Mudanya (15m), Bursa Merkez (100m) ve Uludağ (1850m) seçimlerinde 4 bandın rakımları kesin artandır ve seçili referans bant ana çıktıyla (%0 sapma, 1.52x çifte çarpım olmadan) birebir özdeştir", () => {
      const mudanyaLoc = BURSA_CURATED_LOCATIONS.find((l) => l.id === "bursa-mudanya-tr")!;
      const uludagLoc = BURSA_CURATED_LOCATIONS.find((l) => l.id === "bursa-uludag-tr")!;

      const uludagSpecs = buildElevationBandSpecs(uludagLoc.lat, uludagLoc.lon, 1850);
      expect(uludagSpecs[3].elevationM).toBe(1850);
      expect(uludagSpecs[3].isReferenceBand).toBe(true);
      expect(uludagSpecs[3].orographicBoost).toBe(1.0); // 1.52x çifte çarpım yok!

      const mudanyaOut = simulateCoupledSnowTimeline({
        hours: [
          makeWinterFrontHour({
            lat: mudanyaLoc.lat,
            lon: mudanyaLoc.lon,
            elevationM: 15
          })
        ]
      })[0];

      const bursaOut = simulateCoupledSnowTimeline({
        hours: [
          makeWinterFrontHour({
            lat: BURSA_WMO_17116_LAT,
            lon: BURSA_WMO_17116_LON,
            elevationM: BURSA_WMO_17116_ELEVATION_M
          })
        ]
      })[0];

      const uludagOut = simulateCoupledSnowTimeline({
        hours: [
          makeWinterFrontHour({
            lat: uludagLoc.lat,
            lon: uludagLoc.lon,
            elevationM: 1850
          })
        ]
      })[0];

      for (const sample of [mudanyaOut, bursaOut, uludagOut]) {
        const b = sample.elevationBands;
        expect(b).toHaveLength(4);
        expect(b[0].elevationM).toBeLessThan(b[1].elevationM);
        expect(b[1].elevationM).toBeLessThan(b[2].elevationM);
        expect(b[2].elevationM).toBeLessThan(b[3].elevationM);

        // Fiziksel kütle korunumu ve rakım monotonluğu: snow_15m <= snow_100m <= snow_550m <= snow_1850m
        expect(b[0].airSnowCm).toBeLessThanOrEqual(b[1].airSnowCm);
        expect(b[1].airSnowCm).toBeLessThanOrEqual(b[2].airSnowCm);
        expect(b[2].airSnowCm).toBeLessThanOrEqual(b[3].airSnowCm);

        for (const band of b) {
          expect(band.groundSnowCm).toBeLessThanOrEqual(band.airSnowCm);
          expect(band.roadSnowCm).toBeLessThanOrEqual(band.airSnowCm);
        }
      }

      // Uludağ (1850m) zirve bandı 320m'ye kırpılmaz ve ana çıktıyla 1-e-1 özdeştir
      const uludagSummitBand = uludagOut.elevationBands[3];
      expect(uludagSummitBand.elevationM).toBe(1850);
      expect(uludagSummitBand.airSnowCm).toBe(uludagOut.airSnowCm);
      expect(uludagSummitBand.groundSnowCm).toBe(uludagOut.groundSnowCm);
      expect(uludagSummitBand.roadSnowCm).toBe(uludagOut.roadSnowCm);
      expect(uludagSummitBand.maxSnowpackCm).toBe(uludagOut.snowpackDepthCm);

      // Mudanya (15m -> b[0]) ve Bursa Merkez (100m -> b[1]) referans bant özdeşliği
      expect(mudanyaOut.elevationBands[0].elevationM).toBe(15);
      expect(mudanyaOut.elevationBands[0].airSnowCm).toBe(mudanyaOut.airSnowCm);
      expect(bursaOut.elevationBands[1].elevationM).toBe(100);
      expect(bursaOut.elevationBands[1].airSnowCm).toBe(bursaOut.airSnowCm);
    });

    it("antecedentHours içinde gece kar yağışı verildiğinde t=0 sabahında yağış dursa bile snowpackDepthCm > 0 korunur", () => {
      const overnightSnowAntecedent: SimAntecedentHourInput[] = Array.from(
        { length: 24 },
        (_, idx) => {
          const isOvernightSnow = idx >= 16; // Gece son 8 saatte yoğun kar yağışı
          return {
            temp2mC: isOvernightSnow ? -2.4 : 1.5,
            wetBulbC: isOvernightSnow ? -2.8 : 0.6,
            shortwaveWm2: idx >= 4 && idx <= 11 ? 140 : 0,
            cloudCoverPct: isOvernightSnow ? 96 : 60,
            precipMmHr: isOvernightSnow ? 2.2 : 0,
            snowfallCm: isOvernightSnow ? 2.8 : 0
          };
        }
      );

      // Sabah 08:00 (t=0): Yağış tamamen kesilmiş (0.0 mm/sa), hava -0.6°C
      const dryMorningHour: SimSnowHourInput = {
        ...makeWinterFrontHour({
          lat: BURSA_WMO_17116_LAT,
          lon: BURSA_WMO_17116_LON,
          elevationM: BURSA_WMO_17116_ELEVATION_M
        }),
        timeIso: "2026-12-23T08:00",
        dateYmd: "2026-12-23",
        temp2mC: -0.6,
        rh2mPct: 82,
        wetBulbC: -1.4,
        solarElevationDeg: 6,
        shortwaveWm2: 45,
        precipMmHr: 0.0,
        precipP90MmHr: 0.0,
        precipProbPct: 5,
        rawModelSnowfallCm: 0.0,
        precipPhase: "none"
      };

      const morningOut = simulateCoupledSnowTimeline({
        hours: [dryMorningHour],
        antecedentHours: overnightSnowAntecedent
      })[0];

      expect(morningOut.airSnowCm).toBe(0);
      expect(morningOut.snowpackDepthCm).toBeGreaterThan(5);
      expect(morningOut.elevationBands[1].maxSnowpackCm).toBe(morningOut.snowpackDepthCm);
      expect(morningOut.elevationBands[3].maxSnowpackCm).toBeGreaterThan(
        morningOut.snowpackDepthCm
      );
    });
  });

  describe("I-6: reanchorWeatherBundleToNow snowAndLightning İleri Sarma", () => {
    it("3 saatlik eski pakette snowAndLightning özetini ve 3-halkalı radarı nextHourly[0] ile senkron günceller ve kanonik eşitliği korur", () => {
      const staleBundle = makeStaleSnowLightningBundle();
      // 3 saat sonra: 2026-12-10T21:00:00Z == 2026-12-11T00:00 TRT (sakin mola saati: 0.0 mm, %6 şimşek)
      const nowPlus3hMs = Date.parse("2026-12-10T21:00:00.000Z");

      const reanchored = reanchorWeatherBundleToNow(staleBundle, nowPlus3hMs, {
        status: "stale",
        sourceTier: "disk-stale"
      });

      expect(reanchored.hourly[0].time).toBe("2026-12-11T00:00");
      expect(reanchored.hourly[0].dayLabel).toBe("Bugün");

      // Kanonik "Şimdi" eşitliği: nextCurrent === nextHourly[0]
      expect(reanchored.current.temperature).toBe(reanchored.hourly[0].temperature);
      expect(reanchored.current.apparentTemperature).toBe(
        reanchored.hourly[0].apparentTemperature
      );
      expect(reanchored.current.wetBulbC).toBe(reanchored.hourly[0].wetBulbC);
      expect(reanchored.current.precipitation).toBe(reanchored.hourly[0].precipitation);
      expect(reanchored.current.precipPhase).toBe(reanchored.hourly[0].precipPhase);
      expect(reanchored.current.airSnowCmHr).toBe(reanchored.hourly[0].airSnowCm);
      expect(reanchored.current.lightningProbPct).toBe(reanchored.hourly[0].lightningProbPct);

      // snowAndLightning özeti geçmiş 3 saati (2026-12-10: 7.5 cm kar & %68 kış orajı) düşürüp kalan pencereye senkronlanır!
      const sl = reanchored.snowAndLightning!;
      expect(sl).toBeDefined();
      expect(sl.total15dAirSnowCm).toBe(1.8); // Yalnızca 2026-12-11 03:00'teki 1.8 cm gelecek kar kaldı
      expect(sl.nextSnowHourIso).toBe("2026-12-11T03:00");
      expect(sl.nextLightningHourIso).toBe("2026-12-11T03:00");
      expect(sl.peak48hLightningProbPct).toBe(54);
      expect(sl.hasThundersnow168h).toBe(false);
      expect(sl.maxBlowingSnow48h).toBe("none");
      expect(sl.soilTempNowC).toBe(reanchored.current.soilTempC);
      expect(sl.roadTempNowC).toBe(reanchored.current.roadTempC);

      // 3-halkalı yakınlık radarı da artık geçmişteki %68 ACİL alarmda takılı kalmaz; yeni nextHourly[0] (%6) ile güncellenir
      expect(sl.lightningRadar.radarBacked).toBe(false);
      expect(sl.lightningRadar.isThundersnowNow).toBe(false);
      expect(sl.lightningRadar.safetyLevel).toBe("safe");
      expect(sl.lightningRadar.rings[0].probabilityPct).toBeLessThanOrEqual(15);
    });
  });
});
