import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { STOPS, SPOTS, CATEGORIES, trip } from '../tripData'
import { useRoute } from '../hooks/useRoute'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

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

function RouteLayer({ from, to }) {
  const { coords, distanceKm, durationMin } = useRoute(from, to)
  if (!coords) return null
  const hours = Math.floor(durationMin / 60)
  const mins  = durationMin % 60
  const label = durationMin
    ? `${hours > 0 ? hours + ' h ' : ''}${mins} min · ${distanceKm} km`
    : null
  return (
    <>
      <Polyline positions={coords} color="#1469F5" weight={4} opacity={0.85} />
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

export default function DayMap({ day, selectedSpotId, onSpotClick }) {
  const stop    = STOPS.find(s => s.id === day.stopId)
  // Derive previous stop from previous day rather than parsing the "from" string
  const dayIdx  = trip.days.findIndex(d => d.id === day.id)
  const prevDay = trip.days[dayIdx - 1]
  const fromStop = day.type === 'travel'
    ? STOPS.find(s => s.id === (prevDay?.stopId ?? 'otp'))
    : null

  const spots = stop ? SPOTS.filter(s => s.stop === stop.id) : []

  const allCoords = []
  if (fromStop) allCoords.push(fromStop.coords)
  if (stop)     allCoords.push(stop.coords)
  spots.forEach(s => allCoords.push(s.coords))

  return (
    <MapContainer
      center={stop ? stop.coords : [45.4, 25.0]}
      zoom={9}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {allCoords.length > 1 && <FitBounds coords={allCoords} />}

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
              <strong>{spot.name}</strong>
              {spot.note && <><br /><em>{spot.note}</em></>}
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
