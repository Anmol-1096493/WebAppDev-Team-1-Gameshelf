using GameShelf.Api.Data;
using GameShelf.Api.Dtos;
using GameShelf.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GameShelf.Api.Services;

/// <summary>
/// Session and signup logic. Enforces the case's business rules: confirmed and
/// waiting seats, waiting-list ordering, capacity reshuffles, host transfer and
/// cancellation permissions. All mutations go through the SQLite DbContext.
/// </summary>
public sealed class SessionService
{
    private readonly GameShelfDbContext _db;
    private readonly ILogger<SessionService> _logger;

    public SessionService(GameShelfDbContext db, ILogger<SessionService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<IReadOnlyList<MemberDto>> ListMembersAsync(CancellationToken ct)
        => await _db.Members.OrderBy(m => m.Name)
            .Select(m => new MemberDto(m.Id, m.Name, m.IsCommittee)).ToListAsync(ct);

    public async Task<IReadOnlyList<GameDto>> ListGamesAsync(CancellationToken ct)
        => await _db.Games.OrderBy(g => g.Title)
            .Select(g => new GameDto(g.Id, g.Title, g.MinPlayers, g.MaxPlayers)).ToListAsync(ct);

    public async Task<IReadOnlyList<SessionSummaryDto>> ListSessionsAsync(CancellationToken ct)
    {
        // SQLite cannot ORDER BY DateTimeOffset, so order in memory after projecting.
        var summaries = await _db.Sessions
            .Select(s => new SessionSummaryDto(
                s.Id, s.HostId, _db.Members.Where(m => m.Id == s.HostId).Select(m => m.Name).FirstOrDefault() ?? "Unknown",
                s.Title, s.StartAt, s.Place, s.Capacity, s.IsCancelled,
                s.Signups.Count(x => x.Status == SignupStatus.Confirmed),
                s.Signups.Count(x => x.Status == SignupStatus.Waiting)))
            .ToListAsync(ct);
        return summaries.OrderByDescending(s => s.StartAt).ToList();
    }

    public async Task<SessionDetailDto> GetSessionAsync(Guid id, Guid currentMemberId, CancellationToken ct)
    {
        var session = await RequireSessionAsync(id, ct);
        return await ToDetailAsync(session, currentMemberId, ct);
    }

    public async Task<SessionDetailDto> CreateSessionAsync(CreateSessionDto dto, Guid hostId, CancellationToken ct)
    {
        if (!await _db.Members.AnyAsync(m => m.Id == hostId, ct)) throw new ForbiddenException("Only members can host a session.");
        if (string.IsNullOrWhiteSpace(dto.Title)) throw new ValidationException("A title is required.");
        if (string.IsNullOrWhiteSpace(dto.Place)) throw new ValidationException("A place is required.");
        if (dto.Capacity < 1) throw new ValidationException("Capacity must be at least one seat.");

        var session = new Session
        {
            Id = Guid.NewGuid(),
            HostId = hostId,
            Title = dto.Title.Trim(),
            StartAt = dto.StartAt,
            Place = dto.Place.Trim(),
            Capacity = dto.Capacity,
        };
        _db.Sessions.Add(session);
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Session {SessionId} created by {HostId}", session.Id, hostId);
        return await ToDetailAsync(session, hostId, ct);
    }

    public async Task<SessionDetailDto> UpdateSessionAsync(Guid id, UpdateSessionDto dto, Guid actorId, CancellationToken ct)
    {
        var session = await RequireSessionAsync(id, ct);
        AssertNotCancelled(session);
        if (session.HostId != actorId) throw new ForbiddenException("Only the host can change a session.");

        if (dto.Title is not null)
        {
            if (string.IsNullOrWhiteSpace(dto.Title)) throw new ValidationException("A title cannot be empty.");
            session.Title = dto.Title.Trim();
        }
        if (dto.StartAt is not null) session.StartAt = dto.StartAt.Value;
        if (dto.Place is not null)
        {
            if (string.IsNullOrWhiteSpace(dto.Place)) throw new ValidationException("A place cannot be empty.");
            session.Place = dto.Place.Trim();
        }
        if (dto.Capacity is not null)
        {
            if (dto.Capacity.Value < 1) throw new ValidationException("Capacity must be at least one seat.");
            session.Capacity = dto.Capacity.Value;
            ReconcileSeats(session);
        }

        await _db.SaveChangesAsync(ct);
        return await ToDetailAsync(session, actorId, ct);
    }

    public async Task<SessionDetailDto> CancelSessionAsync(Guid id, Guid actorId, CancellationToken ct)
    {
        var session = await RequireSessionAsync(id, ct);
        var actor = await _db.Members.FirstOrDefaultAsync(m => m.Id == actorId, ct)
            ?? throw new ForbiddenException("Unknown member.");
        if (session.HostId != actorId && !actor.IsCommittee)
            throw new ForbiddenException("Only the host or the committee can cancel a session.");
        session.IsCancelled = true;
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Session {SessionId} cancelled by {ActorId}", session.Id, actorId);
        return await ToDetailAsync(session, actorId, ct);
    }

    public async Task<SessionDetailDto> TransferHostAsync(Guid id, TransferHostDto dto, Guid actorId, CancellationToken ct)
    {
        var session = await RequireSessionAsync(id, ct);
        AssertNotCancelled(session);
        if (session.HostId != actorId) throw new ForbiddenException("Only the host can hand over hosting.");
        if (dto.NewHostId == actorId) throw new ValidationException("The host is already hosting this session.");
        var newHostSignup = session.Signups.FirstOrDefault(s => s.MemberId == dto.NewHostId);
        if (newHostSignup is null || newHostSignup.Status != SignupStatus.Confirmed)
            throw new ValidationException("Hosting can only be handed over to a member with a confirmed seat.");

        session.HostId = dto.NewHostId;
        await _db.SaveChangesAsync(ct);
        _logger.LogInformation("Session {SessionId} host transferred to {NewHostId}", session.Id, dto.NewHostId);
        return await ToDetailAsync(session, actorId, ct);
    }

    public async Task<SessionDetailDto> SignUpAsync(Guid sessionId, SignUpDto dto, Guid memberId, CancellationToken ct)
    {
        var session = await RequireSessionAsync(sessionId, ct);
        AssertNotCancelled(session);
        if (!await _db.Members.AnyAsync(m => m.Id == memberId, ct)) throw new ForbiddenException("Only members can sign up.");
        if (session.Signups.Any(s => s.MemberId == memberId))
            throw new ConflictException("This member is already signed up for the session.");
        if (dto.GameId is not null && !await _db.Games.AnyAsync(g => g.Id == dto.GameId.Value, ct))
            throw new ValidationException("The brought game is not in the catalogue.");

        var confirmedCount = session.Signups.Count(s => s.Status == SignupStatus.Confirmed);
        var status = confirmedCount < session.Capacity ? SignupStatus.Confirmed : SignupStatus.Waiting;

        // Add via the DbSet so EF treats it as a new row (INSERT), not an update
        // of an existing key.
        _db.Signups.Add(new Signup
        {
            Id = Guid.NewGuid(),
            SessionId = session.Id,
            MemberId = memberId,
            Status = status,
            CreatedAt = DateTimeOffset.UtcNow,
            GameId = dto.GameId,
        });
        await _db.SaveChangesAsync(ct);
        return await ToDetailAsync(session, memberId, ct);
    }

    public async Task<SessionDetailDto> CancelSignupAsync(Guid sessionId, Guid memberId, CancellationToken ct)
    {
        var session = await RequireSessionAsync(sessionId, ct);
        var signup = session.Signups.FirstOrDefault(s => s.MemberId == memberId)
            ?? throw new NotFoundException("This member is not signed up for the session.");

        session.Signups.Remove(signup);
        if (signup.Status == SignupStatus.Confirmed) PromoteEarliestWaiting(session);
        await _db.SaveChangesAsync(ct);
        return await ToDetailAsync(session, memberId, ct);
    }

    /// <summary>
    /// When the host lowers the capacity below the number of confirmed seats,
    /// the most recently confirmed signups return to the waiting list first.
    /// </summary>
    private static void ReconcileSeats(Session session)
    {
        var confirmed = session.Signups
            .Where(s => s.Status == SignupStatus.Confirmed)
            .OrderByDescending(s => s.CreatedAt)
            .ToList();

        while (confirmed.Count > session.Capacity)
        {
            var demoted = confirmed[0];
            demoted.Status = SignupStatus.Waiting;
            confirmed.RemoveAt(0);
        }

        PromoteEarliestWaiting(session);
    }

    /// <summary>A freed seat goes to the earliest waiting signup.</summary>
    private static void PromoteEarliestWaiting(Session session)
    {
        while (true)
        {
            var confirmedCount = session.Signups.Count(s => s.Status == SignupStatus.Confirmed);
            if (confirmedCount >= session.Capacity) return;

            var next = session.Signups
                .Where(s => s.Status == SignupStatus.Waiting)
                .OrderBy(s => s.CreatedAt)
                .FirstOrDefault();
            if (next is null) return;
            next.Status = SignupStatus.Confirmed;
        }
    }

    private async Task<Session> RequireSessionAsync(Guid id, CancellationToken ct)
    {
        var session = await _db.Sessions
            .Include(s => s.Signups)
            .ThenInclude(su => su.Game)
            .FirstOrDefaultAsync(s => s.Id == id, ct);
        return session ?? throw new NotFoundException("Session not found.");
    }

    private static void AssertNotCancelled(Session session)
    {
        if (session.IsCancelled) throw new ConflictException("This session has been cancelled.");
    }

    private async Task<SessionDetailDto> ToDetailAsync(Session s, Guid currentMemberId, CancellationToken ct)
    {
        var hostName = await _db.Members.Where(m => m.Id == s.HostId).Select(m => m.Name).FirstOrDefaultAsync(ct) ?? "Unknown";
        var confirmedCount = s.Signups.Count(x => x.Status == SignupStatus.Confirmed);
        var own = s.Signups.FirstOrDefault(x => x.MemberId == currentMemberId);

        var signups = new List<SignupDto>();
        foreach (var x in s.Signups.OrderBy(x => x.Status).ThenBy(x => x.CreatedAt))
        {
            var memberName = await _db.Members.Where(m => m.Id == x.MemberId).Select(m => m.Name).FirstOrDefaultAsync(ct) ?? "Unknown";
            GameDto? brought = null;
            if (x.GameId is not null && x.Game is not null)
                brought = new GameDto(x.Game.Id, x.Game.Title, x.Game.MinPlayers, x.Game.MaxPlayers);
            var fits = brought is null || brought.MinPlayers <= confirmedCount;
            signups.Add(new SignupDto(x.Id, x.MemberId, memberName, x.Status, x.CreatedAt, brought, fits));
        }

        return new SessionDetailDto(
            s.Id, s.HostId, hostName, s.Title, s.StartAt, s.Place, s.Capacity, s.IsCancelled,
            confirmedCount,
            own is not null, own?.Status,
            signups);
    }
}