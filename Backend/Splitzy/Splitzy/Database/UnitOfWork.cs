using Splitzy.Database.Repositories;

namespace Splitzy.Database;

public class UnitOfWork
{
    private readonly MyDbContext _dataContext;
    private UserRepository _userRepository = null!;


    public UserRepository UserRepository => _userRepository ??= new UserRepository(_dataContext);



    public UnitOfWork(MyDbContext dataContext)
    {
        _dataContext = dataContext;
    }

    public async Task<bool> SaveAsync()
    {
        return await _dataContext.SaveChangesAsync() > 0;
    }


}