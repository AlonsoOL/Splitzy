import { useWebsocket } from "@/context/WebSocketContext";

export const useSendFriendRequest = () => {
    const socket = useWebsocket()

    const sendRequest = (senderId: number, recivedId: number) => {
        if (socket?.readyState === WebSocket.OPEN){
            const payload = {
                type: "friend_request",
                data: { senderId, recivedId }
            }
            console.log("así envia los datos al back", payload)
            socket.send(JSON.stringify(payload))
        }
        else{
             console.log("así envia los datos al back", senderId, recivedId)
            console.warn("WebSocket no está abierto")
        }
    }

    return sendRequest
}