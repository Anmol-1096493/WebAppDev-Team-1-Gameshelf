using GameShelf.Api.Models;

namespace GameShelf.Api.Dtos;

public sealed record CreateTradeOfferDto(
    Guid WishlistItemId,
    Guid RequestedGameId
);

public sealed record TradeOfferDto(
    Guid Id,
    Guid WishlistItemId,
    Guid OfferedById,
    string OfferedByName,
    Guid WishlistOwnerId,
    string WishlistOwnerName,
    Guid OfferedGameId,
    string OfferedGameTitle,
    Guid RequestedGameId,
    string RequestedGameTitle,
    DateTimeOffset CreatedAt,
    TradeOfferStatus Status
);
