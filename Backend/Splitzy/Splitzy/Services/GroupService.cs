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

   


}
