namespace Splitzy.Models;

public class FriendRequestDto
{
    public int id {  get; set; }
    public int senderId { get; set; }
    public int recivedId {  get; set; }
    public string senderName { get; set; }
    public string senderImageUrl { get; set; }
}
