using GameShelf.Api.Models;

namespace GameShelf.Api.Dtos;

public sealed record WishlistItemDto(
    Guid Id,
    Guid OwnerId,
    string MemberName,
    Guid GameId,
    string GameTitle,
    WishPriority Priority,
    string Note,
    bool IsFulfilled
);

public sealed record CreateWishlistItemDto(
    Guid GameId,
    WishPriority Priority,
    string Note
);

public sealed record UpdateWishlistItemDto(
    Guid GameId,
    WishPriority Priority,
    string Note
);
