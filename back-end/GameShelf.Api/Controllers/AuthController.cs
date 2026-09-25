using System.Security.Claims;
using GameShelf.Api.Data;
using GameShelf.Api.Dtos;
using GameShelf.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameShelf.Api.Controllers;

public sealed record LoginDto(string UserName, string Password);
public sealed record LoginResultDto(MemberDto Member, string Token);

[ApiController]
[Route("api/auth")]
public sealed class AuthController(GameShelfDbContext db, TokenService tokens) : ControllerBase
{
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.UserName) || string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest(new { error = "Username and password are required." });

        var member = await db.Members.FirstOrDefaultAsync(m => m.UserName == dto.UserName.ToLowerInvariant(), ct);
        if (member is null || !PasswordHasher.Verify(dto.Password, member.PasswordHash))
            return Unauthorized(new { error = "Unknown username or wrong password." });

        var token = tokens.Create(member.Id);
        return Ok(new LoginResultDto(new MemberDto(member.Id, member.Name, member.IsCommittee), token));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me(CancellationToken ct)
    {
        var id = CurrentMemberId;
        if (id is null) return Unauthorized();
        var member = await db.Members.FirstOrDefaultAsync(m => m.Id == id.Value, ct);
        return member is null ? Unauthorized() : Ok(new MemberDto(member.Id, member.Name, member.IsCommittee));
    }

    public Guid? CurrentMemberId
    {
        get
        {
            var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(id, out var parsed) ? parsed : null;
        }
    }
}