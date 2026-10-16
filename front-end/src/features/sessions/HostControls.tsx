import { useState } from 'react'
import type { Member } from '../../types/Member'
import type { SessionDetail } from '../../types/Session'
import { CONFIRMED, localDateFields } from './sessionUtils'

// Beheerformulier voor sessiegegevens, overdracht van het hostschap en annuleren.
export function HostControls({
  detail,
  members,
  onUpdated,
  onTransfer,
  onCancel,
}: {
  detail: SessionDetail
  members: Member[]
  onUpdated: (input: { title?: string; startAt?: string; place?: string; capacity?: number }) => boolean
  onTransfer: (newHostId: string) => void
  onCancel: () => void
}) {
  // Houdt de formulierwaarden bij totdat de host ze opslaat.
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(detail.title)
  const [date, setDate] = useState(localDateFields(detail.startAt).date)
  const [time, setTime] = useState(localDateFields(detail.startAt).time)
  const [place, setPlace] = useState(detail.place)
  const [capacity, setCapacity] = useState(detail.capacity)
  const [transferTarget, setTransferTarget] = useState('')

  // Alleen bevestigde deelnemers buiten de huidige host zijn overdrachtskandidaten.
  const confirmedMembers = detail.signups.filter(
    (s) => s.status === CONFIRMED && s.memberId !== detail.hostId,
  )

  return (
    <div className="card">
      <div className="card__header">
        <h3>Host controls</h3>
      </div>
      <div className="card__body stack">
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              // Zet de ingevoerde datum en tijd om en geeft de wijzigingen door aan de pagina.
              const startAt = new Date(`${date}T${time}:00`).toISOString()
              const saved = onUpdated({ title: title.trim(), startAt, place: place.trim(), capacity })
              if (saved) setEditing(false)
            }}
            className="stack"
          >
            <label className="form-field">
              <span className="form-label">Title</span>
              <input className="form-control" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <div className="cluster cluster--form">
              <label className="form-field">
                <span className="form-label">Date</span>
                <input
                  className="form-control"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label className="form-field">
                <span className="form-label">Time</span>
                <input
                  className="form-control"
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </label>
            </div>
            <div className="cluster cluster--form">
              <label className="form-field">
                <span className="form-label">Place</span>
                <input className="form-control" required value={place} onChange={(e) => setPlace(e.target.value)} />
              </label>
              <label className="form-field">
                <span className="form-label">Seats</span>
                <input
                  className="form-control"
                  type="number"
                  required
                  min={1}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                />
              </label>
            </div>
            <p className="form-help">
              Lowering the seats below the confirmed count sends the most recently confirmed
              signups back to the waiting list.
            </p>
            <div className="cluster">
              <button type="submit" className="button button--primary">
                Save changes
              </button>
              <button
                type="button"
                className="button"
                onClick={() => {
                  setEditing(false)
                  setTitle(detail.title)
                  setPlace(detail.place)
                  setCapacity(detail.capacity)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="cluster">
            <button type="button" className="button button--secondary" onClick={() => {
              setTitle(detail.title)
              setPlace(detail.place)
              setCapacity(detail.capacity)
              setDate(localDateFields(detail.startAt).date)
              setTime(localDateFields(detail.startAt).time)
              setEditing(true)
            }}>
              Edit session
            </button>
          </div>
        )}

        {confirmedMembers.length > 0 && (
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault()
              if (transferTarget) {
                // Geeft het gekozen lid door en wist daarna de selectie.
                onTransfer(transferTarget)
                setTransferTarget('')
              }
            }}
          >
            <label className="form-field">
              <span className="form-label">Hand hosting to a confirmed member</span>
              <select
                className="form-control"
                value={transferTarget}
                onChange={(e) => setTransferTarget(e.target.value)}
              >
                <option value="">Select a member…</option>
                {confirmedMembers.map((s) => {
                  const m = members.find((x) => x.id === s.memberId)
                  return (
                    <option key={s.memberId} value={s.memberId}>
                      {m?.name ?? s.memberName}
                    </option>
                  )
                })}
              </select>
            </label>
            <button type="submit" className="button" disabled={!transferTarget}>
              Transfer hosting
            </button>
          </form>
        )}
      </div>
      <div className="card__footer">
        <button type="button" className="button button--danger" onClick={onCancel}>
          Cancel session
        </button>
      </div>
    </div>
  )
}

