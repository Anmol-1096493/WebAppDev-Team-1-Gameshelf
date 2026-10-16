import { demoMember, sessionGames, sessionMembers } from '../../data/sessions'
import { useSessions } from './useSessions'
import { SessionList } from './SessionList'
import { CreateSessionModal } from './CreateSessionModal'
import { SessionDetailModal } from './SessionDetailModal'
import './SessionsPage.css'

// Verbindt de losse componenten met de tijdelijke voorbeeldgegevens uit de hook.
export function SessionsPage() {
  const sessions = useSessions()

  return (
    <section className="sessions-page" aria-labelledby="page-title">
      <p className="eyebrow">Game nights</p>
      <h1 id="page-title">Sessions</h1>
      <p className="text-muted">
        Host a game session or join another member’s table. When all seats are taken,
        you can join the waiting list.
      </p>

      <div className="cluster session-toolbar">
        <button className="button button--primary" type="button" onClick={sessions.openCreate}>
          + Host a session
        </button>
        <button className="button button--secondary" type="button" onClick={sessions.reset}>
          Reset examples
        </button>
      </div>

      {/* map in SessionList maakt een kaart voor iedere sessie in de voorbeeldlijst. */}
      <SessionList sessions={sessions.summaries} onSelect={sessions.openDetail} />

      {sessions.creating && (
        <CreateSessionModal onCancel={sessions.closeCreate} onSubmit={sessions.createSession} />
      )}

      {sessions.detail && (
        <SessionDetailModal
          detail={sessions.detail}
          currentMember={demoMember}
          members={sessionMembers}
          games={sessionGames}
          onClose={sessions.closeDetail}
          onSignUp={sessions.signUp}
          onCancelSignup={sessions.cancelSignup}
          onUpdated={sessions.updateSession}
          onTransfer={sessions.transferHost}
          onCancel={sessions.cancelSession}
        />
      )}
    </section>
  )
}
