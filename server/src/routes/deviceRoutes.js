import { Router } from 'express'
import { ingest, pollCommands, ackCommand } from '../controllers/deviceController.js'
import { deviceAuth } from '../middleware/deviceAuth.js'

const router = Router()
router.use(deviceAuth)
router.post('/ingest', ingest)
router.get('/commands', pollCommands)
router.post('/commands/:id/ack', ackCommand)
export default router
