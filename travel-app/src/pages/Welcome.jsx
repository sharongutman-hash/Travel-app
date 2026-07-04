import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { trips } from '../trips'
import { useLang } from '../LangContext'
import { welcomeTranslations } from '../i18n'
import './Welcome.css'

// Strings specific to the redesigned welcome screen.
const strings = {
  en: {
    welcomeBack: 'Welcome back',
    search: 'Where to go?',
    newIdeas: 'New ideas',
    upcoming: 'Upcoming',
    buildSub: 'Start your adventure',
    days: 'days',
    km: 'km',
  },
  he: {
    welcomeBack: 'ברוך שובך',
    search: 'לאן נוסעים?',
    newIdeas: 'רעיונות חדשים',
    upcoming: 'הקרוב',
    buildSub: 'התחילו הרפתקה',
    days: 'ימים',
    km: 'ק"מ',
  },
}

// Inspirational trips the assistant can build next.
const suggestions = [
  { name: 'Swiss-Belhotel Rainforest Kuta', addr: 'Jl. Sunset Road No. 101, Kuta, Bali, Indonesia', days: 10, km: 1500 },
  { name: 'Ayana Resort and Spa Bali', addr: 'Jl. Karang Mas Sejahtera, Jimbaran, Bali, Indonesia', days: 7, km: 1200 },
  { name: 'W Bali - Seminyak', addr: 'Jl. Petitenget No. 1000x, Seminyak, Bali, Indonesia', days: 5, km: 800 },
  { name: 'Four Seasons Resort Bali at Sayan', addr: 'Sayan, Ubud, Bali, Indonesia', days: 8, km: 950 },
]

function TripCard({ trip, onClick }) {
  const { lang } = useLang()
  const s = strings[lang]
  const meta = trip[lang]
  return (
    <button className="wt-card" onClick={onClick}>
      <div className="wt-card-img" style={{ backgroundImage: `url(${trip.heroImage})` }}>
        <div className="wt-card-img-fade" />
        <span className="wt-badge">{s.upcoming}</span>
      </div>
      <div className="wt-card-body">
        <div className="wt-card-title">{meta.title}</div>
        <div className="wt-card-sub">{meta.subtitle}</div>
        <div className="wt-card-meta">{meta.dates} · {trip.days} {s.days} · {trip.km} {s.km}</div>
      </div>
    </button>
  )
}

function Suggestion({ item, onClick }) {
  const { lang } = useLang()
  const s = strings[lang]
  return (
    <button className="wt-suggestion" onClick={onClick}>
      <div className="wt-suggestion-title">{item.name}</div>
      <div className="wt-suggestion-addr">{item.addr}</div>
      <div className="wt-suggestion-meta">{item.days} {s.days} · {item.km} {s.km}</div>
    </button>
  )
}

function BuildModal({ onClose }) {
  const { lang } = useLang()
  const w = welcomeTranslations[lang]
  return (
    <div className="wt-modal-backdrop" onClick={onClose}>
      <div className="wt-modal" onClick={e => e.stopPropagation()}>
        <button className="wt-modal-x" onClick={onClose} aria-label="Close">×</button>
        <h2 className="wt-modal-title">{w.modalTitle}</h2>
        <p className="wt-modal-intro">{w.modalIntro}</p>
        <ul className="wt-modal-list">
          {w.modalItems.map((item, i) => (
            <li key={i} className="wt-modal-item">
              <span className="wt-modal-emoji">{item.emoji}</span>
              <div>
                <div className="wt-modal-item-label">{item.label}</div>
                <div className="wt-modal-item-desc">{item.desc}</div>
              </div>
            </li>
          ))}
        </ul>
        <button className="wt-modal-btn" onClick={onClose}>{w.modalClose}</button>
      </div>
    </div>
  )
}

export default function Welcome() {
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()
  const { lang, setLang } = useLang()
  const s = strings[lang]
  const w = welcomeTranslations[lang]
  const upcoming = trips[0]

  return (
    <div className="welcome">
      <header className="wt-hero">
        <div className="wt-blob wt-blob-outer" />
        <div className="wt-blob wt-blob-mid" />
        <div className="wt-blob wt-blob-core" />

        <div className="wt-hero-top">
          <button
            className="wt-lang"
            onClick={() => setLang(lang === 'en' ? 'he' : 'en')}
            title={lang === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
          >
            {lang === 'en' ? 'עב' : 'EN'}
          </button>
        </div>

        <h1 className="wt-welcome">{s.welcomeBack}</h1>

        <div className="wt-search">
          <span className="wt-search-ico">🔍</span>
          <input type="text" placeholder={s.search} aria-label={s.search} />
        </div>
      </header>

      <div className="wt-content">
        {upcoming && <TripCard trip={upcoming} onClick={() => navigate(upcoming.route)} />}

        <button className="wt-build" onClick={() => setShowModal(true)}>
          <div className="wt-build-plus">+</div>
          <div className="wt-build-title">{w.buildTitle}</div>
          <div className="wt-build-sub">{s.buildSub}</div>
        </button>

        <div className="wt-ideas">
          <div className="wt-ideas-label">{s.newIdeas}</div>
          {suggestions.map((item, i) => (
            <Suggestion key={i} item={item} onClick={() => setShowModal(true)} />
          ))}
        </div>
      </div>

      {showModal && <BuildModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
