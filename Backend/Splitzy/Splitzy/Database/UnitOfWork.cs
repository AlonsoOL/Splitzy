using Splitzy.Database.Repositories;

namespace Splitzy.Database;

public class UnitOfWork
{
    private readonly MyDbContext _dataContext;
    private UserRepository _userRepository = null!;
    private GroupRepository _groupRepository = null!;
    private ExpenseRepository _expenseRepository = null!;
    private DebtRepository _debtRepository = null!;
    private PaymentRepository _paymentRepository = null!;



    public UserRepository UserRepository => _userRepository ??= new UserRepository(_dataContext);
    public GroupRepository GroupRepository => _groupRepository ??= new GroupRepository(_dataContext);
    public ExpenseRepository ExpenseRepository => _expenseRepository ??= new ExpenseRepository(_dataContext);
    public DebtRepository DebtRepository => _debtRepository ??= new DebtRepository(_dataContext);
    public PaymentRepository PaymentRepository => _paymentRepository ??= new PaymentRepository(_dataContext);



    public UnitOfWork(MyDbContext dataContext)
    {
        _dataContext = dataContext;
    }

    public async Task<bool> SaveAsync()
    {
        return await _dataContext.SaveChangesAsync() > 0;
    }


}