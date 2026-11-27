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

export interface HourlyDisplaySemantics {
  /** Gerçek ölçülebilir yağış düşüyor mu (`>= 0.05 mm` veya `>= 0.08 cm` havada kar) */
  isWetActive: boolean;
  /** Miktar `0.0 mm` iken kayda değer yağış olasılığı (`>= %18`) var mı (kesikli hayalet bar) */
  isProbabilisticGhost: boolean;
  /** İkonda kullanılacak dürüst faz (`0.0 mm` iken yanıltıcı yağış damlası/kar tanesi çizmez) */
  iconPhase: PrecipPhase;
  /** Olasılık barının faz rengi için potansiyel faz (`sleet`, `snow`, `rain` vb.) */
  potentialPhase: PrecipPhase;
  /** İkonda kullanılacak dürüst WMO kodu */
  effectiveCode: number;
  /** Kullanıcıya gösterilecek tutarlı Türkçe durum metni */
  statusLabelTr: string;
}

/**
 * `0.0 mm` yağışlı saatlerde `"Karla Karışık Yağmur · 0.0 mm"` gibi çelişkili durum/ikon üretimini önler;
 * gerçek aktif yağış ile kuru olasılık izini (ghost bar) birbirinden net biçimde ayırır.
 */
export function resolveHourlyDisplaySemantics(
  hour: Pick<
    HourlyPoint,
    | "precipitation"
    | "precipProbability"
    | "precipPhase"
    | "precipType"
    | "airSnowCm"
    | "cloudCover"
    | "weatherCode"
    | "condition"
    | "wetBulbC"
    | "temperature"
    | "lightningProbPct"
    | "isThundersnow"
  >
): HourlyDisplaySemantics {
  const mm = hour.precipitation ?? 0;
  const airSnow = hour.airSnowCm ?? 0;
  const pop = hour.precipProbability ?? 0;
  const tw = hour.wetBulbC ?? hour.temperature;

  // Potansiyel termodinamik faz (yağış düşerse hangi fazda düşeceği)
  let potentialPhase: PrecipPhase =
    hour.precipPhase && hour.precipPhase !== "none"
      ? hour.precipPhase
      : hour.precipType === "snow"
        ? "snow"
        : hour.precipType === "rain"
          ? "rain"
          : tw <= 0.2
            ? "snow"
            : tw <= 1.6
              ? "sleet"
              : "rain";

  const isWetActive = mm >= 0.05 || airSnow >= 0.08;
  if (isWetActive) {
    return {
      isWetActive: true,
      isProbabilisticGhost: false,
      iconPhase: potentialPhase,
      potentialPhase,
      effectiveCode: hour.weatherCode,
      statusLabelTr: hour.isThundersnow
        ? "Gökgürültülü Kar (Thundersnow)"
        : hour.condition
    };
  }

  // Miktar < 0.05 mm: Gökyüzü kuru/iz düzeyinde -> yanıltıcı yağış ikonu yerine gerçek bulutluluk ikonu!
  const skyCode =
    hour.weatherCode === 45 || hour.weatherCode === 48
      ? hour.weatherCode
      : (hour.lightningProbPct ?? 0) >= 48 && hour.weatherCode >= 95
        ? 95
        : hour.cloudCover >= 78
          ? 3
          : hour.cloudCover >= 38
            ? 2
            : hour.cloudCover >= 15
              ? 1
              : 0;

  const skyBaseTr =
    skyCode === 45 || skyCode === 48
      ? "Sisli"
      : skyCode === 95
        ? "Konvektif Kararsızlık"
        : skyCode === 3
          ? "Çok Bulutlu"
          : skyCode === 2
            ? "Parçalı Bulutlu"
            : skyCode === 1
              ? "Az Bulutlu"
              : "Açık";

  if (pop >= 18) {
    const potentialTr =
      potentialPhase === "snow"
        ? "Kar İhtimali"
        : potentialPhase === "sleet"
          ? "Sulu Kar İhtimali"
          : potentialPhase === "freezing_rain"
            ? "Donan Yağmur İhtimali"
            : "Yağış İhtimali";

    return {
      isWetActive: false,
      isProbabilisticGhost: true,
      iconPhase: "none",
      potentialPhase,
      effectiveCode: skyCode,
      statusLabelTr: `${skyBaseTr} · ${potentialTr} (%${pop})`
    };
  }

  return {
    isWetActive: false,
    isProbabilisticGhost: false,
    iconPhase: "none",
    potentialPhase: "none",
    effectiveCode: skyCode,
    statusLabelTr: skyBaseTr
  };
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

export type DayMicroPhaseSlot =
  | "none"
  | "prob"
  | "rain"
  | "sleet"
  | "snow"
  | "freezing_rain"
  | "storm";

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
  snowAirSumCm: number;
  snowGroundSumCm: number;
  maxLightningProbPct: number;
  dominantCode: number;
  dominantPhase: PrecipPhase;
  microSlots: DayMicroPhaseSlot[];
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

export function formatShortDateTr(ymd: string): string {
  const parts = ymd.split("-");
  if (parts.length < 3) return ymd;
  const monthIdx = Number(parts[1]) - 1;
  const dayNum = Number(parts[2]);
  if (!Number.isFinite(dayNum) || monthIdx < 0 || monthIdx > 11) return ymd;
  return `${dayNum} ${MONTHS_SHORT_TR[monthIdx]}`;
}

function classifyMicroSlot(h: HourlyPoint): DayMicroPhaseSlot {
  if ((h.lightningProbPct ?? 0) >= 35 || h.weatherCode >= 95) return "storm";
  const sem = resolveHourlyDisplaySemantics(h);
  if (!sem.isWetActive) {
    return sem.isProbabilisticGhost ? "prob" : "none";
  }
  if (sem.iconPhase === "freezing_rain") return "freezing_rain";
  if (sem.iconPhase === "snow") return "snow";
  if (sem.iconPhase === "sleet") return "sleet";
  return "rain";
}

/**
 * 168–240 saatlik diziyi günlük hızlı atlama gruplarına ve 24-dilimli mikro-faz imzasına ayırır.
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
    const slot = classifyMicroSlot(h);

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
        snowAirSumCm: h.airSnowCm ?? 0,
        snowGroundSumCm: h.groundSnowCm ?? 0,
        maxLightningProbPct: h.lightningProbPct ?? 0,
        dominantCode: h.weatherCode,
        dominantPhase: h.precipPhase ?? "none",
        microSlots: [slot]
      });
    } else {
      prev.endIndex = i;
      prev.hourCount++;
      prev.microSlots.push(slot);
      if (h.temperature < prev.tempMin) prev.tempMin = h.temperature;
      if (h.temperature > prev.tempMax) prev.tempMax = h.temperature;
      if (h.precipProbability > prev.maxPopPct) prev.maxPopPct = h.precipProbability;
      prev.precipSumMm = Number((prev.precipSumMm + h.precipitation).toFixed(1));
      prev.snowAirSumCm = Number((prev.snowAirSumCm + (h.airSnowCm ?? 0)).toFixed(1));
      prev.snowGroundSumCm = Number((prev.snowGroundSumCm + (h.groundSnowCm ?? 0)).toFixed(1));
      if ((h.lightningProbPct ?? 0) > prev.maxLightningProbPct) {
        prev.maxLightningProbPct = h.lightningProbPct ?? 0;
      }
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
      if (d.airSnowSumCm !== undefined) g.snowAirSumCm = d.airSnowSumCm;
      if (d.groundSnowSumCm !== undefined) g.snowGroundSumCm = d.groundSnowSumCm;
      if (d.lightningProbMaxPct !== undefined) {
        g.maxLightningProbPct = Math.max(g.maxLightningProbPct, d.lightningProbMaxPct);
      }
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

export type SynopticEventKind =
  | "rain_to_snow"
  | "cold_front"
  | "freeze_cross"
  | "peak_storm"
  | "peak_gust";

export interface SynopticTimelineEvent {
  id: string;
  hourIndex: number;
  kind: SynopticEventKind;
  labelTr: string;
  badgeClass: string;
  lineStroke: string;
  priority: number;
}

function angularDiffDeg(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Saatlik seride önemli sinoptik kırılma anlarını (Yağmur->Kar geçişi, Soğuk Cephe,
 * 0°C Don/Buzlanma eşiği, Oraj zirvesi, Fırtına hamlesi) çakışmasız (en az 5 saat aralıklı) bulur.
 */
export function detectSynopticEvents(
  hourly: ReadonlyArray<HourlyPoint>
): SynopticTimelineEvent[] {
  if (hourly.length < 4) return [];

  const candidates: SynopticTimelineEvent[] = [];

  for (let i = 1; i < hourly.length; i++) {
    const prev = hourly[i - 1];
    const cur = hourly[i];
    const prevSem = resolveHourlyDisplaySemantics(prev);
    const curSem = resolveHourlyDisplaySemantics(cur);

    // 1. Yağmurdan Kara / Sulu Kara Aktif Geçiş (En yüksek öncelik)
    if (
      curSem.isWetActive &&
      (curSem.iconPhase === "snow" || (curSem.iconPhase === "sleet" && (cur.airSnowCm ?? 0) >= 0.2)) &&
      (!prevSem.isWetActive || prevSem.iconPhase === "rain")
    ) {
      candidates.push({
        id: `snow-turn-${cur.time}`,
        hourIndex: i,
        kind: "rain_to_snow",
        labelTr: curSem.iconPhase === "snow" ? "❄ Kara Dönüş" : "❄ KKY Geçiş",
        badgeClass: "border-sky-300/50 bg-[#081526]/95 text-sky-100",
        lineStroke: "#7dd3fc",
        priority: 100
      });
      continue;
    }

    // 2. Keskin Soğuk Cephe Girişi (3 saatte >= 2.8°C düşüş + rüzgar dönüşü veya hamle)
    if (i >= 3) {
      const prev3 = hourly[i - 3];
      const dT3h = cur.temperature - prev3.temperature;
      const windShift = angularDiffDeg(cur.windDirection, prev3.windDirection);
      if (dT3h <= -2.8 && (windShift >= 35 || cur.windGusts >= 32)) {
        candidates.push({
          id: `front-${cur.time}`,
          hourIndex: i,
          kind: "cold_front",
          labelTr: `▼ Cephe (${dT3h.toFixed(1)}°)`,
          badgeClass: "border-cyan-400/45 bg-[#081424]/95 text-cyan-200",
          lineStroke: "#38bdf8",
          priority: 88
        });
        continue;
      }
    }

    // 3. 0°C Donma / Gizli Buzlanma Geçişi
    if (
      (prev.temperature > 0.2 && cur.temperature <= 0.0) ||
      (prev.icingRisk !== "black_ice" && cur.icingRisk === "black_ice")
    ) {
      candidates.push({
        id: `freeze-${cur.time}`,
        hourIndex: i,
        kind: "freeze_cross",
        labelTr: cur.icingRisk === "black_ice" ? "⚠ Gizli Buz" : "0°C Don",
        badgeClass:
          cur.icingRisk === "black_ice"
            ? "border-rose-400/50 bg-[#1f0b14]/95 text-rose-200"
            : "border-indigo-300/40 bg-[#0b1326]/95 text-indigo-200",
        lineStroke: cur.icingRisk === "black_ice" ? "#fb7185" : "#a5b4fc",
        priority: 82
      });
    }

    // 4. Konvektif Oraj / Şimşek Zirvesi (>= %45 ve +-5 saat içinde yerel zirve)
    const ltProb = cur.lightningProbPct ?? 0;
    if (ltProb >= 45) {
      let isLocalPeak = true;
      for (let j = Math.max(0, i - 5); j <= Math.min(hourly.length - 1, i + 5); j++) {
        if (j !== i && (hourly[j].lightningProbPct ?? 0) > ltProb) {
          isLocalPeak = false;
          break;
        }
      }
      if (isLocalPeak) {
        candidates.push({
          id: `storm-${cur.time}`,
          hourIndex: i,
          kind: "peak_storm",
          labelTr: cur.isThundersnow ? "⚡ Kış Orajı" : `⚡ Oraj %${ltProb}`,
          badgeClass: "border-amber-400/50 bg-[#1c1306]/95 text-amber-200",
          lineStroke: "#fbbf24",
          priority: 85
        });
      }
    }

    // 5. Kuvvetli Fırtına Hamlesi Zirvesi (>= 50 km/s ve +-6 saat yerel zirve)
    if (cur.windGusts >= 50) {
      let isGustPeak = true;
      for (let j = Math.max(0, i - 6); j <= Math.min(hourly.length - 1, i + 6); j++) {
        if (j !== i && hourly[j].windGusts > cur.windGusts) {
          isGustPeak = false;
          break;
        }
      }
      if (isGustPeak) {
        candidates.push({
          id: `gust-${cur.time}`,
          hourIndex: i,
          kind: "peak_gust",
          labelTr: `⚑ ${Math.round(cur.windGusts)} km/s`,
          badgeClass: "border-orange-400/45 bg-[#1c1008]/95 text-orange-200",
          lineStroke: "#fb923c",
          priority: 72
        });
      }
    }
  }

  // En az 5 sütun (~340px) mesafe garantisiyle en yüksek öncelikli olayları seç (sıfır çakışma!)
  candidates.sort((a, b) => b.priority - a.priority || a.hourIndex - b.hourIndex);
  const selected: SynopticTimelineEvent[] = [];
  for (const cand of candidates) {
    if (selected.every((s) => Math.abs(s.hourIndex - cand.hourIndex) >= 5)) {
      selected.push(cand);
    }
  }
  return selected.sort((a, b) => a.hourIndex - b.hourIndex);
}

export interface AdaptiveScaleAxisTick {
  value: number;
  y: number;
  label: string;
  isZero?: boolean;
}

export interface AdaptiveMeteogramScaleResult {
  minVal: number;
  maxVal: number;
  span: number;
  yOf: (v: number) => number;
  ticks: AdaptiveScaleAxisTick[];
}

/**
 * Görünür 24-36 saatlik pencereyi (%82 ağırlık) ile tüm seri bağlamını (%18 ağırlık) birleştirerek
 * 3°..6° gibi dar aralıklarda eğrinin dümdüz çizgiye ezilmesini engeller ve Y-ekseni kılavuzlarını üretir.
 */
export function computeAdaptiveMeteogramScale(params: {
  allValues: ReadonlyArray<number>;
  visibleStartIdx: number;
  visibleEndIdx: number;
  curveTopY: number;
  curveBotY: number;
  minSpan?: number;
  clampZeroFloor?: boolean;
  unitSuffix?: string;
  zeroThreshold?: number | null;
}): AdaptiveMeteogramScaleResult {
  const {
    allValues,
    visibleStartIdx,
    visibleEndIdx,
    curveTopY,
    curveBotY,
    minSpan = 7.5,
    clampZeroFloor = false,
    unitSuffix = "°",
    zeroThreshold = 0
  } = params;

  const heightPx = Math.max(24, curveBotY - curveTopY);
  if (allValues.length === 0) {
    return {
      minVal: 0,
      maxVal: 10,
      span: 10,
      yOf: () => (curveTopY + curveBotY) / 2,
      ticks: []
    };
  }

  const globMin = Math.min(...allValues);
  const globMax = Math.max(...allValues);

  const winLo = Math.max(0, visibleStartIdx - 4);
  const winHi = Math.min(allValues.length - 1, visibleEndIdx + 6);
  let locMin = Infinity;
  let locMax = -Infinity;
  for (let i = winLo; i <= winHi; i++) {
    const v = allValues[i];
    if (Number.isFinite(v)) {
      if (v < locMin) locMin = v;
      if (v > locMax) locMax = v;
    }
  }
  if (!Number.isFinite(locMin) || !Number.isFinite(locMax)) {
    locMin = globMin;
    locMax = globMax;
  }

  // %82 yerel görünür pencere + %18 genel seri dengesi: kaydırırken yumuşak, yerel dalgalara duyarlı!
  let rawLo = 0.82 * locMin + 0.18 * globMin;
  let rawHi = 0.82 * locMax + 0.18 * globMax;

  // Görünür penceredeki hiçbir gerçek nokta eğri tavan/tabanından taşmasın!
  rawLo = Math.min(rawLo, locMin - 0.8);
  rawHi = Math.max(rawHi, locMax + 0.8);

  const curSpan = rawHi - rawLo;
  if (curSpan < minSpan) {
    const pad = (minSpan - curSpan) * 0.5;
    rawLo -= pad;
    rawHi += pad;
  } else {
    const pad = curSpan * 0.1;
    rawLo -= pad;
    rawHi += pad;
  }

  if (clampZeroFloor) {
    rawLo = Math.max(0, rawLo);
    if (rawHi - rawLo < minSpan) {
      rawHi = rawLo + minSpan;
    }
  }

  const span = Math.max(1, rawHi - rawLo);
  const yOf = (v: number): number => {
    const clamped = Math.max(rawLo - span * 0.25, Math.min(rawHi + span * 0.25, v));
    return curveBotY - ((clamped - rawLo) / span) * heightPx;
  };

  // Temiz yuvarlanmış Y-ekseni adımı (1, 2, 5, 10, 20, 50, 100, 250...)
  const rawStep = span / 3.2;
  const niceSteps = [1, 2, 3, 5, 10, 15, 20, 25, 50, 100, 200, 500];
  const step = niceSteps.find((s) => s >= rawStep) ?? Math.ceil(rawStep / 100) * 100;

  const firstTick = Math.ceil(rawLo / step) * step;
  const ticks: AdaptiveScaleAxisTick[] = [];
  for (let tv = firstTick; tv <= rawHi; tv += step) {
    const y = yOf(tv);
    if (y >= curveTopY - 4 && y <= curveBotY + 4) {
      const isZero = zeroThreshold !== null && Math.abs(tv - zeroThreshold) < 0.01;
      ticks.push({
        value: tv,
        y,
        label: `${Math.round(tv)}${unitSuffix}`,
        isZero
      });
    }
  }

  return {
    minVal: rawLo,
    maxVal: rawHi,
    span,
    yOf,
    ticks
  };
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
        barFill: "rgba(251, 113, 133, 0.54)",
        barFocusFill: "#fb7185",
        badgeTextClass: "text-rose-300"
      };
    case "freezing_rain":
      return {
        label: "Donan Yğm",
        stroke: "#fbbf24",
        barFill: "rgba(251, 191, 36, 0.54)",
        barFocusFill: "#fbbf24",
        badgeTextClass: "text-amber-300"
      };
    case "sleet":
      return {
        label: "K.Karışık",
        stroke: "#2dd4bf",
        barFill: "rgba(45, 212, 191, 0.50)",
        barFocusFill: "#2dd4bf",
        badgeTextClass: "text-teal-200"
      };
    case "snow":
      return {
        label: "Kar",
        stroke: "#e2e8f0",
        barFill: "rgba(226, 232, 240, 0.52)",
        barFocusFill: "#f8fafc",
        badgeTextClass: "text-slate-100"
      };
    case "rain":
      return {
        label: "Yağmur",
        stroke: "#38bdf8",
        barFill: "rgba(56, 189, 248, 0.48)",
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
