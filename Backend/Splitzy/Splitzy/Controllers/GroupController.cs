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

        /*
        [HttpGet("GetGroupsByUserId")]
        public async Task<IActionResult> GetGroupsByUserId(int userId)
        {
            var groups = await _service.GetGroupsByUserIdAsync(userId);
            if (groups == null)
            {
                return NotFound("Grupo no encontrado.");
            }
            return Ok(groups);
        }
        */

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
        public async Task<IActionResult> CreateGroup(int userId, string name, string description, string imageUrl)
        {

            var createdGroup = await _service.CreateGroupAsync(userId, name, description, imageUrl);
            return Ok(createdGroup);
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

        [HttpPost("AddMemberToGroup/{groupId}")]
        public async Task<IActionResult> AddMemberToGroup(Guid groupId, int userId)
        {
            if (userId <= 0)
            {
                return BadRequest("ID de usuario inválido.");
            }

            var result = await _service.AddMemberToGroupAsync(groupId, userId);
            return Ok("Miembro añadido al grupo exitosamente.");
        }


        [HttpGet("GetGroupsOfId/{userId}")]
        public async Task<IActionResult> GetGroupsOfId(int userId)
        {
            if (userId <= 0)
            {
                return BadRequest("ID de usuario inválido.");
            }
            var groups = await _service.GetGroupsOfId(userId);
            if (groups == null)
            {
                return NotFound("No se encontraron grupos para este usuario.");
            }
            return Ok(groups);
        }

        /*
        [HttpPut("UpdateGroup/{groupId}")]
        public async Task<IActionResult> UpdateGroup(int groupId, [FromBody] Group group)
        {
            if (group == null || group.Id != groupId)
            {
                return BadRequest("Datos del grupo inválidos.");
            }

            var updatedGroup = await _service.UpdateGroupAsync(group);
            if (updatedGroup == null)
            {
                return NotFound("Grupo no encontrado.");
            }
            return Ok(updatedGroup);
        }
        */





        [HttpGet("GetGroupMembers/{groupId}")]
        public async Task<IActionResult> GetGroupMembers(Guid groupId)
        {
            var members = await _service.GetGroupMembersAsync(groupId);
            if (members == null || !members.Any())
            {
                return NotFound("No se encontraron miembros en este grupo.");
            }
            return Ok(members);
        }

        /*


        [HttpDelete("RemoveMemberFromGroup/{groupId}/{userId}")]
        public async Task<IActionResult> RemoveMemberFromGroup(int groupId, int userId)
        {
            if (userId <= 0)
            {
                return BadRequest("ID de usuario inválido.");
            }

            var result = await _service.RemoveMemberFromGroupAsync(groupId, userId);
            if (!result)
            {
                return NotFound("Grupo no encontrado o no se pudo eliminar el miembro.");
            }
            return Ok("Miembro eliminado del grupo exitosamente.");


        }

        */


        [HttpPost("AddExpenseToGroup/{groupId}")]
        public async Task<IActionResult> AddExpenseToGroup(Guid groupId, int userId, int cantidad, string name)
        {
            if (cantidad <= 0)
            {
                return BadRequest("Datos de gasto inválidos.");
            }

            var result = await _service.AddExpenseToGroupAsync(groupId, userId, cantidad, name);
            if (result == null)
            {
                return NotFound("Grupo no encontrado o no se pudo añadir el gasto.");
            }
            return Ok(result);



        }


        [HttpGet("GetExpensesByGroupId/{groupId}")]
        public async Task<IActionResult> GetExpensesByGroupId(Guid groupId)
        {
            var expenses = await _service.GetGroupExpensesAsync(groupId);
            if (expenses == null)
            {
                return NotFound("No se encontraron gastos para este grupo.");
            }
            return Ok(expenses);


        }

        [HttpGet("GetDebtsByGroupId/{groupId}")]
        public async Task<IActionResult> GetDebtByGroupId(Guid groupId)
        {
            var debts = await _service.UpdateDebtAsync(groupId);
            if (debts == null)
            {
                return NotFound("No se encontraron deudas para este grupo.");
            }
            return Ok(debts);

        }
    }
}