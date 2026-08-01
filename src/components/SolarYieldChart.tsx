import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SolarHourlyDataPoint } from '../types/solar.ts'

export interface SolarYieldChartProps {
  hourlyData: SolarHourlyDataPoint[]
}

interface ChartDataPoint {
  timeLabel: string
  globalHorizontal: number
  directNormal: number
  diffuse: number
  temperature: number | null
  cloudCover: number | null
  energyKwh: number
}

interface SolarRadiationTooltipProps {
  active?: boolean
  label?: string | number
  payload?: ReadonlyArray<{ payload?: ChartDataPoint }>
}

function formatHourLabel(time: string): string {
  const date = new Date(time)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function buildChartData(hourlyData: SolarHourlyDataPoint[]): ChartDataPoint[] {
  if (hourlyData.length === 0) {
    return []
  }

  const firstDate = hourlyData[0]!.date

  return hourlyData
    .filter((point) => point.date === firstDate)
    .map((point) => ({
      timeLabel: formatHourLabel(point.time),
      globalHorizontal: point.globalHorizontalIrradiance,
      directNormal: point.directNormalIrradiance ?? 0,
      diffuse: point.diffuseRadiation ?? 0,
      temperature: point.temperature,
      cloudCover: point.cloudCover,
      energyKwh: point.energyKwh,
    }))
}

function formatRadiation(value: number): string {
  return `${value.toFixed(1)} W/m²`
}

function SolarRadiationTooltip({
  active,
  payload,
  label,
}: SolarRadiationTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  const data = payload[0]?.payload

  if (!data) {
    return null
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="mb-2 text-sm font-semibold text-amber-600">{label}</p>
      <dl className="space-y-1 text-xs">
        <div className="flex justify-between gap-6">
          <dt className="text-slate-600">Global horizontal</dt>
          <dd className="font-medium text-amber-600">
            {formatRadiation(data.globalHorizontal)}
          </dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-slate-600">Direct normal</dt>
          <dd className="font-medium text-orange-600">
            {formatRadiation(data.directNormal)}
          </dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt className="text-slate-600">Diffuse</dt>
          <dd className="font-medium text-sky-600">
            {formatRadiation(data.diffuse)}
          </dd>
        </div>
        <div className="my-2 border-t border-slate-200" />
        <div className="flex justify-between gap-6">
          <dt className="text-slate-600">Est. yield</dt>
          <dd className="font-medium text-emerald-600">
            {data.energyKwh.toFixed(3)} kWh
          </dd>
        </div>
        {data.temperature !== null && (
          <div className="flex justify-between gap-6">
            <dt className="text-slate-600">Temperature</dt>
            <dd className="font-medium text-slate-700">
              {data.temperature.toFixed(1)} °C
            </dd>
          </div>
        )}
        {data.cloudCover !== null && (
          <div className="flex justify-between gap-6">
            <dt className="text-slate-600">Cloud cover</dt>
            <dd className="font-medium text-slate-700">
              {data.cloudCover.toFixed(0)}%
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}

export function SolarYieldChart({ hourlyData }: SolarYieldChartProps) {
  const chartData = useMemo(() => buildChartData(hourlyData), [hourlyData])
  const chartDate = hourlyData[0]?.date

  if (chartData.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl border border-slate-200 bg-white">
        <p className="text-sm text-slate-600">No solar radiation data available</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Solar Radiation</h2>
        {chartDate && (
          <p className="text-sm text-slate-600">{chartDate}</p>
        )}
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="ghiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="dniGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="diffuseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#e6eef6" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timeLabel"
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            unit=" W/m²"
            width={72}
          />
          <Tooltip
            content={(props) => (
              <SolarRadiationTooltip
                active={props.active}
                label={props.label}
                payload={props.payload as SolarRadiationTooltipProps['payload']}
              />
            )}
          />
          <Legend
            wrapperStyle={{ paddingTop: 16, fontSize: 12, color: '#475569' }}
          />
          <Area
            type="monotone"
            dataKey="globalHorizontal"
            name="Global horizontal"
            stroke="#fbbf24"
            strokeWidth={2}
            fill="url(#ghiGradient)"
            activeDot={{ r: 5, stroke: '#fef3c7', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="directNormal"
            name="Direct normal"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#dniGradient)"
            activeDot={{ r: 4, stroke: '#ffedd5', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="diffuse"
            name="Diffuse"
            stroke="#38bdf8"
            strokeWidth={2}
            fill="url(#diffuseGradient)"
            activeDot={{ r: 4, stroke: '#e0f2fe', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
