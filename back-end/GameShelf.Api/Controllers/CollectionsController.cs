
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
}
