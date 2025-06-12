using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace Splitzy.Database;

[Index(nameof(Email), IsUnique = true)]
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Password { get; set; }
    public string Email { get; set; }
    public string? Address { get; set; }
    public int? Phone { get; set; }
    public string? Birthday { get; set; }
    public string Role { get; set; }
    public string? ImageUrl { get; set; }

    public ICollection<UserFriend> Friends { get; set; }
    public ICollection<UserFriend> FriendOf { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<Group> Groups { get; set; } = new List<Group>();
    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public virtual ICollection<Payment> PaymentsMade { get; set; } = new List<Payment>();
    public virtual ICollection<Payment> PaymentsReceived { get; set; } = new List<Payment>();
    public virtual ICollection<Debt> DebtsOwed { get; set; } = new List<Debt>();
    public virtual ICollection<Debt> CreditsOwed { get; set; } = new List<Debt>();

}
