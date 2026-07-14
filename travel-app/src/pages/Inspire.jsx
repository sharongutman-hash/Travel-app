import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTrip } from '../TripContext'
import { useLang } from '../LangContext'
import './Inspire.css'

const strings = {
  en: {
    title: '✨ Inspire me',
    sub: 'Attractions & food near you, right now',
    locating: 'Finding your location…',
    searching: 'Searching for nearby gems…',
    nearYou: '📍 Near your current location',
    nearFallback: 'Location unavailable — showing places near',
    geoUnsupported: 'No location support — showing places near',
    all: 'All',
    attractions: '🎡 Attractions',
    food: '🍽️ Food & drink',
    surprise: '🎲 Surprise me',
    refresh: '📍 Refresh',
    directions: '🧭 Directions',
    retry: 'Try again',
    error: 'Couldn’t load nearby places. Check your connection and try again.',
    empty: 'Nothing found within {r} km of here.',
    within: 'within {r} km',
    back: '‹ Back',
  },
  he: {
    title: '✨ תן השראה',
    sub: 'אטרקציות ואוכל קרוב אליך, עכשיו',
    locating: 'מאתר את המיקום שלך…',
    searching: 'מחפש פנינים בסביבה…',
    nearYou: '📍 ליד המיקום הנוכחי שלך',
    nearFallback: 'המיקום לא זמין — מציג מקומות ליד',
    geoUnsupported: 'אין תמיכה באיתור מיקום — מציג מקומות ליד',
    all: 'הכל',
    attractions: '🎡 אטרקציות',
    food: '🍽️ אוכל ושתייה',
    surprise: '🎲 הפתע אותי',
    refresh: '📍 רענן',
    directions: '🧭 ניווט',
    retry: 'נסה שוב',
    error: 'לא הצלחנו לטעון מקומות בסביבה. בדקו את החיבור ונסו שוב.',
    empty: 'לא נמצא כלום ברדיוס {r} ק"מ.',
    within: 'ברדיוס {r} ק"מ',
    back: 'חזרה ›',
  },
}

const RADIUS_M = 3000

// OSM tag → { kind, emoji }. `kind` drives the filter chips.
const TAG_META = {
  restaurant: { kind: 'food', emoji: '🍽️' },
  cafe: { kind: 'food', emoji: '☕' },
  fast_food: { kind: 'food', emoji: '🍔' },
  ice_cream: { kind: 'food', emoji: '🍦' },
  bar: { kind: 'food', emoji: '🍸' },
  pub: { kind: 'food', emoji: '🍺' },
  attraction: { kind: 'sight', emoji: '🎡' },
  museum: { kind: 'sight', emoji: '🏛️' },
  gallery: { kind: 'sight', emoji: '🖼️' },
  viewpoint: { kind: 'sight', emoji: '🌄' },
  zoo: { kind: 'sight', emoji: '🦁' },
  theme_park: { kind: 'sight', emoji: '🎢' },
  aquarium: { kind: 'sight', emoji: '🐠' },
  artwork: { kind: 'sight', emoji: '🎨' },
  castle: { kind: 'sight', emoji: '🏰' },
  fort: { kind: 'sight', emoji: '🏰' },
  ruins: { kind: 'sight', emoji: '🏛️' },
  monument: { kind: 'sight', emoji: '🗿' },
  memorial: { kind: 'sight', emoji: '🗿' },
  archaeological_site: { kind: 'sight', emoji: '🗿' },
}

const HISTORIC_TAGS = ['castle', 'fort', 'ruins', 'monument', 'memorial', 'archaeological_site']
const TOURISM_TAGS = Object.keys(TAG_META).filter(k => TAG_META[k].kind === 'sight' && !HISTORIC_TAGS.includes(k))
const FOOD_TAGS = Object.keys(TAG_META).filter(k => TAG_META[k].kind === 'food')

// Public Overpass mirrors, tried in order — free OpenStreetMap POI queries, no API key.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

// The public servers rate-limit by IP, so cache results per ~100 m grid cell
// for a while — reopening the page at the same spot shouldn't re-query.
const CACHE_TTL_MS = 10 * 60 * 1000

function cacheKey(origin) {
  return `inspire:${origin.lat.toFixed(3)},${origin.lon.toFixed(3)}`
}

function readCache(origin) {
  try {
    const raw = sessionStorage.getItem(cacheKey(origin))
    if (!raw) return null
    const { at, places } = JSON.parse(raw)
    return Date.now() - at < CACHE_TTL_MS ? places : null
  } catch { return null }
}

function writeCache(origin, places) {
  try {
    sessionStorage.setItem(cacheKey(origin), JSON.stringify({ at: Date.now(), places }))
  } catch { /* storage full or unavailable — caching is best-effort */ }
}

function overpassQuery(lat, lon) {
  const around = `around:${RADIUS_M},${lat},${lon}`
  return `[out:json][timeout:25];
(
  nwr(${around})[name][tourism~"^(${TOURISM_TAGS.join('|')})$"];
  nwr(${around})[name][historic~"^(${HISTORIC_TAGS.join('|')})$"];
  nwr(${around})[name][amenity~"^(${FOOD_TAGS.join('|')})$"];
);
out center 120;`
}

function haversineM(aLat, aLon, bLat, bLon) {
  const R = 6371000
  const dLat = (bLat - aLat) * Math.PI / 180
  const dLon = (bLon - aLon) * Math.PI / 180
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

function fmtDist(m, lang) {
  if (m < 1000) return `${Math.round(m / 10) * 10} ${lang === 'he' ? 'מ׳' : 'm'}`
  return `${(m / 1000).toFixed(1)} ${lang === 'he' ? 'ק"מ' : 'km'}`
}

function parsePlaces(elements, origin) {
  const seen = new Map()
  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat
    const lon = el.lon ?? el.center?.lon
    const name = el.tags?.name
    if (lat == null || lon == null || !name) continue
    const tag = el.tags.tourism || el.tags.historic || el.tags.amenity
    const meta = TAG_META[tag]
    if (!meta) continue
    const place = {
      id: `${el.type}/${el.id}`,
      name,
      kind: meta.kind,
      emoji: meta.emoji,
      cuisine: el.tags.cuisine?.split(';')[0]?.replace(/_/g, ' '),
      lat, lon,
      dist: haversineM(origin.lat, origin.lon, lat, lon),
    }
    // The same place often appears as both a node and a building outline — keep the nearest.
    const key = name.toLowerCase()
    const prev = seen.get(key)
    if (!prev || place.dist < prev.dist) seen.set(key, place)
  }
  return [...seen.values()].sort((a, b) => a.dist - b.dist)
}

async function fetchNearby(origin) {
  const cached = readCache(origin)
  if (cached) return cached
  const query = overpassQuery(origin.lat, origin.lon)
  let lastErr
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(30000),
      })
      if (!res.ok) throw new Error(`Overpass ${res.status}`)
      const json = await res.json()
      const places = parsePlaces(json.elements || [], origin)
      writeCache(origin, places)
      return places
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}

// Where "today" is on the itinerary — the hotel (or stop) coordinates used as
// the origin when the browser can't provide a GPS fix.
function itineraryFallback(trip, STOPS, HOTELS) {
  let day = null
  if (trip.startDate) {
    const [y, m, d] = trip.startDate.split('-').map(Number)
    const now = new Date()
    const todayKey = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    day = trip.days.find(dd => new Date(y, m - 1, d + (dd.id - 1)).getTime() === todayKey)
  }
  day = day || trip.days[0]
  const hotel = day.hotelId ? HOTELS[day.hotelId] : null
  const stop = STOPS.find(s => s.id === day.stopId)
  const coords = hotel?.coords || stop?.coords || STOPS[0]?.coords
  const label = hotel?.name || stop?.shortName || ''
  return coords ? { lat: coords[0], lon: coords[1], label } : null
}

function PlaceCard({ place, lang, t, highlighted, cardRef }) {
  return (
    <div ref={cardRef} className={`inspire-card${highlighted ? ' inspire-card-hit' : ''}`}>
      <span className="inspire-emoji">{place.emoji}</span>
      <div className="inspire-body">
        <div className="inspire-name">{place.name}</div>
        <div className="inspire-meta">
          {fmtDist(place.dist, lang)}
          {place.cuisine && <span className="inspire-cuisine"> · {place.cuisine}</span>}
        </div>
      </div>
      <a
        className="inspire-go"
        href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
        target="_blank" rel="noreferrer"
      >
        {t.directions}
      </a>
    </div>
  )
}

export default function Inspire() {
  const navigate = useNavigate()
  const { tripId } = useParams()
  const { trip, STOPS, HOTELS } = useTrip()
  const { lang } = useLang()
  const t = strings[lang]

  const [phase, setPhase] = useState('locating') // locating | searching | ready | error
  const [places, setPlaces] = useState([])
  const [originNote, setOriginNote] = useState(null) // null → real GPS fix
  const [filter, setFilter] = useState('all')
  const [hitId, setHitId] = useState(null)
  const cardRefs = useRef({})

  const locate = useCallback(() => {
    setPhase('locating')
    setHitId(null)

    let cancelled = false
    const search = (origin, note) => {
      if (cancelled) return
      setOriginNote(note)
      setPhase('searching')
      fetchNearby(origin)
        .then(list => { if (!cancelled) { setPlaces(list); setPhase('ready') } })
        .catch(() => { if (!cancelled) setPhase('error') })
    }
    const searchFromItinerary = (noteKey) => {
      const fb = itineraryFallback(trip, STOPS, HOTELS)
      if (fb) search(fb, `${t[noteKey]} ${fb.label}`)
      else setPhase('error')
    }

    if (!navigator.geolocation) {
      searchFromItinerary('geoUnsupported')
    } else {
      navigator.geolocation.getCurrentPosition(
        pos => search({ lat: pos.coords.latitude, lon: pos.coords.longitude }, null),
        () => searchFromItinerary('nearFallback'),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
      )
    }
    return () => { cancelled = true }
  }, [trip, STOPS, HOTELS, t])

  useEffect(() => locate(), [locate])

  const shown = places.filter(p => filter === 'all' || p.kind === filter)

  function surprise() {
    if (shown.length === 0) return
    // Pick among the 20 closest so the surprise is still walkable.
    const id = shown[Math.floor(Math.random() * Math.min(shown.length, 20))].id
    setHitId(id)
    cardRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="inspire">
      <div className="inspire-hero">
        <button className="trip-back" onClick={() => navigate(`/trip/${tripId}`)}>{t.back}</button>
        <h1>{t.title}</h1>
        <p>{t.sub} · {t.within.replace('{r}', RADIUS_M / 1000)}</p>
        {phase === 'ready' && (
          <div className="inspire-origin">{originNote || t.nearYou}</div>
        )}
      </div>

      {(phase === 'locating' || phase === 'searching') && (
        <div className="inspire-state">
          <div className="inspire-spinner" />
          <p>{phase === 'locating' ? t.locating : t.searching}</p>
        </div>
      )}

      {phase === 'error' && (
        <div className="inspire-state">
          <div className="inspire-state-emoji">🧭</div>
          <p>{t.error}</p>
          <button className="inspire-retry" onClick={locate}>{t.retry}</button>
        </div>
      )}

      {phase === 'ready' && (
        <>
          <div className="inspire-toolbar">
            <div className="inspire-chips">
              {[['all', t.all], ['sight', t.attractions], ['food', t.food]].map(([k, label]) => (
                <button
                  key={k}
                  className={`inspire-chip${filter === k ? ' inspire-chip-on' : ''}`}
                  onClick={() => { setFilter(k); setHitId(null) }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="inspire-actions">
              <button className="inspire-surprise" onClick={surprise} disabled={shown.length === 0}>{t.surprise}</button>
              <button className="inspire-refresh" onClick={locate}>{t.refresh}</button>
            </div>
          </div>

          {shown.length === 0 ? (
            <div className="inspire-state">
              <div className="inspire-state-emoji">🌾</div>
              <p>{t.empty.replace('{r}', RADIUS_M / 1000)}</p>
            </div>
          ) : (
            <div className="inspire-list">
              {shown.map(p => (
                <PlaceCard
                  key={p.id}
                  place={p}
                  lang={lang}
                  t={t}
                  highlighted={p.id === hitId}
                  cardRef={el => { cardRefs.current[p.id] = el }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
