import { describe, expect, it } from 'vitest';
import {
  BURSA_REFERENCE_STATIONS,
  computeLiveBursaVerticalProfile,
  parseMetarTenthDegreeGroup,
  type RawStationObservation,
  runBursaObservationQC,
} from '../lib/bursa-mesh';
import {
  classifyBursaSynopticRegime,
  evaluateRegimeKalmanMos,
  interpolateTopographicSurface,
  type TrainingVerificationPair,
} from '../lib/topographic-cressman';

function makeObs(
  stationKey: keyof typeof BURSA_REFERENCE_STATIONS,
  overrides: Partial<RawStationObservation>,
  nowIso = '2026-11-26T02:00:00.000Z',
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
    source: 'MGM_10MIN',
    ...overrides,
  };
}

describe('ATMOS v4.5 — Bursa Hyper-Local Observation Mesh & Topographic Cressman', () => {
  it('decodes 0.1°C precision T-group remarks from aviation METAR strings', () => {
    const raw = 'METAR LTBR 260150Z VRB02KT 6000 NSC 02/M01 Q1024 NOSIG RMK RWY07 T00181009';
    const parsed = parseMetarTenthDegreeGroup(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.tempC).toBeCloseTo(1.8, 2);
    expect(parsed?.dewPointC).toBeCloseTo(-0.9, 2);
  });

  it('blocks the LTBR Yenişehir rural frost-basin trap from poisoning Bursa Osmangazi at night', () => {
    const nowIso = '2026-11-26T02:00:00.000Z';
    const nowMs = Date.parse(nowIso);

    // Clear calm night: Bursa Osmangazi/17116 is ~7.4°C - 7.8°C, Uludağ Zirve is +2.5°C,
    // while LTBR Yenişehir (47 km East in closed rural basin) drops to +1.4°C!
    const rawList: RawStationObservation[] = [
      makeObs('WMO_17116', { tempC: 7.4, dewPointC: 4.2, windSpeedKt: 3 }, nowIso),
      makeObs('MGM_OSMANGAZI_FOOTHILL', { tempC: 7.8, dewPointC: 3.9, windSpeedKt: 4 }, nowIso),
      makeObs('MGM_NILUFER', { tempC: 7.0, dewPointC: 4.5, windSpeedKt: 3 }, nowIso),
      makeObs('WMO_17676_ULUDAG', { tempC: 2.5, dewPointC: -1.0, windSpeedKt: 12 }, nowIso),
      makeObs(
        'ICAO_LTBR',
        { tempC: 1.4, dewPointC: 1.1, windSpeedKt: 1.5, source: 'NOAA_METAR' },
        nowIso,
      ),
    ];

    const { stations, verticalProfile } = runBursaObservationQC(rawList, {
      nowMs,
      isNight: true,
      cloudCoverPct: 12,
    });

    const surface = interpolateTopographicSurface(
      { lat: 40.1885, lon: 29.0610, elevationM: 155 },
      stations,
      verticalProfile,
      { isNight: true, localHour: 5, cloudCoverPct: 12 },
    );

    expect(surface).not.toBeNull();
    // Must lock tightly onto Bursa Osmangazi (~7.7°C) within < 0.35°C, completely immune to LTBR's 1.4°C!
    expect(Math.abs((surface?.tempC ?? 0) - 7.75)).toBeLessThan(0.35);

    const ltbrTrace = surface?.contributions.find((c) => c.stationId === 'ICAO_LTBR');
    expect(ltbrTrace?.normalizedWeight ?? 0).toBeLessThan(0.01);
  });

  it('reconstructs Bursa urban temperature via physical UHI/basin transfer even during complete MGM outage', () => {
    const nowIso = '2026-11-26T01:00:00.000Z';
    const nowMs = Date.parse(nowIso);

    // Worst-case outage: ONLY LTBR (Yenişehir = 1.6°C on a clear calm night) is online!
    const outageObs: RawStationObservation[] = [
      makeObs(
        'ICAO_LTBR',
        { tempC: 1.6, dewPointC: 1.2, windSpeedKt: 2, source: 'NOAA_METAR' },
        nowIso,
      ),
    ];

    const { stations, verticalProfile } = runBursaObservationQC(outageObs, {
      nowMs,
      isNight: true,
      cloudCoverPct: 10,
      wind850SpeedKt: 6,
    });

    const surface = interpolateTopographicSurface(
      { lat: 40.1885, lon: 29.0610, elevationM: 155 },
      stations,
      verticalProfile,
      { isNight: true, localHour: 4, cloudCoverPct: 10, ambientWindSpeedKt: 2 },
    );

    expect(surface).not.toBeNull();
    expect(surface?.usedFallbackBasinTransfer).toBe(true);
    // Instead of raw 1.6°C (> 4.5°C cold error), transfer function recovers ~5.2°C - 6.6°C urban temperature
    expect(surface?.tempC ?? 0).toBeGreaterThan(4.8);
    expect(surface?.tempC ?? 0).toBeLessThan(7.2);
  });

  it('rejects daytime solar-overheated citizen PWS while preserving valid high-elevation Uludağ station', () => {
    const nowIso = '2026-07-18T11:30:00.000Z';
    const nowMs = Date.parse(nowIso);

    const rawList: RawStationObservation[] = [
      makeObs('WMO_17116', { tempC: 30.2, windSpeedKt: 5 }, nowIso),
      makeObs('MGM_OSMANGAZI_FOOTHILL', { tempC: 29.8, windSpeedKt: 5 }, nowIso),
      makeObs('MGM_NILUFER', { tempC: 30.4, windSpeedKt: 6 }, nowIso),
      makeObs('WMO_17676_ULUDAG', { tempC: 17.6, windSpeedKt: 14 }, nowIso),
      {
        ...makeObs('MGM_OSMANGAZI_FOOTHILL', { tempC: 36.4, windSpeedKt: 1.5 }, nowIso),
        station: {
          ...BURSA_REFERENCE_STATIONS.MGM_OSMANGAZI_FOOTHILL,
          id: 'PWS_UNSHIELDED_ROOF',
          name: 'Unshielded Balcony PWS',
          tier: 3,
        },
        source: 'OPENSENSE_PWS',
      },
    ];

    const { stations } = runBursaObservationQC(rawList, {
      nowMs,
      isNight: false,
      solarRadiationWm2: 780,
      cloudCoverPct: 5,
    });

    const badPws = stations.find((s) => s.station.id === 'PWS_UNSHIELDED_ROOF');
    const uludag = stations.find((s) => s.station.id === 'WMO_17676_ULUDAG');

    expect(badPws?.qcFlags).toContain('SOLAR_RADIATION_SPIKE');
    expect(badPws?.qcWeight).toBe(0);
    expect(uludag?.qcWeight).toBeGreaterThan(0.7);
  });

  it('detects both winter Ova temperature inversions and Lodos dry-adiabatic Foehn profiles', () => {
    const invProfile = computeLiveBursaVerticalProfile([
      makeObs('WMO_17116', { tempC: 1.5 }),
      makeObs('MGM_NILUFER', { tempC: 1.2 }),
      makeObs('MGM_ULUDAG_SARIALAN', { tempC: 5.8 }),
    ]);
    expect(invProfile.boundaryLayerState).toBe('STRONG_INVERSION');
    expect(invProfile.lapseRateCPerKm).toBeGreaterThan(2.0);

    const foehnProfile = computeLiveBursaVerticalProfile(
      [
        makeObs('WMO_17116', { tempC: 22.4, windDirDeg: 215, windSpeedKt: 18 }),
        makeObs('WMO_17676_ULUDAG', { tempC: 6.1, windDirDeg: 220, windSpeedKt: 34 }),
      ],
      { wind850DirDeg: 215, wind850SpeedKt: 32 },
    );
    expect(foehnProfile.boundaryLayerState).toBe('LODOS_FOEHN');
    expect(foehnProfile.lapseRateCPerKm).toBeLessThan(-8.5);
  });

  it('isolates Lodos Foehn bias from Poyraz cold-front forecasts in Regime Huber-Kalman MOS', () => {
    const models = ['iconEu', 'ecmwfIfs', 'gfs'] as const;
    const history: TrainingVerificationPair<(typeof models)[number]>[] = [];

    // 36 hours of Lodos Foehn where raw models were 2.6°C TOO COLD relative to Bursa truth (21°C)
    for (let h = 0; h < 36; h++) {
      history.push({
        timestampIso: `2026-11-24T${String(h % 24).padStart(2, '0')}:00:00Z`,
        observedTempC: 21.0,
        features: {
          windDir10mDeg: 215,
          windSpeed10mKt: 16,
          pressureMslHpa: 1008,
          cloudCoverPct: 60,
          localHour: h % 24,
          month: 11,
        },
        modelTempsC: {
          iconEu: 18.6,
          ecmwfIfs: 18.4,
          gfs: 17.8,
        },
      });
    }

    // Evaluate two forecast targets:
    // Step A (T+12h): Lodos continues -> SHOULD apply ~ +2.3°C warm Foehn correction!
    // Step B (T+72h): Sharp Poyraz cold front (7.0°C) -> MUST NOT apply the +2.5°C Lodos bias!
    const calibrated = evaluateRegimeKalmanMos(models, history, [
      {
        leadHours: 12,
        features: {
          windDir10mDeg: 210,
          windSpeed10mKt: 15,
          pressureMslHpa: 1009,
          cloudCoverPct: 55,
          localHour: 14,
          month: 11,
        },
        modelTempsC: { iconEu: 18.5, ecmwfIfs: 18.5, gfs: 18.0 },
      },
      {
        leadHours: 72,
        features: {
          windDir10mDeg: 35,
          windSpeed10mKt: 14,
          pressureMslHpa: 1020,
          cloudCoverPct: 85,
          localHour: 14,
          month: 11,
        },
        modelTempsC: { iconEu: 7.0, ecmwfIfs: 7.0, gfs: 7.0 },
      },
    ]);

    const lodosStep = calibrated[0];
    const poyrazStep = calibrated[1];

    expect(classifyBursaSynopticRegime({
      windDir10mDeg: 35,
      windSpeed10mKt: 14,
      pressureMslHpa: 1020,
      cloudCoverPct: 85,
      localHour: 14,
      month: 11,
    })).toBe('POYRAZ_KARAYEL_ADV');

    expect(lodosStep.regime).toBe('LODOS_FOEHN');
    expect(lodosStep.appliedBiasCorrectionC).toBeGreaterThan(1.7);

    expect(poyrazStep.regime).toBe('POYRAZ_KARAYEL_ADV');
    // Zero Lodos warm-bias contamination into Poyraz cold front!
    expect(poyrazStep.appliedBiasCorrectionC).toBeLessThanOrEqual(0.0);
  });
});
