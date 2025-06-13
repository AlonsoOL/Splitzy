using System.ComponentModel.DataAnnotations;

namespace Splitzy.Database;

public class Group
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; }

    [MaxLength(500)]
    public string Description { get; set; }

    [MaxLength(255)]
    public string ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<User> Users { get; set; } = new List<User>();
    public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public virtual ICollection<Debt> Debts { get; set; } = new List<Debt>();
}
