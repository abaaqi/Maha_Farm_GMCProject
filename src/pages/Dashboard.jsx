import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import Icon from '../components/icons.jsx'
import { StatCard, SensorCard, ProgressRing } from '../components/ui.jsx'
import { useResource } from '../hooks/useResource.js'
import { api } from '../lib/api.js'
import { USE_MOCK } from '../lib/config.js'
import {
  kpis as mockKpis, sensors as mockSensors, moistureSeries as mockMoisture,
  waterSeries as mockWater, alerts as mockAlerts, schedule as mockSchedule, fields as mockFields,
} from '../data/mockData.js'
import './dash.css'
import './Dashboard.css'

// Shape matches GET /api/dashboard/summary so the swap is seamless.
const mockSummary = {
  kpis: mockKpis,
  sensors: mockSensors,
  moistureSeries: mockMoisture,
  waterSeries: mockWater,
  alerts: mockAlerts,
  schedule: mockSchedule,
  attention: mockFields.filter((f) => f.status !== 'healthy'),
}

/* Custom recharts tooltip matching the dark identity. */
function ChartTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rc-tooltip">
      <div className="rc-tooltip-label">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="rc-tooltip-row">
          <span className="rc-tooltip-dot" style={{ background: p.color }} />
          {p.name}: <strong>{p.value.toLocaleString()}{unit}</strong>
        </div>
      ))}
    </div>
  )
}

const severityIcon = { alert: 'circle-alert', warn: 'info', info: 'check' }

export default function Dashboard() {
  const { data } = useResource('/dashboard/summary', mockSummary)
  const {
    kpis = [], sensors = [], moistureSeries = [], waterSeries = [],
    alerts = [], schedule = [], attention: attentionAll = [],
  } = data || {}
  const attention = attentionAll.slice(0, 3)
  const [irrigation, setIrrigation] = useState({ busy: false, msg: '' })

  /* Queues a real hardware command (POST /api/commands). The USB serial bridge
     polls it and switches the irrigation relay on the Arduino. */
  async function irrigateNow() {
    setIrrigation({ busy: true, msg: '' })
    try {
      if (!USE_MOCK) {
        await api.post('/commands', {
          type: 'relay', target: 'pump', state: 'on', durationSec: 30, zone: 'East Terrace',
        })
      }
      setIrrigation({ busy: false, msg: 'Command queued — pump running 30s on East Terrace' })
    } catch (err) {
      setIrrigation({ busy: false, msg: `Could not queue command: ${err.message}` })
    }
    setTimeout(() => setIrrigation((s) => ({ ...s, msg: '' })), 6000)
  }

  return (
    <div className="page-stack dashboard-page">
      {/* KPI row */}
      <section className="kpi-grid">
        {kpis.map((k) => (
          <StatCard key={k.id} kpi={k} />
        ))}
      </section>

      {/* Charts */}
      <section className="dash-charts">
        <article className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Soil moisture · last 24h</h2>
              <p className="panel-sub">Three representative zones, % volumetric</p>
            </div>
            <div className="chart-legend">
              {[
                { k: 'Zone A', c: 'var(--leaf-600)' },
                { k: 'Zone B', c: 'var(--sprout-dim)' },
                { k: 'Zone C', c: 'var(--harvest)' },
              ].map((l) => (
                <span key={l.k} className="chart-legend-item">
                  <span className="chart-legend-swatch" style={{ background: l.c }} />
                  {l.k}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={moistureSeries} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#237A50" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#237A50" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(14,31,22,0.06)" vertical={false} />
              <XAxis dataKey="t" tickLine={false} axisLine={false} interval={1} />
              <YAxis tickLine={false} axisLine={false} domain={[40, 80]} />
              <Tooltip content={<ChartTooltip unit="%" />} />
              <Area type="monotone" dataKey="zoneA" name="Zone A" stroke="#237A50" strokeWidth={2.4} fill="url(#gA)" />
              <Area type="monotone" dataKey="zoneB" name="Zone B" stroke="#A7CE3C" strokeWidth={2} fill="transparent" />
              <Area type="monotone" dataKey="zoneC" name="Zone C" stroke="#ECA72C" strokeWidth={2} fill="transparent" strokeDasharray="5 4" />
            </AreaChart>
          </ResponsiveContainer>
        </article>

        <article className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Water use this week</h2>
              <p className="panel-sub">Automated vs. fixed-schedule baseline, litres</p>
            </div>
            <span className="badge badge-healthy">
              <Icon name="trending-down" size={13} /> 32% saved
            </span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={waterSeries} margin={{ top: 6, right: 6, left: -18, bottom: 0 }} barGap={4}>
              <CartesianGrid stroke="rgba(14,31,22,0.06)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip unit=" L" />} cursor={{ fill: 'rgba(14,31,22,0.04)' }} />
              <Bar dataKey="baseline" name="Baseline" fill="#E5DECB" radius={[5, 5, 0, 0]} />
              <Bar dataKey="automated" name="Automated" fill="#237A50" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>

      {/* Live sensors */}
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">Live sensors</h2>
            <p className="panel-sub">Streaming from field probes · updated 30s ago</p>
          </div>
          <Link to="/app/crops" className="panel-link">
            All readings <Icon name="chevron-right" size={15} />
          </Link>
        </div>
        <div className="sensor-grid">
          {sensors.map((s) => (
            <SensorCard key={s.id} sensor={s} />
          ))}
        </div>
      </section>

      {/* Bottom row: alerts + schedule + attention */}
      <section className="dash-bottom">
        <article className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Alerts</h2>
            <Link to="/app/crops" className="panel-link">View all</Link>
          </div>
          <ul className="alert-list">
            {alerts.map((a) => (
              <li key={a.id} className={`alert-item sev-${a.severity}`}>
                <span className="alert-icon">
                  <Icon name={severityIcon[a.severity]} size={16} />
                </span>
                <div className="alert-body">
                  <div className="alert-top">
                    <span className="alert-title">{a.title}</span>
                    <span className="alert-time mono">{a.time}</span>
                  </div>
                  <p className="alert-text">{a.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Automated today</h2>
            <span className="badge badge-live">
              <span className="badge-dot" /> {schedule.filter((s) => s.auto).length} auto
            </span>
          </div>
          <button className="irrigate-btn" onClick={irrigateNow} disabled={irrigation.busy}>
            <Icon name="droplets" size={16} />
            {irrigation.busy ? 'Sending…' : 'Irrigate now'}
          </button>
          {irrigation.msg && (
            <p className="irrigate-msg">
              <Icon name="check" size={13} /> {irrigation.msg}
            </p>
          )}
          <ul className="schedule-list">
            {schedule.map((t) => (
              <li key={t.id} className="schedule-item">
                <span className="schedule-time mono">{t.time}</span>
                <span className={`schedule-rail kind-${t.kind}`} />
                <div className="schedule-meta">
                  <span className="schedule-label">{t.label}</span>
                  <span className={`schedule-tag ${t.auto ? 'is-auto' : 'is-manual'}`}>
                    {t.auto ? 'Automated' : 'Needs you'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="panel attention-panel">
          <div className="panel-head">
            <h2 className="panel-title">Needs attention</h2>
            <Link to="/app/crops" className="panel-link">Fields</Link>
          </div>
          <ul className="attention-list">
            {attention.map((f) => (
              <li key={f.id} className="attention-item">
                <ProgressRing value={f.health} size={50} stroke={4} label={`${f.health}`} />
                <div className="attention-meta">
                  <span className="attention-name">{f.name}</span>
                  <span className="attention-crop">{f.crop} · {f.stage}</span>
                  <span className={`attention-note sev-${f.status}`}>{f.nextAction}</span>
                </div>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  )
}
