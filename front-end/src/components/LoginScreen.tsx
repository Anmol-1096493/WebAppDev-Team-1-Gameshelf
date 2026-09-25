import { useState } from 'react'
import { auth, type Member } from '../api.ts'

export default function LoginScreen({ onLoggedIn }: { onLoggedIn: (m: Member) => void }) {
  const [userName, setUserName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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
    <section aria-labelledby="page-title">
      <p className="eyebrow">GameShelf</p>
      <h1 id="page-title">Sign in</h1>
      <p className="text-muted">Sign in to host and join game sessions.</p>

      <form className="card login-form" onSubmit={submit}>
        <div className="card__body stack">
          <label className="form-field">
            <span className="form-label">Username</span>
            <input
              className="form-control"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="jeffrey"
              autoComplete="username"
              required
            />
          </label>
          <label className="form-field">
            <span className="form-label">Password</span>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="gameshelf123"
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <p className="alert alert--error" role="alert">
              {error}
            </p>
          )}
          <p className="form-help">
            Prototype accounts: jeffrey (committee), anmol, sasha, priya, liam.
            Password for all: <strong>gameshelf123</strong>.
          </p>
        </div>
        <div className="card__footer">
          <button type="submit" className="button button--primary" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
    </section>
  )
}