/* ============================================================================
 * Foresight controller — the endpoint that turns a location into a decision.
 *
 *   POST /api/foresight
 *   {
 *     location: "Kura",         // or lat/lon
 *     crop: "maize",
 *     plantedOn: "2026-06-15",
 *     areaHa: 5,
 *     irrigationMethod: "drip", // drip | sprinkler | furrow
 *     language: "en"            // en | ha
 *   }
 *
 * Pipeline: geocode -> fetch free agro-weather -> FAO-56 water balance ->
 * disease infection models -> AI advisory -> persist -> respond.
 * ==========================================================================*/

import {
  CROPS,
  CROP_KEYS,
  daysSincePlanting,
  currentStage,
  waterBalance,
  fixedScheduleBaseline,
  diseaseForecast,
} from '../services/agronomy.js'
import { geocode, fetchAgroWeather, KNOWN_LOCATIONS } from '../services/weatherData.js'
import { writeAdvisory } from '../services/advisor.js'
import Advisory from '../models/Advisory.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'

/* Delivery efficiency by irrigation method (FAO-56 application efficiency). */
const EFFICIENCY = { drip: 0.9, sprinkler: 0.75, furrow: 0.6, flood: 0.55 }

/* Rough cost of pumped irrigation water in Nigeria, used only to express the
 * saving in Naira. Deliberately conservative and stated as an assumption. */
const NAIRA_PER_1000_LITRES = 150

/** GET /api/foresight/options — crops and locations the UI can offer. */
export const getOptions = asyncHandler(async (req, res) => {
  res.json({
    crops: CROP_KEYS.map((key) => ({
      key,
      label: CROPS[key].label,
      stages: CROPS[key].stages.map((s) => s.name),
      diseases: CROPS[key].diseases.length,
    })),
    locations: Object.entries(KNOWN_LOCATIONS).map(([key, v]) => ({
      key,
      label: `${v.name}, ${v.admin}`,
    })),
    irrigationMethods: Object.keys(EFFICIENCY),
    languages: [
      { code: 'en', label: 'English' },
      { code: 'ha', label: 'Hausa' },
    ],
  })
})

/** POST /api/foresight — run the engine and return a full advisory. */
export const runForesight = asyncHandler(async (req, res) => {
  const {
    location: place = 'Kura',
    lat,
    lon,
    crop: cropKey = 'maize',
    plantedOn,
    areaHa = 1,
    irrigationMethod = 'sprinkler',
    language = 'en',
  } = req.body || {}

  const crop = CROPS[cropKey]
  if (!crop) {
    throw ApiError.badRequest(`Unknown crop "${cropKey}". Supported: ${CROP_KEYS.join(', ')}`)
  }

  const area = Math.max(0.01, Number(areaHa) || 1)
  const efficiency = EFFICIENCY[irrigationMethod] ?? EFFICIENCY.sprinkler

  /* 1 — Where is this field? */
  const location =
    Number.isFinite(lat) && Number.isFinite(lon)
      ? { name: place || 'Custom location', admin: '', lat, lon, source: 'coordinates' }
      : await geocode(place)

  /* 2 — Free agro-meteorological data (no sensors). */
  const weather = await fetchAgroWeather(location.lat, location.lon)

  const todayISO = new Date().toISOString().slice(0, 10)
  const todayIdx = Math.max(0, weather.days.findIndex((d) => d.date === todayISO))
  const today = weather.days[todayIdx] || weather.days[Math.floor(weather.days.length / 2)]
  const forecastDays = weather.days.slice(todayIdx, todayIdx + 7)

  /* 3 — Growth stage drives the crop coefficient. */
  const dap = plantedOn ? daysSincePlanting(plantedOn) : 45
  const stage = currentStage(cropKey, dap)

  /* 4 — Water balance: ETc = ET0 x Kc, minus effective rainfall. */
  const water = waterBalance({
    et0: today.et0,
    rainfall: today.rainfall,
    kc: stage.kc,
    areaHa: area,
    efficiency,
  })

  /* Seven-day plan, so the farmer can see the week ahead, not just today. */
  const weekPlan = forecastDays.map((d) => {
    const wb = waterBalance({ et0: d.et0, rainfall: d.rainfall, kc: stage.kc, areaHa: area, efficiency })
    return {
      date: d.date,
      tMax: d.tMax,
      tMin: d.tMin,
      rainfallMm: d.rainfall,
      rainChance: d.rainChance,
      etcMm: wb.etcMm,
      deficitMm: wb.deficitMm,
      litres: wb.litresNeeded,
      irrigate: wb.irrigationNeeded,
    }
  })

  /* 5 — Measurable impact: Foresight vs a fixed schedule over the same week. */
  const baseline = fixedScheduleBaseline({ areaHa: area, efficiency })
  const baselineLitres = Math.round(baseline.litres * weekPlan.length)
  const foresightLitres = weekPlan.reduce((sum, d) => sum + d.litres, 0)
  const litresSaved = Math.max(0, baselineLitres - foresightLitres)
  const savings = {
    baselineLitres,
    foresightLitres,
    litresSaved,
    percentSaved: baselineLitres ? Math.round((litresSaved / baselineLitres) * 100) : 0,
    nairaSaved: Math.round((litresSaved / 1000) * NAIRA_PER_1000_LITRES),
  }

  /* 6 — Disease risk from hourly conditions, not from a photo. */
  const dates = forecastDays.map((d) => d.date)
  const dailyHours = dates.map((d) => weather.hourlyByDate[d] || [])
  const disease = diseaseForecast(cropKey, dailyHours, dates)

  /* 7 — AI writes the plan from the computed facts. Never throws. */
  const payload = {
    location,
    crop: { key: cropKey, label: crop.label },
    stage: { ...stage, dap },
    water,
    savings,
    disease,
    areaHa: area,
  }
  const advisory = await writeAdvisory(payload, language)

  /* 8 — Persist, so impact accumulates and every run is auditable. */
  let savedId = null
  try {
    const doc = await Advisory.create({
      farm: req.user?.farm,
      location: { name: location.name, admin: location.admin, lat: location.lat, lon: location.lon },
      crop: cropKey,
      areaHa: area,
      plantedOn: plantedOn || undefined,
      stage: { name: stage.name, dap, kc: stage.kc, seasonProgress: stage.seasonProgress, daysToHarvest: stage.daysToHarvest },
      water,
      savings,
      disease: disease.map((d) => ({
        key: d.key, label: d.label, peakScore: d.peakScore,
        peakLevel: d.peakLevel, peakDate: d.peakDate, leadDays: d.leadDays,
      })),
      advisory: advisory.text,
      language,
      dataSource: weather.source,
      aiEngine: advisory.engine,
      aiModel: advisory.model,
    })
    savedId = doc._id
  } catch {
    // A database hiccup must not cost the farmer their advisory.
  }

  res.json({
    id: savedId,
    location,
    crop: { key: cropKey, label: crop.label },
    stage: { ...stage, dap },
    today: { date: today.date, tMax: today.tMax, tMin: today.tMin, rhMax: today.rhMax, et0: today.et0 },
    water,
    weekPlan,
    savings,
    disease,
    advisory,
    provenance: {
      weatherSource: weather.source,
      weatherNote: weather.note || null,
      locationSource: location.source,
      method: 'FAO-56 ETc = ET0 × Kc water balance; published infection-condition models for disease risk',
      assumptions: [
        `Irrigation method "${irrigationMethod}" at ${Math.round(efficiency * 100)}% application efficiency`,
        `Baseline comparison: fixed schedule of 25 mm, 3 days per week`,
        `Water cost assumed at ₦${NAIRA_PER_1000_LITRES} per 1,000 litres`,
      ],
    },
    generatedAt: new Date().toISOString(),
  })
})

/** GET /api/foresight/history — past advisories and cumulative saving. */
export const getHistory = asyncHandler(async (req, res) => {
  const docs = await Advisory.find(req.user?.farm ? { farm: req.user.farm } : {})
    .sort('-createdAt')
    .limit(50)
    .lean()

  const totals = docs.reduce(
    (acc, d) => {
      acc.litresSaved += d.savings?.litresSaved || 0
      acc.nairaSaved += d.savings?.nairaSaved || 0
      return acc
    },
    { litresSaved: 0, nairaSaved: 0 }
  )

  res.json({ count: docs.length, totals, advisories: docs })
})
