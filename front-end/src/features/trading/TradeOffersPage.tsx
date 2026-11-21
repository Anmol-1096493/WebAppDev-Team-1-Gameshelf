import { useCallback, useEffect, useState } from 'react'
import {
  tradingApi,
  TradeOfferStatus,
  type TradeOffer,
} from './tradingApi'
import './TradeOffersPage.css'

// Bepaalt welk tabblad actief is.
type OfferTab = 'incoming' | 'outgoing'

// Bepaalt welke actie uitgevoerd wordt.
type OfferAction = 'accept' | 'reject' | 'cancel'

//  numerieke status uit  backend omgezet naar tekst.
function getStatusLabel(status: TradeOfferStatus): string {
  switch (status) {
    case TradeOfferStatus.Open:
      return 'OPEN'
    case TradeOfferStatus.Accepted:
      return 'ACCEPTED'
    case TradeOfferStatus.Rejected:
      return 'REJECTED'
    case TradeOfferStatus.Cancelled:
      return 'CANCELLED'
    default:
      return 'UNKNOWN'
  }
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('nl-NL')
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.'
}

export default function TradeOffersPage() {
  const [tab, setTab] = useState<OfferTab>('incoming')
  // Aanbiedingen uit de database.
  const [receivedOffers, setReceivedOffers] = useState<TradeOffer[]>([])
  const [sentOffers, setSentOffers] = useState<TradeOffer[]>([])

  // Status van het ophalen en aanpassen.
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyOfferId, setBusyOfferId] = useState<string | null>(null)

  // Haalt beide lijsten opnieuw op uit de backend.
  const loadOffers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [received, sent] = await Promise.all([
        tradingApi.getReceived(),
        tradingApi.getSent(),
      ])

      setReceivedOffers(received)
      setSentOffers(sent)
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  // Laad aanbiedingen zodra pagina opent.
  useEffect(() => {
    void loadOffers()
  }, [loadOffers])

  // Kies de lijst die bij het actieve tabblad hoort.
  const visibleOffers =
    tab === 'incoming' ? receivedOffers : sentOffers

  async function handleAction(
    offerId: string,
    action: OfferAction
  ) {
    setBusyOfferId(offerId)
    setError(null)

    try {
      if (action === 'accept') {
        await tradingApi.accept(offerId)
      } else if (action === 'reject') {
        await tradingApi.reject(offerId)
      } else {
        await tradingApi.cancel(offerId)
      }

      await loadOffers()
    } catch (err: unknown) {
      setError(getErrorMessage(err))
    } finally {
      setBusyOfferId(null)
    }
  }

  return (
    <section
      className="trade-offers-page"
      aria-labelledby="page-title"
    >
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

      {/* Foutmelding bij een mislukte API-aanroep. */}
      {error && (
        <div role="alert">
          <p>{error}</p>

          <button
            type="button"
            className="button button--secondary"
            onClick={() => void loadOffers()}
          >
            Try Again
          </button>
        </div>
      )}

      {loading && (
        <p className="text-muted" role="status">
          Loading trade offers...
        </p>
      )}

      {/* Lege lijst wanneer er geen aanbiedingen zijn. */}
      {!loading && visibleOffers.length === 0 && (
        <div className="card trade-offer-card">
          <h2>
            {tab === 'incoming'
              ? 'No received offers yet'
              : 'No sent offers yet'}
          </h2>

          <p className="text-muted">
            {tab === 'incoming'
              ? 'Trade offers from other members will appear here.'
              : 'Trade offers you send will appear here.'}
          </p>
        </div>
      )}

      {/* Aanbiedingen uit de backend. */}
      {!loading && (
        <div className="trade-offers-list">
          {visibleOffers.map((offer) => {
            const displayStatus = getStatusLabel(offer.status)

            // Alleen open aanbiedingen krijgen actieknoppen.
            const canAct =
              offer.status === TradeOfferStatus.Open

            // geen dubbel klikken tijdens een API-aanroep.
            const isBusy = busyOfferId !== null

            const memberName =
              tab === 'incoming'
                ? offer.offeredByName
                : offer.wishlistOwnerName

            return (
              <article
                key={offer.id}
                className="card trade-offer-card"
              >
                <div className="trade-offer-card-header">
                  <div>
                    <p className="eyebrow">
                      {tab === 'incoming' ? 'From' : 'To'}{' '}
                      {memberName}
                    </p>

                    <h2>
                      Trade Offer #{offer.id.slice(0, 8)}
                    </h2>
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
                    <strong>{offer.offeredGameTitle}</strong>
                  </div>

                  <span
                    className="trade-offer-exchange-arrow"
                    aria-hidden="true"
                  >
                    ⇄
                  </span>

                  <div>
                    <span>Requested Return Game</span>
                    <strong>{offer.requestedGameTitle}</strong>
                  </div>
                </div>

                <p className="trade-offer-date text-muted">
                  Created: {formatDate(offer.createdAt)}
                </p>

                {canAct && (
                  <div className="trade-offer-actions">
                    {tab === 'incoming' ? (
                      <>
                        <button
                          type="button"
                          className="button button--primary"
                          disabled={isBusy}
                          onClick={() =>
                            void handleAction(offer.id, 'accept')
                          }
                        >
                          {busyOfferId === offer.id
                            ? 'Processing...'
                            : 'Accept'}
                        </button>

                        <button
                          type="button"
                          className="button button--secondary"
                          disabled={isBusy}
                          onClick={() =>
                            void handleAction(offer.id, 'reject')
                          }
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="button button--secondary"
                        disabled={isBusy}
                        onClick={() =>
                          void handleAction(offer.id, 'cancel')
                        }
                      >
                        {busyOfferId === offer.id
                          ? 'Processing...'
                          : 'Cancel Offer'}
                      </button>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
