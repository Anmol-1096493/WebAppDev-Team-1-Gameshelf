using GameShelf.Api.Dtos;
using GameShelf.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace GameShelf.Api.Controllers;

[ApiController]
[Route("api/games")]
public sealed class GamesController(SessionService service) : AuthenticatedController
{
    /// <summary>Lists catalogue games that members can bring to sessions.</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GameDto>>> GetAll(CancellationToken ct)
        => Ok(await service.ListGamesAsync(ct));
}
