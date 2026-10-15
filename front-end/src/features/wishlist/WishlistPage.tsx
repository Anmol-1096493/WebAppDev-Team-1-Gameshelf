import { useState } from 'react'
// useState bewaart gegevens binnen de React-component.
import WishlistItemModal, {
  type WishlistDraft,
} from './WishlistItemModal.tsx'
import './WishlistPage.css'

// Dit bepaalt welke velden elk wishlist-item moet hebben.
export type WishlistItem = {
  id: number
  memberName: string
  gameTitle: string
  priority: 'High' | 'Medium' | 'Low'
  notes: string
  isFulfilled: boolean
  emoji: string
}

// Voorbeeldgegevens van de community-wishlists.
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
  Carcassonne: '🏰',
}

// Hoofdcomponent van de wishlist-pagina. Beheert tabbladen, filters en het toevoegen/bewerken.
export default function WishlistPage() {
// Het actieve tabblad: community of eigen wishlist. Standaard opent community.
  const [tab, setTab] = useState<'community' | 'mine'>('community')
  // myItems bevat de eigen wishlist-items.
  // Wijzigingen zijn niet permanent opgeslagen, na opnieuw laden begint deze state opnieuw.
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

  // State voor het zoekveld, de statusfilter en de prioriteitsfilter.
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null)
  // Bepaal welke lijst gebruikt wordt op basis van het geselecteerde tabblad.
  const items = tab === 'community' ? wishlistItems : myItems
  // filter() maakt een nieuwe lijst met alleen de items die aan de filters voldoen.
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

  // Open het formulier om een nieuw item toe te voegen.
  function openAdd() {
    setEditingItem(null)
    setModalOpen(true)
  }

  // Open het formulier om een bestaand item te bewerken.
  function openEdit(item: WishlistItem) {
    setEditingItem(item)
    setModalOpen(true)
  }

  // Sluit het formulier en wis het geselecteerde item.
  function closeModal() {
    setModalOpen(false)
    setEditingItem(null)
  }


  // bevat ingevulde formuliergegevens.
  // draft bevat de ingevulde gametitel, prioriteit en opmerkingen.
  function saveItem(draft: WishlistDraft) {

    // Als editingItem bestaat, wordt een bestaand item aangepast.
    if (editingItem) {
      setMyItems((current) =>
        // map() loopt door alle items en maakt een nieuwe array.
        current.map((item) =>
          // Vergelijk de ID's om het juiste item te vinden.
          item.id === editingItem.id
            ? {
                ...item, // Behoud de overige eigenschappen van het item.
                gameTitle: draft.gameTitle,
                priority: draft.priority,
                notes: draft.notes,
                emoji: gameEmojis[draft.gameTitle] ?? '🎲',
              }
            // Items met een andere ID blijven ongewijzigd.
            : item
        )
      )
    } else {
      // Als er geen bestaand item wordt bewerkt, wordt een nieuw item toegevoegd.
      setMyItems((current) => [
        ...current, // Behoud alle bestaande items.
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

    // Sluit het formulier nadat het item is toegevoegd of aangepast.
    closeModal()
  }

  // JSX beschrijft de HTML-achtige structuur van de React-interface.
  // Hier komen de gegevens, functies en interacties samen.
  return (
    <section className="wishlist-page" aria-labelledby="page-title">
      {/* De header bevat de naam en korte beschrijving van de pagina. */}
      <header className="wishlist-page-header">
        <p className="eyebrow">GameShelf Community</p>
        <h1 id="page-title">Wishlists</h1>
        <p className="text-muted">
          Discover games other members want and manage your own wishlist.
        </p>
      </header>

      {/* Met de tabbladen kan gewisseld worden tussen de twee wishlist-weergaven. */}
      <div className="wishlist-tabs" role="group" aria-label="Wishlist views">
        <button
          type="button"
          // De actieve tab krijgt de primary-styling.
          className={`button ${
            tab === 'community' ? 'button--primary' : 'button--secondary'
          }`}
          aria-pressed={tab === 'community'}
          // Bij een klik wordt changeTab aangeroepen.
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

        {/* Deze link verwijst naar de pagina met trade offers. */}
        <a href="/trade-offers" className="button button--secondary">
          My Trade Offers
        </a>
      </div>


      {/* De titel en beschrijving veranderen afhankelijk van het tabblad. */}
      <div className="wishlist-section-heading">
        <div>
          <h2>{tab === 'community' ? "Members' Wishes" : 'My Wishlist'}</h2>
          <p className="text-muted">
            {tab === 'community'
              ? 'Public wishlist items from GameShelf members.'
              : 'Manage the board games you would like to have.'}
          </p>
        </div>

        {/* De knop om items toe te voegen is alleen zichtbaar bij de eigen wishlist. */}
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


      {/* De filters bepalen welke wishlist-items worden weergegeven. */}
      <div className="card wishlist-filters">
        <label className="form-field">
          <span className="form-label">Search games or members</span>
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

      {/* Toon hoeveel items na het toepassen van de filters overblijven. */}
      <p className="wishlist-count text-muted">
        {filteredItems.length} wishlist item(s) found
      </p>

      {/* Als er resultaten zijn, worden de wishlist-kaarten weergegeven.
          Anders verschijnt er een melding dat er geen resultaten zijn. */}
      {filteredItems.length > 0 ? (
        <ul className="wishlist-grid" role="list">
          {/* map() maakt voor ieder gefilterd item een kaart.
              key={item.id} helpt React om items te herkennen bij wijzigingen. */}
          {filteredItems.map((item) => (
            <li className="card wishlist-card" key={item.id}>
              {/* Toon de emoji die bij de game hoort. */}
              <div className="wishlist-card-cover" aria-hidden="true">
                {item.emoji}
              </div>

              {/* Toon de naam van het lid en de gametitel. */}
              <div className="card__header">
                <p className="eyebrow">
                  Wishlist by {item.memberName}
                </p>
                <h3>{item.gameTitle}</h3>
              </div>

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

                {/* Toon de opmerking van het lid.
                    Als notes leeg is, verschijnt de standaardtekst. */}
                <div className="wishlist-card-note">
                  <strong>Member's note</strong>
                  <p className="text-muted">
                    {item.notes || 'No additional notes.'}
                  </p>
                </div>
              </div>

              <footer className="card__footer wishlist-card-footer">
                {/* Eigen items kunnen worden bewerkt.
                    Bij community-items wordt een link naar de details getoond. */}
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
        // Deze weergave verschijnt als er geen items aan de filters voldoen.
        <div className="card wishlist-empty">
          <h3>No wishlist items found</h3>
          <p className="text-muted">
            Try changing your filters or search criteria.
          </p>

          {/* Wis alle filters zodat alle items weer getoond kunnen worden. */}
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


      {/* De modal wordt alleen weergegeven wanneer modalOpen true is.
          Het geselecteerde item en de functies worden als props doorgegeven.
          onClose sluit de modal; onSave verwerkt de formuliergegevens. */}
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