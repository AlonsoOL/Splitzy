using Microsoft.EntityFrameworkCore;

namespace Splitzy.Database.Repositories;

    public class GroupRepository : Repository<Group>
    {
        private readonly MyDbContext _dbContext;

        public GroupRepository(MyDbContext dbContext) : base(dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Group> GetGroupByIdAsync(Guid id)
        {
            try
            {
                var group = await _dbContext.Groups
                    .AsNoTracking()
                    .FirstOrDefaultAsync(g => g.Id == id);

                if (group != null)
                {
                    Console.WriteLine($"GetByIdAsync - Retrieved group {id}:");
                    Console.WriteLine($"Users: {group.Users}");
                    Console.WriteLine($"Name: {group.Name}");
                    Console.WriteLine($"Description: {group.Description}");
                    Console.WriteLine($"Payments: {group.Payments}");
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
            .Where(e => e.GroupId == groupId)
            .ToListAsync();
    }

    public async Task<int> GetExpensesNumByGroupIdAsync(Guid groupId)
    {

        return await _dbContext.Expenses
            .CountAsync(e => e.GroupId == groupId);
    }





    public async Task<List<Payment>> GetPaymentsByGroupIdAsync(Guid groupId)
    {
        return await _dbContext.Payments
            .Where(p => p.GroupId == groupId)
            .ToListAsync();
    }

    public async Task<int> GetPaymentsNumByGroupIdAsync(Guid groupId)
    {

        return await _dbContext.Payments
            .CountAsync(p => p.GroupId == groupId);

    }



    public async Task<Debt> GetDebtByGroupIdAsync(Guid groupId)
    {
        return await _dbContext.Debts
            .Where(d => d.GroupId == groupId)
            .FirstOrDefaultAsync();
    }









}

