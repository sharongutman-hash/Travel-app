#!/usr/bin/env node
// Schema gate for src/tripData.js. Run `npm run validate` before build/deploy.
// Pass --images to additionally HEAD-check every image URL (needs network).
import { CATEGORIES, CATEGORY_IMAGES, STOPS, SPOTS, HOTELS, trip } from '../src/tripData.js'

const errors = []
const warns = []
const err = m => errors.push(m)
const warn = m => warns.push(m)

const isLatLng = c =>
  Array.isArray(c) && c.length === 2 &&
  typeof c[0] === 'number' && typeof c[1] === 'number' &&
  c[0] >= -90 && c[0] <= 90 && c[1] >= -180 && c[1] <= 180

const bothLangs = v => !(v && typeof v === 'object' && !Array.isArray(v)) || ('en' in v && 'he' in v)

// trip header
if (!trip.slug || !/^[a-z0-9-]+$/.test(trip.slug)) err(`trip.slug missing or not kebab-case: ${JSON.stringify(trip.slug)}`)
if (trip.startDate && !/^\d{4}-\d{2}-\d{2}$/.test(trip.startDate)) err(`trip.startDate not ISO YYYY-MM-DD: ${trip.startDate}`)
for (const f of ['title', 'subtitle', 'dates']) if (!bothLangs(trip[f])) err(`trip.${f} bilingual object missing en/he`)

const stopIds = new Set(STOPS.map(s => s.id))
const catKeys = new Set(Object.keys(CATEGORIES))

// stops
STOPS.forEach(s => {
  if (!s.id) err(`STOP missing id: ${JSON.stringify(s)}`)
  if (!isLatLng(s.coords)) err(`STOP ${s.id} coords not valid [lat,lng]: ${JSON.stringify(s.coords)}`)
})

// categories have an image fallback
catKeys.forEach(k => { if (!CATEGORY_IMAGES[k]) warn(`CATEGORY_IMAGES missing entry for "${k}"`) })

// spots
const spotIds = new Set()
SPOTS.forEach(sp => {
  if (spotIds.has(sp.id)) err(`duplicate SPOT id ${sp.id}`)
  spotIds.add(sp.id)
  if (!catKeys.has(sp.cat)) err(`SPOT ${sp.id} (${JSON.stringify(sp.name)}) has unknown cat "${sp.cat}"`)
  if (!stopIds.has(sp.stop)) err(`SPOT ${sp.id} references unknown stop "${sp.stop}"`)
  if (!isLatLng(sp.coords)) err(`SPOT ${sp.id} coords not valid [lat,lng]: ${JSON.stringify(sp.coords)}`)
  for (const f of ['name', 'note', 'desc']) if (!bothLangs(sp[f])) err(`SPOT ${sp.id} field ${f} bilingual object missing en/he`)
})

// hotels
Object.entries(HOTELS).forEach(([key, h]) => {
  if (!stopIds.has(key)) warn(`HOTEL key "${key}" has no matching STOP id`)
  if (h.coords && !isLatLng(h.coords)) err(`HOTEL ${key} coords not valid [lat,lng]`)
})

// days
const days = trip.days || []
days.forEach((d, i) => {
  if (d.id !== i + 1) err(`day at index ${i} has id ${d.id}, expected ${i + 1} (ids must be contiguous from 1)`)
  if (d.stopId != null && !stopIds.has(d.stopId)) err(`day ${d.id} stopId "${d.stopId}" not a STOP id`)
  if (d.hotelId != null && !HOTELS[d.hotelId]) err(`day ${d.id} hotelId "${d.hotelId}" not a HOTEL key`)
  if (!bothLangs(d.summary)) err(`day ${d.id} summary bilingual object missing en/he`)
})
if (days.length) {
  if (!days[0].arrival) warn('first day has no `arrival` block')
  if (!days[days.length - 1].departure) warn('last day has no `departure` block')
}

async function checkImages() {
  const urls = new Set()
  STOPS.forEach(s => s.image && urls.add(s.image))
  SPOTS.forEach(s => s.image && urls.add(s.image))
  Object.values(CATEGORY_IMAGES).forEach(u => urls.add(u))
  if (trip.heroImage) urls.add(trip.heroImage)
  await Promise.all([...urls].map(async u => {
    try {
      const r = await fetch(u, { method: 'HEAD' })
      if (!r.ok) err(`image ${r.status}: ${u}`)
    } catch { err(`image unreachable: ${u}`) }
  }))
}

const run = async () => {
  if (process.argv.includes('--images')) { console.log('Checking image URLs…'); await checkImages() }
  warns.forEach(w => console.warn('⚠️  ' + w))
  if (errors.length) {
    errors.forEach(e => console.error('❌ ' + e))
    console.error(`\n${errors.length} error(s). tripData.js is NOT schema-valid.`)
    process.exit(1)
  }
  console.log(`✅ tripData.js is schema-valid (${SPOTS.length} spots, ${STOPS.length} stops, ${days.length} days${warns.length ? `, ${warns.length} warning(s)` : ''}).`)
}
run()
