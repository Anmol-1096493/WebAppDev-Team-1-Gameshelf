import "./CollectionDetailPage.css";

import azulImage from "../assets/games/azul.svg";

// The detail page currently uses static data.
// This will later be replaced with data from the C# API.
type CollectionGameDetail = {
  title: string;
  image: string;
  status: "Not Played" | "In Progress" | "Played";
  playCount: number;
  rating: number | null;
  notes: string;
};

const game: CollectionGameDetail = {
  title: "Azul",
  image: azulImage,
  status: "Played",
  playCount: 12,
  rating: 9,
  notes: "Great game for smaller groups.",
};

export default function CollectionDetailPage() {
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

          {/* The written status makes the state understandable without relying on colour. */}
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
              <dd>
                {game.rating !== null ? `${game.rating}/10` : "Not rated"}
              </dd>
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