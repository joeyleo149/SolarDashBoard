import type { SolarEnergyTotals } from '../types/solar'

export default function SolarMetricsCard({
  totals,
  systemSizeKw,
}: {
  totals: SolarEnergyTotals
  systemSizeKw: number
}) {
  const today = totals.daily[0]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-medium text-slate-700">Estimated Yield</h3>
      <p className="mt-2 text-2xl font-semibold text-emerald-600">
        {today ? `${today.kwh.toFixed(2)} kWh` : '—'}
      </p>
      <p className="mt-1 text-sm text-slate-600">for {systemSizeKw} kW system</p>
      <div className="mt-3 text-sm text-slate-700">
        <div>Monthly samples: {totals.monthly.length}</div>
      </div>
    </div>
  )
}
