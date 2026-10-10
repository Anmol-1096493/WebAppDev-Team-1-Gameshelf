import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import type { CollectionGame, CollectionStatus } from "../../types/CollectionGame";
import { CollectionList } from "./CollectionList";
import "../../pages/CollectionPage.css";

type CollectionPageProps = {
  onSelectGame?: (id: number) => void;
};

function EmptyCollectionState() {
  return (
    <section className="collection-empty-state" aria-labelledby="empty-collection-title">
      <h2 id="empty-collection-title">Your collection is empty</h2>
      <p>You do not have any games in your collection yet. Add a game to get started.</p>
    </section>
  );
}

// Page component connecting the useFetch hook to the original layout
export function CollectionPage({ onSelectGame }: CollectionPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CollectionStatus | "All">("All");

  // Load games from static JSON mock data
  const { data: games, loading, error } = useFetch<CollectionGame[], CollectionGame[]>(
    "/data/games.json",
    (data) => data
  );

  if (loading) {
    return (
      <main className="collection-page">
        <p className="text-muted">Loading games…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="collection-page">
        <p className="alert alert--error">{error}</p>
      </main>
    );
  }

  const allGames = games ?? [];

  // Filter games locally based on search and status dropdown
  const filteredGames = allGames.filter((game) => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || game.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="collection-page">
      <header className="collection-page-header">
        <div>
          <p className="collection-page-eyebrow">MY GAMES</p>
          <h1>My Collection</h1>
          <p className="collection-page-description">
            View and manage the games in your personal collection.
          </p>
        </div>

        <div className="collection-page-header-actions">
          <a href="/collection-record" className="collection-add-button">
            Add Game to Collection
          </a>

          <div className="collection-count">
            <strong>{filteredGames.length}</strong>
            <span>Games</span>
          </div>
        </div>
      </header>

      {/* Filter and search controls */}
      <section className="collection-filters" aria-label="Collection filters">
        <div className="collection-filter-field">
          <label htmlFor="collection-search">Search games</label>
          <input
            id="collection-search"
            type="search"
            placeholder="Search by game name..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="collection-filter-field">
          <label htmlFor="collection-status-filter">Filter by status</label>
          <select
            id="collection-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as CollectionStatus | "All")
            }
          >
            <option value="All">All statuses</option>
            <option value="Not Played">Not Played</option>
            <option value="In Progress">In Progress</option>
            <option value="Played">Played</option>
          </select>
        </div>
      </section>

      {allGames.length === 0 ? (
        <EmptyCollectionState />
      ) : (
        <CollectionList games={filteredGames} onSelectGame={onSelectGame} />
      )}
    </main>
  );
}