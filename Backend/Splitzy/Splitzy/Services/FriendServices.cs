using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Splitzy.Database;
using Splitzy.Models;

namespace Splitzy.Services;

public class FriendService
{
    private MyDbContext _dbContext;

    public FriendService(MyDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task SendFriendServicesAsync(int senderId, int recivedId)
    {
        if (senderId == recivedId)
        {
            throw new Exception("No puedes enviarte una solicitud a ti mismo");
        }

        var senderExists = await _dbContext.Users.AnyAsync(u => u.Id == senderId);
        var recivedExists = await _dbContext.Users.AnyAsync(u => u.Id == recivedId);

        if (!senderExists || !recivedExists)
        {
            throw new Exception("Uno o ambos usuarios no existen");
        }

        var alreadyExists = await _dbContext.FriendRequests
            .AnyAsync(fr =>
                fr.SenderId == senderId && fr.RecivedId == recivedId && !fr.IsHandled);

        if (alreadyExists)
        {
            throw new Exception("Ya has enviado una solicitud a este usuario");
        }

        var request = new FriendRequest
        {
            SenderId = senderId,
            RecivedId = recivedId,
            SentAt = DateTime.Now,
            IsAccepted = false,
            IsHandled = false
        };

        _dbContext.FriendRequests.Add(request);
        await _dbContext.SaveChangesAsync();
    }

    public async Task AcceptFriendRequestAsync(int senderId, int recivedId)
    {
        var request = await _dbContext.FriendRequests
            .Include(fr => fr.Sender)
            .FirstOrDefaultAsync(fr => fr.Sender.Id == senderId && fr.RecivedId == recivedId && !fr.IsHandled);
        Console.WriteLine("este es el request:", request);

        if (request == null || request.IsHandled) 
        {
            throw new Exception("Solicitud no encontrada o ya gestionada");
        }

        request.IsAccepted = true;
        request.IsHandled = true;

        _dbContext.Add(new UserFriend { UserId = request.SenderId, FriendId = request.RecivedId });
        _dbContext.Add(new UserFriend { UserId = request.RecivedId, FriendId = request.SenderId });

        await _dbContext.SaveChangesAsync();
    }

    public async Task RejectFriendRequestAsync(int requestId, int senderId)
    {
        var request = await _dbContext.FriendRequests
            .FirstOrDefaultAsync(fr => fr.Sender.Id == senderId && fr.RecivedId == requestId && !fr.IsHandled);

        if (request == null || request.IsHandled) 
        {
            throw new Exception("Solicitud no encontrada o ya gestionada");
        }

        request.IsAccepted = false;
        request.IsHandled = true;

        await _dbContext.SaveChangesAsync();
    }

    public async Task<List<FriendRequestDto>> GetPendingRequestsAsync(int userId)
    {
        var request = await _dbContext.FriendRequests
            .Where(fr => fr.RecivedId == userId && !fr.IsHandled)
            .Select(fr => new FriendRequestDto
            {
                id = fr.Id,
                recivedId = fr.RecivedId,
                senderId = fr.SenderId,
                senderName = fr.Sender.Name,
                senderImageUrl = fr.Sender.ImageUrl
            })
            .ToListAsync();

        return request;
    }

    public async Task RemoveFriendAsync(int userId, int friendId)
    {
        var friendship1 = await _dbContext.UserFriends
            .FirstOrDefaultAsync(uf => uf.UserId == userId && uf.FriendId == friendId);

        var friendship2 = await _dbContext.UserFriends
            .FirstOrDefaultAsync(uf => uf.UserId == friendId && uf.FriendId == userId);

        if (friendship1 != null) _dbContext.UserFriends.Remove(friendship1);
        if (friendship2 != null) _dbContext.UserFriends.Remove(friendship2);

        await _dbContext.SaveChangesAsync();
    }
}

