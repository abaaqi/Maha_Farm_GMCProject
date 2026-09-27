/* ============================================================
   MahaFarm — mock data (Phase 1)
   In Phase 2 these shapes are served by the Express/Mongo API.
   Keeping the shapes realistic now makes the swap painless.
   ============================================================ */

export const farmProfile = {
  name: 'Kura Valley Farms',
  owner: 'Abdul-Baaqi Jempeji',
  location: 'Kura, Kano State',
  area: 48,
  areaUnit: 'hectares',
  established: 2019,
  zones: 6,
}

/* --- Headline KPIs shown on the dashboard --- */
export const kpis = [
  {
    id: 'moisture',
    label: 'Avg soil moisture',
    value: 62,
    unit: '%',
    trend: +4.2,
    status: 'healthy',
    hint: 'Optimal band 55–70%',
  },
  {
    id: 'water',
    label: 'Water saved this week',
    value: 18400,
    unit: 'L',
    trend: +11.8,
    status: 'healthy',
    hint: 'vs. manual schedule',
  },
  {
    id: 'health',
    label: 'Crop health index',
    value: 91,
    unit: '/100',
    trend: +1.6,
    status: 'healthy',
    hint: 'AI vision across 6 zones',
  },
  {
    id: 'alerts',
    label: 'Open alerts',
    value: 3,
    unit: '',
    trend: -2,
    status: 'warn',
    hint: '1 needs attention today',
  },
]

/* --- Soil-moisture trend (last 24h, one point / 2h) --- */
export const moistureSeries = [
  { t: '00:00', zoneA: 58, zoneB: 64, zoneC: 51 },
  { t: '02:00', zoneA: 57, zoneB: 63, zoneC: 50 },
  { t: '04:00', zoneA: 55, zoneB: 62, zoneC: 48 },
  { t: '06:00', zoneA: 54, zoneB: 60, zoneC: 47 },
  { t: '08:00', zoneA: 60, zoneB: 66, zoneC: 53 },
  { t: '10:00', zoneA: 65, zoneB: 69, zoneC: 58 },
  { t: '12:00', zoneA: 63, zoneB: 67, zoneC: 60 },
  { t: '14:00', zoneA: 61, zoneB: 65, zoneC: 57 },
  { t: '16:00', zoneA: 64, zoneB: 68, zoneC: 59 },
  { t: '18:00', zoneA: 66, zoneB: 70, zoneC: 62 },
  { t: '20:00', zoneA: 63, zoneB: 67, zoneC: 60 },
  { t: '22:00', zoneA: 62, zoneB: 66, zoneC: 58 },
]

/* --- Water usage automated vs manual baseline (this week) --- */
export const waterSeries = [
  { day: 'Mon', automated: 2100, baseline: 3200 },
  { day: 'Tue', automated: 1850, baseline: 3000 },
  { day: 'Wed', automated: 2400, baseline: 3300 },
  { day: 'Thu', automated: 1600, baseline: 2900 },
  { day: 'Fri', automated: 2000, baseline: 3100 },
  { day: 'Sat', automated: 2250, baseline: 3250 },
  { day: 'Sun', automated: 1700, baseline: 3050 },
]

/* --- Live sensor tiles --- */
export const sensors = [
  { id: 's1', label: 'Soil moisture', value: 62, unit: '%', status: 'healthy', icon: 'droplets', zone: 'Zone A' },
  { id: 's2', label: 'Air temp', value: 29.4, unit: '°C', status: 'healthy', icon: 'thermometer', zone: 'Field avg' },
  { id: 's3', label: 'Humidity', value: 68, unit: '%', status: 'healthy', icon: 'wind', zone: 'Field avg' },
  { id: 's4', label: 'Soil pH', value: 6.8, unit: 'pH', status: 'healthy', icon: 'flask', zone: 'Zone B' },
  { id: 's5', label: 'Light', value: 842, unit: 'µmol', status: 'warn', icon: 'sun', zone: 'Greenhouse' },
  { id: 's6', label: 'Tank level', value: 41, unit: '%', status: 'warn', icon: 'gauge', zone: 'Reservoir' },
]

/* --- Field / zone cards for crop monitoring --- */
export const fields = [
  {
    id: 'f1', name: 'North Block', crop: 'Maize', variety: 'Oba Super 2', stage: 'Tasselling',
    progress: 64, health: 94, moisture: 66, plantedOn: '2026-05-12',
    nextAction: 'Top-dress urea in 2 days', status: 'healthy',
  },
  {
    id: 'f2', name: 'River Plot', crop: 'Rice', variety: 'FARO 44', stage: 'Panicle initiation',
    progress: 48, health: 88, moisture: 72, plantedOn: '2026-06-03',
    nextAction: 'Maintain paddy water level', status: 'healthy',
  },
  {
    id: 'f3', name: 'East Terrace', crop: 'Tomato', variety: 'Roma VF', stage: 'Flowering',
    progress: 52, health: 73, moisture: 47, plantedOn: '2026-06-21',
    nextAction: 'Low moisture — irrigation queued', status: 'warn',
  },
  {
    id: 'f4', name: 'Greenhouse 1', crop: 'Tatashe Pepper', variety: 'Sweet Red', stage: 'Vegetative',
    progress: 31, health: 90, moisture: 64, plantedOn: '2026-07-18',
    nextAction: 'On track', status: 'healthy',
  },
  {
    id: 'f5', name: 'South Field', crop: 'Onion', variety: 'Red Creole', stage: 'Bulb development',
    progress: 70, health: 67, moisture: 44, plantedOn: '2026-04-08',
    nextAction: 'Possible thrips — scan advised', status: 'alert',
  },
  {
    id: 'f6', name: 'West Block', crop: 'Cowpea', variety: 'IT90K-277-2', stage: 'Pod filling',
    progress: 88, health: 92, moisture: 55, plantedOn: '2026-05-15',
    nextAction: 'Harvest window in ~9 days', status: 'healthy',
  },
]

export const alerts = [
  {
    id: 'a1',
    severity: 'alert',
    title: 'Possible thrips in South Field',
    body: 'Vision model flagged leaf stippling on onion rows 4–7. Confidence 86%.',
    time: '12 min ago',
    zone: 'South Field',
  },
  {
    id: 'a2',
    severity: 'warn',
    title: 'Reservoir below 45%',
    body: 'Tank level trending down. Refill scheduled, ETA tomorrow 06:00.',
    time: '1 hr ago',
    zone: 'Reservoir',
  },
  {
    id: 'a3',
    severity: 'warn',
    title: 'East Terrace soil moisture low',
    body: 'Dropped to 47%. Auto-irrigation queued for the next window.',
    time: '2 hr ago',
    zone: 'East Terrace',
  },
  {
    id: 'a4',
    severity: 'info',
    title: 'Fertigation completed',
    body: 'North Block received scheduled nutrient mix (12 min cycle).',
    time: '5 hr ago',
    zone: 'North Block',
  },
]

/* --- Upcoming automated tasks --- */
export const schedule = [
  { id: 't1', time: '14:30', label: 'Drip irrigation — East Terrace', kind: 'water', auto: true },
  { id: 't2', time: '16:00', label: 'Fertigation — North Block', kind: 'nutrient', auto: true },
  { id: 't3', time: '18:45', label: 'Vision scan — all greenhouses', kind: 'scan', auto: true },
  { id: 't4', time: '06:00', label: 'Reservoir refill', kind: 'water', auto: false },
]

/* --- Disease detection demo results (used after a mock "scan") --- */
export const diseaseResults = [
  {
    crop: 'Tomato',
    name: 'Early Blight',
    pathogen: 'Alternaria solani',
    confidence: 92,
    severity: 'Moderate',
    treatment:
      'Remove affected lower leaves. Apply a copper-based or mancozeb fungicide every 7–10 days. Improve airflow and avoid overhead watering.',
  },
  {
    crop: 'Maize',
    name: 'Northern Leaf Blight',
    pathogen: 'Exserohilum turcicum',
    confidence: 88,
    severity: 'High',
    treatment:
      'Apply a mancozeb or azoxystrobin fungicide promptly. Remove infected lower leaves and rotate away from maize next season.',
  },
  {
    crop: 'Pepper',
    name: 'Healthy',
    pathogen: '—',
    confidence: 97,
    severity: 'None',
    treatment: 'No action needed. Foliage shows healthy pigmentation and structure. Keep monitoring.',
  },
]

/* --- Marketplace listings --- */
export const products = [
  { id: 'p1', name: 'Roma Tomatoes', grade: 'A', price: 1500, unit: 'kg', stock: 380, category: 'Vegetable', seller: 'East Terrace', trend: +9 },
  { id: 'p2', name: 'Red Creole Onion', grade: 'A', price: 1100, unit: 'kg', stock: 2100, category: 'Vegetable', seller: 'South Field', trend: -2 },
  { id: 'p3', name: 'Yellow Maize', grade: 'A', price: 850, unit: 'kg', stock: 4200, category: 'Grain', seller: 'North Block', trend: +4 },
  { id: 'p4', name: 'FARO 44 Paddy Rice', grade: 'A', price: 1250, unit: 'kg', stock: 3600, category: 'Grain', seller: 'River Plot', trend: +3 },
  { id: 'p5', name: 'Tatashe Pepper', grade: 'A', price: 2400, unit: 'kg', stock: 220, category: 'Vegetable', seller: 'Greenhouse 1', trend: +7 },
  { id: 'p6', name: 'Brown Cowpea (Beans)', grade: 'A', price: 2200, unit: 'kg', stock: 1500, category: 'Grain', seller: 'West Block', trend: +5 },
  { id: 'p7', name: 'Watermelon', grade: 'A', price: 900, unit: 'piece', stock: 640, category: 'Fruit', seller: 'South Field', trend: +2 },
  { id: 'p8', name: 'Groundnut Oil', grade: 'Premium', price: 4800, unit: 'litre', stock: 150, category: 'Processed', seller: 'North Block', trend: +6 },
]

export const productCategories = ['All', 'Fruit', 'Vegetable', 'Grain', 'Processed']

/* --- AI assistant seed conversation + canned replies --- */
export const assistantSeed = [
  {
    role: 'assistant',
    text: "Namaste! I'm your MahaFarm assistant. Ask me about irrigation, pests, fertilizer schedules, or what your fields need today.",
  },
]

export const assistantSuggestions = [
  'What does East Terrace need today?',
  'Best time to irrigate tomato?',
  'How do I treat onion thrips organically?',
  'Fertilizer plan for maize at tasselling',
]

export const assistantCanned = {
  default:
    "Here's a quick take: based on current sensor readings, your priority today is East Terrace — soil moisture is at 47%, below the 55% comfort band for flowering tomatoes. Auto-irrigation is already queued for the next window. I'd also scan South Field, where the vision model flagged possible thrips.",
  irrigate:
    'For tomato at flowering, irrigate early morning (5–7 AM) so foliage dries quickly and humidity stays low — this lowers blight risk in Kano humidity. Keep soil moisture in the 55–65% band and avoid evening watering.',
  thrips:
    'Organic thrips control for onion: 1) Introduce predatory mites or lacewings. 2) Spray neem oil (azadirachtin) at dusk every 5–7 days. 3) Use blue sticky traps to monitor. 4) Avoid excess nitrogen, which fuels soft growth thrips prefer.',
  fertilizer:
    'Maize at tasselling is the peak-demand phase. Split nitrogen into 2–3 doses (urea top-dressing), keep potassium steady for grain fill, and fertigate in short cycles to limit leaching during the rains. Your North Block fertigation is scheduled for 16:00 today.',
}

/* --- Weather: current + 7-day forecast + advisories --- */
export const weatherNow = {
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
}

export const weatherForecast = [
  { day: 'Today', icon: 'cloud-sun', hi: 33, lo: 22, rain: 20, condition: 'Partly cloudy' },
  { day: 'Sat', icon: 'sun', hi: 35, lo: 23, rain: 5, condition: 'Sunny' },
  { day: 'Sun', icon: 'cloud-rain', hi: 30, lo: 22, rain: 70, condition: 'Showers' },
  { day: 'Mon', icon: 'cloud-rain', hi: 28, lo: 21, rain: 80, condition: 'Rain' },
  { day: 'Tue', icon: 'cloud-sun', hi: 31, lo: 22, rain: 30, condition: 'Cloudy' },
  { day: 'Wed', icon: 'sun', hi: 34, lo: 23, rain: 10, condition: 'Sunny' },
  { day: 'Thu', icon: 'cloud-sun', hi: 32, lo: 22, rain: 25, condition: 'Cloudy' },
]

export const weatherAdvisories = [
  {
    id: 'w1',
    severity: 'warn',
    title: 'Heavy rain expected Sun–Mon',
    body: '70–80% chance of showers. Pause scheduled irrigation and check drainage on East Terrace and South Field.',
    icon: 'cloud-rain',
  },
  {
    id: 'w2',
    severity: 'info',
    title: 'High UV through Saturday',
    body: 'UV index 8. Good drying conditions for harvested maize and cowpea; ensure greenhouse shade nets are deployed midday.',
    icon: 'sun',
  },
]

/* --- Sidebar navigation model --- */
export const navItems = [
  { to: '/app', label: 'Overview', icon: 'layout-dashboard', end: true },
  { to: '/app/foresight', label: 'Foresight', icon: 'line-chart', badge: 'AI' },
  { to: '/app/crops', label: 'Crop monitoring', icon: 'sprout' },
  { to: '/app/scan', label: 'Disease scan', icon: 'scan-line', badge: 'AI' },
  { to: '/app/weather', label: 'Weather', icon: 'cloud-sun' },
  { to: '/app/market', label: 'Marketplace', icon: 'store' },
  { to: '/app/assistant', label: 'Assistant', icon: 'sparkles', badge: 'AI' },
]

/* --- Landing-page feature blocks --- */
export const features = [
  {
    icon: 'droplets',
    title: 'Autonomous irrigation',
    text: 'Soil, weather, and crop stage feed one decision engine that waters each zone only when it helps — and stops before it wastes.',
  },
  {
    icon: 'scan-line',
    title: 'Vision disease scanning',
    text: 'Snap a leaf and a trained model names the disease, rates severity, and hands you a treatment plan in seconds.',
  },
  {
    icon: 'line-chart',
    title: 'Yield forecasting',
    text: 'Historical harvests, soil, and climate combine into season-ahead yield estimates you can actually plan around.',
  },
  {
    icon: 'cloud-sun',
    title: 'Weather-aware alerts',
    text: 'Frost, drought, and downpour warnings arrive early and tell you what to change — not just what is coming.',
  },
  {
    icon: 'store',
    title: 'Direct marketplace',
    text: 'List produce, watch live price signals, and sell straight to buyers without middlemen taking the margin.',
  },
  {
    icon: 'sparkles',
    title: 'AI farm assistant',
    text: 'Ask in plain language. Get answers grounded in your own fields, in the language you farm in.',
  },
]

export const landingStats = [
  { value: '32%', label: 'less water used' },
  { value: '6', label: 'zones automated' },
  { value: '91', label: 'crop health index' },
  { value: '24/7', label: 'field monitoring' },
]

export const workflow = [
  { step: '01', title: 'Sense', text: 'Wireless probes read soil moisture, pH, temperature, and humidity across every zone, minute by minute.' },
  { step: '02', title: 'Decide', text: 'Models weigh live readings against crop stage and the forecast to choose the next best action.' },
  { step: '03', title: 'Act', text: 'Valves, pumps, and fertigation lines run automatically — with a manual override always one tap away.' },
  { step: '04', title: 'Learn', text: 'Every harvest sharpens the next prediction, so the farm gets smarter each season.' },
]
