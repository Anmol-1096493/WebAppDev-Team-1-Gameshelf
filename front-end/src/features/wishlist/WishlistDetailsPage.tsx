import { useEffect, useState } from 'react'
import {
  wishlistApi,
  type WishlistItem,
} from './wishlistApi.ts'
import './WishlistDetailsPage.css'

// Emoji's voor bekende bordspellen.
const gameEmojis: Record<string, string> = {
  'Ark Nova': '🦁',
  'Spirit Island': '🏝️',
  'Terraforming Mars': '🪐',
  Wingspan: '🪶',
  Catan: '🏔️',
  Azul: '🟦',
  'Ticket to Ride': '🚂',
  Cascadia: '🌲',
  Carcassonne: '🏰',
}

// Zet de numerieke prioriteit om naar tekst.
function getPriorityLabel(priority: number): string {
  const priorities: Record<number, string> = {
    0: 'Low',
    1: 'Medium',
    2: 'High',
  }

  return priorities[priority] ?? 'Unknown'
}

export default function WishlistDetailsPage() {
  // Haal de ID uit de URL.
  // split('/') verdeelt het pad in onderdelen en filter(Boolean) verwijdert lege onderdelen.
  const segments = window.location.pathname
    .split('/')
    .filter(Boolean)
  const itemId = segments[1]

  // State voor het wishlistitem.
  const [item, setItem] = useState<WishlistItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Haal de gegevens van het item op uit de backend.
  useEffect(() => {
    let active = true

    async function loadWishlistItem() {
      if (!itemId) {
        setError('Invalid wishlist item ID.')
        setLoading(false)
        return
      }

      try {
        const data = await wishlistApi.getById(itemId)

        if (active) {
          setItem(data)
          setError('')
        }
      } catch (err) {
        if (active) {
          setError(
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

  // Toon een laadmelding tijdens het ophalen.
  if (loading) {
    return (
      <section className="wishlist-details">
        <a href="/wishlists">← Back to Wishlists</a>
        <p className="text-muted">Loading wishlist details...</p>
      </section>
    )
  }

  // Toon een foutmelding als het item niet bestaat
  // of niet opgehaald kan worden.
  if (error || !item) {
    return (
      <section className="wishlist-details">
        <a href="/wishlists">← Back to Wishlists</a>

        <div className="card wishlist-details-not-found">
          <h1>Wishlist Item Not Found</h1>
          <p className="text-muted">
            {error || 'The requested wishlist item does not exist.'}
          </p>
        </div>
      </section>
    )
  }

  // Bepaal de emoji en prioriteit.
  const emoji = gameEmojis[item.gameTitle] ?? '🎲'
  const priorityLabel = getPriorityLabel(item.priority)

  return (
    <section
      className="wishlist-details"
      aria-labelledby="page-title"
    >
      <a
        className="wishlist-details-back"
        href="/wishlists"
      >
        ← Back to Community Wishlists
      </a>

      <header className="wishlist-details-header">
        <p className="eyebrow">Community Wishlists</p>
        <h1 id="page-title">Wishlist Item Details</h1>
        <p className="text-muted">
          Learn more about this member's wanted board game.
        </p>
      </header>

      {/* De kaart bevat alle details van het geselecteerde wishlist-item. */}
      <article className="card wishlist-details-card">
        <div
          className="wishlist-details-cover"
          aria-hidden="true"
        >
          {emoji}
        </div>

        <div className="wishlist-details-content">
          <p className="eyebrow">Wanted Board Game</p>
          <h2>{item.gameTitle}</h2>

          <p className="text-muted">
            Wanted by <strong>{item.memberName}</strong>
          </p>

          {/* Prioriteit en status */}
          <div className="wishlist-details-badges">
            <span className="badge badge--highlight">
              {priorityLabel} Priority
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

          {/* Opmerking */}
          <div className="wishlist-details-section">
            <h3>Member's Note</h3>
            <p className="text-muted wishlist-details-note">
              {item.note || 'No additional notes provided.'}
            </p>
          </div>

          {/* Trading-informatie */}
          <div className="wishlist-details-section">
            <h3>About Trading</h3>
            <p className="text-muted">
              Have this game? You can propose a game-for-game
              exchange with {item.memberName}.
              Exchanges take place in person during club evenings.
            </p>
          </div>

          {/* Tradingactie */}
          <div className="wishlist-details-actions">
            {item.isFulfilled ? (
              <div className="wishlist-details-notice">
                <strong>This wish has been fulfilled.</strong>
                <p>
                  No new trade offers can be made for this item.
                </p>
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