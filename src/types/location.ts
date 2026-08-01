/** A user-pinned location with an associated PV system capacity. */
export interface SavedLocation {
  id: string
  name: string
  latitude: number
  longitude: number
  systemSizeKw: number
  pinned: boolean
  createdAt: string
  updatedAt: string
}

/** Fields required when creating a new saved location. */
export interface NewSavedLocation {
  name: string
  latitude: number
  longitude: number
  systemSizeKw: number
  pinned?: boolean
}

/** Partial updates allowed on an existing saved location. */
export interface SavedLocationUpdate {
  name?: string
  latitude?: number
  longitude?: number
  systemSizeKw?: number
  pinned?: boolean
}

export interface UseSavedLocationsResult {
  locations: SavedLocation[]
  isLoading: boolean
  error: Error | null
  isAuthenticated: boolean
  addLocation: (location: NewSavedLocation) => Promise<void>
  updateLocation: (id: string, updates: SavedLocationUpdate) => Promise<void>
  removeLocation: (id: string) => Promise<void>
  setPinned: (id: string, pinned: boolean) => Promise<void>
}

/** Simple key/value mapping for named system capacities (kW values etc.). */
export interface SystemCapacities {
  [key: string]: number
}

export interface UseSavedLocationsResultWithCapacities extends UseSavedLocationsResult {
  systemCapacities: SystemCapacities
  setSystemCapacities: (capacities: SystemCapacities) => Promise<void>
}
