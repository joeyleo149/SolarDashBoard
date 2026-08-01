import { useState } from 'react'

export interface LocationOption {
  id: string
  name: string
  latitude: number
  longitude: number
}

const BUILT_IN: LocationOption[] = [
  { id: 'cairo', name: 'Cairo, Egypt', latitude: 30.0444, longitude: 31.2357 },
  { id: 'london', name: 'London, UK', latitude: 51.5074, longitude: -0.1278 },
  { id: 'nyc', name: 'New York, USA', latitude: 40.7128, longitude: -74.006 },
  { id: 'sydney', name: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093 },
]

export default function LocationSearch({
  onSelect,
}: {
  onSelect: (lat: number, lng: number, name?: string) => void
}) {
  const [query, setQuery] = useState('')

  const matches = BUILT_IN.filter((opt) =>
    opt.name.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400"
          placeholder="Search city (try Cairo)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900"
          onClick={() => {
            const first = matches[0] || BUILT_IN[0]
            onSelect(first.latitude, first.longitude, first.name)
          }}
        >
          Go
        </button>
      </div>

      {query && (
        <ul className="mt-2 max-h-40 overflow-auto rounded-md border border-slate-200 bg-white">
          {matches.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-600">No matches</li>
          )}
          {matches.map((m) => (
            <li
              key={m.id}
              className="cursor-pointer px-3 py-2 text-sm text-slate-900 hover:bg-slate-100"
              onClick={() => onSelect(m.latitude, m.longitude, m.name)}
            >
              {m.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
