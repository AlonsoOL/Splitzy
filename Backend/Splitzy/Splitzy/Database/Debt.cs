namespace Splitzy.Database
{
    public class Debt
    {
        public int Id { get; set; }
        public int CreditorId { get; set; }
        public User Creditor { get; set; }
        public int DebtorId { get; set; }
        public User Debtor { get; set; }
        public decimal Amount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string Currency { get; set; }
        public bool IsSettled { get; set; } = false;
        public string? Description { get; set; }
    }
}
