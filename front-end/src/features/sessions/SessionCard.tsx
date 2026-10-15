import type { SessionSummary } from '../../types/Session'
import { formatDate, formatTime } from './sessionUtils'

// Eén sessiekaart met locatie, host en bezette plaatsen.
export function SessionCard({ session: s, onSelect }: {
  session: SessionSummary
  onSelect: (id: string) => void
}) {
  return (
    <li className={`card session-card ${s.isCancelled ? 'is-cancelled' : ''}`}>
      <div
        className="session-card__clickable"
        role="button"
        tabIndex={0}
        onClick={() => onSelect(s.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect(s.id)
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
          onClick={() => onSelect(s.id)}
        >
          View
        </button>
      </footer>
    </li>
  )
}
