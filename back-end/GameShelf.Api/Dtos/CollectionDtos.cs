
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
