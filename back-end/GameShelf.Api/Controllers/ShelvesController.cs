
using GameShelf.Api.Dtos;
using GameShelf.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GameShelf.Api.Controllers;

/// <summary>
/// Handles requests for shelves owned by signed-in members.
/// </summary>
[ApiController]
[Route("api/shelves")]
public sealed class ShelvesController(ShelfService service) : AuthenticatedController
{
    // Keep the service so we can handle shelf requests.
    private readonly ShelfService _service = service;

    /// <summary>Gets all shelves owned by the signed-in member.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShelfDto>>> GetAll(CancellationToken ct)
    {
        var shelves = await _service.ListShelvesAsync(CurrentMemberId, ct);
        return Ok(shelves);
    }

    /// <summary>Creates a new shelf for the signed-in member.</summary>
    [HttpPost]
    public async Task<ActionResult<ShelfDto>> Create(
        CreateShelfDto request,
        CancellationToken ct)
    {
        try
        {
            var shelf = await _service.CreateShelfAsync(CurrentMemberId, request, ct);
            return CreatedAtAction(nameof(GetAll), new { id = shelf.Id }, shelf);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }


    /// <summary>Updates a shelf owned by the signed-in member.</summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ShelfDto>> Update(
        Guid id,
        UpdateShelfDto request,
        CancellationToken ct)
    {
        try
        {
            var shelf = await _service.UpdateShelfAsync(
                CurrentMemberId,
                id,
                request,
                ct);

            return Ok(shelf);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ForbiddenException ex)
        {
            return StatusCode(403, new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }


    /// <summary>Deletes a shelf owned by the signed-in member.</summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken ct)
    {
        try
        {
            await _service.DeleteShelfAsync(CurrentMemberId, id, ct);

            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ForbiddenException ex)
        {
            return StatusCode(403, new { error = ex.Message });
        }
    }


    /// <summary>Adds a game from the member's collection to a shelf.</summary>
    [HttpPost("{id:guid}/games")]
    public async Task<IActionResult> AddGame(
        Guid id,
        AddGameToShelfDto request,
        CancellationToken ct)
    {
        try
        {
            await _service.AddGameToShelfAsync(
                CurrentMemberId,
                id,
                request,
                ct);

            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ForbiddenException ex)
        {
            return StatusCode(403, new { error = ex.Message });
        }
        catch (ConflictException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

        /// <summary>Removes a game from a shelf owned by the signed-in member.</summary>
    [HttpDelete("{id:guid}/games/{collectionRecordId:guid}")]
    public async Task<IActionResult> RemoveGame(
        Guid id,
        Guid collectionRecordId,
        CancellationToken ct)
    {
        try
        {
            await _service.RemoveGameFromShelfAsync(
                CurrentMemberId,
                id,
                collectionRecordId,
                ct);

            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ForbiddenException ex)
        {
            return StatusCode(403, new { error = ex.Message });
        }
    }



}
