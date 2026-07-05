import { Component } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { LangProvider, useLang } from './LangContext'
import { translations } from './i18n'
import Welcome from './pages/Welcome'
import Home from './pages/Home'
import DayDetail from './pages/DayDetail'

const basename = import.meta.env.BASE_URL

// Catches render errors so one bad coordinate/field can't white-screen the app.
class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div className="error-boundary">
          <div className="error-emoji">🧭</div>
          <h1>Something went wrong</h1>
          <p>{String(this.state.error?.message || this.state.error)}</p>
          <a href={basename}>Reload</a>
        </div>
      )
    }
    return this.props.children
  }
}

function TopBar() {
  const { lang, setLang } = useLang()
  const t = translations[lang]
  const { pathname } = useLocation()
  // The Welcome screen has its own header + language toggle.
  if (pathname === '/') return null
  return (
    <div className="top-bar">
      <button
        className="lang-toggle"
        onClick={() => setLang(lang === 'en' ? 'he' : 'en')}
        title={lang === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
      >
        {t.langToggle}
      </button>
    </div>
  )
}

// Remounts on path change so each page plays its enter animation (§2.1).
function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div className="route-fade" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Welcome />} />
        <Route path="/trip/:tripId" element={<Home />} />
        <Route path="/trip/:tripId/day/:dayId" element={<DayDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter basename={basename}>
        <ErrorBoundary>
          <TopBar />
          <AnimatedRoutes />
        </ErrorBoundary>
      </BrowserRouter>
    </LangProvider>
  )
}
