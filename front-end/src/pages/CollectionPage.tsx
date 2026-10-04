import { useState } from "react";
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

function EmptyCollectionState() {
  return (
    <section className="collection-empty-state" aria-labelledby="empty-collection-title">
      <h2 id="empty-collection-title">Your collection is empty</h2>
      <p>
        You do not have any games in your collection yet. Add a game to get
        started.
      </p>
    </section>
  );
}

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<CollectionStatus | "All">(
    "All",
  );

  // Filter the collection locally until the C# API is connected.
  const filteredGames = collectionGames.filter((game) => {
    const matchesSearch = game.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || game.status === statusFilter;

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

      {/* Search and filter controls help members quickly find collection games. */}
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
              setStatusFilter(
                event.target.value as CollectionStatus | "All",
              )
            }
          >
            <option value="All">All statuses</option>
            <option value="Not Played">Not Played</option>
            <option value="In Progress">In Progress</option>
            <option value="Played">Played</option>
          </select>
        </div>
      </section>

 {collectionGames.length === 0 ? (
        <EmptyCollectionState />
      ) : (
        <section
          className="collection-game-list"
          aria-label="Games in your collection"
        >
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              <CollectionGameCard key={game.id} game={game} />
            ))
          ) : (
            <div className="collection-no-results">
              <h2>No games found</h2>
              <p>
                Try a different search term or change the selected status
                filter.
              </p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}