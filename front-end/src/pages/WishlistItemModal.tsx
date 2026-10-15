import { useEffect, useState, type FormEvent } from 'react'
import type { WishlistItem } from './WishlistPage'
import './WishlistItemModal.css'

export type WishlistDraft = {
  gameTitle: string
  priority: WishlistItem['priority']
  notes: string
}

type WishlistItemModalProps = {
  item?: WishlistItem | null
  onClose: () => void
  onSave: (draft: WishlistDraft) => void
}

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

export default function WishlistItemModal({
  item,
  onClose,
  onSave,
}: WishlistItemModalProps) {
  const isEditing = Boolean(item)

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

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!game) {
      setError('Please select a game from the catalogue.')
      return
    }

    onSave({
      gameTitle: game,
      priority,
      notes: notes.trim(),
    })
  }

  return (
    <div className="wishlist-modal-overlay">
      <section
        className="wishlist-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlist-modal-title"
      >
        <header className="wishlist-modal-header">
          <div>
            <p className="eyebrow">My Wishlist</p>
            <h2 id="wishlist-modal-title">
              {isEditing ? 'Edit Wishlist Item' : 'Add Wishlist Item'}
            </h2>
          </div>

          <button
            type="button"
            className="wishlist-modal-close"
            onClick={onClose}
            aria-label="Close form"
          >
            ×
          </button>
        </header>

        <form
          className="wishlist-modal-form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="wishlist-modal-field">
            <label htmlFor="wishlist-game">Game *</label>
            <select
              id="wishlist-game"
              className="form-control"
              value={game}
              onChange={(event) => {
                setGame(event.target.value)
                setError('')
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error ? 'wishlist-game-error' : undefined
              }
            >
              <option value="">Select a game</option>
              {item?.gameTitle &&
                !catalogueGames.includes(item.gameTitle) && (
                  <option value={item.gameTitle}>
                    {item.gameTitle}
                  </option>
                )}
              {catalogueGames.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </div>

          <div className="wishlist-modal-field">
            <label htmlFor="wishlist-priority">Priority *</label>
            <select
              id="wishlist-priority"
              className="form-control"
              value={priority}
              onChange={(event) =>
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
            <small>{notes.length}/500 characters</small>
          </div>

          {error && (
            <p
              id="wishlist-game-error"
              className="wishlist-modal-error"
              role="alert"
            >
              ⚠ {error}
            </p>
          )}

          <div className="wishlist-modal-actions">
            <button
              type="button"
              className="button button--secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="button button--primary">
              {isEditing ? 'Save Changes' : 'Add to Wishlist'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
