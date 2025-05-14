using Microsoft.EntityFrameworkCore;

namespace Splitzy.Database.Repositories;

public class UserRepository : Repository<User>
{
    public UserRepository(MyDbContext dbContext) : base(dbContext)
    {

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