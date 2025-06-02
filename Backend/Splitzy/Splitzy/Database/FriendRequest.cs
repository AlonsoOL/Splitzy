namespace Splitzy.Database;

public class FriendRequest
{
    public int Id { get; set; }
    public int SenderId { get; set; }
    public User Sender { get; set; }
    public int RecivedId { get; set; }
    public User Reciver {  get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public bool IsAccepted { get; set; } = false;
    public bool IsHandled {  get; set; } = false ;
}
