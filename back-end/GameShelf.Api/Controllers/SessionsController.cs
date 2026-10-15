using GameShelf.Api.Dtos;
using GameShelf.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GameShelf.Api.Controllers;

[ApiController]
[Route("api/sessions")]
public sealed class SessionsController(SessionService service) : AuthenticatedController
{
    /// <summary>Lists sessions with seat counts and waiting-list totals.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<SessionSummaryDto>>> GetAll(CancellationToken ct)
        => Ok(await service.ListSessionsAsync(ct));

    /// <summary>Gets one session, including signups and the current member's status.</summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SessionDetailDto>> Get(Guid id, CancellationToken ct)
    {
        try { return Ok(await service.GetSessionAsync(id, CurrentMemberId, ct)); }
        catch (NotFoundException) { return NotFound(); }
    }

    /// <summary>Creates a session hosted by the signed-in member.</summary>
    [ProducesResponseType(typeof(SessionDetailDto), StatusCodes.Status201Created)]
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

    /// <summary>Changes session details; only the host may do this.</summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SessionDetailDto>> Update(Guid id, [FromBody] UpdateSessionDto dto, CancellationToken ct)
    {
        try { return Ok(await service.UpdateSessionAsync(id, dto, CurrentMemberId, ct)); }
        catch (NotFoundException) { return NotFound(); }
        catch (ForbiddenException ex) { return StatusCode(403, new { error = ex.Message }); }
        catch (ConflictException ex) { return Conflict(new { error = ex.Message }); }
        catch (ValidationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    /// <summary>Cancels a session; allowed for its host or a committee member.</summary>
    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<SessionDetailDto>> Cancel(Guid id, CancellationToken ct)
    {
        try { return Ok(await service.CancelSessionAsync(id, CurrentMemberId, ct)); }
        catch (NotFoundException) { return NotFound(); }
        catch (ForbiddenException ex) { return StatusCode(403, new { error = ex.Message }); }
        catch (ConflictException ex) { return Conflict(new { error = ex.Message }); }
    }

    /// <summary>Transfers hosting to a member with a confirmed seat.</summary>
    [HttpPost("{id:guid}/transfer-host")]
    public async Task<ActionResult<SessionDetailDto>> TransferHost(Guid id, [FromBody] TransferHostDto dto, CancellationToken ct)
    {
        try { return Ok(await service.TransferHostAsync(id, dto, CurrentMemberId, ct)); }
        catch (NotFoundException) { return NotFound(); }
        catch (ForbiddenException ex) { return StatusCode(403, new { error = ex.Message }); }
        catch (ValidationException ex) { return BadRequest(new { error = ex.Message }); }
        catch (ConflictException ex) { return Conflict(new { error = ex.Message }); }
    }

    /// <summary>Signs up the current member, or puts them on the waiting list if full.</summary>
    [HttpPost("{id:guid}/signups")]
    public async Task<ActionResult<SessionDetailDto>> SignUp(Guid id, [FromBody] SignUpDto? dto, CancellationToken ct)
    {
        try { return Ok(await service.SignUpAsync(id, dto ?? new SignUpDto(null), CurrentMemberId, ct)); }
        catch (NotFoundException) { return NotFound(); }
        catch (ForbiddenException ex) { return StatusCode(403, new { error = ex.Message }); }
        catch (ConflictException ex) { return Conflict(new { error = ex.Message }); }
        catch (ValidationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    /// <summary>Removes the current member's signup and promotes the next waiting member.</summary>
    [HttpDelete("{id:guid}/signups")]
    public async Task<ActionResult<SessionDetailDto>> CancelSignup(Guid id, CancellationToken ct)
    {
        try { return Ok(await service.CancelSignupAsync(id, CurrentMemberId, ct)); }
        catch (NotFoundException) { return NotFound(); }
        catch (ConflictException ex) { return Conflict(new { error = ex.Message }); }
    }
}
