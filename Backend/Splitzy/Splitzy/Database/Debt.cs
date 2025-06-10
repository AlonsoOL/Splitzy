namespace Splitzy.Database
{
    public class Debt
    {
        public int Id { get; set; }
        public Guid GroupId { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool IsSettled { get; set; } = false;
        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();





    }
}
