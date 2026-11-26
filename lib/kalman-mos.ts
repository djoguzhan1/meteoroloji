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
  tempKalmanGain: number; // 0..0.78
  pressKalmanGain: number; // 0..0.85
  windKalmanGain: number; // 0..0.55
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
 * 48 saatlik çoklu ICAO METAR ağından (<= 85 km, en yakın 4 istasyon)
 * Cressman / IDW + canlı atmosferik lapse rate düzeltmeli saatlik şehir gözlem serisi üretir.
 */
export function buildCressmanMetarTimeline(
  network: MetarNetworkStation[],
  cityElevationM: number,
  envLapseRateCPerM: number
): Map<string, CressmanHourlyObs> {
  const safeLapse = clamp(envLapseRateCPerM, -0.0098, 0.004);
  // Her UTC saati için tüm istasyon gözlemlerini topla
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

  for (const net of network) {
    const elevDiffToCity = cityElevationM - net.station.elevationM;
    // T_city = T_station + lapseRate * (Z_city - Z_station)
    // Normal troposferde lapseRate = -0.0065 °C/m -> şehir havalimanından alçaksa daha sıcaktır (+ΔT)
    const tempElevDelta = safeLapse * elevDiffToCity;
    // Çiy noktası gradyanı tipik olarak sıcaklığın ~%35'i (~-2°C/km)
    const dewElevDelta = Math.max(-0.0028, Math.min(0.0015, safeLapse * 0.35)) * elevDiffToCity;

    const distKm = Math.max(1, net.station.distanceKm);
    const elevPenalty = 1 + Math.abs(elevDiffToCity) / 280;
    const stationWeight = 1 / ((distKm * distKm + 14 * 14) * elevPenalty);

    for (const ob of net.history) {
      const obsMs = ob.obsTime * 1000;
      const roundedMs = Math.round(obsMs / 3600000) * 3600000;
      const utcKey = new Date(roundedMs).toISOString().slice(0, 16);

      const perStation = bucket.get(utcKey) ?? new Map<string, StationSample>();
      // Aynı saatte birden fazla SPECI/METAR varsa saat başına en yakın olanı tut
      const existing = perStation.get(net.station.icaoId);
      if (
        existing &&
        Math.abs(existing.obsTimeMs - roundedMs) <= Math.abs(obsMs - roundedMs)
      ) {
        continue;
      }

      const tempCity =
        typeof ob.temp === "number" && Number.isFinite(ob.temp)
          ? ob.temp + tempElevDelta
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
    let tNum = 0, tDen = 0;
    let tdNum = 0, tdDen = 0;
    let pNum = 0, pDen = 0;
    let wNum = 0, wDen = 0;
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
        // Basınç yatay olarak çok pürüzsüz değiştiği için mesafe sönümü daha yumuşak
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
 * ATMOS-Core v3.0 Kalman + Diurnal-Phase MOS Eğitim Motoru:
 * - Son 48 saatlik çoklu-istasyon METAR ağına karşı 7 modelin ayrı ayrı bias & UBRMSE'sini çıkarır.
 * - Ağırlıkları ham RMSE değil, bias temizlendikten sonraki rastgele hata (UBRMSE²) ile belirler.
 * - Yağış Brier skoruyla (METAR wxString) yağış ağırlıklarını da canlı kalibre eder.
 */
export function trainKalmanMos({
  network,
  cityElevationM,
  envLapseRateCPerM,
  modelHourlyUtc,
  utcTimeIndex,
  nowUtcMs,
  utcOffsetSeconds,
  ensembleMembers = 0
}: {
  network: MetarNetworkStation[];
  cityElevationM: number;
  envLapseRateCPerM: number;
  modelHourlyUtc: Record<string, Array<number | null> | undefined> | null;
  utcTimeIndex: Map<string, number>;
  nowUtcMs: number;
  utcOffsetSeconds: number;
  ensembleMembers?: number;
}): KalmanMosModel {
  const safeLapse = clamp(envLapseRateCPerM, -0.0098, 0.004);
  const timeline = buildCressmanMetarTimeline(network, cityElevationM, safeLapse);

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
      // Geleceğe taşan saatleri eğitimden dışla
      const ageHours = (nowUtcMs - obs.obsTimeMs) / 3600000;
      if (ageHours < -0.5 || ageHours > 52) continue;
      matchedHours++;
      if (obs.hasPrecip) observedRainHours++;

      const localHour = Math.floor(
        (((obs.obsTimeMs + utcOffsetSeconds * 1000) / 3600000) % 24 + 24) % 24
      );
      const bin = Math.min(3, Math.floor(localHour / 6)); // 0:00-06, 1:06-12, 2:12-18, 3:18-24

      for (const mKey of SEVEN_MODEL_KEYS) {
        const apiId = SEVEN_MODEL_META[mKey].apiModel;
        const mTemp = modelHourlyUtc[`temperature_2m_${apiId}`]?.[idx];
        const mDew = modelHourlyUtc[`dew_point_2m_${apiId}`]?.[idx];
        const mPress = modelHourlyUtc[`pressure_msl_${apiId}`]?.[idx];
        const mWind = modelHourlyUtc[`wind_speed_10m_${apiId}`]?.[idx];
        const mPrecip = modelHourlyUtc[`precipitation_${apiId}`]?.[idx];

        if (obs.tempC !== null && typeof mTemp === "number" && Number.isFinite(mTemp)) {
          tSamples[mKey].push({ err: mTemp - obs.tempC, ageHours: Math.max(0, ageHours), bin });
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
          // Model mm değerini yumuşak yağış olasılığına (0..1) eşleyip Brier skoru hesapla
          const pModel = 1 - Math.exp(-Math.max(0, mPrecip) / 0.35);
          const yObs = obs.hasPrecip ? 1 : 0;
          const diff = pModel - yObs;
          precipBrierAcc[mKey].sq += diff * diff;
          precipBrierAcc[mKey].n++;
        }
      }
    }
  }

  const hasLiveCalibration = network.length > 0 && matchedHours >= 8;

  const tempUbRmses: Partial<Record<SevenModelKey, number | null>> = {};
  const tempRmses: Partial<Record<SevenModelKey, number | null>> = {};
  const pressUbRmses: Partial<Record<SevenModelKey, number | null>> = {};
  const pressRmses: Partial<Record<SevenModelKey, number | null>> = {};
  const windRmses: Partial<Record<SevenModelKey, number | null>> = {};
  const precipBriers: Partial<Record<SevenModelKey, number | null>> = {};

  const computeEwmaBias = (samples: Sample[], lambdaPerHour: number, shrinkN0: number, cap: number): number => {
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
    // Empirical Bayes shrinkage: az gözlemde aşırı düzeltme yapma
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

      // 3-Bileşenli Ayrıştırılmış Kalman + MOS Sapması:
      // 1) Kalıcı 48s Topoğrafik/Mikroklima Sapması (τ = 60s)
      const persistentBias = clamp(meanErr * (n / (n + 5.0)), -4.5, 4.5);
      // 2) Anlık Hava Kütlesi / Bulutluluk Sapması (son ~8-12s EWMA - kalıcı sapma, τ = 10s)
      const ewmaTotal = computeEwmaBias(ts, 0.86, 3.0, 4.5);
      const transientBias = clamp(ewmaTotal - persistentBias, -2.8, 2.8);

      prof.tempPersistentBiasC = persistentBias;
      prof.tempTransientBiasC = transientBias;
      prof.tempKalmanBiasC = clamp(persistentBias + transientBias, -4.5, 4.5);

      // 3) Gündüz/gece 4 zaman dilimli artık faz sapması (kalıcı sapma düşüldükten sonra, τ = 72s)
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
      // UBRMSE ile toplam RMSE karışımı: sabit ofseti temizlediğimiz için %75 UBRMSE + %25 RMSE
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

  // Kısa vade ağırlıkları: UBRMSE² + yağış Brier (en az 1 yağışlı veya yanlış-alarm ayırt edici saat varsa)
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

  // 0–6 saatlik Fiziksel Sensör Asimilasyon Çıpası (Kalman Gain Anchor)
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
    // En taze çoklu-istasyon Cressman değerini veya birincil istasyonu şehir rakımına taşı
    const elevDiff = cityElevationM - primary.elevationM;
    const tempElevDelta = safeLapse * elevDiff;
    const dewElevDelta =
      Math.max(-0.0028, Math.min(0.0015, safeLapse * 0.35)) * elevDiff;

    const obsT = primary.tempC !== null ? primary.tempC + tempElevDelta : null;
    const obsTd = primary.dewPointC !== null ? primary.dewPointC + dewElevDelta : null;

    // Gözlem belirsizliği σ_obs: mesafe + tazelik + rakım farkı arttıkça büyür -> Kalman kazancı azalır
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
    nowcastTempDeltaC: 0, // weather.ts anlık farkı hesaplayıp doldurur
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

/**
 * Vade bağımlı ağırlık harmanlaması:
 * 0–18s: %100 kısa vade (canlı METAR-UBRMSE² + yüksek çözünürlüklü modeller)
 * 18–78s: Kademeli olarak orta vade (ECMWF IFS + AIFS AI liderliği) ağırlıklarına yumuşak geçiş
 */
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

/**
 * 7-Model Kalman + Diurnal-Phase Sapma Düzeltmeli Sıcaklık/Çiy/Basınç/Rüzgar Füzyonu
 * + 0–6s Fiziksel Sensör Asimilasyonu + Orta Vadede 122-Üye Ensemble Stabilizasyonu.
 */
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

  const bin = Math.min(3, Math.max(0, Math.floor(((localHour % 24) + 24) % 24 / 6)));
  const persistDecay = Math.exp(-Math.max(0, leadHour) / 60);
  const transientDecay = Math.exp(-Math.max(0, leadHour) / 10);
  const diurnalDecay = Math.exp(-Math.max(0, leadHour) / 72);
  const dewDecay = Math.exp(-Math.max(0, leadHour) / 24);

  let num = 0;
  let den = 0;

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

    num += corr * w;
    den += w;
  }

  let fused = den > 0 ? num / den : fallback;

  // Orta vadede (24–168s) 122-üyeli gerçek ensemble medyanıyla yumuşak stabilizasyon (%0 -> %22)
  if (
    ensembleP50 !== null &&
    Number.isFinite(ensembleP50) &&
    leadHour >= 24 &&
    param === "temperature"
  ) {
    const ensWeight = clamp((leadHour - 24) / 96, 0, 0.22);
    fused = fused * (1 - ensWeight) + ensembleP50 * ensWeight;
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
