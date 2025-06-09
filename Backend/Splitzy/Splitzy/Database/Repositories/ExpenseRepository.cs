using Microsoft.EntityFrameworkCore;

namespace Splitzy.Database.Repositories;

public class ExpenseRepository : Repository<Expense>
{
    private readonly MyDbContext _dbContext;
    public ExpenseRepository(MyDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }


    

}
