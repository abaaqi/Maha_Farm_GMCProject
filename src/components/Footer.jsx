import { Link } from 'react-router-dom'
import Icon from './icons.jsx'
import { Logo } from './ui.jsx'
import PulseLine from './PulseLine.jsx'
import './Footer.css'

const columns = [
  {
    title: 'Platform',
    links: [
      { label: 'Irrigation', href: '#features' },
      { label: 'Disease scan', href: '#features' },
      { label: 'Marketplace', href: '#features' },
      { label: 'Assistant', href: '#features' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#impact' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs', href: '#' },
      { label: 'Field guides', href: '#' },
      { label: 'API', href: '#' },
      { label: 'Status', href: '#' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-pulse">
        <PulseLine height={28} />
      </div>
      <div className="shell footer-inner">
        <div className="footer-brand">
          <Logo dark />
          <p className="footer-tagline">
            An AI-empowered automated farm platform. Soil, water, and weather — turned into decisions.
          </p>
          <div className="footer-social">
            {['zap', 'mail', 'map-pin'].map((n) => (
              <a key={n} href="#" className="footer-social-link" aria-label={n}>
                <Icon name={n} size={17} />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.title} className="footer-col" aria-label={col.title}>
            <h3 className="footer-col-title">{col.title}</h3>
            <ul className="footer-col-list">
              {col.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="footer-link">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="footer-cta">
          <h3 className="footer-col-title">Get started</h3>
          <p className="footer-cta-text">Bring your fields online in a weekend.</p>
          <Link to="/register" className="btn btn-primary btn-sm">
            Create account
            <Icon name="arrow-right" size={15} />
          </Link>
        </div>
      </div>

      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} MahaFarm. Built in Nigeria.</span>
        <div className="footer-bottom-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Security</a>
        </div>
      </div>
    </footer>
  )
}
