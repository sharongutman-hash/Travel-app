import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { STOPS, SPOTS, CATEGORIES, getDayRangeByStop } from '../tripData'
import { useMultiRoute } from '../hooks/useRoute'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Full round-trip legs: OTP→Snagov→Sinaia→Brașov→Sibiu→Curtea→OTP
const LEGS = [
  [STOPS[0].coords, STOPS[1].coords], // OTP  → Snagov
  [STOPS[1].coords, STOPS[2].coords], // Snagov → Sinaia
  [STOPS[2].coords, STOPS[3].coords], // Sinaia → Brașov
  [STOPS[3].coords, STOPS[4].coords], // Brașov → Sibiu
  [STOPS[4].coords, STOPS[5].coords], // Sibiu  → Curtea
  [STOPS[5].coords, STOPS[0].coords], // Curtea → OTP
]

function stopIcon(label) {
  return L.divIcon({
    className: '',
    html: `<div style="background:#1469F5;color:#fff;border-radius:20px;padding:4px 10px;font-size:11px;font-weight:600;white-space:nowrap;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3);line-height:1.4">${label}</div>`,
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
  const dayRanges = getDayRangeByStop()
  const { routes, loading } = useMultiRoute(LEGS)

  return (
    <MapContainer center={[45.4, 25.0]} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom zoomControl={false}>
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {/* Real road route for every leg */}
      {routes.map((coords, i) => (
        <Polyline key={i} positions={coords} color="#1469F5" weight={3} opacity={loading ? 0.3 : 0.8} />
      ))}

      {/* Stop labels */}
      {STOPS.filter(s => s.id !== 'otp').map(stop => (
        <Marker
          key={stop.id}
          position={stop.coords}
          icon={stopIcon(dayRanges[stop.id] ? `${dayRanges[stop.id]} · ${stop.shortName}` : stop.shortName)}
          eventHandlers={{ click: () => onStopClick?.(stop.id) }}
        >
          <Popup><strong>{stop.name}</strong><br />{dayRanges[stop.id]}</Popup>
        </Marker>
      ))}

      {/* Attraction dots */}
      {SPOTS.map(spot => {
        const cat = CATEGORIES[spot.cat]
        return (
          <Marker key={spot.id} position={spot.coords} icon={spotIcon(cat.color, cat.emoji)}>
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
