import {
  analyzeConvectiveProfile,
  wetBulbStullC,
  type CapeAnalysisResult
} from "./thermo-cape";
import {
  isSnowLinePhysicallyRelevant,
  isWetActiveSample,
  PRECIP_WETNESS_CONTRACT,
  type AirQualityDetail,
  type BeaufortInfo,
  type BlowingSnowRisk,
  type DailyPoint,
  type DekSnowStatus,
  type ElevationSnowBand,
  type HourlyPoint,
  type LightningCellVector,
  type LightningProximityRadar,
  type LightningRangeRingSummary,
  type LightningSafetyLevel,
  type PrecipitationConsensus,
  type PrecipPhase,
  type PrecipType,
  type PressureTrend,
  type RoadIcingRisk,
  type SceneAtmosphereInput,
  type SnowQualityLabelTr,
  type SoundingLevel,
  type StormThreatLevel,
  type WeatherBundle
} from "./weather-types";

export type TemporalViewMode = "LIVE_NOW" | "FORECAST_LOCKED";

export interface TemporalTelemetry {
  time: string;
  hourLabel: string;
  dayLabel: string;
  timeLabel: string;
  temperature: number;
  tempP10?: number;
  tempP90?: number;
  apparentTemperature: number;
  wetBulbC: number;
  humidity: number;
  dewPoint: number;
  pressure: number;
  pressureDelta3h: number;
  pressureTrend: PressureTrend;
  pressureTrendDetail: string;
  windSpeed: number;
  windGusts: number;
  gustP90?: number;
  windDirection: number;
  windCompassTr: string;
  beaufort: BeaufortInfo;
  cloudCover: number;
  visibilityKm: number;
  uvIndex: number;
  uvLabel: string;
  precipitation: number;
  precipProbability: number;
  precipConsensus: PrecipitationConsensus;
  isWetActive: boolean;
  precipType: PrecipType;
  precipPhase: PrecipPhase;
  potentialPrecipPhase: PrecipPhase;
  rainAccum: number;
  snowAccum: number;
  airSnowCm: number;
  airSnowCmHr: number;
  airSnowProbPct: number;
  groundSnowCm: number;
  groundSnowCmHr: number;
  roadSnowCm: number;
  roadSnowCmHr: number;
  snowpackDepthCm: number;
  roadSnowDepthCm: number;
  snowLineElevationM: number | null;
  showSnowLine: boolean;
  wetBulbZeroM: number | null;
  freezingLevelM: number | null;
  snowSlr: number;
  snowQualityTr: SnowQualityLabelTr;
  soilTempC?: number;
  roadTempC?: number;
  icingRisk: RoadIcingRisk;
  blowingSnowRisk: BlowingSnowRisk;
  dekStatus: DekSnowStatus;
  elevationSnowBands?: ElevationSnowBand[];
  weatherCode: number;
  condition: string;
  isStorm: boolean;
  stormScore: number;
  lightningProbPct: number;
  lpiJkg: number;
  lightningFlashesPerMin: number;
  cgFractionPct: number;
  isThundersnow: boolean;
  solarElevationDeg: number;
  daylight: number;
  cape: number | null;
  cin: number | null;
  liftedIndex: number | null;
  temp850hPa: number | null;
}

export interface TemporalDayContext {
  date: string;
  dayName: string;
  tempMin: number;
  tempMax: number;
  sunrise: string;
  sunset: string;
  sunriseClock: string;
  sunsetClock: string;
  uvCurrent: number;
  uvDayMax: number;
  uvLabelTr: string;
  uvDayMaxLabelTr: string;
  solarElevationDeg: number;
  solarArcProgress: number;
  dayDurationMin: number;
  dayDurationLabelTr: string;
  isNight: boolean;
}

export interface TemporalStormChip {
  score: number;
  level: StormThreatLevel;
  label: string;
  color: string;
  isLiveWindowSummary: boolean;
}

export interface TemporalAirQualityContext {
  availableForHour: boolean;
  data: AirQualityDetail;
  scopeLabelTr: string;
}

export type LightningRadarSourceMode =
  | "LIVE_DOPPLER_METAR"
  | "NWP_ADVECTIVE_PROJECTION";

export interface TemporalLightningRadar extends LightningProximityRadar {
  sourceMode: LightningRadarSourceMode;
  modeBadgeTr: string;
  leadHours: number;
}

export interface ActiveTemporalView {
  mode: TemporalViewMode;
  frameIndex: number;
  leadHours: number;
  referenceIso: string;
  cockpitTitleTr: string;
  telemetry: TemporalTelemetry;
  dayContext: TemporalDayContext;
  stormChip: TemporalStormChip;
  airQualityContext: TemporalAirQualityContext;
  soundingSummary: CapeAnalysisResult | null;
  lightningRadar: TemporalLightningRadar;
  atmosphere: SceneAtmosphereInput;
}

export interface ModularSolarArcResult {
  sunriseClock: string;
  sunsetClock: string;
  dayDurationMin: number;
  dayDurationLabelTr: string;
  solarArcProgress: number;
  isNight: boolean;
}

export interface StormSceneDrive {
  isWet: boolean;
  effectivePrecipType: PrecipType;
  effectivePrecipIntensity: number;
  canFlashLightning: boolean;
  flashFrequencyHz: number;
  stormCloudFactor: number;
  windRad: number;
  windFlowX: number;
  windFlowY: number;
  sunNormX: number;
  isNight: boolean;
  hasGaleWindStreaks: boolean;
  precipParticleCount: number;
  windStreakCount: number;
  activeParticleCount: number;
}

const COMPASS_8_TR = ["K", "KD", "D", "GD", "G", "GB", "B", "KB"] as const;

function clamp(v: number, lo: number, hi: number): number {
  if (!Number.isFinite(v)) return lo;
  return Math.max(lo, Math.min(hi, v));
}

function normalizeZero(v: number): number {
  return Math.abs(v) < 1e-12 ? 0 : v;
}

function clampFrameIndex(bundle: WeatherBundle, frameIndex: number): number {
  if (!bundle.hourly || bundle.hourly.length === 0) return 0;
  const raw = Number.isFinite(frameIndex) ? Math.floor(frameIndex) : 0;
  return Math.max(0, Math.min(raw, bundle.hourly.length - 1));
}

function bearingToCompassLocalTr(deg: number): string {
  const norm = ((deg % 360) + 360) % 360;
  return COMPASS_8_TR[Math.round(norm / 45) % 8];
}

function classifyPressureTrendLocal(delta3h: number): PressureTrend {
  if (delta3h >= 3.6) return "hızlı yükseliyor";
  if (delta3h >= 0.5) return "yükseliyor";
  if (delta3h <= -3.6) return "hızlı düşüyor";
  if (delta3h <= -0.5) return "düşüyor";
  return "sabit";
}

function describePressureTrendDetailLocal(delta3h: number): string {
  const abs = Math.abs(delta3h);
  if (abs < 0.5) return "Sabit barometre";
  if (abs < 1.6) return delta3h > 0 ? "Yavaş yükseliyor" : "Yavaş düşüyor";
  if (abs < 3.6) return delta3h > 0 ? "Belirgin yükseliş" : "Belirgin düşüş";
  if (abs < 6.0) return delta3h > 0 ? "Hızlı yükseliş" : "Hızlı düşüş (cephe)";
  return delta3h > 0 ? "Çok hızlı yükseliş" : "Şiddetli düşüş (siklon)";
}

function windKmhToBeaufortLocal(kmh: number): BeaufortInfo {
  if (kmh < 1) return { scale: 0, label: "Sakin" };
  if (kmh < 6) return { scale: 1, label: "Çok hafif" };
  if (kmh < 12) return { scale: 2, label: "Hafif esinti" };
  if (kmh < 20) return { scale: 3, label: "Hafif rüzgar" };
  if (kmh < 29) return { scale: 4, label: "Orta rüzgar" };
  if (kmh < 39) return { scale: 5, label: "Sertçe rüzgar" };
  if (kmh < 50) return { scale: 6, label: "Kuvvetli rüzgar" };
  if (kmh < 62) return { scale: 7, label: "Fırtınamsı" };
  if (kmh < 75) return { scale: 8, label: "Fırtına" };
  if (kmh < 89) return { scale: 9, label: "Kuvvetli fırtına" };
  if (kmh < 103) return { scale: 10, label: "Tam fırtına" };
  if (kmh < 118) return { scale: 11, label: "Şiddetli fırtına" };
  return { scale: 12, label: "Kasırga" };
}

function classifyUvIndexLocal(uv: number): string {
  if (uv < 3) return "Düşük";
  if (uv < 6) return "Orta";
  if (uv < 8) return "Yüksek";
  if (uv < 11) return "Çok Yüksek";
  return "Aşırı";
}

function solarElevationToDaylightLocal(elevDeg: number): number {
  if (elevDeg <= -8) return 0;
  if (elevDeg >= 35) return 1;
  return Number(((elevDeg + 8) / 43).toFixed(3));
}

function parseClockMinutesLocal(isoOrClock: string | undefined | null): {
  clockText: string;
  minutes: number | null;
} {
  if (!isoOrClock) return { clockText: "--:--", minutes: null };
  const match = isoOrClock.match(/(?:T|^|\s)(\d{1,2}):(\d{2})/);
  if (!match) return { clockText: "--:--", minutes: null };
  const hh = Number(match[1]);
  const mm = Number(match[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
    return { clockText: "--:--", minutes: null };
  }
  const normMin = (((hh % 24) * 60 + mm) % 1440 + 1440) % 1440;
  const hhStr = String(Math.floor(normMin / 60)).padStart(2, "0");
  const mmStr = String(Math.round(normMin % 60)).padStart(2, "0");
  return { clockText: `${hhStr}:${mmStr}`, minutes: normMin };
}

/**
 * Gece yarısı sonrası gün batımını (örn. Reykjavik 02:55 -> 00:03)
 * `(ssMin - srMin + 1440) % 1440` modüler aritmetiğiyle hatasız çözen saf güneş yayı hesabı.
 */
export function computeModularSolarArc(params: {
  referenceIso: string;
  sunrise: string;
  sunset: string;
  solarElevationDeg: number;
  subHourOffsetFrac?: number;
}): ModularSolarArcResult {
  const { referenceIso, sunrise, sunset, solarElevationDeg, subHourOffsetFrac } = params;
  const sr = parseClockMinutesLocal(sunrise);
  const ss = parseClockMinutesLocal(sunset);
  const ref = parseClockMinutesLocal(referenceIso);
  const isNight = solarElevationDeg < -3.0;

  if (sr.minutes === null || ss.minutes === null) {
    const fallbackProgress =
      solarElevationDeg > -3.0
        ? Number(clamp((solarElevationDeg + 6) / 60, 0.08, 0.92).toFixed(4))
        : 0;
    return {
      sunriseClock: sr.clockText,
      sunsetClock: ss.clockText,
      dayDurationMin: 720,
      dayDurationLabelTr: "12s 0dk",
      solarArcProgress: fallbackProgress,
      isNight
    };
  }

  const rawSpan = (ss.minutes - sr.minutes + 1440) % 1440;
  const dayDurationMin =
    rawSpan === 0 ? (solarElevationDeg > -0.833 ? 1440 : 0) : rawSpan;
  const durH = Math.floor(dayDurationMin / 60);
  const durM = Math.round(dayDurationMin % 60);
  const dayDurationLabelTr = `${durH}s ${durM}dk`;

  let activeMin = ref.minutes ?? sr.minutes;
  if (
    subHourOffsetFrac !== undefined &&
    Number.isFinite(subHourOffsetFrac) &&
    subHourOffsetFrac > 0 &&
    subHourOffsetFrac < 1 &&
    Math.round(activeMin) % 60 === 0
  ) {
    activeMin = (activeMin + subHourOffsetFrac * 60) % 1440;
  }

  let solarArcProgress = 0;
  if (dayDurationMin <= 0) {
    solarArcProgress = 0;
  } else if (dayDurationMin >= 1440) {
    solarArcProgress = Number(clamp(activeMin / 1440, 0, 1).toFixed(4));
  } else {
    const sinceSunrise = (activeMin - sr.minutes + 1440) % 1440;
    if (sinceSunrise <= dayDurationMin) {
      solarArcProgress = Number(
        clamp(sinceSunrise / Math.max(1, dayDurationMin), 0, 1).toFixed(4)
      );
    } else {
      const nightSpan = 1440 - dayDurationMin;
      const sinceSunset = sinceSunrise - dayDurationMin;
      solarArcProgress = sinceSunset < nightSpan * 0.5 ? 1 : 0;
    }
  }

  return {
    sunriseClock: sr.clockText,
    sunsetClock: ss.clockText,
    dayDurationMin,
    dayDurationLabelTr,
    solarArcProgress,
    isNight
  };
}

/**
 * Tekil sondaj analiz sarmalayıcısı (`lib/thermo-cape.ts` tabanlı saf hesap).
 * Yüzey sıcaklık/nem/basınç bilgileri verildiğinde yüzey parselini o saatle kenetler.
 */
export function analyzeSounding(
  levels: SoundingLevel[],
  surface?: {
    surfaceTempC?: number;
    surfaceHumidity?: number;
    surfacePressureHpa?: number;
  }
): CapeAnalysisResult | null {
  if (!levels || levels.length < 3) return null;
  const sorted = [...levels].sort((a, b) => b.pressure - a.pressure);
  const lowest = sorted[0];
  return analyzeConvectiveProfile({
    surfaceTempC: surface?.surfaceTempC ?? lowest.temperature,
    surfaceHumidity: surface?.surfaceHumidity ?? lowest.humidity,
    surfacePressureHpa: surface?.surfacePressureHpa ?? lowest.pressure,
    levels
  });
}

/**
 * Sınır hatasız 3 saatlik basınç farkı (`pressureDelta3h`):
 * - `i === 0`: `bundle.current.pressureDelta3h`
 * - `1 <= i < 3`: `((h[i].pressure - h[0].pressure) + ((3 - i) / 3) * bundle.current.pressureDelta3h)`
 * - `i >= 3`: `h[i].pressure - h[i - 3].pressure`
 */
export function computeTemporalPressureDelta3h(
  bundle: WeatherBundle,
  clampedIdx: number
): number {
  const h = bundle.hourly;
  if (clampedIdx <= 0 || h.length === 0) {
    return Number((bundle.current.pressureDelta3h ?? 0).toFixed(1));
  }
  const hi = h[clampedIdx];
  if (!hi) return Number((bundle.current.pressureDelta3h ?? 0).toFixed(1));
  if (clampedIdx < 3) {
    const p0 = h[0]?.pressure ?? bundle.current.pressure;
    const blended =
      hi.pressure - p0 + ((3 - clampedIdx) / 3) * (bundle.current.pressureDelta3h ?? 0);
    return normalizeZero(Number(blended.toFixed(1)));
  }
  const prevP = h[clampedIdx - 3]?.pressure ?? hi.pressure;
  return normalizeZero(Number((hi.pressure - prevP).toFixed(1)));
}

function inferPotentialPhase(
  wetBulbC: number,
  rawType: PrecipType,
  rawPhase?: PrecipPhase
): PrecipPhase {
  if (rawPhase && rawPhase !== "none") return rawPhase;
  if (rawType === "snow") return "snow";
  if (rawType === "rain") return "rain";
  if (wetBulbC <= 0.2) return "snow";
  if (wetBulbC <= 1.6) return "sleet";
  return "rain";
}

function resolveWetPrecipType(
  rawType: PrecipType,
  rawPhase: PrecipPhase | undefined,
  airSnowCm: number,
  wetBulbC: number
): PrecipType {
  if (
    rawType === "snow" ||
    rawPhase === "snow" ||
    (airSnowCm >= PRECIP_WETNESS_CONTRACT.SNOW_FLURRY_ACTIVE_CM && rawType !== "rain")
  ) {
    return "snow";
  }
  if (rawType === "rain" || rawPhase === "rain" || rawPhase === "freezing_rain" || rawPhase === "hail") {
    return "rain";
  }
  if (rawPhase === "sleet") {
    return wetBulbC <= 0.4 ? "snow" : "rain";
  }
  return wetBulbC <= 0.4 ? "snow" : "rain";
}

function sanitizeDryWeatherSky(params: {
  isWet: boolean;
  rawCode: number;
  rawCondition: string;
  cloudCover: number;
  lightningProbPct: number;
  isThundersnow: boolean;
}): { weatherCode: number; condition: string } {
  const { isWet, rawCode, rawCondition, cloudCover, lightningProbPct, isThundersnow } = params;
  if (isWet) {
    return {
      weatherCode: rawCode,
      condition: isThundersnow ? "Gökgürültülü Kar (Thundersnow)" : rawCondition
    };
  }
  if (rawCode <= 3 || rawCode === 45 || rawCode === 48) {
    return { weatherCode: rawCode, condition: rawCondition };
  }
  if (rawCode >= 95 && lightningProbPct >= 48) {
    return { weatherCode: 95, condition: rawCondition || "Konvektif Kararsızlık" };
  }
  const dryCode =
    cloudCover >= 78 ? 3 : cloudCover >= 38 ? 2 : cloudCover >= 15 ? 1 : 0;
  const dryCondition =
    dryCode === 3
      ? "Çok Bulutlu"
      : dryCode === 2
        ? "Parçalı Bulutlu"
        : dryCode === 1
          ? "Az Bulutlu"
          : "Açık";
  return { weatherCode: dryCode, condition: dryCondition };
}

function estimateFallbackStormScore(params: {
  isStorm: boolean;
  windSpeed: number;
  windGusts: number;
  precipitation: number;
  lightningProbPct: number;
  cape: number;
  weatherCode: number;
}): number {
  const windTerm =
    params.windGusts >= 35
      ? clamp(((params.windGusts - 35) / 55) * 78, 0, 88)
      : params.windSpeed >= 30
        ? clamp(((params.windSpeed - 30) / 45) * 65, 0, 75)
        : 0;
  const convTerm = Math.max(
    params.lightningProbPct * 0.85,
    params.cape >= 300 ? clamp((params.cape / 2200) * 58, 0, 65) : 0,
    params.weatherCode >= 95 ? 48 : 0
  );
  const rainTerm =
    params.precipitation >= 1.0
      ? clamp((params.precipitation / 16) * 72, 0, 82)
      : 0;
  const raw = Math.round(
    clamp(
      Math.max(windTerm, convTerm, rainTerm) * 0.72 +
        (windTerm * 0.35 + convTerm * 0.4 + rainTerm * 0.25) * 0.28,
      0,
      100
    )
  );
  if (params.isStorm && raw < 42) return 42;
  return raw;
}

/**
 * Seçili saatin `stormScore` değerine %100 uyumlu fırtına çipi.
 * Asla `score = 4` iken 12 saatlik pencereden sızan kırmızı `"Şiddetli Fırtına"` üretmez.
 */
export function resolveTemporalStormChip(params: {
  score: number;
  isThundersnow?: boolean;
  lightningProbPct?: number;
  windSpeed?: number;
  windGusts?: number;
  precipitation?: number;
  cape?: number | null;
  weatherCode?: number;
}): TemporalStormChip {
  const score = Math.round(clamp(params.score, 0, 100));
  const isTsnow = Boolean(params.isThundersnow);
  const ltProb = params.lightningProbPct ?? 0;
  const windSpd = params.windSpeed ?? 0;
  const windGst = params.windGusts ?? 0;
  const precip = params.precipitation ?? 0;
  const cape = params.cape ?? 0;
  const code = params.weatherCode ?? 0;
  const convectiveDom = ltProb >= 25 || cape >= 600 || code >= 95;
  const windDom = windGst >= 50 || windSpd >= 38;

  if (score < 22) {
    return {
      score,
      level: "calm",
      label: isTsnow ? "Gökgürültülü Kar (Thundersnow)" : "Sakin Atmosfer",
      color: isTsnow ? "#38bdf8" : "#10b981",
      isLiveWindowSummary: false
    };
  }

  if (score <= 39) {
    return {
      score,
      level: "watch",
      label: isTsnow ? "Gökgürültülü Kar (Thundersnow)" : "Konvektif / Rüzgar İzleme",
      color: "#38bdf8",
      isLiveWindowSummary: false
    };
  }

  if (score <= 59) {
    const label = isTsnow
      ? "Gökgürültülü Kar (Thundersnow)"
      : convectiveDom
        ? "Oraj & Sağanak"
        : windDom
          ? "Kuvvetli Rüzgar / Hamle"
          : precip >= 4
            ? "Kuvvetli Sağanak"
            : "Aktif Cephe / Fırtına";
    return {
      score,
      level: "thunderstorm",
      label,
      color: "#f97316",
      isLiveWindowSummary: false
    };
  }

  if (score <= 79) {
    const label = isTsnow
      ? "Gökgürültülü Kar (Thundersnow)"
      : convectiveDom
        ? "Şiddetli Oraj & Fırtına"
        : windDom
          ? "Şiddetli Rüzgar Fırtınası"
          : "Şiddetli Sağanak / Fırtına";
    return {
      score,
      level: "severe",
      label,
      color: "#ef4444",
      isLiveWindowSummary: false
    };
  }

  return {
    score,
    level: "extreme",
    label: isTsnow
      ? "Gökgürültülü Kar (Thundersnow)"
      : convectiveDom
        ? "Süper Hücre / Ekstrem"
        : "Ekstrem Fırtına",
    color: "#e11d48",
    isLiveWindowSummary: false
  };
}

/**
 * Zaman-duyarlı 3-halkalı (`0–15 km`, `15–40 km`, `40–100 km`) şimşek radarı çözücüsü:
 * - `clampedIdx === 0` ve canlı radar mevcutsa `LIVE_DOPPLER_METAR`
 * - `clampedIdx > 0` ise `t-1..t+3` saatlik NWP serisinden advektif projeksiyon (`NWP_ADVECTIVE_PROJECTION`)
 */
export function resolveTemporalLightningRadar(
  bundle: WeatherBundle,
  frameIndex: number
): TemporalLightningRadar {
  const clampedIdx = clampFrameIndex(bundle, frameIndex);

  if (clampedIdx === 0 && bundle.snowAndLightning?.lightningRadar) {
    return {
      ...bundle.snowAndLightning.lightningRadar,
      sourceMode: "LIVE_DOPPLER_METAR",
      modeBadgeTr: "Canlı Doppler + METAR",
      leadHours: 0
    };
  }

  const leadHours = clampedIdx;
  const hArr = bundle.hourly;
  const ht0: HourlyPoint | null = hArr[clampedIdx] ?? null;
  const hm1: HourlyPoint | null = clampedIdx > 0 ? (hArr[clampedIdx - 1] ?? null) : null;
  const hp1: HourlyPoint | null = hArr[clampedIdx + 1] ?? null;
  const hp2: HourlyPoint | null = hArr[clampedIdx + 2] ?? null;
  const hp3: HourlyPoint | null = hArr[clampedIdx + 3] ?? null;

  const probOf = (h: HourlyPoint | null): number =>
    clamp(Math.round(h?.lightningProbPct ?? 0), 0, 99);
  const flashOf = (h: HourlyPoint | null): number =>
    Math.max(0, Number((h?.lightningFlashesPerMin ?? 0).toFixed(1)));
  const lpiOf = (h: HourlyPoint | null): number =>
    Math.max(0, Number((h?.lpiJkg ?? 0).toFixed(2)));
  const cgOf = (h: HourlyPoint | null): number =>
    clamp(Math.round(h?.cgFractionPct ?? (h?.isThundersnow ? 46 : 28)), 12, 75);
  const tsnowOf = (h: HourlyPoint | null): boolean => Boolean(h?.isThundersnow);
  const windDirOf = (h: HourlyPoint | null): number =>
    (((h?.windDirection ?? bundle.current.windDirection ?? 220) % 360) + 360) % 360;

  const p0 =
    ht0 !== null
      ? probOf(ht0)
      : clamp(Math.round(bundle.current.lightningProbPct ?? 0), 0, 99);
  const f0 =
    ht0 !== null
      ? flashOf(ht0)
      : Math.max(0, Number((bundle.current.lightningFlashesPerMin ?? 0).toFixed(1)));
  const lpi0 = ht0 !== null ? lpiOf(ht0) : 0;
  const cg0 = ht0 !== null ? cgOf(ht0) : 28;
  const tsnow0 =
    ht0 !== null ? tsnowOf(ht0) : Boolean(bundle.current.isThundersnow);
  const baseWindSpeed = ht0?.windSpeed ?? bundle.current.windSpeed ?? 22;
  const advSpeedKmh = clamp(Math.max(20, baseWindSpeed * 1.15), 20, 52);

  const cells: LightningCellVector[] = [];

  const synthDbz = (prob: number, lpi: number, isTsnow: boolean): number =>
    Number(
      clamp((isTsnow ? 30 : 36) + prob * 0.22 + lpi * 1.35, 30, 58).toFixed(1)
    );

  const synthFlashRate = (prob: number, explicitFlash: number): number =>
    explicitFlash > 0
      ? explicitFlash
      : Number(clamp((prob - 18) * 0.055, 0.1, 16).toFixed(1));

  // 1. 0–15 km overhead NWP convective core (`t`)
  if (p0 >= 24 || f0 >= 0.15 || tsnow0) {
    const bearing = Math.round(windDirOf(ht0));
    const distKm = Number(clamp(14 - (p0 / 100) * 10.5, 3.2, 14.2).toFixed(1));
    const dbz = synthDbz(p0, lpi0, tsnow0);
    cells.push({
      id: `nwp-t0-${clampedIdx}`,
      bearingDeg: bearing,
      compassTr: bearingToCompassLocalTr(bearing),
      distanceKm: distKm,
      peakDbz: dbz,
      estFlashesPerMin: synthFlashRate(p0, f0),
      cgFractionPct: cg0,
      approaching: true,
      etaMinutes: distKm <= 7.5 ? 0 : Math.max(5, Math.round((distKm / advSpeedKmh) * 60)),
      kind: tsnow0
        ? "thundersnow_dek"
        : dbz >= 46
          ? "convective_storm"
          : "graupel_cell"
    });
  }

  // 2. 15–40 km approaching (`t+1`) or departing (`t-1`) convective cell
  const pPlus1 = probOf(hp1);
  const fPlus1 = flashOf(hp1);
  const tsPlus1 = tsnowOf(hp1);
  const pMinus1 = probOf(hm1);
  if (pPlus1 >= 22 || fPlus1 >= 0.15 || tsPlus1) {
    const bearing = Math.round(windDirOf(hp1 ?? ht0));
    const distKm = Number(clamp(advSpeedKmh * 0.85, 18.0, 38.0).toFixed(1));
    const dbz = synthDbz(pPlus1, lpiOf(hp1), tsPlus1);
    cells.push({
      id: `nwp-tp1-${clampedIdx}`,
      bearingDeg: bearing,
      compassTr: bearingToCompassLocalTr(bearing),
      distanceKm: distKm,
      peakDbz: dbz,
      estFlashesPerMin: synthFlashRate(pPlus1, fPlus1),
      cgFractionPct: cgOf(hp1),
      approaching: true,
      etaMinutes: Math.max(20, Math.round((distKm / advSpeedKmh) * 60)),
      kind: tsPlus1
        ? "thundersnow_dek"
        : dbz >= 46
          ? "convective_storm"
          : "graupel_cell"
    });
  } else if (pMinus1 >= 30 && p0 < 24) {
    const downwindBearing = Math.round((windDirOf(ht0 ?? hm1) + 180) % 360);
    const distKm = Number(clamp(advSpeedKmh * 0.78, 18.0, 36.0).toFixed(1));
    const tsMinus1 = tsnowOf(hm1);
    const dbz = synthDbz(pMinus1, lpiOf(hm1), tsMinus1);
    cells.push({
      id: `nwp-tm1-${clampedIdx}`,
      bearingDeg: downwindBearing,
      compassTr: bearingToCompassLocalTr(downwindBearing),
      distanceKm: distKm,
      peakDbz: dbz,
      estFlashesPerMin: synthFlashRate(pMinus1, flashOf(hm1)),
      cgFractionPct: cgOf(hm1),
      approaching: false,
      etaMinutes: null,
      kind: tsMinus1
        ? "thundersnow_dek"
        : dbz >= 46
          ? "convective_storm"
          : "graupel_cell"
    });
  }

  // 3. 40–100 km early-warning horizon (`t+2 .. t+3`)
  const pPlus2 = probOf(hp2);
  const pPlus3 = probOf(hp3);
  const useStep3 = pPlus3 > pPlus2;
  const hFar = useStep3 ? hp3 : hp2;
  const pFar = useStep3 ? pPlus3 : pPlus2;
  const fFar = flashOf(hFar);
  const tsFar = tsnowOf(hFar);
  if (hFar && (pFar >= 22 || fFar >= 0.15 || tsFar)) {
    const bearing = Math.round(windDirOf(hFar));
    const distKm = Number(
      clamp(advSpeedKmh * (useStep3 ? 2.3 : 1.75), 46.0, 96.0).toFixed(1)
    );
    const dbz = synthDbz(pFar, lpiOf(hFar), tsFar);
    cells.push({
      id: `nwp-tfar-${clampedIdx}`,
      bearingDeg: bearing,
      compassTr: bearingToCompassLocalTr(bearing),
      distanceKm: distKm,
      peakDbz: dbz,
      estFlashesPerMin: synthFlashRate(pFar, fFar),
      cgFractionPct: cgOf(hFar),
      approaching: true,
      etaMinutes: Math.max(55, Math.round((distKm / advSpeedKmh) * 60)),
      kind: tsFar
        ? "thundersnow_dek"
        : dbz >= 46
          ? "convective_storm"
          : "graupel_cell"
    });
  }

  cells.sort((a, b) => a.distanceKm - b.distanceKm || b.peakDbz - a.peakDbz);

  const buildProjectedRing = (
    minKm: number,
    maxKm: 15 | 40 | 100,
    labelTr: string,
    ringProb: number,
    fallbackFlash: number
  ): LightningRangeRingSummary => {
    const inRing = cells.filter((c) => c.distanceKm >= minKm && c.distanceKm <= maxKm);
    const maxDbz = inRing.reduce((m, c) => Math.max(m, c.peakDbz), 0);
    const cellFlashes = Number(
      inRing.reduce((s, c) => s + c.estFlashesPerMin, 0).toFixed(1)
    );
    const prob = clamp(Math.round(ringProb), 0, 99);
    const estFlashesPerMin =
      cellFlashes > 0 ? cellFlashes : prob >= 30 ? fallbackFlash : 0;
    const status: LightningRangeRingSummary["status"] =
      prob >= 68 || estFlashesPerMin >= 2.5
        ? "severe"
        : prob >= 38 || inRing.length > 0
          ? "active"
          : prob >= 18
            ? "watch"
            : "clear";

    return {
      ringKm: maxKm,
      labelTr,
      activeCellCount: inRing.length,
      maxDbz: Number(maxDbz.toFixed(1)),
      estFlashesPerMin,
      probabilityPct: prob,
      status
    };
  };

  const ring15 = buildProjectedRing(
    0,
    15,
    "0–15 km · Acil Yakın Çember",
    p0,
    f0
  );
  const ring40 = buildProjectedRing(
    15.01,
    40,
    "15–40 km · Yaklaşma Çemberi",
    Math.max(pPlus1, p0 * 0.84, pMinus1 * 0.68),
    fPlus1
  );
  const ring100 = buildProjectedRing(
    40.01,
    100,
    "40–100 km · Erken Uyarı Ufku",
    Math.max(pPlus2, pPlus3, pPlus1 * 0.82, p0 * 0.65),
    Math.max(flashOf(hp2), flashOf(hp3))
  );

  const nearest = cells[0] ?? null;
  const approachingCell =
    cells.find((c) => c.approaching && c.etaMinutes !== null) ?? null;

  let safetyLevel: LightningSafetyLevel = "safe";
  let safetyTitleTr = "Açık Alan Güvenli (Aktif Deşarj Yok)";
  let safetyDetailTr =
    clampedIdx > 0
      ? `+${leadHours}s NWP projeksiyonunda 0–100 km çevrede aktif yıldırım/şimşek hücresi öngörülmüyor.`
      : "0–40 km çevrede aktif yıldırım/şimşek hücresi saptanmadı; standart dış mekan faaliyetleri için elektriksel risk düşük.";

  if (
    ring15.status === "severe" ||
    ring15.status === "active" ||
    (nearest && nearest.distanceKm <= 15)
  ) {
    safetyLevel = "shelter_now";
    safetyTitleTr = tsnow0
      ? "ACİL: Gökgürültülü Kar (Thundersnow) — Kapalı Alana Geçin"
      : "30-30 KURALI AKTİF: 15 km İçinde Yıldırım Tehlikesi";
    safetyDetailTr =
      "0–15 km merkez halkada yüksek elektriksel deşarj riski öngörülüyor; bu saat diliminde açık arazi, zirve, su yüzeyi ve tekil ağaçlardan uzak durun.";
  } else if (
    ring40.status === "severe" ||
    ring40.status === "active" ||
    (nearest && nearest.distanceKm <= 40)
  ) {
    safetyLevel = "caution_30_30";
    safetyTitleTr = "Yakın Çevrede Aktif Oraj (15–40 km)";
    safetyDetailTr = approachingCell?.etaMinutes !== null && approachingCell?.etaMinutes !== undefined
      ? `${approachingCell.compassTr} yönünden yaklaşan NWP konvektif hücresi (~${approachingCell.distanceKm} km, tahmini varış ~${approachingCell.etaMinutes} dk). Açık alan planlarını sığınak mesafesinde tutun.`
      : `${nearest?.compassTr ?? "Çevre"} sektöründe ~${nearest?.distanceKm ?? 26} km mesafede konvektif hücre projeksiyonu mevcut; ani yıldırım sıçramasına karşı hazırlıklı olun.`;
  } else if (
    ring100.status !== "clear" ||
    ring15.probabilityPct >= 20 ||
    ring40.probabilityPct >= 22
  ) {
    safetyLevel = "awareness";
    safetyTitleTr = "Uzak Ufuk / Konvektif Kararsızlık İzlemesi";
    safetyDetailTr =
      "40–100 km ufkunda veya yaklaşan saatlerde orta düzey buz-graupel şarj potansiyeli öngörülüyor.";
  }

  const updatedAtIso = ht0?.time ?? bundle.current.time;
  const sourceMode: LightningRadarSourceMode =
    clampedIdx === 0 ? "LIVE_DOPPLER_METAR" : "NWP_ADVECTIVE_PROJECTION";
  const modeBadgeTr =
    clampedIdx === 0
      ? "Canlı Doppler + METAR"
      : `NWP Konvektif Projeksiyon (+${leadHours}s)`;

  return {
    updatedAtIso,
    radarBacked: false,
    metarConfirmedTs: false,
    safetyLevel,
    safetyTitleTr,
    safetyDetailTr,
    nearestCellKm: nearest ? nearest.distanceKm : null,
    nearestBearingTr: nearest ? nearest.compassTr : null,
    approachingEtaMin: approachingCell?.etaMinutes ?? null,
    currentFlashesPerMin: Math.max(ring15.estFlashesPerMin, f0),
    currentLpiJkg: lpi0,
    currentCgFractionPct: cg0,
    isThundersnowNow: tsnow0,
    rings: [ring15, ring40, ring100],
    cells,
    sourceMode,
    modeBadgeTr,
    leadHours
  };
}

/**
 * Fiziksel 3D `StormScene` atmosfer girdisi üreticisi:
 * - `!isWetActiveSample(precipMm, airSnowCm)` ise `precipType = "none"`, `precipIntensity = 0` (KESİN KİLİT).
 * - `isWet` ise sürekli karekök eğrisi: `clamp(0.10 + 0.90 * sqrt(max(precipMm, airSnowCm) / 8.0), 0.10, 1.0)`.
 * - `airQualityIndex = clampedIdx === 0 ? bundle.airQuality.categoryIndex : 1` (T+0 pus sızıntısı önlenir).
 */
export function buildPhysicalSceneAtmosphere(
  bundle: WeatherBundle,
  frameIndex: number
): SceneAtmosphereInput {
  const clampedIdx = clampFrameIndex(bundle, frameIndex);
  const cur = bundle.current;
  const h0 = bundle.hourly[0] ?? null;
  const hi = clampedIdx > 0 ? (bundle.hourly[clampedIdx] ?? null) : null;

  const referenceIso = hi ? hi.time : cur.time;
  const activeDateYmd = referenceIso.slice(0, 10);
  const matchedDay: DailyPoint | null =
    bundle.daily.find((d) => d.date === activeDateYmd) ?? bundle.daily[0] ?? null;

  const solarElevationDeg = hi ? hi.solarElevationDeg : cur.solarElevationDeg;
  const daylight = hi
    ? Number.isFinite(hi.daylight)
      ? hi.daylight
      : solarElevationToDaylightLocal(solarElevationDeg)
    : Number.isFinite(cur.daylight)
      ? cur.daylight
      : solarElevationToDaylightLocal(solarElevationDeg);

  const sunrise = matchedDay?.sunrise ?? cur.sunrise ?? "";
  const sunset = matchedDay?.sunset ?? cur.sunset ?? "";
  const solarArc = computeModularSolarArc({
    referenceIso,
    sunrise,
    sunset,
    solarElevationDeg,
    subHourOffsetFrac: clampedIdx === 0 ? cur.subHourOffsetFrac : undefined
  });

  const precipMm = hi ? hi.precipitation : cur.precipitation;
  const airSnowCm = hi
    ? (hi.airSnowCm ?? 0)
    : (cur.airSnowCmHr ?? h0?.airSnowCm ?? 0);
  const isWet = isWetActiveSample(precipMm, airSnowCm);

  const tempC = hi ? hi.temperature : cur.temperature;
  const rhPct = hi ? hi.humidity : cur.humidity;
  const wetBulbC = hi
    ? (hi.wetBulbC ?? Number(wetBulbStullC(tempC, rhPct).toFixed(1)))
    : (cur.wetBulbC ?? h0?.wetBulbC ?? Number(wetBulbStullC(tempC, rhPct).toFixed(1)));

  const rawType = hi ? hi.precipType : cur.precipType;
  const rawPhase = hi ? hi.precipPhase : (cur.precipPhase ?? h0?.precipPhase);

  const precipType: PrecipType = !isWet
    ? "none"
    : resolveWetPrecipType(rawType, rawPhase, airSnowCm, wetBulbC);

  const precipIntensity = !isWet
    ? 0
    : Number(
        clamp(
          0.1 + 0.9 * Math.sqrt(Math.max(precipMm, airSnowCm) / 8.0),
          0.1,
          1.0
        ).toFixed(4)
      );

  const effectiveMmHr = !isWet
    ? 0
    : Math.max(
        precipMm,
        airSnowCm >= PRECIP_WETNESS_CONTRACT.SNOW_FLURRY_ACTIVE_CM
          ? PRECIP_WETNESS_CONTRACT.WET_ACTIVE_MIN_MM
          : precipMm
      );

  const lightningProbPct = hi
    ? clamp(Math.round(hi.lightningProbPct ?? 0), 0, 99)
    : clamp(
        Math.round(
          cur.lightningProbPct ??
            h0?.lightningProbPct ??
            bundle.snowAndLightning?.lightningRadar.rings[0].probabilityPct ??
            0
        ),
        0,
        99
      );

  const lightningFlashRatePerMin = hi
    ? Math.max(0, hi.lightningFlashesPerMin ?? 0)
    : Math.max(
        0,
        cur.lightningFlashesPerMin ??
          h0?.lightningFlashesPerMin ??
          bundle.snowAndLightning?.lightningRadar.currentFlashesPerMin ??
          0
      );

  const isThundersnow = hi
    ? Boolean(hi.isThundersnow)
    : Boolean(
        cur.isThundersnow ??
          h0?.isThundersnow ??
          bundle.snowAndLightning?.lightningRadar.isThundersnowNow
      );

  return {
    windSpeed: hi ? hi.windSpeed : cur.windSpeed,
    windDirection: hi ? hi.windDirection : cur.windDirection,
    cloudCover: hi ? hi.cloudCover : cur.cloudCover,
    visibilityKm: hi ? hi.visibilityKm : cur.visibilityKm,
    airQualityIndex: clampedIdx === 0 ? bundle.airQuality.categoryIndex : 1,
    isStorm: hi ? hi.isStorm : cur.isStorm,
    precipType,
    precipIntensity,
    rainAccum: hi ? hi.rainAccum : (h0?.rainAccum ?? 0),
    snowAccum: hi ? hi.snowAccum : (h0?.snowAccum ?? 0),
    solarElevationDeg,
    daylight,
    cape: hi
      ? (hi.cape ?? 0)
      : (h0?.cape ?? bundle.nativeConvective.cape ?? 0),
    lightningFlashRatePerMin,
    snowSlrRatio: hi
      ? (hi.snowSlr ?? 10)
      : (cur.snowSlr ?? h0?.snowSlr ?? 10),
    isThundersnow,
    lightningProbPct,
    precipitationMmHr: effectiveMmHr,
    solarArcProgress: solarArc.solarArcProgress
  };
}

/**
 * Tüm Hava sekmesi panelleri ve 3D sahne için tekil deterministik zaman görünümü (`ActiveTemporalView`).
 */
export function resolveActiveTemporalView(
  bundle: WeatherBundle,
  frameIndex: number
): ActiveTemporalView {
  const clampedIdx = clampFrameIndex(bundle, frameIndex);
  const mode: TemporalViewMode =
    clampedIdx === 0 ? "LIVE_NOW" : "FORECAST_LOCKED";
  const cur = bundle.current;
  const h0 = bundle.hourly[0] ?? null;
  const hi = clampedIdx > 0 ? (bundle.hourly[clampedIdx] ?? null) : null;

  const pressureDelta3h = computeTemporalPressureDelta3h(bundle, clampedIdx);

  let telemetry: TemporalTelemetry;
  if (!hi) {
    const wetBulbC =
      cur.wetBulbC ??
      h0?.wetBulbC ??
      Number(wetBulbStullC(cur.temperature, cur.humidity).toFixed(1));
    const rawAirSnow = cur.airSnowCmHr ?? h0?.airSnowCm ?? 0;
    const isWetActive = isWetActiveSample(cur.precipitation, rawAirSnow);
    const potentialPrecipPhase =
      cur.potentialPrecipPhase ??
      inferPotentialPhase(wetBulbC, cur.precipType, cur.precipPhase ?? h0?.precipPhase);
    const precipType: PrecipType = !isWetActive
      ? "none"
      : resolveWetPrecipType(
          cur.precipType,
          cur.precipPhase ?? h0?.precipPhase,
          rawAirSnow,
          wetBulbC
        );
    const precipPhase: PrecipPhase = !isWetActive
      ? "none"
      : cur.precipPhase && cur.precipPhase !== "none"
        ? cur.precipPhase
        : precipType === "snow"
          ? "snow"
          : "rain";
    const airSnowCm = !isWetActive ? 0 : rawAirSnow;
    const groundSnowCm = !isWetActive
      ? 0
      : (cur.groundSnowCmHr ?? h0?.groundSnowCm ?? 0);
    const roadSnowCm = !isWetActive
      ? 0
      : (cur.roadSnowCmHr ?? h0?.roadSnowCm ?? 0);
    const snowpackDepthCm = cur.snowpackDepthCm ?? h0?.snowpackDepthCm ?? 0;
    const airSnowProbPct = h0?.airSnowProbPct ?? 0;
    const lightningProbPct = clamp(
      Math.round(
        cur.lightningProbPct ??
          h0?.lightningProbPct ??
          bundle.snowAndLightning?.lightningRadar.rings[0].probabilityPct ??
          0
      ),
      0,
      99
    );
    const isThundersnow = Boolean(
      cur.isThundersnow ??
        h0?.isThundersnow ??
        bundle.snowAndLightning?.lightningRadar.isThundersnowNow
    );
    const sky = sanitizeDryWeatherSky({
      isWet: isWetActive,
      rawCode: cur.weatherCode,
      rawCondition: cur.condition,
      cloudCover: cur.cloudCover,
      lightningProbPct,
      isThundersnow
    });
    const capeVal = h0?.cape ?? bundle.nativeConvective.cape ?? null;
    const explicitStormScore = cur.stormScore ?? h0?.stormScore;
    const stormScore =
      explicitStormScore !== undefined && Number.isFinite(explicitStormScore)
        ? Math.round(clamp(explicitStormScore, 0, 100))
        : estimateFallbackStormScore({
            isStorm: cur.isStorm,
            windSpeed: cur.windSpeed,
            windGusts: cur.windGusts,
            precipitation: cur.precipitation,
            lightningProbPct,
            cape: capeVal ?? 0,
            weatherCode: sky.weatherCode
          });
    const snowLineElevationM =
      cur.snowLineElevationM ?? h0?.snowLineElevationM ?? null;
    const temp850hPa = cur.temp850hPa ?? h0?.temp850hPa ?? null;

    telemetry = {
      time: cur.time,
      hourLabel: h0?.hourLabel ?? cur.time.slice(11, 16),
      dayLabel: h0?.dayLabel ?? "Bugün",
      timeLabel: `Gözlem · ${cur.time.slice(11, 16)}`,
      temperature: cur.temperature,
      tempP10: cur.tempBand?.p10 ?? h0?.tempP10,
      tempP90: cur.tempBand?.p90 ?? h0?.tempP90,
      apparentTemperature: cur.apparentTemperature,
      wetBulbC,
      humidity: cur.humidity,
      dewPoint: cur.dewPoint,
      pressure: cur.pressure,
      pressureDelta3h,
      pressureTrend: cur.pressureTrend || classifyPressureTrendLocal(pressureDelta3h),
      pressureTrendDetail:
        cur.pressureTrendDetail || describePressureTrendDetailLocal(pressureDelta3h),
      windSpeed: cur.windSpeed,
      windGusts: cur.windGusts,
      gustP90: h0?.gustP90,
      windDirection: cur.windDirection,
      windCompassTr: bearingToCompassLocalTr(cur.windDirection),
      beaufort: cur.beaufort ?? windKmhToBeaufortLocal(cur.windSpeed),
      cloudCover: cur.cloudCover,
      visibilityKm: cur.visibilityKm,
      uvIndex: cur.uvIndex,
      uvLabel: cur.uvLabel || classifyUvIndexLocal(cur.uvIndex),
      precipitation: cur.precipitation,
      precipProbability: cur.precipProbability,
      precipConsensus: cur.precipConsensus,
      isWetActive,
      precipType,
      precipPhase,
      potentialPrecipPhase,
      rainAccum: h0?.rainAccum ?? 0,
      snowAccum: h0?.snowAccum ?? 0,
      airSnowCm,
      airSnowCmHr: airSnowCm,
      airSnowProbPct,
      groundSnowCm,
      groundSnowCmHr: groundSnowCm,
      roadSnowCm,
      roadSnowCmHr: roadSnowCm,
      snowpackDepthCm,
      roadSnowDepthCm: h0?.roadSnowDepthCm ?? 0,
      snowLineElevationM,
      showSnowLine: isSnowLinePhysicallyRelevant({
        snowLineElevationM,
        baseElevationM: bundle.location.elevation ?? 100,
        temperatureC: cur.temperature,
        temp850hPa,
        precipMmHr: cur.precipitation,
        precipProbabilityPct: cur.precipProbability,
        airSnowProbPct,
        snowpackDepthCm
      }),
      wetBulbZeroM:
        h0?.wetBulbZeroM ?? h0?.freezingLevelM ?? bundle.nativeConvective.freezingLevelM ?? null,
      freezingLevelM:
        h0?.freezingLevelM ?? bundle.nativeConvective.freezingLevelM ?? null,
      snowSlr: cur.snowSlr ?? h0?.snowSlr ?? 0,
      snowQualityTr: cur.snowQualityTr ?? h0?.snowQualityTr ?? "Yok",
      soilTempC: cur.soilTempC ?? h0?.soilTempC,
      roadTempC: cur.roadTempC ?? h0?.roadTempC,
      icingRisk: cur.icingRisk ?? h0?.icingRisk ?? "none",
      blowingSnowRisk: cur.blowingSnowRisk ?? h0?.blowingSnowRisk ?? "none",
      dekStatus: cur.dekStatus ?? h0?.dekStatus ?? "none",
      elevationSnowBands: h0?.elevationSnowBands,
      weatherCode: sky.weatherCode,
      condition: sky.condition,
      isStorm: cur.isStorm,
      stormScore,
      lightningProbPct,
      lpiJkg:
        h0?.lpiJkg ?? bundle.snowAndLightning?.lightningRadar.currentLpiJkg ?? 0,
      lightningFlashesPerMin:
        cur.lightningFlashesPerMin ??
        h0?.lightningFlashesPerMin ??
        bundle.snowAndLightning?.lightningRadar.currentFlashesPerMin ??
        0,
      cgFractionPct:
        h0?.cgFractionPct ??
        bundle.snowAndLightning?.lightningRadar.currentCgFractionPct ??
        28,
      isThundersnow,
      solarElevationDeg: cur.solarElevationDeg,
      daylight: cur.daylight,
      cape: capeVal,
      cin: h0?.cin ?? bundle.nativeConvective.cin ?? null,
      liftedIndex: h0?.liftedIndex ?? bundle.nativeConvective.liftedIndex ?? null,
      temp850hPa
    };
  } else {
    const wetBulbC =
      hi.wetBulbC ?? Number(wetBulbStullC(hi.temperature, hi.humidity).toFixed(1));
    const rawAirSnow = hi.airSnowCm ?? 0;
    const isWetActive = isWetActiveSample(hi.precipitation, rawAirSnow);
    const potentialPrecipPhase = inferPotentialPhase(
      wetBulbC,
      hi.precipType,
      hi.precipPhase
    );
    const precipType: PrecipType = !isWetActive
      ? "none"
      : resolveWetPrecipType(hi.precipType, hi.precipPhase, rawAirSnow, wetBulbC);
    const precipPhase: PrecipPhase = !isWetActive
      ? "none"
      : hi.precipPhase && hi.precipPhase !== "none"
        ? hi.precipPhase
        : precipType === "snow"
          ? "snow"
          : "rain";
    const airSnowCm = !isWetActive ? 0 : rawAirSnow;
    const groundSnowCm = !isWetActive ? 0 : (hi.groundSnowCm ?? 0);
    const roadSnowCm = !isWetActive ? 0 : (hi.roadSnowCm ?? 0);
    const snowpackDepthCm = hi.snowpackDepthCm ?? 0;
    const airSnowProbPct = hi.airSnowProbPct ?? 0;
    const lightningProbPct = clamp(Math.round(hi.lightningProbPct ?? 0), 0, 99);
    const isThundersnow = Boolean(hi.isThundersnow);
    const sky = sanitizeDryWeatherSky({
      isWet: isWetActive,
      rawCode: hi.weatherCode,
      rawCondition: hi.condition,
      cloudCover: hi.cloudCover,
      lightningProbPct,
      isThundersnow
    });
    const stormScore =
      hi.stormScore !== undefined && Number.isFinite(hi.stormScore)
        ? Math.round(clamp(hi.stormScore, 0, 100))
        : estimateFallbackStormScore({
            isStorm: hi.isStorm,
            windSpeed: hi.windSpeed,
            windGusts: hi.windGusts,
            precipitation: hi.precipitation,
            lightningProbPct,
            cape: hi.cape ?? 0,
            weatherCode: sky.weatherCode
          });
    const snowLineElevationM = hi.snowLineElevationM ?? null;

    telemetry = {
      time: hi.time,
      hourLabel: hi.hourLabel,
      dayLabel: hi.dayLabel,
      timeLabel: `${hi.dayLabel} · ${hi.hourLabel}`,
      temperature: hi.temperature,
      tempP10: hi.tempP10,
      tempP90: hi.tempP90,
      apparentTemperature: hi.apparentTemperature,
      wetBulbC,
      humidity: hi.humidity,
      dewPoint: hi.dewPoint,
      pressure: hi.pressure,
      pressureDelta3h,
      pressureTrend: classifyPressureTrendLocal(pressureDelta3h),
      pressureTrendDetail: describePressureTrendDetailLocal(pressureDelta3h),
      windSpeed: hi.windSpeed,
      windGusts: hi.windGusts,
      gustP90: hi.gustP90,
      windDirection: hi.windDirection,
      windCompassTr: bearingToCompassLocalTr(hi.windDirection),
      beaufort: windKmhToBeaufortLocal(hi.windSpeed),
      cloudCover: hi.cloudCover,
      visibilityKm: hi.visibilityKm,
      uvIndex: hi.uvIndex,
      uvLabel: classifyUvIndexLocal(hi.uvIndex),
      precipitation: hi.precipitation,
      precipProbability: hi.precipProbability,
      precipConsensus: hi.precipConsensus,
      isWetActive,
      precipType,
      precipPhase,
      potentialPrecipPhase,
      rainAccum: hi.rainAccum,
      snowAccum: hi.snowAccum,
      airSnowCm,
      airSnowCmHr: airSnowCm,
      airSnowProbPct,
      groundSnowCm,
      groundSnowCmHr: groundSnowCm,
      roadSnowCm,
      roadSnowCmHr: roadSnowCm,
      snowpackDepthCm,
      roadSnowDepthCm: hi.roadSnowDepthCm ?? 0,
      snowLineElevationM,
      showSnowLine: isSnowLinePhysicallyRelevant({
        snowLineElevationM,
        baseElevationM: bundle.location.elevation ?? 100,
        temperatureC: hi.temperature,
        temp850hPa: hi.temp850hPa,
        precipMmHr: hi.precipitation,
        precipProbabilityPct: hi.precipProbability,
        airSnowProbPct,
        snowpackDepthCm
      }),
      wetBulbZeroM: hi.wetBulbZeroM ?? hi.freezingLevelM ?? null,
      freezingLevelM: hi.freezingLevelM ?? null,
      snowSlr: hi.snowSlr ?? 0,
      snowQualityTr: hi.snowQualityTr ?? "Yok",
      soilTempC: hi.soilTempC,
      roadTempC: hi.roadTempC,
      icingRisk: hi.icingRisk ?? "none",
      blowingSnowRisk: hi.blowingSnowRisk ?? "none",
      dekStatus: hi.dekStatus ?? "none",
      elevationSnowBands: hi.elevationSnowBands,
      weatherCode: sky.weatherCode,
      condition: sky.condition,
      isStorm: hi.isStorm,
      stormScore,
      lightningProbPct,
      lpiJkg: hi.lpiJkg ?? 0,
      lightningFlashesPerMin: hi.lightningFlashesPerMin ?? 0,
      cgFractionPct: hi.cgFractionPct ?? 28,
      isThundersnow,
      solarElevationDeg: hi.solarElevationDeg,
      daylight: hi.daylight,
      cape: hi.cape ?? null,
      cin: hi.cin ?? null,
      liftedIndex: hi.liftedIndex ?? null,
      temp850hPa: hi.temp850hPa
    };
  }

  const referenceIso = telemetry.time;
  const activeDateYmd = referenceIso.slice(0, 10);
  const matchedDay: DailyPoint | null =
    bundle.daily.find((d) => d.date === activeDateYmd) ?? bundle.daily[0] ?? null;

  const sunrise = matchedDay?.sunrise ?? cur.sunrise ?? "";
  const sunset = matchedDay?.sunset ?? cur.sunset ?? "";
  const solarArc = computeModularSolarArc({
    referenceIso,
    sunrise,
    sunset,
    solarElevationDeg: telemetry.solarElevationDeg,
    subHourOffsetFrac: clampedIdx === 0 ? cur.subHourOffsetFrac : undefined
  });

  const tempMin = matchedDay
    ? Math.min(matchedDay.tempMin, telemetry.temperature)
    : telemetry.temperature;
  const tempMax = matchedDay
    ? Math.max(matchedDay.tempMax, telemetry.temperature)
    : telemetry.temperature;
  const uvCurrent = telemetry.uvIndex;
  const uvDayMax = Math.max(matchedDay?.uvIndexMax ?? 0, uvCurrent);

  const dayContext: TemporalDayContext = {
    date: matchedDay?.date ?? activeDateYmd,
    dayName: matchedDay?.dayName ?? telemetry.dayLabel,
    tempMin,
    tempMax,
    sunrise,
    sunset,
    sunriseClock: solarArc.sunriseClock,
    sunsetClock: solarArc.sunsetClock,
    uvCurrent,
    uvDayMax,
    uvLabelTr: classifyUvIndexLocal(uvCurrent),
    uvDayMaxLabelTr: classifyUvIndexLocal(uvDayMax),
    solarElevationDeg: telemetry.solarElevationDeg,
    solarArcProgress: solarArc.solarArcProgress,
    dayDurationMin: solarArc.dayDurationMin,
    dayDurationLabelTr: solarArc.dayDurationLabelTr,
    isNight: solarArc.isNight
  };

  const stormChip = resolveTemporalStormChip({
    score: telemetry.stormScore,
    isThundersnow: telemetry.isThundersnow,
    lightningProbPct: telemetry.lightningProbPct,
    windSpeed: telemetry.windSpeed,
    windGusts: telemetry.windGusts,
    precipitation: telemetry.precipitation,
    cape: telemetry.cape,
    weatherCode: telemetry.weatherCode
  });

  const airQualityContext: TemporalAirQualityContext = {
    availableForHour: clampedIdx === 0,
    data: bundle.airQuality,
    scopeLabelTr:
      clampedIdx === 0
        ? "Canlı CAMS"
        : "T+0 Gözlem Referansı (Saatlik CAMS Yok)"
  };

  const surfaceOpts = {
    surfaceTempC: telemetry.temperature,
    surfaceHumidity: telemetry.humidity,
    surfacePressureHpa: telemetry.pressure
  };

  const soundingSummary: CapeAnalysisResult | null =
    clampedIdx < bundle.hourlySoundings.length &&
    (bundle.hourlySoundings[clampedIdx]?.length ?? 0) >= 3
      ? analyzeSounding(bundle.hourlySoundings[clampedIdx], surfaceOpts)
      : clampedIdx === 0 && bundle.sounding.length >= 3
        ? analyzeSounding(bundle.sounding, surfaceOpts)
        : null;

  const lightningRadar = resolveTemporalLightningRadar(bundle, clampedIdx);
  const atmosphere = buildPhysicalSceneAtmosphere(bundle, clampedIdx);

  return {
    mode,
    frameIndex: clampedIdx,
    leadHours: clampedIdx,
    referenceIso,
    cockpitTitleTr:
      clampedIdx === 0
        ? "Anlık Gözlem Telemetrisi"
        : `Seçili Saat Telemetrisi (+${clampedIdx}s)`,
    telemetry,
    dayContext,
    stormChip,
    airQualityContext,
    soundingSummary,
    lightningRadar,
    atmosphere
  };
}

/**
 * 3D `StormScene` ve ses motoru için saf fiziksel sürücü çıkarıcı (`extractStormSceneDrive`):
 * - `0.0 mm` kuru havada `effectivePrecipIntensity = 0` (`0` yağış parçacığı).
 * - Şimşek kalkanı (`canFlashLightning`): kuru Lodos (`isStorm`) veya `prob === 0` iken yüksek CAPE asla şimşek çaktırmaz.
 * - Meteorolojik rüzgar yönünden (`windDirection`, geldiği derece) ekran akış vektörü `(-sin(rad), -cos(rad))` üretir.
 * - Doğudan batıya gerçek güneş yayı `sunNormX = -0.38 + 0.76 * clamp(solarArcProgress, 0, 1)`.
 */
export function extractStormSceneDrive(
  atmosphere: SceneAtmosphereInput
): StormSceneDrive {
  const fallbackMm = atmosphere.precipIntensity > 0 ? 0.1 : 0;
  const isWet = isWetActiveSample(atmosphere.precipitationMmHr ?? fallbackMm);
  const effectivePrecipIntensity =
    !isWet || atmosphere.precipType === "none"
      ? 0
      : clamp(atmosphere.precipIntensity, 0, 1);
  const effectivePrecipType: PrecipType =
    effectivePrecipIntensity > 0 ? atmosphere.precipType : "none";

  const prob = atmosphere.lightningProbPct;
  const flashRate = atmosphere.lightningFlashRatePerMin ?? 0;
  const isTsnow = Boolean(atmosphere.isThundersnow);
  const canFlashLightning =
    prob !== undefined && Number.isFinite(prob)
      ? prob > 0 && (prob >= 20 || flashRate >= 0.15 || isTsnow)
      : flashRate >= 0.15 || isTsnow;

  const flashFrequencyHz = !canFlashLightning
    ? 0
    : flashRate > 0
      ? clamp(0.12 + flashRate * 0.06, 0.14, 0.65)
      : 0.24;

  const windDeg = (((atmosphere.windDirection % 360) + 360) % 360);
  const windRad = (windDeg * Math.PI) / 180;
  const windFlowX = normalizeZero(-Math.sin(windRad));
  const windFlowY = normalizeZero(-Math.cos(windRad));

  const arcProgress = clamp(atmosphere.solarArcProgress ?? 0.5, 0, 1);
  const sunNormX = normalizeZero(Number((-0.38 + 0.76 * arcProgress).toFixed(4)));
  const isNight = atmosphere.solarElevationDeg <= -3.0;

  const maxParticles = 360;
  const precipParticleCount =
    effectivePrecipIntensity > 0
      ? Math.max(1, Math.round(maxParticles * effectivePrecipIntensity))
      : 0;
  const hasGaleWindStreaks =
    effectivePrecipIntensity === 0 && atmosphere.windSpeed >= 38;
  const windStreakCount = hasGaleWindStreaks
    ? Math.min(64, Math.max(4, Math.floor((atmosphere.windSpeed - 36) * 1.8)))
    : 0;

  return {
    isWet: effectivePrecipIntensity > 0,
    effectivePrecipType,
    effectivePrecipIntensity,
    canFlashLightning,
    flashFrequencyHz,
    stormCloudFactor: atmosphere.isStorm ? 1 : 0,
    windRad,
    windFlowX,
    windFlowY,
    sunNormX,
    isNight,
    hasGaleWindStreaks,
    precipParticleCount,
    windStreakCount,
    activeParticleCount:
      precipParticleCount > 0 ? precipParticleCount : windStreakCount
  };
}
