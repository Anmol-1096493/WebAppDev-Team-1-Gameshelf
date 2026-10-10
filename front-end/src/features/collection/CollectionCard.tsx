import type { CollectionGame } from "../../types/CollectionGame";

type CollectionCardProps = {
  game: CollectionGame;
  onSelect: (id: number) => void;
};

// Card component showing single game details
export function CollectionCard({ game, onSelect }: CollectionCardProps) {
  return (
    <article className="card game-card">
      <img src={game.image} alt={game.title} className="game-card__image" />
      <div className="card__body stack">
        <h3 className="game-card__title">{game.title}</h3>
        <p className="text-muted">{game.edition}</p>

        <div className="game-card__meta">
          <span className="badge">{game.status}</span>
          <span className="text-muted">Plays: {game.playCount}</span>
          {game.rating && <span className="badge badge--rating">★ {game.rating}</span>}
        </div>

        {game.notes && <p className="game-card__notes">{game.notes}</p>}
      </div>

      <div className="card__footer">
        <button
          type="button"
          className="button button--secondary"
          onClick={() => onSelect(game.id)}
        >
          View details
        </button>
      </div>
    </article>
  );
}
