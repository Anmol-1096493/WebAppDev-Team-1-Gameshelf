import type { Signup } from '../../types/Session'

// Eén bevestigde deelnemer met het optionele spel en de spelerswaarschuwing.
export function SignupRow({ signup }: { signup: Signup }) {
  return (
    <li className="signup-row">
      <span className="signup-row__name">{signup.memberName}</span>
      {signup.broughtGame && (
        <span className="signup-row__game text-muted">brings {signup.broughtGame.title}</span>
      )}
      {signup.broughtGame &&
        (signup.gameFits ? (
          <span className="badge badge--info">game fits</span>
        ) : (
          <span className="badge badge--highlight">
            needs {signup.broughtGame.minPlayers} players
          </span>
        ))}
    </li>
  )
}

