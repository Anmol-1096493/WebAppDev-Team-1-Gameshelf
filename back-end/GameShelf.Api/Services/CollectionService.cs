using GameShelf.Api.Models;
using GameShelf.Api.Repositories;

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
}