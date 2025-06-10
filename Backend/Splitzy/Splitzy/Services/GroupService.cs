using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Splitzy.Database;
using SQLitePCL;

namespace Splitzy.Services;

public class GroupService
{
    private UnitOfWork _unitOfWork;

    public GroupService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Group> GetGroupByIdAsync(Guid groupId)
    {
        Group group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);
        return group;
    }

    public async Task<List<Group>> GetAllGroupsAsync()
    {
        var groups = await _unitOfWork.GroupRepository.GetActiveGroupsAsync();
        return groups.ToList();
    }

    public async Task<Group> CreateGroupAsync(int userId, string name, string description, string imageUrl)
    {
        User user = await _unitOfWork.UserRepository.GetByIdAsync(userId);

        var group = new Group
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            ImageUrl = imageUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Users = new List<User> { user },

        };

        await _unitOfWork.GroupRepository.InsertAsync(group);
        await _unitOfWork.SaveAsync();

        return group;
    }

    public async Task<bool> DeleteAsyncGroupById(Guid id)
    {
        Group group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(id);
        _unitOfWork.GroupRepository.Delete(group);

        return await _unitOfWork.SaveAsync();
    }

    public async Task<Group> UpdateGroupAsync(Group group)
    {
        Group groupEntity = await _unitOfWork.GroupRepository.GetGroupByIdAsync(group.Id) ?? throw new Exception("El grupo especificado no existe");

        groupEntity.Name = group.Name;
        groupEntity.Description = group.Description;
        groupEntity.ImageUrl = group.ImageUrl;
        groupEntity.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.GroupRepository.Update(groupEntity);

        await _unitOfWork.SaveAsync();

        return groupEntity;
    }

    public async Task<IActionResult> AddMemberToGroupAsync(Guid groupId, int userId)
    {
        Group group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);
        User user = await _unitOfWork.UserRepository.GetByIdAsync(userId);

        if (group == null || user == null)
        {
            throw new Exception("Grupo o usuario no encontrado");
        }

        if (group.Users.Any(u => u.Id == userId))
        {
            throw new Exception("El usuario ya es miembro del grupo");
        }

        group.Users.Add(user);
        _unitOfWork.GroupRepository.Update(group);
        await _unitOfWork.SaveAsync();

        return new OkObjectResult(new
        {
            Message = "Miembro añadido al grupo exitosamente.",
            GroupId = group.Id,
            UserId = user.Id
        });

    }

    public async Task<IActionResult> GetGroupsOfId(int userId)
    {
        var groups = await _unitOfWork.GroupRepository.GetGroupsByUserIdAsync(userId);

        if (groups == null || !groups.Any())
        {
            return new NotFoundObjectResult(new { Message = "No se encontraron grupos para el usuario especificado." });
        }

        return new OkObjectResult(groups);
    }

    public async Task<List<User>> GetGroupMembersAsync(Guid groupId)
    {
        Group group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            throw new Exception("Grupo no encontrado");
        }

        return group.Users.ToList();
    }


        public async Task<IActionResult> AddExpenseToGroupAsync(Guid groupId, int userId, int cantidad, string name)
    {
        Group group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return new NotFoundObjectResult(new { Message = "Grupo no encontrado" });
        }

        var expense = new Expense
        {
            Name = name,
            UserId = userId,
            Amount = cantidad,
            Description = "Gasto añadido al grupo",
            CreatedAt = DateTime.UtcNow,
            GroupId = groupId
        };

        await _unitOfWork.ExpenseRepository.InsertAsync(expense);
        await _unitOfWork.SaveAsync();
        UpdateDebtAsync(groupId).Wait(); 

        return new OkObjectResult(new
        {
            Message = "Gasto añadido al grupo exitosamente.",
            ExpenseId = expense.Id
        });


    }
    public async Task<IActionResult> GetGroupExpensesAsync(Guid groupId)
    {
        Group group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return new NotFoundObjectResult(new { Message = "Grupo no encontrado" });
        }

        var expenses = await _unitOfWork.GroupRepository.GetExpensesByGroupIdAsync(groupId);
        return new OkObjectResult(expenses);
    }

    public async Task<IActionResult> GetGroupPaymentsAsync(Guid groupId)
    {
        Group group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return new NotFoundObjectResult(new { Message = "Grupo no encontrado" });
        }
        var payments = await _unitOfWork.GroupRepository.GetPaymentsByGroupIdAsync(groupId);
        return new OkObjectResult(payments);
    }

    public async Task<IActionResult> UpdateDebtAsync(Guid groupId)
    {
        Group group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return new NotFoundObjectResult(new { Message = "Grupo no encontrado" });
        }

        var expenses = await _unitOfWork.GroupRepository.GetExpensesNumByGroupIdAsync(groupId);
        var payments = await _unitOfWork.GroupRepository.GetPaymentsNumByGroupIdAsync(groupId);

        if (expenses <= 0 || payments < 0)
        {
            return new BadRequestObjectResult(new { Message = "Los valores de gasto y pago deben ser positivos." });
        }
        if (expenses < payments)
        {
            return new BadRequestObjectResult(new { Message = "El pago no puede ser mayor que el gasto." });
        }
        var debt = await _unitOfWork.GroupRepository.GetDebtByGroupIdAsync(groupId);
        if (debt == null)
        {
            debt = new Debt
            {
                GroupId = groupId,
                Amount = expenses - payments,
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.DebtRepository.InsertAsync(debt);
        }
        else
        {
            debt.Amount += expenses - payments;
            _unitOfWork.DebtRepository.Update(debt);
        }

        await _unitOfWork.SaveAsync();

        return new OkObjectResult(new
        {
            Message = "Deuda actualizada exitosamente.",
            DebtId = debt.Id,
            Amount = debt.Amount
        });
    }












}
