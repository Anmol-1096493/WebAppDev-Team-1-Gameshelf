
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

    // Update the details of a game in a member's collection.
    public async Task<CollectionRecordDto> UpdateCollectionAsync(
        Guid ownerId,
        Guid recordId,
        UpdateCollectionRecordDto request,
        CancellationToken ct)
    {
        // Find the collection record.
        var records = await _collectionRepository.FindAsync(
            record => record.Id == recordId && record.OwnerId == ownerId,
            ct);

        var record = records.FirstOrDefault();

        if (record is null)
        {
            throw new NotFoundException("Collection record not found.");
        }

        // Check that the status is valid.
        if (!Enum.IsDefined(request.Status))
        {
            throw new ValidationException("Invalid collection status.");
        }

        // Check that the play count is not negative.
        if (request.PlayCount < 0)
        {
            throw new ValidationException("Play count cannot be negative.");
        }

        // Check that the play count does not decrease.
        if (request.PlayCount < record.PlayCount)
        {
            throw new ValidationException("Play count cannot decrease.");
        }

        // Check that the rating is between 1 and 10.
        if (request.Rating is not null &&
            (request.Rating < 1 || request.Rating > 10))
        {
            throw new ValidationException("Rating must be between 1 and 10.");
        }

        // A rating is only allowed for a game that has been played.
        if (request.Rating is not null &&
            (request.Status != CollectionStatus.Played || request.PlayCount == 0))
        {
            throw new ValidationException(
                "A rating is only allowed when the game has been played.");
        }

        // Update the collection record.
        record.Status = request.Status;
        record.PlayCount = request.PlayCount;
        record.Rating = request.Rating;
        record.Note = request.Note?.Trim() ?? string.Empty;

        _collectionRepository.Update(record);
        await _collectionRepository.SaveChangesAsync(ct);

        // Get the game title for the response.
        var game = await _gameRepository.GetByIdAsync(record.GameId, ct);
        var gameTitle = game?.Title ?? string.Empty;

        return new CollectionRecordDto(
            record.Id,
            record.GameId,
            gameTitle,
            record.Status,
            record.PlayCount,
            record.Rating,
            record.Note);
    }

    // Remove a game from a member's collection.
    public async Task DeleteCollectionAsync(
        Guid ownerId,
        Guid recordId,
        CancellationToken ct)
    {
        // Find the collection record owned by this member.
        var records = await _collectionRepository.FindAsync(
            record => record.Id == recordId && record.OwnerId == ownerId,
            ct);

        var record = records.FirstOrDefault();

        // Stop if the collection record does not exist.
        if (record is null)
        {
            throw new NotFoundException("Collection record not found.");
        }

        // Remove the collection record from the database.
        _collectionRepository.Delete(record);
        await _collectionRepository.SaveChangesAsync(ct);
    }
}
