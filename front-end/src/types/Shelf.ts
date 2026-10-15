// Visibility flag for personal and public shelves
export type ShelfVisibility = "Public" | "Private";

// Structure for a shelf card and overview
export type Shelf = {
  id: number;
  name: string;
  description: string;
  visibility: ShelfVisibility;
  gameCount: number;
};