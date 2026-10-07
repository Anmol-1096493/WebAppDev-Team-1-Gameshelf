import "./ShelfDetailPage.css";

type ShelfDetailPageProps = {
  isPublic?: boolean;
};

const shelfGames = [
  {
    id: 1,
    title: "Azul",
    status: "Played",
    playCount: 12,
  },
  {
    id: 2,
    title: "Catan",
    status: "In Progress",
    playCount: 3,
  },
  {
    id: 3,
    title: "Splendor",
    status: "Played",
    playCount: 6,
  },
];

export default function ShelfDetailPage({
  isPublic = false,
}: ShelfDetailPageProps) {
  return (
    <main className="shelf-detail-page">
      <header className="shelf-detail-header">
        <div>
          <p className="shelf-detail-eyebrow">
            {isPublic ? "PUBLIC SHELF" : "PRIVATE SHELF"}
          </p>

          <h1>Game Night Favorites</h1>

          <p className="shelf-detail-description">
            A selection of games that are great for relaxed game
            nights with friends and family.
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

      <section
        className="shelf-game-list"
        aria-labelledby="shelf-games-title"
      >
        <div className="shelf-game-list-header">
          <h2 id="shelf-games-title">
            Games on this shelf
          </h2>

          <span>{shelfGames.length} games</span>
        </div>

        <div className="shelf-game-items">
          {shelfGames.map((game) => (
            <article
              className="shelf-game-item"
              key={game.id}
            >
              <div>
                <h3>{game.title}</h3>

                <p>
                  <strong>Status:</strong> {game.status}
                </p>

                <p>
                  <strong>Plays:</strong> {game.playCount}
                </p>
              </div>

              <button type="button">
                Remove
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}