import { useEffect, useState, type FormEvent } from 'react'
import type { WishlistItem } from './WishlistPage.tsx'
import './WishlistItemModal.css'


// WishlistDraft beschrijft welke gegevens het formulier doorgeeft.
// Dit bevat alleen de velden die ingevuld of aangepast kunnen worden.
export type WishlistDraft = {
  gameTitle: string
  priority: WishlistItem['priority']
  notes: string
}

type WishlistItemModalProps = {
  item?: WishlistItem | null // Het bestaande item, of null/undefined bij een nieuw item.
  onClose: () => void // Functie om de modal te sluiten.
  onSave: (draft: WishlistDraft) => void // Functie om de ingevulde gegevens door te geven.
}

// Lijst met bordspellen die in het keuzemenu geselecteerd kunnen worden.
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

// Deze component toont het formulier voor het toevoegen of bewerken van een wishlist-item.
export default function WishlistItemModal({
  item,
  onClose,
  onSave,
}: WishlistItemModalProps) {
  // Als er een bestaand item is, staat de modal in de bewerkmodus.
  const isEditing = Boolean(item)

  // Vul de beginwaarden in op basis van het bestaande item.
  const [game, setGame] = useState(item?.gameTitle ?? '')
  const [priority, setPriority] = useState<WishlistItem['priority']>(
    item?.priority ?? 'Medium'
  )
  const [notes, setNotes] = useState(item?.notes ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    // Cleanup: verwijder de event listener wanneer het effect wordt opgeruimd.
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Deze functie wordt uitgevoerd wanneer het formulier wordt verzonden.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Voorkom dat de browser de pagina opnieuw laadt bij het verzenden.
    event.preventDefault()

    // Controleer of er een spel is geselecteerd.
    if (!game) {
      setError('Please select a game from the catalogue.')
      return // Stop de functie als er geen spel is geselecteerd.
    }

    // Geef de ingevulde gegevens door aan de onSave-functie.
    onSave({
      gameTitle: game,
      priority,
      notes: notes.trim(),
    })
  }

  // JSX beschrijft de structuur van de modal en de inhoud van het formulier.
  return (
    <div className="wishlist-modal-overlay">

      {/* De section vormt het dialoogvenster van de modal. */}
      <section
        className="wishlist-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlist-modal-title"
      >
        {/* De titel verandert afhankelijk van toevoegen of bewerken. */}
        <header className="wishlist-modal-header">
          <div>
            <p className="eyebrow">My Wishlist</p>
            <h2 id="wishlist-modal-title">
              {isEditing ? 'Edit Wishlist Item' : 'Add Wishlist Item'}
            </h2>
          </div>

          {/* Deze knop sluit de modal via de meegegeven onClose-functie. */}
          <button
            type="button"
            className="wishlist-modal-close"
            onClick={onClose}
            aria-label="Close form"
          >
            ×
          </button>
        </header>

        {/* Het formulier roept handleSubmit aan wanneer het wordt verzonden.
            noValidate schakelt de standaard HTML-formuliervalidatie uit. */}
        <form
          className="wishlist-modal-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Keuzemenu voor de gametitel. */}
          <div className="wishlist-modal-field">
            <label htmlFor="wishlist-game">Game *</label>
            <select
              id="wishlist-game"
              className="form-control"
              value={game}
              // Bewaar de geselecteerde game en wis een oude foutmelding.
              onChange={(event) => {
                setGame(event.target.value)
                setError('')
              }}
              // Geef aan of er een fout is en koppel de eventuele foutmelding.
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? 'wishlist-game-error' : undefined
              }
            >
              <option value="">Select a game</option>
              {/* Als het bestaande spel niet in de catalogus staat,
                  wordt het toch als optie toegevoegd tijdens het bewerken. */}
              {item?.gameTitle &&
                !catalogueGames.includes(item.gameTitle) && (
                  <option value={item.gameTitle}>
                    {item.gameTitle}
                  </option>
                )}
              {/* map() maakt een option voor iedere game in de catalogus. */}
              {catalogueGames.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </div>
          {/* Keuzemenu voor de prioriteit van het wishlist-item. */}
          <div className="wishlist-modal-field">
            <label htmlFor="wishlist-priority">Priority *</label>
            <select
              id="wishlist-priority"
              className="form-control"
              value={priority}
              onChange={(event) =>
                // TypeScript krijgt hiermee het verwachte prioriteitstype.
                setPriority(
                  event.target.value as WishlistItem['priority']
                )
              }
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Optioneel tekstveld voor extra informatie over het spel. */}
          <div className="wishlist-modal-field">
            <label htmlFor="wishlist-note">Note (optional)</label>
            <textarea
              id="wishlist-note"
              className="form-control"
              rows={4}
              maxLength={500}
              placeholder="Edition, condition, preferences..."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
            {/* Toon hoeveel tekens er zijn ingevuld. */}
            <small>{notes.length}/500 characters</small>
          </div>
          {/* Toon de foutmelding alleen als error een waarde bevat. */}
          {error && (
            <p
              id="wishlist-game-error"
              className="wishlist-modal-error"
              role="alert"
            >
              ⚠ {error}
            </p>
          )}

          {/* Onderaan staan de knoppen om te annuleren of op te slaan. */}
          <div className="wishlist-modal-actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            {/* De tekst van de verzendknop hangt af van de modus. */}
            <button type="submit" className="button button--primary">
              {isEditing ? 'Save Changes' : 'Add to Wishlist'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}