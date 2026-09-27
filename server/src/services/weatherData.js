/* ============================================================================
 * Open-Meteo client — free agro-meteorological data, no API key, no sensors.
 *
 * Why this matters for MahaFarm: it removes the hardware barrier. A farmer who
 * can name their location and crop gets an irrigation and disease advisory
 * immediately, with no probe to buy, install or maintain. Sensors become the
 * premium tier, not the price of entry.
 *
 * Endpoints used (both free for non-commercial use, no key required):
 *   https://api.open-meteo.com/v1/forecast
 *   https://geocoding-api.open-meteo.com/v1/search
 *
 * Every call has a timeout and a documented fallback, so the advisory degrades
 * gracefully instead of failing. Responses are cached in-process for 30 minutes
 * to stay well inside the free rate limits.
 * ==========================================================================*/

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const TIMEOUT_MS = 9000
const CACHE_TTL_MS = 30 * 60 * 1000

const cache = new Map()

/** Common Nigerian farming locations, so a lookup works even if geocoding is down. */
export const KNOWN_LOCATIONS = {
  kano: { name: 'Kano', admin: 'Kano State', lat: 12.0022, lon: 8.5919 },
  kura: { name: 'Kura', admin: 'Kano State', lat: 11.7746, lon: 8.4254 },
  kaduna: { name: 'Kaduna', admin: 'Kaduna State', lat: 10.5222, lon: 7.4383 },
  zaria: { name: 'Zaria', admin: 'Kaduna State', lat: 11.0855, lon: 7.7199 },
  jos: { name: 'Jos', admin: 'Plateau State', lat: 9.8965, lon: 8.8583 },
  ibadan: { name: 'Ibadan', admin: 'Oyo State', lat: 7.3775, lon: 3.947 },
  ogbomoso: { name: 'Ogbomoso', admin: 'Oyo State', lat: 8.1335, lon: 4.2407 },
  makurdi: { name: 'Makurdi', admin: 'Benue State', lat: 7.7322, lon: 8.5391 },
  minna: { name: 'Minna', admin: 'Niger State', lat: 9.6139, lon: 6.5569 },
  sokoto: { name: 'Sokoto', admin: 'Sokoto State', lat: 13.0059, lon: 5.2476 },
  maiduguri: { name: 'Maiduguri', admin: 'Borno State', lat: 11.8333, lon: 13.15 },
  abuja: { name: 'Abuja', admin: 'FCT', lat: 9.0765, lon: 7.3986 },
  lagos: { name: 'Lagos', admin: 'Lagos State', lat: 6.5244, lon: 3.3792 },
  enugu: { name: 'Enugu', admin: 'Enugu State', lat: 6.4584, lon: 7.5464 },
}

/** fetch with a timeout, so a hanging upstream can never hang our API. */
async function fetchJson(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Upstream responded ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

function cacheGet(key) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value
  cache.delete(key)
  return null
}

function cacheSet(key, value) {
  cache.set(key, { at: Date.now(), value })
  return value
}

/* --------------------------------------------------------------------------
 * Geocoding — turn "Kura, Kano" into coordinates
 * ------------------------------------------------------------------------*/
export async function geocode(place) {
  const key = String(place || '').trim().toLowerCase()
  if (!key) throw new Error('A location is required')

  // Local table first: instant, and works with no network.
  const local = KNOWN_LOCATIONS[key.split(',')[0].trim()]
  if (local) {
    return { name: local.name, admin: local.admin, country: 'Nigeria', lat: local.lat, lon: local.lon, source: 'local' }
  }

  const cached = cacheGet(`geo:${key}`)
  if (cached) return cached

  try {
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(place)}&count=1&language=en&format=json`
    const data = await fetchJson(url)
    const r = data?.results?.[0]
    if (!r) throw new Error(`No match for "${place}"`)
    return cacheSet(`geo:${key}`, {
      name: r.name,
      admin: r.admin1 || '',
      country: r.country || '',
      lat: r.latitude,
      lon: r.longitude,
      source: 'open-meteo',
    })
  } catch (err) {
    // Last resort so an advisory can still be produced.
    const fb = KNOWN_LOCATIONS.kano
    return { name: fb.name, admin: fb.admin, country: 'Nigeria', lat: fb.lat, lon: fb.lon, source: 'fallback', note: err.message }
  }
}

/* --------------------------------------------------------------------------
 * Forecast — hourly temp/humidity + daily ET0 and rainfall
 * ------------------------------------------------------------------------*/

/**
 * Fetch 7 past days and 7 forecast days for a coordinate.
 * ET0 (FAO-56 Penman-Monteith reference evapotranspiration) is computed by
 * Open-Meteo itself, so the water balance rests on a standard model rather
 * than an approximation of our own.
 */
export async function fetchAgroWeather(lat, lon) {
  const key = `wx:${lat.toFixed(2)},${lon.toFixed(2)}`
  const cached = cacheGet(key)
  if (cached) return cached

  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: 'temperature_2m,relative_humidity_2m,precipitation',
    daily:
      'et0_fao_evapotranspiration,precipitation_sum,temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,precipitation_probability_max',
    timezone: 'auto',
    past_days: '7',
    forecast_days: '7',
  })

  try {
    const data = await fetchJson(`${FORECAST_URL}?${params}`)
    return cacheSet(key, normalise(data))
  } catch (err) {
    return { ...syntheticWeather(lat), source: 'fallback', note: `Live weather unavailable (${err.message})` }
  }
}

/** Reshape Open-Meteo's column arrays into day objects the engine can use. */
function normalise(data) {
  const d = data.daily || {}
  const h = data.hourly || {}

  const days = (d.time || []).map((date, i) => ({
    date,
    et0: num(d.et0_fao_evapotranspiration?.[i], 4.5),
    rainfall: num(d.precipitation_sum?.[i], 0),
    tMax: num(d.temperature_2m_max?.[i], 32),
    tMin: num(d.temperature_2m_min?.[i], 22),
    rhMax: num(d.relative_humidity_2m_max?.[i], 80),
    rainChance: num(d.precipitation_probability_max?.[i], 0),
  }))

  // Group hourly readings under their date so the disease models can count
  // consecutive favourable hours.
  const hourlyByDate = {}
  ;(h.time || []).forEach((ts, i) => {
    const date = ts.slice(0, 10)
    if (!hourlyByDate[date]) hourlyByDate[date] = []
    hourlyByDate[date].push({
      hour: ts.slice(11, 16),
      temp: num(h.temperature_2m?.[i], 28),
      rh: num(h.relative_humidity_2m?.[i], 70),
      rain: num(h.precipitation?.[i], 0),
    })
  })

  return {
    timezone: data.timezone || 'Africa/Lagos',
    days,
    hourlyByDate,
    source: 'open-meteo',
  }
}

function num(v, fallback) {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

/* --------------------------------------------------------------------------
 * Fallback dataset
 * ------------------------------------------------------------------------*
 * If Open-Meteo cannot be reached the advisory still runs, on a climatology
 * profile for the latitude band. It is ALWAYS labelled source: 'fallback' so
 * the interface can say plainly that these are seasonal norms, not live data.
 * Honest degradation beats a blank screen.
 */
function syntheticWeather(lat = 12) {
  const humidBelt = lat < 9 // southern Nigeria is wetter than the Sahel
  const today = new Date()
  const days = []
  const hourlyByDate = {}

  for (let i = -7; i < 7; i++) {
    const dt = new Date(today)
    dt.setDate(dt.getDate() + i)
    const date = dt.toISOString().slice(0, 10)
    const wave = Math.sin((i + 7) / 2.2)

    const tMax = (humidBelt ? 31 : 34) + wave * 2
    const tMin = (humidBelt ? 23 : 21) + wave
    const rainfall = Math.max(0, (humidBelt ? 6 : 3) + wave * 5)
    const rhMax = (humidBelt ? 92 : 80) + wave * 4

    days.push({
      date,
      et0: (humidBelt ? 4.0 : 5.2) - wave * 0.5,
      rainfall: round1(rainfall),
      tMax: round1(tMax),
      tMin: round1(tMin),
      rhMax: Math.min(99, round1(rhMax)),
      rainChance: Math.min(95, Math.round(rainfall * 8)),
    })

    hourlyByDate[date] = Array.from({ length: 24 }, (_, hr) => {
      // Cool, humid nights; hot, drier afternoons.
      const diurnal = Math.cos(((hr - 15) / 24) * 2 * Math.PI)
      return {
        hour: `${String(hr).padStart(2, '0')}:00`,
        temp: round1(tMin + ((tMax - tMin) * (diurnal + 1)) / 2),
        rh: Math.min(99, Math.max(25, round1(rhMax - ((diurnal + 1) / 2) * 35))),
        rain: 0,
      }
    })
  }

  return { timezone: 'Africa/Lagos', days, hourlyByDate }
}

function round1(n) {
  return Math.round(n * 10) / 10
}
