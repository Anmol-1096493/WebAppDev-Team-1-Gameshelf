import { useMemo, useState } from 'react'
import type { BoxCondition } from '../data/lendingBoxes'
import { lendingBoxes } from '../data/lendingBoxes'
import './LendingPages.css'

type AvailabilityFilter = 'all' | 'available' | 'unavailable'
type ConditionFilter = 'all' | BoxCondition

function LendingListPage() {
  const [query, setQuery] = useState('')
  const [availability, setAvailability] = useState<AvailabilityFilter>('all')
  const [condition, setCondition] = useState<ConditionFilter>('all')

  const filteredBoxes = useMemo(() => {
    const normalisedQuery = query.trim().toLowerCase()

    return lendingBoxes.filter((box) => {
      const matchesSearch =
        normalisedQuery.length === 0 ||
        box.game.toLowerCase().includes(normalisedQuery) ||
        box.owner.toLowerCase().includes(normalisedQuery)
      const matchesAvailability =
        availability === 'all' ||
        (availability === 'available' && box.available) ||
        (availability === 'unavailable' && !box.available)
      const matchesCondition = condition === 'all' || box.condition === condition

      return matchesSearch && matchesAvailability && matchesCondition
    })
  }, [availability, condition, query])

  const resetFilters = () => {
    setQuery('')
    setAvailability('all')
    setCondition('all')
  }

  return (
    <section aria-labelledby="lending-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Lending library</p>
          <h1 id="lending-title">Borrow a game</h1>
          <p className="text-muted">
            Discover physical boxes that club members are happy to lend.
          </p>
        </div>
        <button className="button button--primary" type="button">
          Offer a box
        </button>
      </div>

      <form className="lending-filters card" role="search" onSubmit={(event) => event.preventDefault()}>
        <div className="form-field lending-filters__search">
          <label className="form-label" htmlFor="box-search">Search boxes</label>
          <input
            className="form-control"
            id="box-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by game or owner"
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="availability-filter">Availability</label>
          <select
            className="form-control"
            id="availability-filter"
            value={availability}
            onChange={(event) => setAvailability(event.target.value as AvailabilityFilter)}
          >
            <option value="all">All boxes</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="condition-filter">Condition</label>
          <select
            className="form-control"
            id="condition-filter"
            value={condition}
            onChange={(event) => setCondition(event.target.value as ConditionFilter)}
          >
            <option value="all">All conditions</option>
            <option value="As new">As new</option>
            <option value="Good">Good</option>
            <option value="Used">Used</option>
            <option value="Worn">Worn</option>
          </select>
        </div>
      </form>

      <div className="results-heading">
        <h2>Physical boxes</h2>
        <p className="text-muted" aria-live="polite">
          {filteredBoxes.length} {filteredBoxes.length === 1 ? 'box' : 'boxes'} found
        </p>
      </div>

      {filteredBoxes.length > 0 ? (
        <div className="lending-grid">
          {filteredBoxes.map((box) => (
            <article className="lending-card card" key={box.id}>
              <a className="lending-card__cover-link" href={`/lending/boxes/${box.id}`}>
                <img className="lending-card__cover" src={box.cover} alt={`${box.game} box`} />
              </a>
              <div className="lending-card__body">
                <div className="lending-card__status-row">
                  <span className={`status status--${box.available ? 'available' : 'unavailable'}`}>
                    {box.available ? 'Available' : 'On loan'}
                  </span>
                  <span className="condition">{box.condition}</span>
                </div>
                <div>
                  <h3>
                    <a href={`/lending/boxes/${box.id}`}>{box.game}</a>
                  </h3>
                  <p className="text-muted lending-card__edition">{box.edition}</p>
                </div>
                <dl className="box-facts">
                  <div><dt>Owner</dt><dd>{box.owner}</dd></div>
                  <div><dt>Players</dt><dd>{box.players}</dd></div>
                  <div><dt>Time</dt><dd>{box.playingTime}</dd></div>
                </dl>
                <a className="button button--secondary" href={`/lending/boxes/${box.id}`}>
                  View box
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state card" role="status">
          <span className="empty-state__icon" aria-hidden="true">◇</span>
          <h2>No boxes found</h2>
          <p className="text-muted">
            No lending boxes match this search. Try a different game, owner or condition.
          </p>
          <button className="button button--secondary" type="button" onClick={resetFilters}>
            Clear filters
          </button>
        </div>
      )}
    </section>
  )
}

export default LendingListPage
