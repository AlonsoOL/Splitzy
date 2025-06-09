using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Splitzy.Database;

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








}
