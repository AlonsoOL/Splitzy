namespace Splitzy.Database.Repositories;

public class DebtRepository : Repository<Debt>
{
    private readonly MyDbContext _dbContext;

    public DebtRepository(MyDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }

    
}

