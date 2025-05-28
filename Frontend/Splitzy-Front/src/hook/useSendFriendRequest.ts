import { useWebsocket } from "@/context/WebSocketContext";

export const useSendFriendRequest = () => {
    const socket = useWebsocket()

    const sendRequest = (SenderId: number, RecivedId: number) => {
        if (socket?.readyState === WebSocket.OPEN){
            const payload = {
                Type: "friend_request",
                Data: { SenderId, RecivedId }
            }
            socket.send(JSON.stringify(payload))
        }
        else{
            console.warn("WebSocket no está abierto")
        }
    }

    return sendRequest
}