/** Processed hourly solar data point with estimated energy yield. */
export interface SolarHourlyDataPoint {
  time: string
  date: string
  directNormalIrradiance: number | null
  diffuseRadiation: number | null
  globalHorizontalIrradiance: number
  temperature: number | null
  cloudCover: number | null
  energyKwh: number
}

/** Aggregated energy yield for a single calendar day. */
export interface SolarDailyTotal {
  date: string
  kwh: number
}

/** Aggregated energy yield for a calendar month. */
export interface SolarMonthlyTotal {
  month: string
  kwh: number
}

/** Daily and monthly energy yield aggregates. */
export interface SolarEnergyTotals {
  daily: SolarDailyTotal[]
  monthly: SolarMonthlyTotal[]
}

export interface UseSolarDataResult {
  hourlyData: SolarHourlyDataPoint[]
  dailyTotal: SolarEnergyTotals
  isLoading: boolean
  error: Error | null
}
