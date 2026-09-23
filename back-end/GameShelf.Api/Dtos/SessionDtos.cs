using GameShelf.Api.Models;

namespace GameShelf.Api.Dtos;

public sealed record MemberDto(Guid Id, string Name, bool IsCommittee);

public sealed record GameDto(Guid Id, string Title, int MinPlayers, int MaxPlayers);

public sealed record SignupDto(
    Guid Id,
    Guid MemberId,
    string MemberName,
    SignupStatus Status,
    DateTimeOffset CreatedAt,
    GameDto? BroughtGame,
    bool GameFits);

public sealed record SessionSummaryDto(
    Guid Id,
    Guid HostId,
    string HostName,
    string Title,
    DateTimeOffset StartAt,
    string Place,
    int Capacity,
    bool IsCancelled,
    int ConfirmedSeats,
    int WaitingCount);

public sealed record SessionDetailDto(
    Guid Id,
    Guid HostId,
    string HostName,
    string Title,
    DateTimeOffset StartAt,
    string Place,
    int Capacity,
    bool IsCancelled,
    int ConfirmedSeats,
    bool CurrentMemberSignedUp,
    SignupStatus? CurrentMemberSignupStatus,
    IReadOnlyList<SignupDto> Signups);

public sealed record CreateSessionDto(string Title, DateTimeOffset StartAt, string Place, int Capacity);

public sealed record UpdateSessionDto(string? Title, DateTimeOffset? StartAt, string? Place, int? Capacity);

public sealed record SignUpDto(Guid? GameId);

public sealed record TransferHostDto(Guid NewHostId);