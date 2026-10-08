import "./ShelvesPage.css";

type Shelf = {
  id: number;
  name: string;
  description: string;
  visibility: "Public" | "Private";
  gameCount: number;
};

// Temporary mock data until shelves are connected to the C# API.
const shelves: Shelf[] = [
  {
    id: 1,
    name: "Game Night Favorites",
    description:
      "Games that are great for relaxed game nights.",
    visibility: "Public",
    gameCount: 6,
  },
  {
    id: 2,
    name: "Two Player Games",
    description:
      "Games that work especially well with two players.",
    visibility: "Private",
    gameCount: 4,
  },
  {
    id: 3,
    name: "Games to Learn",
    description:
      "Games that I still want to learn and play more often.",
    visibility: "Private",
    gameCount: 5,
  },
];

export default function ShelvesPage() {
  return (
    <main className="shelves-page">
      <header className="shelves-page-header">
        <div>
          <p className="shelves-page-eyebrow">
            MY SHELVES
          </p>

          <h1>Shelves</h1>

          <p className="shelves-page-description">
            Organize games from your collection into personal
            shelves.
          </p>
        </div>

        <a
          href="/shelf"
          className="shelves-create-button"
        >
          Create Shelf
        </a>
      </header>

      <section
        className="shelves-list"
        aria-label="Your shelves"
      >
        {shelves.map((shelf) => (
          <article
            className={`shelf-card ${
              shelf.visibility === "Public"
                ? "is-public"
                : "is-private"
            }`}
            key={shelf.id}
          >
            <div className="shelf-card-content">
              <div className="shelf-card-header">
                <h2>{shelf.name}</h2>

                <span className="shelf-visibility">
                  {shelf.visibility}
                </span>
              </div>

              <p>{shelf.description}</p>

              <span className="shelf-game-count">
                {shelf.gameCount} games
              </span>
            </div>

            <a
              href="/shelf-detail"
              className="shelf-view-button"
            >
              View Shelf
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}