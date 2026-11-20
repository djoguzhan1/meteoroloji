export type UnitSystem = "metric" | "imperial";

export type PerformanceMode = "auto" | "high" | "low";

export type ScenarioKey = "live" | "storm" | "snow" | "fog" | "sunset" | "sunny";

export type PrecipType = "none" | "rain" | "snow";

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
  dust: number;
};

export type CurrentWeather = {
  time: string;
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
  weatherCode: number;
  condition: string;
  isStorm: boolean;
  isDay: boolean;
  daylight: number;
  sunrise: string;
  sunset: string;
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
  daylight: number;
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

export type WeatherBundle = {
  location: GeoLocation;
  source: "open-meteo" | "tomorrow.io" | "demo";
  fetchedAt: string;
  timezone: string;
  utcOffsetSeconds: number;
  current: CurrentWeather;
  airQuality: AirQualityDetail;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  sounding: SoundingLevel[];
  nativeConvective: NativeConvective;
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
  airQualityIndex: number;
  isStorm: boolean;
  precipType: PrecipType;
  precipIntensity: number;
  rainAccum: number;
  snowAccum: number;
  daylight: number;
  cape: number;
};
