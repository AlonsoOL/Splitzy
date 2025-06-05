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



    }

