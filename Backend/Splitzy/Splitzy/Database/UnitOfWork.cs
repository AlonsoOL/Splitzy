using Splitzy.Database.Repositories;

namespace Splitzy.Database;

public class UnitOfWork
{
    private readonly MyDbContext _dataContext;
    private UserRepository _userRepository = null!;
    private GroupRepository _groupRepository = null!;


    public UserRepository UserRepository => _userRepository ??= new UserRepository(_dataContext);
    public GroupRepository GroupRepository => _groupRepository ??= new GroupRepository(_dataContext);



    public UnitOfWork(MyDbContext dataContext)
    {
        _dataContext = dataContext;
    }

    public async Task<bool> SaveAsync()
    {
        return await _dataContext.SaveChangesAsync() > 0;
    }


}