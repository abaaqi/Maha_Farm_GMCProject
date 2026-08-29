import Scan from '../models/Scan.js'
import { asyncHandler } from '../utils/asyncHandler.js'

/**
 * The pool the simulated vision model "detects" from. In a fuller build
 * this controller would forward the uploaded image to an inference
 * service and persist whatever it returns.
 */
const POOL = [
  {
    crop: 'Tomato',
    disease: 'Early Blight',
    pathogen: 'Alternaria solani',
    confidence: 92,
    severity: 'Moderate',
    treatment:
      'Remove affected lower leaves. Apply a copper-based or mancozeb fungicide every 7–10 days. Improve airflow and avoid overhead watering.',
  },
  {
    crop: 'Maize',
    disease: 'Northern Leaf Blight',
    pathogen: 'Exserohilum turcicum',
    confidence: 88,
    severity: 'High',
    treatment:
      'Apply a mancozeb or azoxystrobin fungicide promptly. Remove infected lower leaves and rotate away from maize next season. Avoid overhead irrigation late in the day.',
  },
  {
    crop: 'Pepper',
    disease: 'Healthy',
    pathogen: '—',
    confidence: 97,
    severity: 'None',
    treatment: 'No action needed. Foliage shows healthy pigmentation and structure. Keep monitoring.',
  },
]

/** GET /api/scans — recent scan history for the farm. */
export const listScans = asyncHandler(async (req, res) => {
  const scans = await Scan.find({ farm: req.user.farm }).sort('-createdAt')
  res.json(scans)
})

/**
 * POST /api/scans — "analyze" an uploaded leaf and store the result.
 * Body: { imageName?, crop? }
 */
export const createScan = asyncHandler(async (req, res) => {
  const pick = POOL[Math.floor(Math.random() * POOL.length)]
  const scan = await Scan.create({
    ...pick,
    crop: req.body.crop || pick.crop,
    imageName: req.body.imageName || 'leaf.jpg',
    farm: req.user.farm,
  })
  res.status(201).json(scan)
})
