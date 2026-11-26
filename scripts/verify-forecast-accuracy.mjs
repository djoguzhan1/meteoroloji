/**
 * ATMOS v5.0 — Canlı 48 Saatlik Walk-Forward (Örneklem-Dışı) 8-Model İstasyon Doğruluk Kıyaslaması
 *
 * Her şehirde son 48 saatlik gerçek istasyon gözlemlerine karşı:
 *   - 8 tekil operasyonel modelin (ECMWF IFS, AIFS v1, ICON, UKMO, AROME/ARPEGE, GFS, GEM, JMA) RMSE/MAE'si
 *   - Ham 8-model ağırlıklı ortalamasının RMSE/MAE'si
 *   - ATMOS v5.0 (yalnızca t - leadH öncesinden eğitilmiş örneklem-dışı Kalman+Diurnal MOS + +1s/+6s) RMSE/MAE'si
 * yan yana ölçülür.
 */

const USER_AGENT =
  "Mozilla/5.0 (compatible; Google-Agent; +https://developers.google.com/crawling/docs/crawlers-fetchers/google-agent)";

const CITIES = [
  { name: "Bursa", lat: 40.1885, lon: 29.061, elev: 155, tzOff: 10800 },
  { name: "İstanbul", lat: 41.0082, lon: 28.9784, elev: 40, tzOff: 10800 },
  { name: "Ankara", lat: 39.9334, lon: 32.8597, elev: 890, tzOff: 10800 },
  { name: "İzmir", lat: 38.4237, lon: 27.1428, elev: 25, tzOff: 10800 },
  { name: "Trabzon", lat: 41.0027, lon: 39.7168, elev: 39, tzOff: 10800 },
  { name: "Londra", lat: 51.5072, lon: -0.1276, elev: 11, tzOff: 0 },
  { name: "New York", lat: 40.7128, lon: -74.006, elev: 10, tzOff: -18000 }
];

const MODELS = [
  { key: "ecmwf_ifs", label: "ECMWF IFS", prior: 0.21 },
  { key: "ecmwf_aifs025_single", label: "AIFS AI", prior: 0.23 },
  { key: "icon_seamless", label: "ICON-EU", prior: 0.16 },
  { key: "ukmo_seamless", label: "UKMO", prior: 0.13 },
  { key: "meteofrance_seamless", label: "AROME/ARP", prior: 0.10 },
  { key: "gfs_seamless", label: "NOAA GFS", prior: 0.07 },
  { key: "gem_seamless", label: "ECCC GEM", prior: 0.05 },
  { key: "jma_seamless", label: "JMA GSM", prior: 0.05 }
];

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const r = (d) => (d * Math.PI) / 180;
  const a =
    Math.sin(r(lat2 - lat1) / 2) ** 2 +
    Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lon2 - lon1) / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

async function benchmarkCity(city) {
  const minLat = (city.lat - 0.85).toFixed(3);
  const maxLat = (city.lat + 0.85).toFixed(3);
  const minLon = (city.lon - 1.1).toFixed(3);
  const maxLon = (city.lon + 1.1).toFixed(3);

  const metarUrl = `https://aviationweather.gov/api/data/metar?bbox=${minLat},${minLon},${maxLat},${maxLon}&hours=48&format=json`;
  const nwpUrl = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&timezone=GMT&past_days=3&forecast_days=1&models=${MODELS.map((m) => m.key).join(",")}&hourly=temperature_2m,pressure_msl,precipitation`;

  const [mRes, nRes] = await Promise.all([
    fetch(metarUrl, { headers: { "User-Agent": USER_AGENT } }),
    fetch(nwpUrl, { headers: { "User-Agent": USER_AGENT } })
  ]);
  const mRaw = mRes.ok ? await mRes.json() : [];
  const nJson = nRes.ok ? await nRes.json() : null;
  if (!Array.isArray(mRaw) || !nJson?.hourly?.time) return null;

  const grouped = new Map();
  for (const r of mRaw) {
    if (!r.icaoId || typeof r.lat !== "number" || typeof r.lon !== "number") continue;
    const list = grouped.get(r.icaoId) ?? [];
    list.push(r);
    grouped.set(r.icaoId, list);
  }
  const stations = [...grouped.entries()]
    .map(([icao, list]) => ({
      icao,
      dist: haversineKm(city.lat, city.lon, list[0].lat, list[0].lon),
      elev: Number(list[0].elev ?? 0),
      list
    }))
    .filter((s) => s.dist <= 85 && s.list.length >= 6)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 4);

  if (stations.length === 0) return null;

  const cityElev = Number(nJson.elevation ?? city.elev);
  const utcIdx = new Map();
  nJson.hourly.time.forEach((t, i) => utcIdx.set(t, i));

  const hourMap = new Map();
  for (const st of stations) {
    const elevDelta = -0.0065 * (cityElev - st.elev);
    const w = 1 / ((st.dist * st.dist + 14 * 14) * (1 + Math.abs(cityElev - st.elev) / 280));
    for (const ob of st.list) {
      if (typeof ob.temp !== "number") continue;
      const ms = Math.round((ob.obsTime * 1000) / 3600000) * 3600000;
      const key = new Date(ms).toISOString().slice(0, 16);
      if (!utcIdx.has(key)) continue;
      const entry = hourMap.get(key) ?? { ms, tNum: 0, tDen: 0 };
      entry.tNum += (ob.temp + elevDelta) * w;
      entry.tDen += w;
      hourMap.set(key, entry);
    }
  }

  const timeline = [...hourMap.entries()]
    .map(([utcKey, v]) => ({ utcKey, ms: v.ms, obsT: v.tNum / v.tDen, idx: utcIdx.get(utcKey) }))
    .sort((a, b) => a.ms - b.ms);

  if (timeline.length < 20) return null;

  const evalMetrics = {
    perModelSq: Object.fromEntries(MODELS.map((m) => [m.key, 0])),
    perModelAbs: Object.fromEntries(MODELS.map((m) => [m.key, 0])),
    perModelN: Object.fromEntries(MODELS.map((m) => [m.key, 0])),
    rawBlendSq: 0,
    rawBlendAbs: 0,
    v5Lead1Sq: 0,
    v5Lead1Abs: 0,
    v5Lead6Sq: 0,
    v5Lead6Abs: 0,
    nEval: 0
  };

  for (let i = 16; i < timeline.length; i++) {
    const cur = timeline[i];
    const localHour = Math.floor((((cur.ms + city.tzOff * 1000) / 3600000) % 24 + 24) % 24);
    const curBin = Math.min(3, Math.floor(localHour / 6));

    let rawNum = 0;
    let rawDen = 0;
    for (const m of MODELS) {
      const val = nJson.hourly[`temperature_2m_${m.key}`]?.[cur.idx];
      if (typeof val === "number" && Number.isFinite(val)) {
        const e = val - cur.obsT;
        evalMetrics.perModelSq[m.key] += e * e;
        evalMetrics.perModelAbs[m.key] += Math.abs(e);
        evalMetrics.perModelN[m.key]++;
        rawNum += val * m.prior;
        rawDen += m.prior;
      }
    }
    if (rawDen <= 0) continue;
    const rawBlend = rawNum / rawDen;
    evalMetrics.rawBlendSq += (rawBlend - cur.obsT) ** 2;
    evalMetrics.rawBlendAbs += Math.abs(rawBlend - cur.obsT);

    const predictWalkForward = (leadH) => {
      const cutoffMs = cur.ms - leadH * 3600000;
      const past = timeline.filter((p) => p.ms <= cutoffMs && cur.ms - p.ms <= 48 * 3600000);
      if (past.length < 8) return rawBlend;

      let num = 0;
      let den = 0;
      for (const m of MODELS) {
        const curVal = nJson.hourly[`temperature_2m_${m.key}`]?.[cur.idx];
        if (typeof curVal !== "number" || !Number.isFinite(curVal)) continue;

        let wSum = 0;
        let wSq = 0;
        let eSum = 0;
        let sqSum = 0;
        let linSum = 0;
        let cnt = 0;
        const binErr = [0, 0, 0, 0];
        const binN = [0, 0, 0, 0];

        for (const p of past) {
          const mv = nJson.hourly[`temperature_2m_${m.key}`]?.[p.idx];
          if (typeof mv !== "number" || !Number.isFinite(mv)) continue;
          const err = mv - p.obsT;
          if (Math.abs(err) > 6.5) continue;
          const ageH = Math.max(0, (cutoffMs - p.ms) / 3600000);
          const ew = Math.pow(0.86, ageH);
          wSum += ew;
          wSq += ew * ew;
          eSum += ew * err;
          sqSum += err * err;
          linSum += err;
          cnt++;
          const lh = Math.floor((((p.ms + city.tzOff * 1000) / 3600000) % 24 + 24) % 24);
          const b = Math.min(3, Math.floor(lh / 6));
          binErr[b] += err;
          binN[b]++;
        }
        if (cnt < 6) continue;
        const nEff = (wSum * wSum) / Math.max(1e-6, wSq);
        const meanErr = linSum / cnt;
        const persistBias = clamp(meanErr * (cnt / (cnt + 5.0)), -4.5, 4.5);
        const ewmaTotal = clamp((eSum / wSum) * (nEff / (nEff + 3.0)), -4.5, 4.5);
        const transBias = clamp(ewmaTotal - persistBias, -2.8, 2.8);
        const ubVar = Math.max(0, sqSum / cnt - meanErr * meanErr);
        const effErr = Math.sqrt(ubVar) * 0.75 + Math.sqrt(sqSum / cnt) * 0.25;
        const binResid =
          binN[curBin] >= 2
            ? clamp(
                (binErr[curBin] / binN[curBin] - persistBias) *
                  (binN[curBin] / (binN[curBin] + 3)),
                -2.5,
                2.5
              )
            : 0;

        const wModel = m.prior / (effErr * effErr + 0.45 * 0.45);
        const corrected =
          curVal -
          (persistBias * Math.exp(-leadH / 60) +
            transBias * Math.exp(-leadH / 10) +
            0.72 * binResid * Math.exp(-leadH / 72));
        num += corrected * wModel;
        den += wModel;
      }

      let pred = den > 0 ? num / den : rawBlend;
      if (leadH <= 3) {
        const lastObs = past[past.length - 1];
        if (lastObs) {
          const lastM = nJson.hourly[`temperature_2m_ecmwf_ifs`]?.[lastObs.idx];
          const curM = nJson.hourly[`temperature_2m_ecmwf_ifs`]?.[cur.idx];
          if (typeof lastM === "number" && typeof curM === "number") {
            const anchorTarget = lastObs.obsT + (curM - lastM);
            const kGain = 0.45 * Math.exp(-leadH / 2.4);
            pred = pred + clamp(anchorTarget - pred, -3.5, 3.5) * kGain;
          }
        }
      }
      return pred;
    };

    const p1 = predictWalkForward(1);
    const p6 = predictWalkForward(6);
    evalMetrics.v5Lead1Sq += (p1 - cur.obsT) ** 2;
    evalMetrics.v5Lead1Abs += Math.abs(p1 - cur.obsT);
    evalMetrics.v5Lead6Sq += (p6 - cur.obsT) ** 2;
    evalMetrics.v5Lead6Abs += Math.abs(p6 - cur.obsT);
    evalMetrics.nEval++;
  }

  return {
    city: city.name,
    stations: stations.map((s) => s.icao).join("+"),
    nEval: evalMetrics.nEval,
    perModelRmse: Object.fromEntries(
      MODELS.map((m) => [
        m.label,
        evalMetrics.perModelN[m.key] > 0
          ? Number(
              Math.sqrt(evalMetrics.perModelSq[m.key] / evalMetrics.perModelN[m.key]).toFixed(2)
            )
          : null
      ])
    ),
    rawBlendRmse: Number(Math.sqrt(evalMetrics.rawBlendSq / evalMetrics.nEval).toFixed(2)),
    v5Lead6Rmse: Number(Math.sqrt(evalMetrics.v5Lead6Sq / evalMetrics.nEval).toFixed(2)),
    v5Lead1Rmse: Number(Math.sqrt(evalMetrics.v5Lead1Sq / evalMetrics.nEval).toFixed(2)),
    rawBlendMae: Number((evalMetrics.rawBlendAbs / evalMetrics.nEval).toFixed(2)),
    v5Lead6Mae: Number((evalMetrics.v5Lead6Abs / evalMetrics.nEval).toFixed(2)),
    v5Lead1Mae: Number((evalMetrics.v5Lead1Abs / evalMetrics.nEval).toFixed(2))
  };
}

async function main() {
  console.log(
    "=== ATMOS v5.0 — CANLI 48 SAATLİK WALK-FORWARD (ÖRNEKLEM-DIŞI) 8-MODEL DOĞRULUK TESTİ ===\n"
  );
  const results = [];
  for (const c of CITIES) {
    const res = await benchmarkCity(c);
    if (res) results.push(res);
  }

  for (const r of results) {
    const bestSingle = Math.min(
      ...Object.values(r.perModelRmse).filter((v) => typeof v === "number")
    );
    const gainPct1 = (((r.rawBlendRmse - r.v5Lead1Rmse) / r.rawBlendRmse) * 100).toFixed(1);
    const gainPct6 = (((r.rawBlendRmse - r.v5Lead6Rmse) / r.rawBlendRmse) * 100).toFixed(1);
    console.log(
      `${r.city.padEnd(10)} [${r.stations.padEnd(19)}] (${r.nEval}s) | En İyi Tekil: ${bestSingle.toFixed(2)}°C | Ham 8M: ${r.rawBlendRmse.toFixed(2)}°C | v5 (+6s): ${r.v5Lead6Rmse.toFixed(2)}°C (${gainPct6}%) | v5 (+1s): ${r.v5Lead1Rmse.toFixed(2)}°C (${gainPct1}%)`
    );
  }

  const avg = (fn) =>
    (results.reduce((a, r) => a + fn(r), 0) / Math.max(1, results.length)).toFixed(2);
  console.log("\n--- 7 ŞEHİR GENEL ORTALAMA (SICAKLIK RMSE / MAE) ---");
  for (const m of MODELS) {
    const vals = results.map((r) => r.perModelRmse[m.label]).filter((v) => typeof v === "number");
    const mAvg = (vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length)).toFixed(2);
    console.log(`  Tekil ${m.label.padEnd(11)} RMSE: ${mAvg}°C`);
  }
  console.log(
    `  Ham 8-Model Ort. RMSE: ${avg((r) => r.rawBlendRmse)}°C (MAE ${avg((r) => r.rawBlendMae)}°C)`
  );
  console.log(
    `  ATMOS v5 (+6s)   RMSE: ${avg((r) => r.v5Lead6Rmse)}°C (MAE ${avg((r) => r.v5Lead6Mae)}°C)`
  );
  console.log(
    `  ATMOS v5 (+1s)   RMSE: ${avg((r) => r.v5Lead1Rmse)}°C (MAE ${avg((r) => r.v5Lead1Mae)}°C)`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
