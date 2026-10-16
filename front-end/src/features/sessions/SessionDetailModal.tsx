import type { Game } from '../../types/Game'
import type { Member } from '../../types/Member'
import type { SessionDetail, UpdateSessionInput } from '../../types/Session'
import { CONFIRMED, WAITING, formatDate, formatTime } from './sessionUtils'
import { Modal } from './Modal'
import { SignupActions } from './SignupActions'
import { HostControls } from './HostControls'
import { SignupRow } from './SignupRow'

/* Sessiegegevens, deelnemers, wachtlijst en beschikbare beheeracties. */

export function SessionDetailModal({
  detail, currentMember, members, games, onClose,
  onSignUp, onCancelSignup, onUpdated, onTransfer, onCancel,
}: {
  detail: SessionDetail
  currentMember: Member
  members: Member[]
  games: Game[]
  onClose: () => void
  onSignUp: (gameId: string | null) => void
  onCancelSignup: () => void
  onUpdated: (input: UpdateSessionInput) => boolean
  onTransfer: (memberId: string) => void
  onCancel: () => void
}) {
  // De voorbeeldgegevens bepalen welke beheerknoppen in het scherm te zien zijn.
  const isHost = currentMember.id === detail.hostId
  const canCancel = isHost || currentMember.isCommittee

  return (
    <Modal
      title={detail.title}
      eyebrow={`${formatDate(detail.startAt)} · ${formatTime(detail.startAt)}`}
      onClose={onClose}
      size="lg"
    >
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

        <div className="stack">
          {/* Actieve sessies bieden aanmelden of het intrekken van de eigen aanmelding. */}
          {!detail.isCancelled && currentMember && (
            <SignupActions
              detail={detail}
              signedUp={detail.currentMemberSignedUp}
              games={games}
              onSignUp={onSignUp}
              onCancelSignup={onCancelSignup}
            />
          )}

          {/* Alleen de host ziet wijzigen, hostschap overdragen en annuleren. */}
          {isHost && !detail.isCancelled && (
            <HostControls
              detail={detail}
              members={members}
              onUpdated={onUpdated}
              onTransfer={onTransfer}
              onCancel={onCancel}
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
                  onClick={onCancel}
                >
                  Cancel session
                </button>
              </div>
            </div>
          )}

        </div>

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

        {/* Toont de wachtende deelnemers uit de voorbeeldgegevens. */}
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

        {/* Toont de meegenomen spellen en de spelersindicatie uit de schermgegevens. */}
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
    </Modal>
  )
}
