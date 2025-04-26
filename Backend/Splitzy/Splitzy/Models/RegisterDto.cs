namespace Splitzy.Models;

public class RegisterDto
{
    public string Name { get; set; }
    public string Password { get; set; }
    public string Email { get; set; }
    public int Phone { get; set; }
    public string Address { get; set; }
    public string? Birthday { get; set; }

}
