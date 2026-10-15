import { useState, type FormEvent } from 'react'
import { wishlistItems } from '../wishlist/WishlistPage.tsx'
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

export default function TradeOfferFormPage() {
  // Haalt de URL op, splitst deze in onderdelen en verwijdert lege onderdelen.
  const segments = window.location.pathname.split('/').filter(Boolean)
  // Zet het tweede onderdeel van de URL om naar een nummer.
  const itemId = Number(segments[1])
  // Zoekt in de wishlist naar het item met het bijbehorende ID.
  const item = wishlistItems.find((wish) => wish.id === itemId)

  // Bewaart de gekozen game, een eventuele foutmelding en of de preview succesvol is.
  const [requestedGame, setRequestedGame] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Wordt uitgevoerd wanneer het formulier wordt ingediend.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Voorkomt dat de pagina opnieuw wordt geladen bij het indienen.
    event.preventDefault()

    // Controleert of de gebruiker een game heeft gekozen.
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

    // Als de controles slagen, wordt de foutmelding verwijderd en de preview getoond.
    setError('')
    setSuccess(true)
  }

  // Als het wishlist-item niet bestaat, wordt een aparte melding getoond.
  if (!item) {
    return (
      <section className="trade-form-page">
        <h1>Wishlist Item Not Found</h1>
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
        <a href={`/wishlists/${item.id}`}>Back to Wishlist Item</a>
      </section>
    )
  }

  // De normale pagina met het formulier wordt getoond als de controles slagen.
  return (
    <section className="trade-form-page" aria-labelledby="page-title">
      {/* Link om terug te gaan naar het geselecteerde wishlist-item. */}
      <a
        href={`/wishlists/${item.id}`}
        className="trade-form-back"
      >
        ← Back to Wishlist Item
      </a>

      {/* Titel en korte uitleg van de pagina. */}
      <header className="trade-form-header">
        <p className="eyebrow">Wishlist & Trading</p>
        <h1 id="page-title">Make Trade Offer</h1>
        <p className="text-muted">
          Propose a game-for-game exchange with {item.memberName}.
        </p>
      </header>

      {/* Formulier waarin de gebruiker de ruil samenstelt. */}
      <form
        className="card trade-form-card"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Sectie 1: toont de game uit de wishlist die wordt aangeboden. */}
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

        {/* Sectie 2: laat de gebruiker kiezen welke game die terug wil. */}
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

        {/* Verschijnt alleen als er een foutmelding is. */}
        {error && (
          <p
            id="trade-form-error"
            className="trade-form-error"
            role="alert"
          >
            ⚠ {error}
          </p>
        )}

        {/* Verschijnt alleen als de invoer geldig is en de preview is voltooid. */}
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

        {/* Onderaan staan de annuleerlink en de knop om het formulier in te dienen. */}
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
