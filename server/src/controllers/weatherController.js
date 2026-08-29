import { asyncHandler } from '../utils/asyncHandler.js'

/**
 * Static weather payload for Phase 2. The structure matches what the
 * frontend expects; in production this controller would call a weather
 * provider (e.g. OpenWeather) and cache the response per location.
 */
const WEATHER = {
  now: {
    place: 'Kura, Kano State',
    temp: 31,
    condition: 'Partly cloudy',
    feelsLike: 34,
    humidity: 58,
    wind: 12,
    windDir: 'WSW',
    rainChance: 20,
    uv: 8,
    sunrise: '06:12',
    sunset: '18:54',
  },
  forecast: [
    { day: 'Today', icon: 'cloud-sun', hi: 33, lo: 22, rain: 20, condition: 'Partly cloudy' },
    { day: 'Sat', icon: 'sun', hi: 35, lo: 23, rain: 5, condition: 'Sunny' },
    { day: 'Sun', icon: 'cloud-rain', hi: 30, lo: 22, rain: 70, condition: 'Showers' },
    { day: 'Mon', icon: 'cloud-rain', hi: 28, lo: 21, rain: 80, condition: 'Rain' },
    { day: 'Tue', icon: 'cloud-sun', hi: 31, lo: 22, rain: 30, condition: 'Cloudy' },
    { day: 'Wed', icon: 'sun', hi: 34, lo: 23, rain: 10, condition: 'Sunny' },
    { day: 'Thu', icon: 'cloud-sun', hi: 32, lo: 22, rain: 25, condition: 'Cloudy' },
  ],
  advisories: [
    { id: 'w1', severity: 'warn', icon: 'cloud-rain', title: 'Heavy rain expected Sun–Mon', body: '70–80% chance of showers. Pause scheduled irrigation and check drainage on the rice plot and low-lying fields.' },
    { id: 'w2', severity: 'info', icon: 'sun', title: 'High UV through Saturday', body: 'UV index 8. Good drying conditions for harvested maize and cowpea; deploy greenhouse shade nets midday.' },
  ],
}

/** GET /api/weather — current conditions, 7-day forecast, advisories. */
export const getWeather = asyncHandler(async (req, res) => {
  res.json(WEATHER)
})
