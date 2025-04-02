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

    [HttpGet]
    public IEnumerable<User> GetUsers()
    {
        return _dbContext.Users;
    }
}
