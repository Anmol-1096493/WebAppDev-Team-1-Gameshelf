import type { CollectionGame } from "../../types/CollectionGame";

type CollectionCardProps = {
  game: CollectionGame;
  onSelect?: (id: number) => void;
};

// Single game card keeping original classes and layout
export function CollectionCard({ game, onSelect }: CollectionCardProps) {
  return (
    <article
      className="collection-game-card"
      onClick={() => onSelect?.(game.id)}
      style={{ cursor: onSelect ? "pointer" : "default" }}
    >
      <div className="collection-game-image-wrapper">
        <img
          src={game.image}
          alt={`${game.title} board game`}
          className="collection-game-image"
        />
      </div>

      <div className="collection-game-content">
        <div className="collection-game-header">
          <div>
            <h2>{game.title}</h2>
            <p className="collection-game-edition">{game.edition}</p>
          </div>

          <span className="collection-status">{game.status}</span>
        </div>

        <div className="collection-game-meta">
          <span>
            <strong>Plays:</strong> {game.playCount}
          </span>
          <span>
            <strong>Rating:</strong>{" "}
            {game.rating !== null ? `${game.rating}/10` : "Not rated"}
          </span>
        </div>

        <div className="collection-game-notes">
          <strong>Notes:</strong>
          <p>{game.notes}</p>
        </div>
      </div>
    </article>
  );
}