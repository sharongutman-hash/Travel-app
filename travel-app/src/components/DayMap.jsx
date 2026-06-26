import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { STOPS, SPOTS, CATEGORIES } from '../tripData'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function hotelIcon(name) {
  return L.divIcon({
    className: '',
    html: `<div style="background:#1469F5;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)">🏨</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

function spotIcon(color, emoji, selected) {
  const size = selected ? 32 : 26
  return L.divIcon({
    className: '',
    html: `<div style="background:${color};color:#fff;border-radius:50%;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;font-size:${selected ? 16 : 13}px;border:${selected ? 3 : 2}px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function FitBounds({ coords }) {
  const map = useMap()
  if (coords.length > 0) {
    map.fitBounds(coords.map(c => c), { padding: [60, 60] })
  }
  return null
}

export default function DayMap({ day, selectedSpotId, onSpotClick }) {
  const stop = STOPS.find(s => s.id === day.stopId)
  const prevStop = day.type === 'travel' ? STOPS.find(s => s.name === day.from || s.shortName === day.from?.split(' ')[0]) : null
  const spots = stop ? SPOTS.filter(s => s.stop === stop.id) : []

  const allCoords = []
  if (prevStop) allCoords.push(prevStop.coords)
  if (stop) allCoords.push(stop.coords)
  spots.forEach(s => allCoords.push(s.coords))

  return (
    <MapContainer
      center={stop ? stop.coords : [45.4, 25.0]}
      zoom={10}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {allCoords.length > 1 && <FitBounds coords={allCoords} />}

      {day.type === 'travel' && prevStop && stop && (
        <Polyline positions={[prevStop.coords, stop.coords]} color="#1469F5" weight={3} dashArray="8 5" opacity={0.8} />
      )}

      {stop && (
        <Marker position={stop.coords} icon={hotelIcon(stop.name)}>
          <Popup><strong>{day.hotel?.name || stop.name}</strong><br />Sleeping here</Popup>
        </Marker>
      )}

      {spots.map(spot => {
        const cat = CATEGORIES[spot.cat]
        return (
          <Marker
            key={spot.id}
            position={spot.coords}
            icon={spotIcon(cat.color, cat.emoji, selectedSpotId === spot.id)}
            eventHandlers={{ click: () => onSpotClick && onSpotClick(spot.id) }}
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
