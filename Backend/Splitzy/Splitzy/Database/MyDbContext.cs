using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

namespace Splitzy.Database;

public class MyDbContext : DbContext
{
    private const string DATABASE_PATH = "splitzy.db";

    public DbSet<User> Users { get; set; }
    public DbSet<UserFriend> UserFriends { get; set; }
    public DbSet<FriendRequest> FriendRequests { get; set; }

    public DbSet<GroupInvitation> GroupInvitations { get; set; }

    public DbSet<Group> Groups { get; set; }
    public DbSet<Expense> Expenses { get; set; }
    public DbSet<Debt> Debts { get; set; }
    public DbSet<Payment> Payments { get; set; }


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

        modelBuilder.Entity<Group>()
            .HasMany(g => g.Users)
            .WithMany(u => u.Groups)
            .UsingEntity(j => j.ToTable("GroupUsers"));

        modelBuilder.Entity<UserFriend>()
            .HasOne(uf => uf.Friend)
            .WithMany(u => u.FriendOf)
            .HasForeignKey(uf => uf.FriendId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FriendRequest>()
            .HasOne(fr => fr.Sender)
            .WithMany()
            .HasForeignKey(fr => fr.SenderId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FriendRequest>()
            .HasOne(fr => fr.Reciver)
            .WithMany()
            .HasForeignKey(fr => fr.RecivedId)
            .OnDelete(DeleteBehavior.Restrict);

        
        modelBuilder.Entity<User>()
            .HasMany(u => u.Groups)
            .WithMany(g => g.Users)
            .UsingEntity(j => j.ToTable("UserGroups"));

        
        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Payer)
            .WithMany(u => u.PaymentsMade)
            .HasForeignKey(p => p.PayerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Receiver)
            .WithMany(u => u.PaymentsReceived)
            .HasForeignKey(p => p.ReceiverId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<GroupInvitation>(entity =>
        {
            entity.HasKey(gi => gi.Id);

            entity.HasOne(gi => gi.Group)
                  .WithMany()
                  .HasForeignKey(gi => gi.GroupId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(gi => gi.Sender)
                  .WithMany()
                  .HasForeignKey(gi => gi.SenderId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(gi => gi.InvitedUser)
                  .WithMany()
                  .HasForeignKey(gi => gi.InvitedUserId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.Property(gi => gi.SentAt)
                  .IsRequired();

            entity.Property(gi => gi.IsAccepted)
                  .IsRequired();

            entity.Property(gi => gi.IsHandled)
                  .IsRequired();
        });


        modelBuilder.Entity<Debt>()
            .HasOne(d => d.Debtor)
            .WithMany(u => u.DebtsOwed)
            .HasForeignKey(d => d.DebtorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Debt>()
            .HasOne(d => d.Creditor)
            .WithMany(u => u.CreditsOwed)
            .HasForeignKey(d => d.CreditorId)
            .OnDelete(DeleteBehavior.Restrict);

        
        modelBuilder.Entity<Expense>()
            .HasIndex(e => new { e.GroupId, e.CreatedAt });

        modelBuilder.Entity<Payment>()
            .HasIndex(p => new { p.GroupId, p.CreatedAt });

        modelBuilder.Entity<Debt>()
            .HasIndex(d => new { d.GroupId, d.IsSettled });

        modelBuilder.Entity<Debt>()
            .HasIndex(d => new { d.DebtorId, d.IsSettled });

        modelBuilder.Entity<Debt>()
            .HasIndex(d => new { d.CreditorId, d.IsSettled });

        
        modelBuilder.Entity<Group>()
            .HasIndex(g => g.Name);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        base.OnModelCreating(modelBuilder);
    }
}
