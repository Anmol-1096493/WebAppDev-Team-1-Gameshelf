import { useState } from 'react'
import WishlistItemModal, {
  type WishlistDraft,
} from './WishlistItemModal'
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
    notes: 'Would love to try this cooperative board game.',
    isFulfilled: false,
    emoji: '🏝️',
  },
  {
    id: 3,
    memberName: 'Sophie',
    gameTitle: 'Terraforming Mars',
    priority: 'Low',
    notes: 'Found a copy through another member!',
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
    notes: 'The original Azul game would be great.',
    isFulfilled: false,
    emoji: '🟦',
  },
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

export default function WishlistPage() {
  const [tab, setTab] = useState<'community' | 'mine'>('community')
  const [myItems, setMyItems] = useState<WishlistItem[]>([
    {
      id: 101,
      memberName: 'You (demo)',
      gameTitle: 'Ticket to Ride',
      priority: 'High',
      notes: 'Looking for the European edition.',
      isFulfilled: false,
      emoji: '🚂',
    },
  ])

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null)

  const items = tab === 'community' ? wishlistItems : myItems
  const filteredItems = items.filter((item) => {
    const query = search.toLowerCase().trim()

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

  function changeTab(next: 'community' | 'mine') {
    setTab(next)
    setSearch('')
    setStatus('all')
    setPriority('all')
  }

  function openAdd() {
    setEditingItem(null)
    setModalOpen(true)
  }

  function openEdit(item: WishlistItem) {
    setEditingItem(item)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingItem(null)
  }

  function saveItem(draft: WishlistDraft) {
    if (editingItem) {
      setMyItems((current) =>
        current.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                gameTitle: draft.gameTitle,
                priority: draft.priority,
                notes: draft.notes,
                emoji: gameEmojis[draft.gameTitle] ?? '🎲',
              }
            : item
        )
      )
    } else {
      setMyItems((current) => [
        ...current,
        {
          id: Date.now(),
          memberName: 'You (demo)',
          gameTitle: draft.gameTitle,
          priority: draft.priority,
          notes: draft.notes,
          isFulfilled: false,
          emoji: gameEmojis[draft.gameTitle] ?? '🎲',
        },
      ])
    }

    closeModal()
  }

  return (
    <section className="wishlist-page" aria-labelledby="page-title">
      <header className="wishlist-page-header">
        <p className="eyebrow">GameShelf Community</p>
        <h1 id="page-title">Wishlists</h1>
        <p className="text-muted">
          Discover games other members want and manage your own wishlist.
        </p>
      </header>

      <div className="wishlist-tabs" role="group" aria-label="Wishlist views">
        <button
          type="button"
          className={`button ${
            tab === 'community' ? 'button--primary' : 'button--secondary'
          }`}
          aria-pressed={tab === 'community'}
          onClick={() => changeTab('community')}
        >
          Community Wishlists
        </button>

        <button
          type="button"
          className={`button ${
            tab === 'mine' ? 'button--primary' : 'button--secondary'
          }`}
          aria-pressed={tab === 'mine'}
          onClick={() => changeTab('mine')}
        >
          My Wishlist
        </button>

        <a href="/trade-offers" className="button button--secondary">
          My Trade Offers
        </a>
      </div>

      <div className="wishlist-section-heading">
        <div>
          <h2>{tab === 'community' ? "Members' Wishes" : 'My Wishlist'}</h2>
          <p className="text-muted">
            {tab === 'community'
              ? 'Public wishlist items from GameShelf members.'
              : 'Manage the board games you would like to have.'}
          </p>
        </div>

        {tab === 'mine' && (
          <button
            type="button"
            className="button button--primary"
            onClick={openAdd}
          >
            + Add Wishlist Item
          </button>
        )}
      </div>

      <div className="card wishlist-filters">
        <label className="form-field">
          <span className="form-label">Search games or members</span>
          <input
            type="search"
            className="form-control"
            placeholder="Search wishlists..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Status</span>
          <select
            className="form-control"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="open">Open</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
        </label>

        <label className="form-field">
          <span className="form-label">Priority</span>
          <select
            className="form-control"
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
      </div>

      <p className="wishlist-count text-muted">
        {filteredItems.length} wishlist item(s) found
      </p>

      {filteredItems.length > 0 ? (
        <ul className="wishlist-grid" role="list">
          {filteredItems.map((item) => (
            <li className="card wishlist-card" key={item.id}>
              <div className="wishlist-card-cover" aria-hidden="true">
                {item.emoji}
              </div>

              <div className="card__header">
                <p className="eyebrow">
                  Wishlist by {item.memberName}
                </p>
                <h3>{item.gameTitle}</h3>
              </div>

              <div className="card__body wishlist-card-body">
                <div className="wishlist-badges">
                  <span className="badge badge--highlight">
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

                <div className="wishlist-card-note">
                  <strong>Member's note</strong>
                  <p className="text-muted">
                    {item.notes || 'No additional notes.'}
                  </p>
                </div>
              </div>

              <footer className="card__footer wishlist-card-footer">
                {tab === 'mine' ? (
                  <button
                    type="button"
                    className="button button--secondary"
                    onClick={() => openEdit(item)}
                  >
                    Edit Wishlist Item
                  </button>
                ) : (
                  <a
                    href={`/wishlists/${item.id}`}
                    className="button button--secondary"
                  >
                    View Details →
                  </a>
                )}
              </footer>
            </li>
          ))}
        </ul>
      ) : (
        <div className="card wishlist-empty">
          <h3>No wishlist items found</h3>
          <p className="text-muted">
            Try changing your filters or search criteria.
          </p>
          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              setSearch('')
              setStatus('all')
              setPriority('all')
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {modalOpen && (
        <WishlistItemModal
          item={editingItem}
          onClose={closeModal}
          onSave={saveItem}
        />
      )}
    </section>
  )
}
