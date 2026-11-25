import { request } from '../../api'

export const TradeOfferStatus = {
  Open: 0,
  Accepted: 1,
  Rejected: 2,
  Cancelled: 3,
} as const

export type TradeOfferStatus =
  (typeof TradeOfferStatus)[keyof typeof TradeOfferStatus]

//  gegevens die de backend terugstuurt.
export interface TradeOffer {
  id: string
  wishlistItemId: string

  offeredById: string
  offeredByName: string

  wishlistOwnerId: string
  wishlistOwnerName: string

  offeredGameId: string
  offeredGameTitle: string

  requestedGameId: string
  requestedGameTitle: string

  createdAt: string
  status: TradeOfferStatus
}

// De gegevens die nodig zijn om een aanbieding te maken.
export interface CreateTradeOfferInput {
  wishlistItemId: string
  requestedGameId: string
}

// Alle API-aanroepen voor Trading.
export const tradingApi = {
  // Maak een nieuwe trade offer aan.
  create: (input: CreateTradeOfferInput) =>
    request<TradeOffer>('/api/trade-offers', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getSent: () =>
    request<TradeOffer[]>('/api/trade-offers/sent'),

  getReceived: () =>
    request<TradeOffer[]>('/api/trade-offers/received'),

  // Accepteer een ontvangen aanbieding.
  accept: (id: string) =>
    request<TradeOffer>(`/api/trade-offers/${id}/accept`, {
      method: 'POST',
    }),

  // Wijs een ontvangen aanbieding af.
  reject: (id: string) =>
    request<TradeOffer>(`/api/trade-offers/${id}/reject`, {
      method: 'POST',
    }),

  cancel: (id: string) =>
    request<TradeOffer>(`/api/trade-offers/${id}/cancel`, {
      method: 'POST',
    }),
}
