import { useState, useEffect } from 'react'
import Icon from '../components/icons.jsx'
import { api } from '../lib/api.js'
import './dash.css'
import './Foresight.css'

/* ============================================================================
 * Foresight — the no-sensor advisory screen.
 *
 * A farmer names a location and a crop. The engine pulls free agro-weather,
 * runs an FAO-56 water balance and disease infection models, and an AI layer
 * writes the plan. No hardware, no account required.
 * ==========================================================================*/

const FALLBACK_CROPS = [
  { key: 'maize', label: 'Maize' },
  { key: 'rice', label: 'Rice' },
  { key: 'tomato', label: 'Tomato' },
  { key: 'pepper', label: 'Tatashe Pepper' },
  { key: 'onion', label: 'Onion' },
  { key: 'cowpea', label: 'Cowpea' },
]

const FALLBACK_LOCATIONS = [
  { key: 'kura', label: 'Kura, Kano State' },
  { key: 'kano', label: 'Kano, Kano State' },
  { key: 'zaria', label: 'Zaria, Kaduna State' },
  { key: 'jos', label: 'Jos, Plateau State' },
  { key: 'makurdi', label: 'Makurdi, Benue State' },
  { key: 'ibadan', label: 'Ibadan, Oyo State' },
  { key: 'minna', label: 'Minna, Niger State' },
  { key: 'sokoto', label: 'Sokoto, Sokoto State' },
]

const riskTone = (level) =>
  level === 'High' ? 'alert' : level === 'Moderate' ? 'warn' : 'healthy'

function fmt(n) {
  return Number(n || 0).toLocaleString()
}

/** Render the advisory's light markdown (**bold** and paragraphs). */
function AdvisoryText({ text }) {
  return (
    <>
      {String(text || '')
        .split('\n\n')
        .filter(Boolean)
        .map((para, i) => (
          <p key={i} className="fs-advisory-para">
            {para.split(/(\*\*[^*]+\*\*)/g).map((chunk, j) =>
              chunk.startsWith('**') && chunk.endsWith('**') ? (
                <strong key={j}>{chunk.slice(2, -2)}</strong>
              ) : (
                <span key={j}>{chunk}</span>
              )
            )}
          </p>
        ))}
    </>
  )
}

export default function Foresight() {
  const [options, setOptions] = useState({ crops: FALLBACK_CROPS, locations: FALLBACK_LOCATIONS })
  const [form, setForm] = useState({
    location: 'kura',
    crop: 'maize',
    plantedOn: '',
    areaHa: 5,
    irrigationMethod: 'sprinkler',
    language: 'en',
  })
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // Populate the pickers from the API, but never block on it.
  useEffect(() => {
    let alive = true
    api
      .get('/foresight/options')
      .then((o) => {
        if (alive && o?.crops?.length) setOptions(o)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  // Default the planting date to 45 days ago so the demo opens mid-season.
  useEffect(() => {
    if (form.plantedOn) return
    const d = new Date()
    d.setDate(d.getDate() - 45)
    setForm((f) => ({ ...f, plantedOn: d.toISOString().slice(0, 10) }))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function run(e) {
    e?.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await api.post('/foresight', {
        ...form,
        areaHa: Number(form.areaHa) || 1,
      })
      setResult(data)
    } catch (err) {
      setError(err.message || 'Could not generate the advisory.')
    } finally {
      setBusy(false)
    }
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fs-page">
      {/* ---------------- Input ---------------- */}
      <section className="panel fs-form-panel">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">Describe the field</h2>
            <p className="panel-sub">No sensors needed — a location and a crop is enough</p>
          </div>
          <span className="badge badge-live">
            <span className="badge-dot" /> Free satellite &amp; weather data
          </span>
        </div>

        <form className="fs-form" onSubmit={run}>
          <label className="fs-field">
            <span className="fs-label">Location</span>
            <select value={form.location} onChange={set('location')}>
              {options.locations.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>

          <label className="fs-field">
            <span className="fs-label">Crop</span>
            <select value={form.crop} onChange={set('crop')}>
              {options.crops.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <label className="fs-field">
            <span className="fs-label">Planted on</span>
            <input type="date" value={form.plantedOn} onChange={set('plantedOn')} />
          </label>

          <label className="fs-field">
            <span className="fs-label">Area (hectares)</span>
            <input type="number" min="0.1" step="0.1" value={form.areaHa} onChange={set('areaHa')} />
          </label>

          <label className="fs-field">
            <span className="fs-label">Irrigation</span>
            <select value={form.irrigationMethod} onChange={set('irrigationMethod')}>
              <option value="drip">Drip (90% efficient)</option>
              <option value="sprinkler">Sprinkler (75%)</option>
              <option value="furrow">Furrow (60%)</option>
              <option value="flood">Flood (55%)</option>
            </select>
          </label>

          <label className="fs-field">
            <span className="fs-label">Advisory language</span>
            <select value={form.language} onChange={set('language')}>
              <option value="en">English</option>
              <option value="ha">Hausa</option>
            </select>
          </label>

          <button type="submit" className="btn btn-primary fs-run" disabled={busy}>
            {busy ? (
              <>Analysing…</>
            ) : (
              <>
                <Icon name="sparkles" size={17} /> Generate advisory
              </>
            )}
          </button>
        </form>

        {error && (
          <p className="fs-error">
            <Icon name="circle-alert" size={15} /> {error}
          </p>
        )}
      </section>

      {/* ---------------- Empty state ---------------- */}
      {!result && !busy && (
        <section className="panel fs-empty">
          <Icon name="line-chart" size={30} />
          <h3>Your advisory appears here</h3>
          <p>
            MahaFarm pulls free weather and evapotranspiration data for your location, runs an
            FAO-56 water balance for your crop and growth stage, scores disease infection risk for
            the week ahead, and writes you a plan.
          </p>
        </section>
      )}

      {busy && (
        <section className="panel fs-empty">
          <span className="fs-spinner" />
          <h3>Reading the sky over your field…</h3>
          <p>Fetching weather, computing crop water demand and scoring disease risk.</p>
        </section>
      )}

      {/* ---------------- Result ---------------- */}
      {result && !busy && (
        <>
          {/* Verdict + impact */}
          <section className="fs-verdict-row">
            <article className={`fs-verdict ${result.water.irrigationNeeded ? 'is-irrigate' : 'is-hold'}`}>
              <span className="fs-verdict-kicker mono">TODAY'S DECISION</span>
              <h2 className="fs-verdict-title">
                {result.water.irrigationNeeded ? 'Irrigate' : 'Hold the pump'}
              </h2>
              {result.water.irrigationNeeded ? (
                <p className="fs-verdict-figure mono">
                  {fmt(result.water.litresNeeded)}
                  <span> litres</span>
                </p>
              ) : (
                <p className="fs-verdict-figure mono">
                  0<span> litres</span>
                </p>
              )}
              <p className="fs-verdict-why">
                {result.crop.label} needs <strong>{result.water.etcMm} mm</strong> today. Rain
                delivered <strong>{result.water.effectiveRainMm} mm</strong> to the root zone,
                leaving a <strong>{result.water.deficitMm} mm</strong> deficit.
              </p>
              <div className="fs-verdict-meta">
                <span>
                  <Icon name="map-pin" size={13} /> {result.location.name}
                  {result.location.admin ? `, ${result.location.admin}` : ''}
                </span>
                <span>
                  <Icon name="sprout" size={13} /> {result.stage.name} · day {result.stage.dap}
                </span>
              </div>
            </article>

            <div className="fs-impact-stack">
              <article className="fs-impact">
                <span className="fs-impact-label">Water saved this week</span>
                <span className="fs-impact-value mono">{fmt(result.savings.litresSaved)} L</span>
                <span className="fs-impact-sub">
                  {result.savings.percentSaved}% less than a fixed 3-day schedule
                </span>
              </article>
              <article className="fs-impact">
                <span className="fs-impact-label">Value of that water</span>
                <span className="fs-impact-value mono">₦{fmt(result.savings.nairaSaved)}</span>
                <span className="fs-impact-sub">at ₦150 per 1,000 litres pumped</span>
              </article>
              <article className="fs-impact">
                <span className="fs-impact-label">Season progress</span>
                <span className="fs-impact-value mono">{result.stage.seasonProgress}%</span>
                <span className="fs-impact-sub">~{result.stage.daysToHarvest} days to harvest</span>
              </article>
            </div>
          </section>

          {/* AI advisory */}
          <section className="panel fs-advisory">
            <div className="panel-head">
              <div>
                <h2 className="panel-title">
                  <Icon name="sparkles" size={17} /> Your plan
                </h2>
                <p className="panel-sub">
                  Written from the figures above — the model never calculates, only explains
                </p>
              </div>
              <span className={`badge ${result.advisory.engine === 'llm' ? 'badge-live' : 'badge-warn'}`}>
                {result.advisory.engine === 'llm' ? result.advisory.model : 'Rules engine'}
              </span>
            </div>
            <div className="fs-advisory-body">
              <AdvisoryText text={result.advisory.text} />
            </div>
            {result.advisory.note && (
              <p className="fs-note">
                <Icon name="info" size={13} /> {result.advisory.note}
              </p>
            )}
          </section>

          {/* Disease risk */}
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2 className="panel-title">Disease risk — next 7 days</h2>
                <p className="panel-sub">
                  Scored from hourly temperature and humidity, before symptoms are visible
                </p>
              </div>
            </div>
            <div className="fs-disease-grid">
              {result.disease.map((d) => (
                <article key={d.key} className={`fs-disease tone-${riskTone(d.peakLevel)}`}>
                  <div className="fs-disease-head">
                    <h3>{d.label}</h3>
                    <span className={`badge badge-${riskTone(d.peakLevel)}`}>
                      <span className="badge-dot" /> {d.peakLevel}
                    </span>
                  </div>
                  <div className="fs-disease-score">
                    <span className="mono">{d.peakScore}</span>
                    <small>/100 peak risk</small>
                  </div>
                  <div className="fs-spark" role="img" aria-label={`Daily risk scores: ${d.days.map((x) => x.score).join(', ')}`}>
                    {d.days.map((day, i) => (
                      <span
                        key={day.date}
                        className="fs-spark-slot"
                        title={`${day.date}: ${day.level} (${day.score}/100)`}
                      >
                        <span
                          className={`fs-spark-bar tone-${riskTone(day.level)}`}
                          style={{ height: `${Math.max(3, day.score)}%` }}
                        />
                        <span className="fs-spark-tick">{i === 0 ? 'now' : `+${i}`}</span>
                      </span>
                    ))}
                  </div>
                  <p className="fs-disease-lead">
                    <Icon name="clock" size={13} />
                    {d.peakScore < 15
                      ? 'No infection window in the forecast'
                      : d.leadDays === 0
                        ? 'Peak risk is today'
                        : `Peak in ${d.leadDays} day${d.leadDays > 1 ? 's' : ''} — ${d.peakDate}`}
                  </p>
                  <p className="fs-disease-action">{d.action}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Week plan */}
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2 className="panel-title">Irrigation plan — the week ahead</h2>
                <p className="panel-sub">Litres to apply each day, after rainfall is counted</p>
              </div>
            </div>
            <div className="fs-week">
              {result.weekPlan.map((d, i) => (
                <article key={d.date} className={`fs-day ${d.irrigate ? 'is-irrigate' : 'is-hold'}`}>
                  <span className="fs-day-name">
                    {i === 0 ? 'Today' : new Date(d.date).toLocaleDateString('en-NG', { weekday: 'short' })}
                  </span>
                  <span className="fs-day-icon">
                    <Icon name={d.rainChance > 50 ? 'cloud-rain' : d.rainChance > 20 ? 'cloud-sun' : 'sun'} size={20} />
                  </span>
                  <span className="fs-day-temp mono">
                    {Math.round(d.tMax)}°/{Math.round(d.tMin)}°
                  </span>
                  <span className="fs-day-rain mono">
                    <Icon name="droplet" size={10} /> {d.rainfallMm} mm
                  </span>
                  <span className={`fs-day-litres mono ${d.irrigate ? '' : 'is-zero'}`}>
                    {d.irrigate ? `${fmt(d.litres)} L` : 'Hold'}
                  </span>
                </article>
              ))}
            </div>
          </section>

          {/* Provenance — how this was produced */}
          <section className="panel fs-provenance">
            <div className="panel-head">
              <h2 className="panel-title">
                <Icon name="shield" size={16} /> How this advisory was produced
              </h2>
            </div>
            <div className="fs-prov-grid">
              <div>
                <span className="fs-prov-label">Weather data</span>
                <p>
                  {result.provenance.weatherSource === 'open-meteo'
                    ? 'Live from Open-Meteo (free, no API key). ET₀ computed by FAO-56 Penman-Monteith.'
                    : 'Seasonal climatology fallback — live weather was unreachable, so these are norms for this latitude, not live readings.'}
                </p>
              </div>
              <div>
                <span className="fs-prov-label">Method</span>
                <p>{result.provenance.method}</p>
              </div>
              <div>
                <span className="fs-prov-label">AI role</span>
                <p>
                  The model writes the plan from computed figures. It never calculates, and disease
                  output is a weather-driven <strong>risk forecast</strong>, not a diagnosis.
                </p>
              </div>
              <div>
                <span className="fs-prov-label">Assumptions</span>
                <ul className="fs-prov-list">
                  {result.provenance.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="fs-note">
              <Icon name="info" size={13} /> Advisory guidance — confirm with your extension officer
              before large-scale spraying.
            </p>
          </section>
        </>
      )}
    </div>
  )
}
