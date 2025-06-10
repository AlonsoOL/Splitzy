namespace Splitzy.Database
{
    public class Payment
    {
        public int Id { get; set; }
        public Guid GroupId { get; set; }
        public int PayerId { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int ExpenseId { get; set; }
        public Expense Expense { get; set; }

    }
}
