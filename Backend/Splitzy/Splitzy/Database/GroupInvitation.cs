using System.ComponentModel.DataAnnotations;

namespace Splitzy.Database;

public class GroupInvitation
{
    [Key]
    public int Id { get; set; }

    public Guid GroupId { get; set; }
    public Group Group { get; set; }

    public int SenderId { get; set; }
    public User Sender { get; set; }

    public int InvitedUserId { get; set; }
    public User InvitedUser { get; set; }

    public DateTime SentAt { get; set; }
    public bool IsAccepted { get; set; }
    public bool IsHandled { get; set; }
    public DateTime? HandledAt { get; set; }
}
