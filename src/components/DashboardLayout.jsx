import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Icon from './icons.jsx'
import Sidebar from './Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { farmProfile } from '../data/mockData.js'
import './DashboardLayout.css'

const titles = {
  '/app': { title: 'Overview', sub: 'Everything happening across your farm, right now.' },
  '/app/foresight': { title: 'Foresight', sub: 'Predict water need and disease risk — no sensors required.' },
  '/app/crops': { title: 'Crop monitoring', sub: 'Health, stage, and moisture for every field.' },
  '/app/scan': { title: 'Disease scan', sub: 'Upload a leaf and let vision AI diagnose it.' },
  '/app/weather': { title: 'Weather & alerts', sub: 'Forecast and advisories tuned to your crops.' },
  '/app/market': { title: 'Marketplace', sub: 'List produce and sell direct to buyers.' },
  '/app/assistant': { title: 'Farm assistant', sub: 'Ask anything about your fields, in plain language.' },
}

/** App shell: fixed sidebar + sticky topbar + routed content. */
export default function DashboardLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { farm, logout } = useAuth()
  const meta = titles[pathname] || { title: 'MahaFarm', sub: '' }
  const location = farm?.location || farmProfile.location

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="topbar-burger"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Icon name="menu" size={22} />
            </button>
            <div className="topbar-title-wrap">
              <h1 className="topbar-title">{meta.title}</h1>
              <p className="topbar-sub">{meta.sub}</p>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-search">
              <Icon name="search" size={17} />
              <input type="text" placeholder="Search fields, crops…" aria-label="Search" />
            </div>
            <button className="topbar-icon-btn" aria-label="Notifications">
              <Icon name="bell" size={19} />
              <span className="topbar-badge">3</span>
            </button>
            <div className="topbar-loc">
              <Icon name="map-pin" size={15} />
              <span>{location}</span>
            </div>
            <button className="topbar-logout" onClick={handleLogout}>
              <Icon name="log-out" size={17} />
              <span>Log out</span>
            </button>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
