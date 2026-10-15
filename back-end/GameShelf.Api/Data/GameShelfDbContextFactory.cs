using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace GameShelf.Api.Data;

/// <summary>Lets EF tooling inspect the schema without starting the API or seeding data.</summary>
public sealed class GameShelfDbContextFactory : IDesignTimeDbContextFactory<GameShelfDbContext>
{
    public GameShelfDbContext CreateDbContext(string[] args)
    {
        var projectDirectory = Path.GetFullPath(Path.Combine(
            Path.GetDirectoryName(typeof(GameShelfDbContext).Assembly.Location)!, "..", "..", ".."));
        var connection = new Microsoft.Data.Sqlite.SqliteConnectionStringBuilder
            { DataSource = Path.Combine(projectDirectory, "gameshelf.db") }.ToString();
        var options = new DbContextOptionsBuilder<GameShelfDbContext>()
            .UseSqlite(connection)
            .Options;
        return new GameShelfDbContext(options);
    }
}
