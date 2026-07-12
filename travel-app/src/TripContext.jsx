import { createContext, useContext } from 'react'
import { useParams, Navigate, Outlet } from 'react-router-dom'
import { getTripBundle } from './trips'

const TripContext = createContext(null)

// Layout route for /trip/:tripId — resolves the slug to its data bundle and
// provides it to every nested page/component. Unknown slugs bounce to the hub.
export function TripLayout() {
  const { tripId } = useParams()
  const tripBundle = getTripBundle(tripId)
  if (!tripBundle) return <Navigate to="/" replace />
  return (
    <TripContext.Provider value={tripBundle}>
      <Outlet />
    </TripContext.Provider>
  )
}

// { CATEGORIES, CATEGORY_IMAGES, STOPS, SPOTS, HOTELS, trip, getDayRangeByStop }
// for the trip named in the current route.
export function useTrip() {
  return useContext(TripContext)
}
