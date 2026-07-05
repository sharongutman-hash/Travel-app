// Base tile layers for the map layer switcher. All are free / no-key sources.
export const BASE_LAYERS = [
  { id: 'streets',   icon: '🗺️', name: 'Streets',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO' },
  { id: 'terrain',   icon: '⛰️', name: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap (CC-BY-SA)' },
  { id: 'satellite', icon: '🛰️', name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri' },
  { id: 'dark',      icon: '🌙', name: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO' },
]

export const DEFAULT_LAYER = 'streets'
