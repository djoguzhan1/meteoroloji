export type UnitSystem = "metric" | "imperial";

export type PrecipType = "none" | "rain" | "snow";

export type PrecipPhase =
  | "none"
  | "rain"
  | "freezing_rain"
  | "sleet"
  | "snow"
  | "hail";

export type PressureTrend =
  | "hızlı yükseliyor"
  | "yükseliyor"
  | "sabit"
  | "düşüyor"
  | "hızlı düşüyor";

export type CoreModelKey =
  | "ecmwfIfs"
  | "ecmwfAifs"
  | "icon"
  | "ukmo"
  | "meteofrance"
  | "gfs"
  | "gem"
  | "jma";

export type FreshnessStatus = "live" | "degraded" | "stale";

export type FreshnessSourceTier =
  | "live"
  | "memory-stale"
  | "disk-stale"
  | "client-cache";

export type ForecastHorizonTier = "exact" | "synoptic" | "subseasonal";

export type DataFreshnessMeta = {
  status: FreshnessStatus;
  sourceTier: FreshnessSourceTier;
  /** Gerçek model/veri çekim zamanı (ISO 8601 UTC) */
  fetchedAt: string;
  /** Önbelleğe yazıldığı Unix milisaniye zaman damgası */
  cachedAtMs: number;
  /** Şu anki zamana göre veri yaşı (saniye) */
  ageSeconds: number;
  /** Bayat veya kısmi mod açıklaması */
  staleReason?: string;
  /** Kısmi kesintiye uğrayan alt veri akışları */
  degradedStreams?: string[];
  /** Başarıyla yanıt veren çekirdek NWP/AI model sayısı */
  modelsRespondedCount?: number;
};

export type GeoLocation = {
  id: string;
  name: string;
  admin1?: string;
  country: string;
  countryCode?: string;
  lat: number;
  lon: number;
  elevation?: number;
  timezone?: string;
};

export type AirQualityDetail = {
  europeanAqi: number;
  categoryIndex: 1 | 2 | 3 | 4 | 5 | 6;
  label: string;
  dominantPollutant: string;
  dominantValueText: string;
  pm25: number;
  pm10: number;
  ozone: number;
  no2: number;
  so2: number;
  dust: number;
};

export type PrecipitationConsensus = {
  agreeingModels: number;
  totalModels: number;
  minMm: number;
  medianMm: number;
  maxMm: number;
  p10Mm?: number;
  p50Mm?: number;
  p90Mm?: number;
  heavyProbPct?: number; // P(>= 5 mm/s)
  extremeProbPct?: number; // P(>= 15 mm/s)
  ensembleMembers?: number;
};

export type EnsembleBand = {
  p10: number;
  p50: number;
  p90: number;
  members: number;
};

export type Minutely15Point = {
  time: string;
  label: string;
  temperature: number;
  precipitation: number;
  rain: number;
  snowfall: number;
  windGusts: number;
  cape: number | null;
  lightningPotential: number | null;
  weatherCode: number;
  precipPhase: PrecipPhase;
};

export type StormThreatLevel =
  | "calm"
  | "watch"
  | "thunderstorm"
  | "severe"
  | "extreme";

export type StormWindow = {
  startTime: string;
  peakTime: string;
  endTime: string;
  startLabel: string;
  peakLabel: string;
  endLabel: string;
  peakScore: number;
  peakGustKmh: number;
  peakPrecipMm: number;
};

export type StormAssessment = {
  score: number; // 0..100
  level: StormThreatLevel;
  label: string;
  color: string;
  lightningProbPct: number;
  hailRisk: "Yok" | "Düşük" | "Orta" | "Yüksek";
  flashFloodRisk: "Yok" | "Düşük" | "Orta" | "Yüksek";
  expectedPeakGustP50: number;
  expectedPeakGustP90: number;
  components: {
    convective: number; // 0..100
    wind: number; // 0..100
    rainfall: number; // 0..100
    synoptic: number; // 0..100
  };
  nextWindow: StormWindow | null;
  drivers: string[];
};

export type BeaufortInfo = {
  scale: number;
  label: string;
};

export type CurrentWeather = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  wetBulbC?: number;
  tempBand?: EnsembleBand;
  humidity: number;
  dewPoint: number;
  pressure: number;
  pressureDelta3h: number;
  pressureTrend: PressureTrend;
  pressureTrendDetail: string;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  beaufort: BeaufortInfo;
  cloudCover: number;
  visibilityKm: number;
  uvIndex: number;
  uvLabel: string;
  precipitation: number;
  precipProbability: number;
  precipConsensus: PrecipitationConsensus;
  precipType: PrecipType;
  precipPhase?: PrecipPhase;
  snowLineElevationM?: number | null;
  weatherCode: number;
  condition: string;
  isStorm: boolean;
  stormScore?: number;
  isDay: boolean;
  solarElevationDeg: number;
  daylight: number;
  sunrise: string;
  sunset: string;
  temp850hPa: number | null;
};

export type HourlyPoint = {
  time: string;
  hourLabel: string;
  dayLabel: string;
  temperature: number;
  tempP10?: number;
  tempP90?: number;
  apparentTemperature: number;
  wetBulbC?: number;
  humidity: number;
  dewPoint: number;
  pressure: number;
  windSpeed: number;
  windGusts: number;
  gustP90?: number;
  windDirection: number;
  cloudCover: number;
  visibilityKm: number;
  uvIndex: number;
  precipitation: number;
  precipProbability: number;
  precipConsensus: PrecipitationConsensus;
  precipType: PrecipType;
  precipPhase?: PrecipPhase;
  snowLineElevationM?: number | null;
  rainAccum: number;
  snowAccum: number;
  weatherCode: number;
  condition: string;
  isStorm: boolean;
  stormScore?: number;
  lightningProbPct?: number;
  solarElevationDeg: number;
  daylight: number;
  cape: number | null;
  cin: number | null;
  liftedIndex: number | null;
  freezingLevelM: number | null;
  temp850hPa: number | null;
  stabilityGrade?: "LOCKED" | "CONVERGING" | "WATCH";
};

export type DailyBimodalSplit = {
  coldModeC: number;
  warmModeC: number;
  winningMode: "cold" | "warm";
  winningWeightPct: number;
  separationC: number;
};

export type DailyPoint = {
  date: string;
  dayName: string;
  horizonTier?: ForecastHorizonTier;
  tempMax: number;
  tempMin: number;
  tempMaxP10?: number;
  tempMaxP90?: number;
  tempMinP10?: number;
  tempMinP90?: number;
  tempNormalMax?: number;
  tempNormalMin?: number;
  tempAnomalyC?: number;
  daytimeTempC?: number;
  nighttimeTempC?: number;
  weatherCode: number;
  condition: string;
  precipSum: number;
  precipP90?: number;
  precipProbabilityMax: number;
  precipPhase?: PrecipPhase;
  windSpeedMax: number;
  windGustMax?: number;
  dominantWindCompass?: string;
  stormScoreMax?: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
  confidencePct?: number;
  activeModelCount?: number;
  ensembleMemberCount?: number;
  bimodalSplit?: DailyBimodalSplit | null;
  stabilityGrade?: "LOCKED" | "CONVERGING" | "WATCH";
};

export type SubseasonalDayPoint = {
  date: string;
  dayLabel: string;
  weekIndex: 3 | 4;
  tempMaxP10: number;
  tempMaxP25: number;
  tempMaxP50: number;
  tempMaxP75: number;
  tempMaxP90: number;
  tempMinP25: number;
  tempMinP50: number;
  tempMinP75: number;
  tempNormalMax: number;
  tempNormalMin: number;
  anomalyC: number;
  wetProbPct: number;
  precipP50Mm: number;
  precipP90Mm: number;
  confidencePct: number;
  ensembleMembers: number;
  weatherCode: number;
  regimeTagTr: string;
};

export type SubseasonalWeekSummary = {
  weekIndex: 3 | 4;
  titleTr: string;
  dateRangeTr: string;
  meanAnomalyC: number;
  tempMaxRangeC: [number, number];
  tempMinRangeC: [number, number];
  wetDaysExpected: number;
  meanWetProbPct: number;
  confidencePct: number;
  dominantRegimeTr: string;
  summaryNoteTr: string;
};

export type SubseasonalOutlookBundle = {
  fetchedAt: string;
  ensembleMembers: number;
  modelsLabel: string;
  biasShiftMaxC: number;
  biasShiftMinC: number;
  weeks: SubseasonalWeekSummary[];
  days: SubseasonalDayPoint[];
};

export type SoundingLevel = {
  pressure: number; // hPa (1000, 925, 850, 700, 500, 400, 300)
  altitudeM: number; // Gerçek dinamik jeopotansiyel yükseklik (m)
  temperature: number; // °C
  dewPoint: number; // °C
  humidity: number; // %
  windSpeedKt: number; // knots
  windDirection: number; // degrees
};

export type NativeConvective = {
  cape: number | null;
  cin: number | null;
  liftedIndex: number | null;
  freezingLevelM: number | null;
  lightningPotential?: number | null;
};

export type HybridModelSnapshot = {
  ecmwfIfs: number | null;
  ecmwfAifs: number | null;
  icon: number | null;
  ukmo: number | null;
  gfs: number | null;
  meteofrance?: number | null;
  gem?: number | null;
  jma?: number | null;
};

export type HybridSourceAttribution = {
  parameter: string;
  primaryEngine: string;
  weightsLabel: string;
  standardRef: string;
  reason: string;
};

export type MetarWxFlags = {
  hasPrecip: boolean;
  heavyPrecip: boolean;
  isThunderstorm: boolean;
  hasHail: boolean;
  hasSnow: boolean;
  hasSquall: boolean;
  hasFog: boolean;
};

export type MetarObservation = {
  icaoId: string;
  stationName: string;
  distanceKm: number;
  elevationM: number;
  obsTimeIso: string;
  ageMinutes: number;
  rawOb: string;
  tempC: number | null;
  dewPointC: number | null;
  windSpeedKmh: number | null;
  windGustKmh: number | null;
  windDirectionDeg: number | null;
  qnhHpa: number | null;
  visibilityKm: number | null;
  wxString: string | null;
  wxFlags?: MetarWxFlags;
};

export type ModelVerificationRow = {
  modelKey: CoreModelKey;
  label: string;
  resolution: string;
  tempRmseC: number | null;
  tempUbRmseC?: number | null;
  tempBiasC?: number | null;
  tempMaeC: number | null;
  pressureRmseHpa: number | null;
  windRmseKmh: number | null;
  dewPointRmseC: number | null;
  precipBrier?: number | null;
  matchedHours: number;
  weightsPct: {
    temperature: number;
    pressure: number;
    wind: number;
    precipitation: number;
  };
};

export type KalmanCalibrationSummary = {
  active: boolean;
  stationCount: number;
  stationIds: string[];
  envLapseRateCPerKm: number;
  nowcastTempDeltaC: number;
  nowcastKalmanGain: number;
  ensembleMembers: number;
  meanTempBiasRemovedC: number;
};

export type LiveVerificationMode =
  | "live-mgm-mesh"
  | "live-station-48h"
  | "live-station-24h"
  | "wmo-prior";

export type LiveVerificationReport = {
  mode: LiveVerificationMode;
  station: MetarObservation | null;
  stations?: MetarObservation[];
  matchedHours: number;
  winners: {
    temperature: CoreModelKey | null;
    pressure: CoreModelKey | null;
    wind: CoreModelKey | null;
    precipitation?: CoreModelKey | null;
  };
  calibration?: KalmanCalibrationSummary;
  rows: ModelVerificationRow[];
};

export type AtmosEngineMeta = {
  activeRegime: string;
  activeRegimeLabel: string;
  verticalMechanism: string;
  froudeNumber: number;
  stabilityPct: number;
  stabilityGrade: "LOCKED" | "CONVERGING" | "WATCH";
  meanRunLockCount: number;
  blockedFlipFlops: number;
  spinUpVetoes: number;
  stabilityBadgeLabel: string;
  radarSummaryCode: string;
  nextRainOnsetMin: number | null;
  rainCessationMin: number | null;
  radarAvailable?: boolean;
  currentRadarDbz?: number;
  currentRadarRainMmHr?: number;
  radarAdvectionSpeedKmh?: number;
  radarAdvectionFromDeg?: number;
  bursaTier1Online: number;
  ltbrIsolated: boolean;
  marmaraSstC?: number | null;
  bimodalHoursResolved?: number;
  mgmDistrictMatched?: string | null;
};

export type HybridMeta = {
  engineVersion?: string;
  activeModels: string[];
  ensembleMembers?: number;
  confidencePct: number;
  tempSpreadC: number;
  pressureSpreadHpa: number;
  currentBreakdown: {
    temperature: HybridModelSnapshot;
    pressure: HybridModelSnapshot;
    windSpeed: HybridModelSnapshot;
    temp850hPa: HybridModelSnapshot;
    precipitation: HybridModelSnapshot;
    cape?: HybridModelSnapshot;
  };
  verification: LiveVerificationReport;
  attributions: HybridSourceAttribution[];
  engineMeta?: AtmosEngineMeta;
};

export type WeatherBundle = {
  location: GeoLocation;
  source: "hybrid-nwp-verified" | "hybrid-nwp" | "open-meteo";
  fetchedAt: string;
  timezone: string;
  utcOffsetSeconds: number;
  freshness?: DataFreshnessMeta;
  current: CurrentWeather;
  airQuality: AirQualityDetail;
  hourly: HourlyPoint[];
  minutely15?: Minutely15Point[];
  daily: DailyPoint[];
  subseasonal?: SubseasonalOutlookBundle | null;
  sounding: SoundingLevel[];
  hourlySoundings: SoundingLevel[][];
  nativeConvective: NativeConvective;
  storm?: StormAssessment;
  hybrid: HybridMeta;
};

export type ModelSeriesPoint = {
  time: string;
  hourLabel: string;
  dayLabel: string;
  ecmwfIfs: number | null;
  ecmwfAifs: number | null;
  icon: number | null;
  ukmo: number | null;
  gfs: number | null;
  meteofrance: number | null;
  gem: number | null;
  jma: number | null;
};

export type MultiModelBundle = {
  fetchedAt: string;
  lat: number;
  lon: number;
  utcOffsetSeconds?: number;
  freshness?: DataFreshnessMeta;
  temp2m: ModelSeriesPoint[];
  temp850: ModelSeriesPoint[];
  precip: ModelSeriesPoint[];
  wind10m: ModelSeriesPoint[];
  summary: {
    precip72h: Record<CoreModelKey, number>;
    precip168h: Record<CoreModelKey, number>;
    precip360h?: Record<CoreModelKey, number>;
    maxSpreadTemp2m: number;
    min850hPa: Record<CoreModelKey, number | null>;
  };
};

export type RadarFrame = {
  time: number;
  path: string;
  isForecast?: boolean;
};

export type RadarMetadata = {
  host: string;
  generated: number;
  lastPastIndex?: number;
  frames: RadarFrame[];
  freshness?: DataFreshnessMeta;
};

export type WindGridBundle = {
  rows: number;
  cols: number;
  south: number;
  west: number;
  north: number;
  east: number;
  u: number[];
  v: number[];
  speedKmh: number[];
  maxSpeedKmh: number;
  fetchedAt: string;
  freshness?: DataFreshnessMeta;
};

export type SynopticSignal = {
  id: string;
  severity: "info" | "caution" | "warning";
  title: string;
  detail: string;
};

export type AlertMetric = "temperature" | "windSpeed" | "precipProbability" | "aqi";

export type WeatherAlertRule = {
  id: string;
  cityId: string;
  cityName: string;
  metric: AlertMetric;
  operator: ">" | "<";
  threshold: number;
  enabled: boolean;
};

export type SceneAtmosphereInput = {
  windSpeed: number;
  windDirection: number;
  cloudCover: number;
  visibilityKm: number;
  airQualityIndex: number;
  isStorm: boolean;
  precipType: PrecipType;
  precipIntensity: number;
  rainAccum: number;
  snowAccum: number;
  solarElevationDeg: number;
  daylight: number;
  cape: number;
};
