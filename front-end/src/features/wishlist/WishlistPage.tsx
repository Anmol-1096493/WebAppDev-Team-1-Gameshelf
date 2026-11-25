import { useEffect, useState } from 'react'
import { request, type Game } from '../../api.ts'
import WishlistItemModal, {
  type WishlistDraft,
} from './WishlistItemModal.tsx'
import {wishlistApi, type WishlistItem as ApiWishlistItem,} from './wishlistApi.ts'
import './WishlistPage.css'

// Bestaand type voor andere pagina's die WishlistItem gebruiken.
export type WishlistItem = {
  id: number
  memberName: string
  gameTitle: string
  priority: 'High' | 'Medium' | 'Low'
  notes: string
  isFulfilled: boolean
  emoji: string
}

type DisplayWishlistItem = Omit<WishlistItem, 'id'> & {
  id: string | number
}

// Bestaande demo items blijven beschikbaar voor andere pagina's
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

// Dit object koppelt elke bekende gametitel aan een emoji.
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

// Zet backendgegevens om naar het bestaande frontendformaat.
function convertWishlistItem(
  item: ApiWishlistItem
): DisplayWishlistItem {
  const priorities: Record<number, WishlistItem['priority']> = {
    0: 'Low',
    1: 'Medium',
    2: 'High',
  }

  return {
    id: item.id,
    memberName: item.memberName,
    gameTitle: item.gameTitle,
    priority: priorities[item.priority] ?? 'Low',
    notes: item.note,
    isFulfilled: item.isFulfilled,
    emoji: gameEmojis[item.gameTitle] ?? '🎲',
  }
}

export default function WishlistPage() {
  // Actief tabblad.
  const [tab, setTab] = useState<'community' | 'mine'>('community')

  // Community wishlists uit de backend.
  const [communityItems, setCommunityItems] = useState<
    DisplayWishlistItem[]
  >([])

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Eigen wishlist uit de backend.
  const [myItems, setMyItems] = useState<DisplayWishlistItem[]>([])
  const [myLoading, setMyLoading] = useState(true)
  const [myError, setMyError] = useState('')

  // Catalogus met echte game ID's.
  const [games, setGames] = useState<Game[]>([])
  const [gamesLoading, setGamesLoading] = useState(true)
  const [gamesError, setGamesError] = useState('')

  // Opslagstatus.
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)

  // Filters.
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')

  // Modal voor toevoegen en bewerken.
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] =
    useState<DisplayWishlistItem | null>(null)

  // Haal de community-wishlists op wanneer de pagina opent.
  useEffect(() => {
    let active = true

    async function loadWishlists() {
      try {
        const data = await wishlistApi.getAll()

        if (active) {
          setCommunityItems(data.map(convertWishlistItem))
          setLoadError('')
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : 'Could not load wishlists.'
          )
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadWishlists()

    return () => {
      active = false
    }
  }, [])

  // Haal de wishlist van de ingelogde gebruiker op.
  useEffect(() => {
    let active = true

    async function loadMyWishlist() {
      try {
        const data = await wishlistApi.getMine()

        if (active) {
          setMyItems(data.map(convertWishlistItem))
          setMyError('')
        }
      } catch (error) {
        if (active) {
          setMyError(
            error instanceof Error
              ? error.message
              : 'Could not load your wishlist.'
          )
        }
      } finally {
        if (active) {
          setMyLoading(false)
        }
      }
    }

    void loadMyWishlist()

    return () => {
      active = false
    }
  }, [])

  // Haal de bordspellen op uit de catalogus.
  useEffect(() => {
    let active = true

    async function loadGames() {
      try {
        const data = await request<Game[]>('/api/games')

        if (active) {
          setGames(data)
          setGamesError('')
        }
      } catch (error) {
        if (active) {
          setGamesError(
            error instanceof Error
              ? error.message
              : 'Could not load catalogue.'
          )
        }
      } finally {
        if (active) {
          setGamesLoading(false)
        }
      }
    }

    void loadGames()

    return () => {
      active = false
    }
  }, [])

  // Kies de juiste gegevens voor het actieve tabblad.
  const items: DisplayWishlistItem[] =
    tab === 'community' ? communityItems : myItems

  // Zoeken en filteren.
  const filteredItems = items.filter((item) => {
    // Maak de zoekterm kleine letters en verwijder spaties aan het begin en einde.
    const query = search.toLowerCase().trim()

    // includes() controleert of de zoekterm in de tekst voorkomt.
    const matchesSearch =
      item.gameTitle.toLowerCase().includes(query) ||
      item.memberName.toLowerCase().includes(query)

    // Controleer of het item bij de gekozen status past.
    const matchesStatus =
      status === 'all' ||
      (status === 'open' && !item.isFulfilled) ||
      (status === 'fulfilled' && item.isFulfilled)
    // Controleer of het item bij de gekozen prioriteit past.
    const matchesPriority =
      priority === 'all' ||
      item.priority.toLowerCase() === priority

    // Alleen items die aan alle actieve filters voldoen, blijven over.
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Wissel van tabblad en reset de filters, zodat oude filters niet blijven staan
  function changeTab(next: 'community' | 'mine') {
    setTab(next)
    setSearch('')
    setStatus('all')
    setPriority('all')
  }

  // Open de modal om een item toe te voegen.
  function openAdd() {
    setSaveError('')
    setEditingItem(null)
    setModalOpen(true)
  }

  // Open de modal om een item te bewerken.
  function openEdit(item: DisplayWishlistItem) {
    setSaveError('')
    setEditingItem(item)
    setModalOpen(true)
  }

  // Sluit de modal.
  function closeModal() {
    if (saving) return

    setModalOpen(false)
    setEditingItem(null)
  }

  // Sla het item op in SQLite via de backend.
  async function saveItem(draft: WishlistDraft): Promise<void> {
    if (saving) return

    setSaving(true)
    setSaveError('')

    const priorityValue = {
      Low: 0,
      Medium: 1,
      High: 2,
    }[draft.priority]

    try {
      const input = {
        gameId: draft.gameId,
        priority: priorityValue,
        note: draft.notes,
      }

      if (editingItem) {
        if (typeof editingItem.id !== 'string') {
          throw new Error('Invalid wishlist item ID.')
        }

        // PUT: bestaand wishlistitem aanpassen.
        await wishlistApi.update(editingItem.id, input)
      } else {
        // POST: nieuw wishlistitem toevoegen.
        await wishlistApi.create(input)
      }

      // Haal de bijgewerkte gegevens opnieuw op.
      const [mine, community] = await Promise.all([
        wishlistApi.getMine(),
        wishlistApi.getAll(),
      ])

      setMyItems(mine.map(convertWishlistItem))
      setCommunityItems(community.map(convertWishlistItem))
      setMyError('')
      setLoadError('')

      // Sluit de modal na succesvol opslaan.
      setModalOpen(false)
      setEditingItem(null)
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Could not save wishlist item.'
      )
    } finally {
      setSaving(false)
    }
  }

  const currentLoading =
    tab === 'community' ? loading : myLoading

  const currentError =
    tab === 'community' ? loadError : myError

  return (
    <section
      className="wishlist-page"
      aria-labelledby="page-title"
    >
      {/* Header */}
      <header className="wishlist-page-header">
        <p className="eyebrow">GameShelf Community</p>
        <h1 id="page-title">Wishlists</h1>
        <p className="text-muted">
          Discover games other members want and manage your own wishlist.
        </p>
      </header>

      {/* Tabbladen */}
      <div
        className="wishlist-tabs"
        role="group"
        aria-label="Wishlist views"
      >
        <button
          type="button"
          className={`button ${
            tab === 'community'
              ? 'button--primary'
              : 'button--secondary'
          }`}
          aria-pressed={tab === 'community'}
          onClick={() => changeTab('community')}
        >
          Community Wishlists
        </button>

        <button
          type="button"
          className={`button ${
            tab === 'mine'
              ? 'button--primary'
              : 'button--secondary'
          }`}
          aria-pressed={tab === 'mine'}
          onClick={() => changeTab('mine')}
        >
          My Wishlist
        </button>

        <a
          href="/trade-offers"
          className="button button--secondary"
        >
          My Trade Offers
        </a>
      </div>

      {/* Titel en beschrijving */}
      <div className="wishlist-section-heading">
        <div>
          <h2>
            {tab === 'community'
              ? "Members' Wishes"
              : 'My Wishlist'}
          </h2>

          <p className="text-muted">
            {tab === 'community'
              ? 'Public wishlist items from GameShelf members.'
              : 'Manage the board games you would like to have.'}
          </p>
        </div>

        {/* Alleen eigen wishlistitems kunnen worden toegevoegd. */}
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

      {/* Filters */}
      <div className="card wishlist-filters">
        <label className="form-field">
          <span className="form-label">
            Search games or members
          </span>

          <input
            type="search"
            className="form-control"
            placeholder="Search wishlists..."
            // value koppelt het invoerveld aan de search-state.
            value={search}
            // Bij iedere wijziging wordt de nieuwe zoekterm opgeslagen.
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

      {/* Aantal resultaten */}
      <p className="wishlist-count text-muted">
        {currentLoading
          ? 'Loading...'
          : `${filteredItems.length} wishlist item(s) found`}
      </p>

      {/* Wishlist-resultaten */}
      {currentLoading ? (
        <p className="text-muted">
          Loading wishlists...
        </p>
      ) : currentError ? (
        <p role="alert">
          Could not load wishlists: {currentError}
        </p>
      ) : filteredItems.length > 0 ? (
        <ul className="wishlist-grid" role="list">
          {filteredItems.map((item) => (
            <li
              className="card wishlist-card"
              key={item.id}
            >
              {/* Emoji */}
              <div
                className="wishlist-card-cover"
                aria-hidden="true"
              >
                {item.emoji}
              </div>

              {/* Titel en eigenaar */}
              <div className="card__header">
                <p className="eyebrow">
                  Wishlist by {item.memberName}
                </p>
                <h3>{item.gameTitle}</h3>
              </div>

              {/* Prioriteit, status en notitie */}
              <div className="card__body wishlist-card-body">
                {/* Toon de prioriteit en of het item open of vervuld is. */}
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

              {/* Actieknoppen */}
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

      {/* Modal voor toevoegen en bewerken */}
      {modalOpen && (
        <WishlistItemModal
          item={editingItem}
          games={games}
          gamesLoading={gamesLoading}
          gamesError={gamesError}
          saving={saving}
          saveError={saveError}
          onClose={closeModal}
          onSave={saveItem}
        />
      )}
    </section>
  )
}