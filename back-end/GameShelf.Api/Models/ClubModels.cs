namespace GameShelf.Api.Models;

/// <summary>
/// A club member. Login is backed by <see cref="PasswordHash"/>; there is no
/// external identity provider yet.
/// </summary>
public sealed class Member
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public bool IsCommittee { get; set; }

    /// <summary>PBKDF2 hash of the member's password. Never returned to clients.</summary>
    public string PasswordHash { get; set; } = string.Empty;
}

/// <summary>
/// One catalogue edition, referenced by all club modules.
/// </summary>
public sealed class Game
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Publisher { get; set; } = string.Empty;
    public int ReleaseYear { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Language { get; set; } = "English";
    public string Edition { get; set; } = "Standard edition";
    public int MinPlayers { get; set; }
    public int MaxPlayers { get; set; }
    public int PlayingTimeMinutes { get; set; }
    public string? ImageUrl { get; set; }
}

public enum SignupStatus
{
    Confirmed = 0,
    Waiting = 1,
}

/// <summary>
/// One member's signup for one session. CreatedAt orders both the confirmed
/// seats and the waiting list.
/// </summary>
public sealed class Signup
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public Guid MemberId { get; set; }
    public SignupStatus Status { get; set; } = SignupStatus.Confirmed;
    public DateTimeOffset CreatedAt { get; set; }
    public Guid? GameId { get; set; }

    public Session Session { get; set; } = null!;
    public Member Member { get; set; } = null!;
    public Game? Game { get; set; }
}

/// <summary>
/// A game session hosted by a member, in the club room or at a kitchen table.
/// </summary>
public sealed class Session
{
    public Guid Id { get; set; }
    public Guid HostId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTimeOffset StartAt { get; set; }
    public string Place { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public bool IsCancelled { get; set; }
    public Member Host { get; set; } = null!;
    public List<Signup> Signups { get; set; } = [];
}
