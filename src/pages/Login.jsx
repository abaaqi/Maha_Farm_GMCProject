import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Icon from '../components/icons.jsx'
import { Logo } from '../components/ui.jsx'
import PulseLine from '../components/PulseLine.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import './Auth.css'

export default function Login() {
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginDemo } = useAuth()

  const dest = location.state?.from?.pathname || '/app'

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(form.email, form.password)
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.message || 'Could not sign in. Check your details and try again.')
    } finally {
      setBusy(false)
    }
  }

  async function demo() {
    setError('')
    setBusy(true)
    try {
      await loginDemo()
      navigate(dest, { replace: true })
    } catch (err) {
      setError(err.message || 'Demo sign-in failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      {/* Brand / story side */}
      <aside className="auth-aside">
        <div className="auth-aside-top">
          <Logo to="/" dark />
        </div>
        <div className="auth-aside-mid">
          <PulseLine height={40} />
          <h2 className="auth-aside-title">The farm is already awake.</h2>
          <p className="auth-aside-text">
            Sign in to see what every zone needs right now — moisture, health, weather, and the
            actions running on their own.
          </p>
          <ul className="auth-aside-list">
            <li><Icon name="check" size={15} /> 6 zones streaming live</li>
            <li><Icon name="check" size={15} /> 32% less water this week</li>
            <li><Icon name="check" size={15} /> Disease scans in seconds</li>
          </ul>
        </div>
        <div className="auth-aside-foot mono">Kura Valley Farms · Kano State, NG</div>
      </aside>

      {/* Form side */}
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-mobile-logo">
            <Logo to="/" />
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your MahaFarm dashboard.</p>

          {error && (
            <div className="auth-error" role="alert">
              <Icon name="circle-alert" size={16} />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={submit}>
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
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" className="auth-eye" onClick={() => setShow((s) => !s)} aria-label="Toggle password">
                  <Icon name={show ? 'eye-off' : 'eye'} size={17} />
                </button>
              </span>
            </label>

            <div className="auth-row">
              <label className="auth-check">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="auth-link">Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
              {!busy && <Icon name="arrow-right" size={16} />}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <button className="btn btn-ghost btn-block" onClick={demo} disabled={busy}>
            Continue with demo account
          </button>

          <p className="auth-switch">
            New to MahaFarm? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
