import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { trip, STOPS, SPOTS, CATEGORIES, HOTELS } from '../tripData'
import { useLang } from '../LangContext'
import { translations, categoryTranslations, daySummaries } from '../i18n'
import DayMap from '../components/DayMap'
import './DayDetail.css'

function TabSummary({ day }) {
  const { lang } = useLang()
  const summary = daySummaries[lang][day.id] || day.summary
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

function TabAttractions({ day, selectedSpotId, onSpotSelect }) {
  const { lang } = useLang()
  const t = translations[lang]
  const catT = categoryTranslations[lang]
  const stop = STOPS.find(s => s.id === day.stopId)
  const spots = stop ? SPOTS.filter(s => s.stop === stop.id) : []
  const byCategory = {}
  spots.forEach(s => {
    if (!byCategory[s.cat]) byCategory[s.cat] = []
    byCategory[s.cat].push(s)
  })

  if (spots.length === 0) return <div className="tab-content empty-state">{t.noAttractions}</div>

  return (
    <div className="tab-content">
      {Object.entries(byCategory).map(([catKey, catSpots]) => {
        const cat = CATEGORIES[catKey]
        return (
          <div key={catKey} className="cat-section">
            <div className="cat-heading" style={{ color: cat.color }}>{cat.emoji} {catT[catKey]}</div>
            {catSpots.map(spot => (
              <div
                key={spot.id}
                className={`spot-row ${selectedSpotId === spot.id ? 'selected' : ''}`}
                onClick={() => onSpotSelect(spot.id === selectedSpotId ? null : spot.id)}
                style={{ '--cat-color': cat.color }}
              >
                <div className="spot-dot" style={{ background: cat.color }}>{cat.emoji}</div>
                <div className="spot-info">
                  <div className="spot-name">{spot.name}</div>
                  {spot.note && <div className="spot-note">{spot.note}</div>}
                </div>
                <span className="spot-pin">📍</span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function TabAdmin({ day }) {
  const { lang } = useLang()
  const t = translations[lang]
  const hotel = day.hotelId ? HOTELS[day.hotelId] : null

  return (
    <div className="tab-content">
      {day.arrival && (
        <div className="admin-section">
          <div className="admin-section-title">{t.arrival}</div>
          <div className="res-row">
            <span className="res-ico">✈️</span>
            <div className="res-info">
              <div className="res-name">{t.flightLabel} {day.arrival.flight} · {t.elal}</div>
              <div className="res-meta">TLV → BUH · Thu Aug 6 · lands {day.arrival.lands}</div>
              <div className="res-meta">{t.bookingRef} 7IGKV6</div>
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
              <div className="res-name">{t.flightLabel} {day.departure.flight} · {t.elal}</div>
              <div className="res-meta">BUH → TLV · Sun Aug 16 · departs {day.departure.departs}</div>
              <div className="res-meta">{t.bookingRef} 7ILXY6</div>
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

export default function DayDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { lang } = useLang()
  const t = translations[lang]
  const day = trip.days.find(d => d.id === parseInt(id))
  const [activeTab, setActiveTab] = useState('summary')
  const [selectedSpot, setSelectedSpot] = useState(null)

  const TABS = [
    { id: 'summary',     label: t.tabSummary },
    { id: 'attractions', label: t.tabAttractions },
    { id: 'admin',       label: t.tabAdmin },
  ]

  if (!day) return <div style={{ padding: 20 }}>{t.dayNotFound}</div>

  const isTravel = day.type === 'travel'
  const stop = STOPS.find(s => s.id === day.stopId)

  return (
    <div className="day-detail">
      <div className="detail-map">
        <DayMap day={day} selectedSpotId={selectedSpot} onSpotClick={setSelectedSpot} />
        <button className="back-btn" onClick={() => navigate('/')}>{t.back}</button>
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

      <div className="bottom-sheet">
        <div className="sheet-handle" />
        <div className="tab-bar">
          {TABS.map(tab => (
            <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="sheet-scroll">
          {activeTab === 'summary'     && <TabSummary day={day} />}
          {activeTab === 'attractions' && <TabAttractions day={day} selectedSpotId={selectedSpot} onSpotSelect={setSelectedSpot} />}
          {activeTab === 'admin'       && <TabAdmin day={day} />}
        </div>
      </div>
    </div>
  )
}
