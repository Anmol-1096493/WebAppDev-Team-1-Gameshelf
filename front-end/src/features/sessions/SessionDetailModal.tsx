import { sessionsApi as api } from './sessionsApi'
import { ApiError, type Game, type Member } from '../../api'
import type { SessionDetail } from '../../types/Session'
import { CONFIRMED, WAITING, formatDate, formatTime } from './sessionUtils'
import { Modal } from './Modal'
import { SignupActions } from './SignupActions'
import { HostControls } from './HostControls'
import { SignupRow } from './SignupRow'

/* Sessiegegevens, deelnemers, wachtlijst en beschikbare beheeracties. */

export function SessionDetailModal({
  detail,
  loading,
  error,
  busy,
  onRetry,
  currentMember,
  members,
  games,
  onClose,
  onChanged,
  run,
}: {
  loading: boolean
  error: string | null
  busy: boolean
  onRetry: () => void
  detail: SessionDetail | null
  currentMember: Member | null
  members: Member[]
  games: Game[]
  onClose: () => void
  onChanged: (d: SessionDetail) => void
  run: <T>(fn: () => Promise<T>, onError?: (e: ApiError) => void) => Promise<T | undefined>
}) {
  // Bepaalt welke knoppen zichtbaar zijn; de backend controleert de rechten opnieuw.
  const isHost = detail && currentMember?.id === detail.hostId
  const canCancel = isHost || currentMember?.isCommittee === true

  return (
    <Modal
      title={detail?.title ?? 'Session'}
      eyebrow={detail ? `${formatDate(detail.startAt)} · ${formatTime(detail.startAt)}` : undefined}
      onClose={onClose}
      size="lg"
    >
      {error && <p className="alert alert--error" role="alert">{error}</p>}
      {!detail ? (
        loading ? <p className="text-muted" role="status">Loading session…</p>
          : <button className="button button--secondary" type="button" onClick={onRetry}>Try again</button>
      ) : (
        <div className="session-detail stack">
          <div className={`session-hero ${detail.isCancelled ? 'is-cancelled' : ''}`}>
            <p className="text-muted session-hero__place">📍 {detail.place}</p>
            <p className="text-muted">Hosted by {detail.hostName}</p>
            <div className="cluster cluster--tight">
              <span className="badge badge--info">
                {detail.confirmedSeats}/{detail.capacity} confirmed
              </span>
              {detail.signups.filter((s) => s.status === WAITING).length > 0 && (
                <span className="badge badge--available">
                  {detail.signups.filter((s) => s.status === WAITING).length} waiting
                </span>
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

          <fieldset className="session-form-fields stack" disabled={busy} aria-busy={busy}>
            {/* Actieve sessies bieden aanmelden of het intrekken van de eigen aanmelding. */}
            {!detail.isCancelled && currentMember && (
              <SignupActions
                detail={detail}
                signedUp={detail.currentMemberSignedUp}
                games={games}
                onSignUp={async (gameId) => {
                  // Stuurt de aanmelding en het optionele meegenomen spel naar de API.
                  const d = await run(() => api.signUp(detail.id, gameId))
                  if (d) onChanged(d)
                }}
                onCancelSignup={async () => {
                  // Verwijdert de eigen aanmelding via de API.
                  const d = await run(() => api.cancelSignup(detail.id))
                  if (d) onChanged(d)
                }}
              />
            )}

            {/* Alleen de host ziet wijzigen, hostschap overdragen en annuleren. */}
            {isHost && !detail.isCancelled && (
              <HostControls
                detail={detail}
                members={members}
                onUpdated={async (input) => {
                  // Slaat gewijzigde sessiegegevens op via de API.
                  const d = await run(() => api.updateSession(detail.id, input))
                  if (d) onChanged(d)
                  return Boolean(d)
                }}
                onTransfer={async (newHostId) => {
                  // Draagt het hostschap over via de API.
                  const d = await run(() => api.transferHost(detail.id, newHostId))
                  if (d) onChanged(d)
                }}
                onCancel={async () => {
                  // Markeert de sessie via de API als geannuleerd.
                  const d = await run(() => api.cancelSession(detail.id))
                  if (d) onChanged(d)
                }}
              />
            )}

            {/* Een commissielid kan ook een sessie annuleren waarvan het geen host is. */}
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

          </fieldset>

          {/* Filtert bevestigde deelnemers uit de ontvangen aanmeldingen. */}
          <div className="card">
            <div className="card__header">
              <h3>Confirmed seats ({detail.signups.filter((s) => s.status === CONFIRMED).length})</h3>
            </div>
            <div className="card__body">
              {detail.signups.filter((s) => s.status === CONFIRMED).length === 0 ? (
                <p className="text-muted">No confirmed seats yet.</p>
              ) : (
                <ul className="signup-list" role="list">
                  {detail.signups
                    .filter((s) => s.status === CONFIRMED)
                    .map((s) => (
                      <SignupRow key={s.id} signup={s} />
                    ))}
                </ul>
              )}
            </div>
          </div>

          {/* Toont wachtende deelnemers in de volgorde die de API teruggeeft. */}
          {detail.signups.filter((s) => s.status === WAITING).length > 0 && (
            <div className="card">
              <div className="card__header">
                <h3>Waiting list ({detail.signups.filter((s) => s.status === WAITING).length})</h3>
              </div>
              <div className="card__body">
                <ol className="signup-list" role="list">
                  {detail.signups
                    .filter((s) => s.status === WAITING)
                    .map((s, i) => (
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

          {/* Toont meegenomen spellen; de API berekent de waarde van gameFits. */}
          {detail.signups.filter((s) => s.broughtGame).length > 0 && (
            <div className="card">
              <div className="card__header">
                <h3>On the table tonight</h3>
              </div>
              <div className="card__body">
                <p className="text-muted">
                  The table knows what the evening looks like before it starts.
                </p>
                <ul className="table-games" role="list">
                  {detail.signups
                    .filter((s) => s.broughtGame)
                    .map((s) => {
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
      )}
    </Modal>
  )
}

