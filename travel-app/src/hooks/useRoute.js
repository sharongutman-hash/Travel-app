import { useState, useEffect } from 'react'

// In-memory cache so we never re-fetch the same leg
const cache = {}

// OSRM public demo server — free, no API key, real road routing
const OSRM = 'https://router.project-osrm.org/route/v1/driving'

// Great-circle (straight-line) distance in km — instant, used as an estimate
// until the real driving distance comes back from OSRM.
export function haversineKm(a, b) {
  const R = 6371
  const toRad = d => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLon = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(h)))
}

async function fetchRoute(from, to) {
  // OSRM expects lon,lat order
  const url = `${OSRM}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
  const res = await fetch(url)
  const data = await res.json()
  if (!data.routes?.length) throw new Error('no route')
  const route = data.routes[0]
  // Convert GeoJSON [lon,lat] → Leaflet [lat,lon]
  const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon])
  const distanceKm = Math.round(route.distance / 1000)
  const durationMin = Math.round(route.duration / 60)
  return { coords, distanceKm, durationMin }
}

// Single leg hook
export function useRoute(from, to) {
  const [state, setState] = useState({ coords: null, distanceKm: null, durationMin: null, loading: true })

  useEffect(() => {
    if (!from || !to) return
    const key = `${from[0]},${from[1]}|${to[0]},${to[1]}`
    if (cache[key]) { setState({ ...cache[key], loading: false }); return }

    setState(s => ({ ...s, loading: true }))
    fetchRoute(from, to)
      .then(result => {
        cache[key] = result
        setState({ ...result, loading: false })
      })
      .catch(() => {
        // Fallback: straight line
        setState({ coords: [from, to], distanceKm: null, durationMin: null, loading: false })
      })
  }, [from?.[0], from?.[1], to?.[0], to?.[1]])

  return state
}

// Multi-leg hook: fetches an array of [from, to] pairs and returns all route coords
export function useMultiRoute(legs) {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  const key = legs.map(([f, t]) => `${f[0]},${f[1]}|${t[0]},${t[1]}`).join(';')

  useEffect(() => {
    if (!legs.length) return
    setLoading(true)
    Promise.all(
      legs.map(([from, to]) => {
        const k = `${from[0]},${from[1]}|${to[0]},${to[1]}`
        if (cache[k]) return Promise.resolve(cache[k])
        return fetchRoute(from, to).then(r => { cache[k] = r; return r }).catch(() => ({ coords: [from, to] }))
      })
    ).then(results => {
      setRoutes(results.map(r => r.coords))
      setLoading(false)
    })
  }, [key])

  return { routes, loading }
}


// Driving distance/time from a single origin (e.g. the hotel) to many targets.
// targets: [{ id, coords }]. Returns a map id -> { distanceKm, durationMin, straight }.
// Shows an instant straight-line estimate first, then upgrades to real road
// distances as OSRM responds. Only the current day's spots are ever requested.
export function useHotelDistances(origin, targets) {
  const [dist, setDist] = useState({})

  const key = origin
    ? `${origin[0]},${origin[1]}|` + targets.map(t => `${t.id}:${t.coords[0]},${t.coords[1]}`).join(';')
    : ''

  useEffect(() => {
    if (!origin || !targets.length) { setDist({}); return }

    // 1) Instant straight-line estimate so the UI never waits
    const initial = {}
    targets.forEach(t => {
      initial[t.id] = { distanceKm: haversineKm(origin, t.coords), durationMin: null, straight: true }
    })
    setDist(initial)

    // 2) Upgrade to real driving distances
    let cancelled = false
    Promise.all(
      targets.map(t => {
        const k = `${origin[0]},${origin[1]}|${t.coords[0]},${t.coords[1]}`
        const p = cache[k]
          ? Promise.resolve(cache[k])
          : fetchRoute(origin, t.coords).then(r => { cache[k] = r; return r }).catch(() => null)
        return p.then(r => [t.id, r])
      })
    ).then(results => {
      if (cancelled) return
      setDist(prev => {
        const next = { ...prev }
        results.forEach(([id, r]) => {
          if (r && r.distanceKm != null) {
            next[id] = { distanceKm: r.distanceKm, durationMin: r.durationMin, straight: false }
          }
        })
        return next
      })
    })

    return () => { cancelled = true }
  }, [key])

  return dist
}
