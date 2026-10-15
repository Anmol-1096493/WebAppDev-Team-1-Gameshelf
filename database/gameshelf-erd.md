# GameShelf ERD

```mermaid
erDiagram
    Members {
        uuid Id PK
        bool IsCommittee
        text Name
        text PasswordHash
        text UserName
    }
    Games {
        uuid Id PK
        text Category
        text Edition
        text ImageUrl "optional"
        text Language
        integer MaxPlayers
        integer MinPlayers
        integer PlayingTimeMinutes
        text Publisher
        integer ReleaseYear
        text Title
    }
    CollectionRecords {
        uuid Id PK
        uuid OwnerId FK
        uuid GameId FK
        integer Status
        integer PlayCount
        integer Rating "optional"
        text Note
    }
    Shelves {
        uuid Id PK
        uuid OwnerId FK
        text Name
        text Description
        bool IsPublic
    }
    ShelfGames {
        uuid ShelfId PK, FK
        uuid CollectionRecordId PK, FK
    }
    LendingBoxes {
        uuid Id PK
        uuid OwnerId FK
        uuid GameId FK
        integer Condition
        text ConditionDescription
    }
    LoanRequests {
        uuid Id PK
        uuid BoxId FK
        uuid RequesterId FK
        integer Status
        datetime CreatedAt
    }
    Loans {
        uuid Id PK
        uuid RequestId FK
        uuid BoxId FK
        uuid BorrowerId FK
        date StartedOn
        date DueOn
        bool IsExtended
        date ReturnedOn "optional"
        uuid ReturnRecordedById FK "optional"
    }
    Sessions {
        uuid Id PK
        integer Capacity
        uuid HostId FK
        bool IsCancelled
        text Place
        datetime StartAt
        text Title
    }
    Signups {
        uuid Id PK
        datetime CreatedAt
        uuid GameId FK "optional"
        uuid MemberId FK
        uuid SessionId FK
        integer Status
    }
    WishlistItems {
        uuid Id PK
        uuid OwnerId FK
        uuid GameId FK
        integer Priority
        text Note
        bool IsFulfilled
    }
    TradeOffers {
        uuid Id PK
        uuid WishlistItemId FK
        uuid OfferedById FK
        uuid RequestedGameId FK
        datetime CreatedAt
        integer Status
    }
    ClubPolicies {
        integer Id PK
        integer MaximumLoanDays
        integer OfferValidityDays
    }
    Members ||--o{ CollectionRecords : OwnerId
    Games ||--o{ CollectionRecords : GameId
    Members ||--o{ Shelves : OwnerId
    Shelves ||--o{ ShelfGames : ShelfId
    CollectionRecords ||--o{ ShelfGames : CollectionRecordId
    Members ||--o{ LendingBoxes : OwnerId
    Games ||--o{ LendingBoxes : GameId
    Members ||--o{ LoanRequests : RequesterId
    LendingBoxes ||--o{ LoanRequests : BoxId
    Members |o--o{ Loans : ReturnRecordedById
    Members ||--o{ Loans : BorrowerId
    LoanRequests ||--o| Loans : RequestId
    LendingBoxes ||--o{ Loans : BoxId
    Members ||--o{ Sessions : HostId
    Sessions ||--o{ Signups : SessionId
    Members ||--o{ Signups : MemberId
    Games |o--o{ Signups : GameId
    Members ||--o{ WishlistItems : OwnerId
    Games ||--o{ WishlistItems : GameId
    WishlistItems ||--o{ TradeOffers : WishlistItemId
    Members ||--o{ TradeOffers : OfferedById
    Games ||--o{ TradeOffers : RequestedGameId
```

PK = primaire sleutel; FK = vreemde sleutel; optional = het veld mag leeg zijn.
De 13 tabellen en relaties zijn gegenereerd uit `gameshelf-demo.db`. ClubPolicies bevat de clubtermijnen.
