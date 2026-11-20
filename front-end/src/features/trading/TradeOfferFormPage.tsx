import { useEffect, useState, type FormEvent } from 'react'
import {
  wishlistApi,
  type WishlistItem,
} from '../wishlist/wishlistApi.ts'
import './TradeOfferFormPage.css'

// Lijst met games die de gebruiker kan kiezen als ruilgame.
const catalogueGames = [
  'Ark Nova',
  'Spirit Island',
  'Terraforming Mars',
  'Wingspan',
  'Catan',
  'Azul',
  'Ticket to Ride',
  'Carcassonne',
]

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

  // Bewaar het wishlistitem uit de backend.
  const [item, setItem] = useState<WishlistItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Bewaar de gekozen game en formulierstatus.
  const [requestedGame, setRequestedGame] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Haal het geselecteerde wishlistitem op uit SQLite.
  useEffect(() => {
    let active = true

    async function loadWishlistItem() {
      if (!itemId) {
        setLoadError('Invalid wishlist item ID.')
        setLoading(false)
        return
      }

      try {
        const data = await wishlistApi.getById(itemId)

        if (active) {
          setItem(data)
          setLoadError('')
        }
      } catch (err) {
        if (active) {
          setLoadError(
            err instanceof Error
              ? err.message
              : 'Could not load wishlist item.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadWishlistItem()

    return () => {
      active = false
    }
  }, [itemId])

  // Controleer het formulier wanneer de gebruiker klikt.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!item) {
      setError('Wishlist item not found.')
      setSuccess(false)
      return
    }

    if (!requestedGame) {
      setError('Please select the game you want in return.')
      setSuccess(false)
      return
    }

    // Voorkomt dat dezelfde game wordt aangeboden en teruggevraagd.
    if (requestedGame === item?.gameTitle) {
      setError('Please choose a different game for the exchange.')
      setSuccess(false)
      return
    }

    setError('')
    setSuccess(true)
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

  // Foutmelding als het wishlistitem niet bestaat.
  if (loadError || !item) {
    return (
      <section className="trade-form-page">
        <h1>Wishlist Item Not Found</h1>
        <p className="text-muted">
          {loadError || 'The requested wishlist item does not exist.'}
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
        <p className="eyebrow">Wishlist & Trading</p>
        <h1 id="page-title">Make Trade Offer</h1>
        <p className="text-muted">
          Propose a game-for-game exchange with {item.memberName}.
        </p>
      </header>

      {/* Formulier */}
      <form
        className="card trade-form-card"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Sectie 1: aangeboden game */}
        <div className="trade-form-section">
          <h2>1. Game You Are Offering</h2>

          <div className="trade-form-offered">
            <span aria-hidden="true">{emoji}</span>
            <div>
              <strong>{item.gameTitle}</strong>
              <p>Wanted by {item.memberName}</p>
            </div>
          </div>

          <p className="trade-form-help">
            This game is selected from the member's wishlist.
          </p>
        </div>

        {/* Sectie 2: gewenste game */}
        <div className="trade-form-section">
          <h2>2. Game You Want in Return</h2>

          <div className="trade-form-field">
            <label htmlFor="requested-return-game">
              Requested Return Game *
            </label>

            <select
              id="requested-return-game"
              className="form-control"
              value={requestedGame}
              // Bij een nieuwe keuze wordt de state bijgewerkt en verdwijnen oude meldingen.
              onChange={(event) => {
                setRequestedGame(event.target.value)
                setError('')
                setSuccess(false)
              }}
              // Geeft aan of er een fout is en koppelt de juiste uitleg aan het veld.
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? 'trade-form-error' : 'return-game-help'
              }
            >
              <option value="">Select a catalogue game</option>

              {/* Maakt voor iedere game uit de catalogus een keuzemogelijkheid. */}
              {catalogueGames.map((game) => (
                <option key={game} value={game}>
                  {game}
                </option>
              ))}
            </select>

            <small id="return-game-help">
              Choose the game you would like to receive.
            </small>
          </div>
        </div>

        {/* Sectie 3: geeft een overzicht van beide kanten van de ruil. */}
        <div className="trade-form-section">
          <h2>3. Trade Summary</h2>

          <div className="trade-form-exchange">
            <div>
              <span>You Offer</span>
              <strong>{item.gameTitle}</strong>
            </div>

            <span className="trade-form-arrow" aria-hidden="true">
              ⇄
            </span>

            <div>
              <span>You Request</span>
              {/* Toont de gekozen game of een standaardtekst als er nog niets is gekozen. */}
              <strong>
                {requestedGame || 'No game selected'}
              </strong>
            </div>
          </div>

          <p className="trade-form-help">
            Exchanges happen in person during club evenings.
            No payments or shipping are involved.
          </p>
        </div>

        {/* Validatiefout */}
        {error && (
          <p
            id="trade-form-error"
            className="trade-form-error"
            role="alert"
          >
            ⚠ {error}
          </p>
        )}

        {/* Preview van het ruilvoorstel */}
        {success && (
          <div className="trade-form-success" role="status">
            <strong>Trade Offer Preview Completed!</strong>
            <p>
              You offered {item.gameTitle} and requested {requestedGame}.
              This is a frontend demo, so no offer has been sent or saved.
            </p>
            <a href="/trade-offers">View Example Trade Offers →</a>
          </div>
        )}

        {/* Actieknoppen */}
        <div className="trade-form-actions">
          <a
            href={`/wishlists/${item.id}`}
            className="button button--secondary"
          >
            Cancel
          </a>

          <button type="submit" className="button button--primary">
            Preview Trade Offer
          </button>
        </div>
      </form>
    </section>
  )
}
