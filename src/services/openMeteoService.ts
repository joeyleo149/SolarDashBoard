import type {
  OpenMeteoErrorResponse,
  OpenMeteoForecastRequestParams,
  OpenMeteoForecastResponse,
} from '../types/openMeteo.ts'
import { OPEN_METEO_SOLAR_HOURLY_VARIABLES } from '../types/openMeteo.ts'

const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

export class OpenMeteoServiceError extends Error {
  readonly status: number
  readonly reason: string

  constructor(status: number, reason: string) {
    super(`Open-Meteo request failed (${status}): ${reason}`)
    this.name = 'OpenMeteoServiceError'
    this.status = status
    this.reason = reason
  }
}

function buildForecastSearchParams(
  params: OpenMeteoForecastRequestParams,
): URLSearchParams {
  const searchParams = new URLSearchParams({
    latitude: String(params.latitude),
    longitude: String(params.longitude),
    hourly: OPEN_METEO_SOLAR_HOURLY_VARIABLES.join(','),
  })

  if (params.forecast_days !== undefined) {
    searchParams.set('forecast_days', String(params.forecast_days))
  }

  if (params.timezone !== undefined) {
    searchParams.set('timezone', params.timezone)
  }

  if (params.start_date !== undefined) {
    searchParams.set('start_date', params.start_date)
  }

  if (params.end_date !== undefined) {
    searchParams.set('end_date', params.end_date)
  }

  if (params.past_days !== undefined) {
    searchParams.set('past_days', String(params.past_days))
  }

  return searchParams
}

function isOpenMeteoErrorResponse(
  payload: unknown,
): payload is OpenMeteoErrorResponse {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'reason' in payload &&
    typeof (payload as OpenMeteoErrorResponse).reason === 'string'
  )
}

/**
 * Fetches hourly direct normal irradiance, diffuse radiation,
 * temperature, and cloud cover for the given coordinates.
 */
export async function fetchHourlySolarRadiation(
  params: OpenMeteoForecastRequestParams,
): Promise<OpenMeteoForecastResponse> {
  const searchParams = buildForecastSearchParams(params)
  const url = `${OPEN_METEO_FORECAST_URL}?${searchParams.toString()}`

  const response = await fetch(url)

  const payload: unknown = await response.json()

  if (!response.ok) {
    const reason = isOpenMeteoErrorResponse(payload)
      ? payload.reason
      : response.statusText

    throw new OpenMeteoServiceError(response.status, reason)
  }

  return payload as OpenMeteoForecastResponse
}
