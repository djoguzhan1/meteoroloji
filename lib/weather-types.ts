export type UnitSystem = "metric" | "imperial";

export type PrecipType = "none" | "rain" | "snow";

export type PressureTrend =
  | "hızlı yükseliyor"
  | "yükseliyor"
  | "sabit"
  | "düşüyor"
  | "hızlı düşüyor";

export type FiveModelKey = "ecmwfIfs" | "ecmwfAifs" | "icon" | "ukmo" | "gfs";

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
};

export type BeaufortInfo = {
  scale: number;
  label: string;
};

export type CurrentWeather = {
  time: string;
  temperature: number;
  apparentTemperature: number;
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
  weatherCode: number;
  condition: string;
  isStorm: boolean;
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
  apparentTemperature: number;
  humidity: number;
  dewPoint: number;
  pressure: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  cloudCover: number;
  visibilityKm: number;
  uvIndex: number;
  precipitation: number;
  precipProbability: number;
  precipConsensus: PrecipitationConsensus;
  precipType: PrecipType;
  rainAccum: number;
  snowAccum: number;
  weatherCode: number;
  condition: string;
  isStorm: boolean;
  solarElevationDeg: number;
  daylight: number;
  cape: number | null;
  cin: number | null;
  liftedIndex: number | null;
  freezingLevelM: number | null;
  temp850hPa: number | null;
};

export type DailyPoint = {
  date: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  condition: string;
  precipSum: number;
  precipProbabilityMax: number;
  windSpeedMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
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
};

export type HybridModelSnapshot = {
  ecmwfIfs: number | null;
  ecmwfAifs: number | null;
  icon: number | null;
  ukmo: number | null;
  gfs: number | null;
};

export type HybridSourceAttribution = {
  parameter: string;
  primaryEngine: string;
  weightsLabel: string;
  standardRef: string;
  reason: string;
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
};

export type ModelVerificationRow = {
  modelKey: FiveModelKey;
  label: string;
  resolution: string;
  tempRmseC: number | null;
  tempMaeC: number | null;
  pressureRmseHpa: number | null;
  windRmseKmh: number | null;
  dewPointRmseC: number | null;
  matchedHours: number;
  weightsPct: {
    temperature: number;
    pressure: number;
    wind: number;
    precipitation: number;
  };
};

export type LiveVerificationReport = {
  mode: "live-metar-24h" | "wmo-prior";
  station: MetarObservation | null;
  matchedHours: number;
  winners: {
    temperature: FiveModelKey | null;
    pressure: FiveModelKey | null;
    wind: FiveModelKey | null;
  };
  rows: ModelVerificationRow[];
};

export type HybridMeta = {
  activeModels: string[];
  confidencePct: number;
  tempSpreadC: number;
  pressureSpreadHpa: number;
  currentBreakdown: {
    temperature: HybridModelSnapshot;
    pressure: HybridModelSnapshot;
    windSpeed: HybridModelSnapshot;
    temp850hPa: HybridModelSnapshot;
    precipitation: HybridModelSnapshot;
  };
  verification: LiveVerificationReport;
  attributions: HybridSourceAttribution[];
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
  daily: DailyPoint[];
  sounding: SoundingLevel[];
  hourlySoundings: SoundingLevel[][];
  nativeConvective: NativeConvective;
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
    precip72h: Record<FiveModelKey, number>;
    maxSpreadTemp2m: number;
    min850hPa: Record<FiveModelKey, number | null>;
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
  u: number[]; // m/s veya km/s doğu-batı bileşeni (+doğu)
  v: number[]; // kuzey-güney bileşeni (+kuzey)
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
