// Shared game statuses to prevent typos across components
export type CollectionStatus = "Not Played" | "In Progress" | "Played";

// The core game data structure used in collection overviews and cards
export type CollectionGame = {
  id: number;
  title: string;
  image: string;
  edition: string;
  status: CollectionStatus;
  playCount: number;
  rating: number | null;
  notes: string;
};

// Additional fields required only when viewing a game's detail screen
export type CollectionGameDetail = CollectionGame & {
  owner: string;
  players: string;
  time: string;
};