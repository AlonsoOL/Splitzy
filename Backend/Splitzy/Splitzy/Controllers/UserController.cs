﻿using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Splitzy.Database;
using Splitzy.Models;
using Splitzy.Services;
using System.Security.Claims;

namespace Splitzy.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private MyDbContext _dbContext;
    private readonly UserService _service;

    public UserController(MyDbContext dbContext,UserService service)
    {
        _dbContext = dbContext;
        _service = service;
    }   

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users =  _dbContext.Users
            .Include(u => u.Friends)
                .ThenInclude(uf => uf.Friend)
            .Include(u => u.FriendOf)
                .ThenInclude(uf => uf.User)
            .ToList();

        return Ok(users);
    }

    [Authorize]
    [HttpGet("GetCurrentUser/{id}")]
    public async Task<ActionResult<int>>GetCurrentUser(int id) 
    {
        Claim userClaimId = User.FindFirst("id");

        var userId = userClaimId.Value;

        return Ok(await _service.GetByIdAsync(id));
    }

    [Authorize]
    [HttpPut("Update_User")]

    public async Task<ActionResult> UpdateAsync([FromForm] UpdateUserDto userData)
    {
        Claim userClaimId = User.FindFirst("id");
        if (userClaimId == null) return Unauthorized(new { Message = "Debes iniciar sesión para llevar a cabo esta acción" });

        if (userData == null) return BadRequest(new { Message = "El usuario a actualizar es inválido." });
        return Ok(await _service.UpdateAsync(userData));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("Update_UserRole")]
    public async Task<ActionResult<User>> UpdateUserRole([FromBody] HandleRole userRole)
    {
        Claim userClaimId = User.FindFirst("id");
        if (userClaimId == null) return Unauthorized(new { Message = "Debes iniciar sesión para llevar a cabo esta acción" });

        if (userRole == null) return BadRequest(new { Message = "El role a actualizar es inválido." });
        return Ok(await _service.UpdateRole(userRole));
    }

    [Authorize]
    [HttpGet("RecentActivity/{userId}")]
    public async Task<IActionResult> GetUserRecentActivity(int userId)
    {
        try
        {
            var result = await _service.GetUserRecentActivityAsync(userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = "No se pudo obtener la actividad reciente", Error = ex.Message });
        }
    }

    [Authorize]
    [HttpDelete("Delete_User/{id}")]
    public async Task<ActionResult> DeleteAsyncUser(int id)
    {
        Claim userClaimId = User.FindFirst("id");
        if (userClaimId == null) return Unauthorized(new { Message = "Debes iniciar sesión para llevar a cabo esta acción" });

        if (id <= 0) return BadRequest(new { Message = "El ID del usuario es inválido." });
        return Ok(await _service.DeleteAsyncUserById(id));
    }
}
