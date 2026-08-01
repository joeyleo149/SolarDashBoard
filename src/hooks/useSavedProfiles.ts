import { useCallback, useEffect, useState } from 'react'
import type { SolarProfile } from '../services/firestoreService'
import { saveSolarProfile, fetchUserProfiles, deleteSolarProfile } from '../services/firestoreService'

type UseSavedProfilesResult = {
  profiles: SolarProfile[]
  loadingProfiles: boolean
  addProfile: (title: string, lat: number, lng: number, systemSizeKw: number) => Promise<void>
  removeProfile: (profileId: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useSavedProfiles(userId?: string): UseSavedProfilesResult {
  const [profiles, setProfiles] = useState<SolarProfile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState<boolean>(false)

  const load = useCallback(async () => {
    if (!userId) {
      setProfiles([])
      return
    }

    setLoadingProfiles(true)
    try {
      const list = await fetchUserProfiles(userId)
      setProfiles(list)
    } catch (err) {
      setProfiles([])
      // swallow or rethrow depending on app needs; keep simple here
      console.error('Failed to load profiles', err)
    } finally {
      setLoadingProfiles(false)
    }
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  const addProfile = useCallback(
    async (title: string, lat: number, lng: number, systemSizeKw: number) => {
      if (!userId) throw new Error('userId is required to add a profile')
      await saveSolarProfile({ userId, title, lat, lng, systemSizeKw })
      await load()
    },
    [userId, load],
  )

  const removeProfile = useCallback(
    async (profileId: string) => {
      await deleteSolarProfile(profileId)
      await load()
    },
    [load],
  )

  return { profiles, loadingProfiles, addProfile, removeProfile, refresh: load }
}

export default useSavedProfiles
