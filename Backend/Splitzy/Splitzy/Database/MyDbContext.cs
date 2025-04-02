using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Splitzy.Database;

public class MyDbContext : DbContext
{
    private const string DATABASE_PATH = "splitzy.db";

    public DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        optionsBuilder.UseSqlite($"DataSource={baseDir}{DATABASE_PATH}");
    }
}
