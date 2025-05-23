﻿using Microsoft.AspNetCore.Cors.Infrastructure;
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

    public async Task<User> GetByIdAsync(long id)
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

    public async Task<User> UpdateAsync(User user)
    {
        User userEntity = await _unitOfWork.UserRepository.GetByIdAsync(user.Id) ?? throw new Exception("El usuario especificado no existe");

        userEntity.Email = user.Email;
        userEntity.Name = user.Name;
        

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
}
