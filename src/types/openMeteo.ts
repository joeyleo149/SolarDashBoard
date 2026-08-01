/** Hourly variables fetched for solar radiation forecasts. */
export const OPEN_METEO_SOLAR_HOURLY_VARIABLES = [
  'temperature_2m',
  'cloud_cover',
  'direct_normal_irradiance',
  'diffuse_radiation',
] as const

export type OpenMeteoSolarHourlyVariable =
  (typeof OPEN_METEO_SOLAR_HOURLY_VARIABLES)[number]

/** Geographic coordinates for an Open-Meteo request. */
export interface OpenMeteoCoordinates {
  latitude: number
  longitude: number
}

/**
 * Request parameters for the Open-Meteo `/v1/forecast` endpoint.
 * @see https://open-meteo.com/en/docs
 */
export interface OpenMeteoForecastRequestParams extends OpenMeteoCoordinates {
  /** Number of forecast days (0–16). Defaults to 7. */
  forecast_days?: number
  /** IANA timezone (e.g. `"Europe/Berlin"`) or `"auto"`. */
  timezone?: string
  /** Start date in `YYYY-MM-DD` format. */
  start_date?: string
  /** End date in `YYYY-MM-DD` format. */
  end_date?: string
  /** Number of past days to include (0–92). */
  past_days?: number
}

/** Unit labels returned alongside hourly data. */
export interface OpenMeteoSolarHourlyUnits {
  time: 'iso8601'
  temperature_2m: '°C' | '°F'
  cloud_cover: '%'
  direct_normal_irradiance: 'W/m²'
  diffuse_radiation: 'W/m²'
}

/** Hourly time-series arrays from the forecast API. */
export interface OpenMeteoSolarHourlyData {
  time: string[]
  temperature_2m: (number | null)[]
  cloud_cover: (number | null)[]
  direct_normal_irradiance: (number | null)[]
  diffuse_radiation: (number | null)[]
}

/** Successful response payload from `/v1/forecast`. */
export interface OpenMeteoForecastResponse {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  hourly_units: OpenMeteoSolarHourlyUnits
  hourly: OpenMeteoSolarHourlyData
}

/** Error response payload returned by Open-Meteo on failure. */
export interface OpenMeteoErrorResponse {
  error?: boolean
  reason: string
}
