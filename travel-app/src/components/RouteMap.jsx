import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../leafletSetup'
import { useTrip } from '../TripContext'
import { useMultiRoute } from '../hooks/useRoute'
import { useLang } from '../LangContext'
import { pick } from '../i18n'
import { BASE_LAYERS, DEFAULT_LAYER } from '../mapLayers'
import { LayerSwitcher, CategoryFilter, FullscreenButton } from './MapControls'

function FitBounds({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords.length > 1) map.fitBounds(coords, { padding: [50, 50], maxZoom: 12 })
  }, [coords.length])
  return null
}

function stopIcon(num, label) {
  const badge = num != null
    ? `<span style="background:#0b3d91;color:#fff;border-radius:50%;width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;margin-right:5px">${num}</span>`
    : ''
  return L.divIcon({
    className: '',
    html: `<div style="display:flex;align-items:center;background:#1469F5;color:#fff;border-radius:20px;padding:3px 9px;font-size:11px;font-weight:600;white-space:nowrap;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);line-height:1.4">${badge}${label}</div>`,
    iconAnchor: [0, 12], iconSize: null,
  })
}

function spotIcon(color, emoji) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};color:#fff;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.3)">${emoji}</div>`,
    iconSize: [24, 24], iconAnchor: [12, 12],
  })
}

export default function RouteMap({ onStopClick }) {
  const { STOPS, SPOTS, CATEGORIES, getDayRangeByStop } = useTrip()
  const { lang } = useLang()
  const dayRanges = getDayRangeByStop()
  // Route legs derived from stop order + a closing leg back to the first stop.
  const legs = STOPS.slice(0, -1).map((s, i) => [s.coords, STOPS[i + 1].coords])
  if (STOPS.length > 2) legs.push([STOPS[STOPS.length - 1].coords, STOPS[0].coords])
  const center = STOPS.length
    ? [STOPS.reduce((a, s) => a + s.coords[0], 0) / STOPS.length,
       STOPS.reduce((a, s) => a + s.coords[1], 0) / STOPS.length]
    : [0, 0]
  // Category keys actually present, in CATEGORIES order (for the filter chips).
  const presentCats = Object.keys(CATEGORIES).filter(k => SPOTS.some(s => s.cat === k))

  const { routes, loading } = useMultiRoute(legs)
  const [layerId, setLayerId] = useState(DEFAULT_LAYER)
  const [activeCats, setActiveCats] = useState(new Set())
  const [map, setMap] = useState(null)
  const layer = BASE_LAYERS.find(l => l.id === layerId) || BASE_LAYERS[0]

  const shownStops = STOPS.filter((s, i) => !(i === 0 && dayRanges[s.id] == null))
  const shownSpots = SPOTS.filter(s => activeCats.size === 0 || activeCats.has(s.cat))
  const allCoords = [...STOPS.map(s => s.coords), ...SPOTS.map(s => s.coords)]

  function toggleCat(key) {
    setActiveCats(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }

  return (
    <div className="map-wrap">
      <div className="map-topleft">
        <LayerSwitcher value={layerId} onChange={setLayerId} />
        <FullscreenButton map={map} />
      </div>
      <CategoryFilter cats={presentCats} active={activeCats} onToggle={toggleCat} />

      <MapContainer ref={setMap} center={center} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom zoomControl={false} gestureHandling>
        <TileLayer key={layer.id} attribution={layer.attribution} url={layer.url} />
        <FitBounds coords={allCoords} />

        {routes.map((coords, i) => (
          <Polyline key={i} positions={coords} color="#1469F5" weight={3}
            opacity={loading ? 0.35 : 0.8} dashArray={loading ? '6 8' : null} />
        ))}

        {shownStops.map((stop, i) => (
          <Marker
            key={stop.id}
            position={stop.coords}
            icon={stopIcon(i + 1, dayRanges[stop.id] ? `${dayRanges[stop.id]} · ${stop.shortName}` : stop.shortName)}
            eventHandlers={{ click: () => onStopClick?.(stop.id) }}
          >
            <Popup><strong>{stop.name}</strong><br />{dayRanges[stop.id]}</Popup>
          </Marker>
        ))}

        {shownSpots.map(spot => {
          const cat = CATEGORIES[spot.cat]
          return (
            <Marker key={spot.id} position={spot.coords} icon={spotIcon(cat.color, cat.emoji)}>
              <Popup>
                {spot.image && <img src={spot.image} alt={pick(spot.name, lang)} className="popup-thumb" loading="lazy" />}
                <strong>{pick(spot.name, lang)}</strong>
                {spot.note && <><br /><em>{pick(spot.note, lang)}</em></>}
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
