import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/icons.jsx'
import { Logo } from '../components/ui.jsx'
import PulseLine from '../components/PulseLine.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './Auth.css'

export default function Register() {
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ name: '', farm: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        farmName: form.farm,
      })
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <aside className="auth-aside">
        <div className="auth-aside-top">
          <Logo to="/" dark />
        </div>
        <div className="auth-aside-mid">
          <PulseLine height={40} />
          <h2 className="auth-aside-title">Bring your fields online.</h2>
          <p className="auth-aside-text">
            Create an account and connect your first zone in minutes. Start with monitoring, switch
            on automation when you’re ready.
          </p>
          <ul className="auth-aside-list">
            <li><Icon name="check" size={15} /> Free for your first field</li>
            <li><Icon name="check" size={15} /> No hardware lock-in</li>
            <li><Icon name="check" size={15} /> Set up in a weekend</li>
          </ul>
        </div>
        <div className="auth-aside-foot mono">Built in Nigeria</div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-mobile-logo">
            <Logo to="/" />
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-sub">Start monitoring your farm today.</p>

          {error && (
            <div className="auth-error" role="alert">
              <Icon name="circle-alert" size={16} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={submit}>
            <div className="auth-grid-2">
              <label className="auth-field">
                <span className="auth-label">Full name</span>
                <span className="auth-input">
                  <Icon name="user" size={17} />
                  <input
                    type="text"
                    required
                    placeholder="Abdul-Baaqi Jempeji"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </span>
              </label>

              <label className="auth-field">
                <span className="auth-label">Farm name</span>
                <span className="auth-input">
                  <Icon name="sprout" size={17} />
                  <input
                    type="text"
                    required
                    placeholder="Kura Valley Farms"
                    value={form.farm}
                    onChange={(e) => setForm({ ...form, farm: e.target.value })}
                  />
                </span>
              </label>
            </div>

            <label className="auth-field">
              <span className="auth-label">Email</span>
              <span className="auth-input">
                <Icon name="mail" size={17} />
                <input
                  type="email"
                  required
                  placeholder="you@farm.ng"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </span>
            </label>

            <label className="auth-field">
              <span className="auth-label">Password</span>
              <span className="auth-input">
                <Icon name="lock" size={17} />
                <input
                  type={show ? 'text' : 'password'}
                  required
                  placeholder="Create a password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" className="auth-eye" onClick={() => setShow((s) => !s)} aria-label="Toggle password">
                  <Icon name={show ? 'eye-off' : 'eye'} size={17} />
                </button>
              </span>
            </label>

            <label className="auth-check auth-terms">
              <input type="checkbox" required /> I agree to the Terms and Privacy Policy
            </label>

            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? 'Creating account…' : 'Create account'}
              {!busy && <Icon name="arrow-right" size={16} />}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
