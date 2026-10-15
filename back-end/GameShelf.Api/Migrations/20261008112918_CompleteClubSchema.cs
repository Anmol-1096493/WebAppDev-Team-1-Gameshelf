using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameShelf.Api.Migrations
{
    /// <inheritdoc />
    public partial class CompleteClubSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Signups_SessionId",
                table: "Signups");

            migrationBuilder.AlterColumn<string>(
                name: "UserName",
                table: "Members",
                type: "TEXT",
                nullable: false,
                collation: "NOCASE",
                oldClrType: typeof(string),
                oldType: "TEXT");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Games",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Edition",
                table: "Games",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Games",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Language",
                table: "Games",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PlayingTimeMinutes",
                table: "Games",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Publisher",
                table: "Games",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ReleaseYear",
                table: "Games",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "ClubPolicies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    MaximumLoanDays = table.Column<int>(type: "INTEGER", nullable: false),
                    OfferValidityDays = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClubPolicies", x => x.Id);
                    table.CheckConstraint("CK_ClubPolicies_Limits", "\"Id\" = 1 AND \"MaximumLoanDays\" > 0 AND \"OfferValidityDays\" > 0");
                });

            migrationBuilder.CreateTable(
                name: "CollectionRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    OwnerId = table.Column<Guid>(type: "TEXT", nullable: false),
                    GameId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    PlayCount = table.Column<int>(type: "INTEGER", nullable: false),
                    Rating = table.Column<int>(type: "INTEGER", nullable: true),
                    Note = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CollectionRecords", x => x.Id);
                    table.CheckConstraint("CK_CollectionRecords_Plays", "\"PlayCount\" >= 0");
                    table.CheckConstraint("CK_CollectionRecords_Rating", "\"Rating\" IS NULL OR (\"Rating\" BETWEEN 1 AND 10 AND \"Status\" = 2 AND \"PlayCount\" > 0)");
                    table.CheckConstraint("CK_CollectionRecords_Status", "\"Status\" IN (0, 1, 2)");
                    table.ForeignKey(
                        name: "FK_CollectionRecords_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CollectionRecords_Members_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LendingBoxes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    OwnerId = table.Column<Guid>(type: "TEXT", nullable: false),
                    GameId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Condition = table.Column<int>(type: "INTEGER", nullable: false),
                    ConditionDescription = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LendingBoxes", x => x.Id);
                    table.CheckConstraint("CK_LendingBoxes_Condition", "\"Condition\" IN (0, 1, 2, 3)");
                    table.ForeignKey(
                        name: "FK_LendingBoxes_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LendingBoxes_Members_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Shelves",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    OwnerId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    IsPublic = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shelves", x => x.Id);
                    table.CheckConstraint("CK_Shelves_Name", "length(trim(\"Name\")) > 0");
                    table.ForeignKey(
                        name: "FK_Shelves_Members_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WishlistItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    OwnerId = table.Column<Guid>(type: "TEXT", nullable: false),
                    GameId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Priority = table.Column<int>(type: "INTEGER", nullable: false),
                    Note = table.Column<string>(type: "TEXT", nullable: false),
                    IsFulfilled = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WishlistItems", x => x.Id);
                    table.CheckConstraint("CK_WishlistItems_Priority", "\"Priority\" IN (0, 1, 2)");
                    table.ForeignKey(
                        name: "FK_WishlistItems_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WishlistItems_Members_OwnerId",
                        column: x => x.OwnerId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LoanRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    BoxId = table.Column<Guid>(type: "TEXT", nullable: false),
                    RequesterId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoanRequests", x => x.Id);
                    table.CheckConstraint("CK_LoanRequests_Status", "\"Status\" IN (0, 1, 2)");
                    table.ForeignKey(
                        name: "FK_LoanRequests_LendingBoxes_BoxId",
                        column: x => x.BoxId,
                        principalTable: "LendingBoxes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoanRequests_Members_RequesterId",
                        column: x => x.RequesterId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ShelfGames",
                columns: table => new
                {
                    ShelfId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CollectionRecordId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShelfGames", x => new { x.ShelfId, x.CollectionRecordId });
                    table.ForeignKey(
                        name: "FK_ShelfGames_CollectionRecords_CollectionRecordId",
                        column: x => x.CollectionRecordId,
                        principalTable: "CollectionRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ShelfGames_Shelves_ShelfId",
                        column: x => x.ShelfId,
                        principalTable: "Shelves",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TradeOffers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    WishlistItemId = table.Column<Guid>(type: "TEXT", nullable: false),
                    OfferedById = table.Column<Guid>(type: "TEXT", nullable: false),
                    RequestedGameId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TradeOffers", x => x.Id);
                    table.CheckConstraint("CK_TradeOffers_Status", "\"Status\" IN (0, 1, 2, 3)");
                    table.ForeignKey(
                        name: "FK_TradeOffers_Games_RequestedGameId",
                        column: x => x.RequestedGameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TradeOffers_Members_OfferedById",
                        column: x => x.OfferedById,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TradeOffers_WishlistItems_WishlistItemId",
                        column: x => x.WishlistItemId,
                        principalTable: "WishlistItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Loans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    RequestId = table.Column<Guid>(type: "TEXT", nullable: false),
                    BoxId = table.Column<Guid>(type: "TEXT", nullable: false),
                    BorrowerId = table.Column<Guid>(type: "TEXT", nullable: false),
                    StartedOn = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    DueOn = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    IsExtended = table.Column<bool>(type: "INTEGER", nullable: false),
                    ReturnedOn = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    ReturnRecordedById = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Loans", x => x.Id);
                    table.CheckConstraint("CK_Loans_Dates", "\"DueOn\" >= \"StartedOn\" AND (\"ReturnedOn\" IS NULL OR \"ReturnedOn\" >= \"StartedOn\")");
                    table.CheckConstraint("CK_Loans_Return", "(\"ReturnedOn\" IS NULL AND \"ReturnRecordedById\" IS NULL) OR (\"ReturnedOn\" IS NOT NULL AND \"ReturnRecordedById\" IS NOT NULL)");
                    table.ForeignKey(
                        name: "FK_Loans_LendingBoxes_BoxId",
                        column: x => x.BoxId,
                        principalTable: "LendingBoxes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Loans_LoanRequests_RequestId",
                        column: x => x.RequestId,
                        principalTable: "LoanRequests",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Loans_Members_BorrowerId",
                        column: x => x.BorrowerId,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Loans_Members_ReturnRecordedById",
                        column: x => x.ReturnRecordedById,
                        principalTable: "Members",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Signups_SessionId_MemberId",
                table: "Signups",
                columns: new[] { "SessionId", "MemberId" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Signups_Status",
                table: "Signups",
                sql: "\"Status\" IN (0, 1)");

            migrationBuilder.CreateIndex(
                name: "IX_Sessions_HostId",
                table: "Sessions",
                column: "HostId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Sessions_Details",
                table: "Sessions",
                sql: "\"Capacity\" >= 1 AND length(trim(\"Title\")) > 0 AND length(trim(\"Place\")) > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Members_Identity",
                table: "Members",
                sql: "length(trim(\"Name\")) > 0 AND length(trim(\"UserName\")) > 0 AND length(\"PasswordHash\") > 0");

            migrationBuilder.CreateIndex(
                name: "IX_Games_Title_Publisher_ReleaseYear_Language_Edition",
                table: "Games",
                columns: new[] { "Title", "Publisher", "ReleaseYear", "Language", "Edition" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_Games_Metadata",
                table: "Games",
                sql: "length(trim(\"Title\")) > 0 AND \"PlayingTimeMinutes\" >= 0 AND \"ReleaseYear\" BETWEEN 0 AND 9999");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Games_Players",
                table: "Games",
                sql: "\"MinPlayers\" >= 1 AND \"MaxPlayers\" >= \"MinPlayers\"");

            migrationBuilder.CreateIndex(
                name: "IX_CollectionRecords_GameId",
                table: "CollectionRecords",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_CollectionRecords_OwnerId_GameId",
                table: "CollectionRecords",
                columns: new[] { "OwnerId", "GameId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LendingBoxes_GameId",
                table: "LendingBoxes",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_LendingBoxes_OwnerId",
                table: "LendingBoxes",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_LoanRequests_BoxId_RequesterId",
                table: "LoanRequests",
                columns: new[] { "BoxId", "RequesterId" },
                unique: true,
                filter: "\"Status\" = 0");

            migrationBuilder.CreateIndex(
                name: "IX_LoanRequests_RequesterId",
                table: "LoanRequests",
                column: "RequesterId");

            migrationBuilder.CreateIndex(
                name: "IX_Loans_BorrowerId",
                table: "Loans",
                column: "BorrowerId");

            migrationBuilder.CreateIndex(
                name: "IX_Loans_BoxId",
                table: "Loans",
                column: "BoxId",
                unique: true,
                filter: "\"ReturnedOn\" IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Loans_RequestId",
                table: "Loans",
                column: "RequestId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Loans_ReturnRecordedById",
                table: "Loans",
                column: "ReturnRecordedById");

            migrationBuilder.CreateIndex(
                name: "IX_ShelfGames_CollectionRecordId",
                table: "ShelfGames",
                column: "CollectionRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_Shelves_OwnerId",
                table: "Shelves",
                column: "OwnerId");

            migrationBuilder.CreateIndex(
                name: "IX_TradeOffers_OfferedById",
                table: "TradeOffers",
                column: "OfferedById");

            migrationBuilder.CreateIndex(
                name: "IX_TradeOffers_RequestedGameId",
                table: "TradeOffers",
                column: "RequestedGameId");

            migrationBuilder.CreateIndex(
                name: "IX_TradeOffers_WishlistItemId_Status",
                table: "TradeOffers",
                columns: new[] { "WishlistItemId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_WishlistItems_GameId",
                table: "WishlistItems",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_WishlistItems_OwnerId_GameId",
                table: "WishlistItems",
                columns: new[] { "OwnerId", "GameId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Sessions_Members_HostId",
                table: "Sessions",
                column: "HostId",
                principalTable: "Members",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Sessions_Members_HostId",
                table: "Sessions");

            migrationBuilder.DropTable(
                name: "ClubPolicies");

            migrationBuilder.DropTable(
                name: "Loans");

            migrationBuilder.DropTable(
                name: "ShelfGames");

            migrationBuilder.DropTable(
                name: "TradeOffers");

            migrationBuilder.DropTable(
                name: "LoanRequests");

            migrationBuilder.DropTable(
                name: "CollectionRecords");

            migrationBuilder.DropTable(
                name: "Shelves");

            migrationBuilder.DropTable(
                name: "WishlistItems");

            migrationBuilder.DropTable(
                name: "LendingBoxes");

            migrationBuilder.DropIndex(
                name: "IX_Signups_SessionId_MemberId",
                table: "Signups");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Signups_Status",
                table: "Signups");

            migrationBuilder.DropIndex(
                name: "IX_Sessions_HostId",
                table: "Sessions");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Sessions_Details",
                table: "Sessions");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Members_Identity",
                table: "Members");

            migrationBuilder.DropIndex(
                name: "IX_Games_Title_Publisher_ReleaseYear_Language_Edition",
                table: "Games");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Games_Metadata",
                table: "Games");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Games_Players",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Edition",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Language",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "PlayingTimeMinutes",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Publisher",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "ReleaseYear",
                table: "Games");

            migrationBuilder.AlterColumn<string>(
                name: "UserName",
                table: "Members",
                type: "TEXT",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "TEXT",
                oldCollation: "NOCASE");

            migrationBuilder.CreateIndex(
                name: "IX_Signups_SessionId",
                table: "Signups",
                column: "SessionId");
        }
    }
}
