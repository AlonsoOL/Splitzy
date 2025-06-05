namespace Splitzy.Database
{
    public class Expense
    {
        public int Id { get; set; }

        public string Name { get; set; }
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string Currency { get; set; }
        public int GroupId { get; set; }
        public Group Group { get; set; }

        public ICollection<Debt> Debts { get; set; }

        public ICollection<Payment> Payments { get; set; }
    }
}
