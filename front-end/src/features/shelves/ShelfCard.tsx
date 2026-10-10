import type { Shelf } from "../../types/Shelf";

type ShelfCardProps = {
  shelf: Shelf;
  onSelect?: (id: number) => void;
};

// Card component showing a single shelf and its visibility
export function ShelfCard({ shelf, onSelect }: ShelfCardProps) {
  return (
    <article
      className={`shelf-card ${
        shelf.visibility === "Public" ? "is-public" : "is-private"
      }`}
    >
      <div className="shelf-card-content">
        <div className="shelf-card-header">
          <h2>{shelf.name}</h2>
          <span className="shelf-visibility">{shelf.visibility}</span>
        </div>

        <p>{shelf.description}</p>

        <span className="shelf-game-count">{shelf.gameCount} games</span>
      </div>

      <a
        href="/shelf-detail"
        className="shelf-view-button"
        onClick={(e) => {
          if (onSelect) {
            e.preventDefault();
            onSelect(shelf.id);
          }
        }}
      >
        View Shelf
      </a>
    </article>
  );
}
