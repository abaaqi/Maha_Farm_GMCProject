import { Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import DashboardLayout from './components/DashboardLayout.jsx'

import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CropMonitoring from './pages/CropMonitoring.jsx'
import DiseaseDetection from './pages/DiseaseDetection.jsx'
import Marketplace from './pages/Marketplace.jsx'
import Assistant from './pages/Assistant.jsx'
import Weather from './pages/Weather.jsx'
import Foresight from './pages/Foresight.jsx'
import NotFound from './pages/NotFound.jsx'

/**
 * MahaFarm — top-level route map.
 *
 *   /                      marketing landing page
 *   /login, /register      authentication screens
 *   /app                   dashboard shell (sidebar + topbar)
 *     index   -> Dashboard
 *     /crops  -> Crop monitoring
 *     /scan   -> AI disease detection
 *     /market -> Marketplace
 *     /assistant -> AI assistant
 *     /weather   -> Weather & alerts
 *   *                      404
 */
export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="foresight" element={<Foresight />} />
          <Route path="crops" element={<CropMonitoring />} />
          <Route path="scan" element={<DiseaseDetection />} />
          <Route path="market" element={<Marketplace />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="weather" element={<Weather />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
