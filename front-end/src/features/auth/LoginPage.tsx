import { useState } from 'react'
import { auth, type Member } from '../../api.ts'
import './LoginPage.css'

export default function LoginPage({ onLoggedIn }: { onLoggedIn: (m: Member) => void }) {
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const member = await auth.login(userName.trim(), password)
      onLoggedIn(member)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="login-panel" aria-labelledby="page-title">
      <a className="login-back" href="/">← Back to home</a>
      <h1 id="page-title">Sign in</h1>
      <p className="text-muted">Use your GameShelf account.</p>
      <form className="login-form" onSubmit={submit} aria-busy={busy}>
        <label className="form-field">
          <span className="form-label">Username</span>
          <input
            className="form-control"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            disabled={busy}
            required
          />
        </label>
        <div className="form-field">
          <label className="form-label" htmlFor="login-password">Password</label>
          <div className="login-password">
            <input
              id="login-password"
              className="form-control"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={busy}
              required
            />
            <button
              type="button"
              className="login-password__toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        {error && <p className="alert alert--error" role="alert">{error}</p>}
        <button type="submit" className="button button--primary login-submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <details className="login-demo">
        <summary>Demo accounts</summary>
        <p>jeffrey (committee), artur, anmol, sasha, priya, liam.</p>
        <p>Password: <strong>Admin001</strong></p>
      </details>
    </section>
  )
}
