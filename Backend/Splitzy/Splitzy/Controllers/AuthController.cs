using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Splitzy.Database;
using Splitzy.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Splitzy.Controllers;

public class AuthController : Controller
{
    private readonly IConfiguration _configuration;
    private readonly MyDbContext _dbContext;
    private readonly TokenValidationParameters _tokenParameters;

    public AuthController(IConfiguration configuration, MyDbContext dbContext, IOptionsMonitor<JwtBearerOptions> jwtOptions)
    {
        _configuration = configuration;
        _dbContext = dbContext;
        _tokenParameters = jwtOptions.Get(JwtBearerDefaults.AuthenticationScheme)
            .TokenValidationParameters;
    }

    // Función para el login
    [HttpPost("login")]
    public ActionResult<string> Login([FromBody] LoginDto data)
    {
        // 1. Comprobar si el usuario ya existe
        var existingUser = _dbContext.Users.SingleOrDefault(u => u.Email == data.Email);

        if (existingUser == null)
        {
            return NotFound(data);
        }
        if (existingUser.Password != data.Password)
        {
            return Unauthorized(data);
        }

        // 2. Crear las claims y el token JWT
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Claims = new Dictionary<string, object>
            {
                {"id", existingUser.Id },
                {ClaimTypes.Name, existingUser.Name },
                {ClaimTypes.Email, existingUser.Email },
                {ClaimTypes.Role, existingUser.Role }
            },
            Expires = DateTime.UtcNow.AddDays(5),
            SigningCredentials = new SigningCredentials(
                _tokenParameters.IssuerSigningKey,
                SecurityAlgorithms.HmacSha256Signature)
        };

        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
        SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);
        string tokenString = tokenHandler.WriteToken(token);

        return Ok(tokenString);
    }

    [HttpPost("register")]
    public async Task<ActionResult<string>> Register([FromForm] RegisterDto data)
    {
        var existingUser = _dbContext.Users.SingleOrDefault(u => u.Email == data.Email);

        if (existingUser != null)
        {
            return Conflict("El correo electrónico introducido ya está registrado.");
        }

        string imagePath;

        if (data.ImageUrl == null)
        {
            Random rand = new Random();
            int randomnumber = rand.Next(1, 5);

            imagePath = $"/Image/defaultprofile_{randomnumber}.png";
        }
        else
        {
            var extension = Path.GetExtension(data.ImageUrl.FileName);
            var fileName = $"{data.Name}_profilepicture{extension}";
            var filePath = Path.Combine("wwwroot/Images", fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await data.ImageUrl.CopyToAsync(stream);
            }
            imagePath = $"/Images/{fileName}";
        }

        var NewUser = new User
        {
            Name = data.Name,
            Email = data.Email,
            Password = data.Password,
            Role = "User",
            ImageUrl = data.ImageUrl,
        };

        _dbContext.Users.Add(NewUser);
        _dbContext.SaveChanges();

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Claims = new Dictionary<string, object>
            {
                {"id", NewUser.Id},
                {ClaimTypes.Name, NewUser.Name},
                {ClaimTypes.Email, NewUser.Email},
                {ClaimTypes.Role, NewUser.Role},
            },
            Expires = DateTime.UtcNow.AddDays(5),
            SigningCredentials = new SigningCredentials(
                _tokenParameters.IssuerSigningKey,
                SecurityAlgorithms.HmacSha256Signature)
        };

        JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
        SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);
        string tokenString = tokenHandler.WriteToken(token);

        return Ok(tokenString);
    }
}
