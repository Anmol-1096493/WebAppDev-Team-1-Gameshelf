using GameShelf.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GameShelf.Api.Data;

public sealed class GameShelfDbContext(DbContextOptions<GameShelfDbContext> options) : DbContext(options)
{
    public DbSet<Member> Members => Set<Member>();
    public DbSet<Game> Games => Set<Game>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Signup> Signups => Set<Signup>();
    public DbSet<CollectionRecord> CollectionRecords => Set<CollectionRecord>();
    public DbSet<Shelf> Shelves => Set<Shelf>();
    public DbSet<ShelfGame> ShelfGames => Set<ShelfGame>();
    public DbSet<LendingBox> LendingBoxes => Set<LendingBox>();
    public DbSet<LoanRequest> LoanRequests => Set<LoanRequest>();
    public DbSet<Loan> Loans => Set<Loan>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<TradeOffer> TradeOffers => Set<TradeOffer>();
    public DbSet<ClubPolicy> ClubPolicies => Set<ClubPolicy>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Member>(e =>
        {
            e.HasKey(m => m.Id);
            e.Property(m => m.UserName).UseCollation("NOCASE");
            e.HasIndex(m => m.UserName).IsUnique();
            e.ToTable(t => t.HasCheckConstraint("CK_Members_Identity",
                "length(trim(\"Name\")) > 0 AND length(trim(\"UserName\")) > 0 AND length(\"PasswordHash\") > 0"));
        });

        modelBuilder.Entity<Game>(e =>
        {
            e.HasKey(g => g.Id);
            e.HasIndex(g => new { g.Title, g.Publisher, g.ReleaseYear, g.Language, g.Edition }).IsUnique();
            e.ToTable(t =>
            {
                t.HasCheckConstraint("CK_Games_Players", "\"MinPlayers\" >= 1 AND \"MaxPlayers\" >= \"MinPlayers\"");
                t.HasCheckConstraint("CK_Games_Metadata", "length(trim(\"Title\")) > 0 AND \"PlayingTimeMinutes\" >= 0 AND \"ReleaseYear\" BETWEEN 0 AND 9999");
            });
        });

        modelBuilder.Entity<Session>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasOne(s => s.Host).WithMany().HasForeignKey(s => s.HostId).OnDelete(DeleteBehavior.Restrict);
            e.ToTable(t => t.HasCheckConstraint("CK_Sessions_Details",
                "\"Capacity\" >= 1 AND length(trim(\"Title\")) > 0 AND length(trim(\"Place\")) > 0"));
            e.HasMany(s => s.Signups)
             .WithOne(su => su.Session)
             .HasForeignKey(su => su.SessionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Signup>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasIndex(s => new { s.SessionId, s.MemberId }).IsUnique();
            e.ToTable(t => t.HasCheckConstraint("CK_Signups_Status", "\"Status\" IN (0, 1)"));
            e.HasOne(s => s.Member)
             .WithMany()
             .HasForeignKey(s => s.MemberId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(s => s.Game)
             .WithMany()
             .HasForeignKey(s => s.GameId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<CollectionRecord>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasIndex(r => new { r.OwnerId, r.GameId }).IsUnique();
            e.HasOne(r => r.Owner).WithMany().HasForeignKey(r => r.OwnerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Game).WithMany().HasForeignKey(r => r.GameId).OnDelete(DeleteBehavior.Restrict);
            e.ToTable(t =>
            {
                t.HasCheckConstraint("CK_CollectionRecords_Status", "\"Status\" IN (0, 1, 2)");
                t.HasCheckConstraint("CK_CollectionRecords_Plays", "\"PlayCount\" >= 0");
                t.HasCheckConstraint("CK_CollectionRecords_Rating", "\"Rating\" IS NULL OR (\"Rating\" BETWEEN 1 AND 10 AND \"Status\" = 2 AND \"PlayCount\" > 0)");
            });
        });

        modelBuilder.Entity<Shelf>(e =>
        {
            e.HasKey(s => s.Id);
            e.HasOne(s => s.Owner).WithMany().HasForeignKey(s => s.OwnerId).OnDelete(DeleteBehavior.Restrict);
            e.ToTable(t => t.HasCheckConstraint("CK_Shelves_Name", "length(trim(\"Name\")) > 0"));
        });

        modelBuilder.Entity<ShelfGame>(e =>
        {
            e.HasKey(s => new { s.ShelfId, s.CollectionRecordId });
            e.HasOne(s => s.Shelf).WithMany(s => s.Games).HasForeignKey(s => s.ShelfId).OnDelete(DeleteBehavior.Cascade);
            // Removing a collection record also removes its links from every shelf.
            e.HasOne(s => s.CollectionRecord).WithMany().HasForeignKey(s => s.CollectionRecordId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LendingBox>(e =>
        {
            e.HasKey(b => b.Id);
            e.HasOne(b => b.Owner).WithMany().HasForeignKey(b => b.OwnerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(b => b.Game).WithMany().HasForeignKey(b => b.GameId).OnDelete(DeleteBehavior.Restrict);
            e.ToTable(t => t.HasCheckConstraint("CK_LendingBoxes_Condition", "\"Condition\" IN (0, 1, 2, 3)"));
        });

        modelBuilder.Entity<LoanRequest>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasOne(r => r.Box).WithMany().HasForeignKey(r => r.BoxId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Requester).WithMany().HasForeignKey(r => r.RequesterId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(r => new { r.BoxId, r.RequesterId }).IsUnique().HasFilter("\"Status\" = 0");
            e.ToTable(t => t.HasCheckConstraint("CK_LoanRequests_Status", "\"Status\" IN (0, 1, 2)"));
        });

        modelBuilder.Entity<Loan>(e =>
        {
            e.HasKey(l => l.Id);
            e.HasOne(l => l.Request).WithMany().HasForeignKey(l => l.RequestId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(l => l.Box).WithMany().HasForeignKey(l => l.BoxId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(l => l.Borrower).WithMany().HasForeignKey(l => l.BorrowerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(l => l.ReturnRecordedBy).WithMany().HasForeignKey(l => l.ReturnRecordedById).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(l => l.RequestId).IsUnique();
            // A box can have at most one loan without a recorded return date.
            e.HasIndex(l => l.BoxId).IsUnique().HasFilter("\"ReturnedOn\" IS NULL");
            e.ToTable(t =>
            {
                t.HasCheckConstraint("CK_Loans_Dates", "\"DueOn\" >= \"StartedOn\" AND (\"ReturnedOn\" IS NULL OR \"ReturnedOn\" >= \"StartedOn\")");
                t.HasCheckConstraint("CK_Loans_Return", "(\"ReturnedOn\" IS NULL AND \"ReturnRecordedById\" IS NULL) OR (\"ReturnedOn\" IS NOT NULL AND \"ReturnRecordedById\" IS NOT NULL)");
            });
        });

        modelBuilder.Entity<WishlistItem>(e =>
        {
            e.HasKey(w => w.Id);
            e.HasOne(w => w.Owner).WithMany().HasForeignKey(w => w.OwnerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(w => w.Game).WithMany().HasForeignKey(w => w.GameId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(w => new { w.OwnerId, w.GameId }).IsUnique();
            e.ToTable(t => t.HasCheckConstraint("CK_WishlistItems_Priority", "\"Priority\" IN (0, 1, 2)"));
        });

        modelBuilder.Entity<TradeOffer>(e =>
        {
            e.HasKey(o => o.Id);
            e.HasOne(o => o.WishlistItem).WithMany().HasForeignKey(o => o.WishlistItemId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(o => o.OfferedBy).WithMany().HasForeignKey(o => o.OfferedById).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(o => o.RequestedGame).WithMany().HasForeignKey(o => o.RequestedGameId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(o => new { o.WishlistItemId, o.Status });
            e.ToTable(t => t.HasCheckConstraint("CK_TradeOffers_Status", "\"Status\" IN (0, 1, 2, 3)"));
        });

        modelBuilder.Entity<ClubPolicy>(e =>
        {
            e.HasKey(p => p.Id);
            e.ToTable(t => t.HasCheckConstraint("CK_ClubPolicies_Limits", "\"Id\" = 1 AND \"MaximumLoanDays\" > 0 AND \"OfferValidityDays\" > 0"));
        });
    }
}
