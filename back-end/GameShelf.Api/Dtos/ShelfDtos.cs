
namespace GameShelf.Api.Dtos;

/// <summary>
/// Shows one shelf owned by a member.
/// </summary>
public sealed record ShelfDto(
    Guid Id,
    string Name,
    string Description,
    bool IsPublic,
    int GameCount);

/// <summary>
/// Contains the information needed to create a shelf.
/// </summary>
public sealed record CreateShelfDto(
    string Name,
    string Description,
    bool IsPublic);
