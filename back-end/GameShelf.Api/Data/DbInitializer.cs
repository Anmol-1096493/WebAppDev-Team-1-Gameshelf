using GameShelf.Api.Models;
using GameShelf.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace GameShelf.Api.Data;

/// <summary>
/// Seeds the SQLite database the first time it is created. Every seeded member
/// shares the prototype password <c>gameshelf123</c>.
/// </summary>
public static class DbInitializer
{
    public const string DefaultPassword = "gameshelf123";

    public static async Task SeedAsync(GameShelfDbContext db)
    {
        await db.Database.EnsureCreatedAsync();

        if (await db.Members.AnyAsync()) return;

        var members = new[]
        {
            new Member { Id = Guid("00000000-0000-0000-0000-000000000001"), Name = "Jeffrey", UserName = "jeffrey", IsCommittee = true },
            new Member { Id = Guid("00000000-0000-0000-0000-000000000002"), Name = "Anmol", UserName = "anmol" },
            new Member { Id = Guid("00000000-0000-0000-0000-000000000003"), Name = "Sasha", UserName = "sasha" },
            new Member { Id = Guid("00000000-0000-0000-0000-000000000004"), Name = "Priya", UserName = "priya" },
            new Member { Id = Guid("00000000-0000-0000-0000-000000000005"), Name = "Liam", UserName = "liam" },
        };
        foreach (var m in members) m.PasswordHash = PasswordHasher.Hash(DefaultPassword);
        db.Members.AddRange(members);

        db.Games.AddRange(
            new Game { Id = Guid("10000000-0000-0000-0000-000000000001"), Title = "Catan", MinPlayers = 3, MaxPlayers = 4 },
            new Game { Id = Guid("10000000-0000-0000-0000-000000000002"), Title = "Codenames", MinPlayers = 4, MaxPlayers = 8 },
            new Game { Id = Guid("10000000-0000-0000-0000-000000000003"), Title = "Ticket to Ride", MinPlayers = 2, MaxPlayers = 5 },
            new Game { Id = Guid("10000000-0000-0000-0000-000000000004"), Title = "Dixit", MinPlayers = 3, MaxPlayers = 6 },
            new Game { Id = Guid("10000000-0000-0000-0000-000000000005"), Title = "Avalon", MinPlayers = 5, MaxPlayers = 10 }
        );

        await db.SaveChangesAsync();
    }

    private static Guid Guid(string s) => System.Guid.Parse(s);
}