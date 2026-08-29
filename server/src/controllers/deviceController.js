import Sensor from '../models/Sensor.js'
import Alert from '../models/Alert.js'
import Farm from '../models/Farm.js'
import Command from '../models/Command.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import { env } from '../config/env.js'

/* Which farm hardware readings belong to. Uses DEVICE_FARM_ID if set,
   otherwise the first (demo) farm — fine for a single-farm setup. */
async function resolveFarmId() {
  if (env.deviceFarmId) return env.deviceFarmId
  const farm = await Farm.findOne().sort('createdAt')
  return farm?._id
}

/* Default icon for known sensor labels so new tiles look right. */
function iconFor(label = '') {
  const l = label.toLowerCase()
  if (l.includes('moisture')) return 'droplets'
  if (l.includes('temp')) return 'thermometer'
  if (l.includes('humid')) return 'wind'
  if (l.includes('ph')) return 'flask'
  if (l.includes('light')) return 'sun'
  if (l.includes('tank') || l.includes('water')) return 'gauge'
  return 'activity'
}

/* Simple threshold → alert rules (extend as you like). */
function evaluate(label, value) {
  if (label === 'Tank level' && value < 45)
    return { severity: 'warn', title: 'Reservoir below 45%', body: `Tank level at ${value}%. Consider refilling.`, zone: 'Reservoir' }
  if (label === 'Soil moisture' && value < 50)
    return { severity: 'warn', title: 'Soil moisture low', body: `Soil moisture at ${value}%. Irrigation advised.`, zone: 'Field' }
  return null
}

/**
 * POST /api/device/ingest   (device key)
 * Body: { readings: [{ label, value, unit?, status?, zone?, icon? }] }
 * Upserts each reading into the matching sensor tile and raises threshold alerts.
 */
export const ingest = asyncHandler(async (req, res) => {
  const farmId = await resolveFarmId()
  if (!farmId) throw ApiError.badRequest('No farm found. Seed the database first.')

  const readings = Array.isArray(req.body.readings) ? req.body.readings : []
  if (!readings.length) throw ApiError.badRequest('readings[] is required')

  const updated = []
  for (const r of readings) {
    if (!r.label || r.value === undefined || r.value === null) continue
    const alertDef = evaluate(r.label, r.value)
    const status = r.status || (alertDef ? 'warn' : 'healthy')

    await Sensor.findOneAndUpdate(
      { farm: farmId, label: r.label },
      {
        value: r.value,
        unit: r.unit ?? '',
        status,
        zone: r.zone ?? '',
        icon: r.icon ?? iconFor(r.label),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    updated.push(r.label)

    // Raise an alert once (don't spam) while the condition persists.
    if (alertDef) {
      const exists = await Alert.findOne({ farm: farmId, title: alertDef.title, resolved: false })
      if (!exists) await Alert.create({ ...alertDef, farm: farmId })
    }
  }

  res.json({ ok: true, updated, at: new Date().toISOString() })
})

/**
 * GET /api/device/commands   (device key)
 * Returns pending commands and marks them as "sent" so they aren't re-issued.
 */
export const pollCommands = asyncHandler(async (req, res) => {
  const farmId = await resolveFarmId()
  const pending = await Command.find({ farm: farmId, status: 'pending' }).sort('createdAt')
  const ids = pending.map((c) => c._id)
  if (ids.length) {
    await Command.updateMany({ _id: { $in: ids } }, { status: 'sent', sentAt: new Date() })
  }
  res.json(pending)
})

/**
 * POST /api/device/commands/:id/ack   (device key)
 * Marks a command as executed.
 */
export const ackCommand = asyncHandler(async (req, res) => {
  const cmd = await Command.findByIdAndUpdate(
    req.params.id,
    { status: 'done', doneAt: new Date() },
    { new: true }
  )
  if (!cmd) throw ApiError.notFound('Command not found')
  res.json(cmd)
})
