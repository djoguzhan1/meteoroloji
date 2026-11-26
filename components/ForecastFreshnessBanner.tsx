"use client";

import { memo, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Radio,
  RefreshCw,
  WifiOff
} from "lucide-react";
import {
  useWeatherData,
  useWeatherRetryCountdown,
  useWeatherStatus
} from "@/context/WeatherContext";
import {
  describeFreshnessBannerTr,
  formatClockTr,
  formatFreshnessAgeTr,
  formatSourceTierTr
} from "@/lib/forecast-resilience";
import { atmosUiSfx } from "@/lib/ui-sfx";

function ForecastFreshnessBannerBase() {
  const pathname = usePathname();
  const { bundle } = useWeatherData();
  const {
    freshness,
    isStale,
    isDegraded,
    isOffline,
    isRevalidating,
    loading,
    justRecovered,
    refreshWeather
  } = useWeatherStatus();
  const retryCountdownSec = useWeatherRetryCountdown();

  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const visible =
    pathname !== "/play" &&
    Boolean(
      justRecovered ||
        (bundle && (isStale || isDegraded || isOffline))
    );

  useEffect(() => {
    if (!visible) return;
    const tick = window.setInterval(() => {
      setNowMs(Date.now());
    }, 15_000);
    return () => window.clearInterval(tick);
  }, [visible]);

  if (!visible) return null;

  if (justRecovered && !isStale && !isOffline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mx-auto mb-4 max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-signal-emerald/40 bg-[#061814]/94 px-4 py-2.5 text-xs text-ink-primary shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-signal-emerald" />
            <span className="font-medium text-emerald-200">
              Canlı model bağlantısı yeniden sağlandı
            </span>
            <span className="hidden text-ink-secondary sm:inline">
              · Güncel tahmin verileri kesintisiz olarak ekrana aktarıldı.
            </span>
          </div>
          {bundle && (
            <span className="font-mono text-[11px] text-emerald-300/90 tabular">
              Güncellendi · {formatClockTr(bundle.fetchedAt, bundle.timezone)}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (!bundle) return null;

  const effectiveFreshness = freshness ?? {
    status: isOffline ? ("stale" as const) : ("live" as const),
    sourceTier: "client-cache" as const,
    fetchedAt: bundle.fetchedAt,
    cachedAtMs: Date.parse(bundle.fetchedAt) || nowMs,
    ageSeconds: Math.max(
      0,
      Math.round((nowMs - (Date.parse(bundle.fetchedAt) || nowMs)) / 1000)
    )
  };

  const desc = describeFreshnessBannerTr({ freshness: effectiveFreshness, isOffline, timezone: bundle.timezone, nowMs });
  const ageText = formatFreshnessAgeTr(bundle.fetchedAt, nowMs);
  const clockText = formatClockTr(bundle.fetchedAt, bundle.timezone);
  const tierLabel = formatSourceTierTr(effectiveFreshness.sourceTier);

  const isAmber = isOffline || isStale;
  const borderCls = isAmber
    ? "border-signal-amber/40 bg-[#161006]/94"
    : "border-signal-sky/35 bg-[#071322]/94";
  const accentTextCls = isAmber ? "text-amber-200" : "text-sky-200";
  const badgeCls = isAmber
    ? "border-signal-amber/35 bg-signal-amber/15 text-amber-200"
    : "border-signal-sky/35 bg-signal-sky/15 text-sky-200";

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto mb-4 max-w-7xl px-4 sm:px-6 lg:px-8"
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs shadow-[0_12px_34px_rgba(0,0,0,0.42)] ${borderCls}`}
      >
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
          <div
            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border sm:mt-0 ${badgeCls}`}
          >
            {isOffline ? (
              <WifiOff className="h-4 w-4" />
            ) : (
              <Radio className="h-4 w-4" />
            )}
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`font-display text-xs sm:text-sm font-semibold ${accentTextCls}`}>
                {desc.headline}
              </span>
              <span
                className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] tabular ${badgeCls}`}
              >
                {tierLabel}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] text-ink-secondary tabular">
                <Clock className="h-3 w-3 opacity-75" />
                Son veri: {clockText} ({ageText})
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-ink-secondary leading-relaxed">
              {desc.detail}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 font-mono text-[11px] tabular">
          {!isOffline && retryCountdownSec !== null && retryCountdownSec > 0 && !isRevalidating && (
            <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-ink-secondary">
              Oto-kontrol: {retryCountdownSec} sn
            </span>
          )}

          <button
            type="button"
            disabled={loading || isRevalidating}
            onClick={() => {
              atmosUiSfx.playNavTick();
              void refreshWeather();
            }}
            className="atmos-btn inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.08] px-3 py-1.5 font-medium text-ink-primary hover:bg-white/[0.14] disabled:opacity-60"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading || isRevalidating ? "animate-spin text-[var(--atmos-accent)]" : ""}`}
            />
            <span>
              {loading || isRevalidating ? "Kontrol Ediliyor..." : "Şimdi Denetle"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

const ForecastFreshnessBanner = memo(ForecastFreshnessBannerBase);
export default ForecastFreshnessBanner;
