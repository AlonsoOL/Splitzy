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
                Phone = 333333333,
                Role = "Admin",
                ImageUrl = $"/Images/defaultprofile_{randomNumber()}.png",
            },
            new User
            {
                Name = "Ivan",
                Email = "ivan@gmail.com",
                Password = "ivan",
                Address = "Su casa",
                Birthday = null,
                Phone = 432543098,
                Role = "Admin",
                ImageUrl = $"/Images/defaultprofile_{randomNumber()}.png",
            },
            new User
            {
                Name = "prueba",
                Email = "prueba@gmail.com",
                Password = "prueba",
                Address = "Su otra casa",
                Birthday = null,
                Phone = 606961948,
                Role = "User",
                ImageUrl = $"/Images/defaultprofile_{randomNumber()}.png",
            },
        ];

        _context.Users.AddRange(users);
        _context.SaveChanges();
    }

    public int randomNumber()
    {
        Random rand = new Random();
        int randomnumber = rand.Next(1, 5);

        return(randomnumber);
    }
}
