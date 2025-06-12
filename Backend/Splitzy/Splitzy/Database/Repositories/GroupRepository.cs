using Microsoft.EntityFrameworkCore;

namespace Splitzy.Database.Repositories;

public class GroupRepository : Repository<Group>
{
    private readonly MyDbContext _dbContext;

    public GroupRepository(MyDbContext dbContext) : base(dbContext)
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

    public async Task<Group> GetGroupByIdAsync(Guid id)
    {
        try
        {
            var group = await _dbContext.Groups
                .Include(g => g.Users)
                .Include(g => g.Expenses)
                .Include(g => g.Payments)
                .AsNoTracking()
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group != null)
            {
                Console.WriteLine($"GetByIdAsync - Retrieved group {id}:");
                Console.WriteLine($"Users: {group.Users?.Count ?? 0}");
                Console.WriteLine($"Name: {group.Name}");
                Console.WriteLine($"Description: {group.Description}");
                Console.WriteLine($"Expenses: {group.Expenses?.Count ?? 0}");
                Console.WriteLine($"Payments: {group.Payments?.Count ?? 0}");
            }

            return group;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetByIdAsync: {ex.Message}");
            throw;
        }
    }

    public async Task<List<Group>> GetActiveGroupsAsync()
    {
        return await _dbContext.Groups
            .Include(g => g.Users)
            .AsNoTracking()
            .OrderByDescending(g => g.UpdatedAt)
            .Take(20)
            .ToListAsync();
    }

    public async Task<Group> CreateAsync(Group group)
    {
        await _dbContext.Groups.AddAsync(group);
        await _dbContext.SaveChangesAsync();
        return group;
    }

    public async Task<List<Group>> GetGroupsByUserIdAsync(int userId)
    {
        return await _dbContext.Groups
            .Include(g => g.Users)
            .Where(g => g.Users.Any(u => u.Id == userId))
            .ToListAsync();
    }

    public async Task<bool> DeleteAsyncGroupById(Guid id)
    {
        Group group = await GetGroupByIdAsync(id);
        if (group == null) return false;

        _dbContext.Groups.Remove(group);
        return await _dbContext.SaveChangesAsync() > 0;
    }

    public async Task<Group> UpdateGroupAsync(Group group)
    {
        _dbContext.Groups.Update(group);
        await _dbContext.SaveChangesAsync();
        return group;
    }

    public async Task<List<Expense>> GetExpensesByGroupIdAsync(Guid groupId)
    {
        return await _dbContext.Expenses
            .Include(e => e.User)
            .Where(e => e.GroupId == groupId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    public async Task<decimal> GetTotalExpensesByGroupIdAsync(Guid groupId)
    {
        return await _dbContext.Expenses
            .Where(e => e.GroupId == groupId)
            .SumAsync(e => e.Amount);
    }

    public async Task<List<Expense>> GetExpensesByUserInGroupAsync(Guid groupId, int userId)
    {
        return await _dbContext.Expenses
            .Include(e => e.User)
            .Where(e => e.GroupId == groupId && e.UserId == userId)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Payment>> GetPaymentsByGroupIdAsync(Guid groupId)
    {
        return await _dbContext.Payments
            .Include(p => p.Payer)
            .Include(p => p.Receiver)
            .Where(p => p.GroupId == groupId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public async Task<decimal> GetTotalPaymentsByGroupIdAsync(Guid groupId)
    {
        return await _dbContext.Payments
            .Where(p => p.GroupId == groupId)
            .SumAsync(p => p.Amount);
    }

    public async Task<List<Payment>> GetPaymentsByUserInGroupAsync(Guid groupId, int userId)
    {
        return await _dbContext.Payments
            .Include(p => p.Payer)
            .Include(p => p.Receiver)
            .Where(p => p.GroupId == groupId && (p.PayerId == userId || p.ReceiverId == userId))
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
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

    public async Task<Dictionary<int, decimal>> GetUserExpenseTotalsInGroupAsync(Guid groupId)
    {
        var expenses = await _dbContext.Expenses
            .Where(e => e.GroupId == groupId)
            .GroupBy(e => e.UserId)
            .Select(g => new { UserId = g.Key, Total = g.Sum(e => e.Amount) })
            .ToListAsync();

        return expenses.ToDictionary(e => e.UserId, e => e.Total);
    }

    public async Task<Dictionary<int, decimal>> GetUserPaymentTotalsInGroupAsync(Guid groupId)
    {
        var paymentsMade = await _dbContext.Payments
            .Where(p => p.GroupId == groupId)
            .GroupBy(p => p.PayerId)
            .Select(g => new { UserId = g.Key, Total = g.Sum(p => p.Amount) })
            .ToListAsync();

        var paymentsReceived = await _dbContext.Payments
            .Where(p => p.GroupId == groupId)
            .GroupBy(p => p.ReceiverId)
            .Select(g => new { UserId = g.Key, Total = g.Sum(p => p.Amount) })
            .ToListAsync();

        var result = new Dictionary<int, decimal>();

        foreach (var payment in paymentsMade)
        {
            result[payment.UserId] = result.GetValueOrDefault(payment.UserId, 0) - payment.Total;
        }

        foreach (var payment in paymentsReceived)
        {
            result[payment.UserId] = result.GetValueOrDefault(payment.UserId, 0) + payment.Total;
        }

        return result;
    }

    public async Task<GroupStatistics> GetGroupStatisticsAsync(Guid groupId)
    {
        var group = await GetGroupByIdAsync(groupId);
        if (group == null) return null;

        var totalExpenses = await GetTotalExpensesByGroupIdAsync(groupId);
        var totalPayments = await GetTotalPaymentsByGroupIdAsync(groupId);
        var memberCount = group.Users.Count;
        var averageExpensePerPerson = memberCount > 0 ? totalExpenses / memberCount : 0;

        var lastExpense = await _dbContext.Expenses
            .Where(e => e.GroupId == groupId)
            .OrderByDescending(e => e.CreatedAt)
            .FirstOrDefaultAsync();

        var lastPayment = await _dbContext.Payments
            .Where(p => p.GroupId == groupId)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync();

        DateTime? lastActivity = null;
        if (lastExpense != null && lastPayment != null)
        {
            lastActivity = lastExpense.CreatedAt > lastPayment.CreatedAt ? lastExpense.CreatedAt : lastPayment.CreatedAt;
        }
        else if (lastExpense != null)
        {
            lastActivity = lastExpense.CreatedAt;
        }
        else if (lastPayment != null)
        {
            lastActivity = lastPayment.CreatedAt;
        }

        return new GroupStatistics
        {
            GroupId = groupId,
            TotalExpenses = totalExpenses,
            TotalPayments = totalPayments,
            NetBalance = totalExpenses - totalPayments,
            MemberCount = memberCount,
            AverageExpensePerPerson = averageExpensePerPerson,
            LastActivity = lastActivity,
            ExpenseCount = await _dbContext.Expenses.CountAsync(e => e.GroupId == groupId),
            PaymentCount = await _dbContext.Payments.CountAsync(p => p.GroupId == groupId)
        };
    }

    public async Task<bool> IsUserMemberOfGroupAsync(Guid groupId, int userId)
    {
        return await _dbContext.Groups
            .AnyAsync(g => g.Id == groupId && g.Users.Any(u => u.Id == userId));
    }

    public async Task<List<Group>> GetGroupsWithRecentActivityAsync(int days = 30)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-days);

        return await _dbContext.Groups
            .Include(g => g.Users)
            .Where(g => g.Expenses.Any(e => e.CreatedAt >= cutoffDate) ||
                       g.Payments.Any(p => p.CreatedAt >= cutoffDate))
            .OrderByDescending(g => g.UpdatedAt)
            .ToListAsync();
    }

    public async Task<List<Group>> GetInactiveGroupsAsync(int daysInactive = 90)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-daysInactive);

        return await _dbContext.Groups
            .Include(g => g.Users)
            .Where(g => !g.Expenses.Any(e => e.CreatedAt >= cutoffDate) &&
                       !g.Payments.Any(p => p.CreatedAt >= cutoffDate) &&
                       g.UpdatedAt < cutoffDate)
            .OrderBy(g => g.UpdatedAt)
            .ToListAsync();
    }
}

public class GroupStatistics
{
    public Guid GroupId { get; set; }
    public decimal TotalExpenses { get; set; }
    public decimal TotalPayments { get; set; }
    public decimal NetBalance { get; set; }
    public int MemberCount { get; set; }
    public decimal AverageExpensePerPerson { get; set; }
    public DateTime? LastActivity { get; set; }
    public int ExpenseCount { get; set; }
    public int PaymentCount { get; set; }
}