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
    private readonly SmartSearchService _smartSearchService;

    public FriendsController(MyDbContext dbContext, UserService service, SmartSearchService smartSearchService)
    {
        _dbContext = dbContext;
        _service = service;
        _smartSearchService = smartSearchService;
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
            Email = f.Friend.Email,
            ProfilePicture = f.Friend.ImageUrl
        });

        return Ok(friends);
    }

    [HttpGet("GetAllUsers")]
    public ActionResult<IEnumerable<User>> Search([FromQuery] string? query)
    {
        var (users, totalPages) = _smartSearchService.Search(query);

        if (users == null)
        {
            return NotFound("El usuario no se ha podido encontrar");
        }

        return Ok(users);
    }
}
