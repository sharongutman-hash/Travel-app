import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { trips } from '../trips'
import { useLang } from '../LangContext'
import { welcomeTranslations } from '../i18n'
import './Welcome.css'

function TripCard({ trip, onClick }) {
  const { lang } = useLang()
  const w = welcomeTranslations[lang]
  const meta = trip[lang]
  return (
    <button className="wt-card" onClick={onClick}>
      <div className="wt-card-img" style={{ backgroundImage: `url(${trip.heroImage})` }}>
        <div className="wt-card-img-overlay" />
        <span className="wt-card-flag">{trip.flag}</span>
        {trip.status === 'ready' && <span className="wt-card-badge">{w.ready}</span>}
      </div>
      <div className="wt-card-body">
        <div className="wt-card-title">{meta.title}</div>
        <div className="wt-card-sub">{meta.subtitle}</div>
        <div className="wt-card-meta">
          <span>{meta.dates}</span>
          <span className="wt-dot">·</span>
          <span>{trip.days} {lang === 'he' ? 'ימים' : 'days'}</span>
          <span className="wt-dot">·</span>
          <span>{trip.km} {lang === 'he' ? 'ק"מ' : 'km'}</span>
        </div>
      </div>
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
  const { lang } = useLang()
  const w = welcomeTranslations[lang]

  return (
    <div className="welcome">
      <div className="wt-inner">
        <header className="wt-header">
          <div className="wt-brand">🌍 {w.brand}</div>
          <h1 className="wt-heading">{w.heading}</h1>
          <p className="wt-sub">{w.sub}</p>
        </header>

        <div className="wt-grid">
          {trips.map(trip => (
            <TripCard key={trip.id} trip={trip} onClick={() => navigate(trip.route)} />
          ))}

          <button className="wt-card wt-build" onClick={() => setShowModal(true)}>
            <div className="wt-build-plus">+</div>
            <div className="wt-build-title">{w.buildTitle}</div>
            <div className="wt-build-sub">{w.buildSub}</div>
          </button>
        </div>
      </div>

      {showModal && <BuildModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
