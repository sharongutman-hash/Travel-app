import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTrip } from '../TripContext'
import { useLang } from '../LangContext'
import { pick } from '../i18n'
import RouteMap from '../components/RouteMap'
import './Home.css'

const strings = {
  en: { upcoming: 'Upcoming', today: 'Today', depart: 'Depart', bookingId: 'Booking ID', direct: 'Direct', daysTrip: 'Days Trip', viewList: 'View List', viewCards: 'View Cards', viewDay: 'View day', stay: 'Stay', daysWord: 'days trip', dayOf: 'Day {n} of {t}', completed: 'Completed', tripRecap: 'Trip recap', viewTrip: 'View trip' },
  he: { upcoming: 'הקרוב', today: 'היום', depart: 'יציאה', bookingId: 'מספר הזמנה', direct: 'ישיר', daysTrip: 'ימי הטיול', viewList: 'הצג רשימה', viewCards: 'הצג כרטיסים', viewDay: 'צפה ביום', stay: 'שהייה', daysWord: 'ימי טיול', dayOf: 'יום {n} מתוך {t}', completed: 'הסתיים', tripRecap: 'סיכום הטיול', viewTrip: 'צפה בטיול' },
}

// Day N maps to trip.startDate + (N-1) days. startDate is an ISO "YYYY-MM-DD";
// parse its parts so the Date is built in local time (avoids UTC day-shift).
function dateForDay(trip, day) {
  const [y, m, d] = trip.startDate.split('-').map(Number)
  return new Date(y, m - 1, d + (day.id - 1))
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
function shortStop(stops, name) {
  const st = stops.find(s => s.name === name || s.shortName === name)
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
      <div className="glance-info">{f.number}{f.airline ? ` · ${f.airline}` : ''} · {s.direct}</div>
      <div className="glance-divider" />
      <div className="glance-foot">
        <span>{s.bookingId}</span>
        <span className="glance-ref">{f.bookingRef}</span>
      </div>
    </button>
  )
}

function CurrentDayGlance({ day, total, s, onClick }) {
  const { STOPS, HOTELS } = useTrip()
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
            <div className="g-code">{shortStop(STOPS, day.from)}</div>
            <div className="g-time">{s.depart}</div>
          </div>
          <span className="g-ico">🚗</span>
          <div className="g-mid">
            <div className="g-line" />
            <div className="g-dur">{day.drive.duration}</div>
          </div>
          <span className="g-ico">📍</span>
          <div className="g-loc g-loc-r">
            <div className="g-code">{shortStop(STOPS, day.to)}</div>
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

// Compact full-width row used by the vertical agenda ("View List") mode.
function AgendaRow({ day, s, onClick }) {
  const { STOPS } = useTrip()
  const stop = STOPS.find(st => st.id === day.stopId)
  const title = day.type === 'travel' ? `${day.from} → ${day.to}` : (stop?.shortName || day.location)
  const meta = day.type === 'travel' && day.drive
    ? `${day.date} · ${day.drive.distance}`
    : `${day.date} · ${s.stay}`
  return (
    <button className="agenda-row" onClick={onClick}>
      <span className="agenda-daynum">{day.id}</span>
      <div className="agenda-body">
        <div className="agenda-title">{title}</div>
        <div className="agenda-meta">{meta}</div>
      </div>
      <span className="agenda-caret">›</span>
    </button>
  )
}

function DayCard({ day, s, onClick }) {
  const { STOPS } = useTrip()
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

// Shown once the trip is over: a recap entry point instead of a stale "upcoming".
function FinishedGlance({ s, total, onClick }) {
  const { trip } = useTrip()
  const { lang } = useLang()
  return (
    <button className="glance" onClick={onClick}>
      <div className="glance-top">
        <span className="glance-badge glance-badge-done">{s.completed}</span>
        <span className="glance-date">{pick(trip.dates, lang)}</span>
      </div>
      <div className="glance-stay">
        <div className="glance-stay-title">🎉 {s.tripRecap}</div>
        <div className="glance-stay-sub">{total} {s.daysWord}</div>
      </div>
      <div className="glance-divider" />
      <div className="glance-foot">
        <span>{s.viewTrip}</span>
        <span className="glance-ref">›</span>
      </div>
    </button>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { tripId } = useParams()
  const { trip } = useTrip()
  const { lang } = useLang()
  const s = strings[lang]
  const f = trip.flight?.outbound
  const [listView, setListView] = useState(false)

  function goToDay(day) {
    navigate(`/trip/${tripId}/day/${day.id}`)
  }

  // Once the trip has started, the coming card shows today's day; before that
  // it shows the upcoming outbound flight.
  const now = new Date()
  const todayKey = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const currentDay = trip.startDate
    ? trip.days.find(d => dateForDay(trip, d).getTime() === todayKey)
    : null
  const lastDay = trip.days[trip.days.length - 1]
  const tripEnded = trip.startDate && !currentDay && dateForDay(trip, lastDay).getTime() < todayKey

  return (
    <div className="home">
      <div className="trip-hero" style={{ backgroundImage: `url(${trip.heroImage})` }}>
        <div className="trip-hero-overlay" />
        <div className="trip-hero-content">
          <button className="trip-back" onClick={() => navigate('/')}>{lang === 'he' ? 'כל הטיולים ›' : '‹ All trips'}</button>
          <h1 className="trip-title">{pick(trip.title, lang).split(' ')[0]}</h1>
          <span className="trip-badge">{trip.days.length} {s.daysWord}</span>
        </div>
      </div>

      <div className="trip-stage">
        {currentDay
          ? <CurrentDayGlance day={currentDay} total={trip.days.length} s={s} onClick={() => goToDay(currentDay)} />
          : tripEnded
            ? <FinishedGlance s={s} total={trip.days.length} onClick={() => goToDay(trip.days[0])} />
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
          <button className="days-viewlist" onClick={() => setListView(v => !v)}>
            {listView ? s.viewCards : s.viewList}
          </button>
        </div>
        {listView ? (
          <div className="days-list">
            {trip.days.map(day => (
              <AgendaRow key={day.id} day={day} s={s} onClick={() => goToDay(day)} />
            ))}
          </div>
        ) : (
          <div className="days-scroll">
            {trip.days.map(day => (
              <DayCard key={day.id} day={day} s={s} onClick={() => goToDay(day)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
