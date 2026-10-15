using GameShelf.Api.Models;
using GameShelf.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace GameShelf.Api.Data;

/// <summary>Upgrades the schema and adds demo data without deleting existing sessions.</summary>
public static class DbInitializer
{
    public const string DefaultPassword = "Admin001";

    public static async Task SeedAsync(GameShelfDbContext db)
    {
        await DatabaseUpgrade.ApplyAsync(db);
        // Track the requested password reset separately from the business tables.
        await db.Database.ExecuteSqlRawAsync("""
            CREATE TABLE IF NOT EXISTS "__GameShelfSeedHistory" (
                "Key" TEXT NOT NULL PRIMARY KEY, "AppliedAt" TEXT NOT NULL
            );
            """);
        await using var transaction = await db.Database.BeginTransactionAsync();
        var passwordsInitialized = await db.Database
            .SqlQueryRaw<string>("SELECT \"Key\" AS \"Value\" FROM \"__GameShelfSeedHistory\" WHERE \"Key\" = 'club-demo-v1'")
            .AnyAsync();
        if (passwordsInitialized)
        {
            // A restart must not recreate demo records that a member has intentionally removed.
            await transaction.CommitAsync();
            return;
        }

        var memberDefinitions = new (string Name, string UserName, bool Committee)[]
        {
            ("Jeffrey", "jeffrey", true), ("Anmol", "anmol", false), ("Sasha", "sasha", false),
            ("Priya", "priya", false), ("Liam", "liam", false), ("Artur", "artur", false),
            ("Sanne", "sanne", false), ("Mark", "mark", false), ("Lisa", "lisa", false),
            ("Tom", "tom", false), ("Eva", "eva", false)
        };
        var members = await db.Members.ToListAsync();
        for (var i = 0; i < memberDefinitions.Length; i++)
        {
            var definition = memberDefinitions[i];
            if (members.Any(m => m.UserName.Equals(definition.UserName, StringComparison.OrdinalIgnoreCase))) continue;
            var member = new Member
            {
                Id = Id(0, i + 1), Name = definition.Name, UserName = definition.UserName,
                IsCommittee = definition.Committee, PasswordHash = PasswordHasher.Hash(DefaultPassword)
            };
            db.Members.Add(member);
            members.Add(member);
        }
        // Reset all existing accounts once; every hash gets a different random salt.
        foreach (var member in members) member.PasswordHash = PasswordHasher.Hash(DefaultPassword);
        await db.SaveChangesAsync();

        var games = await db.Games.ToListAsync();
        var definitions = new (string Title, string Publisher, int Year, string Category, int Min, int Max, int Minutes, string? Image)[]
        {
            ("Catan", "Kosmos", 2015, "Strategy", 3, 4, 90, "catan.svg"),
            ("Codenames", "Czech Games Edition", 2015, "Party", 4, 8, 15, "codenames.svg"),
            ("Ticket to Ride", "Days of Wonder", 2004, "Family", 2, 5, 60, "ticket-to-ride.svg"),
            ("Dixit", "Libellud", 2008, "Party", 3, 6, 30, null),
            ("Avalon", "Indie Boards & Cards", 2012, "Social deduction", 5, 10, 30, null),
            ("Azul", "Next Move Games", 2017, "Abstract", 2, 4, 45, "azul.svg"),
            ("Carcassonne", "Hans im Gluck", 2021, "Family", 2, 5, 45, "carcassonne.svg"),
            ("Splendor", "Space Cowboys", 2014, "Strategy", 2, 4, 30, "splendor.svg"),
            ("Cascadia", "Flatout Games", 2021, "Family", 1, 4, 45, null),
            ("Wingspan", "Stonemaier Games", 2019, "Strategy", 1, 5, 70, null)
        };
        for (var i = 0; i < definitions.Length; i++)
        {
            var definition = definitions[i];
            var game = games.FirstOrDefault(g => g.Id == Id(1, i + 1));
            if (game is null)
            {
                game = new Game { Id = Id(1, i + 1), Title = definition.Title, MinPlayers = definition.Min, MaxPlayers = definition.Max };
                db.Games.Add(game);
                games.Add(game);
            }
            // Only fill new metadata columns; keep existing game IDs and player ranges.
            if (string.IsNullOrWhiteSpace(game.Publisher)) game.Publisher = definition.Publisher;
            if (game.ReleaseYear == 0) game.ReleaseYear = definition.Year;
            if (string.IsNullOrWhiteSpace(game.Category)) game.Category = definition.Category;
            if (string.IsNullOrWhiteSpace(game.Language)) game.Language = "English";
            if (string.IsNullOrWhiteSpace(game.Edition)) game.Edition = "Standard edition";
            if (game.PlayingTimeMinutes == 0) game.PlayingTimeMinutes = definition.Minutes;
            if (game.ImageUrl is null && definition.Image is not null) game.ImageUrl = $"/game-images/{definition.Image}";
        }
        if (!games.Any(g => g.Id == Id(1, 11)))
            db.Games.Add(new Game { Id = Id(1, 11), Title = "Catan", Publisher = "999 Games", ReleaseYear = 2015,
                Category = "Strategy", Language = "Dutch", Edition = "Standard edition", MinPlayers = 3,
                MaxPlayers = 4, PlayingTimeMinutes = 90, ImageUrl = "/game-images/catan.svg" });
        if (!await db.ClubPolicies.AnyAsync()) db.ClubPolicies.Add(new ClubPolicy());
        await db.SaveChangesAsync();

        Guid MemberId(string userName) => members.Single(m => m.UserName.Equals(userName, StringComparison.OrdinalIgnoreCase)).Id;
        var now = DateTimeOffset.UtcNow;
        var today = DateOnly.FromDateTime(now.UtcDateTime);

        if (!await db.CollectionRecords.AnyAsync())
        {
            db.CollectionRecords.AddRange(
                Record(1, MemberId("jeffrey"), 6, CollectionStatus.Played, 12, 9, "Great game for smaller groups."),
                Record(2, MemberId("jeffrey"), 7, CollectionStatus.Played, 8, 8, "Easy to teach."),
                Record(3, MemberId("jeffrey"), 1, CollectionStatus.InProgress, 0, null, "Still learning the strategies."),
                Record(4, MemberId("jeffrey"), 2, CollectionStatus.NotPlayed, 0, null, "Waiting for game night."),
                Record(5, MemberId("jeffrey"), 8, CollectionStatus.Played, 6, 8, "A quick game for two."),
                Record(6, MemberId("jeffrey"), 3, CollectionStatus.InProgress, 0, null, "Planning to play again."),
                Record(7, MemberId("sanne"), 6, CollectionStatus.Played, 12, 9, "English edition, complete."));
            db.Shelves.AddRange(
                new Shelf { Id = Id(3, 1), OwnerId = MemberId("jeffrey"), Name = "Game Night Favorites", Description = "For relaxed game nights.", IsPublic = true },
                new Shelf { Id = Id(3, 2), OwnerId = MemberId("jeffrey"), Name = "Two Player Games", Description = "Great games for two.", IsPublic = false },
                new Shelf { Id = Id(3, 3), OwnerId = MemberId("jeffrey"), Name = "Games to Learn", Description = "Games to try next.", IsPublic = false });
            db.ShelfGames.AddRange(
                new ShelfGame { ShelfId = Id(3, 1), CollectionRecordId = Id(2, 1) },
                new ShelfGame { ShelfId = Id(3, 1), CollectionRecordId = Id(2, 3) },
                new ShelfGame { ShelfId = Id(3, 1), CollectionRecordId = Id(2, 5) },
                new ShelfGame { ShelfId = Id(3, 2), CollectionRecordId = Id(2, 1) },
                new ShelfGame { ShelfId = Id(3, 2), CollectionRecordId = Id(2, 5) },
                new ShelfGame { ShelfId = Id(3, 3), CollectionRecordId = Id(2, 4) });
        }
        if (!await db.LendingBoxes.AnyAsync())
        {
            db.LendingBoxes.AddRange(
                Box(1, MemberId("sanne"), 1, BoxCondition.AsNew, "Complete; cards are sleeved."),
                Box(2, MemberId("mark"), 7, BoxCondition.Good, "Light shelf wear."),
                Box(3, MemberId("lisa"), 8, BoxCondition.AsNew, "Complete and barely played."),
                Box(4, MemberId("tom"), 6, BoxCondition.Good, "Some tiles show signs of use."),
                Box(5, MemberId("jeffrey"), 3, BoxCondition.Used, "One replacement score marker."),
                Box(6, MemberId("eva"), 2, BoxCondition.Worn, "Complete, with worn cards and box."));
            db.LoanRequests.AddRange(
                new LoanRequest { Id = Id(5, 1), BoxId = Id(4, 3), RequesterId = MemberId("anmol"), Status = LoanRequestStatus.Approved, CreatedAt = now.AddDays(-5) },
                new LoanRequest { Id = Id(5, 2), BoxId = Id(4, 5), RequesterId = MemberId("sasha"), Status = LoanRequestStatus.Approved, CreatedAt = now.AddDays(-4) },
                new LoanRequest { Id = Id(5, 3), BoxId = Id(4, 1), RequesterId = MemberId("priya"), Status = LoanRequestStatus.Pending, CreatedAt = now });
            db.Loans.AddRange(
                new Loan { Id = Id(6, 1), RequestId = Id(5, 1), BoxId = Id(4, 3), BorrowerId = MemberId("anmol"), StartedOn = today.AddDays(-4), DueOn = today.AddDays(10) },
                new Loan { Id = Id(6, 2), RequestId = Id(5, 2), BoxId = Id(4, 5), BorrowerId = MemberId("sasha"), StartedOn = today.AddDays(-3), DueOn = today.AddDays(11) });
        }
        if (!await db.WishlistItems.AnyAsync())
        {
            db.WishlistItems.AddRange(
                new WishlistItem { Id = Id(7, 1), OwnerId = MemberId("jeffrey"), GameId = Id(1, 9), Priority = WishPriority.High, Note = "English edition, complete." },
                new WishlistItem { Id = Id(7, 2), OwnerId = MemberId("anmol"), GameId = Id(1, 6), Priority = WishPriority.Medium, Note = "A used box is fine." });
            db.TradeOffers.Add(new TradeOffer { Id = Id(8, 1), WishlistItemId = Id(7, 1), OfferedById = MemberId("priya"), RequestedGameId = Id(1, 1), CreatedAt = now, Status = TradeOfferStatus.Open });
        }
        if (!await db.Sessions.AnyAsync())
        {
            var session = new Session { Id = Id(9, 1), HostId = MemberId("jeffrey"), Title = "Club game night",
                StartAt = new DateTimeOffset(now.UtcDateTime.Date.AddDays(3).AddHours(17), TimeSpan.Zero), Place = "Club room", Capacity = 2 };
            db.Sessions.Add(session);
            db.Signups.AddRange(
                new Signup { Id = Id(9, 2), SessionId = session.Id, MemberId = MemberId("anmol"), Status = SignupStatus.Confirmed, CreatedAt = now.AddMinutes(-30), GameId = Id(1, 3) },
                new Signup { Id = Id(9, 3), SessionId = session.Id, MemberId = MemberId("sasha"), Status = SignupStatus.Confirmed, CreatedAt = now.AddMinutes(-20) },
                new Signup { Id = Id(9, 4), SessionId = session.Id, MemberId = MemberId("priya"), Status = SignupStatus.Waiting, CreatedAt = now.AddMinutes(-10) });
        }
        await db.SaveChangesAsync();
        await db.Database.ExecuteSqlRawAsync(
            "INSERT INTO \"__GameShelfSeedHistory\" (\"Key\", \"AppliedAt\") VALUES ('club-demo-v1', {0})", now.ToString("O"));
        await transaction.CommitAsync();
    }

    private static Guid Id(int group, int number) => Guid.Parse($"{group}0000000-0000-0000-0000-{number:000000000000}");
    private static CollectionRecord Record(int number, Guid owner, int game, CollectionStatus status, int plays, int? rating, string note)
        => new() { Id = Id(2, number), OwnerId = owner, GameId = Id(1, game), Status = status, PlayCount = plays, Rating = rating, Note = note };
    private static LendingBox Box(int number, Guid owner, int game, BoxCondition condition, string description)
        => new() { Id = Id(4, number), OwnerId = owner, GameId = Id(1, game), Condition = condition, ConditionDescription = description };
}
