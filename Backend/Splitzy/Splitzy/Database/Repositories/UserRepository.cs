using Microsoft.EntityFrameworkCore;

namespace Splitzy.Database.Repositories;

public class UserRepository : Repository<User>
{

    private readonly MyDbContext _dbContext;
    public UserRepository(MyDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }

    public void Attach(Group group)
    {
        _dbContext.Groups.Attach(group);
    }


    public void Attach(User user)
    {
        _dbContext.Users.Attach(user);
    }

    public async Task<User> GetByMailAsync(string mail)
    {
        return await GetQueryable()
        .Where(user => user.Email == mail).SingleOrDefaultAsync();
    }

    public async Task<string> GetRoleByMailAsync(string mail)
    {
        User user = await GetByMailAsync(mail);
        return user.Role;
    }

}