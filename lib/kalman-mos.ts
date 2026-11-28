import { isWithinBursaDomain } from "./bursa-mesh";
import { parseMetarWxTokens, type MetarNetworkStation } from "./metar-verify";
import {
  computeInverseRmseWeights,
  CORE_MODEL_KEYS,
  CORE_MODEL_META,
  type DynamicHybridWeights,
  MEDIUM_RANGE_PRIOR_WEIGHTS,
  WMO_PRIOR_WEIGHTS
} from "./model-registry";
import {
  computeRegimeGateFactor,
  evaluateRegimeGateComponents,
  type TargetSynopticContext,
  type TrainingRegimeSummary,
  windDirSpeedToUVKmh
} from "./provinces/engine/regime-bimodal-solver";
import type { LedgerStationPoint } from "./state-ledger";
import { computeRuralBasinToUrbanOffsetC } from "./topographic-cressman";
import { createFastZonedTimeResolver } from "./weather-client";
import type {
  CoreModelKey,
  HybridModelSnapshot,
  KalmanCalibrationSummary,
  LiveVerificationMode,
  LiveVerificationReport,
  ModelVerificationRow
} from "./weather-types";

export {
  computeRegimeGateFactor,
  evaluateRegimeGateComponents,
  type TargetSynopticContext,
  type TrainingRegimeSummary
};

export type ProvinceScopedLedgerStationPoint = LedgerStationPoint & {
  stationProvinceCode?: string;
};

export type CressmanHourlyObs = {
  utcKey: string;
  obsTimeMs: number;
  tempC: number | null;
  dewPointC: number | null;
  pressureHpa: number | null;
  windSpeedKmh: number | null;
  hasPrecip: boolean | null;
  isThunderstorm: boolean;
  stationCount: number;
};

export type ModelBiasProfile = {
  tempPersistentBiasC: number;
  tempTransientBiasC: number;
  tempKalmanBiasC: number;
  tempDiurnalBiasC: [number, number, number, number];
  dewKalmanBiasC: number;
  pressKalmanBiasHpa: number;
  windKalmanBiasKmh: number;
  tempRmseC: number | null;
  tempUbRmseC: number | null;
  tempMeanBiasC: number | null;
  tempMaeC: number | null;
  dewRmseC: number | null;
  pressRmseHpa: number | null;
  windRmseKmh: number | null;
  precipBrier: number | null;
  matchedHours: number;
};

export type NowcastSensorAnchor = {
  active: boolean;
  tempObsCityC: number | null;
  dewObsCityC: number | null;
  pressObsHpa: number | null;
  windObsKmh: number | null;
  tempKalmanGain: number; // 0..0.92
  pressKalmanGain: number; // 0..0.88
  windKalmanGain: number; // 0..0.62
  wxFlags: ReturnType<typeof parseMetarWxTokens>;
  primaryStationAgeMin: number;
  primaryStationDistKm: number;
};

export type KalmanMosModel = {
  active: boolean;
  shortRangeWeights: DynamicHybridWeights;
  mediumRangeWeights: DynamicHybridWeights;
  biases: Record<CoreModelKey, ModelBiasProfile>;
  anchor: NowcastSensorAnchor;
  report: LiveVerificationReport;
  summary: KalmanCalibrationSummary;
  trainingRegimeSummary?: TrainingRegimeSummary;
  provinceCode?: string;
  kalmanTempBiasCapC?: number;
  coldBasinAirportIcaos?: readonly string[];
};

const DEFAULT_COLD_BASIN_AIRPORT_ICAOS = ["LTBR"] as const;

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function medianOf(arr: number[]): number {
  if (arr.length === 0) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) * 0.5 : s[m];
}

function haversineKmLocal(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
}

function filterLedgerByProvince(
  ledgerStationHistory: ProvinceScopedLedgerStationPoint[] | undefined,
  provinceCode: string | undefined
): ProvinceScopedLedgerStationPoint[] | undefined {
  if (!ledgerStationHistory || !provinceCode) return ledgerStationHistory;
  const targetCode = provinceCode.trim();
  if (!targetCode) return ledgerStationHistory;
  return ledgerStationHistory.filter((pt) => {
    if (
      typeof pt.stationProvinceCode === "string" &&
      pt.stationProvinceCode.trim().length > 0
    ) {
      return pt.stationProvinceCode.trim() === targetCode;
    }
    return true;
  });
}

/**
 * Huber/MAD tabanlı aykırı hata filtresi: sensör sıçramaları Kalman bias'ını bozamaz.
 */
function filterRobustErrors(
  samples: Array<{ err: number; ageHours: number; bin: number }>,
  hardLimit: number
): Array<{ err: number; ageHours: number; bin: number }> {
  if (samples.length < 4) {
    return samples.filter((s) => Math.abs(s.err) <= hardLimit);
  }
  const vals = samples.map((s) => s.err);
  const med = medianOf(vals);
  const mad = medianOf(vals.map((v) => Math.abs(v - med)));
  const sigma = Math.max(0.45, 1.4826 * mad);
  const tol = Math.min(hardLimit, Math.max(2.2, 3.2 * sigma));
  return samples.filter((s) => Math.abs(s.err - med) <= tol);
}

/**
 * 48-72 saatlik çoklu ICAO METAR ağı + Kalıcı MGM İstasyon Defterinden (state-ledger)
 * Cressman / IDW + canlı atmosferik lapse rate düzeltmeli saatlik şehir gözlem serisi üretir.
 */
export function buildCressmanMetarTimeline(
  network: MetarNetworkStation[],
  cityElevationM: number,
  envLapseRateCPerM: number,
  cityLat?: number,
  cityLon?: number,
  ledgerStationHistory?: ProvinceScopedLedgerStationPoint[],
  timezone?: string,
  utcOffsetSeconds = 10800,
  options?: {
    provinceCode?: string;
    coldBasinAirportIcaos?: readonly string[];
  }
): Map<string, CressmanHourlyObs> {
  const isBursaOvaTarget =
    cityLat !== undefined &&
    cityLon !== undefined &&
    isWithinBursaDomain(cityLat, cityLon) &&
    cityElevationM <= 450 &&
    cityLon < 29.35;
  const safeLapse = clamp(envLapseRateCPerM, -0.0098, 0.004);
  const tzResolver = createFastZonedTimeResolver(timezone, utcOffsetSeconds);

  const scopedLedger = filterLedgerByProvince(
    ledgerStationHistory,
    options?.provinceCode
  );
  const hasExplicitColdBasinIcaos = options?.coldBasinAirportIcaos !== undefined;
  const coldBasinIcaoSet = new Set(
    (options?.coldBasinAirportIcaos ?? DEFAULT_COLD_BASIN_AIRPORT_ICAOS)
      .map((id) => id.trim().toUpperCase())
      .filter(Boolean)
  );

  type StationSample = {
    weight: number;
    distKm: number;
    obsTimeMs: number;
    tempCity: number | null;
    dewCity: number | null;
    press: number | null;
    windKmh: number | null;
    wxFlags: ReturnType<typeof parseMetarWxTokens>;
  };

  const bucket = new Map<string, Map<string, StationSample>>();
  const hasLocalLedger = Boolean(scopedLedger && scopedLedger.length >= 6);

  if (scopedLedger && cityLat !== undefined && cityLon !== undefined) {
    for (const pt of scopedLedger) {
      const distKm = Math.max(0.5, haversineKmLocal(cityLat, cityLon, pt.lat, pt.lon));
      if (distKm > 48) continue;
      const elevDiffToCity = cityElevationM - pt.elevationM;
      if (Math.abs(elevDiffToCity) > 450) continue;

      const tempElevDelta = safeLapse * elevDiffToCity;
      const dewElevDelta =
        Math.max(-0.0028, Math.min(0.0015, safeLapse * 0.35)) * elevDiffToCity;
      const elevPenalty = 1 + Math.abs(elevDiffToCity) / 220;
      const isEastBasin = isBursaOvaTarget && pt.lon >= 29.38;
      const barrierFactor = isEastBasin ? 0.18 : 3.2;
      const stationWeight = barrierFactor / ((distKm * distKm + 8 * 8) * elevPenalty);

      const perStation = bucket.get(pt.utcHourKey) ?? new Map<string, StationSample>();
      perStation.set(pt.stationId, {
        weight: stationWeight,
        distKm,
        obsTimeMs: pt.observedAtMs,
        tempCity: pt.tempC + tempElevDelta,
        dewCity: pt.dewPointC !== null ? pt.dewPointC + dewElevDelta : null,
        press: pt.pressureMslHpa,
        windKmh: pt.windSpeedKmh,
        wxFlags: parseMetarWxTokens(pt.hasPrecip ? "RA" : "")
      });
      bucket.set(pt.utcHourKey, perStation);
    }
  }

  for (const net of network) {
    const elevDiffToCity = cityElevationM - net.station.elevationM;
    const tempElevDelta = safeLapse * elevDiffToCity;
    const dewElevDelta = Math.max(-0.0028, Math.min(0.0015, safeLapse * 0.35)) * elevDiffToCity;

    const distKm = Math.max(1, net.station.distanceKm);
    const elevPenalty = 1 + Math.abs(elevDiffToCity) / 280;
    const icaoUpper = net.station.icaoId.trim().toUpperCase();
    const isColdBasinTrap =
      coldBasinIcaoSet.has(icaoUpper) &&
      (icaoUpper === "LTBR" && !hasExplicitColdBasinIcaos
        ? isBursaOvaTarget
        : net.station.distanceKm >= 6 || hasLocalLedger || network.length > 1);
    const barrierFactor = isColdBasinTrap
      ? hasLocalLedger
        ? 0.05
        : network.length > 1
          ? 0.22
          : 1.0
      : 1.0;
    const stationWeight = barrierFactor / ((distKm * distKm + 14 * 14) * elevPenalty);

    for (const ob of net.history) {
      const obsMs = ob.obsTime * 1000;
      const roundedMs = Math.round(obsMs / 3600000) * 3600000;
      const utcKey = new Date(roundedMs).toISOString().slice(0, 16);

      const perStation = bucket.get(utcKey) ?? new Map<string, StationSample>();
      const existing = perStation.get(net.station.icaoId);
      if (
        existing &&
        Math.abs(existing.obsTimeMs - roundedMs) <= Math.abs(obsMs - roundedMs)
      ) {
        continue;
      }

      const localH = tzResolver.epochMsToLocalParts(roundedMs).hour;
      const isNightOb = localH >= 18 || localH <= 8;
      const coldBasinUnbias =
        isColdBasinTrap && (isBursaOvaTarget || net.station.distanceKm >= 6)
          ? computeRuralBasinToUrbanOffsetC(
              0.04,
              0.96,
              0.85,
              {
                isNight: isNightOb,
                localHour: localH,
                cloudCoverPct: ob.wxString?.includes("OVC") ? 90 : 25,
                ambientWindSpeedKt: typeof ob.wspd === "number" ? ob.wspd : 4
              },
              typeof ob.wspd === "number" ? ob.wspd : null
            )
          : 0;
      const tempCity =
        typeof ob.temp === "number" && Number.isFinite(ob.temp)
          ? ob.temp + tempElevDelta + coldBasinUnbias
          : null;
      const dewCity =
        typeof ob.dewp === "number" && Number.isFinite(ob.dewp)
          ? ob.dewp + dewElevDelta
          : null;
      const press =
        typeof ob.slp === "number" && Number.isFinite(ob.slp)
          ? ob.slp
          : typeof ob.altim === "number" && Number.isFinite(latestOrNull(ob.altim))
            ? ob.altim!
            : null;
      const windKmh =
        typeof ob.wspd === "number" && Number.isFinite(ob.wspd)
          ? ob.wspd * 1.852
          : null;

      perStation.set(net.station.icaoId, {
        weight: stationWeight,
        distKm,
        obsTimeMs: obsMs,
        tempCity,
        dewCity,
        press,
        windKmh,
        wxFlags: parseMetarWxTokens(ob.wxString)
      });
      bucket.set(utcKey, perStation);
    }
  }

  const out = new Map<string, CressmanHourlyObs>();
  for (const [utcKey, stMap] of bucket.entries()) {
    let tNum = 0,
      tDen = 0;
    let tdNum = 0,
      tdDen = 0;
    let pNum = 0,
      pDen = 0;
    let wNum = 0,
      wDen = 0;
    let nearStationCount = 0;
    let nearRain = false;
    let nearStorm = false;
    let latestMs = 0;

    for (const s of stMap.values()) {
      if (s.obsTimeMs > latestMs) latestMs = s.obsTimeMs;
      if (s.tempCity !== null) {
        tNum += s.tempCity * s.weight;
        tDen += s.weight;
      }
      if (s.dewCity !== null) {
        tdNum += s.dewCity * s.weight;
        tdDen += s.weight;
      }
      if (s.press !== null) {
        const pw = 1 / (s.distKm * s.distKm + 35 * 35);
        pNum += s.press * pw;
        pDen += pw;
      }
      if (s.windKmh !== null) {
        wNum += s.windKmh * s.weight;
        wDen += s.weight;
      }
      if (s.distKm <= 58) {
        nearStationCount++;
        if (s.wxFlags.hasPrecip) nearRain = true;
        if (s.wxFlags.isThunderstorm) nearStorm = true;
      }
    }

    out.set(utcKey, {
      utcKey,
      obsTimeMs: latestMs,
      tempC: tDen > 0 ? tNum / tDen : null,
      dewPointC: tdDen > 0 ? tdNum / tdDen : null,
      pressureHpa: pDen > 0 ? pNum / pDen : null,
      windSpeedKmh: wDen > 0 ? wNum / wDen : null,
      hasPrecip: nearStationCount > 0 ? nearRain : null,
      isThunderstorm: nearStorm,
      stationCount: stMap.size
    });
  }

  return out;
}

function latestOrNull(v: number | null | undefined): number {
  return typeof v === "number" ? v : NaN;
}

function emptyBiasProfile(): ModelBiasProfile {
  return {
    tempPersistentBiasC: 0,
    tempTransientBiasC: 0,
    tempKalmanBiasC: 0,
    tempDiurnalBiasC: [0, 0, 0, 0],
    dewKalmanBiasC: 0,
    pressKalmanBiasHpa: 0,
    windKalmanBiasKmh: 0,
    tempRmseC: null,
    tempUbRmseC: null,
    tempMeanBiasC: null,
    tempMaeC: null,
    dewRmseC: null,
    pressRmseHpa: null,
    windRmseKmh: null,
    precipBrier: null,
    matchedHours: 0
  };
}

function meanFiniteAtIndex(
  modelHourlyUtc: Record<string, Array<number | null> | undefined>,
  keys: readonly string[],
  idx: number
): number | null {
  let sum = 0;
  let count = 0;
  for (const k of keys) {
    const v = modelHourlyUtc[k]?.[idx];
    if (typeof v === "number" && Number.isFinite(v)) {
      sum += v;
      count++;
    }
  }
  return count > 0 ? sum / count : null;
}

function extractWindUVAtIndex(
  modelHourlyUtc: Record<string, Array<number | null> | undefined>,
  spdPrefix: string,
  dirPrefix: string,
  spdKeys: readonly string[],
  dirKeys: readonly string[],
  idx: number
): { u: number; v: number } | null {
  if (spdKeys.length === 0 || dirKeys.length === 0) return null;

  let pairSumU = 0;
  let pairSumV = 0;
  let pairCount = 0;
  for (const sk of spdKeys) {
    const spd = modelHourlyUtc[sk]?.[idx];
    if (typeof spd !== "number" || !Number.isFinite(spd)) continue;
    const suffix = sk === spdPrefix ? "" : sk.slice(spdPrefix.length);
    const dk = suffix ? `${dirPrefix}${suffix}` : dirPrefix;
    const dir = modelHourlyUtc[dk]?.[idx];
    if (typeof dir === "number" && Number.isFinite(dir)) {
      const uv = windDirSpeedToUVKmh(dir, spd);
      pairSumU += uv.u;
      pairSumV += uv.v;
      pairCount++;
    }
  }
  if (pairCount > 0) {
    return { u: pairSumU / pairCount, v: pairSumV / pairCount };
  }

  const meanSpd = meanFiniteAtIndex(modelHourlyUtc, spdKeys, idx);
  if (meanSpd === null) return null;
  let sinSum = 0;
  let cosSum = 0;
  let dirCount = 0;
  for (const dk of dirKeys) {
    const d = modelHourlyUtc[dk]?.[idx];
    if (typeof d === "number" && Number.isFinite(d)) {
      const rad = (d * Math.PI) / 180;
      sinSum += Math.sin(rad);
      cosSum += Math.cos(rad);
      dirCount++;
    }
  }
  if (dirCount === 0) return null;
  const norm = Math.hypot(sinSum, cosSum);
  if (norm <= 1e-6) return { u: 0, v: 0 };
  const meanDirDeg = ((Math.atan2(sinSum / norm, cosSum / norm) * 180) / Math.PI + 360) % 360;
  return windDirSpeedToUVKmh(meanDirDeg, meanSpd);
}

function summarizeTrainingRegime({
  modelHourlyUtc,
  utcTimeIndex,
  timeline,
  network,
  scopedLedger,
  nowUtcMs
}: {
  modelHourlyUtc: Record<string, Array<number | null> | undefined> | null;
  utcTimeIndex: Map<string, number>;
  timeline: Map<string, CressmanHourlyObs>;
  network: MetarNetworkStation[];
  scopedLedger: ProvinceScopedLedgerStationPoint[] | undefined;
  nowUtcMs: number;
}): TrainingRegimeSummary {
  const obsWindByUtc = new Map<string, { u: number; v: number }>();
  if (scopedLedger) {
    for (const pt of scopedLedger) {
      if (
        typeof pt.windSpeedKmh === "number" &&
        Number.isFinite(pt.windSpeedKmh) &&
        typeof pt.windDirDeg === "number" &&
        Number.isFinite(pt.windDirDeg)
      ) {
        obsWindByUtc.set(pt.utcHourKey, windDirSpeedToUVKmh(pt.windDirDeg, pt.windSpeedKmh));
      }
    }
  }
  for (const net of network) {
    for (const ob of net.history) {
      if (
        typeof ob.wspd === "number" &&
        Number.isFinite(ob.wspd) &&
        typeof ob.wdir === "number" &&
        Number.isFinite(ob.wdir)
      ) {
        const roundedMs = Math.round((ob.obsTime * 1000) / 3600000) * 3600000;
        const uKey = new Date(roundedMs).toISOString().slice(0, 16);
        if (!obsWindByUtc.has(uKey)) {
          obsWindByUtc.set(uKey, windDirSpeedToUVKmh(ob.wdir, ob.wspd * 1.852));
        }
      }
    }
  }

  const allKeys = modelHourlyUtc ? Object.keys(modelHourlyUtc) : [];
  const t2mKeys = allKeys.filter(
    (k) => k === "temperature_2m" || k.startsWith("temperature_2m_")
  );
  const t850Keys = allKeys.filter(
    (k) => k === "temperature_850hPa" || k.startsWith("temperature_850hPa_")
  );
  const w850SpdKeys = allKeys.filter(
    (k) => k === "wind_speed_850hPa" || k.startsWith("wind_speed_850hPa_")
  );
  const w850DirKeys = allKeys.filter(
    (k) => k === "wind_direction_850hPa" || k.startsWith("wind_direction_850hPa_")
  );
  const w10mSpdKeys = allKeys.filter(
    (k) => k === "wind_speed_10m" || k.startsWith("wind_speed_10m_")
  );
  const w10mDirKeys = allKeys.filter(
    (k) => k === "wind_direction_10m" || k.startsWith("wind_direction_10m_")
  );

  let t2mSum = 0;
  let t2mW = 0;
  let t850Sum = 0;
  let t850W = 0;
  let uSum = 0;
  let vSum = 0;
  let uvW = 0;

  const ewmaLambda = 0.94; // Synoptic 48-72h window EWMA

  const accumulateSlot = (
    utcKey: string,
    idx: number | undefined,
    ageHours: number,
    obsTempC: number | null
  ) => {
    const w = Math.pow(ewmaLambda, Math.max(0, ageHours));
    const modelT2m =
      modelHourlyUtc && idx !== undefined
        ? meanFiniteAtIndex(modelHourlyUtc, t2mKeys, idx)
        : null;
    const effT2m = obsTempC ?? modelT2m;
    if (effT2m !== null && Number.isFinite(effT2m)) {
      t2mSum += w * effT2m;
      t2mW += w;
    }

    if (modelHourlyUtc && idx !== undefined) {
      const mT850 = meanFiniteAtIndex(modelHourlyUtc, t850Keys, idx);
      if (mT850 !== null && Number.isFinite(mT850)) {
        t850Sum += w * mT850;
        t850W += w;
      }

      const uv850 =
        extractWindUVAtIndex(
          modelHourlyUtc,
          "wind_speed_850hPa",
          "wind_direction_850hPa",
          w850SpdKeys,
          w850DirKeys,
          idx
        ) ??
        extractWindUVAtIndex(
          modelHourlyUtc,
          "wind_speed_10m",
          "wind_direction_10m",
          w10mSpdKeys,
          w10mDirKeys,
          idx
        ) ??
        obsWindByUtc.get(utcKey) ??
        null;

      if (uv850 !== null) {
        uSum += w * uv850.u;
        vSum += w * uv850.v;
        uvW += w;
      }
    } else {
      const obsUv = obsWindByUtc.get(utcKey);
      if (obsUv) {
        uSum += w * obsUv.u;
        vSum += w * obsUv.v;
        uvW += w;
      }
    }
  };

  let usedTimelineSlots = 0;
  for (const [utcKey, obs] of timeline.entries()) {
    const ageHours = (nowUtcMs - obs.obsTimeMs) / 3600000;
    if (ageHours < -0.5 || ageHours > 72) continue;
    usedTimelineSlots++;
    accumulateSlot(utcKey, utcTimeIndex.get(utcKey), ageHours, obs.tempC);
  }

  if (usedTimelineSlots === 0 && modelHourlyUtc && utcTimeIndex.size > 0) {
    for (const [utcKey, idx] of utcTimeIndex.entries()) {
      const slotMs = Date.parse(`${utcKey}:00Z`);
      if (!Number.isFinite(slotMs)) continue;
      const ageHours = (nowUtcMs - slotMs) / 3600000;
      if (ageHours < -0.5 || ageHours > 72) continue;
      accumulateSlot(utcKey, idx, ageHours, null);
    }
  }

  return {
    meanTemp2mC: t2mW > 0 ? Number((t2mSum / t2mW).toFixed(3)) : null,
    meanTemp850C: t850W > 0 ? Number((t850Sum / t850W).toFixed(3)) : null,
    meanWind850U: uvW > 0 ? Number((uSum / uvW).toFixed(3)) : null,
    meanWind850V: uvW > 0 ? Number((vSum / uvW).toFixed(3)) : null
  };
}

/**
 * ATMOS v5.0 / ARC-04 — 8-Model Rejim-Korumalı Kalman + Diurnal-Phase MOS Eğitim Motoru:
 * - Son 48-72 saatlik il-sınır kilitli MGM İstasyon Defteri + çoklu-istasyon METAR ağına karşı
 *   8 modelin bias & UBRMSE'sini çıkarır.
 * - Bölgesel havalimanı çanak tuzağı koruması (`coldBasinAirportIcaos`) ve bölgesel bias tavanı
 *   (`kalmanTempBiasCapC`, örn. Doğu Anadolu kar çanaklarında 10.0°C) uygular.
 * - Sinoptik eğitim özeti S_0 (`trainingRegimeSummary`) kaydederek cephesel hava kütlesi
 *   değişimlerinde eski rejim yanlılığının taşınmasını engeller.
 */
export function trainKalmanMos({
  network,
  cityElevationM,
  cityLat,
  cityLon,
  envLapseRateCPerM,
  modelHourlyUtc,
  utcTimeIndex,
  nowUtcMs,
  utcOffsetSeconds,
  timezone,
  ensembleMembers = 0,
  ledgerStationHistory,
  provinceCode,
  kalmanTempBiasCapC = 4.5,
  coldBasinAirportIcaos
}: {
  network: MetarNetworkStation[];
  cityElevationM: number;
  cityLat?: number;
  cityLon?: number;
  envLapseRateCPerM: number;
  modelHourlyUtc: Record<string, Array<number | null> | undefined> | null;
  utcTimeIndex: Map<string, number>;
  nowUtcMs: number;
  utcOffsetSeconds: number;
  timezone?: string;
  ensembleMembers?: number;
  ledgerStationHistory?: ProvinceScopedLedgerStationPoint[];
  provinceCode?: string;
  kalmanTempBiasCapC?: number;
  coldBasinAirportIcaos?: readonly string[];
}): KalmanMosModel {
  const safeLapse = clamp(envLapseRateCPerM, -0.0098, 0.004);
  const tzResolver = createFastZonedTimeResolver(timezone, utcOffsetSeconds);

  const normalizedProvinceCode =
    typeof provinceCode === "string" && provinceCode.trim().length > 0
      ? provinceCode.trim()
      : undefined;

  // Strict province border lock: zero cross-province station leakage!
  const scopedLedgerHistory = filterLedgerByProvince(
    ledgerStationHistory,
    normalizedProvinceCode
  );

  const effectiveColdBasinIcaos =
    coldBasinAirportIcaos ?? DEFAULT_COLD_BASIN_AIRPORT_ICAOS;
  const hasExplicitColdBasinIcaos = coldBasinAirportIcaos !== undefined;
  const coldBasinIcaoSet = new Set(
    effectiveColdBasinIcaos.map((id) => id.trim().toUpperCase()).filter(Boolean)
  );

  const effectiveTempBiasCapC =
    typeof kalmanTempBiasCapC === "number" &&
    Number.isFinite(kalmanTempBiasCapC) &&
    kalmanTempBiasCapC > 0
      ? clamp(kalmanTempBiasCapC, 1.0, 15.0)
      : 4.5;
  const isDeepContinentalCap = effectiveTempBiasCapC > 4.5;
  const capScale = effectiveTempBiasCapC / 4.5;
  const robustErrorHardLimitC = isDeepContinentalCap ? effectiveTempBiasCapC + 2.5 : 6.5;
  const transientBiasCapC = isDeepContinentalCap
    ? Number((2.8 * capScale).toFixed(4))
    : 2.8;
  const diurnalBiasCapC = isDeepContinentalCap
    ? Number((2.5 * capScale).toFixed(4))
    : 2.5;
  const persistentShrinkN0 = isDeepContinentalCap ? 2.5 : 5.0;
  const tempEwmaLambda = isDeepContinentalCap ? 0.93 : 0.86;
  const tempEwmaShrinkN0 = isDeepContinentalCap ? 2.0 : 3.0;

  const timeline = buildCressmanMetarTimeline(
    network,
    cityElevationM,
    safeLapse,
    cityLat,
    cityLon,
    scopedLedgerHistory,
    timezone,
    utcOffsetSeconds,
    {
      provinceCode: normalizedProvinceCode,
      coldBasinAirportIcaos
    }
  );

  const isBursaWmo100mGrid =
    cityLat !== undefined &&
    cityLon !== undefined &&
    isWithinBursaDomain(cityLat, cityLon) &&
    Math.hypot((cityLat - 40.2308) * 111.32, (cityLon - 29.0133) * 85.0) <= 34 &&
    cityElevationM <= 750;
  const modelGridElevAdjustC = isBursaWmo100mGrid ? safeLapse * (100 - cityElevationM) : 0;

  const biases = {} as Record<CoreModelKey, ModelBiasProfile>;
  for (const k of CORE_MODEL_KEYS) biases[k] = emptyBiasProfile();

  type Sample = { err: number; ageHours: number; bin: number };
  const tSamples = {} as Record<CoreModelKey, Sample[]>;
  const tdSamples = {} as Record<CoreModelKey, Sample[]>;
  const pSamples = {} as Record<CoreModelKey, Sample[]>;
  const wSamples = {} as Record<CoreModelKey, Sample[]>;
  const precipBrierAcc = {} as Record<CoreModelKey, { sq: number; n: number }>;

  for (const k of CORE_MODEL_KEYS) {
    tSamples[k] = [];
    tdSamples[k] = [];
    pSamples[k] = [];
    wSamples[k] = [];
    precipBrierAcc[k] = { sq: 0, n: 0 };
  }

  let matchedHours = 0;
  let observedRainHours = 0;

  if (modelHourlyUtc && timeline.size > 0) {
    for (const [utcKey, obs] of timeline.entries()) {
      const idx = utcTimeIndex.get(utcKey);
      if (idx === undefined) continue;
      const ageHours = (nowUtcMs - obs.obsTimeMs) / 3600000;
      if (ageHours < -0.5 || ageHours > 72) continue;
      matchedHours++;
      if (obs.hasPrecip) observedRainHours++;

      const localHour = tzResolver.epochMsToLocalParts(obs.obsTimeMs).hour;
      const bin = Math.min(3, Math.floor(localHour / 6));

      const obsTempForModel =
        obs.tempC !== null ? obs.tempC + modelGridElevAdjustC : null;

      for (const mKey of CORE_MODEL_KEYS) {
        const apiId = CORE_MODEL_META[mKey].apiModel;
        const mTemp = modelHourlyUtc[`temperature_2m_${apiId}`]?.[idx];
        const mDew = modelHourlyUtc[`dew_point_2m_${apiId}`]?.[idx];
        const mPress = modelHourlyUtc[`pressure_msl_${apiId}`]?.[idx];
        const mWind = modelHourlyUtc[`wind_speed_10m_${apiId}`]?.[idx];
        const mPrecip = modelHourlyUtc[`precipitation_${apiId}`]?.[idx];

        if (obsTempForModel !== null && typeof mTemp === "number" && Number.isFinite(mTemp)) {
          tSamples[mKey].push({
            err: mTemp - obsTempForModel,
            ageHours: Math.max(0, ageHours),
            bin
          });
        }
        if (obs.dewPointC !== null && typeof mDew === "number" && Number.isFinite(mDew)) {
          tdSamples[mKey].push({
            err: mDew - obs.dewPointC,
            ageHours: Math.max(0, ageHours),
            bin
          });
        }
        if (obs.pressureHpa !== null && typeof mPress === "number" && Number.isFinite(mPress)) {
          pSamples[mKey].push({
            err: mPress - obs.pressureHpa,
            ageHours: Math.max(0, ageHours),
            bin
          });
        }
        if (obs.windSpeedKmh !== null && typeof mWind === "number" && Number.isFinite(mWind)) {
          wSamples[mKey].push({
            err: mWind - obs.windSpeedKmh,
            ageHours: Math.max(0, ageHours),
            bin
          });
        }
        if (
          obs.hasPrecip !== null &&
          typeof mPrecip === "number" &&
          Number.isFinite(mPrecip)
        ) {
          const pModel = 1 - Math.exp(-Math.max(0, mPrecip) / 0.35);
          const yObs = obs.hasPrecip ? 1 : 0;
          const diff = pModel - yObs;
          precipBrierAcc[mKey].sq += diff * diff;
          precipBrierAcc[mKey].n++;
        }
      }
    }
  }

  const trainingRegimeSummary = summarizeTrainingRegime({
    modelHourlyUtc,
    utcTimeIndex,
    timeline,
    network,
    scopedLedger: scopedLedgerHistory,
    nowUtcMs
  });

  const uniqueLedgerStations = Array.from(
    new Set((scopedLedgerHistory ?? []).map((p) => p.stationId))
  );
  const hasMgmMeshCalibration = uniqueLedgerStations.length > 0 && matchedHours >= 6;
  const hasLiveCalibration =
    (network.length > 0 || uniqueLedgerStations.length > 0) && matchedHours >= 6;

  const tempUbRmses: Partial<Record<CoreModelKey, number | null>> = {};
  const tempRmses: Partial<Record<CoreModelKey, number | null>> = {};
  const pressUbRmses: Partial<Record<CoreModelKey, number | null>> = {};
  const pressRmses: Partial<Record<CoreModelKey, number | null>> = {};
  const windRmses: Partial<Record<CoreModelKey, number | null>> = {};
  const precipBriers: Partial<Record<CoreModelKey, number | null>> = {};

  const computeEwmaBias = (
    samples: Sample[],
    lambdaPerHour: number,
    shrinkN0: number,
    cap: number
  ): number => {
    if (samples.length < 4) return 0;
    let wSum = 0;
    let eSum = 0;
    let wSqSum = 0;
    for (const s of samples) {
      const w = Math.pow(lambdaPerHour, s.ageHours);
      wSum += w;
      wSqSum += w * w;
      eSum += w * s.err;
    }
    if (wSum <= 0) return 0;
    const rawMean = eSum / wSum;
    const nEff = (wSum * wSum) / Math.max(1e-6, wSqSum);
    const shrunk = rawMean * (nEff / (nEff + shrinkN0));
    return clamp(shrunk, -cap, cap);
  };

  let biasSumForAvg = 0;
  let biasCountForAvg = 0;

  for (const k of CORE_MODEL_KEYS) {
    const ts = filterRobustErrors(tSamples[k], robustErrorHardLimitC);
    const tds = filterRobustErrors(tdSamples[k], Math.max(7.0, robustErrorHardLimitC));
    const ps = filterRobustErrors(pSamples[k], 7.5);
    const ws = filterRobustErrors(wSamples[k], 32.0);

    const prof = biases[k];
    prof.matchedHours = ts.length;

    if (ts.length >= 6) {
      const n = ts.length;
      const meanErr = ts.reduce((a, s) => a + s.err, 0) / n;
      const mse = ts.reduce((a, s) => a + s.err * s.err, 0) / n;
      const mae = ts.reduce((a, s) => a + Math.abs(s.err), 0) / n;
      const ubMse = Math.max(0, mse - meanErr * meanErr);

      prof.tempRmseC = Number(Math.sqrt(mse).toFixed(2));
      prof.tempUbRmseC = Number(Math.sqrt(ubMse).toFixed(2));
      prof.tempMeanBiasC = Number(meanErr.toFixed(2));
      prof.tempMaeC = Number(mae.toFixed(2));

      const persistentBias = clamp(
        meanErr * (n / (n + persistentShrinkN0)),
        -effectiveTempBiasCapC,
        effectiveTempBiasCapC
      );
      const ewmaTotal = computeEwmaBias(
        ts,
        tempEwmaLambda,
        tempEwmaShrinkN0,
        effectiveTempBiasCapC
      );
      const transientBias = clamp(
        ewmaTotal - persistentBias,
        -transientBiasCapC,
        transientBiasCapC
      );

      prof.tempPersistentBiasC = persistentBias;
      prof.tempTransientBiasC = transientBias;
      prof.tempKalmanBiasC = clamp(
        persistentBias + transientBias,
        -effectiveTempBiasCapC,
        effectiveTempBiasCapC
      );

      const binSums = [0, 0, 0, 0];
      const binCounts = [0, 0, 0, 0];
      for (const s of ts) {
        binSums[s.bin] += s.err - persistentBias;
        binCounts[s.bin]++;
      }
      prof.tempDiurnalBiasC = [0, 1, 2, 3].map((b) => {
        if (binCounts[b] < 2) return 0;
        const meanB = binSums[b] / binCounts[b];
        return clamp(
          meanB * (binCounts[b] / (binCounts[b] + 3.0)),
          -diurnalBiasCapC,
          diurnalBiasCapC
        );
      }) as [number, number, number, number];

      tempRmses[k] = prof.tempRmseC;
      tempUbRmses[k] = Number((prof.tempUbRmseC * 0.75 + prof.tempRmseC * 0.25).toFixed(2));
      biasSumForAvg += Math.abs(prof.tempKalmanBiasC);
      biasCountForAvg++;
    }

    if (tds.length >= 6) {
      const mse = tds.reduce((a, s) => a + s.err * s.err, 0) / tds.length;
      prof.dewRmseC = Number(Math.sqrt(mse).toFixed(2));
      prof.dewKalmanBiasC = computeEwmaBias(
        tds,
        0.89,
        4.0,
        Math.max(4.0, effectiveTempBiasCapC * 0.85)
      );
    }

    if (ps.length >= 6) {
      const meanErr = ps.reduce((a, s) => a + s.err, 0) / ps.length;
      const mse = ps.reduce((a, s) => a + s.err * s.err, 0) / ps.length;
      const ubMse = Math.max(0, mse - meanErr * meanErr);
      prof.pressRmseHpa = Number(Math.sqrt(mse).toFixed(2));
      prof.pressKalmanBiasHpa = computeEwmaBias(ps, 0.9, 3.5, 3.5);
      pressRmses[k] = prof.pressRmseHpa;
      pressUbRmses[k] = Number(Math.sqrt(ubMse * 0.7 + mse * 0.3).toFixed(2));
    }

    if (ws.length >= 6) {
      const mse = ws.reduce((a, s) => a + s.err * s.err, 0) / ws.length;
      prof.windRmseKmh = Number(Math.sqrt(mse).toFixed(2));
      prof.windKalmanBiasKmh = computeEwmaBias(ws, 0.88, 5.0, 10.0);
      windRmses[k] = prof.windRmseKmh;
    }

    if (precipBrierAcc[k].n >= 10) {
      const bs = precipBrierAcc[k].sq / precipBrierAcc[k].n;
      prof.precipBrier = Number(bs.toFixed(3));
      precipBriers[k] = prof.precipBrier;
    }
  }

  const usePrecipBrier =
    hasLiveCalibration &&
    (observedRainHours >= 1 ||
      Object.values(precipBriers).some((v) => typeof v === "number" && v > 0.02));

  const shrinkTowardPriors = (
    empirical: Record<CoreModelKey, number>,
    priors: Record<CoreModelKey, number>,
    credibility: number
  ): Record<CoreModelKey, number> => {
    const c = clamp(credibility, 0, 1);
    const out = {} as Record<CoreModelKey, number>;
    let sum = 0;
    for (const k of CORE_MODEL_KEYS) {
      const v = c * empirical[k] + (1 - c) * priors[k];
      out[k] = v;
      sum += v;
    }
    if (sum > 0) {
      for (const k of CORE_MODEL_KEYS) out[k] /= sum;
    }
    return out;
  };

  // Sample-size credibility: 6-8h short samples shrink conservatively toward WMO priors; >=28h unlocks full empirical weight
  const sampleCredibility = hasLiveCalibration
    ? clamp(matchedHours / 28, 0.32, 1.0)
    : 0;

  const shortRangeWeights: DynamicHybridWeights = hasLiveCalibration
    ? {
        temperature: shrinkTowardPriors(
          computeInverseRmseWeights(
            tempUbRmses,
            WMO_PRIOR_WEIGHTS.temperature,
            0.45
          ),
          WMO_PRIOR_WEIGHTS.temperature,
          sampleCredibility
        ),
        pressure: shrinkTowardPriors(
          computeInverseRmseWeights(
            pressUbRmses,
            WMO_PRIOR_WEIGHTS.pressure,
            0.35
          ),
          WMO_PRIOR_WEIGHTS.pressure,
          sampleCredibility
        ),
        wind: shrinkTowardPriors(
          computeInverseRmseWeights(windRmses, WMO_PRIOR_WEIGHTS.wind, 3.2),
          WMO_PRIOR_WEIGHTS.wind,
          sampleCredibility
        ),
        precipitation: usePrecipBrier
          ? shrinkTowardPriors(
              computeInverseRmseWeights(
                Object.fromEntries(
                  CORE_MODEL_KEYS.map((k) => [
                    k,
                    precipBriers[k] !== null && precipBriers[k] !== undefined
                      ? Math.sqrt(Math.max(0, precipBriers[k]!))
                      : null
                  ])
                ) as Partial<Record<CoreModelKey, number | null>>,
                WMO_PRIOR_WEIGHTS.precipitation,
                0.22
              ),
              WMO_PRIOR_WEIGHTS.precipitation,
              sampleCredibility
            )
          : { ...WMO_PRIOR_WEIGHTS.precipitation }
      }
    : {
        temperature: { ...WMO_PRIOR_WEIGHTS.temperature },
        pressure: { ...WMO_PRIOR_WEIGHTS.pressure },
        wind: { ...WMO_PRIOR_WEIGHTS.wind },
        precipitation: { ...WMO_PRIOR_WEIGHTS.precipitation }
      };

  // Retain 22% of verified local basin/orographic model skill in Days 3-7 instead of resetting 100% to static priors
  const mediumLocalCarry = hasLiveCalibration ? 0.22 * sampleCredibility : 0;
  const mediumRangeWeights: DynamicHybridWeights = {
    temperature: shrinkTowardPriors(
      shortRangeWeights.temperature,
      MEDIUM_RANGE_PRIOR_WEIGHTS.temperature,
      mediumLocalCarry
    ),
    pressure: shrinkTowardPriors(
      shortRangeWeights.pressure,
      MEDIUM_RANGE_PRIOR_WEIGHTS.pressure,
      mediumLocalCarry
    ),
    wind: shrinkTowardPriors(
      shortRangeWeights.wind,
      MEDIUM_RANGE_PRIOR_WEIGHTS.wind,
      mediumLocalCarry
    ),
    precipitation: shrinkTowardPriors(
      shortRangeWeights.precipitation,
      MEDIUM_RANGE_PRIOR_WEIGHTS.precipitation,
      mediumLocalCarry
    )
  };

  // Select primary METAR station (preferring non-cold-basin-trap station when an explicit cold-basin airport list is given)
  const firstStation = network[0]?.station ?? null;
  const primary =
    hasExplicitColdBasinIcaos &&
    firstStation &&
    coldBasinIcaoSet.has(firstStation.icaoId.trim().toUpperCase())
      ? (network.find(
          (n) =>
            !coldBasinIcaoSet.has(n.station.icaoId.trim().toUpperCase()) &&
            n.station.distanceKm <= 45 &&
            n.station.ageMinutes <= 65
        )?.station ?? firstStation)
      : firstStation;

  let anchor: NowcastSensorAnchor = {
    active: false,
    tempObsCityC: null,
    dewObsCityC: null,
    pressObsHpa: null,
    windObsKmh: null,
    tempKalmanGain: 0,
    pressKalmanGain: 0,
    windKalmanGain: 0,
    wxFlags: parseMetarWxTokens(null),
    primaryStationAgeMin: 999,
    primaryStationDistKm: 999
  };

  if (primary && primary.distanceKm <= 55 && primary.ageMinutes <= 65) {
    const elevDiff = cityElevationM - primary.elevationM;
    const tempElevDelta = safeLapse * elevDiff;
    const dewElevDelta =
      Math.max(-0.0028, Math.min(0.0015, safeLapse * 0.35)) * elevDiff;

    const primaryIcaoUpper = primary.icaoId.trim().toUpperCase();
    const isPrimaryExplicitTrap =
      hasExplicitColdBasinIcaos &&
      coldBasinIcaoSet.has(primaryIcaoUpper) &&
      primary.distanceKm >= 6;

    const nowLocalHour = tzResolver.epochMsToLocalParts(nowUtcMs).hour;
    const isNightNow = nowLocalHour >= 18 || nowLocalHour <= 8;
    const primaryBasinUnbias = isPrimaryExplicitTrap
      ? computeRuralBasinToUrbanOffsetC(
          0.04,
          0.96,
          0.85,
          {
            isNight: isNightNow,
            localHour: nowLocalHour,
            cloudCoverPct: primary.wxString?.includes("OVC") ? 90 : 25,
            ambientWindSpeedKt:
              primary.windSpeedKmh !== null ? primary.windSpeedKmh / 1.852 : 4
          },
          primary.windSpeedKmh !== null ? primary.windSpeedKmh / 1.852 : null
        )
      : 0;

    const obsT =
      primary.tempC !== null
        ? primary.tempC + tempElevDelta + primaryBasinUnbias
        : null;
    const obsTd = primary.dewPointC !== null ? primary.dewPointC + dewElevDelta : null;

    const sigmaObsT = Math.hypot(
      0.35,
      primary.distanceKm * 0.022,
      primary.ageMinutes * 0.012,
      Math.abs(elevDiff) * 0.0018
    );
    const sigmaModelT = 1.15;
    const rawKTemp = clamp(
      (sigmaModelT * sigmaModelT) /
        (sigmaModelT * sigmaModelT + sigmaObsT * sigmaObsT),
      0,
      0.76
    );
    const kTemp =
      isPrimaryExplicitTrap && hasMgmMeshCalibration ? rawKTemp * 0.15 : rawKTemp;

    const sigmaObsP = Math.hypot(0.25, primary.distanceKm * 0.008, primary.ageMinutes * 0.006);
    const kPress = clamp(1.0 / (1.0 + sigmaObsP * sigmaObsP), 0, 0.84);

    const sigmaObsW = Math.hypot(2.5, primary.distanceKm * 0.12, primary.ageMinutes * 0.06);
    const kWind = clamp(25 / (25 + sigmaObsW * sigmaObsW), 0, 0.52);

    anchor = {
      active: true,
      tempObsCityC: obsT !== null ? Number(obsT.toFixed(2)) : null,
      dewObsCityC: obsTd !== null ? Number(obsTd.toFixed(2)) : null,
      pressObsHpa: primary.qnhHpa,
      windObsKmh: primary.windSpeedKmh,
      tempKalmanGain: Number(kTemp.toFixed(3)),
      pressKalmanGain: Number(kPress.toFixed(3)),
      windKalmanGain: Number(kWind.toFixed(3)),
      wxFlags: primary.wxFlags ?? parseMetarWxTokens(primary.wxString),
      primaryStationAgeMin: primary.ageMinutes,
      primaryStationDistKm: primary.distanceKm
    };
  }

  const findWinner = (
    map: Partial<Record<CoreModelKey, number | null>>
  ): CoreModelKey | null => {
    let bestKey: CoreModelKey | null = null;
    let bestVal = Infinity;
    for (const k of CORE_MODEL_KEYS) {
      const v = map[k];
      if (typeof v === "number" && Number.isFinite(v) && v < bestVal) {
        bestVal = v;
        bestKey = k;
      }
    }
    return bestKey;
  };

  const rows: ModelVerificationRow[] = CORE_MODEL_KEYS.map((k) => {
    const p = biases[k];
    return {
      modelKey: k,
      label: CORE_MODEL_META[k].label,
      resolution: CORE_MODEL_META[k].resolution,
      tempRmseC: p.tempRmseC,
      tempUbRmseC: p.tempUbRmseC,
      tempBiasC: p.tempMeanBiasC,
      tempMaeC: p.tempMaeC,
      pressureRmseHpa: p.pressRmseHpa,
      windRmseKmh: p.windRmseKmh,
      dewPointRmseC: p.dewRmseC,
      precipBrier: p.precipBrier,
      matchedHours: p.matchedHours,
      weightsPct: {
        temperature: Math.round(shortRangeWeights.temperature[k] * 100),
        pressure: Math.round(shortRangeWeights.pressure[k] * 100),
        wind: Math.round(shortRangeWeights.wind[k] * 100),
        precipitation: Math.round(shortRangeWeights.precipitation[k] * 100)
      }
    };
  });

  const combinedStationIds = Array.from(
    new Set([...uniqueLedgerStations, ...network.map((n) => n.station.icaoId)])
  );

  const summary: KalmanCalibrationSummary = {
    active: hasLiveCalibration || anchor.active,
    stationCount: combinedStationIds.length,
    stationIds: combinedStationIds,
    envLapseRateCPerKm: Number((safeLapse * 1000).toFixed(2)),
    nowcastTempDeltaC: 0,
    nowcastKalmanGain: anchor.tempKalmanGain,
    ensembleMembers,
    meanTempBiasRemovedC:
      biasCountForAvg > 0
        ? Number((biasSumForAvg / biasCountForAvg).toFixed(2))
        : 0
  };

  const mode: LiveVerificationMode = hasMgmMeshCalibration
    ? "live-mgm-mesh"
    : hasLiveCalibration
      ? matchedHours >= 26
        ? "live-station-48h"
        : "live-station-24h"
      : "wmo-prior";

  const report: LiveVerificationReport = {
    mode,
    station: primary,
    stations: network.map((n) => n.station),
    matchedHours,
    winners: {
      temperature: hasLiveCalibration ? findWinner(tempUbRmses) : null,
      pressure: hasLiveCalibration ? findWinner(pressUbRmses) : null,
      wind: hasLiveCalibration ? findWinner(windRmses) : null,
      precipitation: usePrecipBrier ? findWinner(precipBriers) : null
    },
    calibration: summary,
    rows
  };

  return {
    active: hasLiveCalibration || anchor.active,
    shortRangeWeights,
    mediumRangeWeights,
    biases,
    anchor,
    report,
    summary,
    trainingRegimeSummary,
    provinceCode: normalizedProvinceCode,
    kalmanTempBiasCapC: effectiveTempBiasCapC,
    coldBasinAirportIcaos: effectiveColdBasinIcaos
  };
}

export function getLeadTimeWeights(
  shortW: Record<CoreModelKey, number>,
  mediumW: Record<CoreModelKey, number>,
  leadHour: number
): Record<CoreModelKey, number> {
  const alpha = clamp((leadHour - 18) / 60, 0, 1);
  if (alpha <= 0) return shortW;
  const out = {} as Record<CoreModelKey, number>;
  let sum = 0;
  for (const k of CORE_MODEL_KEYS) {
    const v = shortW[k] * (1 - alpha) + mediumW[k] * alpha;
    out[k] = v;
    sum += v;
  }
  if (sum > 0) {
    for (const k of CORE_MODEL_KEYS) out[k] /= sum;
  }
  return out;
}

export function blendKalmanCorrectedScalar({
  snapshot,
  mos,
  param,
  leadHour,
  localHour,
  fallback,
  ensembleP50 = null,
  targetSynopticContext
}: {
  snapshot: HybridModelSnapshot;
  mos: KalmanMosModel;
  param: "temperature" | "dewPoint" | "pressure" | "wind";
  leadHour: number;
  localHour: number;
  fallback: number;
  ensembleP50?: number | null;
  targetSynopticContext?: TargetSynopticContext | null;
}): number {
  const weightDomain = param === "dewPoint" ? "temperature" : param;
  const baseWeights = getLeadTimeWeights(
    mos.shortRangeWeights[weightDomain],
    mos.mediumRangeWeights[weightDomain],
    leadHour
  );

  const hasSynopticGate = Boolean(targetSynopticContext && mos.trainingRegimeSummary);
  const synopticBaseComponents = hasSynopticGate
    ? evaluateRegimeGateComponents({
        trainingRegimeSummary: mos.trainingRegimeSummary,
        targetSynopticContext,
        biasRemoveC: 0
      })
    : null;
  const airmassWindGate = synopticBaseComponents
    ? synopticBaseComponents.airmassGate * synopticBaseComponents.windGate
    : 1.0;

  let weights = baseWeights;
  if (
    hasSynopticGate &&
    (param === "temperature" || param === "dewPoint") &&
    airmassWindGate < 0.999
  ) {
    const neutralPriorW = getLeadTimeWeights(
      WMO_PRIOR_WEIGHTS.temperature,
      MEDIUM_RANGE_PRIOR_WEIGHTS.temperature,
      leadHour
    );
    const blendedW = {} as Record<CoreModelKey, number>;
    let wSum = 0;
    for (const k of CORE_MODEL_KEYS) {
      const v =
        airmassWindGate * baseWeights[k] + (1 - airmassWindGate) * neutralPriorW[k];
      blendedW[k] = v;
      wSum += v;
    }
    if (wSum > 0) {
      for (const k of CORE_MODEL_KEYS) blendedW[k] /= wSum;
      weights = blendedW;
    }
  }

  const mosBiasCapC =
    typeof mos.kalmanTempBiasCapC === "number" &&
    Number.isFinite(mos.kalmanTempBiasCapC) &&
    mos.kalmanTempBiasCapC > 0
      ? mos.kalmanTempBiasCapC
      : 4.5;
  const ensShiftCapC = mosBiasCapC <= 4.5 ? 3.5 : mosBiasCapC * (3.5 / 4.5);
  const anchorTempCapC = mosBiasCapC <= 4.5 ? 4.5 : mosBiasCapC;

  const bin = Math.min(3, Math.max(0, Math.floor((((localHour % 24) + 24) % 24) / 6)));
  const persistDecay = Math.exp(-Math.max(0, leadHour) / 60);
  const transientDecay = Math.exp(-Math.max(0, leadHour) / 10);
  const diurnalDecay = Math.exp(-Math.max(0, leadHour) / 72);
  const dewDecay = Math.exp(-Math.max(0, leadHour) / 24);

  const candidates: Array<{ corr: number; raw: number; w: number }> = [];

  for (const k of CORE_MODEL_KEYS) {
    const rawVal = snapshot[k];
    const w = weights[k];
    if (rawVal === null || rawVal === undefined || !Number.isFinite(rawVal) || w <= 0) {
      continue;
    }

    const b = mos.biases[k];
    let corr = rawVal;
    if (param === "temperature") {
      const rawBiasRemove =
        b.tempPersistentBiasC * persistDecay +
        b.tempTransientBiasC * transientDecay +
        0.72 * b.tempDiurnalBiasC[bin] * diurnalDecay;
      const regimeGate = hasSynopticGate
        ? computeRegimeGateFactor({
            trainingRegimeSummary: mos.trainingRegimeSummary,
            targetSynopticContext,
            biasRemoveC: rawBiasRemove
          })
        : 1.0;
      corr = rawVal - rawBiasRemove * regimeGate;
    } else if (param === "dewPoint") {
      const rawDewBiasRemove = b.dewKalmanBiasC * dewDecay;
      const regimeGate = hasSynopticGate
        ? computeRegimeGateFactor({
            trainingRegimeSummary: mos.trainingRegimeSummary,
            targetSynopticContext,
            biasRemoveC: rawDewBiasRemove
          })
        : 1.0;
      corr = rawVal - rawDewBiasRemove * regimeGate;
    } else if (param === "pressure") {
      corr = rawVal - b.pressKalmanBiasHpa * Math.exp(-Math.max(0, leadHour) / 15);
    } else if (param === "wind") {
      corr = Math.max(0, rawVal - b.windKalmanBiasKmh * Math.exp(-Math.max(0, leadHour) / 12));
    }

    candidates.push({ corr, raw: rawVal, w });
  }

  if (param === "temperature" && leadHour >= 66 && candidates.length >= 5) {
    candidates.sort((a, b) => a.corr - b.corr);
    const trimFactor = leadHour >= 114 ? 0.20 : 0.40;
    candidates[0].w *= trimFactor;
    candidates[candidates.length - 1].w *= trimFactor;
  }

  let num = 0;
  let rawNum = 0;
  let den = 0;
  for (const c of candidates) {
    num += c.corr * c.w;
    rawNum += c.raw * c.w;
    den += c.w;
  }

  let fused = den > 0 ? num / den : fallback;
  const meanKalmanShift = den > 0 ? fused - rawNum / den : 0;

  if (
    ensembleP50 !== null &&
    Number.isFinite(ensembleP50) &&
    leadHour >= 24 &&
    param === "temperature"
  ) {
    const ensWeight = clamp((leadHour - 24) / 120, 0, 0.36);
    const biasAlignedEnsP50 =
      ensembleP50 + clamp(meanKalmanShift, -ensShiftCapC, ensShiftCapC);
    fused = fused * (1 - ensWeight) + biasAlignedEnsP50 * ensWeight;
  }

  if (mos.anchor.active && leadHour >= 0 && leadHour <= 6) {
    const anchorDecay = Math.exp(-leadHour / 2.4);
    const anchorRegimeGate = hasSynopticGate ? airmassWindGate : 1.0;
    if (param === "temperature" && mos.anchor.tempObsCityC !== null) {
      const innovation = clamp(
        mos.anchor.tempObsCityC - fused,
        -anchorTempCapC,
        anchorTempCapC
      );
      fused += innovation * mos.anchor.tempKalmanGain * anchorDecay * anchorRegimeGate;
    } else if (param === "dewPoint" && mos.anchor.dewObsCityC !== null) {
      const innovation = clamp(
        mos.anchor.dewObsCityC - fused,
        -anchorTempCapC,
        anchorTempCapC
      );
      fused +=
        innovation * mos.anchor.tempKalmanGain * 0.85 * anchorDecay * anchorRegimeGate;
    } else if (param === "pressure" && mos.anchor.pressObsHpa !== null) {
      const innovation = clamp(mos.anchor.pressObsHpa - fused, -4.0, 4.0);
      fused += innovation * mos.anchor.pressKalmanGain * anchorDecay;
    } else if (param === "wind" && mos.anchor.windObsKmh !== null) {
      const innovation = clamp(mos.anchor.windObsKmh - fused, -18, 22);
      fused = Math.max(0, fused + innovation * mos.anchor.windKalmanGain * anchorDecay);
    }
  }

  return param === "wind" ? Math.max(0, fused) : fused;
}
