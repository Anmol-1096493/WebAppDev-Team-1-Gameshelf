using GameShelf.Api.Data;
using GameShelf.Api.Dtos;
using GameShelf.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameShelf.Api.Controllers;

[ApiController]
[Route("api/wishlists")]
public sealed class WishlistsController(
    GameShelfDbContext db
) : AuthenticatedController
{
    private static WishlistItemDto ToDto(WishlistItem item)
    {
        return new WishlistItemDto(
            item.Id,
            item.OwnerId,
            item.Owner.Name,
            item.GameId,
            item.Game.Title,
            item.Priority,
            item.Note,
            item.IsFulfilled
        );
    }

    // GET /api/wishlists
    [HttpGet]
    public async Task<ActionResult<List<WishlistItemDto>>> GetAll(
        CancellationToken ct)
    {
        var items = await db.WishlistItems
            .AsNoTracking()
            .Include(w => w.Owner)
            .Include(w => w.Game)
            .OrderBy(w => w.Game.Title)
            .ToListAsync(ct);

        return Ok(items.Select(ToDto).ToList());
    }

    // GET /api/wishlists/mine
    [HttpGet("mine")]
    public async Task<ActionResult<List<WishlistItemDto>>> GetMine(
        CancellationToken ct)
    {
        var items = await db.WishlistItems
            .AsNoTracking()
            .Include(w => w.Owner)
            .Include(w => w.Game)
            .Where(w => w.OwnerId == CurrentMemberId)
            .OrderBy(w => w.Game.Title)
            .ToListAsync(ct);

        return Ok(items.Select(ToDto).ToList());
    }

    // GET /api/wishlists/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WishlistItemDto>> GetById(
        Guid id,
        CancellationToken ct)
    {
        var item = await db.WishlistItems
            .AsNoTracking()
            .Include(w => w.Owner)
            .Include(w => w.Game)
            .FirstOrDefaultAsync(w => w.Id == id, ct);

        if (item is null)
            return NotFound(new { error = "Wishlist item not found." });

        return Ok(ToDto(item));
    }

    // POST /api/wishlists
    [HttpPost]
    public async Task<ActionResult<WishlistItemDto>> Create(
        CreateWishlistItemDto input,
        CancellationToken ct)
    {
        if (!Enum.IsDefined(input.Priority))
            return BadRequest(new { error = "Invalid priority." });

        if (input.Note is null || input.Note.Length > 500)
            return BadRequest(new { error = "Note must be at most 500 characters." });

        var gameExists = await db.Games
            .AnyAsync(g => g.Id == input.GameId, ct);

        if (!gameExists)
            return BadRequest(new { error = "Game does not exist." });

        var alreadyExists = await db.WishlistItems
            .AnyAsync(w =>
                w.OwnerId == CurrentMemberId &&
                w.GameId == input.GameId, ct);

        if (alreadyExists)
            return Conflict(new { error = "This game is already on your wishlist." });

        var item = new WishlistItem
        {
            Id = Guid.NewGuid(),
            OwnerId = CurrentMemberId,
            GameId = input.GameId,
            Priority = input.Priority,
            Note = input.Note.Trim(),
            IsFulfilled = false
        };

        db.WishlistItems.Add(item);
        await db.SaveChangesAsync(ct);

        // Laad de relaties voor de response.
        var created = await db.WishlistItems
            .AsNoTracking()
            .Include(w => w.Owner)
            .Include(w => w.Game)
            .FirstAsync(w => w.Id == item.Id, ct);

        return CreatedAtAction(
            nameof(GetById),
            new { id = item.Id },
            ToDto(created)
        );
    }

    // PUT /api/wishlists/{id}
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<WishlistItemDto>> Update(
        Guid id,
        UpdateWishlistItemDto input,
        CancellationToken ct)
    {
        var item = await db.WishlistItems
            .Include(w => w.Owner)
            .Include(w => w.Game)
            .FirstOrDefaultAsync(w => w.Id == id, ct);

        if (item is null)using GameShelf.Api.Data;
using GameShelf.Api.Dtos;
using GameShelf.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GameShelf.Api.Controllers;

[ApiController]
[Route("api/wishlists")]
public sealed class WishlistsController(
    GameShelfDbContext db
) : AuthenticatedController
{
    private static WishlistItemDto ToDto(WishlistItem item)
    {
        return new WishlistItemDto(
            item.Id,
            item.OwnerId,
            item.Owner.Name,
            item.GameId,
            item.Game.Title,
            item.Priority,
            item.Note,
            item.IsFulfilled
        );
    }

    // GET /api/wishlists
    [HttpGet]
    public async Task<ActionResult<List<WishlistItemDto>>> GetAll(
        CancellationToken ct)
    {
        var items = await db.WishlistItems
            .AsNoTracking()
            .Include(w => w.Owner)
            .Include(w => w.Game)
            .OrderBy(w => w.Game.Title)
            .ToListAsync(ct);

        return Ok(items.Select(ToDto).ToList());
    }

    // GET /api/wishlists/mine
    [HttpGet("mine")]
    public async Task<ActionResult<List<WishlistItemDto>>> GetMine(
        CancellationToken ct)
    {
        var items = await db.WishlistItems
            .AsNoTracking()
            .Include(w => w.Owner)
            .Include(w => w.Game)
            .Where(w => w.OwnerId == CurrentMemberId)
            .OrderBy(w => w.Game.Title)
            .ToListAsync(ct);

        return Ok(items.Select(ToDto).ToList());
    }

    // GET /api/wishlists/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<WishlistItemDto>> GetById(
        Guid id,
        CancellationToken ct)
    {
        var item = await db.WishlistItems
            .AsNoTracking()
            .Include(w => w.Owner)
            .Include(w => w.Game)
            .FirstOrDefaultAsync(w => w.Id == id, ct);

        if (item is null)
            return NotFound(new { error = "Wishlist item not found." });

        return Ok(ToDto(item));
    }

    // POST /api/wishlists
    [HttpPost]
    public async Task<ActionResult<WishlistItemDto>> Create(
        CreateWishlistItemDto input,
        CancellationToken ct)
    {
        if (!Enum.IsDefined(input.Priority))
            return BadRequest(new { error = "Invalid priority." });

        if (input.Note is null || input.Note.Length > 500)
            return BadRequest(new { error = "Note must be at most 500 characters." });

        var gameExists = await db.Games
            .AnyAsync(g => g.Id == input.GameId, ct);

        if (!gameExists)
            return BadRequest(new { error = "Game does not exist." });

        var alreadyExists = await db.WishlistItems
            .AnyAsync(w =>
                w.OwnerId == CurrentMemberId &&
                w.GameId == input.GameId, ct);

        if (alreadyExists)
            return Conflict(new { error = "This game is already on your wishlist." });

        var item = new WishlistItem
        {
            Id = Guid.NewGuid(),
            OwnerId = CurrentMemberId,
            GameId = input.GameId,
            Priority = input.Priority,
            Note = input.Note.Trim(),
            IsFulfilled = false
        };

        db.WishlistItems.Add(item);
        await db.SaveChangesAsync(ct);

        // Laad de relaties voor de response.
        var created = await db.WishlistItems
            .AsNoTracking()
            .Include(w => w.Owner)
            .Include(w => w.Game)
            .FirstAsync(w => w.Id == item.Id, ct);

        return CreatedAtAction(
            nameof(GetById),
            new { id = item.Id },
            ToDto(created)
        );
    }

    // PUT /api/wishlists/{id}
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<WishlistItemDto>> Update(
        Guid id,
        UpdateWishlistItemDto input,
        CancellationToken ct)
    {
        var item = await db.WishlistItems
            .Include(w => w.Owner)
            .Include(w => w.Game)
            .FirstOrDefaultAsync(w => w.Id == id, ct);

        if (item is null)
            return NotFound(new { error = "Wishlist item not found." });

        if (item.OwnerId != CurrentMemberId)
            return Forbid();

        if (item.IsFulfilled)
            return Conflict(new { error = "A fulfilled wishlist item cannot be edited." });

        if (!Enum.IsDefined(input.Priority))
            return BadRequest(new { error = "Invalid priority." });

        if (input.Note is null || input.Note.Length > 500)
            return BadRequest(new { error = "Note must be at most 500 characters." });

        var game = await db.Games
            .FirstOrDefaultAsync(g => g.Id == input.GameId, ct);

        if (game is null)
            return BadRequest(new { error = "Game does not exist." });

        var duplicate = await db.WishlistItems
            .AnyAsync(w =>
                w.Id != id &&
                w.OwnerId == CurrentMemberId &&
                w.GameId == input.GameId, ct);

        if (duplicate)
            return Conflict(new { error = "This game is already on your wishlist." });

        item.GameId = input.GameId;
        item.Game = game;
        item.Priority = input.Priority;
        item.Note = input.Note.Trim();

        await db.SaveChangesAsync(ct);

        return Ok(ToDto(item));
    }
}

            return NotFound(new { error = "Wishlist item not found." });

        if (item.OwnerId != CurrentMemberId)
            return Forbid();

        if (item.IsFulfilled)
            return Conflict(new { error = "A fulfilled wishlist item cannot be edited." });

        if (!Enum.IsDefined(input.Priority))
            return BadRequest(new { error = "Invalid priority." });

        if (input.Note is null || input.Note.Length > 500)
            return BadRequest(new { error = "Note must be at most 500 characters." });

        var game = await db.Games
            .FirstOrDefaultAsync(g => g.Id == input.GameId, ct);

        if (game is null)
            return BadRequest(new { error = "Game does not exist." });

        var duplicate = await db.WishlistItems
            .AnyAsync(w =>
                w.Id != id &&
                w.OwnerId == CurrentMemberId &&
                w.GameId == input.GameId, ct);

        if (duplicate)
            return Conflict(new { error = "This game is already on your wishlist." });

        item.GameId = input.GameId;
        item.Game = game;
        item.Priority = input.Priority;
        item.Note = input.Note.Trim();

        await db.SaveChangesAsync(ct);

        return Ok(ToDto(item));
    }
}
