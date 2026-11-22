
using GameShelf.Api.Models;

namespace GameShelf.Api.Dtos;

/// <summary>
/// Shows one game from a member's collection.
/// </summary>
public sealed record CollectionRecordDto(
    Guid Id,
    Guid GameId,
    string GameTitle,
    CollectionStatus Status,
    int PlayCount,
    int? Rating,
    string Note);


/// <summary>
/// Contains the information needed to add a game to a collection.
/// </summary>
public sealed record CreateCollectionRecordDto(
    Guid GameId);


/// <summary>
/// Contains the information used to update a collection record.
/// </summary>
public sealed record UpdateCollectionRecordDto(
    CollectionStatus Status,
    int PlayCount,
    int? Rating,
    string Note);
