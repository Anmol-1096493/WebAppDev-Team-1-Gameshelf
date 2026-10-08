import { useState } from 'react'
import './WishlistPage.css'

export type WishlistItem = {
  id: number
  memberName: string
  gameTitle: string
  priority: 'High' | 'Medium' | 'Low'
  notes: string
  isFulfilled: boolean
  emoji: string
}

export const wishlistItems: WishlistItem[] = [
  {
    id: 1,
    memberName: 'Emma',
    gameTitle: 'Ark Nova',
    priority: 'High',
    notes: 'Looking for the English edition, preferably in good condition.',
    isFulfilled: false,
    emoji: '🦁',
  },
  {
    id: 2,
    memberName: 'Noah',
    gameTitle: 'Spirit Island',
    priority: 'Medium',
    notes: 'Would love to trade for this cooperative board game.',
    isFulfilled: false,
    emoji: '🏝️',
  },
  {
    id: 3,
    memberName: 'Sophie',
    gameTitle: 'Terraforming Mars',
    priority: 'Low',
    notes: 'I finally found someone willing to trade this game!',
    isFulfilled: true,
    emoji: '🪐',
  },
  {
    id: 4,
    memberName: 'Emma',
    gameTitle: 'Wingspan',
    priority: 'High',
    notes: 'Preferably complete with all original components and the rulebook.',
    isFulfilled: false,
    emoji: '🪶',
  },
  {
    id: 5,
    memberName: 'Liam',
    gameTitle: 'Catan',
    priority: 'Medium',
    notes: 'Looking for a complete English edition. A slightly damaged box is fine as long as all the pieces are included.',
    isFulfilled: true,
    emoji: '🏔️',
  },
  {
    id: 6,
    memberName: 'Olivia',
    gameTitle: 'Azul',
    priority: 'Low',
    notes: 'Interested in the original version of Azul.',
    isFulfilled: false,
    emoji: '🟦',
  },
]

export default function WishlistPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')

  const filteredItems = wishlistItems.filter((item) => {
    const query = search.trim().toLowerCase()

    const matchesSearch =
      item.gameTitle.toLowerCase().includes(query) ||
      item.memberName.toLowerCase().includes(query)

    const matchesStatus =
      status === 'all' ||
      (status === 'open' && !item.isFulfilled) ||
      (status === 'fulfilled' && item.isFulfilled)

    const matchesPriority =
      priority === 'all' ||
      item.priority.toLowerCase() === priority

    return matchesSearch && matchesStatus && matchesPriority
  })

  function resetFilters() {
    setSearch('')
    setStatus('all')
    setPriority('all')
  }

  return (
    <section className="wishlist-page" aria-labelledby="page-title">
      <header className="wishlist-page__header">
        <p className="eyebrow">GameShelf Community</p>
        <h1 id="page-title">Community Wishlists</h1>
        <p className="text-muted"> Discover which board games other club members are looking for.
          Browse their wishes and find opportunities to trade.
        </p>
      </header>

      <div className="card wishlist-filters">
        <div className="wishlist-filters__grid">
          <label className="form-field">
            <span className="form-label">Search wishlists</span>
            <input
              type="search"
              className="form-control"
              placeholder="Search games or members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <label className="form-field">
            <span className="form-label">Status</span>
            <select
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All wishes</option>
              <option value="open">Open</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </label>

          <label className="form-field">
            <span className="form-label">Priority</span>
            <select
              className="form-control"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="all">All priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
        </div>
      </div>

      <div className="wishlist-results-header">
        <div>
          <h2>Members' wishes</h2>
          <p className="text-muted">
            {filteredItems.length} wishlist item(s) found
          </p>
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <ul className="wishlist-grid" role="list">
          {filteredItems.map((item) => (
            <li key={item.id} className="card wishlist-card">
              <div className="wishlist-card__cover" aria-hidden="true">
                {item.emoji}
              </div>

              <div className="card__header">
                <p className="eyebrow">
                  Wishlist by {item.memberName}
                </p>
                <h3 className="wishlist-card__title">
                  {item.gameTitle}
                </h3>
              </div>

              <div className="card__body wishlist-card__body">
                <div className="cluster cluster--tight">
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

                <div className="wishlist-card__note">
                  <strong>Member's note</strong>
                  <p className="text-muted">{item.notes}</p>
                </div>
              </div>

              <footer className="card__footer">
                <a
                  href={`/wishlists/${item.id}`}
                  className="button button--secondary"
                >
                  View details →
                </a>
              </footer>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card wishlist-empty">
          <div className="wishlist-empty__icon" aria-hidden="true">
            🔍
          </div>
          <h3>No wishlist items found</h3>
          <p className="text-muted">
            No games match your search or filters.
            Try changing your search criteria.
          </p>
          <button
            type="button"
            className="button button--primary"
            onClick={resetFilters}
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  )
}
