import { env } from '../config/env.js'
import ApiError from '../utils/ApiError.js'

/**
 * Authenticates hardware/bridge requests with a shared device key sent in the
 * `x-device-key` header. If DEVICE_KEY isn't configured, the device endpoints
 * stay disabled (every request is rejected) — safe by default.
 */
export function deviceAuth(req, res, next) {
  const key = req.headers['x-device-key']
  if (!env.deviceKey) throw ApiError.unauthorized('Device endpoints are disabled (set DEVICE_KEY)')
  if (key !== env.deviceKey) throw ApiError.unauthorized('Invalid device key')
  next()
}
