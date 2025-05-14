using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Splitzy.Database;

public class MyDbContext : DbContext
{
    private const string DATABASE_PATH = "splitzy.db";

    public DbSet<User> Users { get; set; }
    public DbSet<FriendRequest> FriendRequests { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
#if DEBUG
        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
        optionsBuilder.UseSqlite($"DataSource={baseDir}{DATABASE_PATH}");
#else
        string connectionString = "Server=db10880.databaseasp.net; Database=db10880; Uid=db10880; Pwd=sH#45_eG?jR2;";
        optionsBuilder.UseMySql(connectionString,ServerVersion.AutoDetect(connectionString));
#endif
    }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserFriend>()
            .HasKey(uf => new { uf.UserId, uf.FriendId });

        modelBuilder.Entity<UserFriend>()
            .HasOne(uf => uf.User)
            .WithMany(u => u.Friends)
            .HasForeignKey(uf => uf.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<UserFriend>()
            .HasOne(uf => uf.Friend)
            .WithMany(u => u.FriendOf)
            .HasForeignKey(uf => uf.FriendId)
            .OnDelete(DeleteBehavior.Restrict);

        base.OnModelCreating(modelBuilder);
    }
}
