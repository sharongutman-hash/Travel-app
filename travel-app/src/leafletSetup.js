// Bundle Leaflet's default marker assets through Vite instead of hotlinking
// unpkg. Imported once (side-effect) by any component that mounts a map.
import L from 'leaflet'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'
import icon from 'leaflet/dist/images/marker-icon.png'
import shadow from 'leaflet/dist/images/marker-shadow.png'
import { GestureHandling } from 'leaflet-gesture-handling'
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: iconRetina, iconUrl: icon, shadowUrl: shadow })

// Cooperative gestures ("use two fingers to move the map"): one finger scrolls
// the page, two fingers pan the map, ctrl/⌘+scroll zooms on desktop. Enabled
// per-map with the `gestureHandling` option; overlay text auto-localizes.
L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling)
