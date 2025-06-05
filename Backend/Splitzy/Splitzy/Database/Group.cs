namespace Splitzy.Database;

public class Group
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required ICollection<User> Users { get; set; }

    public ICollection<Expense>? Expenses { get; set; } 

    public ICollection<Debt>? Debts { get; set; }

    public ICollection<Payment>? Payments { get; set; }

    public string? ImageUrl { get; set; }

    public DateTime? CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;

    public string? Description { get; set; }

    public string? Currency { get; set; }

}
