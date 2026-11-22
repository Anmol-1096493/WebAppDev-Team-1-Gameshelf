
namespace GameShelf.Api.Repositories;

/// <summary>
/// Represents an object with a unique ID.
/// </summary>
public interface IEntity
{
    // Every entity must have a unique ID.
    Guid Id { get; set; }
}
