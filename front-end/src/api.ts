// Tiny API client for the GameShelf prototype. Login returns a signed bearer
// token stored in localStorage and sent on every request.

export const API_BASE = 'http://localhost:5080'

export type Member = {
  id: string
  name: string
  isCommittee: boolean
}

export type Game = {
  id: string
  title: string
  minPlayers: number
  maxPlayers: number
}

const TOKEN_KEY = 'gameshelf.token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function headers(extra?: HeadersInit): HeadersInit {
  const token = getToken()
  const base: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) base['Authorization'] = `Bearer ${token}`
  return { ...base, ...(extra ?? {}) }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: headers(init?.headers),
  })
  if (res.status === 401) throw new ApiError(401, 'Not signed in')
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // ignore parse errors
    }
    throw new ApiError(res.status, message)
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export const auth = {
  // Sign in with a username and password; store the returned bearer token.
  login: async (userName: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, password }),
    })
    if (!res.ok) {
      let message = 'Login failed'
      try { const b = await res.json(); if (b?.error) message = b.error } catch {}
      throw new ApiError(res.status, message)
    }
    const body = (await res.json()) as { member: Member; token: string }
    setToken(body.token)
    return body.member
  },
  // Restore the signed-in member using the stored token.
  me: () => request<Member>('/api/auth/me'),
}
