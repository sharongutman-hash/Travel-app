# Changelog

All notable changes to the Romania Road Trip app are documented here.

---

## [Unreleased]

---

## 2026-06-26 — Hebrew / RTL Language Support

### Added
- Language toggle button fixed to the top bar — switches between English (EN) and Hebrew (עב)
- `LangContext.jsx` — React context that tracks active language and sets `dir="rtl"` on `<html>` when Hebrew is active
- `i18n.js` — all UI strings, trip title/subtitle/dates, category labels, and all 11 day summaries translated to Hebrew
- RTL CSS overrides for card layouts, icons, back button, overlays, and admin rows

### Changed
- `App.jsx` — wrapped in `<LangProvider>`, added persistent `<TopBar>` with language toggle
- `Home.jsx` — all labels (day badge, stats bar, list/map toggle) now use active language
- `DayDetail.jsx` — tabs, admin section titles, reservation labels, category headings, and day summaries all translated
- `DayDetail.css` — height adjusted to account for the 44px fixed top bar

---

## 2026-06-26 — Real Driving Routes via OSRM

### Added
- Live driving routes fetched from the OSRM public API, replacing straight-line polylines
- `useRoute.js` hook handles async route fetching with loading/error state
- Routes follow real roads on the map between each stop

---

## 2026-06-26 — GitHub Pages Deployment Fix

### Fixed
- `BrowserRouter` basename now reads from `import.meta.env.BASE_URL` so deep links work on GitHub Pages
- Added `.nojekyll` file to `dist/` on build to prevent Jekyll from ignoring `_assets`
- Updated build script to include the nojekyll touch step

---

## 2026-06-26 — Initial Release

### Added
- Full Romania road trip itinerary app (11 days, 638 km)
- Home page with hero image, day card list, and interactive route map
- Day detail page with map, Summary / Attractions / Admin tabs
- Stop database: Snagov, Sinaia, Brașov, Sibiu, Curtea de Argeș with coords and descriptions
- Attractions database: 41 spots across all stops, categorised (castle, church, museum, nature, city, viewpoint)
- Hotel database with full contact details, pricing, cancellation policy
- Flight and car rental info for arrival (Day 1) and departure (Day 11)
- Mobile-responsive layout with List / Map toggle
- GitHub Pages deployment via `gh-pages` branch
