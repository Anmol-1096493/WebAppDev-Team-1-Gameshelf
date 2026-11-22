
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


    // Create a new shelf for one member.
    public async Task<ShelfDto> CreateShelfAsync(
        Guid ownerId,
        CreateShelfDto request,
        CancellationToken ct)
    {
        // Check that the shelf has a name.
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("A shelf name is required.");
        }

        // Create the new shelf.
        var shelf = new GameShelf.Api.Models.Shelf
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerId,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
            IsPublic = request.IsPublic
        };

        // Save the new shelf in the database.
        _db.Shelves.Add(shelf);
        await _db.SaveChangesAsync(ct);

        // Return the new shelf.
        return new ShelfDto(
            shelf.Id,
            shelf.Name,
            shelf.Description,
            shelf.IsPublic,
            0);
    }


    // Update an existing shelf owned by one member.
    public async Task<ShelfDto> UpdateShelfAsync(
        Guid ownerId,
        Guid shelfId,
        UpdateShelfDto request,
        CancellationToken ct)
    {
        // Find the shelf in the database.
        var shelf = await _db.Shelves
            .FirstOrDefaultAsync(s => s.Id == shelfId, ct);

        // Check that the shelf exists.
        if (shelf is null)
        {
            throw new NotFoundException("Shelf not found.");
        }

        // Check that the shelf belongs to the signed-in member.
        if (shelf.OwnerId != ownerId)
        {
            throw new ForbiddenException("You cannot update this shelf.");
        }

        // Check that the shelf has a name.
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ValidationException("A shelf name is required.");
        }

        // Update the shelf details.
        shelf.Name = request.Name.Trim();
        shelf.Description = request.Description?.Trim() ?? string.Empty;
        shelf.IsPublic = request.IsPublic;

        // Save the changes in the database.
        await _db.SaveChangesAsync(ct);

        // Return the updated shelf.
        return new ShelfDto(
            shelf.Id,
            shelf.Name,
            shelf.Description,
            shelf.IsPublic,
            await _db.ShelfGames.CountAsync(
                game => game.ShelfId == shelf.Id, ct));
    }


    // Delete an existing shelf owned by one member.
    public async Task DeleteShelfAsync(
        Guid ownerId,
        Guid shelfId,
        CancellationToken ct)
    {
        // Find the shelf in the database.
        var shelf = await _db.Shelves
            .FirstOrDefaultAsync(s => s.Id == shelfId, ct);

        // Check that the shelf exists.
        if (shelf is null)
        {
            throw new NotFoundException("Shelf not found.");
        }

        // Check that the shelf belongs to the signed-in member.
        if (shelf.OwnerId != ownerId)
        {
            throw new ForbiddenException("You cannot delete this shelf.");
        }

        // Delete the shelf from the database.
        _db.Shelves.Remove(shelf);

        // Save the changes in the database.
        await _db.SaveChangesAsync(ct);
    }


    // Add a game from the member's collection to a shelf.
    public async Task AddGameToShelfAsync(
        Guid ownerId,
        Guid shelfId,
        AddGameToShelfDto request,
        CancellationToken ct)
    {
        // Find the shelf in the database.
        var shelf = await _db.Shelves
            .FirstOrDefaultAsync(s => s.Id == shelfId, ct);

        // Check that the shelf exists.
        if (shelf is null)
        {
            throw new NotFoundException("Shelf not found.");
        }

        // Check that the shelf belongs to the signed-in member.
        if (shelf.OwnerId != ownerId)
        {
            throw new ForbiddenException("You cannot update this shelf.");
        }

        // Find the game in the member's collection.
        var collectionRecord = await _db.CollectionRecords
            .FirstOrDefaultAsync(
                record => record.Id == request.CollectionRecordId
                    && record.OwnerId == ownerId,
                ct);

        // Check that the game belongs to the member.
        if (collectionRecord is null)
        {
            throw new NotFoundException(
                "Game not found in your collection.");
        }

        // Check that the game is not already on this shelf.
        var alreadyAdded = await _db.ShelfGames
            .AnyAsync(
                game => game.ShelfId == shelfId
                    && game.CollectionRecordId == request.CollectionRecordId,
                ct);

        if (alreadyAdded)
        {
            throw new ConflictException(
                "This game is already on the shelf.");
        }

        // Create the link between the shelf and the collection record.
        _db.ShelfGames.Add(new GameShelf.Api.Models.ShelfGame
        {
            ShelfId = shelfId,
            CollectionRecordId = request.CollectionRecordId
        });

        // Save the changes in the database.
        await _db.SaveChangesAsync(ct);
    }




}
