using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Splitzy.Database;
using Splitzy.Services;

namespace Splitzy.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GroupController : ControllerBase
    {
        private MyDbContext _dbContext;
        private readonly GroupService _service;

        public GroupController(MyDbContext dbContext, GroupService service)
        {
            _dbContext = dbContext;
            _service = service;
        }

        [HttpGet("GetGroups")]
        public async Task<IActionResult> GetGroups()
        {
            var groups = await _service.GetAllGroupsAsync();
            if (groups == null || !groups.Any())
            {
                return NotFound("No se encontraron grupos.");
            }
            return Ok(groups);
        }

        [HttpGet("GetGroup/{groupId}")]
        public async Task<IActionResult> GetGroupById(Guid groupId)
        {
            var group = await _service.GetGroupByIdAsync(groupId);
            if (group == null)
            {
                return NotFound("Grupo no encontrado.");
            }
            return Ok(group);
        }

        [HttpPost("CreateGroup")]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Name))
            {
                return BadRequest("Datos del grupo inválidos.");
            }

            try
            {
                var createdGroup = await _service.CreateGroupAsync(request.UserId, request.Name, request.Description, request.ImageUrl);
                return Ok(createdGroup);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("UpdateGroup/{groupId}")]
        public async Task<IActionResult> UpdateGroup(Guid groupId, [FromBody] UpdateGroupRequest request)
        {
            if (request == null)
            {
                return BadRequest("Datos del grupo inválidos.");
            }

            try
            {
                var group = new Group
                {
                    Id = groupId,
                    Name = request.Name,
                    Description = request.Description,
                    ImageUrl = request.ImageUrl
                };

                var updatedGroup = await _service.UpdateGroupAsync(group);
                return Ok(updatedGroup);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("DeleteGroup/{groupId}")]
        public async Task<IActionResult> DeleteGroup(Guid groupId)
        {
            var result = await _service.DeleteAsyncGroupById(groupId);
            if (!result)
            {
                return NotFound("Grupo no encontrado o no se pudo eliminar.");
            }
            return NoContent();
        }


        [HttpPost("AddMemberToGroup/{groupId}/{userId}")]
        public async Task<IActionResult> AddMemberToGroup(Guid groupId, int userId)
        {
            if (userId <= 0)
            {
                return BadRequest("ID de usuario inválido.");
            }

            var result = await _service.AddMemberToGroupAsync(groupId, userId);
            return result;
        }

        [HttpDelete("RemoveMemberFromGroup/{groupId}/{userId}")]
        public async Task<IActionResult> RemoveMemberFromGroup(Guid groupId, int userId)
        {
            if (userId <= 0)
            {
                return BadRequest("ID de usuario inválido.");
            }

            var result = await _service.RemoveMemberFromGroupAsync(groupId, userId);
            return result;
        }

        [HttpGet("GetGroupMembers/{groupId}")]
        public async Task<IActionResult> GetGroupMembers(Guid groupId)
        {
            try
            {
                var members = await _service.GetGroupMembersAsync(groupId);
                if (members == null || !members.Any())
                {
                    return NotFound("No se encontraron miembros en este grupo.");
                }
                return Ok(members);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("GetGroupsOfUser/{userId}")]
        public async Task<IActionResult> GetGroupsOfUser(int userId)
        {
            if (userId <= 0)
            {
                return BadRequest("ID de usuario inválido.");
            }

            var result = await _service.GetGroupsOfId(userId);
            return result;
        }

      
        [HttpPost("AddExpenseToGroup/{groupId}")]
        public async Task<IActionResult> AddExpenseToGroup(Guid groupId, [FromBody] AddExpenseRequest request)
        {
            if (request == null || request.Amount <= 0 || string.IsNullOrEmpty(request.Name))
            {
                return BadRequest("Datos de gasto inválidos.");
            }

            var result = await _service.AddExpenseToGroupAsync(groupId, request.UserId, request.Amount, request.Name, request.Description);
            return result;
        }

        [HttpGet("GetExpensesByGroupId/{groupId}")]
        public async Task<IActionResult> GetExpensesByGroupId(Guid groupId)
        {
            var result = await _service.GetGroupExpensesAsync(groupId);
            return result;
        }

        [HttpDelete("DeleteExpense/{expenseId}")]
        public async Task<IActionResult> DeleteExpense(Guid expenseId)
        {
            var result = await _service.DeleteExpenseAsync(expenseId);
            return result;
        }

        [HttpPost("AddPaymentToGroup/{groupId}")]
        public async Task<IActionResult> AddPaymentToGroup(Guid groupId, [FromBody] AddPaymentRequest request)
        {
            if (request == null || request.Amount <= 0 || request.PayerId <= 0 || request.ReceiverId <= 0)
            {
                return BadRequest("Datos de pago inválidos.");
            }

            if (request.PayerId == request.ReceiverId)
            {
                return BadRequest("El pagador y el receptor no pueden ser la misma persona.");
            }

            var result = await _service.AddPaymentToGroupAsync(groupId, request.PayerId, request.ReceiverId, request.Amount, request.Description);
            return result;
        }

        [HttpGet("GetPaymentsByGroupId/{groupId}")]
        public async Task<IActionResult> GetPaymentsByGroupId(Guid groupId)
        {
            var result = await _service.GetGroupPaymentsAsync(groupId);
            return result;
        }

        [HttpDelete("DeletePayment/{paymentId}")]
        public async Task<IActionResult> DeletePayment(Guid paymentId)
        {
            var result = await _service.DeletePaymentAsync(paymentId);
            return result;
        }

        [HttpGet("GetGroupBalances/{groupId}")]
        public async Task<IActionResult> GetGroupBalances(Guid groupId)
        {
            var result = await _service.GetGroupBalancesAsync(groupId);
            return result;
        }

        [HttpGet("GetGroupDebts/{groupId}")]
        public async Task<IActionResult> GetGroupDebts(Guid groupId)
        {
            var result = await _service.GetGroupDebtsAsync(groupId);
            return result;
        }

        [HttpGet("GetGroupSummary/{groupId}")]
        public async Task<IActionResult> GetGroupSummary(Guid groupId)
        {
            var result = await _service.GetGroupSummaryAsync(groupId);
            return result;
        }
    }

    public class CreateGroupRequest
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
    }

    public class UpdateGroupRequest
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
    }

    public class AddExpenseRequest
    {
        public int UserId { get; set; }
        public decimal Amount { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }

    public class AddPaymentRequest
    {
        public int PayerId { get; set; }
        public int ReceiverId { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; }
    }
}