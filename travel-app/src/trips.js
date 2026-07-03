import { trip } from './tripData'
import { tripTranslations } from './i18n'

// Registry of trips shown on the welcome page. Each trip is a standalone
// itinerary; for now the only ready trip is the Romania road trip, whose
// details live in tripData.js. New trips get added here as they're built.
export const trips = [
  {
    id: 'romania',
    route: '/trip/romania',
    flag: '🇷🇴',
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
