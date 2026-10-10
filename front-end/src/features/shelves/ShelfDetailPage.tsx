import { useFetch } from "../../hooks/useFetch";
import type { Shelf } from "../../types/Shelf";
import "../../pages/ShelfDetailPage.css";

type ShelfDetailPageProps = {
  shelfId?: number;
};

type ShelfGame = {
  id: number;
  title: string;
  status: "Played" | "In Progress" | "Not Played";
  playCount: number;
};

const defaultShelfGames: ShelfGame[] = [
  { id: 1, title: "Azul", status: "Played", playCount: 12 },
  { id: 2, title: "Catan", status: "In Progress", playCount: 3 },
  { id: 3, title: "Splendor", status: "Played", playCount: 6 },
];

export function ShelfDetailPage({ shelfId = 1 }: ShelfDetailPageProps) {
  const { data: shelves, loading, error } = useFetch<Shelf[], Shelf[]>(
    "/data/shelves.json",
    (data) => data
  );

  if (loading) {
    return (
      <main className="shelf-detail-page">
        <p className="text-muted">Loading shelf…</p>
      </main>
    );
  }

  const activeShelf = shelves?.find((s) => s.id === shelfId) ?? shelves?.[0];
  const isPublic = activeShelf?.visibility === "Public";

  return (
    <main className="shelf-detail-page">
      <header className="shelf-detail-header">
        <div>
          <p className="shelf-detail-eyebrow">
            {isPublic ? "PUBLIC SHELF" : "PRIVATE SHELF"}
          </p>

          <h1>{activeShelf?.name ?? "Game Night Favorites"}</h1>

          <p className="shelf-detail-description">
            {activeShelf?.description ??
              "A selection of games that are great for relaxed game nights."}
          </p>
        </div>

        <span
          className={`shelf-visibility-badge ${
            isPublic ? "is-public" : "is-private"
          }`}
        >
          {isPublic ? "Public" : "Private"}
        </span>
      </header>

      {error && <p className="alert alert--error">{error}</p>}

      <section className="shelf-game-list" aria-labelledby="shelf-games-title">
        <div className="shelf-game-list-header">
          <h2 id="shelf-games-title">Games on this shelf</h2>
          <span>{defaultShelfGames.length} games</span>
        </div>

        <div className="shelf-game-items">
          {defaultShelfGames.map((game) => (
            <article className="shelf-game-item" key={game.id}>
              <div>
                <h3>{game.title}</h3>
                <p>
                  <strong>Status:</strong> {game.status}
                </p>
                <p>
                  <strong>Plays:</strong> {game.playCount}
                </p>
              </div>

              <button type="button">Remove</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}