namespace Splitzy.Models;

public class GroupInvitationRequestDto
{
    public Guid GroupId { get; set; }
    public int SenderId { get; set; }
    public int InvitedUserId { get; set; }
}
