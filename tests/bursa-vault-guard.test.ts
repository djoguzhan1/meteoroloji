import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  BURSA_FROZEN_SHA256_MANIFEST,
  sanitizeBursaMeshToStrictTr16,
  verifyBursaImmutabilityManifest
} from "../lib/provinces/bursa-vault-guard";
import { resolveProvinceCode } from "../lib/provinces/geo-adm1-resolver";
import {
  BURSA_REFERENCE_STATIONS,
  type BursaMeshSnapshot,
  type RawStationObservation,
  runBursaObservationQC
} from "../lib/bursa-mesh";
import { predictBursaTrainedTempC } from "../lib/bursa-trained-emos";
import {
  classifyBursaSynopticRegime,
  computeBursaDistrictMicroclimateOffsetC,
  interpolateTopographicSurface
} from "../lib/topographic-cressman";

const GOLDEN_FIXTURE_PATH = path.join(
  process.cwd(),
  "tests",
  "fixtures",
  "bursa-golden-v5.json"
);

function makeObs(
  stationKey: keyof typeof BURSA_REFERENCE_STATIONS,
  overrides: Partial<RawStationObservation>,
  nowIso = "2026-01-15T06:00:00.000Z"
): RawStationObservation {
  return {
    station: BURSA_REFERENCE_STATIONS[stationKey],
    observedAtIso: nowIso,
    tempC: 4.2,
    dewPointC: 2.1,
    relHumidityPct: 86,
    pressureMslHpa: 1018.4,
    pressureStationHpa: 1006.0,
    windSpeedKt: 8,
    windGustKt: 14,
    windDirDeg: 30,
    precip10MinMm: 0.2,
    precip1HrMm: 1.2,
    precip24HrMm: 6.4,
    visibilityM: 8000,
    snowDepthCm: null,
    isPrecipitating: true,
    hasTenthDegreePrecision: true,
    source: "MGM_10MIN",
    ...overrides
  };
}

function buildDeterministicBursaGoldenPayload() {
  const nowIso = "2026-01-15T06:00:00.000Z";
  const nowMs = Date.parse(nowIso);

  const winterEmosTempC = predictBursaTrainedTempC({
    leadHours: 24,
    utcDate: new Date("2026-01-16T06:00:00Z"),
    localHourTrt: 9,
    tempSnapshot: {
      ecmwfIfs: 1.8,
      ecmwfAifs: 1.5,
      icon: 1.2,
      ukmo: 1.6,
      meteofrance: 1.1,
      gfs: 2.1,
      gem: 1.9,
      jma: 2.0
    },
    precipSnapshot: {
      ecmwfIfs: 1.4,
      ecmwfAifs: 1.2,
      icon: 1.8,
      ukmo: 1.5,
      meteofrance: 1.6,
      gfs: 1.1,
      gem: 1.3,
      jma: 1.2
    },
    neighborMedians: {
      minus3h: 1.3,
      minus1h: 1.5,
      plus1h: 1.9,
      plus3h: 2.4,
      min24h: 0.4,
      max24h: 3.6
    },
    physicalDrivers: {
      dewPointC: 0.6,
      cloudCoverPct: 95,
      windSpeedKmh: 22,
      windDirDeg: 28,
      pressureMslHpa: 1019.5,
      pressureDelta3hHpa: 1.4,
      shortwaveRadiationWm2: 65
    },
    targetElevationM: 100
  });

  const lodosEmosTempC = predictBursaTrainedTempC({
    leadHours: 12,
    utcDate: new Date("2026-11-28T11:00:00Z"),
    localHourTrt: 14,
    tempSnapshot: {
      ecmwfIfs: 17.4,
      ecmwfAifs: 17.8,
      icon: 18.2,
      ukmo: 17.6,
      meteofrance: 18.5,
      gfs: 17.1,
      gem: 17.3,
      jma: 17.0
    },
    precipSnapshot: {
      ecmwfIfs: 0,
      ecmwfAifs: 0,
      icon: 0,
      ukmo: 0,
      meteofrance: 0,
      gfs: 0,
      gem: 0,
      jma: 0
    },
    neighborMedians: {
      minus3h: 15.8,
      minus1h: 17.1,
      plus1h: 17.9,
      plus3h: 16.4,
      min24h: 11.2,
      max24h: 18.4
    },
    physicalDrivers: {
      dewPointC: 7.4,
      cloudCoverPct: 42,
      windSpeedKmh: 38,
      windDirDeg: 212,
      pressureMslHpa: 1008.2,
      pressureDelta3hHpa: -2.1,
      shortwaveRadiationWm2: 390
    },
    targetElevationM: 155
  });

  const qc = runBursaObservationQC(
    [
      makeObs("WMO_17116", { tempC: 4.2, dewPointC: 2.1, windSpeedKt: 8 }, nowIso),
      makeObs("MGM_OSMANGAZI_FOOTHILL", { tempC: 3.8, dewPointC: 1.9, windSpeedKt: 9 }, nowIso),
      makeObs("MGM_NILUFER", { tempC: 4.4, dewPointC: 2.3, windSpeedKt: 7 }, nowIso),
      makeObs("WMO_17676_ULUDAG", { tempC: -6.8, dewPointC: -7.5, windSpeedKt: 24 }, nowIso)
    ],
    {
      nowMs,
      isNight: false,
      cloudCoverPct: 92,
      wind850DirDeg: 25,
      wind850SpeedKt: 24
    }
  );

  const cressmanOsmangazi = interpolateTopographicSurface(
    { lat: 40.1885, lon: 29.061, elevationM: 155 },
    qc.stations,
    qc.verticalProfile,
    { isNight: false, localHour: 9, cloudCoverPct: 92 }
  );

  const lodosRegime = classifyBursaSynopticRegime({
    windDir10mDeg: 210,
    windSpeed10mKt: 16,
    pressureMslHpa: 1008,
    cloudCoverPct: 45,
    localHour: 14,
    month: 11
  });

  const kestelNightOffsetC = computeBursaDistrictMicroclimateOffsetC({
    targetLat: 40.198,
    targetLon: 29.212,
    targetElevationM: 180,
    base17116TempC: 8.5,
    localHour: 3,
    isNight: true,
    cloudCoverPct: 10,
    windSpeedKmh: 4,
    windDirDeg: 130
  });

  return {
    schemaVersion: "bursa-golden-v5.0",
    frozenManifestCount: Object.keys(BURSA_FROZEN_SHA256_MANIFEST).length,
    winterEmosTempC,
    lodosEmosTempC,
    verticalProfile: qc.verticalProfile,
    cressmanOsmangazi,
    lodosRegime,
    kestelNightOffsetC
  };
}

describe("Wave 0 — Bursa (TR-16) Cryptographic Vault & Golden Snapshot Guard", () => {
  it("verifies all 11 frozen Bursa core files are 100% byte-identical via SHA-256", () => {
    const check = verifyBursaImmutabilityManifest(process.cwd());
    expect(check.checkedCount).toBe(11);
    expect(check.violations).toEqual([]);
    expect(check.ok).toBe(true);
  });

  it("matches deterministic Bursa v5.0 golden physics & EMOS output bit-for-bit", () => {
    const current = buildDeterministicBursaGoldenPayload();
    if (!fs.existsSync(GOLDEN_FIXTURE_PATH)) {
      fs.mkdirSync(path.dirname(GOLDEN_FIXTURE_PATH), { recursive: true });
      fs.writeFileSync(GOLDEN_FIXTURE_PATH, JSON.stringify(current, null, 2) + "\n", "utf8");
    }
    const expected = JSON.parse(fs.readFileSync(GOLDEN_FIXTURE_PATH, "utf8"));
    expect(JSON.parse(JSON.stringify(current))).toEqual(expected);
  });

  it("strips LTFJ (Istanbul), LTBG (Balikesir), and cross-bay Yalova (TR-77) PWS from Bursa runtime mesh", () => {
    const nowIso = "2026-11-28T12:00:00.000Z";
    const nowMs = Date.parse(nowIso);
    const qc = runBursaObservationQC(
      [
        makeObs("WMO_17116", { tempC: 12.4, dewPointC: 7.2, windSpeedKt: 6 }, nowIso),
        makeObs("ICAO_LTFJ", { tempC: 9.0, dewPointC: 6.0, source: "NOAA_METAR" }, nowIso),
        makeObs("ICAO_LTBG", { tempC: 11.1, dewPointC: 8.1, source: "NOAA_METAR" }, nowIso),
        {
          ...makeObs("WMO_17116", { tempC: 15.8, dewPointC: 10.2 }, nowIso),
          station: {
            ...BURSA_REFERENCE_STATIONS.WMO_17116,
            id: "PWS_ARMUTLU_TR77",
            name: "Armutlu PWS",
            district: "Armutlu",
            lat: 40.521,
            lon: 28.831,
            elevationM: 18,
            tier: 3
          },
          source: "OPENSENSE_PWS"
        }
      ],
      { nowMs, isNight: false, cloudCoverPct: 35 }
    );

    const rawMesh: BursaMeshSnapshot = {
      isBursaRegion: true,
      fetchedAtIso: nowIso,
      stations: qc.stations,
      verticalProfile: qc.verticalProfile,
      acceptedCount: qc.stations.filter((s) => s.qcWeight > 0).length,
      rejectedCount: qc.stations.filter((s) => s.qcWeight === 0).length,
      tier1OnlineCount: qc.stations.filter((s) => s.qcWeight > 0 && s.station.tier === 1).length
    };

    const sanitized = sanitizeBursaMeshToStrictTr16(rawMesh, (lat, lon) =>
      resolveProvinceCode({ lat, lon }).provinceCode
    );
    expect(sanitized.stations.map((s) => s.station.id)).toEqual([
      BURSA_REFERENCE_STATIONS.WMO_17116.id
    ]);
    expect(sanitized.acceptedCount).toBe(1);
    expect(sanitized.tier1OnlineCount).toBe(1);
  });
});
