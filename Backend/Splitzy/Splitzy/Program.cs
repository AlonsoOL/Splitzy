using Splitzy.Database;
using Splitzy.Database.Seeder;
using System.Text.Json.Serialization;

namespace Splitzy
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddScoped<MyDbContext>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            SeedDatabase(app.Services);
            app.Run();

            //Método para crear la base de datos con el Seeder
            static void SeedDatabase(IServiceProvider serviceProvider)
            { 
                using IServiceScope scope = serviceProvider.CreateScope();
                using MyDbContext dbContext = scope.ServiceProvider.GetService<MyDbContext>();

                if (dbContext.Database.EnsureCreated())
                {
                    Seeder seeder = new Seeder(dbContext);
                    seeder.Seed();
                }
            }
        }
    }
}
