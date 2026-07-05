import { trip } from './tripData'
import { tripTranslations } from './i18n'

// Registry of trips shown on the welcome page. A standalone trip app derives its
// single entry from tripData.js — set `trip.slug` and `trip.flag` there and this
// updates automatically (no hand-editing per trip). A multi-trip hub would push
// additional entries here (or read a trips.json manifest).
export const trips = [
  {
    id: trip.slug,
    route: `/trip/${trip.slug}`,
    flag: trip.flag,
    heroImage: trip.heroImage,
    days: trip.days.length,
    km: trip.totalKm,
    status: 'ready',
    en: {
      title: tripTranslations.en.title,
      subtitle: tripTranslations.en.subtitle,
      dates: tripTranslations.en.dates,
    },
    he: {
      title: tripTranslations.he.title,
      subtitle: tripTranslations.he.subtitle,
      dates: tripTranslations.he.dates,
    },
  },
]

// Resolve a registry entry by its route id. Returns null for unknown ids so
// callers can redirect/404 instead of silently rendering the wrong trip.
export function getTrip(tripId) {
  return trips.find(t => t.id === tripId) || null
}
