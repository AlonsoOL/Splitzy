using Splitzy.Database;

namespace Splitzy.Database.Seeder;

public class Seeder
{
    private readonly MyDbContext _context;

    public Seeder(MyDbContext context)
    {
        _context = context;
    }

    public void Seed()
    {
        User[] users =
        [
            new User
            {
                Name = "Alonso",
                Email = "alonso@gmail.com",
                Password = "alonso",
                Address = "Mi casa",
                Birthday = null,
                Role = "Admin",
            },
            new User
            {
                Name = "Ivan",
                Email = "ivan@gmail.com",
                Password = "ivan",
                Address = "Su casa",
                Birthday = null,
                Role = "Admin",
            },
            new User
            {
                Name = "prueba",
                Email = "prueba@gmail.com",
                Password = "prueba",
                Address = "Su otra casa",
                Birthday = null,
                Role = "User",
            },
        ];

        _context.Users.AddRange(users);
        _context.SaveChanges();
    }
}
