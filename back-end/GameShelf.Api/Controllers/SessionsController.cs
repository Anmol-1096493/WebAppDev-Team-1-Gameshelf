using System.Security.Claims;
using GameShelf.Api.Dtos;
using GameShelf.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameShelf.Api.Controllers;

/// <summary>
/// Base class that resolves the signed-in member from the auth cookie. All
/// session endpoints require an authenticated member.
/// </summary>
[Authorize]
public abstract class AuthenticatedController : ControllerBase
{
    protected Guid CurrentMemberId
    {
        get
        {
            var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(id, out var parsed) ? parsed : Guid.Empty;
        }
    }
}

[ApiController]
[Route("api/sessions")]
public sealed class SessionsController(SessionService service) : AuthenticatedController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SessionSummaryDto>>> GetAll(CancellationToken ct)
        => Ok(await service.ListSessionsAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SessionDetailDto>> Get(Guid id, CancellationToken ct)
    {
        try { return Ok(await service.GetSessionAsync(id, CurrentMemberId, ct)); }
        catch (NotFoundException) { return NotFound(); }
    }

    [HttpPost]
    public async Task<ActionResult<SessionDetailDto>> Create([FromBody] CreateSessionDto dto, CancellationToken ct)
    {
        try
        {
            var created = await service.CreateSessionAsync(dto, CurrentMemberId, ct);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }
        catch (ForbiddenException ex) { return StatusCode(403, new { error = ex.Message }); }
        catch (ValidationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SessionDetailDto>> Update(Guid id, [FromBody] UpdateSessionDto dto, CancellationToken ct)
    {
        try { return Ok(await service.UpdateSessionAsync(id, dto, CurrentMemberId, ct)); }
        catch (NotFoundException) { return NotFound(); }
        catch (ForbiddenException ex) { return StatusCode(403, new { error = ex.Message }); }
        catch (ConflictException ex) { return Conflict(new { error = ex.Message }); }
        catch (ValidationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<SessionDetailDto>> Cancel(Guid id, CancellationToken ct)
    {
        try { return Ok(await service.CancelSessionAsync(id, CurrentMemberId, ct)); }
        catch (NotFoundException) { return NotFound(); }
        catch (ForbiddenException ex) { return StatusCode(403, new { error = ex.Message }); }
        catch (ConflictException ex) { return Conflict(new { error = ex.Message }); }
    }

    [HttpPost("{id:guid}/transfer-host")]
    public async Task<ActionResult<SessionDetailDto>> TransferHost(Guid id, [FromBody] TransferHostDto dto, CancellationToken ct)
    {
        try { return Ok(await service.TransferHostAsync(id, dto, CurrentMemberId, ct)); }
        catch (NotFoundException) { return NotFound(); }
        catch (ForbiddenException ex) { return StatusCode(403, new { error = ex.Message }); }
        catch (ValidationException ex) { return BadRequest(new { error = ex.Message }); }
        catch (ConflictException ex) { return Conflict(new { error = ex.Message }); }
    }

    [HttpPost("{id:guid}/signups")]
    public async Task<ActionResult<SessionDetailDto>> SignUp(Guid id, [FromBody] SignUpDto? dto, CancellationToken ct)
    {
        try { return Ok(await service.SignUpAsync(id, dto ?? new SignUpDto(null), CurrentMemberId, ct)); }
        catch (NotFoundException) { return NotFound(); }
        catch (ForbiddenException ex) { return StatusCode(403, new { error = ex.Message }); }
        catch (ConflictException ex) { return Conflict(new { error = ex.Message }); }
        catch (ValidationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpDelete("{id:guid}/signups")]
    public async Task<ActionResult<SessionDetailDto>> CancelSignup(Guid id, CancellationToken ct)
    {
        try { return Ok(await service.CancelSignupAsync(id, CurrentMemberId, ct)); }
        catch (NotFoundException) { return NotFound(); }
        catch (ConflictException ex) { return Conflict(new { error = ex.Message }); }
    }
}

[ApiController]
[Route("api/members")]
public sealed class MembersController(SessionService service) : AuthenticatedController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetAll(CancellationToken ct)
        => Ok(await service.ListMembersAsync(ct));
}

[ApiController]
[Route("api/games")]
public sealed class GamesController(SessionService service) : AuthenticatedController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameDto>>> GetAll(CancellationToken ct)
        => Ok(await service.ListGamesAsync(ct));
}