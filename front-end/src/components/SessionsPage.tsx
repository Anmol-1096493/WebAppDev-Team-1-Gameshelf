import { useCallback, useEffect, useState } from 'react'
import {
  api,
  ApiError,
  type CreateSessionInput,
  type Game,
  type Member,
  type SessionDetail,
  type SessionSummary,
  type Signup,
} from '../api.ts'
import './SessionsPage.css'

const CONFIRMED = 0
const WAITING = 1

type View =
  | { mode: 'list' }
  | { mode: 'detail'; sessionId: string }

export default function SessionsPage({ member }: { member: Member }) {
  const [members, setMembers] = useState<Member[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [summaries, setSummaries] = useState<SessionSummary[]>([])
  const [detail, setDetail] = useState<SessionDetail | null>(null)
  const [view, setView] = useState<View>({ mode: 'list' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshList = useCallback(async () => {
    const list = await api.listSessions()
    setSummaries(list)
  }, [])

  const refreshDetail = useCallback(async (id: string) => {
    const d = await api.getSession(id)
    setDetail(d)
  }, [])

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [m, g, s] = await Promise.all([api.listMembers(), api.listGames(), api.listSessions()])
      setMembers(m)
      setGames(g)
      setSummaries(s)
    } catch (e) {
      setError(messageOf(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Keep the open detail in sync after any mutation that returns a fresh detail.
  const applyDetail = useCallback(
    (d: SessionDetail) => {
      setDetail(d)
      void refreshList()
    },
    [refreshList],
  )

  async function run<T>(fn: () => Promise<T>, onError?: (e: ApiError) => void): Promise<T | undefined> {
    setError(null)
    try {
      return await fn()
    } catch (e) {
      const msg = messageOf(e)
      setError(msg)
      if (e instanceof ApiError) onError?.(e)
      return undefined
    }
  }

  function openDetail(id: string) {
    setView({ mode: 'detail', sessionId: id })
    setDetail(null)
    void refreshDetail(id)
  }

  function backToList() {
    setView({ mode: 'list' })
    setDetail(null)
    void refreshList()
  }

  if (loading) {
    return (
      <section aria-labelledby="page-title">
        <p className="eyebrow">Game nights</p>
        <h1 id="page-title">Sessions</h1>
        <p className="text-muted">Loading sessions…</p>
      </section>
    )
  }

  return (
    <section aria-labelledby="page-title">
      <p className="eyebrow">Game nights</p>
      <h1 id="page-title">Sessions</h1>
      <p className="text-muted">
        Any member can host a game session in the club room or at a kitchen table. Members sign up
        for a seat; once the table is full, signups join the waiting list.
      </p>

      {error && (
        <p className="alert alert--error" role="alert">
          {error}
        </p>
      )}

      {view.mode === 'list' ? (
        <SessionsList
          summaries={summaries}
          currentMember={member}
          onOpen={openDetail}
          onCreated={(d) => {
            applyDetail(d)
            setView({ mode: 'detail', sessionId: d.id })
          }}
          run={run}
        />
      ) : (
        <SessionDetailPanel
          detail={detail}
          currentMember={member}
          members={members}
          games={games}
          onBack={backToList}
          onChanged={applyDetail}
          run={run}
        />
      )}
    </section>
  )
}

function SessionsList({
  summaries,
  currentMember,
  onOpen,
  onCreated,
  run,
}: {
  summaries: SessionSummary[]
  currentMember: Member | null
  onOpen: (id: string) => void
  onCreated: (d: SessionDetail) => void
  run: <T>(fn: () => Promise<T>) => Promise<T | undefined>
}) {
  const [creating, setCreating] = useState(false)

  return (
    <>
      <div className="cluster">
        <button className="button button--primary" type="button" onClick={() => setCreating(true)}>
          + Host a session
        </button>
        <button className="button button--secondary" type="button" onClick={() => window.location.reload()}>
          Refresh
        </button>
      </div>

      {creating && currentMember && (
        <CreateSessionForm
          onCancel={() => setCreating(false)}
          onSubmit={async (input) => {
            const d = await run(() => api.createSession(input))
            if (d) {
              setCreating(false)
              onCreated(d)
            }
          }}
        />
      )}

      {summaries.length === 0 ? (
        <div className="card empty-state">
          <div className="card__body">
            <h3>No sessions yet</h3>
            <p className="text-muted">Be the first to host a game night.</p>
          </div>
        </div>
      ) : (
        <ul className="session-grid" role="list">
          {summaries.map((s) => (
            <li key={s.id} className="card session-card">
              <div
                className="session-card__clickable"
                role="button"
                tabIndex={0}
                onClick={() => onOpen(s.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onOpen(s.id)
                  }
                }}
              >
                <div className="card__header">
                  <p className="eyebrow">{formatDate(s.startAt)}</p>
                  <h3 className="session-card__title">{s.title}</h3>
                </div>
                <div className="card__body">
                  <p className="text-muted session-card__place">📍 {s.place}</p>
                  <p className="text-muted">Hosted by {s.hostName}</p>
                  <div className="cluster cluster--tight">
                    <span className={`badge ${s.isCancelled ? 'badge--highlight' : 'badge--info'}`}>
                      {s.confirmedSeats}/{s.capacity} seats
                    </span>
                    {s.waitingCount > 0 && (
                      <span className="badge badge--available">{s.waitingCount} waiting</span>
                    )}
                    {s.isCancelled && <span className="badge badge--highlight">Cancelled</span>}
                  </div>
                  <div
                    className="seat-bar"
                    aria-label={`${s.confirmedSeats} of ${s.capacity} seats confirmed`}
                  >
                    <div
                      className="seat-bar__fill"
                      style={{ width: `${Math.min(100, (s.confirmedSeats / s.capacity) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <footer className="card__footer">
                <span className="session-card__time text-muted">{formatTime(s.startAt)}</span>
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => onOpen(s.id)}
                >
                  View
                </button>
              </footer>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function CreateSessionForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void
  onSubmit: (input: CreateSessionInput) => void
}) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('19:00')
  const [place, setPlace] = useState('Club room')
  const [capacity, setCapacity] = useState(4)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !place.trim() || !date) return
    const startAt = new Date(`${date}T${time}:00`).toISOString()
    onSubmit({ title: title.trim(), startAt, place: place.trim(), capacity })
  }

  return (
    <form className="card session-form" onSubmit={submit}>
      <div className="card__body stack">
        <h2>Host a session</h2>
        <label className="form-field">
          <span className="form-label">Title</span>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Catan night"
            required
          />
        </label>
        <div className="cluster cluster--form">
          <label className="form-field">
            <span className="form-label">Date</span>
            <input
              className="form-control"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span className="form-label">Time</span>
            <input
              className="form-control"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="cluster cluster--form">
          <label className="form-field">
            <span className="form-label">Place</span>
            <input
              className="form-control"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="Club room"
              required
            />
          </label>
          <label className="form-field">
            <span className="form-label">Seats</span>
            <input
              className="form-control"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              required
            />
          </label>
        </div>
      </div>
      <div className="card__footer">
        <button type="button" className="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="button button--primary">
          Create session
        </button>
      </div>
    </form>
  )
}

function SessionDetailPanel({
  detail,
  currentMember,
  members,
  games,
  onBack,
  onChanged,
  run,
}: {
  detail: SessionDetail | null
  currentMember: Member | null
  members: Member[]
  games: Game[]
  onBack: () => void
  onChanged: (d: SessionDetail) => void
  run: <T>(fn: () => Promise<T>, onError?: (e: ApiError) => void) => Promise<T | undefined>
}) {
  if (!detail) {
    return (
      <div className="card">
        <div className="card__body">
          <p className="text-muted">Loading session…</p>
        </div>
        <div className="card__footer">
          <button type="button" className="button" onClick={onBack}>
            Back to sessions
          </button>
        </div>
      </div>
    )
  }

  const isHost = currentMember?.id === detail.hostId
  const canCancel = isHost || currentMember?.isCommittee === true
  const signedUp = detail.currentMemberSignedUp
  const confirmed = detail.signups.filter((s) => s.status === CONFIRMED)
  const waiting = detail.signups.filter((s) => s.status === WAITING)
  const broughtGames = detail.signups.filter((s) => s.broughtGame)

  return (
    <div className="session-detail stack">
      <button type="button" className="button back-link" onClick={onBack}>
        ← All sessions
      </button>

      <article className={`card session-hero ${detail.isCancelled ? 'is-cancelled' : ''}`}>
        <header className="card__header">
          <p className="eyebrow">{formatDate(detail.startAt)} · {formatTime(detail.startAt)}</p>
          <h2>{detail.title}</h2>
        </header>
        <div className="card__body stack">
          <p className="text-muted session-hero__place">📍 {detail.place}</p>
          <p className="text-muted">Hosted by {detail.hostName}</p>
          <div className="cluster cluster--tight">
            <span className="badge badge--info">
              {detail.confirmedSeats}/{detail.capacity} confirmed
            </span>
            {waiting.length > 0 && (
              <span className="badge badge--available">{waiting.length} waiting</span>
            )}
            {detail.isCancelled && <span className="badge badge--highlight">Cancelled</span>}
          </div>
          <div
            className="seat-bar"
            aria-label={`${detail.confirmedSeats} of ${detail.capacity} seats confirmed`}
          >
            <div
              className="seat-bar__fill"
              style={{ width: `${Math.min(100, (detail.confirmedSeats / detail.capacity) * 100)}%` }}
            />
          </div>
        </div>
      </article>

      {!detail.isCancelled && currentMember && (
        <SignupActions
          detail={detail}
          signedUp={signedUp}
          games={games}
          onSignUp={async (gameId) => {
            const d = await run(() => api.signUp(detail.id, gameId))
            if (d) onChanged(d)
          }}
          onCancelSignup={async () => {
            const d = await run(() => api.cancelSignup(detail.id))
            if (d) onChanged(d)
          }}
        />
      )}

      {isHost && !detail.isCancelled && (
        <HostControls
          detail={detail}
          members={members}
          onUpdated={async (input) => {
            const d = await run(() => api.updateSession(detail.id, input))
            if (d) onChanged(d)
          }}
          onTransfer={async (newHostId) => {
            const d = await run(() => api.transferHost(detail.id, newHostId))
            if (d) onChanged(d)
          }}
          onCancel={async () => {
            const d = await run(() => api.cancelSession(detail.id))
            if (d) onChanged(d)
          }}
        />
      )}

      {canCancel && isHost === false && !detail.isCancelled && currentMember?.isCommittee && (
        <div className="card">
          <div className="card__body">
            <p className="text-muted">
              As a committee member you can cancel this session if the club room cannot be opened.
            </p>
          </div>
          <div className="card__footer">
            <button
              type="button"
              className="button button--danger"
              onClick={async () => {
                const d = await run(() => api.cancelSession(detail.id))
                if (d) onChanged(d)
              }}
            >
              Cancel session
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card__header">
          <h3>Confirmed seats ({confirmed.length})</h3>
        </div>
        <div className="card__body">
          {confirmed.length === 0 ? (
            <p className="text-muted">No confirmed seats yet.</p>
          ) : (
            <ul className="signup-list" role="list">
              {confirmed.map((s) => (
                <SignupRow key={s.id} signup={s} />
              ))}
            </ul>
          )}
        </div>
      </div>

      {waiting.length > 0 && (
        <div className="card">
          <div className="card__header">
            <h3>Waiting list ({waiting.length})</h3>
          </div>
          <div className="card__body">
            <ol className="signup-list" role="list">
              {waiting.map((s, i) => (
                <li key={s.id} className="signup-row">
                  <span className="signup-row__position">{i + 1}</span>
                  <span className="signup-row__name">{s.memberName}</span>
                  {s.broughtGame && (
                    <span className="signup-row__game text-muted">brings {s.broughtGame.title}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {broughtGames.length > 0 && (
        <div className="card">
          <div className="card__header">
            <h3>On the table tonight</h3>
          </div>
          <div className="card__body">
            <p className="text-muted">
              The table knows what the evening looks like before it starts.
            </p>
            <ul className="table-games" role="list">
              {broughtGames.map((s) => {
                const game = s.broughtGame!
                return (
                  <li key={s.id} className="table-games__item">
                    <span className="table-games__title">{game.title}</span>
                    <span className="text-muted">
                      {game.minPlayers}–{game.maxPlayers} players
                    </span>
                    {s.gameFits ? (
                      <span className="badge badge--info">fits {detail.confirmedSeats} seats</span>
                    ) : (
                      <span className="badge badge--highlight">
                        needs {game.minPlayers} players
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

function SignupRow({ signup }: { signup: Signup }) {
  return (
    <li className="signup-row">
      <span className="signup-row__name">{signup.memberName}</span>
      {signup.broughtGame && (
        <span className="signup-row__game text-muted">brings {signup.broughtGame.title}</span>
      )}
      {signup.broughtGame &&
        (signup.gameFits ? (
          <span className="badge badge--info">game fits</span>
        ) : (
          <span className="badge badge--highlight">
            needs {signup.broughtGame.minPlayers} players
          </span>
        ))}
    </li>
  )
}

function SignupActions({
  detail,
  signedUp,
  games,
  onSignUp,
  onCancelSignup,
}: {
  detail: SessionDetail
  signedUp: boolean
  games: Game[]
  onSignUp: (gameId: string | null) => void
  onCancelSignup: () => void
}) {
  const [gameId, setGameId] = useState('')

  if (signedUp) {
    return (
      <div className="card">
        <div className="card__body">
          <p>
            You are{' '}
            {detail.currentMemberSignupStatus === CONFIRMED ? 'confirmed for this session' : 'on the waiting list'}.
          </p>
        </div>
        <div className="card__footer">
          <button type="button" className="button button--danger" onClick={onCancelSignup}>
            Cancel my signup
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
        onSignUp(gameId || null)
      }}
    >
      <div className="card__body stack">
        <h3>Sign up</h3>
        <label className="form-field">
          <span className="form-label">Game you bring (optional)</span>
          <select
            className="form-control"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          >
            <option value="">Just myself</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title} ({g.minPlayers}–{g.maxPlayers})
              </option>
            ))}
          </select>
        </label>
        <p className="form-help">
          {detail.confirmedSeats < detail.capacity
            ? 'A seat is free — you will be confirmed.'
            : 'Seats are full — you will join the waiting list.'}
        </p>
      </div>
      <div className="card__footer">
        <button type="submit" className="button button--primary">
          Sign up
        </button>
      </div>
    </form>
  )
}

function HostControls({
  detail,
  members,
  onUpdated,
  onTransfer,
  onCancel,
}: {
  detail: SessionDetail
  members: Member[]
  onUpdated: (input: { title?: string; startAt?: string; place?: string; capacity?: number }) => void
  onTransfer: (newHostId: string) => void
  onCancel: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(detail.title)
  const [date, setDate] = useState(detail.startAt.slice(0, 10))
  const [time, setTime] = useState(detail.startAt.slice(11, 16))
  const [place, setPlace] = useState(detail.place)
  const [capacity, setCapacity] = useState(detail.capacity)
  const [transferTarget, setTransferTarget] = useState('')

  const confirmedMembers = detail.signups.filter(
    (s) => s.status === CONFIRMED && s.memberId !== detail.hostId,
  )

  return (
    <div className="card">
      <div className="card__header">
        <h3>Host controls</h3>
      </div>
      <div className="card__body stack">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const startAt = new Date(`${date}T${time}:00`).toISOString()
              onUpdated({ title, startAt, place, capacity })
              setEditing(false)
            }}
            className="stack"
          >
            <label className="form-field">
              <span className="form-label">Title</span>
              <input className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <div className="cluster cluster--form">
              <label className="form-field">
                <span className="form-label">Date</span>
                <input
                  className="form-control"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label className="form-field">
                <span className="form-label">Time</span>
                <input
                  className="form-control"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </label>
            </div>
            <div className="cluster cluster--form">
              <label className="form-field">
                <span className="form-label">Place</span>
                <input className="form-control" value={place} onChange={(e) => setPlace(e.target.value)} />
              </label>
              <label className="form-field">
                <span className="form-label">Seats</span>
                <input
                  className="form-control"
                  type="number"
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                />
              </label>
            </div>
            <p className="form-help">
              Lowering the seats below the confirmed count sends the most recently confirmed
              signups back to the waiting list.
            </p>
            <div className="cluster">
              <button type="submit" className="button button--primary">
                Save changes
              </button>
              <button
                type="button"
                className="button"
                onClick={() => {
                  setEditing(false)
                  setTitle(detail.title)
                  setPlace(detail.place)
                  setCapacity(detail.capacity)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="cluster">
            <button type="button" className="button button--secondary" onClick={() => setEditing(true)}>
              Edit session
            </button>
          </div>
        )}

        {confirmedMembers.length > 0 && (
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault()
              if (transferTarget) {
                onTransfer(transferTarget)
                setTransferTarget('')
              }
            }}
          >
            <label className="form-field">
              <span className="form-label">Hand hosting to a confirmed member</span>
              <select
                className="form-control"
                value={transferTarget}
                onChange={(e) => setTransferTarget(e.target.value)}
              >
                <option value="">Select a member…</option>
                {confirmedMembers.map((s) => {
                  const m = members.find((x) => x.id === s.memberId)
                  return (
                    <option key={s.memberId} value={s.memberId}>
                      {m?.name ?? s.memberName}
                    </option>
                  )
                })}
              </select>
            </label>
            <button type="submit" className="button" disabled={!transferTarget}>
              Transfer hosting
            </button>
          </form>
        )}
      </div>
      <div className="card__footer">
        <button type="button" className="button button--danger" onClick={onCancel}>
          Cancel session
        </button>
      </div>
    </div>
  )
}

function messageOf(e: unknown): string {
  if (e instanceof ApiError) return e.message
  if (e instanceof Error) return e.message
  return 'Something went wrong.'
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}