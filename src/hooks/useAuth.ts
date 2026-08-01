import { useEffect, useState, useCallback } from 'react'
import { auth, googleProvider } from '../config/firebase'
import type { User } from 'firebase/auth'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'

type UseAuthResult = {
  user: User | null
  loading: boolean
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })

    return () => unsub()
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await signOut(auth)
    } finally {
      setLoading(false)
    }
  }, [])

  return { user, loading, loginWithGoogle, logout }
}

export default useAuth
