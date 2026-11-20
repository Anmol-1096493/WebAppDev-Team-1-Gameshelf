import { useEffect, useState, type FormEvent } from 'react'
import type { Game } from '../../api.ts'
import type { WishlistItem } from './WishlistPage.tsx'
import './WishlistItemModal.css'


// WishlistDraft beschrijft welke gegevens het formulier doorgeeft.
// Dit bevat alleen de velden die ingevuld of aangepast kunnen worden.
export type WishlistDraft = {
  gameId: string
  priority: WishlistItem['priority']
  notes: string
}

type EditableItem = Omit<WishlistItem, 'id'> & {
  id: string | number
}

type WishlistItemModalProps = {
  item?: EditableItem | null
  games: Game[]
  gamesLoading: boolean
  gamesError: string
  saving: boolean
  saveError: string
  onClose: () => void
  onSave: (draft: WishlistDraft) => void | Promise<void>
}

// Modal voor het toevoegen en bewerken van wishlistitems.
export default function WishlistItemModal({
  item,
  games,
  gamesLoading,
  gamesError,
  saving,
  saveError,
  onClose,
  onSave,
}: WishlistItemModalProps) {
  // Bepaal of de gebruiker een bestaand item bewerkt.
  const isEditing = Boolean(item)

  // Formuliergegevens.
  const [gameId, setGameId] = useState('')
  const [priority, setPriority] =
    useState<WishlistItem['priority']>(
      item?.priority ?? 'Medium'
    )
  const [notes, setNotes] = useState(item?.notes ?? '')
  const [error, setError] = useState('')

  // Zoek bij bewerken de echte game-GUID in de catalogus.
  useEffect(() => {
    if (item) {
      const selectedGame = games.find(
        (game) => game.title === item.gameTitle
      )

      setGameId(selectedGame?.id ?? '')
    }
  }, [item, games])

  // Sluit de modal met Escape, behalve tijdens opslaan.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !saving) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, saving])

  // Verwerk het formulier.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Controleer of een game geselecteerd is.
    if (!gameId) {
      setError('Please select a game from the catalogue.')
      return
    }

    // Controleer of de game bestaat in de catalogus.
    const selectedGame = games.find(
      (game) => game.id === gameId
    )

    if (!selectedGame) {
      setError('The selected game is not available.')
      return
    }

    // Wis eerdere foutmeldingen.
    setError('')

    // Geef de echte game-GUID en formuliergegevens door.
    void onSave({
      gameId,
      priority,
      notes: notes.trim(),
    })
  }

  return (
    <div className="wishlist-modal-overlay">
      {/* Dialoogvenster */}
      <section
        className="wishlist-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlist-modal-title"
      >
        {/* Header */}
        <header className="wishlist-modal-header">
          <div>
            <p className="eyebrow">My Wishlist</p>

            <h2 id="wishlist-modal-title">
              {isEditing
                ? 'Edit Wishlist Item'
                : 'Add Wishlist Item'}
            </h2>
          </div>

          <button
            type="button"
            className="wishlist-modal-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close form"
          >
            ×
          </button>
        </header>

        {/* Formulier */}
        <form
          className="wishlist-modal-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {/* Game selecteren */}
          <div className="wishlist-modal-field">
            <label htmlFor="wishlist-game">
              Game *
            </label>

            <select
              id="wishlist-game"
              className="form-control"
              value={gameId}
              disabled={
                gamesLoading ||
                Boolean(gamesError) ||
                saving
              }
              onChange={(event) => {
                setGameId(event.target.value)
                setError('')
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? 'wishlist-game-error' : undefined
              }
            >
              <option value="">
                {gamesLoading
                  ? 'Loading games...'
                  : 'Select a game'}
              </option>

              {/* games uit de backend */}
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </select>
          </div>

          {/* Prioriteit */}
          <div className="wishlist-modal-field">
            <label htmlFor="wishlist-priority">
              Priority *
            </label>

            <select
              id="wishlist-priority"
              className="form-control"
              value={priority}
              disabled={saving}
              onChange={(event) => {
                setPriority(
                  event.target.value as WishlistItem['priority']
                )
              }}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Notitie */}
          <div className="wishlist-modal-field">
            <label htmlFor="wishlist-note">Note (optional)</label>
            <textarea
              id="wishlist-note"
              className="form-control"
              rows={4}
              maxLength={500}
              placeholder="Edition, condition, preferences..."
              value={notes}
              disabled={saving}
              onChange={(event) => {
                setNotes(event.target.value)
              }}
            />

            <small>
              {notes.length}/500 characters
            </small>
          </div>

          {/* Validatie- en backendfouten */}
          {(error || saveError || gamesError) && (
            <p
              id="wishlist-game-error"
              className="wishlist-modal-error"
              role="alert"
            >
              ⚠ {error || saveError || gamesError}
            </p>
          )}

          {/* Knoppen */}
          <div className="wishlist-modal-actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="button button--primary"
              disabled={
                saving ||
                gamesLoading ||
                Boolean(gamesError)
              }
            >
              {saving
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Add to Wishlist'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}