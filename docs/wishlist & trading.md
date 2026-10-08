# Wishlist & Trading Requirements

This document translates the GameShelf case into user flows, pages, fields, permissions and business rules for the Wishlist & Trading module. It serves as a shared reference for design, frontend, backend and testing.

## Scope and terminology

- A **game** is a catalogue entry representing one specific edition of a board game.
- A **wishlist item** represents a game that a member wants to obtain.
- A **priority** indicates how important a desired game is to the member.
- A **trade offer** is a proposal to exchange the game on another member's wishlist for a different game.
- The **wishlist owner** is the member who created the wishlist item.
- The **offer creator** is the member making the trade offer.
- A **fulfilled wishlist item** is a wish that has been satisfied through an accepted trade offer.
- All wishlists are public and visible to club members.
- Trading is based on trust. The system does not verify whether the offer creator actually owns the offered game.
- Games are exchanged in person, without payments or shipping.

## Main user flows

### 1. View a wishlist

1. A member opens **My Wishlist** or another member's wishlist.
2. The system displays the wishlist items, including game details, priority, notes and fulfilled status.
3. The member selects an item to view its details.
4. For an unfulfilled item belonging to another member, the member can choose **Make Trade Offer**.

All wishlists are public, but members cannot modify wishlist items belonging to someone else.

### 2. Add a game to wishlist

1. A member opens **My Wishlist**.
2. The member selects **Add to Wishlist**.
3. The member chooses a game from the shared catalogue.
4. The member assigns a priority and optionally adds a note describing the desired edition or acceptable condition.
5. The system creates the wishlist item with the signed-in member as owner and `isFulfilled = false`.
6. The item appears in the member's public wishlist.

### 3. Make a trade offer

1. A member opens another member's wishlist.
2. The member selects an unfulfilled wishlist item.
3. The member chooses **Make Trade Offer**.
4. The member selects which game they want to receive in return from the catalogue.
5. The system creates an offer with status `OPEN` and records its creation date.
6. The offer appears under **Sent Offers** for the creator and **Received Offers** for the wishlist owner.

The offered game is the game referenced by the wishlist item. The offer creator specifies which game they want in return.

The system does not check whether the offer creator owns the offered game. The same game may be offered to multiple members simultaneously.

### 4. Accept a trade offer

1. The wishlist owner opens **Received Offers**.
2. The owner selects an offer and chooses **Accept**.
3. The system verifies that the signed-in member owns the wishlist item.
4. The system checks that the offer is `OPEN`, has not expired and the wishlist item is not fulfilled.
5. The offer status changes to `ACCEPTED`.
6. The associated wishlist item becomes fulfilled.
7. All other open offers in which the same offer creator offers the same game are automatically cancelled.

Acceptance and conflicting-offer cancellation must happen in one atomic backend operation to prevent inconsistent data.

### 5. Reject a trade offer

1. The wishlist owner opens **Received Offers**.
2. The owner selects an open offer.
3. The owner chooses **Reject**.
4. The system verifies ownership of the wishlist item.
5. The offer status changes to `REJECTED`.

Rejecting an offer does not fulfill the wishlist item or automatically reject unrelated offers.

### 6. Cancel a trade offer

1. The offer creator opens **Sent Offers**.
2. The member selects an offer and chooses **Cancel**.
3. The system verifies that the signed-in member created the offer.
4. The system checks that the offer is still `OPEN`.
5. The offer status changes to `CANCELLED`.

Only the offer creator can manually cancel an offer, and only while it remains open.

### 7. Check offer expiration

1. A member opens a trade offer.
2. The system retrieves the offer creation date.
3. The system calculates expiration using the club's configured validity period.
4. If the offer has expired, it can no longer be accepted.

Expiration is calculated automatically rather than stored as an additional offer status.

The case specifies that offers expire but does not define the exact validity period.

### 8. View fulfilled wishlist items

1. A member opens their wishlist.
2. The system displays fulfilled and unfulfilled items.
3. Fulfilled items are identified using `isFulfilled = true`.
4. Members can still identify fulfilled wishes, but new trade offers cannot be submitted for them.

The case does not specify whether fulfilled items can be reopened or manually marked as fulfilled.

## Pages and views

| Page or view | Purpose | Important content and actions |
| --- | --- | --- |
| My Wishlist | View personal wishlist | Game, priority, notes, fulfilled status, Add Item |
| Public Wishlist | View another member's wishlist | Game details, priority, notes, Make Trade Offer |
| Wishlist Item Detail | View one desired game | Game information, priority, notes, fulfillment status |
| Add Wishlist Item | Create a wishlist entry | Catalogue selection, priority, notes |
| Received Offers | View offers for own wishlist items | Offer creator, requested game, status, Accept, Reject |
| Sent Offers | View submitted trade offers | Wishlist game, recipient, status, Cancel |
| Trade Offer Detail | View an individual trade proposal | Games involved, creation date, expiration and status |

Pages may be implemented as tabs or panels instead of separate URLs, provided the required information and permissions remain available.

## Data fields

### Wishlist Item

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | identifier | Yes | System generated |
| `memberId` | member reference | Yes | Owner of the wishlist item |
| `gameId` | catalogue-game reference | Yes | Specific desired game edition |
| `priority` | enum or number | Yes | Importance of the desired game |
| `notes` | text | No | Desired edition, condition or other preferences |
| `isFulfilled` | boolean | Yes | Initially `false`; becomes `true` when an offer is accepted |

#### Wishlist priorities

The case requires a priority for each wishlist item but does not specify the allowed values.

A possible implementation is:

- `LOW`
- `MEDIUM`
- `HIGH`

These values must be confirmed with the project group or product owner before implementation.

Wishlist visibility is always public, so a separate visibility field is not required.

### Trade Offer

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | identifier | Yes | System generated |
| `wishlistItemId` | wishlist-item reference | Yes | The wishlist item receiving the offer |
| `offerCreatorId` | member reference | Yes | Member submitting the offer |
| `requestedGameId` | catalogue-game reference | Yes | Game the offer creator wants in return |
| `createdAt` | date-time | Yes | Used to calculate expiration |
| `status` | enum | Yes | `OPEN`, `ACCEPTED`, `REJECTED` or `CANCELLED` |

The offered game is obtained through `wishlistItemId → gameId`.

The recipient is obtained through `wishlistItemId → memberId`.

These relationships avoid storing duplicate information.

#### Trade offer states

```text
OPEN ──wishlist owner accepts──> ACCEPTED
OPEN ──wishlist owner rejects───> REJECTED
OPEN ──offer creator cancels────> CANCELLED
OPEN ──conflicting offer accepted──> CANCELLED
```

`ACCEPTED`, `REJECTED` and `CANCELLED` are final states.

#### Derived expiration

| State | Calculation |
| --- | --- |
| Valid | `currentDateTime <= createdAt + validityPeriod` |
| Expired | `currentDateTime > createdAt + validityPeriod` |

An offer may still have status `OPEN` after its validity period expires, but it cannot be accepted.

The validity period must be configured according to the club's rules.

## Permissions

### Every signed-in member

- View all public wishlists.
- Add games to their own wishlist.
- Assign priorities and notes to their wishlist items.
- View their own sent trade offers.
- Submit offers for unfulfilled wishlist items belonging to other members.
- Cancel their own open trade offers.

### Wishlist owner

- View offers received for their wishlist items.
- Accept or reject eligible offers for their own wishlist items.
- Cannot accept or reject offers for another member's wishlist.

### Offer creator

- Submit offers for other members' wishlist items.
- View the status of submitted offers.
- Cancel their own open offers.
- Cannot manually cancel offers created by another member.

### Committee member

- Has the same wishlist and trading permissions as an ordinary member.
- Does not receive additional trading permissions from the case.

Permission checks must be enforced by the backend, not only by hiding frontend buttons.

## Business rules

### Public visibility and catalogue

- All wishlists are visible to every member.
- Public visibility does not grant permission to modify another member's wishlist.
- Wishlist items and games requested in return must reference existing catalogue entries.
- Different editions of the same game are separate catalogue entries.

### Offer creation and ownership verification

- Offers can only be created for unfulfilled wishlist items.
- The offer creator specifies the game they want in return.
- The system does not verify ownership of the offered game.
- A game does not need to appear in the offer creator's collection.
- The same member may offer the same game to multiple members simultaneously.

### Offer decisions and cancellation

- Only the wishlist owner may accept or reject an offer.
- Only the offer creator may manually cancel an open offer.
- An expired offer cannot be accepted.
- Accepted, rejected and cancelled offers cannot be accepted again.
- Accepting an offer marks the associated wishlist item as fulfilled.
- Fulfilled wishlist items cannot receive new offers.

### Conflicting offers

- When an offer is accepted, all other open offers involving the same offer creator and the same offered game must be cancelled.
- This also applies when those offers belong to different wishlist owners.
- Offers involving different games or different offer creators are not cancelled by this specific rule.
- Acceptance and conflicting-offer cancellation must be processed atomically.
- If two conflicting offers are accepted concurrently, only one may succeed.

### Offer expiration

- Each offer has a limited validity period starting from its creation date.
- Expiration is calculated automatically using the configured validity period.
- Expired offers cannot be accepted.
- Expiration does not require a separate mutable database status.

### Trading conditions

- Trading is based on exchanging one game for another.
- No money or prices are involved.
- Games are exchanged in person, not shipped.
- The system relies on trust and does not verify physical game ownership.

## Invalid-action scenarios

The following actions must be rejected and tested:

1. **Non-owner acceptance:** A member tries to accept an offer for somebody else's wishlist item. The backend rejects the action as forbidden.

2. **Non-owner rejection:** A member tries to reject an offer for another member's wishlist item. The action is forbidden.

3. **Unauthorised cancellation:** A member tries to cancel an offer created by someone else. The backend rejects the action.

4. **Cancelling an accepted offer:** An offer creator attempts to cancel an already accepted offer. The system rejects the action because the offer is no longer open.

5. **Expired offer acceptance:** A wishlist owner attempts to accept an offer after its validity period. The system rejects the action.

6. **Offering on a fulfilled item:** A member tries to create an offer for a fulfilled wishlist item. No new offer is created.

7. **Accepting a cancelled or rejected offer:** A wishlist owner attempts to accept an offer that is no longer open. The action is rejected.

8. **Conflicting acceptance:** Two members attempt to accept offers involving the same offer creator and offered game. Only one succeeds; the conflicting offer is cancelled.

9. **Editing another member's wishlist:** A member attempts to modify someone else's wishlist item. The backend rejects the action as forbidden.

## Open decisions

The following details are not explicitly defined in the case and should be agreed with the product owner before implementation:

- The exact priority values (`LOW`, `MEDIUM`, `HIGH` or another system).
- The numeric trade offer validity period.
- Whether members may edit or remove wishlist items after creation.
- Whether duplicate wishlist items for the same game are allowed.
- Whether members may submit offers for their own wishlist items.
- Whether expired but still `OPEN` offers can be manually cancelled.
- What happens to other open offers for the same fulfilled wishlist item when they do not meet the conflicting-offer rule.
- Whether fulfilled wishlist items can be reopened.
- Whether the physical exchange should be recorded separately after an offer is accepted.
