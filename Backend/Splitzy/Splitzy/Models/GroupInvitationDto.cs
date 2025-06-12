namespace Splitzy.Models;

public class GroupInvitationDto
{
    public int Id { get; set; }
    public Guid GroupId { get; set; }
    public string GroupName { get; set; }
    public string GroupDescription { get; set; }
    public string GroupImageUrl { get; set; }
    public int SenderId { get; set; }
    public string SenderName { get; set; }
    public string SenderImageUrl { get; set; }
    public int InvitedUserId { get; set; }
    public DateTime SentAt { get; set; }
}