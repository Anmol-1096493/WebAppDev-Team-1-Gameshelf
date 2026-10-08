import { wishlistItems } from './WishlistPage'
import './WishlistDetailsPage.css'

export default function WishlistDetailsPage() {
  const pathParts = window.location.pathname.split('/').filter(Boolean)
  const id = Number(pathParts[1])

  const item = wishlistItems.find((wish) => wish.id === id)

  if (!item) {
    return (
      <section className="wishlist-details">
        <a href="/wishlists" className="wishlist-details__back">
          ← Back to wishlists
        </a>

        <div className="card wishlist-details__empty">
          <h1>Wishlist item not found</h1>
          <p className="text-muted">
            This wishlist item does not exist or is no longer available.
          </p>
          <a href="/wishlists" className="button button--primary">
            Browse wishlists
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="wishlist-details" aria-labelledby="page-title">
      <a href="/wishlists" className="wishlist-details__back">
        ← Back to wishlists
      </a>

      <header className="wishlist-details__header">
        <p className="eyebrow">Community Wishlists</p>
        <h1 id="page-title">Wishlist Item Details</h1>
        <p className="text-muted">
          View the details of this member's wanted board game.
        </p>
      </header>

      <div className="card wishlist-details__card">
        <div className="wishlist-details__cover" aria-hidden="true">
          {item.emoji}
        </div>

        <div className="wishlist-details__content">
          <p className="eyebrow">Wanted board game</p>
          <h2 className="wishlist-details__title">
            {item.gameTitle}
          </h2>

          <p className="text-muted">
            Wanted by <strong>{item.memberName}</strong>
          </p>

          <div className="cluster cluster--tight wishlist-details__badges">
            <span
              className={`badge ${
                item.priority === 'High'
                  ? 'badge--highlight'
                  : item.priority === 'Medium'
                    ? 'badge--available'
                    : 'badge--info'
              }`}
            >
              {item.priority} priority
            </span>

            <span
              className={`badge ${
                item.isFulfilled
                  ? 'badge--info'
                  : 'badge--available'
              }`}
            >
              {item.isFulfilled ? 'Fulfilled' : 'Open'}
            </span>
          </div>

          <div className="wishlist-details__section">
            <h3>Member's note</h3>
            <p className="text-muted wishlist-details__note">
              {item.notes || 'No additional notes provided.'}
            </p>
          </div>

          <div className="wishlist-details__section">
            <h3>Trade information</h3>
            <p className="text-muted">
              GameShelf members can exchange board games in person
              during club evenings. No payments or shipping are involved.
            </p>
          </div>

          <div className="wishlist-details__actions">
            {item.isFulfilled ? (
              <div className="wishlist-details__notice">
                <strong>This wish has been fulfilled</strong>
                <p>
                  This member has already found the game.
                  New trade offers are no longer available.
                </p>
              </div>
            ) : (
              <>
                <p className="text-muted">
                  Have this game? You can offer it in exchange for
                  another board game.
                </p>

                <button
                  type="button"
                  className="button button--primary"
                  disabled
                  title="Trade offers will be available in a future version"
                >
                  Make Trade Offer (Coming soon)
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}