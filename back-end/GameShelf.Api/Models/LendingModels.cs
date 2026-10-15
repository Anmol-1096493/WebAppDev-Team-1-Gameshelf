namespace GameShelf.Api.Models;

public enum BoxCondition { AsNew = 0, Good = 1, Used = 2, Worn = 3 }
public enum LoanRequestStatus { Pending = 0, Approved = 1, Rejected = 2 }

/// <summary>A physical box offered for lending, independently of its owner's collection.</summary>
public sealed class LendingBox
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public Guid GameId { get; set; }
    public BoxCondition Condition { get; set; }
    public string ConditionDescription { get; set; } = string.Empty;
    public Member Owner { get; set; } = null!;
    public Game Game { get; set; } = null!;
}

public sealed class LoanRequest
{
    public Guid Id { get; set; }
    public Guid BoxId { get; set; }
    public Guid RequesterId { get; set; }
    public LoanRequestStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public LendingBox Box { get; set; } = null!;
    public Member Requester { get; set; } = null!;
}

/// <summary>An approved request becomes a loan when the box is handed over in person.</summary>
public sealed class Loan
{
    public Guid Id { get; set; }
    public Guid RequestId { get; set; }
    public Guid BoxId { get; set; }
    public Guid BorrowerId { get; set; }
    public DateOnly StartedOn { get; set; }
    public DateOnly DueOn { get; set; }
    public bool IsExtended { get; set; }
    public DateOnly? ReturnedOn { get; set; }
    public Guid? ReturnRecordedById { get; set; }
    public LoanRequest Request { get; set; } = null!;
    public LendingBox Box { get; set; } = null!;
    public Member Borrower { get; set; } = null!;
    public Member? ReturnRecordedBy { get; set; }
}
