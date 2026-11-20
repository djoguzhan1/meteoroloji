export type UnitSystem = "metric" | "imperial";

export type PrecipType = "none" | "rain" | "snow";

export type PressureTrend = "yükseliyor" | "düşüyor" | "sabit";

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
  pm25: number;
  pm10: number;
  ozone: number;
  no2: number;
  so2: number;
  dust: number;
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
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  cloudCover: number;
  visibilityKm: number;
  uvIndex: number;
  precipitation: number;
  precipProbability: number;
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
  altitudeM: number;
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
  ecmwf: number | null;
  icon: number | null;
  gfs: number | null;
};

export type HybridSourceAttribution = {
  parameter: string;
  primaryEngine: string;
  weightsLabel: string;
  reason: string;
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
  attributions: HybridSourceAttribution[];
};

export type WeatherBundle = {
  location: GeoLocation;
  source: "hybrid-nwp" | "open-meteo";
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
  ecmwf: number | null;
  gfs: number | null;
  icon: number | null;
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
    precip72h: { ecmwf: number; gfs: number; icon: number };
    maxSpreadTemp2m: number;
    min850hPa: { ecmwf: number | null; gfs: number | null; icon: number | null };
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
