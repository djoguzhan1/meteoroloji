/**
 * ATMOS v5.0 — Anisotropic Topographic Cressman-Barnes, Intra-Bursa District Microclimate Solver & Synoptic Regime Classifier
 * File: lib/topographic-cressman.ts
 *
 * Provides:
 *  1. 3-Layer Piecewise Hydrostatic + Anisotropic Ridge-Barrier Cressman-Barnes Surface Solver
 *  2. Intra-Bursa District Microclimate Differential Solver (`computeBursaDistrictMicroclimateOffsetC`)
 *  3. Physical LTBR (Yenişehir Rural Basin) -> Bursa Urban/Foothill Transfer Unbiaser
 *  4. 6-Regime Bursa/Marmara Synoptic Classifier
 */

import {
  type BarrierGroup,
  type BoundaryLayerState,
  computeRelHumidityFromDewPoint,
  haversineKm,
  integratePiecewiseVerticalDeltaC,
  type LiveVerticalProfile,
  type MgmDailyDistrictDay,
  type QcStationObservation,
  type TerrainZone,
} from './bursa-mesh';

export type BursaSynopticRegime =
  | 'LODOS_FOEHN'
  | 'POYRAZ_KARAYEL_ADV'
  | 'OVA_INVERSION_CALM'
  | 'MARMARA_SEA_BREEZE'
  | 'CONVECTIVE_UNSTABLE'
  | 'SYNOPTIC_TRANSITION';

export interface TargetPointSpec {
  lat: number;
  lon: number;
  elevationM: number;
  zone?: TerrainZone;
  barrierGroup?: BarrierGroup;
  urbanFraction?: number;
}

export interface AmbientSurfaceDrivers {
  isNight: boolean;
  localHour: number;
  cloudCoverPct: number;
  ambientWindDirDeg?: number;
  ambientWindSpeedKt?: number;
}

export interface StationContributionTrace {
  stationId: string;
  stationName: string;
  distanceKm: number;
  deltaElevM: number;
  rawTempC: number;
  transportedTempC: number;
  normalizedWeight: number;
}

export interface TopographicSurfaceEstimate {
  tempC: number;
  dewPointC: number | null;
  relHumidityPct: number | null;
  pressureMslHpa: number | null;
  windSpeedKt: number | null;
  windDirDeg: number | null;
  precipRateMmHr: number;
  isPrecipitatingNow: boolean;
  uncertaintyC: number;
  usedFallbackBasinTransfer: boolean;
  verticalState: BoundaryLayerState;
  contributions: StationContributionTrace[];
}

const BARRIER_COUPLING: Record<BarrierGroup, Record<BarrierGroup, number>> = {
  BURSA_OVA: {
    BURSA_OVA: 1.0,
    MARMARA_COAST: 0.42,
    WEST_CORRIDOR: 0.55,
    ULUDAG_MASSIF: 0.24,
    YENISEHIR_BASIN: 0.08,
    NORTH_MARMARA: 0.20,
  },
  MARMARA_COAST: {
    BURSA_OVA: 0.42,
    MARMARA_COAST: 1.0,
    WEST_CORRIDOR: 0.65,
    ULUDAG_MASSIF: 0.12,
    YENISEHIR_BASIN: 0.06,
    NORTH_MARMARA: 0.60,
  },
  WEST_CORRIDOR: {
    BURSA_OVA: 0.58,
    MARMARA_COAST: 0.65,
    WEST_CORRIDOR: 1.0,
    ULUDAG_MASSIF: 0.15,
    YENISEHIR_BASIN: 0.08,
    NORTH_MARMARA: 0.35,
  },
  ULUDAG_MASSIF: {
    BURSA_OVA: 0.20,
    MARMARA_COAST: 0.10,
    WEST_CORRIDOR: 0.12,
    ULUDAG_MASSIF: 1.0,
    YENISEHIR_BASIN: 0.10,
    NORTH_MARMARA: 0.08,
  },
  YENISEHIR_BASIN: {
    BURSA_OVA: 0.08,
    MARMARA_COAST: 0.06,
    WEST_CORRIDOR: 0.08,
    ULUDAG_MASSIF: 0.10,
    YENISEHIR_BASIN: 1.0,
    NORTH_MARMARA: 0.12,
  },
  NORTH_MARMARA: {
    BURSA_OVA: 0.22,
    MARMARA_COAST: 0.60,
    WEST_CORRIDOR: 0.35,
    ULUDAG_MASSIF: 0.08,
    YENISEHIR_BASIN: 0.12,
    NORTH_MARMARA: 1.0,
  },
};

/** Infers target terrain zone & barrier group for arbitrary coordinates in the Bursa region */
export function inferBursaTargetZone(lat: number, lon: number, elevationM: number): Required<TargetPointSpec> {
  if (elevationM >= 1450) {
    return {
      lat,
      lon,
      elevationM,
      zone: 'alpine_ridge',
      barrierGroup: 'ULUDAG_MASSIF',
      urbanFraction: 0.05,
    };
  }
  if (elevationM >= 650 && lat < 40.17) {
    return {
      lat,
      lon,
      elevationM,
      zone: 'mountain_slope',
      barrierGroup: 'ULUDAG_MASSIF',
      urbanFraction: 0.10,
    };
  }
  if (lon >= 29.38 && lat >= 40.00 && lat <= 40.36) {
    return {
      lat,
      lon,
      elevationM,
      zone: 'rural_closed_basin',
      barrierGroup: 'YENISEHIR_BASIN',
      urbanFraction: 0.16,
    };
  }
  if (lat >= 40.33 && elevationM <= 95) {
    return {
      lat,
      lon,
      elevationM,
      zone: 'coastal_marmara',
      barrierGroup: 'MARMARA_COAST',
      urbanFraction: 0.48,
    };
  }
  const isOsmangaziYildirimCore = lat >= 40.175 && lat <= 40.265 && lon >= 28.97 && lon <= 29.15;
  const isNiluferPlain = lat >= 40.19 && lat <= 40.27 && lon >= 28.80 && lon < 28.97;
  return {
    lat,
    lon,
    elevationM,
    zone: elevationM >= 140 ? 'urban_foothill' : 'urban_plain',
    barrierGroup: 'BURSA_OVA',
    urbanFraction: isOsmangaziYildirimCore ? 0.86 : isNiluferPlain ? 0.64 : 0.46,
  };
}

/**
 * Computes the horizontal microclimate temperature offset (°C) relative to WMO 17116 (Osmangazi 100 m)
 * AFTER standard elevation transport has already been applied.
 */
export function computeBursaDistrictMicroclimateOffsetC(params: {
  targetLat: number;
  targetLon: number;
  targetElevationM: number;
  base17116TempC: number;
  localHour: number;
  isNight: boolean;
  cloudCoverPct: number;
  windSpeedKmh: number;
  windDirDeg: number;
  marmaraSstC?: number | null;
  mgmDistrictDay?: MgmDailyDistrictDay | null;
}): number {
  const distFrom17116Km = haversineKm(params.targetLat, params.targetLon, 40.2308, 29.0133);
  if (distFrom17116Km <= 3.5 && Math.abs(params.targetElevationM - 100) <= 65) {
    return 0;
  }

  const h = ((params.localHour % 24) + 24) % 24;
  const nightCoolingFactor =
    h >= 21 || h <= 6
      ? 1.0
      : h >= 18
        ? (h - 17) / 4
        : h <= 9
          ? (10 - h) / 4
          : 0.0;
  const afternoonFactor = h >= 11 && h <= 17 ? Math.sin(((h - 10) / 8) * Math.PI) : 0;

  const cloudFrac = Math.max(0, Math.min(1, params.cloudCoverPct / 100));
  const clearSkyFactor = Math.max(0.15, 1 - 0.78 * cloudFrac * cloudFrac);
  const windMs = Math.max(0, params.windSpeedKmh) / 3.6;
  const calmFactor = 1 / Math.sqrt(1 + (windMs / 2.6) ** 2);

  let physOffsetC = 0;

  if (params.targetLat >= 40.33 && params.targetElevationM <= 105) {
    const sst = params.marmaraSstC ?? 14.0;
    const airSeaDiff = sst - params.base17116TempC;
    const onshoreBoost =
      params.windDirDeg >= 300 || params.windDirDeg <= 65 ? 0.34 : 0.18;
    physOffsetC = Math.max(-3.2, Math.min(2.8, onshoreBoost * airSeaDiff));
  } else if (params.targetLon >= 29.16 && params.targetLon < 29.38 && params.targetElevationM <= 350) {
    const eastness = Math.min(1, (params.targetLon - 29.14) / 0.08);
    physOffsetC = -1.65 * eastness * nightCoolingFactor * clearSkyFactor * calmFactor;
  } else if (params.targetLon < 28.95 && params.targetLon >= 28.70 && params.targetElevationM <= 220) {
    const westness = Math.min(1, (28.96 - params.targetLon) / 0.10);
    physOffsetC = -1.25 * westness * nightCoolingFactor * clearSkyFactor * calmFactor;
  } else if (params.targetLon >= 29.38 && params.targetElevationM <= 420) {
    physOffsetC =
      -3.4 * nightCoolingFactor * clearSkyFactor * calmFactor +
      0.45 * afternoonFactor * clearSkyFactor;
  }

  if (params.mgmDistrictDay) {
    const expectedElevDeltaC = -6.0 * ((params.targetElevationM - 100) / 1000);
    const residualMinDelta = params.mgmDistrictDay.deltaMinVs17116C - expectedElevDeltaC;
    const residualMaxDelta = params.mgmDistrictDay.deltaMaxVs17116C - expectedElevDeltaC;
    const diurnalMix = 0.5 * (1 - Math.cos(((h - 5) * Math.PI) / 12));
    const mgmHorizDelta = (1 - diurnalMix) * residualMinDelta + diurnalMix * residualMaxDelta;
    const clampedMgmDelta = Math.max(-3.8, Math.min(3.2, mgmHorizDelta));
    return Number((0.55 * physOffsetC + 0.45 * clampedMgmDelta).toFixed(2));
  }

  return Number(physOffsetC.toFixed(2));
}

/**
 * Oke (1987) + Drainage Cold-Pool Physical Unbiaser:
 * Computes the nocturnal radiative cooling & UHI temperature differential when transporting
 * a closed rural frost-basin station (like LTBR Yenişehir) to an urban/foothill target.
 */
export function computeRuralBasinToUrbanOffsetC(
  stationUrbanFrac: number,
  stationColdPool: number,
  targetUrbanFrac: number,
  drivers: AmbientSurfaceDrivers,
  stationWindKt: number | null,
): number {
  const urbanDiff = Math.max(0, targetUrbanFrac - stationUrbanFrac);
  if (urbanDiff < 0.15 && stationColdPool < 0.4) return 0;

  const h = ((drivers.localHour % 24) + 24) % 24;
  let nocturnalPhase = 0;
  if (drivers.isNight) {
    if (h >= 22 || h <= 6) nocturnalPhase = 1.0;
    else if (h >= 18) nocturnalPhase = (h - 17) / 5;
    else if (h <= 9) nocturnalPhase = (10 - h) / 4;
    else nocturnalPhase = 0.65;
  } else if (h >= 7 && h <= 9) {
    nocturnalPhase = 0.40;
  }

  if (nocturnalPhase <= 0) return 0;

  const cloudFrac = Math.max(0, Math.min(1, drivers.cloudCoverPct / 100));
  const radiativeClearSkyFactor = Math.max(0.08, 1 - 0.82 * cloudFrac * cloudFrac);

  const windKt = stationWindKt ?? drivers.ambientWindSpeedKt ?? 4;
  const windMs = windKt * 0.514444;
  const mechanicalTurbulenceDamping = 1 / Math.sqrt(1 + (windMs / 2.1) ** 2);

  const maxDifferentialC = 3.1 * urbanDiff + 2.2 * stationColdPool;
  return maxDifferentialC * nocturnalPhase * radiativeClearSkyFactor * mechanicalTurbulenceDamping;
}

function bearingDeg(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function angularDiffDeg(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Solves exact target surface conditions using 3-Layer Piecewise Hydrostatic + Barrier-Aware
 * Anisotropic Cressman-Barnes Optimal Interpolation.
 */
export function interpolateTopographicSurface(
  rawTarget: TargetPointSpec,
  qcStations: QcStationObservation[],
  verticalProfile: LiveVerticalProfile,
  drivers: AmbientSurfaceDrivers,
): TopographicSurfaceEstimate | null {
  const valid = qcStations.filter((s) => s.qcWeight > 0 && s.tempC !== null);
  if (valid.length === 0) return null;

  const target =
    rawTarget.zone && rawTarget.barrierGroup && rawTarget.urbanFraction !== undefined
      ? (rawTarget as Required<TargetPointSpec>)
      : inferBursaTargetZone(rawTarget.lat, rawTarget.lon, rawTarget.elevationM);

  const hasLocalSameBasinStation = valid.some(
    (s) =>
      s.station.barrierGroup === target.barrierGroup &&
      haversineKm(target.lat, target.lon, s.station.lat, s.station.lon) <= 22,
  );

  const horizScaleKm = hasLocalSameBasinStation ? 14.5 : 42.0;
  const vertScaleM =
    verticalProfile.boundaryLayerState === 'STRONG_INVERSION'
      ? 75
      : verticalProfile.boundaryLayerState === 'SHALLOW_INVERSION'
        ? 125
        : 260;

  interface WeightedNode {
    obs: QcStationObservation;
    distKm: number;
    dElevM: number;
    weight: number;
    precipWeight: number;
    transportedTempC: number;
    transportedDewC: number | null;
    usedBasinTransfer: boolean;
  }

  const nodes: WeightedNode[] = [];

  for (const s of valid) {
    const distKm = haversineKm(target.lat, target.lon, s.station.lat, s.station.lon);
    const dElevM = target.elevationM - s.station.elevationM;

    const wHoriz = Math.exp(-((distKm / horizScaleKm) ** 2));
    const wVert = Math.exp(-((dElevM / vertScaleM) ** 2));
    const wBarrier = BARRIER_COUPLING[target.barrierGroup]?.[s.station.barrierGroup] ?? 0.25;

    let wUpwind = 1.0;
    if (
      drivers.ambientWindDirDeg !== undefined &&
      (drivers.ambientWindSpeedKt ?? 0) >= 6 &&
      distKm >= 3
    ) {
      const stationAzimuth = bearingDeg(target.lat, target.lon, s.station.lat, s.station.lon);
      const diff = angularDiffDeg(stationAzimuth, drivers.ambientWindDirDeg);
      if (diff <= 50) {
        wUpwind = 1.0 + 0.38 * Math.cos((diff * Math.PI) / 100);
      }
    }

    let transportedTempC =
      (s.tempC as number) +
      integratePiecewiseVerticalDeltaC(s.station.elevationM, target.elevationM, verticalProfile);
    let usedBasinTransfer = false;

    if (
      target.barrierGroup === 'BURSA_OVA' &&
      s.station.barrierGroup === 'YENISEHIR_BASIN'
    ) {
      const basinOffset = computeRuralBasinToUrbanOffsetC(
        s.station.urbanFraction,
        s.station.coldPoolSusceptibility,
        target.urbanFraction,
        drivers,
        s.windSpeedKt,
      );
      transportedTempC += basinOffset;
      usedBasinTransfer = Math.abs(basinOffset) > 0.15;
    }

    const dzKm = dElevM / 1000;
    const transportedDewC =
      s.dewPointC !== null
        ? Math.min(transportedTempC, s.dewPointC - 2.0 * dzKm)
        : null;

    const combinedWeight = Math.max(1e-6, s.qcWeight * wHoriz * wVert * wBarrier * wUpwind);
    const wPrecipHoriz = Math.exp(-((distKm / 11.5) ** 2));
    const precipWeight = s.qcWeight * wPrecipHoriz * wBarrier * wUpwind;

    nodes.push({
      obs: s,
      distKm,
      dElevM,
      weight: combinedWeight,
      precipWeight,
      transportedTempC,
      transportedDewC,
      usedBasinTransfer,
    });
  }

  const sumW = nodes.reduce((acc, n) => acc + n.weight, 0);
  if (sumW <= 0) return null;

  let tempFirstPass = 0;
  for (const n of nodes) {
    tempFirstPass += (n.weight / sumW) * n.transportedTempC;
  }

  let fineResidualNum = 0;
  let fineResidualDen = 0;
  for (const n of nodes) {
    if (n.obs.station.tier <= 2 && n.distKm <= 10 && Math.abs(n.dElevM) <= 150) {
      const wFine = n.obs.qcWeight * Math.exp(-((n.distKm / 5.2) ** 2));
      fineResidualNum += wFine * (n.transportedTempC - tempFirstPass);
      fineResidualDen += wFine;
    }
  }
  const tempC =
    fineResidualDen > 0.22
      ? tempFirstPass + 0.72 * (fineResidualNum / fineResidualDen)
      : tempFirstPass;

  const dewNodes = nodes.filter((n) => n.transportedDewC !== null);
  const sumDewW = dewNodes.reduce((acc, n) => acc + n.weight, 0);
  const dewPointC =
    sumDewW > 0
      ? Math.min(
          tempC,
          dewNodes.reduce((acc, n) => acc + (n.weight / sumDewW) * (n.transportedDewC as number), 0),
        )
      : null;
  const relHumidityPct =
    dewPointC !== null ? computeRelHumidityFromDewPoint(tempC, dewPointC) : null;

  const presNodes = nodes.filter((n) => n.obs.pressureMslHpa !== null);
  const sumPresW = presNodes.reduce((acc, n) => acc + n.weight, 0);
  const pressureMslHpa =
    sumPresW > 0
      ? presNodes.reduce(
          (acc, n) => acc + (n.weight / sumPresW) * (n.obs.pressureMslHpa as number),
          0,
        )
      : null;

  const windNodes = nodes.filter(
    (n) => n.obs.windSpeedKt !== null && n.obs.windDirDeg !== null,
  );
  const sumWindW = windNodes.reduce((acc, n) => acc + n.weight, 0);
  let windSpeedKt: number | null = null;
  let windDirDeg: number | null = null;
  if (sumWindW > 0) {
    let uSum = 0;
    let vSum = 0;
    let scalarSpeedSum = 0;
    for (const n of windNodes) {
      const spd = n.obs.windSpeedKt as number;
      const rad = ((n.obs.windDirDeg as number) * Math.PI) / 180;
      const wn = n.weight / sumWindW;
      uSum += wn * (-spd * Math.sin(rad));
      vSum += wn * (-spd * Math.cos(rad));
      scalarSpeedSum += wn * spd;
    }
    windSpeedKt = 0.7 * Math.hypot(uSum, vSum) + 0.3 * scalarSpeedSum;
    windDirDeg = ((Math.atan2(-uSum, -vSum) * 180) / Math.PI + 360) % 360;
  }

  const precipNodes = nodes.filter(
    (n) =>
      n.precipWeight > 0.02 &&
      (n.obs.precip10MinMm !== null || n.obs.precip1HrMm !== null || n.obs.isPrecipitating !== null),
  );
  let precipRateMmHr = 0;
  let wetVoteW = 0;
  let totalPrecipW = 0;
  for (const n of precipNodes) {
    totalPrecipW += n.precipWeight;
    const rate =
      n.obs.precip10MinMm !== null
        ? n.obs.precip10MinMm * 6
        : n.obs.precip1HrMm !== null
          ? n.obs.precip1HrMm
          : n.obs.isPrecipitating
            ? 0.6
            : 0;
    precipRateMmHr += n.precipWeight * rate;
    if (rate >= 0.12 || n.obs.isPrecipitating) {
      wetVoteW += n.precipWeight;
    }
  }
  if (totalPrecipW > 0) {
    precipRateMmHr /= totalPrecipW;
  }
  const wetFraction = totalPrecipW > 0 ? wetVoteW / totalPrecipW : 0;
  const isPrecipitatingNow = wetFraction >= 0.42 && precipRateMmHr >= 0.08;
  if (!isPrecipitatingNow) {
    precipRateMmHr = 0;
  }

  const minSameBasinDistKm = Math.min(
    ...nodes
      .filter((n) => n.obs.station.barrierGroup === target.barrierGroup)
      .map((n) => n.distKm),
    45,
  );
  const weightedVar = nodes.reduce(
    (acc, n) => acc + (n.weight / sumW) * (n.transportedTempC - tempC) ** 2,
    0,
  );
  const uncertaintyC = Math.sqrt(weightedVar + (0.12 + 0.018 * minSameBasinDistKm) ** 2);

  const sortedTraces: StationContributionTrace[] = [...nodes]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6)
    .map((n) => ({
      stationId: n.obs.station.id,
      stationName: n.obs.station.name,
      distanceKm: Number(n.distKm.toFixed(2)),
      deltaElevM: Math.round(n.dElevM),
      rawTempC: Number((n.obs.tempC as number).toFixed(2)),
      transportedTempC: Number(n.transportedTempC.toFixed(2)),
      normalizedWeight: Number((n.weight / sumW).toFixed(4)),
    }));

  const topShareFromBasinTransfer = nodes
    .filter((n) => n.usedBasinTransfer)
    .reduce((acc, n) => acc + n.weight / sumW, 0);

  return {
    tempC: Number(tempC.toFixed(2)),
    dewPointC: dewPointC !== null ? Number(dewPointC.toFixed(2)) : null,
    relHumidityPct: relHumidityPct !== null ? Number(relHumidityPct.toFixed(1)) : null,
    pressureMslHpa: pressureMslHpa !== null ? Number(pressureMslHpa.toFixed(1)) : null,
    windSpeedKt: windSpeedKt !== null ? Number(windSpeedKt.toFixed(1)) : null,
    windDirDeg: windDirDeg !== null ? Math.round(windDirDeg) : null,
    precipRateMmHr: Number(precipRateMmHr.toFixed(2)),
    isPrecipitatingNow,
    uncertaintyC: Number(uncertaintyC.toFixed(2)),
    usedFallbackBasinTransfer: topShareFromBasinTransfer >= 0.35,
    verticalState: verticalProfile.boundaryLayerState,
    contributions: sortedTraces,
  };
}

export interface HourlySynopticFeatures {
  windDir10mDeg: number;
  windSpeed10mKt: number;
  windDir850Deg?: number;
  windSpeed850Kt?: number;
  pressureMslHpa: number;
  cloudCoverPct: number;
  capeJkg?: number;
  localHour: number;
  month: number; // 1..12
}

export function classifyBursaSynopticRegime(f: HourlySynopticFeatures): BursaSynopticRegime {
  const dirUpper = f.windDir850Deg ?? f.windDir10mDeg;
  const spdUpper = f.windSpeed850Kt ?? f.windSpeed10mKt * 1.45;

  if (
    (dirUpper >= 185 && dirUpper <= 255 && spdUpper >= 16) ||
    (f.windDir10mDeg >= 180 && f.windDir10mDeg <= 250 && f.windSpeed10mKt >= 11)
  ) {
    return 'LODOS_FOEHN';
  }

  if ((f.capeJkg ?? 0) >= 450) {
    return 'CONVECTIVE_UNSTABLE';
  }

  const isWarmSeason = f.month >= 5 && f.month <= 9;
  const isAfternoon = f.localHour >= 11 && f.localHour <= 19;
  const isNortherly = f.windDir10mDeg >= 325 || f.windDir10mDeg <= 45;
  if (
    isWarmSeason &&
    isAfternoon &&
    isNortherly &&
    f.windSpeed10mKt >= 5 &&
    f.windSpeed10mKt <= 16 &&
    f.pressureMslHpa >= 1010 &&
    f.cloudCoverPct <= 45
  ) {
    return 'MARMARA_SEA_BREEZE';
  }

  const isPoyrazOrKarayel = dirUpper >= 295 || dirUpper <= 70;
  if (isPoyrazOrKarayel && (spdUpper >= 13 || f.windSpeed10mKt >= 8)) {
    return 'POYRAZ_KARAYEL_ADV';
  }

  if (f.pressureMslHpa >= 1018 && f.windSpeed10mKt <= 6.5 && f.cloudCoverPct <= 50) {
    return 'OVA_INVERSION_CALM';
  }

  return 'SYNOPTIC_TRANSITION';
}
