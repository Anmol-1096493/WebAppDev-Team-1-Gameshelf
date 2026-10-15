using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace GameShelf.Api.Data;

/// <summary>Adopts the original four-table database before applying versioned EF migrations.</summary>
public static class DatabaseUpgrade
{
    private const string Baseline = "20261008112653_SessionBaseline";

    public static async Task ApplyAsync(GameShelfDbContext db)
    {
        await db.Database.OpenConnectionAsync();
        try
        {
            var connection = (SqliteConnection)db.Database.GetDbConnection();
            var tables = new HashSet<string>();
            await using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT name FROM sqlite_master WHERE type = 'table'";
                await using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync()) tables.Add(reader.GetString(0));
            }

            if (tables.Contains("Members") && !tables.Contains("__EFMigrationsHistory"))
            {
                // Only adopt the original schema; an unknown schema must not be modified silently.
                var expected = new Dictionary<string, string[]>
                {
                    ["Members"] = ["Id", "Name", "UserName", "IsCommittee", "PasswordHash"],
                    ["Games"] = ["Id", "Title", "MinPlayers", "MaxPlayers"],
                    ["Sessions"] = ["Id", "HostId", "Title", "StartAt", "Place", "Capacity", "IsCancelled"],
                    ["Signups"] = ["Id", "SessionId", "MemberId", "Status", "CreatedAt", "GameId"]
                };
                foreach (var (table, columns) in expected)
                {
                    var actual = new HashSet<string>();
                    await using var command = connection.CreateCommand();
                    command.CommandText = $"PRAGMA table_info(\"{table}\")";
                    await using var reader = await command.ExecuteReaderAsync();
                    while (await reader.ReadAsync()) actual.Add(reader.GetString(1));
                    if (!actual.SetEquals(columns))
                        throw new InvalidOperationException($"Cannot safely upgrade {table}: its schema differs from the original app.");
                }

                var backupPath = connection.DataSource + $".before-migrations-{DateTime.UtcNow:yyyyMMddHHmmss}.db";
                await using (var backup = new SqliteConnection(new SqliteConnectionStringBuilder { DataSource = backupPath }.ToString()))
                {
                    await backup.OpenAsync();
                    connection.BackupDatabase(backup);
                }

                // The old tables already exist; record their baseline without recreating them.
                await using var transaction = await db.Database.BeginTransactionAsync();
                await db.Database.ExecuteSqlRawAsync("""
                    CREATE TABLE "__EFMigrationsHistory" (
                        "MigrationId" TEXT NOT NULL CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY,
                        "ProductVersion" TEXT NOT NULL
                    );
                    """);
                await db.Database.ExecuteSqlRawAsync(
                    "INSERT INTO \"__EFMigrationsHistory\" (\"MigrationId\", \"ProductVersion\") VALUES ({0}, {1})", Baseline, "10.0.0");
                await transaction.CommitAsync();
            }
        }
        finally
        {
            await db.Database.CloseConnectionAsync();
        }

        await db.Database.MigrateAsync();
    }
}
