import Sensor from '../models/Sensor.js'
import Field from '../models/Field.js'
import Product from '../models/Product.js'
import Alert from '../models/Alert.js'
import Task from '../models/Task.js'
import Scan from '../models/Scan.js'
import Command from '../models/Command.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'

const MODELS = { sensors: Sensor, fields: Field, products: Product, alerts: Alert, tasks: Task, scans: Scan, commands: Command }

/* Flatten rows to CSV, escaping commas/quotes/newlines. */
function toCsv(rows) {
  if (!rows.length) return ''
  const cols = [...rows.reduce((set, r) => {
    Object.keys(r).forEach((k) => set.add(k))
    return set
  }, new Set())]
  const esc = (v) => {
    if (v === null || v === undefined) return ''
    if (typeof v === 'object') v = JSON.stringify(v)
    v = String(v)
    return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
  }
  const header = cols.join(',')
  const lines = rows.map((r) => cols.map((c) => esc(r[c])).join(','))
  return [header, ...lines].join('\n')
}

/**
 * GET /api/export/:resource.csv   (user)
 * Download a collection (this farm) as CSV. resource ∈ sensors|fields|products|alerts|tasks|scans|commands
 */
export const exportCsv = asyncHandler(async (req, res) => {
  const name = String(req.params.resource).replace(/\.csv$/i, '')
  const Model = MODELS[name]
  if (!Model) throw ApiError.badRequest(`Cannot export "${name}". Allowed: ${Object.keys(MODELS).join(', ')}`)
  const docs = await Model.find({ farm: req.user.farm }).lean()
  const csv = toCsv(docs)
  res.header('Content-Type', 'text/csv; charset=utf-8')
  res.attachment(`${name}.csv`)
  res.send(csv)
})
