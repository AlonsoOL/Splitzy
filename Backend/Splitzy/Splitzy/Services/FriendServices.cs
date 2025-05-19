using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Splitzy.Database;

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
        };

        _dbContext.FriendRequests.Add(request);
        await _dbContext.SaveChangesAsync();
    }

    public async Task AcceptFriendRequestAsync(int requestId, int userId)
    {
        var request = await _dbContext.FriendRequests
            .Include(fr => fr.Sender)
            .FirstOrDefaultAsync(fr => fr.Id == requestId && fr.RecivedId == userId);

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

    public async Task RejectFriendRequestAsync(int requestId, int userId)
    {
        var request = await _dbContext.FriendRequests
            .FirstOrDefaultAsync(fr => fr.Id == requestId && fr.RecivedId == userId);

        if (request == null || request.IsHandled) 
        {
            throw new Exception("Solicitud no encontrada o ya gestionada");
        }

        request.IsAccepted = false;
        request.IsHandled = true;

        await _dbContext.SaveChangesAsync();
    }

    public async Task<List<FriendRequest>> GetPendingRequestsAsync(int userId)
    {
        return await _dbContext.FriendRequests
            .Where(fr => fr.RecivedId == userId && !fr.IsHandled)
            .Include(fr => fr.Sender)
            .ToListAsync();
    }
}

