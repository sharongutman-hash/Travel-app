import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LangProvider, useLang } from './LangContext'
import { translations } from './i18n'
import Welcome from './pages/Welcome'
import Home from './pages/Home'
import DayDetail from './pages/DayDetail'

const basename = import.meta.env.BASE_URL

function TopBar() {
  const { lang, setLang } = useLang()
  const t = translations[lang]
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

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter basename={basename}>
        <TopBar />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/trip/:tripId" element={<Home />} />
          <Route path="/day/:id" element={<DayDetail />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  )
}
