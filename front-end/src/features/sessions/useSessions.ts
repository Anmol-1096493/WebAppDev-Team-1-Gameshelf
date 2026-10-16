import { useState } from 'react'
import { demoMember, exampleSessions, sessionGames, sessionMembers } from '../../data/sessions'
import type { CreateSessionInput, SessionDetail, UpdateSessionInput } from '../../types/Session'
import { CONFIRMED, WAITING } from './sessionUtils'

// Werkt uitsluitend met voorbeeldgegevens in React-state.
// Aanpassingen zijn tijdelijk en verdwijnen wanneer de pagina opnieuw wordt geladen.
export function useSessions() {
  const [sessions, setSessions] = useState(() => structuredClone(exampleSessions))
  const [openSessionId, setOpenSessionId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  // Werk de aantallen, eigen aanmelding en spelindicatie bij na een schermactie.
  function updateCounts(session: SessionDetail): SessionDetail {
    const confirmedSeats = session.signups.filter((signup) => signup.status === CONFIRMED).length
    const ownSignup = session.signups.find((signup) => signup.memberId === demoMember.id)
    return {
      ...session, confirmedSeats,
      currentMemberSignedUp: Boolean(ownSignup),
      currentMemberSignupStatus: ownSignup?.status ?? null,
      signups: session.signups.map((signup) => ({
        ...signup, gameFits: !signup.broughtGame || signup.broughtGame.minPlayers <= confirmedSeats,
      })),
    }
  }

  function changeSelected(change: (session: SessionDetail) => SessionDetail) {
    setSessions((current) => current.map((session) =>
      session.id === openSessionId ? updateCounts(change(session)) : session,
    ))
  }

  function createSession(input: CreateSessionInput) {
    const session: SessionDetail = {
      ...input, id: crypto.randomUUID(), hostId: demoMember.id, hostName: demoMember.name,
      isCancelled: false, confirmedSeats: 0, currentMemberSignedUp: false,
      currentMemberSignupStatus: null, signups: [],
    }
    setSessions((current) => [session, ...current])
    setCreating(false)
    setOpenSessionId(session.id)
  }

  function signUp(gameId: string | null) {
    const id = crypto.randomUUID()
    changeSelected((session) => {
      if (session.isCancelled || session.currentMemberSignedUp) return session
      return {
        ...session,
        signups: [...session.signups, {
          id, memberId: demoMember.id, memberName: demoMember.name,
          status: session.confirmedSeats < session.capacity ? CONFIRMED : WAITING,
          createdAt: new Date().toISOString(),
          broughtGame: sessionGames.find((game) => game.id === gameId) ?? null,
          gameFits: true,
        }],
      }
    })
  }

  function cancelSignup() {
    changeSelected((session) => {
      const signups = session.signups.filter((signup) => signup.memberId !== demoMember.id)
      const confirmed = signups.filter((signup) => signup.status === CONFIRMED).length
      const next = signups.filter((signup) => signup.status === WAITING)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0]
      return {
        ...session,
        signups: signups.map((signup) => next && confirmed < session.capacity && signup.id === next.id
          ? { ...signup, status: CONFIRMED } : signup),
      }
    })
  }

  function updateSession(input: UpdateSessionInput) {
    changeSelected((session) => {
      const capacity = input.capacity ?? session.capacity
      // Toon hoe de verdeling van plaatsen verandert bij een andere capaciteit.
      const ordered = [...session.signups.filter((s) => s.status === CONFIRMED),
        ...session.signups.filter((s) => s.status === WAITING)]
      const confirmedIds = new Set(ordered.slice(0, capacity).map((signup) => signup.id))
      return { ...session, ...input, signups: session.signups.map((signup) => ({
        ...signup, status: confirmedIds.has(signup.id) ? CONFIRMED : WAITING,
      })) }
    })
    return true
  }

  function transferHost(memberId: string) {
    const member = sessionMembers.find((candidate) => candidate.id === memberId)
    if (!member) return
    changeSelected((session) => ({ ...session, hostId: member.id, hostName: member.name }))
  }

  return {
    summaries: sessions.map((session) => ({
      ...session, waitingCount: session.signups.filter((signup) => signup.status === WAITING).length,
    })),
    detail: sessions.find((session) => session.id === openSessionId) ?? null,
    creating, openSessionId, createSession, signUp, cancelSignup, updateSession, transferHost,
    openCreate: () => setCreating(true), closeCreate: () => setCreating(false),
    openDetail: setOpenSessionId, closeDetail: () => setOpenSessionId(null),
    cancelSession: () => changeSelected((session) => ({ ...session, isCancelled: true })),
    reset: () => { setSessions(structuredClone(exampleSessions)); setOpenSessionId(null) },
  }
}
