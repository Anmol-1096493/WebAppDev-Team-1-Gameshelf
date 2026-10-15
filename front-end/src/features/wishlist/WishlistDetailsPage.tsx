import { wishlistItems } from './WishlistPage.tsx'
import './WishlistDetailsPage.css'

export default function WishlistDetailsPage() {
  // window.location.pathname bevat het pad van de huidige URL.
  // split('/') verdeelt het pad in onderdelen en filter(Boolean) verwijdert lege onderdelen.
  const segments = window.location.pathname.split('/').filter(Boolean)
  // Zet het tweede onderdeel van het URL-pad om naar een nummer.
  const itemId = Number(segments[1])
  // find() zoekt het wishlist-item waarvan de ID overeenkomt met itemId.
  // Als er geen overeenkomst is, wordt item undefined.
  const item = wishlistItems.find((wish) => wish.id === itemId)
  // Als het item niet bestaat, wordt een melding getoond in plaats van de details.
  if (!item) {
    return (
      <section className="wishlist-details">
        <a href="/wishlists">← Back to Wishlists</a>
        <div className="card wishlist-details-not-found">
          <h1>Wishlist Item Not Found</h1>
          <p className="text-muted">
            The requested wishlist item does not exist.
          </p>
        </div>
      </section>
    )
  }

  // Als het item wel bestaat, wordt de detailpagina weergegeven.
  return (
    <section className="wishlist-details" aria-labelledby="page-title">
      <a className="wishlist-details-back" href="/wishlists">
        ← Back to Community Wishlists
      </a>

      {/* De header bevat de titel en een korte beschrijving van de pagina. */}
      <header className="wishlist-details-header">
        <p className="eyebrow">Community Wishlists</p>
        <h1 id="page-title">Wishlist Item Details</h1>
        <p className="text-muted">
          Learn more about this member's wanted board game.
        </p>
      </header>

      {/* De kaart bevat alle details van het geselecteerde wishlist-item. */}
      <article className="card wishlist-details-card">
        <div className="wishlist-details-cover" aria-hidden="true">
          {item.emoji}
        </div>

        <div className="wishlist-details-content">
          {/* Toon de titel van het spel en de naam van het lid. */}
          <p className="eyebrow">Wanted Board Game</p>
          <h2>{item.gameTitle}</h2>

          <p className="text-muted">
            Wanted by <strong>{item.memberName}</strong>
          </p>

          {/* Toon de prioriteit en de status van het wishlist-item. */}
          <div className="wishlist-details-badges">
            <span className="badge badge--highlight">
              {item.priority} Priority
            </span>

            {/* De className verandert afhankelijk van de status. */}
            <span
              className={`badge ${
                item.isFulfilled ? 'badge--info' : 'badge--available'
              }`}
            >
              {/* true betekent Fulfilled; false betekent Open. */}
              {item.isFulfilled ? 'Fulfilled' : 'Open'}
            </span>
          </div>

          {/* Toon de opmerking die het lid bij het item heeft geplaatst.
              Als notes leeg is, verschijnt de standaardtekst. */}
          <div className="wishlist-details-section">
            <h3>Member's Note</h3>
            <p className="text-muted wishlist-details-note">
              {item.notes || 'No additional notes provided.'}
            </p>
          </div>
          {/* Leg uit hoe een mogelijke ruil werkt. */}
          <div className="wishlist-details-section">
            <h3>About Trading</h3>
            <p className="text-muted">
              Have this game? You can propose a game-for-game
              exchange with {item.memberName}.
              Exchanges take place in person during club evenings.
            </p>
          </div>

          {/* De beschikbare actie hangt af van de status van het item. */}
          <div className="wishlist-details-actions">
            {item.isFulfilled ? (
              // Als de wens al vervuld is, wordt een melding getoond.
              <div className="wishlist-details-notice">
                <strong>This wish has been fulfilled.</strong>
                <p>No new trade offers can be made for this item.</p>
              </div>
            ) : (
              // Als de wens nog open is, kan de gebruiker een ruilvoorstel doen.
              <a
                href={`/wishlists/${item.id}/offer`}
                className="button button--primary"
              >
                Make Trade Offer
              </a>
            )}
          </div>
        </div>
      </article>
    </section>
  )
}