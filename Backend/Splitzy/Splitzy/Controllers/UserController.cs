using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Splitzy.Database;

namespace Splitzy.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private MyDbContext _dbContext;

    public UserController(MyDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public IEnumerable<User> GetUsers()
    {
        return _dbContext.Users;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("GetCurrentUser")]
    public async Task<ActionResult<int>>GetCurrentUser(int id) 
    {
        var user = await _dbContext.Users
            .FindAsync(id);

        if (user == null) 
        {
            return NotFound("El usuario no se ha podido encontrar");
        }

        return Ok(user);
    }
}
