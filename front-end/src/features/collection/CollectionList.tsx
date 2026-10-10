import type { CollectionGame } from "../../types/CollectionGame";
import { CollectionCard } from "./CollectionCard";

type CollectionListProps = {
  games: CollectionGame[];
  onSelectGame?: (id: number) => void;
};

// Grid rendering the list of game cards or no-results message
export function CollectionList({ games, onSelectGame }: CollectionListProps) {
  if (games.length === 0) {
    return (
      <div className="collection-no-results">
        <h2>No games found</h2>
        <p>Try a different search term or change the selected status filter.</p>
      </div>
    );
  }

  return (
    <section className="collection-game-list" aria-label="Games in your collection">
      {games.map((game) => (
        <CollectionCard
          key={game.id}
          game={game}
          onSelect={onSelectGame}
        />
      ))}
    </section>
  );
}