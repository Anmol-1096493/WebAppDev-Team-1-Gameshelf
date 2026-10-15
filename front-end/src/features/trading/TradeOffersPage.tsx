import { useState } from 'react'
import './TradeOffersPage.css'


// Dit type bepaalt welke statussen een trade offer kan hebben.
type OfferStatus =
  | 'OPEN'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'CANCELLED'

// Dit type beschrijft de structuur van één trade offer.
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

// Voorbeeldgegevens van ontvangen en verzonden ruilvoorstellen.
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

// Deze React-component toont de pagina met ontvangen en verzonden ruilvoorstellen.
export default function TradeOffersPage() {
  // tab bepaalt welke aanbiedingen zichtbaar zijn.
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming')
  // offers bevat de lijst met ruilvoorstellen.
  const [offers, setOffers] = useState<TradeOffer[]>(exampleOffers)
  // filter() toont alleen aanbiedingen waarvan direction overeenkomt met de actieve tab.
  const visibleOffers = offers.filter(
    (offer) => offer.direction === tab
  )

  // Deze functie past de status van een ruilvoorstel aan.
  // De ID bepaalt welk aanbod gewijzigd moet worden.
  function changeStatus(id: number, status: OfferStatus) {
    setOffers((current) =>
      // map() loopt door de lijst en maakt een nieuwe array.
      current.map((offer) => {

        // Sla het aanbod over als:
        // - de ID niet overeenkomt;
        // - de status niet OPEN is;
        // - of het aanbod verlopen is.
        if (
          offer.id !== id ||
          offer.status !== 'OPEN' ||
          offer.expired
        ) {
          return offer
        }

        // Maak een nieuw object met dezelfde gegevens,
        // maar met de nieuwe status.
        return { ...offer, status }
      })
    )
  }

  // JSX beschrijft de structuur van de interface.
  return (
    <section className="trade-offers-page" aria-labelledby="page-title">
      {/* De header bevat de titel, beschrijving en teruglink. */}
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
      {/* Met de tabbladen wissel je tussen ontvangen en verzonden aanbiedingen. */}
      <div
        className="trade-offers-tabs"
        role="group"
        aria-label="Trade offer views"
      >
        <button
          type="button"
          // De actieve tab krijgt de primary-styling.
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


      {/* Toon een kaart voor ieder aanbod dat bij de geselecteerde tab hoort. */}
      <div className="trade-offers-list">
        {visibleOffers.map((offer) => {

          // Een open aanbod dat verlopen is, wordt als EXPIRED weergegeven.
          // De oorspronkelijke status in het object blijft OPEN.
          const displayStatus =
            offer.status === 'OPEN' && offer.expired
              ? 'EXPIRED'
              : offer.status

          // Alleen open en niet verlopen aanbiedingen kunnen acties uitvoeren.
          const canAct =
            offer.status === 'OPEN' && !offer.expired

          return (
            // key={offer.id} helpt React om de verschillende aanbiedingen te herkennen.
            <article
              key={offer.id}
              className="card trade-offer-card"
            >

              {/* Toon van wie het aanbod komt of naar wie het is gestuurd. */}
              <div className="trade-offer-card-header">
                <div>
                  <p className="eyebrow">
                    {tab === 'incoming' ? 'From' : 'To'} {offer.member}
                  </p>
                  <h2>Trade Offer #{offer.id}</h2>
                </div>

                {/* Toon de status */}
                <span
                  className={`trade-offer-status trade-offer-status-${displayStatus.toLowerCase()}`}
                >
                  {displayStatus}
                </span>
              </div>

              {/* Toon welk spel wordt aangeboden en welk spel ervoor wordt gevraagd. */}
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
              {/* Toon de datum waarop het aanbod is aangemaakt. */}
              <p className="trade-offer-date text-muted">
                Created: {offer.createdAt}
              </p>
              {/* Toon de actieknoppen alleen als het aanbod nog behandeld kan worden. */}
              {canAct && (
                <div className="trade-offer-actions">

                  {/* Bij ontvangen aanbiedingen kan het aanbod worden geaccepteerd of afgewezen. */}
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
                    // Bij verzonden aanbiedingen kan het aanbod worden geannuleerd.
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

              {/* Toon een aparte melding als het aanbod verlopen is. */}
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
