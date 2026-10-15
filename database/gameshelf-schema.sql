-- Generated from gameshelf-demo.db: schema and migration metadata, without account/game data.
PRAGMA foreign_keys = ON;

CREATE TABLE "ClubPolicies" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK_ClubPolicies" PRIMARY KEY AUTOINCREMENT,
    "MaximumLoanDays" INTEGER NOT NULL,
    "OfferValidityDays" INTEGER NOT NULL,
    CONSTRAINT "CK_ClubPolicies_Limits" CHECK ("Id" = 1 AND "MaximumLoanDays" > 0 AND "OfferValidityDays" > 0)
);

CREATE TABLE "CollectionRecords" (
    "Id" TEXT NOT NULL CONSTRAINT "PK_CollectionRecords" PRIMARY KEY,
    "OwnerId" TEXT NOT NULL,
    "GameId" TEXT NOT NULL,
    "Status" INTEGER NOT NULL,
    "PlayCount" INTEGER NOT NULL,
    "Rating" INTEGER NULL,
    "Note" TEXT NOT NULL,
    CONSTRAINT "CK_CollectionRecords_Plays" CHECK ("PlayCount" >= 0),
    CONSTRAINT "CK_CollectionRecords_Rating" CHECK ("Rating" IS NULL OR ("Rating" BETWEEN 1 AND 10 AND "Status" = 2 AND "PlayCount" > 0)),
    CONSTRAINT "CK_CollectionRecords_Status" CHECK ("Status" IN (0, 1, 2)),
    CONSTRAINT "FK_CollectionRecords_Games_GameId" FOREIGN KEY ("GameId") REFERENCES "Games" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_CollectionRecords_Members_OwnerId" FOREIGN KEY ("OwnerId") REFERENCES "Members" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "Games" (
    "Id" TEXT NOT NULL CONSTRAINT "PK_Games" PRIMARY KEY,
    "Category" TEXT NOT NULL,
    "Edition" TEXT NOT NULL,
    "ImageUrl" TEXT NULL,
    "Language" TEXT NOT NULL,
    "MaxPlayers" INTEGER NOT NULL,
    "MinPlayers" INTEGER NOT NULL,
    "PlayingTimeMinutes" INTEGER NOT NULL,
    "Publisher" TEXT NOT NULL,
    "ReleaseYear" INTEGER NOT NULL,
    "Title" TEXT NOT NULL,
    CONSTRAINT "CK_Games_Metadata" CHECK (length(trim("Title")) > 0 AND "PlayingTimeMinutes" >= 0 AND "ReleaseYear" BETWEEN 0 AND 9999),
    CONSTRAINT "CK_Games_Players" CHECK ("MinPlayers" >= 1 AND "MaxPlayers" >= "MinPlayers")
);

CREATE TABLE "LendingBoxes" (
    "Id" TEXT NOT NULL CONSTRAINT "PK_LendingBoxes" PRIMARY KEY,
    "OwnerId" TEXT NOT NULL,
    "GameId" TEXT NOT NULL,
    "Condition" INTEGER NOT NULL,
    "ConditionDescription" TEXT NOT NULL,
    CONSTRAINT "CK_LendingBoxes_Condition" CHECK ("Condition" IN (0, 1, 2, 3)),
    CONSTRAINT "FK_LendingBoxes_Games_GameId" FOREIGN KEY ("GameId") REFERENCES "Games" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_LendingBoxes_Members_OwnerId" FOREIGN KEY ("OwnerId") REFERENCES "Members" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "LoanRequests" (
    "Id" TEXT NOT NULL CONSTRAINT "PK_LoanRequests" PRIMARY KEY,
    "BoxId" TEXT NOT NULL,
    "RequesterId" TEXT NOT NULL,
    "Status" INTEGER NOT NULL,
    "CreatedAt" TEXT NOT NULL,
    CONSTRAINT "CK_LoanRequests_Status" CHECK ("Status" IN (0, 1, 2)),
    CONSTRAINT "FK_LoanRequests_LendingBoxes_BoxId" FOREIGN KEY ("BoxId") REFERENCES "LendingBoxes" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_LoanRequests_Members_RequesterId" FOREIGN KEY ("RequesterId") REFERENCES "Members" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "Loans" (
    "Id" TEXT NOT NULL CONSTRAINT "PK_Loans" PRIMARY KEY,
    "RequestId" TEXT NOT NULL,
    "BoxId" TEXT NOT NULL,
    "BorrowerId" TEXT NOT NULL,
    "StartedOn" TEXT NOT NULL,
    "DueOn" TEXT NOT NULL,
    "IsExtended" INTEGER NOT NULL,
    "ReturnedOn" TEXT NULL,
    "ReturnRecordedById" TEXT NULL,
    CONSTRAINT "CK_Loans_Dates" CHECK ("DueOn" >= "StartedOn" AND ("ReturnedOn" IS NULL OR "ReturnedOn" >= "StartedOn")),
    CONSTRAINT "CK_Loans_Return" CHECK (("ReturnedOn" IS NULL AND "ReturnRecordedById" IS NULL) OR ("ReturnedOn" IS NOT NULL AND "ReturnRecordedById" IS NOT NULL)),
    CONSTRAINT "FK_Loans_LendingBoxes_BoxId" FOREIGN KEY ("BoxId") REFERENCES "LendingBoxes" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Loans_LoanRequests_RequestId" FOREIGN KEY ("RequestId") REFERENCES "LoanRequests" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Loans_Members_BorrowerId" FOREIGN KEY ("BorrowerId") REFERENCES "Members" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Loans_Members_ReturnRecordedById" FOREIGN KEY ("ReturnRecordedById") REFERENCES "Members" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "Members" (
    "Id" TEXT NOT NULL CONSTRAINT "PK_Members" PRIMARY KEY,
    "IsCommittee" INTEGER NOT NULL,
    "Name" TEXT NOT NULL,
    "PasswordHash" TEXT NOT NULL,
    "UserName" TEXT COLLATE NOCASE NOT NULL,
    CONSTRAINT "CK_Members_Identity" CHECK (length(trim("Name")) > 0 AND length(trim("UserName")) > 0 AND length("PasswordHash") > 0)
);

CREATE TABLE "Sessions" (
    "Id" TEXT NOT NULL CONSTRAINT "PK_Sessions" PRIMARY KEY,
    "Capacity" INTEGER NOT NULL,
    "HostId" TEXT NOT NULL,
    "IsCancelled" INTEGER NOT NULL,
    "Place" TEXT NOT NULL,
    "StartAt" TEXT NOT NULL,
    "Title" TEXT NOT NULL,
    CONSTRAINT "CK_Sessions_Details" CHECK ("Capacity" >= 1 AND length(trim("Title")) > 0 AND length(trim("Place")) > 0),
    CONSTRAINT "FK_Sessions_Members_HostId" FOREIGN KEY ("HostId") REFERENCES "Members" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "ShelfGames" (
    "ShelfId" TEXT NOT NULL,
    "CollectionRecordId" TEXT NOT NULL,
    CONSTRAINT "PK_ShelfGames" PRIMARY KEY ("ShelfId", "CollectionRecordId"),
    CONSTRAINT "FK_ShelfGames_CollectionRecords_CollectionRecordId" FOREIGN KEY ("CollectionRecordId") REFERENCES "CollectionRecords" ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_ShelfGames_Shelves_ShelfId" FOREIGN KEY ("ShelfId") REFERENCES "Shelves" ("Id") ON DELETE CASCADE
);

CREATE TABLE "Shelves" (
    "Id" TEXT NOT NULL CONSTRAINT "PK_Shelves" PRIMARY KEY,
    "OwnerId" TEXT NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "IsPublic" INTEGER NOT NULL,
    CONSTRAINT "CK_Shelves_Name" CHECK (length(trim("Name")) > 0),
    CONSTRAINT "FK_Shelves_Members_OwnerId" FOREIGN KEY ("OwnerId") REFERENCES "Members" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "Signups" (
    "Id" TEXT NOT NULL CONSTRAINT "PK_Signups" PRIMARY KEY,
    "CreatedAt" TEXT NOT NULL,
    "GameId" TEXT NULL,
    "MemberId" TEXT NOT NULL,
    "SessionId" TEXT NOT NULL,
    "Status" INTEGER NOT NULL,
    CONSTRAINT "CK_Signups_Status" CHECK ("Status" IN (0, 1)),
    CONSTRAINT "FK_Signups_Games_GameId" FOREIGN KEY ("GameId") REFERENCES "Games" ("Id") ON DELETE SET NULL,
    CONSTRAINT "FK_Signups_Members_MemberId" FOREIGN KEY ("MemberId") REFERENCES "Members" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_Signups_Sessions_SessionId" FOREIGN KEY ("SessionId") REFERENCES "Sessions" ("Id") ON DELETE CASCADE
);

CREATE TABLE "TradeOffers" (
    "Id" TEXT NOT NULL CONSTRAINT "PK_TradeOffers" PRIMARY KEY,
    "WishlistItemId" TEXT NOT NULL,
    "OfferedById" TEXT NOT NULL,
    "RequestedGameId" TEXT NOT NULL,
    "CreatedAt" TEXT NOT NULL,
    "Status" INTEGER NOT NULL,
    CONSTRAINT "CK_TradeOffers_Status" CHECK ("Status" IN (0, 1, 2, 3)),
    CONSTRAINT "FK_TradeOffers_Games_RequestedGameId" FOREIGN KEY ("RequestedGameId") REFERENCES "Games" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_TradeOffers_Members_OfferedById" FOREIGN KEY ("OfferedById") REFERENCES "Members" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_TradeOffers_WishlistItems_WishlistItemId" FOREIGN KEY ("WishlistItemId") REFERENCES "WishlistItems" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "WishlistItems" (
    "Id" TEXT NOT NULL CONSTRAINT "PK_WishlistItems" PRIMARY KEY,
    "OwnerId" TEXT NOT NULL,
    "GameId" TEXT NOT NULL,
    "Priority" INTEGER NOT NULL,
    "Note" TEXT NOT NULL,
    "IsFulfilled" INTEGER NOT NULL,
    CONSTRAINT "CK_WishlistItems_Priority" CHECK ("Priority" IN (0, 1, 2)),
    CONSTRAINT "FK_WishlistItems_Games_GameId" FOREIGN KEY ("GameId") REFERENCES "Games" ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_WishlistItems_Members_OwnerId" FOREIGN KEY ("OwnerId") REFERENCES "Members" ("Id") ON DELETE RESTRICT
);

CREATE TABLE "__EFMigrationsHistory" (
    "MigrationId" TEXT NOT NULL CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY,
    "ProductVersion" TEXT NOT NULL
);

CREATE TABLE "__EFMigrationsLock" (
    "Id" INTEGER NOT NULL CONSTRAINT "PK___EFMigrationsLock" PRIMARY KEY,
    "Timestamp" TEXT NOT NULL
);

CREATE TABLE "__GameShelfSeedHistory" (
    "Key" TEXT NOT NULL PRIMARY KEY, "AppliedAt" TEXT NOT NULL
);

CREATE INDEX "IX_CollectionRecords_GameId" ON "CollectionRecords" ("GameId");

CREATE UNIQUE INDEX "IX_CollectionRecords_OwnerId_GameId" ON "CollectionRecords" ("OwnerId", "GameId");

CREATE UNIQUE INDEX "IX_Games_Title_Publisher_ReleaseYear_Language_Edition" ON "Games" ("Title", "Publisher", "ReleaseYear", "Language", "Edition");

CREATE INDEX "IX_LendingBoxes_GameId" ON "LendingBoxes" ("GameId");

CREATE INDEX "IX_LendingBoxes_OwnerId" ON "LendingBoxes" ("OwnerId");

CREATE UNIQUE INDEX "IX_LoanRequests_BoxId_RequesterId" ON "LoanRequests" ("BoxId", "RequesterId") WHERE "Status" = 0;

CREATE INDEX "IX_LoanRequests_RequesterId" ON "LoanRequests" ("RequesterId");

CREATE INDEX "IX_Loans_BorrowerId" ON "Loans" ("BorrowerId");

CREATE UNIQUE INDEX "IX_Loans_BoxId" ON "Loans" ("BoxId") WHERE "ReturnedOn" IS NULL;

CREATE UNIQUE INDEX "IX_Loans_RequestId" ON "Loans" ("RequestId");

CREATE INDEX "IX_Loans_ReturnRecordedById" ON "Loans" ("ReturnRecordedById");

CREATE UNIQUE INDEX "IX_Members_UserName" ON "Members" ("UserName");

CREATE INDEX "IX_Sessions_HostId" ON "Sessions" ("HostId");

CREATE INDEX "IX_ShelfGames_CollectionRecordId" ON "ShelfGames" ("CollectionRecordId");

CREATE INDEX "IX_Shelves_OwnerId" ON "Shelves" ("OwnerId");

CREATE INDEX "IX_Signups_GameId" ON "Signups" ("GameId");

CREATE INDEX "IX_Signups_MemberId" ON "Signups" ("MemberId");

CREATE UNIQUE INDEX "IX_Signups_SessionId_MemberId" ON "Signups" ("SessionId", "MemberId");

CREATE INDEX "IX_TradeOffers_OfferedById" ON "TradeOffers" ("OfferedById");

CREATE INDEX "IX_TradeOffers_RequestedGameId" ON "TradeOffers" ("RequestedGameId");

CREATE INDEX "IX_TradeOffers_WishlistItemId_Status" ON "TradeOffers" ("WishlistItemId", "Status");

CREATE INDEX "IX_WishlistItems_GameId" ON "WishlistItems" ("GameId");

CREATE UNIQUE INDEX "IX_WishlistItems_OwnerId_GameId" ON "WishlistItems" ("OwnerId", "GameId");

INSERT INTO "__EFMigrationsHistory" VALUES ('20261008112653_SessionBaseline', '10.0.0');
INSERT INTO "__EFMigrationsHistory" VALUES ('20261008112918_CompleteClubSchema', '10.0.0');
