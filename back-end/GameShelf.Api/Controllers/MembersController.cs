using GameShelf.Api.Dtos;
using GameShelf.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GameShelf.Api.Controllers;

[ApiController]
[Route("api/members")]
public sealed class MembersController(SessionService service) : AuthenticatedController
{
    /// <summary>Lists club members for session host transfers.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetAll(CancellationToken ct)
        => Ok(await service.ListMembersAsync(ct));
}
