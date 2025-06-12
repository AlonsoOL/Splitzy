using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RetroKits.Controllers;
using Splitzy.Controllers;
using Splitzy.Database;
using Splitzy.Database.Repositories;
using Splitzy.Database.Seeder;
using Splitzy.Services;
using Swashbuckle.AspNetCore.Filters;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json.Serialization;

namespace Splitzy
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            Directory.SetCurrentDirectory(AppContext.BaseDirectory);

            // Add services to the container.

            builder.Services.AddControllers().AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
            });

            builder.Services.AddAuthentication()
                .AddJwtBearer(options => 
                {
                    //string key = Environment.GetEnvironmentVariable("JWT_KEY");
                    string key = builder.Configuration["JwtSettings:Key"];

                    options.TokenValidationParameters = new TokenValidationParameters()
                    {
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
                    };
                });

            builder.Services.AddSwaggerGen(options =>
            {
                options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    BearerFormat = "JWT",
                    Name = "Authorization",
                    Description = "Escribe **_SOLO_** tu token JWT",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = JwtBearerDefaults.AuthenticationScheme
                });
                options.OperationFilter<SecurityRequirementsOperationFilter>(true, JwtBearerDefaults.AuthenticationScheme);
            });
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(builder =>
                {
                    builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
                });
            });

            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddScoped<MyDbContext>();
            builder.Services.AddScoped<UnitOfWork>();
            builder.Services.AddScoped<UserRepository>();

            builder.Services.AddScoped<UserService>();
            builder.Services.AddScoped<GroupService>();
            builder.Services.AddScoped<FriendService>();
            builder.Services.AddScoped<SmartSearchService>();
            builder.Services.AddScoped<FriendRequestController>();
            builder.Services.AddScoped<FriendsController>();
            builder.Services.AddScoped<GroupController>();
            builder.Services.AddScoped<SmartSearchController>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new PhysicalFileProvider(
                Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"))
            });

            app.UseCors();

            app.UseWebSockets();

            app.UseAuthentication();
            app.UseAuthorization();

            app.Use(async (context, next) =>
            {
                if (context.Request.Path == "/ws" && context.WebSockets.IsWebSocketRequest)
                {
                    WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
                    await WebSocketHandler.Handle(context, webSocket);
                }
                else
                {
                    context.Response.StatusCode = 400;
                    await next();
                }
            });

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
