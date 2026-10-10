import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import type { CollectionGame, CollectionStatus } from "../../types/CollectionGame";
import { CollectionList } from "./CollectionList";

type CollectionPageProps = {
  onSelectGame: (id: number) => void;
};

// Page component handling data fetching and status filter
export function CollectionPage({ onSelectGame }: CollectionPageProps) {
  const [filter, setFilter] = useState<CollectionStatus | "All">("All");

  // Load games from static JSON mock file
  const { data: games, loading, error } = useFetch<CollectionGame[], CollectionGame[]>(
    "/data/games.json",
    (data) => data
  );

  if (loading) {
    return <p>Loading games...</p>;
  }

  if (error) {
    return <p className="alert alert--error">{error}</p>;
  }

  const allGames = games ?? [];
  const filteredGames = filter === "All"
    ? allGames
    : allGames.filter((g) => g.status === filter);

  return (
    <section className="stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>My Game Collection</h1>
        </div>

        {/* Filter buttons */}
        <div className="filter-group">
          {(["All", "Played", "In Progress", "Not Played"] as const).map((status) => (
            <button
              key={status}
              type="button"
              className={`button ${filter === status ? "button--primary" : "button--ghost"}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </header>

      <CollectionList games={filteredGames} onSelectGame={onSelectGame} />
    </section>
  );
}