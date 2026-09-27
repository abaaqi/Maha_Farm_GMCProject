/* ============================================================================
 * Foresight advisor — the AI layer.
 *
 * Division of labour, deliberately strict:
 *   agronomy.js  computes the NUMBERS   (deterministic, auditable, testable)
 *   advisor.js   writes the ADVICE      (language, priority, local idiom)
 *
 * The model is never asked to calculate anything. It receives figures that are
 * already correct and turns them into a short, prioritised plan a farmer can
 * act on — optionally in Hausa. That keeps hallucination out of the numbers
 * while using the model for what it is genuinely good at.
 *
 * Provider-agnostic: any OpenAI-compatible chat endpoint works (NVIDIA Build,
 * Groq, OpenAI, a local Ollama/LM Studio server). Set LLM_BASE_URL, LLM_MODEL
 * and LLM_API_KEY. With no key configured it falls back to a deterministic
 * template writer, so the advisory always renders.
 * ==========================================================================*/

import { env } from '../config/env.js'

const TIMEOUT_MS = 20000

/* --------------------------------------------------------------------------
 * Prompt construction
 * ------------------------------------------------------------------------*/

const SYSTEM_PROMPT = `You are an agricultural extension advisor for smallholder and mid-size farms in Nigeria.

You will be given FACTS that have already been calculated from weather data and FAO-56 agronomic models. Your job is to turn those facts into a short, prioritised action plan.

Rules you must follow:
- NEVER invent, alter or recalculate any number. Use only the figures given.
- Lead with the single most urgent action.
- Be concrete and practical: say what to do, when, and roughly how much.
- Write for a working farmer, not an agronomist. Short sentences. No jargon without a plain-language gloss.
- Mention cost or saving in Naira only if a figure is supplied.
- If disease risk is high, say what conditions are driving it (humidity, temperature) so the farmer understands the warning is a forecast, not a diagnosis.
- Never claim a disease is present. These are risk forecasts based on weather conditions.
- End with one short line on what to watch next.
- Maximum 150 words.`

function buildFactSheet(payload) {
  const { location, crop, stage, water, disease, savings } = payload

  const lines = [
    `Location: ${location.name}${location.admin ? ', ' + location.admin : ''}`,
    `Crop: ${crop.label}`,
    `Growth stage: ${stage.name} (day ${stage.dap} after planting, ${stage.seasonProgress}% through the season, about ${stage.daysToHarvest} days to harvest)`,
    '',
    'WATER BALANCE (today):',
    `- Crop water demand (ETc): ${water.etcMm} mm`,
    `- Rainfall: ${water.rainfallMm} mm, of which ${water.effectiveRainMm} mm reaches the root zone`,
    `- Irrigation deficit: ${water.deficitMm} mm`,
    `- Water to apply: ${water.litresNeeded.toLocaleString()} litres across ${payload.areaHa} hectare(s)`,
    `- Irrigation needed today: ${water.irrigationNeeded ? 'YES' : 'NO'}`,
    '',
    'WATER SAVED vs a fixed 3-day-a-week schedule (this week):',
    `- Fixed schedule would apply: ${savings.baselineLitres.toLocaleString()} litres`,
    `- Foresight recommends: ${savings.foresightLitres.toLocaleString()} litres`,
    `- Saving: ${savings.litresSaved.toLocaleString()} litres (${savings.percentSaved}%)`,
    '',
    'DISEASE RISK FORECAST (next 7 days):',
  ]

  for (const d of disease) {
    lines.push(
      `- ${d.label}: peak risk ${d.peakLevel} (${d.peakScore}/100) on ${d.peakDate}, ${d.leadDays} day(s) from now. Standard response: ${d.action}`
    )
  }

  return lines.join('\n')
}

/* --------------------------------------------------------------------------
 * LLM call
 * ------------------------------------------------------------------------*/

async function callModel(factSheet, language) {
  const langLine =
    language === 'ha'
      ? 'Write your entire answer in Hausa, in simple everyday language a farmer in northern Nigeria would use.'
      : 'Write your answer in clear English.'

  const body = {
    model: env.llmModel,
    messages: [
      { role: 'system', content: `${SYSTEM_PROMPT}\n\n${langLine}` },
      { role: 'user', content: `Here are today's facts for this field:\n\n${factSheet}\n\nWrite the action plan.` },
    ],
    temperature: 0.3,
    max_tokens: 500,
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(`${env.llmBaseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.llmApiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Model responded ${res.status} ${text.slice(0, 120)}`)
    }

    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim()
    if (!content) throw new Error('Model returned an empty response')
    return content
  } finally {
    clearTimeout(timer)
  }
}

/* --------------------------------------------------------------------------
 * Deterministic fallback writer
 * ------------------------------------------------------------------------*
 * Used when no model is configured or the call fails. Produces a usable plan
 * from the same facts — so the product degrades in quality, never in function.
 */
/* Crop names in Hausa, so a Hausa advisory reads as one language throughout. */
const CROP_HA = {
  Maize: 'masara',
  Rice: 'shinkafa',
  Tomato: 'tumatir',
  'Tatashe Pepper': 'tatashe',
  Onion: 'albasa',
  Cowpea: 'wake',
}

/* Disease names in Hausa where a common term exists. */
const DISEASE_HA = {
  'Thrips Pressure': 'kwarin thrips',
  'Northern Leaf Blight': 'cutar bushewar ganye',
  'Rice Blast': 'cutar shinkafa (blast)',
  'Early Blight': 'cutar ganye da wuri',
  'Late Blight': 'cutar ganye ta baya',
  'Purple Blotch': 'cutar tabo mai shunayya',
  Anthracnose: 'cutar anthracnose',
  'Cercospora Leaf Spot': 'cutar tabon ganye',
}

function templateAdvisory(payload, language) {
  const { crop, stage, water, disease, savings } = payload
  const top = [...disease].sort((a, b) => b.peakScore - a.peakScore)[0]
  const ha = payload.areaHa

  if (language === 'ha') {
    const cropHa = CROP_HA[crop.label] || crop.label
    const topHa = top ? DISEASE_HA[top.label] || top.label : ''
    const parts = [
      water.irrigationNeeded
        ? `Ban ruwa yau: ka zuba kusan lita ${water.litresNeeded.toLocaleString()} a kan hekta ${ha} na ${cropHa}. Ruwan sama bai isa ba — ya rage milimita ${water.deficitMm}.`
        : `Ba sai ka ban ruwa yau ba. Ruwan sama ya isa bukatar ${cropHa} a wannan matakin.`,
      top && top.peakScore >= 40
        ? `Kula: yiwuwar ${topHa} ta ${top.peakLevel === 'High' ? 'yi yawa' : 'zama matsakaiciya'} ${top.leadDays === 0 ? 'yau' : `cikin kwana ${top.leadDays}`}. Yanayin zafi da danshi ne ke haifar da haka — wannan hasashe ne, ba tabbacin cuta ba.`
        : 'Babu babbar barazanar cuta a wannan makon.',
      `A wannan makon ka ceci kusan lita ${savings.litresSaved.toLocaleString()} (${savings.percentSaved}%) idan aka kwatanta da ban ruwa na yau da kullum.`,
      'Duba ganyen shuka da safe, sannan ka sake duba gobe.',
    ]
    return parts.filter(Boolean).join('\n\n')
  }

  const parts = []

  if (water.irrigationNeeded) {
    parts.push(
      `**Irrigate today.** Apply about ${water.litresNeeded.toLocaleString()} litres across ${ha} hectare(s) of ${crop.label}. ` +
        `Crop demand is ${water.etcMm} mm and rainfall only delivered ${water.effectiveRainMm} mm to the root zone, leaving a ${water.deficitMm} mm deficit. ` +
        `Water early morning so the leaves dry before nightfall.`
    )
  } else {
    parts.push(
      `**No irrigation needed today.** Rainfall covered the ${water.etcMm} mm your ${crop.label} needs at the ${stage.name} stage. Hold the pump and re-check tomorrow.`
    )
  }

  if (top && top.peakScore >= 40) {
    parts.push(
      `**Watch for ${top.label}.** Risk peaks at ${top.peakLevel.toLowerCase()} (${top.peakScore}/100) in ${top.leadDays} day(s), driven by the temperature and humidity in the forecast — this is a warning, not a diagnosis. ${top.action}`
    )
  } else {
    parts.push(`**Disease pressure is low this week.** Nothing in the forecast reaches an infection threshold for ${crop.label}.`)
  }

  parts.push(
    `**This week you save about ${savings.litresSaved.toLocaleString()} litres (${savings.percentSaved}%)** against a fixed three-day-a-week schedule.`
  )
  parts.push(`Next: check the lower leaves each morning and re-run this advisory tomorrow — the forecast moves.`)

  return parts.join('\n\n')
}

/* --------------------------------------------------------------------------
 * Public entry point
 * ------------------------------------------------------------------------*/

/**
 * Produce the written advisory for a computed foresight payload.
 * Always resolves — never throws — so the endpoint cannot fail on the AI step.
 */
export async function writeAdvisory(payload, language = 'en') {
  const factSheet = buildFactSheet(payload)

  if (!env.llmApiKey) {
    return {
      text: templateAdvisory(payload, language),
      engine: 'rule-based',
      model: null,
      note: 'No language model configured — advisory written by the built-in rules engine.',
    }
  }

  try {
    const text = await callModel(factSheet, language)
    return { text, engine: 'llm', model: env.llmModel, note: null }
  } catch (err) {
    return {
      text: templateAdvisory(payload, language),
      engine: 'rule-based-fallback',
      model: env.llmModel,
      note: `Language model unavailable (${err.message}) — fell back to the rules engine.`,
    }
  }
}

export { buildFactSheet }
