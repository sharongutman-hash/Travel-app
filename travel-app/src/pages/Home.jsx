import { useNavigate } from 'react-router-dom'
import { trip, STOPS, HOTELS } from '../tripData'
import { useLang } from '../LangContext'
import { tripTranslations } from '../i18n'
import RouteMap from '../components/RouteMap'
import './Home.css'

const strings = {
  en: { upcoming: 'Upcoming', today: 'Today', depart: 'Depart', bookingId: 'Booking ID', direct: 'Direct', daysTrip: 'Days Trip', viewList: 'View List', viewDay: 'View day', stay: 'Stay', daysWord: 'days trip', dayOf: 'Day {n} of {t}' },
  he: { upcoming: 'הקרוב', today: 'היום', depart: 'יציאה', bookingId: 'מספר הזמנה', direct: 'ישיר', daysTrip: 'ימי הטיול', viewList: 'הצג רשימה', viewDay: 'צפה ביום', stay: 'שהייה', daysWord: 'ימי טיול', dayOf: 'יום {n} מתוך {t}' },
}

// The trip runs Aug 6–16, 2026; day N maps to Aug (5 + N).
const TRIP_YEAR = 2026
const TRIP_MONTH = 7 // August (0-indexed)
const TRIP_START_DAY = 6
function dateForDay(day) {
  return new Date(TRIP_YEAR, TRIP_MONTH, TRIP_START_DAY + (day.id - 1))
}

// Duration between two "HH:MM" times, e.g. 04:45 → 07:25 = "2h 40m".
function flightDuration(dep, arr) {
  const [dh, dm] = dep.split(':').map(Number)
  const [ah, am] = arr.split(':').map(Number)
  let mins = (ah * 60 + am) - (dh * 60 + dm)
  if (mins < 0) mins += 1440
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

// Resolve a day's from/to string to a short place label via the stops list.
function shortStop(name) {
  const st = STOPS.find(s => s.name === name || s.shortName === name)
  return st ? st.shortName : name.split(' (')[0].split(' / ')[0]
}

function FlightGlance({ f, s, onClick }) {
  return (
    <button className="glance" onClick={onClick}>
      <div className="glance-top">
        <span className="glance-badge">{s.upcoming}</span>
        <span className="glance-date">{f.date}</span>
      </div>
      <div className="glance-route">
        <div className="g-loc">
          <div className="g-code">{f.from}</div>
          <div className="g-time">{f.departs}</div>
        </div>
        <span className="g-ico">🛫</span>
        <div className="g-mid">
          <div className="g-line" />
          <div className="g-dur">{flightDuration(f.departs, f.arrives)}</div>
        </div>
        <span className="g-ico">🛬</span>
        <div className="g-loc g-loc-r">
          <div className="g-code">{f.to}</div>
          <div className="g-time">{f.arrives}</div>
        </div>
      </div>
      <div className="glance-info">{f.number} · EL AL · {s.direct}</div>
      <div className="glance-divider" />
      <div className="glance-foot">
        <span>{s.bookingId}</span>
        <span className="glance-ref">{f.bookingRef}</span>
      </div>
    </button>
  )
}

function CurrentDayGlance({ day, total, s, onClick }) {
  const stop = STOPS.find(st => st.id === day.stopId)
  const hotel = day.hotelId ? HOTELS[day.hotelId] : null
  const isTravel = day.type === 'travel' && day.drive
  return (
    <button className="glance" onClick={onClick}>
      <div className="glance-top">
        <span className="glance-badge glance-badge-today">{s.today}</span>
        <span className="glance-date">{day.date}</span>
      </div>
      {isTravel ? (
        <div className="glance-route">
          <div className="g-loc">
            <div className="g-code">{shortStop(day.from)}</div>
            <div className="g-time">{s.depart}</div>
          </div>
          <span className="g-ico">🚗</span>
          <div className="g-mid">
            <div className="g-line" />
            <div className="g-dur">{day.drive.duration}</div>
          </div>
          <span className="g-ico">📍</span>
          <div className="g-loc g-loc-r">
            <div className="g-code">{shortStop(day.to)}</div>
            <div className="g-time">{day.drive.distance}</div>
          </div>
        </div>
      ) : (
        <div className="glance-stay">
          <div className="glance-stay-title">{stop?.shortName || day.location}</div>
          {hotel && <div className="glance-stay-sub">🏨 {hotel.name}</div>}
        </div>
      )}
      <div className="glance-info">{s.dayOf.replace('{n}', day.id).replace('{t}', total)}</div>
      <div className="glance-divider" />
      <div className="glance-foot">
        <span>{s.viewDay}</span>
        <span className="glance-ref">›</span>
      </div>
    </button>
  )
}

function DayCard({ day, s, onClick }) {
  const stop = STOPS.find(st => st.id === day.stopId)
  const title = day.type === 'travel' ? `${day.from} → ${day.to}` : (stop?.shortName || day.location)
  const meta = day.type === 'travel' && day.drive
    ? `${day.date} · ${day.drive.distance}`
    : `${day.date} · ${s.stay}`
  return (
    <button className="day-card2" onClick={onClick}>
      <div className="day-card2-img" style={{ backgroundImage: `url(${stop?.image})` }}>
        <span className="day-badge2">Day {day.id}</span>
      </div>
      <div className="day-card2-body">
        <div className="day-card2-title">{title}</div>
        <div className="day-card2-meta">{meta}</div>
      </div>
    </button>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const s = strings[lang]
  const tripT = tripTranslations[lang]
  const f = trip.flight.outbound

  function goToDay(day) {
    navigate(`/day/${day.id}`)
  }

  // Once the trip has started, the coming card shows today's day; before that
  // it shows the upcoming outbound flight.
  const now = new Date()
  const todayKey = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const currentDay = trip.days.find(d => dateForDay(d).getTime() === todayKey)

  return (
    <div className="home">
      <div className="trip-hero" style={{ backgroundImage: `url(${trip.heroImage})` }}>
        <div className="trip-hero-overlay" />
        <div className="trip-hero-content">
          <button className="trip-back" onClick={() => navigate('/')}>{lang === 'he' ? 'כל הטיולים ›' : '‹ All trips'}</button>
          <h1 className="trip-title">{tripT.title.split(' ')[0]}</h1>
          <span className="trip-badge">{trip.days.length} {s.daysWord}</span>
        </div>
      </div>

      <div className="trip-stage">
        {currentDay
          ? <CurrentDayGlance day={currentDay} total={trip.days.length} s={s} onClick={() => goToDay(currentDay)} />
          : <FlightGlance f={f} s={s} onClick={() => goToDay(trip.days[0])} />}

        <div className="trip-map">
          <RouteMap onStopClick={(stopId) => {
            const day = trip.days.find(d => d.stopId === stopId)
            if (day) goToDay(day)
          }} />
        </div>
      </div>

      <div className="days-sec">
        <div className="days-head">
          <h2>{s.daysTrip}</h2>
          <button className="days-viewlist" onClick={() => goToDay(trip.days[0])}>{s.viewList}</button>
        </div>
        <div className="days-scroll">
          {trip.days.map(day => (
            <DayCard key={day.id} day={day} s={s} onClick={() => goToDay(day)} />
          ))}
        </div>
      </div>
    </div>
  )
}
