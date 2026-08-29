import { Router } from 'express'
import { exportCsv } from '../controllers/exportController.js'
import { protect } from '../middleware/auth.js'

const router = Router()
// Accepts /api/export/sensors and /api/export/sensors.csv (suffix stripped in controller)
router.get('/:resource', protect, exportCsv)
export default router
