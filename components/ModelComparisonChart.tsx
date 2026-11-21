"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { FIVE_MODEL_KEYS, FIVE_MODEL_META } from "@/lib/metar-verify";
import type {
  FiveModelKey,
  GeoLocation,
  ModelSeriesPoint,
  MultiModelBundle,
  UnitSystem
} from "@/lib/weather-types";

type MetricTab = "temp2m" | "temp850" | "precip" | "wind10m";

const TAB_CONFIG: Record<
  MetricTab,
  { label: string; subtitle: string; unitMetric: string; unitImperial: string }
> = {
  temp2m: {
    label: "2m Sıcaklık",
    subtitle: "5 Tier-1 model yüzey hava sıcaklığı karşılaştırması",
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

export default function ModelComparisonChart({
  location,
  unit
}: {
  location: GeoLocation;
  unit: UnitSystem;
}) {
  const [models, setModels] = useState<MultiModelBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<MetricTab>("temp2m");
  const [hoverIdx, setHoverIdx] = useState<number>(0);
  const [visibleModels, setVisibleModels] = useState<Record<FiveModelKey, boolean>>({
    ecmwfIfs: true,
    ecmwfAifs: true,
    icon: true,
    ukmo: true,
    gfs: true
  });

  const toggleModel = (k: FiveModelKey) => {
    setVisibleModels((prev) => {
      const enabledCount = FIVE_MODEL_KEYS.filter((m) => prev[m]).length;
      if (prev[k] && enabledCount <= 1) return prev;
      return { ...prev, [k]: !prev[k] };
    });
  };

  const loadModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        lat: String(location.lat),
        lon: String(location.lon)
      });
      const res = await fetch(`/api/models?${qs.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      const data: MultiModelBundle = await res.json();
      setModels(data);
      setHoverIdx(0);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "5-Model sayısal tahmin verileri alınamadı."
      );
    } finally {
      setLoading(false);
    }
  }, [location.lat, location.lon]);

  useEffect(() => {
    void loadModels();
  }, [loadModels]);

  const activeSeries: ModelSeriesPoint[] = useMemo(() => {
    if (!models) return [];
    return models[tab] ?? [];
  }, [models, tab]);

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
      for (const k of FIVE_MODEL_KEYS) {
        if (!visibleModels[k]) continue;
        const v = convertValue(pt[k], tab, unit);
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

    const paths = {} as Record<FiveModelKey, string>;
    for (const k of FIVE_MODEL_KEYS) {
      paths[k] = buildLinePath(
        activeSeries.map((pt, i) => {
          const v = convertValue(pt[k], tab, unit);
          return { x: xAt(i), y: v === null ? null : yAt(v) };
        })
      );
    }

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
      yTicks,
      zeroY
    };
  }, [activeSeries, tab, unit, visibleModels]);

  const clampedIdx = Math.max(0, Math.min(activeSeries.length - 1, hoverIdx));
  const inspected = activeSeries[clampedIdx] ?? null;

  const inspectedValues = useMemo(() => {
    if (!inspected) return null;
    const map = {} as Record<FiveModelKey, number | null>;
    const present: number[] = [];
    for (const k of FIVE_MODEL_KEYS) {
      const v = convertValue(inspected[k], tab, unit);
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

  return (
    <section className="surface-panel p-5 sm:p-6 space-y-5">
      {/* Üst Satır: Başlık + Değişken Sekmeleri */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-ink-muted">
            72 Saatlik 5-Model Sayısal Tahmin (NWP + AI)
          </p>
          <h2 className="mt-1 font-display text-lg font-semibold text-ink-primary">
            ECMWF IFS 9km · ECMWF AIFS v1 · DWD ICON-EU · UKMO 10km · NOAA GFS
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            {location.name} · {TAB_CONFIG[tab].subtitle}
          </p>
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

      {/* Hata veya Yüklenme */}
      {error && (
        <div className="rounded-xl border border-signal-rose/35 bg-signal-rose/10 p-4 flex items-center justify-between gap-3 text-xs text-ink-primary">
          <span>{error}</span>
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
          5 Tier-1 model verisi çekiliyor...
        </div>
      )}

      {models && activeSeries.length > 0 && (
        <>
          {/* Seçili Saat + Tıklanabilir 5-Model Filtre Bandı */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-white/[0.07] bg-obsidian-950/60 px-3.5 py-2.5 text-xs font-mono tabular">
            <span className="text-ink-secondary">
              {inspected ? `${inspected.dayLabel} · ${inspected.hourLabel}` : "--"}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {FIVE_MODEL_KEYS.map((k) => {
                const meta = FIVE_MODEL_META[k];
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

          {/* 5-Model SVG Grafiği */}
          <div className="rounded-xl border border-white/[0.07] bg-[#070b14] p-2">
            <svg
              viewBox={`0 0 ${chart.W} ${chart.H}`}
              onPointerMove={handlePointer}
              onPointerDown={handlePointer}
              className="h-60 w-full cursor-crosshair select-none touch-none"
              role="img"
              aria-label="5 Tier-1 meteoroloji modeli 72 saatlik karşılaştırma grafiği"
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
                if (idx % 12 !== 0) return null;
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
                      {pt.hourLabel === "00:00" || idx === 0
                        ? `${pt.dayLabel} ${pt.hourLabel}`
                        : pt.hourLabel}
                    </text>
                  </g>
                );
              })}

              {FIVE_MODEL_KEYS.map((k) => {
                if (!visibleModels[k] || !chart.paths[k]) return null;
                return (
                  <path
                    key={k}
                    d={chart.paths[k]}
                    fill="none"
                    stroke={FIVE_MODEL_META[k].color}
                    strokeWidth={k === "ecmwfIfs" || k === "ecmwfAifs" ? 2.2 : 1.8}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                );
              })}

              <line
                x1={chart.xAt(clampedIdx)}
                x2={chart.xAt(clampedIdx)}
                y1={chart.padT}
                y2={chart.H - chart.padB}
                stroke="rgba(243, 246, 251, 0.45)"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* 5-Model Özet Kartları */}
          <div className="grid gap-3 sm:grid-cols-3 text-xs font-mono tabular">
            <div className="surface-tile p-3.5 space-y-1.5">
              <span className="text-[11px] text-ink-muted">72 Saat Toplam Yağış (mm)</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {FIVE_MODEL_KEYS.map((k) => (
                  <span key={k} style={{ color: FIVE_MODEL_META[k].color }}>
                    {FIVE_MODEL_META[k].shortLabel}: {models.summary.precip72h[k]}
                  </span>
                ))}
              </div>
            </div>

            <div className="surface-tile p-3.5 space-y-1.5">
              <span className="text-[11px] text-ink-muted">72s En Düşük 850 hPa (°C)</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {FIVE_MODEL_KEYS.map((k) => (
                  <span key={k} style={{ color: FIVE_MODEL_META[k].color }}>
                    {FIVE_MODEL_META[k].shortLabel}:{" "}
                    {models.summary.min850hPa[k] !== null
                      ? `${models.summary.min850hPa[k]}°`
                      : "—"}
                  </span>
                ))}
              </div>
            </div>

            <div className="surface-tile p-3.5 space-y-1.5">
              <span className="text-[11px] text-ink-muted">Maks. 2m 5-Model Sapması</span>
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
