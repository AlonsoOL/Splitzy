namespace Splitzy.Database.Repositories;

public class PaymentRepository : Repository<Payment>
{
    private readonly MyDbContext _dbContext;

    public PaymentRepository(MyDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }

}

