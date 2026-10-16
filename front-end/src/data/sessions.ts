import type { Member } from '../types/Member'
import type { Game } from '../types/Game'
import type { SessionDetail } from '../types/Session'

// Vast voorbeeldlid voor het profiel en de interactieve schermvoorbeelden.
export const demoMember: Member = { id: 'jeffrey', name: 'Jeffrey', isCommittee: true }
export const sessionMembers: Member[] = [
  demoMember,
  { id: 'anmol', name: 'Anmol', isCommittee: false },
  { id: 'sasha', name: 'Sasha', isCommittee: false },
  { id: 'liam', name: 'Liam', isCommittee: false },
  { id: 'artur', name: 'Artur', isCommittee: false },
]

export const sessionGames: Game[] = [
  { id: 'catan', title: 'Catan', minPlayers: 3, maxPlayers: 4 },
  { id: 'codenames', title: 'Codenames', minPlayers: 4, maxPlayers: 8 },
  { id: 'ticket-to-ride', title: 'Ticket to Ride', minPlayers: 2, maxPlayers: 5 },
]

// De sessies beginnen bij elke paginaherlading met dezelfde voorbeeldgegevens.
export const exampleSessions: SessionDetail[] = [
  {
    id: 'catan-night', hostId: 'jeffrey', hostName: 'Jeffrey', title: 'Catan night',
    startAt: '2026-10-23T17:00:00Z', place: 'Club room', capacity: 4,
    isCancelled: false, confirmedSeats: 2,
    currentMemberSignedUp: false, currentMemberSignupStatus: null,
    signups: [
      { id: 'signup-1', memberId: 'anmol', memberName: 'Anmol', status: 0,
        createdAt: '2026-10-15T10:00:00Z', broughtGame: sessionGames[0], gameFits: false },
      { id: 'signup-2', memberId: 'sasha', memberName: 'Sasha', status: 0,
        createdAt: '2026-10-15T11:00:00Z', broughtGame: null, gameFits: true },
    ],
  },
  {
    id: 'ticket-to-ride', hostId: 'liam', hostName: 'Liam', title: 'Ticket to Ride evening',
    startAt: '2026-10-24T17:30:00Z', place: 'Student kitchen', capacity: 2,
    isCancelled: false, confirmedSeats: 2,
    currentMemberSignedUp: false, currentMemberSignupStatus: null,
    signups: [
      { id: 'signup-3', memberId: 'liam', memberName: 'Liam', status: 0,
        createdAt: '2026-10-14T10:00:00Z', broughtGame: sessionGames[2], gameFits: true },
      { id: 'signup-4', memberId: 'artur', memberName: 'Artur', status: 0,
        createdAt: '2026-10-14T11:00:00Z', broughtGame: null, gameFits: true },
      { id: 'signup-5', memberId: 'sasha', memberName: 'Sasha', status: 1,
        createdAt: '2026-10-14T12:00:00Z', broughtGame: null, gameFits: true },
    ],
  },
  {
    id: 'codenames', hostId: 'sasha', hostName: 'Sasha', title: 'Codenames afternoon',
    startAt: '2026-10-25T13:00:00Z', place: 'Club room', capacity: 8,
    isCancelled: true, confirmedSeats: 0,
    currentMemberSignedUp: false, currentMemberSignupStatus: null, signups: [],
  },
]
