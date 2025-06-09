namespace Splitzy.Database
{
    public class Payment
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string Currency { get; set; }

        public int ExpenseId { get; set; }
        public Expense Expense { get; set; }

        public int PayerId { get; set; }
        public User Payer { get; set; }

        public ICollection<User> Users { get; set; } = new List<User>();
    }
}
