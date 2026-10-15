import { request, type Member, type Game } from '../../api'
import type { SessionSummary, SessionDetail, CreateSessionInput, UpdateSessionInput } from '../../types/Session'

// Alle HTTP-aanroepen die de sessiepagina gebruikt.
export const sessionsApi = {
  // Members available as potential session hosts.
  listMembers: () => request<Member[]>('/api/members'),
  // Catalogue games a member can bring to a session.
  listGames: () => request<Game[]>('/api/games'),
  // Session cards with confirmed and waiting counts.
  listSessions: () => request<SessionSummary[]>('/api/sessions'),
  // Full session details and the current member's signup status.
  getSession: (id: string) => request<SessionDetail>(`/api/sessions/${id}`),
  // Host a new session.
  createSession: (input: CreateSessionInput) =>
    request<SessionDetail>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  // Change a session's details as its host.
  updateSession: (id: string, input: UpdateSessionInput) =>
    request<SessionDetail>(`/api/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  // Cancel a session as its host or a committee member.
  cancelSession: (id: string) =>
    request<SessionDetail>(`/api/sessions/${id}/cancel`, { method: 'POST' }),
  // Hand hosting to a member with a confirmed seat.
  transferHost: (id: string, newHostId: string) =>
    request<SessionDetail>(`/api/sessions/${id}/transfer-host`, {
      method: 'POST',
      body: JSON.stringify({ newHostId }),
    }),
  // Claim a seat, or join the waiting list when the session is full.
  signUp: (id: string, gameId: string | null) =>
    request<SessionDetail>(`/api/sessions/${id}/signups`, {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    }),
  // Leave a session; the next waiting member gets any freed seat.
  cancelSignup: (id: string) =>
    request<SessionDetail>(`/api/sessions/${id}/signups`, { method: 'DELETE' }),
}
