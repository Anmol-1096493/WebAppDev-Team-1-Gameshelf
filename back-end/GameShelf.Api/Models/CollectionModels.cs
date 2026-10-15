namespace GameShelf.Api.Models;

public enum CollectionStatus { NotPlayed = 0, InProgress = 1, Played = 2 }

/// <summary>One owned catalogue edition, with the owner's play history and opinion.</summary>
public sealed class CollectionRecord
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public Guid GameId { get; set; }
    public CollectionStatus Status { get; set; }
    public int PlayCount { get; set; }
    public int? Rating { get; set; }
    public string Note { get; set; } = string.Empty;
    public Member Owner { get; set; } = null!;
    public Game Game { get; set; } = null!;
}

/// <summary>A public or private group of collection records owned by one member.</summary>
public sealed class Shelf
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublic { get; set; }
    public Member Owner { get; set; } = null!;
    public List<ShelfGame> Games { get; set; } = [];
}

/// <summary>The many-to-many link between shelves and owned games.</summary>
public sealed class ShelfGame
{
    public Guid ShelfId { get; set; }
    public Guid CollectionRecordId { get; set; }
    public Shelf Shelf { get; set; } = null!;
    public CollectionRecord CollectionRecord { get; set; } = null!;
}
