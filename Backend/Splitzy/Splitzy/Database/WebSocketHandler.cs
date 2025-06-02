using Splitzy.Services;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace Splitzy.Database
{
    public static class WebSocketHandler
    {
        private static readonly Dictionary<int, WebSocket> _userSockets = new();

        public static async Task Handle(HttpContext context, WebSocket socket)
        {
            var buffer = new byte[1024 * 4];
            var scopeFactory = context.RequestServices.GetRequiredService<IServiceScopeFactory>();

            try
            {
                while (socket.State == WebSocketState.Open)
                {
                    var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        string msg = Encoding.UTF8.GetString(buffer, 0, result.Count);
                        Console.WriteLine($"Mensaje recibido: {msg}");

                        try
                        {
                            var payload = JsonSerializer.Deserialize<SocketPayload>(msg);

                            if (payload == null || payload.Type is null || payload.Data == null)
                            {
                                Console.WriteLine("Formato de mensaje no válido");
                                continue;
                                
                            }

                            if(payload.Type == "init")
                            {
                                int userId = payload.Data.SenderId;

                                if (_userSockets.ContainsKey(userId))
                                {
                                    _userSockets[userId] = socket;
                                }
                                else
                                {
                                    _userSockets.Add(userId, socket);
                                }
                                Console.WriteLine($"socket registrado para userID: {userId}");
                            }

                            if (payload.Type == "friend_request")
                            {
                                Console.WriteLine($"Esta es la solicitud de amistad recibida: {payload.Data}");
                                using var scope = scopeFactory.CreateScope();
                                var service = scope.ServiceProvider.GetRequiredService<FriendService>();
                                await service.SendFriendServicesAsync(payload.Data.SenderId, payload.Data.RecivedId);
                            }
                            else
                            {
                                Console.WriteLine("Tipo de mensaje no soportado" + payload.Type);
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error al procesar el mensaje: {ex.Message}");
                        }
                    }
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "conexión cerrada", CancellationToken.None);
                        var userEntry = _userSockets.FirstOrDefault(x => x.Value == socket);
                        if (userEntry.Key != 0)
                        {
                            _userSockets.Remove(userEntry.Key);
                        }
                        break;
                    }
                }
            }
            finally
            {
                var userEntry = _userSockets.FirstOrDefault(x => x.Value == socket);
                if (userEntry.Key != 0)
                {
                    _userSockets.Remove(userEntry.Key);
                }

                if (socket.State == WebSocketState.Open)
                {
                    await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "conexión cerrada", CancellationToken.None);
                }
            }
            
        }

        public static async Task SendToUserAsync(int userId, object message)
        {
            if (_userSockets.TryGetValue(userId, out var socket) && socket.State == WebSocketState.Open)
            {
                var json = JsonSerializer.Serialize(message);
                var buffer = Encoding.UTF8.GetBytes(json);
                await socket.SendAsync(new ArraySegment<byte>(buffer),WebSocketMessageType.Text, true, CancellationToken.None);
            }
        }

        public class SocketPayload
        {
            public string Type { get; set; }
            public FriendRequestData Data { get; set; }
        }

        public class FriendRequestData
        {
            public int SenderId { get; set; }
            public int RecivedId { get; set; }
        }
    }
}
