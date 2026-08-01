import { useEffect, useState } from 'react'
import { fetchHourlySolarRadiation } from '../services/openMeteoService.ts'
import type { UseSolarDataResult } from '../types/solar.ts'
import { processSolarForecast } from '../utils/solarCalculations.ts'

const EMPTY_TOTALS: UseSolarDataResult['dailyTotal'] = {
  daily: [],
  monthly: [],
}

function isValidCoordinate(value: number): boolean {
  return Number.isFinite(value)
}

function isValidSystemSize(systemSizeKw: number): boolean {
  return Number.isFinite(systemSizeKw) && systemSizeKw > 0
}

export function useSolarData(
  lat: number,
  lng: number,
  systemSizeKw: number,
): UseSolarDataResult {
  const [hourlyData, setHourlyData] = useState<UseSolarDataResult['hourlyData']>(
    [],
  )
  const [dailyTotal, setDailyTotal] =
    useState<UseSolarDataResult['dailyTotal']>(EMPTY_TOTALS)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!isValidCoordinate(lat) || !isValidCoordinate(lng)) {
      setHourlyData([])
      setDailyTotal(EMPTY_TOTALS)
      setError(new Error('Invalid latitude or longitude'))
      setIsLoading(false)
      return
    }

    if (!isValidSystemSize(systemSizeKw)) {
      setHourlyData([])
      setDailyTotal(EMPTY_TOTALS)
      setError(new Error('System size must be a positive number'))
      setIsLoading(false)
      return
    }

    let cancelled = false

    async function loadSolarData() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetchHourlySolarRadiation({
          latitude: lat,
          longitude: lng,
          timezone: 'auto',
        })

        if (cancelled) {
          return
        }

        const processed = processSolarForecast(
          response,
          lat,
          lng,
          systemSizeKw,
        )

        setHourlyData(processed.hourlyData)
        setDailyTotal(processed.dailyTotal)
      } catch (err) {
        if (cancelled) {
          return
        }

        setHourlyData([])
        setDailyTotal(EMPTY_TOTALS)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadSolarData()

    return () => {
      cancelled = true
    }
  }, [lat, lng, systemSizeKw])

  return { hourlyData, dailyTotal, isLoading, error }
}
