import type { OpenMeteoForecastResponse } from '../types/openMeteo.ts'
import type {
  SolarEnergyTotals,
  SolarHourlyDataPoint,
} from '../types/solar.ts'

/** Typical PV system performance ratio (inverter + wiring + temperature losses). */
export const DEFAULT_PERFORMANCE_RATIO = 0.8

function getDayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const diff = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ) - start

  return Math.floor(diff / 86_400_000)
}

/** Solar elevation angle in degrees for the given location and UTC time. */
export function calculateSolarElevation(
  latitude: number,
  longitude: number,
  time: Date,
): number {
  const latRad = (latitude * Math.PI) / 180
  const dayOfYear = getDayOfYear(time)
  const decimalHours =
    time.getUTCHours() +
    time.getUTCMinutes() / 60 +
    time.getUTCSeconds() / 3600

  const solarDeclination =
    ((23.45 * Math.PI) / 180) *
    Math.sin(((2 * Math.PI) / 365) * (dayOfYear - 81))
  const hourAngle = (((decimalHours - 12) * 15 + longitude) * Math.PI) / 180

  const sinElevation =
    Math.sin(latRad) * Math.sin(solarDeclination) +
    Math.cos(latRad) * Math.cos(solarDeclination) * Math.cos(hourAngle)

  return (Math.asin(Math.max(-1, Math.min(1, sinElevation))) * 180) / Math.PI
}

export function calculateGlobalHorizontalIrradiance(
  directNormalIrradiance: number | null,
  diffuseRadiation: number | null,
  solarElevationDeg: number,
): number {
  if (solarElevationDeg <= 0) {
    return 0
  }

  const elevationRad = (solarElevationDeg * Math.PI) / 180
  const directHorizontal =
    (directNormalIrradiance ?? 0) * Math.sin(elevationRad)

  return Math.max(0, directHorizontal + (diffuseRadiation ?? 0))
}

export function calculateHourlyEnergyKwh(
  globalHorizontalIrradiance: number,
  systemSizeKw: number,
  performanceRatio = DEFAULT_PERFORMANCE_RATIO,
): number {
  if (globalHorizontalIrradiance <= 0 || systemSizeKw <= 0) {
    return 0
  }

  return (
    (globalHorizontalIrradiance / 1000) * systemSizeKw * performanceRatio
  )
}

function extractDate(time: string): string {
  return time.slice(0, 10)
}

function extractMonth(date: string): string {
  return date.slice(0, 7)
}

export function aggregateEnergyTotals(
  hourlyData: SolarHourlyDataPoint[],
): SolarEnergyTotals {
  const dailyMap = new Map<string, number>()
  const monthlyMap = new Map<string, number>()

  for (const point of hourlyData) {
    dailyMap.set(
      point.date,
      (dailyMap.get(point.date) ?? 0) + point.energyKwh,
    )

    const month = extractMonth(point.date)
    monthlyMap.set(
      month,
      (monthlyMap.get(month) ?? 0) + point.energyKwh,
    )
  }

  return {
    daily: [...dailyMap.entries()]
      .map(([date, kwh]) => ({ date, kwh }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    monthly: [...monthlyMap.entries()]
      .map(([month, kwh]) => ({ month, kwh }))
      .sort((a, b) => a.month.localeCompare(b.month)),
  }
}

export function processSolarForecast(
  response: OpenMeteoForecastResponse,
  latitude: number,
  longitude: number,
  systemSizeKw: number,
  performanceRatio = DEFAULT_PERFORMANCE_RATIO,
): {
  hourlyData: SolarHourlyDataPoint[]
  dailyTotal: SolarEnergyTotals
} {
  const { hourly } = response
  const hourlyData: SolarHourlyDataPoint[] = []

  for (let index = 0; index < hourly.time.length; index += 1) {
    const time = hourly.time[index]!
    const directNormalIrradiance = hourly.direct_normal_irradiance[index] ?? null
    const diffuseRadiation = hourly.diffuse_radiation[index] ?? null
    const solarElevation = calculateSolarElevation(
      latitude,
      longitude,
      new Date(time),
    )
    const globalHorizontalIrradiance = calculateGlobalHorizontalIrradiance(
      directNormalIrradiance,
      diffuseRadiation,
      solarElevation,
    )
    const energyKwh = calculateHourlyEnergyKwh(
      globalHorizontalIrradiance,
      systemSizeKw,
      performanceRatio,
    )

    hourlyData.push({
      time,
      date: extractDate(time),
      directNormalIrradiance,
      diffuseRadiation,
      globalHorizontalIrradiance,
      temperature: hourly.temperature_2m[index] ?? null,
      cloudCover: hourly.cloud_cover[index] ?? null,
      energyKwh,
    })
  }

  return {
    hourlyData,
    dailyTotal: aggregateEnergyTotals(hourlyData),
  }
}
