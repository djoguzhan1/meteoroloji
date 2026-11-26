import type {
  DailyPoint,
  HourlyPoint,
  PrecipPhase,
  PrecipType
} from "./weather-types";

export type WeatherGlyphKind =
  | "clear-day"
  | "clear-night"
  | "mainly-clear-day"
  | "mainly-clear-night"
  | "partly-cloudy-day"
  | "partly-cloudy-night"
  | "overcast"
  | "fog"
  | "drizzle"
  | "rain"
  | "heavy-rain"
  | "freezing-rain"
  | "sleet"
  | "snow"
  | "heavy-snow"
  | "thunderstorm"
  | "hail-storm";

export interface ResolveGlyphInput {
  code: number;
  isNight?: boolean;
  precipPhase?: PrecipPhase;
  intensityMm?: number;
  windSpeedKmh?: number;
}

/**
 * WMO hava kodu, gece/gündüz durumu, hidrometeor fazı ve yağış şiddetinden
 * 17 ayrık fiziksel ikon durumundan birini deterministik olarak çözümler.
 */
export function resolveWeatherGlyphKind({
  code,
  isNight = false,
  precipPhase,
  intensityMm = 0
}: ResolveGlyphInput): WeatherGlyphKind {
  if (precipPhase === "hail" || code === 96 || code === 99) {
    return "hail-storm";
  }
  if (code >= 95) {
    return "thunderstorm";
  }
  if (
    precipPhase === "freezing_rain" ||
    code === 56 ||
    code === 57 ||
    code === 66 ||
    code === 67
  ) {
    return "freezing-rain";
  }
  if (precipPhase === "sleet") {
    return "sleet";
  }
  const isSnowCode = (code >= 71 && code <= 77) || code === 85 || code === 86;
  if (precipPhase === "snow" || isSnowCode) {
    if (code === 75 || code === 86 || intensityMm >= 2.2) {
      return "heavy-snow";
    }
    return "snow";
  }

  const isRainCode = (code >= 51 && code <= 65) || (code >= 80 && code <= 82);
  if (precipPhase === "rain" || isRainCode) {
    if (code === 65 || code === 82 || intensityMm >= 3.5) {
      return "heavy-rain";
    }
    if ((code >= 51 && code <= 55) || (intensityMm > 0 && intensityMm < 0.45 && code < 61)) {
      return "drizzle";
    }
    return "rain";
  }

  if (code === 45 || code === 48) {
    return "fog";
  }
  if (code === 3) {
    return "overcast";
  }
  if (code === 2) {
    return isNight ? "partly-cloudy-night" : "partly-cloudy-day";
  }
  if (code === 1) {
    return isNight ? "mainly-clear-night" : "mainly-clear-day";
  }
  return isNight ? "clear-night" : "clear-day";
}

/**
 * Yan yana dizilen saatlik ikonların robotik eşzamanlı hareketini kırmak için
 * asal çarpanlı deterministik negatif animasyon gecikmesi üretir.
 */
export function computeIconPhaseDelaySec(seed: number): string {
  const safe = Math.abs(Math.trunc(seed));
  const offset = ((safe * 1.37) % 4.1).toFixed(2);
  return `-${offset}s`;
}

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Monoton-sınırlı Catmull-Rom -> Kübik Bezier SVG eğrisi:
 * Tüm saat düğümlerinden tam geçer ve keskin cephe düşüşlerinde fizik dışı aşım (overshoot) yapmaz.
 */
export function buildSmoothCurvePath(
  points: ReadonlyArray<Point2D>,
  tension = 0.22
): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    return `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  }
  if (points.length === 2) {
    return `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} L${points[1].x.toFixed(1)},${points[1].y.toFixed(1)}`;
  }

  let d = `M${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const minSegY = Math.min(p1.y, p2.y);
    const maxSegY = Math.max(p1.y, p2.y);

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const rawCp1y = p1.y + (p2.y - p0.y) * tension;
    const cp1y = Math.max(minSegY, Math.min(maxSegY, rawCp1y));

    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const rawCp2y = p2.y - (p3.y - p1.y) * tension;
    const cp2y = Math.max(minSegY, Math.min(maxSegY, rawCp2y));

    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

export interface BandNode2D {
  x: number;
  yHigh: number;
  yLow: number;
}

/**
 * 212-üye P10–P90 belirsizlik zarfı için pürüzsüz kapalı SVG alan yolu üretir.
 */
export function buildConfidenceBandPath(
  nodes: ReadonlyArray<BandNode2D>,
  tension = 0.22
): string {
  if (nodes.length < 2) return "";
  const upper: Point2D[] = nodes.map((n) => ({ x: n.x, y: n.yHigh }));
  const lowerReversed: Point2D[] = [...nodes]
    .reverse()
    .map((n) => ({ x: n.x, y: n.yLow }));

  const topPath = buildSmoothCurvePath(upper, tension);
  const botCurve = buildSmoothCurvePath(lowerReversed, tension);
  const botContinuation = botCurve.replace(/^M/, "L");
  return `${topPath} ${botContinuation} Z`;
}

export interface HourlyDayGroup {
  date: string;
  dayName: string;
  shortDate: string;
  startIndex: number;
  endIndex: number;
  hourCount: number;
  tempMin: number;
  tempMax: number;
  maxPopPct: number;
  precipSumMm: number;
  dominantCode: number;
  dominantPhase: PrecipPhase;
}

const MONTHS_SHORT_TR = [
  "Oca",
  "Şub",
  "Mar",
  "Nis",
  "May",
  "Haz",
  "Tem",
  "Ağu",
  "Eyl",
  "Eki",
  "Kas",
  "Ara"
];

function formatShortDateTr(ymd: string): string {
  const parts = ymd.split("-");
  if (parts.length < 3) return ymd;
  const monthIdx = Number(parts[1]) - 1;
  const dayNum = Number(parts[2]);
  if (!Number.isFinite(dayNum) || monthIdx < 0 || monthIdx > 11) return ymd;
  return `${dayNum} ${MONTHS_SHORT_TR[monthIdx]}`;
}

/**
 * 168 saatlik diziyi 7 günlük hızlı atlama gruplarına ayırır.
 */
export function buildHourlyDayGroups(
  hourly: ReadonlyArray<HourlyPoint>,
  daily: ReadonlyArray<DailyPoint> = []
): HourlyDayGroup[] {
  if (hourly.length === 0) return [];
  const dailyByDate = new Map<string, DailyPoint>();
  for (const d of daily) dailyByDate.set(d.date, d);

  const groups: HourlyDayGroup[] = [];
  for (let i = 0; i < hourly.length; i++) {
    const h = hourly[i];
    const date = h.time.slice(0, 10);
    const prev = groups[groups.length - 1];

    if (!prev || prev.date !== date) {
      const matchedDaily = dailyByDate.get(date);
      groups.push({
        date,
        dayName: matchedDaily?.dayName ?? h.dayLabel,
        shortDate: formatShortDateTr(date),
        startIndex: i,
        endIndex: i,
        hourCount: 1,
        tempMin: h.temperature,
        tempMax: h.temperature,
        maxPopPct: h.precipProbability,
        precipSumMm: h.precipitation,
        dominantCode: h.weatherCode,
        dominantPhase: h.precipPhase ?? "none"
      });
    } else {
      prev.endIndex = i;
      prev.hourCount++;
      if (h.temperature < prev.tempMin) prev.tempMin = h.temperature;
      if (h.temperature > prev.tempMax) prev.tempMax = h.temperature;
      if (h.precipProbability > prev.maxPopPct) prev.maxPopPct = h.precipProbability;
      prev.precipSumMm = Number((prev.precipSumMm + h.precipitation).toFixed(1));
      if (h.weatherCode > prev.dominantCode) {
        prev.dominantCode = h.weatherCode;
      }
      if (h.precipPhase === "hail") prev.dominantPhase = "hail";
      else if (h.precipPhase === "freezing_rain" && prev.dominantPhase !== "hail")
        prev.dominantPhase = "freezing_rain";
      else if (
        h.precipPhase === "snow" &&
        prev.dominantPhase !== "hail" &&
        prev.dominantPhase !== "freezing_rain"
      )
        prev.dominantPhase = "snow";
      else if (h.precipPhase === "sleet" && prev.dominantPhase === "none")
        prev.dominantPhase = "sleet";
      else if (h.precipPhase === "rain" && prev.dominantPhase === "none")
        prev.dominantPhase = "rain";
    }
  }

  for (const g of groups) {
    const d = dailyByDate.get(g.date);
    if (d) {
      g.tempMin = d.tempMin;
      g.tempMax = d.tempMax;
      g.dominantCode = d.weatherCode;
      if (d.precipPhase) g.dominantPhase = d.precipPhase;
    }
  }

  return groups;
}

export interface SolarTimelineMarker {
  id: string;
  kind: "sunrise" | "sunset";
  timeLabel: string;
  fractionalIndex: number;
}

/**
 * Günlük sunrise/sunset ISO dizgelerini saatlik eksende kesirli sütun konumlarına eşler.
 */
export function buildSolarMarkers(
  hourly: ReadonlyArray<HourlyPoint>,
  daily: ReadonlyArray<DailyPoint>
): SolarTimelineMarker[] {
  if (hourly.length < 2 || daily.length === 0) return [];

  const hourPrefixToIndex = new Map<string, number>();
  hourly.forEach((h, idx) => {
    hourPrefixToIndex.set(h.time.slice(0, 13), idx);
  });

  const markers: SolarTimelineMarker[] = [];
  for (const d of daily) {
    const pairs: Array<{ kind: "sunrise" | "sunset"; iso: string }> = [
      { kind: "sunrise", iso: d.sunrise },
      { kind: "sunset", iso: d.sunset }
    ];
    for (const { kind, iso } of pairs) {
      if (!iso || iso.length < 16) continue;
      const hourPrefix = iso.slice(0, 13);
      const baseIdx = hourPrefixToIndex.get(hourPrefix);
      if (baseIdx === undefined) continue;
      const mins = Number(iso.slice(14, 16));
      const frac = Number.isFinite(mins) ? Math.max(0, Math.min(0.98, mins / 60)) : 0;
      const fractionalIndex = Math.min(hourly.length - 1, baseIdx + frac);
      markers.push({
        id: `${kind}-${iso.slice(0, 16)}`,
        kind,
        timeLabel: iso.slice(11, 16),
        fractionalIndex
      });
    }
  }
  return markers.sort((a, b) => a.fractionalIndex - b.fractionalIndex);
}

/**
 * Gün içi gerçek yerel maksimum ve minimum saat indekslerini (gürültüsüz, >=1.2°C belirginlikli) bulur.
 */
export function detectDiurnalExtrema(
  hourly: ReadonlyArray<HourlyPoint>
): Map<number, "max" | "min"> {
  const result = new Map<number, "max" | "min">();
  if (hourly.length < 7) return result;

  const radius = 4;
  for (let i = 2; i < hourly.length - 2; i++) {
    const lo = Math.max(0, i - radius);
    const hi = Math.min(hourly.length - 1, i + radius);
    const cur = hourly[i].temperature;

    let isMax = true;
    let isMin = true;
    let windowMin = cur;
    let windowMax = cur;

    for (let j = lo; j <= hi; j++) {
      if (j === i) continue;
      const v = hourly[j].temperature;
      if (v < windowMin) windowMin = v;
      if (v > windowMax) windowMax = v;
      if (v > cur || (v === cur && j < i)) isMax = false;
      if (v < cur || (v === cur && j < i)) isMin = false;
    }

    if (isMax && cur - windowMin >= 1.2) {
      result.set(i, "max");
    } else if (isMin && windowMax - cur >= 1.2) {
      result.set(i, "min");
    }
  }
  return result;
}

export interface PrecipPhaseVisual {
  label: string;
  stroke: string;
  barFill: string;
  barFocusFill: string;
  badgeTextClass: string;
}

export function getPrecipPhaseVisual(
  phase?: PrecipPhase,
  fallbackType: PrecipType = "none"
): PrecipPhaseVisual {
  const effectivePhase: PrecipPhase =
    phase && phase !== "none"
      ? phase
      : fallbackType === "snow"
        ? "snow"
        : fallbackType === "rain"
          ? "rain"
          : "none";

  switch (effectivePhase) {
    case "hail":
      return {
        label: "Dolu",
        stroke: "#fb7185",
        barFill: "rgba(251, 113, 133, 0.48)",
        barFocusFill: "#fb7185",
        badgeTextClass: "text-rose-300"
      };
    case "freezing_rain":
      return {
        label: "Donan Yğm",
        stroke: "#fbbf24",
        barFill: "rgba(251, 191, 36, 0.48)",
        barFocusFill: "#fbbf24",
        badgeTextClass: "text-amber-300"
      };
    case "sleet":
      return {
        label: "K.Karışık",
        stroke: "#2dd4bf",
        barFill: "rgba(45, 212, 191, 0.45)",
        barFocusFill: "#2dd4bf",
        badgeTextClass: "text-teal-200"
      };
    case "snow":
      return {
        label: "Kar",
        stroke: "#e2e8f0",
        barFill: "rgba(226, 232, 240, 0.46)",
        barFocusFill: "#f8fafc",
        badgeTextClass: "text-slate-100"
      };
    case "rain":
      return {
        label: "Yağmur",
        stroke: "#38bdf8",
        barFill: "rgba(56, 189, 248, 0.42)",
        barFocusFill: "#38bdf8",
        badgeTextClass: "text-sky-300"
      };
    default:
      return {
        label: "Kuru",
        stroke: "rgba(148, 163, 184, 0.35)",
        barFill: "rgba(148, 163, 184, 0.16)",
        barFocusFill: "rgba(186, 230, 253, 0.45)",
        badgeTextClass: "text-ink-muted"
      };
  }
}
