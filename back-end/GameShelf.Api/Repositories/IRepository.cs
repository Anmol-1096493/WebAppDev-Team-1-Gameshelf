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

    // Add a new record.
    void Add(T entity);

    // Update an existing record.
    void Update(T entity);

    // Delete a record.
    void Delete(T entity);

    // Save all pending changes to the database.
    Task SaveChangesAsync(CancellationToken ct);
}