import { getToken } from '../../api'

export interface WishlistItem {
  id: string
  ownerId: string
  memberName: string
  gameId: string
  gameTitle: string
  priority: number
  note: string
  isFulfilled: boolean
}

export interface WishlistItemInput {
  gameId: string
  priority: number
  note: string
}

const API_URL = 'http://localhost:5099/api/wishlists'

async function wishlistRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(error || `HTTP error ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const wishlistApi = {
  getAll: () =>
    wishlistRequest<WishlistItem[]>(''),

  getMine: () =>
    wishlistRequest<WishlistItem[]>('/mine'),

  getById: (id: string) =>
    wishlistRequest<WishlistItem>(`/${id}`),

  create: (input: WishlistItemInput) =>
    wishlistRequest<WishlistItem>('', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: WishlistItemInput) =>
    wishlistRequest<WishlistItem>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
}
