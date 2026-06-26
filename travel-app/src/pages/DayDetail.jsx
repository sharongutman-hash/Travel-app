import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { trip, STOPS, SPOTS, CATEGORIES, HOTELS } from '../tripData'
import DayMap from '../components/DayMap'
import './DayDetail.css'

function TabSummary({ day }) {
  return (
    <div className="tab-content">
      <div className="summary-text">{day.summary}</div>
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
  const stop = STOPS.find(s => s.id === day.stopId)
  const spots = stop ? SPOTS.filter(s => s.stop === stop.id) : []
  const byCategory = {}
  spots.forEach(s => {
    if (!byCategory[s.cat]) byCategory[s.cat] = []
    byCategory[s.cat].push(s)
  })

  if (spots.length === 0) return <div className="tab-content empty-state">No attractions for this day.</div>

  return (
    <div className="tab-content">
      {Object.entries(byCategory).map(([catKey, catSpots]) => {
        const cat = CATEGORIES[catKey]
        return (
          <div key={catKey} className="cat-section">
            <div className="cat-heading" style={{ color: cat.color }}>{cat.emoji} {cat.label}</div>
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
  const hotel = day.hotelId ? HOTELS[day.hotelId] : null

  return (
    <div className="tab-content">
      {/* Arrival (Day 1) */}
      {day.arrival && (
        <div className="admin-section">
          <div className="admin-section-title">Arrival</div>
          <div className="res-row">
            <span className="res-ico">✈️</span>
            <div className="res-info">
              <div className="res-name">Flight {day.arrival.flight} · EL AL</div>
              <div className="res-meta">TLV → BUH · Thu Aug 6 · lands {day.arrival.lands}</div>
              <div className="res-meta">Booking ref: 7IGKV6</div>
            </div>
            <span className="res-status confirmed">✓ Confirmed</span>
          </div>
          <div className="res-row">
            <span className="res-ico">🚗</span>
            <div className="res-info">
              <div className="res-name">Car pickup · Bucharest OTP</div>
              <div className="res-meta">Pick up at {day.arrival.carPickup}</div>
            </div>
            <span className="res-status confirmed">✓ Confirmed</span>
          </div>
        </div>
      )}

      {/* Departure (Day 11) */}
      {day.departure && (
        <div className="admin-section">
          <div className="admin-section-title">Departure</div>
          <div className="res-row">
            <span className="res-ico">🚗</span>
            <div className="res-info">
              <div className="res-name">Return car · Bucharest OTP</div>
              <div className="res-meta">Return by {day.departure.carReturn}</div>
            </div>
            <span className="res-status confirmed">✓ Confirmed</span>
          </div>
          <div className="res-row">
            <span className="res-ico">✈️</span>
            <div className="res-info">
              <div className="res-name">Flight {day.departure.flight} · EL AL</div>
              <div className="res-meta">BUH → TLV · Sun Aug 16 · departs {day.departure.departs}</div>
              <div className="res-meta">Booking ref: 7ILXY6</div>
            </div>
            <span className="res-status confirmed">✓ Confirmed</span>
          </div>
        </div>
      )}

      {/* Hotel */}
      {hotel && (
        <div className="admin-section">
          <div className="admin-section-title">Hotel</div>
          <div className="res-row hotel-row-full">
            <span className="res-ico">🏨</span>
            <div className="res-info">
              <div className="res-name">{hotel.name}</div>
              <div className="res-meta">{hotel.dates} · {hotel.nights} night{hotel.nights > 1 ? 's' : ''} · {hotel.rooms} rooms · <strong>{hotel.price}</strong></div>
              {hotel.about && <div className="res-about">{hotel.about}</div>}
              <div className="res-contacts">
                {hotel.phone    && <a href={`tel:${hotel.phone}`}    className="res-contact-btn">📞 {hotel.phone}</a>}
                {hotel.email    && <a href={`mailto:${hotel.email}`} className="res-contact-btn">✉️ {hotel.email}</a>}
                {hotel.website  && <a href={hotel.website} target="_blank" rel="noreferrer" className="res-contact-btn">🌐 Website</a>}
                {hotel.mapsUrl  && <a href={hotel.mapsUrl} target="_blank" rel="noreferrer" className="res-contact-btn">📍 Google Maps</a>}
              </div>
              {hotel.address && <div className="res-address">📬 {hotel.address}</div>}
              {hotel.note    && <div className="res-note">ℹ️ {hotel.note}</div>}
            </div>
            <span className={`res-status ${hotel.cancellation === 'No refund' ? 'no-refund' : 'free-cancel'}`}>
              {hotel.cancellation === 'No refund' ? '⚠ No refund' : '✓ Free cancel'}
            </span>
          </div>
        </div>
      )}

      {!day.arrival && !day.departure && !hotel && (
        <div className="empty-state">No reservations for this day.</div>
      )}
    </div>
  )
}

const TABS = [
  { id: 'summary',     label: '📋 Summary' },
  { id: 'attractions', label: '📍 Attractions' },
  { id: 'admin',       label: '🗂 Admin' },
]

export default function DayDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const day = trip.days.find(d => d.id === parseInt(id))
  const [activeTab, setActiveTab] = useState('summary')
  const [selectedSpot, setSelectedSpot] = useState(null)

  if (!day) return <div style={{ padding: 20 }}>Day not found</div>

  const isTravel = day.type === 'travel'
  const stop = STOPS.find(s => s.id === day.stopId)

  return (
    <div className="day-detail">
      <div className="detail-map">
        <DayMap day={day} selectedSpotId={selectedSpot} onSpotClick={setSelectedSpot} />
        <button className="back-btn" onClick={() => navigate('/')}>‹ Back</button>
        <div className="day-overlay">
          <div className="day-overlay-badge">Day {day.id}</div>
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
