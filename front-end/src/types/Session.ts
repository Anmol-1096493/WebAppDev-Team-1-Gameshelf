import type { Game } from '../api'

export type SignupStatus = 0 | 1 // 0 = Confirmed, 1 = Waiting

export type Signup = {
  id: string
  memberId: string
  memberName: string
  status: SignupStatus
  createdAt: string
  broughtGame: Game | null
  gameFits: boolean
}

export type SessionSummary = {
  id: string
  hostId: string
  hostName: string
  title: string
  startAt: string
  place: string
  capacity: number
  isCancelled: boolean
  confirmedSeats: number
  waitingCount: number
}

export type SessionDetail = {
  id: string
  hostId: string
  hostName: string
  title: string
  startAt: string
  place: string
  capacity: number
  isCancelled: boolean
  confirmedSeats: number
  currentMemberSignedUp: boolean
  currentMemberSignupStatus: SignupStatus | null
  signups: Signup[]
}

export type CreateSessionInput = {
  title: string
  startAt: string
  place: string
  capacity: number
}

export type UpdateSessionInput = {
  title?: string
  startAt?: string
  place?: string
  capacity?: number
}

