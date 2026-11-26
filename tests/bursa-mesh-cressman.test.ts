import { describe, expect, it } from "vitest";
import {
  BURSA_REFERENCE_STATIONS,
  computeLiveBursaVerticalProfile,
  parseMetarTenthDegreeGroup,
  type RawStationObservation,
  runBursaObservationQC
} from "../lib/bursa-mesh";
import { predictBursaTrainedTempC } from "../lib/bursa-trained-emos";
import {
  classifyBursaSynopticRegime,
  computeBursaDistrictMicroclimateOffsetC,
  interpolateTopographicSurface
} from "../lib/topographic-cressman";

function makeObs(
  stationKey: keyof typeof BURSA_REFERENCE_STATIONS,
  overrides: Partial<RawStationObservation>,
  nowIso = "2026-11-26T02:00:00.000Z"
): RawStationObservation {
  return {
    station: BURSA_REFERENCE_STATIONS[stationKey],
    observedAtIso: nowIso,
    tempC: 10,
    dewPointC: 6,
    relHumidityPct: 76,
    pressureMslHpa: 1021,
    pressureStationHpa: 1005,
    windSpeedKt: 3,
    windGustKt: null,
    windDirDeg: 40,
    precip10MinMm: 0,
    precip1HrMm: 0,
    precip24HrMm: 0,
    visibilityM: 10000,
    snowDepthCm: null,
    isPrecipitating: false,
    hasTenthDegreePrecision: true,
    source: "MGM_10MIN",
    ...overrides
  };
}

describe("ATMOS v5.0 — Bursa 19-İlçe Gözlem Ağı, Topografik Cressman ve Sinoptik Rejim Ayrımı", () => {
  it("decodes 0.1°C precision T-group remarks from aviation METAR strings", () => {
    const raw = "METAR LTBR 260150Z VRB02KT 6000 NSC 02/M01 Q1024 NOSIG RMK RWY07 T00181009";
    const parsed = parseMetarTenthDegreeGroup(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.tempC).toBeCloseTo(1.8, 2);
    expect(parsed?.dewPointC).toBeCloseTo(-0.9, 2);
  });

  it("blocks the LTBR Yenişehir rural frost-basin trap from poisoning Bursa Osmangazi at night", () => {
    const nowIso = "2026-11-26T02:00:00.000Z";
    const nowMs = Date.parse(nowIso);

    const rawList: RawStationObservation[] = [
      makeObs("WMO_17116", { tempC: 7.4, dewPointC: 4.2, windSpeedKt: 3 }, nowIso),
      makeObs("MGM_OSMANGAZI_FOOTHILL", { tempC: 7.8, dewPointC: 3.9, windSpeedKt: 4 }, nowIso),
      makeObs("MGM_NILUFER", { tempC: 7.0, dewPointC: 4.5, windSpeedKt: 3 }, nowIso),
      makeObs("WMO_17676_ULUDAG", { tempC: 2.5, dewPointC: -1.0, windSpeedKt: 12 }, nowIso),
      makeObs(
        "ICAO_LTBR",
        { tempC: 1.4, dewPointC: 1.1, windSpeedKt: 1.5, source: "NOAA_METAR" },
        nowIso
      )
    ];

    const { stations, verticalProfile } = runBursaObservationQC(rawList, {
      nowMs,
      isNight: true,
      cloudCoverPct: 12
    });

    const surface = interpolateTopographicSurface(
      { lat: 40.1885, lon: 29.061, elevationM: 155 },
      stations,
      verticalProfile,
      { isNight: true, localHour: 5, cloudCoverPct: 12 }
    );

    expect(surface).not.toBeNull();
    expect(Math.abs((surface?.tempC ?? 0) - 7.75)).toBeLessThan(0.35);

    const ltbrTrace = surface?.contributions.find((c) => c.stationId === "ICAO_LTBR");
    expect(ltbrTrace?.normalizedWeight ?? 0).toBeLessThan(0.01);
  });

  it("reconstructs Bursa urban temperature via physical UHI/basin transfer even during complete MGM outage", () => {
    const nowIso = "2026-11-26T01:00:00.000Z";
    const nowMs = Date.parse(nowIso);

    const outageObs: RawStationObservation[] = [
      makeObs(
        "ICAO_LTBR",
        { tempC: 1.6, dewPointC: 1.2, windSpeedKt: 2, source: "NOAA_METAR" },
        nowIso
      )
    ];

    const { stations, verticalProfile } = runBursaObservationQC(outageObs, {
      nowMs,
      isNight: true,
      cloudCoverPct: 10,
      wind850SpeedKt: 6
    });

    const surface = interpolateTopographicSurface(
      { lat: 40.1885, lon: 29.061, elevationM: 155 },
      stations,
      verticalProfile,
      { isNight: true, localHour: 4, cloudCoverPct: 10, ambientWindSpeedKt: 2 }
    );

    expect(surface).not.toBeNull();
    expect(surface?.usedFallbackBasinTransfer).toBe(true);
    expect(surface?.tempC ?? 0).toBeGreaterThan(4.8);
    expect(surface?.tempC ?? 0).toBeLessThan(7.2);
  });

  it("rejects daytime solar-overheated citizen PWS while preserving valid high-elevation Uludağ station", () => {
    const nowIso = "2026-07-18T11:30:00.000Z";
    const nowMs = Date.parse(nowIso);

    const rawList: RawStationObservation[] = [
      makeObs("WMO_17116", { tempC: 30.2, windSpeedKt: 5 }, nowIso),
      makeObs("MGM_OSMANGAZI_FOOTHILL", { tempC: 29.8, windSpeedKt: 5 }, nowIso),
      makeObs("MGM_NILUFER", { tempC: 30.4, windSpeedKt: 6 }, nowIso),
      makeObs("WMO_17676_ULUDAG", { tempC: 17.6, windSpeedKt: 14 }, nowIso),
      {
        ...makeObs("MGM_OSMANGAZI_FOOTHILL", { tempC: 36.4, windSpeedKt: 1.5 }, nowIso),
        station: {
          ...BURSA_REFERENCE_STATIONS.MGM_OSMANGAZI_FOOTHILL,
          id: "PWS_UNSHIELDED_ROOF",
          name: "Unshielded Balcony PWS",
          tier: 3
        },
        source: "OPENSENSE_PWS"
      }
    ];

    const { stations } = runBursaObservationQC(rawList, {
      nowMs,
      isNight: false,
      solarRadiationWm2: 780,
      cloudCoverPct: 5
    });

    const badPws = stations.find((s) => s.station.id === "PWS_UNSHIELDED_ROOF");
    const uludag = stations.find((s) => s.station.id === "WMO_17676_ULUDAG");

    expect(badPws?.qcFlags).toContain("SOLAR_RADIATION_SPIKE");
    expect(badPws?.qcWeight).toBe(0);
    expect(uludag?.qcWeight).toBeGreaterThan(0.7);
  });

  it("detects winter Ova inversions, Lodos Foehn profiles, and intra-Bursa district microclimates without regime cross-contamination", () => {
    const invProfile = computeLiveBursaVerticalProfile([
      makeObs("WMO_17116", { tempC: 1.5 }),
      makeObs("MGM_NILUFER", { tempC: 1.2 }),
      makeObs("MGM_ULUDAG_SARIALAN", { tempC: 5.8 })
    ]);
    expect(invProfile.boundaryLayerState).toBe("STRONG_INVERSION");
    expect(invProfile.lapseRateCPerKm).toBeGreaterThan(2.0);

    const foehnProfile = computeLiveBursaVerticalProfile(
      [
        makeObs("WMO_17116", { tempC: 22.4, windDirDeg: 215, windSpeedKt: 18 }),
        makeObs("WMO_17676_ULUDAG", { tempC: 6.1, windDirDeg: 220, windSpeedKt: 34 })
      ],
      { wind850DirDeg: 215, wind850SpeedKt: 32 }
    );
    expect(foehnProfile.boundaryLayerState).toBe("LODOS_FOEHN");
    expect(foehnProfile.lapseRateCPerKm).toBeLessThan(-8.5);

    expect(
      classifyBursaSynopticRegime({
        windDir10mDeg: 210,
        windSpeed10mKt: 15,
        pressureMslHpa: 1009,
        cloudCoverPct: 55,
        localHour: 14,
        month: 11
      })
    ).toBe("LODOS_FOEHN");

    expect(
      classifyBursaSynopticRegime({
        windDir10mDeg: 35,
        windSpeed10mKt: 14,
        pressureMslHpa: 1020,
        cloudCoverPct: 85,
        localHour: 14,
        month: 11
      })
    ).toBe("POYRAZ_KARAYEL_ADV");

    const kestelNightDelta = computeBursaDistrictMicroclimateOffsetC({
      targetLat: 40.198,
      targetLon: 29.212,
      targetElevationM: 180,
      base17116TempC: 9.0,
      localHour: 3,
      isNight: true,
      cloudCoverPct: 10,
      windSpeedKmh: 4,
      windDirDeg: 130
    });
    expect(kestelNightDelta).toBeLessThan(-1.0);

    const poyrazColdStep = predictBursaTrainedTempC({
      leadHours: 72,
      utcDate: new Date("2026-11-29T11:00:00Z"),
      localHourTrt: 14,
      tempSnapshot: {
        ecmwfIfs: 7.0,
        ecmwfAifs: 7.1,
        icon: 6.9,
        ukmo: 7.0,
        meteofrance: 7.1,
        gfs: 7.2,
        gem: 7.0,
        jma: 7.0
      },
      precipSnapshot: {
        ecmwfIfs: 0.4,
        ecmwfAifs: 0.3,
        icon: 0.5,
        ukmo: 0.4,
        meteofrance: 0.4,
        gfs: 0.3,
        gem: 0.4,
        jma: 0.3
      },
      neighborMedians: {
        minus3h: 6.6,
        minus1h: 6.9,
        plus1h: 7.0,
        plus3h: 6.5,
        min24h: 4.5,
        max24h: 7.4
      },
      physicalDrivers: {
        dewPointC: 5.5,
        cloudCoverPct: 88,
        windSpeedKmh: 26,
        windDirDeg: 35,
        pressureMslHpa: 1020,
        pressureDelta3hHpa: 1.5,
        shortwaveRadiationWm2: 140
      },
      targetElevationM: 100
    });
    expect(poyrazColdStep).not.toBeNull();
    expect(poyrazColdStep!).toBeLessThan(8.2);
  });
});
