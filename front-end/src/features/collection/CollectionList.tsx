import type { CollectionGame } from "../../types/CollectionGame";
import { CollectionCard } from "./CollectionCard";

type CollectionListProps = {
  games: CollectionGame[];
  onSelectGame: (id: number) => void;
};

// List component mapping games to cards
export function CollectionList({ games, onSelectGame }: CollectionListProps) {
  if (games.length === 0) {
    return <p className="text-muted">No games found in this collection.</p>;
  }

  return (
    <div className="games-grid">
      {games.map((game) => (
        <CollectionCard key={game.id} game={game} onSelect={onSelectGame} />
      ))}
    </div>
  );
}