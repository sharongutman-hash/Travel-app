import { useState, useEffect } from 'react'

// In-memory cache so we never re-fetch the same leg
const cache = {}

// OSRM public demo server — free, no API key, real road routing
const OSRM = 'https://router.project-osrm.org/route/v1/driving'

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
