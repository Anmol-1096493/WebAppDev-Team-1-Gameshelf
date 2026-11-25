using GameShelf.Api.Data;
using GameShelf.Api.Dtos;
using GameShelf.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace GameShelf.Api.Controllers;

[ApiController]
[Route("api/trade-offers")]
public sealed class TradeOffersController(
    GameShelfDbContext db
) : AuthenticatedController
{
    // POST /api/trade-offers
    // Maakt een nieuwe trade offer aan.
    [HttpPost]
    public async Task<ActionResult<TradeOfferDto>> Create(
        [FromBody] CreateTradeOfferDto input,
        CancellationToken ct)
    {
        // Controleer of de gebruiker is ingelogd.
        var memberId = CurrentMemberId;

        if (memberId == Guid.Empty)
            return Unauthorized();

        // Controleer de ontvangen ID's.
        if (input.WishlistItemId == Guid.Empty ||
            input.RequestedGameId == Guid.Empty)
        {
            return BadRequest(new
            {
                error = "A wishlist item and requested game are required."
            });
        }

        // Zoek het wishlistitem inc eigenaar en spel.
        var wishlistItem = await db.WishlistItems
            .Include(w => w.Owner)
            .Include(w => w.Game)
            .FirstOrDefaultAsync(
                w => w.Id == input.WishlistItemId, ct);

        if (wishlistItem == null)
            return NotFound(new { error = "Wishlist item not found." });

        //  gebruiker mag niet op de eigen wishlist bieden.
        if (wishlistItem.OwnerId == memberId)
        {
            return BadRequest(new
            {
                error = "You cannot make an offer on your own wishlist."
            });
        }

        // vervulde wishlist accepteert geen nieuwe aanbiedingen.
        if (wishlistItem.IsFulfilled)
        {
            return BadRequest(new
            {
                error = "This wishlist item is already fulfilled."
            });
        }

        // Controleer of gewenste spel bestaat.
        var requestedGame = await db.Games
            .FirstOrDefaultAsync(
                g => g.Id == input.RequestedGameId, ct);

        if (requestedGame == null)
        {
            return BadRequest(new
            {
                error = "Requested game not found."
            });
        }

        // Haal de gegevens van de ingelogde gebruiker op.
        var offeredBy = await db.Members
            .FirstOrDefaultAsync(m => m.Id == memberId, ct);

        if (offeredBy == null)
            return Unauthorized();

        // Maak een nieuwe aanbieding aan.
        var offer = new TradeOffer
        {
            Id = Guid.NewGuid(),
            WishlistItemId = wishlistItem.Id,
            OfferedById = memberId,
            RequestedGameId = requestedGame.Id,
            CreatedAt = DateTimeOffset.UtcNow,
            Status = TradeOfferStatus.Open
        };

        // Sla aanbieding op in SQLite.
        db.TradeOffers.Add(offer);
        await db.SaveChangesAsync(ct);

        // Bouw antwoord voor de frontend.
        var result = new TradeOfferDto(
            Id: offer.Id,
            WishlistItemId: offer.WishlistItemId,
            OfferedById: offer.OfferedById,
            OfferedByName: offeredBy.Name,
            WishlistOwnerId: wishlistItem.OwnerId,
            WishlistOwnerName: wishlistItem.Owner.Name,
            OfferedGameId: wishlistItem.GameId,
            OfferedGameTitle: wishlistItem.Game.Title,
            RequestedGameId: requestedGame.Id,
            RequestedGameTitle: requestedGame.Title,
            CreatedAt: offer.CreatedAt,
            Status: offer.Status
        );

        return StatusCode(201, result);
    }

    // GET /api/trade-offers/sent
    [HttpGet("sent")]
    public async Task<ActionResult<List<TradeOfferDto>>> GetSent(
        CancellationToken ct)
    {
        if (CurrentMemberId == Guid.Empty)
            return Unauthorized();

        var offers = await db.TradeOffers
            .AsNoTracking()
            .Include(o => o.OfferedBy)
            .Include(o => o.WishlistItem)
                .ThenInclude(w => w.Owner)
            .Include(o => o.WishlistItem)
                .ThenInclude(w => w.Game)
            .Include(o => o.RequestedGame)
            .Where(o => o.OfferedById == CurrentMemberId)
            .ToListAsync(ct);

        return Ok(offers
            .OrderByDescending(o => o.CreatedAt)
            .Select(ToDto)
            .ToList());
    }

    // GET /api/trade-offers/received
    [HttpGet("received")]
    public async Task<ActionResult<List<TradeOfferDto>>> GetReceived(
        CancellationToken ct)
    {
        if (CurrentMemberId == Guid.Empty)
            return Unauthorized();

        var offers = await db.TradeOffers
            .AsNoTracking()
            .Include(o => o.OfferedBy)
            .Include(o => o.WishlistItem)
                .ThenInclude(w => w.Owner)
            .Include(o => o.WishlistItem)
                .ThenInclude(w => w.Game)
            .Include(o => o.RequestedGame)
            .Where(o => o.WishlistItem.OwnerId == CurrentMemberId)
            .ToListAsync(ct);

        return Ok(offers
            .OrderByDescending(o => o.CreatedAt)
            .Select(ToDto)
            .ToList());
    }

    // POST /api/trade-offers/{id}/accept
    [HttpPost("{id:guid}/accept")]
    public async Task<ActionResult<TradeOfferDto>> Accept(
        Guid id,
        CancellationToken ct)
    {
        if (CurrentMemberId == Guid.Empty)
            return Unauthorized();

        await using var transaction =
            await db.Database.BeginTransactionAsync(
                IsolationLevel.Serializable, ct);

        var offer = await FindOffer(id, ct);

        if (offer == null)
            return NotFound(new { error = "Trade offer not found." });

        if (offer.WishlistItem.OwnerId != CurrentMemberId)
        {
            return StatusCode(403, new
            {
                error = "Only the wishlist owner can accept this offer."
            });
        }

        if (offer.Status != TradeOfferStatus.Open)
        {
            return BadRequest(new
            {
                error = "Only open offers can be accepted."
            });
        }

        if (await IsExpired(offer, ct))
        {
            return BadRequest(new
            {
                error = "This offer has expired."
            });
        }

        if (offer.WishlistItem.IsFulfilled)
        {
            return BadRequest(new
            {
                error = "This wishlist item is already fulfilled."
            });
        }

        offer.Status = TradeOfferStatus.Accepted;

        offer.WishlistItem.IsFulfilled = true;

        // Annuleer andere open aanbiedingen van dezelfde
        var otherOffers = await db.TradeOffers
            .Include(o => o.WishlistItem)
            .Where(o =>
                o.Id != offer.Id &&
                o.OfferedById == offer.OfferedById &&
                o.WishlistItem.GameId == offer.WishlistItem.GameId &&
                o.Status == TradeOfferStatus.Open)
            .ToListAsync(ct);

        foreach (var other in otherOffers)
        {
            other.Status = TradeOfferStatus.Cancelled;
        }

        await db.SaveChangesAsync(ct);
        await transaction.CommitAsync(ct);

        return Ok(ToDto(offer));
    }

    // POST /api/trade-offers/{id}/reject
    [HttpPost("{id:guid}/reject")]
    public async Task<ActionResult<TradeOfferDto>> Reject(
        Guid id,
        CancellationToken ct)
    {
        if (CurrentMemberId == Guid.Empty)
            return Unauthorized();

        var offer = await FindOffer(id, ct);

        if (offer == null)
            return NotFound(new { error = "Trade offer not found." });

        if (offer.WishlistItem.OwnerId != CurrentMemberId)
        {
            return StatusCode(403, new
            {
                error = "Only the wishlist owner can reject this offer."
            });
        }

        if (offer.Status != TradeOfferStatus.Open)
        {
            return BadRequest(new
            {
                error = "Only open offers can be rejected."
            });
        }

        if (await IsExpired(offer, ct))
        {
            return BadRequest(new
            {
                error = "This offer has expired."
            });
        }

        offer.Status = TradeOfferStatus.Rejected;

        await db.SaveChangesAsync(ct);

        return Ok(ToDto(offer));
    }

    // POST /api/trade-offers/{id}/cancel
    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult<TradeOfferDto>> Cancel(
        Guid id,
        CancellationToken ct)
    {
        if (CurrentMemberId == Guid.Empty)
            return Unauthorized();

        var offer = await FindOffer(id, ct);

        if (offer == null)
            return NotFound(new { error = "Trade offer not found." });

        if (offer.OfferedById != CurrentMemberId)
        {
            return StatusCode(403, new
            {
                error = "Only the sender can cancel this offer."
            });
        }

        if (offer.Status != TradeOfferStatus.Open)
        {
            return BadRequest(new
            {
                error = "Only open offers can be cancelled."
            });
        }

        if (await IsExpired(offer, ct))
        {
            return BadRequest(new
            {
                error = "This offer has expired."
            });
        }

        offer.Status = TradeOfferStatus.Cancelled;

        await db.SaveChangesAsync(ct);

        return Ok(ToDto(offer));
    }

    private async Task<TradeOffer?> FindOffer(
        Guid id,
        CancellationToken ct)
    {
        return await db.TradeOffers
            .Include(o => o.OfferedBy)
            .Include(o => o.WishlistItem)
                .ThenInclude(w => w.Owner)
            .Include(o => o.WishlistItem)
                .ThenInclude(w => w.Game)
            .Include(o => o.RequestedGame)
            .FirstOrDefaultAsync(o => o.Id == id, ct);
    }

    // Controleert of de geldigheidsduur is verstreken.
    private async Task<bool> IsExpired(
        TradeOffer offer,
        CancellationToken ct)
    {
        var policy = await db.ClubPolicies
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == 1, ct);

        var validityDays = policy?.OfferValidityDays ?? 14;

        return DateTimeOffset.UtcNow >=
            offer.CreatedAt.AddDays(validityDays);
    }

    // Zet een databaseobject om naar een DTO.
    private static TradeOfferDto ToDto(TradeOffer offer)
    {
        return new TradeOfferDto(
            Id: offer.Id,
            WishlistItemId: offer.WishlistItemId,
            OfferedById: offer.OfferedById,
            OfferedByName: offer.OfferedBy.Name,
            WishlistOwnerId: offer.WishlistItem.OwnerId,
            WishlistOwnerName: offer.WishlistItem.Owner.Name,
            OfferedGameId: offer.WishlistItem.GameId,
            OfferedGameTitle: offer.WishlistItem.Game.Title,
            RequestedGameId: offer.RequestedGameId,
            RequestedGameTitle: offer.RequestedGame.Title,
            CreatedAt: offer.CreatedAt,
            Status: offer.Status
        );
    }
}
