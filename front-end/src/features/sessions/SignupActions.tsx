import { useState } from 'react'
import type { Game } from '../../types/Game'
import type { SessionDetail } from '../../types/Session'
import { CONFIRMED } from './sessionUtils'

// Toont voor het huidige lid een aanmeldformulier of de mogelijkheid om zich af te melden.
export function SignupActions({
  detail,
  signedUp,
  games,
  onSignUp,
  onCancelSignup,
}: {
  detail: SessionDetail
  signedUp: boolean
  games: Game[]
  onSignUp: (gameId: string | null) => void
  onCancelSignup: () => void
}) {
  // Een lege spelkeuze wordt bij aanmelden als null doorgegeven.
  const [gameId, setGameId] = useState('')

  if (signedUp) {
    return (
      <div className="card">
        <div className="card__body">
          <p>
            You are{' '}
            {detail.currentMemberSignupStatus === CONFIRMED ? 'confirmed for this session' : 'on the waiting list'}.
          </p>
        </div>
        <div className="card__footer">
          <button type="button" className="button button--danger" onClick={onCancelSignup}>
            Cancel my signup
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      className="card"
      onSubmit={(e) => {
        e.preventDefault()
        onSignUp(gameId || null)
      }}
    >
      <div className="card__body stack">
        <h3>Sign up</h3>
        <label className="form-field">
          <span className="form-label">Game you bring (optional)</span>
          <select
            className="form-control"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          >
            <option value="">Just myself</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title} ({g.minPlayers}–{g.maxPlayers})
              </option>
            ))}
          </select>
        </label>
        <p className="form-help">
          {detail.confirmedSeats < detail.capacity
            ? 'A seat is free — you will be confirmed.'
            : 'Seats are full — you will join the waiting list.'}
        </p>
      </div>
      <div className="card__footer">
        <button type="submit" className="button button--primary">
          Sign up
        </button>
      </div>
    </form>
  )
}

