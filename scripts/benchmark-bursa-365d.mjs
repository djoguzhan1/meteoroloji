#!/usr/bin/env node
/**
 * ATMOS v5.0 — 17,472-Hour (2-Year) WMO 17116 Bursa Out-of-Sample Cross-Validation & Live 19-District MGM Benchmark
 * File: scripts/benchmark-bursa-365d.mjs
 *
 * Usage:
 *   node scripts/benchmark-bursa-365d.mjs             # Full 17,472h 2-year archive + 5-fold 168h-purged CV + live MGM probe
 *   node scripts/benchmark-bursa-365d.mjs --self-test # Offline synthetic Bursa physics self-test
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import zlib from 'node:zlib';

const HTTP_UA =
  'Mozilla/5.0 (compatible; Google-Agent; +https://developers.google.com/crawling/docs/crawlers-fetchers/google-agent)';

const BURSA_17116 = { lat: 40.2308, lon: 29.0133, elevM: 100 };
const LEAD_DAYS = [0, 1, 2, 3, 4, 5, 6, 7];
const INTRADAY_LEADS_H = [1, 2, 3, 6, 12, 18];

const ALL_CHUNKS = [
  ['2024-03-28', '2024-06-30'],
  ['2024-07-01', '2024-09-30'],
  ['2024-10-01', '2024-12-31'],
  ['2025-01-01', '2025-03-27'],
  ['2025-03-28', '2025-06-30'],
  ['2025-07-01', '2025-09-30'],
  ['2025-10-01', '2025-12-31'],
  ['2026-01-01', '2026-03-29'],
];

const MODEL_APIS = [
  'ecmwf_ifs',
  'ecmwf_ifs025',
  'ecmwf_aifs025_single',
  'icon_seamless',
  'icon_global',
  'ukmo_seamless',
  'meteofrance_seamless',
  'gfs_seamless',
  'gem_seamless',
  'jma_seamless',
];

function parseArgs(argv) {
  const opts = {
    selfTest: false,
    cacheDir: path.resolve(process.cwd(), '.cache/bursa-v5'),
    outJson: path.resolve(process.cwd(), 'reports/bursa-365d-benchmark.json'),
  };
  for (const arg of argv.slice(2)) {
    if (arg === '--self-test') opts.selfTest = true;
    else if (arg.startsWith('--out=')) opts.outJson = path.resolve(process.cwd(), arg.split('=')[1]);
  }
  return opts;
}

async function fetchJsonCached(cacheDir, fileName, url, retries = 3) {
  await fs.mkdir(cacheDir, { recursive: true });
  const safePath = path.join(cacheDir, fileName);
  try {
    return JSON.parse(await fs.readFile(safePath, 'utf8'));
  } catch {
    // Cache miss -> download
  }
  let lastErr = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json', 'User-Agent': HTTP_UA },
        signal: AbortSignal.timeout(30000),
      });
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      const data = await res.json();
      await fs.writeFile(safePath, JSON.stringify(data), 'utf8');
      return data;
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
    }
  }
  throw lastErr;
}

async function fetchLiveBursaTelemetrySnapshot() {
  try {
    const mgmHeaders = {
      Accept: 'application/json',
      Origin: 'https://www.mgm.gov.tr',
      Referer: 'https://www.mgm.gov.tr/',
      'User-Agent': HTTP_UA,
    };
    const [centersRes, metarRes] = await Promise.all([
      fetch('https://servis.mgm.gov.tr/web/merkezler/ililcesi?il=Bursa', {
        headers: mgmHeaders,
        signal: AbortSignal.timeout(6000),
      }),
      fetch('https://aviationweather.gov/api/data/metar?ids=LTBR,LTFJ&format=json&hours=2', {
        headers: { Accept: 'application/json', 'User-Agent': HTTP_UA },
        signal: AbortSignal.timeout(6000),
      }),
    ]);

    if (!centersRes.ok) return null;
    const centers = await centersRes.json();
    const obsList = await Promise.all(
      centers.map(async (c) => {
        try {
          const r = await fetch(`https://servis.mgm.gov.tr/web/sondurumlar?merkezid=${c.merkezId}`, {
            headers: mgmHeaders,
            signal: AbortSignal.timeout(5000),
          });
          const arr = r.ok ? await r.json() : [];
          const o = arr[0];
          if (!o || typeof o.sicaklik !== 'number' || o.sicaklik < -45) return null;
          return {
            district: c.ilce,
            merkezId: c.merkezId,
            wmo: c.gunlukTahminIstNo,
            elevM: c.yukseklik,
            tempC: o.sicaklik,
            rhPct: o.nem,
            precipMm: o.yagis00Now >= 0 ? o.yagis00Now : 0,
            obsTimeUtc: o.veriZamani,
          };
        } catch {
          return null;
        }
      }),
    );

    const validDistricts = obsList.filter(Boolean);
    const metars = metarRes.ok ? await metarRes.json() : [];
    const latestLtbr = Array.isArray(metars) ? metars.find((m) => m.icaoId === 'LTBR') : null;
    const latestLtfj = Array.isArray(metars) ? metars.find((m) => m.icaoId === 'LTFJ') : null;
    const osmangazi = validDistricts.find((d) => d.merkezId === 91601 || d.district === 'Osmangazi');

    return {
      capturedAtIso: new Date().toISOString(),
      onlineDistrictCount: validDistricts.length,
      osmangazi17116TempC: osmangazi?.tempC ?? null,
      ltbrMetarTempC: latestLtbr?.temp ?? null,
      ltfjMetarTempC: latestLtfj?.temp ?? null,
      ltbrMinusBursaErrorC:
        osmangazi?.tempC != null && latestLtbr?.temp != null
          ? Number((latestLtbr.temp - osmangazi.tempC).toFixed(2))
          : null,
      keyDistricts: validDistricts.filter((d) =>
        ['Osmangazi', 'Nilüfer', 'Yıldırım', 'Mudanya', 'Gemlik', 'Kestel', 'Uludağ Kayak Merkezi'].includes(
          d.district,
        ),
      ),
    };
  } catch {
    return null;
  }
}

function solarSinElevBursa(doy, utcHour) {
  const gamma = (2 * Math.PI * (doy - 1 + (utcHour - 12) / 24)) / 365.25;
  const decl =
    0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma);
  const eqt =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  const tst = (((utcHour * 60 + eqt + 4 * 29.0133) % 1440) + 1440) % 1440;
  const ha = ((tst / 4 - 180) * Math.PI) / 180;
  const latR = (40.2308 * Math.PI) / 180;
  return Math.sin(latR) * Math.sin(decl) + Math.cos(latR) * Math.cos(decl) * Math.cos(ha);
}

function medianSorted(arr) {
  if (!arr.length) return 0;
  const m = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[m] : 0.5 * (arr[m - 1] + arr[m]);
}

function solveLinearSystem(A, b) {
  const p = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < p; col++) {
    let maxRow = col;
    for (let r = col + 1; r < p; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[maxRow][col])) maxRow = r;
    }
    [M[col], M[maxRow]] = [M[maxRow], M[col]];
    const piv = M[col][col] || 1e-9;
    for (let j = col; j <= p; j++) M[col][j] /= piv;
    for (let r = 0; r < p; r++) {
      if (r === col) continue;
      const f = M[r][col];
      if (f === 0) continue;
      for (let j = col; j <= p; j++) M[r][j] -= f * M[col][j];
    }
  }
  return M.map((row) => row[p]);
}

function fitWeightedStandardizedResidualL1Ridge(X, yRes, sampleW, lam = 150, epsL1 = 0.50, iters = 8) {
  const n = X.length;
  const p = X[0].length;
  const means = new Float64Array(p);
  const scales = new Float64Array(p).fill(1);
  const activeCol = new Uint8Array(p).fill(1);

  for (let j = 1; j < p; j++) {
    let s = 0;
    for (let i = 0; i < n; i++) s += X[i][j];
    const mu = s / n;
    means[j] = mu;
    let v = 0;
    for (let i = 0; i < n; i++) {
      const d = X[i][j] - mu;
      v += d * d;
    }
    const sd = Math.sqrt(v / n);
    if (sd < 1e-3) {
      activeCol[j] = 0;
      scales[j] = 1;
    } else {
      scales[j] = sd;
    }
  }

  const Z = Array.from({ length: n }, (_, i) => {
    const row = new Float64Array(p);
    row[0] = 1.0;
    for (let j = 1; j < p; j++) row[j] = activeCol[j] ? (X[i][j] - means[j]) / scales[j] : 0;
    return row;
  });

  const w = Float64Array.from(sampleW);
  let gamma = new Array(p).fill(0);

  for (let it = 0; it < iters; it++) {
    const ZtWZ = Array.from({ length: p }, () => new Float64Array(p));
    const ZtWy = new Float64Array(p);
    for (let i = 0; i < n; i++) {
      const wi = w[i];
      const zi = Z[i];
      const yi = yRes[i];
      for (let j = 0; j < p; j++) {
        const wzj = wi * zi[j];
        ZtWy[j] += wzj * yi;
        for (let k = j; k < p; k++) ZtWZ[j][k] += wzj * zi[k];
      }
    }
    for (let j = 0; j < p; j++) {
      for (let k = 0; k < j; k++) ZtWZ[j][k] = ZtWZ[k][j];
      if (j > 0) ZtWZ[j][j] += lam;
      else ZtWZ[j][j] += 1e-6;
    }
    gamma = solveLinearSystem(ZtWZ, ZtWy);
    for (let i = 0; i < n; i++) {
      let pred = 0;
      const zi = Z[i];
      for (let j = 0; j < p; j++) pred += zi[j] * gamma[j];
      const r = Math.abs(yRes[i] - pred);
      w[i] = sampleW[i] / Math.sqrt(r * r + epsL1 * epsL1);
    }
  }

  const beta = new Array(p).fill(0);
  let interceptShift = 0;
  for (let j = 1; j < p; j++) {
    if (!activeCol[j]) continue;
    beta[j] = gamma[j] / scales[j];
    interceptShift += beta[j] * means[j];
  }
  beta[0] = gamma[0] - interceptShift;
  return beta;
}

function fitHuberPrecipRidge(X, yBin, sampleW, lam = 45, delta = 0.78, iters = 5) {
  const n = X.length;
  const p = X[0].length;
  const w = Float64Array.from(sampleW);
  let beta = new Array(p).fill(0);

  for (let it = 0; it < iters; it++) {
    const XtWX = Array.from({ length: p }, () => new Float64Array(p));
    const XtWy = new Float64Array(p);
    for (let i = 0; i < n; i++) {
      const wi = w[i];
      const xi = X[i];
      const yi = yBin[i];
      for (let j = 0; j < p; j++) {
        const wxj = wi * xi[j];
        XtWy[j] += wxj * yi;
        for (let k = j; k < p; k++) XtWX[j][k] += wxj * xi[k];
      }
    }
    for (let j = 0; j < p; j++) {
      for (let k = 0; k < j; k++) XtWX[j][k] = XtWX[k][j];
      if (j > 0) XtWX[j][j] += lam;
      else XtWX[j][j] += 1e-6;
    }
    beta = solveLinearSystem(XtWX, XtWy);
    for (let i = 0; i < n; i++) {
      let pred = 0;
      const xi = X[i];
      for (let j = 0; j < p; j++) pred += xi[j] * beta[j];
      const r = Math.abs(yBin[i] - pred);
      w[i] = sampleW[i] * (r <= delta ? 1.0 : delta / r);
    }
  }
  return beta;
}

function fitObliviousL1Trees(FTree, residuals, nTrees = 28, lr = 0.12, minLeaf = 40, useMean = false) {
  const n = FTree.length;
  if (n < 200 || nTrees <= 0) return [];
  const m = FTree[0].length;
  const curRes = Float64Array.from(residuals);
  const candidateThresholds = Array.from({ length: m }, (_, fIdx) => {
    const col = FTree.map((r) => r[fIdx]).sort((a, b) => a - b);
    const uniq = [];
    for (const q of [0.15, 0.30, 0.50, 0.70, 0.85]) {
      const v = Number(col[Math.floor(q * (col.length - 1))].toFixed(4));
      if (!uniq.includes(v)) uniq.push(v);
    }
    return uniq;
  });

  const trees = [];
  for (let t = 0; t < nTrees; t++) {
    const splits = [];
    const leafAssign = new Uint8Array(n);
    for (let depth = 0; depth < 3; depth++) {
      let bestGain = -1;
      let bestF = 0;
      let bestThr = 0;
      const nBuckets = 1 << depth;
      for (let fIdx = 0; fIdx < m; fIdx++) {
        for (const thr of candidateThresholds[fIdx]) {
          const sumL = new Float64Array(nBuckets);
          const cntL = new Int32Array(nBuckets);
          const sumR = new Float64Array(nBuckets);
          const cntR = new Int32Array(nBuckets);
          for (let i = 0; i < n; i++) {
            const b = leafAssign[i];
            if (FTree[i][fIdx] > thr) {
              sumR[b] += curRes[i];
              cntR[b]++;
            } else {
              sumL[b] += curRes[i];
              cntL[b]++;
            }
          }
          let gain = 0;
          for (let b = 0; b < nBuckets; b++) {
            if (cntL[b] >= minLeaf && cntR[b] >= minLeaf) {
              gain += (sumL[b] * sumL[b]) / cntL[b] + (sumR[b] * sumR[b]) / cntR[b];
            }
          }
          if (gain > bestGain) {
            bestGain = gain;
            bestF = fIdx;
            bestThr = thr;
          }
        }
      }
      splits.push([bestF, bestThr]);
      for (let i = 0; i < n; i++) {
        leafAssign[i] = (leafAssign[i] << 1) | (FTree[i][bestF] > bestThr ? 1 : 0);
      }
    }
    const buckets = Array.from({ length: 8 }, () => []);
    for (let i = 0; i < n; i++) buckets[leafAssign[i]].push(curRes[i]);
    const leaves = buckets.map((arr) => {
      if (arr.length < minLeaf) return 0;
      if (useMean) {
        const mn = arr.reduce((a, b) => a + b, 0) / arr.length;
        return Number((lr * mn * (arr.length / (arr.length + 50))).toFixed(5));
      }
      arr.sort((a, b) => a - b);
      return Number((lr * medianSorted(arr) * (arr.length / (arr.length + 45))).toFixed(5));
    });
    for (let i = 0; i < n; i++) curRes[i] -= leaves[leafAssign[i]];
    trees.push({ s: splits, l: leaves });
  }
  return trees;
}

function evalEmos(beta, trees, xLin, fTree) {
  let pred = 0;
  for (let j = 0; j < beta.length; j++) pred += xLin[j] * beta[j];
  for (const tr of trees) {
    let idx = 0;
    for (const [fIdx, thr] of tr.s) idx = (idx << 1) | (fTree[fIdx] > thr ? 1 : 0);
    pred += tr.l[idx] ?? 0;
  }
  return pred;
}

async function loadMeteostatStation(cacheDir, st) {
  await fs.mkdir(cacheDir, { recursive: true });
  const map = {};
  for (const yr of [2024, 2025, 2026]) {
    const cachePath = path.join(cacheDir, `meteostat_${st}_${yr}.csv`);
    let txt = null;
    try {
      txt = await fs.readFile(cachePath, 'utf8');
    } catch {
      const res = await fetch(`https://bulk.meteostat.net/v2/hourly/${yr}/${st}.csv.gz`, {
        headers: { 'User-Agent': HTTP_UA },
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) {
        txt = zlib.gunzipSync(Buffer.from(await res.arrayBuffer())).toString('utf8');
        await fs.writeFile(cachePath, txt, 'utf8');
      }
    }
    if (!txt) continue;
    for (const line of txt.split('\n')) {
      if (!line.trim()) continue;
      const c = line.split(',');
      if (c.length < 11 || c[2] === '') continue;
      const iso = `${c[0]}T${c[1].padStart(2, '0')}:00`;
      const temp = Number(c[2]);
      if (!Number.isFinite(temp)) continue;
      map[iso] = {
        temp,
        dwpt: c[3] !== '' ? Number(c[3]) : null,
        rhum: c[4] !== '' ? Number(c[4]) : null,
        prcp: c[5] !== '' ? Math.max(0, Number(c[5])) : 0,
        wdir: c[7] !== '' ? Number(c[7]) : 0,
        wspd: c[8] !== '' ? Number(c[8]) : 0,
        pres: c[10] !== '' ? Number(c[10]) : 1015,
      };
    }
  }
  return map;
}

async function loadTwoYearArchive(cacheDir) {
  const [map17116, mapLtbr] = await Promise.all([
    loadMeteostatStation(cacheDir, '17116'),
    loadMeteostatStation(cacheDir, 'LTBR0'),
  ]);

  const tpVars = LEAD_DAYS.flatMap((d) => [
    d === 0 ? 'temperature_2m' : `temperature_2m_previous_day${d}`,
    d === 0 ? 'precipitation' : `precipitation_previous_day${d}`,
  ]).join(',');

  const tpSeries = Object.fromEntries(MODEL_APIS.map((m) => [m, {}]));
  for (const m of MODEL_APIS) {
    for (const [s, e] of ALL_CHUNKS) {
      const url =
        `https://previous-runs-api.open-meteo.com/v1/forecast?latitude=${BURSA_17116.lat}&longitude=${BURSA_17116.lon}` +
        `&elevation=${BURSA_17116.elevM}&start_date=${s}&end_date=${e}&hourly=${tpVars}&timezone=GMT&models=${m}`;
      const j = await fetchJsonCached(cacheDir, `tp_${m}_${s}_${e}.json`, url);
      const h = j.hourly;
      for (let i = 0; i < h.time.length; i++) {
        const t = h.time[i];
        const rec = {};
        for (const d of LEAD_DAYS) {
          const tk = d === 0 ? 'temperature_2m' : `temperature_2m_previous_day${d}`;
          const pk = d === 0 ? 'precipitation' : `precipitation_previous_day${d}`;
          rec[`t_${d}`] = (h[`${tk}_${m}`] ?? h[tk])?.[i] ?? null;
          rec[`p_${d}`] = (h[`${pk}_${m}`] ?? h[pk])?.[i] ?? null;
        }
        tpSeries[m][t] = rec;
      }
    }
  }

  const physModels = ['ecmwf_ifs025', 'ecmwf_aifs025_single', 'icon_seamless'];
  const pNames = ['dew_point_2m', 'wind_speed_10m', 'wind_direction_10m', 'cloud_cover', 'pressure_msl'];
  const physVars = pNames
    .flatMap((v) => LEAD_DAYS.map((d) => (d === 0 ? v : `${v}_previous_day${d}`)))
    .join(',');
  const physSeries = Object.fromEntries(physModels.map((m) => [m, {}]));
  for (const pm of physModels) {
    for (const [s, e] of ALL_CHUNKS) {
      const url =
        `https://previous-runs-api.open-meteo.com/v1/forecast?latitude=${BURSA_17116.lat}&longitude=${BURSA_17116.lon}` +
        `&elevation=${BURSA_17116.elevM}&start_date=${s}&end_date=${e}&hourly=${physVars}&timezone=GMT&models=${pm}`;
      const j = await fetchJsonCached(cacheDir, `phys_${pm}_${s}_${e}.json`, url);
      const h = j.hourly;
      for (let i = 0; i < h.time.length; i++) {
        const t = h.time[i];
        const rec = {};
        for (const d of LEAD_DAYS) {
          for (const v of pNames) {
            const vk = d === 0 ? v : `${v}_previous_day${d}`;
            rec[`${v}_${d}`] = (h[`${vk}_${pm}`] ?? h[vk])?.[i] ?? null;
          }
        }
        physSeries[pm][t] = rec;
      }
    }
  }

  const radVars = LEAD_DAYS.map((d) =>
    d === 0 ? 'shortwave_radiation' : `shortwave_radiation_previous_day${d}`,
  ).join(',');
  const radSeries = {};
  for (const [s, e] of ALL_CHUNKS) {
    const url =
      `https://previous-runs-api.open-meteo.com/v1/forecast?latitude=${BURSA_17116.lat}&longitude=${BURSA_17116.lon}` +
      `&elevation=${BURSA_17116.elevM}&start_date=${s}&end_date=${e}&hourly=${radVars}&timezone=GMT&models=ecmwf_ifs025`;
    const j = await fetchJsonCached(cacheDir, `rad_ecmwf_ifs025_${s}_${e}.json`, url);
    const h = j.hourly;
    for (let i = 0; i < h.time.length; i++) {
      const t = h.time[i];
      const rec = {};
      for (const d of LEAD_DAYS) {
        const vk = d === 0 ? 'shortwave_radiation' : `shortwave_radiation_previous_day${d}`;
        rec[`rad_${d}`] = (h[`${vk}_ecmwf_ifs025`] ?? h[vk])?.[i] ?? null;
      }
      radSeries[t] = rec;
    }
  }

  const times = Object.keys(map17116)
    .filter((iso) => iso >= '2024-04-01T00:00' && iso <= '2026-03-29T23:00')
    .sort();

  return { times, map17116, mapLtbr, tpSeries, physSeries, radSeries };
}

function buildSyntheticSelfTest() {
  const N = 24 * 60;
  const times = [];
  const map17116 = {};
  const mapLtbr = {};
  const tpSeries = Object.fromEntries(MODEL_APIS.map((k) => [k, {}]));
  const physSeries = Object.fromEntries(['ecmwf_ifs025', 'ecmwf_aifs025_single', 'icon_seamless'].map((k) => [k, {}]));
  const radSeries = {};
  const startMs = Date.UTC(2025, 9, 1, 0, 0, 0);
  for (let i = 0; i < N; i++) {
    const dt = new Date(startMs + i * 3600000);
    const iso = dt.toISOString().slice(0, 16);
    times.push(iso);
    const trtH = (dt.getUTCHours() + 3) % 24;
    const baseT = 13 + 4.5 * Math.cos(((trtH - 15) * Math.PI) / 12) + 2.2 * Math.sin(i / 36);
    const prcp = i % 19 === 0 ? 1.5 : 0;
    map17116[iso] = { temp: baseT, prcp, wspd: 6, wdir: 210, pres: 1016 };
    mapLtbr[iso] = { temp: trtH >= 21 || trtH <= 6 ? baseT - 3.6 : baseT - 0.6, prcp };
    for (const api of MODEL_APIS) {
      const saw = api.includes('aifs') && trtH === 12 ? -1.6 : -0.5;
      const rec = {};
      for (const d of LEAD_DAYS) {
        rec[`t_${d}`] = baseT + saw + (0.3 + 0.15 * d) * Math.sin(i * 0.5 + d);
        rec[`p_${d}`] = prcp > 0 ? 1.2 : i % 11 === 0 && api === 'gfs_seamless' ? 0.22 : 0;
      }
      tpSeries[api][iso] = rec;
    }
    for (const pm of ['ecmwf_ifs025', 'ecmwf_aifs025_single', 'icon_seamless']) {
      const prec = {};
      for (const d of LEAD_DAYS) {
        prec[`dew_point_2m_${d}`] = baseT - (prcp > 0 ? 1.5 : 6.0);
        prec[`wind_speed_10m_${d}`] = 10;
        prec[`wind_direction_10m_${d}`] = 205;
        prec[`cloud_cover_${d}`] = prcp > 0 ? 92 : 25;
        prec[`pressure_msl_${d}`] = 1016;
      }
      physSeries[pm][iso] = prec;
    }
    const rrec = {};
    for (const d of LEAD_DAYS) rrec[`rad_${d}`] = trtH >= 8 && trtH <= 17 ? 380 : 0;
    radSeries[iso] = rrec;
  }
  return { times, map17116, mapLtbr, tpSeries, physSeries, radSeries };
}

function computeSkillPriorBackbone(vecT, d, hasAifs) {
  let priors;
  if (d <= 1) {
    priors = hasAifs
      ? [0.24, 0.14, 0.25, 0.11, 0.13, 0.04, 0.05, 0.04]
      : [0.33, 0.00, 0.28, 0.13, 0.14, 0.04, 0.04, 0.04];
  } else if (d <= 3) {
    priors = hasAifs
      ? [0.24, 0.25, 0.18, 0.11, 0.09, 0.04, 0.05, 0.04]
      : [0.40, 0.00, 0.23, 0.14, 0.10, 0.04, 0.05, 0.04];
  } else if (d <= 6) {
    priors = hasAifs
      ? [0.26, 0.35, 0.13, 0.11, 0.05, 0.05, 0.05]
      : [0.48, 0.00, 0.18, 0.15, 0.06, 0.07, 0.06];
  } else {
    priors = hasAifs
      ? [0.28, 0.44, 0.08, 0.10, 0.10]
      : [0.56, 0.00, 0.14, 0.15, 0.15];
  }
  let s = 0;
  let w = 0;
  for (let i = 0; i < vecT.length; i++) {
    s += vecT[i] * priors[i];
    w += priors[i];
  }
  return w > 0 ? s / w : vecT[0];
}

function buildHorizonDesignMatrix(data, d) {
  const { times, tpSeries, physSeries, radSeries } = data;
  const N = times.length;

  const rawSteps = times.map((iso) => {
    const ifs = tpSeries.ecmwf_ifs[iso]?.[`t_${d}`] ?? tpSeries.ecmwf_ifs025[iso]?.[`t_${d}`] ?? null;
    const aifsRaw = tpSeries.ecmwf_aifs025_single[iso]?.[`t_${d}`] ?? null;
    const hasAifs = typeof aifsRaw === 'number' && Number.isFinite(aifsRaw);
    const aifs = hasAifs ? aifsRaw : ifs;
    const icon = tpSeries.icon_seamless[iso]?.[`t_${d}`] ?? tpSeries.icon_global[iso]?.[`t_${d}`] ?? null;
    const ukmo = tpSeries.ukmo_seamless[iso]?.[`t_${d}`] ?? null;
    const mf = tpSeries.meteofrance_seamless[iso]?.[`t_${d}`] ?? null;
    const gfs = tpSeries.gfs_seamless[iso]?.[`t_${d}`] ?? null;
    const gem = tpSeries.gem_seamless[iso]?.[`t_${d}`] ?? null;
    const jma = tpSeries.jma_seamless[iso]?.[`t_${d}`] ?? null;

    const rawModels =
      d <= 3
        ? [ifs, aifs, icon, ukmo, mf, gfs, gem, jma]
        : d <= 6
          ? [ifs, aifs, icon, ukmo, gfs, gem, jma]
          : [ifs, aifs, gfs, gem, jma];

    const validT = rawModels.filter((x) => typeof x === 'number' && Number.isFinite(x)).sort((a, b) => a - b);
    const medT = validT.length >= 2 ? medianSorted(validT) : null;
    const vecT = medT !== null ? rawModels.map((x) => (typeof x === 'number' && Number.isFinite(x) ? x : medT)) : null;

    const pIfs = tpSeries.ecmwf_ifs[iso]?.[`p_${d}`] ?? tpSeries.ecmwf_ifs025[iso]?.[`p_${d}`] ?? null;
    const pAifs = tpSeries.ecmwf_aifs025_single[iso]?.[`p_${d}`] ?? pIfs;
    const pModelsRaw =
      d <= 3
        ? [
            pIfs,
            pAifs,
            tpSeries.icon_seamless[iso]?.[`p_${d}`] ?? tpSeries.icon_global[iso]?.[`p_${d}`],
            tpSeries.ukmo_seamless[iso]?.[`p_${d}`],
            tpSeries.meteofrance_seamless[iso]?.[`p_${d}`],
            tpSeries.gfs_seamless[iso]?.[`p_${d}`],
            tpSeries.gem_seamless[iso]?.[`p_${d}`],
            tpSeries.jma_seamless[iso]?.[`p_${d}`],
          ]
        : d <= 6
          ? [
              pIfs,
              pAifs,
              tpSeries.icon_seamless[iso]?.[`p_${d}`] ?? tpSeries.icon_global[iso]?.[`p_${d}`],
              tpSeries.ukmo_seamless[iso]?.[`p_${d}`],
              tpSeries.gfs_seamless[iso]?.[`p_${d}`],
              tpSeries.gem_seamless[iso]?.[`p_${d}`],
              tpSeries.jma_seamless[iso]?.[`p_${d}`],
            ]
          : [
              pIfs,
              pAifs,
              tpSeries.gfs_seamless[iso]?.[`p_${d}`],
              tpSeries.gem_seamless[iso]?.[`p_${d}`],
              tpSeries.jma_seamless[iso]?.[`p_${d}`],
            ];

    const pValid = pModelsRaw.filter((x) => typeof x === 'number' && Number.isFinite(x)).map((x) => Math.max(0, x)).sort((a, b) => a - b);
    const pMed = pValid.length ? medianSorted(pValid) : 0;
    const pVec = pModelsRaw.map((x) => (typeof x === 'number' && Number.isFinite(x) ? Math.max(0, x) : pMed));

    const getPhysAvg = (vName, fallback) => {
      const vals = [];
      for (const pm of ['ecmwf_ifs025', 'ecmwf_aifs025_single', 'icon_seamless']) {
        if (d === 7 && pm === 'icon_seamless') continue;
        const v = physSeries[pm][iso]?.[`${vName}_${d}`];
        if (typeof v === 'number' && Number.isFinite(v)) vals.push(v);
      }
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : fallback;
    };

    const dewC = getPhysAvg('dew_point_2m', (medT ?? 12) - 5);
    const cloudPct = Math.max(0, Math.min(100, getPhysAvg('cloud_cover', 40)));
    const presHpa = getPhysAvg('pressure_msl', 1015);

    let uSum = 0;
    let vSum = 0;
    let sSum = 0;
    let wCnt = 0;
    for (const pm of ['ecmwf_ifs025', 'ecmwf_aifs025_single', 'icon_seamless']) {
      if (d === 7 && pm === 'icon_seamless') continue;
      const ws = physSeries[pm][iso]?.[`wind_speed_10m_${d}`];
      const wd = physSeries[pm][iso]?.[`wind_direction_10m_${d}`];
      if (typeof ws === 'number' && typeof wd === 'number') {
        const rad = (wd * Math.PI) / 180;
        uSum += -ws * Math.sin(rad);
        vSum += -ws * Math.cos(rad);
        sSum += ws;
        wCnt++;
      }
    }
    const windSpdKmh = wCnt > 0 ? sSum / wCnt : 8;
    const windDirDeg = wCnt > 0 ? ((Math.atan2(-uSum / wCnt, -vSum / wCnt) * 180) / Math.PI + 360) % 360 : 0;
    const swRad = Math.max(0, radSeries[iso]?.[`rad_${d}`] ?? 0);

    return { vecT, hasAifs, pVec, dewC, cloudPct, presHpa, windSpdKmh, windDirDeg, swRad };
  });

  const backbones = rawSteps.map((s) => (s.vecT ? computeSkillPriorBackbone(s.vecT, d, s.hasAifs) : 15));
  const presArr = rawSteps.map((s) => s.presHpa);
  const pMeds = rawSteps.map((s) => medianSorted([...s.pVec].sort((a, b) => a - b)));

  const backboneAll = Float64Array.from(backbones);
  const xResAll = new Array(N);
  const fTreeAll = new Array(N);
  const pFeatAll = new Array(N);
  const hasAifsAll = new Uint8Array(N);

  for (let i = 0; i < N; i++) {
    const s = rawSteps[i];
    if (!s.vecT) continue;
    hasAifsAll[i] = s.hasAifs ? 1 : 0;

    const bb = backboneAll[i];
    const sv = [...s.vecT].sort((a, b) => a - b);
    const vecMed = medianSorted(sv);
    const trimMean =
      sv.length >= 4 ? sv.slice(1, -1).reduce((a, b) => a + b, 0) / (sv.length - 2) : vecMed;
    const spread = sv[sv.length - 1] - sv[0];
    const modelDevs = s.vecT.map((v) => v - bb);
    const smooth5h =
      (backbones[Math.max(0, i - 2)] +
        2 * backbones[Math.max(0, i - 1)] +
        3 * bb +
        2 * backbones[Math.min(N - 1, i + 1)] +
        backbones[Math.min(N - 1, i + 2)]) /
      9;

    const pLen = s.pVec.length;
    const wetInd = s.pVec.filter((v) => v >= 0.2).length / pLen;
    const pMean = s.pVec.reduce((a, b) => a + b, 0) / pLen;

    const dt1 = backbones[Math.min(N - 1, i + 1)] - backbones[Math.max(0, i - 1)];
    const dt3 = bb - backbones[Math.max(0, i - 3)];
    const curv = backbones[Math.min(N - 1, i + 3)] - 2 * bb + backbones[Math.max(0, i - 3)];
    const win = backbones.slice(Math.max(0, i - 12), Math.min(N, i + 13));
    const min24 = Math.min(...win);
    const max24 = Math.max(...win);
    const dtr = Math.max(0.5, max24 - min24);
    const relPos = (bb - min24) / dtr;

    const dewDep = Math.max(0, Math.min(28, bb - s.dewC));
    const cloudFrac = s.cloudPct / 100;
    const windMs = s.windSpdKmh / 3.6;
    const lodosProjMs = Math.max(0, windMs * Math.cos(((s.windDirDeg - 210) * Math.PI) / 180));
    const poyrazProjMs = Math.max(0, windMs * Math.cos(((s.windDirDeg - 35) * Math.PI) / 180));
    const calmFactor = 1 / Math.sqrt(1 + (windMs / 2.2) ** 2);
    const presAnom = (s.presHpa - 1015) / 10;
    const dp3h = s.presHpa - presArr[Math.max(0, i - 3)];

    const dt = new Date(`${times[i]}:00Z`);
    const utcH = dt.getUTCHours();
    const trtH = (utcH + 3) % 24;
    const doy = Math.max(1, Math.floor((dt.getTime() - Date.UTC(dt.getUTCFullYear(), 0, 1)) / 86400000) + 1);
    const sinE = solarSinElevBursa(doy, utcH);
    const clearNightIdx = (1 - 0.8 * cloudFrac * cloudFrac) * Math.max(0, -sinE) * calmFactor;
    const solarHeatIdx = (s.swRad / 800) * (0.4 + 0.6 * calmFactor);
    const aifsSaw = s.hasAifs ? Math.cos((2 * Math.PI * utcH) / 6) : 0;
    const aifsDiff = s.hasAifs && s.vecT.length > 1 ? s.vecT[1] - s.vecT[0] : 0;

    const sinY = Math.sin((2 * Math.PI * doy) / 365.25);
    const cosY = Math.cos((2 * Math.PI * doy) / 365.25);
    const sinH1 = Math.sin((2 * Math.PI * trtH) / 24);
    const cosH1 = Math.cos((2 * Math.PI * trtH) / 24);
    const sinH2 = Math.sin((4 * Math.PI * trtH) / 24);
    const cosH2 = Math.cos((4 * Math.PI * trtH) / 24);
    const hOh = Array.from({ length: 24 }, (_, h) => (trtH === h ? 1 : 0));

    xResAll[i] = [
      1.0,
      ...modelDevs,
      vecMed - bb,
      trimMean - bb,
      smooth5h - bb,
      spread,
      dt1,
      dt3,
      curv,
      dtr / 10,
      relPos,
      sinE,
      Math.max(0, sinE),
      wetInd,
      aifsDiff,
      aifsSaw,
      dewDep / 10,
      cloudFrac,
      windMs / 5,
      lodosProjMs / 5,
      poyrazProjMs / 5,
      clearNightIdx,
      solarHeatIdx,
      presAnom,
      dp3h / 5,
      sinY,
      cosY,
      sinY * sinH1,
      sinY * cosH1,
      cosY * sinH1,
      cosY * cosH1,
      sinY * sinH2,
      cosY * cosH2,
      (dtr * cosH1) / 10,
      (dtr * sinH1) / 10,
      bb / 25,
      (bb * sinY) / 25,
      (bb * cosY) / 25,
      ...hOh,
    ];

    fTreeAll[i] = [
      bb,
      spread,
      dt1,
      dt3,
      dtr,
      relPos,
      trtH,
      doy,
      sinE,
      wetInd,
      aifsDiff,
      pMean,
      dewDep,
      cloudFrac,
      lodosProjMs,
      poyrazProjMs,
      clearNightIdx,
      dp3h,
    ];

    const sp = [...s.pVec].sort((a, b) => a - b);
    const q50 = medianSorted(sp);
    const q75 = sp[Math.min(sp.length - 1, Math.floor(sp.length * 0.75))];
    const qMax = sp[sp.length - 1];

    let winMaxMed = pMeds[i];
    let winSumMed = 0;
    let winCnt = 0;
    let winWetAny = 0;
    for (let k = Math.max(0, i - 2); k <= Math.min(N - 1, i + 2); k++) {
      winMaxMed = Math.max(winMaxMed, pMeds[k]);
      winSumMed += pMeds[k];
      winCnt++;
      const kp = rawSteps[k].pVec;
      const stepWet = kp.filter((v) => v >= 0.2).length / kp.length;
      winWetAny = Math.max(winWetAny, stepWet);
    }
    const winMeanMed = winSumMed / Math.max(1, winCnt);
    const winGate = d <= 1 ? 0.0 : d <= 3 ? 0.2 : 1.0;

    pFeatAll[i] = [
      1.0,
      ...s.pVec.map((v) => Math.sqrt(v)),
      s.pVec.filter((v) => v >= 0.14).length / pLen,
      s.pVec.filter((v) => v >= 0.32).length / pLen,
      s.pVec.filter((v) => v >= 0.68).length / pLen,
      q50,
      q75,
      qMax,
      winGate * Math.sqrt(winMaxMed),
      winGate * Math.sqrt(winMeanMed),
      winGate * winWetAny,
      cloudFrac,
      Math.min(2.0, dewDep / 8),
      Math.min(1.5, Math.max(-1.5, dp3h / 3)),
      lodosProjMs / 8,
      poyrazProjMs / 8,
    ];
  }

  return { backboneAll, xResAll, fTreeAll, pFeatAll, hasAifsAll };
}

function evaluateTwoYearBenchmark(data, isSelfTest = false) {
  const N = data.times.length;
  const evalStartIdx = isSelfTest
    ? 0
    : Math.max(0, data.times.findIndex((t) => t >= '2025-04-01T00:00'));
  const evalLen = N - evalStartIdx;
  const nFolds = 5;
  const foldSize = Math.ceil(evalLen / nFolds);
  const purgeGapH = isSelfTest ? 48 : 168;

  // 1. LTBR Yenişehir Station Trap Audit across evaluation window
  let ltAe = 0;
  let ltSq = 0;
  let ltCnt = 0;
  let nightBiasSum = 0;
  let nightOver2 = 0;
  let nightOver4 = 0;
  let nightCnt = 0;

  for (let i = evalStartIdx; i < N; i++) {
    const iso = data.times[i];
    const bObs = data.map17116[iso];
    const lObs = data.mapLtbr[iso];
    if (!bObs || !lObs) continue;
    const lapseAdjusted = lObs.temp + 0.0065 * 133;
    const err = lapseAdjusted - bObs.temp;
    ltAe += Math.abs(err);
    ltSq += err * err;
    ltCnt++;
    const trtH = (Number(iso.slice(11, 13)) + 3) % 24;
    if ((trtH >= 22 || trtH <= 6) && (bObs.wspd ?? 0) <= 7 && (bObs.prcp ?? 0) === 0) {
      nightBiasSum += err;
      if (Math.abs(err) >= 2.0) nightOver2++;
      if (Math.abs(err) >= 4.0) nightOver4++;
      nightCnt++;
    }
  }

  const stationTrapAudit = {
    evaluatedHours: ltCnt,
    overallMaeC: Number((ltAe / Math.max(1, ltCnt)).toFixed(2)),
    overallRmseC: Number(Math.sqrt(ltSq / Math.max(1, ltCnt)).toFixed(2)),
    clearCalmNightBiasC: Number((nightBiasSum / Math.max(1, nightCnt)).toFixed(2)),
    clearNightOver2CPct: Number(((100 * nightOver2) / Math.max(1, nightCnt)).toFixed(1)),
    clearNightOver4CPct: Number(((100 * nightOver4) / Math.max(1, nightCnt)).toFixed(1)),
  };

  // 2. Raw Model MAE by Lead Day
  const rawModelMaeByLead = {};
  for (const m of ['ecmwf_ifs', 'ecmwf_aifs025_single', 'icon_seamless', 'ukmo_seamless', 'meteofrance_seamless', 'gfs_seamless', 'gem_seamless', 'jma_seamless']) {
    rawModelMaeByLead[m] = {};
    for (const d of LEAD_DAYS) {
      let ae = 0;
      let bSum = 0;
      let c = 0;
      for (let i = evalStartIdx; i < N; i++) {
        const iso = data.times[i];
        const obs = data.map17116[iso];
        const mt = data.tpSeries[m][iso]?.[`t_${d}`];
        if (obs && typeof mt === 'number' && Number.isFinite(mt)) {
          ae += Math.abs(mt - obs.temp);
          bSum += mt - obs.temp;
          c++;
        }
      }
      rawModelMaeByLead[m][`day_${d}`] = c > 100
        ? { maeC: Number((ae / c).toFixed(3)), biasC: Number((bSum / c).toFixed(2)), n: c }
        : null;
    }
  }

  // 3. 5-Fold 168h-Purged Out-of-Sample CV across all 8 Lead Days (Day 0 .. Day 7)
  const oofPreds = {};
  const summaryByLead = {};

  for (const d of LEAD_DAYS) {
    const { backboneAll, xResAll, fTreeAll, pFeatAll, hasAifsAll } = buildHorizonDesignMatrix(data, d);
    const oofT = new Float64Array(N).fill(NaN);
    const oofWet = new Uint8Array(N);

    const lam = d === 0 ? 140 : d === 1 ? 240 : d === 2 ? 380 : d === 3 ? 600 : d <= 5 ? 1100 : 1800;
    const nTrees = isSelfTest ? 6 : d <= 1 ? 30 : d === 2 ? 22 : d === 3 ? 16 : d <= 5 ? 10 : 6;
    const lr = d <= 2 ? 0.12 : 0.085;
    const pLam = d <= 2 ? 40 : d <= 5 ? 95 : 180;
    const pNTrees = isSelfTest ? 4 : d <= 2 ? 12 : d <= 5 ? 8 : 6;

    for (let fold = 0; fold < nFolds; fold++) {
      const testStart = evalStartIdx + fold * foldSize;
      const testEnd = Math.min(N, testStart + foldSize);
      const Xtr = [];
      const Ftr = [];
      const yResTr = [];
      const swTr = [];
      const Ptr = [];
      const wtr = [];

      for (let i = 24; i < N; i++) {
        if (i >= testStart - purgeGapH && i < testEnd + purgeGapH) continue;
        const obs = data.map17116[data.times[i]];
        if (!xResAll[i] || typeof obs?.temp !== 'number') continue;
        Xtr.push(xResAll[i]);
        Ftr.push(fTreeAll[i]);
        yResTr.push(obs.temp - backboneAll[i]);
        swTr.push(hasAifsAll[i] ? 1.65 : 0.90);
        Ptr.push(pFeatAll[i]);
        wtr.push((obs.prcp ?? 0) >= 0.2 ? 1 : 0);
      }

      const beta = fitWeightedStandardizedResidualL1Ridge(Xtr, yResTr, swTr, lam, 0.50, 8);
      const res = Xtr.map((xi, idx) => {
        let p = 0;
        for (let j = 0; j < beta.length; j++) p += xi[j] * beta[j];
        return yResTr[idx] - p;
      });
      const trees = fitObliviousL1Trees(Ftr, res, nTrees, lr, isSelfTest ? 15 : d <= 3 ? 45 : 70, false);

      const pBeta = fitHuberPrecipRidge(Ptr, wtr, swTr, pLam, 0.78, 5);
      const pRes = Ptr.map((pi, idx) => {
        let s = 0;
        for (let j = 0; j < pBeta.length; j++) s += pi[j] * pBeta[j];
        return wtr[idx] - s;
      });
      const pTrees = fitObliviousL1Trees(Ptr, pRes, pNTrees, 0.13, isSelfTest ? 15 : 55, true);

      let bestFoldThr = 0.34;
      let bestFoldObj = -1;
      const trScores = Ptr.map((pi) => evalEmos(pBeta, pTrees, pi, pi));
      const farCap = d <= 1 ? 0.42 : d <= 3 ? 0.45 : d <= 5 ? 0.51 : 0.56;
      for (let thr = 0.22; thr <= 0.48; thr += 0.005) {
        let h = 0;
        let fa = 0;
        let m = 0;
        for (let k = 0; k < trScores.length; k++) {
          if (!isSelfTest && swTr[k] < 1.2) continue;
          const pw = trScores[k] >= thr;
          const ow = wtr[k] === 1;
          if (pw && ow) h++;
          else if (pw && !ow) fa++;
          else if (!pw && ow) m++;
        }
        const csi = h / Math.max(1, h + fa + m);
        const far = fa / Math.max(1, h + fa);
        const obj = csi - Math.max(0, far - farCap) * 0.15;
        if (obj > bestFoldObj) {
          bestFoldObj = obj;
          bestFoldThr = Number(thr.toFixed(3));
        }
      }

      for (let i = testStart; i < testEnd; i++) {
        if (!xResAll[i]) continue;
        oofT[i] = backboneAll[i] + evalEmos(beta, trees, xResAll[i], fTreeAll[i]);
        oofWet[i] = evalEmos(pBeta, pTrees, pFeatAll[i], pFeatAll[i]) >= bestFoldThr ? 1 : 0;
      }
    }

    let ifsAe = 0;
    let ifsSq = 0;
    let ifsS1 = 0;
    let ifsS2 = 0;
    let ifsH = 0;
    let ifsFa = 0;
    let ifsM = 0;
    let v5Ae = 0;
    let v5Sq = 0;
    let v5S1 = 0;
    let v5S2 = 0;
    let v5H = 0;
    let v5Fa = 0;
    let v5M = 0;
    let cnt = 0;

    for (let i = evalStartIdx + Math.max(48, d * 24 + 24); i < N; i++) {
      const iso = data.times[i];
      const obs = data.map17116[iso];
      if (!obs || !Number.isFinite(oofT[i])) continue;

      let predT = oofT[i];
      if (d === 1) {
        const originIdx = i - 24;
        let resSum = 0;
        let resW = 0;
        const targetUtcH = i % 24;
        for (let k = Math.max(evalStartIdx, originIdx - 48); k < originIdx; k++) {
          const kObs = data.map17116[data.times[k]]?.temp;
          const kBase = oofPreds[0]?.[k];
          if (typeof kObs === 'number' && Number.isFinite(kBase)) {
            const ageH = originIdx - k;
            const wk = Math.exp(-ageH / 28) * (k % 24 === targetUtcH ? 2.5 : 1.0);
            resSum += wk * (kObs - kBase);
            resW += wk;
          }
        }
        if (resW > 2.0) predT += 0.16 * Math.max(-2.2, Math.min(2.2, resSum / resW));
      }
      oofT[i] = predT;

      const ifsT = data.tpSeries.ecmwf_ifs[iso]?.[`t_${d}`] ?? data.tpSeries.ecmwf_ifs025[iso]?.[`t_${d}`] ?? predT;
      const ifsP = (data.tpSeries.ecmwf_ifs[iso]?.[`p_${d}`] ?? data.tpSeries.ecmwf_ifs025[iso]?.[`p_${d}`] ?? 0) >= 0.2;
      const obsWet = (obs.prcp ?? 0) >= 0.2;

      const eIfs = Math.abs(ifsT - obs.temp);
      ifsAe += eIfs;
      ifsSq += eIfs * eIfs;
      if (eIfs < 1.0) ifsS1++;
      if (eIfs < 2.0) ifsS2++;
      if (ifsP && obsWet) ifsH++;
      else if (ifsP && !obsWet) ifsFa++;
      else if (!ifsP && obsWet) ifsM++;

      const eV5 = Math.abs(predT - obs.temp);
      v5Ae += eV5;
      v5Sq += eV5 * eV5;
      if (eV5 < 1.0) v5S1++;
      if (eV5 < 2.0) v5S2++;
      const pWet = oofWet[i] === 1;
      if (pWet && obsWet) v5H++;
      else if (pWet && !obsWet) v5Fa++;
      else if (!pWet && obsWet) v5M++;
      cnt++;
    }

    oofPreds[d] = oofT;
    summaryByLead[`day_${d}`] = {
      RAW_IFS: {
        samples: cnt,
        maeC: Number((ifsAe / Math.max(1, cnt)).toFixed(3)),
        rmseC: Number(Math.sqrt(ifsSq / Math.max(1, cnt)).toFixed(3)),
        sub1HitPct: Number(((100 * ifsS1) / Math.max(1, cnt)).toFixed(1)),
        sub2HitPct: Number(((100 * ifsS2) / Math.max(1, cnt)).toFixed(1)),
        precipCSI: Number((ifsH / Math.max(1, ifsH + ifsFa + ifsM)).toFixed(3)),
        precipPOD: Number((ifsH / Math.max(1, ifsH + ifsM)).toFixed(3)),
        precipFAR: Number((ifsFa / Math.max(1, ifsH + ifsFa)).toFixed(3)),
      },
      ATMOS_V5_0_ZERO_DRIFT: {
        samples: cnt,
        maeC: Number((v5Ae / Math.max(1, cnt)).toFixed(3)),
        rmseC: Number(Math.sqrt(v5Sq / Math.max(1, cnt)).toFixed(3)),
        sub1HitPct: Number(((100 * v5S1) / Math.max(1, cnt)).toFixed(1)),
        sub2HitPct: Number(((100 * v5S2) / Math.max(1, cnt)).toFixed(1)),
        precipCSI: Number((v5H / Math.max(1, v5H + v5Fa + v5M)).toFixed(3)),
        precipPOD: Number((v5H / Math.max(1, v5H + v5M)).toFixed(3)),
        precipFAR: Number((v5Fa / Math.max(1, v5H + v5Fa)).toFixed(3)),
      },
    };
  }

  // 4. Intraday (+1h..+18h) PBL-Breakup-Aware AR(2) Accuracy
  const oof0 = oofPreds[0];
  const intradaySummary = {};
  for (const h of INTRADAY_LEADS_H) {
    let aeSum = 0;
    let sqSum = 0;
    let s1 = 0;
    let s2 = 0;
    let cnt = 0;
    for (let i = evalStartIdx + 24 + h; i < N; i++) {
      const obsTarget = data.map17116[data.times[i]]?.temp;
      const obsOrigin = data.map17116[data.times[i - h]]?.temp;
      const obs24 = data.map17116[data.times[i - 24]]?.temp;
      if (
        typeof obsTarget !== 'number' ||
        typeof obsOrigin !== 'number' ||
        !Number.isFinite(oof0[i]) ||
        !Number.isFinite(oof0[i - h])
      ) continue;

      const rNow = Math.max(-4.5, Math.min(4.5, obsOrigin - oof0[i - h]));
      const origTrt = (Number(data.times[i - h].slice(11, 13)) + 3) % 24;
      const targTrt = (Number(data.times[i].slice(11, 13)) + 3) % 24;
      const crossesMorningBreakup = (origTrt <= 8 || origTrt >= 22) && targTrt >= 11 && targTrt <= 17;
      const wNow = (crossesMorningBreakup ? 0.78 : 0.855) ** h;
      let pred = oof0[i] + wNow * rNow;
      if (typeof obs24 === 'number' && Number.isFinite(oof0[i - 24])) {
        pred += 0.22 * (1 - wNow) * Math.max(-3.5, Math.min(3.5, obs24 - oof0[i - 24]));
      }
      const ae = Math.abs(pred - obsTarget);
      aeSum += ae;
      sqSum += ae * ae;
      if (ae < 1.0) s1++;
      if (ae < 2.0) s2++;
      cnt++;
    }
    intradaySummary[`plus_${h}h`] = {
      samples: cnt,
      maeC: Number((aeSum / Math.max(1, cnt)).toFixed(3)),
      rmseC: Number(Math.sqrt(sqSum / Math.max(1, cnt)).toFixed(3)),
      sub1HitPct: Number(((100 * s1) / Math.max(1, cnt)).toFixed(1)),
      sub2HitPct: Number(((100 * s2) / Math.max(1, cnt)).toFixed(1)),
    };
  }

  // 5. Calibrated-vs-Calibrated Run Consistency Stability Audit (Day 2 -> Day 1 -> Day 0)
  let rawJump = 0;
  let v5Jump = 0;
  let rawBadFlips = 0;
  let v5BadFlips = 0;
  let stabCnt = 0;

  for (let i = evalStartIdx + 72; i < N; i++) {
    const iso = data.times[i];
    const obsT = data.map17116[iso]?.temp;
    const r2 = data.tpSeries.ecmwf_ifs[iso]?.t_2 ?? data.tpSeries.ecmwf_ifs025[iso]?.t_2;
    const r1 = data.tpSeries.ecmwf_ifs[iso]?.t_1 ?? data.tpSeries.ecmwf_ifs025[iso]?.t_1;
    const r0 = data.tpSeries.ecmwf_ifs[iso]?.t_0 ?? data.tpSeries.ecmwf_ifs025[iso]?.t_0;
    const p2 = oofPreds[2][i];
    let p1 = oofPreds[1][i];
    let p0 = oofPreds[0][i];

    if (
      typeof obsT !== 'number' ||
      r2 == null ||
      r1 == null ||
      r0 == null ||
      !Number.isFinite(p2) ||
      !Number.isFinite(p1) ||
      !Number.isFinite(p0)
    ) continue;

    // Calibrated-vs-calibrated hysteresis gate
    if (Math.abs(p1 - p2) >= 0.45 && Math.abs(r1 - r2) < 0.85) p1 = 0.72 * p2 + 0.28 * p1;
    if (Math.abs(p0 - p1) >= 0.45 && Math.abs(r0 - r1) < 0.85) p0 = 0.72 * p1 + 0.28 * p0;

    rawJump += 0.5 * (Math.abs(r1 - r2) + Math.abs(r0 - r1));
    v5Jump += 0.5 * (Math.abs(p1 - p2) + Math.abs(p0 - p1));
    if (Math.abs(r2 - obsT) <= 1.0 && Math.abs(r1 - r2) >= 0.65 && Math.abs(r1 - obsT) - Math.abs(r2 - obsT) >= 0.5) {
      rawBadFlips++;
    }
    if (Math.abs(p2 - obsT) <= 1.0 && Math.abs(p1 - p2) >= 0.65 && Math.abs(p1 - obsT) - Math.abs(p2 - obsT) >= 0.5) {
      v5BadFlips++;
    }
    stabCnt++;
  }

  return {
    trainingArchiveHours: N,
    totalHours: evalLen,
    stationTrapAudit,
    rawModelMaeByLead,
    intradaySummary,
    summaryByLead,
    stabilitySummary: {
      RAW_IFS: {
        meanRunJumpC: Number((rawJump / Math.max(1, stabCnt)).toFixed(3)),
        badLastMinuteFlipPct: Number(((100 * rawBadFlips) / Math.max(1, stabCnt)).toFixed(2)),
      },
      ATMOS_V5_0_ZERO_DRIFT: {
        meanRunJumpC: Number((v5Jump / Math.max(1, stabCnt)).toFixed(3)),
        badLastMinuteFlipPct: Number(((100 * v5BadFlips) / Math.max(1, stabCnt)).toFixed(2)),
      },
    },
  };
}

function printReport(modeLabel, liveSnap, report) {
  console.log(`\n================================================================================================`);
  console.log(` ATMOS v5.0 — BURSA (WMO 17116) 17.472 SAATLİK TAM DOĞRULUK DENETİMİ (${modeLabel})`);
  console.log(` Eğitim Havuzu: ${report.trainingArchiveHours}s (2 Yıl) | Out-of-Sample Test: ${report.totalHours}s (5-Fold 168s Tampon)`);
  console.log(`================================================================================================`);

  if (liveSnap) {
    console.log(`\n[CANLI SAHA TELEMETRİSİ — ANLIK MGM 19 İLÇE vs NOAA METAR LTBR]`);
    console.log(`  • Aktif MGM Bursa İstasyonu       : ${liveSnap.onlineDistrictCount} ilçe çevrimiçi`);
    console.log(`  • Bursa Osmangazi (17116, 100m)   : ${liveSnap.osmangazi17116TempC} °C`);
    console.log(`  • Yenişehir Havalimanı (LTBR)     : ${liveSnap.ltbrMetarTempC} °C (Anlık Sapma: ${liveSnap.ltbrMinusBursaErrorC} °C)`);
  }

  console.log(`\n[BÖLÜM 1] GÜN İÇİ (INTRADAY +1s..+18s) OUT-OF-SAMPLE DOĞRULUK (PBL-DUYARLI AR(2) + L1-EMOS)`);
  console.log(`Ufuk   | Örnek  | MAE (°C) | RMSE (°C) | <=1.0°C İsabet | <=2.0°C İsabet`);
  console.log(`-------+--------+----------+-----------+----------------+---------------`);
  for (const h of INTRADAY_LEADS_H) {
    const m = report.intradaySummary[`plus_${h}h`];
    console.log(
      `${(`+${h}s`).padEnd(6)} | ${String(m.samples).padStart(6)} | ${m.maeC.toFixed(3).padStart(8)} | ${m.rmseC.toFixed(3).padStart(9)} | ${(`%${m.sub1HitPct.toFixed(1)}`).padStart(14)} | ${(`%${m.sub2HitPct.toFixed(1)}`).padStart(13)}`,
    );
  }

  console.log(`\n[BÖLÜM 2] GÜN 0..7 ÇOK VADELİ (5-FOLD 168s TAMPONLU OUT-OF-SAMPLE CV) KARŞILAŞTIRMA`);
  console.log(`Vade   | Sistem                   | MAE (°C) | <=1°C İsabet | <=2°C İsabet | Yağış CSI | Yağış POD`);
  console.log(`-------+--------------------------+----------+--------------+--------------+-----------+----------`);
  for (const d of LEAD_DAYS) {
    const blk = report.summaryByLead[`day_${d}`];
    for (const eng of ['RAW_IFS', 'ATMOS_V5_0_ZERO_DRIFT']) {
      const m = blk[eng];
      console.log(
        `${(`Gün ${d}`).padEnd(6)} | ${eng.padEnd(24)} | ${m.maeC.toFixed(3).padStart(8)} | ${(`%${m.sub1HitPct.toFixed(1)}`).padStart(12)} | ${(`%${m.sub2HitPct.toFixed(1)}`).padStart(12)} | ${m.precipCSI.toFixed(3).padStart(9)} | ${(`%${(m.precipPOD * 100).toFixed(1)}`).padStart(9)}`,
      );
    }
    console.log(`-------+--------------------------+----------+--------------+--------------+-----------+----------`);
  }

  console.log(`\n[BÖLÜM 3] KOŞULAR ARASI KARARLILIK (KALİBRE-KALİBRE dProg/dt HİSTEREZİS KİLİDİ)`);
  for (const [eng, s] of Object.entries(report.stabilitySummary)) {
    console.log(
      `  • ${eng.padEnd(24)} -> Ortalama Sıçrama: ${s.meanRunJumpC.toFixed(3)} °C | Hatalı Son Dakika Revizesi: %${s.badLastMinuteFlipPct}`,
    );
  }
}

async function main() {
  const opts = parseArgs(process.argv);
  const [liveSnap, dataset] = await Promise.all([
    opts.selfTest ? Promise.resolve(null) : fetchLiveBursaTelemetrySnapshot(),
    opts.selfTest ? Promise.resolve(buildSyntheticSelfTest()) : loadTwoYearArchive(opts.cacheDir),
  ]);

  const report = evaluateTwoYearBenchmark(dataset, opts.selfTest);
  printReport(opts.selfTest ? 'Sentetik Öz-Test' : '17.472s 2-Yıllık WMO 17116 Arşivi', liveSnap, report);

  await fs.mkdir(path.dirname(opts.outJson), { recursive: true });
  await fs.writeFile(
    opts.outJson,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        mode: opts.selfTest ? 'self-test' : 'live-17472h-2yr-wmo17116-5fold-purged-cv',
        liveSnapshot: liveSnap,
        ...report,
      },
      null,
      2,
    ),
    'utf8',
  );
  console.log(`\nJSON doğrulama raporu kaydedildi: ${opts.outJson}`);
}

main().catch((err) => {
  console.error('Benchmark hatası:', err);
  process.exit(1);
});