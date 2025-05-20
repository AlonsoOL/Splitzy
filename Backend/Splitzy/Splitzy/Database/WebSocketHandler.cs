using Splitzy.Services;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace Splitzy.Database
{
    public static class WebSocketHandler
    {
        private static readonly List<WebSocket> _sockets = new();

        public static async Task Handle(HttpContext context, WebSocket socket)
        {
            _sockets.Add(socket);

            var buffer = new byte[1024 * 4];
            var scopeFactory = context.RequestServices.GetRequiredService<IServiceScopeFactory>();

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

                        if(payload?.Type == "friend_request")
                        {
                            using var scope = scopeFactory.CreateScope();
                            var service = scope.ServiceProvider.GetRequiredService<FriendService>();
                            await service.SendFriendServicesAsync(payload.Data.SenderId, payload.Data.RecivedId);

                            Console.WriteLine("Solicitud procesada correctamente");
                        }

                        foreach (var s in _sockets)
                        {
                            if (s.State == WebSocketState.Open)
                            {
                                await s.SendAsync(
                                    Encoding.UTF8.GetBytes(msg),
                                    WebSocketMessageType.Text,
                                    true,
                                    CancellationToken.None
                                   );
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error al procesar el mensaje: {ex.Message}");
                    }
                }
                else if(result.MessageType == WebSocketMessageType.Close)
                {
                    await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "conexión cerrada", CancellationToken.None);
                    _sockets.Remove(socket);
                }
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
