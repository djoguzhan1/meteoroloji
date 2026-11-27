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
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  Gauge,
  RotateCcw,
  ShieldCheck,
  Snowflake,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
  Zap
} from "lucide-react";
import {
  buildConfidenceBandPath,
  buildHourlyDayGroups,
  buildSmoothCurvePath,
  buildSolarMarkers,
  computeAdaptiveMeteogramScale,
  type DayMicroPhaseSlot,
  detectDiurnalExtrema,
  detectSynopticEvents,
  getPrecipPhaseVisual,
  resolveHourlyDisplaySemantics
} from "@/lib/hourly-meteogram";
import { computeVirtualHourWindow } from "@/lib/perf-budgets";
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

type MeteogramLens = "synoptic" | "snow" | "thermo" | "wind" | "convective";

const LENS_OPTIONS: ReadonlyArray<{ key: MeteogramLens; label: string }> = [
  { key: "synoptic", label: "Meteogram" },
  { key: "snow", label: "Kar & Tutma" },
  { key: "thermo", label: "Hissedilen & Tw" },
  { key: "wind", label: "Rüzgar & Basınç" },
  { key: "convective", label: "Oraj & CAPE" }
];

// 8-Şeritli Piksel-Kilitli Gözlemevi Koordinat Sabitleri (Sıfır Çakışma Mimarisi)
const COL_W = 68;
const STAGE_H = 372;
const CURVE_TOP = 114;
const CURVE_BOT = 208;
const HYETO_BASE_Y = 316;
const HYETO_MAX_H = 54;

function toUnitTemp(c: number, unit: UnitSystem): number {
  return unit === "imperial" ? (c * 9) / 5 + 32 : c;
}

function toUnitWind(kmh: number, unit: UnitSystem): number {
  return unit === "imperial" ? kmh * 0.621371 : kmh;
}

function skyBandColor(solarElevDeg: number): string {
  if (solarElevDeg < -10) return "rgba(15, 23, 42, 0.72)";
  if (solarElevDeg < -2) return "rgba(59, 130, 246, 0.22)";
  if (solarElevDeg <= 8) return "rgba(251, 191, 36, 0.30)";
  return "rgba(56, 189, 248, 0.24)";
}

function microSlotColor(slot: DayMicroPhaseSlot): string {
  switch (slot) {
    case "storm":
      return "bg-amber-400";
    case "freezing_rain":
      return "bg-orange-400";
    case "snow":
      return "bg-slate-100";
    case "sleet":
      return "bg-teal-300";
    case "rain":
      return "bg-sky-400";
    case "prob":
      return "bg-sky-400/28";
    default:
      return "bg-white/[0.06]";
  }
}

function beaufortWindVisual(windKmh: number, gustKmh: number, isSelected: boolean): {
  arrowCls: string;
  speedCls: string;
} {
  if (gustKmh >= 55 || windKmh >= 39) {
    return { arrowCls: "text-rose-300", speedCls: "font-semibold text-rose-200" };
  }
  if (gustKmh >= 40 || windKmh >= 28) {
    return { arrowCls: "text-signal-amber", speedCls: "font-semibold text-amber-200" };
  }
  if (windKmh >= 18) {
    return { arrowCls: "text-sky-300", speedCls: "text-sky-200" };
  }
  return {
    arrowCls: isSelected ? "text-[var(--atmos-accent)]" : "text-ink-muted",
    speedCls: isSelected ? "text-ink-primary" : "text-ink-muted"
  };
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
  const [scrollMetrics, setScrollMetrics] = useState<{
    scrollLeft: number;
    viewportWidth: number;
  }>({
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
  const dayRailRef = useRef<HTMLDivElement | null>(null);
  const dayButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
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
    hoverIdx !== null
      ? Math.max(0, Math.min(hoverIdx, Math.max(0, count - 1)))
      : clampedSelected;

  const dayGroups = useMemo(
    () => buildHourlyDayGroups(hourly, daily),
    [hourly, daily]
  );
  const solarMarkers = useMemo(
    () => buildSolarMarkers(hourly, daily),
    [hourly, daily]
  );
  const diurnalExtrema = useMemo(() => detectDiurnalExtrema(hourly), [hourly]);
  const synopticEvents = useMemo(() => detectSynopticEvents(hourly), [hourly]);
  const semanticsList = useMemo(
    () => hourly.map((h) => resolveHourlyDisplaySemantics(h)),
    [hourly]
  );

  const activeDayDate =
    scrollDayDate ?? hourly[clampedSelected]?.time.slice(0, 10) ?? dayGroups[0]?.date ?? "";

  // Aktif gün kartını üstteki yatay gün rayında otomatik görünür tut
  useEffect(() => {
    const rail = dayRailRef.current;
    const btn = dayButtonRefs.current.get(activeDayDate);
    if (!rail || !btn) return;
    const btnLeft = btn.offsetLeft;
    const btnRight = btnLeft + btn.offsetWidth;
    if (btnLeft < rail.scrollLeft + 12 || btnRight > rail.scrollLeft + rail.clientWidth - 12) {
      rail.scrollTo({
        left: Math.max(0, btnLeft - rail.clientWidth * 0.25),
        behavior: "smooth"
      });
    }
  }, [activeDayDate]);

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

  const totalW = count * COL_W;

  // Görünür pencereye duyarlı Hibrit Y-Ölçekleme + P10-P90 Konturlu Olasılık Tüneli
  const geometry = useMemo(() => {
    if (count < 2) {
      return {
        primaryYs: [] as number[],
        secondaryPath: "",
        primaryPath: "",
        bandPath: "",
        bandHighPath: "",
        bandLowPath: "",
        zeroTempY: null as number | null,
        ticks: [] as Array<{ value: number; y: number; label: string; isZero?: boolean }>
      };
    }

    const primaryVals = hourly.map((h) => {
      if (lens === "wind") return toUnitWind(h.windSpeed, unit);
      if (lens === "convective") return Math.max(0, h.cape ?? 0);
      return toUnitTemp(h.temperature, unit);
    });

    const secondaryVals = hourly.map((h) => {
      if (lens === "snow") return toUnitTemp(h.wetBulbC ?? h.dewPoint, unit);
      if (lens === "thermo") return toUnitTemp(h.apparentTemperature, unit);
      if (lens === "wind") {
        return toUnitWind(Math.max(h.windGusts, h.gustP90 ?? h.windGusts), unit);
      }
      if (lens === "convective") {
        return (h.lightningProbPct ?? 0) * 12;
      }
      return toUnitTemp(h.temperature, unit);
    });

    const bandLows = hourly.map((h, i) => {
      if ((lens === "synoptic" || lens === "snow") && h.tempP10 !== undefined) {
        return toUnitTemp(h.tempP10, unit);
      }
      return primaryVals[i];
    });

    const bandHighs = hourly.map((h, i) => {
      if ((lens === "synoptic" || lens === "snow") && h.tempP90 !== undefined) {
        return toUnitTemp(h.tempP90, unit);
      }
      if (lens === "wind") {
        return secondaryVals[i];
      }
      return primaryVals[i];
    });

    const combinedSeries = hourly.map((_, i) =>
      Math.min(primaryVals[i], secondaryVals[i], bandLows[i])
    );
    const combinedHighs = hourly.map((_, i) =>
      Math.max(primaryVals[i], secondaryVals[i], bandHighs[i])
    );

    const freezingThreshold = unit === "imperial" ? 32 : 0;
    const isTempLens = lens === "synoptic" || lens === "snow" || lens === "thermo";

    // Görünür penceredeki hem alt hem üst sınırları kapsayacak adaptif ölçek dizisi
    const scaleDriver = hourly.map((_, i) =>
      i % 2 === 0 ? combinedSeries[i] : combinedHighs[i]
    );
    const scale = computeAdaptiveMeteogramScale({
      allValues: scaleDriver,
      visibleStartIdx: virtWin.startIdx,
      visibleEndIdx: virtWin.endIdx,
      curveTopY: CURVE_TOP,
      curveBotY: CURVE_BOT,
      minSpan:
        lens === "convective"
          ? 300
          : lens === "wind"
            ? unit === "imperial"
              ? 12
              : 18
            : unit === "imperial"
              ? 13
              : 7.5,
      clampZeroFloor: lens === "wind" || lens === "convective",
      unitSuffix:
        lens === "wind"
          ? ""
          : lens === "convective"
            ? ""
            : "°",
      zeroThreshold: isTempLens ? freezingThreshold : null
    });

    // Görünür penceredeki noktaları [CURVE_TOP, CURVE_BOT] bandı içinde güvenle tut
    const safeY = (val: number) =>
      Math.max(CURVE_TOP - 6, Math.min(CURVE_BOT + 6, scale.yOf(val)));

    const primaryPts = primaryVals.map((v, i) => ({
      x: i * COL_W + COL_W / 2,
      y: safeY(v)
    }));

    const secondaryPts = secondaryVals.map((v, i) => ({
      x: i * COL_W + COL_W / 2,
      y: safeY(v)
    }));

    const hasTempBand =
      (lens === "synoptic" || lens === "snow") &&
      hourly.some((h) => h.tempP10 !== undefined && h.tempP90 !== undefined);
    const hasBand = lens === "wind" || hasTempBand;

    const bandNodes = hasBand
      ? hourly.map((_, i) => ({
          x: i * COL_W + COL_W / 2,
          yHigh: safeY(bandHighs[i]),
          yLow: safeY(bandLows[i])
        }))
      : [];

    const bandPath = hasBand ? buildConfidenceBandPath(bandNodes) : "";
    const bandHighPath = hasTempBand
      ? buildSmoothCurvePath(bandNodes.map((n) => ({ x: n.x, y: n.yHigh })))
      : "";
    const bandLowPath = hasTempBand
      ? buildSmoothCurvePath(bandNodes.map((n) => ({ x: n.x, y: n.yLow })))
      : "";

    const zeroTempY =
      isTempLens && scale.minVal < freezingThreshold && scale.maxVal > freezingThreshold
        ? scale.yOf(freezingThreshold)
        : null;

    return {
      primaryYs: primaryPts.map((p) => p.y),
      primaryPath: buildSmoothCurvePath(primaryPts),
      secondaryPath:
        lens === "thermo" || lens === "snow" || lens === "wind"
          ? buildSmoothCurvePath(secondaryPts)
          : "",
      bandPath,
      bandHighPath,
      bandLowPath,
      zeroTempY,
      ticks: scale.ticks
    };
  }, [count, hourly, lens, unit, virtWin.endIdx, virtWin.startIdx]);

  // TimeScrubber veya dış tetikleyiciyle seçili saat değiştiğinde yatay konumu ortala
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
        Math.abs(prev.scrollLeft - sl) < 10 && Math.abs(prev.viewportWidth - vw) < 8
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
        Math.abs(prev.scrollLeft - sl) < COL_W * 0.5 && prev.viewportWidth === vw
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

  const jumpToHour = useCallback(
    (idx: number, updateSelection = true) => {
      const safe = Math.max(0, Math.min(idx, count - 1));
      const el = scrollerRef.current;
      if (el) {
        suppressExternalScrollRef.current = true;
        el.scrollTo({
          left: Math.max(0, safe * COL_W - COL_W * 1.2),
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
  const inspectedSem = semanticsList[inspectedIdx] ?? resolveHourlyDisplaySemantics(inspected);
  const inspectedPhaseVis = getPrecipPhaseVisual(
    inspectedSem.isWetActive ? inspectedSem.iconPhase : inspectedSem.potentialPhase,
    inspected.precipType
  );
  const stabMeta = stabilityLabelTr(inspected.stabilityGrade);
  const hasNearNowcastPrecip =
    clampedSelected <= 6 &&
    minutely15.length >= 4 &&
    minutely15.some((m) => m.precipitation >= 0.04);

  // Yatay kenarlara veya sol sabit Y-eksenine giren rozetlerin yarım kesilmesini önleyen opaklık fonksiyonu
  const computePillEdgeOpacity = (centerPx: number): number => {
    const leftGuard = scrollMetrics.scrollLeft + 58;
    const rightGuard = scrollMetrics.scrollLeft + scrollMetrics.viewportWidth - 34;
    if (centerPx < leftGuard - 18 || centerPx > rightGuard + 18) return 0;
    if (centerPx < leftGuard) return Math.max(0, (centerPx - (leftGuard - 18)) / 18);
    if (centerPx > rightGuard) return Math.max(0, (rightGuard + 18 - centerPx) / 18);
    return 1;
  };

  return (
    <div className="surface-panel p-4 sm:p-6 space-y-4">
      {/* 1. ÜST RASATHANE BAŞLIĞI + 7G/10G ANAHTARI + 5'Lİ MERCEK SEÇİCİ */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-base sm:text-lg font-semibold tracking-tight text-ink-primary">
              Saatlik Sinoptik Meteogram
            </h2>
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] tracking-wider text-ink-secondary tabular">
              {count} SAAT · 8-ŞERİTLİ RASATHANE AKIŞI
            </span>
          </div>
          <p className="mt-0.5 text-xs text-ink-muted">
            {showExtended
              ? "10 günlük (240s) birleşik EMOS kesinlik + sinoptik AI/Ensemble saatlik akış"
              : "Kaydırarak saatlik cephe, yağış, kar tutması ve oraj geçişlerini incele; saate tıklayarak 3D sahneyi kilitle"}
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

          {/* Gün rayında sıkışıp '+' olarak kesilen buton buraya temiz 7G / 10G segmenti olarak taşındı */}
          {hasExtendedHours && (
            <div
              role="group"
              aria-label="Saatlik tahmin ufku"
              className="inline-flex rounded-xl border border-white/[0.08] bg-obsidian-950/75 p-1 font-mono text-xs"
            >
              <button
                type="button"
                aria-pressed={!showExtended}
                onClick={() => {
                  atmosUiSfx.playNavTick();
                  setExtended240(false);
                  if (selectedIndex >= 168) onSelectIndex(167);
                }}
                className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-all ${
                  !showExtended
                    ? "bg-white/[0.12] text-white"
                    : "text-ink-muted hover:text-ink-primary"
                }`}
              >
                7G (168s)
              </button>
              <button
                type="button"
                aria-pressed={showExtended}
                onClick={() => {
                  atmosUiSfx.playNavTick();
                  setExtended240(true);
                }}
                className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-all ${
                  showExtended
                    ? "bg-signal-sky/20 text-sky-100"
                    : "text-ink-muted hover:text-ink-primary"
                }`}
              >
                10G ({fullHourly.length}s)
              </button>
            </div>
          )}

          <div
            role="tablist"
            aria-label="Saatlik meteogram görünüm merceği"
            className="no-scrollbar flex max-w-full overflow-x-auto rounded-xl border border-white/[0.08] bg-obsidian-950/75 p-1"
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
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
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

      {/* 2. MİKRO-FAZ İMZALI GÜN ATLAMA RAYI + KAYDIRMA OKLARI */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1 min-w-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[#0b101d] to-transparent"
          />
          <div
            ref={dayRailRef}
            className="no-scrollbar flex items-stretch gap-1.5 overflow-x-auto py-0.5 pr-5"
          >
            {dayGroups.map((g, dIdx) => {
              const isDayActive = activeDayDate === g.date;
              const isDryGroup = g.precipSumMm < 0.08 && g.snowAirSumCm < 0.1;
              return (
                <button
                  key={g.date}
                  ref={(el) => {
                    if (el) dayButtonRefs.current.set(g.date, el);
                    else dayButtonRefs.current.delete(g.date);
                  }}
                  type="button"
                  onClick={() => {
                    setScrollDayDate(g.date);
                    jumpToHour(g.startIndex, true);
                  }}
                  className={`atmos-btn group flex min-w-[122px] shrink-0 flex-col justify-between rounded-xl border px-3 py-1.5 text-left transition-all tabular ${
                    isDayActive
                      ? "border-[rgba(var(--atmos-rim-rgb),0.38)] bg-white/[0.09] text-ink-primary shadow-[0_0_18px_-8px_rgba(var(--atmos-accent-rgb),0.6)]"
                      : "border-white/[0.07] bg-obsidian-950/55 text-ink-secondary hover:border-white/15 hover:text-ink-primary"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <AnimatedWeatherIcon
                      code={
                        isDryGroup && g.dominantCode >= 51 && g.dominantCode < 95
                          ? 3
                          : g.dominantCode
                      }
                      precipPhase={isDryGroup ? "none" : g.dominantPhase}
                      intensityMm={g.precipSumMm / Math.max(1, g.hourCount)}
                      phaseSeed={dIdx * 11 + 3}
                      className="h-4 w-4 shrink-0"
                    />
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-semibold truncate">{g.dayName}</span>
                        <span className="font-mono text-[10px] text-ink-muted shrink-0">
                          {g.shortDate}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 font-mono text-[10px]">
                        <span className="text-ink-muted">
                          {formatTemperature(g.tempMin, unit)}
                        </span>
                        <span className="text-white/25">/</span>
                        <span className="font-medium text-ink-primary">
                          {formatTemperature(g.tempMax, unit)}
                        </span>
                        {g.snowAirSumCm >= 0.2 ? (
                          <span className="text-sky-200">
                            · ❄{g.snowAirSumCm.toFixed(1)}
                          </span>
                        ) : g.maxPopPct >= 20 ? (
                          <span className="text-[var(--atmos-accent)]">
                            · %{g.maxPopPct}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* 24-Saatlik Mikro-Faz İmza Çubuğu */}
                  <div
                    aria-hidden="true"
                    className="mt-1.5 flex h-[3px] w-full overflow-hidden rounded-full bg-white/[0.04] gap-[1px]"
                  >
                    {g.microSlots.map((slot, sIdx) => (
                      <span
                        key={sIdx}
                        className={`h-full flex-1 ${microSlotColor(slot)}`}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
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

      {/* 3. 6'LI MİKRO-ENSTRÜMAN SEÇİLİ SAAT KOKPİTİ (Düz metin yığını yerine hiyerarşik kartçıklar) */}
      <div className="rounded-2xl border border-white/[0.08] bg-obsidian-950/70 p-3 space-y-2.5 tabular">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <AnimatedWeatherIcon
              code={inspectedSem.effectiveCode}
              isNight={inspected.solarElevationDeg < -3}
              precipPhase={inspectedSem.iconPhase}
              intensityMm={inspected.precipitation}
              windSpeedKmh={inspected.windSpeed}
              phaseSeed={inspectedIdx}
              className="h-6 w-6 shrink-0"
            />
            <span className="font-mono text-xs sm:text-sm font-semibold text-white">
              {inspectedIdx === 0
                ? `Şimdi (${inspected.hourLabel})`
                : `${inspected.dayLabel} · ${inspected.hourLabel}`}
            </span>
            <span className="text-xs sm:text-sm font-medium text-ink-primary">
              {inspectedSem.statusLabelTr}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px]">
            {inspected.stabilityGrade && (
              <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 ${stabMeta.cls}`}>
                <ShieldCheck className="h-2.5 w-2.5" />
                {stabMeta.text}
              </span>
            )}
            <span className="hidden md:inline text-ink-muted">
              {lens === "synoptic"
                ? "Eğri: 2m Sıcaklık + P10–P90 Olasılık Tüneli"
                : lens === "snow"
                  ? "Kesikli: Islak Hazne Tw · Alt: Havada vs. Zeminde Kar"
                  : lens === "thermo"
                    ? "Kesikli: Hissedilen · Alt: Tw & Bağıl Nem"
                    : lens === "wind"
                      ? "Zarf: P90 Hamle · Alt: MSL Basınç"
                      : "Eğri: CAPE (J/kg) · Alt: Şimşek & LPI"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6 font-mono text-xs">
          {/* Pod 1: 2m Sıcaklık & P10-P90 */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-2.5 py-2">
            <div className="flex items-center justify-between text-[10px] text-ink-muted">
              <span>2m Sıcaklık</span>
              <Thermometer className="h-3 w-3 text-[var(--atmos-accent)]" />
            </div>
            <p className="mt-0.5 text-sm font-bold text-white">
              <AnimatedNumber value={formatTemperature(inspected.temperature, unit)} />
              {inspected.tempP10 !== undefined && inspected.tempP90 !== undefined && (
                <span className="ml-1 text-[10px] font-normal text-sky-200/80">
                  [{formatTemperature(inspected.tempP10, unit)}..
                  {formatTemperature(inspected.tempP90, unit)}]
                </span>
              )}
            </p>
          </div>

          {/* Pod 2: Hissedilen & Islak Hazne Tw */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-2.5 py-2">
            <div className="flex items-center justify-between text-[10px] text-ink-muted">
              <span>Hissedilen & Tw</span>
              <span className="text-ink-secondary">%{inspected.humidity}</span>
            </div>
            <p className="mt-0.5 text-xs font-semibold text-ink-primary">
              {formatTemperature(inspected.apparentTemperature, unit)}
              {inspected.wetBulbC !== undefined && (
                <span className="text-sky-200"> · Tw {inspected.wetBulbC}°C</span>
              )}
            </p>
          </div>

          {/* Pod 3: Yağış & Model Uzlaşısı */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-2.5 py-2">
            <div className="flex items-center justify-between text-[10px] text-ink-muted">
              <span>Yağış & Uzlaşı</span>
              <Droplets className="h-3 w-3 text-sky-300" />
            </div>
            <p className={`mt-0.5 text-xs font-semibold ${inspectedPhaseVis.badgeTextClass}`}>
              %{inspected.precipProbability} · {inspected.precipitation.toFixed(1)} mm
              {inspected.precipConsensus.totalModels > 0 && (
                <span className="ml-1 text-[10px] font-normal text-ink-muted">
                  ({inspected.precipConsensus.agreeingModels}/
                  {inspected.precipConsensus.totalModels})
                </span>
              )}
            </p>
          </div>

          {/* Pod 4: Havada/Zeminde Kar & Kar Sınırı */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-2.5 py-2">
            <div className="flex items-center justify-between text-[10px] text-ink-muted">
              <span>Kar & Sınır</span>
              <Snowflake className="h-3 w-3 text-sky-200" />
            </div>
            {(inspected.airSnowCm ?? 0) > 0 || (inspected.airSnowProbPct ?? 0) >= 15 ? (
              <p className="mt-0.5 text-xs font-semibold text-white">
                H {(inspected.airSnowCm ?? 0).toFixed(1)} · Y{" "}
                {(inspected.groundSnowCm ?? 0).toFixed(1)} cm
              </p>
            ) : (
              <p className="mt-0.5 text-xs font-semibold text-sky-200">
                Sınır{" "}
                {inspected.snowLineElevationM !== null &&
                inspected.snowLineElevationM !== undefined
                  ? `${inspected.snowLineElevationM} m`
                  : "—"}
              </p>
            )}
          </div>

          {/* Pod 5: Rüzgar & Hamle */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-2.5 py-2">
            <div className="flex items-center justify-between text-[10px] text-ink-muted">
              <span>Rüzgar & Hamle</span>
              <Wind className="h-3 w-3 text-signal-sky" />
            </div>
            <p className="mt-0.5 text-xs font-semibold text-ink-primary">
              {windDirectionToCompass(inspected.windDirection)}{" "}
              {formatWindSpeed(inspected.windSpeed, unit)}
              {inspected.windGusts >= inspected.windSpeed + 7 && (
                <span className="ml-1 text-[10px] text-amber-200">
                  (G {Math.round(toUnitWind(inspected.windGusts, unit))})
                </span>
              )}
            </p>
          </div>

          {/* Pod 6: Basınç & Elektriksel / CAPE */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-2.5 py-2">
            <div className="flex items-center justify-between text-[10px] text-ink-muted">
              <span>Basınç & Oraj</span>
              {(inspected.lightningProbPct ?? 0) >= 20 ? (
                <Zap className="h-3 w-3 text-signal-amber" />
              ) : (
                <Gauge className="h-3 w-3 text-ink-muted" />
              )}
            </div>
            <p className="mt-0.5 text-xs font-semibold text-ink-primary">
              {Math.round(inspected.pressure)} hPa
              {(inspected.lightningProbPct ?? 0) >= 15 ? (
                <span className="ml-1 text-amber-200">
                  · ⚡%{inspected.lightningProbPct}
                </span>
              ) : inspected.cape !== null && inspected.cape >= 80 ? (
                <span className="ml-1 text-[10px] text-ink-muted">
                  · {inspected.cape}J
                </span>
              ) : null}
            </p>
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
              {minutely15[0]?.label} →{" "}
              {minutely15[Math.min(23, minutely15.length - 1)]?.label}
            </div>
          </div>
        )}
      </div>

      {/* 4. 8-ŞERİTLİ SİNOPTİK METEOGRAM TUVALİ + SABİT SOL Y-EKSENİ CETVELİ */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#060a13]/92 overflow-hidden">
        {/* SABİT SOL Y-EKSENİ CETVELİ (Kaydırmadan bağımsız referans dereceleri) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-30 w-12 bg-gradient-to-r from-[#060a13] via-[#060a13]/92 to-transparent"
        >
          {geometry.ticks.map((tk) => (
            <span
              key={`ytick-${tk.value}`}
              style={{ top: `${tk.y}px` }}
              className={`absolute left-2 -translate-y-1/2 font-mono text-[9px] tabular ${
                tk.isZero
                  ? "font-semibold text-sky-300"
                  : "text-slate-400/80"
              }`}
            >
              {tk.label}
            </span>
          ))}
          <span className="absolute left-2 top-[232px] font-mono text-[8px] uppercase tracking-wider text-slate-500">
            {lens === "snow" ? "cm" : lens === "wind" ? "hPa" : lens === "convective" ? "⚡%" : "Yağış"}
          </span>
          <span className="absolute left-2 bottom-3 font-mono text-[8px] uppercase tracking-wider text-slate-500">
            Rüzg
          </span>
        </div>

        {/* Sağ Kenar Optik Yumuşatma Maskesi */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-7 bg-gradient-to-l from-[#060a13] to-transparent"
        />

        <div
          ref={scrollerRef}
          tabIndex={0}
          role="region"
          aria-label="Saatlik etkileşimli hava durumu meteogram şeridi"
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
            {/* KATMAN A (SVG): Gökyüzü Kuşağı, İzotermler, Konturlu P10–P90 Tüneli, Eğriler ve P50+P90/Hayalet Hyetograf */}
            <svg
              width={totalW}
              height={STAGE_H}
              viewBox={`0 0 ${totalW} ${STAGE_H}`}
              className="pointer-events-none absolute inset-0 block"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="meteogramShroudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="meteogramUnderGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop
                    offset="0%"
                    stopColor="var(--atmos-accent)"
                    stopOpacity="0.15"
                  />
                  <stop
                    offset="100%"
                    stopColor="var(--atmos-accent)"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              {/* Şerit 1 (y=0..6px): Gökyüzü Işık Kuşağı + Saat Meridyenleri */}
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
                      height={6}
                      fill={skyBandColor(h.solarElevationDeg)}
                    />
                    {(isSelected || isHovered) && (
                      <rect
                        x={xLeft + 1}
                        y={6}
                        width={COL_W - 2}
                        height={STAGE_H - 6}
                        fill={
                          isSelected
                            ? "rgba(var(--atmos-accent-rgb), 0.09)"
                            : "rgba(255, 255, 255, 0.032)"
                        }
                      />
                    )}
                    <line
                      x1={xLeft}
                      y1={6}
                      x2={xLeft}
                      y2={STAGE_H}
                      stroke={
                        isMidnight
                          ? "rgba(125, 211, 252, 0.28)"
                          : "rgba(255, 255, 255, 0.038)"
                      }
                      strokeWidth={isMidnight ? 1.25 : 1}
                      strokeDasharray={isMidnight ? undefined : "2 4"}
                    />
                  </g>
                );
              })}

              {/* 8-Şerit Katman Ayırıcı Yatay Çizgiler */}
              <line x1={0} y1={53} x2={totalW} y2={53} stroke="rgba(255, 255, 255, 0.06)" />
              <line x1={0} y1={220} x2={totalW} y2={220} stroke="rgba(255, 255, 255, 0.05)" />
              <line
                x1={0}
                y1={HYETO_BASE_Y}
                x2={totalW}
                y2={HYETO_BASE_Y}
                stroke="rgba(255, 255, 255, 0.085)"
              />
              <line x1={0} y1={322} x2={totalW} y2={322} stroke="rgba(255, 255, 255, 0.06)" />

              {/* Adaptif Y-Ekseni Yatay Kılavuz Çizgileri */}
              {geometry.ticks.map((tk) => (
                <line
                  key={`grid-y-${tk.value}`}
                  x1={0}
                  y1={tk.y}
                  x2={totalW}
                  y2={tk.y}
                  stroke={
                    tk.isZero
                      ? "rgba(125, 211, 252, 0.46)"
                      : "rgba(255, 255, 255, 0.042)"
                  }
                  strokeWidth={tk.isZero ? 1.15 : 1}
                  strokeDasharray={tk.isZero ? "4 4" : "2 6"}
                />
              ))}

              {/* 0°C Donma İzotermi (tick üstüne düşmemişse ayrıca çiz) */}
              {geometry.zeroTempY !== null &&
                !geometry.ticks.some((tk) => tk.isZero) && (
                  <line
                    x1={0}
                    y1={geometry.zeroTempY}
                    x2={totalW}
                    y2={geometry.zeroTempY}
                    stroke="rgba(125, 211, 252, 0.45)"
                    strokeWidth={1.15}
                    strokeDasharray="4 4"
                  />
                )}

              {/* Astronomik Gün Doğumu / Gün Batımı Dikey Çizgileri */}
              {solarMarkers.map((mk) => {
                const mx = mk.fractionalIndex * COL_W + COL_W / 2;
                const strokeCol =
                  mk.kind === "sunrise"
                    ? "rgba(251, 191, 36, 0.38)"
                    : "rgba(249, 115, 22, 0.34)";
                return (
                  <line
                    key={mk.id}
                    x1={mx}
                    y1={46}
                    x2={mx}
                    y2={HYETO_BASE_Y}
                    stroke={strokeCol}
                    strokeWidth={1}
                    strokeDasharray="2 3"
                  />
                );
              })}

              {/* Otomatik Sinoptik Cephe & Kar Dönüşüm İşaret Çizgileri */}
              {synopticEvents.map((ev) => {
                const ex = ev.hourIndex * COL_W + COL_W / 2;
                return (
                  <line
                    key={`ev-line-${ev.id}`}
                    x1={ex}
                    y1={46}
                    x2={ex}
                    y2={HYETO_BASE_Y}
                    stroke={ev.lineStroke}
                    strokeOpacity={0.35}
                    strokeWidth={1.1}
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* P10–P90 Olasılık Zarfı Dolgusu + Üst/Alt Kontur Çizgileri (Artık Net Görünür!) */}
              {geometry.bandPath && (
                <path d={geometry.bandPath} fill="url(#meteogramShroudGrad)" />
              )}
              {geometry.bandHighPath && (
                <path
                  d={geometry.bandHighPath}
                  fill="none"
                  stroke="#7dd3fc"
                  strokeOpacity={0.42}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              )}
              {geometry.bandLowPath && (
                <path
                  d={geometry.bandLowPath}
                  fill="none"
                  stroke="#7dd3fc"
                  strokeOpacity={0.36}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              )}

              {/* Ana Eğri Altı Hafif Işık Dolgusu */}
              {geometry.primaryPath && (
                <path
                  d={`${geometry.primaryPath} L${totalW - COL_W / 2},${CURVE_BOT + 10} L${COL_W / 2},${CURVE_BOT + 10} Z`}
                  fill="url(#meteogramUnderGlow)"
                />
              )}

              {/* İkincil Kesikli Eğri (Tw, Hissedilen veya Rüzgar Hamlesi) */}
              {geometry.secondaryPath && (
                <path
                  d={geometry.secondaryPath}
                  fill="none"
                  stroke={
                    lens === "wind"
                      ? "#f59e0b"
                      : lens === "snow"
                        ? "#38bdf8"
                        : "var(--atmos-accent)"
                  }
                  strokeOpacity={0.82}
                  strokeWidth={1.55}
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
              )}

              {/* Ana Sürekli Monoton Kübik Bezier Eğri */}
              {geometry.primaryPath && (
                <path
                  d={geometry.primaryPath}
                  fill="none"
                  stroke={
                    lens === "wind"
                      ? "var(--atmos-accent)"
                      : lens === "convective"
                        ? "#fbbf24"
                        : "#f8fafc"
                  }
                  strokeWidth={2.45}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Şerit 7 (y=258..316px): P50 Dolu Bar + P90 Bıyık Çizgisi VEYA 0.0mm Kesikli Olasılık Hayalet Çerçevesi */}
              {visibleIndices.map((i) => {
                const h = hourly[i];
                const sem = semanticsList[i] ?? resolveHourlyDisplaySemantics(h);
                const cx = i * COL_W + COL_W / 2;
                const isFocus = i === clampedSelected || i === hoverIdx;

                // Mercek 5: Oraj & CAPE Şimşek Olasılık Barları
                if (lens === "convective") {
                  const ltP = h.lightningProbPct ?? 0;
                  if (ltP < 10) return null;
                  const ltBarH = Math.max(4, Math.round((ltP / 100) * HYETO_MAX_H));
                  return (
                    <rect
                      key={`hyeto-lt-${h.time}`}
                      x={cx - 11}
                      y={HYETO_BASE_Y - ltBarH}
                      width={22}
                      height={ltBarH}
                      rx={3.5}
                      fill={
                        h.isThundersnow
                          ? "#38bdf8"
                          : ltP >= 55
                            ? "#fb7185"
                            : isFocus
                              ? "#fbbf24"
                              : "rgba(251, 191, 36, 0.52)"
                      }
                    />
                  );
                }

                // Mercek 2: Kar & Tutma (Havada vs Zeminde Çift Katmanlı Kar Barı)
                if (lens === "snow") {
                  const airCm = h.airSnowCm ?? 0;
                  const gndCm = h.groundSnowCm ?? 0;
                  const sProb = h.airSnowProbPct ?? 0;
                  if (airCm < 0.05 && sProb < 15) return null;

                  if (airCm < 0.05) {
                    const ghostH = Math.max(5, Math.round((sProb / 100) * HYETO_MAX_H * 0.55));
                    return (
                      <rect
                        key={`hyeto-sghost-${h.time}`}
                        x={cx - 11}
                        y={HYETO_BASE_Y - ghostH}
                        width={22}
                        height={ghostH}
                        rx={3.5}
                        fill="rgba(125, 211, 252, 0.06)"
                        stroke="rgba(125, 211, 252, 0.45)"
                        strokeWidth={1}
                        strokeDasharray="2.5 2.5"
                      />
                    );
                  }

                  const snowBarH = Math.max(
                    5,
                    Math.round(Math.min(1, Math.sqrt(airCm / 4.5)) * HYETO_MAX_H)
                  );
                  const gndBarH =
                    gndCm >= 0.05
                      ? Math.max(3, Math.round(snowBarH * Math.min(1, gndCm / airCm)))
                      : 0;
                  return (
                    <g key={`hyeto-snow-${h.time}`}>
                      <rect
                        x={cx - 11}
                        y={HYETO_BASE_Y - snowBarH}
                        width={22}
                        height={snowBarH}
                        rx={3.5}
                        fill={isFocus ? "rgba(125, 211, 252, 0.72)" : "rgba(56, 189, 248, 0.42)"}
                      />
                      {gndBarH > 0 && (
                        <rect
                          x={cx - 8}
                          y={HYETO_BASE_Y - gndBarH}
                          width={16}
                          height={gndBarH}
                          rx={2.5}
                          fill="#f8fafc"
                        />
                      )}
                    </g>
                  );
                }

                // Standart Yağış Hyetografı:
                // 1) `0.0 mm` ama olasılık >= %18 -> Kesikli Hayalet Olasılık Çerçevesi (Yanıltıcı dolu bar çizmez!)
                if (!sem.isWetActive) {
                  if (!sem.isProbabilisticGhost) return null;
                  const potVis = getPrecipPhaseVisual(sem.potentialPhase, h.precipType);
                  const ghostH = Math.max(
                    5,
                    Math.round((h.precipProbability / 100) * HYETO_MAX_H * 0.52)
                  );
                  return (
                    <rect
                      key={`hyeto-ghost-${h.time}`}
                      x={cx - 11}
                      y={HYETO_BASE_Y - ghostH}
                      width={22}
                      height={ghostH}
                      rx={3.5}
                      fill={potVis.stroke}
                      fillOpacity={isFocus ? 0.13 : 0.06}
                      stroke={potVis.stroke}
                      strokeOpacity={isFocus ? 0.72 : 0.45}
                      strokeWidth={1.1}
                      strokeDasharray="2.5 2.5"
                    />
                  );
                }

                // 2) Gerçek Aktif Yağış (`>= 0.05 mm`): Dolu P50 Bar + P90 Üst Senaryo Bıyık Çizgisi (Whisker)
                const phaseVis = getPrecipPhaseVisual(sem.iconPhase, h.precipType);
                const mmRatio = Math.min(1, Math.sqrt(Math.max(0, h.precipitation) / 9));
                const barH = Math.max(5, Math.round(mmRatio * HYETO_MAX_H));
                const p90Mm = h.precipConsensus.p90Mm ?? h.precipitation;
                const p90Ratio = Math.min(1, Math.sqrt(Math.max(0, p90Mm) / 9));
                const p90H = Math.round(p90Ratio * HYETO_MAX_H);
                const showWhisker = p90Mm > h.precipitation + 0.25 && p90H > barH + 3;

                return (
                  <g key={`hyeto-wet-${h.time}`}>
                    {showWhisker && (
                      <>
                        <line
                          x1={cx}
                          y1={HYETO_BASE_Y - barH}
                          x2={cx}
                          y2={HYETO_BASE_Y - p90H}
                          stroke={phaseVis.stroke}
                          strokeOpacity={0.68}
                          strokeWidth={1.2}
                        />
                        <line
                          x1={cx - 4.5}
                          y1={HYETO_BASE_Y - p90H}
                          x2={cx + 4.5}
                          y2={HYETO_BASE_Y - p90H}
                          stroke={phaseVis.stroke}
                          strokeOpacity={0.78}
                          strokeWidth={1.2}
                        />
                      </>
                    )}
                    <rect
                      x={cx - 11}
                      y={HYETO_BASE_Y - barH}
                      width={22}
                      height={barH}
                      rx={3.5}
                      fill={isFocus ? phaseVis.barFocusFill : phaseVis.barFill}
                    />
                  </g>
                );
              })}

              {/* Sütun Merkez Düğümleri ve Seçili Saat Odak Halkası */}
              {visibleIndices.map((i) => {
                const h = hourly[i];
                const cx = i * COL_W + COL_W / 2;
                const cy = geometry.primaryYs[i] ?? (CURVE_TOP + CURVE_BOT) / 2;
                const isSelected = i === clampedSelected;
                const isHovered = i === hoverIdx;
                const ext =
                  lens !== "wind" && lens !== "convective"
                    ? diurnalExtrema.get(i)
                    : undefined;

                return (
                  <g key={`node-${h.time}`}>
                    {isSelected && (
                      <>
                        <line
                          x1={cx}
                          y1={6}
                          x2={cx}
                          y2={STAGE_H}
                          stroke="var(--atmos-accent)"
                          strokeOpacity={0.38}
                          strokeWidth={1}
                        />
                        <circle
                          cx={cx}
                          cy={cy}
                          r={9.5}
                          fill="var(--atmos-accent)"
                          fillOpacity={0.24}
                        />
                      </>
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 4.5 : isHovered ? 3.8 : ext ? 3.3 : 2.3}
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

            {/* KATMAN B (Şerit 3 · top=29px): Kenar Korumalı Güneş Doğumu/Batımı ve Sinoptik Olay Rozetleri */}
            {solarMarkers
              .filter(
                (mk) =>
                  mk.fractionalIndex >= virtWin.startIdx - 0.5 &&
                  mk.fractionalIndex <= virtWin.endIdx + 0.5
              )
              .map((mk) => {
                const leftPx = mk.fractionalIndex * COL_W + COL_W / 2;
                const edgeOpacity = computePillEdgeOpacity(leftPx);
                if (edgeOpacity <= 0.04) return null;
                const isRise = mk.kind === "sunrise";
                return (
                  <div
                    key={`lbl-${mk.id}`}
                    style={{ left: `${leftPx}px`, opacity: edgeOpacity }}
                    className="pointer-events-none absolute top-[29px] z-20 -translate-x-1/2 flex items-center gap-0.5 whitespace-nowrap rounded-full border border-amber-400/38 bg-[#090e1a]/95 px-1.5 py-[1px] font-mono text-[9px] text-amber-200 shadow-md tabular transition-opacity duration-150"
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

            {synopticEvents
              .filter(
                (ev) =>
                  ev.hourIndex >= virtWin.startIdx &&
                  ev.hourIndex <= virtWin.endIdx &&
                  solarMarkers.every(
                    (mk) => Math.abs(mk.fractionalIndex - ev.hourIndex) >= 1.25
                  )
              )
              .map((ev) => {
                const leftPx = ev.hourIndex * COL_W + COL_W / 2;
                const edgeOpacity = computePillEdgeOpacity(leftPx);
                if (edgeOpacity <= 0.04) return null;
                return (
                  <div
                    key={`ev-pill-${ev.id}`}
                    style={{ left: `${leftPx}px`, opacity: edgeOpacity }}
                    className={`pointer-events-none absolute top-[29px] z-20 -translate-x-1/2 whitespace-nowrap rounded-full border px-1.5 py-[1px] font-mono text-[9px] font-medium shadow-md tabular transition-opacity duration-150 ${ev.badgeClass}`}
                  >
                    {ev.labelTr}
                  </div>
                );
              })}

            {/* KATMAN C: Sanallaştırılmış Tıklanabilir Sütunlar (TÜM ALT KATMANLAR MUTLAK KONUMLU -> SIFIR ÇAKIŞMA!) */}
            <div
              className="relative z-10 flex h-full will-change-transform"
              style={{ transform: `translate3d(${virtWin.offsetLeftPx}px, 0, 0)` }}
            >
              {visibleIndices.map((i) => {
                const h = hourly[i];
                const sem = semanticsList[i] ?? resolveHourlyDisplaySemantics(h);
                const isSelected = i === clampedSelected;
                const isMidnight = i > 0 && h.hourLabel === "00:00";
                const ext =
                  lens !== "wind" && lens !== "convective"
                    ? diurnalExtrema.get(i)
                    : undefined;
                const nodeY = geometry.primaryYs[i] ?? 160;
                const phaseVis = getPrecipPhaseVisual(
                  sem.isWetActive ? sem.iconPhase : sem.potentialPhase,
                  h.precipType
                );
                const windVis = beaufortWindVisual(h.windSpeed, h.windGusts, isSelected);

                const primaryReadout =
                  lens === "wind"
                    ? `${Math.round(toUnitWind(h.windSpeed, unit))}`
                    : lens === "convective"
                      ? `${Math.round(h.cape ?? 0)}`
                      : formatTemperature(h.temperature, unit);

                // Düğüm etiketi: Eğri tavanına çok yaklaşırsa altına, aksi halde üstüne yerleşir (ikon şeridine asla değmez)
                const labelTopPx =
                  nodeY < CURVE_TOP + 10
                    ? Math.min(CURVE_BOT - 4, nodeY + 9)
                    : Math.max(93, Math.min(188, nodeY - 21));

                return (
                  <button
                    key={h.time}
                    type="button"
                    onMouseEnter={() => setHoverIdx((prev) => (prev === i ? prev : i))}
                    onClick={() => handleColumnClick(i)}
                    aria-pressed={isSelected}
                    aria-label={`${h.dayLabel} ${h.hourLabel}, ${sem.statusLabelTr}, ${formatTemperature(h.temperature, unit)}, yağış olasılığı yüzde ${h.precipProbability}`}
                    style={{ width: `${COL_W}px` }}
                    className="group relative block h-full shrink-0 p-0 text-center focus:outline-none tabular"
                  >
                    {/* Seçili Sütun Üst Işık Çizgisi */}
                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-2 top-0 h-[2px] rounded-full"
                        style={{
                          backgroundColor: "var(--atmos-accent)",
                          boxShadow: "0 0 10px var(--atmos-accent)"
                        }}
                      />
                    )}

                    {/* Şerit 2 (MUTLAK top=8px..26px): Saat Etiketi veya Gece Yarısı Gün Dönümü Rozeti */}
                    <div className="pointer-events-none absolute inset-x-0 top-[8px] flex h-[18px] items-center justify-center">
                      {isMidnight ? (
                        <span className="rounded-md border border-sky-400/30 bg-sky-400/16 px-1.5 py-[1px] font-mono text-[10px] font-semibold text-sky-100">
                          {h.dayLabel}
                        </span>
                      ) : (
                        <span
                          className={`font-mono text-[11px] leading-none transition-colors ${
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

                    {/* Şerit 4 (MUTLAK top=58px..88px): Dürüst Fazlı Meteoroloji İkonu */}
                    <div className="pointer-events-none absolute inset-x-0 top-[58px] flex justify-center">
                      <div className="relative">
                        <AnimatedWeatherIcon
                          code={sem.effectiveCode}
                          isNight={h.solarElevationDeg < -3}
                          precipPhase={sem.iconPhase}
                          intensityMm={h.precipitation}
                          windSpeedKmh={h.windSpeed}
                          phaseSeed={i}
                          className={`h-7 w-7 transition-transform duration-200 ${
                            isSelected ? "scale-110" : "group-hover:scale-105"
                          }`}
                        />
                        {(h.lightningProbPct ?? 0) >= 35 && sem.effectiveCode < 95 && (
                          <span
                            aria-hidden="true"
                            className="absolute -right-1.5 -top-1 text-[9px] text-amber-300"
                          >
                            ⚡
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Şerit 5 (MUTLAK top=93..188px): Eğri Düğümü Değer Etiketi */}
                    <span
                      style={{ top: `${labelTopPx}px` }}
                      className={`pointer-events-none absolute inset-x-0 flex items-center justify-center gap-0.5 font-mono text-xs leading-none transition-colors ${
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

                    {/* Şerit 6 (MUTLAK top=225px..253px): Hyetograf Üstü İkili Sayısal Okuma */}
                    <div className="pointer-events-none absolute inset-x-0 top-[225px] flex h-[28px] flex-col items-center justify-center leading-tight font-mono">
                      {lens === "convective" ? (
                        (h.lightningProbPct ?? 0) >= 10 || (h.lpiJkg ?? 0) >= 0.2 ? (
                          <>
                            <span className="text-[10px] font-semibold text-amber-300">
                              ⚡%{h.lightningProbPct ?? 0}
                            </span>
                            <span className="text-[9px] text-ink-muted">
                              {(h.lpiJkg ?? 0) > 0 ? `${(h.lpiJkg ?? 0).toFixed(1)}J` : "LPI"}
                            </span>
                          </>
                        ) : (
                          <span className="text-[9px] text-white/25">—</span>
                        )
                      ) : lens === "snow" ? (
                        (h.airSnowCm ?? 0) >= 0.05 || (h.airSnowProbPct ?? 0) >= 15 ? (
                          <>
                            <span className="text-[10px] font-semibold text-sky-200">
                              H {(h.airSnowCm ?? 0).toFixed(1)}
                            </span>
                            <span className="text-[9px] font-semibold text-white">
                              Y {(h.groundSnowCm ?? 0).toFixed(1)}
                            </span>
                          </>
                        ) : h.icingRisk === "black_ice" ? (
                          <span className="text-[9px] font-semibold text-rose-300">
                            Buz!
                          </span>
                        ) : h.snowLineElevationM !== null &&
                          h.snowLineElevationM !== undefined ? (
                          <>
                            <span className="text-[9px] text-sky-300">
                              ❄{h.snowLineElevationM}m
                            </span>
                            <span className="text-[9px] text-ink-muted">
                              Tw {h.wetBulbC ?? 0}°
                            </span>
                          </>
                        ) : null
                      ) : lens === "thermo" ? (
                        <>
                          <span className="text-[10px] text-ink-secondary">
                            Tw {h.wetBulbC ?? Math.round(h.dewPoint)}°
                          </span>
                          <span className="text-[9px] text-ink-muted">%{h.humidity}</span>
                        </>
                      ) : lens === "wind" ? (
                        <>
                          <span className="text-[10px] text-ink-secondary">
                            {Math.round(h.pressure)}
                          </span>
                          <span className="text-[9px] text-ink-muted">hPa</span>
                        </>
                      ) : sem.isWetActive ? (
                        <>
                          <span className={`text-[10px] font-semibold ${phaseVis.badgeTextClass}`}>
                            %{h.precipProbability}
                          </span>
                          {(h.airSnowCm ?? 0) >= 0.1 ? (
                            <span className="text-[9px] text-sky-200">
                              ❄{(h.groundSnowCm ?? 0) >= 0.1
                                ? (h.groundSnowCm ?? 0).toFixed(1)
                                : (h.airSnowCm ?? 0).toFixed(1)}cm
                            </span>
                          ) : (
                            <span className="text-[9px] text-ink-secondary">
                              {h.precipitation.toFixed(1)}
                            </span>
                          )}
                        </>
                      ) : sem.isProbabilisticGhost ? (
                        <>
                          <span className="text-[10px] text-ink-muted">
                            %{h.precipProbability}
                          </span>
                          <span className="text-[8px] text-white/35">iz</span>
                        </>
                      ) : null}
                    </div>

                    {/* Şerit 8 (MUTLAK top=327px..368px): Beaufort Renkli Rüzgar Vektör Rayı */}
                    <div
                      title={`Rüzgar: ${windDirectionToCompass(h.windDirection)} (${h.windDirection}°) · Hamle ${formatWindSpeed(h.windGusts, unit)}`}
                      className="pointer-events-none absolute inset-x-0 top-[327px] flex flex-col items-center gap-0.5 font-mono leading-none"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        className={`h-3.5 w-3.5 transition-transform duration-300 ${windVis.arrowCls}`}
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
                      <span className={`text-[10px] ${windVis.speedCls}`}>
                        {Math.round(toUnitWind(h.windSpeed, unit))}
                        {h.windGusts >= h.windSpeed + 12 && (
                          <span className="text-[8px] opacity-75">
                            ·{Math.round(toUnitWind(h.windGusts, unit))}
                          </span>
                        )}
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
            <span className="h-2 w-2 rounded-sm bg-sky-400/80" />
            Yağmur
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-teal-300/80" />
            Karla Karışık
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-amber-400/85" />
            Donan Yağmur
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-slate-100/85" />
            Kar
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2.5 rounded-sm border border-dashed border-sky-300/65 bg-sky-400/10" />
            Olasılık İzi (0 mm)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-[1.5px] bg-sky-300/80" />
            P90 Üst Sınır
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>▲/▼ Ekstremum</span>
          <span className="hidden sm:inline">←/→ Klavye ile Saat Adımlama</span>
        </div>
      </div>
    </div>
  );
}

const HourlyForecastStrip = memo(HourlyForecastStripBase);
export default HourlyForecastStrip;
