import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import Icon from '../components/icons.jsx'
import PulseLine from '../components/PulseLine.jsx'
import { SectionHeading } from '../components/ui.jsx'
import { features, landingStats, workflow } from '../data/mockData.js'
import './Landing.css'

const pricing = [
  {
    name: 'Smallholder',
    price: '₦0',
    period: 'forever',
    blurb: 'For a single field getting started with monitoring.',
    features: ['1 field, 2 sensors', 'Live soil & weather', 'Disease scan (10/mo)', 'Community support'],
    cta: 'Start free',
    featured: false,
  },
  {
    name: 'Estate',
    price: '₦15,000',
    period: 'per month',
    blurb: 'For working farms that want full automation.',
    features: ['Up to 12 zones', 'Autonomous irrigation', 'Unlimited disease scans', 'Yield forecasting', 'Marketplace listings', 'Priority support'],
    cta: 'Start 30-day trial',
    featured: true,
  },
  {
    name: 'Cooperative',
    price: 'Custom',
    period: 'let’s talk',
    blurb: 'For FPOs and multi-farm operations.',
    features: ['Unlimited zones & farms', 'Shared analytics', 'Bulk marketplace', 'Dedicated agronomist', 'On-site setup'],
    cta: 'Contact sales',
    featured: false,
  },
]

export default function Landing() {
  return (
    <div className="landing">
      <Navbar />

      {/* ---------------------------- HERO ---------------------------- */}
      <section className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="shell hero-inner">
          <div className="hero-copy">
            <span className="hero-pill">
              <span className="hero-pill-dot" />
              AI-empowered · 6 zones live now
            </span>
            <h1 className="hero-title">
              Your farm,<br />
              <span className="hero-title-accent">wide awake.</span>
            </h1>
            <p className="hero-lede">
              MahaFarm turns soil, water, and weather into decisions — automatically.
              Sensors read every zone, models decide what each crop needs, and the farm acts
              while you sleep.
            </p>
            <div className="hero-actions">
              <Link to="/app" className="btn btn-primary">
                Open the dashboard
                <Icon name="arrow-right" size={17} />
              </Link>
              <a href="#how" className="btn btn-ghost">
                See how it works
              </a>
            </div>
            <div className="hero-stats">
              {landingStats.map((s) => (
                <div key={s.label} className="hero-stat">
                  <span className="hero-stat-value mono">{s.value}</span>
                  <span className="hero-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signature: a living, self-reporting dashboard preview */}
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-card">
              <div className="hero-card-head">
                <div className="hero-card-head-left">
                  <span className="hero-card-dotrow">
                    <i /><i /><i />
                  </span>
                  <span className="hero-card-title">Kura Valley Farms · Live</span>
                </div>
                <span className="badge badge-live on-dark">
                  <span className="badge-dot" />
                  Streaming
                </span>
              </div>

              <div className="hero-card-pulse">
                <PulseLine height={56} />
                <span className="hero-card-pulse-label mono">field vitals · 48 acres</span>
              </div>

              <div className="hero-tiles">
                <div className="hero-tile">
                  <Icon name="droplets" size={18} />
                  <span className="hero-tile-val mono">62%</span>
                  <span className="hero-tile-lbl">Soil moisture</span>
                </div>
                <div className="hero-tile">
                  <Icon name="thermometer" size={18} />
                  <span className="hero-tile-val mono">29°C</span>
                  <span className="hero-tile-lbl">Air temp</span>
                </div>
                <div className="hero-tile">
                  <Icon name="flask" size={18} />
                  <span className="hero-tile-val mono">6.8</span>
                  <span className="hero-tile-lbl">Soil pH</span>
                </div>
                <div className="hero-tile">
                  <Icon name="activity" size={18} />
                  <span className="hero-tile-val mono">91</span>
                  <span className="hero-tile-lbl">Health index</span>
                </div>
              </div>

              <div className="hero-card-action">
                <span className="hero-card-action-icon">
                  <Icon name="droplet" size={15} />
                </span>
                <span className="hero-card-action-text">
                  Auto-irrigating <strong>East Terrace</strong> — moisture below band
                </span>
                <span className="hero-card-action-time mono">now</span>
              </div>
            </div>

            <div className="hero-float hero-float-1">
              <Icon name="sparkles" size={16} />
              <span>“What does North Block need?”</span>
            </div>
            <div className="hero-float hero-float-2">
              <Icon name="scan-line" size={16} />
              <span>Early blight · 92% · treatment ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------- TRUST STRIP -------------------------- */}
      <section className="trust">
        <div className="shell trust-inner">
          <span className="trust-label">Built for the way Nigeria farms</span>
          <div className="trust-items">
            {['Maize', 'Rice', 'Tomato', 'Onion', 'Cowpea', 'Pepper'].map((c) => (
              <span key={c} className="trust-item">
                <Icon name="sprout" size={15} />
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------- FEATURES --------------------------- */}
      <section className="features" id="features">
        <div className="shell">
          <SectionHeading
            eyebrow="The platform"
            title="One system, from soil to sale"
            lede="Every part of MahaFarm shares the same live picture of your fields — so monitoring, automation, and selling all pull in the same direction."
          />
          <div className="features-grid">
            {features.map((f, i) => (
              <article key={f.title} className="feature-card">
                <span className="feature-num mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="feature-icon">
                  <Icon name={f.icon} size={22} />
                </span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-text">{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------- HOW IT WORKS ------------------------- */}
      <section className="how" id="how">
        <div className="how-pulse" aria-hidden="true">
          <PulseLine height={30} />
        </div>
        <div className="shell">
          <SectionHeading
            dark
            eyebrow="How it works"
            title="Sense, decide, act, learn"
            lede="A closed loop that runs on its own and gets sharper every season."
          />
          <div className="how-grid">
            {workflow.map((w, i) => (
              <article key={w.step} className="how-step">
                <span className="how-step-num mono">{w.step}</span>
                <h3 className="how-step-title">{w.title}</h3>
                <p className="how-step-text">{w.text}</p>
                {i < workflow.length - 1 && <span className="how-step-arrow"><Icon name="arrow-right" size={18} /></span>}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- IMPACT ---------------------------- */}
      <section className="impact" id="impact">
        <div className="shell impact-inner">
          <div className="impact-copy">
            <SectionHeading
              eyebrow="The impact"
              title="Less water. Fewer surprises. Bigger harvests."
              lede="MahaFarm farms have cut water use by nearly a third while lifting crop health — because the system only acts when it actually helps, and catches problems before they spread."
            />
            <ul className="impact-list">
              <li><Icon name="check" size={17} /> Up to 32% lower water use vs. fixed schedules</li>
              <li><Icon name="check" size={17} /> Disease caught days earlier with vision scanning</li>
              <li><Icon name="check" size={17} /> Season-ahead yield forecasts you can plan around</li>
              <li><Icon name="check" size={17} /> Direct sales that skip the middle layer</li>
            </ul>
            <Link to="/register" className="btn btn-dark">
              Bring your farm online
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
          <div className="impact-figures">
            {[
              { v: '32%', l: 'water saved', tone: 'a' },
              { v: '8 days', l: 'earlier disease alerts', tone: 'b' },
              { v: '18%', l: 'avg yield lift', tone: 'a' },
              { v: '₦0', l: 'market commission', tone: 'b' },
            ].map((f) => (
              <div key={f.l} className={`impact-fig tone-${f.tone}`}>
                <span className="impact-fig-v mono">{f.v}</span>
                <span className="impact-fig-l">{f.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- PRICING ---------------------------- */}
      <section className="pricing" id="pricing">
        <div className="shell">
          <SectionHeading
            align="center"
            eyebrow="Pricing"
            title="Start free, scale when you’re ready"
            lede="No hardware lock-in. Bring your own probes or use ours."
          />
          <div className="pricing-grid">
            {pricing.map((p) => (
              <article key={p.name} className={`price-card ${p.featured ? 'is-featured' : ''}`}>
                {p.featured && <span className="price-flag">Most popular</span>}
                <h3 className="price-name">{p.name}</h3>
                <div className="price-amount">
                  <span className="price-value mono">{p.price}</span>
                  <span className="price-period">{p.period}</span>
                </div>
                <p className="price-blurb">{p.blurb}</p>
                <ul className="price-features">
                  {p.features.map((feat) => (
                    <li key={feat}>
                      <Icon name="check" size={15} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`btn ${p.featured ? 'btn-primary' : 'btn-ghost'} btn-block`}
                >
                  {p.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- CTA ----------------------------- */}
      <section className="cta-band">
        <div className="shell cta-inner">
          <div className="cta-pulse" aria-hidden="true"><PulseLine height={40} /></div>
          <h2 className="cta-title">Let the farm do the watching.</h2>
          <p className="cta-text">
            Set up monitoring in a weekend and switch on automation field by field.
          </p>
          <div className="cta-actions">
            <Link to="/app" className="btn btn-primary">
              Open dashboard
              <Icon name="arrow-right" size={17} />
            </Link>
            <Link to="/register" className="btn btn-ghost on-dark">
              Create account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
