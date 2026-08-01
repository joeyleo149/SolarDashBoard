import { useState } from 'react'
import LocationSearch from './components/LocationSearch'
import SolarMetricsCard from './components/SolarMetricsCard'
import { SolarYieldChart } from './components/SolarYieldChart'
import { useSolarData } from './hooks/useSolarData'
import Navbar from './components/Navbar'
import useAuth from './hooks/useAuth'
import useSavedProfiles from './hooks/useSavedProfiles'

function App() {
  // Defaults to Cairo
  const [lat, setLat] = useState<number>(30.0444)
  const [lng, setLng] = useState<number>(31.2357)
  const [systemSizeKw, setSystemSizeKw] = useState<number>(4)
  const [profileTitle, setProfileTitle] = useState<string>('Home')

  const { hourlyData, dailyTotal, isLoading } = useSolarData(
    lat,
    lng,
    systemSizeKw,
  )

  const { user } = useAuth()
  const { profiles, loadingProfiles, addProfile, removeProfile, refresh } = useSavedProfiles(user?.uid)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <header className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Solar Dashboard</h1>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <LocationSearch
              onSelect={(nlat, nlng) => {
                setLat(nlat)
                setLng(nlng)
              }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              System size (kW)
            </label>
            <input
              type="number"
              value={systemSizeKw}
              min={0.1}
              step={0.1}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400"
              onChange={(e) => setSystemSizeKw(Number(e.target.value))}
            />
          </div>
        </section>

        {user && (
          <section className="mb-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <input
                value={profileTitle}
                onChange={(e) => setProfileTitle(e.target.value)}
                placeholder="Profile title (e.g. Home Roof)"
                className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              />
              <button
                className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
                onClick={async () => {
                  try {
                    await addProfile(profileTitle || 'Untitled', lat, lng, systemSizeKw)
                    setProfileTitle('')
                  } catch (err) {
                    console.error('Failed to save profile', err)
                  }
                }}
              >
                Save Current Location
              </button>
              <button
                className="ml-2 rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700"
                onClick={() => void refresh()}
              >
                Refresh
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Saved Profiles</label>
              {loadingProfiles ? (
                <div className="text-sm text-slate-600">Loading profiles...</div>
              ) : profiles.length === 0 ? (
                <div className="text-sm text-slate-600">No saved profiles</div>
              ) : (
                <ul className="space-y-2">
                  {profiles.map((p) => (
                    <li key={p.id} className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-2">
                      <button
                        className="text-sm text-slate-800 text-left"
                        onClick={() => {
                          setLat(p.lat)
                          setLng(p.lng)
                          setSystemSizeKw(p.systemSizeKw)
                        }}
                      >
                        {p.title}
                      </button>
                      <div className="flex items-center gap-2">
                        <button className="text-sm text-rose-600" onClick={async () => { await removeProfile(p.id!) }}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          <div className="lg:col-span-1">
            {isLoading ? (
              <div className="h-28 animate-pulse rounded-xl bg-slate-200" />
            ) : (
              <SolarMetricsCard totals={dailyTotal} systemSizeKw={systemSizeKw} />
            )}
          </div>

          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="h-80 animate-pulse rounded-xl bg-slate-200" />
            ) : (
              <SolarYieldChart hourlyData={hourlyData} />
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
