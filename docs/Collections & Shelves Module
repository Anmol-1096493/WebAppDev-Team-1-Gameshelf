# Collections & Shelves Module

## Overview

The Collections & Shelves module allows members to manage the games they own and organize these games into shelves.

Members can:

- View their collection and individual game details.
- Add and remove games from their collection.
- Track the status of games.
- Track how many times they have played a game.
- Give played games a personal rating.
- Add personal notes.
- Create, edit and delete shelves.
- Add games from their collection to shelves.
- Choose whether a shelf is public or private.
- Search and filter their collection.

## User Flows

### Flow 1 View Collection

**Goal:** A member wants to see the games they own.

1. Member opens their collection.
2. System displays all games in their collection.
3. Member can search for a game.
4. Member can filter games by status.
5. Member selects a game.
6. System displays the game's collection details.

**Collection overview should show:**

- Game title
- Game image/details
- Status
- Play count
- Rating, if available
- Personal notes, if available

### Flow 2 Add a Game to Collection

1. Member searches for a game.
2. Member opens the game details.
3. Member chooses **Add to Collection**.
4. System checks whether the game is already in the member's collection.
5. If it is not already owned, the game is added.
6. The game appears in the member's collection.

**Invalid scenario**

A member tries to add a game that is already in their collection.

**Expected result:** The system rejects the action and informs the member that the game is already in their collection.

### Flow 3 Remove a Game from Collection

1. Member opens a game in their collection.
2. Member chooses **Remove from Collection**.
3. System asks for confirmation.
4. Member confirms the removal.
5. The game is removed from the collection.
6. The game is also removed from **all shelves belonging to that member**.

**Important rule**

Removing a game from the collection automatically removes it from every shelf where the member had placed it.

### Flow 4 Update Game Status

A collection game can have one of three statuses:

- **Not played**
- **In progress**
- **Played**

1. Member opens a game in their collection.
2. Member selects a status.
3. System validates the status change.
4. If valid, the new status is saved.

**In-progress restriction**

A member can have **a maximum of three games with the status "In progress"**.

If the member already has three games in progress, they cannot change another game to **In progress** until one of the existing games is changed to another status.

**Invalid scenario**

A member already has three games marked **In Progress** and tries to mark a fourth game as **In Progress**.

**Expected result:** The system rejects the change and explains that a maximum of three games can be in progress.

### Flow 5 Record a Play

1. Member opens a game in their collection.
2. Member records that they played the game.
3. System increases the play count.
4. System changes the status to **Played**.

**Important rules**

- Play count can increase.
- Play count can **never decrease**.
- The first recorded play changes the status to **Played**.

### Flow 6 Add a Rating

1. Member opens a game in their collection.
2. Member checks whether the game has been played.
3. If the game has been played, the member can enter a rating.
4. System saves the rating.

**Rating restriction**

A member can only give a game a rating **after the game has been played**.

**Invalid scenario**

A member tries to rate a game that has never been played.

**Expected result:** The system rejects the rating.

### Flow 7 Add or Edit Personal Notes

1. Member opens a game in their collection.
2. Member enters or edits personal notes.
3. Member saves the notes.
4. System stores the notes for that member's collection entry.

## Shelf Flows

### Flow 8 Create a Shelf

1. Member opens their shelves.
2. Member chooses **Create Shelf**.
3. Member enters the shelf information.
4. Member chooses whether the shelf is public or private.
5. Member saves the shelf.
6. System creates the shelf.

### Flow 9 Edit a Shelf

1. Member opens one of their own shelves.
2. Member chooses **Edit**.
3. Member changes the shelf information or visibility.
4. Member saves the changes.
5. System updates the shelf.

A member can only edit shelves they own.

### Flow 10 Delete a Shelf

1. Member opens one of their own shelves.
2. Member chooses **Delete**.
3. System asks for confirmation.
4. Member confirms.
5. System deletes the shelf.

Deleting a shelf does not delete games from the member's collection.

### Flow 11 Add a Game to a Shelf

1. Member opens a shelf they own.
2. Member chooses **Add Game**.
3. Member selects a game from their collection.
4. System adds the game to the shelf.

Only games that belong to the member's collection can be added to their shelves.

### Flow 12 View a Shelf

**Private shelf**

Only the shelf owner can view a private shelf.

**Public shelf**

All members can view a public shelf.

However, only the owner can change the shelf or its games.

## Pages

| Page | Purpose |
|---|---|
| Collection Overview | Shows all games owned by the member |
| Game Collection Details | Shows status, play count, rating and notes |
| Game Search | Allows members to find games |
| Collection Filters | Filters games by status and potentially other supported fields |
| Shelves Overview | Shows the member's shelves |
| Shelf Details | Shows games contained in a shelf |
| Create Shelf | Creates a new shelf |
| Edit Shelf | Updates an existing shelf |
| Public Shelf | Allows members to view a public shelf |
| Add Game to Collection | Adds a game to the member's collection |

## Data Fields

### Collection

A collection represents a game owned by a specific member.

**Required fields:**

| Field | Description |
|---|---|
| **id** | Unique identifier of the collection entry |
| **memberId** | ID of the member who owns the collection entry |
| **gameId** | ID of the game |
| **status** | NOT_PLAYED, IN_PROGRESS, or PLAYED |
| **playCount** | Number of times the member has played the game |
| **rating** | Personal rating; only allowed after the game has been played |
| **notes** | Personal notes about the game |
| **createdAt** | Date/time the game was added |
| **updatedAt** | Date/time the entry was last changed |

### Collection status values

- `NOT_PLAYED`
- `IN_PROGRESS`
- `PLAYED`

### Shelf

**Required shelf fields:**

| Field | Description |
|---|---|
| **id** | Unique identifier of the shelf |
| **memberId** | ID of the shelf owner |
| **name** | Name of the shelf |
| **description** | Optional description of the shelf |
| **visibility** | PUBLIC or PRIVATE |
| **createdAt** | Date/time the shelf was created |
| **updatedAt** | Date/time the shelf was last changed |

### Shelf visibility values

- `PUBLIC`
- `PRIVATE`

### Shelf Games

A shelf needs a relationship between a shelf and the games in that shelf.

**Required relationship fields:**

| Field | Description |
|---|---|
| **shelfId** | ID of the shelf |
| **collectionId** | ID of the collection entry/game |

This relationship allows a member to place games from their collection onto their shelves.

## Business Rules

### Ownership

- Members can only modify their **own collection**.
- Members can only create, edit and delete **their own shelves**.
- Members can only modify games on shelves they own.
- A member cannot modify another member's collection or shelves.

### Shelf visibility

- A **private** shelf is visible only to its owner.
- A **public** shelf is visible to all members.
- Visibility does not give other members permission to edit the shelf.

### In-progress limit

- A member can have no more than **three games marked as In progress**.

### Play count

- Play count may increase.
- Play count may never decrease.
- The first play changes the status to **Played**.

### Rating

- A rating can only be added after the game has been played.
- A game that has never been played cannot receive a rating.

### Collection removal

- Removing a game from a collection also removes that game from every shelf owned by that member.

## Example Invalid Actions

The system must reject invalid actions.

Examples:

1. **Fourth game in progress:**  
   A member already has three games marked IN_PROGRESS and tries to mark another game as IN_PROGRESS.

2. **Rating an unplayed game:**  
   A member tries to give a rating to a game with a play count of 0.

3. **Decreasing play count:**  
   A member tries to change a play count from 5 to 4.

4. **Editing another member's shelf:**  
   A member attempts to edit or delete a shelf they do not own.

5. **Adding a non-owned game to a shelf:**  
   A member attempts to add a game that is not in their collection to one of their shelves.

6. **Viewing a private shelf:**  
   A member attempts to access another member's private shelf.
