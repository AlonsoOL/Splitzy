using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace Splitzy.Database;

[Index(nameof(Email), IsUnique = true)]
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Password { get; set; }
    public string Email { get; set; }
    public string? Address { get; set; }
    public int? Phone { get; set; }
    public string? Birthday { get; set; }
    public string Role { get; set; }

    [NotMapped]
    public IFormFile? ImageUrl { get; set; }
}
