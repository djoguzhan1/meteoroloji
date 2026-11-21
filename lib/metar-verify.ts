import type {
  FiveModelKey,
  LiveVerificationReport,
  MetarObservation,
  ModelVerificationRow
} from "./weather-types";

export const FIVE_MODEL_META: Record<
  FiveModelKey,
  { apiModel: string; label: string; shortLabel: string; resolution: string; color: string }
> = {
  ecmwfIfs: {
    apiModel: "ecmwf_ifs",
    label: "ECMWF IFS 9km",
    shortLabel: "ECMWF IFS",
    resolution: "9 km HRES",
    color: "#38bdf8"
  },
  ecmwfAifs: {
    apiModel: "ecmwf_aifs025_single",
    label: "ECMWF AIFS v1",
    shortLabel: "AIFS AI",
    resolution: "0.25° AI",
    color: "#a78bfa"
  },
  icon: {
    apiModel: "icon_seamless",
    label: "DWD ICON-EU",
    shortLabel: "ICON-EU",
    resolution: "7 km / 13 km",
    color: "#10b981"
  },
  ukmo: {
    apiModel: "ukmo_seamless",
    label: "UKMO Unified",
    shortLabel: "UKMO 10km",
    resolution: "10 km / 2 km",
    color: "#f472b6"
  },
  gfs: {
    apiModel: "gfs_seamless",
    label: "NOAA GFS",
    shortLabel: "NOAA GFS",
    resolution: "13 km / 3 km",
    color: "#f59e0b"
  }
};

export const FIVE_MODEL_KEYS: FiveModelKey[] = [
  "ecmwfIfs",
  "ecmwfAifs",
  "icon",
  "ukmo",
  "gfs"
];

/**
 * WMO LC-DNV & ECMWF 2025 Operasyonel Skor Kartlarına dayalı ön ağırlıklar (priors).
 * Yakında fiziksel METAR varsa bunlar canlı 24s Ters-RMSE² kanıtıyla güncellenir.
 */
export const WMO_PRIOR_WEIGHTS: Record<
  "temperature" | "pressure" | "wind" | "precipitation",
  Record<FiveModelKey, number>
> = {
  temperature: {
    ecmwfIfs: 0.26,
    ecmwfAifs: 0.28,
    icon: 0.2,
    ukmo: 0.16,
    gfs: 0.1
  },
  pressure: {
    ecmwfIfs: 0.28,
    ecmwfAifs: 0.24,
    ukmo: 0.22,
    icon: 0.14,
    gfs: 0.12
  },
  wind: {
    icon: 0.28,
    ecmwfIfs: 0.24,
    ukmo: 0.18,
    ecmwfAifs: 0.14,
    gfs: 0.16
  },
  precipitation: {
    icon: 0.3,
    ecmwfIfs: 0.28,
    ukmo: 0.18,
    ecmwfAifs: 0.12,
    gfs: 0.12
  }
};

export type RawMetarRecord = {
  icaoId: string;
  name?: string;
  lat: number;
  lon: number;
  elev?: number;
  obsTime: number; // unix seconds
  reportTime?: string;
  rawOb?: string;
  temp?: number | null;
  dewp?: number | null;
  wdir?: number | string | null;
  wspd?: number | null; // knots
  wgst?: number | null; // knots
  altim?: number | null; // hPa (QNH)
  slp?: number | null; // hPa (sea level pressure)
  visib?: number | string | null; // statute miles
  wxString?: string | null;
};

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Düzenlileştirilmiş Ters-RMSE² Ağırlıklandırma:
 * w_i = [pi_i / (RMSE_i^2 + sigma0^2)] / sum(...)
 */
export function computeInverseRmseWeights(
  rmses: Partial<Record<FiveModelKey, number | null>>,
  priors: Record<FiveModelKey, number>,
  sigma0: number
): Record<FiveModelKey, number> {
  const raw: Record<FiveModelKey, number> = {
    ecmwfIfs: 0,
    ecmwfAifs: 0,
    icon: 0,
    ukmo: 0,
    gfs: 0
  };
  let sum = 0;

  for (const key of FIVE_MODEL_KEYS) {
    const rmse = rmses[key];
    const prior = priors[key];
    const score =
      typeof rmse === "number" && Number.isFinite(rmse) && rmse >= 0
        ? prior / (rmse * rmse + sigma0 * sigma0)
        : prior / (sigma0 * sigma0 * 4);
    raw[key] = score;
    sum += score;
  }

  if (sum <= 0) return { ...priors };

  const out = {} as Record<FiveModelKey, number>;
  for (const key of FIVE_MODEL_KEYS) {
    out[key] = raw[key] / sum;
  }
  return out;
}

function parseVisibilityKm(visib: number | string | null | undefined): number | null {
  if (typeof visib === "number" && Number.isFinite(visib)) {
    return Number((visib * 1.60934).toFixed(1));
  }
  if (typeof visib === "string") {
    const num = parseFloat(visib.replace("+", ""));
    if (Number.isFinite(num)) return Number((num * 1.60934).toFixed(1));
  }
  return null;
}

type MetarCacheEntry = {
  expiresAt: number;
  station: MetarObservation | null;
  history: RawMetarRecord[];
};

const metarCache = new Map<string, MetarCacheEntry>();
const METAR_TTL_MS = 5 * 60 * 1000;

export function clearMetarCache(): void {
  metarCache.clear();
}

export async function fetchNearestMetarHistory(
  lat: number,
  lon: number
): Promise<{ station: MetarObservation | null; history: RawMetarRecord[] }> {
  const cacheKey = `${(Math.round(lat * 5) / 5).toFixed(1)},${(Math.round(lon * 5) / 5).toFixed(1)}`;
  const cached = metarCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { station: cached.station, history: cached.history };
  }

  const queryBox = async (deltaDeg: number): Promise<RawMetarRecord[]> => {
    const minLat = Math.max(-85, lat - deltaDeg).toFixed(3);
    const maxLat = Math.min(85, lat + deltaDeg).toFixed(3);
    const minLon = Math.max(-180, lon - deltaDeg * 1.25).toFixed(3);
    const maxLon = Math.min(180, lon + deltaDeg * 1.25).toFixed(3);
    const url = `https://aviationweather.gov/api/data/metar?bbox=${minLat},${minLon},${maxLat},${maxLon}&hours=24&format=json`;
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(6500),
      headers: { "User-Agent": "ATMOS-Meteo/2.1" }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as RawMetarRecord[]) : [];
  };

  try {
    let records = await queryBox(0.6);
    if (records.length === 0) {
      records = await queryBox(1.15);
    }

    if (records.length === 0) {
      metarCache.set(cacheKey, {
        expiresAt: Date.now() + METAR_TTL_MS,
        station: null,
        history: []
      });
      return { station: null, history: [] };
    }

    // İstasyon bazında grupla ve en yakın geçerli ICAO istasyonunu seç (<= 65 km)
    const grouped = new Map<string, RawMetarRecord[]>();
    for (const r of records) {
      if (!r.icaoId || typeof r.lat !== "number" || typeof r.lon !== "number") continue;
      const list = grouped.get(r.icaoId) ?? [];
      list.push(r);
      grouped.set(r.icaoId, list);
    }

    let bestIcao: string | null = null;
    let bestDist = Infinity;
    for (const [icao, list] of grouped.entries()) {
      const sample = list[0];
      const dist = haversineKm(lat, lon, sample.lat, sample.lon);
      // Yeterli taze gözlemi olan en yakın istasyon tercih edilir
      if (dist <= 65 && dist < bestDist && list.length >= 2) {
        bestDist = dist;
        bestIcao = icao;
      }
    }

    if (!bestIcao) {
      metarCache.set(cacheKey, {
        expiresAt: Date.now() + METAR_TTL_MS,
        station: null,
        history: []
      });
      return { station: null, history: [] };
    }

    const stationHistory = (grouped.get(bestIcao) ?? []).sort(
      (a, b) => b.obsTime - a.obsTime
    );
    const latest = stationHistory[0];
    const obsDate = new Date(latest.obsTime * 1000);
    const ageMinutes = Math.max(0, Math.round((Date.now() - obsDate.getTime()) / 60000));

    const station: MetarObservation = {
      icaoId: latest.icaoId,
      stationName: latest.name || latest.icaoId,
      distanceKm: Number(bestDist.toFixed(1)),
      elevationM: Math.round(Number(latest.elev ?? 0)),
      obsTimeIso: obsDate.toISOString(),
      ageMinutes,
      rawOb: String(latest.rawOb ?? ""),
      tempC:
        typeof latest.temp === "number" && Number.isFinite(latest.temp)
          ? Number(latest.temp.toFixed(1))
          : null,
      dewPointC:
        typeof latest.dewp === "number" && Number.isFinite(latest.dewp)
          ? Number(latest.dewp.toFixed(1))
          : null,
      windSpeedKmh:
        typeof latest.wspd === "number" && Number.isFinite(latest.wspd)
          ? Number((latest.wspd * 1.852).toFixed(1))
          : null,
      windGustKmh:
        typeof latest.wgst === "number" && Number.isFinite(latest.wgst)
          ? Number((latest.wgst * 1.852).toFixed(1))
          : null,
      windDirectionDeg:
        typeof latest.wdir === "number" && Number.isFinite(latest.wdir)
          ? Math.round(latest.wdir)
          : null,
      qnhHpa:
        typeof latest.slp === "number" && Number.isFinite(latest.slp)
          ? Number(latest.slp.toFixed(1))
          : typeof latest.altim === "number" && Number.isFinite(latest.altim)
            ? Number(latest.altim.toFixed(1))
            : null,
      visibilityKm: parseVisibilityKm(latest.visib),
      wxString: latest.wxString ? String(latest.wxString) : null
    };

    metarCache.set(cacheKey, {
      expiresAt: Date.now() + METAR_TTL_MS,
      station,
      history: stationHistory
    });

    return { station, history: stationHistory };
  } catch {
    return { station: null, history: [] };
  }
}

export type DynamicHybridWeights = {
  temperature: Record<FiveModelKey, number>;
  pressure: Record<FiveModelKey, number>;
  wind: Record<FiveModelKey, number>;
  precipitation: Record<FiveModelKey, number>;
};

export function evaluateModelsAgainstMetar({
  station,
  metarHistory,
  cityElevationM,
  modelHourlyUtc,
  utcTimeIndex
}: {
  station: MetarObservation | null;
  metarHistory: RawMetarRecord[];
  cityElevationM: number;
  modelHourlyUtc: Record<string, Array<number | null> | undefined> | null;
  utcTimeIndex: Map<string, number>;
}): { report: LiveVerificationReport; weights: DynamicHybridWeights } {
  // Rakım farkı düzeltmesi: model şehir grid rakımında, METAR havalimanı rakımında ölçer.
  // Standart troposfer sıcaklık gradyanı: -0.0065 °C/m.
  const elevDiffM = station ? station.elevationM - cityElevationM : 0;
  const stationTempToCityDeltaC = elevDiffM * 0.0065;

  const acc: Record<
    FiveModelKey,
    {
      tSq: number;
      tAbs: number;
      tN: number;
      tdSq: number;
      tdN: number;
      pSq: number;
      pN: number;
      wSq: number;
      wN: number;
    }
  > = {
    ecmwfIfs: { tSq: 0, tAbs: 0, tN: 0, tdSq: 0, tdN: 0, pSq: 0, pN: 0, wSq: 0, wN: 0 },
    ecmwfAifs: { tSq: 0, tAbs: 0, tN: 0, tdSq: 0, tdN: 0, pSq: 0, pN: 0, wSq: 0, wN: 0 },
    icon: { tSq: 0, tAbs: 0, tN: 0, tdSq: 0, tdN: 0, pSq: 0, pN: 0, wSq: 0, wN: 0 },
    ukmo: { tSq: 0, tAbs: 0, tN: 0, tdSq: 0, tdN: 0, pSq: 0, pN: 0, wSq: 0, wN: 0 },
    gfs: { tSq: 0, tAbs: 0, tN: 0, tdSq: 0, tdN: 0, pSq: 0, pN: 0, wSq: 0, wN: 0 }
  };

  const matchedHourSet = new Set<string>();

  if (station && modelHourlyUtc && metarHistory.length > 0) {
    for (const ob of metarHistory) {
      const obsMs = ob.obsTime * 1000;
      const roundedUtc = new Date(Math.round(obsMs / 3600000) * 3600000);
      const isoUtc = roundedUtc.toISOString().slice(0, 16);
      if (matchedHourSet.has(isoUtc)) continue;

      const idx = utcTimeIndex.get(isoUtc);
      if (idx === undefined) continue;
      matchedHourSet.add(isoUtc);

      const obsTempAdj =
        typeof ob.temp === "number" && Number.isFinite(ob.temp)
          ? ob.temp + stationTempToCityDeltaC
          : null;
      const obsDewAdj =
        typeof ob.dewp === "number" && Number.isFinite(ob.dewp)
          ? ob.dewp + stationTempToCityDeltaC
          : null;
      const obsPress =
        typeof ob.slp === "number" && Number.isFinite(ob.slp)
          ? ob.slp
          : typeof ob.altim === "number" && Number.isFinite(ob.altim)
            ? ob.altim
            : null;
      const obsWindKmh =
        typeof ob.wspd === "number" && Number.isFinite(ob.wspd)
          ? ob.wspd * 1.852
          : null;

      for (const mKey of FIVE_MODEL_KEYS) {
        const apiId = FIVE_MODEL_META[mKey].apiModel;
        const mTemp = modelHourlyUtc[`temperature_2m_${apiId}`]?.[idx];
        const mDew = modelHourlyUtc[`dew_point_2m_${apiId}`]?.[idx];
        const mPress = modelHourlyUtc[`pressure_msl_${apiId}`]?.[idx];
        const mWind = modelHourlyUtc[`wind_speed_10m_${apiId}`]?.[idx];

        if (obsTempAdj !== null && typeof mTemp === "number" && Number.isFinite(mTemp)) {
          const err = mTemp - obsTempAdj;
          acc[mKey].tSq += err * err;
          acc[mKey].tAbs += Math.abs(err);
          acc[mKey].tN++;
        }
        if (obsDewAdj !== null && typeof mDew === "number" && Number.isFinite(mDew)) {
          const err = mDew - obsDewAdj;
          acc[mKey].tdSq += err * err;
          acc[mKey].tdN++;
        }
        if (obsPress !== null && typeof mPress === "number" && Number.isFinite(mPress)) {
          const err = mPress - obsPress;
          acc[mKey].pSq += err * err;
          acc[mKey].pN++;
        }
        if (obsWindKmh !== null && typeof mWind === "number" && Number.isFinite(mWind)) {
          const err = mWind - obsWindKmh;
          acc[mKey].wSq += err * err;
          acc[mKey].wN++;
        }
      }
    }
  }

  const matchedHours = matchedHourSet.size;
  const hasLiveVerification = Boolean(station && matchedHours >= 8);

  const tempRmses: Partial<Record<FiveModelKey, number | null>> = {};
  const pressRmses: Partial<Record<FiveModelKey, number | null>> = {};
  const windRmses: Partial<Record<FiveModelKey, number | null>> = {};
  const dewRmses: Partial<Record<FiveModelKey, number | null>> = {};
  const tempMaes: Partial<Record<FiveModelKey, number | null>> = {};

  for (const k of FIVE_MODEL_KEYS) {
    const a = acc[k];
    tempRmses[k] = a.tN >= 6 ? Number(Math.sqrt(a.tSq / a.tN).toFixed(2)) : null;
    tempMaes[k] = a.tN >= 6 ? Number((a.tAbs / a.tN).toFixed(2)) : null;
    dewRmses[k] = a.tdN >= 6 ? Number(Math.sqrt(a.tdSq / a.tdN).toFixed(2)) : null;
    pressRmses[k] = a.pN >= 6 ? Number(Math.sqrt(a.pSq / a.pN).toFixed(2)) : null;
    windRmses[k] = a.wN >= 6 ? Number(Math.sqrt(a.wSq / a.wN).toFixed(2)) : null;
  }

  const weights: DynamicHybridWeights = hasLiveVerification
    ? {
        temperature: computeInverseRmseWeights(
          tempRmses,
          WMO_PRIOR_WEIGHTS.temperature,
          0.55
        ),
        pressure: computeInverseRmseWeights(
          pressRmses,
          WMO_PRIOR_WEIGHTS.pressure,
          0.4
        ),
        wind: computeInverseRmseWeights(windRmses, WMO_PRIOR_WEIGHTS.wind, 3.5),
        // Yağış METAR'da mm olarak raporlanmadığı için WMO/çözünürlük ağırlıkları korunur
        precipitation: { ...WMO_PRIOR_WEIGHTS.precipitation }
      }
    : {
        temperature: { ...WMO_PRIOR_WEIGHTS.temperature },
        pressure: { ...WMO_PRIOR_WEIGHTS.pressure },
        wind: { ...WMO_PRIOR_WEIGHTS.wind },
        precipitation: { ...WMO_PRIOR_WEIGHTS.precipitation }
      };

  const findWinner = (
    map: Partial<Record<FiveModelKey, number | null>>
  ): FiveModelKey | null => {
    let bestKey: FiveModelKey | null = null;
    let bestVal = Infinity;
    for (const k of FIVE_MODEL_KEYS) {
      const v = map[k];
      if (typeof v === "number" && v < bestVal) {
        bestVal = v;
        bestKey = k;
      }
    }
    return bestKey;
  };

  const rows: ModelVerificationRow[] = FIVE_MODEL_KEYS.map((k) => ({
    modelKey: k,
    label: FIVE_MODEL_META[k].label,
    resolution: FIVE_MODEL_META[k].resolution,
    tempRmseC: tempRmses[k] ?? null,
    tempMaeC: tempMaes[k] ?? null,
    pressureRmseHpa: pressRmses[k] ?? null,
    windRmseKmh: windRmses[k] ?? null,
    dewPointRmseC: dewRmses[k] ?? null,
    matchedHours: acc[k].tN,
    weightsPct: {
      temperature: Math.round(weights.temperature[k] * 100),
      pressure: Math.round(weights.pressure[k] * 100),
      wind: Math.round(weights.wind[k] * 100),
      precipitation: Math.round(weights.precipitation[k] * 100)
    }
  }));

  return {
    weights,
    report: {
      mode: hasLiveVerification ? "live-metar-24h" : "wmo-prior",
      station,
      matchedHours,
      winners: {
        temperature: hasLiveVerification ? findWinner(tempRmses) : null,
        pressure: hasLiveVerification ? findWinner(pressRmses) : null,
        wind: hasLiveVerification ? findWinner(windRmses) : null
      },
      rows
    }
  };
}
