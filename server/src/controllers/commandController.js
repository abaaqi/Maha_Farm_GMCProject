import Command from '../models/Command.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'

/**
 * POST /api/commands   (user)
 * Queue a hardware command, e.g. { type:'relay', target:'pump', state:'on', durationSec:30 }.
 * The serial bridge will pick it up on its next poll.
 */
export const createCommand = asyncHandler(async (req, res) => {
  const { type, target, state, durationSec, zone } = req.body
  if (!type) throw ApiError.badRequest('type is required (e.g. "relay")')
  const cmd = await Command.create({
    farm: req.user.farm,
    type,
    target: target || '',
    state: state || '',
    durationSec: durationSec || 0,
    zone: zone || '',
  })
  res.status(201).json(cmd)
})

/** GET /api/commands   (user) — recent command history. */
export const listCommands = asyncHandler(async (req, res) => {
  const cmds = await Command.find({ farm: req.user.farm }).sort('-createdAt').limit(50)
  res.json(cmds)
})
