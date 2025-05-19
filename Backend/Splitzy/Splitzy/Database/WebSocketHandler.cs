using System.Net.WebSockets;
using System.Text;

namespace Splitzy.Database
{
    public static class WebSocketHandler
    {
        private static readonly List<WebSocket> _sockets = new();

        public static async Task Handle(HttpContext context, WebSocket socket)
        {
            _sockets.Add(socket);

            var buffer = new byte[1024 * 4];
            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Text)
                {
                    string msg = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    Console.WriteLine("Mensaje recibido:", msg);

                    foreach (var s in _sockets)
                    {
                        if (s.State == WebSocketState.Open)
                        {
                            await s.SendAsync(
                                Encoding.UTF8.GetBytes(msg),
                                WebSocketMessageType.Text,
                                true,
                                CancellationToken.None);
                        }
                    }
                }
                else if(result.MessageType == WebSocketMessageType.Close)
                {
                    await socket.CloseAsync(WebSocketCloseStatus.NormalClosure, "conexión cerrada", CancellationToken.None);
                    _sockets.Remove(socket);
                }
            }
        }
    }
}
