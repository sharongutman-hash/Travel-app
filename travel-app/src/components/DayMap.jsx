import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import '../leafletSetup'
import { STOPS, SPOTS, CATEGORIES, trip } from '../tripData'
import { useRoute } from '../hooks/useRoute'
import { useLang } from '../LangContext'
import { pick } from '../i18n'
import { BASE_LAYERS, DEFAULT_LAYER } from '../mapLayers'
import { LayerSwitcher, FullscreenButton, LocateButton } from './MapControls'

function hotelIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="background:#1469F5;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)">🏨</div>`,
    iconSize: [36, 36], iconAnchor: [18, 18],
  })
}

function spotIcon(color, emoji, selected) {
  const size = selected ? 34 : 26
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};color:#fff;border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-size:${selected ? 16 : 13}px;border:${selected ? 3 : 2}px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">${emoji}</div>`,
    iconSize: [size, size], iconAnchor: [size / 2, size / 2],
  })
}

function FitBounds({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords.length > 1) map.fitBounds(coords, { padding: [60, 60], maxZoom: 13 })
  }, [coords.join(',')])
  return null
}

// Pan/zoom to the selected spot when it changes (§2.4 list → map sync).
function FlyToSpot({ spotId }) {
  const map = useMap()
  useEffect(() => {
    if (!spotId) return
    const spot = SPOTS.find(s => s.id === spotId)
    if (spot) map.flyTo(spot.coords, Math.max(map.getZoom(), 13), { duration: 0.6 })
  }, [spotId])
  return null
}

function RouteLayer({ from, to, loading }) {
  const { coords, distanceKm, durationMin } = useRoute(from, to)
  if (!coords) return null
  const hours = Math.floor(durationMin / 60)
  const mins  = durationMin % 60
  const label = durationMin
    ? `${hours > 0 ? hours + ' h ' : ''}${mins} min · ${distanceKm} km`
    : null
  return (
    <>
      <Polyline positions={coords} color="#1469F5" weight={4} opacity={0.85} dashArray={loading ? '6 8' : null} />
      {label && (
        <Marker
          position={coords[Math.floor(coords.length / 2)]}
          icon={L.divIcon({
            className: '',
            html: `<div style="background:#fff;color:#1469F5;font-size:11px;font-weight:700;padding:3px 9px;border-radius:12px;border:1.5px solid #1469F5;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.15)">${label}</div>`,
            iconAnchor: [50, 12],
          })}
        />
      )}
    </>
  )
}

export default function DayMap({ day, selectedSpotId, onSpotClick, activeCats = new Set() }) {
  const { lang } = useLang()
  const [layerId, setLayerId] = useState(DEFAULT_LAYER)
  const [map, setMap] = useState(null)
  const layer = BASE_LAYERS.find(l => l.id === layerId) || BASE_LAYERS[0]

  const stop    = STOPS.find(s => s.id === day.stopId)
  const dayIdx  = trip.days.findIndex(d => d.id === day.id)
  const prevDay = trip.days[dayIdx - 1]
  const fromStop = day.type === 'travel'
    ? STOPS.find(s => s.id === (prevDay?.stopId ?? STOPS[0]?.id))
    : null

  const allSpots = stop ? SPOTS.filter(s => s.stop === stop.id) : []
  const spots = allSpots.filter(s => activeCats.size === 0 || activeCats.has(s.cat))

  const allCoords = []
  if (fromStop) allCoords.push(fromStop.coords)
  if (stop)     allCoords.push(stop.coords)
  allSpots.forEach(s => allCoords.push(s.coords))

  return (
    <div className="map-wrap map-wrap-full">
      <div className="map-topleft">
        <LayerSwitcher value={layerId} onChange={setLayerId} />
        <FullscreenButton map={map} />
        <LocateButton map={map} />
      </div>

      <MapContainer
        ref={setMap}
        center={stop ? stop.coords : (STOPS[0]?.coords || [0, 0])}
        zoom={9}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
        zoomControl={false}
      >
        <TileLayer key={layer.id} attribution={layer.attribution} url={layer.url} />
        {allCoords.length > 1 && <FitBounds coords={allCoords} />}
        <FlyToSpot spotId={selectedSpotId} />

        {day.type === 'travel' && fromStop && stop && (
          <RouteLayer from={fromStop.coords} to={stop.coords} />
        )}

        {stop && (
          <Marker position={stop.coords} icon={hotelIcon()}>
            <Popup><strong>{day.hotelId ? stop.name : 'Drop-off'}</strong></Popup>
          </Marker>
        )}

        {spots.map(spot => {
          const cat = CATEGORIES[spot.cat]
          return (
            <Marker
              key={spot.id}
              position={spot.coords}
              icon={spotIcon(cat.color, cat.emoji, selectedSpotId === spot.id)}
              eventHandlers={{ click: () => onSpotClick?.(spot.id === selectedSpotId ? null : spot.id) }}
            >
              <Popup>
                {spot.image && <img src={spot.image} alt={pick(spot.name, lang)} className="popup-thumb" loading="lazy" />}
                <strong>{pick(spot.name, lang)}</strong>
                {spot.note && <><br /><em>{pick(spot.note, lang)}</em></>}
                <br />
                <button className="popup-details" onClick={() => onSpotClick?.(spot.id)}>Details ›</button>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
