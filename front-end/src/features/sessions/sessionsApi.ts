import { request, type Member, type Game } from '../../api'
import type { SessionSummary, SessionDetail, CreateSessionInput, UpdateSessionInput } from '../../types/Session'

// Alle HTTP-aanroepen die de sessiepagina gebruikt.
// De gedeelde request-functie in src/api.ts stuurt het bearer-token mee,
// leest het JSON-antwoord en maakt van HTTP-fouten een ApiError voor het scherm.

export const sessionsApi = {
  listMembers: () => request<Member[]>('/api/members'),
  listGames: () => request<Game[]>('/api/games'),
  // GET: haalt het overzicht op met aantallen bevestigde en wachtende deelnemers.
  listSessions: () => request<SessionSummary[]>('/api/sessions'),
  // GET: haalt één sessie op, inclusief deelnemers en de eigen aanmeldstatus.
  getSession: (id: string) => request<SessionDetail>(`/api/sessions/${id}`),
  // POST: verstuurt titel, starttijd, locatie en capaciteit als JSON; ontvangt de opgeslagen sessie.
  createSession: (input: CreateSessionInput) =>
    request<SessionDetail>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  // PUT: verstuurt gewijzigde velden; de backend controleert of het ingelogde lid de host is.
  updateSession: (id: string, input: UpdateSessionInput) =>
    request<SessionDetail>(`/api/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  // POST: annuleert de sessie als host of commissielid; verwijdert de sessie niet.
  cancelSession: (id: string) =>
    request<SessionDetail>(`/api/sessions/${id}/cancel`, { method: 'POST' }),
  // POST: draagt het hostschap over aan een bevestigde deelnemer.
  transferHost: (id: string, newHostId: string) =>
    request<SessionDetail>(`/api/sessions/${id}/transfer-host`, {
      method: 'POST',
      body: JSON.stringify({ newHostId }),
    }),


  // POST: meldt het ingelogde lid aan; de backend bepaalt bevestigd of wachtlijst.
  signUp: (id: string, gameId: string | null) =>
    request<SessionDetail>(`/api/sessions/${id}/signups`, {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    }),


  // DELETE: verwijdert de eigen aanmelding; de backend vult een vrije plek vanaf de wachtlijst.
  cancelSignup: (id: string) =>
    request<SessionDetail>(`/api/sessions/${id}/signups`, { method: 'DELETE' }),
}
