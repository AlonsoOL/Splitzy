using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Splitzy.Database;
using Splitzy.Services;

namespace Splitzy.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FriendsController : Controller
{
    private MyDbContext _dbContext;
    private readonly UserService _service;

    public FriendsController(MyDbContext dbContext, UserService service)
    {
        _dbContext = dbContext;
        _service = service;
    }

    [HttpGet("friends/{userId}")]
    public async Task<IActionResult> GetFriends(int userId)
    {
        var user = await _dbContext.Users
            .Include(u => u.Friends)
            .ThenInclude(uf => uf.Friend)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
        {
            return NotFound("Usuario no encontrado");
        }

        var friends = user.Friends.Select(f => new
        {
            Id = f.FriendId,
            Name = f.Friend.Name,
            ProfilePicture = f.Friend.ImageUrl
        });

        return Ok(friends);
    }
}
