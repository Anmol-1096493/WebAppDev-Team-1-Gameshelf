import { useState } from "react";
import type { FormEvent } from "react";
import type { CollectionStatus } from "../../types/CollectionGame";
import "./CollectionRecordForm.css";

type CollectionRecordFormProps = {
  mode?: "add" | "edit";
  onSubmitRecord?: (record: {
    gameId: string;
    status: CollectionStatus;
    playCount: number;
    rating: number | null;
    notes: string;
  }) => void;
};

export function CollectionRecordForm({
  mode = "add",
  onSubmitRecord,
}: CollectionRecordFormProps) {
  const [selectedGame, setSelectedGame] = useState("");
  const [status, setStatus] = useState<CollectionStatus>("Not Played");
  const [playCount, setPlayCount] = useState("0");
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");

  const isEditMode = mode === "edit";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmitRecord?.({
      gameId: selectedGame,
      status,
      playCount: Number(playCount) || 0,
      rating: rating ? Number(rating) : null,
      notes,
    });
  }

  return (
    <form className="collection-record-form" onSubmit={handleSubmit}>
      <header className="collection-record-form-header">
        <p className="collection-record-form-eyebrow">
          {isEditMode ? "EDIT COLLECTION" : "ADD TO COLLECTION"}
        </p>

        <h1>
          {isEditMode ? "Edit Collection Record" : "Add Game to Collection"}
        </h1>

        <p>
          {isEditMode
            ? "Update the details for this game in your collection."
            : "Add a game to your personal collection and record your play details."}
        </p>
      </header>

      <div className="collection-record-form-field">
        <label htmlFor="collection-game">
          Game <span aria-hidden="true">*</span>
        </label>

        <select
          id="collection-game"
          required
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
        >
          <option value="" disabled>
            Select a game
          </option>
          <option value="1">Azul</option>
          <option value="2">Carcassonne</option>
          <option value="3">Catan</option>
          <option value="4">Codenames</option>
          <option value="5">Splendor</option>
          <option value="6">Ticket to Ride</option>
        </select>
      </div>

      <div className="collection-record-form-field">
        <label htmlFor="collection-status">
          Status <span aria-hidden="true">*</span>
        </label>

        <select
          id="collection-status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as CollectionStatus)
          }
          required
        >
          <option value="Not Played">Not Played</option>
          <option value="In Progress">In Progress</option>
          <option value="Played">Played</option>
        </select>
      </div>

      <div className="collection-record-form-field">
        <label htmlFor="collection-play-count">
          Play count <span aria-hidden="true">*</span>
        </label>

        <input
          id="collection-play-count"
          type="number"
          min="0"
          value={playCount}
          onChange={(event) => setPlayCount(event.target.value)}
          required
        />
      </div>

      <div className="collection-record-form-field">
        <label htmlFor="collection-rating">Rating</label>

        <input
          id="collection-rating"
          type="number"
          min="1"
          max="10"
          value={rating}
          onChange={(event) => setRating(event.target.value)}
          placeholder="1–10"
        />
      </div>

      <div className="collection-record-form-field">
        <label htmlFor="collection-notes">Notes</label>

        <textarea
          id="collection-notes"
          rows={5}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Add any notes about this game..."
        />
      </div>

      <div className="collection-record-form-actions">
        <button type="submit">
          {isEditMode ? "Save Changes" : "Add to Collection"}
        </button>
      </div>
    </form>
  );
}