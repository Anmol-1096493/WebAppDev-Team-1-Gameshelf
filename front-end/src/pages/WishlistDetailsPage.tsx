import { wishlistItems } from './WishlistPage'
import './WishlistDetailsPage.css'

export default function WishlistDetailsPage() {
  const segments = window.location.pathname.split('/').filter(Boolean)
  const itemId = Number(segments[1])
  const item = wishlistItems.find((wish) => wish.id === itemId)

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

  return (
    <section className="wishlist-details" aria-labelledby="page-title">
      <a className="wishlist-details-back" href="/wishlists">
        ← Back to Community Wishlists
      </a>

      <header className="wishlist-details-header">
        <p className="eyebrow">Community Wishlists</p>
        <h1 id="page-title">Wishlist Item Details</h1>
        <p className="text-muted">
          Learn more about this member's wanted board game.
        </p>
      </header>

      <article className="card wishlist-details-card">
        <div className="wishlist-details-cover" aria-hidden="true">
          {item.emoji}
        </div>

        <div className="wishlist-details-content">
          <p className="eyebrow">Wanted Board Game</p>
          <h2>{item.gameTitle}</h2>

          <p className="text-muted">
            Wanted by <strong>{item.memberName}</strong>
          </p>

          <div className="wishlist-details-badges">
            <span className="badge badge--highlight">
              {item.priority} Priority
            </span>

            <span
              className={`badge ${
                item.isFulfilled ? 'badge--info' : 'badge--available'
              }`}
            >
              {item.isFulfilled ? 'Fulfilled' : 'Open'}
            </span>
          </div>

          <div className="wishlist-details-section">
            <h3>Member's Note</h3>
            <p className="text-muted wishlist-details-note">
              {item.notes || 'No additional notes provided.'}
            </p>
          </div>

          <div className="wishlist-details-section">
            <h3>About Trading</h3>
            <p className="text-muted">
              Have this game? You can propose a game-for-game
              exchange with {item.memberName}.
              Exchanges take place in person during club evenings.
            </p>
          </div>

          <div className="wishlist-details-actions">
            {item.isFulfilled ? (
              <div className="wishlist-details-notice">
                <strong>This wish has been fulfilled.</strong>
                <p>No new trade offers can be made for this item.</p>
              </div>
            ) : (
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
