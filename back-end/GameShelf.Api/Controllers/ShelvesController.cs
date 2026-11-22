
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
}
