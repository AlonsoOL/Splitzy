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
        if (user == null)
        {
            throw new Exception("Usuario no encontrado");
        }

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
        if (group == null) return false;

        _unitOfWork.GroupRepository.Delete(group);
        return await _unitOfWork.SaveAsync();
    }

    public async Task<Group> UpdateGroupAsync(Group group)
    {
        Group groupEntity = await _unitOfWork.GroupRepository.GetGroupByIdAsync(group.Id)
            ?? throw new Exception("El grupo especificado no existe");

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
       
        bool alreadyMember = await _unitOfWork.GroupRepository.IsUserMemberOfGroupAsync(groupId, userId);
        if (alreadyMember)
        {
            return new BadRequestObjectResult(new { Message = "El usuario ya es miembro del grupo." });
        }

        var group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);
        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);

        if (group == null || user == null)
        {
            return new NotFoundObjectResult(new { Message = "Grupo o usuario no encontrado." });
        }

        _unitOfWork.GroupRepository.Attach(group);
        _unitOfWork.UserRepository.Attach(user);

        group.Users.Add(user);

        await _unitOfWork.SaveAsync();

        return new OkObjectResult(new
        {
            Message = "Miembro añadido al grupo exitosamente.",
            GroupId = group.Id,
            UserId = user.Id
        });
    }



    public async Task<IActionResult> RemoveMemberFromGroupAsync(Guid groupId, int userId)
    {
        Group group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);

        if (group == null)
        {
            return new NotFoundObjectResult(new { Message = "Grupo no encontrado" });
        }

        var user = group.Users.FirstOrDefault(u => u.Id == userId);
        if (user == null)
        {
            return new NotFoundObjectResult(new { Message = "El usuario no es miembro del grupo" });
        }

        group.Users.Remove(user);
        _unitOfWork.GroupRepository.Update(group);
        await _unitOfWork.SaveAsync();

        return new OkObjectResult(new { Message = "Miembro eliminado del grupo exitosamente." });
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


    public async Task<IActionResult> AddExpenseToGroupAsync(Guid groupId, int userId, decimal amount, string name, string description = null)
    {
        var group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return new NotFoundObjectResult(new { Message = "Grupo no encontrado" });
        }

        if (!group.Users.Any(u => u.Id == userId))
        {
            return new BadRequestObjectResult(new { Message = "El usuario no pertenece al grupo" });
        }

        var expense = new Expense
        {
            Name = name,
            UserId = userId,
            Amount = amount,
            Description = description ?? "Gasto dividido igualmente",
            CreatedAt = DateTime.UtcNow,
            GroupId = groupId
        };

        await _unitOfWork.ExpenseRepository.InsertAsync(expense);
        await _unitOfWork.SaveAsync();

        
        await UpdateGroupDebtsAsync(groupId);

        return new OkObjectResult(new
        {
            Message = "Gasto añadido al grupo exitosamente.",
            ExpenseId = expense.Id,
            Amount = expense.Amount
        });
    }

    public async Task<IActionResult> AddPaymentToGroupAsync(Guid groupId, int payerId, int receiverId, decimal amount, string description = null)
    {
        var group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return new NotFoundObjectResult(new { Message = "Grupo no encontrado" });
        }

        if (!group.Users.Any(u => u.Id == payerId) || !group.Users.Any(u => u.Id == receiverId))
        {
            return new BadRequestObjectResult(new { Message = "Uno o ambos usuarios no pertenecen al grupo" });
        }

        var payment = new Payment
        {
            PayerId = payerId,
            ReceiverId = receiverId,
            Amount = amount,
            Description = description ?? "Pago entre miembros",
            CreatedAt = DateTime.UtcNow,
            GroupId = groupId
        };

        await _unitOfWork.PaymentRepository.InsertAsync(payment);
        await _unitOfWork.SaveAsync();

       
        await UpdateGroupDebtsAsync(groupId);

        return new OkObjectResult(new
        {
            Message = "Pago registrado exitosamente.",
            PaymentId = payment.Id,
            Amount = payment.Amount
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

    public async Task<IActionResult> GetGroupBalancesAsync(Guid groupId)
    {
        Group group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return new NotFoundObjectResult(new { Message = "Grupo no encontrado" });
        }

        var balances = await CalculateGroupBalancesAsync(groupId);
        return new OkObjectResult(balances);
    }

    private async Task<Dictionary<int, decimal>> CalculateGroupBalancesAsync(Guid groupId)
    {
        var expenses = await _unitOfWork.GroupRepository.GetExpensesByGroupIdAsync(groupId);
        var payments = await _unitOfWork.GroupRepository.GetPaymentsByGroupIdAsync(groupId);
        var group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);

        var balances = new Dictionary<int, decimal>();

        foreach (var user in group.Users)
        {
            balances[user.Id] = 0;
        }

        decimal totalExpenses = expenses.Sum(e => e.Amount);
        decimal sharePerPerson = totalExpenses / group.Users.Count;

        foreach (var user in group.Users)
        {
            balances[user.Id] -= sharePerPerson;
        }

  
        foreach (var expense in expenses)
        {
            if (balances.ContainsKey(expense.UserId))
            {
                balances[expense.UserId] += expense.Amount;
            }
        }

 
        foreach (var payment in payments)
        {
            if (balances.ContainsKey(payment.PayerId))
            {
                balances[payment.PayerId] -= payment.Amount;
            }
            if (balances.ContainsKey(payment.ReceiverId))
            {
                balances[payment.ReceiverId] += payment.Amount;
            }
        }

        return balances;
    }

    private async Task UpdateGroupDebtsAsync(Guid groupId)
    {
        var group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);
        var expenses = await _unitOfWork.GroupRepository.GetExpensesByGroupIdAsync(groupId);
        var payments = await _unitOfWork.GroupRepository.GetPaymentsByGroupIdAsync(groupId);

        var balances = group.Users.ToDictionary(u => u.Id, _ => 0m);

        foreach (var expense in expenses)
        {
            var share = expense.Amount / group.Users.Count;
            foreach (var user in group.Users)
            {
                balances[user.Id] -= share;
            }
            balances[expense.UserId] += expense.Amount;
        }

        foreach (var payment in payments)
        {
            balances[payment.PayerId] -= payment.Amount;
            balances[payment.ReceiverId] += payment.Amount;
        }

        await _unitOfWork.DebtRepository.DeleteByGroupIdAsync(groupId);

        var debtors = balances.Where(x => x.Value < 0).ToList();
        var creditors = balances.Where(x => x.Value > 0).ToList();

        foreach (var debtor in debtors)
        {
            decimal debtAmount = Math.Abs(debtor.Value);

            foreach (var creditor in creditors)
            {
                if (debtAmount <= 0 || creditor.Value <= 0) continue;

                decimal transfer = Math.Min(debtAmount, creditor.Value);

                var debt = new Debt
                {
                    GroupId = groupId,
                    DebtorId = debtor.Key,
                    CreditorId = creditor.Key,
                    Amount = transfer,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.DebtRepository.InsertAsync(debt);

                debtAmount -= transfer;
                balances[creditor.Key] -= transfer;
            }
        }

        await _unitOfWork.SaveAsync();
    }

    public async Task<IActionResult> GetGroupDebtsAsync(Guid groupId)
    {
        Group group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return new NotFoundObjectResult(new { Message = "Grupo no encontrado" });
        }

        var debts = await _unitOfWork.DebtRepository.GetDebtsByGroupIdAsync(groupId);
        return new OkObjectResult(debts);
    }

    public async Task<IActionResult> GetGroupSummaryAsync(Guid groupId)
    {
        Group group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            return new NotFoundObjectResult(new { Message = "Grupo no encontrado" });
        }

        var expenses = await _unitOfWork.GroupRepository.GetExpensesByGroupIdAsync(groupId);
        var payments = await _unitOfWork.GroupRepository.GetPaymentsByGroupIdAsync(groupId);
        var balances = await CalculateGroupBalancesAsync(groupId);
        var debts = await _unitOfWork.DebtRepository.GetDebtsByGroupIdAsync(groupId);

        var summary = new
        {
            Group = group,
            TotalExpenses = expenses.Sum(e => e.Amount),
            TotalPayments = payments.Sum(p => p.Amount),
            MemberCount = group.Users.Count,
            Balances = balances,
            ActiveDebts = debts.Count,
            LastActivity = expenses.Concat(payments.Cast<object>())
                .Max(activity => activity is Expense e ? e.CreatedAt : ((Payment)activity).CreatedAt)
        };

        return new OkObjectResult(summary);
    }

    public async Task<IActionResult> DeleteExpenseAsync(Guid expenseId)
    {
        var expense = await _unitOfWork.ExpenseRepository.GetByIdAsync(expenseId);
        if (expense == null)
        {
            return new NotFoundObjectResult(new { Message = "Gasto no encontrado" });
        }

        _unitOfWork.ExpenseRepository.Delete(expense);
        await _unitOfWork.SaveAsync();


        await UpdateGroupDebtsAsync(expense.GroupId);

        return new OkObjectResult(new { Message = "Gasto eliminado exitosamente." });
    }

    public async Task<IActionResult> DeletePaymentAsync(Guid paymentId)
    {
        var payment = await _unitOfWork.PaymentRepository.GetByIdAsync(paymentId);
        if (payment == null)
        {
            return new NotFoundObjectResult(new { Message = "Pago no encontrado" });
        }

        _unitOfWork.PaymentRepository.Delete(payment);
        await _unitOfWork.SaveAsync();

 
        await UpdateGroupDebtsAsync(payment.GroupId);

        return new OkObjectResult(new { Message = "Pago eliminado exitosamente." });
    }
}