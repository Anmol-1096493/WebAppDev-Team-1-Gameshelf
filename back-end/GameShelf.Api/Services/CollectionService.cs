
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
}
