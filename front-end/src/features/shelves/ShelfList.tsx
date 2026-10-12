import type { Shelf } from "../../types/Shelf";
import { ShelfCard } from "./ShelfCard";

type ShelfListProps = {
  shelves: Shelf[];
  onSelectShelf?: (id: number) => void;
};

// List container mapping shelf items to individual cards
export function ShelfList({ shelves, onSelectShelf }: ShelfListProps) {
  if (shelves.length === 0) {
    return <p className="text-muted">No shelves created yet.</p>;
  }

  return (
    <section className="shelves-list" aria-label="Your shelves">
      {shelves.map((shelf) => (
        <ShelfCard
          key={shelf.id}
          shelf={shelf}
          onSelect={onSelectShelf}
        />
      ))}
    </section>
  );
}