using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Identity.Data;
using Splitzy.Database;
using Splitzy.Models;
using System.Net;

namespace Splitzy.Services;

public class UserService
{
    private readonly UnitOfWork _unitOfWork;

    public UserService(UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<User> GetByIdAsync(int id)
    {
        User user = await _unitOfWork.UserRepository.GetByIdAsync(id);
        return user;
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        IEnumerable<User> users = await _unitOfWork.UserRepository.GetAllAsync();
        return users;
    }

    public async Task<User> InsertAsync(User user)
    {
        await _unitOfWork.UserRepository.InsertAsync(user);
        await _unitOfWork.SaveAsync();
        return user;
    }

    public async Task<User> UpdateAsync(UpdateUserDto userData)
    {
        User userEntity = await _unitOfWork.UserRepository.GetByIdAsync(userData.Id) ?? throw new Exception("El usuario especificado no existe");

        if(userData.Email != null)
        {
            userEntity.Email = userData.Email;
        }
        if (userData.Name != null)
        {
            userEntity.Name = userData.Name;
        }
        if (userData.Address != null){
            userEntity.Address = userData.Address;
        }
        if (userData.Phone != null)
        {
            userEntity.Phone = userData.Phone;
        }
        if (userData.ImageUrl != null)
        {
            userEntity.ImageUrl = userData.ImageUrl;
        }
        if (userData.Password != null)
        {
            userEntity.Password = userData.Password;
        }


        _unitOfWork.UserRepository.Update(userEntity);

        await _unitOfWork.UserRepository.SaveAsync();

        return userEntity;
    }

    public async Task<User> UpdateRole(HandleRole handleRole)
    {
        User userEntity = await _unitOfWork.UserRepository.GetByIdAsync(handleRole.UserId) ?? throw new Exception("El usuario no existe");
        userEntity.Role = handleRole.Role;

        _unitOfWork.UserRepository.Update(userEntity);

        await _unitOfWork.UserRepository.SaveAsync();

        return userEntity;
    }


    public async Task<bool> DeleteAsyncUserById(int id)
    {
        User user = await _unitOfWork.UserRepository.GetByIdAsync(id);
        _unitOfWork.UserRepository.Delete(user);

        return await _unitOfWork.SaveAsync();
    }

    public Task<User> GetByMailAsync(string mail)
    {
        return _unitOfWork.UserRepository.GetByMailAsync(mail);
    }

    public async Task<List<object>> GetUserRecentActivityAsync(int userId)
    {
        var userGroups = await _unitOfWork.GroupRepository.GetGroupsByUserIdAsync(userId);
        var groupIds = userGroups.Select(g => g.Id).ToList();

        var allExpenses = new List<Expense>();
        var allPayments = new List<Payment>();

        foreach (var groupId in groupIds)
        {
            var expenses = await _unitOfWork.GroupRepository.GetExpensesByGroupIdAsync(groupId);
            var payments = await _unitOfWork.GroupRepository.GetPaymentsByGroupIdAsync(groupId);
            allExpenses.AddRange(expenses.Where(e => e.UserId == userId));
            allPayments.AddRange(payments.Where(p => p.PayerId == userId || p.ReceiverId == userId));
        }

        var activities = new List<object>();

        activities.AddRange(allExpenses.Select(e => new
        {
            Type = "expense",
            GroupId = e.GroupId,
            Amount = e.Amount,
            Description = e.Description,
            CreatedAt = e.CreatedAt
        }));

        activities.AddRange(allPayments.Select(p => new
        {
            Type = "payment",
            GroupId = p.GroupId,
            Amount = p.Amount,
            Description = p.Description,
            CreatedAt = p.CreatedAt,
            PayerId = p.PayerId,
            ReceiverId = p.ReceiverId
        }));

        return activities.OrderByDescending(a => ((DateTime)a.GetType().GetProperty("CreatedAt")!.GetValue(a))).ToList();
    }

}
