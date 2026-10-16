import { useState } from 'react'
import type { CreateSessionInput } from '../../types/Session'
import { Modal } from './Modal'

/* Formulier voor het aanmaken van een nieuwe sessie. */

export function CreateSessionModal({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void
  onSubmit: (input: CreateSessionInput) => void
}) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('19:00')
  const [place, setPlace] = useState('Club room')
  const [capacity, setCapacity] = useState(4)

  // Controleert verplichte velden en zet de lokale datum en tijd om naar een ISO-tijdstip.
  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !place.trim() || !date) return
    const startAt = new Date(`${date}T${time}:00`).toISOString()
    onSubmit({ title: title.trim(), startAt, place: place.trim(), capacity })
  }

  return (
    <Modal
      title="Host a session"
      eyebrow="New game night"
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" form="create-session-form" className="button button--primary">
            Create session
          </button>
        </>
      }
    >
      <form id="create-session-form" onSubmit={submit}>
        <fieldset className="session-form-fields stack">
          <label className="form-field">
            <span className="form-label">Title</span>
            <input
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Catan night"
              required
            />
          </label>
          <div className="cluster cluster--form">
            <label className="form-field">
              <span className="form-label">Date</span>
              <input
                className="form-control"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span className="form-label">Time</span>
              <input
                className="form-control"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="cluster cluster--form">
            <label className="form-field">
              <span className="form-label">Place</span>
              <input
                className="form-control"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Club room"
                required
              />
            </label>
            <label className="form-field">
              <span className="form-label">Seats</span>
              <input
                className="form-control"
                type="number"
                min={1}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
              />
            </label>
          </div>
        </fieldset>
      </form>
    </Modal>
  )
}

