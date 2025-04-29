namespace Splitzy.Models;

public class RegisterDto
{
    public string Name { get; set; }
    public string Password { get; set; }
    public string Email { get; set; }
    public IFormFile? ImageUrl { get; set; }
}
