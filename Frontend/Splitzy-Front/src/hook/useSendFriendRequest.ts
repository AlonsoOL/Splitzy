import { useWebsocket } from "@/context/WebSocketContext";

export const useSendFriendRequest = () => {
    const socket = useWebsocket()

    const sendRequest = (senderId: number, recivedId: number) => {
        if (socket?.readyState === WebSocket.OPEN){
            const payload = {
                type: "friend_request",
                data: { senderId, recivedId }
            }
            socket.send(JSON.stringify(payload))
        }
        else{
            console.warn("WebSocket no está abierto")
        }
    }

    return sendRequest
}