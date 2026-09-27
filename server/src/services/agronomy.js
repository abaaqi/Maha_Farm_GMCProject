/* ============================================================================
 * MahaFarm Foresight — agronomy engine
 *
 * Turns free public weather data into two decisions a farmer can act on:
 *   1. How much water does this field need today?   (FAO-56 water balance)
 *   2. What is the disease risk this week?          (infection-condition models)
 *
 * No sensors required. Everything here is deterministic, testable arithmetic —
 * the LLM layer only translates these numbers into language, it never invents
 * them.
 *
 * References: FAO Irrigation & Drainage Paper 56 (Allen et al., 1998) for crop
 * coefficients and the ETc = ET0 x Kc water-balance method; published infection
 * thresholds for each pathogen (see DISEASE_MODELS).
 * ==========================================================================*/

/* --- Crop coefficients (Kc) by growth stage, FAO-56 Table 12 ---------------
 * Kc scales reference evapotranspiration (ET0) to a specific crop and stage.
 * Stage lengths are days after planting, tuned to Nigerian growing seasons. */
export const CROPS = {
  maize: {
    label: 'Maize',
    stages: [
      { name: 'Initial', untilDay: 20, kc: 0.3 },
      { name: 'Development', untilDay: 55, kc: 0.7 },
      { name: 'Tasselling / mid-season', untilDay: 95, kc: 1.2 },
      { name: 'Late season', untilDay: 125, kc: 0.6 },
    ],
    rootDepthM: 1.0,
    diseases: ['northern_leaf_blight'],
  },
  rice: {
    label: 'Rice',
    stages: [
      { name: 'Nursery / initial', untilDay: 25, kc: 1.05 },
      { name: 'Tillering', untilDay: 55, kc: 1.1 },
      { name: 'Panicle initiation / mid', untilDay: 95, kc: 1.2 },
      { name: 'Ripening', untilDay: 125, kc: 0.9 },
    ],
    rootDepthM: 0.5,
    ponded: true, // paddy systems hold standing water
    diseases: ['rice_blast'],
  },
  tomato: {
    label: 'Tomato',
    stages: [
      { name: 'Initial', untilDay: 25, kc: 0.6 },
      { name: 'Development', untilDay: 55, kc: 0.9 },
      { name: 'Flowering / fruit set', untilDay: 95, kc: 1.15 },
      { name: 'Ripening', untilDay: 125, kc: 0.8 },
    ],
    rootDepthM: 0.9,
    diseases: ['tomato_early_blight', 'tomato_late_blight'],
  },
  pepper: {
    label: 'Tatashe Pepper',
    stages: [
      { name: 'Initial', untilDay: 25, kc: 0.6 },
      { name: 'Vegetative', untilDay: 60, kc: 0.95 },
      { name: 'Flowering / fruiting', untilDay: 110, kc: 1.05 },
      { name: 'Late season', untilDay: 140, kc: 0.85 },
    ],
    rootDepthM: 0.8,
    diseases: ['anthracnose'],
  },
  onion: {
    label: 'Onion',
    stages: [
      { name: 'Initial', untilDay: 20, kc: 0.7 },
      { name: 'Development', untilDay: 50, kc: 0.95 },
      { name: 'Bulb development', untilDay: 95, kc: 1.05 },
      { name: 'Maturity', untilDay: 120, kc: 0.75 },
    ],
    rootDepthM: 0.4,
    diseases: ['purple_blotch', 'thrips_pressure'],
  },
  cowpea: {
    label: 'Cowpea',
    stages: [
      { name: 'Initial', untilDay: 20, kc: 0.4 },
      { name: 'Vegetative', untilDay: 45, kc: 0.8 },
      { name: 'Flowering / pod fill', untilDay: 75, kc: 1.05 },
      { name: 'Maturity', untilDay: 95, kc: 0.6 },
    ],
    rootDepthM: 0.7,
    diseases: ['cercospora_leaf_spot'],
  },
}

/* --- Disease infection models ---------------------------------------------
 * Each model describes the conditions under which a pathogen infects. We score
 * each of the next 7 days, because infection is driven by *conditions*, not by
 * visible symptoms — which is what buys the farmer early warning.
 *
 * tempBand   : [min, max] degrees C in which infection proceeds
 * rhThreshold: relative humidity (%) above which leaf wetness is assumed
 * wetHours   : hours at/above rhThreshold needed for an infection event
 * inverse    : true = risk rises in DRY conditions (e.g. thrips)         */
const DISEASE_MODELS = {
  northern_leaf_blight: {
    label: 'Northern Leaf Blight',
    crop: 'Maize',
    tempBand: [18, 27],
    rhThreshold: 90,
    wetHours: 6,
    action:
      'Scout lower leaves for long cigar-shaped lesions. If found, apply mancozeb or azoxystrobin and avoid overhead irrigation late in the day.',
  },
  rice_blast: {
    label: 'Rice Blast',
    crop: 'Rice',
    tempBand: [20, 28],
    rhThreshold: 90,
    wetHours: 8,
    action:
      'Avoid excess nitrogen, which softens tissue and worsens blast. Drain briefly if the canopy stays wet, and consider a tricyclazole application at high risk.',
  },
  tomato_early_blight: {
    label: 'Early Blight',
    crop: 'Tomato',
    tempBand: [24, 29],
    rhThreshold: 85,
    wetHours: 6,
    action:
      'Remove affected lower leaves, mulch to stop soil splash, and apply a copper-based or mancozeb fungicide on a 7–10 day cycle.',
  },
  tomato_late_blight: {
    label: 'Late Blight',
    crop: 'Tomato',
    tempBand: [10, 24],
    rhThreshold: 90,
    wetHours: 8,
    action:
      'Late blight moves fast. Improve airflow, stop evening irrigation, and treat preventively with a protectant fungicide before symptoms appear.',
  },
  anthracnose: {
    label: 'Anthracnose',
    crop: 'Pepper',
    tempBand: [20, 30],
    rhThreshold: 88,
    wetHours: 8,
    action:
      'Remove and destroy infected fruit, avoid working rows while wet, and apply a protectant fungicide during extended humid spells.',
  },
  purple_blotch: {
    label: 'Purple Blotch',
    crop: 'Onion',
    tempBand: [21, 30],
    rhThreshold: 85,
    wetHours: 8,
    action:
      'Space rows for airflow, irrigate at the base rather than overhead, and apply mancozeb if lesions with purple centres appear.',
  },
  thrips_pressure: {
    label: 'Thrips Pressure',
    crop: 'Onion',
    tempBand: [25, 40],
    rhThreshold: 55,
    wetHours: 10,
    inverse: true, // thrips thrive in hot, DRY weather
    action:
      'Hot dry spells drive thrips. Hang blue sticky traps to monitor, spray neem oil at dusk every 5–7 days, and avoid excess nitrogen.',
  },
  cercospora_leaf_spot: {
    label: 'Cercospora Leaf Spot',
    crop: 'Cowpea',
    tempBand: [20, 30],
    rhThreshold: 88,
    wetHours: 8,
    action:
      'Rotate away from cowpea next season, remove crop debris, and apply a protectant fungicide if spots spread past the lower canopy.',
  },
}

/* --------------------------------------------------------------------------
 * Growth stage
 * ------------------------------------------------------------------------*/

/** Days between a planting date and today. */
export function daysSincePlanting(plantedOn, now = new Date()) {
  const start = new Date(plantedOn)
  if (Number.isNaN(start.getTime())) return 0
  return Math.max(0, Math.floor((now - start) / 86400000))
}

/** Resolve the crop's current growth stage and Kc from days after planting. */
export function currentStage(cropKey, dap) {
  const crop = CROPS[cropKey]
  if (!crop) return null
  const stage = crop.stages.find((s) => dap <= s.untilDay) || crop.stages[crop.stages.length - 1]
  const idx = crop.stages.indexOf(stage)
  const prevUntil = idx > 0 ? crop.stages[idx - 1].untilDay : 0
  const span = Math.max(1, stage.untilDay - prevUntil)
  const total = crop.stages[crop.stages.length - 1].untilDay
  return {
    name: stage.name,
    kc: stage.kc,
    stageProgress: Math.min(100, Math.round(((dap - prevUntil) / span) * 100)),
    seasonProgress: Math.min(100, Math.round((dap / total) * 100)),
    daysToHarvest: Math.max(0, total - dap),
  }
}

/* --------------------------------------------------------------------------
 * Water balance — the irrigation decision
 * ------------------------------------------------------------------------*/

/**
 * Effective rainfall: not all rain reaches the root zone. Light rain is lost
 * to evaporation and heavy rain to runoff. USDA-SCS style approximation.
 */
export function effectiveRainfall(mm) {
  if (mm <= 2) return 0 // wets the leaves, never reaches the roots
  if (mm <= 75) return mm * 0.8
  return 75 * 0.8 + (mm - 75) * 0.35
}

/**
 * Daily water balance for one field.
 *
 *   ETc            = ET0 x Kc                  (crop water demand, mm)
 *   deficit        = ETc - effective rainfall  (what irrigation must supply)
 *   litres/hectare = deficit(mm) x 10,000      (1 mm over 1 ha = 10,000 L)
 *
 * `efficiency` accounts for delivery losses: drip ~0.9, sprinkler ~0.75,
 * furrow/flood ~0.6.
 */
export function waterBalance({ et0, rainfall, kc, areaHa = 1, efficiency = 0.75 }) {
  const etc = et0 * kc
  const effRain = effectiveRainfall(rainfall)
  const deficitMm = Math.max(0, etc - effRain)
  const netLitres = deficitMm * 10000 * areaHa
  const grossLitres = efficiency > 0 ? netLitres / efficiency : netLitres

  return {
    etcMm: round(etc, 2),
    rainfallMm: round(rainfall, 1),
    effectiveRainMm: round(effRain, 2),
    deficitMm: round(deficitMm, 2),
    litresNeeded: Math.round(grossLitres),
    irrigationNeeded: deficitMm > 0.5,
  }
}

/**
 * What a fixed-schedule farmer would apply instead: a set depth on set days,
 * regardless of weather. This is the baseline MahaFarm is measured against —
 * and the source of the "water saved" figure.
 */
export function fixedScheduleBaseline({ depthMm = 25, daysPerWeek = 3, areaHa = 1, efficiency = 0.75 }) {
  const dailyMm = (depthMm * daysPerWeek) / 7
  const litres = (dailyMm * 10000 * areaHa) / (efficiency || 1)
  return { dailyMm: round(dailyMm, 2), litres: Math.round(litres) }
}

/* --------------------------------------------------------------------------
 * Disease risk — the early-warning decision
 * ------------------------------------------------------------------------*/

/**
 * Score one day for one pathogen from hourly temperature and humidity.
 * Returns 0-100. The score rises with the number of hours that sit inside the
 * infection window, so a day with a long humid night scores far above a day
 * with one humid hour.
 */
function scoreDay(model, hours) {
  const [tMin, tMax] = model.tempBand
  let favourableHours = 0

  for (const h of hours) {
    const tempOk = h.temp >= tMin && h.temp <= tMax
    const humidOk = model.inverse ? h.rh <= model.rhThreshold : h.rh >= model.rhThreshold
    if (tempOk && humidOk) favourableHours++
  }

  // Ratio against the hours needed for an infection event, capped at 100.
  const ratio = favourableHours / model.wetHours
  return {
    score: Math.min(100, Math.round(ratio * 70)), // 70 = one full infection event
    favourableHours,
  }
}

export function riskLabel(score) {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Moderate'
  if (score >= 15) return 'Low'
  return 'Minimal'
}

/**
 * Forecast disease risk for a crop across the next N days.
 * `dailyHours` is an array of days, each an array of {temp, rh} hourly points.
 */
export function diseaseForecast(cropKey, dailyHours, dates) {
  const crop = CROPS[cropKey]
  if (!crop) return []

  return crop.diseases.map((key) => {
    const model = DISEASE_MODELS[key]
    const days = dailyHours.map((hours, i) => {
      const { score, favourableHours } = scoreDay(model, hours)
      return { date: dates[i], score, favourableHours, level: riskLabel(score) }
    })

    const peak = days.reduce((a, b) => (b.score > a.score ? b : a), days[0])
    // Lead time: how many days before the peak the farmer is being warned.
    const leadDays = days.indexOf(peak)

    return {
      key,
      label: model.label,
      crop: model.crop,
      action: model.action,
      peakScore: peak.score,
      peakLevel: riskLabel(peak.score),
      peakDate: peak.date,
      leadDays,
      days,
    }
  })
}

/* --------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------*/

function round(n, dp) {
  const f = 10 ** dp
  return Math.round(n * f) / f
}

export const CROP_KEYS = Object.keys(CROPS)
export { DISEASE_MODELS }
