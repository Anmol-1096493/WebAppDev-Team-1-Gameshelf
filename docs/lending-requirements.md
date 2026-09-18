367393# Lending requirements

This document translates the GameShelf case into user flows, pages, fields,
permissions and business-rule states. It is the shared reference for design,
frontend, backend and testing.

## Scope and terminology

- A **game** is a catalogue entry for a specific edition.
- A **box** is one physical copy offered for lending.
- A **request** is a member asking to borrow one listed box.
- A **loan** starts only when an approved box physically changes hands at a club
  evening.
- Lending boxes are independent of collections. A box does not need to occur in
  the owner's collection.
- Boxes change hands in person and are never posted.
- The club's **maximum loan period** is 5 weeks. 

## Main user flows

### 1. Offer a box for lending

1. A member opens **My lending boxes**.
2. The member selects **Offer a box**.
3. The member chooses a game from the shared catalogue and describes the box's
   condition.
4. The system creates the box with the signed-in member as owner.
5. The box appears in the lending list when it has no active loan.

### 2. Request a box

1. A member browses **Available boxes**.
2. The member opens a box and selects **Request to borrow**.
3. The system checks that the box has no active loan.
4. The system creates a request with status `pending`.
5. The borrower sees the request under **My requests**; the owner sees it under
   **Requests received**.

### 3. Decide a request

1. The box owner opens the pending requests for their box.
2. The owner approves one request or rejects an individual request.
3. When a request is approved, all other pending requests for that same box are
   rejected in the same operation.
4. The approved request remains awaiting physical handover; it is not yet a
   loan.

### 4. Start a loan at handover

1. At a club evening, the approved borrower receives the physical box.
2. The start date and agreed return date are recorded.
3. The system checks that the return date is no later than `start date + maximum
   loan period`.
4. A loan is created and the box becomes unavailable.

The case does not explicitly name who records the handover. For the first
implementation, this should be an owner-side action. Giving the committee this
permission requires a separate product decision.

### 5. Return a box

1. The borrower hands the box back at a club evening.
2. The owner records the return date.
3. If the owner is absent, a committee member records the return instead.
4. The loan becomes returned and the box can be requested again.

### 6. Extend an active loan

1. The borrower opens an active, not-late loan and asks for a later return date.
2. The system checks that the loan has never been extended.
3. The new return date must remain on or before `start date + maximum loan
   period`.
4. If valid, the return date changes and `hasBeenExtended` becomes `true`.

The case says that a borrower can ask for more time but does not state whether
the owner must approve the extension. This decision must be confirmed before an
extension-request API or approval screen is built.

## Pages and views

| Page or view | Purpose | Important content and actions |
| --- | --- | --- |
| Lending overview | Main entry matching the wireframe | Tabs for Available boxes and My loans; search and condition filter |
| Available boxes | Browse boxes that are not on active loan | Game, edition/image, owner, condition, player count, playing time, Request action |
| Box detail | Inspect one physical copy | Full condition, owner, availability and Request action |
| My requests | Follow requests made by the member | Box, owner, requested date and request status |
| Requests received | Owner inbox | Requests grouped by box; Approve and Reject actions |
| My lending boxes | Manage boxes owned by the member | Add box, edit condition, view requests and availability |
| Loan detail | Manage one current or historical loan | Borrower, owner, dates, late state, extension state and return action when permitted |
| Committee returns | Record an in-person return when owner is absent | Find active loan and record returned date; no approve/reject controls |

Pages may be implemented as tabs or panels rather than separate URLs, but the
same information and permissions must remain available.

## Data fields

### Box

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | identifier | Yes | System generated |
| `ownerId` | member reference | Yes | Set from the signed-in member |
| `gameId` | catalogue-game reference | Yes | One specific edition |
| `condition` | text | Yes | Description of the physical copy |

Availability is derived from requests and loans; it is not a manually edited
box field.

### Request

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | identifier | Yes | System generated |
| `boxId` | box reference | Yes | The requested physical copy |
| `requesterId` | member reference | Yes | Set from the signed-in member |
| `status` | enum | Yes | `pending`, `approved`, or `rejected` |
| `requestedAt` | date-time | Recommended | Needed to order and audit competing requests |
| `decidedAt` | date-time | Recommended | Audit information |

#### Request states

```text
pending ──owner approves──> approved
pending ──owner rejects───> rejected
pending ──another request on the box is approved──> rejected
```

`approved` and `rejected` are final states in the case. Cancellation by the
requester is not specified and must not be added without a product decision.

### Loan

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | identifier | Yes | System generated |
| `boxId` | box reference | Yes | The physical box handed over |
| `borrowerId` | member reference | Yes | Comes from the approved request |
| `startedOn` | date | Yes | Physical handover date |
| `agreedReturnOn` | date | Yes | Must respect the club maximum |
| `hasBeenExtended` | boolean | Yes | Starts as `false`; can change once to `true` |
| `returnedOn` | nullable date | No | Filled when the box physically comes back |

The source approved request should also be retained as a reference for
traceability, although the case's minimum field list does not require it.

#### Derived loan states

| State | Calculation |
| --- | --- |
| Active | `returnedOn` is empty and today is on or before `agreedReturnOn` |
| Late | `returnedOn` is empty and today is after `agreedReturnOn` |
| Returned | `returnedOn` has a value |
| Returned late | Historical calculation: `returnedOn` is after `agreedReturnOn` |

Late is calculated from dates. Users never manually mark a loan late, and a
separate mutable `isLate` database field is unnecessary.

## Permissions

### Every signed-in member

- Read the complete lending list.
- List a physical box they own for lending.
- Request an available box belonging to another member.
- Read their own outgoing requests and loans.
- Ask for an extension on their own eligible active loan.

### Box owner

- Edit the lending information for their own box.
- View requests for their own box.
- Approve or reject a pending request for their own box.
- Record the start of a loan when an approved box is handed over.
- Record the return of their own box.
- Cannot approve or reject requests for another member's box.

### Committee member

- Has all normal member permissions.
- May record the return of any active loan when the owner is absent.
- Does **not** receive permission to approve/reject requests, edit another
  member's box, or start another member's loan from the case description.

Permission checks must be enforced by the backend, not only by hiding frontend
buttons.

## Business rules

### Competing requests

- Multiple requests for the same available box may be `pending` at once.
- Only its owner can approve one.
- Approval and rejection of every other pending request for that box must be one
  atomic backend operation.
- If two approval actions arrive concurrently, only one may succeed. The second
  receives a conflict response and the latest request states.

### Active-loan restrictions

- A box with an active loan cannot be lent or handed over again.
- New borrowing requests for that box must be blocked while it is out.
- An existing pending or approved request cannot start a second loan while the
  box is out.
- The box becomes available only after `returnedOn` is recorded.

### Late-loan calculation

- The agreed return day itself is still on time.
- The loan becomes late at the start of the following calendar day in the
  club's local timezone.
- Current calculation:
  `isLate = returnedOn is empty AND today > agreedReturnOn`.
- Historical calculation:
  `wasReturnedLate = returnedOn > agreedReturnOn`.
- The calculation must be performed by the system whenever the loan is read; no
  user sets a late status.

### Extension restrictions

- Only the borrower can initiate an extension request.
- The loan must be active and not yet late.
- A loan can be extended at most once.
- The new return date must be later than the current agreed return date.
- The new return date must be no later than
  `startedOn + configured maximum loan period`.
- A returned loan cannot be extended.
- An extension does not create a second loan.

## Invalid-action scenarios

At minimum, the following must be handled and tested:

1. **Non-owner approval:** a member tries to approve a request for somebody
   else's box. The backend rejects the action as forbidden and no status changes.
2. **Competing approval:** an owner tries to approve a second request after one
   request for the box is already approved. The backend returns a conflict; the
   first approval remains unchanged.
3. **Double lending:** a user tries to start a loan for a box with an active
   loan. The backend rejects it and no second loan is created.
4. **Late extension:** a borrower asks for an extension after the agreed return
   date. The action is rejected and the date is unchanged.
5. **Second extension:** a borrower tries to extend a loan whose
   `hasBeenExtended` value is already `true`. The action is rejected.
6. **Excessive return date:** the proposed return date exceeds the configured
   maximum measured from the original start date. The action is rejected.
7. **Unauthorised return:** a normal member who is neither the box owner nor a
   committee member tries to record the return. The action is forbidden.

## Open decisions

These details are not specified by the case and should be agreed with the
product owner before implementation:

- The numeric maximum loan period.
- Whether an extension needs owner approval and, if so, its additional statuses
  and timestamps.
- Whether borrowers may cancel pending requests.
- Whether an owner may remove a listed box while pending requests exist.
- Whether members may request their own boxes.
- Whether condition is free text only or also includes a fixed condition label.
