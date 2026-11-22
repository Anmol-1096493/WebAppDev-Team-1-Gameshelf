
using System.Security.Claims;
using GameShelf.Api.Data;
using GameShelf.Api.Dtos;
using GameShelf.Api.Models;
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
    /// <summary>Creates a new member account.</summary>
    [HttpPost("register")]
    public async Task<ActionResult<MemberDto>> Register(
        [FromBody] RegisterDto dto,
        CancellationToken ct)
    {
        // Check that all required fields are filled in.
        if (string.IsNullOrWhiteSpace(dto.Name) ||
            string.IsNullOrWhiteSpace(dto.UserName) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { error = "Name, username and password are required." });
        }

        // Check that the password is long enough.
        if (dto.Password.Length < 8)
        {
            return BadRequest(new { error = "Password must be at least 8 characters long." });
        }

        // Use a consistent format for usernames.
        var userName = dto.UserName.Trim().ToLowerInvariant();

        // Check if the username is already taken.
        var usernameExists = await db.Members.AnyAsync(
            member => member.UserName == userName,
            ct);

        if (usernameExists)
        {
            return Conflict(new { error = "This username is already taken." });
        }

        // Create the new member and safely hash the password.
        var member = new Member
        {
            Id = Guid.NewGuid(),
            Name = dto.Name.Trim(),
            UserName = userName,
            IsCommittee = false,
            PasswordHash = PasswordHasher.Hash(dto.Password)
        };

        db.Members.Add(member);
        await db.SaveChangesAsync(ct);

        // Return the new member without exposing the password hash.
        var result = new MemberDto(member.Id, member.Name, member.IsCommittee);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    /// <summary>Checks a member's credentials and returns a bearer token.</summary>
    [HttpPost("login")]
    public async Task<ActionResult<LoginResultDto>> Login(
        [FromBody] LoginDto dto,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(dto.UserName) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new { error = "Username and password are required." });
        }

        var userName = dto.UserName.Trim().ToLowerInvariant();
        var member = await db.Members.FirstOrDefaultAsync(
            m => m.UserName == userName,
            ct);

        if (member is null || !PasswordHasher.Verify(dto.Password, member.PasswordHash))
        {
            return Unauthorized(new { error = "Unknown username or wrong password." });
        }

        if (PasswordHasher.NeedsRehash(member.PasswordHash))
        {
            member.PasswordHash = PasswordHasher.Hash(dto.Password);
            await db.SaveChangesAsync(ct);
        }

        var token = tokens.Create(member.Id);
        return Ok(new LoginResultDto(
            new MemberDto(member.Id, member.Name, member.IsCommittee),
            token));
    }

    /// <summary>Returns the member identified by the bearer token.</summary>
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<MemberDto>> Me(CancellationToken ct)
    {
        var id = CurrentMemberId;
        if (id is null)
        {
            return Unauthorized();
        }

        var member = await db.Members.FirstOrDefaultAsync(
            m => m.Id == id.Value,
            ct);

        return member is null
            ? Unauthorized()
            : Ok(new MemberDto(member.Id, member.Name, member.IsCommittee));
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
