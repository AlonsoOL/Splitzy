using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Splitzy.Database
{
    public class Debt
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime? SettledAt { get; set; }
        public bool IsSettled { get; set; } = false;

        [Required]
        public int DebtorId { get; set; }

        [Required]
        public int CreditorId { get; set; }

        [Required]
        public Guid GroupId { get; set; }

        [ForeignKey("DebtorId")]
        public virtual User Debtor { get; set; }

        [ForeignKey("CreditorId")]
        public virtual User Creditor { get; set; }

        [ForeignKey("GroupId")]
        public virtual Group Group { get; set; }
    }
}
