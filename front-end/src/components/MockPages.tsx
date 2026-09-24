import { useMemo, useState } from 'react'
import type { Member } from '../api.ts'
import type { PageId } from './AppShellTypes.ts'
import { PlayersIcon, ClockIcon, PlusIcon, DotsIcon, SwapIcon, LockIcon } from './icons.tsx'
import './mockup.css'

const COVER = (name: string) => `/mockup/${name}.svg`

/* ============================================================
   Collections — My collection
   ============================================================ */

type OwnedGame = {
  name: string
  cover: string
  players: string
  time: string
  status: 'Played' | 'Unplayed' | 'In progress'
  rating: number | null
  plays: number | null
}

const ownedGames: OwnedGame[] = [
  { name: 'Cascadia', cover: 'cascadia', players: '1–4 players', time: '30–45 min', status: 'Played', rating: 4, plays: 8 },
  { name: 'Azul', cover: 'azul', players: '2–4 players', time: '30–45 min', status: 'Unplayed', rating: null, plays: null },
  { name: 'Wingspan', cover: 'wingspan', players: '1–5 players', time: '40–70 min', status: 'In progress', rating: null, plays: null },
]

function Stars({ rating }: { rating: number }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}<span className="stars-empty">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}

function GameCard({ game }: { game: OwnedGame }) {
  return (
    <article className="panel game-card" style={{ overflow: 'hidden' }}>
      <div className="cover-stage" style={{ position: 'relative' }}>
        <img src={COVER(game.cover)} alt={`Illustrative cover of ${game.name}`} className="game-cover" width={250} height={340} />
        <div style={{ position: 'absolute', right: '0.75rem', top: '0.75rem' }}>
          {game.status === 'Played' && <span className="badge badge-teal">Played</span>}
          {game.status === 'Unplayed' && <span className="badge badge-mist">Unplayed</span>}
          {game.status === 'In progress' && <span className="badge badge-yellow">In progress</span>}
        </div>
      </div>
      <div style={{ padding: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: 0 }}>{game.name}</h2>
          <button className="mp-dots" aria-label={`Details of ${game.name}`}><DotsIcon className="" /></button>
        </div>
        <div className="meta-row">
          <span><PlayersIcon className="size-4" />{game.players}</span>
          <span><ClockIcon className="size-4" />{game.time}</span>
        </div>
        <div className="divider" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
          {game.rating ? (
            <Stars rating={game.rating} />
          ) : (
            <span style={{ fontSize: 'var(--font-size-xs)', color: '#94a3b8' }}>Rating after first play</span>
          )}
          <span style={{ fontSize: 'var(--font-size-xs)', color: '#64748b' }}>
            {game.plays ? `${game.plays} plays` : 'Not played yet'}
          </span>
        </div>
      </div>
    </article>
  )
}

function CollectionsPage() {
  const [tab, setTab] = useState<'games' | 'shelves'>('games')
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState<'recent' | 'name'>('recent')

  const filtered = useMemo(() => {
    let list = ownedGames.filter((g) => filter === 'All' || g.status === filter)
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [filter, sort])

  const filters = [
    { label: 'All games', value: 'All', count: 3 },
    { label: 'Unplayed', value: 'Unplayed', count: 1 },
    { label: 'In progress', value: 'In progress', count: 1 },
    { label: 'Played', value: 'Played', count: 1 },
  ]

  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">YOUR CLUB, YOUR GAME</p>
          <h1 className="page-head__title">My collection</h1>
          <p className="page-head__subtitle">A place for your games, favourites and new discoveries.</p>
        </div>
        <button className="btn-primary"><PlusIcon className="size-4" />Add a game</button>
      </div>

      <div className="tab-bar">
        <button className={`tab ${tab === 'games' ? 'active' : ''}`} onClick={() => setTab('games')}>All games</button>
        <button className={`tab ${tab === 'shelves' ? 'active' : ''}`} onClick={() => setTab('shelves')}>My shelves</button>
      </div>

      {tab === 'games' ? (
        <>
          <div className="filter-chips" style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {filters.map((f) => (
                <button
                  key={f.value}
                  className={`filter-chip ${filter === f.value ? 'active' : ''}`}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label} <span>{f.count}</span>
                </button>
              ))}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: '#64748b' }}>
              Sort by
              <select className="field" value={sort} onChange={(e) => setSort(e.target.value as 'recent' | 'name')}>
                <option value="recent">Recently added</option>
                <option value="name">Name A–Z</option>
              </select>
            </label>
          </div>

          {filtered.length === 0 ? (
            <p className="panel" style={{ padding: 'var(--space-7)', textAlign: 'center', color: '#64748b' }}>
              No games found. Try a different search or filter.
            </p>
          ) : (
            <div className="grid-3">
              {filtered.map((g) => <GameCard key={g.name} game={g} />)}
            </div>
          )}
        </>
      ) : (
        <ShelvesTab />
      )}
    </section>
  )
}

function ShelvesTab() {
  return (
    <div style={{ marginTop: 'var(--space-7)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: 0 }}>
          My shelves <span style={{ marginLeft: 'var(--space-2)', fontSize: 'var(--font-size-sm)', fontWeight: 400, color: '#94a3b8' }}>02</span>
        </h2>
        <button className="btn-secondary" style={{ background: 'none', border: 0, color: 'var(--color-info)' }}>
          <PlusIcon className="size-4" />Create shelf
        </button>
      </div>
      <div className="grid-2">
        <article className="panel" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 600, margin: 0 }}>
              <span style={{ color: 'var(--color-highlight)' }}>♥</span> Favourites
            </h3>
            <span className="badge badge-teal">Public</span>
          </div>
          <div style={{ marginTop: 'var(--space-5)', display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)' }}>
            <img src={COVER('cascadia')} alt="Illustrative cover of Cascadia" className="shelf-cover" width={250} height={340} />
            <img src={COVER('wingspan')} alt="Illustrative cover of Wingspan" className="shelf-cover" width={250} height={340} />
            <p style={{ marginLeft: 'auto', fontSize: 'var(--font-size-xs)', color: '#94a3b8' }}>2 games</p>
          </div>
        </article>
        <article className="panel" style={{ padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontWeight: 600, margin: 0 }}>
              <LockIcon className="size-4" /> To discover
            </h3>
            <span className="badge badge-mist">Private</span>
          </div>
          <div style={{ marginTop: 'var(--space-5)', display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)' }}>
            <img src={COVER('azul')} alt="Illustrative cover of Azul" className="shelf-cover" width={250} height={340} />
            <div className="shelf-cover" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-surface)', color: '#94a3b8' }}>
              <PlusIcon className="size-4" />
            </div>
            <p style={{ marginLeft: 'auto', fontSize: 'var(--font-size-xs)', color: '#94a3b8' }}>1 game</p>
          </div>
        </article>
      </div>
    </div>
  )
}

/* ============================================================
   Catalogue — Club game catalogue
   ============================================================ */

type CatalogueGame = {
  name: string
  cover: string
  publisher: string
  year: number
  players: string
  time: string
  category: string
}

const catalogueGames: CatalogueGame[] = [
  { name: 'Cascadia', cover: 'cascadia', publisher: 'Flatout Games', year: 2021, players: '1–4 players', time: '30–45 min', category: 'Strategy' },
  { name: 'Azul', cover: 'azul', publisher: 'Next Move Games', year: 2017, players: '2–4 players', time: '30–45 min', category: 'Abstract' },
  { name: 'Wingspan', cover: 'wingspan', publisher: 'Stonemaier Games', year: 2019, players: '1–5 players', time: '40–70 min', category: 'Strategy' },
]

function CataloguePage() {
  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">YOUR CLUB, YOUR GAME</p>
          <h1 className="page-head__title">Game catalogue</h1>
          <p className="page-head__subtitle">Discover the club's games. Every edition has its own entry.</p>
        </div>
        <button className="btn-primary"><PlusIcon className="size-4" />Browse games</button>
      </div>

      <div className="grid-3">
        {catalogueGames.map((g) => (
          <article key={g.name} className="panel" style={{ overflow: 'hidden' }}>
            <div className="cover-stage">
              <img src={COVER(g.cover)} alt={`Illustrative cover of ${g.name}`} className="game-cover" width={250} height={340} />
            </div>
            <div style={{ padding: 'var(--space-5)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: 0 }}>{g.name}</h2>
              <p style={{ margin: 'var(--space-1) 0 var(--space-3)', fontSize: 'var(--font-size-xs)', color: '#64748b' }}>
                {g.publisher} · {g.year} · Dutch edition
              </p>
              <div className="meta-row">
                <span><PlayersIcon className="size-4" />{g.players}</span>
                <span><ClockIcon className="size-4" />{g.time}</span>
              </div>
              <div className="divider" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="badge badge-teal">{g.category}</span>
                <button className="btn-secondary">Details</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ============================================================
   Lending — Borrow and return
   ============================================================ */

type Box = {
  name: string
  cover: string
  condition: 'Like new' | 'Good'
  owner: string
  players: string
  time: string
}

const boxes: Box[] = [
  { name: 'Catan', cover: 'catan', condition: 'Like new', owner: 'Sanne', players: '3–4 players', time: '60–90 min' },
  { name: 'Carcassonne', cover: 'carcassonne', condition: 'Good', owner: 'Mark', players: '2–5 players', time: '30–45 min' },
  { name: 'Splendor', cover: 'splendor', condition: 'Like new', owner: 'Lisa', players: '2–4 players', time: '30 min' },
  { name: 'Wingspan', cover: 'wingspan', condition: 'Good', owner: 'Tom', players: '1–5 players', time: '40–70 min' },
]

function LendingPage() {
  const [tab, setTab] = useState<'boxes' | 'loans'>('boxes')
  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">YOUR CLUB, YOUR GAME</p>
          <h1 className="page-head__title">Lending</h1>
          <p className="page-head__subtitle">Share your games. Discover something new.</p>
        </div>
        <button className="btn-primary"><PlusIcon className="size-4" />Offer a box</button>
      </div>

      <div className="tab-bar">
        <button className={`tab ${tab === 'boxes' ? 'active' : ''}`} onClick={() => setTab('boxes')}>Available boxes</button>
        <button className={`tab ${tab === 'loans' ? 'active' : ''}`} onClick={() => setTab('loans')}>My loans</button>
      </div>

      {tab === 'boxes' ? (
        <div className="grid-4">
          {boxes.map((b) => (
            <article key={b.name} className="panel" style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-4)', borderRadius: 'var(--radius-sm)', background: 'var(--color-background)', padding: 'var(--space-5) 0' }}>
                <img src={COVER(b.cover)} alt={`Illustrative cover of ${b.name}`} style={{ height: '10rem', width: 'auto', borderRadius: 'var(--radius-sm)', boxShadow: '0 10px 15px rgb(23 32 51 / 0.1)' }} width={250} height={340} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontWeight: 700, margin: 0 }}>{b.name}</h2>
                <span className={`badge ${b.condition === 'Like new' ? 'badge-teal' : 'badge-mist'}`}>{b.condition}</span>
              </div>
              <div style={{ margin: 'var(--space-3) 0', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: '#64748b' }}>
                <span className="avatar" title={b.owner}>{b.owner[0]}</span> From {b.owner}
              </div>
              <div className="meta-row">
                <span><PlayersIcon className="size-4" />{b.players}</span>
                <span><ClockIcon className="size-4" />{b.time}</span>
              </div>
              <div style={{ marginTop: 'var(--space-5)' }}>
                <button className="btn-primary" style={{ width: '100%' }}>Request loan</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 0 }}>
          <h2 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-xl)', fontWeight: 700, margin: '0 0 var(--space-4)' }}>My loans</h2>
          <div className="panel" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-5)' }}>
            <img src={COVER('ticket-to-ride')} alt="Illustrative cover of Ticket to Ride" style={{ height: '5rem', width: 'auto', borderRadius: 'var(--radius-sm)' }} width={250} height={340} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 700, margin: 0 }}>Ticket to Ride</h3>
              <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--font-size-xs)', color: '#64748b' }}>Borrowed from Mark · Started on 10 Sep</p>
            </div>
            <div style={{ borderRadius: 'var(--radius-sm)', background: 'rgb(229 233 248 / 0.5)', padding: 'var(--space-3) var(--space-5)', textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)' }}>
              Return by<strong style={{ display: 'block', marginTop: 'var(--space-1)', fontSize: 'var(--font-size-sm)' }}>24 Sep 2026</strong>
            </div>
            <button className="btn-secondary">View details</button>
          </div>
          <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-4)', borderRadius: 'var(--radius-lg)', border: '1px solid rgb(180 35 77 / 0.15)', background: 'rgb(180 35 77 / 0.05)', padding: 'var(--space-5)' }}>
            <img src={COVER('codenames')} alt="Illustrative cover of Codenames" style={{ height: '5rem', width: 'auto', borderRadius: 'var(--radius-sm)' }} width={250} height={340} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontWeight: 700, margin: 0 }}>Codenames</h3>
              <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--font-size-xs)', color: '#64748b' }}>Lent to Lisa</p>
            </div>
            <div style={{ textAlign: 'right', fontSize: 'var(--font-size-xs)', color: 'var(--color-danger)' }}>
              <strong style={{ display: 'block', fontSize: 'var(--font-size-sm)' }}>Overdue</strong>
              <span>Expected return: 12 Sep</span>
            </div>
            <button className="btn-secondary">Register return</button>
          </div>
        </div>
      )}
    </section>
  )
}

/* ============================================================
   Wishlists — Wishlists & trades
   ============================================================ */

type Wish = {
  name: string
  cover: string
  priority: 'High' | 'Medium'
  note: string
  owner: string
}

const memberWishes: Wish[] = [
  { name: 'Dune: Imperium', cover: 'dune-imperium', priority: 'High', note: 'Dutch edition · Preferably complete', owner: 'Sanne' },
  { name: 'The Crew', cover: 'the-crew', priority: 'Medium', note: 'Looking for a cooperative game', owner: 'Mark' },
]

function WishlistsPage() {
  const [tab, setTab] = useState<'all' | 'received' | 'sent'>('all')
  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">YOUR CLUB, YOUR GAME</p>
          <h1 className="page-head__title">Wishlists &amp; trades</h1>
          <p className="page-head__subtitle">Find your next favourite by trading games with each other.</p>
        </div>
        <button className="btn-primary"><PlusIcon className="size-4" />Add a wish</button>
      </div>

      <div className="tab-bar">
        <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All wishlists</button>
        <button className={`tab ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>Received</button>
        <button className={`tab ${tab === 'sent' ? 'active' : ''}`} onClick={() => setTab('sent')}>Sent</button>
      </div>

      {tab === 'all' && (
        <div className="wishlist-cols">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, margin: 0 }}>Members' wishes</h2>
              <span style={{ fontSize: 'var(--font-size-xs)', color: '#94a3b8' }}>2 wishes</span>
            </div>
            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
              {memberWishes.map((w) => (
                <article key={w.name} className="panel" style={{ display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-5)' }}>
                  <img src={COVER(w.cover)} alt={`Illustrative cover of ${w.name}`} style={{ height: '7rem', width: 'auto', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)' }} width={250} height={340} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <h3 style={{ fontWeight: 700, margin: 0 }}>{w.name}</h3>
                      <span className={`badge ${w.priority === 'High' ? 'badge-coral' : 'badge-yellow'}`}>{w.priority}</span>
                    </div>
                    <p style={{ margin: 'var(--space-2) 0 0', fontSize: 'var(--font-size-xs)', color: '#64748b' }}>{w.note}</p>
                    <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: '#64748b' }}>
                      <span className="avatar" title={w.owner}>{w.owner[0]}</span> {w.owner}
                    </div>
                    <div style={{ marginTop: 'var(--space-3)' }}>
                      <button className="btn-secondary"><SwapIcon className="size-4" />Propose trade</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <h2 style={{ margin: 'var(--space-7) 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>My wishlist</h2>
            <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-5)' }}>
              <img src={COVER('cascadia')} alt="Illustrative cover of Cascadia" style={{ height: '5rem', width: 'auto', borderRadius: 'var(--radius-sm)' }} width={250} height={340} />
              <div style={{ flex: 1 }}>
                <h3 style={{ fontWeight: 700, margin: 0 }}>Cascadia</h3>
                <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--font-size-xs)', color: '#64748b' }}>Fulfilled on 12 Sep 2026</p>
              </div>
              <span className="badge badge-teal">Fulfilled</span>
            </div>
          </div>

          <div>
            <h2 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Received trade offer</h2>
            <article className="panel" style={{ padding: 'var(--space-5)' }}>
              <div style={{ marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-5)', borderRadius: 'var(--radius-sm)', background: 'var(--color-background)', padding: 'var(--space-5)' }}>
                <div style={{ textAlign: 'center' }}>
                  <img src={COVER('azul')} alt="Illustrative cover of Azul" style={{ margin: '0 auto', height: '7rem', width: 'auto', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)' }} width={250} height={340} />
                  <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>Azul</p>
                </div>
                <span style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-xl)' }}>↔</span>
                <div style={{ textAlign: 'center' }}>
                  <img src={COVER('the-crew')} alt="Illustrative cover of The Crew" style={{ margin: '0 auto', height: '7rem', width: 'auto', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)' }} width={250} height={340} />
                  <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>The Crew</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                <span className="avatar" title="Sanne">S</span>
                <span>Trade offer from <strong>Sanne</strong></span>
              </div>
              <p style={{ margin: 'var(--space-3) 0', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: '#64748b' }}>
                <ClockIcon className="size-4" />Valid until 28 Sep 2026
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn-primary">Accept</button>
                <button className="btn-secondary">Decline</button>
              </div>
            </article>

            <h2 style={{ margin: 'var(--space-7) 0 var(--space-4)', fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Sent offers</h2>
            <div className="panel" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-5)' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, margin: 0 }}>Catan ↔ Wingspan</h3>
                <p style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--font-size-xs)', color: '#64748b' }}>For Tom · Valid until 15 Sep</p>
              </div>
              <span className="badge badge-rule">Expired</span>
            </div>
            <div className="note-callout" style={{ marginTop: 'var(--space-5)' }}>
              <strong>A good trade makes two people happy.</strong>
              <p>Trade a game you play less for a new discovery.</p>
            </div>
          </div>
        </div>
      )}
      {tab !== 'all' && (
        <p className="panel" style={{ padding: 'var(--space-7)', textAlign: 'center', color: '#64748b' }}>
          {tab === 'received' ? 'No received trade offers right now.' : 'You have not sent any trade offers yet.'}
        </p>
      )}
    </section>
  )
}

/* ============================================================
   Profile
   ============================================================ */

function ProfilePage({ member }: { member: Member }) {
  const initials = member.name.slice(0, 1).toUpperCase()
  return (
    <section>
      <div className="page-head">
        <div>
          <p className="eyebrow">YOUR CLUB, YOUR GAME</p>
          <h1 className="page-head__title">Profile</h1>
          <p className="page-head__subtitle">Your details, preferences and activity in the club.</p>
        </div>
      </div>

      <div className="profile-header" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, #eef0ff, #e7f5f8)', border: '1px solid var(--color-surface)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '4.5rem', height: '4.5rem', borderRadius: '9999px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-info))', color: '#fff', fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{initials}</span>
        <div>
          <h2 style={{ margin: 0 }}>{member.name}</h2>
          <p style={{ margin: 0, color: '#64748b' }}>
            @{member.name.toLowerCase().replace(/\s+/g, '')} · {member.isCommittee ? 'Committee member' : 'Club member'}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(9rem, 1fr))', marginTop: 'var(--space-5)' }}>
        {[
          { v: '3', l: 'Games owned' },
          { v: '4', l: 'Sessions hosted' },
          { v: '11', l: 'Sessions joined' },
          { v: '2', l: 'Games on loan' },
        ].map((s) => (
          <div key={s.l} style={{ padding: 'var(--space-4)', border: '1px solid var(--color-surface)', borderRadius: 'var(--radius-md)', background: '#fff', boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-primary)' }}>{s.v}</span>
            <span style={{ display: 'block', marginTop: 'var(--space-2)', fontSize: '0.625rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</span>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 'var(--space-5)' }}>
        <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-surface)' }}>
          <h3 style={{ margin: 0 }}>Settings</h3>
        </div>
        <form style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={(e) => e.preventDefault()}>
          <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Display name</span>
            <input className="field" defaultValue={member.name} />
          </label>
          <label style={{ display: 'grid', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Email</span>
            <input className="field" type="email" placeholder="you@example.com" />
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </section>
  )
}

/* ============================================================
   Router
   ============================================================ */

export function MockPage({ page, member }: { page: PageId; member: Member }) {
  switch (page) {
    case 'collections':
      return <CollectionsPage />
    case 'catalogue':
      return <CataloguePage />
    case 'lending':
      return <LendingPage />
    case 'wishlists':
      return <WishlistsPage />
    case 'profile':
      return <ProfilePage member={member} />
    default:
      return <CollectionsPage />
  }
}