
using GameShelf.Api.Dtos;
using GameShelf.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GameShelf.Api.Controllers;

/// <summary>
/// Handles requests for a member's game collection.
/// </summary>
[ApiController]
[Route("api/collections")]
public sealed class CollectionsController(CollectionService service)
    : AuthenticatedController
{
    // Get the collection of the signed-in member.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CollectionRecordDto>>> GetMyCollection(
        CancellationToken ct)
    {
        var records = await service.ListCollectionAsync(CurrentMemberId, ct);
        return Ok(records);
    }

    // Add a game to the signed-in member's collection.
    [HttpPost]
    public async Task<ActionResult<CollectionRecordDto>> AddToCollection(
        CreateCollectionRecordDto request,
        CancellationToken ct)
    {
        try
        {
            var record = await service.AddToCollectionAsync(
                CurrentMemberId,
                request,
                ct);

            return StatusCode(StatusCodes.Status201Created, record);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ConflictException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    // Update a game in the signed-in member's collection.
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CollectionRecordDto>> UpdateCollection(
        Guid id,
        UpdateCollectionRecordDto request,
        CancellationToken ct)
    {
        try
        {
            var record = await service.UpdateCollectionAsync(
                CurrentMemberId,
                id,
                request,
                ct);

            return Ok(record);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ValidationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
