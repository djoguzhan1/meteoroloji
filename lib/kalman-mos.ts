import { isWithinBursaDomain } from "./bursa-mesh";
import type { LedgerStationPoint } from "./state-ledger";
import { computeRuralBasinToUrbanOffsetC } from "./topographic-cressman";
import {
  computeInverseRmseWeights,
  MEDIUM_RANGE_PRIOR_WEIGHTS,
  parseMetarWxTokens,
  SEVEN_MODEL_KEYS,
  SEVEN_MODEL_META,
  WMO_PRIOR_WEIGHTS,
  type DynamicHybridWeights,
  type MetarNetworkStation
} from "./metar-verify";
import type {
  HybridModelSnapshot,
  KalmanCalibrationSummary,
  LiveVerificationReport,
  ModelVerificationRow,
  SevenModelKey
} from "./weather-types";

export type CressmanHourlyObs = {
  utcKey: string;
  obsTimeMs: number;
  tempC: number | null;
  dewPointC: number | null;
  pressureHpa: number | null;
  windSpeedKmh: number | null;
  hasPrecip: boolean | null; // null -> bilgi yok; true/false -> yakın istasyon wxString kanıtı
  isThunderstorm: boolean;
  stationCount: number;
};

export type ModelBiasProfile = {
  tempPersistentBiasC: number; // 48s kalıcı topoğrafik/mikroklima sapması (τ = 60s)
  tempTransientBiasC: number; // son ~8-12s hava kütlesi/bulutluluk sapması (τ = 10s)
  tempKalmanBiasC: number; // toplam t=0 Kalman sapması (geriye dönük uyumluluk & raporlama)
  tempDiurnalBiasC: [number, number, number, number]; // 00-06, 06-12, 12-18, 18-24 yerel saat dilimleri
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
  biases: Record<SevenModelKey, ModelBiasProfile>;
  anchor: NowcastSensorAnchor;
  report: LiveVerificationReport;
  summary: KalmanCalibrationSummary;
};

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
 * 48-72 saatlik çoklu ICAO METAR ağı + Kalıcı Bursa MGM 19-İlçe Defterinden (state-ledger)
 * Cressman / IDW + canlı atmosferik lapse rate düzeltmeli saatlik şehir gözlem serisi üretir.
 */
export function buildCressmanMetarTimeline(
  network: MetarNetworkStation[],
  cityElevationM: number,
  envLapseRateCPerM: number,
  cityLat?: number,
  cityLon?: number,
  ledgerStationHistory?: LedgerStationPoint[]
): Map<string, CressmanHourlyObs> {
  const isBursaOvaTarget =
    cityLat !== undefined &&
    cityLon !== undefined &&
    isWithinBursaDomain(cityLat, cityLon) &&
    cityElevationM <= 450 &&
    cityLon < 29.35;
  const safeLapse = clamp(envLapseRateCPerM, -0.0098, 0.004);

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
  const hasLedgerBursa = Boolean(ledgerStationHistory && ledgerStationHistory.length >= 6);

  // 1. Assimilate persistent Tier-1/2 Bursa MGM 19-district hourly ledger points when available!
  if (ledgerStationHistory && cityLat !== undefined && cityLon !== undefined) {
    for (const pt of ledgerStationHistory) {
      const distKm = Math.max(0.5, haversineKmLocal(cityLat, cityLon, pt.lat, pt.lon));
      if (distKm > 48) continue;
      const elevDiffToCity = cityElevationM - pt.elevationM;
      if (Math.abs(elevDiffToCity) > 450) continue;

      const tempElevDelta = safeLapse * elevDiffToCity;
      const dewElevDelta =
        Math.max(-0.0028, Math.min(0.0015, safeLapse * 0.35)) * elevDiffToCity;
      const elevPenalty = 1 + Math.abs(elevDiffToCity) / 220;
      const isEastBasin = isBursaOvaTarget && pt.lon >= 29.38;
      const barrierFactor = isEastBasin ? 0.18 : 3.2; // Official in-basin MGM dominates distant airports!
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

  // 2. Assimilate regional METAR history (with LTBR frost-basin quarantine when targeting Bursa Ova)
  for (const net of network) {
    const elevDiffToCity = cityElevationM - net.station.elevationM;
    const tempElevDelta = safeLapse * elevDiffToCity;
    const dewElevDelta = Math.max(-0.0028, Math.min(0.0015, safeLapse * 0.35)) * elevDiffToCity;

    const distKm = Math.max(1, net.station.distanceKm);
    const elevPenalty = 1 + Math.abs(elevDiffToCity) / 280;
    const isLtbrTrap = isBursaOvaTarget && net.station.icaoId === "LTBR";
    const barrierFactor = isLtbrTrap ? (hasLedgerBursa ? 0.05 : network.length > 1 ? 0.22 : 1.0) : 1.0;
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

      const localH = (new Date(roundedMs).getUTCHours() + 3) % 24;
      const isNightOb = localH >= 18 || localH <= 8;
      const ltbrBasinUnbias =
        isBursaOvaTarget && net.station.icaoId === "LTBR"
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
          ? ob.temp + tempElevDelta + ltbrBasinUnbias
          : null;
      const dewCity =
        typeof ob.dewp === "number" && Number.isFinite(ob.dewp)
          ? ob.dewp + dewElevDelta
          : null;
      const press =
        typeof ob.slp === "number" && Number.isFinite(ob.slp)
          ? ob.slp
          : typeof ob.altim === "number" && Number.isFinite(ob.altim)
            ? ob.altim
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

/**
 * ATMOS-Core v5.0 Kalman + Diurnal-Phase MOS Eğitim Motoru:
 * - Son 48-72 saatlik Bursa MGM Defteri + çoklu-istasyon METAR ağına karşı 7 modelin bias & UBRMSE'sini çıkarır.
 * - Ağırlıkları ham RMSE değil, bias temizlendikten sonraki rastgele hata (UBRMSE²) ile belirler.
 * - Yağış Brier skoruyla yağış ağırlıklarını da canlı kalibre eder.
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
  ensembleMembers = 0,
  ledgerStationHistory
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
  ensembleMembers?: number;
  ledgerStationHistory?: LedgerStationPoint[];
}): KalmanMosModel {
  const safeLapse = clamp(envLapseRateCPerM, -0.0098, 0.004);
  const timeline = buildCressmanMetarTimeline(
    network,
    cityElevationM,
    safeLapse,
    cityLat,
    cityLon,
    ledgerStationHistory
  );

  // Note: when Bursa hybridUrl is locked to WMO 17116 (100m), align observation timeline to model grid elevation if specified
  const isBursaWmo100mGrid =
    cityLat !== undefined &&
    cityLon !== undefined &&
    isWithinBursaDomain(cityLat, cityLon) &&
    Math.hypot((cityLat - 40.2308) * 111.32, (cityLon - 29.0133) * 85.0) <= 34 &&
    cityElevationM <= 750;
  const modelGridElevAdjustC = isBursaWmo100mGrid ? safeLapse * (100 - cityElevationM) : 0;

  const biases = {} as Record<SevenModelKey, ModelBiasProfile>;
  for (const k of SEVEN_MODEL_KEYS) biases[k] = emptyBiasProfile();

  type Sample = { err: number; ageHours: number; bin: number };
  const tSamples = {} as Record<SevenModelKey, Sample[]>;
  const tdSamples = {} as Record<SevenModelKey, Sample[]>;
  const pSamples = {} as Record<SevenModelKey, Sample[]>;
  const wSamples = {} as Record<SevenModelKey, Sample[]>;
  const precipBrierAcc = {} as Record<SevenModelKey, { sq: number; n: number }>;

  for (const k of SEVEN_MODEL_KEYS) {
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

      const localHour = Math.floor(
        (((obs.obsTimeMs + utcOffsetSeconds * 1000) / 3600000) % 24 + 24) % 24
      );
      const bin = Math.min(3, Math.floor(localHour / 6));

      const obsTempForModel =
        obs.tempC !== null ? obs.tempC + modelGridElevAdjustC : null;

      for (const mKey of SEVEN_MODEL_KEYS) {
        const apiId = SEVEN_MODEL_META[mKey].apiModel;
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

  const hasLiveCalibration =
    (network.length > 0 || (ledgerStationHistory?.length ?? 0) > 0) && matchedHours >= 6;

  const tempUbRmses: Partial<Record<SevenModelKey, number | null>> = {};
  const tempRmses: Partial<Record<SevenModelKey, number | null>> = {};
  const pressUbRmses: Partial<Record<SevenModelKey, number | null>> = {};
  const pressRmses: Partial<Record<SevenModelKey, number | null>> = {};
  const windRmses: Partial<Record<SevenModelKey, number | null>> = {};
  const precipBriers: Partial<Record<SevenModelKey, number | null>> = {};

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

  for (const k of SEVEN_MODEL_KEYS) {
    const ts = filterRobustErrors(tSamples[k], 6.5);
    const tds = filterRobustErrors(tdSamples[k], 7.0);
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

      const persistentBias = clamp(meanErr * (n / (n + 5.0)), -4.5, 4.5);
      const ewmaTotal = computeEwmaBias(ts, 0.86, 3.0, 4.5);
      const transientBias = clamp(ewmaTotal - persistentBias, -2.8, 2.8);

      prof.tempPersistentBiasC = persistentBias;
      prof.tempTransientBiasC = transientBias;
      prof.tempKalmanBiasC = clamp(persistentBias + transientBias, -4.5, 4.5);

      const binSums = [0, 0, 0, 0];
      const binCounts = [0, 0, 0, 0];
      for (const s of ts) {
        binSums[s.bin] += s.err - persistentBias;
        binCounts[s.bin]++;
      }
      prof.tempDiurnalBiasC = [0, 1, 2, 3].map((b) => {
        if (binCounts[b] < 2) return 0;
        const meanB = binSums[b] / binCounts[b];
        return clamp(meanB * (binCounts[b] / (binCounts[b] + 3.0)), -2.5, 2.5);
      }) as [number, number, number, number];

      tempRmses[k] = prof.tempRmseC;
      tempUbRmses[k] = Number((prof.tempUbRmseC * 0.75 + prof.tempRmseC * 0.25).toFixed(2));
      biasSumForAvg += Math.abs(prof.tempKalmanBiasC);
      biasCountForAvg++;
    }

    if (tds.length >= 6) {
      const mse = tds.reduce((a, s) => a + s.err * s.err, 0) / tds.length;
      prof.dewRmseC = Number(Math.sqrt(mse).toFixed(2));
      prof.dewKalmanBiasC = computeEwmaBias(tds, 0.89, 4.0, 4.0);
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

  const shortRangeWeights: DynamicHybridWeights = hasLiveCalibration
    ? {
        temperature: computeInverseRmseWeights(
          tempUbRmses,
          WMO_PRIOR_WEIGHTS.temperature,
          0.45
        ),
        pressure: computeInverseRmseWeights(
          pressUbRmses,
          WMO_PRIOR_WEIGHTS.pressure,
          0.35
        ),
        wind: computeInverseRmseWeights(windRmses, WMO_PRIOR_WEIGHTS.wind, 3.2),
        precipitation: usePrecipBrier
          ? computeInverseRmseWeights(
              Object.fromEntries(
                SEVEN_MODEL_KEYS.map((k) => [
                  k,
                  precipBriers[k] !== null && precipBriers[k] !== undefined
                    ? Math.sqrt(Math.max(0, precipBriers[k]!))
                    : null
                ])
              ) as Partial<Record<SevenModelKey, number | null>>,
              WMO_PRIOR_WEIGHTS.precipitation,
              0.22
            )
          : { ...WMO_PRIOR_WEIGHTS.precipitation }
      }
    : {
        temperature: { ...WMO_PRIOR_WEIGHTS.temperature },
        pressure: { ...WMO_PRIOR_WEIGHTS.pressure },
        wind: { ...WMO_PRIOR_WEIGHTS.wind },
        precipitation: { ...WMO_PRIOR_WEIGHTS.precipitation }
      };

  const mediumRangeWeights: DynamicHybridWeights = {
    temperature: { ...MEDIUM_RANGE_PRIOR_WEIGHTS.temperature },
    pressure: { ...MEDIUM_RANGE_PRIOR_WEIGHTS.pressure },
    wind: { ...MEDIUM_RANGE_PRIOR_WEIGHTS.wind },
    precipitation: { ...MEDIUM_RANGE_PRIOR_WEIGHTS.precipitation }
  };

  const primary = network[0]?.station ?? null;
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

    const obsT = primary.tempC !== null ? primary.tempC + tempElevDelta : null;
    const obsTd = primary.dewPointC !== null ? primary.dewPointC + dewElevDelta : null;

    const sigmaObsT = Math.hypot(
      0.35,
      primary.distanceKm * 0.022,
      primary.ageMinutes * 0.012,
      Math.abs(elevDiff) * 0.0018
    );
    const sigmaModelT = 1.15;
    const kTemp = clamp(
      (sigmaModelT * sigmaModelT) /
        (sigmaModelT * sigmaModelT + sigmaObsT * sigmaObsT),
      0,
      0.76
    );

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
    map: Partial<Record<SevenModelKey, number | null>>
  ): SevenModelKey | null => {
    let bestKey: SevenModelKey | null = null;
    let bestVal = Infinity;
    for (const k of SEVEN_MODEL_KEYS) {
      const v = map[k];
      if (typeof v === "number" && Number.isFinite(v) && v < bestVal) {
        bestVal = v;
        bestKey = k;
      }
    }
    return bestKey;
  };

  const rows: ModelVerificationRow[] = SEVEN_MODEL_KEYS.map((k) => {
    const p = biases[k];
    return {
      modelKey: k,
      label: SEVEN_MODEL_META[k].label,
      resolution: SEVEN_MODEL_META[k].resolution,
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

  const summary: KalmanCalibrationSummary = {
    active: hasLiveCalibration || anchor.active,
    stationCount: network.length,
    stationIds: network.map((n) => n.station.icaoId),
    envLapseRateCPerKm: Number((safeLapse * 1000).toFixed(2)),
    nowcastTempDeltaC: 0,
    nowcastKalmanGain: anchor.tempKalmanGain,
    ensembleMembers,
    meanTempBiasRemovedC:
      biasCountForAvg > 0
        ? Number((biasSumForAvg / biasCountForAvg).toFixed(2))
        : 0
  };

  const report: LiveVerificationReport = {
    mode: hasLiveCalibration
      ? matchedHours >= 26
        ? "live-metar-48h"
        : "live-metar-24h"
      : "wmo-prior",
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
    summary
  };
}

export function getLeadTimeWeights(
  shortW: Record<SevenModelKey, number>,
  mediumW: Record<SevenModelKey, number>,
  leadHour: number
): Record<SevenModelKey, number> {
  const alpha = clamp((leadHour - 18) / 60, 0, 1);
  if (alpha <= 0) return shortW;
  const out = {} as Record<SevenModelKey, number>;
  let sum = 0;
  for (const k of SEVEN_MODEL_KEYS) {
    const v = shortW[k] * (1 - alpha) + mediumW[k] * alpha;
    out[k] = v;
    sum += v;
  }
  if (sum > 0) {
    for (const k of SEVEN_MODEL_KEYS) out[k] /= sum;
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
  ensembleP50 = null
}: {
  snapshot: HybridModelSnapshot;
  mos: KalmanMosModel;
  param: "temperature" | "dewPoint" | "pressure" | "wind";
  leadHour: number;
  localHour: number;
  fallback: number;
  ensembleP50?: number | null;
}): number {
  const weightDomain = param === "dewPoint" ? "temperature" : param;
  const weights = getLeadTimeWeights(
    mos.shortRangeWeights[weightDomain],
    mos.mediumRangeWeights[weightDomain],
    leadHour
  );

  const bin = Math.min(3, Math.max(0, Math.floor((((localHour % 24) + 24) % 24) / 6)));
  const persistDecay = Math.exp(-Math.max(0, leadHour) / 60);
  const transientDecay = Math.exp(-Math.max(0, leadHour) / 10);
  const diurnalDecay = Math.exp(-Math.max(0, leadHour) / 72);
  const dewDecay = Math.exp(-Math.max(0, leadHour) / 24);

  const candidates: Array<{ corr: number; raw: number; w: number }> = [];

  for (const k of SEVEN_MODEL_KEYS) {
    const rawVal = snapshot[k];
    const w = weights[k];
    if (rawVal === null || rawVal === undefined || !Number.isFinite(rawVal) || w <= 0) {
      continue;
    }

    const b = mos.biases[k];
    let corr = rawVal;
    if (param === "temperature") {
      const biasRemove =
        b.tempPersistentBiasC * persistDecay +
        b.tempTransientBiasC * transientDecay +
        0.72 * b.tempDiurnalBiasC[bin] * diurnalDecay;
      corr = rawVal - biasRemove;
    } else if (param === "dewPoint") {
      corr = rawVal - b.dewKalmanBiasC * dewDecay;
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

  // Orta-uzun vadede (24–168s) 212-üyeli gerçek ensemble medyanıyla faz kilitleme (Kalman sapması korunarak!)
  if (
    ensembleP50 !== null &&
    Number.isFinite(ensembleP50) &&
    leadHour >= 24 &&
    param === "temperature"
  ) {
    const ensWeight = clamp((leadHour - 24) / 120, 0, 0.36);
    const biasAlignedEnsP50 = ensembleP50 + clamp(meanKalmanShift, -3.5, 3.5);
    fused = fused * (1 - ensWeight) + biasAlignedEnsP50 * ensWeight;
  }

  // 0–6 saatlik Fiziksel Sensör Asimilasyonu (Kalman Gain Anchor)
  if (mos.anchor.active && leadHour >= 0 && leadHour <= 6) {
    const anchorDecay = Math.exp(-leadHour / 2.4);
    if (param === "temperature" && mos.anchor.tempObsCityC !== null) {
      const innovation = clamp(mos.anchor.tempObsCityC - fused, -4.5, 4.5);
      fused += innovation * mos.anchor.tempKalmanGain * anchorDecay;
    } else if (param === "dewPoint" && mos.anchor.dewObsCityC !== null) {
      const innovation = clamp(mos.anchor.dewObsCityC - fused, -4.5, 4.5);
      fused += innovation * mos.anchor.tempKalmanGain * 0.85 * anchorDecay;
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
