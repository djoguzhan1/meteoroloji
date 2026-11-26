export type UnitSystem = "metric" | "imperial";

export type PrecipType = "none" | "rain" | "snow";

export type PrecipPhase = "none" | "rain" | "sleet" | "snow" | "hail";

export type PressureTrend =
  | "hızlı yükseliyor"
  | "yükseliyor"
  | "sabit"
  | "düşüyor"
  | "hızlı düşüyor";

export type SevenModelKey =
  | "ecmwfIfs"
  | "ecmwfAifs"
  | "icon"
  | "ukmo"
  | "gfs"
  | "meteofrance"
  | "gem";

/** Geriye dönük uyumluluk için takma ad */
export type FiveModelKey = SevenModelKey;

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

export type DailyPoint = {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  tempMaxP10?: number;
  tempMaxP90?: number;
  tempMinP10?: number;
  tempMinP90?: number;
  weatherCode: number;
  condition: string;
  precipSum: number;
  precipP90?: number;
  precipProbabilityMax: number;
  precipPhase?: PrecipPhase;
  windSpeedMax: number;
  windGustMax?: number;
  stormScoreMax?: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
  stabilityGrade?: "LOCKED" | "CONVERGING" | "WATCH";
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
  modelKey: SevenModelKey;
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

export type LiveVerificationReport = {
  mode: "live-metar-48h" | "live-metar-24h" | "wmo-prior";
  station: MetarObservation | null;
  stations?: MetarObservation[];
  matchedHours: number;
  winners: {
    temperature: SevenModelKey | null;
    pressure: SevenModelKey | null;
    wind: SevenModelKey | null;
    precipitation?: SevenModelKey | null;
  };
  calibration?: KalmanCalibrationSummary;
  rows: ModelVerificationRow[];
};

export type AtmosV4Meta = {
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
  bursaTier1Online: number;
  ltbrIsolated: boolean;
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
  atmosV4?: AtmosV4Meta;
};

export type WeatherBundle = {
  location: GeoLocation;
  source: "hybrid-nwp-verified" | "hybrid-nwp" | "open-meteo";
  fetchedAt: string;
  timezone: string;
  utcOffsetSeconds: number;
  current: CurrentWeather;
  airQuality: AirQualityDetail;
  hourly: HourlyPoint[];
  minutely15?: Minutely15Point[];
  daily: DailyPoint[];
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
  meteofrance?: number | null;
  gem?: number | null;
};

export type MultiModelBundle = {
  fetchedAt: string;
  lat: number;
  lon: number;
  temp2m: ModelSeriesPoint[];
  temp850: ModelSeriesPoint[];
  precip: ModelSeriesPoint[];
  wind10m: ModelSeriesPoint[];
  summary: {
    precip72h: Record<SevenModelKey, number>;
    maxSpreadTemp2m: number;
    min850hPa: Record<SevenModelKey, number | null>;
  };
};

export type RadarFrame = {
  time: number;
  path: string;
};

export type RadarMetadata = {
  host: string;
  generated: number;
  frames: RadarFrame[];
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
