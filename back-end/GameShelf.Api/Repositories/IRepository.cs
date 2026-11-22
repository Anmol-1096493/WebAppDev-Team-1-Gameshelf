using System.Linq.Expressions;
namespace GameShelf.Api.Repositories;

/// <summary>
/// Defines the basic database operations for an entity.
/// </summary>
public interface IRepository<T> where T : class, IEntity
{
    // Get all records from the database.
    Task<IEnumerable<T>> GetAllAsync(CancellationToken ct);

    // Find one record by its ID.
    Task<T?> GetByIdAsync(Guid id, CancellationToken ct);

    // Find records that match a search condition.
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken ct);

    // Find records and include related data, such as the game.
    Task<IEnumerable<T>> FindWithRelatedAsync(Expression<Func<T, bool>> predicate, CancellationToken ct);

    // Add a new record.
    void Add(T entity);

    // Update an existing record.
    void Update(T entity);

    // Delete a record.
    void Delete(T entity);

    // Save all pending changes to the database.
    Task SaveChangesAsync(CancellationToken ct);
}