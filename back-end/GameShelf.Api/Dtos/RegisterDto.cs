
namespace GameShelf.Api.Dtos;

/// <summary>
/// Contains the information needed to register a new member.
/// </summary>
public sealed record RegisterDto(
    string Name,
    string UserName,
    string Password);
