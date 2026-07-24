import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import PeoplePage from './pages/PeoplePage'
import CalendarPage from './pages/CalendarPage'

export default function App() {
  return (
    <div>
      <header style={{padding:12, display:'flex', gap:12, alignItems:'center'}}>
        <h1>Beloved Calendar</h1>
        <nav>
          <Link to="/">Calendar</Link> | <Link to="/people">People</Link>
        </nav>
      </header>
      <main style={{padding:12}}>
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/people" element={<PeoplePage />} />
        </Routes>
      </main>
    </div>
  )
}
