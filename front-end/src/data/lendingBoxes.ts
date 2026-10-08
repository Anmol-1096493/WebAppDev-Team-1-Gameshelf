import azulCover from '../assets/games/azul.svg'
import carcassonneCover from '../assets/games/carcassonne.svg'
import catanCover from '../assets/games/catan.svg'
import codenamesCover from '../assets/games/codenames.svg'
import splendorCover from '../assets/games/splendor.svg'
import ticketToRideCover from '../assets/games/ticket-to-ride.svg'

export type BoxCondition = 'As new' | 'Good' | 'Used' | 'Worn'

export type LendingBox = {
  id: string
  game: string
  edition: string
  condition: BoxCondition
  conditionDescription: string
  owner: string
  available: boolean
  players: string
  playingTime: string
  cover: string
}

export const lendingBoxes: LendingBox[] = [
  {
    id: 'catan-sanne',
    game: 'Catan',
    edition: 'English edition · 2015',
    condition: 'As new',
    conditionDescription:
      'Complete and carefully stored. The cards are sleeved and all pieces are sorted into bags.',
    owner: 'Sanne',
    available: true,
    players: '3–4 players',
    playingTime: '60–90 min',
    cover: catanCover,
  },
  {
    id: 'carcassonne-mark',
    game: 'Carcassonne',
    edition: 'Dutch edition · 2021',
    condition: 'Good',
    conditionDescription:
      'Complete. The box has light shelf wear, but the tiles and meeples are in excellent condition.',
    owner: 'Mark',
    available: true,
    players: '2–5 players',
    playingTime: '30–45 min',
    cover: carcassonneCover,
  },
  {
    id: 'splendor-lisa',
    game: 'Splendor',
    edition: 'Dutch edition · 2014',
    condition: 'As new',
    conditionDescription: 'Complete and barely played. Includes the original insert.',
    owner: 'Lisa',
    available: false,
    players: '2–4 players',
    playingTime: '30 min',
    cover: splendorCover,
  },
  {
    id: 'azul-tom',
    game: 'Azul',
    edition: 'Dutch edition · 2018',
    condition: 'Good',
    conditionDescription: 'Complete. A few tiles have small signs of use.',
    owner: 'Tom',
    available: true,
    players: '2–4 players',
    playingTime: '30–45 min',
    cover: azulCover,
  },
  {
    id: 'ticket-to-ride-jeffrey',
    game: 'Ticket to Ride',
    edition: 'Europe edition · 2005',
    condition: 'Used',
    conditionDescription:
      'Complete and well played. The box corners show wear and one score marker is a replacement.',
    owner: 'Jeffrey',
    available: false,
    players: '2–5 players',
    playingTime: '30–60 min',
    cover: ticketToRideCover,
  },
  {
    id: 'codenames-eva',
    game: 'Codenames',
    edition: 'Dutch edition · 2016',
    condition: 'Worn',
    conditionDescription:
      'Complete. Several cards and the outer box show wear after many club evenings.',
    owner: 'Eva',
    available: true,
    players: '2–8 players',
    playingTime: '15 min',
    cover: codenamesCover,
  },
]
