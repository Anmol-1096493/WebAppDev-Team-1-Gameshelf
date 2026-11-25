import { useEffect, useState, type FormEvent } from 'react'
import {
  wishlistApi,
  type WishlistItem,
} from '../wishlist/wishlistApi'
import { tradingApi } from './tradingApi'
import { request } from '../../api'
import './TradeOfferFormPage.css'

interface CatalogueGame {
  id: string
  title: string
}

const gameEmojis: Record<string, string> = {
  'Ark Nova': '🦁',
  'Spirit Island': '🏝️',
  'Terraforming Mars': '🪐',
  Wingspan: '🪶',
  Catan: '🏔️',
  Azul: '🟦',
  'Ticket to Ride': '🚂',
  Carcassonne: '🏰',
}

export default function TradeOfferFormPage() {
  // Haal de GUID van het wishlistitem uit de URL.
  const segments = window.location.pathname
    .split('/')
    .filter(Boolean)

  const itemId = segments[1]

  // Wishlistitem uit de backend.
  const [item, setItem] = useState<WishlistItem | null>(null)

  const [catalogueGames, setCatalogueGames] =
    useState<CatalogueGame[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [requestedGameId, setRequestedGameId] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Laad wishlistitem en games uit SQLite.
  useEffect(() => {
    let active = true

    async function loadData() {
      if (!itemId) {
        setLoadError('Invalid wishlist item ID.')
        setLoading(false)
        return
      }

      try {
        const [wishlistItem, games] = await Promise.all([
          wishlistApi.getById(itemId),
          request<CatalogueGame[]>('/api/games'),
        ])

        if (active) {
          setItem(wishlistItem)
          setCatalogueGames(games)
          setLoadError('')
        }
      } catch (err: unknown) {
        if (active) {
          setLoadError(
            err instanceof Error
              ? err.message
              : 'Could not load trade offer information.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      active = false
    }
  }, [itemId])

  // Zoek de titel van het geselecteerde spel.
  const selectedGame = catalogueGames.find(
    (game) => game.id === requestedGameId
  )

  const requestedGameTitle =
    selectedGame?.title ?? ''

  // Verstuur de aanbieding naar de backend.
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (submitting || success) {
      return
    }

    if (!item) {
      setError('Wishlist item not found.')
      return
    }

    if (!requestedGameId) {
      setError('Please select the game you want in return.')
      return
    }

    if (requestedGameId === item.gameId) {
      setError('Please choose a different game for the exchange.')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      await tradingApi.create({
        wishlistItemId: item.id,
        requestedGameId: requestedGameId,
      })

      setSuccess(true)
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not send trade offer. Please try again.'
      )
      setSuccess(false)
    } finally {
      setSubmitting(false)
    }
  }

  // Laadmelding.
  if (loading) {
    return (
      <section className="trade-form-page">
        <a href="/wishlists">← Back to Wishlists</a>
        <p className="text-muted">Loading trade offer...</p>
      </section>
    )
  }

  if (loadError || !item) {
    return (
      <section className="trade-form-page">
        <h1>Wishlist Item Not Found</h1>

        <p className="text-muted">
          {loadError ||
            'The requested wishlist item does not exist.'}
        </p>

        <a href="/wishlists">Back to Wishlists</a>
      </section>
    )
  }

  // Een item dat al is vervuld, kan niet meer worden geruild.
  if (item.isFulfilled) {
    return (
      <section className="trade-form-page">
        <h1>Trade Unavailable</h1>
        <p>This wishlist item has already been fulfilled.</p>
        <a href={`/wishlists/${item.id}`}>
          Back to Wishlist Item
        </a>
      </section>
    )
  }

  const emoji = gameEmojis[item.gameTitle] ?? '🎲'

  return (
    <section
      className="trade-form-page"
      aria-labelledby="page-title"
    >
      {/* Terug naar het wishlistitem */}
      <a
        href={`/wishlists/${item.id}`}
        className="trade-form-back"
      >
        ← Back to Wishlist Item
      </a>

      <header className="trade-form-header">
        <p className="eyebrow">
          Wishlist & Trading
        </p>

        <h1 id="page-title">
          Make Trade Offer
        </h1>

        <p className="text-muted">
          Propose a game-for-game exchange with{' '}
          {item.memberName}.
        </p>
      </header>

      <form
        className="card trade-form-card"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* aangeboden game */}
        <div className="trade-form-section">
          <h2>1. Game You Are Offering</h2>

          <div className="trade-form-offered">
            <span aria-hidden="true">
              {emoji}
            </span>

            <div>
              <strong>{item.gameTitle}</strong>

              <p>
                Wanted by {item.memberName}
              </p>
            </div>
          </div>

          <p className="trade-form-help">
            This game is selected from the member's wishlist.
          </p>
        </div>

        {/* gewenste game. */}
        <div className="trade-form-section">
          <h2>2. Game You Want in Return</h2>

          <div className="trade-form-field">
            <label htmlFor="requested-return-game">
              Requested Return Game *
            </label>

            <select
              id="requested-return-game"
              className="form-control"
              value={requestedGameId}
              disabled={submitting || success}
              onChange={(event) => {
                setRequestedGameId(event.target.value)
                setError('')
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error
                  ? 'trade-form-error'
                  : 'return-game-help'
              }
            >
              <option value="">
                Select a catalogue game
              </option>

              {catalogueGames
                .filter((game) => game.id !== item.gameId)
                .map((game) => (
                  <option
                    key={game.id}
                    value={game.id}
                  >
                    {game.title}
                  </option>
                ))}
            </select>

            <small id="return-game-help">
              Choose the game you would like to receive.
            </small>
          </div>
        </div>

        {/* overzicht van de ruil. */}
        <div className="trade-form-section">
          <h2>3. Trade Summary</h2>

          <div className="trade-form-exchange">
            <div>
              <span>You Offer</span>
              <strong>
                {item.gameTitle}
              </strong>
            </div>

            <span
              className="trade-form-arrow"
              aria-hidden="true"
            >
              ⇄
            </span>

            <div>
              <span>You Request</span>
              <strong>
                {requestedGameTitle ||
                  'No game selected'}
              </strong>
            </div>
          </div>

          <p className="trade-form-help">
            Exchanges happen in person during club evenings.
            No payments or shipping are involved.
          </p>
        </div>

        {error && (
          <p
            id="trade-form-error"
            className="trade-form-error"
            role="alert"
          >
            ⚠ {error}
          </p>
        )}

        {success && (
          <div
            className="trade-form-success"
            role="status"
          >
            <strong>
              Trade Offer Sent Successfully!
            </strong>

            <p>
              You offered {item.gameTitle} and requested{' '}
              {requestedGameTitle}.
              Your trade offer has been saved.
            </p>

            <a href="/trade-offers">
              View My Trade Offers →
            </a>
          </div>
        )}

        <div className="trade-form-actions">
          <a
            href={`/wishlists/${item.id}`}
            className="button button--secondary"
          >
            Cancel
          </a>

          <button
            type="submit"
            className="button button--primary"
            disabled={
              submitting ||
              success ||
              catalogueGames.length === 0
            }
          >
            {submitting
              ? 'Sending...'
              : success
                ? 'Offer Sent'
                : 'Send Trade Offer'}
          </button>
        </div>
      </form>
    </section>
  )
}
