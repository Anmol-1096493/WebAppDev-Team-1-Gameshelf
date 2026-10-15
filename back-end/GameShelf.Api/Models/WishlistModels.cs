namespace GameShelf.Api.Models;

public enum WishPriority { High = 0, Medium = 1, Low = 2 }
public enum TradeOfferStatus { Open = 0, Accepted = 1, Rejected = 2, Cancelled = 3 }

public sealed class WishlistItem
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public Guid GameId { get; set; }
    public WishPriority Priority { get; set; }
    public string Note { get; set; } = string.Empty;
    public bool IsFulfilled { get; set; }
    public Member Owner { get; set; } = null!;
    public Game Game { get; set; } = null!;
}

/// <summary>The offered edition follows from the wishlist item; RequestedGameId is the return game.</summary>
public sealed class TradeOffer
{
    public Guid Id { get; set; }
    public Guid WishlistItemId { get; set; }
    public Guid OfferedById { get; set; }
    public Guid RequestedGameId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public TradeOfferStatus Status { get; set; }
    public WishlistItem WishlistItem { get; set; } = null!;
    public Member OfferedBy { get; set; } = null!;
    public Game RequestedGame { get; set; } = null!;
}
