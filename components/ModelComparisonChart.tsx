"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { useWeatherStatus } from "@/context/WeatherContext";
import {
  readCachedModelsBundleAsync,
  readCachedModelsBundleSync,
  writeCachedModelsBundle
} from "@/lib/client-forecast-cache";
import {
  areLocationsEquivalent,
  formatClockTr,
  formatFreshnessAgeTr,
  reanchorMultiModelBundleToNow
} from "@/lib/forecast-resilience";
import { CORE_MODEL_KEYS, CORE_MODEL_META } from "@/lib/model-registry";
import type {
  CoreModelKey,
  GeoLocation,
  ModelSeriesPoint,
  MultiModelBundle,
  UnitSystem
} from "@/lib/weather-types";

type MetricTab = "temp2m" | "temp850" | "precip" | "wind10m";
type HorizonHours = 72 | 168 | 360;

const TAB_CONFIG: Record<
  MetricTab,
  { label: string; subtitle: string; unitMetric: string; unitImperial: string }
> = {
  temp2m: {
    label: "2m Sıcaklık",
    subtitle: "8 operasyonel NWP ve AI modelinin yüzey hava sıcaklığı karşılaştırması",
    unitMetric: "°C",
    unitImperial: "°F"
  },
  temp850: {
    label: "850 hPa",
    subtitle: "~1500m üst atmosfer sıcaklığı (soğuk cephe & kar sınırı takibi)",
    unitMetric: "°C",
    unitImperial: "°C"
  },
  precip: {
    label: "Yağış",
    subtitle: "Saatlik yağış miktarı (mm/sa)",
    unitMetric: "mm",
    unitImperial: "mm"
  },
  wind10m: {
    label: "10m Rüzgar",
    subtitle: "Yüzey rüzgar hızı",
    unitMetric: "km/s",
    unitImperial: "mph"
  }
};

function convertValue(val: number | null, tab: MetricTab, unit: UnitSystem): number | null {
  if (val === null || !Number.isFinite(val)) return null;
  if (unit === "imperial") {
    if (tab === "temp2m") return Number(((val * 9) / 5 + 32).toFixed(1));
    if (tab === "wind10m") return Number((val * 0.621371).toFixed(1));
  }
  return Number(val.toFixed(1));
}

function buildLinePath(points: Array<{ x: number; y: number | null }>): string {
  let d = "";
  let open = false;
  for (const pt of points) {
    if (pt.y === null) {
      open = false;
      continue;
    }
    d += `${open ? "L" : "M"}${pt.x.toFixed(1)},${pt.y.toFixed(1)} `;
    open = true;
  }
  return d.trim();
}

function ModelComparisonChartBase({
  location,
  unit
}: {
  location: GeoLocation;
  unit: UnitSystem;
}) {
  const { recoveryCount, isOffline } = useWeatherStatus();

  const [models, setModels] = useState<MultiModelBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [revalidating, setRevalidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<MetricTab>("temp2m");
  const [horizonHours, setHorizonHours] = useState<HorizonHours>(72);
  const [hoverIdx, setHoverIdx] = useState<number>(0);
  const [visibleModels, setVisibleModels] = useState<Record<CoreModelKey, boolean>>({
    ecmwfIfs: true,
    ecmwfAifs: true,
    icon: true,
    ukmo: true,
    meteofrance: true,
    gfs: true,
    gem: true,
    jma: true
  });

  const toggleModel = (k: CoreModelKey) => {
    setVisibleModels((prev) => {
      const enabledCount = CORE_MODEL_KEYS.filter((m) => prev[m]).length;
      if (prev[k] && enabledCount <= 1) return prev;
      return { ...prev, [k]: !prev[k] };
    });
  };

  const reqSeqRef = useRef(0);
  const modelsRef = useRef<MultiModelBundle | null>(null);
  const locRef = useRef<GeoLocation>(location);

  useEffect(() => {
    modelsRef.current = models;
  }, [models]);

  useEffect(() => {
    locRef.current = location;
  }, [location]);

  const loadModels = useCallback(
    async (opts?: { background?: boolean }) => {
      const seq = ++reqSeqRef.current;
      const targetLat = location.lat;
      const targetLon = location.lon;

      const hasMatching =
        modelsRef.current !== null &&
        areLocationsEquivalent(
          { lat: modelsRef.current.lat, lon: modelsRef.current.lon },
          { lat: targetLat, lon: targetLon }
        );
      const isBg = Boolean(opts?.background || hasMatching);

      if (isBg) {
        setRevalidating(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const qs = new URLSearchParams({
          lat: String(targetLat),
          lon: String(targetLon)
        });
        const bypassCache =
          isBg || modelsRef.current?.freshness?.status !== "live";
        const res = await fetch(`/api/models?${qs.toString()}`, {
          cache: bypassCache ? "no-store" : "default"
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? `HTTP ${res.status}`);
        }
        const data: MultiModelBundle = await res.json();
        if (seq !== reqSeqRef.current) return;
        if (
          !areLocationsEquivalent(locRef.current, {
            lat: targetLat,
            lon: targetLon
          })
        ) {
          return;
        }

        if ((data.freshness?.status ?? "live") === "live") {
          writeCachedModelsBundle(data);
        }
        setModels(data);
        setError(null);
        if (!isBg) setHoverIdx(0);
      } catch (e) {
        if (seq !== reqSeqRef.current) return;
        const msg =
          e instanceof Error
            ? e.message
            : "8-Model sayısal tahmin verileri alınamadı.";

        if (
          modelsRef.current &&
          areLocationsEquivalent(
            { lat: modelsRef.current.lat, lon: modelsRef.current.lon },
            { lat: targetLat, lon: targetLon }
          )
        ) {
          const reanchored = reanchorMultiModelBundleToNow(
            modelsRef.current,
            Date.now(),
            {
              status: "stale",
              sourceTier:
                modelsRef.current.freshness?.sourceTier === "live"
                  ? "client-cache"
                  : (modelsRef.current.freshness?.sourceTier ?? "client-cache"),
              cachedAtMs:
                modelsRef.current.freshness?.cachedAtMs ??
                Date.parse(modelsRef.current.fetchedAt),
              staleReason: msg,
              modelsRespondedCount:
                modelsRef.current.freshness?.modelsRespondedCount
            }
          );
          setModels(reanchored);
          setError(null);
        } else {
          const cached = await readCachedModelsBundleAsync(
            targetLat,
            targetLon,
            Date.now(),
            { forceStale: true, staleReason: msg }
          );
          if (seq !== reqSeqRef.current) return;
          if (cached) {
            setModels(cached);
            setError(null);
            setHoverIdx(0);
          } else {
            setModels(null);
            setError(msg);
          }
        }
      } finally {
        if (seq === reqSeqRef.current) {
          setLoading(false);
          setRevalidating(false);
        }
      }
    },
    [location.lat, location.lon]
  );

  // Hydrate city-isolated cache immediately on location change, then fetch live
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const cur = modelsRef.current;
      const sameLoc =
        cur !== null &&
        areLocationsEquivalent({ lat: cur.lat, lon: cur.lon }, location);

      if (!sameLoc) {
        const syncHit = readCachedModelsBundleSync(
          location.lat,
          location.lon,
          Date.now(),
          { forceStale: isOffline }
        );
        if (syncHit) {
          modelsRef.current = syncHit;
          setModels(syncHit);
          setError(null);
          setHoverIdx(0);
        } else {
          modelsRef.current = null;
          setModels(null);
          setError(null);
        }
      }
      void loadModels({ background: Boolean(modelsRef.current) });
    });
    return () => {
      active = false;
    };
  }, [location.lat, location.lon, loadModels]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch automatically when global WeatherContext recovers live connectivity
  useEffect(() => {
    if (recoveryCount <= 0) return;
    queueMicrotask(() => {
      void loadModels({ background: Boolean(modelsRef.current) });
    });
  }, [recoveryCount, loadModels]);

  // Self-healing retry loop if models chart is stale or failed while online
  const isModelsStale =
    models?.freshness?.status === "stale" ||
    models?.freshness?.status === "degraded";
  useEffect(() => {
    if (isOffline || (!isModelsStale && !error) || loading || revalidating) {
      return;
    }
    const timer = window.setTimeout(() => {
      void loadModels({ background: Boolean(modelsRef.current) });
    }, 18_000);
    return () => window.clearTimeout(timer);
  }, [isOffline, isModelsStale, error, loading, revalidating, loadModels]);

  const activeSeries: ModelSeriesPoint[] = useMemo(() => {
    if (!models) return [];
    return (models[tab] ?? []).slice(0, horizonHours);
  }, [models, tab, horizonHours]);

  const chart = useMemo(() => {
    const W = 920;
    const H = 230;
    const padL = 44;
    const padR = 16;
    const padT = 16;
    const padB = 30;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const allVals: number[] = [];
    for (const pt of activeSeries) {
      for (const k of CORE_MODEL_KEYS) {
        if (!visibleModels[k]) continue;
        const v = convertValue(pt[k] ?? null, tab, unit);
        if (v !== null) allVals.push(v);
      }
    }

    const minRaw = allVals.length ? Math.min(...allVals) : 0;
    const maxRaw = allVals.length ? Math.max(...allVals) : 10;
    const minVal = tab === "precip" || tab === "wind10m" ? 0 : Math.floor(minRaw - 2);
    const maxVal =
      tab === "precip"
        ? Math.max(2, Math.ceil(maxRaw + 0.5))
        : Math.ceil(maxRaw + 2);
    const span = Math.max(1, maxVal - minVal);

    const n = Math.max(2, activeSeries.length);
    const xAt = (i: number) => padL + (i / (n - 1)) * plotW;
    const yAt = (v: number) => padT + plotH - ((v - minVal) / span) * plotH;

    const paths = {} as Record<CoreModelKey, string>;
    for (const k of CORE_MODEL_KEYS) {
      paths[k] = buildLinePath(
        activeSeries.map((pt, i) => {
          const v = convertValue(pt[k] ?? null, tab, unit);
          return { x: xAt(i), y: v === null ? null : yAt(v) };
        })
      );
    }

    const upperPts: string[] = [];
    const lowerPts: string[] = [];
    activeSeries.forEach((pt, i) => {
      const vals: number[] = [];
      for (const k of CORE_MODEL_KEYS) {
        if (!visibleModels[k]) continue;
        const v = convertValue(pt[k] ?? null, tab, unit);
        if (v !== null) vals.push(v);
      }
      if (vals.length >= 2) {
        const x = xAt(i).toFixed(1);
        upperPts.push(`${x},${yAt(Math.max(...vals)).toFixed(1)}`);
        lowerPts.push(`${x},${yAt(Math.min(...vals)).toFixed(1)}`);
      }
    });
    const envelopePath =
      upperPts.length >= 2
        ? `M${upperPts.join(" L")} L${lowerPts.reverse().join(" L")} Z`
        : "";

    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((frac) => {
      const val = minVal + span * frac;
      return { val: Number(val.toFixed(tab === "precip" ? 1 : 0)), y: yAt(val) };
    });

    const zeroY =
      (tab === "temp2m" || tab === "temp850") && minVal < 0 && maxVal > 0
        ? yAt(0)
        : null;

    return {
      W,
      H,
      padL,
      padR,
      padT,
      padB,
      plotW,
      plotH,
      xAt,
      yAt,
      paths,
      envelopePath,
      yTicks,
      zeroY
    };
  }, [activeSeries, tab, unit, visibleModels]);

  const clampedIdx = Math.max(0, Math.min(activeSeries.length - 1, hoverIdx));
  const inspected = activeSeries[clampedIdx] ?? null;

  const inspectedValues = useMemo(() => {
    if (!inspected) return null;
    const map = {} as Record<CoreModelKey, number | null>;
    const present: number[] = [];
    for (const k of CORE_MODEL_KEYS) {
      const v = convertValue(inspected[k] ?? null, tab, unit);
      map[k] = v;
      if (v !== null && visibleModels[k]) present.push(v);
    }
    const spread =
      present.length >= 2
        ? Number((Math.max(...present) - Math.min(...present)).toFixed(1))
        : null;
    return { map, spread };
  }, [inspected, tab, unit, visibleModels]);

  const unitSuffix =
    unit === "imperial" ? TAB_CONFIG[tab].unitImperial : TAB_CONFIG[tab].unitMetric;

  const handlePointer = (e: React.PointerEvent<SVGSVGElement>) => {
    if (activeSeries.length < 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * chart.W;
    const frac = Math.max(0, Math.min(1, (relX - chart.padL) / chart.plotW));
    setHoverIdx(Math.round(frac * (activeSeries.length - 1)));
  };

  const tickStride = horizonHours === 360 ? 48 : horizonHours === 168 ? 24 : 12;
  const activePrecipSummary =
    horizonHours === 360
      ? (models?.summary.precip360h ?? models?.summary.precip168h)
      : horizonHours === 168
        ? models?.summary.precip168h
        : models?.summary.precip72h;
  const showArchiveBadge = Boolean(
    models && (isModelsStale || isOffline)
  );

  return (
    <section className="surface-panel p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-ink-primary">
              {horizonHours === 360 ? "15 Günlük (360s)" : `${horizonHours} Saatlik`} 8-Model Karşılaştırma
            </h2>
            {showArchiveBadge && models && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-signal-amber/35 bg-signal-amber/12 px-2.5 py-0.5 font-mono text-[11px] text-amber-200 tabular">
                <Clock className="h-3 w-3 text-signal-amber" />
                <span>
                  Arşiv · {formatFreshnessAgeTr(models.fetchedAt)} (
                  {formatClockTr(models.fetchedAt, location.timezone)})
                </span>
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ink-muted">
            {location.name} · {TAB_CONFIG[tab].subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadModels({ background: Boolean(models) })}
            disabled={loading || revalidating}
            title="8-Model serisini yenile"
            aria-label="8-Model serisini yenile"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-obsidian-950/75 text-ink-secondary hover:text-ink-primary disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading || revalidating ? "animate-spin" : ""}`}
            />
          </button>

          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-obsidian-950/75 p-1">
            {([72, 168, 360] as HorizonHours[]).map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  setHorizonHours(h);
                  setHoverIdx((prev) => Math.min(prev, h - 1));
                }}
                className={`rounded-lg px-2.5 py-1.5 font-mono text-xs font-medium transition-colors ${
                  horizonHours === h
                    ? "bg-white/15 text-ink-primary"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                {h === 360 ? "15g" : h === 168 ? "7g" : "72s"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-obsidian-950/75 p-1">
            {(Object.keys(TAB_CONFIG) as MetricTab[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === key
                    ? "bg-white/15 text-ink-primary"
                    : "text-ink-secondary hover:text-ink-primary"
                }`}
              >
                {TAB_CONFIG[key].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && !models && (
        <div className="rounded-xl border border-signal-rose/35 bg-signal-rose/10 p-4 flex items-center justify-between gap-3 text-xs text-ink-primary">
          <span>
            {error} · Bağlantı sağlandığında otomatik olarak yüklenecek.
          </span>
          <button
            type="button"
            onClick={() => void loadModels()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 hover:bg-white/10"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Tekrar Dene
          </button>
        </div>
      )}

      {loading && !models && !error && (
        <div className="h-[260px] rounded-xl border border-white/[0.06] bg-obsidian-950/60 flex items-center justify-center font-mono text-xs text-ink-muted">
          8 küresel ve mezoskaleli model verisi çekiliyor...
        </div>
      )}

      {models && activeSeries.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-white/[0.07] bg-obsidian-950/60 px-3.5 py-2.5 text-xs font-mono tabular">
            <span className="text-ink-secondary">
              {inspected ? `${inspected.dayLabel} · ${inspected.hourLabel}` : "--"}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {CORE_MODEL_KEYS.map((k) => {
                const meta = CORE_MODEL_META[k];
                const active = visibleModels[k];
                const val = inspectedValues?.map[k];
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => toggleModel(k)}
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 transition-opacity ${
                      active
                        ? "border-white/15 bg-white/[0.04] opacity-100"
                        : "border-white/[0.05] opacity-40"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="text-ink-muted">{meta.shortLabel}</span>
                    <strong className="text-ink-primary">
                      {val !== null && val !== undefined ? `${val}${unitSuffix}` : "--"}
                    </strong>
                  </button>
                );
              })}
              {inspectedValues?.spread !== null &&
                inspectedValues?.spread !== undefined && (
                  <span className="pl-1 text-ink-muted">
                    Fark:{" "}
                    <strong className="text-ink-secondary">
                      Δ{inspectedValues.spread}
                      {unitSuffix}
                    </strong>
                  </span>
                )}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-[#070b14] p-2">
            <svg
              viewBox={`0 0 ${chart.W} ${chart.H}`}
              onPointerMove={handlePointer}
              onPointerDown={handlePointer}
              className="h-60 w-full cursor-crosshair select-none touch-none"
              role="img"
              aria-label={`8 meteoroloji modeli ${horizonHours} saatlik karşılaştırma grafiği`}
            >
              {chart.yTicks.map((tick) => (
                <g key={tick.val}>
                  <line
                    x1={chart.padL}
                    x2={chart.W - chart.padR}
                    y1={tick.y}
                    y2={tick.y}
                    stroke="rgba(148, 163, 184, 0.12)"
                    strokeWidth="1"
                  />
                  <text
                    x={chart.padL - 8}
                    y={tick.y + 3.5}
                    textAnchor="end"
                    fill="rgba(167, 180, 200, 0.72)"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {tick.val}
                  </text>
                </g>
              ))}

              {chart.zeroY !== null && (
                <line
                  x1={chart.padL}
                  x2={chart.W - chart.padR}
                  y1={chart.zeroY}
                  y2={chart.zeroY}
                  stroke="rgba(56, 189, 248, 0.45)"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                />
              )}

              {activeSeries.map((pt, idx) => {
                if (idx % tickStride !== 0) return null;
                const x = chart.xAt(idx);
                return (
                  <g key={pt.time}>
                    <line
                      x1={x}
                      x2={x}
                      y1={chart.padT}
                      y2={chart.H - chart.padB}
                      stroke="rgba(148, 163, 184, 0.08)"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={chart.H - 10}
                      textAnchor="middle"
                      fill="rgba(167, 180, 200, 0.7)"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {pt.hourLabel === "00:00" || idx === 0 || horizonHours >= 168
                        ? `${pt.dayLabel} ${pt.hourLabel}`
                        : pt.hourLabel}
                    </text>
                  </g>
                );
              })}

              {chart.envelopePath && (
                <path
                  d={chart.envelopePath}
                  fill="rgba(56, 189, 248, 0.10)"
                  stroke="rgba(56, 189, 248, 0.16)"
                  strokeWidth="0.7"
                />
              )}

              <g key={`${tab}-${horizonHours}`}>
                {CORE_MODEL_KEYS.map((k) => {
                  if (!visibleModels[k] || !chart.paths[k]) return null;
                  return (
                    <path
                      key={k}
                      d={chart.paths[k]}
                      fill="none"
                      stroke={CORE_MODEL_META[k].color}
                      strokeWidth={k === "ecmwfIfs" || k === "ecmwfAifs" ? 2.3 : 1.75}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      className="atmos-line-draw"
                    />
                  );
                })}
              </g>

              <line
                x1={chart.xAt(clampedIdx)}
                x2={chart.xAt(clampedIdx)}
                y1={chart.padT}
                y2={chart.H - chart.padB}
                stroke="rgba(243, 246, 251, 0.52)"
                strokeDasharray="3 3"
                strokeWidth="1.2"
              />

              {inspectedValues &&
                CORE_MODEL_KEYS.map((k) => {
                  if (!visibleModels[k]) return null;
                  const val = inspectedValues.map[k];
                  if (val === null || val === undefined) return null;
                  const cx = chart.xAt(clampedIdx);
                  const cy = chart.yAt(val);
                  return (
                    <g key={`node-${k}`}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6.5}
                        fill={CORE_MODEL_META[k].color}
                        fillOpacity={0.22}
                      />
                      <circle
                        cx={cx}
                        cy={cy}
                        r={3.2}
                        fill={CORE_MODEL_META[k].color}
                        stroke="#070b14"
                        strokeWidth="1.4"
                      />
                    </g>
                  );
                })}
            </svg>
            {horizonHours === 360 && (
              <p className="mt-1.5 px-2 font-mono text-[10px] text-ink-muted">
                Doğal model vade sınırları: AROME/ARP 4.8g · UKMO 7g · ICON 8g · GEM 10.5g · JMA 11.2g · ECMWF IFS / AIFS AI / NOAA GFS 15g+
              </p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-3 text-xs font-mono tabular">
            <div className="surface-tile p-3.5 space-y-1.5">
              <span className="text-[11px] text-ink-muted">
                {horizonHours} Saat Toplam Yağış (mm)
              </span>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {CORE_MODEL_KEYS.map((k) => (
                  <span key={k} style={{ color: CORE_MODEL_META[k].color }}>
                    {CORE_MODEL_META[k].shortLabel}: {activePrecipSummary?.[k] ?? 0}
                  </span>
                ))}
              </div>
            </div>

            <div className="surface-tile p-3.5 space-y-1.5">
              <span className="text-[11px] text-ink-muted">En Düşük 850 hPa (°C)</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {CORE_MODEL_KEYS.map((k) => (
                  <span key={k} style={{ color: CORE_MODEL_META[k].color }}>
                    {CORE_MODEL_META[k].shortLabel}:{" "}
                    {models.summary.min850hPa[k] !== null
                      ? `${models.summary.min850hPa[k]}°`
                      : "—"}
                  </span>
                ))}
              </div>
            </div>

            <div className="surface-tile p-3.5 space-y-1.5">
              <span className="text-[11px] text-ink-muted">Maks. 2m 8-Model Sapması</span>
              <p className="text-sm font-semibold text-ink-primary">
                ±{models.summary.maxSpreadTemp2m}°C{" "}
                <span className="text-[11px] font-normal text-ink-muted">
                  ({models.summary.maxSpreadTemp2m <= 2.5
                    ? "Yüksek uzlaşı"
                    : models.summary.maxSpreadTemp2m <= 5
                      ? "Orta belirsizlik"
                      : "Yüksek ayrışma"})
                </span>
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

const ModelComparisonChart = memo(ModelComparisonChartBase);
export default ModelComparisonChart;
