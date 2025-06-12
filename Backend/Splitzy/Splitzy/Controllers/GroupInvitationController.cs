using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Splitzy.Models;
using Splitzy.Services;

namespace Splitzy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GroupInvitationController : ControllerBase
    {
        private readonly GroupService _groupService;

        public GroupInvitationController(GroupService groupService)
        {
            _groupService = groupService;
        }

        [HttpPost("invite")]
        public async Task<IActionResult> SendGroupInvitation([FromBody] GroupInvitationRequestDto dto)
        {
            try
            {
                await _groupService.SendGroupInvitationAsync(dto.GroupId, dto.SenderId, dto.InvitedUserId);
                return Ok(new { Message = "Invitación al grupo enviada exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("accept")]
        public async Task<IActionResult> AcceptInvitation([FromBody] GroupInvitationManageDto dto)
        {
            try
            {
                await _groupService.AcceptGroupInvitationAsync(dto.InvitationId, dto.UserId);
                return Ok(new { Message = "Invitación aceptada exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("reject")]
        public async Task<IActionResult> RejectInvitation([FromBody] GroupInvitationManageDto dto)
        {
            try
            {
                await _groupService.RejectGroupInvitationAsync(dto.InvitationId, dto.UserId);
                return Ok(new { Message = "Invitación rechazada exitosamente" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet("pending/{userId}")]
        public async Task<IActionResult> GetPendingInvitations(int userId)
        {
            try
            {
                var invitations = await _groupService.GetPendingInvitationsAsync(userId);
                return Ok(invitations);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
