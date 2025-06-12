using Microsoft.EntityFrameworkCore;

namespace Splitzy.Database.Repositories;

public class DebtRepository : Repository<Debt>
{
    private readonly MyDbContext _dbContext;

    public DebtRepository(MyDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<Debt>> GetDebtsByGroupIdAsync(Guid groupId)
    {
        return await _dbContext.Debts
            .Include(d => d.Debtor)
            .Include(d => d.Creditor)
            .Where(d => d.GroupId == groupId && d.Amount > 0)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Debt>> GetDebtsForUserAsync(int userId)
    {
        return await _dbContext.Debts
            .Include(d => d.Debtor)
            .Include(d => d.Creditor)
            .Include(d => d.Group)
            .Where(d => (d.DebtorId == userId || d.CreditorId == userId) && d.Amount > 0)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Debt>> GetDebtsOwedByUserAsync(int userId)
    {
        return await _dbContext.Debts
            .Include(d => d.Creditor)
            .Include(d => d.Group)
            .Where(d => d.DebtorId == userId && d.Amount > 0)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Debt>> GetDebtsOwedToUserAsync(int userId)
    {
        return await _dbContext.Debts
            .Include(d => d.Debtor)
            .Include(d => d.Group)
            .Where(d => d.CreditorId == userId && d.Amount > 0)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<Debt> GetDebtBetweenUsersInGroupAsync(Guid groupId, int debtorId, int creditorId)
    {
        return await _dbContext.Debts
            .FirstOrDefaultAsync(d => d.GroupId == groupId &&
                                     d.DebtorId == debtorId &&
                                     d.CreditorId == creditorId);
    }

    public async Task<decimal> GetTotalDebtForUserAsync(int userId)
    {
        return await _dbContext.Debts
            .Where(d => d.DebtorId == userId && d.Amount > 0)
            .SumAsync(d => d.Amount);
    }

    public async Task<decimal> GetTotalCreditForUserAsync(int userId)
    {
        return await _dbContext.Debts
            .Where(d => d.CreditorId == userId && d.Amount > 0)
            .SumAsync(d => d.Amount);
    }

    public async Task DeleteByGroupIdAsync(Guid groupId)
    {
        var debts = await _dbContext.Debts
            .Where(d => d.GroupId == groupId)
            .ToListAsync();

        if (debts.Any())
        {
            _dbContext.Debts.RemoveRange(debts);
            await _dbContext.SaveChangesAsync();
        }
    }

    public async Task<bool> SettleDebtAsync(Guid debtId)
    {
        var debt = await _dbContext.Debts.FindAsync(debtId);
        if (debt == null) return false;

        debt.Amount = 0;
        debt.IsSettled = true;
        debt.SettledAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<UserDebtSummary> GetUserDebtSummaryAsync(int userId)
    {
        var debtsOwed = await GetTotalDebtForUserAsync(userId);
        var creditsOwed = await GetTotalCreditForUserAsync(userId);
        var netBalance = creditsOwed - debtsOwed;

        var debtCount = await _dbContext.Debts
            .CountAsync(d => d.DebtorId == userId && d.Amount > 0);

        var creditCount = await _dbContext.Debts
            .CountAsync(d => d.CreditorId == userId && d.Amount > 0);

        return new UserDebtSummary
        {
            UserId = userId,
            TotalDebt = debtsOwed,
            TotalCredit = creditsOwed,
            NetBalance = netBalance,
            DebtCount = debtCount,
            CreditCount = creditCount
        };
    }
}

public class UserDebtSummary
{
    public int UserId { get; set; }
    public decimal TotalDebt { get; set; }
    public decimal TotalCredit { get; set; }
    public decimal NetBalance { get; set; }
    public int DebtCount { get; set; }
    public int CreditCount { get; set; }
}