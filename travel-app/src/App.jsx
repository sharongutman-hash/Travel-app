import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import DayDetail from './pages/DayDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/day/:id" element={<DayDetail />} />
      </Routes>
    </BrowserRouter>
  )
}
