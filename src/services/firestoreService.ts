import { db } from '../config/firebase'
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore'

/** Solar profile stored in Firestore */
export interface SolarProfile {
  id?: string
  userId: string
  title: string
  lat: number
  lng: number
  systemSizeKw: number
}

/** Adds a solar profile document to the `solarProfiles` collection and returns the new document id. */
export async function saveSolarProfile(profile: Omit<SolarProfile, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'solarProfiles'), profile)
  return ref.id
}

/** Fetches all solar profiles belonging to the given userId. */
export async function fetchUserProfiles(userId: string): Promise<SolarProfile[]> {
  const q = query(collection(db, 'solarProfiles'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as SolarProfile))
}

/** Deletes a solar profile document by its id. */
export async function deleteSolarProfile(profileId: string): Promise<void> {
  await deleteDoc(doc(db, 'solarProfiles', profileId))
}

export default {
  saveSolarProfile,
  fetchUserProfiles,
  deleteSolarProfile,
}
