using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GameShelf.Api.Controllers;

/// <summary>Requires a bearer token and exposes the signed-in member's ID.</summary>
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
