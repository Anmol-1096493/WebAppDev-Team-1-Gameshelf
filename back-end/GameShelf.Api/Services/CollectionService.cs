
using GameShelf.Api.Models;
using GameShelf.Api.Repositories;
using GameShelf.Api.Dtos;

namespace GameShelf.Api.Services;

/// <summary>
/// Handles collection records for signed-in members.
/// </summary>
public sealed class CollectionService(
    IRepository<CollectionRecord> collectionRepository,
    IRepository<Game> gameRepository)
{
    // Keep the repositories so we can work with collection records and games.
    private readonly IRepository<CollectionRecord> _collectionRepository = collectionRepository;
    private readonly IRepository<Game> _gameRepository = gameRepository;

    // Get all collection records owned by one member.
    public async Task<IEnumerable<CollectionRecordDto>> ListCollectionAsync(
        Guid ownerId,
        CancellationToken ct)
    {
        var records = await _collectionRepository.FindWithRelatedAsync(
            record => record.OwnerId == ownerId,
            ct);

        return records.Select(record => new CollectionRecordDto(
            record.Id,
            record.GameId,
            record.Game.Title,
            record.Status,
            record.PlayCount,
            record.Rating,
            record.Note));
    }

    // Add a game to a member's collection.
    public async Task<CollectionRecordDto> AddToCollectionAsync(
        Guid ownerId,
        CreateCollectionRecordDto request,
        CancellationToken ct)
    {
        // Check if the game exists in the catalogue.
        var game = await _gameRepository.GetByIdAsync(request.GameId, ct);

        if (game is null)
        {
            throw new NotFoundException("Game not found.");
        }

        // Check if the member already owns this game.
        var existingRecords = await _collectionRepository.FindAsync(
            record => record.OwnerId == ownerId && record.GameId == request.GameId,
            ct);

        if (existingRecords.Any())
        {
            throw new ConflictException("This game is already in your collection.");
        }

        // Create a new collection record.
        var record = new CollectionRecord
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerId,
            GameId = game.Id,
            Status = CollectionStatus.NotPlayed,
            PlayCount = 0,
            Rating = null,
            Note = string.Empty
        };

        _collectionRepository.Add(record);
        await _collectionRepository.SaveChangesAsync(ct);

        // Return the new collection record.
        return new CollectionRecordDto(
            record.Id,
            record.GameId,
            game.Title,
            record.Status,
            record.PlayCount,
            record.Rating,
            record.Note);
    }
}
