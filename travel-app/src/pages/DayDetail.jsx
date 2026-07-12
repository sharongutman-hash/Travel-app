import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTrip } from '../TripContext'
import { useHotelDistances } from '../hooks/useRoute'
import { useLang } from '../LangContext'
import { translations, categoryTranslations, pick } from '../i18n'
import DayMap from '../components/DayMap'
import { CategoryFilter } from '../components/MapControls'
import './DayDetail.css'

// Wikimedia thumbnails look like .../thumb/a/ab/File.jpg/960px-File.jpg — strip
// /thumb/ and the trailing size segment to get the full-resolution original.
function fullRes(src) {
  if (!src) return src
  const m = src.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+)\/thumb\/(.+)\/[^/]+$/)
  return m ? `${m[1]}/${m[2]}` : src
}

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 899px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 899px)')
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return m
}

function TabSummary({ day }) {
  const { lang } = useLang()
  const summary = pick(day.summary, lang)
  return (
    <div className="tab-content">
      <div className="summary-text">{summary}</div>
      {day.type === 'travel' && day.drive && (
        <div className="drive-card">
          <span className="drive-emoji">🚗</span>
          <div>
            <div className="drive-main">{day.drive.duration} · {day.drive.distance}</div>
            <div className="drive-route">{day.drive.route}</div>
          </div>
        </div>
      )}
    </div>
  )
}

function TabAttractions({ day, selectedSpotId, onSpotSelect, activeCats }) {
  const { trip, STOPS, SPOTS, HOTELS, CATEGORIES, CATEGORY_IMAGES } = useTrip()
  const { lang } = useLang()
  const t = translations[lang]
  const catT = categoryTranslations[lang]
  const stop = STOPS.find(s => s.id === day.stopId)
  const allSpots = stop ? SPOTS.filter(s => s.stop === stop.id) : []
  const spots = allSpots.filter(s => activeCats.size === 0 || activeCats.has(s.cat))

  const hotel = day.hotelId ? HOTELS[day.hotelId] : null
  const origin = hotel?.coords || stop?.coords || null
  const distances = useHotelDistances(origin, spots)

  const cardRefs = useRef({})
  // When a spot is selected (often from the map), scroll its card into view.
  useEffect(() => {
    if (selectedSpotId && cardRefs.current[selectedSpotId]) {
      cardRefs.current[selectedSpotId].scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedSpotId])

  const byCategory = {}
  spots.forEach(s => {
    if (!byCategory[s.cat]) byCategory[s.cat] = []
    byCategory[s.cat].push(s)
  })

  if (allSpots.length === 0) return <div className="tab-content empty-state">{t.noAttractions}</div>
  if (spots.length === 0) return <div className="tab-content empty-state">{t.noAttractions}</div>

  return (
    <div className="tab-content">
      {Object.entries(byCategory).map(([catKey, catSpots]) => {
        const cat = CATEGORIES[catKey]
        return (
          <div key={catKey} className="cat-section">
            <div className="cat-heading" style={{ color: cat.color }}>{cat.emoji} {catT[catKey] ?? cat.label}</div>
            {catSpots.map(spot => {
              const selected = selectedSpotId === spot.id
              const d = distances[spot.id]
              const distLabel = d
                ? (d.durationMin != null
                    ? `${d.distanceKm} ${t.km} · ${d.durationMin} min`
                    : `≈${d.distanceKm} ${t.km}`)
                : null
              const img = spot.image || CATEGORY_IMAGES[spot.cat]
              const dirUrl = origin
                ? `https://www.google.com/maps/dir/?api=1&origin=${origin[0]},${origin[1]}&destination=${spot.coords[0]},${spot.coords[1]}&travelmode=driving`
                : `https://www.google.com/maps/search/?api=1&query=${spot.coords[0]},${spot.coords[1]}`
              return (
                <div
                  key={spot.id}
                  ref={el => { cardRefs.current[spot.id] = el }}
                  className={`spot-card ${selected ? 'selected' : ''}`}
                  style={{ '--cat-color': cat.color }}
                >
                  <button
                    className="spot-row"
                    onClick={() => onSpotSelect(selected ? null : spot.id)}
                    aria-expanded={selected}
                  >
                    <span className="spot-dot" style={{ background: cat.color }} aria-hidden="true">{cat.emoji}</span>
                    <span className="spot-info">
                      <span className="spot-name">{pick(spot.name, lang)}</span>
                      {spot.note && <span className="spot-note">{pick(spot.note, lang)}</span>}
                      <span className="spot-meta">
                        {distLabel && (
                          <span className={`spot-chip ${d.straight ? 'loading' : ''}`} title={d.straight ? t.aerialDist : ''}>
                            🏨 {distLabel} {t.fromHotel}
                          </span>
                        )}
                        {spot.duration && <span className="spot-chip">⏱ {spot.duration}</span>}
                      </span>
                    </span>
                    <span className={`spot-caret ${selected ? 'open' : ''}`} aria-hidden="true">⌄</span>
                  </button>
                  {selected && (
                    <div className="spot-detail">
                      <a
                        className="spot-img-link"
                        href={fullRes(img)}
                        target="_blank"
                        rel="noreferrer"
                        title={t.enlarge}
                      >
                        <img
                          className="spot-img"
                          src={img}
                          alt={pick(spot.name, lang)}
                          loading="lazy"
                          onError={e => { const fb = CATEGORY_IMAGES[spot.cat]; if (e.currentTarget.src !== fb) e.currentTarget.src = fb }}
                        />
                        <span className="spot-img-zoom">⤢</span>
                      </a>
                      {spot.desc && <p className="spot-desc">{pick(spot.desc, lang)}</p>}
                      <div className="spot-actions">
                        <a href={dirUrl} target="_blank" rel="noreferrer" className="spot-action-btn">{t.directions}</a>
                        <a
                          href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(pick(spot.name, lang) + (trip.country ? ' ' + trip.country : ''))}`}
                          target="_blank" rel="noreferrer"
                          className="spot-action-btn ghost"
                        >{t.photos}</a>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function TabAdmin({ day }) {
  const { trip, HOTELS } = useTrip()
  const { lang } = useLang()
  const t = translations[lang]
  const hotel = day.hotelId ? HOTELS[day.hotelId] : null
  const outbound = trip.flight?.outbound
  const ret = trip.flight?.return

  return (
    <div className="tab-content">
      {day.arrival && (
        <div className="admin-section">
          <div className="admin-section-title">{t.arrival}</div>
          <div className="res-row">
            <span className="res-ico">✈️</span>
            <div className="res-info">
              <div className="res-name">{t.flightLabel} {outbound.number}{outbound.airline ? ` · ${outbound.airline}` : ''}</div>
              <div className="res-meta">{outbound.from} → {outbound.to} · {outbound.date} · {t.lands} {outbound.arrives}</div>
              {outbound.bookingRef && <div className="res-meta">{t.bookingRef} {outbound.bookingRef}</div>}
            </div>
            <span className="res-status confirmed">{t.confirmed}</span>
          </div>
          <div className="res-row">
            <span className="res-ico">🚗</span>
            <div className="res-info">
              <div className="res-name">{t.carPickup}</div>
              <div className="res-meta">{t.pickUpAt} {day.arrival.carPickup}</div>
            </div>
            <span className="res-status confirmed">{t.confirmed}</span>
          </div>
        </div>
      )}

      {day.departure && (
        <div className="admin-section">
          <div className="admin-section-title">{t.departure}</div>
          <div className="res-row">
            <span className="res-ico">🚗</span>
            <div className="res-info">
              <div className="res-name">{t.carReturn}</div>
              <div className="res-meta">{t.returnBy} {day.departure.carReturn}</div>
            </div>
            <span className="res-status confirmed">{t.confirmed}</span>
          </div>
          <div className="res-row">
            <span className="res-ico">✈️</span>
            <div className="res-info">
              <div className="res-name">{t.flightLabel} {ret.number}{ret.airline ? ` · ${ret.airline}` : ''}</div>
              <div className="res-meta">{ret.from} → {ret.to} · {ret.date} · {t.departs} {ret.departs}</div>
              {ret.bookingRef && <div className="res-meta">{t.bookingRef} {ret.bookingRef}</div>}
            </div>
            <span className="res-status confirmed">{t.confirmed}</span>
          </div>
        </div>
      )}

      {hotel && (
        <div className="admin-section">
          <div className="admin-section-title">{t.hotel}</div>
          <div className="res-row hotel-row-full">
            <span className="res-ico">🏨</span>
            <div className="res-info">
              <div className="res-name">{hotel.name}</div>
              <div className="res-meta">{hotel.dates} · {hotel.nights} {hotel.nights > 1 ? t.nights : t.night} · {hotel.rooms} {t.rooms} · <strong>{hotel.price}</strong></div>
              {hotel.about && <div className="res-about">{hotel.about}</div>}
              <div className="res-contacts">
                {hotel.phone   && <a href={`tel:${hotel.phone}`}    className="res-contact-btn">📞 {hotel.phone}</a>}
                {hotel.email   && <a href={`mailto:${hotel.email}`} className="res-contact-btn">✉️ {hotel.email}</a>}
                {hotel.website && <a href={hotel.website} target="_blank" rel="noreferrer" className="res-contact-btn">{t.website}</a>}
                {hotel.mapsUrl && <a href={hotel.mapsUrl} target="_blank" rel="noreferrer" className="res-contact-btn">{t.googleMaps}</a>}
              </div>
              {hotel.address && <div className="res-address">📬 {hotel.address}</div>}
              {hotel.note    && <div className="res-note">ℹ️ {hotel.note}</div>}
            </div>
            <span className={`res-status ${hotel.cancellation === 'No refund' ? 'no-refund' : 'free-cancel'}`}>
              {hotel.cancellation === 'No refund' ? t.noRefund : t.freeCancel}
            </span>
          </div>
        </div>
      )}

      {!day.arrival && !day.departure && !hotel && (
        <div className="empty-state">{t.noReservations}</div>
      )}
    </div>
  )
}

const SNAPS = [18, 48, 88]
function nearestSnap(v) { return SNAPS.reduce((a, b) => Math.abs(b - v) < Math.abs(a - v) ? b : a) }

export default function DayDetail() {
  const { tripId, dayId } = useParams()
  const navigate = useNavigate()
  const { trip, STOPS, SPOTS, CATEGORIES } = useTrip()
  const { lang } = useLang()
  const t = translations[lang]
  const day = trip.days.find(d => d.id === parseInt(dayId))
  const [activeTab, setActiveTab] = useState('summary')
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [activeCats, setActiveCats] = useState(new Set())
  const [sheetVh, setSheetVh] = useState(48)
  const [dragging, setDragging] = useState(false)
  const isMobile = useIsMobile()
  const scrollRef = useRef(null)
  const scrollMem = useRef({})

  // Restore each tab's scroll position when it becomes active (kept above the
  // early returns so hook order stays stable).
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollMem.current[activeTab] || 0
  }, [activeTab])

  const TABS = [
    { id: 'summary',     label: t.tabSummary },
    { id: 'attractions', label: t.tabAttractions },
    { id: 'admin',       label: t.tabAdmin },
  ]

  if (!day) return <div style={{ padding: 20 }}>{t.dayNotFound}</div>

  const isTravel = day.type === 'travel'
  const stop = STOPS.find(s => s.id === day.stopId)
  const dayCats = stop
    ? Object.keys(CATEGORIES).filter(k => SPOTS.some(s => s.stop === stop.id && s.cat === k))
    : []
  const activeIdx = TABS.findIndex(tb => tb.id === activeTab)

  function selectSpot(id) {
    setSelectedSpot(id)
    if (id) setActiveTab('attractions')
  }
  function toggleCat(key) {
    setActiveCats(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }
  function switchTab(id) {
    if (scrollRef.current) scrollMem.current[activeTab] = scrollRef.current.scrollTop
    setActiveTab(id)
  }
  function onHandleDown(e) {
    if (!isMobile) return
    const startY = e.clientY
    const startVh = sheetVh
    let moved = 0
    setDragging(true)
    function move(ev) {
      const dy = startY - ev.clientY
      moved = Math.max(moved, Math.abs(dy))
      const vh = Math.min(90, Math.max(14, startVh + (dy / window.innerHeight) * 100))
      setSheetVh(vh)
    }
    function up() {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      setDragging(false)
      if (moved < 6) {
        // treated as a tap → advance to the next snap point
        setSheetVh(v => SNAPS[(SNAPS.indexOf(nearestSnap(v)) + 1) % SNAPS.length])
      } else {
        setSheetVh(v => nearestSnap(v))
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const sheetStyle = isMobile ? { height: `${sheetVh}vh` } : undefined

  return (
    <div className="day-detail">
      <div className="detail-map">
        <DayMap day={day} selectedSpotId={selectedSpot} onSpotClick={selectSpot} activeCats={activeCats} />
        <button className="back-btn" onClick={() => navigate(`/trip/${tripId}`)}>{t.back}</button>
        {dayCats.length > 1 && (
          <CategoryFilter cats={dayCats} active={activeCats} onToggle={toggleCat} />
        )}
        <div className="day-overlay">
          <div className="day-overlay-badge">{t.day} {day.id}</div>
          <div className="day-overlay-title">
            {isTravel
              ? <>{day.from} <span style={{ color: '#1469F5' }}>→</span> {day.to}</>
              : stop?.shortName || day.location}
          </div>
          <div className="day-overlay-date">{day.date}</div>
        </div>
      </div>

      <div className={`bottom-sheet ${dragging ? 'dragging' : ''}`} style={sheetStyle}>
        <div className="sheet-handle-hit" onPointerDown={onHandleDown}>
          <div className="sheet-handle" />
        </div>
        <div className="tab-bar">
          {TABS.map(tab => (
            <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => switchTab(tab.id)}>
              {tab.label}
            </button>
          ))}
          <span className="tab-indicator" style={{ width: `${100 / TABS.length}%`, transform: `translateX(${activeIdx * 100}%)` }} />
        </div>
        <div className="sheet-scroll" ref={scrollRef}>
          <div className="tab-fade" key={activeTab}>
            {activeTab === 'summary'     && <TabSummary day={day} />}
            {activeTab === 'attractions' && <TabAttractions day={day} selectedSpotId={selectedSpot} onSpotSelect={setSelectedSpot} activeCats={activeCats} />}
            {activeTab === 'admin'       && <TabAdmin day={day} />}
          </div>
        </div>
      </div>
    </div>
  )
}
