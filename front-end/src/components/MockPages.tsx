import type { Member } from '../api.ts'
import type { PageId } from './AppShell.tsx'
import './MockPages.css'

/* ---------- Collections (your games) ---------- */

type OwnedGame = {
  title: string
  players: string
  status: 'available' | 'lent' | 'wanted'
  rating: number
  emoji: string
}

const ownedGames: OwnedGame[] = [
  { title: 'Cascadia', players: '2–4', status: 'available', rating: 4, emoji: '🌲' },
  { title: 'Wingspan', players: '2–5', status: 'available', rating: 5, emoji: '🪶' },
  { title: 'Azul', players: '2–4', status: 'lent', rating: 4, emoji: '🟦' },
  { title: 'Brass: Birmingham', players: '2–4', status: 'available', rating: 5, emoji: '🏭' },
  { title: 'Spirit Island', players: '1–4', status: 'available', rating: 5, emoji: '🏝️' },
  { title: 'Just One', players: '3–7', status: 'lent', rating: 4, emoji: '✋' },
]

function Stars({ rating }: { rating: number }) {
  return <span className="game-card__rating" aria-label={`${rating} out of 5`}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
}

export function CollectionsPage() {
  return (
    <section aria-labelledby="page-title">
      <p className="eyebrow">Your games</p>
      <h1 id="page-title">Collections</h1>
      <p className="text-muted">Manage your board games, shelves and play statistics.</p>

      <div className="cluster mock-toolbar">
        <button type="button" className="button button--primary">+ Add a game</button>
        <button type="button" className="button button--secondary">Filter</button>
      </div>

      <ul className="mock-grid" role="list">
        {ownedGames.map((g) => (
          <li key={g.title} className="card game-card">
            <div className="game-card__cover" aria-hidden="true">{g.emoji}</div>
            <div className="card__header">
              <p className="eyebrow">My collection</p>
              <h3 className="game-card__title">{g.title}</h3>
            </div>
            <div className="card__body">
              <p className="text-muted">{g.players} players</p>
              <div className="cluster cluster--tight">
                {g.status === 'available' && <span className="badge badge--available">Available</span>}
                {g.status === 'lent' && <span className="badge badge--highlight">On loan</span>}
                {g.status === 'wanted' && <span className="badge badge--info">Wanted</span>}
                <span className="badge badge--info">{g.players} players</span>
              </div>
            </div>
            <footer className="card__footer">
              <Stars rating={g.rating} />
              <button type="button" className="button button--secondary">View</button>
            </footer>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- Catalogue (club games) ---------- */

type CatalogueGame = {
  title: string
  players: string
  copies: number
  available: number
  emoji: string
}

const catalogueGames: CatalogueGame[] = [
  { title: 'Catan', players: '3–4', copies: 3, available: 2, emoji: '🏔️' },
  { title: 'Codenames', players: '2–8', copies: 4, available: 4, emoji: '🕵️' },
  { title: 'Ticket to Ride', players: '2–5', copies: 2, available: 1, emoji: '🚂' },
  { title: 'Dixit', players: '3–6', copies: 2, available: 0, emoji: '🐇' },
  { title: 'Avalon', players: '5–10', copies: 3, available: 3, emoji: '⚔️' },
  { title: 'Cascadia', players: '2–4', copies: 1, available: 1, emoji: '🌲' },
  { title: 'Wingspan', players: '2–5', copies: 1, available: 0, emoji: '🪶' },
  { title: 'Azul', players: '2–4', copies: 2, available: 1, emoji: '🟦' },
]

export function CataloguePage() {
  return (
    <section aria-labelledby="page-title">
      <p className="eyebrow">Club library</p>
      <h1 id="page-title">Catalogue</h1>
      <p className="text-muted">Every game the club owns, available for any member to borrow.</p>

      <div className="cluster mock-toolbar">
        <button type="button" className="button button--primary">+ Add to library</button>
        <button type="button" className="button button--secondary">Browse all</button>
      </div>

      <ul className="mock-grid" role="list">
        {catalogueGames.map((g) => (
          <li key={g.title} className="card game-card">
            <div className="game-card__cover" aria-hidden="true">{g.emoji}</div>
            <div className="card__header">
              <p className="eyebrow">Club copy</p>
              <h3 className="game-card__title">{g.title}</h3>
            </div>
            <div className="card__body">
              <p className="text-muted">{g.players} players · {g.copies} cop{g.copies === 1 ? 'y' : 'ies'}</p>
              <div className="cluster cluster--tight">
                {g.available > 0 ? (
                  <span className="badge badge--available">{g.available} available</span>
                ) : (
                  <span className="badge badge--highlight">All on loan</span>
                )}
                <span className="badge badge--info">{g.players} players</span>
              </div>
            </div>
            <footer className="card__footer">
              <span className="text-muted">{g.available}/{g.copies} in</span>
              <button type="button" className="button button--secondary" disabled={g.available === 0}>
                Borrow
              </button>
            </footer>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- Lending ---------- */

type Loan = {
  game: string
  borrower: string
  due: string
  status: 'due-soon' | 'on-loan' | 'returned'
}

const activeLoans: Loan[] = [
  { game: 'Azul', borrower: 'Anmol', due: 'Fri 26 Sep', status: 'due-soon' },
  { game: 'Wingspan', borrower: 'Sasha', due: 'Thu 2 Oct', status: 'on-loan' },
  { game: 'Just One', borrower: 'Priya', due: 'Mon 6 Oct', status: 'on-loan' },
]

const loanHistory: Loan[] = [
  { game: 'Catan', borrower: 'Liam', due: 'Returned 18 Sep', status: 'returned' },
  { game: 'Dixit', borrower: 'Anmol', due: 'Returned 10 Sep', status: 'returned' },
]

function LoanRow({ loan }: { loan: Loan }) {
  return (
    <li className="loan-row">
      <span className="loan-row__game">{loan.game}</span>
      <span className="loan-row__arrow">→</span>
      <span>{loan.borrower}</span>
      {loan.status === 'due-soon' && <span className="badge badge--highlight">Due soon</span>}
      {loan.status === 'on-loan' && <span className="badge badge--info">On loan</span>}
      {loan.status === 'returned' && <span className="badge badge--available">Returned</span>}
      <span className="loan-row__due">{loan.due}</span>
    </li>
  )
}

export function LendingPage() {
  return (
    <section aria-labelledby="page-title">
      <p className="eyebrow">Borrow and return</p>
      <h1 id="page-title">Lending</h1>
      <p className="text-muted">Track which club games are out and who has them.</p>

      <div className="stat-grid">
        <div className="stat-tile">
          <span className="stat-tile__value">3</span>
          <span className="stat-tile__label">Active loans</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__value">1</span>
          <span className="stat-tile__label">Due this week</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__value">12</span>
          <span className="stat-tile__label">Returned this year</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-5)' }}>
        <div className="card__header">
          <h3>Active loans</h3>
        </div>
        <div className="card__body">
          <ul className="loan-list" role="list">
            {activeLoans.map((l) => <LoanRow key={l.game} loan={l} />)}
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-4)' }}>
        <div className="card__header">
          <h3>History</h3>
        </div>
        <div className="card__body">
          <ul className="loan-list" role="list">
            {loanHistory.map((l) => <LoanRow key={l.game} loan={l} />)}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ---------- Wishlists ---------- */

type Wish = {
  title: string
  priority: 'high' | 'medium' | 'low'
  note: string
  emoji: string
}

const wishes: Wish[] = [
  { title: 'Ark Nova', priority: 'high', note: 'Heavy engine builder for the committee shelf.', emoji: '🦁' },
  { title: 'Spirit Island', priority: 'medium', note: 'Co-op we keep hearing about.', emoji: '🏝️' },
  { title: 'Terraforming Mars', priority: 'low', note: 'Maybe after the expansion drops.', emoji: '🪐' },
]

function WishlistPage() {
  return (
    <section aria-labelledby="page-title">
      <p className="eyebrow">Games you want</p>
      <h1 id="page-title">Wishlists</h1>
      <p className="text-muted">Keep a list of games you would love to see in the club library.</p>

      <form className="card wishlist-form" style={{ marginTop: 'var(--space-5)' }} onSubmit={(e) => e.preventDefault()}>
        <div className="card__body stack">
          <h3>Add a wish</h3>
          <label className="form-field">
            <span className="form-label">Game title</span>
            <input className="form-control" placeholder="Ark Nova" />
          </label>
          <div className="cluster cluster--form">
            <label className="form-field">
              <span className="form-label">Priority</span>
              <select className="form-control">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <label className="form-field">
              <span className="form-label">Note</span>
              <input className="form-control" placeholder="Why this one?" />
            </label>
          </div>
        </div>
        <div className="card__footer">
          <button type="submit" className="button button--primary">Add to wishlist</button>
        </div>
      </form>

      <ul className="mock-grid" role="list" style={{ marginTop: 'var(--space-4)' }}>
        {wishes.map((w) => (
          <li key={w.title} className="card game-card">
            <div className="game-card__cover" aria-hidden="true">{w.emoji}</div>
            <div className="card__header">
              <p className="eyebrow">Wishlist</p>
              <h3 className="game-card__title">{w.title}</h3>
            </div>
            <div className="card__body">
              <p className="text-muted">{w.note}</p>
              <div className="cluster cluster--tight">
                {w.priority === 'high' && <span className="badge badge--highlight">High priority</span>}
                {w.priority === 'medium' && <span className="badge badge--available">Medium</span>}
                {w.priority === 'low' && <span className="badge badge--info">Low priority</span>}
              </div>
            </div>
            <footer className="card__footer">
              <button type="button" className="button button--secondary">Find a copy</button>
            </footer>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- Profile ---------- */

function ProfilePage({ member }: { member: Member }) {
  const initials = member.name.slice(0, 1).toUpperCase()
  return (
    <section aria-labelledby="page-title">
      <p className="eyebrow">Your account</p>
      <h1 id="page-title">Profile</h1>
      <p className="text-muted">Your details, preferences and activity in the club.</p>

      <div className="profile-header" style={{ marginTop: 'var(--space-5)' }}>
        <span className="profile-avatar" aria-hidden="true">{initials}</span>
        <div>
          <h2 className="profile-name">{member.name}</h2>
          <p className="text-muted profile-role">
            @{member.name.toLowerCase().replace(/\s+/g, '')} · {member.isCommittee ? 'Committee member' : 'Club member'}
          </p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <span className="stat-tile__value">6</span>
          <span className="stat-tile__label">Games owned</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__value">4</span>
          <span className="stat-tile__label">Sessions hosted</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__value">11</span>
          <span className="stat-tile__label">Sessions joined</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__value">2</span>
          <span className="stat-tile__label">Games on loan</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-5)' }}>
        <div className="card__header">
          <h3>Settings</h3>
        </div>
        <form className="stack" onSubmit={(e) => e.preventDefault()}>
          <div className="card__body stack">
            <label className="form-field">
              <span className="form-label">Display name</span>
              <input className="form-control" defaultValue={member.name} />
            </label>
            <label className="form-field">
              <span className="form-label">Email</span>
              <input className="form-control" type="email" placeholder="you@example.com" />
            </label>
            <label className="form-field">
              <span className="form-label">Favourite genres</span>
              <select className="form-control" multiple>
                <option>Strategy</option>
                <option>Party</option>
                <option>Co-op</option>
                <option>Engine building</option>
              </select>
            </label>
          </div>
          <div className="card__footer">
            <button type="submit" className="button button--primary">Save changes</button>
          </div>
        </form>
      </div>
    </section>
  )
}

export function MockPage({ page, member }: { page: PageId; member: Member }) {
  switch (page) {
    case 'collections':
      return <CollectionsPage />
    case 'catalogue':
      return <CataloguePage />
    case 'lending':
      return <LendingPage />
    case 'wishlists':
      return <WishlistPage />
    case 'profile':
      return <ProfilePage member={member} />
    default:
      return <CollectionsPage />
  }
}