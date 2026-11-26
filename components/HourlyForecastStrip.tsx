"use client";

import {
  KeyboardEvent,
  memo,
  PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { computeVirtualHourWindow } from "@/lib/perf-budgets";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sunrise,
  Sunset
} from "lucide-react";
import {
  buildConfidenceBandPath,
  buildHourlyDayGroups,
  buildSmoothCurvePath,
  buildSolarMarkers,
  detectDiurnalExtrema,
  getPrecipPhaseVisual
} from "@/lib/hourly-meteogram";
import { atmosUiSfx } from "@/lib/ui-sfx";
import {
  formatTemperature,
  formatWindSpeed,
  windDirectionToCompass
} from "@/lib/weather-client";
import type {
  DailyPoint,
  HourlyPoint,
  Minutely15Point,
  UnitSystem
} from "@/lib/weather-types";
import AnimatedNumber from "./AnimatedNumber";
import AnimatedWeatherIcon from "./AnimatedWeatherIcon";

type MeteogramLens = "synoptic" | "thermo" | "wind";

const LENS_OPTIONS: ReadonlyArray<{ key: MeteogramLens; label: string }> = [
  { key: "synoptic", label: "Meteogram" },
  { key: "thermo", label: "Hissedilen & Tw" },
  { key: "wind", label: "Rüzgar & Basınç" }
];

const COL_W = 68;
const STAGE_H = 330;
const CURVE_TOP = 114;
const CURVE_BOT = 192;
const HYETO_BASE_Y = 274;
const HYETO_MAX_H = 38;

function toUnitTemp(c: number, unit: UnitSystem): number {
  return unit === "imperial" ? (c * 9) / 5 + 32 : c;
}

function toUnitWind(kmh: number, unit: UnitSystem): number {
  return unit === "imperial" ? kmh * 0.621371 : kmh;
}

function skyBandColor(solarElevDeg: number): string {
  if (solarElevDeg < -6) return "rgba(15, 23, 42, 0.55)";
  if (solarElevDeg <= 7) return "rgba(245, 158, 11, 0.16)";
  return "rgba(56, 189, 248, 0.12)";
}

function stabilityLabelTr(grade?: "LOCKED" | "CONVERGING" | "WATCH"): {
  text: string;
  cls: string;
} {
  if (grade === "LOCKED") {
    return {
      text: "KİLİTLİ",
      cls: "border-signal-emerald/35 bg-signal-emerald/12 text-signal-emerald"
    };
  }
  if (grade === "CONVERGING") {
    return {
      text: "YAKINSIYOR",
      cls: "border-signal-sky/35 bg-signal-sky/12 text-signal-sky"
    };
  }
  return {
    text: "İZLENİYOR",
    cls: "border-signal-amber/35 bg-signal-amber/12 text-signal-amber"
  };
}

export interface HourlyForecastStripProps {
  hourly: HourlyPoint[];
  daily?: DailyPoint[];
  minutely15?: Minutely15Point[];
  unit: UnitSystem;
  selectedIndex: number;
  onSelectIndex: (idx: number) => void;
}

function HourlyForecastStripBase({
  hourly: fullHourly,
  daily = [],
  minutely15 = [],
  unit,
  selectedIndex,
  onSelectIndex
}: HourlyForecastStripProps) {
  const [lens, setLens] = useState<MeteogramLens>("synoptic");
  const [extended240, setExtended240] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [scrollDayDate, setScrollDayDate] = useState<string | null>(null);
  const [scrollMetrics, setScrollMetrics] = useState<{ scrollLeft: number; viewportWidth: number }>({
    scrollLeft: 0,
    viewportWidth: 1120
  });
  const scrollRafRef = useRef<number>(0);

  const hasExtendedHours = fullHourly.length > 168;
  const showExtended = extended240 || selectedIndex >= 168;
  const hourly = useMemo(
    () =>
      showExtended
        ? fullHourly
        : fullHourly.slice(0, Math.min(168, fullHourly.length)),
    [fullHourly, showExtended]
  );

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    active: boolean;
    moved: boolean;
    startX: number;
    startScrollLeft: number;
    pointerId: number;
  }>({
    active: false,
    moved: false,
    startX: 0,
    startScrollLeft: 0,
    pointerId: -1
  });
  const suppressExternalScrollRef = useRef(false);

  const count = hourly.length;
  const clampedSelected = Math.max(0, Math.min(selectedIndex, Math.max(0, count - 1)));
  const inspectedIdx =
    hoverIdx !== null ? Math.max(0, Math.min(hoverIdx, Math.max(0, count - 1))) : clampedSelected;

  const dayGroups = useMemo(
    () => buildHourlyDayGroups(hourly, daily),
    [hourly, daily]
  );
  const solarMarkers = useMemo(
    () => buildSolarMarkers(hourly, daily),
    [hourly, daily]
  );
  const diurnalExtrema = useMemo(() => detectDiurnalExtrema(hourly), [hourly]);

  const activeDayDate =
    scrollDayDate ?? hourly[clampedSelected]?.time.slice(0, 10) ?? dayGroups[0]?.date ?? "";

  const totalW = count * COL_W;
  const curveSpanH = CURVE_BOT - CURVE_TOP;

  // Geometri & SVG yol hesaplaması (tüm 168 saat için tek geçiş)
  const geometry = useMemo(() => {
    if (count < 2) {
      return {
        primaryYs: [] as number[],
        secondaryPath: "",
        primaryPath: "",
        bandPath: "",
        zeroTempY: null as number | null
      };
    }

    const primaryVals = hourly.map((h) =>
      lens === "wind"
        ? toUnitWind(h.windSpeed, unit)
        : toUnitTemp(h.temperature, unit)
    );

    const secondaryVals = hourly.map((h) => {
      if (lens === "thermo") return toUnitTemp(h.apparentTemperature, unit);
      if (lens === "wind") {
        return toUnitWind(Math.max(h.windGusts, h.gustP90 ?? h.windGusts), unit);
      }
      return toUnitTemp(h.temperature, unit);
    });

    const bandLows = hourly.map((h, i) => {
      if (lens === "synoptic" && h.tempP10 !== undefined) {
        return toUnitTemp(h.tempP10, unit);
      }
      if (lens === "wind") {
        return primaryVals[i];
      }
      return primaryVals[i];
    });

    const bandHighs = hourly.map((h, i) => {
      if (lens === "synoptic" && h.tempP90 !== undefined) {
        return toUnitTemp(h.tempP90, unit);
      }
      if (lens === "wind") {
        return secondaryVals[i];
      }
      return primaryVals[i];
    });

    const allExtrema =
      lens === "thermo"
        ? [...primaryVals, ...secondaryVals]
        : [...primaryVals, ...bandLows, ...bandHighs];

    const rawMin = Math.min(...allExtrema);
    const rawMax = Math.max(...allExtrema);
    const pad = lens === "wind" ? 4 : 2.2;
    const minVal = lens === "wind" ? 0 : rawMin - pad;
    const maxVal = rawMax + pad;
    const valSpan = Math.max(1, maxVal - minVal);

    const yOf = (v: number) =>
      CURVE_BOT - ((v - minVal) / valSpan) * curveSpanH;

    const primaryPts = primaryVals.map((v, i) => ({
      x: i * COL_W + COL_W / 2,
      y: yOf(v)
    }));

    const secondaryPts = secondaryVals.map((v, i) => ({
      x: i * COL_W + COL_W / 2,
      y: yOf(v)
    }));

    const hasBand =
      lens === "wind" ||
      (lens === "synoptic" &&
        hourly.some((h) => h.tempP10 !== undefined && h.tempP90 !== undefined));

    const bandPath = hasBand
      ? buildConfidenceBandPath(
          hourly.map((_, i) => ({
            x: i * COL_W + COL_W / 2,
            yHigh: yOf(bandHighs[i]),
            yLow: yOf(bandLows[i])
          }))
        )
      : "";

    const freezingThreshold = unit === "imperial" ? 32 : 0;
    const zeroTempY =
      lens !== "wind" && minVal < freezingThreshold && maxVal > freezingThreshold
        ? yOf(freezingThreshold)
        : null;

    return {
      primaryYs: primaryPts.map((p) => p.y),
      primaryPath: buildSmoothCurvePath(primaryPts),
      secondaryPath:
        lens === "thermo" || lens === "wind"
          ? buildSmoothCurvePath(secondaryPts)
          : "",
      bandPath,
      zeroTempY
    };
  }, [count, curveSpanH, hourly, lens, unit]);

  // Dışarıdan (ör. TimeScrubber oynatımıyla) selectedIndex değiştiğinde seçili saati görünür tut
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (suppressExternalScrollRef.current) {
      suppressExternalScrollRef.current = false;
      return;
    }
    const targetCenter = clampedSelected * COL_W + COL_W / 2;
    const viewLeft = el.scrollLeft;
    const viewRight = viewLeft + el.clientWidth;
    const margin = COL_W * 1.5;

    if (targetCenter < viewLeft + margin || targetCenter > viewRight - margin) {
      const nextScroll = Math.max(0, targetCenter - el.clientWidth * 0.35);
      el.scrollTo({ left: nextScroll, behavior: "smooth" });
    }
  }, [clampedSelected]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const measure = () => {
      const vw = el.clientWidth || 1120;
      const sl = el.scrollLeft || 0;
      setScrollMetrics((prev) =>
        Math.abs(prev.scrollLeft - sl) < 12 && Math.abs(prev.viewportWidth - vw) < 8
          ? prev
          : { scrollLeft: sl, viewportWidth: vw }
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (scrollRafRef.current) window.cancelAnimationFrame(scrollRafRef.current);
    };
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollRafRef.current) return;
    scrollRafRef.current = window.requestAnimationFrame(() => {
      scrollRafRef.current = 0;
      const el = scrollerRef.current;
      if (!el || hourly.length === 0) return;
      const sl = el.scrollLeft;
      const vw = el.clientWidth || 1120;
      setScrollMetrics((prev) =>
        Math.abs(prev.scrollLeft - sl) < COL_W * 0.75 && prev.viewportWidth === vw
          ? prev
          : { scrollLeft: sl, viewportWidth: vw }
      );
      const leadVisibleIdx = Math.min(
        hourly.length - 1,
        Math.max(0, Math.floor((sl + COL_W * 2.2) / COL_W))
      );
      const date = hourly[leadVisibleIdx]?.time.slice(0, 10) ?? null;
      if (date) {
        setScrollDayDate((prev) => (prev === date ? prev : date));
      }
    });
  }, [hourly]);

  const virtWin = useMemo(
    () =>
      computeVirtualHourWindow({
        scrollLeft: scrollMetrics.scrollLeft,
        viewportWidth: scrollMetrics.viewportWidth,
        totalCount: count,
        colWidth: COL_W,
        overscan: 6
      }),
    [scrollMetrics.scrollLeft, scrollMetrics.viewportWidth, count]
  );

  const visibleIndices = useMemo(() => {
    const out: number[] = [];
    for (let i = virtWin.startIdx; i <= virtWin.endIdx; i++) {
      out.push(i);
    }
    return out;
  }, [virtWin.startIdx, virtWin.endIdx]);

  const jumpToHour = useCallback(
    (idx: number, updateSelection = true) => {
      const safe = Math.max(0, Math.min(idx, count - 1));
      const el = scrollerRef.current;
      if (el) {
        suppressExternalScrollRef.current = true;
        el.scrollTo({
          left: Math.max(0, safe * COL_W - COL_W * 0.5),
          behavior: "smooth"
        });
      }
      if (updateSelection) {
        atmosUiSfx.playScrubTick(safe / Math.max(1, count - 1));
        onSelectIndex(safe);
      }
    },
    [count, onSelectIndex]
  );

  const scrollByHours = (deltaHours: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    atmosUiSfx.playNavTick();
    el.scrollBy({ left: deltaHours * COL_W, behavior: "smooth" });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const el = scrollerRef.current;
    if (!el) return;
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      pointerId: e.pointerId
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = dragRef.current;
    if (!st.active) return;
    const dx = e.clientX - st.startX;
    if (!st.moved && Math.abs(dx) > 6) {
      st.moved = true;
      e.currentTarget.setPointerCapture?.(st.pointerId);
    }
    if (st.moved && scrollerRef.current) {
      scrollerRef.current.scrollLeft = st.startScrollLeft - dx;
    }
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const st = dragRef.current;
    if (!st.active) return;
    if (st.moved) {
      e.currentTarget.releasePointerCapture?.(st.pointerId);
    }
    dragRef.current.active = false;
  };

  const handleColumnClick = (idx: number) => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    suppressExternalScrollRef.current = true;
    atmosUiSfx.playScrubTick(idx / Math.max(1, count - 1));
    onSelectIndex(idx);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      jumpToHour(clampedSelected + 1, true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      jumpToHour(clampedSelected - 1, true);
    } else if (e.key === "Home") {
      e.preventDefault();
      jumpToHour(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      jumpToHour(count - 1, true);
    }
  };

  if (count < 2) return null;

  const inspected = hourly[inspectedIdx];
  const inspectedPhaseVis = getPrecipPhaseVisual(
    inspected.precipPhase,
    inspected.precipType
  );
  const stabMeta = stabilityLabelTr(inspected.stabilityGrade);
  const hasNearNowcastPrecip =
    clampedSelected <= 6 &&
    minutely15.length >= 4 &&
    minutely15.some((m) => m.precipitation >= 0.04);

  return (
    <div className="surface-panel p-4 sm:p-6 space-y-4">
      {/* 1. ÜST RASATHANE BAŞLIĞI + MERCEK SEÇİCİ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-base sm:text-lg font-semibold tracking-tight text-ink-primary">
              Saatlik Sinoptik Meteogram
            </h2>
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] tracking-wider text-ink-secondary tabular">
              {count} SAAT · KESİNTİSİZ AKIŞ
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-muted">
            {showExtended
              ? "10 günlük (240s) birleşik kesinlik + sinoptik AI/Ensemble saatlik akış"
              : "Kaydırarak 7 günü incele veya 10. güne (240s) uzat; saate tıklayarak 3D sahneyi kilitle"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {clampedSelected > 0 && (
            <button
              type="button"
              onClick={() => jumpToHour(0, true)}
              className="atmos-btn inline-flex items-center gap-1.5 rounded-xl border border-[rgba(var(--atmos-accent-rgb),0.38)] bg-[rgba(var(--atmos-accent-rgb),0.12)] px-2.5 py-1.5 font-mono text-xs font-medium text-[var(--atmos-accent)]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Şimdi</span>
            </button>
          )}

          <div
            role="tablist"
            aria-label="Saatlik meteogram görünüm merceği"
            className="inline-flex rounded-xl border border-white/[0.08] bg-obsidian-950/75 p-1"
          >
            {LENS_OPTIONS.map((opt) => {
              const active = lens === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    atmosUiSfx.playNavTick();
                    setLens(opt.key);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    active
                      ? "border border-[rgba(var(--atmos-rim-rgb),0.28)] bg-white/[0.11] text-white shadow-[0_0_14px_-6px_rgba(var(--atmos-accent-rgb),0.55)]"
                      : "border border-transparent text-ink-secondary hover:text-ink-primary"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. 7-GÜNLÜK HIZLI GÜN ATLAMA RAYI + KAYDIRMA OKLARI */}
      <div className="flex items-center justify-between gap-2">
        <div className="no-scrollbar flex flex-1 items-center gap-1.5 overflow-x-auto py-0.5">
          {dayGroups.map((g, dIdx) => {
            const isDayActive = activeDayDate === g.date;
            return (
              <button
                key={g.date}
                type="button"
                onClick={() => {
                  setScrollDayDate(g.date);
                  jumpToHour(g.startIndex, true);
                }}
                className={`atmos-btn group flex shrink-0 items-center gap-2 rounded-xl border px-3 py-1.5 text-left transition-all tabular ${
                  isDayActive
                    ? "border-[rgba(var(--atmos-rim-rgb),0.34)] bg-white/[0.09] text-ink-primary shadow-[0_0_18px_-8px_rgba(var(--atmos-accent-rgb),0.6)]"
                    : "border-white/[0.07] bg-obsidian-950/55 text-ink-secondary hover:border-white/15 hover:text-ink-primary"
                }`}
              >
                <AnimatedWeatherIcon
                  code={g.dominantCode}
                  precipPhase={g.dominantPhase}
                  intensityMm={g.precipSumMm / Math.max(1, g.hourCount)}
                  phaseSeed={dIdx * 11 + 3}
                  className="h-4 w-4"
                />
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold">{g.dayName}</span>
                    <span className="font-mono text-[10px] text-ink-muted">
                      {g.shortDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className="text-ink-muted">
                      {formatTemperature(g.tempMin, unit)}
                    </span>
                    <span className="text-white/25">/</span>
                    <span className="font-medium text-ink-primary">
                      {formatTemperature(g.tempMax, unit)}
                    </span>
                    {g.maxPopPct >= 20 && (
                      <span className="text-[var(--atmos-accent)]">
                        · %{g.maxPopPct}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {hasExtendedHours && (
            <button
              type="button"
              onClick={() => {
                atmosUiSfx.playNavTick();
                const next = !showExtended;
                setExtended240(next);
                if (!next && selectedIndex >= 168) {
                  onSelectIndex(167);
                }
              }}
              className={`atmos-btn shrink-0 rounded-xl border px-3 py-2 font-mono text-[11px] font-medium transition-all ${
                showExtended
                  ? "border-signal-sky/40 bg-signal-sky/14 text-sky-200"
                  : "border-dashed border-white/20 bg-white/[0.03] text-ink-secondary hover:border-signal-sky/40 hover:text-ink-primary"
              }`}
            >
              {showExtended
                ? "7 Güne Daralt (168s)"
                : `+10. Güne Uzat (${fullHourly.length}s)`}
            </button>
          )}
        </div>

        <div className="hidden sm:flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => scrollByHours(-8)}
            aria-label="8 saat geri kaydır"
            className="atmos-btn flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-obsidian-950/65 text-ink-secondary hover:text-ink-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByHours(8)}
            aria-label="8 saat ileri kaydır"
            className="atmos-btn flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-obsidian-950/65 text-ink-secondary hover:text-ink-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 3. SEÇİLİ / İNCELENEN SAAT HASSAS TELEMETRİ DENETÇİSİ */}
      <div className="rounded-xl border border-white/[0.08] bg-obsidian-950/65 px-3.5 py-2.5 space-y-2.5 tabular">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 font-mono font-semibold text-ink-primary">
              <AnimatedWeatherIcon
                code={inspected.weatherCode}
                isNight={inspected.solarElevationDeg < -3}
                precipPhase={inspected.precipPhase}
                intensityMm={inspected.precipitation}
                windSpeedKmh={inspected.windSpeed}
                phaseSeed={inspectedIdx}
                className="h-6 w-6"
              />
              <span>
                {inspectedIdx === 0
                  ? `Şimdi (${inspected.hourLabel})`
                  : `${inspected.dayLabel} · ${inspected.hourLabel}`}
              </span>
            </span>

            <span className="font-medium text-ink-primary">
              {inspected.condition}
            </span>

            <span className="font-mono text-sm font-semibold text-ink-primary">
              <AnimatedNumber
                value={formatTemperature(inspected.temperature, unit)}
              />
              {inspected.tempP10 !== undefined &&
                inspected.tempP90 !== undefined && (
                  <span className="ml-1 text-[11px] font-normal text-ink-muted">
                    [{formatTemperature(inspected.tempP10, unit)}–
                    {formatTemperature(inspected.tempP90, unit)}]
                  </span>
                )}
            </span>

            <span className="text-ink-secondary">
              Hissedilen{" "}
              <strong className="font-mono text-ink-primary">
                {formatTemperature(inspected.apparentTemperature, unit)}
              </strong>
            </span>

            {inspected.wetBulbC !== undefined && (
              <span className="hidden md:inline text-ink-secondary">
                Tw{" "}
                <strong className="font-mono text-ink-primary">
                  {inspected.wetBulbC}°C
                </strong>
              </span>
            )}

            <span className="text-ink-secondary">
              Yağış{" "}
              <strong className={`font-mono ${inspectedPhaseVis.badgeTextClass}`}>
                %{inspected.precipProbability} · {inspected.precipitation.toFixed(1)} mm
              </strong>
              {inspected.precipConsensus.totalModels > 0 && (
                <span className="ml-1 font-mono text-[11px] text-ink-muted">
                  ({inspected.precipConsensus.agreeingModels}/
                  {inspected.precipConsensus.totalModels})
                </span>
              )}
            </span>

            <span className="text-ink-secondary">
              Rüzgar{" "}
              <strong className="font-mono text-ink-primary">
                {windDirectionToCompass(inspected.windDirection)}{" "}
                {formatWindSpeed(inspected.windSpeed, unit)}
              </strong>
              {inspected.windGusts >= inspected.windSpeed + 8 && (
                <span className="ml-1 font-mono text-[11px] text-signal-amber">
                  (Hamle {formatWindSpeed(inspected.windGusts, unit)})
                </span>
              )}
            </span>

            <span className="hidden xl:inline text-ink-secondary">
              Basınç{" "}
              <strong className="font-mono text-ink-primary">
                {Math.round(inspected.pressure)} hPa
              </strong>
            </span>

            {inspected.snowLineElevationM !== null &&
              inspected.snowLineElevationM !== undefined &&
              inspected.temperature <= 9 && (
                <span className="text-sky-200">
                  Kar Sınırı{" "}
                  <strong className="font-mono">{inspected.snowLineElevationM} m</strong>
                </span>
              )}
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            {inspected.stabilityGrade && (
              <span className={`rounded border px-1.5 py-0.5 ${stabMeta.cls}`}>
                {stabMeta.text}
              </span>
            )}
            <span className="hidden lg:inline text-ink-muted">
              {lens === "synoptic"
                ? "Eğri: 2m T + P10–P90 Zarfı"
                : lens === "thermo"
                  ? "Kesikli: Hissedilen · Alt: Tw / Kar"
                  : "Zarf: P90 Hamle · Alt: MSL Basınç"}
            </span>
          </div>
        </div>

        {/* İlk 6 saatte yağış sinyali varsa entegre 15-dakikalık mikro-nowcast şeridi */}
        {hasNearNowcastPrecip && (
          <div className="border-t border-white/[0.07] pt-2 flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-signal-sky shrink-0">
              15dk Radar Akışı (6s)
            </span>
            <div className="flex flex-1 min-w-[220px] items-end gap-0.5 h-6">
              {minutely15.slice(0, 24).map((m) => {
                const hPct = Math.min(100, Math.max(12, (m.precipitation / 2.5) * 100));
                const mVis = getPrecipPhaseVisual(m.precipPhase);
                return (
                  <div
                    key={m.time}
                    title={`${m.label} · ${m.precipitation.toFixed(2)} mm/15dk · ${formatTemperature(m.temperature, unit)}`}
                    className="flex-1 h-full flex items-end"
                  >
                    <span
                      className="block w-full rounded-t-[2px] transition-all"
                      style={{
                        height: `${m.precipitation >= 0.02 ? hPct : 10}%`,
                        backgroundColor:
                          m.precipitation >= 0.02
                            ? mVis.barFocusFill
                            : "rgba(255, 255, 255, 0.08)"
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="font-mono text-[10px] text-ink-muted">
              {minutely15[0]?.label} → {minutely15[Math.min(23, minutely15.length - 1)]?.label}
            </div>
          </div>
        )}
      </div>

      {/* 4. BİRLEŞİK SİNOPTİK METEOGRAM SAHNESİ (5 KATMANLI SÜTUN HİZALI TUVAL) */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#060a13]/90 overflow-hidden">
        {/* Sol & Sağ Kenar Optik Yumuşatma Maskeleri */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-5 bg-gradient-to-r from-[#060a13] to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-7 bg-gradient-to-l from-[#060a13] to-transparent"
        />

        <div
          ref={scrollerRef}
          tabIndex={0}
          role="region"
          aria-label="168 saatlik etkileşimli hava durumu meteogram şeridi"
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onMouseLeave={() => setHoverIdx((prev) => (prev === null ? prev : null))}
          className="no-scrollbar relative overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--atmos-accent)]"
        >
          <div
            className="relative"
            style={{ width: `${totalW}px`, height: `${STAGE_H}px` }}
          >
            {/* KATMAN A (SVG): Gökyüzü Işık Kuşağı, Gün Meridyenleri, P10–P90 Zarfı, Spline Eğriler ve Hyetograf Barları */}
            <svg
              width={totalW}
              height={STAGE_H}
              viewBox={`0 0 ${totalW} ${STAGE_H}`}
              className="pointer-events-none absolute inset-0 block"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="meteogramShroudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop
                    offset="0%"
                    stopColor="var(--atmos-accent)"
                    stopOpacity="0.22"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--atmos-accent)"
                    stopOpacity="0.04"
                  />
                </linearGradient>
                <linearGradient id="meteogramUnderGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop
                    offset="0%"
                    stopColor="var(--atmos-accent)"
                    stopOpacity="0.13"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--atmos-accent)"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              {/* Üst Gökyüzü Aydınlanma Bandı + Sanallaştırılmış Saat Meridyenleri */}
              {visibleIndices.map((i) => {
                const h = hourly[i];
                const xLeft = i * COL_W;
                const isMidnight = i > 0 && h.hourLabel === "00:00";
                const isSelected = i === clampedSelected;
                const isHovered = i === hoverIdx;
                return (
                  <g key={`col-bg-${h.time}`}>
                    <rect
                      x={xLeft}
                      y={0}
                      width={COL_W}
                      height={5}
                      fill={skyBandColor(h.solarElevationDeg)}
                    />
                    {(isSelected || isHovered) && (
                      <rect
                        x={xLeft + 1}
                        y={5}
                        width={COL_W - 2}
                        height={STAGE_H - 5}
                        fill={
                          isSelected
                            ? "rgba(var(--atmos-accent-rgb), 0.085)"
                            : "rgba(255, 255, 255, 0.03)"
                        }
                      />
                    )}
                    <line
                      x1={xLeft}
                      y1={5}
                      x2={xLeft}
                      y2={STAGE_H}
                      stroke={
                        isMidnight
                          ? "rgba(186, 230, 253, 0.24)"
                          : "rgba(255, 255, 255, 0.038)"
                      }
                      strokeWidth={isMidnight ? 1.2 : 1}
                      strokeDasharray={isMidnight ? undefined : "2 4"}
                    />
                  </g>
                );
              })}

              {/* Yatay Kılavuz Çizgileri (Saat-Güneş / İkon / Eğri / Yağış / Rüzgar katman ayrımları) */}
              <line
                x1={0}
                y1={48}
                x2={totalW}
                y2={48}
                stroke="rgba(255, 255, 255, 0.055)"
              />
              <line
                x1={0}
                y1={200}
                x2={totalW}
                y2={200}
                stroke="rgba(255, 255, 255, 0.045)"
              />
              <line
                x1={0}
                y1={HYETO_BASE_Y}
                x2={totalW}
                y2={HYETO_BASE_Y}
                stroke="rgba(255, 255, 255, 0.075)"
              />
              <line
                x1={0}
                y1={280}
                x2={totalW}
                y2={280}
                stroke="rgba(255, 255, 255, 0.055)"
              />

              {/* 0°C Donma İzotermi (yalnızca sıfır geçişi varsa) */}
              {geometry.zeroTempY !== null && (
                <line
                  x1={0}
                  y1={geometry.zeroTempY}
                  x2={totalW}
                  y2={geometry.zeroTempY}
                  stroke="rgba(125, 211, 252, 0.42)"
                  strokeWidth={1.1}
                  strokeDasharray="4 4"
                />
              )}

              {/* Astronomik Gün Doğumu / Gün Batımı Altın-Saat Dikey Çizgileri */}
              {solarMarkers.map((mk) => {
                const mx = mk.fractionalIndex * COL_W + COL_W / 2;
                const strokeCol =
                  mk.kind === "sunrise"
                    ? "rgba(251, 191, 36, 0.42)"
                    : "rgba(249, 115, 22, 0.38)";
                return (
                  <line
                    key={mk.id}
                    x1={mx}
                    y1={22}
                    x2={mx}
                    y2={HYETO_BASE_Y}
                    stroke={strokeCol}
                    strokeWidth={1}
                    strokeDasharray="2 3"
                  />
                );
              })}

              {/* 212-Üye P10–P90 Belirsizlik Zarfı veya P90 Hamle Zarfı */}
              {geometry.bandPath && (
                <path d={geometry.bandPath} fill="url(#meteogramShroudGrad)" />
              )}

              {/* Ana Eğri Altı Hafif Işık Dolgusu */}
              {geometry.primaryPath && (
                <path
                  d={`${geometry.primaryPath} L${totalW - COL_W / 2},${CURVE_BOT + 12} L${COL_W / 2},${CURVE_BOT + 12} Z`}
                  fill="url(#meteogramUnderGlow)"
                />
              )}

              {/* İkincil Kesikli Eğri (Hissedilen veya Rüzgar Hamlesi) */}
              {geometry.secondaryPath && (
                <path
                  d={geometry.secondaryPath}
                  fill="none"
                  stroke={lens === "wind" ? "#f59e0b" : "var(--atmos-accent)"}
                  strokeOpacity={0.75}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
              )}

              {/* Ana Sürekli Monoton Kübik Bezier Eğri */}
              {geometry.primaryPath && (
                <path
                  d={geometry.primaryPath}
                  fill="none"
                  stroke={lens === "wind" ? "var(--atmos-accent)" : "#f8fafc"}
                  strokeWidth={2.35}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Faz-Kodlu Yağış Hyetograf Sütunları (Görünür Pencere) */}
              {visibleIndices.map((i) => {
                const h = hourly[i];
                const cx = i * COL_W + COL_W / 2;
                const isFocus = i === clampedSelected || i === hoverIdx;
                const phaseVis = getPrecipPhaseVisual(h.precipPhase, h.precipType);
                const hasPrecipBar =
                  h.precipitation >= 0.05 || h.precipProbability >= 18;

                if (!hasPrecipBar) return null;

                // Karekök ölçekleme sayesinde hem 0.3 mm çiseleme hem 12 mm sağanak net okunur
                const mmRatio = Math.min(1, Math.sqrt(Math.max(0, h.precipitation) / 9));
                const popRatio = (h.precipProbability / 100) * 0.45;
                const barH = Math.max(
                  3,
                  Math.round(Math.max(mmRatio, popRatio) * HYETO_MAX_H)
                );

                return (
                  <rect
                    key={`hyeto-${h.time}`}
                    x={cx - 11}
                    y={HYETO_BASE_Y - barH}
                    width={22}
                    height={barH}
                    rx={3.5}
                    fill={isFocus ? phaseVis.barFocusFill : phaseVis.barFill}
                  />
                );
              })}

              {/* Sütun Merkez Düğümleri ve Seçili Saat Odak Halkası (Görünür Pencere) */}
              {visibleIndices.map((i) => {
                const h = hourly[i];
                const cx = i * COL_W + COL_W / 2;
                const cy = geometry.primaryYs[i] ?? CURVE_TOP + curveSpanH / 2;
                const isSelected = i === clampedSelected;
                const isHovered = i === hoverIdx;
                const ext = lens !== "wind" ? diurnalExtrema.get(i) : undefined;

                return (
                  <g key={`node-${h.time}`}>
                    {isSelected && (
                      <>
                        <line
                          x1={cx}
                          y1={5}
                          x2={cx}
                          y2={STAGE_H}
                          stroke="var(--atmos-accent)"
                          strokeOpacity={0.35}
                          strokeWidth={1}
                        />
                        <circle
                          cx={cx}
                          cy={cy}
                          r={9}
                          fill="var(--atmos-accent)"
                          fillOpacity={0.22}
                        />
                      </>
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 4.4 : isHovered ? 3.8 : ext ? 3.2 : 2.3}
                      fill={
                        isSelected
                          ? "var(--atmos-accent)"
                          : ext === "max"
                            ? "#fbbf24"
                            : ext === "min"
                              ? "#7dd3fc"
                              : "#f1f5f9"
                      }
                      stroke="#060a13"
                      strokeWidth={isSelected ? 2 : 1.3}
                    />
                  </g>
                );
              })}
            </svg>

            {/* KATMAN B: Astronomik Gün Doğumu / Gün Batımı Altın-Saat Etiketleri */}
            {solarMarkers
              .filter(
                (mk) =>
                  mk.fractionalIndex >= virtWin.startIdx - 1 &&
                  mk.fractionalIndex <= virtWin.endIdx + 1
              )
              .map((mk) => {
              const leftPx = mk.fractionalIndex * COL_W + COL_W / 2;
              const isRise = mk.kind === "sunrise";
              return (
                <div
                  key={`lbl-${mk.id}`}
                  style={{ left: `${leftPx}px` }}
                  className="pointer-events-none absolute top-[28px] z-20 -translate-x-1/2 flex items-center gap-0.5 whitespace-nowrap rounded-full border border-amber-400/35 bg-[#090e1a]/95 px-1.5 py-[1px] font-mono text-[9px] text-amber-200 shadow-md tabular"
                >
                  {isRise ? (
                    <Sunrise className="h-2.5 w-2.5 text-amber-300" />
                  ) : (
                    <Sunset className="h-2.5 w-2.5 text-orange-300" />
                  )}
                  <span>{mk.timeLabel}</span>
                </div>
              );
            })}

            {/* KATMAN C: Sanallaştırılmış Tıklanabilir Saatlik Sütunlar (Sıfır ekran dışı DOM/animasyon!) */}
            <div
              className="relative z-10 flex h-full will-change-transform"
              style={{ transform: `translate3d(${virtWin.offsetLeftPx}px, 0, 0)` }}
            >
              {visibleIndices.map((i) => {
                const h = hourly[i];
                const isSelected = i === clampedSelected;
                const isMidnight = i > 0 && h.hourLabel === "00:00";
                const ext = lens !== "wind" ? diurnalExtrema.get(i) : undefined;
                const nodeY = geometry.primaryYs[i] ?? 145;
                const phaseVis = getPrecipPhaseVisual(h.precipPhase, h.precipType);
                const isStrongGust = h.windGusts >= 42;

                const primaryReadout =
                  lens === "wind"
                    ? `${Math.round(toUnitWind(h.windSpeed, unit))}`
                    : formatTemperature(h.temperature, unit);

                return (
                  <button
                    key={h.time}
                    type="button"
                    onMouseEnter={() => setHoverIdx((prev) => (prev === i ? prev : i))}
                    onClick={() => handleColumnClick(i)}
                    aria-pressed={isSelected}
                    aria-label={`${h.dayLabel} ${h.hourLabel}, ${h.condition}, ${formatTemperature(h.temperature, unit)}, yağış olasılığı yüzde ${h.precipProbability}`}
                    style={{ width: `${COL_W}px` }}
                    className="group relative h-full shrink-0 text-center focus:outline-none tabular"
                  >
                    {/* Seçili Sütun Üst Işık Çizgisi */}
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2 top-0 h-[2px] rounded-full"
                        style={{
                          backgroundColor: "var(--atmos-accent)",
                          boxShadow: "0 0 10px var(--atmos-accent)"
                        }}
                      />
                    )}

                    {/* 1. Saat Etiketi veya Gece Yarısı Gün Dönümü Rozeti */}
                    <div className="pt-2 flex flex-col items-center">
                      {isMidnight ? (
                        <span className="rounded bg-sky-400/15 px-1.5 py-[1px] font-mono text-[10px] font-semibold text-sky-200">
                          {h.dayLabel}
                        </span>
                      ) : (
                        <span
                          className={`font-mono text-[11px] transition-colors ${
                            isSelected
                              ? "font-semibold text-white"
                              : i === 0
                                ? "font-semibold text-[var(--atmos-accent)]"
                                : "text-ink-muted group-hover:text-ink-primary"
                          }`}
                        >
                          {i === 0 ? "Şimdi" : h.hourLabel}
                        </span>
                      )}
                    </div>

                    {/* 2. 17-Durumlu Faz Kaymalı Animasyonlu Meteoroloji İkonu (Güneş şeridinden izole y=54..82px bandı) */}
                    <div className="pointer-events-none absolute inset-x-0 top-[54px] flex justify-center">
                      <AnimatedWeatherIcon
                        code={h.weatherCode}
                        isNight={h.solarElevationDeg < -3}
                        precipPhase={h.precipPhase}
                        intensityMm={h.precipitation}
                        windSpeedKmh={h.windSpeed}
                        phaseSeed={i}
                        className={`h-7 w-7 transition-transform duration-200 ${
                          isSelected
                            ? "scale-110"
                            : "group-hover:scale-105"
                        }`}
                      />
                    </div>

                    {/* 3. Eğri Düğümü Üstü Dinamik Değer Etiketi (İkon ve yağış bandıyla sıfır çakışmalı y=90..172px bandı) */}
                    <span
                      style={{
                        top: `${Math.max(90, Math.min(172, nodeY - 22))}px`
                      }}
                      className={`pointer-events-none absolute inset-x-0 flex items-center justify-center gap-0.5 font-mono text-xs transition-colors ${
                        isSelected
                          ? "font-bold text-white"
                          : ext === "max"
                            ? "font-semibold text-amber-200"
                            : ext === "min"
                              ? "font-semibold text-sky-200"
                              : "font-medium text-ink-primary"
                      }`}
                    >
                      {ext === "max" && (
                        <span className="text-[8px] text-amber-300">▲</span>
                      )}
                      {ext === "min" && (
                        <span className="text-[8px] text-sky-300">▼</span>
                      )}
                      <span>{primaryReadout}</span>
                    </span>

                    {/* 4. Hyetograf Üstü Ayrılmış Telemetri Satırı (y=203..229px; barlar y=236..274px aralığında kalır) */}
                    <div className="pointer-events-none absolute inset-x-0 top-[203px] flex flex-col items-center leading-tight font-mono">
                      {lens === "thermo" ? (
                        <>
                          <span className="text-[10px] text-ink-secondary">
                            Tw {h.wetBulbC ?? Math.round(h.dewPoint)}°
                          </span>
                          {h.snowLineElevationM !== null &&
                          h.snowLineElevationM !== undefined &&
                          h.temperature <= 9 ? (
                            <span className="text-[9px] text-sky-300">
                              ❄ {h.snowLineElevationM}m
                            </span>
                          ) : (
                            <span className="text-[9px] text-ink-muted">
                              %{h.humidity}
                            </span>
                          )}
                        </>
                      ) : lens === "wind" ? (
                        <>
                          <span className="text-[10px] text-ink-secondary">
                            {Math.round(h.pressure)}
                          </span>
                          <span className="text-[9px] text-ink-muted">hPa</span>
                        </>
                      ) : h.precipProbability >= 15 || h.precipitation >= 0.08 ? (
                        <>
                          <span
                            className={`text-[10px] font-semibold ${phaseVis.badgeTextClass}`}
                          >
                            %{h.precipProbability}
                          </span>
                          {h.precipitation >= 0.1 && (
                            <span className="text-[9px] text-ink-secondary">
                              {h.precipitation.toFixed(1)}
                            </span>
                          )}
                        </>
                      ) : null}
                    </div>

                    {/* 5. Aerodinamik Rüzgar Vektör Rayı (Gerçek Akış Yönü Oku + Hız) */}
                    <div
                      title={`Rüzgar: ${windDirectionToCompass(h.windDirection)} (${h.windDirection}°) · Hamle ${formatWindSpeed(h.windGusts, unit)}`}
                      className="pointer-events-none absolute inset-x-0 bottom-2.5 flex flex-col items-center gap-0.5 font-mono"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        className={`h-3.5 w-3.5 transition-transform duration-300 ${
                          isStrongGust
                            ? "text-signal-amber"
                            : isSelected
                              ? "text-[var(--atmos-accent)]"
                              : "text-ink-muted"
                        }`}
                        style={{
                          transform: `rotate(${(h.windDirection + 180) % 360}deg)`
                        }}
                        aria-hidden="true"
                      >
                        <path
                          d="M8 2.2 12.2 12.8 8 10.4 3.8 12.8Z"
                          fill="currentColor"
                        />
                      </svg>
                      <span
                        className={`text-[10px] ${
                          isStrongGust
                            ? "font-semibold text-signal-amber"
                            : "text-ink-muted"
                        }`}
                      >
                        {Math.round(toUnitWind(h.windSpeed, unit))}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. KOMPAKT FİZİKSEL FAZ & ENSTRÜMAN LEJANTI */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5 font-mono text-[10px] text-ink-muted">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-sky-400/75" />
            Yağmur
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-teal-300/75" />
            Karla Karışık
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-amber-400/80" />
            Donan Yağmur
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-slate-100/80" />
            Kar
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-rose-400/80" />
            Dolu
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>▲/▼ Gün İçi Ekstremum</span>
          <span className="hidden sm:inline">←/→ Klavye ile Saat Adımlama</span>
        </div>
      </div>
    </div>
  );
}

const HourlyForecastStrip = memo(HourlyForecastStripBase);
export default HourlyForecastStrip;
