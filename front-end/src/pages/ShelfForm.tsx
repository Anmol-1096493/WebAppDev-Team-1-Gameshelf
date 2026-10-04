import { useState } from "react";
import "./ShelfForm.css";

type ShelfFormProps = {
  mode?: "create" | "edit";
};

export default function ShelfForm({ mode = "create" }: ShelfFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"Public" | "Private">(
    "Private",
  );

  const isEditMode = mode === "edit";

  return (
    <form className="shelf-form">
      <header className="shelf-form-header">
        <p className="shelf-form-eyebrow">
          {isEditMode ? "EDIT SHELF" : "CREATE SHELF"}
        </p>

        <h1>{isEditMode ? "Edit Shelf" : "Create Shelf"}</h1>

        <p>
          {isEditMode
            ? "Update the name, description, or visibility of your shelf."
            : "Create a shelf to organize games from your collection."}
        </p>
      </header>

      <div className="shelf-form-field">
        <label htmlFor="shelf-name">
          Shelf name <span aria-hidden="true">*</span>
        </label>

        <input
          id="shelf-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Enter a shelf name..."
          required
        />
      </div>

      <div className="shelf-form-field">
        <label htmlFor="shelf-description">Description</label>

        <textarea
          id="shelf-description"
          rows={5}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Describe this shelf..."
        />
      </div>

      <fieldset className="shelf-form-fieldset">
        <legend>
          Visibility <span aria-hidden="true">*</span>
        </legend>

        <label className="shelf-visibility-option">
          <input
            type="radio"
            name="shelf-visibility"
            value="Private"
            checked={visibility === "Private"}
            onChange={() => setVisibility("Private")}
          />
          <span>
            <strong>Private</strong>
            <small>Only you can view this shelf.</small>
          </span>
        </label>

        <label className="shelf-visibility-option">
          <input
            type="radio"
            name="shelf-visibility"
            value="Public"
            checked={visibility === "Public"}
            onChange={() => setVisibility("Public")}
          />
          <span>
            <strong>Public</strong>
            <small>Other members can view this shelf.</small>
          </span>
        </label>
      </fieldset>

      <div className="shelf-form-actions">
        <button type="submit">
          {isEditMode ? "Save Changes" : "Create Shelf"}
        </button>
      </div>
    </form>
  );
}