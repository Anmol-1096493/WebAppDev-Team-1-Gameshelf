import { useState, type FormEvent } from 'react'
import { wishlistItems } from './WishlistPage'
import './TradeOfferFormPage.css'

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

export default function TradeOfferFormPage() {
  const segments = window.location.pathname.split('/').filter(Boolean)
  const itemId = Number(segments[1])
  const item = wishlistItems.find((wish) => wish.id === itemId)

  const [requestedGame, setRequestedGame] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!requestedGame) {
      setError('Please select the game you want in return.')
      setSuccess(false)
      return
    }

    if (requestedGame === item?.gameTitle) {
      setError('Please choose a different game for the exchange.')
      setSuccess(false)
      return
    }

    setError('')
    setSuccess(true)
  }

  if (!item) {
    return (
      <section className="trade-form-page">
        <h1>Wishlist Item Not Found</h1>
        <a href="/wishlists">Back to Wishlists</a>
      </section>
    )
  }

  if (item.isFulfilled) {
    return (
      <section className="trade-form-page">
        <h1>Trade Unavailable</h1>
        <p>This wishlist item has already been fulfilled.</p>
        <a href={`/wishlists/${item.id}`}>Back to Wishlist Item</a>
      </section>
    )
  }

  return (
    <section className="trade-form-page" aria-labelledby="page-title">
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

      <form
        className="card trade-form-card"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="trade-form-section">
          <h2>1. Game You Are Offering</h2>

          <div className="trade-form-offered">
            <span aria-hidden="true">{item.emoji}</span>
            <div>
              <strong>{item.gameTitle}</strong>
              <p>Wanted by {item.memberName}</p>
            </div>
          </div>

          <p className="trade-form-help">
            This game is selected from the member's wishlist.
          </p>
        </div>

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
              onChange={(event) => {
                setRequestedGame(event.target.value)
                setError('')
                setSuccess(false)
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? 'trade-form-error' : 'return-game-help'
              }
            >
              <option value="">Select a catalogue game</option>
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
          <div className="trade-form-success" role="status">
            <strong>Trade Offer Preview Completed!</strong>
            <p>
              You offered {item.gameTitle} and requested {requestedGame}.
              This is a frontend demo, so no offer has been sent or saved.
            </p>
            <a href="/trade-offers">View Example Trade Offers →</a>
          </div>
        )}

        <div className="trade-form-actions">
          <a
            href={`/wishlists/${item.id}`}
            className="button button--secondary"
          >
            Cancel
          </a>

          <button type="submit" className="button button--primary">
            Send Trade Offer
          </button>
        </div>
      </form>
    </section>
  )
}
