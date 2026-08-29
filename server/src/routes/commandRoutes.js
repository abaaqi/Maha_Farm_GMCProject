import { Router } from 'express'
import { createCommand, listCommands } from '../controllers/commandController.js'
import { protect } from '../middleware/auth.js'

const router = Router()
router.use(protect)
router.route('/').get(listCommands).post(createCommand)
export default router
