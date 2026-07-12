import { useState } from 'react'
import L from 'leaflet'
import { BASE_LAYERS } from '../mapLayers'
import { useTrip } from '../TripContext'

// Pill button that expands into a base-layer menu. Controlled by the map.
export function LayerSwitcher({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const active = BASE_LAYERS.find(l => l.id === value) || BASE_LAYERS[0]
  return (
    <div className={`map-layers ${open ? 'open' : ''}`}>
      <button className="map-ctrl-btn" onClick={() => setOpen(o => !o)} aria-label="Change map style" title={active.name}>
        {active.icon}
      </button>
      {open && (
        <div className="map-layers-menu">
          {BASE_LAYERS.map(l => (
            <button
              key={l.id}
              className={`map-layer-opt ${l.id === value ? 'active' : ''}`}
              onClick={() => { onChange(l.id); setOpen(false) }}
            >
              <span>{l.icon}</span> {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Category filter chips. `active` is a Set of category keys (empty = show all).
export function CategoryFilter({ cats, active, onToggle }) {
  const { CATEGORIES } = useTrip()
  if (cats.length < 2) return null
  return (
    <div className="map-filters">
      {cats.map(key => {
        const c = CATEGORIES[key]
        const on = active.size === 0 || active.has(key)
        return (
          <button
            key={key}
            className={`map-filter-chip ${on ? 'on' : 'off'}`}
            style={{ '--chip': c.color }}
            onClick={() => onToggle(key)}
            aria-pressed={on}
            title={c.label}
          >
            {c.emoji}
          </button>
        )
      })}
    </div>
  )
}

// Fullscreen toggle for the .map-wrap element. `map` = the Leaflet instance.
export function FullscreenButton({ map }) {
  function toggle() {
    if (!map) return
    const el = map.getContainer().closest('.map-wrap') || map.getContainer()
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
    setTimeout(() => map.invalidateSize(), 250)
  }
  return <button className="map-ctrl-btn" onClick={toggle} aria-label="Toggle fullscreen" title="Fullscreen">⛶</button>
}

// "Locate me" — pans to the user's position and drops a marker.
export function LocateButton({ map }) {
  const [busy, setBusy] = useState(false)
  function locate() {
    if (!map) return
    setBusy(true)
    map.locate({ setView: true, maxZoom: 13 })
    map.once('locationfound', e => {
      setBusy(false)
      L.circleMarker(e.latlng, { radius: 8, color: '#1469F5', fillColor: '#1469F5', fillOpacity: 0.6 })
        .addTo(map).bindPopup('You are here').openPopup()
    })
    map.once('locationerror', () => setBusy(false))
  }
  return (
    <button className={`map-ctrl-btn ${busy ? 'busy' : ''}`} onClick={locate} aria-label="Find my location" title="Locate me">
      {busy ? '…' : '📍'}
    </button>
  )
}
