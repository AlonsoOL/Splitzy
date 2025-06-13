using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Splitzy.Database;
using Splitzy.Models;
using SQLitePCL;
using System.Diagnostics;

namespace Splitzy.Services;

public class GroupService
{
    private UnitOfWork _unitOfWork;
    private MyDbContext _dbContext;

    public GroupService(UnitOfWork unitOfWork, MyDbContext dbContext)
    {
        _unitOfWork = unitOfWork;
        _dbContext = dbContext;
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

    public async Task<Group> CreateGroupAsync(int userId, string name, string description, IFormFile? imageUrl)
    {
        User user = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new Exception("Usuario no encontrado");
        }

        string imagePath;

        if (imageUrl == null)
        {
            imagePath = $"/Images/defaultgroup.jpg";
        }
        else
        {
            var extension = Path.GetExtension(imageUrl.FileName);
            var fileName = $"{name}_groupicture{extension}";
            var filePath = Path.Combine("wwwroot/Images", fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await imageUrl.CopyToAsync(stream);
            }
            imagePath = $"/Images/{fileName}";
        }

        var group = new Group
        {
            Id = Guid.NewGuid(),
            Name = name,
            Description = description,
            ImageUrl = imagePath,
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

    private async Task<List<object>> CalculateGroupBalancesAsync(Guid groupId)
    {
        var expenses = await _unitOfWork.GroupRepository.GetExpensesByGroupIdAsync(groupId);
        var payments = await _unitOfWork.GroupRepository.GetPaymentsByGroupIdAsync(groupId);
        var group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);

        if (group == null || group.Users == null || !group.Users.Any())
        {
            return new List<object>();
        }

        var balances = new Dictionary<int, decimal>();
        var userNames = new Dictionary<int, string>();

        foreach (var user in group.Users)
        {
            balances[user.Id] = 0;
            userNames[user.Id] = user.Name ?? $"User {user.Id}";
        }
        decimal totalExpenses = expenses.Sum(e => e.Amount);
        decimal sharePerPerson = group.Users.Count > 0 ? totalExpenses / group.Users.Count : 0;

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
                balances[payment.PayerId] += payment.Amount; 
            }
            if (balances.ContainsKey(payment.ReceiverId))
            {
                balances[payment.ReceiverId] -= payment.Amount; 
            }
        }

        var groupBalances = balances.Select(kvp => new
        {
            UserId = kvp.Key,
            UserName = userNames.ContainsKey(kvp.Key) ? userNames[kvp.Key] : $"User {kvp.Key}",
            Balance = kvp.Value
        }).ToList<object>();

        return groupBalances;
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

        var tempBalances = new Dictionary<int, decimal>(balances);

        foreach (var debtor in debtors)
        {
            decimal debtAmount = Math.Abs(debtor.Value);

            foreach (var creditor in creditors)
            {
                if (debtAmount <= 0 || tempBalances[creditor.Key] <= 0) continue;

                decimal transfer = Math.Min(debtAmount, tempBalances[creditor.Key]);

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
                tempBalances[creditor.Key] -= transfer;
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

    public async Task SendGroupInvitationAsync(Guid groupId, int senderId, int invitedUserId)
    {
        if (senderId == invitedUserId)
        {
            throw new Exception("No puedes invitarte a ti mismo");
        }

        var group = await _unitOfWork.GroupRepository.GetGroupByIdAsync(groupId);
        if (group == null)
        {
            throw new Exception("Grupo no encontrado");
        }

        var sender = await _unitOfWork.UserRepository.GetByIdAsync(senderId);
        var invitedUser = await _unitOfWork.UserRepository.GetByIdAsync(invitedUserId);

        if (sender == null || invitedUser == null)
        {
            throw new Exception("Uno o ambos usuarios no existen");
        }

        bool isSenderMember = await _unitOfWork.GroupRepository.IsUserMemberOfGroupAsync(groupId, senderId);
        if (!isSenderMember)
        {
            throw new Exception("Solo los miembros del grupo pueden enviar invitaciones");
        }

        bool isAlreadyMember = await _unitOfWork.GroupRepository.IsUserMemberOfGroupAsync(groupId, invitedUserId);
        if (isAlreadyMember)
        {
            throw new Exception("El usuario ya es miembro del grupo");
        }

        var existingInvitation = await _dbContext.GroupInvitations
            .AnyAsync(gi => gi.GroupId == groupId && gi.InvitedUserId == invitedUserId && !gi.IsHandled);

        if (existingInvitation)
        {
            throw new Exception("Ya existe una invitación pendiente para este usuario");
        }

        var invitation = new GroupInvitation
        {
            GroupId = groupId,
            SenderId = senderId,
            InvitedUserId = invitedUserId,
            SentAt = DateTime.UtcNow,
            IsAccepted = false,
            IsHandled = false
        };

        _dbContext.GroupInvitations.Add(invitation);
        await _dbContext.SaveChangesAsync();

        await WebSocketHandler.SendToUserAsync(invitedUserId, new
        {
            Type = "group_invitation",
            Data = new
            {
                Id = invitation.Id,
                Group = new
                {
                    Id = group.Id,
                    Name = group.Name,
                    Description = group.Description,
                    ImageUrl = group.ImageUrl
                },
                Sender = new
                {
                    Id = sender.Id,
                    Name = sender.Name,
                    Email = sender.Email,
                    ImageUrl = sender.ImageUrl
                },
                SentAt = invitation.SentAt
            }
        });
    }

    public async Task AcceptGroupInvitationAsync(int invitationId, int userId)
    {
        var invitation = await _dbContext.GroupInvitations
            .Include(gi => gi.Group)
            .Include(gi => gi.Sender)
            .FirstOrDefaultAsync(gi => gi.Id == invitationId && gi.InvitedUserId == userId && !gi.IsHandled);

        if (invitation == null)
        {
            throw new Exception("Invitación no encontrada o ya gestionada");
        }

        bool isAlreadyMember = await _unitOfWork.GroupRepository.IsUserMemberOfGroupAsync(invitation.GroupId, userId);
        if (isAlreadyMember)
        {
            throw new Exception("Ya eres miembro de este grupo");
        }

        invitation.IsAccepted = true;
        invitation.IsHandled = true;
        invitation.HandledAt = DateTime.UtcNow;

        var group = invitation.Group;
        var user = await _unitOfWork.UserRepository.GetByIdAsync(userId);

        _unitOfWork.UserRepository.Attach(user);

        group.Users.Add(user);

        await _dbContext.SaveChangesAsync();

        var acceptedUser = user;
        await WebSocketHandler.SendToUserAsync(invitation.SenderId, new
        {
            Type = "group_invitation_accepted",
            Data = new
            {
                GroupId = invitation.GroupId,
                GroupName = group.Name,
                AcceptedUser = new
                {
                    Id = acceptedUser.Id,
                    Name = acceptedUser.Name,
                    Email = acceptedUser.Email,
                    ImageUrl = acceptedUser.ImageUrl
                }
            }
        });
    }

    public async Task RejectGroupInvitationAsync(int invitationId, int userId)
    {
        var invitation = await _dbContext.GroupInvitations
            .Include(gi => gi.Group)
            .Include(gi => gi.Sender)
            .FirstOrDefaultAsync(gi => gi.Id == invitationId && gi.InvitedUserId == userId && !gi.IsHandled);

        if (invitation == null)
        {
            throw new Exception("Invitación no encontrada o ya gestionada");
        }

        invitation.IsAccepted = false;
        invitation.IsHandled = true;
        invitation.HandledAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        var rejectedUser = await _unitOfWork.UserRepository.GetByIdAsync(userId);
        await WebSocketHandler.SendToUserAsync(invitation.SenderId, new
        {
            Type = "group_invitation_rejected",
            Data = new
            {
                GroupId = invitation.GroupId,
                GroupName = invitation.Group.Name,
                RejectedUser = new
                {
                    Id = rejectedUser.Id,
                    Name = rejectedUser.Name,
                    Email = rejectedUser.Email
                }
            }
        });
    }

    public async Task<List<GroupInvitationDto>> GetPendingInvitationsAsync(int userId)
    {
        var invitations = await _dbContext.GroupInvitations
            .Include(gi => gi.Group)
            .Include(gi => gi.Sender)
            .Where(gi => gi.InvitedUserId == userId && !gi.IsHandled)
            .Select(gi => new GroupInvitationDto
            {
                Id = gi.Id,
                GroupId = gi.GroupId,
                GroupName = gi.Group.Name,
                GroupDescription = gi.Group.Description,
                GroupImageUrl = gi.Group.ImageUrl,
                SenderId = gi.SenderId,
                SenderName = gi.Sender.Name,
                SenderImageUrl = gi.Sender.ImageUrl,
                InvitedUserId = gi.InvitedUserId,
                SentAt = gi.SentAt
            })
            .ToListAsync();

        return invitations;
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