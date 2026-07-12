// Trip registry — every trip this hub app can render.
//
// Each trip is a self-contained module with the exports described in
// .claude/agent/tripplaner/SCHEMA.md: CATEGORIES, CATEGORY_IMAGES, STOPS,
// SPOTS, HOTELS, trip, getDayRangeByStop. Bilingual fields are `{ en, he }`.
//
// To add a trip: create src/trips/<slug>.js with those exports (explicit .js
// extension in the import — node runs this file for schema validation), then
// append `bundle(<slug>)` to `tripBundles` below. Nothing else to hand-edit:
// routing (/trip/<slug>) and the welcome card derive from the module itself.
import * as romania from '../tripData.js'
import { tripTranslations, daySummaries, pick } from '../i18n.js'

function bundle(mod) {
  return {
    CATEGORIES: mod.CATEGORIES,
    CATEGORY_IMAGES: mod.CATEGORY_IMAGES,
    STOPS: mod.STOPS,
    SPOTS: mod.SPOTS,
    HOTELS: mod.HOTELS,
    trip: mod.trip,
    getDayRangeByStop: mod.getDayRangeByStop,
  }
}

// Romania predates the hub: its Hebrew title/dates and day summaries live in
// i18n.js rather than inline. Merge them into the standard bilingual shape
// (without mutating the source module) so consumers can pick() any field.
function normalizeRomania(mod) {
  const b = bundle(mod)
  b.trip = {
    ...mod.trip,
    title:    { en: tripTranslations.en.title,    he: tripTranslations.he.title },
    subtitle: { en: tripTranslations.en.subtitle, he: tripTranslations.he.subtitle },
    dates:    { en: tripTranslations.en.dates,    he: tripTranslations.he.dates },
    days: mod.trip.days.map(d => ({
      ...d,
      summary: {
        en: daySummaries.en[d.id] ?? pick(d.summary, 'en'),
        he: daySummaries.he[d.id] ?? pick(d.summary, 'he'),
      },
    })),
  }
  return b
}

export const tripBundles = [normalizeRomania(romania)]

// Registry of trips shown on the welcome page, derived from each bundle.
export const trips = tripBundles.map(b => ({
  id: b.trip.slug,
  route: `/trip/${b.trip.slug}`,
  flag: b.trip.flag,
  heroImage: b.trip.heroImage,
  days: b.trip.days.length,
  km: b.trip.totalKm,
  status: 'ready',
  en: { title: pick(b.trip.title, 'en'), subtitle: pick(b.trip.subtitle, 'en'), dates: pick(b.trip.dates, 'en') },
  he: { title: pick(b.trip.title, 'he'), subtitle: pick(b.trip.subtitle, 'he'), dates: pick(b.trip.dates, 'he') },
}))

// Resolve a registry entry by its route id. Returns null for unknown ids so
// callers can redirect/404 instead of silently rendering the wrong trip.
export function getTrip(tripId) {
  return trips.find(t => t.id === tripId) || null
}

// Full data bundle for a trip id — what the trip pages render from.
export function getTripBundle(tripId) {
  return tripBundles.find(b => b.trip.slug === tripId) || null
}
