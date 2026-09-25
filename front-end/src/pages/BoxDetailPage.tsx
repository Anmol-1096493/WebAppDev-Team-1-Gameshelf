import type { LendingBox } from '../data/lendingBoxes'
import './LendingPages.css'

type BoxDetailPageProps = {
  box: LendingBox
}

function BoxDetailPage({ box }: BoxDetailPageProps) {
  return (
    <section aria-labelledby="box-title">
      <a className="back-link" href="/lending">← Back to lending</a>

      <div className="box-detail">
        <div className="box-detail__visual card">
          <img src={box.cover} alt={`${box.game} box`} />
        </div>

        <div className="box-detail__content">
          <div className="cluster">
            <span className={`status status--${box.available ? 'available' : 'unavailable'}`}>
              {box.available ? 'Available now' : 'Currently on loan'}
            </span>
            <span className="condition">{box.condition}</span>
          </div>

          <div>
            <p className="eyebrow">Physical lending box</p>
            <h1 id="box-title">{box.game}</h1>
            <p className="text-muted">{box.edition}</p>
          </div>

          <section className="owner-card card" aria-labelledby="owner-title">
            <div className="owner-card__avatar" aria-hidden="true">
              {box.owner.charAt(0)}
            </div>
            <div>
              <p className="owner-card__label" id="owner-title">Box owner</p>
              <p className="owner-card__name">{box.owner}</p>
            </div>
          </section>

          <dl className="detail-facts card">
            <div><dt>Condition</dt><dd>{box.condition}</dd></div>
            <div><dt>Players</dt><dd>{box.players}</dd></div>
            <div><dt>Playing time</dt><dd>{box.playingTime}</dd></div>
          </dl>

          <section aria-labelledby="condition-title">
            <h2 id="condition-title">About this box</h2>
            <p>{box.conditionDescription}</p>
          </section>

          {box.available ? (
            <div className="request-panel card">
              <div>
                <h2>Want to borrow this box?</h2>
                <p className="text-muted">
                  Send a request to {box.owner}. The loan starts when the box is handed over.
                </p>
              </div>
              <button className="button button--primary" type="button">
                Request this box
              </button>
            </div>
          ) : (
            <div className="alert alert--info" role="status">
              This box cannot be requested while it is on an active loan.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default BoxDetailPage
