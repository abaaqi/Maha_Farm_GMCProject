import { asyncHandler } from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'

/**
 * Keyword-matched assistant replies for Phase 2. The endpoint contract
 * (POST a message, get a reply) is ready for Phase 3 to swap in a real
 * language model grounded in the farm's live data.
 */
const CANNED = {
  irrigate:
    'For tomato at flowering, irrigate early morning (5–7 AM) so foliage dries quickly and humidity stays low — this lowers the risk of blight and bacterial wilt, which spread fast in Kano humidity. Keep soil moisture in the 55–65% band and avoid evening watering.',
  thrips:
    'Organic thrips control for onion: 1) Introduce predatory mites or lacewings. 2) Spray neem oil (azadirachtin) at dusk every 5–7 days. 3) Use blue sticky traps to monitor. 4) Avoid excess nitrogen, which fuels the soft growth thrips prefer.',
  fertilizer:
    'For maize at tasselling, split nitrogen into 2–3 doses (urea top-dressing), keep potassium steady for grain fill, and fertigate in short cycles to limit leaching during the rains.',
  default:
    'Based on current sensor readings, the priority today is any field whose soil moisture has dropped below its comfort band — auto-irrigation will queue for the next window. I would also scan fields flagged for possible pests.',
}

function replyFor(message) {
  const t = message.toLowerCase()
  if (/(irrigat|water|tomato)/.test(t)) return CANNED.irrigate
  if (/(thrip|pest|onion)/.test(t)) return CANNED.thrips
  if (/(fertil|nutrient|maize|urea)/.test(t)) return CANNED.fertilizer
  return CANNED.default
}

/** POST /api/assistant — body: { message } → { reply } */
export const ask = asyncHandler(async (req, res) => {
  const { message } = req.body
  if (!message || !message.trim()) throw ApiError.badRequest('A message is required')
  res.json({ reply: replyFor(message), at: new Date().toISOString() })
})
