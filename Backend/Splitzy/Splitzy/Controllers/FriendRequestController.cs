using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Splitzy.Models;
using Splitzy.Services;
using SQLitePCL;

namespace Splitzy.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FriendRequestController : Controller
{
    private readonly FriendService _friendService;

    public FriendRequestController(FriendService friendService)
    {
        _friendService = friendService;
    }

    [HttpPost("request")]
    public async Task<IActionResult> RequestFriendship([FromBody] FriendRequestDto dto)
    {
        await _friendService.SendFriendServicesAsync(dto.senderId, dto.recivedId);
        return Ok("Solicitud de amistad enviada con éxito");
    }

    [HttpPost("accept")]
    public async Task<IActionResult> AcceptRequest([FromBody] FriendRequestDto dto)
    {
        await _friendService.AcceptFriendRequestAsync(dto.senderId, dto.recivedId);
        return Ok();
    }

    [HttpPost("reject")]
    public async Task <IActionResult> RejectRequest([FromBody] FriendRequestRejectDto dto)
    {
        await _friendService.RejectFriendRequestAsync(dto.recivedId, dto.senderId);
        return Ok();
    }

    [HttpGet("pending/{userId}")]
    public async Task<IActionResult> GetPendingRequest(int userId)
    {
        var requests = await _friendService.GetPendingRequestsAsync(userId);
        return Ok(requests);
    }
}
