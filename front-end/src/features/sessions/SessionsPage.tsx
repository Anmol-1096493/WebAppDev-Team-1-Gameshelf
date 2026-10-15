import type { Member } from '../../api'
import { sessionsApi } from './sessionsApi'
import { useSessions } from './useSessions'
import { SessionList } from './SessionList'
import { CreateSessionModal } from './CreateSessionModal'
import { SessionDetailModal } from './SessionDetailModal'
import './SessionsPage.css'

// Verbindt het overzicht en de formulieren met de sessiegegevens uit de hook.
export function SessionsPage({ member }: { member: Member }) {
  const sessions = useSessions()

  return (
    <section className="sessions-page" aria-labelledby="page-title">
      <p className="eyebrow">Game nights</p>
      <h1 id="page-title">Sessions</h1>
      <p className="text-muted">
        Host a game session or join another member’s table. When all seats are taken,
        you can join the waiting list.
      </p>

      {sessions.error && !sessions.openSessionId && !sessions.creating && (
        <p className="alert alert--error" role="alert">{sessions.error}</p>
      )}

      <div className="cluster session-toolbar">
        <button className="button button--primary" type="button" disabled={sessions.loading} onClick={sessions.openCreate}>
          + Host a session
        </button>
        <button className="button button--secondary" type="button"
          disabled={sessions.loading} onClick={sessions.reload}>
          Refresh
        </button>
      </div>

      {sessions.loading ? (
        <p className="text-muted" role="status">Loading sessions…</p>
      ) : (
        <SessionList sessions={sessions.summaries} onSelect={sessions.openDetail} />
      )}

      {sessions.creating && (
        <CreateSessionModal
          error={sessions.error}
          busy={sessions.busy}
          onCancel={sessions.closeCreate}
          onSubmit={async (input) => {
            const result = await sessions.run(() => sessionsApi.createSession(input))
            if (result) {
              sessions.closeCreate()
              sessions.applyDetail(result)
              sessions.setOpenSessionId(result.id)
            }
          }}
        />
      )}

      {sessions.openSessionId && (
        <SessionDetailModal
          detail={sessions.detail}
          loading={sessions.detailLoading}
          error={sessions.error}
          busy={sessions.busy}
          onRetry={() => void sessions.openDetail(sessions.openSessionId!)}
          currentMember={member}
          members={sessions.members}
          games={sessions.games}
          onClose={sessions.closeDetail}
          onChanged={sessions.applyDetail}
          run={sessions.run}
        />
      )}
    </section>
  )
}
