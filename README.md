# Development Overview & Prompts

## 🤖 Prompts Used

### 1. Project Architecture & Setup

* Create a new Vite React TypeScript project structure. Setup Tailwind CSS. Create an `src` directory with folders: `/services`, `/hooks`, `/components`, `/types`, `/utils`, and `/config`.
* Create a service `openMeteoService.ts` that fetches hourly direct solar radiation (`direct_normal_irradiance`), diffuse radiation, temperature, and cloud cover for a given latitude and longitude. Define explicit TypeScript interfaces for all request parameters and API response payloads.
* Build a custom React hook `useSolarData(lat, lng, systemSizeKw)`. It should use `openMeteoService` to fetch solar radiation data, calculate daily/monthly energy yields, and return `{ hourlyData, dailyTotal, isLoading, error }`.
* Create a `SolarYieldChart.tsx` component using Recharts. It receives `hourlyData` as a prop and renders a responsive `AreaChart` showing solar radiation throughout the day with customized tooltips.
* Set up `firebase.ts` config. Create a custom hook `useSavedLocations.ts` that syncs a logged-in user's pinned locations and system capacities to Firestore in real-time.
* Connect our MVVM pipeline in `App.tsx`:
1. Set default coordinates (e.g., Cairo: `lat 30.0444`, `lng 31.2357`).
2. Render `<LocationSearch/>` at the top to let users pick new cities.
3. Pass the selected coordinates into the `useSolarData` hook.
4. Display loading skeletons while fetching data.
5. Render `<SolarMetricsCard/>` and `<SolarYieldChart/>` with the returned solar radiation data.


* Add a `SolarSystemConfig` component with sliders for System Capacity (kW) and Panel Efficiency (%). Pass these values into `useSolarCalculator` to re-compute estimated daily kWh output dynamically.

---

### 2. Authentication Setup

Create a custom React hook at `src/hooks/useAuth.ts` to manage Firebase Authentication.

**Requirements:**

1. Import `auth` and `googleProvider` from `../firebase` (or `../config/firebase` depending on where the file is located).
2. Use `onAuthStateChanged` from `firebase/auth` inside a `useEffect` to listen to real-time login/logout state changes.
3. Store the current user in state (`user: User | null`) and a loading state (`loading: boolean`).
4. Create a `loginWithGoogle` function using `signInWithPopup(auth, googleProvider)`.
5. Create a `logout` function using `signOut(auth)`.
6. Return `{ user, loading, loginWithGoogle, logout }` with strict TypeScript typing.

---

### 3. Firestore Data Model & Custom Hooks

Build the Model and ViewModel layer for saving user solar profiles using Cloud Firestore in two separate files:

#### **File 1: `src/services/firestoreService.ts**`

1. Define a TypeScript interface `SolarProfile`:
* `id?: string`
* `userId: string`
* `title: string`
* `lat: number`
* `lng: number`
* `systemSizeKw: number`


2. Implement async functions using Firestore (`src/firebase.ts`):
* `saveSolarProfile(profile: Omit<SolarProfile, 'id'>)`: Adds a document to the `'solarProfiles'` collection.
* `fetchUserProfiles(userId: string)`: Queries `'solarProfiles'` where `'userId'` matches the current user.
* `deleteSolarProfile(profileId: string)`: Deletes a document by ID.



#### **File 2: `src/hooks/useSavedProfiles.ts**`

1. Create a custom hook `useSavedProfiles(userId: string | undefined)`.
2. Maintain `profiles` array state and `loadingProfiles` boolean state.
3. Fetch profiles when `userId` is available.
4. Expose `addProfile(title, lat, lng, systemSizeKw)` and `removeProfile(profileId)` functions that automatically refresh the profiles list after mutation.

---

### 4. UI Layer Integration

Update our UI layer to support Firebase Authentication and Saved Solar Profiles:

1. **Create a `src/components/Navbar.tsx` component:**
* Use `useAuth()` to get `user`, `loginWithGoogle`, and `logout`.
* If logged out, display a "Sign In with Google" button.
* If logged in, display the user's name/avatar and a "Sign Out" button.


2. **Update `src/App.tsx`:**
* Render `<Navbar/>` at the top of the app.
* Integrate `useSavedProfiles(user?.uid)`.
* If logged in, render a "Save Current Location" form/button that takes a custom title (e.g., "Home Roof", "Beach House") and saves the active `lat`, `lng`, and `systemSizeKw` to Firestore.
* Display a list or dropdown of saved profiles. Clicking a saved profile updates the active `lat`, `lng`, and `systemSizeKw` state in `App.tsx` to immediately refresh the dashboard metrics and charts.



---

## 💡 AI Assistance Summary

AI made use of the MVVM architecture with Open-Meteo API integrations and Firebase Auth/Firestore data layers. It assisted by fixing component import mismatches, then improved code quality through native form semantics, input guards, and active UI highlights.

---

## 🛠️ Manual Improvements & Bug Fixes

In `useSavedLocations.ts`, Line 155 changed from this:

```typescript
await setDoc(ref, { systemCapacities: setSystemCapacities }, { merge: true })

```

to this:

```typescript
await setDoc(ref, { systemCapacities: capacities }, { merge: true })

```

> **Reason:** This is because if that line instead used the wrong variable (for example a state setter or stale value), Firestore would get incorrect data. Using the actual `capacities` argument ensures the saved profile reflects the current system capacity values.
