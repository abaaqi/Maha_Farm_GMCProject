import { Router } from 'express'
import { runForesight, getOptions, getHistory } from '../controllers/foresightController.js'

const router = Router()

/*
 * Foresight is intentionally PUBLIC.
 *
 * The product argument: a farmer should be able to get an irrigation and
 * disease advisory by naming a location and a crop — no account, no sensors,
 * no barrier. Signing in adds persistence and their own field records.
 *
 * The engineering argument: it keeps the advisory reachable even if the auth
 * or database layer is degraded, which is exactly when a farmer still needs it.
 */
router.get('/options', getOptions)
router.get('/history', getHistory)
router.post('/', runForesight)

export default router
