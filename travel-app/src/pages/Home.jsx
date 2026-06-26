import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { trip, STOPS, HOTELS } from '../tripData'
import { useLang } from '../LangContext'
import { translations, tripTranslations } from '../i18n'
import RouteMap from '../components/RouteMap'
import './Home.css'

function DayCard({ day, onClick, active }) {
  const { lang } = useLang()
  const t = translations[lang]
  const isTravel = day.type === 'travel'
  const stop = STOPS.find(s => s.id === day.stopId)
  const hotel = day.hotelId ? HOTELS[day.hotelId] : null
  const hasAdmin = day.arrival || day.departure || hotel

  return (
    <div className={`day-card ${active ? 'active' : ''}`} onClick={onClick}>
      {stop?.image && (
        <div className="day-card-img" style={{ backgroundImage: `url(${stop.image})` }} />
      )}
      <div className="day-card-body">
        <div className="day-card-top">
          <span className="day-badge">{t.day} {day.id}</span>
          {hasAdmin && (
            <div className="day-admin-icons">
              {(day.arrival || day.departure) && <span title="Flight">✈️</span>}
              {(day.arrival || day.departure) && <span title="Car">🚗</span>}
              {hotel && <span title="Hotel">🏨</span>}
            </div>
          )}
        </div>
        <div className="day-card-title">
          {isTravel
            ? <>{day.from} <span className="arrow-icon">→</span> {day.to}</>
            : stop?.shortName || day.location}
        </div>
        <div className="day-card-meta">
          {day.date}
          {isTravel && day.drive && <> · {day.drive.duration} · {day.drive.distance}</>}
          {!isTravel && hotel && <> · {hotel.name}</>}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [mobileView, setMobileView] = useState('list')
  const [activeDay, setActiveDay] = useState(null)
  const navigate = useNavigate()
  const { lang } = useLang()
  const t = translations[lang]
  const tripT = tripTranslations[lang]

  function handleDayClick(day) {
    setActiveDay(day.id)
    navigate(`/day/${day.id}`)
  }

  return (
    <div className="home">
      {/* Hero */}
      <div className="hero" style={{ backgroundImage: `url(${trip.heroImage})` }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-flag">🇷🇴</div>
          <h1 className="hero-title">{tripT.title}</h1>
          <p className="hero-sub">{tripT.subtitle}</p>
          <div className="hero-stats">
            <span>{tripT.dates}</span>
            <span className="dot">·</span>
            <span>{trip.days.length} {t.days}</span>
            <span className="dot">·</span>
            <span>{trip.totalKm} {t.km}</span>
          </div>
        </div>
      </div>

      {/* Mobile toggle */}
      <div className="mobile-toggle">
        <button className={mobileView === 'list' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setMobileView('list')}>
          ☰ {t.list}
        </button>
        <button className={mobileView === 'map' ? 'toggle-btn active' : 'toggle-btn'} onClick={() => setMobileView('map')}>
          🗺 {t.map}
        </button>
      </div>

      <div className="home-body">
        <div className={`home-list-col ${mobileView === 'map' ? 'mobile-hidden' : ''}`}>
          <div className="days-list">
            {trip.days.map(day => (
              <DayCard
                key={day.id}
                day={day}
                active={activeDay === day.id}
                onClick={() => handleDayClick(day)}
              />
            ))}
          </div>
        </div>

        <div className={`home-map-col ${mobileView === 'list' ? 'mobile-hidden' : ''}`}>
          <div className="map-sticky">
            <RouteMap onStopClick={(stopId) => {
              const day = trip.days.find(d => d.stopId === stopId && d.type === 'travel')
              if (day) handleDayClick(day)
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}
