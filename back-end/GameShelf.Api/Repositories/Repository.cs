
using GameShelf.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace GameShelf.Api.Repositories;

/// <summary>
/// Handles basic database operations for different entity types.
/// </summary>
public class Repository<T>(GameShelfDbContext context) : IRepository<T>
    where T : class, IEntity
{
    // Keep the database context so we can access the data.
    private readonly GameShelfDbContext _context = context;

    // Get all records from the database.
    public async Task<IEnumerable<T>> GetAllAsync(CancellationToken ct)
    {
        return await _context.Set<T>().ToListAsync(ct);
    }

    // Find one record by its ID.
    public async Task<T?> GetByIdAsync(Guid id, CancellationToken ct)
    {
        return await _context.Set<T>().FindAsync([id], ct);
    }

    // Add a new record to the database.
    public void Add(T entity)
    {
        _context.Set<T>().Add(entity);
    }

    // Update an existing record.
    public void Update(T entity)
    {
        _context.Set<T>().Update(entity);
    }

    // Delete a record from the database.
    public void Delete(T entity)
    {
        _context.Set<T>().Remove(entity);
    }

    // Save all pending changes to the database.
    public async Task SaveChangesAsync(CancellationToken ct)
    {
        await _context.SaveChangesAsync(ct);
    }
}
