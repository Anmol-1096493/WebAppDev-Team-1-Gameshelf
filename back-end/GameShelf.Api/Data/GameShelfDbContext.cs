using GameShelf.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GameShelf.Api.Data;

public sealed class GameShelfDbContext(DbContextOptions<GameShelfDbContext> options) : DbContext(options)
{
    public DbSet<Member> Members => Set<Member>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Signup> Signups => Set<Signup>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Member>(e =>
        {
            e.HasKey(m => m.Id);
            e.HasIndex(m => m.UserName).IsUnique();
        });

        modelBuilder.Entity<Game>(e =>
        {
            e.HasKey(g => g.Id);
        });

        modelBuilder.Entity<Session>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasMany(s => s.Signups)
             .WithOne(su => su.Session)
             .HasForeignKey(su => su.SessionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Signup>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasOne(s => s.Member)
             .WithMany()
             .HasForeignKey(s => s.MemberId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(s => s.Game)
             .WithMany()
             .HasForeignKey(s => s.GameId)
             .OnDelete(DeleteBehavior.SetNull);
        });
    }
}