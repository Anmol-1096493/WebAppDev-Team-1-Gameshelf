import { useFetch } from "../../hooks/useFetch";
import type { CollectionGameDetail } from "../../types/CollectionGame";
import "./CollectionDetailPage.css";

type CollectionDetailPageProps = {
  gameId?: number | string;
};

// Detail page fetching single game specs and metadata
export function CollectionDetailPage({ gameId = 1 }: CollectionDetailPageProps) {
  // Use mock json file created in step 2
  const { data: game, loading, error } = useFetch<CollectionGameDetail, CollectionGameDetail>(
    `/data/game-detail-${gameId}.json`,
    (data) => data
  );

  if (loading) {
    return (
      <main className="collection-detail-page">
        <p className="text-muted">Loading game details…</p>
      </main>
    );
  }

  if (error || !game) {
    return (
      <main className="collection-detail-page">
        <a href="/collections" className="collection-detail-back-link">
          ← Back to My Collection
        </a>
        <p className="alert alert--error">{error ?? "Game not found."}</p>
      </main>
    );
  }

  return (
    <main className="collection-detail-page">
      <a href="/collections" className="collection-detail-back-link">
        ← Back to My Collection
      </a>

      <section className="collection-detail-card">
        <div className="collection-detail-image-wrapper">
          <img
            src={game.image}
            alt={`${game.title} board game`}
            className="collection-detail-image"
          />
        </div>

        <div className="collection-detail-content">
          <p className="collection-detail-eyebrow">COLLECTION RECORD</p>

          <h1>{game.title}</h1>

          <p className="collection-detail-edition">{game.edition}</p>

          <dl className="collection-detail-game-info">
            <div>
              <dt>Owner</dt>
              <dd>{game.owner}</dd>
            </div>

            <div>
              <dt>Players</dt>
              <dd>{game.players}</dd>
            </div>

            <div>
              <dt>Time</dt>
              <dd>{game.time}</dd>
            </div>
          </dl>

          <p className="collection-detail-status">
            <strong>Status:</strong> {game.status}
          </p>

          <dl className="collection-detail-stats">
            <div>
              <dt>Play count</dt>
              <dd>{game.playCount}</dd>
            </div>

            <div>
              <dt>Rating</dt>
              <dd>{game.rating !== null ? `${game.rating}/10` : "Not rated"}</dd>
            </div>
          </dl>

          <div className="collection-detail-notes">
            <h2>Notes</h2>
            <p>{game.notes}</p>
          </div>
        </div>
      </section>
    </main>
  );
}