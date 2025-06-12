using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Splitzy.Database
{
    public class Payment
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [MaxLength(500)]
        public string Description { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Amount { get; set; }

        public DateTime CreatedAt { get; set; }

        [Required]
        public int PayerId { get; set; }

        [Required]
        public int ReceiverId { get; set; }

        [Required]
        public Guid GroupId { get; set; }

        [ForeignKey("PayerId")]
        public virtual User Payer { get; set; }

        [ForeignKey("ReceiverId")]
        public virtual User Receiver { get; set; }

        [ForeignKey("GroupId")]
        public virtual Group Group { get; set; }
    }
}
