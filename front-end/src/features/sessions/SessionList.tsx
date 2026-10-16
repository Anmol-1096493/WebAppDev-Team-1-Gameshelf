import type { SessionSummary } from '../../types/Session'
import { SessionCard } from './SessionCard'

// Toont de sessiekaarten of een melding wanneer er nog geen sessies zijn.
export function SessionList({ sessions, onSelect }: {
  // De pagina geeft de opgehaalde sessies door als props.
  sessions: SessionSummary[]
  // De callback geeft het gekozen id terug aan de pagina om de details te openen.
  onSelect: (id: string) => void
}) {
  if (sessions.length === 0) {
    return (
      <div className="card empty-state">
        <div className="card__body">
          <h2>No sessions yet</h2>
          <p className="text-muted">Be the first to host a game night.</p>
        </div>
      </div>
    )
  }

  return (
    <ul className="session-grid">
      {/* map maakt één kaart per sessie; key helpt React de kaarten te herkennen bij wijzigingen. */}
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} onSelect={onSelect} />
      ))}
    </ul>
  )
}