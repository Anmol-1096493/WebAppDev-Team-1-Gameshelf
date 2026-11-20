import { request } from '../../api'

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

export const wishlistApi = {
  getAll: () =>
    request<WishlistItem[]>('/api/wishlists'),

  getMine: () =>
    request<WishlistItem[]>('/api/wishlists/mine'),

  getById: (id: string) =>
    request<WishlistItem>(`/api/wishlists/${id}`),

  create: (input: WishlistItemInput) =>
    request<WishlistItem>('/api/wishlists', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: WishlistItemInput) =>
    request<WishlistItem>(`/api/wishlists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
}
