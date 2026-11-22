
using GameShelf.Api.Data;
using GameShelf.Api.Dtos;
using Microsoft.EntityFrameworkCore;

namespace GameShelf.Api.Services;

/// <summary>
/// Handles shelves owned by signed-in members.
/// </summary>
public sealed class ShelfService(GameShelfDbContext db)
{
    // Keep the database context so we can access shelves and their games.
    private readonly GameShelfDbContext _db = db;

    // Get all shelves owned by one member.
    public async Task<IEnumerable<ShelfDto>> ListShelvesAsync(
        Guid ownerId,
        CancellationToken ct)
    {
        var shelves = await _db.Shelves
            .Where(shelf => shelf.OwnerId == ownerId)
            .OrderBy(shelf => shelf.Name)
            .Select(shelf => new ShelfDto(
                shelf.Id,
                shelf.Name,
                shelf.Description,
                shelf.IsPublic,
                shelf.Games.Count))
            .ToListAsync(ct);

        return shelves;
    }
}
