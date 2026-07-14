import { useNavigate, useParams } from 'react-router-dom'
import { useLang } from '../LangContext'

const strings = {
  en: { title: 'Inspire me', sub: 'Attractions & food near you' },
  he: { title: 'תן השראה', sub: 'אטרקציות ואוכל קרוב אליך' },
}

// Entry point to the trip's /inspire page — used on Home (under the days list)
// and at the top of each day's Attractions tab (compact variant).
export default function InspireBanner({ compact }) {
  const navigate = useNavigate()
  const { tripId } = useParams()
  const { lang } = useLang()
  const s = strings[lang]
  return (
    <button
      className={`inspire-banner${compact ? ' inspire-banner-compact' : ''}`}
      onClick={() => navigate(`/trip/${tripId}/inspire`)}
    >
      <span className="inspire-banner-emoji">✨</span>
      <span className="inspire-banner-text">
        <span className="inspire-banner-title">{s.title}</span>
        <span className="inspire-banner-sub">{s.sub}</span>
      </span>
      <span className="inspire-banner-caret">›</span>
    </button>
  )
}
