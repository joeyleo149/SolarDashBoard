import { useEffect, useState, useRef, useCallback } from 'react'
import { auth, db } from '../config/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc
} from 'firebase/firestore'
import type {
  SavedLocation,
  NewSavedLocation,
  SavedLocationUpdate,
  UseSavedLocationsResultWithCapacities,
  SystemCapacities
} from '../types/location'

export function useSavedLocations(): UseSavedLocationsResultWithCapacities {
  const [locations, setLocations] = useState<SavedLocation[]>([])
  const [systemCapacities, setSystemCapacities] = useState<SystemCapacities>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    setIsLoading(true)
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true)
        // if we already have listeners from a previous session, clear them first
        if (unsubRef.current) {
          try {
            unsubRef.current()
          } catch (e) {
            // ignore
          }
          unsubRef.current = null
        }
        // subscribe to user's locations collection
        const locationsCol = collection(db, 'users', user.uid, 'locations')
        const unsubLocations = onSnapshot(
          locationsCol,
          (snap) => {
            const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as SavedLocation))
            setLocations(docs)
            setIsLoading(false)
          },
          (err) => {
            setError(err instanceof Error ? err : new Error(String(err)))
            setIsLoading(false)
          }
        )

        // subscribe to a user doc for systemCapacities
        const userDoc = doc(db, 'users', user.uid)
        const unsubUserDoc = onSnapshot(
          userDoc,
          (snap) => {
            if (snap.exists()) {
              const data = snap.data() as any
              setSystemCapacities(data.systemCapacities || {})
            } else {
              setSystemCapacities({})
            }
          },
          (err) => setError(err instanceof Error ? err : new Error(String(err)))
        )

        unsubRef.current = () => {
          try {
            unsubLocations()
          } catch (e) {
            // ignore
          }
          try {
            unsubUserDoc()
          } catch (e) {
            // ignore
          }
        }
      } else {
        setIsAuthenticated(false)
        setLocations([])
        setSystemCapacities({})
        setIsLoading(false)
        if (unsubRef.current) {
          unsubRef.current()
          unsubRef.current = null
        }
      }
    })

    return () => {
      unsubscribeAuth()
      if (unsubRef.current) unsubRef.current()
    }
  }, [])

  const ensureAuth = useCallback(() => {
    const user = auth.currentUser
    if (!user) throw new Error('Not authenticated')
    return user
  }, [])

  const addLocation = useCallback(async (location: NewSavedLocation) => {
    try {
      const user = ensureAuth()
      await addDoc(collection(db, 'users', user.uid, 'locations'), {
        ...location,
        pinned: location.pinned ?? false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)))
      throw err
    }
  }, [ensureAuth])

  const updateLocation = useCallback(async (id: string, updates: SavedLocationUpdate) => {
    try {
      const user = ensureAuth()
      const ref = doc(db, 'users', user.uid, 'locations', id)
      await updateDoc(ref, { ...updates, updatedAt: new Date().toISOString() } as any)
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)))
      throw err
    }
  }, [ensureAuth])

  const removeLocation = useCallback(async (id: string) => {
    try {
      const user = ensureAuth()
      const ref = doc(db, 'users', user.uid, 'locations', id)
      await deleteDoc(ref)
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)))
      throw err
    }
  }, [ensureAuth])

  const setPinned = useCallback(async (id: string, pinned: boolean) => {
    return updateLocation(id, { pinned })
  }, [updateLocation])

  const saveSystemCapacities = useCallback(async (capacities: SystemCapacities) => {
    try {
      const user = ensureAuth()
      const ref = doc(db, 'users', user.uid)
      await setDoc(ref, { systemCapacities: capacities }, { merge: true })
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)))
      throw err
    }
  }, [ensureAuth])

  return {
    locations,
    isLoading,
    error,
    isAuthenticated,
    addLocation,
    updateLocation,
    removeLocation,
    setPinned,
    systemCapacities,
    setSystemCapacities: saveSystemCapacities
  }
}

export default useSavedLocations
