# Travel App — Improvement Backlog

Review date: 2026-07-05. Scope: `travel-app/` (the running Romania app), the
template in `.claude/agent/tripplaner/template/`, and the `/new-trip` agent
skill. Each item is self-contained so any model can pick it up independently.
Priorities: **P1** = broken/misleading today, **P2** = clear UX win, **P3** = polish.

---

## 1. Flow (screen-to-screen journey)

### 1.1 ✅ DONE (P1) The trip route ignores `:tripId`
> **Done 2026-07-05:** `trips.js` now exposes `getTrip(tripId)`; `App.jsx` scopes days
> under `/trip/:tripId/day/:dayId` with a `*` → `/` catch-all; `Home`/`DayDetail`
> read the param, resolve via the registry, and `<Navigate to="/">` on unknown ids.
`App.jsx` routes `/trip/:tripId` to `Home`, but `Home.jsx` never reads the param —
it always renders the Romania `tripData`. Same for `/day/:id`, which is not scoped
to a trip at all. With a second trip in `trips.js` both routes collide.
**Fix:** read `tripId` in `Home`/`DayDetail` (`/trip/:tripId/day/:dayId`), resolve
trip data through the `trips.js` registry, and 404/redirect on unknown ids.

### 1.2 ✅ DONE (P1) Back button hardcodes the Romania route
> **Done 2026-07-05:** back button now `navigate(`/trip/${tripId}`)`; added `country: "Romania"`
> to the `trip` object and the photo search now reads `trip.country` instead of a literal.
`DayDetail.jsx:247` navigates to `'/trip/romania'`. Should use `navigate(-1)` or the
resolved trip route. Also `DayDetail.jsx:121` appends the literal string
`' Romania'` to the Google photo search — should come from `trip.country`.

### 1.3 ✅ DONE (P1) "View List" is misleading
> **Done 2026-07-05:** "View List" now toggles the day carousel into a real vertical
> agenda (`AgendaRow` rows: day number, title, date/meta, chevron); button label
> flips to "View Cards". RTL-aware. No longer just opens Day 1.
`Home.jsx:175` — the "View List" button just opens Day 1. Either build an actual
list/agenda view (all days vertically, scrollable) or rename/remove the button.

### 1.4 ✅ DONE (P1) Welcome search box is decorative
> **Done 2026-07-05:** search is now a controlled input that filters the upcoming
> trip card + idea cards (case-insensitive over title/subtitle/dates/name/place),
> with a clear (×) button and a no-results state. Build CTA hides while searching.
`Welcome.jsx:122-125` renders an input that does nothing. Either wire it to filter
the trips + suggestions lists (trivial, high perceived value) or remove it — a dead
search field erodes trust in the whole screen.

### 1.5 ✅ DONE (P2) "New ideas" suggestions are hotel names, not trip ideas
> **Done 2026-07-05:** replaced the four Bali hotel rows with destination-level
> ideas (Bali / Amalfi / Iceland / Kyoto) using a `place` tagline. Tap still opens
> the build modal; pre-filling the wizard from a chosen idea is deferred to §5.1.
`Welcome.jsx:31-36` hardcodes four Bali *hotels* as trip suggestions, and tapping
one opens the same generic "how to build a trip" modal. Replace with destination-level
ideas (e.g. "Bali beaches — 7 days") and make the tap pre-fill the build wizard
(see §5) with that destination.

### 1.6 ✅ DONE (P2) Trip start date is hardcoded in the renderer
> **Done 2026-07-05:** added `startDate: "2026-08-06"` (ISO) to the trip data;
> `dateForDay` now parses it (local-time parts, no UTC shift) and the "Today"
> detection is guarded when `startDate` is absent. Removed the TRIP_YEAR/MONTH/DAY consts.
`Home.jsx:14-19` — `TRIP_YEAR/TRIP_MONTH/TRIP_START_DAY` are constants in a
supposedly generic renderer. Add a machine-readable `trip.startDate` (ISO string)
to the schema and derive `dateForDay` from it. Same for the "Today" logic.

### 1.7 ✅ DONE (P2) Hardcoded booking facts leak into components
> **Done 2026-07-05:** added `airline` to both flight legs; `FlightGlance` reads
> `f.airline`. `TabAdmin` arrival/departure rows now render route, date, times and
> booking refs from `trip.flight.outbound`/`return` (with `lands`/`departs` i18n keys)
> instead of the literal `TLV → BUH`, `Thu Aug 6`, `7IGKV6`/`7ILXY6`.
`Home.jsx:59` hardcodes `EL AL · Direct`; `DayDetail.jsx:152-153, 183-184` hardcode
`TLV → BUH`, dates, and booking refs `7IGKV6`/`7ILXY6` even though they exist in
`tripData`. All strings shown for a flight/hotel must come from the data file —
otherwise every generated trip silently shows Romania's bookings.

### 1.8 ✅ DONE (P3) No "trip finished" state
> **Done 2026-07-05:** Home now computes `tripEnded` (today past the last day) and
> shows a `FinishedGlance` recap card (grey "Completed" badge, 🎉 Trip recap, day
> count → opens the itinerary) instead of the stale outbound flight. Optional
> "completed" badge on the Welcome trip card is left for later.
Once the trip is past, Home still shows the outbound `FlightGlance` as "Upcoming".
Add a third state (past trip → recap card / "trip completed" badge on Welcome).

---

## 2. Interaction & animation

### 2.1 ✅ DONE (P2) No page transitions
> **Done:** `AnimatedRoutes` remounts on path change; each page plays a fade/slide-in (`.route-fade`). Gated by `prefers-reduced-motion`.
Navigation Welcome → Trip → Day is an instant swap. Add route transitions
(e.g. `framer-motion` `AnimatePresence`, or the View Transitions API — supported
in modern Chrome/Safari): slide-in for drill-down, slide-back for return. The app
mimics a native mobile app; this is the single biggest "feel" gap.

### 2.2 ✅ DONE (P2) Bottom sheet has a handle but isn't draggable
> **Done:** the sheet is now a real drag/snap sheet (peek 18 / half 48 / full 88 vh) via pointer events on the handle; a tap cycles snap points. Mobile-only (desktop stays a side panel).
`DayDetail.jsx` renders `.sheet-handle` purely decoratively. Users will try to drag
it. Make the sheet a real 2–3 snap-point sheet (collapsed / half / full) so the map
can be seen full-screen with the sheet peeking. Drag + spring animation, or a
simple tap-to-toggle as a cheap first version.

### 2.3 ✅ DONE (P2) Tab switching is a hard unmount
> **Done:** content cross-fades (`.tab-fade`), a sliding `.tab-indicator` tracks the active tab, and per-tab scroll position is saved/restored via `useLayoutEffect`.
Switching Summary/Attractions/Admin instantly swaps content and loses scroll
position. Add a short cross-fade/slide and preserve per-tab scroll. Also: an
active-tab indicator that slides between tabs sells the interaction cheaply.

### 2.4 ✅ DONE (P2) List ↔ map selection is one-way-ish
> **Done:** selecting a spot flies the map to it (`FlyToSpot`), and selecting a marker switches to the Attractions tab and scrolls the card into view.
Selecting a spot card expands it and enlarges the map marker — good — but the map
doesn't pan to the selected spot, and selecting a marker doesn't scroll the list to
the card. Add `map.flyTo(spot.coords)` on select and `scrollIntoView` on the card.

### 2.5 ✅ DONE (P3) Micro-interactions
> **Done:** spot card animates open (`spotexpand`); the build modal has an exit animation, Escape-to-close and focus; global `prefers-reduced-motion` guard; `days-scroll` now `scroll-snap x mandatory`.
- Expanding a spot card snaps open (`{selected && ...}`) — animate height/opacity.
- Modal (`wt-modal`) has an entry animation but no exit animation, no `Escape` key
  handling, no focus trap (a11y).
- Add a `prefers-reduced-motion` media query gating all of the above.
- Horizontal `days-scroll` should use `scroll-snap-type: x mandatory` so cards
  snap into place.

### 2.6 🟡 PARTIAL (P3) Loading states
> **Done:** route polylines render dashed + dimmed while OSRM loads; the straight-line distance chip pulses until the road distance arrives. **Remaining:** hero-image skeletons.
Route lines fade from 0.3→0.8 opacity while OSRM loads — subtle to the point of
invisible. Add skeletons: shimmering placeholders for hero images, a dashed
animated polyline while the real route loads, and a spinner state for the hotel
distance chips (they currently jump from straight-line estimate to road distance
with no cue except a title tooltip).

### 2.7 ✅ DONE (P3) Accessibility of interactive elements
> **Done:** `spot-row` is now a `<button>` with `aria-expanded`; emoji dots/carets are `aria-hidden`; filter/wizard chips expose `aria-pressed`; modal is `role=dialog aria-modal`.
`spot-row` is a clickable `div` (no keyboard/Enter support), emoji-only icons have
no `aria-label`, category colors are not contrast-checked. Convert to `<button>`s,
add labels.

---

## 3. Map views

### 3.1 ✅ DONE (P2) Offer multiple base layers
> **Done:** `LayerSwitcher` on both maps — Streets / Terrain (OpenTopoMap) / Satellite (Esri) / Dark (Carto), from a shared `mapLayers.js`.
Both maps use one Carto *light* tile layer. Add a layer switcher (Leaflet
`L.control.layers` or custom pill buttons on the map):
- **Streets** (current Carto light)
- **Terrain/outdoors** — OpenTopoMap or Stadia outdoors; a Carpathians road
  trip is exactly the use case for terrain
- **Satellite** — Esri World Imagery (free tier, attribution required)
- **Dark** — Carto `dark_all`, pairs with a future dark mode

### 3.2 ✅ DONE (P2) Category filter on the map
> **Done:** `CategoryFilter` chips; on the Day screen the filter state is shared so both the map markers and the Attractions list filter together.
`RouteMap`/`DayMap` render every `SPOT` at once. Add filter chips (reusing
`CATEGORIES` emoji+color) above/over the map to toggle castles/nature/etc. Keep
the state shared with the Attractions tab so the list filters too.

### 3.3 ✅ DONE (P2) Richer marker popups → drill-in
> **Done:** popups now show an image thumbnail and a "Details ›" button that selects the spot (opening its card, per 2.4).
Map popups show name + note only. Add the spot image thumbnail and a "Details"
action that opens the corresponding card in the sheet (ties into §2.4).

### 3.4 🟡 PARTIAL (P3) Map utility controls
> **Done:** fullscreen toggle (both maps), "locate me" (Day map), numbered/ordered stop markers on the route map. **Remaining:** marker clustering (needs a dep) and the animated ant-path.
- Fullscreen toggle (especially DayMap, which is half-hidden by the sheet).
- "Locate me" button during the trip (Leaflet `map.locate()`), showing distance
  from the current position to today's spots.
- Marker clustering (`leaflet.markercluster`) once a stop has >10 spots.
- Numbered/ordered stop markers on `RouteMap` (1,2,3…) to make route direction
  obvious; optionally an animated "ant path" showing travel direction.

### 3.5 🟡 PARTIAL (P2) OSRM public server is a single point of failure
> **Done:** route geometries are now cached in `localStorage` (persist across reloads; straight-line fallback unchanged). **Remaining:** true build-time precompute into `tripData.js` (validator `--images` covers image liveness).
`useRoute.js` hits `router.project-osrm.org` (demo server, rate-limited, no SLA).
The fallback is a straight line with no user-facing indication on the map. At
minimum: cache results in `localStorage` (they never change for a fixed trip), and
consider precomputing route geometries at build time into `tripData.js` so the
deployed app needs zero runtime routing calls.

---

## 4. Code & data hygiene

- **✅ DONE (P1) Template drift:** the app's `RouteMap`/`DayMap` were made fully
  generic (derive LEGS/centre/prev-stop from `STOPS`, no `'otp'`/`[45.4,25.0]`),
  then the app's entire redesigned `src/` was synced into `tripplaner/template/src/`
  (now byte-identical). Tokenized root files left untouched. `trips.js` now derives
  its entry from `trip.slug`/`trip.flag` (no per-trip hand-edit). SCHEMA.md + SKILL.md
  updated with the `slug`/`startDate`/`country`/`flag`/`airline` fields. Guarded
  `km` display for city-break trips. *(Done 2026-07-05.)*
- **✅ N/A (P2)** `dist/` is already in `.gitignore` and not tracked — the on-disk
  `dist/` is just local build output, never committed. No change needed.
- **✅ DONE (P2)** `src/tripData.backup.js` deleted (from app and template).
- **🟡 PARTIAL (P2)** i18n gaps: the renderer now supports bilingual `{en,he}` **or**
  plain-string spot `name`/`note`/`desc` via a `pick()` helper (applied in DayDetail +
  map popups), so new trips can localize per field. **Remaining:** migrate the existing
  Romania `daySummaries` out of `i18n.js` (still keyed by day id) into `tripData.js`.
- **✅ DONE (P3)** `ErrorBoundary` wraps the routes with a friendly fallback + reload.
- **✅ DONE (P3)** Leaflet marker icons are bundled via Vite (`leafletSetup.js`), no more unpkg.

---

## 5. Making the trip-builder agent better

The agent (`.claude/skills/new-trip/SKILL.md` + `tripplaner/` template) works, but
everything between "user intent" and "schema-valid tripData.js" is manual prose.
Suggested upgrades, in order of leverage:

### 5.1 ✅ DONE — Turn the Welcome "Build" modal into a real intake wizard
> **Done:** `BuildWizard` is a 4-step form (destination/dates/origin → travellers/rooms/pace/interests → paste bookings → review) that emits a Markdown trip brief with Copy + Download `.md`. Idea cards pre-fill the destination.
Today `BuildModal` only *describes* the four asset groups. Replace it with a
multi-step wizard that collects exactly what SKILL Step 1 asks for:
1. Destination + dates (+ origin airport)
2. Travellers, rooms, pace, interests (chips)
3. Already-booked assets: paste flight/hotel/car confirmations (free text)
4. Review → produces a **structured trip brief** (JSON or Markdown)

Output: a downloadable/copyable brief the user pastes into `/new-trip` — or, if
the app ever gets a backend, POSTs to it. This closes the loop: the "New ideas"
cards (§1.5) pre-fill step 1. Even without a backend, the wizard removes the
agent's slowest phase (back-and-forth question asking) by frontloading it.

### 5.2 ✅ DONE — Add a schema validator script to the template
> **Done:** `scripts/validate-trip.mjs` (cat keys, stop/hotel refs, [lat,lng] bounds, contiguous day ids, en/he presence, optional `--images` HEAD checks). Wired as `npm run validate` + `prebuild` gate in the template and the app.
SKILL Step 5 says "quick schema check" but it's manual. Ship
`template/scripts/validate-trip.mjs` that imports `tripData.js` and asserts:
- every `SPOT.cat` ∈ `CATEGORIES`; every `stopId`/`hotelId` resolves
- coords are `[lat,lng]` within the destination's bounding box (catches swapped
  lat/lng — the most common agent error)
- days are contiguous; first day has `arrival`, last has `departure`
- every bilingual field has both `en` and `he`
- image URLs return HTTP 200 (HEAD request) — catches dead Wikimedia links

Wire it as `npm run validate` and make the skill run it as a hard gate before
`npm run build`. This converts the guardrails section from prose into code.

### 5.3 🟡 PARTIAL — Automate asset-collection sub-steps
> **Done:** route geometries cached in `localStorage` (5.3 routes); image liveness via `validate --images`; car/bookings captured through the wizard's paste step. **Remaining:** a Wikimedia image-fetch helper, Nominatim coord reverse-geocode, and true build-time OSRM precompute.
- **Images:** a helper script that queries the Wikimedia Commons API by spot name
  + coords and returns a verified, licensed image URL — instead of the agent
  hand-picking URLs (frequent 404/hotlink failures).
- **Coordinates:** verify each spot via Nominatim reverse-geocode ("does this
  point resolve near the named place?") inside the same validator.
- **Routes:** precompute OSRM geometries for all legs at build time and embed
  them (fixes §3.5 and removes a runtime dependency from every generated app).
- **Car rental:** no API is wired; add a structured "paste your confirmation
  email" parse step to the wizard instead of ad-hoc questioning.

### 5.4 ✅ DONE — Single-source the template, and register trips automatically
> **Done:** `template/src` is byte-identical to the app; maps made generic; `trips.js` derives its entry from `trip.slug`/`trip.flag` (no per-trip hand-edit). **Note:** a multi-trip hub reading a `trips.json` manifest remains a future option.
- Renderer improvements (this whole document) must land in
  `tripplaner/template/` first, then be re-synced into `travel-app/` — otherwise
  every future generated trip is born without the fixes. Add a
  `scripts/sync-template.sh` (or make `travel-app` literally a generated instance
  of the template) so drift can't recur.
- New trips currently become separate repos the Welcome screen can't see:
  `trips.js` is hand-edited. Give the skill a final step that appends the new
  trip's registry entry (id, route/URL, hero, days, km, `{en,he}` meta) to the hub
  app's `trips.js` — or have the hub read a `trips.json` manifest that the agent
  updates, so the Welcome page always lists every built trip.

### 5.5 ✅ DONE — Smaller skill upgrades
> **Done:** fixed the garbled flight tool id; added the optional Playwright `scripts/smoke.mjs`; SKILL now saves a `trip-brief.md` and runs `validate` as a gate; SCHEMA/SKILL document `slug`/`startDate`/`country`/`flag`/`airline`.
- Add a **post-build smoke test**: a Playwright script in the template that opens
  `/`, `/trip/:id`, `/day/1`, asserts no console errors, and checks that the
  flight/hotel cards rendered. "Verify it renders" becomes deterministic.
- Capture the **trip brief itself** into the generated repo
  (`trip-brief.md`) so a trip can be regenerated/edited later with context.
- Add `startDate` (ISO) to SCHEMA.md (needed by §1.6) and a `country`/`bbox`
  field (needed by §1.2 photo search and §5.2 coordinate validation).
- The skill's flight-tool reference `mcp__d8c8c23e-2468-…__search_flights` is a
  truncated/garbled tool id — fix it to the real id so the agent doesn't fumble
  its first search call.

---

## Suggested execution order

| Wave | Items | Why first |
|------|-------|-----------|
| 1 | 1.1, 1.2, 1.6, 1.7, 4 template drift | Correctness: multi-trip routing + de-hardcoding; everything else builds on it |
| 2 | 5.2, 5.4 | Lock in quality for all future generated trips |
| 3 | 2.1, 2.2, 2.4, 3.1, 3.2 | Highest-visibility UX wins |
| 4 | 5.1 wizard, 1.4, 1.5 | Close the intake loop |
| 5 | Remaining P3 polish | Micro-interactions, a11y, offline routes |
