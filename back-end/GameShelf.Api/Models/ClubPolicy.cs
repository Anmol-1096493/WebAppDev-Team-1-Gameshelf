namespace GameShelf.Api.Models;

/// <summary>Configurable club limits; the assignment does not prescribe their numeric values.</summary>
public sealed class ClubPolicy
{
    public int Id { get; set; } = 1;
    public int MaximumLoanDays { get; set; } = 30;
    public int OfferValidityDays { get; set; } = 14;
}
