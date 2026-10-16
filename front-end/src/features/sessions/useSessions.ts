import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError, type Game, type Member } from '../../api'
import type { SessionDetail, SessionSummary } from '../../types/Session'
import { sessionsApi } from './sessionsApi'
import { messageOf } from './sessionUtils'

// Beheert API-gegevens, laden, fouten en het openen van sessiedetails.
// De pagina en losse componenten hoeven hierdoor zelf geen gegevens op te halen.
export function useSessions() {
  // useState bewaart gegevens tussen renders; een setter laat React de weergave bijwerken.
  const [members, setMembers] = useState<Member[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [summaries, setSummaries] = useState<SessionSummary[]>([])
  const [detail, setDetail] = useState<SessionDetail | null>(null)
  const [openSessionId, setOpenSessionId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const pending = useRef(false)
  const listRequest = useRef(0)
  const detailRequest = useRef(0)

  // Maak lopende antwoorden ongeldig wanneer de pagina sluit of opnieuw gaat laden.
  const invalidateRequests = useCallback(() => {
    listRequest.current++
    detailRequest.current++
  }, [])

  // Een volgnummer voorkomt dat een ouder antwoord nieuwere gegevens overschrijft.
  useEffect(() => {
    const requestId = ++listRequest.current
    // Deze drie onafhankelijke aanvragen starten tegelijk; daarna vullen we de state.
    Promise.all([
      sessionsApi.listMembers(), sessionsApi.listGames(), sessionsApi.listSessions(),
    ]).then(([memberList, gameList, sessionList]) => {
      if (requestId !== listRequest.current) return
      setMembers(memberList)
      setGames(gameList)
      setSummaries(sessionList)
    }).catch((e: unknown) => {
      if (requestId === listRequest.current) setError(messageOf(e))
    }).finally(() => {
      if (requestId === listRequest.current) setLoading(false)
    })
    return invalidateRequests
  }, [refreshVersion, invalidateRequests])

  // Een gewijzigd refreshVersion laat het effect de gegevens opnieuw ophalen.
  function reload() {
    setLoading(true)
    setError(null)
    setRefreshVersion((version) => version + 1)
  }

  // Vernieuwt alleen de kaarten na een actie, zonder alle keuzelijsten opnieuw te laden.
  async function refreshList() {
    const requestId = ++listRequest.current
    try {
      const list = await sessionsApi.listSessions()
      if (requestId === listRequest.current) setSummaries(list)
    } catch (e) {
      if (requestId === listRequest.current) setError(messageOf(e))
    }
  }

  // Wis eerst de vorige sessie; accepteer alleen het antwoord voor de laatste selectie.
  async function openDetail(id: string) {
    const requestId = ++detailRequest.current
    setOpenSessionId(id)
    setDetail(null)
    setError(null)
    setDetailLoading(true)
    try {
      const result = await sessionsApi.getSession(id)
      if (requestId === detailRequest.current) setDetail(result)
    } catch (e) {
      if (requestId === detailRequest.current) setError(messageOf(e))
    } finally {
      if (requestId === detailRequest.current) setDetailLoading(false)
    }
  }

  // Voorkom sluiten tijdens opslaan en negeer een eventueel laat detailantwoord.
  function closeDetail() {
    if (pending.current) return
    detailRequest.current++
    setOpenSessionId(null)
    setDetail(null)
    setError(null)
  }

  // Na een wijziging worden zowel de details als de aantallen op de kaarten bijgewerkt.
  function applyDetail(result: SessionDetail) {
    setDetail(result)
    void refreshList()
  }

  // Voorkomt dubbele acties en toont API-fouten ook binnen het geopende formulier.
  async function run<T>(fn: () => Promise<T>, onError?: (e: ApiError) => void): Promise<T | undefined> {
    if (pending.current) return undefined
    pending.current = true
    setBusy(true)
    setError(null)
    try {
      return await fn()
    } catch (e) {
      setError(messageOf(e))
      if (e instanceof ApiError) onError?.(e)
      return undefined
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  function openCreate() {
    setError(null)
    setCreating(true)
  }

  function closeCreate() {
    if (pending.current) return
    setCreating(false)
    setError(null)
  }

  return {
    members, games, summaries, detail, openSessionId, creating, error,
    loading, detailLoading, busy, reload, openDetail, closeDetail,
    applyDetail, run, openCreate, closeCreate, setOpenSessionId,
  }
}
