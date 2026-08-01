import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCnXx-ttrGKQhb-GxWp43orIFV2mLhvvXE",
  authDomain: "solar-dashboard-71401.firebaseapp.com",
  projectId: "solar-dashboard-71401",
  storageBucket: "solar-dashboard-71401.firebasestorage.app",
  messagingSenderId: "146371765488",
  appId: "1:146371765488:web:463dcab668ae65f6090e35",
  measurementId: "G-19PGEX44DY"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)

export default app