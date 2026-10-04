import "./CollectionPage.css";

import azulImage from "../assets/games/azul.svg";
import carcassonneImage from "../assets/games/carcassonne.svg";
import catanImage from "../assets/games/catan.svg";
import codenamesImage from "../assets/games/codenames.svg";
import splendorImage from "../assets/games/splendor.svg";
import ticketToRideImage from "../assets/games/ticket-to-ride.svg";

// These statuses are shared with the collection UI.
// Keeping them as a type helps prevent invalid status values.
type CollectionStatus = "Not Played" | "In Progress" | "Played";

type CollectionGame = {
  id: number;
  title: string;
  image: string;
  status: CollectionStatus;
  playCount: number;
  rating: number | null;
  notes: string;
};

// Temporary mock data.
// This will later be replaced by data from the C# API.
const collectionGames: CollectionGame[] = [
  {
    id: 1,
    title: "Azul",
    image: azulImage,
    status: "Played",
    playCount: 12,
    rating: 9,
    notes: "Great game for smaller groups.",
  },
  {
    id: 2,
    title: "Carcassonne",
    image: carcassonneImage,
    status: "Played",
    playCount: 8,
    rating: 8,
    notes: "Easy to teach and always fun.",
  },
  {
    id: 3,
    title: "Catan",
    image: catanImage,
    status: "In Progress",
    playCount: 3,
    rating: null,
    notes: "Still learning the best strategies.",
  },
  {
    id: 4,
    title: "Codenames",
    image: codenamesImage,
    status: "Not Played",
    playCount: 0,
    rating: null,
    notes: "Bought recently and waiting for game night.",
  },
  {
    id: 5,
    title: "Splendor",
    image: splendorImage,
    status: "Played",
    playCount: 6,
    rating: 8,
    notes: "A quick game that works well with two players.",
  },
  {
    id: 6,
    title: "Ticket to Ride",
    image: ticketToRideImage,
    status: "In Progress",
    playCount: 2,
    rating: null,
    notes: "Planning to play this again soon.",
  },
];

function CollectionGameCard({ game }: { game: CollectionGame }) {
  return (
    <article className="collection-game-card">
      <div className="collection-game-image-wrapper">
        <img
          src={game.image}
          alt={`${game.title} board game`}
          className="collection-game-image"
        />
      </div>

      <div className="collection-game-content">
        <div className="collection-game-header">
          <h2>{game.title}</h2>

          {/* The status text is always visible so the UI does not rely on colour alone. */}
          <span className="collection-status">
            {game.status}
          </span>
        </div>

        <div className="collection-game-meta">
          <span>
            <strong>Plays:</strong> {game.playCount}
          </span>

          <span>
            <strong>Rating:</strong>{" "}
            {game.rating !== null ? `${game.rating}/10` : "Not rated"}
          </span>
        </div>

        <div className="collection-game-notes">
          <strong>Notes:</strong>
          <p>{game.notes}</p>
        </div>
      </div>
    </article>
  );
}

export default function CollectionPage() {
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

        <div className="collection-count">
          <strong>{collectionGames.length}</strong>
          <span>Games</span>
        </div>
      </header>

      <section
        className="collection-game-list"
        aria-label="Games in your collection"
      >
        {collectionGames.map((game) => (
          <CollectionGameCard key={game.id} game={game} />
        ))}
      </section>
    </main>
  );
}