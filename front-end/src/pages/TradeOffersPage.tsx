import { useState } from 'react'
import './TradeOffersPage.css'

type OfferStatus =
  | 'OPEN'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'

type TradeOffer = {
  id: number
  direction: 'incoming' | 'outgoing'
  member: string
  offeredGame: string
  requestedGame: string
  status: OfferStatus
  expired: boolean
  createdAt: string
}

const exampleOffers: TradeOffer[] = [
  {
    id: 1,
    direction: 'incoming',
    member: 'Emma',
    offeredGame: 'Wingspan',
    requestedGame: 'Catan',
    status: 'OPEN',
    expired: false,
    createdAt: '2026-10-08',
  },
  {
    id: 2,
    direction: 'incoming',
    member: 'Noah',
    offeredGame: 'Spirit Island',
    requestedGame: 'Azul',
    status: 'ACCEPTED',
    expired: false,
    createdAt: '2026-10-02',
  },
  {
    id: 3,
    direction: 'incoming',
    member: 'Olivia',
    offeredGame: 'Ark Nova',
    requestedGame: 'Carcassonne',
    status: 'REJECTED',
    expired: false,
    createdAt: '2026-10-01',
  },
  {
    id: 4,
    direction: 'outgoing',
    member: 'Liam',
    offeredGame: 'Catan',
    requestedGame: 'Wingspan',
    status: 'OPEN',
    expired: false,
    createdAt: '2026-10-07',
  },
  {
    id: 5,
    direction: 'outgoing',
    member: 'Sophie',
    offeredGame: 'Azul',
    requestedGame: 'Terraforming Mars',
    status: 'CANCELLED',
    expired: false,
    createdAt: '2026-10-03',
  },
  {
    id: 6,
    direction: 'outgoing',
    member: 'Emma',
    offeredGame: 'Ark Nova',
    requestedGame: 'Ticket to Ride',
    status: 'OPEN',
    expired: true,
    createdAt: '2026-09-01',
  },
]

export default function TradeOffersPage() {
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming')
  const [offers, setOffers] = useState<TradeOffer[]>(exampleOffers)

  const visibleOffers = offers.filter(
    (offer) => offer.direction === tab
  )

  function changeStatus(id: number, status: OfferStatus) {
    setOffers((current) =>
      current.map((offer) => {
        if (
          offer.id !== id ||
          offer.status !== 'OPEN' ||
          offer.expired
        ) {
          return offer
        }

        return { ...offer, status }
      })
    )
  }

  return (
    <section className="trade-offers-page" aria-labelledby="page-title">
      <header className="trade-offers-header">
        <p className="eyebrow">Wishlist & Trading</p>
        <h1 id="page-title">My Trade Offers</h1>
        <p className="text-muted">
          View and manage trade offers you have received and sent.
        </p>
        <a href="/wishlists" className="trade-offers-back">
          ← Back to Wishlists
        </a>
      </header>

      <div
        className="trade-offers-tabs"
        role="group"
        aria-label="Trade offer views"
      >
        <button
          type="button"
          className={`button ${
            tab === 'incoming'
              ? 'button--primary'
              : 'button--secondary'
          }`}
          aria-pressed={tab === 'incoming'}
          onClick={() => setTab('incoming')}
        >
          Received Offers
        </button>

        <button
          type="button"
          className={`button ${
            tab === 'outgoing'
              ? 'button--primary'
              : 'button--secondary'
          }`}
          aria-pressed={tab === 'outgoing'}
          onClick={() => setTab('outgoing')}
        >
          Sent Offers
        </button>
      </div>

      <div className="trade-offers-list">
        {visibleOffers.map((offer) => {
          const displayStatus =
            offer.status === 'OPEN' && offer.expired
              ? 'EXPIRED'
              : offer.status

          const canAct =
            offer.status === 'OPEN' && !offer.expired

          return (
            <article
              key={offer.id}
              className="card trade-offer-card"
            >
              <div className="trade-offer-card-header">
                <div>
                  <p className="eyebrow">
                    {tab === 'incoming' ? 'From' : 'To'} {offer.member}
                  </p>
                  <h2>Trade Offer #{offer.id}</h2>
                </div>

                <span
                  className={`trade-offer-status trade-offer-status-${displayStatus.toLowerCase()}`}
                >
                  {displayStatus}
                </span>
              </div>

              <div className="trade-offer-exchange">
                <div>
                  <span>Offered Game</span>
                  <strong>{offer.offeredGame}</strong>
                </div>

                <span
                  className="trade-offer-exchange-arrow"
                  aria-hidden="true"
                >
                  ⇄
                </span>

                <div>
                  <span>Requested Return Game</span>
                  <strong>{offer.requestedGame}</strong>
                </div>
              </div>

              <p className="trade-offer-date text-muted">
                Created: {offer.createdAt}
              </p>

              {canAct && (
                <div className="trade-offer-actions">
                  {tab === 'incoming' ? (
                    <>
                      <button
                        type="button"
                        className="button button--primary"
                        onClick={() =>
                          changeStatus(offer.id, 'ACCEPTED')
                        }
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        className="button button--secondary"
                        onClick={() =>
                          changeStatus(offer.id, 'REJECTED')
                        }
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={() =>
                        changeStatus(offer.id, 'CANCELLED')
                      }
                    >
                      Cancel Offer
                    </button>
                  )}
                </div>
              )}

              {displayStatus === 'EXPIRED' && (
                <p className="trade-offer-expired">
                  This offer has expired and can no longer be accepted.
                </p>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}
