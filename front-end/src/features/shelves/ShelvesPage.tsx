import { useFetch } from "../../hooks/useFetch";
import type { Shelf } from "../../types/Shelf";
import { ShelfList } from "./ShelfList";
import "../../pages/ShelvesPage.css";

type ShelvesPageProps = {
  onSelectShelf?: (id: number) => void;
};

// Page component loading shelves data and rendering the header and list
export function ShelvesPage({ onSelectShelf }: ShelvesPageProps) {
  // Load shelves from static mock JSON
  const { data: shelves, loading, error } = useFetch<Shelf[], Shelf[]>(
    "/data/shelves.json",
    (data) => data
  );

  if (loading) {
    return (
      <main className="shelves-page">
        <p className="text-muted">Loading shelves…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="shelves-page">
        <p className="alert alert--error">{error}</p>
      </main>
    );
  }

  const allShelves = shelves ?? [];

  return (
    <main className="shelves-page">
      <header className="shelves-page-header">
        <div>
          <p className="shelves-page-eyebrow">MY SHELVES</p>
          <h1>Shelves</h1>
          <p className="shelves-page-description">
            Organize games from your collection into personal shelves.
          </p>
        </div>

        <a href="/shelf" className="shelves-create-button">
          Create Shelf
        </a>
      </header>

      <ShelfList shelves={allShelves} onSelectShelf={onSelectShelf} />
    </main>
  );
}
