import { Router } from 'express'
import authRoutes from './authRoutes.js'
import fieldRoutes from './fieldRoutes.js'
import sensorRoutes from './sensorRoutes.js'
import alertRoutes from './alertRoutes.js'
import productRoutes from './productRoutes.js'
import taskRoutes from './taskRoutes.js'
import scanRoutes from './scanRoutes.js'
import dashboardRoutes from './dashboardRoutes.js'
import weatherRoutes from './weatherRoutes.js'
import assistantRoutes from './assistantRoutes.js'
import deviceRoutes from './deviceRoutes.js'
import commandRoutes from './commandRoutes.js'
import exportRoutes from './exportRoutes.js'

const router = Router()

// API index — a friendly map of what's available (handles GET /api/)
router.get('/', (req, res) => {
  res.json({
    name: 'MahaFarm API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: 'POST /api/auth/register · POST /api/auth/login · POST /api/auth/logout · GET /api/auth/me',
      resources: 'GET|POST /api/{fields|sensors|alerts|products|tasks} · GET|PATCH|DELETE /api/{...}/:id',
      scans: 'GET|POST /api/scans',
      dashboard: 'GET /api/dashboard/summary',
      weather: 'GET /api/weather',
      assistant: 'POST /api/assistant',
    },
  })
})

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mahafarm-api', time: new Date().toISOString() })
})

router.use('/auth', authRoutes)
router.use('/fields', fieldRoutes)
router.use('/sensors', sensorRoutes)
router.use('/alerts', alertRoutes)
router.use('/products', productRoutes)
router.use('/tasks', taskRoutes)
router.use('/scans', scanRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/weather', weatherRoutes)
router.use('/assistant', assistantRoutes)
router.use('/device', deviceRoutes)       // hardware ingest + command polling (device key)
router.use('/commands', commandRoutes)    // app queues hardware commands (user)
router.use('/export', exportRoutes)       // CSV downloads (user)

export default router
